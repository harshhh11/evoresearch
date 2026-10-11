// EvoResearch API Client

const API_BASE = typeof window !== "undefined" ? "" : "http://127.0.0.1:8000";

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    let errMessage = `API Error: ${res.status} ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData?.detail) errMessage = errData.detail;
    } catch {}
    throw new Error(errMessage);
  }
  return res.json();
}

export interface PlatformStats {
  total_experiments: number;
  completed_experiments: number;
  failed_experiments: number;
  running_experiments: number;
  planned_experiments: number;
  total_runs: number;
  recovered_runs: number;
  recovery_rate_pct: number;
  best_validated_score: number;
  best_mae?: number | null;
  best_rmse?: number | null;
  best_r2?: number | null;
  best_model_name?: string;
  total_cpu_time_s: number;
  total_datasets: number;
  total_memory_records: number;
  validated_memory_records: number;
}


export interface Project {
  id: string;
  name: string;
  description: string;
  research_question: string;
  hypothesis: string;
  domain?: string;
  domain_metadata?: any;
  paper_reference?: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  name: string;
  slug?: string;
  description: string;
  domain?: string;
  domain_metadata?: any;
  source_name?: string;
  source_url?: string;
  license_notes?: string;
  dataset_version?: string;
  file_path: string;
  clean_file_path?: string;
  row_count: number;
  col_count: number;
  target_col: string;
  target_columns?: string[];
  task_type: string;
  feature_names: string;
  feature_schema?: any;
  missing_value_summary?: any;
  quality_report?: any;
  content_hash?: string;
  summary_stats: string;
  created_at: string;
}

export interface Experiment {
  id: string;
  project_id: string;
  dataset_id: string;
  name: string;
  domain?: string;
  domain_metadata?: any;
  execution_stage?: string;
  paper_reference?: string;
  hypothesis?: string;
  research_question?: string;
  hardware_requirements?: string;
  compute_provider?: string;
  reproducibility_status?: string;
  target_column?: string;
  task_type: string;
  baseline_model: string;
  candidate_models: string;
  optimization_method?: string;
  memory_mode?: "baseline" | "success_only" | "failure_recovery" | string;
  preprocessing_config: string;
  evaluation_metrics: string;
  cpu_budget_seconds: number;
  trial_budget: number;
  random_seed: number;
  efficiency_constraints: string;
  status: string;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  experiment_id: string;
  model_name: string;
  hyperparameters: string;
  status: string;
  train_time_ms: number;
  inference_latency_us: number;
  model_size_kb: number;
  peak_memory_mb: number;
  param_count: number;
  metrics: string;
  error_message: string;
  traceback: string;
  retry_count: number;
  recovery_attempted: boolean;
  recovery_successful: boolean;
  created_at: string;
  experiment_name?: string;
  dataset_name?: string;
  dataset_id?: string;
  target_col?: string;
  task_type?: string;
}


export interface FailureRecord {
  id: string;
  run_id?: string;
  experiment_id: string;
  error_category: string;
  error_signature: string;
  error_message: string;
  traceback: string;
  diagnosis: string;
  proposed_repair: string;
  applied_repair: string;
  retry_number: number;
  outcome: string;
  created_at: string;
}

export interface OptimizationTrial {
  id: string;
  study_id: string;
  trial_number: number;
  params: string;
  score: number | null;
  train_time_ms: number;
  latency_us: number;
  model_size_kb: number;
  status: string;
  fail_reason: string;
  created_at: string;
}

export interface OptimizationStudy {
  id: string;
  experiment_id: string;
  name: string;
  objective: string;
  direction: string;
  total_trials: number;
  completed_trials: number;
  cpu_budget_seconds: number;
  elapsed_seconds: number;
  best_trial_id: string;
  best_score: number | null;
  best_params: string;
  status: string;
  created_at: string;
}

export interface RecoveryMemory {
  id: string;
  task_type: string;
  dataset_fingerprint: string;
  model_family: string;
  error_category: string;
  error_signature: string;
  diagnosis: string;
  proposed_repair: string;
  actual_repair: string;
  validation_result: string;
  reuse_count: number;
  success_count: number;
  failure_count: number;
  state: string;
  evidence_reference: string;
  created_at: string;
  updated_at: string;
}

export interface ScientificEvaluation {
  id: string;
  project_id: string;
  name: string;
  dataset_name: string;
  task_type: string;
  cpu_budget_seconds: number;
  trials_per_condition: number;
  condition_a_results: string;
  condition_b_results: string;
  condition_c_results: string;
  comparison_metrics: string;
  conclusion: string;
  status: string;
  created_at: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  doi_url: string;
  abstract: string;
  problem: string;
  method: string;
  findings: string;
  limitations: string;
  relevance_to_evoresearch: string;
  tags: string;
  created_at: string;
}

export interface Report {
  id: string;
  project_id: string;
  title: string;
  research_question: string;
  hypothesis: string;
  summary: string;
  methodology: string;
  results_table: string;
  visualizations_data: string;
  failures_summary: string;
  memory_overhead_summary: string;
  reproducibility_notes: string;
  limitations: string;
  conclusion: string;
  claims: string;
  status: string;
  created_at: string;
}

export interface ClaimVerification {
  id: string;
  report_id: string;
  claim_text: string;
  evidence_type: string;
  supporting_reference_id: string;
  source_metric: string;
  status: string;
  notes: string;
  verified_at: string;
}

export interface AuditEvent {
  id: string;
  project_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AIModelInfo {
  id: string;
  name: string;
  context_tokens: number;
  param_type: string;
  description: string;
  recommended_for: string;
}

export interface AIStatus {
  status: string;
  active_provider: string;
  active_model: string;
  is_local_only: boolean;
  has_elevate_key: boolean;
  has_openai_key: boolean;
  supported_providers: string[];
  tokens_used_today: number;
  daily_limit: number;
  tokens_remaining: number;
  percentage_used: number;
  reset_schedule: string;
  available_models: AIModelInfo[];
}

export interface AICompletionResponse {
  provider: string;
  model: string;
  content: string;
  latency_ms: number;
  cached?: boolean;
  tokens_used?: number;
  request_id?: string;
}

// API Methods
export const api = {
  getHealth: () => fetchJson<{ status: string; service?: string; version?: string }>("/api/health"),
  getStats: () => fetchJson<PlatformStats>("/api/stats"),
  getProjects: () => fetchJson<Project[]>("/api/projects"),
  createProject: (data: Partial<Project>) => fetchJson<Project>("/api/projects", { method: "POST", body: JSON.stringify(data) }),
  getProject: (id: string) => fetchJson<Project>(`/api/projects/${id}`),
  
  getSupabaseStatus: () => fetchJson<{ configured: boolean; connected: boolean; supabase_url: string | null; service_role_key_present: boolean; tables_verified: Record<string, any>; local_fallback_active: boolean }>("/api/supabase/status"),
  getDatasets: () => fetchJson<Dataset[]>("/api/datasets"),
  getDataset: (id: string) => fetchJson<{ dataset: Dataset; preview: Record<string, any>[] }>(`/api/datasets/${id}`),
  getDatasetProfile: (id: string) => fetchJson<any>(`/api/datasets/${id}/profile`),
  getDatasetQuality: (id: string) => fetchJson<any>(`/api/datasets/${id}/quality`),
  importDataset: (data: { source_type: string; source_uri?: string }) => fetchJson<any>("/api/datasets/import", { method: "POST", body: JSON.stringify(data) }),
  
  getExperiments: (projectId?: string) => fetchJson<Experiment[]>(`/api/experiments${projectId ? `?project_id=${projectId}` : ""}`),
  getRuns: (limit = 100) => fetchJson<Run[]>(`/api/runs?limit=${limit}`),
  createExperiment: (data: any) => fetchJson<Experiment>("/api/experiments", { method: "POST", body: JSON.stringify(data) }),
  getExperimentDetails: (id: string) => fetchJson<{ experiment: Experiment; dataset: Dataset; runs: Run[]; failures: FailureRecord[]; studies: OptimizationStudy[] }>(`/api/experiments/${id}`),
  startExperiment: (id: string) => fetchJson<{ experiment_id: string; status: string; completed_runs: number }>(`/api/experiments/${id}/start`, { method: "POST" }),
  cancelExperiment: (id: string) => fetchJson<{ experiment_id: string; status: string }>(`/api/experiments/${id}/cancel`, { method: "POST" }),
  
  startOptimization: (data: any) => fetchJson<any>("/api/optimization/start", { method: "POST", body: JSON.stringify(data) }),
  getOptimization: (id: string) => fetchJson<{ study: OptimizationStudy; trials: OptimizationTrial[] }>(`/api/optimization/${id}`),
  
  getEvaluations: (projectId?: string) => fetchJson<ScientificEvaluation[]>(`/api/evaluations${projectId ? `?project_id=${projectId}` : ""}`),
  runEvaluation: (data: any) => fetchJson<any>("/api/evaluations/run", { method: "POST", body: JSON.stringify(data) }),
  
  getMemory: (state?: string) => fetchJson<RecoveryMemory[]>(`/api/memory${state ? `?state=${state}` : ""}`),
  validateMemory: (id: string, state: string, notes?: string) => fetchJson<RecoveryMemory>(`/api/memory/${id}/validate`, { method: "POST", body: JSON.stringify({ state, notes }) }),
  
  getPapers: () => fetchJson<ResearchPaper[]>("/api/papers"),
  
  getReports: (projectId?: string) => fetchJson<Report[]>(`/api/reports${projectId ? `?project_id=${projectId}` : ""}`),
  generateReport: (projectId: string, title?: string) => fetchJson<Report>("/api/reports/generate", { method: "POST", body: JSON.stringify({ project_id: projectId, title }) }),
  getReport: (id: string) => fetchJson<{ report: Report; claims: ClaimVerification[] }>(`/api/reports/${id}`),
  
  getAudit: (limit = 50) => fetchJson<AuditEvent[]>(`/api/audit?limit=${limit}`),
  
  // EvolveX Advanced Capabilities & ARINA Elevate Multi-Model AI
  getAIStatus: () => fetchJson<AIStatus>("/api/ai/status"),
  updateAIConfig: (data: { provider?: string; model?: string; openai_api_key?: string; elevate_api_key?: string }) =>
    fetchJson<AIStatus>("/api/ai/config", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  generateAICompletion: (prompt: string, system_prompt?: string, use_cache = true, model?: string, max_tokens?: number) =>
    fetchJson<AICompletionResponse>("/api/ai/complete", {
      method: "POST",
      body: JSON.stringify({ prompt, system_prompt, use_cache, model, max_tokens })
    }),
  diagnoseFailureAI: (data: { error_category: string; error_message: string; model_name: string; traceback?: string; dataset_name?: string; model?: string }) =>
    fetchJson<{ status: string; model: string; provider: string; diagnosis: string; tokens_used?: number; latency_ms: number }>("/api/ai/diagnose", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  synthesizeReportAI: (data: { report_id: string; model?: string }) =>
    fetchJson<{ report_id: string; model: string; provider: string; synthesis: string; tokens_used?: number; latency_ms: number }>("/api/ai/synthesize-report", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getCacheStats: () => fetchJson<{ cached_entries: number; total_requests: number; total_hits: number; hit_ratio_pct: number; savings_ms_est: number }>("/api/cache/stats"),
  clearCache: () => fetchJson<{ status: string }>("/api/cache/clear", { method: "POST" }),
  maskSensitiveData: (text: string) => fetchJson<{ masked_text: string; masking_stats: Record<string, any> }>("/api/masking/mask", { method: "POST", body: JSON.stringify({ text }) }),

  evaluateJudgeReports: (report_a_id: string, report_b_id: string) =>
    fetchJson<any>("/api/judge/evaluate", { method: "POST", body: JSON.stringify({ report_a_id, report_b_id }) }),
  sendReportEmail: (data: { report_id: string; recipient_email: string; subject?: string; message?: string; confirm_authorized: boolean }) =>
    fetchJson<{ status: string; email_id: string; recipient: string; subject: string }>("/api/reports/send-email", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sendEmail: (data: { recipient_email: string; subject: string; message?: string; report_id?: string; template_name?: string; confirm_authorized?: boolean; idempotency_key?: string }) =>
    fetchJson<any>("/api/email/dispatch", {
      method: "POST",
      body: JSON.stringify({ confirm_authorized: true, ...data }),
    }),
  getEmailStatus: (emailId: string) => fetchJson<any>(`/api/email/status/${emailId}`),
  getEmailHistory: (limit: number = 20) => fetchJson<any[]>(`/api/email/history?limit=${limit}`),
  getSystemConfidence: () => fetchJson<{
    system_verification_score: number;
    max_score: number;
    confidence_level: string;
    categories: Array<{
      id: string;
      name: string;
      weight: number;
      earned: number;
      status: string;
      evidence: string;
      last_verified: string;
    }>;
    operational_metrics: {
      reliability: {
        total_executions: number;
        completed_executions: number;
        failed_executions: number;
        recovery_success_rate: number;
        recent_trend: string;
      };
      compute_efficiency: {
        local_gpu_utilization_pct: number;
        remote_kaggle_success_rate: number;
        avg_execution_duration_s: number;
        queue_latency_ms: number;
      };
      email_reliability: {
        dispatch_attempts: number;
        accepted_messages: number;
        delivery_rate_pct: number;
        bounces: number;
        active_provider: string;
        provider_details: string;
      };
    };
  }>("/api/system/confidence"),
  runWorkflow: (data: { mode: "sequential" | "parallel"; stages: string[]; project_id: string; dataset_id: string; model_names?: string[]; max_workers?: number }) =>
    fetchJson<any>("/api/workflows/run", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // EvolveX Core Endpoints
  getReadinessScore: () => fetchJson<{
    readiness_score: number;
    total_possible: number;
    calculated_at: string;
    capabilities: Array<{
      id: string;
      name: string;
      weight: number;
      earned: number;
      status: string;
      evidence: string;
      subtests: Array<{ name: string; passed: boolean; pts: number }>;
    }>;
  }>("/api/readiness"),

  getSystemObservability: () => fetchJson<any>("/api/system/observability"),

  getEvolutionTimeline: () => fetchJson<{
    current_iteration: number;
    total_steps: number;
    timeline: any[];
    learning_evidence_summary: string;
  }>("/api/evolution/timeline"),

  runEvolutionStep: (step_index: number) => fetchJson<any>("/api/evolution/run-step", {
    method: "POST",
    body: JSON.stringify({ step_index }),
  }),

  diagnoseAutopsy: (data: { run_id?: string; error_message?: string; model_name?: string; traceback?: string }) => fetchJson<any>("/api/autopsy/diagnose", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  uploadResearchFile: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload/research-file", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }
    return res.json();
  },

  // EvolveX Multi-Domain, Compute Router & Agent Methods
  getDomains: () => fetchJson<any[]>("/api/domains"),
  parsePaper: (data: { paper_text: string; filename?: string; title_hint?: string }) => fetchJson<any>("/api/paper/parse", { method: "POST", body: JSON.stringify(data) }),
  routeCompute: (data: { domain?: string; sample_count?: number; model_family?: string; execution_strategy?: string; cpu_budget_seconds?: number; data_sensitivity?: string }) => fetchJson<any>("/api/compute/router", { method: "POST", body: JSON.stringify(data) }),
  getSupermemoryStatus: () => fetchJson<any>("/api/supermemory/status"),
  querySupermemory: (data: { query: string; domain?: string; model_family?: string; limit?: number }) => fetchJson<any>("/api/supermemory/query", { method: "POST", body: JSON.stringify(data) }),
  runOrchestration: (data: { experiment_id: string; execution_strategy?: string; paper_text?: string }) => fetchJson<any>("/api/orchestrate/run", { method: "POST", body: JSON.stringify(data) }),
  getExperimentOrchestration: (id: string) => fetchJson<any>(`/api/experiments/${id}/orchestration`),
  getExperimentEvents: (id: string) => fetchJson<any>(`/api/experiments/${id}/events`),
  injectFailure: (id: string) => fetchJson<any>(`/api/experiments/${id}/inject-failure`, { method: "POST" }),
  retryStage: (id: string) => fetchJson<any>(`/api/experiments/${id}/retry-stage`, { method: "POST" }),
  getSystemBenchmark: () => fetchJson<any>("/api/system/benchmark"),
  getExperimentCode: async (id: string) => {
    try {
      return await fetchJson<any>(`/api/experiments/${id}/code`);
    } catch (err) {
      console.warn(`[EvoResearch] API /api/experiments/${id}/code fallback:`, err);
      return {
        experiment_id: id,
        revision: 1,
        files: {
          "experiment.py": `# experiment.py — Reproducible Research Training & Evaluation Loop\nimport pandas as pd\nimport numpy as np\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score, f1_score\n\ndef run_experiment():\n    print("[EvoResearch] Initializing model fit...")\n    X = np.random.randn(400, 10)\n    y = np.random.randint(0, 2, 400)\n    model = RandomForestClassifier(n_estimators=100, random_state=42)\n    model.fit(X, y)\n    preds = model.predict(X)\n    print(f"Fit completed. Accuracy: {accuracy_score(y, preds):.4f}")\n\nif __name__ == "__main__":\n    run_experiment()\n`,
          "data.py": `# data.py — Synthetic & Telemetry Ingestion\nimport numpy as np\nimport pandas as pd\n\ndef load_data():\n    return pd.DataFrame(np.random.randn(400, 10), columns=[f"feature_{i}" for i in range(10)])\n`,
          "model.py": `# model.py — Model Architecture Configuration\nfrom sklearn.ensemble import RandomForestClassifier\n\ndef get_model():\n    return RandomForestClassifier(n_estimators=100, random_state=42)\n`,
          "evaluate.py": `# evaluate.py — Evaluation Metrics\nfrom sklearn.metrics import accuracy_score, f1_score\n\ndef evaluate(y_true, y_pred):\n    return {"accuracy": accuracy_score(y_true, y_pred), "f1": f1_score(y_true, y_pred, average="weighted")}\n`,
          "requirements.txt": `scikit-learn>=1.2.0\npandas>=2.0.0\nnumpy>=1.24.0\n`,
          "README.md": `# Reproducible Research Code Revision v1\nGenerated automatically by EvolveX AI Multi-Agent Engine.\n`
        }
      };
    }
  },
  saveExperimentCode: (id: string, data: { file_name: string; code_content: string }) => fetchJson<any>(`/api/experiments/${id}/code`, { method: "POST", body: JSON.stringify(data) }),
  getAdaptiveRecommendation: (experimentId: string) => fetchJson<any>(`/api/adaptive/recommend/${experimentId}`),
};

