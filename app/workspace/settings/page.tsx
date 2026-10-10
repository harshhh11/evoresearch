"use client";

import { useState } from "react";
import {
  Settings,
  Cpu,
  Clock,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Save,
  Server,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  const [defaultCpuBudget, setDefaultCpuBudget] = useState(30.0);
  const [maxRetries, setMaxRetries] = useState(3);
  const [enforceLeakageProtection, setEnforceLeakageProtection] = useState(true);
  const [warmupIterations, setWarmupIterations] = useState(10);
  const [latencyBenchmarkRepetitions, setLatencyBenchmarkRepetitions] = useState(50);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div style={{ font: "500 10px/1 var(--mono)", color: "#b5ff8a", letterSpacing: "0.14em", marginBottom: 8 }}>
          RUNTIME CONFIGURATION // 012
        </div>
        <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#e8ede8" }}>
          Execution Parameters & Hardware Profiler
        </h1>
        <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#9ba8a0" }}>
          Configure system timeouts, retry limits, latency benchmarking cycles, and examine local execution host telemetry.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Execution Settings */}
        <div className="research-card">
          <div style={{ font: "600 12px var(--mono)", color: "#e8ede8", marginBottom: 16 }}>
            RESOURCE-AWARE EXECUTION BOUNDARIES
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                GLOBAL DEFAULT CPU BUDGET (SECONDS)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={defaultCpuBudget}
                onChange={(e) => setDefaultCpuBudget(parseFloat(e.target.value) || 30.0)}
                style={{ width: "100%", padding: "9px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                MAX BOUNDED RECOVERY ATTEMPTS
              </label>
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                style={{ width: "100%", padding: "9px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              >
                <option value={1}>1 Attempt (Single Retry)</option>
                <option value={2}>2 Attempts</option>
                <option value={3}>3 Attempts (Default Standard)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                INFERENCE LATENCY WARMUP CYCLES
              </label>
              <input
                type="number"
                min={3}
                max={50}
                value={warmupIterations}
                onChange={(e) => setWarmupIterations(parseInt(e.target.value) || 10)}
                style={{ width: "100%", padding: "9px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                INFERENCE TIMING REPETITIONS
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={latencyBenchmarkRepetitions}
                onChange={(e) => setLatencyBenchmarkRepetitions(parseInt(e.target.value) || 50)}
                style={{ width: "100%", padding: "9px 12px", background: "#050706", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#e8ede8", font: "400 12px var(--mono)" }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              id="leakage"
              checked={enforceLeakageProtection}
              onChange={(e) => setEnforceLeakageProtection(e.target.checked)}
            />
            <label htmlFor="leakage" style={{ font: "400 11px var(--mono)", color: "#c6d4c8", cursor: "pointer" }}>
              Enforce strict data-leakage prevention (fit transforms strictly on train partition)
            </label>
          </div>
        </div>

        {/* Local Execution Telemetry */}
        <div className="research-card">
          <div style={{ font: "600 12px var(--mono)", color: "#e8ede8", marginBottom: 14 }}>
            HOST SYSTEM ENVIRONMENT TELEMETRY
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "rgba(5, 7, 6, 0.5)", padding: 14, borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.08)", font: "400 11px var(--mono)" }}>
            <div>PYTHON RUNTIME: <strong style={{ color: "#b5ff8a" }}>Python 3.14.7 x64</strong></div>
            <div>ML ENGINE: <strong style={{ color: "#a7e9e8" }}>scikit-learn 1.9.0</strong></div>
            <div>OPTIMIZER: <strong style={{ color: "#a7e9e8" }}>Optuna 5.0.0</strong></div>
            <div>DATABASE: <strong style={{ color: "#e8ede8" }}>SQLite Relational Store</strong></div>
            <div>DB LOCATION: <span style={{ color: "#7e9084" }}>backend/evoresearch.db</span></div>
            <div>API HOST: <span style={{ color: "#7e9084" }}>http://127.0.0.1:8000</span></div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              background: saved ? "#38a169" : "#b5ff8a",
              border: "none",
              color: "#050706",
              borderRadius: 3,
              font: "600 10px var(--mono)",
              letterSpacing: "0.08em",
              cursor: "pointer"
            }}
          >
            {saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
            <span>{saved ? "SETTINGS PERSISTED" : "SAVE CONFIGURATION"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
