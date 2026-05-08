import type { Lesson, RoadmapUnit, LessonType } from './roadmap';

interface DeckRef {
	id: string;
	title_es: string;
	title_en: string;
}

interface BasicUnit {
	id: string;
	section_es: string;
	section_en: string;
	title_es: string;
	title_en: string;
	emoji: string;
	objective_es: string;
	objective_en: string;
	decks: DeckRef[];
}

function build(u: BasicUnit): RoadmapUnit {
	const primaryDeck = u.decks[0];
	const types: LessonType[] = ['learn', 'practice', 'review'];
	const lessons: Lesson[] = types.map((type) => ({
		id: `${u.id}__${type}`,
		type,
		deckId: primaryDeck.id,
		title_es:
			type === 'learn'
				? `Aprender: ${primaryDeck.title_es}`
				: type === 'practice'
					? `Práctica: ${u.title_es}`
					: `Maestría: ${u.title_es}`,
		title_en:
			type === 'learn'
				? `Learn: ${primaryDeck.title_en}`
				: type === 'practice'
					? `Practice: ${u.title_en}`
					: `Mastery: ${u.title_en}`,
		goal_es:
			type === 'learn'
				? 'Reconoce las formas y sonidos básicos.'
				: type === 'practice'
					? 'Refuerza con ejercicios variados.'
					: 'Demuestra dominio total.',
		goal_en:
			type === 'learn'
				? 'Recognize the basic shapes and sounds.'
				: type === 'practice'
					? 'Reinforce with varied exercises.'
					: 'Demonstrate full mastery.'
	}));

	return {
		id: u.id,
		section_en: u.section_en,
		section_es: u.section_es,
		title_en: u.title_en,
		title_es: u.title_es,
		emoji: u.emoji,
		objective_en: u.objective_en,
		objective_es: u.objective_es,
		lessons
	};
}

export const ALPHABET_ROADMAP: RoadmapUnit[] = [
	build({
		id: 'alpha-h-u1',
		section_es: 'Hiragana',
		section_en: 'Hiragana',
		title_es: 'Vocales',
		title_en: 'Vowels',
		emoji: 'あ',
		objective_es: 'Domina あ い う え お, los cinco sonidos base.',
		objective_en: 'Master あ い う え お, the five base sounds.',
		decks: [{ id: 'n5-hiragana', title_es: 'Vocales Hiragana', title_en: 'Hiragana Vowels' }]
	}),
	build({
		id: 'alpha-h-u2',
		section_es: 'Hiragana',
		section_en: 'Hiragana',
		title_es: 'K, S, T, N',
		title_en: 'K, S, T, N',
		emoji: 'か',
		objective_es: 'Aprende las filas KA, SA, TA y NA.',
		objective_en: 'Learn the KA, SA, TA and NA rows.',
		decks: [{ id: 'n5-hiragana', title_es: 'K S T N', title_en: 'K S T N' }]
	}),
	build({
		id: 'alpha-h-u3',
		section_es: 'Hiragana',
		section_en: 'Hiragana',
		title_es: 'H, M, Y, R, W',
		title_en: 'H, M, Y, R, W',
		emoji: 'は',
		objective_es: 'Completa el silabario con HA, MA, YA, RA, WA y N.',
		objective_en: 'Complete the syllabary with HA, MA, YA, RA, WA and N.',
		decks: [{ id: 'n5-hiragana', title_es: 'H M Y R W', title_en: 'H M Y R W' }]
	}),
	build({
		id: 'alpha-h-u4',
		section_es: 'Hiragana',
		section_en: 'Hiragana',
		title_es: 'Dakuten y Combinaciones',
		title_en: 'Dakuten & Combos',
		emoji: '💮',
		objective_es: 'Sonidos voiced (が、ざ、だ…) y combinaciones (きゃ、しゃ…).',
		objective_en: 'Voiced sounds (が、ざ、だ…) and combos (きゃ、しゃ…).',
		decks: [{ id: 'n5-hiragana', title_es: 'Dakuten y Combos', title_en: 'Dakuten & Combos' }]
	}),
	build({
		id: 'alpha-k-u1',
		section_es: 'Katakana',
		section_en: 'Katakana',
		title_es: 'Grupo 1',
		title_en: 'Group 1',
		emoji: 'ア',
		objective_es: 'Aprende ア行 a ナ行 para leer palabras extranjeras.',
		objective_en: 'Learn ア row to ナ row to read foreign words.',
		decks: [{ id: 'n5-katakana', title_es: 'Katakana 1', title_en: 'Katakana 1' }]
	}),
	build({
		id: 'alpha-k-u2',
		section_es: 'Katakana',
		section_en: 'Katakana',
		title_es: 'Grupo 2',
		title_en: 'Group 2',
		emoji: 'ハ',
		objective_es: 'Completa ハ行 a ワ行 y domina el katakana completo.',
		objective_en: 'Complete ハ row to ワ row and master full katakana.',
		decks: [{ id: 'n5-katakana', title_es: 'Katakana 2', title_en: 'Katakana 2' }]
	}),
	build({
		id: 'alpha-k-u3',
		section_es: 'Katakana',
		section_en: 'Katakana',
		title_es: 'Préstamos',
		title_en: 'Loanwords',
		emoji: '🌐',
		objective_es: 'Lee y reconoce préstamos del inglés y otros idiomas.',
		objective_en: 'Read and recognize loanwords from English and other languages.',
		decks: [{ id: 'n5-katakana', title_es: 'Préstamos', title_en: 'Loanwords' }]
	})
];

export function isAlphabetLessonId(id: string): boolean {
	return id.startsWith('alpha-');
}
