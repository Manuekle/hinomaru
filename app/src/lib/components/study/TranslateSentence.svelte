<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import {
		VolumeHighIcon,
		Cancel01Icon,
		CheckmarkCircle01Icon,
		KeyboardIcon,
		ArrowLeft02Icon
	} from '@hugeicons/core-free-icons';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { safeRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeIn, fadeUp } from '$lib/motion';
	import { buildSentence, type BuiltSentence } from '$lib/learning/sentenceBuilder';

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
		pool?: any[];
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
		pool = [],
		onAnswer
	}: Props = $props();

	const isLesson = $derived(mode === 'lesson');
	const initialCards = $derived(isLesson && lessonCard ? [lessonCard, ...pool] : (deckCards ?? []));

	const queue = $derived.by(() => createMistakeQueue<any>(initialCards));
	const currentCard = $derived(isLesson ? lessonCard : queue.current);

	const sentence = $derived<BuiltSentence | null>(
		(() => {
			if (!currentCard) return null;
			const built = buildSentence(initialCards, currentCard, $locale === 'es' ? 'es' : 'en');
			if (built) return built;
			if (currentCard.example && currentCard.example_es) {
				const exampleJp = String(currentCard.example);
				const exampleTr = $locale === 'es' ? currentCard.example_es : currentCard.example_en || currentCard.example_es;
				return {
					templateId: 'fallback-example',
					tokens: [exampleJp],
					shuffled: [exampleJp],
					suffix: '',
					translation: String(exampleTr),
					primarySlot: '',
					primaryToken: exampleJp,
					primaryCard: currentCard,
					primaryCategory: ''
				} as unknown as BuiltSentence;
			}
			return null;
		})()
	);

	interface Chip {
		tok: string;
		uid: number;
		romaji: string;
	}

	let bank = $state<Chip[]>([]);
	let answer = $state<Chip[]>([]);
	let typed = $state('');
	let useKeyboard = $state(false);
	let submitted = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);

	$effect(() => {
		if (sentence) {
			bank = sentence.shuffled.map((tok, i) => ({
				tok,
				uid: i,
				romaji: safeRomaji(undefined, tok)
			}));
			answer = [];
			typed = '';
			submitted = false;
			struggled = false;
		}
	});

	// Auto-advance when card has no sentence and no example fallback (no dead-end UI)
	$effect(() => {
		if (currentCard && !sentence) {
			queueMicrotask(() => {
				if (isLesson) onAnswer?.(true);
				else if (!queue.isLast) queue.advance();
				else onComplete?.({ correct, total: queue.originalTotal });
			});
		}
	});

	const ready = $derived(useKeyboard ? typed.trim().length > 0 : answer.length > 0);

	const isCorrectAnswer = $derived.by(() => {
		if (!sentence) return false;
		if (useKeyboard) {
			const got = typed.trim().replace(/\s+/g, '');
			const expected = (sentence.tokens.join('') + (sentence.suffix ?? '')).replace(/\s+/g, '');
			const expectedNoSuffix = sentence.tokens.join('').replace(/\s+/g, '');
			return got === expected || got === expectedNoSuffix;
		}
		const got = answer.map((c) => c.tok);
		return got.length === sentence.tokens.length && got.every((tt, i) => tt === sentence.tokens[i]);
	});

	function addToAnswer(chip: Chip) {
		if (submitted) return;
		answer = [...answer, chip];
		bank = bank.filter((c) => c.uid !== chip.uid);
	}

	function removeFromAnswer(chip: Chip) {
		if (submitted) return;
		bank = [...bank, chip];
		answer = answer.filter((c) => c.uid !== chip.uid);
	}

	function clearAnswer() {
		if (submitted || !sentence) return;
		bank = sentence.shuffled.map((tok, i) => ({ tok, uid: i, romaji: safeRomaji(undefined, tok) }));
		answer = [];
	}

	function toggleKeyboard() {
		if (submitted) return;
		useKeyboard = !useKeyboard;
		if (useKeyboard) clearAnswer();
		else typed = '';
	}

	function check() {
		if (submitted || !ready) return;
		submitted = true;
		if (isCorrectAnswer) {
			correct++;
			playCorrect();
			if (sentence) speakJapanese(sentence.tokens.join('') + (sentence.suffix ?? ''));
		} else {
			struggled = true;
			playWrong();
		}
	}

	function nextCard() {
		if (onCardProgress && currentCard) onCardProgress(currentCard, isCorrectAnswer, struggled);
		if (isLesson) {
			onAnswer?.(isCorrectAnswer);
			return;
		}
		if (!isCorrectAnswer) queue.requeueCurrent();
		if (queue.isLast) {
			showAnticipation = true;
			onComplete?.({ correct, total: queue.originalTotal });
		} else {
			queue.advance();
		}
	}

	function _onExit() {
		if (isLesson) onAnswer?.(false);
		else onExit?.();
	}

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (submitted) nextCard();
			else if (ready) check();
		}
	}

	function playSentence() {
		if (sentence) speakJapanese(sentence.tokens.join('') + (sentence.suffix ?? ''));
	}
</script>

<div class="session-layout premium-bg" class:lesson-embed={isLesson}>
	{#if !isLesson}
		<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
			<button class="close-btn" onclick={_onExit}>
				<Icon icon={Cancel01Icon} size={24} color="currentColor" />
			</button>
			<div class="header-progress">
				<span class="session-index">{queue.index + 1} / {queue.total}</span>
			</div>
			<div style="width: 44px;"></div>
		</div>
	{/if}

	<div class="session-container">
		{#if !isLesson && initialCards.length === 0}
			<SessionEmptyState
				totalCards={totalCards}
				learnedCount={learnedCount}
				sessionCount={0}
				deckId={deck?.id}
				modeLabel={t('mode.type.title', $locale)}
			/>
		{:else if currentCard && sentence}
			<div class="translate-viewer">
				<div class="prompt-card">
					<span class="prompt-tag">{$locale === 'es' ? 'TRADUCIR' : 'TRANSLATE'}</span>
					<div class="sentence-translation">{sentence.translation}</div>
				</div>

				{#if useKeyboard}
					<div class="keyboard-input-wrap">
						<label class="kb-label" for="kb-input">
							{$locale === 'es' ? 'Escribe en japonés' : 'Type in Japanese'}
						</label>
						<input
							id="kb-input"
							type="text"
							bind:value={typed}
							onkeydown={keydown}
							lang="ja"
							inputmode="text"
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
							spellcheck="false"
							disabled={submitted}
							class="kb-input jp"
							class:is-correct={submitted && isCorrectAnswer}
							class:is-wrong={submitted && !isCorrectAnswer}
							placeholder="日本語…"
						/>
					</div>
				{:else}
					<div
						class="answer-zone"
						class:is-correct={submitted && isCorrectAnswer}
						class:is-wrong={submitted && !isCorrectAnswer}
					>
						{#if answer.length === 0}
							<div class="answer-placeholder">
								{$locale === 'es' ? 'Toca las palabras para empezar' : 'Tap words to start'}
							</div>
						{:else}
							{#each answer as chip (chip.uid)}
								<button
									class="token-chip is-selected"
									disabled={submitted}
									onclick={() => removeFromAnswer(chip)}
								>
									<span class="chip-jp jp">{chip.tok}</span>
									{#if chip.romaji}<span class="chip-romaji">{chip.romaji}</span>{/if}
								</button>
							{/each}
						{/if}
					</div>

					<div class="tokens-bank">
						{#each bank as chip (chip.uid)}
							<button class="token-chip" onclick={() => addToAnswer(chip)} disabled={submitted}>
								<span class="chip-jp jp">{chip.tok}</span>
								{#if chip.romaji}<span class="chip-romaji">{chip.romaji}</span>{/if}
							</button>
						{/each}
					</div>
				{/if}

				{#if submitted}
					<div
						class="feedback-bar"
						class:is-correct={isCorrectAnswer}
						use:fadeUp={{ y: 10 }}
					>
						<Icon
							icon={isCorrectAnswer ? CheckmarkCircle01Icon : Cancel01Icon}
							size={18}
							color="currentColor"
						/>
						<span class="fb-label">
							{isCorrectAnswer ? t('session.correct', $locale) : t('session.wrong', $locale)}
						</span>
						<button onclick={playSentence} class="audio-mini" aria-label="Play">
							<Icon icon={VolumeHighIcon} size={16} color="currentColor" />
						</button>
					</div>
					<div class="reveal-row" use:fadeIn>
						<div class="reveal-jp jp">{sentence.tokens.join('') + (sentence.suffix ?? '')}</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if currentCard && sentence && !showAnticipation}
		<StickyFooter>
			<div class="footer-row">
				{#if !useKeyboard && answer.length > 0 && !submitted}
					<button class="icon-btn hm-btn hm-btn-secondary" onclick={clearAnswer} aria-label="Limpiar">
						<Icon icon={ArrowLeft02Icon} size={20} color="currentColor" />
					</button>
				{/if}
				{#if submitted}
					<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={nextCard}>
						{t('session.next', $locale)}
					</button>
				{:else}
					<button
						class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg"
						onclick={check}
						disabled={!ready}
					>
						{t('session.check', $locale)}
					</button>
					<button
						class="icon-btn hm-btn"
						class:hm-btn-secondary={!useKeyboard}
						class:hm-btn-primary={useKeyboard}
						onclick={toggleKeyboard}
						aria-label={$locale === 'es' ? 'Cambiar a teclado' : 'Toggle keyboard'}
						aria-pressed={useKeyboard}
					>
						<Icon icon={KeyboardIcon} size={20} color="currentColor" />
					</button>
				{/if}
			</div>
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
	.lesson-embed {
		min-height: 0;
		background: transparent;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.1;
	}
	.session-index {
		font-size: 17px;
		font-weight: 900;
		color: var(--fg-primary);
	}
	.close-btn {
		color: var(--fg-secondary);
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
	}
	.session-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 20px 100px;
	}
	.translate-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 18px;
		padding: 20px 0 8px;
	}
	.prompt-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 18px 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		text-align: center;
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
	.sentence-translation {
		font-size: 19px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.4;
	}
	.answer-zone {
		width: 100%;
		min-height: 110px;
		background: var(--bg-muted);
		border: 1.5px dashed var(--ink-200);
		border-radius: 20px;
		padding: 14px;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}
	.answer-zone.is-correct {
		border-color: var(--success);
		background: var(--success-wash);
		border-style: solid;
	}
	.answer-zone.is-wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		border-style: solid;
	}
	.answer-placeholder {
		color: var(--fg-tertiary);
		font-size: 14px;
		font-weight: 600;
		opacity: 0.6;
	}
	.tokens-bank {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		width: 100%;
	}
	.token-chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 8px 14px;
		border-radius: 14px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		color: var(--fg-primary);
		cursor: pointer;
		box-shadow: 0 3px 0 var(--ink-200);
		transition: all 0.1s;
		font-family: inherit;
	}
	.token-chip:not(:disabled):active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 var(--ink-200);
	}
	.token-chip.is-selected {
		background: var(--fg-primary);
		color: white;
		border-color: var(--fg-primary);
		box-shadow: 0 3px 0 #000;
	}
	.token-chip:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.chip-jp {
		font-size: 18px;
		font-weight: 700;
		line-height: 1.1;
	}
	.chip-romaji {
		font-size: 11px;
		font-weight: 600;
		opacity: 0.75;
		color: var(--hinomaru-red);
	}
	.token-chip.is-selected .chip-romaji {
		color: rgba(255, 255, 255, 0.7);
	}
	.keyboard-input-wrap {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.kb-label {
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
	}
	.kb-input {
		width: 100%;
		padding: 18px 20px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		font-size: 22px;
		font-weight: 700;
		color: var(--fg-primary);
		text-align: center;
		font-family: var(--font-jp);
	}
	.kb-input:focus {
		outline: 2px solid var(--hinomaru-red);
		outline-offset: 2px;
	}
	.kb-input.is-correct {
		border-color: var(--success);
		background: var(--success-wash);
		color: var(--success);
	}
	.kb-input.is-wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}
	.feedback-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 14px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}
	.feedback-bar.is-correct {
		background: var(--success-wash);
		color: var(--success);
	}
	.fb-label {
		font-size: 15px;
		font-weight: 800;
		flex: 1;
	}
	.audio-mini {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1.5px solid currentColor;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: inherit;
		cursor: pointer;
	}
	.reveal-row {
		padding: 14px;
		background: var(--bg-surface);
		border: 1px solid var(--success);
		border-radius: 14px;
		text-align: center;
	}
	.reveal-jp {
		font-size: 22px;
		font-weight: 700;
		color: var(--fg-primary);
	}
	.footer-row {
		display: flex;
		gap: 10px;
		align-items: center;
		max-width: 480px;
		margin: 0 auto;
		width: 100%;
	}
	.icon-btn {
		width: 54px;
		height: 54px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
</style>
