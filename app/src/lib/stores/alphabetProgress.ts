import { writable, get } from 'svelte/store';

export type CharProgress = {
	seen: number;
	correct: number;
	mastery: number; // 0..3
};

const KEY = 'alphabet_progress_v1';

function load(): Record<string, CharProgress> {
	if (typeof localStorage === 'undefined') return {};
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}');
	} catch {
		return {};
	}
}

function persist(state: Record<string, CharProgress>) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(KEY, JSON.stringify(state));
}

export const alphabetProgress = writable<Record<string, CharProgress>>(load());

alphabetProgress.subscribe((s) => persist(s));

export function recordResult(charId: string, correct: boolean) {
	const state = get(alphabetProgress);
	const cur = state[charId] ?? { seen: 0, correct: 0, mastery: 0 };
	const next: CharProgress = {
		seen: cur.seen + 1,
		correct: cur.correct + (correct ? 1 : 0),
		mastery: correct ? Math.min(3, cur.mastery + 1) : Math.max(0, cur.mastery - 1)
	};
	alphabetProgress.set({ ...state, [charId]: next });
}

export function masteryOf(p: CharProgress | undefined): number {
	return p?.mastery ?? 0;
}

export function isLearned(p: CharProgress | undefined): boolean {
	return (p?.mastery ?? 0) >= 2;
}
