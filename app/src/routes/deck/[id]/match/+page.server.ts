import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: deck } = await locals.supabase
		.from('decks')
		.select('*')
		.eq('id', params.id)
		.single();
    
	if (!deck) throw error(404);

	const { data: cards } = await locals.supabase
		.from('cards')
		.select('*')
		.eq('deck_id', params.id)
		.order('sort_order', { ascending: true })
		.limit(48); // Multiple of 4 for match pairs

	return { deck, cards: cards ?? [] };
};
