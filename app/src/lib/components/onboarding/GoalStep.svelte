<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { SparklesIcon } from '@hugeicons/core-free-icons';

	let { onSelect, onBack } = $props();

	const options = $derived([
		{ value: 3, label: t('onboarding.goal.wordsDay', $locale, { n: 3 }) },
		{ value: 5, label: t('onboarding.goal.wordsDay', $locale, { n: 5 }), popular: true },
		{ value: 10, label: t('onboarding.goal.wordsDay', $locale, { n: 10 }) },
		{ value: 15, label: t('onboarding.goal.wordsDay', $locale, { n: 15 }) }
	]);

	let selected = $state<number>(5);

	function handleSelect(val: number) {
		selected = val;
	}

	function handleNext() {
		onSelect(selected);
	}
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.goal.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.goal.subtitle', $locale)}</p>
	</header>

	<div class="main-body">
		<div class="goals-grid">
			{#each options as option, i (option.value)}
				<button
					class="goal-card"
					class:selected={selected === option.value}
					use:fadeUp={{ delay: 0.1 + i * 0.1, y: 15 }}
					onclick={() => handleSelect(option.value)}
				>
					{#if option.popular}
						<div class="popular-tag">{t('onboarding.goal.popular', $locale)}</div>
					{/if}
					<span class="value">{option.value}</span>
					<span class="label">{t('onboarding.goal.words', $locale)}</span>
				</button>
			{/each}
		</div>
		<p class="goal-info" use:fadeUp={{ delay: 0.4 }}>
			{t('onboarding.goal.wordsDay', $locale, { n: selected })}
			{selected === 5
				? t('onboarding.goal.choicePopular', $locale)
				: t('onboarding.goal.choiceGreat', $locale)}
		</p>
	</div>

	<div class="tip-section" use:fadeUp={{ delay: 0.5 }}>
		<Icon icon={SparklesIcon} size={16} color="var(--fg-secondary)" />
		<p class="tip-text">{t('onboarding.goal.tip', $locale)}</p>
	</div>

	<StickyFooter {onBack}>
		<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex: 1" onclick={handleNext}>
			{t('onboarding.next', $locale)}
		</button>
	</StickyFooter>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 40px 24px 100px;
	}

	.header {
		text-align: center;
		margin-bottom: clamp(24px, 8vw, 80px);
	}

	.title {
		font-size: var(--step-title, clamp(24px, 7vw, 32px));
		font-weight: 600;
		letter-spacing: -0.04em;
		margin: 0 0 clamp(16px, 5vw, 40px);
	}

	.subtitle {
		font-size: var(--step-body, clamp(13px, 3.5vw, 17px));
		color: var(--fg-tertiary);
		line-height: 1.5;
		max-width: 300px;
		margin: 0 auto;
	}

	.main-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.goals-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
		width: 100%;
		max-width: 320px;
		margin-bottom: 24px;
	}

	.goal-card {
		aspect-ratio: 1;
		background: var(--bg-surface);
		border: 1.5px solid transparent;
		border-radius: 28px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		outline: none;
	}

	.goal-card.selected {
		background: var(--ink-100);
	}

	.popular-tag {
		position: absolute;
		top: -12px;
		background: var(--hinomaru-red);
		color: #fff;
		font-size: 11px;
		font-weight: 800;
		padding: 4px 12px;
		border-radius: 99px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.2);
	}

	.value {
		font-size: 48px;
		font-weight: 900;
		line-height: 1;
		color: var(--fg-primary);
		transition: color 0.2s ease;
	}

	.selected .value {
		color: var(--hinomaru-red);
	}

	.label {
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.goal-info {
		font-size: 14px;
		color: var(--fg-tertiary);
		font-weight: 600;
		text-align: center;
		margin-bottom: 40px;
	}

	.tip-section {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 40px;
		padding: 12px 16px;
		background: var(--ink-100);
		border-radius: 12px;
		color: var(--fg-secondary);
		max-width: 320px;
	}

	.tip-text {
		font-size: 13px;
		color: var(--fg-secondary);
		margin: 0;
		font-weight: 600;
	}

	.footer {
		margin-top: auto;
	}
</style>
