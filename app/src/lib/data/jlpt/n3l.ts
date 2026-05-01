import type { JLPTTest } from './types';

export const n3l: JLPTTest = {
	level: 'N3',
	type: 'listening',
	duration: 40,
	audioFiles: ['N3Q1.mp3', 'N3Q2.mp3', 'N3Q3.mp3', 'N3Q4.mp3', 'N3Q5.mp3'],
	mondai: [
		{
			id: 'n3l-1',
			title: 'もんだい１',
			instruction:
				'もんだいを きいて、１から４の なかから、いちばん いい ものを ひとつ えらんで ください。',
			questions: [
				{
					id: 1,
					sentence: '男の人と女の人が話しています。二人は週末にどこへ行くことにしましたか。',
					choices: [
						'動物園 (Dōbutsuen)',
						'水族館 (Suizokukan)',
						'映画館 (Eigakan)',
						'美術館 (Bijutsukan)'
					],
					answer: 2
				},
				{
					id: 2,
					sentence: 'ラジオで天気予報を聞いています。明日の午後はどんな天気ですか。',
					choices: [
						'晴れ (Hare)',
						'曇り (Kumori)',
						'雨 (Ame)',
						'雪 (Yuki)'
					],
					answer: 3
				},
				{
					id: 3,
					sentence: '会社で男の人が電話で話しています。男の人は今から何をしますか。',
					choices: [
						'会議室を予約する (Kaigishitsu wo yoyaku suru)',
						'資料を印刷する (Shiryō wo insatsu suru)',
						'お客さんを迎えに行く (Okyakusan wo mukae ni iku)',
						'上司に報告する (Jōshi ni hōkoku suru)'
					],
					answer: 2
				},
				{
					id: 4,
					sentence: 'デパートのアナウンスを聞いています。今日の閉店時間は何時ですか。',
					choices: [
						'午後7時 (Gogo shichi-ji)',
						'午後8時 (Gogo hachi-ji)',
						'午後9時 (Gogo ku-ji)',
						'午後10時 (Gogo jū-ji)'
					],
					answer: 3
				},
				{
					id: 5,
					sentence: '二人の学生が話しています。女の学生はなぜ疲れていますか。',
					choices: [
						'アルバイトが忙しかったから (Arubaito ga isogashikatta kara)',
						'勉強をしすぎたから (Benkyō wo shi sugita kara)',
						'昨日よく眠れなかったから (Kinō yoku nemurenakatta kara)',
						'運動をしすぎたから (Undō wo shi sugita kara)'
					],
					answer: 1
				}
			]
		}
	]
};
