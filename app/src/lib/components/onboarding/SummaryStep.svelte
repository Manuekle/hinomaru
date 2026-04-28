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
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.summary.title', $locale)}</h1>
	</header>

	<div class="summary-list">
		{#each items as item, i (item.id)}
			<div class="summary-row" use:fadeUp={{ delay: 0.1 + i * 0.1, y: 12 }}>
				<div class="icon-box" style="background: {item.color}14; color: {item.color};">
					<Icon icon={item.icon} size={18} color="currentColor" strokeWidth={2} />
				</div>
				<div class="text-group">
					<span class="label">{item.label}</span>
					<span class="value">{item.value}</span>
				</div>
				<div class="verified-badge">
					<span class="check">✓</span>
				</div>
			</div>
		{/each}
	</div>

	<StickyFooter {onBack}>
		<button
			class="hm-btn hm-btn-dark hm-btn-lg"
			style="flex: 1"
			onclick={onComplete}
			disabled={loading}
		>
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
		padding: 40px 24px 100px;
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
		gap: 12px;
		width: 100%;
		max-width: 440px;
		margin: 0 auto;
	}

	.summary-row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		background: var(--bg-surface);
		border-radius: 20px;
		border: 1.5px solid transparent;
	}

	.icon-box {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.text-group {
		display: flex;
		flex-direction: column;
		gap: 1px;
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
		font-size: 16px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.verified-badge {
		width: 22px;
		height: 22px;
		background: var(--success);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.check {
		color: #fff;
		font-size: 12px;
		font-weight: 900;
	}
</style>
