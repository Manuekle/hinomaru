<script lang="ts">
	import { fadeUp, fadeIn, inView } from '$lib/motion';
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import Icon from '$lib/Icon.svelte';
	import {
		CheckmarkCircle01Icon,
		Mail01Icon,
		MailSend01Icon,
		ArrowLeft01Icon,
		SparklesIcon,
		Coffee02Icon,
		FlashIcon
	} from '@hugeicons/core-free-icons';
	import kofiImg from '$lib/assets/kofi_brandasset/support_me_on_kofi_dark.png';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();
	let loading = $state(false);
</script>

<svelte:head>
	<title>{t('contact.title', $locale)} | Hinomaru</title>
</svelte:head>

<div class="legal-page">
	<header class="legal-header">
		<div class="header-inner">
			<a href="/" class="brand-link">
				<span class="brand-dot"></span>
				<span class="brand-name">Hinomaru</span>
			</a>
			<a href="/" class="header-back">
				<Icon icon={ArrowLeft01Icon} size={14} color="currentColor" />
				<span>{t('deck.back', $locale)}</span>
			</a>
		</div>
	</header>

	<main class="contact-content">
		<div class="hero" use:fadeIn>
			<div class="hero-deco">
				<span class="kanji">話</span>
				<span class="sun-disc"></span>
			</div>
			<div class="badge-row" use:fadeUp={{ y: 12 }}>
				<Icon icon={SparklesIcon} size={14} color="currentColor" />
				<span>{$locale === 'es' ? 'Hablemos' : "Let's talk"}</span>
			</div>
			<h1 use:fadeUp={{ y: 18, delay: 0.05 }}>
				{t('contact.title', $locale)}
			</h1>
			<p class="hero-desc" use:fadeUp={{ y: 12, delay: 0.1 }}>
				{t('contact.desc', $locale)}
			</p>
		</div>

		<div class="layout">
			<aside class="info-panel" use:inView={{ y: 20, duration: 0.6 }}>
				<div class="info-card primary">
					<div class="info-icon">
						<Icon icon={Mail01Icon} size={22} color="#fff" strokeWidth={1.6} />
					</div>
					<p class="info-label">{$locale === 'es' ? 'Respuesta rápida' : 'Fast response'}</p>
					<p class="info-title">
						{$locale === 'es' ? 'Solemos responder en 24h' : 'We usually reply within 24h'}
					</p>
					<p class="info-sub">
						{$locale === 'es'
							? 'Cada mensaje lo lee un humano. Bug, idea o solo un saludo — bienvenido.'
							: 'Every message is read by a human. Bug, idea or just a hi — welcome.'}
					</p>
				</div>

				<div class="info-card">
					<div class="info-row">
						<div class="info-icon-sm">
							<Icon icon={FlashIcon} size={16} color="var(--brand-primary)" strokeWidth={1.8} />
						</div>
						<div>
							<p class="info-row-title">{$locale === 'es' ? 'Reportar un bug' : 'Report a bug'}</p>
							<p class="info-row-sub">
								{$locale === 'es'
									? 'Incluye pasos para reproducir si puedes.'
									: 'Include reproduction steps if you can.'}
							</p>
						</div>
					</div>
					<div class="info-divider"></div>
					<div class="info-row">
						<div class="info-icon-sm">
							<Icon icon={SparklesIcon} size={16} color="var(--brand-primary)" strokeWidth={1.8} />
						</div>
						<div>
							<p class="info-row-title">{$locale === 'es' ? 'Sugerir feature' : 'Suggest feature'}</p>
							<p class="info-row-sub">
								{$locale === 'es'
									? '¿Algo que harías diferente? Cuéntanos.'
									: 'Anything you’d do differently? Tell us.'}
							</p>
						</div>
					</div>
				</div>

				<a
					href="https://ko-fi.com/manujsx"
					target="_blank"
					rel="noopener noreferrer"
					class="kofi-card"
				>
					<img src={kofiImg} alt="Support on Ko-fi" />
					<p class="kofi-sub">
						{$locale === 'es'
							? 'Apoya el proyecto si te resulta útil.'
							: 'Support the project if you find it useful.'}
					</p>
				</a>
			</aside>

			<div class="form-wrap" use:inView={{ y: 24, duration: 0.6 }}>
				<div class="card">
					{#if form && form.success}
						<div class="success-state">
							<div class="success-icon">
								<Icon
									icon={CheckmarkCircle01Icon}
									size={56}
									color="var(--success)"
									strokeWidth={1.5}
								/>
							</div>
							<h2 class="success-title">{t('contact.success.title', $locale)}</h2>
							<p class="success-desc">{t('contact.success.desc', $locale)}</p>
							<button
								type="button"
								onclick={() => location.reload()}
								class="another-btn"
							>
								{t('contact.success.another', $locale)}
							</button>
						</div>
					{:else}
						<div class="form-head">
							<h2>{$locale === 'es' ? 'Envíanos un mensaje' : 'Send us a message'}</h2>
							<p>
								{$locale === 'es'
									? 'Completa el formulario y te respondemos pronto.'
									: 'Fill out the form and we’ll get back to you soon.'}
							</p>
						</div>

						<form
							method="POST"
							use:enhance={() => {
								loading = true;
								return async ({ update }) => {
									loading = false;
									await update();
								};
							}}
						>
							{#if form?.error}
								<div class="form-error">
									{t(form.error, $locale)}
								</div>
							{/if}

							<div class="row">
								<div class="field">
									<label for="name">{t('contact.name', $locale)}</label>
									<input
										type="text"
										id="name"
										name="name"
										required
										placeholder={t('contact.placeholder.name', $locale)}
										class="form-input"
									/>
								</div>

								<div class="field">
									<label for="email">{t('contact.email', $locale)}</label>
									<input
										type="email"
										id="email"
										name="email"
										required
										placeholder={t('contact.placeholder.email', $locale)}
										class="form-input"
									/>
								</div>
							</div>

							<div class="field">
								<label for="message">{t('contact.message', $locale)}</label>
								<textarea
									id="message"
									name="message"
									required
									rows="5"
									placeholder={t('contact.placeholder.message', $locale)}
									class="form-input form-textarea"
								></textarea>
							</div>

							<button type="submit" disabled={loading} class="submit-btn">
								{#if loading}
									<DotLoader color="white" />
								{:else}
									<Icon icon={MailSend01Icon} size={18} color="currentColor" strokeWidth={1.8} />
									<span>{t('contact.send', $locale)}</span>
								{/if}
							</button>

							<p class="form-foot">
								{$locale === 'es'
									? 'Al enviar aceptas nuestra '
									: 'By submitting you accept our '}<a href="/privacy">{t('privacy.title', $locale)}</a>.
							</p>
						</form>
					{/if}
				</div>
			</div>
		</div>

		<div class="legal-footer" use:fadeUp={{ delay: 0.1 }}>
			<a href="/" class="back-cta">
				<Icon icon={ArrowLeft01Icon} size={16} color="currentColor" />
				<span>{t('deck.back', $locale)}</span>
			</a>
		</div>
	</main>
</div>

<style>
	.legal-page {
		min-height: 100vh;
		background: var(--bg-surface);
		color: var(--fg-primary);
		font-family: var(--font-ui);
		position: relative;
		overflow-x: hidden;
	}

	/* ── Header ── */
	.legal-header {
		padding: 18px 24px;
		border-bottom: 1px solid var(--ink-100);
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg-surface-glass, rgba(255, 255, 255, 0.85));
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
	}
	.header-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.brand-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--fg-primary);
	}
	.brand-dot {
		width: 12px;
		height: 12px;
		background: var(--brand-primary);
		border-radius: 50%;
		box-shadow: 0 0 16px rgba(188, 0, 45, 0.5);
	}
	.brand-name {
		font-weight: 800;
		font-size: 17px;
		letter-spacing: -0.02em;
	}
	.header-back {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-secondary);
		text-decoration: none;
		padding: 8px 14px;
		border-radius: 999px;
		border: 1px solid var(--ink-100);
		transition: all 200ms var(--ease-brand);
	}
	.header-back:hover {
		color: var(--brand-primary);
		border-color: var(--brand-primary);
		transform: translateX(-2px);
	}

	.contact-content {
		max-width: 1100px;
		margin: 0 auto;
		padding: 56px 24px 80px;
	}

	/* ── Hero ── */
	.hero {
		position: relative;
		padding: 32px 0 56px;
		text-align: center;
		margin-bottom: 56px;
	}
	.hero-deco {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 0;
	}
	.kanji {
		position: absolute;
		font-family: var(--font-jp);
		font-size: clamp(180px, 30vw, 280px);
		font-weight: 900;
		color: var(--fg-primary);
		opacity: 0.04;
		line-height: 1;
		user-select: none;
	}
	.sun-disc {
		position: absolute;
		width: clamp(220px, 30vw, 320px);
		height: clamp(220px, 30vw, 320px);
		background: radial-gradient(
			circle,
			rgba(188, 0, 45, 0.12) 0%,
			rgba(188, 0, 45, 0.04) 40%,
			transparent 70%
		);
		border-radius: 50%;
		filter: blur(20px);
	}
	.badge-row {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 14px;
		background: rgba(188, 0, 45, 0.08);
		color: var(--brand-primary);
		border-radius: 999px;
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 24px;
	}
	h1 {
		position: relative;
		z-index: 1;
		font-size: clamp(40px, 8vw, 68px);
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1.05;
		margin: 0 0 16px;
	}
	.hero-desc {
		position: relative;
		z-index: 1;
		font-size: 17px;
		color: var(--fg-secondary);
		line-height: 1.6;
		margin: 0 auto;
		max-width: 540px;
	}

	/* ── Layout ── */
	.layout {
		display: grid;
		grid-template-columns: 340px 1fr;
		gap: 32px;
		align-items: start;
	}

	/* ── Info panel ── */
	.info-panel {
		display: flex;
		flex-direction: column;
		gap: 16px;
		position: sticky;
		top: 96px;
	}
	.info-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-100);
		border-radius: 24px;
		padding: 24px;
	}
	.info-card.primary {
		background: linear-gradient(135deg, var(--brand-primary) 0%, #8a0021 100%);
		border-color: transparent;
		color: #fff;
		position: relative;
		overflow: hidden;
	}
	.info-card.primary::after {
		content: '';
		position: absolute;
		bottom: -60px;
		right: -60px;
		width: 200px;
		height: 200px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 70%);
		border-radius: 50%;
		pointer-events: none;
	}
	.info-icon {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16px;
	}
	.info-label {
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.8;
		margin: 0 0 6px;
	}
	.info-title {
		font-size: 18px;
		font-weight: 800;
		letter-spacing: -0.01em;
		line-height: 1.3;
		margin: 0 0 8px;
	}
	.info-sub {
		font-size: 13.5px;
		line-height: 1.55;
		opacity: 0.85;
		margin: 0;
	}

	.info-row {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}
	.info-icon-sm {
		width: 32px;
		height: 32px;
		border-radius: 10px;
		background: rgba(188, 0, 45, 0.08);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.info-row-title {
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-primary);
		margin: 0 0 2px;
	}
	.info-row-sub {
		font-size: 13px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin: 0;
	}
	.info-divider {
		height: 1px;
		background: var(--ink-100);
		margin: 16px 0;
	}

	.kofi-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		text-decoration: none;
		padding: 20px;
		background: #0a0a0a;
		border-radius: 24px;
		transition: transform 240ms var(--ease-brand);
	}
	.kofi-card:hover {
		transform: translateY(-2px);
	}
	.kofi-card img {
		height: 40px;
		width: auto;
		display: block;
		border-radius: 8px;
	}
	.kofi-sub {
		font-size: 12.5px;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0;
	}

	/* ── Form ── */
	.form-wrap {
		min-width: 0;
	}
	.card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-100);
		border-radius: 28px;
		padding: 40px;
		box-shadow: var(--shadow-md);
	}
	.form-head {
		margin-bottom: 28px;
	}
	.form-head h2 {
		font-size: 24px;
		font-weight: 800;
		letter-spacing: -0.02em;
		margin: 0 0 6px;
		color: var(--fg-primary);
	}
	.form-head p {
		font-size: 14.5px;
		color: var(--fg-secondary);
		margin: 0;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	.field {
		margin-bottom: 18px;
	}
	.field label {
		display: block;
		font-size: 12px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-secondary);
		margin-bottom: 8px;
		padding-left: 2px;
	}
	.form-input {
		width: 100%;
		height: 52px;
		padding: 0 18px;
		border-radius: 14px;
		border: 1.5px solid var(--ink-100);
		background: var(--bg-surface);
		font-family: inherit;
		font-size: 15px;
		color: var(--fg-primary);
		transition: all 0.2s var(--ease-brand);
	}
	.form-input::placeholder {
		color: var(--fg-tertiary, var(--fg-secondary));
		opacity: 0.6;
	}
	.form-input:focus {
		outline: none;
		border-color: var(--brand-primary);
		box-shadow: var(--shadow-focus, 0 0 0 4px rgba(188, 0, 45, 0.12));
	}
	.form-textarea {
		height: auto;
		padding: 16px 18px;
		resize: vertical;
		min-height: 140px;
		line-height: 1.6;
	}

	.form-error {
		background: var(--error-wash);
		color: var(--error);
		padding: 14px 16px;
		border-radius: 14px;
		font-size: 13.5px;
		margin-bottom: 20px;
		font-weight: 600;
	}

	.submit-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		width: 100%;
		height: 56px;
		border: none;
		border-radius: 16px;
		background: var(--brand-primary);
		color: #fff;
		font-family: inherit;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 0.01em;
		cursor: pointer;
		transition: all 220ms var(--ease-brand);
		margin-top: 8px;
	}
	.submit-btn:hover:not(:disabled) {
		background: var(--brand-primary-hover, #9a0025);
		transform: translateY(-2px);
		box-shadow: 0 12px 28px rgba(188, 0, 45, 0.32);
	}
	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-foot {
		font-size: 12.5px;
		color: var(--fg-tertiary, var(--fg-secondary));
		text-align: center;
		margin: 16px 0 0;
		opacity: 0.7;
	}
	.form-foot a {
		color: var(--brand-primary);
		text-decoration: none;
		font-weight: 600;
	}
	.form-foot a:hover {
		text-decoration: underline;
	}

	/* ── Success ── */
	.success-state {
		text-align: center;
		padding: 24px 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
	}
	.success-icon {
		background: var(--success-wash);
		width: 88px;
		height: 88px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
	}
	.success-title {
		font-size: 26px;
		font-weight: 800;
		margin: 0;
		color: var(--fg-primary);
		letter-spacing: -0.02em;
	}
	.success-desc {
		color: var(--fg-secondary);
		line-height: 1.6;
		margin: 0;
		font-size: 15.5px;
		max-width: 340px;
	}
	.another-btn {
		margin-top: 12px;
		padding: 12px 22px;
		border: 1px solid var(--ink-100);
		background: transparent;
		color: var(--fg-primary);
		font-family: inherit;
		font-weight: 700;
		font-size: 14px;
		border-radius: 999px;
		cursor: pointer;
		transition: all 200ms var(--ease-brand);
	}
	.another-btn:hover {
		border-color: var(--brand-primary);
		color: var(--brand-primary);
	}

	/* ── Footer ── */
	.legal-footer {
		margin-top: 56px;
		padding-top: 32px;
		border-top: 1px solid var(--ink-100);
		display: flex;
	}
	.back-cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		border-radius: 999px;
		font-weight: 700;
		font-size: 14px;
		text-decoration: none;
		background: transparent;
		color: var(--fg-secondary);
		border: 1px solid var(--ink-100);
		transition: all 220ms var(--ease-brand);
	}
	.back-cta:hover {
		color: var(--fg-primary);
		border-color: var(--fg-primary);
		transform: translateX(-3px);
	}

	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
			gap: 24px;
		}
		.info-panel {
			position: relative;
			top: 0;
			order: 2;
		}
		.form-wrap {
			order: 1;
		}
	}
	@media (max-width: 600px) {
		.contact-content {
			padding: 32px 16px 56px;
		}
		.hero {
			padding: 16px 0 40px;
			margin-bottom: 32px;
		}
		.card {
			padding: 28px 22px;
			border-radius: 24px;
		}
		.row {
			grid-template-columns: 1fr;
			gap: 0;
		}
		.form-head h2 {
			font-size: 22px;
		}
		.info-card {
			padding: 20px;
			border-radius: 20px;
		}
	}
</style>
