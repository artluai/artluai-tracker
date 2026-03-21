import { useState, useEffect } from "react";
import { getPublicProjects } from "../lib/db";
import Header from "./Header";
import ProjectTable from "./ProjectTable";

function sortProjects(arr) {
  return [...arr].sort((a, b) => {
    const da = new Date(a.date || a.createdAt?.toDate?.() || "2000-01-01");
    const db = new Date(b.date || b.createdAt?.toDate?.() || "2000-01-01");
    if (db - da !== 0) return db - da;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
}

export default function PublicView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState("all");

  useEffect(() => {
    (async () => {
      try { const data = await getPublicProjects(); setProjects(data); }
      catch (err) { setError("failed to load: " + err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const sorted = sortProjects(projects);

  // extract unique tags from all projects
  const allTags = [...new Set(sorted.flatMap(p => (p.tags || []).filter(Boolean)))].sort();

  const filtered = activeTag === "all"
    ? sorted
    : sorted.filter(p => (p.tags || []).includes(activeTag));

  const launched = projects.filter(p => p.status === "launched").length;

  return (
    <div style={S.wrap}>
      <Header projectCount={projects.length} launchedCount={launched} publicCount={projects.length} isPublic={true} />
      {error && <div style={{ color: "var(--red)", fontSize: 11, marginBottom: 10 }}>{error}</div>}

      {allTags.length > 0 && !loading && (
        <div style={S.filterBar}>
          <span style={S.filterLabel}>filter:</span>
          <button
            style={activeTag === "all" ? S.filterBtnActive : S.filterBtn}
            onClick={() => setActiveTag("all")}
          >all</button>
          {allTags.map(tag => (
            <button
              key={tag}
              style={activeTag === tag ? S.filterBtnActive : S.filterBtn}
              onClick={() => setActiveTag(tag)}
            >{tag}</button>
          ))}
          <span style={S.filterCount}>{filtered.length} project{filtered.length === 1 ? "" : "s"}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--dim)", fontSize: 11 }}>loading...</div>
      ) : (
        <ProjectTable projects={filtered} isAdmin={false} />
      )}
    </div>
  );
}

const S = {
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "48px 24px 20px", minHeight: "100vh", boxSizing: "border-box" },
  filterBar: {
    display: "flex", alignItems: "center", gap: 6,
    marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)",
    flexWrap: "wrap",
  },
  filterLabel: { fontSize: 10, color: "var(--dimmer)" },
  filterBtn: {
    background: "none", border: "1px solid var(--border)", borderRadius: 3,
    color: "var(--dim)", fontFamily: "inherit", fontSize: 10,
    padding: "2px 10px", cursor: "pointer", transition: "all 0.15s",
  },
  filterBtnActive: {
    background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 3,
    color: "var(--green)", fontFamily: "inherit", fontSize: 10,
    padding: "2px 10px", cursor: "pointer",
  },
  filterCount: { fontSize: 10, color: "var(--dimmer)", marginLeft: 4 },
};
