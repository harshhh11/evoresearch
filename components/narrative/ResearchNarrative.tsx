"use client";

import { HeroSection } from "./HeroSection";
import { SiteFooter } from "./SiteFooter";
import { WorkspaceCTA } from "./WorkspaceCTA";
import {
  Brain,
  Cpu,
  Database,
  FileCode,
  FileText,
  GitBranch,
  Layers,
  LineChart,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react";

const CAPABILITIES = [
  {
    icon: FileText,
    title: "Research Question & Paper Analysis",
    description: "Ingest research questions or reference papers to automatically extract core hypotheses, methodologies, datasets, and baseline metrics."
  },
  {
    icon: GitBranch,
    title: "AI Agent Orchestration",
    description: "12 specialized autonomous agents operate in a directed workflow DAG with strict dependency checks, timeouts, and state persistence."
  },
  {
    icon: Database,
    title: "Dataset Validation",
    description: "Inspect raw tabular and scientific data, handle missing values, align target variables, and construct leak-free train/validation/test splits."
  },
  {
    icon: Brain,
    title: "Intelligent Model Selection",
    description: "Evaluate task constraints, dataset characteristics, and compute budgets to select task-appropriate baseline and candidate architectures."
  },
  {
    icon: FileCode,
    title: "Research Code Generation",
    description: "Synthesize complete, multi-file Python experiment repositories including data loaders, model definitions, training loops, and evaluation scripts."
  },
  {
    icon: Zap,
    title: "Real Experiment Execution",
    description: "Execute code in isolated execution environments with live stdout/stderr logging, wall-clock deadline enforcement, and hardware metrics."
  },
  {
    icon: LineChart,
    title: "Metrics and Evaluation",
    description: "Compute task-specific ground truth evaluation metrics (Accuracy, F1-Score, RMSE, MAE, R²) and compare directly against baseline trials."
  },
  {
    icon: ShieldAlert,
    title: "Failure Diagnosis & Recovery",
    description: "Detect stacktraces, numerical instabilities, or zero-variance targets, automatically diagnosing root causes and executing targeted retries."
  },
  {
    icon: Layers,
    title: "Persistent Research Memory",
    description: "Commit verified experiment outcomes, code revisions, and failure lessons into persistent vector memory for future experiment planning."
  },
  {
    icon: Sparkles,
    title: "Reproducible Reports",
    description: "Generate comprehensive scientific reports complete with LaTeX mathematical formulations, code manifests, and downloadable model artifacts."
  }
];

const WORKFLOW_STEPS = [
  { step: "01", title: "Research Question", desc: "Define research goal, dataset, task type, and compute budget." },
  { step: "02", title: "Research Planning", desc: "Planner and analysis agents formulate the structured experiment plan." },
  { step: "03", title: "Agent Orchestration", desc: "12 agents schedule data preparation, environment checks, and compute allocation." },
  { step: "04", title: "Code Generation", desc: "Synthesize executable multi-file Python source code with deterministic seeds." },
  { step: "05", title: "Experiment Execution", desc: "Run model training in an isolated sandbox and stream execution logs." },
  { step: "06", title: "Evaluation", desc: "Compute exact performance metrics and evaluate predictions against baseline." },
  { step: "07", title: "Research Insights", desc: "Store outcomes in persistent memory and publish a reproducible research report." }
];

export function ResearchNarrative() {
  return (
    <div className="research-journey" style={{ background: "#F8F6EF", color: "#26352D" }}>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Capabilities Section */}
      <section id="capabilities" style={{ padding: "60px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ font: "600 11px var(--mono)", color: "#176B4D", letterSpacing: "0.1em", marginBottom: 6 }}>
            02 / 07 — SYSTEM CAPABILITIES
          </div>
          <h2 style={{ font: "700 32px/1.2 var(--font-primary), serif", color: "#26352D", margin: 0 }}>
            End-to-End AI Research Infrastructure
          </h2>
          <p style={{ font: "400 14px/1.6 var(--font-primary), serif", color: "#68766D", marginTop: 8, maxWidth: 640 }}>
            EvolveX combines multi-agent orchestration, automatic code generation, real model execution, and persistent research memory into a single unified platform.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {CAPABILITIES.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #DFE5DC",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "0 1px 3px rgba(38, 53, 45, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#E6F0E9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} className="text-[#176B4D]" />
                </div>
                <div>
                  <h3 style={{ font: "600 16px/1.3 var(--font-primary), serif", color: "#26352D", margin: "0 0 6px 0" }}>
                    {cap.title}
                  </h3>
                  <p style={{ font: "400 13px/1.5 var(--font-primary), serif", color: "#68766D", margin: 0 }}>
                    {cap.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" style={{ padding: "60px 24px", maxWidth: 1200, margin: "0 auto", borderTop: "1px solid #DFE5DC" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ font: "600 11px var(--mono)", color: "#176B4D", letterSpacing: "0.1em", marginBottom: 6 }}>
            03 / 07 — RESEARCH LIFECYCLE
          </div>
          <h2 style={{ font: "700 32px/1.2 var(--font-primary), serif", color: "#26352D", margin: 0 }}>
            How EvolveX Executes Research
          </h2>
          <p style={{ font: "400 14px/1.6 var(--font-primary), serif", color: "#68766D", marginTop: 8, maxWidth: 640 }}>
            From raw research questions to verified insights in 7 automated, auditable stages.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {WORKFLOW_STEPS.map((wf, idx) => (
            <div
              key={idx}
              style={{
                background: "#FFFFFF",
                border: "1px solid #DFE5DC",
                borderRadius: 10,
                padding: "16px 20px",
                display: "grid",
                gridTemplateColumns: "60px 220px 1fr",
                alignItems: "center",
                gap: 16
              }}
            >
              <span style={{ font: "700 14px var(--mono)", color: "#176B4D" }}>{wf.step}</span>
              <span style={{ font: "600 15px var(--font-primary), serif", color: "#26352D" }}>{wf.title}</span>
              <span style={{ font: "400 13px var(--font-primary), serif", color: "#68766D" }}>{wf.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Workspace CTA & Footer */}
      <div style={{ padding: "40px 24px 0" }}>
        <WorkspaceCTA />
        <SiteFooter />
      </div>
    </div>
  );
}
