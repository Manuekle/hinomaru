import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Increment (or reset) a user's study streak in the `profiles` table.
 *
 * Rules:
 * - last_study_date is today  → no change (already counted)
 * - last_study_date is yesterday → streak++, update last_study_date
 * - last_study_date is older / null → reset streak to 1, update last_study_date
 */
export async function updateStreak(supabase: SupabaseClient, userId: string): Promise<void> {
	const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayStr = yesterday.toISOString().split('T')[0];

	// Fetch current profile row
	const { data: profile } = await supabase
		.from('profiles')
		.select('current_streak, last_study_date')
		.eq('user_id', userId)
		.maybeSingle();

	const lastStudy: string | null = profile?.last_study_date ?? null;
	const currentStreak: number = profile?.current_streak ?? 0;

	// Already studied today — nothing to do
	if (lastStudy === today) return;

	const newStreak = lastStudy === yesterdayStr ? currentStreak + 1 : 1;

	await supabase.from('profiles').upsert(
		{
			user_id: userId,
			current_streak: newStreak,
			last_study_date: today
		},
		{ onConflict: 'user_id' }
	);
}
