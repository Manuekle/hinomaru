<script lang="ts">
	import { invalidate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { z } from 'zod';
	import { onMount } from 'svelte';
	import { animate } from 'motion';

	let { data } = $props();
	
	// Use a getter-like derivation for supabase to ensure it's always current
	const supabase = $derived(data.supabase);

	let brandEl = $state<HTMLElement | null>(null);
	let formEl = $state<HTMLElement | null>(null);

	onMount(() => {
		console.log('Login component mounted');
		try {
			if (brandEl)
				animate(
					brandEl,
					{ opacity: [0, 1], scale: [0.88, 1] },
					{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }
				);
			if (formEl)
				animate(
					formEl,
					{ opacity: [0, 1], y: [28, 0] },
					{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }
				);
		} catch (e) {
			console.error('Animation error:', e);
		}
	});

	// ── State ─────────────────────────────────────────────────
	type Mode = 'signin' | 'signup' | 'forgot' | 'magic';
	let mode = $state<Mode>('signin');

	let email = $state('');
	let password = $state('');
	let confirm = $state('');

	let showPassword = $state(false);
	let showConfirm = $state(false);

	let fieldErrors = $state<Record<string, string>>({});
	let globalError = $state('');
	let loading = $state(false);

	let signupDone = $state(false);
	let forgotDone = $state(false);
	let magicDone = $state(false);

	// URL Errors
	onMount(() => {
		const errorParam = $page.url.searchParams.get('error');
		if (errorParam === 'confirmation_failed')
			globalError = t('auth.error.confirmationFailed', $locale);
		else if (errorParam === 'link_expired')
			globalError = t('auth.error.linkExpired', $locale);
	});

	// ── Validation ────────────────────────────────────────────
	function validate(): boolean {
		fieldErrors = {};
		globalError = '';
		
		try {
			const emailSchema = z.string().email(t('auth.validation.email', $locale));

			if (mode === 'signin') {
				const schema = z.object({
					email: emailSchema,
					password: z.string().min(1, t('auth.validation.passwordRequired', $locale))
				});
				const res = schema.safeParse({ email, password });
				if (!res.success) {
					res.error.issues.forEach(i => fieldErrors[String(i.path[0])] = i.message);
					return false;
				}
			} else if (mode === 'signup') {
				const schema = z.object({
					email: emailSchema,
					password: z.string().min(6, t('auth.validation.passwordMin', $locale))
						.regex(/[A-Z]/, t('auth.validation.passwordUpper', $locale))
						.regex(/[0-9]/, t('auth.validation.passwordNumber', $locale)),
					confirm: z.string()
				}).refine(d => d.password === confirm, {
					message: t('auth.validation.passwordsMismatch', $locale),
					path: ['confirm']
				});
				const res = schema.safeParse({ email, password, confirm });
				if (!res.success) {
					res.error.issues.forEach(i => fieldErrors[String(i.path[0])] = i.message);
					return false;
				}
			} else {
				const res = emailSchema.safeParse(email);
				if (!res.success) {
					fieldErrors.email = res.error.issues[0].message;
					return false;
				}
			}
			return true;
		} catch (e) {
			console.error('Validation logic error:', e);
			return false;
		}
	}

	// ── Handlers ──────────────────────────────────────────────
	async function handleSubmit(e: Event) {
		e.preventDefault();
		console.log('Submitting form in mode:', mode);
		
		if (!validate()) return;
		if (!supabase) {
			globalError = 'Supabase client not initialized';
			return;
		}

		loading = true;
		globalError = '';

		try {
			if (mode === 'signin') {
				const { error: err } = await supabase.auth.signInWithPassword({ email, password });
				if (err) throw err;
				await invalidate('supabase:auth');
				goto('/');
			} else if (mode === 'signup') {
				const { error: err } = await supabase.auth.signUp({
					email,
					password,
					options: { emailRedirectTo: `${$page.url.origin}/auth/callback` }
				});
				if (err) throw err;
				signupDone = true;
			} else if (mode === 'forgot') {
				const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: `${$page.url.origin}/auth/callback?type=recovery`
				});
				if (err) throw err;
				forgotDone = true;
			} else if (mode === 'magic') {
				const { error: err } = await supabase.auth.signInWithOtp({
					email,
					options: { emailRedirectTo: `${$page.url.origin}/auth/callback` }
				});
				if (err) throw err;
				magicDone = true;
			}
		} catch (err: any) {
			console.error('Auth error:', err);
			globalError = friendlyError(err.message);
		} finally {
			loading = false;
		}
	}

	function friendlyError(msg: string): string {
		if (msg.includes('Invalid login credentials')) return t('auth.error.invalidCredentials', $locale);
		if (msg.includes('Email not confirmed')) return t('auth.error.emailNotConfirmed', $locale);
		return msg;
	}

	function toggleMode(newMode: Mode) {
		console.log('Switching to mode:', newMode);
		mode = newMode;
		fieldErrors = {};
		globalError = '';
		password = '';
		confirm = '';
		showPassword = false;
		showConfirm = false;
		signupDone = false;
		forgotDone = false;
		magicDone = false;
	}
</script>

<svelte:head>
	<title>
		{#if mode === 'signin'}{t('auth.signin', $locale)}{:else if mode === 'signup'}{t('auth.signup', $locale)}{:else}{t('auth.reset.title', $locale)}{/if}
		— Hinomaru
	</title>
</svelte:head>

<div
	style="min-height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--paper);padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));"
>
	<div style="width:100%;max-width:400px;">
		<!-- Brand / Logo -->
		<div
			bind:this={brandEl}
			style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:36px;"
		>
			<span
				style="width:48px;height:48px;background:var(--hinomaru-red);border-radius:50%;display:block;box-shadow:0 4px 16px rgba(188,0,45,0.25);"
			></span>
			<div style="font-size:24px;font-weight:700;letter-spacing:-0.02em;">Hinomaru</div>
			<div style="font-size:14px;color:var(--fg-secondary);text-align:center;">
				{#if mode === 'signin'}{t('auth.signin.desc', $locale)}{:else if mode === 'signup'}{t('auth.signup.desc', $locale)}{:else}{t('auth.reset.desc', $locale)}{/if}
			</div>
		</div>

		{#if signupDone}
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:32px;text-align:center;"
			>
				<div style="font-size:40px;margin-bottom:16px;">📧</div>
				<h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">{t('auth.signup.done', $locale)}</h2>
				<p style="font-size:14px;color:var(--fg-secondary);line-height:1.5;">
					{t('auth.signup.done.desc', $locale, { email })}
				</p>
				<button
					onclick={() => toggleMode('signin')}
					class="hm-btn hm-btn-secondary hm-btn-full"
					style="margin-top:24px;"
				>
					{t('auth.signin', $locale)}
				</button>
			</div>
		{:else if forgotDone || magicDone}
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:32px;text-align:center;"
			>
				<div style="font-size:40px;margin-bottom:16px;">✨</div>
				<h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">{t('auth.linkSent', $locale)}</h2>
				<p style="font-size:14px;color:var(--fg-secondary);line-height:1.5;">
					{t('auth.linkSent.desc', $locale)}
				</p>
				<button
					onclick={() => toggleMode('signin')}
					class="hm-btn hm-btn-secondary hm-btn-full"
					style="margin-top:24px;"
				>
					{t('auth.signin', $locale)}
				</button>
			</div>
		{:else}
			<div
				bind:this={formEl}
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:28px;display:flex;flex-direction:column;gap:20px;"
			>
				<!-- Tabs -->
				{#if mode === 'signin' || mode === 'signup'}
					<div class="tab-row">
						<button
							class="tab-btn"
							class:active={mode === 'signin'}
							type="button"
							onclick={() => toggleMode('signin')}
						>
							{t('auth.signin', $locale)}
						</button>
						<button
							class="tab-btn"
							class:active={mode === 'signup'}
							type="button"
							onclick={() => toggleMode('signup')}
						>
							{t('auth.signup', $locale)}
						</button>
					</div>
				{/if}

				<form onsubmit={handleSubmit} style="display:flex;flex-direction:column;gap:16px;">
					{#if globalError}
						<div
							style="font-size:13px;color:var(--hinomaru-red);padding:10px 12px;background:var(--hinomaru-red-wash);border-radius:var(--radius-sm);display:flex;align-items:center;gap:6px;"
						>
							⚠ {globalError}
						</div>
					{/if}

					<!-- Email -->
					<div class="field">
						<div class="label-meta" style="margin-bottom:8px;">{t('contact.email', $locale)}</div>
						<input
							type="email"
							bind:value={email}
							placeholder="tu@correo.com"
							class="hm-input"
							class:input-error={fieldErrors.email}
							autocomplete="email"
						/>
						{#if fieldErrors.email}
							<div class="field-error">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<circle cx="12" cy="12" r="10"></circle>
									<line x1="12" y1="8" x2="12" y2="12"></line>
									<line x1="12" y1="16" x2="12.01" y2="16"></line>
								</svg>
								{fieldErrors.email}
							</div>
						{/if}
					</div>

					<!-- Password -->
					{#if mode === 'signin' || mode === 'signup'}
						<div class="field">
							<div class="label-meta" style="margin-bottom:8px;">{t('auth.password', $locale)}</div>
							<div class="pw-wrap">
								<input
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									placeholder="••••••••"
									class="hm-input"
									class:input-error={fieldErrors.password}
									autocomplete={mode === 'signin' ? 'current-password' : 'new-password'}
								/>
								<button
									type="button"
									class="pw-toggle"
									onclick={() => (showPassword = !showPassword)}
									aria-label="Toggle Password"
								>
									{#if showPassword}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
											<line x1="1" y1="1" x2="23" y2="23"></line>
										</svg>
									{:else}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
											<circle cx="12" cy="12" r="3"></circle>
										</svg>
									{/if}
								</button>
							</div>
							{#if fieldErrors.password}
								<div class="field-error">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="8" x2="12" y2="12"></line>
										<line x1="12" y1="16" x2="12.01" y2="16"></line>
									</svg>
									{fieldErrors.password}
								</div>
							{/if}
						</div>
					{/if}

					<!-- Confirm Password (Signup) -->
					{#if mode === 'signup'}
						<div class="field">
							<div class="label-meta" style="margin-bottom:8px;">{t('auth.confirm', $locale)}</div>
							<div class="pw-wrap">
								<input
									type={showConfirm ? 'text' : 'password'}
									bind:value={confirm}
									placeholder="••••••••"
									class="hm-input"
									class:input-error={fieldErrors.confirm}
									autocomplete="new-password"
								/>
								<button
									type="button"
									class="pw-toggle"
									onclick={() => (showConfirm = !showConfirm)}
									aria-label="Toggle Confirm Password"
								>
									{#if showConfirm}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
											<line x1="1" y1="1" x2="23" y2="23"></line>
										</svg>
									{:else}
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
											<circle cx="12" cy="12" r="3"></circle>
										</svg>
									{/if}
								</button>
							</div>
							{#if fieldErrors.confirm}
								<div class="field-error">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
										<circle cx="12" cy="12" r="10"></circle>
										<line x1="12" y1="8" x2="12" y2="12"></line>
										<line x1="12" y1="16" x2="12.01" y2="16"></line>
									</svg>
									{fieldErrors.confirm}
								</div>
							{/if}
						</div>
					{/if}

					<!-- Forgot password link -->
					{#if mode === 'signin'}
						<div style="text-align:right;margin-top:-8px;">
							<button
								type="button"
								onclick={() => toggleMode('forgot')}
								style="background:none;border:none;font-family:var(--font-ui);font-size:13px;color:var(--fg-secondary);cursor:pointer;padding:0;text-decoration:underline;"
							>
								{t('auth.forgot', $locale)}
							</button>
						</div>
					{/if}

					<button
						type="submit"
						class="hm-btn hm-btn-primary hm-btn-full"
						disabled={loading}
					>
						{#if loading}
							<span class="dot-pulse"></span>
						{:else if mode === 'signin'}
							{t('auth.signin', $locale)}
						{:else if mode === 'signup'}
							{t('auth.signup', $locale)}
						{:else}
							{t('auth.reset.btn', $locale)}
						{/if}
					</button>

					<!-- Bottom options -->
					{#if mode === 'signin'}
						<div style="text-align:center;">
							<button
								type="button"
								onclick={() => toggleMode('magic')}
								style="background:none;border:none;font-family:var(--font-ui);font-size:13px;color:var(--fg-secondary);cursor:pointer;padding:0;"
							>
								{t('auth.magic.link', $locale)}? <span style="color:var(--sumi);font-weight:600;text-decoration:underline;">{t('auth.magic.btn', $locale)} ✨</span>
							</button>
						</div>
					{:else}
						<div style="text-align:center;">
							<button
								type="button"
								onclick={() => toggleMode('signin')}
								style="background:none;border:none;font-family:var(--font-ui);font-size:13px;color:var(--fg-secondary);cursor:pointer;padding:0;text-decoration:underline;"
							>
								{t('auth.backToLogin', $locale)}
							</button>
						</div>
					{/if}
				</form>
			</div>
		{/if}
	</div>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.pw-wrap {
		position: relative;
	}
	.pw-wrap input {
		padding-right: 44px;
	}
	.pw-toggle {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		cursor: pointer;
		color: var(--ink-400);
		padding: 4px;
		display: flex;
		align-items: center;
		transition: color 120ms;
	}
	.pw-toggle:hover {
		color: var(--sumi);
	}

	.field-error {
		font-size: 12px;
		color: var(--hinomaru-red);
		margin-top: 5px;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	/* Input error state */
	.input-error {
		border-color: var(--hinomaru-red) !important;
		box-shadow: 0 0 0 3px rgba(188, 0, 45, 0.1);
	}

	/* Mode tabs */
	.tab-row {
		display: flex;
		gap: 4px;
		background: var(--ink-100);
		border-radius: var(--radius-md);
		padding: 4px;
		margin-bottom: 4px;
	}
	.tab-btn {
		flex: 1;
		height: 36px;
		border: none;
		border-radius: 10px;
		font-family: var(--font-ui);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		background: transparent;
		color: var(--fg-secondary);
		transition:
			background 120ms,
			color 120ms;
	}
	.tab-btn.active {
		background: var(--bg-surface);
		color: var(--sumi);
		box-shadow: 0 1px 3px rgba(26, 26, 26, 0.08);
	}

	.dot-pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
		animation: dot-pulse 1.4s infinite ease-in-out;
		display: inline-block;
	}

	@keyframes dot-pulse {
		0%,
		80%,
		100% {
			transform: scale(0);
			opacity: 0.3;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
