import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');
	const next = url.searchParams.get('next') ?? '/';

	// PKCE flow: exchange code for session (signup confirmation, magic link, etc.)
	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			// After password reset, redirect to reset-password form
			if (type === 'recovery') throw redirect(303, '/auth/reset-password');
			throw redirect(303, decodeURIComponent(next));
		}
	}

	// OTP/token-hash flow (email change, reauthentication)
	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
		if (!error) {
			if (type === 'recovery') throw redirect(303, '/auth/reset-password');
			throw redirect(303, decodeURIComponent(next));
		}
	}

	throw redirect(303, '/login?error=confirmation_failed');
};
