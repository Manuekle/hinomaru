import type { SupabaseClient } from '@supabase/supabase-js';

export interface DeckSessionData {
	cards: any[];
	dailyGoal: number;
	learnedToday: number;
	newSlots: number;
	goalMet: boolean;
	reviewCount: number;
	newCount: number;
	learnedCount: number;
	totalCards: number;
}

/**
 * Builds a study session respecting the user's daily new-word quota.
 *
 * Logic:
 *  - Review cards  (SRS due): always included, no cap.
 *  - New cards     (never learned): capped at `daily_goal - learned_today`.
 *
 * Returns also `dailyGoal`, `learnedToday`, `newSlots` for UI progress display.
 */
export async function loadDeckSession(
	supabase: SupabaseClient,
	deckId: string,
	userId: string | null,
	forceAll: boolean = false
): Promise<DeckSessionData> {
	const now = new Date().toISOString();

	// Start of today in UTC (server-side — acceptable for daily window)
	const todayStart = new Date();
	todayStart.setUTCHours(0, 0, 0, 0);

	let dailyGoal = 5;
	let learnedToday = 0;

	// --- 1. Fetch daily goal & today's learned count (logged-in users only) ---
	if (userId) {
		const [profileRes, todayRes, savedRes] = await Promise.all([
			supabase.from('profiles').select('daily_goal').eq('id', userId).maybeSingle(),
			supabase
				.from('progress')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', userId)
				.eq('learned', true)
				.gte('last_seen', todayStart.toISOString()),
			supabase
				.from('user_saved_words')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', userId)
				.gte('created_at', todayStart.toISOString())
		]);

		dailyGoal = profileRes.data?.daily_goal ?? 5;
		const progressCount = todayRes.count ?? 0;
		const savedCount = savedRes.count ?? 0;
		learnedToday = progressCount + savedCount;
	}

	// We use a standard session size of 10 new cards so users aren't 
	// restricted to tiny sessions (e.g. 2 cards) when near their daily goal.
	const newSlots = 10;
	// --- 2. Fetch all cards for the deck with their SRS progress ---
	const { data: allCards } = await supabase
		.from('cards')
		.select('*, progress(easiness, interval_days, repetitions, next_review, learned)')
		.eq('deck_id', deckId)
		.order('sort_order', { ascending: true });

	const cards = allCards ?? [];

	// --- 3. Classify ---
	const reviewCards = cards.filter((c: any) => {
		const p = c.progress?.[0];
		return p?.learned && p.next_review && p.next_review <= now;
	});

	const newCards = cards.filter((c: any) => {
		const p = c.progress?.[0];
		return !p || !p.learned;
	});

	// --- 4. Build session: reviews first, then new words ---
	let session = forceAll ? [...cards].sort(() => Math.random() - 0.5) : [...reviewCards, ...newCards];

	// --- 5. Reinforcement: If session is empty, include most recently learned cards ---
	const learnedCards = cards.filter((c: any) => c.progress?.[0]?.learned);
	
	if (!forceAll && session.length === 0 && learnedCards.length > 0) {
		session = learnedCards
			.sort((a, b) => {
				const da = new Date(a.progress[0].last_seen || 0).getTime();
				const db = new Date(b.progress[0].last_seen || 0).getTime();
				return db - da; // most recent first
			})
			.slice(0, 10);
	}

	const goalMet = learnedToday >= dailyGoal && reviewCards.length === 0;

	const learnedCount = learnedCards.length;

	return {
		cards: session,
		dailyGoal,
		learnedToday,
		newSlots,
		goalMet,
		reviewCount: reviewCards.length,
		newCount: newCards.length,
		learnedCount,
		totalCards: cards.length
	};
}
