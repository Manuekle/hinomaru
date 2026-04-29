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
	/* Fixed footer across all platforms. GPU layer (translateZ) prevents iOS
	   scroll jitter on position:fixed (same trick as DockBar). */
	.sticky-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		display: flex;
		justify-content: center;
		padding: 8px 16px max(16px, env(safe-area-inset-bottom, 0px));
		pointer-events: none;
		transform: translateZ(0);
		-webkit-transform: translateZ(0);
		will-change: transform;
	}

	.footer-content {
		width: 100%;
		max-width: 520px;
		display: flex;
		gap: 12px;
		pointer-events: auto;
	}

	.footer-content > .back-btn:only-child {
		flex: 1;
	}
	.footer-content > .back-btn:not(:only-child) {
		flex: 0 0 auto;
	}

	.back-text {
		display: inline;
	}

	@media (min-width: 768px) {
		.sticky-footer {
			padding: 12px 16px 24px;
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
