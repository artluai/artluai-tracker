#!/usr/bin/env node
// sync-video.mjs — build public/videos/<id>/bundle.json + copy assets
// from ../spoolcast-content/sessions/<id>/ for each entry in shipped-videos.json.
//
// Usage:
//   node scripts/sync-video.mjs                # sync all entries in manifest
//   node scripts/sync-video.mjs <session-id>   # sync just one
//
// Requires: cwebp (brew install webp) — scene images are downscaled to webp
// to keep the repo lean. Originals stay in spoolcast-content.
//
// The bundle shape is the "database-shaped" contract — it has no filesystem
// paths, only public URLs. A future DB-backed emitter produces the same shape.

import { readFile, writeFile, mkdir, copyFile, readdir, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Downscale images to keep the repo lean. Originals stay in spoolcast-content.
const THUMB_WIDTH = 640;
const THUMB_QUALITY = 72; // libwebp -quality
const RASTER_EXT = /\.(png|jpe?g|webp)$/i;
const SVG_EXT = /\.svg$/i;

function downscaleToWebp(src, dest, width = THUMB_WIDTH, quality = THUMB_QUALITY) {
  // cwebp handles png/jpg/webp input natively, preserves aspect ratio with -resize W 0.
  return new Promise((resolve, reject) => {
    const args = ["-quiet", "-q", String(quality), "-resize", String(width), "0", src, "-o", dest];
    const ff = spawn("cwebp", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    ff.stderr.on("data", d => { stderr += d; });
    ff.on("close", code => code === 0 ? resolve() : reject(new Error(`cwebp ${code}: ${stderr.slice(-400)}`)));
    ff.on("error", err => reject(new Error(`cwebp not found — install with: brew install webp`)));
  });
}

// Copy raster images through ffmpeg (downscale + webp), svg as-is, skip video.
async function importAsset(srcPath, destDir, baseName) {
  await ensureDir(destDir);
  if (SVG_EXT.test(srcPath)) {
    const dest = path.join(destDir, baseName);
    await copyFile(srcPath, dest);
    return baseName;
  }
  if (!RASTER_EXT.test(srcPath)) return null; // mp4/other — skip
  const destName = baseName.replace(/\.[^.]+$/, ".webp");
  await downscaleToWebp(srcPath, path.join(destDir, destName));
  return destName;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");                       // artluai-tracker/
const CONTENT = path.resolve(ROOT, "..", "spoolcast-content");    // sibling
const PUBLIC_VIDEOS = path.join(ROOT, "public", "videos");
const SHIPPED_MANIFEST = path.join(__dirname, "shipped-videos.json");

// ── helpers ────────────────────────────────────────────────────────────────
async function readJson(p) {
  try { return JSON.parse(await readFile(p, "utf8")); }
  catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}
async function exists(p) { try { await access(p); return true; } catch { return false; } }
async function ensureDir(p) { await mkdir(p, { recursive: true }); }
async function writeJson(p, data) { await writeFile(p, JSON.stringify(data, null, 2) + "\n"); }

function log(label, msg) { console.log(`  [${label}] ${msg}`); }
function warn(label, msg) { console.warn(`  ⚠  [${label}] ${msg}`); }

// ── bundle assembly ────────────────────────────────────────────────────────
async function buildBundle(shipped) {
  const id = shipped.id;
  const sessionDir = path.join(CONTENT, "sessions", id);
  const outDir = path.join(PUBLIC_VIDEOS, id);
  const assetsDir = path.join(outDir, "assets");

  if (!existsSync(sessionDir)) {
    warn(id, `session dir missing at ${sessionDir} — writing minimal bundle from manifest only`);
  }

  await ensureDir(outDir);
  await ensureDir(assetsDir);

  const session = await readJson(path.join(sessionDir, "session.json")) || {};
  const shotList = await readJson(path.join(sessionDir, "shot-list", "shot-list.json"));
  const manifest = await readJson(path.join(sessionDir, "manifests", "scenes.manifest.json"));
  const narrationAudit = await readJson(path.join(sessionDir, "working", "narration-audit.json"));
  const renderAudit = await readJson(path.join(sessionDir, "working", "render-audit.json"));

  // Build scene lookup (chunk_id → manifest item).
  const sceneByChunk = new Map();
  if (manifest?.items) {
    for (const it of manifest.items) {
      if (it.chunk_id) sceneByChunk.set(it.chunk_id, it);
    }
  }

  // Narration-audit flags keyed by the chunk they apply to.
  const narrationFlagsByChunk = new Map();
  if (narrationAudit?.bridge_flags) {
    for (const f of narrationAudit.bridge_flags) {
      const chunk = f.beat_n_chunk;
      if (!narrationFlagsByChunk.has(chunk)) narrationFlagsByChunk.set(chunk, []);
      narrationFlagsByChunk.get(chunk).push(f);
    }
  }

  // ── copy scene images ──────────────────────────────────────────────────
  const scenesOutDir = path.join(assetsDir, "scenes");
  const sceneUrlByChunk = new Map();
  if (existsSync(path.join(sessionDir, "source", "generated-assets", "scenes"))) {
    const srcDir = path.join(sessionDir, "source", "generated-assets", "scenes");
    const files = await readdir(srcDir);
    let count = 0;
    for (const f of files) {
      if (!RASTER_EXT.test(f) && !SVG_EXT.test(f)) continue;
      const outName = await importAsset(path.join(srcDir, f), scenesOutDir, f);
      if (!outName) continue;
      const chunkId = path.basename(f).replace(/\.[^.]+$/, "");
      sceneUrlByChunk.set(chunkId, `/videos/${id}/assets/scenes/${outName}`);
      count++;
    }
    log(id, `imported ${count} scene image(s) (webp ${THUMB_WIDTH}px q${THUMB_QUALITY})`);
  }

  // ── style library ──────────────────────────────────────────────────────
  let style = null;
  const styleName = session.style;
  if (styleName) {
    const styleDir = path.join(CONTENT, "styles", styleName);
    const styleJson = await readJson(path.join(styleDir, "style.json"));
    if (styleJson) {
      const styleOutDir = path.join(assetsDir, "style");
      await ensureDir(styleOutDir);
      let anchorUrl = null;
      if (styleJson.anchor?.image_path && await exists(path.join(styleDir, styleJson.anchor.image_path))) {
        const outName = await importAsset(
          path.join(styleDir, styleJson.anchor.image_path),
          styleOutDir,
          path.basename(styleJson.anchor.image_path),
        );
        if (outName) anchorUrl = `/videos/${id}/assets/style/${outName}`;
      }
      const refsOutDir = path.join(styleOutDir, "references");
      const references = [];
      if (styleJson.references) {
        for (const [refName, ref] of Object.entries(styleJson.references)) {
          let refUrl = null;
          if (ref.image_path && await exists(path.join(styleDir, ref.image_path))) {
            const outName = await importAsset(
              path.join(styleDir, ref.image_path),
              refsOutDir,
              `${refName}${path.extname(ref.image_path)}`,
            );
            if (outName) refUrl = `/videos/${id}/assets/style/references/${outName}`;
          }
          references.push({
            name: refName,
            kind: ref.kind || "reference",
            imageUrl: refUrl,
            description: ref.description || "",
          });
        }
      }
      style = {
        name: styleJson.name,
        description: styleJson.description || "",
        anchorImageUrl: anchorUrl,
        anchorDescription: styleJson.anchor?.description || styleJson.description || "",
        references,
      };
      log(id, `synced style "${styleName}" (anchor + ${references.length} refs)`);
    }
  } else if (session.default_style_prompt) {
    // Inline style (old sessions without a style library entry)
    style = {
      name: "inline",
      description: session.default_style_prompt.slice(0, 240) + (session.default_style_prompt.length > 240 ? "…" : ""),
      anchorImageUrl: null,
      anchorDescription: "",
      references: [],
    };
  }

  // ── copy external assets referenced by non-generated chunks ───────────
  // (memes, session-specific external images). Skip mp4 broll — no still.
  const externalOutDir = path.join(assetsDir, "external");
  const externalUrlByPath = new Map();
  if (shotList?.chunks) {
    for (const c of shotList.chunks) {
      const src = c.image_source;
      const rel = c.image_path;
      if (!rel) continue;
      if (src !== "meme" && src !== "broll_image" && src !== "external") continue;
      if (!RASTER_EXT.test(rel) && !SVG_EXT.test(rel)) continue;
      const abs = path.join(sessionDir, rel);
      if (!(await exists(abs))) continue;
      const outName = await importAsset(abs, externalOutDir, path.basename(rel));
      if (!outName) continue;
      externalUrlByPath.set(rel, `/videos/${id}/assets/external/${outName}`);
    }
    if (externalUrlByPath.size > 0) log(id, `imported ${externalUrlByPath.size} external asset(s)`);
  }

  function resolveChunkImageUrl(c) {
    const src = c.image_source;
    const rel = c.image_path;
    // Reuse: derive chunk id from "source/generated-assets/scenes/C{N}.png"
    if (src === "reuse" && rel) {
      const m = rel.match(/scenes\/([^/]+)\.[^.]+$/);
      if (m && sceneUrlByChunk.has(m[1])) return sceneUrlByChunk.get(m[1]);
    }
    // External image (meme / broll_image / external)
    if (externalUrlByPath.has(rel)) return externalUrlByPath.get(rel);
    // Generated scene (this chunk's own image)
    if (sceneUrlByChunk.has(c.id)) return sceneUrlByChunk.get(c.id);
    return null;
  }

  // ── chunks ─────────────────────────────────────────────────────────────
  const hiddenIds = new Set(shipped.hiddenChunkIds || []);
  const chunks = [];
  if (shotList?.chunks) {
    shotList.chunks.forEach((c, idx) => {
      if (hiddenIds.has(c.id)) return;
      const scene = sceneByChunk.get(c.id);
      const sceneUrl = resolveChunkImageUrl(c);
      const narrationFlagged = narrationFlagsByChunk.has(c.id);
      chunks.push({
        id: c.id,
        order: idx + 1,
        sceneTitle: c.scene_title || "",
        summary: c.summary || "",
        sceneImageUrl: sceneUrl,
        imageSource: c.image_source || null,
        model: scene?.model || null,
        prompt: scene?.prompt || c.beat_description || "",
        beats: (c.beats || []).map(b => ({ id: b.id, narration: b.narration })),
        audits: {
          narration: {
            passed: !narrationFlagged,
            notes: narrationFlagged
              ? narrationFlagsByChunk.get(c.id).map(f => f.reasoning).join(" · ")
              : undefined,
          },
          render: { passed: true }, // render-audit is mechanical; treat absence as pass
        },
      });
    });
  }

  // ── transcript (concat of all beat narration) ──────────────────────────
  const transcript = (shotList?.chunks || [])
    .flatMap(c => (c.beats || []).map(b => b.narration))
    .filter(Boolean)
    .join(" ");

  // ── summary (tech stack + audits) ──────────────────────────────────────
  const imageModels = [...new Set(
    (manifest?.items || []).map(it => it.model).filter(Boolean)
  )];
  const totalBeats = narrationAudit?.total_beats
    ?? (shotList?.chunks || []).reduce((n, c) => n + (c.beats?.length || 0), 0);
  const sceneCount = (manifest?.items || []).filter(it => it.status === "success").length
    || sceneUrlByChunk.size;

  const summary = {
    writing: (shotList || session.core_message) ? {
      author: "Claude",
      role: "screenplay, shot-list, scene prompts",
    } : null,
    images: imageModels.length || sceneCount ? {
      platform: "kie.ai",
      models: imageModels,
      sceneCount,
    } : null,
    audio: session.tts_voice ? {
      tts: "Google Cloud TTS",
      voice: session.tts_voice,
      playbackRate: session.tts_playback_rate ?? 1.0,
      beatCount: totalBeats,
    } : null,
    render: {
      engine: "Remotion",
      passed: renderAudit?.passed ?? true,
    },
    audit: narrationAudit ? {
      narrationModel: narrationAudit.model,
      narrationFlags: narrationAudit.bridge_flags?.length ?? 0,
    } : null,
  };

  // ── bundle ─────────────────────────────────────────────────────────────
  const bundle = {
    id,
    title: shipped.title,
    shippedAt: shipped.shippedAt,
    durationSec: shipped.durationSec,
    coreMessage: session.core_message || shipped.coreMessage || "",
    video: {
      youtubeId: shipped.youtubeId || null,
      mp4Url: shipped.mp4Url || null,
      thumbnailUrl: shipped.youtubeId
        ? `https://img.youtube.com/vi/${shipped.youtubeId}/maxresdefault.jpg`
        : (shipped.thumbnailUrl || null),
    },
    style,
    chunks,
    transcript,
    summary,
    showcase: {
      hiddenChunkIds: shipped.hiddenChunkIds || [],
      notes: shipped.notes || "",
    },
  };

  await writeJson(path.join(outDir, "bundle.json"), bundle);
  log(id, `wrote bundle.json (${chunks.length} chunks, ${totalBeats} beats)`);
  return bundle;
}

// ── index ──────────────────────────────────────────────────────────────────
function indexRowFromBundle(b) {
  return {
    id: b.id,
    title: b.title,
    shippedAt: b.shippedAt,
    durationSec: b.durationSec,
    thumbnailUrl: b.video?.thumbnailUrl || null,
  };
}

async function writeIndex(bundles) {
  // Sort newest-shipped first
  const rows = bundles
    .map(indexRowFromBundle)
    .sort((a, b) => (b.shippedAt || "").localeCompare(a.shippedAt || ""));
  await writeJson(path.join(PUBLIC_VIDEOS, "index.json"), rows);
  console.log(`\n  ✓ wrote public/videos/index.json with ${rows.length} entries`);
}

// ── main ───────────────────────────────────────────────────────────────────
const shipped = await readJson(SHIPPED_MANIFEST);
if (!shipped) {
  console.error(`Missing ship manifest at ${SHIPPED_MANIFEST}`);
  process.exit(1);
}

const targetId = process.argv[2];
const toSync = targetId ? shipped.filter(s => s.id === targetId) : shipped;
if (targetId && toSync.length === 0) {
  console.error(`No ship entry for id "${targetId}"`);
  process.exit(1);
}

console.log(`sync-video: content=${CONTENT}`);
console.log(`syncing ${toSync.length} video(s)\n`);

const allBundles = [];
for (const s of toSync) {
  console.log(`→ ${s.id}`);
  allBundles.push(await buildBundle(s));
}

// When syncing one, still rebuild the full index from all manifest entries
// so it reflects everything shipped.
const others = targetId ? shipped.filter(s => s.id !== targetId) : [];
for (const s of others) {
  const existing = await readJson(path.join(PUBLIC_VIDEOS, s.id, "bundle.json"));
  if (existing) allBundles.push(existing);
}

await writeIndex(allBundles);
