import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const [wordsRes, dueRes] = await Promise.all([
		locals.supabase
			.from('user_saved_words')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false }),
		locals.supabase
			.from('user_saved_words')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', user.id)
			.lte('next_review', new Date().toISOString())
	]);

	return {
		savedWords: wordsRes.data ?? [],
		dueCount: dueRes.count ?? 0
	};
};
