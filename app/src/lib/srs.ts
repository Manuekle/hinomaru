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
  interval: number;
  next_review: string;
}

/**
 * Calculate next SRS state based on performance
 * @param quality 0 (wrong) to 5 (perfect)
 * @param current Current state (optional, defaults to new card)
 */
export function calculateNextReview(quality: number, current?: SRSState): SRSState {
  let { repetitions = 0, easiness = 2.5, interval = 0 } = current || {};

  // Step 1: Update Easiness Factor
  // formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
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
    interval,
    next_review: nextReviewDate.toISOString(),
  };
}

/**
 * Map user performance (correct/wrong) to quality (0-5)
 * 5: Perfect
 * 4: Correct after hesitation
 * 3: Correct after difficulty
 * 2: Wrong but remembered
 * 1: Wrong, looked familiar
 * 0: Total blackout
 */
export function mapPerformanceToQuality(correct: boolean, struggled: boolean = false): number {
  if (!correct) return 0;
  return struggled ? 3 : 5;
}
