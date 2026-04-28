import { writable } from 'svelte/store';

export const deferredPrompt = writable<any>(null);
export const isInstalled = writable<boolean>(false);

if (typeof window !== 'undefined') {
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt.set(e);
	});

	window.addEventListener('appinstalled', () => {
		deferredPrompt.set(null);
		isInstalled.set(true);
	});
	
	// Check if already installed
	const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
	isInstalled.set(!!isStandalone);
}
