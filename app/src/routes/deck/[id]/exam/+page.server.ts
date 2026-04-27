import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [deckRes, cardsRes] = await Promise.all([
		locals.supabase.from('decks').select('*').eq('id', params.id).single(),
		locals.supabase
			.from('cards')
			.select('*, progress(easiness, interval_days, repetitions, next_review)')
			.eq('deck_id', params.id)
			.order('sort_order')
			.limit(50)
	]);

	const deck = deckRes.data;
	if (!deck) throw error(404, 'Deck not found');

	return { deck, cards: cardsRes.data ?? [] };
};
