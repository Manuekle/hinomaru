export type { JLPTLevel, JLPTSectionType, JLPTQuestion, JLPTMondai, JLPTTest } from './types';
export { LISTENING_TRANSCRIPTS } from './listening_transcripts';
export { n5v } from './n5v';
export { n5g } from './n5g';
export { n4v } from './n4v';
export { n4g } from './n4g';
export { n3v } from './n3v';
export { n3g } from './n3g';
export { n2v } from './n2v';
export { n2g } from './n2g';
export { n1v } from './n1v';
export { n1g } from './n1g';

import type { JLPTLevel, JLPTSectionType, JLPTTest } from './types';
import { n5v } from './n5v';
import { n5g } from './n5g';
import { n4v } from './n4v';
import { n4g } from './n4g';
import { n3v } from './n3v';
import { n3g } from './n3g';
import { n2v } from './n2v';
import { n2g } from './n2g';
import { n1v } from './n1v';
import { n1g } from './n1g';

export const jlptTests: Record<string, JLPTTest> = {
	N5_vocabulary: n5v,
	N5_grammar: n5g,
	N4_vocabulary: n4v,
	N4_grammar: n4g,
	N3_vocabulary: n3v,
	N3_grammar: n3g,
	N2_vocabulary: n2v,
	N2_grammar: n2g,
	N1_vocabulary: n1v,
	N1_grammar: n1g
};

export function getTest(level: JLPTLevel, type: JLPTSectionType): JLPTTest | null {
	return jlptTests[`${level}_${type}`] ?? null;
}

export const LEVEL_META: Record<
	JLPTLevel,
	{ label: string; desc_es: string; sections: JLPTSectionType[] }
> = {
	N5: {
		label: 'N5',
		desc_es: 'Nivel básico — vocabulario y gramática esenciales',
		sections: ['vocabulary', 'grammar', 'listening']
	},
	N4: {
		label: 'N4',
		desc_es: 'Nivel elemental — comunicación básica',
		sections: ['vocabulary', 'grammar', 'listening']
	},
	N3: {
		label: 'N3',
		desc_es: 'Nivel intermedio — situaciones cotidianas',
		sections: ['vocabulary', 'grammar', 'listening']
	},
	N2: {
		label: 'N2',
		desc_es: 'Nivel avanzado — temas generales',
		sections: ['vocabulary', 'grammar', 'listening']
	},
	N1: {
		label: 'N1',
		desc_es: 'Nivel maestría — comprensión amplia',
		sections: ['vocabulary', 'grammar', 'listening']
	}
};

export const SECTION_LABELS: Record<JLPTSectionType, { es: string; en: string; jp: string; romaji: string }> = {
	vocabulary: { es: 'Vocabulario', en: 'Vocabulary', jp: '語彙', romaji: 'go-i' },
	grammar: { es: 'Gramática', en: 'Grammar', jp: '文法', romaji: 'bun-pō' },
	listening: { es: 'Escucha', en: 'Listening', jp: '聴解', romaji: 'chōkai' }
};

export const AUDIO_FILES: Record<JLPTLevel, string[]> = {
	N1: ['N1Q1.mp3', 'N1Q2.mp3', 'N1Q3.mp3', 'N1Q4.mp3', 'N1Q5.mp3'],
	N2: ['N2Q1.mp3', 'N2Q2.mp3', 'N2Q3.mp3', 'N2Q4.mp3', 'N2Q5.mp3'],
	N3: ['N3Q1.mp3', 'N3Q2.mp3', 'N3Q3.mp3', 'N3Q4.mp3', 'N3Q5.mp3'],
	N4: ['N4Q1.mp3', 'N4Q2.mp3', 'N4Q3.mp3', 'N4Q4.mp3'],
	N5: ['N5Q1.mp3', 'N5Q2.mp3', 'N5Q3.mp3', 'N5Q4.mp3']
};
