import { useState, useEffect } from "react";
import { getPublicProjects } from "../lib/db";
import Header from "./Header";
import ProjectTable from "./ProjectTable";

export default function PublicView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublicProjects();
        setProjects(data);
      } catch (err) {
        setError("failed to load: " + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const launched = projects.filter(p => p.status === "launched").length;

  return (
    <div style={S.wrap}>
      <Header projectCount={projects.length} launchedCount={launched} publicCount={projects.length} isPublic={true} />

      {error && <div style={{ color: "var(--red)", fontSize: 11, marginBottom: 10 }}>{error}</div>}

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--dim)", fontSize: 11 }}>loading...</div>
      ) : (
        <ProjectTable projects={projects} isAdmin={false} />
      )}

      <div style={S.footer}>
        <span style={{ color: "var(--green)" }}>▶</span> powered by <span style={{ color: "var(--green)" }}>claude</span>
      </div>
    </div>
  );
}

const S = {
  wrap: { maxWidth: 740, margin: "0 auto", padding: "20px 12px", minHeight: "100vh", boxSizing: "border-box" },
  footer: { fontSize: 10, padding: "16px 0", marginTop: 8, borderTop: "1px solid #131518", color: "var(--dimmer)", textAlign: "center" },
};