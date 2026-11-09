"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "Overview", href: "#overview" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Methodology", href: "#methodology" },
  { label: "Experiments", href: "/workspace/experiments" },
  { label: "Datasets", href: "/workspace/datasets" },
  { label: "System Status", href: "/workspace/status" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer bg-[#FFFFFF] border border-[#E5EBE5] rounded-[24px] p-8 sm:p-12 mt-16 shadow-xs font-sans">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
        <div className="flex flex-wrap justify-between items-start gap-8">
          <div className="max-w-[420px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#124D32] flex items-center justify-center text-[#FFFFFF] shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                  <path d="m18 9-6-6-6 6"/>
                </svg>
              </div>
              <span className="font-bold text-[19px] text-[#17251D] tracking-tight">
                EvoResearch
              </span>
            </div>
            <p className="text-[13.5px] text-[#65736A] leading-relaxed m-0">
              An enterprise AI research and computational experimentation platform that translates scientific hypotheses into reproducible benchmarks through autonomous multi-agent orchestration.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 sm:gap-16">
            <div>
              <div className="font-mono text-[11px] font-bold text-[#124D32] tracking-wider uppercase mb-3.5">
                PLATFORM
              </div>
              <div className="flex flex-col gap-2.5">
                {navLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-[13px] text-[#65736A] hover:text-[#124D32] transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="font-mono text-[11px] font-bold text-[#124D32] tracking-wider uppercase mb-3.5">
                RESEARCH WORKSPACE
              </div>
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/workspace/experiments/new"
                  className="text-[13px] text-[#65736A] hover:text-[#124D32] transition-colors inline-flex items-center gap-1"
                >
                  <span>Start New Experiment</span>
                  <ArrowUpRight size={12} />
                </Link>
                <Link
                  href="/workspace/orchestration"
                  className="text-[13px] text-[#65736A] hover:text-[#124D32] transition-colors"
                >
                  Agent Orchestration
                </Link>
                <Link
                  href="/workspace/knowledge-graph"
                  className="text-[13px] text-[#65736A] hover:text-[#124D32] transition-colors"
                >
                  Knowledge Graph
                </Link>
                <Link
                  href="/workspace/analytics"
                  className="text-[13px] text-[#65736A] hover:text-[#124D32] transition-colors"
                >
                  Analytics & Trends
                </Link>
                <Link
                  href="/workspace/autopsy"
                  className="text-[13px] text-[#65736A] hover:text-[#124D32] transition-colors"
                >
                  Failure Autopsy
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-[#EDF0EC] pt-6 font-mono text-[11px] text-[#89958D] gap-3">
          <span>© {new Date().getFullYear()} EVORESEARCH PLATFORM · SCIENTIFIC RESEARCH ENVIRONMENT</span>
          <span className="text-[#124D32] font-semibold">CLOSED-LOOP MULTI-AGENT EXECUTION ENGINE</span>
        </div>
      </div>
    </footer>
  );
}
