# Tracker entry best practices

## Project name

Format: `[what it is] - [project name]`

The description of what was built comes first. The project name goes at the end after a dash. A reader should understand the deliverable without opening the entry.

**Good examples:**
```
AI agent control panel mockup - Animabot
keyword filtering feature, stripe billing - Pipelinecpc
reddit brand monitor
interactive skill-tree visual mockup — VibeSkill
umbrella brand site + traffic hub launch — vellumray
```

**Bad examples:**
```
Animabot - AI agent control panel mockup   ← name first, wrong order
Animabot mockup                            ← too vague, what kind of mockup?
Animabot                                   ← no context at all
```

If the project name is self-explanatory (e.g. "reddit brand monitor"), no dash needed — the name IS the description.

---

## Long description (longDesc)

Break into short labelled sections using `**bold headers**`. Each section is 1–4 lines. Write for two audiences simultaneously: a developer skimming for technical detail, and a non-technical reader who wants to understand what it does.

### Structure

**What is [Project Name]?**
One or two sentences. Plain English. What it is, who it's for.

**What it does**
Major features, screens, or flows. Name specific things — tabs, interactions, key mechanics. Can use short bullet-style paragraphs.

**How it works** *(optional — for technical or architectural entries)*
Stack choices, architecture decisions, anything non-obvious about the implementation.

**Built with**
Technologies in plain prose or a short list. This mirrors the `stack` field.

### Tone rules

- Direct and specific. No filler.
- Don't start with "This project is a..." or "I built this because..."
- Start with what it is or what it does.
- Short sentences. One idea per line where possible.
- Technical terms are fine — but explain the purpose, not just the name.

### Example

```
**What is Animabot?**
A framework for creating AI agents that live permanently in Matrix/Element chatrooms. Each bot has its own Ethereum wallet, a defined personality, and a psychological state that evolves day by day.

**What it does**
Six tabs — Status, Significant Interactions, Chat, Memory, Persona, and Debugger.

- Status: live connection health, wallet balance, room count, colour-coded activity log
- Chat: private direct line to the bot outside the chatroom
- Memory: browse and clear per-room conversation history
- Persona: the main screen — system prompt, MBTI, comfort thresholds, memory tuning, daily reflection history
- Significant interactions: log of moments that pushed past the bot's comfort thresholds
- Debugger: headless Chromium session to diagnose login issues

**How it works**
The bot runs a daily reflection at 3am — reads recent conversations and significant interactions, writes 2–4 sentences in first person about how the day affected it. That note is injected into every future system prompt, subtly shifting tone without rewriting character.

**Built with**
Vanilla HTML/CSS/JS mockup. Designed to connect to Node.js, matrix-js-sdk, ethers.js, Qwen API, and Postgres.
```

---

## artifactHtml

Paste raw HTML directly into this field to embed an interactive demo without a deploy. The site renders it via `iframe srcdoc`. No build step, no hosting needed.

Use this for: mockups, interactive tools, games, visualisations — anything built as a single HTML file.

Existing `link`-based embeds still work. `artifactHtml` takes priority when both are set.
