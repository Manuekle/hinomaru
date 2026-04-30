import type { JLPTTest } from './types';

export const n5v: JLPTTest = {
	level: 'N5',
	type: 'vocabulary',
	duration: 25,
	mondai: [
		{
			id: 'n5v-1',
			title: 'もんだい１',
			instruction:
				'＿＿＿の ことばは ひらがなで どう かきますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。',
			questions: [
				{
					id: 1,
					sentence: 'あしたは 雨ですか。',
					underlined: '雨',
					choices: ['ゆき', 'はれ', 'くもり', 'あめ'],
					answer: 4
				},
				{
					id: 2,
					sentence: 'きょうしつで 書いて ください。',
					underlined: '書いて',
					choices: ['かいて', 'きいて', 'はいて', 'ひいて'],
					answer: 1
				},
				{
					id: 3,
					sentence: 'しゃしんは はこの 中に あります。',
					underlined: '中',
					choices: ['そば', 'そと', 'なか', 'よこ'],
					answer: 3
				},
				{
					id: 4,
					sentence: 'この いすは 小さいです。',
					underlined: '小さい',
					choices: ['ちいさい', 'ちさい', 'しいさい', 'しさい'],
					answer: 1
				},
				{
					id: 5,
					sentence: 'あしたは 火よう日です。',
					underlined: '火よう日',
					choices: ['どようび', 'すいようび', 'かようび', 'にちようび'],
					answer: 3
				},
				{
					id: 6,
					sentence: 'きれいな 空ですね。',
					underlined: '空',
					choices: ['いえ', 'うみ', 'にわ', 'そら'],
					answer: 4
				},
				{
					id: 7,
					sentence: 'せいとは 百人 います。',
					underlined: '百人',
					choices: ['ひゃくにん', 'びゃくにん', 'ひゃくじん', 'びゃくじん'],
					answer: 1
				},
				{
					id: 8,
					sentence: '魚が たくさん いますよ。',
					underlined: '魚',
					choices: ['ねこ', 'とり', 'いぬ', 'さかな'],
					answer: 4
				},
				{
					id: 9,
					sentence: 'パンを 半分 ともだちに あげました。',
					underlined: '半分',
					choices: ['はんふん', 'はんぶん', 'ほんぶん', 'ほんふん'],
					answer: 2
				},
				{
					id: 10,
					sentence: 'ぎんこうと スーパーの 間に ほそい みちが あります。',
					underlined: '間',
					choices: ['あいた', 'となり', 'あいだ', 'どなり'],
					answer: 3
				},
				{
					id: 11,
					sentence: 'たまごを 三つ とって ください。',
					underlined: '三つ',
					choices: ['いつつ', 'みっつ', 'さんつ', 'ごつ'],
					answer: 2
				},
				{
					id: 12,
					sentence: 'きょうは 元気が いいですね。',
					underlined: '元気',
					choices: ['けんき', 'げんき', 'でんき', 'てんき'],
					answer: 2
				}
			]
		},
		{
			id: 'n5v-2',
			title: 'もんだい２',
			instruction:
				'＿＿＿の ことばは どう かきますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。',
			questions: [
				{
					id: 13,
					sentence: 'この わいしゃつを ください。',
					underlined: 'わいしゃつ',
					choices: ['ウイシャソ', 'ウイシャツ', 'ワイシャソ', 'ワイシャツ'],
					answer: 4
				},
				{
					id: 14,
					sentence: 'わたしの くには かわが おおいです。',
					underlined: 'かわ',
					choices: ['花', '山', '川', '木'],
					answer: 3
				},
				{
					id: 15,
					sentence: 'ヤンさんの がっこうは どこですか。',
					underlined: 'がっこう',
					choices: ['宇校', '学校', '宇枚', '学枚'],
					answer: 2
				},
				{
					id: 16,
					sentence: 'この ざっしを みて ください。',
					underlined: 'みて',
					choices: ['見て', '買て', '貝て', '目て'],
					answer: 1
				},
				{
					id: 17,
					sentence: 'この カメラは たかいですね。',
					underlined: 'たかい',
					choices: ['高い', '安い', '古い', '新い'],
					answer: 1
				},
				{
					id: 18,
					sentence: 'きのうは かいしゃを やすみました。',
					underlined: 'かいしゃ',
					choices: ['公仕', '公社', '会仕', '会社'],
					answer: 4
				},
				{
					id: 19,
					sentence: 'まだ いわないで ください。',
					underlined: 'いわないで',
					choices: ['行わないで', '立わないで', '言わないで', '食わないで'],
					answer: 3
				},
				{
					id: 20,
					sentence: 'らいげつ けっこんします。',
					underlined: 'らいげつ',
					choices: ['今月', '来月', '来週', '今週'],
					answer: 2
				}
			]
		},
		{
			id: 'n5v-3',
			title: 'もんだい３',
			instruction:
				'（　）に なにが はいりますか。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。',
			questions: [
				{
					id: 21,
					sentence: 'わたしの へやは この アパートの 2（　）です。',
					choices: ['ほん', 'さつ', 'だい', 'かい'],
					answer: 4
				},
				{
					id: 22,
					sentence: 'その ナイフで りんごを（　）ください。',
					choices: ['おきて', 'つけて', 'しめて', 'きって'],
					answer: 4
				},
				{
					id: 23,
					sentence: '（　）を わすれましたから、じかんが わかりません。',
					choices: ['じしょ', 'ちず', 'とけい', 'さいふ'],
					answer: 3
				},
				{
					id: 24,
					sentence: 'わたしの うちは えきに ちかいですから、（　）です。',
					choices: ['べんり', 'じょうぶ', 'いっぱい', 'へた'],
					answer: 1
				},
				{
					id: 25,
					sentence: 'なつやすみは まいにち（　）で およぎました。',
					choices: ['レストラン', 'プール', 'エレベーター', 'ビル'],
					answer: 2
				},
				{
					id: 26,
					sentence:
						'しらない ことばが ありましたから、せんせいに（　）しました。',
					choices: ['しつもん', 'べんきょう', 'れんしゅう', 'じゅぎょう'],
					answer: 1
				},
				{
					id: 27,
					sentence: 'この へやは あついですから、（　）を あけましょう。',
					choices: ['おふろ', 'まど', 'エアコン', 'テーブル'],
					answer: 2
				},
				{
					id: 28,
					sentence: 'きのうは がっこうで たくさん かんじを（　）。',
					choices: ['うりました', 'もちました', 'おぼえました', 'こまりました'],
					answer: 3
				},
				{
					id: 29,
					sentence:
						'この コーヒーは、さとうを たくさん いれましたから、（　）です。',
					choices: ['わかい', 'くろい', 'まるい', 'あまい'],
					answer: 4
				},
				{
					id: 30,
					sentence: 'つよい かぜが（　）います。',
					choices: ['ふいて', 'いそいで', 'とんで', 'はしって'],
					answer: 1
				}
			]
		},
		{
			id: 'n5v-4',
			title: 'もんだい４',
			instruction:
				'＿＿＿の ぶんと だいたい おなじ いみの ぶんが あります。１・２・３・４から いちばん いい ものを ひとつ えらんで ください。',
			questions: [
				{
					id: 31,
					sentence: 'これは りょうしんの しゃしんです。',
					choices: [
						'これは そふと そぼの しゃしんです。',
						'これは ちちと ははの しゃしんです。',
						'これは あにと おとうとの しゃしんです。',
						'これは あねと いもうとの しゃしんです。'
					],
					answer: 2
				},
				{
					id: 32,
					sentence: 'この ダンスは やさしいです。',
					choices: [
						'この ダンスは かんたんです。',
						'この ダンスは たいへんです。',
						'この ダンスは たのしいです。',
						'この ダンスは つまらないです。'
					],
					answer: 1
				},
				{
					id: 33,
					sentence: 'ふくを せんたくしました。',
					choices: [
						'ふくを ぬぎました。',
						'ふくを わたしました。',
						'ふくを あらいました。',
						'ふくを きました。'
					],
					answer: 3
				},
				{
					id: 34,
					sentence: 'この へやは くらいですね。',
					choices: [
						'この へやは あかるいですね。',
						'この へやは あかるくないですね。',
						'この へやは しずかじゃ ないですね。',
						'この へやは しずかですね。'
					],
					answer: 2
				},
				{
					id: 35,
					sentence: 'リーさんは もりさんに ペンを かしました。',
					choices: [
						'リーさんは もりさんに ペンを もらいました。',
						'もりさんは リーさんに ペンを もらいました。',
						'リーさんは もりさんに ペンを かりました。',
						'もりさんは リーさんに ペンを かりました。'
					],
					answer: 4
				}
			]
		}
	]
};
