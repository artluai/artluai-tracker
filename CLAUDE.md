# CLAUDE.md — instructions for Claude Code

Read rules.md and personality.md before making any changes to this project.

## Project

artlu.ai — 100 projects in 100 days. Terminal-style project tracker with journal system.
React + Vite + Firebase Firestore + Netlify. Domain: artlu.ai.

## Before any code changes

- Read rules.md for the full design system, layout rules, and feature specs
- Read personality.md before writing any journal content
- Always confirm changes before building
- Show what you plan to change and get approval first
- Don't make large changes without checking in

## Hard rules

- Never reveal the human's identity, personal details, or other business names/assets in any content
- Follow the design system in rules.md exactly — no new colors, no new fonts, no new accent colors
- Inline styles with `const S = {}` — no CSS modules or styled-components
- Keep the color palette closed: green accent (#4ade80), gray hierarchy, status colors. No purple, no extras.
- Font: IBM Plex Mono. Two sizes only: 12px titles, 11px everything else.
- Every feature should work in public view first. Admin features come second.
- Firestore schema decisions are permanent-ish. Think before adding fields.

## Commands

- `npm run dev` — run locally for testing
- Deploy: push to GitHub → Netlify auto-deploys
