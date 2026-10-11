import pytest
import json
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db, SessionLocal
from backend.adapters.domain_registry import domain_registry
from backend.paper_parser import paper_parser
from backend.supermemory_service import supermemory_service
from backend.compute_router import compute_router
from backend.orchestrator import orchestrator
from backend.adaptive_planner import adaptive_planner

client = TestClient(app)

def test_domain_registry():
    domains = domain_registry.list_supported_domains()
    assert len(domains) >= 5
    keys = [d["key"] for d in domains]
    assert "materials_science" in keys
    assert "edge_ml" in keys
    assert "cpu_ml" in keys
    assert "threed_ml" in keys
    assert "general_research" in keys

def test_paper_parser():
    sample_text = """
    MobileNetV2 INT8 Quantization for Edge Intelligence
    Abstract: We present an INT8 quantized MobileNetV2 architecture for efficient edge deployment on MCU devices.
    Methodology: Quantized using PyTorch post-training INT8 quantization. Measured MAE and inference latency.
    Datasets: Evaluated on ImageNet and EdgeML benchmark datasets.
    """
    spec = paper_parser.parse_paper(sample_text, filename="mobilenet_edge.pdf")
    assert spec["domain"] == "Edge & Efficient ML"
    assert "INT8" in spec["title"] or "MobileNetV2" in spec["title"]
    assert len(spec["extracted_facts"]) > 0
    assert len(spec["ai_inferences"]) > 0
    assert len(spec["assumptions_requiring_researcher_approval"]) > 0

def test_compute_router():
    hw = compute_router.get_system_hardware_profile()
    assert "cpu_cores" in hw
    assert hw["cpu_cores"] > 0

    route = compute_router.evaluate_route(
        domain="edge_ml",
        sample_count=5000,
        model_family="MobileNetV2",
        execution_strategy="Hybrid",
        cpu_budget_seconds=180.0
    )
    assert "recommended_provider" in route
    assert "estimated_resource_usage" in route

def test_supermemory_status_and_query():
    status = supermemory_service.get_status()
    assert status["provider"] == "Supermemory Context API"
    assert "local_fallback_active" in status

    db = SessionLocal()
    try:
        memories = supermemory_service.retrieve_context_memories(db, query="Ridge", model_family="Ridge")
        assert isinstance(memories, list)
    finally:
        db.close()

def test_evolvex_api_endpoints():
    # 1. Domains endpoint
    r_dom = client.get("/api/domains")
    assert r_dom.status_code == 200
    assert len(r_dom.json()) >= 5

    # 2. Paper parse endpoint
    r_paper = client.post("/api/paper/parse", json={"paper_text": "KAN: Kolmogorov-Arnold Networks for Tabular Science"})
    assert r_paper.status_code == 200
    assert r_paper.json()["domain"] == "CPU-Based Machine Learning"

    # 3. Compute router endpoint
    r_comp = client.post("/api/compute/router", json={"domain": "3d_reconstruction", "model_family": "PointNet"})
    assert r_comp.status_code == 200
    assert "recommended_provider" in r_comp.json()

    # 4. Supermemory status endpoint
    r_sm = client.get("/api/supermemory/status")
    assert r_sm.status_code == 200
    assert r_sm.json()["provider"] == "Supermemory Context API"
