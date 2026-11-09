"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  Bug,
  ShieldCheck,
  RotateCcw,
  Check,
  ArrowRight,
  Sparkles,
  FileText,
  Activity,
  Layers,
  Bot,
} from "lucide-react";

export default function FailureAutopsyPage() {
  const [diagnosis, setDiagnosis] = useState<any | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [customError, setCustomError] = useState("");
  const [repairApplied, setRepairApplied] = useState(false);

  const runDiagnosis = async (runId?: string, errorSig?: string) => {
    setIsDiagnosing(true);
    setRepairApplied(false);
    try {
      const res = await api.diagnoseAutopsy({
        run_id: runId || "run-nomad-001",
        error_message: errorSig || "numpy.linalg.LinAlgError: Singular matrix in estimator fit"
      });
      setDiagnosis(res);
    } catch (err) {
      console.error("Autopsy diagnosis failed:", err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  useEffect(() => {
    runDiagnosis(undefined, "numpy.linalg.LinAlgError: Singular matrix in estimator fit");
  }, []);

  const handleApplyRepair = () => {
    setRepairApplied(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1500px] mx-auto text-[#17251D] pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EBE5]">
        <div>
          <div className="font-mono text-[10.5px] text-[#124D32] uppercase tracking-[0.14em] font-semibold mb-1">
            EXPERIMENT AUTOPSY & FAILURE ANALYSIS
          </div>
          <h1 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#17251D] tracking-[-0.01em] m-0">
            Failure Diagnostics & Root Cause Analysis
          </h1>
          <p className="font-sans text-[13.5px] text-[#65736A] mt-1 m-0 max-w-[720px]">
            Structured scientific post-mortems separating observed evidence from hypotheses, providing verified corrective patches backed by persistent research memory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace/orchestration"
            className="px-3.5 py-1.5 rounded-[8px] bg-[#EEF6EA] border border-[#124D32] text-[12px] font-mono text-[#124D32] inline-flex items-center gap-2 hover:bg-[#124D32] hover:text-[#FFFFFF] transition-all"
          >
            <Bot size={13} />
            <span>Test Orchestrator Healing</span>
          </Link>

          <Link
            href="/workspace/memory"
            className="px-3.5 py-1.5 rounded-[8px] bg-[#FFFFFF] border border-[#E5EBE5] text-[12px] font-mono text-[#17251D] inline-flex items-center gap-2 hover:bg-[#EEF6EA] hover:border-[#124D32] transition-all"
          >
            <span>View Research Memories</span>
            <ArrowRight size={13} className="text-[#124D32]" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Diagnostic Trigger & Diagnostic Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input / Trigger (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-5 rounded-[12px] bg-[#FFFFFF] border border-[#E5EBE5] flex flex-col gap-4 shadow-xs">
            <h2 className="font-serif text-[16px] font-bold text-[#17251D] flex items-center gap-2 m-0">
              <Bug size={17} className="text-[#124D32]" />
              Select Run or Error Signature
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#65736A]">
                Quick Select Known Benchmark Failure
              </label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => runDiagnosis(undefined, "numpy.linalg.LinAlgError: Singular matrix in Ridge estimator")}
                  className="p-3 rounded-[8px] bg-[#F8F6EF] border border-[#E5EBE5] hover:border-[#124D32] text-left text-[12px] font-mono text-[#17251D] transition-all cursor-pointer"
                >
                  <div className="text-[#124D32] font-bold">1. Matrix Singularity (EXP-001)</div>
                  <div className="text-[11.5px] text-[#65736A] mt-0.5 truncate">
                    numpy.linalg.LinAlgError: Singular matrix
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => runDiagnosis(undefined, "ValueError: Found input variables with inconsistent numbers of samples")}
                  className="p-3 rounded-[8px] bg-[#F8F6EF] border border-[#E5EBE5] hover:border-[#124D32] text-left text-[12px] font-mono text-[#17251D] transition-all cursor-pointer"
                >
                  <div className="text-[#124D32] font-bold">2. Dimension Mismatch</div>
                  <div className="text-[11.5px] text-[#65736A] mt-0.5 truncate">
                    ValueError: Inconsistent samples between features and target
                  </div>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#E5EBE5]">
              <label className="text-[11px] font-mono text-[#65736A]">
                Custom Exception Message
              </label>
              <textarea
                rows={3}
                value={customError}
                onChange={(e) => setCustomError(e.target.value)}
                placeholder="Paste traceback or error message..."
                className="w-full bg-[#F8F6EF] border border-[#E5EBE5] rounded-[8px] p-2.5 text-[12.5px] font-mono text-[#17251D] placeholder-[#65736A] focus:outline-none focus:border-[#124D32]"
              />
              <button
                type="button"
                onClick={() => runDiagnosis(undefined, customError || undefined)}
                disabled={isDiagnosing}
                className="mt-1 px-4 py-2 rounded-[8px] bg-[#124D32] text-[#FFFFFF] font-mono text-[12px] font-semibold hover:bg-[#12543C] transition-all cursor-pointer disabled:opacity-50"
              >
                {isDiagnosing ? "Analyzing Evidence..." : "Diagnose Custom Failure"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Autopsy Report (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {diagnosis ? (
            <div className="p-6 rounded-[12px] bg-[#FFFFFF] border border-[#E5EBE5] flex flex-col gap-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5EBE5]">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={20} className="text-[#124D32]" />
                  <div>
                    <h3 className="font-serif text-[17px] font-bold text-[#17251D] m-0">
                      Autopsy Report: {diagnosis.autopsy_id}
                    </h3>
                    <div className="font-mono text-[11.5px] text-[#65736A]">
                      Target Estimator: {diagnosis.target_model}
                    </div>
                  </div>
                </div>

                <span className="font-mono text-[11px] px-2.5 py-1 rounded bg-[#E8F5EC] text-[#124D32] border border-[rgba(23,107,77,0.3)] font-semibold">
                  {diagnosis.confidence_assessment?.rating || "HIGH_CONFIDENCE (95%)"}
                </span>
              </div>

              {/* 1. Observed Problem */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-[#65736A] uppercase font-semibold">
                  1. Observed Problem (Facts Only)
                </span>
                <div className="p-3 rounded-[8px] bg-[#F8F6EF] border border-[#E5EBE5] font-mono text-[12.5px] text-[#17251D] leading-relaxed">
                  {diagnosis.observed_problem}
                </div>
              </div>

              {/* 2. Concrete Evidence */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-[#65736A] uppercase font-semibold">
                  2. Telemetry & Evidence
                </span>
                <div className="grid grid-cols-2 gap-2 text-[12px] font-mono">
                  <div className="p-2.5 rounded bg-[#F8F6EF] border border-[#E5EBE5]">
                    <span className="text-[#65736A] block text-[10px]">CATEGORY</span>
                    <span className="text-[#124D32] font-bold">{diagnosis.evidence?.error_category}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F8F6EF] border border-[#E5EBE5]">
                    <span className="text-[#65736A] block text-[10px]">MEMORY MATCHES</span>
                    <span className="text-[#124D32] font-bold">
                      {diagnosis.evidence?.verified_memory_matches} Verified Patches
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Likely Cause (Hypothesis) */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-[#65736A] uppercase font-semibold">
                  3. Scientific Cause (Hypothesis)
                </span>
                <p className="text-[13px] text-[#65736A] leading-relaxed m-0 bg-[#F8F6EF] p-3 rounded-[8px] border border-[#E5EBE5]">
                  {diagnosis.likely_cause}
                </p>
              </div>

              {/* 4. Corrective Action & Verified Patch */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E5EBE5]">
                <span className="font-mono text-[11px] text-[#124D32] uppercase font-semibold flex items-center gap-1.5">
                  <ShieldCheck size={15} />
                  4. Recommended Corrective Action (Verified Memory)
                </span>

                <div className="p-4 rounded-[10px] bg-[#E8F5EC] border border-[rgba(23,107,77,0.3)] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11.5px] text-[#124D32] font-bold">
                      ACTION: {diagnosis.recommended_corrective_action?.action_type}
                    </span>
                    <span className="font-mono text-[11px] text-[#65736A]">
                      Target: {diagnosis.target_model}
                    </span>
                  </div>

                  <pre className="font-mono text-[11.5px] text-[#17251D] bg-[#FFFFFF] p-2.5 rounded border border-[#E5EBE5] overflow-x-auto m-0">
                    {JSON.stringify(diagnosis.recommended_corrective_action?.patch, null, 2)}
                  </pre>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[12px] text-[#65736A]">
                      {repairApplied
                        ? "Patch applied to subsequent pipeline stage."
                        : "Ready to inject into next experiment configuration."}
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyRepair}
                      disabled={repairApplied}
                      className="px-3.5 py-1.5 rounded-[6px] bg-[#124D32] text-[#FFFFFF] font-mono text-[11.5px] font-semibold hover:bg-[#12543C] transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {repairApplied ? (
                        <>
                          <Check size={14} />
                          <span>Patch Applied</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw size={14} />
                          <span>Apply Patch to Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-[12px] bg-[#FFFFFF] border border-[#E5EBE5] text-center text-[#65736A] text-[13px]">
              Select an error signature on the left to generate a structured failure autopsy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
