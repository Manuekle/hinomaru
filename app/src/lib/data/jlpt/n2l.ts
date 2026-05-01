import type { JLPTTest } from './types';

export const n2l: JLPTTest = {
	level: 'N2',
	type: 'listening',
	duration: 50,
	audioFiles: ['N2Q1.mp3', 'N2Q2.mp3', 'N2Q3.mp3', 'N2Q4.mp3', 'N2Q5.mp3'],
	mondai: [
		{
			id: 'n2l-1',
			title: 'もんだい１',
			instruction:
				'もんだいを きいて、１から４の なかから、いちばん いい ものを ひとつ えらんで ください。',
			questions: [
				{
					id: 1,
					sentence:
						'ニュースを聞いています。この会社が新しいサービスを始める理由はなんですか。',
					choices: [
						'競合他社に対抗するため (Kyōgō taisha ni taikō suru tame)',
						'若い世代のニーズに応えるため (Wakai sedai no nīzu ni kotaeru tame)',
						'コストを削減するため (Kosuto wo sakugen suru tame)',
						'海外市場に進出するため (Kaigai shijō ni shinshutsu suru tame)'
					],
					answer: 2
				},
				{
					id: 2,
					sentence: '男性と女性が職場で話しています。プロジェクトの問題点は何ですか。',
					choices: [
						'予算が不足していること (Yosan ga fusoku shite iru koto)',
						'人員が足りないこと (Jin\'in ga tarinai koto)',
						'スケジュールが遅れていること (Sukejūru ga okurete iru koto)',
						'技術的な問題があること (Gijutsuteki na mondai ga aru koto)'
					],
					answer: 3
				},
				{
					id: 3,
					sentence: '講演会で専門家が話しています。現代社会の課題として挙げていないものはどれですか。',
					choices: [
						'少子化問題 (Shōshika mondai)',
						'環境汚染 (Kankyō osen)',
						'経済格差の拡大 (Keizai kakusa no kakudai)',
						'食糧不足 (Shokuryō busoku)'
					],
					answer: 4
				},
				{
					id: 4,
					sentence: '二人が話しています。女性はなぜその映画が印象に残ったと言っていますか。',
					choices: [
						'映像が美しかったから (Eizō ga utsukushikatta kara)',
						'音楽がよかったから (Ongaku ga yokatta kara)',
						'ストーリーが独特だったから (Sutōrī ga dokutoku datta kara)',
						'俳優の演技が素晴らしかったから (Haiyū no engi ga subarashikatta kara)'
					],
					answer: 3
				},
				{
					id: 5,
					sentence: 'ラジオで専門家が話しています。健康維持のために最も重要だと言っていることは何ですか。',
					choices: [
						'規則正しい睡眠 (Kisoku tadashii suimin)',
						'バランスの良い食事 (Baransu no yoi shokuji)',
						'適度な運動 (Tekido na undō)',
						'ストレス管理 (Sutoresu kanri)'
					],
					answer: 1
				}
			]
		}
	]
};
