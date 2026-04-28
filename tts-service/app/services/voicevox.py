import httpx
import logging
from typing import Optional
from app.core.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)

QUERY_TIMEOUT = httpx.Timeout(10.0, connect=5.0)
SYNTHESIS_TIMEOUT = httpx.Timeout(60.0, connect=5.0)
MAX_RETRIES = 2

class VoicevoxService:
    def __init__(self):
        self.base_url = settings.VOICEVOX_URL

    async def generate_audio(
        self,
        text: str,
        speaker: int,
        speed: float,
        pitch: float,
        volume: float = 1.0,
        intonation: float = 1.0,
        post_phoneme: float = 0.1,
    ) -> bytes:
        last_error: Exception | None = None
        for attempt in range(MAX_RETRIES + 1):
            try:
                return await self._generate(text, speaker, speed, pitch, volume, intonation, post_phoneme)
            except httpx.TimeoutException as e:
                last_error = e
                logger.warning(f"VOICEVOX timeout (attempt {attempt + 1}/{MAX_RETRIES + 1}): {e}")
            except httpx.ConnectError as e:
                # Engine not reachable — no point retrying
                logger.error(f"VOICEVOX connection refused at {self.base_url}: {e}")
                raise HTTPException(status_code=503, detail="VOICEVOX engine unreachable")
            except httpx.HTTPStatusError as e:
                logger.error(f"VOICEVOX HTTP {e.response.status_code} for speaker={speaker} text={text[:40]!r}: {e}")
                raise HTTPException(status_code=503, detail=f"VOICEVOX returned {e.response.status_code}")
            except httpx.HTTPError as e:
                last_error = e
                logger.warning(f"VOICEVOX error (attempt {attempt + 1}/{MAX_RETRIES + 1}): {e}")

        logger.error(f"VOICEVOX failed after {MAX_RETRIES + 1} attempts: {last_error}")
        raise HTTPException(status_code=503, detail="VOICEVOX engine unavailable after retries")

    async def _generate(
        self,
        text: str,
        speaker: int,
        speed: float,
        pitch: float,
        volume: float,
        intonation: float = 1.0,
        post_phoneme: float = 0.1,
    ) -> bytes:
        async with httpx.AsyncClient() as client:
            query_response = await client.post(
                f"{self.base_url}/audio_query",
                params={"text": text, "speaker": speaker},
                timeout=QUERY_TIMEOUT,
            )
            query_response.raise_for_status()
            query_data = query_response.json()

            query_data["speedScale"] = speed
            query_data["pitchScale"] = pitch
            query_data["volumeScale"] = volume
            query_data["intonationScale"] = intonation
            query_data["postPhonemeLength"] = post_phoneme

            synthesis_response = await client.post(
                f"{self.base_url}/synthesis",
                params={"speaker": speaker},
                json=query_data,
                timeout=SYNTHESIS_TIMEOUT,
            )
            synthesis_response.raise_for_status()
            return synthesis_response.content

voicevox_service = VoicevoxService()
