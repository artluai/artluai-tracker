import { useAuth } from "../lib/auth";
import { useNavigate, useLocation } from "react-router-dom";

const START_DATE = "2026-03-18";

function dayNum() {
  const start = new Date(START_DATE + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.max(1, Math.min(Math.floor((now - start) / 86400000) + 1, 100));
}

export default function Header({ projectCount, launchedCount, publicCount, isPublic }) {
  const { user, login, logout, isAdmin } = useAuth();
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
          <span style={{ fontSize: 17, fontWeight: 500, color: "var(--text-bright)", letterSpacing: -0.5 }}>artlu.ai</span>
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
          {user ? (
            <button onClick={logout} style={S.authBtn}>logout</button>
          ) : (
            <button onClick={login} style={S.authBtn}>sign in</button>
          )}
        </div>
      </div>

      {isPublic ? (
        <>
          <div style={{ fontSize: 13, color: "var(--text-bright)", fontWeight: 500, letterSpacing: -0.3, marginTop: 12, marginBottom: 6 }}>
            <span style={{ color: "var(--green)" }}>100</span> projects. <span style={{ color: "var(--green)" }}>100</span> days.
          </div>
          <div style={{ fontSize: 11, color: "var(--dim)", marginBottom: 10 }}>
            day <span style={{ color: "var(--green)" }}>{day}</span>/100 · <span style={{ color: "var(--green)" }}>{projectCount}</span> shipped · <span style={{ color: "var(--green)" }}>{toGo}</span> to go
          </div>
          <div style={{ fontSize: 11, color: "var(--dim)", fontWeight: 300, letterSpacing: 0.2 }}>
            one person. no coding experience. just AI and an internet connection.
          </div>
        </>
      ) : (
        <div style={{ fontSize: 11, marginTop: 5 }}>
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
  navBtn: { background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--dim)", fontSize: 10, padding: "3px 10px", fontFamily: "inherit", cursor: "pointer" },
  navBtnActive: { background: "none", border: "1px solid var(--green-border)", borderRadius: 3, color: "var(--green)", fontSize: 10, padding: "3px 10px", fontFamily: "inherit", cursor: "pointer" },
  authBtn: { background: "none", border: "none", fontFamily: "inherit", color: "var(--dim)", fontSize: 10, padding: "3px 6px", cursor: "pointer" },
};
