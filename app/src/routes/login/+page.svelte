<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { z } from 'zod';
	import { onMount } from 'svelte';
	import { animate } from 'motion/mini';

	let brandEl = $state<HTMLElement | null>(null);
	let formEl = $state<HTMLElement | null>(null);

	onMount(() => {
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
	});

	let { data } = $props();
	const supabase = $derived(data.supabase!);

	// ── Schemas ──────────────────────────────────────────────
	// NOTE: Schemas are rebuilt reactively when locale changes via $derived
	const schemas = $derived.by(() => {
		const emailSchema = z.string().email(t('auth.validation.email', $locale));
		const signinSchema = z.object({
			email: emailSchema,
			password: z.string().min(1, t('auth.validation.passwordRequired', $locale))
		});
		const signupSchema = z
			.object({
				email: emailSchema,
				password: z
					.string()
					.min(6, t('auth.validation.passwordMin', $locale))
					.regex(/[A-Z]/, t('auth.validation.passwordUpper', $locale))
					.regex(/[0-9]/, t('auth.validation.passwordNumber', $locale)),
				confirm: z.string().min(1, t('auth.validation.confirmRequired', $locale))
			})
			.refine((d) => d.password === d.confirm, {
				message: t('auth.validation.passwordsMismatch', $locale),
				path: ['confirm']
			});
		const forgotSchema = z.object({ email: emailSchema });
		const magicSchema = z.object({ email: emailSchema });
		return { signinSchema, signupSchema, forgotSchema, magicSchema };
	});

	// ── State ─────────────────────────────────────────────────
	type Mode = 'signin' | 'signup' | 'forgot' | 'magic';
	let mode = $state<Mode>('signin');

	let email = $state('');
	let password = $state('');
	let confirm = $state('');

	let showPassword = $state(false);
	let showConfirm = $state(false);

	// field-level errors
	let fieldErrors = $state<Record<string, string>>({});
	let globalError = $state('');

	let loading = $state(false);
	let signupDone = $state(false);
	let forgotDone = $state(false);
	let magicDone = $state(false);

	// Error param from URL (e.g. after failed callback)
	const errorParam = $page.url.searchParams.get('error');
	if (errorParam === 'confirmation_failed')
		globalError = t('auth.error.confirmationFailed', $locale);
	else if (errorParam === 'link_expired')
		globalError = t('auth.error.linkExpired', $locale);

	// ── Validation helpers ────────────────────────────────────
	function validate(): boolean {
		fieldErrors = {};
		globalError = '';

		let result:
			| { success: true; data: any }
			| { success: false; error: z.ZodError<any> };

		if (mode === 'signin') {
			result = schemas.signinSchema.safeParse({ email, password });
		} else if (mode === 'signup') {
			result = schemas.signupSchema.safeParse({ email, password, confirm });
		} else if (mode === 'forgot') {
			result = schemas.forgotSchema.safeParse({ email });
		} else {
			result = schemas.magicSchema.safeParse({ email });
		}

		if (!result.success) {
			const errs: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const key = String(issue.path[0] ?? 'global');
				if (!errs[key]) errs[key] = issue.message;
			}
			fieldErrors = errs;
			return false;
		}
		return true;
	}

	// Live validation for confirm field
	const confirmError = $derived(
		mode === 'signup' && confirm && password !== confirm 
            ? t('auth.validation.passwordsMismatch', $locale) 
            : ''
	);

	// Password strength (signup only)
	const strength = $derived.by(() => {
		if (mode !== 'signup' || !password) return 0;
		let s = 0;
		if (password.length >= 6) s++;
		if (/[A-Z]/.test(password)) s++;
		if (/[0-9]/.test(password)) s++;
		if (/[^A-Za-z0-9]/.test(password)) s++;
		return s;
	});

	const strengthLabel = $derived.by(() => {
		const s = strength;
		if (s <= 1) return { text: t('auth.strength.weak', $locale), color: '#BC002D' };
		if (s === 2) return { text: t('auth.strength.fair', $locale), color: '#A8741A' };
		if (s === 3) return { text: t('auth.strength.good', $locale), color: '#2E7D5B' };
		return { text: t('auth.strength.strong', $locale), color: '#2E7D5B' };
	});

	// ── Submit ────────────────────────────────────────────────
	async function submit(e: Event) {
		e.preventDefault();
		if (!validate()) return;

		loading = true;
		globalError = '';

		if (mode === 'signin') {
			const { error: err } = await supabase.auth.signInWithPassword({ email, password });
			if (err) {
				globalError = friendlyError(err.message);
				loading = false;
				return;
			}
			await invalidate('supabase:auth');
			goto('/');
		} else if (mode === 'signup') {
			const { error: err } = await supabase.auth.signUp({
				email,
				password,
				options: { emailRedirectTo: `${$page.url.origin}/auth/callback` }
			});
			if (err) {
				globalError = friendlyError(err.message);
				loading = false;
				return;
			}
			signupDone = true;
			loading = false;
		} else if (mode === 'forgot') {
			const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${$page.url.origin}/auth/callback?type=recovery`
			});
			if (err) {
				globalError = friendlyError(err.message);
				loading = false;
				return;
			}
			forgotDone = true;
			loading = false;
		} else if (mode === 'magic') {
			const { error: err } = await supabase.auth.signInWithOtp({
				email,
				options: { emailRedirectTo: `${$page.url.origin}/auth/callback` }
			});
			if (err) {
				globalError = friendlyError(err.message);
				loading = false;
				return;
			}
			magicDone = true;
			loading = false;
		}
	}

	function friendlyError(msg: string): string {
		if (msg.includes('Invalid login credentials')) return t('auth.error.invalidCredentials', $locale);
		if (msg.includes('Email not confirmed')) return t('auth.error.emailNotConfirmed', $locale);
		if (msg.includes('User already registered')) return t('auth.error.alreadyRegistered', $locale);
		if (msg.includes('Password should be')) return t('auth.error.passwordTooShort', $locale);
		if (msg.includes('rate limit')) return t('auth.error.rateLimit', $locale);
		return msg;
	}

	function switchMode(m: Mode) {
		mode = m;
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

<div
	style="min-height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--paper);padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));"
>
	<div style="width:100%;max-width:400px;">
		<!-- Brand -->
		<div
			bind:this={brandEl}
			style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:36px;"
		>
			<span
				style="width:48px;height:48px;background:var(--hinomaru-red);border-radius:50%;display:block;box-shadow:0 4px 16px rgba(188,0,45,0.25);"
			></span>
			<div style="font-size:24px;font-weight:700;letter-spacing:-0.02em;">Hinomaru</div>
			<div style="font-size:14px;color:var(--fg-secondary);text-align:center;">
				{#if mode === 'signin'}
					{t('auth.signin.subtitle', $locale)}
				{:else if mode === 'signup'}
					{t('auth.signup.subtitle', $locale)}
				{:else if mode === 'forgot'}
					{t('auth.forgot.subtitle', $locale)}
				{:else if mode === 'magic'}
					{t('auth.magic.subtitle', $locale)}
				{/if}
			</div>
		</div>

		<!-- ── SUCCESS STATES ── -->
		{#if signupDone}
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:32px;text-align:center;"
			>
				<div style="font-size:36px;margin-bottom:12px;">📨</div>
				<div style="font-size:18px;font-weight:600;margin-bottom:8px;">{t('auth.signup.done.title', $locale)}</div>
				<div style="font-size:14px;color:var(--fg-secondary);line-height:1.6;">
					{t('auth.signup.done.desc', $locale, { email })}
				</div>
				<button
					class="hm-btn hm-btn-ghost"
					style="margin-top:24px;"
					onclick={() => switchMode('signin')}
				>
					{t('auth.backToSigninBtn', $locale)}
				</button>
			</div>
		{:else if forgotDone}
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:32px;text-align:center;"
			>
				<div style="font-size:36px;margin-bottom:12px;">🔑</div>
				<div style="font-size:18px;font-weight:600;margin-bottom:8px;">{t('auth.forgot.done.title', $locale)}</div>
				<div style="font-size:14px;color:var(--fg-secondary);line-height:1.6;">
					{t('auth.forgot.done.desc', $locale, { email })}
				</div>
				<button
					class="hm-btn hm-btn-ghost"
					style="margin-top:24px;"
					onclick={() => switchMode('signin')}
				>
					{t('auth.backToSigninBtn', $locale)}
				</button>
			</div>
		{:else if magicDone}
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:32px;text-align:center;"
			>
				<div style="font-size:36px;margin-bottom:12px;">✨</div>
				<div style="font-size:18px;font-weight:600;margin-bottom:8px;">{t('auth.magic.done.title', $locale)}</div>
				<div style="font-size:14px;color:var(--fg-secondary);line-height:1.6;">
					{t('auth.magic.done.desc', $locale, { email })}
				</div>
				<button
					class="hm-btn hm-btn-ghost"
					style="margin-top:24px;"
					onclick={() => switchMode('signin')}
				>
					{t('auth.backToSigninBtn', $locale)}
				</button>
			</div>
		{:else}
			<!-- ── FORM ── -->
			<div
				bind:this={formEl}
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:28px;display:flex;flex-direction:column;gap:20px;"
			>
				<!-- Tabs: signin / signup -->
				{#if mode === 'signin' || mode === 'signup'}
					<div class="tab-row">
						<button
							class="tab-btn {mode === 'signin' ? 'active' : ''}"
							type="button"
							onclick={() => switchMode('signin')}
						>
							{t('auth.signin', $locale)}
						</button>
						<button
							class="tab-btn {mode === 'signup' ? 'active' : ''}"
							type="button"
							onclick={() => switchMode('signup')}
						>
							{t('auth.signup', $locale)}
						</button>
					</div>
				{:else}
					<!-- Back link for forgot / magic -->
					<button
						type="button"
						onclick={() => switchMode('signin')}
						style="background:none;border:none;font-family:var(--font-ui);font-size:13px;color:var(--fg-secondary);cursor:pointer;padding:0;text-align:left;display:flex;align-items:center;gap:4px;"
					>
						{t('auth.backToSignin', $locale)}
					</button>
				{/if}

				<form onsubmit={submit} style="display:flex;flex-direction:column;gap:16px;">
					<!-- Email -->
					<div class="field">
						<div class="label-meta" style="margin-bottom:8px;">{t('auth.email', $locale)}</div>
						<input
							type="email"
							bind:value={email}
							placeholder="tu@correo.com"
							class="hm-input {fieldErrors.email ? 'input-error' : ''}"
							autocomplete="email"
						/>
						{#if fieldErrors.email}
							<span class="field-error">⚠ {fieldErrors.email}</span>
						{/if}
					</div>

					<!-- Password (signin / signup) -->
					{#if mode === 'signin' || mode === 'signup'}
						<div class="field">
							<div class="label-meta" style="margin-bottom:8px;">{t('auth.password', $locale)}</div>
							<div class="pw-wrap">
								<input
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									placeholder={mode === 'signup'
										? t('auth.validation.passwordPlaceholder', $locale)
										: '••••••••'}
									class="hm-input {fieldErrors.password ? 'input-error' : ''}"
									autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
								/>
								<button
									type="button"
									class="pw-toggle"
									onclick={() => (showPassword = !showPassword)}
									aria-label={showPassword ? t('auth.password', $locale) : t('auth.password', $locale)}
								>
									{#if showPassword}
										<!-- Eye-off icon -->
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path
												d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
											/>
											<path
												d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
											/>
											<line x1="1" y1="1" x2="23" y2="23" />
										</svg>
									{:else}
										<!-- Eye icon -->
										<svg
											width="18"
											height="18"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									{/if}
								</button>
							</div>
							{#if fieldErrors.password}
								<span class="field-error">⚠ {fieldErrors.password}</span>
							{/if}

							<!-- Strength bar (signup only) -->
							{#if mode === 'signup' && password}
								<div class="strength-bar">
									<div
										class="strength-fill"
										style="width:{strength * 25}%;background:{strengthLabel.color};"
									></div>
								</div>
								<div class="strength-text" style="color:{strengthLabel.color};">
									{strengthLabel.text}
								</div>
							{/if}
						</div>

						<!-- Confirm password (signup only) -->
						{#if mode === 'signup'}
							<div class="field">
								<div class="label-meta" style="margin-bottom:8px;">{t('auth.confirmPassword', $locale)}</div>
								<div class="pw-wrap">
									<input
										type={showConfirm ? 'text' : 'password'}
										bind:value={confirm}
										placeholder={t('auth.confirmPassword.placeholder', $locale)}
										class="hm-input {fieldErrors.confirm || confirmError ? 'input-error' : ''}"
										autocomplete="new-password"
									/>
									<button
										type="button"
										class="pw-toggle"
										onclick={() => (showConfirm = !showConfirm)}
										aria-label={showConfirm ? t('auth.password', $locale) : t('auth.password', $locale)}
									>
										{#if showConfirm}
											<svg
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<path
													d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
												/>
												<path
													d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
												/>
												<line x1="1" y1="1" x2="23" y2="23" />
											</svg>
										{:else}
											<svg
												width="18"
												height="18"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											>
												<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
												<circle cx="12" cy="12" r="3" />
											</svg>
										{/if}
									</button>
								</div>
								{#if fieldErrors.confirm}
									<span class="field-error">⚠ {fieldErrors.confirm}</span>
								{:else if confirmError}
									<span class="field-error">⚠ {confirmError}</span>
								{:else if confirm && password === confirm}
									<span
										style="font-size:12px;color:var(--success);margin-top:5px;display:flex;align-items:center;gap:4px;"
									>
										{t('auth.passwordsMatch', $locale)}
									</span>
								{/if}
							</div>
						{/if}

						<!-- Forgot password (signin only) -->
						{#if mode === 'signin'}
							<div style="text-align:right;margin-top:-8px;">
								<button
									type="button"
									onclick={() => switchMode('forgot')}
									style="background:none;border:none;font-family:var(--font-ui);font-size:13px;color:var(--fg-secondary);cursor:pointer;padding:0;text-decoration:underline;"
								>
									{t('auth.forgotPassword', $locale)}
								</button>
							</div>
						{/if}
					{/if}

					<!-- Global error -->
					{#if globalError}
						<div
							style="font-size:13px;color:var(--hinomaru-red);padding:10px 12px;background:var(--hinomaru-red-wash);border-radius:var(--radius-sm);display:flex;align-items:center;gap:6px;"
						>
							⚠ {globalError}
						</div>
					{/if}

					<!-- Submit -->
					<button type="submit" class="hm-btn hm-btn-primary hm-btn-full" disabled={loading}>
						{#if loading}
							<span style="opacity:0.7;">…</span>
						{:else if mode === 'signin'}
							{t('auth.signin', $locale)}
						{:else if mode === 'signup'}
							{t('auth.signup', $locale)}
						{:else if mode === 'forgot'}
							{t('auth.forgot.submit', $locale)}
						{:else}
							{t('auth.magic.submit', $locale)}
						{/if}
					</button>

					<!-- Magic link option (signin mode) -->
					{#if mode === 'signin'}
						<div style="text-align:center;">
							<button
								type="button"
								onclick={() => switchMode('magic')}
								style="background:none;border:none;font-family:var(--font-ui);font-size:13px;color:var(--fg-secondary);cursor:pointer;padding:0;"
							>
								{t('auth.magic.hint', $locale)} <span
									style="color:var(--sumi);font-weight:600;text-decoration:underline;"
									>{t('auth.magic.hintLink', $locale)}</span
								>
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

	/* Strength bar */
	.strength-bar {
		height: 3px;
		border-radius: 99px;
		margin-top: 8px;
		background: var(--ink-200);
		overflow: hidden;
	}
	.strength-fill {
		height: 100%;
		border-radius: 99px;
		transition:
			width 200ms ease,
			background 200ms ease;
	}
	.strength-text {
		font-size: 11px;
		font-weight: 600;
		margin-top: 4px;
		letter-spacing: 0.04em;
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
</style>
