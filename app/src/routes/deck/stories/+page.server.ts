import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		throw redirect(303, '/login');
	}

	const today = new Date().toISOString().split('T')[0];

	const { data: stories, error } = await locals.supabase
		.from('stories')
		.select('*')
		.lte('publish_date', today)
		.order('publish_date', { ascending: false })
		.limit(20);

	if (error) throw new Error(error.message);

	return {
		stories: stories ?? [],
		user
	};
};
