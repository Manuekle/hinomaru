<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import { fadeUp, popIn, staggerChildren, animateNumber } from '$lib/motion';
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

	const message = $derived(
		title ||
			(pct === 100
				? t('summary.all', $locale)
				: pct >= 70
					? t('summary.solid', $locale)
					: t('summary.retry', $locale))
	);

	let displayScore = $state(0);
	let displayTotal = $state(0);
	let displayXP = $state(0);

	onMount(() => {
		animateNumber((v) => (displayScore = v), correct, { duration: 0.9, delay: 0.4 });
		animateNumber((v) => (displayTotal = v), total, { duration: 0.7, delay: 0.3 });
		animateNumber((v) => (displayXP = v), xpEarned, { duration: 1.2, delay: 0.6 });
		playFinish();
	});
</script>

<div class="study-summary-host">
	<div class="pulse-bg-circle"></div>

	<div class="summary-inner">
		<div use:fadeUp={{ delay: 0.1, y: 8 }} class="summary-label" style="margin-bottom:16px; font-weight: 700;">
			{t('summary.complete', $locale)}
		</div>

		<div use:popIn={{ delay: 0.2 }} class="summary-score">
			{displayScore} / {displayTotal}
		</div>

		<div use:fadeUp={{ delay: 0.45, y: 8 }} class="summary-msg" style="margin-top:12px;">
			{message}
		</div>

		<div use:staggerChildren={{ delay: 0.55, stagger: 0.1, y: 10 }} class="summary-stats-list">
			<div class="summary-stat-item centered">
				<span class="summary-stat-key">{t('summary.xp', $locale)}</span>
				<span class="summary-stat-val xp">+{displayXP} XP</span>
			</div>
			<div class="summary-stat-item centered">
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
	.study-summary-host {
		min-height: 100dvh;
		background: var(--paper);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: calc(24px + env(safe-area-inset-top)) 24px 140px;
		position: relative;
		overflow: hidden;
		width: 100%;
	}

	.pulse-bg-circle {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 320px;
		height: 320px;
		background: var(--hinomaru-red);
		border-radius: 50%;
		opacity: 0.06;
		pointer-events: none;
		z-index: 0;
		animation: pulse-bg 4s ease-in-out infinite;
	}

	.summary-inner {
		position: relative;
		max-width: 420px;
		width: 100%;
		text-align: center;
		z-index: 1;
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
