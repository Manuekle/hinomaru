<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import {
		Clock01Icon,
		Calendar01Icon,
		Calendar02Icon,
		Calendar03Icon,
		BrainIcon,
		Idea01Icon
	} from '@hugeicons/core-free-icons';

	import { page } from '$app/stores';
	let { onNext } = $props();

	async function handleNext(enabled: boolean) {
		if (enabled && $page.data.isPWA) {
			try {
				if ('Notification' in window) {
					await Notification.requestPermission();
				}
			} catch (e) {
				console.warn('Failed to request notification permission:', e);
			}
		}
		onNext(enabled);
	}

	const intervals = [
		{ label: '2 hrs', icon: Clock01Icon },
		{ label: '1 day', icon: Calendar01Icon },
		{ label: '6 days', icon: Calendar02Icon },
		{ label: '25 days', icon: Calendar03Icon },
		{ label: '5 mo', icon: BrainIcon },
		{ label: '11 mo', icon: Idea01Icon }
	];
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.srs.title', $locale)}</h1>
	</header>

	<div class="main-body">
		<p class="description" use:fadeUp={{ delay: 0.1, y: 12 }}>
			{t('onboarding.srs.desc', $locale)}
		</p>

		<div class="timeline" use:fadeUp={{ delay: 0.2, y: 15 }}>
			{#each intervals as interval, i (interval.label)}
				<div class="interval-item">
					<div class="icon-box">
						<Icon icon={interval.icon} size={20} color="var(--washi)" strokeWidth={1.5} />
					</div>
					<span class="label">{interval.label}</span>
				</div>
				{#if i < intervals.length - 1}
					<div class="arrow">›</div>
				{/if}
			{/each}
		</div>
	</div>

	<StickyFooter>
		<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex: 1" onclick={() => handleNext(true)}>
			{t('onboarding.srs.enable', $locale)}
		</button>
		<button class="hm-btn hm-btn-ghost hm-btn-lg" style="flex: 1" onclick={() => handleNext(false)}>
			{t('onboarding.srs.later', $locale)}
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
		line-height: 1.1;
		margin: 0;
	}

	.main-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	.description {
		font-size: 17px;
		color: var(--fg-tertiary);
		line-height: 1.5;
		max-width: 320px;
		margin: 0 0 60px;
	}

	.timeline {
		display: flex;
		align-items: center;
		gap: 8px;
		overflow-x: auto;
		width: 100%;
		padding: 20px 0;
		justify-content: center;
	}

	.interval-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.icon-box {
		width: 44px;
		height: 44px;
		background: var(--sumi);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--washi);
	}

	.label {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		white-space: nowrap;
	}

	.arrow {
		color: var(--ink-300);
		font-size: 18px;
		margin-bottom: 20px;
	}
</style>
