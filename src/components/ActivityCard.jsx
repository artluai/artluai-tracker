import { useTheme } from "../lib/theme";

const START_DATE = "2026-03-18";
const TOTAL_WEEKS = 14;

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayNum() {
  const start = new Date(START_DATE + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.max(1, Math.min(Math.floor((now - start) / 86400000) + 1, 100));
}

function levelFor(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

/**
 * Build a map of { "YYYY-MM-DD": count } from projects' date field.
 * Counts each project once on its launch date.
 */
function buildActivityMap(projects) {
  const map = new Map();
  for (const p of projects) {
    if (!p.date) continue;
    map.set(p.date, (map.get(p.date) || 0) + 1);
  }
  return map;
}

/**
 * Compute current and best streak of active days (any project shipped that day)
 * within the project window (day 1 to today).
 */
function computeStreaks(activityMap) {
  const start = new Date(START_DATE + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (today < start) return { current: 0, best: 0, active: 0 };

  let current = 0, best = 0, run = 0, active = 0;
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const key = ymd(d);
    const has = activityMap.has(key);
    if (has) {
      run += 1;
      active += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  // Current streak ends on today — walk backwards from today until we hit a miss.
  current = 0;
  for (let d = new Date(today); d >= start; d.setDate(d.getDate() - 1)) {
    if (activityMap.has(ymd(d))) current += 1;
    else break;
  }
  return { current, best, active };
}

function buildGrid() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - (TOTAL_WEEKS * 7) + 1);
  while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabelByWeek = [];
  const cells = [];
  let lastMonth = -1;

  for (let w = 0; w < TOTAL_WEEKS; w++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + w * 7);
    const m = weekStart.getMonth();
    monthLabelByWeek.push(m !== lastMonth ? monthNames[m] : "");
    lastMonth = m;
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + d);
      cells.push(date);
    }
  }
  return { cells, monthLabelByWeek, today };
}

export default function ActivityCard({ projects }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const activityMap = buildActivityMap(projects);
  const { current, best, active } = computeStreaks(activityMap);
  const day = dayNum();
  const total = projects.length;
  const launched = projects.filter(p => p.status === "launched").length;
  const toGo = Math.max(0, 100 - total);

  const { cells, monthLabelByWeek, today } = buildGrid();
  const projectStart = new Date(START_DATE + "T00:00:00");

  return (
    <div style={isDark ? S.wrapDark : S.wrapLight}>
      <div style={S.stats}>
        <div style={S.row}><span style={S.key}>day</span><span style={S.val}>{day} / 100</span></div>
        <div style={S.row}><span style={S.key}>shipped</span><span style={S.val}>{launched}</span></div>
        <div style={S.row}><span style={S.key}>to go</span><span style={S.val}>{toGo}</span></div>
        <div style={S.row}><span style={S.key}>active</span><span style={S.val}>{active} {active === 1 ? "day" : "days"}</span></div>
      </div>

      <div style={S.heatmapMain}>
        <div style={S.heatmapHead}>
          <span style={S.heatmapHeadText}>
            streaks <strong style={{ color: "var(--green)", fontWeight: 600 }}>{current}</strong>
            <span style={{ color: "var(--text-sub, var(--dim))" }}>/</span>
            <strong style={{ color: "var(--green)", fontWeight: 600 }}>{best}</strong>
          </span>
        </div>
        <div style={S.gridWrap}>
          <div style={S.dayLabels}>
            {["Sun","","Tue","","Thu","","Sat"].map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
          <div>
            <div style={S.months}>
              {monthLabelByWeek.map((label, i) => (
                <span key={i} style={{ width: 12, flexShrink: 0 }}>{label}</span>
              ))}
            </div>
            <div className="heatmap-grid">
              {cells.map((date, i) => {
                const beforeStart = date < projectStart;
                const inFuture = date > today;
                const count = (!beforeStart && !inFuture) ? (activityMap.get(ymd(date)) || 0) : 0;
                const level = levelFor(count);
                const cls = "heatmap-cell" + (level ? " l" + level : "");
                const title = beforeStart
                  ? date.toDateString()
                  : inFuture
                  ? date.toDateString() + " — future"
                  : date.toDateString() + " — " + (count === 0 ? "no activity" : count + " project" + (count === 1 ? "" : "s"));
                return <div key={i} className={cls} title={title} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  // Card shell
  wrapLight: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-card)",
    boxShadow: "var(--shadow-card)",
    padding: "16px 18px",
    display: "flex",
    gap: 18,
    alignItems: "stretch",
  },
  wrapDark: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "14px 16px",
    display: "flex",
    gap: 16,
    alignItems: "stretch",
  },

  // Stats column
  stats: {
    fontFamily: "var(--font-mono)",
    display: "flex", flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    whiteSpace: "nowrap",
    paddingRight: 18,
    borderRight: "1px solid var(--divider)",
  },
  row: { display: "flex", alignItems: "baseline", gap: 8, fontSize: 13 },
  key: { color: "var(--text-sub, var(--dim))", fontWeight: 400 },
  val: { color: "var(--text-bright)", fontWeight: 600 },

  // Heatmap
  heatmapMain: { display: "flex", flexDirection: "column" },
  heatmapHead: {
    display: "flex", alignItems: "baseline", justifyContent: "flex-start",
    fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-sub, var(--dim))",
    marginBottom: 8,
  },
  heatmapHeadText: { color: "var(--text-bright)", fontWeight: 500 },
  gridWrap: { display: "flex", gap: 6 },
  dayLabels: {
    display: "grid", gridTemplateRows: "repeat(7, 12px)", gap: 2,
    paddingTop: 18, flexShrink: 0,
    fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-sub, var(--dim))",
    lineHeight: "12px",
  },
  months: {
    display: "flex", gap: 2, marginBottom: 4,
    fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-sub, var(--dim))",
    height: 12, lineHeight: "12px",
  },
};
