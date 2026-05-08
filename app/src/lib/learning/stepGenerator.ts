import type { LessonType } from '$lib/data/roadmap';
import type { Step, StepKind } from './engine';
import { cardSupportsTemplate } from './sentenceBuilder';

type ContentKind = 'kana' | 'vocab' | 'kanji' | 'grammar';

const POOL: Record<LessonType, Record<ContentKind, StepKind[]>> = {
	learn: {
		kana: ['recognize', 'write'],
		vocab: ['recognize', 'listen_select', 'write'],
		kanji: ['recognize', 'write'],
		grammar: ['recognize', 'fill_sentence', 'build_sentence']
	},
	practice: {
		kana: ['recognize', 'write', 'match_pairs'],
		vocab: ['translate_sentence', 'match_pairs', 'listen_select'],
		kanji: ['write', 'match_pairs', 'recognize'],
		grammar: ['fill_sentence', 'build_sentence', 'translate_sentence']
	},
	quiz: {
		kana: ['write', 'listen_select'],
		vocab: ['listen', 'write', 'listen_select'],
		kanji: ['write', 'recognize'],
		grammar: ['fill_sentence', 'build_sentence']
	},
	review: {
		kana: ['match_pairs', 'recognize'],
		vocab: ['translate_sentence', 'match_pairs'],
		kanji: ['recognize', 'write'],
		grammar: ['fill_sentence', 'translate_sentence']
	},
	speak: {
		kana: ['recognize', 'speak'],
		vocab: ['listen_select', 'speak'],
		kanji: ['recognize', 'speak'],
		grammar: ['speak', 'listen']
	}
};

const MAX_CARDS = 6;
const MAX_STEPS = 12;

const KANA_RE = /^[\p{Script=Hiragana}\p{Script=Katakana}ー]+$/u;
const KANJI_RE = /\p{Script=Han}/u;

function inferContentKind(card: any): ContentKind {
	const jp: string = card?.jp ?? '';
	const cat = String(card?.category ?? card?.category_es ?? card?.pos ?? '').toLowerCase();
	if (cat.includes('grammar') || cat.includes('gramática') || cat.includes('gramatica')) return 'grammar';
	if (cat.includes('kanji')) return 'kanji';
	if (cat.includes('hiragana') || cat.includes('katakana') || cat.includes('kana')) return 'kana';
	if (jp && KANA_RE.test(jp) && jp.length <= 2) return 'kana';
	if (jp && KANJI_RE.test(jp)) return 'kanji';
	return 'vocab';
}

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
	const lessonPool = POOL[lessonType] ?? POOL.learn;
	const usable = shuffle(cards).slice(0, MAX_CARDS);

	const pairs: Pair[] = [];
	for (const card of usable) {
		const kind = inferContentKind(card);
		const pool = lessonPool[kind] ?? lessonPool.vocab;
		const supportsTemplate = cardSupportsTemplate(card, cards);
		const hasExample = !!(card.example && card.example_es);
		for (const stepKind of pool) {
			if ((stepKind === 'fill_sentence' || stepKind === 'build_sentence') && !supportsTemplate) continue;
			if (stepKind === 'speak' && !card.jp) continue;
			if (stepKind === 'translate_sentence' && !(hasExample && supportsTemplate)) continue;
			pairs.push({ card, kind: stepKind });
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
