import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadDeckSession } from '$lib/server/loadDeckSession';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const { user } = await locals.safeGetSession();

	const { data: deck } = await locals.supabase
		.from('decks')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!deck) throw error(404);

	const forceAll = url.searchParams.get('practice') === 'true';
	const session = await loadDeckSession(locals.supabase, params.id, user?.id ?? null, forceAll);

	return { deck, ...session };
};
