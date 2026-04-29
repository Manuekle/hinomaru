<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';

	let { children, onBack } = $props<{ children?: any; onBack?: () => void }>();
</script>

<div class="sticky-footer">
	<div class="footer-content">
		{#if onBack}
			<button
				class="hm-btn hm-btn-secondary hm-btn-lg back-btn"
				onclick={onBack}
				aria-label="Back"
			>
				<Icon icon={ArrowLeft02Icon} size={20} color="currentColor" />
				<span class="back-text">{t('onboarding.back', $locale)}</span>
			</button>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	/* Default (Android + Desktop): inline at end of content */
	.sticky-footer {
		position: relative;
		margin-top: auto;
		width: 100%;
		padding: 16px 24px max(16px, env(safe-area-inset-bottom, 0px));
		display: flex;
		justify-content: center;
	}

	.footer-content {
		width: 100%;
		max-width: 520px;
		display: flex;
		gap: 12px;
	}

	/* When back button is alone (no sibling), let it span the row */
	.footer-content > .back-btn:only-child {
		flex: 1;
	}
	.footer-content > .back-btn:not(:only-child) {
		flex: 0 0 auto;
	}

	.back-text {
		display: inline;
	}

	/* Desktop: more generous padding */
	@media (min-width: 768px) {
		.sticky-footer {
			padding: 16px 32px 24px;
		}
	}

	@media (max-width: 400px) {
		.back-text {
			display: none;
		}
		.footer-content {
			gap: 8px;
		}
	}

	/* iOS: fixed floating footer with safe-area clearance */
	:global(html.is-ios) .sticky-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: var(--bg-page);
		border-top: 1px solid var(--ink-100);
		margin-top: 0;
		padding: 8px 24px max(16px, env(safe-area-inset-bottom, 0px));
		pointer-events: none;
	}

	:global(html.is-ios) .footer-content {
		pointer-events: auto;
	}
</style>
