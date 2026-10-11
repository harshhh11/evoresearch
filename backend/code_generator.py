import os
import json
import hashlib
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from .models_db import CodeRevision, utc_now

logger = logging.getLogger("evoresearch.code_generator")

class CodeGeneratorService:
    """
    Generates reproducible multi-file research code structures linked to experiment specs.
    Provides multi-file project files (experiment.py, data.py, model.py, evaluate.py, requirements.txt, README.md).
    Persists revisions to DB and local artifact directory.
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
    elif model_family in ["LogisticRegression", "Classifier"]:
        return LogisticRegression(C=1.0, max_iter=200, random_state=random_seed)
    elif model_family in ["RandomForestClassifier", "RandomForest"]:
        return RandomForestClassifier(n_estimators=50, max_depth=10, random_state=random_seed)
    elif model_family == "RandomForestRegressor":
        return RandomForestRegressor(n_estimators=50, max_depth=10, random_state=random_seed)
    elif model_family == "HistGradientBoostingRegressor":
        return HistGradientBoostingRegressor(max_iter=50, random_state=random_seed)
    else:
        if task_type == "classification":
            return RandomForestClassifier(n_estimators=50, max_depth=10, random_state=random_seed)
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

    def generate_and_save_code(
        self,
        db: Session,
        experiment_id: str,
        name: str,
        domain: str = "Machine Learning",
        task_type: str = "regression",
        model_family: str = "Ridge",
        target_column: str = "target",
        cpu_budget_seconds: float = 180.0,
        random_seed: int = 42
    ) -> Dict[str, Any]:
        """Generates code and persists CodeRevision records into DB and local artifact directory."""
        code_res = self.generate_experiment_code(
            experiment_id=experiment_id,
            name=name,
            domain=domain,
            task_type=task_type,
            model_family=model_family,
            target_column=target_column,
            cpu_budget_seconds=cpu_budget_seconds,
            random_seed=random_seed
        )

        artifact_dir = os.path.join(os.path.dirname(__file__), "artifacts", experiment_id)
        os.makedirs(artifact_dir, exist_ok=True)

        for filename, content in code_res["files"].items():
            # Save file on disk
            file_path = os.path.join(artifact_dir, filename)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)

            # Calculate content hash
            chash = hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]

            # DB persistence
            rev = db.query(CodeRevision).filter(
                CodeRevision.experiment_id == experiment_id,
                CodeRevision.file_name == filename
            ).first()

            if not rev:
                rev = CodeRevision(
                    experiment_id=experiment_id,
                    revision=1,
                    file_name=filename,
                    code_content=content,
                    content_hash=chash,
                    status="GENERATED"
                )
                db.add(rev)
            else:
                rev.code_content = content
                rev.content_hash = chash
                rev.updated_at = utc_now()

        db.commit()
        return code_res

    def get_code_revisions(self, db: Session, experiment_id: str) -> Dict[str, Any]:
        """Retrieves saved code revisions from DB."""
        revisions = db.query(CodeRevision).filter(CodeRevision.experiment_id == experiment_id).all()
        if not revisions:
            return {}
        
        files = {r.file_name: r.code_content for r in revisions}
        max_rev = max([r.revision for r in revisions]) if revisions else 1
        return {
            "experiment_id": experiment_id,
            "revision": max_rev,
            "files": files
        }

    def save_code_file(self, db: Session, experiment_id: str, file_name: str, code_content: str) -> Dict[str, Any]:
        """Saves edited code file, increments revision, updates disk file and DB."""
        artifact_dir = os.path.join(os.path.dirname(__file__), "artifacts", experiment_id)
        os.makedirs(artifact_dir, exist_ok=True)

        file_path = os.path.join(artifact_dir, file_name)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code_content)

        chash = hashlib.sha256(code_content.encode("utf-8")).hexdigest()[:16]

        rev = db.query(CodeRevision).filter(
            CodeRevision.experiment_id == experiment_id,
            CodeRevision.file_name == file_name
        ).first()

        if not rev:
            rev = CodeRevision(
                experiment_id=experiment_id,
                revision=2,
                file_name=file_name,
                code_content=code_content,
                content_hash=chash,
                status="EDITED"
            )
            db.add(rev)
        else:
            rev.code_content = code_content
            rev.content_hash = chash
            rev.revision += 1
            rev.status = "EDITED"
            rev.updated_at = utc_now()

        db.commit()
        return {
            "experiment_id": experiment_id,
            "file_name": file_name,
            "status": "SAVED",
            "revision": rev.revision,
            "content_hash": chash
        }

code_generator = CodeGeneratorService()
