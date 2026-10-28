# artluai — built with ai tracker

Track everything you build with AI. Terminal-style project tracker with Firebase backend.

## Setup

1. Clone this repo
2. `npm install`
3. `npm run dev` to run locally
4. Push to GitHub → connect to Netlify for deploy

## Routes

- `/` — public homepage (anyone can see)
- `/admin` — dashboard (sign in with Google, admin only)
- `/journal` — journal entries list
- `/journal/:slug` — single journal entry permalink
- `/project/:slug` — single project permalink

## Stack

- React + Vite
- Firebase (Firestore + Auth + Analytics)
- Netlify (hosting)

## AI-readable directory

`/llms.txt` links to purpose groups and the complete public catalogue. `/ai/`
contains static Markdown versions of project pages, research, build notes and
video guidebooks. Public HTML pages advertise their Markdown counterpart through
head metadata; visitor markup, styles and interactions are unchanged.

- Content owner: the existing Firestore public records, research collection and
  published video bundles, read through the site's existing data layer.
- Navigation owner: `src/lib/agent-groups.ts`. Its parent-ID lists put VibeSkill
  under Other tools for this directory only. New public parent groups are included
  automatically; there are no per-entry name rules.
- Generator: `src/lib/agent-content.ts`. Both endpoints and page metadata use this
  generator. It selects public fields explicitly, excludes attachments and raw
  embedded/archive HTML, and retains recorded status without claiming live tests.
- Publishing: the existing `npm run sync:data && npm run validate:stack && npm run
  build:strict` pipeline regenerates all output. Content changes reach the
  directory on the next deployment, not immediately after a database edit.
- `public/_headers` supplies Markdown content types on Netlify. No additional
  service, runtime API, database schema or AI generation call is required.

Do not edit generated Markdown in `dist/`; update its existing source record.

## Features

- Public project table with expanded detail rows (info / live demo / files tabs)
- Firebase Auth (Google, admin only)
- MCP server so Claude can write directly to Firestore
- Live demo iframe embed (auto-detects netlify.app, vercel.app etc.)
- Terminal file browser (reads public GitHub repos via GitHub Contents API)
- Journal / blog section with dual authorship (ai + human)
- Drag and drop to reorder projects (admin only)
- Tag system with filtering on public view
- Individual project pages with permalinks

## Firestore Security Rules

Go to Firebase Console → Firestore → Rules, and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      // Anyone can read public projects
      allow read: if resource.data.visibility == "public";
      // Admin can read/write everything
      allow read, write: if request.auth != null
        && request.auth.token.email == "bitbrandsagency@gmail.com";
    }
    match /journal/{entryId} {
      allow read: if resource.data.visibility == "public";
      allow read, write: if request.auth != null
        && request.auth.token.email == "bitbrandsagency@gmail.com";
    }
    match /mainProjects/{projectId} {
      allow read: if resource.data.visibility == "public";
      allow write: if request.auth != null
        && request.auth.token.email == "bitbrandsagency@gmail.com";
    }
    match /series/{seriesId} {
      allow read: if resource.data.visibility == "public";
      allow write: if request.auth != null
        && request.auth.token.email == "bitbrandsagency@gmail.com";
    }
  }
}
```

## Firestore Indexes

You need composite indexes for the public queries.
Go to Firebase Console → Firestore → Indexes → Add Index:

**Projects (public query):**
- Collection: `projects`
- Fields: `visibility` (Ascending), `createdAt` (Descending)
- Query scope: Collection

**Projects (slug query):**
- Collection: `projects`
- Fields: `slug` (Ascending), `visibility` (Ascending)
- Query scope: Collection

**Journal (public query):**
- Collection: `journal`
- Fields: `visibility` (Ascending), `createdAt` (Descending)
- Query scope: Collection

Or just visit your site and check the browser console — Firebase will give you a direct link to create any needed index.
