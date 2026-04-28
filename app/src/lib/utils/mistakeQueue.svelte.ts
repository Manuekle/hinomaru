/**
 * Mistake re-queue helper for SRS sessions.
 *
 * Behaviour: when the user gets a card wrong, we re-queue it at the end of
 * the working list so it must be answered correctly before the session ends
 * (Duolingo-style). The original card length is preserved for the progress
 * bar so the user can still see how many "first-pass" cards remain.
 */
export function createMistakeQueue<T>(initial: T[]) {
	let cards = $state<T[]>([...initial]);
	const originalTotal = initial.length;
	let i = $state(0);

	return {
		get cards() {
			return cards;
		},
		get index() {
			return i;
		},
		get current() {
			return cards[i];
		},
		get total() {
			return cards.length;
		},
		get originalTotal() {
			return originalTotal;
		},
		get progressPct() {
			return Math.min(100, ((i + 1) / cards.length) * 100);
		},
		get isLast() {
			return i >= cards.length - 1;
		},
		/** Re-queue current card to the end of the list */
		requeueCurrent() {
			cards = [...cards, cards[i]];
		},
		advance() {
			i++;
		},
		reset() {
			cards = [...initial];
			i = 0;
		}
	};
}
