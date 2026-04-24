export interface Deck {
	id: string;
	level: string;
	kind: string;
	title_en: string;
	title_es: string;
	desc_en: string;
	desc_es: string;
	card_count: number;
	learned?: number;
}

export interface Card {
	id: string;
	deck_id: string;
	jp: string;
	romaji: string;
	en: string;
	es: string;
	example: string;
	example_en: string;
	example_es: string;
}

export interface SessionResult {
	correct: number;
	total: number;
	mode: string;
	deckId: string;
	deckTitle: string;
}
