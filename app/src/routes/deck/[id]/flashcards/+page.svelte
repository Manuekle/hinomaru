<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { 
		VolumeHighIcon, 
		Cancel01Icon, 
		CheckmarkCircle01Icon,
		TranslateIcon
	} from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { animate } from 'motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { safeRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeIn } from '$lib/motion';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const supabase = createClient();
	const queue = $derived.by(() => createMistakeQueue<any>(data.cards as any[]));

	let flipped = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);
	let cardEl = $state<HTMLDivElement | null>(null);

	const cards = $derived(queue.cards);
	const i = $derived(queue.index);
	const card = $derived(queue.current);

	const rom = $derived(card ? safeRomaji(card.romaji, card.jp) : '');
	const exRom = $derived(card?.example ? safeRomaji(card.example_romaji || card.extra?.example_romaji, card.example_kana || card.example) : '');

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

	async function updateCardProgress(c: any, gotIt: boolean, hadDifficulty: boolean = false) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;
		const currentProgress = c.progress && c.progress.length > 0 ? c.progress[0] : null;
		const quality = mapPerformanceToQuality(gotIt, hadDifficulty);
		const nextState = calculateNextReview(quality, currentProgress);
		await supabase.from('progress').upsert({
			user_id: user.id,
			card_id: c.id,
			learned: true,
			...nextState,
			last_seen: new Date().toISOString()
		});
	}

	async function next(gotIt: boolean) {
		if (gotIt) {
			correct++;
			playCorrect();
		}
		if (!gotIt || struggled) {
			queue.requeueCurrent();
		}
		flipped = false;

		updateCardProgress(card, gotIt, struggled);

		if (queue.isLast) {
			const params = new URLSearchParams({
				correct: String(correct),
				total: String(queue.originalTotal),
				mode: 'flashcards'
			});
			saveSession(correct, queue.originalTotal);
			showAnticipation = true;
			setTimeout(() => {
				goto(`/deck/${data.deck.id}/summary?${params}`);
			}, 1800);
		} else {
			if (cardEl) {
				const dir = gotIt ? -1 : 1;
				await animate(
					cardEl,
					{ opacity: [1, 0], x: [0, dir * 40] },
					{ duration: 0.2, ease: 'easeIn' }
				).finished;
				queue.advance();
				flipped = false;
				struggled = false;
				await animate(
					cardEl,
					{ opacity: [0, 1], x: [dir * -40, 0] },
					{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }
				);
			} else {
				queue.advance();
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

	async function saveSession(c: number, total: number) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;
		await supabase
			.from('sessions')
			.insert({ user_id: user.id, deck_id: data.deck.id, mode: 'flashcards', correct: c, total });
		await updateStreak(supabase, user.id);
	}

	function getFontSize(text: string) {
		const len = text?.length || 0;
		if (len <= 4) return 'var(--fs-display)';
		if (len <= 6) return 'var(--fs-2xl)';
		if (len <= 10) return 'var(--fs-xl)';
		return 'var(--fs-lg)';
	}
</script>

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={() => goto(`/deck/${data.deck.id}`)}>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			{queue.index + 1} / {queue.total}
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
		{#if data.cards.length === 0}
			<SessionEmptyState
				totalCards={data.totalCards}
				learnedCount={data.learnedCount}
				sessionCount={cards.length}
				deckId={data.deck.id}
				modeLabel={t('mode.flashcards.title', $locale)}
			/>
		{:else if card}
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
							<span class="card-tag">{data.deck.title || t('nav.vocabulary', $locale)}</span>

							<div class="word-center">
								<div class="jp word-text" style="font-size:{getFontSize(card.jp)};">{card.jp}</div>
								<div class="audio-row">
									<button
										onclick={(e) => { e.stopPropagation(); speak(card.jp); }}
										class="audio-btn"
										aria-label="Play normal speed"
									>
										<Icon icon={VolumeHighIcon} size={18} color="currentColor" />
									</button>
									<button
										onclick={(e) => { e.stopPropagation(); speak(card.jp, true); }}
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
								<div class="meaning-large">{$locale === 'es' ? card.es : card.en}</div>
								{#if rom}<div class="romaji-red">{rom}</div>{/if}

								{#if card.example}
									<div class="example-block">
										<div class="example-jp jp">
											{card.example}
											<button onclick={(e) => { e.stopPropagation(); speak(card.example); }} class="mini-audio">
												<Icon icon={VolumeHighIcon} size={13} color="currentColor" />
											</button>
										</div>
										{#if $showRomaji}
											{#if exRom}<div class="example-romaji">{exRom}</div>{/if}
										{/if}
										<div class="example-translation">{$locale === 'es' ? card.example_es : card.example_en}</div>
									</div>
								{:else}
									<div class="example-block example-empty">
										<div class="example-empty-text">
											{$locale === 'es' ? 'Sin ejemplo disponible' : 'No example available'}
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

	{#if card && !showAnticipation}
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
		padding: 24px 0 24px;
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
		transition: transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1);
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

	.slow-label {
		font-size: 11px;
		font-weight: 800;
	}

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
		justify-content: center;
	}

	@supports (height: 1px) {
		.back-scroll > :global(*) { flex-shrink: 0; }
	}

	.example-empty { align-items: center; }
	.example-empty-text {
		font-size: 13px;
		font-style: italic;
		color: var(--fg-tertiary);
		padding: 6px 12px;
		background: var(--bg-muted);
		border-radius: 10px;
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
		-webkit-tap-highlight-color: transparent;
	}

	.example-romaji {
		font-size: 13px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.example-translation {
		font-size: 14px;
		color: var(--fg-secondary);
		line-height: 1.4;
	}
</style>
