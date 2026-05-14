<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { animate } from 'motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { safeRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import StudySessionLayout from './StudySessionLayout.svelte';
	import { fadeIn } from '$lib/motion';

	interface Props {
		mode?: 'deck' | 'lesson';
		// deck-mode
		cards?: any[];
		deck?: any;
		onComplete?: (results: { correct: number; total: number }) => void;
		onExit?: () => void;
		onCardProgress?: (card: any, correct: boolean, struggled: boolean) => void;
		totalCards?: number;
		learnedCount?: number;
		// lesson-mode
		card?: any;
		onAnswer?: (correct: boolean) => void;
	}

	let {
		mode = 'deck',
		cards: initialCards = [],
		deck,
		onComplete,
		onExit,
		onCardProgress,
		totalCards = 0,
		learnedCount = 0,
		card: lessonCard,
		onAnswer
	}: Props = $props();

	const isLesson = $derived(mode === 'lesson');

	// ---- DECK MODE STATE ----
	const queue = $derived.by(() => createMistakeQueue<any>(initialCards));
	let flipped = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);
	let cardEl = $state<HTMLDivElement | null>(null);

	const card = $derived(isLesson ? lessonCard : queue.current);
	const rom = $derived(card ? safeRomaji(card.romaji, card.jp) : '');
	const exRom = $derived(
		card?.example
			? safeRomaji(
					card.example_romaji || card.extra?.example_romaji,
					card.example_kana || card.example
				)
			: ''
	);

	// reset on lesson card change
	$effect(() => {
		if (isLesson) {
			void lessonCard;
			flipped = false;
			struggled = false;
		}
	});

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

	async function next(gotIt: boolean) {
		if (isLesson) {
			if (gotIt) playCorrect();
			else playWrong();
			onAnswer?.(gotIt && !struggled);
			return;
		}
		if (gotIt) {
			correct++;
			playCorrect();
		}
		if (!gotIt || struggled) {
			queue.requeueCurrent();
		}
		if (onCardProgress) onCardProgress(card, gotIt, struggled);
		if (queue.isLast) {
			showAnticipation = true;
			onComplete?.({ correct, total: queue.originalTotal });
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
</script>

<StudySessionLayout
	{isLesson}
	onExit={onExit}
	currentIndex={queue.index}
	totalCount={queue.total}
>
	{#if !isLesson && initialCards.length === 0}
		<SessionEmptyState
			{totalCards}
			{learnedCount}
			sessionCount={0}
			deckId={deck?.id}
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
					onkeydown={(e) =>
						(e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (flipped = !flipped))}
				>
					<div class="card-body" class:flipped>
						<div class="card-face card-front">
							<div class="word-center">
								<div
									class="jp card-text"
									style="font-size: {card.jp.length <= 4 ? 'var(--fs-display)' : 'var(--fs-3xl)'};"
								>
									<InteractiveText text={card.jp} />
								</div>
								{#if $showRomaji}
									<div class="romaji-label" in:fade>{safeRomaji(card.romaji, card.jp)}</div>
								{/if}
								<div class="audio-row">
									<button
										onclick={(e) => {
											e.stopPropagation();
											speak(card.jp);
										}}
										class="audio-btn"
										aria-label="Play normal speed"
									>
										<Icon icon={VolumeHighIcon} size={18} color="currentColor" />
									</button>
								</div>
							</div>
							<span class="tap-hint" aria-hidden="true">{t('session.flip', $locale)}</span>
						</div>
						<div class="card-face card-back">
							<div class="back-scroll">
								<div class="meaning-large">{$locale === 'es' ? card.es : card.en}</div>
								{#if rom}<div class="romaji-red">{rom}</div>{/if}
								{#if card.example}
									<div class="example-block">
										<div class="example-jp jp">
											{card.example}
											<button
												onclick={(e) => {
													e.stopPropagation();
													speak(card.example);
												}}
												class="mini-audio"
											>
												<Icon icon={VolumeHighIcon} size={13} color="currentColor" />
											</button>
										</div>
										{#if $showRomaji}
											{#if exRom}<div class="example-romaji">{exRom}</div>{/if}
										{/if}
										<div class="example-translation">
											{$locale === 'es' ? card.example_es : card.example_en}
										</div>
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

	{#if card && !showAnticipation}
		<StickyFooter>
			{#if !flipped}
				<button
					class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg"
					onclick={() => (flipped = true)}
				>
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
</StudySessionLayout>

{#if showAnticipation}
	<AnticipationScreen />
{/if}

<style>
	.card-stack-center {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px 0 24px;
		perspective: 1000px;
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
	.card-body.flipped {
		transform: rotateY(180deg);
	}
	.card-face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		border-radius: 28px;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--ink-200);
		box-shadow:
			0 4px 24px rgba(26, 26, 26, 0.08),
			0 1px 4px rgba(26, 26, 26, 0.04);
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
		letter-spacing: -0.04em;
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

	.tap-hint {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: -0.04em;
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
	.example-empty {
		align-items: center;
	}
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
