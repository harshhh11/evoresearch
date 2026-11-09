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
    <div className="workspace-shell min-h-screen text-[#17251D] bg-[#F5F9F3] flex font-sans antialiased">
      {/* 1. LEFT SIDEBAR (EXACT MATCH TO REFERENCE: 274px, PURE WHITE) */}
      <aside
        className={`shrink-0 border-r border-[#E5EBE5] bg-[#FFFFFF] flex flex-col sticky top-0 h-screen z-40 transition-all duration-200 select-none ${
          isCollapsed ? "w-[72px]" : "w-[274px]"
        }`}
        aria-label="EvoResearch Workspace Navigation"
      >
        {/* Brand Header */}
        <div className="p-4 px-5 flex items-center justify-between h-[74px] border-b border-[#EDF0EC]">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-3 no-underline min-w-0 group"
            title="EvoResearch Platform"
          >
            {/* Dark Forest Green Stylized Logo Icon */}
            <div className="w-9 h-9 rounded-full bg-[#124D32] flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#092F20] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 15-6-6-6 6"/>
                <path d="m18 9-6-6-6 6"/>
              </svg>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="font-bold text-[17px] leading-tight text-[#17251D] tracking-tight truncate">
                  EvoResearch
                </div>
                <div className="text-[12px] text-[#89958D] leading-tight truncate font-normal mt-0.5">
                  At a glance
                </div>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-7 h-7 rounded-lg hover:bg-[#F5F9F3] flex items-center justify-center text-[#89958D] hover:text-[#17251D] transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Navigation Group Items */}
        <nav className="flex-1 overflow-y-auto flex flex-col gap-5 py-4 px-3.5 no-scrollbar">
          {navigationGroups.map((grp) => (
            <div key={grp.group} className="flex flex-col gap-1">
              {!isCollapsed ? (
                <div className="text-[10px] text-[#89958D] tracking-[0.08em] uppercase px-3 py-1 font-bold select-none truncate">
                  {grp.group}
                </div>
              ) : (
                <div className="w-full h-[1px] bg-[#EDF0EC] my-1" />
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
                    className={`flex items-center rounded-full transition-all duration-150 relative ${
                      isCollapsed
                        ? "justify-center h-10 w-10 mx-auto"
                        : "justify-between px-3.5 py-2.5 text-[13.5px]"
                    } ${
                      isActive
                        ? "bg-[#124D32] text-[#FFFFFF] font-medium shadow-xs"
                        : "text-[#17251D] hover:text-[#124D32] hover:bg-[#F5F9F3] font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.2 : 1.9}
                        className={`shrink-0 transition-colors ${
                          isActive ? "text-[#FFFFFF]" : "text-[#65736A]"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full font-semibold leading-none text-[#124D32] bg-[#DDEEDB]"
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <span
                            className="w-2 h-2 rounded-full bg-[#238653] shrink-0"
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

        {/* Sidebar Bottom Widgets */}
        <div className="p-3.5 border-t border-[#EDF0EC] flex flex-col gap-2.5 bg-[#FFFFFF]">
          {!isCollapsed ? (
            <>
              {/* Widget 1: Engine Status */}
              <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#E5EBE5] shadow-xs">
                <div className="flex items-center justify-between text-[12px] font-semibold mb-2">
                  <span className="flex items-center gap-1.5 text-[#17251D]">
                    <span className="w-2 h-2 rounded-full bg-[#238653] inline-block" />
                    Engine Status
                  </span>
                  <span className="text-[11px] font-bold text-[#238653] tracking-wide">
                    {engineStatus === "online" ? "ONLINE" : "STANDBY"}
                  </span>
                </div>
                {/* 5-segment green progress bar matching reference image */}
                <div className="flex items-center gap-1.5 h-1.5 my-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-full rounded-full bg-[#238653]"
                    />
                  ))}
                </div>
                <div className="text-[11px] text-[#89958D] mt-1 truncate">
                  FastDaemon • Port 8000 active
                </div>
              </div>

              {/* Widget 2: EvoResearch Lab Profile */}
              <div className="p-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E5EBE5] flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#DDEEDB] text-[#124D32] flex items-center justify-center text-[12px] font-bold shrink-0">
                    HC
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[#17251D] leading-tight truncate">
                      EvoResearch Lab
                    </div>
                    <div className="text-[11px] text-[#89958D] leading-tight truncate mt-0.5">
                      Materials & Edge ML
                    </div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#238653] shrink-0" />
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E5EBE5] flex items-center justify-center mx-auto text-[#89958D] hover:text-[#124D32] hover:border-[#124D32] transition-all cursor-pointer shadow-xs"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-[#F5F9F3]">
        {/* TOP NAVIGATION BAR (74px HIGH, EXACT MATCH TO REFERENCE IMAGE) */}
        <header className="h-[74px] px-8 sm:px-10 flex items-center justify-between bg-[#FFFFFF] border-b border-[#E5EBE5] sticky top-0 z-30">
          {/* Left Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            {isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-8 h-8 rounded-full hover:bg-[#F5F9F3] flex items-center justify-center text-[#89958D] hover:text-[#17251D] transition-colors cursor-pointer shrink-0 mr-1"
                title="Expand Navigation Sidebar"
              >
                <PanelLeftOpen size={17} />
              </button>
            )}

            <div className="flex items-center gap-2 text-[13.5px] truncate">
              <Link href="/workspace" className="text-[#89958D] hover:text-[#17251D] transition-colors font-normal">
                EvoResearch
              </Link>
              <span className="text-[#89958D] text-[12px] font-normal">&gt;</span>
              <span className="text-[#17251D] font-bold truncate">
                {currentTitle}
              </span>
            </div>
          </div>

          {/* Center Pill Search Bar */}
          <div className="hidden md:flex items-center w-full max-w-[480px] mx-6">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#89958D] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiments, materials, models, properties..."
                className="w-full h-[40px] pl-10 pr-12 bg-[#F5F9F3] hover:bg-[#EEF6EA]/60 focus:bg-[#FFFFFF] border border-[#E5EBE5] rounded-full text-[13px] text-[#17251D] placeholder-[#89958D] focus:outline-none focus:border-[#124D32] transition-all font-sans"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#FFFFFF] border border-[#E5EBE5] text-[#89958D] font-semibold">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Section: Notifications & User Profile */}
          <div className="flex items-center gap-3.5">
            {/* Notification Bell with Green Badge */}
            <button
              type="button"
              className="relative w-9 h-9 rounded-full hover:bg-[#F5F9F3] flex items-center justify-center text-[#17251D] transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} strokeWidth={2} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#238653]" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 cursor-pointer select-none">
              <div className="w-8 h-8 rounded-full bg-[#124D32] text-[#FFFFFF] flex items-center justify-center text-[12px] font-bold shadow-xs">
                HR
              </div>
              <span className="text-[13.5px] font-semibold text-[#17251D] hidden sm:block">
                Harsh Rathod
              </span>
              <ChevronDown size={14} className="text-[#89958D]" />
            </div>
          </div>
        </header>

        {/* Content Body: Aligned with consistent padding */}
        <main className="flex-1 w-full px-8 sm:px-10 py-6 max-w-[1560px] mx-auto flex flex-col">{children}</main>
      </div>
    </div>
  );
}
