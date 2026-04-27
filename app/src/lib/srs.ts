/**
 * SM-2 Algorithm Implementation for Spaced Repetition System (SRS)
 *
 * Logic:
 * q: Quality of response (0-5)
 * n: Number of repetitions
 * ef: Easiness Factor (starts at 2.5)
 * i: Interval in days
 */

export interface SRSState {
	repetitions: number;
	easiness: number;
	interval_days: number;
	next_review: string;
}

/**
 * Calculate next SRS state based on performance
 * @param quality 0 (wrong) to 5 (perfect)
 * @param current Current state (optional, defaults to new card)
 */
export function calculateNextReview(quality: number, current?: SRSState): SRSState {
	let { repetitions = 0, easiness = 2.5, interval_days: interval = 0 } = current || {};

	// "Lapse" concept: if a mature card (interval > 7) is answered wrong,
	// reset interval to 1 but apply a smaller easiness penalty than a fresh miss
	const isLapse = quality < 3 && interval > 7;

	// Step 1: Update Easiness Factor
	// formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
	if (isLapse) {
		// Softer penalty for lapses on mature cards
		easiness = easiness - 0.10;
	} else {
		easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
	}
	if (easiness < 1.3) easiness = 1.3;

	// Step 2: Update Repetitions and Interval
	if (quality < 3) {
		// If response was incorrect, start over
		repetitions = 0;
		interval = 1;
	} else {
		// If response was correct
		if (repetitions === 0) {
			interval = 1;
		} else if (repetitions === 1) {
			interval = 6;
		} else {
			interval = Math.round(interval * easiness);
		}
		repetitions += 1;
	}

	// Step 3: Calculate Next Review Date
	const nextReviewDate = new Date();
	nextReviewDate.setDate(nextReviewDate.getDate() + interval);

	return {
		repetitions,
		easiness: Number(easiness.toFixed(2)),
		interval_days: interval,
		next_review: nextReviewDate.toISOString()
	};
}

/**
 * Map user performance (correct/wrong + speed) to SM-2 quality (0-5).
 *
 * @param correct  Whether the answer was correct
 * @param struggled Whether the user found it hard
 * @param speed    How quickly the user answered (default: 'normal')
 *
 * Quality scale used:
 *  5 – Correct + instant (fast)
 *  4 – Correct + normal speed
 *  3 – Correct but slow / struggled
 *  2 – Wrong but recognised the answer when shown
 *  0 – Total blackout / completely wrong
 */
export function mapPerformanceToQuality(
	correct: boolean,
	struggled: boolean = false,
	speed: 'fast' | 'normal' | 'slow' = 'normal'
): number {
	if (!correct) {
		// Wrong but recognised → quality 2 (back but not full reset)
		return struggled ? 2 : 0;
	}
	if (struggled || speed === 'slow') return 3;
	if (speed === 'fast') return 5;
	return 4; // correct, normal speed
}

/**
 * Returns true if a card is due for review right now.
 */
export function isDue(nextReview: string): boolean {
	if (!nextReview) return false;
	return new Date(nextReview) <= new Date();
}

/**
 * Returns a status label for a card based on its next_review date.
 *  'new'   – no next_review set
 *  'due'   – overdue or due today
 *  'soon'  – due within the next 3 days
 *  'later' – due in 4 or more days
 */
export function getCardDueStatus(nextReview: string | null | undefined): 'due' | 'soon' | 'later' | 'new' {
	if (!nextReview) return 'new';

	const now = new Date();
	const reviewDate = new Date(nextReview);
	const diffMs = reviewDate.getTime() - now.getTime();
	const diffDays = diffMs / (1000 * 60 * 60 * 24);

	if (diffDays <= 0) return 'due';
	if (diffDays <= 3) return 'soon';
	return 'later';
}
