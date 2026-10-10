"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Cpu,
  Layers,
  Sparkles,
  Play,
  Check,
} from "lucide-react";

export default function EvolutionTimelinePage() {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningStep, setRunningStep] = useState<number | null>(null);
  const [activeStepDetail, setActiveStepDetail] = useState<any>(null);

  const loadTimeline = async () => {
    try {
      const data = await api.getEvolutionTimeline();
      setTimelineData(data);
      if (data.timeline && data.timeline.length > 0) {
        setActiveStepDetail(data.timeline[data.timeline.length - 1]);
      }
    } catch (err) {
      console.error("Failed to load evolution timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, []);

  const handleRunStep = async (stepIndex: number) => {
    setRunningStep(stepIndex);
    try {
      await api.runEvolutionStep(stepIndex);
      await loadTimeline();
    } catch (err: any) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setRunningStep(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1500px] mx-auto text-[#F0F4F1] pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(174,202,196,0.12)]">
        <div>
          <div className="font-mono text-[10px] text-[#55D6A1] uppercase tracking-[0.14em] font-medium mb-1">
            CLOSED-LOOP RESEARCH / ADAPTIVE PLANNING
          </div>
          <h1 className="font-sans text-[28px] sm:text-[32px] font-bold text-[#F0F4F1] tracking-[-0.02em] m-0">
            Evolution Timeline
          </h1>
          <p className="font-sans text-[13.5px] text-[#A7B5B2] mt-1 m-0 max-w-[720px]">
            Demonstrating self-improving scientific experimentation: how EvolveX diagnoses matrix singularity in EXP-001, applies L2 shrinkage in EXP-002, and advances to non-linear tree ensembles in EXP-003.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace/experiments/new"
            className="px-4 py-2 rounded-[9px] bg-[#55D6A1] text-[#080C0D] font-mono text-[12px] font-semibold hover:bg-[#6be0ad] transition-all flex items-center gap-2 shadow-[0_0_16px_rgba(85,214,161,0.25)]"
          >
            <Play size={14} />
            <span>Launch Next Iteration</span>
          </Link>
        </div>
      </div>

      {/* Evolution Mechanism Banner */}
      <div className="p-4 rounded-[14px] glass-panel border border-[rgba(182,154,114,0.3)] bg-[rgba(182,154,114,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <BrainCircuit size={22} className="text-[#B69A72] shrink-0 mt-0.5" />
          <div>
            <div className="font-sans text-[14px] font-bold text-[#F0F4F1]">
              The Evolving Feedback Loop in Action
            </div>
            <div className="text-[12px] text-[#A7B5B2] leading-relaxed mt-0.5">
              {timelineData?.learning_evidence_summary ||
                "Research Input → Experiment Planning → Execution → Evaluation → Failure Analysis → Research Memory → Improved Next Experiment."}
            </div>
          </div>
        </div>
        <div className="font-mono text-[11px] text-[#55D6A1] bg-[rgba(85,214,161,0.12)] border border-[rgba(85,214,161,0.25)] px-3 py-1.5 rounded-[8px] shrink-0">
          Current Iteration: #{timelineData?.current_iteration || 3}
        </div>
      </div>

      {/* Main Grid: Timeline Stepper & Step Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chronological Stepper (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="font-sans text-[16px] font-bold text-[#F0F4F1] flex items-center gap-2 m-0">
            <GitCommit size={18} className="text-[#55D6A1]" />
            Chronological Experiment Progression
          </h2>

          <div className="flex flex-col gap-4">
            {(timelineData?.timeline || []).map((step: any, idx: number) => {
              const isSelected = activeStepDetail?.experiment_id === step.experiment_id;
              const isFailed = step.status.includes("FAILED");

              return (
                <div
                  key={step.experiment_id || idx}
                  onClick={() => setActiveStepDetail(step)}
                  className={`p-4 rounded-[14px] glass-panel cursor-pointer transition-all border ${
                    isSelected
                      ? "border-[#55D6A1] bg-[rgba(17,27,29,0.85)] shadow-[0_0_20px_rgba(85,214,161,0.15)]"
                      : "border-[rgba(174,202,196,0.12)] hover:border-[rgba(174,202,196,0.25)]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[rgba(174,202,196,0.08)]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[rgba(85,214,161,0.12)] text-[#55D6A1] font-semibold">
                        STEP 0{step.step_index || idx + 1}
                      </span>
                      <span className="font-mono text-[12px] text-[#A7B5B2]">{step.experiment_id}</span>
                      <span className="font-sans text-[13.5px] font-bold text-[#F0F4F1]">{step.name}</span>
                    </div>

                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                        isFailed
                          ? "bg-[rgba(239,68,68,0.15)] text-red-400 border border-[rgba(239,68,68,0.3)]"
                          : "bg-[rgba(85,214,161,0.15)] text-[#55D6A1] border border-[rgba(85,214,161,0.3)]"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#738581]">MODEL</span>
                      <span className="text-[12px] font-sans font-medium text-[#F0F4F1] truncate">
                        {step.model_name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#738581]">MAE (eV)</span>
                      <span className="text-[12px] font-mono font-semibold text-[#55D6A1]">
                        {step.metrics?.mae != null ? `${step.metrics.mae} eV` : "N/A (Failed)"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#738581]">R² SCORE</span>
                      <span className="text-[12px] font-mono font-semibold text-[#F0F4F1]">
                        {step.metrics?.r2 != null ? step.metrics.r2 : "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#738581]">LATENCY</span>
                      <span className="text-[12px] font-mono text-[#A7B5B2]">
                        {step.metrics?.latency_us ? `${(step.metrics.latency_us / 1000).toFixed(1)} ms` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Transition Rationale Callout */}
                  <div className="mt-3 p-2.5 rounded-[8px] bg-[rgba(12,18,20,0.5)] border border-[rgba(174,202,196,0.06)] flex items-start gap-2 text-[11.5px] leading-relaxed">
                    <RotateCcw size={13} className="text-[#B69A72] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#B69A72]">Lesson Learned: </strong>
                      <span className="text-[#A7B5B2]">{step.lesson_learned}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Step Inspector & Memory Link (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="font-sans text-[16px] font-bold text-[#F0F4F1] flex items-center gap-2 m-0">
            <Sparkles size={18} className="text-[#B69A72]" />
            Evidence & Memory Trace
          </h2>

          {activeStepDetail ? (
            <div className="p-5 rounded-[16px] glass-panel-elevated border border-[rgba(182,154,114,0.3)] flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(174,202,196,0.12)]">
                <div>
                  <div className="font-mono text-[10px] text-[#55D6A1] uppercase font-semibold">
                    INSPECTING {activeStepDetail.experiment_id}
                  </div>
                  <div className="font-sans text-[16px] font-bold text-[#F0F4F1] mt-0.5">
                    {activeStepDetail.name}
                  </div>
                </div>
                <div className="font-mono text-[11px] text-[#A7B5B2] bg-[rgba(174,202,196,0.08)] px-2.5 py-1 rounded">
                  Target: bandgap_energy_ev
                </div>
              </div>

              {/* Observed Problem */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10.5px] text-[#738581] uppercase font-semibold">
                  Observed Problem / Limitation
                </span>
                <p className="text-[12px] text-[#F0F4F1] bg-[rgba(12,18,20,0.6)] p-3 rounded-[8px] border border-[rgba(174,202,196,0.08)] leading-relaxed m-0 font-mono">
                  {activeStepDetail.observed_problem}
                </p>
              </div>

              {/* Research Memory Link */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10.5px] text-[#B69A72] uppercase font-semibold flex items-center gap-1.5">
                  <BrainCircuit size={13} />
                  Associated Memory Record
                </span>
                <div className="p-3 rounded-[8px] bg-[rgba(182,154,114,0.08)] border border-[rgba(182,154,114,0.25)] flex flex-col gap-1">
                  <div className="font-mono text-[11px] text-[#B69A72] font-semibold">
                    {activeStepDetail.memory_reference_id}
                  </div>
                  <div className="text-[12px] text-[#A7B5B2] leading-relaxed">
                    {activeStepDetail.lesson_learned}
                  </div>
                </div>
              </div>

              {/* Action Taken */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10.5px] text-[#55D6A1] uppercase font-semibold">
                  Action Taken by Adaptive Planner
                </span>
                <p className="text-[12px] text-[#A7B5B2] m-0 leading-relaxed">
                  {activeStepDetail.action_taken}
                </p>
              </div>

              {/* Metrics Breakdown */}
              <div className="pt-2 border-t border-[rgba(174,202,196,0.1)]">
                <span className="font-mono text-[10.5px] text-[#738581] uppercase font-semibold block mb-2">
                  Validation Metrics Summary
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-[8px] bg-[rgba(12,18,20,0.6)] border border-[rgba(174,202,196,0.08)]">
                    <div className="font-mono text-[10px] text-[#738581]">MAE</div>
                    <div className="font-mono text-[13px] font-bold text-[#55D6A1] mt-0.5">
                      {activeStepDetail.metrics?.mae != null ? `${activeStepDetail.metrics.mae} eV` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-[rgba(12,18,20,0.6)] border border-[rgba(174,202,196,0.08)]">
                    <div className="font-mono text-[10px] text-[#738581]">RMSE</div>
                    <div className="font-mono text-[13px] font-bold text-[#F0F4F1] mt-0.5">
                      {activeStepDetail.metrics?.rmse != null ? `${activeStepDetail.metrics.rmse} eV` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-[rgba(12,18,20,0.6)] border border-[rgba(174,202,196,0.08)]">
                    <div className="font-mono text-[10px] text-[#738581]">R² SCORE</div>
                    <div className="font-mono text-[13px] font-bold text-[#F0F4F1] mt-0.5">
                      {activeStepDetail.metrics?.r2 != null ? activeStepDetail.metrics.r2 : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-[16px] glass-panel text-center text-[#738581] text-[13px]">
              Select an experiment step on the left to inspect its evidence trace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
