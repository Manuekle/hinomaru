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
    // 🟢 N5
    {
        level: "N5",
        title: "ありがとう",
        artist: "いきものがかり",
        start: "00:00",
        end: "06:00",
        focus: { es: "Expresiones básicas y agradecimiento", en: "Basic expressions and gratitude" },
        difficulty: 1,
        youtubeId: "VZBU8LvZ91Q",  // Official MV - Verificado ✓
        lyrics: [
            { time: 15.0, text: "「ありがとう」って伝えたくて あなたを見つめるけど", romaji: "arigatou tte tsutaetakute anata wo mitsumeru kedo", translation_es: "Quiero decirte 'gracias' mientras te miro, pero...", translation_en: "I want to tell you 'thank you' while I look at you, but..." },
            { time: 45.0, text: "まぶしい朝に 苦笑いしてさ", romaji: "mabushii asa ni nigawarai shite sa", translation_es: "Sonriendo con amargura en la mañana deslumbrante", translation_en: "Smiling wryly in the dazzling morning" },
            { time: 68.0, text: "「ありがとう」って伝えたくて あなたを見つめるけど", romaji: "arigatou tte tsutaetakute anata wo mitsumeru kedo", translation_es: "Quiero decirte 'gracias' mientras te miro, pero...", translation_en: "I want to tell you 'thank you' while I look at you, but..." },
            { time: 99.0, text: "でこぼこなまま 積み上げてきた", romaji: "dekoboko na mama tsumiagete kita", translation_es: "Hemos ido construyendo esto, aun con sus altibajos", translation_en: "We've been building this up, even with all the bumps" },
            { time: 122.0, text: "「あなたの夢」がいつからか…", romaji: "anata no yume ga itsu kara ka", translation_es: "Desde cuándo tus sueños se volvieron...", translation_en: "Since when your dreams became..." },
            { time: 135.0, text: "今日だって いつか 大切な 瞬間", romaji: "kyou datte itsuka taisetsu na shunkan", translation_es: "Incluso el día de hoy se volverá un momento importante algún día", translation_en: "Even today will become a precious moment someday" },
            { time: 145.0, text: "青空も 泣き空も 晴れわたるように", romaji: "aozora mo nakizora mo harewataru you ni", translation_es: "Para que tanto el cielo azul como el cielo de llanto se despejen", translation_en: "So that both the blue sky and the crying sky clear up" },
            { time: 166.0, text: "「ありがとう」って伝えたくて あなたを見つめるけど", romaji: "arigatou tte tsutaetakute anata wo mitsumeru kedo", translation_es: "Quiero decirte 'gracias' mientras te miro, pero...", translation_en: "I want to tell you 'thank you' while I look at you, but..." },
            { time: 197.0, text: "いつまでも ただ いつまでも あなたと笑っていたいから", romaji: "itsu mademo tada itsu mademo anata to waratte itai kara", translation_es: "Porque quiero estar riendo contigo para siempre", translation_en: "Because I want to keep laughing with you forever" },
            { time: 242.0, text: "ケンカした日も 泣きあった日も", romaji: "kenka shita hi mo naki atta hi mo", translation_es: "Tanto los días que peleamos como los días que lloramos juntos", translation_en: "Both the days we fought and the days we cried together" },
            { time: 264.0, text: "真っ白なこころに 描かれた未来を", romaji: "masshiro na kokoro ni egakareta mirai wo", translation_es: "El futuro dibujado en un corazón puramente blanco", translation_en: "The future drawn on a pure white heart" },
            { time: 285.0, text: "「ありがとう」って伝えたくて あなたを見つめるけど", romaji: "arigatou tte tsutaetakute anata wo mitsumeru kedo", translation_es: "Quiero decirte 'gracias' mientras te miro, pero...", translation_en: "I want to tell you 'thank you' while I look at you, but..." },
            { time: 316.0, text: "いつまでも ただ いつまでも あなたと笑っていたいから", romaji: "itsu mademo tada itsu mademo anata to waratte itai kara", translation_es: "Porque quiero estar riendo contigo para siempre", translation_en: "Because I want to keep laughing with you forever" }
        ],
        vocab: [
            { jp: "伝える", kana: "つたえる", romaji: "tsutaeru", en: "to convey / tell", es: "transmitir / comunicar" },
            { jp: "見つめる", kana: "みつめる", romaji: "mitsumeru", en: "to stare at", es: "mirar fijamente" },
            { jp: "優しい", kana: "やさしい", romaji: "yasashii", en: "kind / gentle", es: "amable / gentil" },
            { jp: "瞬間", kana: "しゅんかん", romaji: "shunkan", en: "moment", es: "momento" },
            { jp: "大切", kana: "たいせつ", romaji: "taisetsu", en: "important / precious", es: "importante / valioso" }
        ]
    },
    {
        level: "N5",
        title: "恋するフォーチュンクッキー",
        artist: "AKB48",
        start: "00:45",
        end: "04:55",
        focus: { es: "Frases repetitivas y vocabulario cotidiano", en: "Repetitive phrases and everyday vocabulary" },
        difficulty: 1,
        youtubeId: "dFf4AgBNR1E",  // Official MV - Verificado ✓
        lyrics: [
            { time: 48.0, text: "あなたのことが好きなのに 私に興味はないみたい", romaji: "anata no koto ga suki na no ni watashi ni kyoumi wa nai mitai", translation_es: "Aunque me gustas, parece que no tienes interés en mí", translation_en: "Although I love you so, you do not care at all" },
            { time: 55.0, text: "何回目かの失恋の準備 Yeah! Yeah! Yeah!", romaji: "nankaime ka no shitsuren no junbi Yeah! Yeah! Yeah!", translation_es: "Preparándome para mi enésimo desamor", translation_en: "Again I prepare a logbook of my lost loves Yeah! Yeah! Yeah!" },
            { time: 63.0, text: "まわりを見れば大勢の 可愛いコたちがいるんだもん", romaji: "mawari wo mireba oozei no kawaii ko-tachi ga irun da mon", translation_es: "Si miro a mi alrededor, hay un montón de chicas lindas", translation_en: "Just looking around I see many pretty girls" },
            { time: 71.0, text: "地味な花は気づいてくれない Yeah! Yeah! Yeah!", romaji: "jimi na hana wa kizuite kurenai Yeah! Yeah! Yeah!", translation_es: "Nadie se fija en una flor tan sencilla", translation_en: "I'm shadowed, and nobody cares Yeah! Yeah! Yeah!" },
            { time: 80.0, text: "カフェテリアに流れるMusic ぼんやり聴いていたら", romaji: "kafeteria ni nagareru Music bonyari kiite itara", translation_es: "Escuchaba distraída la música que sonaba en la cafetería", translation_en: "Sound of music in cafeteria I was hearing absent-minded" },
            { time: 88.0, text: "知らぬ間にリズムに合わせて つま先から動き出す", romaji: "shiranu ma ni rizumu ni awasete tsumasaki kara ugokidasu", translation_es: "Sin darme cuenta, mis pies empezaron a moverse al ritmo", translation_en: "Then my tiptoe began to move unconsciously along the music" },
            { time: 95.0, text: "止められない今の気持ち カモン カモン カモン カモン ベイビー 占ってよ", romaji: "tomerarenai ima no kimochi kamon kamon kamon kamon beibi- uranatte yo", translation_es: "No puedo contener este sentimiento, vamos, vamos, léeme la fortuna", translation_en: "I can't hold my emotion any more Come on, come on, come on, come on Baby Tell me my fortune" },
            { time: 103.0, text: "恋するフォーチュンクッキー! 未来は そんな悪くないよ", romaji: "koisuru fo-chun kukki-! mirai wa sonna warukunai yo", translation_es: "¡Galleta de la fortuna enamorada! El futuro no es tan malo", translation_en: "Fortune cookie in love Future Won't be that bad" },
            { time: 114.0, text: "Hey! Hey! Hey! ツキを呼ぶには 笑顔を見せること", romaji: "Hey! Hey! Hey! tsuki wo yobu ni wa egao wo miseru koto", translation_es: "¡Hey! ¡Hey! ¡Hey! Para atraer la suerte, hay que mostrar una sonrisa", translation_en: "Hey! Hey! Hey! To capture good luck Show a smile" },
            { time: 123.0, text: "ハートのフォーチュンクッキー 運勢 今日よりも良くしよう", romaji: "haato no fo-chun kukki- unsei kyou yori mo yoku shiyou", translation_es: "Galleta de la fortuna de mi corazón, hagamos que la suerte sea mejor que hoy", translation_en: "Fortune cookie of my heart Fortune Make it better than today" },
            { time: 132.0, text: "Hey! Hey! Hey! Hey! Hey! Hey! 人生捨てたもんじゃないよね", romaji: "Hey! Hey! Hey! Hey! Hey! Hey! jinsei suteta mon janai yo ne", translation_es: "La vida no es tan miserable, ¿verdad?", translation_en: "Hey! Hey! Hey! Hey! Hey! Hey! Life is not so miserable" },
            { time: 140.0, text: "あっと驚く奇跡が起きる あなたとどこかで愛し合える予感", romaji: "atto odoroku kiseki ga okiru anata to dokoka de aishiaeru yokan", translation_es: "Un milagro sorprendente ocurrirá, tengo el presentimiento de que nos amaremos en algún lugar", translation_en: "Amazing miracle may happen Feeling of loving each other, somewhere" },
            { time: 152.0, text: "告白したいけど 自分に自信がないの", romaji: "kokuhaku shitai kedo jibun ni jishin ga nai no", translation_es: "Quiero confesarme, pero no tengo confianza en mí misma", translation_en: "I want to confess clearly But I'm not so confident of myself" },
            { time: 160.0, text: "リアクション 想像しちゃうから Yeah! Yeah! Yeah!", romaji: "riakushon souzou shichau kara Yeah! Yeah! Yeah!", translation_es: "Porque me imagino tu reacción", translation_en: "Coz. I can imagine your reaction Yeah! Yeah! Yeah!" },
            { time: 168.0, text: "性格いいコがいいなんて 男のコは言うけれど", romaji: "seikaku ii ko ga ii nante otoko no ko wa iu keredo", translation_es: "Aunque los chicos dicen que lo importante es tener buen carácter", translation_en: "Though boys say Good nature is important" },
            { time: 176.0, text: "ルックスがアドバンテージ いつだって可愛いコが", romaji: "rukkusu ga adobante-ji itsudatte kawaii ko ga", translation_es: "La apariencia siempre es una ventaja, las chicas lindas siempre...", translation_en: "Appearance is always an advantage Pretty girls are" },
            { time: 183.0, text: "選ばれる 1位になる お願い お願い お願い 占い師 私も見てよ", romaji: "erabareru ichii ni naru onegai onegai onegai uranaishi watashi mo mite yo", translation_es: "son elegidas como la opción número uno, por favor léeme la fortuna a mí también", translation_en: "Always selected No.1 choice Please, please, please, Oh Baby Look at me, too" },
            { time: 196.0, text: "恋するフォーチュンクッキー! その殻 さあ壊してみよう", romaji: "koisuru fo-chun kukki-! sono kara saa kowashite miyou", translation_es: "¡Galleta de la fortuna enamorada! Vamos a romper ese cascarón", translation_en: "Fortune cookie in love! Break the shell Let's break it now!" },
            { time: 202.0, text: "Hey! Hey! Hey! 先のことなんて 誰もわからない", romaji: "Hey! Hey! Hey! saki no koto nante daremo wakaranai", translation_es: "¡Hey! ¡Hey! ¡Hey! Nadie sabe qué pasará después", translation_en: "Hey! Hey! Hey! Even God won't know What's coming next" },
            { time: 212.0, text: "涙のフォーチュンクッキー そんなにネガティブにならずに", romaji: "namida no fo-chun kukki- sonna ni negateibu ni narazu ni", translation_es: "Galleta de la fortuna de lágrimas, no seas tan negativa", translation_en: "Fortune cookie in tears Don't take it So negative" },
            { time: 221.0, text: "Hey! Hey! Hey! Hey! Hey! Hey! 世界は愛で溢れているよ", romaji: "Hey! Hey! Hey! Hey! Hey! Hey! sekai wa ai de afurete iru yo", translation_es: "El mundo está lleno de amor", translation_en: "Hey! Hey! Hey! Hey! Hey! Hey! The world is filled with love" },
            { time: 228.0, text: "悲しいことなんて 忘れてしまう明日への風が 吹くはずさ", romaji: "kanashii koto nante wasurete shimau ashita e no kaze ga fuku hazu sa", translation_es: "Olvidarás las tristezas, soplara un viento hacia el mañana", translation_en: "And let us forget sadness By the new wind that will blow tomorrow" },
            { time: 246.0, text: "カモン カモン カモン カモン ベイビー 占ってよ 恋するフォーチュンクッキー!", romaji: "kamon kamon kamon kamon beibi- uranatte yo koisuru fo-chun kukki-!", translation_es: "Vamos, vamos, vamos, vamos baby, léeme la fortuna, ¡galleta de la fortuna enamorada!", translation_en: "Come on, come on, come on, come on Baby Tell me my fortune Fortune cookie in love!" },
            { time: 255.0, text: "未来は そんな悪くないよ Hey! Hey! Hey!", romaji: "mirai wa sonna warukunai yo Hey! Hey! Hey!", translation_es: "El futuro no es tan malo ¡Hey! ¡Hey! ¡Hey!", translation_en: "Future Won't be that bad Hey! Hey! Hey!" },
            { time: 261.0, text: "ツキを呼ぶには 笑顔を見せること ハートのフォーチュンクッキー", romaji: "tsuki wo yobu ni wa egao wo miseru koto haato no fo-chun kukki-", translation_es: "Para atraer la suerte, hay que mostrar una sonrisa, galleta de la fortuna de mi corazón", translation_en: "To capture good luck Show a smile Fortune cookie of my heart" },
            { time: 271.0, text: "運勢 今日よりも良くしよう Hey! Hey! Hey! Hey! Hey! Hey!", romaji: "unsei kyou yori mo yoku shiyou Hey! Hey! Hey! Hey! Hey! Hey!", translation_es: "Hagamos que la suerte sea mejor que hoy", translation_en: "Fortune Make it better than today Hey! Hey! Hey! Hey! Hey! Hey!" },
            { time: 280.0, text: "人生捨てたもんじゃないよね あっと驚く奇跡が起きる", romaji: "jinsei suteta mon janai yo ne atto odoroku kiseki ga okiru", translation_es: "La vida no es tan miserable, un milagro sorprendente ocurrirá", translation_en: "Life is not so miserable Amazing miracle may happen" },
            { time: 287.0, text: "あなたとどこかで愛し合える予感", romaji: "anata to dokoka de aishiaeru yokan", translation_es: "Tengo el presentimiento de que nos amaremos en algún lugar", translation_en: "Feeling of loving each other, somewhere" }
        ],
        vocab: [
            { jp: "恋する", kana: "こいする", romaji: "koisuru", en: "to fall in love", es: "enamorarse" },
            { jp: "未来", kana: "みらい", romaji: "mirai", en: "future", es: "futuro" },
            { jp: "笑顔", kana: "えがお", romaji: "egao", en: "smile", es: "sonrisa" },
            { jp: "占う", kana: "うらなう", romaji: "uranau", en: "to tell fortune", es: "predecir el futuro" },
            { jp: "奇跡", kana: "きせき", romaji: "kiseki", en: "miracle", es: "milagro" }
        ]
    },
    {
        level: "N5",
        title: "ドラえもん",
        artist: "星野源",
        start: "00:00",
        end: "04:00",
        focus: { es: "Vocabulario simple y pronunciación", en: "Simple vocabulary and pronunciation" },
        difficulty: 1,
        youtubeId: "ypRTzt1KrF8",  // Official Video - Verificado ✓
        lyrics: [
            { time: 10.66, text: "少しだけ不思議な普段のお話", romaji: "sukoshi dake fushigi na fudan no ohanashi", translation_es: "Una historia cotidiana un poco misteriosa", translation_en: "A slightly mysterious everyday story" },
            { time: 16.30, text: "指先と机の間に事件、落ちこぼれた君も、できすぎあの子も、同じ雲下で暮らした事件", romaji: "yubisaki to tsukue no aida ni jiken ochikoboreta kimi mo dekisugi ano ko mo onaji kumo shita de kurashita jiken", translation_es: "Un incidente entre la punta de los dedos y el escritorio; tanto tú que te quedaste atrás como ese niño tan perfecto vivieron bajo la misma nube", translation_en: "An incident between fingertips and desk; both you who fell behind and that overachieving child lived under the same cloud" },
            { time: 34.0, text: "そこに落っこちる機械だって、涙を流して震えながら勇気を叫ぶだろう", romaji: "soko ni okkochiru kikai datte namida wo nagashite furue nagara yuuki wo sakebu darou", translation_es: "Incluso una máquina que caiga allí derramará lágrimas y, mientras tiembla, gritará con valor", translation_en: "Even a machine that falls there would shed tears and shout with courage while trembling" },
            { time: 50.60, text: "だからここにおいでよ", romaji: "dakara koko ni oide yo", translation_es: "Así que ven aquí", translation_en: "So come here" },
            { time: 53.38, text: "一緒に冒険しよう", romaji: "isshou ni bouken shiyou", translation_es: "Vamos a tener una aventura juntos", translation_en: "Let's have an adventure together" },
            { time: 57.18, text: "何者でもなくても、世界を救おう", romaji: "nanimono demo nakute mo sekai wo sukuou", translation_es: "Aunque no seamos nadie, salvemos el mundo", translation_en: "Even if we are nobody, let's save the world" },
            { time: 62.64, text: "いつか時が流れて必ずたどり着くから、君に会えるよ", romaji: "itsuka toki ga nagarete kanarazu tadoritsuku kara kimi ni aeru yo", translation_es: "Algún día, cuando pase el tiempo, llegaremos sin falta, así que podré encontrarte", translation_en: "One day as time flows, we will surely arrive, so I can meet you" },
            { time: 72.16, text: "ドドドドドドドドドドラえもん", romaji: "dododododododododo doraemon", translation_es: "Dododododododododo Doraemon", translation_en: "Dododododododododo Doraemon" },
            { time: 85.60, text: "背中越しの過去と輝やく未来を、新たい血の流れる今で繋ごう", romaji: "senaka goshi no kako to kagayaku mirai wo aratai chi no nagareru ima de tsunagou", translation_es: "Conectemos el pasado a nuestras espaldas y el futuro brillante con este presente donde fluye sangre nueva", translation_en: "Let's connect the past behind us and the shining future with this present where new blood flows" },
            { time: 97.64, text: "僕ら繋ごう", romaji: "bokura tsunagou", translation_es: "Conectémonos", translation_en: "Let's connect" },
            { time: 100.72, text: "拗ねた君も、静かなあの子も、彼の歌も、誰かを救うだろう", romaji: "suneta kimi mo shizuka na ano ko mo kare no uta mo dareka wo sukuu darou", translation_es: "Tú que estás de mal humor, ese niño tan callado y su canción, seguramente salvarán a alguien", translation_en: "Even the sulking you, the quiet child, and his song will surely save someone" },
            { time: 113.66, text: "だからここにおいでよ、一緒に冒険しよう", romaji: "dakara koko ni oide yo isshou ni bouken shiyou", translation_es: "Así que ven aquí, vamos a tener una aventura juntos", translation_en: "So come here, let's have an adventure together" },
            { time: 120.14, text: "何者でもなくても世界を救おう", romaji: "nanimono demo nakute mo sekai wo sukuou", translation_es: "Aunque no seamos nadie, salvemos el mundo", translation_en: "Even if we are nobody, let's save the world" },
            { time: 125.66, text: "いつか時が流れて必ず辿り着くから、君に会えるよ", romaji: "itsuka toki ga nagarete kanarazu tadoritsuku kara kimi ni aeru yo", translation_es: "Algún día, cuando pase el tiempo, llegaremos sin falta, así que podré encontrarte", translation_en: "One day as time flows, we will surely arrive, so I can meet you" },
            { time: 135.16, text: "ドドドドドドドドドドラえもん", romaji: "dododododododododo doraemon", translation_es: "Dododododododododo Doraemon", translation_en: "Dododododododododo Doraemon" },
            { time: 159.74, text: "大工だって心を痛めて愛を込めてさよならするだろう", romaji: "daiku datte kokoro wo itamete ai wo komete sayonara suru darou", translation_es: "Incluso un carpintero le dolería el corazón y diría adiós con todo su amor", translation_en: "Even a carpenter would feel heartache and say goodbye with love" },
            { time: 172.66, text: "君が残したもの、探し続けること、浮かぶ空想からまた未来が生まれる", romaji: "kimi ga nokoshita mono sagashi tsuzukeru koto ukabu kuusou kara mata mirai ga umareru", translation_es: "Lo que dejaste atrás, seguir buscándolo; de esas fantasías que flotan nacerá de nuevo el futuro", translation_en: "Continuing to search for what you left behind; from those floating fantasies, the future will be born again" },
            { time: 193.64, text: "ここにおいでよ、一緒に冒険しよう", romaji: "koko ni oide yo isshou ni bouken shiyou", translation_es: "Ven aquí, vamos a tener una aventura juntos", translation_en: "Come here, let's have an adventure together" },
            { time: 199.64, text: "何者でもなくても世界を救おう", romaji: "nanimono demo nakute mo sekai wo sukuou", translation_es: "Aunque no seamos nadie, salvemos el mundo", translation_en: "Even if we are nobody, let's save the world" },
            { time: 205.10, text: "いつか時が流れて必ずたどり着くから、君を作るよ", romaji: "itsuka toki ga nagarete kanarazu tadoritsuku kara kimi wo tsukuru yo", translation_es: "Algún día, cuando pase el tiempo, llegaremos sin falta, así que te crearé", translation_en: "One day as time flows, we will surely arrive, so I will make you" },
            { time: 214.70, text: "ドドドドドドドドドドラえもん", romaji: "dododododododododo doraemon", translation_es: "Dododododododododo Doraemon", translation_en: "Dododododododododo Doraemon" },
            { time: 217.70, text: "ドドドドドドドドドドラえもん", romaji: "dododododododododo doraemon", translation_es: "Dododododododododo Doraemon", translation_en: "Dododododododododo Doraemon" },
            { time: 220.70, text: "ドドドドドドドドドドラえもん", romaji: "dododododododododo doraemon", translation_es: "Dododododododododo Doraemon", translation_en: "Dododododododododo Doraemon" }
        ],
        vocab: [
            { jp: "作る", kana: "つくる", romaji: "tsukuru", en: "to make", es: "hacer / crear" },
            { jp: "心", kana: "こころ", romaji: "kokoro", en: "heart", es: "corazón" },
            { jp: "冒険", kana: "ぼうけん", romaji: "bouken", en: "adventure", es: "aventura" },
            { jp: "救う", kana: "すくう", romaji: "sukuu", en: "to save", es: "salvar" },
            { jp: "未来", kana: "みらい", romaji: "mirai", en: "future", es: "futuro" }
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
        youtubeId: "rKsQ-3N-Bks",  // Official MV - Verificado ✓
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
        youtubeId: "qZq-q75KeMw",  // Video con letras - Verificado ✓
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
        youtubeId: "u8EkSB9zSpE",  // Official MV - Verificado ✓
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
        youtubeId: "uqWeX2vD2xU",  // Official MV - Ya verificado en documento original
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
        youtubeId: "-tKVN2mAKRI",  // Official MV - Ya verificado en documento original
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
        youtubeId: "SX_ViT4Ra7k",  // Official MV - Ya verificado en documento original
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
        youtubeId: "TQ8WlA2GXbk",  // Official MV - Verificado ✓
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
        youtubeId: "o6wtDPVkKqI",  // Official MV - Verificado ✓
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
        youtubeId: "Y4nEEZwckuU",  // Official MV - Verificado ✓
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
        youtubeId: "x8VYWazR5mE",  // Official MV - Verificado ✓
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
        youtubeId: "ony539T074w",  // Official MV - Verificado ✓
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
        start: "00:00",
        end: "01:20",
        focus: { es: "Velocidad + emoción + listening complejo", en: "Speed + emotion + complex listening" },
        difficulty: 5,
        youtubeId: "7aMOurgDB-o",  // Official MV - Verificado ✓
        lyrics: [
            { time: 0.4, text: "教えて教えてよその仕組みを", romaji: "oshiete oshiete yo sono shikumi wo", translation_es: "Dime, dime cómo funciona esto", translation_en: "Tell me, tell me the way it works" },
            { time: 7.58, text: "僕の中に誰がいるの", romaji: "boku no naka ni dare ga iru no", translation_es: "¿Quién hay dentro de mí?", translation_en: "Who is inside of me?" },
            { time: 14.68, text: "壊れた壊れたよこの世界で", romaji: "kowareta kowareta yo kono sekai de", translation_es: "Me rompí, me rompí en este mundo", translation_en: "I broke, I broke in this world" },
            { time: 21.8, text: "君が笑う", romaji: "kimi ga warau", translation_es: "Tú sonríes", translation_en: "You smile" },
            { time: 41.76, text: "何も見えずに", romaji: "nani mo miezu ni", translation_es: "Sin ver nada", translation_en: "Without seeing anything" },
            { time: 42.38, text: "壊れた僕だってさ", romaji: "kowareta boku datte sa", translation_es: "Incluso para alguien roto como yo", translation_en: "Even for a broken me" },
            { time: 45.44, text: "息を止めてフリーズ", romaji: "iki wo tomete furiizu", translation_es: "Detén la respiración y congélate", translation_en: "Hold your breath and freeze" },
            { time: 48.78, text: "壊せる", romaji: "kowaseru", translation_es: "Puedo romper", translation_en: "I can break" },
            { time: 49.66, text: "壊せない", romaji: "kowasenai", translation_es: "No puedo romper", translation_en: "I can't break" },
            { time: 50.38, text: "狂える", romaji: "kurueru", translation_es: "Puedo enloquecer", translation_en: "I can go mad" },
            { time: 51.42, text: "狂えない", romaji: "kuruenai", translation_es: "No puedo enloquecer", translation_en: "I can't go mad" },
            { time: 52.02, text: "あなたを見つけて", romaji: "anata wo mitsukete", translation_es: "Al encontrarte...", translation_en: "Finding you..." },
            { time: 54.86, text: "揺れた歪んだ世界にいたんだ", romaji: "yureta yuganda sekai ni itanda", translation_es: "Estaba en un mundo agitado y distorsionado", translation_en: "I was in a shaken, distorted world" },
            { time: 58.28, text: "僕は", romaji: "boku wa", translation_es: "Yo...", translation_en: "I..." },
            { time: 59.32, text: "透き通って見えなくなって", romaji: "sukitootte mienaku natte", translation_es: "volviéndome transparente e invisible", translation_en: "becoming transparent and invisible" },
            { time: 62.66, text: "見つけないで僕のことを", romaji: "mitsukenaide boku no koto wo", translation_es: "No me busques", translation_en: "Don't find me" },
            { time: 68.3, text: "見つめないで", romaji: "mitsumenaide", translation_es: "No me mires fijamente", translation_en: "Don't stare at me" },
            { time: 69.94, text: "誰かが描いた世界の中であなたを傷つけたくはないよ", romaji: "dareka ga egaita sekai no naka de anata wo kizutsuketaku wa nai yo", translation_es: "En un mundo que alguien más dibujó, no quiero lastimarte", translation_en: "In a world someone else imagined, I don't want to hurt you" },
            { time: 77.6, text: "覚えてて僕のこと", romaji: "oboetete boku no koto", translation_es: "Recuérdame", translation_en: "Remember me" }
        ],
        vocab: [
            { jp: "壊れる", kana: "こわれる", romaji: "kowareru", en: "to break / shatter", es: "romperse / hacerse pedazos" },
            { jp: "狂う", kana: "くるう", romaji: "kuruu", en: "to go mad", es: "enloquecer" },
            { jp: "真実", kana: "しんじつ", romaji: "shinjitsu", en: "truth", es: "verdad" },
            { jp: "揺れる", kana: "ゆれる", romaji: "yureru", en: "to shake / tremble", es: "temblar / agitarse" }
        ]
    }
];