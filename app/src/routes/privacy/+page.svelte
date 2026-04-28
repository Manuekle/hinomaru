<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
</script>

<svelte:head>
	<title>{t('privacy.title', $locale)} | Hinomaru</title>
</svelte:head>

<div class="legal-page">
	<header class="legal-header">
		<div class="header-inner">
			<a href="/" class="brand-link">
				<span class="brand-dot"></span>
				<span class="brand-name">Hinomaru</span>
			</a>
		</div>
	</header>

	<main class="legal-content">
		<h1 use:fadeUp>
			{t('privacy.title', $locale)}
		</h1>

		<div class="content-body" use:fadeUp={{ delay: 0.1 }}>
			<p class="updated-date">{t('privacy.updated', $locale)}</p>

			<section>
				<h2>{t('privacy.s1.title', $locale)}</h2>
				<p>{t('privacy.s1.desc', $locale)}</p>
			</section>

			<section>
				<h2>{t('privacy.s2.title', $locale)}</h2>
				<p>{t('privacy.s2.desc', $locale)}</p>
			</section>

			<section>
				<h2>{t('privacy.s3.title', $locale)}</h2>
				<p>{t('privacy.s3.desc', $locale)}</p>
			</section>

			<section>
				<h2>{t('privacy.s4.title', $locale)}</h2>
				<p>{t('privacy.s4.desc', $locale)}</p>
			</section>

			<section>
				<h2>{t('privacy.s5.title', $locale)}</h2>
				<p>{t('privacy.s5.desc', $locale)}</p>
			</section>
		</div>

		<div class="legal-footer" use:fadeUp={{ delay: 0.2 }}>
			<a href="/" class="back-link">← {t('deck.back', $locale)}</a>
		</div>
	</main>
</div>

<style>
	.legal-page {
		min-height: 100vh;
		background: var(--bg-surface);
		color: var(--sumi);
		font-family: var(--font-ui);
	}

	.legal-header {
		padding: 24px;
		border-bottom: 1px solid var(--ink-100);
	}
	.header-inner {
		max-width: 800px;
		margin: 0 auto;
	}
	.brand-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: inherit;
	}
	.brand-dot {
		width: 12px;
		height: 12px;
		background: var(--brand-primary);
		border-radius: 50%;
	}
	.brand-name {
		font-weight: 800;
		font-size: 18px;
		letter-spacing: -0.02em;
	}

	.legal-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 80px 24px;
	}

	h1 {
		font-size: clamp(32px, 8vw, 48px);
		font-weight: 900;
		margin-bottom: 48px;
		letter-spacing: -0.04em;
	}

	.content-body section {
		margin-bottom: 40px;
	}

	h2 {
		font-size: 22px;
		font-weight: 800;
		margin-bottom: 16px;
		color: var(--sumi);
		letter-spacing: -0.01em;
	}

	p {
		font-size: 16px;
		line-height: 1.7;
		color: var(--fg-secondary);
	}

	.updated-date {
		font-weight: 700;
		font-size: 14px;
		color: var(--brand-primary);
		margin-bottom: 32px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.legal-footer {
		margin-top: 80px;
		padding-top: 40px;
		border-top: 1px solid var(--ink-100);
	}

	.back-link {
		font-weight: 700;
		color: var(--brand-primary);
		text-decoration: none;
		transition: opacity 200ms;
	}
	.back-link:hover {
		opacity: 0.7;
	}
</style>
