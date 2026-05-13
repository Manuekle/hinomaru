<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import {
		PencilEdit01Icon,
		Cards02Icon,
		BookOpen01Icon,
		BookOpenIcon,
		News01Icon
	} from '@hugeicons/core-free-icons';

	let { onNext, onBack } = $props();

	const features = $derived([
		{
			title: t('onboarding.features.write.title', $locale),
			desc: t('onboarding.features.write.desc', $locale),
			icon: PencilEdit01Icon,
			color: '#ff3b30'
		},
		{
			title: t('onboarding.features.srs.title', $locale),
			desc: t('onboarding.features.srs.desc', $locale),
			icon: Cards02Icon,
			color: '#007aff'
		},
		{
			title: t('onboarding.features.decks.title', $locale),
			desc: t('onboarding.features.decks.desc', $locale),
			icon: BookOpen01Icon,
			color: '#34c759'
		},
		{
			title: t('onboarding.features.grammar.title', $locale),
			desc: t('onboarding.features.grammar.desc', $locale),
			icon: BookOpenIcon,
			color: '#af52de'
		},
		{
			title: t('onboarding.features.stories.title', $locale),
			desc: t('onboarding.features.stories.desc', $locale),
			icon: News01Icon,
			color: '#ff9500'
		}
	]);
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.features.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.features.how', $locale)}</p>
	</header>

	<div class="features-list">
		{#each features as feature, i (feature.title)}
			<div class="feature-item" use:fadeUp={{ delay: 0.1 + i * 0.08, y: 12 }}>
				<div class="icon-box" style="background: {feature.color}14; color: {feature.color};">
					<Icon icon={feature.icon} size={22} color="currentColor" strokeWidth={1.8} />
				</div>
				<div class="text-content">
					<h3 class="feature-title">{feature.title}</h3>
					<p class="feature-desc">{feature.desc}</p>
				</div>
			</div>
		{/each}
	</div>

	<StickyFooter {onBack}>
		<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex: 1" onclick={onNext}>
			{t('onboarding.continue', $locale)}
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
		margin-bottom: 48px;
	}

	.title {
		font-size: var(--step-title, clamp(24px, 7vw, 32px));
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1.1;
		margin: 0 0 16px;
		color: var(--fg-primary);
	}

	.subtitle {
		font-size: var(--step-subtitle, clamp(15px, 4vw, 20px));
		color: var(--fg-tertiary);
		font-weight: 600;
		margin: 0;
	}

	.features-list {
		display: flex;
		flex-direction: column;
		gap: 28px;
		margin-bottom: 40px;
	}

	.feature-item {
		display: flex;
		gap: 20px;
		align-items: center;
	}

	.icon-box {
		width: 52px;
		height: 52px;
		min-width: 52px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	}

	.text-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.feature-title {
		font-size: 17px;
		font-weight: 700;
		margin: 0;
		color: var(--fg-primary);
		letter-spacing: -0.04em;
	}

	.feature-desc {
		font-size: 14px;
		color: var(--fg-secondary);
		margin: 0;
		line-height: 1.4;
		font-weight: 500;
	}
</style>
