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
	<div class="hero-section" in:fly={{ y: 20, duration: 600 }}>
		<div class="trophy-wrapper">
			<Icon icon={Award01Icon} size={80} color="var(--hinomaru-red)" />
			<div class="confetti-dots"></div>
		</div>
		<h1 class="title">
			{$locale === 'es' ? '¡Increíble trabajo!' : 'Amazing work!'}
		</h1>
		<p class="subtitle">
			{$locale === 'es' ? 'Has completado la lección con éxito.' : 'You’ve successfully completed the lesson.'}
		</p>
	</div>

	<div class="stats-grid">
		<div class="stat-card" in:fly={{ y: 20, delay: 200 }}>
			<div class="stat-icon-bg accuracy">
				<Icon icon={Target02Icon} size={20} color="var(--success)" />
			</div>
			<div class="stat-content">
				<span class="stat-value">{accuracy}%</span>
				<span class="stat-label">{$locale === 'es' ? 'Precisión' : 'Accuracy'}</span>
			</div>
		</div>

		<div class="stat-card" in:fly={{ y: 20, delay: 300 }}>
			<div class="stat-icon-bg xp">
				<Icon icon={ZapIcon} size={20} color="#FFA500" />
			</div>
			<div class="stat-content">
				<span class="stat-value">+{props.xpAwarded}</span>
				<span class="stat-label">XP</span>
			</div>
		</div>

		<div class="stat-card" in:fly={{ y: 20, delay: 400 }}>
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
		<button class="continue-btn" onclick={backToMap}>
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
		gap: 48px;
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
		position: relative;
		width: 140px;
		height: 140px;
		background: color-mix(in srgb, var(--hinomaru-red) 5%, transparent);
		border-radius: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
	}

	.title {
		font-size: 32px;
		font-weight: 900;
		color: var(--sumi);
		margin: 0;
		letter-spacing: -0.03em;
	}

	.subtitle {
		font-size: 17px;
		color: var(--fg-secondary);
		margin: 0;
		font-weight: 600;
		opacity: 0.8;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		width: 100%;
	}

	.stat-card {
		background: var(--bg-surface);
		border: 2px solid var(--ink-50);
		border-radius: 24px;
		padding: 20px 24px;
		display: flex;
		align-items: center;
		gap: 20px;
		transition: transform 0.2s;
	}

	.stat-icon-bg {
		width: 48px;
		height: 48px;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.stat-icon-bg.accuracy { background: color-mix(in srgb, var(--success) 10%, transparent); }
	.stat-icon-bg.xp { background: rgba(255, 165, 0, 0.1); }
	.stat-icon-bg.time { background: rgba(74, 144, 226, 0.1); }

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-value {
		font-size: 22px;
		font-weight: 900;
		color: var(--sumi);
		line-height: 1;
	}

	.stat-label {
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--fg-tertiary);
	}

	.footer-actions {
		width: 100%;
		margin-top: auto;
	}

	.continue-btn {
		width: 100%;
		padding: 20px;
		background: var(--hinomaru-red);
		color: white;
		font-size: 18px;
		font-weight: 900;
		border: none;
		border-radius: 24px;
		cursor: pointer;
		box-shadow: 0 8px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
		transition: all 0.1s;
	}
	.continue-btn:active {
		transform: translateY(4px);
		box-shadow: 0 4px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
	}

	@media (min-width: 640px) {
		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
		}
		.stat-card {
			flex-direction: column;
			text-align: center;
			padding: 24px 16px;
		}
	}
</style>
