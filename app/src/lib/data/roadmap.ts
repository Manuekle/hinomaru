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
		// SECCION: PRIMEROS SALUDOS
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

		// SECCION: EN EL RESTAURANTE
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

		// SECCION: DE COMPRAS
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

		// SECCION: TRANSPORTE
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
		// SECCION: ESCRITURA BÁSICA
		build({
			id: 'n5-s1-u1',
			section_es: 'Escritura: Hiragana',
			section_en: 'Writing: Hiragana',
			title_es: 'Hiragana: Vocales',
			title_en: 'Hiragana: Vowels',
			emoji: 'あ',
			objective_es: 'Domina las vocales A, I, U, E, O.',
			objective_en: 'Master the vowels A, I, U, E, O.',
			decks: [{ id: 'n5-hiragana', title_es: 'Vocales', title_en: 'Vowels' }]
		}),
		build({
			id: 'n5-s1-u2',
			section_es: 'Escritura: Hiragana',
			section_en: 'Writing: Hiragana',
			title_es: 'Hiragana: K y S',
			title_en: 'Hiragana: K & S',
			emoji: 'か',
			objective_es: 'Aprende las filas KA y SA.',
			objective_en: 'Learn the KA and SA rows.',
			decks: [{ id: 'n5-hiragana', title_es: 'K y S', title_en: 'K & S' }]
		}),
		build({
			id: 'n5-s1-u3',
			section_es: 'Escritura: Hiragana',
			section_en: 'Writing: Hiragana',
			title_es: 'Hiragana: Maestría',
			title_en: 'Hiragana: Mastery',
			emoji: '💮',
			objective_es: 'Lectura completa de Hiragana.',
			objective_en: 'Complete Hiragana reading.',
			decks: [{ id: 'n5-hiragana', title_es: 'Todo Hiragana', title_en: 'All Hiragana' }]
		}),

		// SECCION: GRAMÁTICA FUNDAMENTAL
		build({
			id: 'n5-s2-u1',
			section_es: 'Gramática Fundamental',
			section_en: 'Basic Grammar',
			title_es: 'Ser y No Ser (Desu)',
			title_en: 'To Be (Desu)',
			emoji: '📑',
			objective_es: 'Estructura básica A wa B desu.',
			objective_en: 'Basic structure A wa B desu.',
			decks: [{ id: 'n5-grammar-intro', title_es: 'Afirmación', title_en: 'Affirmation' }]
		}),
		build({
			id: 'n5-s2-u2',
			section_es: 'Gramática Fundamental',
			section_en: 'Basic Grammar',
			title_es: 'Posesión (NO)',
			title_en: 'Possession (NO)',
			emoji: '🎒',
			objective_es: 'Aprende a decir que algo es tuyo.',
			objective_en: 'Learn to say something belongs to you.',
			decks: [{ id: 'n5-grammar', title_es: 'Partícula NO', title_en: 'Particle NO' }]
		}),
		build({
			id: 'n5-s2-u3',
			section_es: 'Gramática Fundamental',
			section_en: 'Basic Grammar',
			title_es: 'Preguntar con KA',
			title_en: 'Asking with KA',
			emoji: '❓',
			objective_es: 'Convierte frases en preguntas.',
			objective_en: 'Turn sentences into questions.',
			decks: [{ id: 'n5-questions', title_es: 'Preguntas', title_en: 'Questions' }]
		})
	],
	N4: [
		build({
			id: 'n4-c1',
			section_es: 'Verbos Intermedios',
			section_en: 'Intermediate Verbs',
			title_es: 'Verbos N4',
			title_en: 'N4 Verbs',
			emoji: '🏃',
			objective_es: 'Verbos transitivos e intransitivos.',
			objective_en: 'Transitive and intransitive verbs.',
			decks: [{ id: 'n4-verbs', title_es: 'Verbos N4', title_en: 'N4 Verbs' }]
		})
	],
	N3: [
		build({
			id: 'n3-c1',
			section_es: 'Vida en Japón',
			section_en: 'Life in Japan',
			title_es: 'Trabajo y Oficina',
			title_en: 'Work & Office',
			emoji: '💼',
			objective_es: 'Vocabulario corporativo y formal.',
			objective_en: 'Corporate and formal vocabulary.',
			decks: [{ id: 'n3-work', title_es: 'Trabajo', title_en: 'Work' }]
		})
	],
	N2: [
		build({
			id: 'n2-c1',
			section_es: 'Japonés Avanzado',
			section_en: 'Advanced Japanese',
			title_es: 'Literatura y Noticias',
			title_en: 'Literature & News',
			emoji: '📰',
			objective_es: 'Comprende textos complejos.',
			objective_en: 'Understand complex texts.',
			decks: [{ id: 'n2-grammar', title_es: 'Gramática N2', title_en: 'N2 Grammar' }]
		})
	],
	N1: [
		build({
			id: 'n1-c1',
			section_es: 'Maestría Total',
			section_en: 'Total Mastery',
			title_es: 'Nivel Académico',
			title_en: 'Academic Level',
			emoji: '🏛️',
			objective_es: 'Dominio total del idioma.',
			objective_en: 'Total language mastery.',
			decks: [{ id: 'n1-grammar', title_es: 'Gramática N1', title_en: 'N1 Grammar' }]
		})
	]
};
