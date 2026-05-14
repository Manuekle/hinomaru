<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, Cancel01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { safeRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import StudySessionLayout from './StudySessionLayout.svelte';
	import { fadeIn } from '$lib/motion';

	interface Props {
		mode?: 'deck' | 'lesson';
		cards?: any[];
		deck?: any;
		onComplete?: (results: { correct: number; total: number }) => void;
		onExit?: () => void;
		onCardProgress?: (card: any, correct: boolean, struggled: boolean) => void;
		totalCards?: number;
		learnedCount?: number;
		card?: any;
		distractors?: any[];
		onAnswer?: (correct: boolean) => void;
	}

	let {
		mode = 'deck',
		cards: deckCards,
		deck,
		onComplete,
		onExit,
		onCardProgress,
		totalCards = 0,
		learnedCount = 0,
		card: lessonCard,
		distractors = [],
		onAnswer
	}: Props = $props();

	const isLesson = $derived(mode === 'lesson');
	const initialCards = $derived(
		isLesson && lessonCard ? [lessonCard] : (deckCards ?? [])
	);
	const _onComplete = (r: { correct: number; total: number }) => {
		if (isLesson) onAnswer?.(r.correct === r.total);
		else onComplete?.(r);
	};
	const _onExit = () => {
		if (isLesson) onAnswer?.(false);
		else onExit?.();
	};

	const queue = $derived.by(() => createMistakeQueue<any>(initialCards));

	let picked = $state<string | null>(null);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);

	const card = $derived(isLesson ? lessonCard : queue.current);
	const correctValue = $derived(isLesson ? card?.jp : $locale === 'es' ? card?.es : card?.en);
	const isCorrect = $derived(picked === correctValue);

	interface Option {
		text: string;
		romaji?: string;
	}

	const options = $derived.by<Option[]>(() => {
		if (!card) return [];
		if (isLesson) {
			const target: Option = { text: card.jp, romaji: safeRomaji(card.romaji, card.jp) };
			const pool: Option[] = [];
			for (const d of distractors) {
				if (pool.length >= 3) break;
				if (!d?.jp || d.jp === card.jp) continue;
				pool.push({ text: d.jp, romaji: safeRomaji(d.romaji, d.jp) });
			}
			const result = [...pool, target].sort(() => Math.random() - 0.5);
			return result;
		}
		const correctMeaning = $locale === 'es' ? card.es : card.en;
		const pool = Array.from(
			new Set(
				initialCards
					.filter((c) => c.en !== card.en && c.es !== card.es)
					.map((c) => ($locale === 'es' ? c.es : c.en))
					.filter(Boolean)
			)
		);
		const need = Math.min(3, pool.length);
		const shuffled = [...pool].sort(() => Math.random() - 0.5);
		const picks = shuffled.slice(0, need).map((s: string) => ({ text: s }));
		return [...picks, { text: correctMeaning }].sort(() => Math.random() - 0.5);
	});

	$effect(() => {
		if (!isLesson) return;
		void card;
		picked = null;
		struggled = false;
		setTimeout(() => speakJapanese(card?.jp ?? ''), 250);
	});

	function pick(opt: string) {
		if (picked) return;
		picked = opt;
		if (opt === correctValue) {
			correct++;
			playCorrect();
		} else {
			struggled = true;
			playWrong();
		}
		if (isLesson) {
			setTimeout(() => next(), 800);
		}
	}

	async function next() {
		if (onCardProgress) onCardProgress(card, isCorrect, struggled);

		if (!isCorrect) {
			queue.requeueCurrent();
		}

		if (queue.isLast) {
			showAnticipation = true;
			_onComplete({ correct, total: queue.originalTotal });
		} else {
			picked = null;
			queue.advance();
			struggled = false;
		}
	}

	function playAudio() {
		speakJapanese(card?.jp ?? '');
	}
</script>

<StudySessionLayout
	{isLesson}
	onExit={onExit}
	currentIndex={queue.index}
	totalCount={queue.total}
>
	{#if initialCards.length === 0}
		<SessionEmptyState
			{totalCards}
			{learnedCount}
			sessionCount={0}
			deckId={deck?.id}
			modeLabel={t('mode.quiz.title', $locale)}
		/>
	{:else if card}
			<div class="quiz-viewer content-center">
				<div class="word-card">
					<button onclick={playAudio} class="audio-corner" aria-label="Play pronunciation">
						<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
					</button>
					<div class="jp word-big"><InteractiveText text={card.jp} /></div>
					{#if picked}
						{@const rom = safeRomaji(card.romaji, card.jp)}
						{#if rom}<div class="romaji-line">{rom}</div>{/if}
					{/if}
				</div>

				<div class="options-list">
					{#each options as opt, idx (idx)}
						{@const isThisCorrect = opt.text === correctValue}
						{@const isThisPicked = opt.text === picked}
						<button
							onclick={() => pick(opt.text)}
							class="option-item"
							class:is-correct={picked && isThisPicked && isThisCorrect}
							class:is-wrong={picked && isThisPicked && !isThisCorrect}
							class:is-dimmed={picked && !isThisPicked}
							disabled={!!picked}
						>
							<div class="opt-marker">
								{#if picked && isThisPicked && isThisCorrect}
									<Icon icon={CheckmarkCircle01Icon} size={14} color="white" />
								{:else if picked && isThisPicked && !isThisCorrect}
									<Icon icon={Cancel01Icon} size={14} color="white" />
								{:else}
									{String.fromCharCode(65 + idx)}
								{/if}
							</div>
							<div class="opt-content">
								<span class="opt-text" class:jp={isLesson}>{opt.text}</span>
								{#if opt.romaji}<span class="opt-romaji">{opt.romaji}</span>{/if}
							</div>
						</button>
					{/each}
				</div>

				{#if picked}
					<div class="feedback-bar" class:is-correct={isCorrect} use:fadeUp={{ y: 10 }}>
						<Icon
							icon={isCorrect ? CheckmarkCircle01Icon : Cancel01Icon}
							size={18}
							color="currentColor"
						/>
						<span class="fb-label"
							>{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}</span
						>
					</div>

					{#if !isCorrect && card.example}
						<div class="example-hint" use:fadeIn>
							<div class="jp" style="font-size:15px;font-weight:600;color:var(--fg-primary);">
								{card.example}
							</div>
							<div style="font-size:13px;color:var(--fg-secondary);margin-top:3px;">
								{$locale === 'es' ? card.example_es : card.example_en}
							</div>
						</div>
					{/if}
				{/if}
			</div>
		{/if}

	{#if card && !showAnticipation}
		<StickyFooter>
			{#if !picked}
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={() => next()}>
					{t('session.skip', $locale)}
				</button>
			{:else}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={next}>
					{t('session.continue', $locale)}
				</button>
			{/if}
		</StickyFooter>
	{/if}
</StudySessionLayout>

{#if showAnticipation}
	<AnticipationScreen />
{/if}

<style>
	.quiz-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: clamp(16px, 3vh, 24px);
		padding: clamp(20px, 4vh, 32px) 16px clamp(20px, 3vh, 28px);
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
	}

	.word-card {
		position: relative;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		box-shadow: 0 2px 12px rgba(26, 26, 26, 0.06);
		padding: 22px 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		text-align: center;
	}

	.audio-corner {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: background 0.15s;
	}

	.word-big {
		font-size: clamp(36px, 10vw, 56px);
		font-weight: 800;
		color: var(--fg-primary);
		line-height: 1;
		padding: 0 36px;
	}

	.romaji-line {
		font-size: clamp(13px, 3.5vw, 16px);
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.option-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 16px;
		border: 1.5px solid var(--ink-200);
		border-radius: 14px;
		background: var(--bg-surface);
		cursor: pointer;
		text-align: left;
		transition:
			border-color 0.15s,
			background 0.15s,
			opacity 0.15s,
			transform 0.1s;
		width: 100%;
		-webkit-tap-highlight-color: transparent;
		font-family: inherit;
		box-shadow: 0 1px 4px rgba(26, 26, 26, 0.04);
	}

	.option-item:not(:disabled):hover {
		border-color: var(--ink-300);
		transform: translateY(-1px);
		box-shadow: 0 3px 10px rgba(26, 26, 26, 0.08);
	}

	.option-item.is-correct {
		border-color: var(--success) !important;
		background: var(--success-wash) !important;
	}

	.option-item.is-wrong {
		border-color: var(--hinomaru-red) !important;
		background: var(--hinomaru-red-wash) !important;
	}

	.option-item.is-dimmed {
		opacity: 0.55;
		filter: grayscale(0.4);
	}

	.opt-marker {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: var(--bg-muted);
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: 900;
		color: var(--fg-tertiary);
		flex-shrink: 0;
	}

	.option-item.is-correct .opt-marker {
		background: var(--success);
		border-color: var(--success);
		color: white;
	}
	.option-item.is-wrong .opt-marker {
		background: var(--hinomaru-red);
		border-color: var(--hinomaru-red);
		color: white;
	}

	.opt-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.opt-text {
		font-size: 14px;
		font-weight: 600;
		color: var(--fg-primary);
	}
	.opt-text.jp {
		font-size: 17px;
		font-weight: 700;
	}
	.opt-romaji {
		font-size: 11px;
		font-weight: 600;
		color: var(--hinomaru-red);
		opacity: 0.85;
	}

	.feedback-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 14px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		border: 1.5px solid rgba(188, 0, 45, 0.12);
	}

	.feedback-bar.is-correct {
		background: var(--success-wash);
		color: var(--success);
		border-color: rgba(46, 125, 91, 0.12);
	}

	.fb-label {
		font-size: 15px;
		font-weight: 800;
	}

	.example-hint {
		padding: 14px;
		background: var(--bg-muted);
		border-radius: 14px;
		text-align: center;
	}
</style>
