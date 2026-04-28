/**
 * Local daily-reminder scheduler.
 *
 * Without a backend push pipeline we rely on the Notification API while the
 * PWA is open. Behaviour:
 *
 *  1. On app boot, if permission granted and the configured reminder hour
 *     has already passed today and we have not yet notified today, fire
 *     immediately (when there are due cards).
 *  2. Otherwise, schedule a setTimeout for today's (or tomorrow's) reminder
 *     hour. When it fires, check for due cards, show notification, and
 *     re-schedule for the next day.
 *
 * `localStorage.hinomaru_last_reminder` (YYYY-MM-DD) prevents duplicate fires.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

const LAST_KEY = 'hinomaru_last_reminder';
let timer: ReturnType<typeof setTimeout> | null = null;

function todayKey(): string {
	return new Date().toISOString().slice(0, 10);
}

function msUntil(hour: number): number {
	const now = new Date();
	const target = new Date(now);
	target.setHours(hour, 0, 0, 0);
	if (target.getTime() <= now.getTime()) {
		target.setDate(target.getDate() + 1);
	}
	return target.getTime() - now.getTime();
}

async function dueCardCount(supabase: SupabaseClient, userId: string): Promise<number> {
	const nowIso = new Date().toISOString();
	const [progress, words] = await Promise.all([
		supabase
			.from('progress')
			.select('card_id', { count: 'exact', head: true })
			.eq('user_id', userId)
			.lte('next_review', nowIso),
		supabase
			.from('user_saved_words')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', userId)
			.lte('next_review', nowIso)
	]);
	return (progress.count ?? 0) + (words.count ?? 0);
}

async function fireReminder(supabase: SupabaseClient, userId: string) {
	if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
	if (localStorage.getItem(LAST_KEY) === todayKey()) return;

	const count = await dueCardCount(supabase, userId);
	if (count === 0) return;

	const title = '日本語 Hinomaru';
	const body =
		count === 1
			? 'Tienes 1 tarjeta lista para repasar.'
			: `Tienes ${count} tarjetas listas para repasar.`;

	try {
		// Prefer SW registration so notifications work even when tab unfocused on Android
		const reg = await navigator.serviceWorker?.getRegistration?.();
		if (reg) {
			await reg.showNotification(title, { body, icon: '/icon-192.png', tag: 'hinomaru-daily' });
		} else {
			new Notification(title, { body, icon: '/icon-192.png' });
		}
		localStorage.setItem(LAST_KEY, todayKey());
	} catch (e) {
		console.warn('Reminder fire failed', e);
	}
}

export function clearReminder() {
	if (timer) {
		clearTimeout(timer);
		timer = null;
	}
}

/**
 * Schedule the next reminder. Safe to call repeatedly — replaces any existing timer.
 * Must run in the browser. Returns silently if not eligible.
 */
export function scheduleReminder(
	supabase: SupabaseClient,
	userId: string,
	hour: number,
	enabled: boolean
) {
	clearReminder();
	if (typeof window === 'undefined') return;
	if (!enabled) return;
	if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

	const safeHour = Math.max(0, Math.min(23, hour | 0));

	// If today's hour already passed and we have not fired today, do it now.
	const now = new Date();
	const passed = now.getHours() > safeHour || (now.getHours() === safeHour && now.getMinutes() > 0);
	if (passed && localStorage.getItem(LAST_KEY) !== todayKey()) {
		fireReminder(supabase, userId);
	}

	const tick = () => {
		fireReminder(supabase, userId).finally(() => {
			// Re-arm for the following day
			timer = setTimeout(tick, msUntil(safeHour));
		});
	};
	timer = setTimeout(tick, msUntil(safeHour));
}
