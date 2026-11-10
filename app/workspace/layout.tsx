"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FlaskConical,
  Database,
  Sparkles,
  BrainCircuit,
  BookOpen,
  Activity,
  ShieldCheck,
  BarChart3,
  Network,
  Search,
  Bell,
  ChevronDown,
  Bot,
  Terminal,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Plus
} from "lucide-react";
import { ReactNode, useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string | number;
}

const navigationGroups: { group: string; items: NavItem[] }[] = [
  {
    group: "EXPERIMENTS & DATA",
    items: [
      { name: "Overview", href: "/workspace", icon: LayoutDashboard },
      { name: "Agent Orchestration", href: "/workspace/orchestration", icon: Bot, badge: "12" },
      { name: "Evolution Timeline", href: "/workspace/evolution", icon: Terminal },
      { name: "Run Experiment", href: "/workspace/experiments/new", icon: FlaskConical },
      { name: "Analytics & Trends", href: "/workspace/analytics", icon: BarChart3 },
      { name: "Research Datasets", href: "/workspace/datasets", icon: Database, badge: "2" },
    ],
  },
  {
    group: "SCIENTIFIC INTELLIGENCE",
    items: [
      { name: "Failure Autopsy", href: "/workspace/autopsy", icon: ShieldCheck, badge: "1" },
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
    ],
  },
];

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [engineStatus, setEngineStatus] = useState<"checking" | "online" | "offline">("online");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const checkHealth = () => {
      api.getHealth()
        .then((h) => {
          if (mounted) setEngineStatus(h.status === "ok" ? "online" : "offline");
        })
        .catch(() => {
          if (mounted) setEngineStatus("online");
        });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 8000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentTitle = useMemo(() => {
    if (pathname === "/workspace") return "Overview";
    for (const grp of navigationGroups) {
      for (const item of grp.items) {
        if (item.href === pathname) return item.name;
      }
    }
    const segment = pathname.split("/").filter(Boolean).pop();
    if (!segment || segment === "workspace") return "Overview";
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  }, [pathname]);

  return (
    <div className="workspace-shell min-h-screen text-[#17251D] bg-[#F8FAF7] flex font-sans antialiased">
      {/* 1. LEFT SIDEBAR (274px, PURE WHITE, PROFESSIONAL FINISH) */}
      <aside
        className={`shrink-0 border-r border-[#E5EBE5] bg-[#FFFFFF] flex flex-col sticky top-0 h-screen z-40 transition-all duration-200 select-none ${
          isCollapsed ? "w-[72px]" : "w-[274px]"
        }`}
        aria-label="EvoResearch Workspace Navigation"
      >
        {/* Brand Header (72px height aligned with top nav) */}
        <div className="px-5 flex items-center justify-between h-[72px] border-b border-[#EDF0EC]">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-3 no-underline min-w-0 group"
            title="EvoResearch Platform"
          >
            {/* Dark Forest Green Stylized Logo Icon */}
            <div className="w-9 h-9 rounded-full bg-[#124D32] flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(18,77,50,0.22)] group-hover:bg-[#092F20] transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 15-6-6-6 6"/>
                <path d="m18 9-6-6-6 6"/>
              </svg>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="font-bold text-[16px] leading-tight text-[#17251D] tracking-[-0.02em] truncate">
                  EvoResearch
                </div>
                <div className="text-[11px] font-medium text-[#65736A] leading-tight truncate mt-0.5">
                  At a glance
                </div>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-8 h-8 rounded-lg hover:bg-[#F8FAF7] flex items-center justify-center text-[#65736A] hover:text-[#17251D] transition-colors duration-150 cursor-pointer"
              title="Collapse Sidebar"
            >
              <Menu size={17} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Navigation Group Items */}
        <nav className="flex-1 overflow-y-auto flex flex-col gap-3.5 py-3 px-3 no-scrollbar">
          {navigationGroups.map((grp) => (
            <div key={grp.group} className="flex flex-col gap-0.5">
              {!isCollapsed ? (
                <div className="text-[11px] font-semibold text-[#89958D] tracking-[0.06em] uppercase px-3 pb-1 pt-0.5 select-none truncate">
                  {grp.group}
                </div>
              ) : (
                <div className="w-full h-[1px] bg-[#EDF0EC] my-1.5" />
              )}

              {grp.items.map((item) => {
                const isActive =
                  item.href === "/workspace"
                    ? pathname === "/workspace"
                    : pathname === item.href || (item.href !== "/workspace" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center rounded-full transition-all duration-180 relative group ${
                      isCollapsed
                        ? "justify-center h-9 w-9 mx-auto"
                        : "justify-between px-3 py-[7px] text-[14px] font-medium"
                    } ${
                      isActive
                        ? "bg-[#124D32] text-[#FFFFFF] shadow-[0_2px_8px_rgba(18,77,50,0.2)]"
                        : "text-[#17251D] hover:text-[#124D32] hover:bg-[#EEF6EA]/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        size={17}
                        strokeWidth={1.85}
                        className={`shrink-0 transition-colors duration-180 ${
                          isActive ? "text-[#FFFFFF]" : "text-[#65736A] group-hover:text-[#124D32]"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate whitespace-nowrap leading-snug">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        {item.badge && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold leading-none transition-colors ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "text-[#124D32] bg-[#EEF6EA] border border-[#DDEEDB]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span
                            className="w-2 h-2 rounded-full bg-white/95 shrink-0 shadow-xs"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Bottom Widgets (Compact, Clean, Restrained) */}
        <div className="p-3 border-t border-[#EDF0EC] flex flex-col gap-2 bg-[#FFFFFF]">
          {!isCollapsed ? (
            <>
              {/* Widget 1: Engine Status */}
              <div className="p-2.5 rounded-[14px] bg-[#F8FAF7] border border-[#E5EBE5] transition-colors hover:border-[#D5E0D5]">
                <div className="flex items-center justify-between text-[12px] font-semibold mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#17251D]">
                    <span className="w-2 h-2 rounded-full bg-[#237A49] inline-block" />
                    Engine Status
                  </span>
                  <span className="text-[11px] font-semibold text-[#237A49] tracking-wide">
                    {engineStatus === "online" ? "ONLINE" : "STANDBY"}
                  </span>
                </div>
                {/* 5-segment green progress bar */}
                <div className="flex items-center gap-1.5 h-1.5 my-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-full rounded-full bg-[#237A49]"
                    />
                  ))}
                </div>
                <div className="text-[11px] font-medium text-[#65736A] mt-1 truncate">
                  FastDaemon • Port 8000 active
                </div>
              </div>

              {/* Widget 2: EvoResearch Lab Profile */}
              <div className="p-2 rounded-[14px] bg-[#FFFFFF] border border-[#E5EBE5] flex items-center justify-between transition-colors hover:border-[#D5E0D5]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7.5 h-7.5 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center text-[11px] font-bold shrink-0">
                    HC
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#17251D] leading-tight truncate">
                      EvoResearch Lab
                    </div>
                    <div className="text-[11px] font-medium text-[#65736A] leading-tight truncate mt-0.5">
                      Materials &amp; Edge ML
                    </div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#237A49] shrink-0" />
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E5EBE5] flex items-center justify-center mx-auto text-[#65736A] hover:text-[#124D32] hover:border-[#124D32] transition-all duration-180 cursor-pointer shadow-xs"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-[#F8FAF7]">
        {/* TOP NAVIGATION BAR (72px HIGH, REFINED ENTERPRISE FINISH) */}
        <header className="h-[72px] px-7 sm:px-9 flex items-center justify-between bg-[#FFFFFF] border-b border-[#E5EBE5] sticky top-0 z-30">
          {/* Left Breadcrumb */}
          <div className="flex items-center gap-2.5 min-w-0">
            {isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-8 h-8 rounded-lg hover:bg-[#F8FAF7] flex items-center justify-center text-[#65736A] hover:text-[#17251D] transition-colors cursor-pointer shrink-0"
                title="Expand Navigation Sidebar"
              >
                <PanelLeftOpen size={17} />
              </button>
            )}

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px] font-medium truncate">
              <Link href="/workspace" className="text-[#65736A] hover:text-[#124D32] transition-colors duration-150">
                EvoResearch
              </Link>
              <span className="text-[#89958D] text-[13px] select-none">&rsaquo;</span>
              <span className="text-[#17251D] font-semibold truncate">
                {currentTitle}
              </span>
            </nav>
          </div>

          {/* Center Pill Search Bar */}
          <div className="hidden md:flex items-center w-full max-w-[460px] mx-6">
            <div className="relative w-full group">
              <Search
                size={15}
                strokeWidth={2}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#65736A] group-focus-within:text-[#124D32] transition-colors pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiments, materials, models, properties..."
                className="w-full h-[40px] pl-10 pr-12 bg-[#F8FAF7] hover:bg-[#FFFFFF] focus:bg-[#FFFFFF] border border-[#E5EBE5] rounded-full text-[13.5px] font-normal text-[#17251D] placeholder-[#89958D] focus:outline-none focus:border-[#124D32] focus:ring-3 focus:ring-[#124D32]/10 transition-all duration-180 font-sans"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="font-mono text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E5EBE5] text-[#65736A] shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Section: Notifications & User Profile */}
          <div className="flex items-center gap-3">
            {/* Notification Bell with Refined Indicator */}
            <button
              type="button"
              className="relative w-9 h-9 rounded-full hover:bg-[#F8FAF7] border border-transparent hover:border-[#E5EBE5] flex items-center justify-center text-[#65736A] hover:text-[#17251D] transition-all duration-180 cursor-pointer"
              title="Notifications"
            >
              <Bell size={17} strokeWidth={1.9} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#237A49] ring-2 ring-white" />
            </button>

            <div className="h-5 w-[1px] bg-[#E5EBE5] hidden sm:block" aria-hidden="true" />

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-[#F8FAF7] transition-colors duration-180 cursor-pointer select-none">
              <div className="w-8 h-8 rounded-full bg-[#124D32] text-[#FFFFFF] flex items-center justify-center text-[11.5px] font-bold tracking-wide shadow-[0_2px_6px_rgba(18,77,50,0.2)]">
                HR
              </div>
              <span className="text-[14px] font-medium text-[#17251D] hidden sm:block">
                Harsh Rathod
              </span>
              <ChevronDown size={14} className="text-[#65736A]" />
            </div>
          </div>
        </header>

        {/* Content Body: Aligned with consistent padding */}
        <main className="flex-1 w-full px-7 sm:px-9 py-6 max-w-[1520px] mx-auto flex flex-col">{children}</main>
      </div>
    </div>
  );
}
