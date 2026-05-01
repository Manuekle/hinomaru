import type { GrammarPoint } from '../types';

// N3 Grammar — 40 core patterns
export const grammar: GrammarPoint[] = [
	{
		pattern: '〜によって／〜により',
		meaning_en: 'by / due to / depending on',
		meaning_es: 'por / debido a / según',
		usage: 'Noun + によって. Expresses means, cause, or variation by agent/factor.',
		examples: [
			{ jp: '文化によって習慣が違う。', en: 'Customs differ depending on culture.', es: 'Las costumbres varían según la cultura.' },
			{ jp: '台風により電車が止まった。', en: 'The train stopped due to the typhoon.', es: 'El tren se detuvo debido al tifón.' },
		],
		sort_order: 1
	},
	{
		pattern: '〜に対して／〜に対する',
		meaning_en: 'towards / against / in contrast to',
		meaning_es: 'hacia / en contra de / en contraste con',
		usage: 'Noun + に対して. Expresses a target of action, attitude, or contrast.',
		examples: [
			{ jp: '先生に対して礼儀正しく接する。', en: 'Treat the teacher with courtesy.', es: 'Tratar al profesor con cortesía.' },
			{ jp: '子どもに対する愛情が深い。', en: 'The love towards the children is deep.', es: 'El amor hacia los niños es profundo.' },
		],
		sort_order: 2
	},
	{
		pattern: '〜に関して／〜に関する',
		meaning_en: 'about / regarding / concerning',
		meaning_es: 'sobre / acerca de / en relación a',
		usage: 'Noun + に関して. More formal than について.',
		examples: [
			{ jp: '環境問題に関して意見を述べた。', en: 'I stated my opinion regarding environmental issues.', es: 'Expresé mi opinión sobre los problemas ambientales.' },
			{ jp: '日本語に関する本を読んでいる。', en: 'I am reading a book about Japanese.', es: 'Estoy leyendo un libro sobre japonés.' },
		],
		sort_order: 3
	},
	{
		pattern: '〜として',
		meaning_en: 'as / in the role of',
		meaning_es: 'como / en calidad de',
		usage: 'Noun + として. States a role, capacity, or classification.',
		examples: [
			{ jp: '教師として働いています。', en: 'I work as a teacher.', es: 'Trabajo como maestro.' },
			{ jp: '問題として取り上げられた。', en: 'It was raised as a problem.', es: 'Fue planteado como un problema.' },
		],
		sort_order: 4
	},
	{
		pattern: '〜に加えて',
		meaning_en: 'in addition to',
		meaning_es: 'además de / sumado a',
		usage: 'Noun + に加えて. Adds one thing to another.',
		examples: [
			{ jp: '英語に加えて、日本語も学んでいる。', en: 'In addition to English, I am also learning Japanese.', es: 'Además del inglés, también estoy aprendiendo japonés.' },
		],
		sort_order: 5
	},
	{
		pattern: '〜一方で',
		meaning_en: 'while / on the other hand',
		meaning_es: 'mientras que / por otro lado',
		usage: 'Verb/Noun + 一方で. Contrasts two simultaneous situations.',
		examples: [
			{ jp: '働く一方で、勉強も続けている。', en: 'While working, I continue studying.', es: 'Mientras trabajo, sigo estudiando.' },
			{ jp: '都市化が進む一方で、自然が減っている。', en: 'While urbanization progresses, nature is decreasing.', es: 'Mientras avanza la urbanización, la naturaleza disminuye.' },
		],
		sort_order: 6
	},
	{
		pattern: '〜に比べて',
		meaning_en: 'compared to',
		meaning_es: 'en comparación con',
		usage: 'Noun + に比べて. Draws a comparison.',
		examples: [
			{ jp: '去年に比べて、成績が上がった。', en: 'Compared to last year, my grades improved.', es: 'En comparación con el año pasado, mis notas mejoraron.' },
		],
		sort_order: 7
	},
	{
		pattern: '〜に従って',
		meaning_en: 'as / in accordance with',
		meaning_es: 'conforme a / según avanza',
		usage: 'Noun/Verb + に従って. Indicates something happens in proportion or compliance.',
		examples: [
			{ jp: '規則に従って行動する。', en: 'Act in accordance with the rules.', es: 'Actuar conforme a las reglas.' },
			{ jp: '時代に従って価値観が変わる。', en: 'Values change as times change.', es: 'Los valores cambian conforme cambia la época.' },
		],
		sort_order: 8
	},
	{
		pattern: '〜に応じて',
		meaning_en: 'according to / in response to',
		meaning_es: 'de acuerdo con / en respuesta a',
		usage: 'Noun + に応じて. Indicates flexible adjustment according to circumstances.',
		examples: [
			{ jp: '状況に応じて対応する。', en: 'Respond according to the situation.', es: 'Responder de acuerdo con la situación.' },
			{ jp: '能力に応じた仕事を与える。', en: 'Give work suited to ability.', es: 'Dar trabajo adecuado a la habilidad.' },
		],
		sort_order: 9
	},
	{
		pattern: '〜にとって',
		meaning_en: 'for / from the perspective of',
		meaning_es: 'para / desde el punto de vista de',
		usage: 'Noun + にとって. States importance or relevance from someone\'s perspective.',
		examples: [
			{ jp: '私にとって日本語は難しい。', en: 'For me, Japanese is difficult.', es: 'Para mí, el japonés es difícil.' },
			{ jp: '子どもにとって遊びは大切だ。', en: 'Play is important for children.', es: 'El juego es importante para los niños.' },
		],
		sort_order: 10
	},
	{
		pattern: '〜わけだ',
		meaning_en: 'that is why / it means that / no wonder',
		meaning_es: 'por eso / significa que / no es de extrañar',
		usage: 'Plain form + わけだ. Expresses a logical conclusion or explanation.',
		examples: [
			{ jp: '毎日練習したから、上手になったわけだ。', en: "That's why you got good — you practiced every day.", es: 'Por eso mejoraste — practicaste todos los días.' },
		],
		sort_order: 11
	},
	{
		pattern: '〜わけではない',
		meaning_en: 'it does not mean that / not necessarily',
		meaning_es: 'no significa que / no necesariamente',
		usage: 'Plain form + わけではない. Denies a logical implication.',
		examples: [
			{ jp: '高いからといって良いわけではない。', en: 'Just because it is expensive does not mean it is good.', es: 'Solo porque sea caro no significa que sea bueno.' },
		],
		sort_order: 12
	},
	{
		pattern: '〜はずだ',
		meaning_en: 'should be / supposed to be',
		meaning_es: 'debería ser / se supone que',
		usage: 'Plain form + はずだ. Expresses confident expectation based on reasoning.',
		examples: [
			{ jp: '彼は来るはずだ。', en: 'He should come.', es: 'Él debería venir.' },
			{ jp: '鍵はここにあるはずだ。', en: 'The key should be here.', es: 'La llave debería estar aquí.' },
		],
		sort_order: 13
	},
	{
		pattern: '〜はずがない',
		meaning_en: 'cannot possibly be / there is no way',
		meaning_es: 'no puede ser / es imposible que',
		usage: 'Plain form + はずがない. Strong denial of a logical possibility.',
		examples: [
			{ jp: 'そんなことがあるはずがない。', en: 'There is no way such a thing could happen.', es: 'Es imposible que suceda tal cosa.' },
		],
		sort_order: 14
	},
	{
		pattern: '〜に違いない',
		meaning_en: 'must be / I am sure that',
		meaning_es: 'debe ser / estoy seguro de que',
		usage: 'Plain form + に違いない. Strong conviction based on evidence.',
		examples: [
			{ jp: '彼女は怒っているに違いない。', en: 'She must be angry.', es: 'Seguro que está enojada.' },
		],
		sort_order: 15
	},
	{
		pattern: '〜かもしれない',
		meaning_en: 'might be / possibly',
		meaning_es: 'quizás / es posible que',
		usage: 'Plain form + かもしれない. Expresses uncertainty or possibility.',
		examples: [
			{ jp: '明日は雨かもしれない。', en: 'It might rain tomorrow.', es: 'Quizás llueva mañana.' },
			{ jp: '彼は知らないかもしれない。', en: 'He might not know.', es: 'Es posible que él no lo sepa.' },
		],
		sort_order: 16
	},
	{
		pattern: '〜ようだ／〜ようだ',
		meaning_en: 'it seems / it looks like (personal observation)',
		meaning_es: 'parece que / da la impresión de que',
		usage: 'Plain form + ようだ. Based on direct personal observation.',
		examples: [
			{ jp: '彼は疲れているようだ。', en: 'He seems tired.', es: 'Parece que está cansado.' },
			{ jp: '雨が降ったようだ。', en: 'It looks like it rained.', es: 'Parece que llovió.' },
		],
		sort_order: 17
	},
	{
		pattern: '〜らしい',
		meaning_en: 'seems like / I heard that / typical of',
		meaning_es: 'parece que / según dicen / propio de',
		usage: 'Plain form/Noun + らしい. Based on hearsay or typical characteristics.',
		examples: [
			{ jp: '彼は入院したらしい。', en: 'I heard he was hospitalized.', es: 'Según dicen, fue hospitalizado.' },
			{ jp: '彼女らしい行動だ。', en: 'That is typical behavior for her.', es: 'Es un comportamiento típico de ella.' },
		],
		sort_order: 18
	},
	{
		pattern: '〜ばかりか〜も',
		meaning_en: 'not only... but also',
		meaning_es: 'no solo... sino también',
		usage: 'A + ばかりか + B + も. Adds an additional surprising element.',
		examples: [
			{ jp: '英語ばかりか日本語も話せる。', en: 'Not only English but also Japanese.', es: 'No solo inglés sino también japonés.' },
		],
		sort_order: 19
	},
	{
		pattern: '〜どころか',
		meaning_en: 'far from / let alone',
		meaning_es: 'lejos de / ni siquiera',
		usage: 'Noun/Verb + どころか. Expresses that the reality is far from expectation.',
		examples: [
			{ jp: '上手どころか、まだ初心者だ。', en: 'Far from skilled, I am still a beginner.', es: 'Lejos de ser hábil, todavía soy principiante.' },
		],
		sort_order: 20
	},
	{
		pattern: '〜さえ〜ば',
		meaning_en: 'if only / as long as',
		meaning_es: 'con solo que / si únicamente',
		usage: 'Noun + さえ + conditional. Expresses that one condition is sufficient.',
		examples: [
			{ jp: '健康でさえあれば十分だ。', en: 'As long as you are healthy, it is enough.', es: 'Con solo estar sano es suficiente.' },
		],
		sort_order: 21
	},
	{
		pattern: '〜ても〜ても',
		meaning_en: 'no matter how much / even if repeatedly',
		meaning_es: 'por más que / aunque lo haga una y otra vez',
		usage: 'て-form + も、て-form + も. Expresses a persistent state despite repeated action.',
		examples: [
			{ jp: '食べても食べてもお腹が空く。', en: 'No matter how much I eat, I get hungry.', es: 'Por más que coma, me da hambre.' },
		],
		sort_order: 22
	},
	{
		pattern: '〜ことから',
		meaning_en: 'from the fact that / because',
		meaning_es: 'dado que / por el hecho de que',
		usage: 'Plain form + ことから. Provides a reason or basis.',
		examples: [
			{ jp: '色が白いことから、白熊と呼ばれる。', en: 'From the fact that it is white, it is called a polar bear.', es: 'Por el hecho de ser blanco, se le llama oso polar.' },
		],
		sort_order: 23
	},
	{
		pattern: '〜ことになっている',
		meaning_en: 'it is supposed to / it is scheduled to',
		meaning_es: 'se supone que / está programado',
		usage: 'Verb + ことになっている. States an established rule or schedule.',
		examples: [
			{ jp: 'ここでは禁煙することになっている。', en: 'Smoking is not allowed here.', es: 'Se supone que está prohibido fumar aquí.' },
		],
		sort_order: 24
	},
	{
		pattern: '〜ことにしている',
		meaning_en: 'I make it a rule to / I have decided to',
		meaning_es: 'tengo la costumbre de / me propongo',
		usage: 'Verb + ことにしている. States a personal rule or habit.',
		examples: [
			{ jp: '毎朝運動することにしている。', en: 'I make it a rule to exercise every morning.', es: 'Tengo la costumbre de hacer ejercicio cada mañana.' },
		],
		sort_order: 25
	},
	{
		pattern: '〜ものだ',
		meaning_en: 'that is the way things are / should naturally be / used to',
		meaning_es: 'así son las cosas / se supone que / solía',
		usage: 'Plain form + ものだ. Expresses a general truth, natural expectation, or nostalgic recollection.',
		examples: [
			{ jp: '人生はそういうものだ。', en: 'That is just the way life is.', es: 'Así son las cosas en la vida.' },
			{ jp: '子どもの頃はよく遊んだものだ。', en: 'When I was a child, I used to play a lot.', es: 'De niño, solía jugar mucho.' },
		],
		sort_order: 26
	},
	{
		pattern: '〜ものの',
		meaning_en: 'although / even though',
		meaning_es: 'aunque / si bien',
		usage: 'Plain form + ものの. Concedes a fact but introduces a contrasting reality.',
		examples: [
			{ jp: '知っているものの、言えない。', en: 'Although I know, I cannot say.', es: 'Aunque lo sé, no puedo decirlo.' },
		],
		sort_order: 27
	},
	{
		pattern: '〜ものだから',
		meaning_en: 'because / the reason is',
		meaning_es: 'porque / la razón es que',
		usage: 'Plain form + ものだから. Provides an excuse or strong reason.',
		examples: [
			{ jp: '電車が遅れたものだから、遅刻した。', en: 'Because the train was delayed, I was late.', es: 'Porque el tren se retrasó, llegué tarde.' },
		],
		sort_order: 28
	},
	{
		pattern: '〜ため（に）',
		meaning_en: 'in order to / because of',
		meaning_es: 'para / debido a',
		usage: 'Verb/Noun + ために. Purpose (with action verb) or cause (with stative).',
		examples: [
			{ jp: '健康のために運動する。', en: 'I exercise for my health.', es: 'Hago ejercicio por mi salud.' },
			{ jp: '病気のために学校を休んだ。', en: 'I was absent from school because of illness.', es: 'Falté a la escuela por enfermedad.' },
		],
		sort_order: 29
	},
	{
		pattern: '〜ように言う',
		meaning_en: 'to tell someone to do',
		meaning_es: 'decirle a alguien que haga',
		usage: 'Verb (plain) + ように言う. Indirect commands or requests.',
		examples: [
			{ jp: '先生に静かにするように言われた。', en: 'I was told by the teacher to be quiet.', es: 'El maestro me dijo que guardara silencio.' },
		],
		sort_order: 30
	},
	{
		pattern: '〜ように見える',
		meaning_en: 'looks like / appears to',
		meaning_es: 'parece / da la apariencia de',
		usage: 'Verb/Adj + ように見える. Based on visual appearance.',
		examples: [
			{ jp: '彼は怒っているように見える。', en: 'He looks like he is angry.', es: 'Parece que está enojado.' },
		],
		sort_order: 31
	},
	{
		pattern: '〜てたまらない',
		meaning_en: 'unbearably / extremely (feeling)',
		meaning_es: 'insoportablemente / extremadamente',
		usage: 'て-form + たまらない. Expresses an overwhelming feeling or desire.',
		examples: [
			{ jp: '暑くてたまらない。', en: 'It is unbearably hot.', es: 'Hace un calor insoportable.' },
			{ jp: '帰りたくてたまらない。', en: 'I want to go home so badly.', es: 'Quiero volver a casa desesperadamente.' },
		],
		sort_order: 32
	},
	{
		pattern: '〜てならない',
		meaning_en: 'cannot help but feel / irresistibly',
		meaning_es: 'no puedo evitar sentir',
		usage: 'て-form + ならない. Natural emotions that arise involuntarily.',
		examples: [
			{ jp: '合格して嬉しくてならない。', en: 'I cannot help feeling happy about passing.', es: 'No puedo evitar sentirme feliz de haber aprobado.' },
		],
		sort_order: 33
	},
	{
		pattern: '〜にしては',
		meaning_en: 'for / considering that',
		meaning_es: 'para ser / considerando que',
		usage: 'Noun/Verb + にしては. Sets up an expectation and contrasts with reality.',
		examples: [
			{ jp: '初めてにしてはよくできた。', en: 'For a first try, it was well done.', es: 'Para ser la primera vez, quedó bien.' },
		],
		sort_order: 34
	},
	{
		pattern: '〜に関わらず',
		meaning_en: 'regardless of / irrespective of',
		meaning_es: 'independientemente de / sin importar',
		usage: 'Noun + に関わらず. States that something applies regardless of a condition.',
		examples: [
			{ jp: '年齢に関わらず参加できる。', en: 'Anyone can participate regardless of age.', es: 'Se puede participar independientemente de la edad.' },
		],
		sort_order: 35
	},
	{
		pattern: '〜上で',
		meaning_en: 'in doing / after / for the purpose of',
		meaning_es: 'al hacer / después de / para',
		usage: 'Verb (た/plain) + 上で. Used to state a prerequisite or consideration.',
		examples: [
			{ jp: '確認した上で返事します。', en: 'I will reply after confirming.', es: 'Responderé después de confirmar.' },
		],
		sort_order: 36
	},
	{
		pattern: '〜に反して',
		meaning_en: 'contrary to / against',
		meaning_es: 'contrariamente a / en contra de',
		usage: 'Noun + に反して. Expresses contradiction with an expectation.',
		examples: [
			{ jp: '予想に反して、試験は難しかった。', en: 'Contrary to expectations, the exam was difficult.', es: 'Contrariamente a lo esperado, el examen fue difícil.' },
		],
		sort_order: 37
	},
	{
		pattern: '〜を通じて／〜を通して',
		meaning_en: 'through / via / throughout',
		meaning_es: 'a través de / por medio de',
		usage: 'Noun + を通じて. Expresses medium, means, or duration.',
		examples: [
			{ jp: 'インターネットを通じて情報を得た。', en: 'I obtained information through the internet.', es: 'Obtuve información a través de internet.' },
		],
		sort_order: 38
	},
	{
		pattern: '〜次第',
		meaning_en: 'as soon as / depending on',
		meaning_es: 'en cuanto / dependiendo de',
		usage: 'Verb stem/Noun + 次第. States immediacy or dependence.',
		examples: [
			{ jp: '準備でき次第、出発します。', en: 'As soon as I am ready, I will depart.', es: 'En cuanto esté listo, partiré.' },
			{ jp: 'やる気次第で成功できる。', en: 'You can succeed depending on your motivation.', es: 'Puedes tener éxito dependiendo de tu motivación.' },
		],
		sort_order: 39
	},
	{
		pattern: '〜を中心に',
		meaning_en: 'centered on / focusing on',
		meaning_es: 'centrado en / con énfasis en',
		usage: 'Noun + を中心に. Indicates what something revolves around.',
		examples: [
			{ jp: '東京を中心に活動している。', en: 'I am active centered on Tokyo.', es: 'Estoy activo centrándome en Tokio.' },
		],
		sort_order: 40
	},
];
