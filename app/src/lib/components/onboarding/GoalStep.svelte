<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import StickyFooter from '$lib/components/StickyFooter.svelte';

	let { onSelect } = $props();

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
						<span class="popular-badge">{t('onboarding.goal.popular', $locale)}</span>
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
		<span class="sparkle">✨</span>
		<p class="tip-text">{t('onboarding.goal.tip', $locale)}</p>
	</div>

	<StickyFooter>
		<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={handleNext}>
			{t('onboarding.next', $locale)}
		</button>
	</StickyFooter>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 40px 24px 140px;
	}

	.header {
		text-align: center;
		margin-bottom: 80px;
	}

	.title {
		font-size: 32px;
		font-weight: 600;
		letter-spacing: -0.04em;
		margin: 0 0 40px;
	}

	.subtitle {
		font-size: 17px;
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
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
		position: relative;
	}

	.goal-card:hover {
		border-color: var(--ink-300);
		transform: translateY(-2px);
	}

	.goal-card.selected {
		border-color: var(--sumi);
		background: var(--ink-100);
		box-shadow: var(--shadow-md);
	}

	.popular-badge {
		position: absolute;
		top: -10px;
		background: var(--sumi);
		color: var(--bg-surface);
		font-size: 10px;
		font-weight: 600;
		padding: 2px 10px;
		border-radius: 99px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.value {
		font-size: 44px;
		font-weight: 600;
		line-height: 1;
		color: var(--sumi);
	}

	.label {
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 600;
	}

	.goal-info {
		font-size: 14px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}

	.tip-section {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 40px;
		padding: 12px;
		background: var(--ink-50);
		border-radius: 12px;
	}

	.tip-text {
		font-size: 13px;
		color: var(--fg-secondary);
		margin: 0;
		font-weight: 500;
	}

	.footer {
		margin-top: auto;
	}
</style>
