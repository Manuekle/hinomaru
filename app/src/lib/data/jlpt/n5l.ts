import type { JLPTTest } from './types';

export const n5l: JLPTTest = {
	level: 'N5',
	type: 'listening',
	duration: 30,
	audioFiles: ['N5Q1.mp3', 'N5Q2.mp3', 'N5Q3.mp3', 'N5Q4.mp3'],
	mondai: [
		{
			id: 'n5l-1',
			title: 'もんだい１',
			instruction: 'えを みながら しつもんを きいて ください。つぎに、１から ４の なかから、いちばん いい ものを ひとつ えらんで ください。',
			questions: [
				{
					id: 1,
					sentence: '男の人と女の人が話しています。男の人はどこへ行きますか。',
					choices: [
						'銀行のとなり (Ginkō no tonari)',
						'銀行のまえ (Ginkō no mae)',
						'交差点のひだり (Kōsaten no hidari)',
						'交差点のみぎ (Kōsaten no migi)'
					],
					answer: 1
				},
				{
					id: 2,
					sentence: '会社で女の人と男の人が話しています。男の人はどの雑誌を女の人に渡しますか。',
					choices: [
						'8月の時計の雑誌 (8-gatsu no tokei no zasshi)',
						'7月の時計の雑誌 (7-gatsu no tokei no zasshi)',
						'8月の車の雑誌 (8-gatsu no kuruma no zasshi)',
						'7月の車の雑誌 (7-gatsu no kuruma no zasshi)'
					],
					answer: 2
				},
				{
					id: 3,
					sentence: '学校で先生が話しています。学生は、次、何日に学校に来ますか。',
					choices: [
						'四日 (Yokka)',
						'六日 (Muika)',
						'九日 (Kokonoka)',
						'十日 (Tōka)'
					],
					answer: 4
				},
				{
					id: 4,
					sentence: 'うちで女の学生と男の学生が話しています。男の学生は冷蔵庫から何を出しますか。',
					choices: [
						'卵2個と牛乳と魚 (Tamago 2-ko to gyūnyū to sakana)',
						'卵3個と牛乳と魚 (Tamago 3-ko to gyūnyū to sakana)',
						'卵3個と魚 (Tamago 3-ko to sakana)',
						'卵2個と魚 (Tamago 2-ko to sakana)'
					],
					answer: 2
				}
			]
		}
	]
};
