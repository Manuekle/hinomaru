<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, Cancel01Icon, TranslateIcon } from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { animate } from 'motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { safeRomaji } from '$lib/utils/romaji';
	import { addXP } from '$lib/utils/gamification';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import { fadeIn } from '$lib/motion';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const words = $derived(data.words as any[]);
	const supabase = createClient();

	let i = $state(0);
	let flipped = $state(false);
	let struggled = $state(false);
	let correct = $state(0);
	let showAnticipation = $state(false);
	let cardEl = $state<HTMLDivElement | null>(null);
	let confettiRef = $state<{ fire: () => void } | null>(null);

	const word = $derived(words[i]);
	const rom = $derived(word ? safeRomaji(word.romaji, word.kana || word.jp) : '');
	const exRom = $derived(
		word?.example
			? safeRomaji(word.example_romaji || word.extra?.example_romaji, word.example_kana || word.example)
			: ''
	);

	onMount(() => {
		if (cardEl) {
			animate(
				cardEl,
				{ opacity: [0, 1], y: [24, 0], scale: [0.97, 1] },
				{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }
			);
		}
	});

	function speak(text: string, slow = false) {
		speakJapanese(text, undefined, slow ? 0.7 : 1);
	}

	async function updateWordProgress(w: any, gotIt: boolean, hadDifficulty: boolean) {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;

		const currentSRS = {
			repetitions: w.repetitions || 0,
			easiness: w.easiness || 2.5,
			interval_days: w.interval_days || 0,
			next_review: w.next_review
		};
		const quality = mapPerformanceToQuality(gotIt, hadDifficulty);
		const nextState = calculateNextReview(quality, currentSRS);

		await supabase
			.from('user_saved_words')
			.update({ ...nextState, last_seen: new Date().toISOString() })
			.eq('id', w.id);
	}

	async function next(gotIt: boolean) {
		if (gotIt && !struggled) {
			correct++;
			playCorrect();
		}
		updateWordProgress(word, gotIt, struggled);
		flipped = false;

		if (i >= words.length - 1) {
			playFinish();
			confettiRef?.fire();
			saveSession();
			showAnticipation = true;
			setTimeout(() => goto('/vocabulary'), 1600);
			return;
		}

		if (cardEl) {
			const dir = gotIt ? -1 : 1;
			await animate(
				cardEl,
				{ opacity: [1, 0], x: [0, dir * 40] },
				{ duration: 0.2, ease: 'easeIn' }
			).finished;
			i++;
			flipped = false;
			struggled = false;
			await animate(
				cardEl,
				{ opacity: [0, 1], x: [dir * -40, 0] },
				{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }
			);
		} else {
			i++;
			flipped = false;
			struggled = false;
		}
	}

	function retry() {
		struggled = true;
		playWrong();
		flipped = false;
		if (cardEl) {
			animate(cardEl, { scale: [1, 0.98, 1] }, { duration: 0.3 });
		}
	}

	async function saveSession() {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		await supabase.from('sessions').insert({
			user_id: user.id,
			mode: 'vocabulary_review',
			correct,
			total: words.length
		});
		await updateStreak(supabase, user.id);
		await addXP(supabase, user.id, correct * 5);
	}

	function getFontSize(text: string) {
		const len = text?.length || 0;
		if (len <= 4) return 'var(--fs-display)';
		if (len <= 6) return 'var(--fs-2xl)';
		if (len <= 10) return 'var(--fs-xl)';
		return 'var(--fs-lg)';
	}
</script>

<svelte:head>
	<title>{t('nav.review', $locale)} — Hinomaru</title>
</svelte:head>

<Confetti bind:this={confettiRef} />

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={() => goto('/vocabulary')}>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			{Math.min(i + 1, words.length)} / {words.length}
		</div>

		<button
			class="lang-btn"
			class:active={$showRomaji}
			onclick={() => ($showRomaji = !$showRomaji)}
			title="Toggle Romaji"
		>
			<Icon icon={TranslateIcon} size={24} color="currentColor" />
		</button>
	</div>

	<div class="session-container">
		{#if words.length === 0}
			<div class="empty-state-wrapper" use:fadeIn>
				<div class="empty-emoji">✨</div>
				<h2 class="empty-title">{t('home.complete', $locale)}</h2>
				<p class="empty-desc">{t('summary.all', $locale)}</p>
				<button class="hm-btn hm-btn-primary hm-btn-lg" onclick={() => goto('/vocabulary')}>
					{t('deck.back', $locale)}
				</button>
			</div>
		{:else if word}
			<div class="card-stack-center">
				<div
					role="button"
					tabindex="0"
					bind:this={cardEl}
					class="card-scene"
					aria-label="Flashcard — tap to flip"
					onclick={() => (flipped = !flipped)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (flipped = !flipped))}
				>
					<div class="card-body" class:flipped>
						<!-- Front -->
						<div class="card-face card-front">
							<span class="card-tag">{($locale === 'es' ? word.category_es : word.category) || t('nav.vocabulary', $locale)}</span>

							<div class="word-center">
								<div class="jp word-text" style="font-size:{getFontSize(word.jp)};">{word.jp}</div>
								<div class="audio-row">
									<button
										onclick={(e) => { e.stopPropagation(); speak(word.jp); }}
										class="audio-btn"
										aria-label="Play normal speed"
									>
										<Icon icon={VolumeHighIcon} size={18} color="currentColor" />
									</button>
									<button
										onclick={(e) => { e.stopPropagation(); speak(word.jp, true); }}
										class="audio-btn slow-btn"
										aria-label="Play slow speed"
									>
										<Icon icon={VolumeHighIcon} size={16} color="currentColor" />
										<span class="slow-label" aria-hidden="true">0.7×</span>
									</button>
								</div>
							</div>

							<span class="tap-hint" aria-hidden="true">{t('session.flip', $locale)}</span>
						</div>

						<!-- Back -->
						<div class="card-face card-back">
							<div class="back-scroll">
								<div class="meaning-large">{$locale === 'es' ? word.es : word.en}</div>
								{#if $showRomaji && rom}
									<div class="romaji-red">{rom}</div>
								{/if}

								{#if word.example}
									<div class="example-block">
										<div class="example-jp jp">
											{word.example}
											<button onclick={(e) => { e.stopPropagation(); speak(word.example); }} class="mini-audio" aria-label="Play example">
												<Icon icon={VolumeHighIcon} size={13} color="currentColor" />
											</button>
										</div>
										{#if $showRomaji && exRom}
											<div class="example-romaji">{exRom}</div>
										{/if}
										<div class="example-translation">{$locale === 'es' ? word.example_es : word.example_en}</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if word && !showAnticipation}
		<StickyFooter>
			{#if !flipped}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={() => (flipped = true)}>
					{t('session.flip', $locale)}
				</button>
			{:else}
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={retry}>
					{t('session.again', $locale)}
				</button>
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={() => next(true)}>
					{t('session.gotIt', $locale)}
				</button>
			{/if}
		</StickyFooter>
	{/if}
</div>

{#if showAnticipation}
	<AnticipationScreen />
{/if}

<style>
	.premium-bg {
		background-color: var(--bg-page);
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.premium-header-minimal {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(16px + env(safe-area-inset-top)) 24px 16px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--ink-200);
	}

	.header-progress {
		font-size: 18px;
		font-weight: 800;
		color: var(--fg-primary);
	}

	.close-btn, .lang-btn {
		color: var(--fg-secondary);
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.lang-btn.active {
		color: var(--hinomaru-red);
	}

	.card-stack-center {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px 0;
	}

	.card-scene {
		width: 100%;
		max-width: 440px;
		height: min(480px, calc(100dvh - 210px));
		perspective: 1200px;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		display: flex;
		font: inherit;
	}

	.card-scene:focus-visible {
		outline: 3px solid var(--hinomaru-red);
		outline-offset: 6px;
		border-radius: 32px;
	}

	.card-body {
		position: relative;
		width: 100%;
		height: 100%;
		flex: 1;
		transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
		transform-style: preserve-3d;
		will-change: transform;
	}

	.card-body.flipped { transform: rotateY(180deg); }

	.card-face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		border-radius: 28px;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--ink-200);
		box-shadow: 0 4px 24px rgba(26,26,26,0.08), 0 1px 4px rgba(26,26,26,0.04);
	}

	.card-front {
		background: var(--bg-surface);
		align-items: center;
		justify-content: space-between;
		padding: 20px 24px 24px;
		overflow: hidden;
	}

	.card-back {
		transform: rotateY(180deg);
		background: var(--bg-surface);
		padding: 0;
		overflow: hidden;
	}

	.card-tag {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
		background: var(--bg-muted);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.word-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 20px;
	}

	.word-text {
		color: var(--fg-primary);
		line-height: 1;
		text-align: center;
		font-weight: 700;
	}

	.audio-row {
		display: flex;
		gap: 10px;
	}

	.audio-btn {
		height: 44px;
		padding: 0 16px;
		border-radius: 22px;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--fg-secondary);
		cursor: pointer;
		transition: all 0.15s;
		font-family: inherit;
		-webkit-tap-highlight-color: transparent;
	}

	.audio-btn:focus-visible {
		outline: 2px solid var(--hinomaru-red);
		outline-offset: 2px;
	}

	.slow-btn {
		border-color: var(--hinomaru-red);
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	.slow-label { font-size: 11px; font-weight: 800; }

	.tap-hint {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
	}

	.back-scroll {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding: 28px 24px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.meaning-large {
		font-size: clamp(28px, 7vw, 38px);
		font-weight: 900;
		color: var(--fg-primary);
		line-height: 1.1;
	}

	.romaji-red {
		margin-top: 10px;
		font-size: clamp(15px, 4vw, 19px);
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.example-block {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid var(--ink-100);
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}

	.example-jp {
		font-size: 17px;
		font-weight: 600;
		color: var(--fg-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.mini-audio {
		flex-shrink: 0;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		border: 1px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-tertiary);
		cursor: pointer;
	}

	.example-romaji { font-size: 13px; font-weight: 700; color: var(--hinomaru-red); }
	.example-translation { font-size: 14px; color: var(--fg-secondary); line-height: 1.4; }

	.empty-state-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px;
		text-align: center;
	}

	.empty-emoji { font-size: 48px; margin-bottom: 16px; }
	.empty-title { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
	.empty-desc { color: var(--fg-secondary); margin-bottom: 32px; }
</style>
