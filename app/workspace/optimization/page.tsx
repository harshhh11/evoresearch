"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, Experiment, OptimizationStudy, OptimizationTrial } from "@/lib/api";
import {
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Sliders,
} from "lucide-react";

export default function OptimizationPage() {
  const searchParams = useSearchParams();
  const initExpId = searchParams.get("experiment_id") || "";
  const initModel = searchParams.get("model") || "RandomForestClassifier";

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExpId, setSelectedExpId] = useState(initExpId);
  const [modelName, setModelName] = useState(initModel);
  const [objective, setObjective] = useState("f1");
  const [direction, setDirection] = useState("maximize");
  const [totalTrials, setTotalTrials] = useState(12);
  const [cpuBudget, setCpuBudget] = useState(25.0);

  const [running, setRunning] = useState(false);
  const [activeStudy, setActiveStudy] = useState<{
    study: OptimizationStudy;
    trials: OptimizationTrial[];
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getExperiments();
        setExperiments(list);
        if (list.length && !selectedExpId) {
          setSelectedExpId(list[0].id);
          setModelName(list[0].baseline_model);
        }
      } catch (err) {
        console.error("Failed to load experiments:", err);
      }
    }
    load();
  }, [initExpId]);

  const handleStartStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpId) {
      alert("Please select an experiment.");
      return;
    }
    setRunning(true);
    try {
      const res = await api.startOptimization({
        experiment_id: selectedExpId,
        model_name: modelName,
        objective,
        direction,
        total_trials: totalTrials,
        cpu_budget_seconds: cpuBudget,
      });

      // Fetch study and trials
      if (res.study_id) {
        const fullStudy = await api.getOptimization(res.study_id);
        setActiveStudy(fullStudy);
      }
    } catch (err: any) {
      alert(err.message || "Optimization study failed");
    } finally {
      setRunning(false);
    }
  };

  const selectedExp = experiments.find((e) => e.id === selectedExpId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
          HYPERPARAMETER SEARCH // 006
        </div>
        <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#e8ede8" }}>
          Budget-Aware Optuna Optimizer
        </h1>
        <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0" }}>
          Bayesian search space exploration with strict CPU-time caps, per-trial timeout pruning, and latency profiling.
        </p>
      </div>

      {/* Control Card */}
      <div className="research-card">
        <form onSubmit={handleStartStudy} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                EXPERIMENT TARGET
              </label>
              <select
                value={selectedExpId}
                onChange={(e) => {
                  setSelectedExpId(e.target.value);
                  const exp = experiments.find((x) => x.id === e.target.value);
                  if (exp) setModelName(exp.baseline_model);
                }}
                style={{ width: "100%", padding: "9px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
              >
                {experiments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.task_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                MODEL ARCHITECTURE
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                style={{ width: "100%", padding: "9px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
              >
                <option value="RandomForestClassifier">RandomForestClassifier</option>
                <option value="HistGradientBoostingClassifier">HistGradientBoostingClassifier</option>
                <option value="DecisionTreeClassifier">DecisionTreeClassifier</option>
                <option value="LogisticRegression">LogisticRegression</option>
                <option value="SVC">SVC</option>
                <option value="RandomForestRegressor">RandomForestRegressor</option>
                <option value="HistGradientBoostingRegressor">HistGradientBoostingRegressor</option>
                <option value="Ridge">Ridge</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                OBJECTIVE METRIC
              </label>
              <select
                value={objective}
                onChange={(e) => {
                  setObjective(e.target.value);
                  setDirection(e.target.value === "mae" || e.target.value === "rmse" ? "minimize" : "maximize");
                }}
                style={{ width: "100%", padding: "9px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
              >
                <option value="f1">Validation F1 (Macro)</option>
                <option value="accuracy">Validation Accuracy</option>
                <option value="roc_auc">Validation ROC-AUC</option>
                <option value="mae">Validation MAE</option>
                <option value="rmse">Validation RMSE</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                TRIAL LIMIT
              </label>
              <input
                type="number"
                min={3}
                max={30}
                value={totalTrials}
                onChange={(e) => setTotalTrials(parseInt(e.target.value) || 12)}
                style={{ width: "100%", padding: "9px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                CPU BUDGET (s)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={cpuBudget}
                onChange={(e) => setCpuBudget(parseFloat(e.target.value) || 25.0)}
                style={{ width: "100%", padding: "9px 10px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={running}
              style={{
                padding: "9px 22px",
                background: running ? "#557a44" : "#b5ff8a",
                border: "1px solid #b5ff8a",
                color: "#050706",
                borderRadius: 3,
                font: "600 10px var(--mono)",
                letterSpacing: "0.08em",
                cursor: running ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <Zap size={13} fill="#050706" />
              <span>{running ? "SAMPLING TRIALS UNDER CPU BUDGET..." : "LAUNCH OPTUNA STUDY"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Study Results */}
      {activeStudy && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Best Trial Spotlight */}
          <div className="research-card research-card--highlight">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ font: "600 11px var(--mono)", color: "#b5ff8a", letterSpacing: "0.08em" }}>
                BEST OPTIMIZED TRIAL // {activeStudy.study.status}
              </span>
              <span style={{ font: "400 9px var(--mono)", color: "#9ba8a0" }}>
                WALL-CLOCK ELAPSED: {activeStudy.study.elapsed_seconds.toFixed(2)}s / {activeStudy.study.cpu_budget_seconds}s
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: 20 }}>
              <div>
                <div style={{ font: "500 9px var(--mono)", color: "#7e9084" }}>OPTIMAL {activeStudy.study.objective.toUpperCase()} SCORE:</div>
                <div className="metric-number" style={{ font: "600 32px var(--mono)", color: "#b5ff8a", marginTop: 4 }}>
                  {activeStudy.study.best_score ? activeStudy.study.best_score.toFixed(4) : "—"}
                </div>
                <div style={{ font: "400 10px var(--mono)", color: "#9ba8a0", marginTop: 6 }}>
                  Completed {activeStudy.study.completed_trials} / {activeStudy.study.total_trials} planned trials.
                </div>
              </div>

              <div>
                <div style={{ font: "500 9px var(--mono)", color: "#7e9084", marginBottom: 6 }}>OPTIMAL HYPERPARAMETERS:</div>
                <div className="code-box" style={{ maxHeight: 90 }}>
                  {activeStudy.study.best_params}
                </div>
              </div>
            </div>
          </div>

          {/* Trials Table */}
          <div className="research-card">
            <div style={{ font: "600 12px var(--mono)", color: "#e8ede8", marginBottom: 14 }}>
              INDIVIDUAL TRIAL TRAJECTORY ({activeStudy.trials.length} RECORDED)
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="mono-table">
                <thead>
                  <tr>
                    <th>TRIAL #</th>
                    <th>SCORE ({activeStudy.study.objective.toUpperCase()})</th>
                    <th>TRAIN TIME</th>
                    <th>LATENCY</th>
                    <th>SIZE</th>
                    <th>STATUS</th>
                    <th>HYPERPARAMETERS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudy.trials.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: "#e8ede8" }}>#{t.trial_number}</td>
                      <td style={{ fontWeight: 600, color: t.score !== null ? "#b5ff8a" : "#ff8b8b" }}>
                        {t.score !== null ? t.score.toFixed(4) : "FAILED"}
                      </td>
                      <td>{t.train_time_ms.toFixed(1)} ms</td>
                      <td style={{ color: "#a7e9e8" }}>{t.latency_us.toFixed(1)} µs</td>
                      <td>{t.model_size_kb.toFixed(1)} KB</td>
                      <td>
                        <span className={`status-tag status-tag--${t.status === "COMPLETE" ? "completed" : "failed"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#8c9c91" }}>
                        {t.params}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
