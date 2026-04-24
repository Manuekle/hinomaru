import type { GrammarPoint } from '../types';

// N4 Grammar — add points here following the same structure as N5
// TODO: populate with full N4 grammar list (~40 patterns)
export const grammar: GrammarPoint[] = [
	{
		pattern: '〜ながら',
		meaning_en: 'While doing V (simultaneous actions)',
		meaning_es: 'Mientras hace V (acciones simultáneas)',
		usage: 'Verb stem (ます-form without ます) + ながら. The main action comes at the end.',
		examples: [
			{
				jp: '音楽をきながらべんきょうします。',
				en: 'I study while listening to music.',
				es: 'Estudio mientras escucho música.'
			},
			{ jp: 'あるきながらはなします。', en: 'I talk while walking.', es: 'Hablo mientras camino.' }
		],
		sort_order: 1
	},
	{
		pattern: '〜てしまう',
		meaning_en: 'End up doing / Do completely (often regretful)',
		meaning_es: 'Terminar haciendo / Hacer completamente (a veces con pesar)',
		usage: 'て-form + しまう/しまいます. Expresses completion or an unintended result.',
		examples: [
			{
				jp: 'ケーキをぜんぶたべてしまいました。',
				en: 'I ended up eating all the cake.',
				es: 'Me comí todo el pastel.'
			},
			{
				jp: 'さいふをわすれてしまいました。',
				en: 'I forgot my wallet.',
				es: 'Olvidé mi billetera.'
			}
		],
		sort_order: 2
	}
];
