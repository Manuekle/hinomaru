export interface KanaChar {
	id: string;
	jp: string;
	romaji: string;
	script: 'hiragana' | 'katakana';
	group: string;
}

export interface KanaGroup {
	id: string;
	title_es: string;
	title_en: string;
	subtitle_es?: string;
	subtitle_en?: string;
	chars: KanaChar[];
}

export interface KanaSection {
	id: string;
	script: 'hiragana' | 'katakana';
	title_es: string;
	title_en: string;
	groups: KanaGroup[];
}

export interface KanaWord {
	jp: string;
	romaji: string;
	es: string;
	en: string;
	chars: string[];
}

function row(prefix: string, list: [string, string][], script: 'hiragana' | 'katakana', group: string): KanaChar[] {
	return list.map(([jp, romaji]) => ({ id: `${prefix}-${romaji}`, jp, romaji, script, group }));
}

const H_GOJUON: KanaGroup[] = [
	{
		id: 'h-vowels',
		title_es: 'Vocales',
		title_en: 'Vowels',
		chars: row('h', [['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o']], 'hiragana', 'h-vowels')
	},
	{
		id: 'h-k',
		title_es: 'K',
		title_en: 'K',
		chars: row('h', [['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko']], 'hiragana', 'h-k')
	},
	{
		id: 'h-s',
		title_es: 'S',
		title_en: 'S',
		chars: row('h', [['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so']], 'hiragana', 'h-s')
	},
	{
		id: 'h-t',
		title_es: 'T',
		title_en: 'T',
		chars: row('h', [['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to']], 'hiragana', 'h-t')
	},
	{
		id: 'h-n',
		title_es: 'N',
		title_en: 'N',
		chars: row('h', [['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no']], 'hiragana', 'h-n')
	},
	{
		id: 'h-h',
		title_es: 'H',
		title_en: 'H',
		chars: row('h', [['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho']], 'hiragana', 'h-h')
	},
	{
		id: 'h-m',
		title_es: 'M',
		title_en: 'M',
		chars: row('h', [['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo']], 'hiragana', 'h-m')
	},
	{
		id: 'h-y',
		title_es: 'Y',
		title_en: 'Y',
		chars: row('h', [['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo']], 'hiragana', 'h-y')
	},
	{
		id: 'h-r',
		title_es: 'R',
		title_en: 'R',
		chars: row('h', [['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro']], 'hiragana', 'h-r')
	},
	{
		id: 'h-w',
		title_es: 'W + N',
		title_en: 'W + N',
		chars: row('h', [['わ', 'wa'], ['を', 'wo'], ['ん', 'n']], 'hiragana', 'h-w')
	}
];

const H_DAKUON: KanaGroup[] = [
	{
		id: 'h-g',
		title_es: 'Dakuon: G',
		title_en: 'Dakuon: G',
		chars: row('h', [['が', 'ga'], ['ぎ', 'gi'], ['ぐ', 'gu'], ['げ', 'ge'], ['ご', 'go']], 'hiragana', 'h-g')
	},
	{
		id: 'h-z',
		title_es: 'Dakuon: Z',
		title_en: 'Dakuon: Z',
		chars: row('h', [['ざ', 'za'], ['じ', 'ji'], ['ず', 'zu'], ['ぜ', 'ze'], ['ぞ', 'zo']], 'hiragana', 'h-z')
	},
	{
		id: 'h-d',
		title_es: 'Dakuon: D',
		title_en: 'Dakuon: D',
		chars: row('h', [['だ', 'da'], ['で', 'de'], ['ど', 'do']], 'hiragana', 'h-d')
	},
	{
		id: 'h-b',
		title_es: 'Dakuon: B',
		title_en: 'Dakuon: B',
		chars: row('h', [['ば', 'ba'], ['び', 'bi'], ['ぶ', 'bu'], ['べ', 'be'], ['ぼ', 'bo']], 'hiragana', 'h-b')
	}
];

const H_HANDAKUON: KanaGroup[] = [
	{
		id: 'h-p',
		title_es: 'Handakuon: P',
		title_en: 'Handakuon: P',
		chars: row('h', [['ぱ', 'pa'], ['ぴ', 'pi'], ['ぷ', 'pu'], ['ぺ', 'pe'], ['ぽ', 'po']], 'hiragana', 'h-p')
	}
];

const H_YOON: KanaGroup[] = [
	{
		id: 'h-yoon-k',
		title_es: 'Yōon: K',
		title_en: 'Yōon: K',
		chars: row('h', [['きゃ', 'kya'], ['きゅ', 'kyu'], ['きょ', 'kyo']], 'hiragana', 'h-yoon-k')
	},
	{
		id: 'h-yoon-s',
		title_es: 'Yōon: S',
		title_en: 'Yōon: S',
		chars: row('h', [['しゃ', 'sha'], ['しゅ', 'shu'], ['しょ', 'sho']], 'hiragana', 'h-yoon-s')
	},
	{
		id: 'h-yoon-c',
		title_es: 'Yōon: Ch',
		title_en: 'Yōon: Ch',
		chars: row('h', [['ちゃ', 'cha'], ['ちゅ', 'chu'], ['ちょ', 'cho']], 'hiragana', 'h-yoon-c')
	},
	{
		id: 'h-yoon-n',
		title_es: 'Yōon: N',
		title_en: 'Yōon: N',
		chars: row('h', [['にゃ', 'nya'], ['にゅ', 'nyu'], ['にょ', 'nyo']], 'hiragana', 'h-yoon-n')
	},
	{
		id: 'h-yoon-h',
		title_es: 'Yōon: H',
		title_en: 'Yōon: H',
		chars: row('h', [['ひゃ', 'hya'], ['ひゅ', 'hyu'], ['ひょ', 'hyo']], 'hiragana', 'h-yoon-h')
	},
	{
		id: 'h-yoon-m',
		title_es: 'Yōon: M',
		title_en: 'Yōon: M',
		chars: row('h', [['みゃ', 'mya'], ['みゅ', 'myu'], ['みょ', 'myo']], 'hiragana', 'h-yoon-m')
	},
	{
		id: 'h-yoon-r',
		title_es: 'Yōon: R',
		title_en: 'Yōon: R',
		chars: row('h', [['りゃ', 'rya'], ['りゅ', 'ryu'], ['りょ', 'ryo']], 'hiragana', 'h-yoon-r')
	}
];

const H_SPECIAL: KanaGroup[] = [
	{
		id: 'h-choonpu',
		title_es: 'Vocales largas',
		title_en: 'Long vowels',
		subtitle_es: 'Duplicar vocal: ああ, いい, うう, えい, おう',
		subtitle_en: 'Double the vowel: ああ, いい, うう, えい, おう',
		chars: row('h', [['ああ', 'aa'], ['いい', 'ii'], ['うう', 'uu'], ['えい', 'ei'], ['おう', 'ou']], 'hiragana', 'h-choonpu')
	},
	{
		id: 'h-sokuon',
		title_es: 'Sokuon (っ)',
		title_en: 'Sokuon (っ)',
		subtitle_es: 'Duplica la consonante siguiente.',
		subtitle_en: 'Doubles the following consonant.',
		chars: row('h', [['っ', 'tt']], 'hiragana', 'h-sokuon')
	}
];

const K_GOJUON: KanaGroup[] = [
	{
		id: 'k-vowels',
		title_es: 'Vocales',
		title_en: 'Vowels',
		chars: row('k', [['ア', 'a'], ['イ', 'i'], ['ウ', 'u'], ['エ', 'e'], ['オ', 'o']], 'katakana', 'k-vowels')
	},
	{
		id: 'k-k',
		title_es: 'K',
		title_en: 'K',
		chars: row('k', [['カ', 'ka'], ['キ', 'ki'], ['ク', 'ku'], ['ケ', 'ke'], ['コ', 'ko']], 'katakana', 'k-k')
	},
	{
		id: 'k-s',
		title_es: 'S',
		title_en: 'S',
		chars: row('k', [['サ', 'sa'], ['シ', 'shi'], ['ス', 'su'], ['セ', 'se'], ['ソ', 'so']], 'katakana', 'k-s')
	},
	{
		id: 'k-t',
		title_es: 'T',
		title_en: 'T',
		chars: row('k', [['タ', 'ta'], ['チ', 'chi'], ['ツ', 'tsu'], ['テ', 'te'], ['ト', 'to']], 'katakana', 'k-t')
	},
	{
		id: 'k-n',
		title_es: 'N',
		title_en: 'N',
		chars: row('k', [['ナ', 'na'], ['ニ', 'ni'], ['ヌ', 'nu'], ['ネ', 'ne'], ['ノ', 'no']], 'katakana', 'k-n')
	},
	{
		id: 'k-h',
		title_es: 'H',
		title_en: 'H',
		chars: row('k', [['ハ', 'ha'], ['ヒ', 'hi'], ['フ', 'fu'], ['ヘ', 'he'], ['ホ', 'ho']], 'katakana', 'k-h')
	},
	{
		id: 'k-m',
		title_es: 'M',
		title_en: 'M',
		chars: row('k', [['マ', 'ma'], ['ミ', 'mi'], ['ム', 'mu'], ['メ', 'me'], ['モ', 'mo']], 'katakana', 'k-m')
	},
	{
		id: 'k-y',
		title_es: 'Y',
		title_en: 'Y',
		chars: row('k', [['ヤ', 'ya'], ['ユ', 'yu'], ['ヨ', 'yo']], 'katakana', 'k-y')
	},
	{
		id: 'k-r',
		title_es: 'R',
		title_en: 'R',
		chars: row('k', [['ラ', 'ra'], ['リ', 'ri'], ['ル', 'ru'], ['レ', 're'], ['ロ', 'ro']], 'katakana', 'k-r')
	},
	{
		id: 'k-w',
		title_es: 'W + N',
		title_en: 'W + N',
		chars: row('k', [['ワ', 'wa'], ['ヲ', 'wo'], ['ン', 'n']], 'katakana', 'k-w')
	}
];

const K_DAKUON: KanaGroup[] = [
	{
		id: 'k-g',
		title_es: 'Dakuon: G',
		title_en: 'Dakuon: G',
		chars: row('k', [['ガ', 'ga'], ['ギ', 'gi'], ['グ', 'gu'], ['ゲ', 'ge'], ['ゴ', 'go']], 'katakana', 'k-g')
	},
	{
		id: 'k-z',
		title_es: 'Dakuon: Z',
		title_en: 'Dakuon: Z',
		chars: row('k', [['ザ', 'za'], ['ジ', 'ji'], ['ズ', 'zu'], ['ゼ', 'ze'], ['ゾ', 'zo']], 'katakana', 'k-z')
	},
	{
		id: 'k-d',
		title_es: 'Dakuon: D',
		title_en: 'Dakuon: D',
		chars: row('k', [['ダ', 'da'], ['デ', 'de'], ['ド', 'do']], 'katakana', 'k-d')
	},
	{
		id: 'k-b',
		title_es: 'Dakuon: B',
		title_en: 'Dakuon: B',
		chars: row('k', [['バ', 'ba'], ['ビ', 'bi'], ['ブ', 'bu'], ['ベ', 'be'], ['ボ', 'bo']], 'katakana', 'k-b')
	}
];

const K_HANDAKUON: KanaGroup[] = [
	{
		id: 'k-p',
		title_es: 'Handakuon: P',
		title_en: 'Handakuon: P',
		chars: row('k', [['パ', 'pa'], ['ピ', 'pi'], ['プ', 'pu'], ['ペ', 'pe'], ['ポ', 'po']], 'katakana', 'k-p')
	}
];

const K_YOON: KanaGroup[] = [
	{
		id: 'k-yoon-k',
		title_es: 'Yōon: K',
		title_en: 'Yōon: K',
		chars: row('k', [['キャ', 'kya'], ['キュ', 'kyu'], ['キョ', 'kyo']], 'katakana', 'k-yoon-k')
	},
	{
		id: 'k-yoon-s',
		title_es: 'Yōon: S',
		title_en: 'Yōon: S',
		chars: row('k', [['シャ', 'sha'], ['シュ', 'shu'], ['ショ', 'sho']], 'katakana', 'k-yoon-s')
	},
	{
		id: 'k-yoon-c',
		title_es: 'Yōon: Ch',
		title_en: 'Yōon: Ch',
		chars: row('k', [['チャ', 'cha'], ['チュ', 'chu'], ['チョ', 'cho']], 'katakana', 'k-yoon-c')
	}
];

const K_SPECIAL: KanaGroup[] = [
	{
		id: 'k-choonpu',
		title_es: 'Vocales largas (ー)',
		title_en: 'Long vowels (ー)',
		subtitle_es: 'En katakana se usa ー después de la vocal.',
		subtitle_en: 'Katakana uses ー after the vowel.',
		chars: row('k', [['アー', 'aa'], ['イー', 'ii'], ['ウー', 'uu'], ['エー', 'ee'], ['オー', 'oo']], 'katakana', 'k-choonpu')
	},
	{
		id: 'k-sokuon',
		title_es: 'Sokuon (ッ)',
		title_en: 'Sokuon (ッ)',
		subtitle_es: 'Duplica la consonante siguiente.',
		subtitle_en: 'Doubles the following consonant.',
		chars: row('k', [['ッ', 'tt']], 'katakana', 'k-sokuon')
	}
];

export const ALPHABET_SECTIONS: KanaSection[] = [
	{
		id: 'h-base',
		script: 'hiragana',
		title_es: 'Hiragana — Gojūon',
		title_en: 'Hiragana — Gojūon',
		groups: H_GOJUON
	},
	{
		id: 'h-dakuon',
		script: 'hiragana',
		title_es: 'Hiragana — Dakuon',
		title_en: 'Hiragana — Dakuon',
		groups: H_DAKUON
	},
	{
		id: 'h-handakuon',
		script: 'hiragana',
		title_es: 'Hiragana — Handakuon',
		title_en: 'Hiragana — Handakuon',
		groups: H_HANDAKUON
	},
	{
		id: 'h-yoon',
		script: 'hiragana',
		title_es: 'Hiragana — Combinaciones (Yōon)',
		title_en: 'Hiragana — Combinations (Yōon)',
		groups: H_YOON
	},
	{
		id: 'h-special',
		script: 'hiragana',
		title_es: 'Hiragana — Especiales',
		title_en: 'Hiragana — Special',
		groups: H_SPECIAL
	},
	{
		id: 'k-base',
		script: 'katakana',
		title_es: 'Katakana — Gojūon',
		title_en: 'Katakana — Gojūon',
		groups: K_GOJUON
	},
	{
		id: 'k-dakuon',
		script: 'katakana',
		title_es: 'Katakana — Dakuon',
		title_en: 'Katakana — Dakuon',
		groups: K_DAKUON
	},
	{
		id: 'k-handakuon',
		script: 'katakana',
		title_es: 'Katakana — Handakuon',
		title_en: 'Katakana — Handakuon',
		groups: K_HANDAKUON
	},
	{
		id: 'k-yoon',
		script: 'katakana',
		title_es: 'Katakana — Combinaciones (Yōon)',
		title_en: 'Katakana — Combinations (Yōon)',
		groups: K_YOON
	},
	{
		id: 'k-special',
		script: 'katakana',
		title_es: 'Katakana — Especiales',
		title_en: 'Katakana — Special',
		groups: K_SPECIAL
	}
];

export const ALL_CHARS: KanaChar[] = ALPHABET_SECTIONS.flatMap((s) =>
	s.groups.flatMap((g) => g.chars)
);

// Words composed of base hiragana, used for word-formation step after a group is learned.
export const WORDS: Record<string, KanaWord[]> = {
	'h-vowels': [
		{ jp: 'あい', romaji: 'ai', es: 'amor', en: 'love', chars: ['あ', 'い'] },
		{ jp: 'いえ', romaji: 'ie', es: 'casa', en: 'house', chars: ['い', 'え'] },
		{ jp: 'うえ', romaji: 'ue', es: 'arriba', en: 'up', chars: ['う', 'え'] }
	],
	'h-k': [
		{ jp: 'いけ', romaji: 'ike', es: 'estanque', en: 'pond', chars: ['い', 'け'] },
		{ jp: 'かお', romaji: 'kao', es: 'cara', en: 'face', chars: ['か', 'お'] },
		{ jp: 'こえ', romaji: 'koe', es: 'voz', en: 'voice', chars: ['こ', 'え'] }
	],
	'h-s': [
		{ jp: 'すし', romaji: 'sushi', es: 'sushi', en: 'sushi', chars: ['す', 'し'] },
		{ jp: 'さけ', romaji: 'sake', es: 'sake', en: 'sake', chars: ['さ', 'け'] },
		{ jp: 'いす', romaji: 'isu', es: 'silla', en: 'chair', chars: ['い', 'す'] }
	],
	'h-t': [
		{ jp: 'たこ', romaji: 'tako', es: 'pulpo', en: 'octopus', chars: ['た', 'こ'] },
		{ jp: 'つき', romaji: 'tsuki', es: 'luna', en: 'moon', chars: ['つ', 'き'] },
		{ jp: 'うた', romaji: 'uta', es: 'canción', en: 'song', chars: ['う', 'た'] }
	],
	'h-n': [
		{ jp: 'なに', romaji: 'nani', es: 'qué', en: 'what', chars: ['な', 'に'] },
		{ jp: 'ねこ', romaji: 'neko', es: 'gato', en: 'cat', chars: ['ね', 'こ'] },
		{ jp: 'いぬ', romaji: 'inu', es: 'perro', en: 'dog', chars: ['い', 'ぬ'] }
	],
	'h-h': [
		{ jp: 'はな', romaji: 'hana', es: 'flor', en: 'flower', chars: ['は', 'な'] },
		{ jp: 'ふね', romaji: 'fune', es: 'barco', en: 'boat', chars: ['ふ', 'ね'] },
		{ jp: 'ほし', romaji: 'hoshi', es: 'estrella', en: 'star', chars: ['ほ', 'し'] }
	],
	'h-m': [
		{ jp: 'みみ', romaji: 'mimi', es: 'oreja', en: 'ear', chars: ['み', 'み'] },
		{ jp: 'うみ', romaji: 'umi', es: 'mar', en: 'sea', chars: ['う', 'み'] },
		{ jp: 'まめ', romaji: 'mame', es: 'frijol', en: 'bean', chars: ['ま', 'め'] }
	],
	'h-y': [
		{ jp: 'やま', romaji: 'yama', es: 'montaña', en: 'mountain', chars: ['や', 'ま'] },
		{ jp: 'ゆき', romaji: 'yuki', es: 'nieve', en: 'snow', chars: ['ゆ', 'き'] },
		{ jp: 'よる', romaji: 'yoru', es: 'noche', en: 'night', chars: ['よ', 'る'] }
	],
	'h-r': [
		{ jp: 'さくら', romaji: 'sakura', es: 'cerezo', en: 'cherry', chars: ['さ', 'く', 'ら'] },
		{ jp: 'とり', romaji: 'tori', es: 'pájaro', en: 'bird', chars: ['と', 'り'] },
		{ jp: 'はる', romaji: 'haru', es: 'primavera', en: 'spring', chars: ['は', 'る'] }
	],
	'h-w': [
		{ jp: 'わたし', romaji: 'watashi', es: 'yo', en: 'I', chars: ['わ', 'た', 'し'] },
		{ jp: 'ほん', romaji: 'hon', es: 'libro', en: 'book', chars: ['ほ', 'ん'] }
	],
	'h-g': [
		{ jp: 'かぎ', romaji: 'kagi', es: 'llave', en: 'key', chars: ['か', 'ぎ'] },
		{ jp: 'ねぎ', romaji: 'negi', es: 'cebolla verde', en: 'green onion', chars: ['ね', 'ぎ'] },
		{ jp: 'いご', romaji: 'igo', es: 'go (juego)', en: 'go (game)', chars: ['い', 'ご'] }
	],
	'h-z': [
		{ jp: 'みず', romaji: 'mizu', es: 'agua', en: 'water', chars: ['み', 'ず'] },
		{ jp: 'かぜ', romaji: 'kaze', es: 'viento', en: 'wind', chars: ['か', 'ぜ'] }
	],
	'h-d': [
		{ jp: 'どこ', romaji: 'doko', es: 'dónde', en: 'where', chars: ['ど', 'こ'] },
		{ jp: 'からだ', romaji: 'karada', es: 'cuerpo', en: 'body', chars: ['か', 'ら', 'だ'] }
	],
	'h-b': [
		{ jp: 'そば', romaji: 'soba', es: 'soba', en: 'soba', chars: ['そ', 'ば'] },
		{ jp: 'ぼく', romaji: 'boku', es: 'yo (masc.)', en: 'I (masc.)', chars: ['ぼ', 'く'] }
	],
	'h-p': [
		{ jp: 'さんぽ', romaji: 'sanpo', es: 'paseo', en: 'walk', chars: ['さ', 'ん', 'ぽ'] },
		{ jp: 'えんぴつ', romaji: 'enpitsu', es: 'lápiz', en: 'pencil', chars: ['え', 'ん', 'ぴ', 'つ'] }
	]
};

// Flat list of all known hiragana words (existing groups + extras), used for
// free-practice word filtering by {target ∪ learned}.
export const HIRAGANA_WORDS: KanaWord[] = Object.values(WORDS).flat();

// Katakana words used for free-practice. Chosen to avoid the chōonpu (ー) and
// small yōon kana since those are not present in ALL_CHARS as standalone tokens.
export const KATAKANA_WORDS: KanaWord[] = [
	{ jp: 'アイ', romaji: 'ai', es: 'amor', en: 'love', chars: ['ア', 'イ'] },
	{ jp: 'カキ', romaji: 'kaki', es: 'caqui', en: 'persimmon', chars: ['カ', 'キ'] },
	{ jp: 'ココア', romaji: 'kokoa', es: 'cacao', en: 'cocoa', chars: ['コ', 'コ', 'ア'] },
	{ jp: 'カメラ', romaji: 'kamera', es: 'cámara', en: 'camera', chars: ['カ', 'メ', 'ラ'] },
	{ jp: 'アメリカ', romaji: 'amerika', es: 'Estados Unidos', en: 'America', chars: ['ア', 'メ', 'リ', 'カ'] },
	{ jp: 'ミルク', romaji: 'miruku', es: 'leche', en: 'milk', chars: ['ミ', 'ル', 'ク'] },
	{ jp: 'マスク', romaji: 'masuku', es: 'mascarilla', en: 'mask', chars: ['マ', 'ス', 'ク'] },
	{ jp: 'ホテル', romaji: 'hoteru', es: 'hotel', en: 'hotel', chars: ['ホ', 'テ', 'ル'] },
	{ jp: 'テレビ', romaji: 'terebi', es: 'televisión', en: 'TV', chars: ['テ', 'レ', 'ビ'] },
	{ jp: 'バナナ', romaji: 'banana', es: 'plátano', en: 'banana', chars: ['バ', 'ナ', 'ナ'] },
	{ jp: 'パン', romaji: 'pan', es: 'pan', en: 'bread', chars: ['パ', 'ン'] },
	{ jp: 'ペン', romaji: 'pen', es: 'pluma', en: 'pen', chars: ['ペ', 'ン'] },
	{ jp: 'ピザ', romaji: 'piza', es: 'pizza', en: 'pizza', chars: ['ピ', 'ザ'] },
	{ jp: 'ガム', romaji: 'gamu', es: 'chicle', en: 'gum', chars: ['ガ', 'ム'] },
	{ jp: 'ベル', romaji: 'beru', es: 'campana', en: 'bell', chars: ['ベ', 'ル'] }
];

function shuffleArr<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export function shuffle<T>(arr: T[]): T[] {
	return shuffleArr(arr);
}

// Returns up to `n` random distractor chars from the same script as `c`.
export function poolFor(c: KanaChar, n = 3): KanaChar[] {
	const same = ALL_CHARS.filter((x) => x.script === c.script && x.id !== c.id);
	return shuffleArr(same).slice(0, n);
}

// Returns words composed only of chars in `{targetJp} ∪ learnedJps`, that
// contain `targetJp` at least once. Source pool is filtered by script.
export function wordsForCharSet(
	targetJp: string,
	learnedJps: Set<string>,
	script: 'hiragana' | 'katakana'
): KanaWord[] {
	const pool = script === 'hiragana' ? HIRAGANA_WORDS : KATAKANA_WORDS;
	const allowed = new Set<string>(learnedJps);
	allowed.add(targetJp);
	const seen = new Set<string>();
	const out: KanaWord[] = [];
	for (const w of pool) {
		if (seen.has(w.jp)) continue;
		if (!w.chars.includes(targetJp)) continue;
		if (!w.chars.every((c) => allowed.has(c))) continue;
		seen.add(w.jp);
		out.push(w);
	}
	return out;
}
