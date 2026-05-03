// Roadmap = guided learning experience.
// Chapter (RoadmapUnit) → Lessons (typed activities). Lessons reference deck IDs
// for content but are NOT the same as decks: a deck can power multiple lessons
// (learn → quiz → speak). Decks remain raw flashcard content; lessons are UX.

export type LessonType = 'learn' | 'quiz' | 'review' | 'speak';

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
	title_es: string;
	title_en: string;
	emoji: string;
	objective_es: string;
	objective_en: string;
	decks: DeckRef[];
	includeQuiz?: boolean;
}

function build(u: BasicUnit): RoadmapUnit {
	const lessons: Lesson[] = u.decks.map((d) => ({
		id: `${u.id}__${d.id}__learn`,
		type: 'learn',
		deckId: d.id,
		title_es: d.title_es,
		title_en: d.title_en,
		goal_es: d.goal_es ?? `Aprende ${d.title_es.toLowerCase()}`,
		goal_en: d.goal_en ?? `Learn ${d.title_en.toLowerCase()}`
	}));
	if (u.includeQuiz !== false && u.decks.length >= 1) {
		const last = u.decks[u.decks.length - 1];
		lessons.push({
			id: `${u.id}__quiz`,
			type: 'quiz',
			deckId: last.id,
			title_es: `Quiz: ${u.title_es}`,
			title_en: `Quiz: ${u.title_en}`,
			goal_es: 'Pon a prueba lo aprendido en esta unidad.',
			goal_en: 'Test what you learned in this unit.'
		});
	}
	return {
		id: u.id,
		title_en: u.title_en,
		title_es: u.title_es,
		emoji: u.emoji,
		objective_en: u.objective_en,
		objective_es: u.objective_es,
		lessons
	};
}

export const ROADMAPS: Record<string, RoadmapUnit[]> = {
	N5: [
		build({
			id: 'n5-c1',
			title_es: 'Fundamentos',
			title_en: 'Foundations',
			emoji: '🇯🇵',
			objective_es: 'Domina los dos alfabetos japoneses básicos.',
			objective_en: 'Master the two basic Japanese alphabets.',
			decks: [
				{ id: 'n5-hiragana', title_es: 'Hiragana', title_en: 'Hiragana', goal_es: 'Aprende los 46 caracteres hiragana.', goal_en: 'Learn the 46 hiragana characters.' },
				{ id: 'n5-katakana', title_es: 'Katakana', title_en: 'Katakana', goal_es: 'Aprende los 46 caracteres katakana.', goal_en: 'Learn the 46 katakana characters.' }
			]
		}),
		build({
			id: 'n5-c2',
			title_es: 'Primer Contacto',
			title_en: 'First Contact',
			emoji: '👋',
			objective_es: 'Saluda y preséntate en japonés.',
			objective_en: 'Greet and introduce yourself in Japanese.',
			decks: [
				{ id: 'n5-greetings', title_es: 'Saludos', title_en: 'Greetings', goal_es: 'Hola, gracias y despedidas básicas.', goal_en: 'Hello, thanks and basic farewells.' },
				{ id: 'survival-intro', title_es: 'Presentación', title_en: 'Introduction', goal_es: 'Di tu nombre y de dónde eres.', goal_en: 'Say your name and where you are from.' },
				{ id: 'n5-pronouns', title_es: 'Pronombres', title_en: 'Pronouns', goal_es: 'Yo, tú, él, ella, nosotros.', goal_en: 'I, you, he, she, we.' }
			]
		}),
		build({
			id: 'n5-c3',
			title_es: 'Hacer Preguntas',
			title_en: 'Asking Questions',
			emoji: '❓',
			objective_es: 'Aprende a preguntar y a contar.',
			objective_en: 'Learn to ask questions and count.',
			decks: [
				{ id: 'n5-questions', title_es: 'Palabras de Pregunta', title_en: 'Question Words', goal_es: 'Qué, quién, dónde, cuándo.', goal_en: 'What, who, where, when.' },
				{ id: 'n5-numbers', title_es: 'Números', title_en: 'Numbers', goal_es: 'Cuenta del 1 al 10 en japonés.', goal_en: 'Count from 1 to 10 in Japanese.' }
			]
		}),
		build({
			id: 'n5-c4',
			title_es: 'Tiempo y Familia',
			title_en: 'Time & Family',
			emoji: '👨‍👩‍👧',
			objective_es: 'Habla de tu familia y del tiempo.',
			objective_en: 'Talk about your family and time.',
			decks: [
				{ id: 'n5-time', title_es: 'Expresiones de Tiempo', title_en: 'Time Expressions', goal_es: 'Hoy, mañana, mañana (a.m.), noche.', goal_en: 'Today, tomorrow, morning, night.' },
				{ id: 'n5-family', title_es: 'La Familia', title_en: 'Family', goal_es: 'Padres, hermanos, hijos.', goal_en: 'Parents, siblings, children.' }
			]
		}),
		build({
			id: 'n5-c5',
			title_es: 'Vida Diaria',
			title_en: 'Daily Life',
			emoji: '🍜',
			objective_es: 'Vocabulario para el día a día.',
			objective_en: 'Vocabulary for everyday life.',
			decks: [
				{ id: 'n5-food', title_es: 'Comida y Bebida', title_en: 'Food & Drinks', goal_es: 'Ramen, sushi y bebidas.', goal_en: 'Ramen, sushi and drinks.' },
				{ id: 'n5-colors', title_es: 'Colores', title_en: 'Colors', goal_es: 'Rojo, azul, verde y más.', goal_en: 'Red, blue, green and more.' },
				{ id: 'n5-objects', title_es: 'Objetos', title_en: 'Objects', goal_es: 'Libro, teléfono, paraguas.', goal_en: 'Book, phone, umbrella.' }
			]
		}),
		build({
			id: 'n5-c6',
			title_es: 'El Mundo',
			title_en: 'The World',
			emoji: '🌍',
			objective_es: 'Naturaleza, animales y clima.',
			objective_en: 'Nature, animals and weather.',
			decks: [
				{ id: 'n5-animals', title_es: 'Animales', title_en: 'Animals', goal_es: 'Mascotas y animales comunes.', goal_en: 'Pets and common animals.' },
				{ id: 'n5-weather', title_es: 'Clima y Naturaleza', title_en: 'Weather & Nature', goal_es: 'Sol, lluvia, montañas, mar.', goal_en: 'Sun, rain, mountains, sea.' }
			]
		}),
		build({
			id: 'n5-c7',
			title_es: 'Cuerpo y Dirección',
			title_en: 'Body & Direction',
			emoji: '🧭',
			objective_es: 'Habla de tu cuerpo y orienta el espacio.',
			objective_en: 'Talk about your body and orient in space.',
			decks: [
				{ id: 'n5-body', title_es: 'Partes del Cuerpo', title_en: 'Body Parts', goal_es: 'Ojos, oídos, manos, pies.', goal_en: 'Eyes, ears, hands, feet.' },
				{ id: 'n5-directions', title_es: 'Direcciones', title_en: 'Directions', goal_es: 'Arriba, abajo, izquierda, derecha.', goal_en: 'Up, down, left, right.' }
			]
		}),
		build({
			id: 'n5-c8',
			title_es: 'Acciones y Descripción',
			title_en: 'Actions & Description',
			emoji: '🏃',
			objective_es: 'Verbos y adjetivos para describir.',
			objective_en: 'Verbs and adjectives to describe.',
			decks: [
				{ id: 'n5-verbs', title_es: 'Verbos', title_en: 'Verbs', goal_es: 'Comer, dormir, estudiar.', goal_en: 'Eat, sleep, study.' },
				{ id: 'n5-adjectives', title_es: 'Adjetivos', title_en: 'Adjectives', goal_es: 'Grande, pequeño, nuevo, viejo.', goal_en: 'Big, small, new, old.' }
			]
		}),
		build({
			id: 'n5-c9',
			title_es: 'Exploración',
			title_en: 'Exploration',
			emoji: '🏫',
			objective_es: 'Lugares y primeras frases gramaticales.',
			objective_en: 'Places and your first grammar patterns.',
			decks: [
				{ id: 'n5-places', title_es: 'Lugares', title_en: 'Places', goal_es: 'Escuela, estación, hospital.', goal_en: 'School, station, hospital.' },
				{ id: 'n5-grammar-intro', title_es: 'Frases Básicas', title_en: 'Basic Sentences', goal_es: 'Cómo usar "desu" y "wa".', goal_en: 'How to use "desu" and "wa".' }
			]
		}),
		build({
			id: 'n5-c10',
			title_es: 'Maestría N5',
			title_en: 'N5 Mastery',
			emoji: '🈁',
			objective_es: 'Kanji y gramática completa de nivel N5.',
			objective_en: 'Full N5 kanji and grammar.',
			decks: [
				{ id: 'n5-kanji', title_es: 'Kanji N5', title_en: 'N5 Kanji', goal_es: 'Los 80 kanji esenciales del N5.', goal_en: 'The 80 essential N5 kanji.' },
				{ id: 'n5-grammar', title_es: 'Gramática N5', title_en: 'N5 Grammar', goal_es: '30 patrones gramaticales clave.', goal_en: '30 key grammar patterns.' }
			]
		})
	],
	N4: [
		build({
			id: 'n4-c1',
			title_es: 'Verbos N4',
			title_en: 'N4 Verbs',
			emoji: '🏃',
			objective_es: 'Verbos transitivos/intransitivos y formas comunes.',
			objective_en: 'Transitive/intransitive verbs and common forms.',
			decks: [{ id: 'n4-verbs', title_es: 'Verbos N4', title_en: 'N4 Verbs' }]
		}),
		build({
			id: 'n4-c2',
			title_es: 'Vida Diaria',
			title_en: 'Daily Life',
			emoji: '🏠',
			objective_es: 'Sustantivos y vocabulario para el día a día.',
			objective_en: 'Nouns and everyday vocabulary.',
			decks: [
				{ id: 'n4-daily', title_es: 'Sustantivos diarios', title_en: 'Daily Nouns' },
				{ id: 'n4-time', title_es: 'Tiempo y horario', title_en: 'Time & Schedule' }
			]
		}),
		build({
			id: 'n4-c3',
			title_es: 'Descripción',
			title_en: 'Description',
			emoji: '🌟',
			objective_es: 'Adjetivos y adverbios intermedios.',
			objective_en: 'Intermediate adjectives and adverbs.',
			decks: [
				{ id: 'n4-adjectives', title_es: 'Adjetivos N4', title_en: 'N4 Adjectives' },
				{ id: 'n4-adverbs', title_es: 'Adverbios N4', title_en: 'N4 Adverbs' }
			]
		}),
		build({
			id: 'n4-c4',
			title_es: 'Contar y Social',
			title_en: 'Counting & Social',
			emoji: '🔢',
			objective_es: 'Contadores y vocabulario social.',
			objective_en: 'Counters and social vocabulary.',
			decks: [
				{ id: 'n4-counters', title_es: 'Contadores', title_en: 'Counters' },
				{ id: 'n4-social', title_es: 'Social', title_en: 'Social' }
			]
		}),
		build({
			id: 'n4-c5',
			title_es: 'Gramática N4',
			title_en: 'N4 Grammar',
			emoji: '📖',
			objective_es: '40 patrones intermedios de gramática.',
			objective_en: '40 intermediate grammar patterns.',
			decks: [{ id: 'n4-grammar', title_es: 'Gramática N4', title_en: 'N4 Grammar' }],
			includeQuiz: false
		})
	],
	N3: [
		build({
			id: 'n3-c1',
			title_es: 'Verbos N3',
			title_en: 'N3 Verbs',
			emoji: '🏃',
			objective_es: 'Verbos intermedios.',
			objective_en: 'Intermediate verbs.',
			decks: [{ id: 'n3-verbs', title_es: 'Verbos N3', title_en: 'N3 Verbs' }]
		}),
		build({
			id: 'n3-c2',
			title_es: 'Descripción',
			title_en: 'Description',
			emoji: '🌟',
			objective_es: 'Adjetivos intermedios.',
			objective_en: 'Intermediate adjectives.',
			decks: [{ id: 'n3-adjectives', title_es: 'Adjetivos N3', title_en: 'N3 Adjectives' }]
		}),
		build({
			id: 'n3-c3',
			title_es: 'Sociedad y Trabajo',
			title_en: 'Society & Work',
			emoji: '🏛️',
			objective_es: 'Vocabulario de sociedad y trabajo.',
			objective_en: 'Society and work vocabulary.',
			decks: [
				{ id: 'n3-society', title_es: 'Sociedad', title_en: 'Society' },
				{ id: 'n3-work', title_es: 'Trabajo', title_en: 'Work' }
			]
		}),
		build({
			id: 'n3-c4',
			title_es: 'Emociones',
			title_en: 'Emotions',
			emoji: '💭',
			objective_es: 'Emociones y relaciones.',
			objective_en: 'Emotions and relationships.',
			decks: [{ id: 'n3-emotions', title_es: 'Emociones', title_en: 'Emotions' }]
		}),
		build({
			id: 'n3-c5',
			title_es: 'Conceptos Abstractos',
			title_en: 'Abstract Concepts',
			emoji: '🧠',
			objective_es: 'Sustantivos abstractos.',
			objective_en: 'Abstract nouns.',
			decks: [{ id: 'n3-abstract', title_es: 'Conceptos Abstractos', title_en: 'Abstract' }]
		}),
		build({
			id: 'n3-c6',
			title_es: 'Gramática N3',
			title_en: 'N3 Grammar',
			emoji: '📖',
			objective_es: '50 patrones gramaticales N3.',
			objective_en: '50 N3 grammar patterns.',
			decks: [{ id: 'n3-grammar', title_es: 'Gramática N3', title_en: 'N3 Grammar' }],
			includeQuiz: false
		})
	],
	Survival: [
		build({
			id: 'sv-c1',
			title_es: 'Primeras Palabras',
			title_en: 'First Words',
			emoji: '👋',
			objective_es: 'Frases esenciales para tu viaje.',
			objective_en: 'Essential phrases for your trip.',
			decks: [{ id: 'survival-travel', title_es: 'Frases de Viaje', title_en: 'Travel Phrases' }]
		}),
		build({
			id: 'sv-c2',
			title_es: 'En el Restaurante',
			title_en: 'At the Restaurant',
			emoji: '🍜',
			objective_es: 'Pide comida y paga la cuenta.',
			objective_en: 'Order food and pay the bill.',
			decks: [{ id: 'survival-restaurant', title_es: 'Restaurante', title_en: 'Restaurant' }]
		}),
		build({
			id: 'sv-c3',
			title_es: 'De Compras',
			title_en: 'Shopping',
			emoji: '🛍️',
			objective_es: 'Pruébate ropa y pregunta precios.',
			objective_en: 'Try clothes and ask prices.',
			decks: [{ id: 'survival-shopping', title_es: 'Compras', title_en: 'Shopping' }]
		}),
		build({
			id: 'sv-c4',
			title_es: 'Moverse',
			title_en: 'Getting Around',
			emoji: '🚆',
			objective_es: 'Direcciones y transporte público.',
			objective_en: 'Directions and public transport.',
			decks: [{ id: 'survival-directions', title_es: 'Direcciones', title_en: 'Directions' }]
		}),
		build({
			id: 'sv-c5',
			title_es: 'Hotel',
			title_en: 'Hotel',
			emoji: '🏨',
			objective_es: 'Check-in y servicios del hotel.',
			objective_en: 'Hotel check-in and services.',
			decks: [{ id: 'survival-hotel', title_es: 'Hotel', title_en: 'Hotel' }]
		}),
		build({
			id: 'sv-c6',
			title_es: 'Emergencias',
			title_en: 'Emergencies',
			emoji: '🚑',
			objective_es: 'Pide ayuda y describe síntomas.',
			objective_en: 'Ask for help and describe symptoms.',
			decks: [{ id: 'survival-health', title_es: 'Salud', title_en: 'Health' }]
		})
	]
};
