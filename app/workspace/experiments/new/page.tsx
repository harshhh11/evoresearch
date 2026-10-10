"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, Project, Dataset } from "@/lib/api";
import {
  FlaskConical,
  Sparkles,
  Settings,
  Database,
  Cpu,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const CLASSIFICATION_MODELS = [
  { id: "LogisticRegression", name: "Logistic Regression", tag: "Low latency, linear baseline" },
  { id: "DecisionTreeClassifier", name: "Decision Tree Classifier", tag: "Interpretable, low memory" },
  { id: "RandomForestClassifier", name: "Random Forest Classifier", tag: "Ensemble, robust to outliers" },
  { id: "HistGradientBoostingClassifier", name: "HistGradientBoosting Classifier", tag: "High accuracy, CPU-optimized" },
  { id: "SVC", name: "Support Vector Classifier (RBF/Linear)", tag: "Maximum margin, bounded iterations" },
];

const REGRESSION_MODELS = [
  { id: "LinearRegression", name: "Linear Regression (OLS)", tag: "Standard linear baseline" },
  { id: "Ridge", name: "Ridge Regression (L2)", tag: "Regularized linear baseline" },
  { id: "DecisionTreeRegressor", name: "Decision Tree Regressor", tag: "Fast non-linear tree" },
  { id: "RandomForestRegressor", name: "Random Forest Regressor", tag: "Averaging ensemble" },
  { id: "HistGradientBoostingRegressor", name: "HistGradientBoosting Regressor", tag: "Fast gradient boosting" },
];

export default function NewExperimentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("project_id") || "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [projectId, setProjectId] = useState(initialProjectId);
  const [name, setName] = useState("");
  const [taskType, setTaskType] = useState("classification");
  const [datasetId, setDatasetId] = useState("");
  const [baselineModel, setBaselineModel] = useState("LogisticRegression");
  const [candidateModels, setCandidateModels] = useState<string[]>(["LogisticRegression", "DecisionTreeClassifier"]);
  const [scalerType, setScalerType] = useState("standard");
  const [imputeStrategy, setImputeStrategy] = useState("mean");
  const [cpuBudget, setCpuBudget] = useState(30.0);
  const [trialBudget, setTrialBudget] = useState(10);
  const [randomSeed, setRandomSeed] = useState(42);
  const [maxLatencyUs, setMaxLatencyUs] = useState(5000);
  const [maxSizeKb, setMaxSizeKb] = useState(500);

  useEffect(() => {
    async function init() {
      try {
        const [pList, dList] = await Promise.all([api.getProjects(), api.getDatasets()]);
        setProjects(pList);
        setDatasets(dList);
        if (pList.length && !projectId) {
          setProjectId(pList[0].id);
        }
        if (dList.length) {
          setDatasetId(dList[0].id);
          setTaskType(dList[0].task_type);
        }
      } catch (err) {
        console.error("Failed to load planner resources:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [initialProjectId]);

  const handleDatasetChange = (id: string) => {
    setDatasetId(id);
    const selected = datasets.find((d) => d.id === id);
    if (selected) {
      setTaskType(selected.task_type);
      if (selected.task_type === "classification") {
        setBaselineModel("LogisticRegression");
        setCandidateModels(["LogisticRegression", "DecisionTreeClassifier"]);
      } else {
        setBaselineModel("LinearRegression");
        setCandidateModels(["LinearRegression", "Ridge"]);
      }
    }
  };

  const toggleCandidate = (mId: string) => {
    if (candidateModels.includes(mId)) {
      if (candidateModels.length > 1) {
        setCandidateModels(candidateModels.filter((m) => m !== mId));
      }
    } else {
      setCandidateModels([...candidateModels, mId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId || !datasetId) {
      alert("Please fill in the required experiment fields.");
      return;
    }
    setSubmitting(true);
    try {
      const exp = await api.createExperiment({
        project_id: projectId,
        dataset_id: datasetId,
        name,
        task_type: taskType,
        baseline_model: baselineModel,
        candidate_models: candidateModels,
        preprocessing_config: {
          scaler_type: scalerType,
          impute_strategy: imputeStrategy,
        },
        evaluation_metrics: taskType === "classification" ? ["accuracy", "f1", "roc_auc"] : ["mae", "rmse", "r2"],
        cpu_budget_seconds: cpuBudget,
        trial_budget: trialBudget,
        random_seed: randomSeed,
        efficiency_constraints: {
          max_latency_us: maxLatencyUs,
          max_size_kb: maxSizeKb,
        },
      });

      router.push(`/workspace/experiments/${exp.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to create experiment");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>
        LOADING PLANNER ASSETS...
      </div>
    );
  }

  const modelOptions = taskType === "classification" ? CLASSIFICATION_MODELS : REGRESSION_MODELS;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
          PLANNING MODULE // 002
        </div>
        <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#e8ede8" }}>
          Resource-Aware Experiment Planner
        </h1>
        <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0" }}>
          Configure reproducible tabular experiments under verified hardware and CPU-time boundaries.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Step 1: Project & Identity */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(181, 255, 138, 0.15)", color: "#b5ff8a", display: "grid", placeContent: "center", font: "600 10px var(--mono)" }}>1</span>
            <span style={{ font: "600 12px var(--mono)", color: "#e8ede8", letterSpacing: "0.06em" }}>PROJECT & RESEARCH OBJECTIVE</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                RESEARCH PROJECT
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                EXPERIMENT RUN NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Latency-Constrained Decision Tree vs Ensemble"
                style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Dataset Selection */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(181, 255, 138, 0.15)", color: "#b5ff8a", display: "grid", placeContent: "center", font: "600 10px var(--mono)" }}>2</span>
            <span style={{ font: "600 12px var(--mono)", color: "#e8ede8", letterSpacing: "0.06em" }}>DATASET & PREDICTION TASK</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                DATASET
              </label>
              <select
                value={datasetId}
                onChange={(e) => handleDatasetChange(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.row_count} rows, {d.col_count} cols) [{d.task_type.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                TASK TYPE
              </label>
              <div style={{ padding: "10px 14px", background: "rgba(5, 7, 6, 0.6)", border: "1px solid rgba(226, 239, 229, 0.1)", borderRadius: 3, font: "500 11px var(--mono)", color: "#a7e9e8" }}>
                {taskType.toUpperCase()} (Target: {datasets.find((d) => d.id === datasetId)?.target_col || "target"})
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Model Catalogue & Candidates */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(181, 255, 138, 0.15)", color: "#b5ff8a", display: "grid", placeContent: "center", font: "600 10px var(--mono)" }}>3</span>
            <span style={{ font: "600 12px var(--mono)", color: "#e8ede8", letterSpacing: "0.06em" }}>BASELINE & CANDIDATE MODELS</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ font: "400 11px var(--mono)", color: "#9ba8a0" }}>
              Select candidate models to execute and compare. Preprocessing pipelines are fitted exclusively on training splits to prevent data leakage.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
              {modelOptions.map((m) => {
                const isSelected = candidateModels.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleCandidate(m.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 3,
                      border: isSelected ? "1px solid #b5ff8a" : "1px solid rgba(226, 239, 229, 0.1)",
                      background: isSelected ? "rgba(181, 255, 138, 0.05)" : "rgba(5, 7, 6, 0.4)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ marginTop: 2 }}
                    />
                    <div>
                      <div style={{ font: "600 11px var(--mono)", color: isSelected ? "#e8ede8" : "#9ba8a0" }}>
                        {m.name}
                      </div>
                      <div style={{ font: "400 9px var(--mono)", color: "#7e9084", marginTop: 4 }}>
                        {m.tag}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 4: Budget & Efficiency Boundaries */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(181, 255, 138, 0.15)", color: "#b5ff8a", display: "grid", placeContent: "center", font: "600 10px var(--mono)" }}>4</span>
            <span style={{ font: "600 12px var(--mono)", color: "#e8ede8", letterSpacing: "0.06em" }}>RESOURCE BUDGETS & EDGE EFFICIENCY CONSTRAINTS</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                CPU-TIME BUDGET (SECONDS)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={cpuBudget}
                onChange={(e) => setCpuBudget(parseFloat(e.target.value) || 30.0)}
                style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                RANDOM SEED
              </label>
              <input
                type="number"
                value={randomSeed}
                onChange={(e) => setRandomSeed(parseInt(e.target.value) || 42)}
                style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                MAX INFERENCE LATENCY (µs)
              </label>
              <input
                type="number"
                value={maxLatencyUs}
                onChange={(e) => setMaxLatencyUs(parseInt(e.target.value) || 5000)}
                style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                MAX MODEL SIZE (KB)
              </label>
              <input
                type="number"
                value={maxSizeKb}
                onChange={(e) => setMaxSizeKb(parseInt(e.target.value) || 500)}
                style={{ width: "100%", padding: "10px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 14 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px 28px",
              background: submitting ? "#557a44" : "#b5ff8a",
              border: "1px solid #b5ff8a",
              color: "#050706",
              borderRadius: 3,
              font: "600 11px/1 var(--mono)",
              letterSpacing: "0.08em",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <span>{submitting ? "RECORDING EXPERIMENT SPEC..." : "CREATE & PROCEED TO EXECUTION"}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
