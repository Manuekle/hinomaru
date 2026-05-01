import type { GrammarPoint } from '../types';

export const grammar: GrammarPoint[] = [
	{
		pattern: '〜ともなると／ともなれば',
		meaning_en: 'When it comes to (a high level/status)',
		meaning_es: 'Cuando se llega a ser/tener; tratándose de algo de alto nivel',
		usage: 'Noun + ともなると／ともなれば. Implies that reaching a certain rank or situation naturally brings expected consequences.',
		examples: [
			{ jp: '社長ともなると、責任も大きくなる。', en: 'Once you become president, the responsibility grows too.', es: 'Cuando llegas a ser presidente, la responsabilidad también aumenta.' },
			{ jp: '大人ともなれば、自分で判断すべきだ。', en: 'Once you are an adult, you should decide for yourself.', es: 'Una vez que eres adulto, debes decidir por ti mismo.' }
		],
		sort_order: 1
	},
	{
		pattern: '〜にあって',
		meaning_en: 'Being in (a situation/position); under (circumstances)',
		meaning_es: 'Estando en una situación; bajo ciertas circunstancias',
		usage: 'Noun + にあって. Formal/written style. Highlights that something happens within a special or demanding context.',
		examples: [
			{ jp: 'この困難な状況にあって、彼は冷静を保った。', en: 'Being in this difficult situation, he remained calm.', es: 'Estando en esta difícil situación, él mantuvo la calma.' },
			{ jp: '激動の時代にあって、企業は変革を迫られた。', en: 'In a turbulent era, companies were forced to change.', es: 'En una época turbulenta, las empresas se vieron obligadas a cambiar.' }
		],
		sort_order: 2
	},
	{
		pattern: '〜をもって',
		meaning_en: 'With; by means of; as of (a point in time)',
		meaning_es: 'Con; por medio de; a partir de un punto en el tiempo',
		usage: 'Noun + をもって. Two uses: (1) instrument/means — more formal than で; (2) temporal boundary — marks the end of something.',
		examples: [
			{ jp: '本日をもって、この店は閉店いたします。', en: 'As of today, this store will close.', es: 'A partir de hoy, esta tienda cerrará.' },
			{ jp: '実力をもって勝負に挑む。', en: 'He challenges the match with his true skill.', es: 'Se enfrenta al reto con su verdadera habilidad.' }
		],
		sort_order: 3
	},
	{
		pattern: '〜ずには済まない',
		meaning_en: 'Cannot get away without doing; must inevitably do',
		meaning_es: 'No se puede evitar hacer; inevitablemente hay que hacer',
		usage: 'Verb negative stem + ずには済まない. Negative obligation — social or moral pressure makes the action unavoidable.',
		examples: [
			{ jp: 'この失敗は謝罪せずには済まない。', en: 'This failure cannot pass without an apology.', es: 'Este fracaso no puede quedar sin disculpas.' },
			{ jp: '彼に知らせずには済まないだろう。', en: 'I cannot get away without telling him.', es: 'No puedo evitar informarle.' }
		],
		sort_order: 4
	},
	{
		pattern: '〜ないまでも',
		meaning_en: 'Even if not (the extreme case); if not…, at least',
		meaning_es: 'Aunque no el caso extremo; si no…, al menos',
		usage: 'Verb negative plain form + までも. Concedes the ideal is unmet but sets a lower acceptable standard.',
		examples: [
			{ jp: '毎日とは言わないまでも、週に一度は運動すべきだ。', en: 'Even if not every day, you should exercise at least once a week.', es: 'Aunque no todos los días, deberías hacer ejercicio al menos una vez por semana.' },
			{ jp: '完璧でないまでも、最善を尽くした。', en: 'Even if not perfect, he did his best.', es: 'Aunque no fue perfecto, hizo su mejor esfuerzo.' }
		],
		sort_order: 5
	},
	{
		pattern: '〜とあれば',
		meaning_en: 'If it is a matter of; if the situation calls for it',
		meaning_es: 'Si se trata de; si la situación lo requiere',
		usage: 'Noun/phrase + とあれば. Implies strong motivation because of the stated condition. Often signals willingness to go to extremes.',
		examples: [
			{ jp: '君のためとあれば、どんなことでもする。', en: 'If it is for you, I will do anything.', es: 'Si se trata de hacer algo por ti, haré cualquier cosa.' },
			{ jp: '必要とあれば、徹夜も辞さない。', en: 'If necessary, I will not hesitate to pull an all-nighter.', es: 'Si es necesario, no dudaré en quedarme despierto toda la noche.' }
		],
		sort_order: 6
	},
	{
		pattern: '〜ならでは',
		meaning_en: 'Unique to; only possible with; characteristic of',
		meaning_es: 'Único de; solo posible con; característico de',
		usage: 'Noun + ならでは(の). Follows nouns only. Highlights something exclusive to that person, place, or thing.',
		examples: [
			{ jp: 'これは日本ならではの文化だ。', en: 'This is a culture unique to Japan.', es: 'Esta es una cultura única de Japón.' },
			{ jp: 'プロならではの技術を見せてくれた。', en: 'He showed us skill that only a professional could have.', es: 'Nos mostró una habilidad que solo un profesional podría tener.' }
		],
		sort_order: 7
	},
	{
		pattern: '〜べく',
		meaning_en: 'In order to; for the purpose of (literary/formal)',
		meaning_es: 'Con el fin de; para (literario/formal)',
		usage: 'Verb dictionary form + べく. Classical purpose form. More literary than ために.',
		examples: [
			{ jp: '夢を実現すべく、努力を続けた。', en: 'He continued working hard in order to realize his dream.', es: 'Siguió esforzándose con el fin de realizar su sueño.' },
			{ jp: '真実を伝えるべく、記事を書いた。', en: 'She wrote the article in order to convey the truth.', es: 'Escribió el artículo con el fin de transmitir la verdad.' }
		],
		sort_order: 8
	},
	{
		pattern: '〜んがために／〜んがため',
		meaning_en: 'For the purpose of; driven by the desire to (literary)',
		meaning_es: 'Con el propósito de; impulsado por el deseo de (literario)',
		usage: 'Verb negative stem (〜ん) + がために. Classical form of ために. Very formal/literary. Implies strong intentional drive.',
		examples: [
			{ jp: '勝たんがために、あらゆる手段を講じた。', en: 'In order to win, he took every possible measure.', es: 'Con el propósito de ganar, tomó todas las medidas posibles.' },
			{ jp: '生き残らんがため、必死に戦った。', en: 'Desperately fighting in order to survive.', es: 'Luchando desesperadamente con el fin de sobrevivir.' }
		],
		sort_order: 9
	},
	{
		pattern: '〜といえども',
		meaning_en: 'Even though; even if (it is said that)',
		meaning_es: 'Aunque; incluso si se dice que',
		usage: 'Noun/phrase + といえども. Concessive. More literary than ても. Often used for universal statements.',
		examples: [
			{ jp: 'プロといえども、失敗することがある。', en: 'Even a professional can fail.', es: 'Aunque sea profesional, puede fallar.' },
			{ jp: '法の下といえども、例外がある。', en: 'Even under the law, there are exceptions.', es: 'Incluso bajo la ley hay excepciones.' }
		],
		sort_order: 10
	},
	{
		pattern: '〜をおいて',
		meaning_en: 'Excluding; other than; there is no one/nothing but',
		meaning_es: 'Excepto; además de; no hay nadie/nada más que',
		usage: 'Noun + をおいて(〜ない). Always followed by a negative result clause. Strongly exclusionary.',
		examples: [
			{ jp: 'この仕事ができるのは、彼女をおいて他にいない。', en: 'There is no one other than her who can do this job.', es: 'No hay nadie más que ella que pueda hacer este trabajo.' },
			{ jp: '今をおいて、チャンスはない。', en: 'There is no opportunity other than now.', es: 'No hay oportunidad más que ahora.' }
		],
		sort_order: 11
	},
	{
		pattern: '〜ばこそ',
		meaning_en: 'Precisely because; it is exactly because',
		meaning_es: 'Precisamente porque; es exactamente porque',
		usage: 'Conditional ば-form + こそ. Emphasizes the cause as the sole or strongest reason for the result.',
		examples: [
			{ jp: '愛しているればこそ、厳しいことも言う。', en: 'It is precisely because I love you that I say harsh things.', es: 'Es precisamente porque te amo que digo cosas duras.' },
			{ jp: '信頼しているればこそ、任せたのだ。', en: 'It is precisely because I trust you that I entrusted it.', es: 'Es precisamente porque confío en ti que te lo encomendé.' }
		],
		sort_order: 12
	},
	{
		pattern: '〜にして',
		meaning_en: 'At (a remarkable point); being both A and B; even for',
		meaning_es: 'A un punto notable; siendo tanto A como B; incluso para',
		usage: 'Noun + にして. Multiple uses: (1) milestone of age/rank, (2) dual quality, (3) concession for high standard.',
		examples: [
			{ jp: '30歳にして、彼はすでに会社を設立していた。', en: 'At the age of 30, he had already founded a company.', es: 'A los 30 años, ya había fundado una empresa.' },
			{ jp: '彼は科学者にして詩人でもある。', en: 'He is both a scientist and a poet.', es: 'Él es a la vez científico y poeta.' }
		],
		sort_order: 13
	},
	{
		pattern: '〜なくして（は）',
		meaning_en: 'Without; if not for (formal/written)',
		meaning_es: 'Sin; si no fuera por (formal/escrito)',
		usage: 'Noun + なくして(は). Formal synonym of なしに／なければ. Often in written prose or speeches.',
		examples: [
			{ jp: '努力なくしては、成功はない。', en: 'Without effort, there is no success.', es: 'Sin esfuerzo, no hay éxito.' },
			{ jp: '協力なくして、この問題は解決できない。', en: 'Without cooperation, this problem cannot be solved.', es: 'Sin cooperación, este problema no puede resolverse.' }
		],
		sort_order: 14
	},
	{
		pattern: '〜ものを',
		meaning_en: 'If only…; it would have been fine if… (regret/reproach)',
		meaning_es: 'Si tan solo…; habría estado bien si… (arrepentimiento/reproche)',
		usage: 'Plain form + ものを. Expresses unfulfilled expectation with regret or reproach toward someone (including oneself).',
		examples: [
			{ jp: '早く言ってくれればよかったものを。', en: 'If only you had told me earlier.', es: 'Si tan solo me lo hubieras dicho antes.' },
			{ jp: '謝れば済んだものを、意地を張った。', en: 'If only he had apologized, but he was stubborn.', es: 'Con solo disculparse habría bastado, pero se puso terco.' }
		],
		sort_order: 15
	},
	{
		pattern: '〜いかんによらず／〜いかんにかかわらず',
		meaning_en: 'Regardless of; irrespective of',
		meaning_es: 'Independientemente de; con independencia de',
		usage: 'Noun + のいかんによらず. Formal. 〜にかかわらず is more emphatic than 〜によらず.',
		examples: [
			{ jp: '理由のいかんによらず、遅刻は許されない。', en: 'Regardless of the reason, tardiness is not permitted.', es: 'Independientemente del motivo, el retraso no está permitido.' },
			{ jp: '結果のいかんにかかわらず、全力を尽くす。', en: 'Regardless of the outcome, I will give my all.', es: 'Independientemente del resultado, daré todo de mí.' }
		],
		sort_order: 16
	},
	{
		pattern: '〜ともあろう',
		meaning_en: 'For someone of (such standing); expected to be better',
		meaning_es: 'Para alguien de tal posición; se esperaría mejor conducta',
		usage: 'Noun + ともあろう + person. Implies disappointment — the person should know better given their status.',
		examples: [
			{ jp: '教師ともあろう人が、そんなことを言うとは。', en: 'For someone who is a teacher to say such a thing…', es: 'Que alguien que es maestro diga tal cosa…' },
			{ jp: '大臣ともあろう者が、法を犯すとは。', en: 'For someone who is a minister to break the law…', es: 'Que alguien que es ministro infrinja la ley…' }
		],
		sort_order: 17
	},
	{
		pattern: '〜てやまない',
		meaning_en: 'To never stop (feeling/doing); to earnestly and deeply',
		meaning_es: 'Nunca dejar de sentir; profundamente; de corazón',
		usage: 'Verb te-form + やまない. Expresses unceasing, deep emotion. Often with 願う, 愛する, 望む.',
		examples: [
			{ jp: '彼の成功を願ってやまない。', en: 'I sincerely and continually wish for his success.', es: 'Deseo sincera y continuamente su éxito.' },
			{ jp: '故郷を愛してやまない。', en: 'I never stop loving my hometown.', es: 'Nunca dejo de amar mi ciudad natal.' }
		],
		sort_order: 18
	},
	{
		pattern: '〜にたえる／〜にたえない',
		meaning_en: 'Worth doing; able to endure / not worth; unbearable',
		meaning_es: 'Vale la pena hacer; soportable / no vale la pena; insoportable',
		usage: 'Verbal noun + にたえる. Positive: meets the standard for the action. 〜にたえない: either "too painful" or "deeply moved."',
		examples: [
			{ jp: 'この作品は鑑賞にたえる出来だ。', en: 'This work is of a quality worth appreciating.', es: 'Esta obra tiene una calidad que vale la pena apreciar.' },
			{ jp: 'その光景は目にたえない。', en: 'That scene is too much to look at.', es: 'Esa escena es demasiado para mirarla.' }
		],
		sort_order: 19
	},
	{
		pattern: '〜かたがた',
		meaning_en: 'While also; at the same time as; combining two purposes',
		meaning_es: 'Mientras también; al mismo tiempo que; con doble propósito',
		usage: 'Verbal noun + かたがた. Formal/written. Often in business or ceremonial language. The two actions share one visit/action.',
		examples: [
			{ jp: 'ご挨拶かたがた、お礼を申し上げます。', en: 'I would like to offer my thanks while also paying my respects.', es: 'Me gustaría expresar mi gratitud al mismo tiempo que presento mis respetos.' },
			{ jp: 'お見舞いかたがた、近況を伝えた。', en: 'While visiting him, I shared recent news.', es: 'Mientras le visitaba, compartí las últimas noticias.' }
		],
		sort_order: 20
	},
	{
		pattern: '〜かたわら',
		meaning_en: 'While; alongside; in addition to (one main activity)',
		meaning_es: 'Mientras; además de una actividad principal',
		usage: 'Noun の／Verb dict. + かたわら. Main activity is ongoing; secondary activity runs in parallel.',
		examples: [
			{ jp: '仕事のかたわら、小説を書いている。', en: 'He writes novels alongside his main job.', es: 'Escribe novelas además de su trabajo principal.' },
			{ jp: '研究のかたわら、後輩の指導もしている。', en: 'Alongside research, she also mentors junior colleagues.', es: 'Además de la investigación, también tutoriza a sus colegas más jóvenes.' }
		],
		sort_order: 21
	},
	{
		pattern: '〜をかねて',
		meaning_en: 'Combining; serving the dual purpose of',
		meaning_es: 'Combinando; sirviendo el doble propósito de',
		usage: 'Noun + をかねて. One action serves two purposes simultaneously.',
		examples: [
			{ jp: '観光をかねて、出張した。', en: 'I went on a business trip that also served as sightseeing.', es: 'Fui en un viaje de negocios que también sirvió de turismo.' },
			{ jp: '運動をかねて、自転車で通勤している。', en: 'I commute by bicycle, combining exercise with the commute.', es: 'Voy al trabajo en bicicleta, combinando el ejercicio con el desplazamiento.' }
		],
		sort_order: 22
	},
	{
		pattern: '〜ずくめ',
		meaning_en: 'Entirely; all (one thing); nothing but',
		meaning_es: 'Completamente; todo lo mismo; nada más que',
		usage: 'Noun + ずくめ. Describes a state where everything is of the same kind. Often positive.',
		examples: [
			{ jp: '今日は良いことずくめだった。', en: 'Today was nothing but good things.', es: 'Hoy no fue nada más que cosas buenas.' },
			{ jp: '黒ずくめの服装で現れた。', en: 'He appeared dressed entirely in black.', es: 'Apareció vestido completamente de negro.' }
		],
		sort_order: 23
	},
	{
		pattern: '〜まみれ',
		meaning_en: 'Covered in; smeared with (unpleasant substances)',
		meaning_es: 'Cubierto de; manchado con (sustancias desagradables)',
		usage: 'Noun + まみれ. Negative connotation. Not used for pleasant coverings. Used for mud, blood, debt, lies, etc.',
		examples: [
			{ jp: '泥まみれになって帰ってきた。', en: 'He came home covered in mud.', es: 'Volvió a casa cubierto de barro.' },
			{ jp: '借金まみれの生活が続いた。', en: 'Life buried in debt continued.', es: 'Continuó una vida enterrada en deudas.' }
		],
		sort_order: 24
	},
	{
		pattern: '〜じみた',
		meaning_en: 'Resembling; seeming like; having the air of',
		meaning_es: 'Que parece; que tiene el aire de',
		usage: 'Noun + じみた + Noun. Slightly pejorative — the resemblance is superficial or excessive.',
		examples: [
			{ jp: '彼は夢想家じみたことを言う。', en: 'He says things that sound like a dreamer.', es: 'Dice cosas que suenan a las de un soñador.' },
			{ jp: '子どもじみた言い訳をするな。', en: 'Don\'t make childish excuses.', es: 'No pongas excusas de niño.' }
		],
		sort_order: 25
	},
	{
		pattern: '〜めく',
		meaning_en: 'To seem like; to take on the quality of; to become suggestive of',
		meaning_es: 'Parecer; adquirir la cualidad de; sugerir',
		usage: 'Noun + めく. Attaches to nouns. Softer and more poetic than じみた. Used for seasonal, atmospheric, or quality shifts.',
		examples: [
			{ jp: '春めいた陽気になってきた。', en: 'The weather has become spring-like.', es: 'El clima se ha vuelto primaveral.' },
			{ jp: '皮肉めいた言い方をした。', en: 'He spoke in a way that seemed sarcastic.', es: 'Habló de una manera que parecía sarcástica.' }
		],
		sort_order: 26
	},
	{
		pattern: '〜に即して',
		meaning_en: 'In accordance with; based on (facts/reality/rules)',
		meaning_es: 'De acuerdo con; basándose en hechos o realidad',
		usage: 'Noun + に即して. Emphasizes conformity to actual conditions, not theory or abstract ideals.',
		examples: [
			{ jp: '現実に即して考える必要がある。', en: 'We need to think in accordance with reality.', es: 'Necesitamos pensar de acuerdo con la realidad.' },
			{ jp: '法律に即した判断をする。', en: 'Make a judgment in accordance with the law.', es: 'Tomar una decisión de acuerdo con la ley.' }
		],
		sort_order: 27
	},
	{
		pattern: '〜に足る',
		meaning_en: 'Worth; deserving of; sufficient for',
		meaning_es: 'Digno de; que merece; suficiente para',
		usage: 'Verb dictionary form + に足る. Positive evaluation: the subject meets the standard for the action. Often with 信頼する, 尊敬する.',
		examples: [
			{ jp: '彼は信頼するに足る人物だ。', en: 'He is a person worthy of trust.', es: 'Él es una persona digna de confianza.' },
			{ jp: 'この証拠は注目するに足るものだ。', en: 'This evidence is worth noting.', es: 'Esta evidencia es digna de atención.' }
		],
		sort_order: 28
	},
	{
		pattern: '〜に堪えない',
		meaning_en: 'Cannot endure; overwhelmed by (strong emotion)',
		meaning_es: 'No se puede soportar; abrumado por emoción intensa',
		usage: 'Noun + に堪えない. Formal. Used with positive emotions (gratitude, joy) as well as negative (distress, grief).',
		examples: [
			{ jp: '感謝に堪えません。', en: 'I am overwhelmed with gratitude.', es: 'Estoy abrumado de gratitud.' },
			{ jp: '遺憾に堪えない事態だ。', en: 'This is a situation too regrettable to bear.', es: 'Esta es una situación demasiado lamentable para soportar.' }
		],
		sort_order: 29
	},
	{
		pattern: '〜ようによっては',
		meaning_en: 'Depending on how; depending on the way one does it',
		meaning_es: 'Dependiendo de cómo; según la manera en que se haga',
		usage: 'Verb stem (ます-form) + ようによっては. Highlights that outcomes vary based on approach or perspective.',
		examples: [
			{ jp: '考えようによっては、それも悪くない。', en: 'Depending on how you think about it, that is not bad either.', es: 'Dependiendo de cómo lo pienses, eso tampoco está mal.' },
			{ jp: '使いようによっては、便利な道具だ。', en: 'Depending on how you use it, it is a useful tool.', es: 'Dependiendo de cómo lo uses, es una herramienta útil.' }
		],
		sort_order: 30
	},
	{
		pattern: '〜がてら',
		meaning_en: 'While doing; on the way to doing; taking the opportunity to',
		meaning_es: 'Mientras se hace; de camino a; aprovechando la oportunidad',
		usage: 'Verb stem (ます-form) / Verbal noun + がてら. The secondary action is an added benefit of the main one.',
		examples: [
			{ jp: '散歩がてら、買い物をしてきた。', en: 'I did some shopping while taking a walk.', es: 'Hice algunas compras mientras paseaba.' },
			{ jp: '帰りがてら、友人に会った。', en: 'On the way home, I met a friend.', es: 'De camino a casa, me encontré con un amigo.' }
		],
		sort_order: 31
	},
	{
		pattern: '〜のみならず',
		meaning_en: 'Not only; not just (formal written)',
		meaning_es: 'No solo; no únicamente (formal escrito)',
		usage: 'Plain form / Noun + のみならず. Formal written equivalent of だけでなく.',
		examples: [
			{ jp: '彼は国内のみならず、海外でも有名だ。', en: 'He is famous not only domestically but also abroad.', es: 'Es famoso no solo en el país sino también en el extranjero.' },
			{ jp: '環境問題は経済のみならず、社会全体に影響する。', en: 'Environmental issues affect not only the economy but also society as a whole.', es: 'Los problemas ambientales afectan no solo a la economía sino a toda la sociedad.' }
		],
		sort_order: 32
	},
	{
		pattern: '〜ばこそ',
		meaning_en: 'Precisely because; it is exactly because (strong causation)',
		meaning_es: 'Precisamente porque; es exactamente porque (causalidad fuerte)',
		usage: 'Verb/adj conditional ば-form + こそ. Stresses that the reason is the sole or decisive cause.',
		examples: [
			{ jp: '信頼しているればこそ、任せたのだ。', en: 'It is precisely because I trust you that I entrusted you with it.', es: 'Es precisamente porque confío en ti que te lo encomendé.' },
			{ jp: '愛があればこそ、言える言葉だ。', en: 'These are words that can only be said because there is love.', es: 'Son palabras que solo se pueden decir porque hay amor.' }
		],
		sort_order: 33
	},
	{
		pattern: '〜とも〜とも言えない',
		meaning_en: 'Cannot say whether it is A or B; ambiguous',
		meaning_es: 'No se puede decir si es A o B; ambiguo',
		usage: 'A とも B とも言えない. Expresses genuine uncertainty or deliberate ambiguity between two contrasting judgments.',
		examples: [
			{ jp: 'これが良いとも悪いとも言えない状況だ。', en: 'This is a situation where one cannot say whether it is good or bad.', es: 'Esta es una situación en la que no se puede decir si es buena o mala.' },
			{ jp: '賛成とも反対とも言えない立場だ。', en: 'I am in a position where I cannot say whether I agree or disagree.', es: 'Estoy en una posición en la que no puedo decir si estoy de acuerdo o no.' }
		],
		sort_order: 34
	},
	{
		pattern: '〜をして（〜させる）',
		meaning_en: 'To make (someone) do; through/via (someone) (classical causative)',
		meaning_es: 'Hacer que alguien haga; a través de alguien (causativo clásico)',
		usage: 'Noun + をして + causative verb. Classical/literary causative structure. Very formal and archaic.',
		examples: [
			{ jp: '彼をして語らしめよ。', en: 'Let him speak; make him speak.', es: 'Que él hable; hazle hablar.' },
			{ jp: '時代をして変革を促した。', en: 'The era drove (people) to reform.', es: 'La época impulsó la transformación.' }
		],
		sort_order: 35
	}
];
