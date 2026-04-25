import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		throw redirect(303, '/login');
	}

	const today = new Date().toISOString().split('T')[0];

	const { data: story, error } = await locals.supabase
		.from('stories')
		.select('id')
		.lte('publish_date', today)
		.order('publish_date', { ascending: false })
		.limit(1)
		.single();

	if (error || !story) {
		return { story: null };
	}

	throw redirect(303, `/deck/stories/${story.id}`);
};
