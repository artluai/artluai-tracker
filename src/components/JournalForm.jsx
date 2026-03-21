import { useState, useEffect } from "react";
import { getPublicProjects } from "../lib/db";

const AUTHOR_LIST = ["ai", "human"];

export default function JournalForm({ entry, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState({ ...entry });
  const [tagInput, setTagInput] = useState((entry.tags || []).join(", "));
  const [projects, setProjects] = useState([]);
  const [showDanger, setShowDanger] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    getPublicProjects().then(setProjects).catch(() => {});
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      tags: tagInput.split(",").map(s => s.trim()).filter(Boolean),
    });
  };

  const addProjectRef = (p) => {
    const existing = form.projectRefs || [];
    if (existing.some(r => r.id === p.id)) return;
    set("projectRefs", [...existing, { id: p.id, name: p.name }]);
  };

  const removeProjectRef = (id) => {
    set("projectRefs", (form.projectRefs || []).filter(r => r.id !== id));
  };

  const isNew = !entry.id;

  return (
    <div style={S.overlay} onClick={onCancel}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalTitle}>{isNew ? "$ add journal entry" : "$ edit journal entry"}</div>
        <div style={S.scroll}>
          <Field label="title">
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="entry title" autoFocus />
          </Field>
          <Field label="body" hint="plain text, line breaks preserved">
            <textarea value={form.body || ""} onChange={e => set("body", e.target.value)} placeholder="what happened, what was hard, what worked..." style={{ minHeight: 160 }} />
          </Field>
          <div style={S.row}>
            <Field label="day">
              <input type="number" value={form.day} onChange={e => set("day", parseInt(e.target.value) || 1)} min={1} max={100} style={{ width: 80 }} />
            </Field>
            <Field label="date">
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </Field>
            <Field label="author">
              <select value={form.author} onChange={e => set("author", e.target.value)}>
                {AUTHOR_LIST.map(a => <option key={a} value={a}>{a === "ai" ? "ai" : "the human"}</option>)}
              </select>
            </Field>
          </div>
          <Field label="visibility">
            <div style={S.visRow}>
              {["private", "public"].map(v => (
                <button key={v} style={{ ...S.visBtn, ...(form.visibility === v ? (v === "public" ? S.visPub : S.visPriv) : {}) }} onClick={() => set("visibility", v)}>
                  {v === "private" ? "○" : "●"} {v}
                </button>
              ))}
            </div>
          </Field>
          <Field label="tags" hint="comma separated">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="build log, reflection, tutorial" />
          </Field>
          <Field label="linked projects" hint="select projects this entry references">
            <div style={{ marginBottom: 6 }}>
              {(form.projectRefs || []).map((ref, i) => (
                <div key={i} style={S.refItem}>
                  <span style={{ fontSize: 11, color: "var(--green)" }}>↗ {ref.name}</span>
                  <button style={S.removeBtn} onClick={() => removeProjectRef(ref.id)}>×</button>
                </div>
              ))}
            </div>
            {projects.length > 0 && (
              <select
                value=""
                onChange={e => {
                  const p = projects.find(p => p.id === e.target.value);
                  if (p) addProjectRef(p);
                }}
                style={{ fontSize: 11 }}
              >
                <option value="">+ link a project...</option>
                {projects
                  .filter(p => !(form.projectRefs || []).some(r => r.id === p.id))
                  .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                }
              </select>
            )}
          </Field>
        </div>
        <div style={S.btnRow}>
          <button style={S.cancelBtn} onClick={onCancel}>cancel</button>
          <button style={S.saveBtn} onClick={handleSave}>save</button>
        </div>
        {onDelete && entry.id && (
          <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <button onClick={() => setShowDanger(!showDanger)} style={{ background: "none", border: "none", fontFamily: "inherit", fontSize: 11, color: "#5a2020", cursor: "pointer", padding: 0 }}>
              {showDanger ? "v" : ">"} danger zone
            </button>
            {showDanger && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 8 }}>type "{entry.title}" to confirm deletion</div>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={entry.title} style={{ marginBottom: 8 }} />
                <button
                  onClick={() => { if (deleteConfirm === entry.title) onDelete(entry.id); }}
                  style={{
                    ...S.cancelBtn,
                    background: deleteConfirm === entry.title ? "#2a1010" : "none",
                    borderColor: deleteConfirm === entry.title ? "#3d1818" : "var(--border)",
                    color: deleteConfirm === entry.title ? "#f87171" : "#3a3f48",
                    width: "100%", textAlign: "center",
                    cursor: deleteConfirm === entry.title ? "pointer" : "default",
                  }}
                >delete entry</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 12, flex: 1 }}>
      <label style={S.label}>{label}{hint && <span style={S.hint}> ({hint})</span>}</label>
      {children}
    </div>
  );
}

const S = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  modal: { background: "#0e0f12", border: "1px solid var(--border)", borderRadius: 6, padding: "20px 22px", width: "100%", maxWidth: 520, maxHeight: "90vh", display: "flex", flexDirection: "column" },
  modalTitle: { fontSize: 13, color: "var(--green)", fontWeight: 500, marginBottom: 16, flexShrink: 0 },
  scroll: { flex: 1, overflowY: "auto", paddingRight: 4 },
  row: { display: "flex", gap: 12 },
  label: { display: "block", fontSize: 10, color: "var(--dim)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 },
  hint: { textTransform: "none", letterSpacing: 0, color: "var(--dimmer)" },
  refItem: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 3, marginBottom: 4 },
  removeBtn: { background: "none", border: "none", color: "var(--red)", fontSize: 14, cursor: "pointer", padding: "0 4px", flexShrink: 0 },
  visRow: { display: "flex", gap: 8 },
  visBtn: { flex: 1, background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--dim)", fontFamily: "inherit", fontSize: 11, padding: "5px 12px", cursor: "pointer" },
  visPriv: { borderColor: "var(--border-hover)", color: "var(--text)", background: "#111215" },
  visPub: { borderColor: "var(--green-border)", color: "var(--green)", background: "var(--green-bg)" },
  btnRow: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16, flexShrink: 0 },
  cancelBtn: { background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--dim)", fontFamily: "inherit", fontSize: 11, padding: "6px 14px", cursor: "pointer" },
  saveBtn: { background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 3, color: "var(--green)", fontFamily: "inherit", fontSize: 11, padding: "6px 16px", cursor: "pointer", fontWeight: 500 },
};
