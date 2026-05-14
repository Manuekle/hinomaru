import { redirect, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL } from '$env/static/private';
import type { PageServerLoad } from './$types';

// ADMIN_EMAIL is read from the private env var of the same name.

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	// Must be logged in
	if (!user) throw redirect(303, '/login');

	// Must be the admin
	if (user.email !== ADMIN_EMAIL) throw error(403, 'Forbidden');

	// Service-role client bypasses RLS — never expose to the browser
	const adminClient = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	const { data: messages, error: dbError } = await adminClient
		.from('contact_messages')
		.select('*')
		.order('created_at', { ascending: false });

	if (dbError) {
		console.error('Admin messages fetch error:', dbError);
		throw error(500, 'Could not load messages');
	}

	return { messages: messages ?? [] };
};
