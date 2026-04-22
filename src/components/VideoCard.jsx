import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../lib/theme";

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase();
}

function fmtDuration(sec) {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}:00` : `${m}:${String(s).padStart(2, "0")}`;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 640 : false);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

export default function VideoCard({ video }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isMobile = useIsMobile();
  const [hover, setHover] = useState(false);

  const go = () => navigate(`/video/${video.id}`);

  const shellStyle = {
    ...(isDark ? S.cardDark : S.cardLight),
    ...(hover ? (isDark ? S.cardHoverDark : S.cardHoverLight) : {}),
  };

  const previewStyle = {
    ...S.preview,
    aspectRatio: isMobile ? "9 / 16" : "16 / 9",
  };

  return (
    <div
      style={shellStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={go}
    >
      <div style={previewStyle}>
        {video.video?.thumbnailUrl ? (
          <>
            <img
              src={video.video.thumbnailUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
            />
            <div style={S.playOverlay}>
              <span style={S.playGlyph}>▶</span>
            </div>
          </>
        ) : (
          <div style={S.placeholderBox}>
            <span style={S.placeholderIcon}>video embed pending</span>
          </div>
        )}
      </div>

      <div style={S.body}>
        <div style={isDark ? S.titleDark : S.titleLight}>{video.title}</div>
        <div style={S.meta}>
          <span>{fmtDate(video.shippedAt)}</span>
          <span style={S.metaSep}>·</span>
          <span>{fmtDuration(video.durationSec)}</span>
        </div>
      </div>
    </div>
  );
}

export function VideoCardBlank() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isMobile = useIsMobile();
  return (
    <div style={isDark ? S.blankDark : S.blankLight}>
      <div style={{ ...S.preview, aspectRatio: isMobile ? "9 / 16" : "16 / 9", background: "transparent" }}>
        <div style={S.blankInner}>
          <span style={S.blankIcon}>$_</span>
        </div>
      </div>
      <div style={{ ...S.body, minHeight: 56 }} />
    </div>
  );
}

const S = {
  cardLight: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card)",
    overflow: "hidden",
    display: "flex", flexDirection: "column",
    cursor: "pointer",
    transition: "box-shadow 0.15s, transform 0.15s",
  },
  cardHoverLight: {
    boxShadow: "var(--shadow-card-hover)",
    transform: "translateY(-1px)",
  },
  cardDark: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    overflow: "hidden",
    display: "flex", flexDirection: "column",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  cardHoverDark: {
    borderColor: "var(--green-border)",
  },

  blankLight: {
    background: "transparent",
    border: "1px dashed var(--border)",
    borderRadius: "var(--radius-card)",
    overflow: "hidden",
    display: "flex", flexDirection: "column",
    opacity: 0.6,
  },
  blankDark: {
    background: "transparent",
    border: "1px dashed var(--border)",
    borderRadius: 4,
    overflow: "hidden",
    display: "flex", flexDirection: "column",
    opacity: 0.5,
  },
  blankInner: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  blankIcon: {
    fontFamily: "var(--font-mono)",
    fontSize: 18,
    color: "var(--dim)",
    opacity: 0.5,
  },

  preview: {
    background: "var(--surface-2)",
    borderBottom: "1px solid var(--divider)",
    position: "relative",
    overflow: "hidden",
    width: "100%",
  },
  placeholderBox: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--surface-2)",
  },
  placeholderIcon: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--dim)",
    opacity: 0.7,
  },
  playOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    pointerEvents: "none",
  },
  playGlyph: {
    fontSize: 22,
    color: "#fff",
    background: "rgba(0,0,0,0.55)",
    width: 48, height: 48,
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    paddingLeft: 4, // optical centering for the triangle
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
  },

  body: {
    padding: "12px 14px 14px",
    display: "flex", flexDirection: "column", gap: 4,
    flex: 1,
  },
  titleLight: {
    fontFamily: "var(--font)",
    fontSize: 14, fontWeight: 600,
    color: "var(--text-bright)",
    letterSpacing: "-0.01em",
    lineHeight: 1.3,
  },
  titleDark: {
    fontFamily: "var(--font-mono)",
    fontSize: 12, fontWeight: 500,
    color: "var(--text-bright)",
    lineHeight: 1.4,
  },
  meta: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub)",
    display: "flex", gap: 6,
    marginTop: 2,
  },
  metaSep: { color: "var(--dim)" },
};
