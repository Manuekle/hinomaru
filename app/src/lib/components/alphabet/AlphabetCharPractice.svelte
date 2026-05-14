<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import {
		ALL_CHARS,
		type KanaChar,
		type KanaWord,
		poolFor,
		shuffle,
		wordsForCharSet
	} from '$lib/data/alphabetCharacters';
	import { recordResult } from '$lib/stores/alphabetProgress';
	import AlphabetCharMcq from './AlphabetCharMcq.svelte';
	import AlphabetListenWord from './AlphabetListenWord.svelte';
	import WriteKanji from '$lib/components/study/WriteKanji.svelte';
	import StudySummary from '$lib/components/study/StudySummary.svelte';
	import StudySessionLayout from '$lib/components/study/StudySessionLayout.svelte';

	type StepKind = 'sound_for_char' | 'char_for_sound' | 'write' | 'listen_word';

	interface Step {
		kind: StepKind;
		pool?: KanaChar[];
		word?: KanaWord;
	}

	interface Props {
		char: KanaChar;
		learnedJps: Set<string>;
		onDone: () => void;
	}

	let { char, learnedJps, onDone }: Props = $props();

	function buildQueue(): Step[] {
		const steps: Step[] = [
			{ kind: 'sound_for_char', pool: poolFor(char) },
			{ kind: 'char_for_sound', pool: poolFor(char) },
			{ kind: 'write' }
		];
		const words = wordsForCharSet(char.jp, learnedJps, char.script);
		if (words.length > 0) {
			steps.push({ kind: 'listen_word', word: shuffle(words)[0] });
		}
		return steps;
	}

	let queue = $state<Step[]>(buildQueue());
	let stepIdx = $state(0);
	let stepKey = $state(0);
	let correctCount = $state(0);
	let done = $state(false);

	const current = $derived(queue[stepIdx]);

	function advance(correct: boolean) {
		recordResult(char.id, correct);
		if (correct) {
			correctCount++;
			playCorrect();
		} else {
			playWrong();
		}
		if (stepIdx >= queue.length - 1) {
			done = true;
		} else {
			stepIdx++;
			stepKey++;
		}
	}

	function onWordAnswer(ok: boolean) {
		if (current?.word) {
			for (const jp of current.word.chars) {
				const kc = ALL_CHARS.find((x) => x.jp === jp && x.script === char.script);
				if (kc && kc.id !== char.id) recordResult(kc.id, ok);
			}
		}
		advance(ok);
	}

	const writeCard = $derived({
		jp: char.jp,
		romaji: char.romaji,
		es: char.romaji,
		en: char.romaji
	});
</script>

<div class="practice-wrap">
	{#if done}
		<StudySummary
			correct={correctCount}
			total={queue.length}
			onContinue={onDone}
		/>
	{:else if current}
		<div class="step-meta">
			<span class="step-tag">
				{t('session.step', $locale)}
				{stepIdx + 1} / {queue.length}
			</span>
		</div>
		<StudySessionLayout
			isLesson={true}
			currentIndex={stepIdx}
			totalCount={queue.length}
		>
			{#key stepKey}
				{#if current.kind === 'sound_for_char' && current.pool}
					<AlphabetCharMcq
						mode="lesson"
						target={char}
						options={shuffle([char, ...current.pool])}
						direction="sound_for_char"
						onAnswer={advance}
					/>
				{:else if current.kind === 'char_for_sound' && current.pool}
					<AlphabetCharMcq
						mode="lesson"
						target={char}
						options={shuffle([char, ...current.pool])}
						direction="char_for_sound"
						onAnswer={advance}
					/>
				{:else if current.kind === 'write'}
					<WriteKanji mode="lesson" card={writeCard} onAnswer={advance} autoAdvance={true} />
				{:else if current.kind === 'listen_word' && current.word}
					<AlphabetListenWord mode="lesson" word={current.word} script={char.script} onAnswer={onWordAnswer} />
				{/if}
			{/key}
		</StudySessionLayout>
	{/if}
</div>

<style>
	.practice-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-height: 420px;
	}

	.step-meta {
		display: flex;
		justify-content: center;
	}

	.step-tag {
		font-size: 11px;
		font-weight: 800;
		letter-spacing: -0.02em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
		background: var(--bg-muted);
		padding: 4px 12px;
		border-radius: 20px;
	}
</style>
