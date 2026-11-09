"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { RESEARCH_SCENES } from "@/lib/research-scenes";

const links = [
  { label: "Product", href: "#overview", scene: 0 },
  { label: "Capabilities", href: "#capabilities", scene: 1 },
  { label: "How It Works", href: "#how-it-works", scene: 4 },
  { label: "Research Workspace", href: "/workspace/experiments", scene: 6 },
];

type FloatingNavigationProps = {
  activeStage: number;
};

export function FloatingNavigation({ activeStage }: FloatingNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLinkActive = (scene: number) => {
    if (scene === 0) return activeStage === 0;
    if (scene === 1) return activeStage >= 1 && activeStage < 4;
    if (scene === 4) return activeStage >= 4 && activeStage < 6;
    if (scene === 6) return activeStage >= 6;
    return activeStage === scene;
  };

  return (
    <header className="nav-container">
      <div className="nav-pill-wrapper">
        {/* Subtle blurred green particle glow aura behind the navbar */}
        <div className="nav-glow-aura" aria-hidden="true" />

        {/* Main single flex-row floating pill navbar */}
        <nav className="floating-nav" aria-label="Main navigation">
          {/* Group 1: Left Brand */}
          <Link
            className="nav-brand"
            href="/"
            aria-label="EvoResearch home"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-7 h-7 rounded-full bg-[#124D32] flex items-center justify-center text-[#FFFFFF] shrink-0 shadow-xs">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 15-6-6-6 6"/>
                <path d="m18 9-6-6-6 6"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight text-[#17251D]">EVORESEARCH</span>
          </Link>

          {/* Group 2: Center Navigation Links */}
          <div className="nav-links">
            {links.map((link) => {
              const active = isLinkActive(link.scene);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-current={active ? "location" : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                    active ? "text-[#124D32] bg-[#EEF6EA] font-semibold" : "text-[#65736A] hover:text-[#124D32] hover:bg-[#F5F9F3]"
                  }`}
                >
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>

          {/* Group 3: Right Actions */}
          <div className="nav-actions flex items-center gap-2.5">
            <div className="system-indicator hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF6EA] border border-[#DDEEDB] text-[#124D32] text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#238653] animate-pulse" />
              <span>ENGINE READY</span>
            </div>

            <Link
              className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-[#17251D] hover:text-[#124D32] hover:bg-[#EEF6EA] transition-all"
              href="/workspace"
            >
              SIGN IN
            </Link>

            <Link
              className="group px-4 py-1.5 rounded-full bg-[#124D32] hover:bg-[#092F20] text-[#FFFFFF] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs"
              href="/workspace/experiments/new"
            >
              <span>GET STARTED</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              className="nav-mobile-toggle p-1.5 rounded-lg text-[#17251D] hover:bg-[#F5F9F3]"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="mobile-nav-panel bg-[#FFFFFF] border border-[#E5EBE5] rounded-2xl p-4 mt-2 shadow-lg"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mobile-nav-links flex flex-col gap-2">
                {links.map((link) => {
                  const active = isLinkActive(link.scene);
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      aria-current={active ? "location" : undefined}
                      className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                        active ? "bg-[#EEF6EA] text-[#124D32] font-semibold" : "text-[#17251D] hover:bg-[#F5F9F3]"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>

              <div className="mobile-panel-footer border-t border-[#EDF0EC] pt-3 mt-3 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-[#124D32] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#238653]" />
                  <span>EVORESEARCH READY</span>
                </div>
                <Link
                  className="px-3 py-1.5 rounded-full bg-[#124D32] text-[#FFFFFF] text-[11px] font-semibold inline-flex items-center gap-1"
                  href="/workspace"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>WORKSPACE</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export function ResearchStatusPanel({ activeStage }: FloatingNavigationProps) {
  const stage = RESEARCH_SCENES[activeStage] ?? RESEARCH_SCENES[0];
  return (
    <aside className="research-status-panel fixed bottom-6 left-6 z-40 bg-[#FFFFFF] border border-[#E5EBE5] rounded-2xl p-3.5 shadow-sm max-w-[260px] text-[11.5px] text-[#17251D] font-sans" aria-live="polite" aria-label="Research interface status">
      <div className="flex justify-between items-center font-mono text-[10px] font-bold text-[#124D32] mb-1.5">
        <span>RESEARCH SYSTEM / 001</span>
        <span className="px-1.5 py-0.5 rounded bg-[#EEF6EA] text-[#124D32]">LIVE</span>
      </div>
      <div className="h-[1px] bg-[#EDF0EC] my-2" />
      <div className="flex justify-between items-center text-[#65736A] text-[11px] mb-1">
        <span className="font-semibold uppercase tracking-wider text-[10px]">CURRENT STAGE</span>
        <span className="font-mono font-bold text-[#17251D]">{String(activeStage + 1).padStart(2, "0")} <span className="text-[#89958D]">/ 07</span></span>
      </div>
      <p className="font-semibold text-[12px] text-[#17251D] m-0 truncate">{stage.shortLabel}</p>
      <div className="text-[10px] text-[#89958D] mt-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#238653]" />
        <span>EVORESEARCH ACTIVE DISCOVERY</span>
      </div>
    </aside>
  );
}
