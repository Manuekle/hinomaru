// Katakana → Hiragana: offset 0x60 between Unicode blocks
const KATA_START = 0x30A1; // ァ
const KATA_END   = 0x30F6; // ヶ
const HIRA_OFFSET = 0x60;

export function katakanaToHiragana(str: string): string {
	return str.replace(/[ァ-ヶ]/g, (ch) =>
		String.fromCharCode(ch.charCodeAt(0) - HIRA_OFFSET)
	);
}

// Strip punctuation and whitespace, normalize unicode form
export function normalizeJapanese(text: string): string {
	if (!text) return '';
	return katakanaToHiragana(text)
		.replace(/\s+/g, '')
		.replace(/[。、！？.!?,，。、・]/g, '')
		.normalize('NFC');
}

// Split recognized speech into mora-like units for partial matching
export function tokenize(text: string): string[] {
	const norm = normalizeJapanese(text);
	// Each hiragana character is a mora; group by ≤3 to get syllable chunks
	const tokens: string[] = [];
	let i = 0;
	while (i < norm.length) {
		// Compound: consonant + small kana (e.g. きゃ, しゅ)
		const next = norm[i + 1];
		if (next && /[ぁぃぅぇぉっゃゅょ]/.test(next)) {
			tokens.push(norm.slice(i, i + 2));
			i += 2;
		} else {
			tokens.push(norm[i]);
			i++;
		}
	}
	return tokens;
}
