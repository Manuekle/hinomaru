<script lang="ts">
	import { fadeUp, fadeIn } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import SupportKofi from '$lib/components/SupportKofi.svelte';
	import supportImg from '$lib/assets/support.png';

	let { decks = [] } = $props();

	// Select a few N5 decks for preview
	const previewDecks = $derived(decks.filter((d: any) => d.level === 'N5').slice(0, 3));

	const features = [
		{ id: 'srs', icon: '🧠', key: 'mode.flashcards' },
		{ id: 'write', icon: '✍️', key: 'mode.write' },
		{ id: 'quiz', icon: '🎯', key: 'mode.quiz' }
	];

	const stats = [
		{ key: 'landing.stats.learners', value: '10K+' },
		{ key: 'landing.stats.words', value: '5,000+' },
		{ key: 'landing.stats.levels', value: 'N5 - N1' }
	];
</script>

<div style="min-height:100vh; background:var(--paper); overflow-x:hidden; padding-bottom:env(safe-area-inset-bottom);">
	<!-- Hero Section -->
	<section
		class="hero-section"
		style="padding:calc(80px + env(safe-area-inset-top)) 24px 60px; max-width:1100px; margin:0 auto; display:grid; grid-template-columns: 1.1fr 0.9fr; gap:60px; align-items:center;"
	>
		<div>
			<div use:fadeUp={{ delay: 0 }} style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
				<span style="width:12px; height:12px; background:var(--hinomaru-red); border-radius:50%;"></span>
				<span class="label-meta" style="color:var(--hinomaru-red);">{t('landing.hero.label', $locale)}</span>
			</div>
			<h1
				use:fadeUp={{ delay: 0.1 }}
				style="font-size:clamp(44px, 8vw, 72px); font-weight:800; letter-spacing:-0.04em; line-height:0.9; margin:0 0 24px;"
			>
				{t('landing.hero.title', $locale).split(',')[0]}, <br />
				<span style="background: linear-gradient(90deg, var(--hinomaru-red), #FF4D4D); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">{t('landing.hero.title', $locale).split(',')[1]?.trim() || ''}</span>
			</h1>
			<p
				use:fadeUp={{ delay: 0.2 }}
				style="font-size:20px; color:var(--fg-secondary); line-height:1.5; margin-bottom:44px; max-width:520px;"
			>
				{t('landing.hero.desc', $locale)}
			</p>
			<div use:fadeUp={{ delay: 0.3 }} class="hero-btns" style="display:flex; gap:16px; align-items:center;">
				<a
					href="/login"
					class="hm-btn hm-btn-primary hm-btn-lg"
					style="padding:0 44px; height:64px; font-size:18px; display:inline-flex; align-items:center; box-shadow:0 12px 32px rgba(188,0,45,0.25);"
				>
					{t('landing.cta', $locale)}
				</a>
			</div>

			<!-- Stats row -->
			<div use:fadeUp={{ delay: 0.5 }} class="stats" style="display:flex; gap:40px; margin-top:60px;">
				{#each stats as stat (stat.key)}
					<div>
						<div style="font-size:24px; font-weight:800; color:var(--sumi);">{stat.value}</div>
						<div class="label-meta" style="font-size:11px; opacity:0.6;">{t(stat.key, $locale)}</div>
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
					style="position:absolute; bottom:20px; left:-30px; background:var(--bg-surface); padding:16px 24px; border-radius:20px; box-shadow:var(--shadow-lg); border:1px solid var(--ink-200); display:flex; align-items:center; gap:12px;"
				>
					<span style="font-size:24px;">あ</span>
					<div>
						<div style="font-size:12px; font-weight:700;">{t('landing.hero.dailyGoal', $locale)}</div>
						<div class="hm-progress" style="width:80px; height:6px; margin-top:4px;">
							<div class="hm-progress-bar" style="width:75%;"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Grid -->
	<section style="padding:60px 24px; max-width:1100px; margin:0 auto; background:rgba(0,0,0,0.02); border-radius:48px; margin-bottom:80px;">
		<div style="text-align:center; margin-bottom:60px;">
			<h2 use:fadeUp style="font-size:36px; font-weight:800; letter-spacing:-0.02em;">{t('landing.features.title', $locale)}</h2>
		</div>
		<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:24px;">
			{#each features as feature, i (feature.key)}
				<div
					use:fadeUp={{ delay: 0.2 + i * 0.1 }}
					role="article"
					style="background:var(--bg-surface); border:1px solid var(--ink-200); border-radius:32px; padding:40px; box-shadow:var(--shadow-sm); transition:transform 200ms ease;"
					onmouseenter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
					onmouseleave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
				>
					<div style="width:64px; height:64px; background:var(--paper); border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:32px; margin-bottom:24px; border:1px solid var(--ink-100);">
						{feature.icon}
					</div>
					<h3 style="font-size:22px; font-weight:700; margin-bottom:16px;">{t(feature.key + '.title', $locale)}</h3>
					<p style="font-size:16px; color:var(--fg-secondary); line-height:1.6; margin:0;">
						{t(feature.key + '.desc', $locale)}
					</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Public Preview Section (SEO) -->
	{#if previewDecks.length > 0}
		<section style="padding:40px 24px 120px; max-width:1100px; margin:0 auto; text-align:center;">
			<div class="label-meta" style="margin-bottom:16px; opacity:0.5;">{t('landing.preview.label', $locale)}</div>
			<h2 use:fadeUp style="font-size:40px; font-weight:800; margin-bottom:48px; letter-spacing:-0.02em;">{t('landing.preview.title', $locale)}</h2>
			<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
				{#each previewDecks as deck (deck.id)}
					<div
						use:fadeUp
						style="background:var(--bg-surface); border:1px solid var(--ink-200); border-radius:28px; padding:24px; text-align:left; position:relative; overflow:hidden;"
					>
						<div style="position:absolute; top:-10px; right:-10px; font-size:80px; opacity:0.03; font-weight:900; pointer-events:none;">
							{deck.level}
						</div>
						<span class="hm-pill hm-pill-red" style="margin-bottom:16px; display:inline-block;">{deck.level}</span>
						<h4 style="font-size:20px; font-weight:700; margin:0;">
							{$locale === 'es' ? (deck.title_es || deck.title_en) : deck.title_en}
						</h4>
						<p style="font-size:15px; color:var(--fg-secondary); margin-top:8px; line-height:1.5;">
							{$locale === 'es' ? (deck.desc_es || deck.desc_en) : deck.desc_en}
						</p>
						<div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
							<span style="font-size:12px; color:var(--fg-tertiary);">{deck.card_count} {t('home.cards', $locale).split(' ')[1]}</span>
							<a href="/login" style="font-size:13px; font-weight:700; color:var(--hinomaru-red); text-decoration:none;">{t('landing.preview.btn', $locale)}</a>
						</div>
					</div>
				{/each}
			</div>
			<div style="margin-top:60px;">
				<a href="/login" style="font-size:18px; color:var(--sumi); font-weight:700; text-decoration:none; border-bottom:2px solid var(--hinomaru-red); padding-bottom:4px;">
					{t('landing.preview.all', $locale)}
				</a>
			</div>
		</section>
	{/if}

	<!-- Testimonial / Social Proof -->
	<section style="padding:100px 24px; background:var(--sumi); color:var(--bg-surface); text-align:center; position:relative;">
		<div style="max-width:800px; margin:0 auto;">
			<div style="font-size:40px; margin-bottom:32px;">"</div>
			<p style="font-size:24px; font-weight:500; line-height:1.6; margin-bottom:32px; font-style:italic;">
				"{t('landing.testimonial', $locale)}"
			</p>
			<div class="label-meta" style="color:var(--hinomaru-red); opacity:1;">{t('landing.testimonial.author', $locale)}</div>
		</div>
	</section>

	<!-- Final CTA -->
	<section style="padding:120px 24px; text-align:center;">
		<h2 use:fadeUp style="font-size:48px; font-weight:800; margin-bottom:24px; letter-spacing:-0.03em;">{t('home.title', $locale)}</h2>
		<p use:fadeUp style="font-size:18px; color:var(--fg-secondary); margin-bottom:48px;">{t('landing.cta.subtitle', $locale)}</p>
		<a
			href="/login"
			class="hm-btn hm-btn-primary hm-btn-lg"
			style="padding:0 50px; height:68px; font-size:20px; box-shadow:0 20px 40px rgba(188,0,45,0.3);"
		>
			{t('auth.signup', $locale)}
		</a>

		<div style="margin-top:40px; max-width:400px; margin-left:auto; margin-right:auto;">
			<a
				href="https://ko-fi.com/manujsx"
				target="_blank"
				rel="noopener noreferrer"
				style="display:inline-block; transition:transform 0.2s;"
				onmouseenter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
				onmouseleave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
			>
				<img src={supportImg} alt="Support on Ko-fi" style="height:48px; width:auto;" />
			</a>
		</div>
	</section>

	<!-- Footer -->
	<footer style="padding:60px 24px; text-align:center; border-top:1px solid var(--ink-100); background:var(--bg-surface);">
		<div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:20px;">
			<span style="width:10px; height:10px; background:var(--hinomaru-red); border-radius:50%;"></span>
			<span style="font-weight:700; font-size:18px;">Hinomaru</span>
		</div>
		<div style="font-size:14px; color:var(--fg-tertiary); display:flex; justify-content:center; gap:24px; margin-bottom:24px;">
			<a href="/terms" style="color:inherit; text-decoration:none;">{t('terms.title', $locale)}</a>
			<a href="/privacy" style="color:inherit; text-decoration:none;">{t('privacy.title', $locale)}</a>
			<a href="/contact" style="color:inherit; text-decoration:none;">{t('contact.title', $locale)}</a>
			<a href="https://ko-fi.com/manujsx" target="_blank" rel="noopener noreferrer" style="color:inherit; text-decoration:none;">Ko-fi</a>
		</div>
		<div style="font-size:12px; color:var(--fg-tertiary);">
			© 2026 Hinomaru 日の丸. {t('landing.footer.crafted', $locale)}
		</div>
	</footer>
</div>

<style>
	@media (max-width: 900px) {
		.hero-section {
			grid-template-columns: 1fr !important;
			text-align: center;
			gap: 48px !important;
			padding-top: calc(60px + env(safe-area-inset-top)) !important;
		}
		p {
			margin-left: auto;
			margin-right: auto;
		}
		.stats {
			justify-content: center !important;
			gap: 24px !important;
		}
		.hero-btns {
			justify-content: center !important;
		}
	}

	@media (max-width: 480px) {
		h1 {
			font-size: 40px !important;
		}
		.stats {
			flex-direction: column;
			gap: 16px !important;
		}
	}
</style>
