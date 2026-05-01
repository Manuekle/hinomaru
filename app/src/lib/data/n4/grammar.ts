import type { GrammarPoint } from '../types';

export const grammar: GrammarPoint[] = [
	{
		pattern: '〜ながら',
		meaning_en: 'While doing (simultaneous actions)',
		meaning_es: 'Mientras hace (acciones simultáneas)',
		usage: 'Verb stem (ます-form without ます) + ながら. Both actions happen at the same time; the main action comes at the end.',
		examples: [
			{
				jp: '音楽を聴きながら勉強します。',
				en: 'I study while listening to music.',
				es: 'Estudio mientras escucho música.'
			},
			{
				jp: '歩きながら話しましょう。',
				en: 'Let\'s talk while walking.',
				es: 'Hablemos mientras caminamos.'
			},
			{
				jp: 'テレビを見ながら食事をするのはよくないです。',
				en: 'Eating while watching TV is not good.',
				es: 'Comer mientras se ve la televisión no es bueno.'
			}
		],
		sort_order: 1
	},
	{
		pattern: '〜てしまう',
		meaning_en: 'End up doing / Do completely (often regretful)',
		meaning_es: 'Terminar haciendo / Completar (a veces con pesar)',
		usage: 'て-form + しまう/しまいます. Expresses completion or an unintended/regrettable result. Casual: ちゃう/じゃう.',
		examples: [
			{
				jp: 'ケーキを全部食べてしまいました。',
				en: 'I ended up eating all the cake.',
				es: 'Me comí todo el pastel.'
			},
			{
				jp: '財布を忘れてしまいました。',
				en: 'I accidentally forgot my wallet.',
				es: 'Olvidé mi billetera sin querer.'
			},
			{
				jp: '大切な書類をなくしてしまいました。',
				en: 'I ended up losing an important document.',
				es: 'Terminé perdiendo un documento importante.'
			}
		],
		sort_order: 2
	},
	{
		pattern: '〜ておく',
		meaning_en: 'Do in advance / Do and leave it that way',
		meaning_es: 'Hacer con anticipación / Hacer y dejarlo así',
		usage: 'て-form + おく/おきます. Expresses doing something in preparation for a future event, or leaving a state as it is.',
		examples: [
			{
				jp: '旅行の前にホテルを予約しておきます。',
				en: 'I will book a hotel in advance before the trip.',
				es: 'Reservaré el hotel con anticipación antes del viaje.'
			},
			{
				jp: '授業の前に教科書を読んでおいてください。',
				en: 'Please read the textbook before class.',
				es: 'Por favor lee el libro de texto antes de clase.'
			},
			{
				jp: '窓を開けておきましょう。',
				en: 'Let\'s leave the window open.',
				es: 'Dejemos la ventana abierta.'
			}
		],
		sort_order: 3
	},
	{
		pattern: '〜てある',
		meaning_en: 'State resulting from a deliberate action',
		meaning_es: 'Estado resultante de una acción deliberada',
		usage: 'Transitive verb て-form + ある. Describes a resulting state left by someone\'s intentional action. Often contrasted with ている.',
		examples: [
			{
				jp: '黒板に予定が書いてあります。',
				en: 'The schedule is written on the blackboard.',
				es: 'El horario está escrito en la pizarra.'
			},
			{
				jp: '部屋の電気が付けてあります。',
				en: 'The room light has been left on.',
				es: 'La luz del cuarto está encendida.'
			},
			{
				jp: '冷蔵庫にジュースが冷やしてあります。',
				en: 'Juice is chilled in the refrigerator.',
				es: 'Hay jugo enfriándose en el refrigerador.'
			}
		],
		sort_order: 4
	},
	{
		pattern: '〜てみる',
		meaning_en: 'Try doing (to see what happens)',
		meaning_es: 'Intentar hacer (para ver qué pasa)',
		usage: 'て-form + みる/みます. Expresses trying something as an experiment or to see the result.',
		examples: [
			{
				jp: 'この料理を作ってみました。',
				en: 'I tried making this dish.',
				es: 'Intenté hacer este plato.'
			},
			{
				jp: '一度日本語で話してみてください。',
				en: 'Please try speaking in Japanese once.',
				es: 'Por favor intenta hablar en japonés una vez.'
			},
			{
				jp: '新しいカフェに行ってみましょう。',
				en: 'Let\'s try going to the new café.',
				es: 'Intentemos ir al nuevo café.'
			}
		],
		sort_order: 5
	},
	{
		pattern: '〜てほしい',
		meaning_en: 'Want someone to do something',
		meaning_es: 'Querer que alguien haga algo',
		usage: 'て-form + ほしい. Expresses desire for another person to perform an action. The person is marked with に.',
		examples: [
			{
				jp: 'もっと早く来てほしいです。',
				en: 'I want you to come earlier.',
				es: 'Quiero que llegues más temprano.'
			},
			{
				jp: '彼に正直に話してほしいです。',
				en: 'I want him to speak honestly.',
				es: 'Quiero que él hable con honestidad.'
			},
			{
				jp: '静かにしてほしいです。',
				en: 'I want you to be quiet.',
				es: 'Quiero que te estés callado.'
			}
		],
		sort_order: 6
	},
	{
		pattern: '〜てよかった',
		meaning_en: 'I\'m glad I did / It was good that...',
		meaning_es: 'Me alegra haber hecho / Fue bueno que...',
		usage: 'て-form + よかった. Expresses relief or gladness about a past action or outcome.',
		examples: [
			{
				jp: '傘を持ってきてよかったです。',
				en: 'I\'m glad I brought an umbrella.',
				es: 'Me alegra haber traído un paraguas.'
			},
			{
				jp: '早めに予約しておいてよかったです。',
				en: 'I\'m glad I made a reservation early.',
				es: 'Me alegra haber hecho la reserva con anticipación.'
			},
			{
				jp: '日本語を勉強してよかったと思います。',
				en: 'I think it was good that I studied Japanese.',
				es: 'Creo que fue bueno que estudié japonés.'
			}
		],
		sort_order: 7
	},
	{
		pattern: '〜てもいい',
		meaning_en: 'It\'s okay to do / You may do',
		meaning_es: 'Está bien hacer / Puedes hacer',
		usage: 'て-form + もいい(です). Grants permission or expresses that something is acceptable. Question form: てもいいですか？',
		examples: [
			{
				jp: 'ここに座ってもいいですか。',
				en: 'May I sit here?',
				es: '¿Puedo sentarme aquí?'
			},
			{
				jp: '宿題は明日出してもいいです。',
				en: 'It\'s okay to submit your homework tomorrow.',
				es: 'Está bien entregar la tarea mañana.'
			},
			{
				jp: '窓を開けてもいいですか。',
				en: 'May I open the window?',
				es: '¿Puedo abrir la ventana?'
			}
		],
		sort_order: 8
	},
	{
		pattern: '〜てはいけない',
		meaning_en: 'Must not do / It\'s not allowed to do',
		meaning_es: 'No se debe hacer / No está permitido hacer',
		usage: 'て-form + はいけない/はいけません. Expresses prohibition. Stronger than てはだめ.',
		examples: [
			{
				jp: '図書館では大きな声で話してはいけません。',
				en: 'You must not speak loudly in the library.',
				es: 'No se debe hablar en voz alta en la biblioteca.'
			},
			{
				jp: '授業中にスマホを使ってはいけません。',
				en: 'You must not use your phone during class.',
				es: 'No se debe usar el teléfono durante la clase.'
			},
			{
				jp: '嘘をついてはいけません。',
				en: 'You must not lie.',
				es: 'No debes mentir.'
			}
		],
		sort_order: 9
	},
	{
		pattern: '〜なければならない',
		meaning_en: 'Must do / Have to do (obligation)',
		meaning_es: 'Deber hacer / Tener que hacer (obligación)',
		usage: 'Verb negative plain form (ない→なければ) + ならない/なりません. Expresses strong obligation. Colloquial: なきゃ.',
		examples: [
			{
				jp: '毎日薬を飲まなければなりません。',
				en: 'I must take medicine every day.',
				es: 'Debo tomar medicamento todos los días.'
			},
			{
				jp: '明日までに報告書を書かなければなりません。',
				en: 'I have to write the report by tomorrow.',
				es: 'Tengo que escribir el informe para mañana.'
			},
			{
				jp: '電車の時間に間に合わなければなりません。',
				en: 'I must catch the train on time.',
				es: 'Debo llegar a tiempo al tren.'
			}
		],
		sort_order: 10
	},
	{
		pattern: '〜なくてもいい',
		meaning_en: 'Don\'t have to do / It\'s not necessary to do',
		meaning_es: 'No es necesario hacer / No hace falta hacer',
		usage: 'Verb negative て-form (なくて) + もいい. Expresses lack of obligation.',
		examples: [
			{
				jp: '今日は来なくてもいいです。',
				en: 'You don\'t have to come today.',
				es: 'No tienes que venir hoy.'
			},
			{
				jp: '全部食べなくてもいいですよ。',
				en: 'You don\'t have to eat everything.',
				es: 'No hace falta que comas todo.'
			},
			{
				jp: '制服を着なくてもいいです。',
				en: 'You don\'t have to wear a uniform.',
				es: 'No es necesario usar uniforme.'
			}
		],
		sort_order: 11
	},
	{
		pattern: '〜ようにする',
		meaning_en: 'Make an effort to do / Try to do (habitual)',
		meaning_es: 'Esforzarse por hacer / Intentar hacer (hábito)',
		usage: 'Dictionary form / ない-form + ようにする. Expresses making a conscious effort to establish or avoid a habit.',
		examples: [
			{
				jp: '毎日野菜を食べるようにしています。',
				en: 'I make an effort to eat vegetables every day.',
				es: 'Me esfuerzo por comer verduras todos los días.'
			},
			{
				jp: '夜遅くまで起きないようにしています。',
				en: 'I try not to stay up too late at night.',
				es: 'Intento no quedarme despierto hasta muy tarde.'
			},
			{
				jp: '毎日運動するようにしましょう。',
				en: 'Let\'s make an effort to exercise every day.',
				es: 'Esforcémonos por hacer ejercicio todos los días.'
			}
		],
		sort_order: 12
	},
	{
		pattern: '〜ようになる',
		meaning_en: 'Come to do / Reach the point of doing (change over time)',
		meaning_es: 'Llegar a hacer / Comenzar a poder hacer (cambio gradual)',
		usage: 'Dictionary form / ない-form + ようになる. Expresses a change in ability, habit, or situation over time.',
		examples: [
			{
				jp: '練習して、泳げるようになりました。',
				en: 'I practiced and became able to swim.',
				es: 'Practiqué y llegué a poder nadar.'
			},
			{
				jp: '日本語が少しわかるようになりました。',
				en: 'I have come to understand a little Japanese.',
				es: 'He llegado a entender un poco de japonés.'
			},
			{
				jp: '最近、早起きするようになりました。',
				en: 'I have recently come to wake up early.',
				es: 'Últimamente he comenzado a despertarme temprano.'
			}
		],
		sort_order: 13
	},
	{
		pattern: '〜ことにする',
		meaning_en: 'Decide to do (personal decision)',
		meaning_es: 'Decidir hacer (decisión personal)',
		usage: 'Dictionary form / ない-form + ことにする/することにしました. Expresses a personal decision or resolution.',
		examples: [
			{
				jp: '来年から日本語を勉強することにしました。',
				en: 'I decided to study Japanese starting next year.',
				es: 'Decidí estudiar japonés a partir del año que viene.'
			},
			{
				jp: 'お酒を飲まないことにしています。',
				en: 'I have decided not to drink alcohol.',
				es: 'He decidido no beber alcohol.'
			},
			{
				jp: '毎朝ジョギングすることにしました。',
				en: 'I decided to jog every morning.',
				es: 'Decidí trotar cada mañana.'
			}
		],
		sort_order: 14
	},
	{
		pattern: '〜ことになる',
		meaning_en: 'It turns out that / It has been decided that',
		meaning_es: 'Resulta que / Se ha decidido que (fuera del control del hablante)',
		usage: 'Dictionary form / ない-form + ことになる/ことになりました. Expresses an outcome decided by external factors, not personal choice.',
		examples: [
			{
				jp: '来月、大阪に転勤することになりました。',
				en: 'It has been decided that I will transfer to Osaka next month.',
				es: 'Se ha decidido que me trasladaré a Osaka el mes que viene.'
			},
			{
				jp: '会議は金曜日に行うことになりました。',
				en: 'It has been decided that the meeting will be held on Friday.',
				es: 'Se ha decidido que la reunión se celebrará el viernes.'
			},
			{
				jp: '彼が新しいリーダーになることになりました。',
				en: 'It turned out that he would become the new leader.',
				es: 'Resultó que él se convertiría en el nuevo líder.'
			}
		],
		sort_order: 15
	},
	{
		pattern: '〜ことができる',
		meaning_en: 'Can do / Be able to do',
		meaning_es: 'Poder hacer / Ser capaz de hacer',
		usage: 'Dictionary form + ことができる/できます. Formal expression of ability or possibility. Interchangeable with potential verb form.',
		examples: [
			{
				jp: '彼女はピアノを弾くことができます。',
				en: 'She is able to play the piano.',
				es: 'Ella es capaz de tocar el piano.'
			},
			{
				jp: 'ここでは泳ぐことができません。',
				en: 'You cannot swim here.',
				es: 'No puedes nadar aquí.'
			},
			{
				jp: '早く起きることができますか。',
				en: 'Are you able to wake up early?',
				es: '¿Puedes despertarte temprano?'
			}
		],
		sort_order: 16
	},
	{
		pattern: '〜ことがある',
		meaning_en: 'There are times when / Have the experience of',
		meaning_es: 'A veces / Haber tenido la experiencia de',
		usage: 'Dictionary/ない-form + ことがある (present habit or occasional occurrence). Past plain form + ことがある (past experience).',
		examples: [
			{
				jp: '朝ごはんを食べないことがあります。',
				en: 'There are times when I don\'t eat breakfast.',
				es: 'A veces no desayuno.'
			},
			{
				jp: '日本に行ったことがあります。',
				en: 'I have been to Japan before.',
				es: 'He ido a Japón antes.'
			},
			{
				jp: '電車に乗り遅れることがあります。',
				en: 'There are times when I miss the train.',
				es: 'A veces pierdo el tren.'
			}
		],
		sort_order: 17
	},
	{
		pattern: '〜はずだ',
		meaning_en: 'Should be / Expected to be (logical expectation)',
		meaning_es: 'Debería ser / Se espera que sea (expectativa lógica)',
		usage: 'Plain form (noun/adj + の/な) + はずだ/はずです. Expresses confident expectation based on logic or prior knowledge.',
		examples: [
			{
				jp: '彼はもう到着しているはずです。',
				en: 'He should have arrived by now.',
				es: 'Ya debería haber llegado.'
			},
			{
				jp: 'この店は今日開いているはずです。',
				en: 'This shop should be open today.',
				es: 'Esta tienda debería estar abierta hoy.'
			},
			{
				jp: '彼女は日本語が話せるはずです。',
				en: 'She should be able to speak Japanese.',
				es: 'Ella debería poder hablar japonés.'
			}
		],
		sort_order: 18
	},
	{
		pattern: '〜らしい',
		meaning_en: 'Seems like / I heard that (hearsay or inference)',
		meaning_es: 'Parece que / He oído que (información indirecta)',
		usage: 'Plain form + らしい. Expresses inference based on hearsay or objective evidence. Also used as suffix meaning "typical of".',
		examples: [
			{
				jp: '明日は雨らしいです。',
				en: 'I heard it will rain tomorrow.',
				es: 'He oído que lloverá mañana.'
			},
			{
				jp: '彼は会社を辞めたらしいです。',
				en: 'It seems that he quit his job.',
				es: 'Parece que renunció a su trabajo.'
			},
			{
				jp: 'あの映画はとても面白いらしいです。',
				en: 'I heard that movie is very interesting.',
				es: 'He oído que esa película es muy interesante.'
			}
		],
		sort_order: 19
	},
	{
		pattern: '〜ようだ／みたいだ',
		meaning_en: 'Looks like / Seems (inference from direct observation)',
		meaning_es: 'Parece que (inferencia de observación directa)',
		usage: 'Plain form + ようだ (formal) / みたいだ (casual). Based on speaker\'s direct sensory observation.',
		examples: [
			{
				jp: '彼は疲れているようです。',
				en: 'He seems to be tired.',
				es: 'Parece que está cansado.'
			},
			{
				jp: '外は寒いみたいです。',
				en: 'It looks cold outside.',
				es: 'Parece que hace frío afuera.'
			},
			{
				jp: '彼女は泣いているようです。',
				en: 'She seems to be crying.',
				es: 'Parece que está llorando.'
			}
		],
		sort_order: 20
	},
	{
		pattern: '〜そうだ',
		meaning_en: '[1] Looks like (appearance) / [2] I heard that (hearsay)',
		meaning_es: '[1] Parece que (apariencia) / [2] He oído que (rumor)',
		usage: '[1] Verb stem / adj stem + そうだ (visual impression). [2] Plain form + そうだ (information from others).',
		examples: [
			{
				jp: '今にも雨が降りそうです。',
				en: 'It looks like it\'s about to rain.',
				es: 'Parece que está a punto de llover.'
			},
			{
				jp: 'このケーキはおいしそうですね。',
				en: 'This cake looks delicious.',
				es: 'Este pastel se ve delicioso.'
			},
			{
				jp: '来週から気温が下がるそうです。',
				en: 'I heard the temperature will drop from next week.',
				es: 'He oído que la temperatura bajará la próxima semana.'
			}
		],
		sort_order: 21
	},
	{
		pattern: '〜かもしれない',
		meaning_en: 'Might be / Possibly / Maybe',
		meaning_es: 'Podría ser / Quizás / Tal vez',
		usage: 'Plain form + かもしれない/かもしれません. Expresses uncertainty or possibility (roughly 50% or less certainty).',
		examples: [
			{
				jp: '明日は雪が降るかもしれません。',
				en: 'It might snow tomorrow.',
				es: 'Quizás nieve mañana.'
			},
			{
				jp: '彼はもう家に帰ったかもしれません。',
				en: 'He might have already gone home.',
				es: 'Tal vez ya se fue a casa.'
			},
			{
				jp: 'この薬は効かないかもしれません。',
				en: 'This medicine might not work.',
				es: 'Quizás este medicamento no funcione.'
			}
		],
		sort_order: 22
	},
	{
		pattern: '〜だろう',
		meaning_en: 'Probably / I suppose (conjecture)',
		meaning_es: 'Probablemente / Supongo que (conjetura)',
		usage: 'Plain form + だろう/でしょう. Expresses the speaker\'s conjecture. でしょう is the polite form.',
		examples: [
			{
				jp: '彼はもう知っているでしょう。',
				en: 'He probably already knows.',
				es: 'Probablemente ya lo sabe.'
			},
			{
				jp: '明日は晴れるでしょう。',
				en: 'It will probably be sunny tomorrow.',
				es: 'Probablemente estará despejado mañana.'
			},
			{
				jp: 'この仕事は難しいだろう。',
				en: 'This job is probably difficult.',
				es: 'Este trabajo probablemente sea difícil.'
			}
		],
		sort_order: 23
	},
	{
		pattern: '〜と思う',
		meaning_en: 'I think that / I believe that',
		meaning_es: 'Creo que / Pienso que',
		usage: 'Plain form + と思う/と思います. Expresses personal opinion or belief.',
		examples: [
			{
				jp: '彼女は正しいと思います。',
				en: 'I think she is right.',
				es: 'Creo que ella tiene razón.'
			},
			{
				jp: 'もっと練習した方がいいと思います。',
				en: 'I think you should practice more.',
				es: 'Creo que deberías practicar más.'
			},
			{
				jp: 'このプランはうまくいかないと思います。',
				en: 'I think this plan won\'t work.',
				es: 'Creo que este plan no funcionará.'
			}
		],
		sort_order: 24
	},
	{
		pattern: '〜と言う',
		meaning_en: 'Say that / Is called',
		meaning_es: 'Decir que / Llamarse',
		usage: 'Plain form + と言う/と言います. Reports speech or names. と言っていた for reporting what someone said in the past.',
		examples: [
			{
				jp: '彼は明日来ないと言いました。',
				en: 'He said he won\'t come tomorrow.',
				es: 'Él dijo que no vendrá mañana.'
			},
			{
				jp: 'これを日本語で何と言いますか。',
				en: 'What do you call this in Japanese?',
				es: '¿Cómo se llama esto en japonés?'
			},
			{
				jp: '先生は宿題を出すと言っていました。',
				en: 'The teacher was saying there would be homework.',
				es: 'El profesor decía que habría tarea.'
			}
		],
		sort_order: 25
	},
	{
		pattern: '〜というのは',
		meaning_en: 'What is meant by / The thing called',
		meaning_es: 'Lo que se entiende por / La cosa llamada',
		usage: 'Noun/phrase + というのは + explanation. Used to define or explain a term or concept.',
		examples: [
			{
				jp: '「侘び寂び」というのは日本の美学の考え方です。',
				en: '"Wabi-sabi" refers to a concept in Japanese aesthetics.',
				es: '"Wabi-sabi" se refiere a un concepto de la estética japonesa.'
			},
			{
				jp: '「JLPT」というのは日本語能力試験のことです。',
				en: '"JLPT" refers to the Japanese Language Proficiency Test.',
				es: '"JLPT" se refiere al Examen de Aptitud en Japonés.'
			},
			{
				jp: '「おもてなし」というのはお客様を大切にする精神です。',
				en: '"Omotenashi" means a spirit of caring for guests.',
				es: '"Omotenashi" significa un espíritu de cuidado hacia los invitados.'
			}
		],
		sort_order: 26
	},
	{
		pattern: '〜によると',
		meaning_en: 'According to',
		meaning_es: 'Según',
		usage: 'Source + によると/によれば + information. Introduces information from a specific source. Often paired with そうだ/らしい.',
		examples: [
			{
				jp: '天気予報によると、明日は雨が降るそうです。',
				en: 'According to the weather forecast, it will rain tomorrow.',
				es: 'Según el pronóstico del tiempo, lloverá mañana.'
			},
			{
				jp: 'ニュースによると、電車が遅れているらしいです。',
				en: 'According to the news, the train seems to be delayed.',
				es: 'Según las noticias, el tren parece estar atrasado.'
			},
			{
				jp: '彼女の話によると、その店はおいしいそうです。',
				en: 'According to what she said, that restaurant is apparently delicious.',
				es: 'Según lo que ella dijo, ese restaurante es aparentemente delicioso.'
			}
		],
		sort_order: 27
	},
	{
		pattern: '〜について',
		meaning_en: 'About / Regarding / Concerning',
		meaning_es: 'Sobre / Acerca de / Con respecto a',
		usage: 'Noun + について(の). Indicates the topic of discussion, thought, or writing.',
		examples: [
			{
				jp: '日本の文化について調べています。',
				en: 'I am researching about Japanese culture.',
				es: 'Estoy investigando sobre la cultura japonesa.'
			},
			{
				jp: '環境問題について話し合いました。',
				en: 'We discussed about environmental issues.',
				es: 'Discutimos sobre los problemas medioambientales.'
			},
			{
				jp: '日本語について質問があります。',
				en: 'I have a question about Japanese.',
				es: 'Tengo una pregunta sobre el japonés.'
			}
		],
		sort_order: 28
	},
	{
		pattern: '〜に対して',
		meaning_en: 'Towards / Against / In contrast to',
		meaning_es: 'Hacia / Contra / En contraste con',
		usage: 'Noun + に対して(の). Expresses an attitude toward someone/something, or contrast between two things.',
		examples: [
			{
				jp: '先生に対して失礼なことを言ってしまいました。',
				en: 'I said something rude towards my teacher.',
				es: 'Le dije algo grosero a mi profesor.'
			},
			{
				jp: '姉が勉強が好きなのに対して、弟は運動が好きです。',
				en: 'In contrast to my sister who likes studying, my brother likes sports.',
				es: 'A diferencia de mi hermana a quien le gusta estudiar, a mi hermano le gusta el deporte.'
			},
			{
				jp: '彼の意見に対して反論しました。',
				en: 'I argued against his opinion.',
				es: 'Argumenté en contra de su opinión.'
			}
		],
		sort_order: 29
	},
	{
		pattern: '〜に比べて',
		meaning_en: 'Compared to / In comparison with',
		meaning_es: 'Comparado con / En comparación con',
		usage: 'Noun + に比べて(の). Draws a comparison between two things.',
		examples: [
			{
				jp: '去年に比べて今年は暑いですね。',
				en: 'Compared to last year, this year is hot.',
				es: 'Comparado con el año pasado, este año hace mucho calor.'
			},
			{
				jp: '東京に比べて大阪は食べ物が安いです。',
				en: 'Compared to Tokyo, food is cheaper in Osaka.',
				es: 'Comparado con Tokio, la comida es más barata en Osaka.'
			},
			{
				jp: '弟に比べて、私は背が高いです。',
				en: 'Compared to my brother, I am taller.',
				es: 'Comparado con mi hermano, soy más alto.'
			}
		],
		sort_order: 30
	},
	{
		pattern: '〜ために',
		meaning_en: 'For the purpose of / Because of / Due to',
		meaning_es: 'Con el propósito de / Para / Por causa de',
		usage: 'Dictionary form / noun + の + ために. [Purpose] with volitional verbs. [Cause] with stative verbs or nouns indicating cause.',
		examples: [
			{
				jp: '健康のために毎日運動しています。',
				en: 'I exercise every day for my health.',
				es: 'Hago ejercicio todos los días por mi salud.'
			},
			{
				jp: '試験に合格するために一生懸命勉強します。',
				en: 'I will study hard in order to pass the exam.',
				es: 'Estudiaré mucho para aprobar el examen.'
			},
			{
				jp: '台風のために電車が止まりました。',
				en: 'The train stopped because of the typhoon.',
				es: 'El tren se detuvo a causa del tifón.'
			}
		],
		sort_order: 31
	},
	{
		pattern: '〜ように',
		meaning_en: 'So that / In order to (achieve a state)',
		meaning_es: 'Para que / De modo que (lograr un estado)',
		usage: 'Dictionary/ない-form + ように. Expresses purpose with non-volitional or potential verbs. Compare with ために (used with volitional verbs).',
		examples: [
			{
				jp: '聞こえるように大きな声で話してください。',
				en: 'Please speak loudly so that I can hear.',
				es: 'Por favor habla en voz alta para que pueda escuchar.'
			},
			{
				jp: '遅れないように早く出発しました。',
				en: 'I left early so as not to be late.',
				es: 'Salí temprano para no llegar tarde.'
			},
			{
				jp: '忘れないようにメモしておきます。',
				en: 'I will write a note so I don\'t forget.',
				es: 'Tomaré nota para no olvidarlo.'
			}
		],
		sort_order: 32
	},
	{
		pattern: '〜ば〜ほど',
		meaning_en: 'The more... the more...',
		meaning_es: 'Cuanto más... más...',
		usage: 'Verb/adj ば-conditional + same word dictionary form + ほど. Expresses proportional increase.',
		examples: [
			{
				jp: '練習すればするほど上手になります。',
				en: 'The more you practice, the better you get.',
				es: 'Cuanto más practicas, mejor te vuelves.'
			},
			{
				jp: '日本語は勉強すればするほど面白くなります。',
				en: 'The more you study Japanese, the more interesting it becomes.',
				es: 'Cuanto más estudias japonés, más interesante se vuelve.'
			},
			{
				jp: '早ければ早いほどいいです。',
				en: 'The sooner the better.',
				es: 'Cuanto antes mejor.'
			}
		],
		sort_order: 33
	},
	{
		pattern: '〜たら',
		meaning_en: 'If / When (conditional: after something happens)',
		meaning_es: 'Si / Cuando (condicional: después de que ocurra algo)',
		usage: 'Past form + ら (たら). Used for if/when conditions. The result may or may not be controllable by the speaker.',
		examples: [
			{
				jp: '家に帰ったら電話してください。',
				en: 'Please call me when you get home.',
				es: 'Por favor llámame cuando llegues a casa.'
			},
			{
				jp: '雨が降ったら、試合は中止です。',
				en: 'If it rains, the match will be cancelled.',
				es: 'Si llueve, el partido se cancelará.'
			},
			{
				jp: '宿題が終わったらゲームをしてもいいです。',
				en: 'You may play games when your homework is done.',
				es: 'Puedes jugar videojuegos cuando termines la tarea.'
			}
		],
		sort_order: 34
	},
	{
		pattern: '〜なら',
		meaning_en: 'If (given that) / In that case',
		meaning_es: 'Si (dado que) / En ese caso',
		usage: 'Plain form + なら. Used when the condition is based on something the listener said or a shared assumption. More about context than sequence.',
		examples: [
			{
				jp: '東京に行くなら、スカイツリーに寄ってください。',
				en: 'If you\'re going to Tokyo, please stop by Tokyo Skytree.',
				es: 'Si vas a Tokio, para en la Torre Skytree.'
			},
			{
				jp: '安いなら買います。',
				en: 'If it\'s cheap, I\'ll buy it.',
				es: 'Si es barato, lo compro.'
			},
			{
				jp: '体の具合が悪いなら、無理しないでください。',
				en: 'If you\'re not feeling well, please don\'t push yourself.',
				es: 'Si no te sientes bien, por favor no te esfuerces.'
			}
		],
		sort_order: 35
	},
	{
		pattern: '〜ても',
		meaning_en: 'Even if / Even though',
		meaning_es: 'Aunque / Incluso si',
		usage: 'て-form + も. Expresses concession — the result happens regardless of the condition.',
		examples: [
			{
				jp: '雨が降っても、試合をします。',
				en: 'Even if it rains, we will play the match.',
				es: 'Aunque llueva, haremos el partido.'
			},
			{
				jp: '疲れていても、運動します。',
				en: 'Even though I\'m tired, I will exercise.',
				es: 'Aunque esté cansado, haré ejercicio.'
			},
			{
				jp: 'どんなに難しくても、あきらめません。',
				en: 'No matter how difficult it is, I won\'t give up.',
				es: 'No importa cuán difícil sea, no me rendiré.'
			}
		],
		sort_order: 36
	},
	{
		pattern: '〜てから',
		meaning_en: 'After doing (sequential actions)',
		meaning_es: 'Después de hacer (acciones secuenciales)',
		usage: 'て-form + から. Expresses that the second action happens after the first is completed.',
		examples: [
			{
				jp: '手を洗ってから食事をします。',
				en: 'I eat after washing my hands.',
				es: 'Como después de lavarme las manos.'
			},
			{
				jp: '日本語を勉強してから日本に来ました。',
				en: 'I came to Japan after studying Japanese.',
				es: 'Vine a Japón después de estudiar japonés.'
			},
			{
				jp: '考えてから返事をします。',
				en: 'I will reply after thinking about it.',
				es: 'Responderé después de pensarlo.'
			}
		],
		sort_order: 37
	},
	{
		pattern: '〜前に',
		meaning_en: 'Before doing',
		meaning_es: 'Antes de hacer',
		usage: 'Dictionary form + 前に / Noun + の前に. Expresses that an action takes place before another. The verb before 前に is always in dictionary form (not past).',
		examples: [
			{
				jp: '寝る前に歯を磨きます。',
				en: 'I brush my teeth before going to sleep.',
				es: 'Me cepillo los dientes antes de dormir.'
			},
			{
				jp: '出かける前に部屋を片付けました。',
				en: 'I tidied up the room before going out.',
				es: 'Ordené el cuarto antes de salir.'
			},
			{
				jp: '試験の前に復習しておきましょう。',
				en: 'Let\'s review before the exam.',
				es: 'Repasemos antes del examen.'
			}
		],
		sort_order: 38
	}
];
