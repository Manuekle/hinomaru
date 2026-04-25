import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		redirect(303, '/login');
	}

	const today = new Date().toISOString().split('T')[0];

	const { data: story, error } = await locals.supabase
		.from('stories')
		.select('*')
		.lte('publish_date', today)
		.order('publish_date', { ascending: false })
		.limit(1)
		.single();

	if (error || !story) {
		return { story: null, alreadyRead: false, userId: user.id };
	}

	// Check if user already read/quizzed this story
	const { data: readRow } = await locals.supabase
		.from('user_story_reads')
		.select('id, quiz_score')
		.eq('user_id', user.id)
		.eq('story_id', story.id)
		.maybeSingle();

	return {
		story,
		alreadyRead: !!readRow,
		quizScore: readRow?.quiz_score ?? null,
		userId: user.id
	};
};
