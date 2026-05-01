import type { GrammarPoint } from '../types';

// N2 Grammar — 38 core patterns
export const grammar: GrammarPoint[] = [
	{
		pattern: '〜にすぎない',
		meaning_en: 'nothing more than / merely / only',
		meaning_es: 'no es más que / simplemente / solo',
		usage: 'Noun/Verb plain + にすぎない. Minimizes or downplays something.',
		examples: [
			{ jp: 'それは推測にすぎない。', en: 'That is nothing more than a guess.', es: 'Eso no es más que una conjetura.' },
			{ jp: '私は一社員にすぎない。', en: 'I am merely an employee.', es: 'No soy más que un empleado.' },
		],
		sort_order: 1
	},
	{
		pattern: '〜に他ならない',
		meaning_en: 'nothing other than / nothing but',
		meaning_es: 'no es otra cosa que / precisamente',
		usage: 'Noun/Verb plain + に他ならない. Strongly asserts identity or cause.',
		examples: [
			{ jp: 'これは彼の努力の結果に他ならない。', en: 'This is nothing other than the result of his effort.', es: 'Esto no es otra cosa que el resultado de su esfuerzo.' },
		],
		sort_order: 2
	},
	{
		pattern: '〜に反して',
		meaning_en: 'contrary to / against',
		meaning_es: 'contrariamente a / en contra de',
		usage: 'Noun + に反して. Expresses a situation contrary to expectation.',
		examples: [
			{ jp: '期待に反して、結果は悪かった。', en: 'Contrary to expectations, the result was bad.', es: 'Contrariamente a las expectativas, el resultado fue malo.' },
		],
		sort_order: 3
	},
	{
		pattern: '〜に基づいて',
		meaning_en: 'based on / on the basis of',
		meaning_es: 'basado en / con base en',
		usage: 'Noun + に基づいて. Describes the foundation for action or decision.',
		examples: [
			{ jp: 'データに基づいて分析する。', en: 'Analyze based on data.', es: 'Analizar con base en los datos.' },
			{ jp: '事実に基づいた報告書。', en: 'A report based on facts.', es: 'Un informe basado en hechos.' },
		],
		sort_order: 4
	},
	{
		pattern: '〜に際して',
		meaning_en: 'on the occasion of / when',
		meaning_es: 'en la ocasión de / al momento de',
		usage: 'Noun/Verb dict + に際して. Marks a specific occasion or timing.',
		examples: [
			{ jp: '入学に際して、注意事項を確認した。', en: 'On the occasion of enrollment, I confirmed the notes.', es: 'Al momento de la inscripción, confirmé las observaciones.' },
		],
		sort_order: 5
	},
	{
		pattern: '〜にあたって',
		meaning_en: 'on the occasion of / when doing',
		meaning_es: 'al momento de / con ocasión de',
		usage: 'Noun/Verb dict + にあたって. Similar to に際して, used at important moments.',
		examples: [
			{ jp: '卒業にあたって、お礼を言いたい。', en: 'On the occasion of graduation, I want to say thank you.', es: 'Con ocasión de la graduación, quiero dar las gracias.' },
		],
		sort_order: 6
	},
	{
		pattern: '〜においては',
		meaning_en: 'in / at / in terms of (formal)',
		meaning_es: 'en / en términos de (formal)',
		usage: 'Noun + においては. Formal equivalent of では, used in writing.',
		examples: [
			{ jp: 'この分野においては、経験が重要だ。', en: 'In this field, experience is important.', es: 'En este campo, la experiencia es importante.' },
		],
		sort_order: 7
	},
	{
		pattern: '〜をはじめ（として）',
		meaning_en: 'starting with / beginning with / including',
		meaning_es: 'comenzando con / incluyendo',
		usage: 'Noun + をはじめ. Lists representative example plus others.',
		examples: [
			{ jp: '日本語をはじめ、多くの言語が話されている。', en: 'Starting with Japanese, many languages are spoken.', es: 'Comenzando con el japonés, se hablan muchos idiomas.' },
		],
		sort_order: 8
	},
	{
		pattern: '〜をめぐって',
		meaning_en: 'over / concerning / surrounding',
		meaning_es: 'sobre / en torno a',
		usage: 'Noun + をめぐって. Used for debates, disputes centered on a topic.',
		examples: [
			{ jp: '領土問題をめぐって争いが起きた。', en: 'A dispute arose over the territorial issue.', es: 'Surgió una disputa en torno al problema territorial.' },
		],
		sort_order: 9
	},
	{
		pattern: '〜からすると／〜からすれば',
		meaning_en: 'from the perspective of / judging from',
		meaning_es: 'desde el punto de vista de / a juzgar por',
		usage: 'Noun + からすると. Evaluates from a standpoint.',
		examples: [
			{ jp: '常識からすると、あり得ない話だ。', en: 'From common sense, it is an unbelievable story.', es: 'Desde el sentido común, es una historia increíble.' },
		],
		sort_order: 10
	},
	{
		pattern: '〜に関わらず',
		meaning_en: 'regardless of / irrespective of',
		meaning_es: 'independientemente de / sin importar',
		usage: 'Noun + に関わらず. States that something applies in all cases.',
		examples: [
			{ jp: '性別に関わらず、応募できます。', en: 'You can apply regardless of gender.', es: 'Puedes postularte independientemente del género.' },
		],
		sort_order: 11
	},
	{
		pattern: '〜いかんによらず',
		meaning_en: 'regardless of / no matter what',
		meaning_es: 'independientemente de / sea cual sea',
		usage: 'Noun + のいかんによらず. Very formal; found in official documents.',
		examples: [
			{ jp: '理由のいかんによらず、遅刻は禁止だ。', en: 'Regardless of the reason, being late is prohibited.', es: 'Independientemente de la razón, llegar tarde está prohibido.' },
		],
		sort_order: 12
	},
	{
		pattern: '〜ながらも',
		meaning_en: 'even though / although (simultaneous contrast)',
		meaning_es: 'aunque / a pesar de',
		usage: 'Verb/Adj + ながらも. Concedes a fact and contrasts with unexpected reality.',
		examples: [
			{ jp: '貧しいながらも、幸せに暮らしている。', en: 'Even though they are poor, they live happily.', es: 'Aunque son pobres, viven felices.' },
		],
		sort_order: 13
	},
	{
		pattern: '〜はともかく',
		meaning_en: 'setting aside / leaving aside',
		meaning_es: 'dejando de lado / al margen de',
		usage: 'Noun + はともかく. Puts aside one topic to focus on another.',
		examples: [
			{ jp: '費用はともかく、試してみよう。', en: "Setting aside the cost, let's try it.", es: 'Dejando de lado el costo, intentémoslo.' },
		],
		sort_order: 14
	},
	{
		pattern: '〜にしたがって',
		meaning_en: 'as / in accordance with / following',
		meaning_es: 'conforme / de acuerdo con',
		usage: 'Noun/Verb + にしたがって. Compliance with rules or proportional change.',
		examples: [
			{ jp: '規則にしたがって行動する。', en: 'Act in accordance with the rules.', es: 'Actuar de acuerdo con las reglas.' },
			{ jp: '時間が経つにしたがって、痛みが引いた。', en: 'As time passed, the pain subsided.', es: 'Conforme pasó el tiempo, el dolor disminuyó.' },
		],
		sort_order: 15
	},
	{
		pattern: '〜とともに',
		meaning_en: 'together with / as / at the same time as',
		meaning_es: 'junto con / a medida que / al mismo tiempo',
		usage: 'Noun/Verb + とともに. Expresses simultaneous occurrence or companionship.',
		examples: [
			{ jp: '技術の発展とともに、社会が変わった。', en: 'As technology developed, society changed.', es: 'A medida que la tecnología avanzó, la sociedad cambió.' },
		],
		sort_order: 16
	},
	{
		pattern: '〜につれて',
		meaning_en: 'as / in proportion to',
		meaning_es: 'a medida que / a proporción que',
		usage: 'Noun/Verb + につれて. Gradual change in proportion to another change.',
		examples: [
			{ jp: '年を取るにつれて、考え方が変わる。', en: 'As you get older, your way of thinking changes.', es: 'A medida que envejeces, tu forma de pensar cambia.' },
		],
		sort_order: 17
	},
	{
		pattern: '〜に伴い／〜に伴って',
		meaning_en: 'accompanying / along with',
		meaning_es: 'junto con / al mismo tiempo que',
		usage: 'Noun/Verb + に伴い. Formal; expresses things that occur together.',
		examples: [
			{ jp: '経済成長に伴い、物価が上がった。', en: 'Along with economic growth, prices rose.', es: 'Junto con el crecimiento económico, subieron los precios.' },
		],
		sort_order: 18
	},
	{
		pattern: '〜うえに',
		meaning_en: 'in addition to / on top of that',
		meaning_es: 'además de / encima de eso',
		usage: 'Noun/Verb/Adj + うえに. Stacks two negatives or two positives.',
		examples: [
			{ jp: '試験に落ちたうえに、財布も落とした。', en: 'On top of failing the exam, I also dropped my wallet.', es: 'Encima de reprobar el examen, también perdí la billetera.' },
		],
		sort_order: 19
	},
	{
		pattern: '〜ばかりでなく〜も',
		meaning_en: 'not only ... but also',
		meaning_es: 'no solo... sino también',
		usage: 'A + ばかりでなく + B + も. Expands scope beyond the first element.',
		examples: [
			{ jp: '日本ばかりでなく、海外でも有名だ。', en: 'Not only in Japan but also abroad it is famous.', es: 'No solo en Japón sino también en el extranjero es famoso.' },
		],
		sort_order: 20
	},
	{
		pattern: '〜ものの',
		meaning_en: 'although / even though',
		meaning_es: 'aunque / a pesar de que',
		usage: 'Verb/Adj + ものの. The contrast or result is unexpected.',
		examples: [
			{ jp: '分かってはいるものの、実行できない。', en: 'Although I understand, I cannot put it into practice.', es: 'Aunque lo entiendo, no puedo llevarlo a cabo.' },
		],
		sort_order: 21
	},
	{
		pattern: '〜いかん',
		meaning_en: 'depending on / according to',
		meaning_es: 'dependiendo de / según',
		usage: 'Noun + いかん(によっては). Formal; outcome depends on how something goes.',
		examples: [
			{ jp: '努力のいかんによって、結果が変わる。', en: 'The result changes depending on the effort.', es: 'El resultado cambia dependiendo del esfuerzo.' },
		],
		sort_order: 22
	},
	{
		pattern: '〜かねる',
		meaning_en: 'unable to / hesitant to (polite refusal)',
		meaning_es: 'no poder / ser difícil (rechazo educado)',
		usage: 'Verb stem (ます) + かねる. Polite way to say one cannot do something.',
		examples: [
			{ jp: 'その件についてはお答えしかねます。', en: 'I am unable to answer about that matter.', es: 'No me es posible responder sobre ese asunto.' },
		],
		sort_order: 23
	},
	{
		pattern: '〜かねない',
		meaning_en: 'might / there is a risk of',
		meaning_es: 'podría / existe el riesgo de',
		usage: 'Verb stem (ます) + かねない. Warns of an unwanted possible outcome.',
		examples: [
			{ jp: 'そんなことをすると、失敗しかねない。', en: 'If you do such a thing, you might fail.', es: 'Si haces tal cosa, podrías fracasar.' },
		],
		sort_order: 24
	},
	{
		pattern: '〜得る／〜得ない',
		meaning_en: 'can / possible / cannot / impossible',
		meaning_es: 'puede / es posible / no puede / imposible',
		usage: 'Verb stem (ます) + 得る (うる/える). Possibility or impossibility.',
		examples: [
			{ jp: 'そのようなことはあり得る。', en: 'Such a thing is possible.', es: 'Tal cosa es posible.' },
			{ jp: '信じ得ない出来事だ。', en: 'It is an unbelievable event.', es: 'Es un acontecimiento increíble.' },
		],
		sort_order: 25
	},
	{
		pattern: '〜ざるを得ない',
		meaning_en: 'cannot help but / have no choice but to',
		meaning_es: 'no tener más remedio que / verse obligado a',
		usage: 'Verb neg stem + ざるを得ない. Forced by circumstances.',
		examples: [
			{ jp: '状況を考えると、同意せざるを得ない。', en: 'Considering the situation, I have no choice but to agree.', es: 'Considerando la situación, no tengo más remedio que aceptar.' },
		],
		sort_order: 26
	},
	{
		pattern: '〜を余儀なくされる',
		meaning_en: 'to be forced to / compelled to',
		meaning_es: 'verse obligado a / ser forzado a',
		usage: 'Noun/Verb + を余儀なくされる. External pressure forces an action.',
		examples: [
			{ jp: '台風で計画変更を余儀なくされた。', en: 'The typhoon forced us to change the plan.', es: 'El tifón nos obligó a cambiar el plan.' },
		],
		sort_order: 27
	},
	{
		pattern: '〜を通じて／〜を通して',
		meaning_en: 'through / via / throughout',
		meaning_es: 'a través de / por medio de',
		usage: 'Noun + を通じて. Medium, means, or duration.',
		examples: [
			{ jp: '体験を通じて学ぶことが多い。', en: 'There is much to learn through experience.', es: 'Hay mucho que aprender a través de la experiencia.' },
		],
		sort_order: 28
	},
	{
		pattern: '〜の末に',
		meaning_en: 'after / as a result of (long process)',
		meaning_es: 'tras / después de (un largo proceso)',
		usage: 'Noun/Verb た + 末に. Outcome after a long or difficult process.',
		examples: [
			{ jp: '長い議論の末に、結論が出た。', en: 'After a long discussion, a conclusion was reached.', es: 'Tras una larga discusión, se llegó a una conclusión.' },
		],
		sort_order: 29
	},
	{
		pattern: '〜あげく（に）',
		meaning_en: 'after all / in the end (after prolonged negative process)',
		meaning_es: 'al final / después de todo (proceso negativo)',
		usage: 'Verb た/Noun + あげく. Negative or undesirable outcome after effort.',
		examples: [
			{ jp: '迷ったあげく、やめることにした。', en: 'After much deliberation, I decided to quit.', es: 'Tras mucha deliberación, decidí abandonarlo.' },
		],
		sort_order: 30
	},
	{
		pattern: '〜にもかかわらず',
		meaning_en: 'despite / in spite of / nevertheless',
		meaning_es: 'a pesar de / sin embargo',
		usage: 'Noun/Verb/Adj + にもかかわらず. Strong concession.',
		examples: [
			{ jp: '反対意見にもかかわらず、計画を実行した。', en: 'Despite opposition, the plan was carried out.', es: 'A pesar de la oposición, el plan se llevó a cabo.' },
		],
		sort_order: 31
	},
	{
		pattern: '〜以上は',
		meaning_en: 'now that / since / as long as',
		meaning_es: 'ya que / puesto que / mientras que',
		usage: 'Verb plain + 以上は. Since one has committed to an action, consequences follow.',
		examples: [
			{ jp: '始めた以上は、最後までやり遂げる。', en: 'Now that I have started, I will see it through to the end.', es: 'Puesto que ya empecé, lo llevaré hasta el final.' },
		],
		sort_order: 32
	},
	{
		pattern: '〜からには',
		meaning_en: 'now that / since (with resolve)',
		meaning_es: 'ya que / dado que (con determinación)',
		usage: 'Verb plain + からには. Obligation or determination following a commitment.',
		examples: [
			{ jp: '約束したからには、守らなければならない。', en: 'Now that I have promised, I must keep my word.', es: 'Ya que prometí, debo cumplir mi palabra.' },
		],
		sort_order: 33
	},
	{
		pattern: '〜とはいえ',
		meaning_en: 'even so / that said / although',
		meaning_es: 'aun así / aunque / si bien',
		usage: 'Noun/Verb/Adj + とはいえ. Acknowledges a fact but raises a contrasting point.',
		examples: [
			{ jp: '便利とはいえ、依存しすぎは問題だ。', en: 'Even so it is convenient, over-reliance is a problem.', es: 'Aunque es conveniente, depender demasiado es un problema.' },
		],
		sort_order: 34
	},
	{
		pattern: '〜だけあって',
		meaning_en: 'as expected of / because it is',
		meaning_es: 'como era de esperar de / precisamente por ser',
		usage: 'Noun/Verb/Adj + だけあって. Positive result matches the expectation.',
		examples: [
			{ jp: 'プロだけあって、仕事が速い。', en: 'As expected of a professional, the work is fast.', es: 'Como era de esperar de un profesional, el trabajo es rápido.' },
		],
		sort_order: 35
	},
	{
		pattern: '〜かぎりでは',
		meaning_en: 'as far as / within the scope of',
		meaning_es: 'hasta donde / en la medida que',
		usage: 'Noun/Verb + かぎりでは. Restricts a statement to what one knows.',
		examples: [
			{ jp: '私の知るかぎりでは、問題はない。', en: 'As far as I know, there is no problem.', es: 'Hasta donde yo sé, no hay problema.' },
		],
		sort_order: 36
	},
	{
		pattern: '〜に当たる',
		meaning_en: 'to correspond to / to be equivalent to',
		meaning_es: 'corresponder a / equivaler a',
		usage: 'Noun + に当たる. Indicates equivalence or correspondence.',
		examples: [
			{ jp: '今日は卒業式に当たる。', en: 'Today corresponds to graduation day.', es: 'Hoy corresponde al día de graduación.' },
		],
		sort_order: 37
	},
	{
		pattern: '〜に足る',
		meaning_en: 'worthy of / sufficient to',
		meaning_es: 'digno de / suficiente para',
		usage: 'Verb stem + に足る. Indicates something is worthy or meets a standard.',
		examples: [
			{ jp: '信頼するに足る人物だ。', en: 'He is a person worthy of trust.', es: 'Es una persona digna de confianza.' },
		],
		sort_order: 38
	},
];
