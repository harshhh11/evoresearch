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
    desc: "Execute bounded hyperparameter tuning on a single chosen architecture.",
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
    desc: "Coordinates 12 specialized AI agents for paper ingestion, planning, data prep, compute routing, execution, autopsy, and evidence reporting.",
    icon: Users
  },
  {
    id: "paper_reproduction",
    name: "Research Paper Reproduction",
    desc: "Extracts published methodologies and baselines to verify reproducibility against measured runs.",
    icon: FileText
  },
  {
    id: "custom_workflow",
    name: "Custom Research Workflow",
    desc: "Custom objective-driven experiment pipeline with custom evaluation metrics.",
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
      
      const rawList = (pList && pList.length > 0) ? pList : DEFAULT_SEED_PROJECTS;
      const uniqueProjects: Project[] = [];
      const seenIds = new Set<string>();
      for (const p of rawList) {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
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
          1. HERO HEADER (STRICT REFERENCE REPRODUCTION WITH 100% WHITE CONTRAST)
          ========================================================================= */}
      <div
        className="hero-banner relative rounded-[26px] overflow-hidden p-8 sm:p-9 shadow-sm border border-[#124D32]"
        style={{
          background: "linear-gradient(135deg, #092F20 0%, #124D32 55%, #176B3A 100%)",
          color: "#FFFFFF"
        }}
      >
        {/* Crisp World Map Dot Matrix Graphic (Right Side) */}
        <div className="absolute right-0 top-0 bottom-0 w-[58%] pointer-events-none opacity-50 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 720 320" fill="none">
            {/* World Landmass Dots Grid */}
            <g fill="#DDEEDB" opacity="0.8">
              {/* Dense Scandinavia & Western/Eastern Europe */}
              <circle cx="280" cy="50" r="2.2" /><circle cx="295" cy="45" r="2.2" /><circle cx="310" cy="48" r="2.2" />
              <circle cx="270" cy="65" r="2.2" /><circle cx="285" cy="62" r="2.2" /><circle cx="300" cy="68" r="2.2" /><circle cx="315" cy="72" r="2.2" />
              <circle cx="265" cy="80" r="2.2" /><circle cx="280" cy="82" r="2.2" /><circle cx="295" cy="85" r="2.2" /><circle cx="310" cy="88" r="2.2" /><circle cx="325" cy="82" r="2.2" />
              <circle cx="275" cy="98" r="2.2" /><circle cx="290" cy="100" r="2.2" /><circle cx="305" cy="102" r="2.2" /><circle cx="320" cy="100" r="2.2" />
              
              {/* Mediterranean & North/Central Africa */}
              <circle cx="270" cy="120" r="2.2" /><circle cx="285" cy="122" r="2.2" /><circle cx="300" cy="125" r="2.2" /><circle cx="315" cy="126" r="2.2" /><circle cx="330" cy="128" r="2.2" />
              <circle cx="280" cy="142" r="2.2" /><circle cx="295" cy="145" r="2.2" /><circle cx="310" cy="148" r="2.2" /><circle cx="325" cy="150" r="2.2" /><circle cx="340" cy="152" r="2.2" />
              <circle cx="290" cy="168" r="2.2" /><circle cx="305" cy="170" r="2.2" /><circle cx="320" cy="172" r="2.2" /><circle cx="335" cy="174" r="2.2" />
              <circle cx="300" cy="192" r="2.2" /><circle cx="315" cy="195" r="2.2" /><circle cx="330" cy="198" r="2.2" />
              <circle cx="308" cy="218" r="2.2" /><circle cx="322" cy="220" r="2.2" /><circle cx="326" cy="242" r="2.2" />

              {/* Northern Asia / Siberia */}
              <circle cx="340" cy="45" r="2.2" /><circle cx="360" cy="40" r="2.2" /><circle cx="380" cy="38" r="2.2" /><circle cx="400" cy="42" r="2.2" /><circle cx="420" cy="40" r="2.2" /><circle cx="440" cy="44" r="2.2" /><circle cx="460" cy="46" r="2.2" /><circle cx="480" cy="48" r="2.2" /><circle cx="500" cy="52" r="2.2" /><circle cx="520" cy="56" r="2.2" />
              <circle cx="350" cy="62" r="2.2" /><circle cx="370" cy="60" r="2.2" /><circle cx="390" cy="58" r="2.2" /><circle cx="410" cy="60" r="2.2" /><circle cx="430" cy="62" r="2.2" /><circle cx="450" cy="64" r="2.2" /><circle cx="470" cy="66" r="2.2" /><circle cx="490" cy="68" r="2.2" /><circle cx="510" cy="72" r="2.2" /><circle cx="530" cy="74" r="2.2" />
              <circle cx="360" cy="80" r="2.2" /><circle cx="380" cy="78" r="2.2" /><circle cx="400" cy="76" r="2.2" /><circle cx="420" cy="78" r="2.2" /><circle cx="440" cy="80" r="2.2" /><circle cx="460" cy="82" r="2.2" /><circle cx="480" cy="84" r="2.2" /><circle cx="500" cy="88" r="2.2" /><circle cx="520" cy="90" r="2.2" />

              {/* Middle East, India, China, East Asia */}
              <circle cx="345" cy="100" r="2.2" /><circle cx="365" cy="102" r="2.2" /><circle cx="385" cy="100" r="2.2" /><circle cx="405" cy="98" r="2.2" /><circle cx="425" cy="96" r="2.2" /><circle cx="445" cy="98" r="2.2" /><circle cx="465" cy="102" r="2.2" /><circle cx="485" cy="104" r="2.2" /><circle cx="505" cy="108" r="2.2" />
              <circle cx="360" cy="120" r="2.2" /><circle cx="375" cy="124" r="2.2" /><circle cx="395" cy="122" r="2.2" /><circle cx="415" cy="118" r="2.2" /><circle cx="435" cy="116" r="2.2" /><circle cx="455" cy="118" r="2.2" /><circle cx="475" cy="122" r="2.2" /><circle cx="495" cy="124" r="2.2" />
              <circle cx="380" cy="142" r="2.2" /><circle cx="392" cy="150" r="2.2" /><circle cx="405" cy="162" r="2.2" /><circle cx="430" cy="138" r="2.2" /><circle cx="450" cy="136" r="2.2" /><circle cx="470" cy="140" r="2.2" /><circle cx="490" cy="142" r="2.2" /><circle cx="510" cy="135" r="2.2" />
              <circle cx="395" cy="178" r="2.2" /><circle cx="445" cy="156" r="2.2" /><circle cx="465" cy="158" r="2.2" /><circle cx="480" cy="160" r="2.2" /><circle cx="500" cy="155" r="2.2" />

              {/* SE Asia & Australia */}
              <circle cx="460" cy="178" r="2.2" /><circle cx="475" cy="182" r="2.2" /><circle cx="490" cy="186" r="2.2" />
              <circle cx="480" cy="208" r="2.2" /><circle cx="495" cy="212" r="2.2" /><circle cx="510" cy="216" r="2.2" /><circle cx="530" cy="214" r="2.2" /><circle cx="545" cy="218" r="2.2" />
              <circle cx="490" cy="230" r="2.2" /><circle cx="505" cy="234" r="2.2" /><circle cx="525" cy="236" r="2.2" /><circle cx="540" cy="238" r="2.2" />
              <circle cx="500" cy="252" r="2.2" /><circle cx="520" cy="255" r="2.2" /><circle cx="535" cy="258" r="2.2" />

              {/* North & Central America (Left Segment) */}
              <circle cx="70" cy="55" r="2.2" /><circle cx="90" cy="50" r="2.2" /><circle cx="110" cy="48" r="2.2" /><circle cx="130" cy="54" r="2.2" />
              <circle cx="80" cy="72" r="2.2" /><circle cx="100" cy="70" r="2.2" /><circle cx="120" cy="68" r="2.2" /><circle cx="140" cy="72" r="2.2" /><circle cx="160" cy="76" r="2.2" />
              <circle cx="90" cy="90" r="2.2" /><circle cx="110" cy="88" r="2.2" /><circle cx="130" cy="86" r="2.2" /><circle cx="150" cy="92" r="2.2" /><circle cx="170" cy="95" r="2.2" />
              <circle cx="100" cy="108" r="2.2" /><circle cx="120" cy="106" r="2.2" /><circle cx="140" cy="110" r="2.2" /><circle cx="155" cy="115" r="2.2" />
              <circle cx="115" cy="126" r="2.2" /><circle cx="130" cy="130" r="2.2" /><circle cx="142" cy="142" r="2.2" />
              {/* South America */}
              <circle cx="155" cy="165" r="2.2" /><circle cx="170" cy="170" r="2.2" /><circle cx="185" cy="178" r="2.2" />
              <circle cx="160" cy="188" r="2.2" /><circle cx="175" cy="194" r="2.2" /><circle cx="190" cy="202" r="2.2" />
              <circle cx="165" cy="212" r="2.2" /><circle cx="178" cy="220" r="2.2" /><circle cx="185" cy="235" r="2.2" />
              <circle cx="170" cy="250" r="2.2" /><circle cx="175" cy="268" r="2.2" />
            </g>
          </svg>
        </div>

        {/* Luminous Glowing Emerald & Sage Wave-Line Illustration */}
        <div className="absolute right-0 top-0 bottom-0 w-[58%] pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 720 320" preserveAspectRatio="none" fill="none">
            <defs>
              <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Soft Ambient Glow Underlay */}
            <path
              d="M-40,320 C180,270 380,140 720,40"
              stroke="#238653"
              strokeWidth="14"
              strokeOpacity="0.35"
              filter="url(#emeraldGlow)"
            />
            {/* Primary Vivid Emerald Wave */}
            <path
              d="M-20,315 C190,265 390,135 720,35"
              stroke="#238653"
              strokeWidth="4"
              strokeOpacity="0.95"
            />
            {/* Bright Sage Crest Line */}
            <path
              d="M10,320 C220,250 420,115 720,20"
              stroke="#DDEEDB"
              strokeWidth="2.5"
              strokeOpacity="0.8"
            />
            {/* High-Luminance Thin Wave Detail */}
            <path
              d="M50,325 C260,230 460,95 720,8"
              stroke="#A8E0B8"
              strokeWidth="1.8"
              strokeOpacity="0.7"
            />
            <path
              d="M90,330 C300,210 500,75 720,-2"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeOpacity="0.55"
            />
          </svg>
        </div>

        {/* Hero Content (Guaranteed Pure White and Sage Text) */}
        <div className="relative z-10 max-w-3xl">
          <div
            className="hero-eyebrow text-[11px] font-bold uppercase mb-2.5"
            style={{ color: "#DDEEDB", letterSpacing: "2px" }}
          >
            UNIVERSAL AI EXPERIMENTATION PLANNER
          </div>
          <h1
            className="hero-title text-[32px] sm:text-[36px] font-bold leading-tight tracking-tight mb-3"
            style={{ color: "#FFFFFF", fontWeight: 700 }}
          >
            Configure General AI Research Experiment
          </h1>
          <p
            className="hero-desc text-[14px] sm:text-[14.5px] leading-relaxed font-normal"
            style={{ color: "rgba(255, 255, 255, 0.90)", maxWidth: "780px" }}
          >
            Select a research project, dataset, execution approach, model catalog, and execution budget across Machine Learning, NLP, Computer Vision, Time-Series, and Custom Research domains.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* =========================================================================
            SECTION 1: RESEARCH PROJECT & CONTEXT (WHITE ROUNDED CARD)
            ========================================================================= */}
        <div className="bg-white border border-[#E5EBE5] rounded-3xl p-7 sm:p-8 shadow-xs">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[14px] shrink-0">
                1
              </span>
              <h2 className="font-bold text-[20px] text-[#17251D] tracking-tight">
                Research Project & Context
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setNewProjectModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#E5EBE5] text-[13px] font-semibold text-[#17251D] hover:bg-[#F5F9F3] hover:border-[#124D32] transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Create New Project</span>
            </button>
          </div>

          {/* Desktop Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            {/* Left: Project Selector */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-bold text-[#17251D]">
                  Research Project (Deduplicated)
                </label>
                <span className="text-[11px] font-semibold text-[#124D32] bg-[#DDEEDB] px-2.5 py-0.5 rounded-full">
                  {projects.length} Available
                </span>
              </div>
              <div className="relative">
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-[46px] px-4 pr-10 rounded-xl bg-[#FFFFFF] border border-[#E5EBE5] text-[13.5px] font-medium text-[#17251D] focus:outline-none focus:border-[#124D32] shadow-xs cursor-pointer appearance-none transition-colors"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.domain || "general_ai"}] {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#89958D] pointer-events-none" />
              </div>
            </div>

            {/* Right: Experiment Title */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#17251D]">
                Experiment Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Experiment on Matbench — Experimental Band Gap (matbench_expt_gap)"
                className="w-full h-[46px] px-4 rounded-xl bg-[#FFFFFF] border border-[#E5EBE5] text-[13.5px] font-medium text-[#17251D] focus:outline-none focus:border-[#124D32] shadow-xs transition-colors"
              />
            </div>
          </div>

          {/* Project Selection Chips (Matching Reference Image) */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {projects.slice(0, 4).map((p, idx) => {
              const isSelected = projectId === p.id;
              const displayName = p.name.length > 25 ? p.name.slice(0, 24) + "..." : p.name;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProjectId(p.id)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#124D32] text-white shadow-xs"
                      : "bg-[#FFFFFF] border border-[#E5EBE5] text-[#65736A] hover:bg-[#F5F9F3] hover:text-[#17251D]"
                  }`}
                >
                  {isSelected && <Check size={14} strokeWidth={2.5} />}
                  <span>{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: EXECUTION APPROACH (EXACT 5 EQUAL CARDS IN ONE ROW ON DESKTOP)
            ========================================================================= */}
        <div className="bg-white border border-[#E5EBE5] rounded-3xl p-7 sm:p-8 shadow-xs">
          {/* Card Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[14px] shrink-0">
              2
            </span>
            <h2 className="font-bold text-[20px] text-[#17251D] tracking-tight">
              Execution Approach
            </h2>
          </div>

          {/* 5 Cards Grid in One Horizontal Row on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {EXECUTION_APPROACHES.map((appr) => {
              const isSelected = executionApproach === appr.id;
              const Icon = appr.icon;

              return (
                <div
                  key={appr.id}
                  onClick={() => setExecutionApproach(appr.id)}
                  className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer select-none min-h-[175px] ${
                    isSelected
                      ? "bg-[#EEF6EA] border-[1.5px] border-[#124D32] shadow-xs"
                      : "bg-white border border-[#E5EBE5] hover:border-[#DDEEDB] hover:bg-[#F5F9F3]/60"
                  }`}
                >
                  {/* Top Right Selected Check Badge */}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#124D32] text-white flex items-center justify-center absolute top-3.5 right-3.5 shadow-xs">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  <div>
                    {/* Sage Circular Icon Container */}
                    <div className="w-10 h-10 rounded-full bg-[#DDEEDB] flex items-center justify-center mb-4">
                      <Icon size={19} className="text-[#124D32]" strokeWidth={2} />
                    </div>

                    {/* Card Title */}
                    <h3 className={`font-bold text-[14px] leading-snug mb-2 ${isSelected ? "text-[#124D32]" : "text-[#17251D]"}`}>
                      {appr.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[12px] text-[#65736A] leading-relaxed">
                      {appr.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 3: MODEL CATALOG & ARCHITECTURE
            ========================================================================= */}
        <div className="bg-white border border-[#E5EBE5] rounded-3xl p-7 sm:p-8 shadow-xs">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[14px] shrink-0">
                3
              </span>
              <h2 className="font-bold text-[20px] text-[#17251D] tracking-tight">
                Model Catalog & Architecture
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAIRecommend}
              disabled={aiRecommending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#124D32] hover:bg-[#092F20] text-white text-[13px] font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Sparkles size={15} />
              <span>{aiRecommending ? "Analyzing Benchmarks..." : "AI Recommend Model"}</span>
            </button>
          </div>

          {/* AI Recommendation Alert */}
          {aiRecommendation && (
            <div className="p-4 rounded-2xl bg-[#EEF6EA] border border-[#124D32] text-[12.5px] text-[#124D32] font-medium flex items-center gap-2.5 mb-5 shadow-xs">
              <Sparkles size={16} className="shrink-0" />
              <span>{aiRecommendation}</span>
            </div>
          )}

          {/* Category Tabs (Exact Reference Style Pills) */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {Object.keys(CATEGORIZED_MODEL_CATALOG).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#124D32] text-white shadow-xs"
                      : "bg-white border border-[#E5EBE5] text-[#17251D] hover:bg-[#F5F9F3]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Model Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#EEF6EA] border-[#124D32] shadow-xs"
                      : "bg-white border-[#E5EBE5] hover:border-[#DDEEDB] hover:bg-[#F5F9F3]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[13.5px] text-[#17251D]">
                      {m.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E5EBE5] text-[#124D32]">
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#65736A] leading-relaxed">
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
        <div className="bg-white border border-[#E5EBE5] rounded-3xl p-7 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[14px] shrink-0">
              4
            </span>
            <h2 className="font-bold text-[20px] text-[#17251D] tracking-tight">
              Dataset & Prediction Target
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#17251D]">
                Select Research Dataset
              </label>
              <div className="relative">
                <select
                  value={datasetId}
                  onChange={(e) => handleDatasetChange(e.target.value)}
                  className="w-full h-[46px] px-4 pr-10 rounded-xl bg-[#FFFFFF] border border-[#E5EBE5] text-[13.5px] font-medium text-[#17251D] focus:outline-none focus:border-[#124D32] shadow-xs appearance-none cursor-pointer"
                >
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.row_count} rows) [{d.task_type.toUpperCase()}]
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#89958D] pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#17251D]">
                Target Prediction Column
              </label>
              <div className="relative">
                <select
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="w-full h-[46px] px-4 pr-10 rounded-xl bg-[#FFFFFF] border border-[#E5EBE5] text-[13.5px] font-medium text-[#17251D] focus:outline-none focus:border-[#124D32] shadow-xs appearance-none cursor-pointer"
                >
                  {supportedTargets.map((t: string) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#89958D] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 5: EXECUTION BUDGET & SCIENTIFIC CONTROLS
            ========================================================================= */}
        <div className="bg-white border border-[#E5EBE5] rounded-3xl p-7 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3.5 mb-6">
            <span className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center font-bold text-[14px] shrink-0">
              5
            </span>
            <h2 className="font-bold text-[20px] text-[#17251D] tracking-tight">
              Execution Budget & Scientific Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Budget */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[12.5px] font-semibold text-[#17251D]">
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
                className="accent-[#124D32] cursor-pointer w-full mt-2"
              />
              <span className="text-[11px] text-[#89958D]">Bounded execution limit per model run</span>
            </div>

            {/* Trial Budget */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[12.5px] font-semibold text-[#17251D]">
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
                className="accent-[#124D32] cursor-pointer w-full mt-2"
              />
              <span className="text-[11px] text-[#89958D]">Number of Bayesian/Optuna search trials</span>
            </div>

            {/* Failure Memory Mode */}
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#17251D]">
                Scientific Memory Mode
              </label>
              <div className="relative">
                <select
                  value={memoryMode}
                  onChange={(e) => setMemoryMode(e.target.value as any)}
                  className="w-full h-[46px] px-4 pr-10 rounded-xl bg-[#FFFFFF] border border-[#E5EBE5] text-[13.5px] font-medium text-[#17251D] focus:outline-none focus:border-[#124D32] shadow-xs appearance-none cursor-pointer"
                >
                  <option value="failure_recovery">Verified Failure & Recovery Memory</option>
                  <option value="success_only">Success-Only Memory</option>
                  <option value="baseline">Standard Baseline (No Memory)</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#89958D] pointer-events-none" />
              </div>
              <span className="text-[11px] text-[#89958D]">Structured error signature reuse</span>
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
            className="px-6 py-2.5 rounded-full bg-white border border-[#E5EBE5] text-[13.5px] font-semibold text-[#65736A] hover:bg-[#F5F9F3] hover:text-[#17251D] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2.5 px-8 py-2.5 rounded-full bg-[#124D32] hover:bg-[#092F20] text-white text-[14px] font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
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
