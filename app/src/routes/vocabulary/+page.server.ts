import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) throw error(401, 'Unauthorized');

	const { data: savedWords } = await supabase
		.from('user_saved_words')
		.select('*')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	return {
		savedWords: savedWords ?? []
	};
};
