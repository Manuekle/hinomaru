// Grammar-based sentence templates for N5 sentence generation.
// Each template defines an ordered token pattern with literal JP tokens
// and slot placeholders. Slots constrain which card categories can fill them.

export type TokenSpec = { lit: string } | { slot: string };

export interface Template {
	id: string;
	pattern: TokenSpec[];
	/** slot name → list of `category_es` values that can fill it */
	slots: Record<string, string[]>;
	/** Spanish translation with {X} {Y} placeholders interpolated with card.es */
	translation_es: string;
	translation_en: string;
	/** Optional trailing punctuation, appended after rendering, NOT part of selectable tokens */
	suffix?: string;
}

/* All templates use simple, polite N5 grammar. */
export const TEMPLATES: Template[] = [
	{
		id: 'eat_object',
		pattern: [{ slot: 'X' }, { lit: 'を' }, { lit: 'たべます' }],
		slots: { X: ['Comida'] },
		translation_es: 'Como {X}.',
		translation_en: 'I eat {X}.',
		suffix: '。'
	},
	{
		id: 'drink_object',
		pattern: [{ slot: 'X' }, { lit: 'を' }, { lit: 'のみます' }],
		slots: { X: ['Comida'] },
		translation_es: 'Bebo {X}.',
		translation_en: 'I drink {X}.',
		suffix: '。'
	},
	{
		id: 'go_to_place',
		pattern: [{ slot: 'X' }, { lit: 'に' }, { lit: 'いきます' }],
		slots: { X: ['Lugares', 'Transporte'] },
		translation_es: 'Voy a {X}.',
		translation_en: 'I go to {X}.',
		suffix: '。'
	},
	{
		id: 'like_X',
		pattern: [{ slot: 'X' }, { lit: 'が' }, { lit: 'すきです' }],
		slots: { X: ['Comida', 'Animales', 'Colores', 'Lugares', 'Naturaleza', 'Estaciones'] },
		translation_es: 'Me gusta {X}.',
		translation_en: 'I like {X}.',
		suffix: '。'
	},
	{
		id: 'see_X',
		pattern: [{ slot: 'X' }, { lit: 'を' }, { lit: 'みます' }],
		slots: { X: ['Animales', 'Naturaleza', 'Objetos', 'Lugares'] },
		translation_es: 'Veo {X}.',
		translation_en: 'I see {X}.',
		suffix: '。'
	},
	{
		id: 'X_and_Y',
		pattern: [{ slot: 'X' }, { lit: 'と' }, { slot: 'Y' }],
		slots: {
			X: ['Comida', 'Animales', 'Familia', 'Lugares', 'Colores', 'Objetos', 'Naturaleza'],
			Y: ['Comida', 'Animales', 'Familia', 'Lugares', 'Colores', 'Objetos', 'Naturaleza']
		},
		translation_es: '{X} y {Y}',
		translation_en: '{X} and {Y}'
	},
	{
		id: 'this_is_X',
		pattern: [{ lit: 'これは' }, { slot: 'X' }, { lit: 'です' }],
		slots: {
			X: ['Comida', 'Animales', 'Objetos', 'Naturaleza', 'Lugares', 'Cuerpo', 'Colores']
		},
		translation_es: 'Esto es {X}.',
		translation_en: 'This is {X}.',
		suffix: '。'
	},
	{
		id: 'there_is_X',
		pattern: [{ slot: 'X' }, { lit: 'が' }, { lit: 'あります' }],
		slots: { X: ['Objetos', 'Naturaleza', 'Comida'] },
		translation_es: 'Hay {X}.',
		translation_en: 'There is {X}.',
		suffix: '。'
	},
	{
		id: 'body_hurts',
		pattern: [{ slot: 'X' }, { lit: 'が' }, { lit: 'いたいです' }],
		slots: { X: ['Cuerpo'] },
		translation_es: 'Me duele {X}.',
		translation_en: '{X} hurts.',
		suffix: '。'
	},
	{
		id: 'my_family_member',
		pattern: [{ lit: 'わたしの' }, { slot: 'X' }, { lit: 'です' }],
		slots: { X: ['Familia'] },
		translation_es: 'Es mi {X}.',
		translation_en: 'This is my {X}.',
		suffix: '。'
	}
];

/** Returns templates whose slot accepts cards in the given category. */
export function templatesForCategory(category: string): Template[] {
	return TEMPLATES.filter((t) =>
		Object.values(t.slots).some((cats) => cats.includes(category))
	);
}

export function categorySupported(category: string | undefined | null): boolean {
	if (!category) return false;
	return templatesForCategory(category).length > 0;
}
