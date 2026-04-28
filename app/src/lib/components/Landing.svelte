<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp, fadeIn, animateNumber, inView, inViewStagger, floatLoop } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import { theme, resolvedTheme } from '$lib/stores/theme';
	import Icon from '$lib/Icon.svelte';
	import supportImg from '$lib/assets/support.png';
	import {
		BrainIcon,
		Target01Icon,
		Download02Icon,
		BookOpen01Icon,
		SparklesIcon,
		PlayIcon,
		Coffee02Icon,
		Message01Icon,
		UserGroupIcon,
		SmileIcon,
		StarIcon,
		FlashIcon,
		FavouriteIcon,
		ZapIcon,
		GlobeIcon
	} from '@hugeicons/core-free-icons';
	import AppDownloadDrawer from '$lib/components/AppDownloadDrawer.svelte';

	let { decks = [] } = $props();

	let showDownload = $state(false);
	let isIOS = $state(false);
	let statLearners = $state(0);
	let statWords = $state(0);
	let statDays = $state(0);

	// Determine if dark mode is active
	let isDark = $derived($resolvedTheme === 'dark');

	// Select a few N5 decks for preview
	const previewDecks = $derived(decks.filter((d: any) => d.level === 'N5').slice(0, 3));

	onMount(() => {
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
		animateNumber((v) => (statLearners = v), 15000, { delay: 0.2, duration: 1.2 });
		animateNumber((v) => (statWords = v), 5000, { delay: 0.4, duration: 1.2 });
		animateNumber((v) => (statDays = v), 365, { delay: 0.6, duration: 1.2 });
	});

	const levels = [
		{ id: 'N5', label: 'Básico', flag: '🇯🇵' },
		{ id: 'N4', label: 'Elemental', flag: '🇯🇵' },
		{ id: 'N3', label: 'Intermedio', flag: '🇯🇵' },
		{ id: 'N2', label: 'Avanzado', flag: '🇯🇵' },
		{ id: 'N1', label: 'Nativo', flag: '🇯🇵' }
	];

	const features = $derived([
		{
			id: 'songs',
			title: t('landing.songs.title', $locale),
			desc: t('landing.songs.desc', $locale),
			color: 'var(--bg-pink-wash)'
		},
		{
			id: 'stories',
			title: t('landing.stories.title', $locale),
			desc: t('landing.stories.desc', $locale),
			color: 'var(--bg-yellow-wash)'
		},
		{
			id: 'kanji',
			title: t('landing.kanji.title', $locale),
			desc: t('landing.kanji.desc', $locale),
			color: 'var(--bg-light-gray)'
		}
	]);

	// Helper to get the correct image path
	function getFeatureImg(id: string, locale: string, dark: boolean) {
		const theme = dark ? 'dark' : 'light';
		return `/landing/${id}_${locale}_${theme}.webp`;
	}
</script>

<div class="landing-root">
	<!-- ════ HERO ════ -->
	<section class="hero-section">
		<div class="hero-inner">
			<div class="hero-badge" use:fadeUp={{ delay: 0 }}>
				<div class="badge-icon">
					<Icon icon={StarIcon} size={20} color={isDark ? 'var(--warning)' : 'var(--brand-primary)'} variant="solid" />
				</div>
				<span>{t('landing.hero.badge', $locale)}</span>
			</div>

			<h1 use:fadeUp={{ delay: 0.1 }}>
				{t('landing.hero.tagline.pre', $locale)}<br />
				<span class="text-white">{t('landing.hero.tagline.highlight', $locale)}</span>
			</h1>

			<p class="hero-subtitle" use:fadeUp={{ delay: 0.2 }}>
				{t('landing.hero.sub', $locale)}
			</p>

			<div use:fadeUp={{ delay: 0.3 }} class="hero-actions">
				<a href="/login" class="cta-btn cta-white">
					{t('landing.cta', $locale)}
				</a>

				<!-- Restore original Download button behavior (mostly for iOS) -->
				{#if isIOS}
					<button class="cta-btn cta-ghost" onclick={() => (showDownload = true)}>
						<Icon icon={Download02Icon} size={20} />
						{t('landing.cta.secondary', $locale).replace('O ', '').replace(' →', '')}
					</button>
				{/if}
			</div>
		</div>

		<div class="hero-visual-container" use:fadeIn={{ delay: 0.4 }}>
			<div class="hero-visual">
				<div class="hero-phone-container">
					<div class="iphone-16-mockup">
						<!-- App Content -->
						<div class="mockup-screen">
							<img src={getFeatureImg('hero', $locale, isDark)} alt="Hinomaru App" class="app-screenshot" />
						</div>
						<!-- Device Frame -->
						<img src="/mockups/iphone16pro_frame.png" alt="iPhone 16 Pro" class="device-frame" />
					</div>
				</div>
				<div class="hero-float-card left" use:fadeUp={{ delay: 0.6, y: 20 }}>
					<div use:floatLoop={{ duration: 4.5, y: 6 }}>
						<div class="float-row">
							<span class="float-emoji">🍜</span>
							<div class="float-lines">
								<div class="line jp-text">美味しい！</div>
								<div class="line bar w-10"></div>
							</div>
						</div>
					</div>
				</div>
				<div class="hero-float-card right" use:fadeUp={{ delay: 0.7, y: 20 }}>
					<div use:floatLoop={{ duration: 5, y: 8, delay: 0.5 }}>
						<div class="float-row">
							<span class="float-emoji">🇯🇵</span>
							<div class="float-lines">
								<div class="line jp-text">こんにちは</div>
								<div class="line bar w-12"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="hero-curve">
			<svg viewBox="0 0 1440 120" preserveAspectRatio="none">
				<path d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z" fill="var(--bg-surface)"></path>
			</svg>
		</div>
	</section>

	<!-- ════ LEVELS SECTION ════ -->
	<section class="levels-section">
		<h2 use:inView>{t('landing.hero.path', $locale)}</h2>
		<div class="levels-grid" use:inViewStagger={{ stagger: 0.05 }}>
			{#each levels as level}
				<div class="level-pill">
					<span class="level-flag">{level.flag}</span>
					<span class="level-name">{level.id}</span>
					<span class="level-label font-semibold tracking-tight">{level.label}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- ════ DECK PREVIEW SECTION ════ -->
	{#if previewDecks.length > 0}
		<section class="preview-section">
			<div class="section-header text-center">
				<span class="label-meta">{t('landing.preview.label', $locale)}</span>
				<h2 use:inView>{t('landing.preview.title', $locale)}</h2>
			</div>
			<div class="preview-grid" use:inViewStagger={{ stagger: 0.08 }}>
				{#each previewDecks as deck}
					<a href="/deck/{deck.id}" class="deck-preview-card">
						<div class="deck-preview-left">
							<span class="deck-level-pill">{deck.level}</span>
							<span class="deck-preview-title"
								>{$locale === 'es' ? deck.title_es : deck.title_en}</span
							>
						</div>
						<span class="deck-preview-arrow">→</span>
					</a>
				{/each}
			</div>
			<div class="mt-12 text-center">
				<a href="/login" class="preview-all-link">
					{t('landing.preview.all', $locale)}
				</a>
			</div>
		</section>
	{/if}

	<!-- ════ STATS SECTION ════ -->
	<section class="stats-section">
		<div class="stats-grid" use:inViewStagger={{ stagger: 0.1 }}>
			<div class="stat-card">
				<div class="stat-value">+{statLearners.toLocaleString()}</div>
				<div class="stat-label">{t('landing.stats.learners', $locale)}</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">+{statWords.toLocaleString()}</div>
				<div class="stat-label">{t('landing.stats.words', $locale)}</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{statDays}</div>
				<div class="stat-label">{t('onboarding.summary.goal', $locale)}</div>
			</div>
		</div>
	</section>

	<!-- ════ FEATURES SECTION ════ -->
	<section class="features-section">
		<div class="section-header text-center">
			<span class="label-meta">{t('landing.why.label', $locale)}</span>
			<h2 class="tracking-tight" use:inView>{t('landing.features.label', $locale)}</h2>
		</div>

		<div class="features-stack" use:inViewStagger={{ stagger: 0.15, y: 28 }}>
			{#each features as feature}
				<div class="feature-item" style="background: {feature.color}">
					<div class="feature-content">
						<h3>{feature.title}</h3>
						<p>{feature.desc}</p>
					</div>
					<div class="feature-image">
						<div class="iphone-16-mockup mini">
							<div class="mockup-screen">
								<img
									src={getFeatureImg(feature.id, $locale, isDark)}
									alt={feature.title}
									class="app-screenshot"
								/>
							</div>
							<img src="/mockups/iphone16pro_frame.png" alt="iPhone 16 Pro" class="device-frame" />
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ════ TESTIMONIALS ════ -->
	<section class="testimonial-section">
		<div class="section-header text-center font-semibold">
			<h2 use:inView>{t('landing.testimonials.title', $locale)}</h2>
		</div>

		<div class="test-grid" use:inViewStagger={{ stagger: 0.12 }}>
			<div class="test-card">
				<div class="test-quote">"{t('landing.testimonials.1.quote', $locale)}"</div>
				<div class="test-author">
					<div class="author-avatar">🌸</div>
					<div class="author-info">
						<div class="author-name">{t('landing.testimonials.1.author', $locale)}</div>
						<div class="author-sub">{t('landing.testimonials.1.sub', $locale)}</div>
					</div>
				</div>
			</div>
			<div class="test-card">
				<div class="test-quote">"{t('landing.testimonials.2.quote', $locale)}"</div>
				<div class="test-author">
					<div class="author-avatar">🏮</div>
					<div class="author-info">
						<div class="author-name">{t('landing.testimonials.2.author', $locale)}</div>
						<div class="author-sub">{t('landing.testimonials.2.sub', $locale)}</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ════ FINAL CTA ════ -->
	<section class="final-cta">
		<div class="final-card" use:inView={{ y: 36, duration: 0.7 }}>
			<div class="final-content">
				<h2 class="tracking-tight">{t('landing.cta.title', $locale)}</h2>
				<p>{t('landing.cta.desc', $locale)}</p>
				<div class="final-actions-row">
					<a href="/login" class="cta-btn cta-white">
						{t('landing.cta.primary', $locale)}
					</a>
					<button class="cta-link-btn" onclick={() => (showDownload = true)}>
						{t('landing.cta.secondary', $locale)}
					</button>
				</div>
			</div>
			<div class="final-visual">
				<div class="sunburst"></div>
				<span class="final-emoji">🏮</span>
			</div>
		</div>
	</section>

	<!-- ════ FOOTER ════ -->
	<footer class="landing-footer">
		<div class="footer-grid">
			<div class="footer-brand-col">
				<div class="brand-wrap">
					<span class="brand-dot"></span>
					<span class="brand-name">Hinomaru</span>
				</div>
				<p class="brand-tagline">{t('landing.brand.tagline', $locale)}</p>
			</div>

			<div class="footer-links-col">
				<h4>{t('footer.product', $locale)}</h4>
				<a href="/login">{t('footer.login', $locale)}</a>
				<a href="/vocabulary">{t('nav.vocabulary', $locale)}</a>
				<a href="/alphabet">{t('nav.alphabet', $locale)}</a>
			</div>

			<div class="footer-links-col">
				<h4>{t('footer.legal', $locale)}</h4>
				<a href="/privacy">{t('privacy.title', $locale)}</a>
				<a href="/terms">{t('terms.title', $locale)}</a>
				<a href="/contact">{t('contact.title', $locale)}</a>
			</div>

			<div class="footer-links-col">
				<h4>{t('footer.community', $locale)}</h4>
				<a
					href="https://ko-fi.com/manujsx"
					target="_blank"
					rel="noopener noreferrer"
					class="kofi-link-badge"
				>
					<img src={supportImg} alt="Ko-fi" />
				</a>
			</div>
		</div>
		<div class="footer-bottom">
			<p>
				{t('landing.copyright', $locale).replace('{year}', String(new Date().getFullYear()))}
				{t('landing.footer.crafted', $locale)}
			</p>
		</div>
	</footer>
</div>

<AppDownloadDrawer bind:open={showDownload} />

<style>
	/* ── Root ── */
	.landing-root {
		min-height: 100vh;
		background: var(--bg-surface);
		overflow-x: hidden;
		font-family: var(--font-ui);
		position: relative;
	}

	.text-center {
		text-align: center;
	}
	.text-white {
		color: #fff !important;
	}
	.mt-12 {
		margin-top: 48px;
	}

	/* ── Buttons ── */
	.cta-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 56px;
		padding: 0 32px;
		font-size: 16px;
		font-weight: 600;
		border-radius: 16px;
		text-decoration: none;
		cursor: pointer;
		transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
		border: none;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		gap: 10px;
	}
	.cta-white {
		background: #ffffff;
		color: var(--brand-primary);
	}
	.cta-white:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(255, 255, 255, 0.2);
	}
	.cta-ghost {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(8px);
	}
	.cta-ghost:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}

	/* ── HERO ── */
	.hero-section {
		background: var(--brand-primary);
		color: #fff;
		padding: calc(80px + env(safe-area-inset-top)) 24px 0;
		position: relative;
		text-align: center;
		z-index: 5;
		transition: background 0.4s ease;
	}
	:global(.dark) .hero-section {
		background: var(--bg-page);
	}
	.hero-inner {
		max-width: 1000px;
		margin: 0 auto;
		position: relative;
		z-index: 2;
	}
	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: rgba(255, 255, 255, 0.1);
		padding: 8px 16px;
		border-radius: 99px;
		font-size: 14px;
		font-weight: 700;
		margin-bottom: 24px;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #fff;
	}
	:global(.dark) .hero-badge {
		background: var(--bg-surface-glass);
		border-color: var(--ink-200);
		color: var(--fg-primary);
	}
	.badge-icon {
		background: #fff;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.hero-section h1 {
		font-size: clamp(32px, 8vw, 72px);
		font-weight: 900;
		line-height: 1.05;
		letter-spacing: -0.04em;
		margin: 0 0 20px;
		color: #fff;
	}
	.hero-subtitle {
		font-size: clamp(16px, 4vw, 20px);
		font-weight: 500;
		opacity: 0.9;
		max-width: 600px;
		margin: 0 auto 40px;
		line-height: 1.5;
	}
	.hero-actions {
		display: flex;
		justify-content: center;
		gap: 16px;
		margin-bottom: 40px;
		flex-wrap: wrap;
	}

	.hero-visual-container {
		position: relative;
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		z-index: 10;
		transform: translateY(20px);
	}
	.hero-visual {
		position: relative;
		width: 100%;
	}
	.hero-phone-container {
		width: 100%;
		max-width: 320px;
		margin: 0 auto;
		position: relative;
		perspective: 1000px;
	}
	.iphone-16-mockup {
		position: relative;
		width: 100%;
		max-width: 320px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.2));
		transition: transform 0.4s var(--ease-brand);
	}
	.iphone-16-mockup:hover {
		transform: translateY(-8px) scale(1.02);
	}
	.device-frame {
		width: 100%;
		height: auto;
		display: block;
		z-index: 10;
		pointer-events: none;
	}
	.mockup-screen {
		position: absolute;
		top: 9.98%;
		left: 9.98%;
		right: 10.04%;
		bottom: 10.01%;
		border-radius: 7.5% / 3.5%;
		overflow: hidden;
		background: #000;
		z-index: 5;
	}
	.app-screenshot {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.hero-float-card {
		position: absolute;
		background: var(--bg-surface-glass);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		padding: 12px 16px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		gap: 12px;
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--ink-200);
		z-index: 10;
		color: var(--fg-primary);
	}
	.hero-float-card.left {
		top: 30%;
		left: -60px;
	}
	.hero-float-card.right {
		bottom: 15%;
		right: -40px;
	}
	.float-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.float-emoji {
		font-size: 28px;
	}
	.jp-text {
		font-family: var(--font-jp);
		font-weight: 700;
		font-size: 15px;
		margin-bottom: 4px;
	}
	.float-lines .bar {
		height: 4px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 2px;
	}
	:global(.dark) .float-lines .bar {
		background: rgba(255, 255, 255, 0.2);
	}

	.hero-curve {
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 100%;
		height: 120px;
		z-index: 1;
		pointer-events: none;
	}
	.hero-curve svg {
		width: 100%;
		height: 100%;
	}

	/* ── LEVELS SECTION ── */
	.levels-section {
		padding: 120px 24px 40px;
		text-align: center;
		max-width: 900px;
		margin: 0 auto;
	}
	.levels-section h2 {
		font-size: 20px;
		font-weight: 600;
		margin-bottom: 32px;
		color: var(--fg-secondary);
	}
	.levels-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		justify-content: center;
	}
	.level-pill {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		color: var(--fg-primary);
		padding: 12px 24px;
		border-radius: 99px;
		display: flex;
		align-items: center;
		gap: 12px;
		box-shadow: var(--shadow-sm);
		transition: all 0.2s ease;
	}
	.level-pill:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--brand-primary);
	}
	.level-name {
		color: var(--brand-primary);
		font-size: 18px;
	}

	/* ── PREVIEW SECTION ── */
	.preview-section {
		padding: 80px 24px;
		max-width: 800px;
		margin: 0 auto;
	}
	.preview-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 40px;
	}
	.deck-preview-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		padding: 24px;
		border-radius: 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-decoration: none;
		color: var(--fg-primary);
		box-shadow: var(--shadow-sm);
		transition: all 0.2s ease;
	}
	.deck-preview-card:hover {
		border-color: var(--brand-primary);
		transform: translateX(4px);
	}
	.deck-preview-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.deck-level-pill {
		background: var(--brand-primary);
		color: #fff;
		padding: 4px 10px;
		border-radius: 8px;
		font-weight: 600;
		font-size: 13px;
	}
	.deck-preview-title {
		font-weight: 600;
		font-size: 17px;
	}
	.deck-preview-arrow {
		font-size: 20px;
		opacity: 0.3;
	}
	.preview-all-link {
		font-size: 16px;
		font-weight: 600;
		color: var(--brand-primary);
		text-decoration: none;
		border-bottom: 2px solid var(--brand-primary);
		padding-bottom: 4px;
	}

	/* ── STATS SECTION ── */
	.stats-section {
		padding: 40px 24px 80px;
		max-width: 1000px;
		margin: 0 auto;
	}
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
	}
	.stat-card {
		background: var(--bg-surface);
		padding: 32px;
		border-radius: 24px;
		text-align: center;
		border: 1px solid var(--ink-200);
		box-shadow: var(--shadow-sm);
	}
	.stat-value {
		font-size: 40px;
		font-weight: 900;
		color: var(--sumi);
		margin-bottom: 8px;
		letter-spacing: -0.02em;
	}
	.stat-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-tertiary);
		text-transform: uppercase;
	}

	/* ── FEATURES SECTION ── */
	.features-section {
		padding: 100px 24px;
		max-width: 1100px;
		margin: 0 auto;
	}
	.label-meta {
		font-size: 11px;
		font-weight: 600;
		color: var(--brand-primary);
		letter-spacing: 0.05em;
		display: block;
		margin-bottom: 12px;
	}
	.features-section h2 {
		font-size: clamp(32px, 6vw, 48px);
		font-weight: 900;
		color: var(--sumi);
		margin-bottom: 64px;
	}
	.features-stack {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}
	.feature-item {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		border-radius: 48px;
		overflow: hidden;
		min-height: 640px;
	}
	.feature-item:nth-child(even) {
		direction: rtl;
	}
	.feature-item:nth-child(even) .feature-content {
		direction: ltr;
	}
	.feature-content {
		padding: 80px;
	}
	.feature-content h3 {
		font-size: 32px;
		font-weight: 800;
		letter-spacing: -0.04em;
		color: var(--sumi);
		margin-bottom: 20px;
	}
	.feature-content p {
		font-size: 18px;
		font-weight: 500;
		color: var(--fg-secondary);
		line-height: 1.6;
	}
	.feature-image {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 64px;
		background: color-mix(in srgb, var(--fg-primary) 4%, transparent);
	}
	.iphone-16-mockup.mini {
		max-width: 260px;
	}

	/* ── TESTIMONIALS ── */
	.testimonial-section {
		padding: 100px 24px;
		max-width: 1000px;
		margin: 0 auto;
	}

	.test-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 32px;
		margin-top: 64px;
	}
	.test-card {
		background: var(--bg-surface);
		padding: 40px;
		border-radius: 32px;
		border: 1px solid var(--ink-200);
		box-shadow: var(--shadow-sm);
	}
	.test-quote {
		font-size: 20px;
		font-weight: 500;
		color: var(--sumi);
		line-height: 1.6;
		margin-bottom: 32px;
		font-style: italic;
	}
	.test-author {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.author-avatar {
		width: 48px;
		height: 48px;
		background: var(--ink-50);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
	}
	.author-name {
		font-weight: 600;
		font-size: 17px;
		color: var(--sumi);
	}
	.author-sub {
		font-size: 14px;
		color: var(--fg-tertiary);
		font-weight: 600;
	}

	/* ── FINAL CTA ── */
	.final-cta {
		padding: 100px 24px;
		max-width: 1100px;
		margin: 0 auto;
	}
	.final-card {
		background: #1a1a1a;
		border-radius: 48px;
		display: grid;
		grid-template-columns: 1.2fr 0.8fr;
		overflow: hidden;
		min-height: 440px;
		color: #fff;
	}
	.final-content {
		padding: 64px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.final-content h2 {
		font-size: 40px;
		font-weight: 800;
		margin-bottom: 16px;
	}
	.final-content p {
		font-size: 18px;
		opacity: 0.8;
		margin-bottom: 40px;
	}

	.final-actions-row {
		display: flex;
		align-items: center;
		gap: 24px;
		flex-wrap: wrap;
	}

	.cta-link-btn {
		background: transparent;
		border: none;
		color: #fff;
		font-weight: 700;
		font-size: 16px;
		opacity: 0.7;
		cursor: pointer;
		transition: opacity 200ms;
		padding: 0;
	}
	.cta-link-btn:hover {
		opacity: 1;
		text-decoration: underline;
	}

	.final-visual {
		background: var(--brand-primary);
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.sunburst {
		position: absolute;
		width: 100%;
		height: 100%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
	}
	.final-emoji {
		font-size: 120px;
		position: relative;
		z-index: 2;
	}

	/* ── FOOTER ── */
	.landing-footer {
		background: var(--bg-muted);
		border-top: 1px solid var(--ink-200);
		padding: 80px 24px 40px;
	}
	.footer-grid {
		max-width: 1100px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.5fr 1fr 1fr 1fr;
		gap: 64px;
		margin-bottom: 64px;
	}
	.brand-wrap {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
	}
	.brand-dot {
		width: 12px;
		height: 12px;
		background: var(--brand-primary);
		border-radius: 50%;
	}
	.brand-name {
		font-size: 22px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.brand-tagline {
		font-size: 15px;
		opacity: 0.7;
		line-height: 1.5;
		margin-bottom: 24px;
		color: var(--fg-secondary);
	}

	.footer-links-col h4 {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 24px;
		color: var(--brand-primary);
	}
	.footer-links-col a {
		display: block;
		color: var(--fg-primary);
		opacity: 0.7;
		text-decoration: none;
		margin-bottom: 12px;
		font-size: 15px;
		transition: all 200ms;
	}
	.footer-links-col a:hover {
		opacity: 1;
		transform: translateX(4px);
	}

	.kofi-link-badge {
		opacity: 1 !important;
	}
	.kofi-link-badge img {
		height: 44px;
		transition: transform 200ms;
	}
	.kofi-link-badge:hover {
		transform: none !important;
	}

	.footer-bottom {
		max-width: 1100px;
		margin: 0 auto;
		padding-top: 32px;
		border-top: 1px solid var(--ink-200);
		text-align: center;
		font-size: 14px;
		opacity: 0.6;
		color: var(--fg-secondary);
	}

	/* ── RESPONSIVE ── */
	@media (max-width: 900px) {
		.feature-item,
		.final-card,
		.footer-grid {
			grid-template-columns: 1fr;
			text-align: center;
		}
		.test-grid {
			grid-template-columns: 1fr;
			gap: 20px;
		}
		.feature-item:nth-child(even) {
			direction: ltr;
		}
		.feature-item {
			min-height: unset;
		}
		.feature-content {
			padding: 40px;
		}
		.feature-content h3 {
			font-size: 26px;
		}
		.feature-image {
			order: -1;
			height: 280px;
			padding: 32px;
		}
		.iphone-16-mockup.mini {
			max-width: 180px;
		}
		.stats-grid {
			grid-template-columns: 1fr 1fr;
			gap: 16px;
		}
		.stats-grid .stat-card:last-child {
			grid-column: 1 / -1;
		}
		.final-visual {
			height: 200px;
		}
		.final-content {
			padding: 40px;
			align-items: center;
		}
		.final-content h2 {
			font-size: 32px;
		}
		.brand-wrap {
			justify-content: center;
		}
		.footer-grid {
			gap: 40px;
		}
		.final-actions-row {
			justify-content: center;
		}
		.hero-actions {
			flex-direction: column;
			align-items: stretch;
			max-width: 320px;
			margin: 0 auto 40px;
		}
		.levels-section {
			padding: 64px 24px 32px;
		}
		.preview-section {
			padding: 48px 24px;
		}
		.features-section {
			padding: 64px 24px;
		}
		.testimonial-section {
			padding: 64px 24px;
		}
		.final-cta {
			padding: 64px 24px;
		}
		.stat-value {
			font-size: 32px;
		}
	}
	@media (max-width: 600px) {
		.hero-float-card {
			display: none;
		}
		.hero-section h1 {
			font-size: 38px;
		}
		.level-pill {
			width: 100%;
			justify-content: center;
		}
		.feature-content {
			padding: 28px 24px;
		}
		.feature-content h3 {
			font-size: 22px;
		}
		.feature-content p {
			font-size: 16px;
		}
		.feature-image {
			height: 240px;
			padding: 24px;
		}
		.test-card {
			padding: 28px 24px;
		}
		.test-quote {
			font-size: 17px;
		}
		.final-content {
			padding: 32px 24px;
		}
		.final-content h2 {
			font-size: 26px;
		}
		.final-card {
			border-radius: 28px;
		}
		.stats-grid {
			grid-template-columns: 1fr;
		}
		.stats-grid .stat-card:last-child {
			grid-column: auto;
		}
		.stat-value {
			font-size: 36px;
		}
		.landing-footer {
			padding: 48px 24px 32px;
		}
	}
</style>
