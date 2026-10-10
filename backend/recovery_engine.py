import re
import traceback
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from .models_db import RecoveryMemory, FailureRecord, Run

ERROR_CATEGORIES = [
    "MISSING_VALUES",
    "UNKNOWN_CATEGORIES",
    "INVALID_HYPERPARAMETER",
    "CONVERGENCE_FAILURE",
    "DATASET_SCHEMA_MISMATCH",
    "METRIC_INCOMPATIBILITY",
    "RESOURCE_TIMEOUT"
]

def classify_error(err: Exception, tb_str: str) -> Tuple[str, str, str]:
    msg = str(err)
    err_type = type(err).__name__
    combined = f"{err_type}: {msg}\n{tb_str}"
    
    if "Input X contains NaN" in combined or "contains NaN, infinity" in combined or "missing values" in combined.lower():
        cat = "MISSING_VALUES"
        diag = "Input dataset contains missing/NaN values that were not handled by an imputer step prior to model fitting."
        sig = "Input X contains NaN or infinite values"
    elif "could not convert string to float" in combined or "unsupported operand type" in combined or "Found array with 0 feature(s)" in combined:
        cat = "UNKNOWN_CATEGORIES"
        diag = "Categorical string columns were passed directly into a numerical estimator without OneHot or Ordinal encoding."
        sig = "String column unencoded for numerical estimator"
    elif "ConvergenceWarning" in combined or "STOP: TOTAL NO. of ITERATIONS REACHED LIMIT" in combined or "lbfgs failed to converge" in combined:
        cat = "CONVERGENCE_FAILURE"
        diag = "Optimization solver failed to converge within the allowed maximum iteration budget."
        sig = "Solver failed to reach convergence within max_iter"
    elif "Invalid parameter" in combined or "unexpected keyword argument" in combined or "ValueError: LogisticRegression" in combined or "solver" in combined.lower() and "supports only" in combined.lower():
        cat = "INVALID_HYPERPARAMETER"
        diag = "Incompatible hyperparameter combination or invalid argument passed to model constructor."
        sig = f"Invalid parameter configuration: {msg[:100]}"
    elif "Only one class present in y_true" in combined or "roc_auc_score" in combined.lower():
        cat = "METRIC_INCOMPATIBILITY"
        diag = "Target labels have only a single class or evaluation metric is mathematically undefined for this partition."
        sig = "Evaluation metric undefined on split partition"
    elif "Target column" in combined or "Empty dataset" in combined:
        cat = "DATASET_SCHEMA_MISMATCH"
        diag = "Dataset schema does not contain the specified target column or has zero rows."
        sig = "Dataset schema mismatch or missing target"
    elif "Timeout" in combined or "BudgetExhausted" in combined:
        cat = "RESOURCE_TIMEOUT"
        diag = "Execution exceeded the allocated CPU-time or wall-clock budget."
        sig = "Resource or CPU-time budget exceeded"
    else:
        cat = "INVALID_HYPERPARAMETER"
        diag = f"Runtime execution failure: {msg}"
        sig = f"{err_type}: {msg[:80]}"
        
    return cat, sig, diag

def query_recovery_memory(
    db: Session,
    task_type: str,
    model_family: str,
    error_category: str
) -> Optional[RecoveryMemory]:
    """Retrieve verified failure-and-recovery memory if exists and is VALIDATED."""
    match = db.query(RecoveryMemory).filter(
        RecoveryMemory.error_category == error_category,
        RecoveryMemory.state == "VALIDATED"
    ).order_by(RecoveryMemory.success_count.desc()).first()
    return match

def propose_repair(
    error_category: str,
    error_signature: str,
    current_params: Dict[str, Any],
    current_preprocessing: Dict[str, Any],
    memory_record: Optional[RecoveryMemory] = None
) -> Dict[str, Any]:
    """Proposes a bounded, deterministic repair based on verified memory or rule-based policy."""
    if memory_record and memory_record.actual_repair:
        import json
        try:
            return json.loads(memory_record.actual_repair)
        except Exception:
            pass

    repair = {
        "preprocessing_patch": {},
        "hyperparameter_patch": {},
        "rationale": ""
    }

    if error_category == "MISSING_VALUES":
        repair["preprocessing_patch"] = {
            "impute_strategy": "median",
            "cat_impute_strategy": "most_frequent"
        }
        repair["rationale"] = "Inject SimpleImputer with median strategy for numerical and most_frequent for categorical features."
    elif error_category == "UNKNOWN_CATEGORIES":
        repair["preprocessing_patch"] = {
            "encoder": "onehot_ignore_unknown"
        }
        repair["rationale"] = "Ensure OneHotEncoder is enabled with handle_unknown='ignore' across all non-numeric columns."
    elif error_category == "CONVERGENCE_FAILURE":
        repair["hyperparameter_patch"] = {
            "max_iter": max(current_params.get("max_iter", 100) * 3, 1000),
            "tol": 1e-3
        }
        repair["rationale"] = "Increase max_iter threefold and relax tolerance slightly to ensure safe CPU convergence."
    elif error_category == "INVALID_HYPERPARAMETER":
        cleaned = dict(current_params)
        # Fix common solver / penalty conflicts in logistic regression
        if "penalty" in cleaned and cleaned.get("penalty") == "l1":
            cleaned["solver"] = "saga"
        elif "criterion" in cleaned and cleaned["criterion"] not in ["gini", "entropy", "log_loss", "squared_error", "absolute_error", "friedman_mse"]:
            cleaned.pop("criterion", None)
        repair["hyperparameter_patch"] = cleaned
        repair["rationale"] = "Correct incompatible solver/penalty combinations and eliminate unsupported hyperparameters."
    elif error_category == "METRIC_INCOMPATIBILITY":
        repair["rationale"] = "Fallback to macro-averaged F1 and accuracy when multi-class probability scores cannot evaluate ROC-AUC."

    return repair
