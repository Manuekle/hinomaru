<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { theme, type ThemeType } from '$lib/stores/theme';
	import {
		showRomaji,
		preferredVoice,
		notificationsEnabled,
		srsEnabled
	} from '$lib/stores/settings';
	import { onMount } from 'svelte';
	import { svileo } from '$lib/stores/toast';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { fly } from 'svelte/transition';
	import { goto, invalidate } from '$app/navigation';
	import { speakJapanese } from '$lib/utils/tts';
	import Icon from '$lib/Icon.svelte';
	import supportImg from '$lib/assets/support.png';
	import {
		SiriIcon,
		ComputerPhoneSyncIcon,
		Sun03Icon,
		Moon02Icon,
		Mic02Icon,
		AlphabetJapaneseIcon,
		Brain02Icon,
		Notification01Icon,
		EarthIcon,
		JupiterIcon
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
				// ignore
			}
		}
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
		speakJapanese('みなさん、こんにちは');
	}

	const japaneseEmojis = [
		'🎎',
		'🏮',
		'⛩️',
		'🍣',
		'🍡',
		'🍵',
		'🏯',
		'🗻',
		'🎏',
		'🎴',
		'🌸',
		'🎋',
		'🦊',
		'👺',
		'👹',
		'🍱'
	];
	let showEmojiPicker = $state(false);

	async function setAvatar(emoji: string) {
		if (!user) return;
		const { error } = await supabase.from('profiles').update({ avatar: emoji }).eq('id', user.id);
		if (!error) {
			svileo.success({ title: t('settings.avatar.success', $locale) });
			await invalidate('supabase:auth');
		} else {
			svileo.error({ title: t('settings.avatar.error', $locale) });
			console.error('Avatar update error:', error);
		}
		showEmojiPicker = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && showEmojiPicker) showEmojiPicker = false;
	}

	function handleOutsideClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (showEmojiPicker && !target.closest('.avatar-wrapper')) showEmojiPicker = false;
	}

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

<div class="settings-page">
	<div use:fadeUp={{ delay: 0, y: 10 }}>
		<a href="/" class="back-link">← {t('deck.back', $locale)}</a>
	</div>

	<h1 use:fadeUp={{ delay: 0.05, y: 14 }} class="page-title">
		{t('settings.title', $locale)}
	</h1>

	<div use:fadeUp={{ delay: 0.1, y: 16 }} class="sections">
		<!-- ── Profile ── -->
		<div class="card profile-card">
			<div class="avatar-wrapper">
				<button
					class="avatar"
					onclick={() => (showEmojiPicker = !showEmojiPicker)}
					aria-label={t('settings.avatar', $locale)}
					aria-expanded={showEmojiPicker}
					aria-haspopup="true"
				>
					<span class="avatar-emoji">{data.profile?.avatar || '🎏'}</span>
					<div class="avatar-edit-badge" aria-hidden="true">
						<svg
							width="10"
							height="10"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
							<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
						</svg>
					</div>
				</button>
				{#if showEmojiPicker}
					<div
						class="emoji-picker-popover"
						transition:fly={{ duration: 240, y: 12, opacity: 0 }}
						role="menu"
					>
						<div class="emoji-picker-header">
							{t('settings.avatar', $locale)}
						</div>
						<div class="emoji-grid">
							{#snippet emojiBtn(emoji: string)}
								<button
									class="emoji-btn"
									onclick={() => setAvatar(emoji)}
									type="button"
									aria-label={emoji}>{emoji}</button
								>
							{/snippet}
							{#each japaneseEmojis as emoji (emoji)}
								{@render emojiBtn(emoji)}
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<div class="profile-info">
				<div class="profile-name">{t('settings.email', $locale)}</div>
				<div class="profile-email">{user?.email}</div>
			</div>
		</div>

		<!-- ── Tema ── -->
		<div>
			<p class="section-label">{t('settings.theme', $locale)}</p>
			<div class="segmented" role="radiogroup" aria-label={t('settings.theme', $locale)}>
				<div
					class="seg-glider"
					style="width:calc(33.333% - 5.33px);transform:translateX({$theme === 'system'
						? '0'
						: $theme === 'light'
							? '100%'
							: '200%'})"
				></div>
				<button
					class="seg-btn"
					class:active={$theme === 'system'}
					onclick={() => setTheme('system')}
					role="radio"
					aria-checked={$theme === 'system'}
				>
					<Icon icon={ComputerPhoneSyncIcon} size={13} color="currentColor" />{t(
						'settings.theme.system',
						$locale
					)}
				</button>
				<button
					class="seg-btn"
					class:active={$theme === 'light'}
					onclick={() => setTheme('light')}
					role="radio"
					aria-checked={$theme === 'light'}
				>
					<Icon icon={Sun03Icon} size={13} color="currentColor" />{t(
						'settings.theme.light',
						$locale
					)}
				</button>
				<button
					class="seg-btn"
					class:active={$theme === 'dark'}
					onclick={() => setTheme('dark')}
					role="radio"
					aria-checked={$theme === 'dark'}
				>
					<Icon icon={Moon02Icon} size={13} color="currentColor" />{t(
						'settings.theme.dark',
						$locale
					)}
				</button>
			</div>
		</div>

		<!-- ── Voz ── -->
		<div>
			<p class="section-label">{t('onboarding.voice.title', $locale)}</p>
			<div class="segmented" role="radiogroup" aria-label={t('onboarding.voice.title', $locale)}>
				<div
					class="seg-glider"
					style="width:calc(50% - 4px);transform:translateX({$preferredVoice === 'standard'
						? '0'
						: '100%'})"
				></div>
				<button
					class="seg-btn"
					class:active={$preferredVoice === 'standard'}
					onclick={() => setVoice('standard')}
					role="radio"
					aria-checked={$preferredVoice === 'standard'}
				>
					<Icon icon={Mic02Icon} size={13} color="currentColor" />{t(
						'onboarding.voice.standard.name',
						$locale
					)}
				</button>
				<button
					class="seg-btn"
					class:active={$preferredVoice === 'kaito'}
					onclick={() => setVoice('kaito')}
					role="radio"
					aria-checked={$preferredVoice === 'kaito'}
				>
					<Icon icon={SiriIcon} size={13} color="currentColor" />{t(
						'onboarding.voice.kaito.name',
						$locale
					)}
				</button>
			</div>
		</div>

		<!-- ── Idioma ── -->
		<div>
			<p class="section-label">{t('settings.language', $locale)}</p>
			<div
				class="segmented segmented-lang"
				role="radiogroup"
				aria-label={t('settings.language', $locale)}
			>
				<div
					class="seg-glider"
					style="width:calc(50% - 4px);transform:translateX({$locale === 'es' ? '0' : '100%'})"
				></div>
				<button
					class="seg-btn seg-btn-lang"
					class:active={$locale === 'es'}
					onclick={() => setLanguage('es')}
					role="radio"
					aria-checked={$locale === 'es'}
				>
					<Icon icon={JupiterIcon} size={18} color="currentColor" />
					{t('settings.spanish', $locale)}
				</button>
				<button
					class="seg-btn seg-btn-lang"
					class:active={$locale === 'en'}
					onclick={() => setLanguage('en')}
					role="radio"
					aria-checked={$locale === 'en'}
				>
					<Icon icon={EarthIcon} size={18} color="currentColor" />
					{t('settings.english', $locale)}
				</button>
			</div>
		</div>

		<!-- ── Preferencias ── -->
		<div>
			<p class="section-label">{t('settings.preferences', $locale)}</p>
			<div class="card pref-list">
				<button
					class="pref-row"
					onclick={() => showRomaji.toggle()}
					role="switch"
					aria-checked={$showRomaji}
				>
					<div class="pref-icon" style="background:#ff2d5514;color:#ff2d55;">
						<Icon icon={AlphabetJapaneseIcon} size={18} color="currentColor" strokeWidth={1.8} />
					</div>
					<div class="pref-text">
						<span class="pref-title">{t('settings.showRomaji', $locale)}</span>
					</div>
					<div class="hm-switch" class:active={$showRomaji}><div class="switch-handle"></div></div>
				</button>
				<div class="pref-divider"></div>
				<button class="pref-row" onclick={toggleSRS} role="switch" aria-checked={$srsEnabled}>
					<div class="pref-icon" style="background:#007aff14;color:#007aff;">
						<Icon icon={Brain02Icon} size={18} color="currentColor" strokeWidth={1.8} />
					</div>
					<div class="pref-text">
						<span class="pref-title">{t('settings.srs', $locale)}</span>
						<span class="pref-sub">{t('settings.srs.desc', $locale)}</span>
					</div>
					<div class="hm-switch" class:active={$srsEnabled}><div class="switch-handle"></div></div>
				</button>
				<div class="pref-divider"></div>
				<button
					class="pref-row"
					onclick={toggleNotifications}
					role="switch"
					aria-checked={$notificationsEnabled}
				>
					<div class="pref-icon" style="background:#af52de14;color:#af52de;">
						<Icon icon={Notification01Icon} size={18} color="currentColor" strokeWidth={1.8} />
					</div>
					<div class="pref-text">
						<span class="pref-title">{t('settings.notifications', $locale)}</span>
						<span class="pref-sub">{t('settings.notifications.desc', $locale)}</span>
					</div>
					<div class="hm-switch" class:active={$notificationsEnabled}>
						<div class="switch-handle"></div>
					</div>
				</button>
			</div>
		</div>

		<!-- ── Support ── -->
		<div class="card support-card">
			<p class="support-text">{t('settings.support.desc', $locale)}</p>
			<a
				href="https://ko-fi.com/manujsx"
				target="_blank"
				rel="noopener noreferrer"
				class="support-btn"
			>
				<img src={supportImg} alt="Support on Ko-fi" />
			</a>
		</div>

		<!-- ── Sign out ── -->
		<div>
			<button onclick={signOut} class="signout-btn">{t('nav.signout', $locale)}</button>
			{#if import.meta.env.DEV}
				<div style="margin-top:16px;text-align:center;">
					<button onclick={debugResetOnboarding} class="debug-btn"
						>{t('settings.debugReset', $locale)}</button
					>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.settings-page {
		max-width: 720px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		font-size: 13px;
		color: var(--fg-tertiary);
		text-decoration: none;
		transition: color 120ms;
		margin-bottom: 6px;
	}
	@media (hover: hover) {
		.back-link:hover {
			color: var(--sumi);
		}
	}

	.page-title {
		font-size: 34px;
		font-weight: 700;
		letter-spacing: -0.025em;
		margin: 0 0 28px;
		color: var(--fg-primary);
	}

	.sections {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.section-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		margin: 0 0 8px 4px;
	}

	/* ── Card shell ── */
	.card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		overflow: hidden;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.05),
			0 4px 14px rgba(0, 0, 0, 0.05);
	}
	:global([data-theme='dark']) .card {
		box-shadow:
			0 1px 4px rgba(0, 0, 0, 0.3),
			0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.card-row {
		padding: 12px 14px;
	}

	.card-divider {
		height: 1px;
		background: var(--ink-100);
		margin: 0 14px;
	}

	/* ── Profile ── */
	.profile-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		overflow: visible;
	}

	.avatar-wrapper {
		position: relative;
		flex-shrink: 0;
	}

	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--ink-100);
		border: 1.5px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32px;
		cursor: pointer;
		padding: 0;
		transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@media (hover: hover) {
		.avatar:hover {
			transform: scale(1.06);
		}
	}
	.avatar:active {
		transform: scale(0.93);
	}

	.avatar-emoji {
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-edit-badge {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 22px;
		height: 22px;
		background: var(--sumi);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--bg-surface);
		border: 2px solid var(--bg-surface);
	}

	.emoji-picker-popover {
		position: absolute;
		top: calc(100% + 14px);
		left: 0;
		background: var(--bg-surface-glass);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px;
		box-shadow:
			var(--shadow-lg),
			inset 0 0 0 1px rgba(255, 255, 255, 0.05);
		z-index: 200;
		width: 240px;
	}

	.emoji-picker-header {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		margin-bottom: 12px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		text-align: center;
	}

	.emoji-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	.emoji-btn {
		background: transparent;
		border: 1px solid transparent;
		font-size: 26px;
		aspect-ratio: 1;
		padding: 0;
		cursor: pointer;
		border-radius: 14px;
		transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	@media (hover: hover) {
		.emoji-btn:hover {
			background: var(--ink-100);
			transform: scale(1.18) translateY(-2px);
			z-index: 2;
			box-shadow: var(--shadow-sm);
		}
	}
	.emoji-btn:active {
		transform: scale(0.9);
		background: var(--ink-200);
	}

	.profile-info {
		flex: 1;
		min-width: 0;
	}
	.profile-name {
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-secondary);
		margin-bottom: 3px;
	}
	.profile-email {
		font-size: 15px;
		font-weight: 600;
		color: var(--fg-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ── Segmented control ── */
	.segmented {
		background: var(--ink-100);
		border-radius: 999px;
		display: flex;
		padding: 4px;
		position: relative;
		height: 42px;
	}

	.seg-glider {
		position: absolute;
		top: 4px;
		left: 4px;
		height: calc(100% - 8px);
		background: var(--bg-surface);
		border-radius: 999px;
		box-shadow:
			0 1px 4px rgba(0, 0, 0, 0.12),
			0 0 0 0.5px rgba(0, 0, 0, 0.06);
		transition: transform 0.26s cubic-bezier(0.23, 1, 0.32, 1);
		z-index: 1;
	}
	:global([data-theme='dark']) .seg-glider {
		box-shadow:
			0 1px 6px rgba(0, 0, 0, 0.4),
			0 0 0 0.5px rgba(255, 255, 255, 0.06);
	}

	.seg-btn {
		flex: 1;
		background: none;
		border: none;
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-tertiary);
		cursor: pointer;
		position: relative;
		z-index: 2;
		transition: color 0.22s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		letter-spacing: -0.01em;
	}
	.seg-btn.active {
		color: var(--sumi);
	}

	/* ── Preferences list ── */
	.pref-list {
		overflow: visible;
	}

	.pref-row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 13px;
		padding: 13px 16px;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
	}
	@media (hover: hover) {
		.pref-row:hover {
			background: var(--ink-50);
		}
	}

	.pref-icon {
		width: 36px;
		height: 36px;
		border-radius: 11px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.pref-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}
	.pref-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--fg-primary);
		letter-spacing: -0.01em;
	}
	.pref-sub {
		font-size: 12px;
		color: var(--fg-tertiary);
		line-height: 1.3;
	}

	.pref-divider {
		height: 1px;
		background: var(--ink-100);
		margin: 0 16px 0 65px;
	}

	/* ── Switch ── */
	.hm-switch {
		width: 48px;
		height: 28px;
		background: var(--ink-200);
		border-radius: 14px;
		position: relative;
		flex-shrink: 0;
		transition: background 0.22s ease;
	}
	.hm-switch.active {
		background: var(--hinomaru-red);
	}

	.switch-handle {
		width: 22px;
		height: 22px;
		background: white;
		border-radius: 50%;
		position: absolute;
		top: 3px;
		left: 3px;
		transition:
			transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
			width 0.12s ease;
		box-shadow:
			0 1px 4px rgba(0, 0, 0, 0.22),
			0 0 0 0.5px rgba(0, 0, 0, 0.05);
	}
	.pref-row:active .switch-handle {
		width: 26px;
	}
	.hm-switch.active .switch-handle {
		transform: translateX(20px);
	}

	/* ── Language tabs ── */
	.segmented-lang {
		height: 44px;
	}

	.seg-btn-lang {
		gap: 8px;
		font-size: 13px;
	}

	.flag-circle-sm {
		width: 24px !important;
		height: 24px !important;
		border-radius: 6px !important;
		background-size: cover !important;
		background-position: center !important;
		flex-shrink: 0;
		box-shadow:
			0 1px 4px rgba(0, 0, 0, 0.18),
			0 0 0 0.5px rgba(0, 0, 0, 0.08);
		display: inline-block;
	}

	/* ── Support ── */
	.support-card {
		padding: 20px;
		text-align: center;
	}
	.support-text {
		font-size: 13px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin: 0 0 14px;
	}
	.support-btn {
		display: inline-block;
		transition: transform 0.18s;
	}
	.support-btn img {
		height: 38px;
		width: auto;
		display: block;
	}
	@media (hover: hover) {
		.support-btn:hover {
			transform: scale(1.04);
		}
	}
	.support-btn:active {
		transform: scale(0.96);
	}

	/* ── Sign out ── */
	.signout-btn {
		width: 100%;
		height: 50px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		color: var(--hinomaru-red);
		font-weight: 700;
		font-size: 15px;
		cursor: pointer;
		letter-spacing: -0.01em;
		transition:
			background 0.15s,
			border-color 0.15s,
			transform 0.12s;
	}
	@media (hover: hover) {
		.signout-btn:hover {
			background: var(--hinomaru-red-wash);
			border-color: var(--hinomaru-red);
		}
	}
	.signout-btn:active {
		transform: scale(0.98);
	}

	.debug-btn {
		background: none;
		border: none;
		color: var(--fg-tertiary);
		font-size: 11px;
		cursor: pointer;
		text-decoration: underline;
	}
</style>
