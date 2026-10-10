import os
import io
import time
import pickle
import hashlib
import tracemalloc
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, OneHotEncoder
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score, roc_auc_score,
    mean_absolute_error, root_mean_squared_error, r2_score, mean_squared_error,
    median_absolute_error
)

# Models
from sklearn.dummy import DummyRegressor, DummyClassifier
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    ExtraTreesClassifier, ExtraTreesRegressor,
    HistGradientBoostingClassifier, HistGradientBoostingRegressor
)
from sklearn.svm import SVC, SVR

MODEL_CATALOGUE = {
    "classification": {
        "DummyClassifier": DummyClassifier,
        "LogisticRegression": LogisticRegression,
        "DecisionTreeClassifier": DecisionTreeClassifier,
        "RandomForestClassifier": RandomForestClassifier,
        "ExtraTreesClassifier": ExtraTreesClassifier,
        "HistGradientBoostingClassifier": HistGradientBoostingClassifier,
        "SVC": SVC,
    },
    "regression": {
        "DummyRegressor": DummyRegressor,
        "Ridge": Ridge,
        "LinearRegression": LinearRegression,
        "DecisionTreeRegressor": DecisionTreeRegressor,
        "RandomForestRegressor": RandomForestRegressor,
        "ExtraTreesRegressor": ExtraTreesRegressor,
        "HistGradientBoostingRegressor": HistGradientBoostingRegressor,
        "SVR": SVR,
    }
}

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "artifacts", "models")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def build_preprocessor(
    df: pd.DataFrame,
    target_col: str,
    id_col: Optional[str] = "id",
    exclude_cols: Optional[List[str]] = None,
    impute_strategy: str = "mean",
    scaler_type: str = "standard",
    cat_impute_strategy: str = "most_frequent"
) -> Tuple[ColumnTransformer, List[str], List[str]]:
    # Exclude target and identifier columns from input features to prevent leakage
    excluded = {target_col}
    if id_col and id_col in df.columns:
        excluded.add(id_col)
    if exclude_cols:
        excluded.update(exclude_cols)
    # Automatically exclude companion materials target to prevent cross-target leakage
    if target_col == "bandgap_energy_ev" and "formation_energy_ev_natom" in df.columns:
        excluded.add("formation_energy_ev_natom")
    elif target_col == "formation_energy_ev_natom" and "bandgap_energy_ev" in df.columns:
        excluded.add("bandgap_energy_ev")
    if "composition" in df.columns and "mean_atomic_mass" in df.columns:
        excluded.add("composition")

    feature_cols = [c for c in df.columns if c not in excluded]

    num_cols = [c for c in feature_cols if pd.api.types.is_numeric_dtype(df[c].dtype)]
    cat_cols = [c for c in feature_cols if not pd.api.types.is_numeric_dtype(df[c].dtype)]

    # Numeric pipeline
    num_steps = []
    if impute_strategy and impute_strategy != "none":
        num_steps.append(("imputer", SimpleImputer(strategy=impute_strategy)))

    if scaler_type == "standard":
        num_steps.append(("scaler", StandardScaler()))
    elif scaler_type == "minmax":
        num_steps.append(("scaler", MinMaxScaler()))
    elif scaler_type == "robust":
        num_steps.append(("scaler", RobustScaler()))

    num_pipe = Pipeline(num_steps) if num_steps else "passthrough"

    # Categorical pipeline
    cat_steps = []
    if cat_impute_strategy and cat_impute_strategy != "none":
        cat_steps.append(("cat_imputer", SimpleImputer(strategy=cat_impute_strategy)))
    cat_steps.append(("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)))
    cat_pipe = Pipeline(cat_steps)

    transformers = []
    if num_cols:
        transformers.append(("num", num_pipe, num_cols))
    if cat_cols:
        transformers.append(("cat", cat_pipe, cat_cols))

    preprocessor = ColumnTransformer(transformers=transformers, remainder="drop")
    return preprocessor, num_cols, cat_cols

def instantiate_model(model_name: str, task_type: str, params: Optional[Dict[str, Any]] = None, random_seed: int = 42):
    cat = MODEL_CATALOGUE.get(task_type, {})
    if model_name not in cat:
        raise ValueError(f"Unsupported model '{model_name}' for task '{task_type}'. Available: {list(cat.keys())}")

    model_cls = cat[model_name]
    clean_params = dict(params or {})

    # Check if random_state is supported
    dummy_inst = model_cls()
    if hasattr(dummy_inst, "random_state"):
        clean_params.setdefault("random_state", random_seed)

    # Defaults for safe bounded execution
    if model_name == "SVC":
        clean_params.setdefault("max_iter", 2000)
        clean_params.setdefault("probability", True)
    elif model_name == "SVR":
        clean_params.setdefault("max_iter", 2000)
    elif model_name == "LogisticRegression":
        clean_params.setdefault("max_iter", 500)
    elif model_name == "DummyRegressor":
        clean_params.setdefault("strategy", "mean")

    return model_cls(**clean_params)

def measure_efficiency_and_metrics(
    pipeline: Pipeline,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
    X_test: Optional[pd.DataFrame] = None,
    y_test: Optional[pd.Series] = None,
    task_type: str = "regression",
    experiment_id: Optional[str] = None,
    model_name: Optional[str] = None
) -> Dict[str, Any]:
    tracemalloc.start()
    start_cpu = time.process_time()
    start_wall = time.perf_counter()

    # Train strictly on X_train, y_train
    pipeline.fit(X_train, y_train)

    train_wall_s = time.perf_counter() - start_wall
    train_cpu_s = time.process_time() - start_cpu
    current_mem, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    # Validation predictions
    y_val_pred = pipeline.predict(X_val)

    # Latency benchmark
    sample = X_val.iloc[:1]
    warmup_n = 5
    bench_n = 25
    for _ in range(warmup_n):
        _ = pipeline.predict(sample)

    latencies = []
    for _ in range(bench_n):
        t0 = time.perf_counter()
        _ = pipeline.predict(sample)
        latencies.append((time.perf_counter() - t0) * 1_000_000)

    mean_latency_us = float(np.mean(latencies))
    p95_latency_us = float(np.percentile(latencies, 95))

    # Serialized model size and checksum
    buf = io.BytesIO()
    pickle.dump(pipeline, buf)
    buf_bytes = buf.getvalue()
    size_kb = len(buf_bytes) / 1024.0
    checksum = hashlib.sha256(buf_bytes).hexdigest()

    # Save artifact to disk if experiment_id provided
    artifact_path = ""
    if experiment_id and model_name:
        artifact_filename = f"{experiment_id}_{model_name}.pkl"
        artifact_path = os.path.join(ARTIFACTS_DIR, artifact_filename)
        with open(artifact_path, "wb") as f:
            f.write(buf_bytes)

    # Calculate metrics
    metrics = {}
    if task_type == "classification":
        metrics["accuracy"] = float(accuracy_score(y_val, y_val_pred))
        metrics["f1"] = float(f1_score(y_val, y_val_pred, average="weighted", zero_division=0))
        metrics["precision"] = float(precision_score(y_val, y_val_pred, average="weighted", zero_division=0))
        metrics["recall"] = float(recall_score(y_val, y_val_pred, average="weighted", zero_division=0))
        try:
            if hasattr(pipeline, "predict_proba"):
                y_val_prob = pipeline.predict_proba(X_val)
                n_classes = len(np.unique(y_train))
                if n_classes == 2:
                    metrics["roc_auc"] = float(roc_auc_score(y_val, y_val_prob[:, 1]))
                else:
                    metrics["roc_auc"] = float(roc_auc_score(y_val, y_val_prob, multi_class="ovr"))
        except Exception:
            metrics["roc_auc"] = None
    else:
        mae = float(mean_absolute_error(y_val, y_val_pred))
        rmse = float(root_mean_squared_error(y_val, y_val_pred))
        r2 = float(r2_score(y_val, y_val_pred))
        medae = float(median_absolute_error(y_val, y_val_pred))
        metrics["mae"] = round(mae, 4)
        metrics["rmse"] = round(rmse, 4)
        metrics["r2"] = round(r2, 4)
        metrics["median_abs_error"] = round(medae, 4)

    # Generate predictions and residuals sample
    predictions_sample = []
    n_sample = min(len(y_val), 100)
    for i in range(n_sample):
        actual = float(y_val.iloc[i])
        pred = float(y_val_pred[i])
        res = float(pred - actual)
        predictions_sample.append({
            "sample_index": int(i),
            "actual": round(actual, 4),
            "predicted": round(pred, 4),
            "residual": round(res, 4)
        })

    return {
        "metrics": metrics,
        "train_time_ms": round(float(train_wall_s * 1000.0), 2),
        "train_cpu_s": round(float(train_cpu_s), 4),
        "inference_latency_us": round(mean_latency_us, 1),
        "p95_latency_us": round(p95_latency_us, 1),
        "model_size_kb": round(float(size_kb), 2),
        "peak_memory_mb": round(float(peak_mem / (1024.0 * 1024.0)), 2),
        "checksum": checksum,
        "artifact_path": artifact_path,
        "predictions_sample": predictions_sample,
    }
