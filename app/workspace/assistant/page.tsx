"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  api,
  Dataset,
  AIStatus,
} from "@/lib/api";
import {
  Sparkles,
  Send,
  RefreshCw,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Database,
  Layers,
  ChevronRight,
  ExternalLink,
  Zap,
  Activity,
  Code2,
  Atom,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  provider?: string;
  model?: string;
  cached?: boolean;
  tokens_used?: number;
}

const MODEL_OPTIONS = [
  {
    id: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    subtitle: "Deep Scientific Reasoning (1.05M ctx)",
    badge: "DEEP REASONING",
    icon: Atom,
  },
  {
    id: "deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    subtitle: "Code & Math Synthesis (1.0M ctx)",
    badge: "MATH & CODE",
    icon: Code2,
  },
  {
    id: "gpt-5-mini",
    label: "GPT-5 Mini",
    subtitle: "Fast Edge Inference (400K ctx)",
    badge: "SUB-SECOND",
    icon: Zap,
  },
  {
    id: "local",
    label: "Local Deterministic",
    subtitle: "Air-Gapped Offline Engine",
    badge: "AIR-GAPPED",
    icon: Cpu,
  },
];

const PROMPT_SUGGESTIONS_BY_MODEL: Record<string, string[]> = {
  "gpt-5.6-luna": [
    "Analyze band gap Pareto frontier trade-offs on NOMAD 2018 transparent conductors.",
    "Derive physical mechanisms causing variance between experimental and DFT band gaps in Matbench.",
    "Synthesize multi-objective selection criteria between MAE accuracy and 50ms edge latency budget.",
    "Evaluate cross-validation split leakage risk when lattice volume descriptors are correlated.",
  ],
  "deepseek-v4-pro": [
    "Diagnose singular matrix LinAlgError on unregularized Ridge regressions and provide scikit-learn fix.",
    "Write Python pipeline code for Cholesky solver with training-only StandardScaler to avoid leakage.",
    "Implement automated Optuna trial pruning for HistGradientBoostingRegressor on band gap regression.",
    "Diagnose ill-conditioned covariance matrix when lattice parameters a, b, c have collinearity.",
  ],
  "gpt-5-mini": [
    "Recommend top 2 fast estimators for NOMAD 2018 within a 20ms latency envelope.",
    "Compare RandomForest vs ExtraTrees inference speed for real-time sensor screening.",
    "Quick validation: Is R² 0.9544 statistically sound with 0.1239 eV MAE on band gaps?",
    "Summarize current platform recovery stats and active failure memories.",
  ],
  "local": [
    "Analyze band gap Pareto frontier trade-offs on NOMAD 2018.",
    "Diagnose singular matrix LinAlgError on unregularized Ridge regressions.",
    "Compare Random Forest Regressor vs HistGradientBoosting for Matbench gap expt.",
    "Recommend next candidate architectures within a 50ms latency budget.",
  ],
};

export default function ArinaAssistantPage() {
  const [selectedModel, setSelectedModel] = useState<string>("gpt-5.6-luna");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      role: "assistant",
      content:
        "Hello! I am ARINA (Autonomous Research & Informatics Neural Agent). Powered by the Elevate AI Gateway with multi-model intelligence (GPT-5.6 Luna, DeepSeek V4 Pro, GPT-5 Mini), I am domain-trained on materials informatics, NOMAD 2018 transparent conductors, and Matbench experimental band gaps.\n\nSelect any model from the toolbar above to tailor reasoning between deep theoretical analysis, code & mathematical repair, or low-latency edge inference.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      provider: "elevate",
      model: "gpt-5.6-luna",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Provider Status & Token Quota
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const loadStatus = () => {
    api.getAIStatus()
      .then((st) => {
        setAiStatus(st);
        if (st.active_model && MODEL_OPTIONS.some(m => m.id === st.active_model)) {
          setSelectedModel(st.active_model);
        }
      })
      .catch(() => {
        setAiStatus(null);
      });
  };

  useEffect(() => {
    loadStatus();
    api.getDatasets()
      .then((ds) => {
        setDatasets(ds);
        if (ds.length > 0) setSelectedDatasetId(ds[0].id);
      })
      .catch(() => {});
  }, []);

  const handleModelChange = async (newModel: string) => {
    setSelectedModel(newModel);
    try {
      const provider = newModel === "local" ? "local" : "elevate";
      await api.updateAIConfig({
        provider,
        model: newModel,
      });
      loadStatus();
    } catch (e) {
      console.error("Failed to update active model:", e);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsThinking(true);
    setErrorMessage(null);

    const activeDataset = datasets.find((d) => d.id === selectedDatasetId);
    try {
      const systemPrompt = `You are ARINA (Autonomous Research & Informatics Neural Agent) in EvoResearch.
Active Model: ${selectedModel}.
Active Dataset: ${activeDataset?.name || "NOMAD 2018 Transparent Conductors"} (Task: ${activeDataset?.task_type || "regression"}, Target: ${activeDataset?.target_col || "bandgap_energy_ev"}).
Benchmark Telemetry:
- RandomForestRegressor: MAE 0.1239 eV, R² 0.9544 (Pareto optimal for accuracy)
- Ridge Regressor: MAE 0.2139 eV, latency 3.1 ms (Pareto optimal for low-latency screening, repaired via alpha=1.0)
- Matbench Experimental Gap: HistGradientBoosting MAE 0.4410 eV vs RandomForest MAE 0.4735 eV
Zero leakage rule: Scalers fitted strictly on training splits. Ground all assertions in verified metrics.`;

      const response = await api.generateAICompletion(
        userMsg.content,
        systemPrompt,
        true,
        selectedModel
      );

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: response.provider || "elevate",
        model: response.model || selectedModel,
        cached: response.cached,
        tokens_used: response.tokens_used,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      // Refresh token counter
      loadStatus();
    } catch (err: any) {
      console.error("ARINA completion failed:", err);
      setErrorMessage(
        err.message ||
          "Failed to connect to Elevate AI Gateway. Verify FastAPI backend is running on port 8000."
      );
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const currentSuggestions = PROMPT_SUGGESTIONS_BY_MODEL[selectedModel] || PROMPT_SUGGESTIONS_BY_MODEL["gpt-5.6-luna"];
  const currentModelMeta = MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] max-w-[1300px] mx-auto p-4 md:p-6 text-[#F2F0E8] font-sans">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col gap-3 pb-4 border-b border-[#34352F] shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#B69A72] uppercase tracking-[0.14em]">
              <Sparkles size={13} />
              <span>ARINA AI // ELEVATE MULTI-MODEL GATEWAY</span>
            </div>
            <h1 className="text-[22px] font-semibold text-[#F2F0E8] m-0 tracking-[-0.01em] mt-0.5">
              ARINA Materials Science Assistant
            </h1>
            <p className="text-[12px] text-[#AAA99F] mt-0.5 m-0">
              Autonomous reasoning across crystal lattices, band gaps, failure recovery, and multi-objective Pareto trade-offs.
            </p>
          </div>

          {/* Model Selector & Live Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Model Selector Dropdown */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#191A18] border border-[#34352F] text-[11px] font-mono">
              <span className="text-[#B69A72] font-semibold">MODEL:</span>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="bg-transparent text-[#F2F0E8] focus:outline-none cursor-pointer font-medium"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#191A18] text-[#F2F0E8]">
                    {m.label} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Grounding Dataset Select */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#191A18] border border-[#34352F] text-[11px] font-mono">
              <Database size={11} className="text-[#B69A72]" />
              <span className="text-[#77786F]">DATASET:</span>
              <select
                value={selectedDatasetId}
                onChange={(e) => setSelectedDatasetId(e.target.value)}
                className="bg-transparent text-[#F2F0E8] focus:outline-none cursor-pointer max-w-[160px] truncate"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#191A18]">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    id: "msg-reset",
                    role: "assistant",
                    content: "Conversation history cleared. Ready for scientific queries.",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    provider: selectedModel === "local" ? "local" : "elevate",
                    model: selectedModel,
                  },
                ])
              }
              className="p-2 rounded-[8px] bg-[#191A18] border border-[#34352F] hover:border-[#B69A72] text-[#AAA99F] hover:text-[#F2F0E8] transition-colors"
              title="Clear Chat History"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Live Token Usage & Model Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-[8px] bg-[#121311] border border-[#34352F]/70 text-[11px] font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#AAA99F]">
              <currentModelMeta.icon size={13} className="text-[#B69A72]" />
              <span className="font-semibold text-[#F2F0E8]">{currentModelMeta.label}:</span>
              <span className="text-[#8EA58C]">{currentModelMeta.subtitle}</span>
            </div>
          </div>

          {/* Daily Elevate Quota Tracker */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity size={12} className="text-[#8EA58C]" />
              <span className="text-[#77786F]">DAILY TOKEN QUOTA:</span>
              <span className="text-[#F2F0E8] font-semibold">
                {(aiStatus?.tokens_used_today || 0).toLocaleString()} / 800,000
              </span>
              <div className="w-16 h-1.5 bg-[#252623] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8EA58C] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(2, aiStatus?.percentage_used || 0))}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] text-[#77786F] border-l border-[#34352F] pl-2.5">
              Reset 05:30 AM IST
            </span>
          </div>
        </div>
      </div>

      {/* 2. Chat Conversation Viewport */}
      <div className="flex-1 overflow-y-auto my-4 pr-1 flex flex-col gap-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                isUser ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              {/* Sender Name & Meta */}
              <div className="flex items-center gap-2 mb-1 px-1 font-mono text-[10px] text-[#77786F]">
                <span>{isUser ? "YOU" : "ARINA AGENT"}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.model && (
                  <>
                    <span>•</span>
                    <span className="text-[#B69A72] font-semibold">
                      {msg.model}
                    </span>
                  </>
                )}
                {msg.tokens_used !== undefined && (
                  <>
                    <span>•</span>
                    <span className="text-[#8EA58C]">
                      {msg.tokens_used} tokens
                    </span>
                  </>
                )}
                {msg.cached && (
                  <span className="px-1 py-0.2 rounded bg-[#8EA58C]/15 text-[#8EA58C] text-[9px]">
                    CACHED
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-[10px] text-[13px] leading-relaxed relative group ${
                  isUser
                    ? "bg-[#20211E] text-[#F2F0E8] border border-[#34352F] rounded-tr-none"
                    : "bg-[#191A18] text-[#F2F0E8] border border-[#34352F] rounded-tl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Copy action */}
                <button
                  type="button"
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="absolute right-2 top-2 p-1 rounded bg-[#141513] text-[#77786F] hover:text-[#F2F0E8] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy message"
                >
                  {copiedId === msg.id ? <Check size={11} className="text-[#8EA58C]" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex flex-col mr-auto max-w-[80%] items-start">
            <div className="flex items-center gap-2 mb-1 px-1 font-mono text-[10px] text-[#77786F]">
              <span>ARINA AGENT</span>
              <span>•</span>
              <span className="text-[#B69A72]">REASONING WITH {selectedModel.toUpperCase()}</span>
            </div>
            <div className="p-3.5 rounded-[10px] bg-[#191A18] border border-[#34352F] rounded-tl-none flex items-center gap-2.5 text-[12px] text-[#AAA99F]">
              <RefreshCw size={13} className="animate-spin text-[#B69A72]" />
              <span>Querying Elevate AI gateway & formulating grounded materials science response...</span>
            </div>
          </div>
        )}

        {/* Error Callout */}
        {errorMessage && (
          <div className="p-3.5 rounded-[8px] bg-[#C77F72]/15 border border-[#C77F72]/40 text-[#C77F72] text-[12px] flex items-start justify-between gap-3 font-mono">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div>
                <strong>Gateway Error:</strong> {errorMessage}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="px-2.5 py-1 rounded bg-[#C77F72]/20 hover:bg-[#C77F72]/30 text-[#F2F0E8] text-[10px] uppercase font-semibold shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Suggestions Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 no-scrollbar">
        <span className="font-mono text-[9px] text-[#77786F] uppercase tracking-[0.1em] shrink-0 mr-1">
          SUGGESTIONS ({currentModelMeta.badge}):
        </span>
        {currentSuggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(s)}
            disabled={isThinking}
            className="px-2.5 py-1 rounded-[6px] bg-[#191A18] hover:bg-[#20211E] border border-[#34352F] hover:border-[#B69A72] text-[11px] text-[#AAA99F] hover:text-[#F2F0E8] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* 4. Input Composer Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-1 relative shrink-0"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isThinking}
            placeholder={`Ask ARINA (${currentModelMeta.label}) about band gaps, singular matrix repair, or latency budgets...`}
            className="w-full h-[46px] pl-4 pr-24 bg-[#191A18] border border-[#34352F] rounded-[10px] text-[13px] text-[#F2F0E8] placeholder-[#77786F] focus:outline-none focus:border-[#B69A72] transition-colors font-sans disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-[34px] px-3.5 rounded-[7px] bg-[#B69A72] text-[#101110] font-sans text-[12px] font-semibold hover:bg-[#C8AE87] transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>SEND</span>
            <Send size={12} />
          </button>
        </div>
        <div className="flex items-center justify-between px-1 mt-1 font-mono text-[9.5px] text-[#77786F]">
          <span>Grounded in active SQLite and Supabase experiment runs.</span>
          <span>Elevate Gateway token budget: 800,000 tokens/day reset at 05:30 AM IST.</span>
        </div>
      </form>
    </div>
  );
}
