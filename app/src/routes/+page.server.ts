import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	const today = new Date().toISOString().split('T')[0];

	// Start all queries in parallel
	const [decksRes, progressRes, streakRes, storyRes, wordRes, cardsRes, lessonProgressRes] = await Promise.all([
		locals.supabase.from('decks').select('*').order('level', { ascending: true }),
		user
			? locals.supabase
					.from('progress')
					.select('card_id, learned, next_review, cards(deck_id)')
					.eq('user_id', user.id)
					.eq('learned', true)
			: Promise.resolve({ data: [] }),
		user
			? locals.supabase.from('profiles').select('current_streak, xp, level, avatar, total_lessons, srs_enabled, daily_goal, motivation').eq('id', user.id).maybeSingle()
			: Promise.resolve({ data: null }),
		user
			? locals.supabase
					.from('stories')
					.select('id, level, title_en, title_es, body_jp, publish_date')
					.lte('publish_date', today)
					.order('id')
			: Promise.resolve({ data: [] }),
		locals.supabase.from('daily_words').select('*').eq('publish_date', today).maybeSingle(),
		locals.supabase.from('cards').select('deck_id'),
		user
			? locals.supabase.from('lesson_progress').select('*').eq('user_id', user.id)
			: Promise.resolve({ data: [] })
	]);

	const decks = decksRes.data ?? [];
	const progressData = progressRes.data ?? [];
	const profile = streakRes.data;
	const stories = storyRes.data ?? [];
	const todayWord = wordRes.data;
	const allCards = cardsRes.data ?? [];

	// Calculate real card counts per deck
	const realCardCounts: Record<string, number> = {};
	for (const c of allCards) {
		if (c.deck_id) {
			realCardCounts[c.deck_id] = (realCardCounts[c.deck_id] ?? 0) + 1;
		}
	}

	// Deterministic daily rotation matching /deck/stories/today
	const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
	const todayStory = stories.length > 0 ? stories[daysSinceEpoch % stories.length] : null;

	// Process progress data
	const learnedByDeck: Record<string, number> = {};
	const dueByDeck: Record<string, number> = {};
	const now = new Date().toISOString();

	for (const row of progressData) {
		const deckId = (row.cards as any)?.deck_id;
		if (deckId) {
			learnedByDeck[deckId] = (learnedByDeck[deckId] ?? 0) + 1;
			if (row.next_review && row.next_review <= now) {
				dueByDeck[deckId] = (dueByDeck[deckId] ?? 0) + 1;
			}
		}
	}

	// Dependent queries (these need results from the first batch)
	let storyRead = false;
	let wordSaved = false;
	let learnedToday = 0;
	const dailyGoal = (profile as any)?.daily_goal ?? 5;

	if (user) {
		const todayStart = new Date();
		todayStart.setUTCHours(0, 0, 0, 0);

		const queries = [];
		if (todayStory) {
			queries.push(
				locals.supabase
					.from('user_story_reads')
					.select('id')
					.eq('user_id', user.id)
					.eq('story_id', todayStory.id)
					.maybeSingle()
			);
		} else {
			queries.push(Promise.resolve({ data: null }));
		}

		if (todayWord) {
			queries.push(
				locals.supabase
					.from('user_saved_words')
					.select('id')
					.eq('user_id', user.id)
					.eq('jp', todayWord.jp)
					.maybeSingle()
			);
		} else {
			queries.push(Promise.resolve({ data: null }));
		}

		// Count new cards learned today (cross-deck)
		queries.push(
			locals.supabase
				.from('progress')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', user.id)
				.eq('learned', true)
				.gte('last_seen', todayStart.toISOString())
		);

		// Count words saved today
		queries.push(
			locals.supabase
				.from('user_saved_words')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', user.id)
				.gte('created_at', todayStart.toISOString())
		);

		const [readRes, savedRes, todayRes, savedTodayRes] = await Promise.all(queries);
		storyRead = !!readRes.data;
		wordSaved = !!savedRes.data;
		
		const learnedCardsCount = (todayRes as any)?.count ?? 0;
		const savedWordsCount = (savedTodayRes as any)?.count ?? 0;
		learnedToday = learnedCardsCount + savedWordsCount;
	}


	return {
		user,
		profile,
		motivation: (profile as any)?.motivation,
		decks: decks.map((d: any) => ({
			...d,
			card_count: realCardCounts[d.id] ?? d.card_count,
			learned: learnedByDeck[d.id] ?? 0,
			due: dueByDeck[d.id] ?? 0
		})),
		streak: profile?.current_streak ?? 0,
		todayStory,
		storyRead,
		todayWord,
		wordSaved,
		learnedToday,
		dailyGoal,
		lessonProgress: lessonProgressRes.data ?? []
	};
};
