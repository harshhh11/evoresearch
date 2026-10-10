import io
import time
import pickle
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
    mean_absolute_error, root_mean_squared_error, r2_score, mean_squared_error
)

# Models
from sklearn.linear_model import LogisticRegression, LinearRegression, Ridge
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    HistGradientBoostingClassifier, HistGradientBoostingRegressor
)
from sklearn.svm import SVC

MODEL_CATALOGUE = {
    "classification": {
        "LogisticRegression": LogisticRegression,
        "DecisionTreeClassifier": DecisionTreeClassifier,
        "RandomForestClassifier": RandomForestClassifier,
        "HistGradientBoostingClassifier": HistGradientBoostingClassifier,
        "SVC": SVC,
    },
    "regression": {
        "LinearRegression": LinearRegression,
        "Ridge": Ridge,
        "DecisionTreeRegressor": DecisionTreeRegressor,
        "RandomForestRegressor": RandomForestRegressor,
        "HistGradientBoostingRegressor": HistGradientBoostingRegressor,
    }
}

def build_preprocessor(
    df: pd.DataFrame,
    target_col: str,
    impute_strategy: str = "mean",
    scaler_type: str = "standard",
    cat_impute_strategy: str = "most_frequent"
) -> Tuple[ColumnTransformer, List[str], List[str]]:
    feature_cols = [c for c in df.columns if c != target_col]
    
    num_cols = df[feature_cols].select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df[feature_cols].select_dtypes(exclude=[np.number]).columns.tolist()
    
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
    
    # Inject reproducible seed if model accepts it
    if "random_state" in model_cls().get_params():
        clean_params.setdefault("random_state", random_seed)
        
    # Safeguards for edge execution
    if model_name == "SVC":
        clean_params.setdefault("max_iter", 2000)
        clean_params.setdefault("probability", True)
    elif model_name == "LogisticRegression":
        clean_params.setdefault("max_iter", 500)
    
    return model_cls(**clean_params)

def measure_efficiency_and_metrics(
    pipeline: Pipeline,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
    X_test: Optional[pd.DataFrame] = None,
    y_test: Optional[pd.Series] = None,
    task_type: str = "classification"
) -> Dict[str, Any]:
    tracemalloc.start()
    start_cpu = time.process_time()
    start_wall = time.perf_counter()
    
    # Train
    pipeline.fit(X_train, y_train)
    
    train_wall_s = time.perf_counter() - start_wall
    train_cpu_s = time.process_time() - start_cpu
    current_mem, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    
    # Validation predictions
    y_val_pred = pipeline.predict(X_val)
    
    # Latency benchmark (single sample latency)
    warmup_n = 10
    bench_n = 50
    sample = X_val.iloc[:1]
    
    for _ in range(warmup_n):
        _ = pipeline.predict(sample)
        
    latencies = []
    for _ in range(bench_n):
        t0 = time.perf_counter()
        _ = pipeline.predict(sample)
        latencies.append((time.perf_counter() - t0) * 1_000_000) # microseconds
        
    mean_latency_us = float(np.mean(latencies))
    p95_latency_us = float(np.percentile(latencies, 95))
    
    # Serialized model size in KB
    buf = io.BytesIO()
    pickle.dump(pipeline, buf)
    size_kb = len(buf.getvalue()) / 1024.0
    
    # Calculate metrics
    metrics = {}
    if task_type == "classification":
        metrics["accuracy"] = float(accuracy_score(y_val, y_val_pred))
        metrics["f1"] = float(f1_score(y_val, y_val_pred, average="weighted", zero_division=0))
        metrics["precision"] = float(precision_score(y_val, y_val_pred, average="weighted", zero_division=0))
        metrics["recall"] = float(recall_score(y_val, y_val_pred, average="weighted", zero_division=0))
        
        # ROC AUC if probabilities available
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
        metrics["mae"] = float(mean_absolute_error(y_val, y_val_pred))
        metrics["rmse"] = float(root_mean_squared_error(y_val, y_val_pred))
        metrics["r2"] = float(r2_score(y_val, y_val_pred))
        metrics["mse"] = float(mean_squared_error(y_val, y_val_pred))
        
    # Test metrics if provided
    test_metrics = {}
    if X_test is not None and y_test is not None:
        y_test_pred = pipeline.predict(X_test)
        if task_type == "classification":
            test_metrics["test_accuracy"] = float(accuracy_score(y_test, y_test_pred))
            test_metrics["test_f1"] = float(f1_score(y_test, y_test_pred, average="weighted", zero_division=0))
        else:
            test_metrics["test_mae"] = float(mean_absolute_error(y_test, y_test_pred))
            test_metrics["test_rmse"] = float(root_mean_squared_error(y_test, y_test_pred))
            test_metrics["test_r2"] = float(r2_score(y_test, y_test_pred))

    # Parameter count / tree nodes
    param_count = 0
    estimator = pipeline.named_steps.get("model")
    if hasattr(estimator, "tree_"):
        param_count = int(estimator.tree_.node_count)
    elif hasattr(estimator, "estimators_"):
        param_count = sum(getattr(e, "tree_", None).node_count for e in estimator.estimators_ if hasattr(e, "tree_"))
    elif hasattr(estimator, "coef_"):
        param_count = int(np.prod(estimator.coef_.shape) + (estimator.intercept_.size if hasattr(estimator, "intercept_") else 0))

    return {
        "metrics": metrics,
        "test_metrics": test_metrics,
        "train_time_ms": float(train_wall_s * 1000.0),
        "train_cpu_s": float(train_cpu_s),
        "inference_latency_us": mean_latency_us,
        "p95_latency_us": p95_latency_us,
        "model_size_kb": float(size_kb),
        "peak_memory_mb": float(peak_mem / (1024.0 * 1024.0)),
        "param_count": param_count,
    }
