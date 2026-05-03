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

	// ── N5 — Roadmap Units ───────────────────────────────────────────────────
	{
		id: 'n5-hiragana',
		level: 'N5',
		kind: 'Hiragana',
		kind_es: 'Hiragana',
		title_en: 'Hiragana Foundations',
		title_es: 'Bases del Hiragana',
		desc_en: 'The essential Japanese alphabet.',
		desc_es: 'El alfabeto japonés esencial.',
		cards: n5Hiragana
	},
	{
		id: 'n5-katakana',
		level: 'N5',
		kind: 'Katakana',
		kind_es: 'Katakana',
		title_en: 'Katakana Alphabet',
		title_es: 'Alfabeto Katakana',
		desc_en: 'For foreign words and emphasis.',
		desc_es: 'Para palabras extranjeras y énfasis.',
		cards: n5Katakana
	},
	{
		id: 'n5-greetings',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Greetings',
		title_es: 'Saludos y Cortesía',
		desc_en: 'Learn to say hello and thank you.',
		desc_es: 'Aprende a decir hola y gracias.',
		cards: n5Vocab.filter((c) => c.category_es === 'Saludos')
	},
	{
		id: 'survival-intro',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Introductions',
		title_es: 'Presentación Personal',
		desc_en: 'Say your name and where you are from.',
		desc_es: 'Di tu nombre y de dónde vienes.',
		cards: introPhrases
	},
	{
		id: 'n5-numbers',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Numbers',
		title_es: 'Números',
		desc_en: 'Counting from 1 to 100.',
		desc_es: 'Contando del 1 al 100.',
		cards: n5Vocab.filter((c) => c.category_es === 'Números')
	},
	{
		id: 'n5-family',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Family',
		title_es: 'La Familia',
		desc_en: 'Identify family members.',
		desc_es: 'Identifica a los miembros de la familia.',
		cards: n5Vocab.filter((c) => c.category_es === 'Familia')
	},
	{
		id: 'n5-food',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Food & Drinks',
		title_es: 'Comida y Bebida',
		desc_en: 'Ramen, Sushi, and more.',
		desc_es: 'Ramen, Sushi y más.',
		cards: n5Vocab.filter((c) => c.category_es === 'Comida')
	},
	{
		id: 'n5-animals',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Animals',
		title_es: 'Animales',
		desc_en: 'Common pets and animals.',
		desc_es: 'Mascotas y animales comunes.',
		cards: n5Vocab.filter((c) => c.category_es === 'Animales')
	},
	{
		id: 'n5-colors',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Colors',
		title_es: 'Colores',
		desc_en: 'Red, Blue, Green...',
		desc_es: 'Rojo, Azul, Verde...',
		cards: n5Vocab.filter((c) => c.category_es === 'Colores')
	},
	{
		id: 'n5-weather',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Weather & Nature',
		title_es: 'Clima y Naturaleza',
		desc_en: 'Sun, rain, and mountains.',
		desc_es: 'Sol, lluvia y montañas.',
		cards: n5Vocab.filter((c) => c.category_es === 'Clima' || c.category_es === 'Naturaleza' || c.category_es === 'Estaciones')
	},
	{
		id: 'n5-verbs',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Action Verbs',
		title_es: 'Verbos de Acción',
		desc_en: 'Eat, sleep, and study.',
		desc_es: 'Comer, dormir y estudiar.',
		cards: n5Vocab.filter((c) => c.category_es === 'Verbos')
	},
	{
		id: 'n5-adjectives',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Adjectives',
		title_es: 'Adjetivos',
		desc_en: 'Describe things: big, small, new.',
		desc_es: 'Describe cosas: grande, pequeño, nuevo.',
		cards: n5Vocab.filter((c) => c.category_es === 'Adjetivos')
	},
	{
		id: 'n5-places',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Places & Travel',
		title_es: 'Lugares y Viajes',
		desc_en: 'School, Station, Hospital.',
		desc_es: 'Escuela, Estación, Hospital.',
		cards: n5Vocab.filter((c) => c.category_es?.match(/Lugares|Transporte/))
	},
	{
		id: 'n5-pronouns',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Pronouns',
		title_es: 'Pronombres',
		desc_en: 'I, you, he, she, we.',
		desc_es: 'Yo, tú, él, ella, nosotros.',
		cards: n5Vocab.filter((c) => c.category_es === 'Pronombres')
	},
	{
		id: 'n5-questions',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Question Words',
		title_es: 'Palabras de Pregunta',
		desc_en: 'What, who, where, when.',
		desc_es: 'Qué, quién, dónde, cuándo.',
		cards: n5Vocab.filter((c) => c.category_es === 'Preguntas')
	},
	{
		id: 'n5-time',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Time Expressions',
		title_es: 'Expresiones de Tiempo',
		desc_en: 'Today, tomorrow, morning, night.',
		desc_es: 'Hoy, mañana, mañana (a.m.), noche.',
		cards: n5Vocab.filter((c) => c.category_es === 'Tiempo')
	},
	{
		id: 'n5-body',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Body Parts',
		title_es: 'Partes del Cuerpo',
		desc_en: 'Eyes, ears, hands, feet.',
		desc_es: 'Ojos, oídos, manos, pies.',
		cards: n5Vocab.filter((c) => c.category_es === 'Cuerpo')
	},
	{
		id: 'n5-directions',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Directions',
		title_es: 'Direcciones',
		desc_en: 'Up, down, front, back, left, right.',
		desc_es: 'Arriba, abajo, frente, detrás, izquierda, derecha.',
		cards: n5Vocab.filter((c) => c.category_es === 'Direcciones')
	},
	{
		id: 'n5-objects',
		level: 'N5',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Everyday Objects',
		title_es: 'Objetos Cotidianos',
		desc_en: 'Book, phone, umbrella, watch.',
		desc_es: 'Libro, teléfono, paraguas, reloj.',
		cards: n5Vocab.filter((c) => c.category_es === 'Objetos')
	},
	{
		id: 'n4-verbs',
		level: 'N4',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'N4 Verbs',
		title_es: 'Verbos N4',
		desc_en: 'Transitive/intransitive pairs and common verbs.',
		desc_es: 'Pares transitivo/intransitivo y verbos comunes.',
		cards: n4Vocab.filter((c) => c.category_es === 'Verbos')
	},
	{
		id: 'n4-daily',
		level: 'N4',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Daily Life',
		title_es: 'Vida Diaria',
		desc_en: 'Nouns and expressions for daily life.',
		desc_es: 'Sustantivos y expresiones de la vida diaria.',
		cards: n4Vocab.filter((c) => c.category_es === 'Sustantivos')
	},
	{
		id: 'n4-time',
		level: 'N4',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Time & Schedule',
		title_es: 'Tiempo y Horario',
		desc_en: 'Time, dates, and scheduling vocabulary.',
		desc_es: 'Tiempo, fechas y vocabulario de horarios.',
		cards: n4Vocab.filter((c) => c.category_es === 'Tiempo')
	},
	{
		id: 'n4-adjectives',
		level: 'N4',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'N4 Adjectives',
		title_es: 'Adjetivos N4',
		desc_en: 'Intermediate adjectives.',
		desc_es: 'Adjetivos intermedios.',
		cards: n4Vocab.filter((c) => c.category_es === 'Adjetivos')
	},
	{
		id: 'n4-adverbs',
		level: 'N4',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'N4 Adverbs',
		title_es: 'Adverbios N4',
		desc_en: 'Adverbs and expressions.',
		desc_es: 'Adverbios y expresiones.',
		cards: n4Vocab.filter((c) => c.category_es === 'Adverbios')
	},
	{
		id: 'n4-counters',
		level: 'N4',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Counters',
		title_es: 'Contadores',
		desc_en: 'Numerical counters and units.',
		desc_es: 'Contadores numéricos y unidades.',
		cards: n4Vocab.filter((c) => c.category_es === 'Contadores')
	},
	{
		id: 'n4-social',
		level: 'N4',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Social',
		title_es: 'Social',
		desc_en: 'Social interactions and relationships.',
		desc_es: 'Interacciones sociales y relaciones.',
		cards: n4Vocab.filter((c) => c.category_es === 'Social')
	},
	{
		id: 'n3-verbs',
		level: 'N3',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'N3 Verbs',
		title_es: 'Verbos N3',
		desc_en: 'Intermediate verbs.',
		desc_es: 'Verbos intermedios.',
		cards: n3Vocab.filter((c) => c.category_es === 'Verbo' || c.category_es === 'Verbos')
	},
	{
		id: 'n3-adjectives',
		level: 'N3',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'N3 Adjectives',
		title_es: 'Adjetivos N3',
		desc_en: 'Intermediate adjectives.',
		desc_es: 'Adjetivos intermedios.',
		cards: n3Vocab.filter((c) => c.category_es === 'Adjetivo' || c.category_es === 'Adjetivos')
	},
	{
		id: 'n3-society',
		level: 'N3',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Society',
		title_es: 'Sociedad',
		desc_en: 'Society, politics, and social topics.',
		desc_es: 'Sociedad, política y temas sociales.',
		cards: n3Vocab.filter((c) => c.category_es === 'Sociedad' || c.category_es === 'Social')
	},
	{
		id: 'n3-emotions',
		level: 'N3',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Emotions',
		title_es: 'Emociones',
		desc_en: 'Emotions and relationships.',
		desc_es: 'Emociones y relaciones.',
		cards: n3Vocab.filter((c) => c.category_es === 'Emociones' || c.category_es === 'Emoción')
	},
	{
		id: 'n3-work',
		level: 'N3',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Work & Society',
		title_es: 'Trabajo y Sociedad',
		desc_en: 'Work and professional vocabulary.',
		desc_es: 'Vocabulario profesional y laboral.',
		cards: n3Vocab.filter((c) => c.category_es === 'Trabajo')
	},
	{
		id: 'n3-abstract',
		level: 'N3',
		kind: 'Vocabulary',
		kind_es: 'Vocabulario',
		title_en: 'Abstract Concepts',
		title_es: 'Conceptos Abstractos',
		desc_en: 'Abstract nouns and concepts.',
		desc_es: 'Sustantivos abstractos y conceptos.',
		cards: n3Vocab.filter((c) => c.category_es === 'Abstracto')
	},
	{
		id: 'n5-grammar-intro',
		level: 'N5',
		kind: 'Grammar',
		kind_es: 'Gramática',
		title_en: 'Basic Sentences',
		title_es: 'Frases Básicas (Desu)',
		desc_en: 'How to use "Desu" and "Wa".',
		desc_es: 'Cómo usar "Desu" y "Wa".',
		grammar: n5Grammar.slice(0, 5)
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
