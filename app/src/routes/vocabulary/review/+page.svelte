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
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { addXP } from '$lib/utils/gamification';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { getWordMetadata } from '$lib/utils/vocab_registry';
	import Confetti from '$lib/components/Confetti.svelte';
	import { fadeIn } from '$lib/motion';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const words = $derived(data.words as any[]);
	const supabase = createClient();

	let i = $state(0);
	let flipped = $state(false);
	let struggled = $state(false);
	let cardEl = $state<HTMLDivElement | null>(null);
	let confettiRef = $state<{ fire: () => void } | null>(null);

	const word = $derived(words[i]);
	const meta = $derived(word ? getWordMetadata(word.jp) : null);
	const pct = $derived(words.length > 0 ? ((i + 1) / words.length) * 100 : 0);

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

	async function updateWordProgress(w: any, gotIt: boolean, hadDifficulty: boolean = false) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
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
			.update({
				...nextState,
				last_seen: new Date().toISOString()
			})
			.eq('id', w.id);
	}

	async function next(gotIt: boolean) {
		if (gotIt) playCorrect();
		updateWordProgress(word, gotIt, struggled);

		flipped = false;

		if (i >= words.length - 1) {
			playFinish();
			if (cardEl) {
				animate(cardEl, { opacity: [1, 0], y: [0, -20] }, { duration: 0.25, ease: 'easeIn' });
			}
			confettiRef?.fire();
			saveSession();
			setTimeout(() => goto('/vocabulary'), 1500);
		} else {
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
	}

	async function retry() {
		struggled = true;
		playWrong();
		flipped = false;
		if (cardEl) {
			animate(cardEl, { scale: [1, 0.98, 1] }, { duration: 0.3 });
		}
	}

	async function saveSession() {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;

		await supabase.from('sessions').insert({
			user_id: user.id,
			mode: 'vocabulary_review',
			correct: words.length,
			total: words.length
		});

		await updateStreak(supabase, user.id);
		await addXP(supabase, user.id, 15);
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
			{i + 1} / {words.length}
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
					onclick={() => (flipped = !flipped)}
					onkeydown={(e) => e.key === ' ' && (flipped = !flipped)}
				>
					<div class="card-body" class:flipped>
						<!-- Front -->
						<div class="card-face card-front">
							<div class="card-tag">{($locale === 'es' ? word.category_es : word.category) || t('nav.vocabulary', $locale)}</div>
							
							<div class="jp word-text" style="font-size:{getFontSize(word.jp)};">
								{word.jp}
							</div>

							<div class="audio-controls">
								<button
									onclick={(e) => { e.stopPropagation(); speak(word.jp); }}
									class="audio-pill normal"
								>
									<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
								</button>
								<button
									onclick={(e) => { e.stopPropagation(); speak(word.jp, true); }}
									class="audio-pill slow"
								>
									<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
									<span class="slow-label">0.7x</span>
								</button>
							</div>

							<div class="tap-label">{t('session.flip', $locale)}</div>
						</div>

						<!-- Back -->
						<div class="card-face card-back">
							<div class="back-content">
								<div class="meaning-large">
									{$locale === 'es' ? word.es : word.en}
								</div>

								<div class="romaji-red">
									{word.romaji || kanaToRomaji(word.kana)}
								</div>

								<div class="divider"></div>

								{#if word.example}
									<div class="example-section">
										<div class="example-jp jp">
											{word.example}
											<button
												onclick={(e) => { e.stopPropagation(); speak(word.example); }}
												class="mini-audio"
											>
												<Icon icon={VolumeHighIcon} size={14} color="currentColor" />
											</button>
										</div>
										{#if $showRomaji}
											<div class="example-romaji">
												{word.example_romaji || word.extra?.example_romaji || kanaToRomaji(word.example_kana || word.example)}
											</div>
										{/if}
										<div class="example-translation">
											{$locale === 'es' ? word.example_es : word.example_en}
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if word}
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
		padding: 24px;
	}

	.card-scene {
		width: 100%;
		max-width: 520px;
		aspect-ratio: 3/4.2;
		perspective: 1500px;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		display: block;
		text-align: left;
		font: inherit;
	}

	.card-body {
		position: relative;
		width: 100%;
		height: 100%;
		transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
		transform-style: preserve-3d;
	}

	.card-body.flipped {
		transform: rotateY(180deg);
	}

	.card-face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		background: var(--bg-surface);
		border-radius: 40px;
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		padding: 48px 32px;
		overflow: hidden;
		border: 1px solid var(--ink-100);
	}

	.card-front {
		align-items: center;
		justify-content: space-between;
	}

	.card-back {
		transform: rotateY(180deg);
		justify-content: center;
	}

	.card-tag {
		font-size: 12px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.15em;
	}

	.word-text {
		color: var(--fg-primary);
		line-height: 1.1;
		text-align: center;
		font-weight: 700;
		margin: auto 0;
	}

	.audio-controls {
		display: flex;
		gap: 16px;
		margin-bottom: 24px;
	}

	.audio-pill {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		transition: all 0.2s;
		position: relative;
	}

	.audio-pill.slow {
		border-color: var(--hinomaru-red);
		color: var(--hinomaru-red);
	}

	.slow-label {
		position: absolute;
		font-size: 9px;
		font-weight: 800;
		background: var(--bg-surface);
		color: var(--hinomaru-red);
		padding: 0 4px;
		top: -4px;
	}

	.tap-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-tertiary);
	}

	.back-content {
		text-align: center;
	}

	.meaning-large {
		font-size: 40px;
		font-weight: 900;
		color: var(--fg-primary);
		line-height: 1.1;
	}

	.romaji-red {
		margin-top: 12px;
		font-size: 20px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.divider {
		height: 1.5px;
		background: var(--ink-100);
		margin: 24px 0;
	}

	.example-section {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.example-jp {
		font-size: 18px;
		font-weight: 600;
		color: var(--fg-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.mini-audio {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-tertiary);
	}

	.example-romaji {
		font-size: 13px;
		font-weight: 700;
		color: var(--hinomaru-red);
		margin-bottom: 8px;
	}

	.example-translation {
		font-size: 14px;
		color: var(--fg-secondary);
	}

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
