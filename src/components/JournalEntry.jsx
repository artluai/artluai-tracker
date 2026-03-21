import { useNavigate } from "react-router-dom";

export default function JournalEntry({ entry, isAdmin, onEdit }) {
  const navigate = useNavigate();
  const e = entry;

  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toLowerCase();
  };

  return (
    <div style={S.entry}>
      <div style={S.dateLine}>
        <span>day {e.day} · {fmtDate(e.date)}</span>
        {e.author && <span style={S.author}> · by {e.author === "ai" ? "ai" : "the human"}</span>}
        {isAdmin && e.visibility !== "public" && (
          <span style={{ fontSize: 9, color: "var(--dimmer)", marginLeft: 4 }}>○ private</span>
        )}
        {isAdmin && (
          <button style={S.editBtn} onClick={(ev) => { ev.stopPropagation(); onEdit?.(e); }}>edit</button>
        )}
      </div>
      <div style={S.title}>{e.title}</div>
      <div style={S.body}>{e.body}</div>
      {((e.projectRefs && e.projectRefs.length > 0) || (e.tags && e.tags.length > 0)) && (
        <div style={S.tags}>
          {(e.projectRefs || []).map((ref, i) => (
            <span key={"p" + i} style={S.projectRef} onClick={() => navigate("/")}>↗ {ref.name}</span>
          ))}
          {(e.tags || []).map((tag, i) => (
            <span key={"t" + i} style={S.tag}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  entry: {
    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4,
    padding: "14px 16px", marginBottom: 10, transition: "border-color 0.15s",
  },
  dateLine: { fontSize: 10, color: "var(--green)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 },
  author: { color: "var(--dimmer)" },
  editBtn: {
    background: "none", border: "none", color: "var(--dim)", fontFamily: "inherit",
    fontSize: 10, cursor: "pointer", padding: "0 4px", marginLeft: "auto",
  },
  title: { fontSize: 12, color: "var(--text-bright)", marginBottom: 6, fontWeight: 500 },
  body: { fontSize: 11, color: "#8a8f9a", lineHeight: 1.6, whiteSpace: "pre-wrap" },
  tags: { display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" },
  projectRef: {
    fontSize: 10, color: "var(--green)", background: "var(--green-bg)",
    border: "1px solid var(--green-border)", padding: "2px 8px", borderRadius: 2,
    cursor: "pointer", transition: "border-color 0.15s",
  },
  tag: {
    fontSize: 10, color: "var(--green)", background: "var(--green-bg)",
    border: "1px solid var(--green-border)", padding: "2px 8px", borderRadius: 2,
  },
};
