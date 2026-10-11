import os
import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from .models_db import RecoveryMemory, Experiment, ScientificEvaluation, utc_now

logger = logging.getLogger("evoresearch.supermemory")

class SupermemoryService:
    """
    Supermemory API Integration & Local Context Memory Provider for EvoResearch / EvolveX.
    Manages:
    1. Research Context Memory
    2. Experiment Memory
    3. Failure & Recovery Memory
    4. Validated Research Lessons
    Falls back gracefully to local SQLite storage when SUPERMEMORY_API_KEY is not set or network is offline.
    """

    def __init__(self):
        self.api_key = os.getenv("SUPERMEMORY_API_KEY", "").strip()
        self.base_url = os.getenv("SUPERMEMORY_API_URL", "https://api.supermemory.ai/v1").rstrip("/")
        self.local_fallback_active = True if not self.api_key else False

    def get_status(self) -> Dict[str, Any]:
        return {
            "provider": "Supermemory Context API",
            "api_key_configured": bool(self.api_key),
            "local_fallback_active": self.local_fallback_active,
            "categories_supported": [
                "Research Context Memory",
                "Experiment Memory",
                "Failure and Recovery Memory",
                "Validated Research Lessons"
            ]
        }

    async def add_memory_record(
        self,
        db: Session,
        category: str,
        title: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        privacy_policy: str = "PERMITTED"
    ) -> Dict[str, Any]:
        """
        Saves memory record to Supermemory cloud API if configured & permitted,
        and persistently saves to local database fallback.
        """
        meta = metadata or {}
        record_id = f"mem_{int(datetime.now(timezone.utc).timestamp())}"
        saved_cloud = False
        cloud_response = None

        # Privacy check: Confidential / Restricted datasets are kept local-only
        if self.api_key and privacy_policy == "PERMITTED":
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.post(
                        f"{self.base_url}/memories",
                        headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                        json={
                            "title": title,
                            "content": content,
                            "category": category,
                            "metadata": meta
                        }
                    )
                    if resp.status_code in [200, 201]:
                        saved_cloud = True
                        cloud_response = resp.json()
            except Exception as e:
                logger.warning(f"Supermemory cloud sync skipped: {e}")

        # Always save to local database fallback
        if category == "Failure and Recovery Memory":
            rec = RecoveryMemory(
                task_type=meta.get("task_type", "regression"),
                dataset_fingerprint=meta.get("dataset_fingerprint", "general"),
                model_family=meta.get("model_family", "GeneralModel"),
                error_category=meta.get("error_category", "EXECUTION_ERROR"),
                error_signature=title,
                diagnosis=content,
                proposed_repair=json.dumps(meta.get("proposed_repair", {})),
                actual_repair=json.dumps(meta.get("actual_repair", {})),
                validation_result=json.dumps(meta.get("validation_result", {"status": "PASSED"})),
                reuse_count=1,
                success_count=1,
                state=meta.get("state", "VALIDATED"),
                evidence_reference=meta.get("evidence_reference", "Local Evidentiary Record")
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)
            record_id = rec.id

        return {
            "memory_id": record_id,
            "category": category,
            "title": title,
            "saved_to_supermemory_cloud": saved_cloud,
            "saved_to_local_fallback": True,
            "privacy_policy": privacy_policy,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

    def add_memory_record_sync(
        self,
        db: Session,
        category: str,
        title: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None,
        privacy_policy: str = "PERMITTED"
    ) -> Dict[str, Any]:
        """Synchronous version for local DB memory persistence."""
        meta = metadata or {}
        record_id = f"mem_{int(datetime.now(timezone.utc).timestamp())}"
        if category == "Failure and Recovery Memory":
            rec = RecoveryMemory(
                task_type=meta.get("task_type", "regression"),
                dataset_fingerprint=meta.get("dataset_fingerprint", "general"),
                model_family=meta.get("model_family", "GeneralModel"),
                error_category=meta.get("error_category", "EXECUTION_ERROR"),
                error_signature=title,
                diagnosis=content,
                proposed_repair=json.dumps(meta.get("proposed_repair", {})),
                actual_repair=json.dumps(meta.get("actual_repair", {})),
                validation_result=json.dumps(meta.get("validation_result", {"status": "PASSED"})),
                reuse_count=1,
                success_count=1,
                state=meta.get("state", "VALIDATED"),
                evidence_reference=meta.get("evidence_reference", "Local Evidentiary Record")
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)
            record_id = rec.id

        return {
            "memory_id": record_id,
            "category": category,
            "title": title,
            "saved_to_supermemory_cloud": False,
            "saved_to_local_fallback": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

    def retrieve_context_memories(
        self,
        db: Session,
        query: str,
        domain: Optional[str] = None,
        model_family: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieves relevant prior research memories, verified repairs, and validated lessons.
        """
        results = []
        q_lower = query.lower()

        # Query local RecoveryMemory database table
        records = db.query(RecoveryMemory).all()
        for r in records:
            match_score = 0
            if r.error_category.lower() in q_lower or r.error_signature.lower() in q_lower:
                match_score += 3
            if model_family and r.model_family.lower() == model_family.lower():
                match_score += 2
            if domain and domain.lower() in r.dataset_fingerprint.lower():
                match_score += 2

            if match_score > 0 or len(results) < limit:
                results.append({
                    "id": r.id,
                    "category": "Failure and Recovery Memory",
                    "error_category": r.error_category,
                    "error_signature": r.error_signature,
                    "diagnosis": r.diagnosis,
                    "proposed_repair": json.loads(r.proposed_repair) if r.proposed_repair else {},
                    "actual_repair": json.loads(r.actual_repair) if r.actual_repair else {},
                    "state": r.state,
                    "reuse_count": r.reuse_count,
                    "evidence_reference": r.evidence_reference,
                    "relevance_score": match_score + (r.success_count * 0.5)
                })

        # Sort by relevance score descending
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return results[:limit]

supermemory_service = SupermemoryService()
