import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();

	const { data: deck } = await locals.supabase
		.from('decks')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!deck) throw error(404, 'Deck not found');

	let learned = 0;
	if (user) {
		const { count } = await locals.supabase
			.from('progress')
			.select('card_id, cards!inner(deck_id)', { count: 'exact', head: true })
			.eq('user_id', user.id)
			.eq('learned', true)
			.eq('cards.deck_id', params.id);
		learned = count ?? 0;
	}

	return { deck: { ...deck, learned } };
};
