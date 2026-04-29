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
		<div class="step-inner">
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
	</div>
</div>

<style>
	.onboarding-container {
		min-height: 100dvh;
		max-height: 100dvh;
		overflow: hidden;
		background: var(--bg-page);
		background-image:
			radial-gradient(at 0% 0%, rgba(188, 0, 45, 0.03) 0px, transparent 50%),
			radial-gradient(at 100% 100%, rgba(0, 122, 255, 0.03) 0px, transparent 50%);
		display: flex;
		flex-direction: column;
		padding-top: env(safe-area-inset-top);
		--step-title: clamp(20px, 5.5vw, 30px);
		--step-subtitle: clamp(13px, 3.6vw, 18px);
		--step-body: clamp(12px, 3.2vw, 16px);
	}

	@media (max-height: 740px) {
		.onboarding-container {
			--step-title: clamp(18px, 4.5vw, 24px);
			--step-subtitle: clamp(12px, 3.2vw, 15px);
			--step-body: clamp(11px, 2.8vw, 13px);
		}
	}

	.onboarding-header {
		height: 16px;
		display: flex;
		align-items: center;
		padding: 0 24px;
	}

	.back-placeholder {
		height: 12px;
	}

	.progress-wrapper {
		height: 5px;
		background: var(--ink-50);
		margin: 10px 24px 4px;
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
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.step-inner {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
		width: 100%;
	}

	.step-inner :global(.step-content) {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		flex: 1;
		min-height: 0;
		overflow: hidden;
		/* Top: scaled with viewport. Bottom: clears fixed footer. */
		padding: clamp(12px, 3dvh, 32px) 24px 96px !important;
	}

	/* Compress lists/headers/cards on shorter viewports to avoid scroll */
	@media (max-height: 740px) {
		.step-inner :global(.step-content header),
		.step-inner :global(.step-content .header),
		.step-inner :global(.step-content .header-section) {
			margin-bottom: 14px !important;
		}
		.step-inner :global(.options-list) { gap: 8px !important; }
		.step-inner :global(.features-list) { gap: 16px !important; margin-bottom: 12px !important; }
		.step-inner :global(.points-list) { gap: 6px !important; margin-bottom: 12px !important; }
		.step-inner :global(.story-preview) { margin-bottom: 14px !important; }
		.step-inner :global(.story-card) { padding: 14px !important; border-radius: 18px !important; }
		.step-inner :global(.story-header) { margin-bottom: 10px !important; }
		.step-inner :global(.story-body) { margin-bottom: 10px !important; }
		.step-inner :global(.story-card .jp) { font-size: 14px !important; line-height: 1.4 !important; }
		.step-inner :global(.story-card .trans) { font-size: 12px !important; }
		.step-inner :global(.option-row) { padding: 12px 16px !important; border-radius: 16px !important; }
		.step-inner :global(.feature-item) { gap: 14px !important; }
		.step-inner :global(.feature-item .icon-box) { width: 42px !important; height: 42px !important; min-width: 42px !important; }
		.step-inner :global(.feature-title) { font-size: 14px !important; }
		.step-inner :global(.feature-desc) { font-size: 12px !important; line-height: 1.3 !important; }
		.step-inner :global(.point-item) { padding: 8px 12px !important; gap: 12px !important; }
		.step-inner :global(.point-title) { font-size: 13px !important; }
		.step-inner :global(.point-desc) { font-size: 11px !important; }
		.step-inner :global(.app-icon-container) { width: 110px !important; height: 110px !important; }
		.step-inner :global(.app-logo) { border-radius: 32px !important; }
		.step-inner :global(.main-visual) { gap: 18px !important; }
		.step-inner :global(.summary-list) { gap: 8px !important; }
		.step-inner :global(.summary-row) { padding: 10px 14px !important; border-radius: 14px !important; }
		.step-inner :global(.orb-container) { width: 72px !important; height: 72px !important; margin-bottom: 10px !important; }
		.step-inner :global(.orb-header) { margin-bottom: 18px !important; }
		/* SRS timeline */
		.step-inner :global(.timeline-v) { gap: 14px !important; padding: 8px 0 !important; margin-bottom: 16px !important; }
		.step-inner :global(.node-icon-wrap) { width: 40px !important; height: 40px !important; }
		.step-inner :global(.node-title) { font-size: 14px !important; }
		.step-inner :global(.node-time) { font-size: 12px !important; }
		.step-inner :global(.description) { margin-bottom: 16px !important; font-size: 14px !important; line-height: 1.4 !important; }
		/* Goal grid */
		.step-inner :global(.goals-grid) { gap: 10px !important; max-width: 280px !important; margin-bottom: 14px !important; }
		.step-inner :global(.goal-card) { border-radius: 20px !important; }
		.step-inner :global(.goal-info) { margin-bottom: 12px !important; font-size: 13px !important; }
		.step-inner :global(.tip-section) { padding: 8px 12px !important; }
		.step-inner :global(.tip-text) { font-size: 12px !important; }
	}

	@media (max-height: 600px) and (orientation: landscape) {
		.progress-wrapper {
			margin: 6px 24px;
		}
		.step-inner :global(.step-content) {
			padding-top: 8px !important;
		}
	}
</style>
