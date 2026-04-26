<script lang="ts">
	import { invalidate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { z } from 'zod';
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import Icon from '$lib/Icon.svelte';
	import { Mail01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
	import ButtonLoader from '$lib/components/ButtonLoader.svelte';

	let { data } = $props();

	// Use a getter-like derivation for supabase to ensure it's always current
	const supabase = $derived(data.supabase);

	let brandEl = $state<HTMLElement | null>(null);
	let formEl = $state<HTMLElement | null>(null);

	onMount(() => {
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
		else if (errorParam === 'link_expired') globalError = t('auth.error.linkExpired', $locale);
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
					res.error.issues.forEach((i) => (fieldErrors[String(i.path[0])] = i.message));
					return false;
				}
			} else if (mode === 'signup') {
				const schema = z
					.object({
						email: emailSchema,
						password: z
							.string()
							.min(6, t('auth.validation.passwordMin', $locale))
							.regex(/[A-Z]/, t('auth.validation.passwordUpper', $locale))
							.regex(/[0-9]/, t('auth.validation.passwordNumber', $locale)),
						confirm: z.string()
					})
					.refine((d) => d.password === confirm, {
						message: t('auth.validation.passwordsMismatch', $locale),
						path: ['confirm']
					});
				const res = schema.safeParse({ email, password, confirm });
				if (!res.success) {
					res.error.issues.forEach((i) => (fieldErrors[String(i.path[0])] = i.message));
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
		if (msg.includes('Invalid login credentials'))
			return t('auth.error.invalidCredentials', $locale);
		if (msg.includes('Email not confirmed')) return t('auth.error.emailNotConfirmed', $locale);
		return msg;
	}

	function toggleMode(newMode: Mode) {
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

	const pageTitle = $derived(
		(mode === 'signin'
			? t('auth.signin', $locale)
			: mode === 'signup'
				? t('auth.signup', $locale)
				: t('auth.reset.title', $locale)) + ' — Hinomaru'
	);
	async function handleSocialLogin(provider: 'google' | 'facebook') {
		if (!supabase) return;
		loading = true;
		try {
			const { error: err } = await supabase.auth.signInWithOAuth({
				provider,
				options: { redirectTo: `${$page.url.origin}/auth/callback` }
			});
			if (err) throw err;
		} catch (err: any) {
			console.error(`${provider} auth error:`, err);
			globalError = err.message;
		} finally {
			loading = false;
		}
	}
</script>

{#snippet googleIcon()}
	<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			fill="#4285F4"
		/>
		<path
			d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			fill="#34A853"
		/>
		<path
			d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
			fill="#FBBC05"
		/>
		<path
			d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
			fill="#EA4335"
		/>
	</svg>
{/snippet}

{#snippet facebookIcon()}
	<svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
		/>
	</svg>
{/snippet}

<svelte:head>
	<title>{pageTitle}</title>
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
				{#if mode === 'signin'}{t('auth.signin.subtitle', $locale)}{:else if mode === 'signup'}{t(
						'auth.signup.subtitle',
						$locale
					)}{:else if mode === 'forgot'}{t('auth.forgot.subtitle', $locale)}{:else}{t(
						'auth.magic.subtitle',
						$locale
					)}{/if}
			</div>
		</div>

		{#if signupDone}
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:32px;text-align:center;"
			>
				<div style="font-size:40px;margin-bottom:16px;display:flex;justify-content:center;">
					<Icon icon={Mail01Icon} size={40} color="var(--fg-primary)" strokeWidth={1.5} />
				</div>
				<h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">
					{t('auth.signup.done.title', $locale)}
				</h2>
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
		{:else if forgotDone}
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:32px;text-align:center;"
			>
				<div style="font-size:40px;margin-bottom:16px;display:flex;justify-content:center;">
					<Icon icon={Mail01Icon} size={40} color="var(--fg-primary)" strokeWidth={1.5} />
				</div>
				<h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">
					{t('auth.forgot.done.title', $locale)}
				</h2>
				<p style="font-size:14px;color:var(--fg-secondary);line-height:1.5;">
					{t('auth.forgot.done.desc', $locale, { email })}
				</p>
				<button
					onclick={() => toggleMode('signin')}
					class="hm-btn hm-btn-secondary hm-btn-full"
					style="margin-top:24px;"
				>
					{t('auth.signin', $locale)}
				</button>
			</div>
		{:else if magicDone}
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:32px;text-align:center;"
			>
				<div style="font-size:40px;margin-bottom:16px;display:flex;justify-content:center;">
					<Icon icon={SparklesIcon} size={40} color="var(--fg-primary)" strokeWidth={1.5} />
				</div>
				<h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">
					{t('auth.magic.done.title', $locale)}
				</h2>
				<p style="font-size:14px;color:var(--fg-secondary);line-height:1.5;">
					{t('auth.magic.done.desc', $locale, { email })}
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
						<div class="label-meta" style="margin-bottom:8px;">{t('auth.email', $locale)}</div>
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
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
								>
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
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
											></path>
											<line x1="1" y1="1" x2="23" y2="23"></line>
										</svg>
									{:else}
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
											<circle cx="12" cy="12" r="3"></circle>
										</svg>
									{/if}
								</button>
							</div>
							{#if fieldErrors.password}
								<div class="field-error">
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
									>
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
							<div class="label-meta" style="margin-bottom:8px;">
								{t('auth.confirmPassword', $locale)}
							</div>
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
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
											></path>
											<line x1="1" y1="1" x2="23" y2="23"></line>
										</svg>
									{:else}
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
											<circle cx="12" cy="12" r="3"></circle>
										</svg>
									{/if}
								</button>
							</div>
							{#if fieldErrors.confirm}
								<div class="field-error">
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
									>
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
								{t('auth.forgotPassword', $locale)}
							</button>
						</div>
					{/if}

					<button type="submit" class="hm-btn hm-btn-primary hm-btn-full" disabled={loading}>
						{#if loading}
							<ButtonLoader size={20} />
						{:else if mode === 'signin'}
							{t('auth.signin', $locale)}
						{:else if mode === 'signup'}
							{t('auth.signup', $locale)}
						{:else if mode === 'forgot'}{t('auth.forgot.submit', $locale)}{:else}{t(
								'auth.magic.submit',
								$locale
							)}{/if}
					</button>

					{#if mode === 'signin' || mode === 'signup'}
						<div class="divider">
							<span>{t('auth.or', $locale)}</span>
						</div>

						<div class="social-row">
							<button
								type="button"
								class="hm-btn hm-btn-secondary social-btn"
								onclick={() => handleSocialLogin('google')}
								disabled={loading}
								aria-label="Sign in with Google"
							>
								{@render googleIcon()}
							</button>

							<button
								type="button"
								class="hm-btn hm-btn-secondary social-btn"
								onclick={() => handleSocialLogin('facebook')}
								disabled={loading}
								aria-label="Sign in with Facebook"
							>
								{@render facebookIcon()}
							</button>
						</div>
					{/if}

					<!-- Bottom options -->
					{#if mode === 'signin'}
						<div style="text-align:center;">
							<button
								type="button"
								onclick={() => toggleMode('magic')}
								style="background:none;border:none;font-family:var(--font-ui);font-size:13px;color:var(--fg-secondary);cursor:pointer;padding:0;"
							>
								{t('auth.magic.hint', $locale)}
								<span style="color:var(--sumi);font-weight:600;text-decoration:underline;"
									>{t('auth.magic.hintLink', $locale)}</span
								>
							</button>
						</div>
					{:else}
						<div style="text-align:center;">
							<button
								type="button"
								onclick={() => toggleMode('signin')}
								style="background:none;border:none;font-family:var(--font-ui);font-size:13px;color:var(--fg-secondary);cursor:pointer;padding:0;text-decoration:underline;"
							>
								{t('auth.backToSigninBtn', $locale)}
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

	.divider {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 4px 0;
	}
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--ink-200);
	}
	.divider span {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.social-row {
		display: flex;
		gap: 12px;
	}
	.social-btn {
		flex: 1;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}
</style>
