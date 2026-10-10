import pytest
import json
import pandas as pd
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db, Base, engine, SessionLocal
from backend.sample_data import generate_sample_datasets
from backend.ml_engine import (
    build_preprocessor, instantiate_model, measure_efficiency_and_metrics
)
from backend.recovery_engine import classify_error, propose_repair
from backend.optimizer import run_optuna_study
from backend.scientific_eval import run_scientific_evaluation
from backend.report_generator import build_evidence_linked_report
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_sample_datasets_generated():
    metas = generate_sample_datasets()
    assert len(metas) >= 2
    nomad = next((m for m in metas if "NOMAD" in m["name"]), None)
    assert nomad is not None
    assert nomad["row_count"] == 2400
    assert nomad["task_type"] == "regression"

def test_real_ml_execution():
    from backend.adapters.nomad_adapter import NomadDatasetAdapter
    adapter = NomadDatasetAdapter()
    res_proc = adapter.process("backend/data/materials/nomad2018_train.csv")
    cleaned_df = res_proc["df"]
    assert len(cleaned_df) == 2400
    assert "bandgap_energy_ev" in cleaned_df.columns
    
    prep, _, _ = build_preprocessor(cleaned_df, target_col="bandgap_energy_ev")
    model = instantiate_model("Ridge", "regression", random_seed=42)
    pipe = Pipeline([("prep", prep), ("model", model)])
    
    X = cleaned_df[[c for c in cleaned_df.columns if c not in ["bandgap_energy_ev", "formation_energy_ev_natom", "id"]]]
    y = cleaned_df["bandgap_energy_ev"]
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.20, random_state=42)
    
    res = measure_efficiency_and_metrics(pipe, X_train, y_train, X_val, y_val, task_type="regression")
    assert "mae" in res["metrics"]
    assert res["metrics"]["mae"] < 0.50
    assert res["metrics"]["r2"] > 0.80
    assert res["train_time_ms"] > 0
    assert res["inference_latency_us"] > 0
    assert res["model_size_kb"] > 0

def test_failure_classification_and_recovery():
    # Simulate an error with invalid lbfgs solver + l1 penalty
    try:
        from sklearn.linear_model import LogisticRegression
        m = LogisticRegression(penalty="l1", solver="lbfgs")
        m.fit([[1, 2], [3, 4]], [0, 1])
    except Exception as e:
        import traceback
        cat, sig, diag = classify_error(e, traceback.format_exc())
        assert cat == "INVALID_HYPERPARAMETER"
        repair = propose_repair(cat, sig, {"penalty": "l1", "solver": "lbfgs"}, {})
        assert "hyperparameter_patch" in repair
        assert repair["hyperparameter_patch"]["solver"] == "saga"

def test_api_stats():
    res = client.get("/api/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_experiments" in data
    assert "recovery_rate_pct" in data
    assert "best_validated_score" in data

def test_api_datasets():
    res = client.get("/api/datasets")
    assert res.status_code == 200
    datasets = res.json()
    assert len(datasets) >= 2
    names = [d["name"] for d in datasets]
    assert any("NOMAD" in n for n in names)
    assert any("Matbench" in n for n in names)

def test_api_projects_and_experiment_lifecycle():
    # 1. Create project
    proj_res = client.post("/api/projects", json={
        "name": "Materials Science Benchmark Project",
        "description": "Integration test validation for transparent conductors",
        "research_question": "Does recovery improve materials ML reliability?",
        "hypothesis": "Recovery memory reduces trial failures in regression benchmarks."
    })
    assert proj_res.status_code == 200
    proj_id = proj_res.json()["id"]

    # 2. Get dataset (NOMAD)
    ds_res = client.get("/api/datasets")
    nomad_ds = next(d for d in ds_res.json() if "NOMAD" in d["name"])

    # 3. Create regression experiment
    exp_res = client.post("/api/experiments", json={
        "project_id": proj_id,
        "dataset_id": nomad_ds["id"],
        "name": "Integration Test Nomad Run",
        "task_type": "regression",
        "target_column": "bandgap_energy_ev",
        "baseline_model": "DummyRegressor",
        "candidate_models": ["Ridge", "RandomForestRegressor"],
        "cpu_budget_seconds": 15.0
    })
    assert exp_res.status_code == 200
    exp_id = exp_res.json()["id"]

    # 4. Start experiment
    start_res = client.post(f"/api/experiments/{exp_id}/start")
    assert start_res.status_code == 200
    assert start_res.json()["status"] in ["COMPLETED", "FAILED"]
    assert start_res.json()["completed_runs"] > 0

    # 5. Verify details
    details_res = client.get(f"/api/experiments/{exp_id}")
    assert details_res.status_code == 200
    details = details_res.json()
    assert len(details["runs"]) > 0

    # 6. Generate report
    rep_res = client.post("/api/reports/generate", json={
        "project_id": proj_id,
        "title": "Materials Science Regression Report"
    })
    assert rep_res.status_code == 200
    rep_data = rep_res.json()
    assert "claims" in rep_data

def test_optuna_optimization_study():
    ds_res = client.get("/api/datasets")
    nomad_ds = next(d for d in ds_res.json() if "NOMAD" in d["name"])
    proj_res = client.get("/api/projects")
    proj_id = proj_res.json()[0]["id"]

    exp_res = client.post("/api/experiments", json={
        "project_id": proj_id,
        "dataset_id": nomad_ds["id"],
        "name": "Nomad HPO Study Test",
        "task_type": "regression",
        "target_column": "bandgap_energy_ev",
        "baseline_model": "Ridge",
        "candidate_models": ["Ridge"]
    })
    exp_id = exp_res.json()["id"]

    opt_res = client.post("/api/optimization/start", json={
        "experiment_id": exp_id,
        "model_name": "Ridge",
        "objective": "mae",
        "direction": "minimize",
        "total_trials": 3,
        "cpu_budget_seconds": 10.0
    })
    assert opt_res.status_code == 200
    res_data = opt_res.json()
    assert res_data["completed_trials"] > 0
    assert "best_score" in res_data

def test_scientific_evaluation_abc():
    proj_res = client.get("/api/projects")
    proj_id = proj_res.json()[0]["id"]
    ds_res = client.get("/api/datasets")
    ds_id = ds_res.json()[0]["id"]

    eval_res = client.post("/api/evaluations/run", json={
        "project_id": proj_id,
        "name": "Controlled A/B/C Benchmark",
        "dataset_id": ds_id,
        "cpu_budget_seconds": 10.0,
        "trials_per_condition": 3
    })
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert "condition_a" in eval_data
    assert "condition_b" in eval_data
    assert "condition_c" in eval_data
    assert "conclusion" in eval_data
    assert eval_data["condition_c"]["recovery_attempts"] >= 0
