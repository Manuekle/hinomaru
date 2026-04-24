import type { GrammarPoint } from '../types';

// N5 Grammar — 30 core patterns
export const grammar: GrammarPoint[] = [
	{
		pattern: '〜は〜です',
		meaning_en: 'A is B (polite affirmative)',
		meaning_es: 'A es B (afirmación formal)',
		usage: 'Topic は noun/adjective です。 — the most basic sentence pattern.',
		examples: [
			{ jp: 'わたしは学生です。', en: 'I am a student.', es: 'Soy estudiante.' },
			{ jp: 'これはほんです。', en: 'This is a book.', es: 'Esto es un libro.' },
			{ jp: 'きょうはげつようびです。', en: 'Today is Monday.', es: 'Hoy es lunes.' }
		],
		sort_order: 1
	},
	{
		pattern: '〜は〜ではありません',
		meaning_en: 'A is not B (polite negative)',
		meaning_es: 'A no es B (negación formal)',
		usage: 'Topic は noun ではありません (or じゃありません in casual speech).',
		examples: [
			{ jp: 'わたしは先生ではありません。', en: 'I am not a teacher.', es: 'No soy profesor.' },
			{ jp: 'これはペンじゃありません。', en: 'This is not a pen.', es: 'Esto no es un bolígrafo.' }
		],
		sort_order: 2
	},
	{
		pattern: '〜は〜ですか',
		meaning_en: 'Is A B? (yes/no question)',
		meaning_es: '¿Es A B? (pregunta sí/no)',
		usage:
			'Add か to the end of a statement to make a question. No rising intonation needed in writing.',
		examples: [
			{ jp: 'あなたは学生ですか。', en: 'Are you a student?', es: '¿Eres estudiante?' },
			{ jp: 'これはすしですか。', en: 'Is this sushi?', es: '¿Esto es sushi?' }
		],
		sort_order: 3
	},
	{
		pattern: 'これ / それ / あれ',
		meaning_en: 'This / That / That over there',
		meaning_es: 'Esto / Eso / Aquello',
		usage:
			'これ = near speaker, それ = near listener, あれ = far from both. Used as standalone pronouns.',
		examples: [
			{ jp: 'これはなんですか。', en: 'What is this?', es: '¿Qué es esto?' },
			{ jp: 'それはわたしのほんです。', en: 'That is my book.', es: 'Ese es mi libro.' },
			{
				jp: 'あれはなんのたてものですか。',
				en: 'What building is that over there?',
				es: '¿Qué edificio es ese de allá?'
			}
		],
		sort_order: 4
	},
	{
		pattern: 'この / その / あの + N',
		meaning_en: 'This N / That N / That N over there',
		meaning_es: 'Este N / Ese N / Aquel N',
		usage:
			'Used before a noun (not standalone). この本 = this book, その本 = that book (near you).',
		examples: [
			{
				jp: 'このほんはおもしろいです。',
				en: 'This book is interesting.',
				es: 'Este libro es interesante.'
			},
			{ jp: 'そのかばんはたかいです。', en: 'That bag is expensive.', es: 'Esa bolsa es cara.' },
			{ jp: 'あのひとはだれですか。', en: 'Who is that person?', es: '¿Quién es esa persona?' }
		],
		sort_order: 5
	},
	{
		pattern: 'N1のN2',
		meaning_en: "N2 of N1 / N1's N2",
		meaning_es: 'N2 de N1 / el N2 de N1',
		usage: 'の connects two nouns showing possession, relationship, or description.',
		examples: [
			{ jp: 'わたしのほん。', en: 'My book.', es: 'Mi libro.' },
			{ jp: '日本ごのせんせい。', en: 'Japanese teacher.', es: 'Profesor de japonés.' },
			{
				jp: 'これはだれのかさですか。',
				en: 'Whose umbrella is this?',
				es: '¿De quién es este paraguas?'
			}
		],
		sort_order: 6
	},
	{
		pattern: 'N1とN2',
		meaning_en: 'N1 and N2 (exhaustive list)',
		meaning_es: 'N1 y N2 (lista completa)',
		usage: 'と connects nouns in a complete list. For verbs/actions, use て-form instead.',
		examples: [
			{
				jp: 'すしとさしみがすきです。',
				en: 'I like sushi and sashimi.',
				es: 'Me gustan el sushi y el sashimi.'
			},
			{
				jp: 'はとえんぴつをかいました。',
				en: 'I bought chopsticks and a pencil.',
				es: 'Compré palillos y un lápiz.'
			}
		],
		sort_order: 7
	},
	{
		pattern: 'Vます / Vません',
		meaning_en: 'Polite present/future affirmative / negative',
		meaning_es: 'Presente/futuro afirmativo / negativo (formal)',
		usage:
			'ます = polite present/future (I do / I will do). ません = polite negative (I do not / will not).',
		examples: [
			{
				jp: 'まいにち日本ごをべんきょうします。',
				en: 'I study Japanese every day.',
				es: 'Estudio japonés todos los días.'
			},
			{ jp: 'にくはたべません。', en: "I don't eat meat.", es: 'No como carne.' }
		],
		sort_order: 8
	},
	{
		pattern: 'Vました / Vませんでした',
		meaning_en: 'Polite past affirmative / negative',
		meaning_es: 'Pasado afirmativo / negativo (formal)',
		usage: 'ました = polite past (I did). ませんでした = polite past negative (I did not).',
		examples: [
			{ jp: 'きのうすしをたべました。', en: 'Yesterday I ate sushi.', es: 'Ayer comí sushi.' },
			{ jp: 'えいがはみませんでした。', en: "I didn't watch the movie.", es: 'No vi la película.' }
		],
		sort_order: 9
	},
	{
		pattern: 'Vてください',
		meaning_en: 'Please do V (polite request)',
		meaning_es: 'Por favor haz V (petición formal)',
		usage: 'て-form of verb + ください. The て-form varies by verb group.',
		examples: [
			{ jp: 'みてください。', en: 'Please look.', es: 'Por favor mira.' },
			{ jp: 'たってください。', en: 'Please stand up.', es: 'Por favor levántate.' },
			{
				jp: 'ゆっくりはなしてください。',
				en: 'Please speak slowly.',
				es: 'Por favor habla despacio.'
			}
		],
		sort_order: 10
	},
	{
		pattern: '〜ています',
		meaning_en: 'Currently doing V / ongoing state',
		meaning_es: 'Estar haciendo V / estado continuo',
		usage:
			'て-form + います. Expresses an action in progress or a resulting state (like English -ing).',
		examples: [
			{ jp: 'たべています。', en: 'I am eating.', es: 'Estoy comiendo.' },
			{
				jp: 'にほんごをべんきょうしています。',
				en: 'I am studying Japanese.',
				es: 'Estoy estudiando japonés.'
			},
			{ jp: 'けっこんしています。', en: 'I am married.', es: 'Estoy casado/a.' }
		],
		sort_order: 11
	},
	{
		pattern: '〜たいです',
		meaning_en: 'Want to do V',
		meaning_es: 'Querer hacer V',
		usage: "Verb stem (ます-form without ます) + たいです. Expresses the speaker's desire.",
		examples: [
			{ jp: 'にほんへいきたいです。', en: 'I want to go to Japan.', es: 'Quiero ir a Japón.' },
			{ jp: 'すしをたべたいです。', en: 'I want to eat sushi.', es: 'Quiero comer sushi.' },
			{
				jp: 'にほんごをはなしたいです。',
				en: 'I want to speak Japanese.',
				es: 'Quiero hablar japonés.'
			}
		],
		sort_order: 12
	},
	{
		pattern: 'Vましょう / Vましょうか',
		meaning_en: "Let's do V / Shall we do V?",
		meaning_es: 'Vamos a hacer V / ¿Hacemos V?',
		usage:
			'ましょう = invitation/suggestion. ましょうか = offering to do something for someone or proposing.',
		examples: [
			{ jp: 'いきましょう！', en: "Let's go!", es: '¡Vamos!' },
			{ jp: 'たべましょうか。', en: 'Shall we eat?', es: '¿Comemos?' },
			{ jp: 'てつだいましょうか。', en: 'Shall I help you?', es: '¿Te ayudo?' }
		],
		sort_order: 13
	},
	{
		pattern: 'い-adjective conjugation',
		meaning_en: 'い-adjectives: plain and polite forms',
		meaning_es: 'Adjetivos en い: formas básicas y formales',
		usage:
			'い-adj end in い. Present: adj + です. Negative: drop い, add くないです. Past: drop い, add かったです.',
		examples: [
			{ jp: 'おおきいです。', en: "It's big.", es: 'Es grande.' },
			{ jp: 'おおきくないです。', en: "It's not big.", es: 'No es grande.' },
			{ jp: 'おおきかったです。', en: 'It was big.', es: 'Era grande.' },
			{ jp: 'おおきくなかったです。', en: 'It was not big.', es: 'No era grande.' }
		],
		sort_order: 14
	},
	{
		pattern: 'な-adjective conjugation',
		meaning_en: 'な-adjectives: plain and polite forms',
		meaning_es: 'Adjetivos en な: formas básicas y formales',
		usage: 'な-adj + な before noun. With です: adj + です. Negative: adj + ではありません.',
		examples: [
			{ jp: 'しずかなへやです。', en: 'It is a quiet room.', es: 'Es una habitación tranquila.' },
			{ jp: 'げんきです。', en: 'I am fine.', es: 'Estoy bien.' },
			{ jp: 'にほんごがすきです。', en: 'I like Japanese.', es: 'Me gusta el japonés.' },
			{
				jp: 'べんきょうがすきじゃないです。',
				en: "I don't like studying.",
				es: 'No me gusta estudiar.'
			}
		],
		sort_order: 15
	},
	{
		pattern: 'Nがあります / NがいMAS',
		meaning_en: 'There is/are N (inanimate / animate)',
		meaning_es: 'Hay N (inanimado / animado)',
		usage: 'あります for objects/things. います for people and animals.',
		examples: [
			{
				jp: 'つくえのうえにほんがあります。',
				en: 'There is a book on the desk.',
				es: 'Hay un libro sobre el escritorio.'
			},
			{
				jp: 'こうえんにこどもがいます。',
				en: 'There are children in the park.',
				es: 'Hay niños en el parque.'
			}
		],
		sort_order: 16
	},
	{
		pattern: '〜に〜があります / います',
		meaning_en: 'Location に + subject があります/います',
		meaning_es: 'Lugar に + sujeto があります/います',
		usage: 'Expresses location of an object or person. に marks the place.',
		examples: [
			{
				jp: 'いえにねこがいます。',
				en: 'There is a cat in the house.',
				es: 'Hay un gato en la casa.'
			},
			{
				jp: 'テーブルのしたにかばんがあります。',
				en: 'There is a bag under the table.',
				es: 'Hay una bolsa debajo de la mesa.'
			}
		],
		sort_order: 17
	},
	{
		pattern: 'Nはどこですか',
		meaning_en: 'Where is N?',
		meaning_es: '¿Dónde está N?',
		usage: 'Asks for the location of a person or thing.',
		examples: [
			{ jp: 'トイレはどこですか。', en: 'Where is the bathroom?', es: '¿Dónde está el baño?' },
			{
				jp: 'えきはどこにありますか。',
				en: 'Where is the station?',
				es: '¿Dónde está la estación?'
			}
		],
		sort_order: 18
	},
	{
		pattern: '〜から〜まで',
		meaning_en: 'From ~ to ~ (time or place)',
		meaning_es: 'Desde ~ hasta ~ (tiempo o lugar)',
		usage: 'から = from / since. まで = until / to. Can be used for time and distance.',
		examples: [
			{ jp: 'くじからごじまではたらきます。', en: 'I work from 9 to 5.', es: 'Trabajo de 9 a 5.' },
			{
				jp: 'えきからうちまであるきます。',
				en: 'I walk from the station to home.',
				es: 'Camino de la estación a casa.'
			}
		],
		sort_order: 19
	},
	{
		pattern: '〜でいきます / きます',
		meaning_en: 'Go / come by (means of transport)',
		meaning_es: 'Ir / venir en (medio de transporte)',
		usage: 'で marks the means of transport. Can also mark the location of an action.',
		examples: [
			{ jp: 'でんしゃでいきます。', en: 'I go by train.', es: 'Voy en tren.' },
			{ jp: 'くるまできます。', en: 'I come by car.', es: 'Vengo en coche.' },
			{ jp: 'としょかんでよみます。', en: 'I read at the library.', es: 'Leo en la biblioteca.' }
		],
		sort_order: 20
	},
	{
		pattern: '〜もいいですか',
		meaning_en: 'May I do V? / Is it okay if I do V?',
		meaning_es: '¿Puedo hacer V? / ¿Está bien si hago V?',
		usage:
			'て-form + もいいですか asks for permission. Response: はい、どうぞ or いいえ、〜てはいけません。',
		examples: [
			{
				jp: 'しゃしんをとってもいいですか。',
				en: 'May I take a photo?',
				es: '¿Puedo tomar una foto?'
			},
			{
				jp: 'まどをあけてもいいですか。',
				en: 'May I open the window?',
				es: '¿Puedo abrir la ventana?'
			}
		],
		sort_order: 21
	},
	{
		pattern: '〜てはいけません',
		meaning_en: 'Must not do V / Not allowed to V',
		meaning_es: 'No se debe hacer V / Está prohibido hacer V',
		usage: 'て-form + はいけません expresses prohibition.',
		examples: [
			{
				jp: 'ここでたばこをすってはいけません。',
				en: 'You must not smoke here.',
				es: 'No se puede fumar aquí.'
			},
			{
				jp: 'しゃしんをとってはいけません。',
				en: 'You must not take photos.',
				es: 'No se pueden tomar fotos.'
			}
		],
		sort_order: 22
	},
	{
		pattern: 'NがすきですN / きらいです',
		meaning_en: 'I like / dislike N',
		meaning_es: 'Me gusta / no me gusta N',
		usage: 'が marks the thing liked/disliked. すき (na-adj) = like. きらい (na-adj) = dislike.',
		examples: [
			{ jp: 'にほんごがすきです。', en: 'I like Japanese.', es: 'Me gusta el japonés.' },
			{ jp: 'さかながきらいです。', en: 'I dislike fish.', es: 'No me gusta el pescado.' },
			{ jp: 'なにがいちばんすきですか。', en: 'What do you like best?', es: '¿Qué te gusta más?' }
		],
		sort_order: 23
	},
	{
		pattern: 'どんな + N',
		meaning_en: 'What kind of N?',
		meaning_es: '¿Qué tipo de N?',
		usage: 'どんな is a question word meaning "what kind of / what sort of".',
		examples: [
			{
				jp: 'どんなおんがくがすきですか。',
				en: 'What kind of music do you like?',
				es: '¿Qué tipo de música te gusta?'
			},
			{
				jp: 'どんなひとですか。',
				en: 'What kind of person is they?',
				es: '¿Qué tipo de persona es?'
			}
		],
		sort_order: 24
	},
	{
		pattern: '〜ないでください',
		meaning_en: 'Please do not V',
		meaning_es: 'Por favor no hagas V',
		usage: 'Negative て-form (ない form stem + ないで) + ください. Polite negative request.',
		examples: [
			{ jp: 'たばこをすわないでください。', en: 'Please do not smoke.', es: 'Por favor no fumes.' },
			{
				jp: 'むこうへいかないでください。',
				en: 'Please do not go over there.',
				es: 'Por favor no vayas allá.'
			}
		],
		sort_order: 25
	},
	{
		pattern: 'いくら / なんじ / なんさい',
		meaning_en: 'How much / What time / How old',
		meaning_es: '¿Cuánto cuesta / Qué hora / Cuántos años',
		usage: 'Question words combined with counters/time words for specific questions.',
		examples: [
			{ jp: 'これはいくらですか。', en: 'How much is this?', es: '¿Cuánto cuesta esto?' },
			{ jp: 'いまなんじですか。', en: 'What time is it now?', es: '¿Qué hora es ahora?' },
			{ jp: 'なんさいですか。', en: 'How old are you?', es: '¿Cuántos años tienes?' }
		],
		sort_order: 26
	},
	{
		pattern: '〜ましょうか (offering)',
		meaning_en: 'Shall I do V for you?',
		meaning_es: '¿Te hago V? / ¿Hago V?',
		usage: 'Used to offer help. Different from ましょうか (proposition) in context.',
		examples: [
			{ jp: 'もちましょうか。', en: 'Shall I carry it?', es: '¿Lo llevo yo?' },
			{ jp: 'てつだいましょうか。', en: 'Shall I help?', es: '¿Te ayudo?' }
		],
		sort_order: 27
	},
	{
		pattern: 'Adjective + くて / で (て-form)',
		meaning_en: 'Adj and... / Adj, and then... (connecting adjectives)',
		meaning_es: 'Adj y... (conectar adjetivos)',
		usage:
			'い-adj: drop い, add くて. な-adj + で. Connects adjectives without stopping the sentence.',
		examples: [
			{
				jp: 'このへやはひろくてきれいです。',
				en: 'This room is spacious and clean.',
				es: 'Esta habitación es amplia y limpia.'
			},
			{
				jp: 'せんせいはしんせつでやさしいです。',
				en: 'The teacher is kind and gentle.',
				es: 'El profesor es amable y gentil.'
			}
		],
		sort_order: 28
	},
	{
		pattern: '〜がほしいです',
		meaning_en: 'I want N (object)',
		meaning_es: 'Quiero N (objeto)',
		usage:
			'が + ほしいです. Used for wanting a thing (noun), not an action (use たい for actions).',
		examples: [
			{
				jp: 'あたらしいくるまがほしいです。',
				en: 'I want a new car.',
				es: 'Quiero un coche nuevo.'
			},
			{ jp: 'じかんがほしいです。', en: 'I want time.', es: 'Quiero tiempo.' }
		],
		sort_order: 29
	},
	{
		pattern: 'V前に / Vた後で',
		meaning_en: 'Before doing V / After doing V',
		meaning_es: 'Antes de hacer V / Después de hacer V',
		usage: 'V (dict. form) + 前に = before V. V (た-form) + 後で = after V.',
		examples: [
			{
				jp: 'ねるまえにはをみがきます。',
				en: 'I brush my teeth before sleeping.',
				es: 'Me lavo los dientes antes de dormir.'
			},
			{
				jp: 'たべたあとでさんぽします。',
				en: 'I take a walk after eating.',
				es: 'Doy un paseo después de comer.'
			}
		],
		sort_order: 30
	}
];
