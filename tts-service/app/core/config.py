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
    # speaker IDs: 2=春日部つむぎ (female), 5=玄野武宏 (male), 6=白上虎太郎 (male)
    # intonation >1.0 = more pitch variation = less robotic, more natural
    # post_phoneme = trailing silence (s) — prevents vowels from cutting off abruptly
    PRESETS: Dict[str, Dict[str, Any]] = {
        "kawaii": {
            "speaker": 2,        # 春日部つむぎ — female
            "speed": 1.0,        # natural speed (1.05 cut phoneme tails)
            "pitch": 0.05,
            "volume": 1.2,
            "intonation": 1.15,  # livelier pitch variation
            "post_phoneme": 0.15 # tail silence so final vowels don't cut abruptly
        },
        "cool": {
            "speaker": 6,        # 白上虎太郎 — male
            "speed": 0.95,
            "pitch": -0.05,
            "volume": 1.2,
            "intonation": 1.05,
            "post_phoneme": 0.15
        }
    }
    
    class Config:
        env_file = ".env"

settings = Settings()
