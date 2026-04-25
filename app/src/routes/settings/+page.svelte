<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { theme, type ThemeType } from '$lib/stores/theme';
	import { showRomaji, preferredVoice } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn } from '$lib/motion';
	import { goto, invalidate } from '$app/navigation';
	import { speakJapanese } from '$lib/utils/tts';
	import supportImg from '$lib/assets/support.png';
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

	function setVoice(v: 'standard' | 'kaito') {
		preferredVoice.set(v);
		// Play a small sample to confirm
		speakJapanese('こんにちは');
	}
</script>

<svelte:head>
	<title>{t('settings.title', $locale)} — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;padding:40px 24px calc(100px + env(safe-area-inset-bottom));"
>
	<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:8px;">
		<a href="/" class="back-link-beautiful">
			← {t('deck.back', $locale)}
		</a>
	</div>

	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 32px;"
	>
		{t('settings.title', $locale)}
	</h1>

	<div use:fadeUp={{ delay: 0.1, y: 16 }} style="display:flex;flex-direction:column;gap:40px;">
		<!-- Profile Section -->
		<section class="settings-group">
			<h2 class="group-label">{t('settings.profile', $locale)}</h2>
			<div class="profile-card">
				<div class="avatar">
					{user?.email?.charAt(0).toUpperCase() || 'U'}
				</div>
				<div class="profile-info">
					<div class="email-label">{t('settings.email', $locale)}</div>
					<div class="email-value">{user?.email}</div>
				</div>
			</div>

			{#if import.meta.env.DEV}
				<div style="margin-top: 12px; display: flex; justify-content: flex-end;">
					<button onclick={debugResetOnboarding} class="debug-btn">
						Reset Onboarding (Debug)
					</button>
				</div>
			{/if}
		</section>

		<!-- Theme Section (Premium Pill Toggle) -->
		<section class="settings-group">
			<h2 class="group-label">{t('settings.theme', $locale)}</h2>
			<div class="segmented-pill-track">
				<div
					class="pill-glider"
					style="width: calc(33.333% - 4px); transform: translateX({$theme === 'system'
						? '0'
						: $theme === 'light'
							? '100%'
							: '200%'})"
				></div>
				<button
					class="pill-option"
					class:active={$theme === 'system'}
					onclick={() => setTheme('system')}
				>
					<span class="pill-icon">💻</span>
					{t('settings.theme.system', $locale)}
				</button>
				<button
					class="pill-option"
					class:active={$theme === 'light'}
					onclick={() => setTheme('light')}
				>
					<span class="pill-icon">☀️</span>
					{t('settings.theme.light', $locale)}
				</button>
				<button
					class="pill-option"
					class:active={$theme === 'dark'}
					onclick={() => setTheme('dark')}
				>
					<span class="pill-icon">🌙</span>
					{t('settings.theme.dark', $locale)}
				</button>
			</div>
		</section>

		<!-- Voice Section -->
		<section class="settings-group">
			<h2 class="group-label">{t('onboarding.voice.title', $locale)}</h2>
			<div class="segmented-pill-track">
				<div
					class="pill-glider"
					style="width: calc(50% - 4px); transform: translateX({$preferredVoice === 'standard'
						? '0'
						: '100%'})"
				></div>
				<button
					class="pill-option"
					class:active={$preferredVoice === 'standard'}
					onclick={() => setVoice('standard')}
				>
					<span class="pill-icon">🔊</span>
					{t('onboarding.voice.standard.name', $locale)}
				</button>
				<button
					class="pill-option"
					class:active={$preferredVoice === 'kaito'}
					onclick={() => setVoice('kaito')}
				>
					<span class="pill-icon">✨</span>
					{t('onboarding.voice.kaito.name', $locale)}
				</button>
			</div>
		</section>

		<!-- General Settings -->
		<section class="settings-group">
			<h2 class="group-label">{t('settings.preferences', $locale)}</h2>
			<div class="settings-list">
				<button class="list-item" onclick={() => showRomaji.toggle()}>
					<div class="item-left">
						<span class="item-icon">🔤</span>
						<span class="item-text">{t('settings.showRomaji', $locale)}</span>
					</div>
					<div class="hm-switch" class:active={$showRomaji}>
						<div class="switch-handle"></div>
					</div>
				</button>
			</div>
		</section>

		<!-- Language Section -->
		<section class="settings-group">
			<h2 class="group-label">{t('settings.language', $locale)}</h2>
			<div class="language-grid">
				<button class="lang-card" class:active={$locale === 'es'} onclick={() => setLanguage('es')}>
					<span class="lang-flag">🇪🇸</span>
					<div class="lang-info">
						<span class="lang-name">{t('settings.spanish', $locale)}</span>
						<span class="lang-native">Español</span>
					</div>
					{#if $locale === 'es'}
						<div class="check-icon">✓</div>
					{/if}
				</button>

				<button class="lang-card" class:active={$locale === 'en'} onclick={() => setLanguage('en')}>
					<span class="lang-flag">🇺🇸</span>
					<div class="lang-info">
						<span class="lang-name">{t('settings.english', $locale)}</span>
						<span class="lang-native">English</span>
					</div>
					{#if $locale === 'en'}
						<div class="check-icon">✓</div>
					{/if}
				</button>
			</div>
		</section>

		<!-- Support Section -->
		<section class="settings-group">
			<h2 class="group-label">Apoyar el proyecto</h2>
			<div class="support-container">
				<p class="support-text">Hinomaru es un proyecto personal. Si te gusta, puedes apoyarme para seguir mejorando la app.</p>
				<a href="https://ko-fi.com/manujsx" target="_blank" rel="noopener noreferrer" class="support-image-btn">
					<img src={supportImg} alt="Support on Ko-fi" />
				</a>
			</div>
		</section>

		<!-- Sign Out Section -->
		<section style="margin-top:20px;">
			<button onclick={signOut} class="signout-btn">
				{t('nav.signout', $locale)}
			</button>
		</section>
	</div>
</div>

<style>
	.back-link-beautiful {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		transition: color 150ms ease;
	}
	.back-link-beautiful:hover {
		color: var(--sumi);
	}

	.settings-group {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.group-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--fg-tertiary);
		margin-bottom: 4px;
		padding-left: 4px;
	}

	/* Profile Card */
	.profile-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 24px;
		display: flex;
		align-items: center;
		gap: 20px;
		box-shadow: var(--shadow-sm);
	}

	.avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--sumi);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 22px;
	}

	.email-label {
		font-size: 12px;
		color: var(--fg-tertiary);
		margin-bottom: 2px;
		font-weight: 500;
	}

	.email-value {
		font-size: 16px;
		font-weight: 600;
		color: var(--fg-primary);
	}

	/* Segmented Pill (Theme Switcher) */
	.segmented-pill-track {
		background: var(--ink-100);
		border-radius: 16px;
		display: flex;
		padding: 4px;
		position: relative;
		height: 48px;
	}

	.pill-glider {
		position: absolute;
		top: 4px;
		left: 4px;
		width: calc(33.333% - 4px);
		height: calc(100% - 8px);
		background: var(--bg-surface);
		border-radius: 12px;
		box-shadow: var(--shadow-sm);
		transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
		z-index: 1;
	}

	.pill-option {
		flex: 1;
		background: none;
		border: none;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-secondary);
		cursor: pointer;
		position: relative;
		z-index: 2;
		transition: color 0.3s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.pill-option.active {
		color: var(--sumi);
	}

	/* Settings List (Romaji) */
	.settings-list {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		overflow: hidden;
	}

	.list-item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;
		background: none;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
	}
	.list-item:hover {
		background: var(--ink-50);
	}

	.item-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.item-icon {
		font-size: 18px;
	}
	.item-text {
		font-weight: 600;
		color: var(--fg-primary);
		font-size: 15px;
	}

	/* Custom Switch */
	.hm-switch {
		width: 44px;
		height: 24px;
		background: var(--ink-200);
		border-radius: 12px;
		position: relative;
		transition: background 0.2s;
	}
	.hm-switch.active {
		background: var(--hinomaru-red);
	}

	.switch-handle {
		width: 18px;
		height: 18px;
		background: white;
		border-radius: 50%;
		position: absolute;
		top: 3px;
		left: 3px;
		transition: transform 0.25s cubic-bezier(0.23, 1, 0.32, 1);
		box-shadow: var(--shadow-sm);
	}
	.hm-switch.active .switch-handle {
		transform: translateX(20px);
	}

	/* Language Grid */
	.language-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.lang-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
		text-align: left;
	}

	.lang-card:hover {
		border-color: var(--ink-300);
		background: var(--ink-50);
	}
	.lang-card.active {
		border-color: var(--sumi);
		border-width: 2px;
		padding: 15px;
	}

	.lang-flag {
		font-size: 24px;
	}
	.lang-info {
		display: flex;
		flex-direction: column;
	}
	.lang-name {
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-primary);
	}
	.lang-native {
		font-size: 12px;
		color: var(--fg-tertiary);
	}

	.check-icon {
		position: absolute;
		top: 12px;
		right: 12px;
		color: var(--success);
		font-weight: 600;
	}

	/* Support Section */
	.support-container {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 24px;
		box-shadow: var(--shadow-sm);
		text-align: center;
	}

	.support-text {
		font-size: 14px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin: 0 0 16px;
	}

	.support-image-btn {
		display: inline-block;
		transition: transform 0.2s;
	}

	.support-image-btn img {
		height: 44px;
		width: auto;
		display: block;
	}

	.support-image-btn:hover {
		transform: scale(1.05);
	}

	.support-image-btn:active {
		transform: scale(0.95);
	}

	/* Buttons */
	.signout-btn {
		width: 100%;
		height: 56px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 18px;
		color: var(--hinomaru-red);
		font-weight: 700;
		font-size: 15px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.signout-btn:hover {
		background: var(--hinomaru-red-wash);
		border-color: var(--hinomaru-red);
	}

	.debug-btn {
		background: none;
		border: none;
		color: var(--fg-tertiary);
		font-size: 11px;
		cursor: pointer;
		text-decoration: underline;
		font-weight: 600;
	}
</style>
