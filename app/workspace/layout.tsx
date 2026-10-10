"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  PlusCircle,
  GitCompare,
  Database,
  Cpu,
  Zap,
  BrainCircuit,
  BookOpen,
  FileCheck2,
  Users,
  Activity,
  Settings,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { ReactNode } from "react";

const navigation = [
  { name: "Overview", href: "/workspace", icon: LayoutDashboard },
  { name: "New Experiment", href: "/workspace/experiments/new", icon: PlusCircle },
  { name: "Comparative & Pareto", href: "/workspace/experiments/compare", icon: GitCompare },
  { name: "Dataset Library", href: "/workspace/datasets", icon: Database },
  { name: "Model Catalogue", href: "/workspace/models", icon: Cpu },
  { name: "Optuna Optimization", href: "/workspace/optimization", icon: Zap },
  { name: "Recovery Memory", href: "/workspace/memory", icon: BrainCircuit },
  { name: "Research Papers", href: "/workspace/papers", icon: BookOpen },
  { name: "Evidence Reports", href: "/workspace/reports", icon: FileCheck2 },
  { name: "Collaborative Team", href: "/workspace/team", icon: Users },
  { name: "Audit Timeline", href: "/workspace/audit", icon: Activity },
  { name: "Settings", href: "/workspace/settings", icon: Settings },
];

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="workspace-shell">
      {/* Sidebar */}
      <aside className="workspace-sidebar">
        {/* Brand */}
        <div style={{ padding: "20px 22px 18px", borderBottom: "1px solid rgba(226, 239, 229, 0.08)" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/evo-mark.svg" alt="EvoResearch" width={26} height={26} />
            <div>
              <div style={{ font: "600 11px/1 var(--mono)", letterSpacing: "0.14em", color: "#e8ede8" }}>
                EVORESEARCH
              </div>
              <div style={{ font: "400 8px/1 var(--mono)", color: "#7e9084", marginTop: 4, letterSpacing: "0.08em" }}>
                EDGE & EFFICIENT ML
              </div>
            </div>
          </Link>
        </div>

        {/* Engine status indicator */}
        <div style={{ padding: "12px 22px", background: "rgba(181, 255, 138, 0.03)", borderBottom: "1px solid rgba(226, 239, 229, 0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, font: "500 9px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.06em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#b5ff8a", boxShadow: "0 0 10px rgba(181, 255, 138, 0.8)", display: "inline-block" }} />
            ENGINE ACTIVE
          </div>
          <span style={{ font: "400 8px/1 var(--mono)", color: "#7e9084" }}>CPU-BUDGETED</span>
        </div>

        {/* Navigation items */}
        <nav style={{ flex: 1, padding: "14px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/workspace" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 14px",
                  borderRadius: 3,
                  font: isActive ? "500 11px/1 var(--mono)" : "400 11px/1 var(--mono)",
                  letterSpacing: "0.04em",
                  color: isActive ? "#b5ff8a" : "#9ba8a0",
                  background: isActive ? "rgba(181, 255, 138, 0.08)" : "transparent",
                  borderLeft: isActive ? "2px solid #b5ff8a" : "2px solid transparent",
                  transition: "all 140ms ease",
                  textDecoration: "none"
                }}
              >
                <Icon size={14} color={isActive ? "#b5ff8a" : "#7e9084"} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(226, 239, 229, 0.08)", background: "rgba(5, 7, 6, 0.5)" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              font: "400 9px/1 var(--mono)",
              color: "#8c9c91",
              letterSpacing: "0.08em",
              textDecoration: "none"
            }}
          >
            <span>RETURN TO LANDING</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="workspace-main-area">
        {/* Topbar */}
        <header className="workspace-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ font: "600 10px/1 var(--mono)", color: "#7e9084", letterSpacing: "0.1em" }}>
              RESEARCH DOMAIN:
            </span>
            <span style={{ font: "500 10px/1 var(--mono)", color: "#e8ede8", background: "rgba(226, 239, 229, 0.06)", padding: "4px 10px", borderRadius: 2, border: "1px solid rgba(226, 239, 229, 0.1)" }}>
              RESOURCE-CONSTRAINED TABULAR ML
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, font: "400 9px/1 var(--mono)", color: "#a7e9e8", background: "rgba(167, 233, 232, 0.06)", padding: "4px 12px", border: "1px solid rgba(167, 233, 232, 0.2)", borderRadius: 2 }}>
              <Zap size={11} />
              <span>DEFAULT CPU BUDGET: 30.0s</span>
            </div>

            <Link
              href="/workspace/experiments/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                background: "#b5ff8a",
                color: "#050706",
                font: "600 10px/1 var(--mono)",
                letterSpacing: "0.08em",
                borderRadius: 2,
                textDecoration: "none",
                transition: "opacity 150ms ease"
              }}
            >
              <PlusCircle size={12} />
              <span>NEW EXPERIMENT</span>
            </Link>
          </div>
        </header>

        {/* Content body */}
        <main className="workspace-content">
          {children}
        </main>
      </div>
    </div>
  );
}
