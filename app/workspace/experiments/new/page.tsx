"use client";

import { useEffect, useState, Suspense } from "react";
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
  Atom,
  Clock,
  RotateCcw
} from "lucide-react";

const CLASSIFICATION_MODELS = [
  { id: "DummyClassifier", name: "Dummy Classifier", tag: "Most frequent class baseline" },
  { id: "LogisticRegression", name: "Logistic Regression", tag: "Low latency, linear baseline" },
  { id: "DecisionTreeClassifier", name: "Decision Tree Classifier", tag: "Interpretable, low memory" },
  { id: "RandomForestClassifier", name: "Random Forest Classifier", tag: "Ensemble, robust to outliers" },
  { id: "HistGradientBoostingClassifier", name: "HistGradientBoosting Classifier", tag: "High accuracy, CPU-optimized" },
  { id: "SVC", name: "Support Vector Classifier", tag: "Maximum margin, bounded iterations" },
];

const REGRESSION_MODELS = [
  { id: "DummyRegressor", name: "Dummy Regressor (Mean Baseline)", tag: "Sanity-check constant baseline" },
  { id: "Ridge", name: "Ridge Regression (L2)", tag: "Regularized linear closed-form solve" },
  { id: "RandomForestRegressor", name: "Random Forest Regressor", tag: "Averaging ensemble, robust to crystal variations" },
  { id: "ExtraTreesRegressor", name: "Extra Trees Regressor", tag: "Extremely randomized trees, faster CPU fitting" },
  { id: "HistGradientBoostingRegressor", name: "HistGradientBoosting Regressor", tag: "Fast histogram-based gradient boosting" },
  { id: "SVR", name: "Support Vector Regressor (RBF)", tag: "Kernel regression, non-linear boundaries" },
];

function NewExperimentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("project_id") || "";
  const initialDatasetId = searchParams.get("dataset_id") || "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [projectId, setProjectId] = useState(initialProjectId);
  const [name, setName] = useState("");
  const [taskType, setTaskType] = useState("regression");
  const [datasetId, setDatasetId] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  const [baselineModel, setBaselineModel] = useState("DummyRegressor");
  const [candidateModels, setCandidateModels] = useState<string[]>(["DummyRegressor", "Ridge", "RandomForestRegressor"]);
  const [memoryMode, setMemoryMode] = useState<"baseline" | "success_only" | "failure_recovery">("baseline");
  const [scalerType, setScalerType] = useState("standard");
  const [imputeStrategy, setImputeStrategy] = useState("mean");
  const [cpuBudget, setCpuBudget] = useState(180.0);
  const [trialBudget, setTrialBudget] = useState(15);
  const [randomSeed, setRandomSeed] = useState(42);

  useEffect(() => {
    async function init() {
      try {
        const [pList, dList] = await Promise.all([api.getProjects(), api.getDatasets()]);
        setProjects(pList);
        setDatasets(dList);
        if (pList.length && !projectId) {
          setProjectId(pList[0].id);
        }
        
        let targetDs = dList[0];
        if (initialDatasetId) {
          const match = dList.find((d) => d.id === initialDatasetId);
          if (match) targetDs = match;
        }

        if (targetDs) {
          setDatasetId(targetDs.id);
          setTaskType(targetDs.task_type);
          setTargetColumn(targetDs.target_col);
          if (targetDs.name.includes("NOMAD")) {
            setName("NOMAD 2018 Transparent Conductors Band Gap Benchmark");
            setBaselineModel("DummyRegressor");
            setCandidateModels(["DummyRegressor", "Ridge", "RandomForestRegressor"]);
          } else if (targetDs.name.includes("Matbench")) {
            setName("Matbench Experimental Band Gap Regression Benchmark");
            setBaselineModel("DummyRegressor");
            setCandidateModels(["DummyRegressor", "Ridge", "RandomForestRegressor"]);
          }
        }
      } catch (err) {
        console.error("Failed to load planner resources:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [initialProjectId, initialDatasetId]);

  const handleDatasetChange = (id: string) => {
    setDatasetId(id);
    const selected = datasets.find((d) => d.id === id);
    if (selected) {
      setTaskType(selected.task_type);
      setTargetColumn(selected.target_col);
      if (selected.task_type === "classification") {
        setBaselineModel("DummyClassifier");
        setCandidateModels(["DummyClassifier", "LogisticRegression", "RandomForestClassifier"]);
      } else {
        setBaselineModel("DummyRegressor");
        setCandidateModels(["DummyRegressor", "Ridge", "RandomForestRegressor"]);
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
        target_column: targetColumn,
        task_type: taskType,
        baseline_model: baselineModel,
        candidate_models: candidateModels,
        memory_mode: memoryMode,
        preprocessing_config: {
          scaler_type: scalerType,
          impute_strategy: imputeStrategy,
        },
        evaluation_metrics: taskType === "classification" ? ["accuracy", "f1", "roc_auc"] : ["mae", "rmse", "r2", "median_abs_error"],
        cpu_budget_seconds: cpuBudget,
        trial_budget: trialBudget,
        random_seed: randomSeed,
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
        INITIALIZING MATERIALS EXPERIMENT CONFIGURATOR...
      </div>
    );
  }

  const modelOptions = taskType === "classification" ? CLASSIFICATION_MODELS : REGRESSION_MODELS;
  const currentDataset = datasets.find((d) => d.id === datasetId);
  const supportedTargets = currentDataset?.target_columns && currentDataset.target_columns.length > 0
    ? currentDataset.target_columns
    : [currentDataset?.target_col || "target"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 960 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 16 }}>
        <div style={{ font: "500 10px/1 var(--mono)", color: "#B69A72", letterSpacing: "0.14em", marginBottom: 6 }}>
          EXPERIMENTATION PLANNER // CONFIGURATION INTERFACE
        </div>
        <h1 style={{ margin: 0, font: "600 22px/1.2 var(--body)", color: "#F2F0E8" }}>
          Configure Materials Science ML Experiment
        </h1>
        <p style={{ margin: "4px 0 0", font: "400 12px/1.5 var(--body)", color: "#AAA99F" }}>
          Define reproducible regression pipelines on NOMAD 2018 or Matbench with bounded wall-clock budgets, leakage-free transformations, and evidence-validated failure recovery.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Step 1: Project & Identity */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(182, 154, 114, 0.15)", color: "#B69A72", display: "grid", placeContent: "center", font: "600 10px var(--mono)" }}>1</span>
            <span style={{ font: "600 12px var(--mono)", color: "#F2F0E8", letterSpacing: "0.06em" }}>PROJECT & BENCHMARK IDENTITY</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                RESEARCH PROJECT
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
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
                placeholder="e.g. NOMAD Band Gap Ridge vs RandomForest"
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Dataset & Target Selection */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(182, 154, 114, 0.15)", color: "#B69A72", display: "grid", placeContent: "center", font: "600 10px var(--mono)" }}>2</span>
            <span style={{ font: "600 12px var(--mono)", color: "#F2F0E8", letterSpacing: "0.06em" }}>DATASET & PREDICTION TARGET</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                DATASET
              </label>
              <select
                value={datasetId}
                onChange={(e) => handleDatasetChange(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.row_count} samples) [{d.task_type.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                TARGET PROPERTY TO PREDICT
              </label>
              <select
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              >
                {supportedTargets.map((t: string) => (
                  <option key={t} value={t}>
                    {t} {t.includes("bandgap") || t.includes("gap") ? "(Band Gap eV)" : t.includes("formation") ? "(Formation Energy eV/atom)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Failure Memory Mode */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(182, 154, 114, 0.15)", color: "#B69A72", display: "grid", placeContent: "center", font: "600 10px var(--mono)" }}>3</span>
            <span style={{ font: "600 12px var(--mono)", color: "#F2F0E8", letterSpacing: "0.06em" }}>CONTROLLED EXPERIMENTAL MODE</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div
              onClick={() => setMemoryMode("baseline")}
              style={{
                padding: "12px 14px",
                borderRadius: 4,
                border: memoryMode === "baseline" ? "1px solid #B69A72" : "1px solid rgba(226, 239, 229, 0.1)",
                background: memoryMode === "baseline" ? "rgba(182, 154, 114, 0.08)" : "rgba(5, 7, 6, 0.4)",
                cursor: "pointer"
              }}
            >
              <div style={{ font: "600 11px var(--mono)", color: memoryMode === "baseline" ? "#F2F0E8" : "#AAA99F", marginBottom: 4 }}>
                MODE A: BASELINE
              </div>
              <div style={{ font: "400 10px/1.4 var(--body)", color: "#7e9084" }}>
                Standard optimization without error retrieval or memory warm-starts.
              </div>
            </div>

            <div
              onClick={() => setMemoryMode("success_only")}
              style={{
                padding: "12px 14px",
                borderRadius: 4,
                border: memoryMode === "success_only" ? "1px solid #B69A72" : "1px solid rgba(226, 239, 229, 0.1)",
                background: memoryMode === "success_only" ? "rgba(182, 154, 114, 0.08)" : "rgba(5, 7, 6, 0.4)",
                cursor: "pointer"
              }}
            >
              <div style={{ font: "600 11px var(--mono)", color: memoryMode === "success_only" ? "#F2F0E8" : "#AAA99F", marginBottom: 4 }}>
                MODE B: SUCCESS-ONLY
              </div>
              <div style={{ font: "400 10px/1.4 var(--body)", color: "#7e9084" }}>
                Guides search spaces using validated historical configurations. No failure retrieval.
              </div>
            </div>

            <div
              onClick={() => setMemoryMode("failure_recovery")}
              style={{
                padding: "12px 14px",
                borderRadius: 4,
                border: memoryMode === "failure_recovery" ? "1px solid #B69A72" : "1px solid rgba(226, 239, 229, 0.1)",
                background: memoryMode === "failure_recovery" ? "rgba(182, 154, 114, 0.08)" : "rgba(5, 7, 6, 0.4)",
                cursor: "pointer"
              }}
            >
              <div style={{ font: "600 11px var(--mono)", color: memoryMode === "failure_recovery" ? "#F2F0E8" : "#AAA99F", marginBottom: 4 }}>
                MODE C: FAILURE-AND-RECOVERY
              </div>
              <div style={{ font: "400 10px/1.4 var(--body)", color: "#7e9084" }}>
                Retrieves verified error signatures and executes bounded allowlisted repairs within budget.
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Model Candidates */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(182, 154, 114, 0.15)", color: "#B69A72", display: "grid", placeContent: "center", font: "600 10px var(--mono)" }}>4</span>
            <span style={{ font: "600 12px var(--mono)", color: "#F2F0E8", letterSpacing: "0.06em" }}>MODEL FAMILIES & BASELINE</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
            {modelOptions.map((m) => {
              const isSelected = candidateModels.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleCandidate(m.id)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 3,
                    border: isSelected ? "1px solid #B69A72" : "1px solid rgba(226, 239, 229, 0.1)",
                    background: isSelected ? "rgba(182, 154, 114, 0.05)" : "rgba(5, 7, 6, 0.4)",
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
                    <div style={{ font: "600 11px var(--mono)", color: isSelected ? "#F2F0E8" : "#AAA99F" }}>
                      {m.name}
                    </div>
                    <div style={{ font: "400 9px var(--mono)", color: "#7e9084", marginTop: 2 }}>
                      {m.tag}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 5: Execution Budgets */}
        <div className="research-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(182, 154, 114, 0.15)", color: "#B69A72", display: "grid", placeContent: "center", font: "600 10px var(--mono)" }}>5</span>
            <span style={{ font: "600 12px var(--mono)", color: "#F2F0E8", letterSpacing: "0.06em" }}>WALL-CLOCK BUDGET & REPRODUCIBILITY</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                WALL-CLOCK BUDGET (SECONDS)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                value={cpuBudget}
                onChange={(e) => setCpuBudget(parseFloat(e.target.value) || 180)}
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                MAX OPTUNA TRIALS
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={trialBudget}
                onChange={(e) => setTrialBudget(parseInt(e.target.value) || 15)}
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                REPRODUCIBLE RANDOM SEED
              </label>
              <input
                type="number"
                value={randomSeed}
                onChange={(e) => setRandomSeed(parseInt(e.target.value) || 42)}
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(226, 239, 229, 0.2)", color: "#AAA99F", font: "500 11px var(--mono)", borderRadius: 3, cursor: "pointer" }}
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 24px",
              background: "#B69A72",
              border: "none",
              color: "#101110",
              font: "600 11px var(--mono)",
              letterSpacing: "0.06em",
              borderRadius: 3,
              cursor: "pointer"
            }}
          >
            <span>{submitting ? "INITIALIZING EXPERIMENT..." : "CREATE & LAUNCH EXPERIMENT"}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewExperimentPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, font: "400 12px var(--mono)", color: "#8c9c91" }}>LOADING PLANNER...</div>}>
      <NewExperimentContent />
    </Suspense>
  );
}
