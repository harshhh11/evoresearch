"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="hero-section scene-stage scene-stage--hero" id="overview" data-scene data-mode="unknown" aria-labelledby="hero-title" style={{ background: "#F8F6EF", padding: "60px 24px 40px", display: "flex", flexDirection: "column", gap: 32 }}>
      <div className="hero-identity" style={{ display: "flex", justifyContent: "space-between", font: "600 10px var(--mono)", color: "#176B4D", letterSpacing: "0.12em", borderBottom: "1px solid #DFE5DC", paddingBottom: 12 }}>
        <span>EVOLVEX — MULTI-AGENT AI RESEARCH ENVIRONMENT</span>
        <span>PRODUCTION ENGINE // LIGHT MODE</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
        <div className="hero-copy scene-copy">
          <span className="scene-eyebrow" style={{ font: "600 11px var(--mono)", color: "#176B4D", display: "block", marginBottom: 12 }}>
            01 / 07 — INTELLECTUAL RESEARCH ORCHESTRATION
          </span>
          <h1 className="hero-headline" id="hero-title" style={{ font: "700 44px/1.1 var(--font-primary), serif", color: "#26352D", margin: "0 0 16px 0" }}>
            Evolve Your Research.
          </h1>
          <p className="hero-description" style={{ font: "400 15px/1.6 var(--font-primary), serif", color: "#68766D", margin: "0 0 28px 0" }}>
            An AI-powered research and experimentation environment that transforms research questions into reproducible experiments through intelligent agent orchestration, code generation, real execution, evidence-based evaluation, and continuous learning from results.
          </p>
          <div className="hero-actions" style={{ display: "flex", gap: 14 }}>
            <motion.a
              className="button button--primary"
              href="/workspace/experiments/new"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: "#176B4D",
                color: "#FFFFFF",
                padding: "12px 24px",
                borderRadius: 8,
                font: "600 12px var(--mono)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 6px rgba(23, 107, 77, 0.25)"
              }}
            >
              Start Research <span aria-hidden="true">↗</span>
            </motion.a>
            <a
              className="button button--quiet"
              href="#capabilities"
              style={{
                background: "#FFFFFF",
                color: "#26352D",
                border: "1px solid #DFE5DC",
                padding: "12px 20px",
                borderRadius: 8,
                font: "600 12px var(--mono)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8
              }}
            >
              Explore the Platform <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        {/* Product Visualization Mockup Card */}
        <div style={{ background: "#FFFFFF", border: "1px solid #DFE5DC", borderRadius: 12, padding: 24, boxShadow: "0 4px 16px rgba(38, 53, 45, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #DFE5DC", paddingBottom: 10, marginBottom: 16 }}>
            <span style={{ font: "600 10px var(--mono)", color: "#176B4D" }}>LIVE ORCHESTRATION PREVIEW</span>
            <span style={{ font: "400 10px var(--mono)", color: "#68766D" }}>12 AGENTS ACTIVE</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { title: "Planner", status: "COMPLETED" },
              { title: "Paper Analysis", status: "COMPLETED" },
              { title: "Dataset Validation", status: "COMPLETED" },
              { title: "Code Generation", status: "COMPLETED" },
              { title: "Execution Agent", status: "RUNNING" },
              { title: "Scientific Evaluation", status: "QUEUED" }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: 10, borderRadius: 6, border: "1px solid #DFE5DC", background: item.status === "COMPLETED" ? "#E6F0E9" : item.status === "RUNNING" ? "#EFF6FF" : "#F8F6EF" }}>
                <div style={{ font: "600 10px var(--mono)", color: "#26352D" }}>{item.title}</div>
                <div style={{ font: "400 9px var(--mono)", color: item.status === "COMPLETED" ? "#176B4D" : "#68766D", marginTop: 4 }}>{item.status}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#F8F6EF", border: "1px solid #DFE5DC", borderRadius: 6, padding: 12, font: "400 11px var(--mono)", color: "#26352D" }}>
            <div style={{ color: "#176B4D", fontWeight: 600, marginBottom: 4 }}>[Execution Log] Running Random Forest classifier...</div>
            <div>Dataset: 2,400 samples // Target: label // Metric: 0.942 Accuracy</div>
          </div>
        </div>
      </div>

      <div className="hero-bottomline" style={{ display: "flex", justifyContent: "space-between", font: "400 10px var(--mono)", color: "#68766D", borderTop: "1px solid #DFE5DC", paddingTop: 12 }}>
        <span>EVOLVEX PLATFORM</span>
        <span>QUESTION → PLANNING → AGENTS → CODE → EXECUTION → EVALUATION → INSIGHTS</span>
        <span>LIGHT THEME // WARM CREAM & FOREST GREEN</span>
      </div>
    </section>
  );
}
