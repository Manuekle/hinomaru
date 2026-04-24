import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: deck } = await locals.supabase
		.from('decks')
		.select('*')
		.eq('id', params.id)
		.single();
	return { deck };
};
