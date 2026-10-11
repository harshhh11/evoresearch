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
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { api } from "@/lib/api";

const navigationGroups = [
  {
    group: "EXPERIMENTS & DATA",
    items: [
      { name: "Overview Canvas", href: "/workspace", icon: LayoutDashboard },
      { name: "Evolution Timeline", href: "/workspace/evolution", icon: Terminal },
      { name: "Run Experiment", href: "/workspace/experiments/new", icon: FlaskConical },
      { name: "Analytics & Trends", href: "/workspace/analytics", icon: BarChart3 },
      { name: "Research Datasets", href: "/workspace/datasets", icon: Database },
    ],
  },
  {
    group: "SCIENTIFIC INTELLIGENCE",
    items: [
      { name: "Failure Autopsy", href: "/workspace/autopsy", icon: ShieldCheck },
      { name: "Failure Memory", href: "/workspace/memory", icon: BrainCircuit },
      { name: "Research Knowledge Graph", href: "/workspace/knowledge-graph", icon: Network },
      { name: "ARINA Assistant", href: "/workspace/assistant", icon: Sparkles },
      { name: "Literature & Insights", href: "/workspace/papers", icon: BookOpen },
    ],
  },
  {
    group: "EDGE RUNTIME",
    items: [
      { name: "System Status & Telemetry", href: "/workspace/status", icon: Activity },
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

  // Smooth Collapsible Sidebar State with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem("evolvex_sidebar_collapsed");
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    } catch (e) {
      // Fallback to default expanded
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      try {
        localStorage.setItem("evolvex_sidebar_collapsed", JSON.stringify(newState));
      } catch (e) {}
      return newState;
    });
  };

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
    <div className="workspace-shell min-h-screen text-[#202923] bg-[#F8F6EF] flex font-sans">
      {/* 1. CREAM & FOREST GREEN SCIENTIFIC SIDEBAR (Collapsible: 260px <-> 68px) */}
      <aside
        className={`shrink-0 border-r border-[#DDE4DA] bg-[#FFFFFF] flex flex-col sticky top-0 h-screen z-40 transition-all duration-300 ease-in-out shadow-[2px_0_12px_rgba(32,41,35,0.03)] select-none ${
          isCollapsed ? "w-[68px]" : "w-[260px]"
        }`}
        aria-label="Scientific Workspace Navigation"
      >
        {/* Top Brand Identity & Toggle Button */}
        <div
          className={`p-3 border-b border-[#DDE4DA] flex items-center h-[52px] ${
            isCollapsed ? "justify-center" : "justify-between px-4"
          }`}
        >
          {!isCollapsed && (
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline group min-w-0" title="Return to EvolveX Landing Page">
              <div className="w-8 h-8 rounded-[8px] bg-[rgba(23,107,77,0.08)] border border-[rgba(23,107,77,0.25)] flex items-center justify-center transition-all group-hover:border-[#176B4D] shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#176B4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div className="overflow-hidden transition-opacity duration-300">
                <div className="font-serif font-bold text-[15px] leading-tight tracking-[0.02em] text-[#176B4D] whitespace-nowrap">
                  EVOLVEX
                </div>
                <div className="font-mono text-[9px] text-[#5C6E63] tracking-[0.08em] uppercase whitespace-nowrap">
                  AI RESEARCH ENGINE
                </div>
              </div>
            </Link>
          )}

          {/* Sidebar Toggle Trigger Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={`w-8 h-8 rounded-[8px] bg-[#F8F6EF] border border-[#DDE4DA] hover:border-[#176B4D] flex items-center justify-center text-[#5C6E63] hover:text-[#176B4D] transition-all cursor-pointer shadow-xs ${
              isCollapsed ? "mx-auto" : "ml-auto"
            }`}
            title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Grouped Navigation list */}
        <nav
          className={`flex-1 overflow-y-auto flex flex-col gap-4 py-3 transition-all duration-300 no-scrollbar ${
            isCollapsed ? "px-2" : "px-3"
          }`}
          aria-label="Research Tools"
        >
          {navigationGroups.map((grp) => (
            <div key={grp.group} className="flex flex-col gap-1">
              {!isCollapsed ? (
                <div className="font-mono text-[9px] text-[#5C6E63] tracking-[0.1em] uppercase px-2.5 py-1 font-semibold select-none whitespace-nowrap truncate">
                  {grp.group}
                </div>
              ) : (
                <div className="w-full h-[1px] bg-[#DDE4DA]/60 my-1" />
              )}

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
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center rounded-[8px] transition-all duration-200 ${
                      isCollapsed
                        ? "justify-center h-10 w-10 mx-auto"
                        : "justify-between px-3 py-2 text-[13px]"
                    } ${
                      isActive
                        ? "bg-[rgba(23,107,77,0.1)] border border-[rgba(23,107,77,0.25)] text-[#176B4D] font-semibold"
                        : "text-[#5C6E63] hover:text-[#202923] hover:bg-[#F8F6EF] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={16}
                        className={`shrink-0 transition-transform ${
                          isActive ? "text-[#176B4D] scale-105" : "text-[#84968B]"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate whitespace-nowrap transition-opacity duration-300">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && isActive && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#176B4D] shrink-0"
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
        <div
          className={`border-t border-[#DDE4DA] flex flex-col gap-2 bg-[#FFFFFF] transition-all duration-300 ${
            isCollapsed ? "p-2 items-center" : "p-3"
          }`}
        >
          {isCollapsed ? (
            <Link
              href="/workspace/status"
              title={`ML Engine: ${engineStatus === "online" ? "Online (Port 8000)" : "Offline"}`}
              className="w-10 h-10 rounded-[8px] bg-[#F8F6EF] border border-[#DDE4DA] flex items-center justify-center transition-all hover:border-[#176B4D]"
            >
              <span className="relative flex h-2.5 w-2.5">
                {engineStatus === "online" ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#176B4D] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#176B4D]" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C84B31]" />
                )}
              </span>
            </Link>
          ) : (
            <>
              <div className="p-[9px_12px] rounded-[8px] bg-[#F8F6EF] border border-[#DDE4DA] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    {engineStatus === "online" ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#176B4D] opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#176B4D]" />
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C84B31]" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="font-sans text-[11.5px] font-semibold text-[#202923] leading-none">
                      ML Engine: {engineStatus === "online" ? "Online" : "Offline"}
                    </div>
                    <div className="font-mono text-[9.5px] text-[#5C6E63] leading-tight mt-1 truncate">
                      Port 8000 • FastDaemon
                    </div>
                  </div>
                </div>
                <Link href="/workspace/settings" className="text-[#5C6E63] hover:text-[#176B4D] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 16 16 12 12 8" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </Link>
              </div>

              <div className="flex items-center justify-between px-1 font-mono text-[9px] text-[#5C6E63]">
                <span>ENV: LOCAL_STUDIO</span>
                <span>BUILD v2.1.0</span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* 2. MAIN SCIENTIFIC WORKSPACE AREA */}
      <div className="workspace-main-area flex-1 flex flex-col min-w-0 overflow-x-hidden bg-[#F8F6EF]">
        {/* Top Research Header Bar */}
        <header className="h-[52px] border-b border-[#DDE4DA] px-4 md:px-6 flex items-center justify-between bg-[#FFFFFF] sticky top-0 z-30 shadow-[0_1px_4px_rgba(32,41,35,0.03)]">
          <div className="flex items-center gap-3 w-full max-w-[480px]">
            {/* Quick Toggle in Navbar if collapsed */}
            {isCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-8 h-8 rounded-[8px] bg-[#F8F6EF] border border-[#DDE4DA] hover:border-[#176B4D] flex items-center justify-center text-[#5C6E63] hover:text-[#176B4D] transition-all cursor-pointer shrink-0 shadow-xs"
                title="Expand Navigation Sidebar"
              >
                <PanelLeftOpen size={16} />
              </button>
            )}

            {/* Wide search field */}
            <div className="relative w-full">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C6E63] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiments, materials, models, properties, papers..."
                className="w-full h-[36px] pl-9.5 pr-14 bg-[#F8F6EF] border border-[#DDE4DA] rounded-[8px] text-[12.5px] text-[#202923] placeholder-[#5C6E63] focus:outline-none focus:border-[#176B4D] transition-all font-sans"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded-[5px] bg-[#FFFFFF] border border-[#DDE4DA] text-[#5C6E63]">
                  ⌘ K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Session Status Items */}
          <div className="flex items-center gap-3">
            {/* Kaggle Remote Router Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#F8F6EF] border border-[#DDE4DA] font-mono text-[11px] text-[#176B4D] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#176B4D]" />
              <span className="hidden sm:inline">Kaggle GPU Router</span>
              <span className="sm:hidden">Kaggle</span>
            </div>

            {/* AI Gateway pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F8F6EF] border border-[#DDE4DA] font-mono text-[11px] text-[#202923]">
              <Zap size={12} className="text-[#176B4D]" />
              <span>Elevate: Active</span>
            </div>

            {/* GPU utilization pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F8F6EF] border border-[#DDE4DA] font-mono text-[11px] text-[#5C6E63]">
              <Cpu size={12} className="text-[#176B4D]" />
              <span>Local GPU 38%</span>
            </div>

            {/* Notification bell */}
            <button
              type="button"
              className="w-8 h-8 rounded-[8px] bg-[#F8F6EF] border border-[#DDE4DA] flex items-center justify-center text-[#5C6E63] hover:text-[#176B4D] transition-all cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={14} />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] bg-[#F8F6EF] border border-[#DDE4DA]">
              <div className="w-5.5 h-5.5 rounded-[6px] bg-[#176B4D] text-[#FFFFFF] flex items-center justify-center font-mono text-[9.5px] font-semibold">
                HR
              </div>
              <span className="font-sans text-[12px] font-medium text-[#202923] hidden sm:block">
                Harsh Rathod
              </span>
              <ChevronDown size={12} className="text-[#5C6E63]" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
