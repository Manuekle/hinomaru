import type { LessonType } from '$lib/data/roadmap';
import type { Step, StepKind } from './engine';
import { cardSupportsTemplate } from './sentenceBuilder';

const POOL: Record<LessonType, StepKind[]> = {
	learn: ['recognize', 'choose', 'fill_sentence', 'build_sentence', 'listen', 'write'],
	quiz: ['choose', 'fill_sentence', 'build_sentence', 'listen', 'write'],
	review: ['recognize', 'fill_sentence'],
	speak: ['listen', 'speak']
};

const MAX_CARDS = 6;
const MAX_STEPS = 18;

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

interface Pair {
	card: any;
	kind: StepKind;
}

function interleave(pairs: Pair[]): Pair[] {
	const out: Pair[] = [];
	const remaining = [...pairs];
	let lastKind: StepKind | null = null;
	let lastCardId: string | null = null;
	while (remaining.length) {
		let bestIdx = remaining.findIndex((p) => p.kind !== lastKind && p.card.id !== lastCardId);
		if (bestIdx === -1) bestIdx = remaining.findIndex((p) => p.kind !== lastKind);
		if (bestIdx === -1) bestIdx = remaining.findIndex((p) => p.card.id !== lastCardId);
		if (bestIdx === -1) bestIdx = 0;
		const [picked] = remaining.splice(bestIdx, 1);
		out.push(picked);
		lastKind = picked.kind;
		lastCardId = picked.card.id;
	}
	return out;
}

export function buildSteps(lessonType: LessonType, cards: any[]): Step[] {
	if (!cards.length) return [];
	const pool = POOL[lessonType] ?? POOL.learn;
	const usable = shuffle(cards).slice(0, MAX_CARDS);

	const pairs: Pair[] = [];
	for (const card of usable) {
		const supportsTemplate = cardSupportsTemplate(card, cards);
		for (const kind of pool) {
			if ((kind === 'fill_sentence' || kind === 'build_sentence') && !supportsTemplate) continue;
			if (kind === 'speak' && !card.jp) continue;
			pairs.push({ card, kind });
		}
	}

	const ordered = interleave(shuffle(pairs)).slice(0, MAX_STEPS);

	return ordered.map((p, i) => ({
		id: `${p.card.id}#${i}#${p.kind}`,
		cardId: p.card.id,
		kind: p.kind,
		retries: 0
	}));
}
