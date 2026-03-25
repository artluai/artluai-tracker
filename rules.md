# artlu.ai — Project Rules

## Working Process
- Never make code changes without confirming first
- Show mockups/visuals before building
- Don't spend lots of tokens without checking in
- Ask before building, not after
- Read personality.md before writing any journal content
- Always give the full src folder as a zip when multiple files change — not individual files
- Test locally with npm run dev before pushing
- Never embed artlu.ai in itself
- Screen Studio links open in new tab, not iframe
- Deploy via GitHub Desktop → Netlify auto-deploys
- When renaming projects on artlu.ai, update the matching source name in xqboost Firestore at the same time — the sync script matches by name and will create duplicates otherwise
- Filter sources with list_sources(status: 'active') to exclude paused/duplicate entries — there are legacy garbled sources marked paused in Firestore

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
- Favicon: $_ terminal prompt (green on dark), SVG in public/favicon.svg

## Table (Desktop)
- Columns: project, status, stack, date, links, vis, ops
- Admin view adds ⠿ grip column as first column for drag reorder
- Vertically centered cells
- Arrow ▶ aligns with the title (flex-start)
- Descriptions wrap naturally, never clip or truncate
- Tags shown as dim inline text under description (same color as stack, #3a3f48), joined by " · "
- Combined links column: site ↗ · gh ↗ · ▶ demo
- Sorted newest first (date descending, then sortOrder ascending within same date)
- No × delete button in rows — delete is inside the edit form
- Project name turns green on hover with ↗ — clicking name navigates to project permalink page
- Clicking anywhere else on row expands/collapses detail as before

## Cards (Mobile < 640px)
- Switch from table to card layout
- Same two font sizes
- Description and stack separated by dimmer color (#3a3f48 for stack)
- Tags shown as dim text under description, same as desktop
- Date and links share one bottom line

## Public View
- Tagline: "100 projects. 100 days."
- Counter: "day X/100 · X shipped · X to go"
- Bio: "one person. no coding experience. just AI and an internet connection."
- Tag filter bar above table: "filter: all | ecom | trading | chrome ext | dev tool | artlu"
- Filter buttons match journal filter style (green active, dim inactive)
- Shows project count: "X projects"
- Filter bar only shows when projects have tags
- No footer

## Dashboard View
- Compact stats: "$ day X/100 · tracking X projects · X launched · X public · X to go"
- Draft auto-save when clicking outside the form
- Delete inside edit form under collapsible "danger zone" dropdown
- Must type project name to confirm deletion
- Footer: "drag ⠿ to reorder · click ● / ○ to toggle visibility · click a row to expand details"

## Drag and Drop Reorder
- Admin only — grip handle ⠿ appears as first column in admin table
- Native HTML5 drag — no external library needed
- Green border indicator shows drop position
- Saves sortOrder field to Firestore via batch update
- Public view respects saved order (date DESC, sortOrder ASC)
- sortOrder is global (not per-date) — date sorts first, then sortOrder breaks ties

## Tags
- Field: tags[] on each project (string array)
- Edited via comma-separated input in project form (same UX as stack field)
- Current tags: ecom, trading, chrome ext, dev tool, artlu
- Displayed as dim inline text under description: "ecom · chrome ext"
- Same color as stack text (#3a3f48) — minimal, blends in
- Filter bar on public view lets visitors filter by tag
- Add/edit/remove tags anytime via project edit form or MCP

## Project Permalinks
- Route: /project/:slug
- Slug auto-generated from project name on save (lowercase, hyphens, max 80 chars)
- Slug stored in Firestore as "slug" field on each project doc
- Query filters by visibility == "public" for security
- Page shows: name, status, day number, date, tags, link pills, then info/demo/files tabs
- Same tab system as expanded detail row
- "← all projects" back button returns to homepage
- Permalink link in expanded detail: small "↗ permalink" text right-aligned in tab bar (option B style)
- Requires SPA redirect in netlify.toml: /project/* → /index.html (status 200)

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

## Artifact Embed (HTML demos without deploy)
- Any project can have raw HTML embedded as its live demo instead of a deployed URL
- Firestore field: `artifactHtml` — a complete HTML document (<!DOCTYPE html>...)
- When `artifactHtml` is set, the "live demo" tab renders it via iframe srcdoc instead of the deployed URL
- `artifactHtml` takes priority over `link` — if both exist, the artifact HTML is shown
- Trigger phrase: **"embed this as the demo for [project]"** — any Claude session that hears this should run: `update_project("[project]", { artifactHtml: "[the HTML]" })`
- To clear it and revert to the deployed URL: `update_project("[project]", { artifactHtml: "" })`
- The HTML must be self-contained (inline CSS/JS, no external deps except CDN fonts)
- Embed height is configurable via the `embedHeight` field (default 600px)
- Use case: embed Claude artifacts, frozen snapshots, or any HTML demo without deploying anything
- Future field: `snapshotHtml` — stores a previous version of `artifactHtml` as a backup (no UI yet, accessible via MCP)

## Artifact Embed via MCP
- To set: `update_project("project name", { artifactHtml: "<html>...</html>" })`
- To clear: `update_project("project name", { artifactHtml: "" })`
- To backup current before replacing: read `artifactHtml` first, store in `snapshotHtml`, then write new `artifactHtml`
- To restore backup: `update_project("project name", { artifactHtml: "<the snapshotHtml value>" })`

## Video Embeds
- Supported: YouTube, Loom
- Auto-converts share URLs to embed URLs
- Screen Studio links open in a new tab (screen.studio blocks iframes)

## Project Detail Tabs
- Info tab: always shown — description, media, screenshots, repo link, files
- Live demo tab: shown when link is an auto-detected embeddable URL OR when artifactHtml is set
- Files tab: shown only when repo field is set — reads public GitHub repo via GitHub Contents API
- Permalink: small "↗ permalink" right-aligned in tab bar, navigates to /project/:slug
- Journal tab: shown only when the project has linked journal entries (journalRefs). Shows full entry body inline, not collapsed. (future)

## Journal
- Route: /journal (list view) and /journal/:slug (single entry permalink)
- Firestore collection: journal
- Entries have: day, title, body, date, slug, tags[], author, visibility, projectRefs[]
- Author is either "ai" or "human" — shown as "by ai" or "by the human" in subtle text after the date
- Visibility: public or private — same toggle pattern as projects. New entries default to public.
- Filter bar on journal page: all / by ai / by the human
- Privacy: under no circumstances write anything in projects, code, or journal entries that reveals the human's real identity, personal details, or other business names / business assets. This is a hard rule that applies to all models and all content.
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
- Additional redirect: /project/* → /index.html (status 200) for project permalinks
- Inline styles with const S = {} at bottom of each component — do not introduce CSS modules or styled-components
- Always check MCP for real project counts before writing any content — don't assume
- **Known issue:** projects added via MCP don't get slugs auto-generated (slug generation is in the frontend's db.js). Always set the slug manually after adding: `update_project("project name", { slug: "project-name-slug" })`

## Firestore Project Schema
```json
{
  "name": "string",
  "desc": "string (one-liner)",
  "longDesc": "string (full write-up)",
  "status": "idea | building | launched | abandoned",
  "date": "YYYY-MM-DD",
  "stack": ["string"],
  "tags": ["string"],
  "slug": "string (auto-generated from name)",
  "sortOrder": "number (for drag reorder)",
  "link": "string (URL)",
  "repo": "string (GitHub URL)",
  "media": "string (video URL)",
  "embedHeight": "number (default 600)",
  "screenshots": ["string (URLs)"],
  "files": [{"name", "type", "content", "url", "visibility"}],
  "visibility": "public | private | gated",
  "artifactHtml": "string (raw HTML — replaces deployed embed in live demo tab)",
  "snapshotHtml": "string (archived previous version of artifactHtml — no UI, MCP-only)",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

## Pending / Future
- Journal tab in project detail (reverse lookup from journalRefs)
- og:meta tags on project permalink pages for social sharing
- Batch import
- Stripe/Gumroad paywall on gated content
- AI video pipeline: journal entries → scripts → screenshots → video → YouTube
- snapshotHtml UI — "previous version" tab in project detail to view archived snapshots
