import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();

	const [deckRes, progressRes, countRes] = await Promise.all([
		locals.supabase.from('decks').select('*').eq('id', params.id).single(),
		user
			? locals.supabase
					.from('progress')
					.select('card_id, cards!inner(deck_id)', { count: 'exact', head: true })
					.eq('user_id', user.id)
					.eq('learned', true)
					.eq('cards.deck_id', params.id)
			: Promise.resolve({ count: 0 }),
		locals.supabase
			.from('cards')
			.select('id', { count: 'exact', head: true })
			.eq('deck_id', params.id)
	]);

	const deck = deckRes.data;
	if (!deck) throw error(404, 'Deck not found');

	return {
		deck: { 
			...deck, 
			learned: progressRes.count ?? 0,
			card_count: countRes.count ?? deck.card_count
		}
	};
};
