import type { CardData } from '../types';

// N4 Vocabulary — add entries here following the same structure as N5
// Official N4 list: ~1500 words (N5 already included)
// TODO: populate with full N4 word list
export const vocabulary: CardData[] = [
	{
		jp: '会議',
		romaji: 'kaigi',
		en: 'meeting / conference',
		es: 'reunión / conferencia',
		example: '会議があります。',
		example_en: 'There is a meeting.',
		example_es: 'Hay una reunión.',
		sort_order: 1
	},
	{
		jp: '運動',
		romaji: 'undou',
		en: 'exercise / sports',
		es: 'ejercicio / deporte',
		example: '毎日運動します。',
		example_en: 'I exercise every day.',
		example_es: 'Hago ejercicio todos los días.',
		sort_order: 2
	},
	{
		jp: '温度',
		romaji: 'ondo',
		en: 'temperature',
		es: 'temperatura',
		example: '温度が高いです。',
		example_en: 'The temperature is high.',
		example_es: 'La temperatura es alta.',
		sort_order: 3
	},
	{
		jp: '関係',
		romaji: 'kankei',
		en: 'relation / connection',
		es: 'relación',
		example: '関係がありません。',
		example_en: 'It has no relation.',
		example_es: 'No tiene relación.',
		sort_order: 4
	},
	{
		jp: '経験',
		romaji: 'keiken',
		en: 'experience',
		es: 'experiencia',
		example: '経験がありますか。',
		example_en: 'Do you have experience?',
		example_es: '¿Tienes experiencia?',
		sort_order: 5
	}
];
