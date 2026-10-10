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
        <div className="p-[16px_16px_14px] border-b border-[#34352F]">
          <Link href="/" className="inline-flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 rounded-[8px] bg-[#191A18] border border-[#34352F] flex items-center justify-center transition-colors group-hover:border-[#B69A72]">
              <Image src="/evo-mark.svg" alt="EvoResearch Symbol" width={18} height={18} priority />
            </div>
            <div>
              <div className="font-sans font-semibold text-[13px] leading-tight tracking-[0.06em] text-[#F2F0E8]">
                EVORESEARCH
              </div>
              <div className="font-mono text-[9px] text-[#77786F] tracking-[0.06em] mt-0.5 uppercase">
                Materials ML // Edge Studio
              </div>
            </div>
          </Link>
        </div>

        {/* Grouped Navigation list */}
        <nav className="flex-1 p-[12px_10px] overflow-y-auto flex flex-col gap-4" aria-label="Research Tools">
          {navigationGroups.map((grp) => (
            <div key={grp.group} className="flex flex-col gap-0.5">
              <div className="font-mono text-[9px] text-[#77786F] tracking-[0.1em] uppercase px-2.5 py-1 font-medium select-none">
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
                        size={15}
                        className={isActive ? "text-[#B69A72]" : "text-[#77786F] group-hover:text-[#AAA99F]"}
                      />
                      <span className="truncate text-[13px] font-medium">{item.name}</span>
                    </div>
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#B69A72] shrink-0"
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
        <div className="p-[12px_14px] border-t border-[#34352F] flex flex-col gap-2 bg-[#141513]">
          {/* Measured Engine Status */}
          <div className="p-[8px_10px] rounded-[8px] bg-[#191A18] border border-[#34352F] flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                {engineStatus === "ready" ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8EA58C] opacity-50" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8EA58C]" />
                  </>
                ) : engineStatus === "checking" ? (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B69A72]" />
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C77F72]" />
                )}
              </span>
              <div className="min-w-0">
                <div className="font-sans text-[11px] font-medium text-[#F2F0E8] leading-none">
                  {engineStatus === "ready" ? "ML Engine: Verified" : engineStatus === "checking" ? "Verifying Engine..." : "Engine Offline"}
                </div>
                <div className="font-mono text-[9px] text-[#77786F] leading-tight mt-1 truncate">
                  Port 8000 // FastDaemon
                </div>
              </div>
            </div>
            <ShieldCheck size={14} className={engineStatus === "ready" ? "text-[#8EA58C]" : "text-[#77786F]"} />
          </div>

          {/* Runtime Spec readout */}
          <div className="flex items-center justify-between px-1 font-mono text-[9px] text-[#77786F]">
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#77786F] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments, model architectures, memory signatures..."
              className="w-full h-[36px] pl-9 pr-14 bg-[#191A18] border border-[#34352F] rounded-[8px] text-[13px] text-[#F2F0E8] placeholder-[#77786F] focus:outline-none focus:border-[#B69A72] transition-colors font-sans"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#20211E] border border-[#34352F] text-[#77786F]">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* Right Session Readout */}
          <div className="flex items-center gap-3">
            {/* Quick Engine Ping Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#191A18] border border-[#34352F]">
              <Activity size={13} className="text-[#B69A72]" />
              <span className="font-mono text-[10px] text-[#AAA99F]">
                INFERENCE LATENCY PROFILER READY
              </span>
            </div>

            {/* Researcher Session Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[8px] bg-[#191A18] border border-[#34352F]">
              <div className="w-5 h-5 rounded-[6px] bg-[#20211E] border border-[#34352F] flex items-center justify-center font-mono text-[9px] font-semibold text-[#F2F0E8]">
                HR
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-sans text-[12px] font-medium text-[#F2F0E8] leading-none">
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
