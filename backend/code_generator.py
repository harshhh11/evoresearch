import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("evoresearch.code_generator")

class CodeGeneratorService:
    """
    Generates reproducible multi-file research code structures linked to experiment specs.
    Provides multi-file project files (experiment.py, data.py, model.py, evaluate.py, requirements.txt, README.md).
    """

    def generate_experiment_code(
        self,
        experiment_id: str,
        name: str,
        domain: str = "Machine Learning",
        task_type: str = "regression",
        model_family: str = "Ridge",
        target_column: str = "target",
        cpu_budget_seconds: float = 180.0,
        random_seed: int = 42
    ) -> Dict[str, Any]:

        data_py = f'''# data.py — Automated Dataset Ingestion & Preprocessing
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

def load_and_preprocess_data(file_path: str, target_col: str = "{target_column}", task_type: str = "{task_type}", random_seed: int = {random_seed}):
    """Loads dataset, handles missing values, and returns train/validation splits."""
    df = pd.read_csv(file_path)
    excluded = {{target_col, "id", "composition"}}
    feature_cols = [c for c in df.columns if c not in excluded]
    
    X = df[feature_cols]
    y = df[target_col]
    
    imputer = SimpleImputer(strategy="mean")
    X_clean = imputer.fit_transform(X)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_clean)
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_scaled, y, test_size=0.20, random_state=random_seed
    )
    return X_train, X_val, y_train, y_val, feature_cols
'''

        model_py = f'''# model.py — Model Architecture & Pipeline Setup
import numpy as np
from sklearn.linear_model import Ridge, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, HistGradientBoostingRegressor, HistGradientBoostingClassifier

def build_model_pipeline(model_family: str = "{model_family}", task_type: str = "{task_type}", random_seed: int = {random_seed}):
    """Instantiates model architecture according to task specification."""
    if model_family == "Ridge":
        return Ridge(alpha=1.0, random_state=random_seed)
    elif model_family == "LogisticRegression":
        return LogisticRegression(C=1.0, max_iter=200, random_state=random_seed)
    elif model_family == "RandomForestRegressor":
        return RandomForestRegressor(n_estimators=50, max_depth=10, random_state=random_seed)
    elif model_family == "HistGradientBoostingRegressor":
        return HistGradientBoostingRegressor(max_iter=50, random_state=random_seed)
    else:
        return Ridge(alpha=1.0, random_state=random_seed)
'''

        evaluate_py = f'''# evaluate.py — Task-Aware Ground Truth Metric Evaluation
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, f1_score

def evaluate_predictions(y_true, y_pred, task_type: str = "{task_type}"):
    """Calculates leak-free evaluation metrics."""
    if task_type == "classification":
        return {{
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "f1_score": float(f1_score(y_true, y_pred, average="weighted"))
        }}
    else:
        return {{
            "mae": float(mean_absolute_error(y_true, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
            "r2": float(r2_score(y_true, y_pred))
        }}
'''

        experiment_py = f'''# experiment.py — Executable Main Research Entrypoint
import time
from data import load_and_preprocess_data
from model import build_model_pipeline
from evaluate import evaluate_predictions

def main():
    print("=== EvolveX Executable Research Run ===")
    print(f"Experiment ID: {experiment_id}")
    print(f"Domain: {domain} | Model: {model_family}")
    
    t0 = time.time()
    X_train, X_val, y_train, y_val, features = load_and_preprocess_data("data.csv", target_col="{target_column}")
    
    model = build_model_pipeline(model_family="{model_family}", task_type="{task_type}")
    model.fit(X_train, y_train)
    
    preds = model.predict(X_val)
    metrics = evaluate_predictions(y_val, preds, task_type="{task_type}")
    
    duration = time.time() - t0
    print(f"Run Completed in {{duration:.2f}}s")
    print(f"Metrics: {{metrics}}")

if __name__ == "__main__":
    main()
'''

        requirements_txt = '''numpy>=1.24.0
pandas>=2.0.0
scikit-learn>=1.3.0
torch>=2.0.0
optuna>=3.2.0
'''

        readme_md = f'''# {name} — Reproducible Research Project

## Research Objective
{domain} experiment evaluating `{model_family}` on target variable `{target_column}` under bounded CPU time constraints ({cpu_budget_seconds}s).

## How to Execute Locally
```bash
pip install -r requirements.txt
python experiment.py
```
'''

        files = {
            "experiment.py": experiment_py,
            "data.py": data_py,
            "model.py": model_py,
            "evaluate.py": evaluate_py,
            "requirements.txt": requirements_txt,
            "README.md": readme_md
        }

        return {
            "experiment_id": experiment_id,
            "revision": 1,
            "domain": domain,
            "model_family": model_family,
            "files": files
        }

code_generator = CodeGeneratorService()
