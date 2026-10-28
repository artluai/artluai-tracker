import { getCollection } from "astro:content";
import { getMainProjects, getPublicJournalEntries, getPublicProjects, getSeries, getSiteEntries, getVideoBundle } from "./data";
import { createProjectRefResolver } from "./projectRefs";
import { agentGroups } from "./agent-groups";

const origin = "https://artlu.ai";
const introduction = "artlu.ai documents tools, applications, AI experiments and videos built with AI. Explore what each project does, try available demos, and read its implementation notes and research. Entries include working products, individual features, prototypes and experiments; each retains its documented status.";
const statusNote = "Status and dates describe the published record, not a recent test of an external service. Missing details are not inferred. Public links do not imply an open-source licence or permission to reuse material.";
type Document = { path: string; title: string; description?: string; page: string; kind: string; group?: string; series?: string; date?: string; body: string };
const absolute = (path: string) => new URL(path, origin).href;
const markdownPath = (page: string) => `/ai${page}.md`;
const label = (value: string) => value.replace(/[\r\n]+/g, " ").replace(/([\\\[\]])/g, "\\$1");
function link(title: string, url?: string) {
  if (!url) return "";
  try {
    const target = new URL(url, origin);
    return /^https?:$/.test(target.protocol) ? `[${label(title)}](<${target.href}>)` : "";
  } catch { return ""; }
}
const value = (item: unknown): string => typeof item === "string" || typeof item === "number" ? String(item) : Array.isArray(item) ? item.map(value).filter(Boolean).join("\n\n") : "";
const field = (name: string, item: unknown) => value(item) ? `${name}: ${value(item)}` : "";
const section = (title: string, body: string) => body ? `## ${title}\n\n${body}` : "";
const join = (parts: (string | undefined)[]) => parts.filter(Boolean).join("\n\n") + "\n";
const listing = (doc: Document) => `- ${link(doc.title, doc.path)} — ${[doc.kind, doc.date, doc.description?.replace(/\s+/g, " ")].filter(Boolean).join(" · ")}`;

// Explicit fields only: raw bundles may contain hidden scenes or internal data.
function videoBody(bundle: any) {
  const summary = bundle.summary || {};
  const summaryFields: Record<string, string[]> = {
    writing: ["author", "role"], images: ["generated", "count", "model"],
    videoClips: ["count", "clipCount", "model", "models", "platform"],
    audio: ["voice", "tts", "beatCount", "durationSec"], render: ["engine", "durationSec"],
    audit: ["passed", "failed"], cost: ["total"],
  };
  const production = Object.entries(summaryFields).map(([name, keys]) => {
    const item = summary[name];
    return field(name, item && typeof item === "object" ? keys.map(key => field(key, item[key])).filter(Boolean).join("; ") : item);
  }).filter(Boolean).join("\n");
  const hiddenChunks = new Set(bundle.showcase?.hiddenChunkIds || []);
  const hiddenBeats = new Set(bundle.showcase?.hiddenBeatNs || []);
  const scenes = bundle.format === "short"
    ? (bundle.beats || []).filter((beat: any) => !hiddenBeats.has(beat.n)).map((beat: any) => join([
      `### Beat ${beat.n || beat.id}`, value(beat.narration || beat.text),
    ]))
    : (bundle.chunks || []).filter((chunk: any) => !hiddenChunks.has(chunk.id)).map((chunk: any) => join([
      `### ${chunk.sceneTitle || chunk.title || chunk.id}`,
      (chunk.beats || []).map((beat: any) => value(beat.narration || beat.text || beat)).filter(Boolean).join("\n\n"),
      field("Model", chunk.model), section("Scene prompt", value(chunk.prompt)),
    ]));
  return join([
    section("Core message", value(bundle.coreMessage)), section("Production", production),
    section("Style", join([value(bundle.style?.name), value(bundle.style?.description), value(bundle.style?.anchorDescription),
      ...(bundle.style?.references || []).map((ref: any) => field(ref.name || "Reference", ref.description))]).trim()),
    section("Characters", (bundle.characters || []).map((char: any) => field(char.name, char.description)).filter(Boolean).join("\n\n")),
    section("Scenes", scenes.join("\n")),
    section("Sources", (bundle.sources || []).map((source: any) => link(source.attribution || source.title || source.publisher || source.url, source.url)).filter(Boolean).join("\n\n")),
    section("Transcript", value(bundle.transcript)),
    section("Pre-roll disclosure", value(bundle.preRoll?.burnedText || bundle.preRoll?.voiceTag)),
  ]);
}

async function buildDirectory() {
  const [projects, entries, journal, research] = await Promise.all([
    getPublicProjects(), getSiteEntries(), getPublicJournalEntries(), getCollection("research"),
  ]);
  const [parents, series] = await Promise.all([getMainProjects(projects), getSeries(entries)]);
  const publicParents = new Map(parents.filter(parent => parent.visibility === "public").map(parent => [parent.id, parent]));
  const publicSeries = new Map(series.filter(item => item.visibility === "public").map(item => [item.id, item]));
  const groups = agentGroups.map(group => ({ ...group }));
  // Future public parent groups are discoverable without another code change.
  for (const parent of publicParents.values()) {
    if (!groups.some(group => group.parents.includes(parent.id))) groups.push({ id: parent.id, parents: [parent.id], name: parent.name, description: parent.desc });
  }
  const groupFor = (parentId: string) => publicParents.has(parentId) ? groups.find(group => group.parents.includes(parentId)) : undefined;
  const docs: Document[] = [];
  const entryByProject = new Map(entries.filter(entry => entry.project).map(entry => [entry.project!.id, entry]));
  const resolveRef = createProjectRefResolver(projects);
  const publicJournal = journal.filter(item => item.visibility === "public");

  for (const project of projects) {
    const entry = entryByProject.get(project.id);
    const parent = entry && publicParents.get(entry.mainProjectId);
    const group = entry && groupFor(entry.mainProjectId);
    const seriesRecord = entry?.seriesId && publicSeries.get(entry.seriesId);
    const page = `/project/${project.slug}`;
    const relatedNotes = publicJournal.filter(note => note.projectRefs?.some(ref => resolveRef(ref).href === page));
    docs.push({ path: markdownPath(page), page, title: project.name, description: project.desc, kind: project.type || "project entry", date: project.date, group: group?.id, series: seriesRecord ? seriesRecord.id : undefined, body: join([
      field("Parent project", parent?.name), field("Series", seriesRecord ? seriesRecord.name : ""),
      field("Recorded status", project.status), field("Updated", project.updatedAt),
      field("Technologies", (entry?.stack || project.stack || []).join(", ")), field("Tags", project.tags?.join(", ")),
      section("Details", project.longDesc || ""),
      section("Links", [link("Site or demo", project.link), link("Repository", project.repo), link("Video", project.media)].filter(Boolean).join("\n\n")),
      project.artifactHtml ? "An interactive demo is embedded on the original page." : "",
      section("Related build notes", relatedNotes.map(note => link(note.title, markdownPath(`/log/${note.slug}`))).join("\n\n")),
      entry?.route.startsWith("/video/") ? link("Video guidebook", markdownPath(entry.route)) : "",
    ]) });
  }

  for (const entry of entries.filter(item => item.route.startsWith("/video/"))) {
    if (docs.some(doc => doc.page === entry.route)) continue;
    const bundle = await getVideoBundle(entry.route.slice("/video/".length));
    const group = groupFor(entry.mainProjectId);
    const seriesRecord = entry.seriesId && publicSeries.get(entry.seriesId);
    docs.push({ path: markdownPath(entry.route), page: entry.route, title: bundle.title, description: bundle.desc, kind: "video guidebook", date: bundle.shippedAt, group: group?.id, series: seriesRecord ? seriesRecord.id : undefined, body: join([
      field("Format", bundle.format), field("Duration (seconds)", bundle.durationSec),
      field("Series", seriesRecord ? seriesRecord.name : ""), videoBody(bundle),
      section("Related tracker entries", entries.filter(item => item.route === entry.route && item.project).map(item => link(item.project!.name, markdownPath(`/project/${item.project!.slug}`))).join("\n\n")),
    ]) });
  }

  for (const post of research) {
    const page = `/research/${post.id.replace(/\.md$/, "")}`;
    docs.push({ path: markdownPath(page), page, title: post.data.title, description: post.data.description, kind: "research report", date: post.data.date, group: "research", body: join([
      field("Tags", post.data.tags.join(", ")), link("Interactive demo", post.data.demoUrl), link("Repository", post.data.repoUrl), post.body,
    ]) });
  }
  for (const note of publicJournal) {
    const page = `/log/${note.slug}`;
    docs.push({ path: markdownPath(page), page, title: note.title, kind: "build note", date: note.date, body: join([
      field("Author", note.author === "human" ? "the human" : "ai"), field("Updated", note.updatedAt), field("Tags", note.tags?.join(", ")),
      note.body,
      section("Related projects", (note.projectRefs || []).map(ref => resolveRef(ref)).filter(ref => ref.href).map(ref => link(ref.label, markdownPath(ref.href))).join("\n\n")),
    ]) });
  }

  const contentDocs = [...docs];
  for (const group of groups) {
    const members = contentDocs.filter(doc => doc.group === group.id);
    if (!members.length) continue;
    const seriesIds = [...new Set(members.map(doc => doc.series))];
    docs.push({ path: `/ai/groups/${group.id}.md`, page: "/list", title: group.name, description: group.description, kind: "directory", body: join([
      ...group.parents.map(id => publicParents.get(id)).filter(Boolean).map(parent => join([
        `## ${parent!.name}`, parent!.desc, [link("Site", parent!.site), link("Demo", parent!.demo), link("Repository", parent!.repo)].filter(Boolean).join(" · "),
      ])),
      ...seriesIds.map(id => section(id ? publicSeries.get(id)!.name : "Entries", members.filter(doc => doc.series === id).map(listing).join("\n"))),
    ]) });
  }
  docs.push({ path: "/ai/catalog.md", page: "/list", title: "Complete public catalogue", kind: "directory", body: contentDocs.map(listing).join("\n") });
  docs.push({ path: "/ai/log.md", page: "/log", title: "Build notes", kind: "directory", body: contentDocs.filter(doc => doc.kind === "build note").map(listing).join("\n") });
  const index = join([
    "# artlu.ai", `> ${introduction}`, statusNote,
    "These files are generated from the same public content as the website on each deployment. Follow the original page links when citing material. Demos may require a browser; this directory does not provide an API for operating them.",
    section("Browse by purpose", docs.filter(doc => doc.path.startsWith("/ai/groups/")).map(listing).join("\n")),
    section("All content", [link("Complete public catalogue", "/ai/catalog.md"), link("Build notes", "/ai/log.md"), link("Visual list", "/list"), link("Research RSS", "/rss.xml")].map(item => `- ${item}`).join("\n")),
  ]);
  docs.push({ path: "/ai/index.md", page: "/", title: "artlu.ai", kind: "directory", body: index });
  return { docs, index };
}

let directory: ReturnType<typeof buildDirectory> | undefined;
export const getAgentDirectory = () => directory ??= buildDirectory();
export function renderAgentDocument(doc: Document) {
  if (doc.path === "/ai/index.md") return doc.body;
  return join([`# ${doc.title}`, doc.description, field("Type", doc.kind), field("Published", doc.date),
    link("Original page", doc.page), doc.group ? link("Browse this group", `/ai/groups/${doc.group}.md`) : "",
    doc.body, statusNote, link("Directory", "/llms.txt"),
  ]);
}
export function agentResponse(body: string, type = "text/markdown") {
  return new Response(body, { headers: { "Content-Type": `${type}; charset=utf-8`, "X-Content-Type-Options": "nosniff", "Link": `<${origin}/llms.txt>; rel="describedby"` } });
}
export async function getAgentPageMetadata(path: string) {
  const { docs } = await getAgentDirectory();
  const normalized = path.replace(/\/$/, "") || "/";
  const doc = docs.find(item => item.page === normalized && item.kind !== "directory");
  const indexes: Record<string, string> = { "/": "/ai/index.md", "/map": "/ai/index.md", "/list": "/ai/catalog.md", "/log": "/ai/log.md", "/research": "/ai/groups/research.md" };
  const alternate = doc?.path || indexes[normalized];
  if (!alternate) return undefined;
  return {
    alternate: absolute(alternate),
    structured: { "@context": "https://schema.org", "@type": "WebPage", "@id": absolute(normalized), url: absolute(normalized),
      isPartOf: { "@type": "WebSite", "@id": `${origin}/#website`, name: "artlu.ai", url: origin },
      encoding: { "@type": "MediaObject", encodingFormat: "text/markdown", contentUrl: absolute(alternate) },
    },
  };
}
