<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { init, answer, isComplete, progressPct, accuracyPct, type EngineState } from '$lib/learning/engine';
	import { buildSteps } from '$lib/learning/stepGenerator';
	import type { LessonType } from '$lib/data/roadmap';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';

	// Step components
	import StepRecognize from '$lib/learning/components/StepRecognize.svelte';
	import StepChoose from '$lib/learning/components/StepChoose.svelte';
	import StepListen from '$lib/learning/components/StepListen.svelte';
	import StepListenSelect from '$lib/learning/components/StepListenSelect.svelte';
	import StepSpeak from '$lib/learning/components/StepSpeak.svelte';
	import StepWrite from '$lib/learning/components/StepWrite.svelte';
	import StepFillSentence from '$lib/learning/components/StepFillSentence.svelte';
	import StepBuildSentence from '$lib/learning/components/StepBuildSentence.svelte';
	import StepTranslateSentence from '$lib/learning/components/StepTranslateSentence.svelte';
	import StepMatchPairs from '$lib/learning/components/StepMatchPairs.svelte';
	import LessonComplete from '$lib/learning/components/LessonComplete.svelte';

	interface Props {
		cards: any[];
		lessonType: LessonType;
		lessonTitle?: string;
		onComplete: (results: { correct: number; total: number; mistakes: number; state: EngineState }) => void;
		onExit: () => void;
		onCardProgress?: (card: any, correct: boolean) => void;
	}

	let { cards, lessonType, lessonTitle = '', onComplete, onExit, onCardProgress }: Props = $props();

	// Build steps from cards + lesson type
	const steps = $derived(buildSteps(lessonType, cards));
	let engineState = $state<EngineState>(init(steps));

	$effect(() => {
		// Reinitialize when cards/lessonType change
		engineState = init(buildSteps(lessonType, cards));
		startTime = Date.now();
		xpAwarded = 0;
		showComplete = false;
	});

	let startTime = $state(Date.now());
	let xpAwarded = $state(0);
	let showComplete = $state(false);
	let stepKey = $state(0); // force re-mount step on change

	const currentStep = $derived(engineState.current);
	const currentCard = $derived(
		currentStep ? cards.find((c) => c.id === currentStep.cardId) ?? null : null
	);
	const distractors = $derived(
		currentCard ? cards.filter((c) => c.id !== currentCard.id) : []
	);
	const progress = $derived(progressPct(engineState));
	const completed = $derived(isComplete(engineState));

	$effect(() => {
		if (completed && !showComplete) {
			const elapsedSec = Math.round((Date.now() - startTime) / 1000);
			const accuracy = accuracyPct(engineState) / 100;
			xpAwarded = Math.round(engineState.totalPlanned * 5 * (0.5 + accuracy * 0.5));
			showComplete = true;
			onComplete({
				correct: engineState.correct,
				total: engineState.totalPlanned,
				mistakes: engineState.mistakes,
				state: engineState
			});
		}
	});

	function onStepAnswer(correct: boolean) {
		if (onCardProgress && currentCard) {
			onCardProgress(currentCard, correct);
		}
		stepKey += 1;
		engineState = answer(engineState, correct);
	}

	const elapsedSec = $derived(Math.round((Date.now() - startTime) / 1000));
</script>

<div class="session-wrap">
	{#if showComplete}
		<LessonComplete
			correct={engineState.correct}
			mistakes={engineState.mistakes}
			totalSteps={engineState.totalPlanned}
			{xpAwarded}
			{elapsedSec}
		/>
	{:else}
		<!-- Header -->
		<div class="session-header">
			<button class="exit-btn" onclick={onExit} aria-label="Salir">
				<Icon icon={Cancel01Icon} size={20} />
			</button>

			<!-- Progress bar -->
			<div class="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
				<div class="progress-fill" style="width: {progress}%"></div>
			</div>

			<!-- Pronunciation toggle -->
			<button class="pronun-toggle" onclick={() => showRomaji.toggle()} aria-label="Toggle romaji">
				<span class="toggle-kana" class:active={!$showRomaji}>あ</span>
				<span class="toggle-rom" class:active={$showRomaji}>A</span>
			</button>
		</div>

		<!-- Step -->
		<div class="step-wrap">
			{#key stepKey}
				<div class="step-inner" in:fly={{ x: 30, duration: 220 }} out:fade={{ duration: 100 }}>
					{#if currentStep && currentCard}
						{#if currentStep.kind === 'recognize'}
							<StepRecognize card={currentCard} onAnswer={onStepAnswer} />
						{:else if currentStep.kind === 'choose'}
							<StepChoose card={currentCard} distractors={distractors} onAnswer={onStepAnswer} />
						{:else if currentStep.kind === 'listen'}
							<StepListen card={currentCard} distractors={distractors} onAnswer={onStepAnswer} />
						{:else if currentStep.kind === 'listen_select'}
							<StepListenSelect card={currentCard} distractors={distractors} onAnswer={onStepAnswer} />
						{:else if currentStep.kind === 'speak'}
							<StepSpeak card={currentCard} onAnswer={onStepAnswer} />
						{:else if currentStep.kind === 'write'}
							<StepWrite card={currentCard} onAnswer={onStepAnswer} />
						{:else if currentStep.kind === 'fill_sentence'}
							<StepFillSentence card={currentCard} pool={cards} retries={currentStep.retries} onAnswer={onStepAnswer} />
						{:else if currentStep.kind === 'build_sentence'}
							<StepBuildSentence card={currentCard} pool={cards} onAnswer={onStepAnswer} />
						{:else if currentStep.kind === 'translate_sentence'}
							<StepTranslateSentence card={currentCard} pool={cards} onAnswer={onStepAnswer} />
						{:else if currentStep.kind === 'match_pairs'}
							<StepMatchPairs card={currentCard} pool={distractors} onAnswer={onStepAnswer} />
						{/if}
					{/if}
				</div>
			{/key}
		</div>
	{/if}
</div>

<style>
	.session-wrap {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		max-width: 480px;
		margin: 0 auto;
		padding: 0 20px 32px;
		background: var(--bg-page);
	}

	.session-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 0 20px;
		flex-shrink: 0;
	}

	.exit-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--ink-100);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--fg-secondary);
		flex-shrink: 0;
		transition: background 0.2s;
	}
	.exit-btn:hover { background: var(--ink-200); }

	.progress-track {
		flex: 1;
		height: 8px;
		background: var(--ink-100);
		border-radius: 99px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--hinomaru-red);
		border-radius: 99px;
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.pronun-toggle {
		display: flex;
		align-items: center;
		gap: 4px;
		background: var(--ink-100);
		border: none;
		border-radius: 99px;
		padding: 6px 12px;
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.2s;
	}
	.pronun-toggle:hover { background: var(--ink-200); }

	.toggle-kana,
	.toggle-rom {
		font-size: 14px;
		font-weight: 800;
		color: var(--fg-tertiary);
		transition: color 0.2s;
		font-family: var(--font-jp);
	}
	.toggle-kana.active,
	.toggle-rom.active {
		color: var(--hinomaru-red);
	}

	.step-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
	}

	.step-inner {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
	}
</style>
