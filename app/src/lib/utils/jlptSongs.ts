export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export interface LyricLine {
    time: number;          // seconds from video start (absolute)
    text: string;          // Japanese lyrics
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
    level: JLPTLevel;
    title: string;
    artist: string;
    start: string;         // mm:ss — clip start
    end: string;           // mm:ss — clip end (~30s later)
    focus: { es: string; en: string };
    difficulty: number;    // 1–5
    youtubeId: string;     // YouTube video ID
    lyrics: LyricLine[];   // timestamped lyrics for the clip
    vocab?: SongVocab[];   // 3–5 key vocabulary words
}

export function parseTime(mmss: string): number {
    const [m, s] = mmss.split(':').map(Number);
    return m * 60 + s;
}

export const jlptSongs: SongLesson[] = [
    // 🟢 N5
    {
        level: "N5",
        title: "ありがとう",
        artist: "いきものがかり",
        start: "01:04",
        end: "01:34",
        focus: { es: "Expresiones básicas y agradecimiento", en: "Basic expressions and gratitude" },
        difficulty: 1,
        youtubeId: "VZ1Z_R8g0rM",
        lyrics: [
            { time: 65.0, text: "「ありがとう」って伝えたくて", romaji: "\"Arigatou\" tte tsutaetakute", translation_es: "Quiero decirte \"gracias\"", translation_en: "I want to tell you \"thank you\"" },
            { time: 71.0, text: "あなたを見つめるけど", romaji: "anata wo mitsumeru kedo", translation_es: "mientras te miro, pero...", translation_en: "while I look at you, but..." },
            { time: 76.0, text: "繋がれた右手は", romaji: "tsunagareta migite wa", translation_es: "Nuestras manos derechas entrelazadas", translation_en: "Our connected right hands" },
            { time: 80.0, text: "誰よりも優しく", romaji: "dare yori mo yasashiku", translation_es: "son más amables que las de cualquiera", translation_en: "are kinder than anyone's" },
            { time: 83.0, text: "ほら この声を受けとめている", romaji: "hora kono koe wo uketomete iru", translation_es: "Mira, están recibiendo esta voz", translation_en: "Look, they are receiving this voice" }
        ],
        vocab: [
            { jp: "伝える", kana: "つたえる", romaji: "tsutaeru", en: "to convey / tell", es: "transmitir / comunicar" },
            { jp: "見つめる", kana: "みつめる", romaji: "mitsumeru", en: "to stare at", es: "mirar fijamente" },
            { jp: "優しい", kana: "やさしい", romaji: "yasashii", en: "kind / gentle", es: "amable / gentil" }
        ]
    },
    {
        level: "N5",
        title: "恋するフォーチュンクッキー",
        artist: "AKB48",
        start: "01:12",
        end: "01:42",
        focus: { es: "Frases repetitivas y vocabulario cotidiano", en: "Repetitive phrases and everyday vocabulary" },
        difficulty: 1,
        youtubeId: "dFf4AgBNR1E",
        lyrics: [
            { time: 74.0, text: "恋するフォーチュンクッキー", romaji: "Koisuru fo-chun kukki-", translation_es: "Galleta de la fortuna enamorada", translation_en: "In love fortune cookie" },
            { time: 78.0, text: "未来は そんな悪くないよ", romaji: "mirai wa sonna warukunai yo", translation_es: "El futuro no es tan malo", translation_en: "The future isn't that bad" },
            { time: 83.0, text: "Hey! Hey! Hey!", romaji: "Hey! Hey! Hey!", translation_es: "¡Hey! ¡Hey! ¡Hey!", translation_en: "Hey! Hey! Hey!" },
            { time: 85.0, text: "ツキを呼ぶには 笑顔を見せること", romaji: "tsuki wo yobu ni wa egao wo miseru koto", translation_es: "Para atraer la suerte hay que mostrar una sonrisa", translation_en: "To call luck, you have to show a smile" }
        ],
        vocab: [
            { jp: "恋する", kana: "こいする", romaji: "koisuru", en: "to fall in love", es: "enamorarse" },
            { jp: "未来", kana: "みらい", romaji: "mirai", en: "future", es: "futuro" },
            { jp: "笑顔", kana: "えがお", romaji: "egao", en: "smile", es: "sonrisa" }
        ]
    },
    {
        level: "N5",
        title: "ドラえもん",
        artist: "星野源",
        start: "01:02",
        end: "01:32",
        focus: { es: "Vocabulario simple y pronunciación", en: "Simple vocabulary and pronunciation" },
        difficulty: 1,
        youtubeId: "eek39T4gjeM",
        lyrics: [
            { time: 64.0, text: "君を作るよ", romaji: "kimi wo tsukuru yo", translation_es: "Te crearé", translation_en: "I will make you" },
            { time: 68.0, text: "どどどどどどどどど ドラえもん", romaji: "dododododododododo doraemon", translation_es: "Dododododododo Doraemon", translation_en: "Dododododododo Doraemon" },
            { time: 76.0, text: "そのポケットで かなえさせてね", romaji: "sono poketto de kanaesasete ne", translation_es: "Haz que se cumpla con ese bolsillo", translation_en: "Make it come true with that pocket" },
            { time: 83.0, text: "シャララララ 僕の心に", romaji: "sharararara boku no kokoro ni", translation_es: "Shalalalala, en mi corazón", translation_en: "Shalalalala, in my heart" }
        ],
        vocab: [
            { jp: "作る", kana: "つくる", romaji: "tsukuru", en: "to make", es: "hacer / crear" },
            { jp: "心", kana: "こころ", romaji: "kokoro", en: "heart", es: "corazón" }
        ]
    },

    // 🟡 N4
    {
        level: "N4",
        title: "ひまわりの約束",
        artist: "秦基博",
        start: "01:10",
        end: "01:40",
        focus: { es: "Frases emocionales + gramática básica", en: "Emotional phrases + basic grammar" },
        difficulty: 2,
        youtubeId: "rZsNwXp0QUM",
        lyrics: [
            { time: 72.0, text: "どうして君が泣くの", romaji: "doushite kimi ga naku no", translation_es: "¿Por qué lloras?", translation_en: "Why are you crying?" },
            { time: 78.0, text: "まだ僕も泣いていないのに", romaji: "mada boku mo naite inai noni", translation_es: "Si yo todavía no he llorado...", translation_en: "Even though I haven't cried yet..." },
            { time: 84.0, text: "自分より 悲しむから", romaji: "jibun yori kanashimu kara", translation_es: "Como te entristeces más que yo mismo,", translation_en: "Because you get sadder than myself," },
            { time: 89.0, text: "辛いのがどっちか わからなくなるよ", romaji: "tsurai no ga dotchi ka wakaranaku naru yo", translation_es: "ya no sé quién de los dos está sufriendo más", translation_en: "I don't know which of us is hurting more" }
        ],
        vocab: [
            { jp: "泣く", kana: "なく", romaji: "naku", en: "to cry", es: "llorar" },
            { jp: "悲しむ", kana: "かなしむ", romaji: "kanashimu", en: "to feel sad", es: "entristecerse" },
            { jp: "辛い", kana: "つらい", romaji: "tsurai", en: "painful / hard", es: "doloroso / difícil" }
        ]
    },
    {
        level: "N4",
        title: "世界に一つだけの花",
        artist: "SMAP",
        start: "01:08",
        end: "01:38",
        focus: { es: "Estructuras simples + vocabulario descriptivo", en: "Simple structures + descriptive vocabulary" },
        difficulty: 2,
        youtubeId: "qZt19kM_Q_A",
        lyrics: [
            { time: 70.0, text: "そうさ 僕らは", romaji: "sou sa bokura wa", translation_es: "Así es, nosotros somos", translation_en: "That's right, we are" },
            { time: 72.0, text: "世界に一つだけの花", romaji: "sekai ni hitotsu dake no hana", translation_es: "la única flor en el mundo", translation_en: "the only flower in the world" },
            { time: 78.0, text: "一人一人違う種を持つ", romaji: "hitori hitori chigau tane wo motsu", translation_es: "Cada uno tiene una semilla diferente", translation_en: "Each person holds a different seed" },
            { time: 84.0, text: "その花を咲かせることだけに", romaji: "sono hana wo sakaseru koto dake ni", translation_es: "Solo en hacer florecer esa flor", translation_en: "Just in making that flower bloom" },
            { time: 90.0, text: "一生懸命になればいい", romaji: "isshoukenmei ni nareba ii", translation_es: "deberíamos esforzarnos al máximo", translation_en: "we should try our best" }
        ],
        vocab: [
            { jp: "世界", kana: "せかい", romaji: "sekai", en: "world", es: "mundo" },
            { jp: "種", kana: "たね", romaji: "tane", en: "seed", es: "semilla" },
            { jp: "一生懸命", kana: "いっしょうけんめい", romaji: "isshoukenmei", en: "with all one's effort", es: "con todo el esfuerzo" }
        ]
    },
    {
        level: "N4",
        title: "小さな恋のうた",
        artist: "MONGOL800",
        start: "01:03",
        end: "01:33",
        focus: { es: "Frases cortas + repetición", en: "Short phrases + repetition" },
        difficulty: 2,
        youtubeId: "u8EkSB9zSpE",
        lyrics: [
            { time: 65.0, text: "ほら あなたにとって", romaji: "hora anata ni totte", translation_es: "Mira, para ti", translation_en: "Look, for you" },
            { time: 69.0, text: "大事な人ほど すぐそばにいるの", romaji: "daiji na hito hodo sugu soba ni iru no", translation_es: "la persona más importante está justo a tu lado", translation_en: "the most important person is right by your side" },
            { time: 76.0, text: "ただ あなたにだけ 届いて欲しい", romaji: "tada anata ni dake todoite hoshii", translation_es: "Solo quiero que te llegue a ti", translation_en: "I just want it to reach only you" },
            { time: 83.0, text: "響け恋の歌", romaji: "hibike koi no uta", translation_es: "Que resuene la canción de amor", translation_en: "Let the love song echo" }
        ],
        vocab: [
            { jp: "大事", kana: "だいじ", romaji: "daiji", en: "important", es: "importante" },
            { jp: "届く", kana: "とどく", romaji: "todoku", en: "to reach", es: "alcanzar / llegar" },
            { jp: "響く", kana: "ひびく", romaji: "hibiku", en: "to echo / resound", es: "resonar" }
        ]
    },

    // 🟠 N3
    {
        level: "N3",
        title: "チェリー",
        artist: "スピッツ",
        start: "01:03",
        end: "01:33",
        focus: { es: "Vocabulario intermedio + expresiones naturales", en: "Intermediate vocabulary + natural expressions" },
        difficulty: 3,
        youtubeId: "uqWeX2vD2xU",
        lyrics: [
            { time: 65.0, text: "「愛してる」の響きだけで", romaji: "\"aishiteru\" no hibiki dake de", translation_es: "Solo con el eco de un 'te amo'", translation_en: "Just with the echo of 'I love you'" },
            { time: 71.0, text: "強くなれる気がしたよ", romaji: "tsuyoku nareru ki ga shita yo", translation_es: "Sentí que podía volverme más fuerte", translation_en: "I felt I could become stronger" },
            { time: 76.0, text: "ささやかな喜びを", romaji: "sasayaka na yorokobi wo", translation_es: "Una pequeña alegría", translation_en: "A modest joy" },
            { time: 82.0, text: "つぶれるほど抱きしめて", romaji: "tsubureru hodo dakishimete", translation_es: "abrazándola hasta casi aplastarla", translation_en: "hugging it until it almost crushes" }
        ],
        vocab: [
            { jp: "響き", kana: "ひびき", romaji: "hibiki", en: "echo / sound", es: "eco / sonido" },
            { jp: "ささやか", kana: "ささやか", romaji: "sasayaka", en: "modest / small", es: "modesto / pequeño" },
            { jp: "抱きしめる", kana: "だきしめる", romaji: "dakishimeru", en: "to hug tightly", es: "abrazar fuerte" }
        ]
    },
    {
        level: "N3",
        title: "打上花火",
        artist: "DAOKO × 米津玄師",
        start: "00:56",
        end: "01:26",
        focus: { es: "Escucha + ritmo intermedio", en: "Listening + intermediate rhythm" },
        difficulty: 3,
        youtubeId: "-tKVN2mAKRI",
        lyrics: [
            { time: 58.0, text: "パッと光って咲いた 花火を見ていた", romaji: "patto hikatte saita hanabi wo miteita", translation_es: "Miraba los fuegos artificiales que brillaron y florecieron de repente", translation_en: "I was watching the fireworks that suddenly flashed and bloomed" },
            { time: 65.0, text: "きっとまだ 終わらない夏が", romaji: "kitto mada owaranai natsu ga", translation_es: "Seguramente, este verano que aún no termina", translation_en: "Surely, this summer that hasn't ended yet" },
            { time: 72.0, text: "曖昧な心を 解かして繋いだ", romaji: "aimai na kokoro wo tokashite tsunaida", translation_es: "Derritió y unió nuestros corazones ambiguos", translation_en: "Melted and connected our ambiguous hearts" },
            { time: 79.0, text: "この夜が 続いて欲しかった", romaji: "kono yoru ga tsuzuitte hoshikatta", translation_es: "Quería que esta noche continuara", translation_en: "I wanted this night to continue" }
        ],
        vocab: [
            { jp: "花火", kana: "はなび", romaji: "hanabi", en: "fireworks", es: "fuegos artificiales" },
            { jp: "曖昧", kana: "あいまい", romaji: "aimai", en: "ambiguous", es: "ambiguo" },
            { jp: "解かす", kana: "とかす", romaji: "tokasu", en: "to melt", es: "derretir" }
        ]
    },
    {
        level: "N3",
        title: "Lemon",
        artist: "米津玄師",
        start: "01:04",
        end: "01:34",
        focus: { es: "Gramática intermedia + comprensión", en: "Intermediate grammar + comprehension" },
        difficulty: 3,
        youtubeId: "SX_ViT4Ra7k",
        lyrics: [
            { time: 66.0, text: "あの日の悲しみさえ", romaji: "ano hi no kanashimi sae", translation_es: "Incluso la tristeza de aquel día", translation_en: "Even the sadness of that day" },
            { time: 70.0, text: "あの日の苦しみさえ", romaji: "ano hi no kurushimi sae", translation_es: "Incluso el sufrimiento de aquel día", translation_en: "Even the suffering of that day" },
            { time: 73.0, text: "そのすべてを愛してた あなたと共に", romaji: "sono subete wo aishiteta anata to tomo ni", translation_es: "Amé todo eso, junto a ti", translation_en: "I loved all of it, together with you" },
            { time: 80.0, text: "胸に残り離れない 苦いレモンの匂い", romaji: "mune ni nokori hanarenai nigai remon no nioi", translation_es: "El amargo olor a limón se queda en mi pecho y no se va", translation_en: "The bitter smell of lemon remains in my chest and won't leave" },
            { time: 87.0, text: "雨が降り止むまでは帰れない", romaji: "ame ga furiyamu made wa kaerenai", translation_es: "No puedo regresar hasta que deje de llover", translation_en: "I can't return until the rain stops falling" }
        ],
        vocab: [
            { jp: "悲しみ", kana: "かなしみ", romaji: "kanashimi", en: "sadness", es: "tristeza" },
            { jp: "苦しみ", kana: "くるしみ", romaji: "kurushimi", en: "suffering", es: "sufrimiento" },
            { jp: "匂い", kana: "におい", romaji: "nioi", en: "smell / scent", es: "olor / aroma" }
        ]
    },

    // 🔵 N2
    {
        level: "N2",
        title: "Pretender",
        artist: "Official髭男dism",
        start: "01:02",
        end: "01:32",
        focus: { es: "Gramática compleja + emociones", en: "Complex grammar + emotions" },
        difficulty: 4,
        youtubeId: "TQ8WlA2GXbk",
        lyrics: [
            { time: 64.0, text: "君の運命の人は僕じゃない", romaji: "kimi no unmei no hito wa boku janai", translation_es: "La persona de tu destino no soy yo", translation_en: "The person of your destiny is not me" },
            { time: 70.0, text: "辛いけど否めない でも離れ難いのさ", romaji: "tsurai kedo inamenai demo hanaregatai no sa", translation_es: "Duele pero es innegable, aun así es difícil alejarse", translation_en: "It hurts but it's undeniable, yet it's hard to let go" },
            { time: 76.0, text: "その髪に触れただけで 痛いや いやでも", romaji: "sono kami ni fureta dake de itai ya iya demo", translation_es: "Solo con tocar ese cabello, duele, oye, pero...", translation_en: "Just touching that hair hurts, hey, but..." },
            { time: 83.0, text: "甘いな いやいや", romaji: "amai na iyaiya", translation_es: "es dulce, no, no...", translation_en: "it's sweet, no, no..." }
        ],
        vocab: [
            { jp: "運命", kana: "うんめい", romaji: "unmei", en: "destiny / fate", es: "destino" },
            { jp: "否めない", kana: "いなめない", romaji: "inamenai", en: "undeniable", es: "innegable" },
            { jp: "難い", kana: "がたい", romaji: "gatai", en: "difficult to...", es: "difícil de..." }
        ]
    },
    {
        level: "N2",
        title: "残酷な天使のテーゼ",
        artist: "高橋洋子",
        start: "01:24",
        end: "01:54",
        focus: { es: "Expresiones abstractas", en: "Abstract expressions" },
        difficulty: 4,
        youtubeId: "o6wtDPVkKqI",
        lyrics: [
            { time: 86.0, text: "残酷な天使のテーゼ", romaji: "zankoku na tenshi no te-ze", translation_es: "La tesis de un ángel cruel", translation_en: "A cruel angel's thesis" },
            { time: 89.0, text: "窓辺からやがて飛び立つ", romaji: "madobe kara yagate tobitatsu", translation_es: "que pronto volará desde la ventana", translation_en: "will soon take flight from the window" },
            { time: 93.0, text: "ほとばしる熱いパトスで", romaji: "hotobashiru atsui patosu de", translation_es: "Con un ardiente y desbordante pathos", translation_en: "With a surging hot pathos" },
            { time: 97.0, text: "思い出を裏切るなら", romaji: "omoide wo uragiru nara", translation_es: "si vas a traicionar tus recuerdos", translation_en: "if you're going to betray your memories" },
            { time: 100.0, text: "この宇宙を抱いて輝く", romaji: "kono sora wo daite kagayaku", translation_es: "abraza este universo y brilla", translation_en: "embrace this universe and shine" },
            { time: 105.0, text: "少年よ 神話になれ", romaji: "shounen yo shinwa ni nare", translation_es: "¡Joven, conviértete en una leyenda!", translation_en: "Boy, become a myth!" }
        ],
        vocab: [
            { jp: "残酷", kana: "ざんこく", romaji: "zankoku", en: "cruel", es: "cruel" },
            { jp: "裏切る", kana: "うらぎる", romaji: "uragiru", en: "to betray", es: "traicionar" },
            { jp: "神話", kana: "しんわ", romaji: "shinwa", en: "myth / legend", es: "mito / leyenda" }
        ]
    },
    {
        level: "N2",
        title: "群青",
        artist: "YOASOBI",
        start: "01:21",
        end: "01:51",
        focus: { es: "Listening rápido + vocabulario avanzado", en: "Fast listening + advanced vocabulary" },
        difficulty: 4,
        youtubeId: "Y4nEEZwckuU",
        lyrics: [
            { time: 83.0, text: "嗚呼、知らず知らず隠してた", romaji: "aa, shirazu shirazu kakushiteta", translation_es: "Ah, lo escondía sin darme cuenta", translation_en: "Ah, I was hiding it without realizing" },
            { time: 87.0, text: "本当の声を響かせてよ、ほら", romaji: "hontou no koe wo hibikasete yo, hora", translation_es: "Haz resonar tu verdadera voz, vamos", translation_en: "Make your true voice echo, come on" },
            { time: 92.0, text: "見ないふりしていても", romaji: "minai furi shite ite mo", translation_es: "Aunque finjas no verlo", translation_en: "Even if you pretend not to see it" },
            { time: 95.0, text: "確かにそこにある", romaji: "tashika ni soko ni aru", translation_es: "Ciertamente está ahí", translation_en: "It is certainly there" }
        ],
        vocab: [
            { jp: "知らず知らず", kana: "しらずしらず", romaji: "shirazushirazu", en: "unconsciously / without realizing", es: "inconscientemente / sin darse cuenta" },
            { jp: "隠す", kana: "かくす", romaji: "kakusu", en: "to hide", es: "esconder / ocultar" },
            { jp: "確か", kana: "たしか", romaji: "tashika", en: "certain / sure", es: "cierto / seguro" }
        ]
    },

    // 🔴 N1
    {
        level: "N1",
        title: "夜に駆ける",
        artist: "YOASOBI",
        start: "01:02",
        end: "01:32",
        focus: { es: "Narrativa rápida + comprensión avanzada", en: "Fast narrative + advanced comprehension" },
        difficulty: 5,
        youtubeId: "x8VYWazR5mE",
        lyrics: [
            { time: 64.0, text: "沈むように溶けてゆくように", romaji: "shizumu you ni tokete yuku you ni", translation_es: "Como si nos hundiéramos, como si nos derritiéramos", translation_en: "Like sinking, like melting away" },
            { time: 68.0, text: "二人だけの空が広がる夜に", romaji: "futari dake no sora ga hirogaru yoru ni", translation_es: "En una noche donde el cielo se expande solo para nosotros dos", translation_en: "In a night where the sky spreads only for the two of us" },
            { time: 73.0, text: "「さよなら」だけだった", romaji: "\"sayonara\" dake datta", translation_es: "Fue solo un \"adiós\"", translation_en: "It was only a \"goodbye\"" },
            { time: 76.0, text: "その一言で全てが分かった", romaji: "sono hitokoto de subete ga wakatta", translation_es: "Con esa sola palabra lo entendí todo", translation_en: "With that one word I understood everything" },
            { time: 79.0, text: "日が沈み出した空と君の姿", romaji: "hi ga shizumidashita sora to kimi no sugata", translation_es: "El cielo al atardecer y tu figura", translation_en: "The setting sun's sky and your figure" }
        ],
        vocab: [
            { jp: "沈む", kana: "しずむ", romaji: "shizumu", en: "to sink", es: "hundirse" },
            { jp: "溶ける", kana: "とける", romaji: "tokeru", en: "to melt", es: "derretirse / disolverse" },
            { jp: "姿", kana: "すがた", romaji: "sugata", en: "figure / appearance", es: "figura / apariencia" }
        ]
    },
    {
        level: "N1",
        title: "白日",
        artist: "King Gnu",
        start: "01:03",
        end: "01:33",
        focus: { es: "Vocabulario avanzado + interpretación", en: "Advanced vocabulary + interpretation" },
        difficulty: 5,
        youtubeId: "ony539T074w",
        lyrics: [
            { time: 65.0, text: "時には誰かを 知らず知らずのうちに", romaji: "toki ni wa dareka wo shirazushirazu no uchi ni", translation_es: "A veces, sin darnos cuenta", translation_en: "Sometimes, without realizing it" },
            { time: 71.0, text: "傷つけてしまったり", romaji: "kizutsukete shimattari", translation_es: "terminamos lastimando a alguien", translation_en: "we end up hurting someone" },
            { time: 75.0, text: "失ったりして初めて", romaji: "ushinattari shite hajimete", translation_es: "y solo al perderlo por primera vez", translation_en: "and only upon losing them for the first time" },
            { time: 79.0, text: "犯した罪を知る", romaji: "okashita tsumi wo shiru", translation_es: "conocemos el pecado que hemos cometido", translation_en: "we realize the sin we committed" },
            { time: 83.0, text: "戻れないよ、昔のようには", romaji: "modorenai yo, mukashi no you ni wa", translation_es: "Ya no podemos regresar a como era antes", translation_en: "We can't go back to how it was before" }
        ],
        vocab: [
            { jp: "傷つける", kana: "きずつける", romaji: "kizutsukeru", en: "to hurt / wound", es: "herir / lastimar" },
            { jp: "失う", kana: "うしなう", romaji: "ushinau", en: "to lose", es: "perder" },
            { jp: "罪", kana: "つみ", romaji: "tsumi", en: "sin / crime", es: "pecado / crimen" }
        ]
    },
    {
        level: "N1",
        title: "unravel",
        artist: "TK from 凛として時雨",
        start: "00:57",
        end: "01:27",
        focus: { es: "Velocidad + emoción + listening complejo", en: "Speed + emotion + complex listening" },
        difficulty: 5,
        youtubeId: "7aMOurgDB-o",
        lyrics: [
            { time: 59.0, text: "壊れた 壊れたよ この世界で", romaji: "kowareta kowareta yo kono sekai de", translation_es: "Me rompí, me rompí en este mundo", translation_en: "I broke, I broke in this world" },
            { time: 63.5, text: "君が笑う 何も見えずに", romaji: "kimi ga warau nani mo miezu ni", translation_es: "Tú sonríes sin ver nada", translation_en: "You smile without seeing anything" },
            { time: 67.0, text: "壊れた僕なんてさ 息を止めて", romaji: "kowareta boku nante sa iki wo tomete", translation_es: "Para alguien roto como yo, detén la respiración", translation_en: "For someone broken like me, hold your breath" },
            { time: 70.0, text: "ほどけない もう ほどけないよ 真実さえ", romaji: "hodokenai mou hodokenai yo shinjitsu sae", translation_es: "No se puede deshacer, ya no, ni siquiera la verdad", translation_en: "It can't be undone, not anymore, not even the truth" },
            { time: 73.0, text: "freeze", romaji: "freeze", translation_es: "congela", translation_en: "freeze" },
            { time: 74.5, text: "壊せる 壊せない 狂える 狂えない", romaji: "kowaseru kowasenai kurueru kuruenai", translation_es: "Puedo romper, no puedo, puedo enloquecer, no puedo", translation_en: "Can break, can't break, can go mad, can't go mad" },
            { time: 77.0, text: "あなたを見つけて 揺れた", romaji: "anata wo mitsukete yureta", translation_es: "Te encontré y temblé", translation_en: "I found you and trembled" }
        ],
        vocab: [
            { jp: "壊れる", kana: "こわれる", romaji: "kowareru", en: "to break / shatter", es: "romperse / hacerse pedazos" },
            { jp: "狂う", kana: "くるう", romaji: "kuruu", en: "to go mad", es: "enloquecer" },
            { jp: "真実", kana: "しんじつ", romaji: "shinjitsu", en: "truth", es: "verdad" },
            { jp: "揺れる", kana: "ゆれる", romaji: "yureru", en: "to shake / tremble", es: "temblar / agitarse" }
        ]
    }
];