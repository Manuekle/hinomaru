// Template-based sentence generation. No reliance on card.example.
// Used by both fill_sentence and build_sentence steps.

import { TEMPLATES, templatesForCategory, type Template } from './sentenceTemplates';

export interface BuiltSentence {
	templateId: string;
	/** Selectable tokens in correct order (no punctuation). */
	tokens: string[];
	/** Same tokens, shuffled — for build_sentence step. */
	shuffled: string[];
	/** Optional trailing punctuation, NOT included in tokens. */
	suffix: string;
	/** Translation in active locale, with card meanings interpolated. */
	translation: string;
	/** Slot whose card was the "primary" target (for fill_sentence blanking). */
	primarySlot: string;
	/** JP token that fills primarySlot (the answer). */
	primaryToken: string;
	/** Card chosen for primary slot. */
	primaryCard: any;
	/** category_es of primary slot's card — for distractor sampling. */
	primaryCategory: string;
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

function pickRandom<T>(arr: T[]): T | null {
	if (!arr.length) return null;
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Build a sentence centered on `primaryCard` (when given).
 * Picks a template whose slot accepts primaryCard's category, then fills
 * remaining slots from `pool` matching their required categories.
 *
 * Returns null if no suitable template+filler combination exists.
 */
export function buildSentence(
	pool: any[],
	primaryCard: any | null,
	loc: 'es' | 'en' = 'es'
): BuiltSentence | null {
	if (!pool.length) return null;

	const candidates = primaryCard
		? templatesForCategory(primaryCard.category_es)
		: TEMPLATES;
	if (!candidates.length) return null;

	// Shuffle template order so we don't always pick the same one.
	for (const tpl of shuffle(candidates)) {
		const built = tryFillTemplate(tpl, pool, primaryCard, loc);
		if (built) return built;
	}
	return null;
}

function tryFillTemplate(
	tpl: Template,
	pool: any[],
	primaryCard: any | null,
	loc: 'es' | 'en'
): BuiltSentence | null {
	const slotNames = Object.keys(tpl.slots);
	if (!slotNames.length) return null;

	// Determine which slot the primary card occupies (if any).
	let primarySlot: string | null = null;
	if (primaryCard) {
		for (const sn of shuffle(slotNames)) {
			if (tpl.slots[sn].includes(primaryCard.category_es)) {
				primarySlot = sn;
				break;
			}
		}
		if (!primarySlot) return null;
	} else {
		primarySlot = slotNames[0];
	}

	// Assign cards to all slots.
	const assignments: Record<string, any> = {};
	const used = new Set<string>();
	if (primaryCard) {
		assignments[primarySlot] = primaryCard;
		used.add(primaryCard.id);
	}

	for (const sn of slotNames) {
		if (assignments[sn]) continue;
		const allowed = tpl.slots[sn];
		const candidates = pool.filter(
			(c) => c.id && !used.has(c.id) && allowed.includes(c.category_es)
		);
		const chosen = pickRandom(candidates);
		if (!chosen) return null;
		assignments[sn] = chosen;
		used.add(chosen.id);
	}

	if (!primarySlot) primarySlot = slotNames[0];

	// Build tokens in pattern order.
	const tokens: string[] = [];
	for (const t of tpl.pattern) {
		if ('lit' in t) tokens.push(t.lit);
		else tokens.push(assignments[t.slot].jp);
	}

	const meaning = (c: any) => (loc === 'es' ? c.es : c.en) ?? c.jp;
	let translation = loc === 'es' ? tpl.translation_es : tpl.translation_en;
	for (const sn of slotNames) {
		translation = translation.split(`{${sn}}`).join(meaning(assignments[sn]));
	}

	const primaryToken = assignments[primarySlot].jp;

	return {
		templateId: tpl.id,
		tokens,
		shuffled: shuffle(tokens),
		suffix: tpl.suffix ?? '',
		translation,
		primarySlot,
		primaryToken,
		primaryCard: assignments[primarySlot],
		primaryCategory: assignments[primarySlot].category_es ?? ''
	};
}

/**
 * Returns true if any template can be built around this card given the pool.
 * Used by stepGenerator to gate fill_sentence and build_sentence.
 */
export function cardSupportsTemplate(card: any, pool: any[]): boolean {
	if (!card?.category_es) return false;
	const candidates = templatesForCategory(card.category_es);
	if (!candidates.length) return false;
	for (const tpl of candidates) {
		// Check that for each slot we can find at least one card.
		let ok = true;
		const used = new Set<string>([card.id]);
		for (const sn of Object.keys(tpl.slots)) {
			if (tpl.slots[sn].includes(card.category_es) && !used.has(card.id)) continue;
			const allowed = tpl.slots[sn];
			if (allowed.includes(card.category_es)) continue;
			const filler = pool.find((c) => c.id && !used.has(c.id) && allowed.includes(c.category_es));
			if (!filler) {
				ok = false;
				break;
			}
			used.add(filler.id);
		}
		if (ok) return true;
	}
	return false;
}

export function pickDistractors(
	correct: string,
	pool: any[],
	categoryPreferred: string,
	count = 3
): string[] {
	const same = pool.filter(
		(c) => c.jp && c.jp !== correct && c.category_es === categoryPreferred
	);
	const others = pool.filter((c) => c.jp && c.jp !== correct);
	const source = same.length >= count ? same : others;
	const seen = new Set<string>([correct]);
	const out: string[] = [];
	for (const c of shuffle(source)) {
		if (out.length >= count) break;
		if (!seen.has(c.jp)) {
			seen.add(c.jp);
			out.push(c.jp);
		}
	}
	return out;
}
