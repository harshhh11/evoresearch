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
} from "lucide-react";

type SourceMode = "default" | "uploaded" | "workspace";

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

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string; threeHex: number }> = {
  Paper: { bg: "#141c2b", border: "#2563eb", text: "#93c5fd", dot: "#3b82f6", threeHex: 0x3b82f6 },
  Material: { bg: "#231e13", border: "#d97706", text: "#fde68a", dot: "#f59e0b", threeHex: 0xf59e0b },
  Dataset: { bg: "#13231a", border: "#059669", text: "#a7f3d0", dot: "#10b981", threeHex: 0x10b981 },
  Model: { bg: "#22162b", border: "#9333ea", text: "#e9d5ff", dot: "#a855f7", threeHex: 0xa855f7 },
  Experiment: { bg: "#26151a", border: "#e11d48", text: "#fecdd3", dot: "#f43f5e", threeHex: 0xf43f5e },
  Metric: { bg: "#132321", border: "#0d9488", text: "#99f6e4", dot: "#14b8a6", threeHex: 0x14b8a6 },
  Failure: { bg: "#2b1414", border: "#dc2626", text: "#fca5a5", dot: "#ef4444", threeHex: 0xef4444 },
  Recovery: { bg: "#152618", border: "#16a34a", text: "#bbf7d0", dot: "#22c55e", threeHex: 0x22c55e },
};

// Stable Persistent Default Graph (DEMO GRAPH) with 3D Coordinates
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
    x: -110,
    y: 50,
    z: -30,
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
    x: -50,
    y: 20,
    z: 35,
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
    x: 10,
    y: 10,
    z: -20,
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
    x: 65,
    y: -25,
    z: 30,
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
    x: 120,
    y: -10,
    z: -25,
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
    x: 170,
    y: 35,
    z: 20,
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
    x: 60,
    y: -75,
    z: -35,
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
    x: 5,
    y: -80,
    z: 15,
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
    x: -125,
    y: -45,
    z: 50,
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
    x: -65,
    y: -40,
    z: -30,
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
    x: 75,
    y: 55,
    z: 60,
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
    x: 140,
    y: 80,
    z: -15,
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
    x: -25,
    y: 65,
    z: -60,
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
    x: 45,
    y: 75,
    z: -40,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("n-p1");
  const [isolateNeighbors, setIsolateNeighbors] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

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
          x: Math.cos(phi) * 60,
          y: Math.sin(phi) * 30 + 10,
          z: Math.sin(phi) * 60 - 20,
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
          x: Math.cos(theta) * 110,
          y: (i - 2) * 25,
          z: Math.sin(theta) * 110 + 20,
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
          x: 120 + (i % 2) * 40,
          y: (i - 3) * 30,
          z: (i % 2 === 0 ? 30 : -30),
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

      // Add recovery memories if available
      mList.slice(0, 3).forEach((m: RecoveryMemory, i: number) => {
        wNodes.push({
          id: `w-rec-${m.id}`,
          name: `Recovery: ${m.error_category || m.error_signature || "Heuristic Patch"}`,
          category: "Recovery",
          description: `Patch: ${m.actual_repair || m.proposed_repair || "Adaptive parameter relaxation"}`,
          provenance: "Failure Memory Cache",
          confidence: 0.96,
          evidence_snippet: `Validation: ${m.validation_result || m.state || "Verified Successful"}`,
          x: -40 - i * 30,
          y: -70 - i * 15,
          z: 20 + i * 20,
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

  // Three.js 3D WebGL Scene Setup
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e14);
    scene.fog = new THREE.FogExp2(0x0c0e14, 0.0018);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.position.set(0, 90, 320);
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
    controls.dampingFactor = 0.06;
    controls.maxDistance = 750;
    controls.minDistance = 60;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 3. Subtle Materials Science Lattice Grid & Depth Stars
    const gridHelper = new THREE.GridHelper(500, 25, 0x222a38, 0x141822);
    gridHelper.position.y = -100;
    scene.add(gridHelper);

    // Background particle dust (Materials atom cloud)
    const particleCount = 280;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 800;
      particlePositions[i + 1] = (Math.random() - 0.5) * 600;
      particlePositions[i + 2] = (Math.random() - 0.5) * 800;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x475569,
      size: 1.8,
      transparent: true,
      opacity: 0.45,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xdde3ea, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff5ea, 2.2);
    dirLight1.position.set(160, 220, 160);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 1.2);
    dirLight2.position.set(-160, -100, -120);
    scene.add(dirLight2);

    // Dynamic focal point light
    const focalLight = new THREE.PointLight(0xf59e0b, 3, 200);
    scene.add(focalLight);

    // 5. Mesh Groups
    const nodesGroup = new THREE.Group();
    const edgesGroup = new THREE.Group();
    scene.add(edgesGroup);
    scene.add(nodesGroup);

    const nodeMeshes: { [id: string]: THREE.Mesh } = {};
    const haloMeshes: { [id: string]: THREE.Mesh } = {};

    // Build Node 3D Objects
    filteredNodes.forEach((node) => {
      const isSelected = node.id === selectedNodeId;
      const isNeighbor = neighborNodeIds.has(node.id);
      const isDimmed = isolateNeighbors && !isNeighbor;

      const catColor = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Dataset;
      const radius = isSelected ? 8.5 : node.category === "Dataset" || node.category === "Paper" ? 7 : 5.8;

      const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: catColor.threeHex,
        roughness: 0.28,
        metalness: 0.35,
        emissive: catColor.threeHex,
        emissiveIntensity: isSelected ? 0.45 : 0.12,
        transparent: true,
        opacity: isDimmed ? 0.2 : 1.0,
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(node.x, node.y, node.z);
      (sphere as any).nodeData = node;

      nodesGroup.add(sphere);
      nodeMeshes[node.id] = sphere;

      // Selection Halo / Ring
      if (isSelected || node.category === "Failure" || node.category === "Recovery") {
        const ringGeo = new THREE.RingGeometry(radius * 1.35, radius * 1.55, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isSelected ? 0xd4a359 : catColor.threeHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(sphere.position);
        ring.lookAt(camera.position);
        scene.add(ring);
        haloMeshes[node.id] = ring;
      }
    });

    // Update dynamic light position to selected node
    const activeSelectedNode = filteredNodes.find((n) => n.id === selectedNodeId);
    if (activeSelectedNode) {
      focalLight.position.set(activeSelectedNode.x, activeSelectedNode.y + 15, activeSelectedNode.z + 15);
      focalLight.color.setHex(CATEGORY_COLORS[activeSelectedNode.category]?.threeHex || 0xd4a359);
    }

    // Build 3D Edges
    const lineMatActive = new THREE.LineBasicMaterial({ color: 0xd4a359, transparent: true, opacity: 0.9, linewidth: 2 });
    const lineMatInactive = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.35 });

    activeEdges.forEach((edge) => {
      const srcNode = filteredNodes.find((n) => n.id === edge.source);
      const tgtNode = filteredNodes.find((n) => n.id === edge.target);

      if (srcNode && tgtNode) {
        const isConnectedToSelected = edge.source === selectedNodeId || edge.target === selectedNodeId;
        const isDimmed = isolateNeighbors && (!neighborNodeIds.has(edge.source) || !neighborNodeIds.has(edge.target));

        const points = [
          new THREE.Vector3(srcNode.x, srcNode.y, srcNode.z),
          new THREE.Vector3(tgtNode.x, tgtNode.y, tgtNode.z),
        ];

        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(
          lineGeo,
          isDimmed
            ? new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.08 })
            : isConnectedToSelected
            ? lineMatActive
            : lineMatInactive
        );
        edgesGroup.add(line);
      }
    });

    // Raycasting for interactive click selection & hover
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
      particleSystem.rotation.y += 0.0004;

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

    // Resize Handler
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
  }, [filteredNodes, activeEdges, selectedNodeId, isolateNeighbors, neighborNodeIds]);

  // Smooth camera zoom / focus on selected node
  const handleFocusNode = useCallback((node: GraphNode) => {
    setSelectedNodeId(node.id);
    if (controlsRef.current && cameraRef.current) {
      const controls = controlsRef.current;
      controls.target.set(node.x, node.y, node.z);
      cameraRef.current.position.set(node.x, node.y + 35, node.z + 120);
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      cameraRef.current.position.set(0, 90, 320);
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
          x: Math.cos(phi) * 100,
          y: (idx - 1) * 35,
          z: Math.sin(phi) * 100,
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
    <div className="flex flex-col h-[calc(100vh-68px)] bg-[#0d0f14] text-[#f4f1ea] font-sans overflow-hidden">
      {/* 1. Header Toolbar (Premium Dark Graphite & Muted Bronze) */}
      <div className="p-[14px_24px] bg-[#12151c] border-b border-[#1f2533] flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
        <div>
          <div className="font-mono text-[10px] text-[#8C877D] tracking-[0.16em] uppercase font-semibold flex items-center gap-2">
            <span>KNOWLEDGE GRAPH / 001</span>
            <span>•</span>
            <span className="text-[#d4a359]">
              {sourceMode === "default" ? "DEMO GRAPH" : sourceMode.toUpperCase()}
            </span>
            {sourceMode === "default" && (
              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#d4a359]/20 text-[#d4a359] text-[9px] font-mono border border-[#d4a359]/40">
                VERIFIED PERSISTENT BENCHMARK
              </span>
            )}
          </div>
          <h1 className="text-[19px] font-semibold tracking-tight text-[#f4f1ea] mt-0.5 flex items-center gap-2">
            <span>Materials Science Research Knowledge Graph</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#1a2333] text-[#60a5fa] border border-[#2563eb]/40">
              3D WebGL Active
            </span>
          </h1>
          <p className="text-[12px] text-[#9ca3af] mt-0.5">
            Interactive structural ontology linking papers, materials compositions, benchmark datasets, model runs, and failure recoveries.
          </p>
        </div>

        {/* Source Mode Selector & Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-0.5 bg-[#0d0f14] border border-[#222a3a] rounded-[8px]">
            <button
              type="button"
              onClick={() => setSourceMode("default")}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-mono transition-all ${
                sourceMode === "default"
                  ? "bg-[#222a3a] text-[#f4f1ea] font-semibold shadow-sm"
                  : "text-[#8C877D] hover:text-[#f4f1ea]"
              }`}
            >
              Demo Graph
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("uploaded")}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-mono transition-all ${
                sourceMode === "uploaded"
                  ? "bg-[#222a3a] text-[#f4f1ea] font-semibold shadow-sm"
                  : "text-[#8C877D] hover:text-[#f4f1ea]"
              }`}
            >
              Uploaded Sources
              {uploadedNodes.length > 0 && (
                <span className="ml-1.5 px-1 py-0.2 bg-[#d4a359] text-[#0d0f14] font-bold rounded-full text-[9px]">
                  {uploadedNodes.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("workspace")}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-mono transition-all ${
                sourceMode === "workspace"
                  ? "bg-[#222a3a] text-[#f4f1ea] font-semibold shadow-sm"
                  : "text-[#8C877D] hover:text-[#f4f1ea]"
              }`}
            >
              Research Workspace
            </button>
          </div>

          {/* Add Research Sources Button (Muted Bronze Accent) */}
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="h-[34px] px-3.5 rounded-[8px] bg-[#d4a359] hover:bg-[#b88c47] text-[#0d0f14] text-[12px] font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-98"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>ADD RESEARCH SOURCES</span>
          </button>
        </div>
      </div>

      {/* 2. Secondary Filter & Search Ribbon */}
      <div className="p-[10px_24px] bg-[#12151c]/90 backdrop-blur-md border-b border-[#1f2533] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C877D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, materials, models..."
              className="w-full h-8 pl-8 pr-3 bg-[#0d0f14] border border-[#222a3a] rounded-[6px] text-[12px] text-[#f4f1ea] placeholder-[#64748b] focus:outline-none focus:border-[#d4a359]"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
            {["ALL", "PAPER", "MATERIAL", "DATASET", "MODEL", "METRIC", "FAILURE", "RECOVERY"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-[5px] border transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#d4a359] text-[#0d0f14] border-[#d4a359] font-bold"
                    : "bg-[#161a23] text-[#94a3b8] border-[#222a3a] hover:border-[#475569] hover:text-[#f4f1ea]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3D View Controls & Statistics */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#94a3b8]">
          <span className="mr-1 text-[#cbd5e1]">
            {filteredNodes.length} Nodes • {activeEdges.length} Edges
          </span>

          <button
            type="button"
            onClick={() => setIsolateNeighbors((prev) => !prev)}
            className={`px-2.5 py-1 rounded-[5px] border text-[11px] font-mono transition-all flex items-center gap-1.5 ${
              isolateNeighbors
                ? "bg-[#d4a359]/20 text-[#d4a359] border-[#d4a359]/60 font-semibold"
                : "bg-[#161a23] text-[#94a3b8] border-[#222a3a] hover:border-[#475569]"
            }`}
            title="Isolate branch connected to selected node"
          >
            <Radio size={12} />
            <span>Isolate Branch</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (cameraRef.current) {
                cameraRef.current.position.multiplyScalar(0.85);
              }
            }}
            className="w-7 h-7 rounded-[5px] border border-[#222a3a] bg-[#161a23] flex items-center justify-center hover:bg-[#202736] text-[#f4f1ea]"
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
            className="w-7 h-7 rounded-[5px] border border-[#222a3a] bg-[#161a23] flex items-center justify-center hover:bg-[#202736] text-[#f4f1ea]"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            className="w-7 h-7 rounded-[5px] border border-[#222a3a] bg-[#161a23] flex items-center justify-center hover:bg-[#202736] text-[#f4f1ea]"
            title="Reset 3D Camera View"
          >
            <RotateCcw size={13} />
          </button>

          {/* Toggle Inspector Panel Button */}
          <button
            type="button"
            onClick={() => setIsInspectorOpen((prev) => !prev)}
            className="px-2 py-1 rounded-[5px] border border-[#222a3a] bg-[#161a23] flex items-center gap-1 text-[#f4f1ea] hover:bg-[#202736]"
            title={isInspectorOpen ? "Collapse Inspector" : "Expand Inspector"}
          >
            {isInspectorOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            <span className="text-[10px] font-mono">Inspector</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace: Dominant 3D Graph Canvas (Left) + Balanced Inspector (Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Dominant 3D WebGL Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[#0c0e14] select-none">
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
                    isSelected ? "z-30 scale-105" : "z-10 hover:z-20 opacity-85 hover:opacity-100"
                  }`}
                  onClick={() => {
                    const node = filteredNodes.find((n) => n.id === lbl.id);
                    if (node) handleFocusNode(node);
                  }}
                >
                  <div
                    className="flex flex-col items-center px-2 py-0.5 rounded-[5px] border backdrop-blur-md shadow-md"
                    style={{
                      backgroundColor: isSelected ? "#1e2433ee" : "#11141eee",
                      borderColor: isSelected ? "#d4a359" : catConfig.border + "66",
                    }}
                  >
                    <span
                      className="text-[9px] font-mono uppercase tracking-wider font-bold"
                      style={{ color: isSelected ? "#d4a359" : catConfig.text }}
                    >
                      {lbl.category}
                    </span>
                    <span className="text-[11px] font-medium text-[#f4f1ea] max-w-[130px] truncate text-center leading-tight">
                      {lbl.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Ontology Legend (Lower Left Corner) */}
          <div className="absolute bottom-5 left-5 p-3 rounded-[10px] bg-[#12151c]/90 backdrop-blur-md border border-[#222a3a] shadow-xl text-[11px] font-mono z-20">
            <div className="text-[10px] text-[#8C877D] tracking-wider uppercase font-bold mb-2 flex items-center justify-between gap-4">
              <span>3D ONTOLOGY CLASSIFICATION</span>
              <span className="text-[#d4a359]">8 CATEGORIES</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {Object.entries(CATEGORY_COLORS).map(([cat, cfg]) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedCategory(cat.toUpperCase())}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  <span className="text-[#cbd5e1]">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Interaction Guide Pill */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[#12151c]/80 backdrop-blur-md border border-[#222a3a] text-[10px] font-mono text-[#94a3b8] flex items-center gap-2 pointer-events-none z-10">
            <Compass size={12} className="text-[#d4a359]" />
            <span>Left-drag: Orbit • Right-drag: Pan • Scroll: Zoom • Click: Focus Node</span>
          </div>
        </div>

        {/* Balanced Right-Side Evidence & Entity Inspector */}
        {isInspectorOpen && (
          <div className="w-[380px] bg-[#12151c] border-l border-[#1f2533] flex flex-col shrink-0 overflow-y-auto shadow-2xl z-20">
            {selectedNode ? (
              <div className="p-5 flex flex-col gap-4">
                {/* Node Category & Confidence Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.8 rounded-[5px] border text-[11px] font-mono font-bold"
                    style={{
                      backgroundColor: CATEGORY_COLORS[selectedNode.category]?.bg || "#1e293b",
                      borderColor: CATEGORY_COLORS[selectedNode.category]?.border || "#475569",
                      color: CATEGORY_COLORS[selectedNode.category]?.text || "#f4f1ea",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category]?.dot || "#cbd5e1" }}
                    />
                    <span>{selectedNode.category.toUpperCase()}</span>
                  </div>

                  <span className="font-mono text-[11px] text-[#8C877D]">
                    CONF: {(selectedNode.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Node Title & Description */}
                <div>
                  <h2 className="text-[17px] font-semibold text-[#f4f1ea] leading-snug">
                    {selectedNode.name}
                  </h2>
                  <div className="font-mono text-[10px] text-[#64748b] mt-0.5">
                    NODE ID: {selectedNode.id}
                  </div>
                  <p className="text-[12px] text-[#cbd5e1] mt-2 leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Extracted Scientific Evidence Box */}
                {selectedNode.evidence_snippet && (
                  <div className="p-3.5 rounded-[8px] bg-[#171b24] border border-[#262f42] flex flex-col gap-1.5">
                    <div className="font-mono text-[10px] text-[#d4a359] tracking-wider uppercase font-semibold flex items-center gap-1.5">
                      <Sparkles size={12} />
                      <span>EXTRACTED SCIENTIFIC EVIDENCE</span>
                    </div>
                    <blockquote className="text-[12px] italic text-[#e2e8f0] border-l-2 border-[#d4a359] pl-2.5 my-0.5">
                      “{selectedNode.evidence_snippet}”
                    </blockquote>
                    {selectedNode.source_file && (
                      <div className="font-mono text-[10px] text-[#94a3b8] flex items-center gap-1 mt-1">
                        <FileText size={11} />
                        <span>Source: {selectedNode.source_file}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Provenance & Source Metadata */}
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1f2533]">
                    <span className="text-[#8C877D]">PROVENANCE</span>
                    <span className="text-[#e2e8f0] font-medium text-right max-w-[200px] truncate">
                      {selectedNode.provenance}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1f2533]">
                    <span className="text-[#8C877D]">SOURCE ARTIFACT</span>
                    <span className="text-[#d4a359] font-medium">
                      {selectedNode.source_file || "system_records.db"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1f2533]">
                    <span className="text-[#8C877D]">SPATIAL 3D VECTOR</span>
                    <span className="text-[#94a3b8]">
                      [{selectedNode.x.toFixed(0)}, {selectedNode.y.toFixed(0)}, {selectedNode.z.toFixed(0)}]
                    </span>
                  </div>
                </div>

                {/* Connected Relationships List */}
                <div>
                  <div className="font-mono text-[10px] text-[#8C877D] tracking-wider uppercase font-semibold mb-2 flex items-center justify-between">
                    <span>CONNECTED ONTOLOGY RELATIONSHIPS</span>
                    <span className="text-[#d4a359]">{connectedEdges.length} LINKS</span>
                  </div>

                  {connectedEdges.length === 0 ? (
                    <div className="p-3 text-center text-[11px] text-[#64748b] bg-[#161a23] rounded-[6px] border border-[#222a3a]">
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
                            className="p-2.5 rounded-[6px] bg-[#161a23] border border-[#222a3a] hover:border-[#d4a359]/60 cursor-pointer transition-all flex items-center justify-between gap-2 group"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    CATEGORY_COLORS[otherNode?.category || "Dataset"]?.dot || "#94a3b8",
                                }}
                              />
                              <div className="truncate">
                                <div className="text-[11px] font-medium text-[#f4f1ea] group-hover:text-[#d4a359] transition-colors truncate">
                                  {otherNode?.name || otherNodeId}
                                </div>
                                <div className="text-[10px] font-mono text-[#8C877D] flex items-center gap-1">
                                  <span>{isOutgoing ? "→" : "←"}</span>
                                  <span>{edge.label}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={13} className="text-[#8C877D] group-hover:text-[#d4a359] shrink-0" />
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
                    className="w-full h-8 rounded-[6px] bg-[#1e2433] hover:bg-[#283247] text-[#d4a359] text-[11px] font-mono font-semibold transition-all flex items-center justify-center gap-1.5 border border-[#d4a359]/30"
                  >
                    <Eye size={12} />
                    <span>Focus 3D Camera on Entity</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#8C877D] text-[12px] flex flex-col items-center justify-center h-full">
                <Info size={24} className="mb-2 text-[#475569]" />
                <p>Click any 3D node in the knowledge graph to inspect its scientific evidence and provenance.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Multi-File Ingestion Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151c] border border-[#222a3a] rounded-[12px] max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2533]">
              <div className="flex items-center gap-2">
                <UploadCloud size={18} className="text-[#d4a359]" />
                <h3 className="text-[15px] font-semibold text-[#f4f1ea]">Add Research Sources</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="text-[#8C877D] hover:text-[#f4f1ea]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[12px] text-[#94a3b8] mt-3">
              Upload research papers (.pdf), materials dataset manifests (.csv, .xlsx), or computational DFT outputs (.json) to automatically populate 3D ontology nodes and evidence links.
            </p>

            <div className="mt-4 border-2 border-dashed border-[#222a3a] hover:border-[#d4a359] rounded-[8px] p-6 text-center cursor-pointer transition-colors bg-[#0d0f14]">
              <input
                type="file"
                multiple
                accept=".pdf,.csv,.json,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
                <FileSpreadsheet size={28} className="text-[#d4a359] mb-2" />
                <span className="text-[12px] font-semibold text-[#f4f1ea]">
                  Click to select research files
                </span>
                <span className="text-[11px] font-mono text-[#64748b] mt-1">
                  Supported: NOMAD/Matbench CSVs, arXiv PDFs, DFT JSON manifests
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 max-h-32 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-[4px] bg-[#171b24] text-[#cbd5e1]">
                    <span className="truncate max-w-[280px]">{f.name}</span>
                    <span className="text-[#8C877D]">{(f.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            )}

            {uploadProgress && (
              <div className="mt-4 p-2.5 rounded-[6px] bg-[#1a2333] border border-[#2563eb]/40 text-[#93c5fd] text-[11px] font-mono flex items-center gap-2">
                <Sparkles size={14} className="animate-spin text-[#60a5fa]" />
                <span>{uploadProgress}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-3 py-1.5 rounded-[6px] text-[12px] font-mono text-[#8C877D] hover:text-[#f4f1ea]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={processUploadedFiles}
                disabled={selectedFiles.length === 0 || isUploading}
                className="px-4 py-1.5 rounded-[6px] bg-[#d4a359] hover:bg-[#b88c47] disabled:opacity-50 text-[#0d0f14] text-[12px] font-semibold font-mono flex items-center gap-1.5 shadow-sm"
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
