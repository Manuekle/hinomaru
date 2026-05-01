import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();

	const [deckRes, progressRes] = await Promise.all([
		locals.supabase.from('decks').select('*').eq('id', params.id).single(),
		user
			? locals.supabase
					.from('progress')
					.select('card_id, cards!inner(deck_id)', { count: 'exact', head: true })
					.eq('user_id', user.id)
					.eq('learned', true)
					.eq('cards.deck_id', params.id)
			: Promise.resolve({ count: 0 })
	]);

	const deck = deckRes.data;
	if (!deck) throw error(404, 'Deck not found');

	// Daily goal progress (cross-deck)
	let dailyGoal = 5;
	let learnedToday = 0;

	if (user) {
		const todayStart = new Date();
		todayStart.setUTCHours(0, 0, 0, 0);

		const [profileRes, todayRes] = await Promise.all([
			locals.supabase.from('profiles').select('daily_goal').eq('id', user.id).maybeSingle(),
			locals.supabase
				.from('progress')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', user.id)
				.eq('learned', true)
				.gte('last_seen', todayStart.toISOString())
		]);

		dailyGoal = profileRes.data?.daily_goal ?? 5;
		learnedToday = todayRes.count ?? 0;
	}

	return {
		deck: { ...deck, learned: progressRes.count ?? 0 },
		dailyGoal,
		learnedToday
	};
};
