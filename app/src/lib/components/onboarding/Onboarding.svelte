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
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { preferredVoice, dailyGoal, srsEnabled as srsStore } from '$lib/stores/settings';

	let { onFinish } = $props<{ onFinish: (selections: any) => void }>();

	let step = $state(1);
	let selections = $state({
		motivation: '',
		experience: '',
		srsEnabled: false,
		voice: 'kawaii',
		goal: 5
	});

	function nextStep() {
		step += 1;
	}

	function prevStep() {
		if (step > 1) step -= 1;
	}

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
		preferredVoice.set(val as 'kawaii' | 'cool');
		nextStep();
	}

	function handleGoal(val: number) {
		selections.goal = val;
		dailyGoal.set(val);
		nextStep();
	}

	let finishing = $state(false);

	async function handleComplete() {
		finishing = true;
		try {
			await onFinish(selections);
		} finally {
			finishing = false;
		}
	}
</script>

<div class="onboarding-container">
	<!-- Progress Bar -->
	<div class="progress-wrapper">
		<div 
			class="progress-bar-fill" 
			style="width: {(step / 10) * 100}%"
		></div>
	</div>

	<!-- Header (Minimal) -->
	<div class="onboarding-header">
		<div class="back-placeholder"></div>
	</div>

	<div class="step-wrapper">
		{#key step}
			<div
				class="step-inner"
				in:fly={{ y: 12, duration: 300, easing: cubicOut }}
				out:fade={{ duration: 150 }}
			>
				{#if step === 1}
					<WelcomeStep onNext={nextStep} />
				{:else if step === 2}
					<FeaturesStep onNext={nextStep} onBack={prevStep} />
				{:else if step === 3}
					<MotivationStep onSelect={handleMotivation} onBack={prevStep} />
				{:else if step === 4}
					<ExperienceStep onSelect={handleExperience} onBack={prevStep} />
				{:else if step === 5}
					<PracticeStep onNext={nextStep} onBack={prevStep} />
				{:else if step === 6}
					<StoriesStep onNext={nextStep} onBack={prevStep} />
				{:else if step === 7}
					<VoiceStep onSelect={handleVoice} onBack={prevStep} />
				{:else if step === 8}
					<GoalStep onSelect={handleGoal} onBack={prevStep} />
				{:else if step === 9}
					<SRSStep onNext={handleSRS} />
				{:else if step === 10}
					<SummaryStep {selections} onComplete={handleComplete} onBack={prevStep} loading={finishing} />
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
		background-image: 
			radial-gradient(at 0% 0%, rgba(188, 0, 45, 0.03) 0px, transparent 50%),
			radial-gradient(at 100% 100%, rgba(0, 122, 255, 0.03) 0px, transparent 50%);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		padding-top: env(safe-area-inset-top);
		overscroll-behavior: none;
		--step-title: clamp(24px, 7vw, 32px);
		--step-subtitle: clamp(15px, 4vw, 20px);
		--step-body: clamp(13px, 3.5vw, 17px);
	}

	.onboarding-header {
		height: 32px;
		display: flex;
		align-items: center;
		padding: 0 24px;
	}

	.back-placeholder {
		height: 20px;
	}

	.progress-wrapper {
		height: 6px;
		background: var(--ink-50);
		margin: 16px 24px 8px;
		border-radius: 99px;
		overflow: hidden;
		flex-shrink: 0;
		border: 1px solid var(--ink-200);
	}

	.progress-bar-fill {
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
		overflow-x: hidden;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
		width: 100%;
		padding-bottom: 0;
	}

	.step-inner :global(.step-content) {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		min-height: 100%;
		padding-bottom: 0 !important;
	}

	.step-inner :global(.sticky-footer) {
		position: relative !important;
		margin-top: auto !important;
		bottom: auto;
		left: auto;
		right: auto;
		z-index: auto;
		pointer-events: auto !important;
		border-top: none !important;
		background: transparent !important;
		padding: 16px 24px max(16px, env(safe-area-inset-bottom, 0px));
		transition: none;
	}

	@media (max-height: 600px) and (orientation: landscape) {
		.progress-wrapper {
			margin: 12px 24px;
		}
	}
</style>
