import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../lib/theme";
import Header from "./Header";

function fmtDateFull(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toLowerCase();
}

function fmtDuration(sec) {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function SummaryRow({ label, value, isLast }) {
  const style = isLast ? { ...sumRowStyle, borderBottom: 0 } : sumRowStyle;
  return (
    <div style={style}>
      <div style={sumLabelStyle}>{label}</div>
      <div style={sumValueStyle}>{value}</div>
    </div>
  );
}

const sumRowStyle = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: 16,
  padding: "10px 0",
  borderBottom: "1px solid var(--divider)",
  alignItems: "baseline",
};
const sumLabelStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  color: "var(--dim)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
};
const sumValueStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--text)",
  lineHeight: 1.5,
};

function AuditBadge({ label, passed, notes }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const style = passed ? (isDark ? S.badgePassDark : S.badgePassLight) : S.badgeFail;
  return (
    <span style={style} title={notes || ""}>
      {passed ? "✓" : "!"} {label}
    </span>
  );
}

function ChunkRow({ chunk, index }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [promptOpen, setPromptOpen] = useState(false);

  return (
    <div style={isDark ? S.chunkDark : S.chunkLight}>
      <div style={S.chunkThumb}>
        {chunk.sceneImageUrl ? (
          <img
            src={chunk.sceneImageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="lazy"
          />
        ) : (
          <div style={S.chunkThumbEmpty}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--dim)", textAlign: "center", padding: "0 6px" }}>
              {chunk.imageSource === "broll"
                ? "broll (video clip)"
                : chunk.imageSource
                ? chunk.imageSource
                : "no image"}
            </span>
          </div>
        )}
      </div>
      <div style={S.chunkBody}>
        <div style={S.chunkHeadRow}>
          <span style={S.chunkId}>#{index + 1} · {chunk.id}</span>
          <span style={S.chunkSceneTitle}>{chunk.sceneTitle}</span>
        </div>
        {chunk.beats?.map(b => (
          <div key={b.id} style={isDark ? S.beatDark : S.beatLight}>
            "{b.narration}"
          </div>
        ))}
        <div style={S.auditRow}>
          <AuditBadge label="narration" passed={chunk.audits.narration.passed} notes={chunk.audits.narration.notes} />
          <AuditBadge label="render" passed={chunk.audits.render.passed} notes={chunk.audits.render.notes} />
          {chunk.model && <span style={S.modelBadge}>{chunk.model}</span>}
        </div>
        <button style={S.promptToggle} onClick={() => setPromptOpen(o => !o)}>
          {promptOpen ? "▾" : "▸"} scene prompt
        </button>
        {promptOpen && (
          <div style={isDark ? S.promptBoxDark : S.promptBoxLight}>{chunk.prompt}</div>
        )}
      </div>
    </div>
  );
}

export default function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/videos/${id}/bundle.json`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? "video not found" : `load failed: ${r.status}`);
        return r.json();
      })
      .then(data => { if (!cancelled) { setBundle(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div style={S.wrap}>
        <Header isPublic={true} />
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--dim)", fontSize: 11 }}>loading...</div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div style={S.wrap}>
        <Header isPublic={true} />
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 14, color: "var(--red)", marginBottom: 8 }}>$ {error || "video not found"}</div>
          <button onClick={() => navigate("/")} style={S.backBtn}>← back</button>
        </div>
      </div>
    );
  }

  // Shorts get their own layout — sticky 9:16 video on the left, beats/sources/
  // transcript on the right. Pre-roll disclosure goes at the bottom.
  if (bundle.format === "short") {
    return <ShortPage bundle={bundle} navigate={navigate} isDark={isDark} />;
  }

  const hidden = new Set(bundle.showcase?.hiddenChunkIds || []);
  const visibleChunks = (bundle.chunks || []).filter(c => !hidden.has(c.id));

  return (
    <div style={S.wrap}>
      <Header isPublic={true} />

      <button onClick={() => navigate("/")} style={S.backBtn}>← back</button>

      {/* Title + meta strip */}
      <div style={S.titleBlock}>
        <div style={S.eyebrow}>
          <span style={S.eyebrowDollar}>$</span>
          <span>video</span>
          <span style={S.eyebrowSep}>·</span>
          <span style={S.eyebrowId}>{bundle.id}</span>
        </div>
        <div style={isDark ? S.pageTitleDark : S.pageTitleLight}>{bundle.title}</div>
        <div style={S.metaStrip}>
          <span>{fmtDateFull(bundle.shippedAt)}</span>
          <span style={S.metaSep}>·</span>
          <span>{fmtDuration(bundle.durationSec)}</span>
          {bundle.style?.name && <>
            <span style={S.metaSep}>·</span>
            <span>style: {bundle.style.name}</span>
          </>}
          <span style={S.metaSep}>·</span>
          <span>{bundle.summary?.audio?.beatCount || visibleChunks.length} {bundle.summary?.audio?.beatCount ? "beats" : "chunks"}</span>
        </div>
      </div>

      {/* Video player */}
      <div style={S.videoBlock}>
        {bundle.video?.youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${bundle.video.youtubeId}`}
            title={bundle.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={S.videoFrame}
          />
        ) : bundle.video?.mp4Url ? (
          <video src={bundle.video.mp4Url} controls style={S.videoFrame} />
        ) : (
          <div style={S.videoPending}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--dim)" }}>video embed pending</span>
          </div>
        )}
      </div>

      {/* Core message */}
      {bundle.coreMessage && (
        <div style={isDark ? S.quoteDark : S.quoteLight}>
          <div style={S.quoteLabel}>core message</div>
          <div style={S.quoteText}>{bundle.coreMessage}</div>
        </div>
      )}

      {/* Style library panel */}
      {bundle.style && <section style={S.section}>
        <div style={S.sectionHead}>
          <div style={isDark ? S.h2Dark : S.h2Light}>style library</div>
          <div style={S.sectionMeta}>{bundle.style.name}</div>
        </div>
        <div style={isDark ? S.stylePanelDark : S.stylePanelLight}>
          <div style={S.styleDescription}>{bundle.style.description}</div>
          {bundle.style.anchorImageUrl && (
            <div style={S.anchorRow}>
              <img src={bundle.style.anchorImageUrl} alt="style anchor" style={S.anchorImg} loading="lazy" />
              <div style={S.anchorMeta}>
                <div style={S.anchorLabel}>style anchor</div>
                <div style={S.anchorDesc}>{bundle.style.anchorDescription}</div>
              </div>
            </div>
          )}
          {bundle.style.references?.length > 0 && (
            <>
              <div style={S.refLabel}>references ({bundle.style.references.length})</div>
              <div style={S.refGrid}>
                {bundle.style.references.map(r => (
                  <div key={r.name} style={isDark ? S.refCardDark : S.refCardLight}>
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt="" style={S.refImg} loading="lazy" />
                    ) : (
                      <div style={{ ...S.refImg, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--dim)" }}>no image</span>
                      </div>
                    )}
                    <div style={S.refCardBody}>
                      <div style={S.refName}>{r.name} <span style={S.refKind}>{r.kind}</span></div>
                      <div style={S.refDesc} title={r.description}>{r.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>}

      {/* Summary — how this video was made */}
      {bundle.summary && (
        <section style={S.section}>
          <div style={S.sectionHead}>
            <div style={isDark ? S.h2Dark : S.h2Light}>summary</div>
            <div style={S.sectionMeta}>how this video was made</div>
          </div>
          <div style={isDark ? S.summaryPanelDark : S.summaryPanelLight}>
            {(() => {
              const rows = [];
              const s = bundle.summary;
              if (s.writing) rows.push({
                label: "writing",
                value: <><strong>{s.writing.author}</strong><span style={S.dim}> · {s.writing.role}</span></>,
              });
              if (s.images) rows.push({
                label: "images",
                value: <>
                  <strong>{s.images.platform}</strong>
                  {s.images.models?.length > 0 && <>
                    <span style={S.dim}> · </span>
                    <span>{s.images.models.join(", ")}</span>
                  </>}
                  {s.images.sceneCount > 0 && <>
                    <span style={S.dim}> · {s.images.sceneCount} scenes</span>
                  </>}
                </>,
              });
              if (s.audio) rows.push({
                label: "audio",
                value: <>
                  <strong>{s.audio.tts}</strong>
                  <span style={S.dim}> · voice: </span>
                  <span>{s.audio.voice}</span>
                  {s.audio.playbackRate && <><span style={S.dim}> · {s.audio.playbackRate}×</span></>}
                  {s.audio.beatCount > 0 && <><span style={S.dim}> · {s.audio.beatCount} beats</span></>}
                </>,
              });
              if (s.render) rows.push({
                label: "render",
                value: <>
                  <strong>{s.render.engine}</strong>
                  <span style={S.dim}> · </span>
                  <span style={{ color: s.render.passed ? "var(--green)" : "var(--red)" }}>
                    {s.render.passed ? "✓ passed" : "! failed"}
                  </span>
                </>,
              });
              if (s.audit) rows.push({
                label: "narration audit",
                value: <>
                  <strong>{s.audit.narrationModel}</strong>
                  <span style={S.dim}> · {s.audit.narrationFlags} flag{s.audit.narrationFlags === 1 ? "" : "s"}</span>
                </>,
              });
              return rows.map((r, i) => (
                <SummaryRow key={r.label} label={r.label} value={r.value} isLast={i === rows.length - 1} />
              ));
            })()}
          </div>
        </section>
      )}

      {/* Chunks */}
      {visibleChunks.length > 0 && (
        <section style={S.section}>
          <div style={S.sectionHead}>
            <div style={isDark ? S.h2Dark : S.h2Light}>chunks ({visibleChunks.length})</div>
            <div style={S.sectionMeta}>each chunk = one scene image + narration beats</div>
          </div>
          <div style={S.chunkList}>
            {visibleChunks.map((c, i) => <ChunkRow key={c.id} chunk={c} index={i} />)}
          </div>
        </section>
      )}

      {/* Transcript — structured from chunks so scene titles break the flow */}
      {(bundle.transcript || visibleChunks.length > 0) && (
        <section style={S.section}>
          <button style={S.transcriptToggle} onClick={() => setTranscriptOpen(o => !o)}>
            {transcriptOpen ? "▾" : "▸"} full transcript
          </button>
          {transcriptOpen && (
            <div style={isDark ? S.transcriptBoxDark : S.transcriptBoxLight}>
              {visibleChunks.length > 0 ? (() => {
                let prevSceneTitle = null;
                return visibleChunks.map(c => {
                  const showHeading = c.sceneTitle && c.sceneTitle !== prevSceneTitle;
                  prevSceneTitle = c.sceneTitle;
                  return (
                    <div key={c.id}>
                      {showHeading && <div style={S.transcriptSceneHead}>{c.sceneTitle}</div>}
                      {(c.beats || []).map(b => (
                        <p key={b.id} style={S.transcriptBeat}>{b.narration}</p>
                      ))}
                    </div>
                  );
                });
              })() : (
                <p style={S.transcriptBeat}>{bundle.transcript}</p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const S = {
  wrap: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "48px 24px 80px",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  backBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub)",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "4px 10px",
    cursor: "pointer",
    marginBottom: 20,
  },

  titleBlock: { marginBottom: 20 },
  eyebrow: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--green)",
    display: "flex",
    gap: 6,
    alignItems: "center",
    marginBottom: 8,
  },
  eyebrowDollar: {
    color: "var(--green)",
    fontWeight: 600,
  },
  eyebrowSep: { color: "var(--dim)" },
  eyebrowId: {
    color: "var(--text-sub)",
    fontWeight: 500,
  },
  pageTitleLight: {
    fontFamily: "var(--font)",
    fontSize: 28, fontWeight: 700,
    color: "var(--text-bright)",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    marginBottom: 8,
  },
  pageTitleDark: {
    fontFamily: "var(--font-mono)",
    fontSize: 18, fontWeight: 500,
    color: "var(--text-bright)",
    marginBottom: 8,
  },
  metaStrip: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub)",
    display: "flex", flexWrap: "wrap", gap: 6,
  },
  metaSep: { color: "var(--dim)" },

  videoBlock: {
    aspectRatio: "16 / 9",
    background: "#000",
    borderRadius: "var(--radius-card, 4px)",
    overflow: "hidden",
    marginBottom: 20,
    border: "1px solid var(--border)",
  },
  videoFrame: {
    width: "100%", height: "100%",
    border: 0, display: "block",
  },
  videoPending: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--surface-2)",
  },

  quoteLight: {
    background: "rgba(0, 128, 96, 0.05)",
    borderLeft: "3px solid var(--green)",
    padding: "14px 18px",
    borderRadius: 6,
    marginBottom: 28,
  },
  quoteDark: {
    background: "var(--green-bg)",
    borderLeft: "3px solid var(--green)",
    padding: "14px 18px",
    marginBottom: 28,
  },
  quoteLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--green)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
  },
  quoteText: {
    fontSize: 14, lineHeight: 1.5,
    color: "var(--text)",
  },

  section: { marginBottom: 36 },
  sectionHead: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    marginBottom: 12,
  },
  h2Light: {
    fontFamily: "var(--font-mono)",
    fontSize: 14, fontWeight: 600,
    color: "var(--text-bright)",
    letterSpacing: 0,
  },
  h2Dark: {
    fontFamily: "var(--font-mono)",
    fontSize: 13, fontWeight: 500,
    color: "var(--text-bright)",
  },
  sectionMeta: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub)",
  },

  stylePanelLight: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    padding: 16,
    boxShadow: "var(--shadow-card)",
  },
  stylePanelDark: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: 14,
  },
  styleDescription: {
    fontSize: 13, lineHeight: 1.5,
    color: "var(--text-sub)",
    marginBottom: 14,
  },
  anchorRow: {
    display: "flex", gap: 14,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottom: "1px solid var(--divider)",
  },
  anchorImg: {
    width: 140, height: 140,
    objectFit: "cover",
    borderRadius: 6,
    border: "1px solid var(--border)",
    flexShrink: 0,
  },
  anchorMeta: { flex: 1 },
  anchorLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--green)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
  },
  anchorDesc: { fontSize: 12, lineHeight: 1.5, color: "var(--text-sub)" },
  refLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub)",
    marginBottom: 10,
  },
  refGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 200px))",
    gap: 12,
    justifyContent: "start",
  },
  refCardLight: {
    background: "var(--surface-2)",
    border: "1px solid var(--divider)",
    borderRadius: 6,
    overflow: "hidden",
  },
  refCardDark: {
    background: "var(--surface-2, var(--surface))",
    border: "1px solid var(--border)",
    borderRadius: 4,
    overflow: "hidden",
  },
  refImg: {
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "cover",
    display: "block",
    borderBottom: "1px solid var(--divider)",
  },
  refCardBody: { padding: "8px 10px 10px" },
  refName: {
    fontFamily: "var(--font-mono)",
    fontSize: 11, fontWeight: 600,
    color: "var(--text-bright)",
    marginBottom: 4,
  },
  refKind: {
    fontFamily: "var(--font-mono)",
    fontSize: 10, fontWeight: 400,
    color: "var(--dim)",
    marginLeft: 4,
  },
  refDesc: {
    fontSize: 11,
    lineHeight: 1.45,
    color: "var(--text-sub)",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  summaryPanelLight: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    padding: "4px 16px",
    boxShadow: "var(--shadow-card)",
  },
  summaryPanelDark: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "4px 14px",
  },
  dim: { color: "var(--dim)" },
  auditStat: {
    display: "flex", flexDirection: "column", gap: 3,
  },
  auditStatLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--dim)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  auditStatValue: {
    fontFamily: "var(--font-mono)",
    fontSize: 13, fontWeight: 600,
    color: "var(--text-bright)",
  },

  chunkList: { display: "flex", flexDirection: "column", gap: 12 },
  chunkLight: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    padding: 14,
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    gap: 16,
    boxShadow: "var(--shadow-card)",
  },
  chunkDark: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: 12,
    display: "grid",
    gridTemplateColumns: "200px 1fr",
    gap: 14,
  },
  chunkThumb: {
    aspectRatio: "16 / 9",
    background: "var(--surface-2)",
    borderRadius: 4,
    overflow: "hidden",
    border: "1px solid var(--divider)",
  },
  chunkThumbEmpty: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  chunkBody: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  chunkHeadRow: { display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" },
  chunkId: {
    fontFamily: "var(--font-mono)",
    fontSize: 11, fontWeight: 600,
    color: "var(--green)",
  },
  chunkSceneTitle: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub)",
  },
  beatLight: {
    fontSize: 14, lineHeight: 1.5,
    color: "var(--text)",
    fontStyle: "italic",
  },
  beatDark: {
    fontFamily: "var(--font-mono)",
    fontSize: 12, lineHeight: 1.5,
    color: "var(--text)",
  },

  auditRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 },
  badgePassLight: {
    fontFamily: "var(--font-mono)",
    fontSize: 10, fontWeight: 600,
    color: "var(--green)",
    background: "var(--green-bg)",
    border: "1px solid var(--green-border)",
    padding: "2px 8px",
    borderRadius: "var(--radius-chip, 3px)",
  },
  badgePassDark: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--green)",
    background: "var(--green-bg)",
    border: "1px solid var(--green-border)",
    padding: "2px 7px",
    borderRadius: 3,
  },
  badgeFail: {
    fontFamily: "var(--font-mono)",
    fontSize: 10, fontWeight: 600,
    color: "var(--red, #d42626)",
    background: "rgba(212, 38, 38, 0.08)",
    border: "1px solid rgba(212, 38, 38, 0.3)",
    padding: "2px 8px",
    borderRadius: 3,
  },
  modelBadge: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--text-sub)",
    background: "var(--surface-2)",
    border: "1px solid var(--divider)",
    padding: "2px 7px",
    borderRadius: 3,
  },

  promptToggle: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub)",
    background: "transparent",
    border: 0,
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
    alignSelf: "flex-start",
  },
  promptBoxLight: {
    fontFamily: "var(--font-mono)",
    fontSize: 11, lineHeight: 1.55,
    color: "var(--text-sub)",
    background: "var(--surface-2)",
    border: "1px solid var(--divider)",
    borderRadius: 4,
    padding: 10,
    whiteSpace: "pre-wrap",
  },
  promptBoxDark: {
    fontFamily: "var(--font-mono)",
    fontSize: 11, lineHeight: 1.55,
    color: "var(--text-sub)",
    background: "var(--surface-2, #0a0b0d)",
    border: "1px solid var(--border)",
    borderRadius: 3,
    padding: 10,
    whiteSpace: "pre-wrap",
  },

  transcriptToggle: {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--text)",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "8px 14px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  transcriptBoxLight: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    padding: "8px 22px 16px",
    marginTop: 10,
    boxShadow: "var(--shadow-card)",
  },
  transcriptBoxDark: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "8px 18px 14px",
    marginTop: 10,
  },
  transcriptSceneHead: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--green)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: 18,
    marginBottom: 6,
  },
  transcriptBeat: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "var(--text)",
    margin: "6px 0",
  },
};

// ── ShortPage ────────────────────────────────────────────────────────────────
// 2-col layout: sticky 9:16 video on the left, content on the right.
// Pre-roll disclosure moves to the bottom (lower-priority on artlu.ai since
// we're not the consumption surface, but worth surfacing for context).
function ShortPage({ bundle, navigate, isDark }) {
  const beats = bundle.beats || [];
  const characters = bundle.characters || [];
  const sources = bundle.sources || [];
  const summary = bundle.summary || {};

  return (
    <div style={SS.wrap}>
      <Header isPublic={true} />
      <button onClick={() => navigate("/")} style={S.backBtn}>← back</button>

      {/* Title + meta */}
      <div style={S.titleBlock}>
        <div style={S.eyebrow}>
          <span style={S.eyebrowDollar}>$</span>
          <span>video</span>
          <span style={S.eyebrowSep}>·</span>
          <span style={S.eyebrowId}>{bundle.id}</span>
          <span style={S.eyebrowSep}>·</span>
          <span style={SS.shortBadge}>SHORT</span>
        </div>
        <div style={isDark ? S.pageTitleDark : SS.pageTitleShortLight}>{bundle.title}</div>
        <div style={S.metaStrip}>
          <span>{fmtDateFull(bundle.shippedAt)}</span>
          <span style={S.metaSep}>·</span>
          <span>{fmtDuration(bundle.durationSec)}</span>
          {bundle.show && <>
            <span style={S.metaSep}>·</span>
            <span>show: {bundle.show}</span>
          </>}
          {bundle.topicTier && <>
            <span style={S.metaSep}>·</span>
            <span>topic: {bundle.topicTier}</span>
          </>}
          {beats.length > 0 && <>
            <span style={S.metaSep}>·</span>
            <span>{beats.length} beats</span>
          </>}
        </div>
      </div>

      <div style={SS.mainGrid}>
        {/* LEFT: video stack — YouTube on top (cleaner embed, no platform UI
            chrome cropping the frame), TikTok below. Each platform gets its
            own section header so the page reads consistently with the right
            column. Sticky only when there's a single video — two stacked
            videos exceed viewport height, so the second one would never become
            visible behind a sticky first. */}
        <div style={{
          ...SS.leftCol,
          position: (bundle.video?.tiktokId && bundle.video?.youtubeId) ? "static" : "sticky",
        }}>
          {bundle.video?.youtubeId && (
            <section style={SS.videoSection}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>youtube</div>
              </div>
              <div style={SS.videoWrap}>
                <iframe
                  src={`https://www.youtube.com/embed/${bundle.video.youtubeId}?rel=0&modestbranding=1`}
                  title={`${bundle.title} on YouTube`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={S.videoFrame}
                />
              </div>
            </section>
          )}
          {bundle.video?.tiktokId && (
            <section style={SS.videoSection}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>tiktok</div>
              </div>
              <div style={SS.videoWrap}>
                <iframe
                  src={`https://www.tiktok.com/player/v1/${bundle.video.tiktokId}?music_info=0&description=0`}
                  title={`${bundle.title} on TikTok`}
                  allow="encrypted-media; fullscreen"
                  allowFullScreen
                  scrolling="no"
                  style={S.videoFrame}
                />
              </div>
            </section>
          )}
          {!bundle.video?.youtubeId && !bundle.video?.tiktokId && bundle.video?.mp4Url && (
            <section style={SS.videoSection}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>video</div>
              </div>
              <div style={SS.videoWrap}>
                <video src={bundle.video.mp4Url} controls style={S.videoFrame} />
              </div>
            </section>
          )}
          {!bundle.video?.youtubeId && !bundle.video?.tiktokId && !bundle.video?.mp4Url && (
            <section style={SS.videoSection}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>video</div>
              </div>
              <div style={SS.videoWrap}>
                <div style={S.videoPending}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--dim)" }}>video embed pending</span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT: summary, characters, beats, sources, transcript, pre-roll */}
        <div style={SS.rightCol}>
          {summary && Object.values(summary).some(Boolean) && (
            <section style={SS.section}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>summary</div>
                <div style={S.sectionMeta}>how this video was made</div>
              </div>
              <div style={isDark ? S.summaryPanelDark : S.summaryPanelLight}>
                {(() => {
                  const rows = [];
                  if (summary.writing) rows.push({
                    label: "writing",
                    value: <><strong>{summary.writing.author}</strong><span style={S.dim}> · {summary.writing.role}</span></>,
                  });
                  if (summary.videoClips) rows.push({
                    label: "video clips",
                    value: <>
                      <strong>{summary.videoClips.platform}</strong>
                      {summary.videoClips.models?.length > 0 && <>
                        <span style={S.dim}> · </span>
                        <span>{summary.videoClips.models.join(", ")}</span>
                      </>}
                      {summary.videoClips.clipCount && <>
                        <span style={S.dim}> · {summary.videoClips.clipCount} clips</span>
                      </>}
                    </>,
                  });
                  if (summary.audio) rows.push({
                    label: "audio",
                    value: <>
                      <strong>{summary.audio.tts}</strong>
                      <span style={S.dim}> · voice: </span>
                      <span>{summary.audio.voice}</span>
                      {summary.audio.beatCount && <><span style={S.dim}> · {summary.audio.beatCount} beats</span></>}
                    </>,
                  });
                  if (summary.render) rows.push({
                    label: "render",
                    value: <>
                      <strong>{summary.render.engine}</strong>
                      <span style={S.dim}> · </span>
                      <span style={{ color: summary.render.passed ? "var(--green)" : "var(--red)" }}>
                        {summary.render.passed ? "✓ stitched" : "! failed"}
                      </span>
                    </>,
                  });
                  if (summary.cost) rows.push({
                    label: "cost",
                    value: <><strong>{summary.cost}</strong></>,
                  });
                  return rows.map((r, i) => (
                    <SummaryRow key={r.label} label={r.label} value={r.value} isLast={i === rows.length - 1} />
                  ));
                })()}
              </div>
            </section>
          )}

          {characters.length > 0 && (
            <section style={SS.section}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>recurring characters</div>
                <div style={S.sectionMeta}>{characters.length} used this episode</div>
              </div>
              <div style={SS.characterPanel}>
                {characters.map(c => (
                  <div key={c.name} style={SS.characterRow}>
                    {c.imageUrl && (
                      <img src={c.imageUrl} alt={c.name} style={SS.characterImg} loading="lazy" />
                    )}
                    <div style={SS.characterMeta}>
                      {c.usedInBeats?.length > 0 && (
                        <div style={SS.characterLabel}>
                          used in beats {c.usedInBeats.map(n => String(n).padStart(2, "0")).join(", ")}
                        </div>
                      )}
                      <div style={SS.characterName}>
                        {c.name} <span style={SS.characterKind}>{c.kind}</span>
                      </div>
                      {c.description && <div style={SS.characterDesc}>{c.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {beats.length > 0 && (
            <section style={SS.section}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>beats ({beats.length})</div>
                <div style={S.sectionMeta}>each beat = one clip + narration line</div>
              </div>
              <div style={SS.beatGrid}>
                {beats.map(b => <BeatTile key={b.n} beat={b} />)}
              </div>
            </section>
          )}

          {sources.length > 0 && (
            <section style={SS.section}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>sources</div>
                <div style={S.sectionMeta}>every cited number, attributed</div>
              </div>
              <div style={SS.sourcesPanel}>
                {sources.map((src, i) => (
                  <div key={i} style={{ ...SS.sourceRow, ...(i === sources.length - 1 ? { borderBottom: 0 } : {}) }}>
                    <div style={SS.sourceFact}>
                      <span style={SS.sourceNum}>{String(i + 1).padStart(2, "0")}.</span>
                      {src.fact}
                    </div>
                    {src.url ? (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={SS.sourceAttributionLink}
                      >
                        {src.attribution} ↗
                      </a>
                    ) : (
                      <div style={SS.sourceAttribution}>{src.attribution}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {bundle.transcript && (
            <section style={SS.section}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>full transcript</div>
                <div style={S.sectionMeta}>narration only, no SSML markup</div>
              </div>
              <div style={SS.transcriptPanel}>
                {beats.length > 0 ? (
                  beats.filter(b => b.narration).map(b => (
                    <p key={b.n} style={SS.transcriptLine}>
                      <span style={SS.transcriptN}>{String(b.n).padStart(2, "0")}</span>
                      {b.narration}
                    </p>
                  ))
                ) : (
                  <p style={SS.transcriptLine}>{bundle.transcript}</p>
                )}
              </div>
            </section>
          )}

          {bundle.preRoll && (
            <section style={SS.section}>
              <div style={S.sectionHead}>
                <div style={isDark ? S.h2Dark : S.h2Light}>pre-roll disclosure</div>
                <div style={S.sectionMeta}>why every episode opens with a satire card</div>
              </div>
              <div style={isDark ? S.quoteDark : S.quoteLight}>
                <div style={S.quoteLabel}>on-screen pre-roll (1.7s)</div>
                <div style={S.quoteText}>
                  <strong>{bundle.preRoll.burnedText}</strong>, with a "{bundle.preRoll.voiceTag}" voice tag burned into the audio.
                </div>
                <div style={SS.disclosureWhy}>
                  <strong style={{ color: "var(--text-bright)" }}>why it's there:</strong> YouTube and TikTok algorithms shadowban news-format AI content that lacks explicit disclosure. The pre-roll keeps the platforms from misclassifying these as real news. On artlu.ai it's lower-priority context, but it explains the first 1.7s of every episode.
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function BeatTile({ beat }) {
  return (
    <div style={SS.beatTile}>
      <div style={SS.beatTileThumb}>
        {beat.clipImageUrl ? (
          <img src={beat.clipImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
        ) : (
          <div style={SS.beatTileEmpty}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--dim)" }}>no frame</span>
          </div>
        )}
        {beat.durationSec && (
          <span style={SS.beatTileDur}>{beat.durationSec}s</span>
        )}
      </div>
      <div style={SS.beatTileBody}>
        <div style={SS.beatTileHead}>
          <span style={SS.beatTileN}>#{String(beat.n).padStart(2, "0")}</span>
          <span style={SS.beatTileName}>{beat.name}</span>
        </div>
        <div style={SS.beatTileNarration}>"{beat.narration}"</div>
        {(beat.character || beat.sourceChyron) && (
          <div style={SS.beatTileTags}>
            {beat.character && <span style={SS.beatTileTagChar}>{beat.character}</span>}
            {beat.sourceChyron && <span style={SS.beatTileTagChyron}>{beat.sourceChyron}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

const SS = {
  wrap: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 32px 80px",  // top + sides equal so the video doesn't feel pinned to one edge
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  shortBadge: {
    color: "var(--green)",
    fontWeight: 700,
    letterSpacing: "0.06em",
  },
  pageTitleShortLight: {
    fontFamily: "var(--font)",
    fontSize: 26, fontWeight: 700,
    color: "var(--text-bright)",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    marginBottom: 8,
  },

  mainGrid: {
    display: "grid",
    // `auto` left col fits its widest child (the video). Without this the col
    // is fixed at 380px but the 9:16 video derives a smaller width from
    // height + aspect-ratio, leaving a wide empty strip beside the video.
    gridTemplateColumns: "auto 1fr",
    gap: 36,  // breathing room between video and right column
    alignItems: "start",
  },
  leftCol: {
    // Sticky so the video stays in view while the right column scrolls.
    // Vertical gap matches the right column's section spacing (SS.section
    // marginBottom) so adjacent video sections read with the same rhythm
    // as adjacent content sections.
    position: "sticky",
    top: 24,
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  videoWrap: {
    aspectRatio: "9 / 16",
    height: "min(calc(100vh - 320px), 676px)",
    width: "auto",
    alignSelf: "flex-start",  // left-align with the section header above it
    background: "#000",
    borderRadius: "var(--radius-card, 4px)",
    border: "1px solid var(--border)",
    overflow: "hidden",
    position: "relative",
  },
  rightCol: { minWidth: 0 },
  videoSection: {
    display: "flex",
    flexDirection: "column",
  },
  // Tighter vertical rhythm than the long-form page — shorts have more
  // sections but each is smaller, so the long-form `marginBottom: 36`
  // adds up to too much whitespace.
  section: { marginBottom: 22 },

  characterPanel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card)",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  characterRow: { display: "flex", gap: 14, alignItems: "flex-start" },
  characterImg: {
    width: 90, height: 90,
    objectFit: "cover", objectPosition: "top",
    borderRadius: 6,
    border: "1px solid var(--border)",
    flexShrink: 0,
  },
  characterMeta: { flex: 1, minWidth: 0 },
  characterLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--green)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 4,
  },
  characterName: {
    fontFamily: "var(--font-mono)",
    fontSize: 13, fontWeight: 600,
    color: "var(--text-bright)",
    marginBottom: 4,
  },
  characterKind: { fontWeight: 400, color: "var(--dim)", marginLeft: 4 },
  characterDesc: { fontSize: 12, lineHeight: 1.5, color: "var(--text-sub)" },

  beatGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  beatTile: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    padding: 10,
    display: "grid",
    gridTemplateColumns: "76px 1fr",
    gap: 12,
    boxShadow: "var(--shadow-card)",
    minWidth: 0,
  },
  beatTileThumb: {
    aspectRatio: "9 / 16",
    borderRadius: 6,
    border: "1px solid var(--divider)",
    overflow: "hidden",
    position: "relative",
    background: "var(--surface-2)",
  },
  beatTileEmpty: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  beatTileDur: {
    position: "absolute", top: 4, right: 4,
    fontFamily: "var(--font-mono)",
    fontSize: 9,
    color: "rgba(255,255,255,0.85)",
    background: "rgba(0,0,0,0.55)",
    padding: "1px 5px",
    borderRadius: 2,
  },
  beatTileBody: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  beatTileHead: {
    display: "flex", gap: 8, alignItems: "baseline",
    fontFamily: "var(--font-mono)",
    fontSize: 11,
  },
  beatTileN: { fontWeight: 600, color: "var(--green)" },
  beatTileName: {
    color: "var(--text-sub)",
    fontSize: 10,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
  },
  beatTileNarration: {
    fontSize: 13, lineHeight: 1.45,
    color: "var(--text)",
    fontStyle: "italic",
    margin: "2px 0 4px",
  },
  beatTileTags: { display: "flex", gap: 4, flexWrap: "wrap" },
  beatTileTagChar: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--green)",
    background: "var(--green-bg)",
    border: "1px solid var(--green-border)",
    padding: "2px 6px",
    borderRadius: 3,
    fontWeight: 600,
  },
  beatTileTagChyron: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "#b3216f",
    background: "#fff0f7",
    border: "1px solid #f7c8e1",
    padding: "2px 6px",
    borderRadius: 3,
    fontWeight: 500,
  },

  sourcesPanel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card)",
    padding: "4px 16px",
  },
  sourceRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",  // both columns wrap when long; matches the fact-column behavior
    gap: 14,
    padding: "11px 0",
    borderBottom: "1px solid var(--divider)",
    alignItems: "baseline",
  },
  sourceFact: { fontSize: 13, color: "var(--text)", lineHeight: 1.4 },
  sourceNum: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--green)",
    fontWeight: 600,
    marginRight: 8,
  },
  sourceAttribution: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub)",
    lineHeight: 1.4,
    textAlign: "right",
  },
  sourceAttributionLink: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--green)",
    lineHeight: 1.4,
    textAlign: "right",
    textDecoration: "none",
  },

  transcriptPanel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card)",
    padding: "8px 18px 14px",
  },
  transcriptLine: {
    fontSize: 14, lineHeight: 1.6,
    color: "var(--text)",
    padding: "6px 0",
    display: "grid",
    gridTemplateColumns: "30px 1fr",
    gap: 10,
    alignItems: "baseline",
    margin: 0,
  },
  transcriptN: {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "var(--green)",
    fontWeight: 600,
  },

  disclosureWhy: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub)",
    marginTop: 10,
    lineHeight: 1.55,
  },
};
