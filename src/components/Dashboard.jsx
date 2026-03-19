import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { getAllProjects, addProject, updateProject, deleteProject, newProject } from "../lib/db";
import Header from "./Header";
import ProjectTable from "./ProjectTable";
import ProjectForm from "./ProjectForm";

function sortByDate(arr) {
  return [...arr].sort((a, b) => {
    const da = new Date(a.date || a.createdAt?.toDate?.() || "2000-01-01");
    const db = new Date(b.date || b.createdAt?.toDate?.() || "2000-01-01");
    return db - da;
  });
}

export default function Dashboard() {
  const { user, login, isAdmin, loading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formProject, setFormProject] = useState(null);
  const [delId, setDelId] = useState(null);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(null);

  const load = async () => {
    try { setLoadingData(true); const data = await getAllProjects(); setProjects(data); }
    catch (err) { setError("failed to load: " + err.message); }
    finally { setLoadingData(false); }
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleSave = async (data) => {
    try {
      if (data.id) { const { id, ...rest } = data; await updateProject(id, rest); }
      else { await addProject(data); }
      setFormProject(null);
      setDraft(null);
      await load();
    } catch (err) { setError("save failed: " + err.message); }
  };

  const handleCancel = () => { setFormProject(null); setDraft(null); };

  const handleBackdropClose = (data) => {
    if (data.name?.trim()) setDraft(data);
    setFormProject(null);
  };

  const openAdd = () => {
    if (draft && draft.name) setFormProject(draft);
    else setFormProject(newProject());
  };

  const handleDelete = async () => {
    try { await deleteProject(delId); setDelId(null); await load(); }
    catch (err) { setError("delete failed: " + err.message); }
  };

  const handleToggleVis = async (id, newVis) => {
    try { await updateProject(id, { visibility: newVis }); await load(); }
    catch (err) { setError("update failed: " + err.message); }
  };

  const sorted = sortByDate(projects);
  const launched = projects.filter(p => p.status === "launched").length;
  const pubCount = projects.filter(p => p.visibility === "public").length;

  if (loading) return <Shell><Loading /></Shell>;
  if (!user) return (
    <Shell>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 14, color: "var(--text-bright)", marginBottom: 8 }}>$ access denied</div>
        <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 20 }}>sign in to access the dashboard</div>
        <button onClick={login} style={S.loginBtn}>sign in with google</button>
      </div>
    </Shell>
  );
  if (!isAdmin) return (
    <Shell>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 14, color: "var(--red)", marginBottom: 8 }}>$ permission denied</div>
        <div style={{ fontSize: 11, color: "var(--dim)" }}>this account does not have admin access</div>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <Header projectCount={projects.length} launchedCount={launched} publicCount={pubCount} isPublic={false} />
      {error && (
        <div style={S.error}>
          <span>{error}</span>
          <button style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer" }} onClick={() => setError(null)}>×</button>
        </div>
      )}
      <div style={S.toolbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--green)" }}>dashboard</span>
          {draft && <span style={{ fontSize: 9, color: "var(--yellow)" }}>draft saved</span>}
        </div>
        <button style={S.addBtn} onClick={openAdd}>+ add</button>
      </div>
      {loadingData ? <Loading /> : (
        <ProjectTable projects={sorted} isAdmin={true} onEdit={(p) => setFormProject(p)} onDelete={(id) => setDelId(id)} onToggleVis={handleToggleVis} />
      )}
      <div style={S.footer}>click ● / ○ to toggle visibility · click a row to expand details</div>

      {delId && (
        <div style={S.overlay} onClick={() => setDelId(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 13, color: "var(--red)", fontWeight: 500, marginBottom: 10 }}>$ rm project</div>
            <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 18 }}>delete "{projects.find(p => p.id === delId)?.name}"?</div>
            <div style={S.btnRow}>
              <button style={S.cancelBtn} onClick={() => setDelId(null)}>cancel</button>
              <button style={S.delBtn} onClick={handleDelete}>delete</button>
            </div>
          </div>
        </div>
      )}
      {formProject && <ProjectForm project={formProject} onSave={handleSave} onCancel={handleCancel} onBackdropClose={handleBackdropClose} />}
    </Shell>
  );
}

function Shell({ children }) { return <div style={S.wrap}>{children}</div>; }
function Loading() { return <div style={{ padding: "40px 0", textAlign: "center", color: "var(--dim)", fontSize: 11 }}>loading...</div>; }

const S = {
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "20px 24px", minHeight: "100vh", boxSizing: "border-box" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "7px 0", marginBottom: 10 },
  addBtn: { background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)", fontFamily: "inherit", fontSize: 11, padding: "4px 12px", borderRadius: 3, cursor: "pointer" },
  footer: { fontSize: 10, padding: "10px 0", marginTop: 4, borderTop: "1px solid #131518", color: "var(--dimmer)" },
  error: { background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 4, padding: "8px 12px", marginBottom: 10, fontSize: 11, color: "var(--red)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  loginBtn: { background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)", fontFamily: "inherit", fontSize: 12, padding: "8px 20px", borderRadius: 4, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  modal: { background: "#0e0f12", border: "1px solid var(--border)", borderRadius: 6, padding: "20px 22px", width: "100%", maxWidth: 420 },
  btnRow: { display: "flex", justifyContent: "flex-end", gap: 8 },
  cancelBtn: { background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--dim)", fontFamily: "inherit", fontSize: 11, padding: "6px 14px", cursor: "pointer" },
  delBtn: { background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 3, color: "var(--red)", fontFamily: "inherit", fontSize: 11, padding: "6px 16px", cursor: "pointer", fontWeight: 500 },
};