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
	import StudySessionLayout from './StudySessionLayout.svelte';
	import { fadeIn, fadeUp } from '$lib/motion';
	import { buildSentence, type BuiltSentence } from '$lib/learning/sentenceBuilder';
	import { splitJpInteractive } from '$lib/speaking/normalize';

	function shuffleArr<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

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
				const exampleTr =
					$locale === 'es'
						? currentCard.example_es
						: currentCard.example_en || currentCard.example_es;
				const hasKanji = (s: string) => /[㐀-䶿一-鿿]/.test(s);
				// Prefer a kana-only reading so every chip has a romaji.
				let source = exampleJp;
				if (hasKanji(source)) {
					if (currentCard.kana && !hasKanji(String(currentCard.kana))) {
						source = String(currentCard.kana);
					} else if (currentCard.jp && !hasKanji(String(currentCard.jp))) {
						source = String(currentCard.jp);
					}
				}
				// If we still have kanji, we can't build a clean kana-chip exercise.
				// Returning null triggers the auto-advance effect.
				if (hasKanji(source)) return null;
				const tokens = splitJpInteractive(source);
				const distractorPool: string[] = [];
				const seen = new Set(tokens);
				for (const c of initialCards) {
					if (!c || c.id === currentCard.id) continue;
					const candidates = [c.kana, c.jp].map((v) => String(v || ''));
					const src = candidates.find((s) => s && !hasKanji(s)) ?? '';
					if (!src) continue;
					for (const tok of splitJpInteractive(src)) {
						if (hasKanji(tok)) continue;
						if (!seen.has(tok)) {
							seen.add(tok);
							distractorPool.push(tok);
						}
					}
				}
				const distractors = shuffleArr(distractorPool).slice(0, Math.max(2, 6 - tokens.length));
				return {
					templateId: 'fallback-example',
					tokens,
					shuffled: shuffleArr([...tokens, ...distractors]),
					suffix: '',
					translation: String(exampleTr),
					primarySlot: '',
					primaryToken: tokens[0] ?? source,
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

	let lastSpokenCardId = $state<string | null>(null);
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
			const cid = currentCard?.id ?? null;
			if (cid && cid !== lastSpokenCardId) {
				lastSpokenCardId = cid;
				speakJapanese(sentence.tokens.join('') + (sentence.suffix ?? ''));
			}
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
		speakJapanese(chip.tok);
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

<StudySessionLayout
	{isLesson}
	onExit={_onExit}
	currentIndex={queue.index}
	totalCount={queue.total}
>
	{#if !isLesson && initialCards.length === 0}
		<SessionEmptyState
			{totalCards}
			{learnedCount}
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
					<div class="feedback-bar" class:is-correct={isCorrectAnswer} use:fadeUp={{ y: 10 }}>
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

	{#if sentence && !showAnticipation}
		<StickyFooter>
			{#if !submitted}
				<button class="hm-btn hm-btn-secondary icon-btn" onclick={toggleKeyboard} aria-label="Toggle keyboard">
					<Icon icon={useKeyboard ? ArrowLeft02Icon : KeyboardIcon} size={24} color="currentColor" />
				</button>
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={() => nextCard()}>
					{t('session.skip', $locale)}
				</button>
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" disabled={!ready} onclick={check}>
					{t('session.check', $locale)}
				</button>
			{:else}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={nextCard}>
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
	.translate-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: clamp(18px, 3vh, 24px);
		padding: clamp(20px, 4vh, 32px) 16px clamp(20px, 3vh, 28px);
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
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
		letter-spacing: -0.04em;
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
		padding: 16px;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
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
		gap: 12px;
		justify-content: center;
		width: 100%;
	}
	.token-chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 10px 14px;
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
		letter-spacing: -0.04em;
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
