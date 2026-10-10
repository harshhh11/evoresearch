"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { RESEARCH_SCENES } from "@/lib/research-scenes";

const links = [
  { label: "Overview", href: "#overview", scene: 0 },
  { label: "Methodology", href: "#methodology", scene: 1 },
  { label: "Experiments", href: "#experiments", scene: 4 },
  { label: "Workspace", href: "#workspace", scene: 6 },
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

        {/* Main single flex-row glassmorphism floating pill navbar */}
        <nav className="floating-nav" aria-label="Main navigation">
          {/* Group 1: Left Brand (flex-shrink: 0) */}
          <a
            className="nav-brand"
            href="#overview"
            aria-label="EvoResearch home"
            onClick={() => setMobileOpen(false)}
          >
            <div className="nav-brand-icon" aria-hidden="true">
              <Image src="/evo-mark.svg" alt="" width={16} height={16} priority />
            </div>
            <span className="nav-brand-text">EVORESEARCH</span>
          </a>

          {/* Group 2: Center Navigation Links (flex: 1 1 auto, min-width: 0, responsive shrinking gaps) */}
          <div className="nav-links">
            {links.map((link) => {
              const active = isLinkActive(link.scene);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-current={active ? "location" : undefined}
                  className={active ? "active" : ""}
                >
                  <span>{link.label}</span>
                  {active && (
                    <motion.span
                      className="active-pill-dot"
                      layoutId="activeNavPill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              );
            })}
          </div>

          {/* Group 3: Right Actions (flex-shrink: 0) */}
          <div className="nav-actions">
            <div className="system-indicator">
              <span className="indicator-dot-wrap" aria-hidden="true">
                <span className="indicator-dot-ping" />
                <span className="indicator-dot-core" />
              </span>
              <span className="system-indicator-text">ENGINE READY</span>
            </div>

            <a className="nav-cta group" href="/workspace">
              <span className="cta-text">ENTER WORKSPACE</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            {/* Mobile hamburger menu toggle */}
            <button
              type="button"
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="mobile-nav-panel"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mobile-nav-links">
                {links.map((link) => {
                  const active = isLinkActive(link.scene);
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      aria-current={active ? "location" : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{link.label}</span>
                      {active && <span className="mobile-active-tag">ACTIVE</span>}
                    </a>
                  );
                })}
              </div>

              <div className="mobile-panel-footer">
                <div className="system-indicator">
                  <span className="indicator-dot-wrap" aria-hidden="true">
                    <span className="indicator-dot-ping" />
                    <span className="indicator-dot-core" />
                  </span>
                  <span>EVORESEARCH ENGINE READY</span>
                </div>
                <a
                  className="mobile-panel-cta"
                  href="/workspace"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>ENTER WORKSPACE</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
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
    <aside className="research-status-panel" aria-live="polite" aria-label="Research interface status">
      <div className="status-panel-top"><span>RESEARCH SYSTEM / 001</span><span>DEMO</span></div>
      <div className="status-panel-rule" />
      <div className="status-panel-current">
        <span className="status-kicker">CURRENT STAGE</span>
        <span className="status-stage">{String(activeStage + 1).padStart(2, "0")} <span>/ 07</span></span>
      </div>
      <p>{stage.shortLabel}</p>
      <div className="status-panel-bottom"><i aria-hidden="true" /> NO LIVE EXPERIMENT DATA</div>
    </aside>
  );
}
