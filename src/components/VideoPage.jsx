import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../lib/theme";
import Header from "./Header";
import { getVideoBundle } from "../lib/video-mock-data";

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
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--dim)" }}>no image</span>
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

  const bundle = getVideoBundle(id);

  if (!bundle) {
    return (
      <div style={S.wrap}>
        <Header isPublic={true} />
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 14, color: "var(--red)", marginBottom: 8 }}>$ video not found</div>
          <button onClick={() => navigate("/")} style={S.backBtn}>← back</button>
        </div>
      </div>
    );
  }

  const visibleChunks = bundle.chunks.filter(c => !bundle.showcase.hiddenChunkIds.includes(c.id));

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
          <span style={S.metaSep}>·</span>
          <span>style: {bundle.style.name}</span>
          <span style={S.metaSep}>·</span>
          <span>{bundle.auditSummary.totalBeats || visibleChunks.length} {bundle.auditSummary.totalBeats ? "beats" : "chunks"}</span>
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
      <section style={S.section}>
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
                      <div style={S.refDesc}>{r.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Audit summary */}
      <section style={S.section}>
        <div style={S.sectionHead}>
          <div style={isDark ? S.h2Dark : S.h2Light}>audit summary</div>
        </div>
        <div style={isDark ? S.auditPanelDark : S.auditPanelLight}>
          <div style={S.auditStat}>
            <span style={S.auditStatLabel}>total beats</span>
            <span style={S.auditStatValue}>{bundle.auditSummary.totalBeats || "—"}</span>
          </div>
          <div style={S.auditStat}>
            <span style={S.auditStatLabel}>narration flags</span>
            <span style={S.auditStatValue}>{bundle.auditSummary.narrationFlags}</span>
          </div>
          <div style={S.auditStat}>
            <span style={S.auditStatLabel}>narration model</span>
            <span style={S.auditStatValue}>{bundle.auditSummary.narrationModel || "—"}</span>
          </div>
          <div style={S.auditStat}>
            <span style={S.auditStatLabel}>render</span>
            <span style={{ ...S.auditStatValue, color: bundle.auditSummary.renderPassed ? "var(--green)" : "var(--red)" }}>
              {bundle.auditSummary.renderPassed ? "✓ passed" : "! failed"}
            </span>
          </div>
        </div>
      </section>

      {/* Chunks */}
      <section style={S.section}>
        <div style={S.sectionHead}>
          <div style={isDark ? S.h2Dark : S.h2Light}>chunks ({visibleChunks.length})</div>
          <div style={S.sectionMeta}>each chunk = one scene image + narration beats</div>
        </div>
        <div style={S.chunkList}>
          {visibleChunks.map((c, i) => <ChunkRow key={c.id} chunk={c} index={i} />)}
        </div>
      </section>

      {/* Transcript */}
      <section style={S.section}>
        <button style={S.transcriptToggle} onClick={() => setTranscriptOpen(o => !o)}>
          {transcriptOpen ? "▾" : "▸"} full transcript
        </button>
        {transcriptOpen && (
          <div style={isDark ? S.transcriptBoxDark : S.transcriptBoxLight}>{bundle.transcript}</div>
        )}
      </section>
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
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 12,
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
  refDesc: { fontSize: 11, lineHeight: 1.45, color: "var(--text-sub)" },

  auditPanelLight: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    padding: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
    boxShadow: "var(--shadow-card)",
  },
  auditPanelDark: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },
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
    fontSize: 13, lineHeight: 1.6,
    color: "var(--text)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    padding: 16,
    marginTop: 10,
    whiteSpace: "pre-wrap",
  },
  transcriptBoxDark: {
    fontFamily: "var(--font-mono)",
    fontSize: 12, lineHeight: 1.6,
    color: "var(--text)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: 14,
    marginTop: 10,
    whiteSpace: "pre-wrap",
  },
};
