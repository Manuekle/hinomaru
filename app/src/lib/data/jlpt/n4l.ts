import type { JLPTTest } from './types';

export const n4l: JLPTTest = {
	level: 'N4',
	type: 'listening',
	duration: 35,
	audioFiles: ['N4Q1.mp3', 'N4Q2.mp3', 'N4Q3.mp3', 'N4Q4.mp3'],
	mondai: [
		{
			id: 'n4l-1',
			title: 'もんだい１',
			instruction:
				'もんだいを きいて、１から４の なかから、いちばん いい ものを ひとつ えらんで ください。',
			questions: [
				{
					id: 1,
					sentence: '女の人と男の人が電話で話しています。男の人はどこへ行きますか。',
					choices: [
						'スーパーと本屋 (Sūpā to honya)',
						'スーパーだけ (Sūpā dake)',
						'本屋だけ (Honya dake)',
						'コンビニと本屋 (Konbini to honya)'
					],
					answer: 1
				},
				{
					id: 2,
					sentence: '会社で男の人と女の人が話しています。会議はいつ始まりますか。',
					choices: [
						'午前10時 (Gozen jū-ji)',
						'午後1時 (Gogo ichi-ji)',
						'午後2時 (Gogo ni-ji)',
						'午後3時 (Gogo san-ji)'
					],
					answer: 3
				},
				{
					id: 3,
					sentence: '学校で先生が話しています。来週の月曜日に何を持ってきますか。',
					choices: [
						'教科書と辞書 (Kyōkasho to jisho)',
						'辞書だけ (Jisho dake)',
						'ノートと辞書 (Nōto to jisho)',
						'教科書だけ (Kyōkasho dake)'
					],
					answer: 3
				},
				{
					id: 4,
					sentence: '女の人が旅行の計画を話しています。新幹線で何時間かかりますか。',
					choices: [
						'1時間 (Ichi-jikan)',
						'2時間 (Ni-jikan)',
						'3時間 (San-jikan)',
						'4時間 (Yo-jikan)'
					],
					answer: 2
				}
			]
		}
	]
};
