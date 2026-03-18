export default function Links({ p }) {
  const hasLink = p.link?.trim();
  const hasRepo = p.repo?.trim();
  const hasMedia = p.media?.trim();
  if (!hasLink && !hasRepo && !hasMedia) return <span style={{ color: "var(--dimmer)", fontSize: 10 }}>—</span>;
  return (
    <span style={{ fontSize: 10, display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      {hasLink && <a href={p.link} target="_blank" rel="noreferrer" style={{ color: "var(--green)", textDecoration: "none", opacity: 0.75 }} onClick={e => e.stopPropagation()}>{shortUrl(p.link)} ↗</a>}
      {hasLink && (hasRepo || hasMedia) && <span style={{ color: "var(--dimmer)" }}>·</span>}
      {hasRepo && <a href={p.repo} target="_blank" rel="noreferrer" style={{ color: "var(--green)", textDecoration: "none", opacity: 0.75 }} onClick={e => e.stopPropagation()}>gh ↗</a>}
      {hasRepo && hasMedia && <span style={{ color: "var(--dimmer)" }}>·</span>}
      {hasMedia && <a href={p.media} target="_blank" rel="noreferrer" style={{ color: "var(--green)", textDecoration: "none", opacity: 0.75 }} onClick={e => e.stopPropagation()}>▶ demo</a>}
    </span>
  );
}

function shortUrl(u) {
  try { return new URL(u).hostname.replace("www.", ""); } catch { return u.slice(0, 20); }
}