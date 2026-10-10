import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("evoresearch.supabase")

_supabase_client = None

def _load_env_fallback():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(root_dir, ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip()
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

def get_supabase_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    _load_env_fallback()
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if not url or not key or "your-project-id" in url:
        return None

    try:
        from supabase import create_client, Client
        _supabase_client = create_client(url, key)
        logger.info(f"Connected to Supabase at {url}")
        return _supabase_client
    except Exception as e:
        logger.warning(f"Could not initialize Supabase client: {e}")
        return None

def get_supabase_status() -> Dict[str, Any]:
    _load_env_fallback()
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    has_key = bool(os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY"))
    
    client = get_supabase_client()
    is_connected = client is not None

    table_counts = {}
    if is_connected:
        tables_to_check = ["datasets", "experiments", "experiment_metrics", "failure_memory"]
        for tbl in tables_to_check:
            try:
                res = client.table(tbl).select("id", count="exact").limit(1).execute()
                table_counts[tbl] = res.count or 0
            except Exception as e:
                table_counts[tbl] = f"error: {str(e)[:50]}"

    return {
        "configured": bool(url and has_key and "your-project-id" not in str(url)),
        "connected": is_connected,
        "supabase_url": url if url and "your-project-id" not in str(url) else None,
        "service_role_key_present": bool(os.environ.get("SUPABASE_SERVICE_ROLE_KEY")),
        "tables_verified": table_counts,
        "local_fallback_active": True,
        "migration_file": "supabase/migrations/20261010000000_materials_ml_pipeline.sql"
    }

def sync_record_to_supabase(table_name: str, record_data: Dict[str, Any]) -> bool:
    """Idempotently syncs or inserts a record to Supabase if configured."""
    client = get_supabase_client()
    if not client:
        return False
    try:
        client.table(table_name).upsert(record_data).execute()
        return True
    except Exception as e:
        logger.warning(f"Failed to sync record to Supabase table '{table_name}': {e}")
        return False
