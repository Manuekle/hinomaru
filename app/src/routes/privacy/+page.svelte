<script lang="ts">
	import { fadeUp, fadeIn, inView } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import {
		Shield01Icon,
		Database01Icon,
		ViewIcon,
		UserCheck01Icon,
		UserShield01Icon,
		Mail01Icon,
		ArrowLeft01Icon
	} from '@hugeicons/core-free-icons';

	const sections = [
		{ id: 's1', icon: Database01Icon },
		{ id: 's2', icon: ViewIcon },
		{ id: 's3', icon: UserShield01Icon },
		{ id: 's4', icon: UserCheck01Icon },
		{ id: 's5', icon: Mail01Icon }
	];
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
		<div class="hero" use:fadeIn>
			<div class="hero-deco">
				<span class="kanji">日</span>
				<span class="sun-disc"></span>
			</div>
			<div class="badge-row" use:fadeUp={{ y: 12 }}>
				<Icon icon={Shield01Icon} size={14} color="currentColor" />
				<span>{t('privacy.title', $locale)}</span>
			</div>
			<h1 use:fadeUp={{ y: 18, delay: 0.05 }}>
				{t('privacy.title', $locale)}
			</h1>
			<p class="updated-date" use:fadeUp={{ y: 12, delay: 0.1 }}>
				{t('privacy.updated', $locale)}
			</p>
		</div>

		<div class="layout">
			<aside class="toc" aria-label="Table of contents">
				<div class="toc-inner">
					<p class="toc-label">{$locale === 'es' ? 'En esta página' : 'On this page'}</p>
					<ul>
						{#each sections as s, i (s.id)}
							<li>
								<a href="#{s.id}">
									<span class="toc-num">0{i + 1}</span>
									<span>{t(`privacy.${s.id}.title`, $locale)}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</aside>

			<div class="content-body">
				{#each sections as s, i (s.id)}
					<section id={s.id} use:inView={{ y: 24, duration: 0.55 }}>
						<div class="section-head">
							<div class="section-icon">
								<Icon icon={s.icon} size={22} color="var(--brand-primary)" strokeWidth={1.6} />
							</div>
							<div class="section-meta">
								<span class="section-num">0{i + 1}</span>
								<h2>{t(`privacy.${s.id}.title`, $locale)}</h2>
							</div>
						</div>
						<p>{t(`privacy.${s.id}.desc`, $locale)}</p>
					</section>
				{/each}
			</div>
		</div>

		<div class="legal-footer" use:fadeUp={{ delay: 0.1 }}>
			<a href="/" class="hm-btn hm-btn-secondary">
				<Icon icon={ArrowLeft01Icon} size={16} color="currentColor" />
				<span>{t('deck.back', $locale)}</span>
			</a>
			<a href="/contact" class="hm-btn hm-btn-primary">
				<Icon icon={Mail01Icon} size={16} color="currentColor" />
				<span>{t('contact.title', $locale)}</span>
			</a>
		</div>
	</main>
</div>

<style>
	.legal-page {
		min-height: 100vh;
		background: var(--bg-surface);
		color: var(--fg-primary);
		font-family: var(--font-ui);
		position: relative;
		overflow-x: hidden;
	}

	/* ── Header ── */
	.legal-header {
		padding: 18px 24px;
		border-bottom: 1px solid var(--ink-100);
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg-surface-glass, rgba(255, 255, 255, 0.85));
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
	}
	.header-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.brand-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: var(--fg-primary);
	}
	.brand-dot {
		width: 12px;
		height: 12px;
		background: var(--brand-primary);
		border-radius: 50%;
		box-shadow: 0 0 16px rgba(188, 0, 45, 0.5);
	}
	.brand-name {
		font-weight: 800;
		font-size: 17px;
		letter-spacing: -0.02em;
	}
	.header-back {
		transition: transform 200ms var(--ease-brand);
	}
	.header-back:hover {
		transform: translateX(-2px);
	}

	/* ── Content shell ── */
	.legal-content {
		max-width: 1100px;
		margin: 0 auto;
		padding: 56px 24px 80px;
	}

	/* ── Hero ── */
	.hero {
		position: relative;
		padding: 32px 0 56px;
		text-align: center;
		margin-bottom: 56px;
		border-bottom: 1px solid var(--ink-100);
	}
	.hero-deco {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 0;
	}
	.kanji {
		position: absolute;
		font-family: var(--font-jp);
		font-size: clamp(180px, 30vw, 280px);
		font-weight: 900;
		color: var(--fg-primary);
		opacity: 0.04;
		line-height: 1;
		user-select: none;
	}
	.sun-disc {
		position: absolute;
		width: clamp(220px, 30vw, 320px);
		height: clamp(220px, 30vw, 320px);
		background: radial-gradient(
			circle,
			rgba(188, 0, 45, 0.12) 0%,
			rgba(188, 0, 45, 0.04) 40%,
			transparent 70%
		);
		border-radius: 50%;
		filter: blur(20px);
	}
	.badge-row {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 14px;
		background: rgba(188, 0, 45, 0.08);
		color: var(--brand-primary);
		border-radius: 999px;
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: -0.04em;
		margin-bottom: 24px;
	}
	h1 {
		position: relative;
		z-index: 1;
		font-size: clamp(40px, 8vw, 68px);
		font-weight: 900;
		letter-spacing: -0.04em;
		line-height: 1.05;
		margin: 0 0 20px;
	}
	.updated-date {
		position: relative;
		z-index: 1;
		font-weight: 700;
		font-size: 12px;
		color: var(--fg-tertiary, var(--fg-secondary));
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin: 0;
		opacity: 0.7;
	}

	/* ── Layout: TOC + content ── */
	.layout {
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: 56px;
		align-items: start;
	}
	.toc {
		position: sticky;
		top: 96px;
	}
	.toc-inner {
		padding: 8px 0;
	}
	.toc-label {
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--fg-tertiary, var(--fg-secondary));
		margin: 0 0 16px;
		opacity: 0.6;
	}
	.toc ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.toc a {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border-radius: 10px;
		text-decoration: none;
		color: var(--fg-secondary);
		font-size: 13px;
		font-weight: 600;
		line-height: 1.3;
		transition: all 200ms var(--ease-brand);
		border-left: 2px solid transparent;
	}
	.toc a:hover {
		background: var(--ink-50, rgba(0, 0, 0, 0.03));
		color: var(--fg-primary);
		border-left-color: var(--brand-primary);
	}
	.toc-num {
		font-size: 10px;
		font-weight: 800;
		color: var(--brand-primary);
		letter-spacing: -0.04em;
		flex-shrink: 0;
	}

	/* ── Sections ── */
	.content-body {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	section {
		padding: 32px;
		border-radius: 24px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-100);
		transition:
			border-color 240ms var(--ease-brand),
			transform 240ms var(--ease-brand);
		scroll-margin-top: 96px;
	}
	section:hover {
		border-color: rgba(188, 0, 45, 0.25);
		transform: translateY(-2px);
	}
	.section-head {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;
	}
	.section-icon {
		width: 48px;
		height: 48px;
		border-radius: 14px;
		background: rgba(188, 0, 45, 0.08);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.section-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.section-num {
		font-size: 11px;
		font-weight: 800;
		color: var(--brand-primary);
		letter-spacing: 0.12em;
	}
	h2 {
		font-size: 21px;
		font-weight: 800;
		margin: 0;
		color: var(--fg-primary);
		letter-spacing: -0.015em;
		line-height: 1.25;
	}
	section p {
		font-size: 15.5px;
		line-height: 1.75;
		color: var(--fg-secondary);
		margin: 0;
	}

	/* ── Footer ── */
	.legal-footer {
		margin-top: 64px;
		padding-top: 40px;
		border-top: 1px solid var(--ink-100);
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
			gap: 32px;
		}
		.toc {
			position: relative;
			top: 0;
			padding: 16px;
			border: 1px solid var(--ink-100);
			border-radius: 16px;
		}
		.toc-inner {
			padding: 0;
		}
	}
	@media (max-width: 600px) {
		.legal-content {
			padding: 32px 16px 56px;
		}
		.hero {
			padding: 16px 0 40px;
			margin-bottom: 40px;
		}
		section {
			padding: 24px 20px;
			border-radius: 20px;
		}
		.section-head {
			gap: 12px;
		}
		.section-icon {
			width: 40px;
			height: 40px;
			border-radius: 12px;
		}
		h2 {
			font-size: 18px;
		}
		section p {
			font-size: 15px;
		}
		.legal-footer {
			flex-direction: column-reverse;
		}
	}
</style>
