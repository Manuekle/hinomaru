<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { fadeUp } from '$lib/motion';
	import { fly, fade } from 'svelte/transition';
	import Icon from '$lib/Icon.svelte';
	import { Award01Icon, ZapIcon, Timer02Icon, Target02Icon } from '@hugeicons/core-free-icons';

	const props: {
		correct: number;
		mistakes: number;
		totalSteps: number;
		xpAwarded: number;
		elapsedSec: number;
	} = $props();

	const accuracy = $derived(
		props.correct + props.mistakes > 0
			? Math.round((props.correct / (props.correct + props.mistakes)) * 100)
			: 100
	);

	function backToMap() {
		goto('/');
	}
</script>

<div class="complete-layout">
	<div class="hero-section" use:fadeUp={{ y: 20 }}>
		<div class="trophy-wrapper">
			<Icon icon={Award01Icon} size={64} color="var(--hinomaru-red)" />
		</div>
		<h1 class="title">
			{$locale === 'es' ? '¡Excelente trabajo!' : 'Amazing work!'}
		</h1>
		<p class="subtitle">
			{$locale === 'es'
				? 'Lección completada con éxito.'
				: 'You’ve successfully completed the lesson.'}
		</p>
	</div>

	<div class="stats-grid">
		<div class="stat-card" use:fadeUp={{ y: 20, delay: 0.2 }}>
			<div class="stat-icon-bg accuracy">
				<Icon icon={Target02Icon} size={20} color="var(--success)" />
			</div>
			<div class="stat-content">
				<span class="stat-value">{accuracy}%</span>
				<span class="stat-label">{$locale === 'es' ? 'Precisión' : 'Accuracy'}</span>
			</div>
		</div>

		<div class="stat-card" use:fadeUp={{ y: 20, delay: 0.3 }}>
			<div class="stat-icon-bg xp">
				<Icon icon={ZapIcon} size={20} color="#FFA500" />
			</div>
			<div class="stat-content">
				<span class="stat-value">+{props.xpAwarded}</span>
				<span class="stat-label">XP</span>
			</div>
		</div>

		<div class="stat-card" use:fadeUp={{ y: 20, delay: 0.4 }}>
			<div class="stat-icon-bg time">
				<Icon icon={Timer02Icon} size={20} color="#4A90E2" />
			</div>
			<div class="stat-content">
				<span class="stat-value">
					{Math.floor(props.elapsedSec / 60)}m {props.elapsedSec % 60}s
				</span>
				<span class="stat-label">{$locale === 'es' ? 'Tiempo' : 'Time'}</span>
			</div>
		</div>
	</div>

	<div class="footer-actions" in:fade={{ delay: 600 }}>
		<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={backToMap}>
			{$locale === 'es' ? 'Continuar' : 'Continue'}
		</button>
	</div>
</div>

<style>
	.complete-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 24px;
		gap: 40px;
		max-width: 480px;
		margin: 0 auto;
		height: 100%;
	}

	.hero-section {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.trophy-wrapper {
		width: 120px;
		height: 120px;
		background: var(--hinomaru-red-wash);
		border-radius: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
		box-shadow: 0 8px 32px rgba(188, 0, 45, 0.12);
	}

	.title {
		font-size: 32px;
		font-weight: 700;
		color: var(--fg-primary);
		margin: 0;
		letter-spacing: -0.02em;
	}

	.subtitle {
		font-size: 16px;
		color: var(--fg-secondary);
		margin: 0;
		font-weight: 600;
	}

	.stats-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
	}

	.stat-card {
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 20px;
		padding: 18px 20px;
		display: flex;
		align-items: center;
		gap: 16px;
		box-shadow: 0 2px 8px rgba(26, 26, 26, 0.04);
	}

	.stat-icon-bg {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.stat-icon-bg.accuracy {
		background: var(--success-wash);
	}
	.stat-icon-bg.xp {
		background: rgba(255, 165, 0, 0.08);
	}
	.stat-icon-bg.time {
		background: rgba(74, 144, 226, 0.08);
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.stat-value {
		font-size: 20px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.1;
	}

	.stat-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.04em;
		color: var(--fg-tertiary);
	}

	.footer-actions {
		width: 100%;
		margin-top: auto;
		padding-bottom: env(safe-area-inset-bottom);
	}

	@media (min-width: 640px) {
		.stats-grid {
			flex-direction: row;
			justify-content: stretch;
		}
		.stat-card {
			flex: 1;
			flex-direction: column;
			text-align: center;
			padding: 20px 12px;
		}
	}
</style>
