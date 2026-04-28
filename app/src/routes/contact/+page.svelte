<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import Icon from '$lib/Icon.svelte';
	import { CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
	import supportImg from '$lib/assets/support.png';
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
		</div>
	</header>

	<main class="legal-content">
		<h1 use:fadeUp>
			{t('contact.title', $locale)}
		</h1>
		<p use:fadeUp={{ delay: 0.1 }} class="page-desc">
			{t('contact.desc', $locale)}
		</p>

		<div use:fadeUp={{ delay: 0.15, y: 16 }} class="card">
			{#if form && form.success}
				<div class="success-state">
					<div class="success-icon">
						<Icon icon={CheckmarkCircle01Icon} size={52} color="var(--success)" strokeWidth={1.5} />
					</div>
					<h2 class="success-title">{t('contact.success.title', $locale)}</h2>
					<p class="success-desc">{t('contact.success.desc', $locale)}</p>
					<button
						onclick={() => location.reload()}
						class="hm-btn hm-btn-ghost"
						style="margin-top:8px;"
					>
						{t('contact.success.another', $locale)}
					</button>
				</div>
			{:else}
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

					<div class="field">
						<label for="name" class="label-meta">{t('contact.name', $locale)}</label>
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
						<label for="email" class="label-meta">{t('contact.email', $locale)}</label>
						<input
							type="email"
							id="email"
							name="email"
							required
							placeholder={t('contact.placeholder.email', $locale)}
							class="form-input"
						/>
					</div>

					<div class="field" style="margin-bottom:32px;">
						<label for="message" class="label-meta">{t('contact.message', $locale)}</label>
						<textarea
							id="message"
							name="message"
							required
							rows="4"
							placeholder={t('contact.placeholder.message', $locale)}
							class="form-input form-textarea"
						></textarea>
					</div>

					<button
						type="submit"
						disabled={loading}
						class="hm-btn hm-btn-primary hm-btn-full"
						style="height:56px; font-size:16px;"
					>
						{#if loading}<DotLoader color="white" />{:else}{t('contact.send', $locale)}{/if}
					</button>
				</form>
			{/if}
		</div>

		<div class="legal-footer" use:fadeUp={{ delay: 0.2 }}>
			<a href="/" class="back-link">← {t('deck.back', $locale)}</a>
		</div>
	</main>
</div>

<style>
	.legal-page {
		min-height: 100vh;
		background: var(--bg-surface);
		color: var(--sumi);
		font-family: var(--font-ui);
	}

	.legal-header {
		padding: 24px;
		border-bottom: 1px solid var(--ink-100);
	}
	.header-inner {
		max-width: 800px;
		margin: 0 auto;
	}
	.brand-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: inherit;
	}
	.brand-dot {
		width: 12px;
		height: 12px;
		background: var(--brand-primary);
		border-radius: 50%;
	}
	.brand-name {
		font-weight: 800;
		font-size: 18px;
		letter-spacing: -0.02em;
	}

	.legal-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 80px 24px;
	}

	h1 {
		font-size: clamp(32px, 8vw, 48px);
		font-weight: 900;
		margin-bottom: 12px;
		letter-spacing: -0.04em;
	}

	.page-desc {
		font-size: 18px;
		color: var(--fg-secondary);
		line-height: 1.6;
		margin-bottom: 48px;
		max-width: 600px;
	}

	.card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-100);
		border-radius: 32px;
		padding: 40px;
		box-shadow: var(--shadow-sm);
		margin-bottom: 48px;
	}

	/* Success state */
	.success-state {
		text-align: center;
		padding: 24px 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}
	.success-icon {
		margin-bottom: 8px;
		background: var(--success-wash);
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.success-title {
		font-size: 24px;
		font-weight: 800;
		margin: 0;
		color: var(--sumi);
	}
	.success-desc {
		color: var(--fg-secondary);
		line-height: 1.6;
		margin: 0;
		font-size: 16px;
	}

	/* Form */
	.form-error {
		background: var(--error-wash);
		color: var(--error);
		padding: 16px;
		border-radius: 16px;
		font-size: 14px;
		margin-bottom: 24px;
		font-weight: 600;
	}

	.field { margin-bottom: 24px; }

	.label-meta {
		display: block;
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--brand-primary);
		margin-bottom: 10px;
		padding-left: 4px;
	}

	.form-input {
		width: 100%;
		height: 56px;
		padding: 0 20px;
		border-radius: 16px;
		border: 1.5px solid var(--ink-100);
		background: #fff;
		font-family: inherit;
		font-size: 16px;
		color: var(--sumi);
		transition: all 0.2s;
	}
	.form-input:focus {
		outline: none;
		border-color: var(--brand-primary);
		box-shadow: 0 0 0 4px rgba(188, 0, 45, 0.05);
	}
	.form-textarea {
		height: auto;
		padding: 18px 20px;
		resize: vertical;
		min-height: 140px;
	}

	.legal-footer {
		margin-top: 80px;
		padding-top: 40px;
		border-top: 1px solid var(--ink-100);
	}

	.back-link {
		font-weight: 700;
		color: var(--brand-primary);
		text-decoration: none;
		transition: opacity 200ms;
	}
	.back-link:hover { opacity: 0.7; }
</style>
