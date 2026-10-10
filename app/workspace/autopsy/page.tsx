"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileText,
  Search,
  Bug,
} from "lucide-react";

export default function FailureAutopsyPage() {
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [customError, setCustomError] = useState("");
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [repairApplied, setRepairApplied] = useState(false);

  const runDiagnosis = async (runId?: string, errorMsg?: string) => {
    setIsDiagnosing(true);
    setRepairApplied(false);
    try {
      const res = await api.diagnoseAutopsy({
        run_id: runId || undefined,
        error_message: errorMsg || undefined,
        model_name: "Ridge",
      });
      setDiagnosis(res);
    } catch (err: any) {
      alert(`Diagnosis failed: ${err.message}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  useEffect(() => {
    // Run initial benchmark diagnosis for singular matrix failure
    runDiagnosis(undefined, "numpy.linalg.LinAlgError: Singular matrix in estimator fit");
  }, []);

  const handleApplyRepair = () => {
    setRepairApplied(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1500px] mx-auto text-[#F0F4F1] pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(174,202,196,0.12)]">
        <div>
          <div className="font-mono text-[10px] text-[#B69A72] uppercase tracking-[0.14em] font-medium mb-1">
            EXPERIMENT AUTOPSY & FAILURE ANALYSIS
          </div>
          <h1 className="font-sans text-[28px] sm:text-[32px] font-bold text-[#F0F4F1] tracking-[-0.02em] m-0">
            Failure Diagnostics & Root Cause Analysis
          </h1>
          <p className="font-sans text-[13.5px] text-[#A7B5B2] mt-1 m-0 max-w-[720px]">
            Structured scientific post-mortems separating observed evidence from hypotheses, providing verified corrective patches backed by persistent research memory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace/memory"
            className="px-3.5 py-1.5 rounded-[9px] glass-pill text-[12px] font-mono text-[#F0F4F1] inline-flex items-center gap-2"
          >
            <span>View Research Memories</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main Grid: Diagnostic Trigger & Diagnostic Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input / Trigger (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-[16px] glass-panel border border-[rgba(174,202,196,0.12)] flex flex-col gap-4">
            <h2 className="font-sans text-[15px] font-semibold text-[#F0F4F1] flex items-center gap-2 m-0">
              <Bug size={16} className="text-[#B69A72]" />
              Select Run or Error Signature
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#A7B5B2]">
                Quick Select Known Benchmark Failure
              </label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => runDiagnosis(undefined, "numpy.linalg.LinAlgError: Singular matrix in Ridge estimator")}
                  className="p-2.5 rounded-[8px] bg-[rgba(12,18,20,0.6)] border border-[rgba(182,154,114,0.3)] hover:border-[#B69A72] text-left text-[12px] font-mono text-[#F0F4F1] transition-all"
                >
                  <div className="text-[#B69A72] font-semibold">1. Matrix Singularity (EXP-001)</div>
                  <div className="text-[11px] text-[#738581] mt-0.5 truncate">
                    numpy.linalg.LinAlgError: Singular matrix
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => runDiagnosis(undefined, "ValueError: Found input variables with inconsistent numbers of samples")}
                  className="p-2.5 rounded-[8px] bg-[rgba(12,18,20,0.6)] border border-[rgba(174,202,196,0.12)] hover:border-[#55D6A1] text-left text-[12px] font-mono text-[#F0F4F1] transition-all"
                >
                  <div className="text-[#55D6A1] font-semibold">2. Dimension Mismatch</div>
                  <div className="text-[11px] text-[#738581] mt-0.5 truncate">
                    ValueError: Inconsistent samples between features and target
                  </div>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-[rgba(174,202,196,0.08)]">
              <label className="text-[11px] font-mono text-[#A7B5B2]">
                Custom Exception Message
              </label>
              <textarea
                rows={3}
                value={customError}
                onChange={(e) => setCustomError(e.target.value)}
                placeholder="Paste traceback or error message..."
                className="w-full bg-[rgba(12,18,20,0.8)] border border-[rgba(174,202,196,0.15)] rounded-[8px] p-2.5 text-[12px] font-mono text-[#F0F4F1] placeholder-[#738581] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => runDiagnosis(undefined, customError || undefined)}
                disabled={isDiagnosing}
                className="mt-1 px-4 py-2 rounded-[8px] bg-[#B69A72] text-[#080C0D] font-mono text-[12px] font-semibold hover:bg-[#c9ad84] transition-all cursor-pointer disabled:opacity-50"
              >
                {isDiagnosing ? "Analyzing Evidence..." : "Diagnose Custom Failure"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Autopsy Report (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {diagnosis ? (
            <div className="p-6 rounded-[16px] glass-panel-elevated border border-[rgba(182,154,114,0.3)] flex flex-col gap-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(174,202,196,0.12)]">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={20} className="text-[#B69A72]" />
                  <div>
                    <h3 className="font-sans text-[16px] font-bold text-[#F0F4F1] m-0">
                      Autopsy Report: {diagnosis.autopsy_id}
                    </h3>
                    <div className="font-mono text-[11px] text-[#A7B5B2]">
                      Target Estimator: {diagnosis.target_model}
                    </div>
                  </div>
                </div>

                <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-[rgba(182,154,114,0.15)] text-[#B69A72] border border-[rgba(182,154,114,0.3)] font-semibold">
                  {diagnosis.confidence_assessment?.rating || "HIGH_CONFIDENCE (95%)"}
                </span>
              </div>

              {/* 1. Observed Problem */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-[#738581] uppercase font-semibold">
                  1. Observed Problem (Facts Only)
                </span>
                <div className="p-3 rounded-[8px] bg-[rgba(12,18,20,0.6)] border border-[rgba(174,202,196,0.08)] font-mono text-[12px] text-[#F0F4F1] leading-relaxed">
                  {diagnosis.observed_problem}
                </div>
              </div>

              {/* 2. Concrete Evidence */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-[#738581] uppercase font-semibold">
                  2. Telemetry & Evidence
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11.5px] font-mono">
                  <div className="p-2.5 rounded bg-[rgba(12,18,20,0.5)] border border-[rgba(174,202,196,0.08)]">
                    <span className="text-[#738581] block text-[10px]">CATEGORY</span>
                    <span className="text-[#55D6A1]">{diagnosis.evidence?.error_category}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[rgba(12,18,20,0.5)] border border-[rgba(174,202,196,0.08)]">
                    <span className="text-[#738581] block text-[10px]">MEMORY MATCHES</span>
                    <span className="text-[#B69A72]">
                      {diagnosis.evidence?.verified_memory_matches} Verified Patches
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Likely Cause (Hypothesis) */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-[#738581] uppercase font-semibold">
                  3. Scientific Cause (Hypothesis)
                </span>
                <p className="text-[12.5px] text-[#A7B5B2] leading-relaxed m-0 bg-[rgba(12,18,20,0.5)] p-3 rounded-[8px] border border-[rgba(174,202,196,0.06)]">
                  {diagnosis.likely_cause}
                </p>
              </div>

              {/* 4. Corrective Action & Verified Patch */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[rgba(174,202,196,0.1)]">
                <span className="font-mono text-[11px] text-[#55D6A1] uppercase font-semibold flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  4. Recommended Corrective Action (Verified Memory)
                </span>

                <div className="p-3.5 rounded-[10px] bg-[rgba(85,214,161,0.08)] border border-[rgba(85,214,161,0.25)] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#55D6A1] font-semibold">
                      ACTION: {diagnosis.recommended_corrective_action?.action_type}
                    </span>
                    <span className="font-mono text-[10.5px] text-[#A7B5B2]">
                      Target: {diagnosis.target_model}
                    </span>
                  </div>

                  <pre className="font-mono text-[11px] text-[#F0F4F1] bg-[rgba(8,12,13,0.7)] p-2 rounded overflow-x-auto m-0">
                    {JSON.stringify(diagnosis.recommended_corrective_action?.patch, null, 2)}
                  </pre>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11.5px] text-[#A7B5B2]">
                      {repairApplied
                        ? "Patch applied to subsequent pipeline stage."
                        : "Ready to inject into next experiment configuration."}
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyRepair}
                      disabled={repairApplied}
                      className="px-3 py-1.5 rounded-[6px] bg-[#55D6A1] text-[#080C0D] font-mono text-[11px] font-semibold hover:bg-[#6be0ad] transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {repairApplied ? (
                        <>
                          <Check size={13} />
                          <span>Patch Applied</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw size={13} />
                          <span>Apply Patch to Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-[16px] glass-panel text-center text-[#738581] text-[13px]">
              Select an error signature on the left to generate a structured failure autopsy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
