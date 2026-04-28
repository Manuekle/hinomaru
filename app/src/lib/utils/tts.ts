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

/**
 * Fallback to browser's built-in Web Speech API if microservice is offline.
 * This is the original logic you had before.
 */
function speakBrowser(text: string): void {
	if (typeof window === 'undefined' || !window.speechSynthesis) return;

	window.speechSynthesis.cancel();
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = 'ja-JP';

	const voiceMode = get(preferredVoice);
	const voices = window.speechSynthesis.getVoices();
	const japaneseVoices = voices.filter((v) => v.lang === 'ja-JP' || v.lang.startsWith('ja'));

	if (voiceMode === 'kaito') {
		utterance.pitch = 0.8;
		const kaitoVoice =
			japaneseVoices.find((v) => !v.name.toLowerCase().includes('kyoko')) ||
			japaneseVoices[1] ||
			japaneseVoices[0];
		if (kaitoVoice) utterance.voice = kaitoVoice;
	} else {
		utterance.pitch = 1.0;
		if (japaneseVoices[0]) utterance.voice = japaneseVoices[0];
	}

	window.speechSynthesis.speak(utterance);
}

/**
 * Speaks Japanese text using the VOICEVOX microservice.
 * Falls back to browser TTS if the service is unavailable.
 */
export async function speakJapanese(text: string): Promise<void> {
	const cleaned = cleanForTTS(text);
	if (!cleaned) return;

	const voiceMode = get(preferredVoice);
	const preset = voiceMode === 'kaito' ? 'cool' : 'kawaii';

	// Attempt high-quality VOICEVOX first
	await speakVoicevox(cleaned, preset).catch((err) => {
		console.warn('VOICEVOX offline, falling back to browser TTS:', err);
		speakBrowser(cleaned);
	});
}
