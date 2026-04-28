export interface CardData {
	jp: string;
	romaji: string;
	en: string;
	es: string;
	example: string;
	example_en: string;
	example_es: string;
	kana?: string;
	category?: string;
	category_es?: string;
	pos?: string;
	pos_es?: string;
	definitions_en?: string[];
	definitions_es?: string[];
	extra?: Record<string, string>;
	sort_order?: number;
}

export interface GrammarPoint {
	pattern: string;
	meaning_en: string;
	meaning_es: string;
	usage: string;
	examples: { jp: string; en: string; es: string }[];
	sort_order?: number;
}

export interface DeckDef {
	id: string;
	level: string;
	kind: 'Vocabulary' | 'Hiragana' | 'Katakana' | 'Kanji' | 'Grammar';
	kind_es: string;
	title_en: string;
	title_es: string;
	desc_en: string;
	desc_es: string;
	cards?: CardData[];
	grammar?: GrammarPoint[];
}
