<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp, fadeIn } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import SupportKofi from '$lib/components/SupportKofi.svelte';
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

	onMount(() => {
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
	});

	// Select a few N5 decks for preview
	const previewDecks = $derived(decks.filter((d: any) => d.level === 'N5').slice(0, 3));

	const features = [
		{ id: 'srs', icon: BrainIcon, key: 'mode.flashcards' },
		{ id: 'write', icon: PencilEdit01Icon, key: 'mode.write' },
		{ id: 'quiz', icon: Target01Icon, key: 'mode.quiz' }
	];

	const stats = [
		{ key: 'landing.stats.learners', value: '10K+' },
		{ key: 'landing.stats.words', value: '5,000+' },
		{ key: 'landing.stats.levels', value: 'N5 - N1' }
	];
</script>

<div
	style="min-height:100vh; background:var(--paper); overflow-x:hidden; padding-bottom:env(safe-area-inset-bottom);"
>
	<!-- Hero Section -->
	<section
		class="hero-section"
		style="padding:calc(80px + env(safe-area-inset-top)) 24px 60px; max-width:1100px; margin:0 auto; display:grid; grid-template-columns: 1.1fr 0.9fr; gap:60px; align-items:center;"
	>
		<div>
			<div
				use:fadeUp={{ delay: 0 }}
				style="display:flex; align-items:center; gap:8px; margin-bottom:20px;"
			>
				<span style="width:12px; height:12px; background:var(--hinomaru-red); border-radius:50%;"
				></span>
				<span class="label-meta" style="color:var(--hinomaru-red);"
					>{t('landing.hero.label', $locale)}</span
				>
			</div>
			<h1
				use:fadeUp={{ delay: 0.1 }}
				style="font-size:clamp(44px, 8vw, 72px); font-weight:800; letter-spacing:-0.04em; line-height:0.9; margin:0 0 24px;"
			>
				{t('landing.hero.title', $locale).split(',')[0]}, <br />
				<span
					style="background: linear-gradient(90deg, var(--hinomaru-red), #FF4D4D); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
					>{t('landing.hero.title', $locale).split(',')[1]?.trim() || ''}</span
				>
			</h1>
			<p
				use:fadeUp={{ delay: 0.2 }}
				style="font-size:20px; color:var(--fg-secondary); line-height:1.5; margin-bottom:44px; max-width:520px;"
			>
				{t('landing.hero.desc', $locale)}
			</p>
			<div
				use:fadeUp={{ delay: 0.3 }}
				class="hero-btns"
				style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;"
			>
				<a
					href="/login"
					class="hm-btn hm-btn-primary hm-btn-lg"
					style="padding:0 44px; height:64px; font-size:18px; display:inline-flex; align-items:center; box-shadow:0 12px 32px rgba(188,0,45,0.25);"
				>
					{t('landing.cta', $locale)}
				</a>
				{#if isIOS}
					<button
						onclick={() => (showDownload = true)}
						class="hm-btn hm-btn-ghost hm-btn-lg download-btn"
						style="padding:0 32px; height:64px; font-size:18px; display:inline-flex; align-items:center; gap:10px; border:1.5px solid var(--ink-200);"
					>
						<Icon icon={Download02Icon} size={20} strokeWidth={1.5} />
						Descargar app
					</button>
				{/if}
			</div>

			<!-- Stats row -->
			<div
				use:fadeUp={{ delay: 0.5 }}
				class="stats"
				style="display:flex; gap:40px; margin-top:60px;"
			>
				{#each stats as stat (stat.key)}
					<div>
						<div style="font-size:24px; font-weight:800; color:var(--sumi);">{stat.value}</div>
						<div class="label-meta" style="font-size:11px; opacity:0.6;">
							{t(stat.key, $locale)}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div use:fadeIn={{ delay: 0.4 }} style="position:relative;">
			<!-- Decorative background circles -->
			<div
				style="position:absolute; top:-10%; right:-10%; width:300px; height:300px; background:var(--hinomaru-red); border-radius:50%; opacity:0.03; filter:blur(60px);"
			></div>

			<div style="position:relative; z-index:1;">
				<img
					src="/landing_hero.png"
					alt="Hinomaru Study Environment"
					style="width:100%; border-radius:40px; box-shadow:var(--shadow-lg); border:1px solid var(--ink-200);"
				/>
				<!-- Floating UI preview cards -->
				<div
					use:fadeUp={{ delay: 0.8, y: 10 }}
					class="daily-goal-card"
					style="position:absolute; bottom:20px; left:-30px; background:var(--bg-surface); padding:16px 24px; border-radius:20px; box-shadow:var(--shadow-lg); border:1px solid var(--ink-200); display:flex; align-items:center; gap:12px; z-index:10;"
				>
					<span style="font-size:24px;">あ</span>
					<div style="text-align:left;">
						<div style="font-size:12px; font-weight:700;">
							{t('landing.hero.dailyGoal', $locale)}
						</div>
						<div class="hm-progress" style="width:80px; height:6px; margin-top:4px;">
							<div class="hm-progress-bar" style="width:75%;"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Experience Section (Refined) -->
	<section class="info-section" style="padding:100px 24px; max-width:1100px; margin:0 auto;">
		<div style="text-align:center; margin-bottom:80px;">
			<div
				class="label-meta"
				style="color:var(--hinomaru-red); margin-bottom:16px; letter-spacing:0.1em;"
			>
				ESTUDIO INTELIGENTE
			</div>
			<h2
				use:fadeUp
				style="font-size:clamp(32px, 5vw, 48px); font-weight:800; letter-spacing:-0.04em;"
			>
				{t('landing.features.title', $locale)}
			</h2>
		</div>

		<div class="experience-grid">
			<div use:fadeUp={{ delay: 0.1 }} class="experience-card">
				<div class="minimal-icon-box">
					<Icon icon={BookOpen01Icon} size={28} color="var(--hinomaru-red)" />
				</div>
				<h3>{t('landing.immersion.title', $locale)}</h3>
				<p>{t('landing.immersion.desc', $locale)}</p>
			</div>
			<div use:fadeUp={{ delay: 0.2 }} class="experience-card">
				<div class="minimal-icon-box">
					<Icon icon={SparklesIcon} size={28} color="var(--sumi)" />
				</div>
				<h3>{t('landing.gamification.title', $locale)}</h3>
				<p>{t('landing.gamification.desc', $locale)}</p>
			</div>
			<div use:fadeUp={{ delay: 0.3 }} class="experience-card">
				<div class="minimal-icon-box"><Icon icon={BrainIcon} size={28} color="var(--sumi)" /></div>
				<h3>{t('landing.srs.title', $locale)}</h3>
				<p>{t('landing.srs.desc', $locale)}</p>
			</div>
		</div>

		<!-- Simplified Streak Preview -->
		<div use:fadeUp={{ delay: 0.4 }} style="margin-top:80px; text-align:center;">
			<div
				style="display:inline-flex; align-items:center; gap:16px; background:var(--bg-surface); border:1px solid var(--ink-200); padding:16px 32px; border-radius:100px; box-shadow:var(--shadow-sm);"
			>
				<span style="font-size:28px;">🔥</span>
				<span style="font-weight:800; color:var(--sumi); font-size:18px;">
					{t('home.streak', $locale).replace('{n}', '15')}
				</span>
			</div>
		</div>
	</section>

	<!-- Simplified Deck Preview -->
	{#if previewDecks.length > 0}
		<section style="padding:100px 24px; max-width:800px; margin:0 auto;">
			<div style="text-align:center; margin-bottom:48px;">
				<div class="label-meta" style="margin-bottom:12px; opacity:0.5;">CURRÍCULO JLPT</div>
				<h2 style="font-size:32px; font-weight:800; letter-spacing:-0.02em;">
					{t('landing.preview.title', $locale)}
				</h2>
			</div>

			<div class="decks-list">
				{#each previewDecks as deck (deck.id)}
					<a href="/login" class="deck-item-minimal">
						<span class="deck-level">{deck.level}</span>
						<div class="deck-info">
							<h4>{$locale === 'es' ? deck.title_es || deck.title_en : deck.title_en}</h4>
							<p>{deck.card_count} {t('home.cards', $locale).split(' ')[1]}</p>
						</div>
						<Icon icon={Target01Icon} size={20} color="var(--fg-tertiary)" />
					</a>
				{/each}
			</div>

			<div style="text-align:center; margin-top:40px;">
				<a href="/login" class="preview-all-link">
					{t('landing.preview.all', $locale)}
				</a>
			</div>
		</section>
	{/if}

	<!-- Testimonial (Clean) -->
	<section style="padding:100px 24px; text-align:center; background:rgba(0,0,0,0.015);">
		<div style="max-width:700px; margin:0 auto;">
			<p
				style="font-size:22px; font-weight:500; line-height:1.6; color:var(--sumi); font-style:italic;"
			>
				"{t('landing.testimonial', $locale)}"
			</p>
			<div class="label-meta" style="color:var(--hinomaru-red); margin-top:32px; font-size:12px;">
				{t('landing.testimonial.author', $locale)}
			</div>
		</div>
	</section>

	<!-- Minimal Final CTA -->
	<section style="padding:120px 24px; text-align:center;">
		<h2
			use:fadeUp
			style="font-size:42px; font-weight:800; margin-bottom:16px; letter-spacing:-0.03em;"
		>
			{t('home.title', $locale)}
		</h2>
		<p use:fadeUp style="font-size:18px; color:var(--fg-secondary); margin-bottom:48px;">
			{t('landing.cta.subtitle', $locale)}
		</p>

		<div style="display:flex; flex-direction:column; align-items:center; gap:32px;">
			<a
				href="/login"
				class="hm-btn hm-btn-primary hm-btn-lg"
				style="padding:0 60px; height:64px; font-size:18px; box-shadow:var(--shadow-lg);"
			>
				{t('auth.signup', $locale)}
			</a>

			<div
				style="display:flex; align-items:center; gap:24px; border-top:1px solid var(--ink-100); padding-top:32px; width:100%; max-width:400px; justify-content:center;"
			>
				<a
					href="https://ko-fi.com/manujsx"
					target="_blank"
					rel="noopener noreferrer"
					class="kofi-link"
				>
					<img src={supportImg} alt="Support on Ko-fi" style="height:40px; width:auto;" />
				</a>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="landing-footer">
		<div class="footer-brand">
			<span class="brand-dot"></span>
			<span class="brand-name">Hinomaru</span>
		</div>
		<div class="footer-links">
			<a href="/terms">{t('terms.title', $locale)}</a>
			<a href="/privacy">{t('privacy.title', $locale)}</a>
			<a href="/contact">{t('contact.title', $locale)}</a>
			<a href="https://ko-fi.com/manujsx" target="_blank" rel="noopener noreferrer">Ko-fi</a>
		</div>
		<div class="footer-copyright">
			© 2026 Hinomaru 日の丸. {t('landing.footer.crafted', $locale)}
		</div>
	</footer>
</div>

<AppDownloadDrawer bind:open={showDownload} />

<style>
	.download-btn {
		display: inline-flex;
	}
	.experience-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 32px;
		text-align: center;
	}
	.experience-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 32px;
		padding: 40px 32px;
		box-shadow: var(--shadow-sm);
		transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}
	@media (hover: hover) {
		.experience-card:hover {
			transform: translateY(-8px);
			border-color: var(--sumi);
			box-shadow: var(--shadow-lg);
		}
	}
	.experience-grid h3 {
		font-size: 20px;
		font-weight: 400;
		margin: 24px 0 16px;
		color: var(--sumi);
	}
	.experience-grid p {
		font-size: 16px;
		color: var(--fg-secondary);
		line-height: 1.6;
	}
	.minimal-icon-box {
		width: 54px;
		height: 54px;
		background: var(--paper);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
	}

	.decks-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 600px;
		margin: 0 auto;
	}
	.deck-item-minimal {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 20px 24px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		text-decoration: none;
		transition: all 0.2s ease;
	}
	@media (hover: hover) {
		.deck-item-minimal:hover {
			border-color: var(--sumi);
			transform: translateX(4px);
		}
	}
	.deck-level {
		font-weight: 400;
		color: var(--hinomaru-red);
		font-size: 18px;
		min-width: 40px;
	}
	.deck-info {
		flex: 1;
	}
	.deck-info h4 {
		margin: 0;
		font-size: 17px;
		font-weight: 700;
		color: var(--sumi);
	}
	.deck-info p {
		margin: 4px 0 0;
		font-size: 13px;
		color: var(--fg-tertiary);
	}

	.landing-footer {
		padding: 60px 24px;
		text-align: center;
		border-top: 1px solid var(--ink-100);
		background: var(--bg-surface);
	}

	.footer-brand {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		margin-bottom: 20px;
	}

	.brand-dot {
		width: 10px;
		height: 10px;
		background: var(--hinomaru-red);
		border-radius: 50%;
	}

	.brand-name {
		font-weight: 700;
		font-size: 18px;
		color: var(--sumi);
	}

	.footer-links {
		font-size: 14px;
		color: var(--fg-tertiary);
		display: flex;
		justify-content: center;
		gap: 24px;
		margin-bottom: 24px;
		flex-wrap: wrap;
	}

	.footer-links a {
		color: inherit;
		text-decoration: none;
		transition: color 0.2s;
	}

	@media (hover: hover) {
		.footer-links a:hover {
			color: var(--sumi);
		}
	}

	.footer-copyright {
		font-size: 12px;
		color: var(--fg-tertiary);
	}

	@media (max-width: 900px) {
		.hero-section {
			grid-template-columns: 1fr !important;
			text-align: center;
			gap: 48px !important;
			padding-top: calc(60px + env(safe-area-inset-top)) !important;
		}
		.experience-grid {
			grid-template-columns: 1fr;
			gap: 60px;
		}
		.stats {
			justify-content: center !important;
			gap: 24px !important;
		}
		.hero-btns {
			justify-content: center !important;
		}
		section {
			padding: 60px 24px !important;
		}
		h2 {
			font-size: 32px !important;
		}
		.daily-goal-card {
			left: 50% !important;
			transform: translateX(-50%) !important;
			bottom: -20px !important;
		}
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 40px !important;
		}
		h2 {
			font-size: 28px !important;
		}
		p {
			font-size: 16px !important;
		}
		.stats {
			flex-wrap: wrap;
			justify-content: center;
			gap: 20px !important;
		}
		.hero-btns {
			flex-direction: column;
			width: 100%;
		}
		.hm-btn {
			width: 100% !important;
			justify-content: center;
		}
		.footer-links {
			gap: 16px;
		}
		.experience-card {
			padding: 32px 20px;
		}
		.deck-item-minimal {
			padding: 16px;
			gap: 16px;
		}
		.hero-section img {
			border-radius: 24px !important;
		}
	}

	@media (max-width: 480px) {
		.stats {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 16px !important;
		}
		.stats > div:last-child {
			grid-column: span 2;
		}
		.footer-links {
			flex-direction: column;
			gap: 12px;
		}
		.landing-footer {
			padding: 40px 24px;
		}
	}

	.preview-all-link {
		font-size: 15px;
		font-weight: 700;
		color: var(--hinomaru-red);
		text-decoration: none;
		border-bottom: 1.5px solid var(--hinomaru-red);
		padding-bottom: 2px;
		transition: opacity 0.2s;
	}
	@media (hover: hover) {
		.preview-all-link:hover {
			opacity: 0.7;
		}
	}

	.kofi-link {
		transition: transform 0.2s;
		display: inline-block;
	}
	@media (hover: hover) {
		.kofi-link:hover {
			transform: scale(1.05);
		}
	}
</style>
