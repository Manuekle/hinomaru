import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Adds XP to a user and updates their total lesson count.
 * @param supabase Supabase client
 * @param userId User ID
 * @param amount Amount of XP to add
 */
export async function addXP(supabase: SupabaseClient, userId: string, amount: number) {
	try {
		// First, get current XP to calculate level locally or just update
		const { data: profile } = await supabase
			.from('profiles')
			.select('xp, total_lessons')
			.eq('id', userId)
			.single();

		if (!profile) return;

		const newXP = (profile.xp || 0) + amount;
		const newLessons = (profile.total_lessons || 0) + 1;
		const newLevel = Math.floor(1 + Math.sqrt(newXP) / 10);

		await supabase
			.from('profiles')
			.update({
				xp: newXP,
				total_lessons: newLessons,
				level: newLevel,
				updated_at: new Date().toISOString()
			})
			.eq('id', userId);
	} catch (err) {
		console.error('Error adding XP:', err);
	}
}
