"use client";

import { useEffect, useState } from "react";
import { api, Project } from "@/lib/api";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Mail,
  Key,
  FolderLock,
  Sparkles,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Lead Researcher" | "ML Systems Engineer" | "Research Reviewer";
  access: "Full Administrator" | "Read & Execute" | "Auditor";
  avatar: string;
}

const SAMPLE_TEAM: TeamMember[] = [
  {
    id: "1",
    name: "Dr. Aris Thorne",
    email: "aris.thorne@evoresearch.org",
    role: "Lead Researcher",
    access: "Full Administrator",
    avatar: "AT",
  },
  {
    id: "2",
    name: "Maya Lin",
    email: "m.lin@evoresearch.org",
    role: "ML Systems Engineer",
    access: "Read & Execute",
    avatar: "ML",
  },
  {
    id: "3",
    name: "Elena Vance",
    email: "e.vance@evoresearch.org",
    role: "Research Reviewer",
    access: "Auditor",
    avatar: "EV",
  },
];

export default function TeamWorkspacePage() {
  const [team, setTeam] = useState<TeamMember[]>(SAMPLE_TEAM);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const pList = await api.getProjects();
        setProjects(pList);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-7 text-[#26352D]">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-[#DFE5DC] pb-5">
        <div>
          <div className="font-mono text-[10px] text-[#176B4D] uppercase tracking-[0.14em] font-semibold mb-2">
            COLLABORATION SUITE // 010
          </div>
          <h1 className="m-0 font-serif text-[24px] font-semibold text-[#26352D]">
            Collaborative Research Workspace
          </h1>
          <p className="m-0 mt-1.5 text-[12px] text-[#68766D]">
            Team membership, role-based experiment access, peer claim reviews, and auditable decisions.
          </p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DFE5DC] shadow-xs">
        <div className="font-mono text-[12px] font-semibold text-[#26352D] mb-4">
          PROJECT MEMBERS & PERMISSION MATRIX ({team.length} ACTIVE RESEARCHERS)
        </div>

        <div className="flex flex-col gap-3">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3.5 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[8px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#E6F0E9] text-[#176B4D] grid place-content-center font-mono font-semibold text-[11px] border border-[#176B4D]/20">
                  {member.avatar}
                </div>
                <div>
                  <div className="font-serif font-semibold text-[13px] text-[#26352D]">{member.name}</div>
                  <div className="font-mono text-[10px] text-[#68766D]">{member.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-right">
                  <div className="font-mono text-[11px] font-semibold text-[#176B4D]">{member.role}</div>
                  <div className="font-mono text-[9px] text-[#68766D]">{member.access}</div>
                </div>
                <span className="px-2.5 py-1 rounded-[6px] bg-[#E8F5EC] text-[#176B4D] border border-[#176B4D]/20 font-mono text-[10px] font-semibold">
                  ACTIVE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Research Ownership */}
      <div className="p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DFE5DC] shadow-xs">
        <div className="font-mono text-[12px] font-semibold text-[#26352D] mb-3.5">
          SHARED PROJECT ACCESS POLICIES
        </div>
        <p className="text-[12px] leading-relaxed text-[#68766D] mb-4">
          Every experiment execution, failure recovery patch, and metric logged within projects is automatically attributed
          and cryptographically auditable in the system timeline.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {projects.map((p) => (
            <div key={p.id} className="bg-[#F8F6EF] p-3.5 rounded-[8px] border border-[#DFE5DC]">
              <div className="font-mono text-[12px] font-semibold text-[#26352D] mb-1">{p.name}</div>
              <div className="font-mono text-[9px] text-[#68766D]">SHARED WITH 3 TEAM MEMBERS</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

