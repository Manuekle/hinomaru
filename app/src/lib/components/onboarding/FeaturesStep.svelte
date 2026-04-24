<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';

	let { onNext } = $props();

	const features = $derived([
		{
			title: t('onboarding.features.write.title', $locale),
			desc: t('onboarding.features.write.desc', $locale),
			icon: '✍️',
			color: '#1a1a1a'
		},
		{
			title: t('onboarding.features.srs.title', $locale),
			desc: t('onboarding.features.srs.desc', $locale),
			icon: '🎴',
			color: '#1a1a1a'
		},
		{
			title: t('onboarding.features.decks.title', $locale),
			desc: t('onboarding.features.decks.desc', $locale),
			icon: '📚',
			color: '#1a1a1a'
		},
		{
			title: t('onboarding.features.grammar.title', $locale),
			desc: t('onboarding.features.grammar.desc', $locale),
			icon: '📖',
			color: '#1a1a1a'
		},
		{
			title: t('onboarding.features.stories.title', $locale),
			desc: t('onboarding.features.stories.desc', $locale),
			icon: '📰',
			color: '#1a1a1a'
		}
	]);
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.features.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.features.how', $locale)}</p>
	</header>

	<div class="features-list">
		{#each features as feature, i}
			<div class="feature-item" use:fadeUp={{ delay: 0.1 + i * 0.05, y: 12 }}>
				<div class="icon-box" style="background: {feature.color}">
					<span class="icon">{feature.icon}</span>
				</div>
				<div class="text-content">
					<h3 class="feature-title">{feature.title}</h3>
					<p class="feature-desc">{feature.desc}</p>
				</div>
			</div>
		{/each}
	</div>

	<footer class="footer" use:fadeUp={{ delay: 0.4, y: 10 }}>
		<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={onNext}>
			{t('onboarding.continue', $locale)}
		</button>
	</footer>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 40px 24px;
	}

	.header {
		text-align: center;
		margin-bottom: 40px;
	}

	.title {
		font-size: 32px;
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 1.1;
		margin: 0 0 16px;
	}

	.subtitle {
		font-size: 20px;
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
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon {
		font-size: 24px;
	}

	.text-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.feature-title {
		font-size: 17px;
		font-weight: 700;
		margin: 0;
	}

	.feature-desc {
		font-size: 14px;
		color: var(--fg-secondary);
		margin: 0;
		line-height: 1.4;
	}

	.footer {
		margin-top: auto;
	}
</style>
