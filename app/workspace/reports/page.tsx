"use client";

import { useEffect, useState } from "react";
import { api, Report, ClaimVerification, Project } from "@/lib/api";
import {
  FileCheck2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Sparkles,
} from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedReport, setSelectedReport] = useState<{
    report: Report;
    claims: ClaimVerification[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [reportTitle, setReportTitle] = useState("");

  const loadReports = async () => {
    try {
      const [rList, pList] = await Promise.all([api.getReports(), api.getProjects()]);
      setReports(rList);
      setProjects(pList);
      if (pList.length && !selectedProjectId) {
        setSelectedProjectId(pList[0].id);
      }
      if (rList.length && !selectedReport) {
        loadReportDetail(rList[0].id);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetail = async (id: string) => {
    try {
      const res = await api.getReport(id);
      setSelectedReport(res);
    } catch (err) {
      console.error("Failed to load report detail:", err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setGenerating(true);
    try {
      const newRep = await api.generateReport(selectedProjectId, reportTitle);
      setReportTitle("");
      await loadReports();
      loadReportDetail(newRep.id);
    } catch (err: any) {
      alert(err.message || "Report generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>
        COMPILING RESEARCH EVIDENCE CORPUS...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div>
          <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
            EVIDENCE AUDIT // 009
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#e8ede8" }}>
            Evidence-Linked Report Generator
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0" }}>
            Automated research reports grounding every empirical claim directly to stored execution run IDs and metric records.
          </p>
        </div>
      </div>

      {/* Generator Control Card */}
      <div className="research-card">
        <form onSubmit={handleGenerate} style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr auto", gap: 14, alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
              TARGET PROJECT
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
              REPORT TITLE (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. Empirical Validation of Failure Recovery in Edge ML"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
            />
          </div>

          <button
            type="submit"
            disabled={generating}
            style={{
              padding: "9px 20px",
              background: generating ? "#557a44" : "#b5ff8a",
              border: "1px solid #b5ff8a",
              color: "#050706",
              borderRadius: 3,
              font: "600 10px var(--mono)",
              letterSpacing: "0.08em",
              cursor: generating ? "not-allowed" : "pointer"
            }}
          >
            {generating ? "SYNTHESIZING EVIDENCE..." : "+ GENERATE REPORT"}
          </button>
        </form>
      </div>

      {/* Reports Split View */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        {/* Reports List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ font: "600 10px var(--mono)", color: "#7e9084", letterSpacing: "0.08em" }}>
            STORED REPORTS ({reports.length})
          </div>

          {reports.map((r) => {
            const isSelected = selectedReport?.report.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => loadReportDetail(r.id)}
                className="research-card"
                style={{
                  padding: 16,
                  cursor: "pointer",
                  borderColor: isSelected ? "#b5ff8a" : "rgba(226, 239, 229, 0.1)",
                  background: isSelected ? "rgba(181, 255, 138, 0.04)" : "rgba(12, 18, 15, 0.6)"
                }}
              >
                <div style={{ font: "600 12px var(--body)", color: "#e8ede8", marginBottom: 6 }}>
                  {r.title}
                </div>
                <div style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>
                  STATUS: <strong style={{ color: "#b5ff8a" }}>{r.status}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Report Document Viewer */}
        {selectedReport ? (
          <div className="research-card" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 16 }}>
              <div style={{ font: "500 10px var(--mono)", color: "#b5ff8a", marginBottom: 6 }}>
                RESEARCH REPORT ENTITY
              </div>
              <h2 style={{ margin: "0 0 10px", font: "600 20px/1.2 var(--body)", color: "#e8ede8" }}>
                {selectedReport.report.title}
              </h2>
              <div style={{ font: "400 11px var(--mono)", color: "#7e9084" }}>
                QUESTION: <span style={{ color: "#e8ede8" }}>{selectedReport.report.research_question}</span>
              </div>
            </div>

            {/* Abstract / Summary */}
            <div>
              <div style={{ font: "600 11px var(--mono)", color: "#b5ff8a", marginBottom: 6 }}>
                EXECUTIVE SUMMARY & FINDINGS:
              </div>
              <p style={{ font: "400 13px/1.6 var(--body)", color: "#c6d4c8", margin: 0 }}>
                {selectedReport.report.summary}
              </p>
            </div>

            {/* Methodology */}
            <div>
              <div style={{ font: "600 11px var(--mono)", color: "#a7e9e8", marginBottom: 6 }}>
                EXPERIMENTAL METHODOLOGY:
              </div>
              <p style={{ font: "400 12px/1.6 var(--body)", color: "#c6d4c8", margin: 0 }}>
                {selectedReport.report.methodology}
              </p>
            </div>

            {/* Claim Verification Layer */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <ShieldCheck size={16} color="#b5ff8a" />
                <span style={{ font: "600 11px var(--mono)", color: "#e8ede8", letterSpacing: "0.06em" }}>
                  CLAIM–EVIDENCE VERIFICATION LAYER ({selectedReport.claims.length} AUDITED CLAIMS)
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedReport.claims.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "rgba(5, 7, 6, 0.6)",
                      border: "1px solid rgba(226, 239, 229, 0.1)",
                      borderRadius: 3,
                      padding: 14
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ font: "500 12px var(--body)", color: "#e8ede8" }}>
                        "{c.claim_text}"
                      </div>
                      <span className="status-tag status-tag--completed">
                        {c.status}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16, font: "400 10px var(--mono)", color: "#7e9084", marginTop: 8 }}>
                      <span>EVIDENCE: <strong style={{ color: "#a7e9e8" }}>{c.evidence_type}</strong></span>
                      <span>SOURCE: <strong style={{ color: "#e8ede8" }}>{c.supporting_reference_id}</strong></span>
                      <span>METRIC: <strong style={{ color: "#b5ff8a" }}>{c.source_metric}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitations & Reproducibility */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "rgba(5, 7, 6, 0.4)", padding: 16, borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.06)" }}>
              <div>
                <div style={{ font: "600 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>REPRODUCIBILITY SPECIFICATION:</div>
                <div style={{ font: "400 11px/1.5 var(--body)", color: "#9ba8a0" }}>{selectedReport.report.reproducibility_notes}</div>
              </div>
              <div>
                <div style={{ font: "600 10px var(--mono)", color: "#ff8b8b", marginBottom: 6 }}>LIMITATIONS:</div>
                <div style={{ font: "400 11px/1.5 var(--body)", color: "#9ba8a0" }}>{selectedReport.report.limitations}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="research-card" style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
            Select a report from the list to view evidence details.
          </div>
        )}
      </div>
    </div>
  );
}
