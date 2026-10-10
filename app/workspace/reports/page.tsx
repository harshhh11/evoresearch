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
  Mail,
  Send,
  X,
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

  // Secure Email Dispatch State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailNotes, setEmailNotes] = useState("");
  const [emailAuthorized, setEmailAuthorized] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // ARINA AI Executive Synthesis
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [aiSynthesisText, setAiSynthesisText] = useState<string | null>(null);
  const [synthesisModel, setSynthesisModel] = useState<string>("gpt-5.6-luna");


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

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !recipientEmail || !emailAuthorized) return;
    setSendingEmail(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      const res = await api.sendReportEmail({
        report_id: selectedReport.report.id,
        recipient_email: recipientEmail,
        subject: emailSubject || undefined,
        message: emailNotes || undefined,
        confirm_authorized: emailAuthorized,
      });
      const shortId = (res?.email_id || "").slice(0, 8) || "N/A";
      if (res?.status === "CONFIGURATION_REQUIRED") {
        setEmailError(
          "SMTP configuration required: Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to enable live outbound SMTP transmission."
        );
      } else {
        setEmailSuccess(`Report dispatched securely to ${recipientEmail} (Msg ID: ${shortId}).`);
        setTimeout(() => {
          setEmailModalOpen(false);
          setEmailSuccess(null);
          setRecipientEmail("");
          setEmailAuthorized(false);
        }, 2500);
      }
    } catch (err: any) {
      setEmailError(err.message || "Failed to dispatch report email");
    } finally {
      setSendingEmail(false);
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
          <div style={{ font: "500 10px/1 var(--mono)", color: "#B69A72", letterSpacing: "0.14em", marginBottom: 8 }}>
            EVIDENCE AUDIT // 009
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#F2F0E8" }}>
            Evidence-Linked Report Generator
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#AAA99F" }}>
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
              style={{ width: "100%", padding: "9px 10px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 11px var(--mono)" }}
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
              style={{ width: "100%", padding: "9px 10px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 11px var(--mono)" }}
            />
          </div>

          <button
            type="submit"
            disabled={generating}
            style={{
              padding: "9px 20px",
              background: generating ? "#557a44" : "#B69A72",
              border: "1px solid #B69A72",
              color: "#101110",
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

      {/* EvolveX Judge Agent Cross-Evaluation Panel */}
      {reports.length >= 2 && (
        <div className="research-card" style={{ border: "1px solid rgba(182, 154, 114, 0.3)", background: "rgba(182, 154, 114, 0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={18} color="#B69A72" />
              <div>
                <div style={{ font: "600 13px var(--body)", color: "#F2F0E8" }}>
                  EvolveX Judge Agent — Multi-Report Cross-Examination
                </div>
                <div style={{ font: "400 11px var(--body)", color: "#AAA99F" }}>
                  Autonomous scientific audit comparing methodologies, extracting contradictions, and verifying evidence rigor without hallucinations.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (reports.length < 2) return;
                try {
                  const res = await api.evaluateJudgeReports(reports[0].id, reports[1].id);
                  alert(
                    `Judge Agent Verdict: ${res.status}\nConsensus Score: ${res.rubric_breakdown?.overall_consensus_score}/100\n\n` +
                    `Synthesis: ${res.synthesis}\n` +
                    `Contradictions: ${res.contradictions?.length || 0}\nConvergences: ${res.convergences?.length || 0}`
                  );
                } catch (e: any) {
                  alert(e.message || "Judge Agent evaluation failed.");
                }
              }}
              className="research-button research-button--secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "600 10px var(--mono)", padding: "7px 14px" }}
            >
              <Sparkles size={13} color="#B69A72" />
              CROSS-EXAMINE LATEST 2 REPORTS
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, font: "400 10px var(--mono)", color: "#7e9084" }}>
            <div style={{ background: "rgba(5, 7, 6, 0.5)", padding: "10px 12px", borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.06)" }}>
              <span style={{ color: "#AAA99F" }}>METHODOLOGY AUDIT:</span> Training-split quarantine & feature leakage isolation verified.
            </div>
            <div style={{ background: "rgba(5, 7, 6, 0.5)", padding: "10px 12px", borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.06)" }}>
              <span style={{ color: "#AAA99F" }}>EVIDENCE TRACEABILITY:</span> Claims must link to immutable Run IDs & metric keys.
            </div>
            <div style={{ background: "rgba(5, 7, 6, 0.5)", padding: "10px 12px", borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.06)" }}>
              <span style={{ color: "#AAA99F" }}>UNRESOLVED HANDLING:</span> Discrepancies flagged explicitly without fabricated confidence.
            </div>
          </div>
        </div>
      )}

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
                  borderColor: isSelected ? "#B69A72" : "rgba(226, 239, 229, 0.1)",
                  background: isSelected ? "rgba(182, 154, 114, 0.04)" : "rgba(12, 18, 15, 0.6)"
                }}
              >
                <div style={{ font: "600 12px var(--body)", color: "#F2F0E8", marginBottom: 6 }}>
                  {r.title}
                </div>
                <div style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>
                  STATUS: <strong style={{ color: "#B69A72" }}>{r.status}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Report Document Viewer */}
        {selectedReport ? (
          <div className="research-card" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 16 }}>
              <div>
                <div style={{ font: "500 10px var(--mono)", color: "#B69A72", marginBottom: 6 }}>
                  RESEARCH REPORT ENTITY
                </div>
                <h2 style={{ margin: "0 0 10px", font: "600 20px/1.2 var(--body)", color: "#F2F0E8" }}>
                  {selectedReport.report.title}
                </h2>
                <div style={{ font: "400 11px var(--mono)", color: "#7e9084" }}>
                  QUESTION: <span style={{ color: "#F2F0E8" }}>{selectedReport.report.research_question}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="research-button research-button--secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", background: "rgba(182, 154, 114, 0.12)", border: "1px solid rgba(182, 154, 114, 0.4)", color: "#B69A72" }}
                >
                  <Mail size={13} />
                  EMAIL REPORT
                </button>
                <a
                  href={`http://127.0.0.1:8000/api/reports/${selectedReport.report.id}/export?format=pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="research-button research-button--secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", background: "rgba(182, 154, 114, 0.2)", color: "#F2F0E8", border: "1px solid #B69A72" }}
                >
                  <Download size={13} />
                  PDF REPORT
                </a>
                <a
                  href={`http://127.0.0.1:8000/api/reports/${selectedReport.report.id}/export?format=csv`}
                  target="_blank"
                  rel="noreferrer"
                  className="research-button research-button--secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
                >
                  <Download size={13} />
                  CSV
                </a>
                <a
                  href={`http://127.0.0.1:8000/api/reports/${selectedReport.report.id}/export?format=json`}
                  target="_blank"
                  rel="noreferrer"
                  className="research-button research-button--secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
                >
                  <Download size={13} />
                  JSON
                </a>
              </div>
            </div>


            {/* ARINA AI Executive Synthesis Card */}
            <div style={{ padding: "14px 16px", background: "rgba(182, 154, 114, 0.08)", border: "1px solid rgba(182, 154, 114, 0.25)", borderRadius: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, font: "600 11px var(--mono)", color: "#B69A72" }}>
                  <Sparkles size={13} />
                  <span>ARINA AI SCIENTIFIC EXECUTIVE SYNTHESIS</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select
                    value={synthesisModel}
                    onChange={(e) => setSynthesisModel(e.target.value)}
                    style={{ background: "#101110", color: "#F2F0E8", border: "1px solid rgba(182, 154, 114, 0.3)", borderRadius: 4, padding: "3px 8px", font: "500 10px var(--mono)", cursor: "pointer" }}
                  >
                    <option value="gpt-5.6-luna">GPT-5.6 Luna</option>
                    <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
                    <option value="gpt-5-mini">GPT-5 Mini</option>
                  </select>
                  <button
                    type="button"
                    disabled={isSynthesizing}
                    onClick={async () => {
                      if (!selectedReport) return;
                      setIsSynthesizing(true);
                      try {
                        const res = await api.synthesizeReportAI({
                          report_id: selectedReport.report.id,
                          model: synthesisModel,
                        });
                        setAiSynthesisText(res.synthesis);
                      } catch (err: any) {
                        alert("AI Synthesis failed: " + err.message);
                      } finally {
                        setIsSynthesizing(false);
                      }
                    }}
                    className="research-button research-button--secondary"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "600 10px var(--mono)", padding: "4px 10px" }}
                  >
                    <Sparkles size={11} color="#B69A72" />
                    <span>{isSynthesizing ? "SYNTHESIZING..." : "GENERATE AI SYNTHESIS"}</span>
                  </button>
                </div>
              </div>
              {aiSynthesisText ? (
                <div style={{ font: "400 12.5px/1.6 var(--body)", color: "#F2F0E8", whiteSpace: "pre-wrap", borderTop: "1px solid rgba(182, 154, 114, 0.15)", paddingTop: 8 }}>
                  {aiSynthesisText}
                </div>
              ) : (
                <div style={{ font: "400 11px var(--mono)", color: "#7e9084" }}>
                  Autonomous peer-review synthesis examining Pareto frontier trade-offs, leakage quarantine, and edge hardware deployment.
                </div>
              )}
            </div>

            {/* Abstract / Summary */}
            <div>
              <div style={{ font: "600 11px var(--mono)", color: "#B69A72", marginBottom: 6 }}>
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

            {/* Measured Benchmark Results */}
            {(() => {
              try {
                const rows = JSON.parse(selectedReport.report.results_table || "[]");
                if (!rows.length) return null;
                return (
                  <div>
                    <div style={{ font: "600 11px var(--mono)", color: "#B69A72", marginBottom: 10 }}>
                      EMPIRICAL BENCHMARK MATRIX ({rows.length} RUNS):
                    </div>
                    <div style={{ overflowX: "auto", border: "1px solid rgba(226, 239, 229, 0.08)", borderRadius: 3, background: "rgba(5, 7, 6, 0.5)" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", font: "400 11px var(--mono)" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(226, 239, 229, 0.1)", textAlign: "left", color: "#7e9084" }}>
                            <th style={{ padding: "8px 10px" }}>MODEL</th>
                            <th style={{ padding: "8px 10px" }}>STATUS</th>
                            <th style={{ padding: "8px 10px" }}>MAE (eV)</th>
                            <th style={{ padding: "8px 10px" }}>RMSE (eV)</th>
                            <th style={{ padding: "8px 10px" }}>R²</th>
                            <th style={{ padding: "8px 10px" }}>TRAIN TIME</th>
                            <th style={{ padding: "8px 10px" }}>RECOVERED</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: "1px solid rgba(226, 239, 229, 0.05)", color: "#F2F0E8" }}>
                              <td style={{ padding: "8px 10px", fontWeight: 600 }}>{r.model_name}</td>
                              <td style={{ padding: "8px 10px" }}>
                                <span className={r.status === "COMPLETED" ? "status-tag status-tag--completed" : "status-tag status-tag--failed"}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={{ padding: "8px 10px", color: "#B69A72", fontWeight: 600 }}>{r.mae ?? "-"}</td>
                              <td style={{ padding: "8px 10px" }}>{r.rmse ?? "-"}</td>
                              <td style={{ padding: "8px 10px", color: "#a7e9e8" }}>{r.r2 ?? r.score ?? "-"}</td>
                              <td style={{ padding: "8px 10px" }}>{r.train_time_ms ? `${r.train_time_ms} ms` : "-"}</td>
                              <td style={{ padding: "8px 10px" }}>{r.recovery_successful ? "YES (Verified)" : "NO"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })()}

            {/* Claim Verification Layer */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <ShieldCheck size={16} color="#B69A72" />
                <span style={{ font: "600 11px var(--mono)", color: "#F2F0E8", letterSpacing: "0.06em" }}>
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
                      <div style={{ font: "500 12px var(--body)", color: "#F2F0E8" }}>
                        "{c.claim_text}"
                      </div>
                      <span className="status-tag status-tag--completed">
                        {c.status}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16, font: "400 10px var(--mono)", color: "#7e9084", marginTop: 8 }}>
                      <span>EVIDENCE: <strong style={{ color: "#a7e9e8" }}>{c.evidence_type}</strong></span>
                      <span>SOURCE: <strong style={{ color: "#F2F0E8" }}>{c.supporting_reference_id}</strong></span>
                      <span>METRIC: <strong style={{ color: "#B69A72" }}>{c.source_metric}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitations & Reproducibility */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "rgba(5, 7, 6, 0.4)", padding: 16, borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.06)" }}>
              <div>
                <div style={{ font: "600 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>REPRODUCIBILITY SPECIFICATION:</div>
                <div style={{ font: "400 11px/1.5 var(--body)", color: "#AAA99F" }}>{selectedReport.report.reproducibility_notes}</div>
              </div>
              <div>
                <div style={{ font: "600 10px var(--mono)", color: "#ff8b8b", marginBottom: 6 }}>LIMITATIONS:</div>
                <div style={{ font: "400 11px/1.5 var(--body)", color: "#AAA99F" }}>{selectedReport.report.limitations}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="research-card" style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
            Select a report from the list to view evidence details.
          </div>
        )}
      </div>

      {/* Secure Report Email Dispatch Modal */}
      {emailModalOpen && selectedReport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#101110", border: "1px solid rgba(182, 154, 114, 0.4)", borderRadius: 6, padding: 28, maxWidth: 500, width: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(226, 239, 229, 0.1)", paddingBottom: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={16} color="#B69A72" />
                <h3 style={{ margin: 0, font: "600 16px var(--body)", color: "#F2F0E8" }}>
                  Dispatch Scientific Report via Email
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                style={{ background: "transparent", border: "none", color: "#AAA99F", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendEmail} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  RECIPIENT EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@materials-lab.org"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", background: "#141513", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 4, color: "#F2F0E8", font: "400 12px var(--mono)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  EMAIL SUBJECT (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder={`[EvolveX Verified Report] ${selectedReport.report.title}`}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", background: "#141513", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 4, color: "#F2F0E8", font: "400 12px var(--mono)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  OPTIONAL NOTES
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional peer-review notes or provenance annotations..."
                  value={emailNotes}
                  onChange={(e) => setEmailNotes(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", background: "#141513", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 4, color: "#F2F0E8", font: "400 12px var(--mono)" }}
                />
              </div>

              <div style={{ background: "rgba(182, 154, 114, 0.06)", border: "1px solid rgba(182, 154, 114, 0.2)", borderRadius: 4, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <input
                  type="checkbox"
                  id="authConfirm"
                  required
                  checked={emailAuthorized}
                  onChange={(e) => setEmailAuthorized(e.target.checked)}
                  style={{ marginTop: 2, cursor: "pointer" }}
                />
                <label htmlFor="authConfirm" style={{ font: "400 10.5px var(--mono)", color: "#c6d4c8", cursor: "pointer" }}>
                  I confirm authorization to transmit this synthesized evidence report and associated empirical metric claims to the designated external recipient.
                </label>
              </div>

              {emailError && (
                <div style={{ font: "400 11px var(--mono)", color: "#ff8b8b", padding: "6px 8px", background: "rgba(255, 100, 100, 0.1)", borderRadius: 3 }}>
                  {emailError}
                </div>
              )}
              {emailSuccess && (
                <div style={{ font: "400 11px var(--mono)", color: "#8EA58C", padding: "6px 8px", background: "rgba(142, 165, 140, 0.1)", borderRadius: 3 }}>
                  {emailSuccess}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(226, 239, 229, 0.2)", color: "#AAA99F", font: "500 11px var(--mono)", borderRadius: 3, cursor: "pointer" }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail || !emailAuthorized}
                  style={{ padding: "8px 20px", background: "#B69A72", border: "none", color: "#101110", font: "600 11px var(--mono)", letterSpacing: "0.06em", borderRadius: 3, cursor: sendingEmail || !emailAuthorized ? "not-allowed" : "pointer", opacity: emailAuthorized ? 1 : 0.6 }}
                >
                  {sendingEmail ? "TRANSMITTING..." : "DISPATCH EMAIL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

