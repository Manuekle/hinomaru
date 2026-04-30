<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { fadeUp, fadeIn, animateNumber, inView, inViewStagger, floatLoop } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import { theme, resolvedTheme } from '$lib/stores/theme';
	import Icon from '$lib/Icon.svelte';
	import kofiImg from '$lib/assets/kofi_brandasset/support_me_on_kofi_dark.png';
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
		GlobeIcon,
		Moon01Icon,
		Sun01Icon,
		LanguageCircleIcon
	} from '@hugeicons/core-free-icons';
	import AppDownloadDrawer from '$lib/components/AppDownloadDrawer.svelte';
	import { deferredPrompt, isInstalled } from '$lib/stores/pwa';

	let { decks = [] } = $props();

	function toggleTheme() {
		const current = get(resolvedTheme);
		const next = current === 'dark' ? 'light' : 'dark';
		console.log('[footer] toggleTheme', { current, next });
		theme.set(next);
	}

	function toggleLocale() {
		const current = get(locale);
		const next = current === 'es' ? 'en' : 'es';
		console.log('[footer] toggleLocale', { current, next });
		locale.set(next);
	}

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
		
		// Use requestAnimationFrame to avoid layout thrashing
		requestAnimationFrame(() => {
			animateNumber((v) => (statLearners = v), 15000, { delay: 0.2, duration: 1.2 });
			animateNumber((v) => (statWords = v), 5000, { delay: 0.4, duration: 1.2 });
			animateNumber((v) => (statDays = v), 365, { delay: 0.6, duration: 1.2 });
		});
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

	function playSample() {
		const msg = new SpeechSynthesisUtterance('こんにちは');
		msg.lang = 'ja-JP';
		window.speechSynthesis.speak(msg);
	}
	async function handleDownload() {
		if (isIOS) {
			showDownload = true;
		} else if ($deferredPrompt) {
			try {
				$deferredPrompt.prompt();
				const { outcome } = await $deferredPrompt.userChoice;
				if (outcome === 'accepted') {
					deferredPrompt.set(null);
				}
			} catch (err) {
				console.error('Install prompt failed:', err);
			}
		}
	}
</script>

<div class="landing-root">
	<section class="hero-section">
		<div class="hero-inner">
			<div class="hero-badge" use:fadeUp={{ delay: 0 }}>
				<div class="badge-icon">
					<Icon
						icon={StarIcon}
						size={20}
						color={isDark ? 'var(--warning)' : 'var(--brand-primary)'}
						variant="solid"
					/>
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

				{#if !$isInstalled}
					<button class="cta-btn cta-ghost" onclick={handleDownload}>
						{#if isIOS}
							<svg width="20" height="20" fill="currentColor" xml:space="preserve" viewBox="0 0 814 1000" class="os-icon">
								<path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
							</svg>
						{:else}
							<svg width="20" height="20" preserveAspectRatio="xMidYMid" viewBox="0 0 256 150" class="os-icon">
								<path fill="currentColor" d="M255.285 143.47c-.084-.524-.164-1.042-.251-1.56a128.119 128.119 0 0 0-12.794-38.288 128.778 128.778 0 0 0-23.45-31.86 129.166 129.166 0 0 0-22.713-18.005c.049-.08.09-.168.14-.25 2.582-4.461 5.172-8.917 7.755-13.38l7.576-13.068c1.818-3.126 3.632-6.26 5.438-9.386a11.776 11.776 0 0 0 .662-10.484 11.668 11.668 0 0 0-4.823-5.536 11.85 11.85 0 0 0-5.004-1.61 11.963 11.963 0 0 0-2.218.018 11.738 11.738 0 0 0-8.968 5.798c-1.814 3.127-3.628 6.26-5.438 9.386l-7.576 13.069c-2.583 4.462-5.173 8.918-7.755 13.38-.282.487-.567.973-.848 1.467-.392-.157-.78-.313-1.172-.462-14.24-5.43-29.688-8.4-45.836-8.4-.442 0-.879 0-1.324.006-14.357.143-28.152 2.64-41.022 7.12a119.434 119.434 0 0 0-4.42 1.642c-.262-.455-.532-.911-.79-1.367-2.583-4.462-5.173-8.918-7.755-13.38L65.123 15.25c-1.818-3.126-3.632-6.259-5.439-9.386A11.736 11.736 0 0 0 48.5.048 11.71 11.71 0 0 0 43.49 1.66a11.716 11.716 0 0 0-4.077 4.063c-.281.474-.532.967-.742 1.473a11.808 11.808 0 0 0-.365 8.188c.259.786.594 1.554 1.023 2.296a3973.32 3973.32 0 0 1 5.439 9.386c2.53 4.357 5.054 8.713 7.58 13.069 2.582 4.462 5.168 8.918 7.75 13.38.02.038.046.075.065.112A129.184 129.184 0 0 0 45.32 64.38a129.693 129.693 0 0 0-22.2 24.015 127.737 127.737 0 0 0-9.34 15.24 128.238 128.238 0 0 0-10.843 28.764 130.743 130.743 0 0 0-1.951 9.524c-.087.518-.167 1.042-.247 1.56A124.978 124.978 0 0 0 0 149.118h256c-.205-1.891-.449-3.77-.734-5.636l.019-.012Z"/><path fill="currentColor" d="M194.59 113.712c5.122-3.41 5.867-11.3 1.661-17.62-4.203-6.323-11.763-8.682-16.883-5.273-5.122 3.41-5.868 11.3-1.662 17.621 4.203 6.322 11.764 8.682 16.883 5.272ZM78.518 108.462c4.206-6.321 3.46-14.21-1.662-17.62-5.123-3.41-12.68-1.05-16.886 5.27-4.203 6.323-3.458 14.212 1.662 17.622 5.122 3.41 12.683 1.05 16.886-5.272Z"/></svg>
						{/if}
						{t('landing.cta.download', $locale)}
					</button>
				{/if}
			</div>
		</div>

		<div class="hero-visual-container" use:fadeIn={{ delay: 0.4 }}>
			<div class="hero-visual">
				<div class="hero-phone-container">
					<div class="iphone-16-mockup">
						<div class="mockup-screen">
							<img
								src={getFeatureImg('hero', $locale, isDark)}
								alt="Hinomaru App"
								class="app-screenshot"
							/>
						</div>
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
						<button class="float-row tts-btn" onclick={playSample} aria-label="Play sample">
							<span class="float-emoji">🇯🇵</span>
							<div class="float-lines">
								<div class="line jp-text">こんにちは</div>
								<div class="line bar w-12"></div>
							</div>
							<div class="play-indicator">
								<Icon icon={PlayIcon} size={14} variant="solid" />
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="hero-curve">
			<svg viewBox="0 0 1440 120" preserveAspectRatio="none">
				<path d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z" fill="var(--bg-surface)"></path>
			</svg>
		</div>

		<!-- Decorative blurred blobs -->
		<div class="hero-blob blob-1"></div>
		<div class="hero-blob blob-2"></div>
	</section>

	<section class="levels-section">
		<h2 use:inView>{t('landing.hero.path', $locale)}</h2>
		<div class="levels-grid" use:inViewStagger={{ stagger: 0.05, y: 20 }}>
			{#each levels as level}
				<div class="level-tag">
					<span class="level-name">{level.id}</span>
					<span class="level-label">{level.label}</span>
				</div>
			{/each}
		</div>
	</section>

	{#if previewDecks.length > 0}
		<section class="preview-section">
			<div class="section-header text-center">
				<span class="label-meta">{t('landing.preview.label', $locale)}</span>
				<h2 use:inView>{t('landing.preview.title', $locale)}</h2>
			</div>
			<div class="preview-grid" use:inViewStagger={{ stagger: 0.1, y: 20 }}>
				{#each previewDecks as deck}
					<a href="/deck/{deck.id}" class="deck-preview-card">
						<div class="deck-card-icon">
							{#if deck.title_es.includes('hiragana') || deck.title_en.includes('hiragana')}
								<Icon icon={FlashIcon} size={24} color="var(--brand-primary)" />
							{:else if deck.title_es.includes('katakana') || deck.title_en.includes('katakana')}
								<Icon icon={ZapIcon} size={24} color="var(--brand-primary)" />
							{:else}
								<Icon icon={BookOpen01Icon} size={24} color="var(--brand-primary)" />
							{/if}
						</div>
						<div class="deck-preview-content">
							<div class="deck-meta">
								<span class="deck-level-pill">{deck.level}</span>
								<span class="deck-count">{deck.card_count || 46} {t('home.cards', $locale).split(' ')[1]}</span>
							</div>
							<span class="deck-preview-title">
								{$locale === 'es' ? deck.title_es : deck.title_en}
							</span>
						</div>
						<div class="deck-arrow-wrap">
							<Icon icon={PlayIcon} size={20} variant="solid" />
						</div>
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

	<section class="features-section">
		<div class="section-header text-center">
			<span class="label-meta">{t('landing.why.label', $locale)}</span>
			<h2 class="tracking-tight" use:inView>{t('landing.features.label', $locale)}</h2>
		</div>

		<div class="features-stack" use:inViewStagger={{ stagger: 0.15, y: 28 }}>
			{#each features as feature}
				<div class="feature-item">
					<div class="feature-image">
						<div class="mockup-mobile-wrapper">
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
					<div class="feature-content">
						<h3>{feature.title}</h3>
						<p>{feature.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

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

	<section class="final-cta">
		<div class="final-card" use:inView={{ y: 36, duration: 0.7 }}>
			<div class="final-content">
				<h2 class="tracking-tight">{t('landing.cta.title', $locale)}</h2>
				<p>{t('landing.cta.desc', $locale)}</p>
				<div class="final-actions-row">
					<a href="/login" class="cta-btn cta-white">
						{t('landing.cta.primary', $locale)}
					</a>
				</div>
			</div>
			<div class="final-visual">
				<div class="sunburst"></div>
				<span class="final-emoji">🏮</span>
			</div>
		</div>
	</section>

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
					<img src={kofiImg} alt="Support me on Ko-fi" />
				</a>
			</div>
		</div>
		<div class="footer-bottom">
			<p class="footer-copy">
				{t('landing.copyright', $locale).replace('{year}', String(new Date().getFullYear()))}
				{t('landing.footer.crafted', $locale)}
			</p>
			<div class="footer-controls">
				<button
					type="button"
					class="footer-ctrl-btn"
					onclick={toggleTheme}
					aria-label="Toggle theme"
				>
					{#if $resolvedTheme === 'dark'}
						<Icon icon={Sun01Icon} size={16} color="currentColor" />
					{:else}
						<Icon icon={Moon01Icon} size={16} color="currentColor" />
					{/if}
				</button>
				<button
					type="button"
					class="footer-ctrl-btn lang-toggle"
					onclick={toggleLocale}
					aria-label="Switch language"
				>
					<Icon icon={LanguageCircleIcon} size={16} color="currentColor" />
					<span>{$locale === 'es' ? 'ES' : 'EN'}</span>
				</button>
			</div>
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
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
	}
	.cta-white:hover {
		transform: translateY(-3px) scale(1.02);
		box-shadow: 0 15px 35px rgba(255, 255, 255, 0.25);
		background: #fdfdfd;
	}
	.cta-ghost {
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(12px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
	}
	.cta-ghost:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-3px) scale(1.02);
		border-color: rgba(255, 255, 255, 0.4);
	}

	/* ── HERO ── */
	.hero-section {
		background: var(--brand-primary);
		color: #fff;
		padding: calc(100px + env(safe-area-inset-top)) 24px 0;
		position: relative;
		text-align: center;
		z-index: 5;
		transition: background 0.4s ease;
		overflow: hidden;
	}
	:global(.dark) .hero-section {
		background: radial-gradient(circle at 50% 0%, #2a0a10 0%, var(--bg-page) 100%);
	}
	/* Mesh Gradient / Decorative background for Light Mode */
	.hero-section::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 20% 30%, rgba(188, 0, 45, 0.05) 0%, transparent 40%),
					radial-gradient(circle at 80% 20%, rgba(188, 0, 45, 0.08) 0%, transparent 40%);
		pointer-events: none;
	}
	.hero-inner {
		max-width: 1000px;
		margin: 0 auto;
		position: relative;
		z-index: 2;
	}

	/* ── Glassmorphism Ajustado ── */
	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 10px 20px;
		border-radius: 99px;
		font-size: 13px;
		font-weight: 700;
		margin-bottom: 32px;
		color: #fff;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	:global(.dark) .hero-badge {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
		perspective: 1200px;
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
		transform: translateY(-4px) scale(1.01);
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
		padding: 16px 20px;
		border-radius: 24px;
		display: flex;
		align-items: center;
		gap: 12px;
		z-index: 10;
		color: var(--fg-primary);
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
		transition: transform 0.3s ease;
	}
	:global(.dark) .hero-float-card {
		background: rgba(30, 30, 30, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
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
	.tts-btn {
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
		color: inherit;
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.play-indicator {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--brand-primary);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 4px;
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.3);
		transition: transform 0.2s;
	}
	.tts-btn:hover .play-indicator {
		transform: scale(1.1);
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
		padding: 120px 24px 60px;
		text-align: center;
		max-width: 1000px;
		margin: 0 auto;
		position: relative;
	}
	.levels-section::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 120%;
		height: 120%;
		background-image: radial-gradient(var(--ink-200) 1px, transparent 1px);
		background-size: 32px 32px;
		transform: translate(-50%, -50%);
		opacity: 0.2;
		z-index: -1;
		pointer-events: none;
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
		gap: 12px;
		justify-content: center;
		max-width: 800px;
		margin: 0 auto;
	}
	.level-tag {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		padding: 10px 20px;
		border-radius: 99px;
		display: flex;
		align-items: center;
		gap: 8px;
		box-shadow: var(--shadow-sm);
		transition: all 300ms var(--ease-brand);
	}
	.level-tag:hover {
		transform: translateY(-2px);
		border-color: var(--brand-primary);
		box-shadow: var(--shadow-md);
	}
	.level-name {
		color: var(--brand-primary);
		font-size: 16px;
		font-weight: 800;
	}
	.level-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-secondary);
	}

	/* ── PREVIEW SECTION ── */
	.preview-section {
		padding: 80px 24px;
		max-width: 800px;
		margin: 0 auto;
	}
	.preview-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
		margin-top: 48px;
	}
	.deck-preview-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		padding: 24px;
		border-radius: 32px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		text-decoration: none;
		color: var(--fg-primary);
		box-shadow: var(--shadow-sm);
		transition: all 400ms var(--ease-brand);
		position: relative;
	}
	.deck-preview-card:hover {
		border-color: var(--brand-primary);
		transform: translateY(-6px);
		box-shadow: var(--shadow-lg);
	}
	.deck-card-icon {
		width: 48px;
		height: 48px;
		background: var(--bg-muted);
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 300ms var(--ease-brand);
	}
	.deck-preview-card:hover .deck-card-icon {
		background: var(--brand-primary);
		color: #fff !important;
	}
	.deck-preview-card:hover .deck-card-icon :global(svg) {
		color: #fff !important;
	}
	.deck-meta {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}
	.deck-level-pill {
		background: var(--brand-primary);
		color: #fff;
		padding: 2px 8px;
		border-radius: 6px;
		font-weight: 700;
		font-size: 11px;
		text-transform: uppercase;
	}
	.deck-count {
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-tertiary);
	}
	.deck-preview-title {
		font-weight: 800;
		font-size: 18px;
		line-height: 1.3;
		color: var(--sumi);
	}
	.deck-arrow-wrap {
		position: absolute;
		bottom: 24px;
		right: 24px;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--ink-100);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-tertiary);
		transition: all 300ms var(--ease-brand);
		opacity: 0;
		transform: scale(0.8);
	}
	.deck-preview-card:hover .deck-arrow-wrap {
		opacity: 1;
		transform: scale(1);
		background: var(--brand-primary);
		color: #fff;
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
		padding: 40px 32px;
		border-radius: 32px;
		text-align: center;
		border: 1px solid var(--ink-200);
		box-shadow: var(--shadow-md);
		transition: all 400ms var(--ease-brand);
	}
	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--brand-primary);
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
		gap: 24px;
	}
	.feature-item {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		border-radius: 56px;
		overflow: hidden;
		min-height: 600px;
		box-shadow: var(--shadow-md);
		border: 1px solid rgba(0, 0, 0, 0.05);
	}
	:global(.dark) .feature-item {
		border: 1px solid rgba(255, 255, 255, 0.05);
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
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.02),
			0 4px 16px rgba(0, 0, 0, 0.04);
		transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
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
		background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
		border-radius: 48px;
		display: grid;
		grid-template-columns: 1.2fr 0.8fr;
		overflow: hidden;
		min-height: 440px;
		color: #fff;
		box-shadow: var(--shadow-lg);
		border: 1px solid rgba(255, 255, 255, 0.05);
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
		background: #0a0a0a;
		color: #fff;
		padding: 64px 24px 40px;
		position: relative;
		overflow: hidden;
	}
	:global(.dark) .landing-footer {
		background: #050505;
	}
	.landing-footer::after {
		content: '';
		position: absolute;
		bottom: -100px;
		right: -100px;
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, rgba(188, 0, 45, 0.1) 0%, transparent 70%);
		pointer-events: none;
		z-index: 1;
	}
	.footer-grid {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.5fr 1fr 1fr;
		gap: 48px;
		margin-bottom: 48px;
		position: relative;
		z-index: 2;
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
		font-size: 24px;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: #fff;
	}
	.brand-tagline {
		font-size: 15px;
		opacity: 0.6;
		line-height: 1.6;
		margin-bottom: 24px;
		color: #fff;
		max-width: 240px;
	}

	.footer-links-col {
		display: flex;
		flex-direction: column;
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
		color: rgba(255, 255, 255, 0.6);
		text-decoration: none;
		margin-bottom: 14px;
		font-size: 15px;
		transition: all 240ms var(--ease-brand);
	}
	.footer-links-col a:hover {
		color: #fff;
		transform: translateX(4px);
	}

	.kofi-link-badge {
		display: inline-block;
		transition: transform 280ms var(--ease-brand), opacity 200ms;
		opacity: 0.9;
	}
	.kofi-link-badge img {
		height: 40px;
		display: block;
		border-radius: 8px;
	}
	.kofi-link-badge:hover {
		transform: translateX(4px);
		opacity: 1;
	}

	.footer-bottom {
		max-width: 1200px;
		margin: 0 auto;
		padding-top: 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.4);
		position: relative;
		z-index: 2;
	}
	.footer-copy {
		margin: 0;
	}
	.footer-controls {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
	}
	.footer-ctrl-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.05em;
		padding: 6px 10px;
		transition: background 200ms, color 200ms;
		line-height: 1;
	}
	.footer-ctrl-btn:hover {
		background: rgba(255, 255, 255, 0.16);
		color: #fff;
	}

	/* ── RESPONSIVE ── */
	@media (max-width: 900px) {
		.feature-item,
		.final-card {
			grid-template-columns: 1fr;
			text-align: center;
		}
		.footer-grid {
			grid-template-columns: repeat(2, 1fr);
			text-align: left;
			gap: 40px;
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
			padding: 40px 24px;
			background: var(--bg-surface);
			z-index: 10;
			text-align: center;
		}
		.feature-content h3 {
			font-size: 24px;
			font-weight: 900;
			margin-bottom: 12px;
		}
		.feature-content p {
			font-size: 16px;
			color: var(--fg-secondary);
			line-height: 1.5;
		}
		.feature-item {
			min-height: unset;
			display: flex;
			flex-direction: column;
			border-radius: 40px;
			overflow: hidden;
			background: var(--bg-surface) !important; /* Force white/surface base */
			border: 1px solid var(--ink-200);
			margin-bottom: 24px;
		}
		.feature-image {
			order: -1;
			height: 420px;
			width: 100%;
			padding: 0 !important;
			position: relative;
			overflow: hidden;
			background: var(--bg-surface);
		}
		.mockup-mobile-wrapper {
			position: absolute;
			top: 20px;
			left: 50%;
			width: 280px;
			transform: translateX(-50%);
			z-index: 5;
			display: flex;
			justify-content: center;
		}
		.iphone-16-mockup.mini {
			width: 100%;
			margin: 0;
			filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.1));
			backface-visibility: hidden;
			transform: translateZ(0);
		}
		/* Ultra-smooth fade to integrate with title - now theme aware */
		.feature-image::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 160px;
			background: linear-gradient(
				to bottom,
				transparent 0%,
				color-mix(in srgb, var(--bg-surface) 0%, transparent) 20%,
				color-mix(in srgb, var(--bg-surface) 40%, transparent) 50%,
				color-mix(in srgb, var(--bg-surface) 80%, transparent) 80%,
				var(--bg-surface) 100%
			);
			z-index: 10;
			pointer-events: none;
			display: block;
		}
		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 12px;
		}
		.stat-card {
			padding: 20px 12px;
			border-radius: 20px;
		}
		.stat-value {
			font-size: 22px;
		}
		.stat-label {
			font-size: 10px;
		}
		.final-visual {
			height: 200px;
		}
		.final-content {
			padding: 40px;
			align-items: center;
		}
		.final-content h2 {
			font-size: 28px;
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
			align-items: center; /* Ajustado para centrar */
			width: 100%;
			gap: 12px;
			margin: 0 auto 32px;
		}
		.cta-btn {
			width: 100%;
			max-width: 320px; /* Limita el ancho del botón en móvil */
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
			font-size: 28px;
		}
	}
	@media (max-width: 600px) {
		.hero-section {
			padding: calc(60px + env(safe-area-inset-top)) 20px 0;
		}
		.hero-section h1 {
			font-size: clamp(32px, 10vw, 40px); /* Escalado más fluido */
			line-height: 1.1;
		}
		.hero-subtitle {
			font-size: 16px;
			margin-bottom: 32px;
		}

		/* Ajuste de tarjetas flotantes para no ocultarlas en móvil */
		.hero-float-card {
			transform: scale(0.7);
			padding: 8px 12px;
		}
		.hero-float-card.left {
			left: 0;
			top: 15%;
		}
		.hero-float-card.right {
			right: 0;
			bottom: 25%;
		}

		.levels-section h2 {
			font-size: 24px;
			margin-bottom: 24px;
		}
		.levels-grid {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			gap: 8px;
		}
		.level-tag {
			padding: 8px 16px;
		}
		.preview-grid {
			grid-template-columns: 1fr;
			gap: 16px;
		}
		.deck-preview-card {
			flex-direction: row;
			align-items: center;
			gap: 16px;
			padding: 20px;
		}
		.deck-arrow-wrap {
			position: static;
			opacity: 1;
			transform: none;
			flex-shrink: 0;
		}
		.level-card {
			padding: 20px 12px;
		}
		.preview-section {
			padding: 48px 20px;
		}
		.section-header h2 {
			font-size: 28px;
		}
		.feature-content {
			padding: 32px 20px;
		}
		.feature-content h3 {
			font-size: 24px;
		}
		.feature-content p {
			font-size: 15px;
		}
		.feature-item {
			border-radius: 24px;
		}
		.test-card {
			padding: 24px 20px;
		}
		.test-quote {
			font-size: 16px;
		}
		.final-content {
			padding: 40px 20px;
		}
		.final-content h2 {
			font-size: 28px;
		}
		.final-card {
			border-radius: 24px;
		}
		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 8px;
		}
		.stat-card {
			padding: 16px 8px;
		}
		.stat-value {
			font-size: 18px;
		}
		.stat-label {
			font-size: 9px;
			letter-spacing: 0;
		}
		.final-emoji {
			font-size: 80px;
		}
		.landing-footer {
			padding: 32px 16px 24px;
		}
		.footer-grid {
			grid-template-columns: 1fr;
			text-align: center;
			gap: 28px;
			margin-bottom: 28px;
		}
		.footer-links-col {
			align-items: center;
		}
		.footer-links-col h4 {
			margin-bottom: 12px;
		}
		.footer-links-col a {
			margin-bottom: 10px;
		}
		.brand-wrap {
			justify-content: center;
		}
		.brand-tagline {
			margin-left: auto;
			margin-right: auto;
			margin-bottom: 0;
		}
		.footer-bottom {
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 12px;
			padding-top: 16px;
		}
		.iphone-16-mockup {
			max-width: 280px;
			will-change: transform;
			backface-visibility: hidden;
		}
	}

	/* Reduce paint pressure on small viewports */
	@media (max-width: 768px) {
		.hero-float-card {
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
		}
		.hero-blob {
			filter: blur(40px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-float-card,
		.iphone-16-mockup {
			animation: none !important;
			transform: none !important;
		}
	}

	/* Prevent layout shifts */
	.device-frame {
		aspect-ratio: 430 / 932;
	}
	.app-screenshot {
		aspect-ratio: 430 / 932;
		object-fit: cover;
	}

	/* Decorative Blobs */
	.hero-blob {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		z-index: 1;
		pointer-events: none;
		opacity: 0.4;
	}
	.blob-1 {
		width: 400px;
		height: 400px;
		background: rgba(255, 255, 255, 0.15);
		top: -100px;
		left: -100px;
	}
	.blob-2 {
		width: 300px;
		height: 300px;
		background: rgba(188, 0, 45, 0.3);
		bottom: 100px;
		right: -50px;
	}
	:global(.dark) .blob-2 {
		background: rgba(188, 0, 45, 0.15);
	}
</style>
