<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, Mic01Icon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { onMount, onDestroy } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { safeRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import StudySessionLayout from './StudySessionLayout.svelte';
	import { JapaneseSpeechRecognizer, isSpeechSupported } from '$lib/speaking/speech';
	import { comparePhraseBest, classify, type ScoreLevel } from '$lib/speaking/compare';
	import { forMatch } from '$lib/speaking/normalize';
	import { fadeIn, fadeUp } from '$lib/motion';
	import { fade } from 'svelte/transition';

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
		onAnswer?: (correct: boolean) => void;
		onDisableSpeak?: () => void;
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
		onAnswer,
		onDisableSpeak
	}: Props = $props();

	const isLesson = $derived(mode === 'lesson');
	const initialCards = $derived(isLesson && lessonCard ? [lessonCard] : (deckCards ?? []));
	const _onComplete = (r: { correct: number; total: number }) => {
		if (isLesson) onAnswer?.(r.correct === r.total);
		else onComplete?.(r);
	};
	const _onExit = () => {
		if (isLesson) {
			onDisableSpeak?.();
			onAnswer?.(true);
		} else onExit?.();
	};

	const queue = $derived.by(() => createMistakeQueue<any>(initialCards));

	let recognizer: JapaneseSpeechRecognizer | null = null;
	let isRecording = $state(false);
	let processing = $state(false);
	let transcript = $state('');
	let displayTranscript = $state('');
	let recognizerAlternatives = $state<string[]>([]);
	let submitted = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);
	let error = $state<string | null>(null);
	let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
	let unsupported = $state(false);

	onMount(() => {
		if (!isSpeechSupported()) {
			unsupported = true;
		}
	});

	const micState = $derived<'idle' | 'recording' | 'done'>(
		submitted ? 'done' : isRecording ? 'recording' : 'idle'
	);

	const card = $derived(queue.current);

	onDestroy(() => {
		if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
		recognizer?.abort();
	});

	async function toggleRecording() {
		if (unsupported) return;
		if (isRecording) {
			recognizer?.stop();
			isRecording = false;
			return;
		}

		error = null;
		transcript = '';
		displayTranscript = '';
		recognizerAlternatives = [];
		submitted = false;

		if (!recognizer) {
			recognizer = new JapaneseSpeechRecognizer();
		}

		isRecording = true;
		await recognizer.start(
			(r) => {
				transcript = r.transcript;
				displayTranscript = r.transcript;
				if (r.alternatives?.length) recognizerAlternatives = r.alternatives;
				if (r.isFinal) {
					isRecording = false;
					processing = true;
					setTimeout(() => {
						processing = false;
						submit();
					}, 350);
				}
			},
			(err) => {
				error = err;
				isRecording = false;
			},
			() => {
				isRecording = false;
			}
		);
	}

	const cardTargets = $derived.by(() => {
		if (!card) return [] as string[];
		return [card.jp, card.kana, card.romaji].filter(
			(t): t is string => typeof t === 'string' && t.length > 0
		);
	});

	const bestAlternative = $derived.by(() => {
		if (!card || !transcript) return '';
		const pool = recognizerAlternatives.length ? recognizerAlternatives : [transcript];
		if (!cardTargets.length) return pool[0] ?? '';
		let bestText = pool[0] ?? '';
		let bestScore = -1;
		for (const alt of pool) {
			if (!alt) continue;
			const r = comparePhraseBest(cardTargets, alt);
			if (r.overallScore > bestScore) {
				bestScore = r.overallScore;
				bestText = alt;
			}
		}
		return bestText;
	});

	const compareResult = $derived.by(() => {
		if (!card || !bestAlternative) return null;
		return comparePhraseBest(cardTargets, bestAlternative);
	});

	const score = $derived(compareResult?.overallScore ?? 0);
	const scoreLevel = $derived<ScoreLevel>(compareResult?.overallLevel ?? 'wrong');
	const isCorrect = $derived(scoreLevel === 'correct');
	const isClose = $derived(scoreLevel === 'close');

	const matchedIndices = $derived.by(() => {
		const matched = new Set<number>();
		if (!card || !bestAlternative) return matched;
		const spokenRom = forMatch(bestAlternative);
		const tokens = card.jp.split('');
		let cursor = 0;
		for (let i = 0; i < tokens.length; i++) {
			const tokenRom = forMatch(tokens[i]);
			if (!tokenRom) {
				matched.add(i);
				continue;
			}
			const found = spokenRom.indexOf(tokenRom, cursor);
			if (found !== -1) {
				matched.add(i);
				cursor = found + tokenRom.length;
			}
		}
		return matched;
	});

	const cardRomaji = $derived(card ? safeRomaji(card.romaji, card.jp) : '');

	function submit() {
		submitted = true;
		if (isCorrect) {
			correct++;
			playCorrect();
		} else {
			struggled = true;
			playWrong();
		}
		autoAdvanceTimer = setTimeout(() => next(), isCorrect ? 1600 : 2000);
	}

	function skip() {
		recognizer?.abort();
		if (autoAdvanceTimer) {
			clearTimeout(autoAdvanceTimer);
			autoAdvanceTimer = null;
		}
		if (queue.isLast) {
			showAnticipation = true;
			_onComplete({ correct, total: queue.originalTotal });
		} else {
			submitted = false;
			transcript = '';
			displayTranscript = '';
			recognizerAlternatives = [];
			struggled = false;
			queue.advance();
		}
	}

	async function next() {
		if (autoAdvanceTimer) {
			clearTimeout(autoAdvanceTimer);
			autoAdvanceTimer = null;
		}
		recognizer?.abort();
		if (onCardProgress) onCardProgress(card, isCorrect, struggled);

		if (!isCorrect) {
			queue.requeueCurrent();
		}

		if (queue.isLast) {
			showAnticipation = true;
			_onComplete({ correct, total: queue.originalTotal });
		} else {
			submitted = false;
			transcript = '';
			displayTranscript = '';
			recognizerAlternatives = [];
			struggled = false;
			queue.advance();
		}
	}

	function playAudio() {
		speakJapanese(card?.jp ?? '');
	}
</script>

<StudySessionLayout
	{isLesson}
	onExit={() => {
		recognizer?.abort();
		_onExit();
	}}
	currentIndex={queue.index}
	totalCount={queue.total}
>
	{#if initialCards.length === 0}
		<SessionEmptyState
			{totalCards}
			{learnedCount}
			sessionCount={0}
			deckId={deck?.id}
			modeLabel={t('mode.speaking.title', $locale)}
		/>
	{:else if card}
			<div class="speaking-viewer content-center">
				<div class="prompt-card">
					<div class="prompt-meta">
						<span class="prompt-tag">{t('mode.speaking.title', $locale)}</span>
						<button onclick={playAudio} class="audio-mini" aria-label="Play pronunciation">
							<Icon icon={VolumeHighIcon} size={16} color="currentColor" />
						</button>
					</div>
					<div
						class="jp word-text"
						style="font-size:{card.jp.length <= 4
							? 'var(--fs-display)'
							: card.jp.length <= 6
								? 'var(--fs-2xl)'
								: card.jp.length <= 10
									? 'var(--fs-xl)'
									: 'var(--fs-lg)'};"
					>
						{#if isRecording || processing || (submitted && transcript)}
							{#each card.jp.split('') as char, i}
								<span class="char-unit" class:is-matched={matchedIndices.has(i)}>{char}</span>
							{/each}
						{:else}
							<InteractiveText text={card.jp} />
						{/if}
					</div>
					{#if cardRomaji}<div class="romaji-sub">{cardRomaji}</div>{/if}
					{#if submitted}
						<div class="meaning-sub" in:fade={{ duration: 200 }}>
							{$locale === 'es' ? card.es : card.en}
						</div>
					{/if}
				</div>

				{#if unsupported}
					<div class="error-msg" use:fadeIn>
						{$locale === 'es'
							? 'Reconocimiento de voz no disponible en este navegador.'
							: 'Speech recognition not supported.'}
					</div>
				{:else}
					<div class="mic-area">
						<button
							class="mic-btn"
							data-state={micState}
							data-verdict={submitted ? scoreLevel : null}
							onclick={toggleRecording}
							disabled={submitted || processing}
							aria-label={isRecording ? t('speaking.stop', $locale) : t('speaking.speak', $locale)}
							aria-pressed={isRecording}
						>
							{#if micState === 'recording'}
								<div class="wave" aria-hidden="true">
									{#each Array(4) as _, idx (idx)}
										<span style="animation-delay:{idx * 0.1}s"></span>
									{/each}
								</div>
							{:else if micState === 'done'}
								<Icon icon={isCorrect ? Tick02Icon : Cancel01Icon} size={22} color="white" />
							{:else}
								<Icon icon={Mic01Icon} size={22} color="white" />
							{/if}
						</button>
						<div class="mic-label" aria-hidden="true">
							{#if micState === 'recording'}
								{$locale === 'es' ? 'Escuchando…' : 'Listening…'}
							{:else if !submitted}
								{$locale === 'es' ? 'Toca para hablar' : 'Tap to speak'}
							{/if}
						</div>

						{#if submitted}
							<div class="verdict-row" in:fade={{ duration: 180 }}>
								<span class="verdict-chip" data-verdict={scoreLevel}>
									{#if isCorrect}
										{$locale === 'es' ? '✓ Correcto' : '✓ Correct'}
									{:else if isClose}
										{$locale === 'es' ? '~ Casi' : '~ Almost'}
									{:else}
										{$locale === 'es' ? '✗ Inténtalo' : '✗ Try again'}
									{/if}
								</span>
								{#if transcript}
									<span class="verdict-transcript">
										{$locale === 'es' ? 'oíste:' : 'heard:'} <span class="jp">{transcript}</span>
									</span>
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				{#if error && !submitted}
					<div class="error-msg" use:fadeIn>{error}</div>
				{/if}
			</div>
		{/if}

	{#if card && !showAnticipation}
		<StickyFooter>
			{#if !submitted}
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={skip}>
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
	.speaking-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(20px, 5vh, 32px);
		padding: clamp(24px, 4vh, 36px) 16px clamp(20px, 3vh, 28px);
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
	}

	.prompt-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		box-shadow: 0 8px 32px rgba(26, 26, 26, 0.06);
		padding: 18px 22px 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		text-align: center;
	}

	.prompt-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.prompt-tag {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.audio-mini {
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
	}

	.word-text {
		color: var(--fg-primary);
		line-height: 1.05;
		font-weight: 700;
		padding: 8px 0;
		display: flex;
		gap: 2px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.char-unit {
		transition:
			color 0.2s ease,
			transform 0.2s ease;
	}
	.char-unit.is-matched {
		color: var(--hinomaru-red);
		transform: scale(1.1);
	}

	.romaji-sub {
		font-size: clamp(14px, 3.5vw, 17px);
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.meaning-sub {
		font-size: clamp(16px, 4vw, 20px);
		font-weight: 600;
		color: var(--fg-secondary);
	}

	.mic-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 8px 0 4px;
	}

	.mic-btn {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		border: none;
		background: var(--hinomaru-red);
		color: white;
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.22);
		transition:
			transform 0.16s cubic-bezier(0.34, 1.5, 0.64, 1),
			background 0.2s ease,
			box-shadow 0.2s ease;
	}

	.mic-btn:active {
		transform: scale(0.94);
	}

	.mic-btn[data-state='recording'] {
		background: #1a1a1a;
		box-shadow:
			0 0 0 0 rgba(188, 0, 45, 0.55),
			0 4px 12px rgba(0, 0, 0, 0.28);
		animation: mic-soft-pulse 1.4s ease-in-out infinite;
	}

	.mic-btn[data-verdict='correct'] {
		background: var(--success);
		box-shadow: 0 4px 12px rgba(46, 125, 91, 0.28);
	}
	.mic-btn[data-verdict='close'] {
		background: #d4a017;
		box-shadow: 0 4px 12px rgba(212, 160, 23, 0.28);
	}
	.mic-btn[data-verdict='wrong'] {
		background: var(--hinomaru-red);
	}

	.mic-btn:disabled {
		cursor: default;
	}

	@keyframes mic-soft-pulse {
		0%,
		100% {
			box-shadow:
				0 0 0 0 rgba(188, 0, 45, 0.45),
				0 4px 12px rgba(0, 0, 0, 0.28);
		}
		50% {
			box-shadow:
				0 0 0 6px rgba(188, 0, 45, 0),
				0 4px 12px rgba(0, 0, 0, 0.28);
		}
	}

	.wave {
		display: flex;
		align-items: center;
		gap: 3px;
		height: 22px;
	}
	.wave span {
		width: 3px;
		height: 100%;
		background: white;
		border-radius: 2px;
		animation: wave-bounce 0.9s ease-in-out infinite;
	}
	@keyframes wave-bounce {
		0%,
		100% {
			transform: scaleY(0.3);
		}
		50% {
			transform: scaleY(1);
		}
	}

	.mic-label {
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-tertiary);
		letter-spacing: -0.01em;
		min-height: 16px;
	}

	.verdict-row {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		margin-top: 2px;
	}

	.verdict-chip {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: -0.01em;
		padding: 5px 12px;
		border-radius: 999px;
		line-height: 1;
	}
	.verdict-chip[data-verdict='correct'] {
		color: var(--success);
		background: var(--success-wash);
	}
	.verdict-chip[data-verdict='close'] {
		color: #b1830f;
		background: rgba(212, 160, 23, 0.14);
	}
	.verdict-chip[data-verdict='wrong'] {
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	.verdict-transcript {
		font-size: 12px;
		color: var(--fg-tertiary);
		text-align: center;
		max-width: 320px;
	}
	.verdict-transcript .jp {
		font-family: var(--font-jp);
		color: var(--fg-secondary);
		font-weight: 600;
		margin-left: 2px;
	}

	.error-msg {
		font-size: 14px;
		font-weight: 600;
		color: var(--hinomaru-red);
		text-align: center;
	}

</style>
