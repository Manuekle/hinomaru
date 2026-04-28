<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { theme, type ThemeType } from '$lib/stores/theme';
	import {
		showRomaji,
		preferredVoice,
		notificationsEnabled,
		srsEnabled,
		reminderHour
	} from '$lib/stores/settings';
	import { scheduleReminder, clearReminder } from '$lib/utils/reminders';
	import { onMount } from 'svelte';
	import { svileo } from '$lib/stores/toast';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { fly } from 'svelte/transition';
	import { goto, invalidateAll } from '$app/navigation';
	import { speakJapanese } from '$lib/utils/tts';
	import { speakVoicevox, preloadVoicevox } from '$lib/services/voicevox';
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
		TwentyFourHoursClockIcon,
		EarthIcon,
		JupiterIcon,
		Delete02Icon,
		BubbleChatIcon,
		Settings02Icon
	} from '@hugeicons/core-free-icons';
	import type { PageData } from './$types';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';

	let { data } = $props<{ data: PageData }>();
	let { supabase, user } = $derived(data);

	async function signOut() {
		await supabase.auth.signOut();
		await invalidateAll();
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

	function setVoice(v: 'kawaii' | 'cool') {
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
			await invalidateAll();
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
		preloadVoicevox('みなさん、こんにちは', 'kawaii');
		preloadVoicevox('みなさん、こんにちは', 'cool');

		if (!user) return;
		const { data: prof } = await supabase
			.from('profiles')
			.select('srs_enabled, reminder_hour')
			.eq('id', user.id)
			.maybeSingle();
		if (prof != null) {
			srsEnabled.set(prof.srs_enabled);
			if (typeof prof.reminder_hour === 'number') reminderHour.set(prof.reminder_hour);
		}
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
		if (user) {
			if ($notificationsEnabled) {
				scheduleReminder(supabase, user.id, $reminderHour, true);
			} else {
				clearReminder();
			}
		}
	}

	async function setReminderHour(h: number) {
		const safe = Math.max(0, Math.min(23, h | 0));
		reminderHour.set(safe);
		if (user) {
			await supabase.from('profiles').update({ reminder_hour: safe }).eq('id', user.id);
			scheduleReminder(supabase, user.id, safe, $notificationsEnabled);
		}
	}

	let showDeleteConfirm = $state(false);
	let deleteStep = $state<'confirm' | 'otp'>('confirm');
	let otpCode = $state('');
	let isDeleting = $state(false);

	async function initiateDeletion() {
		if (!user?.email) return;
		isDeleting = true;
		const { error } = await supabase.auth.signInWithOtp({
			email: user.email,
			options: { shouldCreateUser: false }
		});
		isDeleting = false;
		if (error) {
			svileo.error({ title: t('settings.deleteAccount.error', $locale) });
		} else {
			deleteStep = 'otp';
		}
	}

	async function confirmDeletion() {
		if (!user?.email) return;
		isDeleting = true;

		const { error: otpError } = await supabase.auth.verifyOtp({
			email: user.email,
			token: otpCode,
			type: 'email'
		});

		if (otpError) {
			isDeleting = false;
			svileo.error({ title: t('settings.deleteAccount.error', $locale) });
			return;
		}

		const { error: delError } = await supabase.rpc('delete_user_account');
		if (delError) {
			isDeleting = false;
			svileo.error({ title: delError.message });
		} else {
			try {
				localStorage.removeItem('hinomaru_onboarding_completed');
			} catch {}
			await supabase.auth.signOut();
			await invalidateAll();
			goto('/login');
		}
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
					style="width:calc(50% - 4px);transform:translateX({$preferredVoice === 'kawaii'
						? '0'
						: '100%'})"
				></div>
				<button
					class="seg-btn"
					class:active={$preferredVoice === 'kawaii'}
					onclick={() => setVoice('kawaii')}
					role="radio"
					aria-checked={$preferredVoice === 'kawaii'}
				>
					<Icon icon={Mic02Icon} size={13} color="currentColor" />{t(
						'onboarding.voice.kawaii.name',
						$locale
					)}
				</button>
				<button
					class="seg-btn"
					class:active={$preferredVoice === 'cool'}
					onclick={() => setVoice('cool')}
					role="radio"
					aria-checked={$preferredVoice === 'cool'}
				>
					<Icon icon={SiriIcon} size={13} color="currentColor" />{t(
						'onboarding.voice.cool.name',
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
				{#if $notificationsEnabled}
					<div class="pref-divider"></div>
					<div class="pref-row" style="cursor:default;">
						<div class="pref-icon" style="background:#34c75914;color:#34c759;">
							<Icon icon={TwentyFourHoursClockIcon} size={18} color="currentColor" strokeWidth={1.8} />
						</div>
						<div class="pref-text">
							<span class="pref-title">{t('settings.reminderHour', $locale)}</span>
							<span class="pref-sub">{t('settings.reminderHour.desc', $locale)}</span>
						</div>
						<select
							class="hour-select"
							value={$reminderHour}
							onchange={(e) => setReminderHour(Number((e.target as HTMLSelectElement).value))}
							aria-label={t('settings.reminderHour', $locale)}
						>
							{#each Array(24) as _, h}
								<option value={h}>{String(h).padStart(2, '0')}:00</option>
							{/each}
						</select>
					</div>
				{/if}
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
				<div style="margin-top:16px; display: flex; flex-direction: column; gap: 8px;">
					<button onclick={debugResetOnboarding} class="debug-btn"
						>{t('settings.debugReset', $locale)}</button
					>
					
					<!-- Debug VOICEVOX Laboratory -->
					<a 
						href="/debug/tts" 
						class="card debug-voicevox" 
						style="padding: 16px; text-align: left; text-decoration: none; display: block;"
					>
						<div style="display: flex; align-items: center; justify-content: space-between;">
							<div style="display: flex; align-items: center; gap: 12px;">
								<div class="pref-icon" style="background: #af52de14; color: #af52de; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
									<Icon icon={Settings02Icon} size={18} color="currentColor" />
								</div>
								<div>
									<span class="pref-title" style="display: block; font-size: 14px; font-weight: 600; color: var(--fg-primary);">TTS Laboratory</span>
									<span class="pref-sub" style="display: block; font-size: 11px; color: var(--fg-tertiary);">Test anime voices & parameters</span>
								</div>
							</div>
							<div class="arrow-right" style="color: var(--fg-tertiary); opacity: 0.5;">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>
							</div>
						</div>
					</a>
				</div>
			{/if}
		</div>

		<!-- ── Danger Zone ── -->
		<div class="card danger-card">
			<button class="pref-row" onclick={() => (showDeleteConfirm = true)}>
				<div class="pref-icon" style="background:#ff3b3014;color:#ff3b30;">
					<Icon icon={Delete02Icon} size={18} color="currentColor" strokeWidth={1.8} />
				</div>
				<div class="pref-text">
					<span class="pref-title" style="color:#ff3b30;">{t('settings.deleteAccount', $locale)}</span>
					<span class="pref-sub">{t('settings.deleteAccount.desc', $locale)}</span>
				</div>
				<div class="arrow-right" style="color: var(--fg-tertiary); opacity: 0.5;">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
					>
				</div>
			</button>
		</div>
	</div>
</div>

{#if showDeleteConfirm}
	<div class="modal-overlay" transition:fly={{ duration: 200, opacity: 0 }}>
		<div class="modal-content" use:fadeUp={{ delay: 0.05, y: 20 }}>
			<div class="modal-header">
				<div class="warning-icon" style="background: var(--ink-100); color: var(--fg-secondary);">
					<Icon icon={BubbleChatIcon} size={24} color="currentColor" />
				</div>
				<h2 class="modal-title" style="text-align: left; margin-left: 4px;">
					{deleteStep === 'confirm'
						? t('settings.deleteAccount.confirm', $locale)
						: t('settings.deleteAccount.verify', $locale)}
				</h2>
			</div>

			{#if deleteStep === 'confirm'}
				<p class="modal-desc" style="text-align: left; margin-left: 4px;">
					{t('settings.deleteAccount.desc', $locale)}
				</p>
				<div class="modal-actions">
					<button class="modal-btn-secondary" onclick={() => (showDeleteConfirm = false)}>
						{t('deck.back', $locale)}
					</button>
					<button class="modal-btn-danger" onclick={initiateDeletion} disabled={isDeleting}>
						{#if isDeleting}
							<div class="spinner"></div>
						{:else}
							{t('settings.deleteAccount.confirmBtn', $locale)}
						{/if}
					</button>
				</div>
			{:else}
				<p class="modal-desc" style="text-align: left; margin-left: 4px;">
					{t('settings.deleteAccount.otpSent', $locale, { email: user?.email || '' })}
				</p>
				<div class="otp-wrapper">
					<InputOTP.Root maxlength={6} bind:value={otpCode} aria-label={t('settings.deleteAccount.verify', $locale)}>
						{#snippet children({ cells })}
							<div class="otp-slots-container">
								{#each cells as cell (cell)}
									<InputOTP.Slot {cell} />
								{/each}
							</div>
						{/snippet}
					</InputOTP.Root>
				</div>
				<div class="modal-actions">
					<button
						class="modal-btn-secondary"
						onclick={() => {
							deleteStep = 'confirm';
							otpCode = '';
						}}
					>
						{t('deck.back', $locale)}
					</button>
					<button
						class="modal-btn-danger"
						onclick={confirmDeletion}
						disabled={isDeleting || otpCode.length < 6}
					>
						{#if isDeleting}
							<div class="spinner"></div>
						{:else}
							{t('settings.deleteAccount.btn', $locale)}
						{/if}
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

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
		height: 42px;
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

	/* ── Danger Zone ── */
	.danger-card {
		border-color: #ff3b3020;
		margin-top: 8px;
	}
	:global([data-theme='dark']) .danger-card {
		background: #ff3b3008;
		border-color: #ff3b3030;
	}

	.arrow-right {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s;
	}
	.pref-row:hover .arrow-right {
		transform: translateX(2px);
		opacity: 1 !important;
	}

	/* ── Modal ── */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		z-index: 1000;
	}

	.modal-content {
		background: var(--bg-surface);
		border-radius: 28px;
		width: 100%;
		max-width: 400px;
		padding: 32px;
		box-shadow: var(--shadow-xl);
		border: 1px solid var(--ink-200);
		text-align: center;
	}

	.modal-header {
		margin-bottom: 20px;
	}

	.warning-icon {
		width: 56px;
		height: 56px;
		background: #ff3b3014;
		color: #ff3b30;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16px;
	}

	.modal-title {
		font-size: 20px;
		font-weight: 700;
		color: var(--fg-primary);
		letter-spacing: -0.01em;
	}

	.modal-desc {
		font-size: 15px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin-bottom: 24px;
	}

	.otp-wrapper {
		display: flex;
		justify-content: center;
		margin-bottom: 24px;
		cursor: pointer;
	}

	.otp-slots-container {
		display: flex;
		gap: 8px;
		justify-content: center;
		background: var(--ink-100);
		padding: 8px 16px;
		border-radius: 20px;
		border: 1.5px solid var(--ink-200);
	}
	:global([data-theme='dark']) .otp-slots-container {
		background: var(--ink-50);
		border-color: var(--ink-200);
	}

	.modal-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.modal-btn-secondary {
		background: var(--ink-100);
		border: none;
		padding: 18px;
		border-radius: 20px;
		font-size: 16px;
		font-weight: 700;
		color: var(--fg-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}
	.modal-btn-secondary:hover {
		background: var(--ink-200);
		color: var(--fg-primary);
	}

	.modal-btn-danger {
		background: var(--hinomaru-red);
		border: none;
		padding: 18px;
		border-radius: 20px;
		font-size: 16px;
		font-weight: 700;
		color: white;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.2);
	}
	.modal-btn-danger:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(188, 0, 45, 0.3);
	}
	.modal-btn-danger:active:not(:disabled) {
		transform: translateY(0);
	}
	.modal-btn-danger:disabled {
		background: var(--ink-200);
		color: var(--fg-tertiary);
		box-shadow: none;
		cursor: not-allowed;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.hour-select {
		appearance: none;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: var(--radius-sm);
		padding: 6px 12px;
		font-family: inherit;
		font-size: 14px;
		font-weight: 600;
		color: var(--fg-primary);
		cursor: pointer;
		transition: border-color 150ms ease;
	}
	.hour-select:focus {
		outline: none;
		border-color: var(--brand-primary);
	}
</style>
