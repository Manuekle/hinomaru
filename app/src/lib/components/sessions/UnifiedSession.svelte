<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { fadeIn } from '$lib/motion';
	import { init, answer, isComplete, progressPct, accuracyPct, type EngineState } from '$lib/learning/engine';
	import { buildSteps } from '$lib/learning/stepGenerator';
	import type { LessonType } from '$lib/data/roadmap';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon, TranslateIcon } from '@hugeicons/core-free-icons';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';

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

	interface Props {
		cards: any[];
		lessonType: LessonType;
		onComplete: (results: { correct: number; total: number; mistakes: number; state: EngineState }) => void;
		onExit: () => void;
		onCardProgress?: (card: any, correct: boolean, struggled: boolean) => void;
	}

	let { cards, lessonType, onComplete, onExit, onCardProgress }: Props = $props();

	let engineState = $state<EngineState>(init(buildSteps(lessonType, cards)));
	let stepKey = $state(0);
	let showAnticipation = $state(false);

	$effect(() => {
		engineState = init(buildSteps(lessonType, cards));
		stepKey = 0;
		showAnticipation = false;
	});

	const currentStep = $derived(engineState.current);
	const currentCard = $derived(
		currentStep ? cards.find((c) => c.id === currentStep.cardId) ?? null : null
	);
	const distractors = $derived(
		currentCard ? cards.filter((c) => c.id !== currentCard.id) : []
	);
	const stepsDone = $derived(engineState.done.length);
	const stepsTotal = $derived(engineState.totalPlanned);

	$effect(() => {
		if (isComplete(engineState) && !showAnticipation) {
			showAnticipation = true;
			const accuracy = accuracyPct(engineState) / 100;
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
			onCardProgress(currentCard, correct, !correct);
		}
		stepKey += 1;
		engineState = answer(engineState, correct);
	}
</script>

<div class="session-layout premium-bg">
	<!-- Same header chrome as FlashcardSession / QuizSession -->
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={onExit} aria-label="Salir">
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			{Math.min(stepsDone + 1, stepsTotal)} / {stepsTotal}
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

	<!-- Step content -->
	<div class="session-container">
		{#if currentStep && currentCard}
			{#key stepKey}
				<div class="step-wrap">
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
				</div>
			{/key}
		{/if}
	</div>
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
		flex-shrink: 0;
	}

	.header-progress {
		font-size: 18px;
		font-weight: 800;
		color: var(--fg-primary);
	}

	.close-btn,
	.lang-btn {
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

	.session-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		/* Padding so step footer isn't hidden behind sticky footer */
		padding-bottom: 100px;
	}

	.step-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
		padding: 24px 20px 0;
	}
</style>
