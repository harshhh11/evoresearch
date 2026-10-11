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
      <div className="py-16 text-center font-mono text-[12px] text-[#68766D]">
        COMPILING RESEARCH EVIDENCE CORPUS...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7 text-[#26352D]">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-[#DFE5DC] pb-5">
        <div>
          <div className="font-mono text-[10px] text-[#176B4D] uppercase tracking-[0.14em] font-semibold mb-2">
            EVIDENCE AUDIT // 009
          </div>
          <h1 className="m-0 font-serif text-[24px] font-semibold text-[#26352D]">
            Evidence-Linked Report Generator
          </h1>
          <p className="m-0 mt-1.5 text-[12px] text-[#68766D]">
            Automated research reports grounding every empirical claim directly to stored execution run IDs and metric records.
          </p>
        </div>
      </div>

      {/* Generator Control Card */}
      <div className="p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DFE5DC] shadow-xs">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr_auto] gap-3.5 items-end">
          <div>
            <label className="block font-mono text-[9px] font-semibold text-[#68766D] mb-1.5 uppercase">
              TARGET PROJECT
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[11px] focus:outline-none focus:border-[#176B4D]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[9px] font-semibold text-[#68766D] mb-1.5 uppercase">
              REPORT TITLE (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. Empirical Validation of Failure Recovery in Edge ML"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[11px] focus:outline-none focus:border-[#176B4D]"
            />
          </div>

          <button
            type="submit"
            disabled={generating}
            className={`px-5 py-2 rounded-[6px] font-mono text-[10px] font-semibold tracking-[0.08em] transition-colors cursor-pointer ${
              generating
                ? "bg-[#68766D] text-[#FFFFFF] cursor-not-allowed"
                : "bg-[#176B4D] hover:bg-[#12543c] text-[#FFFFFF] shadow-xs"
            }`}
          >
            {generating ? "SYNTHESIZING EVIDENCE..." : "+ GENERATE REPORT"}
          </button>
        </form>
      </div>

      {/* EvolveX Judge Agent Cross-Evaluation Panel */}
      {reports.length >= 2 && (
        <div className="p-5 rounded-[10px] bg-[#E6F0E9]/30 border border-[#176B4D]/30 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-[#176B4D]" />
              <div>
                <div className="font-serif font-semibold text-[13px] text-[#26352D]">
                  EvolveX Judge Agent — Multi-Report Cross-Examination
                </div>
                <div className="text-[11px] text-[#68766D]">
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#176B4D]/40 text-[#176B4D] hover:bg-[#176B4D] hover:text-[#FFFFFF] rounded-[6px] font-mono text-[10px] font-semibold transition-colors cursor-pointer"
            >
              <Sparkles size={13} className="text-[#176B4D]" />
              CROSS-EXAMINE LATEST 2 REPORTS
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-[10px] text-[#68766D]">
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#DFE5DC]">
              <span className="text-[#26352D] font-semibold">METHODOLOGY AUDIT:</span> Training-split quarantine & feature leakage isolation verified.
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#DFE5DC]">
              <span className="text-[#26352D] font-semibold">EVIDENCE TRACEABILITY:</span> Claims must link to immutable Run IDs & metric keys.
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-[6px] border border-[#DFE5DC]">
              <span className="text-[#26352D] font-semibold">UNRESOLVED HANDLING:</span> Discrepancies flagged explicitly without fabricated confidence.
            </div>
          </div>
        </div>
      )}

      {/* Reports Split View */}
      <div className="grid grid-cols-[320px_1fr] gap-6">
        {/* Reports List */}
        <div className="flex flex-col gap-2.5">
          <div className="font-mono text-[10px] font-semibold text-[#68766D] tracking-[0.08em]">
            STORED REPORTS ({reports.length})
          </div>

          {reports.map((r) => {
            const isSelected = selectedReport?.report.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => loadReportDetail(r.id)}
                className={`p-4 rounded-[8px] border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#E6F0E9] border-[#176B4D] shadow-xs"
                    : "bg-[#FFFFFF] border-[#DFE5DC] hover:border-[#176B4D]/40"
                }`}
              >
                <div className="font-serif font-semibold text-[12px] text-[#26352D] mb-1.5">
                  {r.title}
                </div>
                <div className="font-mono text-[9px] text-[#68766D]">
                  STATUS: <strong className="text-[#176B4D]">{r.status}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Report Document Viewer */}
        {selectedReport ? (
          <div className="p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DFE5DC] shadow-xs flex flex-col gap-5">
            <div className="flex justify-between items-start border-b border-[#DFE5DC] pb-4">
              <div>
                <div className="font-mono text-[10px] font-semibold text-[#176B4D] mb-1.5">
                  RESEARCH REPORT ENTITY
                </div>
                <h2 className="m-0 font-serif text-[20px] font-semibold text-[#26352D] mb-2.5">
                  {selectedReport.report.title}
                </h2>
                <div className="font-mono text-[11px] text-[#68766D]">
                  QUESTION: <span className="text-[#26352D]">{selectedReport.report.research_question}</span>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE5DC] text-[#26352D] hover:bg-[#F8F6EF] rounded-[6px] font-mono text-[10px] font-semibold cursor-pointer transition-colors"
                >
                  <Mail size={13} className="text-[#176B4D]" />
                  EMAIL REPORT
                </button>
                <a
                  href={`http://127.0.0.1:8000/api/reports/${selectedReport.report.id}/export?format=pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#176B4D] text-[#FFFFFF] rounded-[6px] font-mono text-[10px] font-semibold hover:bg-[#12543c] transition-colors"
                >
                  <Download size={13} />
                  PDF REPORT
                </a>
                <a
                  href={`http://127.0.0.1:8000/api/reports/${selectedReport.report.id}/export?format=csv`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE5DC] text-[#26352D] hover:bg-[#F8F6EF] rounded-[6px] font-mono text-[10px] font-semibold transition-colors"
                >
                  <Download size={13} />
                  CSV
                </a>
                <a
                  href={`http://127.0.0.1:8000/api/reports/${selectedReport.report.id}/export?format=json`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#DFE5DC] text-[#26352D] hover:bg-[#F8F6EF] rounded-[6px] font-mono text-[10px] font-semibold transition-colors"
                >
                  <Download size={13} />
                  JSON
                </a>
              </div>
            </div>

            {/* ARINA AI Executive Synthesis Card */}
            <div className="p-4 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[8px]">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#176B4D]">
                  <Sparkles size={13} />
                  <span>ARINA AI SCIENTIFIC EXECUTIVE SYNTHESIS</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={synthesisModel}
                    onChange={(e) => setSynthesisModel(e.target.value)}
                    className="bg-[#FFFFFF] text-[#26352D] border border-[#DFE5DC] rounded-[4px] px-2 py-1 font-mono text-[10px] focus:outline-none"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#176B4D] text-[#FFFFFF] rounded-[4px] font-mono text-[10px] font-semibold hover:bg-[#12543c] cursor-pointer"
                  >
                    <Sparkles size={11} />
                    <span>{isSynthesizing ? "SYNTHESIZING..." : "GENERATE AI SYNTHESIS"}</span>
                  </button>
                </div>
              </div>
              {aiSynthesisText ? (
                <div className="text-[12.5px] leading-relaxed text-[#26352D] whitespace-pre-wrap border-t border-[#DFE5DC] pt-2">
                  {aiSynthesisText}
                </div>
              ) : (
                <div className="font-mono text-[11px] text-[#68766D]">
                  Autonomous peer-review synthesis examining Pareto frontier trade-offs, leakage quarantine, and edge hardware deployment.
                </div>
              )}
            </div>

            {/* Abstract / Summary */}
            <div>
              <div className="font-mono text-[11px] font-semibold text-[#176B4D] mb-1.5">
                EXECUTIVE SUMMARY & FINDINGS:
              </div>
              <p className="text-[13px] leading-relaxed text-[#26352D] m-0">
                {selectedReport.report.summary}
              </p>
            </div>

            {/* Methodology */}
            <div>
              <div className="font-mono text-[11px] font-semibold text-[#176B4D] mb-1.5">
                EXPERIMENTAL METHODOLOGY:
              </div>
              <p className="text-[12px] leading-relaxed text-[#68766D] m-0">
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
                    <div className="font-mono text-[11px] font-semibold text-[#176B4D] mb-2.5">
                      EMPIRICAL BENCHMARK MATRIX ({rows.length} RUNS):
                    </div>
                    <div className="overflow-x-auto border border-[#DFE5DC] rounded-[6px] bg-[#F8F6EF]">
                      <table className="w-full text-left border-collapse font-mono text-[11px]">
                        <thead>
                          <tr className="border-b border-[#DFE5DC] text-[#68766D]">
                            <th className="p-2">MODEL</th>
                            <th className="p-2">STATUS</th>
                            <th className="p-2">MAE (eV)</th>
                            <th className="p-2">RMSE (eV)</th>
                            <th className="p-2">R²</th>
                            <th className="p-2">TRAIN TIME</th>
                            <th className="p-2">RECOVERED</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DFE5DC]">
                          {rows.map((r: any, idx: number) => (
                            <tr key={idx} className="text-[#26352D] hover:bg-[#FFFFFF]">
                              <td className="p-2 font-semibold">{r.model_name}</td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  r.status === "COMPLETED" ? "bg-[#E8F5EC] text-[#176B4D]" : "bg-[#B54747]/10 text-[#B54747]"
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                              <td className="p-2 text-[#176B4D] font-semibold">{r.mae ?? "-"}</td>
                              <td className="p-2">{r.rmse ?? "-"}</td>
                              <td className="p-2 text-[#176B4D]">{r.r2 ?? r.score ?? "-"}</td>
                              <td className="p-2">{r.train_time_ms ? `${r.train_time_ms} ms` : "-"}</td>
                              <td className="p-2">{r.recovery_successful ? "YES (Verified)" : "NO"}</td>
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
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-[#176B4D]" />
                <span className="font-mono text-[11px] font-semibold text-[#26352D] tracking-[0.06em]">
                  CLAIM–EVIDENCE VERIFICATION LAYER ({selectedReport.claims.length} AUDITED CLAIMS)
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {selectedReport.claims.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] p-3.5"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="font-serif font-semibold text-[12px] text-[#26352D]">
                        "{c.claim_text}"
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#E8F5EC] text-[#176B4D] font-mono text-[10px] font-semibold">
                        {c.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-[10px] text-[#68766D] mt-2">
                      <span>EVIDENCE: <strong className="text-[#176B4D]">{c.evidence_type}</strong></span>
                      <span>SOURCE: <strong className="text-[#26352D]">{c.supporting_reference_id}</strong></span>
                      <span>METRIC: <strong className="text-[#176B4D]">{c.source_metric}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitations & Reproducibility */}
            <div className="grid grid-cols-2 gap-4 bg-[#F8F6EF] p-4 rounded-[6px] border border-[#DFE5DC]">
              <div>
                <div className="font-mono text-[10px] font-semibold text-[#68766D] mb-1.5">REPRODUCIBILITY SPECIFICATION:</div>
                <div className="text-[11px] leading-relaxed text-[#68766D]">{selectedReport.report.reproducibility_notes}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] font-semibold text-[#B54747] mb-1.5">LIMITATIONS:</div>
                <div className="text-[11px] leading-relaxed text-[#68766D]">{selectedReport.report.limitations}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center font-mono text-[11px] text-[#68766D] bg-[#FFFFFF] border border-[#DFE5DC] rounded-[10px]">
            Select a report from the list to view evidence details.
          </div>
        )}
      </div>

      {/* Secure Report Email Dispatch Modal */}
      {emailModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[9999]">
          <div className="bg-[#FFFFFF] border border-[#DFE5DC] rounded-[10px] p-7 max-w-[500px] w-[90%] shadow-xl">
            <div className="flex justify-between items-center border-b border-[#DFE5DC] pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#176B4D]" />
                <h3 className="m-0 font-serif text-[16px] font-semibold text-[#26352D]">
                  Dispatch Scientific Report via Email
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="bg-transparent border-none text-[#68766D] hover:text-[#26352D] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="flex flex-col gap-3.5">
              <div>
                <label className="block font-mono text-[9px] font-semibold text-[#68766D] mb-1.5 uppercase">
                  RECIPIENT EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@materials-lab.org"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] font-semibold text-[#68766D] mb-1.5 uppercase">
                  EMAIL SUBJECT (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder={`[EvolveX Verified Report] ${selectedReport.report.title}`}
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] font-semibold text-[#68766D] mb-1.5 uppercase">
                  OPTIONAL NOTES
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional peer-review notes or provenance annotations..."
                  value={emailNotes}
                  onChange={(e) => setEmailNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
                />
              </div>

              <div className="bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] p-3 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="authConfirm"
                  required
                  checked={emailAuthorized}
                  onChange={(e) => setEmailAuthorized(e.target.checked)}
                  className="mt-0.5 accent-[#176B4D] cursor-pointer"
                />
                <label htmlFor="authConfirm" className="font-mono text-[10.5px] text-[#68766D] cursor-pointer">
                  I confirm authorization to transmit this synthesized evidence report and associated empirical metric claims to the designated external recipient.
                </label>
              </div>

              {emailError && (
                <div className="font-mono text-[11px] text-[#B54747] p-2 bg-[#B54747]/10 rounded-[4px]">
                  {emailError}
                </div>
              )}
              {emailSuccess && (
                <div className="font-mono text-[11px] text-[#176B4D] p-2 bg-[#E8F5EC] rounded-[4px]">
                  {emailSuccess}
                </div>
              )}

              <div className="flex gap-2.5 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 bg-transparent border border-[#DFE5DC] text-[#68766D] font-mono text-[11px] font-semibold rounded-[6px] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail || !emailAuthorized}
                  className={`px-5 py-2 bg-[#176B4D] hover:bg-[#12543c] text-[#FFFFFF] font-mono text-[11px] font-semibold tracking-[0.06em] rounded-[6px] cursor-pointer ${
                    sendingEmail || !emailAuthorized ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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


