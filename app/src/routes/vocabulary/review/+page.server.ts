import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const { data: words } = await locals.supabase
		.from('user_saved_words')
		.select('*')
		.eq('user_id', user.id)
		.or(`next_review.lte.${new Date().toISOString()},next_review.is.null`)
		.order('next_review', { ascending: true })
		.limit(50);

	if (!words || words.length === 0) {
		return {
			words: [],
			status: 'empty'
		};
	}

	return {
		words: words ?? []
	};
};
