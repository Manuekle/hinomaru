<script lang="ts">
	import { popIn, fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { Target01Icon } from '@hugeicons/core-free-icons';
</script>

<div class="anticipation-overlay" use:popIn={{ duration: 0.4 }}>
	<div class="anticipation-content" use:fadeUp={{ delay: 0.2, y: 15 }}>
		<div class="icon-pulse-wrapper">
			<div class="pulse-ring"></div>
			<div class="pulse-ring delay"></div>
			<div class="icon-box">
				<Icon icon={Target01Icon} size={32} color="white" />
			</div>
		</div>
		<p class="anticipation-text">{t('exam.calculating', $locale)}</p>
	</div>
</div>

<style>
	.anticipation-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--paper);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.anticipation-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
	}

	.icon-pulse-wrapper {
		position: relative;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-box {
		position: relative;
		z-index: 2;
		width: 64px;
		height: 64px;
		background: var(--hinomaru-red);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8px 24px rgba(188, 0, 45, 0.3);
		animation: icon-float 2s ease-in-out infinite alternate;
	}

	.pulse-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 64px;
		height: 64px;
		border-radius: 24px;
		background: var(--hinomaru-red);
		opacity: 0;
		animation: pulse-out 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
		z-index: 1;
	}

	.pulse-ring.delay {
		animation-delay: 0.75s;
	}

	.anticipation-text {
		font-size: 15px;
		font-weight: 700;
		color: var(--fg-secondary);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		animation: text-breathe 1.5s ease-in-out infinite alternate;
		font-family: var(--font-ui);
	}

	@keyframes icon-float {
		0% {
			transform: translateY(0) scale(1);
		}
		100% {
			transform: translateY(-4px) scale(1.02);
		}
	}

	@keyframes pulse-out {
		0% {
			width: 64px;
			height: 64px;
			opacity: 0.4;
		}
		100% {
			width: 140px;
			height: 140px;
			opacity: 0;
		}
	}

	@keyframes text-breathe {
		0% {
			opacity: 0.4;
		}
		100% {
			opacity: 1;
		}
	}
</style>
