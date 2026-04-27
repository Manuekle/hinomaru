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
				class="hm-btn hm-btn-secondary hm-btn-lg" 
				style={!children ? 'width: 100%' : 'flex: 0 0 auto'} 
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
	.sticky-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: var(--bg-page);
		border-top: 1px solid var(--ink-100);
		/* Tightest possible integration with safe-area */
		padding: 12px 24px env(safe-area-inset-bottom, 12px);
		display: flex;
		justify-content: center;
		pointer-events: auto;
	}

	.footer-content {
		width: 100%;
		max-width: 520px;
		display: flex;
		gap: 12px;
		pointer-events: auto; /* Re-enable clicks for the buttons */
	}

	/* Optional: subtle blur for glass effect if preferred */
	/* 
	@supports (backdrop-filter: blur(10px)) {
		.sticky-footer {
			background: color-mix(in srgb, var(--bg-page) 80%, transparent);
			backdrop-filter: blur(12px);
		}
	}
	*/
	.back-text {
		display: inline;
	}

	@media (max-width: 400px) {
		.back-text {
			display: none;
		}
		.footer-content {
			gap: 8px;
		}
	}
</style>
