<script lang="ts">
	import { fadeUp, popIn, fadeIn } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import StickyFooter from '$lib/components/StickyFooter.svelte';

	let { onNext } = $props();
</script>

<div class="step-content">
	<div class="header-section" use:fadeUp={{ delay: 0.25, y: 16 }}>
		<h1 class="title">{t('onboarding.welcome.title', $locale)}</h1>
	</div>

	<div class="main-visual">
		<div class="app-icon-container" use:popIn={{ delay: 0.05, duration: 0.6 }}>
			<img src="/icon-512.png" alt="Hinomaru Logo" class="app-logo" />
		</div>
		<p class="subtitle" use:fadeIn={{ delay: 0.45, duration: 0.4 }}>
			{t('onboarding.welcome.desc', $locale)}
		</p>
	</div>

	<StickyFooter>
		<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={onNext}>
			{t('onboarding.welcome.btn', $locale)}
		</button>
	</StickyFooter>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 40px 24px 100px;
		text-align: center;
	}

	.header-section {
		margin-bottom: auto;
	}

	.title {
		font-size: var(--step-title, clamp(24px, 7vw, 36px));
		font-weight: 600;
		letter-spacing: -0.04em;
		margin: 0;
	}

	.main-visual {
		flex: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 32px;
	}

	.app-icon-container {
		width: 160px;
		height: 160px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.app-logo {
		width: 100%;
		height: 100%;
		object-fit: contain;
		border-radius: 40px;
		box-shadow: 0 20px 40px rgba(188, 0, 45, 0.2);
	}

	.subtitle {
		font-size: var(--step-body, clamp(13px, 3.5vw, 17px));
		color: var(--fg-secondary);
		line-height: 1.5;
		max-width: 300px;
		margin: 0;
	}

	.footer-section {
		margin-top: auto;
	}
</style>
