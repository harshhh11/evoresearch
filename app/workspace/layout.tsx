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
  BarChart3,
  Network,
  Zap,
} from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { api } from "@/lib/api";

const navigationGroups = [
  {
    group: "EXPERIMENTS & DATA",
    items: [
      { name: "Overview Canvas", href: "/workspace", icon: LayoutDashboard },
      { name: "Analytics & Trends", href: "/workspace/analytics", icon: BarChart3 },
      { name: "Run Experiment", href: "/workspace/experiments/new", icon: FlaskConical },
      { name: "Materials Datasets", href: "/workspace/datasets", icon: Database },
    ],
  },
  {
    group: "SCIENTIFIC INTELLIGENCE",
    items: [
      { name: "Research Knowledge Graph", href: "/workspace/knowledge-graph", icon: Network },
      { name: "Failure Memory", href: "/workspace/memory", icon: BrainCircuit },
      { name: "ARINA Assistant", href: "/workspace/assistant", icon: Sparkles },
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
  const [engineStatus, setEngineStatus] = useState<"checking" | "online" | "offline">("checking");
  const [aiStatus, setAiStatus] = useState<{ active_provider: string; active_model: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getHealth()
      .then((h) => {
        if (mounted) setEngineStatus(h.status === "ok" ? "online" : "offline");
      })
      .catch(() => {
        if (mounted) setEngineStatus("offline");
      });

    api.getAIStatus()
      .then((st) => {
        if (mounted && st) setAiStatus(st);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="workspace-shell min-h-screen text-[#F0F4F1] flex">
      {/* 1. COMPACT TRANSLUCENT SCIENTIFIC SIDEBAR (260px) */}
      <aside
        className="w-[260px] shrink-0 border-r border-[rgba(174,202,196,0.12)] bg-[rgba(12,18,20,0.78)] backdrop-blur-[28px] flex flex-col sticky top-0 h-screen z-40 shadow-[4px_0_24px_-2px_rgba(0,0,0,0.35)]"
        aria-label="Scientific Workspace Navigation"
      >
        {/* Top Brand Identity */}
        <div className="p-[16px_18px_14px] border-b border-[rgba(174,202,196,0.12)]">
          <Link href="/workspace" className="inline-flex items-center gap-3 no-underline group">
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(17,27,29,0.85)] border border-[rgba(85,214,161,0.35)] flex items-center justify-center transition-all group-hover:border-[#55D6A1] shadow-[0_0_14px_rgba(85,214,161,0.18)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#55D6A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <div className="font-sans font-semibold text-[13.5px] leading-tight tracking-[0.04em] text-[#F0F4F1]">
                EVORESEARCH
              </div>
              <div className="font-mono text-[9px] text-[#738581] tracking-[0.08em] mt-0.5 uppercase">
                MATERIALS ML // EDGE STUDIO
              </div>
            </div>
          </Link>
        </div>

        {/* Grouped Navigation list */}
        <nav className="flex-1 p-[14px_12px] overflow-y-auto flex flex-col gap-4.5" aria-label="Research Tools">
          {navigationGroups.map((grp) => (
            <div key={grp.group} className="flex flex-col gap-0.5">
              <div className="font-mono text-[9px] text-[#738581] tracking-[0.1em] uppercase px-2.5 py-1 font-medium select-none">
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
                    className={`flex items-center justify-between px-3 py-2 rounded-[9px] text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-[rgba(85,214,161,0.12)] border border-[rgba(85,214,161,0.32)] text-[#F0F4F1] shadow-[0_2px_10px_rgba(85,214,161,0.08)]"
                        : "text-[#A7B5B2] hover:text-[#F0F4F1] hover:bg-[rgba(174,202,196,0.06)] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={15}
                        className={isActive ? "text-[#55D6A1]" : "text-[#738581]"}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#55D6A1] shadow-[0_0_8px_#55D6A1] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom ML Engine Status Panel */}
        <div className="p-[12px_14px] border-t border-[rgba(174,202,196,0.12)] flex flex-col gap-2 bg-[rgba(12,18,20,0.85)]">
          <div className="p-[9px_12px] rounded-[10px] bg-[rgba(17,27,29,0.7)] border border-[rgba(174,202,196,0.14)] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                {engineStatus === "online" ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#55D6A1] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#55D6A1]" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DB817F]" />
                )}
              </span>
              <div className="min-w-0">
                <div className="font-sans text-[11.5px] font-semibold text-[#F0F4F1] leading-none">
                  ML Engine: {engineStatus === "online" ? "Online" : "Offline"}
                </div>
                <div className="font-mono text-[9.5px] text-[#738581] leading-tight mt-1 truncate">
                  Port 8000 • FastDaemon
                </div>
              </div>
            </div>
            <Link href="/workspace/settings" className="text-[#738581] hover:text-[#55D6A1] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 16 16 12 12 8" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </Link>
          </div>

          <div className="flex items-center justify-between px-1 font-mono text-[9px] text-[#738581]">
            <span>ENV: LOCAL_STUDIO</span>
            <span>BUILD v2.1.0</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN SCIENTIFIC WORKSPACE AREA */}
      <div className="workspace-main-area flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Research Header Bar */}
        <header className="h-[52px] border-b border-[rgba(174,202,196,0.12)] px-6 flex items-center justify-between bg-[rgba(8,12,13,0.78)] backdrop-blur-[24px] sticky top-0 z-30 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.4)]">
          {/* Wide search field */}
          <div className="relative w-full max-w-[480px]">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#738581] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments, materials, models, properties, papers..."
              className="w-full h-[36px] pl-9.5 pr-14 bg-[rgba(17,27,29,0.72)] border border-[rgba(174,202,196,0.16)] rounded-[9px] text-[12.5px] text-[#F0F4F1] placeholder-[#738581] focus:outline-none focus:border-[#55D6A1] focus:shadow-[0_0_12px_rgba(85,214,161,0.15)] transition-all font-sans"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-[5px] bg-[#141C1E] border border-[rgba(174,202,196,0.14)] text-[#738581]">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* Right Session Status Items */}
          <div className="flex items-center gap-3">
            {/* Local AI pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[rgba(17,27,29,0.72)] border border-[rgba(174,202,196,0.14)] font-mono text-[11px] text-[#F0F4F1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="w-2 h-2 rounded-full bg-[#55D6A1] shadow-[0_0_8px_#55D6A1]" />
              <span>Local AI (Ollama)</span>
            </div>

            {/* Cache pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[rgba(17,27,29,0.72)] border border-[rgba(174,202,196,0.14)] font-mono text-[11px] text-[#A7B5B2] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Zap size={12} className="text-[#55D6A1]" />
              <span>Cache: Active</span>
            </div>

            {/* GPU utilization pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[rgba(17,27,29,0.72)] border border-[rgba(174,202,196,0.14)] font-mono text-[11px] text-[#A7B5B2] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Cpu size={12} className="text-[#63A9D8]" />
              <span>GPU 38%</span>
            </div>

            {/* Notification bell */}
            <button
              type="button"
              className="w-8 h-8 rounded-[8px] bg-[rgba(17,27,29,0.72)] border border-[rgba(174,202,196,0.14)] flex items-center justify-center text-[#A7B5B2] hover:text-[#F0F4F1] hover:border-[#55D6A1] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              aria-label="Notifications"
            >
              <Bell size={14} />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] bg-[rgba(17,27,29,0.72)] border border-[rgba(174,202,196,0.14)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="w-5.5 h-5.5 rounded-[6px] bg-[rgba(24,36,38,0.9)] border border-[rgba(174,202,196,0.2)] flex items-center justify-center font-mono text-[9.5px] font-semibold text-[#55D6A1]">
                HR
              </div>
              <span className="font-sans text-[12px] font-medium text-[#F0F4F1] hidden sm:block">
                Harsh Rathod
              </span>
              <ChevronDown size={12} className="text-[#738581]" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
