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
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div>
          <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
            COLLABORATION SUITE // 010
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#e8ede8" }}>
            Collaborative Research Workspace
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0" }}>
            Team membership, role-based experiment access, peer claim reviews, and auditable decisions.
          </p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="research-card">
        <div style={{ font: "600 12px var(--mono)", color: "#e8ede8", marginBottom: 16 }}>
          PROJECT MEMBERS & PERMISSION MATRIX ({team.length} ACTIVE RESEARCHERS)
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {team.map((member) => (
            <div
              key={member.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: "rgba(5, 7, 6, 0.5)",
                border: "1px solid rgba(226, 239, 229, 0.08)",
                borderRadius: 3
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(181, 255, 138, 0.12)", color: "#b5ff8a", display: "grid", placeContent: "center", font: "600 11px var(--mono)" }}>
                  {member.avatar}
                </div>
                <div>
                  <div style={{ font: "600 13px var(--body)", color: "#e8ede8" }}>{member.name}</div>
                  <div style={{ font: "400 10px var(--mono)", color: "#7e9084" }}>{member.email}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ font: "500 11px var(--mono)", color: "#a7e9e8" }}>{member.role}</div>
                  <div style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>{member.access}</div>
                </div>
                <span className="status-tag status-tag--completed">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Research Ownership */}
      <div className="research-card">
        <div style={{ font: "600 12px var(--mono)", color: "#e8ede8", marginBottom: 14 }}>
          SHARED PROJECT ACCESS POLICIES
        </div>
        <p style={{ font: "400 12px/1.6 var(--body)", color: "#9ba8a0", margin: "0 0 16px" }}>
          Every experiment execution, failure recovery patch, and metric logged within projects is automatically attributed
          and cryptographically auditable in the system timeline.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {projects.map((p) => (
            <div key={p.id} style={{ background: "rgba(5, 7, 6, 0.5)", padding: 14, borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.08)" }}>
              <div style={{ font: "600 12px var(--mono)", color: "#e8ede8", marginBottom: 4 }}>{p.name}</div>
              <div style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>SHARED WITH 3 TEAM MEMBERS</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
