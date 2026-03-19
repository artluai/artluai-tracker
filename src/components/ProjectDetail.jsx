import { useState } from "react";
import EmbedFrame from "./EmbedFrame";
import FileBrowser from "./FileBrowser";

export default function ProjectDetail({ project, isAdmin }) {
  const p = project;
  const files = isAdmin ? (p.files || []) : (p.files || []).filter(f => f.visibility === "public");
  const shots = p.screenshots || [];

  const embedUrl = p.embed?.trim() || p.link?.trim() || null;
  const hasEmbed = !!embedUrl;
  const hasRepo = !!p.repo?.trim();
  const hasInfo = p.longDesc?.trim() || p.media?.trim() || shots.length || files.length;

  // Default to "demo" if available, otherwise "info"
  const defaultTab = hasEmbed ? "demo" : "info";
  const [tab, setTab] = useState(defaultTab);

  const tabs = [
    { id: "info", label: "info" },
    ...(hasEmbed ? [{ id: "demo", label: "live demo" }] : []),
    ...(hasRepo ? [{ id: "files", label: "files" }] : []),
  ];

  if (!hasInfo && !hasEmbed && !hasRepo) {
    return (
      <div style={S.wrap}>
        <span style={{ color: "var(--dimmer)", fontSize: 11 }}>
          {isAdmin
            ? "no details yet — edit to add description, screenshots, files, or video"
            : "no details available"}
        </span>
      </div>
    );
  }

  return (
    <div style={S.wrap}>
      {/* Tab bar */}
      <div style={S.tabBar}>
        {tabs.map(t => (
          <button
            key={t.id}
            style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            {tab === t.id && <span style={S.tabDot} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === "info" && (
        <div style={S.panel}>
          {!hasInfo ? (
            <span style={{ color: "var(--dimmer)", fontSize: 11 }}>
              {isAdmin ? "edit to add a description, screenshots, or files" : "no details available"}
            </span>
          ) : (
            <>
              {p.longDesc?.trim() && (
                <Sec label="description">
                  <div style={{ fontSize: 12, color: "#8a8f9a", lineHeight: 1.7, whiteSpace: "pre-wrap", maxWidth: 700 }}>
                    {p.longDesc}
                  </div>
                </Sec>
              )}
              {p.media?.trim() && (
                <Sec label="media">
                  {isEmbed(p.media) ? (
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, maxWidth: 560, borderRadius: 4, overflow: "hidden", border: "1px solid var(--border)" }}>
                      <iframe
                        src={toEmbed(p.media)}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Project video"
                      />
                    </div>
                  ) : (
                    <a href={p.media} target="_blank" rel="noreferrer" style={{ fontSize: 11 }}>▶ {p.media}</a>
                  )}
                </Sec>
              )}
              {shots.length > 0 && (
                <Sec label="screenshots">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {shots.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="" style={{ height: 120, borderRadius: 4, border: "1px solid var(--border)", objectFit: "cover" }} />
                      </a>
                    ))}
                  </div>
                </Sec>
              )}
              {p.repo?.trim() && (
                <Sec label="repository">
                  <a href={p.repo} target="_blank" rel="noreferrer" style={{ fontSize: 11 }}>{p.repo} ↗</a>
                </Sec>
              )}
              {files.length > 0 && (
                <Sec label="files">
                  {files.map((f, i) => (
                    <div key={i} style={S.fileRow}>
                      <div style={{ fontSize: 11, marginBottom: 6, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                        <span style={{ color: "var(--text-bright)" }}>{f.name}</span>
                        {isAdmin && <span style={{ fontSize: 9 }} className={`vis-${f.visibility}`}>[{f.visibility}]</span>}
                        {f.visibility === "gated" && !isAdmin && <span style={{ fontSize: 9, color: "var(--yellow)" }}>locked</span>}
                      </div>
                      {f.type === "link"
                        ? <a href={f.url} target="_blank" rel="noreferrer" style={{ fontSize: 10 }}>{f.url} ↗</a>
                        : f.visibility === "gated" && !isAdmin
                          ? <div style={{ fontSize: 10, color: "var(--dimmer)" }}>content locked</div>
                          : <pre style={S.fileContent}>{f.content}</pre>
                      }
                    </div>
                  ))}
                </Sec>
              )}
            </>
          )}
        </div>
      )}

      {/* Live demo tab */}
      {tab === "demo" && (
        <div style={S.embedPanel}>
          <EmbedFrame url={embedUrl} />
        </div>
      )}

      {/* Files tab */}
      {tab === "files" && (
        <FileBrowser repo={p.repo} />
      )}
    </div>
  );
}

function Sec({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: "var(--dim)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function isEmbed(u) {
  return u.includes("youtube.com") || u.includes("youtu.be") || u.includes("loom.com") || u.includes("screen.studio/share");
}
function toEmbed(u) {
  if (u.includes("youtube.com/watch")) return `https://www.youtube.com/embed/${new URL(u).searchParams.get("v")}`;
  if (u.includes("youtu.be/")) return `https://www.youtube.com/embed/${u.split("youtu.be/")[1]?.split("?")[0]}`;
  if (u.includes("loom.com/share/")) return `https://www.loom.com/embed/${u.split("loom.com/share/")[1]?.split("?")[0]}`;
  if (u.includes("screen.studio/share/")) return `https://screen.studio/embed/${u.split("screen.studio/share/")[1]?.split("?")[0]}`;
  return u;
}

const S = {
  wrap: { background: "var(--surface)", borderBottom: "1px solid var(--border)" },
  tabBar: {
    display: "flex",
    borderBottom: "1px solid var(--border)",
    padding: "0 14px",
    background: "#0a0b0d",
  },
  tab: {
    fontFamily: "inherit",
    fontSize: 10,
    letterSpacing: "0.05em",
    color: "var(--dim)",
    padding: "7px 12px 6px",
    borderBottom: "2px solid transparent",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
    transition: "color 0.15s",
  },
  tabActive: {
    color: "var(--green)",
    borderBottom: "2px solid var(--green)",
  },
  tabDot: {
    width: 5, height: 5, borderRadius: "50%",
    background: "var(--green)", display: "inline-block",
  },
  panel: { padding: "16px 20px" },
  embedPanel: { padding: 12 },
  fileRow: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "10px 12px",
    marginBottom: 6,
  },
  fileContent: {
    fontSize: 11, color: "var(--text)", background: "var(--bg)",
    padding: "8px 10px", borderRadius: 3, overflow: "auto",
    maxHeight: 200, whiteSpace: "pre-wrap", wordBreak: "break-word",
    margin: 0, lineHeight: 1.5,
  },
};
