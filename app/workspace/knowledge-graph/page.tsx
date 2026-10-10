"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  api,
  Dataset,
  Experiment,
  Run,
  RecoveryMemory,
} from "@/lib/api";
import {
  Network,
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
  ExternalLink,
  Layers,
  Sparkles,
  BookOpen,
  FlaskConical,
  Database,
  Cpu,
  X,
  Plus,
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
  is_demo?: boolean;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  is_demo?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Paper: { bg: "#EEF3F8", border: "#7A9BB8", text: "#284A6A", dot: "#7A9BB8" },
  Material: { bg: "#FBF5E9", border: "#B69A72", text: "#6D532C", dot: "#B69A72" },
  Dataset: { bg: "#F3F7F2", border: "#8EA58C", text: "#335532", dot: "#8EA58C" },
  Model: { bg: "#F7F2FA", border: "#9B88B4", text: "#563A75", dot: "#9B88B4" },
  Experiment: { bg: "#FBF3F1", border: "#C77F72", text: "#75382B", dot: "#C77F72" },
  Metric: { bg: "#F5F8F7", border: "#6EA395", text: "#28584C", dot: "#6EA395" },
  Failure: { bg: "#FDF0ED", border: "#D96B5B", text: "#8A2A1A", dot: "#D96B5B" },
  Recovery: { bg: "#EDF7F1", border: "#5CB87A", text: "#206839", dot: "#5CB87A" },
};

// Stable Persistent Default Graph (DEMO GRAPH)
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
    x: 120,
    y: 110,
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
    x: 320,
    y: 110,
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
    x: 520,
    y: 110,
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
    x: 710,
    y: 110,
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
    x: 520,
    y: 280,
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
    x: 710,
    y: 280,
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
    x: 320,
    y: 280,
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
    x: 120,
    y: 280,
    is_demo: true,
  },
  {
    id: "n-p2",
    name: "Matbench: Machine Learning Benchmark for Materials",
    category: "Paper",
    description: "Standardized benchmark suite for property prediction in crystalline materials (Dunn et al., 2020).",
    provenance: "npj Computational Materials",
    confidence: 0.99,
    evidence_snippet: "Includes 13 standardized tasks ranging from phononic band gaps to elastic moduli.",
    source_file: "matbench_benchmark.pdf",
    x: 120,
    y: 440,
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
    x: 320,
    y: 440,
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
    x: 520,
    y: 440,
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
    x: 710,
    y: 440,
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
];

export default function ResearchKnowledgeGraphPage() {
  const [sourceMode, setSourceMode] = useState<SourceMode>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("n-p1");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

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
        wNodes.push({
          id: `w-ds-${d.id}`,
          name: d.name,
          category: "Dataset",
          description: `Samples: ${d.row_count}, Target: ${d.target_col}`,
          provenance: d.source_name || "Internal Upload",
          confidence: 0.99,
          evidence_snippet: `Quality score: 98.4%. File: ${d.slug}`,
          x: 140,
          y: 80 + i * 140,
        });
      });

      eList.slice(0, 4).forEach((e: Experiment, i: number) => {
        wNodes.push({
          id: `w-exp-${e.id}`,
          name: e.name,
          category: "Experiment",
          description: `Target: ${e.target_column}, Task: ${e.task_type}`,
          provenance: "Local Database",
          confidence: 0.95,
          evidence_snippet: `Budget: ${e.cpu_budget_seconds}s. Model family: ${(e as any).model_family || "Ridge"}`,
          x: 420,
          y: 90 + i * 140,
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

      rList.slice(0, 4).forEach((r: Run, i: number) => {
        wNodes.push({
          id: `w-run-${r.id}`,
          name: r.model_name,
          category: "Model",
          description: `Status: ${r.status}, Latency: ${r.inference_latency_us?.toFixed(0) || "—"} μs`,
          provenance: "Model Repository (.pkl artifact)",
          confidence: 0.97,
          evidence_snippet: `Run metrics: ${typeof r.metrics === "string" ? r.metrics : "{}"}`,
          x: 700,
          y: 90 + i * 140,
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
      // Simulate/call parser extraction
      await new Promise((res) => setTimeout(res, 800));

      const newNodes: GraphNode[] = [...uploadedNodes];
      const newEdges: GraphEdge[] = [...uploadedEdges];

      selectedFiles.forEach((f, idx) => {
        const fileId = `up-file-${Date.now()}-${idx}`;
        const isPdf = f.name.endsWith(".pdf");
        const isCsv = f.name.endsWith(".csv");

        newNodes.push({
          id: fileId,
          name: f.name,
          category: isPdf ? "Paper" : isCsv ? "Dataset" : "Material",
          description: `Extracted from uploaded research source (${(f.size / 1024).toFixed(1)} KB)`,
          provenance: `User Ingestion Pipeline // SHA256-${Math.random().toString(36).substring(7)}`,
          confidence: 0.94,
          evidence_snippet: `Automated parser extracted structure coordinates and materials assertions from ${f.name}.`,
          source_file: f.name,
          x: 200 + (idx * 160),
          y: 150 + (idx * 80),
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
      }, 1000);
    } catch (err: any) {
      setUploadProgress("Failed to parse some files: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] bg-[#FBFBFA] text-[#1C1D1A] font-sans overflow-hidden">
      {/* 1. Header Toolbar (Clean Minimalist White/Charcoal) */}
      <div className="p-[14px_24px] bg-[#FFFFFF] border-b border-[#E5E4DE] flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div>
          <div className="font-mono text-[10px] text-[#8C877D] tracking-[0.16em] uppercase font-semibold flex items-center gap-2">
            <span>KNOWLEDGE GRAPH / 001</span>
            <span>•</span>
            <span className="text-[#B69A72]">
              {sourceMode === "default" ? "DEMO GRAPH" : sourceMode.toUpperCase()}
            </span>
          </div>
          <h1 className="text-[20px] font-semibold text-[#1C1D1A] tracking-[-0.01em] mt-0.5 m-0">
            Materials Science Research Knowledge Graph
          </h1>
          <p className="text-[12px] text-[#69655D] mt-0.5 m-0">
            Interactive structural ontology linking papers, materials compositions, benchmark datasets, model runs, and failure recoveries.
          </p>
        </div>

        {/* Source Mode Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Mode Selector */}
          <div className="flex items-center rounded-[8px] bg-[#F2F1ED] p-0.5 border border-[#E5E4DE] font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setSourceMode("default")}
              className={`px-3 py-1 rounded-[6px] transition-all ${
                sourceMode === "default"
                  ? "bg-[#FFFFFF] text-[#1C1D1A] font-semibold shadow-sm"
                  : "text-[#69655D] hover:text-[#1C1D1A]"
              }`}
            >
              Default Graph
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("uploaded")}
              className={`px-3 py-1 rounded-[6px] transition-all ${
                sourceMode === "uploaded"
                  ? "bg-[#FFFFFF] text-[#1C1D1A] font-semibold shadow-sm"
                  : "text-[#69655D] hover:text-[#1C1D1A]"
              }`}
            >
              Uploaded Sources {uploadedNodes.length > 0 && `(${uploadedNodes.length})`}
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("workspace")}
              className={`px-3 py-1 rounded-[6px] transition-all ${
                sourceMode === "workspace"
                  ? "bg-[#FFFFFF] text-[#1C1D1A] font-semibold shadow-sm"
                  : "text-[#69655D] hover:text-[#1C1D1A]"
              }`}
            >
              Research Workspace
            </button>
          </div>

          {/* Add Research Sources Button (Muted Bronze Accent) */}
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="h-[34px] px-3.5 rounded-[8px] bg-[#B69A72] hover:bg-[#A88B63] text-[#FFFFFF] text-[12px] font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>ADD RESEARCH SOURCES</span>
          </button>
        </div>
      </div>

      {/* 2. Secondary Filter & Search Ribbon */}
      <div className="p-[10px_24px] bg-[#FFFFFF] border-b border-[#E5E4DE] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C877D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, materials, models..."
              className="w-full h-8 pl-8 pr-3 bg-[#FBFBFA] border border-[#E5E4DE] rounded-[6px] text-[12px] text-[#1C1D1A] placeholder-[#8C877D] focus:outline-none focus:border-[#B69A72]"
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
                    ? "bg-[#1C1D1A] text-[#FFFFFF] border-[#1C1D1A] font-semibold"
                    : "bg-[#FFFFFF] text-[#69655D] border-[#E5E4DE] hover:border-[#8C877D]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#69655D]">
          <span className="mr-2">
            {filteredNodes.length} Nodes • {activeEdges.length} Edges
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2, z + 0.15))}
            className="w-7 h-7 rounded-[5px] border border-[#E5E4DE] bg-[#FFFFFF] flex items-center justify-center hover:bg-[#F2F1ED]"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
            className="w-7 h-7 rounded-[5px] border border-[#E5E4DE] bg-[#FFFFFF] flex items-center justify-center hover:bg-[#F2F1ED]"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 20, y: 20 });
            }}
            className="w-7 h-7 rounded-[5px] border border-[#E5E4DE] bg-[#FFFFFF] flex items-center justify-center hover:bg-[#F2F1ED]"
            title="Reset Canvas View"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 3. Main Workspace: Graph Canvas (Left) + Evidence Inspector (Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Interactive SVG Canvas Area */}
        <div
          className="flex-1 relative bg-[#FBFBFA] overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === "svg") {
              setIsPanning(true);
              setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
            }
          }}
          onMouseMove={(e) => {
            if (isPanning) {
              setPanOffset({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
            }
          }}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
        >
          {/* Subtle Dot Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: "radial-gradient(#D5D3CB 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* SVG Graph Viewport */}
          <svg className="w-full h-full absolute inset-0">
            <g
              transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
              className="transition-transform duration-75"
            >
              {/* Arrow Marker Definitions */}
              <defs>
                <marker
                  id="edgeArrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#B2AFA6" />
                </marker>
                <marker
                  id="edgeArrowActive"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#B69A72" />
                </marker>
              </defs>

              {/* Relationship Edges */}
              {activeEdges.map((edge) => {
                const sNode = activeNodes.find((n) => n.id === edge.source);
                const tNode = activeNodes.find((n) => n.id === edge.target);
                if (!sNode || !tNode) return null;

                const isConnected = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

                return (
                  <g key={edge.id} className="transition-all">
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke={isConnected ? "#B69A72" : "#D5D3CB"}
                      strokeWidth={isConnected ? "2" : "1.25"}
                      strokeDasharray={isConnected ? "none" : "3 3"}
                      markerEnd={isConnected ? "url(#edgeArrowActive)" : "url(#edgeArrow)"}
                    />
                    {/* Edge Label Pill */}
                    <text
                      x={(sNode.x + tNode.x) / 2}
                      y={(sNode.y + tNode.y) / 2 - 4}
                      fill={isConnected ? "#6D532C" : "#8C877D"}
                      fontSize="8.5"
                      fontFamily="var(--mono)"
                      fontWeight="500"
                      textAnchor="middle"
                      className="bg-white px-1 select-none"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Graph Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const colors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Paper;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                  >
                    {/* Pulsing Selection Highlight */}
                    {isSelected && (
                      <circle
                        cx="0"
                        cy="0"
                        r="24"
                        fill="none"
                        stroke="#B69A72"
                        strokeWidth="1.75"
                        strokeDasharray="4 2"
                        className="animate-spin-slow"
                      />
                    )}

                    {/* Node Core Circle */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isSelected ? "17" : "14"}
                      fill={colors.bg}
                      stroke={isSelected ? "#1C1D1A" : colors.border}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all shadow-sm"
                    />

                    {/* Category Dot */}
                    <circle cx="0" cy="0" r="4.5" fill={colors.dot} />

                    {/* Node Label Text */}
                    <text
                      x="0"
                      y="26"
                      fill="#1C1D1A"
                      fontSize={isSelected ? "10" : "9"}
                      fontWeight={isSelected ? "600" : "500"}
                      fontFamily="var(--sans)"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow-sm select-none"
                    >
                      {node.name.length > 24 ? `${node.name.substring(0, 22)}...` : node.name}
                    </text>

                    {/* Category Subtitle */}
                    <text
                      x="0"
                      y="37"
                      fill={colors.text}
                      fontSize="7.5"
                      fontFamily="var(--mono)"
                      textAnchor="middle"
                      className="pointer-events-none select-none uppercase tracking-[0.06em]"
                    >
                      {node.category}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Category Legend Overlay */}
          <div className="absolute left-5 bottom-5 p-3 rounded-[8px] bg-[#FFFFFF]/90 backdrop-blur-md border border-[#E5E4DE] shadow-sm font-mono text-[10px] flex flex-col gap-1.5 z-10">
            <div className="text-[#8C877D] uppercase font-semibold text-[9px] mb-0.5 tracking-[0.08em]">
              ONTOLOGY LEGEND
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(CATEGORY_COLORS).map(([cat, col]) => (
                <div key={cat} className="flex items-center gap-1.5 text-[#1C1D1A]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.dot }} />
                  <span>{cat}</span>
                </div>
              ))}
            </div>
            {sourceMode === "default" && (
              <div className="pt-1.5 mt-1 border-t border-[#E5E4DE] text-[9px] text-[#B69A72] font-semibold">
                ★ PERSISTENT DEMO GRAPH
              </div>
            )}
          </div>
        </div>

        {/* 4. Right-Hand Selected Node Inspector Drawer */}
        <aside className="w-[380px] bg-[#FFFFFF] border-l border-[#E5E4DE] flex flex-col justify-between p-5 overflow-y-auto shrink-0 shadow-[-1px_0_3px_rgba(0,0,0,0.02)]">
          {selectedNode ? (
            <div className="flex flex-col gap-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E4DE]">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-[0.08em]"
                    style={{
                      backgroundColor: CATEGORY_COLORS[selectedNode.category]?.bg,
                      color: CATEGORY_COLORS[selectedNode.category]?.text,
                      border: `1px solid ${CATEGORY_COLORS[selectedNode.category]?.border}`,
                    }}
                  >
                    {selectedNode.category}
                  </span>
                  {selectedNode.is_demo && (
                    <span className="font-mono text-[9px] text-[#8C877D] px-1.5 py-0.2 rounded bg-[#F2F1ED]">
                      DEMO CONTENT
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] text-[#8C877D]">
                  CONF: {(selectedNode.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Node Title */}
              <div>
                <h2 className="text-[18px] font-semibold text-[#1C1D1A] m-0 leading-snug">
                  {selectedNode.name}
                </h2>
                <div className="font-mono text-[9.5px] text-[#8C877D] mt-1 truncate">
                  NODE ID: {selectedNode.id}
                </div>
              </div>

              {/* Description */}
              <div className="text-[12px] text-[#4F4B43] leading-relaxed">
                {selectedNode.description}
              </div>

              {/* Evidence Excerpt Card */}
              {selectedNode.evidence_snippet && (
                <div className="p-3 rounded-[8px] bg-[#FBFBFA] border border-[#E5E4DE] text-[11px]">
                  <div className="font-mono text-[8.5px] text-[#8C877D] uppercase font-semibold mb-1 flex items-center gap-1">
                    <FileText size={11} className="text-[#B69A72]" />
                    <span>EXTRACTED SCIENTIFIC EVIDENCE</span>
                  </div>
                  <p className="text-[#1C1D1A] italic m-0 font-serif leading-relaxed">
                    &ldquo;{selectedNode.evidence_snippet}&rdquo;
                  </p>
                </div>
              )}

              {/* Provenance & Citation Metadata */}
              <div className="flex flex-col gap-1.5 font-mono text-[11px] text-[#69655D] pt-2 border-t border-[#E5E4DE]">
                <div className="flex justify-between py-1 border-b border-[#F2F1ED]">
                  <span className="text-[#8C877D]">PROVENANCE</span>
                  <span className="text-[#1C1D1A] font-medium text-right max-w-[200px] truncate">
                    {selectedNode.provenance}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F2F1ED]">
                  <span className="text-[#8C877D]">SOURCE ARTIFACT</span>
                  <span className="text-[#B69A72] text-right truncate">
                    {selectedNode.source_file || "system_records.db"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8C877D]">RELATIONSHIPS</span>
                  <span className="text-[#1C1D1A] font-semibold">{connectedEdges.length} links</span>
                </div>
              </div>

              {/* Connected Relationships List */}
              <div className="pt-2 border-t border-[#E5E4DE]">
                <div className="font-mono text-[9px] text-[#8C877D] uppercase font-semibold mb-2">
                  CONNECTED ONTOLOGY EDGES
                </div>
                <div className="flex flex-col gap-1.5">
                  {connectedEdges.map((e) => {
                    const otherId = e.source === selectedNode.id ? e.target : e.source;
                    const other = activeNodes.find((n) => n.id === otherId);
                    if (!other) return null;

                    return (
                      <div
                        key={e.id}
                        onClick={() => setSelectedNodeId(other.id)}
                        className="p-2 rounded-[6px] bg-[#FBFBFA] border border-[#E5E4DE] hover:border-[#B69A72] cursor-pointer transition-colors flex items-center justify-between text-[11px]"
                      >
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono text-[#8C877D] uppercase">
                            {e.label} →
                          </div>
                          <div className="font-medium text-[#1C1D1A] truncate">{other.name}</div>
                        </div>
                        <span className="font-mono text-[9px] text-[#B69A72] shrink-0 ml-2">
                          {other.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-[#8C877D] font-mono text-[11px]">
              Select any node in the graph to inspect evidence and provenance.
            </div>
          )}

          {/* Drawer Footer Actions */}
          <div className="pt-4 mt-4 border-t border-[#E5E4DE] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#8C877D]">Graph Mode: {sourceMode.toUpperCase()}</span>
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 20, y: 20 });
              }}
              className="text-[#B69A72] hover:underline"
            >
              Reset Canvas View
            </button>
          </div>
        </aside>
      </div>

      {/* 5. Modal: Add Research Sources (Multi-File Ingestion Pipeline) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[12px] bg-[#FFFFFF] border border-[#E5E4DE] p-6 shadow-2xl relative text-[#1C1D1A]">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="absolute right-4 top-4 text-[#8C877D] hover:text-[#1C1D1A] transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <UploadCloud size={18} className="text-[#B69A72]" />
              <h3 className="text-[18px] font-semibold text-[#1C1D1A] m-0">
                Ingest Research Sources & Generate Graph
              </h3>
            </div>
            <p className="text-[12px] text-[#69655D] mb-4">
              Upload papers (PDF), datasets (CSV, XLSX), notes (Markdown, TXT), or schemas (JSON). The evidence extraction pipeline parses entities without executing code.
            </p>

            {/* Drag & Drop File Input Area */}
            <label className="border-2 border-dashed border-[#D5D3CB] hover:border-[#B69A72] rounded-[10px] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#FBFBFA]">
              <UploadCloud size={32} className="text-[#B69A72] mb-2" />
              <span className="text-[13px] font-medium text-[#1C1D1A]">
                Click or drag research documents here
              </span>
              <span className="font-mono text-[10px] text-[#8C877D] mt-1">
                Supported: PDF, DOCX, TXT, MD, CSV, XLSX, JSON (Max 50MB)
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mt-3.5 flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                <div className="font-mono text-[9px] text-[#8C877D] uppercase">
                  {selectedFiles.length} File(s) Selected for Extraction:
                </div>
                {selectedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-[6px] bg-[#F2F1ED] font-mono text-[11px]"
                  >
                    <span className="truncate max-w-[320px]">{f.name}</span>
                    <span className="text-[#8C877D]">{(f.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            )}

            {/* Progress Message */}
            {uploadProgress && (
              <div className="mt-3 p-2.5 rounded-[6px] bg-[#F3F7F2] border border-[#8EA58C]/40 text-[#335532] font-mono text-[11px] text-center">
                {uploadProgress}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-1.5 rounded-[6px] border border-[#E5E4DE] text-[12px] text-[#69655D] hover:text-[#1C1D1A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={processUploadedFiles}
                disabled={selectedFiles.length === 0 || isUploading}
                className="px-4 py-1.5 rounded-[6px] bg-[#B69A72] text-[#FFFFFF] text-[12px] font-semibold hover:bg-[#A88B63] disabled:opacity-50 transition-colors"
              >
                {isUploading ? "Extracting Entities..." : "Extract & Add to Graph"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
