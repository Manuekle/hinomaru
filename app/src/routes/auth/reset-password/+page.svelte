<script lang="ts">
	import { goto } from '$app/navigation';
	import { z } from 'zod';

	let { data } = $props();
	const supabase = $derived(data.supabase!);

	// ── Schema ────────────────────────────────────────────────
	const resetSchema = z
		.object({
			password: z
				.string()
				.min(6, 'Mínimo 6 caracteres.')
				.regex(/[A-Z]/, 'Debe contener al menos una mayúscula.')
				.regex(/[0-9]/, 'Debe contener al menos un número.'),
			confirm: z.string().min(1, 'Confirma tu contraseña.')
		})
		.refine((d) => d.password === d.confirm, {
			message: 'Las contraseñas no coinciden.',
			path: ['confirm']
		});

	// ── State ─────────────────────────────────────────────────
	let password = $state('');
	let confirm = $state('');
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let loading = $state(false);
	let globalError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let done = $state(false);

	const confirmError = $derived(
		confirm && password !== confirm ? 'Las contraseñas no coinciden.' : ''
	);

	const strength = $derived(() => {
		if (!password) return 0;
		let s = 0;
		if (password.length >= 6) s++;
		if (/[A-Z]/.test(password)) s++;
		if (/[0-9]/.test(password)) s++;
		if (/[^A-Za-z0-9]/.test(password)) s++;
		return s;
	});

	const strengthLabel = $derived(() => {
		const s = strength();
		if (s <= 1) return { text: 'Débil', color: '#BC002D' };
		if (s === 2) return { text: 'Regular', color: '#A8741A' };
		if (s === 3) return { text: 'Buena', color: '#2E7D5B' };
		return { text: 'Fuerte', color: '#2E7D5B' };
	});

	function validate(): boolean {
		fieldErrors = {};
		globalError = '';
		const result: any = resetSchema.safeParse({ password, confirm });
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

	async function submit(e: Event) {
		e.preventDefault();
		if (!validate()) return;

		loading = true;
		globalError = '';

		const { error: err } = await supabase.auth.updateUser({ password });
		if (err) {
			globalError = err.message.includes('same password')
				? 'La nueva contraseña debe ser diferente a la actual.'
				: err.message;
			loading = false;
			return;
		}

		done = true;
		loading = false;
		setTimeout(() => goto('/'), 2000);
	}
</script>

<div
	style="min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;background:var(--paper);padding:calc(24px + env(safe-area-inset-top)) 24px calc(24px + env(safe-area-inset-bottom));"
>
	<div style="width:100%;max-width:400px;">
		<div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:40px;">
			<span
				style="width:48px;height:48px;background:var(--hinomaru-red);border-radius:50%;display:block;box-shadow:0 4px 16px rgba(188,0,45,0.25);"
			></span>
			<div style="font-size:24px;font-weight:700;letter-spacing:-0.02em;">Hinomaru</div>
		</div>

		{#if done}
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:32px;text-align:center;"
			>
				<div
					style="width:56px;height:56px;background:var(--success-wash);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;"
				>
					✓
				</div>
				<div style="font-size:18px;font-weight:600;margin-bottom:8px;color:var(--success);">
					¡Contraseña actualizada!
				</div>
				<div style="font-size:14px;color:var(--fg-secondary);line-height:1.6;">
					Tu contraseña se actualizó correctamente.<br />Redirigiendo al inicio…
				</div>
			</div>
		{:else}
			<form
				onsubmit={submit}
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:28px;display:flex;flex-direction:column;gap:16px;"
			>
				<div>
					<div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;margin-bottom:4px;">
						Nueva contraseña
					</div>
					<div style="font-size:14px;color:var(--fg-secondary);">
						Elige una contraseña segura para tu cuenta.
					</div>
				</div>

				<!-- Password -->
				<div class="field">
					<div class="label-meta" style="margin-bottom:8px;">Nueva contraseña</div>
					<div class="pw-wrap">
						<input
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="Mín. 6 caract., 1 mayúscula, 1 número"
							class="hm-input {fieldErrors.password ? 'input-error' : ''}"
							autocomplete="new-password"
						/>
						<button
							type="button"
							class="pw-toggle"
							onclick={() => (showPassword = !showPassword)}
							aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
						>
							{#if showPassword}
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
									<path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
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
					{#if fieldErrors.password}
						<span class="field-error">⚠ {fieldErrors.password}</span>
					{/if}
					{#if password}
						<div class="strength-bar">
							<div
								class="strength-fill"
								style="width:{strength() * 25}%;background:{strengthLabel().color};"
							></div>
						</div>
						<div class="strength-text" style="color:{strengthLabel().color};">
							{strengthLabel().text}
						</div>
					{/if}
				</div>

				<!-- Confirm -->
				<div class="field">
					<div class="label-meta" style="margin-bottom:8px;">Confirmar contraseña</div>
					<div class="pw-wrap">
						<input
							type={showConfirm ? 'text' : 'password'}
							bind:value={confirm}
							placeholder="Repite tu contraseña"
							class="hm-input {fieldErrors.confirm || confirmError ? 'input-error' : ''}"
							autocomplete="new-password"
						/>
						<button
							type="button"
							class="pw-toggle"
							onclick={() => (showConfirm = !showConfirm)}
							aria-label={showConfirm ? 'Ocultar contraseña' : 'Ver contraseña'}
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
									<path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
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
							>✓ Las contraseñas coinciden</span
						>
					{/if}
				</div>

				{#if globalError}
					<div
						style="font-size:13px;color:var(--hinomaru-red);padding:10px 12px;background:var(--hinomaru-red-wash);border-radius:var(--radius-sm);"
					>
						⚠ {globalError}
					</div>
				{/if}

				<button type="submit" class="hm-btn hm-btn-primary hm-btn-full" disabled={loading}>
					{#if loading}<span style="opacity:0.7;">…</span>{:else}Guardar contraseña{/if}
				</button>
			</form>
		{/if}
	</div>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
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

	.input-error {
		border-color: var(--hinomaru-red) !important;
		box-shadow: 0 0 0 3px rgba(188, 0, 45, 0.1);
	}
</style>
