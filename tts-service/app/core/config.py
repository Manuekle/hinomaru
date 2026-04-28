from pydantic_settings import BaseSettings
from typing import Dict, Any

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hinomaru TTS Service"
    API_KEY: str = "hinomaru-secret-key"
    REDIS_URL: str = "redis://localhost:6379/0"
    VOICEVOX_URL: str = "http://localhost:50021"
    
    # TTL for cached audio (24 hours)
    CACHE_TTL: int = 86400
    
    # TTS Presets
    PRESETS: Dict[str, Dict[str, Any]] = {
        "kawaii": { "speaker": 2, "speed": 1.05, "pitch": 0.05, "volume": 1.2 },
        "cool": { "speaker": 3, "speed": 0.95, "pitch": -0.05, "volume": 1.8 }
    }
    
    class Config:
        env_file = ".env"

settings = Settings()
