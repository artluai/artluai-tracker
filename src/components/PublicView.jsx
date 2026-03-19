import { useState, useEffect } from "react";
import { getPublicProjects } from "../lib/db";
import Header from "./Header";
import ProjectTable from "./ProjectTable";

function sortByDate(arr) {
  return [...arr].sort((a, b) => {
    const da = new Date(a.date || a.createdAt?.toDate?.() || "2000-01-01");
    const db = new Date(b.date || b.createdAt?.toDate?.() || "2000-01-01");
    return db - da;
  });
}

export default function PublicView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try { const data = await getPublicProjects(); setProjects(data); }
      catch (err) { setError("failed to load: " + err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const sorted = sortByDate(projects);
  const launched = projects.filter(p => p.status === "launched").length;

  return (
    <div style={S.wrap}>
      <Header projectCount={projects.length} launchedCount={launched} publicCount={projects.length} isPublic={true} />
      {error && <div style={{ color: "var(--red)", fontSize: 11, marginBottom: 10 }}>{error}</div>}
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--dim)", fontSize: 11 }}>loading...</div>
      ) : (
        <ProjectTable projects={sorted} isAdmin={false} />
      )}
    </div>
  );
}

const S = {
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "20px 24px", minHeight: "100vh", boxSizing: "border-box" },
};