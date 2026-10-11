import json
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from .database import Base

def gen_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class SerializerMixin:
    def to_dict(self):
        d = {}
        for c in self.__table__.columns:
            val = getattr(self, c.name)
            if hasattr(val, "isoformat"):
                d[c.name] = val.isoformat()
            else:
                d[c.name] = val
        return d

class Project(Base, SerializerMixin):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    domain = Column(String(128), default="general_ai")
    domain_metadata = Column(Text, default="{}")
    description = Column(Text, default="")
    research_question = Column(Text, default="")
    hypothesis = Column(Text, default="")
    tags = Column(Text, default="[]")  # JSON list
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    experiments = relationship("Experiment", back_populates="project", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="project", cascade="all, delete-orphan")
    evaluations = relationship("ScientificEvaluation", back_populates="project", cascade="all, delete-orphan")

class Dataset(Base, SerializerMixin):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    domain = Column(String(128), default="general_ai")
    domain_metadata = Column(Text, default="{}")
    slug = Column(String(255), default="")
    description = Column(Text, default="")
    source_name = Column(String(255), default="")
    source_url = Column(Text, default="")
    license_notes = Column(Text, default="")
    dataset_version = Column(String(64), default="1.0.0")
    file_path = Column(String(512), nullable=False)
    clean_file_path = Column(String(512), default="")
    row_count = Column(Integer, default=0)
    col_count = Column(Integer, default=0)
    target_col = Column(String(128), default="")
    target_columns = Column(Text, default="[]")  # JSON list of targets
    task_type = Column(String(64), default="regression")  # regression or classification
    feature_names = Column(Text, default="[]")  # JSON list
    feature_schema = Column(Text, default="[]")  # JSON list of schema objects
    missing_value_summary = Column(Text, default="{}")  # JSON object
    quality_report = Column(Text, default="{}")  # JSON object
    content_hash = Column(String(64), default="")
    status = Column(String(64), default="ACTIVE")
    summary_stats = Column(Text, default="{}")  # JSON object
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    experiments = relationship("Experiment", back_populates="dataset")
    versions = relationship("DatasetVersion", back_populates="dataset", cascade="all, delete-orphan")
    columns = relationship("DatasetColumn", back_populates="dataset", cascade="all, delete-orphan")

class DatasetVersion(Base, SerializerMixin):
    __tablename__ = "dataset_versions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    version_tag = Column(String(64), default="v1.0.0")
    content_hash = Column(String(64), default="")
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    schema_snapshot = Column(Text, default="{}")
    cleaning_version = Column(String(64), default="v1")
    provenance = Column(Text, default="{}")
    created_at = Column(DateTime, default=utc_now)

    dataset = relationship("Dataset", back_populates="versions")

class DatasetImportJob(Base, SerializerMixin):
    __tablename__ = "dataset_import_jobs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    dataset_id = Column(String(36), nullable=True)
    source_type = Column(String(128), default="FILE_UPLOAD")
    source_uri = Column(Text, default="")
    status = Column(String(64), default="COMPLETED")  # STARTED, VALIDATING, CLEANING, COMPLETED, FAILED
    rows_received = Column(Integer, default=0)
    rows_accepted = Column(Integer, default=0)
    rows_rejected = Column(Integer, default=0)
    rows_deduplicated = Column(Integer, default=0)
    validation_errors = Column(Text, default="[]")
    cleaning_summary = Column(Text, default="{}")
    duration_ms = Column(Float, default=0.0)
    error_details = Column(Text, default="")
    started_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, default=utc_now)

class DatasetColumn(Base, SerializerMixin):
    __tablename__ = "dataset_columns"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    column_name = Column(String(255), nullable=False)
    data_type = Column(String(64), default="float64")
    role = Column(String(32), default="feature")  # feature, target, identifier, metadata
    units = Column(String(64), default="")
    missing_pct = Column(Float, default=0.0)
    distinct_count = Column(Integer, default=0)
    summary_statistics = Column(Text, default="{}")
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    dataset = relationship("Dataset", back_populates="columns")

class Experiment(Base, SerializerMixin):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    dataset_version_id = Column(String(36), nullable=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(128), default="general_ai")
    domain_metadata = Column(Text, default="{}")
    execution_stage = Column(String(64), default="DRAFT") # DRAFT, ANALYZING, PLANNING, AWAITING_APPROVAL, PREPARING_DATA, PREPARING_ENV, QUEUED, EXECUTING, EVALUATING, RECOVERING, COMPLETED, FAILED, CANCELLED
    paper_reference = Column(Text, default="")
    hypothesis = Column(Text, default="")
    research_question = Column(Text, default="")
    hardware_requirements = Column(Text, default="{}")
    compute_provider = Column(String(128), default="local")
    reproducibility_status = Column(String(64), default="REPRODUCIBLE")
    target_column = Column(String(128), default="")
    task_type = Column(String(64), default="regression")
    model_family = Column(String(128), default="Ridge")
    baseline_model = Column(String(128), default="DummyRegressor")
    candidate_models = Column(Text, default="[]")  # JSON list
    optimization_method = Column(String(64), default="optuna_tpe")
    memory_mode = Column(String(64), default="baseline")  # baseline, success_only, failure_recovery
    split_strategy = Column(String(64), default="holdout_train_val")
    preprocessing_config = Column(Text, default="{}")  # JSON object
    evaluation_metrics = Column(Text, default="[]")  # JSON list
    cpu_budget_seconds = Column(Float, default=180.0)
    trial_budget = Column(Integer, default=15)
    random_seed = Column(Integer, default=42)
    efficiency_constraints = Column(Text, default="{}")
    status = Column(String(64), default="PLANNED")  # PLANNED, QUEUED, RUNNING, EVALUATING, COMPLETED, FAILED, CANCELLED, BUDGET_EXHAUSTED
    error_message = Column(Text, default="")
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    project = relationship("Project", back_populates="experiments")
    dataset = relationship("Dataset", back_populates="experiments")
    runs = relationship("Run", back_populates="experiment", cascade="all, delete-orphan")
    studies = relationship("OptimizationStudy", back_populates="experiment", cascade="all, delete-orphan")
    metrics = relationship("ExperimentMetric", back_populates="experiment", cascade="all, delete-orphan")
    artifacts = relationship("ModelArtifact", back_populates="experiment", cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="experiment", cascade="all, delete-orphan")
    resource_profiles = relationship("ResourceProfile", back_populates="experiment", cascade="all, delete-orphan")

class ExperimentMetric(Base, SerializerMixin):
    __tablename__ = "experiment_metrics"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    metric_name = Column(String(64), nullable=False)
    metric_value = Column(Float, nullable=False)
    dataset_split = Column(String(32), default="val")
    metric_unit = Column(String(32), default="")
    sample_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    experiment = relationship("Experiment", back_populates="metrics")

class ModelArtifact(Base, SerializerMixin):
    __tablename__ = "model_artifacts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    model_family = Column(String(128), nullable=False)
    artifact_path = Column(String(512), nullable=False)
    serialization_format = Column(String(32), default="joblib")
    model_version = Column(String(64), default="1.0.0")
    checksum = Column(String(64), default="")
    feature_schema = Column(Text, default="[]")
    training_duration_ms = Column(Float, default=0.0)
    package_versions = Column(Text, default="{}")
    created_at = Column(DateTime, default=utc_now)

    experiment = relationship("Experiment", back_populates="artifacts")

class PredictionRecord(Base, SerializerMixin):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    sample_reference = Column(String(255), default="")
    actual_value = Column(Float, nullable=True)
    predicted_value = Column(Float, nullable=False)
    residual = Column(Float, nullable=True)
    uncertainty = Column(Float, nullable=True)
    split = Column(String(32), default="val")
    created_at = Column(DateTime, default=utc_now)

    experiment = relationship("Experiment", back_populates="predictions")

class ResourceProfile(Base, SerializerMixin):
    __tablename__ = "resource_profiles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    elapsed_time_s = Column(Float, default=0.0)
    cpu_time_s = Column(Float, default=0.0)
    peak_memory_mb = Column(Float, default=0.0)
    rows_processed = Column(Integer, default=0)
    model_fit_time_s = Column(Float, default=0.0)
    preprocessing_time_s = Column(Float, default=0.0)
    retrieval_latency_ms = Column(Float, default=0.0)
    total_run_duration_s = Column(Float, default=0.0)
    is_measured = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    experiment = relationship("Experiment", back_populates="resource_profiles")

class Run(Base, SerializerMixin):
    __tablename__ = "runs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    model_name = Column(String(128), nullable=False)
    hyperparameters = Column(Text, default="{}")  # JSON object
    status = Column(String(64), default="QUEUED")  # QUEUED, RUNNING, COMPLETED, FAILED, RECOVERED
    train_time_ms = Column(Float, default=0.0)
    inference_latency_us = Column(Float, default=0.0)
    model_size_kb = Column(Float, default=0.0)
    peak_memory_mb = Column(Float, default=0.0)
    param_count = Column(Integer, default=0)
    metrics = Column(Text, default="{}")  # JSON object
    error_message = Column(Text, default="")
    traceback = Column(Text, default="")
    retry_count = Column(Integer, default=0)
    recovery_attempted = Column(Boolean, default=False)
    recovery_successful = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    experiment = relationship("Experiment", back_populates="runs")
    failures = relationship("FailureRecord", back_populates="run", cascade="all, delete-orphan")

class OptimizationStudy(Base, SerializerMixin):
    __tablename__ = "optimization_studies"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    name = Column(String(255), nullable=False)
    objective = Column(String(64), default="mae")  # mae, rmse, r2, f1, accuracy
    direction = Column(String(32), default="minimize")
    total_trials = Column(Integer, default=15)
    completed_trials = Column(Integer, default=0)
    cpu_budget_seconds = Column(Float, default=180.0)
    elapsed_seconds = Column(Float, default=0.0)
    best_trial_id = Column(String(36), default="")
    best_score = Column(Float, nullable=True)
    best_params = Column(Text, default="{}")
    status = Column(String(64), default="QUEUED")  # QUEUED, RUNNING, COMPLETED, CANCELLED, BUDGET_EXHAUSTED
    created_at = Column(DateTime, default=utc_now)

    experiment = relationship("Experiment", back_populates="studies")
    trials = relationship("OptimizationTrial", back_populates="study", cascade="all, delete-orphan")

class OptimizationTrial(Base, SerializerMixin):
    __tablename__ = "optimization_trials"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    study_id = Column(String(36), ForeignKey("optimization_studies.id"), nullable=False)
    trial_number = Column(Integer, nullable=False)
    params = Column(Text, default="{}")
    score = Column(Float, nullable=True)
    train_time_ms = Column(Float, default=0.0)
    latency_us = Column(Float, default=0.0)
    model_size_kb = Column(Float, default=0.0)
    status = Column(String(32), default="COMPLETE")  # COMPLETE, PRUNED, FAIL
    fail_reason = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)

    study = relationship("OptimizationStudy", back_populates="trials")

class FailureRecord(Base, SerializerMixin):
    __tablename__ = "failure_records"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    run_id = Column(String(36), ForeignKey("runs.id"), nullable=True)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    error_category = Column(String(128), nullable=False)
    error_signature = Column(String(255), nullable=False)
    error_message = Column(Text, default="")
    traceback = Column(Text, default="")
    diagnosis = Column(Text, default="")
    proposed_repair = Column(Text, default="{}")
    applied_repair = Column(Text, default="{}")
    retry_number = Column(Integer, default=1)
    outcome = Column(String(64), default="FAILED")  # RECOVERED, FAILED, POLICY_REJECTED
    created_at = Column(DateTime, default=utc_now)

    run = relationship("Run", back_populates="failures")

class FailureEvent(Base, SerializerMixin):
    __tablename__ = "failure_events"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    failure_category = Column(String(128), nullable=False)
    error_summary = Column(Text, default="")
    error_fingerprint = Column(String(255), default="")
    stage = Column(String(64), default="TRAINING")
    retry_number = Column(Integer, default=0)
    sanitized_diagnostics = Column(Text, default="{}")
    created_at = Column(DateTime, default=utc_now)

class RecoveryMemory(Base, SerializerMixin):
    __tablename__ = "recovery_memory"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    task_type = Column(String(64), nullable=False)
    dataset_fingerprint = Column(String(128), default="")
    model_family = Column(String(128), nullable=False)
    error_category = Column(String(128), nullable=False)
    error_signature = Column(String(255), nullable=False)
    diagnosis = Column(Text, nullable=False)
    proposed_repair = Column(Text, default="{}")  # JSON
    actual_repair = Column(Text, default="{}")    # JSON
    validation_result = Column(Text, default="{}") # JSON
    reuse_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    state = Column(String(32), default="VALIDATED")  # PROPOSED, UNVERIFIED, VALIDATED, REJECTED, SUPERSEDED
    evidence_reference = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class RecoveryAttempt(Base, SerializerMixin):
    __tablename__ = "recovery_attempts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    failure_event_id = Column(String(36), nullable=True)
    failure_memory_id = Column(String(36), nullable=True)
    repair_attempt = Column(Text, default="{}")
    validation_outcome = Column(String(64), default="PASSED")  # PASSED, FAILED, REJECTED
    execution_cost_ms = Column(Float, default=0.0)
    resulting_metrics = Column(Text, default="{}")
    is_successful = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

class ExperimentComparison(Base, SerializerMixin):
    __tablename__ = "experiment_comparisons"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    group_name = Column(String(255), nullable=False)
    dataset_name = Column(String(255), nullable=False)
    target_name = Column(String(255), nullable=False)
    participating_experiment_ids = Column(Text, default="[]")
    matching_configuration = Column(Text, default="{}")
    metric_deltas = Column(Text, default="{}")
    budget_seconds = Column(Float, default=180.0)
    validity_status = Column(String(64), default="VALID")
    created_at = Column(DateTime, default=utc_now)

class ScientificEvaluation(Base, SerializerMixin):
    __tablename__ = "scientific_evaluations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    dataset_name = Column(String(128), default="NOMAD 2018")
    task_type = Column(String(64), default="regression")
    cpu_budget_seconds = Column(Float, default=30.0)
    trials_per_condition = Column(Integer, default=10)
    condition_a_results = Column(Text, default="{}")  # Standard Optuna
    condition_b_results = Column(Text, default="{}")  # Success-only memory
    condition_c_results = Column(Text, default="{}")  # Failure-and-recovery memory
    comparison_metrics = Column(Text, default="{}")
    conclusion = Column(Text, default="")
    status = Column(String(64), default="COMPLETED")
    created_at = Column(DateTime, default=utc_now)

    project = relationship("Project", back_populates="evaluations")

class ResearchPaper(Base, SerializerMixin):
    __tablename__ = "research_papers"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(512), nullable=False)
    authors = Column(String(512), default="")
    year = Column(Integer, default=2024)
    venue = Column(String(255), default="")
    doi_url = Column(String(512), default="")
    abstract = Column(Text, default="")
    problem = Column(Text, default="")
    method = Column(Text, default="")
    findings = Column(Text, default="")
    limitations = Column(Text, default="")
    relevance_to_evoresearch = Column(Text, default="")
    tags = Column(Text, default="[]")
    created_at = Column(DateTime, default=utc_now)

class Report(Base, SerializerMixin):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    research_question = Column(Text, default="")
    hypothesis = Column(Text, default="")
    summary = Column(Text, default="")
    methodology = Column(Text, default="")
    results_table = Column(Text, default="[]")  # JSON list
    visualizations_data = Column(Text, default="{}")  # JSON
    failures_summary = Column(Text, default="")
    memory_overhead_summary = Column(Text, default="")
    reproducibility_notes = Column(Text, default="")
    limitations = Column(Text, default="")
    conclusion = Column(Text, default="")
    claims = Column(Text, default="[]")  # JSON list of claims
    status = Column(String(32), default="DRAFT")  # DRAFT, PUBLISHED
    created_at = Column(DateTime, default=utc_now)

    project = relationship("Project", back_populates="reports")
    claim_verifications = relationship("ClaimVerification", back_populates="report", cascade="all, delete-orphan")

class ClaimVerification(Base, SerializerMixin):
    __tablename__ = "claim_verifications"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    report_id = Column(String(36), ForeignKey("reports.id"), nullable=False)
    claim_text = Column(Text, nullable=False)
    evidence_type = Column(String(64), default="MEASURED_DATA")
    supporting_reference_id = Column(String(128), default="")
    source_metric = Column(String(128), default="")
    status = Column(String(64), default="SUPPORTED_MEASURED")
    notes = Column(Text, default="")
    verified_at = Column(DateTime, default=utc_now)

    report = relationship("Report", back_populates="claim_verifications")

class AuditEvent(Base, SerializerMixin):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), nullable=True)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=False)
    action = Column(String(64), nullable=False)
    details = Column(Text, default="{}")
    timestamp = Column(DateTime, default=utc_now)

class EmailDispatchRecord(Base, SerializerMixin):
    __tablename__ = "email_dispatches"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email_id = Column(String(64), nullable=False, unique=True, index=True)
    recipient = Column(String(255), nullable=False)
    sender = Column(String(255), nullable=False)
    subject = Column(String(512), nullable=False)
    message_body = Column(Text, default="")
    template_name = Column(String(128), default="RESEARCH_REPORT")
    report_id = Column(String(64), nullable=True)
    status = Column(String(64), default="QUEUED")  # QUEUED, SENDING, ACCEPTED, DELIVERED, DELAYED, BOUNCED, FAILED
    provider = Column(String(64), default="RESEND")  # RESEND, SMTP, MOCK_TEST
    provider_msg_id = Column(String(255), default="")
    idempotency_key = Column(String(128), default="", index=True)
    attempt_count = Column(Integer, default=1)
    error_message = Column(Text, default="")
    delivery_evidence = Column(Text, default="{}")  # JSON metadata
    dispatched_live = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class AgentTrace(Base, SerializerMixin):
    __tablename__ = "agent_traces"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    experiment_id = Column(String(36), ForeignKey("experiments.id"), nullable=False)
    agent_name = Column(String(128), nullable=False)
    stage = Column(String(64), nullable=False)
    status = Column(String(64), default="COMPLETED")  # PENDING, RUNNING, COMPLETED, FAILED, RECOVERING, SKIPPED, BLOCKED, CANCELLED
    action = Column(String(255), default="")
    input_summary = Column(Text, default="{}")
    output_summary = Column(Text, default="{}")
    tool_calls = Column(Text, default="[]")
    model_identifier = Column(String(128), default="auto")
    tokens_used = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    duration_s = Column(Float, default=0.0)
    error_message = Column(Text, default="")
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


