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

/**
 * Speaks Japanese text using the Web Speech API.
 * Automatically cleans the text before synthesis.
 */
export function speakJapanese(text: string, rate = 0.85): void {
	if (typeof window === 'undefined' || !window.speechSynthesis) return;

	const cleaned = cleanForTTS(text);
	if (!cleaned) return;

	// Cancel any ongoing speech
	window.speechSynthesis.cancel();

	const utterance = new SpeechSynthesisUtterance(cleaned);
	utterance.lang = 'ja-JP';
	utterance.rate = rate;
	utterance.pitch = 1.0;

	// Prefer a Japanese voice if available
	const voices = window.speechSynthesis.getVoices();
	const japaneseVoice = voices.find(
		(v) => v.lang === 'ja-JP' || v.lang.startsWith('ja')
	);
	if (japaneseVoice) {
		utterance.voice = japaneseVoice;
	}

	window.speechSynthesis.speak(utterance);
}
