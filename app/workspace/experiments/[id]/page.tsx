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
  Activity,
  Layers,
  Download,
  FileText
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
    metrics?: any[];
    resource_profiles?: any[];
  } | null>(null);

  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<"runs" | "predictions" | "failures" | "optuna">("runs");

  const loadExperiment = async () => {
    try {
      const [res, preds] = await Promise.all([
        api.getExperimentDetails(expId),
        fetch(`/api/experiments/${expId}/predictions`).then((r) => r.ok ? r.json() : []).catch(() => [])
      ]);
      setData(res);
      setPredictions(preds);
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

  const { experiment: exp, dataset: ds, runs, failures, studies, resource_profiles } = data;
  const isRegression = exp.task_type === "regression";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
            MODE: {(exp.memory_mode || "baseline").toUpperCase()} // BUDGET: {exp.cpu_budget_seconds}s
          </span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="research-card">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
          <div>
            <div style={{ font: "500 10px/1 var(--mono)", color: "#B69A72", letterSpacing: "0.14em", marginBottom: 6 }}>
              MATERIALS SCIENCE ML EXPERIMENT // {exp.task_type.toUpperCase()}
            </div>
            <h1 style={{ margin: 0, font: "600 22px/1.2 var(--body)", color: "#F2F0E8" }}>
              {exp.name}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 10 }}>
              <span style={{ font: "400 10px var(--mono)", color: "#AAA99F" }}>
                DATASET: <strong style={{ color: "#F2F0E8" }}>{ds?.name || "N/A"}</strong> ({ds?.row_count} samples)
              </span>
              <span style={{ font: "400 10px var(--mono)", color: "#AAA99F" }}>
                TARGET: <strong style={{ color: "#B69A72" }}>{exp.target_column || ds?.target_col}</strong>
              </span>
              <span style={{ font: "400 10px var(--mono)", color: "#AAA99F" }}>
                BASELINE: <strong style={{ color: "#a7e9e8" }}>{exp.baseline_model}</strong>
              </span>
              <span style={{ font: "400 10px var(--mono)", color: "#AAA99F" }}>
                SEED: <strong style={{ color: "#F2F0E8" }}>{exp.random_seed}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {exp.status === "RUNNING" ? (
              <button
                onClick={handleCancel}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: "rgba(255, 107, 107, 0.15)",
                  border: "1px solid rgba(255, 107, 107, 0.4)",
                  color: "#ff8b8b",
                  font: "600 10px var(--mono)",
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
                  gap: 6,
                  padding: "8px 18px",
                  background: executing ? "#557a44" : "#B69A72",
                  border: "1px solid #B69A72",
                  color: "#101110",
                  font: "600 10px var(--mono)",
                  borderRadius: 3,
                  cursor: executing ? "not-allowed" : "pointer"
                }}
              >
                <Play size={13} fill="#101110" />
                <span>{executing ? "FITTING SCIKIT-LEARN PIPELINES..." : runs.length ? "RE-EXECUTE PIPELINE" : "START EXPERIMENT"}</span>
              </button>
            )}

            <Link
              href={`/workspace/optimization?experiment_id=${exp.id}&model=${exp.baseline_model}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "rgba(167, 233, 232, 0.08)",
                border: "1px solid rgba(167, 233, 232, 0.2)",
                color: "#a7e9e8",
                font: "500 10px var(--mono)",
                borderRadius: 3,
                textDecoration: "none"
              }}
            >
              <Zap size={13} />
              <span>BOUNDED OPTUNA HPO</span>
            </Link>

            {runs.length > 0 && (
              <a
                href={`http://127.0.0.1:8000/api/reports/experiment/${exp.id}/export?format=pdf`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  background: "rgba(182, 154, 114, 0.15)",
                  border: "1px solid #B69A72",
                  color: "#F2F0E8",
                  font: "600 10px var(--mono)",
                  borderRadius: 3,
                  textDecoration: "none"
                }}
              >
                <Download size={13} />
                <span>DOWNLOAD PDF</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 10 }}>
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
          onClick={() => setActiveTab("predictions")}
          style={{
            background: "none",
            border: "none",
            padding: "4px 8px",
            font: activeTab === "predictions" ? "600 11px var(--mono)" : "400 11px var(--mono)",
            color: activeTab === "predictions" ? "#B69A72" : "#7e9084",
            borderBottom: activeTab === "predictions" ? "2px solid #B69A72" : "2px solid transparent",
            cursor: "pointer"
          }}
        >
          ACTUAL VS PREDICTED ({predictions.length})
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
              No execution runs yet. Click "START EXPERIMENT" to train baseline and candidate models with real metrics.
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
                    <th>PEAK MEMORY</th>
                    <th>{isRegression ? "MAE (eV)" : "F1 SCORE"}</th>
                    {isRegression && <th>RMSE (eV)</th>}
                    {isRegression && <th>R² SCORE</th>}
                    {isRegression && <th>MEDIAN ABS ERR</th>}
                    <th>RECOVERY</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
                    let m: any = {};
                    try {
                      m = JSON.parse(r.metrics || "{}");
                    } catch {}

                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: "#F2F0E8" }}>{r.model_name}</td>
                        <td>{r.train_time_ms.toFixed(1)} ms</td>
                        <td style={{ color: "#a7e9e8" }}>{r.inference_latency_us.toFixed(1)} µs</td>
                        <td>{r.model_size_kb.toFixed(1)} KB</td>
                        <td>{r.peak_memory_mb.toFixed(2)} MB</td>
                        <td style={{ fontWeight: 600, color: "#B69A72" }}>
                          {isRegression ? (m.mae !== undefined ? m.mae.toFixed(4) : "—") : (m.f1 !== undefined ? m.f1.toFixed(4) : "—")}
                        </td>
                        {isRegression && <td style={{ color: "#AAA99F" }}>{m.rmse !== undefined ? m.rmse.toFixed(4) : "—"}</td>}
                        {isRegression && <td style={{ color: "#AAA99F" }}>{m.r2 !== undefined ? m.r2.toFixed(4) : "—"}</td>}
                        {isRegression && <td style={{ color: "#AAA99F" }}>{m.median_abs_error !== undefined ? m.median_abs_error.toFixed(4) : "—"}</td>}
                        <td>
                          {r.recovery_successful ? (
                            <span className="status-tag status-tag--recovered">RECOVERED</span>
                          ) : r.recovery_attempted ? (
                            <span className="status-tag status-tag--failed">FAILED RETRY</span>
                          ) : (
                            <span style={{ color: "#7e9084" }}>Direct Fit</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-tag status-tag--${r.status === "COMPLETED" ? "completed" : "failed"}`}>
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

      {/* Predictions Tab */}
      {activeTab === "predictions" && (
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ font: "600 11px var(--mono)", color: "#F2F0E8" }}>
              EVALUATION SPLIT PREDICTIONS & RESIDUALS (PAGINATED SAMPLES)
            </span>
            <span style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>
              Residual = Predicted - Actual
            </span>
          </div>

          {predictions.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
              No prediction records saved yet. Run the experiment to generate predictions.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="mono-table">
                <thead>
                  <tr>
                    <th>SAMPLE #</th>
                    <th>ACTUAL TARGET</th>
                    <th>PREDICTED VALUE</th>
                    <th>RESIDUAL ERROR</th>
                    <th>ABSOLUTE ERROR</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p, idx) => (
                    <tr key={idx}>
                      <td style={{ color: "#8c9c91" }}>{p.sample_reference || idx}</td>
                      <td style={{ color: "#F2F0E8", fontWeight: 500 }}>{p.actual_value?.toFixed(4) ?? "—"}</td>
                      <td style={{ color: "#B69A72", fontWeight: 500 }}>{p.predicted_value?.toFixed(4) ?? "—"}</td>
                      <td style={{ color: Math.abs(p.residual || 0) < 0.2 ? "#a7e9e8" : "#ff8b8b" }}>
                        {p.residual !== undefined ? (p.residual > 0 ? `+${p.residual.toFixed(4)}` : p.residual.toFixed(4)) : "—"}
                      </td>
                      <td style={{ color: "#AAA99F" }}>
                        {p.residual !== undefined ? Math.abs(p.residual).toFixed(4) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Failure & Recovery Tab */}
      {activeTab === "failures" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {failures.length === 0 ? (
            <div className="research-card" style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
              No pipeline exceptions observed during this experiment execution.
            </div>
          ) : (
            failures.map((f) => (
              <div key={f.id} className="research-card" style={{ borderLeft: "3px solid #ff8b8b" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AlertTriangle size={15} color="#ff8b8b" />
                    <span style={{ font: "600 11px var(--mono)", color: "#ff8b8b" }}>
                      CATEGORY: {f.error_category}
                    </span>
                  </div>
                  <span className={`status-tag status-tag--${f.outcome === "RECOVERED" ? "recovered" : "failed"}`}>
                    OUTCOME: {f.outcome}
                  </span>
                </div>

                <div style={{ font: "500 12px var(--body)", color: "#F2F0E8", marginBottom: 6 }}>
                  Diagnosis: {f.diagnosis}
                </div>

                <div className="code-box" style={{ marginBottom: 10, maxHeight: 100 }}>
                  {f.error_message}
                </div>

                {f.applied_repair && (
                  <div style={{ background: "rgba(182, 154, 114, 0.05)", border: "1px solid rgba(182, 154, 114, 0.2)", padding: 10, borderRadius: 3 }}>
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
