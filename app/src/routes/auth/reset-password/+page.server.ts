import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// This page requires an authenticated session (password recovery session)
// Supabase sets a recovery session after the user clicks the reset link
export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	// If no session, the link is invalid or expired — redirect back to login
	if (!session) throw redirect(303, '/login?error=link_expired');
	return {};
};
