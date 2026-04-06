export default function Links({ p }) {
  const hasLink = p.link?.trim();
  const hasRepo = p.repo?.trim();
  const hasMedia = p.media?.trim();
  const hasArtifact = !!p.artifactHtml?.trim();
  const hasDemo = hasArtifact || hasMedia;

  if (!hasLink && !hasRepo && !hasDemo) return <span style={{ color: "var(--dimmer)", fontSize: 10 }}>—</span>;

  const sep = <span style={{ color: "var(--dimmer)" }}>·</span>;
  const linkStyle = { color: "var(--green)", textDecoration: "none", opacity: 0.75 };

  return (
    <span style={{ fontSize: 10, display: "inline-flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" }}>
      {hasLink && <a href={p.link} target="_blank" rel="noreferrer" style={linkStyle} onClick={e => e.stopPropagation()}>site ↗</a>}
      {hasLink && (hasRepo || hasDemo) && sep}
      {hasRepo && <a href={p.repo} target="_blank" rel="noreferrer" style={linkStyle} onClick={e => e.stopPropagation()}>gh ↗</a>}
      {hasRepo && hasDemo && sep}
      {hasArtifact && <span style={{ ...linkStyle, cursor: "pointer" }}>▶ demo</span>}
      {!hasArtifact && hasMedia && <a href={p.media} target="_blank" rel="noreferrer" style={linkStyle} onClick={e => e.stopPropagation()}>▶ demo</a>}
    </span>
  );
}
