export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
export type JLPTSectionType = 'vocabulary' | 'grammar' | 'listening';

export interface JLPTQuestion {
	id: number;
	/** Full sentence shown to user. Use ＿＿＿ for blank or underline target. */
	sentence: string;
	/** The specific word/phrase being tested (underlined in original PDF) */
	underlined?: string;
	choices: [string, string, string, string];
	/** 1-indexed correct answer */
	answer: 1 | 2 | 3 | 4;
}

export interface JLPTMondai {
	id: string;
	title: string;
	instruction: string;
	questions: JLPTQuestion[];
}

export interface JLPTTest {
	level: JLPTLevel;
	type: JLPTSectionType;
	/** Duration in minutes */
	duration: number;
	mondai: JLPTMondai[];
	/** For listening tests: array of MP3 filenames in /jlpt/audio/ */
	audioFiles?: string[];
}
