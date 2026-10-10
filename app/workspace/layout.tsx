"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Database,
  Sparkles,
  BrainCircuit,
  BookOpen,
  Cpu,
  FileText,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Activity,
  Terminal,
  ShieldCheck,
} from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { api } from "@/lib/api";

const navigationGroups = [
  {
    group: "EXPERIMENTS & DATA",
    items: [
      { name: "Overview Canvas", href: "/workspace", icon: LayoutDashboard },
      { name: "Run Experiment", href: "/workspace/experiments/new", icon: FlaskConical },
      { name: "Materials Datasets", href: "/workspace/datasets", icon: Database },
    ],
  },
  {
    group: "SCIENTIFIC INTELLIGENCE",
    items: [
      { name: "Failure Memory", href: "/workspace/memory", icon: BrainCircuit },
      { name: "ARINA Assistant", href: "/workspace#assistant", icon: Sparkles },
      { name: "Literature & Insights", href: "/workspace/papers", icon: BookOpen },
    ],
  },
  {
    group: "EDGE RUNTIME",
    items: [
      { name: "Resource Profiler", href: "/workspace/optimization", icon: Cpu },
      { name: "Scientific Reports", href: "/workspace/reports", icon: FileText },
      { name: "Environment Settings", href: "/workspace/settings", icon: Settings },
    ],
  },
];

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [engineStatus, setEngineStatus] = useState<"checking" | "ready" | "offline">("checking");

  useEffect(() => {
    let mounted = true;
    api.getHealth()
      .then((h) => {
        if (mounted) setEngineStatus(h.status === "ok" ? "ready" : "offline");
      })
      .catch(() => {
        if (mounted) setEngineStatus("offline");
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="workspace-shell">
      {/* 1. COMPACT SCIENTIFIC SIDEBAR */}
      <aside className="workspace-sidebar" aria-label="Scientific Workspace Navigation">
        {/* Top Brand Identity */}
        <div className="p-[18px_16px_16px] border-b border-[#1b221e]">
          <Link href="/" className="inline-flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 rounded-[6px] bg-[#111513] border border-[#222b26] flex items-center justify-center transition-colors group-hover:border-[#9aaf98]">
              <Image src="/evo-mark.svg" alt="EvoResearch Symbol" width={18} height={18} priority />
            </div>
            <div>
              <div className="font-mono font-semibold text-[11px] leading-tight tracking-[0.14em] text-[#e8e6df]">
                EVORESEARCH
              </div>
              <div className="font-mono text-[7.5px] text-[#8e958f] tracking-[0.08em] mt-0.5 uppercase">
                Materials ML // Edge Studio
              </div>
            </div>
          </Link>
        </div>

        {/* Grouped Navigation list */}
        <nav className="flex-1 p-[12px_10px] overflow-y-auto flex flex-col gap-4" aria-label="Research Tools">
          {navigationGroups.map((grp) => (
            <div key={grp.group} className="flex flex-col gap-0.5">
              <div className="font-mono text-[8px] text-[#687069] tracking-[0.14em] uppercase px-2.5 py-1 font-medium select-none">
                {grp.group}
              </div>
              {grp.items.map((item) => {
                const isActive =
                  item.href === "/workspace"
                    ? pathname === "/workspace"
                    : pathname === item.href || (item.href !== "/workspace#assistant" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={14}
                        className={isActive ? "text-[#9aaf98]" : "text-[#737b74] group-hover:text-[#a5aaa4]"}
                      />
                      <span className="truncate text-[11px]">{item.name}</span>
                    </div>
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#9aaf98] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Engine Telemetry Strip */}
        <div className="p-[12px_14px] border-t border-[#1b221e] flex flex-col gap-2 bg-[#0c100e]">
          {/* Measured Engine Status */}
          <div className="p-[8px_10px] rounded-[6px] bg-[#111513] border border-[#1f2622] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                {engineStatus === "ready" ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9aaf98] opacity-50" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9aaf98]" />
                  </>
                ) : engineStatus === "checking" ? (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d1a654]" />
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d46b6b]" />
                )}
              </span>
              <div className="min-w-0">
                <div className="font-mono text-[9.5px] font-medium text-[#e8e6df] leading-none uppercase">
                  {engineStatus === "ready" ? "ML Engine: Verified" : engineStatus === "checking" ? "Verifying Engine..." : "Engine Offline"}
                </div>
                <div className="font-mono text-[8px] text-[#687069] leading-tight mt-1 truncate">
                  Port 8000 // FastDaemon
                </div>
              </div>
            </div>
            <ShieldCheck size={13} className={engineStatus === "ready" ? "text-[#9aaf98]" : "text-[#687069]"} />
          </div>

          {/* Runtime Spec readout */}
          <div className="flex items-center justify-between px-1 font-mono text-[8.5px] text-[#687069]">
            <span>ENV: LOCAL_STUDIO</span>
            <span>BUILD v2.1</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN SCIENTIFIC WORKSPACE AREA */}
      <div className="workspace-main-area">
        {/* Top Research Header Bar */}
        <header className="workspace-topbar" aria-label="Workspace Context Navigation">
          {/* Scientific Workspace Search */}
          <div className="relative w-full max-w-[420px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737b74] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments, model architectures, memory signatures..."
              className="w-full h-[34px] pl-9 pr-14 bg-[#111513] border border-[#1f2622] rounded-[6px] text-[11.5px] text-[#e8e6df] placeholder-[#687069] focus:outline-none focus:border-[#2f3d34] transition-colors font-sans"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#151a17] border border-[#222b26] text-[#737b74]">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* Right Session Readout */}
          <div className="flex items-center gap-3">
            {/* Quick Engine Ping Indicator */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#111513] border border-[#1f2622]">
              <Activity size={12} className="text-[#9aaf98]" />
              <span className="font-mono text-[9.5px] text-[#8e958f]">
                INFERENCE LATENCY PROFILER READY
              </span>
            </div>

            {/* Researcher Session Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#111513] border border-[#1f2622]">
              <div className="w-5 h-5 rounded-[4px] bg-[#151a17] border border-[#242e28] flex items-center justify-center font-mono text-[9px] font-semibold text-[#e8e6df]">
                HR
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-sans text-[10.5px] font-medium text-[#e8e6df] leading-none">
                  Harsh Rathod
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
