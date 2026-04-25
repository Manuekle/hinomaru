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
    youtubeId: string;     // YouTube video ID — fill in real IDs
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
        start: "00:45",
        end: "01:15",
        focus: { es: "Expresiones básicas y agradecimiento", en: "Basic expressions and gratitude" },
        difficulty: 1,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },
    {
        level: "N5",
        title: "恋するフォーチュンクッキー",
        artist: "AKB48",
        start: "00:50",
        end: "01:20",
        focus: { es: "Frases repetitivas y vocabulario cotidiano", en: "Repetitive phrases and everyday vocabulary" },
        difficulty: 1,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },
    {
        level: "N5",
        title: "ドラえもん",
        artist: "星野源",
        start: "00:30",
        end: "01:00",
        focus: { es: "Vocabulario simple y pronunciación", en: "Simple vocabulary and pronunciation" },
        difficulty: 1,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
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
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },
    {
        level: "N4",
        title: "世界に一つだけの花",
        artist: "SMAP",
        start: "00:40",
        end: "01:10",
        focus: { es: "Estructuras simples + vocabulario descriptivo", en: "Simple structures + descriptive vocabulary" },
        difficulty: 2,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },
    {
        level: "N4",
        title: "小さな恋のうた",
        artist: "MONGOL800",
        start: "00:55",
        end: "01:25",
        focus: { es: "Frases cortas + repetición", en: "Short phrases + repetition" },
        difficulty: 2,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },

    // 🟠 N3
    {
        level: "N3",
        title: "チェリー",
        artist: "スピッツ",
        start: "01:05",
        end: "01:35",
        focus: { es: "Vocabulario intermedio + expresiones naturales", en: "Intermediate vocabulary + natural expressions" },
        difficulty: 3,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },
    {
        level: "N3",
        title: "打上花火",
        artist: "DAOKO × 米津玄師",
        start: "00:50",
        end: "01:20",
        focus: { es: "Escucha + ritmo intermedio", en: "Listening + intermediate rhythm" },
        difficulty: 3,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },
    {
        level: "N3",
        title: "Lemon",
        artist: "米津玄師",
        start: "01:00",
        end: "01:30",
        focus: { es: "Gramática intermedia + comprensión", en: "Intermediate grammar + comprehension" },
        difficulty: 3,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },

    // 🔵 N2
    {
        level: "N2",
        title: "Pretender",
        artist: "Official髭男dism",
        start: "01:15",
        end: "01:45",
        focus: { es: "Gramática compleja + emociones", en: "Complex grammar + emotions" },
        difficulty: 4,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },
    {
        level: "N2",
        title: "残酷な天使のテーゼ",
        artist: "高橋洋子",
        start: "00:35",
        end: "01:05",
        focus: { es: "Expresiones abstractas", en: "Abstract expressions" },
        difficulty: 4,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },
    {
        level: "N2",
        title: "群青",
        artist: "YOASOBI",
        start: "00:50",
        end: "01:20",
        focus: { es: "Listening rápido + vocabulario avanzado", en: "Fast listening + advanced vocabulary" },
        difficulty: 4,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },

    // 🔴 N1
    {
        level: "N1",
        title: "夜に駆ける",
        artist: "YOASOBI",
        start: "00:45",
        end: "01:15",
        focus: { es: "Narrativa rápida + comprensión avanzada", en: "Fast narrative + advanced comprehension" },
        difficulty: 5,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
    },
    {
        level: "N1",
        title: "白日",
        artist: "King Gnu",
        start: "01:10",
        end: "01:40",
        focus: { es: "Vocabulario avanzado + interpretación", en: "Advanced vocabulary + interpretation" },
        difficulty: 5,
        youtubeId: "PLACEHOLDER",
        lyrics: [],
        vocab: []
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
