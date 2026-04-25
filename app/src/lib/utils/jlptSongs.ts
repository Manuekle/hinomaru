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
    lyrics: LyricLine[];   // timestamped lyrics for the 30s clip
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
        start: "00:58",
        end: "01:28",
        focus: { es: "Expresiones básicas y agradecimiento", en: "Basic expressions and gratitude" },
        difficulty: 1,
        youtubeId: "VZ1Z_R8g0rM",
        lyrics: [
            { time: 58.0, text: "「ありがとう」って伝えたくて", romaji: "\"Arigatou\" tte tsutaetakute", translation_es: "Quiero decirte \"gracias\"", translation_en: "I want to tell you \"thank you\"" },
            { time: 63.5, text: "あなたを見つめるけど", romaji: "anata wo mitsumeru kedo", translation_es: "mientras te miro, pero...", translation_en: "while I look at you, but..." },
            { time: 68.0, text: "繋がれた右手は", romaji: "tsunagareta migite wa", translation_es: "Nuestras manos derechas entrelazadas", translation_en: "Our connected right hands" },
            { time: 72.0, text: "誰よりも優しく", romaji: "dare yori mo yasashiku", translation_es: "son más amables que las de cualquiera", translation_en: "are kinder than anyone's" },
            { time: 76.5, text: "ほら この声を受けとめている", romaji: "hora kono koe wo uketomete iru", translation_es: "Mira, están recibiendo esta voz", translation_en: "Look, they are receiving this voice" }
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
            { time: 72.0, text: "恋するフォーチュンクッキー", romaji: "Koisuru fo-chun kukki-", translation_es: "Galleta de la fortuna enamorada", translation_en: "In love fortune cookie" },
            { time: 76.5, text: "未来は そんな悪くないよ", romaji: "mirai wa sonna warukunai yo", translation_es: "El futuro no es tan malo", translation_en: "The future isn't that bad" },
            { time: 80.5, text: "Hey! Hey! Hey!", romaji: "Hey! Hey! Hey!", translation_es: "¡Hey! ¡Hey! ¡Hey!", translation_en: "Hey! Hey! Hey!" },
            { time: 82.5, text: "ツキを呼ぶには 笑顔を見せること", romaji: "tsuki wo yobu ni wa egao wo miseru koto", translation_es: "Para atraer la suerte hay que mostrar una sonrisa", translation_en: "To call luck, you have to show a smile" }
        ],
        vocab: [
            { jp: "恋する", kana: "こいする", romaji: "koisuru", en: "to fall in love", es: "enamorarse" },
            { jp: "未来", kana: "みらい", romaji: "mirai", en: "future", es: "futuro" },
            { jp: "悪い", kana: "わるい", romaji: "warui", en: "bad", es: "malo" },
            { jp: "笑顔", kana: "えがお", romaji: "egao", en: "smile", es: "sonrisa" }
        ]
    },
    {
        level: "N5",
        title: "ドラえもん",
        artist: "星野源",
        start: "00:55",
        end: "01:25",
        focus: { es: "Vocabulario simple y pronunciación", en: "Simple vocabulary and pronunciation" },
        difficulty: 1,
        youtubeId: "eek39T4gjeM",
        lyrics: [
            { time: 55.0, text: "少しだけ不思議な", romaji: "sukoshi dake fushigi na", translation_es: "Un poco misteriosa,", translation_en: "A little bit mysterious," },
            { time: 59.0, text: "普段のお話", romaji: "fudan no ohanashi", translation_es: "una historia cotidiana", translation_en: "an everyday story" },
            { time: 63.5, text: "指先と机の間 二次元", romaji: "yubisaki to tsukue no aida nijigen", translation_es: "Entre mis dedos y el escritorio, dos dimensiones", translation_en: "Between my fingertips and the desk, two dimensions" }
        ],
        vocab: [
            { jp: "少し", kana: "すこし", romaji: "sukoshi", en: "a little", es: "un poco" },
            { jp: "不思議", kana: "ふしぎ", romaji: "fushigi", en: "mysterious / strange", es: "misterioso / extraño" },
            { jp: "机", kana: "つくえ", romaji: "tsukue", en: "desk", es: "escritorio" }
        ]
    },

    // 🟡 N4
    {
        level: "N4",
        title: "ひまわりの約束",
        artist: "秦基博",
        start: "01:14",
        end: "01:44",
        focus: { es: "Frases emocionales + gramática básica", en: "Emotional phrases + basic grammar" },
        difficulty: 2,
        youtubeId: "rZsNwXp0QUM",
        lyrics: [
            { time: 74.0, text: "どうして君が泣くの", romaji: "doushite kimi ga naku no", translation_es: "¿Por qué lloras?", translation_en: "Why do you cry?" },
            { time: 78.5, text: "まだ僕も泣いていないのに", romaji: "mada boku mo naite inai noni", translation_es: "Aunque yo todavía no he llorado...", translation_en: "Even though I haven't cried yet..." },
            { time: 84.0, text: "自分より 悲しむから", romaji: "jibun yori kanashimu kara", translation_es: "Como te entristeces más que yo mismo,", translation_en: "Because you get sadder than myself," },
            { time: 90.0, text: "辛いのがどっちか わからなくなるよ", romaji: "tsurai no ga dotchi ka wakaranaku naru yo", translation_es: "ya no sé quién de los dos está sufriendo más", translation_en: "I don't know which of us is hurting more" }
        ],
        vocab: [
            { jp: "泣く", kana: "なく", romaji: "naku", en: "to cry", es: "llorar" },
            { jp: "悲しむ", kana: "かなしむ", romaji: "kanashimu", en: "to feel sad", es: "entristecerse" },
            { jp: "辛い", kana: "つらい", romaji: "tsurai", en: "painful / hard", es: "doloroso / duro" }
        ]
    },
    {
        level: "N4",
        title: "世界に一つだけの花",
        artist: "SMAP",
        start: "01:10",
        end: "01:40",
        focus: { es: "Estructuras simples + vocabulario descriptivo", en: "Simple structures + descriptive vocabulary" },
        difficulty: 2,
        youtubeId: "qZt19kM_Q_A",
        lyrics: [
            { time: 70.0, text: "そうさ 僕らは", romaji: "sou sa bokura wa", translation_es: "Así es, nosotros somos", translation_en: "That's right, we are" },
            { time: 73.0, text: "世界に一つだけの花", romaji: "sekai ni hitotsu dake no hana", translation_es: "la única flor en el mundo", translation_en: "the only flower in the world" },
            { time: 78.0, text: "一人一人違う種を持つ", romaji: "hitori hitori chigau tane wo motsu", translation_es: "Cada uno tiene una semilla diferente", translation_en: "Each person holds a different seed" },
            { time: 83.5, text: "その花を咲かせることだけに", romaji: "sono hana wo sakaseru koto dake ni", translation_es: "Solo en hacer florecer esa flor", translation_en: "Just in making that flower bloom" },
            { time: 89.0, text: "一生懸命になればいい", romaji: "isshoukenmei ni nareba ii", translation_es: "deberíamos esforzarnos al máximo", translation_en: "we should try our best" }
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
        start: "01:05",
        end: "01:35",
        focus: { es: "Frases cortas + repetición", en: "Short phrases + repetition" },
        difficulty: 2,
        youtubeId: "u8EkSB9zSpE",
        lyrics: [
            { time: 65.0, text: "ほら あなたにとって", romaji: "hora anata ni totte", translation_es: "Mira, para ti", translation_en: "Look, for you" },
            { time: 69.0, text: "大事な人ほど すぐそばにいるの", romaji: "daiji na hito hodo sugu soba ni iru no", translation_es: "la persona más importante está justo a tu lado", translation_en: "the most important person is right by your side" },
            { time: 76.5, text: "ただ あなたにだけ 届いて欲しい", romaji: "tada anata ni dake todoite hoshii", translation_es: "Solo quiero que te llegue a ti", translation_en: "I just want it to reach only you" },
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
        start: "01:00",
        end: "01:30",
        focus: { es: "Vocabulario intermedio + expresiones naturales", en: "Intermediate vocabulary + natural expressions" },
        difficulty: 3,
        youtubeId: "uqWeX2vD2xU",
        lyrics: [
            { time: 60.0, text: "「愛してる」の響きだけで", romaji: "\"aishiteru\" no hibiki dake de", translation_es: "Solo con el eco de un \"te amo\"", translation_en: "Just with the echo of \"I love you\"" },
            { time: 65.0, text: "強くなれる気がしたよ", romaji: "tsuyoku nareru ki ga shita yo", translation_es: "Sentí que podía volverme más fuerte", translation_en: "I felt like I could become stronger" },
            { time: 70.0, text: "ささやかな喜びを", romaji: "sasayaka na yorokobi wo", translation_es: "Una pequeña alegría", translation_en: "A modest joy" },
            { time: 75.0, text: "つぶれるほど抱きしめて", romaji: "tsubureru hodo dakishimete", translation_es: "abrazándola hasta casi aplastarla", translation_en: "hugging it until it almost crushes" }
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
        start: "01:00",
        end: "01:30",
        focus: { es: "Escucha + ritmo intermedio", en: "Listening + intermediate rhythm" },
        difficulty: 3,
        youtubeId: "-tKVN2mAKRI",
        lyrics: [
            { time: 60.0, text: "パッと光って咲いた 花火を見ていた", romaji: "patto hikatte saita hanabi wo miteita", translation_es: "Miraba los fuegos artificiales que brillaron y florecieron de repente", translation_en: "I was watching the fireworks that suddenly flashed and bloomed" },
            { time: 67.5, text: "きっとまだ 終わらない夏が", romaji: "kitto mada owaranai natsu ga", translation_es: "Seguramente, este verano que aún no termina", translation_en: "Surely, this summer that hasn't ended yet" },
            { time: 74.0, text: "曖昧な心を 解かして繋いだ", romaji: "aimai na kokoro wo tokashite tsunaida", translation_es: "Derritió y unió nuestros corazones ambiguos", translation_en: "Melted and connected our ambiguous hearts" },
            { time: 80.5, text: "この夜が 続いて欲しかった", romaji: "kono yoru ga tsuzuitte hoshikatta", translation_es: "Quería que esta noche continuara", translation_en: "I wanted this night to continue" }
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
        start: "01:07",
        end: "01:37",
        focus: { es: "Gramática intermedia + comprensión", en: "Intermediate grammar + comprehension" },
        difficulty: 3,
        youtubeId: "SX_ViT4Ra7k",
        lyrics: [
            { time: 67.0, text: "あの日の悲しみさえ", romaji: "ano hi no kanashimi sae", translation_es: "Incluso la tristeza de aquel día", translation_en: "Even the sadness of that day" },
            { time: 71.0, text: "あの日の苦しみさえ", romaji: "ano hi no kurushimi sae", translation_es: "Incluso el sufrimiento de aquel día", translation_en: "Even the suffering of that day" },
            { time: 74.5, text: "そのすべてを愛してた あなたとともに", romaji: "sono subete wo aishiteta anata to tomo ni", translation_es: "Amé todo eso, junto a ti", translation_en: "I loved all of it, together with you" },
            { time: 82.0, text: "胸に残り離れない 苦いレモンの匂い", romaji: "mune ni nokori hanarenai nigai remon no nioi", translation_es: "El amargo olor a limón se queda en mi pecho y no se va", translation_en: "The bitter smell of lemon remains in my chest and won't leave" },
            { time: 89.0, text: "雨が降り止むまでは帰れない", romaji: "ame ga furiyamu made wa kaerenai", translation_es: "No puedo regresar hasta que deje de llover", translation_en: "I can't return until the rain stops falling" }
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
        start: "01:05",
        end: "01:35",
        focus: { es: "Gramática compleja + emociones", en: "Complex grammar + emotions" },
        difficulty: 4,
        youtubeId: "TQ8WlA2GXbk",
        lyrics: [
            { time: 65.0, text: "君の運命の人は僕じゃない", romaji: "kimi no unmei no hito wa boku janai", translation_es: "El hombre de tu destino no soy yo", translation_en: "The man of your destiny is not me" },
            { time: 69.5, text: "辛いけど否めない でも離れ難いのさ", romaji: "tsurai kedo inamenai demo hanaregatai no sa", translation_es: "Es doloroso pero innegable, sin embargo, es difícil separarse", translation_en: "It's painful but undeniable, yet it's hard to separate" },
            { time: 76.0, text: "その髪に触れただけで 痛いや いやでも", romaji: "sono kami ni fureta dake de itai ya iya demo", translation_es: "Solo con tocar ese cabello, duele, oye, pero...", translation_en: "Just touching that hair hurts, hey, but..." },
            { time: 84.0, text: "甘いな いやいや", romaji: "amai na iyaiya", translation_es: "es dulce, no, no...", translation_en: "it's sweet, no, no..." }
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
        start: "01:25",
        end: "01:55",
        focus: { es: "Expresiones abstractas", en: "Abstract expressions" },
        difficulty: 4,
        youtubeId: "o6wtDPVkKqI",
        lyrics: [
            { time: 85.0, text: "残酷な天使のテーゼ", romaji: "zankoku na tenshi no te-ze", translation_es: "La tesis de un ángel cruel", translation_en: "A cruel angel's thesis" },
            { time: 89.0, text: "窓辺からやがて飛び立つ", romaji: "madobe kara yagate tobitatsu", translation_es: "que pronto volará desde la ventana", translation_en: "will soon take flight from the window" },
            { time: 92.5, text: "ほとばしる熱いパトスで", romaji: "hotobashiru atsui patosu de", translation_es: "Con un ardiente y desbordante *pathos*", translation_en: "With a surging hot pathos" },
            { time: 96.0, text: "思い出を裏切るなら", romaji: "omoide wo uragiru nara", translation_es: "si vas a traicionar tus recuerdos", translation_en: "if you're going to betray your memories" },
            { time: 100.0, text: "この宇宙を抱いて輝く", romaji: "kono sora wo daite kagayaku", translation_es: "abraza este universo y brilla", translation_en: "embrace this universe and shine" },
            { time: 104.0, text: "少年よ 神話になれ", romaji: "shounen yo shinwa ni nare", translation_es: "¡Joven, conviértete en una leyenda!", translation_en: "Boy, become a myth!" }
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
        start: "01:22",
        end: "01:52",
        focus: { es: "Listening rápido + vocabulario avanzado", en: "Fast listening + advanced vocabulary" },
        difficulty: 4,
        youtubeId: "Y4nEEZwckuU",
        lyrics: [
            { time: 82.0, text: "ああ 知らず知らず隠してた", romaji: "aa shirazushirazu kakushiteta", translation_es: "Ah, lo escondía sin darme cuenta", translation_en: "Ah, I was hiding it without realizing" },
            { time: 87.0, text: "本当の声を響かせてよ さあ", romaji: "hontou no koe wo hibikasete yo saa", translation_es: "Haz resonar tu verdadera voz, vamos", translation_en: "Make your true voice echo, come on" },
            { time: 93.0, text: "見ないふりしていても", romaji: "minai furi shite ite mo", translation_es: "Aunque finjas no verlo", translation_en: "Even if you pretend not to see it" },
            { time: 96.0, text: "確かにそこにある", romaji: "tashika ni soko ni aru", translation_es: "Ciertamente está ahí", translation_en: "It is certainly there" }
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
        start: "01:05",
        end: "01:35",
        focus: { es: "Narrativa rápida + comprensión avanzada", en: "Fast narrative + advanced comprehension" },
        difficulty: 5,
        youtubeId: "x8VYWazR5mE",
        lyrics: [
            { time: 65.0, text: "沈むように溶けてゆくように", romaji: "shizumu you ni tokete yuku you ni", translation_es: "Como si nos hundiéramos, como si nos derritiéramos", translation_en: "Like sinking, like melting away" },
            { time: 68.5, text: "二人だけの空が広がる夜に", romaji: "futari dake no sora ga hirogaru yoru ni", translation_es: "En una noche donde el cielo se expande solo para nosotros dos", translation_en: "In a night where the sky spreads only for the two of us" },
            { time: 73.0, text: "「さよなら」だけだった", romaji: "\"sayonara\" dake datta", translation_es: "Fue solo un \"adiós\"", translation_en: "It was only a \"goodbye\"" },
            { time: 76.5, text: "その一言で全てが分かった", romaji: "sono hitokoto de subete ga wakatta", translation_es: "Con esa sola palabra lo entendí todo", translation_en: "With that one word I understood everything" }
        ],
        vocab: [
            { jp: "沈む", kana: "しずむ", romaji: "shizumu", en: "to sink", es: "hundirse" },
            { jp: "溶ける", kana: "とける", romaji: "tokeru", en: "to melt", es: "derretirse / disolverse" },
            { jp: "一言", kana: "ひとこと", romaji: "hitokoto", en: "single word", es: "una sola palabra" }
        ]
    },
    {
        level: "N1",
        title: "白日",
        artist: "King Gnu",
        start: "01:00",
        end: "01:30",
        focus: { es: "Vocabulario avanzado + interpretación", en: "Advanced vocabulary + interpretation" },
        difficulty: 5,
        youtubeId: "ony539T074w",
        lyrics: [
            { time: 60.0, text: "時には誰かを知らず知らずのうちに", romaji: "toki ni wa dareka wo shirazushirazu no uchi ni", translation_es: "A veces, sin darnos cuenta", translation_en: "Sometimes, without realizing it" },
            { time: 65.5, text: "傷つけてしまったり", romaji: "kizutsukete shimattari", translation_es: "terminamos lastimando a alguien", translation_en: "we end up hurting someone" },
            { time: 69.5, text: "失ったりして初めて", romaji: "ushinattari shite hajimete", translation_es: "y solo al perderlo por primera vez", translation_en: "and only upon losing them for the first time" },
            { time: 74.0, text: "犯した罪を知る", romaji: "okashita tsumi wo shiru", translation_es: "conocemos el pecado que hemos cometido", translation_en: "we realize the sin we committed" },
            { time: 78.5, text: "戻れないよ、昔のようには", romaji: "modorenai yo, mukashi no you ni wa", translation_es: "Ya no podemos regresar a como era antes", translation_en: "We can't go back to how it was before" }
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
        start: "00:55",
        end: "01:25",
        focus: { es: "Velocidad + emoción + listening complejo", en: "Speed + emotion + complex listening" },
        difficulty: 5,
        youtubeId: "7aMOurgDB-o",
        lyrics: [
            { time: 55.0, text: "教えて 教えてよ その仕組みを", romaji: "oshiete oshiete yo sono shikumi wo", translation_es: "Dime, dímelo, el mecanismo de eso", translation_en: "Tell me, tell me that mechanism" },
            { time: 57.0, text: "僕の中に", romaji: "boku no naka ni", translation_es: "dentro de mí", translation_en: "inside of me" },
            { time: 58.5, text: "誰がいるの?", romaji: "dare ga iru no?", translation_es: "¿quién está ahí?", translation_en: "who is there?" },
            { time: 60.0, text: "壊れた 壊れたよ この世界で", romaji: "kowareta kowareta yo kono sekai de", translation_es: "se rompió, se rompió en este mundo", translation_en: "it broke, it broke in this world" },
            { time: 62.0, text: "君が笑う", romaji: "kimi ga warau", translation_es: "tú sonríes", translation_en: "you smile" },
            { time: 63.5, text: "何も見えずに", romaji: "nani mo miezu ni", translation_es: "sin ver nada", translation_en: "without seeing anything" },
            { time: 65.0, text: "壊れた僕なんてさ", romaji: "kowareta boku nante sa", translation_es: "yo que estoy roto...", translation_en: "me, who is broken..." },
            { time: 67.0, text: "息を止めて", romaji: "iki wo tomete", translation_es: "deteniendo la respiración", translation_en: "holding my breath" },
            { time: 68.5, text: "Freeze", romaji: "Freeze", translation_es: "congela", translation_en: "freeze" },
            { time: 70.0, text: "壊せる 壊せない 狂える 狂えない", romaji: "kowaseru kowasenai kurueru kuruenai", translation_es: "puedo romper, no puedo, puedo enloquecer, no puedo", translation_en: "can break, can't break, can go mad, can't go mad" },
            { time: 72.5, text: "あなたを見つけて 揺れた", romaji: "anata wo mitsukete yureta", translation_es: "te encontré y temblé", translation_en: "I found you and trembled" },
            { time: 74.5, text: "歪んだ世界にだんだん 僕は", romaji: "yuganda sekai ni dandan boku wa", translation_es: "en el mundo distorsionado, poco a poco yo...", translation_en: "in this distorted world, gradually I..." },
            { time: 76.5, text: "透き通って見えなくなって", romaji: "sukitootte mienakunatte", translation_es: "me vuelvo transparente e invisible", translation_en: "become transparent and invisible" },
            { time: 78.5, text: "見つけないで 僕のことを", romaji: "mitsukenaide boku no koto wo", translation_es: "no me encuentres", translation_en: "don't find me" },
            { time: 80.0, text: "見つめないで", romaji: "mitsumenaide", translation_es: "no me mires", translation_en: "don't look at me" },
            { time: 81.5, text: "誰かが描いた世界の中で", romaji: "dareka ga egaita sekai no naka de", translation_es: "en el mundo que alguien dibujó", translation_en: "in the world someone drew" },
            { time: 83.0, text: "あなたを傷つけたくはないよ", romaji: "anata wo kizutsuketaku wa nai yo", translation_es: "no quiero lastimarte", translation_en: "I don't want to hurt you" },
            { time: 84.5, text: "覚えていて 僕のことを", romaji: "oboete ite boku no koto wo", translation_es: "recuérdame", translation_en: "remember me" }
        ],
        vocab: [
            { jp: "仕組み", kana: "しくみ", romaji: "shikumi", en: "mechanism / structure", es: "mecanismo / estructura" },
            { jp: "壊れる", kana: "こわれる", romaji: "kowareru", en: "to break / shatter", es: "romperse / hacerse pedazos" },
            { jp: "歪む", kana: "ゆがむ", romaji: "yugamu", en: "to distort / warp", es: "distorsionarse / torcerse" },
            { jp: "透き通る", kana: "すきとおる", romaji: "sukitooru", en: "to become transparent", es: "volverse transparente" },
            { jp: "傷つける", kana: "きずつける", romaji: "kizutsukeru", en: "to hurt / wound", es: "herir / lastimar" }
        ]
    }
];