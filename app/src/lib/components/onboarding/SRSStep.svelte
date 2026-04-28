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
		{ label: '2 hrs', icon: Clock01Icon, color: '#ff3b30' },
		{ label: '1 day', icon: Calendar01Icon, color: '#ff9500' },
		{ label: '6 days', icon: Calendar02Icon, color: '#ffcc00' },
		{ label: '25 days', icon: Calendar03Icon, color: '#34c759' },
		{ label: '5 mo', icon: BrainIcon, color: '#007aff' },
		{ label: '11 mo', icon: Idea01Icon, color: '#af52de' }
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

		<div class="timeline-v" use:fadeUp={{ delay: 0.2, y: 15 }}>
			<div class="track-v"></div>
			{#each intervals as node, i (node.id)}
				<div class="node-v" class:active={i === 0} use:fadeUp={{ delay: 0.1 + i * 0.1, y: 15 }}>
					<div class="node-icon-wrap">
						<Icon icon={node.icon} size={24} color="currentColor" strokeWidth={2} />
					</div>
					<div class="node-text">
						<span class="node-time">{node.time}</span>
						<span class="node-title">{node.label}</span>
					</div>
				</div>
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
		margin-bottom: 32px;
	}

	.title {
		font-size: var(--step-title, clamp(28px, 8vw, 38px));
		font-weight: 800;
		letter-spacing: -0.05em;
		line-height: 1.1;
		margin: 0;
		color: var(--fg-primary);
	}

	.main-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
	}

	.description {
		font-size: 17px;
		color: var(--fg-secondary);
		line-height: 1.6;
		text-align: center;
		margin: 0 0 40px;
		font-weight: 500;
	}

	.timeline-v {
		display: flex;
		flex-direction: column;
		gap: 32px;
		position: relative;
		padding: 20px 0;
		max-width: 320px;
		margin: 0 auto 40px;
	}

	.track-v {
		position: absolute;
		left: 27px;
		top: 0;
		bottom: 0;
		width: 3px;
		background: linear-gradient(to bottom, var(--hinomaru-red), var(--ink-200) 80%);
		border-radius: 99px;
		z-index: 0;
	}

	.node-v {
		display: flex;
		align-items: center;
		gap: 20px;
		position: relative;
		z-index: 1;
	}

	.node-icon-wrap {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 2px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		flex-shrink: 0;
	}

	.node-v.active .node-icon-wrap {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red);
		color: #fff;
		transform: scale(1.1);
		box-shadow: 0 10px 25px rgba(188, 0, 45, 0.2);
	}

	.node-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.node-time {
		font-size: 14px;
		font-weight: 900;
		color: var(--hinomaru-red);
		letter-spacing: 0.02em;
	}

	.node-title {
		font-size: 18px;
		font-weight: 800;
		color: var(--fg-primary);
		letter-spacing: -0.01em;
	}

	.node-v:not(.active) .node-time {
		color: var(--fg-tertiary);
	}

	@media (max-width: 400px) {
		.node-icon-wrap {
			width: 48px;
			height: 48px;
		}
		.node-title {
			font-size: 16px;
		}
	}
</style>
