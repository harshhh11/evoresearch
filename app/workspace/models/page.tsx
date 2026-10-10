"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Layers,
  Zap,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Gauge,
  Sliders,
  Sparkles,
} from "lucide-react";

interface ModelSpec {
  name: string;
  category: "Classification" | "Regression";
  family: string;
  latencyProfile: "Ultra-Fast (< 100 µs)" | "Fast (< 500 µs)" | "Moderate (< 5 ms)";
  memoryFootprint: "Minimal (< 20 KB)" | "Light (< 150 KB)" | "Moderate (< 1 MB)";
  edgeSuitability: "Micro-controllers (MCU)" | "ARM Cortex-A Embedded" | "Edge Gateway / Host CPU";
  description: string;
  params: { name: string; defaultVal: string; description: string }[];
  metrics: string[];
}

const CATALOGUE: ModelSpec[] = [
  {
    name: "LogisticRegression",
    category: "Classification",
    family: "Generalized Linear Model",
    latencyProfile: "Ultra-Fast (< 100 µs)",
    memoryFootprint: "Minimal (< 20 KB)",
    edgeSuitability: "Micro-controllers (MCU)",
    description: "Convex linear classifier with L1/L2 regularization. Ideal for ultra-constrained edge telemetry and baseline verification.",
    params: [
      { name: "C", defaultVal: "1.0", description: "Inverse regularization strength" },
      { name: "penalty", defaultVal: "l2", description: "Norm for penalization" },
      { name: "max_iter", defaultVal: "500", description: "Safe bounded convergence iterations" },
    ],
    metrics: ["Accuracy", "F1-Score", "ROC-AUC", "Log-Loss"],
  },
  {
    name: "DecisionTreeClassifier",
    category: "Classification",
    family: "Cart Decision Trees",
    latencyProfile: "Ultra-Fast (< 100 µs)",
    memoryFootprint: "Light (< 150 KB)",
    edgeSuitability: "Micro-controllers (MCU)",
    description: "Greedy recursive split tree. Easily exportable to embedded C code switch statements for micro-controller firmware.",
    params: [
      { name: "max_depth", defaultVal: "6", description: "Maximum hierarchy depth boundary" },
      { name: "min_samples_split", defaultVal: "2", description: "Minimum sample count to partition" },
      { name: "criterion", defaultVal: "gini", description: "Splitting purity measure" },
    ],
    metrics: ["Accuracy", "F1-Score", "Precision", "Recall"],
  },
  {
    name: "RandomForestClassifier",
    category: "Classification",
    family: "Bagging Ensemble",
    latencyProfile: "Fast (< 500 µs)",
    memoryFootprint: "Moderate (< 1 MB)",
    edgeSuitability: "ARM Cortex-A Embedded",
    description: "Forest of randomized decision trees. High generalization robustness against sensory noise and tabular perturbations.",
    params: [
      { name: "n_estimators", defaultVal: "50", description: "Number of trees in ensemble" },
      { name: "max_depth", defaultVal: "8", description: "Individual tree depth clamp" },
      { name: "min_samples_split", defaultVal: "2", description: "Partition threshold" },
    ],
    metrics: ["Accuracy", "F1-Score", "ROC-AUC", "Precision"],
  },
  {
    name: "HistGradientBoostingClassifier",
    category: "Classification",
    family: "Histogram Gradient Boosting",
    latencyProfile: "Fast (< 500 µs)",
    memoryFootprint: "Light (< 150 KB)",
    edgeSuitability: "Edge Gateway / Host CPU",
    description: "Bin-based gradient boosting optimized for CPU integer calculations. Native support for categorical bins and missing data.",
    params: [
      { name: "max_iter", defaultVal: "50", description: "Boosting iterations" },
      { name: "learning_rate", defaultVal: "0.1", description: "Shrinkage parameter" },
      { name: "max_leaf_nodes", defaultVal: "31", description: "Leaf count upper bound" },
    ],
    metrics: ["Accuracy", "F1-Score", "ROC-AUC"],
  },
  {
    name: "SVC",
    category: "Classification",
    family: "Support Vector Machines",
    latencyProfile: "Moderate (< 5 ms)",
    memoryFootprint: "Moderate (< 1 MB)",
    edgeSuitability: "Edge Gateway / Host CPU",
    description: "Kernelized maximum-margin classifier. Enforces strict max_iter safeguards to prevent unbounded quadratic time spikes.",
    params: [
      { name: "C", defaultVal: "1.0", description: "Regularization tradeoff parameter" },
      { name: "kernel", defaultVal: "rbf", description: "Kernel projection (linear or rbf)" },
      { name: "max_iter", defaultVal: "2000", description: "Safe CPU bounding safeguard" },
    ],
    metrics: ["Accuracy", "F1-Score", "ROC-AUC"],
  },
  {
    name: "LinearRegression",
    category: "Regression",
    family: "Ordinary Least Squares",
    latencyProfile: "Ultra-Fast (< 100 µs)",
    memoryFootprint: "Minimal (< 20 KB)",
    edgeSuitability: "Micro-controllers (MCU)",
    description: "Direct linear closed-form regression. Dot-product computation can run in sub-microsecond cycles on basic DSP instructions.",
    params: [],
    metrics: ["MAE", "RMSE", "R2", "MSE"],
  },
  {
    name: "Ridge",
    category: "Regression",
    family: "Tikhonov Regularized Linear",
    latencyProfile: "Ultra-Fast (< 100 µs)",
    memoryFootprint: "Minimal (< 20 KB)",
    edgeSuitability: "Micro-controllers (MCU)",
    description: "L2 regularized linear model. Prevents numerical instability when features exhibit high multicollinearity.",
    params: [
      { name: "alpha", defaultVal: "1.0", description: "L2 penalty weight" },
      { name: "solver", defaultVal: "auto", description: "Optimization solver engine" },
    ],
    metrics: ["MAE", "RMSE", "R2"],
  },
  {
    name: "DecisionTreeRegressor",
    category: "Regression",
    family: "Cart Decision Trees",
    latencyProfile: "Ultra-Fast (< 100 µs)",
    memoryFootprint: "Light (< 150 KB)",
    edgeSuitability: "Micro-controllers (MCU)",
    description: "Non-linear regression tree. Splits continuous feature spaces into piecewise constant response regions.",
    params: [
      { name: "max_depth", defaultVal: "6", description: "Depth constraint" },
      { name: "min_samples_split", defaultVal: "2", description: "Partition threshold" },
    ],
    metrics: ["MAE", "RMSE", "R2"],
  },
  {
    name: "RandomForestRegressor",
    category: "Regression",
    family: "Bagging Ensemble",
    latencyProfile: "Fast (< 500 µs)",
    memoryFootprint: "Moderate (< 1 MB)",
    edgeSuitability: "ARM Cortex-A Embedded",
    description: "Averaging ensemble of non-linear trees. Diminishes variance on volatile continuous physical sensor measurements.",
    params: [
      { name: "n_estimators", defaultVal: "50", description: "Ensemble tree count" },
      { name: "max_depth", defaultVal: "8", description: "Individual tree depth limit" },
    ],
    metrics: ["MAE", "RMSE", "R2"],
  },
  {
    name: "HistGradientBoostingRegressor",
    category: "Regression",
    family: "Histogram Gradient Boosting",
    latencyProfile: "Fast (< 500 µs)",
    memoryFootprint: "Light (< 150 KB)",
    edgeSuitability: "Edge Gateway / Host CPU",
    description: "Fast boosting regression with integer binning. Handles missing values seamlessly with high predictive capacity.",
    params: [
      { name: "max_iter", defaultVal: "50", description: "Number of boosting stages" },
      { name: "learning_rate", defaultVal: "0.1", description: "Gradient shrinkage" },
    ],
    metrics: ["MAE", "RMSE", "R2"],
  },
];

export default function ModelCataloguePage() {
  const [filter, setFilter] = useState<"ALL" | "Classification" | "Regression">("ALL");

  const filtered = CATALOGUE.filter((m) => filter === "ALL" || m.category === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div>
          <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
            ALGORITHMIC ARCHITECTURE // 005
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#e8ede8" }}>
            Model Catalogue & Edge Efficiency Profiles
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0" }}>
            Verified CPU estimators with explicit execution safeguards, latency thresholds, and embedded memory bounds.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {(["ALL", "Classification", "Regression"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: "6px 14px",
                borderRadius: 2,
                border: filter === t ? "1px solid #b5ff8a" : "1px solid rgba(226, 239, 229, 0.15)",
                background: filter === t ? "rgba(181, 255, 138, 0.1)" : "transparent",
                color: filter === t ? "#b5ff8a" : "#8c9c91",
                font: "500 10px var(--mono)",
                cursor: "pointer"
              }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Model Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 18 }}>
        {filtered.map((m) => (
          <div key={m.name} className="research-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <span style={{ font: "600 14px var(--mono)", color: "#e8ede8" }}>{m.name}</span>
                <div style={{ font: "400 10px var(--mono)", color: "#7e9084", marginTop: 2 }}>
                  {m.family}
                </div>
              </div>
              <span className="status-tag status-tag--completed">{m.category}</span>
            </div>

            <p style={{ font: "400 12px/1.5 var(--body)", color: "#c6d4c8", minHeight: 48, margin: "0 0 14px" }}>
              {m.description}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "rgba(5, 7, 6, 0.5)", padding: 12, borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.06)", marginBottom: 14 }}>
              <div>
                <div style={{ font: "500 8px var(--mono)", color: "#7e9084" }}>LATENCY PROFILE</div>
                <div style={{ font: "500 10px var(--mono)", color: "#a7e9e8", marginTop: 2 }}>{m.latencyProfile}</div>
              </div>
              <div>
                <div style={{ font: "500 8px var(--mono)", color: "#7e9084" }}>SERIALIZED SIZE</div>
                <div style={{ font: "500 10px var(--mono)", color: "#b5ff8a", marginTop: 2 }}>{m.memoryFootprint}</div>
              </div>
              <div style={{ gridColumn: "span 2", marginTop: 4 }}>
                <div style={{ font: "500 8px var(--mono)", color: "#7e9084" }}>HARDWARE COMPATIBILITY</div>
                <div style={{ font: "500 10px var(--mono)", color: "#e8ede8", marginTop: 2 }}>{m.edgeSuitability}</div>
              </div>
            </div>

            {m.params.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(226, 239, 229, 0.06)", paddingTop: 12 }}>
                <div style={{ font: "600 9px var(--mono)", color: "#8c9c91", marginBottom: 6 }}>
                  SEARCH SPACE PARAMETERS:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {m.params.map((p) => (
                    <span
                      key={p.name}
                      style={{
                        padding: "3px 8px",
                        background: "rgba(226, 239, 229, 0.05)",
                        border: "1px solid rgba(226, 239, 229, 0.1)",
                        borderRadius: 2,
                        font: "400 9px var(--mono)",
                        color: "#9ba8a0"
                      }}
                      title={p.description}
                    >
                      {p.name} (def: {p.defaultVal})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
