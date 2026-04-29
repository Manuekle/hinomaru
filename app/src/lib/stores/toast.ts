import { svileo as originalSvileo } from 'svileo';
import { get } from 'svelte/store';
import { resolvedTheme } from './theme';

/**
 * Hinomaru Toast Wrapper
 * Automatically injects theme-aware styles and fill colors to all toasts.
 */
function createHinomaruToast() {
	const getThemeStyles = () => {
		const theme = get(resolvedTheme);
		return {
			fill: theme === 'dark' ? '#1c1c1c' : '#ffffff',
			styles: {
				title: theme === 'dark' ? 'text-[#f2f2f1]!' : 'text-[#1a1a1a]!',
				description: theme === 'dark' ? 'text-white/50!' : 'text-black/60!'
			}
		};
	};

	const applyThemeToOptions = (options: any) => {
		if (!options || typeof options !== 'object') return options;
		const themeStyles = getThemeStyles();
		return {
			...themeStyles,
			...options,
			styles: {
				...themeStyles.styles,
				...(options.styles || {})
			}
		};
	};

	return {
		...originalSvileo,
		show: (opts: any) => originalSvileo.show(applyThemeToOptions(opts)),
		success: (opts: any) => originalSvileo.success(applyThemeToOptions(opts)),
		error: (opts: any) => originalSvileo.error(applyThemeToOptions(opts)),
		info: (opts: any) => originalSvileo.info(applyThemeToOptions(opts)),
		warning: (opts: any) => originalSvileo.warning(applyThemeToOptions(opts)),
		action: (opts: any) => originalSvileo.action(applyThemeToOptions(opts)),
		promise: (promise: Promise<any> | (() => Promise<any>), opts: any) => {
			const themedOpts = {
				...opts,
				loading: applyThemeToOptions(opts.loading),
				success: typeof opts.success === 'object' ? applyThemeToOptions(opts.success) : opts.success,
				error: typeof opts.error === 'object' ? applyThemeToOptions(opts.error) : opts.error
			};
			return originalSvileo.promise(promise, themedOpts);
		}
	};
}

const hinomaruToast = createHinomaruToast();

export { hinomaruToast as toast, hinomaruToast as svileo };
