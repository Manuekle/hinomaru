import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
	id: string;
	type: ToastType;
	title: string;
	description?: string;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastItem[]>([]);

	function push(type: ToastType, title: string, description?: string) {
		const id = Math.random().toString(36).slice(2);
		const item: ToastItem = { id, type, title, description };

		update((list) => [item, ...list].slice(0, 3));

		setTimeout(() => dismiss(id), 4000);
	}

	function dismiss(id: string) {
		update((list) => list.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (opts: { title: string; description?: string }) =>
			push('success', opts.title, opts.description),
		error: (opts: { title: string; description?: string }) =>
			push('error', opts.title, opts.description),
		warning: (opts: { title: string; description?: string }) =>
			push('warning', opts.title, opts.description),
		info: (opts: { title: string; description?: string }) =>
			push('info', opts.title, opts.description),
		dismiss
	};
}

export const toast = createToastStore();

// Drop-in alias so existing svileo calls work unchanged
export const svileo = toast;
