"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
  Bot
} from "lucide-react";

function OptimizationContent() {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid #DFE5DC", paddingBottom: 16 }}>
        <div>
          <div style={{ font: "500 10px/1 var(--mono)", color: "#176B4D", letterSpacing: "0.14em", marginBottom: 6, textTransform: "uppercase" }}>
            HYPERPARAMETER SEARCH // 006
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--font-primary), serif", color: "#26352D" }}>
            Budget-Aware Optuna Optimizer
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 13px/1.5 var(--body)", color: "#68766D" }}>
            Bayesian search space exploration with strict CPU-time caps, per-trial timeout pruning, and latency profiling.
          </p>
        </div>
        <Link
          href="/workspace/orchestration"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "#E6F0E9",
            border: "1px solid #176B4D",
            borderRadius: 6,
            color: "#176B4D",
            font: "600 11px var(--mono)",
            textDecoration: "none"
          }}
        >
          <Bot size={13} />
          <span>MULTI-AGENT ORCHESTRATION</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Control Card */}
      <div style={{ background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <form onSubmit={handleStartStudy} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6, letterSpacing: "0.05em" }}>
                EXPERIMENT TARGET
              </label>
              <select
                value={selectedExpId}
                onChange={(e) => {
                  setSelectedExpId(e.target.value);
                  const exp = experiments.find((x) => x.id === e.target.value);
                  if (exp) setModelName(exp.baseline_model);
                }}
                style={{ width: "100%", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, color: "#26352D", font: "400 12px var(--mono)", outline: "none" }}
              >
                {experiments.map((e) => (
                  <option key={e.id} value={e.id} style={{ background: "#FFFFFF", color: "#26352D" }}>
                    {e.name} ({e.task_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6, letterSpacing: "0.05em" }}>
                MODEL ARCHITECTURE
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, color: "#26352D", font: "400 12px var(--mono)", outline: "none" }}
              >
                <option value="RandomForestClassifier" style={{ background: "#FFFFFF", color: "#26352D" }}>RandomForestClassifier</option>
                <option value="HistGradientBoostingClassifier" style={{ background: "#FFFFFF", color: "#26352D" }}>HistGradientBoostingClassifier</option>
                <option value="DecisionTreeClassifier" style={{ background: "#FFFFFF", color: "#26352D" }}>DecisionTreeClassifier</option>
                <option value="LogisticRegression" style={{ background: "#FFFFFF", color: "#26352D" }}>LogisticRegression</option>
                <option value="SVC" style={{ background: "#FFFFFF", color: "#26352D" }}>SVC</option>
                <option value="RandomForestRegressor" style={{ background: "#FFFFFF", color: "#26352D" }}>RandomForestRegressor</option>
                <option value="HistGradientBoostingRegressor" style={{ background: "#FFFFFF", color: "#26352D" }}>HistGradientBoostingRegressor</option>
                <option value="Ridge" style={{ background: "#FFFFFF", color: "#26352D" }}>Ridge</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6, letterSpacing: "0.05em" }}>
                OBJECTIVE METRIC
              </label>
              <select
                value={objective}
                onChange={(e) => {
                  setObjective(e.target.value);
                  setDirection(e.target.value === "mae" || e.target.value === "rmse" ? "minimize" : "maximize");
                }}
                style={{ width: "100%", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, color: "#26352D", font: "400 12px var(--mono)", outline: "none" }}
              >
                <option value="f1" style={{ background: "#FFFFFF", color: "#26352D" }}>Validation F1 (Macro)</option>
                <option value="accuracy" style={{ background: "#FFFFFF", color: "#26352D" }}>Validation Accuracy</option>
                <option value="roc_auc" style={{ background: "#FFFFFF", color: "#26352D" }}>Validation ROC-AUC</option>
                <option value="mae" style={{ background: "#FFFFFF", color: "#26352D" }}>Validation MAE</option>
                <option value="rmse" style={{ background: "#FFFFFF", color: "#26352D" }}>Validation RMSE</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6, letterSpacing: "0.05em" }}>
                TRIAL LIMIT
              </label>
              <input
                type="number"
                min={3}
                max={30}
                value={totalTrials}
                onChange={(e) => setTotalTrials(parseInt(e.target.value) || 12)}
                style={{ width: "100%", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, color: "#26352D", font: "400 12px var(--mono)", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6, letterSpacing: "0.05em" }}>
                CPU BUDGET (s)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={cpuBudget}
                onChange={(e) => setCpuBudget(parseFloat(e.target.value) || 25.0)}
                style={{ width: "100%", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, color: "#26352D", font: "400 12px var(--mono)", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button
              type="submit"
              disabled={running}
              style={{
                padding: "10px 24px",
                background: running ? "#12543C" : "#176B4D",
                border: "none",
                color: "#FFFFFF",
                borderRadius: 6,
                font: "600 11px var(--mono)",
                letterSpacing: "0.08em",
                cursor: running ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 4px rgba(23, 107, 77, 0.2)",
                transition: "all 0.2s ease"
              }}
            >
              <Zap size={14} fill="#FFFFFF" />
              <span>{running ? "SAMPLING TRIALS UNDER CPU BUDGET..." : "LAUNCH OPTUNA STUDY"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Study Results */}
      {activeStudy && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Best Trial Spotlight */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #176B4D", borderRadius: 10, padding: 20, boxShadow: "0 2px 6px rgba(23, 107, 77, 0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, borderBottom: "1px solid #DFE5DC", paddingBottom: 10 }}>
              <span style={{ font: "600 11px var(--mono)", color: "#176B4D", letterSpacing: "0.08em" }}>
                BEST OPTIMIZED TRIAL // {activeStudy.study.status}
              </span>
              <span style={{ font: "400 10px var(--mono)", color: "#68766D" }}>
                WALL-CLOCK ELAPSED: {activeStudy.study.elapsed_seconds.toFixed(2)}s / {activeStudy.study.cpu_budget_seconds}s
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: 20 }}>
              <div>
                <div style={{ font: "600 10px var(--mono)", color: "#68766D", textTransform: "uppercase" }}>OPTIMAL {activeStudy.study.objective.toUpperCase()} SCORE:</div>
                <div style={{ font: "600 34px var(--mono)", color: "#176B4D", marginTop: 4 }}>
                  {activeStudy.study.best_score ? activeStudy.study.best_score.toFixed(4) : "—"}
                </div>
                <div style={{ font: "400 11px var(--mono)", color: "#68766D", marginTop: 6 }}>
                  Completed {activeStudy.study.completed_trials} / {activeStudy.study.total_trials} planned trials.
                </div>
              </div>

              <div>
                <div style={{ font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6, textTransform: "uppercase" }}>OPTIMAL HYPERPARAMETERS:</div>
                <div style={{ background: "#F8F6EF", border: "1px solid #DFE5DC", borderRadius: 6, padding: "10px 14px", font: "400 11px var(--mono)", color: "#26352D", maxHeight: 90, overflowY: "auto" }}>
                  {activeStudy.study.best_params}
                </div>
              </div>
            </div>
          </div>

          {/* Trials Table */}
          <div style={{ background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 10, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div style={{ font: "600 12px var(--mono)", color: "#26352D", marginBottom: 14 }}>
              INDIVIDUAL TRIAL TRAJECTORY ({activeStudy.trials.length} RECORDED)
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left", fontFamily: "var(--mono)", fontSize: 11, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #DFE5DC", color: "#68766D" }}>
                    <th style={{ padding: "8px 10px" }}>TRIAL #</th>
                    <th style={{ padding: "8px 10px" }}>SCORE ({activeStudy.study.objective.toUpperCase()})</th>
                    <th style={{ padding: "8px 10px" }}>TRAIN TIME</th>
                    <th style={{ padding: "8px 10px" }}>LATENCY</th>
                    <th style={{ padding: "8px 10px" }}>SIZE</th>
                    <th style={{ padding: "8px 10px" }}>STATUS</th>
                    <th style={{ padding: "8px 10px" }}>HYPERPARAMETERS</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudy.trials.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #F8F6EF" }}>
                      <td style={{ padding: "10px", fontWeight: 600, color: "#26352D" }}>#{t.trial_number}</td>
                      <td style={{ padding: "10px", fontWeight: 600, color: t.score !== null ? "#176B4D" : "#B54747" }}>
                        {t.score !== null ? t.score.toFixed(4) : "FAILED"}
                      </td>
                      <td style={{ padding: "10px", color: "#26352D" }}>{t.train_time_ms.toFixed(1)} ms</td>
                      <td style={{ padding: "10px", color: "#176B4D" }}>{t.latency_us.toFixed(1)} µs</td>
                      <td style={{ padding: "10px", color: "#68766D" }}>{t.model_size_kb.toFixed(1)} KB</td>
                      <td style={{ padding: "10px" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 600,
                          background: t.status === "COMPLETE" ? "#E6F0E9" : "#FDF2F2",
                          color: t.status === "COMPLETE" ? "#176B4D" : "#B54747",
                          border: t.status === "COMPLETE" ? "1px solid #DFE5DC" : "1px solid #F8D7D7"
                        }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#68766D" }}>
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

export default function OptimizationPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>LOADING OPTIMIZATION WORKSPACE...</div>}>
      <OptimizationContent />
    </Suspense>
  );
}

