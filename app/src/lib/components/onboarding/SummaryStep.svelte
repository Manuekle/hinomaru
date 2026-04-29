<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import {
		FavouriteIcon,
		GraduationScrollIcon,
		VolumeHighIcon,
		FireIcon,
		BrainIcon,
		Tick01Icon
	} from '@hugeicons/core-free-icons';
	import ButtonLoader from '$lib/components/ButtonLoader.svelte';
	import Orb from '$lib/components/ui/Orb.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let { selections, onComplete, onBack, loading = false } = $props();

	// Step tracking for sequential reveal
	let visibleSteps = $state(0);
	let isFinished = $state(false);
	const progress = tweened(0, { duration: 800, easing: cubicOut });

	const items = $derived([
		{
			id: 'motivation',
			label: t('onboarding.summary.motivation', $locale),
			value: selections.motivation
				? t(`onboarding.motivation.${selections.motivation}`, $locale)
				: '...',
			icon: FavouriteIcon,
			color: '#34c759'
		},
		{
			id: 'level',
			label: t('onboarding.summary.level', $locale),
			value: selections.experience
				? t(`onboarding.experience.${selections.experience}`, $locale)
				: '...',
			icon: GraduationScrollIcon,
			color: '#007aff'
		},
		{
			id: 'voice',
			label: t('onboarding.summary.voice', $locale),
			value:
				selections.voice === 'cool'
					? t('onboarding.voice.cool.name', $locale)
					: t('onboarding.voice.kawaii.name', $locale),
			icon: VolumeHighIcon,
			color: '#af52de'
		},
		{
			id: 'goal',
			label: t('onboarding.summary.goal', $locale),
			value: t('onboarding.goal.wordsDay', $locale, { n: selections.goal || 5 }),
			icon: FireIcon,
			color: '#ff3b30'
		},
		{
			id: 'srs',
			label: t('onboarding.summary.srs', $locale) || 'Spaced repetition',
			value: selections.srsEnabled
				? t('onboarding.summary.enabled', $locale)
				: t('onboarding.summary.disabled', $locale) || 'Disabled',
			icon: BrainIcon,
			color: '#5856d6'
		}
	]);

	function playCorrectSound() {
		const audio = new Audio('/sounds/correct.mp3');
		audio.volume = 0.3;
		audio.play().catch(() => {});
	}

	onMount(() => {
		processSequentially();
	});

	async function processSequentially() {
		for (let i = 1; i <= items.length; i++) {
			await new Promise(r => setTimeout(r, 700 + Math.random() * 300));
			visibleSteps = i;
			playCorrectSound();
			progress.set((i / items.length) * 100);
		}
		await new Promise(r => setTimeout(r, 500));
		isFinished = true;
	}
</script>

<div class="step-content">
	<div class="orb-header" use:fadeUp={{ delay: 0, y: -20 }}>
		<div class="orb-container">
			<Orb 
				agentState={!isFinished ? 'thinking' : null} 
				colors={['#BC002D', '#FF6B6B']} 
				className="h-full w-full"
			/>
		</div>
		<h1 class="title">{t('onboarding.summary.title', $locale)}</h1>
		<div class="progress-track">
			<div class="progress-fill" style="width: {$progress}%"></div>
		</div>
	</div>

	<div class="summary-list">
		{#each items as item, i (item.id)}
			{@const isVisible = visibleSteps > i}
			{@const isProcessing = visibleSteps === i}
			
			<div 
				class="summary-row" 
				class:visible={isVisible}
				class:processing={isProcessing}
			>
				<div class="icon-box" style="background: {item.color}14; color: {item.color};">
					<Icon icon={item.icon} size={18} color="currentColor" strokeWidth={2} />
				</div>
				<div class="text-group">
					<span class="label">{item.label}</span>
					<span class="value">{isVisible ? item.value : '...'}</span>
				</div>
				
				<div class="status-indicator">
					{#if isVisible}
						<div class="check-badge">
							<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						</div>
					{:else if isProcessing}
						<div class="spinner"></div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<StickyFooter {onBack}>
		<button
			class="hm-btn hm-btn-lg finish-btn"
			class:ready={isFinished}
			style="flex: 1"
			onclick={onComplete}
			disabled={!isFinished || loading}
		>
			{#if loading}
				<ButtonLoader size={20} />
			{:else}
				{t('onboarding.summary.start', $locale)}
			{/if}
			{#if isFinished && !loading}
				<div class="shimmer"></div>
			{/if}
		</button>
	</StickyFooter>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 20px 24px 100px;
	}

	.orb-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 32px;
		text-align: center;
	}

	.orb-container {
		width: 100px;
		height: 100px;
		margin-bottom: 16px;
	}

	.title {
		font-size: 22px;
		font-weight: 700;
		letter-spacing: -0.03em;
		margin: 0 0 16px;
		color: var(--fg-primary);
	}

	.progress-track {
		width: 140px;
		height: 4px;
		background: var(--ink-100);
		border-radius: 99px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--hinomaru-red);
		border-radius: 99px;
		transition: width 0.3s ease;
	}

	.summary-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
	}

	.summary-row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 18px;
		background: var(--bg-surface);
		border-radius: 18px;
		border: 1px solid var(--ink-100);
		opacity: 0.4;
		transform: translateY(10px);
		transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.summary-row.visible {
		opacity: 1;
		transform: translateY(0);
		background: var(--bg-surface);
		border-color: var(--ink-200);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	}

	.summary-row.processing {
		opacity: 1;
		transform: translateY(0);
		border-color: var(--hinomaru-red);
		background: var(--ink-50);
		box-shadow: 0 0 15px rgba(188, 0, 45, 0.05);
	}

	.icon-box {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.text-group {
		display: flex;
		flex-direction: column;
		gap: 0px;
		flex: 1;
	}

	.label {
		font-size: 11px;
		color: var(--fg-tertiary);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.value {
		font-size: 15px;
		font-weight: 600;
		color: var(--fg-primary);
	}

	.status-indicator {
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.check-badge {
		width: 22px;
		height: 22px;
		background: #34c759;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2);
	}

	.check-badge svg {
		width: 12px;
		height: 12px;
	}

	@keyframes checkPop {
		0% { transform: scale(0); }
		70% { transform: scale(1.1); }
		100% { transform: scale(1); }
	}

	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid var(--ink-200);
		border-top-color: var(--hinomaru-red);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.finish-btn {
		background: var(--ink-100);
		color: var(--fg-tertiary);
		border: none;
		overflow: hidden;
		position: relative;
		transition: all 0.4s ease;
	}

	.finish-btn.ready {
		background: var(--sumi);
		color: #fff;
		transform: scale(1.02);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
	}

	:global([data-theme='dark']) .finish-btn.ready {
		background: var(--fg-primary);
		color: var(--bg-page);
	}

	.shimmer {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.2),
			transparent
		);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		to { left: 100%; }
	}
</style>
