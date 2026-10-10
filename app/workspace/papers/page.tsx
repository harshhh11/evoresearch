"use client";

import { useEffect, useState } from "react";
import { api, ResearchPaper } from "@/lib/api";
import {
  BookOpen,
  ExternalLink,
  Search,
  Sparkles,
  Tag,
  FileText,
  Bookmark,
} from "lucide-react";

export default function PapersPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getPapers();
        setPapers(list);
      } catch (err) {
        console.error("Failed to load papers:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>
        FETCHING SCIENTIFIC LITERATURE CORPUS...
      </div>
    );
  }

  const filtered = papers.filter((p) => {
    return (
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.toLowerCase().includes(search.toLowerCase()) ||
      p.problem.toLowerCase().includes(search.toLowerCase()) ||
      p.abstract.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div>
          <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
            SCIENTIFIC GROUNDING // 008
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#e8ede8" }}>
            Research Papers & Theoretical Foundations
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0" }}>
            Curated literature in edge ML, multi-fidelity resource allocation, hyperparameter optimization, and automated failure recovery.
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "#7e9084" }} />
          <input
            type="text"
            placeholder="Search literature corpus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 12px 8px 30px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)", width: 250 }}
          />
        </div>
      </div>

      {/* Papers Stream */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {filtered.map((p) => {
          let tagList: string[] = [];
          try {
            tagList = JSON.parse(p.tags || "[]");
          } catch {}

          return (
            <div key={p.id} className="research-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <h2 style={{ margin: "0 0 6px", font: "600 16px/1.3 var(--body)", color: "#e8ede8" }}>
                    {p.title}
                  </h2>
                  <div style={{ font: "400 11px var(--mono)", color: "#8c9c91", marginBottom: 12 }}>
                    {p.authors} ({p.year}) — <span style={{ color: "#a7e9e8" }}>{p.venue}</span>
                  </div>
                </div>

                {p.doi_url && (
                  <a
                    href={p.doi_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      background: "rgba(181, 255, 138, 0.08)",
                      border: "1px solid rgba(181, 255, 138, 0.2)",
                      borderRadius: 2,
                      color: "#b5ff8a",
                      font: "500 9px var(--mono)",
                      textDecoration: "none"
                    }}
                  >
                    <span>OPEN DOI</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>

              <p style={{ font: "400 12px/1.6 var(--body)", color: "#c6d4c8", margin: "0 0 16px" }}>
                {p.abstract}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, background: "rgba(5, 7, 6, 0.5)", padding: 14, borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.06)", marginBottom: 14 }}>
                <div>
                  <div style={{ font: "600 9px var(--mono)", color: "#7e9084", marginBottom: 3 }}>RESEARCH PROBLEM:</div>
                  <div style={{ font: "400 11px/1.4 var(--body)", color: "#e8ede8" }}>{p.problem}</div>
                </div>
                <div>
                  <div style={{ font: "600 9px var(--mono)", color: "#7e9084", marginBottom: 3 }}>PROPOSED METHOD:</div>
                  <div style={{ font: "400 11px/1.4 var(--body)", color: "#e8ede8" }}>{p.method}</div>
                </div>
                <div>
                  <div style={{ font: "600 9px var(--mono)", color: "#7e9084", marginBottom: 3 }}>CORE FINDINGS:</div>
                  <div style={{ font: "400 11px/1.4 var(--body)", color: "#b5ff8a" }}>{p.findings}</div>
                </div>
                <div>
                  <div style={{ font: "600 9px var(--mono)", color: "#7e9084", marginBottom: 3 }}>LIMITATIONS:</div>
                  <div style={{ font: "400 11px/1.4 var(--body)", color: "#ff8b8b" }}>{p.limitations}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(226, 239, 229, 0.06)", paddingTop: 12 }}>
                <div style={{ font: "400 11px var(--mono)", color: "#a7e9e8" }}>
                  <strong>RELEVANCE TO EVORESEARCH:</strong> {p.relevance_to_evoresearch}
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "2px 8px",
                        background: "rgba(226, 239, 229, 0.05)",
                        borderRadius: 2,
                        font: "400 9px var(--mono)",
                        color: "#7e9084"
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
