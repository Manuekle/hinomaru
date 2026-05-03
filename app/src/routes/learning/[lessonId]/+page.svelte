<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';
	import { init, answer, isComplete, progressPct, type EngineState } from '$lib/learning/engine';
	import { buildSteps } from '$lib/learning/stepGenerator';
	import StepRecognize from '$lib/learning/components/StepRecognize.svelte';
	import StepChoose from '$lib/learning/components/StepChoose.svelte';
	import StepWrite from '$lib/learning/components/StepWrite.svelte';
	import StepListen from '$lib/learning/components/StepListen.svelte';
	import StepSpeak from '$lib/learning/components/StepSpeak.svelte';
	import StepFillSentence from '$lib/learning/components/StepFillSentence.svelte';
	import StepBuildSentence from '$lib/learning/components/StepBuildSentence.svelte';
	import LessonComplete from '$lib/learning/components/LessonComplete.svelte';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import type { PageData } from './$types';

	const props: { data: PageData } = $props();
	const data = $derived(props.data);
	const lesson = $derived(data.lesson);
	const cards = $derived(data.cards as any[]);

	let engine: EngineState = $state(buildInitial());
	let xpAwarded = $state(0);
	let startedAt = Date.now();
	let elapsedSec = $state(0);
	let showExitConfirm = $state(false);

	function buildInitial(): EngineState {
		const saved = (data.saved?.state as EngineState | undefined) ?? null;
		if (saved && saved.queue !== undefined) {
			return saved;
		}
		const steps = buildSteps(lesson.type, cards);
		return init(steps);
	}

	const cardById = $derived.by(() => {
		const m = new Map<string, any>();
		for (const c of cards) m.set(c.id, c);
		return m;
	});

	const currentCard = $derived(engine.current ? cardById.get(engine.current.cardId) : null);

	const distractors = $derived.by(() => {
		if (!engine.current) return [];
		const cur = engine.current.cardId;
		return cards.filter((c) => c.id !== cur);
	});

	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	function persist(completed: boolean = false) {
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(async () => {
			try {
				await fetch(`/api/lesson/${lesson.id}/save`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ state: engine, completed })
				});
			} catch (e) {
				console.warn('[lesson save]', e);
			}
		}, completed ? 0 : 400);
	}

	async function onAnswer(correct: boolean) {
		if (correct) playCorrect();
		else playWrong();
		engine = answer(engine, correct);
		if (isComplete(engine)) {
			elapsedSec = Math.round((Date.now() - startedAt) / 1000);
			const res = await finishLesson();
			xpAwarded = res?.xpAwarded ?? 0;
		} else {
			persist(false);
		}
	}

	async function finishLesson(): Promise<{ xpAwarded: number } | null> {
		try {
			const res = await fetch(`/api/lesson/${lesson.id}/save`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ state: engine, completed: true })
			});
			if (!res.ok) return null;
			return await res.json();
		} catch (e) {
			console.warn('[lesson finish]', e);
			return null;
		}
	}

	function tryExit() {
		if (isComplete(engine)) {
			goto('/');
			return;
		}
		showExitConfirm = true;
	}

	function confirmExit() {
		persist(false);
		goto('/');
	}

	let timerHandle: ReturnType<typeof setInterval>;
	onMount(() => {
		timerHandle = setInterval(() => {
			elapsedSec = Math.round((Date.now() - startedAt) / 1000);
		}, 1000);
		return () => clearInterval(timerHandle);
	});
</script>

<svelte:head>
	<title>
		{$locale === 'es' ? lesson.title_es : lesson.title_en} · Hinomaru
	</title>
</svelte:head>

<div class="learn-shell">
	{#if !isComplete(engine) && currentCard}
		<header class="learn-top">
			<button class="learn-x" onclick={tryExit} aria-label="Salir">
				<Icon icon={Cancel01Icon} size={22} color="var(--fg-tertiary)" />
			</button>
			<div class="learn-progress-container">
				<div class="learn-progress-track">
					<div class="learn-progress-fill" style="width: {progressPct(engine)}%"></div>
				</div>
			</div>
			<div class="learn-counter">
				<span class="cur">{engine.done.length}</span>
				<span class="sep">/</span>
				<span class="total">{engine.totalPlanned}</span>
			</div>
		</header>

		<main class="learn-body">
			{#key engine.current?.id}
				<div 
					in:fly={{ y: 10, duration: 300, easing: cubicOut }}
					out:fade={{ duration: 150 }}
					class="step-container"
				>
					{#if engine.current?.kind === 'recognize'}
						<StepRecognize card={currentCard} {onAnswer} />
					{:else if engine.current?.kind === 'choose'}
						<StepChoose card={currentCard} {distractors} {onAnswer} />
					{:else if engine.current?.kind === 'write'}
						<StepWrite card={currentCard} {onAnswer} />
					{:else if engine.current?.kind === 'listen'}
						<StepListen card={currentCard} {distractors} {onAnswer} />
					{:else if engine.current?.kind === 'speak'}
						<StepSpeak card={currentCard} {onAnswer} />
					{:else if engine.current?.kind === 'fill_sentence'}
						<StepFillSentence
							card={currentCard}
							pool={cards}
							retries={engine.current.retries}
							{onAnswer}
						/>
					{:else if engine.current?.kind === 'build_sentence'}
						<StepBuildSentence card={currentCard} pool={cards} {onAnswer} />
					{/if}
				</div>
			{/key}
		</main>
	{:else}
		<LessonComplete
			correct={engine.correct}
			mistakes={engine.mistakes}
			totalSteps={engine.totalPlanned}
			{xpAwarded}
			{elapsedSec}
		/>
	{/if}
</div>

{#if showExitConfirm}
	<div class="exit-backdrop" transition:fade={{ duration: 160 }} role="presentation"
		onclick={() => (showExitConfirm = false)}
	></div>
	<div
		class="exit-sheet"
		transition:fly={{ y: 200, duration: 240, easing: cubicOut }}
		role="dialog"
		aria-modal="true"
	>
		<div class="exit-handle"></div>
		<h3>{$locale === 'es' ? '¿Quieres salir?' : 'Want to quit?'}</h3>
		<p>
			{$locale === 'es'
				? 'Tu progreso actual se guardará y podrás seguir después.'
				: 'Your current progress will be saved for later.'}
		</p>
		<div class="exit-actions">
			<button class="exit-stay" onclick={() => (showExitConfirm = false)}>
				{$locale === 'es' ? 'Continuar' : 'Keep learning'}
			</button>
			<button class="exit-go" onclick={confirmExit}>
				{$locale === 'es' ? 'Salir' : 'Quit session'}
			</button>
		</div>
	</div>
{/if}

<style>
	.learn-shell {
		min-height: 100dvh;
		background: var(--bg-surface);
		display: flex;
		flex-direction: column;
		position: relative;
	}
	
	.learn-top {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 20px;
		align-items: center;
		padding: calc(16px + env(safe-area-inset-top)) 20px 12px;
		background: var(--bg-surface);
	}
	
	.learn-x {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: var(--ink-50);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.2s;
	}
	.learn-x:active {
		background: var(--ink-100);
	}
	
	.learn-progress-container {
		padding: 0 4px;
	}
	
	.learn-progress-track {
		height: 6px;
		background: var(--ink-100);
		border-radius: 99px;
		overflow: hidden;
	}
	
	.learn-progress-fill {
		height: 100%;
		background: var(--hinomaru-red);
		border-radius: 99px;
		transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	
	.learn-counter {
		display: flex;
		align-items: baseline;
		gap: 2px;
		font-family: var(--font-ui);
		font-weight: 800;
		color: var(--fg-tertiary);
		font-variant-numeric: tabular-nums;
		font-size: 13px;
	}
	.learn-counter .cur {
		color: var(--sumi);
		font-size: 15px;
	}
	.learn-counter .sep {
		opacity: 0.4;
		font-weight: 400;
	}

	.learn-body {
		flex: 1;
		max-width: 600px;
		width: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		position: relative;
	}
	
	.step-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 20px 20px calc(40px + env(safe-area-inset-bottom));
	}

	/* Exit UI */
	.exit-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
		z-index: 100;
	}
	.exit-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		max-width: 420px;
		margin: 0 auto;
		background: var(--bg-surface);
		border-radius: 32px 32px 0 0;
		padding: 12px 24px calc(32px + env(safe-area-inset-bottom));
		z-index: 101;
		text-align: center;
		box-shadow: 0 -10px 40px rgba(0,0,0,0.1);
	}
	.exit-handle {
		width: 36px;
		height: 4px;
		background: var(--ink-200);
		border-radius: 99px;
		margin: 0 auto 24px;
	}
	.exit-sheet h3 {
		margin: 0 0 10px;
		font-size: 22px;
		font-weight: 900;
		color: var(--sumi);
		letter-spacing: -0.02em;
	}
	.exit-sheet p {
		margin: 0 0 28px;
		font-size: 15px;
		color: var(--fg-secondary);
		line-height: 1.5;
	}
	.exit-actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.exit-stay {
		padding: 16px;
		background: var(--hinomaru-red);
		color: white;
		font-size: 15px;
		font-weight: 800;
		border: none;
		border-radius: 18px;
		cursor: pointer;
		box-shadow: 0 4px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
	}
	.exit-go {
		padding: 14px;
		background: transparent;
		color: var(--fg-tertiary);
		font-size: 14px;
		font-weight: 700;
		border: none;
		border-radius: 18px;
		cursor: pointer;
	}
</style>
