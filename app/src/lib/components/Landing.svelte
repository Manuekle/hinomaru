<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp, fadeIn, scaleIn, staggerChildren, animateNumber } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import supportImg from '$lib/assets/support.png';
	import {
		BrainIcon,
		PencilEdit01Icon,
		Target01Icon,
		Download02Icon,
		BookOpen01Icon,
		SparklesIcon
	} from '@hugeicons/core-free-icons';
	import AppDownloadDrawer from '$lib/components/AppDownloadDrawer.svelte';

	let { decks = [] } = $props();

	let showDownload = $state(false);
	let isIOS = $state(false);
	let statLearners = $state(0);
	let statWords = $state(0);

	onMount(() => {
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
		animateNumber((v) => (statLearners = v), 10000, { delay: 0.6, duration: 1.2 });
		animateNumber((v) => (statWords = v), 5000, { delay: 0.8, duration: 1.2 });
	});

	const previewDecks = $derived(decks.filter((d: any) => d.level === 'N5').slice(0, 3));

	const stats = [
		{ key: 'landing.stats.learners', valueFn: () => `${(statLearners / 1000).toFixed(statLearners >= 10000 ? 0 : 1)}K+` },
		{ key: 'landing.stats.words', valueFn: () => `${(statWords / 1000).toFixed(statWords >= 5000 ? 0 : 1)},000+` },
		{ key: 'landing.stats.levels', valueFn: () => 'N5 – N1' }
	];
</script>

<div class="landing-root">
	<!-- ════ HERO ════ -->
	<section class="hero">
		<div class="hero-bg-glow"></div>
		<div class="hero-inner">
			<div class="hero-text">
				<div use:fadeUp={{ delay: 0 }} class="hero-badge">
					<span class="badge-dot"></span>
					<span class="label-meta" style="color:var(--hinomaru-red);">{t('landing.hero.label', $locale)}</span>
				</div>

				<h1 use:fadeUp={{ delay: 0.1 }}>
					{t('landing.hero.title', $locale).split(',')[0]},<br />
					<span class="hero-gradient">{t('landing.hero.title', $locale).split(',')[1]?.trim() || ''}</span>
				</h1>

				<p use:fadeUp={{ delay: 0.2 }} class="hero-desc">
					{t('landing.hero.desc', $locale)}
				</p>

				<div use:fadeUp={{ delay: 0.3 }} class="hero-actions">
					<a href="/login" class="cta-btn">
						<span class="cta-glow"></span>
						{t('landing.cta', $locale)}
					</a>
					{#if isIOS}
						<button onclick={() => (showDownload = true)} class="dl-btn">
							<Icon icon={Download02Icon} size={20} strokeWidth={1.5} />
							Descargar app
						</button>
					{/if}
				</div>

				<!-- Stats -->
				<div use:fadeUp={{ delay: 0.5 }} class="stats-row">
					{#each stats as stat (stat.key)}
						<div class="stat-item">
							<div class="stat-value">{stat.valueFn()}</div>
							<div class="stat-label">{t(stat.key, $locale)}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Hero visual -->
			<div use:fadeIn={{ delay: 0.4 }} class="hero-visual">
				<div class="hero-circle-deco"></div>
				<div class="hero-img-wrap">
					<img src="/landing_hero.png" alt="Hinomaru" />
					<div use:fadeUp={{ delay: 0.8, y: 10 }} class="float-card">
						<span class="float-jp">あ</span>
						<div>
							<div class="float-title">{t('landing.hero.dailyGoal', $locale)}</div>
							<div class="hm-progress" style="width:80px;height:6px;margin-top:4px;">
								<div class="hm-progress-bar" style="width:75%;"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ════ FEATURES ════ -->
	<section class="features-section">
		<div class="section-header">
			<span class="label-meta" style="color:var(--hinomaru-red);letter-spacing:0.1em;">ESTUDIO INTELIGENTE</span>
			<h2 use:fadeUp>{t('landing.features.title', $locale)}</h2>
		</div>

		<div class="features-grid" use:staggerChildren={{ delay: 0.1, stagger: 0.12 }}>
			<div class="feature-card">
				<div class="feature-icon feature-icon-red">
					<Icon icon={BookOpen01Icon} size={28} color="#fff" />
				</div>
				<h3>{t('landing.immersion.title', $locale)}</h3>
				<p>{t('landing.immersion.desc', $locale)}</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon feature-icon-dark">
					<Icon icon={SparklesIcon} size={28} color="#fff" />
				</div>
				<h3>{t('landing.gamification.title', $locale)}</h3>
				<p>{t('landing.gamification.desc', $locale)}</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon feature-icon-dark">
					<Icon icon={BrainIcon} size={28} color="#fff" />
				</div>
				<h3>{t('landing.srs.title', $locale)}</h3>
				<p>{t('landing.srs.desc', $locale)}</p>
			</div>
		</div>

		<div use:fadeUp={{ delay: 0.4 }} class="streak-demo">
			<span class="streak-emoji">🔥</span>
			<span class="streak-text">{t('home.streak', $locale).replace('{n}', '15')}</span>
		</div>
	</section>

	<!-- ════ DECK PREVIEW ════ -->
	{#if previewDecks.length > 0}
		<section class="preview-section">
			<div class="section-header">
				<span class="label-meta" style="opacity:0.5;">CURRÍCULO JLPT</span>
				<h2>{t('landing.preview.title', $locale)}</h2>
			</div>

			<div class="decks-list" use:staggerChildren={{ delay: 0.1, stagger: 0.08 }}>
				{#each previewDecks as deck (deck.id)}
					<a href="/login" class="deck-row">
						<span class="deck-lvl">{deck.level}</span>
						<div class="deck-info">
							<h4>{$locale === 'es' ? deck.title_es || deck.title_en : deck.title_en}</h4>
							<p>{deck.card_count} {t('home.cards', $locale).split(' ')[1]}</p>
						</div>
						<Icon icon={Target01Icon} size={20} color="var(--fg-tertiary)" />
					</a>
				{/each}
			</div>

			<div style="text-align:center;margin-top:40px;">
				<a href="/login" class="preview-link">{t('landing.preview.all', $locale)}</a>
			</div>
		</section>
	{/if}

	<!-- ════ TESTIMONIAL ════ -->
	<section class="testimonial-section">
		<div class="testimonial-card" use:fadeUp>
			<div class="quote-mark">"</div>
			<p class="quote-text">{t('landing.testimonial', $locale)}</p>
			<div class="quote-author">{t('landing.testimonial.author', $locale)}</div>
		</div>
	</section>

	<!-- ════ FINAL CTA ════ -->
	<section class="final-cta">
		<h2 use:fadeUp>{t('home.title', $locale)}</h2>
		<p use:fadeUp>{t('landing.cta.subtitle', $locale)}</p>
		<a href="/login" class="cta-btn cta-btn-lg" use:fadeUp>
			<span class="cta-glow"></span>
			{t('auth.signup', $locale)}
		</a>
		<div class="cta-kofi">
			<a href="https://ko-fi.com/manujsx" target="_blank" rel="noopener noreferrer" class="kofi-img-link">
				<img src={supportImg} alt="Ko-fi" />
			</a>
		</div>
	</section>

	<!-- ════ FOOTER ════ -->
	<footer class="landing-footer">
		<div class="footer-brand">
			<span class="brand-dot"></span>
			<span class="brand-name">Hinomaru</span>
		</div>
		<nav class="footer-nav">
			<a href="/terms">{t('terms.title', $locale)}</a>
			<a href="/privacy">{t('privacy.title', $locale)}</a>
			<a href="/contact">{t('contact.title', $locale)}</a>
			<a href="https://ko-fi.com/manujsx" target="_blank" rel="noopener noreferrer">Ko-fi</a>
		</nav>
		<div class="footer-copy">© 2026 Hinomaru 日の丸. {t('landing.footer.crafted', $locale)}</div>
	</footer>
</div>

<AppDownloadDrawer bind:open={showDownload} />

<style>
	/* ── Root ── */
	.landing-root {
		min-height: 100vh;
		background: var(--paper);
		overflow-x: hidden;
		padding-bottom: env(safe-area-inset-bottom);
	}

	/* ── HERO ── */
	.hero {
		position: relative;
		padding: calc(80px + env(safe-area-inset-top)) 24px 80px;
		max-width: 1100px;
		margin: 0 auto;
		overflow: hidden;
	}
	.hero-bg-glow {
		position: absolute;
		top: -120px;
		right: -200px;
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, rgba(188, 0, 45, 0.06) 0%, transparent 70%);
		pointer-events: none;
		z-index: 0;
	}
	.hero-inner {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: 60px;
		align-items: center;
	}
	.hero-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 20px;
	}
	.badge-dot {
		width: 10px;
		height: 10px;
		background: var(--hinomaru-red);
		border-radius: 50%;
		animation: pulse-dot 2s ease-in-out infinite;
	}
	@keyframes pulse-dot {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.6; transform: scale(1.3); }
	}
	.hero h1 {
		font-size: clamp(40px, 7vw, 68px);
		font-weight: 800;
		letter-spacing: -0.04em;
		line-height: 0.95;
		margin: 0 0 24px;
		color: var(--sumi);
	}
	.hero-gradient {
		background: linear-gradient(90deg, var(--hinomaru-red), #ff4d4d);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	.hero-desc {
		font-size: 18px;
		color: var(--fg-secondary);
		line-height: 1.6;
		margin-bottom: 40px;
		max-width: 500px;
	}
	.hero-actions {
		display: flex;
		gap: 16px;
		align-items: center;
		flex-wrap: wrap;
	}

	/* CTA Button */
	.cta-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 60px;
		padding: 0 40px;
		font-size: 17px;
		font-weight: 700;
		font-family: var(--font-ui);
		color: #fff;
		background: var(--hinomaru-red);
		border: none;
		border-radius: 16px;
		text-decoration: none;
		cursor: pointer;
		overflow: hidden;
		transition: transform 150ms ease, box-shadow 200ms ease;
		box-shadow: 0 8px 28px rgba(188, 0, 45, 0.3);
		-webkit-tap-highlight-color: transparent;
	}
	.cta-glow {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
		transform: translateX(-100%);
		animation: shimmer 3s ease-in-out infinite;
	}
	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		60%, 100% { transform: translateX(100%); }
	}
	@media (hover: hover) {
		.cta-btn:hover {
			transform: translateY(-2px);
			box-shadow: 0 12px 36px rgba(188, 0, 45, 0.4);
		}
	}
	.cta-btn:active { transform: scale(0.98); }
	.cta-btn-lg {
		height: 64px;
		padding: 0 56px;
		font-size: 18px;
		border-radius: 18px;
	}

	.dl-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		height: 60px;
		padding: 0 28px;
		font-size: 17px;
		font-weight: 600;
		font-family: var(--font-ui);
		color: var(--fg-primary);
		background: transparent;
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		cursor: pointer;
		transition: all 180ms ease;
		-webkit-tap-highlight-color: transparent;
	}
	@media (hover: hover) {
		.dl-btn:hover { border-color: var(--sumi); }
	}

	/* Stats */
	.stats-row {
		display: flex;
		gap: 36px;
		margin-top: 56px;
	}
	.stat-item { text-align: left; }
	.stat-value {
		font-size: 22px;
		font-weight: 800;
		color: var(--sumi);
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
	}
	.stat-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		margin-top: 2px;
	}

	/* Hero visual */
	.hero-visual { position: relative; }
	.hero-circle-deco {
		position: absolute;
		top: -10%;
		right: -10%;
		width: 300px;
		height: 300px;
		background: var(--hinomaru-red);
		border-radius: 50%;
		opacity: 0.04;
		filter: blur(60px);
	}
	.hero-img-wrap {
		position: relative;
		z-index: 1;
	}
	.hero-img-wrap img {
		width: 100%;
		border-radius: 32px;
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--ink-200);
	}
	.float-card {
		position: absolute;
		bottom: 20px;
		left: -30px;
		background: var(--bg-surface);
		padding: 14px 22px;
		border-radius: 18px;
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		gap: 12px;
		z-index: 10;
		animation: float-y 4s ease-in-out infinite;
	}
	@keyframes float-y {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}
	.float-jp { font-size: 24px; }
	.float-title { font-size: 12px; font-weight: 700; color: var(--fg-primary); }

	/* ── FEATURES ── */
	.features-section {
		padding: 100px 24px;
		max-width: 1100px;
		margin: 0 auto;
	}
	.section-header {
		text-align: center;
		margin-bottom: 64px;
	}
	.section-header h2 {
		font-size: clamp(28px, 5vw, 44px);
		font-weight: 800;
		letter-spacing: -0.03em;
		color: var(--sumi);
		margin-top: 12px;
	}
	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
	}
	.feature-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		padding: 36px 28px;
		text-align: center;
		box-shadow: var(--shadow-sm);
		transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease, border-color 300ms ease;
	}
	@media (hover: hover) {
		.feature-card:hover {
			transform: translateY(-6px);
			box-shadow: var(--shadow-lg);
			border-color: var(--ink-300);
		}
	}
	.feature-icon {
		width: 56px;
		height: 56px;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20px;
	}
	.feature-icon-red {
		background: linear-gradient(135deg, var(--hinomaru-red), #e84057);
		box-shadow: 0 6px 20px rgba(188, 0, 45, 0.2);
	}
	.feature-icon-dark {
		background: linear-gradient(135deg, var(--sumi), #3a3a3a);
		box-shadow: 0 6px 20px rgba(26, 26, 26, 0.15);
	}
	.feature-card h3 {
		font-size: 18px;
		font-weight: 700;
		color: var(--sumi);
		margin: 0 0 12px;
	}
	.feature-card p {
		font-size: 14px;
		color: var(--fg-secondary);
		line-height: 1.6;
		margin: 0;
	}

	.streak-demo {
		margin-top: 64px;
		text-align: center;
	}
	.streak-demo > * {
		display: inline-flex;
		align-items: center;
		gap: 14px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		padding: 14px 28px;
		border-radius: 99px;
		box-shadow: var(--shadow-sm);
	}
	.streak-emoji { font-size: 26px; }
	.streak-text { font-weight: 800; color: var(--sumi); font-size: 17px; }

	/* ── PREVIEW ── */
	.preview-section {
		padding: 100px 24px;
		max-width: 800px;
		margin: 0 auto;
	}
	.decks-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 600px;
		margin: 0 auto;
	}
	.deck-row {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 18px 22px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		text-decoration: none;
		color: inherit;
		transition: all 200ms ease;
	}
	@media (hover: hover) {
		.deck-row:hover {
			border-color: var(--sumi);
			transform: translateX(4px);
		}
	}
	.deck-lvl {
		font-weight: 600;
		color: var(--hinomaru-red);
		font-size: 16px;
		min-width: 36px;
	}
	.deck-info { flex: 1; }
	.deck-info h4 { margin: 0; font-size: 16px; font-weight: 700; color: var(--sumi); }
	.deck-info p { margin: 3px 0 0; font-size: 13px; color: var(--fg-tertiary); }
	.preview-link {
		font-size: 15px;
		font-weight: 700;
		color: var(--hinomaru-red);
		text-decoration: none;
		border-bottom: 1.5px solid var(--hinomaru-red);
		padding-bottom: 2px;
		transition: opacity 200ms;
	}
	@media (hover: hover) { .preview-link:hover { opacity: 0.7; } }

	/* ── TESTIMONIAL ── */
	.testimonial-section {
		padding: 80px 24px;
		display: flex;
		justify-content: center;
	}
	.testimonial-card {
		max-width: 640px;
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		padding: 48px 40px;
		text-align: center;
		box-shadow: var(--shadow-md);
		position: relative;
	}
	.quote-mark {
		font-size: 72px;
		font-weight: 800;
		color: var(--hinomaru-red);
		opacity: 0.15;
		line-height: 0.8;
		position: absolute;
		top: 24px;
		left: 32px;
		font-family: Georgia, serif;
	}
	.quote-text {
		font-size: 19px;
		font-weight: 500;
		line-height: 1.6;
		color: var(--sumi);
		font-style: italic;
		margin: 0 0 24px;
		position: relative;
	}
	.quote-author {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
	}

	/* ── FINAL CTA ── */
	.final-cta {
		padding: 100px 24px;
		text-align: center;
		background: var(--sumi);
		color: var(--washi);
	}
	.final-cta h2 {
		font-size: clamp(32px, 6vw, 44px);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 12px;
		color: var(--washi);
	}
	.final-cta p {
		font-size: 17px;
		color: var(--ink-400);
		margin: 0 0 40px;
	}
	.cta-kofi {
		margin-top: 40px;
		padding-top: 32px;
		border-top: 1px solid rgba(255,255,255,0.1);
		display: flex;
		justify-content: center;
	}
	.kofi-img-link { display: inline-block; transition: transform 200ms; }
	.kofi-img-link img { height: 40px; width: auto; }
	@media (hover: hover) { .kofi-img-link:hover { transform: scale(1.05); } }

	/* ── FOOTER ── */
	.landing-footer {
		padding: 48px 24px;
		text-align: center;
		border-top: 1px solid var(--ink-100);
		background: var(--bg-surface);
	}
	.footer-brand {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
	}
	.brand-dot { width: 10px; height: 10px; background: var(--hinomaru-red); border-radius: 50%; }
	.brand-name { font-weight: 700; font-size: 18px; color: var(--sumi); }
	.footer-nav {
		display: flex;
		justify-content: center;
		gap: 24px;
		flex-wrap: wrap;
		margin-bottom: 20px;
	}
	.footer-nav a {
		font-size: 14px;
		color: var(--fg-tertiary);
		text-decoration: none;
		transition: color 200ms;
	}
	@media (hover: hover) { .footer-nav a:hover { color: var(--sumi); } }
	.footer-copy { font-size: 12px; color: var(--fg-tertiary); }

	/* ── RESPONSIVE ── */
	@media (max-width: 900px) {
		.hero-inner { grid-template-columns: 1fr !important; text-align: center; gap: 40px !important; }
		.hero { padding-top: calc(60px + env(safe-area-inset-top)) !important; }
		.features-grid { grid-template-columns: 1fr; gap: 20px; }
		.stats-row { justify-content: center !important; gap: 24px !important; }
		.hero-actions { justify-content: center !important; }
		.hero-desc { margin-left: auto; margin-right: auto; }
		.float-card { left: 50% !important; transform: translateX(-50%) !important; bottom: -16px !important; animation: none; }
		.features-section, .preview-section { padding: 60px 24px !important; }
	}
	@media (max-width: 640px) {
		.hero h1 { font-size: 36px !important; }
		.hero-desc { font-size: 16px !important; }
		.stats-row { flex-wrap: wrap; gap: 20px !important; }
		.hero-actions { flex-direction: column; width: 100%; }
		.cta-btn, .dl-btn { width: 100%; justify-content: center; }
		.feature-card { padding: 28px 20px; }
		.deck-row { padding: 14px 16px; gap: 14px; }
		.testimonial-card { padding: 36px 24px; }
		.quote-text { font-size: 16px; }
		.final-cta h2 { font-size: 28px !important; }
		.hero-img-wrap img { border-radius: 20px; }
	}
	@media (max-width: 480px) {
		.stats-row { display: grid; grid-template-columns: 1fr 1fr; }
		.stats-row .stat-item:last-child { grid-column: span 2; text-align: center; }
		.footer-nav { flex-direction: column; gap: 12px; }
	}
</style>
