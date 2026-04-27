import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => {
				cookies.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { ...options, path: '/' })
				);
			}
		}
	});

	let sessionUserCache: { session: any; user: any } | null = null;
	event.locals.safeGetSession = async () => {
		if (sessionUserCache) return sessionUserCache;

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			sessionUserCache = { session: null, user: null };
			return sessionUserCache;
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			sessionUserCache = { session: null, user: null };
			return sessionUserCache;
		}

		sessionUserCache = { session, user };
		return sessionUserCache;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
