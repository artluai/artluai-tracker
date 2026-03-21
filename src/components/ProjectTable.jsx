import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProjectDetail from "./ProjectDetail";
import Links from "./Links";

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 900);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return w;
}

export default function ProjectTable({ projects, isAdmin, onEdit, onDelete, onToggleVis, onReorder }) {
  const [expandedId, setExpandedId] = useState(null);
  const width = useWidth();
  const mobile = width < 640;
  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);
  const dragEnabled = isAdmin && !!onReorder;

  // drag state
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const dragRef = useRef(null);

  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    dragRef.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (idx !== dragRef.current) setOverIdx(idx);
  };

  const handleDragLeave = () => {
    setOverIdx(null);
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    const from = dragRef.current;
    if (from === null || from === idx) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(idx, 0, moved);
    onReorder(reordered);
    setDragIdx(null);
    setOverIdx(null);
    dragRef.current = null;
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
    dragRef.current = null;
  };

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

  const colCount = 5 + (isAdmin ? 2 : 0) + (dragEnabled ? 1 : 0);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {dragEnabled && <th style={{ ...S.th, width: 28, padding: "8px 4px 8px 12px" }}></th>}
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
          {projects.map((p, i) => (
            <DesktopRow key={p.id} p={p} idx={i} isAdmin={isAdmin} expanded={expandedId === p.id}
              onToggle={() => toggle(p.id)} onEdit={() => onEdit?.(p)}
              onDelete={() => onDelete?.(p.id)}
              onToggleVis={() => onToggleVis?.(p.id, p.visibility === "public" ? "private" : "public")}
              dragEnabled={dragEnabled} colCount={colCount}
              isDragging={dragIdx === i} isOver={overIdx === i}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DesktopRow({ p, idx, isAdmin, expanded, onToggle, onEdit, onDelete, onToggleVis, dragEnabled, colCount, isDragging, isOver, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }) {
  const navigate = useNavigate();
  const [nameHover, setNameHover] = useState(false);
  const tags = (p.tags || []).filter(Boolean);

  const handleNameClick = (e) => {
    e.stopPropagation();
    const slug = p.slug || p.id;
    navigate(`/project/${slug}`);
  };

  return (
    <>
      <tr
        style={{ cursor: "pointer", transition: "background 0.1s", opacity: isDragging ? 0.35 : 1, borderTop: isOver ? "2px solid var(--green)" : "none" }}
        onClick={onToggle}
        onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        draggable={dragEnabled}
        onDragStart={dragEnabled ? onDragStart : undefined}
        onDragOver={dragEnabled ? onDragOver : undefined}
        onDragLeave={dragEnabled ? onDragLeave : undefined}
        onDrop={dragEnabled ? onDrop : undefined}
        onDragEnd={dragEnabled ? onDragEnd : undefined}
      >
        {dragEnabled && (
          <td style={{ ...S.td, width: 28, padding: "11px 4px 11px 12px", cursor: "grab" }}>
            <span style={{ fontSize: 13, color: "var(--dimmer)", lineHeight: 1 }}>⠿</span>
          </td>
        )}
        <td style={S.td}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--dimmer)", transition: "transform 0.15s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block", flexShrink: 0, marginTop: 1 }}>▶</span>
            <div>
              <div>
                <span
                  style={{ color: nameHover ? "var(--green)" : "var(--text-bright)", fontWeight: 500, fontSize: 12, cursor: "pointer", transition: "color 0.15s" }}
                  onMouseEnter={() => setNameHover(true)}
                  onMouseLeave={() => setNameHover(false)}
                  onClick={handleNameClick}
                >
                  {p.name}
                  {nameHover && <span style={{ fontSize: 10, color: "var(--green)", marginLeft: 4, opacity: 0.8 }}>↗</span>}
                </span>
              </div>
              {p.desc && <div style={{ color: "#8a8f9a", fontSize: 11, marginTop: 2, lineHeight: 1.5 }}>{p.desc}</div>}
              {tags.length > 0 && <div style={{ fontSize: 10, color: "var(--dimmer)", marginTop: 3 }}>{tags.join(" · ")}</div>}
            </div>
          </div>
        </td>
        <td style={S.td}><span className={`status status-${p.status}`} style={{ whiteSpace: "nowrap" }}>{p.status}</span></td>
        <td style={{ ...S.td, fontSize: 11, color: "var(--dimmer)", lineHeight: 1.5 }}>{(p.stack || []).join(", ") || "—"}</td>
        <td style={{ ...S.td, fontSize: 11, color: "#8a8f9a", whiteSpace: "nowrap" }}>{fmtDate(p.date)}</td>
        <td style={S.td}><Links p={p} /></td>
        {isAdmin && <td style={{ ...S.td, textAlign: "center" }}>
          <button onClick={e => { e.stopPropagation(); onToggleVis(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "2px 6px", lineHeight: 1 }}>
            {p.visibility === "public" ? <span className="vis-public">●</span> : <span className="vis-private">○</span>}
          </button>
        </td>}
        {isAdmin && <td style={{ ...S.td, textAlign: "right" }}>
          <button style={S.opBtn} onClick={e => { e.stopPropagation(); onEdit(); }}>edit</button>
        </td>}
      </tr>
      {expanded && <tr><td colSpan={colCount} style={{ padding: 0 }}><ProjectDetail project={p} isAdmin={isAdmin} /></td></tr>}
    </>
  );
}

function MobileCard({ p, isAdmin, expanded, onToggle, onEdit, onDelete, onToggleVis }) {
  const navigate = useNavigate();
  const tags = (p.tags || []).filter(Boolean);

  const handleNameClick = (e) => {
    e.stopPropagation();
    const slug = p.slug || p.id;
    navigate(`/project/${slug}`);
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden", transition: "border-color 0.15s" }}>
      <div style={{ padding: "12px 14px", cursor: "pointer" }} onClick={onToggle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flex: 1 }}>
            <span style={{ fontSize: 11, color: "var(--dimmer)", transition: "transform 0.15s", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", display: "inline-block", flexShrink: 0, marginTop: 1 }}>▶</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-bright)", cursor: "pointer" }} onClick={handleNameClick}>{p.name}</span>
          </div>
          <span className={`status status-${p.status}`} style={{ flexShrink: 0, marginLeft: 8 }}>{p.status}</span>
        </div>
        {p.desc && <div style={{ fontSize: 11, color: "#8a8f9a", lineHeight: 1.6, paddingLeft: 17 }}>{p.desc}</div>}
        {tags.length > 0 && <div style={{ fontSize: 10, color: "var(--dimmer)", paddingLeft: 17, marginTop: 3 }}>{tags.join(" · ")}</div>}
        <div style={{ fontSize: 11, color: "var(--dimmer)", paddingLeft: 17, marginTop: 10 }}>{(p.stack || []).join(", ") || "—"}</div>
        <div style={{ fontSize: 11, paddingLeft: 17, marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#8a8f9a" }}>{fmtDate(p.date)}</span>
          <Links p={p} />
          {isAdmin && (
            <>
              <span style={{ color: "var(--border)", margin: "0 2px" }}>|</span>
              <button onClick={e => { e.stopPropagation(); onToggleVis(); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>
                {p.visibility === "public" ? <span className="vis-public">●</span> : <span className="vis-private">○</span>}
              </button>
              <button style={S.opBtn} onClick={e => { e.stopPropagation(); onEdit(); }}>edit</button>
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
  th: { fontSize: 9, fontWeight: 400, color: "#444952", textAlign: "left", padding: "8px 12px", letterSpacing: 1.5, textTransform: "uppercase", borderBottom: "1px solid var(--border)" },
  td: { padding: "11px 12px", borderBottom: "1px solid #131518", fontSize: 12, verticalAlign: "middle", transition: "background 0.1s" },
  opBtn: { background: "none", border: "none", color: "var(--dim)", fontFamily: "inherit", fontSize: 10, cursor: "pointer", padding: "2px 5px", transition: "color 0.15s" },
};
