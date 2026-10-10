import os
import re
import logging
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np

from .base_adapter import BaseDatasetAdapter

logger = logging.getLogger("evoresearch.matbench_adapter")

# Periodic table properties for elements 1-96: (atomic_number, mass, electronegativity_pauling, radius_pm, valence, group, period)
ELEMENT_PROPERTIES = {
    "H": (1, 1.008, 2.20, 31, 1, 1, 1),
    "He": (2, 4.003, 0.00, 28, 2, 18, 1),
    "Li": (3, 6.94, 0.98, 128, 1, 1, 2),
    "Be": (4, 9.012, 1.57, 96, 2, 2, 2),
    "B": (5, 10.81, 2.04, 84, 3, 13, 2),
    "C": (6, 12.011, 2.55, 76, 4, 14, 2),
    "N": (7, 14.007, 3.04, 71, 5, 15, 2),
    "O": (8, 15.999, 3.44, 66, 6, 16, 2),
    "F": (9, 18.998, 3.98, 57, 7, 17, 2),
    "Ne": (10, 20.180, 0.00, 58, 8, 18, 2),
    "Na": (11, 22.990, 0.93, 166, 1, 1, 3),
    "Mg": (12, 24.305, 1.31, 141, 2, 2, 3),
    "Al": (13, 26.982, 1.61, 121, 3, 13, 3),
    "Si": (14, 28.085, 1.90, 111, 4, 14, 3),
    "P": (15, 30.974, 2.19, 107, 5, 15, 3),
    "S": (16, 32.06, 2.58, 105, 6, 16, 3),
    "Cl": (17, 35.45, 3.16, 102, 7, 17, 3),
    "Ar": (18, 39.95, 0.00, 106, 8, 18, 3),
    "K": (19, 39.098, 0.82, 203, 1, 1, 4),
    "Ca": (20, 40.078, 1.00, 176, 2, 2, 4),
    "Sc": (21, 44.956, 1.36, 170, 3, 3, 4),
    "Ti": (22, 47.867, 1.54, 160, 4, 4, 4),
    "V": (23, 50.942, 1.63, 153, 5, 5, 4),
    "Cr": (24, 51.996, 1.66, 139, 6, 6, 4),
    "Mn": (25, 54.938, 1.55, 139, 7, 7, 4),
    "Fe": (26, 55.845, 1.83, 132, 8, 8, 4),
    "Co": (27, 58.933, 1.88, 126, 9, 9, 4),
    "Ni": (28, 58.693, 1.91, 124, 10, 10, 4),
    "Cu": (29, 63.546, 1.90, 132, 11, 11, 4),
    "Zn": (30, 65.38, 1.65, 122, 12, 12, 4),
    "Ga": (31, 69.723, 1.81, 122, 3, 13, 4),
    "Ge": (32, 72.630, 2.01, 120, 4, 14, 4),
    "As": (33, 74.922, 2.18, 119, 5, 15, 4),
    "Se": (34, 78.971, 2.55, 120, 6, 16, 4),
    "Br": (35, 79.904, 2.96, 120, 7, 17, 4),
    "Rb": (37, 85.468, 0.82, 220, 1, 1, 5),
    "Sr": (38, 87.62, 0.95, 195, 2, 2, 5),
    "Y": (39, 88.906, 1.22, 190, 3, 3, 5),
    "Zr": (40, 91.224, 1.33, 175, 4, 4, 5),
    "Nb": (41, 92.906, 1.60, 164, 5, 5, 5),
    "Mo": (42, 95.95, 2.16, 154, 6, 6, 5),
    "Ru": (44, 101.07, 2.20, 146, 8, 8, 5),
    "Rh": (45, 102.91, 2.28, 142, 9, 9, 5),
    "Pd": (46, 106.42, 2.20, 139, 10, 10, 5),
    "Ag": (47, 107.87, 1.93, 145, 11, 11, 5),
    "Cd": (48, 112.41, 1.69, 144, 12, 12, 5),
    "In": (49, 114.82, 1.78, 142, 3, 13, 5),
    "Sn": (50, 118.71, 1.96, 139, 4, 14, 5),
    "Sb": (51, 121.76, 2.05, 139, 5, 15, 5),
    "Te": (52, 127.60, 2.10, 138, 6, 16, 5),
    "I": (53, 126.90, 2.66, 139, 7, 17, 5),
    "Cs": (55, 132.91, 0.79, 244, 1, 1, 6),
    "Ba": (56, 137.33, 0.89, 215, 2, 2, 6),
    "La": (57, 138.91, 1.10, 207, 3, 3, 6),
    "Ce": (58, 140.12, 1.12, 204, 4, 3, 6),
    "Pr": (59, 140.91, 1.13, 203, 5, 3, 6),
    "Nd": (60, 144.24, 1.14, 201, 6, 3, 6),
    "Sm": (62, 150.36, 1.17, 198, 8, 3, 6),
    "Eu": (63, 151.96, 1.20, 198, 9, 3, 6),
    "Gd": (64, 157.25, 1.20, 196, 10, 3, 6),
    "Tb": (65, 158.93, 1.20, 194, 11, 3, 6),
    "Dy": (66, 162.50, 1.22, 192, 12, 3, 6),
    "Ho": (67, 164.93, 1.23, 192, 13, 3, 6),
    "Er": (68, 167.26, 1.24, 189, 14, 3, 6),
    "Tm": (69, 168.93, 1.25, 190, 15, 3, 6),
    "Yb": (70, 173.05, 1.10, 187, 16, 3, 6),
    "Lu": (71, 174.97, 1.27, 187, 17, 3, 6),
    "Hf": (72, 178.49, 1.30, 175, 4, 4, 6),
    "Ta": (73, 180.95, 1.50, 170, 5, 5, 6),
    "W": (74, 183.84, 2.36, 162, 6, 6, 6),
    "Re": (75, 186.21, 1.90, 151, 7, 7, 6),
    "Os": (76, 190.23, 2.20, 144, 8, 8, 6),
    "Ir": (77, 192.22, 2.20, 141, 9, 9, 6),
    "Pt": (78, 195.08, 2.28, 136, 10, 10, 6),
    "Au": (79, 196.97, 2.54, 136, 11, 11, 6),
    "Hg": (80, 200.59, 2.00, 132, 12, 12, 6),
    "Tl": (81, 204.38, 1.62, 145, 3, 13, 6),
    "Pb": (82, 207.2, 2.33, 146, 4, 14, 6),
    "Bi": (83, 208.98, 2.02, 148, 5, 15, 6),
    "Th": (90, 232.04, 1.30, 179, 4, 3, 7),
    "U": (92, 238.03, 1.38, 156, 6, 3, 7),
}

def parse_chemical_formula(formula: str) -> Dict[str, float]:
    """
    Parses complex formulas including parentheses e.g. V2Sb(PO4)3, Ag0.5Ge1Pb1.75S4
    Returns dictionary of {Element: count}
    """
    formula = formula.strip()
    
    # Expand nested parentheses iteratively
    while "(" in formula and ")" in formula:
        match = re.search(r"\(([^()]+)\)([0-9.]*)", formula)
        if not match:
            break
        sub_group, mult_str = match.groups()
        mult = float(mult_str) if mult_str else 1.0
        
        # Multiply elements inside subgroup
        expanded_parts = []
        for elem, cnt in re.findall(r"([A-Z][a-z]?)([0-9.]*)", sub_group):
            c = (float(cnt) if cnt else 1.0) * mult
            expanded_parts.append(f"{elem}{c}")
        expanded = "".join(expanded_parts)
        formula = formula[:match.start()] + expanded + formula[match.end():]

    # Parse flat elements and fractions
    counts: Dict[str, float] = {}
    for elem, cnt in re.findall(r"([A-Z][a-z]?)([0-9.]*)", formula):
        c = float(cnt) if cnt else 1.0
        counts[elem] = counts.get(elem, 0.0) + c

    return counts

def featurize_composition(formula: str) -> Dict[str, float]:
    counts = parse_chemical_formula(formula)
    total_atoms = sum(counts.values())
    if total_atoms <= 0:
        return {}

    atomic_fractions = {elem: cnt / total_atoms for elem, cnt in counts.items()}

    mean_mass = 0.0
    mean_en = 0.0
    ens = []
    mean_radius = 0.0
    mean_val = 0.0
    chalcogen_frac = 0.0
    pnictogen_frac = 0.0
    halogen_frac = 0.0
    tm_frac = 0.0

    for elem, frac in atomic_fractions.items():
        props = ELEMENT_PROPERTIES.get(elem, (50, 100.0, 1.5, 140, 4, 10, 4))
        z, mass, en, radius, val, grp, per = props
        mean_mass += frac * mass
        mean_en += frac * en
        mean_radius += frac * radius
        mean_val += frac * val
        ens.append(en)

        if elem in ["O", "S", "Se", "Te"]:
            chalcogen_frac += frac
        elif elem in ["N", "P", "As", "Sb", "Bi"]:
            pnictogen_frac += frac
        elif elem in ["F", "Cl", "Br", "I"]:
            halogen_frac += frac
        elif 3 <= grp <= 12:
            tm_frac += frac

    en_diff = max(ens) - min(ens) if ens else 0.0

    return {
        "mean_atomic_mass": mean_mass,
        "mean_electronegativity": mean_en,
        "max_min_en_difference": en_diff,
        "mean_atomic_radius_pm": mean_radius,
        "mean_valence_electrons": mean_val,
        "distinct_element_count": float(len(counts)),
        "chalcogen_fraction": chalcogen_frac,
        "pnictogen_fraction": pnictogen_frac,
        "halogen_fraction": halogen_frac,
        "transition_metal_fraction": tm_frac,
    }

class MatbenchDatasetAdapter(BaseDatasetAdapter):
    """
    Adapter for Matbench Experimental Band Gap (matbench_expt_gap)
    Predicts experimental band gap from composition string.
    Total canonical sample count: 4,604.
    """

    TARGET_COLUMN = "gap expt"
    COMPOSITION_COLUMN = "composition"

    FEATURE_NAMES = [
        "mean_atomic_mass", "mean_electronegativity", "max_min_en_difference",
        "mean_atomic_radius_pm", "mean_valence_electrons", "distinct_element_count",
        "chalcogen_fraction", "pnictogen_fraction", "halogen_fraction",
        "transition_metal_fraction"
    ]

    def __init__(self):
        super().__init__(
            name="Matbench — Experimental Band Gap (matbench_expt_gap)",
            slug="matbench-expt-gap",
            task_type="regression"
        )

    def process(self, raw_file_path: str) -> Dict[str, Any]:
        integrity = self.check_file_integrity(raw_file_path)
        raw_df = pd.read_csv(raw_file_path)

        # Validate columns
        if self.COMPOSITION_COLUMN not in raw_df.columns or self.TARGET_COLUMN not in raw_df.columns:
            raise ValueError(f"Matbench dataset must contain '{self.COMPOSITION_COLUMN}' and '{self.TARGET_COLUMN}'. Found: {raw_df.columns.tolist()}")

        clean_df = raw_df.copy()
        clean_df[self.TARGET_COLUMN] = pd.to_numeric(clean_df[self.TARGET_COLUMN], errors="coerce")

        # Drop rows where target is NaN
        initial_rows = len(clean_df)
        clean_df = clean_df.dropna(subset=[self.TARGET_COLUMN])
        dropped_targets = initial_rows - len(clean_df)
        if dropped_targets > 0:
            self.warnings.append(f"Excluded {dropped_targets} samples with missing experimental band gap target.")

        # Featurize compositions
        logger.info(f"Featurizing {len(clean_df)} materials from Matbench...")
        feature_rows = []
        for comp in clean_df[self.COMPOSITION_COLUMN]:
            try:
                feats = featurize_composition(str(comp))
                feature_rows.append(feats)
            except Exception:
                feature_rows.append({f: 0.0 for f in self.FEATURE_NAMES})

        feat_df = pd.DataFrame(feature_rows, index=clean_df.index)
        featurized_df = pd.concat([clean_df[[self.COMPOSITION_COLUMN, self.TARGET_COLUMN]], feat_df], axis=1)

        # Detect outliers & missing values
        outliers = self.detect_outliers_iqr(featurized_df, self.FEATURE_NAMES + [self.TARGET_COLUMN])
        missing_summary = self.detect_missing_values(featurized_df)

        quality_report = self.generate_quality_report(raw_df, featurized_df, missing_summary, outliers)
        col_stats = self.compute_column_statistics(featurized_df)

        # Save cleaned version
        cleaned_dir = os.path.join(os.path.dirname(raw_file_path), "cleaned")
        os.makedirs(cleaned_dir, exist_ok=True)
        version_tag = "v1.0.0"
        clean_file_path = os.path.join(cleaned_dir, f"matbench_expt_gap_clean_{version_tag}.csv")
        featurized_df.to_csv(clean_file_path, index=False)

        feature_schema = [
            {"name": self.COMPOSITION_COLUMN, "role": "identifier", "dtype": "string", "units": "formula"},
            {"name": self.TARGET_COLUMN, "role": "target", "dtype": "float64", "units": "eV"}
        ]
        for f in self.FEATURE_NAMES:
            feature_schema.append({
                "name": f,
                "role": "feature",
                "dtype": "float64",
                "units": "pm" if "radius" in f else "g/mol" if "mass" in f else "fraction" if "frac" in f else "dimensionless"
            })

        return {
            "name": self.name,
            "slug": self.slug,
            "description": "Standardized benchmark predicting experimental band gaps (eV) from chemical composition across 4,604 diverse inorganic materials.",
            "source_name": "Materials Project Matbench Benchmark",
            "source_url": "https://docs.materialsproject.org/services/ml-and-ai-applications/matbench",
            "license_notes": "Creative Commons Attribution 4.0 International (CC BY 4.0)",
            "version": version_tag,
            "task_type": "regression",
            "sample_count": len(featurized_df),
            "feature_count": len(self.FEATURE_NAMES),
            "target_columns": [self.TARGET_COLUMN],
            "feature_schema": feature_schema,
            "missing_value_summary": missing_summary,
            "quality_report": quality_report,
            "summary_stats": col_stats,
            "content_hash": integrity["sha256"],
            "raw_storage_path": raw_file_path,
            "clean_storage_path": clean_file_path,
            "df": featurized_df
        }
