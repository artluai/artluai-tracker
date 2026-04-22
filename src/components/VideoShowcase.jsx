import { useState, useEffect } from "react";
import { useTheme } from "../lib/theme";
import VideoCard, { VideoCardBlank } from "./VideoCard";
import { videoBundles } from "../lib/video-mock-data";

const MAX_ROWS = 2;

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

export default function VideoShowcase() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const width = useWidth();

  // Responsive columns: 4 (>=1100), 3 (>=820), 2 (>=540), 1 (mobile)
  let cols = 4;
  if (width < 540) cols = 1;
  else if (width < 820) cols = 2;
  else if (width < 1100) cols = 3;

  // Grow rows as videos ship, up to MAX_ROWS on multi-column layouts.
  // Mobile (1 col) stacks all shipped videos — row cap doesn't apply.
  const rowCap = cols > 1 ? MAX_ROWS : Infinity;
  const rowsNeeded = Math.max(1, Math.ceil(videoBundles.length / cols));
  const rows = Math.min(rowsNeeded, rowCap);
  const slots = rows * cols;
  const videos = videoBundles.slice(0, slots);
  const blanks = cols > 1 ? Math.max(0, slots - videos.length) : 0;

  return (
    <div style={S.section}>
      <div style={S.sectionHead}>
        <div style={isDark ? S.titleDark : S.titleLight}>video showcase</div>
        <div style={S.meta}>{videos.length} shipped</div>
      </div>
      <div style={isDark ? S.descDark : S.descLight}>
        every video here is made with <strong>spoolcast</strong>{" "}
        <a
          href="https://github.com/artluai/spoolcast"
          target="_blank"
          rel="noopener noreferrer"
          style={S.descLink}
        >
          github ↗
        </a>
        {" "}— takes anything (chats, notes, rough ideas) and turns it into a video, script and all.
      </div>
      <div style={{ ...S.grid, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {videos.map(v => <VideoCard key={v.id} video={v} />)}
        {Array.from({ length: blanks }).map((_, i) => <VideoCardBlank key={`blank-${i}`} />)}
      </div>
    </div>
  );
}

const S = {
  section: {
    marginBottom: 32,
  },
  sectionHead: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    marginBottom: 4,
  },
  titleLight: {
    fontFamily: "var(--font-mono)",
    fontSize: 13, fontWeight: 600,
    color: "var(--text-bright)",
    letterSpacing: 0,
  },
  titleDark: {
    fontFamily: "var(--font-mono)",
    fontSize: 13, fontWeight: 500,
    color: "var(--text-bright)",
  },
  meta: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-sub, var(--dim))",
  },
  descLight: {
    fontSize: 13,
    lineHeight: 1.5,
    color: "var(--text-sub)",
    marginBottom: 14,
  },
  descDark: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    lineHeight: 1.55,
    color: "var(--text-sub)",
    marginBottom: 14,
  },
  descLink: {
    color: "var(--green)",
    textDecoration: "none",
    fontWeight: 500,
  },
  grid: {
    display: "grid",
    gap: 16,
  },
};
