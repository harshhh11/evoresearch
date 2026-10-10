import time
import json
import optuna
import pandas as pd
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from .models_db import OptimizationStudy, OptimizationTrial, Experiment
from .ml_engine import (
    build_preprocessor, instantiate_model, measure_efficiency_and_metrics
)
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

optuna.logging.set_verbosity(optuna.logging.WARNING)

def run_optuna_study(
    db: Session,
    study_db_id: str,
    df: pd.DataFrame,
    target_col: str,
    task_type: str,
    model_name: str,
    objective_metric: str = "f1",
    direction: str = "maximize",
    total_trials: int = 15,
    cpu_budget_seconds: float = 30.0,
    random_seed: int = 42
) -> Dict[str, Any]:
    study_record = db.query(OptimizationStudy).filter(OptimizationStudy.id == study_db_id).first()
    if not study_record:
        raise ValueError("Optimization study record not found.")

    study_record.status = "RUNNING"
    db.commit()

    # Preprocessing and splits
    preprocessor, num_cols, cat_cols = build_preprocessor(df, target_col)
    X = df[[c for c in df.columns if c != target_col]]
    y = df[target_col]

    stratify = y if task_type == "classification" and y.nunique() > 1 and y.value_counts().min() > 1 else None
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.25, random_state=random_seed, stratify=stratify
    )

    optuna_direction = "maximize" if direction == "maximize" else "minimize"
    optuna_study = optuna.create_study(direction=optuna_direction)

    start_time = time.perf_counter()
    completed_trials = 0
    best_score = None
    best_params = {}
    best_trial_id = None

    def objective_fn(trial: optuna.Trial) -> float:
        nonlocal completed_trials, best_score, best_params, best_trial_id
        
        # Check budget
        elapsed = time.perf_counter() - start_time
        if elapsed >= cpu_budget_seconds:
            trial.set_user_attr("budget_exhausted", True)
            raise optuna.TrialPruned("Study CPU/wall-clock budget exhausted.")

        # Suggest hyperparameters based on model family
        params = {}
        if model_name in ["RandomForestClassifier", "RandomForestRegressor"]:
            params["n_estimators"] = trial.suggest_int("n_estimators", 10, 100, step=10)
            params["max_depth"] = trial.suggest_int("max_depth", 2, 16)
            params["min_samples_split"] = trial.suggest_int("min_samples_split", 2, 8)
        elif model_name in ["HistGradientBoostingClassifier", "HistGradientBoostingRegressor"]:
            params["max_iter"] = trial.suggest_int("max_iter", 20, 100, step=10)
            params["learning_rate"] = trial.suggest_float("learning_rate", 0.02, 0.25, log=True)
            params["max_leaf_nodes"] = trial.suggest_int("max_leaf_nodes", 15, 45)
        elif model_name in ["DecisionTreeClassifier", "DecisionTreeRegressor"]:
            params["max_depth"] = trial.suggest_int("max_depth", 2, 20)
            params["min_samples_split"] = trial.suggest_int("min_samples_split", 2, 8)
        elif model_name == "LogisticRegression":
            params["C"] = trial.suggest_float("C", 0.05, 5.0, log=True)
            params["max_iter"] = 500
        elif model_name == "Ridge":
            params["alpha"] = trial.suggest_float("alpha", 0.05, 10.0, log=True)
        elif model_name == "SVC":
            params["C"] = trial.suggest_float("C", 0.1, 5.0, log=True)
            params["kernel"] = trial.suggest_categorical("kernel", ["linear", "rbf"])

        # Train & evaluate pipeline
        try:
            model = instantiate_model(model_name, task_type, params, random_seed=random_seed + trial.number)
            pipeline = Pipeline([
                ("prep", preprocessor),
                ("model", model)
            ])

            res = measure_efficiency_and_metrics(
                pipeline, X_train, y_train, X_val, y_val, task_type=task_type
            )
            
            score_val = res["metrics"].get(objective_metric)
            if score_val is None:
                # Fallback to accuracy or mae
                score_val = res["metrics"].get("accuracy" if task_type == "classification" else "mae", 0.0)

            # Record trial in DB
            trial_record = OptimizationTrial(
                study_id=study_db_id,
                trial_number=trial.number,
                params=json.dumps(params),
                score=float(score_val),
                train_time_ms=res["train_time_ms"],
                latency_us=res["inference_latency_us"],
                model_size_kb=res["model_size_kb"],
                status="COMPLETE"
            )
            db.add(trial_record)
            db.commit()

            completed_trials += 1
            if (best_score is None) or (direction == "maximize" and score_val > best_score) or (direction == "minimize" and score_val < best_score):
                best_score = float(score_val)
                best_params = params
                best_trial_id = trial_record.id

            return float(score_val)

        except Exception as e:
            trial_record = OptimizationTrial(
                study_id=study_db_id,
                trial_number=trial.number,
                params=json.dumps(params),
                score=None,
                status="FAIL",
                fail_reason=str(e)[:255]
            )
            db.add(trial_record)
            db.commit()
            raise e

    try:
        optuna_study.optimize(
            objective_fn,
            n_trials=total_trials,
            timeout=cpu_budget_seconds,
            catch=(Exception,)
        )
    except Exception:
        pass

    total_elapsed = time.perf_counter() - start_time
    study_record.completed_trials = completed_trials
    study_record.elapsed_seconds = total_elapsed
    study_record.best_score = best_score
    study_record.best_params = json.dumps(best_params)
    study_record.best_trial_id = best_trial_id or ""
    study_record.status = "COMPLETED" if completed_trials >= total_trials else "BUDGET_EXHAUSTED"
    db.commit()

    return {
        "study_id": study_db_id,
        "completed_trials": completed_trials,
        "total_trials": total_trials,
        "best_score": best_score,
        "best_params": best_params,
        "elapsed_seconds": total_elapsed,
        "status": study_record.status
    }
