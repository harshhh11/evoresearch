# model.py — Model Architecture & Pipeline Setup
import numpy as np
from sklearn.linear_model import Ridge, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, HistGradientBoostingRegressor, HistGradientBoostingClassifier

def build_model_pipeline(model_family: str = "Ridge", task_type: str = "classification", random_seed: int = 42):
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
