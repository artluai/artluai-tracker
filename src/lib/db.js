import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

const PROJECTS = "projects";

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
    screenshots: [],
    files: [],
    visibility: "private",
  };
}

// File object shape:
// { name: "setup-guide.md", type: "paste" | "link", content: "...", url: "...", visibility: "public" | "private" | "gated" }