"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, Project, Dataset } from "@/lib/api";
import {
  Sparkles,
  ArrowRight,
  Layers,
  BarChart3,
  Users,
  FileText,
  GitBranch,
  Plus,
  X,
  Check,
  ChevronDown
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

const DEFAULT_SEED_PROJECTS: Project[] = [
  {
    id: "368af2a4-6ffb-4647-8995-07f26ce5f6a0",
    name: "Materials Science Benchmark Project",
    domain: "general_ai",
    description: "Controlled benchmark investigating verified failure-and-recovery memory under strict CPU-time constraints on materials-science regression benchmarks.",
    research_question: "Can evidence-validated failure-and-recovery memory improve the optimization efficiency of materials models?",
    hypothesis: "Retaining structured error signatures reduces repeated trial failures.",
    tags: "[\"materials-science\", \"band-gap\", \"nomad2018\"]",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "9cbaaa23-6ce2-4bab-8cbc-45ab5796ab71",
    name: "Industrial IoT Sensor Time-Series Forecasting",
    domain: "Time-Series Forecasting",
    description: "Predictive maintenance and anomaly detection on multivariate sensor telemetry.",
    research_question: "What horizon-aware forecasting models achieve minimum RMSE?",
    hypothesis: "Dilated temporal convolutions outperform recurrent models.",
    tags: "[]",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "720411fa-1f92-46bc-97aa-5d6299da39cb",
    name: "LLM Reasoning & Sequence-to-Sequence Benchmark",
    domain: "NLP & Transformers",
    description: "Evaluation of open-weight Transformers and LLM reasoning accuracy.",
    research_question: "How do lightweight local Transformer architectures compare on complex Q&A?",
    hypothesis: "Local LLM quantization preserves reasoning accuracy.",
    tags: "[]",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "b41cb8ae-ed06-4d79-8b51-24be968a1722",
    name: "Medical Image Segmentation & Diagnostic AI",
    domain: "Computer Vision",
    description: "High-resolution biomedical image segmentation using Vision Transformers.",
    research_question: "Can hybrid Vision Transformers improve mean IoU scores on medical imaging?",
    hypothesis: "Dense skip connections enhance boundary localization.",
    tags: "[]",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_SEED_DATASETS: Dataset[] = [
  {
    id: "ds-materials-nomad",
    name: "Matbench — Experimental Band Gap (matbench_expt_gap)",
    description: "NOMAD 2018 transparent conductors dataset with measured and computed bandgap targets.",
    file_path: "data/nomad.csv",
    feature_names: "[]",
    summary_stats: "{}",
    task_type: "regression",
    target_col: "formation_energy_ev_natom",
    row_count: 3000,
    col_count: 14,
    created_at: new Date().toISOString()
  },
  {
    id: "ds-sensor-iot",
    name: "Multivariate IoT Sensor Telemetry",
    description: "Multivariate industrial sensor readings with equipment fault flags.",
    file_path: "data/sensor.csv",
    feature_names: "[]",
    summary_stats: "{}",
    task_type: "classification",
    target_col: "fault_detected",
    row_count: 5000,
    col_count: 12,
    created_at: new Date().toISOString()
  }
];

const EXECUTION_APPROACHES = [
  {
    id: "single_model",
    name: "Single Model Experiment",
    desc: "Execute bounded hyperparameter tuning on one chosen architecture.",
    icon: Layers
  },
  {
    id: "comparative_model",
    name: "Comparative Model Benchmark",
    desc: "Run side-by-side evaluation across baseline and candidate models.",
    icon: BarChart3
  },
  {
    id: "ai_agent_orchestrated",
    name: "AI-Agent-Orchestrated Research",
    desc: "Coordinate 12 specialized agents across planning, execution, autopsy, and reporting.",
    icon: Users
  },
  {
    id: "paper_reproduction",
    name: "Research Paper Reproduction",
    desc: "Extract published methodologies to verify reproducibility against measured runs.",
    icon: FileText
  },
  {
    id: "custom_workflow",
    name: "Custom Research Workflow",
    desc: "Build an objective-driven experiment pipeline with custom evaluation metrics.",
    icon: GitBranch
  }
];

function NewExperimentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("project_id") || "";
  const initialDatasetId = searchParams.get("dataset_id") || "";

  const [projects, setProjects] = useState<Project[]>(DEFAULT_SEED_PROJECTS);
  const [datasets, setDatasets] = useState<Dataset[]>(DEFAULT_SEED_DATASETS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [projectId, setProjectId] = useState(initialProjectId || DEFAULT_SEED_PROJECTS[0].id);
  const [name, setName] = useState("Experiment on Matbench — Experimental Band Gap (matbench_expt_gap)");
  const [domain, setDomain] = useState("Machine Learning");
  const [executionApproach, setExecutionApproach] = useState("ai_agent_orchestrated");
  const [taskType, setTaskType] = useState("regression");
  const [datasetId, setDatasetId] = useState(DEFAULT_SEED_DATASETS[0].id);
  const [targetColumn, setTargetColumn] = useState("formation_energy_ev_natom");
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
      const [pList, dList] = await Promise.all([
        api.getProjects().catch(() => []),
        api.getDatasets().catch(() => [])
      ]);
      
      const rawList = (pList && pList.length > 0) ? [...pList, ...DEFAULT_SEED_PROJECTS] : DEFAULT_SEED_PROJECTS;
      const uniqueProjects: Project[] = [];
      const seenIds = new Set<string>();
      const seenNames = new Set<string>();
      for (const p of rawList) {
        const normalizedName = (p.name || "").trim().toLowerCase();
        if (!seenIds.has(p.id) && normalizedName && !seenNames.has(normalizedName)) {
          seenIds.add(p.id);
          seenNames.add(normalizedName);
          uniqueProjects.push(p);
        }
      }

      const activeDatasets = (dList && dList.length > 0) ? dList : DEFAULT_SEED_DATASETS;

      setProjects(uniqueProjects);
      setDatasets(activeDatasets);

      if (uniqueProjects.length) {
        const matchingProj = initialProjectId && uniqueProjects.some((p) => p.id === initialProjectId)
          ? initialProjectId
          : uniqueProjects[0].id;
        setProjectId(matchingProj);
      }

      let targetDs = activeDatasets[0];
      if (initialDatasetId) {
        const match = activeDatasets.find((d) => d.id === initialDatasetId);
        if (match) targetDs = match;
      }

      if (targetDs) {
        setDatasetId(targetDs.id);
        setTaskType(targetDs.task_type || "regression");
        setTargetColumn(targetDs.target_col || "formation_energy_ev_natom");
      }
    } catch (err) {
      console.error("Failed to load planner resources:", err);
      setProjects(DEFAULT_SEED_PROJECTS);
      setDatasets(DEFAULT_SEED_DATASETS);
      setProjectId(DEFAULT_SEED_PROJECTS[0].id);
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
      setTargetColumn(selected.target_col || "formation_energy_ev_natom");
      setName(`Experiment on ${selected.name}`);
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
      <div className="py-24 text-center text-[#89958D] text-[13px] font-medium">
        Loading Universal Experiment Planner...
      </div>
    );
  }

  const currentDataset = datasets.find((d) => d.id === datasetId);
  const supportedTargets = currentDataset?.target_columns && currentDataset.target_columns.length > 0
    ? currentDataset.target_columns
    : [currentDataset?.target_col || "formation_energy_ev_natom"];

  return (
    <div className="flex flex-col gap-6 w-full mx-auto text-[#17251D] pb-16">
      {/* =========================================================================
          1. CINEMATIC HERO SECTION (~242px HEIGHT ON DESKTOP, NO TEXT OVERLAP)
          ========================================================================= */}
      <div
        className="hero-banner relative rounded-[22px] overflow-hidden px-8 sm:px-10 py-8 min-h-[224px] lg:h-[242px] flex items-center border border-[#124D32]/80"
        style={{
          background: "linear-gradient(125deg, #07271A 0%, #092F20 34%, #124D32 76%, #175C3B 100%)",
          color: "#FFFFFF"
        }}
      >
        {/* Subtle Soft Inner Lighting Behind Right Graphics (Restrained, Non-Neon) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 52% 88% at 86% 48%, rgba(35, 122, 73, 0.34) 0%, rgba(18, 77, 50, 0.12) 48%, transparent 74%)"
          }}
        />

        {/* Crisp Dotted World Map + Restrained Flowing Wave (Isolated to Right 48% Decorative Zone) */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[52%] lg:w-[48%] pointer-events-none overflow-hidden"
          style={{
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 20%, rgba(0,0,0,1) 46%)",
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 20%, rgba(0,0,0,1) 46%)"
          }}
        >
          {/* Dotted World Map Matrix */}
          <svg className="w-full h-full opacity-55" viewBox="0 0 640 260" preserveAspectRatio="xMaxYMid slice" fill="none">
            <g fill="#DDEEDB" opacity="0.78">
              {/* North & Central America */}
              <circle cx="95" cy="48" r="2.1" /><circle cx="112" cy="44" r="2.1" /><circle cx="130" cy="42" r="2.1" /><circle cx="148" cy="46" r="2.1" />
              <circle cx="105" cy="64" r="2.1" /><circle cx="122" cy="60" r="2.1" /><circle cx="140" cy="58" r="2.1" /><circle cx="158" cy="62" r="2.1" /><circle cx="174" cy="66" r="2.1" />
              <circle cx="116" cy="80" r="2.1" /><circle cx="134" cy="78" r="2.1" /><circle cx="152" cy="76" r="2.1" /><circle cx="168" cy="82" r="2.1" />
              <circle cx="128" cy="96" r="2.1" /><circle cx="144" cy="94" r="2.1" /><circle cx="158" cy="98" r="2.1" />
              <circle cx="140" cy="112" r="2.1" /><circle cx="152" cy="118" r="2.1" />
              {/* South America */}
              <circle cx="168" cy="138" r="2.1" /><circle cx="184" cy="144" r="2.1" /><circle cx="198" cy="150" r="2.1" />
              <circle cx="174" cy="158" r="2.1" /><circle cx="188" cy="164" r="2.1" /><circle cx="202" cy="172" r="2.1" />
              <circle cx="178" cy="180" r="2.1" /><circle cx="190" cy="188" r="2.1" /><circle cx="194" cy="202" r="2.1" />
              <circle cx="182" cy="216" r="2.1" /><circle cx="186" cy="230" r="2.1" />

              {/* Europe */}
              <circle cx="272" cy="46" r="2.1" /><circle cx="288" cy="42" r="2.1" /><circle cx="304" cy="44" r="2.1" />
              <circle cx="264" cy="60" r="2.1" /><circle cx="280" cy="58" r="2.1" /><circle cx="296" cy="62" r="2.1" /><circle cx="312" cy="66" r="2.1" />
              <circle cx="268" cy="76" r="2.1" /><circle cx="284" cy="78" r="2.1" /><circle cx="300" cy="80" r="2.1" /><circle cx="316" cy="76" r="2.1" />
              <circle cx="276" cy="92" r="2.1" /><circle cx="292" cy="94" r="2.1" /><circle cx="308" cy="92" r="2.1" />

              {/* Africa */}
              <circle cx="274" cy="110" r="2.1" /><circle cx="290" cy="112" r="2.1" /><circle cx="306" cy="114" r="2.1" /><circle cx="322" cy="116" r="2.1" />
              <circle cx="284" cy="128" r="2.1" /><circle cx="300" cy="130" r="2.1" /><circle cx="316" cy="132" r="2.1" /><circle cx="332" cy="134" r="2.1" />
              <circle cx="294" cy="148" r="2.1" /><circle cx="310" cy="150" r="2.1" /><circle cx="326" cy="152" r="2.1" />
              <circle cx="302" cy="168" r="2.1" /><circle cx="318" cy="170" r="2.1" />
              <circle cx="308" cy="188" r="2.1" /><circle cx="320" cy="192" r="2.1" /><circle cx="314" cy="208" r="2.1" />

              {/* Northern Asia & Eurasia */}
              <circle cx="334" cy="42" r="2.1" /><circle cx="354" cy="38" r="2.1" /><circle cx="374" cy="36" r="2.1" /><circle cx="394" cy="38" r="2.1" /><circle cx="414" cy="36" r="2.1" /><circle cx="434" cy="40" r="2.1" /><circle cx="454" cy="42" r="2.1" /><circle cx="474" cy="44" r="2.1" /><circle cx="494" cy="48" r="2.1" />
              <circle cx="344" cy="58" r="2.1" /><circle cx="364" cy="56" r="2.1" /><circle cx="384" cy="54" r="2.1" /><circle cx="404" cy="56" r="2.1" /><circle cx="424" cy="58" r="2.1" /><circle cx="444" cy="60" r="2.1" /><circle cx="464" cy="62" r="2.1" /><circle cx="484" cy="64" r="2.1" /><circle cx="504" cy="68" r="2.1" />
              <circle cx="354" cy="74" r="2.1" /><circle cx="374" cy="72" r="2.1" /><circle cx="394" cy="70" r="2.1" /><circle cx="414" cy="72" r="2.1" /><circle cx="434" cy="74" r="2.1" /><circle cx="454" cy="76" r="2.1" /><circle cx="474" cy="80" r="2.1" /><circle cx="494" cy="82" r="2.1" />

              {/* South & East Asia */}
              <circle cx="342" cy="92" r="2.1" /><circle cx="362" cy="94" r="2.1" /><circle cx="382" cy="92" r="2.1" /><circle cx="402" cy="90" r="2.1" /><circle cx="422" cy="90" r="2.1" /><circle cx="442" cy="92" r="2.1" /><circle cx="462" cy="96" r="2.1" /><circle cx="482" cy="98" r="2.1" />
              <circle cx="356" cy="110" r="2.1" /><circle cx="374" cy="114" r="2.1" /><circle cx="394" cy="112" r="2.1" /><circle cx="414" cy="108" r="2.1" /><circle cx="434" cy="108" r="2.1" /><circle cx="454" cy="110" r="2.1" /><circle cx="474" cy="114" r="2.1" />
              <circle cx="378" cy="130" r="2.1" /><circle cx="392" cy="138" r="2.1" /><circle cx="402" cy="148" r="2.1" /><circle cx="428" cy="126" r="2.1" /><circle cx="448" cy="126" r="2.1" /><circle cx="466" cy="130" r="2.1" /><circle cx="486" cy="126" r="2.1" />

              {/* Oceania & Australia */}
              <circle cx="452" cy="156" r="2.1" /><circle cx="468" cy="160" r="2.1" /><circle cx="484" cy="164" r="2.1" />
              <circle cx="472" cy="184" r="2.1" /><circle cx="488" cy="188" r="2.1" /><circle cx="504" cy="190" r="2.1" /><circle cx="520" cy="188" r="2.1" />
              <circle cx="482" cy="204" r="2.1" /><circle cx="498" cy="208" r="2.1" /><circle cx="516" cy="208" r="2.1" />
              <circle cx="494" cy="222" r="2.1" /><circle cx="512" cy="224" r="2.1" />
            </g>
          </svg>

          {/* Restrained Multi-Strand Flowing Green Wave Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 260" preserveAspectRatio="none" fill="none">
            <path
              d="M20,248 C185,205 360,118 640,34"
              stroke="#237A49"
              strokeWidth="2.4"
              strokeOpacity="0.65"
            />
            <path
              d="M55,254 C215,198 395,102 640,22"
              stroke="#7BC496"
              strokeWidth="1.6"
              strokeOpacity="0.5"
            />
            <path
              d="M95,258 C250,188 430,86 640,12"
              stroke="#DDEEDB"
              strokeWidth="1.15"
              strokeOpacity="0.38"
            />
          </svg>
        </div>

        {/* Hero Typography Content (Strict Left Column Isolation) */}
        <div className="relative z-10 max-w-[600px]">
          <div
            className="hero-eyebrow text-[11px] font-semibold uppercase mb-3"
            style={{ color: "#DDEEDB", letterSpacing: "2px" }}
          >
            UNIVERSAL AI EXPERIMENTATION PLANNER
          </div>
          <h1
            className="hero-title text-[30px] sm:text-[34px] lg:text-[38px] mb-3.5"
            style={{
              color: "#FFFFFF",
              fontWeight: 800,
              letterSpacing: "-1.2px",
              lineHeight: 1.12
            }}
          >
            Configure General AI Research Experiment
          </h1>
          <p
            className="hero-desc text-[14px] font-normal leading-[1.55]"
            style={{ color: "rgba(255, 255, 255, 0.88)", maxWidth: "560px" }}
          >
            Select a research project, dataset, execution approach, model catalog, and execution budget across Machine Learning, NLP, Computer Vision, Time-Series, and Custom Research domains.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* =========================================================================
            SECTION 1: RESEARCH PROJECT & CONTEXT (PREMIUM WHITE CARD)
            ========================================================================= */}
        <div className="bg-white border border-[#E5EBE5] rounded-[20px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(18,77,50,0.03),0_4px_16px_-6px_rgba(18,77,50,0.04)] hover:shadow-[0_6px_22px_-6px_rgba(18,77,50,0.07)] hover:border-[#D5E0D5] transition-all duration-200">
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[13px] shrink-0">
                1
              </span>
              <h2 className="text-[20px] sm:text-[23px] font-bold text-[#17251D] tracking-[-0.02em] leading-snug">
                Research Project &amp; Context
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setNewProjectModal(true)}
              className="inline-flex items-center gap-2 h-[38px] px-4.5 rounded-full bg-white border border-[#E5EBE5] text-[13px] font-medium text-[#17251D] hover:bg-[#F8FAF7] hover:border-[#124D32] hover:text-[#124D32] active:scale-[0.98] transition-all duration-180 cursor-pointer shadow-[0_1px_2px_rgba(18,77,50,0.03)]"
            >
              <Plus size={15} strokeWidth={2.2} />
              <span>Create New Project</span>
            </button>
          </div>

          {/* Desktop Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Left: Project Selector */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-[#17251D]">
                  Research Project (Deduplicated)
                </label>
                <span className="text-[11px] font-medium text-[#124D32] bg-[#EEF6EA] border border-[#DDEEDB] px-2.5 py-0.5 rounded-full">
                  {projects.length} Available
                </span>
              </div>
              <div className="relative">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-[44px] px-4 pr-10 rounded-[12px] bg-[#FFFFFF] border border-[#E5EBE5] hover:border-[#C8D6C8] text-[14px] font-normal text-[#17251D] focus:outline-none focus:border-[#124D32] focus:ring-3 focus:ring-[#124D32]/10 shadow-[0_1px_2px_rgba(18,77,50,0.02)] cursor-pointer appearance-none transition-all duration-180"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.domain || "general_ai"}] {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#65736A] pointer-events-none" />
              </div>
            </div>

            {/* Right: Experiment Title */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-[#17251D]">
                Experiment Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Experiment on Matbench — Experimental Band Gap (matbench_expt_gap)"
                className="w-full h-[44px] px-4 rounded-[12px] bg-[#FFFFFF] border border-[#E5EBE5] hover:border-[#C8D6C8] text-[14px] font-normal text-[#17251D] placeholder-[#89958D] focus:outline-none focus:border-[#124D32] focus:ring-3 focus:ring-[#124D32]/10 shadow-[0_1px_2px_rgba(18,77,50,0.02)] transition-all duration-180"
              />
            </div>
          </div>

          {/* Refined Project Selection Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            {projects.slice(0, 4).map((p) => {
              const isSelected = projectId === p.id;
              const displayName = p.name.length > 26 ? p.name.slice(0, 25) + "..." : p.name;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProjectId(p.id)}
                  className={`h-[32px] px-3.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all duration-180 cursor-pointer ${
                    isSelected
                      ? "bg-[#124D32] text-white shadow-[0_2px_6px_rgba(18,77,50,0.2)]"
                      : "bg-[#F8FAF7] border border-[#E5EBE5] text-[#65736A] hover:bg-[#EEF6EA] hover:border-[#DDEEDB] hover:text-[#124D32]"
                  }`}
                >
                  {isSelected && <Check size={13} strokeWidth={2.5} />}
                  <span>{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: EXECUTION APPROACH (5 EVENLY SIZED PREMIUM CARDS IN ONE ROW)
            ========================================================================= */}
        <div className="bg-white border border-[#E5EBE5] rounded-[20px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(18,77,50,0.03),0_4px_16px_-6px_rgba(18,77,50,0.04)] hover:shadow-[0_6px_22px_-6px_rgba(18,77,50,0.07)] hover:border-[#D5E0D5] transition-all duration-200">
          {/* Card Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[13px] shrink-0">
              2
            </span>
            <h2 className="text-[20px] sm:text-[23px] font-bold text-[#17251D] tracking-[-0.02em] leading-snug">
              Execution Approach
            </h2>
          </div>

          {/* 5 Equal-Width Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {EXECUTION_APPROACHES.map((appr) => {
              const isSelected = executionApproach === appr.id;
              const Icon = appr.icon;

              return (
                <div
                  key={appr.id}
                  onClick={() => setExecutionApproach(appr.id)}
                  className={`relative rounded-[18px] p-5 flex flex-col justify-start transition-all duration-200 cursor-pointer select-none h-full min-h-[192px] group ${
                    isSelected
                      ? "bg-[#EEF6EA] border-[1.5px] border-[#124D32] shadow-[0_4px_14px_-4px_rgba(18,77,50,0.12)]"
                      : "bg-white border border-[#E5EBE5] hover:border-[#C8DAC8] hover:bg-[#F8FAF7] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgba(18,77,50,0.08)]"
                  }`}
                >
                  {/* Top Right Circular Green Check Indicator */}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#124D32] text-white flex items-center justify-center absolute top-3.5 right-3.5 shadow-xs transition-transform duration-200 scale-100">
                      <Check size={12} strokeWidth={2.75} />
                    </div>
                  )}

                  {/* Circular Sage Icon Container */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 shrink-0 transition-colors duration-200 ${
                      isSelected
                        ? "bg-[#DDEEDB] text-[#124D32]"
                        : "bg-[#EEF6EA] text-[#124D32] group-hover:bg-[#DDEEDB]"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.85} />
                  </div>

                  {/* Card Heading (16px, weight 650) */}
                  <h3
                    className={`text-[16px] leading-[1.3] mb-2 pr-5 transition-colors duration-180 ${
                      isSelected ? "text-[#124D32]" : "text-[#17251D]"
                    }`}
                    style={{ fontWeight: 650 }}
                  >
                    {appr.name}
                  </h3>

                  {/* Body Description (14px, weight 400, line-height 1.55) */}
                  <p className="text-[14px] font-normal text-[#65736A] leading-[1.55] m-0">
                    {appr.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: MODEL CATALOG & ARCHITECTURE
            ========================================================================= */}
        <div className="bg-white border border-[#E5EBE5] rounded-[20px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(18,77,50,0.03),0_4px_16px_-6px_rgba(18,77,50,0.04)] hover:shadow-[0_6px_22px_-6px_rgba(18,77,50,0.07)] hover:border-[#D5E0D5] transition-all duration-200">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[13px] shrink-0">
                3
              </span>
              <h2 className="text-[20px] sm:text-[23px] font-bold text-[#17251D] tracking-[-0.02em] leading-snug">
                Model Catalog &amp; Architecture
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAIRecommend}
              disabled={aiRecommending}
              className="inline-flex items-center gap-2 h-[38px] px-5 rounded-full bg-[#124D32] hover:bg-[#092F20] text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(18,77,50,0.2)] hover:shadow-[0_4px_12px_rgba(18,77,50,0.28)] active:scale-[0.98] disabled:opacity-70 transition-all duration-180 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles size={15} className={aiRecommending ? "animate-spin" : ""} />
              <span>{aiRecommending ? "Analyzing Benchmarks..." : "AI Recommend Model"}</span>
            </button>
          </div>

          {/* AI Recommendation Alert */}
          {aiRecommendation && (
            <div className="p-4 rounded-[14px] bg-[#EEF6EA] border border-[#124D32]/30 text-[13.5px] text-[#124D32] font-medium flex items-center gap-2.5 mb-5 transition-all duration-200">
              <Sparkles size={16} className="shrink-0" />
              <span>{aiRecommendation}</span>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {Object.keys(CATEGORIZED_MODEL_CATALOG).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-[36px] px-4.5 rounded-full text-[13px] transition-all duration-180 cursor-pointer ${
                    isSelected
                      ? "bg-[#124D32] text-white font-semibold shadow-[0_2px_8px_rgba(18,77,50,0.18)]"
                      : "bg-[#F8FAF7] border border-[#E5EBE5] text-[#65736A] font-medium hover:bg-[#EEF6EA] hover:border-[#DDEEDB] hover:text-[#124D32]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Model Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIZED_MODEL_CATALOG[selectedCategory]?.map((m) => {
              const isSelected = baselineModel === m.id || candidateModels.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setBaselineModel(m.id);
                    if (!candidateModels.includes(m.id)) {
                      setCandidateModels([...candidateModels, m.id]);
                    }
                  }}
                  className={`relative p-5 rounded-[16px] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#EEF6EA] border-[1.5px] border-[#124D32] shadow-[0_3px_12px_-4px_rgba(18,77,50,0.12)]"
                      : "bg-white border border-[#E5EBE5] hover:border-[#C8DAC8] hover:bg-[#F8FAF7] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_-6px_rgba(18,77,50,0.08)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span
                      className={`text-[16px] leading-snug ${
                        isSelected ? "text-[#124D32]" : "text-[#17251D]"
                      }`}
                      style={{ fontWeight: 650 }}
                    >
                      {m.name}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? "bg-[#124D32] text-white"
                          : "bg-[#F8FAF7] border border-[#E5EBE5] text-[#124D32]"
                      }`}
                    >
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[14px] font-normal text-[#65736A] leading-[1.55] m-0">
                    {m.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: DATASET & PREDICTION TARGET
            ========================================================================= */}
        <div className="bg-white border border-[#E5EBE5] rounded-[20px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(18,77,50,0.03),0_4px_16px_-6px_rgba(18,77,50,0.04)] hover:shadow-[0_6px_22px_-6px_rgba(18,77,50,0.07)] hover:border-[#D5E0D5] transition-all duration-200">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[13px] shrink-0">
              4
            </span>
            <h2 className="text-[20px] sm:text-[23px] font-bold text-[#17251D] tracking-[-0.02em] leading-snug">
              Dataset &amp; Prediction Target
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-[#17251D]">
                Select Research Dataset
              </label>
              <div className="relative">
                <select
                  value={datasetId}
                  onChange={(e) => handleDatasetChange(e.target.value)}
                  className="w-full h-[44px] px-4 pr-10 rounded-[12px] bg-[#FFFFFF] border border-[#E5EBE5] hover:border-[#C8D6C8] text-[14px] font-normal text-[#17251D] focus:outline-none focus:border-[#124D32] focus:ring-3 focus:ring-[#124D32]/10 shadow-[0_1px_2px_rgba(18,77,50,0.02)] appearance-none cursor-pointer transition-all duration-180"
                >
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.row_count} rows) [{d.task_type.toUpperCase()}]
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#65736A] pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-[#17251D]">
                Target Prediction Column
              </label>
              <div className="relative">
                <select
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="w-full h-[44px] px-4 pr-10 rounded-[12px] bg-[#FFFFFF] border border-[#E5EBE5] hover:border-[#C8D6C8] text-[14px] font-normal text-[#17251D] focus:outline-none focus:border-[#124D32] focus:ring-3 focus:ring-[#124D32]/10 shadow-[0_1px_2px_rgba(18,77,50,0.02)] appearance-none cursor-pointer transition-all duration-180"
                >
                  {supportedTargets.map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#65736A] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 5: EXECUTION BUDGET & SCIENTIFIC CONTROLS
            ========================================================================= */}
        <div className="bg-white border border-[#E5EBE5] rounded-[20px] p-6 sm:p-7 shadow-[0_1px_3px_rgba(18,77,50,0.03),0_4px_16px_-6px_rgba(18,77,50,0.04)] hover:shadow-[0_6px_22px_-6px_rgba(18,77,50,0.07)] hover:border-[#D5E0D5] transition-all duration-200">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[13px] shrink-0">
              5
            </span>
            <h2 className="text-[20px] sm:text-[23px] font-bold text-[#17251D] tracking-[-0.02em] leading-snug">
              Execution Budget &amp; Scientific Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* CPU Budget */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[12px] font-semibold text-[#17251D]">
                <span>CPU Wall-Clock Budget</span>
                <span className="text-[#124D32] font-bold">{cpuBudget}s</span>
              </div>
              <input
                type="range"
                min="30"
                max="600"
                step="30"
                value={cpuBudget}
                onChange={(e) => setCpuBudget(parseFloat(e.target.value))}
                className="accent-[#124D32] cursor-pointer w-full mt-2.5"
              />
              <span className="text-[11px] font-medium text-[#65736A]">Bounded execution limit per model run</span>
            </div>

            {/* Trial Budget */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[12px] font-semibold text-[#17251D]">
                <span>Hyperparameter Trials</span>
                <span className="text-[#124D32] font-bold">{trialBudget}</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={trialBudget}
                onChange={(e) => setTrialBudget(parseInt(e.target.value))}
                className="accent-[#124D32] cursor-pointer w-full mt-2.5"
              />
              <span className="text-[11px] font-medium text-[#65736A]">Number of Bayesian/Optuna search trials</span>
            </div>

            {/* Failure Memory Mode */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-[#17251D]">
                Scientific Memory Mode
              </label>
              <div className="relative">
                <select
                  value={memoryMode}
                  onChange={(e) => setMemoryMode(e.target.value as any)}
                  className="w-full h-[44px] px-4 pr-10 rounded-[12px] bg-[#FFFFFF] border border-[#E5EBE5] hover:border-[#C8D6C8] text-[14px] font-normal text-[#17251D] focus:outline-none focus:border-[#124D32] focus:ring-3 focus:ring-[#124D32]/10 shadow-[0_1px_2px_rgba(18,77,50,0.02)] appearance-none cursor-pointer transition-all duration-180"
                >
                  <option value="failure_recovery">Verified Failure &amp; Recovery Memory</option>
                  <option value="success_only">Success-Only Memory</option>
                  <option value="baseline">Standard Baseline (No Memory)</option>
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#65736A] pointer-events-none" />
              </div>
              <span className="text-[11px] font-medium text-[#65736A]">Structured error signature reuse</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM ACTION BAR
            ========================================================================= */}
        <div className="flex items-center justify-end gap-3.5 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-[42px] px-6 rounded-full bg-white border border-[#E5EBE5] text-[14px] font-medium text-[#65736A] hover:bg-[#F8FAF7] hover:border-[#C8D6C8] hover:text-[#17251D] transition-all duration-180 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2.5 h-[42px] px-7 rounded-full bg-[#124D32] hover:bg-[#092F20] text-white text-[14px] font-semibold shadow-[0_2px_10px_rgba(18,77,50,0.22)] hover:shadow-[0_4px_14px_rgba(18,77,50,0.3)] active:scale-[0.98] disabled:opacity-70 transition-all duration-180 cursor-pointer"
          >
            <span>{submitting ? "Initializing Experiment..." : "Create & Launch Experiment"}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* CREATE NEW PROJECT MODAL */}
      {newProjectModal && (
        <div className="fixed inset-0 bg-[#092F20]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E5EBE5] rounded-3xl p-7 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-bold text-[#17251D]">
                Create New Research Project
              </h3>
              <button
                type="button"
                onClick={() => setNewProjectModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F5F9F3] flex items-center justify-center text-[#89958D] hover:text-[#17251D] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#17251D]">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Molecular Property Prediction Benchmark"
                  className="w-full h-[42px] px-3.5 rounded-xl border border-[#E5EBE5] text-[13px] font-medium text-[#17251D] focus:outline-none focus:border-[#124D32]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#17251D]">
                  Research Domain
                </label>
                <select
                  value={newProjDomain}
                  onChange={(e) => setNewProjDomain(e.target.value)}
                  className="w-full h-[42px] px-3.5 rounded-xl border border-[#E5EBE5] text-[13px] font-medium text-[#17251D] focus:outline-none focus:border-[#124D32]"
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

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#17251D]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Objective statement and hypotheses..."
                  className="w-full p-3 rounded-xl border border-[#E5EBE5] text-[13px] font-medium text-[#17251D] focus:outline-none focus:border-[#124D32]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setNewProjectModal(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E5EBE5] text-[13px] font-semibold text-[#65736A] hover:bg-[#F5F9F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="px-6 py-2.5 rounded-full bg-[#124D32] hover:bg-[#092F20] text-white text-[13px] font-semibold transition-colors"
                >
                  {creatingProject ? "Creating..." : "Save Project"}
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
    <Suspense fallback={<div className="py-24 text-center text-[#89958D] text-[13px] font-medium">Loading Planner...</div>}>
      <NewExperimentContent />
    </Suspense>
  );
}
