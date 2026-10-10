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
  Users,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { ReactNode, useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/workspace", icon: LayoutDashboard },
  { name: "Experiments", href: "/workspace/experiments/new", icon: FlaskConical },
  { name: "Datasets", href: "/workspace/datasets", icon: Database },
  { name: "AI Assistant", href: "/workspace#assistant", icon: Sparkles },
  { name: "Research Memory", href: "/workspace/memory", icon: BrainCircuit },
  { name: "Papers & Insights", href: "/workspace/papers", icon: BookOpen },
  { name: "Workspace", href: "/workspace/optimization", icon: Cpu },
  { name: "Reports", href: "/workspace/reports", icon: FileText },
  { name: "Team", href: "/workspace/team", icon: Users },
  { name: "Settings", href: "/workspace/settings", icon: Settings },
];

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="workspace-shell">
      {/* 1. LEFT SIDEBAR */}
      <aside className="workspace-sidebar" aria-label="Sidebar Navigation">
        {/* Top Brand Identity */}
        <div className="p-[22px_20px_20px] border-b border-[#1c2420]">
          <Link href="/" className="inline-flex items-center gap-3 no-underline group">
            <div className="w-9 h-9 rounded-full bg-[#141d18] border border-[#233128] flex items-center justify-center transition-colors group-hover:border-[#384e40]">
              <Image src="/evo-mark.svg" alt="EvoResearch Symbol" width={20} height={20} priority />
            </div>
            <div>
              <div className="font-mono font-bold text-[12px] leading-tight tracking-[0.14em] text-[#e7e5de]">
                EVORESEARCH
              </div>
              <div className="font-mono text-[7px] text-[#737b74] tracking-[0.09em] mt-1 uppercase">
                An Evolving AI Research Environment
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-[14px_12px] overflow-y-auto flex flex-col gap-1" aria-label="Workspace Pages">
          {navigation.map((item) => {
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
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={16}
                    className={isActive ? "text-[#a2b5a0]" : "text-[#737b74] group-hover:text-[#a5aaa4]"}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#85b888] shadow-[0_0_8px_rgba(133,184,136,0.8)] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Status Card & Footer */}
        <div className="p-[14px_16px_16px] border-t border-[#1c2420] flex flex-col gap-3">
          {/* Operational Pill Card */}
          <div className="p-[10px_12px] rounded-[10px] bg-[#111715] border border-[#202924] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#85b888] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#85b888]" />
              </span>
              <div className="min-w-0">
                <div className="font-sans text-[11px] font-medium text-[#e7e5de] leading-none">Engine Ready</div>
                <div className="font-sans text-[9px] text-[#737b74] leading-tight mt-1 truncate">All systems operational</div>
              </div>
            </div>
            <ChevronRight size={13} className="text-[#737b74] shrink-0" />
          </div>

          {/* Version descriptor */}
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[9px] text-[#737b74]">v2.0.0</span>
            <span className="font-sans text-[9px] text-[#5a635c]">Evolving Research Together</span>
          </div>

          {/* Subtle wavy particle line SVG aura */}
          <div className="w-full h-5 overflow-hidden opacity-40 -mt-1" aria-hidden="true">
            <svg viewBox="0 0 240 20" fill="none" className="w-full h-full stroke-[#85b888]">
              <path
                d="M0 10 Q 30 2, 60 10 T 120 10 T 180 10 T 240 10"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
              <path
                d="M0 10 Q 30 18, 60 10 T 120 10 T 180 10 T 240 10"
                strokeWidth="0.75"
                strokeOpacity="0.3"
              />
            </svg>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="workspace-main-area">
        {/* Top Navigation Bar */}
        <header className="workspace-topbar" aria-label="Top Navigation">
          {/* Global Search */}
          <div className="relative w-full max-w-[460px]">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737b74] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments, datasets, papers, or ask anything..."
              className="w-full h-[38px] pl-10 pr-14 bg-[#111715] border border-[#202924] rounded-[8px] text-[12px] text-[#e7e5de] placeholder-[#5a635c] focus:outline-none focus:border-[#3a493f] transition-colors"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <kbd className="font-mono text-[9.5px] px-1.5 py-0.5 rounded bg-[#161f1a] border border-[#242e28] text-[#737b74]">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* Right Profile & Notifications */}
          <div className="flex items-center gap-3">
            {/* Notifications Button */}
            <button
              type="button"
              className="relative w-9 h-9 rounded-[8px] bg-[#111715] border border-[#202924] flex items-center justify-center text-[#737b74] hover:text-[#e7e5de] hover:border-[#2f3d34] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={15} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#85b888]" />
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] bg-[#111715] border border-[#202924] cursor-pointer hover:border-[#2f3d34] transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#1b2520] border border-[#26352c] flex items-center justify-center font-mono text-[10px] font-semibold text-[#e7e5de]">
                HR
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-sans text-[11px] font-medium text-[#e7e5de] leading-none">
                  Harsh Rathod
                </div>
                <div className="font-sans text-[9px] text-[#737b74] leading-tight mt-0.5">
                  Researcher
                </div>
              </div>
              <ChevronDown size={13} className="text-[#737b74] ml-0.5" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
