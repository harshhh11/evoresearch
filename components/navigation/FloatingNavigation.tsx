"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
  return (
    <motion.header
      className="floating-nav"
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
    >
      <a className="nav-brand" href="#overview" aria-label="EvoResearch home">
        <Image src="/evo-mark.svg" alt="" width={31} height={31} priority />
        <span>EVORESEARCH</span>
      </a>

      <nav className="nav-links" aria-label="Main navigation">
        {links.map((link) => (
          <a key={link.label} href={link.href} aria-current={activeStage === link.scene ? "location" : undefined}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <span className="system-indicator"><i aria-hidden="true" /> EVORESEARCH ENGINE READY</span>
        <a className="nav-cta" href="/workspace">
          <span>ENTER WORKSPACE</span><span aria-hidden="true">↗</span>
        </a>
      </div>
    </motion.header>
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
