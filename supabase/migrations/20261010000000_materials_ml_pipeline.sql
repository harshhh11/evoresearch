-- EvoResearch Materials Science ML Pipeline Supabase Schema Migration
-- Migration: 20261010000000_materials_ml_pipeline.sql
-- Enables UUID generation and sets up 14 logical tables with Row Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. DATASETS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    source_name VARCHAR(255) DEFAULT '',
    source_url TEXT DEFAULT '',
    license_notes TEXT DEFAULT '',
    dataset_version VARCHAR(64) DEFAULT '1.0.0',
    task_type VARCHAR(64) NOT NULL CHECK (task_type IN ('regression', 'classification')),
    sample_count INTEGER DEFAULT 0 CHECK (sample_count >= 0),
    feature_count INTEGER DEFAULT 0 CHECK (feature_count >= 0),
    target_columns JSONB DEFAULT '[]'::jsonb,
    feature_schema JSONB DEFAULT '[]'::jsonb,
    missing_value_summary JSONB DEFAULT '{}'::jsonb,
    quality_report JSONB DEFAULT '{}'::jsonb,
    content_hash VARCHAR(64) DEFAULT '',
    storage_path TEXT DEFAULT '',
    status VARCHAR(64) DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'ARCHIVED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_datasets_slug ON datasets(slug);
CREATE INDEX IF NOT EXISTS idx_datasets_task_type ON datasets(task_type);

-- -------------------------------------------------------------
-- 2. DATASET_VERSIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dataset_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    version_tag VARCHAR(64) NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    row_count INTEGER NOT NULL,
    column_count INTEGER NOT NULL,
    schema_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    cleaning_version VARCHAR(64) DEFAULT 'v1',
    provenance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_dataset_version UNIQUE(dataset_id, version_tag)
);

CREATE INDEX IF NOT EXISTS idx_dataset_versions_dataset_id ON dataset_versions(dataset_id);

-- -------------------------------------------------------------
-- 3. DATASET_IMPORT_JOBS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dataset_import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL,
    source_type VARCHAR(128) NOT NULL,
    source_uri TEXT NOT NULL,
    status VARCHAR(64) DEFAULT 'STARTED' CHECK (status IN ('STARTED', 'VALIDATING', 'CLEANING', 'COMPLETED', 'FAILED')),
    rows_received INTEGER DEFAULT 0,
    rows_accepted INTEGER DEFAULT 0,
    rows_rejected INTEGER DEFAULT 0,
    rows_deduplicated INTEGER DEFAULT 0,
    validation_errors JSONB DEFAULT '[]'::jsonb,
    cleaning_summary JSONB DEFAULT '{}'::jsonb,
    duration_ms DOUBLE PRECISION DEFAULT 0.0,
    error_details TEXT DEFAULT '',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_dataset_id ON dataset_import_jobs(dataset_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON dataset_import_jobs(status);

-- -------------------------------------------------------------
-- 4. DATASET_COLUMNS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dataset_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    column_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('feature', 'target', 'identifier', 'metadata')),
    units VARCHAR(64) DEFAULT '',
    missing_pct DOUBLE PRECISION DEFAULT 0.0,
    distinct_count INTEGER DEFAULT 0,
    summary_statistics JSONB DEFAULT '{}'::jsonb,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_dataset_col UNIQUE(dataset_id, column_name)
);

CREATE INDEX IF NOT EXISTS idx_dataset_columns_dataset_id ON dataset_columns(dataset_id);

-- -------------------------------------------------------------
-- 5. EXPERIMENTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    dataset_version_id UUID REFERENCES dataset_versions(id) ON DELETE SET NULL,
    target_column VARCHAR(255) NOT NULL,
    task_type VARCHAR(64) DEFAULT 'regression' CHECK (task_type IN ('regression', 'classification')),
    model_family VARCHAR(128) NOT NULL,
    optimization_method VARCHAR(64) DEFAULT 'optuna_tpe',
    memory_mode VARCHAR(64) DEFAULT 'baseline' CHECK (memory_mode IN ('baseline', 'success_only', 'failure_recovery')),
    split_strategy VARCHAR(64) DEFAULT 'holdout_train_val',
    random_seed INTEGER DEFAULT 42,
    configuration JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(64) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'BUDGET_EXHAUSTED')),
    budget_seconds DOUBLE PRECISION DEFAULT 180.0 CHECK (budget_seconds > 0),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiments_dataset_id ON experiments(dataset_id);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_memory_mode ON experiments(memory_mode);

-- -------------------------------------------------------------
-- 6. EXPERIMENT_METRICS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiment_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    metric_name VARCHAR(64) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    dataset_split VARCHAR(32) NOT NULL DEFAULT 'val' CHECK (dataset_split IN ('train', 'val', 'test', 'cv')),
    metric_unit VARCHAR(32) DEFAULT '',
    sample_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiment_metrics_exp_id ON experiment_metrics(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_metrics_name ON experiment_metrics(metric_name);

-- -------------------------------------------------------------
-- 7. MODEL_ARTIFACTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    model_family VARCHAR(128) NOT NULL,
    artifact_path TEXT NOT NULL,
    serialization_format VARCHAR(32) DEFAULT 'joblib',
    model_version VARCHAR(64) DEFAULT '1.0.0',
    checksum VARCHAR(64) NOT NULL,
    feature_schema JSONB DEFAULT '[]'::jsonb,
    training_duration_ms DOUBLE PRECISION DEFAULT 0.0,
    package_versions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_artifacts_exp_id ON model_artifacts(experiment_id);

-- -------------------------------------------------------------
-- 8. PREDICTIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    sample_reference VARCHAR(255) NOT NULL,
    actual_value DOUBLE PRECISION,
    predicted_value DOUBLE PRECISION NOT NULL,
    residual DOUBLE PRECISION,
    uncertainty DOUBLE PRECISION,
    split VARCHAR(32) DEFAULT 'val',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_exp_id ON predictions(experiment_id);
CREATE INDEX IF NOT EXISTS idx_predictions_split ON predictions(split);

-- -------------------------------------------------------------
-- 9. FAILURE_EVENTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS failure_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    failure_category VARCHAR(128) NOT NULL,
    error_summary TEXT NOT NULL,
    error_fingerprint VARCHAR(255) NOT NULL,
    stage VARCHAR(64) DEFAULT 'TRAINING',
    retry_number INTEGER DEFAULT 0,
    sanitized_diagnostics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failure_events_exp_id ON failure_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_failure_events_fingerprint ON failure_events(error_fingerprint);

-- -------------------------------------------------------------
-- 10. FAILURE_MEMORY
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS failure_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    failure_pattern VARCHAR(255) NOT NULL,
    root_cause_hypothesis TEXT NOT NULL,
    proposed_repair JSONB NOT NULL DEFAULT '{}'::jsonb,
    repair_provenance TEXT DEFAULT '',
    affected_configuration JSONB DEFAULT '{}'::jsonb,
    schema_fingerprint VARCHAR(128) DEFAULT '',
    validation_status VARCHAR(64) DEFAULT 'PROPOSED' CHECK (validation_status IN ('PROPOSED', 'VALIDATED', 'REJECTED', 'SUPERSEDED')),
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failure_memory_status ON failure_memory(validation_status);

-- -------------------------------------------------------------
-- 11. RECOVERY_ATTEMPTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recovery_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    failure_event_id UUID REFERENCES failure_events(id) ON DELETE SET NULL,
    failure_memory_id UUID REFERENCES failure_memory(id) ON DELETE SET NULL,
    repair_attempt JSONB NOT NULL,
    validation_outcome VARCHAR(64) NOT NULL CHECK (validation_outcome IN ('PASSED', 'FAILED', 'REJECTED')),
    execution_cost_ms DOUBLE PRECISION DEFAULT 0.0,
    resulting_metrics JSONB DEFAULT '{}'::jsonb,
    is_successful BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recovery_attempts_mem_id ON recovery_attempts(failure_memory_id);

-- -------------------------------------------------------------
-- 12. RESOURCE_PROFILES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resource_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    elapsed_time_s DOUBLE PRECISION NOT NULL,
    cpu_time_s DOUBLE PRECISION DEFAULT 0.0,
    peak_memory_mb DOUBLE PRECISION DEFAULT 0.0,
    rows_processed INTEGER DEFAULT 0,
    model_fit_time_s DOUBLE PRECISION DEFAULT 0.0,
    preprocessing_time_s DOUBLE PRECISION DEFAULT 0.0,
    retrieval_latency_ms DOUBLE PRECISION DEFAULT 0.0,
    total_run_duration_s DOUBLE PRECISION DEFAULT 0.0,
    is_measured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_profiles_exp_id ON resource_profiles(experiment_id);

-- -------------------------------------------------------------
-- 13. EXPERIMENT_COMPARISONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiment_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name VARCHAR(255) NOT NULL,
    dataset_name VARCHAR(255) NOT NULL,
    target_name VARCHAR(255) NOT NULL,
    participating_experiment_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    matching_configuration JSONB DEFAULT '{}'::jsonb,
    metric_deltas JSONB DEFAULT '{}'::jsonb,
    budget_seconds DOUBLE PRECISION DEFAULT 180.0,
    validity_status VARCHAR(64) DEFAULT 'VALID' CHECK (validity_status IN ('VALID', 'INVALID', 'BUDGET_INCONSISTENT')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comparisons_group ON experiment_comparisons(group_name);

-- -------------------------------------------------------------
-- 14. AUDIT_EVENTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_ts ON audit_events(timestamp DESC);

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE failure_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failure_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to datasets, experiments, benchmarks, and metrics
CREATE POLICY "Public Read Datasets" ON datasets FOR SELECT USING (true);
CREATE POLICY "Public Read Dataset Versions" ON dataset_versions FOR SELECT USING (true);
CREATE POLICY "Public Read Dataset Columns" ON dataset_columns FOR SELECT USING (true);
CREATE POLICY "Public Read Experiments" ON experiments FOR SELECT USING (true);
CREATE POLICY "Public Read Metrics" ON experiment_metrics FOR SELECT USING (true);
CREATE POLICY "Public Read Predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Public Read Memory" ON failure_memory FOR SELECT USING (true);
CREATE POLICY "Public Read Profiles" ON resource_profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Comparisons" ON experiment_comparisons FOR SELECT USING (true);

-- Allow authenticated / service-role write operations
CREATE POLICY "Service Role Full Access Datasets" ON datasets FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Dataset Versions" ON dataset_versions FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Import Jobs" ON dataset_import_jobs FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Dataset Columns" ON dataset_columns FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Experiments" ON experiments FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Metrics" ON experiment_metrics FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Artifacts" ON model_artifacts FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Predictions" ON predictions FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Failure Events" ON failure_events FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Failure Memory" ON failure_memory FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Recovery Attempts" ON recovery_attempts FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Resource Profiles" ON resource_profiles FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Comparisons" ON experiment_comparisons FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
CREATE POLICY "Service Role Full Access Audit" ON audit_events FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
