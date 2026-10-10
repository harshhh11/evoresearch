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
    description = Column(Text, default="")
    file_path = Column(String(512), nullable=False)
    row_count = Column(Integer, default=0)
    col_count = Column(Integer, default=0)
    target_col = Column(String(128), default="")
    task_type = Column(String(64), default="classification")  # classification or regression
    feature_names = Column(Text, default="[]")  # JSON list
    summary_stats = Column(Text, default="{}")  # JSON object
    created_at = Column(DateTime, default=utc_now)

    experiments = relationship("Experiment", back_populates="dataset")

class Experiment(Base, SerializerMixin):
    __tablename__ = "experiments"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    name = Column(String(255), nullable=False)
    task_type = Column(String(64), default="classification")
    baseline_model = Column(String(128), default="LogisticRegression")
    candidate_models = Column(Text, default="[]")  # JSON list
    preprocessing_config = Column(Text, default="{}")  # JSON object
    evaluation_metrics = Column(Text, default="[]")  # JSON list
    cpu_budget_seconds = Column(Float, default=30.0)
    trial_budget = Column(Integer, default=10)
    random_seed = Column(Integer, default=42)
    efficiency_constraints = Column(Text, default="{}")  # JSON object e.g. {"max_latency_us": 5000, "max_size_kb": 500}
    status = Column(String(64), default="PLANNED")  # PLANNED, QUEUED, RUNNING, EVALUATING, COMPLETED, FAILED, CANCELLED, BUDGET_EXHAUSTED
    error_message = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    project = relationship("Project", back_populates="experiments")
    dataset = relationship("Dataset", back_populates="experiments")
    runs = relationship("Run", back_populates="experiment", cascade="all, delete-orphan")
    studies = relationship("OptimizationStudy", back_populates="experiment", cascade="all, delete-orphan")

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
    metrics = Column(Text, default="{}")  # JSON object with accuracy, f1, roc_auc, mae, rmse etc.
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
    objective = Column(String(64), default="f1")  # f1, accuracy, roc_auc, mae, rmse, latency_constrained
    direction = Column(String(32), default="maximize")
    total_trials = Column(Integer, default=15)
    completed_trials = Column(Integer, default=0)
    cpu_budget_seconds = Column(Float, default=30.0)
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

class ScientificEvaluation(Base, SerializerMixin):
    __tablename__ = "scientific_evaluations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    dataset_name = Column(String(128), default="breast_cancer")
    task_type = Column(String(64), default="classification")
    cpu_budget_seconds = Column(Float, default=20.0)
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
    evidence_type = Column(String(64), default="MEASURED_DATA")  # MEASURED_DATA, CITED_PAPER, SYSTEM_SPEC
    supporting_reference_id = Column(String(128), default="")
    source_metric = Column(String(128), default="")
    status = Column(String(64), default="SUPPORTED_MEASURED")  # SUPPORTED_MEASURED, SUPPORTED_CITED, PARTIALLY_SUPPORTED, UNSUPPORTED, REQUIRES_REVIEW
    notes = Column(Text, default="")
    verified_at = Column(DateTime, default=utc_now)

    report = relationship("Report", back_populates="claim_verifications")

class AuditEvent(Base, SerializerMixin):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), nullable=True)
    entity_type = Column(String(64), nullable=False)  # EXPERIMENT, RUN, OPTIMIZATION, MEMORY, REPORT, DATASET
    entity_id = Column(String(64), nullable=False)
    action = Column(String(64), nullable=False)       # CREATED, STARTED, COMPLETED, FAILED, RECOVERED, VALIDATED, CANCELLED
    details = Column(Text, default="{}")
    timestamp = Column(DateTime, default=utc_now)
