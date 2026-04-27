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
		.select('id')
		.lte('publish_date', today)
		.order('id');

	if (error || !stories || stories.length === 0) {
		throw redirect(303, '/deck/stories');
	}

	// Deterministic daily rotation: days since epoch mod total
	const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
	const story = stories[daysSinceEpoch % stories.length];

	throw redirect(303, `/deck/stories/${story.id}`);
};
