import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const PUBLIC_PATHS = ['/', '/login', '/auth/callback', '/auth/reset-password', '/terms', '/privacy', '/contact'];

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
	const { session, user } = await locals.safeGetSession();
	const isPublic = PUBLIC_PATHS.some((p) => url.pathname.startsWith(p));

	if (!session && !isPublic) throw redirect(303, '/login');
	if (session && url.pathname === '/login') throw redirect(303, '/');

	return { session, user, cookies: cookies.getAll() };
};
