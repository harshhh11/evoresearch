"use client";

import { useEffect, useState } from "react";
import { api, AuditEvent } from "@/lib/api";
import {
  Activity,
  ShieldAlert,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";

export default function AuditTimelinePage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getAudit();
        setEvents(list);
      } catch (err) {
        console.error("Failed to load audit events:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", font: "400 12px var(--mono)", color: "#8c9c91" }}>
        DECRYPTING SYSTEM AUDIT LOG...
      </div>
    );
  }

  const filtered = events.filter((e) => filterType === "ALL" || e.entity_type === filterType);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div>
          <div style={{ font: "500 10px/1 var(--mono)", color: "#B69A72", letterSpacing: "0.14em", marginBottom: 8 }}>
            PROVENANCE INTEGRITY // 011
          </div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#F2F0E8" }}>
            Activity & Experiment Audit Timeline
          </h1>
          <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#AAA99F" }}>
            Append-only audit trail logging every configuration creation, state transition, failure diagnosis, and repair verification.
          </p>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {(["ALL", "PROJECT", "EXPERIMENT", "OPTIMIZATION", "MEMORY"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: "6px 12px",
                borderRadius: 2,
                border: filterType === t ? "1px solid #B69A72" : "1px solid rgba(226, 239, 229, 0.15)",
                background: filterType === t ? "rgba(182, 154, 114, 0.1)" : "transparent",
                color: filterType === t ? "#B69A72" : "#8c9c91",
                font: "500 10px var(--mono)",
                cursor: "pointer"
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Events Timeline */}
      <div className="research-card">
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", font: "400 11px var(--mono)", color: "#7e9084" }}>
            No audit events found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "12px 16px",
                  background: "rgba(5, 7, 6, 0.5)",
                  border: "1px solid rgba(226, 239, 229, 0.08)",
                  borderRadius: 3
                }}
              >
                <div style={{ marginTop: 2 }}>
                  <Activity size={15} color="#B69A72" />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ font: "600 11px var(--mono)", color: "#F2F0E8" }}>
                        {e.entity_type} {e.action}
                      </span>
                      <span style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>
                        ID: {e.entity_id.substring(0, 8)}...
                      </span>
                    </div>

                    <span style={{ font: "400 9px var(--mono)", color: "#7e9084" }}>
                      {new Date(e.timestamp).toLocaleTimeString()} · {new Date(e.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="code-box" style={{ padding: "6px 10px", margin: "6px 0 0", maxHeight: 60 }}>
                    {e.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
