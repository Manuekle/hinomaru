<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
	import { onMount } from 'svelte';

	let { children, onBack } = $props<{ children?: any; onBack?: () => void }>();

	let isIOS = $state(false);

	onMount(() => {
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
	});
</script>

<div class="sticky-footer" class:ios={isIOS}>
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
		/*
		 * env(safe-area-inset-bottom) = ~34px on iOS (home bar), = 0 on Android/desktop.
		 */
		padding: 8px 24px max(16px, env(safe-area-inset-bottom, 0px));
		display: flex;
		justify-content: center;
		pointer-events: none;
		transition: all 0.3s ease;
	}

	/* iOS Floating Style */
	.sticky-footer.ios {
		background: transparent;
		border-top: none;
		padding: 0 16px max(16px, calc(env(safe-area-inset-bottom, 0px) - 10px));
	}

	.sticky-footer.ios .footer-content {
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(24px) saturate(190%);
		-webkit-backdrop-filter: blur(24px) saturate(190%);
		border-radius: 28px;
		padding: 12px 16px;
		border: 0.5px solid rgba(0, 0, 0, 0.05);
		box-shadow: 
			0 12px 32px rgba(0, 0, 0, 0.12),
			0 2px 8px rgba(0, 0, 0, 0.06);
	}

	:global([data-theme='dark']) .sticky-footer.ios .footer-content {
		background: rgba(28, 28, 30, 0.8);
		border-color: rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 10px 30px rgba(0, 0, 0, 0.4),
			0 1px 8px rgba(0, 0, 0, 0.2);
	}

	.footer-content {
		width: 100%;
		max-width: 520px;
		display: flex;
		gap: 12px;
		pointer-events: auto;
	}

	.back-text {
		display: inline;
	}

	/* Desktop: more generous padding, centered feel */
	@media (min-width: 768px) {
		.sticky-footer {
			padding: 12px 32px 24px;
		}
		.sticky-footer.ios {
			padding-bottom: 24px;
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
</style>
