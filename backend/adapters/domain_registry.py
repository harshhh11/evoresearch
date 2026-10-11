import logging
from typing import Dict, Any, List, Optional, Type
from .base_adapter import BaseDatasetAdapter
from .nomad_adapter import NomadDatasetAdapter
from .matbench_adapter import MatbenchDatasetAdapter
from .edge_ml_adapter import EdgeMlAdapter
from .cpu_ml_adapter import CpuMlAdapter
from .threed_adapter import ThreeDAdapter
from .general_adapter import GeneralDomainAdapter

logger = logging.getLogger("evoresearch.adapters.registry")

class DomainRegistry:
    """
    Central Registry for Domain Adapters in EvoResearch / EvolveX.
    Supports dynamic resolution by domain key or dataset metadata.
    """

    def __init__(self):
        self._adapters: Dict[str, Type[BaseDatasetAdapter]] = {
            "materials_nomad": NomadDatasetAdapter,
            "materials_matbench": MatbenchDatasetAdapter,
            "edge_ml": EdgeMlAdapter,
            "cpu_ml": CpuMlAdapter,
            "threed_ml": ThreeDAdapter,
            "general_research": GeneralDomainAdapter
        }

    def get_adapter(self, domain_key: str, **kwargs) -> BaseDatasetAdapter:
        cls = self._adapters.get(domain_key, GeneralDomainAdapter)
        return cls(**kwargs) if kwargs else cls()

    def list_supported_domains(self) -> List[Dict[str, Any]]:
        return [
            {
                "key": "machine_learning",
                "name": "Machine Learning & Statistical Modeling",
                "description": "General machine learning, regression baselines, feature selection, ensemble modeling.",
                "adapter_class": "GeneralDomainAdapter"
            },
            {
                "key": "deep_learning",
                "name": "Deep Learning & Neural Architectures",
                "description": "Multi-layer perceptrons, CNNs, representation learning, loss landscape optimization.",
                "adapter_class": "GeneralDomainAdapter"
            },
            {
                "key": "transformers_llm",
                "name": "Transformer Architectures & LLM Research",
                "description": "Self-attention models, prompt tuning, quantization, perplexity benchmarks, parameter efficiency.",
                "adapter_class": "GeneralDomainAdapter"
            },
            {
                "key": "nlp",
                "name": "Natural Language Processing & Text Intelligence",
                "description": "Text classification, sentiment analysis, named entity recognition, semantic search.",
                "adapter_class": "GeneralDomainAdapter"
            },
            {
                "key": "computer_vision",
                "name": "Computer Vision & Visual Perception",
                "description": "Image classification, object detection, segmentation, feature extraction, embedding evaluation.",
                "adapter_class": "GeneralDomainAdapter"
            },
            {
                "key": "tabular",
                "name": "Tabular Prediction & Data Science",
                "description": "Tree-based models (RandomForest, XGBoost), GBDT, TabPFN, leakage-free preprocessing.",
                "adapter_class": "CpuMlAdapter"
            },
            {
                "key": "time_series",
                "name": "Time-Series Forecasting & Telemetry Analysis",
                "description": "Autoregressive models, temporal sequence prediction, industrial IoT telemetry, horizon evaluation.",
                "adapter_class": "GeneralDomainAdapter"
            },
            {
                "key": "scientific_computing",
                "name": "Scientific Computing & Differential Equations",
                "description": "Physics-informed neural networks (PINN), PDE solvers, numerical simulation modeling.",
                "adapter_class": "CpuMlAdapter"
            },
            {
                "key": "materials_science",
                "name": "Materials Science & Crystallography",
                "description": "Band-gap, formation energy, DFT calculations, NOMAD 2018 & Matbench benchmarks.",
                "adapter_class": "NomadDatasetAdapter / MatbenchDatasetAdapter"
            },
            {
                "key": "healthcare_biomedical",
                "name": "Healthcare & Biomedical Research",
                "description": "Medical diagnostic modeling, genomic sequence classification, clinical trial telemetry.",
                "adapter_class": "GeneralDomainAdapter"
            },
            {
                "key": "optimization",
                "name": "Hyperparameter Optimization & Search",
                "description": "Bayesian search space exploration, Optuna Optuna TPE, strict CPU-time budget caps.",
                "adapter_class": "GeneralDomainAdapter"
            },
            {
                "key": "reinforcement_learning",
                "name": "Reinforcement Learning & Autonomous Agents",
                "description": "Policy optimization, Q-learning, agent reward curves, environment interaction.",
                "adapter_class": "GeneralDomainAdapter"
            },
            {
                "key": "custom",
                "name": "Custom / Open-Ended Scientific Research",
                "description": "Custom research objectives, novel hypotheses, flexible evaluation protocols.",
                "adapter_class": "GeneralDomainAdapter"
            }
        ]

domain_registry = DomainRegistry()
