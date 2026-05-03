import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { findLesson } from '$lib/learning/lookup';
import { loadDeckSession } from '$lib/server/loadDeckSession';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const ctx = findLesson(params.lessonId);
	if (!ctx) throw error(404, 'Lesson not found');

	const {
		data: { user }
	} = await locals.supabase.auth.getUser();
	if (!user) throw redirect(303, `/login?next=${encodeURIComponent(url.pathname)}`);

	const session = await loadDeckSession(locals.supabase, ctx.lesson.deckId, user.id, true);
	const cards = session.cards ?? [];

	const { data: savedRow } = await locals.supabase
		.from('lesson_progress')
		.select('state, total_steps, correct_count, mistakes_count, completed_at')
		.eq('user_id', user.id)
		.eq('lesson_id', params.lessonId)
		.maybeSingle();

	return {
		lesson: ctx.lesson,
		unit: { id: ctx.unit.id, title_es: ctx.unit.title_es, title_en: ctx.unit.title_en },
		level: ctx.level,
		cards,
		saved: savedRow ?? null
	};
};
