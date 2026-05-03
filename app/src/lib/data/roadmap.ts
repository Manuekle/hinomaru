export type LessonType = 'learn' | 'practice' | 'quiz' | 'review' | 'speak';

export interface Lesson {
	id: string;
	type: LessonType;
	deckId: string;
	title_en: string;
	title_es: string;
	goal_en: string;
	goal_es: string;
}

export interface RoadmapUnit {
	id: string;
	section_en: string;
	section_es: string;
	title_en: string;
	title_es: string;
	emoji: string;
	objective_en: string;
	objective_es: string;
	lessons: Lesson[];
}

interface DeckRef {
	id: string;
	title_es: string;
	title_en: string;
	goal_es?: string;
	goal_en?: string;
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
	includeQuiz?: boolean;
}

function build(u: BasicUnit): RoadmapUnit {
	const primaryDeck = u.decks[0];
	const lessons: Lesson[] = [
		{
			id: `${u.id}__learn`,
			type: 'learn',
			deckId: primaryDeck.id,
			title_es: `Aprender: ${primaryDeck.title_es}`,
			title_en: `Learn: ${primaryDeck.title_en}`,
			goal_es: 'Introducción al vocabulario esencial.',
			goal_en: 'Introduction to essential vocabulary.'
		},
		{
			id: `${u.id}__practice`,
			type: 'practice',
			deckId: primaryDeck.id,
			title_es: `Práctica: ${u.title_es}`,
			title_en: `Practice: ${u.title_en}`,
			goal_es: 'Refuerza lo aprendido con ejercicios variados.',
			goal_en: 'Reinforce what you learned with varied exercises.'
		},
		{
			id: `${u.id}__speak`,
			type: 'speak',
			deckId: primaryDeck.id,
			title_es: `Hablar: ${u.title_es}`,
			title_en: `Speak: ${u.title_en}`,
			goal_es: 'Mejora tu pronunciación y fluidez.',
			goal_en: 'Improve your pronunciation and fluency.'
		},
		{
			id: `${u.id}__mastery`,
			type: 'review',
			deckId: primaryDeck.id,
			title_es: `Maestría: ${u.title_es}`,
			title_en: `Mastery: ${u.title_en}`,
			goal_es: 'Demuestra tu dominio total del tema.',
			goal_en: 'Demonstrate your total mastery of the topic.'
		}
	];

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

export const ROADMAPS: Record<string, RoadmapUnit[]> = {
	Survival: [
		build({
			id: 'sv-s1-u1',
			section_es: 'Primeros Saludos',
			section_en: 'First Greetings',
			title_es: 'Hola y Adiós',
			title_en: 'Hello & Goodbye',
			emoji: '👋',
			objective_es: 'Saludos básicos para el día a día.',
			objective_en: 'Basic greetings for everyday life.',
			decks: [{ id: 'n5-greetings', title_es: 'Saludos', title_en: 'Greetings' }]
		}),
		build({
			id: 'sv-s1-u2',
			section_es: 'Primeros Saludos',
			section_en: 'First Greetings',
			title_es: 'Cortesía Japonesa',
			title_en: 'Japanese Politeness',
			emoji: '🙇‍♂️',
			objective_es: 'Usa "Sumimasen" y "Arigato" correctamente.',
			objective_en: 'Use "Sumimasen" and "Arigato" correctly.',
			decks: [{ id: 'survival-intro', title_es: 'Cortesía', title_en: 'Politeness' }]
		}),
		build({
			id: 'sv-s1-u3',
			section_es: 'Primeros Saludos',
			section_en: 'First Greetings',
			title_es: 'Presentación Básica',
			title_en: 'Basic Introduction',
			emoji: '🆔',
			objective_es: 'Di tu nombre y nacionalidad.',
			objective_en: 'Say your name and nationality.',
			decks: [{ id: 'survival-intro', title_es: 'Identidad', title_en: 'Identity' }]
		}),
		build({
			id: 'sv-s2-u1',
			section_es: 'En el Restaurante',
			section_en: 'At the Restaurant',
			title_es: 'Menú y Comidas',
			title_en: 'Menu & Food',
			emoji: '🍜',
			objective_es: 'Reconoce los platos más comunes.',
			objective_en: 'Recognize common dishes.',
			decks: [{ id: 'survival-restaurant', title_es: 'El Menú', title_en: 'The Menu' }]
		}),
		build({
			id: 'sv-s2-u2',
			section_es: 'En el Restaurante',
			section_en: 'At the Restaurant',
			title_es: 'Pedir Comida',
			title_en: 'Ordering Food',
			emoji: '🙋‍♂️',
			objective_es: 'Usa "Kudasai" para pedir algo.',
			objective_en: 'Use "Kudasai" to order something.',
			decks: [{ id: 'n5-food', title_es: 'Pedidos', title_en: 'Orders' }]
		}),
		build({
			id: 'sv-s2-u3',
			section_es: 'En el Restaurante',
			section_en: 'At the Restaurant',
			title_es: 'Bebidas y Más',
			title_en: 'Drinks & More',
			emoji: '🍶',
			objective_es: 'Pide agua, té y otras bebidas.',
			objective_en: 'Order water, tea and other drinks.',
			decks: [{ id: 'n5-food', title_es: 'Bebidas', title_en: 'Drinks' }]
		}),
		build({
			id: 'sv-s2-u4',
			section_es: 'En el Restaurante',
			section_en: 'At the Restaurant',
			title_es: 'La Cuenta, por favor',
			title_en: 'The Bill, please',
			emoji: '💴',
			objective_es: 'Pregunta cuánto es y paga.',
			objective_en: 'Ask how much it is and pay.',
			decks: [{ id: 'n5-numbers', title_es: 'Precios', title_en: 'Prices' }]
		}),
		build({
			id: 'sv-s3-u1',
			section_es: 'De Compras',
			section_en: 'Shopping',
			title_es: 'Números 1-100',
			title_en: 'Numbers 1-100',
			emoji: '🔢',
			objective_es: 'Domina los números para comprar.',
			objective_en: 'Master numbers for shopping.',
			decks: [{ id: 'n5-numbers', title_es: 'Números', title_en: 'Numbers' }]
		}),
		build({
			id: 'sv-s3-u2',
			section_es: 'De Compras',
			section_en: 'Shopping',
			title_es: 'Preguntar el Precio',
			title_en: 'Asking the Price',
			emoji: '💰',
			objective_es: 'Usa "Ikura desu ka?" con soltura.',
			objective_en: 'Use "Ikura desu ka?" fluently.',
			decks: [{ id: 'survival-shopping', title_es: 'Precios', title_en: 'Prices' }]
		}),
		build({
			id: 'sv-s3-u3',
			section_es: 'De Compras',
			section_en: 'Shopping',
			title_es: 'Tiendas y Objetos',
			title_en: 'Shops & Objects',
			emoji: '🛍️',
			objective_es: 'Identifica objetos comunes.',
			objective_en: 'Identify common objects.',
			decks: [{ id: 'n5-objects', title_es: 'Objetos', title_en: 'Objects' }]
		}),
		build({
			id: 'sv-s4-u1',
			section_es: 'Moverse en Japón',
			section_en: 'Getting Around',
			title_es: 'Trenes y Estaciones',
			title_en: 'Trains & Stations',
			emoji: '🚆',
			objective_es: 'Vocabulario esencial de transporte.',
			objective_en: 'Essential transport vocabulary.',
			decks: [{ id: 'survival-directions', title_es: 'Transporte', title_en: 'Transport' }]
		}),
		build({
			id: 'sv-s4-u2',
			section_es: 'Moverse en Japón',
			section_en: 'Getting Around',
			title_es: '¿Dónde está...?',
			title_en: 'Where is...?',
			emoji: '📍',
			objective_es: 'Pregunta por lugares específicos.',
			objective_en: 'Ask for specific places.',
			decks: [{ id: 'n5-places', title_es: 'Lugares', title_en: 'Places' }]
		})
	],

	N5: [
		// ── ESCRITURA: HIRAGANA ──────────────────────────────────────────────
		build({
			id: 'n5-s1-u1',
			section_es: 'Escritura: Hiragana',
			section_en: 'Writing: Hiragana',
			title_es: 'Hiragana: Vocales',
			title_en: 'Hiragana: Vowels',
			emoji: 'あ',
			objective_es: 'Domina あ い う え お, los cinco sonidos base.',
			objective_en: 'Master あ い う え お, the five base sounds.',
			decks: [{ id: 'n5-hiragana', title_es: 'Vocales Hiragana', title_en: 'Hiragana Vowels' }]
		}),
		build({
			id: 'n5-s1-u2',
			section_es: 'Escritura: Hiragana',
			section_en: 'Writing: Hiragana',
			title_es: 'Hiragana: K, S, T, N',
			title_en: 'Hiragana: K, S, T, N',
			emoji: 'か',
			objective_es: 'Aprende las filas KA, SA, TA y NA.',
			objective_en: 'Learn the KA, SA, TA and NA rows.',
			decks: [{ id: 'n5-hiragana', title_es: 'K S T N', title_en: 'K S T N' }]
		}),
		build({
			id: 'n5-s1-u3',
			section_es: 'Escritura: Hiragana',
			section_en: 'Writing: Hiragana',
			title_es: 'Hiragana: H, M, Y, R, W',
			title_en: 'Hiragana: H, M, Y, R, W',
			emoji: 'は',
			objective_es: 'Completa el silabario con HA, MA, YA, RA, WA y N.',
			objective_en: 'Complete the syllabary with HA, MA, YA, RA, WA and N.',
			decks: [{ id: 'n5-hiragana', title_es: 'H M Y R W', title_en: 'H M Y R W' }]
		}),
		build({
			id: 'n5-s1-u4',
			section_es: 'Escritura: Hiragana',
			section_en: 'Writing: Hiragana',
			title_es: 'Hiragana: Dakuten y Combinaciones',
			title_en: 'Hiragana: Dakuten & Combos',
			emoji: '💮',
			objective_es: 'Sonidos voiced (が、ざ、だ…) y combinaciones (きゃ、しゃ…).',
			objective_en: 'Voiced sounds (が、ざ、だ…) and combos (きゃ、しゃ…).',
			decks: [{ id: 'n5-hiragana', title_es: 'Dakuten y Combos', title_en: 'Dakuten & Combos' }]
		}),

		// ── ESCRITURA: KATAKANA ──────────────────────────────────────────────
		build({
			id: 'n5-s2-u1',
			section_es: 'Escritura: Katakana',
			section_en: 'Writing: Katakana',
			title_es: 'Katakana: Grupo 1',
			title_en: 'Katakana: Group 1',
			emoji: 'ア',
			objective_es: 'Aprende ア行 a ナ行 para leer palabras extranjeras.',
			objective_en: 'Learn ア row to ナ row to read foreign words.',
			decks: [{ id: 'n5-katakana', title_es: 'Katakana 1', title_en: 'Katakana 1' }]
		}),
		build({
			id: 'n5-s2-u2',
			section_es: 'Escritura: Katakana',
			section_en: 'Writing: Katakana',
			title_es: 'Katakana: Grupo 2',
			title_en: 'Katakana: Group 2',
			emoji: 'ハ',
			objective_es: 'Completa ハ行 a ワ行 y domina el katakana completo.',
			objective_en: 'Complete ハ row to ワ row and master full katakana.',
			decks: [{ id: 'n5-katakana', title_es: 'Katakana 2', title_en: 'Katakana 2' }]
		}),
		build({
			id: 'n5-s2-u3',
			section_es: 'Escritura: Katakana',
			section_en: 'Writing: Katakana',
			title_es: 'Palabras del Exterior',
			title_en: 'Loanwords',
			emoji: '🌐',
			objective_es: 'Lee y reconoce préstamos del inglés y otros idiomas.',
			objective_en: 'Read and recognize loanwords from English and other languages.',
			decks: [{ id: 'n5-katakana', title_es: 'Préstamos', title_en: 'Loanwords' }]
		}),

		// ── KANJI BÁSICO ─────────────────────────────────────────────────────
		build({
			id: 'n5-s3-u1',
			section_es: 'Kanji N5: Básico',
			section_en: 'Kanji N5: Basic',
			title_es: 'Números y Días',
			title_en: 'Numbers & Days',
			emoji: '一',
			objective_es: 'Kanji del 1 al 10, días de la semana y meses.',
			objective_en: 'Kanji 1-10, days of the week and months.',
			decks: [{ id: 'n5-kanji-numbers', title_es: 'Kanji Números', title_en: 'Kanji Numbers' }]
		}),
		build({
			id: 'n5-s3-u2',
			section_es: 'Kanji N5: Básico',
			section_en: 'Kanji N5: Basic',
			title_es: 'Naturaleza y Personas',
			title_en: 'Nature & People',
			emoji: '山',
			objective_es: 'Kanji de 山, 川, 木, 人, 女, 男, 子, 口…',
			objective_en: 'Kanji for 山, 川, 木, 人, 女, 男, 子, 口…',
			decks: [{ id: 'n5-kanji-nature', title_es: 'Kanji Naturaleza', title_en: 'Kanji Nature' }]
		}),
		build({
			id: 'n5-s3-u3',
			section_es: 'Kanji N5: Básico',
			section_en: 'Kanji N5: Basic',
			title_es: 'Verbos Básicos en Kanji',
			title_en: 'Basic Kanji Verbs',
			emoji: '見',
			objective_es: 'Kanji de 見る, 聞く, 食べる, 飲む, 行く, 来る, する.',
			objective_en: 'Kanji for 見る, 聞く, 食べる, 飲む, 行く, 来る, する.',
			decks: [{ id: 'n5-kanji-verbs', title_es: 'Kanji Verbos', title_en: 'Kanji Verbs' }]
		}),

		// ── GRAMÁTICA: PARTÍCULAS ────────────────────────────────────────────
		build({
			id: 'n5-s4-u1',
			section_es: 'Gramática: Partículas',
			section_en: 'Grammar: Particles',
			title_es: 'Ser y Estar (Desu)',
			title_en: 'To Be (Desu)',
			emoji: '📑',
			objective_es: 'Estructura A は B です. Afirmación y negación.',
			objective_en: 'Structure A は B です. Affirmation and negation.',
			decks: [{ id: 'n5-grammar-intro', title_es: 'Desu / Ja nai', title_en: 'Desu / Ja nai' }]
		}),
		build({
			id: 'n5-s4-u2',
			section_es: 'Gramática: Partículas',
			section_en: 'Grammar: Particles',
			title_es: 'Partículas は, が, を',
			title_en: 'Particles は, が, を',
			emoji: '🔤',
			objective_es: 'Topic marker は, subject が, object を.',
			objective_en: 'Topic marker は, subject が, object を.',
			decks: [{ id: 'n5-particles', title_es: 'Partículas Core', title_en: 'Core Particles' }]
		}),
		build({
			id: 'n5-s4-u3',
			section_es: 'Gramática: Partículas',
			section_en: 'Grammar: Particles',
			title_es: 'Partículas に, で, へ, と',
			title_en: 'Particles に, で, へ, と',
			emoji: '🗺️',
			objective_es: 'Destino に, lugar/medio で, dirección へ, compañía と.',
			objective_en: 'Destination に, location/means で, direction へ, company と.',
			decks: [{ id: 'n5-particles', title_es: 'Partículas Lugar', title_en: 'Location Particles' }]
		}),
		build({
			id: 'n5-s4-u4',
			section_es: 'Gramática: Partículas',
			section_en: 'Grammar: Particles',
			title_es: 'Posesión (の) y Preguntas (か)',
			title_en: 'Possession (の) & Questions (か)',
			emoji: '❓',
			objective_es: 'A の B = B de A. Convertir frases en preguntas.',
			objective_en: 'A の B = B of A. Turn sentences into questions.',
			decks: [{ id: 'n5-questions', title_es: 'の y か', title_en: 'の and か' }]
		}),

		// ── VERBOS N5 ────────────────────────────────────────────────────────
		build({
			id: 'n5-s5-u1',
			section_es: 'Verbos N5',
			section_en: 'N5 Verbs',
			title_es: 'Verbos Grupo 1 (U-verbs)',
			title_en: 'Group 1 Verbs (U-verbs)',
			emoji: '🏃',
			objective_es: 'Verbos que terminan en -u: 書く, 読む, 話す, 飲む...',
			objective_en: 'Verbs ending in -u: 書く, 読む, 話す, 飲む...',
			decks: [{ id: 'n5-verbs', title_es: 'Verbos Grupo 1', title_en: 'Group 1 Verbs' }]
		}),
		build({
			id: 'n5-s5-u2',
			section_es: 'Verbos N5',
			section_en: 'N5 Verbs',
			title_es: 'Verbos Grupo 2 (RU-verbs)',
			title_en: 'Group 2 Verbs (RU-verbs)',
			emoji: '🍽️',
			objective_es: 'Verbos que terminan en -eru/-iru: 食べる, 見る, 起きる...',
			objective_en: 'Verbs ending in -eru/-iru: 食べる, 見る, 起きる...',
			decks: [{ id: 'n5-verbs', title_es: 'Verbos Grupo 2', title_en: 'Group 2 Verbs' }]
		}),
		build({
			id: 'n5-s5-u3',
			section_es: 'Verbos N5',
			section_en: 'N5 Verbs',
			title_es: 'Forma Presente y Pasada',
			title_en: 'Present & Past Forms',
			emoji: '⏳',
			objective_es: 'Forma -masu (presente) y -mashita (pasado). Positivo y negativo.',
			objective_en: '-masu (present) and -mashita (past). Positive and negative.',
			decks: [{ id: 'n5-verb-forms', title_es: 'Formas Verbales', title_en: 'Verb Forms' }]
		}),

		// ── ADJETIVOS N5 ─────────────────────────────────────────────────────
		build({
			id: 'n5-s6-u1',
			section_es: 'Adjetivos N5',
			section_en: 'N5 Adjectives',
			title_es: 'Adjetivos -i',
			title_en: 'I-Adjectives',
			emoji: '🌈',
			objective_es: 'Grandes, pequeños, calientes, fríos... Adjetivos en -i y su conjugación.',
			objective_en: 'Big, small, hot, cold... -i adjectives and their conjugation.',
			decks: [{ id: 'n5-adjectives', title_es: 'Adjetivos -i', title_en: 'I-Adjectives' }]
		}),
		build({
			id: 'n5-s6-u2',
			section_es: 'Adjetivos N5',
			section_en: 'N5 Adjectives',
			title_es: 'Adjetivos -na',
			title_en: 'NA-Adjectives',
			emoji: '✨',
			objective_es: 'Bonito, silencioso, famoso... Adjetivos en -na y diferencias con -i.',
			objective_en: 'Pretty, quiet, famous... -na adjectives and differences from -i.',
			decks: [{ id: 'n5-adjectives', title_es: 'Adjetivos -na', title_en: 'NA-Adjectives' }]
		}),

		// ── VOCABULARIO TEMÁTICO N5 ──────────────────────────────────────────
		build({
			id: 'n5-s7-u1',
			section_es: 'Vocabulario: Familia',
			section_en: 'Vocabulary: Family',
			title_es: 'Familia y Personas',
			title_en: 'Family & People',
			emoji: '👨‍👩‍👧',
			objective_es: 'Padre, madre, hermano, hermana y cómo hablar de tu familia.',
			objective_en: 'Father, mother, brother, sister and how to talk about your family.',
			decks: [{ id: 'n5-family', title_es: 'Familia', title_en: 'Family' }]
		}),
		build({
			id: 'n5-s7-u2',
			section_es: 'Vocabulario: Tiempo',
			section_en: 'Vocabulary: Time',
			title_es: 'Horas y Fechas',
			title_en: 'Hours & Dates',
			emoji: '🕐',
			objective_es: 'Decir la hora, días de la semana y meses del año.',
			objective_en: 'Tell the time, days of the week and months of the year.',
			decks: [{ id: 'n5-time', title_es: 'Tiempo', title_en: 'Time' }]
		}),
		build({
			id: 'n5-s7-u3',
			section_es: 'Vocabulario: Cuerpo',
			section_en: 'Vocabulary: Body',
			title_es: 'El Cuerpo Humano',
			title_en: 'The Human Body',
			emoji: '🧍',
			objective_es: 'Partes del cuerpo y expresiones de salud básicas.',
			objective_en: 'Body parts and basic health expressions.',
			decks: [{ id: 'n5-body', title_es: 'Cuerpo', title_en: 'Body' }]
		}),
		build({
			id: 'n5-s7-u4',
			section_es: 'Vocabulario: Casa',
			section_en: 'Vocabulary: Home',
			title_es: 'Casa y Habitaciones',
			title_en: 'Home & Rooms',
			emoji: '🏠',
			objective_es: 'Habitaciones, muebles y expresiones cotidianas en casa.',
			objective_en: 'Rooms, furniture and everyday home expressions.',
			decks: [{ id: 'n5-house', title_es: 'Casa', title_en: 'Home' }]
		}),
		build({
			id: 'n5-s7-u5',
			section_es: 'Vocabulario: Colores y Formas',
			section_en: 'Vocabulary: Colors & Shapes',
			title_es: 'Colores y Descripción',
			title_en: 'Colors & Description',
			emoji: '🎨',
			objective_es: 'Describe objetos con colores, formas y tamaño.',
			objective_en: 'Describe objects with colors, shapes and size.',
			decks: [{ id: 'n5-colors', title_es: 'Colores', title_en: 'Colors' }]
		}),

		// ── PALABRAS INTERROGATIVAS ──────────────────────────────────────────
		build({
			id: 'n5-s8-u1',
			section_es: 'Palabras Interrogativas',
			section_en: 'Question Words',
			title_es: '¿Qué, Quién, Dónde?',
			title_en: 'What, Who, Where?',
			emoji: '🔍',
			objective_es: 'なに (qué), だれ (quién), どこ (dónde), いつ (cuándo).',
			objective_en: 'なに (what), だれ (who), どこ (where), いつ (when).',
			decks: [{ id: 'n5-questions', title_es: 'Interrogativas 1', title_en: 'Question Words 1' }]
		}),
		build({
			id: 'n5-s8-u2',
			section_es: 'Palabras Interrogativas',
			section_en: 'Question Words',
			title_es: '¿Cuánto, Cuál, Cómo?',
			title_en: 'How Much, Which, How?',
			emoji: '💬',
			objective_es: 'いくら (cuánto cuesta), どれ (cuál), どう (cómo).',
			objective_en: 'いくら (how much), どれ (which), どう (how).',
			decks: [{ id: 'n5-questions', title_es: 'Interrogativas 2', title_en: 'Question Words 2' }]
		}),
		build({
			id: 'n5-s9-u1',
			section_es: 'Gramática N5: Estructuras',
			section_en: 'Grammar N5: Structures',
			title_es: 'Permiso y Prohibición',
			title_en: 'Permission & Prohibition',
			emoji: '🚫',
			objective_es: 'Usa -te mo ii (permiso) y -te wa ikenai (prohibición).',
			objective_en: 'Use -te mo ii (permission) and -te wa ikenai (prohibition).',
			decks: [{ id: 'n5-grammar', title_es: 'Permiso/No', title_en: 'Permission/Prohibition' }]
		}),
		build({
			id: 'n5-s9-u2',
			section_es: 'Gramática N5: Estructuras',
			section_en: 'Grammar N5: Structures',
			title_es: 'Deseos y Necesidades',
			title_en: 'Wants & Needs',
			emoji: '🎁',
			objective_es: 'Expresa deseos con -tai y hoshii.',
			objective_en: 'Express desires with -tai and hoshii.',
			decks: [{ id: 'n5-grammar', title_es: 'Deseos', title_en: 'Desires' }]
		})
	],

	N4: [
		// ── FORMAS VERBALES ──────────────────────────────────────────────────
		build({
			id: 'n4-s1-u1',
			section_es: 'Formas Verbales',
			section_en: 'Verb Forms',
			title_es: 'Forma -te',
			title_en: 'Te-Form',
			emoji: '🔗',
			objective_es: 'Construye la forma -te de verbos Grupo 1 y 2. Base de muchas estructuras.',
			objective_en: 'Build the -te form for Group 1 and 2 verbs. Foundation of many structures.',
			decks: [{ id: 'n4-verb-forms', title_es: 'Forma Te', title_en: 'Te Form' }]
		}),
		build({
			id: 'n4-s1-u2',
			section_es: 'Formas Verbales',
			section_en: 'Verb Forms',
			title_es: 'Forma Potencial',
			title_en: 'Potential Form',
			emoji: '💪',
			objective_es: 'Expresa capacidad: 食べられる (puedo comer), 話せる (puedo hablar).',
			objective_en: 'Express ability: 食べられる (can eat), 話せる (can speak).',
			decks: [{ id: 'n4-verb-forms', title_es: 'Forma Potencial', title_en: 'Potential Form' }]
		}),
		build({
			id: 'n4-s1-u3',
			section_es: 'Formas Verbales',
			section_en: 'Verb Forms',
			title_es: 'Forma Volitiva',
			title_en: 'Volitional Form',
			emoji: '🙌',
			objective_es: 'Propón ideas: 行こう (¡vamos!), 食べよう (¡comamos!). Forma -ou/-you.',
			objective_en: 'Propose ideas: 行こう (let\'s go!), 食べよう (let\'s eat!). -ou/-you form.',
			decks: [{ id: 'n4-verb-forms', title_es: 'Forma Volitiva', title_en: 'Volitional Form' }]
		}),
		build({
			id: 'n4-s1-u4',
			section_es: 'Formas Verbales',
			section_en: 'Verb Forms',
			title_es: 'Forma Condicional -ba',
			title_en: 'Conditional -ba Form',
			emoji: '🔀',
			objective_es: 'Si haces X, entonces Y. Forma -eba/-reba/-kereba.',
			objective_en: 'If you do X, then Y. -eba/-reba/-kereba form.',
			decks: [{ id: 'n4-verb-forms', title_es: 'Condicional -ba', title_en: 'Conditional -ba' }]
		}),

		// ── GRAMÁTICA N4: CORE ───────────────────────────────────────────────
		build({
			id: 'n4-s2-u1',
			section_es: 'Gramática N4: Deseo y Permiso',
			section_en: 'Grammar N4: Desire & Permission',
			title_es: 'Querer Hacer (~たい)',
			title_en: 'Want to Do (~たい)',
			emoji: '💭',
			objective_es: '食べたい (quiero comer), 行きたい (quiero ir). Cómo expresar deseos.',
			objective_en: '食べたい (want to eat), 行きたい (want to go). How to express desires.',
			decks: [{ id: 'n4-grammar', title_es: 'Querer: ~たい', title_en: 'Want: ~たい' }]
		}),
		build({
			id: 'n4-s2-u2',
			section_es: 'Gramática N4: Deseo y Permiso',
			section_en: 'Grammar N4: Desire & Permission',
			title_es: 'Permiso y Prohibición (~てもいい / ~てはいけない)',
			title_en: 'Permission & Prohibition',
			emoji: '🚦',
			objective_es: '~てもいいですか (¿puedo?) y ~てはいけない (no debes).',
			objective_en: '~てもいいですか (may I?) and ~てはいけない (must not).',
			decks: [{ id: 'n4-grammar', title_es: 'Permiso y Prohibición', title_en: 'Permission & Prohibition' }]
		}),
		build({
			id: 'n4-s2-u3',
			section_es: 'Gramática N4: Progreso y Estado',
			section_en: 'Grammar N4: Progress & State',
			title_es: 'Acción en Curso (~ている)',
			title_en: 'Ongoing Action (~ている)',
			emoji: '🔄',
			objective_es: '食べています (estoy comiendo). Progresivo y estados permanentes.',
			objective_en: '食べています (I am eating). Progressive and permanent states.',
			decks: [{ id: 'n4-grammar', title_es: 'Progresivo ~ている', title_en: 'Progressive ~ている' }]
		}),
		build({
			id: 'n4-s2-u4',
			section_es: 'Gramática N4: Progreso y Estado',
			section_en: 'Grammar N4: Progress & State',
			title_es: 'Experiencia Pasada (~たことがある)',
			title_en: 'Past Experience (~たことがある)',
			emoji: '📖',
			objective_es: '日本に行ったことがある (he estado en Japón). Hablar de experiencias.',
			objective_en: '日本に行ったことがある (I have been to Japan). Talking about experiences.',
			decks: [{ id: 'n4-grammar', title_es: 'Experiencia ~たことがある', title_en: 'Experience ~たことがある' }]
		}),
		build({
			id: 'n4-s2-u5',
			section_es: 'Gramática N4: Causa y Razón',
			section_en: 'Grammar N4: Cause & Reason',
			title_es: 'Porque y Por eso (から / ので)',
			title_en: 'Because & Therefore (から / ので)',
			emoji: '💡',
			objective_es: 'から (informal causal) vs ので (formal causal). Dar razones.',
			objective_en: 'から (informal causal) vs ので (formal causal). Giving reasons.',
			decks: [{ id: 'n4-grammar', title_es: 'Causal: から/ので', title_en: 'Causal: から/ので' }]
		}),
		build({
			id: 'n4-s2-u6',
			section_es: 'Gramática N4: Consejo y Obligación',
			section_en: 'Grammar N4: Advice & Obligation',
			title_es: 'Consejo (~たほうがいい) y Deber (~なければならない)',
			title_en: 'Advice (~たほうがいい) & Must (~なければならない)',
			emoji: '⚠️',
			objective_es: 'Dar consejos y expresar obligaciones. Estructuras esenciales N4.',
			objective_en: 'Give advice and express obligations. Essential N4 structures.',
			decks: [{ id: 'n4-grammar', title_es: 'Consejo y Obligación', title_en: 'Advice & Obligation' }]
		}),

		// ── KANJI N4 ─────────────────────────────────────────────────────────
		build({
			id: 'n4-s3-u1',
			section_es: 'Kanji N4: Grupo 1',
			section_en: 'Kanji N4: Group 1',
			title_es: 'Kanji de Acción y Movimiento',
			title_en: 'Action & Movement Kanji',
			emoji: '走',
			objective_es: '走, 働, 使, 始, 終, 会, 帰, 起, 休, 持...',
			objective_en: '走, 働, 使, 始, 終, 会, 帰, 起, 休, 持...',
			decks: [{ id: 'n4-kanji', title_es: 'Kanji Acción', title_en: 'Action Kanji' }]
		}),
		build({
			id: 'n4-s3-u2',
			section_es: 'Kanji N4: Grupo 2',
			section_en: 'Kanji N4: Group 2',
			title_es: 'Kanji de Lugar y Sociedad',
			title_en: 'Place & Society Kanji',
			emoji: '町',
			objective_es: '町, 村, 区, 店, 社, 校, 院, 市, 国, 駅...',
			objective_en: '町, 村, 区, 店, 社, 校, 院, 市, 国, 駅...',
			decks: [{ id: 'n4-kanji', title_es: 'Kanji Lugar', title_en: 'Place Kanji' }]
		}),

		// ── VOCABULARIO N4 ───────────────────────────────────────────────────
		build({
			id: 'n4-s4-u1',
			section_es: 'Vocabulario: Trabajo',
			section_en: 'Vocabulary: Work',
			title_es: 'Trabajo y Oficina',
			title_en: 'Work & Office',
			emoji: '💼',
			objective_es: 'Vocabulario laboral esencial: 会議, 仕事, 部長, 残業...',
			objective_en: 'Essential work vocabulary: 会議, 仕事, 部長, 残業...',
			decks: [{ id: 'n4-work', title_es: 'Trabajo', title_en: 'Work' }]
		}),
		build({
			id: 'n4-s4-u2',
			section_es: 'Vocabulario: Salud',
			section_en: 'Vocabulary: Health',
			title_es: 'Salud y Hospital',
			title_en: 'Health & Hospital',
			emoji: '🏥',
			objective_es: 'Síntomas, partes del cuerpo avanzadas y vocabulario médico.',
			objective_en: 'Symptoms, advanced body parts and medical vocabulary.',
			decks: [{ id: 'n4-health', title_es: 'Salud', title_en: 'Health' }]
		}),
		build({
			id: 'n4-s4-u3',
			section_es: 'Vocabulario: Naturaleza',
			section_en: 'Vocabulary: Nature',
			title_es: 'Clima y Naturaleza',
			title_en: 'Weather & Nature',
			emoji: '🌤️',
			objective_es: 'Estaciones, clima, geografía básica y expresiones del tiempo.',
			objective_en: 'Seasons, weather, basic geography and time expressions.',
			decks: [{ id: 'n4-nature', title_es: 'Naturaleza', title_en: 'Nature' }]
		}),
		build({
			id: 'n4-s4-u4',
			section_es: 'Vocabulario: Contadores',
			section_en: 'Vocabulary: Counters',
			title_es: 'Contadores Japoneses',
			title_en: 'Japanese Counters',
			emoji: '🔢',
			objective_es: '本 (objetos largos), 枚 (papeles), 匹 (animales), 台 (máquinas), 冊 (libros)...',
			objective_en: '本 (long objects), 枚 (papers), 匹 (animals), 台 (machines), 冊 (books)...',
			decks: [{ id: 'n4-counters', title_es: 'Contadores', title_en: 'Counters' }]
		}),
		build({
			id: 'n4-s4-u5',
			section_es: 'Vocabulario: Verbos Compuestos',
			section_en: 'Vocabulary: Compound Verbs',
			title_es: 'Verbos Compuestos',
			title_en: 'Compound Verbs',
			emoji: '⚙️',
			objective_es: '持ち込む, 思い出す, 引き受ける... Cómo se forman y usan.',
			objective_en: '持ち込む, 思い出す, 引き受ける... How they are formed and used.',
			decks: [{ id: 'n4-compound-verbs', title_es: 'Verbos Compuestos', title_en: 'Compound Verbs' }]
		}),
		build({
			id: 'n4-s5-u1',
			section_es: 'Gramática N4: Relaciones',
			section_en: 'Grammar N4: Relations',
			title_es: 'Donación de Acciones',
			title_en: 'Donation of Actions',
			emoji: '🤝',
			objective_es: 'Domina ~te ageru, ~te kureru y ~te morau para favores.',
			objective_en: 'Master ~te ageru, ~te kureru and ~te morau for favors.',
			decks: [{ id: 'n4-grammar', title_es: 'Dar y Recibir', title_en: 'Give and Receive' }]
		}),
		build({
			id: 'n4-s5-u2',
			section_es: 'Gramática N4: Cortesía',
			section_en: 'Grammar N4: Politeness',
			title_es: 'Introducción al Keigo',
			title_en: 'Intro to Keigo',
			emoji: '🙇',
			objective_es: 'Lenguaje honorífico (Sonkeigo) y humilde (Kenjougo) básico.',
			objective_en: 'Basic honorific (Sonkeigo) and humble (Kenjougo) language.',
			decks: [{ id: 'n4-keigo', title_es: 'Keigo Básico', title_en: 'Basic Keigo' }]
		}),
		build({
			id: 'n4-s6-u1',
			section_es: 'Expresiones de Probabilidad',
			section_en: 'Probability Expressions',
			title_es: 'Probabilidad (~deshou)',
			title_en: 'Probability (~deshou)',
			emoji: '🔮',
			objective_es: 'Usa ~deshou y ~kamo shirenai para conjeturas.',
			objective_en: 'Use ~deshou and ~kamo shirenai for conjectures.',
			decks: [{ id: 'n4-grammar', title_es: 'Probabilidad', title_en: 'Probability' }]
		}),
		build({
			id: 'n4-s7-u1',
			section_es: 'Verbos N4: Matices',
			section_en: 'N4 Verbs: Nuance',
			title_es: 'Transitividad',
			title_en: 'Transitivity',
			emoji: '↔️',
			objective_es: 'Diferencia entre verbos transitivos e intransitivos (p.ej. あける vs あく).',
			objective_en: 'Difference between transitive and intransitive verbs (e.g., あける vs あく).',
			decks: [{ id: 'n4-verbs-transitivity', title_es: 'Transitividad', title_en: 'Transitivity' }]
		})
	],

	N3: [
		// ── GRAMÁTICA N3: VOZ ────────────────────────────────────────────────
		build({
			id: 'n3-s1-u1',
			section_es: 'Gramática N3: Voz',
			section_en: 'Grammar N3: Voice',
			title_es: 'Voz Pasiva',
			title_en: 'Passive Voice',
			emoji: '🔄',
			objective_es: 'Forma pasiva: 食べられる, 書かれる. Usar la pasiva en contexto.',
			objective_en: 'Passive form: 食べられる, 書かれる. Using passive in context.',
			decks: [{ id: 'n3-grammar-voice', title_es: 'Voz Pasiva', title_en: 'Passive Voice' }]
		}),
		build({
			id: 'n3-s1-u2',
			section_es: 'Gramática N3: Voz',
			section_en: 'Grammar N3: Voice',
			title_es: 'Voz Causativa',
			title_en: 'Causative Voice',
			emoji: '👆',
			objective_es: 'Hacer que alguien haga algo: 食べさせる, 行かせる.',
			objective_en: 'Make/let someone do something: 食べさせる, 行かせる.',
			decks: [{ id: 'n3-grammar-voice', title_es: 'Voz Causativa', title_en: 'Causative Voice' }]
		}),
		build({
			id: 'n3-s1-u3',
			section_es: 'Gramática N3: Voz',
			section_en: 'Grammar N3: Voice',
			title_es: 'Causativa-Pasiva',
			title_en: 'Causative-Passive',
			emoji: '🌀',
			objective_es: 'Ser obligado a hacer algo: 食べさせられる. Registro formal/denuncia.',
			objective_en: 'Being made to do something: 食べさせられる. Formal/complaint register.',
			decks: [{ id: 'n3-grammar-voice', title_es: 'Causativa-Pasiva', title_en: 'Causative-Passive' }]
		}),

		// ── GRAMÁTICA N3: CONDICIONALES ──────────────────────────────────────
		build({
			id: 'n3-s2-u1',
			section_es: 'Gramática N3: Condicionales',
			section_en: 'Grammar N3: Conditionals',
			title_es: 'Condición con ~たら',
			title_en: 'Conditional ~たら',
			emoji: '❓',
			objective_es: '~たら expresa condición con resultado en el pasado o futuro.',
			objective_en: '~たら expresses condition with past or future result.',
			decks: [{ id: 'n3-grammar-cond', title_es: 'Condicional ~たら', title_en: 'Conditional ~たら' }]
		}),
		build({
			id: 'n3-s2-u2',
			section_es: 'Gramática N3: Condicionales',
			section_en: 'Grammar N3: Conditionals',
			title_es: 'Condición con ~なら y ~と',
			title_en: 'Conditional ~なら & ~と',
			emoji: '🔀',
			objective_es: 'なら (dado que / si eso es así) y と (resultado natural/invariable).',
			objective_en: 'なら (given that / if so) and と (natural/inevitable result).',
			decks: [{ id: 'n3-grammar-cond', title_es: 'Condicional なら と', title_en: 'Conditional なら と' }]
		}),

		// ── GRAMÁTICA N3: PROPÓSITO Y APARIENCIA ────────────────────────────
		build({
			id: 'n3-s3-u1',
			section_es: 'Gramática N3: Propósito',
			section_en: 'Grammar N3: Purpose',
			title_es: 'Para + Verbo (~ために / ~ように)',
			title_en: 'In Order to (~ために / ~ように)',
			emoji: '🎯',
			objective_es: 'ために (propósito intencional) vs ように (propósito sin control directo).',
			objective_en: 'ために (intentional purpose) vs ように (purpose without direct control).',
			decks: [{ id: 'n3-grammar-purpose', title_es: 'Propósito ために ように', title_en: 'Purpose ために ように' }]
		}),
		build({
			id: 'n3-s3-u2',
			section_es: 'Gramática N3: Apariencia',
			section_en: 'Grammar N3: Appearance',
			title_es: 'Parece que... (~ようだ / ~そうだ / ~らしい)',
			title_en: 'It Seems (~ようだ / ~そうだ / ~らしい)',
			emoji: '🔎',
			objective_es: 'Tres formas de expresar apariencia o suposición con distintos matices.',
			objective_en: 'Three ways to express appearance or supposition with different nuances.',
			decks: [{ id: 'n3-grammar-appear', title_es: 'Apariencia ようだ そうだ らしい', title_en: 'Seem ようだ そうだ らしい' }]
		}),
		build({
			id: 'n3-s3-u3',
			section_es: 'Gramática N3: Suposición',
			section_en: 'Grammar N3: Supposition',
			title_es: 'Quizás y Probablemente (~かもしれない / ~はずだ / ~だろう)',
			title_en: 'Maybe & Probably (~かもしれない / ~はずだ / ~だろう)',
			emoji: '🤔',
			objective_es: 'Grados de certeza: かもしれない (tal vez) < でしょう < はずだ (debe ser).',
			objective_en: 'Degrees of certainty: かもしれない (maybe) < でしょう < はずだ (should be).',
			decks: [{ id: 'n3-grammar-suppos', title_es: 'Suposición', title_en: 'Supposition' }]
		}),

		// ── GRAMÁTICA N3: CONECTORES ─────────────────────────────────────────
		build({
			id: 'n3-s4-u1',
			section_es: 'Gramática N3: Conectores',
			section_en: 'Grammar N3: Connectors',
			title_es: 'Aunque, A pesar de (~のに / ~ても)',
			title_en: 'Even Though (~のに / ~ても)',
			emoji: '🌊',
			objective_es: 'Contraste inesperado: のに (sorpresa/decepción) vs ても (concesión).',
			objective_en: 'Unexpected contrast: のに (surprise/disappointment) vs ても (concession).',
			decks: [{ id: 'n3-grammar-connect', title_es: 'Aunque のに ても', title_en: 'Even Though のに ても' }]
		}),
		build({
			id: 'n3-s4-u2',
			section_es: 'Gramática N3: Conectores',
			section_en: 'Grammar N3: Connectors',
			title_es: 'Dar y Recibir (あげる / もらう / くれる)',
			title_en: 'Giving & Receiving (あげる / もらう / くれる)',
			emoji: '🎁',
			objective_es: 'El sistema de dar y recibir acciones, no solo objetos.',
			objective_en: 'The system of giving and receiving actions, not just objects.',
			decks: [{ id: 'n3-give-receive', title_es: 'Dar y Recibir', title_en: 'Giving & Receiving' }]
		}),
		build({
			id: 'n3-s4-u3',
			section_es: 'Gramática N3: Conectores',
			section_en: 'Grammar N3: Connectors',
			title_es: 'Sin querer / Terminar haciendo (~てしまう)',
			title_en: 'End Up Doing (~てしまう)',
			emoji: '😬',
			objective_es: '~てしまう: hacer algo indeseado o completar algo definitivamente.',
			objective_en: '~てしまう: doing something unintended or completing something definitively.',
			decks: [{ id: 'n3-grammar-connect', title_es: 'Lamentar ~てしまう', title_en: 'End Up ~てしまう' }]
		}),

		// ── KANJI N3 ─────────────────────────────────────────────────────────
		build({
			id: 'n3-s5-u1',
			section_es: 'Kanji N3: Grupo 1',
			section_en: 'Kanji N3: Group 1',
			title_es: 'Kanji de Sentimientos y Mente',
			title_en: 'Feeling & Mind Kanji',
			emoji: '心',
			objective_es: '感, 思, 愛, 悲, 苦, 幸, 望, 夢, 意, 情...',
			objective_en: '感, 思, 愛, 悲, 苦, 幸, 望, 夢, 意, 情...',
			decks: [{ id: 'n3-kanji', title_es: 'Kanji Sentimientos', title_en: 'Feeling Kanji' }]
		}),
		build({
			id: 'n3-s5-u2',
			section_es: 'Kanji N3: Grupo 2',
			section_en: 'Kanji N3: Group 2',
			title_es: 'Kanji de Sociedad y Trabajo',
			title_en: 'Society & Work Kanji',
			emoji: '社',
			objective_es: '働, 給, 税, 経, 営, 産, 業, 法, 政, 府...',
			objective_en: '働, 給, 税, 経, 営, 産, 業, 法, 政, 府...',
			decks: [{ id: 'n3-kanji', title_es: 'Kanji Sociedad', title_en: 'Society Kanji' }]
		}),

		// ── VOCABULARIO N3 ───────────────────────────────────────────────────
		build({
			id: 'n3-s6-u1',
			section_es: 'Vocabulario: Vida Diaria',
			section_en: 'Vocabulary: Daily Life',
			title_es: 'Rutinas y Hábitos',
			title_en: 'Routines & Habits',
			emoji: '📅',
			objective_es: 'Describe tu rutina diaria con vocabulario fluido y natural.',
			objective_en: 'Describe your daily routine with fluent and natural vocabulary.',
			decks: [{ id: 'n3-daily', title_es: 'Rutinas', title_en: 'Routines' }]
		}),
		build({
			id: 'n3-s6-u2',
			section_es: 'Vocabulario: Emociones',
			section_en: 'Vocabulary: Emotions',
			title_es: 'Emociones y Sentimientos',
			title_en: 'Emotions & Feelings',
			emoji: '💛',
			objective_es: 'Expresa emociones complejas: 悔しい, 羨ましい, 寂しい, 恥ずかしい...',
			objective_en: 'Express complex emotions: 悔しい, 羨ましい, 寂しい, 恥ずかしい...',
			decks: [{ id: 'n3-emotions', title_es: 'Emociones', title_en: 'Emotions' }]
		}),
		build({
			id: 'n3-s6-u3',
			section_es: 'Vocabulario: Medios y Cultura',
			section_en: 'Vocabulary: Media & Culture',
			title_es: 'Medios y Entretenimiento',
			title_en: 'Media & Entertainment',
			emoji: '🎌',
			objective_es: 'Vocabulario para hablar de películas, manga, música y cultura pop.',
			objective_en: 'Vocabulary to talk about movies, manga, music and pop culture.',
			decks: [{ id: 'n3-media', title_es: 'Medios', title_en: 'Media' }]
		}),
		build({
			id: 'n3-s7-u1',
			section_es: 'Gramática N3: Rumores',
			section_en: 'Grammar N3: Rumors',
			title_es: 'Dicen que (~rashii)',
			title_en: 'They say that (~rashii)',
			emoji: '🗣️',
			objective_es: 'Usa ~rashii para transmitir información de terceros o apariencias.',
			objective_en: 'Use ~rashii to convey third-party information or appearances.',
			decks: [{ id: 'n3-grammar', title_es: 'Rashii', title_en: 'Rashii' }]
		}),
		build({
			id: 'n3-s7-u2',
			section_es: 'Gramática N3: Comparación',
			section_en: 'Grammar N3: Comparison',
			title_es: 'Como si (mitai na / youni)',
			title_en: 'As if (mitai na / youni)',
			emoji: '🎭',
			objective_es: 'Diferencias entre mitai (informal) y youni (formal).',
			objective_en: 'Differences between mitai (informal) and youni (formal).',
			decks: [{ id: 'n3-grammar', title_es: 'Comparación', title_en: 'Comparison' }]
		}),
		build({
			id: 'n3-s8-u1',
			section_es: 'Gramática N3: Relaciones',
			section_en: 'Grammar N3: Relations',
			title_es: 'A pesar de (noni / keredomo)',
			title_en: 'Despite (noni / keredomo)',
			emoji: '🌧️',
			objective_es: 'Expresa contraste y sorpresa con noni y keredomo.',
			objective_en: 'Express contrast and surprise with noni and keredomo.',
			decks: [{ id: 'n3-grammar', title_es: 'Contraste', title_en: 'Contrast' }]
		})
	],

	N2: [
		// ── GRAMÁTICA N2: PATRONES COMPLEJOS ────────────────────────────────
		build({
			id: 'n2-s1-u1',
			section_es: 'Gramática N2: Explicación y Deducción',
			section_en: 'Grammar N2: Explanation & Deduction',
			title_es: 'Es por eso que... (~わけだ / ~わけではない)',
			title_en: 'That\'s Why (~わけだ / ~わけではない)',
			emoji: '🧩',
			objective_es: 'わけだ (conclusión lógica) y わけではない (negación de generalización).',
			objective_en: 'わけだ (logical conclusion) and わけではない (negation of generalization).',
			decks: [{ id: 'n2-grammar', title_es: 'わけだ / わけではない', title_en: 'わけだ / わけではない' }]
		}),
		build({
			id: 'n2-s1-u2',
			section_es: 'Gramática N2: Explicación y Deducción',
			section_en: 'Grammar N2: Explanation & Deduction',
			title_es: 'Sin duda (~に違いない / ~に決まっている)',
			title_en: 'No Doubt (~に違いない / ~に決まっている)',
			emoji: '💯',
			objective_es: 'Expresar certeza absoluta sobre algo. Diferencias de matiz y registro.',
			objective_en: 'Expressing absolute certainty about something. Nuance and register differences.',
			decks: [{ id: 'n2-grammar', title_es: 'Certeza に違いない', title_en: 'Certainty に違いない' }]
		}),
		build({
			id: 'n2-s1-u3',
			section_es: 'Gramática N2: Causa y Resultado',
			section_en: 'Grammar N2: Cause & Result',
			title_es: 'Culpa y Gratitud (~せいだ / ~おかげだ)',
			title_en: 'Blame & Credit (~せいだ / ~おかげだ)',
			emoji: '⚖️',
			objective_es: 'せいだ (culpar a algo) vs おかげだ (agradecer a algo). Contexto formal.',
			objective_en: 'せいだ (blame something) vs おかげだ (credit something). Formal context.',
			decks: [{ id: 'n2-grammar', title_es: 'Culpa y Gratitud', title_en: 'Blame & Credit' }]
		}),
		build({
			id: 'n2-s1-u4',
			section_es: 'Gramática N2: A pesar de',
			section_en: 'Grammar N2: Despite',
			title_es: 'A pesar de que... (~にもかかわらず / ~ものの)',
			title_en: 'Despite (~にもかかわらず / ~ものの)',
			emoji: '🌧️',
			objective_es: 'Contrastar expectativa con realidad en registro formal y escrito.',
			objective_en: 'Contrasting expectation with reality in formal and written register.',
			decks: [{ id: 'n2-grammar', title_es: 'A pesar de にもかかわらず', title_en: 'Despite にもかかわらず' }]
		}),

		// ── GRAMÁTICA N2: PARTÍCULAS Y CONECTORES FORMALES ──────────────────
		build({
			id: 'n2-s2-u1',
			section_es: 'Gramática N2: Partículas Formales',
			section_en: 'Grammar N2: Formal Particles',
			title_es: 'En cuanto a / Respecto a (~において / ~に関して)',
			title_en: 'Regarding (~において / ~に関して)',
			emoji: '📋',
			objective_es: 'Partículas formales usadas en escritura académica y profesional.',
			objective_en: 'Formal particles used in academic and professional writing.',
			decks: [{ id: 'n2-grammar-formal', title_es: 'Partículas Formales', title_en: 'Formal Particles' }]
		}),
		build({
			id: 'n2-s2-u2',
			section_es: 'Gramática N2: Partículas Formales',
			section_en: 'Grammar N2: Formal Particles',
			title_es: 'Como / En calidad de (~として / ~をはじめ)',
			title_en: 'As / Starting with (~として / ~をはじめ)',
			emoji: '🏷️',
			objective_es: 'として (en calidad de) y をはじめ (empezando por / incluyendo).',
			objective_en: 'として (as/in capacity of) and をはじめ (starting with / including).',
			decks: [{ id: 'n2-grammar-formal', title_es: 'として / をはじめ', title_en: 'として / をはじめ' }]
		}),
		build({
			id: 'n2-s2-u3',
			section_es: 'Gramática N2: Matices',
			section_en: 'Grammar N2: Nuance',
			title_es: 'Intentar / No poder (~ようとする / ~かねる)',
			title_en: 'Try to / Cannot Bring Oneself to (~ようとする / ~かねる)',
			emoji: '🤐',
			objective_es: 'ようとする (intentar hacer) y かねる (no poder hacer por razón moral/social).',
			objective_en: 'ようとする (try to do) and かねる (cannot do for moral/social reasons).',
			decks: [{ id: 'n2-grammar', title_es: 'Matices ようとする かねる', title_en: 'Nuance ようとする かねる' }]
		}),

		// ── JAPONÉS DE NEGOCIOS N2 ───────────────────────────────────────────
		build({
			id: 'n2-s3-u1',
			section_es: 'Japonés de Negocios',
			section_en: 'Business Japanese',
			title_es: 'Keigo: Lenguaje Honorífico',
			title_en: 'Keigo: Honorific Language',
			emoji: '🤝',
			objective_es: 'Sonkeigo (respeto) y Kenjōgo (humildad). Reglas y práctica.',
			objective_en: 'Sonkeigo (respect) and Kenjōgo (humility). Rules and practice.',
			decks: [{ id: 'n2-keigo', title_es: 'Keigo', title_en: 'Keigo' }]
		}),
		build({
			id: 'n2-s3-u2',
			section_es: 'Japonés de Negocios',
			section_en: 'Business Japanese',
			title_es: 'Reuniones y Correos',
			title_en: 'Meetings & Emails',
			emoji: '📧',
			objective_es: 'Vocabulario y frases para reuniones, correos y llamadas en japonés.',
			objective_en: 'Vocabulary and phrases for meetings, emails and calls in Japanese.',
			decks: [{ id: 'n2-business', title_es: 'Negocios', title_en: 'Business' }]
		}),

		// ── KANJI N2 ─────────────────────────────────────────────────────────
		build({
			id: 'n2-s4-u1',
			section_es: 'Kanji N2: Grupo 1',
			section_en: 'Kanji N2: Group 1',
			title_es: 'Kanji Abstracto y Conceptual',
			title_en: 'Abstract & Conceptual Kanji',
			emoji: '概',
			objective_es: '概, 象, 証, 際, 般, 連, 断, 採, 批, 析...',
			objective_en: '概, 象, 証, 際, 般, 連, 断, 採, 批, 析...',
			decks: [{ id: 'n2-kanji', title_es: 'Kanji Abstracto', title_en: 'Abstract Kanji' }]
		}),
		build({
			id: 'n2-s4-u2',
			section_es: 'Kanji N2: Grupo 2',
			section_en: 'Kanji N2: Group 2',
			title_es: 'Kanji de Instituciones y Política',
			title_en: 'Institutions & Politics Kanji',
			emoji: '議',
			objective_es: '議, 憲, 裁, 権, 資, 財, 予, 算, 機, 関...',
			objective_en: '議, 憲, 裁, 権, 資, 財, 予, 算, 機, 関...',
			decks: [{ id: 'n2-kanji', title_es: 'Kanji Política', title_en: 'Politics Kanji' }]
		}),

		// ── LECTURA Y ESCRITURA N2 ───────────────────────────────────────────
		build({
			id: 'n2-s5-u1',
			section_es: 'Lectura N2',
			section_en: 'Reading N2',
			title_es: 'Artículos y Noticias',
			title_en: 'Articles & News',
			emoji: '📰',
			objective_es: 'Comprende textos periodísticos y artículos de opinión en japonés.',
			objective_en: 'Understand journalistic texts and opinion articles in Japanese.',
			decks: [{ id: 'n2-reading', title_es: 'Artículos', title_en: 'Articles' }]
		}),
		build({
			id: 'n2-s5-u2',
			section_es: 'Vocabulario N2',
			section_en: 'Vocabulary N2',
			title_es: 'Expresiones Compuestas',
			title_en: 'Compound Expressions',
			emoji: '🔗',
			objective_es: 'Expresiones idiomáticas y compuestos de dos kanji frecuentes en N2.',
			objective_en: 'Idiomatic expressions and frequent two-kanji compounds at N2 level.',
			decks: [{ id: 'n2-vocabulary', title_es: 'Expresiones N2', title_en: 'N2 Expressions' }]
		}),
		build({
			id: 'n2-s6-u1',
			section_es: 'Gramática N2: Tiempo',
			section_en: 'Grammar N2: Time',
			title_es: 'En el momento de (sai ni)',
			title_en: 'At the time of (sai ni)',
			emoji: '⏰',
			objective_es: 'Uso formal de 際に y に際して en contextos oficiales.',
			objective_en: 'Formal use of 際に and に際して in official contexts.',
			decks: [{ id: 'n2-grammar', title_es: 'Tiempo Formal', title_en: 'Formal Time' }]
		}),
		build({
			id: 'n2-s6-u2',
			section_es: 'Gramática N2: Límite',
			section_en: 'Grammar N2: Limit',
			title_es: 'Siempre que (kagiri)',
			title_en: 'As long as (kagiri)',
			emoji: '♾️',
			objective_es: 'Usa かぎり para expresar límites y condiciones.',
			objective_en: 'Use かぎり to express limits and conditions.',
			decks: [{ id: 'n2-grammar', title_es: 'Límites', title_en: 'Limits' }]
		})
	],

	N1: [
		// ── GRAMÁTICA N1: CLÁSICA Y LITERARIA ───────────────────────────────
		build({
			id: 'n1-s1-u1',
			section_es: 'Gramática N1: Obligación y Lógica',
			section_en: 'Grammar N1: Obligation & Logic',
			title_es: 'Deber / Inevitabilidad (~べき / ~ざるをえない)',
			title_en: 'Should / Cannot Help but (~べき / ~ざるをえない)',
			emoji: '⚖️',
			objective_es: 'べき (deber moral) y ざるをえない (no tener más remedio). Registro formal.',
			objective_en: 'べき (moral duty) and ざるをえない (no choice but to). Formal register.',
			decks: [{ id: 'n1-grammar', title_es: 'べき / ざるをえない', title_en: 'べき / ざるをえない' }]
		}),
		build({
			id: 'n1-s1-u2',
			section_es: 'Gramática N1: Literaria',
			section_en: 'Grammar N1: Literary',
			title_es: 'No es otra cosa que (~にほかならない / ~にすぎない)',
			title_en: 'Nothing But (~にほかならない / ~にすぎない)',
			emoji: '📚',
			objective_es: 'Expresiones enfáticas y reductoras de uso literario y periodístico.',
			objective_en: 'Emphatic and reductive expressions used in literary and journalistic contexts.',
			decks: [{ id: 'n1-grammar', title_es: 'にほかならない にすぎない', title_en: 'にほかならない にすぎない' }]
		}),
		build({
			id: 'n1-s1-u3',
			section_es: 'Gramática N1: Literaria',
			section_en: 'Grammar N1: Literary',
			title_es: 'En torno a / A propósito de (~をめぐって / ~にあたって)',
			title_en: 'Surrounding / Upon (~をめぐって / ~にあたって)',
			emoji: '🌐',
			objective_es: 'Expresiones formales para debates, discursos y ensayos académicos.',
			objective_en: 'Formal expressions for debates, speeches and academic essays.',
			decks: [{ id: 'n1-grammar', title_es: 'をめぐって にあたって', title_en: 'をめぐって にあたって' }]
		}),
		build({
			id: 'n1-s1-u4',
			section_es: 'Gramática N1: Literaria',
			section_en: 'Grammar N1: Literary',
			title_es: 'Patrones de Alto Nivel (~ともなると / ~とあれば)',
			title_en: 'High-Level Patterns (~ともなると / ~とあれば)',
			emoji: '🎓',
			objective_es: 'Patrones complejos que aparecen en exámenes N1 y literatura contemporánea.',
			objective_en: 'Complex patterns found in N1 exams and contemporary literature.',
			decks: [{ id: 'n1-grammar', title_es: 'Patrones N1 Avanzados', title_en: 'Advanced N1 Patterns' }]
		}),

		// ── KEIGO AVANZADO ───────────────────────────────────────────────────
		build({
			id: 'n1-s2-u1',
			section_es: 'Keigo Avanzado',
			section_en: 'Advanced Keigo',
			title_es: 'Sonkeigo Completo',
			title_en: 'Complete Sonkeigo',
			emoji: '🙏',
			objective_es: 'Formas de respeto: いらっしゃる, おっしゃる, ご覧になる y más.',
			objective_en: 'Respect forms: いらっしゃる, おっしゃる, ご覧になる and more.',
			decks: [{ id: 'n1-keigo', title_es: 'Sonkeigo', title_en: 'Sonkeigo' }]
		}),
		build({
			id: 'n1-s2-u2',
			section_es: 'Keigo Avanzado',
			section_en: 'Advanced Keigo',
			title_es: 'Kenjōgo Completo',
			title_en: 'Complete Kenjōgo',
			emoji: '🤲',
			objective_es: 'Formas de humildad: 参る, 申す, いたす, 拝見する y más.',
			objective_en: 'Humble forms: 参る, 申す, いたす, 拝見する and more.',
			decks: [{ id: 'n1-keigo', title_es: 'Kenjōgo', title_en: 'Kenjōgo' }]
		}),
		build({
			id: 'n1-s2-u3',
			section_es: 'Keigo Avanzado',
			section_en: 'Advanced Keigo',
			title_es: 'Teineigo y Situaciones Formales',
			title_en: 'Teineigo & Formal Situations',
			emoji: '🏢',
			objective_es: 'Registros en contextos de empresa, entrevistas y actos públicos.',
			objective_en: 'Registers in company contexts, interviews and public events.',
			decks: [{ id: 'n1-keigo', title_es: 'Teineigo', title_en: 'Teineigo' }]
		}),

		// ── KANJI N1 ─────────────────────────────────────────────────────────
		build({
			id: 'n1-s3-u1',
			section_es: 'Kanji N1: Grupo 1',
			section_en: 'Kanji N1: Group 1',
			title_es: 'Kanji de Alta Frecuencia (1)',
			title_en: 'High-Frequency Kanji (1)',
			emoji: '漢',
			objective_es: 'Los kanji más difíciles: 覇, 錯, 濫, 謹, 凌, 憂, 奔, 緻...',
			objective_en: 'The hardest kanji: 覇, 錯, 濫, 謹, 凌, 憂, 奔, 緻...',
			decks: [{ id: 'n1-kanji', title_es: 'Kanji N1 (1)', title_en: 'N1 Kanji (1)' }]
		}),
		build({
			id: 'n1-s3-u2',
			section_es: 'Kanji N1: Grupo 2',
			section_en: 'Kanji N1: Group 2',
			title_es: 'Kanji de Alta Frecuencia (2)',
			title_en: 'High-Frequency Kanji (2)',
			emoji: '字',
			objective_es: 'Lecturas alternativas, on-yomi y kun-yomi infrecuentes del N1.',
			objective_en: 'Alternative readings, rare on-yomi and kun-yomi at N1 level.',
			decks: [{ id: 'n1-kanji', title_es: 'Kanji N1 (2)', title_en: 'N1 Kanji (2)' }]
		}),

		// ── VOCABULARIO ACADÉMICO Y LITERARIO ────────────────────────────────
		build({
			id: 'n1-s4-u1',
			section_es: 'Vocabulario Académico',
			section_en: 'Academic Vocabulary',
			title_es: 'Vocabulario de Ensayo y Argumento',
			title_en: 'Essay & Argument Vocabulary',
			emoji: '✍️',
			objective_es: 'Términos de análisis, argumentación y redacción académica en japonés.',
			objective_en: 'Terms for analysis, argumentation and academic writing in Japanese.',
			decks: [{ id: 'n1-academic', title_es: 'Vocabulario Académico', title_en: 'Academic Vocabulary' }]
		}),
		build({
			id: 'n1-s4-u2',
			section_es: 'Vocabulario Literario',
			section_en: 'Literary Vocabulary',
			title_es: 'Literatura y Expresiones Clásicas',
			title_en: 'Literature & Classical Expressions',
			emoji: '📜',
			objective_es: 'Vocabulario de literatura japonesa, proverbios (ことわざ) y yoji-jukugo (四字熟語).',
			objective_en: 'Japanese literature vocabulary, proverbs (ことわざ) and yoji-jukugo (四字熟語).',
			decks: [{ id: 'n1-literary', title_es: 'Literatura', title_en: 'Literature' }]
		}),
		build({
			id: 'n1-s4-u3',
			section_es: 'Vocabulario Literario',
			section_en: 'Literary Vocabulary',
			title_es: 'Expresiones de Cuatro Kanji (四字熟語)',
			title_en: 'Four-Kanji Expressions (四字熟語)',
			emoji: '🀄',
			objective_es: '一石二鳥, 七転八起, 十人十色... Expresiones compuestas de cuatro kanji.',
			objective_en: '一石二鳥, 七転八起, 十人十色... Compound four-kanji expressions.',
			decks: [{ id: 'n1-yojijukugo', title_es: '四字熟語', title_en: '四字熟語' }]
		}),

		// ── MAESTRÍA TOTAL ───────────────────────────────────────────────────
		build({
			id: 'n1-s5-u1',
			section_es: 'Maestría Total',
			section_en: 'Total Mastery',
			title_es: 'Comprensión Auditiva Avanzada',
			title_en: 'Advanced Listening',
			emoji: '👂',
			objective_es: 'Entiende discursos, debates y programas de TV a velocidad nativa.',
			objective_en: 'Understand speeches, debates and TV programs at native speed.',
			decks: [{ id: 'n1-listening', title_es: 'Auditivo Avanzado', title_en: 'Advanced Listening' }]
		}),
		build({
			id: 'n1-s5-u2',
			section_es: 'Maestría Total',
			section_en: 'Total Mastery',
			title_es: 'Simulacro JLPT N1',
			title_en: 'JLPT N1 Practice Test',
			emoji: '🏆',
			objective_es: 'Test completo al estilo JLPT N1: vocabulario, gramática y comprensión.',
			objective_en: 'Full JLPT N1-style test: vocabulary, grammar and reading comprehension.',
			decks: [{ id: 'n1-jlpt-prep', title_es: 'Simulacro N1', title_en: 'N1 Mock Test' }]
		}),
		build({
			id: 'n1-s6-u1',
			section_es: 'Gramática N1: Estructura Lógica',
			section_en: 'Grammar N1: Logical Structure',
			title_es: 'Inflexibilidad (bekarazu / majiki)',
			title_en: 'Inflexibility (bekarazu / majiki)',
			emoji: '🛑',
			objective_es: 'Expresiones de prohibición absoluta y deber moral de corte clásico.',
			objective_en: 'Absolute prohibition and moral duty expressions with a classical tone.',
			decks: [{ id: 'n1-grammar', title_es: 'Inflexibilidad', title_en: 'Inflexibility' }]
		}),
		build({
			id: 'n1-s6-u2',
			section_es: 'Gramática N1: Estructura Lógica',
			section_en: 'Grammar N1: Logical Structure',
			title_es: 'Inmediatez (ya ina ya)',
			title_en: 'Immediacy (ya ina ya)',
			emoji: '⚡',
			objective_es: 'Acciones que ocurren inmediatamente después de otra: やいなや, が早いか.',
			objective_en: 'Actions occurring immediately after another: ya ina ya, ga hayai ka.',
			decks: [{ id: 'n1-grammar', title_es: 'Inmediatez', title_en: 'Immediacy' }]
		}),
		build({
			id: 'n1-s7-u1',
			section_es: 'Gramática N1: Matices',
			section_en: 'Grammar N1: Nuance',
			title_es: 'Lamento y Arrepentimiento',
			title_en: 'Regret & Remorse',
			emoji: '🥀',
			objective_es: 'Expresiones de pesar profundo: ~を禁じ得ない, ~に堪えない.',
			objective_en: 'Deep regret expressions: ~wo kinjienai, ~ni taenai.',
			decks: [{ id: 'n1-grammar', title_es: 'Lamento', title_en: 'Regret' }]
		})
	]
};
