import { writable } from 'svelte/store';
import type { Locale } from '$lib/i18n';

function createLocaleStore() {
	const stored =
		typeof localStorage !== 'undefined' ? (localStorage.getItem('hm-locale') as Locale) : null;
	const { subscribe, set } = writable<Locale>(stored ?? 'es');

	return {
		subscribe,
		set(locale: Locale) {
			if (typeof localStorage !== 'undefined') localStorage.setItem('hm-locale', locale);
			set(locale);
		}
	};
}

export const locale = createLocaleStore();
