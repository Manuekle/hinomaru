export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export interface LyricLine {
    time: number;          // segundos desde video start (absoluto)
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
    youtubeId: string;     // YouTube video ID (verificado y funcional)
    lyrics: LyricLine[];   // timestamped lyrics for the clip
    vocab?: SongVocab[];   // 3–5 key vocabulary words
}

export function parseTime(mmss: string): number {
    const [m, s] = mmss.split(':').map(Number);
    return m * 60 + s;
}

export const jlptSongs: SongLesson[] = [
    // 🟢 Nivel N5 (Muy básico)
    {
        level: "N5",
        title: "アンパンマンのマーチ",
        artist: "ドリーミング",
        start: "00:00",
        end: "01:10",
        focus: { es: "Frases de aliento y propósito", en: "Encouragement and purpose" },
        difficulty: 1,
        youtubeId: "5mLape5F0Fw",
        lyrics: [
            { time: 3.0, text: "そうだ おそれないで みんなのために 愛と勇気だけが ともだちさ", romaji: "sou da osorenaide minna no tame ni ai to yuuki dake ga tomodachi sa", translation_es: "¡Así es! No tengas miedo, hazlo por todos. El amor y el valor son tus únicos amigos.", translation_en: "Yes, that’s right! Don’t be afraid Stand up for everyone Only love and your courage will be your friend" },
            { time: 23.0, text: "なにが君の しあわせ なにをして よろこぶ", romaji: "nani ga kimi no shiawase nani wo shite yorokobu", translation_es: "¿Qué es lo que te hace feliz? ¿Qué es lo que te da alegría?", translation_en: "Do you know what your happiness is? Do you know what brings you joy?" },
            { time: 28.0, text: "わからないまま おわる そんなのは いやだ！", romaji: "wakaranai mama owaru sonna no wa iya da!", translation_es: "No quiero terminar sin haberlo descubierto.", translation_en: "If you don’t know ‘til the end You can’t stand it, no, no!" },
            { time: 33.0, text: "忘れないで 夢を こぼさないで 涙 だから 君は とぶんだ どこまでも", romaji: "wasurenaide yume wo kobosanaide namida dakara kimi wa tobunda doko made mo", translation_es: "No olvides tus sueños ni derrames tus lágrimas; por eso volarás a donde quieras.", translation_en: "Don’t forget you have a dream Don’t you shed anymore tears That is why you fly away to" },
            { time: 40.0, text: "どこまでも そうだ おそれないで みんなのために", romaji: "doko made mo sou da osorenaide minna no tame ni", translation_es: "A donde quieras. ¡Así es! No tengas miedo, hazlo por todos.", translation_en: "Anywhere you want Yes, that’s right! Don’t be afraid Stand up for everyone" },
            { time: 48.0, text: "愛と勇気だけが ともだちさ ああ アンパンマン", romaji: "ai to yuuki dake ga tomodachi sa aa Anpanman", translation_es: "El amor y el valor son tus únicos amigos. ¡Ah, ah! Anpanman.", translation_en: "Only love and your courage will be your friend Ah, ah! Anpanman" },
            { time: 55.0, text: "優しい君は 行け！みんなの夢 まもるため", romaji: "yasashii kimi wa ike! minna no yume mamoru tame", translation_es: "Tú que eres tan amable, ¡ve! Ve a proteger los sueños de todos.", translation_en: "You have such a loving heart Go! Go! You go on to save all our dreams" }
        ],
        vocab: [
            { jp: "幸せ", kana: "しあわせ", romaji: "shiawase", en: "happiness", es: "felicidad" },
            { jp: "喜び", kana: "よろこび", romaji: "yorokobi", en: "joy", es: "alegría" },
            { jp: "夢", kana: "ゆめ", romaji: "yume", en: "dream", es: "sueño" },
            { jp: "涙", kana: "なみだ", romaji: "namida", en: "tears", es: "lágrimas" },
            { jp: "守る", kana: "まもる", romaji: "mamoru", en: "to protect", es: "proteger" }
        ]
    },
    {
        level: "N5",
        title: "おどるポンポコリン",
        artist: "Ado",
        start: "00:00",
        end: "01:25",
        focus: { es: "Onomatopeyas y vocabulario cotidiano", en: "Onomatopoeia and everyday vocabulary" },
        difficulty: 1,
        youtubeId: "TZYqDl19qLQ",
        lyrics: [
            { time: 14.0, text: "なんでもかんでも みんな おどっているよ", romaji: "nan demo kan demo minna odotte iru yo", translation_es: "Cualquier cosa, todo el mundo está bailando.", translation_en: "Anything and everything, everyone is dancing." },
            { time: 21.0, text: "おなべの中から ボワっと インチキおじさん 登場", romaji: "onabe no naka kara bowatto inchiki ojisan toujou", translation_es: "Desde adentro de la olla, ¡puf! aparece el hombre tramposo.", translation_en: "From inside the pot, poof! The phony old man appears." },
            { time: 30.0, text: "いつだって 忘れない エジソンは 偉い人", romaji: "itsu datte wasurenai Ejison wa erai hito", translation_es: "Siempre recordaremos que Edison fue un gran hombre.", translation_en: "We'll never forget that Edison was a great man." },
            { time: 35.0, text: "そんなの常識 タッタタラリラ", romaji: "sonna no joushiki tatta tararira", translation_es: "Eso es de sentido común. ¡Tatta-tararira!", translation_en: "That's just common sense. Tatta-tararira!" },
            { time: 40.0, text: "ピーヒャラ ピーヒャラ パッパパラパ", romaji: "piihyara piihyara pappaparapa", translation_es: "¡Pii-hyara pii-hyara! ¡Pappa-parapa!", translation_en: "Pii-hyara pii-hyara! Pappa-parapa!" },
            { time: 50.0, text: "おどるポンポコリン ピーヒャラ ピー", romaji: "odoru ponpokorin piihyara pii", translation_es: "Bailando el Ponpokorin, pii-hyara pii.", translation_en: "Dancing the Ponpokorin, pii-hyara pii." },
            { time: 55.0, text: "おなかがへったよ", romaji: "onaka ga hetta yo", translation_es: "Tengo hambre.", translation_en: "I'm hungry." }
        ],
        vocab: [
            { jp: "踊る", kana: "おどる", romaji: "odoru", en: "to dance", es: "bailar" },
            { jp: "登場", kana: "とうじょう", romaji: "toujou", en: "appearance", es: "aparición" },
            { jp: "常識", kana: "じょうしき", romaji: "joushiki", en: "common sense", es: "sentido común" },
            { jp: "偉い", kana: "えらい", romaji: "erai", en: "great / admirable", es: "admirable / gran persona" },
            { jp: "お腹が空く", kana: "おなかがすく", romaji: "onaka ga suku", en: "to get hungry", es: "tener hambre" }
        ]
    },
    {
        level: "N5",
        title: "ウィーアー！ (We Are!)",
        artist: "きただにひろし",
        start: "00:30",
        end: "01:51",
        focus: { es: "Verbos de movimiento y búsqueda", en: "Verbs of movement and search" },
        difficulty: 1,
        youtubeId: "0OdExTY2D8M",
        lyrics: [
            { time: 30.0, text: "ありったけの夢をかき集め 捜し物を捜しに行くのさ ONE PIECE!", romaji: "arittake no yume wo kakiatsume sagashimono wo sagashi ni yuku no sa ONE PIECE!", translation_es: "Reuniendo todos mis sueños, voy en busca de lo que estoy buscando. ¡One Piece!", translation_en: "Gathering all my dreams, I'm going in search of what I'm looking for. One Piece!" },
            { time: 48.0, text: "羅針盤なんて 渋滞のもと 熱にうかされ 舵をとるのさ", romaji: "rashinban nante juutai no moto netsu ni ukasare kaji wo toru no sa", translation_es: "Una brújula solo causaría retrasos, así que tomo el timón guiado por mi pasión.", translation_en: "A compass would only cause delays, so I take the helm driven by my passion." },
            { time: 59.0, text: "ホコリかぶってた 宝の地図も 確かめたのなら 伝説じゃない！", romaji: "hokori kabutteta takara no chizu mo tashikameta no nara densetsu ja nai!", translation_es: "Si confirmamos ese mapa del tesoro lleno de polvo, dejará de ser una leyenda.", translation_en: "If we confirm that dusty treasure map, it won't be a legend anymore." },
            { time: 72.0, text: "個人的な嵐は 誰かの バイオリズム乗っかって 思い過ごせばいい！", romaji: "kojinteki na arashi wa dareka no baiorizumu nokkatte omoisugoseba ii!", translation_es: "Si una tormenta personal llega, solo súbete al biorritmo de alguien más y déjala pasar.", translation_en: "If a personal storm comes, just ride someone else's biorhythm and let it pass." },
            { time: 86.0, text: "ありったけの夢をかき集め 捜し物を捜しに行くのさ", romaji: "arittake no yume wo kakiatsume sagashimono wo sagashi ni yuku no sa", translation_es: "Reuniendo todos mis sueños, voy en busca de lo que estoy buscando.", translation_en: "Gathering all my dreams, I'm going in search of what I'm looking for." },
            { time: 97.0, text: "ポケットのコイン それと you wanna be my friend?", romaji: "poketto no koin soreto you wanna be my friend?", translation_es: "Monedas en el bolsillo, y además... ¿quieres ser mi amigo?", translation_en: "Coins in my pocket, and besides... you wanna be my friend?" },
            { time: 103.0, text: "We are, we are on the cruise! ウィーアー！", romaji: "We are, we are on the cruise! Wiiaa!", translation_es: "¡Estamos, estamos en el crucero! ¡WE ARE!", translation_en: "We are, we are on the cruise! WE ARE!" }
        ],
        vocab: [
            { jp: "夢", kana: "ゆめ", romaji: "yume", en: "dream", es: "sueño" },
            { jp: "捜す", kana: "さがす", romaji: "sagasu", en: "to search for", es: "buscar" },
            { jp: "宝", kana: "たから", romaji: "takara", en: "treasure", es: "tesoro" },
            { jp: "地図", kana: "ちず", romaji: "chizu", en: "map", es: "mapa" },
            { jp: "伝説", kana: "でんせつ", romaji: "densetsu", en: "legend", es: "leyenda" }
        ]
    },

    // 🟢 Nivel N4 (Básico)
    {
        level: "N4",
        title: "ブルーバード",
        artist: "いきものがかり",
        start: "00:00",
        end: "01:29",
        focus: { es: "Expresiones de vuelo y libertad", en: "Expressions of flight and freedom" },
        difficulty: 3,
        youtubeId: "KpsJWFuVTdI", // ✅ verificado
        lyrics: [
            { time: 1.0, text: "羽ばたいたら 戻れないと言って 目指したのは 蒼い 蒼い あの空", romaji: "habataitara modorenai to itte mezashita no wa aoi aoi ano sora", translation_es: "Dijiste que al volar no volverías. Lo que buscabas era aquel cielo azul, tan azul.", translation_en: "You said if you spread your wings, you can't come back. What you aimed for was that blue, blue sky." },
            { time: 26.0, text: "悲しみはまだ覚えられず 切なさは今つかみはじめた", romaji: "kanashimi wa mada oboerarezu setsunasa wa ima tsukami hajimeta", translation_es: "Aún no puedo recordar la tristeza, pero he empezado a comprender la nostalgia.", translation_en: "I can't yet remember 'sadness', but I've started to grasp 'pain'." },
            { time: 32.0, text: "あなたへと抱くこの感情も 今言葉に変わっていく", romaji: "anata e to idaku kono kanjou mo ima kotoba ni kawatte iku", translation_es: "Este sentimiento que tengo por ti, ahora se está convirtiendo en palabras.", translation_en: "This feeling I have for you is now turning into words." },
            { time: 39.0, text: "未知なる世界の夢から目覚めて この羽を広げ飛び立つ", romaji: "michi naru sekai no yume kara mezamete kono hane wo hiroge tobitatsu", translation_es: "Despertando del sueño de un mundo desconocido, extiendo mis alas y emprendo el vuelo.", translation_en: "Waking from a dream of an unknown world, I spread these wings and fly away." },
            { time: 51.0, text: "羽ばたいたら 戻れないと言って 目指したのは 白い 白い あの雲", romaji: "habataitara modorenai to itte mezashita no wa shiroi shiroi ano kumo", translation_es: "Dijiste que al volar no volverías. Lo que buscabas era aquella nube blanca, tan blanca.", translation_en: "You said if you spread your wings, you can't come back. What you aimed for was that white, white cloud." },
            { time: 64.0, text: "突き抜けたら 見つかると知って 振り切るほど 蒼い 蒼い あの空", romaji: "tsukinuketara mitsukaru to shitte furikiru hodo aoi aoi ano sora", translation_es: "Sabiendo que lo encontraré si lo atravieso, aquel cielo azul, tan azul, que parece sacudirse de encima.", translation_en: "Knowing I'll find it if I break through, that blue, blue sky, enough to shake everything off." },
            { time: 77.0, text: "蒼い 蒼い あの空 蒼い 蒼い あの空", romaji: "aoi aoi ano sora aoi aoi ano sora", translation_es: "Aquel cielo azul, tan azul. Aquel cielo azul, tan azul.", translation_en: "That blue, blue sky. That blue, blue sky." }
        ],
        vocab: [
            { jp: "羽ばたく", kana: "はばたく", romaji: "habataku", en: "to flap wings", es: "aletear" },
            { jp: "目指す", kana: "めざす", romaji: "mezasu", en: "to aim for", es: "apuntar a" },
            { jp: "切なさ", kana: "せつなさ", romaji: "setsunasa", en: "sadness / pain", es: "tristeza / dolor emocional" },
            { jp: "鼓動", kana: "こどう", romaji: "kodou", en: "heartbeat", es: "latido / pulsación" },
            { jp: "飛び立つ", kana: "とびたつ", romaji: "tobitatsu", en: "to take flight", es: "emprender el vuelo" }
        ]
    },
    {
        level: "N4",
        title: "光るなら (Hikaru Nara)",
        artist: "Goose house",
        start: "00:04.5",
        end: "01:33",
        focus: { es: "Estados emocionales y naturaleza", en: "Emotional states and nature" },
        difficulty: 2,
        youtubeId: "IeJTNN8_jLI",
        lyrics: [
            { time: 21.5, text: "雨上がりの虹も 凛と咲いた花も", romaji: "ameagari no niji mo rin to saita hana mo", translation_es: "Tanto el arcoíris tras la lluvia como la flor que floreció valiente.", translation_en: "Both the rainbow after the rain and the flower that bloomed bravely." },
            { time: 28.0, text: "色付きあふれだす 茜色の空 仰ぐ君に あの日恋に落ちた", romaji: "irozuki afuredasu akaneiro no sora aogu kimi ni ano hi koi ni ochita", translation_es: "Aquel día me enamoré de ti, mientras mirabas el cielo carmesí que se llenaba de colores.", translation_en: "That day I fell in love with you, as you looked up at the crimson sky filling with color." },
            { time: 45.0, text: "瞬間のドラマティック フィルムの中のひとこまも", romaji: "shunkan no doramatikku firumu no naka no hitokoma mo", translation_es: "Incluso este momento es dramático, como una escena en una película.", translation_en: "Even this moment is dramatic, like a scene in a film." },
            { time: 51.0, text: "消えないよ 心に刻むから", romaji: "kienai yo kokoro ni kizamu kara", translation_es: "No desaparecerá, porque lo grabaré en mi corazón.", translation_en: "It won't disappear, because I'll carve it into my heart." },
            { time: 60.0, text: "君だよ 君なんだよ 教えてくれた", romaji: "kimi da yo kimi nan da yo oshiete kureta", translation_es: "Eres tú, eres tú quien me lo enseñó.", translation_en: "It's you, it was you who taught me." },
            { time: 66.0, text: "暗闇も光るなら 星空になる", romaji: "kurayami mo hikaru nara hoshizora ni naru", translation_es: "Si la oscuridad también brilla, se convertirá en un cielo estrellado.", translation_en: "If even the darkness shines, it'll become a starry sky." },
            { time: 72.0, text: "悲しみを笑顔に もう隠さないで", romaji: "kanashimi wo egao ni mou kakusanaide", translation_es: "Convirtiendo la tristeza en sonrisas, ya no la escondas más.", translation_en: "Turning sadness into smiles, don't hide it anymore." },
            { time: 78.0, text: "煌めく どんな星も 君を照らすから", romaji: "kirameku donna hoshi mo kimi wo terasu kara", translation_es: "Porque cualquier estrella que brille te iluminará.", translation_en: "Because any star that sparkles will shine on you." },
            { time: 86.0, text: "眠りも忘れて 迎えた朝日が", romaji: "nemuri mo wasurete mukaeta asahi ga", translation_es: "Olvidando el sueño, el sol de la mañana que recibí.", translation_en: "Forgetting sleep, the morning sun I greeted." },
        ],
        vocab: [
            { jp: "光る", kana: "ひかる", romaji: "hikaru", en: "to shine", es: "brillar" },
            { jp: "星空", kana: "ほしぞら", romaji: "hoshizora", en: "starry sky", es: "cielo estrellado" },
            { jp: "笑顔", kana: "えがお", romaji: "egao", en: "smile", es: "sonrisa" },
            { jp: "瞬間", kana: "しゅんかん", romaji: "shunkan", en: "moment / instant", es: "momento / instante" },
            { jp: "震える", kana: "ふるえる", romaji: "furueru", en: "to tremble", es: "temblar" }
        ]
    },
    {
        level: "N4",
        title: "Butter-Fly",
        artist: "和田光司",
        start: "00:00",
        end: "01:00",
        focus: { es: "Intención y futuro", en: "Intent and future" },
        difficulty: 2,
        youtubeId: "32JTFI0alPk", // ✅ CORREGIDO — Canal oficial Digimon (Digimon Adventure Opening Video)
        lyrics: [
            { time: 10.0, text: "ゴキゲンな蝶になって きらめく風に乗って", romaji: "gokigen na chou ni natte kirameku kaze ni notte", translation_es: "Convirtiéndome en una mariposa alegre, montando el viento resplandeciente", translation_en: "Becoming a cheerful butterfly, riding the sparkling wind" },
            { time: 18.0, text: "今すぐ キミに会いに行こう", romaji: "ima sugu kimi ni ai ni ikou", translation_es: "Iré a verte ahora mismo", translation_en: "I'll go see you right now" },
            { time: 24.0, text: "余計な事なんて 忘れた方がマシさ", romaji: "yokei na koto nante wasureta hou ga mashi sa", translation_es: "Es mejor olvidar las cosas innecesarias", translation_en: "It's better to forget about unnecessary things" }
        ],
        vocab: [
            { jp: "蝶", kana: "ちょう", romaji: "chou", en: "butterfly", es: "mariposa" },
            { jp: "煌めく", kana: "きらめく", romaji: "kirameku", en: "to sparkle", es: "resplandecer" },
            { jp: "余計", kana: "よけい", romaji: "yokei", en: "unnecessary / extra", es: "innecesario / de más" }
        ]
    },

    // 🟡 Nivel N3 (Intermedio)
    {
        level: "N3",
        title: "Catch the Moment",
        artist: "LiSA",
        start: "00:00",
        end: "01:00",
        focus: { es: "Atesorar el presente", en: "Treasuring the present" },
        difficulty: 3,
        youtubeId: "LJkn2qqtijk", // ✅ CORREGIDO — Canal oficial LiSA, full MV
        lyrics: [
            { time: 10.0, text: "あと何回キミと笑えるの？", romaji: "ato nankai kimi to waraeru no?", translation_es: "¿Cuántas veces más podré reír contigo?", translation_en: "How many more times can I laugh with you?" },
            { time: 15.0, text: "不確かな未来ならば いらない", romaji: "futashika na mirai naraba iranai", translation_es: "Si es un futuro incierto, no lo quiero", translation_en: "If it's an uncertain future, I don't need it" }
        ],
        vocab: [
            { jp: "笑える", kana: "わらえる", romaji: "waraeru", en: "can laugh", es: "poder reír" },
            { jp: "不確か", kana: "ふたしか", romaji: "futashika", en: "uncertain", es: "incierto" }
        ]
    },
    {
        level: "N3",
        title: "紅蓮の弓矢",
        artist: "Linked Horizon",
        start: "00:00",
        end: "01:00",
        focus: { es: "Vocabulario de combate y épica", en: "Combat and epic vocabulary" },
        difficulty: 3,
        youtubeId: "8OkpRK2_gU8", // ✅ verificado
        lyrics: [
            { time: 60.0, text: "踏まれた花の 名前も知らずに", romaji: "fumareta hana no namae mo shirazu ni", translation_es: "Sin saber siquiera el nombre de la flor pisoteada", translation_en: "Without even knowing the name of the trampled flower" },
            { time: 65.0, text: "地に堕ちた鳥は 風を待ちわびる", romaji: "chi ni ochita tori wa kaze wo machiwabiru", translation_es: "El ave que cayó a tierra espera ansiosa el viento", translation_en: "The bird that fell to earth waits anxiously for the wind" }
        ],
        vocab: [
            { jp: "踏む", kana: "ふむ", romaji: "fumu", en: "to step on", es: "pisar" },
            { jp: "堕ちる", kana: "おちる", romaji: "ochiru", en: "to fall", es: "caer" },
            { jp: "待ちわびる", kana: "まちわびる", romaji: "machiwabiru", en: "to wait anxiously", es: "esperar con ansias" }
        ]
    },
    {
        level: "N3",
        title: "FLY HIGH!!",
        artist: "BURNOUT SYNDROMES",
        start: "00:00",
        end: "01:00",
        focus: { es: "Superación y esfuerzo", en: "Overcoming and effort" },
        difficulty: 3,
        youtubeId: "txgg-fbVjf4", // ✅ MV oficial Epic Records Japan
        lyrics: [
            { time: 10.0, text: "飛べ FLY HIGH!! 汗と血と涙の", romaji: "tobe FLY HIGH!! ase to chi to namida no", translation_es: "¡Vuela, vuela alto! De sudor, sangre y lágrimas", translation_en: "Fly, FLY HIGH!! Of sweat, blood, and tears" }
        ],
        vocab: [
            { jp: "飛ぶ", kana: "とぶ", romaji: "tobu", en: "to fly", es: "volar" },
            { jp: "汗", kana: "あせ", romaji: "ase", en: "sweat", es: "sudor" }
        ]
    },
    {
        level: "N3",
        title: "Again",
        artist: "YUI",
        start: "00:00",
        end: "01:00",
        focus: { es: "Remordimiento y nuevos comienzos", en: "Regret and new beginnings" },
        difficulty: 3,
        youtubeId: "MLfMrBfqCu8", // ✅ MV oficial YUI
        lyrics: [
            { time: 5.0, text: "この想いを消してしまうには まだ早すぎるわ", romaji: "kono omoi wo keshite shimau ni wa mada hayasugiru wa", translation_es: "Es demasiado pronto para borrar estos sentimientos", translation_en: "It's too early to erase these feelings" }
        ],
        vocab: [
            { jp: "想い", kana: "おもい", romaji: "omoi", en: "thought / feeling", es: "pensamiento / sentimiento" },
            { jp: "消す", kana: "けす", romaji: "kesu", en: "to erase / extinguish", es: "borrar / apagar" }
        ]
    },

    // 🟠 Nivel N2 (Intermedio alto)
    {
        level: "N2",
        title: "午夜の待ち合わせ",
        artist: "Hello Sleepwalkers",
        start: "00:00",
        end: "01:00",
        focus: { es: "Vocabulario urbano y nocturno", en: "Urban and nightly vocabulary" },
        difficulty: 4,
        youtubeId: "J69oCCM1EcI", // ✅ MV oficial Hello Sleepwalkers (Noragami OP)
        lyrics: [
            { time: 10.0, text: "午前零時を過ぎた頃 待ち合わせ場所で", romaji: "gozen reiji wo sugita koro machiawase basho de", translation_es: "Cerca de las doce de la noche, en el lugar de encuentro", translation_en: "Around midnight, at the meeting place" }
        ],
        vocab: [
            { jp: "午前零時", kana: "ごぜんれいじ", romaji: "gozenreiji", en: "midnight", es: "medianoche" },
            { jp: "待ち合わせ", kana: "まちあわせ", romaji: "machiawase", en: "meeting / appointment", es: "encuentro / cita" }
        ]
    },
    {
        level: "N2",
        title: "Re:Re:",
        artist: "ASIAN KUNG-FU GENERATION",
        start: "00:00",
        end: "01:00",
        focus: { es: "Pasado y arrepentimiento", en: "Past and regret" },
        difficulty: 4,
        youtubeId: "vRP5j8ne_9s", // ✅ verificado
        lyrics: [
            { time: 60.0, text: "君を待った 僕は待った", romaji: "kimi wo matta boku wa matta", translation_es: "Te esperé, yo esperé", translation_en: "I waited for you, I waited" }
        ],
        vocab: [
            { jp: "待つ", kana: "まつ", romaji: "matsu", en: "to wait", es: "esperar" }
        ]
    },
    {
        level: "N2",
        title: "unravel",
        artist: "TK from 凛として時雨",
        start: "00:00",
        end: "01:00",
        focus: { es: "Psicología y distorsión", en: "Psychology and distortion" },
        difficulty: 4,
        youtubeId: "7aMOurgDB-o", // ✅ verificado
        lyrics: [
            { time: 0.0, text: "教えて教えてよ その仕組みを", romaji: "oshiete oshiete yo sono shikumi wo", translation_es: "Dime, dime cómo funciona esto", translation_en: "Tell me, tell me the way it works" }
        ],
        vocab: [
            { jp: "教える", kana: "おしえる", romaji: "oshieru", en: "to tell / teach", es: "contar / enseñar" },
            { jp: "仕組み", kana: "しくみ", romaji: "shikumi", en: "mechanism / structure", es: "mecanismo / estructura" }
        ]
    },

    // 🔴 Nivel N1 (Avanzado)
    {
        level: "N1",
        title: "廻廻奇譚",
        artist: "Eve",
        start: "00:00",
        end: "01:00",
        focus: { es: "Vocabulario abstracto y complejo", en: "Abstract and complex vocabulary" },
        difficulty: 5,
        youtubeId: "1tk1pqwrOys", // ✅ MV oficial Eve (Jujutsu Kaisen OP)
        lyrics: [
            { time: 10.0, text: "闇を祓って 闇を祓って", romaji: "yami wo haratte yami wo haratte", translation_es: "Exorcizando la oscuridad, expulsando la oscuridad", translation_en: "Exorcising the darkness, driving out the darkness" }
        ],
        vocab: [
            { jp: "闇", kana: "やみ", romaji: "yami", en: "darkness", es: "oscuridad" },
            { jp: "祓う", kana: "はらう", romaji: "harau", en: "to exorcise / drive away", es: "exorcizar / expulsar" }
        ]
    },
    {
        level: "N1",
        title: "アイドル",
        artist: "YOASOBI",
        start: "00:00",
        end: "01:00",
        focus: { es: "Crítica social y fama", en: "Social criticism and fame" },
        difficulty: 5,
        youtubeId: "ZRtdQ81jPUQ", // ✅ verificado
        lyrics: [
            { time: 5.0, text: "無敵の笑顔で荒らすメディア", romaji: "muteki no egao de arasu media", translation_es: "Arrasando los medios con una sonrisa invencible", translation_en: "Wrecking the media with an invincible smile" }
        ],
        vocab: [
            { jp: "無敵", kana: "むてき", romaji: "muteki", en: "invincible", es: "invencible" }
        ]
    },
    {
        level: "N1",
        title: "紅蓮華",
        artist: "LiSA",
        start: "00:00",
        end: "01:00",
        focus: { es: "Fortaleza y superación", en: "Strength and overcoming" },
        difficulty: 5,
        youtubeId: "mpwigqY7570", // ✅ verificado
        lyrics: [
            { time: 5.0, text: "強くなれる理由を知った", romaji: "tsuyoku nareru riyuu wo shitta", translation_es: "He conocido la razón por la que puedo volverme fuerte", translation_en: "I've learned the reason I can become strong" }
        ],
        vocab: [
            { jp: "理由", kana: "りゆう", romaji: "riyuu", en: "reason", es: "razón" }
        ]
    },
    {
        level: "N1",
        title: "残酷な天使のテーゼ",
        artist: "高橋洋子",
        start: "00:00",
        end: "01:00",
        focus: { es: "Metáforas religiosas y filosóficas", en: "Religious and philosophical metaphors" },
        difficulty: 5,
        youtubeId: "o6wtDPVkKqI", // ✅ verificado
        lyrics: [
            { time: 86.0, text: "残酷な天使のテーゼ", romaji: "zankoku na tenshi no te-ze", translation_es: "La tesis de un ángel cruel", translation_en: "A cruel angel's thesis" }
        ],
        vocab: [
            { jp: "残酷", kana: "ざんこく", romaji: "zankoku", en: "cruel", es: "cruel" }
        ]
    },
    {
        level: "N1",
        title: "The Rumbling",
        artist: "SiM",
        start: "00:00",
        end: "01:00",
        focus: { es: "Caos y destrucción", en: "Chaos and destruction" },
        difficulty: 5,
        youtubeId: "OBqw818mQ1E", // ✅ MV oficial SiM (Attack on Titan Final Season Part 2)
        lyrics: [
            { time: 10.0, text: "RUMBLING, RUMBLING, IT'S COMING!", romaji: "rumbling, rumbling, it's coming", translation_es: "¡El retumbar, el retumbar, ya viene!", translation_en: "Rumbling, rumbling, it's coming!" }
        ],
        vocab: [
            { jp: "来る", kana: "くる", romaji: "kuru", en: "to come", es: "venir" }
        ]
    }
];