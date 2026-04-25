<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import { fadeUp } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import { Coffee04Icon } from '@hugeicons/core-free-icons';

	let { variant = 'card' } = $props<{ variant?: 'card' | 'button' | 'minimal' }>();

	const kofiUrl = 'https://ko-fi.com/manujsx';
</script>

{#if variant === 'card'}
	<div use:fadeUp={{ delay: 0.3 }} class="support-card">
		<div class="icon-container">
			<Icon icon={Coffee04Icon} size={40} strokeWidth={1.5} />
		</div>
		<div class="content">
			<h3>{t('support.title', $locale)}</h3>
			<p>{t('support.desc', $locale)}</p>
			<a href={kofiUrl} target="_blank" rel="noopener noreferrer" class="kofi-button">
				<span class="kofi-icon">
					<Icon icon={Coffee04Icon} size={20} strokeWidth={2} />
				</span>
				{t('support.kofi', $locale)}
			</a>
		</div>
	</div>
{:else if variant === 'button'}
	<a href={kofiUrl} target="_blank" rel="noopener noreferrer" class="kofi-button-large">
		<Icon icon={Coffee04Icon} size={24} strokeWidth={2} />
		{t('support.kofi', $locale)}
	</a>
{:else}
	<a
		href={kofiUrl}
		target="_blank"
		rel="noopener noreferrer"
		class="minimal-link"
		title={t('support.kofi', $locale)}
	>
		<Icon icon={Coffee04Icon} size={20} strokeWidth={2} />
	</a>
{/if}

<style>
	.support-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: var(--radius-lg);
		padding: var(--space-8);
		display: flex;
		gap: var(--space-6);
		align-items: center;
		box-shadow: var(--shadow-md);
		margin-top: 40px;
		text-align: left;
		position: relative;
		overflow: hidden;
	}

	.support-card::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 150px;
		height: 150px;
		background: linear-gradient(135deg, transparent, rgba(255, 94, 91, 0.05));
		border-radius: 0 0 0 100%;
		pointer-events: none;
	}

	.icon-container {
		width: 80px;
		height: 80px;
		background: var(--paper);
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40px;
		flex-shrink: 0;
		border: 1px solid var(--ink-100);
		box-shadow: var(--shadow-sm);
	}

	.content h3 {
		font-size: var(--fs-lg);
		font-weight: 700;
		margin: 0 0 8px;
		letter-spacing: var(--tracking-tight);
	}

	.content p {
		font-size: var(--fs-sm);
		color: var(--fg-secondary);
		line-height: var(--lh-body);
		margin: 0 0 20px;
	}

	.kofi-button {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: #ff5e5b; /* Ko-fi brand color */
		color: white;
		text-decoration: none;
		padding: 0 var(--space-6);
		height: 44px;
		border-radius: var(--radius-sm);
		font-size: var(--fs-sm);
		font-weight: 700;
		transition:
			transform 200ms ease,
			box-shadow 200ms ease;
		box-shadow: 0 4px 12px rgba(255, 94, 91, 0.2);
	}

	.kofi-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(255, 94, 91, 0.3);
	}

	.kofi-button-large {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		background: #ff5e5b;
		color: white;
		text-decoration: none;
		padding: 0 var(--space-8);
		height: 64px;
		border-radius: var(--radius-md);
		font-size: var(--fs-md);
		font-weight: 700;
		transition: all 200ms ease;
		box-shadow: 0 8px 24px rgba(255, 94, 91, 0.25);
	}

	.kofi-button-large:hover {
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 12px 32px rgba(255, 94, 91, 0.35);
	}

	.minimal-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-full);
		color: var(--fg-tertiary);
		transition: all 150ms ease;
	}

	.minimal-link:hover {
		background: rgba(255, 94, 91, 0.1);
		color: #ff5e5b;
	}

	@media (max-width: 600px) {
		.support-card {
			flex-direction: column;
			text-align: center;
			padding: 40px 24px;
		}
		.icon-container {
			margin: 0 auto;
		}
		.content {
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	}
</style>
