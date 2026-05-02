<script lang="ts">
	import { popIn, fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { Award01Icon } from '@hugeicons/core-free-icons';
</script>

<div class="anticipation-overlay" use:popIn={{ duration: 0.5 }}>
	<div class="anticipation-content" use:fadeUp={{ delay: 0.1, y: 10 }}>
		<div class="hinomaru-red-dot"></div>
		<p class="status-text">{t('session.finishing', $locale)}</p>
	</div>
</div>

<style>
	.anticipation-overlay {
		position: fixed;
		inset: 0;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
	}

	:global(.dark) .anticipation-overlay {
		background: #121212;
	}

	.anticipation-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
	}

	.hinomaru-red-dot {
		width: 48px;
		height: 48px;
		background: #bc002d;
		border-radius: 50%;
		animation: breathing 2.5s ease-in-out infinite;
	}

	.status-text {
		font-size: 11px;
		font-weight: 500;
		color: var(--fg-tertiary);
		letter-spacing: 0.15em;
		text-transform: uppercase;
		margin: 0;
		font-family: var(--font-ui);
		opacity: 0.8;
	}

	@keyframes breathing {
		0%,
		100% {
			transform: scale(0.9);
			opacity: 0.8;
		}
		50% {
			transform: scale(1.1);
			opacity: 1;
		}
	}
</style>
