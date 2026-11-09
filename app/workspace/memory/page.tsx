"use client";

import { useEffect, useState } from "react";
import { api, RecoveryMemory } from "@/lib/api";
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";

export default function MemoryBankPage() {
  const [memories, setMemories] = useState<RecoveryMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const loadMemories = async () => {
    try {
      const list = await api.getMemory();
      setMemories(list);
    } catch (err) {
      console.error("Failed to load recovery memories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleUpdateState = async (id: string, newState: string) => {
    try {
      await api.validateMemory(id, newState);
      await loadMemories();
    } catch (err: any) {
      alert(err.message || "Failed to update memory state");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#65736A" }}>
        ACCESSING PERSISTENT RESEARCH RECOVERY BANK...
      </div>
    );
  }

  const filtered = memories.filter((m) => {
    const matchesState = filterState === "ALL" || m.state === filterState;
    const matchesSearch =
      !search ||
      m.error_category.toLowerCase().includes(search.toLowerCase()) ||
      m.error_signature.toLowerCase().includes(search.toLowerCase()) ||
      m.model_family.toLowerCase().includes(search.toLowerCase()) ||
      m.diagnosis.toLowerCase().includes(search.toLowerCase());
    return matchesState && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "4px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid #E5EBE5", paddingBottom: 16 }}>
        <div>
          <div style={{ font: "600 10px/1 var(--mono)", color: "#124D32", letterSpacing: "0.14em", marginBottom: 6 }}>
            KNOWLEDGE RETENTION // 007
          </div>
          <h1 style={{ margin: 0, font: "600 22px/1.2 var(--font-primary), serif", color: "#17251D" }}>
            Failure & Recovery Memory Subsystem
          </h1>
          <p style={{ margin: "4px 0 0", font: "400 12px/1.5 var(--font-primary), serif", color: "#65736A" }}>
            Evidence-validated persistent repairs categorized into structured error signatures.
            Only VALIDATED records are automatically applied during autonomous experiment recovery.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "#65736A" }} />
            <input
              type="text"
              placeholder="Search error signatures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 12px 8px 30px", background: "#FFFFFF", border: "1px solid #E5EBE5", borderRadius: 6, color: "#17251D", font: "400 11px var(--mono)", width: 230 }}
            />
          </div>
        </div>
      </div>

      {/* State Filter Bar */}
      <div style={{ display: "flex", gap: 8 }}>
        {(["ALL", "VALIDATED", "UNVERIFIED", "PROPOSED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterState(s)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: filterState === s ? "1px solid #124D32" : "1px solid #E5EBE5",
              background: filterState === s ? "#124D32" : "#FFFFFF",
              color: filterState === s ? "#FFFFFF" : "#65736A",
              font: filterState === s ? "600 10px var(--mono)" : "500 10px var(--mono)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Memories Stream */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 ? (
          <div className="research-card" style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#65736A", background: "#FFFFFF", border: "1px solid #E5EBE5", borderRadius: 8 }}>
            No recovery memory entries matching query.
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="research-card"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5EBE5",
                borderRadius: 10,
                padding: 16,
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                borderLeft:
                  m.state === "VALIDATED"
                    ? "4px solid #124D32"
                    : m.state === "REJECTED"
                    ? "4px solid #B54747"
                    : "4px solid #A66B22"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <BrainCircuit size={16} color={m.state === "VALIDATED" ? "#124D32" : "#65736A"} />
                    <span style={{ font: "600 13px var(--mono)", color: "#17251D" }}>
                      {m.error_category} // {m.model_family}
                    </span>
                  </div>
                  <div style={{ font: "400 10px var(--mono)", color: "#65736A", marginTop: 4 }}>
                    TASK: {m.task_type.toUpperCase()} | SIGNATURE: {m.error_signature}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 6,
                      font: "600 10px var(--mono)",
                      letterSpacing: "0.06em",
                      background: m.state === "VALIDATED" ? "#EEF6EA" : m.state === "REJECTED" ? "#FDF2F2" : "#FEF3C7",
                      color: m.state === "VALIDATED" ? "#124D32" : m.state === "REJECTED" ? "#B54747" : "#92400E",
                      border: m.state === "VALIDATED" ? "1px solid #124D32" : m.state === "REJECTED" ? "1px solid #B54747" : "1px solid #F59E0B"
                    }}
                  >
                    {m.state}
                  </span>

                  <div style={{ display: "flex", gap: 6 }}>
                    {m.state !== "VALIDATED" && (
                      <button
                        onClick={() => handleUpdateState(m.id, "VALIDATED")}
                        title="Mark Validated"
                        style={{ padding: "4px 12px", background: "#FFFFFF", border: "1px solid #124D32", color: "#124D32", borderRadius: 6, cursor: "pointer", font: "600 10px var(--mono)", transition: "all 0.15s ease" }}
                      >
                        VALIDATE
                      </button>
                    )}
                    {m.state !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateState(m.id, "REJECTED")}
                        title="Mark Rejected"
                        style={{ padding: "4px 12px", background: "#FFFFFF", border: "1px solid #E5EBE5", color: "#B54747", borderRadius: 6, cursor: "pointer", font: "600 10px var(--mono)", transition: "all 0.15s ease" }}
                      >
                        REJECT
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ font: "400 12.5px/1.5 var(--font-primary), serif", color: "#17251D", marginBottom: 12 }}>
                <strong style={{ color: "#124D32" }}>Diagnosis:</strong> {m.diagnosis}
              </div>

              {/* Proposed & Actual Repair */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ font: "600 9px var(--mono)", color: "#65736A", marginBottom: 4 }}>
                    PROPOSED REPAIR SPEC:
                  </div>
                  <pre style={{ margin: 0, padding: 10, background: "#F8F6EF", border: "1px solid #E5EBE5", borderRadius: 6, font: "400 11px var(--mono)", color: "#17251D", maxHeight: 90, overflowY: "auto" }}>
                    {m.proposed_repair}
                  </pre>
                </div>

                <div>
                  <div style={{ font: "600 9px var(--mono)", color: "#124D32", marginBottom: 4 }}>
                    VERIFIED EVIDENCE RESULT:
                  </div>
                  <pre style={{ margin: 0, padding: 10, background: "#E8F5EC", border: "1px solid #124D32", borderRadius: 6, font: "500 11px var(--mono)", color: "#124D32", maxHeight: 90, overflowY: "auto" }}>
                    {m.validation_result}
                  </pre>
                </div>
              </div>

              {/* Provenance & Stats */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", font: "400 10px var(--mono)", color: "#65736A", borderTop: "1px solid #E5EBE5", paddingTop: 10 }}>
                <span>REUSE COUNT: <strong style={{ color: "#17251D" }}>{m.reuse_count}</strong> | SUCCESSES: <strong style={{ color: "#124D32" }}>{m.success_count}</strong></span>
                <span>EVIDENCE: <strong style={{ color: "#124D32" }}>{m.evidence_reference || "Direct Run Validation"}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
