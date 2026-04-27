<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { addXP } from '$lib/utils/gamification';
	import { fadeUp } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { Certificate01Icon, CheckmarkCircle01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	type QuestionType = 'multiple-choice' | 'type-answer' | 'sentence-context';

	interface ExamQuestion {
		card: any;
		type: QuestionType;
		options?: string[];
		correctAnswer: string;
	}

	const EXAM_TOTAL = 10;
	const EXAM_DURATION = 5 * 60; // 5 minutes in seconds

	const supabase = createClient();
	const cards = $derived(data.cards as any[]);
	const deck = $derived(data.deck);

	// ── Exam state ──────────────────────────────────────────────────────────────
	let phase = $state<'intro' | 'exam' | 'result'>('intro');
	let questions = $state<ExamQuestion[]>([]);
	let currentIdx = $state(0);
	let correctness = $state<boolean[]>([]);

	// current question interaction
	let selected = $state<number | null>(null);   // for MC
	let typedAnswer = $state('');                 // for type-answer
	let checked = $state(false);

	// Timer
	let timeLeft = $state(EXAM_DURATION);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let startedAt = $state(0);
	let timeUsed = $state(0);

	// Auto-advance timer handle
	let advanceTimeout: ReturnType<typeof setTimeout> | null = null;

	// ── Derived ─────────────────────────────────────────────────────────────────
	const currentQuestion = $derived(questions[currentIdx]);
	const score = $derived(correctness.filter(Boolean).length);
	const pct = $derived(questions.length > 0 ? Math.round((score / questions.length) * 100) : 0);
	const timerPct = $derived((timeLeft / EXAM_DURATION) * 100);
	const timerCritical = $derived(timeLeft <= 60);

	const minutesLeft = $derived(Math.floor(timeLeft / 60));
	const secondsLeft = $derived(timeLeft % 60);
	const timerLabel = $derived(
		`${minutesLeft}:${String(secondsLeft).padStart(2, '0')}`
	);

	// ── Question generation ──────────────────────────────────────────────────────
	function buildOptions(card: any, allCards: any[]): string[] {
		const correct = $locale === 'es' ? card.es : card.en;
		const pool = Array.from(
			new Set(
				allCards
					.filter((c) => c.id !== card.id && c.en !== card.en)
					.map((c) => ($locale === 'es' ? c.es : c.en))
			)
		);
		// partial Fisher-Yates shuffle for 3 distractors
		for (let k = pool.length - 1; k > pool.length - 4 && k > 0; k--) {
			const r = Math.floor(Math.random() * (k + 1));
			[pool[k], pool[r]] = [pool[r], pool[k]];
		}
		const distractors = pool.slice(-3).slice(0, 3);
		const opts = [...distractors, correct];
		for (let k = opts.length - 1; k > 0; k--) {
			const r = Math.floor(Math.random() * (k + 1));
			[opts[k], opts[r]] = [opts[r], opts[k]];
		}
		return opts;
	}

	function generateQuestions(allCards: any[]): ExamQuestion[] {
		if (allCards.length < 4) return [];

		// Shuffle cards pool
		const pool = [...allCards];
		for (let k = pool.length - 1; k > 0; k--) {
			const r = Math.floor(Math.random() * (k + 1));
			[pool[k], pool[r]] = [pool[r], pool[k]];
		}

		const selected = pool.slice(0, EXAM_TOTAL);

		// Weighted distribution: 4 MC, 4 type, 2 sentence-context
		const types: QuestionType[] = [
			'multiple-choice', 'multiple-choice', 'multiple-choice', 'multiple-choice',
			'type-answer', 'type-answer', 'type-answer', 'type-answer',
			'sentence-context', 'sentence-context'
		];
		// Shuffle type assignments
		for (let k = types.length - 1; k > 0; k--) {
			const r = Math.floor(Math.random() * (k + 1));
			[types[k], types[r]] = [types[r], types[k]];
		}

		return selected.map((card, idx): ExamQuestion => {
			const type = types[idx] ?? 'multiple-choice';
			const correctAnswer = $locale === 'es' ? card.es : card.en;
			const q: ExamQuestion = { card, type, correctAnswer };
			if (type === 'multiple-choice' || type === 'sentence-context') {
				q.options = buildOptions(card, allCards);
			}
			return q;
		});
	}

	// ── Timer ────────────────────────────────────────────────────────────────────
	function startTimer() {
		startedAt = Date.now();
		timerInterval = setInterval(() => {
			timeLeft -= 1;
			if (timeLeft <= 0) {
				timeLeft = 0;
				endExam();
			}
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		timeUsed = EXAM_DURATION - timeLeft;
	}

	// ── Exam flow ────────────────────────────────────────────────────────────────
	function startExam() {
		questions = generateQuestions(cards);
		if (questions.length === 0) return;
		currentIdx = 0;
		correctness = [];
		selected = null;
		typedAnswer = '';
		checked = false;
		timeLeft = EXAM_DURATION;
		phase = 'exam';
		startTimer();
	}

	function checkCurrentAnswer() {
		if (checked) return;
		const q = currentQuestion;
		if (!q) return;

		const isRight = (q.type === 'multiple-choice' || q.type === 'sentence-context')
			? (selected !== null && q.options![selected].toLowerCase() === q.correctAnswer.toLowerCase())
			: (typedAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase());

		checked = true;
		correctness = [...correctness, isRight];

		if (isRight) playCorrect();
		else playWrong();

		// Auto-advance
		const delay = isRight ? 2000 : 3000;
		advanceTimeout = setTimeout(() => {
			advanceQuestion();
		}, delay);
	}

	function advanceQuestion() {
		if (advanceTimeout) {
			clearTimeout(advanceTimeout);
			advanceTimeout = null;
		}
		if (currentIdx + 1 >= questions.length) {
			endExam();
		} else {
			currentIdx += 1;
			selected = null;
			typedAnswer = '';
			checked = false;
		}
	}

	async function endExam() {
		stopTimer();
		phase = 'result';
		playFinish();
		await saveSession();
	}

	async function saveSession() {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;

			await supabase.from('sessions').insert({
				user_id: user.id,
				deck_id: deck.id,
				mode: 'exam',
				score,
				total: questions.length,
				duration_s: timeUsed
			});

			await updateStreak(supabase, user.id);
			const xpEarned = score * 5;
			if (xpEarned > 0) await addXP(supabase, user.id, xpEarned);
		} catch {
			// silent
		}
	}

	// ── Keyboard ─────────────────────────────────────────────────────────────────
	function handleKeydown(e: KeyboardEvent) {
		if (phase !== 'exam' || !currentQuestion) return;
		if (e.key === 'Enter' && !checked) {
			checkCurrentAnswer();
		}
	}

	onMount(() => {
		return () => {
			if (timerInterval) clearInterval(timerInterval);
			if (advanceTimeout) clearTimeout(advanceTimeout);
		};
	});

	const isCurrentCorrect = $derived(
		checked && currentQuestion &&
		(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'sentence-context'
			? selected !== null && currentQuestion.options![selected] === currentQuestion.correctAnswer
			: typedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase())
	);

	function typeLabel(type: QuestionType): string {
		if (type === 'multiple-choice') return $locale === 'es' ? 'Opción múltiple' : 'Multiple choice';
		if (type === 'type-answer') return $locale === 'es' ? 'Escribe la respuesta' : 'Type the answer';
		return $locale === 'es' ? 'Contexto' : 'Context';
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{$locale === 'es' ? 'Examen' : 'Exam'} — {deck?.title_en ?? ''} — Hinomaru</title>
</svelte:head>

<div class="session-layout">
	<div class="session-container">

		{#if phase === 'intro'}
			<!-- ── Intro Screen ── -->
			<div use:fadeUp={{ delay: 0, y: 16 }} class="intro-screen">
				<div class="intro-icon">
					<Icon icon={Certificate01Icon} size={48} color="var(--washi)" strokeWidth={1.5} />
				</div>

				<h1 class="intro-title">
					{$locale === 'es' ? 'Examen' : 'Exam'}
				</h1>
				<p class="intro-deck">{$locale === 'es' ? deck?.title_es : deck?.title_en}</p>

				<div class="rules-box">
					<div class="rule-item">
						<span class="rule-num">10</span>
						<span class="rule-text">{$locale === 'es' ? 'preguntas mixtas' : 'mixed questions'}</span>
					</div>
					<div class="rule-item">
						<span class="rule-num">5:00</span>
						<span class="rule-text">{$locale === 'es' ? 'minutos para completar' : 'minutes to finish'}</span>
					</div>
					<div class="rule-item">
						<span class="rule-num">1×</span>
						<span class="rule-text">{$locale === 'es' ? 'sin volver atrás' : 'no going back'}</span>
					</div>
				</div>

				{#if cards.length < 4}
					<p class="warning-text">
						{$locale === 'es'
							? 'Este deck necesita al menos 4 tarjetas para el examen.'
							: 'This deck needs at least 4 cards for the exam.'}
					</p>
				{/if}
			</div>

			<StickyFooter>
				<button class="hm-btn hm-btn-ghost hm-btn-lg" style="flex:1;" onclick={() => goto(`/deck/${deck?.id}`)}>
					← {t('deck.back', $locale)}
				</button>
				<button
					class="hm-btn hm-btn-dark hm-btn-lg"
					style="flex:2;"
					onclick={startExam}
					disabled={cards.length < 4}
				>
					{$locale === 'es' ? 'Comenzar examen' : 'Start exam'}
				</button>
			</StickyFooter>

		{:else if phase === 'exam' && currentQuestion}
			<!-- ── Timer Bar ── -->
			<div class="timer-bar-wrap">
				<div
					class="timer-bar-fill"
					class:critical={timerCritical}
					style="width: {timerPct}%"
				></div>
			</div>

			<!-- ── Exam Header ── -->
			<div class="exam-header" use:fadeUp={{ delay: 0, y: 8 }}>
				<span class="q-progress">
					{$locale === 'es' ? 'Pregunta' : 'Question'} {currentIdx + 1} / {questions.length}
				</span>
				<span class="timer-label" class:critical={timerCritical}>{timerLabel}</span>
			</div>

			<!-- ── Question ── -->
			<div class="question-wrap" use:fadeUp={{ delay: 0.05, y: 12 }}>
				<div class="type-pill">{typeLabel(currentQuestion.type)}</div>

				<div class="question-card">
					{#if currentQuestion.type === 'sentence-context' && currentQuestion.card.example_jp}
						<p class="example-sentence jp">{currentQuestion.card.example_jp}</p>
						<p class="context-prompt">
							{$locale === 'es'
								? `¿Qué significa "${currentQuestion.card.jp}"?`
								: `What does "${currentQuestion.card.jp}" mean?`}
						</p>
					{:else}
						<p class="question-jp jp">{currentQuestion.card.jp}</p>
						{#if currentQuestion.card.kana && currentQuestion.card.kana !== currentQuestion.card.jp}
							<p class="question-kana jp">{currentQuestion.card.kana}</p>
						{/if}
						<p class="question-prompt">
							{$locale === 'es' ? '¿Qué significa?' : 'What does this mean?'}
						</p>
					{/if}
				</div>

				<!-- Multiple Choice / Sentence Context Options -->
				{#if currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'sentence-context'}
					<div class="options-list">
						{#each currentQuestion.options! as opt, idx (idx)}
							<button
								class="option-item"
								class:is-selected={selected === idx}
								class:is-correct={checked && opt === currentQuestion.correctAnswer}
								class:is-wrong={checked && selected === idx && opt !== currentQuestion.correctAnswer}
								disabled={checked}
								onclick={() => { if (!checked) selected = idx; }}
							>
								<span class="opt-marker">{String.fromCharCode(65 + idx)}</span>
								<span class="opt-text">{opt}</span>
							</button>
						{/each}
					</div>

				<!-- Type Answer -->
				{:else if currentQuestion.type === 'type-answer'}
					<div class="type-input-wrap">
						<input
							class="type-input"
							class:correct={checked && isCurrentCorrect}
							class:wrong={checked && !isCurrentCorrect}
							type="text"
							placeholder={$locale === 'es' ? 'Escribe la traducción...' : 'Type the translation...'}
							bind:value={typedAnswer}
							disabled={checked}
							autocomplete="off"
							autocapitalize="off"
						/>
						{#if checked && !isCurrentCorrect}
							<p class="correct-reveal">
								{$locale === 'es' ? 'Respuesta correcta:' : 'Correct answer:'} <strong>{currentQuestion.correctAnswer}</strong>
							</p>
						{/if}
					</div>
				{/if}

				<!-- Feedback Banner -->
				{#if checked}
					<div class="feedback-banner" class:correct={isCurrentCorrect} class:wrong={!isCurrentCorrect}>
						{#if isCurrentCorrect}
							<Icon icon={CheckmarkCircle01Icon} size={18} color="currentColor" strokeWidth={2} />
							{$locale === 'es' ? '¡Correcto!' : 'Correct!'}
						{:else}
							<Icon icon={Cancel01Icon} size={18} color="currentColor" strokeWidth={2} />
							{$locale === 'es' ? 'Incorrecto' : 'Incorrect'}
						{/if}
					</div>
				{/if}
			</div>

			<StickyFooter>
				{#if !checked}
					<button
						class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
						onclick={checkCurrentAnswer}
						disabled={
							currentQuestion.type === 'type-answer'
								? !typedAnswer.trim()
								: selected === null
						}
					>
						{t('session.check', $locale)}
					</button>
				{:else}
					<button
						class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
						onclick={advanceQuestion}
					>
						{currentIdx + 1 < questions.length
							? ($locale === 'es' ? 'Siguiente →' : 'Next →')
							: ($locale === 'es' ? 'Ver resultados' : 'See results')}
					</button>
				{/if}
			</StickyFooter>

		{:else if phase === 'result'}
			<!-- ── Result Screen ── -->
			<div use:fadeUp={{ delay: 0, y: 20 }} class="result-screen">
				<div class="result-icon" class:pass={pct >= 70} class:fail={pct < 70}>
					<Icon icon={Certificate01Icon} size={52} color="var(--washi)" strokeWidth={1.5} />
				</div>

				<h2 class="result-headline">
					{pct >= 70
						? ($locale === 'es' ? '¡Buen trabajo!' : 'Great job!')
						: ($locale === 'es' ? 'Sigue practicando' : 'Keep practicing')}
				</h2>

				<div class="score-row">
					<span class="score-pct" class:pass={pct >= 70} class:fail={pct < 70}>{pct}%</span>
					<span class="score-fraction">{score} / {questions.length}</span>
				</div>

				<!-- Time used -->
				{#if timeUsed > 0}
					<p class="time-used">
						{$locale === 'es' ? 'Tiempo:' : 'Time:'}
						{Math.floor(timeUsed / 60)}:{String(timeUsed % 60).padStart(2, '0')}
					</p>
				{/if}

				<!-- Breakdown by type -->
				<div class="breakdown-section">
					<h3 class="breakdown-title">
						{$locale === 'es' ? 'Por tipo de pregunta' : 'By question type'}
					</h3>
					{#each (['multiple-choice', 'type-answer', 'sentence-context'] as QuestionType[]) as qtype (qtype)}
						{@const typeQs = questions.map((q, i) => ({ q, correct: correctness[i] })).filter(({ q }) => q.type === qtype)}
						{#if typeQs.length > 0}
							{@const typeScore = typeQs.filter((x) => x.correct).length}
							<div class="breakdown-row">
								<span class="breakdown-label">{typeLabel(qtype)}</span>
								<span class="breakdown-val">
									{typeScore} / {typeQs.length}
								</span>
							</div>
						{/if}
					{/each}
				</div>

				<!-- Question-by-question list -->
				<div class="question-list">
					{#each questions as q, idx (idx)}
						<div class="q-row" class:q-correct={correctness[idx]} class:q-wrong={!correctness[idx]}>
							<span class="q-dot">
								{correctness[idx] ? '✓' : '✗'}
							</span>
							<span class="q-jp jp">{q.card.jp}</span>
							<span class="q-answer">{q.correctAnswer}</span>
						</div>
					{/each}
				</div>
			</div>

			<StickyFooter>
				<button
					class="hm-btn hm-btn-ghost hm-btn-lg"
					style="flex:1;"
					onclick={() => goto(`/deck/${deck?.id}`)}
				>
					← {t('deck.back', $locale)}
				</button>
				<button
					class="hm-btn hm-btn-dark hm-btn-lg"
					style="flex:1;"
					onclick={startExam}
				>
					{$locale === 'es' ? 'Repetir' : 'Retry'}
				</button>
			</StickyFooter>
		{/if}

	</div>
</div>

<style>
	.session-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--paper);
	}

	.session-container {
		width: 100%;
		max-width: 720px;
		margin: 0 auto;
		padding: calc(16px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));
	}

	/* ── Timer Bar ── */
	.timer-bar-wrap {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--ink-100);
		z-index: 100;
	}
	.timer-bar-fill {
		height: 100%;
		background: var(--sumi);
		transition: width 1s linear, background 0.5s;
	}
	.timer-bar-fill.critical {
		background: var(--hinomaru-red);
	}

	/* ── Intro Screen ── */
	.intro-screen {
		text-align: center;
		padding: 40px 0 20px;
	}
	.intro-icon {
		width: 96px;
		height: 96px;
		background: var(--sumi);
		border-radius: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 28px;
	}
	.intro-title {
		font-size: 40px;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin: 0 0 8px;
	}
	.intro-deck {
		font-size: 16px;
		color: var(--fg-secondary);
		margin: 0 0 32px;
	}
	.rules-box {
		display: flex;
		justify-content: center;
		gap: 24px;
		margin-bottom: 32px;
	}
	.rule-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.rule-num {
		font-size: 28px;
		font-weight: 700;
		color: var(--sumi);
	}
	.rule-text {
		font-size: 12px;
		color: var(--fg-tertiary);
		text-align: center;
		max-width: 80px;
	}
	.warning-text {
		font-size: 14px;
		color: var(--warning);
		margin-top: 8px;
	}

	/* ── Exam Header ── */
	.exam-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		margin-top: 16px;
	}
	.q-progress {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-secondary);
	}
	.timer-label {
		font-size: 20px;
		font-weight: 700;
		color: var(--sumi);
		font-variant-numeric: tabular-nums;
		transition: color 0.3s;
	}
	.timer-label.critical {
		color: var(--hinomaru-red);
	}

	/* ── Question ── */
	.question-wrap {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.type-pill {
		display: inline-block;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		background: var(--ink-100);
		padding: 4px 10px;
		border-radius: 99px;
		width: fit-content;
	}
	.question-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 28px;
		box-shadow: var(--shadow-sm);
		text-align: center;
	}
	.question-jp {
		font-size: 48px;
		font-weight: 700;
		color: var(--sumi);
		margin: 0 0 4px;
		line-height: 1.2;
	}
	.question-kana {
		font-size: 16px;
		color: var(--fg-tertiary);
		margin: 0 0 12px;
	}
	.question-prompt {
		font-size: 14px;
		color: var(--fg-secondary);
		margin: 0;
	}
	.example-sentence {
		font-size: 18px;
		line-height: 1.7;
		color: var(--sumi);
		margin: 0 0 12px;
	}
	.context-prompt {
		font-size: 15px;
		color: var(--fg-secondary);
		margin: 0;
	}

	/* ── Options ── */
	.options-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.option-item {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px;
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		background: var(--bg-surface);
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		transition: all 0.18s;
	}
	.option-item:hover:not(:disabled) {
		border-color: var(--ink-300);
		box-shadow: var(--shadow-sm);
	}
	.option-item:disabled { cursor: default; }
	.option-item.is-selected {
		border-color: var(--sumi);
		background: var(--ink-50);
	}
	.option-item.is-correct {
		border-color: var(--success);
		background: var(--success-wash);
	}
	.option-item.is-wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}
	.opt-marker {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--ink-100);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-secondary);
		flex-shrink: 0;
	}
	.is-correct .opt-marker { background: var(--success); color: white; }
	.is-wrong .opt-marker { background: var(--hinomaru-red); color: white; }
	.opt-text {
		font-size: 16px;
		font-weight: 600;
		color: var(--fg-primary);
	}

	/* ── Type Input ── */
	.type-input-wrap {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.type-input {
		width: 100%;
		height: 56px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		padding: 0 18px;
		font-size: 18px;
		font-family: inherit;
		transition: border-color 0.2s, box-shadow 0.2s;
		box-sizing: border-box;
	}
	.type-input:focus {
		outline: none;
		border-color: var(--sumi);
		box-shadow: var(--shadow-focus);
	}
	.type-input.correct {
		border-color: var(--success);
		background: var(--success-wash);
	}
	.type-input.wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}
	.correct-reveal {
		font-size: 14px;
		color: var(--fg-secondary);
		margin: 0;
	}

	/* ── Feedback Banner ── */
	.feedback-banner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 700;
		padding: 12px;
		border-radius: 14px;
	}
	.feedback-banner.correct {
		color: var(--success);
		background: var(--success-wash);
	}
	.feedback-banner.wrong {
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	/* ── Result Screen ── */
	.result-screen {
		padding: 20px 0;
	}
	.result-icon {
		width: 96px;
		height: 96px;
		border-radius: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 24px;
		background: var(--sumi);
	}
	.result-icon.pass { background: var(--success); }
	.result-icon.fail { background: var(--hinomaru-red); }

	.result-headline {
		font-size: 28px;
		font-weight: 700;
		text-align: center;
		margin: 0 0 16px;
	}
	.score-row {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 10px;
		margin-bottom: 8px;
	}
	.score-pct {
		font-size: 52px;
		font-weight: 800;
		letter-spacing: -0.04em;
		color: var(--sumi);
	}
	.score-pct.pass { color: var(--success); }
	.score-pct.fail { color: var(--hinomaru-red); }
	.score-fraction {
		font-size: 18px;
		color: var(--fg-secondary);
		font-weight: 600;
	}
	.time-used {
		text-align: center;
		font-size: 14px;
		color: var(--fg-tertiary);
		margin: 0 0 28px;
	}

	/* ── Breakdown ── */
	.breakdown-section {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 18px 20px;
		margin-bottom: 24px;
		box-shadow: var(--shadow-sm);
	}
	.breakdown-title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		margin: 0 0 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--ink-100);
	}
	.breakdown-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 0;
	}
	.breakdown-label {
		font-size: 14px;
		color: var(--fg-secondary);
	}
	.breakdown-val {
		font-size: 14px;
		font-weight: 700;
		color: var(--sumi);
	}

	/* ── Question breakdown list ── */
	.question-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 16px;
	}
	.q-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		border-radius: 12px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-100);
	}
	.q-row.q-correct { border-color: var(--success); background: var(--success-wash); }
	.q-row.q-wrong { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }
	.q-dot {
		font-size: 14px;
		font-weight: 700;
		width: 20px;
		flex-shrink: 0;
	}
	.q-correct .q-dot { color: var(--success); }
	.q-wrong .q-dot { color: var(--hinomaru-red); }
	.q-jp {
		font-size: 18px;
		font-weight: 700;
		color: var(--sumi);
		flex-shrink: 0;
	}
	.q-answer {
		font-size: 13px;
		color: var(--fg-secondary);
		flex: 1;
	}

	.jp { font-family: var(--font-jp); }

	@media (max-width: 480px) {
		.rules-box { gap: 16px; }
		.question-jp { font-size: 36px; }
		.score-pct { font-size: 40px; }
	}
</style>
