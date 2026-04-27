import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();

	if (!user) {
		throw redirect(303, '/login');
	}

	const { id } = params;

	const [storyRes, readRes] = await Promise.all([
		locals.supabase.from('stories').select('*').eq('id', id).single(),
		locals.supabase
			.from('user_story_reads')
			.select('id, quiz_score')
			.eq('user_id', user.id)
			.eq('story_id', id)
			.maybeSingle()
	]);

	const story = storyRes.data;
	const readRow = readRes.data;

	if (storyRes.error || !story) {
		throw error(404, 'Story not found');
	}

	return {
		story,
		alreadyRead: !!readRow,
		quizScore: readRow?.quiz_score ?? null,
		userId: user.id
	};
};
