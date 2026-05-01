import { normalizeJapanese } from './normalize';

// ── Auto-split a Japanese phrase into natural segments ────────────────────────
// Strategy: split after common particles/auxiliaries so segments feel natural.
const PARTICLE_PATTERN = /(?<=[はがをにでもとへからまでけどし])/g;

function autoSegment(text: string): string[] {
	const norm = normalizeJapanese(text);
	if (norm.length <= 5) return [text]; // short word → single segment

	// Try splitting on particles
	const parts = text.split(PARTICLE_PATTERN).filter(Boolean);
	if (parts.length >= 2) return parts;

	// Fallback: split into roughly equal halves
	const mid = Math.ceil(text.length / 2);
	return [text.slice(0, mid), text.slice(mid)];
}

export interface DeckPhrase {
	id: string;
	text: string;       // Japanese target
	reading: string;    // hiragana reading
	meaning: string;    // Spanish meaning
	segments: string[];
	isExample: boolean; // true when using example sentence
}

export function cardsToPhrases(
	cards: Array<{
		id: string;
		jp: string;
		romaji?: string | null;
		es?: string | null;
		en?: string | null;
		example?: string | null;
		example_romaji?: string | null;
		example_es?: string | null;
		example_en?: string | null;
	}>,
	locale: string
): DeckPhrase[] {
	return cards
		.filter(c => c.jp && c.jp.trim().length > 0)
		.flatMap(c => {
			const meaning = (locale === 'es' ? c.es : c.en) ?? c.es ?? c.en ?? '';
			const phrases: DeckPhrase[] = [];

			// Primary: the word itself
			phrases.push({
				id: `${c.id}-word`,
				text: c.jp,
				reading: c.romaji ?? c.jp,
				meaning,
				segments: autoSegment(c.jp),
				isExample: false
			});

			// Secondary: example sentence if it exists
			if (c.example && c.example.trim().length > 0) {
				const exMeaning = (locale === 'es' ? c.example_es : c.example_en) ?? '';
				phrases.push({
					id: `${c.id}-example`,
					text: c.example,
					reading: c.example_romaji ?? c.example,
					meaning: exMeaning || meaning,
					segments: autoSegment(c.example),
					isExample: true
				});
			}

			return phrases;
		});
}
