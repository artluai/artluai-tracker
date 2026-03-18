import { useState, useEffect } from "react";
import ProjectDetail from "./ProjectDetail";
import Links from "./Links";

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 900);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return w;
}

export default function ProjectTable({ projects, isAdmin, onEdit, onDelete, onToggleVis }) {
  const [expandedId, setExpandedId] = useState(null);
  const width = useWidth();
  const mobile = width < 640;
  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  if (projects.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--dimmer)", fontSize: 11 }}>
        {isAdmin ? "no projects yet — hit + add" : "no public projects yet"}
      </div>
    );
  }

  if (mobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {projects.map(p => (
          <MobileCard key={p.id} p={p} isAdmin={isAdmin} expanded={expandedId === p.id}
            onToggle={() => toggle(p.id)} onEdit={() => onEdit?.(p)}
            onDelete={() => onDelete?.(p.id)}
            onToggleVis={() => onToggleVis?.(p.id, p.visibility === "public" ? "private" : "public")} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={S.th}>project</th>
            <th style={S.th}>status</th>
            <th style={S.th}>stack</th>
            <th style={S.th}>date</th>
            <th style={S.th}>links</th>
            {isAdmin && <th style={{ ...S.th, textAlign: "center", width: 44 }}>vis</th>}
            {isAdmin && <th style={{ ...S.th, textAlign: "right", width: 56 }}>ops</th>}
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <DesktopRow key={p.id} p={p} isAdmin={isAdmin} expanded={expandedId === p.id}
              onToggle={() => toggle(p.id)} onEdit={() => onEdit?.(p)}
              onDelete={() => onDelete?.(p.id)}
              onToggleVis={() => onToggleVis?.(p.id, p.visibility === "public" ? "private" : "public")} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DesktopRow({ p, isAdmin, expanded, onToggle, onEdit, onDelete, onToggleVis }) {
  const colSpan = isAdmin ? 7 : 5;
  return (
    <>
      <tr style={{ cursor: "pointer", transition: "background 0.1s" }} onClick={onToggle}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <td style={{ ...S.td, minWidth: 150 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "var(--dimmer)", transition: "transform 0.15s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }}>▶</span>
            <div>
              <div style={{ color: "var(--text-bright)", fontWeight: 500, fontSize: 12 }}>{p.name}</div>
              {p.desc && <div style={{ color: "var(--dim)", fontSize: 10, marginTop: 2 }}>{p.desc}</div>}
            </div>
          </div>
        </td>
        <td style={S.td}><span className={`status status-${p.status}`}>{p.status}</span></td>
        <td style={S.td}><span style={{ fontSize: 10, color: "var(--dim)" }}>{(p.stack || []).join(", ") || "—"}</span></td>
        <td style={S.td}><span style={{ fontSize: 10, color: "var(--dim)" }}>{fmtDate(p.date)}</span></td>
        <td style={S.td}><Links p={p} /></td>
        {isAdmin && <td style={{ ...S.td, textAlign: "center" }}>
          <button onClick={e => { e.stopPropagation(); onToggleVis(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 6px", lineHeight: 1 }}>
            {p.visibility === "public" ? <span className="vis-public">●</span> : <span className="vis-private">○</span>}
          </button>
        </td>}
        {isAdmin && <td style={{ ...S.td, textAlign: "right" }}>
          <button style={S.opBtn} onClick={e => { e.stopPropagation(); onEdit(); }}>edit</button>
          <button style={{ ...S.opBtn, color: "#5a2020" }} onClick={e => { e.stopPropagation(); onDelete(); }}>×</button>
        </td>}
      </tr>
      {expanded && <tr><td colSpan={colSpan} style={{ padding: 0 }}><ProjectDetail project={p} isAdmin={isAdmin} /></td></tr>}
    </>
  );
}

function MobileCard({ p, isAdmin, expanded, onToggle, onEdit, onDelete, onToggleVis }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden", transition: "border-color 0.15s" }}>
      <div style={{ padding: "12px 14px", cursor: "pointer" }} onClick={onToggle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "var(--dimmer)", transition: "transform 0.15s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block" }}>▶</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-bright)" }}>{p.name}</span>
          </div>
          <span className={`status status-${p.status}`}>{p.status}</span>
        </div>
        {p.desc && <div style={{ fontSize: 10, color: "var(--dim)", marginBottom: 8, paddingLeft: 16 }}>{p.desc}</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 10, color: "var(--dim)", paddingLeft: 16 }}>
          <span>{(p.stack || []).join(", ") || "—"}</span>
          <span style={{ color: "var(--dimmer)" }}>|</span>
          <span>{fmtDate(p.date)}</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8, paddingLeft: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Links p={p} />
          {isAdmin && (
            <>
              <span style={{ color: "var(--border)", margin: "0 2px" }}>|</span>
              <button onClick={e => { e.stopPropagation(); onToggleVis(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>
                {p.visibility === "public" ? <span className="vis-public">●</span> : <span className="vis-private">○</span>}
              </button>
              <button style={S.opBtn} onClick={e => { e.stopPropagation(); onEdit(); }}>edit</button>
              <button style={{ ...S.opBtn, color: "#5a2020" }} onClick={e => { e.stopPropagation(); onDelete(); }}>×</button>
            </>
          )}
        </div>
      </div>
      {expanded && <ProjectDetail project={p} isAdmin={isAdmin} />}
    </div>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase();
}

const S = {
  th: { fontSize: 9, fontWeight: 400, color: "#444952", textAlign: "left", padding: "8px 10px", letterSpacing: 1.5, textTransform: "uppercase", borderBottom: "1px solid var(--border)" },
  td: { padding: "10px 10px", borderBottom: "1px solid #131518", fontSize: 12, verticalAlign: "middle" },
  opBtn: { background: "none", border: "none", color: "var(--dim)", fontFamily: "inherit", fontSize: 10, cursor: "pointer", padding: "2px 5px", transition: "color 0.15s" },
};