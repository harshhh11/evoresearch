"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, ArrowRight, ArrowUpRight, Play, CheckCircle2, Sparkles, Database, FileCode, Check } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="hero-section scene-stage scene-stage--hero"
      id="overview"
      data-scene
      data-mode="unknown"
      aria-labelledby="hero-title"
      style={{
        background: "transparent",
        padding: "80px 24px 60px",
        display: "flex",
        flexDirection: "column",
        gap: 36,
        maxWidth: 1240,
        margin: "0 auto",
      }}
    >
      {/* Top Identity Kicker */}
      <div
        className="hero-identity"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--mono)",
          fontSize: "11px",
          fontWeight: 600,
          color: "#124D32",
          letterSpacing: "0.12em",
          borderBottom: "1px solid #E5EBE5",
          paddingBottom: 14,
        }}
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#124D32] animate-pulse" />
          EVORESEARCH — MULTI-AGENT AI RESEARCH PLATFORM
        </span>
        <span className="text-[#65736A] font-normal">ENTERPRISE SCIENTIFIC INTELLIGENCE // LOCAL & CLOUD RUNTIME</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Copy Column */}
        <div className="lg:col-span-7 flex flex-col items-start scene-copy">
          <div
            className="scene-eyebrow"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              fontWeight: 700,
              color: "#124D32",
              letterSpacing: "0.14em",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#EEF6EA",
              padding: "6px 14px",
              borderRadius: 9999,
              border: "1px solid #DDEEDB",
              marginBottom: 18,
            }}
          >
            <span>01 / 07</span>
            <span>·</span>
            <span>AUTONOMOUS SCIENTIFIC DISCOVERY</span>
          </div>

          <h1
            className="hero-headline"
            id="hero-title"
            style={{
              fontFamily: "var(--font-primary)",
              fontWeight: 800,
              fontSize: "clamp(38px, 5vw, 56px)",
              lineHeight: 1.08,
              color: "#17251D",
              margin: "0 0 18px 0",
              letterSpacing: "-0.03em",
            }}
          >
            Evolve Your Research.
          </h1>

          <p
            className="hero-description"
            style={{
              fontFamily: "var(--font-primary)",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: 1.65,
              color: "#65736A",
              margin: "0 0 32px 0",
              maxWidth: 620,
            }}
          >
            An AI-powered research and experimentation platform that transforms complex scientific questions into reproducible experiments through intelligent agent orchestration, dynamic code synthesis, sandboxed execution, and continuous learning from failure telemetry.
          </p>

          <div className="hero-actions flex flex-wrap items-center gap-4">
            <motion.a
              href="/workspace/experiments/new"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3.5 rounded-full bg-[#124D32] hover:bg-[#092F20] text-[#FFFFFF] font-sans text-[13.5px] font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Start Research</span>
              <ArrowUpRight size={16} />
            </motion.a>

            <a
              href="#capabilities"
              className="px-6 py-3.5 rounded-full bg-[#FFFFFF] hover:bg-[#F5F9F3] text-[#17251D] border border-[#E5EBE5] font-sans text-[13.5px] font-medium flex items-center gap-2 transition-all shadow-xs"
            >
              <span>Explore Platform</span>
              <span className="text-[#65736A]">↓</span>
            </a>

            <Link
              href="/workspace"
              className="px-5 py-3.5 rounded-full text-[13.5px] font-medium text-[#124D32] hover:text-[#092F20] flex items-center gap-1.5 transition-colors"
            >
              <span>Enter Workspace</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-[#E5EBE5]/80 w-full text-[12px] text-[#65736A] font-medium font-sans">
            <span className="flex items-center gap-2">
              <Check size={14} className="text-[#124D32]" /> 12 Autonomous Agents
            </span>
            <span className="flex items-center gap-2">
              <Check size={14} className="text-[#124D32]" /> 100% Deterministic Provenance
            </span>
            <span className="flex items-center gap-2">
              <Check size={14} className="text-[#124D32]" /> Closed-Loop Self-Healing
            </span>
          </div>
        </div>

        {/* Right Product Visualization Mockup Card */}
        <div className="lg:col-span-5 w-full">
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5EBE5",
              borderRadius: 24,
              padding: 26,
              boxShadow: "0 8px 30px rgba(18, 77, 50, 0.06)",
            }}
          >
            <div className="flex justify-between items-center border-b border-[#EDF0EC] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#124D32]" />
                <span className="font-mono text-[11px] font-bold text-[#124D32] tracking-wider uppercase">
                  ORCHESTRATION PIPELINE
                </span>
              </div>
              <Link
                href="/workspace/orchestration"
                className="font-mono text-[11px] font-semibold text-[#124D32] hover:underline inline-flex items-center gap-1"
              >
                <span>OPEN HUB</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
              {[
                { title: "Planner Agent", status: "COMPLETED", active: false },
                { title: "Paper Digest", status: "COMPLETED", active: false },
                { title: "Dataset Validator", status: "COMPLETED", active: false },
                { title: "Code Synthesizer", status: "COMPLETED", active: false },
                { title: "Execution Runner", status: "ACTIVE RUN", active: true },
                { title: "Autopsy Doctor", status: "STANDBY", active: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    item.active
                      ? "bg-[#EEF6EA] border-[#124D32] shadow-xs"
                      : item.status === "COMPLETED"
                      ? "bg-[#F5F9F3] border-[#E5EBE5]"
                      : "bg-[#FFFFFF] border-[#EDF0EC]"
                  }`}
                >
                  <div className="font-sans text-[11.5px] font-semibold text-[#17251D] truncate">
                    {item.title}
                  </div>
                  <div
                    className={`font-mono text-[9.5px] font-bold mt-1.5 flex items-center gap-1 ${
                      item.active
                        ? "text-[#124D32]"
                        : item.status === "COMPLETED"
                        ? "text-[#238653]"
                        : "text-[#89958D]"
                    }`}
                  >
                    {item.active && <span className="w-1.5 h-1.5 rounded-full bg-[#124D32] animate-ping" />}
                    {item.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Status Feed */}
            <div
              style={{
                background: "#F5F9F3",
                border: "1px solid #E5EBE5",
                borderRadius: 14,
                padding: 14,
                fontFamily: "var(--mono)",
                fontSize: "11px",
                color: "#17251D",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: "#124D32", fontWeight: 700, marginBottom: 2 }}>
                  NOMAD 2018 Materials Discovery
                </div>
                <div style={{ color: "#65736A", fontSize: "10px" }}>
                  Dataset: 2,400 structures // Target: Bandgap eV
                </div>
              </div>
              <Link
                href="/workspace/orchestration"
                className="px-3 py-1.5 rounded-lg bg-[#124D32] hover:bg-[#092F20] text-[#FFFFFF] font-mono text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0"
              >
                INSPECT
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Bar */}
      <div
        className="hero-bottomline"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--mono)",
          fontSize: "10.5px",
          color: "#89958D",
          borderTop: "1px solid #E5EBE5",
          paddingTop: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span className="font-semibold text-[#124D32]">EVORESEARCH V2.4</span>
        <span>SCIENTIFIC QUESTION → DEEP HYPOTHESIS → MULTI-AGENT EXECUTION → REPRODUCIBLE INSIGHTS</span>
        <span>STATUS: ALL RUNTIMES OPERATIONAL</span>
      </div>
    </section>
  );
}
