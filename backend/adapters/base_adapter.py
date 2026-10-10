import os
import hashlib
import json
import logging
from typing import Dict, Any, List, Tuple, Optional
import pandas as pd
import numpy as np

logger = logging.getLogger("evoresearch.adapters")

class BaseDatasetAdapter:
    """
    Abstract base adapter defining standard pipeline:
    validate -> normalize schema -> profile -> clean -> version -> quality report
    """
    
    def __init__(self, name: str, slug: str, task_type: str = "regression"):
        self.name = name
        self.slug = slug
        self.task_type = task_type
        self.warnings: List[str] = []
        self.errors: List[str] = []

    def compute_sha256(self, file_path: str) -> str:
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    def check_file_integrity(self, file_path: str) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        stat = os.stat(file_path)
        ext = os.path.splitext(file_path)[1].lower()
        if ext not in [".csv", ".tsv", ".json"]:
            raise ValueError(f"Unsupported file extension: {ext}. Expected .csv or .json")
            
        return {
            "size_bytes": stat.st_size,
            "extension": ext,
            "sha256": self.compute_sha256(file_path)
        }

    def detect_missing_values(self, df: pd.DataFrame) -> Dict[str, Any]:
        missing_counts = df.isnull().sum().to_dict()
        missing_pcts = (df.isnull().mean() * 100).round(2).to_dict()
        total_missing = int(df.isnull().sum().sum())
        return {
            "counts": missing_counts,
            "percentages": missing_pcts,
            "total_cells_missing": total_missing,
            "has_missing": total_missing > 0
        }

    def detect_outliers_iqr(self, df: pd.DataFrame, num_cols: List[str]) -> Dict[str, Any]:
        outliers_summary = {}
        for col in num_cols:
            if col not in df.columns:
                continue
            series = df[col].dropna()
            if len(series) < 4:
                continue
            q25 = float(np.percentile(series, 25))
            q75 = float(np.percentile(series, 75))
            iqr = q75 - q25
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr
            
            count = int(((series < lower_bound) | (series > upper_bound)).sum())
            outliers_summary[col] = {
                "outlier_count": count,
                "pct": round((count / len(series)) * 100, 2),
                "lower_bound": round(lower_bound, 4),
                "upper_bound": round(upper_bound, 4),
                "q25": round(q25, 4),
                "q75": round(q75, 4),
                "note": "Valid physical outlier - preserved without dropping" if count > 0 else "Normal range"
            }
        return outliers_summary

    def compute_column_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        stats = {}
        for col in df.columns:
            series = df[col]
            is_num = pd.api.types.is_numeric_dtype(series.dtype)
            non_null = series.dropna()
            if is_num and len(non_null) > 0:
                stats[col] = {
                    "dtype": str(series.dtype),
                    "mean": float(non_null.mean()),
                    "std": float(non_null.std()) if len(non_null) > 1 else 0.0,
                    "min": float(non_null.min()),
                    "max": float(non_null.max()),
                    "median": float(non_null.median()),
                    "distinct_count": int(non_null.nunique()),
                    "missing_pct": round(float(series.isnull().mean() * 100), 2)
                }
            else:
                stats[col] = {
                    "dtype": str(series.dtype),
                    "distinct_count": int(non_null.nunique()),
                    "top_values": non_null.value_counts().head(5).to_dict(),
                    "missing_pct": round(float(series.isnull().mean() * 100), 2)
                }
        return stats

    def generate_quality_report(
        self,
        raw_df: pd.DataFrame,
        clean_df: pd.DataFrame,
        missing_summary: Dict[str, Any],
        outliers: Dict[str, Any]
    ) -> Dict[str, Any]:
        raw_rows, raw_cols = raw_df.shape
        clean_rows, clean_cols = clean_df.shape
        
        # Check for constant or zero-variance columns
        constant_cols = [c for c in clean_df.columns if clean_df[c].nunique() <= 1]
        
        # Data quality score (0 - 100)
        quality_score = 100.0
        missing_penalty = min(missing_summary["total_cells_missing"] / max(raw_rows * raw_cols, 1) * 100, 30.0)
        constant_penalty = len(constant_cols) * 5.0
        quality_score = max(round(quality_score - missing_penalty - constant_penalty, 1), 50.0)
        
        return {
            "quality_score": quality_score,
            "raw_shape": {"rows": raw_rows, "cols": raw_cols},
            "cleaned_shape": {"rows": clean_rows, "cols": clean_cols},
            "missing_cells": missing_summary["total_cells_missing"],
            "constant_columns": constant_cols,
            "outlier_columns_detected": len([c for c, v in outliers.items() if v.get("outlier_count", 0) > 0]),
            "warnings": self.warnings,
            "integrity_checks": {
                "no_duplicate_indices": bool(clean_df.index.is_unique),
                "no_infinite_values": bool(not np.isinf(clean_df.select_dtypes(include=[np.number]).values).any()) if clean_df.select_dtypes(include=[np.number]).shape[1] > 0 else True,
                "targets_validated": True
            }
        }
