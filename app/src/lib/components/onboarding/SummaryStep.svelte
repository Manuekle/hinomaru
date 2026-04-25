<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import StickyFooter from '$lib/components/StickyFooter.svelte';

	let { selections, onComplete } = $props();

	const items = $derived([
		{
			label: t('onboarding.summary.motivation', $locale),
			value: selections.motivation
				? t(`onboarding.motivation.${selections.motivation}`, $locale)
				: '...',
			icon: '❤️'
		},
		{
			label: t('onboarding.summary.level', $locale),
			value: selections.experience
				? t(`onboarding.experience.${selections.experience}`, $locale)
				: '...',
			icon: '🎓'
		},
		{
			label: t('onboarding.summary.voice', $locale),
			value:
				selections.voice === 'kaito'
					? t('onboarding.voice.kaito.name', $locale)
					: t('onboarding.voice.standard.name', $locale),
			icon: '🔊'
		},
		{
			label: t('onboarding.summary.goal', $locale),
			value: t('onboarding.goal.wordsDay', $locale, { n: selections.goal || 5 }),
			icon: '🔥'
		},
		{
			label: t('onboarding.summary.notifications', $locale),
			value: t('onboarding.summary.enabled', $locale),
			icon: '🔔'
		}
	]);
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.summary.title', $locale)}</h1>
	</header>

	<div class="summary-list">
		{#each items as item, i (item.labelKey)}
			<div class="summary-item" use:fadeUp={{ delay: 0.1 + i * 0.1, y: 12 }}>
				<div class="icon-box">
					<span class="icon">{item.icon}</span>
				</div>
				<div class="text">
					<div class="label">{item.label}</div>
					<div class="value">{item.value}</div>
				</div>
				<div class="checkmark">
					<span class="check-icon">✓</span>
				</div>
			</div>
		{/each}
	</div>

	<StickyFooter>
		<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={onComplete}>
			{t('onboarding.summary.start', $locale)}
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
		margin-bottom: 60px;
	}

	.title {
		font-size: 32px;
		font-weight: 600;
		letter-spacing: -0.04em;
		margin: 0;
	}

	.summary-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.summary-item {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.icon-box {
		width: 48px;
		height: 48px;
		background: var(--ink-700);
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon {
		font-size: 24px;
	}

	.text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.label {
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 600;
	}

	.value {
		font-size: 17px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.checkmark {
		width: 24px;
		height: 24px;
		background: var(--success-wash);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.check-icon {
		color: var(--success);
		font-weight: 800;
		font-size: 14px;
	}
</style>
