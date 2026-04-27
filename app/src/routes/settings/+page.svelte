<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { theme, type ThemeType } from '$lib/stores/theme';
	import { showRomaji, preferredVoice, notificationsEnabled, srsEnabled } from '$lib/stores/settings';
	import { onMount } from 'svelte';
	import { svileo } from '$lib/stores/toast';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { fade, fly } from 'svelte/transition';
	import { goto, invalidate } from '$app/navigation';
	import { speakJapanese } from '$lib/utils/tts';
	import supportImg from '$lib/assets/support.png';
	import Icon from '$lib/Icon.svelte';
	import {
		SparklesIcon,
		MonitorDotIcon,
		Sun01Icon,
		Moon01Icon,
		VolumeHighIcon,
		AlphabetJapaneseIcon,
		AiBrain01Icon,
		Notification01Icon
	} from '@hugeicons/core-free-icons';
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

	const japaneseEmojis = ['🎎', '🏮', '⛩️', '🍣', '🍡', '🍵', '🏯', '🗻', '🎏', '🎴', '🌸', '🎋', '🦊', '👺', '👹', '🍱'];
	let showEmojiPicker = $state(false);

	async function setAvatar(emoji: string) {
		if (!user) return;
		const { error } = await supabase.from('profiles').update({ avatar: emoji }).eq('id', user.id);
		if (!error) {
			svileo.success({ title: t('settings.avatar.success', $locale) });
			// Trigger data refresh
			await invalidate('supabase:auth');
		} else {
			svileo.error({ title: t('settings.avatar.error', $locale) });
			console.error('Avatar update error:', error);
		}
		showEmojiPicker = false;
	}

	// Close on click outside or Escape
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && showEmojiPicker) {
			showEmojiPicker = false;
		}
	}

	function handleOutsideClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (showEmojiPicker && !target.closest('.avatar-wrapper')) {
			showEmojiPicker = false;
		}
	}

	// Sync srs_enabled from DB on mount
	onMount(async () => {
		if (!user) return;
		const { data: prof } = await supabase
			.from('profiles')
			.select('srs_enabled')
			.eq('id', user.id)
			.maybeSingle();
		if (prof != null) srsEnabled.set(prof.srs_enabled);
	});

	async function toggleSRS() {
		const newVal = !$srsEnabled;
		srsEnabled.set(newVal);
		if (!user) return;
		await supabase.from('profiles').update({ srs_enabled: newVal }).eq('id', user.id);
	}

	async function toggleNotifications() {
		if (!$notificationsEnabled) {
			// Enabling — request permission
			if ('Notification' in window) {
				const perm = await Notification.requestPermission();
				if (perm !== 'granted') {
					svileo.error({ title: t('settings.notifications.denied', $locale) });
					return;
				}
			}
		}
		notificationsEnabled.toggle();
	}
</script>

<svelte:window onclick={handleOutsideClick} onkeydown={handleKeydown} />

<svelte:head>
	<title>{t('settings.title', $locale)} — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));"
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
			<div class="avatar-wrapper">
				<button
					class="avatar"
					onclick={() => (showEmojiPicker = !showEmojiPicker)}
					aria-label={t('settings.avatar', $locale)}
					aria-expanded={showEmojiPicker}
					aria-haspopup="true"
				>
					<span class="avatar-emoji">{data.profile?.avatar || '🎏'}</span>
					<div class="avatar-edit-badge" aria-hidden="true">✎</div>
				</button>
				{#if showEmojiPicker}
					<div
						class="emoji-picker-popover"
						transition:fly={{ duration: 200, y: 10, opacity: 0 }}
						role="menu"
					>
						<div class="emoji-grid" role="menu" aria-label={t('settings.avatar', $locale)}>
							{#snippet emojiBtn(emoji: string)}
								<button
									class="emoji-btn"
									onclick={() => setAvatar(emoji)}
									type="button"
									aria-label={emoji}
								>
									{emoji}
								</button>
							{/snippet}
							{#each japaneseEmojis as emoji (emoji)}
								{@render emojiBtn(emoji)}
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<div class="profile-info">
				<div class="email-label">{t('settings.email', $locale)}</div>
				<div class="email-value">{user?.email}</div>
			</div>
		</div>
	</section>

	{#snippet settingsItem(icon: any, title: string, subtext: string, active: boolean, onclick: () => void)}
		<button class="list-item" {onclick} role="switch" aria-checked={active}>
			<div class="item-icon-box" aria-hidden="true">
				<Icon {icon} size={20} color="currentColor" strokeWidth={1.8} />
			</div>
			<div class="item-text-stack">
				<span class="item-text">{title}</span>
				{#if subtext}<span class="item-subtext">{subtext}</span>{/if}
			</div>
			<div class="hm-switch" class:active aria-hidden="true">
				<div class="switch-handle"></div>
			</div>
		</button>
	{/snippet}

	<div style="display:flex;flex-direction:column;gap:32px;">
		<!-- Theme Section (Premium Pill Toggle) -->
		<section class="settings-group">
			<h2 class="group-label">{t('settings.theme', $locale)}</h2>
			<div class="segmented-pill-track" role="radiogroup" aria-label={t('settings.theme', $locale)}>
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
					role="radio"
					aria-checked={$theme === 'system'}
				>
					<Icon icon={MonitorDotIcon} size={14} color="currentColor" />
					{t('settings.theme.system', $locale)}
				</button>
				<button
					class="pill-option"
					class:active={$theme === 'light'}
					onclick={() => setTheme('light')}
					role="radio"
					aria-checked={$theme === 'light'}
				>
					<Icon icon={Sun01Icon} size={14} color="currentColor" />
					{t('settings.theme.light', $locale)}
				</button>
				<button
					class="pill-option"
					class:active={$theme === 'dark'}
					onclick={() => setTheme('dark')}
					role="radio"
					aria-checked={$theme === 'dark'}
				>
					<Icon icon={Moon01Icon} size={14} color="currentColor" />
					{t('settings.theme.dark', $locale)}
				</button>
			</div>
		</section>

		<section class="settings-group">
			<h2 class="group-label">{t('onboarding.voice.title', $locale)}</h2>
			<div class="segmented-pill-track" role="radiogroup" aria-label={t('onboarding.voice.title', $locale)}>
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
					role="radio"
					aria-checked={$preferredVoice === 'standard'}
				>
					<Icon icon={VolumeHighIcon} size={14} color="currentColor" />
					{t('onboarding.voice.standard.name', $locale)}
				</button>
				<button
					class="pill-option"
					class:active={$preferredVoice === 'kaito'}
					onclick={() => setVoice('kaito')}
					role="radio"
					aria-checked={$preferredVoice === 'kaito'}
				>
					<Icon icon={SparklesIcon} size={14} color="currentColor" />
					{t('onboarding.voice.kaito.name', $locale)}
				</button>
			</div>
		</section>

		<!-- Preferences -->
		<section class="settings-group">
			<h2 class="group-label">{t('settings.preferences', $locale)}</h2>
			<div class="settings-list">
				{@render settingsItem(AlphabetJapaneseIcon, t('settings.showRomaji', $locale), '', $showRomaji, () =>
					showRomaji.toggle()
				)}
				{@render settingsItem(
					AiBrain01Icon,
					t('settings.srs', $locale),
					t('settings.srs.desc', $locale),
					$srsEnabled,
					toggleSRS
				)}
				{@render settingsItem(
					Notification01Icon,
					t('settings.notifications', $locale),
					t('settings.notifications.desc', $locale),
					$notificationsEnabled,
					toggleNotifications
				)}
			</div>
		</section>

		<section class="settings-group">
			<h2 class="group-label">{t('settings.language', $locale)}</h2>
			<div class="language-grid" role="radiogroup" aria-label={t('settings.language', $locale)}>
				<button
					class="lang-card"
					class:active={$locale === 'es'}
					onclick={() => setLanguage('es')}
					role="radio"
					aria-checked={$locale === 'es'}
				>
					<img
						class="lang-flag"
						src="https://flagcdn.com/32x24/es.png"
						srcset="https://flagcdn.com/64x48/es.png 2x, https://flagcdn.com/96x72/es.png 3x"
						width="32"
						height="24"
						alt="España"
						aria-hidden="true"
					/>
					<div class="lang-info">
						<span class="lang-name">{t('settings.spanish', $locale)}</span>
						<span class="lang-native">Español</span>
					</div>
				</button>

				<button
					class="lang-card"
					class:active={$locale === 'en'}
					onclick={() => setLanguage('en')}
					role="radio"
					aria-checked={$locale === 'en'}
				>
					<img
						class="lang-flag"
						src="https://flagcdn.com/32x24/us.png"
						srcset="https://flagcdn.com/64x48/us.png 2x, https://flagcdn.com/96x72/us.png 3x"
						width="32"
						height="24"
						alt="United States"
						aria-hidden="true"
					/>
					<div class="lang-info">
						<span class="lang-name">{t('settings.english', $locale)}</span>
						<span class="lang-native">English</span>
					</div>
				</button>
			</div>
		</section>

		<!-- Support Section -->
		<section class="settings-group">
			<h2 class="group-label">{t('settings.support.title', $locale)}</h2>
			<div class="support-container">
				<p class="support-text">{t('settings.support.desc', $locale)}</p>
				<a
					href="https://ko-fi.com/manujsx"
					target="_blank"
					rel="noopener noreferrer"
					class="support-image-btn"
				>
					<img src={supportImg} alt="Support on Ko-fi" />
				</a>
			</div>
		</section>

		<!-- Danger/Signout Zone -->
		<section class="settings-group">
			<button onclick={signOut} class="signout-btn">
				{t('nav.signout', $locale)}
			</button>

			{#if import.meta.env.DEV}
				<div style="margin-top: 24px; text-align: center;">
					<button onclick={debugResetOnboarding} class="debug-btn">
						{t('settings.debugReset', $locale)}
					</button>
				</div>
			{/if}
		</section>
	</div>
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
	@media (hover: hover) {
		.back-link-beautiful:hover {
			color: var(--sumi);
		}
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

	.avatar-wrapper {
		position: relative;
	}

	.avatar {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: var(--ink-100);
		color: var(--sumi);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 38px;
		border: 2px solid var(--ink-200);
		cursor: pointer;
		transition:
			transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		position: relative;
		padding: 0;
		box-shadow: var(--shadow-sm);
	}

	.avatar-emoji {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		width: 100%;
		height: 100%;
	}

	@media (hover: hover) {
		.avatar:hover {
			transform: scale(1.05);
			border-color: var(--hinomaru-red);
			box-shadow: var(--shadow-md);
		}
	}

	.avatar-edit-badge {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 24px;
		height: 24px;
		background: var(--hinomaru-red);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 11px;
		border: 2px solid var(--bg-surface);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.emoji-picker-popover {
		position: absolute;
		top: calc(100% + 12px);
		left: 0;
		background: var(--bg-surface);
		border: 1px solid var(--ink-300);
		border-radius: 16px;
		padding: 12px;
		box-shadow: var(--shadow-lg);
		z-index: 1000;
		width: 210px;
		transform-origin: top left;
	}

	.emoji-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	.emoji-btn {
		background: var(--ink-100);
		border: 1px solid var(--ink-200);
		font-size: 24px;
		aspect-ratio: 1;
		padding: 0;
		cursor: pointer;
		border-radius: 12px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (hover: hover) {
		.emoji-btn:hover {
			background: var(--paper);
			border-color: var(--hinomaru-red);
			transform: scale(1.05);
		}
	}

	.item-text-stack {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
	}

	.item-subtext {
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 400;
		line-height: 1.3;
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
		padding: 18px 20px;
		background: none;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
		gap: 16px;
		text-align: left;
	}

	@media (hover: hover) {
		.list-item:hover {
			background: var(--ink-50);
		}
	}

	.item-icon-box {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		flex-shrink: 0;
	}

	.item-text {
		font-weight: 600;
		color: var(--fg-primary);
		font-size: 16px;
	}

	/* Custom Switch */
	.hm-switch {
		width: 48px;
		height: 28px;
		background: var(--ink-200);
		border-radius: 14px;
		position: relative;
		flex-shrink: 0;
		transition: background 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.hm-switch.active {
		background: var(--hinomaru-red);
	}

	.switch-handle {
		width: 22px;
		height: 22px;
		background: white;
		border-radius: 11px;
		position: absolute;
		top: 3px;
		left: 3px;
		transition:
			transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
			width 0.15s ease;
		box-shadow: 0 1px 4px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.06);
	}
	.list-item:active .switch-handle {
		width: 26px;
	}
	.hm-switch.active .switch-handle {
		transform: translateX(20px);
	}
	.hm-switch.active .list-item:active .switch-handle {
		transform: translateX(16px);
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
		border-radius: 24px;
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 16px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
		position: relative;
		text-align: left;
		box-shadow: var(--shadow-sm);
	}

	@media (hover: hover) {
		.lang-card:hover {
			border-color: var(--ink-300);
			background: var(--paper);
			transform: translateY(-4px);
			box-shadow: var(--shadow-md);
		}
	}

	.lang-card.active {
		border-color: var(--hinomaru-red);
		background: var(--bg-surface);
		box-shadow:
			0 0 0 1px var(--hinomaru-red),
			var(--shadow-md);
		transform: scale(1.02);
		z-index: 1;
	}

	.lang-card.active .lang-name {
		color: var(--hinomaru-red);
	}

	.lang-flag {
		width: 32px;
		height: 24px;
		border-radius: 4px;
		object-fit: cover;
		flex-shrink: 0;
		box-shadow: 0 1px 3px rgba(0,0,0,0.15);
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

	@media (hover: hover) {
		.support-image-btn:hover {
			transform: scale(1.05);
		}
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
	@media (hover: hover) {
		.signout-btn:hover {
			background: var(--hinomaru-red-wash);
			border-color: var(--hinomaru-red);
		}
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
