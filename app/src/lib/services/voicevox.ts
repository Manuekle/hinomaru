/**
 * VOICEVOX TTS Service
 * Calls the local microservice to generate high-quality anime-style Japanese audio.
 */

export const VOICEVOX_URL = 'http://localhost:8000';

export async function speakVoicevox(
    text: string, 
    preset: 'kawaii' | 'cool' = 'kawaii',
    speed = 1.0,
    pitch = 0.0,
    volume = 1.0
): Promise<void> {
    try {
        const params = new URLSearchParams({
            text,
            preset,
            speed: speed.toString(),
            pitch: pitch.toString(),
            volume: volume.toString(),
            format: 'wav',
            api_key: 'hinomaru-secret-key'
        });

        const url = `${VOICEVOX_URL}/tts/audio?${params.toString()}`;
        
        // Fetch without custom headers to avoid CORS preflight issues
        const response = await fetch(url);

        if (!response.ok) throw new Error('TTS Service Error');

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        const audio = new Audio(audioUrl);
        await audio.play();
    } catch (error) {
        console.error('VOICEVOX play error:', error);
        throw error;
    }
}

/**
 * Preloads audio into the microservice's disk cache without playing it.
 */
export async function preloadVoicevox(
    text: string, 
    preset: 'kawaii' | 'cool' = 'kawaii'
): Promise<void> {
    try {
        const params = new URLSearchParams({ 
            text, 
            preset, 
            format: 'wav',
            api_key: 'hinomaru-secret-key'
        });
        const url = `${VOICEVOX_URL}/tts/audio?${params.toString()}`;
        
        // Just fetch it to trigger the microservice's generation and disk caching
        await fetch(url, { method: 'GET' });
    } catch (error) {
        // Silently fail for preloads
        console.warn('VOICEVOX preload failed:', text);
    }
}
