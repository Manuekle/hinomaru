import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const EXACT_PUBLIC = new Set(['/', '/login', '/terms', '/privacy', '/contact']);
const PREFIX_PUBLIC = ['/auth/callback', '/auth/reset-password'];

export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
	const { session, user } = await locals.safeGetSession();
	const isPublic =
		EXACT_PUBLIC.has(url.pathname) || PREFIX_PUBLIC.some((p) => url.pathname.startsWith(p));

	if (!session && !isPublic) throw redirect(303, '/login');
	if (session && url.pathname === '/login') throw redirect(303, '/');

	const initialLocale = (cookies.get('hm-locale') as 'es' | 'en') ?? 'es';

	return { session, user, initialLocale, cookies: cookies.getAll() };
};
