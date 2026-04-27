export interface DialogueChoice {
	jp: string;
	romaji: string;
	translation: string;
	correct: boolean;
	feedback_es: string;
}

export type DialogueTurn =
	| { type: 'npc'; jp: string; romaji: string; translation: string }
	| {
			type: 'choice';
			prompt_jp: string;
			prompt_romaji: string;
			prompt_translation: string;
			choices: DialogueChoice[];
			next_npc?: { jp: string; romaji: string; translation: string };
	  };

export interface DialogueScenario {
	id: string;
	title_es: string;
	title_en: string;
	level: 'N5' | 'N4' | 'N3';
	icon: string;
	context_es: string;
	turns: DialogueTurn[];
}

export const conversations: DialogueScenario[] = [
	{
		id: 'tienda',
		title_es: 'En la tienda',
		title_en: 'At the store',
		level: 'N5',
		icon: '🛒',
		context_es: 'Entras a una tienda en Japón. El dependiente te saluda.',
		turns: [
			{
				type: 'npc',
				jp: 'いらっしゃいませ！',
				romaji: 'Irasshaimase!',
				translation: '¡Bienvenido/a!'
			},
			{
				type: 'choice',
				prompt_jp: 'りんごはありますか？',
				prompt_romaji: 'Ringo wa arimasu ka?',
				prompt_translation: '¿Tiene manzanas?',
				choices: [
					{
						jp: 'はい、あります。どうぞ。',
						romaji: 'Hai, arimasu. Douzo.',
						translation: 'Sí, tenemos. Aquí tiene.',
						correct: true,
						feedback_es: '¡Correcto! Esta es la respuesta natural de un dependiente.'
					},
					{
						jp: 'わかりません。',
						romaji: 'Wakarimasen.',
						translation: 'No sé.',
						correct: false,
						feedback_es:
							'Correcto pero poco natural. Un dependiente diría "Hai, arimasu" o "Sumimasen, nai desu".'
					},
					{
						jp: 'ありがとうございます。',
						romaji: 'Arigatou gozaimasu.',
						translation: 'Muchas gracias.',
						correct: false,
						feedback_es: 'Eso significa "gracias" — no responde la pregunta sobre las manzanas.'
					}
				],
				next_npc: {
					jp: 'いくつ いりますか？',
					romaji: 'Ikutsu irimasu ka?',
					translation: '¿Cuántas necesita?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（りんごは いくつ いりますか？）',
				prompt_romaji: '(Ringo wa ikutsu irimasu ka?)',
				prompt_translation: '¿Cuántas manzanas quieres pedir?',
				choices: [
					{
						jp: 'みっつ おねがいします。',
						romaji: 'Mittsu onegaishimasu.',
						translation: 'Tres, por favor.',
						correct: true,
						feedback_es: '¡Perfecto! Usas el contador general "mittsu" (3) correctamente.'
					},
					{
						jp: 'さんえん ください。',
						romaji: 'San-en kudasai.',
						translation: '3 yenes, por favor.',
						correct: false,
						feedback_es:
							'"San-en" significa 3 yenes (precio), no 3 unidades. Para contar objetos usa mittsu/futatsu/etc.'
					},
					{
						jp: 'たくさん ください。',
						romaji: 'Takusan kudasai.',
						translation: 'Muchos, por favor.',
						correct: false,
						feedback_es: 'Funciona en contexto informal, pero es vago. Mejor especificar la cantidad.'
					}
				],
				next_npc: {
					jp: 'ぜんぶで さんびゃくえん です。',
					romaji: 'Zenbu de sanbyaku-en desu.',
					translation: 'En total son 300 yenes.'
				}
			},
			{
				type: 'choice',
				prompt_jp: 'どうやって はらいますか？',
				prompt_romaji: 'Dou yatte haraimasu ka?',
				prompt_translation: '¿Cómo quieres pagar?',
				choices: [
					{
						jp: 'カードで おねがいします。',
						romaji: 'Kaado de onegaishimasu.',
						translation: 'Con tarjeta, por favor.',
						correct: true,
						feedback_es: '¡Excelente! La partícula "de" aquí indica el medio de pago.'
					},
					{
						jp: 'おかねが あります。',
						romaji: 'Okane ga arimasu.',
						translation: 'Tengo dinero.',
						correct: false,
						feedback_es:
							'Gramaticalmente correcto pero raro en este contexto. Lo natural sería "genkin de" (en efectivo).'
					},
					{
						jp: 'はい、そうです。',
						romaji: 'Hai, sou desu.',
						translation: 'Sí, así es.',
						correct: false,
						feedback_es:
							'"Hai, sou desu" significa "sí, es así" — no responde la pregunta sobre el pago.'
					}
				],
				next_npc: {
					jp: 'ありがとうございました！またどうぞ。',
					romaji: 'Arigatou gozaimashita! Mata douzo.',
					translation: '¡Gracias! Vuelva pronto.'
				}
			},
			{
				type: 'npc',
				jp: 'よい いちにちを！',
				romaji: 'Yoi ichinichi wo!',
				translation: '¡Que tenga un buen día!'
			}
		]
	},
	{
		id: 'restaurante',
		title_es: 'En el restaurante',
		title_en: 'At the restaurant',
		level: 'N5',
		icon: '🍜',
		context_es: 'Llegas a un restaurante japonés. El anfitrión te recibe.',
		turns: [
			{
				type: 'npc',
				jp: 'いらっしゃいませ！なんめいさまですか？',
				romaji: 'Irasshaimase! Nan-mei-sama desu ka?',
				translation: '¡Bienvenido! ¿Cuántas personas son?'
			},
			{
				type: 'choice',
				prompt_jp: '（なんにんで きましたか？）',
				prompt_romaji: '(Nan-nin de kimashita ka?)',
				prompt_translation: '¿Cuántas personas son en tu grupo?',
				choices: [
					{
						jp: 'ふたりです。',
						romaji: 'Futari desu.',
						translation: 'Somos dos.',
						correct: true,
						feedback_es: '¡Correcto! "Futari" es el contador para 2 personas, muy natural aquí.'
					},
					{
						jp: 'にほんごが すきです。',
						romaji: 'Nihongo ga suki desu.',
						translation: 'Me gusta el japonés.',
						correct: false,
						feedback_es: 'Eso no responde la pregunta. "Futari desu" o "hitori desu" sería lo correcto.'
					},
					{
						jp: 'わたしは がくせいです。',
						romaji: 'Watashi wa gakusei desu.',
						translation: 'Soy estudiante.',
						correct: false,
						feedback_es: 'Fuera de contexto. Para indicar número de personas usa "futari/sannin/etc."'
					}
				],
				next_npc: {
					jp: 'こちらへ どうぞ。',
					romaji: 'Kochira e douzo.',
					translation: 'Por aquí, por favor.'
				}
			},
			{
				type: 'npc',
				jp: 'ご注文は お決まりですか？',
				romaji: 'Go-chuumon wa okimari desu ka?',
				translation: '¿Ya saben qué van a pedir?'
			},
			{
				type: 'choice',
				prompt_jp: '（なにを たべたいですか？）',
				prompt_romaji: '(Nani wo tabetai desu ka?)',
				prompt_translation: '¿Cómo pides el ramen?',
				choices: [
					{
						jp: 'ラーメンを ひとつ おねがいします。',
						romaji: 'Raamen wo hitotsu onegaishimasu.',
						translation: 'Un ramen, por favor.',
						correct: true,
						feedback_es: '¡Perfecto! "Hitotsu" + "onegaishimasu" es la forma más natural de pedir.'
					},
					{
						jp: 'ラーメンが たべたいです。',
						romaji: 'Raamen ga tabetai desu.',
						translation: 'Quiero comer ramen.',
						correct: false,
						feedback_es: 'Correcto pero informal. En restaurante lo más natural es usar "onegaishimasu".'
					},
					{
						jp: 'おみずを ください。',
						romaji: 'Omizu wo kudasai.',
						translation: 'Agua, por favor.',
						correct: false,
						feedback_es: '"Omizu" es agua — estabas pidiendo ramen. Pero ¡buena frase para memorizar!'
					}
				],
				next_npc: {
					jp: 'しょうしょう おまちください。',
					romaji: 'Shoushou omachi kudasai.',
					translation: 'Un momento, por favor.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（たべおわりました。おかいけいを たのみましょう）',
				prompt_romaji: '(Tabeowari mashita. Okaikei wo tanomimashou)',
				prompt_translation: 'Terminaste de comer. ¿Cómo pides la cuenta?',
				choices: [
					{
						jp: 'すみません、おかいけいを おねがいします。',
						romaji: 'Sumimasen, okaikei wo onegaishimasu.',
						translation: 'Disculpe, la cuenta por favor.',
						correct: true,
						feedback_es: '¡Excelente! "Okaikei" es la forma respetuosa de pedir la cuenta.'
					},
					{
						jp: 'おいしかったです！',
						romaji: 'Oishikatta desu!',
						translation: '¡Estaba delicioso!',
						correct: false,
						feedback_es:
							'Bonita frase para elogiar la comida, pero no pide la cuenta. Úsala después de "okaikei".'
					},
					{
						jp: 'またきます。',
						romaji: 'Mata kimasu.',
						translation: 'Volveré.',
						correct: false,
						feedback_es: '"Mata kimasu" es "volveré" — se dice al salir, no para pedir la cuenta.'
					}
				],
				next_npc: {
					jp: 'ぜんぶで せんにひゃくえんです。またおこしください！',
					romaji: 'Zenbu de sen-nihyaku-en desu. Mata okoshi kudasai!',
					translation: 'En total son 1,200 yenes. ¡Vuelva pronto!'
				}
			}
		]
	},
	{
		id: 'presentaciones',
		title_es: 'Presentaciones',
		title_en: 'Introductions',
		level: 'N5',
		icon: '🤝',
		context_es: 'Conoces a alguien nuevo en una clase de japonés.',
		turns: [
			{
				type: 'npc',
				jp: 'はじめまして！わたしは さくら です。',
				romaji: 'Hajimemashite! Watashi wa Sakura desu.',
				translation: '¡Mucho gusto! Me llamo Sakura.'
			},
			{
				type: 'choice',
				prompt_jp: '（じこしょうかいを してください）',
				prompt_romaji: '(Jiko shoukai wo shite kudasai)',
				prompt_translation: 'Preséntate correctamente',
				choices: [
					{
						jp: 'はじめまして！わたしは [なまえ] です。よろしく おねがいします。',
						romaji: 'Hajimemashite! Watashi wa [namae] desu. Yoroshiku onegaishimasu.',
						translation: '¡Mucho gusto! Soy [nombre]. Encantado/a.',
						correct: true,
						feedback_es: '¡Perfecto! Esta es la fórmula completa de presentación en japonés.'
					},
					{
						jp: 'こんにちは！',
						romaji: 'Konnichiwa!',
						translation: '¡Hola!',
						correct: false,
						feedback_es:
							'"Konnichiwa" es un saludo casual. Al conocer a alguien por primera vez, usa "Hajimemashite".'
					},
					{
						jp: 'おはようございます。',
						romaji: 'Ohayou gozaimasu.',
						translation: 'Buenos días.',
						correct: false,
						feedback_es:
							'Es saludo de mañana, no de presentación. Para conocer a alguien usa "Hajimemashite".'
					}
				],
				next_npc: {
					jp: 'よろしく おねがいします！どこから きましたか？',
					romaji: 'Yoroshiku onegaishimasu! Doko kara kimashita ka?',
					translation: '¡Encantada! ¿De dónde eres?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（どこから きましたか？）',
				prompt_romaji: '(Doko kara kimashita ka?)',
				prompt_translation: '¿Cómo dices que eres de México?',
				choices: [
					{
						jp: 'メキシコから きました。',
						romaji: 'Mekishiko kara kimashita.',
						translation: 'Vine de México.',
						correct: true,
						feedback_es: '¡Correcto! "[país] kara kimashita" es la estructura para decir de dónde eres.'
					},
					{
						jp: 'メキシコが すきです。',
						romaji: 'Mekishiko ga suki desu.',
						translation: 'Me gusta México.',
						correct: false,
						feedback_es:
							'Eso dice "me gusta México", no que eres de allí. Usa "kara kimashita" para el origen.'
					},
					{
						jp: 'にほんが すきです。',
						romaji: 'Nihon ga suki desu.',
						translation: 'Me gusta Japón.',
						correct: false,
						feedback_es: 'Simpático, ¡pero no responde la pregunta! Usa "Mekishiko kara kimashita".'
					}
				],
				next_npc: {
					jp: 'そうですか！いいですね。にほんごは むずかしいですか？',
					romaji: 'Sou desu ka! Ii desu ne. Nihongo wa muzukashii desu ka?',
					translation: '¡Ah, qué bien! ¿El japonés es difícil?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（にほんごは むずかしいですか？）',
				prompt_romaji: '(Nihongo wa muzukashii desu ka?)',
				prompt_translation: 'Responde honestamente sobre el japonés',
				choices: [
					{
						jp: 'すこし むずかしいですが、たのしいです！',
						romaji: 'Sukoshi muzukashii desu ga, tanoshii desu!',
						translation: 'Es un poco difícil, ¡pero divertido!',
						correct: true,
						feedback_es: '¡Muy bien! La conjunción "ga" aquí significa "pero" — muy natural y positivo.'
					},
					{
						jp: 'はい、むずかしいです。',
						romaji: 'Hai, muzukashii desu.',
						translation: 'Sí, es difícil.',
						correct: false,
						feedback_es:
							'Correcto gramaticalmente, pero un poco seco. Añadir "ga, tanoshii desu" lo hace más natural.'
					},
					{
						jp: 'いいえ、やさしいです。',
						romaji: 'Iie, yasashii desu.',
						translation: 'No, es fácil.',
						correct: false,
						feedback_es:
							'¡Qué confianza! Gramaticalmente correcto. "Yasashii" puede confundirse con "amable" (優しい) vs "fácil" (易しい).'
					}
				],
				next_npc: {
					jp: 'そうですね！いっしょに がんばりましょう！',
					romaji: 'Sou desu ne! Issho ni gambarimashou!',
					translation: '¡Así es! ¡Esforcémonos juntos!'
				}
			}
		]
	},
	{
		id: 'estacion',
		title_es: 'En la estación',
		title_en: 'At the station',
		level: 'N4',
		icon: '🚉',
		context_es: 'Estás en una estación de tren en Tokio y necesitas ayuda.',
		turns: [
			{
				type: 'npc',
				jp: 'どうぞ。なにか おてつだいしましょうか？',
				romaji: 'Douzo. Nanika otetsudai shimashou ka?',
				translation: 'Por favor. ¿En qué puedo ayudarle?'
			},
			{
				type: 'choice',
				prompt_jp: '（しんじゅくえきへ いきたいです。どうやっていきますか？）',
				prompt_romaji: '(Shinjuku-eki e ikitai desu. Dou yatte ikimasu ka?)',
				prompt_translation: '¿Cómo preguntas cómo llegar a Shinjuku?',
				choices: [
					{
						jp: 'すみません、しんじゅくえきへは どのでんしゃに のればいいですか？',
						romaji: 'Sumimasen, Shinjuku-eki e wa dono densha ni noreba ii desu ka?',
						translation: 'Disculpe, ¿qué tren debo tomar para ir a Shinjuku?',
						correct: true,
						feedback_es:
							'¡Excelente! "～ば ii desu ka" es una estructura N4 muy útil para pedir consejo.'
					},
					{
						jp: 'しんじゅくえきは どこですか？',
						romaji: 'Shinjuku-eki wa doko desu ka?',
						translation: '¿Dónde está la estación Shinjuku?',
						correct: false,
						feedback_es:
							'Funciona en N5, pero en una estación ya estás ahí — preguntar qué tren tomar es más útil.'
					},
					{
						jp: 'でんしゃが すきです。',
						romaji: 'Densha ga suki desu.',
						translation: 'Me gustan los trenes.',
						correct: false,
						feedback_es: '¡Todos amamos los trenes japoneses! Pero no te va a llevar a Shinjuku.'
					}
				],
				next_npc: {
					jp: 'やまのてせんに のってください。じゅっぷんぐらいで つきますよ。',
					romaji: 'Yamanote-sen ni notte kudasai. Juppun gurai de tsukimasu yo.',
					translation: 'Tome la línea Yamanote. Llegará en unos 10 minutos.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（きっぷを かわなければなりません）',
				prompt_romaji: '(Kippu wo kawanakereba narimasen)',
				prompt_translation: '¿Cómo preguntas dónde comprar el boleto?',
				choices: [
					{
						jp: 'きっぷうりばは どこに ありますか？',
						romaji: 'Kippu-uriba wa doko ni arimasu ka?',
						translation: '¿Dónde está la taquilla?',
						correct: true,
						feedback_es: '¡Correcto! "Kippu-uriba" (taquilla) + "doko ni arimasu ka" es muy natural.'
					},
					{
						jp: 'いくらですか？',
						romaji: 'Ikura desu ka?',
						translation: '¿Cuánto cuesta?',
						correct: false,
						feedback_es:
							'Buena frase, pero primero necesitas saber dónde está la taquilla. Pregunta el lugar primero.'
					},
					{
						jp: 'でんしゃに のりたいです。',
						romaji: 'Densha ni noritai desu.',
						translation: 'Quiero subir al tren.',
						correct: false,
						feedback_es:
							'Gramaticalmente correcto pero no pide información útil. Pregunta dónde está la taquilla.'
					}
				],
				next_npc: {
					jp: 'あちらに ございます。どうぞ。',
					romaji: 'Achira ni gozaimasu. Douzo.',
					translation: 'Está por allá. Por favor.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（ありがとうを ていねいに いいましょう）',
				prompt_romaji: '(Arigatou wo teinei ni iimashou)',
				prompt_translation: '¿Cómo agradeces de forma más formal?',
				choices: [
					{
						jp: 'たいへん おせわになりました。ありがとうございます。',
						romaji: 'Taihen osewa ni narimashita. Arigatou gozaimasu.',
						translation: 'Le agradezco mucho su ayuda.',
						correct: true,
						feedback_es:
							'¡Perfecto nivel N4! "Osewa ni narimashita" es una expresión muy respetuosa de gratitud.'
					},
					{
						jp: 'ありがとう！',
						romaji: 'Arigatou!',
						translation: '¡Gracias!',
						correct: false,
						feedback_es:
							'Demasiado casual para agradecer a un empleado. "Arigatou gozaimasu" sería más apropiado.'
					},
					{
						jp: 'どうもです。',
						romaji: 'Doumo desu.',
						translation: 'Gracias (informal).',
						correct: false,
						feedback_es:
							'Informal y un poco raro en contexto formal. Mejor usar "Doumo arigatou gozaimasu".'
					}
				],
				next_npc: {
					jp: 'いってらっしゃい！よいたびを！',
					romaji: 'Itterasshai! Yoi tabi wo!',
					translation: '¡Que le vaya bien! ¡Buen viaje!'
				}
			}
		]
	}
];
