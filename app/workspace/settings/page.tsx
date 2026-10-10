"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
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
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const [defaultCpuBudget, setDefaultCpuBudget] = useState(30.0);
  const [maxRetries, setMaxRetries] = useState(3);
  const [enforceLeakageProtection, setEnforceLeakageProtection] = useState(true);
  const [warmupIterations, setWarmupIterations] = useState(10);
  const [latencyBenchmarkRepetitions, setLatencyBenchmarkRepetitions] = useState(50);
  const [saved, setSaved] = useState(false);

  // Real AI Provider & Cache States
  const [aiProvider, setAiProvider] = useState<"elevate" | "local" | "openai">("elevate");
  const [aiModel, setAiModel] = useState("gpt-5.6-luna");
  const [elevateKey, setElevateKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [maskSample, setMaskSample] = useState("api_key: elev_Y4l3Mx6ldrXLPATRAqZrADmv5GT9q0rQnF1sMN3fdu0, contact: researcher@materials-institute.org");
  const [maskedOutput, setMaskedOutput] = useState("");
  const [maskStats, setMaskStats] = useState<any>(null);

  const loadLiveStats = async () => {
    try {
      const [ai, cache] = await Promise.all([
        api.getAIStatus().catch(() => null),
        api.getCacheStats().catch(() => null),
      ]);
      if (ai) {
        setAiStatus(ai);
        setAiProvider((ai.active_provider as any) || "elevate");
        if (ai.active_model) setAiModel(ai.active_model);
      }
      if (cache) {
        setCacheStats(cache);
      }
    } catch (e) {
      console.error("Failed to load settings telemetry:", e);
    }
  };

  useEffect(() => {
    loadLiveStats();
  }, []);

  const handleClearCache = async () => {
    setCacheClearing(true);
    try {
      await api.clearCache();
      const updated = await api.getCacheStats();
      setCacheStats(updated);
    } catch (err: any) {
      alert("Failed to clear cache: " + err.message);
    } finally {
      setCacheClearing(false);
    }
  };

  const handleTestMasking = async () => {
    try {
      const res = await api.maskSensitiveData(maskSample);
      setMaskedOutput(res.masked_text);
      setMaskStats(res.masking_stats);
    } catch (err: any) {
      alert("Masking error: " + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAIConfig({
        provider: aiProvider,
        model: aiModel,
        openai_api_key: openaiKey || undefined,
        elevate_api_key: elevateKey || undefined,
      });
      await loadLiveStats();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert("Failed to persist configuration: " + err.message);
    }
  };


  return (
    <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(226, 239, 229, 0.08)", paddingBottom: 20 }}>
        <div style={{ font: "500 10px/1 var(--mono)", color: "#B69A72", letterSpacing: "0.14em", marginBottom: 8 }}>
          RUNTIME CONFIGURATION // 012
        </div>
        <h1 style={{ margin: 0, font: "600 24px/1.2 var(--body)", color: "#F2F0E8" }}>
          Execution Parameters & Hardware Profiler
        </h1>
        <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--body)", color: "#AAA99F" }}>
          Configure system timeouts, retry limits, latency benchmarking cycles, and examine local execution host telemetry.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Execution Settings */}
        <div className="research-card">
          <div style={{ font: "600 12px var(--mono)", color: "#F2F0E8", marginBottom: 16 }}>
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
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                MAX BOUNDED RECOVERY ATTEMPTS
              </label>
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
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
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
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
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
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

        {/* EvolveX AI Provider & Local Execution Boundaries */}
        {/* Elevate AI Gateway & Model Selector */}
        <div className="research-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ font: "600 12px var(--mono)", color: "#F2F0E8" }}>
                ARINA AI & ELEVATE MULTI-MODEL GATEWAY
              </div>
              <div style={{ font: "400 11px var(--body)", color: "#AAA99F", marginTop: 2 }}>
                Monitored team gateway with 800,000 tokens/day across GPT-5.6 Luna, DeepSeek V4 Pro, and GPT-5 Mini.
              </div>
            </div>
            {aiStatus && (
              <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-[#8EA58C]/15 text-[#8EA58C] border border-[#8EA58C]/30 font-semibold">
                ACTIVE: {aiStatus.active_provider.toUpperCase()} // {aiStatus.active_model}
              </span>
            )}
          </div>

          {/* Daily Quota Meter */}
          <div style={{ padding: "12px 14px", background: "rgba(10, 12, 11, 0.6)", borderRadius: 4, border: "1px solid rgba(226, 239, 229, 0.08)", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ font: "600 10px var(--mono)", color: "#B69A72" }}>DAILY TEAM TOKEN QUOTA</span>
              <span style={{ font: "500 10px var(--mono)", color: "#F2F0E8" }}>
                {(aiStatus?.tokens_used_today || 0).toLocaleString()} / 800,000 TOKENS (Reset 05:30 AM IST)
              </span>
            </div>
            <div style={{ height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: "#8EA58C",
                  borderRadius: 3,
                  width: `${Math.min(100, Math.max(1, aiStatus?.percentage_used || 0))}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, font: "400 9px var(--mono)", color: "#7e9084" }}>
              <span>Endpoint: https://elevate1-0.vercel.app/api/ai</span>
              <span>Available: {((aiStatus?.daily_limit || 800000) - (aiStatus?.tokens_used_today || 0)).toLocaleString()} tokens remaining</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                GATEWAY PROVIDER
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as any)}
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              >
                <option value="elevate">Elevate AI Multi-Model Gateway (Monitored)</option>
                <option value="local">Local Air-Gapped Engine (Offline / Zero-Egress)</option>
                <option value="openai">Direct OpenAI API (Custom Account)</option>
              </select>
              <div style={{ font: "400 10px var(--mono)", color: "#7e9084", marginTop: 4 }}>
                {aiProvider === "elevate"
                  ? "Uses ELEVATE_TEAM_API_KEY with GPT-5.6 Luna, DeepSeek V4 Pro, & GPT-5 Mini"
                  : aiProvider === "local"
                  ? "Guaranteed zero-data-egress deterministic materials reasoner"
                  : "Uses standard OPENAI_API_KEY"}
              </div>
            </div>

            <div>
              <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                DEFAULT REASONING MODEL
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
              >
                <option value="gpt-5.6-luna">GPT-5.6 Luna — Deep Reasoning (1,050,000 ctx)</option>
                <option value="deepseek-v4-pro">DeepSeek V4 Pro — Math & Code (1,000,000 ctx)</option>
                <option value="gpt-5-mini">GPT-5 Mini — Fast Edge Inference (400,000 ctx)</option>
                <option value="local">Local Deterministic Engine</option>
              </select>
              <div style={{ font: "400 10px var(--mono)", color: "#7e9084", marginTop: 4 }}>
                Selected model is default for workspace queries, report synthesis, and judge agent
              </div>
            </div>

            {aiProvider === "elevate" && (
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  ELEVATE PRIVATE TEAM API KEY (OPTIONAL OVERRIDE)
                </label>
                <input
                  type="password"
                  value={elevateKey}
                  onChange={(e) => setElevateKey(e.target.value)}
                  placeholder={aiStatus?.has_elevate_key ? "•••••••••••••••••••••••••••••••• (Configured in .env)" : "elev_..."}
                  style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
                />
              </div>
            )}

            {aiProvider === "openai" && (
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", font: "500 10px var(--mono)", color: "#7e9084", marginBottom: 6 }}>
                  OPENAI API KEY (OPTIONAL OVERRIDE)
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Intelligent Document & Profile Caching Telemetry */}
        <div className="research-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ font: "600 12px var(--mono)", color: "#F2F0E8" }}>
              MEASURED CACHE PERFORMANCE & INVALIDATION
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              disabled={cacheClearing}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "rgba(199, 127, 114, 0.15)",
                border: "1px solid rgba(199, 127, 114, 0.4)",
                color: "#C77F72",
                borderRadius: 3,
                font: "600 10px var(--mono)",
                cursor: "pointer",
              }}
            >
              <Trash2 size={12} />
              <span>{cacheClearing ? "PURGING..." : "INVALIDATE CACHE"}</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <div style={{ padding: 12, background: "rgba(5, 7, 6, 0.5)", borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.08)" }}>
              <div style={{ font: "500 9px var(--mono)", color: "#7e9084" }}>CACHED ENTRIES</div>
              <div style={{ font: "600 16px var(--mono)", color: "#F2F0E8", marginTop: 4 }}>
                {cacheStats?.cached_entries ?? 0}
              </div>
            </div>
            <div style={{ padding: 12, background: "rgba(5, 7, 6, 0.5)", borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.08)" }}>
              <div style={{ font: "500 9px var(--mono)", color: "#7e9084" }}>TOTAL REQUESTS</div>
              <div style={{ font: "600 16px var(--mono)", color: "#AAA99F", marginTop: 4 }}>
                {cacheStats?.total_requests ?? 0}
              </div>
            </div>
            <div style={{ padding: 12, background: "rgba(5, 7, 6, 0.5)", borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.08)" }}>
              <div style={{ font: "500 9px var(--mono)", color: "#7e9084" }}>MEASURED HIT RATIO</div>
              <div style={{ font: "600 16px var(--mono)", color: "#8EA58C", marginTop: 4 }}>
                {cacheStats?.hit_ratio_pct != null ? `${cacheStats.hit_ratio_pct}%` : "0.0%"}
              </div>
            </div>
            <div style={{ padding: 12, background: "rgba(5, 7, 6, 0.5)", borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.08)" }}>
              <div style={{ font: "500 9px var(--mono)", color: "#7e9084" }}>MEASURED CPU SAVINGS</div>
              <div style={{ font: "600 16px var(--mono)", color: "#B69A72", marginTop: 4 }}>
                {cacheStats?.savings_ms_est != null ? `${cacheStats.savings_ms_est} ms` : "0 ms"}
              </div>
            </div>
          </div>
        </div>

        {/* Live Sensitive Data Masking Verification */}
        <div className="research-card">
          <div style={{ font: "600 12px var(--mono)", color: "#F2F0E8", marginBottom: 12 }}>
            SENSITIVE DATA MASKING VERIFICATION PIPELINE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="text"
              value={maskSample}
              onChange={(e) => setMaskSample(e.target.value)}
              placeholder="Enter text with API keys, tokens, or emails to test masking..."
              style={{ width: "100%", padding: "9px 12px", background: "#101110", border: "1px solid rgba(226, 239, 229, 0.15)", borderRadius: 3, color: "#F2F0E8", font: "400 12px var(--mono)" }}
            />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={handleTestMasking}
                style={{ padding: "7px 16px", background: "rgba(182, 154, 114, 0.15)", border: "1px solid rgba(182, 154, 114, 0.4)", color: "#B69A72", borderRadius: 3, font: "600 10px var(--mono)", cursor: "pointer" }}
              >
                RUN MASKING TRANSFORM
              </button>
              {maskStats && (
                <span style={{ font: "400 10px var(--mono)", color: "#8EA58C" }}>
                  Masked {maskStats.total_masked || 0} patterns ({Object.keys(maskStats).filter(k => k !== 'total_masked').join(", ")})
                </span>
              )}
            </div>
            {maskedOutput && (
              <div style={{ padding: "8px 12px", background: "rgba(5, 7, 6, 0.6)", border: "1px solid rgba(142, 165, 140, 0.3)", borderRadius: 3, font: "400 11px var(--mono)", color: "#F2F0E8" }}>
                RESULT: {maskedOutput}
              </div>
            )}
          </div>
        </div>


        {/* Local Execution Telemetry */}
        <div className="research-card">
          <div style={{ font: "600 12px var(--mono)", color: "#F2F0E8", marginBottom: 14 }}>
            HOST SYSTEM ENVIRONMENT TELEMETRY
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "rgba(5, 7, 6, 0.5)", padding: 14, borderRadius: 3, border: "1px solid rgba(226, 239, 229, 0.08)", font: "400 11px var(--mono)" }}>
            <div>PYTHON RUNTIME: <strong style={{ color: "#B69A72" }}>Python 3.14.7 x64</strong></div>
            <div>ML ENGINE: <strong style={{ color: "#a7e9e8" }}>scikit-learn 1.9.0</strong></div>
            <div>OPTIMIZER: <strong style={{ color: "#a7e9e8" }}>Optuna 5.0.0</strong></div>
            <div>DATA MASKING: <strong style={{ color: "#8EA58C" }}>Active (Regex Pipeline)</strong></div>
            <div>AI ENGINE: <strong style={{ color: "#B69A72" }}>Local Deterministic (qwen2.5)</strong></div>
            <div>CACHE HIT RATIO: <strong style={{ color: "#a7e9e8" }}>Active In-Memory</strong></div>
            <div>DATABASE: <strong style={{ color: "#F2F0E8" }}>SQLite Relational Store</strong></div>
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
              background: saved ? "#38a169" : "#B69A72",
              border: "none",
              color: "#101110",
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
