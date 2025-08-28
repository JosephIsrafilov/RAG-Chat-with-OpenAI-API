"use client";

import { useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const LINKEDIN_URL = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/in/yusif-israfilov-62887224a";
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/JosephIsrafilov";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [building, setBuilding] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<{ id: number; file: string; preview: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function doUpload() {
    if (!files || files.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f as File));
    const r = await fetch(`${API}/upload`, { method: "POST", body: fd });
    const j = await r.json();
    setUploading(false);
    alert(`Uploaded. Chunks added: ${j.chunks_added}`);
  }

  async function doBuild() {
    setBuilding(true);
    const r = await fetch(`${API}/build`, { method: "POST" });
    const j = await r.json();
    setBuilding(false);
    if (j.status === "ok") alert(`Index built. Chunks: ${j.chunks}`);
    else alert("No docs to index.");
  }

  async function doAsk() {
    if (!question.trim()) return;
    setBusy(true);
    setAnswer("");
    setSources([]);
    const r = await fetch(`${API}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const j = await r.json();
    setBusy(false);
    if (j.status !== "ok") {
      setAnswer("Index is not ready. Upload files and build the index.");
      return;
    }
    setAnswer(j.answer);
    setSources(j.sources || []);
  }

  async function doReset() {
    await fetch(`${API}/reset`, { method: "POST" });
    setAnswer("");
    setSources([]);
    setQuestion("");
    if (fileRef.current) fileRef.current.value = "";
    setFiles(null);
    alert("Reset done.");
  }

  return (
    <>
      <div className="social-bar">
        <a className="social-icon linkedin" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.038-1.852-3.038-1.853 0-2.136 1.447-2.136 2.943v5.664H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.37-1.852 3.603 0 4.267 2.371 4.267 5.455v6.288zM5.337 7.433a2.064 2.064 0 1 1 0-4.129 2.064 2.064 0 0 1 0 4.129zM6.96 20.452H3.714V9H6.96v11.452z"/></svg>
        </a>
        <a className="social-icon github" href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <svg viewBox="0 0 24 24"><path d="M12 .5a11.5 11.5 0 0 0-3.637 22.415c.576.106.786-.25.786-.556v-2.17c-3.2.695-3.875-1.376-3.875-1.376-.524-1.33-1.28-1.685-1.28-1.685-1.045-.714.079-.699.079-.699 1.157.082 1.767 1.188 1.767 1.188 1.028 1.762 2.697 1.253 3.354.958.104-.744.402-1.254.73-1.542-2.555-.291-5.243-1.277-5.243-5.682 0-1.255.45-2.28 1.187-3.083-.119-.292-.515-1.468.113-3.06 0 0 .967-.31 3.17 1.177a10.98 10.98 0 0 1 5.77 0c2.203-1.487 3.17-1.177 3.17-1.177.628 1.592.232 2.768.114 3.06.738.803 1.186 1.828 1.186 3.083 0 4.416-2.693 5.388-5.256 5.675.413.355.78 1.057.78 2.132v3.157c0 .31.206.668.792.554A11.5 11.5 0 0 0 12 .5z"/></svg>
        </a>
      </div>

      <div className="center">
        <div className="shell">
          <div className="header">
            <div>
              <div className="title">RAG Web Chat</div>
              <div className="subtitle">Ask questions about your PDFs, TXT, Markdown, DOC, and DOCX</div>
            </div>
          </div>

          <div className="grid">
            <div className="card">
              <h3>Upload</h3>
              <input
                ref={fileRef}
                id="file-input"
                className="hidden-input"
                type="file"
                multiple
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={(e) => setFiles(e.target.files)}
              />
              <div className="filebar">
                <label className="filelabel" htmlFor="file-input">Choose files</label>
                <span className="pill">PDF / TXT / MD / DOC / DOCX</span>
                <span className="subtitle">{files?.length ? `${files.length} selected` : "No files selected"}</span>
              </div>
              <div className="hstack" style={{ marginTop: 12 }}>
                <button className="btn" onClick={doUpload} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button className="btn" onClick={doBuild} disabled={building}>
                  {building ? "Building..." : "Build Index"}
                </button>
                <button className="btn danger" onClick={doReset}>Reset</button>
              </div>
            </div>

            <div className="card">
              <h3>Ask</h3>
              <input
                className="input"
                placeholder="Type a question about your documents"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") doAsk(); }}
              />
              <div className="hstack" style={{ marginTop: 12 }}>
                <button className="btn secondary" onClick={doAsk} disabled={busy}>
                  {busy ? "Thinking..." : "Ask"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid" style={{ marginTop: 16 }}>
            <div className="card">
              <h3>Sources</h3>
              <div className="src-list">
                {sources.length === 0 && <div className="src">No sources</div>}
                {sources.map((s) => (
                  <div key={s.id} className="src">[{s.id}] {s.file} — {s.preview}</div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3>Answer</h3>
              <div className="answer">{answer || "No answer yet."}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <button className="btn" onClick={() => setShowHelp(true)}>How to use</button>
      </div>

      {showHelp && (
        <div className="modal" onClick={() => setShowHelp(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3>How to use this chat</h3>
            <p className="subtitle">A quick three-step guide</p>
            <ol className="steps">
              <li>Upload your files.</li>
              <li>Click <b>Build Index</b> to process and index the files.</li>
              <li>Ask your questions. Enjoy 🙂</li>
            </ol>
            <div className="hstack">
              <button className="btn secondary" onClick={() => setShowHelp(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
