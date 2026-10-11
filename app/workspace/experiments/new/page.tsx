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
  RotateCcw,
  Plus,
  X,
  Code,
  Layers,
  Bot
} from "lucide-react";

// Task-Aware Categorized Model Catalog
const CATEGORIZED_MODEL_CATALOG: Record<string, Array<{ id: string; name: string; category: string; description: string; tag: string }>> = {
  "Traditional ML": [
    { id: "Ridge", name: "Ridge Regression (L2)", category: "Traditional ML", description: "Regularized linear estimator for continuous numeric targets.", tag: "CPU-Fast" },
    { id: "LogisticRegression", name: "Logistic Regression", category: "Traditional ML", description: "Linear classification baseline with probabilistic scores.", tag: "Low-Latency" },
    { id: "RandomForestRegressor", name: "Random Forest Regressor", category: "Traditional ML", description: "Ensemble of decision trees robust to non-linear noise.", tag: "Robust" },
    { id: "RandomForestClassifier", name: "Random Forest Classifier", category: "Traditional ML", description: "Decision tree ensemble for multi-class prediction.", tag: "Ensemble" },
    { id: "HistGradientBoostingRegressor", name: "HistGradientBoosting Regressor", category: "Traditional ML", description: "Histogram-based gradient boosting optimized for CPU speed.", tag: "High-Accuracy" },
    { id: "HistGradientBoostingClassifier", name: "HistGradientBoosting Classifier", category: "Traditional ML", description: "Fast gradient boosting classifier with categorical support.", tag: "High-Accuracy" },
    { id: "SVC", name: "Support Vector Classifier", category: "Traditional ML", description: "Maximum margin kernel boundary classifier.", tag: "Kernel" }
  ],
  "Deep Learning": [
    { id: "PyTorchMLP", name: "Multi-Layer Perceptron (PyTorch)", category: "Deep Learning", description: "Deep feedforward neural network with ReLU & BatchNorm.", tag: "PyTorch" },
    { id: "CNN1D", name: "1D Convolutional Neural Network", category: "Deep Learning", description: "1D conv layers for sequential tabular/spectral signals.", tag: "Neural" },
    { id: "Autoencoder", name: "Variational Autoencoder", category: "Deep Learning", description: "Unsupervised representation learning & bottleneck encoding.", tag: "Generative" }
  ],
  "NLP & Transformers": [
    { id: "BERTSeqClassifier", name: "BERT Sequence Classifier", category: "NLP & Transformers", description: "Transformer encoder fine-tuned for text classification.", tag: "Transformer" },
    { id: "Seq2SeqTransformer", name: "Sequence-to-Sequence Transformer", category: "NLP & Transformers", description: "Encoder-decoder model for language translation & summary.", tag: "Seq2Seq" },
    { id: "LocalOpenLLM", name: "Local Open-Weight LLM (Llama-3-8B)", category: "NLP & Transformers", description: "Local quantized LLM inference for scientific reasoning.", tag: "Local-LLM" }
  ],
  "Computer Vision": [
    { id: "VisionTransformer", name: "Vision Transformer (ViT-Base)", category: "Computer Vision", description: "Patch-based self-attention for image classification.", tag: "ViT" },
    { id: "ResNetClassifier", name: "ResNet-50 Convolutional Network", category: "Computer Vision", description: "Residual deep CNN for visual feature extraction.", tag: "CNN" },
    { id: "UNetSegmentation", name: "U-Net Medical Image Segmentation", category: "Computer Vision", description: "Encoder-decoder architecture for dense pixel segmentation.", tag: "Segmentation" }
  ],
  "Forecasting & Specialized": [
    { id: "TemporalConvNet", name: "Temporal Convolutional Network (TCN)", category: "Forecasting & Specialized", description: "Dilated 1D convolutions for multi-step horizon forecasting.", tag: "Time-Series" },
    { id: "IsolationForest", name: "Isolation Forest Anomaly Detector", category: "Forecasting & Specialized", description: "Tree isolation for outlier and anomaly detection.", tag: "Anomaly" }
  ]
};

const EXECUTION_APPROACHES = [
  { id: "single_model", name: "Single Model Experiment", desc: "Execute bounded hyperparameter tuning on a single chosen architecture." },
  { id: "comparative_model", name: "Comparative Model Benchmark", desc: "Run side-by-side evaluation across baseline and candidate models." },
  { id: "ai_agent_orchestrated", name: "AI-Agent-Orchestrated Research", desc: "Coordinates 12 specialized AI agents for paper ingestion, planning, data prep, compute routing, execution, autopsy, and evidence reporting." },
  { id: "paper_reproduction", name: "Research Paper Reproduction", desc: "Extracts published methodologies and baselines to verify reproducibility against measured runs." },
  { id: "custom_workflow", name: "Custom Research Workflow", desc: "Custom objective-driven experiment pipeline with custom evaluation metrics." }
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

  // Form State
  const [projectId, setProjectId] = useState(initialProjectId);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("Machine Learning");
  const [executionApproach, setExecutionApproach] = useState("ai_agent_orchestrated");
  const [taskType, setTaskType] = useState("regression");
  const [datasetId, setDatasetId] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Traditional ML");
  const [baselineModel, setBaselineModel] = useState("Ridge");
  const [candidateModels, setCandidateModels] = useState<string[]>(["Ridge", "HistGradientBoostingRegressor"]);
  const [memoryMode, setMemoryMode] = useState<"baseline" | "success_only" | "failure_recovery">("failure_recovery");
  const [cpuBudget, setCpuBudget] = useState(180.0);
  const [trialBudget, setTrialBudget] = useState(15);
  const [randomSeed, setRandomSeed] = useState(42);

  // AI Recommendation State
  const [aiRecommending, setAiRecommending] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // New Project Modal State
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDomain, setNewProjDomain] = useState("Machine Learning");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const loadResources = async () => {
    try {
      const [pList, dList] = await Promise.all([api.getProjects(), api.getDatasets()]);
      
      // Deduplicate projects by ID
      const uniqueProjects: Project[] = [];
      const seenIds = new Set<string>();
      for (const p of pList) {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          uniqueProjects.push(p);
        }
      }

      setProjects(uniqueProjects);
      setDatasets(dList);

      if (uniqueProjects.length && !projectId) {
        setProjectId(uniqueProjects[0].id);
      }

      let targetDs = dList[0];
      if (initialDatasetId) {
        const match = dList.find((d) => d.id === initialDatasetId);
        if (match) targetDs = match;
      }

      if (targetDs) {
        setDatasetId(targetDs.id);
        setTaskType(targetDs.task_type || "regression");
        setTargetColumn(targetDs.target_col || "target");
        setName(`Experiment on ${targetDs.name}`);
      }
    } catch (err) {
      console.error("Failed to load planner resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [initialProjectId, initialDatasetId]);

  const handleDatasetChange = (id: string) => {
    setDatasetId(id);
    const selected = datasets.find((d) => d.id === id);
    if (selected) {
      setTaskType(selected.task_type || "regression");
      setTargetColumn(selected.target_col || "target");
      setName(`Multi-Agent Run: ${selected.name}`);
    }
  };

  const handleAIRecommend = () => {
    setAiRecommending(true);
    setTimeout(() => {
      if (taskType === "classification") {
        setBaselineModel("HistGradientBoostingClassifier");
        setCandidateModels(["LogisticRegression", "HistGradientBoostingClassifier", "RandomForestClassifier"]);
        setSelectedCategory("Traditional ML");
        setAiRecommendation("Recommended HistGradientBoostingClassifier & RandomForest for robust classification with 4x CPU latency optimization.");
      } else if (taskType === "nlp") {
        setBaselineModel("Seq2SeqTransformer");
        setCandidateModels(["BERTSeqClassifier", "Seq2SeqTransformer", "LocalOpenLLM"]);
        setSelectedCategory("NLP & Transformers");
        setAiRecommendation("Recommended Seq2Seq Transformer & Local Llama-3-8B for scientific NLP extraction & reasoning.");
      } else if (taskType === "vision") {
        setBaselineModel("VisionTransformer");
        setCandidateModels(["VisionTransformer", "ResNetClassifier", "UNetSegmentation"]);
        setSelectedCategory("Computer Vision");
        setAiRecommendation("Recommended Vision Transformer (ViT-Base) with patch self-attention for medical image classification.");
      } else {
        setBaselineModel("Ridge");
        setCandidateModels(["Ridge", "HistGradientBoostingRegressor", "RandomForestRegressor"]);
        setSelectedCategory("Traditional ML");
        setAiRecommendation("Recommended Ridge L2 closed-form baseline & HistGradientBoosting for fast regression within 180s budget.");
      }
      setAiRecommending(false);
    }, 600);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    setCreatingProject(true);
    try {
      const created = await api.createProject({
        name: newProjName,
        domain: newProjDomain,
        description: newProjDesc,
        research_question: `Investigating ${newProjName} performance`,
        hypothesis: "Multi-agent optimization improves benchmark efficiency."
      });
      await loadResources();
      setProjectId(created.id);
      setNewProjectModal(false);
      setNewProjName("");
      setNewProjDesc("");
    } catch (err: any) {
      alert(err.message || "Failed to create research project");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId || !datasetId) {
      alert("Please select a research project and dataset.");
      return;
    }
    setSubmitting(true);
    try {
      const exp = await api.createExperiment({
        project_id: projectId,
        dataset_id: datasetId,
        name,
        domain,
        task_type: taskType,
        baseline_model: baselineModel,
        candidate_models: candidateModels,
        execution_stage: "PLANNING",
        memory_mode: memoryMode,
        target_column: targetColumn,
        preprocessing_config: { scaler_type: "standard", impute_strategy: "mean" },
        evaluation_metrics: taskType === "classification" ? ["accuracy", "f1", "roc_auc"] : ["mae", "rmse", "r2"],
        cpu_budget_seconds: cpuBudget,
        trial_budget: trialBudget,
        random_seed: randomSeed
      });

      // Launch multi-agent orchestration if approach selected
      if (executionApproach === "ai_agent_orchestrated") {
        await api.runOrchestration({ experiment_id: exp.id, execution_strategy: "Hybrid" });
      }

      router.push(`/workspace/experiments/${exp.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to launch experiment");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#68766D" }}>
        LOADING UNIVERSAL EXPERIMENT PLANNER...
      </div>
    );
  }

  const currentDataset = datasets.find((d) => d.id === datasetId);
  const supportedTargets = currentDataset?.target_columns && currentDataset.target_columns.length > 0
    ? currentDataset.target_columns
    : [currentDataset?.target_col || "target"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1040, margin: "0 auto", color: "#26352D" }}>
      {/* Page Header */}
      <div style={{ borderBottom: "1px solid #DFE5DC", paddingBottom: 16 }}>
        <div style={{ font: "600 10px/1 var(--mono)", color: "#176B4D", letterSpacing: "0.14em", marginBottom: 6 }}>
          UNIVERSAL AI EXPERIMENTATION PLANNER // DOMAIN-GENERAL WORKSPACE
        </div>
        <h1 style={{ margin: 0, font: "600 24px/1.2 var(--font-primary), serif", color: "#26352D" }}>
          Configure General AI Research Experiment
        </h1>
        <p style={{ margin: "6px 0 0", font: "400 13px/1.5 var(--font-primary), serif", color: "#68766D" }}>
          Select a research project, dataset, execution approach, model catalog, and execution budget across Machine Learning, NLP, Computer Vision, Time-Series, and Custom Research domains.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Section 1: Research Context & Deduplicated Project Selector */}
        <div style={{ background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#E6F0E9", color: "#176B4D", display: "grid", placeContent: "center", font: "600 11px var(--mono)", border: "1px solid #DFE5DC" }}>1</span>
              <span style={{ font: "600 12px var(--mono)", color: "#26352D", letterSpacing: "0.06em" }}>RESEARCH PROJECT & CONTEXT</span>
            </div>
            <button
              type="button"
              onClick={() => setNewProjectModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "#FFFFFF",
                border: "1px solid #DFE5DC",
                color: "#176B4D",
                font: "600 10px var(--mono)",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              <Plus size={12} />
              <span>CREATE NEW PROJECT</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6 }}>
                RESEARCH PROJECT (DEDUPLICATED)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, color: "#26352D", font: "400 12px var(--mono)", outline: "none" }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.domain || "General AI"}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6 }}>
                EXPERIMENT TITLE
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. LLM Reasoning Fine-Tuning Benchmark"
                style={{ width: "100%", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, color: "#26352D", font: "400 12px var(--mono)", outline: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Execution Approach Selection */}
        <div style={{ background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#E6F0E9", color: "#176B4D", display: "grid", placeContent: "center", font: "600 11px var(--mono)", border: "1px solid #DFE5DC" }}>2</span>
            <span style={{ font: "600 12px var(--mono)", color: "#26352D", letterSpacing: "0.06em" }}>EXECUTION APPROACH</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat( auto-fit, minmax(180px, 1fr) )", gap: 12 }}>
            {EXECUTION_APPROACHES.map((appr) => {
              const isSelected = executionApproach === appr.id;
              return (
                <div
                  key={appr.id}
                  onClick={() => setExecutionApproach(appr.id)}
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    border: isSelected ? "1.5px solid #176B4D" : "1px solid #DFE5DC",
                    background: isSelected ? "#E6F0E9" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ font: "600 11px var(--mono)", color: isSelected ? "#176B4D" : "#26352D", marginBottom: 4 }}>
                    {appr.name}
                  </div>
                  <div style={{ font: "400 11px/1.3 var(--font-primary), serif", color: "#68766D" }}>
                    {appr.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Task-Aware Categorized Model Catalog */}
        <div style={{ background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#E6F0E9", color: "#176B4D", display: "grid", placeContent: "center", font: "600 11px var(--mono)", border: "1px solid #DFE5DC" }}>3</span>
              <span style={{ font: "600 12px var(--mono)", color: "#26352D", letterSpacing: "0.06em" }}>MODEL CATALOG & ARCHITECTURE</span>
            </div>

            <button
              type="button"
              onClick={handleAIRecommend}
              disabled={aiRecommending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: "#176B4D",
                border: "none",
                color: "#FFFFFF",
                font: "600 10px var(--mono)",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              <Sparkles size={12} />
              <span>{aiRecommending ? "RECOMMENDING..." : "AI RECOMMEND MODEL"}</span>
            </button>
          </div>

          {aiRecommendation && (
            <div style={{ padding: 12, borderRadius: 6, background: "#E6F0E9", border: "1px solid #176B4D", font: "400 11px var(--mono)", color: "#176B4D", marginBottom: 16 }}>
              🤖 <strong>AI RECOMMENDATION:</strong> {aiRecommendation}
            </div>
          )}

          {/* Category Tabs */}
          <div style={{ display: "flex", gap: 12, borderBottom: "1px solid #DFE5DC", paddingBottom: 10, marginBottom: 14 }}>
            {Object.keys(CATEGORIZED_MODEL_CATALOG).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: "none",
                  border: "none",
                  font: selectedCategory === cat ? "600 11px var(--mono)" : "400 11px var(--mono)",
                  color: selectedCategory === cat ? "#176B4D" : "#68766D",
                  borderBottom: selectedCategory === cat ? "2px solid #176B4D" : "2px solid transparent",
                  cursor: "pointer"
                }}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Models Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {CATEGORIZED_MODEL_CATALOG[selectedCategory]?.map((m) => {
              const isSelected = baselineModel === m.id || candidateModels.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setBaselineModel(m.id);
                    if (!candidateModels.includes(m.id)) setCandidateModels([...candidateModels, m.id]);
                  }}
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    border: isSelected ? "1.5px solid #176B4D" : "1px solid #DFE5DC",
                    background: isSelected ? "#E6F0E9" : "#FFFFFF",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ font: "600 11px var(--mono)", color: isSelected ? "#176B4D" : "#26352D" }}>{m.name}</div>
                    <span style={{ font: "600 9px var(--mono)", background: "#FFFFFF", padding: "2px 6px", borderRadius: 4, border: "1px solid #DFE5DC", color: "#68766D" }}>{m.tag}</span>
                  </div>
                  <div style={{ font: "400 10px var(--font-primary), serif", color: "#68766D" }}>{m.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Dataset & Target Column Selection */}
        <div style={{ background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#E6F0E9", color: "#176B4D", display: "grid", placeContent: "center", font: "600 11px var(--mono)", border: "1px solid #DFE5DC" }}>4</span>
            <span style={{ font: "600 12px var(--mono)", color: "#26352D", letterSpacing: "0.06em" }}>DATASET & PREDICTION TARGET</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6 }}>DATASET</label>
              <select
                value={datasetId}
                onChange={(e) => handleDatasetChange(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, color: "#26352D", font: "400 12px var(--mono)", outline: "none" }}
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.row_count} samples) [{d.task_type.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 6 }}>TARGET COLUMN</label>
              <select
                value={targetColumn}
                onChange={(e) => setTargetColumn(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, color: "#26352D", font: "400 12px var(--mono)", outline: "none" }}
              >
                {supportedTargets.map((t: string) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ padding: "10px 20px", background: "#FFFFFF", border: "1px solid #DFE5DC", color: "#68766D", font: "600 11px var(--mono)", borderRadius: 6, cursor: "pointer" }}
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
              padding: "10px 26px",
              background: "#176B4D",
              border: "none",
              color: "#FFFFFF",
              font: "600 11px var(--mono)",
              borderRadius: 6,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(23, 107, 77, 0.2)"
            }}
          >
            <span>{submitting ? "INITIALIZING EXPERIMENT..." : "CREATE & LAUNCH EXPERIMENT"}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </form>

      {/* Inline Modal: Create New Research Project */}
      {newProjectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeContent: "center", zIndex: 100 }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 12, padding: 24, width: 440, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ font: "600 14px var(--font-primary), serif", color: "#26352D" }}>Create New Research Project</div>
              <button onClick={() => setNewProjectModal(false)} style={{ background: "none", border: "none", color: "#68766D", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 4 }}>PROJECT NAME</label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. LLM Reasoning Benchmark"
                  style={{ width: "100%", padding: "8px 10px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, font: "400 12px var(--mono)", color: "#26352D" }}
                />
              </div>

              <div>
                <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 4 }}>RESEARCH DOMAIN</label>
                <select
                  value={newProjDomain}
                  onChange={(e) => setNewProjDomain(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, font: "400 12px var(--mono)", color: "#26352D" }}
                >
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="NLP & Transformers">NLP & Transformers</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Time-Series Forecasting">Time-Series Forecasting</option>
                  <option value="Healthcare & Biomedical">Healthcare & Biomedical</option>
                  <option value="Materials Science">Materials Science</option>
                  <option value="Custom Research">Custom Research</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", font: "600 10px var(--mono)", color: "#68766D", marginBottom: 4 }}>DESCRIPTION</label>
                <textarea
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Brief objective statement..."
                  rows={3}
                  style={{ width: "100%", padding: "8px 10px", background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 6, font: "400 12px var(--font-primary), serif", color: "#26352D" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setNewProjectModal(false)}
                  style={{ padding: "8px 14px", background: "#FFFFFF", border: "1px solid #DFE5DC", color: "#68766D", font: "600 10px var(--mono)", borderRadius: 6, cursor: "pointer" }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  style={{ padding: "8px 18px", background: "#176B4D", border: "none", color: "#FFFFFF", font: "600 10px var(--mono)", borderRadius: 6, cursor: "pointer" }}
                >
                  {creatingProject ? "CREATING..." : "SAVE PROJECT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewExperimentPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, font: "400 12px var(--mono)", color: "#68766D" }}>LOADING PLANNER...</div>}>
      <NewExperimentContent />
    </Suspense>
  );
}
