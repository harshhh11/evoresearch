"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";

export function WorkspaceCTA() {
  return (
    <div className="workspace-actions flex flex-wrap items-center justify-center gap-4 py-8">
      <Link
        href="/workspace"
        className="px-8 py-4 rounded-full bg-[#124D32] hover:bg-[#092F20] text-[#FFFFFF] font-sans text-[14px] font-semibold flex items-center gap-2.5 shadow-sm transition-all"
      >
        <span>OPEN RESEARCH WORKSPACE</span>
        <ArrowUpRight size={16} />
      </Link>
      <a
        href="#methodology"
        className="px-8 py-4 rounded-full bg-[#FFFFFF] hover:bg-[#F5F9F3] text-[#17251D] border border-[#E5EBE5] font-sans text-[14px] font-medium flex items-center gap-2.5 shadow-xs transition-all"
      >
        <span>EXPLORE THE METHODOLOGY</span>
        <ArrowDown size={15} className="text-[#65736A]" />
      </a>
    </div>
  );
}
