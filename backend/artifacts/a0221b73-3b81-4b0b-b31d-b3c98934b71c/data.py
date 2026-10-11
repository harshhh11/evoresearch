# data.py — Automated Dataset Ingestion & Preprocessing
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

def load_and_preprocess_data(file_path: str, target_col: str = "fault_detected", task_type: str = "classification", random_seed: int = 42):
    """Loads dataset, handles missing values, and returns train/validation splits."""
    df = pd.read_csv(file_path)
    excluded = {target_col, "id", "composition"}
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
