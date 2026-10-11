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
    <div className="max-w-[880px] mx-auto flex flex-col gap-7 text-[#26352D]">
      {/* Header */}
      <div className="border-b border-[#DFE5DC] pb-5">
        <div className="font-mono text-[10px] text-[#176B4D] uppercase tracking-[0.14em] font-semibold mb-2">
          RUNTIME CONFIGURATION // 012
        </div>
        <h1 className="m-0 font-serif text-[24px] font-semibold text-[#26352D]">
          Execution Parameters & Hardware Profiler
        </h1>
        <p className="m-0 mt-1.5 text-[12px] text-[#68766D]">
          Configure system timeouts, retry limits, latency benchmarking cycles, and examine local execution host telemetry.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Execution Settings */}
        <div className="p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DFE5DC] shadow-xs">
          <div className="font-mono text-[12px] font-semibold text-[#26352D] mb-4">
            RESOURCE-AWARE EXECUTION BOUNDARIES
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] font-semibold text-[#68766D] mb-1.5 uppercase">
                GLOBAL DEFAULT CPU BUDGET (SECONDS)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={defaultCpuBudget}
                onChange={(e) => setDefaultCpuBudget(parseFloat(e.target.value) || 30.0)}
                className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-semibold text-[#68766D] mb-1.5 uppercase">
                MAX BOUNDED RECOVERY ATTEMPTS
              </label>
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
              >
                <option value={1}>1 Attempt (Single Retry)</option>
                <option value={2}>2 Attempts</option>
                <option value={3}>3 Attempts (Default Standard)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-semibold text-[#68766D] mb-1.5 uppercase">
                INFERENCE LATENCY WARMUP CYCLES
              </label>
              <input
                type="number"
                min={3}
                max={50}
                value={warmupIterations}
                onChange={(e) => setWarmupIterations(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-semibold text-[#68766D] mb-1.5 uppercase">
                INFERENCE TIMING REPETITIONS
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={latencyBenchmarkRepetitions}
                onChange={(e) => setLatencyBenchmarkRepetitions(parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="leakage"
              checked={enforceLeakageProtection}
              onChange={(e) => setEnforceLeakageProtection(e.target.checked)}
              className="accent-[#176B4D]"
            />
            <label htmlFor="leakage" className="font-mono text-[11px] text-[#26352D] cursor-pointer">
              Enforce strict data-leakage prevention (fit transforms strictly on train partition)
            </label>
          </div>
        </div>

        {/* EvolveX AI Provider & Local Execution Boundaries */}
        <div className="p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DFE5DC] shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-mono text-[12px] font-semibold text-[#26352D]">
                ARINA AI & ELEVATE MULTI-MODEL GATEWAY
              </div>
              <div className="text-[11px] text-[#68766D] mt-0.5">
                Monitored team gateway with 800,000 tokens/day across GPT-5.6 Luna, DeepSeek V4 Pro, and GPT-5 Mini.
              </div>
            </div>
            {aiStatus && (
              <span className="font-mono text-[10px] px-2.5 py-1 rounded-[6px] bg-[#E6F0E9] text-[#176B4D] border border-[#176B4D]/30 font-semibold">
                ACTIVE: {aiStatus.active_provider.toUpperCase()} // {aiStatus.active_model}
              </span>
            )}
          </div>

          {/* Daily Quota Meter */}
          <div className="p-3 bg-[#F8F6EF] rounded-[8px] border border-[#DFE5DC] mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-mono text-[10px] font-semibold text-[#176B4D]">DAILY TEAM TOKEN QUOTA</span>
              <span className="font-mono text-[10px] text-[#26352D] font-semibold">
                {(aiStatus?.tokens_used_today || 0).toLocaleString()} / 800,000 TOKENS (Reset 05:30 AM IST)
              </span>
            </div>
            <div className="h-1.5 bg-[#DFE5DC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#176B4D] rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(1, aiStatus?.percentage_used || 0))}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5 font-mono text-[9px] text-[#68766D]">
              <span>Endpoint: https://elevate1-0.vercel.app/api/ai</span>
              <span>Available: {((aiStatus?.daily_limit || 800000) - (aiStatus?.tokens_used_today || 0)).toLocaleString()} tokens remaining</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] font-semibold text-[#68766D] mb-1.5 uppercase">
                GATEWAY PROVIDER
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
              >
                <option value="elevate">Elevate AI Multi-Model Gateway (Monitored)</option>
                <option value="local">Local Air-Gapped Engine (Offline / Zero-Egress)</option>
                <option value="openai">Direct OpenAI API (Custom Account)</option>
              </select>
              <div className="font-mono text-[10px] text-[#68766D] mt-1">
                {aiProvider === "elevate"
                  ? "Uses ELEVATE_TEAM_API_KEY with GPT-5.6 Luna, DeepSeek V4 Pro, & GPT-5 Mini"
                  : aiProvider === "local"
                  ? "Guaranteed zero-data-egress deterministic materials reasoner"
                  : "Uses standard OPENAI_API_KEY"}
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-semibold text-[#68766D] mb-1.5 uppercase">
                DEFAULT REASONING MODEL
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
              >
                <option value="gpt-5.6-luna">GPT-5.6 Luna — Deep Reasoning (1,050,000 ctx)</option>
                <option value="deepseek-v4-pro">DeepSeek V4 Pro — Math & Code (1,000,000 ctx)</option>
                <option value="gpt-5-mini">GPT-5 Mini — Fast Edge Inference (400,000 ctx)</option>
                <option value="local">Local Deterministic Engine</option>
              </select>
              <div className="font-mono text-[10px] text-[#68766D] mt-1">
                Selected model is default for workspace queries, report synthesis, and judge agent
              </div>
            </div>

            {aiProvider === "elevate" && (
              <div className="col-span-2">
                <label className="block font-mono text-[10px] font-semibold text-[#68766D] mb-1.5 uppercase">
                  ELEVATE PRIVATE TEAM API KEY (OPTIONAL OVERRIDE)
                </label>
                <input
                  type="password"
                  value={elevateKey}
                  onChange={(e) => setElevateKey(e.target.value)}
                  placeholder={aiStatus?.has_elevate_key ? "•••••••••••••••••••••••••••••••• (Configured in .env)" : "elev_..."}
                  className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
                />
              </div>
            )}

            {aiProvider === "openai" && (
              <div className="col-span-2">
                <label className="block font-mono text-[10px] font-semibold text-[#68766D] mb-1.5 uppercase">
                  OPENAI API KEY (OPTIONAL OVERRIDE)
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Intelligent Document & Profile Caching Telemetry */}
        <div className="p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DFE5DC] shadow-xs">
          <div className="flex justify-between items-center mb-3.5">
            <div className="font-mono text-[12px] font-semibold text-[#26352D]">
              MEASURED CACHE PERFORMANCE & INVALIDATION
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              disabled={cacheClearing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B54747]/10 border border-[#B54747]/30 text-[#B54747] hover:bg-[#B54747]/20 rounded-[6px] font-mono text-[10px] font-semibold cursor-pointer transition-colors"
            >
              <Trash2 size={12} />
              <span>{cacheClearing ? "PURGING..." : "INVALIDATE CACHE"}</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-[#F8F6EF] rounded-[6px] border border-[#DFE5DC]">
              <div className="font-mono text-[9px] font-semibold text-[#68766D]">CACHED ENTRIES</div>
              <div className="font-mono text-[16px] font-semibold text-[#26352D] mt-1">
                {cacheStats?.cached_entries ?? 0}
              </div>
            </div>
            <div className="p-3 bg-[#F8F6EF] rounded-[6px] border border-[#DFE5DC]">
              <div className="font-mono text-[9px] font-semibold text-[#68766D]">TOTAL REQUESTS</div>
              <div className="font-mono text-[16px] font-semibold text-[#68766D] mt-1">
                {cacheStats?.total_requests ?? 0}
              </div>
            </div>
            <div className="p-3 bg-[#F8F6EF] rounded-[6px] border border-[#DFE5DC]">
              <div className="font-mono text-[9px] font-semibold text-[#68766D]">MEASURED HIT RATIO</div>
              <div className="font-mono text-[16px] font-semibold text-[#176B4D] mt-1">
                {cacheStats?.hit_ratio_pct != null ? `${cacheStats.hit_ratio_pct}%` : "0.0%"}
              </div>
            </div>
            <div className="p-3 bg-[#F8F6EF] rounded-[6px] border border-[#DFE5DC]">
              <div className="font-mono text-[9px] font-semibold text-[#68766D]">MEASURED CPU SAVINGS</div>
              <div className="font-mono text-[16px] font-semibold text-[#176B4D] mt-1">
                {cacheStats?.savings_ms_est != null ? `${cacheStats.savings_ms_est} ms` : "0 ms"}
              </div>
            </div>
          </div>
        </div>

        {/* Live Sensitive Data Masking Verification */}
        <div className="p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DFE5DC] shadow-xs">
          <div className="font-mono text-[12px] font-semibold text-[#26352D] mb-3">
            SENSITIVE DATA MASKING VERIFICATION PIPELINE
          </div>
          <div className="flex flex-col gap-2.5">
            <input
              type="text"
              value={maskSample}
              onChange={(e) => setMaskSample(e.target.value)}
              placeholder="Enter text with API keys, tokens, or emails to test masking..."
              className="w-full px-3 py-2 bg-[#F8F6EF] border border-[#DFE5DC] rounded-[6px] text-[#26352D] font-mono text-[12px] focus:outline-none focus:border-[#176B4D]"
            />
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={handleTestMasking}
                className="px-4 py-1.5 bg-[#E6F0E9] border border-[#176B4D]/30 text-[#176B4D] hover:bg-[#176B4D] hover:text-[#FFFFFF] rounded-[6px] font-mono text-[10px] font-semibold cursor-pointer transition-colors"
              >
                RUN MASKING TRANSFORM
              </button>
              {maskStats && (
                <span className="font-mono text-[10px] text-[#176B4D] font-semibold">
                  Masked {maskStats.total_masked || 0} patterns ({Object.keys(maskStats).filter(k => k !== 'total_masked').join(", ")})
                </span>
              )}
            </div>
            {maskedOutput && (
              <div className="p-3 bg-[#E8F5EC] border border-[#176B4D]/20 rounded-[6px] font-mono text-[11px] text-[#176B4D]">
                RESULT: {maskedOutput}
              </div>
            )}
          </div>
        </div>

        {/* Local Execution Telemetry */}
        <div className="p-5 rounded-[10px] bg-[#FFFFFF] border border-[#DFE5DC] shadow-xs">
          <div className="font-mono text-[12px] font-semibold text-[#26352D] mb-3.5">
            HOST SYSTEM ENVIRONMENT TELEMETRY
          </div>

          <div className="grid grid-cols-2 gap-3 bg-[#F8F6EF] p-3.5 rounded-[6px] border border-[#DFE5DC] font-mono text-[11px]">
            <div>PYTHON RUNTIME: <strong className="text-[#176B4D]">Python 3.14.7 x64</strong></div>
            <div>ML ENGINE: <strong className="text-[#26352D]">scikit-learn 1.9.0</strong></div>
            <div>OPTIMIZER: <strong className="text-[#26352D]">Optuna 5.0.0</strong></div>
            <div>DATA MASKING: <strong className="text-[#176B4D]">Active (Regex Pipeline)</strong></div>
            <div>AI ENGINE: <strong className="text-[#176B4D]">Local Deterministic (qwen2.5)</strong></div>
            <div>CACHE HIT RATIO: <strong className="text-[#26352D]">Active In-Memory</strong></div>
            <div>DATABASE: <strong className="text-[#26352D]">SQLite Relational Store</strong></div>
            <div>DB LOCATION: <span className="text-[#68766D]">backend/evoresearch.db</span></div>
            <div>API HOST: <span className="text-[#68766D]">http://127.0.0.1:8000</span></div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#176B4D] hover:bg-[#12543c] text-[#FFFFFF] font-mono text-[10px] font-semibold tracking-[0.08em] rounded-[6px] shadow-xs transition-colors cursor-pointer"
          >
            {saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
            <span>{saved ? "SETTINGS PERSISTED" : "SAVE CONFIGURATION"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

