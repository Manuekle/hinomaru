import type { DeckDef } from './types';
import { vocabulary as n5Vocab } from './n5/vocabulary';
import { hiragana as n5Hiragana } from './n5/hiragana';
import { katakana as n5Katakana } from './n5/katakana';
import { kanji as n5Kanji } from './n5/kanji';
import { grammar as n5Grammar } from './n5/grammar';
import { vocabulary as n4Vocab } from './n4/vocabulary';
import { grammar as n4Grammar } from './n4/grammar';
import { vocabulary as n3Vocab } from './n3/vocabulary';
import { grammar as n3Grammar } from './n3/grammar';
import { vocabulary as n2Vocab } from './n2/vocabulary';
import { grammar as n2Grammar } from './n2/grammar';
import { vocabulary as n1Vocab } from './n1/vocabulary';
import { grammar as n1Grammar } from './n1/grammar';
import { phrases as introPhrases } from './survival/introduction';
import { phrases as survivalPhrases } from './survival/phrases';
import { restaurantPhrases } from './survival/restaurant';
import { shoppingPhrases } from './survival/shopping';
import { directionsPhrases } from './survival/directions';
import { hotelPhrases } from './survival/hotel';
import { healthPhrases } from './survival/health';

export const DECKS: DeckDef[] = [
	// ── N5 ────────────────────────────────────────────────────────────────────
	{
		id: 'n5-intro',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Supervivencia',
		title_en: 'Self-Introduction',
		title_es: 'Presentación Personal',
		desc_en: 'Learn to introduce yourself and share basic info.',
		desc_es: 'Aprende a presentarte y compartir información básica.',
		cards: introPhrases
	},
	// ── Survival ──────────────────────────────────────────────────────────────
	{
		id: 'survival-travel',
		level: 'Survival',
		kind: 'Vocabulary',
		kind_es: 'Supervivencia',
		title_en: 'Travel Phrases',
		title_es: 'Frases de Viaje',
		desc_en: 'Essential phrases for your trip to Japan. Speak instantly.',
		desc_es: 'Frases esenciales para tu viaje a Japón. Habla al instante.',
		cards: survivalPhrases
	},
	{
		id: 'survival-restaurant',
		level: 'Survival',
		kind: 'Vocabulary',
		kind_es: 'Supervivencia',
		title_en: 'At the Restaurant',
		title_es: 'En el Restaurante',
		desc_en: 'Order food, ask for water, and pay the bill.',
		desc_es: 'Pide comida, pide agua y paga la cuenta sin problemas.',
		cards: restaurantPhrases
	},
	{
		id: 'survival-shopping',
		level: 'Survival',
		kind: 'Vocabulary',
		kind_es: 'Supervivencia',
		title_en: 'Shopping',
		title_es: 'De Compras',
		desc_en: 'Try clothes, ask for prices, and refuse bags.',
		desc_es: 'Pruébate ropa, pregunta precios y rechaza bolsas.',
		cards: shoppingPhrases
	},
	{
		id: 'survival-directions',
		level: 'Survival',
		kind: 'Vocabulary',
		kind_es: 'Supervivencia',
		title_en: 'Directions & Trains',
		title_es: 'Direcciones y Trenes',
		desc_en: 'Find the station, buy tickets, and avoid getting lost.',
		desc_es: 'Encuentra la estación, compra boletos y evita perderte.',
		cards: directionsPhrases
	},
	{
		id: 'survival-hotel',
		level: 'Survival',
		kind: 'Vocabulary',
		kind_es: 'Supervivencia',
		title_en: 'Hotel & Accommodation',
		title_es: 'Hotel y Alojamiento',
		desc_en: 'Check-in, request towels, and ask for the Wi-Fi.',
		desc_es: 'Haz check-in, pide toallas y pregunta por el Wi-Fi.',
		cards: hotelPhrases
	},
	{
		id: 'survival-health',
		level: 'Survival',
		kind: 'Vocabulary',
		kind_es: 'Supervivencia',
		title_en: 'Emergencies & Health',
		title_es: 'Emergencias y Salud',
		desc_en: 'Ask for help, find a hospital, or explain your symptoms.',
		desc_es: 'Pide ayuda, encuentra un hospital o explica tus síntomas.',
		cards: healthPhrases
	},

	{
		id: 'n5-hiragana',
		level: 'N5',
		kind: 'Hiragana',
		kind_es: 'Hiragana',
		title_en: 'All 46 hiragana',
		title_es: 'Los 46 hiragana',
		desc_en: 'The foundational syllabary. Start here if it is your first time.',
		desc_es: 'El silabario base. Empieza aquí si es tu primera vez.',
		cards: n5Hiragana
	},
	{
		id: 'n5-katakana',
		level: 'N5',
		kind: 'Katakana',
		kind_es: 'Katakana',
		title_en: 'All 46 katakana',
		title_es: 'Los 46 katakana',
		desc_en: 'Used for foreign loanwords, emphasis, and onomatopoeia.',
		desc_es: 'Para extranjerismos, énfasis y onomatopeya.',
		cards: n5Katakana
	},
	{
		id: 'n5-vocab',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Essential vocabulary',
		title_es: 'Vocabulario esencial',
		desc_en: '149 must-know words: greetings, verbs, adjectives, daily life.',
		desc_es: '149 palabras clave: saludos, verbos, adjetivos, vida cotidiana.',
		cards: n5Vocab
	},
	{
		id: 'n5-kanji',
		level: 'N5',
		kind: 'Kanji',
		kind_es: 'Kanji',
		title_en: 'N5 kanji — all 80',
		title_es: 'Kanji N5 — los 80',
		desc_en: 'Numbers, days, nature, people, and basic actions.',
		desc_es: 'Números, días, naturaleza, personas y acciones básicas.',
		cards: n5Kanji
	},
	{
		id: 'n5-grammar',
		level: 'N5',
		kind: 'Grammar',
		kind_es: 'Gramática',
		title_en: 'N5 grammar — 30 patterns',
		title_es: 'Gramática N5 — 30 patrones',
		desc_en: 'Core sentence structures: です, particles, ます-form, て-form, and more.',
		desc_es: 'Estructuras clave: です, partículas, forma ます, forma て y más.',
		grammar: n5Grammar
	},

	// ── N4 ────────────────────────────────────────────────────────────────────
	{
		id: 'n4-vocab',
		level: 'N4',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'N4 vocabulary',
		title_es: 'Vocabulario N4',
		desc_en: 'Expanding daily vocabulary beyond N5. (~1500 total)',
		desc_es: 'Vocabulario cotidiano más allá del N5. (~1500 en total)',
		cards: n4Vocab
	},
	{
		id: 'n4-grammar',
		level: 'N4',
		kind: 'Grammar',
		kind_es: 'Gramática',
		title_en: 'N4 grammar — 40 patterns',
		title_es: 'Gramática N4 — 40 patrones',
		desc_en: 'Intermediate structures: ながら, てしまう, ておく, and more.',
		desc_es: 'Estructuras intermedias: ながら, てしまう, ておく y más.',
		grammar: n4Grammar
	},

	// ── N3 (structure ready — add content in src/lib/data/n3/) ───────────────
	{
		id: 'n3-vocab',
		level: 'N3',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'N3 vocabulary',
		title_es: 'Vocabulario N3',
		desc_en: 'Upper intermediate vocabulary. (~3750 total)',
		desc_es: 'Vocabulario intermedio-alto. (~3750 en total)',
		cards: n3Vocab
	},
	{
		id: 'n3-grammar',
		level: 'N3',
		kind: 'Grammar',
		kind_es: 'Gramática',
		title_en: 'N3 grammar — 50 patterns',
		title_es: 'Gramática N3 — 50 patrones',
		desc_en: 'Complex conditionals, passive, causative, and more.',
		desc_es: 'Condicionales, pasiva, causativa y más.',
		grammar: n3Grammar
	},

	// ── N2 ────────────────────────────────────────────────────────────────────
	{
		id: 'n2-vocab',
		level: 'N2',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'N2 vocabulary',
		title_es: 'Vocabulario N2',
		desc_en: 'Advanced vocabulary for newspapers and academic texts. (~6000 total)',
		desc_es: 'Vocabulario avanzado para periódicos y textos académicos. (~6000 en total)',
		cards: n2Vocab
	},
	{
		id: 'n2-grammar',
		level: 'N2',
		kind: 'Grammar',
		kind_es: 'Gramática',
		title_en: 'N2 grammar — 60 patterns',
		title_es: 'Gramática N2 — 60 patrones',
		desc_en: 'Formal expressions, nuanced modality, and written style.',
		desc_es: 'Expresiones formales, modalidad y estilo escrito.',
		grammar: n2Grammar
	},

	// ── N1 ────────────────────────────────────────────────────────────────────
	{
		id: 'n1-vocab',
		level: 'N1',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'N1 vocabulary',
		title_es: 'Vocabulario N1',
		desc_en: 'Near-native vocabulary: literature, law, philosophy. (10000+ total)',
		desc_es: 'Vocabulario casi nativo: literatura, derecho, filosofía. (10000+ en total)',
		cards: n1Vocab
	},
	{
		id: 'n1-grammar',
		level: 'N1',
		kind: 'Grammar',
		kind_es: 'Gramática',
		title_en: 'N1 grammar — 60 patterns',
		title_es: 'Gramática N1 — 60 patrones',
		desc_en: 'Classical forms, rare expressions, and advanced nuance.',
		desc_es: 'Formas clásicas, expresiones raras y matices avanzados.',
		grammar: n1Grammar
	}
];

export type { DeckDef, CardData, GrammarPoint } from './types';
