// Pure step-queue engine for the guided learning experience.
// No DOM, no I/O — safe to import client and server.

export type StepKind =
	| 'recognize'
	| 'choose'
	| 'write'
	| 'listen'
	| 'speak'
	| 'fill_sentence'
	| 'build_sentence';

export interface Step {
	id: string;
	cardId: string;
	kind: StepKind;
	retries: number;
}

export interface EngineState {
	queue: Step[];
	done: Step[];
	current: Step | null;
	totalPlanned: number;
	correct: number;
	mistakes: number;
}

export function init(initialQueue: Step[]): EngineState {
	const queue = [...initialQueue];
	const current = queue.shift() ?? null;
	return {
		queue,
		done: [],
		current,
		totalPlanned: initialQueue.length,
		correct: 0,
		mistakes: 0
	};
}

export function answer(state: EngineState, correct: boolean): EngineState {
	if (!state.current) return state;
	const cur = state.current;
	const queue = [...state.queue];
	const done = [...state.done];
	let mistakes = state.mistakes;
	let correctCount = state.correct;

	if (correct) {
		correctCount += 1;
		done.push(cur);
	} else {
		mistakes += 1;
		const requeued: Step = { ...cur, retries: cur.retries + 1 };
		// Reinsert at position 2-3 ahead so user retries soon but not immediately.
		const insertAt = Math.min(queue.length, queue.length === 0 ? 0 : 2 + (cur.retries % 2));
		queue.splice(insertAt, 0, requeued);
	}

	const next = queue.shift() ?? null;
	return {
		...state,
		queue,
		done,
		current: next,
		correct: correctCount,
		mistakes
	};
}

export function isComplete(s: EngineState): boolean {
	return s.current === null && s.queue.length === 0;
}

export function progressPct(s: EngineState): number {
	if (s.totalPlanned === 0) return 0;
	return Math.min(100, Math.round((s.done.length / s.totalPlanned) * 100));
}

export function accuracyPct(s: EngineState): number {
	const total = s.correct + s.mistakes;
	if (total === 0) return 100;
	return Math.round((s.correct / total) * 100);
}
