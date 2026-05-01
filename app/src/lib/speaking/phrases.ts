export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SpeakingPhrase {
	id: string;
	text: string;           // full Japanese text
	reading: string;        // hiragana reading (for display)
	meaning: string;        // Spanish translation
	segments: string[];     // natural chunks for per-part feedback
	difficulty: Difficulty;
	category: string;
}

export const SPEAKING_PHRASES: SpeakingPhrase[] = [
	// ── Saludos ─────────────────────────────────────────────────────────────────
	{
		id: 'ohayou',
		text: 'おはようございます',
		reading: 'おはようございます',
		meaning: 'Buenos días',
		segments: ['おはよう', 'ございます'],
		difficulty: 'easy',
		category: 'saludos'
	},
	{
		id: 'konnichiwa',
		text: 'こんにちは',
		reading: 'こんにちは',
		meaning: 'Hola / Buenas tardes',
		segments: ['こんにちは'],
		difficulty: 'easy',
		category: 'saludos'
	},
	{
		id: 'konbanwa',
		text: 'こんばんは',
		reading: 'こんばんは',
		meaning: 'Buenas noches',
		segments: ['こんばんは'],
		difficulty: 'easy',
		category: 'saludos'
	},
	{
		id: 'sayonara',
		text: 'さようなら',
		reading: 'さようなら',
		meaning: 'Adiós',
		segments: ['さよう', 'なら'],
		difficulty: 'easy',
		category: 'saludos'
	},
	{
		id: 'arigatou',
		text: 'ありがとうございます',
		reading: 'ありがとうございます',
		meaning: 'Muchas gracias',
		segments: ['ありがとう', 'ございます'],
		difficulty: 'easy',
		category: 'saludos'
	},
	{
		id: 'douzo',
		text: 'どうぞよろしくおねがいします',
		reading: 'どうぞよろしくおねがいします',
		meaning: 'Mucho gusto / Por favor, trátame bien',
		segments: ['どうぞ', 'よろしく', 'おねがいします'],
		difficulty: 'medium',
		category: 'saludos'
	},
	// ── Presentación ────────────────────────────────────────────────────────────
	{
		id: 'namae',
		text: 'わたしのなまえはマヌエルです',
		reading: 'わたしのなまえはまぬえるです',
		meaning: 'Mi nombre es Manuel',
		segments: ['わたしの', 'なまえは', 'まぬえるです'],
		difficulty: 'easy',
		category: 'presentación'
	},
	{
		id: 'nihongo',
		text: 'にほんごをべんきょうしています',
		reading: 'にほんごをべんきょうしています',
		meaning: 'Estoy estudiando japonés',
		segments: ['にほんごを', 'べんきょう', 'しています'],
		difficulty: 'medium',
		category: 'presentación'
	},
	// ── Frases cotidianas ────────────────────────────────────────────────────────
	{
		id: 'wakarimasen',
		text: 'わかりません',
		reading: 'わかりません',
		meaning: 'No entiendo',
		segments: ['わかり', 'ません'],
		difficulty: 'easy',
		category: 'cotidiano'
	},
	{
		id: 'mou-ichido',
		text: 'もういちどおねがいします',
		reading: 'もういちどおねがいします',
		meaning: 'Una vez más, por favor',
		segments: ['もういちど', 'おねがいします'],
		difficulty: 'easy',
		category: 'cotidiano'
	},
	{
		id: 'sumimasen',
		text: 'すみません',
		reading: 'すみません',
		meaning: 'Disculpe / Perdón',
		segments: ['すみません'],
		difficulty: 'easy',
		category: 'cotidiano'
	},
	{
		id: 'ikura',
		text: 'これはいくらですか',
		reading: 'これはいくらですか',
		meaning: '¿Cuánto cuesta esto?',
		segments: ['これは', 'いくら', 'ですか'],
		difficulty: 'easy',
		category: 'cotidiano'
	},
	{
		id: 'doko',
		text: 'トイレはどこですか',
		reading: 'といれはどこですか',
		meaning: '¿Dónde está el baño?',
		segments: ['といれは', 'どこ', 'ですか'],
		difficulty: 'easy',
		category: 'cotidiano'
	},
	// ── Intermedio ──────────────────────────────────────────────────────────────
	{
		id: 'tabetai',
		text: 'すしをたべたいです',
		reading: 'すしをたべたいです',
		meaning: 'Quiero comer sushi',
		segments: ['すしを', 'たべたい', 'です'],
		difficulty: 'medium',
		category: 'deseos'
	},
	{
		id: 'ikitai',
		text: 'にほんにいきたいです',
		reading: 'にほんにいきたいです',
		meaning: 'Quiero ir a Japón',
		segments: ['にほんに', 'いきたい', 'です'],
		difficulty: 'medium',
		category: 'deseos'
	},
	{
		id: 'tenki',
		text: 'きょうはいいてんきですね',
		reading: 'きょうはいいてんきですね',
		meaning: 'Hoy hace buen tiempo, ¿verdad?',
		segments: ['きょうは', 'いいてんき', 'ですね'],
		difficulty: 'medium',
		category: 'conversación'
	},
	// ── Difícil ─────────────────────────────────────────────────────────────────
	{
		id: 'shinkansen',
		text: 'しんかんせんのきっぷをかいたいのですが',
		reading: 'しんかんせんのきっぷをかいたいのですが',
		meaning: 'Me gustaría comprar un boleto del shinkansen',
		segments: ['しんかんせんの', 'きっぷを', 'かいたいの', 'ですが'],
		difficulty: 'hard',
		category: 'viajes'
	},
	{
		id: 'byouki',
		text: 'きのうからあたまがいたいです',
		reading: 'きのうからあたまがいたいです',
		meaning: 'Desde ayer me duele la cabeza',
		segments: ['きのうから', 'あたまが', 'いたいです'],
		difficulty: 'hard',
		category: 'salud'
	}
];

export const CATEGORIES = [...new Set(SPEAKING_PHRASES.map(p => p.category))];

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
	easy: 'Fácil',
	medium: 'Medio',
	hard: 'Difícil'
};
