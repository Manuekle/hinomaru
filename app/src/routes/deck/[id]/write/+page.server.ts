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
		.select('*, progress(easiness, interval, repetitions, next_review)')
		.eq('deck_id', params.id)
		.limit(20);

	return { deck, cards: cards ?? [] };
};
