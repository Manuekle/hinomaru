import { normalizeJapanese } from './normalize';

// ── Levenshtein edit distance ─────────────────────────────────────────────────
export function levenshtein(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	if (m === 0) return n;
	if (n === 0) return m;

	// Use rolling array (O(n) space)
	let prev = Array.from({ length: n + 1 }, (_, j) => j);
	let curr = new Array<number>(n + 1);

	for (let i = 1; i <= m; i++) {
		curr[0] = i;
		for (let j = 1; j <= n; j++) {
			curr[j] =
				a[i - 1] === b[j - 1]
					? prev[j - 1]
					: 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
		}
		[prev, curr] = [curr, prev];
	}
	return prev[n];
}

// ── Similarity 0→1 ───────────────────────────────────────────────────────────
export function similarity(a: string, b: string): number {
	if (!a && !b) return 1;
	if (!a || !b) return 0;
	const maxLen = Math.max(a.length, b.length);
	if (maxLen === 0) return 1;
	return 1 - levenshtein(a, b) / maxLen;
}

// Best-window similarity: slide target-length window over text
function bestWindowSimilarity(text: string, target: string): number {
	const tLen = target.length;
	if (text.length === 0 || tLen === 0) return similarity(text, target);
	if (text.length < tLen) return similarity(text, target);

	let best = 0;
	for (let i = 0; i <= text.length - tLen; i++) {
		const s = similarity(text.slice(i, i + tLen), target);
		if (s > best) best = s;
		// Early exit — can't improve
		if (best === 1) break;
	}
	return best;
}

// ── Score classification ──────────────────────────────────────────────────────
export type ScoreLevel = 'correct' | 'close' | 'wrong';

export function classify(score: number): ScoreLevel {
	if (score >= 0.8) return 'correct';
	if (score >= 0.55) return 'close';
	return 'wrong';
}

export const SCORE_LABELS: Record<ScoreLevel, string> = {
	correct: '✅ Correcto',
	close: '🟡 Casi correcto',
	wrong: '❌ Incorrecto'
};

export const SCORE_COLORS: Record<ScoreLevel, string> = {
	correct: 'var(--success)',
	close: 'var(--warning, #f59e0b)',
	wrong: 'var(--hinomaru-red)'
};

// ── Per-segment comparison ────────────────────────────────────────────────────
export interface SegmentResult {
	segment: string;         // original segment text
	score: number;           // 0–1
	level: ScoreLevel;
}

export interface CompareResult {
	overallScore: number;
	overallLevel: ScoreLevel;
	segments: SegmentResult[];
	spokenNorm: string;      // normalized spoken text (for display)
}

export function comparePhrase(target: string, spoken: string, segments: string[]): CompareResult {
	const normSpoken = normalizeJapanese(spoken);
	const normTarget = normalizeJapanese(target);

	// Overall score: compare normalized full strings
	const overallScore = similarity(normTarget, normSpoken);
	const overallLevel = classify(overallScore);

	// Per-segment scores
	const segResults: SegmentResult[] = segments.map((seg) => {
		const normSeg = normalizeJapanese(seg);
		// Sliding window within spoken to find best match for this segment
		const score = bestWindowSimilarity(normSpoken, normSeg);
		return { segment: seg, score, level: classify(score) };
	});

	return { overallScore, overallLevel, segments: segResults, spokenNorm: normSpoken };
}
