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
  Bot,
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
    <div className="flex flex-col gap-6 w-full max-w-[1500px] mx-auto text-[#26352D] pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFE5DC]">
        <div>
          <div className="font-mono text-[10.5px] text-[#176B4D] uppercase tracking-[0.14em] font-semibold mb-1">
            CLOSED-LOOP RESEARCH / ADAPTIVE PLANNING
          </div>
          <h1 className="font-serif text-[28px] sm:text-[32px] font-bold text-[#26352D] tracking-[-0.01em] m-0">
            Evolution Timeline
          </h1>
          <p className="font-sans text-[13.5px] text-[#68766D] mt-1 m-0 max-w-[720px]">
            Demonstrating self-improving scientific experimentation: how EvolveX diagnoses matrix singularity in EXP-001, applies L2 shrinkage in EXP-002, and advances to non-linear tree ensembles in EXP-003.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workspace/orchestration"
            className="px-3.5 py-2 rounded-[8px] bg-[#E6F0E9] border border-[#176B4D] text-[#176B4D] font-mono text-[12px] font-semibold hover:bg-[#176B4D] hover:text-[#FFFFFF] transition-all flex items-center gap-2"
          >
            <Bot size={14} />
            <span>Multi-Agent Hub</span>
          </Link>

          <Link
            href="/workspace/experiments/new"
            className="px-4 py-2 rounded-[8px] bg-[#176B4D] text-[#FFFFFF] font-mono text-[12px] font-semibold hover:bg-[#12543C] transition-all flex items-center gap-2 shadow-[0_2px_8px_rgba(23,107,77,0.25)]"
          >
            <Play size={14} />
            <span>Launch Next Iteration</span>
          </Link>
        </div>
      </div>

      {/* Evolution Mechanism Banner */}
      <div className="p-4 rounded-[12px] bg-[#FFFFFF] border border-[#DFE5DC] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <BrainCircuit size={22} className="text-[#176B4D] shrink-0 mt-0.5" />
          <div>
            <div className="font-serif text-[15px] font-bold text-[#26352D]">
              The Evolving Feedback Loop in Action
            </div>
            <div className="text-[12.5px] text-[#68766D] leading-relaxed mt-0.5">
              {timelineData?.learning_evidence_summary ||
                "Research Input → Experiment Planning → Execution → Evaluation → Failure Analysis → Research Memory → Improved Next Experiment."}
            </div>
          </div>
        </div>
        <div className="font-mono text-[11px] text-[#176B4D] bg-[#E8F5EC] border border-[rgba(23,107,77,0.25)] px-3 py-1.5 rounded-[8px] shrink-0 font-semibold">
          Current Iteration: #{timelineData?.current_iteration || 3}
        </div>
      </div>

      {/* Main Grid: Timeline Stepper & Step Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chronological Stepper (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h2 className="font-serif text-[17px] font-bold text-[#26352D] flex items-center gap-2 m-0">
            <GitCommit size={18} className="text-[#176B4D]" />
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
                  className={`p-4 rounded-[12px] transition-all cursor-pointer border ${
                    isSelected
                      ? "border-[#176B4D] bg-[#FFFFFF] ring-2 ring-[#E6F0E9] shadow-md"
                      : "border-[#DFE5DC] bg-[#FFFFFF] hover:border-[#C4D0C0]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#DFE5DC]">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#E8F5EC] text-[#176B4D] font-semibold">
                        STEP 0{step.step_index || idx + 1}
                      </span>
                      <span className="font-mono text-[12px] text-[#68766D]">{step.experiment_id}</span>
                      <span className="font-serif text-[14px] font-bold text-[#26352D]">{step.name}</span>
                    </div>

                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                        isFailed
                          ? "bg-[rgba(181,71,71,0.1)] text-[#B54747] border border-[rgba(181,71,71,0.3)]"
                          : "bg-[#E8F5EC] text-[#176B4D] border border-[rgba(23,107,77,0.3)]"
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[12px]">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#68766D] uppercase">MODEL</span>
                      <span className="text-[12.5px] font-sans font-medium text-[#26352D] truncate">
                        {step.model_name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#68766D] uppercase">MAE (eV)</span>
                      <span className="text-[12.5px] font-mono font-bold text-[#176B4D]">
                        {step.metrics?.mae != null ? `${step.metrics.mae} eV` : "N/A (Failed)"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#68766D] uppercase">R² SCORE</span>
                      <span className="text-[12.5px] font-mono font-semibold text-[#26352D]">
                        {step.metrics?.r2 != null ? step.metrics.r2 : "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#68766D] uppercase">LATENCY</span>
                      <span className="text-[12.5px] font-mono text-[#68766D]">
                        {step.metrics?.latency_us ? `${(step.metrics.latency_us / 1000).toFixed(1)} ms` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Transition Rationale Callout */}
                  <div className="mt-3 p-2.5 rounded-[8px] bg-[#F8F6EF] border border-[#DFE5DC] flex items-start gap-2 text-[12px] leading-relaxed">
                    <RotateCcw size={14} className="text-[#176B4D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#176B4D] font-serif">Lesson Learned: </strong>
                      <span className="text-[#68766D]">{step.lesson_learned}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Step Inspector & Memory Link (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="font-serif text-[17px] font-bold text-[#26352D] flex items-center gap-2 m-0">
            <Sparkles size={18} className="text-[#176B4D]" />
            Evidence & Memory Trace
          </h2>

          {activeStepDetail ? (
            <div className="p-5 rounded-[12px] bg-[#FFFFFF] border border-[#DFE5DC] flex flex-col gap-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#DFE5DC]">
                <div>
                  <div className="font-mono text-[10.5px] text-[#176B4D] uppercase font-semibold">
                    INSPECTING {activeStepDetail.experiment_id}
                  </div>
                  <div className="font-serif text-[17px] font-bold text-[#26352D] mt-0.5">
                    {activeStepDetail.name}
                  </div>
                </div>
                <div className="font-mono text-[11px] text-[#68766D] bg-[#F8F6EF] border border-[#DFE5DC] px-2.5 py-1 rounded">
                  Target: bandgap_energy_ev
                </div>
              </div>

              {/* Observed Problem */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10.5px] text-[#68766D] uppercase font-semibold">
                  Observed Problem / Limitation
                </span>
                <p className="text-[12.5px] text-[#26352D] bg-[#F8F6EF] p-3 rounded-[8px] border border-[#DFE5DC] leading-relaxed m-0 font-sans">
                  {activeStepDetail.observed_problem}
                </p>
              </div>

              {/* Research Memory Link */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10.5px] text-[#176B4D] uppercase font-semibold flex items-center gap-1.5">
                  <BrainCircuit size={14} />
                  Associated Memory Record
                </span>
                <div className="p-3 rounded-[8px] bg-[#E8F5EC] border border-[rgba(23,107,77,0.3)] flex flex-col gap-1">
                  <div className="font-mono text-[11px] text-[#176B4D] font-bold">
                    {activeStepDetail.memory_reference_id}
                  </div>
                  <div className="text-[12px] text-[#26352D] leading-relaxed">
                    {activeStepDetail.lesson_learned}
                  </div>
                </div>
              </div>

              {/* Action Taken */}
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10.5px] text-[#176B4D] uppercase font-semibold">
                  Action Taken by Adaptive Planner
                </span>
                <p className="text-[12.5px] text-[#68766D] m-0 leading-relaxed">
                  {activeStepDetail.action_taken}
                </p>
              </div>

              {/* Metrics Breakdown */}
              <div className="pt-2 border-t border-[#DFE5DC]">
                <span className="font-mono text-[10.5px] text-[#68766D] uppercase font-semibold block mb-2">
                  Validation Metrics Summary
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-[8px] bg-[#F8F6EF] border border-[#DFE5DC]">
                    <div className="font-mono text-[10px] text-[#68766D]">MAE</div>
                    <div className="font-mono text-[13px] font-bold text-[#176B4D] mt-0.5">
                      {activeStepDetail.metrics?.mae != null ? `${activeStepDetail.metrics.mae} eV` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-[#F8F6EF] border border-[#DFE5DC]">
                    <div className="font-mono text-[10px] text-[#68766D]">RMSE</div>
                    <div className="font-mono text-[13px] font-bold text-[#26352D] mt-0.5">
                      {activeStepDetail.metrics?.rmse != null ? `${activeStepDetail.metrics.rmse} eV` : "N/A"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-[#F8F6EF] border border-[#DFE5DC]">
                    <div className="font-mono text-[10px] text-[#68766D]">R² SCORE</div>
                    <div className="font-mono text-[13px] font-bold text-[#26352D] mt-0.5">
                      {activeStepDetail.metrics?.r2 != null ? activeStepDetail.metrics.r2 : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-[12px] bg-[#FFFFFF] border border-[#DFE5DC] text-center text-[#68766D] text-[13px]">
              Select an experiment step on the left to inspect its evidence trace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
