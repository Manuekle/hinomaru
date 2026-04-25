import { writable } from 'svelte/store';
import { isBrowser } from '$lib/supabase';

function createPersistedStore<T>(key: string, initialValue: T) {
	const initial = isBrowser() ? (localStorage.getItem(key) ?? String(initialValue)) : String(initialValue);
	
	// Handle booleans specifically
	let value: T;
	if (typeof initialValue === 'boolean') {
		value = (initial !== 'false') as T;
	} else {
		value = initial as T;
	}

	const { subscribe, set, update } = writable(value);

	return {
		subscribe,
		set: (v: T) => {
			if (isBrowser()) localStorage.setItem(key, String(v));
			set(v);
		},
		toggle: () => {
			if (typeof initialValue === 'boolean') {
				update((v: any) => {
					const next = !v;
					if (isBrowser()) localStorage.setItem(key, String(next));
					return next;
				});
			}
		}
	};
}

export const showRomaji = createPersistedStore('hinomaru_show_romaji', true);
export const preferredVoice = createPersistedStore<'standard' | 'kaito'>('hinomaru_preferred_voice', 'standard');
