<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { showRomaji } from '$lib/stores/settings';
	import { fadeIn } from '$lib/motion';
	import {
		init,
		answer,
		isComplete,
		progressPct,
		accuracyPct,
		type EngineState
	} from '$lib/learning/engine';
	import { buildSteps } from '$lib/learning/stepGenerator';
	import type { LessonType } from '$lib/data/roadmap';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon, TranslateIcon } from '@hugeicons/core-free-icons';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import StudySessionLayout from '$lib/components/study/StudySessionLayout.svelte';

	// Canonical study components (also used by /deck/ routes)
	import Flashcards from '$lib/components/study/Flashcards.svelte';
	import MultipleChoice from '$lib/components/study/MultipleChoice.svelte';
	import WriteKanji from '$lib/components/study/WriteKanji.svelte';
	import MatchPairs from '$lib/components/study/MatchPairs.svelte';
	import Pronunciation from '$lib/components/study/Pronunciation.svelte';
	import TranslateSentence from '$lib/components/study/TranslateSentence.svelte';
	// Lesson-only steps (no deck mode equivalent)
	import StepListen from '$lib/learning/components/StepListen.svelte';
	import StepFillSentence from '$lib/learning/components/StepFillSentence.svelte';
	import StepBuildSentence from '$lib/learning/components/StepBuildSentence.svelte';

	interface Props {
		cards: any[];
		lessonType: LessonType;
		onComplete: (results: {
			correct: number;
			total: number;
			mistakes: number;
			state: EngineState;
		}) => void;
		onExit: () => void;
		onCardProgress?: (card: any, correct: boolean, struggled: boolean) => void;
	}

	let { cards, lessonType, onComplete, onExit, onCardProgress }: Props = $props();

	let engineState = $state<EngineState>(init(buildSteps(lessonType, cards)));
	let stepKey = $state(0);
	let showAnticipation = $state(false);
	let canSpeak = $state(true);

	$effect(() => {
		engineState = init(buildSteps(lessonType, cards));
		stepKey = 0;
		showAnticipation = false;
		canSpeak = true;
	});

	// Auto-skip speak tasks if user disabled them for the session
	$effect(() => {
		if (engineState.current?.kind === 'speak' && !canSpeak) {
			onStepAnswer(true);
		}
	});

	const currentStep = $derived(engineState.current);
	const currentCard = $derived(
		currentStep ? (cards.find((c) => c.id === currentStep.cardId) ?? null) : null
	);
	const distractors = $derived(currentCard ? cards.filter((c) => c.id !== currentCard.id) : []);
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

<StudySessionLayout
	onExit={onExit}
	currentIndex={stepsDone}
	totalCount={stepsTotal}
>
	<!-- Step content -->
	<div class="lesson-step-host">
		{#if currentStep && currentCard}
			{#key stepKey}
				<div class="step-wrap content-center">
					{#if currentStep.kind === 'recognize'}
						<Flashcards mode="lesson" card={currentCard} onAnswer={onStepAnswer} />
					{:else if currentStep.kind === 'listen'}
						<StepListen card={currentCard} {distractors} onAnswer={onStepAnswer} />
					{:else if currentStep.kind === 'listen_select'}
						<MultipleChoice
							mode="lesson"
							card={currentCard}
							{distractors}
							onAnswer={onStepAnswer}
						/>
					{:else if currentStep.kind === 'speak'}
						<Pronunciation
							mode="lesson"
							card={currentCard}
							onAnswer={onStepAnswer}
							onDisableSpeak={() => (canSpeak = false)}
						/>
					{:else if currentStep.kind === 'write'}
						<WriteKanji mode="lesson" card={currentCard} onAnswer={onStepAnswer} />
					{:else if currentStep.kind === 'fill_sentence'}
						<StepFillSentence
							card={currentCard}
							pool={cards}
							retries={currentStep.retries}
							onAnswer={onStepAnswer}
						/>
					{:else if currentStep.kind === 'build_sentence'}
						<StepBuildSentence card={currentCard} pool={cards} onAnswer={onStepAnswer} />
					{:else if currentStep.kind === 'translate_sentence'}
						<TranslateSentence
							mode="lesson"
							card={currentCard}
							pool={cards}
							onAnswer={onStepAnswer}
						/>
					{:else if currentStep.kind === 'match_pairs'}
						<MatchPairs
							mode="lesson"
							card={currentCard}
							pool={distractors}
							onAnswer={onStepAnswer}
						/>
					{/if}
				</div>
			{/key}
		{/if}
	</div>
</StudySessionLayout>

{#if showAnticipation}
	<AnticipationScreen />
{/if}

<style>

	.lesson-step-host {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		/* No horizontal padding here — each lesson-mode study component
		   wraps in its own .session-container which already provides
		   horizontal padding via the global rule in app.css. Only reserve
		   bottom space so the step content isn't hidden behind StickyFooter. */
		padding-bottom: 100px;
	}

	.step-wrap {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding-top: 24px;
	}
</style>
