import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) throw error(401, 'Unauthorized');

	const { data: words } = await supabase
		.from('user_saved_words')
		.select('*')
		.eq('user_id', user.id)
		.lte('next_review', new Date().toISOString())
		.order('next_review', { ascending: true })
		.limit(50);

	if (!words || words.length === 0) {
		return {
			words: [],
			status: 'empty'
		};
	}

	return {
		words: words ?? []
	};
};
