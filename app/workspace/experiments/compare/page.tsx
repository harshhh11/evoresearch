"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ScientificEvaluation, Run, Project, Dataset } from "@/lib/api";
import {
  Scale,
  BrainCircuit,
  Zap,
  TrendingUp,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw
} from "lucide-react";

export default function CompareExperimentsPage() {
  const [evaluations, setEvaluations] = useState<ScientificEvaluation[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  // Benchmarking trigger
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [cpuBudget, setCpuBudget] = useState(20.0);
  const [trialsPerCond, setTrialsPerCond] = useState(6);

  const loadAll = async () => {
    try {
      const [evList, pList, dList, expList] = await Promise.all([
        api.getEvaluations(),
        api.getProjects(),
        api.getDatasets(),
        api.getExperiments(),
      ]);
      setEvaluations(evList);
      setProjects(pList);
      setDatasets(dList);
      setExperiments(expList);
      if (pList.length && !selectedProjectId) setSelectedProjectId(pList[0].id);
      if (dList.length && !selectedDatasetId) setSelectedDatasetId(dList[0].id);
    } catch (err) {
      console.error("Failed to load comparisons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRunEvaluation = async () => {
    if (!selectedProjectId || !selectedDatasetId) {
      alert("Please select a project and dataset.");
      return;
    }
    setRunning(true);
    try {
      await api.runEvaluation({
        project_id: selectedProjectId,
        name: `Controlled Evaluation — ${new Date().toLocaleTimeString()}`,
        dataset_id: selectedDatasetId,
        cpu_budget_seconds: cpuBudget,
        trials_per_condition: trialsPerCond,
      });
      await loadAll();
    } catch (err: any) {
      alert(err.message || "Benchmark failed");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>
        LOADING COMPARATIVE RESEARCH EVIDENCE...
      </div>
    );
  }

  const latestEval = evaluations.length ? evaluations[0] : null;
  let condA: any = null;
  let condB: any = null;
  let condC: any = null;

  if (latestEval) {
    try {
      condA = JSON.parse(latestEval.condition_a_results || "{}");
      condB = JSON.parse(latestEval.condition_b_results || "{}");
      condC = JSON.parse(latestEval.condition_c_results || "{}");
    } catch {}
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
          SCIENTIFIC EVALUATION // 003
        </div>
        <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#e8ede8" }}>
          Comparative Evaluation & Evidence Benchmarks
        </h1>
        <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0", maxWidth: 800 }}>
          Controlled 3-condition empirical investigation: evaluating standard Optuna versus success-only memory
          versus evidence-validated failure-and-recovery memory under strictly identical CPU-time budgets and random seeds.
        </p>
      </div>

      {/* Benchmark Execution Card */}
      <div className="research-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Scale size={16} color="#b5ff8a" />
            <span style={{ font: "600 12px var(--mono)", color: "#e8ede8", letterSpacing: "0.06em" }}>
              RUN CONTROLLED A/B/C EXPERIMENT
            </span>
          </div>
          <span style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>
            FIXED CPU BUDGET & REPRODUCIBLE SPLITS
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1fr auto", gap: 14, alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
              PROJECT
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
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
              BENCHMARK DATASET
            </label>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.task_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
              CPU BUDGET / COND (s)
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={cpuBudget}
              onChange={(e) => setCpuBudget(parseFloat(e.target.value) || 20.0)}
              style={{ width: "100%", padding: "8px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
            />
          </div>

          <div>
            <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
              TRIALS / COND
            </label>
            <input
              type="number"
              min={3}
              max={15}
              value={trialsPerCond}
              onChange={(e) => setTrialsPerCond(parseInt(e.target.value) || 6)}
              style={{ width: "100%", padding: "8px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
            />
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={running}
            style={{
              padding: "9px 20px",
              background: running ? "#557a44" : "#b5ff8a",
              border: "1px solid #b5ff8a",
              color: "#050706",
              borderRadius: 3,
              font: "600 10px var(--mono)",
              letterSpacing: "0.08em",
              cursor: running ? "not-allowed" : "pointer"
            }}
          >
            {running ? "EVALUATING..." : "START EVALUATION"}
          </button>
        </div>
      </div>

      {/* Latest Evaluation Head-to-Head */}
      {latestEval && condA && condB && condC ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Scientific Conclusion Box */}
          <div className="research-card research-card--highlight">
            <div style={{ font: "600 11px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.08em", marginBottom: 8 }}>
              EMPIRICAL FINDINGS & STATISTICAL CONCLUSION
            </div>
            <p style={{ font: "400 13px/1.7 var(--body)", color: "#e8ede8", margin: 0 }}>
              {latestEval.conclusion}
            </p>
          </div>

          {/* 3 Conditions Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 18 }}>
            {/* Condition A */}
            <div className="research-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ font: "600 11px var(--mono)", color: "#e8ede8" }}>CONDITION A: STANDARD OPTUNA</span>
                <span className="status-tag status-tag--planned">BASELINE</span>
              </div>
              <p style={{ font: "400 11px/1.4 var(--body)", color: "#8c9c91", minHeight: 32 }}>
                Standard hyperparameter optimization without memory of previous runtime failures.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>COMPLETION RATE:</span>
                  <strong style={{ color: "#e8ede8" }}>{condA.completion_rate}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>BEST VALIDATED F1:</span>
                  <strong style={{ color: "#b5ff8a" }}>{condA.best_validated_f1}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>COMPLETED / ATTEMPTS:</span>
                  <span>{condA.completed_trials} / {condA.total_attempts}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>WALL CLOCK TIME:</span>
                  <span>{condA.wall_clock_time_s}s</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>RECOVERY ATTEMPTS:</span>
                  <span>0 (None)</span>
                </div>
              </div>
            </div>

            {/* Condition B */}
            <div className="research-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ font: "600 11px var(--mono)", color: "#a7e9e8" }}>CONDITION B: SUCCESS-ONLY MEMORY</span>
                <span className="status-tag status-tag--running">WARM START</span>
              </div>
              <p style={{ font: "400 11px/1.4 var(--body)", color: "#8c9c91", minHeight: 32 }}>
                Optimizer retrieves previously successful hyperparameter records, but does not use error repair memory.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>COMPLETION RATE:</span>
                  <strong style={{ color: "#a7e9e8" }}>{condB.completion_rate}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>BEST VALIDATED F1:</span>
                  <strong style={{ color: "#b5ff8a" }}>{condB.best_validated_f1}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>COMPLETED / ATTEMPTS:</span>
                  <span>{condB.completed_trials} / {condB.total_attempts}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>WALL CLOCK TIME:</span>
                  <span>{condB.wall_clock_time_s}s</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>RETRIEVAL OVERHEAD:</span>
                  <span>{condB.memory_retrieval_overhead_ms} ms</span>
                </div>
              </div>
            </div>

            {/* Condition C */}
            <div className="research-card" style={{ border: "1px solid rgba(181, 255, 138, 0.35)", background: "rgba(16, 26, 21, 0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ font: "600 11px var(--mono)", color: "#b5ff8a" }}>CONDITION C: FAILURE-AND-RECOVERY</span>
                <span className="status-tag status-tag--completed">PROPOSED</span>
              </div>
              <p style={{ font: "400 11px/1.4 var(--body)", color: "#8c9c91", minHeight: 32 }}>
                Workflow actively matches observed error signatures against verified recovery procedures.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>COMPLETION RATE:</span>
                  <strong style={{ color: "#b5ff8a" }}>{condC.completion_rate}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>BEST VALIDATED F1:</span>
                  <strong style={{ color: "#b5ff8a" }}>{condC.best_validated_f1}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>RECOVERY SUCCESS RATE:</span>
                  <strong style={{ color: "#d8b4fe" }}>{condC.recovery_success_rate}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>REPAIRS / ATTEMPTS:</span>
                  <span>{condC.recovery_successes} / {condC.recovery_attempts}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", font: "400 11px var(--mono)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", paddingBottom: 6 }}>
                  <span style={{ color: "#7e9084" }}>RETRIEVAL OVERHEAD:</span>
                  <span>{condC.memory_retrieval_overhead_ms} ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="research-card" style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
          No scientific evaluations executed yet. Click "START EVALUATION" above to begin the controlled A/B/C benchmark.
        </div>
      )}
    </div>
  );
}
