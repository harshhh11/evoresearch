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
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div>
          <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
            KNOWLEDGE RETENTION // 007
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#e8ede8" }}>
            Failure & Recovery Memory Subsystem
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0" }}>
            Evidence-validated persistent repairs categorized into structured error signatures.
            Only VALIDATED records are automatically applied during autonomous experiment recovery.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: 10, color: "#7e9084" }} />
            <input
              type="text"
              placeholder="Search error signatures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 12px 8px 30px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 11px var(--mono)", width: 220 }}
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
              borderRadius: 2,
              border: filterState === s ? "1px solid #b5ff8a" : "1px solid rgba(226, 239, 229, 0.15)",
              background: filterState === s ? "rgba(181, 255, 138, 0.1)" : "transparent",
              color: filterState === s ? "#b5ff8a" : "#8c9c91",
              font: "500 10px var(--mono)",
              cursor: "pointer"
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Memories Stream */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.length === 0 ? (
          <div className="research-card" style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
            No recovery memory entries matching query.
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="research-card"
              style={{
                borderLeft:
                  m.state === "VALIDATED"
                    ? "3px solid #b5ff8a"
                    : m.state === "REJECTED"
                    ? "3px solid #ff8b8b"
                    : "3px solid #a7e9e8"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <BrainCircuit size={15} color={m.state === "VALIDATED" ? "#b5ff8a" : "#a7e9e8"} />
                    <span style={{ font: "600 13px var(--mono)", color: "#e8ede8" }}>
                      {m.error_category} // {m.model_family}
                    </span>
                  </div>
                  <div style={{ font: "400 10px var(--mono)", color: "#7e9084", marginTop: 4 }}>
                    TASK: {m.task_type.toUpperCase()} | SIGNATURE: {m.error_signature}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className={`status-tag status-tag--${
                      m.state === "VALIDATED"
                        ? "completed"
                        : m.state === "REJECTED"
                        ? "failed"
                        : "running"
                    }`}
                  >
                    {m.state}
                  </span>

                  <div style={{ display: "flex", gap: 4 }}>
                    {m.state !== "VALIDATED" && (
                      <button
                        onClick={() => handleUpdateState(m.id, "VALIDATED")}
                        title="Mark Validated"
                        style={{ padding: "4px 8px", background: "rgba(181, 255, 138, 0.15)", border: "1px solid rgba(181, 255, 138, 0.4)", color: "#b5ff8a", borderRadius: 2, cursor: "pointer", font: "500 9px var(--mono)" }}
                      >
                        VALIDATE
                      </button>
                    )}
                    {m.state !== "REJECTED" && (
                      <button
                        onClick={() => handleUpdateState(m.id, "REJECTED")}
                        title="Mark Rejected"
                        style={{ padding: "4px 8px", background: "rgba(255, 107, 107, 0.15)", border: "1px solid rgba(255, 107, 107, 0.4)", color: "#ff8b8b", borderRadius: 2, cursor: "pointer", font: "500 9px var(--mono)" }}
                      >
                        REJECT
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ font: "400 12px/1.5 var(--body)", color: "#c6d4c8", marginBottom: 12 }}>
                <strong style={{ color: "#e8ede8" }}>Diagnosis:</strong> {m.diagnosis}
              </div>

              {/* Proposed & Actual Repair */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ font: "600 9px var(--mono)", color: "#7e9084", marginBottom: 4 }}>
                    PROPOSED REPAIR SPEC:
                  </div>
                  <pre className="code-box" style={{ margin: 0, maxHeight: 90 }}>
                    {m.proposed_repair}
                  </pre>
                </div>

                <div>
                  <div style={{ font: "600 9px var(--mono)", color: "#b5ff8a", marginBottom: 4 }}>
                    VERIFIED EVIDENCE RESULT:
                  </div>
                  <pre className="code-box" style={{ margin: 0, maxHeight: 90, color: "#b5ff8a" }}>
                    {m.validation_result}
                  </pre>
                </div>
              </div>

              {/* Provenance & Stats */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", font: "400 10px var(--mono)", color: "#7e9084", borderTop: "1px solid rgba(226, 239, 229, 0.06)", paddingTop: 10 }}>
                <span>REUSE COUNT: <strong style={{ color: "#e8ede8" }}>{m.reuse_count}</strong> | SUCCESSES: <strong style={{ color: "#b5ff8a" }}>{m.success_count}</strong></span>
                <span>EVIDENCE: <strong style={{ color: "#a7e9e8" }}>{m.evidence_reference || "Direct Run Validation"}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
