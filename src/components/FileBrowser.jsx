import { useState, useEffect } from "react";

const GH_API = "https://api.github.com/repos";

// Strip full GitHub URL down to "owner/repo"
function parseRepo(repo) {
  if (!repo) return null;
  try {
    const url = new URL(repo);
    const parts = url.pathname.replace(/^\//, "").split("/");
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  } catch {
    // Already in short form like "artluai/my-project"
    if (repo.includes("/")) return repo.trim();
  }
  return null;
}

export default function FileBrowser({ repo }) {
  const repoSlug = parseRepo(repo);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [openFolders, setOpenFolders] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!repoSlug) { setError("no repo"); setLoading(false); return; }
    fetch(`${GH_API}/${repoSlug}/git/trees/main?recursive=1`)
      .then(r => {
        if (!r.ok) throw new Error(`GitHub API error: ${r.status}`);
        return r.json();
      })
      .then(data => {
        setTree(buildTree(data.tree || []));
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [repoSlug]);

  const loadFile = async (path) => {
    if (selectedFile === path) return;
    setSelectedFile(path);
    setFileContent(null);
    setFileLoading(true);
    try {
      const r = await fetch(`${GH_API}/${repoSlug}/contents/${path}`);
      if (!r.ok) throw new Error("failed to load");
      const data = await r.json();
      const text = atob(data.content.replace(/\n/g, ""));
      setFileContent(text);
    } catch {
      setFileContent("// could not load file content");
    } finally {
      setFileLoading(false);
    }
  };

  const toggleFolder = (path) => setOpenFolders(p => ({ ...p, [path]: !p[path] }));

  const handleCopy = () => {
    if (!fileContent) return;
    navigator.clipboard.writeText(fileContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleDownload = () => {
    if (!fileContent || !selectedFile) return;
    const blob = new Blob([fileContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = selectedFile.split("/").pop();
    a.click();
  };

  if (loading) return <div style={S.msg}>loading repo...</div>;
  if (error) return <div style={{ ...S.msg, color: "var(--red)" }}>could not load repo — check that it's public</div>;

  return (
    <div style={S.container}>
      {/* Tree */}
      <div style={S.tree}>
        <div style={S.treeHeader}>
          <span style={{ color: "var(--green)" }}>⬡</span>{" "}
          <span style={{ color: "var(--dim)" }}>{repoSlug}</span>
        </div>
        <TreeNodes
          nodes={tree}
          depth={0}
          openFolders={openFolders}
          selectedFile={selectedFile}
          onToggle={toggleFolder}
          onSelect={loadFile}
        />
      </div>

      {/* Viewer */}
      <div style={S.viewer}>
        {!selectedFile ? (
          <div style={S.placeholder}>← select a file to view</div>
        ) : (
          <>
            <div style={S.viewerHeader}>
              <span style={S.viewerName}>{selectedFile.split("/").pop()}</span>
              <span style={{ color: "var(--dimmer)", fontSize: 10, flex: 1, marginLeft: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedFile}
              </span>
              <button style={S.actionBtn} onClick={handleCopy}>
                {copied ? "✓ copied" : "⎘ copy"}
              </button>
              <button style={S.actionBtn} onClick={handleDownload}>↓ download</button>
            </div>
            <div style={S.codeWrap}>
              {fileLoading ? (
                <div style={S.msg}>loading...</div>
              ) : (
                <CodeView content={fileContent || ""} filename={selectedFile} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TreeNodes({ nodes, depth, openFolders, selectedFile, onToggle, onSelect }) {
  return nodes.map(node => {
    if (node.type === "tree") {
      const open = openFolders[node.path];
      return (
        <div key={node.path}>
          <div
            style={{ ...S.treeItem, paddingLeft: 10 + depth * 14 }}
            onClick={() => onToggle(node.path)}
          >
            <span style={S.treeArrow}>{open ? "▾" : "▸"}</span>
            <span style={{ color: "var(--yellow)" }}>{node.name}/</span>
          </div>
          {open && (
            <TreeNodes
              nodes={node.children}
              depth={depth + 1}
              openFolders={openFolders}
              selectedFile={selectedFile}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          )}
        </div>
      );
    }
    const isSelected = selectedFile === node.path;
    return (
      <div
        key={node.path}
        style={{
          ...S.treeItem,
          paddingLeft: 10 + depth * 14,
          background: isSelected ? "var(--green-bg)" : "transparent",
          color: isSelected ? "var(--green)" : "var(--dim)",
        }}
        onClick={() => onSelect(node.path)}
      >
        <span style={S.treeIcon}>◈</span>
        <span>{node.name}</span>
      </div>
    );
  });
}

function CodeView({ content, filename }) {
  const lines = content.split("\n");
  const ext = filename.split(".").pop().toLowerCase();
  return (
    <div style={S.codeInner}>
      {lines.map((line, i) => (
        <div key={i} style={S.codeLine}>
          <span style={S.lineNum}>{i + 1}</span>
          <span
            style={S.lineCode}
            dangerouslySetInnerHTML={{ __html: highlight(line, ext) }}
          />
        </div>
      ))}
    </div>
  );
}

// Simple syntax highlighting — handles JSX, JS, CSS, JSON, HTML, MD
function highlight(line, ext) {
  const esc = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (ext === "json") {
    return esc
      .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span style="color:#60a5fa">$1</span>$2')
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#4ade80">$1</span>')
      .replace(/\b(true|false|null)\b/g, '<span style="color:#f59e0b">$1</span>')
      .replace(/\b(-?\d+\.?\d*)\b/g, '<span style="color:#f59e0b">$1</span>');
  }
  if (ext === "md") {
    if (/^#{1,6}\s/.test(line)) return `<span style="color:#f0f1f3;font-weight:500">${esc}</span>`;
    if (/^(\*|-|\d+\.)\s/.test(line)) return `<span style="color:#c0c4cc">${esc}</span>`;
    if (/^>/.test(line)) return `<span style="color:#8a8f9a">${esc}</span>`;
    return esc;
  }
  if (ext === "css") {
    return esc
      .replace(/(\/\*.*?\*\/)/g, '<span style="color:#555b66">$1</span>')
      .replace(/([.#]?[\w-]+)\s*\{/g, '<span style="color:#60a5fa">$1</span> {')
      .replace(/(\w[\w-]*)(\s*:)/g, '<span style="color:#a78bfa">$1</span>$2')
      .replace(/:\s*(#[0-9a-fA-F]{3,8}|[\d.]+(?:px|em|rem|%|vh|vw)|var\([^)]+\))/g,
        ': <span style="color:#4ade80">$1</span>');
  }
  if (["html", "jsx", "tsx", "js", "ts"].includes(ext)) {
    return esc
      .replace(/(\/\/.*$)/g, '<span style="color:#555b66">$1</span>')
      .replace(/\b(import|export|default|from|const|let|var|function|return|if|else|for|while|class|new|async|await|try|catch|throw|typeof|null|undefined|true|false)\b/g,
        '<span style="color:#a78bfa">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
        '<span style="color:#4ade80">$1</span>')
      .replace(/\b([A-Z][A-Za-z0-9]*)/g, '<span style="color:#60a5fa">$1</span>')
      .replace(/\b(\d+)\b/g, '<span style="color:#f59e0b">$1</span>');
  }
  return esc;
}

// Build a nested tree from the flat GitHub API response
function buildTree(items) {
  const root = [];
  const map = {};
  // Only show files, not submodules etc.
  const filtered = items.filter(i => i.type === "blob" || i.type === "tree");
  // Sort: folders first, then files
  filtered.sort((a, b) => {
    if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
    return a.path.localeCompare(b.path);
  });
  for (const item of filtered) {
    const parts = item.path.split("/");
    const name = parts[parts.length - 1];
    const node = { name, path: item.path, type: item.type, children: [] };
    map[item.path] = node;
    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      if (map[parentPath]) map[parentPath].children.push(node);
    }
  }
  return root;
}

const S = {
  container: {
    display: "flex",
    height: 320,
    borderTop: "1px solid var(--border)",
  },
  tree: {
    width: 210,
    flexShrink: 0,
    borderRight: "1px solid var(--border)",
    overflowY: "auto",
    background: "var(--surface)",
  },
  treeHeader: {
    fontSize: 10, color: "var(--dim)", letterSpacing: "0.06em",
    padding: "8px 10px 6px",
    borderBottom: "1px solid var(--border)",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  treeItem: {
    display: "flex", alignItems: "center", gap: 5,
    padding: "4px 10px", fontSize: 11, cursor: "pointer",
    color: "var(--dim)", whiteSpace: "nowrap",
    transition: "background 0.1s",
  },
  treeArrow: { fontSize: 10, flexShrink: 0, width: 10 },
  treeIcon: { fontSize: 10, flexShrink: 0, color: "var(--dimmer)" },
  viewer: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  viewerHeader: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "5px 10px",
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    flexShrink: 0,
  },
  viewerName: { fontSize: 11, color: "var(--text-bright)", flexShrink: 0, fontWeight: 500 },
  actionBtn: {
    fontFamily: "inherit", fontSize: 9, letterSpacing: "0.05em",
    color: "var(--dim)", background: "var(--dimmer)",
    border: "none", padding: "3px 8px", borderRadius: 2, cursor: "pointer",
    flexShrink: 0,
  },
  codeWrap: { flex: 1, overflow: "auto" },
  codeInner: { padding: "8px 0" },
  codeLine: { display: "flex", lineHeight: 1.7 },
  lineNum: {
    width: 38, flexShrink: 0, textAlign: "right", paddingRight: 12,
    color: "var(--dimmer)", userSelect: "none", fontSize: 10, lineHeight: 1.7,
  },
  lineCode: { color: "var(--dim)", whiteSpace: "pre", fontSize: 11, lineHeight: 1.7 },
  placeholder: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", fontSize: 11, color: "var(--dimmer)",
  },
  msg: { padding: "20px", fontSize: 11, color: "var(--dim)" },
};
