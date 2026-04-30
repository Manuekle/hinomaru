export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface LyricLine {
	time: number; // segundos desde video start (absoluto)
	text: string; // Japanese lyrics
	romaji?: string;
	translation_es: string;
	translation_en: string;
}

export interface SongVocab {
	jp: string;
	kana: string;
	romaji?: string;
	en: string;
	es: string;
}

export interface SongLesson {
	id: string;
	level: JLPTLevel;
	title: string;
	artist: string;
	start: string; // mm:ss — clip start
	end: string; // mm:ss — clip end (~30s later)
	focus: { es: string; en: string };
	difficulty: number; // 1–5
	youtubeId: string; // YouTube video ID (verificado y funcional)
	lyrics: LyricLine[]; // timestamped lyrics for the clip
	vocab?: SongVocab[]; // 3–5 key vocabulary words
}

export function parseTime(mmss: string): number {
	const [m, s] = mmss.split(':').map(Number);
	return m * 60 + s;
}

export const jlptSongs: SongLesson[] = [
	// 🟢 Nivel N5 (Muy básico)
	{
		id: 'anpanman-march',
		level: 'N5',
		title: 'アンパンマンのマーチ',
		artist: 'ドリーミング',
		start: '00:00',
		end: '01:10',
		focus: { es: 'Frases de aliento y propósito', en: 'Encouragement and purpose' },
		difficulty: 1,
		youtubeId: '5mLape5F0Fw',
		lyrics: [
			{
				time: 3.0,
				text: 'そうだ おそれないで みんなのために あいとゆうきだけが ともだちさ',
				romaji: 'sou da osorenaide minna no tame ni ai to yuuki dake ga tomodachi sa',
				translation_es:
					'¡Así es! No tengas miedo, hazlo por todos. El amor y el valor son tus únicos amigos.',
				translation_en:
					'Yes, that’s right! Don’t be afraid. Stand up for everyone. Only love and courage are your friends.'
			},
			{
				time: 23.0,
				text: 'なにが君の しあわせ なにをして よろこぶ',
				romaji: 'nani ga kimi no shiawase nani wo shite yorokobu',
				translation_es: '¿Qué es lo que te hace feliz? ¿Qué es lo que te da alegría?',
				translation_en: 'What is your happiness? What makes you joyful?'
			},
			{
				time: 28.0,
				text: 'わからないまま おわる そんなのは いやだ！',
				romaji: 'wakaranai mama owaru sonna no wa iya da!',
				translation_es: 'No quiero terminar sin haberlo descubierto.',
				translation_en: 'I don’t want it to end without ever knowing!'
			},
			{
				time: 33.0,
				text: 'わすれないで ゆめを こぼさないで なみだ だから 君は とぶんだ',
				romaji: 'wasurenaide yume wo kobosanaide namida dakara kimi wa tobunda',
				translation_es: 'No olvides tus sueños ni derrames tus lágrimas; por eso volarás',
				translation_en: "Don't forget your dreams, don't shed your tears; that is why you'll fly"
			},
			{
				time: 40.0,
				text: 'どこまでも そうだ おそれないで みんなのために',
				romaji: 'doko made mo sou da osorenaide minna no tame ni',
				translation_es: 'A donde sea. ¡Así es! No tengas miedo, hazlo por todos.',
				translation_en: "Anywhere you want. Yes, that's right! Don't be afraid, for everyone's sake"
			},
			{
				time: 48.0,
				text: 'あいとゆうきだけが ともだちさ ああ アンパンマン',
				romaji: 'ai to yuuki dake ga tomodachi sa aa Anpanman',
				translation_es: 'El amor y el valor son tus únicos amigos. ¡Ah, ah! Anpanman.',
				translation_en: 'Only love and courage are your friends. Ah, ah! Anpanman'
			},
			{
				time: 55.0,
				text: 'やさしい君は 行け！みんなのゆめ まもるため',
				romaji: 'yasashii kimi wa ike! minna no yume mamoru tame',
				translation_es: 'Tú que eres tan amable, ¡ve! Ve a proteger los sueños de todos.',
				translation_en: 'You, who are so kind, go! Go protect everyone’s dreams'
			}
		],
		vocab: [
			{ jp: '幸せ', kana: 'しあわせ', romaji: 'shiawase', en: 'happiness', es: 'felicidad' },
			{ jp: '喜び', kana: 'よろこび', romaji: 'yorokobi', en: 'joy', es: 'alegría' },
			{ jp: '夢', kana: 'ゆめ', romaji: 'yume', en: 'dream', es: 'sueño' },
			{ jp: '涙', kana: 'なみだ', romaji: 'namida', en: 'tears', es: 'lágrimas' },
			{ jp: '守る', kana: 'まもる', romaji: 'mamoru', en: 'to protect', es: 'proteger' }
		]
	},
	{
		id: 'odoru-ponpokorin',
		level: 'N5',
		title: 'おどるポンポコリン',
		artist: 'Ado',
		start: '00:00',
		end: '01:25',
		focus: {
			es: 'Onomatopeyas y vocabulario cotidiano',
			en: 'Onomatopoeia and everyday vocabulary'
		},
		difficulty: 1,
		youtubeId: 'TZYqDl19qLQ',
		lyrics: [
			{
				time: 14.0,
				text: 'なんでもかんでも みんな おどっているよ',
				romaji: 'nan demo kan demo minna odotte iru yo',
				translation_es: 'Cualquier cosa, todo el mundo está bailando.',
				translation_en: 'Anything and everything, everyone is dancing.'
			},
			{
				time: 21.0,
				text: 'おなべのなかから ボワっと インチキおじさん とうじょう',
				romaji: 'onabe no naka kara bowatto inchiki ojisan toujou',
				translation_es: 'Desde adentro de la olla, ¡puf! aparece el hombre tramposo.',
				translation_en: 'From inside the pot, poof! The phony old man appears.'
			},
			{
				time: 27.0,
				text: 'いつだって わすれない エジソンは えらいひと',
				romaji: 'itsu datte wasurenai Ejison wa erai hito',
				translation_es: 'Siempre recordaremos que Edison fue un gran hombre.',
				translation_en: "We'll never forget that Edison was a great man."
			},
			{
				time: 34.8,
				text: 'そんなのじょうしき タッタタラリラ',
				romaji: 'sonna no joushiki tatta tararira',
				translation_es: 'Eso es de sentido común. ¡Tatta-tararira!',
				translation_en: "That's just common sense. Tatta-tararira!"
			},
			{
				time: 41.0,
				text: 'ぴいはら、ぴいはら、ぱっぱぱらぱ',
				romaji: 'piihara, piihara, pappaparapa',
				translation_es: '¡Pii-hara, pii-hara! ¡Pappa-parapa!',
				translation_en: 'Pii-hara, pii-hara! Pappa-parapa!'
			},
			{
				time: 45.0,
				text: 'ぴいはら、ぴいはら、ぱっぱぱらぱ',
				romaji: 'piihara, piihara, pappaparapa',
				translation_es: '¡Pii-hara, pii-hara! ¡Pappa-parapa!',
				translation_en: 'Pii-hara, pii-hara! Pappa-parapa!'
			},
			{
				time: 48.0,
				text: 'ぴいはら、ぴいはら、おへそがちらり',
				romaji: 'piihara, piihara, oheso ga chirari',
				translation_es: '¡Pii-hara, pii-hara! ¡Se asoma el ombligo!',
				translation_en: 'Pii-hara, pii-hara! The belly button peekaboo!'
			},
			{
				time: 54.0,
				text: 'たったらりら',
				romaji: 'tattararira',
				translation_es: '¡Tatta-rarira!',
				translation_en: 'Tatta-rarira!'
			},
			{
				time: 55.0,
				text: 'ぴいはら、ぴいはら、ぱっぱぱらぱ',
				romaji: 'piihara, piihara, pappaparapa',
				translation_es: '¡Pii-hara, pii-hara! ¡Pappa-parapa!',
				translation_en: 'Pii-hara, pii-hara! Pappa-parapa!'
			},
			{
				time: 58.8,
				text: 'ぴいはら、ぴいはら、おどるぽんぽこりん',
				romaji: 'piihara, piihara, odoru ponpokorin',
				translation_es: '¡Pii-hara, pii-hara! ¡Bailando el Ponpokorin!',
				translation_en: 'Pii-hara, pii-hara! Dancing the Ponpokorin!'
			},
			{
				time: 62.0,
				text: 'ぴいはらぴ、おなかがへったよ',
				romaji: 'piihara pi, onaka ga hetta yo',
				translation_es: '¡Pii-hara-pi! Tengo hambre.',
				translation_en: "Pii-hara-pi! I'm hungry."
			},
			{
				time: 69.0,
				text: 'ぴいはら、ぴいはら、ぱっぱぱらぱ',
				romaji: 'piihara, piihara, pappaparapa',
				translation_es: '¡Pii-hara, pii-hara! ¡Pappa-parapa!',
				translation_en: 'Pii-hara, pii-hara! Pappa-parapa!'
			},
			{
				time: 72.0,
				text: 'ぴいはら、ぴいはら、おどるぽんぽこりん',
				romaji: 'piihara, piihara, odoru ponpokorin',
				translation_es: '¡Pii-hara, pii-hara! ¡Bailando el Ponpokorin!',
				translation_en: 'Pii-hara, pii-hara! Dancing the Ponpokorin!'
			},
			{
				time: 75.8,
				text: 'ぴいはらぴ、おなかがへったよ',
				romaji: 'piihara pi, onaka ga hetta yo',
				translation_es: '¡Pii-hara-pi! Tengo hambre.',
				translation_en: "Pii-hara-pi! I'm hungry."
			}
		],
		vocab: [
			{ jp: '踊る', kana: 'おどる', romaji: 'odoru', en: 'to dance', es: 'bailar' },
			{ jp: '登場', kana: 'とうじょう', romaji: 'toujou', en: 'appearance', es: 'aparición' },
			{
				jp: '常識',
				kana: 'じょうしき',
				romaji: 'joushiki',
				en: 'common sense',
				es: 'sentido común'
			},
			{
				jp: '偉い',
				kana: 'えらい',
				romaji: 'erai',
				en: 'great / admirable',
				es: 'admirable / gran persona'
			},
			{
				jp: 'お腹が空く',
				kana: 'おなかがすく',
				romaji: 'onaka ga suku',
				en: 'to get hungry',
				es: 'tener hambre'
			}
		]
	},
	{
		id: 'we-are',
		level: 'N5',
		title: 'ウィーアー！ (We Are!)',
		artist: 'きただにひろし',
		start: '00:30',
		end: '01:51',
		focus: { es: 'Verbos de movimiento y búsqueda', en: 'Verbs of movement and search' },
		difficulty: 1,
		youtubeId: '0OdExTY2D8M',
		lyrics: [
			{
				time: 30.0,
				text: 'ありったけのゆめをかきあつめ さがしものをさがしにいくのさ ONE PIECE!',
				romaji: 'arittake no yume wo kakiatsume sagashimono wo sagashi ni yuku no sa ONE PIECE!',
				translation_es:
					'Reuniendo todos mis sueños, voy en busca de lo que estoy buscando. ¡One Piece!',
				translation_en:
					"Gathering all my dreams, I'm going in search of what I'm looking for. One Piece!"
			},
			{
				time: 48.0,
				text: 'らしんばんなんて じゅうたいのもと ねつにうかされ かじをとるのさ',
				romaji: 'rashinban nante juutai no moto netsu ni ukasare kaji wo toru no sa',
				translation_es:
					'Una brújula solo causaría retrasos, así que tomo el timón guiado por mi pasión.',
				translation_en:
					'A compass would only cause delays, so I take the helm driven by my passion.'
			},
			{
				time: 59.0,
				text: 'ホコリかぶってた たからのちずも たしかめたのなら でんせつじゃない！',
				romaji: 'hokori kabutteta takara no chizu mo tashikameta no nara densetsu ja nai!',
				translation_es:
					'Si confirmamos ese mapa del tesoro lleno de polvo, dejará de ser una leyenda.',
				translation_en: "If we confirm that dusty treasure map, it won't be a legend anymore."
			},
			{
				time: 72.0,
				text: 'こじんてきなあらしは だれかの バイオリズムのっかって おもいすごせばいい！',
				romaji: 'kojinteki na arashi wa dareka no baiorizumu nokkatte omoisugoseba ii!',
				translation_es:
					'Si una tormenta personal llega, solo súbete al biorritmo de alguien más y déjala pasar.',
				translation_en:
					"If a personal storm comes, just ride someone else's biorhythm and let it pass."
			},
			{
				time: 86.0,
				text: 'ありったけのゆめをかきあつめ さがしものをさがしにいくのさ',
				romaji: 'arittake no yume wo kakiatsume sagashimono wo sagashi ni yuku no sa',
				translation_es: 'Reuniendo todos mis sueños, voy en busca de lo que estoy buscando.',
				translation_en: "Gathering all my dreams, I'm going in search of what I'm looking for."
			},
			{
				time: 97.0,
				text: 'ポケットのコイン それと you wanna be my friend?',
				romaji: 'poketto no koin soreto you wanna be my friend?',
				translation_es: 'Monedas en el bolsillo, y además... ¿quieres ser mi amigo?',
				translation_en: 'Coins in my pocket, and besides... you wanna be my friend?'
			},
			{
				time: 103.0,
				text: 'We are, we are on the cruise! ウィーアー！',
				romaji: 'We are, we are on the cruise! Wiiaa!',
				translation_es: '¡Estamos, estamos en el crucero! ¡WE ARE!',
				translation_en: 'We are, we are on the cruise! WE ARE!'
			}
		],
		vocab: [
			{ jp: '夢', kana: 'ゆめ', romaji: 'yume', en: 'dream', es: 'sueño' },
			{ jp: '捜す', kana: 'さがす', romaji: 'sagasu', en: 'to search for', es: 'buscar' },
			{ jp: '宝', kana: 'たから', romaji: 'takara', en: 'treasure', es: 'tesoro' },
			{ jp: '地図', kana: 'ちず', romaji: 'chizu', en: 'map', es: 'mapa' },
			{ jp: '伝説', kana: 'でんせつ', romaji: 'densetsu', en: 'legend', es: 'leyenda' }
		]
	},

	// 🟢 Nivel N4 (Básico)
	{
		id: 'blue-bird',
		level: 'N4',
		title: 'ブルーバード',
		artist: 'いきものがかり',
		start: '00:00',
		end: '01:29',
		focus: { es: 'Expresiones de vuelo y libertad', en: 'Expressions of flight and freedom' },
		difficulty: 3,
		youtubeId: 'KpsJWFuVTdI', // ✅ verificado
		lyrics: [
			{
				time: 1.0,
				text: 'はばたいたら もどれないといって めざしたのは あおい あおい あの空',
				romaji: 'habataitara modorenai to itte mezashita no wa aoi aoi ano sora',
				translation_es:
					'Dijiste que al volar no volverías. Lo que buscabas era aquel cielo azul, tan azul.',
				translation_en:
					"You said if you spread your wings, you can't come back. What you aimed for was that blue, blue sky."
			},
			{
				time: 26.0,
				text: 'かなしみはまだ覚えられず せつなさは今つかみはじめた',
				romaji: 'kanashimi wa mada oboerarezu setsunasa wa ima tsukami hajimeta',
				translation_es:
					'Aún no puedo recordar la tristeza, pero he empezado a comprender la nostalgia.',
				translation_en: "I can't yet remember 'sadness', but I've started to grasp 'pain'."
			},
			{
				time: 32.0,
				text: 'あなたへと抱くこの感情も 今言葉に変わっていく',
				romaji: 'anata e to idaku kono kanjou mo ima kotoba ni kawatte iku',
				translation_es:
					'Este sentimiento que tengo por ti, ahora se está convirtiendo en palabras.',
				translation_en: 'This feeling I have for you is now turning into words.'
			},
			{
				time: 39.0,
				text: '未知なる世界のゆめからめざめて この羽を広げ飛び立つ',
				romaji: 'michi naru sekai no yume kara mezamete kono hane wo hiroge tobitatsu',
				translation_es:
					'Despertando del sueño de un mundo desconocido, extiendo mis alas y emprendo el vuelo.',
				translation_en:
					'Waking from a dream of an unknown world, I spread these wings and fly away.'
			},
			{
				time: 51.0,
				text: 'はばたいたら もどれないといって めざしたのは しろい しろい あの雲',
				romaji: 'habataitara modorenai to itte mezashita no wa shiroi shiroi ano kumo',
				translation_es:
					'Dijiste que al volar no volverías. Lo que buscabas era aquella nube blanca, tan blanca.',
				translation_en:
					"You said if you spread your wings, you can't come back. What you aimed for was that white, white cloud."
			},
			{
				time: 64.0,
				text: '突き抜けたら 見つかると知って 振り切るほど あおい あおい あの空',
				romaji: 'tsukinuketara mitsukaru to shitte furikiru hodo aoi aoi ano sora',
				translation_es:
					'Sabiendo que lo encontraré si lo atravieso, aquel cielo azul, tan azul, que parece sacudirse de encima.',
				translation_en:
					"Knowing I'll find it if I break through, that blue, blue sky, enough to shake everything off."
			},
			{
				time: 77.0,
				text: 'あおい あおい あの空 あおい あおい あの空',
				romaji: 'aoi aoi ano sora aoi aoi ano sora',
				translation_es: 'Aquel cielo azul, tan azul. Aquel cielo azul, tan azul.',
				translation_en: 'That blue, blue sky. That blue, blue sky.'
			}
		],
		vocab: [
			{ jp: '羽ばたく', kana: 'はばたく', romaji: 'habataku', en: 'to flap wings', es: 'aletear' },
			{ jp: '目指す', kana: 'めざす', romaji: 'mezasu', en: 'to aim for', es: 'apuntar a' },
			{
				jp: '切なさ',
				kana: 'せつなさ',
				romaji: 'setsunasa',
				en: 'sadness / pain',
				es: 'tristeza / dolor emocional'
			},
			{ jp: '鼓動', kana: 'こどう', romaji: 'kodou', en: 'heartbeat', es: 'latido / pulsación' },
			{
				jp: '飛び立つ',
				kana: 'とびたつ',
				romaji: 'tobitatsu',
				en: 'to take flight',
				es: 'emprender el vuelo'
			}
		]
	},
	{
		id: 'hikaru-nara',
		level: 'N4',
		title: '光るなら (Hikaru Nara)',
		artist: 'Goose house',
		start: '00:04.5',
		end: '01:33',
		focus: { es: 'Estados emocionales y naturaleza', en: 'Emotional states and nature' },
		difficulty: 2,
		youtubeId: 'IeJTNN8_jLI',
		lyrics: [
			{
				time: 21.5,
				text: 'あめあがりのにじも りんとさいた花も',
				romaji: 'ameagari no niji mo rin to saita hana mo',
				translation_es: 'Tanto el arcoíris tras la lluvia como la flor que floreció valiente.',
				translation_en: 'Both the rainbow after the rain and the flower that bloomed bravely.'
			},
			{
				time: 28.0,
				text: '色付きあふれだす あかねいろの空 あおぐ君に あの日こいにおちた',
				romaji: 'irozuki afuredasu akaneiro no sora aogu kimi ni ano hi koi ni ochita',
				translation_es:
					'Aquel día me enamoré de ti, mientras mirabas el cielo carmesí que se llenaba de colores.',
				translation_en:
					'That day I fell in love with you, as you looked up at the crimson sky filling with color.'
			},
			{
				time: 45.0,
				text: '瞬間のドラマティック フィルムの中のひとこまも',
				romaji: 'shunkan no doramatikku firumu no naka no hitokoma mo',
				translation_es: 'Incluso este momento es dramático, como una escena en una película.',
				translation_en: 'Even this moment is dramatic, like a scene in a film.'
			},
			{
				time: 51.0,
				text: '消えないよ 心にきざむから',
				romaji: 'kienai yo kokoro ni kizamu kara',
				translation_es: 'No desaparecerá, porque lo grabaré en mi corazón.',
				translation_en: "It won't disappear, because I'll carve it into my heart."
			},
			{
				time: 60.0,
				text: '君だよ 君なんだよ 教えてくれた',
				romaji: 'kimi da yo kimi nan da yo oshiete kureta',
				translation_es: 'Eres tú, eres tú quien me lo enseñó.',
				translation_en: "It's you, it was you who taught me."
			},
			{
				time: 66.0,
				text: 'くらやみも光るなら 星空になる',
				romaji: 'kurayami mo hikaru nara hoshizora ni naru',
				translation_es: 'Si la oscuridad también brilla, se convertirá en un cielo estrellado.',
				translation_en: "If even the darkness shines, it'll become a starry sky."
			},
			{
				time: 72.0,
				text: 'かなしみを笑顔に もうかくさないで',
				romaji: 'kanashimi wo egao ni mou kakusanaide',
				translation_es: 'Convirtiendo la tristeza en sonrisas, ya no la escondas más.',
				translation_en: "Turning sadness into smiles, don't hide it anymore."
			},
			{
				time: 78.0,
				text: 'きらめく どんな星も 君をてらすから',
				romaji: 'kirameku donna hoshi mo kimi wo terasu kara',
				translation_es: 'Porque cualquier estrella que brille te iluminará.',
				translation_en: 'Because any star that sparkles will shine on you.'
			},
			{
				time: 86.0,
				text: 'ねむりもわすれて むかえたあさひが',
				romaji: 'nemuri mo wasurete mukaeta asahi ga',
				translation_es: 'Olvidando el sueño, el sol de la mañana que recibí.',
				translation_en: 'Forgetting sleep, the morning sun I greeted.'
			}
		],
		vocab: [
			{ jp: '光る', kana: 'ひかる', romaji: 'hikaru', en: 'to shine', es: 'brillar' },
			{
				jp: '星空',
				kana: 'ほしぞら',
				romaji: 'hoshizora',
				en: 'starry sky',
				es: 'cielo estrellado'
			},
			{ jp: '笑顔', kana: 'えがお', romaji: 'egao', en: 'smile', es: 'sonrisa' },
			{
				jp: '瞬間',
				kana: 'しゅんかん',
				romaji: 'shunkan',
				en: 'moment / instant',
				es: 'momento / instante'
			},
			{ jp: '震える', kana: 'ふるえる', romaji: 'furueru', en: 'to tremble', es: 'temblar' }
		]
	},
	{
		id: 'butterfly',
		level: 'N4',
		title: 'Butter-Fly',
		artist: '和田光司',
		start: '00:00',
		end: '01:35',
		focus: { es: 'Intención y futuro', en: 'Intent and future' },
		difficulty: 2,
		youtubeId: 'jB7ecG_12x8', // ✅ CORREGIDO — Canal oficial Digimon (Digimon Adventure Opening Video)
		lyrics: [
			{
				time: 18.5,
				text: 'ごきげんなちょうになって きらめく風に乗って',
				romaji: 'gokigen na chou ni natte kirameku kaze ni notte',
				translation_es:
					'Convirtiéndome en una mariposa alegre, montando el viento resplandeciente.',
				translation_en: 'Becoming a cheerful butterfly, riding the sparkling wind.'
			},
			{
				time: 24.0,
				text: '今すぐ君に会いに行こう',
				romaji: 'ima sugu kimi ni ai ni ikou',
				translation_es: 'Iré a verte ahora mismo.',
				translation_en: "I'll go see you right now."
			},
			{
				time: 30.5,
				text: 'よけいなことなんて わすれたほうがましさ',
				romaji: 'yokei na koto nante wasureta hou ga mashi sa',
				translation_es: 'Es mejor olvidar las cosas innecesarias.',
				translation_en: "It's better to forget about unnecessary things."
			},
			{
				time: 36.0,
				text: 'これ以上 しゃれてる時間はない',
				romaji: 'kore ijou shareteru jikan wa nai',
				translation_es: 'No hay más tiempo para andarse con rodeos.',
				translation_en: "There's no more time for messing around."
			},
			{
				time: 42.0,
				text: '何が wow wow wow wow wow この空に届くのだろう',
				romaji: 'nani ga wow wow wow wow wow kono sora ni todoku no darou',
				translation_es: '¿Qué será lo que llegará a este cielo?',
				translation_en: 'I wonder what will reach this sky?'
			},
			{
				time: 47.8,
				text: 'だけど wow wow wow wow wow 明日の予定もわからない',
				romaji: 'dakedo wow wow wow wow wow ashita no yotei mo wakaranai',
				translation_es: 'Pero ni siquiera sé qué haré mañana.',
				translation_en: "But I don't even know my plans for tomorrow."
			},
			{
				time: 56.5,
				text: 'むげんだいなゆめのあとの なにもない世の中じゃ',
				romaji: 'mugendai na yume no ato no nani mo nai yo no naka ja',
				translation_es: 'En este mundo vacío tras un sueño infinito.',
				translation_en: 'In this empty world after an infinite dream.'
			},
			{
				time: 63.0,
				text: 'そうさ いとしい思いも負けそうになるけど',
				romaji: 'sou sa itoshii omoi mo makesou ni naru kedo',
				translation_es: 'Sí, parece que hasta mis sentimientos más queridos van a perder, pero...',
				translation_en: "Yeah, even my beloved feelings seem like they're going to lose, but..."
			},
			{
				time: 68.0,
				text: 'Stay しがちなイメージだらけの たよりないつばさでも',
				romaji: 'Stay shigachi na imeeji darake no tayorinai tsubasa demo',
				translation_es: 'Incluso con estas alas poco fiables, llenas de imágenes de estancamiento.',
				translation_en: 'Even with these unreliable wings, full of images of staying still.'
			},
			{
				time: 75.0,
				text: 'きっととべるさ On my love',
				romaji: 'kitto toberu sa On my love',
				translation_es: 'Seguro que podré volar, con mi amor.',
				translation_en: "I'm sure I can fly, on my love."
			}
		],
		vocab: [
			{ jp: '蝶', kana: 'ちょう', romaji: 'chou', en: 'butterfly', es: 'mariposa' },
			{ jp: '煌めく', kana: 'きらめく', romaji: 'kirameku', en: 'to sparkle', es: 'resplandecer' },
			{ jp: '余計', kana: 'よけい', romaji: 'yokei', en: 'unnecessary / extra', es: 'innecesario' },
			{
				jp: '無限大',
				kana: 'むげんだい',
				romaji: 'mugendai',
				en: 'infinite / limitless',
				es: 'infinito'
			},
			{ jp: '翼', kana: 'つばさ', romaji: 'tsubasa', en: 'wings', es: 'alas' }
		]
	},

	// 🟡 Nivel N3 (Intermedio)
	{
		id: 'guren-no-yumiya',
		level: 'N3',
		title: '紅蓮の弓矢',
		artist: 'Linked Horizon',
		start: '00:00',
		end: '01:32',
		focus: { es: 'Vocabulario de combate y épica', en: 'Combat and epic vocabulary' },
		difficulty: 3,
		youtubeId: 'AW5_k_Cf4wM', // ✅ TVアニメ「進撃の巨人」ノンクレジットOP
		lyrics: [
			{
				time: 0.5,
				text: 'Seid ihr das Essen? Nein, wir sind der Jäger!',
				romaji: 'Seid ihr das Essen? Nein, wir sind der Jäger!',
				translation_es: '¿Sois vosotros la comida? ¡No, nosotros somos los cazadores!',
				translation_en: 'Are you the food? No, we are the hunters!'
			},
			{
				time: 15.0,
				text: '踏まれた花の 名前も知らずに',
				romaji: 'fumareta hana no namae mo shirazu ni',
				translation_es: 'Sin saber siquiera el nombre de la flor pisoteada.',
				translation_en: 'Without even knowing the name of the trampled flower.'
			},
			{
				time: 20.0,
				text: '地に堕ちた鳥は 風を待ちわびる',
				romaji: 'chi ni ochita tori wa kaze wo machiwabiru',
				translation_es: 'El ave que cayó a tierra espera ansiosa el viento.',
				translation_en: 'The bird that fell to earth waits anxiously for the wind.'
			},
			{
				time: 25.0,
				text: '祈ったところで 何も変わらない',
				romaji: 'inotta tokoro de nanimo kawaranai',
				translation_es: 'Por mucho que reces, nada cambiará.',
				translation_en: 'No matter how much you pray, nothing will change.'
			},
			{
				time: 31.0,
				text: '今を変えるのは 戦う覚悟だ',
				romaji: 'ima wo kaeru no wa tatakau kakugo da',
				translation_es: 'Lo único que puede cambiar el ahora es la determinación de luchar.',
				translation_en: 'What changes the present is the determination to fight.'
			},
			{
				time: 36.0,
				text: 'しかばね踏み越えて 進む意志を わらう豚よ',
				romaji: 'shikabane fumikoete susumu ishi wo warau buta yo',
				translation_es: 'Cerdos que se ríen de la voluntad de avanzar sobre los cadáveres.',
				translation_en: 'Oh pigs who mock the will to advance over corpses.'
			},
			{
				time: 41.0,
				text: '家畜の安寧 虚偽の繁栄',
				romaji: "kachiku no an'nei kyogi no han'ei",
				translation_es: 'La paz del ganado, la prosperidad de las mentiras.',
				translation_en: 'The peace of livestock, the prosperity of lies.'
			},
			{
				time: 44.0,
				text: '死せる餓狼の『自由』を！',
				romaji: "shiseru garou no 'jiyuu' wo!",
				translation_es: "¡La 'libertad' del lobo hambriento moribundo!",
				translation_en: "The 'freedom' of the dying hungry wolf!"
			},
			{
				time: 47.0,
				text: '囚われた屈辱は 反撃のこうしだ',
				romaji: 'torawareta kutsujoku wa hangeki no koushi da',
				translation_es: 'La humillación de estar atrapado es la flecha del contraataque.',
				translation_en:
					'The humiliation of being imprisoned is the opening arrow of the counterattack.'
			},
			{
				time: 52.0,
				text: '城壁のその彼方 獲物をほふる イェーガー！',
				romaji: 'jouheki no sono kanata emono wo hofuru Ieegaa!',
				translation_es: 'Más allá de las murallas, masacra a la presa... ¡Jäger!',
				translation_en: 'Beyond those castle walls, slaughter the prey... Jäger!'
			},
			{
				time: 57.0,
				text: 'ほとばしる衝動に その身をきながら',
				romaji: 'hotobashiru shoudou ni sono mi wo yakinagara',
				translation_es: 'Mientras ardes en ese impulso que brota.',
				translation_en: 'While burning in that surging impulse.'
			},
			{
				time: 63.0,
				text: '黄昏にひをうがつ 紅蓮の弓矢',
				romaji: 'tasogare ni hi wo ugatsu guren no yumiya',
				translation_es: 'Perforando el carmesí en el crepúsculo, la flecha de loto carmesí.',
				translation_en: 'Piercing the scarlet into the twilight, the crimson bow and arrow.'
			}
		],
		vocab: [
			{ jp: '屍', kana: 'しかばね', romaji: 'shikabane', en: 'corpse', es: 'cadáver' },
			{ jp: '家畜', kana: 'かちく', romaji: 'kachiku', en: 'livestock', es: 'ganado' },
			{ jp: '自由', kana: 'じゆう', romaji: 'jiyuu', en: 'freedom', es: 'libertad' },
			{ jp: '反撃', kana: 'はんげき', romaji: 'hangeki', en: 'counterattack', es: 'contraataque' },
			{ jp: '紅蓮', kana: 'ぐれん', romaji: 'guren', en: 'crimson / scarlet', es: 'carmesí' }
		]
	},
	{
		id: 'fly-high',
		level: 'N3',
		title: 'FLY HIGH!!',
		artist: 'BURNOUT SYNDROMES',
		start: '00:00',
		end: '01:30',
		focus: { es: 'Superación y esfuerzo', en: 'Overcoming and effort' },
		difficulty: 3,
		youtubeId: 'SV0B0KEgSqQ', // ✅ MV oficial Epic Records Japan
		lyrics: [
			{
				time: 0.0,
				text: '飛べ FLY HIGH!! 汗と血と涙で',
				romaji: 'tobe FLY HIGH!! ase to chi to namida de',
				translation_es: '¡Vuela, vuela alto! Con sudor, sangre y lágrimas.',
				translation_en: 'Fly, FLY HIGH!! With sweat, blood, and tears.'
			},
			{
				time: 6.0,
				text: '光る翼で今全部全部置き去って',
				romaji: 'hikaru tsubasa de ima zenbu zenbu okizatte',
				translation_es: 'Con alas brillantes, deja todo atrás ahora mismo.',
				translation_en: 'With shining wings, leave everything behind right now.'
			},
			{
				time: 10.0,
				text: '飛べ FLY 高く FLY 最果ての未来へ',
				romaji: 'tobe FLY takaku FLY saihate no mirai e',
				translation_es: 'Vuela, vuela alto, hacia el futuro más lejano.',
				translation_en: 'Fly, fly high, toward the furthest future.'
			},
			{
				time: 21.5,
				text: '傷だらけの若鳥が 空を睨んでる',
				romaji: 'kizudarake no wakadori ga sora wo niranderu',
				translation_es: 'Un ave joven cubierta de heridas mira fijamente al cielo.',
				translation_en: 'A young bird covered in wounds is glaring at the sky.'
			},
			{
				time: 32.0,
				text: '低空飛行する奴らが 嗤おうと 海の果てが見たい',
				romaji: 'teikuu hikou suru yatsura ga waraou to umi no hate ga mitai',
				translation_es: 'Aunque se rían los que vuelan bajo, quiero ver el fin del mar.',
				translation_en: 'Even if those flying low mock me, I want to see the edge of the sea.'
			},
			{
				time: 41.5,
				text: '心を無にして 向かい風に乗り 助走を付けて',
				romaji: 'kokoro wo mu ni shite mukaikaze ni nori josou wo tsukete',
				translation_es: 'Vaciando mi corazón, montando el viento en contra y tomando impulso.',
				translation_en: 'Emptying my heart, riding the headwind and gaining speed.'
			},
			{
				time: 51.5,
				text: '(Hop step jump で)',
				romaji: '(Hop step jump de)',
				translation_es: '(Con un salto, paso y brinco)',
				translation_en: '(With a hop, step, and jump)'
			},
			{
				time: 55.0,
				text: '飛べ FLY HIGH!! 汗と血と涙で',
				romaji: 'tobe FLY HIGH!! ase to chi to namida de',
				translation_es: '¡Vuela, vuela alto! Con sudor, sangre y lágrimas.',
				translation_en: 'Fly, FLY HIGH!! With sweat, blood, and tears.'
			},
			{
				time: 61.0,
				text: '光る翼が君をどこへだって連れて行く',
				romaji: 'hikaru tsubasa ga kimi wo doko e datte tsurete iku',
				translation_es: 'Tus alas brillantes te llevarán a donde sea.',
				translation_en: 'Those shining wings will take you anywhere.'
			},
			{
				time: 65.0,
				text: '青い衝動と本能と爪牙を むき出しにして',
				romaji: 'aoi shoudou to honnou to souga wo mukidashi ni shite',
				translation_es: 'Exponiendo tu impulso azul, tu instinto y tus garras.',
				translation_en: 'Baring your blue impulse, instinct, and fangs.'
			},
			{
				time: 71.0,
				text: '艱難な旅路も 夢叶うまで 何度だって',
				romaji: 'kannan na tabiji mo yume kanau made nando datte',
				translation_es:
					'Incluso en este viaje lleno de dificultades, hazlo cuantas veces sea necesario hasta que tu sueño se cumpla.',
				translation_en:
					'Even on this arduous journey, do it as many times as it takes until your dream comes true.'
			},
			{
				time: 75.0,
				text: '飛べ FLY 高く FLY 最果ての未来へ',
				romaji: 'tobe FLY takaku FLY saihate no mirai e',
				translation_es: 'Vuela, vuela alto, hacia el futuro más lejano.',
				translation_en: 'Fly, fly high, toward the furthest future.'
			}
		],
		vocab: [
			{ jp: '翼', kana: 'つばさ', romaji: 'tsubasa', en: 'wings', es: 'alas' },
			{
				jp: '睨む',
				kana: 'にらむ',
				romaji: 'niramu',
				en: 'to glare / stare at',
				es: 'mirar fijamente / fulminar'
			},
			{ jp: '衝動', kana: 'しょうどう', romaji: 'shoudou', en: 'impulse / urge', es: 'impulso' },
			{
				jp: '爪牙',
				kana: 'そうが',
				romaji: 'souga',
				en: 'claws and fangs',
				es: 'garras y colmillos'
			},
			{
				jp: '艱難',
				kana: 'かんなん',
				romaji: 'kannan',
				en: 'hardship / trial',
				es: 'dificultad / tribulación'
			}
		]
	},
	{
		id: 'again',
		level: 'N3',
		title: 'Again',
		artist: 'YUI',
		start: '00:00',
		end: '01:29',
		focus: { es: 'Remordimiento y nuevos comienzos', en: 'Regret and new beginnings' },
		difficulty: 3,
		youtubeId: 'elyXcwunIYA', // ✅ Fullmetal Alchemist: Brotherhood OP1
		lyrics: [
			{
				time: 0.0,
				text: 'このおもいを消してしまうには まだ人生長いでしょ',
				romaji: 'kono omoi wo keshite shimau ni wa mada jinsei nagai desho',
				translation_es: 'Todavía queda mucha vida por delante como para borrar estos sentimientos.',
				translation_en: 'You still have too long a life left to erase these feelings completely.'
			},
			{
				time: 7.0,
				text: 'やり残してること やり直してみたいから',
				romaji: 'yarinokoshiteru koto yarinaoshite mitai kara',
				translation_es: 'Porque quiero volver a intentar las cosas que dejé sin terminar.',
				translation_en: 'Because I want to try redoing the things I left undone.'
			},
			{
				time: 22.0,
				text: 'ゆめのつづき 追いかけていたはずなのに',
				romaji: 'yume no tsuzuki oikakete ita hazu na noni',
				translation_es:
					'A pesar de que se suponía que estaba persiguiendo la continuación de mi sueño.',
				translation_en: 'Even though I was supposed to be chasing the continuation of my dream.'
			},
			{
				time: 29.0,
				text: 'まがりくねった 細い道 人につまずく',
				romaji: 'magarikunetta hosoi michi hito ni tsumazuku',
				translation_es: 'Tropiezo con la gente en este camino estrecho y sinuoso.',
				translation_en: 'I stumble over people on this narrow, winding road.'
			},
			{
				time: 35.0,
				text: 'あの頃みたいにって 戻りたいわけじゃないの',
				romaji: 'ano koro mitai ni tte modoritai wake ja nai no',
				translation_es: 'No es que quiera volver a ser como en aquellos días.',
				translation_en: "It's not that I want to go back to how things were then."
			},
			{
				time: 38.0,
				text: '無くしてきた空を 探してる',
				romaji: 'nakushite kita sora wo sagashiteru',
				translation_es: 'Estoy buscando el cielo que he perdido.',
				translation_en: "I'm searching for the sky I've lost."
			},
			{
				time: 42.0,
				text: 'わかってくれますように ぎせいになったような',
				romaji: 'wakatte kuremasu you ni gisei ni natta you na',
				translation_es: 'Espero que lo entiendas, como si me hubiera convertido en un sacrificio.',
				translation_en: 'I hope you understand, as if I had become a sacrifice.'
			},
			{
				time: 45.0,
				text: '悲しい顔はやめてよ',
				romaji: 'kanashii kao wa yamete yo',
				translation_es: 'Deja de poner esa cara triste.',
				translation_en: 'Stop making that sad face.'
			},
			{
				time: 48.0,
				text: 'つみの最後はなみだじゃないよ ずっと苦しくせおってくんだ',
				romaji: 'tsumi no saigo wa namida ja nai yo zutto kurushiku seotte kun da',
				translation_es:
					'El final del pecado no son las lágrimas; es cargarlo con dolor para siempre.',
				translation_en: "The end of sin isn't tears; it's carrying it painfully forever."
			},
			{
				time: 52.0,
				text: '出口見えない感情めいろに 誰を待ってるの',
				romaji: 'deguchi mienai kanjou meiro ni dare wo matteru no',
				translation_es: '¿A quién esperas en este laberinto emocional sin salida?',
				translation_en: 'Who are you waiting for in this emotional maze with no exit?'
			},
			{
				time: 56.0,
				text: '白いノートに綴ったように もっとすなおに吐き出したいよ',
				romaji: 'shiroi nooto ni tsuzutta you ni motto sunao ni hakidashitai yo',
				translation_es:
					'Quiero expresarme con más honestidad, como si estuviera escribiendo en un cuaderno en blanco.',
				translation_en: 'I want to speak out more honestly, like writing in a white notebook.'
			},
			{
				time: 59.0,
				text: '何から 逃れたいんだ 現実ってやつ',
				romaji: 'nani kara nogaretai nda genjitsu tte yatsu',
				translation_es: '¿De qué quieres escapar? De eso llamado realidad.',
				translation_en: 'What do you want to escape from? That thing called reality.'
			},
			{
				time: 62.0,
				text: '叶えるために 生きてるんだって さけびたくなるよ 聞こえていますか',
				romaji: 'kanaeru tame ni ikiteru nda tte sakebitaku naru yo kikoete imasu ka',
				translation_es: 'Me dan ganas de gritar que vivo para cumplir mis deseos, ¿puedes oírme?',
				translation_en:
					'It makes me want to shout that I live to make them come true, can you hear me?'
			},
			{
				time: 69.0,
				text: 'ぶなんになんて やってられないから 帰る場所も無いの',
				romaji: 'bunan ni nante yatterarenai kara kaeru basho mo nai no',
				translation_es:
					'No puedo simplemente ir a lo seguro, porque no tengo un lugar al que volver.',
				translation_en: "I can't just take it safe, because I have no place to go back to."
			},
			{
				time: 75.8,
				text: "やさしさにはいつもかんしゃしている だから強くなりたい (I'm on the way)",
				romaji: "yasashisa ni wa itsumo kansha shite iru dakara tsuyoku naritai (I'm on the way)",
				translation_es: 'Siempre estoy agradecida por tu amabilidad, por eso quiero ser fuerte.',
				translation_en: "I'm always grateful for your kindness, that's why I want to be strong."
			},
			{
				time: 82.7,
				text: '懐かしくなる こんな痛みもかんげいじゃん',
				romaji: 'natsukashiku naru konna itami mo kangei jan',
				translation_es: 'Incluso este dolor que se siente nostálgico es bienvenido.',
				translation_en: 'Even pain like this that becomes nostalgic is welcome.'
			}
		],
		vocab: [
			{
				jp: '想い',
				kana: 'おもい',
				romaji: 'omoi',
				en: 'thought / feeling',
				es: 'pensamiento / sentimiento'
			},
			{
				jp: '曲がりくねる',
				kana: 'まがりくねる',
				romaji: 'magarikuneru',
				en: 'to wind / meander',
				es: 'ser sinuoso / dar vueltas'
			},
			{ jp: '犠牲', kana: 'ぎせい', romaji: 'gisei', en: 'sacrifice', es: 'sacrificio' },
			{ jp: '迷路', kana: 'めいろ', romaji: 'meiro', en: 'maze', es: 'laberinto' },
			{ jp: '叫ぶ', kana: 'さけぶ', romaji: 'sakebu', en: 'to shout / yell', es: 'gritar' }
		]
	},

	// 🟠 Nivel N2 (Intermedio alto)
	{
		id: 'goya-no-machiawase',
		level: 'N2',
		title: '午夜の待ち合わせ',
		artist: 'Hello Sleepwalkers',
		start: '00:00',
		end: '01:30',
		focus: { es: 'Vocabulario urbano y nocturno', en: 'Urban and nightly vocabulary' },
		difficulty: 4,
		youtubeId: '36rkVIr_hsA', // ✅ MV oficial Hello Sleepwalkers (Full Version)
		lyrics: [
			{
				time: 10.5,
				text: '弾丸込めた小銃を 僕は片手に持っている',
				romaji: 'dangan kometa shoujuu wo boku wa katate ni motte iru',
				translation_es: 'Sostengo un fusil cargado con balas en una mano.',
				translation_en: "I'm holding a rifle loaded with bullets in one hand."
			},
			{
				time: 15.5,
				text: '震えた君の居る場所へ 足を早め向かっている',
				romaji: 'furueta kimi no iru basho e ashi wo hayame mukatte iru',
				translation_es: 'Me apresuro hacia el lugar donde estás tú, temblando.',
				translation_en: "I'm hurrying toward the place where you are, trembling."
			},
			{
				time: 20.0,
				text: 'チクタク 針はチクタクと 焦る心を急かしただけ',
				romaji: 'chikutaku hari wa chikutaku to aseru kokoro wo sekashita dake',
				translation_es: 'Tic-tac, las manecillas solo apresuran mi corazón impaciente.',
				translation_en: 'Tick-tock, the hands just hurried my impatient heart.'
			},
			{
				time: 25.0,
				text: 'チクタク 針はチクタクと 留まる気配もなく 進んでいく',
				romaji: 'chikutaku hari wa chikutaku to todomaru kehai mo naku susunde iku',
				translation_es: 'Tic-tac, las manecillas avanzan sin intención de detenerse.',
				translation_en: 'Tick-tock, the hands advance without any sign of stopping.'
			},
			{
				time: 31.0,
				text: 'チクタク 針はチクタクと 終わりと始まりの境目',
				romaji: 'chikutaku hari wa chikutaku to owari to hajimari no sakaime',
				translation_es: 'Tic-tac, las manecillas marcan el límite entre el final y el comienzo.',
				translation_en: 'Tick-tock, the hands mark the border between the end and the beginning.'
			},
			{
				time: 36.0,
				text: 'チクタク 針はチクタクと 全て重なった',
				romaji: 'chikutaku hari wa chikutaku to subete kasanatta',
				translation_es: 'Tic-tac, las manecillas... todo se superpuso.',
				translation_en: 'Tick-tock, the hands... everything overlapped.'
			},
			{
				time: 41.0,
				text: '並行して 僕は待っていた',
				romaji: 'hekoushite, boku wa matteita',
				translation_es: 'En paralelo, yo estaba esperando.',
				translation_en: 'In parallel, I was waiting.'
			},
			{
				time: 43.0,
				text: '薄暗い部屋 一人きり',
				romaji: 'usugurai heya, hitori kiri',
				translation_es: 'Solo en una habitación tenuemente iluminada.',
				translation_en: 'Alone in a dimly lit room.'
			},
			{
				time: 46.0,
				text: '並行して 僕は待っていた',
				romaji: 'hekoushite, boku wa matteita',
				translation_es: 'En paralelo, yo estaba esperando.',
				translation_en: 'In parallel, I was waiting.'
			},
			{
				time: 48.0,
				text: 'ドアを蹴破る その音を',
				romaji: 'doa wo keyaburu, sono oto wo',
				translation_es: 'El sonido de la puerta siendo derribada.',
				translation_en: 'The sound of the door being kicked in.'
			},
			{
				time: 51.0,
				text: '並行して 僕が待っていた',
				romaji: 'hekoushite, boku ga matteita',
				translation_es: 'En paralelo, yo era quien estaba esperando.',
				translation_en: 'In parallel, I was the one waiting.'
			},
			{
				time: 53.0,
				text: '薄暗い部屋 一人きり',
				romaji: 'usugurai heya, hitori kiri',
				translation_es: 'Solo en una habitación tenue.',
				translation_en: 'Alone in a dim room.'
			},
			{
				time: 56.0,
				text: '並行して 僕が待っていた',
				romaji: 'hekoushite, boku ga matteita',
				translation_es: 'En paralelo, yo estaba esperando.',
				translation_en: 'In parallel, I was waiting.'
			},
			{
				time: 58.0,
				text: 'もう恐れることはないよ',
				romaji: 'mou osoreru koto wa nai yo',
				translation_es: 'Ya no hay nada que temer.',
				translation_en: "There's nothing left to fear."
			},
			{
				time: 61.0,
				text: '弾丸込めた小銃を持って',
				romaji: 'dangan kometa shoujuu wo motte',
				translation_es: 'Con un fusil cargado en mano,',
				translation_en: 'Holding a rifle loaded with bullets,'
			},
			{
				time: 63.5,
				text: '固く閉ざされたドアを蹴破った',
				romaji: 'kataku tozasareta doa wo keyabutta',
				translation_es: 'derribé la puerta firmemente cerrada.',
				translation_en: 'I kicked down the tightly shut door.'
			},
			{
				time: 66.0,
				text: '吸い付いた銃口が跳ねて',
				romaji: 'suitsuita juukou ga hanete',
				translation_es: 'El cañón adherido rebotó,',
				translation_en: 'The clinging gun muzzle bounced,'
			},
			{
				time: 69.0,
				text: '昨日の僕を貫いた',
				romaji: 'kinou no boku wo tsuranuita',
				translation_es: 'y atravesó al yo de ayer.',
				translation_en: 'and pierced the me of yesterday.'
			},
			{
				time: 71.0,
				text: 'おやすみ その絶望を受け取って',
				romaji: 'oyasumi, sono zetsubou wo uketotte',
				translation_es: 'Buenas noches, acepta esa desesperación.',
				translation_en: 'Good night, accept that despair.'
			},
			{
				time: 74.0,
				text: '明日への僕は歩き始めた',
				romaji: 'ashita he no boku wa aruki hajimeta',
				translation_es: 'El yo del mañana comenzó a caminar.',
				translation_en: 'The me of tomorrow started to walk.'
			},
			{
				time: 77.0,
				text: 'また今夜待ち合わせよう',
				romaji: "mata kon'ya machiawase you",
				translation_es: 'Volvamos a encontrarnos esta noche.',
				translation_en: "Let's meet again tonight."
			}
		],
		vocab: [
			{ jp: '弾丸', kana: 'だんがん', romaji: 'dangan', en: 'bullet', es: 'bala' },
			{
				jp: '小銃',
				kana: 'しょうじゅう',
				romaji: 'shoujuu',
				en: 'rifle / small arms',
				es: 'fusil'
			},
			{
				jp: '境目',
				kana: 'さかいめ',
				romaji: 'sakaime',
				en: 'border / boundary',
				es: 'límite / frontera'
			},
			{ jp: '絶望', kana: 'ぜつぼう', romaji: 'zetsubou', en: 'despair', es: 'desesperación' },
			{
				jp: '貫く',
				kana: 'つらぬく',
				romaji: 'tsuranuku',
				en: 'to pierce through',
				es: 'atravesar'
			}
		]
	},
	{
		id: 're-re',
		level: 'N2',
		title: 'Re:Re:',
		artist: 'ASIAN KUNG-FU GENERATION',
		start: '00:00',
		end: '01:29',
		focus: { es: 'Pasado y arrepentimiento', en: 'Past and regret' },
		difficulty: 4,
		youtubeId: 'fodAJ-1dN3I', // ✅ verificado
		lyrics: [
			{
				time: 13.0,
				text: '君を待った 僕は待った 途切れない明日も過ぎて行って',
				romaji: 'kimi wo matta boku wa matta togirenai ashita mo sugite itte',
				translation_es:
					'Te esperé, te esperé, mientras los mañanas ininterrumpidos seguían pasando.',
				translation_en: 'I waited for you, I waited, as the continuous tomorrows kept passing by.'
			},
			{
				time: 19.0,
				text: '立ち止まって振り返って とめどない hoy を嘆き合った',
				romaji: 'tachidomatte furikaette tomedonai kyou wo nagekiatta',
				translation_es: 'Deteniéndome y mirando atrás, lamentamos juntos este hoy sin fin.',
				translation_en: 'Stopping and looking back, we lamented this endless today together.'
			},
			{
				time: 25.0,
				text: '記憶だって永遠になんて 残らないものと思い知って',
				romaji: 'kioku datte eien ni nante nokoranai mono to omoishitte',
				translation_es:
					'Comprendiendo que incluso los recuerdos no son algo que dure para siempre.',
				translation_en: "Realizing that even memories aren't something that remains forever."
			},
			{
				time: 31.0,
				text: '僕はずっと掻きむしって 心の隅っこで泣いた',
				romaji: 'boku wa zutto kakimushitte kokoro no sumikko de naita',
				translation_es: 'Me desgarré por dentro y lloré en un rincón de mi corazón.',
				translation_en: 'I kept tearing at myself and cried in a corner of my heart.'
			},
			{
				time: 36.5,
				text: 'そしてどうかなくさないでよって 高架下、過ぎる日々を',
				romaji: 'soshite douka nakusanaide yo tte koukashita sugiru hibi wo',
				translation_es:
					"Y rogando: 'por favor, no los pierdas', a los días que pasan bajo el paso elevado.",
				translation_en:
					"And pleading 'please don't lose them', to the days passing under the elevated tracks."
			},
			{
				time: 44.0,
				text: '後悔してんだよってそう言い逃したあの日',
				romaji: 'koukai shite nda yo tte sou iinogashita ano hi',
				translation_es: "Diciendo: 'me arrepiento', aquel día que perdí la oportunidad de hablar.",
				translation_en: "Saying 'I regret it', that day I missed the chance to say it."
			},
			{
				time: 50.0,
				text: '君を待った 僕は待った 途切れない明日も過ぎて行って',
				romaji: 'kimi wo matta boku wa matta togirenai ashita mo sugite itte',
				translation_es:
					'Te esperé, te esperé, mientras los mañanas ininterrumpidos seguían pasando.',
				translation_en: 'I waited for you, I waited, as the continuous tomorrows kept passing by.'
			},
			{
				time: 56.0,
				text: '僕は今日も掻きむしって 忘れない傷をつけているんだよ',
				romaji: 'boku wa kyou mo kakimushitte wasurenai kizu wo tsukete iru nda yo',
				translation_es: 'Hoy también me desgarro, dejándome una herida que no olvidaré.',
				translation_en: "Today too I'm tearing at myself, leaving a wound I'll never forget."
			},
			{
				time: 67.0,
				text: '君じゃないとさ',
				romaji: 'kimi ja nai to sa',
				translation_es: 'Si no eres tú...',
				translation_en: "If it's not you..."
			}
		],
		vocab: [
			{
				jp: '途切れる',
				kana: 'とぎれる',
				romaji: 'togireru',
				en: 'to be interrupted / break off',
				es: 'interrumpirse / cortarse'
			},
			{
				jp: '嘆く',
				kana: 'なげく',
				romaji: 'nageku',
				en: 'to lament / grieve',
				es: 'lamentar / llorar'
			},
			{
				jp: '掻きむしる',
				kana: 'かきむしる',
				romaji: 'kakimushiru',
				en: 'to tear at / scratch hard',
				es: 'desgarrar / arañar con fuerza'
			},
			{
				jp: '後悔',
				kana: 'こうかい',
				romaji: 'koukai',
				en: 'regret / remorse',
				es: 'arrepentimiento / remordimiento'
			},
			{
				jp: '言い逃す',
				kana: 'いいのがす',
				romaji: 'iinogasu',
				en: 'to miss the chance to say',
				es: 'perder la oportunidad de decir'
			}
		]
	},
	{
		id: 'unravel',
		level: 'N2',
		title: 'unravel',
		artist: 'TK from 凛として時雨',
		start: '00:00',
		end: '01:25',
		focus: { es: 'Psicología y distorsión', en: 'Psychology and distortion' },
		difficulty: 4,
		youtubeId: '7aMOurgDB-o', // ✅ Tokyo Ghoul OP (TV Size)
		lyrics: [
			{
				time: 0.0,
				text: '教えて 教えてよ その仕組みを 僕の中に誰がいるの?',
				romaji: 'oshiete oshiete yo sono shikumi wo boku no naka ni dare ga iru no?',
				translation_es: 'Dime, dime cómo funciona esto, ¿quién hay dentro de mí?',
				translation_en: 'Tell me, tell me how it works, who is inside of me?'
			},
			{
				time: 14.0,
				text: '壊れた 壊れたよ この世界で 君が笑う 何も見えずに',
				romaji: 'kowareta kowareta yo kono sekai de kimi ga warau nani mo miezu ni',
				translation_es: 'Se rompió, se rompió este mundo en el que tú te ríes sin ver nada.',
				translation_en: 'It broke, this world broke where you laugh without seeing anything.'
			},
			{
				time: 41.0,
				text: '壊れた僕なんてさ 息を止めて',
				romaji: 'kowareta boku nante sa iki wo tomete',
				translation_es: 'Alguien tan roto como yo... deteniendo el aliento.',
				translation_en: 'Someone as broken as me... holding my breath.'
			},
			{
				time: 47.0,
				text: 'Freeze',
				romaji: 'Freeze',
				translation_es: 'Congélate',
				translation_en: 'Freeze'
			},
			{
				time: 48.0,
				text: '壊せる 壊せない 狂える 狂えない あなたを見つけて 揺れた',
				romaji: 'kowaseru kowasenai kurueru kuruenai anata wo mitsukete yureta',
				translation_es:
					'Puedo romperlo, no puedo, puedo enloquecer, no puedo; te encontré y mi mundo tembló.',
				translation_en: "I can break it, I can't, I can go mad, I can't; I found you and I wavered."
			},
			{
				time: 55.0,
				text: '歪んだ世界にだんだん 僕は透き通って見えなくなって',
				romaji: 'yuganda sekai ni dandan boku wa sukitootte mienakunatte',
				translation_es:
					'En este mundo distorsionado, poco a poco me vuelvo transparente hasta desaparecer.',
				translation_en: "In this distorted world, I'm gradually becoming transparent and invisible."
			},
			{
				time: 62.0,
				text: '見つけないで 僕のことを 見つめないで',
				romaji: 'mitsukenaide boku no koto wo mitsumenaide',
				translation_es: 'No me encuentres, no me mires fijamente.',
				translation_en: "Don't find me, don't look at me."
			},
			{
				time: 69.0,
				text: '誰かが描いた世界の中で あなたを傷つけたくはないよ',
				romaji: 'dareka ga egaita sekai no naka de anata wo kizutsuketaku wa nai yo',
				translation_es: 'En este mundo que alguien dibujó, no quiero herirte.',
				translation_en: "In this world that someone drew, I don't want to hurt you."
			},
			{
				time: 76.5,
				text: '覚えていて 僕のことを',
				romaji: 'oboete ite boku no koto wo',
				translation_es: 'Recuérdame, por favor.',
				translation_en: 'Please, remember me.'
			}
		],
		vocab: [
			{
				jp: '仕組み',
				kana: 'しくみ',
				romaji: 'shikumi',
				en: 'mechanism / structure',
				es: 'mecanismo / estructura'
			},
			{
				jp: '狂う',
				kana: 'くるう',
				romaji: 'kuruu',
				en: 'to go mad / go insane',
				es: 'enloquecer / volverse loco'
			},
			{
				jp: '揺れる',
				kana: 'ゆれる',
				romaji: 'yureru',
				en: 'to shake / sway',
				es: 'temblar / oscilar'
			},
			{
				jp: '歪む',
				kana: 'ゆがむ',
				romaji: 'yugamu',
				en: 'to be distorted / warped',
				es: 'distorsionarse / torcerse'
			},
			{
				jp: '透き通る',
				kana: 'すきとおる',
				romaji: 'sukitooru',
				en: 'to be transparent',
				es: 'ser transparente / traslúcido'
			}
		]
	},

	// 🔴 Nivel N1 (Avanzado)
	{
		id: 'kaikai-kitan',
		level: 'N1',
		title: '廻廻奇譚',
		artist: 'Eve',
		start: '00:00',
		end: '01:30',
		focus: { es: 'Vocabulario abstracto y complejo', en: 'Abstract and complex vocabulary' },
		difficulty: 5,
		youtubeId: 'v8bZVdTgXoY', // ✅ MV oficial Eve (Full Version)
		lyrics: [
			{
				time: 18.0,
				text: '有象無象 人の成り 虚聖深傷 人外もののけみたいだ',
				romaji: 'uzou muzou hito no nari kyosei shinshou jingai mononoke mitai da',
				translation_es:
					'La gente corriente, las heridas profundas de la falsa santidad; parece algo inhumano, un mononoke.',
				translation_en:
					"The masses, the deep wounds of false holiness; it's like something inhuman, a mononoke."
			},
			{
				time: 23.0,
				text: '虚心坦懐 命宿し あとはぱっぱらぱな中身なき人間',
				romaji: 'kyoshin tankai inochi yadoshi ato wa pappara pa na nakami naki ningen',
				translation_es:
					'Con la mente abierta, albergando vida; el resto son humanos vacíos y atolondrados.',
				translation_en:
					'With an open mind, harboring life; the rest are empty, light-headed humans.'
			},
			{
				time: 29.0,
				text: '寄せる期待 不平等な人生 才能もない 大乗非日常が',
				romaji: 'yoseru kitai fubyoudou na jinsei sainou mo nai daijou hi nichijou ga',
				translation_es:
					'Expectativas que se acercan, una vida desigual; lo extraordinario de lo cotidiano sin talento.',
				translation_en:
					'Approaching expectations, an unequal life; the extraordinary in the everyday without talent.'
			},
			{
				time: 34.0,
				text: '怨親平等に没個性 辿る記憶 僕に居場所などないから',
				romaji: 'onshin byoudou ni botsu kosei tadoru kioku boku ni ibasho nado nai kara',
				translation_es:
					'Tratando a todos por igual sin individualidad; siguiendo recuerdos, porque no tengo un lugar al que pertenecer.',
				translation_en:
					'Treating everyone equally without individuality; tracing memories, because I have no place to belong.'
			},
			{
				time: 40.0,
				text: '夢の狭間で泣いてないで どんな顔すればいいか分かってる',
				romaji: 'yume no hazama de naitenaide donna kao sureba ii ka wakatteru',
				translation_es: 'No llores en la brecha entre los sueños; sé qué cara poner.',
				translation_en: "Don't cry in the gap between dreams; I know what kind of face to make."
			},
			{
				time: 45.0,
				text: 'だけどまだ応えてくれよ',
				romaji: 'dakedomada kotaete kure yo',
				translation_es: 'Pero todavía tienes que responder',
				translation_en: 'But you still have to answer me'
			},
			{
				time: 48.0,
				text: '闇を祓って 闇を祓って 夜の帳が下りたら合図だ',
				romaji: 'yami wo haratte yami wo haratte yoru no tobari ga oritara aizu da',
				translation_es:
					'Exorciza la oscuridad, exorciza la oscuridad; cuando baje el velo de la noche, será la señal.',
				translation_en:
					"Exorcise the darkness, exorcise the darkness; when the veil of night falls, it's the signal."
			},
			{
				time: 53.5,
				text: '相対して回る感情線 戯言などは吐き捨て行けと',
				romaji: 'aitai shite mawaru kanjousen zaregoto nado wa hakisute ike to',
				translation_es:
					'Enfrentándome a las líneas emocionales que giran; vete escupiendo las tonterías.',
				translation_en: 'Facing the revolving emotional lines; go while spitting out the nonsense.'
			},
			{
				time: 58.5,
				text: 'まだ止めないで まだ止めないで 誰よりも聡くある街に生まれしこの正体を',
				romaji:
					'mada tomenaide mada tomenaide dare yori mo satoku aru machi ni umareshi kono shoutai wo',
				translation_es:
					'No te detengas todavía, no te detengas todavía; esta identidad nacida en una ciudad más sabia que ninguna.',
				translation_en:
					"Don't stop yet, don't stop yet; this identity born in a city wiser than any other."
			},
			{
				time: 66.0,
				text: '今はただ呪い呪われた僕の未来を創造して',
				romaji: 'ima wa tada noroi norowareta boku no mirai wo souzou shite',
				translation_es: 'Ahora solo crea mi futuro, maldito y lleno de maldiciones.',
				translation_en: 'Now just create my future, cursed and full of curses.'
			},
			{
				time: 71.0,
				text: '走って転んで 消えない痛み抱いては 世界が待ってる この一瞬を',
				romaji: 'hashitte koronde kienai itami daite wa sekai ga matteru kono isshun wo',
				translation_es:
					'Corriendo, tropezando, abrazando un dolor que no desaparece; el mundo espera este instante.',
				translation_en:
					'Running, stumbling, embracing an unvanishing pain; the world is waiting for this moment.'
			}
		],
		vocab: [
			{
				jp: '有象無象',
				kana: 'うぞうむぞう',
				romaji: 'uzoumuzou',
				en: 'the masses / riffraff',
				es: 'la gente corriente / chusma'
			},
			{
				jp: '虚心坦懐',
				kana: 'きょしんたんかい',
				romaji: 'kyoshintankai',
				en: 'with an open mind',
				es: 'con la mente abierta'
			},
			{
				jp: '不平等',
				kana: 'ふびょうどう',
				romaji: 'fubyoudou',
				en: 'inequality / unfairness',
				es: 'desigualdad / injusticia'
			},
			{
				jp: '聡い',
				kana: 'さとい',
				romaji: 'satoi',
				en: 'clever / sharp / wise',
				es: 'sabio / agudo / inteligente'
			},
			{ jp: '呪い', kana: 'のろい', romaji: 'noroi', en: 'curse', es: 'maldición' },
			{
				jp: '想像',
				kana: 'そうぞう',
				romaji: 'souzou',
				en: 'imagination / creation',
				es: 'imaginación / creación'
			}
		]
	},
	{
		id: 'idol',
		level: 'N1',
		title: 'アイドル',
		artist: 'YOASOBI',
		start: '00:00',
		end: '01:30',
		focus: { es: 'Crítica social y fama', en: 'Social criticism and fame' },
		difficulty: 5,
		youtubeId: 'PgBvV9ofjmA', // ✅ MV oficial YOASOBI
		lyrics: [
			{
				time: 0.0,
				text: '無敵の笑顔で荒らすメディア 知りたいその秘密ミステリアス',
				romaji: 'muteki no egao de arasu media shiritai sono himitsu misuteriasu',
				translation_es:
					'Arrasando los medios con una sonrisa invencible, quiero conocer ese secreto misterioso.',
				translation_en:
					'Wrecking the media with an invincible smile, I want to know that mysterious secret.'
			},
			{
				time: 6.0,
				text: '抜けてるとこさえ彼女のエリア',
				romaji: 'nuketeru toko sae kanojo no eria',
				translation_es: 'Incluso sus despistes son parte de su encanto.',
				translation_en: 'Even her clumsy side is part of her territory.'
			},
			{
				time: 9.0,
				text: '完璧で嘘つきな君は 天才的なアイドル様',
				romaji: 'kanpeki de usotsuki na kimi wa tensaiteki na aidoru-sama',
				translation_es: 'Tú, perfecta y mentirosa, eres una ídolo con un talento natural.',
				translation_en: 'You, perfect and a liar, are a genius-like idol.'
			},
			{
				time: 17.0,
				text: '今日何食べた？ 好きな本は？ 遊びに行くならどこに行くの？',
				romaji: 'kyou nani tabeta? suki na hon wa? asobi ni iku nara doko ni iku no?',
				translation_es:
					'¿Qué comiste hoy? ¿Cuál es tu libro favorito? Si fueras a salir, ¿a dónde irías?',
				translation_en:
					"What did you eat today? What's your favorite book? If you go out, where do you go?"
			},
			{
				time: 23.0,
				text: '何も食べてない それは内緒',
				romaji: 'nani mo tabetenai sore wa naisho',
				translation_es: 'No he comido nada, eso es un secreto.',
				translation_en: "I haven't eaten anything, that's a secret."
			},
			{
				time: 26.0,
				text: '何を聞かれてものらりくらり',
				romaji: 'nani wo kikaretemo norari kurari',
				translation_es: 'No importa lo que me pregunten, siempre esquivo la respuesta.',
				translation_en: "No matter what I'm asked, I dodge the question."
			},
			{
				time: 29.0,
				text: 'そう淡々と だけど燦々と 見えそうで見えない蜜は蜜の味',
				romaji: 'sou tantan to dakedo sansan to miesou de mienai mitsu wa mitsu no aji',
				translation_es:
					'Tan tranquila, pero tan radiante; el néctar que parece verse pero no, sabe a gloria.',
				translation_en:
					"So coolly, yet so brilliantly; the nectar that seems visible but isn't, tastes like honey."
			},
			{
				time: 34.5,
				text: 'あれもないないない これもないないない 好きなタイプは？ 相手は？ さあ答えて',
				romaji: 'are mo nai nai nai kore mo nai nai nai suki na taipu wa? aite wa? saa kotaete',
				translation_es:
					'No tengo aquello, ni esto tampoco; ¿cuál es tu tipo? ¿tienes a alguien? Vamos, responde.',
				translation_en:
					"Don't have that, don't have this; what's your type? Who is it? Come on, answer."
			},
			{
				time: 40.5,
				text: '『誰かを好きになることなんて私分からなくてさ』',
				romaji: 'dareka wo suki ni naru koto nante watashi wakaranakute sa',
				translation_es: "'Eso de enamorarse de alguien es algo que yo no entiendo'.",
				translation_en: "'I don't really understand what it's like to fall in love with someone'."
			},
			{
				time: 46.0,
				text: '嘘か本当か知り得ない そんな言葉にまた一人落ちる',
				romaji: 'uso ka hontou ka shirienai sonna kobota ni mata hitori ochiru',
				translation_es:
					'Sin saber si es mentira o verdad, otra persona cae rendida ante esas palabras.',
				translation_en:
					"Without knowing if it's a lie or the truth, another person falls for those words again."
			},
			{
				time: 53.0,
				text: 'また好きにさせる',
				romaji: 'mata suki ni saseru',
				translation_es: 'Me haces enamorarme de ti otra vez',
				translation_en: 'You make me fall in love with you again'
			},
			{
				time: 55.0,
				text: '誰もが目を奪われていく 君は完璧で究極のアイドル',
				romaji: 'daremo ga me wo ubawarete iku kimi wa kanpeki de kyuukyoku no aidoru',
				translation_es: 'Robas la mirada de todo el mundo, eres la ídolo perfecta y definitiva.',
				translation_en: 'Everyone is captivated by you, the perfect and ultimate idol.'
			},
			{
				time: 61.0,
				text: '金輪際現れない 一番星の生まれ変わり',
				romaji: 'konrinzai arawarenai ichibanboshi no umarekawari',
				translation_es:
					'Nunca volverá a aparecer alguien así, eres la reencarnación de la estrella más brillante.',
				translation_en:
					'Someone like you will never appear again, the reincarnation of the first star.'
			},
			{
				time: 67.5,
				text: 'その笑顔で愛してるで 誰も彼も虜にしていく',
				romaji: 'sono egao de aishiteru de daremo kare mo toriko ni shite iku',
				translation_es: "Con esa sonrisa y tus 'te quiero', haces prisionero a todo el mundo.",
				translation_en: "With that smile and your 'I love you', you make everyone your captive."
			},
			{
				time: 73.0,
				text: 'その瞳が その言葉が 嘘でもそれは完全なアイ',
				romaji: 'sono hitomi ga sono kobota ga uso demo sore wa kanzen na ai',
				translation_es: 'Esos ojos, esas palabras, aunque sean mentira, son amor puro.',
				translation_en: "Those eyes, those words, even if they're lies, it's perfect love."
			}
		],
		vocab: [
			{ jp: '無敵', kana: 'むてき', romaji: 'muteki', en: 'invincible', es: 'invencible' },
			{
				jp: '燦々と',
				kana: 'さんさんと',
				romaji: 'sansan to',
				en: 'brilliantly / radiantly',
				es: 'radiante / brillantemente'
			},
			{
				jp: '究極',
				kana: 'きゅうきょく',
				romaji: 'kyuukyoku',
				en: 'ultimate / extreme',
				es: 'definitivo / extremo'
			},
			{
				jp: '金輪際',
				kana: 'こんりんざい',
				romaji: 'konrinzai',
				en: 'never / by no means',
				es: 'nunca / jamás'
			},
			{
				jp: '虜',
				kana: 'とりこ',
				romaji: 'toriko',
				en: 'captive / prisoner / slave (to love)',
				es: 'cautivo / prisionero / esclavo (del amor)'
			}
		]
	},
	{
		id: 'zankoku-na-tenshi-no-teeze',
		level: 'N1',
		title: '残酷な天使のテーゼ',
		artist: '高橋洋子',
		start: '00:00',
		end: '01:31',
		focus: {
			es: 'Metáforas religiosas y filosóficas',
			en: 'Religious and philosophical metaphors'
		},
		difficulty: 5,
		youtubeId: 'nU21rCWkuJw', // ✅ Evangelion OP (TV Size)
		lyrics: [
			{
				time: 1.0,
				text: '残酷な天使のように 少年よ 神話になれ',
				romaji: 'zankoku na tenshi no you ni shounen yo shinwa ni nare',
				translation_es: 'Como un ángel cruel, ¡muchacho, conviértete en una leyenda!',
				translation_en: 'Like a cruel angel, young boy, become a legend!'
			},
			{
				time: 24.0,
				text: '蒼い風がいま 胸のドアを叩いても 私だけをただ見つめて 微笑んでるあなた',
				romaji:
					'aoi kaze ga ima mune no doa wo tataitemo watashi dake wo tada mitsumete hohoenderu anata',
				translation_es:
					'Aunque el viento azul golpee ahora la puerta de tu pecho, tú solo me miras a mí y sonríes.',
				translation_en:
					'Even if a blue wind knocks on the door to your heart right now, you only look at me and smile.'
			},
			{
				time: 39.0,
				text: 'そっとふれるもの もとめることに夢中で 運命さえまだ知らない いたいけな瞳',
				romaji:
					'sotto fureru mono motomeru koto ni muchuu de unmei sae mada shiranai itaike na hitomi',
				translation_es:
					'Absorto en la búsqueda de aquello que tocas suavemente, tus ojos inocentes aún desconocen el destino.',
				translation_en:
					"Absorbed in searching for things you touch softly, your innocent eyes still don't know fate."
			},
			{
				time: 52.0,
				text: 'だけどいつか気付くでしょう その背中には 遥か未来 めざすための羽根があること',
				romaji:
					'dakedo itsuka kizuku deshou sono senaka ni wa haruka mirai mezasu tame no hane ga aru koto',
				translation_es:
					'Pero algún día te darás cuenta de que en tu espalda tienes alas para alcanzar el futuro lejano.',
				translation_en:
					"But someday you'll realize that on your back, you have wings to reach the far future."
			},
			{
				time: 68.5,
				text: '残酷な天使のテーゼ 窓辺からやがて飛び立つ',
				romaji: 'zankoku na tenshi no teeze madobe kara yagate tobitatsu',
				translation_es: 'La tesis del ángel cruel pronto emprenderá el vuelo desde la ventana.',
				translation_en: "The cruel angel's thesis will soon take flight from the window."
			},
			{
				time: 76.0,
				text: 'ほとばしる熱いパトスで 思い出を裏切るなら',
				romaji: 'hotobashiru atsui patosu de omoide wo uragiru nara',
				translation_es: 'Si traicionas tus recuerdos con un patetismo ardiente y brotante...',
				translation_en: 'If you betray your memories with a surging hot pathos...'
			},
			{
				time: 83.3,
				text: 'この空を抱いて輝く 少年よ 神話になれ',
				romaji: 'kono sora wo idaite kagayaku shounen yo shinwa ni nare',
				translation_es: 'Abraza este cielo y brilla. ¡Muchacho, conviértete en una leyenda!',
				translation_en: 'Embrace this sky and shine. Young boy, become a legend!'
			}
		],
		vocab: [
			{ jp: '残酷', kana: 'ざんこく', romaji: 'zankoku', en: 'cruel', es: 'cruel' },
			{
				jp: '神話',
				kana: 'しんわ',
				romaji: 'shinwa',
				en: 'myth / legend',
				es: 'mitología / leyenda'
			},
			{ jp: '運命', kana: 'うんめい', romaji: 'unmei', en: 'fate / destiny', es: 'destino / sino' },
			{
				jp: '遥か',
				kana: 'はるか',
				romaji: 'haruka',
				en: 'far away / distant',
				es: 'lejano / distante'
			},
			{ jp: '裏切る', kana: 'うらぎる', romaji: 'uragiru', en: 'to betray', es: 'traicionar' }
		]
	},
	{
		id: 'gurenge',
		level: 'N4',
		title: '紅蓮華 (Gurenge)',
		artist: 'LiSA',
		start: '00:00',
		end: '01:30',
		focus: { es: 'Determinación y superación', en: 'Determination and overcoming' },
		difficulty: 3,
		youtubeId: 'pmanD_s7G3U',
		lyrics: [
			{
				time: 1.0,
				text: '強くなれる理由を知った 僕を連れて進め',
				romaji: 'tsuyoku nareru riyuu wo shitta boku wo tsurete susume',
				translation_es: 'He descubierto la razón para ser fuerte, llévame contigo y avancemos.',
				translation_en: 'I found the reason to become strong, take me with you and move forward.'
			},
			{
				time: 18.0,
				text: '泥だらけの走馬灯に酔う こわばる心',
				romaji: 'dorodarake no soumatou ni you kowabaru kokoro',
				translation_es:
					'Embriagado por un caleidoscopio de recuerdos llenos de lodo, mi corazón se tensa.',
				translation_en: 'Drunk on a mud-covered revolving lantern, my heart stiffens.'
			},
			{
				time: 25.0,
				text: '震える手は掴みたいものがある それだけさ',
				romaji: 'furueru te wa tsukamitai mono ga aru sore dake sa',
				translation_es: 'Mis manos temblorosas tienen algo que quieren alcanzar, eso es todo.',
				translation_en: 'My trembling hands have something they want to grasp, that’s all.'
			},
			{
				time: 32.0,
				text: '夜の匂いに空睨んでも',
				romaji: 'yoru no nioi ni sora nirandemo',
				translation_es: 'Aunque mire fijamente al cielo con el aroma de la noche.',
				translation_en: 'Even if I glare at the sky in the scent of the night.'
			},
			{
				time: 39.0,
				text: '変わっていけるのは自分自身だけ それだけさ',
				romaji: 'kawatte ikeru no wa jibun jishin dake sore dake sa',
				translation_es: 'El único que puede cambiar soy yo mismo, eso es todo.',
				translation_en: 'The only one who can change is myself, that’s all.'
			},
			{
				time: 46.0,
				text: '強くなれる理由を知った 僕を連れて進め',
				romaji: 'tsuyoku nareru riyuu wo shitta boku wo tsurete susume',
				translation_es: 'He descubierto la razón para ser fuerte, llévame contigo y avancemos.',
				translation_en: 'I found the reason to become strong, take me with you and move forward.'
			},
			{
				time: 60.0,
				text: 'どうしたって！',
				romaji: 'Dou shitatte!',
				translation_es: '¡No importa lo que pase!',
				translation_en: 'No matter what!'
			},
			{
				time: 61.0,
				text: '消せない夢も 止まれない今も',
				romaji: 'Kesenai yume mo tomarenai ima mo',
				translation_es: 'Tanto los sueños que no puedo borrar como el presente que no se detiene.',
				translation_en: "Even the dreams I can't erase, even the present I can't stop."
			},
			{
				time: 64.0,
				text: '誰かのために強くなれるなら',
				romaji: 'Dareka no tame ni tsuyoku nareru nara',
				translation_es: 'Si puedo hacerme más fuerte por el bien de alguien.',
				translation_en: 'If I can become stronger for the sake of someone else.'
			},
			{
				time: 68.5,
				text: '何度でも 立ち上がれ',
				romaji: 'Nando demo tachiagare',
				translation_es: 'Levántate una y otra vez.',
				translation_en: 'Stand up again and again.'
			},
			{
				time: 73.0,
				text: '世界に打ちのめされて 負ける意味を知った',
				romaji: 'Sekai ni uchinomesarete makeru imi wo shitta',
				translation_es: 'Siendo derrotado por el mundo, aprendí el significado de la derrota.',
				translation_en: 'Beaten down by the world, I learned the meaning of defeat.'
			},
			{
				time: 78.5,
				text: '紅蓮の華よ 咲き誇れ！ 運命を照らして',
				romaji: 'Guren no hana yo sakihokore! Unmei wo terashite',
				translation_es: '¡Flor de loto carmesí, florece en todo tu esplendor! Ilumina el destino.',
				translation_en: 'Crimson lotus flower, bloom in full glory! Light up our fate.'
			}
		],
		vocab: [
			{ jp: '理由', kana: 'りゆう', romaji: 'riyuu', en: 'reason', es: 'razón' },
			{
				jp: '強くなる',
				kana: 'つよくなる',
				romaji: 'tsuyoku naru',
				en: 'to become strong',
				es: 'hacerse fuerte'
			},
			{
				jp: '自分自身',
				kana: 'じぶんじしん',
				romaji: 'jibun jishin',
				en: 'oneself',
				es: 'uno mismo'
			},
			{ jp: '震える', kana: 'ふるえる', romaji: 'furueru', en: 'to tremble', es: 'temblar' },
			{ jp: '運命', kana: 'うんめい', romaji: 'unmei', en: 'fate', es: 'destino' },
			{ jp: '世界', kana: 'せかい', romaji: 'sekai', en: 'world', es: 'mundo' }
		]
	},
	{
		id: 'peace-sign',
		level: 'N3',
		title: 'ピースサイン (Peace Sign)',
		artist: '米津玄師',
		start: '00:00',
		end: '01:29',
		focus: { es: 'Destino y valentía', en: 'Destiny and bravery' },
		difficulty: 3,
		youtubeId: 'Q7w5IMyJ3pM',
		lyrics: [
			{
				time: 18.0,
				text: 'いつか僕らの上をスレスレに 通り過ぎていったあの飛行機を',
				romaji: 'itsuka bokura no ue wo suresure ni toorisugite itta ano hikouki wo',
				translation_es: 'Aquel avión que una vez pasó rozando por encima de nosotros.',
				translation_en: 'That airplane that once passed right over our heads.'
			},
			{
				time: 23.0,
				text: '不思議なくらいに覚えてる 意味もないのに何故か',
				romaji: 'fushigi na kurai ni oboeteru imi mo nai noni nazeka',
				translation_es: 'Lo recuerdo de una manera extraña, aunque no tenga sentido.',
				translation_en: "I remember it strangely, even though there's no meaning to it."
			},
			{
				time: 28.0,
				text: '不甲斐なくて泣いた日の夜に ただ強くなりたいと願った',
				romaji: 'fugainakute naita hi no yoru ni tada tsuyoku naritai to negatta',
				translation_es:
					'En la noche del día que lloré por mi inutilidad, solo deseé ser más fuerte.',
				translation_en:
					'On the night of the day I cried from worthlessness, I just wished to be strong.'
			},
			{
				time: 33.0,
				text: 'そのために必要な勇気を 探し求めていた',
				romaji: 'sono tame ni hitsuyou na yuuki wo sagashimotomete ita',
				translation_es: 'Estaba buscando el valor necesario para ello.',
				translation_en: 'I was searching for the courage needed for that.'
			},
			{
				time: 38.0,
				text: '残酷な運命が定まってるとして それがいつの日か僕の前に現れるとして',
				romaji:
					'zankoku na unmei ga sadamatteru to shite sore ga itsu no hi ka boku no mae ni arawareru to shite',
				translation_es:
					'Incluso si un destino cruel está decidido, e incluso si aparece ante mí algún día.',
				translation_en: 'Even if a cruel fate is decided, and even if it appears before me someday.'
			},
			{
				time: 47.0,
				text: 'ただ一瞬 この一瞬 息ができるなら',
				romaji: 'tada isshun kono isshun iki ga dekiru nara',
				translation_es: 'Si tan solo puedo respirar por un instante, por este instante.',
				translation_en: 'If I can just breathe for an instant, for this instant.'
			},
			{
				time: 52.0,
				text: 'どうでもいいと思えた その心を',
				romaji: 'dou demo ii to omoeta sono kokoro wo',
				translation_es: 'Ese corazón que pensaba que no importaba nada.',
				translation_en: 'That heart that felt like anything was okay.'
			},
			{
				time: 58.5,
				text: 'もう一度',
				romaji: 'mou ichido',
				translation_es: 'Una vez más.',
				translation_en: 'Once more.'
			},
			{
				time: 60.0,
				text: '遠くへ行け 遠くへ行けと 僕の中で誰かが歌う',
				romaji: 'tooku e ike tooku e ike to boku no naka de dareka ga utau',
				translation_es: 'Vete lejos, vete lejos, alguien canta dentro de mí.',
				translation_en: 'Go far away, go far away, someone sings inside of me.'
			},
			{
				time: 64.5,
				text: 'どうしようもないほど熱烈に',
				romaji: 'Dou shiyou mo nai hodo netsuretsu ni',
				translation_es: 'Con una pasión incontrolable',
				translation_en: 'With an uncontrollable passion'
			},
			{
				time: 68.5,
				text: 'いつだって目を腫らした君が 二度と悲しまないように笑える',
				romaji: 'itsudatte me wo harashita kimi ga nido to kanashimanai you ni waraeru',
				translation_es: 'Para que tú, que siempre tenías los ojos hinchados, puedas reír sin volver a estar triste.',
				translation_en: 'So that you, who always had swollen eyes, can laugh and never be sad again.'
			},
			{
				time: 74.0,
				text: 'そんなヒーローになるための歌',
				romaji: 'sonna hiiroo ni naru tame no uta',
				translation_es: 'Una canción para convertirse en ese tipo de héroe.',
				translation_en: 'A song to become that kind of hero.'
			},
			{
				time: 78.5,
				text: 'さらば掲げろピースサイン 転がっていくストーリーを',
				romaji: 'saraba kakagero piisu sain korogatte iku sutoorii wo',
				translation_es: 'Así que levanta el signo de la paz, ante esta historia que sigue rodando.',
				translation_en: 'So raise the peace sign, for the story that keeps on rolling.'
			}
		],
		vocab: [
			{ jp: '勇気', kana: 'ゆうき', romaji: 'yuuki', en: 'courage', es: 'valor' },
			{ jp: '運命', kana: 'うんめい', romaji: 'unmei', en: 'fate', es: 'destino' },
			{
				jp: '一瞬',
				kana: 'いっしゅん',
				romaji: 'isshun',
				en: 'instant / moment',
				es: 'instante'
			},
			{ jp: '願う', kana: 'ねがう', romaji: 'negau', en: 'to wish / desire', es: 'desear' },
			{ jp: '心', kana: 'こころ', romaji: 'kokoro', en: 'heart / mind', es: 'corazón / mente' }
		]
	},
	{
		id: 'cry-baby',
		level: 'N2',
		title: 'Cry Baby',
		artist: 'Official髭男dism',
		start: '00:00',
		end: '01:30',
		focus: { es: 'Lealtad y superación urbana', en: 'Loyalty and urban overcoming' },
		difficulty: 4,
		youtubeId: 'O1CU9tgwxRM',
		lyrics: [
			{
				time: 12.0,
				text: '胸ぐらを掴まれて 強烈なパンチを食らってよろけて',
				romaji: 'munagura wo tsukamarete kyouretsu na panchi wo kuratte yorokete',
				translation_es: 'Me agarraron por el cuello, recibí un puñetazo fuerte y me tambaleé.',
				translation_en: 'Grabbed by the collar, I took a strong punch and stumbled.'
			},
			{
				time: 19.0,
				text: '肩を並べうずくまった 予報通りの雨に お前はにやけて',
				romaji: 'kata wo narabe uzukumatta yohoudoori no ame ni omae wa niyakete',
				translation_es:
					'Nos agachamos hombro con hombro bajo la lluvia prevista, y tú sonreíste con ironía.',
				translation_en: 'We crouched side by side in the predicted rain, and you smirked.'
			},
			{
				time: 26.0,
				text: '「今に見てろよ」と呟いた',
				romaji: '"ima ni mitero yo" to tsubuyaita',
				translation_es: 'Murmuraste: "Ya verás lo que pasa".',
				translation_en: 'You muttered, "Just you wait and see."'
			},
			{
				time: 32.0,
				text: '正解のない日々に 堪えてる',
				romaji: 'seikai no nai hibi ni kotaeteru',
				translation_es: 'Soportando estos días sin respuestas correctas.',
				translation_en: 'Enduring these days with no right answers.'
			},
			{
				time: 38.0,
				text: '傘はいらないから',
				romaji: 'kasa wa iranai kara',
				translation_es: 'Porque no necesito un paraguas.',
				translation_en: "Because I don't need an umbrella."
			}
		],
		vocab: [
			{
				jp: '胸ぐら',
				kana: 'むなぐら',
				romaji: 'munagura',
				en: 'collar / chest area',
				es: 'pecho / solapas'
			},
			{
				jp: '強烈',
				kana: 'きょうれつ',
				romaji: 'kyouretsu',
				en: 'intense / strong',
				es: 'intenso / fuerte'
			},
			{ jp: '予報', kana: 'よほう', romaji: 'yohou', en: 'forecast', es: 'pronóstico' },
			{
				jp: '呟く',
				kana: 'つぶやく',
				romaji: 'tsubuyaku',
				en: 'to mutter / murmur',
				es: 'murmurar'
			}
		]
	},
	{
		id: 'kick-back',
		level: 'N1',
		title: 'KICK BACK',
		artist: '米津玄師',
		start: '00:00',
		end: '01:30',
		focus: { es: 'Deseos caóticos y ambición', en: 'Chaotic desires and ambition' },
		difficulty: 5,
		youtubeId: 'dFlDRhvM4L0',
		lyrics: [
			{
				time: 9.8,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 11.8,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 14.5,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 16.5,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 19.0,
				text: 'ランドリー今日はガラ空きでラッキーデイ',
				romaji: 'randorii kyou wa garaaki de rakkii dei',
				translation_es: 'La lavandería está vacía hoy, es un día de suerte.',
				translation_en: "The laundromat's empty today, it's a lucky day."
			},
			{
				time: 24.0,
				text: 'かったりい油汚れもこれでバイバイ',
				romaji: 'kattarii abura yogore mo kore de baibai',
				translation_es: 'Digo adiós a estas molestas manchas de grasa.',
				translation_en: 'Say bye-bye to these tiresome grease stains.'
			},
			{
				time: 28.0,
				text: '誰だ誰だ頭の中 呼びかける声は',
				romaji: 'dare da dare da atama no naka yobikakeru koe wa',
				translation_es: '¿Quién es? ¿Quién es esa voz que llama dentro de mi cabeza?',
				translation_en: 'Who is it, who is it, the voice calling in my head?'
			},
			{
				time: 32.8,
				text: 'あれが欲しいこれが欲しいと歌っている',
				romaji: 'are ga hoshii kore ga hoshii to utatteiru',
				translation_es: 'Canta diciendo que quiere esto y aquello.',
				translation_en: 'Singing that it wants this, it wants that.'
			},
			{
				time: 37.0,
				text: '幸せになりたい 楽して生きていたい',
				romaji: 'shiawase ni naritai rakushite ikite itai',
				translation_es: 'Quiero ser feliz, quiero vivir con tranquilidad.',
				translation_en: 'I want to be happy, I want to live comfortably.'
			},
			{
				time: 41.0,
				text: 'この手に掴みたい あなたのその胸の中',
				romaji: 'kono te ni tsukamitai anata no sono mune no naka',
				translation_es: 'Quiero atrapar con estas manos lo que hay en tu corazón.',
				translation_en: 'I want to grasp with these hands what is inside your heart.'
			},
			{
				time: 51.0,
				text: 'ハッピーで埋め尽くして レストインピースまで行こうぜ',
				romaji: 'happii de umetsukushite resuto in piisu made ikou ze',
				translation_es: 'Llenémoslo todo de felicidad, vayamos hasta el "descansa en paz".',
				translation_en: "Let's fill it with happiness, let's go until rest in peace."
			},
			{
				time: 56.0,
				text: 'いつかみた地獄もいいところ 愛をばら撒いて',
				romaji: 'itsuka mita jigoku mo ii tokoro ai wo baramaite',
				translation_es: 'El infierno que vi una vez también es un buen lugar, esparciendo amor.',
				translation_en: 'The hell I saw once is a good place too, scattering love.'
			},
			{
				time: 61.0,
				text: 'アイラブユー貶してくれ 全部奪って笑ってくれマイハニー',
				romaji: 'ai rabu yuu kenashite kure zenbu ubatte waratte kure mai hanii',
				translation_es: 'Te amo, habla mal de mí, quítamelo todo y ríete de mí, cariño.',
				translation_en: 'I love you, speak ill of me, take everything and laugh at me, my honey.'
			},
			{
				time: 66.0,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 68.0,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 71.0,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 73.0,
				text: 'なんか忘れちゃってんだ',
				romaji: 'nanka wasurechatten da',
				translation_es: 'Parece que he olvidado algo.',
				translation_en: "I've forgotten something somehow."
			},
			{
				time: 75.8,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 78.2,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 80.0,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			},
			{
				time: 82.8,
				text: '努力 未来 A BEAUTIFUL STAR',
				romaji: 'doryoku mirai A BEAUTIFUL STAR',
				translation_es: 'Esfuerzo, futuro, una estrella hermosa.',
				translation_en: 'Effort, future, a beautiful star.'
			}
		],
		vocab: [
			{ jp: '努力', kana: 'どりょく', romaji: 'doryoku', en: 'effort', es: 'esfuerzo' },
			{ jp: '期待', kana: 'きたい', romaji: 'kitai', en: 'expectation', es: 'expectativa' },
			{ jp: '幸せ', kana: 'しあわせ', romaji: 'shiawase', en: 'happiness', es: 'felicidad' },
			{
				jp: '埋め尽くす',
				kana: 'うめつくす',
				romaji: 'umetsukusu',
				en: 'to fill up / crowd',
				es: 'llenar por completo'
			},
			{
				jp: '炭酸水',
				kana: 'たんさんすい',
				romaji: 'tansansui',
				en: 'carbonated water',
				es: 'agua carbonatada'
			},
			{
				jp: '拗らせる',
				kana: 'こじらせる',
				romaji: 'kojirasete',
				en: 'to complicate / aggravate',
				es: 'complicar / agravar'
			},
			{ jp: '虚しい', kana: 'むなしい', romaji: 'munashii', en: 'empty / vain', es: 'vacío / vano' },
			{
				jp: '滅茶苦茶',
				kana: 'めちゃくちゃ',
				romaji: 'mechakucha',
				en: 'messy / chaotic',
				es: 'caótico / desastroso'
			}
		]
	}
];
