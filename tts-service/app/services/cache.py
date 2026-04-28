import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

STORAGE_DIR = "storage"
if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)

class CacheService:
    def __init__(self):
        # We keep the STORAGE_DIR check here to ensure it exists
        pass

    def _get_path(self, key: str) -> str:
        return os.path.join(STORAGE_DIR, f"{key}.audio")

    async def get_audio(self, key: str) -> bytes | None:
        path = self._get_path(key)
        try:
            if os.path.exists(path):
                with open(path, "rb") as f:
                    return f.read()
            return None
        except Exception as e:
            logger.error(f"Disk read error: {e}")
            return None

    async def set_audio(self, key: str, data: bytes):
        path = self._get_path(key)
        try:
            with open(path, "wb") as f:
                f.write(data)
        except Exception as e:
            logger.error(f"Disk write error: {e}")

cache_service = CacheService()
