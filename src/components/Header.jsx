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
  const day = dayNum();
  const toGo = Math.max(0, 100 - projectCount);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 17, fontWeight: 500, color: "#f0f1f3", letterSpacing: -0.5 }}>artluai</span>
          <span className="cursor" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAdminPage ? (
            <button onClick={() => navigate("/")} style={S.navBtn}>public view</button>
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
          <div style={{ fontSize: 13, color: "#f0f1f3", fontWeight: 500, letterSpacing: -0.3, marginTop: 12, marginBottom: 6 }}>
            <span style={{ color: "#4ade80" }}>100</span> projects. <span style={{ color: "#4ade80" }}>100</span> days.
          </div>
          <div style={{ fontSize: 11, color: "#555b66", marginBottom: 10 }}>
            day <span style={{ color: "#4ade80" }}>{day}</span>/100 · <span style={{ color: "#4ade80" }}>{projectCount}</span> shipped · <span style={{ color: "#4ade80" }}>{toGo}</span> to go
          </div>
          <div style={{ fontSize: 11, color: "#555b66", fontWeight: 300, letterSpacing: 0.2 }}>
            one person. no coding experience. just AI and an internet connection.
          </div>
        </>
      ) : (
        <div style={{ fontSize: 11, marginTop: 5 }}>
          <span style={{ color: "#555b66" }}>$ day </span><span style={{ color: "#4ade80" }}>{day}</span>
          <span style={{ color: "#555b66" }}>/100 · tracking </span><span style={{ color: "#4ade80" }}>{projectCount}</span>
          <span style={{ color: "#555b66" }}> projects · </span><span style={{ color: "#4ade80" }}>{launchedCount}</span>
          <span style={{ color: "#555b66" }}> launched · </span><span style={{ color: "#4ade80" }}>{publicCount}</span>
          <span style={{ color: "#555b66" }}> public · </span><span style={{ color: "#4ade80" }}>{toGo}</span>
          <span style={{ color: "#555b66" }}> to go</span>
        </div>
      )}
    </div>
  );
}

const S = {
  navBtn: {
    background: "none", border: "1px solid var(--border)", borderRadius: 3,
    color: "var(--dim)", fontSize: 10, padding: "3px 10px", fontFamily: "inherit",
    cursor: "pointer", transition: "all 0.15s",
  },
  authBtn: {
    background: "none", border: "none", fontFamily: "inherit",
    color: "var(--dim)", fontSize: 10, padding: "3px 6px",
    cursor: "pointer", transition: "color 0.15s",
  },
};