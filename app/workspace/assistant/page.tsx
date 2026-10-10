"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  api,
  Dataset,
  PlatformStats,
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
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  provider?: string;
  model?: string;
  cached?: boolean;
}

const PROMPT_SUGGESTIONS = [
  "Analyze band gap Pareto frontier trade-offs on NOMAD 2018.",
  "Diagnose singular matrix LinAlgError on unregularized Ridge regressions.",
  "Compare Random Forest Regressor vs HistGradientBoosting for Matbench gap expt.",
  "Recommend next candidate architectures within a 50ms latency budget.",
];

export default function ArinaAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      role: "assistant",
      content:
        "Hello! I am ARINA, your materials science ML reasoning agent. I am grounded in your persisted experiments, NOMAD 2018, and Matbench datasets. How can I help you analyze Pareto trade-offs, diagnose training failures, or suggest model architectures?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      provider: "local",
      model: "qwen2.5-coder-7b-instruct-local",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Provider Status
  const [providerStatus, setProviderStatus] = useState<{
    status: string;
    active_provider: string;
    active_model: string;
    is_local_only: boolean;
    has_openai_key: boolean;
  } | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
    // Load live AI provider status & datasets
    api.getAIStatus()
      .then((st) => setProviderStatus(st))
      .catch(() =>
        setProviderStatus({
          status: "offline",
          active_provider: "local",
          active_model: "qwen2.5-coder-7b-instruct-local",
          is_local_only: true,
          has_openai_key: false,
        })
      );

    api.getDatasets()
      .then((ds) => {
        setDatasets(ds);
        if (ds.length > 0) setSelectedDatasetId(ds[0].id);
      })
      .catch(() => {});
  }, []);

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
      const systemPrompt = `You are ARINA, the Materials Informatics Lead AI assistant in EvoResearch.
Active Dataset: ${activeDataset?.name || "NOMAD 2018 Transparent Conductors"} (Task: ${activeDataset?.task_type || "regression"}, Target: ${activeDataset?.target_col || "bandgap_energy_ev"}).
Context: RandomForestRegressor (best MAE 0.1239 eV, R² 0.9544), Ridge (repaired with alpha=1.0).
Ground all advice in measured MAE, RMSE, R², inference latency, and verified failure recovery outcomes. Do not hallucinate or use classification metrics for regression band gap tasks.`;

      const response = await api.generateAICompletion(userMsg.content, systemPrompt, true);

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        provider: response.provider || providerStatus?.active_provider || "local",
        model: response.model || providerStatus?.active_model || "qwen2.5-coder-7b-instruct-local",
        cached: response.cached,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("ARINA completion failed:", err);
      setErrorMessage(
        err.message ||
          "Failed to connect to AI reasoning service. Check if FastAPI daemon is running on port 8000."
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

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] max-w-[1300px] mx-auto p-4 md:p-6 text-[#F2F0E8] font-sans">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#34352F] shrink-0">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#B69A72] uppercase tracking-[0.14em]">
            <Sparkles size={13} />
            <span>SCIENTIFIC AGENTIC INTELLIGENCE</span>
          </div>
          <h1 className="text-[22px] font-semibold text-[#F2F0E8] m-0 tracking-[-0.01em] mt-0.5">
            ARINA Materials Science Assistant
          </h1>
          <p className="text-[12px] text-[#AAA99F] mt-0.5 m-0">
            Domain-grounded reasoning engine for lattice dynamics, electronic structure, and Pareto trade-off optimization.
          </p>
        </div>

        {/* Status Indicators & Dataset Context */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Grounding Dataset Select */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#191A18] border border-[#34352F] text-[11px] font-mono">
            <Database size={11} className="text-[#B69A72]" />
            <span className="text-[#77786F]">CONTEXT:</span>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="bg-transparent text-[#F2F0E8] focus:outline-none cursor-pointer max-w-[180px] truncate"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#191A18]">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Provider Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#141513] border border-[#34352F] font-mono text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                providerStatus?.status === "online" ? "bg-[#8EA58C]" : "bg-[#B69A72]"
              }`}
            />
            <span className="text-[#AAA99F]">
              PROVIDER:{" "}
              <strong className="text-[#F2F0E8]">
                {providerStatus?.active_provider === "openai" ? "OPENAI (GPT-4o)" : "LOCAL AIR-GAPPED"}
              </strong>
            </span>
            <Link href="/workspace/settings" className="text-[#B69A72] hover:underline ml-1" title="Configure AI Provider">
              <Sliders size={11} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() =>
              setMessages([
                {
                  id: "msg-reset",
                  role: "assistant",
                  content: "Conversation history cleared. Ready for new scientific queries.",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  provider: providerStatus?.active_provider,
                  model: providerStatus?.active_model,
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
                {msg.provider && (
                  <>
                    <span>•</span>
                    <span className="text-[#B69A72]">
                      {msg.model ? msg.model.split("-")[0] : msg.provider}
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
              <span className="text-[#B69A72]">REASONING</span>
            </div>
            <div className="p-3.5 rounded-[10px] bg-[#191A18] border border-[#34352F] rounded-tl-none flex items-center gap-2 text-[12px] text-[#AAA99F]">
              <RefreshCw size={13} className="animate-spin text-[#B69A72]" />
              <span>Analyzing materials science evidence & formulating prediction insight...</span>
            </div>
          </div>
        )}

        {/* Error Callout */}
        {errorMessage && (
          <div className="p-3.5 rounded-[8px] bg-[#C77F72]/15 border border-[#C77F72]/40 text-[#C77F72] text-[12px] flex items-start justify-between gap-3 font-mono">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div>
                <strong>Inference Failure:</strong> {errorMessage}
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
          SUGGESTIONS:
        </span>
        {PROMPT_SUGGESTIONS.map((s, idx) => (
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
            placeholder="Ask ARINA about band gap MAE convergence, feature engineering, or failure recovery..."
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
          <span>Zero external telemetry egress in Local Air-Gapped mode.</span>
        </div>
      </form>
    </div>
  );
}
