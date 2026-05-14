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

// Canonical form used for karaoke matching. Maps kana → romaji via wanakana,
// normalizes fullwidth/halfwidth, lowercases latin, strips punctuation and
// long-vowel marks. Kanji passes through unchanged — callers should pair with
// a romaji fallback (e.g. LyricLine.romaji) for kanji-heavy targets.
import { toRomaji } from 'wanakana';
const FORMATCH_PUNCT = /[\s_!?.,;:'"()[\]【】「」『』。、！？・〜~]/g;
export function forMatch(text: string): string {
	if (!text) return '';
	const nfkc = text.normalize('NFKC');
	let r = toRomaji(nfkc);
	// Long-vowel mark ー → wanakana emits `-`; expand into doubled vowel so
	// "wanpi-su" ↔ "wanpiisu" match.
	r = r.replace(/([aeiouAEIOU])-/g, '$1$1');
	// Anything else dash-like that survived
	r = r.replace(/-/g, '');
	r = r.toLowerCase().replace(FORMATCH_PUNCT, '');
	return r;
}

// Mora-level tokenizer for interactive UI chips. Unlike `tokenize()`, this
// preserves the original script (no katakana → hiragana conversion) so the
// tokens can be shown back to the user. Groups yōon (kana + small kana) into
// a single chip in both scripts. Kanji and other graphemes each become one
// token. Strips common punctuation but keeps the rest verbatim.
const SMALL_KANA = /[ぁぃぅぇぉっゃゅょァィゥェォッャュョ]/;
const CHOONPU = 'ー';
export function splitJpInteractive(text: string): string[] {
	if (!text) return [];
	const stripped = text
		.normalize('NFC')
		.replace(/[。、！？.!?,，・〜～\s]/g, '');
	const tokens: string[] = [];
	let i = 0;
	while (i < stripped.length) {
		const next = stripped[i + 1];
		if (next && (SMALL_KANA.test(next) || next === CHOONPU)) {
			tokens.push(stripped.slice(i, i + 2));
			i += 2;
		} else {
			tokens.push(stripped[i]);
			i++;
		}
	}
	return tokens;
}

// Karaoke tokenizer: like splitJpInteractive but groups consecutive latin
// runs (e.g. "ONE PIECE") into one token so the highlight matches at the
// word level instead of flickering per character. Preserves original casing.
const LATIN_RE = /[A-Za-z0-9]/;
export function splitForKaraoke(text: string): string[] {
	if (!text) return [];
	const stripped = text
		.normalize('NFC')
		.replace(/[。、！？.!?,，・〜～]/g, '')
		.replace(/\s+/g, ' ');
	const tokens: string[] = [];
	let i = 0;
	while (i < stripped.length) {
		const ch = stripped[i];
		if (ch === ' ') { i++; continue; }
		if (LATIN_RE.test(ch)) {
			let j = i;
			while (j < stripped.length && (LATIN_RE.test(stripped[j]) || stripped[j] === ' ')) j++;
			tokens.push(stripped.slice(i, j).trim());
			i = j;
			continue;
		}
		const next = stripped[i + 1];
		if (next && (SMALL_KANA.test(next) || next === CHOONPU)) {
			tokens.push(stripped.slice(i, i + 2));
			i += 2;
		} else {
			tokens.push(ch);
			i++;
		}
	}
	return tokens;
}
