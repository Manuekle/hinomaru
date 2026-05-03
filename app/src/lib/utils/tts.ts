/**
 * Cleans Japanese text for TTS (Text-to-Speech) synthesis.
 */
export function cleanForTTS(text: string): string {
	if (!text) return '';

	return (
		text
			.replace(/[〜～]/g, '')
			.replace(/\[[A-Za-z0-9]+\]/g, '')
			.replace(/\b[A-Z]\b/g, '')
			.replace(/\([^)]*[a-zA-Z][^)]*\)/g, '')
			.replace(/\s+/g, ' ')
			.trim()
	);
}

import { get } from 'svelte/store';
import { preferredVoice, ttsSpeed } from '$lib/stores/settings';
import { speakVoicevox, stopVoicevox } from '$lib/services/voicevox';

let cachedVoices: SpeechSynthesisVoice[] = [];

function getJapaneseVoices(): SpeechSynthesisVoice[] {
	if (cachedVoices.length > 0) return cachedVoices;
	const all = window.speechSynthesis.getVoices();
	const jp = all.filter((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
	if (jp.length > 0) cachedVoices = jp;
	return jp;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
	window.speechSynthesis.addEventListener('voiceschanged', () => {
		cachedVoices = [];
		getJapaneseVoices();
	});
}

/**
 * Fallback to browser's built-in Web Speech API if microservice is offline.
 * Waits for voiceschanged if voices not yet loaded.
 */
async function speakBrowser(text: string, speedOverride?: number): Promise<void> {
	if (typeof window === 'undefined' || !window.speechSynthesis) return;

	window.speechSynthesis.cancel();

	let voices = getJapaneseVoices();
	if (voices.length === 0) {
		await new Promise<void>((res) => {
			const onChanged = () => {
				window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
				res();
			};
			window.speechSynthesis.addEventListener('voiceschanged', onChanged);
			setTimeout(res, 1200);
		});
		voices = getJapaneseVoices();
	}

	return new Promise((resolve) => {
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = 'ja-JP';

		const voiceMode = get(preferredVoice);
		const speed = speedOverride ?? get(ttsSpeed);
		utterance.rate = speed;

		if (voiceMode === 'cool') {
			utterance.pitch = 0.8;
			const coolVoice =
				voices.find((v) => !v.name.toLowerCase().includes('kyoko')) ||
				voices[1] ||
				voices[0];
			if (coolVoice) utterance.voice = coolVoice;
		} else {
			utterance.pitch = 1.0;
			if (voices[0]) utterance.voice = voices[0];
		}

		utterance.onend = () => resolve();
		utterance.onerror = () => resolve();

		window.speechSynthesis.speak(utterance);
	});
}

/**
 * Speaks Japanese text using the VOICEVOX microservice with browser TTS fallback.
 */
export async function speakJapanese(text: string, onStart?: () => void, speedOverride?: number): Promise<void> {
	const cleaned = cleanForTTS(text);
	if (!cleaned) return;

	const voiceMode = get(preferredVoice);
	const speed = speedOverride ?? get(ttsSpeed);
	const preset = voiceMode === 'cool' ? 'cool' : 'kawaii';

	try {
		await speakVoicevox(cleaned, preset, speed, 0.0, 1.0, onStart);
	} catch (err: unknown) {
		if (err instanceof Error && err.name === 'AbortError') return;
		console.warn('[tts] VOICEVOX offline, fallback to browser TTS');
		onStart?.();
		await speakBrowser(cleaned, speed);
	}
}

/**
 * Stops all Japanese TTS playback.
 */
export function stopJapanese(): void {
	stopVoicevox();
	if (typeof window !== 'undefined' && window.speechSynthesis) {
		window.speechSynthesis.cancel();
	}
}
