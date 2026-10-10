import os
import numpy as np
import pandas as pd
from sklearn.datasets import (
    load_breast_cancer, load_wine, load_iris, fetch_california_housing, load_diabetes
)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

def generate_sample_datasets():
    datasets_meta = []

    # 1. Breast Cancer (Classification)
    bc_path = os.path.join(DATA_DIR, "breast_cancer.csv")
    if not os.path.exists(bc_path):
        bc = load_breast_cancer(as_frame=True)
        bc_df = bc.frame
        bc_df.to_csv(bc_path, index=False)
    else:
        bc_df = pd.read_csv(bc_path)
    datasets_meta.append({
        "name": "Breast Cancer Diagnostic",
        "description": "Standard binary classification benchmark for edge diagnostic modeling (569 samples, 30 features).",
        "file_path": bc_path,
        "row_count": len(bc_df),
        "col_count": len(bc_df.columns),
        "target_col": "target",
        "task_type": "classification",
        "features": [c for c in bc_df.columns if c != "target"]
    })

    # 2. Wine Recognition (Multi-class Classification)
    wine_path = os.path.join(DATA_DIR, "wine.csv")
    if not os.path.exists(wine_path):
        w = load_wine(as_frame=True)
        w_df = w.frame
        w_df.to_csv(wine_path, index=False)
    else:
        w_df = pd.read_csv(wine_path)
    datasets_meta.append({
        "name": "Wine Cultivar Profiling",
        "description": "Multi-class chemical analysis benchmark with 13 continuous attributes and 3 classes.",
        "file_path": wine_path,
        "row_count": len(w_df),
        "col_count": len(w_df.columns),
        "target_col": "target",
        "task_type": "classification",
        "features": [c for c in w_df.columns if c != "target"]
    })

    # 3. Iris Flora (Compact Classification)
    iris_path = os.path.join(DATA_DIR, "iris.csv")
    if not os.path.exists(iris_path):
        ir = load_iris(as_frame=True)
        ir_df = ir.frame
        ir_df.to_csv(iris_path, index=False)
    else:
        ir_df = pd.read_csv(iris_path)
    datasets_meta.append({
        "name": "Iris Flower Morphology",
        "description": "Ultra-compact benchmark (150 rows, 4 features) suited for micro-controller latency tests.",
        "file_path": iris_path,
        "row_count": len(ir_df),
        "col_count": len(ir_df.columns),
        "target_col": "target",
        "task_type": "classification",
        "features": [c for c in ir_df.columns if c != "target"]
    })

    # 4. Housing Valuation (Deterministic Offline Synthetic Tabular Regression)
    housing_path = os.path.join(DATA_DIR, "california_housing.csv")
    if not os.path.exists(housing_path):
        np.random.seed(42)
        n_h = 600
        med_inc = np.random.uniform(1.5, 9.0, n_h)
        house_age = np.random.uniform(5.0, 50.0, n_h)
        ave_rooms = np.random.uniform(3.0, 8.0, n_h)
        ave_bedrms = np.random.uniform(0.8, 2.2, n_h)
        population = np.random.uniform(300, 3000, n_h)
        ave_occup = np.random.uniform(2.0, 5.0, n_h)
        latitude = np.random.uniform(32.5, 42.0, n_h)
        longitude = np.random.uniform(-124.0, -114.0, n_h)
        # target
        med_val = 0.4 * med_inc + 0.01 * house_age - 0.05 * ave_rooms + np.random.normal(0, 0.2, n_h) + 1.2
        ch_df = pd.DataFrame({
            "MedInc": med_inc,
            "HouseAge": house_age,
            "AveRooms": ave_rooms,
            "AveBedrms": ave_bedrms,
            "Population": population,
            "AveOccup": ave_occup,
            "Latitude": latitude,
            "Longitude": longitude,
            "MedHouseVal": np.clip(med_val, 0.5, 5.0)
        })
        ch_df.to_csv(housing_path, index=False)
    else:
        ch_df = pd.read_csv(housing_path)
    datasets_meta.append({
        "name": "California Housing Valuation",
        "description": "Tabular regression task with 8 spatial and demographic attributes (1,000 sample subset).",
        "file_path": housing_path,
        "row_count": len(ch_df),
        "col_count": len(ch_df.columns),
        "target_col": "MedHouseVal",
        "task_type": "regression",
        "features": [c for c in ch_df.columns if c != "MedHouseVal"]
    })

    # 5. Diabetes Disease Progression (Regression)
    diab_path = os.path.join(DATA_DIR, "diabetes.csv")
    if not os.path.exists(diab_path):
        db_data = load_diabetes(as_frame=True)
        db_df = db_data.frame
        db_df.to_csv(diab_path, index=False)
    else:
        db_df = pd.read_csv(diab_path)
    datasets_meta.append({
        "name": "Diabetes Quantitative Progression",
        "description": "Tabular regression dataset with 10 physiological baseline variables (442 samples).",
        "file_path": diab_path,
        "row_count": len(db_df),
        "col_count": len(db_df.columns),
        "target_col": "target",
        "task_type": "regression",
        "features": [c for c in db_df.columns if c != "target"]
    })

    # 6. Edge Sensor Faults (Synthetic with missing values & categorical tag to test failure recovery)
    fault_path = os.path.join(DATA_DIR, "edge_sensor_faults.csv")
    if not os.path.exists(fault_path):
        np.random.seed(42)
        n = 400
        sensor_a = np.random.normal(50, 10, n)
        sensor_b = np.random.normal(120, 25, n)
        vibration = np.random.exponential(2.5, n)
        region = np.random.choice(["Node-North", "Node-South", "Node-West"], size=n)
        
        # Inject 8% random missing values to test failure recovery
        mask_nan = np.random.rand(n) < 0.08
        sensor_a[mask_nan] = np.nan

        # Target: fault triggered if vibration > 4.0 or sensor_a > 65
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
        "description": "Industrial IoT benchmark containing missing sensor telemetry and categorical node gateways for failure recovery testing.",
        "file_path": fault_path,
        "row_count": len(fault_df),
        "col_count": len(fault_df.columns),
        "target_col": "fault_detected",
        "task_type": "classification",
        "features": [c for c in fault_df.columns if c != "fault_detected"]
    })

    return datasets_meta
