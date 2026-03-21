import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  getPublicJournalEntries, getAllJournalEntries, getJournalBySlug,
  addJournalEntry, updateJournalEntry, deleteJournalEntry, newJournalEntry,
  getPublicProjects,
} from "../lib/db";
import Header from "./Header";
import JournalEntry from "./JournalEntry";
import JournalForm from "./JournalForm";

function sortByDate(arr) {
  return [...arr].sort((a, b) => {
    const da = new Date(a.date || "2000-01-01");
    const db = new Date(b.date || "2000-01-01");
    if (db - da !== 0) return db - da;
    return (b.day || 0) - (a.day || 0);
  });
}

export default function JournalView() {
  const { slug } = useParams();
  const { isAdmin } = useAuth();
  const [entries, setEntries] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [formEntry, setFormEntry] = useState(null);
  const [singleEntry, setSingleEntry] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [journalData, projectData] = await Promise.all([
        isAdmin ? getAllJournalEntries() : getPublicJournalEntries(),
        getPublicProjects(),
      ]);
      setEntries(journalData);
      setProjectCount(projectData.length);

      if (slug) {
        const found = journalData.find(e => e.slug === slug);
        setSingleEntry(found || null);
      } else {
        setSingleEntry(null);
      }
    } catch (err) {
      setError("failed to load: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [slug, isAdmin]);

  const handleSave = async (data) => {
    try {
      if (data.id) {
        const { id, ...rest } = data;
        await updateJournalEntry(id, rest);
      } else {
        await addJournalEntry(data);
      }
      setFormEntry(null);
      await load();
    } catch (err) {
      setError("save failed: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJournalEntry(id);
      setFormEntry(null);
      await load();
    } catch (err) {
      setError("delete failed: " + err.message);
    }
  };

  const sorted = sortByDate(entries);
  const filtered = filter === "all" ? sorted : sorted.filter(e => e.author === filter);
  const displayEntries = singleEntry ? [singleEntry] : filtered;

  return (
    <div style={S.wrap}>
      <Header projectCount={projectCount} launchedCount={projectCount} publicCount={projectCount} isPublic={true} />

      {error && <div style={{ color: "var(--red)", fontSize: 11, marginBottom: 10 }}>{error}</div>}

      <div style={S.journalHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--green)" }}>journal</span>
          {isAdmin && (
            <button style={S.addBtn} onClick={() => setFormEntry(newJournalEntry())}>+ add entry</button>
          )}
        </div>
        {!singleEntry && (
          <div style={S.filterBar}>
            <span style={S.filterLabel}>show:</span>
            {["all", "ai", "human"].map(f => (
              <button
                key={f}
                style={filter === f ? S.filterBtnActive : S.filterBtn}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "all" : f === "ai" ? "by ai" : "by the human"}
              </button>
            ))}
            <span style={S.filterCount}>
              {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
            </span>
          </div>
        )}
      </div>

      {singleEntry && (
        <button style={S.backBtn} onClick={() => window.history.back()}>← all entries</button>
      )}

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--dim)", fontSize: 11 }}>loading...</div>
      ) : displayEntries.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: "var(--dimmer)", fontSize: 11 }}>
          {singleEntry === null && entries.length > 0 ? "no entries match this filter" : "no journal entries yet"}
        </div>
      ) : (
        displayEntries.map(e => (
          <JournalEntry key={e.id} entry={e} isAdmin={isAdmin} onEdit={setFormEntry} />
        ))
      )}

      {formEntry && (
        <JournalForm
          entry={formEntry}
          onSave={handleSave}
          onCancel={() => setFormEntry(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

const S = {
  wrap: { maxWidth: 1200, margin: "0 auto", padding: "48px 24px 20px", minHeight: "100vh", boxSizing: "border-box" },
  journalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--border)",
    flexWrap: "wrap", gap: 8,
  },
  addBtn: {
    background: "var(--green-bg)", border: "1px solid var(--green-border)",
    color: "var(--green)", fontFamily: "inherit", fontSize: 10,
    padding: "3px 10px", borderRadius: 3, cursor: "pointer",
  },
  filterBar: { display: "flex", alignItems: "center", gap: 6 },
  filterLabel: { fontSize: 10, color: "var(--dimmer)" },
  filterBtn: {
    background: "none", border: "1px solid var(--border)", borderRadius: 3,
    color: "var(--dim)", fontFamily: "inherit", fontSize: 10,
    padding: "2px 10px", cursor: "pointer", transition: "all 0.15s",
  },
  filterBtnActive: {
    background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: 3,
    color: "var(--green)", fontFamily: "inherit", fontSize: 10,
    padding: "2px 10px", cursor: "pointer",
  },
  filterCount: { fontSize: 10, color: "var(--dimmer)", marginLeft: 4 },
  backBtn: {
    background: "none", border: "none", color: "var(--green)", fontFamily: "inherit",
    fontSize: 11, cursor: "pointer", padding: 0, marginBottom: 14, opacity: 0.8,
  },
};
