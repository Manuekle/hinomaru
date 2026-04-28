<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import {
		BookOpen01Icon,
		CheckmarkCircle02Icon,
		ZapIcon,
		Headphones02Icon,
		SparklesIcon
	} from '@hugeicons/core-free-icons';

	import StickyFooter from '$lib/components/StickyFooter.svelte';

	let { onNext, onBack } = $props();

	const story = {
		title: '学校の帰り道',
		jp: '学校の帰りに、友達と公園でアイスクリームを食べました。とても楽しかったです。',
		en: 'On the way home from school, I ate ice cream in the park with my friend. It was very fun.',
		es: 'De camino a casa desde la escuela, comí helado en el parque con mi amigo. Fue muy divertido.',
		chips: [
			{ jp: '学校', trans: 'School' },
			{ jp: '帰り道', trans: 'Way home' },
			{ jp: '友達', trans: 'Friend' }
		]
	};

	const points = $derived([
		{
			title: t('onboarding.stories.point1.title', $locale),
			desc: t('onboarding.stories.point1.desc', $locale),
			icon: ZapIcon,
			color: '#ff9500'
		},
		{
			title: t('onboarding.stories.point2.title', $locale),
			desc: t('onboarding.stories.point2.desc', $locale),
			icon: Headphones02Icon,
			color: '#007aff'
		},
		{
			title: t('onboarding.stories.point3.title', $locale),
			desc: t('onboarding.stories.point3.desc', $locale),
			icon: SparklesIcon,
			color: '#af52de'
		}
	]);
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.stories.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.stories.subtitle', $locale)}</p>
	</header>

	<div class="story-preview" use:fadeUp={{ delay: 0.1, y: 12 }}>
		<div class="story-card">
			<div class="story-header">
				<div class="title-group">
					<div class="book-box">
						<Icon icon={BookOpen01Icon} size={18} color="currentColor" />
					</div>
					<span class="story-title">{story.title}</span>
				</div>
				<span class="level-badge">N5</span>
			</div>

			<div class="story-body">
				<p class="jp">{story.jp}</p>
				<p class="trans">{story[$locale] || story.en}</p>
			</div>

			<div class="tags">
				{#each story.chips as chip (chip.jp)}
					<div class="tag">
						<span class="tag-jp">{chip.jp}</span>
						<span class="tag-sep"></span>
						<span class="tag-en">{chip.trans}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="points-list">
		{#each points as point, i (point.title)}
			<div class="point-item" use:fadeUp={{ delay: 0.2 + i * 0.1, y: 8 }}>
				<div class="icon-box" style="background: {point.color}14; color: {point.color};">
					<Icon icon={point.icon} size={18} color="currentColor" strokeWidth={2} />
				</div>
				<div class="text">
					<span class="point-title">{point.title}</span>
					<span class="point-desc">{point.desc}</span>
				</div>
			</div>
			{#if i < points.length - 1}
				<div class="point-divider"></div>
			{/if}
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
		padding: 32px 24px 100px;
	}

	.header {
		text-align: center;
		margin-bottom: 24px;
	}

	.title {
		font-size: var(--step-title);
		font-weight: 700;
		letter-spacing: -0.04em;
		margin: 0 0 8px;
		color: var(--fg-primary);
	}

	.subtitle {
		font-size: var(--step-subtitle);
		color: var(--fg-tertiary);
		font-weight: 500;
		line-height: 1.4;
	}

	.story-preview {
		margin-bottom: 32px;
	}

	.story-card {
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 24px;
		padding: 20px;
	}

	.story-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.title-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.book-box {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: #007aff14;
		color: #007aff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.story-title {
		font-weight: 700;
		font-size: 16px;
		color: var(--fg-primary);
	}

	.level-badge {
		background: var(--sumi);
		color: #fff;
		font-size: 10px;
		font-weight: 800;
		padding: 3px 8px;
		border-radius: 6px;
	}

	.story-body {
		margin-bottom: 16px;
	}

	.jp {
		font-family: var(--font-jp);
		font-size: 17px;
		line-height: 1.6;
		margin: 0 0 8px;
		color: var(--fg-primary);
	}

	.trans {
		font-size: 14px;
		color: var(--fg-tertiary);
		margin: 0;
		line-height: 1.4;
	}

	.tags {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.tag {
		background: var(--ink-100);
		padding: 4px 10px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.tag-jp {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.tag-sep {
		width: 1px;
		height: 8px;
		background: var(--ink-300);
	}

	.tag-en {
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-tertiary);
	}

	.points-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 24px;
	}

	.point-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px 16px;
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

	.text {
		display: flex;
		flex-direction: column;
	}

	.point-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--fg-primary);
	}

	.point-desc {
		font-size: 13px;
		color: var(--fg-tertiary);
	}

	.point-divider {
		height: 1px;
		background: var(--ink-100);
		margin: 0 16px;
	}
</style>
