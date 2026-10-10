import os
import json
import logging
import numpy as np
import pandas as pd
from sklearn.datasets import (
    load_breast_cancer, load_wine, load_iris, load_diabetes
)

from .adapters.nomad_adapter import NomadDatasetAdapter
from .adapters.matbench_adapter import MatbenchDatasetAdapter

logger = logging.getLogger("evoresearch.sample_data")

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
MAT_DIR = os.path.join(DATA_DIR, "materials")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MAT_DIR, exist_ok=True)

def generate_sample_datasets():
    datasets_meta = []

    # ============================================================
    # MATERIALS SCIENCE DATASETS (CORE BENCHMARKS)
    # ============================================================
    # 1. NOMAD 2018 — Transparent Conductors
    nomad_path = os.path.join(MAT_DIR, "nomad2018_train.csv")
    if os.path.exists(nomad_path):
        try:
            nomad_adapter = NomadDatasetAdapter()
            n_res = nomad_adapter.process(nomad_path)
            datasets_meta.append({
                "name": n_res["name"],
                "slug": n_res["slug"],
                "description": n_res["description"],
                "source_name": n_res["source_name"],
                "source_url": n_res["source_url"],
                "license_notes": n_res["license_notes"],
                "dataset_version": n_res["version"],
                "file_path": n_res["clean_storage_path"],
                "clean_file_path": n_res["clean_storage_path"],
                "row_count": n_res["sample_count"],
                "col_count": n_res["df"].shape[1],
                "target_col": "bandgap_energy_ev",
                "target_columns": n_res["target_columns"],
                "task_type": "regression",
                "features": [c for c in n_res["df"].columns if c not in n_res["target_columns"] and c != "id"],
                "feature_schema": n_res["feature_schema"],
                "missing_value_summary": n_res["missing_value_summary"],
                "quality_report": n_res["quality_report"],
                "content_hash": n_res["content_hash"],
                "summary_stats": n_res["summary_stats"]
            })
        except Exception as e:
            logger.error(f"Error processing NOMAD dataset: {e}")

    # 2. Matbench — Experimental Band Gap (matbench_expt_gap)
    mb_path = os.path.join(MAT_DIR, "matbench_expt_gap.csv")
    if os.path.exists(mb_path):
        try:
            mb_adapter = MatbenchDatasetAdapter()
            mb_res = mb_adapter.process(mb_path)
            datasets_meta.append({
                "name": mb_res["name"],
                "slug": mb_res["slug"],
                "description": mb_res["description"],
                "source_name": mb_res["source_name"],
                "source_url": mb_res["source_url"],
                "license_notes": mb_res["license_notes"],
                "dataset_version": mb_res["version"],
                "file_path": mb_res["clean_storage_path"],
                "clean_file_path": mb_res["clean_storage_path"],
                "row_count": mb_res["sample_count"],
                "col_count": mb_res["df"].shape[1],
                "target_col": "gap expt",
                "target_columns": mb_res["target_columns"],
                "task_type": "regression",
                "features": mb_adapter.FEATURE_NAMES,
                "feature_schema": mb_res["feature_schema"],
                "missing_value_summary": mb_res["missing_value_summary"],
                "quality_report": mb_res["quality_report"],
                "content_hash": mb_res["content_hash"],
                "summary_stats": mb_res["summary_stats"]
            })
        except Exception as e:
            logger.error(f"Error processing Matbench dataset: {e}")

    # ============================================================
    # TABULAR EDGE & MEDICAL BENCHMARKS (SUPPORTING SUITE)
    # ============================================================
    # 3. Breast Cancer (Classification)
    bc_path = os.path.join(DATA_DIR, "breast_cancer.csv")
    if not os.path.exists(bc_path):
        bc = load_breast_cancer(as_frame=True)
        bc_df = bc.frame
        bc_df.to_csv(bc_path, index=False)
    else:
        bc_df = pd.read_csv(bc_path)
    datasets_meta.append({
        "name": "Breast Cancer Diagnostic",
        "slug": "breast-cancer-diagnostic",
        "description": "Standard binary classification benchmark for edge diagnostic modeling (569 samples, 30 features).",
        "file_path": bc_path,
        "clean_file_path": bc_path,
        "row_count": len(bc_df),
        "col_count": len(bc_df.columns),
        "target_col": "target",
        "target_columns": ["target"],
        "task_type": "classification",
        "features": [c for c in bc_df.columns if c != "target"],
        "feature_schema": [],
        "missing_value_summary": {"total_cells_missing": 0},
        "quality_report": {"quality_score": 100.0},
        "content_hash": "",
        "summary_stats": {}
    })

    # 4. Edge Sensor Faults (Synthetic with missing values & categorical tag)
    fault_path = os.path.join(DATA_DIR, "edge_sensor_faults.csv")
    if not os.path.exists(fault_path):
        np.random.seed(42)
        n = 400
        sensor_a = np.random.normal(50, 10, n)
        sensor_b = np.random.normal(120, 25, n)
        vibration = np.random.exponential(2.5, n)
        region = np.random.choice(["Node-North", "Node-South", "Node-West"], size=n)
        
        mask_nan = np.random.rand(n) < 0.08
        sensor_a[mask_nan] = np.nan
        fault = ((vibration > 4.0) | (sensor_a > 65)).astype(int)
        
        fault_df = pd.DataFrame({
            "sensor_temp_c": sensor_a,
            "sensor_pressure_kpa": sensor_b,
            "vibration_rms": vibration,
            "gateway_location": region,
            "fault_detected": fault
        })
        fault_df.to_csv(fault_path, index=False)
    else:
        fault_df = pd.read_csv(fault_path)
    datasets_meta.append({
        "name": "Edge Sensor Telemetry (Faults & NaNs)",
        "slug": "edge-sensor-telemetry",
        "description": "Industrial IoT benchmark containing missing sensor telemetry and categorical node gateways for failure recovery testing.",
        "file_path": fault_path,
        "clean_file_path": fault_path,
        "row_count": len(fault_df),
        "col_count": len(fault_df.columns),
        "target_col": "fault_detected",
        "target_columns": ["fault_detected"],
        "task_type": "classification",
        "features": [c for c in fault_df.columns if c != "fault_detected"],
        "feature_schema": [],
        "missing_value_summary": {"total_cells_missing": int(fault_df.isnull().sum().sum())},
        "quality_report": {"quality_score": 92.0},
        "content_hash": "",
        "summary_stats": {}
    })

    return datasets_meta
