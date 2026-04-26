import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	const { data: decks } = await locals.supabase
		.from('decks')
		.select('*')
		.order('level', { ascending: true });

	const progress = user
		? await locals.supabase
				.from('progress')
				.select('card_id, learned, next_review, cards(deck_id)')
				.eq('user_id', user.id)
				.eq('learned', true)
		: { data: [] };

	const learnedByDeck: Record<string, number> = {};
	const dueByDeck: Record<string, number> = {};
	const now = new Date().toISOString();

	for (const row of progress.data ?? []) {
		const deckId = (row.cards as any)?.deck_id;
		if (deckId) {
			learnedByDeck[deckId] = (learnedByDeck[deckId] ?? 0) + 1;
			if (row.next_review && row.next_review <= now) {
				dueByDeck[deckId] = (dueByDeck[deckId] ?? 0) + 1;
			}
		}
	}

	const { data: streakData } = user ? await locals.supabase.rpc('get_user_streak') : { data: 0 };
	const streakDays = streakData ?? 0;

	// Historia del día — la más reciente con publish_date <= hoy
	const today = new Date().toISOString().split('T')[0];
	let todayStory: any = null;
	let storyRead = false;

	if (user) {
		const { data: story } = await locals.supabase
			.from('stories')
			.select('id, level, title_en, title_es, body_jp, publish_date')
			.lte('publish_date', today)
			.order('publish_date', { ascending: false })
			.limit(1)
			.single();

		if (story) {
			todayStory = story;
			const { data: readRow } = await locals.supabase
				.from('user_story_reads')
				.select('id')
				.eq('user_id', user.id)
				.eq('story_id', story.id)
				.maybeSingle();
			storyRead = !!readRow;
		}
	}

	// Word of the day
	const { data: todayWord } = await locals.supabase
		.from('daily_words')
		.select('*')
		.eq('publish_date', today)
		.maybeSingle();

	let wordSaved = false;
	if (user && todayWord) {
		const { data: savedWord } = await locals.supabase
			.from('user_saved_words')
			.select('id')
			.eq('user_id', user.id)
			.eq('jp', todayWord.jp)
			.maybeSingle();
		wordSaved = !!savedWord;
	}

	return {
		user,
		decks: (decks ?? []).map((d: any) => ({
			...d,
			learned: learnedByDeck[d.id] ?? 0,
			due: dueByDeck[d.id] ?? 0
		})),
		streak: streakDays ?? 0,
		todayStory,
		storyRead,
		todayWord,
		wordSaved
	};
};
