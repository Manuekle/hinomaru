import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const message = formData.get('message') as string;

		if (!name || !email || !message) {
			return fail(400, { error: 'All fields are required' });
		}

		const { error } = await locals.supabase
			.from('contact_messages')
			.insert([{ name, email, message }]);

		if (error) {
			console.error('Contact form error:', error);
			return fail(500, { error: 'Could not send message. Please try again later.' });
		}

		return { success: true };
	}
};
