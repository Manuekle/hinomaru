import { writable } from 'svelte/store';
import { isBrowser } from '$lib/supabase';

function createRomajiStore() {
	const initial = isBrowser() ? (localStorage.getItem('hinomaru_show_romaji') !== 'false') : true;
	const { subscribe, set, update } = writable(initial);

	return {
		subscribe,
		toggle: () => update(v => {
			const newValue = !v;
			if (isBrowser()) localStorage.setItem('hinomaru_show_romaji', String(newValue));
			return newValue;
		}),
		set: (v: boolean) => {
			if (isBrowser()) localStorage.setItem('hinomaru_show_romaji', String(v));
			set(v);
		}
	};
}

export const showRomaji = createRomajiStore();
