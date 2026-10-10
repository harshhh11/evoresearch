"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  api,
  PlatformStats,
  Project,
  Experiment,
  RecoveryMemory,
  ScientificEvaluation
} from "@/lib/api";
import {
  Activity,
  BrainCircuit,
  Cpu,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  Scale
} from "lucide-react";

export default function WorkspaceOverviewPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [memories, setMemories] = useState<RecoveryMemory[]>([]);
  const [evaluations, setEvaluations] = useState<ScientificEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [benchmarking, setBenchmarking] = useState(false);
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectQuestion, setNewProjectQuestion] = useState("");
  const [newProjectHypothesis, setNewProjectHypothesis] = useState("");

  const loadData = async () => {
    try {
      const [s, p, e, m, ev] = await Promise.all([
        api.getStats(),
        api.getProjects(),
        api.getExperiments(),
        api.getMemory(),
        api.getEvaluations(),
      ]);
      setStats(s);
      setProjects(p);
      setExperiments(e);
      setMemories(m);
      setEvaluations(ev);
    } catch (err) {
      console.error("Failed to load workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await api.createProject({
        name: newProjectName,
        research_question: newProjectQuestion,
        hypothesis: newProjectHypothesis,
      });
      setNewProjectModal(false);
      setNewProjectName("");
      setNewProjectQuestion("");
      setNewProjectHypothesis("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create project");
    }
  };

  const handleRunQuickBenchmark = async () => {
    if (!projects.length) {
      alert("Please create or select a project first.");
      return;
    }
    setBenchmarking(true);
    try {
      const datasets = await api.getDatasets();
      if (!datasets.length) throw new Error("No datasets found.");
      await api.runEvaluation({
        project_id: projects[0].id,
        name: "Standardized 3-Condition Empirical Evaluation",
        dataset_id: datasets[0].id,
        cpu_budget_seconds: 15.0,
        trials_per_condition: 5,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Benchmark execution failed.");
    } finally {
      setBenchmarking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>
        INITIALIZING RESEARCH DATASTORE & PROFILING TELEMETRY...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div>
          <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
            SYSTEM DASHBOARD // 001
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", letterSpacing: "-0.01em", color: "#e8ede8" }}>
            Research Overview & Empirical Telemetry
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0", maxWidth: 720 }}>
            Investigating evidence-validated failure-and-recovery memory mechanisms under strict CPU-time budgets.
            All metrics are computed from verified database execution entities.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setNewProjectModal(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(226, 239, 229, 0.08)",
              border: "1px solid rgba(226, 239, 229, 0.16)",
              color: "#e8ede8",
              font: "500 10px/1 var(--mono)",
              letterSpacing: "0.08em",
              borderRadius: 3,
              cursor: "pointer"
            }}
          >
            <FolderPlus size={13} />
            <span>NEW PROJECT</span>
          </button>

          <button
            onClick={handleRunQuickBenchmark}
            disabled={benchmarking}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: benchmarking ? "#557a44" : "#b5ff8a",
              border: "1px solid #b5ff8a",
              color: "#050706",
              font: "600 10px/1 var(--mono)",
              letterSpacing: "0.08em",
              borderRadius: 3,
              cursor: benchmarking ? "not-allowed" : "pointer"
            }}
          >
            <Scale size={13} />
            <span>{benchmarking ? "BENCHMARKING A/B/C..." : "RUN A/B/C BENCHMARK"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        <div className="research-card">
          <div style={{ font: "400 9px/1 var(--mono)", color: "#7e9084", letterSpacing: "0.08em" }}>
            COMPLETED EXPERIMENTS
          </div>
          <div className="metric-number" style={{ font: "600 28px/1.2 var(--mono)", color: "#e8ede8", marginTop: 8 }}>
            {stats?.completed_experiments ?? 0}
            <span style={{ fontSize: 13, color: "#7e9084", fontWeight: 400 }}> / {stats?.total_experiments ?? 0}</span>
          </div>
          <div style={{ font: "400 10px var(--mono)", color: "#9ba8a0", marginTop: 8 }}>
            {stats?.running_experiments ? `${stats.running_experiments} currently running` : "Execution pipeline idle"}
          </div>
        </div>

        <div className="research-card research-card--highlight">
          <div style={{ font: "400 9px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.08em" }}>
            SUCCESSFUL RECOVERY RATE
          </div>
          <div className="metric-number" style={{ font: "600 28px/1.2 var(--mono)", color: "#b5ff8a", marginTop: 8 }}>
            {stats?.recovery_rate_pct ?? 0}%
          </div>
          <div style={{ font: "400 10px var(--mono)", color: "#a7e9e8", marginTop: 8 }}>
            {stats?.recovered_runs ?? 0} repaired and validated runs
          </div>
        </div>

        <div className="research-card">
          <div style={{ font: "400 9px/1 var(--mono)", color: "#7e9084", letterSpacing: "0.08em" }}>
            BEST VALIDATED SCORE
          </div>
          <div className="metric-number" style={{ font: "600 28px/1.2 var(--mono)", color: "#e8ede8", marginTop: 8 }}>
            {stats?.best_validated_score ? stats.best_validated_score.toFixed(4) : "—"}
          </div>
          <div style={{ font: "400 10px var(--mono)", color: "#9ba8a0", marginTop: 8 }}>
            Across all candidate models
          </div>
        </div>

        <div className="research-card">
          <div style={{ font: "400 9px/1 var(--mono)", color: "#7e9084", letterSpacing: "0.08em" }}>
            MEASURED CPU TIME
          </div>
          <div className="metric-number" style={{ font: "600 28px/1.2 var(--mono)", color: "#e8ede8", marginTop: 8 }}>
            {stats?.total_cpu_time_s ? `${stats.total_cpu_time_s.toFixed(1)}s` : "0.0s"}
          </div>
          <div style={{ font: "400 10px var(--mono)", color: "#9ba8a0", marginTop: 8 }}>
            High-res process execution sum
          </div>
        </div>

        <div className="research-card">
          <div style={{ font: "400 9px/1 var(--mono)", color: "#7e9084", letterSpacing: "0.08em" }}>
            VERIFIED RECOVERY MEMORIES
          </div>
          <div className="metric-number" style={{ font: "600 28px/1.2 var(--mono)", color: "#a7e9e8", marginTop: 8 }}>
            {stats?.validated_memory_records ?? 0}
            <span style={{ fontSize: 13, color: "#7e9084", fontWeight: 400 }}> / {stats?.total_memory_records ?? 0}</span>
          </div>
          <div style={{ font: "400 10px var(--mono)", color: "#9ba8a0", marginTop: 8 }}>
            Persistent error repair bank
          </div>
        </div>
      </div>

      {/* Controlled Evaluation Spotlight (Condition A vs B vs C) */}
      {evaluations.length > 0 && (
        <div className="research-card" style={{ borderLeft: "4px solid #b5ff8a" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Scale size={16} color="#b5ff8a" />
              <span style={{ font: "600 12px/1 var(--mono)", letterSpacing: "0.08em", color: "#e8ede8" }}>
                CONTROLLED RESEARCH EVALUATION: {evaluations[0].name}
              </span>
            </div>
            <Link
              href="/workspace/experiments/compare"
              style={{ font: "400 10px/1 var(--mono)", color: "#b5ff8a", textDecoration: "none" }}
            >
              EXPLORE FULL COMPARISON →
            </Link>
          </div>

          <p style={{ font: "400 12px/1.6 var(--body)", color: "#c6d4c8", margin: "0 0 16px" }}>
            {evaluations[0].conclusion}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {(() => {
              try {
                const cA = JSON.parse(evaluations[0].condition_a_results || "{}");
                const cB = JSON.parse(evaluations[0].condition_b_results || "{}");
                const cC = JSON.parse(evaluations[0].condition_c_results || "{}");
                return (
                  <>
                    <div style={{ background: "rgba(5, 7, 6, 0.6)", padding: 14, border: "1px solid rgba(226, 239, 229, 0.08)", borderRadius: 3 }}>
                      <div style={{ font: "500 9px var(--mono)", color: "#9ba8a0" }}>CONDITION A: STANDARD OPTUNA</div>
                      <div style={{ font: "600 18px var(--mono)", color: "#e8ede8", margin: "6px 0" }}>{cA.completion_rate}% Completion</div>
                      <div style={{ font: "400 10px var(--mono)", color: "#7e9084" }}>Best F1: {cA.best_validated_f1} | Time: {cA.wall_clock_time_s}s</div>
                    </div>
                    <div style={{ background: "rgba(5, 7, 6, 0.6)", padding: 14, border: "1px solid rgba(226, 239, 229, 0.08)", borderRadius: 3 }}>
                      <div style={{ font: "500 9px var(--mono)", color: "#9ba8a0" }}>CONDITION B: SUCCESS-ONLY MEMORY</div>
                      <div style={{ font: "600 18px var(--mono)", color: "#a7e9e8", margin: "6px 0" }}>{cB.completion_rate}% Completion</div>
                      <div style={{ font: "400 10px var(--mono)", color: "#7e9084" }}>Best F1: {cB.best_validated_f1} | Time: {cB.wall_clock_time_s}s</div>
                    </div>
                    <div style={{ background: "rgba(181, 255, 138, 0.05)", padding: 14, border: "1px solid rgba(181, 255, 138, 0.25)", borderRadius: 3 }}>
                      <div style={{ font: "500 9px var(--mono)", color: "#b5ff8a" }}>CONDITION C: FAILURE & RECOVERY</div>
                      <div style={{ font: "600 18px var(--mono)", color: "#b5ff8a", margin: "6px 0" }}>{cC.completion_rate}% Completion</div>
                      <div style={{ font: "400 10px var(--mono)", color: "#9ba8a0" }}>Recovery Rate: {cC.recovery_success_rate}% | Overhead: {cC.memory_retrieval_overhead_ms}ms</div>
                    </div>
                  </>
                );
              } catch {
                return null;
              }
            })()}
          </div>
        </div>
      )}

      {/* Two Column Layout: Projects & Recent Experiments */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 24 }}>
        {/* Research Projects */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ font: "600 12px/1 var(--mono)", color: "#e8ede8", letterSpacing: "0.08em" }}>
              ACTIVE PROJECTS
            </span>
            <span style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>{projects.length} TOTAL</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {projects.map((p) => (
              <div
                key={p.id}
                style={{
                  background: "rgba(5, 7, 6, 0.5)",
                  border: "1px solid rgba(226, 239, 229, 0.08)",
                  padding: 16,
                  borderRadius: 3
                }}
              >
                <div style={{ font: "600 13px/1.3 var(--body)", color: "#e8ede8" }}>{p.name}</div>
                <div style={{ font: "400 11px/1.5 var(--body)", color: "#9ba8a0", margin: "6px 0 10px" }}>
                  {p.description || p.research_question || "No description provided."}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>
                    ID: {p.id.substring(0, 8)}...
                  </span>
                  <Link
                    href={`/workspace/experiments/new?project_id=${p.id}`}
                    style={{ font: "500 9px var(--mono)", color: "#b5ff8a", textDecoration: "none" }}
                  >
                    + PLAN EXPERIMENT
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Experiments Table */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ font: "600 12px/1 var(--mono)", color: "#e8ede8", letterSpacing: "0.08em" }}>
              RECENT EXPERIMENTS
            </span>
            <Link href="/workspace/experiments/new" style={{ font: "400 9px var(--mono)", color: "#b5ff8a", textDecoration: "none" }}>
              + NEW EXPERIMENT
            </Link>
          </div>

          {experiments.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
              No experiments planned yet. Click "NEW EXPERIMENT" to begin.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="mono-table">
                <thead>
                  <tr>
                    <th>EXPERIMENT</th>
                    <th>TASK</th>
                    <th>BASELINE</th>
                    <th>BUDGET</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {experiments.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ fontWeight: 500, color: "#e8ede8" }}>{exp.name}</td>
                      <td>{exp.task_type}</td>
                      <td>{exp.baseline_model}</td>
                      <td>{exp.cpu_budget_seconds}s</td>
                      <td>
                        <span
                          className={`status-tag status-tag--${
                            exp.status === "COMPLETED"
                              ? "completed"
                              : exp.status === "RUNNING"
                              ? "running"
                              : exp.status === "FAILED"
                              ? "failed"
                              : "planned"
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/workspace/experiments/${exp.id}`}
                          style={{ color: "#b5ff8a", textDecoration: "none" }}
                        >
                          VIEW →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {newProjectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(8px)" }}>
          <div style={{ background: "#0a0e0c", border: "1px solid rgba(181, 255, 138, 0.2)", borderRadius: 4, padding: 32, maxWidth: 540, width: "90%" }}>
            <h2 style={{ margin: "0 0 16px", font: "600 18px var(--body)", color: "#e8ede8" }}>Create Research Project</h2>
            <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  PROJECT NAME
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Edge Audio Sensor Anomaly Classification"
                  style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  RESEARCH QUESTION
                </label>
                <textarea
                  rows={2}
                  value={newProjectQuestion}
                  onChange={(e) => setNewProjectQuestion(e.target.value)}
                  placeholder="e.g. Can failure memory maintain high diagnostic accuracy under 15s CPU limits?"
                  style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--body)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  HYPOTHESIS
                </label>
                <textarea
                  rows={2}
                  value={newProjectHypothesis}
                  onChange={(e) => setNewProjectHypothesis(e.target.value)}
                  placeholder="e.g. Automated error imputation recovery reduces repeated pipeline crashes by >20%."
                  style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--body)" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setNewProjectModal(false)}
                  style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(226, 239, 229, 0.15)", color: "#9ba8a0", borderRadius: 3, cursor: "pointer", font: "500 10px var(--mono)" }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 18px", background: "#b5ff8a", border: "none", color: "#050706", borderRadius: 3, cursor: "pointer", font: "600 10px var(--mono)" }}
                >
                  CREATE PROJECT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
