import os
import logging
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np

from .base_adapter import BaseDatasetAdapter

logger = logging.getLogger("evoresearch.nomad_adapter")

class NomadDatasetAdapter(BaseDatasetAdapter):
    """
    Adapter for NOMAD 2018: Predicting Transparent Conductors
    Supports Task A1 (bandgap_energy_ev) and Task A2 (formation_energy_ev_natom)
    Strictly excludes 'id' and target columns from feature inputs.
    """

    EXPECTED_COLUMNS = [
        "id", "spacegroup", "number_of_total_atoms",
        "percent_atom_al", "percent_atom_ga", "percent_atom_in",
        "lattice_vector_1_ang", "lattice_vector_2_ang", "lattice_vector_3_ang",
        "lattice_angle_alpha_degree", "lattice_angle_beta_degree", "lattice_angle_gamma_degree",
        "formation_energy_ev_natom", "bandgap_energy_ev"
    ]

    TARGET_COLUMNS = ["bandgap_energy_ev", "formation_energy_ev_natom"]
    ID_COLUMN = "id"
    FEATURE_COLUMNS = [
        "spacegroup", "number_of_total_atoms",
        "percent_atom_al", "percent_atom_ga", "percent_atom_in",
        "lattice_vector_1_ang", "lattice_vector_2_ang", "lattice_vector_3_ang",
        "lattice_angle_alpha_degree", "lattice_angle_beta_degree", "lattice_angle_gamma_degree"
    ]

    def __init__(self):
        super().__init__(
            name="NOMAD 2018 — Transparent Conductors",
            slug="nomad-2018-transparent-conductors",
            task_type="regression"
        )

    def process(self, raw_file_path: str, is_test_set: bool = False) -> Dict[str, Any]:
        integrity = self.check_file_integrity(raw_file_path)
        raw_df = pd.read_csv(raw_file_path)

        # 1. Schema Validation
        actual_cols = list(raw_df.columns)
        missing_expected = [c for c in self.FEATURE_COLUMNS if c not in actual_cols]
        if missing_expected:
            raise ValueError(f"NOMAD schema missing required features: {missing_expected}")

        # 2. Check targets
        available_targets = [t for t in self.TARGET_COLUMNS if t in actual_cols]
        if not is_test_set and not available_targets:
            raise ValueError(f"Training dataset requires at least one target: {self.TARGET_COLUMNS}")

        # 3. Clean and Validate
        clean_df = raw_df.copy()

        # Check for NaN / infinite values
        num_cols = [c for c in actual_cols if c != self.ID_COLUMN]
        for c in num_cols:
            clean_df[c] = pd.to_numeric(clean_df[c], errors="coerce")

        # Physical sanity checks
        # Composition fractions check
        comp_sum = clean_df["percent_atom_al"] + clean_df["percent_atom_ga"] + clean_df["percent_atom_in"]
        invalid_comp = (comp_sum < 0.95) | (comp_sum > 1.05)
        if invalid_comp.any():
            self.warnings.append(f"{int(invalid_comp.sum())} materials had total aluminum/gallium/indium fraction slightly outside [0.95, 1.05].")

        # Spacegroup validity (1-230)
        invalid_sg = (clean_df["spacegroup"] < 1) | (clean_df["spacegroup"] > 230)
        if invalid_sg.any():
            self.warnings.append(f"{int(invalid_sg.sum())} rows have invalid crystallographic spacegroup numbers.")

        # Outlier detection
        outliers = self.detect_outliers_iqr(clean_df, self.FEATURE_COLUMNS + available_targets)
        missing_summary = self.detect_missing_values(clean_df)

        # Quality report
        quality_report = self.generate_quality_report(raw_df, clean_df, missing_summary, outliers)
        col_stats = self.compute_column_statistics(clean_df)

        # Save cleaned version locally
        cleaned_dir = os.path.join(os.path.dirname(raw_file_path), "cleaned")
        os.makedirs(cleaned_dir, exist_ok=True)
        version_tag = "v1.0.0"
        clean_filename = f"nomad2018_{'test' if is_test_set else 'train'}_clean_{version_tag}.csv"
        clean_file_path = os.path.join(cleaned_dir, clean_filename)
        clean_df.to_csv(clean_file_path, index=False)

        feature_schema = []
        for col in self.FEATURE_COLUMNS:
            feature_schema.append({
                "name": col,
                "role": "feature",
                "dtype": str(clean_df[col].dtype),
                "units": "angstrom" if "ang" in col else "degree" if "degree" in col else "fraction" if "percent" in col else "count"
            })

        for t in available_targets:
            feature_schema.append({
                "name": t,
                "role": "target",
                "dtype": "float64",
                "units": "eV" if "bandgap" in t else "eV/atom"
            })

        return {
            "name": self.name,
            "slug": self.slug + ("-test" if is_test_set else ""),
            "description": "Materials properties of transparent conductors (Al-Ga-In sesquioxides) including band gap and formation energy per atom.",
            "source_name": "Kaggle NOMAD 2018 Competition",
            "source_url": "https://www.kaggle.com/competitions/nomad2018-predict-transparent-conductors/data",
            "license_notes": "Official competition dataset. Non-commercial research & education use.",
            "version": version_tag,
            "task_type": "regression",
            "sample_count": len(clean_df),
            "feature_count": len(self.FEATURE_COLUMNS),
            "target_columns": available_targets,
            "feature_schema": feature_schema,
            "missing_value_summary": missing_summary,
            "quality_report": quality_report,
            "summary_stats": col_stats,
            "content_hash": integrity["sha256"],
            "raw_storage_path": raw_file_path,
            "clean_storage_path": clean_file_path,
            "is_test_set": is_test_set,
            "df": clean_df
        }
