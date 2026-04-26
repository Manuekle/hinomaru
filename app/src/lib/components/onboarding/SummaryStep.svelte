<script lang="ts">
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
		BrainIcon
	} from '@hugeicons/core-free-icons';
	import ButtonLoader from '$lib/components/ButtonLoader.svelte';

	let { selections, onComplete, onBack, loading = false } = $props();

	const items = $derived([
		{
			id: 'motivation',
			label: t('onboarding.summary.motivation', $locale),
			value: selections.motivation
				? t(`onboarding.motivation.${selections.motivation}`, $locale)
				: '...',
			icon: FavouriteIcon
		},
		{
			id: 'level',
			label: t('onboarding.summary.level', $locale),
			value: selections.experience
				? t(`onboarding.experience.${selections.experience}`, $locale)
				: '...',
			icon: GraduationScrollIcon
		},
		{
			id: 'voice',
			label: t('onboarding.summary.voice', $locale),
			value:
				selections.voice === 'kaito'
					? t('onboarding.voice.kaito.name', $locale)
					: t('onboarding.voice.standard.name', $locale),
			icon: VolumeHighIcon
		},
		{
			id: 'goal',
			label: t('onboarding.summary.goal', $locale),
			value: t('onboarding.goal.wordsDay', $locale, { n: selections.goal || 5 }),
			icon: FireIcon
		},
		{
			id: 'srs',
			label: t('onboarding.summary.srs', $locale) || 'Spaced repetition',
			value: selections.srsEnabled
				? t('onboarding.summary.enabled', $locale)
				: t('onboarding.summary.disabled', $locale) || 'Disabled',
			icon: BrainIcon
		}
	]);
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.summary.title', $locale)}</h1>
	</header>

	<div class="summary-list">
		{#each items as item, i (item.id)}
			<div class="summary-item" use:fadeUp={{ delay: 0.1 + i * 0.1, y: 12 }}>
				<div class="icon-box">
					<Icon icon={item.icon} size={22} color="var(--washi)" strokeWidth={1.5} />
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

	<StickyFooter {onBack}>
		<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex: 1" onclick={onComplete} disabled={loading}>
			{#if loading}
				<ButtonLoader size={20} />
			{:else}
				{t('onboarding.summary.start', $locale)}
			{/if}
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
		margin-bottom: clamp(24px, 8vw, 60px);
	}

	.title {
		font-size: var(--step-title, clamp(24px, 7vw, 32px));
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
		color: var(--washi);
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
