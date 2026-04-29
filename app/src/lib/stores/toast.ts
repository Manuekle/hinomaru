import { svileo } from 'svileo';
import { get } from 'svelte/store';
import { resolvedTheme } from './theme';

/**
 * Hinomaru Toast Wrapper
 * Automatically injects theme-aware styles and fill colors to all toasts.
 */
function createHinomaruToast() {
	const wrap = (method: keyof typeof svileo) => {
		return (options: any) => {
			const theme = get(resolvedTheme);
			
			// Base Hinomaru styles for svileo
			const defaults = {
				fill: theme === 'dark' ? '#1c1c1c' : '#ffffff',
				styles: {
					title: theme === 'dark' ? 'text-[#f2f2f1]!' : 'text-[#1a1a1a]!',
					description: theme === 'dark' ? 'text-white/50!' : 'text-black/60!'
				}
			};

			// Merge defaults with user options
			const merged = {
				...defaults,
				...options,
				styles: {
					...defaults.styles,
					...(options.styles || {})
				}
			};

			// Call original svileo method
			return (svileo[method] as Function)(merged);
		};
	};

	return {
		...svileo,
		show: wrap('show'),
		success: wrap('success'),
		error: wrap('error'),
		info: wrap('info'),
		warning: wrap('warning'),
		action: wrap('action')
	};
}

export const toast = createHinomaruToast();
export { svileo };
