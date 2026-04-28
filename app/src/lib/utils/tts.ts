/**
 * Cleans Japanese text for TTS (Text-to-Speech) synthesis.
 * Removes or replaces characters that cause bad/garbled audio:
 * - 〜 (wave dash, used in grammar patterns like 〜たい)
 * - ～ (fullwidth tilde, same issue)
 * - Latin letters mixed in (A/B/C placeholders)
 * - Bracketed placeholders like [A] [B]
 */
export function cleanForTTS(text: string): string {
	if (!text) return '';

	return (
		text
			// Remove wave dash / tilde markers used in grammar patterns
			.replace(/[〜～]/g, '')
			// Remove Latin bracketed placeholders [A], [B], etc.
			.replace(/\[[A-Za-z0-9]+\]/g, '')
			// Remove standalone Latin letters used as placeholders (A, B, etc.)
			.replace(/\b[A-Z]\b/g, '')
			// Remove parenthetical English explanations like (reason) (but)
			.replace(/\([^)]*[a-zA-Z][^)]*\)/g, '')
			// Collapse multiple spaces into one
			.replace(/\s+/g, ' ')
			.trim()
	);
}

import { get } from 'svelte/store';
import { preferredVoice } from '$lib/stores/settings';
import { speakVoicevox } from '$lib/services/voicevox';
import { svileo } from '$lib/stores/toast';

/**
 * Fallback to browser's built-in Web Speech API if microservice is offline.
 */
function speakBrowser(text: string): void {
	if (typeof window === 'undefined' || !window.speechSynthesis) return;

	window.speechSynthesis.cancel();
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = 'ja-JP';

	const voiceMode = get(preferredVoice);
	const voices = window.speechSynthesis.getVoices();
	const japaneseVoices = voices.filter((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));

	if (voiceMode === 'cool') {
		utterance.pitch = 0.8;
		const coolVoice =
			japaneseVoices.find((v) => !v.name.toLowerCase().includes('kyoko')) ||
			japaneseVoices[1] ||
			japaneseVoices[0];
		if (coolVoice) utterance.voice = coolVoice;
	} else {
		utterance.pitch = 1.0;
		if (japaneseVoices[0]) utterance.voice = japaneseVoices[0];
	}

	window.speechSynthesis.speak(utterance);
}

/**
 * Speaks Japanese text using the VOICEVOX microservice.
 * Shows a loading toast during fetch latency only — resolves the toast
 * the moment audio begins playing, not when it finishes.
 * Falls back to browser TTS if the service is unavailable.
 */
export async function speakJapanese(text: string): Promise<void> {
	const cleaned = cleanForTTS(text);
	if (!cleaned) return;

	const voiceMode = get(preferredVoice);
	const preset = voiceMode === 'cool' ? 'cool' : 'kawaii';

	// Only show loading toast if audio hasn't started within 2 seconds.
	let markStarted!: () => void;
	let markFailed!: (e: unknown) => void;
	const audioStarted = new Promise<void>((res, rej) => {
		markStarted = res;
		markFailed = rej;
	});
	// Prevent unhandled rejection if error occurs before the 2s toast timer fires
	audioStarted.catch(() => {});

	const toastTimer = setTimeout(() => {
		svileo.promise(audioStarted, {
			loading: { title: '🔊 Cargando voz...' },
			success: { title: '' },
			error: { title: 'Voz no disponible' }
		});
	}, 2000);

	// markStarted resolves audioStarted → clears toast (if shown)
	// If audio starts before 2s, clearTimeout prevents toast from appearing
	const origMarkStarted = markStarted;
	markStarted = () => {
		clearTimeout(toastTimer);
		origMarkStarted();
	};
	const origMarkFailed = markFailed;
	markFailed = (e: unknown) => {
		clearTimeout(toastTimer);
		origMarkFailed(e);
	};

	await speakVoicevox(cleaned, preset, 1.0, 0.0, 1.0, markStarted).catch((err) => {
		markFailed(err);
		console.warn('VOICEVOX offline, falling back to browser TTS:', err);
		speakBrowser(cleaned);
	});
}
