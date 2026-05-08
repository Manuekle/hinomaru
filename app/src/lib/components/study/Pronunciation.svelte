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
	import { JapaneseSpeechRecognizer, isSpeechSupported } from '$lib/speaking/speech';
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

	function levenshtein(a: string, b: string): number {
		if (a === b) return 0;
		if (!a.length) return b.length;
		if (!b.length) return a.length;
		const dp: number[] = Array(b.length + 1);
		for (let j = 0; j <= b.length; j++) dp[j] = j;
		for (let i = 1; i <= a.length; i++) {
			let prev = dp[0];
			dp[0] = i;
			for (let j = 1; j <= b.length; j++) {
				const tmp = dp[j];
				dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
				prev = tmp;
			}
		}
		return dp[b.length];
	}

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
		submitted = false;

		if (!recognizer) {
			recognizer = new JapaneseSpeechRecognizer();
		}

		isRecording = true;
		await recognizer.start(
			(r) => {
				transcript = r.transcript;
				displayTranscript = r.transcript;
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

	const normalize = (s: string) =>
		s
			.normalize('NFKC')
			.replace(/[、。！？.,\s]/g, '')
			.toLowerCase();

	const similarity = $derived.by(() => {
		if (!card || !transcript) return 0;
		const u = normalize(transcript);
		const tgt = normalize(card.jp);
		if (!u || !tgt) return 0;
		const dist = levenshtein(u, tgt);
		const maxLen = Math.max(u.length, tgt.length);
		return Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));
	});

	const matchedIndices = $derived.by(() => {
		if (!transcript || !card) return new Set();
		const target = card.jp;
		const said = transcript.replace(/\s/g, '');
		const matched = new Set<number>();

		let lastFoundIdx = -1;
		for (let i = 0; i < target.length; i++) {
			const char = target[i];
			const foundIdx = said.indexOf(char, lastFoundIdx + 1);
			if (foundIdx !== -1) {
				matched.add(i);
				lastFoundIdx = foundIdx;
			}
		}
		return matched;
	});

	const isCorrect = $derived(similarity >= 65);
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
		autoAdvanceTimer = setTimeout(() => next(), 1600);
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
			struggled = false;
			queue.advance();
		}
	}

	function playAudio() {
		speakJapanese(card?.jp ?? '');
	}
</script>

<div class="session-layout premium-bg" class:lesson-embed={isLesson}>
	{#if !isLesson}
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button
			class="close-btn"
			onclick={() => {
				recognizer?.abort();
				_onExit();
			}}
		>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			<span class="session-index">{queue.index + 1} / {queue.total}</span>
			<span class="total-label">{t('home.cards', $locale, { n: totalCards })}</span>
		</div>

		<div style="width: 40px;"></div>
	</div>
	{/if}

	<div class="session-container">
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
							onclick={toggleRecording}
							disabled={submitted || processing}
							aria-label={isRecording ? t('speaking.stop', $locale) : t('speaking.speak', $locale)}
							aria-pressed={isRecording}
						>
							<div class="mic-ring"></div>
							<div class="mic-ring mic-ring-2"></div>
							{#if micState === 'recording'}
								<div class="wave" aria-hidden="true">
									{#each Array(5) as _, idx (idx)}
										<span style="animation-delay:{idx * 0.1}s"></span>
									{/each}
								</div>
							{:else if micState === 'done'}
								<Icon icon={isCorrect ? Tick02Icon : Cancel01Icon} size={32} color="white" />
							{:else}
								<Icon icon={Mic01Icon} size={32} color="white" />
							{/if}
						</button>
						<div class="mic-label" aria-hidden="true">
							{#if micState === 'recording'}
								{$locale === 'es' ? 'ESCUCHANDO' : 'LISTENING'}
							{:else if micState === 'done'}
								{isCorrect
									? $locale === 'es'
										? 'CORRECTO'
										: 'CORRECT'
									: $locale === 'es'
										? 'INTÉNTALO'
										: 'TRY AGAIN'}
							{:else}
								{$locale === 'es' ? 'TOCA PARA HABLAR' : 'TAP TO SPEAK'}
							{/if}
						</div>
					</div>
				{/if}

				{#if error && !submitted}
					<div class="error-msg" use:fadeIn>{error}</div>
				{/if}

				{#if transcript && submitted}
					<div class="transcript-box" in:fade>"{transcript}"</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if !showAnticipation && card}
		<StickyFooter>
			{#if submitted}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={next}>
					{t('session.next', $locale)}
				</button>
			{:else if !isRecording && !processing && !unsupported}
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={skip}>
					{$locale === 'es' ? 'No puedo hablar ahora' : "Can't speak now"}
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
	.lesson-embed { min-height: 0; background: transparent; }

	.premium-header-minimal {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(16px + env(safe-area-inset-top)) 24px 16px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--ink-200);
	}

	.header-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.1;
	}

	.session-index {
		font-size: 17px;
		font-weight: 900;
		color: var(--fg-primary);
		letter-spacing: -0.01em;
	}

	.total-label {
		font-size: 10px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.close-btn {
		color: var(--fg-secondary);
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.speaking-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(20px, 5vh, 32px);
		padding: 24px 0 8px;
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
		font-weight: 800;
		letter-spacing: 0.14em;
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
		font-weight: 800;
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

	.status-msg {
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-tertiary);
		text-align: center;
	}

	.mic-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 12px 0 4px;
	}

	.mic-btn {
		width: 104px;
		height: 104px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, var(--hinomaru-red), #d4002f);
		color: white;
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10px 32px rgba(188, 0, 45, 0.32);
		transition: transform 0.18s cubic-bezier(0.34, 1.5, 0.64, 1);
	}

	.mic-btn:active {
		transform: scale(0.94);
	}

	.mic-btn[data-state='recording'] {
		background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
		transform: scale(1.04);
	}

	.mic-btn[data-state='done'] {
		background: linear-gradient(135deg, #2e7d5b, #1f5e44);
	}

	.mic-ring {
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		border: 2px solid var(--hinomaru-red);
		opacity: 0;
		pointer-events: none;
	}

	.mic-ring-2 {
		inset: -16px;
	}

	.mic-btn[data-state='recording'] .mic-ring {
		animation: pulse-ring 1.6s cubic-bezier(0.24, 0, 0.38, 1) infinite;
	}
	.mic-btn[data-state='recording'] .mic-ring-2 {
		animation: pulse-ring 1.6s cubic-bezier(0.24, 0, 0.38, 1) infinite 0.4s;
	}

	@keyframes pulse-ring {
		0% {
			transform: scale(0.9);
			opacity: 0.7;
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
		}
	}

	.wave {
		display: flex;
		align-items: center;
		gap: 4px;
		height: 36px;
	}
	.wave span {
		width: 4px;
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

	.dots {
		display: flex;
		gap: 6px;
	}
	.dots span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: white;
		animation: dot-pulse 1s ease-in-out infinite;
	}
	@keyframes dot-pulse {
		0%,
		80%,
		100% {
			opacity: 0.3;
			transform: scale(0.8);
		}
		40% {
			opacity: 1;
			transform: scale(1.1);
		}
	}

	.mic-label {
		font-size: 11px;
		font-weight: 800;
		color: var(--fg-secondary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.error-msg {
		font-size: 14px;
		font-weight: 600;
		color: var(--hinomaru-red);
		text-align: center;
	}

	.result-card {
		width: 100%;
		background: var(--bg-surface);
		border-radius: 20px;
		border: 1.5px solid var(--ink-200);
		padding: 18px 18px 16px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.result-card[data-verdict='correct'] {
		border-color: var(--success);
		background: var(--success-wash);
	}
	.result-card[data-verdict='close'] {
		border-color: #d4a017;
		background: rgba(212, 160, 23, 0.08);
	}
	.result-card[data-verdict='wrong'] {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	.result-head {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.verdict-icon {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}
	.result-card[data-verdict='correct'] .verdict-icon {
		background: var(--success);
	}
	.result-card[data-verdict='close'] .verdict-icon {
		background: #d4a017;
	}
	.result-card[data-verdict='wrong'] .verdict-icon {
		background: var(--hinomaru-red);
	}

	.verdict-text {
		font-size: 16px;
		font-weight: 800;
		color: var(--fg-primary);
		flex: 1;
	}
	.verdict-pct {
		font-size: 18px;
		font-weight: 900;
		color: var(--fg-primary);
	}

	.result-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 12px 14px;
		background: var(--bg-muted);
		border-radius: 12px;
	}

	.result-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}
	.result-label {
		font-size: 10px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
	}
	.result-value {
		font-size: 15px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.session-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 20px 100px;
		overflow-y: auto;
	}

	.transcript-box {
		font-size: 15px;
		font-family: var(--font-jp);
		color: var(--fg-secondary);
		font-weight: 600;
		font-style: italic;
		text-align: center;
	}

	.skip-link {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-decoration: underline;
		background: none;
		border: none;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.2s;
		padding: 4px 8px;
	}
	.skip-link:hover {
		opacity: 1;
		color: var(--hinomaru-red);
	}
</style>
