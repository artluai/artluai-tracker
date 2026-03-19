export default function EmbedFrame({ url }) {
  if (!url?.trim()) return null;

  return (
    <div style={S.wrap}>
      <div style={S.toolbar}>
        <div style={S.dots}>
          <span style={{ ...S.dot, background: "#ef4444" }} />
          <span style={{ ...S.dot, background: "#f59e0b" }} />
          <span style={{ ...S.dot, background: "#4ade80" }} />
        </div>
        <div style={S.url}>{url}</div>
        <a href={url} target="_blank" rel="noreferrer" style={S.openBtn} onClick={e => e.stopPropagation()}>
          ↗ open
        </a>
      </div>
      <iframe
        src={url}
        sandbox="allow-scripts allow-same-origin allow-forms"
        style={S.frame}
        title="Live project demo"
        loading="lazy"
      />
    </div>
  );
}

const S = {
  wrap: { border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" },
  toolbar: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "6px 10px",
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
  },
  dots: { display: "flex", gap: 5, flexShrink: 0 },
  dot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block" },
  url: {
    flex: 1, fontSize: 10, color: "var(--dim)",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  openBtn: {
    fontSize: 9, color: "var(--dim)", background: "var(--dimmer)",
    padding: "2px 8px", borderRadius: 2, letterSpacing: "0.04em",
    flexShrink: 0, opacity: 1,
    textDecoration: "none",
  },
  frame: { width: "100%", height: 400, border: "none", display: "block", background: "#0a0b0c" },
};
