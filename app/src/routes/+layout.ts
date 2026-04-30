import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
	depends('supabase:auth');

	const supabase = isBrowser()
		? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { global: { fetch } })
		: createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
				global: { fetch },
				cookies: { getAll: () => data.cookies ?? [] }
			});

	const {
		data: { user }
	} = await supabase.auth.getUser();
	const session = data.session ?? null;

	let profile = data.profile;
	if (user && !profile) {
		try {
			const { data: p, error: pErr } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();
			if (!pErr) profile = p;
		} catch (e) {
			console.error('Error fetching profile:', e);
		}
	}

	const isPWA = url.searchParams.get('pwa') === '1';

	return { supabase, session, user, profile, isPWA, initialLocale: data.initialLocale };
};
