import httpx
import logging
from typing import Optional
from app.core.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class VoicevoxService:
    def __init__(self):
        self.base_url = settings.VOICEVOX_URL
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    async def generate_audio(
        self, 
        text: str, 
        speaker: int, 
        speed: float, 
        pitch: float,
        volume: float = 1.0
    ) -> bytes:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                # 1. Create Audio Query
                query_response = await client.post(
                    f"{self.base_url}/audio_query",
                    params={"text": text, "speaker": speaker}
                )
                query_response.raise_for_status()
                query_data = query_response.json()

                # Apply modifications
                query_data["speedScale"] = speed
                query_data["pitchScale"] = pitch
                query_data["volumeScale"] = volume

                # 2. Synthesis
                synthesis_response = await client.post(
                    f"{self.base_url}/synthesis",
                    params={"speaker": speaker},
                    json=query_data
                )
                synthesis_response.raise_for_status()
                
                return synthesis_response.content

            except httpx.HTTPError as e:
                logger.error(f"VOICEVOX error: {e}")
                raise HTTPException(
                    status_code=503, 
                    detail="VOICEVOX engine unavailable or returned an error"
                )

voicevox_service = VoicevoxService()
