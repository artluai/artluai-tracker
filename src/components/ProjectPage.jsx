import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectBySlug } from "../lib/db";
import { useAuth } from "../lib/auth";
import EmbedFrame from "./EmbedFrame";
import FileBrowser from "./FileBrowser";

const START_DATE = "2026-03-18";

function dayNum(dateStr) {
  if (!dateStr) return null;
  const start = new Date(START_DATE + "T00:00:00");
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.floor((d - start) / 86400000) + 1;
  return diff >= 1 ? diff : null;
}

function isEmbeddable(url) {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    const EMBEDDABLE = ["netlify.app", "vercel.app", "github.io", "pages.dev", "netlify.com", "render.com", "railway.app", "fly.dev", "surge.sh"];
    const NOT_EMBEDDABLE = ["github.com", "youtube.com", "youtu.be", "loom.com", "screen.studio", "twitter.com", "x.com", "linkedin.com", "notion.so", "drive.google.com", "docs.google.com"];
    if (NOT_EMBEDDABLE.some(d => hostname.includes(d))) return false;
    if (EMBEDDABLE.some(d => hostname.includes(d))) return true;
    return false;
  } catch { return false; }
}

function isVideoEmbed(u) {
  return u.includes("youtube.com") || u.includes("youtu.be") || u.includes("loom.com");
}

function toEmbed(u) {
  if (u.includes("youtube.com/watch")) return `https://www.youtube.com/embed/${new URL(u).searchParams.get("v")}`;
  if (u.includes("youtu.be/")) return `https://www.youtube.com/embed/${u.split("youtu.be/")[1]?.split("?")[0]}`;
  if (u.includes("loom.com/share/")) return `https://www.loom.com/embed/${u.split("loom.com/share/")[1]?.split("?")[0]}`;
  if (u.includes("screen.studio/share/")) return `https://screen.studio/embed/${u.split("screen.studio/share/")[1]?.split("?")[0]}`;
  return u;
}

function fmtDateFull(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toLowerCase();
}

export default function ProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const p = await getProjectBySlug(slug);
        if (!p) { setError("project not found"); return; }
        setProject(p);
      } catch (err) {
        setError("failed to load: " + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <Shell><div style={{ padding: "40px 0", textAlign: "center", color: "var(--dim)", fontSize: 11 }}>loading...</div></Shell>;
  if (error) return (
    <Shell>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 14, color: "var(--red)", marginBottom: 8 }}>$ {error}</div>
        <button onClick={() => navigate("/")} style={S.backBtn}>← all projects</button>
      </div>
    </Shell>
  );
  if (!project) return null;

  const p = project;
  const files = isAdmin ? (p.files || []) : (p.files || []).filter(f => f.visibility === "public");
  const shots = p.screenshots || [];
  const tags = (p.tags || []).filter(Boolean);
  const embedUrl = isEmbeddable(p.link) ? p.link : null;
  const hasEmbed = !!embedUrl;
  const hasRepo = !!p.repo?.trim();
  const hasInfo = p.longDesc?.trim() || p.media?.trim() || shots.length || files.length;
  const day = dayNum(p.date);

  return <Shell><ProjectPageInner p={p} files={files} shots={shots} tags={tags} embedUrl={embedUrl} hasEmbed={hasEmbed} hasRepo={hasRepo} hasInfo={hasInfo} day={day} isAdmin={isAdmin} navigate={navigate} /></Shell>;
}

function ProjectPageInner({ p, files, shots, tags, embedUrl, hasEmbed, hasRepo, hasInfo, day, isAdmin, navigate }) {
  const defaultTab = hasEmbed ? "demo" : "info";
  const [tab, setTab] = useState(defaultTab);

  const tabs = [
    { id: "info", label: "info" },
    ...(hasEmbed ? [{ id: "demo", label: "live demo" }] : []),
    ...(hasRepo ? [{ id: "files", label: "files" }] : []),
  ];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: "var(--text-bright)", letterSpacing: -0.5, cursor: "pointer" }} onClick={() => navigate("/")}>artlu.ai</span>
          <span className="cursor" />
        </div>
        <button onClick={() => navigate("/")} style={S.navBtn}>projects</button>
      </div>

      <button onClick={() => navigate("/")} style={S.backBtn}>← all projects</button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-bright)", letterSpacing: -0.3 }}>{p.name}</span>
        <span className={`status status-${p.status}`} style={{ flexShrink: 0, marginTop: 3 }}>{p.status}</span>
      </div>

      <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 8 }}>
        {day && <>day <span style={{ color: "var(--green)" }}>{day}</span> · </>}
        {fmtDateFull(p.date)}
      </div>

      {tags.length > 0 && (
        <div style={{ fontSize: 10, color: "var(--dimmer)", marginBottom: 14 }}>{tags.join(" · ")}</div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {p.link?.trim() && (
          <a href={p.link} target="_blank" rel="noreferrer" style={S.linkPill}>site ↗</a>
        )}
        {p.repo?.trim() && (
          <a href={p.repo} target="_blank" rel="noreferrer" style={S.linkPill}>github ↗</a>
        )}
        {p.media?.trim() && (
          p.media.includes("screen.studio")
            ? <a href={p.media} target="_blank" rel="noreferrer" style={S.linkPill}>▶ demo</a>
            : <span style={{ ...S.linkPill, cursor: "default" }}>▶ demo</span>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--border)", marginBottom: 14 }} />

      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t.id} style={{ ...S.tab, ...(tab === t.id ? S.tabActive : {}) }} onClick={() => setTab(t.id)}>
            {tab === t.id && <span style={S.tabDot} />}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div>
          {p.longDesc?.trim() && (
            <Sec label="description">
              <div style={{ fontSize: 12, color: "#8a8f9a", lineHeight: 1.7, whiteSpace: "pre-wrap", maxWidth: 700 }}>{p.longDesc}</div>
            </Sec>
          )}
          {(p.stack || []).length > 0 && (
            <Sec label="stack">
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {p.stack.map((s, i) => (
                  <span key={i} style={{ fontSize: 10, color: "var(--dimmer)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 2 }}>{s}</span>
                ))}
              </div>
            </Sec>
          )}
          {p.media?.trim() && (
            <Sec label="media">
              {isVideoEmbed(p.media) ? (
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, maxWidth: 560, borderRadius: 4, overflow: "hidden", border: "1px solid var(--border)" }}>
                  <iframe src={toEmbed(p.media)} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Project video" />
                </div>
              ) : (
                <a href={p.media} target="_blank" rel="noreferrer" style={{ fontSize: 11 }}>▶ {p.media}</a>
              )}
            </Sec>
          )}
          {shots.length > 0 && (
            <Sec label="screenshots">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {shots.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="" style={{ width: "100%", maxWidth: "40%", borderRadius: 4, border: "1px solid var(--border)", display: "block" }} />
                  </a>
                ))}
              </div>
            </Sec>
          )}
          {files.length > 0 && (
            <Sec label="files">
              {files.map((f, i) => (
                <div key={i} style={S.fileRow}>
                  <div style={{ fontSize: 11, marginBottom: 6, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                    <span style={{ color: "var(--text-bright)" }}>{f.name}</span>
                    {isAdmin && <span style={{ fontSize: 9 }} className={`vis-${f.visibility}`}>[{f.visibility}]</span>}
                    {f.visibility === "gated" && !isAdmin && <span style={{ fontSize: 9, color: "var(--yellow)" }}>locked</span>}
                  </div>
                  {f.type === "link"
                    ? <a href={f.url} target="_blank" rel="noreferrer" style={{ fontSize: 10 }}>{f.url} ↗</a>
                    : f.visibility === "gated" && !isAdmin
                      ? <div style={{ fontSize: 10, color: "var(--dimmer)" }}>content locked</div>
                      : <pre style={S.fileContent}>{f.content}</pre>
                  }
                </div>
              ))}
            </Sec>
          )}
        </div>
      )}

      {tab === "demo" && (
        <div style={{ marginBottom: 16 }}>
          <EmbedFrame url={embedUrl} height={p.embedHeight || 600} />
        </div>
      )}

      {tab === "files" && (
        <FileBrowser repo={p.repo} />
      )}
    </>
  );
}

function Sec({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: "var(--dim)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function Shell({ children }) {
  return <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 20px", minHeight: "100vh", boxSizing: "border-box" }}>{children}</div>;
}

const S = {
  backBtn: { fontFamily: "inherit", background: "none", border: "none", color: "var(--green)", fontSize: 11, cursor: "pointer", padding: 0, marginBottom: 14, opacity: 0.8, display: "block" },
  navBtn: { background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--dim)", fontSize: 10, padding: "3px 10px", fontFamily: "inherit", cursor: "pointer" },
  linkPill: { fontSize: 10, color: "var(--green)", textDecoration: "none", opacity: 0.8, border: "1px solid var(--green-border)", background: "var(--green-bg)", padding: "3px 10px", borderRadius: 2 },
  tab: {
    fontFamily: "inherit", fontSize: 10, letterSpacing: "0.05em", color: "var(--dim)",
    padding: "7px 12px 6px", background: "none", border: "none",
    borderBottom: "2px solid transparent", cursor: "pointer",
    display: "flex", alignItems: "center", gap: 5, transition: "color 0.15s",
  },
  tabActive: { color: "var(--green)", borderBottom: "2px solid var(--green)" },
  tabDot: { width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" },
  fileRow: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: "10px 12px", marginBottom: 6 },
  fileContent: { fontSize: 11, color: "var(--text)", background: "var(--bg)", padding: "8px 10px", borderRadius: 3, overflow: "auto", maxHeight: 200, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, lineHeight: 1.5 },
};
