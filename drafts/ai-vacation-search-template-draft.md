# ai vacation search template — draft

status: local draft only  
visibility: private when posted  
do not publish yet

## project idea

single-file html template for ai-assisted vacation planning.

the artifact is meant to solve one specific workflow:
- shortlist visually strong hotels first
- compare city stay vs resort stay
- plan split trips across two destinations
- keep budget, transport, and weather visible while deciding

the public-safe version is sanitized:
- no real home airport
- no exact real travel dates
- no private shopping spots or personal references
- no direct personal relationship context

## tracker draft fields

```json
{
  "name": "AI Vacation Search Template",
  "slug": "ai-vacation-search-template",
  "desc": "single-file travel-planning artifact with hotel compare, split-trip planner, weather context, and budget logic.",
  "longDesc": "Started as a private hotel research artifact, then turned into a reusable public-safe template. The useful part was not the exact destination data, but the decision system: image-first hotel cards, compare tables, city-vs-resort split planning, weather-aware nights, and budget pressure without spreadsheet friction. This draft removes doxxable trip details and keeps the artifact generic enough to reuse on future vacation searches or embed as a tracker mockup.",
  "status": "launched",
  "date": "2026-05-04",
  "stack": ["HTML", "CSS", "JavaScript", "Prompt Design"],
  "tags": ["travel", "artifact", "template", "mockup", "planner"],
  "visibility": "private",
  "embedHeight": 980,
  "artifactHtmlSource": "/Users/ralphxu/Documents/Playground/vacation-search-template-sanitized.html",
  "showcase": false,
  "top": false
}
```

## local files

- snapshot of the current custom trip artifact:
  - `/Users/ralphxu/Documents/Playground/hcmc-hotel-shortlist-image-heavy-snapshot-2026-04-23.html`
- sanitized reusable template:
  - `/Users/ralphxu/Documents/Playground/vacation-search-template-sanitized.html`

## post later

if you approve this draft, next step is:
1. decide whether the tracker project should stay `private` first or go `public`
2. decide whether to paste the template html into `artifactHtml` as-is or make one more visual pass
3. then add the project through tracker mcp
