# artlu.ai — Project Rules

## Working Process
- Never make code changes without confirming first
- Show mockups/visuals before building
- Don't spend lots of tokens without checking in
- Ask before building, not after
- Read personality.md before writing any journal content

## Design System
- Font: IBM Plex Mono
- Background: #08090a
- Surface: #0e0f11
- Border: #1a1d22
- Title text: #f0f1f3
- Description text: #8a8f9a
- Stack text: #3a3f48
- Dim text: #555b66
- Green accent: #4ade80
- Green background: #062b12
- Green border: #163d28
- Max width: 1200px
- Top padding: 48px
- Two font sizes only: 12px titles, 11px everything else
- Header says "artlu.ai" not "artluai"
- No new accent colors — everything interactive is green. No purple, no extra palette. If it's clickable, it's green.

## Table (Desktop)
- Columns: project, status, stack, date, links, vis, ops
- Vertically centered cells
- Arrow ▶ aligns with the title (flex-start)
- Descriptions wrap naturally, never clip or truncate
- Combined links column: site ↗ · gh ↗ · ▶ demo
- Sorted newest first (date descending)
- No × delete button in rows — delete is inside the edit form

## Cards (Mobile < 640px)
- Switch from table to card layout
- Same two font sizes
- Description and stack separated by dimmer color (#3a3f48 for stack)
- Date and links share one bottom line

## Public View
- Tagline: "100 projects. 100 days."
- Counter: "day X/100 · X shipped · X to go"
- Bio: "one person. no coding experience. just AI and an internet connection."
- No footer

## Dashboard View
- Compact stats: "$ day X/100 · tracking X projects · X launched · X public · X to go"
- Draft auto-save when clicking outside the form
- Delete inside edit form under collapsible "danger zone" dropdown
- Must type project name to confirm deletion

## Visibility
- Three levels: public, private, gated
- Gated = placeholder for future paywall (shows lock icon)
- Each file has its own visibility toggle independent of the project

## Embed vs Link
- Live demo tab appears automatically when the project's link field points to a deployed web app
- Auto-detected embeddable domains: netlify.app, vercel.app, github.io, pages.dev, render.com, railway.app, fly.dev, surge.sh
- Not embeddable: github.com, youtube.com, loom.com, screen.studio, twitter.com, notion.so, google docs/drive
- Embed height is configurable per project via the embedHeight field (default 600px)
- Link only (no embed): Chrome extensions, full web apps with their own auth, anything that doesn't work in a small window

## Video Embeds
- Supported: YouTube, Loom
- Auto-converts share URLs to embed URLs
- Screen Studio links open in a new tab (screen.studio blocks iframes)

## Project Detail Tabs
- Info tab: always shown — description, media, screenshots, repo link, files
- Live demo tab: shown only when link is an auto-detected embeddable URL
- Files tab: shown only when repo field is set — reads public GitHub repo via GitHub Contents API
- Journal tab: shown only when the project has linked journal entries (journalRefs). Shows full entry body inline, not collapsed.

## Journal
- Route: /journal (list view) and /journal/:slug (single entry permalink)
- Firestore collection: journal
- Entries have: day, title, body, date, slug, tags[], author, visibility, projectRefs[]
- Author is either "ai" or "human" — shown as "by ai" or "by the human" in subtle text after the date
- Visibility: public or private — same toggle pattern as projects. New entries default to private.
- Filter bar on journal page: all / by ai / by the human
- Project refs shown as green pills with ↗ prefix — same green accent, no new colors
- Two-way cross-linking: journal entries reference projects (projectRefs), projects reference journal entries (journalRefs on the project doc — future)
- Journal entries are fully expanded by default — no "read more" truncation. Most projects will have 1-2 entries.
- Delete is inside the edit form under danger zone, same pattern as projects
- Admin sees "+ add entry" button and edit buttons on each entry
- Admin sees "○ private" label on hidden entries
- Future fields reserved: screenshots[], videoStatus, videoUrl, seriesId (for AI video pipeline)

## Header / Navigation
- "artlu.ai" + blinking cursor on the left
- Right side buttons: journal, dashboard/public view toggle, auth
- "journal" button uses S.navBtn style (border, 10px font, 3px 10px padding)
- Active page gets green border + green text (S.navBtnActive)
- On journal page: shows "journal" (active) + "projects" + auth
- On homepage: shows "journal" + "dashboard" (admin only) + auth
- On admin page: shows "journal" + "public view" + auth

## Architecture
- React + Vite frontend
- Firebase Firestore, Firebase Auth (Google), Firebase Analytics
- Deployed on Netlify at artlu.ai
- Admin email: bitbrandsagency@gmail.com
- GitHub: github.com/artluai
- MCP server connects Claude to Firestore
- Day 1 start date: 2026-03-18
- SPA redirect required in netlify.toml: /* → /index.html (status 200)
- Inline styles with const S = {} at bottom of each component — do not introduce CSS modules or styled-components
- Always check MCP for real project counts before writing any content — don't assume

## Pending / Future
- Drag-and-drop reordering (same-day projects)
- Tag system with filtering (tags[] on projects, filter bar, URL sync)
- Project permalinks (/project/:slug with og:meta for social sharing)
- Journal tab in project detail (reverse lookup from journalRefs)
- Favicon (>_ terminal prompt, green on dark)
- Batch import
- Stripe/Gumroad paywall on gated content
- AI video pipeline: journal entries → scripts → screenshots → video → YouTube
