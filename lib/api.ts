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
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  name: string;
  slug?: string;
  description: string;
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
};
