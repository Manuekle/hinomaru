import { writable } from 'svelte/store';
import { isBrowser } from '$lib/supabase';

function createPersistedStore<T>(key: string, initialValue: T) {
	const stored = isBrowser() ? localStorage.getItem(key) : null;

	let value: T;
	if (stored === null) {
		value = initialValue;
	} else if (typeof initialValue === 'boolean') {
		value = (stored !== 'false') as T;
	} else if (typeof initialValue === 'number') {
		value = (Number(stored) || initialValue) as T;
	} else {
		value = stored as T;
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
					return next as T;
				});
			}
		}
	};
}

export const showRomaji = createPersistedStore('hinomaru_show_romaji', true);
export const preferredVoice = createPersistedStore<'standard' | 'kaito'>(
	'hinomaru_preferred_voice',
	'standard'
);
export const dailyGoal = createPersistedStore('hinomaru_daily_goal', 5);
export const srsEnabled = createPersistedStore('hinomaru_srs_enabled', true);
export const notificationsEnabled = createPersistedStore('hinomaru_notifications_enabled', true);
