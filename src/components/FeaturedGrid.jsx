import FeaturedCard from "./FeaturedCard";
import { useTheme } from "../lib/theme";

const MAX = 6;

export default function FeaturedGrid({ projects, totalProjectCount }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // `showcase` drives the homepage demos grid (live embeds).
  // `top` is a separate flag that drives the ★ top filter pill below.
  const featured = (projects || [])
    .filter(p => p.showcase)
    .slice(0, MAX);

  if (featured.length === 0) return null;

  return (
    <div style={isDark ? S.bandDark : S.bandLight}>
      <div style={S.inner}>
        <div style={S.sectionHead}>
          <div style={isDark ? S.titleDark : S.titleLight}>showcase demos</div>
          <div style={S.meta}>{featured.length} of {totalProjectCount || projects.length} projects</div>
        </div>
        <div style={S.grid}>
          {featured.map(p => <FeaturedCard key={p.id} project={p} />)}
        </div>
      </div>
    </div>
  );
}

const S = {
  // True full-bleed soft green band in light mode (escapes the 1280 page max + 24 gutter);
  // transparent in dark. Inner still constrained to match page width.
  bandLight: {
    background: "rgba(0, 128, 96, 0.04)",
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    marginBottom: 32,
    width: "100vw",
    padding: "28px 24px",
    boxSizing: "border-box",
  },
  bandDark: {
    marginBottom: 32,
  },
  inner: {
    maxWidth: 1232, // 1280 page max − 2*24 gutter
    margin: "0 auto",
  },
  sectionHead: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    marginBottom: 12,
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 16,
  },
};
