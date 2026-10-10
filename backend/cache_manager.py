import time
import hashlib
import json
from typing import Dict, Any, Optional

class CacheItem:
    def __init__(self, key: str, value: Any, ttl_seconds: int = 3600):
        self.key = key
        self.value = value
        self.created_at = time.time()
        self.expires_at = self.created_at + ttl_seconds
        self.hit_count = 0

class IntelligentCacheManager:
    def __init__(self):
        self._cache: Dict[str, CacheItem] = {}
        self.total_requests = 0
        self.total_hits = 0

    def compute_key(self, namespace: str, payload: Any, version: str = "v1") -> str:
        s = json.dumps({"ns": namespace, "payload": payload, "v": version}, sort_keys=True)
        return hashlib.sha256(s.encode("utf-8")).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        self.total_requests += 1
        item = self._cache.get(key)
        if not item:
            return None
        if time.time() > item.expires_at:
            del self._cache[key]
            return None
        item.hit_count += 1
        self.total_hits += 1
        return item.value

    def set(self, key: str, value: Any, ttl_seconds: int = 3600):
        self._cache[key] = CacheItem(key, value, ttl_seconds)

    def invalidate(self, namespace: Optional[str] = None):
        if namespace is None:
            self._cache.clear()
        else:
            to_del = [k for k in self._cache.keys() if k.startswith(namespace)]
            for k in to_del:
                del self._cache[k]

    def get_stats(self) -> Dict[str, Any]:
        hit_ratio = (self.total_hits / max(self.total_requests, 1)) * 100
        return {
            "cached_entries": len(self._cache),
            "total_requests": self.total_requests,
            "total_hits": self.total_hits,
            "hit_ratio_pct": round(hit_ratio, 2),
            "savings_ms_est": round(self.total_hits * 45.0, 1)
        }

cache_manager = IntelligentCacheManager()
