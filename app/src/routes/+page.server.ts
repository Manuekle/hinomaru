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

	const { count: streakDays } = await locals.supabase
		.from('sessions')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', user?.id ?? '')
		.gte('created_at', new Date(Date.now() - 14 * 86400000).toISOString());

	return {
		decks: (decks ?? []).map((d: any) => ({
			...d,
			learned: learnedByDeck[d.id] ?? 0,
			due: dueByDeck[d.id] ?? 0
		})),
		streak: streakDays ?? 0
	};
};
