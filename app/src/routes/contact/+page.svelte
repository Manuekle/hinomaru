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

<div class="page-wrap">
	<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:8px;">
		<a href="/" class="back-link-beautiful">
			← {t('deck.back', $locale)}
		</a>
	</div>

	<h1 use:fadeUp={{ delay: 0.06, y: 16 }} class="page-title">
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

	<!-- Support section matching settings style -->
	<div use:fadeUp={{ delay: 0.25, y: 16 }} class="support-section">
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
	</div>
</div>

<style>
	.page-wrap {
		max-width: 600px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 24px calc(80px + env(safe-area-inset-bottom));
	}

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

	.page-title {
		font-size: 40px;
		font-weight: 400;
		margin: 0 0 12px;
		letter-spacing: -0.03em;
		color: var(--sumi);
	}

	.page-desc {
		color: var(--fg-secondary);
		font-size: 17px;
		line-height: 1.6;
		margin: 0 0 48px;
		max-width: 480px;
	}

	.card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 32px;
		padding: 40px;
		box-shadow: var(--shadow-md);
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
		font-weight: 400;
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
		border: 1px solid rgba(188, 0, 45, 0.1);
	}

	.field {
		margin-bottom: 24px;
	}

	.label-meta {
		display: block;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg-tertiary);
		margin-bottom: 10px;
		padding-left: 4px;
	}

	.form-input {
		width: 100%;
		height: 56px;
		padding: 0 20px;
		border-radius: 18px;
		border: 1px solid var(--ink-200);
		background: var(--paper);
		font-family: inherit;
		font-size: 16px;
		color: var(--fg-primary);
		transition: all 0.2s var(--ease-brand);
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--sumi);
		background: var(--washi);
		box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.05);
	}

	.form-textarea {
		height: auto;
		padding: 18px 20px;
		resize: vertical;
		min-height: 140px;
	}

	/* Support section matching settings style */
	.support-section {
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

	.support-container {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 32px;
		box-shadow: var(--shadow-sm);
		text-align: center;
	}

	.support-text {
		font-size: 14px;
		color: var(--fg-secondary);
		line-height: 1.6;
		margin: 0 0 20px;
	}

	.support-image-btn {
		display: inline-block;
		transition: transform 0.2s var(--ease-brand);
	}

	.support-image-btn img {
		height: 48px;
		width: auto;
		display: block;
	}

	@media (hover: hover) {
		.support-image-btn:hover {
			transform: scale(1.05);
		}
	}

	.support-image-btn:active {
		transform: scale(0.96);
	}
</style>
