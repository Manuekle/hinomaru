import hashlib
import io
import base64
from typing import Optional
from fastapi import APIRouter, Query, Response, HTTPException, Header, Depends
from fastapi.responses import StreamingResponse
from pydub import AudioSegment
from app.core.config import settings
from app.services.voicevox import voicevox_service
from app.services.cache import cache_service

router = APIRouter()

async def verify_api_key(x_api_key: str = Header(None), api_key: Optional[str] = Query(None)):
    token = x_api_key or api_key
    if token != settings.API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return token

def get_cache_key(text: str, speaker: int, speed: float, pitch: float, volume: float, format: str) -> str:
    payload = f"{text}:{speaker}:{speed}:{pitch}:{volume}:{format}"
    return hashlib.sha256(payload.encode()).hexdigest()

def convert_to_mp3(wav_data: bytes) -> bytes:
    audio = AudioSegment.from_wav(io.BytesIO(wav_data))
    mp3_io = io.BytesIO()
    audio.export(mp3_io, format="mp3")
    return mp3_io.getvalue()

@router.get("/health")
async def health():
    return {"status": "ok", "service": settings.PROJECT_NAME}

@router.get("/tts/audio")
async def get_tts_audio(
    text: str = Query(..., max_length=1000),
    speaker: int = 1,
    speed: float = 1.0,
    pitch: float = 0.0,
    volume: float = 1.0,
    format: str = Query("wav", regex="^(wav|mp3)$"),
    preset: Optional[str] = None,
    _auth: str = Depends(verify_api_key)
):
    # Apply Preset
    if preset and preset in settings.PRESETS:
        p = settings.PRESETS[preset]
        speaker = p.get("speaker", speaker)
        speed = p.get("speed", speed)
        pitch = p.get("pitch", pitch)
        volume = p.get("volume", volume)

    # Check Cache
    cache_key = get_cache_key(text, speaker, speed, pitch, volume, format)
    cached_audio = await cache_service.get_audio(cache_key)
    
    if cached_audio:
        media_type = "audio/mpeg" if format == "mp3" else "audio/wav"
        return Response(content=cached_audio, media_type=media_type)

    # Generate Audio via VOICEVOX
    wav_audio = await voicevox_service.generate_audio(text, speaker, speed, pitch, volume)
    
    # Format Conversion
    final_audio = wav_audio
    if format == "mp3":
        try:
            final_audio = convert_to_mp3(wav_audio)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"MP3 conversion failed: {str(e)}")

    # Store in Cache
    await cache_service.set_audio(cache_key, final_audio)

    media_type = "audio/mpeg" if format == "mp3" else "audio/wav"
    return Response(content=final_audio, media_type=media_type)

@router.get("/tts/json")
async def get_tts_json(
    text: str = Query(..., max_length=1000),
    speaker: int = 1,
    speed: float = 1.0,
    pitch: float = 0.0,
    volume: float = 1.0,
    format: str = Query("wav", regex="^(wav|mp3)$"),
    preset: Optional[str] = None,
    _auth: str = Depends(verify_api_key)
):
    response = await get_tts_audio(text, speaker, speed, pitch, volume, format, preset)
    base64_audio = base64.b64encode(response.body).decode("utf-8")
    
    return {
        "audio": base64_audio,
        "format": format,
        "media_type": response.media_type
    }
