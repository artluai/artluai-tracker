import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { useNavigate, useLocation } from "react-router-dom";

const START_DATE = "2026-03-18";

function dayNum() {
  const start = new Date(START_DATE + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.max(1, Math.min(Math.floor((now - start) / 86400000) + 1, 100));
}

export default function Header({ projectCount, launchedCount, publicCount, isPublic }) {
  const { user, login, logout, isAdmin } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname === "/admin";
  const isJournalPage = location.pathname.startsWith("/journal");
  const day = dayNum();
  const toGo = Math.max(0, 100 - projectCount);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 500, color: "var(--text-bright)", letterSpacing: -0.5 }}>artlu.ai</span>
          <span className="cursor" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => navigate("/journal")} style={isJournalPage ? S.navBtnActive : S.navBtn}>journal</button>
          {isAdminPage ? (
            <button onClick={() => navigate("/")} style={S.navBtn}>public view</button>
          ) : isJournalPage ? (
            <button onClick={() => navigate("/")} style={S.navBtn}>projects</button>
          ) : (
            isAdmin && <button onClick={() => navigate("/admin")} style={S.navBtn}>dashboard</button>
          )}
          <button
            onClick={toggle}
            style={S.themeBtn}
            title={theme === "light" ? "switch to dark" : "switch to light"}
            aria-label="toggle theme"
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
          {user ? (
            <button onClick={logout} style={S.authBtn}>logout</button>
          ) : (
            <button onClick={login} style={S.authBtn}>sign in</button>
          )}
        </div>
      </div>

      {/* Public-view hero lives in PublicView now. Header still renders the
          compact one-line counter on admin/journal pages. */}
      {!isPublic && (
        <div style={{ fontSize: 11, marginTop: 5, fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "var(--dim)" }}>$ day </span><span style={{ color: "var(--green)" }}>{day}</span>
          <span style={{ color: "var(--dim)" }}>/100 · tracking </span><span style={{ color: "var(--green)" }}>{projectCount}</span>
          <span style={{ color: "var(--dim)" }}> projects · </span><span style={{ color: "var(--green)" }}>{launchedCount}</span>
          <span style={{ color: "var(--dim)" }}> launched · </span><span style={{ color: "var(--green)" }}>{publicCount}</span>
          <span style={{ color: "var(--dim)" }}> public · </span><span style={{ color: "var(--green)" }}>{toGo}</span>
          <span style={{ color: "var(--dim)" }}> to go</span>
        </div>
      )}
    </div>
  );
}

const S = {
  navBtn:       { fontFamily: "inherit", background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--dim)", fontSize: 10, padding: "3px 10px", cursor: "pointer" },
  navBtnActive: { fontFamily: "inherit", background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 3, color: "var(--green)", fontSize: 10, padding: "3px 10px", cursor: "pointer" },
  themeBtn:     { fontFamily: "inherit", background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--dim)", fontSize: 12, padding: "1px 8px", cursor: "pointer", lineHeight: 1.2 },
  authBtn:      { fontFamily: "inherit", background: "none", border: "none", color: "var(--dim)", fontSize: 10, padding: "3px 6px", cursor: "pointer" },
};
