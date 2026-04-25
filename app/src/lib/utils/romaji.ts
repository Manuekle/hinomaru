/**
 * Simple Kana to Romaji converter for Hinomaru.
 * Handles basic hiragana/katakana.
 */
export function kanaToRomaji(kana: string): string {
	if (!kana) return '';
	
	const map: Record<string, string> = {
		'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
		'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
		'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
		'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
		'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
		'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
		'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
		'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
		'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
		'わ': 'wa', 'を': 'wo', 'ん': 'n',
		'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
		'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
		'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
		'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
		'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
		'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
		'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
		'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
		'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
		'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
		'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
		'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
		'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
		'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
		'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
		'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo'
	};

	let result = '';
	let i = 0;
	while (i < kana.length) {
		const char2 = kana.substring(i, i + 2);
		if (map[char2]) {
			result += map[char2];
			i += 2;
		} else {
			const char1 = kana.substring(i, i + 1);
			if (char1 === 'っ' || char1 === 'ッ') {
				// Sokuon - double next consonant
				const next = kana.substring(i + 1, i + 2);
				const nextRomaji = map[next] || map[kana.substring(i + 1, i + 3)] || '';
				if (nextRomaji) {
					result += nextRomaji[0];
				}
				i++;
			} else if (char1 === 'ー') {
				// Choonpu - long vowel
				i++;
			} else {
				result += map[char1] || char1;
				i++;
			}
		}
	}
	return result;
}
