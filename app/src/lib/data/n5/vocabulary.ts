import type { CardData } from '../types';

// N5 Vocabulary — ~150 most essential words organized by category
// Source: JLPT N5 official word list. Extend freely by adding entries here.
export const vocabulary: CardData[] = [
	// ── Saludos / Greetings ──────────────────────────────────────────────────
	{
		jp: 'おはようございます',
		romaji: 'ohayou gozaimasu',
		en: 'Good morning (polite)',
		es: 'Buenos días (formal)',
		example: 'おはようございます、田中さん。',
		example_en: 'Good morning, Mr. Tanaka.',
		example_es: 'Buenos días, Sr. Tanaka.',
		sort_order: 1
	},
	{
		jp: 'こんにちは',
		romaji: 'konnichiwa',
		en: 'Hello / Good afternoon',
		es: 'Hola / Buenas tardes',
		example: 'こんにちは！',
		example_en: 'Hello!',
		example_es: '¡Hola!',
		sort_order: 2
	},
	{
		jp: 'こんばんは',
		romaji: 'konbanwa',
		en: 'Good evening',
		es: 'Buenas noches (saludo)',
		example: 'こんばんは、元気ですか。',
		example_en: 'Good evening, how are you?',
		example_es: 'Buenas noches, ¿cómo estás?',
		sort_order: 3
	},
	{
		jp: 'さようなら',
		romaji: 'sayounara',
		en: 'Goodbye',
		es: 'Adiós',
		example: 'じゃ、さようなら。',
		example_en: 'Well, goodbye.',
		example_es: 'Bueno, adiós.',
		sort_order: 4
	},
	{
		jp: 'ありがとうございます',
		romaji: 'arigatou gozaimasu',
		en: 'Thank you (polite)',
		es: 'Muchas gracias (formal)',
		example: 'ありがとうございます！',
		example_en: 'Thank you very much!',
		example_es: '¡Muchas gracias!',
		sort_order: 5
	},
	{
		jp: 'すみません',
		romaji: 'sumimasen',
		en: 'Excuse me / Sorry',
		es: 'Perdón / Disculpe',
		example: 'すみません、どこですか。',
		example_en: 'Excuse me, where is it?',
		example_es: 'Disculpe, ¿dónde está?',
		sort_order: 6
	},
	{
		jp: 'いいえ',
		romaji: 'iie',
		en: 'No',
		es: 'No',
		example: 'いいえ、わかりません。',
		example_en: "No, I don't understand.",
		example_es: 'No, no entiendo.',
		sort_order: 7
	},
	{
		jp: 'はい',
		romaji: 'hai',
		en: 'Yes',
		es: 'Sí',
		example: 'はい、そうです。',
		example_en: 'Yes, that is right.',
		example_es: 'Sí, eso es correcto.',
		sort_order: 8
	},
	{
		jp: 'いただきます',
		romaji: 'itadakimasu',
		en: 'I humbly receive (before eating)',
		es: 'Gracias por la comida (antes de comer)',
		example: 'いただきます！',
		example_en: "Let's eat! (said before meals)",
		example_es: '¡Buen provecho! (antes de comer)',
		sort_order: 9
	},
	{
		jp: 'ごちそうさまでした',
		romaji: 'gochisousama deshita',
		en: 'Thank you for the meal',
		es: 'Gracias por la comida (después de comer)',
		example: 'ごちそうさまでした！',
		example_en: 'Thank you for the meal!',
		example_es: '¡Gracias por la comida!',
		sort_order: 10
	},

	// ── Pronombres / Pronouns ────────────────────────────────────────────────
	{
		jp: 'わたし',
		romaji: 'watashi',
		en: 'I / me',
		es: 'yo',
		example: 'わたしは学生です。',
		example_en: 'I am a student.',
		example_es: 'Yo soy estudiante.',
		sort_order: 11
	},
	{
		jp: 'あなた',
		romaji: 'anata',
		en: 'you',
		es: 'tú / usted',
		example: 'あなたの名前は？',
		example_en: 'What is your name?',
		example_es: '¿Cuál es tu nombre?',
		sort_order: 12
	},
	{
		jp: 'かれ',
		romaji: 'kare',
		en: 'he / him / boyfriend',
		es: 'él / novio',
		example: 'かれは先生です。',
		example_en: 'He is a teacher.',
		example_es: 'Él es profesor.',
		sort_order: 13
	},
	{
		jp: 'かのじょ',
		romaji: 'kanojo',
		en: 'she / her / girlfriend',
		es: 'ella / novia',
		example: 'かのじょは医者です。',
		example_en: 'She is a doctor.',
		example_es: 'Ella es médica.',
		sort_order: 14
	},
	{
		jp: 'わたしたち',
		romaji: 'watashitachi',
		en: 'we / us',
		es: 'nosotros',
		example: 'わたしたちは日本語を勉強します。',
		example_en: 'We study Japanese.',
		example_es: 'Nosotros estudiamos japonés.',
		sort_order: 15
	},

	// ── Palabras de pregunta / Question words ────────────────────────────────
	{
		jp: 'なに / なん',
		romaji: 'nani / nan',
		en: 'what',
		es: 'qué',
		example: 'これは何ですか。',
		example_en: 'What is this?',
		example_es: '¿Qué es esto?',
		sort_order: 16
	},
	{
		jp: 'だれ',
		romaji: 'dare',
		en: 'who',
		es: 'quién',
		example: 'だれですか。',
		example_en: 'Who is it?',
		example_es: '¿Quién es?',
		sort_order: 17
	},
	{
		jp: 'どこ',
		romaji: 'doko',
		en: 'where',
		es: 'dónde',
		example: 'トイレはどこですか。',
		example_en: 'Where is the bathroom?',
		example_es: '¿Dónde está el baño?',
		sort_order: 18
	},
	{
		jp: 'いつ',
		romaji: 'itsu',
		en: 'when',
		es: 'cuándo',
		example: 'いつ来ますか。',
		example_en: 'When are you coming?',
		example_es: '¿Cuándo vienes?',
		sort_order: 19
	},
	{
		jp: 'どう',
		romaji: 'dou',
		en: 'how / in what way',
		es: 'cómo',
		example: '日本語はどうですか。',
		example_en: 'How is Japanese?',
		example_es: '¿Cómo te parece el japonés?',
		sort_order: 20
	},
	{
		jp: 'なぜ / どうして',
		romaji: 'naze / doushite',
		en: 'why',
		es: 'por qué',
		example: 'なぜ日本語を勉強しますか。',
		example_en: 'Why do you study Japanese?',
		example_es: '¿Por qué estudias japonés?',
		sort_order: 21
	},
	{
		jp: 'いくら',
		romaji: 'ikura',
		en: 'how much (price)',
		es: 'cuánto (precio)',
		example: 'これはいくらですか。',
		example_en: 'How much is this?',
		example_es: '¿Cuánto cuesta esto?',
		sort_order: 22
	},
	{
		jp: 'いくつ',
		romaji: 'ikutsu',
		en: 'how many / how old',
		es: 'cuántos / cuántos años',
		example: 'りんごはいくつありますか。',
		example_en: 'How many apples are there?',
		example_es: '¿Cuántas manzanas hay?',
		sort_order: 23
	},

	// ── Números / Numbers ────────────────────────────────────────────────────
	{
		jp: 'いち',
		romaji: 'ichi',
		en: 'one (1)',
		es: 'uno',
		example: 'いちばんです。',
		example_en: "It's number one.",
		example_es: 'Es el número uno.',
		sort_order: 24
	},
	{
		jp: 'に',
		romaji: 'ni',
		en: 'two (2)',
		es: 'dos',
		example: 'ふたりです。',
		example_en: 'There are two people.',
		example_es: 'Somos dos personas.',
		sort_order: 25
	},
	{
		jp: 'さん',
		romaji: 'san',
		en: 'three (3)',
		es: 'tres',
		example: 'さんびゃく円です。',
		example_en: 'It is 300 yen.',
		example_es: 'Son 300 yenes.',
		sort_order: 26
	},
	{
		jp: 'よん / し',
		romaji: 'yon / shi',
		en: 'four (4)',
		es: 'cuatro',
		example: 'よんじゅう円。',
		example_en: '40 yen.',
		example_es: '40 yenes.',
		sort_order: 27
	},
	{
		jp: 'ご',
		romaji: 'go',
		en: 'five (5)',
		es: 'cinco',
		example: 'ごふんまってください。',
		example_en: 'Please wait 5 minutes.',
		example_es: 'Por favor espera 5 minutos.',
		sort_order: 28
	},
	{
		jp: 'ろく',
		romaji: 'roku',
		en: 'six (6)',
		es: 'seis',
		example: 'ろくじです。',
		example_en: "It's six o'clock.",
		example_es: 'Son las seis.',
		sort_order: 29
	},
	{
		jp: 'なな / しち',
		romaji: 'nana / shichi',
		en: 'seven (7)',
		es: 'siete',
		example: 'ななじゅう円です。',
		example_en: 'It is 70 yen.',
		example_es: 'Son 70 yenes.',
		sort_order: 30
	},
	{
		jp: 'はち',
		romaji: 'hachi',
		en: 'eight (8)',
		es: 'ocho',
		example: 'はっぴゃく円です。',
		example_en: 'It is 800 yen.',
		example_es: 'Son 800 yenes.',
		sort_order: 31
	},
	{
		jp: 'きゅう / く',
		romaji: 'kyuu / ku',
		en: 'nine (9)',
		es: 'nueve',
		example: 'きゅうじです。',
		example_en: "It's nine o'clock.",
		example_es: 'Son las nueve.',
		sort_order: 32
	},
	{
		jp: 'じゅう',
		romaji: 'juu',
		en: 'ten (10)',
		es: 'diez',
		example: 'じゅっぷんまって。',
		example_en: 'Wait 10 minutes.',
		example_es: 'Espera 10 minutos.',
		sort_order: 33
	},

	// ── Tiempo / Time ────────────────────────────────────────────────────────
	{
		jp: 'いま',
		romaji: 'ima',
		en: 'now',
		es: 'ahora',
		example: 'いまなんじですか。',
		example_en: 'What time is it now?',
		example_es: '¿Qué hora es ahora?',
		sort_order: 34
	},
	{
		jp: 'きょう',
		romaji: 'kyou',
		en: 'today',
		es: 'hoy',
		example: 'きょうは月曜日です。',
		example_en: 'Today is Monday.',
		example_es: 'Hoy es lunes.',
		sort_order: 35
	},
	{
		jp: 'あした',
		romaji: 'ashita',
		en: 'tomorrow',
		es: 'mañana (día siguiente)',
		example: 'あしたは休みです。',
		example_en: 'Tomorrow is a day off.',
		example_es: 'Mañana es día libre.',
		sort_order: 36
	},
	{
		jp: 'きのう',
		romaji: 'kinou',
		en: 'yesterday',
		es: 'ayer',
		example: 'きのうは楽しかったです。',
		example_en: 'Yesterday was fun.',
		example_es: 'Ayer fue divertido.',
		sort_order: 37
	},
	{
		jp: 'まいにち',
		romaji: 'mainichi',
		en: 'every day',
		es: 'todos los días',
		example: 'まいにち日本語を勉強します。',
		example_en: 'I study Japanese every day.',
		example_es: 'Estudio japonés todos los días.',
		sort_order: 38
	},
	{
		jp: 'あさ',
		romaji: 'asa',
		en: 'morning',
		es: 'mañana (por la mañana)',
		example: 'あさごはんを食べます。',
		example_en: 'I eat breakfast.',
		example_es: 'Desayuno.',
		sort_order: 39
	},
	{
		jp: 'ひる',
		romaji: 'hiru',
		en: 'noon / daytime',
		es: 'mediodía',
		example: 'ひるごはんはカレーです。',
		example_en: 'Lunch is curry.',
		example_es: 'El almuerzo es curry.',
		sort_order: 40
	},
	{
		jp: 'よる',
		romaji: 'yoru',
		en: 'night / evening',
		es: 'noche',
		example: 'よるはすしを食べます。',
		example_en: 'I eat sushi at night.',
		example_es: 'Como sushi por la noche.',
		sort_order: 41
	},
	{
		jp: 'ことし',
		romaji: 'kotoshi',
		en: 'this year',
		es: 'este año',
		example: 'ことしは二千二十五年です。',
		example_en: 'This year is 2025.',
		example_es: 'Este año es 2025.',
		sort_order: 42
	},

	// ── Familia / Family ─────────────────────────────────────────────────────
	{
		jp: 'おとうさん',
		romaji: 'otousan',
		en: "father (someone else's)",
		es: 'padre (de otro)',
		example: 'おとうさんはどこですか。',
		example_en: 'Where is your father?',
		example_es: '¿Dónde está tu padre?',
		sort_order: 43
	},
	{
		jp: 'おかあさん',
		romaji: 'okaasan',
		en: "mother (someone else's)",
		es: 'madre (de otro)',
		example: 'おかあさんは先生です。',
		example_en: 'Your mother is a teacher.',
		example_es: 'Tu madre es profesora.',
		sort_order: 44
	},
	{
		jp: 'おにいさん',
		romaji: 'oniisan',
		en: "older brother (someone else's)",
		es: 'hermano mayor (de otro)',
		example: 'おにいさんがいますか。',
		example_en: 'Do you have an older brother?',
		example_es: '¿Tienes un hermano mayor?',
		sort_order: 45
	},
	{
		jp: 'おねえさん',
		romaji: 'oneesan',
		en: "older sister (someone else's)",
		es: 'hermana mayor (de otro)',
		example: 'おねえさんはかわいいです。',
		example_en: 'Your older sister is cute.',
		example_es: 'Tu hermana mayor es bonita.',
		sort_order: 46
	},
	{
		jp: 'おとうと',
		romaji: 'otouto',
		en: 'younger brother',
		es: 'hermano menor',
		example: 'おとうとは中学生です。',
		example_en: 'My younger brother is in middle school.',
		example_es: 'Mi hermano menor está en la secundaria.',
		sort_order: 47
	},
	{
		jp: 'いもうと',
		romaji: 'imouto',
		en: 'younger sister',
		es: 'hermana menor',
		example: 'いもうとはかわいいです。',
		example_en: 'My younger sister is cute.',
		example_es: 'Mi hermana menor es linda.',
		sort_order: 48
	},
	{
		jp: 'こども',
		romaji: 'kodomo',
		en: 'child / children',
		es: 'niño / niños',
		example: 'こどもが好きです。',
		example_en: 'I like children.',
		example_es: 'Me gustan los niños.',
		sort_order: 49
	},
	{
		jp: 'かぞく',
		romaji: 'kazoku',
		en: 'family',
		es: 'familia',
		example: 'かぞくは四人です。',
		example_en: 'My family has four members.',
		example_es: 'Mi familia tiene cuatro miembros.',
		sort_order: 50
	},
	{
		jp: 'ともだち',
		romaji: 'tomodachi',
		en: 'friend',
		es: 'amigo',
		example: 'ともだちとえいがを見ます。',
		example_en: 'I watch movies with friends.',
		example_es: 'Veo películas con amigos.',
		sort_order: 51
	},

	// ── Comida / Food ────────────────────────────────────────────────────────
	{
		jp: 'ごはん',
		romaji: 'gohan',
		en: 'rice / meal',
		es: 'arroz / comida',
		example: 'ごはんを食べます。',
		example_en: 'I eat rice.',
		example_es: 'Como arroz.',
		sort_order: 52
	},
	{
		jp: 'パン',
		romaji: 'pan',
		en: 'bread',
		es: 'pan',
		example: 'あさはパンを食べます。',
		example_en: 'I eat bread in the morning.',
		example_es: 'Como pan por la mañana.',
		sort_order: 53
	},
	{
		jp: 'さかな',
		romaji: 'sakana',
		en: 'fish',
		es: 'pescado',
		example: 'さかなが好きです。',
		example_en: 'I like fish.',
		example_es: 'Me gusta el pescado.',
		sort_order: 54
	},
	{
		jp: 'にく',
		romaji: 'niku',
		en: 'meat',
		es: 'carne',
		example: 'にくを食べます。',
		example_en: 'I eat meat.',
		example_es: 'Como carne.',
		sort_order: 55
	},
	{
		jp: 'たまご',
		romaji: 'tamago',
		en: 'egg',
		es: 'huevo',
		example: 'たまごが二つあります。',
		example_en: 'There are two eggs.',
		example_es: 'Hay dos huevos.',
		sort_order: 56
	},
	{
		jp: 'やさい',
		romaji: 'yasai',
		en: 'vegetables',
		es: 'verduras',
		example: 'やさいが好きじゃないです。',
		example_en: "I don't like vegetables.",
		example_es: 'No me gustan las verduras.',
		sort_order: 57
	},
	{
		jp: 'くだもの',
		romaji: 'kudamono',
		en: 'fruit',
		es: 'fruta',
		example: 'くだものは体にいいです。',
		example_en: 'Fruit is good for your body.',
		example_es: 'La fruta es buena para el cuerpo.',
		sort_order: 58
	},
	{
		jp: 'みず',
		romaji: 'mizu',
		en: 'water',
		es: 'agua',
		example: 'みずを飲みます。',
		example_en: 'I drink water.',
		example_es: 'Bebo agua.',
		sort_order: 59
	},
	{
		jp: 'おちゃ',
		romaji: 'ocha',
		en: 'tea (Japanese green tea)',
		es: 'té (verde japonés)',
		example: 'おちゃをどうぞ。',
		example_en: 'Please have some tea.',
		example_es: 'Por favor, tome un poco de té.',
		sort_order: 60
	},
	{
		jp: 'コーヒー',
		romaji: 'koohii',
		en: 'coffee',
		es: 'café',
		example: 'まいあさコーヒーを飲みます。',
		example_en: 'I drink coffee every morning.',
		example_es: 'Bebo café todas las mañanas.',
		sort_order: 61
	},
	{
		jp: 'ぎゅうにゅう',
		romaji: 'gyuunyuu',
		en: 'milk',
		es: 'leche',
		example: 'ぎゅうにゅうが好きです。',
		example_en: 'I like milk.',
		example_es: 'Me gusta la leche.',
		sort_order: 62
	},
	{
		jp: 'すし',
		romaji: 'sushi',
		en: 'sushi',
		es: 'sushi',
		example: 'すしを食べたいです。',
		example_en: 'I want to eat sushi.',
		example_es: 'Quiero comer sushi.',
		sort_order: 63
	},
	{
		jp: 'ラーメン',
		romaji: 'raamen',
		en: 'ramen',
		es: 'ramen',
		example: 'ラーメンがおいしいです。',
		example_en: 'The ramen is delicious.',
		example_es: 'El ramen está delicioso.',
		sort_order: 64
	},

	// ── Colores / Colors ─────────────────────────────────────────────────────
	{
		jp: 'しろ',
		romaji: 'shiro',
		en: 'white',
		es: 'blanco',
		example: 'しろいシャツを着ます。',
		example_en: 'I wear a white shirt.',
		example_es: 'Me pongo una camisa blanca.',
		sort_order: 65
	},
	{
		jp: 'くろ',
		romaji: 'kuro',
		en: 'black',
		es: 'negro',
		example: 'くろい犬です。',
		example_en: 'It is a black dog.',
		example_es: 'Es un perro negro.',
		sort_order: 66
	},
	{
		jp: 'あか',
		romaji: 'aka',
		en: 'red',
		es: 'rojo',
		example: 'あかいはなです。',
		example_en: 'It is a red flower.',
		example_es: 'Es una flor roja.',
		sort_order: 67
	},
	{
		jp: 'あお',
		romaji: 'ao',
		en: 'blue',
		es: 'azul',
		example: 'そらはあおいです。',
		example_en: 'The sky is blue.',
		example_es: 'El cielo es azul.',
		sort_order: 68
	},
	{
		jp: 'きいろ',
		romaji: 'kiiro',
		en: 'yellow',
		es: 'amarillo',
		example: 'きいろいバナナです。',
		example_en: 'It is a yellow banana.',
		example_es: 'Es un plátano amarillo.',
		sort_order: 69
	},
	{
		jp: 'みどり',
		romaji: 'midori',
		en: 'green',
		es: 'verde',
		example: 'みどりの木です。',
		example_en: 'It is a green tree.',
		example_es: 'Es un árbol verde.',
		sort_order: 70
	},

	// ── Lugares / Places ─────────────────────────────────────────────────────
	{
		jp: 'がっこう',
		romaji: 'gakkou',
		en: 'school',
		es: 'escuela',
		example: 'がっこうへ行きます。',
		example_en: 'I go to school.',
		example_es: 'Voy a la escuela.',
		sort_order: 71
	},
	{
		jp: 'いえ / うち',
		romaji: 'ie / uchi',
		en: 'house / home',
		es: 'casa / hogar',
		example: 'うちに帰ります。',
		example_en: 'I return home.',
		example_es: 'Vuelvo a casa.',
		sort_order: 72
	},
	{
		jp: 'えき',
		romaji: 'eki',
		en: 'train station',
		es: 'estación de tren',
		example: 'えきはどこですか。',
		example_en: 'Where is the station?',
		example_es: '¿Dónde está la estación?',
		sort_order: 73
	},
	{
		jp: 'みせ',
		romaji: 'mise',
		en: 'store / shop',
		es: 'tienda',
		example: 'みせでかいます。',
		example_en: 'I buy it at the store.',
		example_es: 'Lo compro en la tienda.',
		sort_order: 74
	},
	{
		jp: 'びょういん',
		romaji: 'byouin',
		en: 'hospital',
		es: 'hospital',
		example: 'びょういんへ行きます。',
		example_en: 'I go to the hospital.',
		example_es: 'Voy al hospital.',
		sort_order: 75
	},
	{
		jp: 'こうえん',
		romaji: 'kouen',
		en: 'park',
		es: 'parque',
		example: 'こうえんで遊びます。',
		example_en: 'I play in the park.',
		example_es: 'Juego en el parque.',
		sort_order: 76
	},
	{
		jp: 'としょかん',
		romaji: 'toshokan',
		en: 'library',
		es: 'biblioteca',
		example: 'としょかんで本を読みます。',
		example_en: 'I read books in the library.',
		example_es: 'Leo libros en la biblioteca.',
		sort_order: 77
	},
	{
		jp: 'レストラン',
		romaji: 'resutoran',
		en: 'restaurant',
		es: 'restaurante',
		example: 'レストランでたべます。',
		example_en: 'I eat at a restaurant.',
		example_es: 'Como en un restaurante.',
		sort_order: 78
	},
	{
		jp: 'スーパー',
		romaji: 'suupaa',
		en: 'supermarket',
		es: 'supermercado',
		example: 'スーパーでやさいをかいます。',
		example_en: 'I buy vegetables at the supermarket.',
		example_es: 'Compro verduras en el supermercado.',
		sort_order: 79
	},
	{
		jp: 'ぎんこう',
		romaji: 'ginkou',
		en: 'bank',
		es: 'banco',
		example: 'ぎんこうはどこですか。',
		example_en: 'Where is the bank?',
		example_es: '¿Dónde está el banco?',
		sort_order: 80
	},

	// ── Transporte / Transport ───────────────────────────────────────────────
	{
		jp: 'でんしゃ',
		romaji: 'densha',
		en: 'train (electric)',
		es: 'tren eléctrico',
		example: 'でんしゃで行きます。',
		example_en: 'I go by train.',
		example_es: 'Voy en tren.',
		sort_order: 81
	},
	{
		jp: 'バス',
		romaji: 'basu',
		en: 'bus',
		es: 'autobús',
		example: 'バスにのります。',
		example_en: 'I take the bus.',
		example_es: 'Tomo el autobús.',
		sort_order: 82
	},
	{
		jp: 'くるま',
		romaji: 'kuruma',
		en: 'car',
		es: 'coche',
		example: 'くるまで来ます。',
		example_en: 'I come by car.',
		example_es: 'Vengo en coche.',
		sort_order: 83
	},
	{
		jp: 'じてんしゃ',
		romaji: 'jitensha',
		en: 'bicycle',
		es: 'bicicleta',
		example: 'じてんしゃで学校へ行きます。',
		example_en: 'I go to school by bicycle.',
		example_es: 'Voy a la escuela en bicicleta.',
		sort_order: 84
	},
	{
		jp: 'タクシー',
		romaji: 'takushii',
		en: 'taxi',
		es: 'taxi',
		example: 'タクシーをよびます。',
		example_en: 'I call a taxi.',
		example_es: 'Llamo un taxi.',
		sort_order: 85
	},
	{
		jp: 'ひこうき',
		romaji: 'hikouki',
		en: 'airplane',
		es: 'avión',
		example: 'ひこうきでにほんへいきます。',
		example_en: 'I go to Japan by airplane.',
		example_es: 'Voy a Japón en avión.',
		sort_order: 86
	},

	// ── Verbos comunes / Common verbs ────────────────────────────────────────
	{
		jp: 'たべる',
		romaji: 'taberu',
		en: 'to eat',
		es: 'comer',
		example: 'すしを食べます。',
		example_en: 'I eat sushi.',
		example_es: 'Como sushi.',
		sort_order: 87
	},
	{
		jp: 'のむ',
		romaji: 'nomu',
		en: 'to drink',
		es: 'beber',
		example: 'みずを飲みます。',
		example_en: 'I drink water.',
		example_es: 'Bebo agua.',
		sort_order: 88
	},
	{
		jp: 'みる',
		romaji: 'miru',
		en: 'to see / watch',
		es: 'ver / mirar',
		example: 'えいがを見ます。',
		example_en: 'I watch a movie.',
		example_es: 'Veo una película.',
		sort_order: 89
	},
	{
		jp: 'きく',
		romaji: 'kiku',
		en: 'to listen / ask',
		es: 'escuchar / preguntar',
		example: 'おんがくをききます。',
		example_en: 'I listen to music.',
		example_es: 'Escucho música.',
		sort_order: 90
	},
	{
		jp: 'はなす',
		romaji: 'hanasu',
		en: 'to speak / talk',
		es: 'hablar',
		example: '日本語を話します。',
		example_en: 'I speak Japanese.',
		example_es: 'Hablo japonés.',
		sort_order: 91
	},
	{
		jp: 'よむ',
		romaji: 'yomu',
		en: 'to read',
		es: 'leer',
		example: 'ほんをよみます。',
		example_en: 'I read a book.',
		example_es: 'Leo un libro.',
		sort_order: 92
	},
	{
		jp: 'かく',
		romaji: 'kaku',
		en: 'to write',
		es: 'escribir',
		example: 'てがみをかきます。',
		example_en: 'I write a letter.',
		example_es: 'Escribo una carta.',
		sort_order: 93
	},
	{
		jp: 'かう',
		romaji: 'kau',
		en: 'to buy',
		es: 'comprar',
		example: 'ほんをかいます。',
		example_en: 'I buy a book.',
		example_es: 'Compro un libro.',
		sort_order: 94
	},
	{
		jp: 'いく',
		romaji: 'iku',
		en: 'to go',
		es: 'ir',
		example: 'がっこうへいきます。',
		example_en: 'I go to school.',
		example_es: 'Voy a la escuela.',
		sort_order: 95
	},
	{
		jp: 'くる',
		romaji: 'kuru',
		en: 'to come',
		es: 'venir',
		example: 'いえにきます。',
		example_en: 'I come home.',
		example_es: 'Vengo a casa.',
		sort_order: 96
	},
	{
		jp: 'かえる',
		romaji: 'kaeru',
		en: 'to return home',
		es: 'regresar a casa',
		example: 'ろくじにかえります。',
		example_en: 'I return home at six.',
		example_es: 'Regreso a casa a las seis.',
		sort_order: 97
	},
	{
		jp: 'ねる',
		romaji: 'neru',
		en: 'to sleep / go to bed',
		es: 'dormir / acostarse',
		example: 'じゅういちじにねます。',
		example_en: 'I go to bed at eleven.',
		example_es: 'Me acuesto a las once.',
		sort_order: 98
	},
	{
		jp: 'おきる',
		romaji: 'okiru',
		en: 'to wake up / get up',
		es: 'despertarse / levantarse',
		example: 'しちじにおきます。',
		example_en: 'I wake up at seven.',
		example_es: 'Me levanto a las siete.',
		sort_order: 99
	},
	{
		jp: 'あるく',
		romaji: 'aruku',
		en: 'to walk',
		es: 'caminar',
		example: 'まいにちあるきます。',
		example_en: 'I walk every day.',
		example_es: 'Camino todos los días.',
		sort_order: 100
	},
	{
		jp: 'はしる',
		romaji: 'hashiru',
		en: 'to run',
		es: 'correr',
		example: 'こうえんではしります。',
		example_en: 'I run in the park.',
		example_es: 'Corro en el parque.',
		sort_order: 101
	},
	{
		jp: 'はたらく',
		romaji: 'hataraku',
		en: 'to work',
		es: 'trabajar',
		example: 'かいしゃではたらきます。',
		example_en: 'I work at a company.',
		example_es: 'Trabajo en una empresa.',
		sort_order: 102
	},
	{
		jp: 'べんきょうする',
		romaji: 'benkyou suru',
		en: 'to study',
		es: 'estudiar',
		example: '日本語を勉強します。',
		example_en: 'I study Japanese.',
		example_es: 'Estudio japonés.',
		sort_order: 103
	},
	{
		jp: 'わかる',
		romaji: 'wakaru',
		en: 'to understand',
		es: 'entender / comprender',
		example: 'にほんごがわかります。',
		example_en: 'I understand Japanese.',
		example_es: 'Entiendo japonés.',
		sort_order: 104
	},
	{
		jp: 'ある',
		romaji: 'aru',
		en: 'to exist / have (inanimate)',
		es: 'existir / haber (inanimado)',
		example: 'ほんがあります。',
		example_en: 'There is a book.',
		example_es: 'Hay un libro.',
		sort_order: 105
	},
	{
		jp: 'いる',
		romaji: 'iru',
		en: 'to exist / be (animate)',
		es: 'existir / estar (animado)',
		example: 'ねこがいます。',
		example_en: 'There is a cat.',
		example_es: 'Hay un gato.',
		sort_order: 106
	},
	{
		jp: 'あう',
		romaji: 'au',
		en: 'to meet',
		es: 'encontrarse / verse',
		example: 'ともだちにあいます。',
		example_en: 'I meet a friend.',
		example_es: 'Me encuentro con un amigo.',
		sort_order: 107
	},
	{
		jp: 'おしえる',
		romaji: 'oshieru',
		en: 'to teach / tell',
		es: 'enseñar / decir',
		example: '日本語をおしえます。',
		example_en: 'I teach Japanese.',
		example_es: 'Enseño japonés.',
		sort_order: 108
	},
	{
		jp: 'きる',
		romaji: 'kiru',
		en: 'to wear (on body)',
		es: 'ponerse / llevar (ropa)',
		example: 'シャツをきます。',
		example_en: 'I put on a shirt.',
		example_es: 'Me pongo una camisa.',
		sort_order: 109
	},

	// ── Adjetivos / Adjectives ───────────────────────────────────────────────
	{
		jp: 'おおきい',
		romaji: 'ookii',
		en: 'big / large',
		es: 'grande',
		example: 'おおきいいえです。',
		example_en: 'It is a big house.',
		example_es: 'Es una casa grande.',
		sort_order: 110
	},
	{
		jp: 'ちいさい',
		romaji: 'chiisai',
		en: 'small / little',
		es: 'pequeño',
		example: 'ちいさいねこです。',
		example_en: 'It is a small cat.',
		example_es: 'Es un gato pequeño.',
		sort_order: 111
	},
	{
		jp: 'あたらしい',
		romaji: 'atarashii',
		en: 'new',
		es: 'nuevo',
		example: 'あたらしいくるまです。',
		example_en: 'It is a new car.',
		example_es: 'Es un coche nuevo.',
		sort_order: 112
	},
	{
		jp: 'ふるい',
		romaji: 'furui',
		en: 'old (objects)',
		es: 'viejo / antiguo',
		example: 'ふるいほんです。',
		example_en: 'It is an old book.',
		example_es: 'Es un libro viejo.',
		sort_order: 113
	},
	{
		jp: 'たかい',
		romaji: 'takai',
		en: 'expensive / tall / high',
		es: 'caro / alto',
		example: 'このかばんはたかいです。',
		example_en: 'This bag is expensive.',
		example_es: 'Esta bolsa es cara.',
		sort_order: 114
	},
	{
		jp: 'やすい',
		romaji: 'yasui',
		en: 'cheap / inexpensive',
		es: 'barato',
		example: 'このみせはやすいです。',
		example_en: 'This store is cheap.',
		example_es: 'Esta tienda es barata.',
		sort_order: 115
	},
	{
		jp: 'あつい',
		romaji: 'atsui',
		en: 'hot (temperature)',
		es: 'caliente (temperatura)',
		example: 'なつはあついです。',
		example_en: 'Summer is hot.',
		example_es: 'El verano es caluroso.',
		sort_order: 116
	},
	{
		jp: 'さむい',
		romaji: 'samui',
		en: 'cold (weather)',
		es: 'frío (tiempo)',
		example: 'ふゆはさむいです。',
		example_en: 'Winter is cold.',
		example_es: 'El invierno es frío.',
		sort_order: 117
	},
	{
		jp: 'つめたい',
		romaji: 'tsumetai',
		en: 'cold (to touch / drink)',
		es: 'frío (al tacto)',
		example: 'みずがつめたいです。',
		example_en: 'The water is cold.',
		example_es: 'El agua está fría.',
		sort_order: 118
	},
	{
		jp: 'おいしい',
		romaji: 'oishii',
		en: 'delicious / tasty',
		es: 'delicioso / rico',
		example: 'このラーメンはおいしいです。',
		example_en: 'This ramen is delicious.',
		example_es: 'Este ramen está delicioso.',
		sort_order: 119
	},
	{
		jp: 'いい / よい',
		romaji: 'ii / yoi',
		en: 'good',
		es: 'bueno',
		example: 'いいてんきです。',
		example_en: 'The weather is good.',
		example_es: 'El tiempo es bueno.',
		sort_order: 120
	},
	{
		jp: 'わるい',
		romaji: 'warui',
		en: 'bad',
		es: 'malo',
		example: 'てんきがわるいです。',
		example_en: 'The weather is bad.',
		example_es: 'El tiempo es malo.',
		sort_order: 121
	},
	{
		jp: 'むずかしい',
		romaji: 'muzukashii',
		en: 'difficult / hard',
		es: 'difícil',
		example: '日本語はむずかしいです。',
		example_en: 'Japanese is difficult.',
		example_es: 'El japonés es difícil.',
		sort_order: 122
	},
	{
		jp: 'やさしい',
		romaji: 'yasashii',
		en: 'easy / kind / gentle',
		es: 'fácil / amable',
		example: 'このもんだいはやさしいです。',
		example_en: 'This problem is easy.',
		example_es: 'Este problema es fácil.',
		sort_order: 123
	},
	{
		jp: 'おもしろい',
		romaji: 'omoshiroi',
		en: 'interesting / funny',
		es: 'interesante / divertido',
		example: 'このほんはおもしろいです。',
		example_en: 'This book is interesting.',
		example_es: 'Este libro es interesante.',
		sort_order: 124
	},
	{
		jp: 'すき (な)',
		romaji: 'suki (na)',
		en: 'liked / favorite',
		es: 'que gusta / favorito',
		example: 'すしがすきです。',
		example_en: 'I like sushi.',
		example_es: 'Me gusta el sushi.',
		sort_order: 125
	},
	{
		jp: 'きらい (な)',
		romaji: 'kirai (na)',
		en: 'disliked',
		es: 'que no gusta',
		example: 'むしがきらいです。',
		example_en: 'I dislike insects.',
		example_es: 'No me gustan los insectos.',
		sort_order: 126
	},
	{
		jp: 'げんき (な)',
		romaji: 'genki (na)',
		en: 'healthy / energetic / fine',
		es: 'sano / con energía / bien',
		example: 'げんきですか。',
		example_en: 'Are you well?',
		example_es: '¿Estás bien?',
		sort_order: 127
	},
	{
		jp: 'しずか (な)',
		romaji: 'shizuka (na)',
		en: 'quiet / peaceful',
		es: 'tranquilo / silencioso',
		example: 'このへやはしずかです。',
		example_en: 'This room is quiet.',
		example_es: 'Esta habitación es tranquila.',
		sort_order: 128
	},
	{
		jp: 'にぎやか (な)',
		romaji: 'nigiyaka (na)',
		en: 'lively / bustling',
		es: 'animado / bullicioso',
		example: 'まちがにぎやかです。',
		example_en: 'The town is lively.',
		example_es: 'La ciudad está animada.',
		sort_order: 129
	},

	// ── Naturaleza / Nature ──────────────────────────────────────────────────
	{
		jp: 'やま',
		romaji: 'yama',
		en: 'mountain',
		es: 'montaña',
		example: 'やまにのぼります。',
		example_en: 'I climb the mountain.',
		example_es: 'Subo la montaña.',
		sort_order: 130
	},
	{
		jp: 'かわ',
		romaji: 'kawa',
		en: 'river',
		es: 'río',
		example: 'かわはながいです。',
		example_en: 'The river is long.',
		example_es: 'El río es largo.',
		sort_order: 131
	},
	{
		jp: 'うみ',
		romaji: 'umi',
		en: 'sea / ocean',
		es: 'mar',
		example: 'うみでおよぎます。',
		example_en: 'I swim in the sea.',
		example_es: 'Nado en el mar.',
		sort_order: 132
	},
	{
		jp: 'そら',
		romaji: 'sora',
		en: 'sky',
		es: 'cielo',
		example: 'そらがあおいです。',
		example_en: 'The sky is blue.',
		example_es: 'El cielo es azul.',
		sort_order: 133
	},
	{
		jp: 'あめ',
		romaji: 'ame',
		en: 'rain',
		es: 'lluvia',
		example: 'あめがふります。',
		example_en: 'It rains.',
		example_es: 'Llueve.',
		sort_order: 134
	},
	{
		jp: 'ゆき',
		romaji: 'yuki',
		en: 'snow',
		es: 'nieve',
		example: 'ゆきがふります。',
		example_en: 'It snows.',
		example_es: 'Nieva.',
		sort_order: 135
	},
	{
		jp: 'はな',
		romaji: 'hana',
		en: 'flower',
		es: 'flor',
		example: 'はながきれいです。',
		example_en: 'The flowers are beautiful.',
		example_es: 'Las flores son hermosas.',
		sort_order: 136
	},
	{
		jp: 'さくら',
		romaji: 'sakura',
		en: 'cherry blossom',
		es: 'flor de cerezo',
		example: 'さくらがさきます。',
		example_en: 'The cherry blossoms bloom.',
		example_es: 'Florecen los cerezos.',
		sort_order: 137
	},

	// ── Objetos / Objects ────────────────────────────────────────────────────
	{
		jp: 'ほん',
		romaji: 'hon',
		en: 'book',
		es: 'libro',
		example: 'ほんをよみます。',
		example_en: 'I read a book.',
		example_es: 'Leo un libro.',
		sort_order: 138
	},
	{
		jp: 'でんわ',
		romaji: 'denwa',
		en: 'telephone',
		es: 'teléfono',
		example: 'でんわをします。',
		example_en: 'I make a phone call.',
		example_es: 'Hago una llamada.',
		sort_order: 139
	},
	{
		jp: 'けいたい',
		romaji: 'keitai',
		en: 'cell phone',
		es: 'celular / móvil',
		example: 'けいたいがあります。',
		example_en: 'I have a cell phone.',
		example_es: 'Tengo un celular.',
		sort_order: 140
	},
	{
		jp: 'テレビ',
		romaji: 'terebi',
		en: 'television',
		es: 'televisión',
		example: 'テレビをみます。',
		example_en: 'I watch television.',
		example_es: 'Veo la televisión.',
		sort_order: 141
	},
	{
		jp: 'かさ',
		romaji: 'kasa',
		en: 'umbrella',
		es: 'paraguas',
		example: 'かさをかします。',
		example_en: 'I lend an umbrella.',
		example_es: 'Presto un paraguas.',
		sort_order: 142
	},
	{
		jp: 'とけい',
		romaji: 'tokei',
		en: 'watch / clock',
		es: 'reloj',
		example: 'とけいをかいました。',
		example_en: 'I bought a watch.',
		example_es: 'Compré un reloj.',
		sort_order: 143
	},
	{
		jp: 'おかね',
		romaji: 'okane',
		en: 'money',
		es: 'dinero',
		example: 'おかねがありません。',
		example_en: "I don't have money.",
		example_es: 'No tengo dinero.',
		sort_order: 144
	},
	{
		jp: 'かばん',
		romaji: 'kaban',
		en: 'bag',
		es: 'bolsa / mochila',
		example: 'かばんにほんがあります。',
		example_en: 'There is a book in the bag.',
		example_es: 'Hay un libro en la bolsa.',
		sort_order: 145
	},

	// ── Estaciones / Seasons ─────────────────────────────────────────────────
	{
		jp: 'はる',
		romaji: 'haru',
		en: 'spring',
		es: 'primavera',
		example: 'はるがすきです。',
		example_en: 'I like spring.',
		example_es: 'Me gusta la primavera.',
		sort_order: 146
	},
	{
		jp: 'なつ',
		romaji: 'natsu',
		en: 'summer',
		es: 'verano',
		example: 'なつはあついです。',
		example_en: 'Summer is hot.',
		example_es: 'El verano es caluroso.',
		sort_order: 147
	},
	{
		jp: 'あき',
		romaji: 'aki',
		en: 'autumn / fall',
		es: 'otoño',
		example: 'あきにこうようをみます。',
		example_en: 'I view autumn leaves in fall.',
		example_es: 'Veo las hojas de otoño en el otoño.',
		sort_order: 148
	},
	{
		jp: 'ふゆ',
		romaji: 'fuyu',
		en: 'winter',
		es: 'invierno',
		example: 'ふゆはさむいです。',
		example_en: 'Winter is cold.',
		example_es: 'El invierno es frío.',
		sort_order: 149
	}
];
