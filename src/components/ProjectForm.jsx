import { useState, useRef } from "react";

const STATUS_LIST = ["idea", "building", "launched", "abandoned"];
const VIS_LIST = ["private", "public", "gated"];

export default function ProjectForm({ project, onSave, onCancel, onBackdropClose, onDelete }) {
  const [form, setForm] = useState({ ...project });
  const [stackInput, setStackInput] = useState((project.stack || []).join(", "));
  const [shotInput, setShotInput] = useState("");
  const [showFF, setShowFF] = useState(false);
  const [ff, setFf] = useState({ name: "", type: "paste", content: "", url: "", visibility: "private" });
  const [showDanger, setShowDanger] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const formRef = useRef(form);
  formRef.current = form;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, stack: stackInput.split(",").map(s => s.trim()).filter(Boolean) });
  };

  const handleBackdrop = () => {
    if (onBackdropClose) {
      onBackdropClose({ ...formRef.current, stack: stackInput.split(",").map(s => s.trim()).filter(Boolean) });
    } else {
      onCancel();
    }
  };

  const addShot = () => { if (!shotInput.trim()) return; set("screenshots", [...(form.screenshots || []), shotInput.trim()]); setShotInput(""); };
  const rmShot = (i) => set("screenshots", (form.screenshots || []).filter((_, idx) => idx !== i));
  const addFile = () => { if (!ff.name.trim()) return; set("files", [...(form.files || []), { ...ff }]); setFf({ name: "", type: "paste", content: "", url: "", visibility: "private" }); setShowFF(false); };
  const rmFile = (i) => set("files", (form.files || []).filter((_, idx) => idx !== i));
  const updateFV = (i, v) => { const f = [...(form.files || [])]; f[i] = { ...f[i], visibility: v }; set("files", f); };

  const isNew = !project.id;

  return (
    <div style={S.overlay} onClick={handleBackdrop}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalTitle}>{isNew ? "$ add project" : "$ edit project"}</div>
        <div style={S.scroll}>
          <Field label="name"><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="project name" autoFocus /></Field>
          <Field label="short description"><input value={form.desc} onChange={e => set("desc", e.target.value)} placeholder="one-liner" /></Field>
          <Field label="long description" hint="shown in expanded view"><textarea value={form.longDesc || ""} onChange={e => set("longDesc", e.target.value)} placeholder="what it does, why you built it..." /></Field>
          <div style={S.row}>
            <Field label="status"><select value={form.status} onChange={e => set("status", e.target.value)}>{STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}</select></Field>
            <Field label="date"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></Field>
          </div>
          <Field label="stack" hint="comma separated"><input value={stackInput} onChange={e => setStackInput(e.target.value)} placeholder="firebase, netlify, claude" /></Field>
          <Field label="live link"><input value={form.link || ""} onChange={e => set("link", e.target.value)} placeholder="https://mysite.com" /></Field>
          <Field label="embed url" hint="if different from live link — must be iframeable"><input value={form.embed || ""} onChange={e => set("embed", e.target.value)} placeholder="https://mysite.com/tool (leave blank to use live link)" /></Field>
          <Field label="github repo"><input value={form.repo || ""} onChange={e => set("repo", e.target.value)} placeholder="https://github.com/artluai/project" /></Field>
          <Field label="media" hint="youtube, loom, or screen studio url"><input value={form.media || ""} onChange={e => set("media", e.target.value)} placeholder="https://screen.studio/share/..." /></Field>
          <Field label="visibility">
            <div style={S.visRow}>
              {["private", "public"].map(v => (
                <button key={v} style={{ ...S.visBtn, ...(form.visibility === v ? (v === "public" ? S.visPub : S.visPriv) : {}) }} onClick={() => set("visibility", v)}>
                  {v === "private" ? "○" : "●"} {v}
                </button>
              ))}
            </div>
          </Field>
          <Field label="screenshots" hint="paste image urls">
            <div style={S.inlineAdd}>
              <input value={shotInput} onChange={e => setShotInput(e.target.value)} placeholder="https://i.imgur.com/example.png" style={{ flex: 1 }} />
              <button style={S.smallBtn} onClick={addShot}>+ add</button>
            </div>
            {(form.screenshots || []).map((url, i) => (
              <div key={i} style={S.listItem}>
                <span style={{ fontSize: 10, color: "var(--dim)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
                <button style={S.removeBtn} onClick={() => rmShot(i)}>×</button>
              </div>
            ))}
          </Field>
          <Field label="files" hint="each with its own visibility">
            {(form.files || []).map((f, i) => (
              <div key={i} style={S.fileItem}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "var(--text-bright)" }}>{f.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <select value={f.visibility} onChange={e => updateFV(i, e.target.value)} style={{ width: "auto", fontSize: 10, padding: "2px 6px" }}>
                      {VIS_LIST.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button style={S.removeBtn} onClick={() => rmFile(i)}>×</button>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "var(--dim)", marginTop: 2 }}>{f.type === "link" ? f.url : `${(f.content || "").length} chars`}</div>
              </div>
            ))}
            {!showFF ? (
              <button style={S.smallBtn} onClick={() => setShowFF(true)}>+ add file</button>
            ) : (
              <div style={S.fileForm}>
                <input value={ff.name} onChange={e => setFf(f => ({ ...f, name: e.target.value }))} placeholder="filename (e.g. setup-guide.md)" />
                <div style={S.row}>
                  <Field label="type"><select value={ff.type} onChange={e => setFf(f => ({ ...f, type: e.target.value }))}><option value="paste">paste content</option><option value="link">external link</option></select></Field>
                  <Field label="visibility"><select value={ff.visibility} onChange={e => setFf(f => ({ ...f, visibility: e.target.value }))}>{VIS_LIST.map(v => <option key={v} value={v}>{v}</option>)}</select></Field>
                </div>
                {ff.type === "paste"
                  ? <textarea value={ff.content} onChange={e => setFf(f => ({ ...f, content: e.target.value }))} placeholder="paste file content here..." />
                  : <input value={ff.url} onChange={e => setFf(f => ({ ...f, url: e.target.value }))} placeholder="https://drive.google.com/..." />
                }
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={S.smallBtn} onClick={addFile}>save file</button>
                  <button style={{ ...S.smallBtn, color: "var(--dim)", borderColor: "var(--border)", background: "none" }} onClick={() => setShowFF(false)}>cancel</button>
                </div>
              </div>
            )}
          </Field>
        </div>
        <div style={S.btnRow}>
          <button style={S.cancelBtn} onClick={onCancel}>cancel</button>
          <button style={S.saveBtn} onClick={handleSave}>save</button>
        </div>
        {onDelete && project.id && (
          <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <button onClick={() => setShowDanger(!showDanger)} style={{ background: "none", border: "none", fontFamily: "inherit", fontSize: 11, color: "#5a2020", cursor: "pointer", padding: 0 }}>
              {showDanger ? "v" : ">"} danger zone
            </button>
            {showDanger && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 8 }}>type "{project.name}" to confirm deletion</div>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={project.name} style={{ marginBottom: 8 }} />
                <button
                  onClick={() => { if (deleteConfirm === project.name) onDelete(project.id); }}
                  style={{ ...S.cancelBtn, background: deleteConfirm === project.name ? "#2a1010" : "none", borderColor: deleteConfirm === project.name ? "#3d1818" : "var(--border)", color: deleteConfirm === project.name ? "#f87171" : "#3a3f48", width: "100%", textAlign: "center", cursor: deleteConfirm === project.name ? "pointer" : "default" }}
                >delete project</button>
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
  visRow: { display: "flex", gap: 8 },
  visBtn: { flex: 1, background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--dim)", fontFamily: "inherit", fontSize: 11, padding: "5px 12px", cursor: "pointer" },
  visPriv: { borderColor: "var(--border-hover)", color: "var(--text)", background: "#111215" },
  visPub: { borderColor: "var(--green-border)", color: "var(--green)", background: "var(--green-bg)" },
  inlineAdd: { display: "flex", gap: 6, marginBottom: 6 },
  listItem: { display: "flex", alignItems: "center", padding: "6px 8px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 3, marginBottom: 4 },
  fileItem: { padding: "8px 10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 3, marginBottom: 4 },
  fileForm: { padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, display: "flex", flexDirection: "column", gap: 8 },
  smallBtn: { background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)", fontFamily: "inherit", fontSize: 10, padding: "4px 10px", borderRadius: 3, cursor: "pointer", flexShrink: 0 },
  removeBtn: { background: "none", border: "none", color: "var(--red)", fontSize: 14, cursor: "pointer", padding: "0 4px", flexShrink: 0 },
  btnRow: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16, flexShrink: 0 },
  cancelBtn: { background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--dim)", fontFamily: "inherit", fontSize: 11, padding: "6px 14px", cursor: "pointer" },
  saveBtn: { background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 3, color: "var(--green)", fontFamily: "inherit", fontSize: 11, padding: "6px 16px", cursor: "pointer", fontWeight: 500 },
};