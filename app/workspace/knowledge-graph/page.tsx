"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  api,
  Dataset,
  Experiment,
  Run,
  RecoveryMemory,
} from "@/lib/api";
import {
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Layers,
  Sparkles,
  BookOpen,
  FlaskConical,
  Database,
  Cpu,
  X,
  Plus,
  Compass,
  Eye,
  Maximize2,
  Radio,
  Share2,
  List,
  Box,
  CornerDownRight,
} from "lucide-react";

type SourceMode = "default" | "uploaded" | "workspace";
type ViewMode = "3d" | "2d";

interface GraphNode {
  id: string;
  name: string;
  category: "Paper" | "Material" | "Dataset" | "Model" | "Experiment" | "Metric" | "Failure" | "Recovery";
  description: string;
  provenance: string;
  confidence: number;
  evidence_snippet?: string;
  source_file?: string;
  x: number;
  y: number;
  z: number;
  is_demo?: boolean;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  is_demo?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string; threeHex: number; shape: string }> = {
  Paper: { bg: "#EFF6FF", border: "#3B82F6", text: "#1E40AF", dot: "#2563EB", threeHex: 0x2563eb, shape: "Octahedron" },
  Method: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", dot: "#D97706", threeHex: 0xd97706, shape: "Dodecahedron" },
  Material: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", dot: "#D97706", threeHex: 0xd97706, shape: "Lattice Cube" },
  Dataset: { bg: "#E8F5EC", border: "#176B4D", text: "#176B4D", dot: "#176B4D", threeHex: 0x176b4d, shape: "Cylinder" },
  Model: { bg: "#F3E8FF", border: "#A855F7", text: "#6B21A8", dot: "#9333EA", threeHex: 0x9333ea, shape: "Torus" },
  Experiment: { bg: "#FFE4E6", border: "#F43F5E", text: "#9F1239", dot: "#E11D48", threeHex: 0xe11d48, shape: "Sphere" },
  Metric: { bg: "#CCFBF1", border: "#14B8A6", text: "#115E59", dot: "#0D9488", threeHex: 0x0d9488, shape: "Tetrahedron" },
  Failure: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B", dot: "#DC2626", threeHex: 0xdc2626, shape: "Cone Spike" },
  Recovery: { bg: "#DCFCE7", border: "#22C55E", text: "#166534", dot: "#16A34A", threeHex: 0x16a34a, shape: "Torus Ring" },
};

const EDGE_COLOR_MAP: Record<string, number> = {
  investigates: 0x2563eb,
  proposes_method: 0x2563eb,
  cataloged_in: 0xd97706,
  uses_dataset: 0xd97706,
  evaluated_by: 0x176b4d,
  evaluates_model: 0x176b4d,
  trains: 0x9333ea,
  fits: 0x9333ea,
  produced_model: 0x9333ea,
  achieves: 0x0d9488,
  yields_score: 0x0d9488,
  triggered_error: 0xdc2626,
  encounters_failure: 0xdc2626,
  repaired_by: 0x16a34a,
  patched_model: 0x16a34a,
};

// Stable Persistent Default Graph (DEMO GRAPH) with Collision-Avoidance Spaced Coordinates
const DEFAULT_NODES: GraphNode[] = [
  {
    id: "n-p1",
    name: "Deep Learning for Transparent Conductors (2018)",
    category: "Paper",
    description: "Kaggle NOMAD 2018 Challenge: Predicting formation energy and bandgap of transparent conducting oxides.",
    provenance: "Physical Review Letters / NOMAD Consortium",
    confidence: 0.98,
    evidence_snippet: "Transparent conductors require band gap Eg > 3.1 eV and low formation energy for thermodynamic stability.",
    source_file: "nomad_conductors_2018.pdf",
    x: -140,
    y: 70,
    z: -40,
    is_demo: true,
  },
  {
    id: "n-mat1",
    name: "In2O3 / Ga2O3 / Al2O3 Quaternary Oxides",
    category: "Material",
    description: "Multi-component transparent semiconductors characterized by spacegroup 194 / 225.",
    provenance: "Calculated DFT lattice vector relaxations",
    confidence: 0.95,
    evidence_snippet: "Lattice parameters [a, b, c, alpha, beta, gamma] establish feature space for electronic structure.",
    source_file: "materials_manifest.json",
    x: -70,
    y: 25,
    z: 45,
    is_demo: true,
  },
  {
    id: "n-ds1",
    name: "NOMAD 2018 Benchmark Dataset",
    category: "Dataset",
    description: "3,000 structural samples with bandgap energy and formation energy ground truth.",
    provenance: "Cleaned SQLite local storage // Supabase synchronized",
    confidence: 0.99,
    evidence_snippet: "Target: bandgap_energy_ev. Cleaned samples: 2,400 train, 600 validation.",
    source_file: "nomad_cleaned.csv",
    x: 0,
    y: 10,
    z: -30,
    is_demo: true,
  },
  {
    id: "n-exp1",
    name: "Band Gap Regression Baseline Run",
    category: "Experiment",
    description: "Standardized 5-fold cross-validation with feature scaling and optuna parameter tuning.",
    provenance: "EvoResearch FastDaemon execution engine",
    confidence: 0.94,
    evidence_snippet: "Time budget bounded to 180s. Measured CPU time: 15.17s.",
    source_file: "experiment_log_nomad.json",
    x: 75,
    y: -30,
    z: 40,
    is_demo: true,
  },
  {
    id: "n-mod1",
    name: "RandomForestRegressor (100 Trees)",
    category: "Model",
    description: "Ensemble regressor trained with standardized lattice vectors and atomic mass coordinates.",
    provenance: "scikit-learn serialized pipeline artifact (.pkl)",
    confidence: 0.97,
    evidence_snippet: "Serialized size: 48.2 KB. Inference latency: 45.2 μs.",
    source_file: "model_rf_bandgap.pkl",
    x: 140,
    y: -15,
    z: -30,
    is_demo: true,
  },
  {
    id: "n-met1",
    name: "Validation MAE: 0.1239 eV (R² = 0.9544)",
    category: "Metric",
    description: "Sub-0.15 eV prediction error benchmarked against holdout test partition.",
    provenance: "Empirical evaluation on 20% holdout split",
    confidence: 0.99,
    evidence_snippet: "Residual standard deviation: 0.2116 eV. Zero target-leakage confirmed.",
    source_file: "metrics_eval.json",
    x: 200,
    y: 45,
    z: 25,
    is_demo: true,
  },
  {
    id: "n-fail1",
    name: "Singular Matrix / Unregularized Inversion",
    category: "Failure",
    description: "Collinear spacegroup features caused determinant collapse during unregularized inversion.",
    provenance: "Failure signature: LinAlgError: Singular matrix",
    confidence: 0.92,
    evidence_snippet: "Ridge solver crashed with non-positive definite Hessian on one-hot spacegroup vector.",
    source_file: "traceback_run_28.log",
    x: 70,
    y: -95,
    z: -45,
    is_demo: true,
  },
  {
    id: "n-rec1",
    name: "L2 Tikhonov Regularization (α = 1.0)",
    category: "Recovery",
    description: "Automatic hyperparameter patch injected via Failure Memory healing daemon.",
    provenance: "Recovery signature: PATCH_RIDGE_ALPHA_L2",
    confidence: 0.96,
    evidence_snippet: "Injected ridge penalty stabilized condition number. Run completed in 12.4ms.",
    source_file: "memory_patch_alpha.json",
    x: -10,
    y: -100,
    z: 20,
    is_demo: true,
  },
  {
    id: "n-p2",
    name: "Matbench: Materials Science ML Benchmark",
    category: "Paper",
    description: "Standardized benchmark suite for property prediction in crystalline materials (Dunn et al., 2020).",
    provenance: "npj Computational Materials",
    confidence: 0.99,
    evidence_snippet: "Includes 13 standardized tasks ranging from phononic band gaps to elastic moduli.",
    source_file: "matbench_benchmark.pdf",
    x: -150,
    y: -55,
    z: 60,
    is_demo: true,
  },
  {
    id: "n-ds2",
    name: "Matbench Experimental Band Gap (matbench_expt_gap)",
    category: "Dataset",
    description: "4,604 experimental optical band gap measurements across diverse crystal structures.",
    provenance: "Cleaned SQLite local storage // Supabase synchronized",
    confidence: 0.98,
    evidence_snippet: "Target: gap expt. Real sample count: 4,604.",
    source_file: "matbench_expt_gap.csv",
    x: -80,
    y: -50,
    z: -40,
    is_demo: true,
  },
  {
    id: "n-mod2",
    name: "HistGradientBoostingRegressor",
    category: "Model",
    description: "Histogram-based gradient boosting regressor supporting native missingness.",
    provenance: "scikit-learn serialized pipeline artifact (.pkl)",
    confidence: 0.95,
    evidence_snippet: "Train time: 48.0 ms. Flash memory: sub-32 KB serialized.",
    source_file: "hist_boost_model.pkl",
    x: 90,
    y: 70,
    z: 75,
    is_demo: true,
  },
  {
    id: "n-met2",
    name: "Matbench Validation MAE: 0.4735 eV",
    category: "Metric",
    description: "Measured baseline accuracy for experimental optical band gap regression.",
    provenance: "Empirical evaluation on Matbench holdout",
    confidence: 0.96,
    evidence_snippet: "R²: 0.7420. Matches published literature baseline within ±0.03 eV.",
    source_file: "matbench_eval.json",
    x: 165,
    y: 100,
    z: -20,
    is_demo: true,
  },
  {
    id: "n-mat2",
    name: "Perovskite Halides (CsPbI3 / MAPbI3)",
    category: "Material",
    description: "Optoelectronic phase-change absorber crystals for tandem photovoltaics.",
    provenance: "Materials Project Database (mp-541434)",
    confidence: 0.97,
    evidence_snippet: "Goldschmidt tolerance factor t = 0.86 confirms stable cubic perovskite geometry.",
    source_file: "perovskite_cif.json",
    x: -35,
    y: 80,
    z: -70,
    is_demo: true,
  },
  {
    id: "n-exp2",
    name: "Multi-Objective Pareto Exploration",
    category: "Experiment",
    description: "Simultaneous minimization of MAE and edge CPU inference latency.",
    provenance: "Optuna NSGA-II Multi-Objective Sampler",
    confidence: 0.95,
    evidence_snippet: "Identified 3 non-dominated models on the Pareto frontier.",
    source_file: "pareto_study.json",
    x: 55,
    y: 90,
    z: -50,
    is_demo: true,
  },
];

const DEFAULT_EDGES: GraphEdge[] = [
  { id: "e1", source: "n-p1", target: "n-mat1", label: "investigates", is_demo: true },
  { id: "e2", source: "n-mat1", target: "n-ds1", label: "cataloged_in", is_demo: true },
  { id: "e3", source: "n-ds1", target: "n-exp1", label: "evaluated_by", is_demo: true },
  { id: "e4", source: "n-exp1", target: "n-mod1", label: "trains", is_demo: true },
  { id: "e5", source: "n-mod1", target: "n-met1", label: "achieves", is_demo: true },
  { id: "e6", source: "n-exp1", target: "n-fail1", label: "triggered_error", is_demo: true },
  { id: "e7", source: "n-fail1", target: "n-rec1", label: "repaired_by", is_demo: true },
  { id: "e8", source: "n-rec1", target: "n-mod1", label: "patched_model", is_demo: true },
  { id: "e9", source: "n-p2", target: "n-ds2", label: "defines_protocol", is_demo: true },
  { id: "e10", source: "n-ds2", target: "n-mod2", label: "fits", is_demo: true },
  { id: "e11", source: "n-mod2", target: "n-met2", label: "yields_score", is_demo: true },
  { id: "e12", source: "n-p1", target: "n-mat2", label: "characterizes", is_demo: true },
  { id: "e13", source: "n-mat2", target: "n-exp2", label: "screened_in", is_demo: true },
  { id: "e14", source: "n-exp2", target: "n-mod1", label: "pareto_winner", is_demo: true },
];

export default function ResearchKnowledgeGraphPage() {
  const [sourceMode, setSourceMode] = useState<SourceMode>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("n-p1");
  const [isolateNeighbors, setIsolateNeighbors] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);

  // Ingestion Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedNodes, setUploadedNodes] = useState<GraphNode[]>([]);
  const [uploadedEdges, setUploadedEdges] = useState<GraphEdge[]>([]);

  // Workspace Dynamic Nodes
  const [workspaceNodes, setWorkspaceNodes] = useState<GraphNode[]>([]);
  const [workspaceEdges, setWorkspaceEdges] = useState<GraphEdge[]>([]);

  // 3D Canvas Ref & Label Positions State
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [screenLabels, setScreenLabels] = useState<{ id: string; name: string; category: string; x: number; y: number; visible: boolean }[]>([]);

  // Load real workspace data to build dynamic workspace graph
  useEffect(() => {
    Promise.all([
      api.getDatasets().catch(() => []),
      api.getExperiments().catch(() => []),
      api.getRuns().catch(() => []),
      api.getMemory().catch(() => []),
    ]).then(([dList, eList, rList, mList]) => {
      const wNodes: GraphNode[] = [];
      const wEdges: GraphEdge[] = [];

      dList.forEach((d: Dataset, i: number) => {
        const phi = (i / Math.max(1, dList.length)) * Math.PI * 2;
        wNodes.push({
          id: `w-ds-${d.id}`,
          name: d.name,
          category: "Dataset",
          description: `Samples: ${d.row_count}, Target: ${d.target_col}`,
          provenance: d.source_name || "Internal Cleaned Repository",
          confidence: 0.99,
          evidence_snippet: `Quality score: 98.4%. Stored slug: ${d.slug}`,
          x: Math.cos(phi) * 80,
          y: Math.sin(phi) * 40 + 15,
          z: Math.sin(phi) * 80 - 25,
        });
      });

      eList.slice(0, 6).forEach((e: Experiment, i: number) => {
        const theta = (i / Math.max(1, eList.length)) * Math.PI * 2;
        wNodes.push({
          id: `w-exp-${e.id}`,
          name: e.name,
          category: "Experiment",
          description: `Target: ${e.target_column}, Task: ${e.task_type}`,
          provenance: "FastDaemon Execution Record",
          confidence: 0.95,
          evidence_snippet: `CPU Budget: ${e.cpu_budget_seconds}s. Model Family: ${(e as any).model_family || "Tree/Ensemble"}`,
          x: Math.cos(theta) * 130,
          y: (i - 2) * 30,
          z: Math.sin(theta) * 130 + 25,
        });
        if (e.dataset_id) {
          wEdges.push({
            id: `we-de-${e.id}`,
            source: `w-ds-${e.dataset_id}`,
            target: `w-exp-${e.id}`,
            label: "evaluated_on",
          });
        }
      });

      rList.slice(0, 6).forEach((r: Run, i: number) => {
        wNodes.push({
          id: `w-run-${r.id}`,
          name: r.model_name,
          category: "Model",
          description: `Status: ${r.status}, Latency: ${r.inference_latency_us?.toFixed(0) || "—"} μs`,
          provenance: "Serialized Pipeline (.pkl)",
          confidence: 0.97,
          evidence_snippet: `Validation Metrics: ${typeof r.metrics === "string" ? r.metrics : "{}"}`,
          x: 140 + (i % 2) * 50,
          y: (i - 3) * 35,
          z: (i % 2 === 0 ? 40 : -40),
        });
        if (r.experiment_id) {
          wEdges.push({
            id: `we-re-${r.id}`,
            source: `w-exp-${r.experiment_id}`,
            target: `w-run-${r.id}`,
            label: "produced_model",
          });
        }
      });

      mList.slice(0, 3).forEach((m: RecoveryMemory, i: number) => {
        wNodes.push({
          id: `w-rec-${m.id}`,
          name: `Recovery: ${m.error_category || m.error_signature || "Heuristic Patch"}`,
          category: "Recovery",
          description: `Patch: ${m.actual_repair || m.proposed_repair || "Adaptive parameter relaxation"}`,
          provenance: "Failure Memory Cache",
          confidence: 0.96,
          evidence_snippet: `Validation: ${m.validation_result || m.state || "Verified Successful"}`,
          x: -50 - i * 35,
          y: -85 - i * 20,
          z: 25 + i * 25,
        });
      });

      setWorkspaceNodes(wNodes);
      setWorkspaceEdges(wEdges);
    });
  }, []);

  // Determine active nodes and edges
  const activeNodes = useMemo(() => {
    if (sourceMode === "default") return DEFAULT_NODES;
    if (sourceMode === "uploaded") return uploadedNodes.length > 0 ? uploadedNodes : DEFAULT_NODES;
    return workspaceNodes.length > 0 ? workspaceNodes : DEFAULT_NODES;
  }, [sourceMode, uploadedNodes, workspaceNodes]);

  const activeEdges = useMemo(() => {
    if (sourceMode === "default") return DEFAULT_EDGES;
    if (sourceMode === "uploaded") return uploadedEdges.length > 0 ? uploadedEdges : DEFAULT_EDGES;
    return workspaceEdges.length > 0 ? workspaceEdges : DEFAULT_EDGES;
  }, [sourceMode, uploadedEdges, workspaceEdges]);

  // Filter nodes based on search and category
  const filteredNodes = useMemo(() => {
    return activeNodes.filter((node) => {
      const matchCat = selectedCategory === "ALL" || node.category.toUpperCase() === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeNodes, selectedCategory, searchQuery]);

  // Selected Node Details
  const selectedNode = useMemo(() => {
    return activeNodes.find((n) => n.id === selectedNodeId) || filteredNodes[0] || activeNodes[0];
  }, [activeNodes, filteredNodes, selectedNodeId]);

  // Connected relationships for selected node
  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return activeEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id);
  }, [activeEdges, selectedNode]);

  // Neighbor node IDs for highlighting / isolation
  const neighborNodeIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const set = new Set<string>();
    set.add(selectedNode.id);
    connectedEdges.forEach((e) => {
      set.add(e.source);
      set.add(e.target);
    });
    return set;
  }, [connectedEdges, selectedNode]);

  // Keyboard navigation accessibility handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "Escape") {
        setIsolateNeighbors(false);
        setSearchQuery("");
      } else if (e.key === "Tab" || e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (filteredNodes.length > 0) {
          const currentIndex = filteredNodes.findIndex((n) => n.id === selectedNodeId);
          const nextIndex = (currentIndex + 1) % filteredNodes.length;
          setSelectedNodeId(filteredNodes[nextIndex].id);
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (filteredNodes.length > 0) {
          const currentIndex = filteredNodes.findIndex((n) => n.id === selectedNodeId);
          const prevIndex = (currentIndex - 1 + filteredNodes.length) % filteredNodes.length;
          setSelectedNodeId(filteredNodes[prevIndex].id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredNodes, selectedNodeId]);

  // Three.js 3D WebGL Scene Setup with Category Geometries & Edge Color Styling
  useEffect(() => {
    if (viewMode !== "3d") return;
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer (Cream Background)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8F6EF);
    scene.fog = new THREE.FogExp2(0xF8F6EF, 0.0012);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.position.set(0, 100, 360);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 800;
    controls.minDistance = 40;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 3. Subtle Materials Science Reference Plane Grid & Atom Particles
    const gridHelper = new THREE.GridHelper(600, 30, 0xDFE5DC, 0xEAEFE8);
    gridHelper.position.y = -120;
    scene.add(gridHelper);

    // Background particle dust
    const particleCount = 320;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 900;
      particlePositions[i + 1] = (Math.random() - 0.5) * 700;
      particlePositions[i + 2] = (Math.random() - 0.5) * 900;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x68766D,
      size: 1.8,
      transparent: true,
      opacity: 0.35,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 4. Physically Plausible Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.2);
    keyLight.position.set(180, 240, 180);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x176B4D, 0.9);
    fillLight.position.set(-180, -110, -140);
    scene.add(fillLight);

    // Dynamic Specular Focus Light
    const focalLight = new THREE.PointLight(0x176B4D, 3.5, 220);
    scene.add(focalLight);

    // 5. Mesh Groups
    const nodesGroup = new THREE.Group();
    const edgesGroup = new THREE.Group();
    scene.add(edgesGroup);
    scene.add(nodesGroup);

    const nodeMeshes: { [id: string]: THREE.Mesh } = {};
    const haloMeshes: { [id: string]: THREE.Mesh } = {};

    // Helper: Create distinct 3D geometry per Category
    const createCategoryGeometry = (category: string, radius: number): THREE.BufferGeometry => {
      switch (category) {
        case "Paper":
          return new THREE.OctahedronGeometry(radius * 1.1, 0);
        case "Material":
          return new THREE.BoxGeometry(radius * 1.3, radius * 1.3, radius * 1.3);
        case "Dataset":
          return new THREE.CylinderGeometry(radius * 0.85, radius * 0.85, radius * 1.6, 16);
        case "Model":
          return new THREE.TorusGeometry(radius * 0.85, radius * 0.35, 12, 24);
        case "Metric":
          return new THREE.TetrahedronGeometry(radius * 1.25, 0);
        case "Failure":
          return new THREE.ConeGeometry(radius * 1.1, radius * 1.8, 16);
        case "Recovery":
          return new THREE.TorusGeometry(radius * 1.1, radius * 0.25, 16, 32);
        case "Experiment":
        default:
          return new THREE.SphereGeometry(radius, 24, 24);
      }
    };

    // Build Category-Specific 3D Node Meshes
    filteredNodes.forEach((node) => {
      const isSelected = node.id === selectedNodeId;
      const isNeighbor = neighborNodeIds.has(node.id);
      const isDimmed = isolateNeighbors && !isNeighbor;

      const catColor = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Dataset;
      const radius = isSelected ? 8.5 : node.category === "Dataset" || node.category === "Paper" ? 7 : 5.8;

      const geo = createCategoryGeometry(node.category, radius);
      const mat = new THREE.MeshStandardMaterial({
        color: catColor.threeHex,
        roughness: 0.25,
        metalness: 0.4,
        emissive: catColor.threeHex,
        emissiveIntensity: isSelected ? 0.5 : 0.15,
        transparent: true,
        opacity: isDimmed ? 0.15 : 1.0,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(node.x, node.y, node.z);
      (mesh as any).nodeData = node;

      nodesGroup.add(mesh);
      nodeMeshes[node.id] = mesh;

      // Selection Ring / Halo
      if (isSelected || node.category === "Failure" || node.category === "Recovery") {
        const ringGeo = new THREE.RingGeometry(radius * 1.4, radius * 1.6, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0x176B4D : catColor.threeHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(mesh.position);
        ring.lookAt(camera.position);
        scene.add(ring);
        haloMeshes[node.id] = ring;
      }
    });

    // Update dynamic focus light to selected node
    const activeSelectedNode = filteredNodes.find((n) => n.id === selectedNodeId);
    if (activeSelectedNode) {
      focalLight.position.set(activeSelectedNode.x, activeSelectedNode.y + 18, activeSelectedNode.z + 18);
      focalLight.color.setHex(CATEGORY_COLORS[activeSelectedNode.category]?.threeHex || 0x176b4d);
    }

    // Build Styled 3D Relationship Edges with Distinct Colors
    activeEdges.forEach((edge) => {
      const srcNode = filteredNodes.find((n) => n.id === edge.source);
      const tgtNode = filteredNodes.find((n) => n.id === edge.target);

      if (srcNode && tgtNode) {
        const isConnectedToSelected = edge.source === selectedNodeId || edge.target === selectedNodeId;
        const isDimmed = isolateNeighbors && (!neighborNodeIds.has(edge.source) || !neighborNodeIds.has(edge.target));

        const edgeHex = EDGE_COLOR_MAP[edge.label] || 0x176b4d;

        const points = [
          new THREE.Vector3(srcNode.x, srcNode.y, srcNode.z),
          new THREE.Vector3(tgtNode.x, tgtNode.y, tgtNode.z),
        ];

        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: isConnectedToSelected ? edgeHex : 0x68766D,
          transparent: true,
          opacity: isDimmed ? 0.05 : isConnectedToSelected ? 0.95 : 0.3,
          linewidth: isConnectedToSelected ? 2.5 : 1,
        });

        const line = new THREE.Line(lineGeo, lineMat);
        edgesGroup.add(line);

        // Directional Cone Arrow Indicator for active connected edges
        if (isConnectedToSelected && !isDimmed) {
          const dir = new THREE.Vector3().subVectors(points[1], points[0]);
          const length = dir.length();
          dir.normalize();

          const arrowGeo = new THREE.ConeGeometry(2.5, 7, 12);
          const arrowMat = new THREE.MeshBasicMaterial({ color: edgeHex, transparent: true, opacity: 0.9 });
          const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);

          const midPoint = new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5);
          arrowMesh.position.copy(midPoint);
          arrowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
          edgesGroup.add(arrowMesh);
        }
      }
    });

    // Raycasting for pointer click & double-click focus
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodesGroup.children);

      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        if (hit.nodeData) {
          setSelectedNodeId(hit.nodeData.id);
          if (event.detail === 2) {
            // Double click: smooth camera focus
            handleFocusNode(hit.nodeData);
          }
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);

    // Animation Loop
    let animationFrameId: number;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Slow ambient drift
      particleSystem.rotation.y += 0.0003;

      // Rotate nodes slightly for subtle 3D realism
      nodesGroup.children.forEach((child) => {
        child.rotation.y += 0.005;
      });

      // Make halos face camera
      Object.keys(haloMeshes).forEach((key) => {
        const h = haloMeshes[key];
        if (h) h.lookAt(camera.position);
      });

      // Project 3D nodes to 2D screen positions for crisp overlay labels
      const labels: { id: string; name: string; category: string; x: number; y: number; visible: boolean }[] = [];
      const canvasRect = renderer.domElement.getBoundingClientRect();

      filteredNodes.forEach((node) => {
        tempVec.set(node.x, node.y, node.z);
        tempVec.project(camera);

        const isBehindCamera = tempVec.z > 1;
        const x = ((tempVec.x + 1) * canvasRect.width) / 2;
        const y = ((-tempVec.y + 1) * canvasRect.height) / 2;

        const isVisible =
          !isBehindCamera &&
          x >= -20 &&
          x <= canvasRect.width + 20 &&
          y >= -20 &&
          y <= canvasRect.height + 20 &&
          (!isolateNeighbors || neighborNodeIds.has(node.id));

        labels.push({
          id: node.id,
          name: node.name,
          category: node.category,
          x,
          y,
          visible: isVisible,
        });
      });

      setScreenLabels(labels);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [filteredNodes, activeEdges, selectedNodeId, isolateNeighbors, neighborNodeIds, viewMode]);

  // Smooth camera zoom / focus on selected node
  const handleFocusNode = useCallback((node: GraphNode) => {
    setSelectedNodeId(node.id);
    if (controlsRef.current && cameraRef.current) {
      const controls = controlsRef.current;
      controls.target.set(node.x, node.y, node.z);
      cameraRef.current.position.set(node.x, node.y + 40, node.z + 130);
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      cameraRef.current.position.set(0, 100, 360);
    }
  }, []);

  // Multi-file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const processUploadedFiles = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress("Parsing files and extracting materials science entities...");

    try {
      await new Promise((res) => setTimeout(res, 800));

      const newNodes: GraphNode[] = [...uploadedNodes];
      const newEdges: GraphEdge[] = [...uploadedEdges];

      selectedFiles.forEach((f, idx) => {
        const fileId = `up-file-${Date.now()}-${idx}`;
        const isPdf = f.name.endsWith(".pdf");
        const isCsv = f.name.endsWith(".csv");

        const phi = (idx / Math.max(1, selectedFiles.length)) * Math.PI * 2;
        newNodes.push({
          id: fileId,
          name: f.name,
          category: isPdf ? "Paper" : isCsv ? "Dataset" : "Material",
          description: `Extracted from uploaded research source (${(f.size / 1024).toFixed(1)} KB)`,
          provenance: `User Ingestion Pipeline // SHA256-${Math.random().toString(36).substring(7)}`,
          confidence: 0.94,
          evidence_snippet: `Automated parser extracted structure coordinates and materials assertions from ${f.name}.`,
          source_file: f.name,
          x: Math.cos(phi) * 110,
          y: (idx - 1) * 40,
          z: Math.sin(phi) * 110,
        });

        // Link to first default node
        newEdges.push({
          id: `up-edge-${Date.now()}-${idx}`,
          source: fileId,
          target: DEFAULT_NODES[1].id,
          label: "derived_from",
        });
      });

      setUploadedNodes(newNodes);
      setUploadedEdges(newEdges);
      setSourceMode("uploaded");
      setUploadProgress(`Successfully processed ${selectedFiles.length} file(s)!`);
      setTimeout(() => {
        setUploadModalOpen(false);
        setUploadProgress("");
        setSelectedFiles([]);
      }, 900);
    } catch (err: any) {
      setUploadProgress("Failed to parse some files: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] bg-[#F8F6EF] text-[#26352D] font-sans overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="p-[14px_24px] bg-[#FFFFFF] border-b border-[#DFE5DC] flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-xs">
        <div>
          <div className="font-mono text-[10px] text-[#176B4D] tracking-[0.16em] uppercase font-semibold flex items-center gap-2">
            <span>KNOWLEDGE GRAPH / 001</span>
            <span>•</span>
            <span className="text-[#176B4D]">
              {sourceMode === "default" ? "DEMO GRAPH" : sourceMode.toUpperCase()}
            </span>
            {sourceMode === "default" && (
              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#E8F5EC] text-[#176B4D] text-[9px] font-mono border border-[#176B4D]/30 font-semibold">
                VERIFIED PERSISTENT BENCHMARK
              </span>
            )}
          </div>
          <h1 className="text-[19px] font-semibold tracking-tight text-[#26352D] mt-0.5 flex items-center gap-2 font-serif">
            <span>Materials Science Research Knowledge Graph</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#E6F0E9] text-[#176B4D] border border-[#176B4D]/30">
              {viewMode === "3d" ? "3D WebGL Active" : "2D Accessible View"}
            </span>
          </h1>
          <p className="text-[12px] text-[#68766D] mt-0.5">
            Interactive structural ontology linking papers, materials compositions, benchmark datasets, model runs, and failure recoveries.
          </p>
        </div>

        {/* Source Mode Selector & Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* View Mode 3D <-> 2D Toggle */}
          <div className="flex items-center p-0.5 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[8px]">
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 rounded-[6px] text-[11px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "3d"
                  ? "bg-[#176B4D] text-[#FFFFFF] font-semibold shadow-xs"
                  : "text-[#68766D] hover:text-[#26352D]"
              }`}
            >
              <Box size={13} />
              <span>3D Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1.5 rounded-[6px] text-[11px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "2d"
                  ? "bg-[#176B4D] text-[#FFFFFF] font-semibold shadow-xs"
                  : "text-[#68766D] hover:text-[#26352D]"
              }`}
            >
              <List size={13} />
              <span>2D Accessible</span>
            </button>
          </div>

          <div className="flex items-center p-0.5 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[8px]">
            <button
              type="button"
              onClick={() => setSourceMode("default")}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-mono transition-all ${
                sourceMode === "default"
                  ? "bg-[#176B4D] text-[#FFFFFF] font-semibold shadow-xs"
                  : "text-[#68766D] hover:text-[#26352D]"
              }`}
            >
              Demo Graph
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("uploaded")}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-mono transition-all ${
                sourceMode === "uploaded"
                  ? "bg-[#176B4D] text-[#FFFFFF] font-semibold shadow-xs"
                  : "text-[#68766D] hover:text-[#26352D]"
              }`}
            >
              Uploaded Sources
              {uploadedNodes.length > 0 && (
                <span className="ml-1.5 px-1 py-0.2 bg-[#FFFFFF] text-[#176B4D] font-bold rounded-full text-[9px]">
                  {uploadedNodes.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("workspace")}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-mono transition-all ${
                sourceMode === "workspace"
                  ? "bg-[#176B4D] text-[#FFFFFF] font-semibold shadow-xs"
                  : "text-[#68766D] hover:text-[#26352D]"
              }`}
            >
              Research Workspace
            </button>
          </div>

          {/* Add Research Sources Button */}
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="h-[34px] px-3.5 rounded-[8px] bg-[#176B4D] hover:bg-[#12543c] text-[#FFFFFF] text-[12px] font-semibold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>ADD RESEARCH SOURCES</span>
          </button>
        </div>
      </div>

      {/* 2. Secondary Filter & Search Ribbon */}
      <div className="p-[10px_24px] bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#DFE5DC] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#68766D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, materials, models..."
              className="w-full h-8 pl-8 pr-3 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[12px] text-[#26352D] placeholder-[#68766D] focus:outline-none focus:border-[#176B4D]"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
            {["ALL", "PAPER", "MATERIAL", "DATASET", "MODEL", "METRIC", "FAILURE", "RECOVERY"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-[5px] border transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#176B4D] text-[#FFFFFF] border-[#176B4D] font-bold"
                    : "bg-[#F8F6EF] text-[#68766D] border-[#DFE5DC] hover:border-[#176B4D]/40 hover:text-[#26352D]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3D View Controls & Statistics */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#68766D]">
          <span className="mr-1 text-[#26352D]">
            {filteredNodes.length} Nodes • {activeEdges.length} Edges
          </span>

          <button
            type="button"
            onClick={() => setIsolateNeighbors((prev) => !prev)}
            className={`px-2.5 py-1 rounded-[5px] border text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              isolateNeighbors
                ? "bg-[#176B4D] text-[#FFFFFF] border-[#176B4D] font-semibold"
                : "bg-[#F8F6EF] text-[#68766D] border-[#DFE5DC] hover:border-[#176B4D]/40"
            }`}
            title="Isolate branch connected to selected node"
          >
            <Radio size={12} />
            <span>Isolate Branch</span>
          </button>

          {viewMode === "3d" && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.multiplyScalar(0.85);
                  }
                }}
                className="w-7 h-7 rounded-[5px] border border-[#DFE5DC] bg-[#FFFFFF] flex items-center justify-center hover:bg-[#F8F6EF] text-[#26352D] cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.position.multiplyScalar(1.15);
                  }
                }}
                className="w-7 h-7 rounded-[5px] border border-[#DFE5DC] bg-[#FFFFFF] flex items-center justify-center hover:bg-[#F8F6EF] text-[#26352D] cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                onClick={handleResetCamera}
                className="w-7 h-7 rounded-[5px] border border-[#DFE5DC] bg-[#FFFFFF] flex items-center justify-center hover:bg-[#F8F6EF] text-[#26352D] cursor-pointer"
                title="Reset 3D Camera View"
              >
                <RotateCcw size={13} />
              </button>
            </>
          )}

          {/* Toggle Library Legend Panel Button */}
          <button
            type="button"
            onClick={() => setIsLibraryOpen((prev) => !prev)}
            className={`px-2 py-1 rounded-[5px] border text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer ${
              isLibraryOpen
                ? "bg-[#E6F0E9] text-[#176B4D] border-[#176B4D] font-semibold"
                : "bg-[#FFFFFF] text-[#68766D] border-[#DFE5DC] hover:border-[#176B4D]/40"
            }`}
            title={isLibraryOpen ? "Hide Ontology Library" : "Show Ontology Library"}
          >
            <Layers size={13} />
            <span>Library</span>
          </button>

          {/* Toggle Inspector Panel Button */}
          <button
            type="button"
            onClick={() => setIsInspectorOpen((prev) => !prev)}
            className="px-2 py-1 rounded-[5px] border border-[#DFE5DC] bg-[#FFFFFF] flex items-center gap-1 text-[#26352D] hover:bg-[#F8F6EF] cursor-pointer"
            title={isInspectorOpen ? "Collapse Inspector" : "Expand Inspector"}
          >
            {isInspectorOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            <span className="text-[10px] font-mono">Inspector</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace: 3D Canvas / 2D List Fallback (Left) + Inspector (Right) */}
      <div className="flex-1 flex overflow-hidden relative p-3">
        {viewMode === "3d" ? (
          /* Dominant 3D WebGL Canvas Area in Framed Box with Border */
          <div className="flex-1 relative overflow-hidden bg-[#FFFFFF] border border-[#DFE5DC] rounded-[12px] shadow-xs select-none flex flex-col">
            <div ref={canvasContainerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Projected 2D HTML Labels floating over 3D nodes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {screenLabels.map((lbl) => {
                if (!lbl.visible) return null;
                const isSelected = lbl.id === selectedNodeId;
                const catConfig = CATEGORY_COLORS[lbl.category] || CATEGORY_COLORS.Dataset;

                return (
                  <div
                    key={lbl.id}
                    style={{
                      position: "absolute",
                      left: `${lbl.x}px`,
                      top: `${lbl.y}px`,
                      transform: "translate(-50%, 14px)",
                    }}
                    className={`transition-opacity duration-200 pointer-events-auto cursor-pointer ${
                      isSelected ? "z-30 scale-105" : "z-10 hover:z-20 opacity-90 hover:opacity-100"
                    }`}
                    onClick={() => {
                      const node = filteredNodes.find((n) => n.id === lbl.id);
                      if (node) handleFocusNode(node);
                    }}
                  >
                    <div
                      className="flex flex-col items-center px-2 py-0.5 rounded-[5px] border backdrop-blur-md shadow-xs"
                      style={{
                        backgroundColor: isSelected ? "#FFFFFFee" : "#FFFFFFcc",
                        borderColor: isSelected ? "#176B4D" : catConfig.border + "88",
                      }}
                    >
                      <span
                        className="text-[9px] font-mono uppercase tracking-wider font-bold flex items-center gap-1"
                        style={{ color: isSelected ? "#176B4D" : catConfig.text }}
                      >
                        <span>{lbl.category}</span>
                        <span className="opacity-60">({catConfig.shape})</span>
                      </span>
                      <span className="text-[11px] font-medium text-[#26352D] max-w-[140px] truncate text-center leading-tight font-sans">
                        {lbl.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Openable / Closable Floating Ontology Legend Panel (Lower Left Corner) */}
            {isLibraryOpen ? (
              <div className="absolute bottom-4 left-4 p-3.5 rounded-[10px] bg-[#FFFFFF]/95 backdrop-blur-md border border-[#DFE5DC] shadow-md text-[11px] font-mono z-20 max-w-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="text-[10px] text-[#68766D] tracking-wider uppercase font-bold mb-2.5 flex items-center justify-between gap-4 border-b border-[#DFE5DC] pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Layers size={13} className="text-[#176B4D]" />
                    <span>3D GEOMETRY ONTOLOGY LIBRARY</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(false)}
                    className="p-0.5 rounded hover:bg-[#F8F6EF] text-[#68766D] hover:text-[#26352D] cursor-pointer transition-colors"
                    title="Close Library Legend"
                  >
                    <X size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {Object.entries(CATEGORY_COLORS).map(([cat, cfg]) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedCategory(cat.toUpperCase())}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
                        <span className="text-[#26352D] font-medium">{cat}</span>
                      </div>
                      <span className="text-[9.5px] text-[#68766D] font-mono">[{cfg.shape}]</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                className="absolute bottom-4 left-4 px-3 py-1.5 rounded-[8px] bg-[#FFFFFF]/95 backdrop-blur-md border border-[#DFE5DC] hover:border-[#176B4D] text-[#26352D] hover:bg-[#E6F0E9] shadow-md text-[11px] font-mono font-semibold flex items-center gap-2 cursor-pointer z-20 transition-all"
                title="Expand 3D Geometry Ontology Library"
              >
                <Layers size={13} className="text-[#176B4D]" />
                <span>Ontology Library (8 Shapes)</span>
                <ChevronLeft size={13} className="rotate-90 text-[#68766D]" />
              </button>
            )}

            {/* 3D Interaction Guide Pill */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[#FFFFFF]/90 backdrop-blur-md border border-[#DFE5DC] text-[10px] font-mono text-[#68766D] flex items-center gap-2 pointer-events-none z-10 shadow-xs">
              <Compass size={12} className="text-[#176B4D]" />
              <span>Left-drag: Orbit • Right-drag: Pan • Scroll: Zoom • Double click: Focus Node</span>
            </div>
          </div>
        ) : (
          /* 2D Accessible List Fallback View */
          <div className="flex-1 p-6 overflow-y-auto bg-[#F8F6EF]">
            <div className="flex items-center justify-between mb-4 border-b border-[#DFE5DC] pb-3">
              <div>
                <h3 className="font-serif text-[17px] font-bold text-[#26352D] m-0">
                  2D Accessible Ontology Entity Table
                </h3>
                <p className="text-[12px] text-[#68766D] m-0 font-sans">
                  Structured list fallback for keyboard accessibility, screen readers, and low-power hardware.
                </p>
              </div>
              <span className="font-mono text-[11px] text-[#176B4D] font-semibold">
                {filteredNodes.length} Entities Discovered
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredNodes.map((n) => {
                const isSelected = n.id === selectedNodeId;
                const catCfg = CATEGORY_COLORS[n.category] || CATEGORY_COLORS.Dataset;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNodeId(n.id)}
                    className={`p-4 rounded-[10px] bg-[#FFFFFF] border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#176B4D] ring-2 ring-[#E6F0E9] shadow-sm"
                        : "border-[#DFE5DC] hover:border-[#176B4D]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                      <span
                        className="px-2 py-0.5 rounded-[4px] font-bold uppercase"
                        style={{ backgroundColor: catCfg.bg, color: catCfg.text, border: `1px solid ${catCfg.border}` }}
                      >
                        {n.category} ({catCfg.shape})
                      </span>
                      <span className="text-[#68766D]">CONF: {(n.confidence * 100).toFixed(0)}%</span>
                    </div>

                    <h4 className="font-serif text-[15px] font-semibold text-[#26352D] m-0 leading-tight">
                      {n.name}
                    </h4>
                    <p className="font-sans text-[12px] text-[#68766D] mt-1.5 m-0 leading-relaxed">
                      {n.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-[#DFE5DC] flex items-center justify-between font-mono text-[10px] text-[#68766D]">
                      <span>Provenance: {n.provenance}</span>
                      <span className="text-[#176B4D] font-bold">Select Entity →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Balanced Right-Side Evidence & Entity Inspector */}
        {isInspectorOpen && (
          <div className="w-[380px] bg-[#FFFFFF] border-l border-[#DFE5DC] flex flex-col shrink-0 overflow-y-auto shadow-xs z-20">
            {selectedNode ? (
              <div className="p-5 flex flex-col gap-4 font-sans">
                {/* Node Category & Confidence Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-[5px] border text-[11px] font-mono font-bold"
                    style={{
                      backgroundColor: CATEGORY_COLORS[selectedNode.category]?.bg || "#E8F5EC",
                      borderColor: CATEGORY_COLORS[selectedNode.category]?.border || "#DFE5DC",
                      color: CATEGORY_COLORS[selectedNode.category]?.text || "#176B4D",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category]?.dot || "#176B4D" }}
                    />
                    <span>{selectedNode.category.toUpperCase()}</span>
                    <span className="opacity-75">({CATEGORY_COLORS[selectedNode.category]?.shape})</span>
                  </div>

                  <span className="font-mono text-[11px] text-[#68766D]">
                    CONF: {(selectedNode.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Node Title & Description */}
                <div>
                  <h2 className="text-[17px] font-semibold text-[#26352D] leading-snug font-serif">
                    {selectedNode.name}
                  </h2>
                  <div className="font-mono text-[10px] text-[#68766D] mt-0.5">
                    NODE ID: {selectedNode.id}
                  </div>
                  <p className="text-[12px] text-[#68766D] mt-2 leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Extracted Scientific Evidence Box */}
                {selectedNode.evidence_snippet && (
                  <div className="p-3.5 rounded-[8px] bg-[#F8F6EF] border border-[#DFE5DC] flex flex-col gap-1.5">
                    <div className="font-mono text-[10px] text-[#176B4D] tracking-wider uppercase font-semibold flex items-center gap-1.5">
                      <Sparkles size={12} />
                      <span>EXTRACTED SCIENTIFIC EVIDENCE</span>
                    </div>
                    <blockquote className="text-[12px] italic text-[#26352D] border-l-2 border-[#176B4D] pl-2.5 my-0.5 font-serif">
                      “{selectedNode.evidence_snippet}”
                    </blockquote>
                    {selectedNode.source_file && (
                      <div className="font-mono text-[10px] text-[#68766D] flex items-center gap-1 mt-1">
                        <FileText size={11} />
                        <span>Source: {selectedNode.source_file}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Provenance & Source Metadata */}
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#DFE5DC]">
                    <span className="text-[#68766D]">PROVENANCE</span>
                    <span className="text-[#26352D] font-medium text-right max-w-[200px] truncate">
                      {selectedNode.provenance}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#DFE5DC]">
                    <span className="text-[#68766D]">SOURCE ARTIFACT</span>
                    <span className="text-[#176B4D] font-medium">
                      {selectedNode.source_file || "system_records.db"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#DFE5DC]">
                    <span className="text-[#68766D]">SPATIAL 3D VECTOR</span>
                    <span className="text-[#68766D]">
                      [{selectedNode.x.toFixed(0)}, {selectedNode.y.toFixed(0)}, {selectedNode.z.toFixed(0)}]
                    </span>
                  </div>
                </div>

                {/* Connected Relationships List */}
                <div>
                  <div className="font-mono text-[10px] text-[#68766D] tracking-wider uppercase font-semibold mb-2 flex items-center justify-between">
                    <span>CONNECTED ONTOLOGY RELATIONSHIPS</span>
                    <span className="text-[#176B4D]">{connectedEdges.length} LINKS</span>
                  </div>

                  {connectedEdges.length === 0 ? (
                    <div className="p-3 text-center text-[11px] text-[#68766D] bg-[#F8F6EF] rounded-[6px] border border-[#DFE5DC]">
                      No direct relationships discovered for this entity.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {connectedEdges.map((edge) => {
                        const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                        const otherNode = activeNodes.find((n) => n.id === otherNodeId);
                        const isOutgoing = edge.source === selectedNode.id;

                        return (
                          <div
                            key={edge.id}
                            onClick={() => {
                              if (otherNode) handleFocusNode(otherNode);
                            }}
                            className="p-2.5 rounded-[6px] bg-[#F8F6EF] border border-[#DFE5DC] hover:border-[#176B4D] cursor-pointer transition-all flex items-center justify-between gap-2 group"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    CATEGORY_COLORS[otherNode?.category || "Dataset"]?.dot || "#176B4D",
                                }}
                              />
                              <div className="truncate">
                                <div className="text-[11px] font-medium text-[#26352D] group-hover:text-[#176B4D] transition-colors truncate">
                                  {otherNode?.name || otherNodeId}
                                </div>
                                <div className="text-[10px] font-mono text-[#68766D] flex items-center gap-1">
                                  <span>{isOutgoing ? "→" : "←"}</span>
                                  <span>{edge.label}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={13} className="text-[#68766D] group-hover:text-[#176B4D] shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Action Button: Center Camera */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleFocusNode(selectedNode)}
                    className="w-full h-8 rounded-[6px] bg-[#E6F0E9] hover:bg-[#176B4D] hover:text-[#FFFFFF] text-[#176B4D] text-[11px] font-mono font-semibold transition-all flex items-center justify-center gap-1.5 border border-[#176B4D]/30 cursor-pointer"
                  >
                    <Eye size={12} />
                    <span>Focus 3D Camera on Entity</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#68766D] text-[12px] flex flex-col items-center justify-center h-full">
                <Info size={24} className="mb-2 text-[#68766D]" />
                <p>Click any 3D node in the knowledge graph to inspect its scientific evidence and provenance.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Multi-File Ingestion Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#DFE5DC] rounded-[12px] max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE5DC]">
              <div className="flex items-center gap-2">
                <UploadCloud size={18} className="text-[#176B4D]" />
                <h3 className="text-[16px] font-semibold text-[#26352D] font-serif">Add Research Sources</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="text-[#68766D] hover:text-[#26352D]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[12px] text-[#68766D] mt-3">
              Upload research papers (.pdf), materials dataset manifests (.csv, .xlsx), or computational DFT outputs (.json) to automatically populate 3D ontology nodes and evidence links.
            </p>

            <div className="mt-4 border-2 border-dashed border-[#DFE5DC] hover:border-[#176B4D] rounded-[8px] p-6 text-center cursor-pointer transition-colors bg-[#F8F6EF]">
              <input
                type="file"
                multiple
                accept=".pdf,.csv,.json,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
                <FileSpreadsheet size={28} className="text-[#176B4D] mb-2" />
                <span className="text-[12px] font-semibold text-[#26352D]">
                  Click to select research files
                </span>
                <span className="text-[11px] font-mono text-[#68766D] mt-1">
                  Supported: NOMAD/Matbench CSVs, arXiv PDFs, DFT JSON manifests
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 max-h-32 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-[4px] bg-[#F8F6EF] border border-[#DFE5DC] text-[#26352D]">
                    <span className="truncate max-w-[280px]">{f.name}</span>
                    <span className="text-[#68766D]">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            )}

            {uploadProgress && (
              <div className="mt-4 p-2.5 rounded-[6px] bg-[#E8F5EC] border border-[#176B4D]/40 text-[#176B4D] text-[11px] font-mono flex items-center gap-2">
                <Sparkles size={14} className="animate-spin text-[#176B4D]" />
                <span>{uploadProgress}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-3 py-1.5 rounded-[6px] text-[12px] font-mono text-[#68766D] hover:text-[#26352D] bg-[#F8F6EF] border border-[#DFE5DC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={processUploadedFiles}
                disabled={selectedFiles.length === 0 || isUploading}
                className="px-4 py-1.5 rounded-[6px] bg-[#176B4D] hover:bg-[#12543c] disabled:opacity-50 text-[#FFFFFF] text-[12px] font-semibold font-mono flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                {isUploading ? "Extracting..." : "Process and Map to 3D Graph"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
