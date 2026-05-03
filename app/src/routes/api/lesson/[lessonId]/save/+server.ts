import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { findLesson } from '$lib/learning/lookup';
import type { EngineState } from '$lib/learning/engine';

interface SaveBody {
	state: EngineState;
	completed: boolean;
}

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const ctx = findLesson(params.lessonId);
	if (!ctx) throw error(404, 'Lesson not found');

	const {
		data: { user }
	} = await locals.supabase.auth.getUser();
	if (!user) throw error(401, 'Not authenticated');

	const body = (await request.json()) as SaveBody;
	if (!body || !body.state) throw error(400, 'Invalid body');

	const s = body.state;
	const completedAt = body.completed ? new Date().toISOString() : null;

	const { error: upErr } = await locals.supabase.from('lesson_progress').upsert(
		{
			user_id: user.id,
			lesson_id: params.lessonId,
			total_steps: s.totalPlanned,
			correct_count: s.correct,
			mistakes_count: s.mistakes,
			state: s,
			completed_at: completedAt,
			updated_at: new Date().toISOString()
		},
		{ onConflict: 'user_id,lesson_id' }
	);

	if (upErr) {
		console.error('[lesson save]', upErr);
		throw error(500, upErr.message);
	}

	let xpAwarded = 0;

	if (body.completed) {
		const accuracy =
			s.correct + s.mistakes > 0 ? s.correct / (s.correct + s.mistakes) : 1;
		xpAwarded = Math.round(s.totalPlanned * 5 * (0.5 + accuracy * 0.5));

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('xp, total_lessons')
			.eq('id', user.id)
			.maybeSingle();

		await locals.supabase
			.from('profiles')
			.update({
				xp: (profile?.xp ?? 0) + xpAwarded,
				total_lessons: (profile?.total_lessons ?? 0) + 1
			})
			.eq('id', user.id);
	}

	return json({ ok: true, xpAwarded });
};
