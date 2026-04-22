// Mock VideoBundle data for the homepage video showcase.
//
// Shape mirrors what the future `scripts/sync-video.mjs` will emit from
// spoolcast-content/sessions/<id>/ into public/videos/<id>/bundle.json.
// URLs here still point at tempfile.aiquickdraw.com; those are kie.ai temp
// URLs that will eventually expire — the sync script will rehost assets
// under /videos/<id>/assets/ at ship time.

const WOJAK_STYLE = {
  name: "wojak-comic",
  description: "Modern wojak / doomer-chad meme comic style. Flat-shaded cartoon-realism hybrid with exaggerated archetypal faces.",
  anchorImageUrl: "https://tempfile.aiquickdraw.com/images/1776775295178-5we3d2iiipg.png",
  anchorDescription: "The main hooded figure — weary/doomer register. Serves double-duty as both the style anchor and the builder character reference.",
  references: [
    {
      name: "builder",
      kind: "character",
      imageUrl: "https://tempfile.aiquickdraw.com/images/1776775295178-5we3d2iiipg.png",
      description: "the main hooded figure — weary/doomer register.",
    },
    {
      name: "chad",
      kind: "character",
      imageUrl: "https://tempfile.aiquickdraw.com/images/1776777385975-q7efg51c4b.png",
      description: "A confident figure with signature yellow pointed mohawk-spike hair. Wearing a RED sleeveless tank with hand-lettered 'OUCH!' across the chest. Lighter, warmer palette than the doomer anchor.",
    },
    {
      name: "rules-md",
      kind: "object",
      imageUrl: "https://tempfile.aiquickdraw.com/images/1776775954732-wcm66mjhikr.png",
      description: "A single piece of off-white paper, titled 'rules.md' in hand-lettering with neat bullet-pointed lines beneath.",
    },
  ],
};

const CH_STYLE = {
  name: "cyanide-and-happiness",
  description: "Loose hand-drawn black ink line art with basic flat fills. Simple stick-figure characters.",
  anchorImageUrl: null,
  anchorDescription: "Charmingly amateurish notebook-doodle vibe. Cyanide-and-Happiness / XKCD visual family.",
  references: [],
};

const MARKER_STYLE = {
  name: "monochrome-marker",
  description: "Pilot-era: monochrome marker sketch on white. Preceded the C&H flat-fill evolution.",
  anchorImageUrl: null,
  anchorDescription: "Single-color marker strokes on white background.",
  references: [],
};

export const videoBundles = [
  {
    id: "spoolcast-dev-log",
    title: "Building with AI: how I stopped my AI from silently breaking rules",
    shippedAt: "2026-04-21",
    durationSec: 252,
    coreMessage: "Building with AI only works when the rules constrain the AI even when you ask it to break them. Otherwise the rules are just snapshots of the most recent decision.",
    video: {
      youtubeId: "i3Z480n1k6k",
      thumbnailUrl: "https://img.youtube.com/vi/i3Z480n1k6k/maxresdefault.jpg",
    },
    style: WOJAK_STYLE,
    chunks: [
      {
        id: "C1",
        order: 1,
        sceneTitle: "Act 1 — cold open",
        summary: "rule on screen, original wording",
        sceneImageUrl: "https://tempfile.aiquickdraw.com/images/1776777928364-2512oc4h7unj.png",
        model: "nano-banana-2",
        prompt: "Flat-shaded cartoon illustration in the modern wojak-comic style. A clean off-white page in the wojak-comic style, centered, showing one hand-lettered rule: 'Do not apply global visual effects by default.' No character in frame. Neat, authoritative.",
        beats: [{ id: "01A", narration: "Here's a rule I wrote for myself." }],
        audits: {
          narration: { passed: true },
          render: { passed: true },
        },
      },
      {
        id: "C2",
        order: 2,
        sceneTitle: "Act 1 — cold open",
        summary: "rule mutates once",
        sceneImageUrl: "https://tempfile.aiquickdraw.com/images/1776778002177-z8bxg7fqv2m.png",
        model: "nano-banana-2",
        prompt: "The same page as the prior chunk, the rule has been rewritten. The 'Do not' is visibly crossed out with an ink strike; the new text above reads: 'Apply global visual effects by default.' The edit feels casual, scrawled.",
        beats: [{ id: "02A", narration: "Here's the same rule, a few sessions later." }],
        audits: {
          narration: { passed: false, notes: "bridge needed — viewer jumps time without context" },
          render: { passed: true },
        },
      },
      {
        id: "C3",
        order: 3,
        sceneTitle: "Act 1 — cold open",
        summary: "rule mutates again, thesis lands",
        sceneImageUrl: "https://tempfile.aiquickdraw.com/images/1776778120188-9qbz4l7pxa8.png",
        model: "nano-banana-2",
        prompt: "The same page a third time. Now reads: 'Global visual effects are fine — see session 12 for the decision.' A parenthetical 'session 12' tacked on, bureaucratic. The page is noticeably messier than C1.",
        beats: [{ id: "03A", narration: "A rule you rewrite every time you break it is not a rule." }],
        audits: {
          narration: { passed: true },
          render: { passed: true },
        },
      },
      {
        id: "C4",
        order: 4,
        sceneTitle: "Act 2 — the incident",
        summary: "the project, AI partner",
        sceneImageUrl: "https://tempfile.aiquickdraw.com/images/1776778330323-oiq4v7wtq0m.png",
        model: "nano-banana-2",
        prompt: "The builder (hooded doomer figure from the anchor) seated at his cluttered desk, laptop open. A small chat bubble hovers near the laptop — the AI collaborator, abstracted as a bubble not a character. Muted palette, dim office.",
        beats: [{ id: "04A", narration: "I was building a project with an AI partner." }],
        audits: {
          narration: { passed: true },
          render: { passed: true },
        },
      },
      {
        id: "C7",
        order: 5,
        sceneTitle: "Act 2 — the rules file",
        summary: "the idea — constraints survive sessions",
        sceneImageUrl: "https://tempfile.aiquickdraw.com/images/1776778386416-4zsiabrlbl3.png",
        model: "nano-banana-2",
        prompt: "The builder's rules.md paper in the center of frame. An arrow points from it to a second laptop screen labeled 'next session.' The rules.md acts as the bridge between sessions.",
        beats: [{ id: "07A", narration: "A rules file is supposed to carry constraints across sessions." }],
        audits: {
          narration: { passed: true },
          render: { passed: true },
        },
      },
      {
        id: "C8",
        order: 6,
        sceneTitle: "Act 2 — quiet failure",
        summary: "the deliberate lack of tension is the visual",
        sceneImageUrl: "https://tempfile.aiquickdraw.com/images/1776778444240-xb8v0a61gno.png",
        model: "nano-banana-2",
        prompt: "Wide shot of the builder's desk — everything calm, everything still. No alarm bells visible. The deliberate lack of tension is the visual. Muted doomer palette.",
        beats: [{ id: "08A", narration: "And then, quietly, it stopped working." }],
        audits: {
          narration: { passed: true },
          render: { passed: true },
        },
      },
    ],
    transcript: "Here's a rule I wrote for myself. Here's the same rule, a few sessions later. A rule you rewrite every time you break it is not a rule. I was building a project with an AI partner… [full transcript would continue here across all 71 beats]",
    auditSummary: {
      totalBeats: 71,
      narrationModel: "qwen/qwen-2.5-72b-instruct",
      narrationFlags: 2,
      renderPassed: true,
    },
    showcase: {
      hiddenChunkIds: [],
      notes: "First dev-log video. Includes Act 1 cold open through Act 2 opening beats as the guidebook sample.",
    },
  },

  {
    id: "spoolcast-explainer",
    title: "I don't make videos. My AI pipeline does.",
    shippedAt: "2026-04-15",
    durationSec: 480,
    coreMessage: "Spoolcast is a deterministic pipeline: script is the atomic driver, AI fills in the illustrations, preprocessor is rule-based, Remotion never improvises.",
    video: {
      youtubeId: null,
      thumbnailUrl: null,
      mp4Url: null,
    },
    style: CH_STYLE,
    chunks: [
      {
        id: "E1",
        order: 1,
        sceneTitle: "Opening — what is spoolcast",
        summary: "the pitch in one line",
        sceneImageUrl: null,
        model: "nano-banana-2",
        prompt: "Simple stick-figure character at a desk, flat orange shirt, peach skin, gray laptop. Speech bubble reads 'I don't make videos.' White background.",
        beats: [{ id: "E1A", narration: "I don't make videos. My AI pipeline does." }],
        audits: {
          narration: { passed: true },
          render: { passed: true },
        },
      },
      {
        id: "E2",
        order: 2,
        sceneTitle: "How it works",
        summary: "the pipeline diagram",
        sceneImageUrl: null,
        model: "nano-banana-2",
        prompt: "Pipeline diagram: script → preprocessor → AI scenes → Remotion render → mp4. Flat arrows, simple boxes. Cyanide-and-Happiness visual family.",
        beats: [{ id: "E2A", narration: "It starts with a script. Everything else follows from the script." }],
        audits: {
          narration: { passed: true },
          render: { passed: true },
        },
      },
    ],
    transcript: "I don't make videos. My AI pipeline does. It starts with a script. Everything else follows from the script… [full transcript pending]",
    auditSummary: {
      totalBeats: 0,
      narrationModel: "qwen/qwen-2.5-72b-instruct",
      narrationFlags: 0,
      renderPassed: true,
    },
    showcase: {
      hiddenChunkIds: [],
      notes: "V1 of the spoolcast pair — the technical explainer.",
    },
  },

  {
    id: "tribe-session-001",
    title: "Meta TRIBE explainer (pilot)",
    shippedAt: "2026-03-25",
    durationSec: 300,
    coreMessage: "First proof that the spoolcast pipeline works end-to-end: script → AI scenes → narration → rendered video.",
    video: {
      youtubeId: "hqbmHuEtayM",
      thumbnailUrl: "https://img.youtube.com/vi/hqbmHuEtayM/maxresdefault.jpg",
    },
    style: MARKER_STYLE,
    chunks: [
      {
        id: "T1",
        order: 1,
        sceneTitle: "Opening",
        summary: "pilot opening scene",
        sceneImageUrl: null,
        model: "nano-banana-2",
        prompt: "Monochrome marker sketch, pilot-era style. Single figure, minimal background.",
        beats: [{ id: "T1A", narration: "This is the pilot." }],
        audits: {
          narration: { passed: true },
          render: { passed: true },
        },
      },
    ],
    transcript: "[pilot transcript — full text pending sync script]",
    auditSummary: {
      totalBeats: 0,
      narrationModel: null,
      narrationFlags: 0,
      renderPassed: true,
    },
    showcase: {
      hiddenChunkIds: [],
      notes: "Pilot — shipped before the audit pipeline was in place, so audit data is placeholder.",
    },
  },
];

export function getVideoBundle(id) {
  return videoBundles.find(v => v.id === id) || null;
}
