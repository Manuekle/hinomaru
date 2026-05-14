<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import { fadeUp, popIn, animateNumber } from '$lib/motion';
	import { onMount } from 'svelte';
	import { playFinish } from '$lib/utils/sounds';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import Confetti from '$lib/components/Confetti.svelte';

	interface Props {
		correct: number;
		total: number;
		xp?: number;
		title?: string;
		onContinue: () => void;
	}

	let { correct, total, xp = 0, title, onContinue }: Props = $props();

	const pct = $derived(total > 0 ? Math.round((correct / total) * 100) : 0);
	const xpEarned = $derived(xp || correct * 5);

	let displayScore = $state(0);
	let displayXP = $state(0);

	onMount(() => {
		animateNumber((v) => (displayScore = v), correct, { duration: 0.9, delay: 0.2 });
		animateNumber((v) => (displayXP = v), xpEarned, { duration: 1.2, delay: 0.4 });
		playFinish();
	});
</script>

<div class="summary-page-host" use:fadeUp>
	<!-- Decorative background circle (pulsing) -->
	<div class="pulse-bg-circle"></div>

	<div class="summary-inner">
		<!-- Label -->
		<div class="summary-label" use:fadeUp={{ delay: 0.1, y: 8 }}>
			{t('summary.complete', $locale)}
		</div>

		<!-- Score — animated counter -->
		<div class="summary-score-large" use:popIn={{ delay: 0.2 }}>
			{displayScore} <span class="total-sep">/</span> {total}
		</div>

		<div class="summary-msg-text" use:fadeUp={{ delay: 0.45, y: 8 }}>
			{title || (pct === 100 ? t('summary.all', $locale) : t('summary.solid', $locale))}
		</div>

		<!-- Stats list -->
		<div class="summary-stats-list">
			<div class="summary-stat-item centered" use:fadeUp={{ delay: 0.55 }}>
				<span class="summary-stat-key">{t('summary.xp', $locale)}</span>
				<span class="summary-stat-val xp">+{displayXP} XP</span>
			</div>
			<div class="summary-stat-item centered" use:fadeUp={{ delay: 0.65 }}>
				<span class="summary-stat-key">{t('summary.accuracy', $locale)}</span>
				<span class="summary-stat-val" style="color:{pct >= 70 ? 'var(--success)' : 'var(--hinomaru-red)'};">
					{pct}%
				</span>
			</div>
		</div>

		<StickyFooter>
			<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg summary-back-btn" onclick={onContinue}>
				{t('summary.back', $locale)}
			</button>
		</StickyFooter>
	</div>

	{#if pct >= 70}
		<Confetti fireOnMount={true} />
	{/if}
</div>

<style>
	.summary-page-host {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: calc(40px + env(safe-area-inset-top, 0px)) 24px 100px;
		position: relative;
		overflow: hidden;
		width: 100%;
		flex: 1;
		background: var(--paper);
	}

	.pulse-bg-circle {
		position: absolute;
		top: 45%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 300px;
		height: 300px;
		background: var(--hinomaru-red);
		border-radius: 50%;
		opacity: 0.05;
		pointer-events: none;
		z-index: -1;
		animation: pulse-bg 4s ease-in-out infinite;
	}

	.summary-inner {
		position: relative;
		max-width: 420px;
		width: 100%;
		text-align: center;
		z-index: 1;
	}

	.summary-label {
		font-size: 14px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 16px;
	}

	.summary-score-large {
		font-size: 64px;
		font-weight: 900;
		color: var(--fg-primary);
		letter-spacing: -0.04em;
		line-height: 1;
	}

	.total-sep {
		color: var(--ink-300);
		font-weight: 400;
		margin: 0 4px;
	}

	.summary-msg-text {
		font-size: 20px;
		font-weight: 700;
		color: var(--fg-secondary);
		margin-top: 12px;
		margin-bottom: 40px;
	}

	.summary-stats-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
	}

	.summary-stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		border-radius: 20px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		box-shadow: var(--shadow-sm);
	}

	.summary-stat-item.centered {
		justify-content: center;
		gap: 12px;
	}

	.summary-stat-key {
		font-size: 14px;
		color: var(--fg-secondary);
		font-weight: 600;
	}

	.summary-stat-val {
		font-size: 16px;
		font-weight: 800;
		color: var(--fg-primary);
	}

	.summary-stat-val.xp {
		color: #d4a017;
	}

	.summary-back-btn {
		transition: all 0.2s var(--ease-brand);
	}

	@media (hover: hover) {
		.summary-back-btn:hover {
			box-shadow: 0 8px 28px rgba(188, 0, 45, 0.3);
			transform: translateY(-2px);
		}
	}

	@keyframes pulse-bg {
		0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.06; }
		50% { transform: translate(-50%, -50%) scale(1.06); opacity: 0.09; }
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse-bg-circle { animation: none !important; }
	}
</style>
