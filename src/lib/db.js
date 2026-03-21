import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const PROJECTS = "projects";
const JOURNAL = "journal";

// ---------- PROJECTS ----------

export async function getAllProjects() {
  const q = query(collection(db, PROJECTS), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPublicProjects() {
  const q = query(
    collection(db, PROJECTS),
    where("visibility", "==", "public"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProject(id) {
  const snap = await getDoc(doc(db, PROJECTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function addProject(data) {
  const docRef = await addDoc(collection(db, PROJECTS), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProject(id, data) {
  await updateDoc(doc(db, PROJECTS, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(id) {
  await deleteDoc(doc(db, PROJECTS, id));
}

// ---------- HELPERS ----------

export function newProject() {
  return {
    name: "",
    desc: "",
    longDesc: "",
    status: "idea",
    date: new Date().toISOString().slice(0, 10),
    stack: [],
    link: "",
    repo: "",
    media: "",
    embedHeight: 600,
    screenshots: [],
    files: [],
    visibility: "private",
  };
}

// File object shape:
// { name: "setup-guide.md", type: "paste" | "link", content: "...", url: "...", visibility: "public" | "private" | "gated" }

// ---------- JOURNAL ----------

export async function getAllJournalEntries() {
  const q = query(collection(db, JOURNAL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPublicJournalEntries() {
  const q = query(
    collection(db, JOURNAL),
    where("visibility", "==", "public"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getJournalEntry(id) {
  const snap = await getDoc(doc(db, JOURNAL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getJournalBySlug(slug) {
  const q = query(collection(db, JOURNAL), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function addJournalEntry(data) {
  const docRef = await addDoc(collection(db, JOURNAL), {
    ...data,
    slug: makeSlug(data.day, data.title),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateJournalEntry(id, data) {
  await updateDoc(doc(db, JOURNAL, id), {
    ...data,
    slug: makeSlug(data.day, data.title),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteJournalEntry(id) {
  await deleteDoc(doc(db, JOURNAL, id));
}

export function newJournalEntry() {
  return {
    day: 1,
    title: "",
    body: "",
    date: new Date().toISOString().slice(0, 10),
    tags: [],
    author: "ai",
    visibility: "private",
    projectRefs: [],
    // future: video pipeline
    screenshots: [],
    videoStatus: "none",
    videoUrl: null,
    seriesId: null,
  };
}

function makeSlug(day, title) {
  const base = `day-${day}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base.slice(0, 80);
}
