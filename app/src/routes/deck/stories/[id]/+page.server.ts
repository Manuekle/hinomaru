import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		throw redirect(303, '/login');
	}

	const { id } = params;

	const { data: story, error: storyError } = await locals.supabase
		.from('stories')
		.select('*')
		.eq('id', id)
		.single();

	if (storyError || !story) {
		throw error(404, 'Story not found');
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
