<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';

	let { onNext } = $props();

	const intervals = [
		{ label: '2 hrs', icon: '🕒' },
		{ label: '1 day', icon: '📅' },
		{ label: '6 days', icon: '🗓️' },
		{ label: '25 days', icon: '📆' },
		{ label: '5 mo', icon: '🧠' },
		{ label: '11 mo', icon: '💡' }
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
			{#each intervals as interval, i}
				<div class="interval-item">
					<div class="icon-box">
						<span class="icon">{interval.icon}</span>
					</div>
					<span class="label">{interval.label}</span>
				</div>
				{#if i < intervals.length - 1}
					<div class="arrow">›</div>
				{/if}
			{/each}
		</div>
	</div>

	<footer class="footer" use:fadeUp={{ delay: 0.4, y: 10 }}>
		<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={() => onNext(true)}>
			<span class="btn-icon">🧠</span> {t('onboarding.srs.enable', $locale)}
		</button>
		<button class="hm-btn hm-btn-ghost hm-btn-full" onclick={() => onNext(false)}>
			{t('onboarding.srs.later', $locale)}
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
		margin-bottom: 60px;
	}

	.title {
		font-size: 32px;
		font-weight: 800;
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
	}

	.icon {
		font-size: 20px;
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

	.footer {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.btn-icon {
		margin-right: 8px;
	}
</style>
