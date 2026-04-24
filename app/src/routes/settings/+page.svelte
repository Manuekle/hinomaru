<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { theme, type ThemeType } from '$lib/stores/theme';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { goto, invalidate } from '$app/navigation';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let { supabase, user } = $derived(data);

	async function signOut() {
		await supabase.auth.signOut();
		await invalidate('supabase:auth');
		goto('/login');
	}

	async function debugResetOnboarding() {
		localStorage.removeItem('hinomaru_onboarding_completed');
		if (user) {
			try {
				await supabase.from('profiles').update({ onboarding_completed: false }).eq('id', user.id);
			} catch {
				// Quietly ignore if DB update fails in debug mode
			}
		}
		// Force full reload to reset state
		window.location.href = '/onboarding';
	}


	function setLanguage(lang: 'es' | 'en') {
		locale.set(lang);
	}

	function setTheme(t: ThemeType) {
		theme.set(t);
	}
</script>

<div style="max-width:480px;margin:0 auto;padding:40px 24px calc(100px + env(safe-area-inset-bottom));">
	<a
		use:fadeUp={{ delay: 0, y: 10 }}
		href="/"
		style="display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--fg-secondary);text-decoration:none;margin-bottom:32px;
           transition:color 150ms ease;"
		onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--sumi)')}
		onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-secondary)')}
	>
		← {t('deck.back', $locale)}
	</a>

	<h1
		use:fadeUp={{ delay: 0.05, y: 16 }}
		style="font-size:32px;font-weight:700;letter-spacing:-0.02em;margin:0 0 32px;"
	>
		{t('settings.title', $locale)}
	</h1>

	<div use:fadeUp={{ delay: 0.1, y: 16 }} style="display:flex;flex-direction:column;gap:32px;">
		<!-- Profile Section -->
		<section>
			<h2
				style="font-size:14px;font-weight:600;color:var(--fg-secondary);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;"
			>
				{t('settings.profile', $locale)}
			</h2>
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:16px;padding:20px;display:flex;align-items:center;gap:16px;"
			>
				<div
					style="width:48px;height:48px;border-radius:50%;background:var(--ink-100);display:flex;align-items:center;justify-content:center;color:var(--sumi);font-weight:600;font-size:18px;"
				>
					{user?.email?.charAt(0).toUpperCase() || 'U'}
				</div>
				<div style="flex:1;">
					<div style="font-size:13px;color:var(--fg-secondary);margin-bottom:2px;">
						{t('settings.email', $locale)}
					</div>
					<div style="font-weight:600;color:var(--sumi);">{user?.email}</div>
				</div>
			</div>
			
			<div style="margin-top: 12px; display: flex; justify-content: flex-end;">
				<button 
					onclick={debugResetOnboarding}
					style="background:none; border:none; color:var(--fg-tertiary); font-size:12px; cursor:pointer; text-decoration:underline;"
				>
					Reset Onboarding (Debug)
				</button>
			</div>
		</section>

		<!-- Theme Section -->
		<section>
			<h2
				style="font-size:14px;font-weight:600;color:var(--fg-secondary);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;"
			>
				{t('settings.theme', $locale)}
			</h2>
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:16px;overflow:hidden;display:flex;"
			>
				<button
					onclick={() => setTheme('system')}
					style="flex:1;padding:12px;border:none;background:{$theme === 'system'
						? 'var(--ink-100)'
						: 'transparent'};cursor:pointer;color:var(--sumi);font-weight:500;font-size:14px;transition:background 150ms ease;"
				>
					<span style="display:block;margin-bottom:4px;font-size:18px;">💻</span>
					{t('settings.theme.system', $locale)}
				</button>
				<div style="width:1px;background:var(--ink-200);"></div>
				<button
					onclick={() => setTheme('light')}
					style="flex:1;padding:12px;border:none;background:{$theme === 'light'
						? 'var(--ink-100)'
						: 'transparent'};cursor:pointer;color:var(--sumi);font-weight:500;font-size:14px;transition:background 150ms ease;"
				>
					<span style="display:block;margin-bottom:4px;font-size:18px;">☀️</span>
					{t('settings.theme.light', $locale)}
				</button>
				<div style="width:1px;background:var(--ink-200);"></div>
				<button
					onclick={() => setTheme('dark')}
					style="flex:1;padding:12px;border:none;background:{$theme === 'dark'
						? 'var(--ink-100)'
						: 'transparent'};cursor:pointer;color:var(--sumi);font-weight:500;font-size:14px;transition:background 150ms ease;"
				>
					<span style="display:block;margin-bottom:4px;font-size:18px;">🌙</span>
					{t('settings.theme.dark', $locale)}
				</button>
			</div>
		</section>

		<!-- Language Section -->
		<section>
			<h2
				style="font-size:14px;font-weight:600;color:var(--fg-secondary);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;"
			>
				{t('settings.language', $locale)}
			</h2>
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:16px;overflow:hidden;"
			>
				<!-- Spanish Option -->
				<button
					onclick={() => setLanguage('es')}
					style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border:none;background:none;cursor:pointer;border-bottom:1px solid var(--ink-100);transition:background 150ms ease;"
					onmouseenter={(e) =>
						((e.currentTarget as HTMLElement).style.background = 'var(--ink-50)')}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
				>
					<div style="display:flex;align-items:center;gap:12px;">
						<span style="font-size:20px;">🇪🇸</span>
						<span style="font-weight:500;color:var(--sumi);font-size:15px;"
							>{t('settings.spanish', $locale)}</span
						>
					</div>
					{#if $locale === 'es'}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--success)"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					{/if}
				</button>

				<!-- English Option -->
				<button
					onclick={() => setLanguage('en')}
					style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border:none;background:none;cursor:pointer;transition:background 150ms ease;"
					onmouseenter={(e) =>
						((e.currentTarget as HTMLElement).style.background = 'var(--ink-50)')}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
				>
					<div style="display:flex;align-items:center;gap:12px;">
						<span style="font-size:20px;">🇺🇸</span>
						<span style="font-weight:500;color:var(--sumi);font-size:15px;"
							>{t('settings.english', $locale)}</span
						>
					</div>
					{#if $locale === 'en'}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--success)"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
					{/if}
				</button>
			</div>
		</section>

		<!-- Sign Out Section -->
		<section style="margin-top:24px;">
			<button
				onclick={signOut}
				class="hm-btn hm-btn-secondary"
				style="width:100%;color:var(--hinomaru-red);border-color:var(--ink-200);background:var(--bg-surface);"
			>
				{t('nav.signout', $locale)}
			</button>
		</section>
	</div>
</div>
