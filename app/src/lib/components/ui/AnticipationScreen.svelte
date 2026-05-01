<script lang="ts">
	import { popIn, fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { Award01Icon } from '@hugeicons/core-free-icons';
</script>

<div class="anticipation-overlay" use:popIn={{ duration: 0.5 }}>
	<div class="anticipation-content" use:fadeUp={{ delay: 0.2, y: 20 }}>
		<div class="glowing-icon-wrapper">
			<div class="glow-ring"></div>
			<div class="glow-ring delay"></div>
			<div class="hinomaru-seal">
				<div class="hinomaru-red-dot"></div>
			</div>
			<svg class="scanning-circle" viewBox="0 0 100 100">
				<circle cx="50" cy="50" r="48" fill="none" stroke="var(--hinomaru-red)" stroke-width="2" stroke-dasharray="10 292" />
			</svg>
		</div>
		<div class="status-stack">
			<p class="status-text">{t('exam.calculating', $locale)}</p>
			<div class="progress-bar-mini">
				<div class="progress-fill"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.anticipation-overlay {
		position: fixed;
		inset: 0;
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
	}

	:global(.dark) .anticipation-overlay {
		background: rgba(18, 18, 18, 0.9);
	}

	.anticipation-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 40px;
	}

	.glowing-icon-wrapper {
		position: relative;
		width: 120px;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hinomaru-seal {
		position: relative;
		z-index: 5;
		width: 80px;
		height: 80px;
		background: #ffffff;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--ink-200);
	}

	.hinomaru-red-dot {
		width: 36px;
		height: 36px;
		background: #bc002d;
		border-radius: 50%;
		box-shadow: 0 0 15px rgba(188, 0, 45, 0.2);
	}

	.glow-ring {
		position: absolute;
		width: 80px;
		height: 80px;
		border-radius: 24px;
		background: var(--hinomaru-red);
		opacity: 0;
		animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.glow-ring.delay {
		animation-delay: 1s;
	}

	.scanning-circle {
		position: absolute;
		width: 130px;
		height: 130px;
		animation: rotate-scan 2s linear infinite;
	}

	.status-stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.status-text {
		font-size: 14px;
		font-weight: 800;
		color: var(--sumi);
		letter-spacing: 0.2em;
		text-transform: uppercase;
		margin: 0;
		font-family: var(--font-ui);
	}

	.progress-bar-mini {
		width: 140px;
		height: 3px;
		background: var(--ink-100);
		border-radius: 99px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--hinomaru-red);
		width: 30%;
		animation: progress-slide 2s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0% { transform: scale(1); opacity: 0.3; }
		100% { transform: scale(1.6); opacity: 0; }
	}

	@keyframes rotate-scan {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@keyframes progress-slide {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(400%); }
	}
</style>
