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
			icon: PencilEdit01Icon
		},
		{
			title: t('onboarding.features.srs.title', $locale),
			desc: t('onboarding.features.srs.desc', $locale),
			icon: Cards02Icon
		},
		{
			title: t('onboarding.features.decks.title', $locale),
			desc: t('onboarding.features.decks.desc', $locale),
			icon: BookOpen01Icon
		},
		{
			title: t('onboarding.features.grammar.title', $locale),
			desc: t('onboarding.features.grammar.desc', $locale),
			icon: BookOpenIcon
		},
		{
			title: t('onboarding.features.stories.title', $locale),
			desc: t('onboarding.features.stories.desc', $locale),
			icon: News01Icon
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
				<div class="icon-box">
					<Icon icon={feature.icon} size={22} color="var(--washi)" strokeWidth={1.5} />
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
		margin-bottom: 40px;
	}

	.title {
		font-size: var(--step-title, clamp(24px, 7vw, 32px));
		font-weight: 600;
		letter-spacing: -0.04em;
		line-height: 1.1;
		margin: 0 0 16px;
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
		gap: 24px;
		margin-bottom: 40px;
	}

	.feature-item {
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.icon-box {
		width: 48px;
		height: 48px;
		min-width: 48px;
		background: var(--ink-700);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--washi);
	}

	.text-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.feature-title {
		font-size: var(--step-body, clamp(13px, 3.5vw, 17px));
		font-weight: 700;
		margin: 0;
	}

	.feature-desc {
		font-size: clamp(12px, 3vw, 14px);
		color: var(--fg-secondary);
		margin: 0;
		line-height: 1.4;
	}
</style>
