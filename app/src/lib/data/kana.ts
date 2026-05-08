export const HIRAGANA = [
	{ jp: 'あ', romaji: 'a' },
	{ jp: 'い', romaji: 'i' },
	{ jp: 'う', romaji: 'u' },
	{ jp: 'え', romaji: 'e' },
	{ jp: 'お', romaji: 'o' },
	{ jp: 'か', romaji: 'ka' },
	{ jp: 'き', romaji: 'ki' },
	{ jp: 'く', romaji: 'ku' },
	{ jp: 'け', romaji: 'ke' },
	{ jp: 'こ', romaji: 'ko' },
	{ jp: 'さ', romaji: 'sa' },
	{ jp: 'し', romaji: 'shi' },
	{ jp: 'す', romaji: 'su' },
	{ jp: 'せ', romaji: 'se' },
	{ jp: 'そ', romaji: 'so' },
	{ jp: 'た', romaji: 'ta' },
	{ jp: 'ち', romaji: 'chi' },
	{ jp: 'つ', romaji: 'tsu' },
	{ jp: 'て', romaji: 'te' },
	{ jp: 'と', romaji: 'to' },
	{ jp: 'な', romaji: 'na' },
	{ jp: 'に', romaji: 'ni' },
	{ jp: 'ぬ', romaji: 'nu' },
	{ jp: 'ね', romaji: 'ne' },
	{ jp: 'の', romaji: 'no' },
	{ jp: 'は', romaji: 'ha' },
	{ jp: 'ひ', romaji: 'hi' },
	{ jp: 'ふ', romaji: 'fu' },
	{ jp: 'へ', romaji: 'he' },
	{ jp: 'ほ', romaji: 'ho' },
	{ jp: 'ま', romaji: 'ma' },
	{ jp: 'み', romaji: 'mi' },
	{ jp: 'む', romaji: 'mu' },
	{ jp: 'め', romaji: 'me' },
	{ jp: 'も', romaji: 'mo' },
	{ jp: 'や', romaji: 'ya' },
	{ jp: null, romaji: '' },
	{ jp: 'ゆ', romaji: 'yu' },
	{ jp: null, romaji: '' },
	{ jp: 'よ', romaji: 'yo' },
	{ jp: 'ら', romaji: 'ra' },
	{ jp: 'り', romaji: 'ri' },
	{ jp: 'る', romaji: 'ru' },
	{ jp: 'れ', romaji: 're' },
	{ jp: 'ろ', romaji: 'ro' },
	{ jp: 'わ', romaji: 'wa' },
	{ jp: null, romaji: '' },
	{ jp: null, romaji: '' },
	{ jp: null, romaji: '' },
	{ jp: 'を', romaji: 'wo' },
	{ jp: 'ん', romaji: 'n' }
];

export const KATAKANA = [
	{ jp: 'ア', romaji: 'a' },
	{ jp: 'イ', romaji: 'i' },
	{ jp: 'ウ', romaji: 'u' },
	{ jp: 'エ', romaji: 'e' },
	{ jp: 'オ', romaji: 'o' },
	{ jp: 'カ', romaji: 'ka' },
	{ jp: 'キ', romaji: 'ki' },
	{ jp: 'ク', romaji: 'ku' },
	{ jp: 'ケ', romaji: 'ke' },
	{ jp: 'コ', romaji: 'ko' },
	{ jp: 'サ', romaji: 'sa' },
	{ jp: 'シ', romaji: 'shi' },
	{ jp: 'ス', romaji: 'su' },
	{ jp: 'セ', romaji: 'se' },
	{ jp: 'ソ', romaji: 'so' },
	{ jp: 'タ', romaji: 'ta' },
	{ jp: 'チ', romaji: 'chi' },
	{ jp: 'ツ', romaji: 'tsu' },
	{ jp: 'テ', romaji: 'te' },
	{ jp: 'ト', romaji: 'to' },
	{ jp: 'ナ', romaji: 'na' },
	{ jp: 'ニ', romaji: 'ni' },
	{ jp: 'ヌ', romaji: 'nu' },
	{ jp: 'ネ', romaji: 'ne' },
	{ jp: 'ノ', romaji: 'no' },
	{ jp: 'ハ', romaji: 'ha' },
	{ jp: 'ヒ', romaji: 'hi' },
	{ jp: 'フ', romaji: 'fu' },
	{ jp: 'ヘ', romaji: 'he' },
	{ jp: 'ホ', romaji: 'ho' },
	{ jp: 'マ', romaji: 'ma' },
	{ jp: 'ミ', romaji: 'mi' },
	{ jp: 'ム', romaji: 'mu' },
	{ jp: 'メ', romaji: 'me' },
	{ jp: 'モ', romaji: 'mo' },
	{ jp: 'ヤ', romaji: 'ya' },
	{ jp: null, romaji: '' },
	{ jp: 'ユ', romaji: 'yu' },
	{ jp: null, romaji: '' },
	{ jp: 'ヨ', romaji: 'yo' },
	{ jp: 'ラ', romaji: 'ra' },
	{ jp: 'リ', romaji: 'ri' },
	{ jp: 'ル', romaji: 'ru' },
	{ jp: 'レ', romaji: 're' },
	{ jp: 'ロ', romaji: 'ro' },
	{ jp: 'ワ', romaji: 'wa' },
	{ jp: null, romaji: '' },
	{ jp: null, romaji: '' },
	{ jp: null, romaji: '' },
	{ jp: 'ヲ', romaji: 'wo' },
	{ jp: 'ン', romaji: 'n' }
];

export interface KanaItem {
	jp: string | null;
	romaji: string;
}

export const HIRAGANA_DAKUON: KanaItem[] = [
	{ jp: 'が', romaji: 'ga' }, { jp: 'ぎ', romaji: 'gi' }, { jp: 'ぐ', romaji: 'gu' }, { jp: 'げ', romaji: 'ge' }, { jp: 'ご', romaji: 'go' },
	{ jp: 'ざ', romaji: 'za' }, { jp: 'じ', romaji: 'ji' }, { jp: 'ず', romaji: 'zu' }, { jp: 'ぜ', romaji: 'ze' }, { jp: 'ぞ', romaji: 'zo' },
	{ jp: 'だ', romaji: 'da' }, { jp: 'ぢ', romaji: 'ji' }, { jp: 'づ', romaji: 'zu' }, { jp: 'で', romaji: 'de' }, { jp: 'ど', romaji: 'do' },
	{ jp: 'ば', romaji: 'ba' }, { jp: 'び', romaji: 'bi' }, { jp: 'ぶ', romaji: 'bu' }, { jp: 'べ', romaji: 'be' }, { jp: 'ぼ', romaji: 'bo' }
];

export const HIRAGANA_HANDAKUON: KanaItem[] = [
	{ jp: 'ぱ', romaji: 'pa' }, { jp: 'ぴ', romaji: 'pi' }, { jp: 'ぷ', romaji: 'pu' }, { jp: 'ぺ', romaji: 'pe' }, { jp: 'ぽ', romaji: 'po' }
];

export const HIRAGANA_YOON: KanaItem[] = [
	{ jp: 'きゃ', romaji: 'kya' }, { jp: 'きゅ', romaji: 'kyu' }, { jp: 'きょ', romaji: 'kyo' },
	{ jp: 'しゃ', romaji: 'sha' }, { jp: 'しゅ', romaji: 'shu' }, { jp: 'しょ', romaji: 'sho' },
	{ jp: 'ちゃ', romaji: 'cha' }, { jp: 'ちゅ', romaji: 'chu' }, { jp: 'ちょ', romaji: 'cho' },
	{ jp: 'にゃ', romaji: 'nya' }, { jp: 'にゅ', romaji: 'nyu' }, { jp: 'にょ', romaji: 'nyo' },
	{ jp: 'ひゃ', romaji: 'hya' }, { jp: 'ひゅ', romaji: 'hyu' }, { jp: 'ひょ', romaji: 'hyo' },
	{ jp: 'みゃ', romaji: 'mya' }, { jp: 'みゅ', romaji: 'myu' }, { jp: 'みょ', romaji: 'myo' },
	{ jp: 'りゃ', romaji: 'rya' }, { jp: 'りゅ', romaji: 'ryu' }, { jp: 'りょ', romaji: 'ryo' },
	{ jp: 'ぎゃ', romaji: 'gya' }, { jp: 'ぎゅ', romaji: 'gyu' }, { jp: 'ぎょ', romaji: 'gyo' },
	{ jp: 'じゃ', romaji: 'ja' }, { jp: 'じゅ', romaji: 'ju' }, { jp: 'じょ', romaji: 'jo' },
	{ jp: 'びゃ', romaji: 'bya' }, { jp: 'びゅ', romaji: 'byu' }, { jp: 'びょ', romaji: 'byo' },
	{ jp: 'ぴゃ', romaji: 'pya' }, { jp: 'ぴゅ', romaji: 'pyu' }, { jp: 'ぴょ', romaji: 'pyo' }
];

export const HIRAGANA_LONG: KanaItem[] = [
	{ jp: 'ああ', romaji: 'aa' }, { jp: 'いい', romaji: 'ii' }, { jp: 'うう', romaji: 'uu' }, { jp: 'えい', romaji: 'ei' }, { jp: 'おう', romaji: 'ou' }
];

export const HIRAGANA_SOKUON: KanaItem[] = [{ jp: 'っ', romaji: 'tt' }];

export const KATAKANA_DAKUON: KanaItem[] = [
	{ jp: 'ガ', romaji: 'ga' }, { jp: 'ギ', romaji: 'gi' }, { jp: 'グ', romaji: 'gu' }, { jp: 'ゲ', romaji: 'ge' }, { jp: 'ゴ', romaji: 'go' },
	{ jp: 'ザ', romaji: 'za' }, { jp: 'ジ', romaji: 'ji' }, { jp: 'ズ', romaji: 'zu' }, { jp: 'ゼ', romaji: 'ze' }, { jp: 'ゾ', romaji: 'zo' },
	{ jp: 'ダ', romaji: 'da' }, { jp: 'ヂ', romaji: 'ji' }, { jp: 'ヅ', romaji: 'zu' }, { jp: 'デ', romaji: 'de' }, { jp: 'ド', romaji: 'do' },
	{ jp: 'バ', romaji: 'ba' }, { jp: 'ビ', romaji: 'bi' }, { jp: 'ブ', romaji: 'bu' }, { jp: 'ベ', romaji: 'be' }, { jp: 'ボ', romaji: 'bo' }
];

export const KATAKANA_HANDAKUON: KanaItem[] = [
	{ jp: 'パ', romaji: 'pa' }, { jp: 'ピ', romaji: 'pi' }, { jp: 'プ', romaji: 'pu' }, { jp: 'ペ', romaji: 'pe' }, { jp: 'ポ', romaji: 'po' }
];

export const KATAKANA_YOON: KanaItem[] = [
	{ jp: 'キャ', romaji: 'kya' }, { jp: 'キュ', romaji: 'kyu' }, { jp: 'キョ', romaji: 'kyo' },
	{ jp: 'シャ', romaji: 'sha' }, { jp: 'シュ', romaji: 'shu' }, { jp: 'ショ', romaji: 'sho' },
	{ jp: 'チャ', romaji: 'cha' }, { jp: 'チュ', romaji: 'chu' }, { jp: 'チョ', romaji: 'cho' },
	{ jp: 'ニャ', romaji: 'nya' }, { jp: 'ニュ', romaji: 'nyu' }, { jp: 'ニョ', romaji: 'nyo' },
	{ jp: 'ヒャ', romaji: 'hya' }, { jp: 'ヒュ', romaji: 'hyu' }, { jp: 'ヒョ', romaji: 'hyo' },
	{ jp: 'ミャ', romaji: 'mya' }, { jp: 'ミュ', romaji: 'myu' }, { jp: 'ミョ', romaji: 'myo' },
	{ jp: 'リャ', romaji: 'rya' }, { jp: 'リュ', romaji: 'ryu' }, { jp: 'リョ', romaji: 'ryo' },
	{ jp: 'ギャ', romaji: 'gya' }, { jp: 'ギュ', romaji: 'gyu' }, { jp: 'ギョ', romaji: 'gyo' },
	{ jp: 'ジャ', romaji: 'ja' }, { jp: 'ジュ', romaji: 'ju' }, { jp: 'ジョ', romaji: 'jo' },
	{ jp: 'ビャ', romaji: 'bya' }, { jp: 'ビュ', romaji: 'byu' }, { jp: 'ビョ', romaji: 'byo' },
	{ jp: 'ピャ', romaji: 'pya' }, { jp: 'ピュ', romaji: 'pyu' }, { jp: 'ピョ', romaji: 'pyo' }
];

export const KATAKANA_LONG: KanaItem[] = [
	{ jp: 'アー', romaji: 'aa' }, { jp: 'イー', romaji: 'ii' }, { jp: 'ウー', romaji: 'uu' }, { jp: 'エー', romaji: 'ee' }, { jp: 'オー', romaji: 'oo' }
];

export const KATAKANA_SOKUON: KanaItem[] = [{ jp: 'ッ', romaji: 'tt' }];
