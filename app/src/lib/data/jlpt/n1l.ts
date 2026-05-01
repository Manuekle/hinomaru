import type { JLPTTest } from './types';

export const n1l: JLPTTest = {
	level: 'N1',
	type: 'listening',
	duration: 55,
	audioFiles: ['N1Q1.mp3', 'N1Q2.mp3', 'N1Q3.mp3', 'N1Q4.mp3', 'N1Q5.mp3'],
	mondai: [
		{
			id: 'n1l-1',
			title: 'もんだい１',
			instruction:
				'もんだいを きいて、１から４の なかから、いちばん いい ものを ひとつ えらんで ください。',
			questions: [
				{
					id: 1,
					sentence:
						'大学の講義で教授が話しています。この研究の独自性として述べていないことはどれですか。',
					choices: [
						'従来の方法論を批判的に再検討した点 (Jūrai no hōhōron wo hihanteki ni saikentō shita ten)',
						'フィールドワークと理論分析を統合した点 (Fīrudo wāku to riron bunseki wo tōgō shita ten)',
						'複数の学問領域を横断的に分析した点 (Fukusū no gakumon ryōiki wo ōdanteki ni bunseki shita ten)',
						'大規模データによる定量的検証を行った点 (Daikibu dēta ni yoru teikiryōteki kenshō wo okonatta ten)'
					],
					answer: 4
				},
				{
					id: 2,
					sentence:
						'ドキュメンタリー番組を見ています。この職人が最も大切にしていることは何ですか。',
					choices: [
						'効率的な生産方法の追求 (Kōritsuteki na seisan hōhō no tsuikyū)',
						'伝統技術の忠実な継承 (Dentō gijutsu no chūjitsuna keishō)',
						'素材の特性を生かした創造 (Sozai no tokusei wo ikashita sōzō)',
						'市場のニーズへの柔軟な対応 (Shijō no nīzu e no jūnan na taiō)'
					],
					answer: 3
				},
				{
					id: 3,
					sentence:
						'シンポジウムで二人の専門家が議論しています。二人の意見が一致しているのはどれですか。',
					choices: [
						'政策の方向性 (Seisaku no hōkōsei)',
						'問題の深刻さの認識 (Mondai no shinkokusa no ninshiki)',
						'解決策の優先順位 (Kaiketsusaku no yūsen jun\'i)',
						'データの解釈方法 (Dēta no kaishaku hōhō)'
					],
					answer: 2
				},
				{
					id: 4,
					sentence:
						'ラジオの対談で作家が話しています。この作家が執筆において最も重視していることは何ですか。',
					choices: [
						'読者が共感できるキャラクターの造形 (Dokusha ga kyōkan dekiru kyarakutā no zōkei)',
						'社会問題への鋭い批評性 (Shakai mondai e no surudoi hihyōsei)',
						'言語の新しい可能性の探求 (Gengo no atarashii kanōsei no tankyū)',
						'普遍的な人間の真実の追求 (Fuhen-teki na ningen no shinjitsu no tsuikyū)'
					],
					answer: 4
				},
				{
					id: 5,
					sentence:
						'会議で上司と部下が話しています。この件について部下が上司に対して感じていることは何ですか。',
					choices: [
						'上司の判断は正しいが、方法に問題があると思っている (Jōshi no handan wa tadashii ga, hōhō ni mondai ga aru to omotteiru)',
						'上司の指示が理解できず、もっと説明が必要だと思っている (Jōshi no shiji ga rikai dekizu, motto setsumei ga hitsuyō da to omotteiru)',
						'自分の意見を無視されたと感じ、不満を持っている (Jibun no iken wo mushi sareta to kanji, fuman wo motteiru)',
						'上司を信頼しており、どんな決断も受け入れる準備ができている (Jōshi wo shinrai shite ori, donna ketsudan mo ukeireru junbi ga dekite iru)'
					],
					answer: 3
				}
			]
		}
	]
};
