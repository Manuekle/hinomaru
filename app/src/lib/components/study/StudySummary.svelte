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

<div class="summary-container" use:fadeUp>
	<div class="summary-card">
		<div class="summary-circle" use:popIn>
			<div class="score-text">
				<span class="score-num">{displayScore}</span>
				<span class="score-total">/ {total}</span>
			</div>
		</div>

		<h2 class="summary-title" use:fadeUp={{ delay: 0.3 }}>
			{title || (pct === 100 ? t('summary.all', $locale) : t('summary.solid', $locale))}
		</h2>

		<div class="stats-grid">
			<div class="stat-item" use:fadeUp={{ delay: 0.45 }}>
				<div class="stat-label">{$locale === 'es' ? 'Precisión' : 'Accuracy'}</div>
				<div class="stat-value" style="color: {pct >= 70 ? 'var(--success)' : 'var(--hinomaru-red)'}">{pct}%</div>
			</div>
			<div class="stat-item" use:fadeUp={{ delay: 0.55 }}>
				<div class="stat-label">{$locale === 'es' ? 'Experiencia' : 'Experience'}</div>
				<div class="stat-value xp">+{displayXP} XP</div>
			</div>
		</div>

		<StickyFooter>
			<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={onContinue}>
				{t('summary.back', $locale)}
			</button>
		</StickyFooter>
	</div>

	{#if pct >= 70}
		<Confetti fireOnMount={true} />
	{/if}
</div>

<style>
	.summary-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 20px 120px;
		width: 100%;
	}

	.summary-card {
		width: 100%;
		max-width: 400px;
		text-align: center;
	}

	.summary-circle {
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 8px solid var(--hinomaru-red);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 32px;
		box-shadow: 0 12px 32px rgba(188, 0, 45, 0.15);
	}

	.score-text {
		display: flex;
		align-items: baseline;
		gap: 4px;
	}

	.score-num {
		font-size: 56px;
		font-weight: 900;
		color: var(--fg-primary);
	}

	.score-total {
		font-size: 24px;
		font-weight: 700;
		color: var(--fg-tertiary);
	}

	.summary-title {
		font-size: 28px;
		font-weight: 900;
		color: var(--fg-primary);
		margin-bottom: 32px;
		line-height: 1.2;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-bottom: 40px;
	}

	.stat-item {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.stat-label {
		font-size: 11px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
	}

	.stat-value {
		font-size: 20px;
		font-weight: 800;
		color: var(--fg-primary);
	}

	.stat-value.xp {
		color: #d4a017;
	}
</style>
