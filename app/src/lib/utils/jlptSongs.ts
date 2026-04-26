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
        end: "01:35",
        focus: { es: "Intención y futuro", en: "Intent and future" },
        difficulty: 2,
        youtubeId: "jB7ecG_12x8", // ✅ CORREGIDO — Canal oficial Digimon (Digimon Adventure Opening Video)
        lyrics: [
            { time: 18.5, text: "ゴキゲンな蝶になって きらめく風に乗って", romaji: "gokigen na chou ni natte kirameku kaze ni notte", translation_es: "Convirtiéndome en una mariposa alegre, montando el viento resplandeciente.", translation_en: "Becoming a cheerful butterfly, riding the sparkling wind." },
            { time: 24.0, text: "今すぐ君に会いに行こう", romaji: "ima sugu kimi ni ai ni ikou", translation_es: "Iré a verte ahora mismo.", translation_en: "I'll go see you right now." },
            { time: 30.5, text: "余計なことなんて 忘れたほうがましさ", romaji: "yokei na koto nante wasureta hou ga mashi sa", translation_es: "Es mejor olvidar las cosas innecesarias.", translation_en: "It's better to forget about unnecessary things." },
            { time: 36.0, text: "これ以上 しゃれてる時間はない", romaji: "kore ijou shareteru jikan wa nai", translation_es: "No hay más tiempo para andarse con rodeos.", translation_en: "There's no more time for messing around." },
            { time: 42.0, text: "何が wow wow wow wow wow この空に届くのだろう", romaji: "nani ga wow wow wow wow wow kono sora ni todoku no darou", translation_es: "¿Qué será lo que llegará a este cielo?", translation_en: "I wonder what will reach this sky?" },
            { time: 47.8, text: "だけど wow wow wow wow wow 明日の予定もわからない", romaji: "dakedo wow wow wow wow wow ashita no yotei mo wakaranai", translation_es: "Pero ni siquiera sé qué haré mañana.", translation_en: "But I don't even know my plans for tomorrow." },
            { time: 56.5, text: "無限大な夢のあとの 何もない世の中じゃ", romaji: "mugendai na yume no ato no nani mo nai yo no naka ja", translation_es: "En este mundo vacío tras un sueño infinito.", translation_en: "In this empty world after an infinite dream." },
            { time: 63.0, text: "そうさ 愛しい思いも負けそうになるけど", romaji: "sou sa itoshii omoi mo makesou ni naru kedo", translation_es: "Sí, parece que hasta mis sentimientos más queridos van a perder, pero...", translation_en: "Yeah, even my beloved feelings seem like they're going to lose, but..." },
            { time: 68.0, text: "Stay しがちなイメージだらけの 頼りない翼でも", romaji: "Stay shigachi na imeeji darake no tayorinai tsubasa demo", translation_es: "Incluso con estas alas poco fiables, llenas de imágenes de estancamiento.", translation_en: "Even with these unreliable wings, full of images of staying still." },
            { time: 75.0, text: "きっと飛べるさ On my love", romaji: "kitto toberu sa On my love", translation_es: "Seguro que podré volar, con mi amor.", translation_en: "I'm sure I can fly, on my love." }
        ],
        vocab: [
            { jp: "蝶", kana: "ちょう", romaji: "chou", en: "butterfly", es: "mariposa" },
            { jp: "煌めく", kana: "きらめく", romaji: "kirameku", en: "to sparkle", es: "resplandecer" },
            { jp: "余計", kana: "よけい", romaji: "yokei", en: "unnecessary / extra", es: "innecesario" },
            { jp: "無限大", kana: "むげんだい", romaji: "mugendai", en: "infinite / limitless", es: "infinito" },
            { jp: "翼", kana: "つばさ", romaji: "tsubasa", en: "wings", es: "alas" }
        ]
    },

    // 🟡 Nivel N3 (Intermedio)
    {
        level: "N3",
        title: "紅蓮の弓矢",
        artist: "Linked Horizon",
        start: "00:00",
        end: "01:32",
        focus: { es: "Vocabulario de combate y épica", en: "Combat and epic vocabulary" },
        difficulty: 3,
        youtubeId: "AW5_k_Cf4wM", // ✅ TVアニメ「進撃の巨人」ノンクレジットOP
        lyrics: [
            { time: 0.5, text: "Seid ihr das Essen? Nein, wir sind der Jäger!", romaji: "Seid ihr das Essen? Nein, wir sind der Jäger!", translation_es: "¿Sois vosotros la comida? ¡No, nosotros somos los cazadores!", translation_en: "Are you the food? No, we are the hunters!" },
            { time: 15.0, text: "踏まれた花の 名前も知らずに", romaji: "fumareta hana no namae mo shirazu ni", translation_es: "Sin saber siquiera el nombre de la flor pisoteada.", translation_en: "Without even knowing the name of the trampled flower." },
            { time: 20.0, text: "地に堕ちた鳥は 風を待ちわびる", romaji: "chi ni ochita tori wa kaze wo machiwabiru", translation_es: "El ave que cayó a tierra espera ansiosa el viento.", translation_en: "The bird that fell to earth waits anxiously for the wind." },
            { time: 25.0, text: "祈ったところで 何も変わらない", romaji: "inotta tokoro de nanimo kawaranai", translation_es: "Por mucho que reces, nada cambiará.", translation_en: "No matter how much you pray, nothing will change." },
            { time: 31.0, text: "今を変えるのは 戦う覚悟だ", romaji: "ima wo kaeru no wa tatakau kakugo da", translation_es: "Lo único que puede cambiar el ahora es la determinación de luchar.", translation_en: "What changes the present is the determination to fight." },
            { time: 36.0, text: "屍踏み越えて 進む意志を 嗤う豚よ", romaji: "shikabane fumikoete susumu ishi wo warau buta yo", translation_es: "Cerdos que se ríen de la voluntad de avanzar sobre los cadáveres.", translation_en: "Oh pigs who mock the will to advance over corpses." },
            { time: 41.0, text: "家畜の安寧 虚偽の繁栄", romaji: "kachiku no an'nei kyogi no han'ei", translation_es: "La paz del ganado, la prosperidad de las mentiras.", translation_en: "The peace of livestock, the prosperity of lies." },
            { time: 44.0, text: "死せる餓狼の『自由』を！", romaji: "shiseru garou no 'jiyuu' wo!", translation_es: "¡La 'libertad' del lobo hambriento moribundo!", translation_en: "The 'freedom' of the dying hungry wolf!" },
            { time: 47.0, text: "囚われた屈辱は 反撃の嚆矢だ", romaji: "torawareta kutsujoku wa hangeki no koushi da", translation_es: "La humillación de estar atrapado es la flecha del contraataque.", translation_en: "The humiliation of being imprisoned is the opening arrow of the counterattack." },
            { time: 52.0, text: "城壁のその彼方 獲物を屠る イェーガー！", romaji: "jouheki no sono kanata emono wo hofuru Ieegaa!", translation_es: "Más allá de las murallas, masacra a la presa... ¡Jäger!", translation_en: "Beyond those castle walls, slaughter the prey... Jäger!" },
            { time: 57.0, text: "迸る衝動に その身を灼きながら", romaji: "hotobashiru shoudou ni sono mi wo yakinagara", translation_es: "Mientras ardes en ese impulso que brota.", translation_en: "While burning in that surging impulse." },
            { time: 63.0, text: "黄昏に緋を穿つ 紅蓮の弓矢", romaji: "tasogare ni hi wo ugatsu guren no yumiya", translation_es: "Perforando el carmesí en el crepúsculo, la flecha de loto carmesí.", translation_en: "Piercing the scarlet into the twilight, the crimson bow and arrow." }
        ],
        vocab: [
            { jp: "屍", kana: "しかばね", romaji: "shikabane", en: "corpse", es: "cadáver" },
            { jp: "家畜", kana: "かちく", romaji: "kachiku", en: "livestock", es: "ganado" },
            { jp: "自由", kana: "じゆう", romaji: "jiyuu", en: "freedom", es: "libertad" },
            { jp: "反撃", kana: "はんげき", romaji: "hangeki", en: "counterattack", es: "contraataque" },
            { jp: "紅蓮", kana: "ぐれん", romaji: "guren", en: "crimson / scarlet", es: "carmesí" }
        ]
    },
    {
        level: "N3",
        title: "FLY HIGH!!",
        artist: "BURNOUT SYNDROMES",
        start: "00:00",
        end: "01:27",
        focus: { es: "Superación y esfuerzo", en: "Overcoming and effort" },
        difficulty: 3,
        youtubeId: "txgg-fbVjf4", // ✅ MV oficial Epic Records Japan
        lyrics: [
            { time: 1.0, text: "飛べ FLY HIGH!! 汗と血と涙で", romaji: "tobe FLY HIGH!! ase to chi to namida de", translation_es: "¡Vuela, vuela alto! Con sudor, sangre y lágrimas.", translation_en: "Fly, FLY HIGH!! With sweat, blood, and tears." },
            { time: 7.0, text: "光る翼で今全部全部置き去って", romaji: "hikaru tsubasa de ima zenbu zenbu okizatte", translation_es: "Con alas brillantes, deja todo atrás ahora mismo.", translation_en: "With shining wings, leave everything behind right now." },
            { time: 11.5, text: "飛べ FLY 高く FLY 最果ての未来へ", romaji: "tobe FLY takaku FLY saihate no mirai e", translation_es: "Vuela, vuela alto, hacia el futuro más lejano.", translation_en: "Fly, fly high, toward the furthest future." },
            { time: 23.0, text: "傷だらけの若鳥が 空を睨んでる", romaji: "kizudarake no wakadori ga sora wo niranderu", translation_es: "Un ave joven cubierta de heridas mira fijamente al cielo.", translation_en: "A young bird covered in wounds is glaring at the sky." },
            { time: 33.0, text: "低空飛行する奴らが 嗤おうと 海の果てが見たい", romaji: "teikuu hikou suru yatsura ga waraou to umi no hate ga mitai", translation_es: "Aunque se rían los que vuelan bajo, quiero ver el fin del mar.", translation_en: "Even if those flying low mock me, I want to see the edge of the sea." },
            { time: 42.0, text: "心を無にして 向かい風に乗り 助走を付けて", romaji: "kokoro wo mu ni shite mukaikaze ni nori josou wo tsukete", translation_es: "Vaciando mi corazón, montando el viento en contra y tomando impulso.", translation_en: "Emptying my heart, riding the headwind and gaining speed." },
            { time: 52.0, text: "(Hop step jump で)", romaji: "(Hop step jump de)", translation_es: "(Con un salto, paso y brinco)", translation_en: "(With a hop, step, and jump)" },
            { time: 56.0, text: "飛べ FLY HIGH!! 汗と血と涙で", romaji: "tobe FLY HIGH!! ase to chi to namida de", translation_es: "¡Vuela, vuela alto! Con sudor, sangre y lágrimas.", translation_en: "Fly, FLY HIGH!! With sweat, blood, and tears." },
            { time: 62.0, text: "光る翼が君をどこへだって連れて行く", romaji: "hikaru tsubasa ga kimi wo doko e datte tsurete iku", translation_es: "Tus alas brillantes te llevarán a donde sea.", translation_en: "Those shining wings will take you anywhere." },
            { time: 66.0, text: "青い衝動と本能と爪牙を むき出しにして", romaji: "aoi shoudou to honnou to souga wo mukidashi ni shite", translation_es: "Exponiendo tu impulso azul, tu instinto y tus garras.", translation_en: "Baring your blue impulse, instinct, and fangs." },
            { time: 72.0, text: "艱難な旅路も 夢叶うまで 何度だって", romaji: "kannan na tabiji mo yume kanau made nando datte", translation_es: "Incluso en este viaje lleno de dificultades, hazlo cuantas veces sea necesario hasta que tu sueño se cumpla.", translation_en: "Even on this arduous journey, do it as many times as it takes until your dream comes true." },
            { time: 76.5, text: "飛べ FLY 高く FLY 最果ての未来へ", romaji: "tobe FLY takaku FLY saihate no mirai e", translation_es: "Vuela, vuela alto, hacia el futuro más lejano.", translation_en: "Fly, fly high, toward the furthest future." }
        ],
        vocab: [
            { jp: "翼", kana: "つばさ", romaji: "tsubasa", en: "wings", es: "alas" },
            { jp: "睨む", kana: "にらむ", romaji: "niramu", en: "to glare / stare at", es: "mirar fijamente / fulminar" },
            { jp: "衝動", kana: "しょうどう", romaji: "shoudou", en: "impulse / urge", es: "impulso" },
            { jp: "爪牙", kana: "そうが", romaji: "souga", en: "claws and fangs", es: "garras y colmillos" },
            { jp: "艱難", kana: "かんなん", romaji: "kannan", en: "hardship / trial", es: "dificultad / tribulación" }
        ]
    },
    {
        level: "N3",
        title: "Again",
        artist: "YUI",
        start: "00:00",
        end: "01:29",
        focus: { es: "Remordimiento y nuevos comienzos", en: "Regret and new beginnings" },
        difficulty: 3,
        youtubeId: "elyXcwunIYA", // ✅ Fullmetal Alchemist: Brotherhood OP1
        lyrics: [
            { time: 0.0, text: "この想いを消してしまうには まだ人生長いでしょ", romaji: "kono omoi wo keshite shimau ni wa mada jinsei nagai desho", translation_es: "Todavía queda mucha vida por delante como para borrar estos sentimientos.", translation_en: "You still have too long a life left to erase these feelings completely." },
            { time: 7.0, text: "やり残してること やり直してみたいから", romaji: "yarinokoshiteru koto yarinaoshite mitai kara", translation_es: "Porque quiero volver a intentar las cosas que dejé sin terminar.", translation_en: "Because I want to try redoing the things I left undone." },
            { time: 22.0, text: "夢のつづき 追いかけていたはずなのに", romaji: "yume no tsuzuki oikakete ita hazu na noni", translation_es: "A pesar de que se suponía que estaba persiguiendo la continuación de mi sueño.", translation_en: "Even though I was supposed to be chasing the continuation of my dream." },
            { time: 29.0, text: "曲がりくねった 細い道 人につまずく", romaji: "magarikunetta hosoi michi hito ni tsumazuku", translation_es: "Tropiezo con la gente en este camino estrecho y sinuoso.", translation_en: "I stumble over people on this narrow, winding road." },
            { time: 35.0, text: "あの頃みたいにって 戻りたいわけじゃないの", romaji: "ano koro mitai ni tte modoritai wake ja nai no", translation_es: "No es que quiera volver a ser como en aquellos días.", translation_en: "It's not that I want to go back to how things were then." },
            { time: 38.0, text: "無くしてきた空を 探してる", romaji: "nakushite kita sora wo sagashiteru", translation_es: "Estoy buscando el cielo que he perdido.", translation_en: "I'm searching for the sky I've lost." },
            { time: 42.0, text: "わかってくれますように 犠牲になったような", romaji: "wakatte kuremasu you ni gisei ni natta you na", translation_es: "Espero que lo entiendas, como si me hubiera convertido en un sacrificio.", translation_en: "I hope you understand, as if I had become a sacrifice." },
            { time: 45.0, text: "悲しい顔はやめてよ", romaji: "kanashii kao wa yamete yo", translation_es: "Deja de poner esa cara triste.", translation_en: "Stop making that sad face." },
            { time: 48.0, text: "罪の最後は涙じゃないよ ずっと苦しく背負ってくんだ", romaji: "tsumi no saigo wa namida ja nai yo zutto kurushiku seotte kun da", translation_es: "El final del pecado no son las lágrimas; es cargarlo con dolor para siempre.", translation_en: "The end of sin isn't tears; it's carrying it painfully forever." },
            { time: 52.0, text: "出口見えない感情迷路に 誰を待ってるの", romaji: "deguchi mienai kanjou meiro ni dare wo matteru no", translation_es: "¿A quién esperas en este laberinto emocional sin salida?", translation_en: "Who are you waiting for in this emotional maze with no exit?" },
            { time: 56.0, text: "白いノートに綴ったように もっと素直に吐き出したいよ", romaji: "shiroi nooto ni tsuzutta you ni motto sunao ni hakidashitai yo", translation_es: "Quiero expresarme con más honestidad, como si estuviera escribiendo en un cuaderno en blanco.", translation_en: "I want to speak out more honestly, like writing in a white notebook." },
            { time: 59.0, text: "何から 逃れたいんだ 現実ってやつ", romaji: "nani kara nogaretai nda genjitsu tte yatsu", translation_es: "¿De qué quieres escapar? De eso llamado realidad.", translation_en: "What do you want to escape from? That thing called reality." },
            { time: 62.0, text: "叶えるために 生きてるんだって 叫びたくなるよ 聞こえていますか", romaji: "kanaeru tame ni ikiteru nda tte sakebitaku naru yo kikoete imasu ka", translation_es: "Me dan ganas de gritar que vivo para cumplir mis deseos, ¿puedes oírme?", translation_en: "It makes me want to shout that I live to make them come true, can you hear me?" },
            { time: 69.0, text: "無難になんて やってられないから 帰る場所も無いの", romaji: "bunan ni nante yatterarenai kara kaeru basho mo nai no", translation_es: "No puedo simplemente ir a lo seguro, porque no tengo un lugar al que volver.", translation_en: "I can't just take it safe, because I have no place to go back to." },
            { time: 75.8, text: "優しさにはいつも感謝している だから強くなりたい (I'm on the way)", romaji: "yasashisa ni wa itsumo kansha shite iru dakara tsuyoku naritai (I'm on the way)", translation_es: "Siempre estoy agradecida por tu amabilidad, por eso quiero ser fuerte.", translation_en: "I'm always grateful for your kindness, that's why I want to be strong." },
            { time: 82.7, text: "懐かしくなる こんな痛みも歓迎じゃん", romaji: "natsukashiku naru konna itami mo kangei jan", translation_es: "Incluso este dolor que se siente nostálgico es bienvenido.", translation_en: "Even pain like this that becomes nostalgic is welcome." }
        ],
        vocab: [
            { jp: "想い", kana: "おもい", romaji: "omoi", en: "thought / feeling", es: "pensamiento / sentimiento" },
            { jp: "曲がりくねる", kana: "まがりくねる", romaji: "magarikuneru", en: "to wind / meander", es: "ser sinuoso / dar vueltas" },
            { jp: "犠牲", kana: "ぎせい", romaji: "gisei", en: "sacrifice", es: "sacrificio" },
            { jp: "迷路", kana: "めいろ", romaji: "meiro", en: "maze", es: "laberinto" },
            { jp: "叫ぶ", kana: "さけぶ", romaji: "sakebu", en: "to shout / yell", es: "gritar" }
        ]
    },

    // 🟠 Nivel N2 (Intermedio alto)
    {
        level: "N2",
        title: "午夜の待ち合わせ",
        artist: "Hello Sleepwalkers",
        start: "00:00",
        end: "01:30",
        focus: { es: "Vocabulario urbano y nocturno", en: "Urban and nightly vocabulary" },
        difficulty: 4,
        youtubeId: "36rkVIr_hsA", // ✅ MV oficial Hello Sleepwalkers (Full Version)
        lyrics: [
            { time: 10.5, text: "弾丸込めた小銃を 僕は片手に持っている", romaji: "dangan kometa shoujuu wo boku wa katate ni motte iru", translation_es: "Sostengo un fusil cargado con balas en una mano.", translation_en: "I'm holding a rifle loaded with bullets in one hand." },
            { time: 15.5, text: "震えた君の居る場所へ 足を早め向かっている", romaji: "furueta kimi no iru basho e ashi wo hayame mukatte iru", translation_es: "Me apresuro hacia el lugar donde estás tú, temblando.", translation_en: "I'm hurrying toward the place where you are, trembling." },
            { time: 20.0, text: "チクタク 針はチクタクと 焦る心を急かしただけ", romaji: "chikutaku hari wa chikutaku to aseru kokoro wo sekashita dake", translation_es: "Tic-tac, las manecillas solo apresuran mi corazón impaciente.", translation_en: "Tick-tock, the hands just hurried my impatient heart." },
            { time: 25.0, text: "チクタク 針はチクタクと 留まる気配もなく 進んでいく", romaji: "chikutaku hari wa chikutaku to todomaru kehai mo naku susunde iku", translation_es: "Tic-tac, las manecillas avanzan sin intención de detenerse.", translation_en: "Tick-tock, the hands advance without any sign of stopping." },
            { time: 31.0, text: "チクタク 針はチクタクと 終わりと始まりの境目", romaji: "chikutaku hari wa chikutaku to owari to hajimari no sakaime", translation_es: "Tic-tac, las manecillas marcan el límite entre el final y el comienzo.", translation_en: "Tick-tock, the hands mark the border between the end and the beginning." },
            { time: 36.0, text: "チクタク 針はチクタクと 全て重なった", romaji: "chikutaku hari wa chikutaku to subete kasanatta", translation_es: "Tic-tac, las manecillas... todo se superpuso.", translation_en: "Tick-tock, the hands... everything overlapped." },
            { time: 41.0, text: "並行して 僕は待っていた", romaji: "hekoushite, boku wa matteita", translation_es: "En paralelo, yo estaba esperando.", translation_en: "In parallel, I was waiting." },
            { time: 43.0, text: "薄暗い部屋 一人きり", romaji: "usugurai heya, hitori kiri", translation_es: "Solo en una habitación tenuemente iluminada.", translation_en: "Alone in a dimly lit room." },
            { time: 46.0, text: "並行して 僕は待っていた", romaji: "hekoushite, boku wa matteita", translation_es: "En paralelo, yo estaba esperando.", translation_en: "In parallel, I was waiting." },
            { time: 48.0, text: "ドアを蹴破る その音を", romaji: "doa wo keyaburu, sono oto wo", translation_es: "El sonido de la puerta siendo derribada.", translation_en: "The sound of the door being kicked in." },
            { time: 51.0, text: "並行して 僕が待っていた", romaji: "hekoushite, boku ga matteita", translation_es: "En paralelo, yo era quien estaba esperando.", translation_en: "In parallel, I was the one waiting." },
            { time: 53.0, text: "薄暗い部屋 一人きり", romaji: "usugurai heya, hitori kiri", translation_es: "Solo en una habitación tenue.", translation_en: "Alone in a dim room." },
            { time: 56.0, text: "並行して 僕が待っていた", romaji: "hekoushite, boku ga matteita", translation_es: "En paralelo, yo estaba esperando.", translation_en: "In parallel, I was waiting." },
            { time: 58.0, text: "もう恐れることはないよ", romaji: "mou osoreru koto wa nai yo", translation_es: "Ya no hay nada que temer.", translation_en: "There's nothing left to fear." },
            { time: 61.0, text: "弾丸込めた小銃を持って", romaji: "dangan kometa shoujuu wo motte", translation_es: "Con un fusil cargado en mano,", translation_en: "Holding a rifle loaded with bullets," },
            { time: 63.5, text: "固く閉ざされたドアを蹴破った", romaji: "kataku tozasareta doa wo keyabutta", translation_es: "derribé la puerta firmemente cerrada.", translation_en: "I kicked down the tightly shut door." },
            { time: 66.0, text: "吸い付いた銃口が跳ねて", romaji: "suitsuita juukou ga hanete", translation_es: "El cañón adherido rebotó,", translation_en: "The clinging gun muzzle bounced," },
            { time: 69.0, text: "昨日の僕を貫いた", romaji: "kinou no boku wo tsuranuita", translation_es: "y atravesó al yo de ayer.", translation_en: "and pierced the me of yesterday." },
            { time: 71.0, text: "おやすみ その絶望を受け取って", romaji: "oyasumi, sono zetsubou wo uketotte", translation_es: "Buenas noches, acepta esa desesperación.", translation_en: "Good night, accept that despair." },
            { time: 74.0, text: "明日への僕は歩き始めた", romaji: "ashita he no boku wa aruki hajimeta", translation_es: "El yo del mañana comenzó a caminar.", translation_en: "The me of tomorrow started to walk." },
            { time: 77.0, text: "また今夜待ち合わせよう", romaji: "mata kon'ya machiawase you", translation_es: "Volvamos a encontrarnos esta noche.", translation_en: "Let's meet again tonight." },
        ],
        vocab: [
            { jp: "弾丸", kana: "だんがん", romaji: "dangan", en: "bullet", es: "bala" },
            { jp: "小銃", kana: "しょうじゅう", romaji: "shoujuu", en: "rifle / small arms", es: "fusil" },
            { jp: "境目", kana: "さかいめ", romaji: "sakaime", en: "border / boundary", es: "límite / frontera" },
            { jp: "絶望", kana: "ぜつぼう", romaji: "zetsubou", en: "despair", es: "desesperación" },
            { jp: "貫く", kana: "つらぬく", romaji: "tsuranuku", en: "to pierce through", es: "atravesar" }
        ]
    },
    {
        level: "N2",
        title: "Re:Re:",
        artist: "ASIAN KUNG-FU GENERATION",
        start: "00:00",
        end: "01:29",
        focus: { es: "Pasado y arrepentimiento", en: "Past and regret" },
        difficulty: 4,
        youtubeId: "fodAJ-1dN3I", // ✅ verificado
        lyrics: [
            { time: 13.0, text: "君を待った 僕は待った 途切れない明日も過ぎて行って", romaji: "kimi wo matta boku wa matta togirenai ashita mo sugite itte", translation_es: "Te esperé, te esperé, mientras los mañanas ininterrumpidos seguían pasando.", translation_en: "I waited for you, I waited, as the continuous tomorrows kept passing by." },
            { time: 19.0, text: "立ち止まって振り返って とめどない hoy を嘆き合った", romaji: "tachidomatte furikaette tomedonai kyou wo nagekiatta", translation_es: "Deteniéndome y mirando atrás, lamentamos juntos este hoy sin fin.", translation_en: "Stopping and looking back, we lamented this endless today together." },
            { time: 25.0, text: "記憶だって永遠になんて 残らないものと思い知って", romaji: "kioku datte eien ni nante nokoranai mono to omoishitte", translation_es: "Comprendiendo que incluso los recuerdos no son algo que dure para siempre.", translation_en: "Realizing that even memories aren't something that remains forever." },
            { time: 31.0, text: "僕はずっと掻きむしって 心の隅っこで泣いた", romaji: "boku wa zutto kakimushitte kokoro no sumikko de naita", translation_es: "Me desgarré por dentro y lloré en un rincón de mi corazón.", translation_en: "I kept tearing at myself and cried in a corner of my heart." },
            { time: 36.5, text: "そしてどうかなくさないでよって 高架下、過ぎる日々を", romaji: "soshite douka nakusanaide yo tte koukashita sugiru hibi wo", translation_es: "Y rogando: 'por favor, no los pierdas', a los días que pasan bajo el paso elevado.", translation_en: "And pleading 'please don't lose them', to the days passing under the elevated tracks." },
            { time: 44.0, text: "後悔してんだよってそう言い逃したあの日", romaji: "koukai shite nda yo tte sou iinogashita ano hi", translation_es: "Diciendo: 'me arrepiento', aquel día que perdí la oportunidad de hablar.", translation_en: "Saying 'I regret it', that day I missed the chance to say it." },
            { time: 50.0, text: "君を待った 僕は待った 途切れない明日も過ぎて行って", romaji: "kimi wo matta boku wa matta togirenai ashita mo sugite itte", translation_es: "Te esperé, te esperé, mientras los mañanas ininterrumpidos seguían pasando.", translation_en: "I waited for you, I waited, as the continuous tomorrows kept passing by." },
            { time: 56.0, text: "僕は今日も掻きむしって 忘れない傷をつけているんだよ", romaji: "boku wa kyou mo kakimushitte wasurenai kizu wo tsukete iru nda yo", translation_es: "Hoy también me desgarro, dejándome una herida que no olvidaré.", translation_en: "Today too I'm tearing at myself, leaving a wound I'll never forget." },
            { time: 67.0, text: "君じゃないとさ", romaji: "kimi ja nai to sa", translation_es: "Si no eres tú...", translation_en: "If it's not you..." }
        ],
        vocab: [
            { jp: "途切れる", kana: "とぎれる", romaji: "togireru", en: "to be interrupted / break off", es: "interrumpirse / cortarse" },
            { jp: "嘆く", kana: "なげく", romaji: "nageku", en: "to lament / grieve", es: "lamentar / llorar" },
            { jp: "掻きむしる", kana: "かきむしる", romaji: "kakimushiru", en: "to tear at / scratch hard", es: "desgarrar / arañar con fuerza" },
            { jp: "後悔", kana: "こうかい", romaji: "koukai", en: "regret / remorse", es: "arrepentimiento / remordimiento" },
            { jp: "言い逃す", kana: "いいのがす", romaji: "iinogasu", en: "to miss the chance to say", es: "perder la oportunidad de decir" }
        ]
    },
    {
        level: "N2",
        title: "unravel",
        artist: "TK from 凛として時雨",
        start: "00:00",
        end: "01:25",
        focus: { es: "Psicología y distorsión", en: "Psychology and distortion" },
        difficulty: 4,
        youtubeId: "7aMOurgDB-o", // ✅ Tokyo Ghoul OP (TV Size)
        lyrics: [
            { time: 0.0, text: "教えて 教えてよ その仕組みを 僕の中に誰がいるの?", romaji: "oshiete oshiete yo sono shikumi wo boku no naka ni dare ga iru no?", translation_es: "Dime, dime cómo funciona esto, ¿quién hay dentro de mí?", translation_en: "Tell me, tell me how it works, who is inside of me?" },
            { time: 14.0, text: "壊れた 壊れたよ この世界で 君が笑う 何も見えずに", romaji: "kowareta kowareta yo kono sekai de kimi ga warau nani mo miezu ni", translation_es: "Se rompió, se rompió este mundo en el que tú te ríes sin ver nada.", translation_en: "It broke, this world broke where you laugh without seeing anything." },
            { time: 41.0, text: "壊れた僕なんてさ 息を止めて", romaji: "kowareta boku nante sa iki wo tomete", translation_es: "Alguien tan roto como yo... deteniendo el aliento.", translation_en: "Someone as broken as me... holding my breath." },
            { time: 47.0, text: "Freeze", romaji: "Freeze", translation_es: "Congélate", translation_en: "Freeze" },
            { time: 48.0, text: "壊せる 壊せない 狂える 狂えない あなたを見つけて 揺れた", romaji: "kowaseru kowasenai kurueru kuruenai anata wo mitsukete yureta", translation_es: "Puedo romperlo, no puedo, puedo enloquecer, no puedo; te encontré y mi mundo tembló.", translation_en: "I can break it, I can't, I can go mad, I can't; I found you and I wavered." },
            { time: 55.0, text: "歪んだ世界にだんだん 僕は透き通って見えなくなって", romaji: "yuganda sekai ni dandan boku wa sukitootte mienakunatte", translation_es: "En este mundo distorsionado, poco a poco me vuelvo transparente hasta desaparecer.", translation_en: "In this distorted world, I'm gradually becoming transparent and invisible." },
            { time: 62.0, text: "見つけないで 僕のことを 見つめないで", romaji: "mitsukenaide boku no koto wo mitsumenaide", translation_es: "No me encuentres, no me mires fijamente.", translation_en: "Don't find me, don't look at me." },
            { time: 69.0, text: "誰かが描いた世界の中で あなたを傷つけたくはないよ", romaji: "dareka ga egaita sekai no naka de anata wo kizutsuketaku wa nai yo", translation_es: "En este mundo que alguien dibujó, no quiero herirte.", translation_en: "In this world that someone drew, I don't want to hurt you." },
            { time: 76.5, text: "覚えていて 僕のことを", romaji: "oboete ite boku no koto wo", translation_es: "Recuérdame, por favor.", translation_en: "Please, remember me." }
        ],
        vocab: [
            { jp: "仕組み", kana: "しくみ", romaji: "shikumi", en: "mechanism / structure", es: "mecanismo / estructura" },
            { jp: "狂う", kana: "くるう", romaji: "kuruu", en: "to go mad / go insane", es: "enloquecer / volverse loco" },
            { jp: "揺れる", kana: "ゆれる", romaji: "yureru", en: "to shake / sway", es: "temblar / oscilar" },
            { jp: "歪む", kana: "ゆがむ", romaji: "yugamu", en: "to be distorted / warped", es: "distorsionarse / torcerse" },
            { jp: "透き通る", kana: "すきとおる", romaji: "sukitooru", en: "to be transparent", es: "ser transparente / traslúcido" }
        ]
    },

    // 🔴 Nivel N1 (Avanzado)
    {
        level: "N1",
        title: "廻廻奇譚",
        artist: "Eve",
        start: "00:00",
        end: "01:30",
        focus: { es: "Vocabulario abstracto y complejo", en: "Abstract and complex vocabulary" },
        difficulty: 5,
        youtubeId: "v8bZVdTgXoY", // ✅ MV oficial Eve (Full Version)
        lyrics: [
            { time: 18.0, text: "有象無象 人の成り 虚聖深傷 人外もののけみたいだ", romaji: "uzou muzou hito no nari kyosei shinshou jingai mononoke mitai da", translation_es: "La gente corriente, las heridas profundas de la falsa santidad; parece algo inhumano, un mononoke.", translation_en: "The masses, the deep wounds of false holiness; it's like something inhuman, a mononoke." },
            { time: 23.0, text: "虚心坦懐 命宿し あとはぱっぱらぱな中身なき人間", romaji: "kyoshin tankai inochi yadoshi ato wa pappara pa na nakami naki ningen", translation_es: "Con la mente abierta, albergando vida; el resto son humanos vacíos y atolondrados.", translation_en: "With an open mind, harboring life; the rest are empty, light-headed humans." },
            { time: 29.0, text: "寄せる期待 不平等な人生 才能もない 大乗非日常が", romaji: "yoseru kitai fubyoudou na jinsei sainou mo nai daijou hi nichijou ga", translation_es: "Expectativas que se acercan, una vida desigual; lo extraordinario de lo cotidiano sin talento.", translation_en: "Approaching expectations, an unequal life; the extraordinary in the everyday without talent." },
            { time: 34.0, text: "怨親平等に没個性 辿る記憶 僕に居場所などないから", romaji: "onshin byoudou ni botsu kosei tadoru kioku boku ni ibasho nado nai kara", translation_es: "Tratando a todos por igual sin individualidad; siguiendo recuerdos, porque no tengo un lugar al que pertenecer.", translation_en: "Treating everyone equally without individuality; tracing memories, because I have no place to belong." },
            { time: 40.0, text: "夢の狭間で泣いてないで どんな顔すればいいか分かってる", romaji: "yume no hazama de naitenaide donna kao sureba ii ka wakatteru", translation_es: "No llores en la brecha entre los sueños; sé qué cara poner.", translation_en: "Don't cry in the gap between dreams; I know what kind of face to make." },
            { time: 45.0, text: "だけどまだ応えてくれよ", romaji: "dakedomada kotaete kure yo", translation_es: "Pero todavía tienes que responder", translation_en: "But you still have to answer me" },
            { time: 48.0, text: "闇を祓って 闇を祓って 夜の帳が下りたら合図だ", romaji: "yami wo haratte yami wo haratte yoru no tobari ga oritara aizu da", translation_es: "Exorciza la oscuridad, exorciza la oscuridad; cuando baje el velo de la noche, será la señal.", translation_en: "Exorcise the darkness, exorcise the darkness; when the veil of night falls, it's the signal." },
            { time: 53.5, text: "相対して回る感情線 戯言などは吐き捨て行けと", romaji: "aitai shite mawaru kanjousen zaregoto nado wa hakisute ike to", translation_es: "Enfrentándome a las líneas emocionales que giran; vete escupiendo las tonterías.", translation_en: "Facing the revolving emotional lines; go while spitting out the nonsense." },
            { time: 58.5, text: "まだ止めないで まだ止めないで 誰よりも聡くある街に生まれしこの正体を", romaji: "mada tomenaide mada tomenaide dare yori mo satoku aru machi ni umareshi kono shoutai wo", translation_es: "No te detengas todavía, no te detengas todavía; esta identidad nacida en una ciudad más sabia que ninguna.", translation_en: "Don't stop yet, don't stop yet; this identity born in a city wiser than any other." },
            { time: 66.0, text: "今はただ呪い呪われた僕の未来を創造して", romaji: "ima wa tada noroi norowareta boku no mirai wo souzou shite", translation_es: "Ahora solo crea mi futuro, maldito y lleno de maldiciones.", translation_en: "Now just create my future, cursed and full of curses." },
            { time: 71.0, text: "走って転んで 消えない痛み抱いては 世界が待ってる この一瞬を", romaji: "hashitte koronde kienai itami daite wa sekai ga matteru kono isshun wo", translation_es: "Corriendo, tropezando, abrazando un dolor que no desaparece; el mundo espera este instante.", translation_en: "Running, stumbling, embracing an unvanishing pain; the world is waiting for this moment." },
        ],
        vocab: [
            { jp: "有象無象", kana: "うぞうむぞう", romaji: "uzoumuzou", en: "the masses / riffraff", es: "la gente corriente / chusma" },
            { jp: "虚心坦懐", kana: "きょしんたんかい", romaji: "kyoshintankai", en: "with an open mind", es: "con la mente abierta" },
            { jp: "不平等", kana: "ふびょうどう", romaji: "fubyoudou", en: "inequality / unfairness", es: "desigualdad / injusticia" },
            { jp: "聡い", kana: "さとい", romaji: "satoi", en: "clever / sharp / wise", es: "sabio / agudo / inteligente" },
            { jp: "呪い", kana: "のろい", romaji: "noroi", en: "curse", es: "maldición" },
            { jp: "想像", kana: "そうぞう", romaji: "souzou", en: "imagination / creation", es: "imaginación / creación" }
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
];