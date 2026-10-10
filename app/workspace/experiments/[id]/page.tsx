"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  api,
  Experiment,
  Dataset,
  Run,
  FailureRecord,
  OptimizationStudy,
} from "@/lib/api";
import {
  Play,
  RotateCcw,
  StopCircle,
  Clock,
  Cpu,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Zap,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export default function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const expId = resolvedParams.id;

  const [data, setData] = useState<{
    experiment: Experiment;
    dataset: Dataset;
    runs: Run[];
    failures: FailureRecord[];
    studies: OptimizationStudy[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<"runs" | "failures" | "optuna">("runs");

  const loadExperiment = async () => {
    try {
      const res = await api.getExperimentDetails(expId);
      setData(res);
    } catch (err) {
      console.error("Failed to load experiment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiment();
  }, [expId]);

  const handleStart = async () => {
    setExecuting(true);
    try {
      await api.startExperiment(expId);
      await loadExperiment();
    } catch (err: any) {
      alert(err.message || "Execution error");
    } finally {
      setExecuting(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.cancelExperiment(expId);
      await loadExperiment();
    } catch (err: any) {
      alert(err.message || "Failed to cancel experiment");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>
        LOADING EXPERIMENT SPECIFICATION // ID: {expId.substring(0, 8)}...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#ff8b8b" }}>
        EXPERIMENT RECORD NOT FOUND
      </div>
    );
  }

  const { experiment: exp, dataset: ds, runs, failures, studies } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          href="/workspace"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            font: "400 10px/1 var(--mono)",
            color: "#7e9084",
            textDecoration: "none"
          }}
        >
          <ArrowLeft size={12} />
          <span>BACK TO DASHBOARD</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
          <span style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>
            BUDGET: {exp.cpu_budget_seconds}s CPU
          </span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="research-card">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ font: "500 10px/1 var(--mono)", color: "#B69A72", letterSpacing: "0.14em", marginBottom: 8 }}>
              EXPERIMENT DETAIL // {exp.task_type.toUpperCase()}
            </div>
            <h1 style={{ margin: 0, font: "600 22px/1.2 var(--body)", color: "#F2F0E8" }}>
              {exp.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
              <span style={{ font: "400 10px var(--mono)", color: "#AAA99F" }}>
                DATASET: <strong style={{ color: "#F2F0E8" }}>{ds?.name || "N/A"}</strong> ({ds?.row_count} rows, {ds?.col_count} features)
              </span>
              <span style={{ font: "400 10px var(--mono)", color: "#AAA99F" }}>
                BASELINE: <strong style={{ color: "#a7e9e8" }}>{exp.baseline_model}</strong>
              </span>
              <span style={{ font: "400 10px var(--mono)", color: "#AAA99F" }}>
                SEED: <strong style={{ color: "#F2F0E8" }}>{exp.random_seed}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {exp.status === "RUNNING" ? (
              <button
                onClick={handleCancel}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  background: "rgba(255, 107, 107, 0.15)",
                  border: "1px solid rgba(255, 107, 107, 0.4)",
                  color: "#ff8b8b",
                  font: "600 10px var(--mono)",
                  letterSpacing: "0.08em",
                  borderRadius: 3,
                  cursor: "pointer"
                }}
              >
                <StopCircle size={13} />
                <span>CANCEL RUN</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={executing}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 20px",
                  background: executing ? "#557a44" : "#B69A72",
                  border: "1px solid #B69A72",
                  color: "#101110",
                  font: "600 10px var(--mono)",
                  letterSpacing: "0.08em",
                  borderRadius: 3,
                  cursor: executing ? "not-allowed" : "pointer"
                }}
              >
                <Play size={13} fill="#101110" />
                <span>{executing ? "EXECUTING SCIKIT-LEARN PIPELINES..." : runs.length ? "RE-EXECUTE EXPERIMENT" : "START EXPERIMENT"}</span>
              </button>
            )}

            <Link
              href={`/workspace/optimization?experiment_id=${exp.id}&model=${exp.baseline_model}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px",
                background: "rgba(167, 233, 232, 0.08)",
                border: "1px solid rgba(167, 233, 232, 0.2)",
                color: "#a7e9e8",
                font: "500 10px var(--mono)",
                letterSpacing: "0.06em",
                borderRadius: 3,
                textDecoration: "none"
              }}
            >
              <Zap size={13} />
              <span>OPTIMIZE WITH OPTUNA</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab("runs")}
          style={{
            background: "none",
            border: "none",
            padding: "4px 8px",
            font: activeTab === "runs" ? "600 11px var(--mono)" : "400 11px var(--mono)",
            color: activeTab === "runs" ? "#B69A72" : "#7e9084",
            borderBottom: activeTab === "runs" ? "2px solid #B69A72" : "2px solid transparent",
            cursor: "pointer"
          }}
        >
          MEASURED RUNS ({runs.length})
        </button>

        <button
          onClick={() => setActiveTab("failures")}
          style={{
            background: "none",
            border: "none",
            padding: "4px 8px",
            font: activeTab === "failures" ? "600 11px var(--mono)" : "400 11px var(--mono)",
            color: activeTab === "failures" ? "#ff8b8b" : "#7e9084",
            borderBottom: activeTab === "failures" ? "2px solid #ff8b8b" : "2px solid transparent",
            cursor: "pointer"
          }}
        >
          FAILURE & RECOVERY LOGS ({failures.length})
        </button>
      </div>

      {/* Runs Tab */}
      {activeTab === "runs" && (
        <div className="research-card">
          {runs.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
              No execution runs yet. Click "START EXPERIMENT" to trigger scikit-learn training and latency profiling.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="mono-table">
                <thead>
                  <tr>
                    <th>MODEL</th>
                    <th>TRAIN TIME</th>
                    <th>INFERENCE LATENCY</th>
                    <th>MODEL SIZE</th>
                    <th>MEMORY PEAK</th>
                    <th>VALIDATION SCORE</th>
                    <th>RECOVERY</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
                    let scoreDisplay = "—";
                    try {
                      const m = JSON.parse(r.metrics || "{}");
                      if (m.f1 !== undefined) scoreDisplay = `F1: ${m.f1.toFixed(4)}`;
                      else if (m.accuracy !== undefined) scoreDisplay = `Acc: ${m.accuracy.toFixed(4)}`;
                      else if (m.mae !== undefined) scoreDisplay = `MAE: ${m.mae.toFixed(4)}`;
                    } catch {}

                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: "#F2F0E8" }}>{r.model_name}</td>
                        <td>{r.train_time_ms.toFixed(1)} ms</td>
                        <td style={{ color: "#a7e9e8" }}>{r.inference_latency_us.toFixed(1)} µs</td>
                        <td>{r.model_size_kb.toFixed(1)} KB</td>
                        <td>{r.peak_memory_mb.toFixed(2)} MB</td>
                        <td style={{ fontWeight: 600, color: "#B69A72" }}>{scoreDisplay}</td>
                        <td>
                          {r.recovery_successful ? (
                            <span className="status-tag status-tag--recovered">
                              RECOVERED
                            </span>
                          ) : r.recovery_attempted ? (
                            <span className="status-tag status-tag--failed">
                              FAILED RETRY
                            </span>
                          ) : (
                            <span style={{ color: "#7e9084" }}>Direct Run</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-tag status-tag--${
                              r.status === "COMPLETED" ? "completed" : "failed"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Failure & Recovery Tab */}
      {activeTab === "failures" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {failures.length === 0 ? (
            <div className="research-card" style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
              No pipeline exceptions observed during this experiment execution.
            </div>
          ) : (
            failures.map((f) => (
              <div key={f.id} className="research-card" style={{ borderLeft: "3px solid #ff8b8b" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AlertTriangle size={15} color="#ff8b8b" />
                    <span style={{ font: "600 11px var(--mono)", color: "#ff8b8b" }}>
                      CATEGORY: {f.error_category}
                    </span>
                  </div>
                  <span
                    className={`status-tag status-tag--${
                      f.outcome === "RECOVERED" ? "recovered" : "failed"
                    }`}
                  >
                    OUTCOME: {f.outcome}
                  </span>
                </div>

                <div style={{ font: "500 12px var(--body)", color: "#F2F0E8", marginBottom: 8 }}>
                  Diagnosis: {f.diagnosis}
                </div>

                <div className="code-box" style={{ marginBottom: 12, maxHeight: 120 }}>
                  {f.error_message}
                </div>

                {f.applied_repair && (
                  <div style={{ background: "rgba(182, 154, 114, 0.05)", border: "1px solid rgba(182, 154, 114, 0.2)", padding: 12, borderRadius: 3 }}>
                    <div style={{ font: "600 10px var(--mono)", color: "#B69A72", marginBottom: 4 }}>
                      APPLIED RECOVERY PROCEDURE:
                    </div>
                    <pre style={{ margin: 0, font: "400 10px var(--mono)", color: "#c6d4c8", whiteSpace: "pre-wrap" }}>
                      {f.applied_repair}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
