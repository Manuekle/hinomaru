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
	import { onMount, tick } from 'svelte';
	import { svileo } from '$lib/stores/toast';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { fly } from 'svelte/transition';
	import { goto, invalidateAll } from '$app/navigation';
	import { speakJapanese } from '$lib/utils/tts';
	import { preloadVoicevox } from '$lib/services/voicevox';
	import Icon from '$lib/Icon.svelte';
	import kofiDark from '$lib/assets/kofi_brandasset/support_me_on_kofi_dark.png';
	import kofiLight from '$lib/assets/kofi_brandasset/support_me_on_kofi_beige.png';
	import kofiSymbol from '$lib/assets/kofi_brandasset/kofi_symbol.svg';
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
		Mailbox01Icon,
		Logout03Icon
	} from '@hugeicons/core-free-icons';
	import type { PageData } from './$types';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import ResponsiveModal from '$lib/components/ui/ResponsiveModal.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	let { data } = $props<{ data: PageData }>();
	let supabase = $derived(data.supabase);
	let user = $derived(data.user);
	let isAdmin = $derived(data.isAdmin);

	async function signOut() {
		await supabase.auth.signOut();
		await invalidateAll();
		goto('/login?signedout=1');
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
	let emojiActiveIndex = $state(0);
	let emojiGridEl = $state<HTMLDivElement | null>(null);

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

	function focusEmojiOption(idx: number) {
		const total = japaneseEmojis.length;
		const next = ((idx % total) + total) % total;
		emojiActiveIndex = next;
		const btns = emojiGridEl?.querySelectorAll<HTMLButtonElement>('button.emoji-btn');
		btns?.[next]?.focus();
	}

	function handleEmojiKeydown(e: KeyboardEvent) {
		if (!showEmojiPicker) return;
		const total = japaneseEmojis.length;
		const cols = 4;
		switch (e.key) {
			case 'ArrowRight':
				e.preventDefault();
				focusEmojiOption(emojiActiveIndex + 1);
				break;
			case 'ArrowLeft':
				e.preventDefault();
				focusEmojiOption(emojiActiveIndex - 1);
				break;
			case 'ArrowDown':
				e.preventDefault();
				focusEmojiOption(emojiActiveIndex + cols);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusEmojiOption(emojiActiveIndex - cols);
				break;
			case 'Home':
				e.preventDefault();
				focusEmojiOption(0);
				break;
			case 'End':
				e.preventDefault();
				focusEmojiOption(total - 1);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				setAvatar(japaneseEmojis[emojiActiveIndex]);
				break;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && showEmojiPicker) {
			showEmojiPicker = false;
			(document.querySelector('button.avatar') as HTMLButtonElement | null)?.focus();
			return;
		}
		handleEmojiKeydown(e);
	}

	$effect(() => {
		if (showEmojiPicker) {
			tick().then(() => focusEmojiOption(0));
		}
	});

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

	let reminderValue = $state(String($reminderHour));
	$effect(() => {
		if (reminderValue !== String($reminderHour)) {
			setReminderHour(Number(reminderValue));
		}
	});

	const reminderHoursList = Array.from({ length: 24 }, (_, i) => ({
		value: String(i),
		label: `${String(i).padStart(2, '0')}:00`
	}));

	const reminderTriggerContent = $derived(
		reminderHoursList.find((h) => h.value === reminderValue)?.label ?? "00:00"
	);

	let showDeleteConfirm = $state(false);
	let deleteStep = $state<'confirm' | 'otp'>('confirm');
	let otpCode = $state('');
	let isDeleting = $state(false);
	let modalRef = $state<HTMLDivElement | null>(null);
	let overlayPaddingBottom = $state(0);

	$effect(() => {
		if (showDeleteConfirm && modalRef) {
			modalRef.focus();
		}
	});

	$effect(() => {
		if (!showDeleteConfirm) return;

		function onViewportResize() {
			const vv = window.visualViewport;
			if (!vv) return;
			// Keyboard height = layout viewport height minus visual viewport height + offset
			const keyboardHeight = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));
			overlayPaddingBottom = keyboardHeight;
		}

		const vv = window.visualViewport;
		vv?.addEventListener('resize', onViewportResize);
		vv?.addEventListener('scroll', onViewportResize);
		onViewportResize();

		return () => {
			vv?.removeEventListener('resize', onViewportResize);
			vv?.removeEventListener('scroll', onViewportResize);
			overlayPaddingBottom = 0;
		};
	});

	function handleModalKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showDeleteConfirm = false;
			deleteStep = 'confirm';
			otpCode = '';
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			showDeleteConfirm = false;
			deleteStep = 'confirm';
			otpCode = '';
		}
	}

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
			} catch {
				// Ignore localStorage errors
			}
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
					>
						<div class="emoji-picker-header" id="emoji-picker-header">
							{t('settings.avatar', $locale)}
						</div>
						<div
							class="emoji-grid"
							bind:this={emojiGridEl}
							role="listbox"
							aria-labelledby="emoji-picker-header"
							aria-activedescendant={`emoji-opt-${emojiActiveIndex}`}
						>
							{#each japaneseEmojis as emoji, i (emoji)}
								<button
									id={`emoji-opt-${i}`}
									class="emoji-btn"
									onclick={() => setAvatar(emoji)}
									type="button"
									role="option"
									aria-selected={i === emojiActiveIndex}
									tabindex={i === emojiActiveIndex ? 0 : -1}
									aria-label={emoji}>{emoji}</button
								>
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
		<!-- ── Admin ── -->
		{#if isAdmin}
			<div class="card">
					<a href="/admin/messages" class="pref-row">
						<div class="pref-icon" style="background:var(--hinomaru-red-wash);color:var(--hinomaru-red);">
							<Icon icon={Mailbox01Icon} size={18} color="currentColor" strokeWidth={1.8} />
						</div>
						<div class="pref-text">
							<span class="pref-title">{t('settings.admin.inbox.title', $locale)}</span>
							<span class="pref-sub">{t('settings.admin.inbox.desc', $locale)}</span>
						</div>
					</a>
			</div>
		{/if}

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
							<Icon
								icon={TwentyFourHoursClockIcon}
								size={18}
								color="currentColor"
								strokeWidth={1.8}
							/>
						</div>
						<div class="pref-text">
							<span class="pref-title">{t('settings.reminderHour', $locale)}</span>
							<span class="pref-sub">{t('settings.reminderHour.desc', $locale)}</span>
						</div>
						<Select.Root
							type="single"
							name="reminderHour"
							bind:value={reminderValue}
						>
							<Select.Trigger class="hm-select-trigger">
								{reminderTriggerContent}
							</Select.Trigger>
							<Select.Content class="hm-select-content">
								<Select.Group>
									<Select.Label class="hm-select-label">{t('settings.reminderHour', $locale)}</Select.Label>
									<div class="hm-select-scroll-area hide-scrollbar">
										{#each reminderHoursList as hr (hr.value)}
											<Select.Item class="hm-select-item" value={hr.value} label={hr.label}>
												{hr.label}
											</Select.Item>
										{/each}
									</div>
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</div>
				{/if}
			</div>
		</div>

		<!-- ── Support ── -->
		<div class="card" style="border-color: transparent;">
			<a href="https://ko-fi.com/manujsx" target="_blank" rel="noopener noreferrer" class="pref-row">
				<div class="pref-icon" style="background:#29abe015;color:#29abe0;">
					<img src={kofiSymbol} alt="Ko-fi" style="width: 18px; height: 18px; object-fit: contain;" />
				</div>
				<div class="pref-text">
					<span class="pref-title">{t('settings.support.title', $locale)}</span>
					<span class="pref-sub">{t('settings.support.desc', $locale)}</span>
				</div>
			</a>
		</div>

		<!-- ── Sign out ── -->
		<div class="card" style="border-color: transparent;">
			<button class="pref-row" onclick={signOut}>
				<div class="pref-icon" style="background:var(--hinomaru-red-wash);color:var(--hinomaru-red);">
					<Icon icon={Logout03Icon} size={18} color="currentColor" strokeWidth={1.8} />
				</div>
				<div class="pref-text">
					<span class="pref-title" style="color:var(--hinomaru-red);">{t('nav.signout', $locale)}</span>
					<span class="pref-sub">{t('settings.signout.desc', $locale)}</span>
				</div>
			</button>
		</div>

		<!-- ── Danger Zone ── -->
		<div class="card danger-card">
			<button class="pref-row" onclick={() => (showDeleteConfirm = true)}>
				<div class="pref-icon" style="background:#ff3b3014;color:#ff3b30;">
					<Icon icon={Delete02Icon} size={18} color="currentColor" strokeWidth={1.8} />
				</div>
				<div class="pref-text">
					<span class="pref-title" style="color:#ff3b30;"
						>{t('settings.deleteAccount', $locale)}</span
					>
					<span class="pref-sub">{t('settings.deleteAccount.desc', $locale)}</span>
				</div>
			</button>
		</div>
	</div>
</div>

{#snippet deleteIcon()}
	<Icon icon={BubbleChatIcon} size={24} color="currentColor" />
{/snippet}

<ResponsiveModal
	bind:open={showDeleteConfirm}
	title={deleteStep === 'confirm'
		? t('settings.deleteAccount.confirm', $locale)
		: t('settings.deleteAccount.verify', $locale)}
	icon={deleteIcon}
>
	{#if deleteStep === 'confirm'}
		<p class="modal-desc" style="text-align: left; margin-left: 4px;">
			{t('settings.deleteAccount.desc', $locale)}
		</p>
	{:else}
		<p class="modal-desc" style="text-align: left; margin-left: 4px;">
			{t('settings.deleteAccount.otpSent', $locale, { email: user?.email || '' })}
		</p>
		<div class="otp-wrapper">
			<InputOTP.Root
				maxlength={6}
				bind:value={otpCode}
				aria-label={t('settings.deleteAccount.verify', $locale)}
				autocomplete="one-time-code"
				inputmode="numeric"
			>
				{#snippet children({ cells })}
					<div class="otp-slots-container" aria-hidden="true">
						{#each cells as cell (cell)}
							<InputOTP.Slot {cell} />
						{/each}
					</div>
				{/snippet}
			</InputOTP.Root>
		</div>
	{/if}

	{#snippet actions()}
		{#if deleteStep === 'confirm'}
			<button class="modal-btn-cancel" onclick={() => (showDeleteConfirm = false)}>
				{t('common.cancel', $locale)}
			</button>
			<button
				class="modal-btn-confirm"
				onclick={initiateDeletion}
				disabled={isDeleting}
				aria-busy={isDeleting}
			>
				{#if isDeleting}
					<div class="spinner" aria-hidden="true"></div>
				{:else}
					{t('settings.deleteAccount.confirmBtn', $locale)}
				{/if}
			</button>
		{:else}
			<button class="modal-btn-cancel" onclick={() => (showDeleteConfirm = false)}>
				{t('common.cancel', $locale)}
			</button>
			<button
				class="modal-btn-confirm"
				onclick={confirmDeletion}
				disabled={isDeleting || otpCode.length < 6}
				aria-busy={isDeleting}
			>
				{#if isDeleting}
					<div class="spinner" aria-hidden="true"></div>
				{:else}
					{t('settings.deleteAccount.btn', $locale)}
				{/if}
			</button>
		{/if}
	{/snippet}
</ResponsiveModal>

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
		letter-spacing: -0.04em;
		color: var(--fg-tertiary);
		margin: 0 0 8px 4px;
	}

	/* ── Card shell ── */
	.card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
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
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36px;
		cursor: pointer;
		padding: 0;
		transition: all 0.2s var(--ease-brand);
		box-shadow: var(--shadow-sm);
	}
	@media (hover: hover) {
		.avatar:hover {
			transform: scale(1.02);
			box-shadow: var(--shadow-md);
			border-color: var(--ink-300);
		}
	}
	.avatar:active {
		transform: scale(0.94) translateY(0);
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
		letter-spacing: -0.04em;
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
		border-radius: 50%;
		transition: all 0.2s var(--ease-brand);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	@media (hover: hover) {
		.emoji-btn:hover {
			background: var(--bg-surface);
			transform: scale(1.08);
			z-index: 2;
			box-shadow: var(--shadow-md);
			border-color: var(--ink-200);
		}
	}
	.emoji-btn:active {
		transform: scale(0.9) translateY(0);
		background: var(--ink-100);
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
		border-radius: 18px;
		display: flex;
		padding: 4px;
		position: relative;
		height: 44px;
	}

	.seg-glider {
		position: absolute;
		top: 4px;
		left: 4px;
		height: calc(100% - 8px);
		background: var(--bg-surface);
		border-radius: 14px;
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
		letter-spacing: -0.04em;
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
		letter-spacing: -0.04em;
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



	/* ── Select Customization ── */
	:global(.hm-select-trigger) {
		width: 120px;
		height: 40px;
		padding: 8px 16px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 12px;
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-primary);
		box-shadow: var(--shadow-sm);
		transition: all 0.2s var(--ease-brand);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	:global(.hm-select-trigger:hover) {
		border-color: var(--ink-300);
	}
	:global(.hm-select-trigger[data-state='open']),
	:global(.hm-select-trigger:focus) {
		outline: none;
		border-color: var(--hinomaru-red);
		box-shadow: 0 0 0 3px rgba(188, 0, 45, 0.15);
	}

	:global(.hm-select-content) {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		box-shadow: 0 10px 40px rgba(0,0,0,0.12);
		padding: 4px;
		min-width: 120px;
		z-index: 12000;
	}
	:global([data-theme='dark']) :global(.hm-select-content) {
		box-shadow: 0 10px 40px rgba(0,0,0,0.4);
	}

	:global(.hm-select-label) {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 6px 8px;
	}

	:global(.hm-select-scroll-area) {
		max-height: 240px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	:global(.hm-select-item) {
		border-radius: 10px;
		padding: 8px 12px;
		font-size: 14px;
		font-weight: 600;
		color: var(--fg-secondary);
		cursor: pointer;
		transition: all 0.15s;
		outline: none;
	}
	:global(.hm-select-item[data-highlighted]) {
		background: var(--ink-50);
		color: var(--fg-primary);
	}
	:global(.hm-select-item[data-state='checked']) {
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}



	/* ── Danger Zone ── */
	.danger-card {
		border-color: transparent;
	}
	:global([data-theme='dark']) .danger-card {
		border-color: transparent;
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

	/* ── Modal (handled by ResponsiveModal) ── */

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

	/* Global premium buttons from ResponsiveModal used instead */

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


</style>
