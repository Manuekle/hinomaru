import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [deckRes, cardsRes] = await Promise.all([
		locals.supabase.from('decks').select('*').eq('id', params.id).single(),
		locals.supabase
			.from('cards')
			.select('*')
			.eq('deck_id', params.id)
			.order('sort_order', { ascending: true })
			.limit(100)
	]);

	const deck = deckRes.data;
	if (!deck) throw error(404, 'Deck not found');

	return { deck, cards: cardsRes.data ?? [] };
};
