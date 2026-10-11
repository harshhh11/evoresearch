import os
import json
import logging
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from .base_adapter import BaseDatasetAdapter

logger = logging.getLogger("evoresearch.adapters.general")

class GeneralDomainAdapter(BaseDatasetAdapter):
    """
    General-Purpose Domain Adapter for arbitrary scientific datasets, tabular tasks,
    and user-supplied research problems.
    Infers domain, schema, target columns, task type, and metric selection automatically.
    """

    def __init__(self, name: str = "General Scientific Research Domain", slug: str = "general_research", task_type: str = "auto"):
        super().__init__(name=name, slug=slug, task_type=task_type)

    def process(self, file_path: str) -> Dict[str, Any]:
        integrity = self.check_file_integrity(file_path)
        ext = integrity["extension"]

        if ext == ".csv":
            df = pd.read_csv(file_path)
        elif ext == ".tsv":
            df = pd.read_csv(file_path, sep="\t")
        else:
            df = pd.DataFrame(json.load(open(file_path)))

        clean_df = df.dropna().copy()
        missing_summary = self.detect_missing_values(df)
        outliers = self.detect_outliers_iqr(clean_df, [c for c in clean_df.columns if pd.api.types.is_numeric_dtype(clean_df[c])])
        quality = self.generate_quality_report(df, clean_df, missing_summary, outliers)

        # Detect target column and task type
        target_col = clean_df.columns[-1]
        for candidate in ["target", "label", "y", "output", "class", "response", "result"]:
            if candidate in clean_df.columns:
                target_col = candidate
                break

        target_series = clean_df[target_col] if target_col in clean_df.columns else clean_df.iloc[:, -1]
        if self.task_type == "auto":
            if pd.api.types.is_numeric_dtype(target_series.dtype) and target_series.nunique() > 15:
                inferred_task = "regression"
            else:
                inferred_task = "classification"
        else:
            inferred_task = self.task_type

        return {
            "name": self.name,
            "slug": self.slug,
            "description": f"General-purpose research dataset ({inferred_task.upper()}) with automated schema inference.",
            "source_name": "General Research Ingestion",
            "source_url": f"file://{os.path.basename(file_path)}",
            "license_notes": "User-supplied dataset",
            "version": "1.0.0",
            "clean_storage_path": file_path,
            "sample_count": len(clean_df),
            "df": clean_df,
            "target_columns": [target_col],
            "task_type": inferred_task,
            "feature_schema": self.compute_column_statistics(clean_df),
            "missing_value_summary": missing_summary,
            "quality_report": quality,
            "content_hash": integrity["sha256"],
            "summary_stats": self.compute_column_statistics(clean_df)
        }
