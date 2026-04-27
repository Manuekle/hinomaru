import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: deck } = await locals.supabase
		.from('decks')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!deck) throw error(404, 'Deck not found');

	const { data: cards } = await locals.supabase
		.from('cards')
		.select('*, progress(easiness, interval_days, repetitions, next_review)')
		.eq('deck_id', params.id)
		.order('sort_order')
		.limit(50);

	return { deck, cards: cards ?? [] };
};
