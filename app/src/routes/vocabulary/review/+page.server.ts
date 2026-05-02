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
		return { words: [], status: 'empty' };
	}

	// Backfill missing example/romaji fields from `cards` table by matching jp.
	// Old rows in user_saved_words may lack these — keep Review consistent with Flashcards.
	const missingExample = words.filter((w) => !w.example).map((w) => w.jp);
	if (missingExample.length > 0) {
		const { data: cards } = await locals.supabase
			.from('cards')
			.select('jp, romaji, example, example_en, example_es, example_kana, example_romaji')
			.in('jp', missingExample);
		const byJp = new Map<string, any>();
		(cards ?? []).forEach((c) => {
			if (!byJp.has(c.jp)) byJp.set(c.jp, c);
		});
		for (const w of words) {
			const c = byJp.get(w.jp);
			if (!c) continue;
			w.romaji = w.romaji ?? c.romaji ?? null;
			w.example = w.example ?? c.example ?? null;
			w.example_en = w.example_en ?? c.example_en ?? null;
			w.example_es = w.example_es ?? c.example_es ?? null;
			w.example_kana = w.example_kana ?? c.example_kana ?? null;
			w.example_romaji = w.example_romaji ?? c.example_romaji ?? null;
		}
	}

	return { words };
};
