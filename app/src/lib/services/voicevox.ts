/**
 * VOICEVOX TTS Service
 * Calls the local microservice to generate high-quality anime-style Japanese audio.
 */

import { PUBLIC_VOICEVOX_URL } from '$env/static/public';

export const VOICEVOX_URL = PUBLIC_VOICEVOX_URL || 'http://localhost:8000';

let currentAudio: HTMLAudioElement | null = null;

export async function speakVoicevox(
    text: string,
    preset: 'kawaii' | 'cool' = 'kawaii',
    speed = 1.0,
    pitch = 0.0,
    volume = 1.0
): Promise<void> {
    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        currentAudio = null;
    }

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
    currentAudio = audio;

    await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            resolve();
        };
        audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            reject(new Error('Audio playback error'));
        };
        audio.play().catch((err) => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            reject(err);
        });
    });
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

        await fetch(url, { method: 'GET' });
    } catch {
        console.warn('VOICEVOX preload failed:', text);
    }
}
