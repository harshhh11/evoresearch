import pytest
import json
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db, SessionLocal
from backend.models_db import Experiment, Project, Dataset, AgentTrace
from backend.orchestrator import orchestrator, VALID_STATE_TRANSITIONS
from backend.benchmark_suite import benchmark_runner

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_multi_agent_orchestration_cycle():
    db = SessionLocal()
    try:
        # Check or create test experiment
        exp = db.query(Experiment).first()
        if not exp:
            proj = Project(name="Orchestration Test Project")
            ds = Dataset(name="Test Dataset", file_path="backend/data/materials/nomad2018_train.csv")
            db.add(proj)
            db.add(ds)
            db.commit()
            exp = Experiment(project_id=proj.id, dataset_id=ds.id, name="Test Multi-Agent Exp", task_type="regression")
            db.add(exp)
            db.commit()

        # Run 12-agent orchestration cycle
        res = orchestrator.run_full_orchestration_cycle(db, experiment_id=exp.id, execution_strategy="Hybrid")
        assert res["orchestration_status"] == "COMPLETED"
        assert res["total_agents_invoked"] == 12
        assert "metrics" in res

        # Verify state machine transitions and traces stored in database
        updated_exp = db.query(Experiment).filter(Experiment.id == exp.id).first()
        assert updated_exp.execution_stage == "COMPLETED"

        traces = db.query(AgentTrace).filter(AgentTrace.experiment_id == exp.id).all()
        assert len(traces) >= 10
        agent_names = {t.agent_name for t in traces}
        assert "ResearchPlannerAgent" in agent_names
        assert "ExecutionAgent" in agent_names
        assert "EvaluationAgent" in agent_names
    finally:
        db.close()

def test_controlled_failure_autopsy_and_recovery():
    db = SessionLocal()
    try:
        exp = db.query(Experiment).first()
        assert exp is not None

        # Inject controlled failure into execution stage
        res = orchestrator.run_full_orchestration_cycle(db, experiment_id=exp.id, force_failure_stage="EXECUTING")
        assert res["orchestration_status"] == "COMPLETED"
        assert res["recovered_from_failure"] is True

        traces = db.query(AgentTrace).filter(AgentTrace.experiment_id == exp.id).all()
        recovery_traces = [t for t in traces if t.agent_name in ["FailureAutopsyAgent", "RecoveryAgent"]]
        assert len(recovery_traces) >= 2
    finally:
        db.close()

def test_system_benchmark_suite():
    db = SessionLocal()
    try:
        bm_res = benchmark_runner.run_benchmark_suite(db)
        assert bm_res["completed_tasks"] >= 3
        assert bm_res["system_quality_metrics"]["objective_completion_rate_pct"] > 0.0
        assert bm_res["system_quality_metrics"]["reproducibility_score"] >= 0.90
    finally:
        db.close()

def test_orchestration_api_endpoints():
    db = SessionLocal()
    try:
        exp = db.query(Experiment).first()
        assert exp is not None

        res_orch = client.get(f"/api/experiments/{exp.id}/orchestration")
        assert res_orch.status_code == 200
        data = res_orch.json()
        assert data["experiment_id"] == exp.id
        assert len(data["agent_roles"]) == 12

        res_evts = client.get(f"/api/experiments/{exp.id}/events")
        assert res_evts.status_code == 200
        assert "events" in res_evts.json()
    finally:
        db.close()
