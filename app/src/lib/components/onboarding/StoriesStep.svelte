<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { PencilEdit01Icon, BrainIcon, ChartUpIcon, BookOpen01Icon } from '@hugeicons/core-free-icons';

	let { onNext } = $props();

	const points = $derived([
		{ 
			title: t('onboarding.stories.p1.title', $locale), 
			desc: t('onboarding.stories.p1.desc', $locale), 
			icon: PencilEdit01Icon 
		},
		{ 
			title: t('onboarding.stories.p2.title', $locale), 
			desc: t('onboarding.stories.p2.desc', $locale), 
			icon: BrainIcon 
		},
		{ 
			title: t('onboarding.stories.p3.title', $locale), 
			desc: t('onboarding.stories.p3.desc', $locale), 
			icon: ChartUpIcon 
		}
	]);

	const story = $derived({
		title: $locale === 'es' ? 'Mi rutina matutina' : 'My morning routine',
		jp: '毎朝、七時に起きます。顔を洗って、朝ごはんを食べます。それから学校に行きます。',
		en: 'Every morning, I wake up at seven. I wash my face and eat breakfast. Then I go to school.',
		es: 'Cada mañana me levanto a las siete. Me lavo la cara y desayuno. Luego voy a la escuela.',
		chips: [
			{ jp: '朝', trans: $locale === 'es' ? 'mañana' : 'morning' },
			{ jp: '食べる', trans: $locale === 'es' ? 'comer' : 'to eat' },
			{ jp: '学校', trans: $locale === 'es' ? 'escuela' : 'school' }
		]
	});
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.stories.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.stories.subtitle', $locale)}</p>
	</header>

	<div class="preview-card" use:fadeUp={{ delay: 0.1, y: 20 }}>
		<div class="story-header">
			<div class="story-title-row">
				<span class="icon"><Icon icon={BookOpen01Icon} size={20} /></span>
				<span class="story-title">{story.title}</span>
			</div>
			<span class="level-pill">N5</span>
		</div>
		
		<div class="story-text">
			<p class="jp">{story.jp}</p>
			<p class="trans">{story[$locale] || story.en}</p>
		</div>

		<div class="chips">
			{#each story.chips as chip}
				<div class="chip">{chip.jp} <span class="translation">{chip.trans}</span></div>
			{/each}
		</div>
	</div>

	<div class="points-list">
		{#each points as point, i}
			<div class="point-item" use:fadeUp={{ delay: 0.2 + i * 0.1, y: 12 }}>
				<div class="icon-box">
					<span class="icon-small"><Icon icon={point.icon} size={20} /></span>
				</div>
				<div class="text">
					<h4 class="point-title">{point.title}</h4>
					<p class="point-desc">{point.desc}</p>
				</div>
			</div>
		{/each}
	</div>

	<footer class="footer" use:fadeUp={{ delay: 0.5, y: 10 }}>
		<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={onNext}>
			{t('onboarding.next', $locale)}
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
		margin-bottom: 32px;
	}

	.title {
		font-size: 32px;
		font-weight: 800;
		letter-spacing: -0.04em;
		margin: 0 0 8px;
	}

	.subtitle {
		font-size: 17px;
		color: var(--fg-secondary);
		margin: 0;
		line-height: 1.4;
	}

	.preview-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 20px;
		margin-bottom: 32px;
		box-shadow: var(--shadow-sm);
	}

	.story-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.story-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 700;
		font-size: 16px;
	}

	.level-pill {
		background: var(--sumi);
		color: var(--bg-surface);
		font-size: 11px;
		font-weight: 800;
		padding: 2px 8px;
		border-radius: 6px;
	}

	.story-text {
		margin-bottom: 16px;
	}

	.story-text .jp {
		font-family: var(--font-jp);
		font-size: 16px;
		line-height: 1.6;
		margin: 0 0 8px;
		color: var(--fg-primary);
	}

	.story-text .trans {
		font-size: 13px;
		color: var(--fg-tertiary);
		margin: 0;
		line-height: 1.4;
	}

	.chips {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.chip {
		background: var(--ink-100);
		padding: 4px 10px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.chip .translation {
		font-weight: 400;
		color: var(--fg-tertiary);
		font-size: 11px;
	}

	.points-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.point-item {
		display: flex;
		gap: 16px;
		align-items: flex-start;
	}

	.icon-box {
		width: 36px;
		height: 36px;
		min-width: 36px;
		background: var(--sumi);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-small {
		font-size: 18px;
		color: var(--bg-surface);
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.point-title {
		font-size: 15px;
		font-weight: 700;
		margin: 0;
	}

	.point-desc {
		font-size: 13px;
		color: var(--fg-secondary);
		margin: 0;
		line-height: 1.4;
	}

	.footer {
		margin-top: auto;
	}
</style>
