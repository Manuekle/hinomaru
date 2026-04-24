import { writable } from 'svelte/store';

export type ThemeType = 'system' | 'light' | 'dark';

function createThemeStore() {
	const stored =
		typeof localStorage !== 'undefined' ? (localStorage.getItem('hm-theme') as ThemeType) : null;
	const initial = stored || 'system';

	const { subscribe, set } = writable<ThemeType>(initial);

	return {
		subscribe,
		set: (theme: ThemeType) => {
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('hm-theme', theme);
				applyTheme(theme);
			}
			set(theme);
		},
		init: () => {
			if (typeof window === 'undefined') return;
			applyTheme(initial);

			const mq = window.matchMedia('(prefers-color-scheme: dark)');
			mq.addEventListener('change', () => {
				const current = (localStorage.getItem('hm-theme') as ThemeType) || 'system';
				if (current === 'system') applyTheme('system');
			});
		}
	};
}

function applyTheme(theme: ThemeType) {
	if (typeof document === 'undefined') return;
	const isDark =
		theme === 'dark' ||
		(theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
	if (isDark) {
		document.documentElement.setAttribute('data-theme', 'dark');
	} else {
		document.documentElement.removeAttribute('data-theme');
	}
}

export const theme = createThemeStore();
