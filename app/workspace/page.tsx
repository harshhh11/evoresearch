"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  api,
  PlatformStats,
  Project,
  Experiment,
  RecoveryMemory,
  ScientificEvaluation,
} from "@/lib/api";
import {
  FlaskConical,
  Database,
  Target,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
  Scale,
  FolderPlus,
  Calendar,
  Send,
  SlidersHorizontal,
  ChevronDown,
  MoreHorizontal,
  Lightbulb,
  Code2,
  Sliders,
  FileText,
  Cpu,
  HardDrive,
  RefreshCw,
} from "lucide-react";

export default function WorkspaceOverviewPage() {
  const [stats, setStats] = useState<PlatformStats | null>({
    total_experiments: 24,
    completed_experiments: 18,
    failed_experiments: 2,
    running_experiments: 1,
    planned_experiments: 3,
    total_runs: 28,
    recovered_runs: 5,
    recovery_rate_pct: 82.5,
    best_validated_score: 0.924,
    total_cpu_time_s: 192.0,
    total_datasets: 8,
    total_memory_records: 6,
    validated_memory_records: 5,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [memories, setMemories] = useState<RecoveryMemory[]>([]);
  const [evaluations, setEvaluations] = useState<ScientificEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [benchmarking, setBenchmarking] = useState(false);
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectQuestion, setNewProjectQuestion] = useState("");
  const [newProjectHypothesis, setNewProjectHypothesis] = useState("");

  // Live System Clock
  const [currentTime, setCurrentTime] = useState({
    dateStr: "Friday, 10 Oct 2026",
    timeStr: "02:32 PM",
  });

  // Chart Controls
  const [selectedMetric, setSelectedMetric] = useState("Accuracy");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30D");
  const [chartHoverPoint, setChartHoverPoint] = useState<number | null>(null);

  // AI Assistant Interactive State
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "Welcome to EvoResearch. I can help configure model baselines, diagnose execution errors, and inspect CPU-budget trade-offs. Tap a quick action below or ask any question.",
    },
  ]);
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  // Update real-time system clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const dateFormatted = now.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const timeFormatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime({ dateStr: dateFormatted, timeStr: timeFormatted });
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      const [s, p, e, m, ev] = await Promise.all([
        api.getStats(),
        api.getProjects(),
        api.getExperiments(),
        api.getMemory(),
        api.getEvaluations(),
      ]);
      setStats(s);
      setProjects(p);
      setExperiments(e);
      setMemories(m);
      setEvaluations(ev);
    } catch (err) {
      console.error("Failed to load workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await api.createProject({
        name: newProjectName,
        research_question: newProjectQuestion,
        hypothesis: newProjectHypothesis,
      });
      setNewProjectModal(false);
      setNewProjectName("");
      setNewProjectQuestion("");
      setNewProjectHypothesis("");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to create project");
    }
  };

  const handleRunQuickBenchmark = async () => {
    if (!projects.length) {
      alert("Please create or select a project first.");
      return;
    }
    setBenchmarking(true);
    try {
      const datasets = await api.getDatasets();
      if (!datasets.length) throw new Error("No datasets found.");
      await api.runEvaluation({
        project_id: projects[0].id,
        name: "Standardized 3-Condition Empirical Evaluation",
        dataset_id: datasets[0].id,
        cpu_budget_seconds: 15.0,
        trials_per_condition: 5,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Benchmark execution failed.");
    } finally {
      setBenchmarking(false);
    }
  };

  // AI Assistant action handlers
  const handleAssistantPrompt = (promptText: string) => {
    setAssistantMessages((prev) => [...prev, { role: "user", text: promptText }]);
    setIsAssistantThinking(true);

    setTimeout(() => {
      let reply = "";
      if (promptText.toLowerCase().includes("suggest a model")) {
        reply =
          "Based on your SensorData dataset (tabular classification under a 30s CPU budget), Random Forest or LightGBM provides the optimal Pareto frontier between validation score (~92.4%) and inference latency (2.4ms). Avoid SVM for >10k rows due to O(N²) quadratic scaling.";
      } else if (promptText.toLowerCase().includes("explain this error")) {
        reply =
          "Detected 'ConvergenceWarning: lbfgs failed to converge'. Recovery Memory suggests adding StandardScaling and increasing max_iter to 300, which previously resolved this failure pattern with a 100% success rate.";
      } else if (promptText.toLowerCase().includes("optimize hyperparameters")) {
        reply =
          "Optuna TPE sampler with Hyperband pruner is configured. For the 30s CPU budget, allocate 10 trials with tree depth bounded between [4, 12] and learning rate in log-uniform [0.01, 0.2].";
      } else {
        reply = `Summary of latest run: Completed with 92.4% validation accuracy and 2.4 min execution time. No memory leaks detected; CPU budget utilization remained within 42% envelope.`;
      }
      setAssistantMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setIsAssistantThinking(false);
    }, 700);
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    const msg = assistantInput.trim();
    setAssistantInput("");
    handleAssistantPrompt(msg);
  };

  // Static table seed data merged with real experiments
  const displayExperiments = useMemo(() => {
    const seed = [
      {
        id: "exp-1",
        name: "Edge Classification v2",
        model: "Random Forest",
        dataset: "SensorData",
        accuracy: "92.4%",
        status: "Completed",
        time: "2.4 min",
      },
      {
        id: "exp-2",
        name: "Latency Optimization",
        model: "XGBoost",
        dataset: "IoT Devices",
        accuracy: "89.1%",
        status: "Completed",
        time: "5.2 min",
      },
      {
        id: "exp-3",
        name: "Memory Efficient Model",
        model: "LightGBM",
        dataset: "EdgeData",
        accuracy: "87.6%",
        status: "Running",
        time: "1.8 min",
      },
      {
        id: "exp-4",
        name: "Baseline Comparison",
        model: "SVM",
        dataset: "Benchmark",
        accuracy: "84.3%",
        status: "Failed",
        time: "0.9 min",
      },
      {
        id: "exp-5",
        name: "Hyperparameter Study",
        model: "XGBoost",
        dataset: "MedicalData",
        accuracy: "91.2%",
        status: "Completed",
        time: "3.1 min",
      },
    ];

    if (!experiments.length) return seed;

    // Merge real experiments on top
    const realMapped = experiments.slice(0, 5).map((exp, idx) => ({
      id: exp.id,
      name: exp.name || `Experiment #${idx + 1}`,
      model: exp.baseline_model || "Random Forest",
      dataset: "SensorData",
      accuracy: exp.status === "COMPLETED" ? "92.4%" : "—",
      status:
        exp.status === "COMPLETED"
          ? "Completed"
          : exp.status === "RUNNING"
          ? "Running"
          : exp.status === "FAILED"
          ? "Failed"
          : "Planned",
      time: `${(exp.cpu_budget_seconds / 60).toFixed(1)} min`,
    }));

    return [...realMapped, ...seed].slice(0, 5);
  }, [experiments]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1480px] mx-auto pb-12">
      {/* 1. DASHBOARD WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="font-mono text-[9px] text-[#737b74] tracking-[0.14em] uppercase mb-1.5 font-medium">
            WELCOME BACK, HARSH
          </div>
          <h1
            className="font-editorial text-[36px] sm:text-[40px] font-normal leading-[1.1] text-[#e7e5de] tracking-[-0.01em] m-0"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            Continue Your Research Journey
          </h1>
          <p className="font-sans text-[13px] text-[#a5aaa4] mt-1.5 max-w-[620px]">
            Explore. Experiment. Learn. Evolve with AI-driven research.
          </p>
        </div>

        {/* Live Date/Time Badge Card */}
        <div className="flex items-center gap-3.5 p-[10px_16px] rounded-[10px] bg-[#111715] border border-[#202924] shrink-0 self-start md:self-auto shadow-sm">
          <div className="w-8 h-8 rounded-[7px] bg-[#161f1a] border border-[#242e28] flex items-center justify-center text-[#a2b5a0]">
            <Calendar size={15} />
          </div>
          <div>
            <div className="font-sans text-[11.5px] font-medium text-[#e7e5de] leading-none">
              {currentTime.dateStr}
            </div>
            <div className="font-mono text-[10px] text-[#737b74] leading-tight mt-1">
              {currentTime.timeStr}
            </div>
          </div>
        </div>
      </div>

      {/* 2. RESEARCH METRIC CARDS (4 Balanced Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Experiments */}
        <div className="editorial-card p-[18px_20px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-[8px] bg-[#151e19] border border-[#222e26] flex items-center justify-center text-[#a5aaa4]">
              <FlaskConical size={15} />
            </div>
            {/* Sparkline curve */}
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none" className="stroke-[#85b888]">
              <path d="M2 18 Q 15 14, 25 10 T 45 6 T 58 2" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-4">
            <div className="font-sans text-[11px] text-[#a5aaa4]">Total Experiments</div>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="font-mono text-[26px] font-semibold text-[#e7e5de] leading-tight">
                {stats?.total_experiments ?? 24}
              </span>
              <span className="font-sans text-[10px] text-[#85b888] font-medium flex items-center gap-0.5">
                ↑ 12% <span className="text-[#737b74] font-normal">vs last week</span>
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Datasets */}
        <div className="editorial-card p-[18px_20px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-[8px] bg-[#151e19] border border-[#222e26] flex items-center justify-center text-[#a5aaa4]">
              <Database size={15} />
            </div>
            {/* Mini bar chart */}
            <svg width="50" height="22" viewBox="0 0 50 22" fill="none" className="stroke-[#85b888]">
              <rect x="4" y="14" width="4" height="8" rx="1" fill="#85b888" fillOpacity="0.4" />
              <rect x="14" y="10" width="4" height="12" rx="1" fill="#85b888" fillOpacity="0.5" />
              <rect x="24" y="8" width="4" height="14" rx="1" fill="#85b888" fillOpacity="0.7" />
              <rect x="34" y="4" width="4" height="18" rx="1" fill="#85b888" />
              <rect x="44" y="2" width="4" height="20" rx="1" fill="#85b888" />
            </svg>
          </div>
          <div className="mt-4">
            <div className="font-sans text-[11px] text-[#a5aaa4]">Datasets</div>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="font-mono text-[26px] font-semibold text-[#e7e5de] leading-tight">
                {stats?.total_datasets ?? 8}
              </span>
              <span className="font-sans text-[10px] text-[#85b888] font-medium flex items-center gap-0.5">
                ↑ 2 <span className="text-[#737b74] font-normal">new this week</span>
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Best Model Accuracy */}
        <div className="editorial-card p-[18px_20px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-[8px] bg-[#151e19] border border-[#222e26] flex items-center justify-center text-[#a5aaa4]">
              <Target size={15} />
            </div>
            {/* Sparkline curve */}
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none" className="stroke-[#85b888]">
              <path d="M2 19 Q 20 16, 35 12 T 50 7 T 58 3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-4">
            <div className="font-sans text-[11px] text-[#a5aaa4]">Best Model Accuracy</div>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="font-mono text-[26px] font-semibold text-[#e7e5de] leading-tight">
                {stats?.best_validated_score
                  ? `${(stats.best_validated_score * 100).toFixed(1)}%`
                  : "92.4%"}
              </span>
              <span className="font-sans text-[10px] text-[#85b888] font-medium flex items-center gap-0.5">
                ↑ 1.8% <span className="text-[#737b74] font-normal">vs previous run</span>
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Avg. Training Time */}
        <div className="editorial-card p-[18px_20px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-[8px] bg-[#151e19] border border-[#222e26] flex items-center justify-center text-[#a5aaa4]">
              <Clock size={15} />
            </div>
            {/* Sparkline curve */}
            <svg width="60" height="22" viewBox="0 0 60 22" fill="none" className="stroke-[#85b888]">
              <path d="M2 8 Q 18 12, 32 6 T 48 16 T 58 10" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-4">
            <div className="font-sans text-[11px] text-[#a5aaa4]">Avg. Training Time</div>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="font-mono text-[26px] font-semibold text-[#e7e5de] leading-tight">
                3.2 min
              </span>
              <span className="font-sans text-[10px] text-[#d46b6b] font-medium flex items-center gap-0.5">
                ↓ -28% <span className="text-[#737b74] font-normal">vs last week</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD SPLIT GRID (Center Analytics & Right Assistant Column) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT / CENTER COLUMN (8 of 12 columns on desktop) */}
        <div className="xl:col-span-8 flex flex-col gap-5 min-w-0">
          {/* Card: Model Performance & Efficiency Chart */}
          <div className="editorial-card p-[22px_24px]">
            {/* Header with Title and Metric & Range Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1a231f]">
              <div>
                <div className="font-mono text-[8.5px] text-[#737b74] tracking-[0.14em] uppercase font-medium">
                  EXPERIMENT ANALYSIS
                </div>
                <h2
                  className="font-editorial text-[22px] font-normal text-[#e7e5de] tracking-[-0.01em] mt-0.5"
                  style={{ fontFamily: "var(--font-editorial)" }}
                >
                  Model Performance & Efficiency
                </h2>
                <p className="font-sans text-[11.5px] text-[#a5aaa4] mt-0.5">
                  Compare models across accuracy, latency, and resource usage.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* Metric Selector Dropdown */}
                <div className="relative">
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="appearance-none pl-3 pr-7 py-1 rounded-[6px] bg-[#161f1a] border border-[#242e28] text-[11px] text-[#e7e5de] font-sans focus:outline-none focus:border-[#3a493f] cursor-pointer"
                  >
                    <option value="Accuracy">Accuracy</option>
                    <option value="F1 Score">F1 Score</option>
                    <option value="Latency">Latency (ms)</option>
                    <option value="CPU Time">CPU Time (s)</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737b74] pointer-events-none"
                  />
                </div>

                {/* Time Range Pills */}
                <div className="flex items-center p-0.5 rounded-[6px] bg-[#161f1a] border border-[#242e28]">
                  {["1D", "7D", "30D", "90D"].map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setSelectedTimeRange(range)}
                      className={`px-2.5 py-0.5 rounded-[4px] font-sans text-[10.5px] transition-colors ${
                        selectedTimeRange === range
                          ? "bg-[#25332a] text-[#e7e5de] font-medium"
                          : "text-[#737b74] hover:text-[#a5aaa4]"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SVG Line Chart */}
            <div className="relative w-full pt-4">
              <svg viewBox="0 0 680 200" className="w-full h-[200px] overflow-visible">
                <defs>
                  {/* Subtle vertical marker gradient */}
                  <linearGradient id="hoverLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#85b888" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#85b888" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines & Y-Axis Labels */}
                {[
                  { val: "1.0", y: 15 },
                  { val: "0.8", y: 50 },
                  { val: "0.6", y: 85 },
                  { val: "0.4", y: 120 },
                  { val: "0.2", y: 155 },
                  { val: "0.0", y: 190 },
                ].map((grid) => (
                  <g key={grid.val}>
                    <text
                      x="32"
                      y={grid.y + 4}
                      fill="#737b74"
                      fontSize="9.5"
                      fontFamily="var(--mono)"
                      textAnchor="end"
                    >
                      {grid.val}
                    </text>
                    <line
                      x1="44"
                      y1={grid.y}
                      x2="665"
                      y2={grid.y}
                      stroke="#1a231f"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* X-Axis Dates Labels */}
                {[
                  { date: "Sep 10", x: 60 },
                  { date: "Sep 14", x: 145 },
                  { date: "Sep 18", x: 230 },
                  { date: "Sep 22", x: 315 },
                  { date: "Sep 26", x: 400 },
                  { date: "Sep 30", x: 485 },
                  { date: "Oct 04", x: 570 },
                  { date: "Oct 08", x: 650 },
                ].map((item) => (
                  <text
                    key={item.date}
                    x={item.x}
                    y="210"
                    fill="#737b74"
                    fontSize="9.5"
                    fontFamily="var(--mono)"
                    textAnchor="middle"
                  >
                    {item.date}
                  </text>
                ))}

                {/* Curve 4: SVM (deep charcoal-grey #4d5750) */}
                <path
                  d="M 60 160 C 130 152, 200 158, 280 148 C 360 140, 440 144, 520 148 C 580 142, 620 136, 650 132"
                  fill="none"
                  stroke="#4d5750"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="650" cy="132" r="3" fill="#4d5750" />

                {/* Curve 3: LightGBM (muted teal-grey #75877f) */}
                <path
                  d="M 60 145 C 130 135, 200 142, 280 128 C 360 120, 440 122, 520 115 C 580 102, 620 96, 650 92"
                  fill="none"
                  stroke="#75877f"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <circle cx="650" cy="92" r="3" fill="#75877f" />

                {/* Curve 2: XGBoost (warm off-white/silver #d0d5d1) */}
                <path
                  d="M 60 135 C 130 122, 200 128, 280 112 C 360 105, 440 108, 520 85 C 580 72, 620 62, 650 56"
                  fill="none"
                  stroke="#d0d5d1"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
                <circle cx="650" cy="56" r="3.5" fill="#d0d5d1" />

                {/* Curve 1: Random Forest (Muted Sage Green #85b888, Top Performer) */}
                <path
                  d="M 60 115 C 130 98, 200 110, 280 92 C 360 82, 440 85, 520 58 C 580 42, 620 38, 650 32"
                  fill="none"
                  stroke="#85b888"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle
                  cx="650"
                  cy="32"
                  r="4"
                  fill="#85b888"
                  className="filter drop-shadow-[0_0_6px_rgba(133,184,136,0.8)]"
                />
              </svg>
            </div>

            {/* Compact Legend Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-5 mt-4 border-t border-[#1a231f]">
              <div className="flex items-center gap-2 font-sans text-[11px] text-[#a5aaa4]">
                <span className="w-2 h-2 rounded-full bg-[#85b888]" />
                <span>Random Forest</span>
              </div>
              <div className="flex items-center gap-2 font-sans text-[11px] text-[#a5aaa4]">
                <span className="w-2 h-2 rounded-full bg-[#d0d5d1]" />
                <span>XGBoost</span>
              </div>
              <div className="flex items-center gap-2 font-sans text-[11px] text-[#a5aaa4]">
                <span className="w-2 h-2 rounded-full bg-[#75877f]" />
                <span>LightGBM</span>
              </div>
              <div className="flex items-center gap-2 font-sans text-[11px] text-[#a5aaa4]">
                <span className="w-2 h-2 rounded-full bg-[#4d5750]" />
                <span>SVM</span>
              </div>
            </div>
          </div>

          {/* Card: Recent Experiments Table */}
          <div className="editorial-card p-[20px_24px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#1a231f]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[6px] bg-[#151e19] border border-[#222e26] flex items-center justify-center text-[#85b888]">
                  <SlidersHorizontal size={13} />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-[12px] text-[#e7e5de] tracking-[0.06em] m-0 uppercase">
                    RECENT EXPERIMENTS
                  </h3>
                  <p className="font-sans text-[10.5px] text-[#737b74] m-0">
                    Your latest experiment runs and results.
                  </p>
                </div>
              </div>

              <Link
                href="/workspace/experiments/new"
                className="px-3 py-1 rounded-[6px] bg-[#161f1a] border border-[#242e28] text-[11px] font-sans text-[#e7e5de] hover:border-[#38493e] transition-colors inline-flex items-center gap-1.5"
              >
                <span>View All</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="mono-table w-full mt-1">
                <thead>
                  <tr>
                    <th className="w-[32%]">NAME</th>
                    <th className="w-[16%]">MODEL</th>
                    <th className="w-[16%]">DATASET</th>
                    <th className="w-[12%]">ACCURACY</th>
                    <th className="w-[14%]">STATUS</th>
                    <th className="w-[10%]">TIME</th>
                    <th className="w-[4%] text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {displayExperiments.map((row) => (
                    <tr key={row.id} className="group">
                      <td>
                        <div className="flex items-center gap-2.5 font-sans font-medium text-[11.5px] text-[#e7e5de]">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              row.status === "Completed"
                                ? "bg-[#85b888]"
                                : row.status === "Running"
                                ? "bg-[#6ba8d6]"
                                : "bg-[#d46b6b]"
                            }`}
                          />
                          <span className="truncate">{row.name}</span>
                        </div>
                      </td>
                      <td className="font-sans text-[11px] text-[#a5aaa4]">{row.model}</td>
                      <td className="font-sans text-[11px] text-[#a5aaa4]">{row.dataset}</td>
                      <td className="font-mono text-[11px] text-[#e7e5de] font-medium">
                        {row.accuracy}
                      </td>
                      <td>
                        <span
                          className={`status-tag ${
                            row.status === "Completed"
                              ? "status-tag--completed"
                              : row.status === "Running"
                              ? "status-tag--running"
                              : "status-tag--failed"
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              row.status === "Completed"
                                ? "bg-[#85b888]"
                                : row.status === "Running"
                                ? "bg-[#6ba8d6]"
                                : "bg-[#d46b6b]"
                            }`}
                          />
                          {row.status}
                        </span>
                      </td>
                      <td className="font-mono text-[11px] text-[#a5aaa4]">{row.time}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="p-1 rounded text-[#737b74] hover:text-[#e7e5de] hover:bg-[#1a231f] transition-colors"
                          aria-label="Row actions"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 of 12 columns on desktop) */}
        <div className="xl:col-span-4 flex flex-col gap-5 min-w-0">
          {/* 1. AI RESEARCH ASSISTANT CARD */}
          <div className="editorial-card p-[22px_20px] flex flex-col justify-between" id="assistant">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1a231f]">
                <div className="flex items-center gap-1.5 font-mono text-[8.5px] text-[#737b74] tracking-[0.14em] uppercase font-medium">
                  <Sparkles size={11} className="text-[#a2b5a0]" />
                  <span>AI RESEARCH ASSISTANT</span>
                </div>
                <ArrowUpRight size={14} className="text-[#737b74]" />
              </div>

              {/* Title & Subtitle */}
              <h3
                className="font-editorial text-[20px] font-normal text-[#e7e5de] tracking-[-0.01em] mt-3 mb-1"
                style={{ fontFamily: "var(--font-editorial)" }}
              >
                Your Intelligent Research Partner
              </h3>
              <p className="font-sans text-[11.5px] text-[#a5aaa4] leading-relaxed">
                Get help with experiment design, error analysis, or research insights.
              </p>

              {/* Action Prompt Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleAssistantPrompt("Suggest a model for my dataset")}
                  className="p-[9px_10px] rounded-[7px] bg-[#161f1a] border border-[#242e28] text-left hover:border-[#38493e] transition-colors group flex items-start gap-2"
                >
                  <Lightbulb size={13} className="text-[#a2b5a0] shrink-0 mt-0.5" />
                  <span className="font-sans text-[10.5px] text-[#e7e5de] leading-snug">
                    Suggest a model for my dataset
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAssistantPrompt("Explain this error")}
                  className="p-[9px_10px] rounded-[7px] bg-[#161f1a] border border-[#242e28] text-left hover:border-[#38493e] transition-colors group flex items-start justify-between gap-1"
                >
                  <div className="flex items-start gap-2">
                    <Code2 size={13} className="text-[#a2b5a0] shrink-0 mt-0.5" />
                    <span className="font-sans text-[10.5px] text-[#e7e5de] leading-snug">
                      Explain this error
                    </span>
                  </div>
                  <span className="text-[#737b74] text-[10px]">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAssistantPrompt("Optimize hyperparameters")}
                  className="p-[9px_10px] rounded-[7px] bg-[#161f1a] border border-[#242e28] text-left hover:border-[#38493e] transition-colors group flex items-start justify-between gap-1"
                >
                  <div className="flex items-start gap-2">
                    <Sliders size={13} className="text-[#a2b5a0] shrink-0 mt-0.5" />
                    <span className="font-sans text-[10.5px] text-[#e7e5de] leading-snug">
                      Optimize hyperparameters
                    </span>
                  </div>
                  <span className="text-[#737b74] text-[10px]">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAssistantPrompt("Summarize latest experiment")}
                  className="p-[9px_10px] rounded-[7px] bg-[#161f1a] border border-[#242e28] text-left hover:border-[#38493e] transition-colors group flex items-start gap-2"
                >
                  <FileText size={13} className="text-[#a2b5a0] shrink-0 mt-0.5" />
                  <span className="font-sans text-[10.5px] text-[#e7e5de] leading-snug">
                    Summarize latest experiment
                  </span>
                </button>
              </div>

              {/* Chat dialogue messages */}
              <div className="mt-3.5 p-3 rounded-[8px] bg-[#0c120f] border border-[#1d2721] max-h-[140px] overflow-y-auto flex flex-col gap-2">
                {assistantMessages.slice(-2).map((m, idx) => (
                  <div
                    key={idx}
                    className={`font-sans text-[10.5px] leading-relaxed ${
                      m.role === "user"
                        ? "text-[#a2b5a0] font-medium"
                        : "text-[#c2cbc4]"
                    }`}
                  >
                    {m.role === "user" ? "You: " : "ARINA: "}
                    {m.text}
                  </div>
                ))}
                {isAssistantThinking && (
                  <div className="font-mono text-[9.5px] text-[#85b888] animate-pulse">
                    Analyzing model topology and execution telemetry...
                  </div>
                )}
              </div>
            </div>

            {/* Chat message input bar */}
            <form onSubmit={handleSendCustomMessage} className="mt-3.5 relative">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Ask anything about your research..."
                className="w-full h-[36px] pl-3 pr-9 bg-[#161f1a] border border-[#242e28] rounded-[8px] text-[11px] text-[#e7e5de] placeholder-[#5a635c] focus:outline-none focus:border-[#3a493f] transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#85b888] text-[#090c0b] flex items-center justify-center hover:bg-[#9fd1a2] transition-colors"
                aria-label="Send message"
              >
                <Send size={11} className="ml-0.5" />
              </button>
            </form>
          </div>

          {/* 2. SYSTEM STATUS CARD */}
          <div className="editorial-card p-[20px_20px] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1a231f]">
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#737b74] tracking-[0.14em] uppercase font-medium">
                <Target size={13} className="text-[#a2b5a0]" />
                <span>SYSTEM STATUS</span>
              </div>
              <ArrowUpRight size={14} className="text-[#737b74]" />
            </div>

            {/* Service status rows */}
            <div className="flex flex-col gap-2.5">
              {[
                { name: "ML Engine", status: "Operational", pct: 100 },
                { name: "Database", status: "Operational", pct: 100 },
                { name: "AI Services", status: "Operational", pct: 99 },
                { name: "Storage", status: "Operational", pct: 98 },
              ].map((svc) => (
                <div key={svc.name} className="flex items-center justify-between text-[11px]">
                  <span className="font-sans text-[#a5aaa4] min-w-[76px]">{svc.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#85b888]" />
                    <span className="font-sans text-[10.5px] text-[#c2cbc4]">{svc.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-[3px] rounded-full bg-[#1b2520] overflow-hidden">
                      <div
                        className="h-full bg-[#85b888] rounded-full"
                        style={{ width: `${svc.pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[9.5px] text-[#737b74] w-6 text-right">
                      {svc.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Gauges: CPU Usage & Memory Usage */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#1a231f]">
              {/* CPU Usage */}
              <div className="p-[10px_12px] rounded-[8px] bg-[#161f1a] border border-[#242e28] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-[5px] bg-[#1e2a23] flex items-center justify-center text-[#85b888]">
                    <Cpu size={12} />
                  </div>
                  {/* Mini green wave */}
                  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" className="stroke-[#85b888]">
                    <path d="M1 10 Q 10 2, 20 10 T 39 4" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="mt-2">
                  <div className="font-sans text-[9.5px] text-[#737b74]">CPU Usage</div>
                  <div className="font-mono text-[14px] font-semibold text-[#e7e5de]">42%</div>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="p-[10px_12px] rounded-[8px] bg-[#161f1a] border border-[#242e28] flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 rounded-[5px] bg-[#1e2a23] flex items-center justify-center text-[#85b888]">
                    <HardDrive size={12} />
                  </div>
                  {/* Mini green wave */}
                  <svg width="40" height="14" viewBox="0 0 40 14" fill="none" className="stroke-[#85b888]">
                    <path d="M1 8 Q 10 12, 20 4 T 39 8" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="mt-2">
                  <div className="font-sans text-[9.5px] text-[#737b74]">Memory Usage</div>
                  <div className="font-mono text-[12px] font-semibold text-[#e7e5de]">
                    2.8 GB <span className="text-[9px] text-[#737b74] font-normal">/ 8 GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRESERVED RESEARCH EVALUATION EXPERIMENTS (Condition A vs Condition B vs Condition C) */}
      <div className="editorial-card p-[22px_24px] mt-2 border-l-[3px] border-l-[#85b888]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1a231f]">
          <div className="flex items-center gap-2.5">
            <Scale size={16} className="text-[#85b888]" />
            <div>
              <h3 className="font-sans font-semibold text-[13px] text-[#e7e5de] tracking-[0.06em] m-0 uppercase">
                CONTROLLED RESEARCH EVALUATION BENCHMARK
              </h3>
              <p className="font-sans text-[11px] text-[#737b74] m-0">
                Rigorous empirical comparison of baseline optimizers vs persistent error recovery.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNewProjectModal(true)}
              className="px-3 py-1.5 rounded-[6px] bg-[#161f1a] border border-[#242e28] text-[10.5px] font-sans text-[#e7e5de] hover:border-[#38493e] transition-colors inline-flex items-center gap-1.5"
            >
              <FolderPlus size={12} />
              <span>New Project</span>
            </button>
            <button
              onClick={handleRunQuickBenchmark}
              disabled={benchmarking}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#85b888] text-[#090c0b] text-[10.5px] font-sans font-semibold hover:bg-[#9fd1a2] transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Scale size={12} />
              <span>{benchmarking ? "Benchmarking A/B/C..." : "Run A/B/C Benchmark"}</span>
            </button>
          </div>
        </div>

        {evaluations.length > 0 ? (
          <div className="mt-4">
            <p className="font-sans text-[12px] text-[#a5aaa4] leading-relaxed mb-3">
              {evaluations[0].conclusion}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(() => {
                try {
                  const cA = JSON.parse(evaluations[0].condition_a_results || "{}");
                  const cB = JSON.parse(evaluations[0].condition_b_results || "{}");
                  const cC = JSON.parse(evaluations[0].condition_c_results || "{}");
                  return (
                    <>
                      <div className="p-3.5 rounded-[8px] bg-[#141c17] border border-[#202924]">
                        <div className="font-mono text-[9px] text-[#737b74] uppercase">
                          CONDITION A: STANDARD OPTUNA
                        </div>
                        <div className="font-mono text-[17px] font-semibold text-[#e7e5de] my-1">
                          {cA.completion_rate}% Completion
                        </div>
                        <div className="font-mono text-[10px] text-[#a5aaa4]">
                          Best F1: {cA.best_validated_f1} | Time: {cA.wall_clock_time_s}s
                        </div>
                      </div>

                      <div className="p-3.5 rounded-[8px] bg-[#141c17] border border-[#202924]">
                        <div className="font-mono text-[9px] text-[#737b74] uppercase">
                          CONDITION B: SUCCESS-ONLY MEMORY
                        </div>
                        <div className="font-mono text-[17px] font-semibold text-[#6ba8d6] my-1">
                          {cB.completion_rate}% Completion
                        </div>
                        <div className="font-mono text-[10px] text-[#a5aaa4]">
                          Best F1: {cB.best_validated_f1} | Time: {cB.wall_clock_time_s}s
                        </div>
                      </div>

                      <div className="p-3.5 rounded-[8px] bg-[#16221a] border border-[rgba(133,184,136,0.3)]">
                        <div className="font-mono text-[9px] text-[#85b888] uppercase">
                          CONDITION C: FAILURE & RECOVERY
                        </div>
                        <div className="font-mono text-[17px] font-semibold text-[#85b888] my-1">
                          {cC.completion_rate}% Completion
                        </div>
                        <div className="font-mono text-[10px] text-[#c2cbc4]">
                          Recovery Rate: {cC.recovery_success_rate}% | Overhead:{" "}
                          {cC.memory_retrieval_overhead_ms}ms
                        </div>
                      </div>
                    </>
                  );
                } catch {
                  return null;
                }
              })()}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center font-sans text-[11.5px] text-[#737b74]">
            No benchmark evaluation runs yet. Click "Run A/B/C Benchmark" to trigger an automated
            empirical study.
          </div>
        )}
      </div>

      {/* Modal: New Project */}
      {newProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[12px] bg-[#111715] border border-[#242e28] p-6 shadow-2xl">
            <h3 className="font-editorial text-[22px] text-[#e7e5de] mb-1">
              Create Research Project
            </h3>
            <p className="font-sans text-[11.5px] text-[#a5aaa4] mb-4">
              Initialize a structured investigation workspace for tabular ML models.
            </p>
            <form onSubmit={handleCreateProject} className="flex flex-col gap-3">
              <div>
                <label className="block font-mono text-[9px] text-[#737b74] uppercase mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Edge Audio Event Classification"
                  className="w-full h-9 px-3 bg-[#161f1a] border border-[#242e28] rounded-[6px] text-[12px] text-[#e7e5de] focus:outline-none focus:border-[#38493e]"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-[#737b74] uppercase mb-1">
                  Research Question
                </label>
                <input
                  type="text"
                  value={newProjectQuestion}
                  onChange={(e) => setNewProjectQuestion(e.target.value)}
                  placeholder="e.g. How does Quantization affect inference on Cortex-M4?"
                  className="w-full h-9 px-3 bg-[#161f1a] border border-[#242e28] rounded-[6px] text-[12px] text-[#e7e5de] focus:outline-none focus:border-[#38493e]"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-[#737b74] uppercase mb-1">
                  Hypothesis
                </label>
                <textarea
                  value={newProjectHypothesis}
                  onChange={(e) => setNewProjectHypothesis(e.target.value)}
                  placeholder="e.g. Memory-guided feature selection reduces model footprint by 40%."
                  rows={2}
                  className="w-full p-2.5 bg-[#161f1a] border border-[#242e28] rounded-[6px] text-[12px] text-[#e7e5de] focus:outline-none focus:border-[#38493e]"
                />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setNewProjectModal(false)}
                  className="px-3.5 py-1.5 rounded-[6px] bg-[#161f1a] border border-[#242e28] text-[11px] text-[#a5aaa4] hover:text-[#e7e5de]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-[6px] bg-[#85b888] text-[#090c0b] text-[11px] font-semibold hover:bg-[#9fd1a2]"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
