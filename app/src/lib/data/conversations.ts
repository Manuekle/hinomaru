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
	level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
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
	},

	// ── N5 ──────────────────────────────────────────────────────────

	{
		id: 'hotel',
		title_es: 'En el hotel',
		title_en: 'At the hotel',
		level: 'N5',
		icon: '🏨',
		context_es: 'Llegas a tu hotel en Tokio y haces el check-in.',
		turns: [
			{
				type: 'npc',
				jp: 'いらっしゃいませ。チェックインですか？',
				romaji: 'Irasshaimase. Chekkuin desu ka?',
				translation: 'Bienvenido/a. ¿Hace check-in?'
			},
			{
				type: 'choice',
				prompt_jp: '（はい、よやくを しました）',
				prompt_romaji: '(Hai, yoyaku wo shimashita)',
				prompt_translation: 'Confirma que tienes reserva',
				choices: [
					{
						jp: 'はい、よやくが あります。[なまえ] です。',
						romaji: 'Hai, yoyaku ga arimasu. [Namae] desu.',
						translation: 'Sí, tengo reserva. Soy [nombre].',
						correct: true,
						feedback_es: '¡Perfecto! "Yoyaku ga arimasu" es la frase exacta para confirmar una reserva.'
					},
					{
						jp: 'へやが あります。',
						romaji: 'Heya ga arimasu.',
						translation: 'Hay habitación.',
						correct: false,
						feedback_es: '"Heya ga arimasu" dice que "hay habitación", no que tienes reserva. Usa "yoyaku ga arimasu".'
					},
					{
						jp: 'わかりません。',
						romaji: 'Wakarimasen.',
						translation: 'No sé.',
						correct: false,
						feedback_es: 'Eso genera confusión. Siempre confirma con "Hai, yoyaku ga arimasu".'
					}
				],
				next_npc: {
					jp: 'ありがとうございます。パスポートを おみせください。',
					romaji: 'Arigatou gozaimasu. Pasupooto wo omise kudasai.',
					translation: 'Gracias. Por favor muéstreme su pasaporte.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（パスポートを わすれました！）',
				prompt_romaji: '(Pasupooto wo wasuremashita!)',
				prompt_translation: '¿Cómo dices que olvidaste el pasaporte?',
				choices: [
					{
						jp: 'すみません、パスポートを わすれました。へやに あります。',
						romaji: 'Sumimasen, pasupooto wo wasuremashita. Heya ni arimasu.',
						translation: 'Disculpe, olvidé el pasaporte. Está en la habitación.',
						correct: true,
						feedback_es: '¡Correcto! "Wasuremashita" (olvidé) + ubicación da contexto completo.'
					},
					{
						jp: 'パスポートが ありません。',
						romaji: 'Pasupooto ga arimasen.',
						translation: 'No hay pasaporte.',
						correct: false,
						feedback_es: 'Eso puede sonar como que perdiste el pasaporte. Mejor "wasuremashita" (lo olvidé).'
					},
					{
						jp: 'だいじょうぶです。',
						romaji: 'Daijoubu desu.',
						translation: 'Está bien.',
						correct: false,
						feedback_es: 'Sin el pasaporte no se puede registrar. Explica que lo olvidaste con "wasuremashita".'
					}
				],
				next_npc: {
					jp: 'わかりました。あとで もってきてください。',
					romaji: 'Wakarimashita. Ato de motte kite kudasai.',
					translation: 'Entendido. Tráigalo más tarde, por favor.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（チェックアウトは なんじですか？）',
				prompt_romaji: '(Chekkuauto wa nanji desu ka?)',
				prompt_translation: '¿Cómo preguntas la hora de check-out?',
				choices: [
					{
						jp: 'すみません、チェックアウトは なんじですか？',
						romaji: 'Sumimasen, chekkuauto wa nanji desu ka?',
						translation: 'Disculpe, ¿a qué hora es el check-out?',
						correct: true,
						feedback_es: '¡Excelente! "Nanji desu ka?" es la forma directa de preguntar horas.'
					},
					{
						jp: 'チェックアウトが すきです。',
						romaji: 'Chekkuauto ga suki desu.',
						translation: 'Me gusta el check-out.',
						correct: false,
						feedback_es: '¡Raro! Para preguntar una hora usa "nanji desu ka?"'
					},
					{
						jp: 'なんじに おきますか？',
						romaji: 'Nanji ni okimasu ka?',
						translation: '¿A qué hora se levanta?',
						correct: false,
						feedback_es: 'Eso pregunta cuándo se levanta el recepcionista. Usa "chekkuauto wa nanji desu ka?"'
					}
				],
				next_npc: {
					jp: 'チェックアウトは じゅういちじです。おやすみなさいませ。',
					romaji: 'Chekkuauto wa juuichi-ji desu. Oyasumi nasaimase.',
					translation: 'El check-out es a las 11. Buenas noches.'
				}
			}
		]
	},

	{
		id: 'ropa',
		title_es: 'Comprando ropa',
		title_en: 'Buying clothes',
		level: 'N5',
		icon: '👕',
		context_es: 'Estás en una tienda de ropa buscando algo para comprar.',
		turns: [
			{
				type: 'npc',
				jp: 'いらっしゃいませ！なにか おさがしですか？',
				romaji: 'Irasshaimase! Nanika osagashi desu ka?',
				translation: '¡Bienvenido/a! ¿Busca algo en particular?'
			},
			{
				type: 'choice',
				prompt_jp: '（Tシャツを さがしています）',
				prompt_romaji: '(T-shatsu wo sagashite imasu)',
				prompt_translation: 'Dile que buscas una camiseta',
				choices: [
					{
						jp: 'Tシャツを さがしています。',
						romaji: 'T-shatsu wo sagashite imasu.',
						translation: 'Estoy buscando una camiseta.',
						correct: true,
						feedback_es: '¡Perfecto! "～を sagashite imasu" es la forma estándar de decir que buscas algo.'
					},
					{
						jp: 'Tシャツが ほしいです。',
						romaji: 'T-shatsu ga hoshii desu.',
						translation: 'Quiero una camiseta.',
						correct: false,
						feedback_es: 'Correcto pero más directo. En tiendas es más natural "sagashite imasu" (estoy buscando).'
					},
					{
						jp: 'Tシャツが あります。',
						romaji: 'T-shatsu ga arimasu.',
						translation: 'Hay camisetas.',
						correct: false,
						feedback_es: 'Eso afirma que hay camisetas, no que las buscas. Usa "sagashite imasu".'
					}
				],
				next_npc: {
					jp: 'こちらに ございます。サイズは？',
					romaji: 'Kochira ni gozaimasu. Saizu wa?',
					translation: 'Están por aquí. ¿Qué talla?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（サイズを つたえましょう）',
				prompt_romaji: '(Saizu wo tsutaemashou)',
				prompt_translation: '¿Cómo dices que quieres talla M?',
				choices: [
					{
						jp: 'Mサイズを おねがいします。',
						romaji: 'M-saizu wo onegaishimasu.',
						translation: 'Talla M, por favor.',
						correct: true,
						feedback_es: '¡Correcto! Las tallas en Japón usan S/M/L igual. "Onegaishimasu" es perfecto aquí.'
					},
					{
						jp: 'おおきいです。',
						romaji: 'Ookii desu.',
						translation: 'Es grande.',
						correct: false,
						feedback_es: '"Ookii" significa grande como adjetivo, no como talla. Usa "M-saizu wo onegaishimasu".'
					},
					{
						jp: 'わかりません。',
						romaji: 'Wakarimasen.',
						translation: 'No sé.',
						correct: false,
						feedback_es: 'Si no sabes tu talla japonesa puedes pedir probarte: "shichaku shite mo ii desu ka?"'
					}
				],
				next_npc: {
					jp: 'こちらどうぞ。しちゃくしつは あちらです。',
					romaji: 'Kochira douzo. Shichakushitsu wa achira desu.',
					translation: 'Aquí tiene. El probador está por allá.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（Tシャツが きにいりました！かいます）',
				prompt_romaji: '(T-shatsu ga ki ni irimashita! Kaimasu)',
				prompt_translation: '¿Cómo dices que te gusta y la compras?',
				choices: [
					{
						jp: 'これを ください。',
						romaji: 'Kore wo kudasai.',
						translation: 'Quiero esto, por favor.',
						correct: true,
						feedback_es: '¡Muy natural! "Kore wo kudasai" es la forma más común de comprar algo en Japón.'
					},
					{
						jp: 'これが すきです。',
						romaji: 'Kore ga suki desu.',
						translation: 'Me gusta esto.',
						correct: false,
						feedback_es: 'Correcto pero solo expresa gusto, no compra. Añade "kudasai" para comprar.'
					},
					{
						jp: 'たかいです。',
						romaji: 'Takai desu.',
						translation: 'Es caro.',
						correct: false,
						feedback_es: '"Takai" (caro) lo dices si es caro, no cuando quieres comprar algo. Usa "kore wo kudasai".'
					}
				],
				next_npc: {
					jp: 'ありがとうございます。にせんえんです。',
					romaji: 'Arigatou gozaimasu. Nisen-en desu.',
					translation: 'Gracias. Son 2,000 yenes.'
				}
			}
		]
	},

	{
		id: 'doctor',
		title_es: 'En la farmacia',
		title_en: 'At the pharmacy',
		level: 'N5',
		icon: '💊',
		context_es: 'No te sientes bien y entras a una farmacia en Japón.',
		turns: [
			{
				type: 'npc',
				jp: 'いらっしゃいませ。どうぞ。',
				romaji: 'Irasshaimase. Douzo.',
				translation: 'Bienvenido/a. Adelante.'
			},
			{
				type: 'choice',
				prompt_jp: '（あたまが いたいです。くすりが ほしいです）',
				prompt_romaji: '(Atama ga itai desu. Kusuri ga hoshii desu)',
				prompt_translation: '¿Cómo describes tu síntoma?',
				choices: [
					{
						jp: 'あたまが いたいです。くすりを ください。',
						romaji: 'Atama ga itai desu. Kusuri wo kudasai.',
						translation: 'Me duele la cabeza. Un medicamento, por favor.',
						correct: true,
						feedback_es: '¡Perfecto! "[部位] ga itai desu" + "kusuri wo kudasai" es la fórmula exacta en farmacia.'
					},
					{
						jp: 'びょうきです。',
						romaji: 'Byouki desu.',
						translation: 'Estoy enfermo/a.',
						correct: false,
						feedback_es: '"Byouki desu" es vago. Sé específico: "atama ga itai desu" (me duele la cabeza).'
					},
					{
						jp: 'たべたくないです。',
						romaji: 'Tabetaku nai desu.',
						translation: 'No quiero comer.',
						correct: false,
						feedback_es: 'Eso habla del apetito. Para describir dolor usa "[parte] ga itai desu".'
					}
				],
				next_npc: {
					jp: 'わかりました。こちらの くすりは いかがですか？',
					romaji: 'Wakarimashita. Kochira no kusuri wa ikaga desu ka?',
					translation: 'Entendido. ¿Qué le parece este medicamento?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（くすりの のみかたを きいてください）',
				prompt_romaji: '(Kusuri no nomikata wo kiite kudasai)',
				prompt_translation: '¿Cómo preguntas cómo tomar el medicamento?',
				choices: [
					{
						jp: 'これは どうやって のみますか？',
						romaji: 'Kore wa dou yatte nomimasu ka?',
						translation: '¿Cómo se toma esto?',
						correct: true,
						feedback_es: '¡Excelente! "Dou yatte ～ますか" es la estructura perfecta para preguntar cómo hacer algo.'
					},
					{
						jp: 'これは なんですか？',
						romaji: 'Kore wa nan desu ka?',
						translation: '¿Qué es esto?',
						correct: false,
						feedback_es: 'Pregunta qué es, no cómo tomarlo. Para instrucciones usa "dou yatte nomimasu ka?"'
					},
					{
						jp: 'おいしいですか？',
						romaji: 'Oishii desu ka?',
						translation: '¿Está delicioso?',
						correct: false,
						feedback_es: '¡Raro preguntar si el medicamento está rico! Pregunta cómo tomarlo con "dou yatte nomimasu ka?"'
					}
				],
				next_npc: {
					jp: 'しょくごに みっつ のんでください。',
					romaji: 'Shokugo ni mittsu nonde kudasai.',
					translation: 'Tómese tres después de comer.'
				}
			},
			{
				type: 'npc',
				jp: 'おだいじに！',
				romaji: 'Odaiji ni!',
				translation: '¡Que se mejore!'
			}
		]
	},

	// ── N4 ──────────────────────────────────────────────────────────

	{
		id: 'reserva',
		title_es: 'Haciendo una reserva',
		title_en: 'Making a reservation',
		level: 'N4',
		icon: '📞',
		context_es: 'Llamas por teléfono a un restaurante para hacer una reserva.',
		turns: [
			{
				type: 'npc',
				jp: 'はい、さくらレストランでございます。',
				romaji: 'Hai, Sakura Resutoran de gozaimasu.',
				translation: 'Hola, Restaurante Sakura a sus órdenes.'
			},
			{
				type: 'choice',
				prompt_jp: '（よやくを したいです）',
				prompt_romaji: '(Yoyaku wo shitai desu)',
				prompt_translation: '¿Cómo dices que quieres hacer una reserva?',
				choices: [
					{
						jp: 'よやくを したいのですが、よろしいでしょうか？',
						romaji: 'Yoyaku wo shitai no desu ga, yoroshii deshou ka?',
						translation: 'Me gustaría hacer una reserva, ¿sería posible?',
						correct: true,
						feedback_es: '¡Perfecto N4! "～たいのですが" suaviza la petición, muy natural por teléfono en Japón.'
					},
					{
						jp: 'よやくしてください！',
						romaji: 'Yoyaku shite kudasai!',
						translation: '¡Haga una reserva!',
						correct: false,
						feedback_es: 'Demasiado directo/imperativo por teléfono. Usa la forma suave "～たいのですが".'
					},
					{
						jp: 'よやくが あります。',
						romaji: 'Yoyaku ga arimasu.',
						translation: 'Hay una reserva.',
						correct: false,
						feedback_es: 'Eso dice que ya existe una reserva, no que quieres hacer una nueva.'
					}
				],
				next_npc: {
					jp: 'はい、もちろんです。なんにちの ご予定でしょうか？',
					romaji: 'Hai, mochiron desu. Nan-nichi no goyotei deshou ka?',
					translation: 'Por supuesto. ¿Para qué fecha tiene previsto?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（きんようびの よるに よやくしたいです）',
				prompt_romaji: '(Kin\'youbi no yoru ni yoyaku shitai desu)',
				prompt_translation: '¿Cómo dices el viernes por la noche?',
				choices: [
					{
						jp: 'きんようびの よるに おねがいしたいのですが。',
						romaji: 'Kin\'youbi no yoru ni onegai shitai no desu ga.',
						translation: 'Me gustaría el viernes por la noche.',
						correct: true,
						feedback_es: '¡Correcto! "～の夜に" para especificar día + noche. La forma suave "～たいのですが" es clave.'
					},
					{
						jp: 'きんようびが すきです。',
						romaji: 'Kin\'youbi ga suki desu.',
						translation: 'Me gustan los viernes.',
						correct: false,
						feedback_es: 'Expresa gusto por los viernes, no especifica una fecha para la reserva.'
					},
					{
						jp: 'らいしゅうです。',
						romaji: 'Raishuu desu.',
						translation: 'Es la semana próxima.',
						correct: false,
						feedback_es: 'Muy vago. Especifica el día y hora: "kin\'youbi no yoru ni onegaishimasu".'
					}
				],
				next_npc: {
					jp: 'かしこまりました。なんめい さまでしょうか？',
					romaji: 'Kashikomarimashita. Nan-mei-sama deshou ka?',
					translation: 'Entendido. ¿Para cuántas personas?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（4にんです）',
				prompt_romaji: '(Yonin desu)',
				prompt_translation: 'Son 4 personas — ¿cuál es la respuesta más educada?',
				choices: [
					{
						jp: 'よにんで おねがいします。',
						romaji: 'Yonin de onegaishimasu.',
						translation: 'Para cuatro personas, por favor.',
						correct: true,
						feedback_es: '¡Muy bien! "Yonin de onegaishimasu" es el formato correcto: contador de personas + solicitud.'
					},
					{
						jp: 'しにんです。',
						romaji: 'Shi-nin desu.',
						translation: 'Somos cuatro.',
						correct: false,
						feedback_es: '"Shi-nin" (4 personas con lectura "shi") suena igual que "muerte" (死). Usa siempre "yo-nin".'
					},
					{
						jp: 'たくさんです。',
						romaji: 'Takusan desu.',
						translation: 'Somos muchos.',
						correct: false,
						feedback_es: '"Takusan" es vago. En reservas siempre da el número exacto.'
					}
				],
				next_npc: {
					jp: 'よにめいさまですね。では、ごよやくを おうかがいしました。',
					romaji: 'Yo-mei-sama desu ne. Dewa, go-yoyaku wo oukagai shimashita.',
					translation: 'Cuatro personas. Bien, hemos tomado su reserva.'
				}
			}
		]
	},

	{
		id: 'aeropuerto',
		title_es: 'En el aeropuerto',
		title_en: 'At the airport',
		level: 'N4',
		icon: '✈️',
		context_es: 'Estás en el aeropuerto de Narita y necesitas orientarte.',
		turns: [
			{
				type: 'npc',
				jp: 'おこまりですか？なにか おてつだいしましょうか？',
				romaji: 'Okomari desu ka? Nanika otetsudai shimashou ka?',
				translation: '¿Tiene algún problema? ¿Puedo ayudarle?'
			},
			{
				type: 'choice',
				prompt_jp: '（てにもつが みあたりません）',
				prompt_romaji: '(Tenimotsu ga miatarimasen)',
				prompt_translation: '¿Cómo dices que no encuentras tu equipaje?',
				choices: [
					{
						jp: 'すみません、てにもつが みつかりません。どこに いけばいいですか？',
						romaji: 'Sumimasen, tenimotsu ga mitsukarimasen. Doko ni ikeba ii desu ka?',
						translation: 'Disculpe, no encuentro mi equipaje. ¿A dónde debo ir?',
						correct: true,
						feedback_es: '¡Excelente N4! "～が見つかりません" (no lo encuentro) + "どこに行けばいいですか" es perfecto.'
					},
					{
						jp: 'かばんが ありません。',
						romaji: 'Kaban ga arimasen.',
						translation: 'No hay maleta.',
						correct: false,
						feedback_es: 'Muy simple. "Tenimotsu ga mitsukarimasen" (no encuentro el equipaje) es más preciso y natural.'
					},
					{
						jp: 'まいごに なりました。',
						romaji: 'Maigo ni narimashita.',
						translation: 'Me perdí.',
						correct: false,
						feedback_es: '"Maigo" es para personas perdidas, no objetos. Usa "tenimotsu ga mitsukarimasen".'
					}
				],
				next_npc: {
					jp: 'ロストバゲッジカウンターへ どうぞ。あちらです。',
					romaji: 'Rosuto baggeji kauntaa e douzo. Achira desu.',
					translation: 'Por favor diríjase al mostrador de equipaje perdido. Está por allá.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（とうちゃくが おくれて、のりつぎが しんぱいです）',
				prompt_romaji: '(Touchaku ga okurete, noritsugi ga shinpai desu)',
				prompt_translation: '¿Cómo dices que llegas tarde y te preocupa perder la conexión?',
				choices: [
					{
						jp: 'フライトが おくれたので、のりつぎに まにあうか しんぱいです。',
						romaji: 'Furaito ga okureta no de, noritsugi ni ma ni au ka shinpai desu.',
						translation: 'El vuelo se retrasó y me preocupa llegar a tiempo a mi conexión.',
						correct: true,
						feedback_es: '¡Perfecto! "～ので" expresa causa, "間に合うか心配" expresa preocupación de llegar a tiempo. N4 puro.'
					},
					{
						jp: 'おそいです。',
						romaji: 'Osoi desu.',
						translation: 'Es tarde.',
						correct: false,
						feedback_es: 'Muy básico y ambiguo. Explica la situación completa con "～ので、～か心配です".'
					},
					{
						jp: 'つぎの ひこうきは なんじですか？',
						romaji: 'Tsugi no hikouki wa nanji desu ka?',
						translation: '¿A qué hora es el próximo vuelo?',
						correct: false,
						feedback_es: 'Útil pero no expresa la urgencia. Primero explica que el vuelo se retrasó.'
					}
				],
				next_npc: {
					jp: 'ご安心ください。ゲートまで ご案内します。',
					romaji: 'Go-anshin kudasai. Geeto made go-annai shimasu.',
					translation: 'Tranquilo/a. Le acompaño hasta la puerta de embarque.'
				}
			},
			{
				type: 'npc',
				jp: 'どうぞ お気をつけて。よいご旅行を！',
				romaji: 'Douzo okio tsukete. Yoi go-ryokou wo!',
				translation: '¡Cuídese mucho. Buen viaje!'
			}
		]
	},

	{
		id: 'oficina',
		title_es: 'En la oficina',
		title_en: 'At the office',
		level: 'N4',
		icon: '💼',
		context_es: 'Es tu primer día en una empresa japonesa. Tu supervisor te orienta.',
		turns: [
			{
				type: 'npc',
				jp: 'おはようございます！きょうから よろしくおねがいします。',
				romaji: 'Ohayou gozaimasu! Kyou kara yoroshiku onegaishimasu.',
				translation: '¡Buenos días! A partir de hoy, cuento con usted.'
			},
			{
				type: 'choice',
				prompt_jp: '（こちらこそ、よろしくおねがいします）',
				prompt_romaji: '(Kochirakoso, yoroshiku onegaishimasu)',
				prompt_translation: '¿Cómo respondes de forma apropiada?',
				choices: [
					{
						jp: 'こちらこそ、よろしくおねがいいたします。',
						romaji: 'Kochirakoso, yoroshiku onegai itashimasu.',
						translation: 'Yo también, me pongo a sus órdenes.',
						correct: true,
						feedback_es: '¡Perfecto! "Kochirakoso" (yo también) + "itashimasu" (forma keigo de shimasu) es impecable.'
					},
					{
						jp: 'ありがとう！',
						romaji: 'Arigatou!',
						translation: '¡Gracias!',
						correct: false,
						feedback_es: 'Demasiado casual para una oficina japonesa. Usa keigo: "yoroshiku onegai itashimasu".'
					},
					{
						jp: 'わたしは [なまえ] です。',
						romaji: 'Watashi wa [namae] desu.',
						translation: 'Soy [nombre].',
						correct: false,
						feedback_es: 'La presentación ya pasó. Aquí corresponde "kochirakoso, yoroshiku onegai itashimasu".'
					}
				],
				next_npc: {
					jp: 'では、かいぎが あります。いっしょに きていただけますか？',
					romaji: 'Dewa, kaigi ga arimasu. Issho ni kite itadakemasu ka?',
					translation: 'Bien, hay una reunión. ¿Podría venir conmigo?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（かいぎに さんかします）',
				prompt_romaji: '(Kaigi ni sanka shimasu)',
				prompt_translation: '¿Cómo confirmas tu asistencia a la reunión?',
				choices: [
					{
						jp: 'はい、よろこんで まいります。',
						romaji: 'Hai, yorokonde mairimasu.',
						translation: 'Sí, con mucho gusto iré.',
						correct: true,
						feedback_es: '¡Excelente keigo! "Mairimasu" es la forma humble de "ikimasu". "Yorokonde" muestra entusiasmo respetuoso.'
					},
					{
						jp: 'はい、いきます。',
						romaji: 'Hai, ikimasu.',
						translation: 'Sí, voy.',
						correct: false,
						feedback_es: 'Correcto pero neutro. En contexto laboral japonés, "mairimasu" (keigo) es más apropiado.'
					},
					{
						jp: 'かいぎが きらいです。',
						romaji: 'Kaigi ga kirai desu.',
						translation: 'Odio las reuniones.',
						correct: false,
						feedback_es: '¡Nunca digas esto en una empresa japonesa! Responde con "yorokonde mairimasu".'
					}
				],
				next_npc: {
					jp: 'ありがとうございます。では、10じに かいぎしつに きてください。',
					romaji: 'Arigatou gozaimasu. Dewa, juuji ni kaigishitsu ni kite kudasai.',
					translation: 'Gracias. Entonces, venga a la sala de reuniones a las 10.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（しつもんが あります）',
				prompt_romaji: '(Shitsumon ga arimasu)',
				prompt_translation: '¿Cómo pides permiso para hacer una pregunta educadamente?',
				choices: [
					{
						jp: 'おそれいりますが、しつもんしても よろしいでしょうか？',
						romaji: 'Osoreirimasu ga, shitsumon shite mo yoroshii deshou ka?',
						translation: 'Disculpe la molestia, ¿podría hacerle una pregunta?',
						correct: true,
						feedback_es: '¡Keigo avanzado N4! "Osoreirimasu ga" es la forma más educada de preface una petición en negocios.'
					},
					{
						jp: 'きいてもいいですか？',
						romaji: 'Kiite mo ii desu ka?',
						translation: '¿Puedo preguntar?',
						correct: false,
						feedback_es: 'Correcto en N4 pero demasiado casual para keigo de oficina. Usa "osoreirimasu ga" para más formalidad.'
					},
					{
						jp: 'しつもん！',
						romaji: 'Shitsumon!',
						translation: '¡Pregunta!',
						correct: false,
						feedback_es: 'Demasiado brusco. En contexto formal siempre pide permiso con "～shite mo yoroshii deshou ka?"'
					}
				],
				next_npc: {
					jp: 'もちろんです。どうぞ。',
					romaji: 'Mochiron desu. Douzo.',
					translation: 'Por supuesto. Adelante.'
				}
			}
		]
	},

	// ── N3 ──────────────────────────────────────────────────────────

	{
		id: 'vecino',
		title_es: 'Con el vecino',
		title_en: 'With a neighbor',
		level: 'N3',
		icon: '🏠',
		context_es: 'Vives en Japón y tienes una conversación con tu vecino en el pasillo.',
		turns: [
			{
				type: 'npc',
				jp: 'あ、[なまえ]さん！さいきん こんなに さむくなりましたね。',
				romaji: 'A, [namae]-san! Saikin konna ni samuku narimashita ne.',
				translation: '¡Ah, [nombre]! Últimamente ha enfriado bastante, ¿verdad?'
			},
			{
				type: 'choice',
				prompt_jp: '（てんきの はなしに のりましょう）',
				prompt_romaji: '(Tenki no hanashi ni norimashou)',
				prompt_translation: '¿Cómo respondes naturalmente al comentario del clima?',
				choices: [
					{
						jp: 'そうですね。もう こたつが かかせませんよ。',
						romaji: 'Sou desu ne. Mou kotatsu ga kakasemasen yo.',
						translation: 'Sí, verdad. Ya no puedo vivir sin el kotatsu.',
						correct: true,
						feedback_es: '¡Muy natural N3! "そうですね" para acordar + "～が欠かせません" (indispensable) muestra nivel avanzado.'
					},
					{
						jp: 'さむいです。',
						romaji: 'Samui desu.',
						translation: 'Hace frío.',
						correct: false,
						feedback_es: 'Demasiado escueto. Muestra más naturalidad con "sou desu ne" + algún comentario.'
					},
					{
						jp: 'わかりません。',
						romaji: 'Wakarimasen.',
						translation: 'No sé.',
						correct: false,
						feedback_es: 'Raro responder "no sé" al clima. Siempre acuerda con "sou desu ne" en conversación informal.'
					}
				],
				next_npc: {
					jp: 'ほんとうに！ところで、きのうの よる、うるさくなかったですか？',
					romaji: 'Hontou ni! Tokoro de, kinou no yoru, urusaku nakatta desu ka?',
					translation: '¡Cierto! Por cierto, ayer por la noche, ¿no estuvo muy ruidoso?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（きのうの よる、となりの へやが うるさかったです）',
				prompt_romaji: '(Kinou no yoru, tonari no heya ga urusakatta desu)',
				prompt_translation: '¿Cómo respondes sobre el ruido de ayer?',
				choices: [
					{
						jp: 'ええ、すこし きになりましたが、まあ しかたないですよね。',
						romaji: 'Ee, sukoshi ki ni narimashita ga, maa shikata nai desu yo ne.',
						translation: 'Sí, me llamó un poco la atención, pero bueno, qué se le va a hacer.',
						correct: true,
						feedback_es: '¡Natural N3! "気になる" (llamar la atención) + "しかたない" (no hay remedio) son expresiones clave.'
					},
					{
						jp: 'うるさかったです。',
						romaji: 'Urusakatta desu.',
						translation: 'Estuvo ruidoso.',
						correct: false,
						feedback_es: 'Correcto pero seco. Añade matices con "sukoshi ki ni narimashita ga..." para sonar más natural.'
					},
					{
						jp: 'しりません。',
						romaji: 'Shirimasen.',
						translation: 'No lo sé.',
						correct: false,
						feedback_es: '"Shirimasen" es para cosas que no conoces, no para lo que no escuchaste. Usa "kikoemasendeshita".'
					}
				],
				next_npc: {
					jp: 'そうですよね。では、また！きをつけて。',
					romaji: 'Sou desu yo ne. Dewa, mata! Ki wo tsukete.',
					translation: 'Claro que sí. ¡Hasta luego! Cuídese.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（はなしを おわらせましょう）',
				prompt_romaji: '(Hanashi wo owarasemасhou)',
				prompt_translation: '¿Cómo terminas la conversación de forma natural?',
				choices: [
					{
						jp: 'では、また！おたがいに きをつけましょうね。',
						romaji: 'Dewa, mata! Otagai ni ki wo tsuke mashou ne.',
						translation: '¡Hasta luego! Cuídémonos mutuamente.',
						correct: true,
						feedback_es: '¡Perfecto! "お互いに" (mutuamente) + "～ましょうね" invita al otro — muy natural entre vecinos.'
					},
					{
						jp: 'さようなら。',
						romaji: 'Sayounara.',
						translation: 'Adiós.',
						correct: false,
						feedback_es: '"Sayounara" suena muy definitivo entre vecinos que se ven a diario. Usa "dewa mata!" o "ja, mata!".'
					},
					{
						jp: 'きります。',
						romaji: 'Kirimasu.',
						translation: 'Corto (como en teléfono).',
						correct: false,
						feedback_es: '"Kirimasu" es para colgar el teléfono. Para despedirse en persona usa "dewa mata!" o "ja ne!".'
					}
				]
			}
		]
	},

	{
		id: 'planes',
		title_es: 'Planes para el fin de semana',
		title_en: 'Weekend plans',
		level: 'N3',
		icon: '🎌',
		context_es: 'Un compañero de trabajo te pregunta qué harás el fin de semana.',
		turns: [
			{
				type: 'npc',
				jp: 'ねえ、こんしゅうまつ なにか よていある？',
				romaji: 'Nee, konshuu matsu nanika yotei aru?',
				translation: 'Oye, ¿tienes planes este fin de semana?'
			},
			{
				type: 'choice',
				prompt_jp: '（きょうとに いくつもりです）',
				prompt_romaji: '(Kyouto ni iku tsumori desu)',
				prompt_translation: 'Planeas ir a Kyoto — ¿cómo lo expresas?',
				choices: [
					{
						jp: 'うん、きょうとに いくつもりなんだ。ひさしぶりにね。',
						romaji: 'Un, Kyouto ni iku tsumori nan da. Hisashiburi ni ne.',
						translation: 'Sí, tengo planeado ir a Kyoto. Después de mucho tiempo.',
						correct: true,
						feedback_es: '¡Excelente N3! "～つもりなんだ" (forma casual de intención) + "ひさしぶりに" es muy natural entre colegas.'
					},
					{
						jp: 'きょうとに いきます。',
						romaji: 'Kyouto ni ikimasu.',
						translation: 'Voy a Kyoto.',
						correct: false,
						feedback_es: 'Correcto pero formal para una conversación casual. Usa "iku tsumori" o "iku yotei" en registro informal.'
					},
					{
						jp: 'よていが ありません。',
						romaji: 'Yotei ga arimasen.',
						translation: 'No tengo planes.',
						correct: false,
						feedback_es: 'Dijiste que vas a Kyoto, no que no tienes planes. Usa "～つもりなんだ" para expresar intención casual.'
					}
				],
				next_npc: {
					jp: 'いいね！きょうとなら、どこ いくの？',
					romaji: 'Ii ne! Kyouto nara, doko iku no?',
					translation: '¡Qué bien! Si vas a Kyoto, ¿a dónde irás?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（ふしみいなりに いきたいです）',
				prompt_romaji: '(Fushimi Inari ni ikitai desu)',
				prompt_translation: '¿Cómo recomiendas Fushimi Inari con entusiasmo?',
				choices: [
					{
						jp: 'ふしみいなりに いくつもり。あの とりいが ずっと みたかったんだよね。',
						romaji: 'Fushimi Inari ni iku tsumori. Ano torii ga zutto mitakatta n da yo ne.',
						translation: 'Pienso ir a Fushimi Inari. Llevaba mucho tiempo queriendo ver esos torii.',
						correct: true,
						feedback_es: '¡Perfecto N3! "ずっと～たかったんだよね" expresa un deseo largo acumulado — muy natural y expresivo.'
					},
					{
						jp: 'ふしみいなりが あります。',
						romaji: 'Fushimi Inari ga arimasu.',
						translation: 'Está Fushimi Inari.',
						correct: false,
						feedback_es: 'Solo dice que existe el lugar. Expresa tu intención con "iku tsumori" y tu emoción.'
					},
					{
						jp: 'しりません。',
						romaji: 'Shirimasen.',
						translation: 'No sé.',
						correct: false,
						feedback_es: 'Si vas a Kyoto y no sabes adónde ir, usa "mada kimete nai" (no he decidido aún).'
					}
				],
				next_npc: {
					jp: 'わあ、いいなあ！おみやげ かってきてね！',
					romaji: 'Waa, ii naa! Omiyage katte kite ne!',
					translation: '¡Vaya, qué envidia! ¡Tráeme un souvenir!'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（おみやげを かってくることを やくそくしましょう）',
				prompt_romaji: '(Omiyage wo katte kuru koto wo yakusoku shimashou)',
				prompt_translation: '¿Cómo prometés traer un souvenir de forma casual?',
				choices: [
					{
						jp: 'もちろん！なにが いい？きにいりそうなの かってくるよ。',
						romaji: 'Mochiron! Nani ga ii? Ki ni iri sou na no katte kuru yo.',
						translation: '¡Por supuesto! ¿Qué quieres? Te traeré algo que te guste.',
						correct: true,
						feedback_es: '¡Brillante N3! "～そうな" (que parece que gustará) + "かってくるよ" muestra naturalidad y cuidado.'
					},
					{
						jp: 'はい、かいます。',
						romaji: 'Hai, kaimasu.',
						translation: 'Sí, compraré.',
						correct: false,
						feedback_es: 'Correcto pero muy frío. La respuesta correcta muestra más calidez y naturalidad coloquial.'
					},
					{
						jp: 'おみやげが きらいです。',
						romaji: 'Omiyage ga kirai desu.',
						translation: 'No me gustan los souvenirs.',
						correct: false,
						feedback_es: 'En Japón los omiyage son culturalmente muy importantes. ¡Nunca rechaces traerlos!'
					}
				],
				next_npc: {
					jp: 'やったー！たのしんできてね！',
					romaji: 'Yattaa! Tanoshinde kite ne!',
					translation: '¡Genial! ¡Que lo disfrutes!'
				}
			}
		]
	},

	// ─── N2 ──────────────────────────────────────────────────────────────────────

	{
		id: 'entrevista',
		title_es: 'Entrevista de trabajo',
		title_en: 'Job Interview',
		level: 'N2',
		icon: '💼',
		context_es: 'Estás siendo entrevistado para un puesto en una empresa japonesa.',
		turns: [
			{
				type: 'npc',
				jp: '本日はお越しいただきありがとうございます。まず、自己紹介をお願いできますか。',
				romaji: 'Honjitsu wa okoши itadaki arigatou gozaimasu. Mazu, jiko shoukai wo onegai dekimasu ka.',
				translation: 'Gracias por venir hoy. ¿Podría presentarse primero?'
			},
			{
				type: 'choice',
				prompt_jp: '（丁寧に自己紹介してください）',
				prompt_romaji: '(Teinei ni jiko shoukai shite kudasai)',
				prompt_translation: 'Preséntate de forma apropiada para una entrevista.',
				choices: [
					{
						jp: '〇〇と申します。現在、〇〇社で営業を担当しており、御社の事業に非常に興味を持っております。',
						romaji: '〇〇 to moushimasu. Genzai, 〇〇-sha de eigyou wo tantou shite ori, on-sha no jigyou ni hijou ni kyoumi wo motte orimasu.',
						translation: 'Me llamo 〇〇. Actualmente me encargo de ventas en 〇〇, y tengo mucho interés en el negocio de su empresa.',
						correct: true,
						feedback_es: 'Perfecto N2. "と申します" (keigo para "me llamo"), "〜ており" (forma te+おり formal), "御社" (su empresa, keigo) muestran dominio del lenguaje empresarial.'
					},
					{
						jp: '私は〇〇です。よろしくお願いします。',
						romaji: 'Watashi wa 〇〇 desu. Yoroshiku onegai shimasu.',
						translation: 'Soy 〇〇. Mucho gusto.',
						correct: false,
						feedback_es: 'Demasiado informal para entrevista. Usa "と申します" en lugar de "です" y añade contexto profesional.'
					},
					{
						jp: '〇〇っていいます。よろしく。',
						romaji: '〇〇 tte iimasu. Yoroshiku.',
						translation: 'Me llaman 〇〇. Hola.',
						correct: false,
						feedback_es: 'Forma casual completamente inapropiada para entrevista. "って" y "よろしく" solo con amigos.'
					}
				],
				next_npc: {
					jp: 'ありがとうございます。では、志望動機をお聞かせいただけますか。',
					romaji: 'Arigatou gozaimasu. Dewa, shibou douki wo okikase itadakemasu ka.',
					translation: 'Gracias. ¿Podría contarnos sus motivaciones para postularse?'
				}
			},
			{
				type: 'npc',
				jp: '弊社を志望された理由を、具体的に教えていただけますか。',
				romaji: 'Heisha wo shibou sareta riyuu wo, gutaiteki ni oshiete itadakemasu ka.',
				translation: '¿Podría explicar concretamente por qué postuló a nuestra empresa?'
			},
			{
				type: 'choice',
				prompt_jp: '（志望動機を述べてください）',
				prompt_romaji: '(Shibou douki wo nobete kudasai)',
				prompt_translation: 'Da tus razones de forma profesional y concreta.',
				choices: [
					{
						jp: '御社のグローバル展開に魅力を感じております。私の語学力を活かし、海外事業の拡大に貢献したいと考えております。',
						romaji: 'On-sha no gurooбaru tenkai ni miryoku wo kanjite orimasu. Watashi no gogakuryoku wo ikashi, kaigai jigyou no kakudai ni kouken shitai to kangaete orimasu.',
						translation: 'Me atrae la expansión global de su empresa. Pienso contribuir al crecimiento del negocio internacional aprovechando mis habilidades lingüísticas.',
						correct: true,
						feedback_es: '"御社" (su empresa, respeto), "〜に貢献したい" (quiero contribuir), "と考えております" (keigo de "pienso"). Respuesta concreta y motivadora.'
					},
					{
						jp: '給料がよさそうだからです。',
						romaji: 'Kyuuryou ga yosa sou dakara desu.',
						translation: 'Porque parece que el salario es bueno.',
						correct: false,
						feedback_es: 'Nunca menciones el salario como motivación en una entrevista japonesa. Es señal de falta de compromiso con la empresa.'
					},
					{
						jp: '家から近いので応募しました。',
						romaji: 'Ie kara chikai node oubo shimashita.',
						translation: 'Apliqué porque está cerca de mi casa.',
						correct: false,
						feedback_es: 'Razón inapropiada. La cultura laboral japonesa valora la dedicación a la empresa por encima de la conveniencia personal.'
					}
				],
				next_npc: {
					jp: 'ご回答ありがとうございます。最終的な結果は来週中にご連絡いたします。',
					romaji: 'Gokaito arigatou gozaimasu. Saishuteki na kekka wa raishuu-juu ni gorenraku itashimasu.',
					translation: 'Gracias por su respuesta. Le contactaremos con el resultado final durante la próxima semana.'
				}
			}
		]
	},

	{
		id: 'banco',
		title_es: 'Abrir cuenta bancaria',
		title_en: 'Opening a Bank Account',
		level: 'N2',
		icon: '🏦',
		context_es: 'Vas al banco a abrir una cuenta por primera vez en Japón.',
		turns: [
			{
				type: 'npc',
				jp: 'いらっしゃいませ。本日はどのようなご用件でしょうか。',
				romaji: 'Irasshaimase. Honjitsu wa dono you na goyouken deshou ka.',
				translation: 'Bienvenido. ¿En qué le podemos ayudar hoy?'
			},
			{
				type: 'choice',
				prompt_jp: '（口座開設したいと伝えてください）',
				prompt_romaji: '(Kouza kaisetsu shitai to tsutaete kudasai)',
				prompt_translation: 'Comunica que quieres abrir una cuenta.',
				choices: [
					{
						jp: '普通預金口座を開設したいのですが、手続きをお願いできますでしょうか。',
						romaji: 'Futsuu yokin kouza wo kaisetsu shitai no desu ga, tetsuzuki wo onegai dekimasu deshou ka.',
						translation: 'Me gustaría abrir una cuenta de ahorro corriente. ¿Podría orientarme con los trámites?',
						correct: true,
						feedback_es: '"普通預金" (cuenta corriente de ahorro), "〜のですが" (explicación suave), "〜できますでしょうか" (doble keigo de petición muy educado).'
					},
					{
						jp: '口座を作りたいです。',
						romaji: 'Kouza wo tsukuritai desu.',
						translation: 'Quiero crear una cuenta.',
						correct: false,
						feedback_es: 'Correcto pero informal. En el banco usa vocabulario técnico como "開設" y formas más keigo para causar buena impresión.'
					},
					{
						jp: 'お金を入れたい。',
						romaji: 'Okane wo iretai.',
						translation: 'Quiero meter dinero.',
						correct: false,
						feedback_es: 'No especifica qué quieres hacer. "入金" es depositar en una cuenta existente; para crear una cuenta usa "口座開設".'
					}
				],
				next_npc: {
					jp: 'かしこまりました。本人確認書類をお持ちでしょうか。在留カードとパスポートが必要でございます。',
					romaji: 'Kashikomarimashita. Honnin kakunin shorui wo omochi deshou ka. Zairyuu kaado to pasupooto ga hitsuyou de gozaimasu.',
					translation: 'Entendido. ¿Tiene documentos de identificación? Necesitamos la tarjeta de residencia y el pasaporte.'
				}
			},
			{
				type: 'npc',
				jp: '印鑑はお持ちですか。お持ちでない場合は、サインでもご対応可能でございます。',
				romaji: 'Inkan wa omochi desu ka. Omochi denai baai wa, sain demo goтайоо kanou de gozaimasu.',
				translation: '¿Tiene sello personal (hanko)? Si no tiene, también podemos aceptar firma.'
			},
			{
				type: 'choice',
				prompt_jp: '（印鑑を持っていない場合の対応）',
				prompt_romaji: '(Inkan wo motte inai baai no taiou)',
				prompt_translation: 'No tienes hanko. ¿Cómo respondes?',
				choices: [
					{
						jp: '申し訳ありませんが、印鑑はまだ持っておりません。サインでお願いできますでしょうか。',
						romaji: 'Moushiwake arimasen ga, inkan wa mada motte orimasen. Sain de onegai dekimasu deshou ka.',
						translation: 'Lo siento, todavía no tengo hanko. ¿Podría hacerlo con firma?',
						correct: true,
						feedback_es: '"申し訳ありませんが" (pedir disculpas educadamente antes de pedir algo), "〜ておりません" (keigo de "no tengo") — respuesta natural y cortés.'
					},
					{
						jp: 'ないです。サインでいいですか？',
						romaji: 'Nai desu. Sain de ii desu ka?',
						translation: 'No tengo. ¿Vale con firma?',
						correct: false,
						feedback_es: 'Demasiado directo e informal para un banco. En Japón siempre añade disculpa antes de comunicar una carencia.'
					},
					{
						jp: 'えっ、印鑑って何ですか？',
						romaji: 'E, inkan tte nan desu ka?',
						translation: 'Eh, ¿qué es un hanko?',
						correct: false,
						feedback_es: 'Aunque sea válido no saber, en N2 debes conocer vocabulario básico bancario. Mejor decir directamente que no tienes y pedir alternativa.'
					}
				],
				next_npc: {
					jp: '承知いたしました。では、こちらの申込書にご記入をお願いいたします。',
					romaji: 'Shouchi itashimashita. Dewa, kochira no moushikomisho ni gokinyuu wo onegai itashimasu.',
					translation: 'Entendido. Por favor, complete este formulario de solicitud.'
				}
			}
		]
	},

	{
		id: 'apartamento',
		title_es: 'Buscar apartamento',
		title_en: 'Apartment Hunting',
		level: 'N2',
		icon: '🏠',
		context_es: 'Estás en una inmobiliaria buscando apartamento para alquilar.',
		turns: [
			{
				type: 'npc',
				jp: 'どのようなお部屋をお探しでしょうか。ご予算と条件をお聞かせいただけますか。',
				romaji: 'Dono you na oheya wo osagashi deshou ka. Goyosan to jouken wo okikase itadakemasu ka.',
				translation: '¿Qué tipo de habitación busca? ¿Podría indicarnos su presupuesto y condiciones?'
			},
			{
				type: 'choice',
				prompt_jp: '（希望条件を説明してください）',
				prompt_romaji: '(Kibou jouken wo setsumei shite kudasai)',
				prompt_translation: 'Explica lo que buscas en el apartamento.',
				choices: [
					{
						jp: '1LDKで、駅から徒歩10分以内、家賃は8万円以下を希望しております。ペット可の物件だと助かります。',
						romaji: '1LDK de, eki kara toho juu-fun inai, yachin wa hachi man en ika wo kibou shite orimasu. Petto-ka no bukken da to tasukarimasu.',
						translation: 'Busco un 1LDK, a menos de 10 minutos caminando de la estación, con alquiler máximo de 80,000 yenes. Agradecería que admitiera mascotas.',
						correct: true,
						feedback_es: 'Excelente N2. "1LDK" (vocab inmobiliario japonés), "〜以下" (menos de), "〜だと助かります" (agradecería si...) — natural y preciso.'
					},
					{
						jp: '安くて広い部屋がいいです。',
						romaji: 'Yasukute hiroi heya ga ii desu.',
						translation: 'Quiero una habitación barata y amplia.',
						correct: false,
						feedback_es: 'Muy vago. En Japón usa terminología específica: tipo (1K/1LDK/2LDK), distancia a la estación, presupuesto exacto.'
					},
					{
						jp: 'なんでもいいです。とにかく安ければ。',
						romaji: 'Nandemo ii desu. Tonikaku yasukereba.',
						translation: 'Cualquier cosa sirve. Mientras sea barato.',
						correct: false,
						feedback_es: 'Sin condiciones claras el agente no puede ayudarte. Siempre especifica condiciones mínimas aunque seas flexible.'
					}
				],
				next_npc: {
					jp: 'かしこまりました。条件に合う物件が3件ございます。内見のご希望はいつ頃でしょうか。',
					romaji: 'Kashikomarimashita. Jouken ni au bukken ga san-ken gozaimasu. Naiken no gokibou wa itsugoro deshou ka.',
					translation: 'Entendido. Tenemos 3 propiedades que cumplen sus condiciones. ¿Cuándo le vendría bien visitarlas?'
				}
			},
			{
				type: 'npc',
				jp: 'なお、こちらの物件は礼金が1ヶ月分、敷金が2ヶ月分必要となっております。',
				romaji: 'Nao, kochira no bukken wa reikin ga ikkagetsu-bun, shikikin ga nikagetsu-bun hitsuyou to natte orimasu.',
				translation: 'Por cierto, esta propiedad requiere 1 mes de reikin (depósito no reembolsable) y 2 meses de shikikin (depósito).'
			},
			{
				type: 'choice',
				prompt_jp: '（費用について確認してください）',
				prompt_romaji: '(Hiyou ni tsuite kakunin shite kudasai)',
				prompt_translation: 'Pregunta para aclarar los costos totales iniciales.',
				choices: [
					{
						jp: 'つまり、入居時の初期費用は最低でも家賃の4〜5ヶ月分ほどかかるということでしょうか。',
						romaji: 'Tsumari, nyuukyo-ji no shoki hiyou wa saitei demo yachin no yon〜go kagetsu-bun hodo kakaru to iu koto deshou ka.',
						translation: 'O sea, ¿los costos iniciales al momento de entrar serían mínimamente unos 4 a 5 meses de alquiler?',
						correct: true,
						feedback_es: '"つまり〜ということでしょうか" (confirmación elegante de lo entendido), "最低でも" (como mínimo) — N2 excelente para confirmar cifras importantes.'
					},
					{
						jp: '高すぎます！もっと安い物件はありますか？',
						romaji: 'Takasugimasu! Motto yasui bukken wa arimasu ka?',
						translation: '¡Es demasiado caro! ¿Hay propiedades más baratas?',
						correct: false,
						feedback_es: 'Quejarse directamente es imprudente. Primero confirma que entendiste bien los costos, luego puedes preguntar por alternativas con más tacto.'
					},
					{
						jp: 'わかりました。',
						romaji: 'Wakarimashita.',
						translation: 'Entendido.',
						correct: false,
						feedback_es: 'Demasiado pasivo. Es una cantidad significativa — confirma que entendiste bien los costos con una pregunta de verificación antes de comprometerte.'
					}
				],
				next_npc: {
					jp: 'おっしゃる通りです。ただ、礼金なしの物件も一部ございますので、ご希望でしたらご紹介いたします。',
					romaji: 'Ossharu toori desu. Tada, reikin-nashi no bukken mo ichibu gozaimasu node, gokibou deshitara goshookai itashimasu.',
					translation: 'Exactamente. Sin embargo, también tenemos algunas propiedades sin reikin, así que si lo desea, puedo presentárselas.'
				}
			}
		]
	},

	{
		id: 'telefono-empresa',
		title_es: 'Llamada de negocios',
		title_en: 'Business Phone Call',
		level: 'N2',
		icon: '📞',
		context_es: 'Recibes una llamada de un cliente importante en tu empresa.',
		turns: [
			{
				type: 'npc',
				jp: 'もしもし、株式会社〇〇の田中と申しますが、営業部の鈴木様はいらっしゃいますか。',
				romaji: 'Moshimoshi, Kabushiki Kaisha 〇〇 no Tanaka to moushimasu ga, eigyou-bu no Suzuki-sama wa irasshaimasu ka.',
				translation: 'Hola, soy Tanaka de 〇〇 Co., Ltd. ¿Está el Sr. Suzuki del departamento de ventas?'
			},
			{
				type: 'choice',
				prompt_jp: '（担当者が不在の時の対応）',
				prompt_romaji: '(Tantousha ga fuzai no toki no taiou)',
				prompt_translation: 'Suzuki no está. ¿Cómo respondes profesionalmente?',
				choices: [
					{
						jp: '田中様、いつもお世話になっております。あいにく鈴木はただいま外出しております。折り返しお電話するよう申し伝えますが、よろしいでしょうか。',
						romaji: 'Tanaka-sama, itsumo osewa ni natte orimasu. Ainiku Suzuki wa tadaima gaishutsu shite orimasu. Orikaeshi odenwa suru you moushitsutaemasu ga, yoroshii deshou ka.',
						translation: 'Señor Tanaka, gracias por contactarnos. Lamentablemente Suzuki está fuera ahora mismo. Le diré que le devuelva la llamada. ¿Le parece bien?',
						correct: true,
						feedback_es: '"いつもお世話になっております" (saludo estándar de negocios), "あいにく" (lamentablemente), apellido sin "さん" al hablar de tu propio colega, "申し伝える" (keigo de transmitir).'
					},
					{
						jp: '鈴木さんは今いません。後でかけ直してください。',
						romaji: 'Suzuki-san wa ima imasen. Ato de kakenaosite kudasai.',
						translation: 'Suzuki no está ahora. Por favor llame más tarde.',
						correct: false,
						feedback_es: 'Muy brusco e inapropiado. No uses "〜さん" para tu colega ante clientes, no pidas al cliente que vuelva a llamar — ofrece tú la devolución de llamada.'
					},
					{
						jp: 'ちょっと待ってください。',
						romaji: 'Chotto matte kudasai.',
						translation: 'Un momento por favor.',
						correct: false,
						feedback_es: 'Sin contexto ni información. El cliente no sabe si Suzuki está o no. Explica la situación y ofrece solución inmediatamente.'
					}
				],
				next_npc: {
					jp: 'ありがとうございます。では、折り返しご連絡をお待ちしております。よろしくお伝えください。',
					romaji: 'Arigatou gozaimasu. Dewa, orikaeshi gorenraku wo omachi shite orimasu. Yoroshiku otsutae kudasai.',
					translation: 'Gracias. Entonces esperaré su llamada de vuelta. Por favor transmítale mi saludo.'
				}
			}
		]
	},

	{
		id: 'ayuntamiento',
		title_es: 'Trámites en el ayuntamiento',
		title_en: 'City Hall Procedures',
		level: 'N2',
		icon: '🏛️',
		context_es: 'Necesitas registrar tu cambio de domicilio en el ayuntamiento.',
		turns: [
			{
				type: 'npc',
				jp: '番号札をお取りになってお待ちください。次の方、どういったご用件でしょうか。',
				romaji: 'Bangou-fuda wo otori ni natte omachi kudasai. Tsugi no kata, dou itta goyouken deshou ka.',
				translation: 'Tome un número y espere. Siguiente, ¿en qué le podemos ayudar?'
			},
			{
				type: 'choice',
				prompt_jp: '（転居届を出したいと伝えてください）',
				prompt_romaji: '(Tenkyo-todoke wo dashitai to tsutaete kudasai)',
				prompt_translation: 'Dí que vienes a notificar un cambio de domicilio.',
				choices: [
					{
						jp: '転居届を提出したいのですが、必要な書類を教えていただけますか。',
						romaji: 'Tenkyo-todoke wo teishutsu shitai no desu ga, hitsuyou na shorui wo oshiete itadakemasu ka.',
						translation: 'Quisiera presentar la notificación de cambio de domicilio. ¿Podría indicarme los documentos necesarios?',
						correct: true,
						feedback_es: '"転居届" (formulario de cambio de domicilio, vocab N2 clave), "〜のですが" (introducción suave), pedir documentos necesarios antes de empezar es muy práctico.'
					},
					{
						jp: '引っ越しました。',
						romaji: 'Hikkoshimashita.',
						translation: 'Me he mudado.',
						correct: false,
						feedback_es: 'Correcto pero insuficiente. El funcionario necesita saber qué trámite exacto quieres hacer. Usa el término técnico "転居届".'
					},
					{
						jp: '住所が変わったんですけど、どうすればいいですか？',
						romaji: 'Juusho ga kawatta n desu kedo, dou sureba ii desu ka?',
						translation: 'Se me cambió la dirección, ¿qué hago?',
						correct: false,
						feedback_es: 'La "n desu kedo" forma es demasiado casual. Usa vocabulario técnico y formas más formales en oficinas gubernamentales.'
					}
				],
				next_npc: {
					jp: 'こちらの転居届用紙にご記入ください。在留カードと現在の住所が確認できるものが必要です。',
					romaji: 'Kochira no tenkyo-todoke youshi ni gokinyuu kudasai. Zairyuu kaado to genzai no juusho ga kakunin dekiru mono ga hitsuyou desu.',
					translation: 'Por favor rellene este formulario de cambio de domicilio. Necesita la tarjeta de residencia y un documento que confirme la dirección actual.'
				}
			},
			{
				type: 'npc',
				jp: '手続きが完了いたしました。マイナンバーカードの住所変更もご希望でしょうか。',
				romaji: 'Tetsuzuki ga kanryou itashimashita. Mainanbaa kaado no juusho henkou mo gokibou deshou ka.',
				translation: 'El trámite ha concluido. ¿Desea también cambiar la dirección en su tarjeta My Number?'
			},
			{
				type: 'choice',
				prompt_jp: '（マイナンバーの変更も一緒にお願いする）',
				prompt_romaji: '(Mainanbaa no henkou mo issho ni onegai suru)',
				prompt_translation: 'Aprovecha para actualizar también el My Number.',
				choices: [
					{
						jp: 'はい、ぜひお願いいたします。同時に手続きできるのであれば大変助かります。',
						romaji: 'Hai, zehi onegai itashimasu. Douji ni tetsuzuki dekiru no de areba taihen tasukarimasu.',
						translation: 'Sí, por favor. Si se puede hacer al mismo tiempo sería de gran ayuda.',
						correct: true,
						feedback_es: '"ぜひ〜いたします" (con gusto, keigo), "〜のであれば" (si es posible que...) + "大変助かります" — educado y eficiente. Aprovechas bien el momento.'
					},
					{
						jp: 'いいです。',
						romaji: 'Ii desu.',
						translation: 'Está bien.',
						correct: false,
						feedback_es: '"いいです" es ambiguo — puede significar "sí" o "no, gracias". En situaciones formales sé más explícito para evitar malentendidos.'
					},
					{
						jp: 'また今度来ます。',
						romaji: 'Mata kondo kimasu.',
						translation: 'Vendré otra vez.',
						correct: false,
						feedback_es: 'Innecesariamente ineficiente. Aprovecha que ya estás en el ayuntamiento para hacer ambos trámites a la vez.'
					}
				],
				next_npc: {
					jp: '承知いたしました。では引き続き対応いたします。少々お待ちください。',
					romaji: 'Shouchi itashimashita. Dewa hikitsuzuki taiou itashimasu. Shoushou omachi kudasai.',
					translation: 'Entendido. Entonces continuamos con eso. Por favor espere un momento.'
				}
			}
		]
	},

	{
		id: 'reclamacion',
		title_es: 'Atención al cliente — Reclamación',
		title_en: 'Customer Complaint',
		level: 'N2',
		icon: '📋',
		context_es: 'Trabajas en una tienda. Un cliente insatisfecho viene a reclamar.',
		turns: [
			{
				type: 'npc',
				jp: '先日購入した商品に傷がついていたんですが、これはどういうことですか。',
				romaji: 'Senjitsu konyuu shita shouhin ni kizu ga tsuite ita n desu ga, kore wa dou iu koto desu ka.',
				translation: 'El producto que compré el otro día tenía un arañazo. ¿Cómo explica esto?'
			},
			{
				type: 'choice',
				prompt_jp: '（お客様のクレームに丁寧に対応してください）',
				prompt_romaji: '(Okyakusama no kuremu ni teinei ni taiou shite kudasai)',
				prompt_translation: 'Responde al cliente de forma apropiada y profesional.',
				choices: [
					{
						jp: 'この度はご不便をおかけして、誠に申し訳ございません。商品を拝見させていただけますか。状況を確認した上で、交換または返金の対応をいたします。',
						romaji: 'Konotabi wa go-fuben wo okake shite, makoto ni moushiwake gozaimasen. Shouhin wo haiken sasete itadakemasu ka. Joukyou wo kakunin shita ue de, koukan mata wa henkin no taiou wo itashimasu.',
						translation: 'Lamentamos mucho los inconvenientes causados. ¿Podría mostrarme el producto? Tras verificar la situación, procederemos con el cambio o reembolso.',
						correct: true,
						feedback_es: '"この度は" (en esta ocasión), "誠に申し訳ございません" (máxima disculpa keigo), "拝見させていただく" (ver con humildad), "確認した上で" (tras verificar) — manejo de crisis N2 perfecto.'
					},
					{
						jp: 'それは大変でしたね。でも、購入後の傷は弊社の責任ではありません。',
						romaji: 'Sore wa taihen deshita ne. Demo, konyuu-go no kizu wa heisha no sekinin dewa arimasen.',
						translation: 'Qué molestia. Pero los arañazos después de la compra no son responsabilidad de nuestra empresa.',
						correct: false,
						feedback_es: 'Respuesta defensiva inapropiada. Nunca culpes al cliente sin verificar. Primero disculpas, luego verifica los hechos.'
					},
					{
						jp: 'そうですか。レシートはありますか？',
						romaji: 'Sou desu ka. Reshiito wa arimasu ka?',
						translation: '¿De verdad? ¿Tiene el recibo?',
						correct: false,
						feedback_es: 'Pedir el recibo sin disculparse primero es grosero. En Japón, ante un cliente molesto, la disculpa sincera es siempre lo primero.'
					}
				],
				next_npc: {
					jp: 'そうですか。では、こちらの商品をお願いします。早急に対応してください。',
					romaji: 'Sou desu ka. Dewa, kochira no shouhin wo onegai shimasu. Soukyuu ni taiou shite kudasai.',
					translation: 'Ya veo. Entonces aquí tiene el producto. Por favor resuélvanlo lo antes posible.'
				}
			}
		]
	},

	{
		id: 'seguro',
		title_es: 'Contrato de seguro',
		title_en: 'Insurance Contract',
		level: 'N2',
		icon: '📄',
		context_es: 'Un agente te explica un contrato de seguro médico en Japón.',
		turns: [
			{
				type: 'npc',
				jp: 'こちらのプランは、入院1日につき1万円の給付金が支払われます。免責事項についてはご理解いただけましたでしょうか。',
				romaji: 'Kochira no puran wa, nyuuin ichinichi ni tsuki ichiman en no kyuufu-kin ga shiharawa remasu. Menseki jikouFour ni tsuite wa goрику itadakemashita deshou ka.',
				translation: 'Este plan paga 10,000 yenes por día de hospitalización. ¿Ha comprendido las cláusulas de exclusión?'
			},
			{
				type: 'choice',
				prompt_jp: '（免責事項について確認してください）',
				prompt_romaji: '(Menseki jikou ni tsuite kakunin shite kudasai)',
				prompt_translation: 'No entendiste del todo. Pide que te re-expliquen las exclusiones.',
				choices: [
					{
						jp: '恐れ入りますが、免責事項についてもう少し具体的にご説明いただけますでしょうか。特に、既往症の扱いが気になっております。',
						romaji: 'Osoreirimasu ga, menseki jikou ni tsuite mou sukoshi gutaiteki ni gosetsumei itadakemasu deshou ka. Toku ni, kiousei no atsukai ga ki ni natte orimasu.',
						translation: 'Disculpe, ¿podría explicarme las exclusiones con un poco más de detalle? Me preocupa especialmente el tratamiento de condiciones preexistentes.',
						correct: true,
						feedback_es: '"恐れ入りますが" (fórmula educada para interrumpir), "〜いただけますでしょうか" (keigo de petición máximo), "既往症" (condiciones preexistentes, vocab N2 médico).'
					},
					{
						jp: 'わかりました。サインします。',
						romaji: 'Wakarimashita. Sain shimasu.',
						translation: 'Entendido. Firmaré.',
						correct: false,
						feedback_es: 'Nunca firmes un contrato sin entender las exclusiones. En especial en seguros, las cláusulas de exclusión determinan si el seguro te cubre o no.'
					},
					{
						jp: '意味がわかりません。',
						romaji: 'Imi ga wakarimasen.',
						translation: 'No entiendo el significado.',
						correct: false,
						feedback_es: 'Demasiado directo y rudo. Usa "恐れ入りますが" para suavizar y especifica qué parte no entendiste, así el agente puede ayudarte mejor.'
					}
				],
				next_npc: {
					jp: 'もちろんです。既往症がある場合は、その疾患に関連した入院については給付対象外となります。ご了承ください。',
					romaji: 'Mochiron desu. Kiousei ga aru baai wa, sono shikkan ni kanren shita nyuuin ni tsuite wa kyuufu taishou-gai to narimasu. Goryoushou kudasai.',
					translation: 'Por supuesto. Si tiene condiciones preexistentes, las hospitalizaciones relacionadas con esa enfermedad quedan excluidas de la cobertura. Tenga en cuenta esto.'
				}
			}
		]
	},

	{
		id: 'mudanza',
		title_es: 'Empresa de mudanzas',
		title_en: 'Moving Company',
		level: 'N2',
		icon: '📦',
		context_es: 'Coordinas tu mudanza con una empresa de transporte.',
		turns: [
			{
				type: 'npc',
				jp: 'お引越しのご予定はいつ頃でしょうか。また、荷物の量はどのくらいになりますか。',
				romaji: 'Ohikkoshi no goyotei wa itsugoro deshou ka. Mata, nimotsu no ryou wa dono kurai ni narimasu ka.',
				translation: '¿Para cuándo tiene prevista la mudanza? ¿Y aproximadamente cuánto bulto tiene?'
			},
			{
				type: 'choice',
				prompt_jp: '（引越し情報を詳しく伝えてください）',
				prompt_romaji: '(Hikkoshi jouhou wo kuwashiku tsutaete kudasai)',
				prompt_translation: 'Da los detalles de tu mudanza de forma organizada.',
				choices: [
					{
						jp: '来月の15日を予定しております。1Kの部屋から2LDKへの引越しで、家電や大型家具も含め、2トントラック1台分ほどかと思います。',
						romaji: 'Raigetsu no juugo-nichi wo yotei shite orimasu. 1K no heya kara 2LDK e no hikkoshi de, kaden ya oogata kagu mo fukume, ni-ton torakku ittai-bun hodo ka to omoimasu.',
						translation: 'Tenemos previsto el día 15 del próximo mes. Es una mudanza de un 1K a un 2LDK, incluyendo electrodomésticos y muebles grandes — creo que cabrá en un camión de 2 toneladas.',
						correct: true,
						feedback_es: 'Info clara y completa: fecha, tipo de mudanza, estimación de volumen. "〜かと思います" (creo que es aproximadamente) — estimación cortés y útil.'
					},
					{
						jp: '来月引っ越したいです。荷物は普通くらいです。',
						romaji: 'Raigetsu hikkoshitai desu. Nimotsu wa futsuu kurai desu.',
						translation: 'Quiero mudarme el mes que viene. El equipaje es más o menos normal.',
						correct: false,
						feedback_es: 'Demasiado vago — "普通" (normal) no ayuda al presupuesto. Especifica fecha exacta, tamaño de vivienda, y tipo/cantidad de objetos grandes.'
					},
					{
						jp: 'まだ決めていません。',
						romaji: 'Mada kimete imasen.',
						translation: 'Todavía no he decidido.',
						correct: false,
						feedback_es: 'Sin información básica la empresa no puede darte presupuesto ni disponibilidad. Si aún no decides, no tiene sentido llamar todavía.'
					}
				],
				next_npc: {
					jp: 'かしこまりました。では現地確認と見積もりのため、ご都合のよい日程でお伺いできますでしょうか。',
					romaji: 'Kashikomarimashita. Dewa genchi kakunin to mitsumori no tame, goutsugo no yoi nittei de oukagai dekimasu deshou ka.',
					translation: 'Entendido. Entonces, ¿podríamos visitarle en una fecha conveniente para hacer la inspección y el presupuesto?'
				}
			}
		]
	},

	{
		id: 'reunion-escolar',
		title_es: 'Reunión de padres y maestros',
		title_en: 'Parent-Teacher Meeting',
		level: 'N2',
		icon: '🏫',
		context_es: 'Eres padre/madre en una reunión con el profesor de tu hijo en Japón.',
		turns: [
			{
				type: 'npc',
				jp: 'お子さんは授業中とても積極的なのですが、最近グループ活動での協調性に少し課題が見られます。',
				romaji: 'Okosan wa jugyouchuu totemo sekkyokuteki na no desu ga, saikin guruupu katsudou de no kyouchousei ni sukoshi kadai ga miraremasu.',
				translation: 'Su hijo/a es muy participativo en clase, pero últimamente se observan algunos desafíos en la cooperación durante actividades grupales.'
			},
			{
				type: 'choice',
				prompt_jp: '（適切に状況を確認し、家庭での対応を伝えてください）',
				prompt_romaji: '(Tekisetsu ni joukyou wo kakunin shi, katei de no taiou wo tsutaete kudasai)',
				prompt_translation: 'Confirma la situación y expresa cómo lo tratarás en casa.',
				choices: [
					{
						jp: 'ご指摘ありがとうございます。具体的にどのような場面でそのような行動が見られますか。家庭でも話し合って、意識するよう伝えたいと思います。',
						romaji: 'Goshiteki arigatou gozaimasu. Gutaiteki ni dono you na bamen de sono you na koudou ga miraremasu ka. Katei demo hanashiatte, ishiki suru you tsutaetai to omoimasu.',
						translation: 'Gracias por señalarlo. ¿En qué tipo de situaciones concretas se da este comportamiento? También hablaremos en casa y le diré que sea más consciente de ello.',
						correct: true,
						feedback_es: '"ご指摘ありがとうございます" (gracias por señalarlo, clave en Japón — aceptas sin defenderse), pedir ejemplos concretos muestra interés real, y comprometerse en casa es la respuesta esperada.'
					},
					{
						jp: '家では全然そんなことないですよ。先生が何か誤解しているのでは？',
						romaji: 'Ie de wa zenzen sonna koto nai desu yo. Sensei ga nanika gokai shite iru no de wa?',
						translation: 'En casa no hace eso para nada. ¿Quizás el profesor lo está malinterpretando?',
						correct: false,
						feedback_es: 'Cuestionar al profesor directamente es culturalmente inapropiado en Japón. Los padres suelen agradecer la observación y trabajar con el maestro, no confrontarlo.'
					},
					{
						jp: 'わかりました。気をつけさせます。',
						romaji: 'Wakarimashita. Ki wo tsukesasemasu.',
						translation: 'Entendido. Haré que tenga cuidado.',
						correct: false,
						feedback_es: 'Muy pasivo. Antes de comprometerte a actuar, pide detalles concretos — necesitas saber qué situaciones exactas ocurren para ayudar efectivamente a tu hijo.'
					}
				],
				next_npc: {
					jp: 'ありがとうございます。ご家庭でもご協力いただけますと、大変心強いです。引き続き学校でもサポートしてまいります。',
					romaji: 'Arigatou gozaimasu. Gokatei demo gokyouryoku itadakemasu to, taihen kokorozuyoi desu. Hikitsuzuki gakkou demo sapooto shite mairimasu.',
					translation: 'Muchas gracias. Contar con su apoyo en casa nos da mucha seguridad. Seguiremos apoyándolo también desde la escuela.'
				}
			}
		]
	},

	{
		id: 'medico-detallado',
		title_es: 'Consulta médica detallada',
		title_en: 'Detailed Medical Consultation',
		level: 'N2',
		icon: '🏥',
		context_es: 'Estás en una consulta médica explicando síntomas complejos.',
		turns: [
			{
				type: 'npc',
				jp: '今日はどのような症状でいらっしゃいましたか。いつ頃から、どのような経緯で症状が出始めたか教えていただけますか。',
				romaji: 'Kyou wa dono you na shoujou de irasshaimashita ka. Itsugoro kara, dono you na keii de shoujou ga dehajimeta ka oshiete itadakemasu ka.',
				translation: '¿Con qué síntomas viene hoy? ¿Podría contarme desde cuándo y cómo comenzaron?'
			},
			{
				type: 'choice',
				prompt_jp: '（症状を詳しく説明してください）',
				prompt_romaji: '(Shoujou wo kuwashiku setsumei shite kudasai)',
				prompt_translation: 'Describe tus síntomas con detalle médico apropiado.',
				choices: [
					{
						jp: '約2週間前から右側の腰に鈍い痛みがあります。特に長時間座った後や朝起きた際に悪化する傾向があり、市販の痛み止めを服用しても改善されておりません。',
						romaji: 'Yaku nishuu-kan mae kara migi-gawa no koshi ni nibui itami ga arimasu. Toku ni chouji-kan suwatta ato ya asa okita sai ni akka suru katachi ga ari, shihan no itamidome wo fukuyou shite mo kaizen sarete orimasen.',
						translation: 'Desde hace aproximadamente 2 semanas tengo un dolor sordo en el lado derecho de la cintura. Tiende a empeorar especialmente después de sentarme mucho tiempo o al despertar, y no ha mejorado tomando analgésicos de venta libre.',
						correct: true,
						feedback_es: 'Descripción clínica excelente N2: duración exacta, ubicación, tipo de dolor ("鈍い"), factores agravantes, medicación previa. El médico puede diagnosticar con esto.'
					},
					{
						jp: '腰が痛いです。',
						romaji: 'Koshi ga itai desu.',
						translation: 'Me duele la cintura.',
						correct: false,
						feedback_es: 'Demasiado vago para N2. Siempre incluye: desde cuándo, con qué intensidad, qué lo agrava, qué trataste. La precisión facilita el diagnóstico.'
					},
					{
						jp: 'なんか体が変な感じがします。',
						romaji: 'Nanka karada ga hen na kanji ga shimasu.',
						translation: 'Siento que el cuerpo se siente un poco raro.',
						correct: false,
						feedback_es: '"なんか" y "変な感じ" son demasiado vagos e informales para una consulta médica. Identifica y localiza el síntoma con vocabulario preciso.'
					}
				],
				next_npc: {
					jp: 'ご説明ありがとうございます。では触診しますので、少し横になっていただけますか。レントゲンも撮りましょう。',
					romaji: 'Gosetsumei arigatou gozaimasu. Dewa shokusin shimasu no de, sukoshi yoko ni natte itadakemasu ka. Rentogen mo torimaSHOU.',
					translation: 'Gracias por la explicación. Voy a palpar la zona, ¿podría acostarse un momento? También haremos una radiografía.'
				}
			}
		]
	},

	// ─── N1 ──────────────────────────────────────────────────────────────────────

	{
		id: 'negociacion',
		title_es: 'Negociación empresarial',
		title_en: 'Business Negotiation',
		level: 'N1',
		icon: '🤝',
		context_es: 'Estás negociando términos de contrato con un socio empresarial japonés.',
		turns: [
			{
				type: 'npc',
				jp: '提示いただいた条件ですが、納期については承りかねる部分がございまして。弊社の生産キャパシティを鑑みますと、3ヶ月の猶予をいただきたいところでございます。',
				romaji: 'Teiji itadaita jouken desu ga, nouki ni tsuite wa ukетаmawari kane ru bubun ga gozaimashite. Heisha no seisan kyapashiti wo kangamimasu to, san-kagetsu no yuuyo wo itadakitai tokoro de gozaimasu.',
				translation: 'Respecto a las condiciones propuestas, hay aspectos del plazo de entrega que nos resulta difícil aceptar. Considerando la capacidad de producción de nuestra empresa, nos gustaría obtener un margen de 3 meses.'
			},
			{
				type: 'choice',
				prompt_jp: '（交渉を進めてください）',
				prompt_romaji: '(Koushou wo susumete kudasai)',
				prompt_translation: 'Responde estratégicamente — necesitas el plazo original pero quieres mantener la relación.',
				choices: [
					{
						jp: 'おっしゃる事情はよく理解できます。ただ、弊社といたしましても、この納期は取引先との約束に直結しており、いかんとも動かしがたい状況にございます。何か他の点で弊社がご支援できることがあれば、ぜひご提案いただけますでしょうか。',
						romaji: 'Ossharu jijou wa yoku rikai dekimasu. Tada, heisha to itashimashite mo, kono nouki wa torihikisaki to no yakusoku ni chokketsu shite ori, ikan tomo ugokashigatai joukyou ni gozaimasu. Nanika hoka no ten de heisha ga gosien dekiru koto ga areba, zehi goていан itadakemasu deshou ka.',
						translation: 'Entiendo perfectamente su situación. Sin embargo, para nosotros este plazo está directamente vinculado a compromisos con otros socios, y es una condición que difícilmente podemos mover. Si hay algo más en lo que podamos apoyarles, me gustaría que nos lo propusieran.',
						correct: true,
						feedback_es: '"いかんとも動かしがたい" (no hay manera de moverlo, expresión N1 idiomática), empatía primero → justificación → oferta alternativa. Estrategia negociadora japonesa perfecta: nunca "no" directo, sino redirección.'
					},
					{
						jp: 'それは困ります。3ヶ月は無理です。',
						romaji: 'Sore wa komarimasu. San-kagetsu wa muri desu.',
						translation: 'Eso es un problema. 3 meses es imposible.',
						correct: false,
						feedback_es: 'Respuesta directa y confrontacional — culturalmente inapropiada en negociación japonesa. Nunca rechaces sin reconocer la posición de la otra parte primero.'
					},
					{
						jp: 'わかりました。では3ヶ月でもいいですよ。',
						romaji: 'Wakarimashita. Dewa san-kagetsu demo ii desu yo.',
						translation: 'Entendido. Entonces 3 meses también está bien.',
						correct: false,
						feedback_es: 'Rendirse sin explorar opciones intermedias muestra falta de preparación negociadora. En N1 debes mantener posición mientras muestras flexibilidad táctica.'
					}
				],
				next_npc: {
					jp: 'なるほど。では、中間納品という形で対応させていただくことはできますでしょうか。全量の50%を当初の納期で、残りを3週間後にお届けするという形はいかがでしょう。',
					romaji: 'Naruhodo. Dewa, chuukan nouhin to iu katachi de taiou sasete itadaku koto wa dekimasu deshou ka. Zenryou no 50% wo tousho no nouki de, nokori wo sanshuu-kan go ni otodoke suru to iu katachi wa ikaga deshou.',
					translation: 'Ya veo. Entonces, ¿podríamos plantear una entrega parcial? El 50% en el plazo original y el resto 3 semanas después. ¿Qué le parece?'
				}
			},
			{
				type: 'npc',
				jp: 'この件に関しては、双方が満足できる着地点を見つけることが肝要かと存じます。',
				romaji: 'Kono ken ni kanshite wa, souhou ga manzoku dekiru chakuchiten wo mitsukeru koto ga kan-you ka to zonjimasu.',
				translation: 'En cuanto a este asunto, creo que lo fundamental es encontrar un punto de aterrizaje con el que ambas partes queden satisfechas.'
			},
			{
				type: 'choice',
				prompt_jp: '（妥協点を提案してください）',
				prompt_romaji: '(Dakyouten wo teian shite kudasai)',
				prompt_translation: 'Propone un compromiso concreto que demuestre flexibilidad estratégica.',
				choices: [
					{
						jp: 'ご提案の分割納品は大変現実的だと思います。ただ、残り50%につきましては、2週間でご対応いただけますでしょうか。それであれば、弊社としても検討の余地があります。',
						romaji: 'Goていан no bunkatsu nouhin wa taihen genjitsuteki da to omoimasu. Tada, nokori 50% ni tsukimashite wa, nishuu-kan de gotaiou itadakemasu deshou ka. Sore de areba, heisha to shite mo kentou no yochi ga arimasu.',
						translation: 'La entrega parcial que propone nos parece muy realista. Sin embargo, ¿podría gestionar el 50% restante en 2 semanas? Si es así, tenemos margen para considerarlo.',
						correct: true,
						feedback_es: '"〜につきましては" (en cuanto a, formal N1), "検討の余地があります" (tenemos margen para considerar — aceptación condicional elegante). Counter-offer N1 magistral.'
					},
					{
						jp: 'わかりました。そのプランで合意します。',
						romaji: 'Wakarimashita. Sono puran de gouи shimasu.',
						translation: 'Entendido. Acepto ese plan.',
						correct: false,
						feedback_es: 'Aceptar la primera oferta sin negociar muestra falta de experiencia. En N1, siempre haz un counter-offer moderado antes de cerrar — es lo esperado en negociaciones japonesas.'
					},
					{
						jp: 'それだと困ります。もう一度考えてください。',
						romaji: 'Sore dato komarimasu. Mou ichido kangaete kudasai.',
						translation: 'Con eso tengo un problema. Piénselo una vez más.',
						correct: false,
						feedback_es: 'Vago e impaciente. En N1 debes ser específico: ¿qué condición exacta no funciona? ¿Cuál sería tu contraoferta? Rechazar sin propuesta alternativa rompe la negociación.'
					}
				],
				next_npc: {
					jp: '2週間ですか……承知いたしました。その方向で社内調整を図ります。本日は率直なご意見をいただき、感謝申し上げます。',
					romaji: '2-shuu-kan desu ka... Shouchi itashimashita. Sono houkou de shanai chousei wo hakariмас。Honjitsu wa sotchoku na goiken wo itadaki, kansha moushiagemasu.',
					translation: '2 semanas… Entendido. Coordinaremos internamente en esa dirección. Hoy le agradecemos su opinión directa y sincera.'
				}
			}
		]
	},

	{
		id: 'entrevista-ejecutivo',
		title_es: 'Entrevista para ejecutivo',
		title_en: 'Executive-Level Interview',
		level: 'N1',
		icon: '🏢',
		context_es: 'Estás siendo entrevistado para un puesto directivo de alto nivel.',
		turns: [
			{
				type: 'npc',
				jp: '管理職として、部下のモチベーション管理においてどのようなアプローチをお取りになってきましたか。具体的な事例とともにお聞かせいただけますでしょうか。',
				romaji: 'Kanrishoku to shite, buka no mochibeeshon kanri ni oite dono you na apuroochi wo otorininarимашita ka. Gutaiteki na jirei to tomo ni okikase itadakemasu deshou ka.',
				translation: 'Como directivo, ¿qué enfoque ha tomado en la gestión de la motivación de sus subordinados? ¿Podría compartirlo con ejemplos concretos?'
			},
			{
				type: 'choice',
				prompt_jp: '（マネジメント経験を具体的に述べてください）',
				prompt_romaji: '(Manejimento keiken wo gutaiteki ni nobete kudasai)',
				prompt_translation: 'Responde con liderazgo concreto y visión gerencial.',
				choices: [
					{
						jp: '私が最も重視してきたのは、各メンバーの強みを見極め、それを最大限に活かせる環境を整えることです。前職では、定期的な1on1ミーティングを通じて個々の目標と課題を把握し、チーム全体の生産性を前年比20%向上させることができました。',
						romaji: 'Watashi ga mottomo juushi shite kita no wa, kaku menbaa no tsuyomi wo mikiwame, sore wo saidaigen ni ikaseru kankyou wo totonoeru koto desu. ZenShoku de wa, teikiteki na 1on1 miitingu wo tsuujite koko no mokuhyou to kadai wo haaku shi, chiimu zentai no seisansei wo zennen-hi 20% koujou saseru koto ga dekimashita.',
						translation: 'Lo que más he priorizado es identificar los puntos fuertes de cada miembro y crear un entorno que los aproveche al máximo. En mi trabajo anterior, mediante reuniones individuales periódicas, pude captar los objetivos y desafíos de cada persona, logrando mejorar la productividad del equipo en un 20% respecto al año anterior.',
						correct: true,
						feedback_es: 'Estructura STAR perfecta: filosofía → acción concreta → resultado medible. "見極める" (discernir con precisión), "最大限に活かす" (aprovechar al máximo) — vocabulario gerencial N1.'
					},
					{
						jp: 'みんなと仲良くして、楽しい職場を作るようにしています。',
						romaji: 'Minna to nakayoku shite, tanoshii shokuba wo tsukuru you ni shite imasu.',
						translation: 'Intento llevarme bien con todos y crear un ambiente de trabajo divertido.',
						correct: false,
						feedback_es: 'Respuesta informal y superficial. No tiene datos, metodología ni resultados. Para puesto directivo en Japón, la respuesta debe mostrar sistemas, métricas y resultados concretos.'
					},
					{
						jp: '部下の管理は難しいですが、できる限り頑張っています。',
						romaji: 'Buka no kanri wa muzukashii desu ga, dekiru kagiri ganbatte imasu.',
						translation: 'Gestionar a los subordinados es difícil, pero hago todo lo que puedo.',
						correct: false,
						feedback_es: 'Muestra inseguridad y falta de metodología. "頑張る" (hacer lo posible) no basta para un ejecutivo — necesitas describir sistemas y resultados, no intención.'
					}
				],
				next_npc: {
					jp: 'なるほど、数値的な成果まで示していただき、ありがとうございます。最後に、弊社の経営理念についてどのようにお考えでしょうか。',
					romaji: 'Naruhodo, suuchiteki na seika made shimeshite itadaki, arigatou gozaimasu. Saigo ni, heisha no keiei rinen ni tsuite dono you ni okangae deshou ka.',
					translation: 'Ya veo, gracias por mostrar incluso los resultados numéricos. Por último, ¿qué opina usted sobre la filosofía empresarial de nuestra compañía?'
				}
			}
		]
	},

	{
		id: 'qa-academico',
		title_es: 'Presentación académica — Q&A',
		title_en: 'Academic Presentation Q&A',
		level: 'N1',
		icon: '🎓',
		context_es: 'Acabas de dar una presentación académica y respondes preguntas del público.',
		turns: [
			{
				type: 'npc',
				jp: '発表の中で提唱された仮説についてですが、サンプルサイズが限られている点において、研究結果の一般化可能性に疑問を呈せざるを得ません。この点についていかがお考えでしょうか。',
				romaji: 'Happyou no naka de teishou sareta kasetsu ni tsuite desu ga, sanpuru saizu ga kagirarete iru ten ni oite, kenkyuu kekka no ippanka kanousei ni gimon wo teise zaru wo emasen. Kono ten ni tsuite ikaga okangae deshou ka.',
				translation: 'Respecto a la hipótesis propuesta en su presentación, no puedo dejar de cuestionar la generalizabilidad de los resultados dado el tamaño limitado de la muestra. ¿Qué opina al respecto?'
			},
			{
				type: 'choice',
				prompt_jp: '（学術的な批判に対して応答してください）',
				prompt_romaji: '(Gakujutsuteki na hihan ni taishite outou shite kudasai)',
				prompt_translation: 'Responde académicamente a la crítica metodológica.',
				choices: [
					{
						jp: 'ご指摘はもっともです。サンプルサイズの制約は本研究における限界の一つとして認識しております。ただ、本研究の主眼はあくまでも探索的な知見の獲得にあり、今後の大規模研究の仮説生成に寄与することを目的としております。ご批判を踏まえ、次段階の研究ではサンプルの多様性と規模の拡大を図る予定でございます。',
						romaji: 'Goshiteki wa mottomo desu. Sanpuru saizu no seiyaku wa hon-kenkyuu ni okeru genkai no hitotsu to shite ninshiki shite orimasu. Tada, hon-kenkyuu no shungan wa aku made mo tansaku-teki na chiken no kakutoku ni ari, kongo no daiki-bou kenkyuu no kasetsu seisei ni kiyo suru koto wo mokuteki to shite orimasu. Gohihan woふまえ, tsugi-dankai no kenkyuu de wa sanpuru no tayousei to kibo no kakudai wo hakaru yotei de gozaimasu.',
						translation: 'Su observación es completamente válida. Reconozco la limitación del tamaño muestral como una de las restricciones de esta investigación. Sin embargo, el objetivo principal era obtener hallazgos exploratorios para contribuir a la generación de hipótesis en investigaciones a mayor escala. Teniendo en cuenta su crítica, en la siguiente fase preveo ampliar la diversidad y el tamaño de la muestra.',
						correct: true,
						feedback_es: '"ご指摘はもっともです" (su observación es válida — aceptar la crítica en Japón es muestra de madurez intelectual), "あくまでも" (precisamente, enfatiza), "〜を踏まえ" (teniendo en cuenta) — respuesta académica N1 modelo.'
					},
					{
						jp: 'サンプルサイズの問題は承知しています。でも、結果は正しいと思います。',
						romaji: 'Sanpuru saizu no mondai wa shouchi shite imasu. Demo, kekka wa tadashii to omoimasu.',
						translation: 'Soy consciente del problema del tamaño muestral. Pero creo que los resultados son correctos.',
						correct: false,
						feedback_es: '"でも" es demasiado informal en contexto académico. Sin argumentación metodológica la respuesta parece defensiva e insegura. Desarrolla por qué los resultados siguen siendo válidos dentro de su alcance.'
					},
					{
						jp: 'それは今後の課題です。',
						romaji: 'Sore wa kongo no kadai desu.',
						translation: 'Eso es un tema para trabajo futuro.',
						correct: false,
						feedback_es: 'Evasivo e insuficiente. Reconocer la limitación sin defenderla muestra falta de rigor. Necesitas justificar el valor del trabajo actual y proponer el camino a seguir.'
					}
				],
				next_npc: {
					jp: 'ご説明ありがとうございます。探索的研究としての位置づけを明確にされたことで、研究の意義がより明確になりました。引き続きご研究を期待しております。',
					romaji: 'Gosetsumei arigatou gozaimasu. Tansaku-teki kenkyuu to shite no ichizuke wo meikaku ni sareta koto de, kenkyuu no igi ga yori meikaku ni narimashita. Hikitsuzuki gokenkyuu wo kitai shite orimasu.',
					translation: 'Gracias por la explicación. Al aclarar su posicionamiento como investigación exploratoria, el significado del trabajo ha quedado más claro. Esperamos que continúe con su investigación.'
				}
			}
		]
	},

	{
		id: 'asesoria-legal',
		title_es: 'Consulta legal',
		title_en: 'Legal Consultation',
		level: 'N1',
		icon: '⚖️',
		context_es: 'Consultas a un abogado sobre un contrato laboral con cláusulas dudosas.',
		turns: [
			{
				type: 'npc',
				jp: '拝見しましたところ、第7条の競業避止義務の条項ですが、退職後3年間・全国範囲という規定は、判例上その合理性が争われる可能性がございます。',
				romaji: 'Haiken shimashita tokoro, dai-nana-jou no kyougyou hishi gimu no joukou desu ga, taishoku-go san-nen-kan・zenkoku-han\'i to iu kitei wa, hanreijou sono gourisei ga arasowareru kanou-sei ga gozaimasu.',
				translation: 'Tras revisarlo, el artículo 7 sobre obligación de no competencia — la cláusula de 3 años post-renuncia a nivel nacional podría ser impugnada por su razonabilidad según la jurisprudencia.'
			},
			{
				type: 'choice',
				prompt_jp: '（法的状況を確認し、対応策を聞いてください）',
				prompt_romaji: '(Houteki joukyou wo kakunin shi, taisaku wo kiite kudasai)',
				prompt_translation: 'Confirma la situación legal y pregunta sobre tus opciones.',
				choices: [
					{
						jp: 'つまり、この条項は場合によっては無効と判断される可能性があるということでしょうか。もし会社がこの条項を根拠に法的措置を取ってきた場合、どのような対抗手段が考えられますか。',
						romaji: 'Tsumari, kono joukou wa baai ni yotte wa mukou to handan sareru kanou-sei ga aru to iu koto deshou ka. Moshi kaisha ga kono joukou wo konkyo ni houteki sochi wo totte kita baai, dono you na taikou shudan ga kangaeraremasu ka.',
						translation: 'O sea, ¿existe la posibilidad de que esta cláusula sea declarada inválida según las circunstancias? Si la empresa tomara medidas legales basándose en esta cláusula, ¿qué opciones de defensa habría?',
						correct: true,
						feedback_es: '"つまり〜ということでしょうか" (confirmar comprensión elegante), "〜を根拠に" (basándose en, vocabulario legal N1), "対抗手段" (medidas defensivas) — consulta legal precisa y estratégica.'
					},
					{
						jp: 'では、この条項は無視してもいいですか？',
						romaji: 'Dewa, kono joukou wa mushi shite mo ii desu ka?',
						translation: '¿Entonces puedo ignorar esta cláusula?',
						correct: false,
						feedback_es: 'Demasiado simplista — "ignorar" una cláusula contractual tiene consecuencias legales. Pregunta por el proceso legal correcto: impugnar, negociar una modificación, o gestionar el riesgo.'
					},
					{
						jp: 'サインしなければよかった。どうすればいいですか。',
						romaji: 'Sain shinakereba yokatta. Dou sureba ii desu ka?',
						translation: 'Debí no haber firmado. ¿Qué hago?',
						correct: false,
						feedback_es: 'Lamentarse sin utilidad en una consulta legal. El abogado ya revisó el contrato — pide opciones concretas hacia adelante, no retrospectar sobre lo que no se puede cambiar.'
					}
				],
				next_npc: {
					jp: '判例においては、地理的範囲・期間・補償の有無などを総合的に考慮した上で有効性を判断する傾向にあります。本件の場合、交渉による条項修正が最も現実的な解決策と考えられます。',
					romaji: 'Hanrei ni oite wa, chiri-teki han\'i・kikan・hoshо no umu nado wo sougouteki ni kouryo shita ue de yukousei wo handan suru katachi ni arimasu. Honken no baai, koushou ni yoru joukou shuusei ga mottomo genjitsuteki na kaiketsu-saku to kangaeraremasu.',
					translation: 'En jurisprudencia, la validez se determina considerando integralmente el alcance geográfico, la duración y si hay compensación. En este caso, la modificación de la cláusula mediante negociación se considera la solución más realista.'
				}
			}
		]
	},

	{
		id: 'debate-medioambiental',
		title_es: 'Debate medioambiental',
		title_en: 'Environmental Debate',
		level: 'N1',
		icon: '🌿',
		context_es: 'Participas en un panel de discusión sobre política medioambiental.',
		turns: [
			{
				type: 'npc',
				jp: '経済成長と環境保護は二律背反であるという議論がありますが、この点についてはどのようにお考えでしょうか。',
				romaji: 'Keizai seichou to kankyou hogo wa niritsu haihan de aru to iu giron ga arimasu ga, kono ten ni tsuite wa dono you ni okangae deshou ka.',
				translation: 'Existe el argumento de que el crecimiento económico y la protección medioambiental son antitéticos. ¿Cuál es su postura al respecto?'
			},
			{
				type: 'choice',
				prompt_jp: '（この二項対立を論理的に乗り越えてください）',
				prompt_romaji: '(Kono nikou tairitsu wo ronriteki ni norikoete kudasai)',
				prompt_translation: 'Desafía la premisa del debate con argumentación sofisticada.',
				choices: [
					{
						jp: 'この二律背反という前提自体を再考する必要があるかと思います。再生可能エネルギー産業の成長や循環型経済モデルが示すように、環境への投資は中長期的には経済的優位性をもたらし得ます。問題は短期的なコストに目を奪われ、長期的な機会損失を看過していることではないでしょうか。',
						romaji: 'Kono niritsu haihan to iu zentei jitai wo saikou suru hitsuyou ga aru ka to omoimasu. Saisei kanou enerugii sangyou no seichou ya junkan-gata keizai moderu ga shimesu you ni, kankyou e no toushi wa chuu-chouki-teki ni wa keizai-teki yuuisei wo motarashi eru to omoimasu. Mondai wa tankiteki na kosuto ni me wo ubawarete, chouki-teki na kikai sonshitsu wo kankaigo shite iru koto dewa nai deshou ka.',
						translation: 'Creo que es necesario reconsiderar la propia premisa de esta antítesis. Como demuestra el crecimiento de la industria de energías renovables y los modelos de economía circular, la inversión medioambiental puede generar ventajas económicas a medio y largo plazo. ¿No es acaso el problema que nos centramos en costos a corto plazo ignorando las oportunidades perdidas a largo plazo?',
						correct: true,
						feedback_es: '"二律背反という前提自体を再考" (reconsiderar la premisa misma — movimiento retórico N1 clave), "〜が示すように" (como demuestra), "機会損失を看過" (ignorar oportunidades perdidas) — argumentación académica N1 sofisticada.'
					},
					{
						jp: '環境も経済も大切だと思います。バランスが重要です。',
						romaji: 'Kankyou mo keizai mo taisetsu da to omoimasu. Baransu ga juuyou desu.',
						translation: 'Creo que tanto el medioambiente como la economía son importantes. El equilibrio es clave.',
						correct: false,
						feedback_es: 'Respuesta trivial sin profundidad. "Equilibrio" sin contenido concreto no aporta nada al debate. En N1 debes desafiar la premisa o proponer marcos teóricos específicos.'
					},
					{
						jp: '経済成長の方が大事だと思います。環境はあとで考えればいい。',
						romaji: 'Keizai seichou no hou ga taisetsu da to omoimasu. Kankyou wa ato de kangaereba ii.',
						translation: 'Creo que el crecimiento económico es más importante. El medioambiente se puede considerar después.',
						correct: false,
						feedback_es: 'Postura simplista que ignora la evidencia científica. En un panel N1, toda posición necesita respaldo argumental sólido — afirmar prioridad sin justificación te invalida.'
					}
				],
				next_npc: {
					jp: 'なるほど、前提の問い直しというアプローチは興味深いですね。ただ、移行コストの問題は依然として実態経済において無視できない課題ではないでしょうか。',
					romaji: 'Naruhodo, zentei no toiSite naoshi to iu apuroochi wa kyoumi-bukai desu ne. Tada, ikkou kosuto no mondai wa izen to shite jittai keizai ni oite mushi dekinai kadai dewa nai deshou ka.',
					translation: 'Interesante el enfoque de cuestionar la premisa. Sin embargo, ¿no sigue siendo el costo de transición un desafío ineludible en la economía real?'
				}
			}
		]
	},

	{
		id: 'coordinacion-interna',
		title_es: 'Coordinación interna en empresa',
		title_en: 'Internal Corporate Coordination',
		level: 'N1',
		icon: '🗂️',
		context_es: 'Necesitas conseguir que otro departamento coopere en un proyecto urgente.',
		turns: [
			{
				type: 'npc',
				jp: '先ほどのご依頼の件ですが、現時点では当部署としてもリソースが逼迫しており、即座にご対応するのは難しい状況にございます。',
				romaji: 'Sakihodo no goirai no ken desu ga, genjiten de wa toubu-sho to shite mo risoosu ga hippaku shite ori, sokuza ni gotaiou suru no wa muzukashii joukyou ni gozaimasu.',
				translation: 'Respecto a la solicitud de antes, en este momento nuestro departamento también tiene los recursos muy ajustados y nos resulta difícil atenderles de inmediato.'
			},
			{
				type: 'choice',
				prompt_jp: '（協力を引き出す対応をしてください）',
				prompt_romaji: '(Kyouryoku wo hikidasu taiou wo shite kudasai)',
				prompt_translation: 'Consigue cooperación sin confrontar — usa la lógica interna de la empresa japonesa.',
				choices: [
					{
						jp: 'ご多忙のところ誠に恐れ入ります。本件は来週の役員会議で取り上げられる予定の案件でございまして、その資料として不可欠なものとなっております。もし可能でしたら、御部署のどなたかに2〜3時間程度、ご協力いただけないでしょうか。',
						romaji: 'Gobibou no tokoro makoto ni osoreirimasu. Honken wa raishuu no yakuin kaigi de toriagewarareru yotei no anken de gozaimashite, sono shiryou to shite fukaketsu na mono to natte orimasu. Moshi kanou deshitara, goBUSHO no donata ka ni ni〜san-jikan teido, gokyouryoku itadakemasen deshou ka.',
						translation: 'Lamentamos molestarte en tan ocupado momento. Este asunto está previsto para la reunión de directivos de la próxima semana y los materiales son indispensables. Si es posible, ¿podría alguien de su departamento colaborar por unas 2-3 horas?',
						correct: true,
						feedback_es: '"ご多忙のところ恐れ入ります" (fórmula de disculpa por molestar cuando alguien está ocupado), mencionar "役員会議" (reunión de directivos) eleva la urgencia sin presionar, solicitud específica (2-3 horas) — diplomacia corporativa N1.'
					},
					{
						jp: 'それは困ります。上司に相談して、なんとかしてください。',
						romaji: 'Sore wa komarimasu. Joushi ni soudan shite, nantoka shite kudasai.',
						translation: 'Eso es un problema. Consulten con su jefe y arréglenselas de alguna manera.',
						correct: false,
						feedback_es: 'Delegar la responsabilidad de resolver al otro departamento es imprudente. Escala la tensión sin proponer solución concreta. En Japón, "なんとかしてください" suena brusco.'
					},
					{
						jp: 'わかりました。また改めて連絡します。',
						romaji: 'Wakarimashita. Mata あらためて renraku shimasu.',
						translation: 'Entendido. Me pondré en contacto de nuevo.',
						correct: false,
						feedback_es: 'Rendirse sin explorar opciones muestra falta de ingenio. Antes de retirarte, intenta encontrar una solución mínima — pregunta si hay alguien disponible aunque sea parcialmente.'
					}
				],
				next_npc: {
					jp: '役員会議の件であれば、話は別です。山田に声をかけてみますので、明日の午前中にでもご連絡いただけますか。',
					romaji: 'Yakuin kaigi no ken de areba, hanashi wa betsu desu. Yamada ni koe wo kakete mimasu no de, ashita no gozen-chuu ni demo gorenraku itadakemasu ka.',
					translation: 'Si es para la reunión de directivos, la historia es diferente. Le hablaré a Yamada, ¿podría contactarnos mañana por la mañana?'
				}
			}
		]
	},

	{
		id: 'contrato-inmobiliario',
		title_es: 'Contrato de bienes raíces',
		title_en: 'Real Estate Contract Review',
		level: 'N1',
		icon: '📜',
		context_es: 'Revisas con un agente un contrato de compraventa de propiedad.',
		turns: [
			{
				type: 'npc',
				jp: '第14条の契約解除条項ですが、売主側の事情による解除の場合は手付金の倍返し、買主側の場合は手付金没収という取り決めになっております。',
				romaji: 'Dai-juuyon-jou no keiyaku kaijo joukou desu ga, urinushi-gawa no jijou ni yoru kaijo no baai wa tetsuke-kin no baigaeshi, kainushi-gawa no baai wa tetsuke-kin bosshu to iu torikime ni natte orimasu.',
				translation: 'Respecto al artículo 14 sobre resolución del contrato: si el vendedor rescinde, devuelve el doble del depósito; si es el comprador, el depósito es confiscado.'
			},
			{
				type: 'choice',
				prompt_jp: '（不測の事態への対応を確認してください）',
				prompt_romaji: '(Fusoku no jitai e no taiou wo kakunin shite kudasai)',
				prompt_translation: 'Pregunta sobre situaciones imprevistas que podrían afectar la compra.',
				choices: [
					{
						jp: '例えば、住宅ローンの審査が通らなかった場合はどうなりますか。ローン特約の条項が含まれているかどうか、また、物件に重大な瑕疵が後から発覚した際の対応についても確認させていただけますでしょうか。',
						romaji: 'Tatoeba, juutaku roon no shinsa ga tooranakatta baai wa dou narimasu ka. Roon tokuyaku no joukou ga fukumarete iru ka dou ka, mata, bukken ni juudai na kashi ga ato kara hakKAKU shita sai no taiou ni tsuite mo kakunin sasete itadakemasu deshou ka.',
						translation: '¿Qué ocurriría, por ejemplo, si no me aprueban la hipoteca? ¿Hay alguna cláusula especial de préstamo incluida? Y también me gustaría confirmar qué ocurre si se descubren defectos graves en la propiedad después.',
						correct: true,
						feedback_es: '"ローン特約" (cláusula especial de hipoteca — vocab inmobiliario N1), "瑕疵" (defectos/vicios ocultos, término legal preciso), anticipar escenarios adversos muestra diligencia debida — exactamente lo que se espera en N1.'
					},
					{
						jp: 'わかりました。問題ないと思います。',
						romaji: 'Wakarimashita. Mondai nai to omoimasu.',
						translation: 'Entendido. Creo que no hay problema.',
						correct: false,
						feedback_es: 'Aceptar un contrato de compraventa sin verificar cláusulas de contingencia es negligente. Siempre pregunta por escenarios de ローン否決 y 瑕疵担保責任 antes de firmar.'
					},
					{
						jp: '難しくてよくわかりません。どうすればいいですか。',
						romaji: 'Muzukashikute yoku wakarimasen. Dou sureba ii desu ka.',
						translation: 'Es complicado y no entiendo bien. ¿Qué debo hacer?',
						correct: false,
						feedback_es: 'Vago e insuficiente para N1. Aunque no entiendas todo, debes preguntar sobre riesgos concretos y conocidos. "¿Qué hago?" sin más es demasiado pasivo para un contrato tan importante.'
					}
				],
				next_npc: {
					jp: 'ご賢明なご確認ですね。ローン特約は第12条に明記されており、審査不承認の場合は手付金を全額返還いたします。瑕疵担保責任については売主が2年間負うこととなっております。',
					romaji: 'Gokenmeina gokakunin desu ne. Roon tokuyaku wa dai-juuni-jou ni meiki sarete ori, shinsa fushounin no baai wa tetsuke-kin wo zengaku henkan itashimasu. Kashi tanpo sekinin ni tsuite wa urinushi ga ninen-kan ou koto to natte orimasu.',
					translation: 'Muy prudente de su parte confirmarlo. La cláusula de hipoteca está especificada en el artículo 12; si no se aprueba el préstamo, se devuelve el depósito íntegramente. La garantía por vicios ocultos será responsabilidad del vendedor por 2 años.'
				}
			}
		]
	},

	{
		id: 'etica-medica',
		title_es: 'Dilema ético médico',
		title_en: 'Medical Ethics Dilemma',
		level: 'N1',
		icon: '🩺',
		context_es: 'Eres médico y discutes un caso ético complicado con un colega.',
		turns: [
			{
				type: 'npc',
				jp: '患者さんが治療を拒否されているのですが、このまま放置すれば生命に関わる状態です。自己決定権と医師としての救命義務、どちらを優先すべきかについて、ご意見をお聞かせいただけますか。',
				romaji: 'Kanja-san ga chiryou wo kyohi sarete iru no desu ga, kono mama houchi sureba seimei ni kakawaru joutai desu. Jiko kettei-ken to ishi to shite no kyuumei gimu, dochira wo yuusen subeki ka ni tsuite, goiken wo okikase itadakemasu ka.',
				translation: 'El paciente está rechazando el tratamiento, pero sin intervención su vida corre peligro. ¿Podría darme su opinión sobre cuál debería tener prioridad: el derecho a la autodeterminación o el deber del médico de salvar vidas?'
			},
			{
				type: 'choice',
				prompt_jp: '（医療倫理の観点から論じてください）',
				prompt_romaji: '(Iryou rinri no kanten kara ronjite kudasai)',
				prompt_translation: 'Argumenta desde la ética médica con conocimiento de los principios de bioética.',
				choices: [
					{
						jp: '自律尊重の原則と善行の原則が衝突する典型的な事例ですね。成人で意思能力が確認されている場合は、インフォームド・リフューザルの観点から患者の意思を最大限尊重すべきだと考えます。ただし、意思決定能力に疑義がある場合は、後見的介入も法的根拠のもとで検討せざるを得ません。',
						romaji: 'Jiritsu sonchou no gensoku to zenko no gensoku ga shoutotsu suru tenkei-teki na jirei desu ne. Seijin de ishi nouryoku ga kakunin sarete iru baai wa, informed refusal no kanten kara kanja no ishi wo saidaigen sonchou subeki da to kangaemasu. Tadashi, ishi kettei nouryoku ni gigi ga aru baai wa, kokenContinue teki kainyuu mo houteki こんきょ no moto de kentou seざru wo emasen.',
						translation: 'Es un caso típico de colisión entre el principio de autonomía y el principio de beneficencia. Si el adulto tiene capacidad decisoria confirmada, considero que debe respetarse al máximo la voluntad del paciente desde la perspectiva del rechazo informado. Sin embargo, si hay dudas sobre la capacidad de toma de decisiones, la intervención paternalista tampoco puede descartarse bajo fundamento legal.',
						correct: true,
						feedback_es: '"自律尊重の原則" / "善行の原則" (principios de bioética Beauchamp & Childress en japonés), "インフォームド・リフューザル" (rechazo informado), "後見的介入" (intervención paternalista) — discurso ético médico N1 genuino.'
					},
					{
						jp: '患者の意思を尊重することが大切です。医師が勝手に治療してはいけません。',
						romaji: 'Kanja no ishi wo sonchou suru koto ga taisetsu desu. Ishi ga katte ni chiryou shite wa ikemasen.',
						translation: 'Es importante respetar la voluntad del paciente. El médico no puede tratar sin permiso.',
						correct: false,
						feedback_es: 'Simplificación excesiva para N1. La bioética es más matizada — la autonomía tiene límites cuando la capacidad decisoria está comprometida. No mencionas los principios técnicos ni las condiciones bajo las que puede haber intervención.'
					},
					{
						jp: '命を救うことが医師の仕事ですから、治療すべきです。',
						romaji: 'Inochi wo sukuu koto ga ishi no shigoto desu kara, chiryou subeki desu.',
						translation: 'Salvar vidas es el trabajo del médico, así que debe tratar.',
						correct: false,
						feedback_es: 'Paternalismo simplista que ignora la autonomía del paciente. En N1 la ética médica moderna reconoce el informed consent/refusal como derecho fundamental — no puedes ignorarlo con este argumento.'
					}
				],
				next_npc: {
					jp: '深い洞察をありがとうございます。おっしゃる通り、意思能力の評価が鍵になりますね。精神科医との連携も必要かもしれません。',
					romaji: 'Fukai dousatsu wo arigatou gozaimasu. Ossharu toori, ishi nouryoku no hyouka ga kagi ni narimasu ne. Seishin-ikai to no renkei mo hitsuyou kamo shiremasen.',
					translation: 'Gracias por esa perspectiva tan profunda. Como usted dice, la evaluación de la capacidad decisoria es clave. Quizás también sea necesaria la colaboración con un psiquiatra.'
				}
			}
		]
	},

	{
		id: 'diferencias-culturales',
		title_es: 'Debate sobre diferencias culturales',
		title_en: 'Cultural Differences Debate',
		level: 'N1',
		icon: '🌏',
		context_es: 'Participas en un panel internacional sobre diferencias culturales en el trabajo.',
		turns: [
			{
				type: 'npc',
				jp: '日本の職場文化、特に「空気を読む」という概念について、外国人の視点からはどのようにお感じになっていますか。',
				romaji: 'Nihon no shokuba bunka, toku ni "kuuki wo yomu" to iu gainen ni tsuite, gaikoku-jin no shiten kara wa dono you ni okanji ni natte imasu ka.',
				translation: 'Sobre la cultura laboral japonesa, especialmente el concepto de "leer el ambiente" (kuuki wo yomu), ¿cómo lo percibe desde una perspectiva extranjera?'
			},
			{
				type: 'choice',
				prompt_jp: '（文化的概念を批判的に、かつ敬意を持って論じてください）',
				prompt_romaji: '(Bunkakeki gainen wo hihanteki ni, katsu keii wo motte ronjite kudasai)',
				prompt_translation: 'Analiza el concepto con perspectiva intercultural — ni halagador ni ofensivo.',
				choices: [
					{
						jp: '「空気を読む」という能力は、高コンテクスト文化における洗練されたコミュニケーション様式として理解しております。ただ、多文化チームにおいては、暗黙の了解を前提とするコミュニケーションが情報の非対称性を生みかねません。明示的なコミュニケーション規範との共存策を模索することが、グローバルな職場環境においては不可欠ではないかと考えます。',
						romaji: '"Kuuki wo yomu" to iu nouryoku wa, kou-kontekusuto bunka ni okeru senren sareta komyunikeeshon youshiki to shite rikai shite orimasu. Tada, tabunka chiimu ni oite wa, anmoku no ryoukai wo zentei to suru komyunikeeshon ga jouhou no hijo-taisei wo umikane masen. Meiji-teki na komyunikeeshon kihan to no kyouzon-saku wo mosaku suru koto ga, gurooбaru na shokuba kankyou ni oite wa fukaketsu dewa nai ka to kangaemasu.',
						translation: 'La capacidad de "leer el ambiente" la entiendo como una forma sofisticada de comunicación en culturas de alto contexto. Sin embargo, en equipos multiculturales, la comunicación basada en entendimientos tácitos puede generar asimetría de información. Creo que es esencial explorar formas de coexistir con normas de comunicación más explícitas en entornos laborales globales.',
						correct: true,
						feedback_es: '"高コンテクスト文化" (teoría de Hall — cultura de alto contexto), "暗黙の了解" (entendimiento tácito), "情報の非対称性" (asimetría de información, término económico), "共存策を模索" (explorar coexistencia) — análisis intercultural N1 sofisticado que respeta sin adular.'
					},
					{
						jp: '空気を読むのは難しいし、外国人にはわかりにくいです。',
						romaji: 'Kuuki wo yomu no wa muzukashii shi, gaikoku-jin ni wa wakarini-kui desu.',
						translation: 'Leer el ambiente es difícil y los extranjeros no lo entienden bien.',
						correct: false,
						feedback_es: 'Demasiado personal y sin profundidad teórica. Para un panel N1 necesitas marcos conceptuales (cultura de alto/bajo contexto), no experiencia personal subjetiva.'
					},
					{
						jp: '日本文化は素晴らしいと思います。空気を読む文化は世界が見習うべきです。',
						romaji: 'Nihon bunka wa subarashii to omoimasu. Kuuki wo yomu bunka wa sekai ga minarau beki desu.',
						translation: 'Creo que la cultura japonesa es maravillosa. El mundo debería aprender de la cultura de leer el ambiente.',
						correct: false,
						feedback_es: 'Halagador pero sin rigor analítico. En un debate académico, la crítica constructiva y el análisis objetivo son más valiosos que el elogio. Muestra perspectiva crítica equilibrada.'
					}
				],
				next_npc: {
					jp: 'おっしゃる「情報の非対称性」という観点は非常に示唆に富んでいますね。ハイコンテクスト文化のメリットを活かしながら、どのような実践的アプローチが有効だとお考えですか。',
					romaji: 'Ossharu "jouhou no hijo-taisei" to iu kanten wa hijou ni shisa ni tonde imasu ne. Hai-kontekusuto bunka no meritto wo ikashi nagara, dono you na jissen-teki apuroochi ga yuukou da to okangae desu ka.',
					translation: 'El punto de vista sobre la "asimetría de información" que menciona es muy sugerente. ¿Qué enfoque práctico considera efectivo para aprovechar las ventajas de las culturas de alto contexto?'
				}
			}
		]
	},

	// ── N4 - Nuevas ──────────────────────────────────────────────────

	{
		id: 'biblioteca',
		title_es: 'En la biblioteca',
		title_en: 'At the library',
		level: 'N4',
		icon: '📚',
		context_es: 'Quieres devolver un libro y pedir uno nuevo prestado.',
		turns: [
			{
				type: 'npc',
				jp: 'こんにちは。この本を返却（へんきゃく）されますか？',
				romaji: 'Konnichiwa. Kono hon wo henkyaku saremasu ka?',
				translation: 'Hola. ¿Viene a devolver este libro?'
			},
			{
				type: 'choice',
				prompt_jp: '（はい、返します。そして新しい本を借りたいです）',
				prompt_romaji: '(Hai, kaeshimasu. Soshite atarashii hon wo karitai desu)',
				prompt_translation: 'Confirma la devolución y pide prestar otro',
				choices: [
					{
						jp: 'はい。返却したあとで、別の本を借りたいんですが…。',
						romaji: 'Hai. Henkyaku shita ato de, betsu no hon wo karitai n desu ga...',
						translation: 'Sí. Después de devolverlo, me gustaría pedir prestado otro libro...',
						correct: true,
						feedback_es: '¡Muy bien! El uso de "～たいんですが" (quisiera...) es perfecto para introducir una petición.'
					},
					{
						jp: 'いいえ、返しません。',
						romaji: 'Iie, kaeshimasen.',
						translation: 'No, no lo devuelvo.',
						correct: false,
						feedback_es: 'Si no lo devuelves no puedes pedir otro. Di "Hai, kaeshimasu".'
					},
					{
						jp: '本が あります。',
						romaji: 'Hon ga arimasu.',
						translation: 'Hay un libro.',
						correct: false,
						feedback_es: 'Obvio, pero no explica tu intención de devolverlo y pedir otro.'
					}
				],
				next_npc: {
					jp: 'かしこまりました。カードはお持ちですか？',
					romaji: 'Kashikomarimashita. Kaado wa omochi desu ka?',
					translation: 'Entendido. ¿Trae su carnet?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（はい、あります。貸出期間はどのくらいですか？）',
				prompt_romaji: '(Hai, arimasu. Kashidashi kikan wa dono kurai desu ka?)',
				prompt_translation: 'Muestra el carnet y pregunta el periodo de préstamo',
				choices: [
					{
						jp: 'はい、どうぞ。本はいつまで借りられますか？',
						romaji: 'Hai, douzo. Hon wa itsu made kareraremasu ka?',
						translation: 'Aquí tiene. ¿Hasta cuándo puedo tener el libro?',
						correct: true,
						feedback_es: '¡Excelente! "Itsu made kareraremasu ka" (¿hasta cuándo puedo pedir prestado?) es N4 total.'
					},
					{
						jp: 'これは 私のカードです。',
						romaji: 'Kore wa watashi no kaado desu.',
						translation: 'Este es mi carnet.',
						correct: false,
						feedback_es: 'Un poco redundante. Mejor decir "Douzo" y preguntar el tiempo de préstamo.'
					},
					{
						jp: 'いつ かえしますか？',
						romaji: 'Itsu kaeshimasu ka?',
						translation: '¿Cuándo lo devuelve?',
						correct: false,
						feedback_es: 'Eso pregunta cuándo lo devuelve el NPC. Usa "kareraremasu ka" (puedo prestarlo).'
					}
				],
				next_npc: {
					jp: '二週間（にしゅうかん）借りることができますよ。',
					romaji: 'Ni-shuukan kariru koto ga dekimasu yo.',
					translation: 'Puede pedirlo prestado por dos semanas.'
				}
			}
		]
	},

	{
		id: 'correo',
		title_es: 'En el correo',
		title_en: 'At the post office',
		level: 'N4',
		icon: '📮',
		context_es: 'Vas a enviar un paquete a tu país.',
		turns: [
			{
				type: 'npc',
				jp: 'いらっしゃいませ。お荷物（にもつ）の発送（はっそう）ですか？',
				romaji: 'Irasshaimase. Onimotsu no hassou desu ka?',
				translation: 'Bienvenido. ¿Viene a enviar un paquete?'
			},
			{
				type: 'choice',
				prompt_jp: '（はい、メキシコまで送りたいです）',
				prompt_romaji: '(Hai, Mekishiko made okuritai desu)',
				prompt_translation: 'Dile que quieres enviarlo a México',
				choices: [
					{
						jp: 'はい。メキシコまで送りたいんですが、いくらかかりますか？',
						romaji: 'Hai. Mekishiko made okuritai n desu ga, ikura kakarimasu ka?',
						translation: 'Sí. Quiero enviarlo a México, ¿cuánto cuesta?',
						correct: true,
						feedback_es: '¡Perfecto! "Made okuritai" + "ikura kakarimasu ka" es la combinación ganadora.'
					},
					{
						jp: 'メキシコは 遠いです。',
						romaji: 'Mekishiko wa tooi desu.',
						translation: 'México está lejos.',
						correct: false,
						feedback_es: 'Cierto, pero no ayuda al envío. Usa "okuritai" (quiero enviar).'
					},
					{
						jp: '船（ふね）で 行きます。',
						romaji: 'Fune de ikimasu.',
						translation: 'Voy en barco.',
						correct: false,
						feedback_es: 'Eso significa que TÚ vas en barco. Para el paquete se dice "funabin" (envío por barco).'
					}
				],
				next_npc: {
					jp: '航空便（こうくうびん）と船便（ふなびん）、どちらにされますか？',
					romaji: 'Koukuubin to funabin, dochira ni saremasu ka?',
					translation: '¿Envío por avión o por barco? ¿Cuál prefiere?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（早く着くほうがいいです）',
				prompt_romaji: '(Hayaku tsuku hou ga ii desu)',
				prompt_translation: 'Prefieres que llegue rápido',
				choices: [
					{
						jp: 'できるだけ早く着くようにしたいので、航空便でお願いします。',
						romaji: 'Dekiru dake hayaku tsuku you ni shitai node, koukuubin de onegaishimasu.',
						translation: 'Quiero que llegue lo antes posible, así que por avión, por favor.',
						correct: true,
						feedback_es: '¡Excelente nivel N4! "～you ni shitai" (quiero que...) es gramática avanzada muy útil.'
					},
					{
						jp: '航空便が 好きです。',
						romaji: 'Koukuubin ga suki desu.',
						translation: 'Me gusta el correo aéreo.',
						correct: false,
						feedback_es: 'Raro. Usa "onegaishimasu" para elegir el servicio.'
					},
					{
						jp: '船は 遅いです。',
						romaji: 'Fune wa osoi desu.',
						translation: 'El barco es lento.',
						correct: false,
						feedback_es: 'Aunque es verdad, no es una forma educada de elegir. Usa "koukuubin de".'
					}
				],
				next_npc: {
					jp: 'かしこまりました。一週間（いっしゅうかん）ほどで届くと思います。',
					romaji: 'Kashikomarimashita. Isshuukan hodo de todoku to omoimasu.',
					translation: 'Entendido. Creo que llegará en aproximadamente una semana.'
				}
			}
		]
	},

	// ── N3 - Nuevas ──────────────────────────────────────────────────

	{
		id: 'entrevista',
		title_es: 'Entrevista de trabajo',
		title_en: 'Job Interview',
		level: 'N3',
		icon: '💼',
		context_es: 'Estás en una entrevista para un puesto en una empresa tecnológica japonesa.',
		turns: [
			{
				type: 'npc',
				jp: '本日はお越しいただきありがとうございます。まず、弊社を志望（しぼう）した理由を教えてください。',
				romaji: 'Honjitsu wa okoshi itadaki arigatou gozaimasu. Mazu, heisha wo shibou shita riyuu wo oshiete kudasai.',
				translation: 'Gracias por venir hoy. Primero, por favor dígame la razón por la que solicitó unirse a nuestra empresa.'
			},
			{
				type: 'choice',
				prompt_jp: '（貴社の技術力に惹かれ、自分の経験を活かしたいです）',
				prompt_romaji: '(Kisha no gijutsuryoku ni hikare, jibun no keiken wo ikashitai desu)',
				prompt_translation: 'Dile que te atrae su tecnología y quieres usar tu experiencia',
				choices: [
					{
						jp: '御社（おんしゃ）の最先端（さいせんたん）技術に興味があり、これまでの開発経験を活かせると思ったからです。',
						romaji: 'Onsha no saisentan gijutsu ni kyoumi ga ari, kore made no kaihatsu keiken wo ikaseru to omotta kara desu.',
						translation: 'Porque me interesa la tecnología de vanguardia de su empresa y pensé que podría aprovechar mi experiencia previa en desarrollo.',
						correct: true,
						feedback_es: '¡Excelente! Usar "Onsha" (su empresa) y "ikaseru" (poder aprovechar) muestra un nivel N3/Keigo básico sólido.'
					},
					{
						jp: '日本で働きたいからです。アニメが好きです。',
						romaji: 'Nihon de hatarakitai kara desu. Anime ga suki desu.',
						translation: 'Porque quiero trabajar en Japón. Me gusta el anime.',
						correct: false,
						feedback_es: 'Demasiado informal y poco profesional para una entrevista. Enfócate en la empresa y tus habilidades.'
					},
					{
						jp: '給料（きゅうりょう）がいいと聞いたので。',
						romaji: 'Kyuuryou ga ii to kiita node.',
						translation: 'Porque escuché que el salario es bueno.',
						correct: false,
						feedback_es: '¡Sincero, pero te descartarán! Nunca menciones el salario como primera razón de motivación.'
					}
				],
				next_npc: {
					jp: 'なるほど。では、あなたの強み（つよみ）は、チームでどのように貢献（こうけん）できると考えていますか。',
					romaji: 'Naruhodo. Dewa, anata no tsuyomi wa, chiimu de dono you ni kouken dekiru to kangaete imasu ka.',
					translation: 'Ya veo. Entonces, ¿cómo cree que su mayor fortaleza puede contribuir al equipo?'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（コミュニケーション能力を活かして、円滑にプロジェクトを進められます）',
				prompt_romaji: '(Komyunikeeshon nouryoku wo ikashite, enkatsu ni purojekuto wo susumeraremasu)',
				prompt_translation: 'Explica que tu comunicación ayuda a que los proyectos avancen fluido',
				choices: [
					{
						jp: '周囲（しゅうい）と連携（れんけい）を取りながら、問題を迅速（じんそく）に解決できるのが私の強みです。',
						romaji: 'Shuui to renkei wo tori nagara, mondai wo jinsoku ni kaiketsu dekiru no ga watashi no tsuyomi desu.',
						translation: 'Mi fortaleza es poder resolver problemas rápidamente mientras colaboro con las personas a mi alrededor.',
						correct: true,
						feedback_es: '¡Perfecto! El vocabulario como "renkei" (colaboración) y "jinsoku" (rápido/pronto) es muy N3.'
					},
					{
						jp: '私はプログラミングがとても速いです。',
						romaji: 'Watashi wa puroguramingu ga totemo hayai desu.',
						translation: 'Soy muy rápido programando.',
						correct: false,
						feedback_es: 'Un poco arrogante y no responde a la parte de "trabajo en equipo".'
					},
					{
						jp: '一人で仕事をするのが好きです。',
						romaji: 'Hitori de shigoto wo suru no ga suki desu.',
						translation: 'Me gusta trabajar solo.',
						correct: false,
						feedback_es: 'Lo opuesto a lo que busca una empresa que valora el trabajo en equipo.'
					}
				],
				next_npc: {
					jp: '素晴らしいですね。弊社でもその力を発揮していただけることを期待しています。',
					romaji: 'Subarashii desu ne. Heisha demo sono chikara wo hakki shite itadakeru koto wo kitai shite imasu.',
					translation: 'Maravilloso. Esperamos que pueda demostrar esa capacidad también en nuestra empresa.'
				}
			}
		]
	},

	{
		id: 'medico',
		title_es: 'En el médico',
		title_en: 'At the Doctor',
		level: 'N3',
		icon: '🏥',
		context_es: 'Te sientes mal desde hace unos días y vas a consulta.',
		turns: [
			{
				type: 'npc',
				jp: '今日はどうされましたか？',
				romaji: 'Kyou wa dou saremashita ka?',
				translation: '¿Qué le trae hoy por aquí? (¿Cómo se siente?)'
			},
			{
				type: 'choice',
				prompt_jp: '（数日前から熱があって、喉も痛いです）',
				prompt_romaji: '(Suujitsu mae kara netsu ga atte, nodo mo itai desu)',
				prompt_translation: 'Explica que tienes fiebre y dolor de garganta desde hace días',
				choices: [
					{
						jp: '三日（みっか）ほど前から熱が下がらず、喉（のど）の痛みもひどくなってきたんです。',
						romaji: 'Mikka hodo mae kara netsu ga sagarazu, nodo no itami mo hidoku natte kita n desu.',
						translation: 'Desde hace unos tres días la fiebre no baja y el dolor de garganta ha empeorado.',
						correct: true,
						feedback_es: '¡Excelente! Usar "～zu" (forma negativa formal) y "～te kita" (ha ido pasando) es muy N3.'
					},
					{
						jp: '頭（あたま）が痛いです。病気（びょうき）かもしれません。',
						romaji: 'Atama ga itai desu. Byouki kamoshirenai.',
						translation: 'Me duele la cabeza. Tal vez sea una enfermedad.',
						correct: false,
						feedback_es: 'Un poco vago. En el médico debes ser específico con la duración y síntomas.'
					},
					{
						jp: '私は 元気（げんき）じゃないです。',
						romaji: 'Watashi wa genki janai desu.',
						translation: 'No estoy bien.',
						correct: false,
						feedback_es: 'Demasiado simple para un nivel N3. Describe los síntomas físicos.'
					}
				],
				next_npc: {
					jp: 'そうですか。では、少し喉を拝見（はいけん）しますね。…あ、かなり腫（は）れていますね。',
					romaji: 'Sou desu ka. Dewa, sukoshi nodo wo haiken shimasu ne. ...A, kanari harete imasu ne.',
					translation: 'Ya veo. Déjeme ver su garganta... Ah, está bastante inflamada.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（薬は食前と食後のどちらに飲めばいいですか？）',
				prompt_romaji: '(Kusuri wa shokuzen to shokugo no dochira ni nomeba ii desu ka?)',
				prompt_translation: 'Pregunta si la medicina se toma antes o después de comer',
				choices: [
					{
						jp: 'このお薬（くすり）は、食前（しょくぜん）と食後（しょくご）、どちらに服用（ふくよう）すべきでしょうか？',
						romaji: 'Kono okusuri wa, shokuzen to shokugo, dochira ni fukuyou subeki deshou ka?',
						translation: '¿Este medicamento debería tomarlo antes o después de las comidas?',
						correct: true,
						feedback_es: '¡Perfecto! "Fukuyou" (tomar medicina) y "subeki" (debería) son términos N3 muy apropiados.'
					},
					{
						jp: 'いつ 飲みますか？',
						romaji: 'Itsu nomimasu ka?',
						translation: '¿Cuándo se toma?',
						correct: false,
						feedback_es: 'Correcto pero muy simple. "Shokuzen/shokugo" son palabras clave que debes dominar en N3.'
					},
					{
						jp: 'ご飯（ごはん）を 食べたいです。',
						romaji: 'Gohan wo tabetai desu.',
						translation: 'Quiero comer.',
						correct: false,
						feedback_es: '¡Si tienes la garganta inflamada quizás te cueste! Pero no responde a la duda de la medicina.'
					}
				],
				next_npc: {
					jp: '食後（しょくご）三十分以内に飲んでください。お大事（だいじ）に。',
					romaji: 'Shokugo sanjuppun inai ni nonde kudasai. Odaiji ni.',
					translation: 'Tómelo dentro de los 30 minutos posteriores a la comida. ¡Que se mejore!'
				}
			}
		]
	},

	{
		id: 'mudanza',
		title_es: 'Buscando apartamento',
		title_en: 'Apartment Hunting',
		level: 'N3',
		icon: '🏠',
		context_es: 'Estás en una inmobiliaria buscando un lugar para vivir en Japón.',
		turns: [
			{
				type: 'npc',
				jp: 'どのようなお部屋をお探しですか？ご希望（きぼう）を教えてください。',
				romaji: 'Dono you na oheya wo osagashi desu ka? Gokibou wo oshiete kudasai.',
				translation: '¿Qué tipo de habitación busca? Por favor, dígame sus preferencias.'
			},
			{
				type: 'choice',
				prompt_jp: '（駅から近くて、家賃は8万円以下がいいです）',
				prompt_romaji: '(Eki kara chikakute, yachin wa hachiman-en ika ga ii desu ka)',
				prompt_translation: 'Quieres algo cerca de la estación y que el alquiler sea menos de 80,000 yenes',
				choices: [
					{
						jp: '駅から徒歩（とほ）十分以内で、家賃（やちん）は八万円（はちまんえん）程度（ていど）に抑（おさ）えたいんですが。',
						romaji: 'Eki kara toho juppun inai de, yachin wa hachiman-en teido ni osaetai n desu ga.',
						translation: 'Quisiera que esté a menos de 10 minutos a pie de la estación y mantener el alquiler en unos 80,000 yenes.',
						correct: true,
						feedback_es: '¡Excelente! "Toho" (a pie) y "osaetai" (querer contener/limitar) son expresiones muy naturales de N3.'
					},
					{
						jp: '安い 部屋（へや）が ほしいです。駅（えき）の近く。',
						romaji: 'Yasui heya ga hoshii desu. Eki no chikaku.',
						translation: 'Quiero una habitación barata. Cerca de la estación.',
						correct: false,
						feedback_es: 'Nivel N5. En N3 se espera que uses términos como "yachin" y "toho".'
					},
					{
						jp: '広い 庭（にわ）が ある家（いえ）がいいです。',
						romaji: 'Hiroi niwa ga aru ie ga ii desu.',
						translation: 'Quiero una casa con un jardín grande.',
						correct: false,
						feedback_es: '¡Difícil en la ciudad con ese presupuesto! Además no mencionaste la estación ni el precio.'
					}
				],
				next_npc: {
					jp: 'それなら、こちらの物件（ぶっけん）はいかがでしょう。最近リフォームされたばかりですよ。',
					romaji: 'Sorenara, kochira no bukken wa ikaga deshou. Saikin rifoomu sareta bakari desu yo.',
					translation: 'En ese caso, ¿qué le parece esta propiedad? Acaba de ser reformada recientemente.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（ペットを飼っても大丈夫でしょうか？）',
				prompt_romaji: '(Petto wo katte mo daijoubu deshou ka?)',
				prompt_translation: 'Pregunta si se permiten mascotas',
				choices: [
					{
						jp: 'ちなみに、このマンションはペットの飼育（しいく）は許可（きょか）されていますか？',
						romaji: 'Chinamini, kono manshon wa petto no shiiku wa kyoka sarete imasu ka?',
						translation: 'Por cierto, ¿está permitido tener mascotas en este apartamento?',
						correct: true,
						feedback_es: '¡Muy bien! "Chinamini" (por cierto) y "shiiku" (crianza de animales) demuestran un gran vocabulario.'
					},
					{
						jp: '犬（いぬ）が います。いいですか？',
						romaji: 'Inu ga imasu. Ii desu ka?',
						translation: 'Tengo un perro. ¿Está bien?',
						correct: false,
						feedback_es: 'Gramaticalmente correcto, pero "shiiku ga kyoka sarete imasu ka" es mucho más profesional en una inmobiliaria.'
					},
					{
						jp: '動物（どうぶつ）が 大好き（だいすき）です。',
						romaji: 'Doubutsu ga daisuki desu.',
						translation: 'Me encantan los animales.',
						correct: false,
						feedback_es: 'Información irrelevante para el contrato. Pregunta por los permisos.'
					}
				],
				next_npc: {
					jp: '残念ながら、こちらはペット禁止（きんし）となっております。他をお探ししましょうか。',
					romaji: 'Zannen nagara, kochira wa petto kinshi to natte orimasu. Hoka wo osagashi shimashou ka.',
					translation: 'Lamentablemente, aquí están prohibidas las mascotas. ¿Buscamos otro lugar?'
				}
			}
		]
	},

	{
		id: 'viaje',
		title_es: 'Planeando un viaje',
		title_en: 'Planning a Trip',
		level: 'N3',
		icon: '✈️',
		context_es: 'Estás consultando en una agencia de viajes para visitar Kioto.',
		turns: [
			{
				type: 'npc',
				jp: '京都旅行をご検討中（けんとうちゅう）ですか？どのようなプランがよろしいでしょうか。',
				romaji: 'Kyoto ryokou wo kentou-chuu desu ka? Dono you na puran ga yoroshii deshou ka.',
				translation: '¿Está considerando un viaje a Kioto? ¿Qué tipo de plan preferiría?'
			},
			{
				type: 'choice',
				prompt_jp: '（混雑を避けて、静かなお寺を巡りたいです）',
				prompt_romaji: '(Konzatsu wo sakete, shizuka na otera wo meguritai desu)',
				prompt_translation: 'Quieres evitar las multitudes y recorrer templos tranquilos',
				choices: [
					{
						jp: '有名な観光地よりも、混雑（こんざつ）を避（さ）けてゆっくりできる穴場（あなば）を教えてほしいんです。',
						romaji: 'Yuumei na kankouchi yori mo, konzatsu wo sakete yukkuri dekiru anaba wo oshiete hoshii n desu.',
						translation: 'Más que los lugares turísticos famosos, me gustaría que me recomendara lugares poco conocidos donde pueda relajarme evitando las multitudes.',
						correct: true,
						feedback_es: '¡Excelente! "Anaba" (lugar poco conocido/tesoro oculto) es una palabra muy útil en N3.'
					},
					{
						jp: '人が たくさん いる所（ところ）は 嫌い（きらい）です。',
						romaji: 'Hito ga takusan iru tokoro wa kirai desu.',
						translation: 'No me gustan los lugares con mucha gente.',
						correct: false,
						feedback_es: 'Un poco negativo. Es mejor expresar lo que quieres ("konzatsu wo sakete") que lo que odias.'
					},
					{
						jp: '京都（きょうと）は きれいだと思います。',
						romaji: 'Kyoto wa kirei da to omoimasu.',
						translation: 'Creo que Kioto es hermoso.',
						correct: false,
						feedback_es: 'Opinión general que no ayuda a planificar el viaje. Pide recomendaciones específicas.'
					}
				],
				next_npc: {
					jp: 'それでしたら、大原（おおはら）エリアはいかがでしょう。中心部から離（はな）れているので、落ち着いて拝観（はいかん）できますよ。',
					romaji: 'Sore deshitara, Ohara eria wa ikaga deshou. Chuushin-bu kara hanarete iru node, ochitsuite haikan dekimasu yo.',
					translation: 'En ese caso, ¿qué tal la zona de Ohara? Al estar alejada del centro, podrá visitar los templos con tranquilidad.'
				}
			},
			{
				type: 'choice',
				prompt_jp: '（いつ行くのが一番おすすめですか？）',
				prompt_romaji: '(Itsu iku no ga ichiban osusume desu ka?)',
				prompt_translation: '¿Cuándo es el mejor momento para ir?',
				choices: [
					{
						jp: '紅葉（こうよう）の時期（じき）は素晴らしいと聞きましたが、いつ頃（ごろ）予約（よやく）すべきでしょうか？',
						romaji: 'Kouyou no jiki wa subarashii to kikimashita ga, itsu-goro yoyaku subeki deshou ka?',
						translation: 'He oído que la época de los colores de otoño es maravillosa, ¿cuándo debería hacer la reserva?',
						correct: true,
						feedback_es: '¡Perfecto! Combinas "Kouyou" (colores de otoño) con una pregunta sobre el tiempo de reserva.'
					},
					{
						jp: 'いつが 安い（やすい）ですか？',
						romaji: 'Itsu ga yasui desu ka?',
						translation: '¿Cuándo es barato?',
						correct: false,
						feedback_es: 'Pregunta válida, pero en N3 intenta usar estructuras más completas sobre la mejor época ("jiki").'
					},
					{
						jp: '秋（あき）に 行きたいです。',
						romaji: 'Aki ni ikitai desu.',
						translation: 'Quiero ir en otoño.',
						correct: false,
						feedback_es: 'Afirmación simple. Intenta preguntar por recomendaciones o consejos de reserva.'
					}
				],
				next_npc: {
					jp: '十一月下旬（げじゅん）が見頃（みごろ）ですが、非常に人気ですので、三ヶ月前には予約されたほうがいいですよ。',
					romaji: 'Juuichi-gatsu gejun ga migoro desu ga, hijou ni ninki desu node, sankagetsu-mae ni wa yoyaku sareta hou ga ii desu yo.',
					translation: 'El mejor momento es a finales de noviembre, pero como es muy popular, es mejor que reserve con tres meses de antelación.'
				}
			}
		]
	}
];
