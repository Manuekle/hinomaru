<script lang="ts">
	import WelcomeStep from './WelcomeStep.svelte';
	import FeaturesStep from './FeaturesStep.svelte';
	import MotivationStep from './MotivationStep.svelte';
	import ExperienceStep from './ExperienceStep.svelte';
	import PracticeStep from './PracticeStep.svelte';
	import StoriesStep from './StoriesStep.svelte';
	import SRSStep from './SRSStep.svelte';
	import VoiceStep from './VoiceStep.svelte';
	import GoalStep from './GoalStep.svelte';
	import SummaryStep from './SummaryStep.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import { preferredVoice, dailyGoal, srsEnabled as srsStore } from '$lib/stores/settings';

	let { onFinish } = $props();

	let step = $state(1);
	const totalSteps = 10;
	let selections = $state({
		motivation: '',
		experience: '',
		srsEnabled: false,
		voice: 'standard',
		goal: 5
	});

	function nextStep() {
		step = step + 1;
	}

	const progress = $derived((step / totalSteps) * 100);

	function handleMotivation(val: string) {
		selections.motivation = val;
		nextStep();
	}

	function handleExperience(val: string) {
		selections.experience = val;
		nextStep();
	}

	function handleSRS(enabled: boolean) {
		selections.srsEnabled = enabled;
		srsStore.set(enabled);
		nextStep();
	}

	function handleVoice(val: string) {
		selections.voice = val;
		preferredVoice.set(val as 'standard' | 'kaito');
		nextStep();
	}

	function handleGoal(val: number) {
		selections.goal = val;
		dailyGoal.set(val);
		nextStep();
	}
</script>

<div class="onboarding-container">
	<!-- Progress Bar -->
	<div class="progress-wrapper">
		<div class="progress-bar" style="width: {progress}%"></div>
	</div>

	<div class="step-wrapper">
		{#key step}
			<div
				class="step-inner"
				in:fly={{ x: 48, duration: 360, easing: cubicOut }}
				out:fly={{ x: -32, duration: 240, easing: cubicIn }}
			>
				{#if step === 1}
					<WelcomeStep onNext={nextStep} />
				{:else if step === 2}
					<FeaturesStep onNext={nextStep} />
				{:else if step === 3}
					<MotivationStep onSelect={handleMotivation} />
				{:else if step === 4}
					<ExperienceStep onSelect={handleExperience} />
				{:else if step === 5}
					<PracticeStep onNext={nextStep} />
				{:else if step === 6}
					<StoriesStep onNext={nextStep} />
				{:else if step === 7}
					<SRSStep onNext={handleSRS} />
				{:else if step === 8}
					<VoiceStep onSelect={handleVoice} />
				{:else if step === 9}
					<GoalStep onSelect={handleGoal} />
				{:else if step === 10}
					<SummaryStep {selections} onComplete={onFinish} />
				{/if}
			</div>
		{/key}
	</div>
</div>

<style>
	.onboarding-container {
		position: fixed;
		inset: 0;
		background: var(--bg-page);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		padding-top: env(safe-area-inset-top);
		padding-bottom: env(safe-area-inset-bottom);
		touch-action: none;
	}

	.progress-wrapper {
		height: 4px;
		background: var(--ink-100);
		width: calc(100% - 48px);
		margin: 20px 24px;
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: var(--hinomaru-red);
		transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.step-wrapper {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.step-inner {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		overflow-x: hidden;
	}
</style>
