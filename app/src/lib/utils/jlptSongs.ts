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
	focus: string;
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
		focus: "Expresiones básicas y agradecimiento",
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
		focus: "Frases repetitivas y vocabulario cotidiano",
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
		focus: "Vocabulario simple y pronunciación",
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
		focus: "Frases emocionales + gramática básica",
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
		focus: "Estructuras simples + vocabulario descriptivo",
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
		focus: "Frases cortas + repetición",
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
		focus: "Vocabulario intermedio + expresiones naturales",
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
		focus: "Escucha + ritmo intermedio",
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
		focus: "Gramática intermedia + comprensión",
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
		focus: "Gramática compleja + emociones",
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
		focus: "Expresiones abstractas",
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
		focus: "Listening rápido + vocabulario avanzado",
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
		focus: "Narrativa rápida + comprensión avanzada",
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
		focus: "Vocabulario avanzado + interpretación",
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
		focus: "Velocidad + emoción + listening complejo",
		difficulty: 5,
		youtubeId: "PLACEHOLDER",
		lyrics: [],
		vocab: []
	}
];
