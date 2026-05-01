<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, beforeNavigate } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { addXP } from '$lib/utils/gamification';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { fadeUp } from '$lib/motion';
	import { fade } from 'svelte/transition';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import {
		DocumentValidationIcon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		CheckmarkCircle02Icon,
		AlertCircleIcon,
		ArrowLeft01Icon,
		Clock01Icon,
		Target01Icon
	} from '@hugeicons/core-free-icons';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import Confetti from '$lib/components/Confetti.svelte';
	import type { PageData } from './$types';
	import ResponsiveModal from '$lib/components/ui/ResponsiveModal.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';

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

	let confettiRef = $state<{ fire: () => void } | null>(null);

	// ── Exam state ──────────────────────────────────────────────────────────────
	type Phase = 'intro' | 'exam' | 'anticipation' | 'result';
	let phase = $state<Phase>('intro');
	let questions = $state<ExamQuestion[]>([]);
	let currentIdx = $state(0);
	let correctness = $state<boolean[]>([]);

	// current question interaction
	let selected = $state<number | null>(null); // for MC
	let typedAnswer = $state(''); // for type-answer
	let checked = $state(false);

	// Timer
	let timeLeft = $state(EXAM_DURATION);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let timeUsed = $state(0);

	// Auto-advance timer handle
	let advanceTimeout: ReturnType<typeof setTimeout> | null = null;

	// ── Derived ─────────────────────────────────────────────────────────────────
	const currentQuestion = $derived(questions[currentIdx]);
	const score = $derived(correctness.filter(Boolean).length);
	const wrongCount = $derived(correctness.filter((b) => !b).length);
	const pct = $derived(questions.length > 0 ? Math.round((score / questions.length) * 100) : 0);
	const timerPct = $derived((timeLeft / EXAM_DURATION) * 100);
	const timerCritical = $derived(timeLeft <= 60);

	const timerLabel = $derived(
		`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
	);
	const timeUsedLabel = $derived(
		`${Math.floor(timeUsed / 60)}:${String(timeUsed % 60).padStart(2, '0')}`
	);

	// ── Utils ───────────────────────────────────────────────────────────────────
	function shuffleArray<T>(array: T[]): T[] {
		const arr = [...array];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	function buildOptions(card: any, allCards: any[]): string[] {
		const correct = $locale === 'es' ? card.es : card.en;
		const pool = Array.from(
			new Set(
				allCards
					.filter((c) => c.id !== card.id && c.en !== card.en)
					.map((c) => ($locale === 'es' ? c.es : c.en))
			)
		);
		// Shuffle pool
		const shuffledPool = shuffleArray(pool);
		const distractors = shuffledPool.slice(0, 3);
		return shuffleArray([...distractors, correct]);
	}

	function generateQuestions(allCards: any[]): ExamQuestion[] {
		if (allCards.length < 4) return [];
		const pool = shuffleArray(allCards);
		const selectedCards = pool.slice(0, EXAM_TOTAL);

		const types: QuestionType[] = shuffleArray([
			'multiple-choice', 'multiple-choice', 'multiple-choice', 'multiple-choice',
			'type-answer', 'type-answer', 'type-answer', 'type-answer',
			'sentence-context', 'sentence-context'
		]);

		return selectedCards.map((card, idx): ExamQuestion => {
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
		timerInterval = setInterval(() => {
			timeLeft -= 1;
			if (timeLeft <= 0) {
				timeLeft = 0;
				endExam();
			}
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
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

		const isRight =
			q.type === 'multiple-choice' || q.type === 'sentence-context'
				? selected !== null && q.options![selected] === q.correctAnswer
				: typedAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase();

		checked = true;
		correctness = [...correctness, isRight];

		if (isRight) playCorrect(); else playWrong();
		advanceTimeout = setTimeout(advanceQuestion, isRight ? 1800 : 2800);
	}

	function advanceQuestion() {
		if (advanceTimeout) { clearTimeout(advanceTimeout); advanceTimeout = null; }
		if (currentIdx + 1 >= questions.length) { endExam(); return; }
		currentIdx += 1;
		selected = null;
		typedAnswer = '';
		checked = false;
	}

	async function endExam() {
		stopTimer();
		phase = 'anticipation';
		setTimeout(async () => {
			phase = 'result';
			playFinish();
			setTimeout(() => confettiRef?.fire(), 300);
			await saveSession();
		}, 1800);
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
			// Update per-card SRS progress based on actual exam correctness
			await Promise.all(
				questions.map((q, idx) => {
					const gotIt = correctness[idx] ?? false;
					const currentProgress = q.card.progress?.[0];
					const quality = mapPerformanceToQuality(gotIt, false);
					const nextState = calculateNextReview(quality, currentProgress);
					return supabase.from('progress').upsert({
						user_id: user.id,
						card_id: q.card.id,
						learned: gotIt,
						...nextState,
						last_seen: new Date().toISOString()
					});
				})
			);
			await updateStreak(supabase, user.id);
			const xpEarned = score * 5;
			if (xpEarned > 0) await addXP(supabase, user.id, xpEarned);
		} catch {
			// Ignore database/save errors
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (phase !== 'exam' || !currentQuestion) return;
		if (e.key === 'Enter' && !checked) checkCurrentAnswer();
	}

	// ── Navigation Protection ─────────────────────────────────────────────────
	let showExitModal = $state(false);
	let nextRoute = $state<string | null>(null);

	beforeNavigate(({ cancel, to }) => {
		if (phase === 'exam' && !showExitModal) {
			cancel();
			if (to) nextRoute = to.url.pathname;
			showExitModal = true;
		}
	});

	function handleConfirmExit() {
		showExitModal = false;
		if (nextRoute) {
			phase = 'intro';
			goto(nextRoute);
		}
	}

	onMount(() => {
		startExam();
		return () => {
			if (timerInterval) clearInterval(timerInterval);
			if (advanceTimeout) clearTimeout(advanceTimeout);
		};
	});

	const isCurrentCorrect = $derived(
		checked &&
			currentQuestion &&
			(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'sentence-context'
				? selected !== null && currentQuestion.options![selected] === currentQuestion.correctAnswer
				: typedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase())
	);

	function typeLabel(type: QuestionType): string {
		if (type === 'multiple-choice') return t('exam.type.multiple_choice', $locale);
		if (type === 'type-answer') return t('exam.type.type_answer', $locale);
		return t('exam.type.context', $locale);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{t('mode.exam.title', $locale)} — {deck?.title_en ?? ''} — Hinomaru</title>
</svelte:head>

<div class="session-layout">
	<div class="session-container">
		{#if phase === 'exam' && currentQuestion}
			<div use:fadeUp={{ delay: 0, y: 10 }}>
				<a href="/deck/{deck?.id}" class="back">← {t('deck.back', $locale)}</a>
			</div>


			<div class="exam-premium-header">
				<div class="exam-header-main">
					<div class="header-left">
						<span class="exam-label-pill">{typeLabel(currentQuestion.type)}</span>
					</div>
					
					<div class="exam-step-indicator">
						<span class="step-curr">{currentIdx + 1}</span>
						<span class="step-divider">/</span>
						<span class="step-total">{questions.length}</span>
					</div>

					<div class="header-right">
						<div class="exam-timer-pill" class:is-critical={timerCritical}>
							<Icon icon={Clock01Icon} size={16} color="currentColor" />
							<span class="timer-val">{timerLabel}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="question-wrap" use:fadeUp={{ delay: 0.05, y: 12 }}>
				<div class="question-card">
					{#if currentQuestion.type === 'sentence-context' && currentQuestion.card.example_jp}
						<p class="example-sentence jp">{currentQuestion.card.example_jp}</p>
						<p class="context-prompt">
							{t('session.answerIs', $locale, { a: `"${currentQuestion.card.jp}"` })}
						</p>
					{:else}
						<p class="question-jp jp">{currentQuestion.card.jp}</p>
						{#if currentQuestion.card.kana && currentQuestion.card.kana !== currentQuestion.card.jp}
							<p class="question-kana jp">{currentQuestion.card.kana}</p>
						{/if}
						<p class="question-prompt">{t('session.whatMean', $locale)}</p>
					{/if}
				</div>

				{#if currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'sentence-context'}
					<div class="options-list">
						{#each currentQuestion.options! as opt, idx (idx)}
							<button
								class="option-item"
								class:is-selected={selected === idx}
								class:is-correct={checked && opt === currentQuestion.correctAnswer && isCurrentCorrect}
								class:is-wrong={checked && selected === idx && opt !== currentQuestion.correctAnswer}
								disabled={checked}
								onclick={() => { if (!checked) selected = idx; }}
							>
								<div class="opt-marker">
									{#if checked && opt === currentQuestion.correctAnswer && isCurrentCorrect}
										<Icon icon={CheckmarkCircle01Icon} size={16} color="white" />
									{:else if checked && selected === idx && opt !== currentQuestion.correctAnswer}
										<Icon icon={Cancel01Icon} size={16} color="white" />
									{:else}
										{String.fromCharCode(65 + idx)}
									{/if}
								</div>
								<span class="opt-text">{opt}</span>
							</button>
						{/each}
					</div>
				{:else if currentQuestion.type === 'type-answer'}
					<div class="type-input-wrap">
						<input
							class="type-input"
							class:correct={checked && isCurrentCorrect}
							class:wrong={checked && !isCurrentCorrect}
							type="text"
							placeholder={t('session.typeMean', $locale) + '...'}
							bind:value={typedAnswer}
							disabled={checked}
						/>
					</div>
				{/if}

				{#if checked}
					<div class="feedback-premium-bar" class:is-correct={isCurrentCorrect} use:fadeUp={{ delay: 0, y: 15 }}>
						<div class="feedback-icon-wrap">
							<Icon icon={isCurrentCorrect ? CheckmarkCircle01Icon : Cancel01Icon} size={22} color="currentColor" />
						</div>
						<div class="feedback-text-side">
							<span class="feedback-title">
								{isCurrentCorrect ? t('exam.correct', $locale) : t('exam.incorrect', $locale)}
							</span>
						</div>
					</div>
				{/if}
			</div>

			<StickyFooter>
				{#if !checked}
					<button
						class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
						onclick={checkCurrentAnswer}
						disabled={currentQuestion.type === 'type-answer' ? !typedAnswer.trim() : selected === null}
					>
						{t('session.check', $locale)}
					</button>
				{:else}
					<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={advanceQuestion}>
						{currentIdx + 1 < questions.length ? t('exam.next', $locale) : t('exam.see_results', $locale)}
					</button>
				{/if}
			</StickyFooter>

		{:else if phase === 'result'}
			<Confetti bind:this={confettiRef} />
			<div use:fadeUp={{ delay: 0, y: 20 }} class="result-screen">
				<div class="result-premium-hero" class:is-pass={pct >= 70}>
					<div class="hero-content-wrapper">
						<div class="score-display-ring" use:fadeUp={{ delay: 0.2, y: 20 }}>
							<svg class="progress-svg" viewBox="0 0 100 100">
								<circle class="progress-track" cx="50" cy="50" r="45" fill="none" stroke-width="4" />
								<circle class="progress-bar" cx="50" cy="50" r="45" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="283" stroke-dashoffset={283 - (283 * pct) / 100} />
							</svg>
							<div class="score-labels"><span class="score-big">{pct}</span><span class="score-small">%</span></div>
						</div>
						<h2 class="hero-main-title">{pct >= 70 ? t('exam.perfect', $locale) : t('exam.keep_trying', $locale)}</h2>
						<div class="hero-xp-badge"><Icon icon={Target01Icon} size={14} color="var(--warning)" /><span>{t('exam.xp_earned', $locale, { n: score * 5 })}</span></div>
						<p class="hero-main-sub">{$locale === 'es' ? deck?.title_es : deck?.title_en}</p>
					</div>
				</div>

				<div class="stats-premium-row" use:fadeUp={{ delay: 0.45, y: 20 }}>
					<div class="stat-pill-sm correct"><Icon icon={CheckmarkCircle01Icon} size={14} color="var(--success)" /><span class="stat-v">{score}</span><span class="stat-l">{t('exam.correct_count', $locale)}</span></div>
					<div class="stat-pill-sm wrong"><Icon icon={Cancel01Icon} size={14} color="var(--hinomaru-red)" /><span class="stat-v">{wrongCount}</span><span class="stat-l">{t('exam.incorrect_count', $locale)}</span></div>
					<div class="stat-pill-sm duration"><Icon icon={Clock01Icon} size={14} color="var(--sumi)" /><span class="stat-v">{timeUsedLabel}</span><span class="stat-l">{t('exam.duration', $locale)}</span></div>
				</div>

				<div class="result-actions" use:fadeUp={{ delay: 0.5, y: 12 }}>
					<button class="hm-btn hm-btn-secondary hm-btn-lg" style="flex:1;" onclick={() => goto(`/deck/${deck?.id}`)}>
						← {t('deck.back', $locale)}
					</button>
					<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex:1;" onclick={startExam}>
						{t('exam.retry', $locale)}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if phase === 'anticipation'}
	<AnticipationScreen />
{/if}

{#snippet exitIcon()}
	<Icon icon={AlertCircleIcon} size={32} color="var(--hinomaru-red)" />
{/snippet}

<ResponsiveModal
	bind:open={showExitModal}
	title={t('exam.exit_title', $locale)}
	description={t('exam.exit_text', $locale)}
	icon={exitIcon}
>
	{#snippet actions()}
		<button class="modal-btn-cancel" onclick={() => (showExitModal = false)}>{t('common.cancel', $locale)}</button>
		<button class="modal-btn-confirm" onclick={handleConfirmExit}>{t('exam.exit_confirm', $locale)}</button>
	{/snippet}
</ResponsiveModal>

<style>
	.session-layout { display: flex; flex-direction: column; min-height: 100vh; background: var(--paper); }
	.session-container { 
		width: 100%; 
		max-width: 720px; 
		margin: 0 auto; 
		padding: calc(12px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom)); 
	}



	/* ── Back Button ── */
	.back {
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		display: inline-block;
		margin-bottom: 20px;
		transition: color 150ms;
	}
	@media (hover: hover) {
		.back:hover {
			color: var(--fg-primary);
		}
	}

	/* ── Premium Exam Header ── */
	.exam-premium-header { margin-bottom: 24px; }
	.exam-header-main { 
		display: grid; 
		grid-template-columns: 1fr auto 1fr; 
		align-items: center; 
		gap: 12px;
	}
	.header-left { display: flex; align-items: center; }
	.header-right { display: flex; justify-content: flex-end; align-items: center; }
	.exam-label-pill { font-size: 11px; font-weight: 800; color: var(--washi); background: var(--sumi); padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
	:global([data-theme='dark']) .exam-label-pill { background: var(--ink-200); color: var(--sumi); }
	.exam-step-indicator { display: flex; align-items: baseline; gap: 3px; font-weight: 700; }
	.step-curr { font-size: 18px; color: var(--sumi); }
	.step-divider { font-size: 14px; color: var(--fg-tertiary); opacity: 0.5; }
	.step-total { font-size: 14px; color: var(--fg-tertiary); }
	.exam-timer-pill { display: flex; align-items: center; gap: 8px; background: var(--bg-surface); border: 1.5px solid var(--ink-200); padding: 6px 12px; border-radius: 99px; font-variant-numeric: tabular-nums; font-weight: 700; color: var(--sumi); transition: all 0.3s; }
	.exam-timer-pill.is-critical { color: var(--hinomaru-red); border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); animation: timer-pulse 1s infinite alternate; }
	@keyframes timer-pulse { from { transform: scale(1); } to { transform: scale(1.05); } }

	/* ── Question ── */
	.question-wrap { display: flex; flex-direction: column; gap: 16px; }
	.question-card { background: var(--bg-surface); border: 1px solid var(--ink-200); border-radius: 24px; padding: 32px 24px; box-shadow: var(--shadow-sm); text-align: center; }
	.question-jp { font-size: 42px; font-weight: 800; color: var(--sumi); margin: 0 0 4px; line-height: 1.1; }
	.question-kana { font-size: 16px; color: var(--fg-tertiary); font-weight: 600; margin: 0 0 16px; }
	.question-prompt { font-size: 14px; font-weight: 600; color: var(--fg-secondary); opacity: 0.8; }
	.example-sentence { font-size: 20px; line-height: 1.7; color: var(--sumi); font-weight: 600; margin: 0 0 16px; }
	.context-prompt { font-size: 15px; color: var(--fg-secondary); font-weight: 500; }

	/* ── Options ── */
	.options-list { display: flex; flex-direction: column; gap: 10px; }
	.option-item { display: flex; align-items: center; gap: 14px; padding: 16px; border: 2px solid var(--ink-200); border-radius: 18px; background: var(--bg-surface); cursor: pointer; text-align: left; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; }
	.option-item:not(:disabled):hover { border-color: var(--ink-400); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
	.option-item.is-selected:not(.is-correct):not(.is-wrong) { border-color: var(--sumi); background: var(--ink-50); }
	.option-item.is-correct { border-color: var(--success) !important; background: var(--success-wash) !important; border-width: 3px; }
	.option-item.is-wrong { border-color: var(--hinomaru-red) !important; background: var(--hinomaru-red-wash) !important; border-width: 3px; }
	.opt-marker { width: 32px; height: 32px; border-radius: 10px; background: var(--ink-100); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: var(--fg-secondary); flex-shrink: 0; transition: all 0.2s; }
	.is-selected:not(.is-correct):not(.is-wrong) .opt-marker { background: var(--sumi); color: var(--washi); }
	.is-correct .opt-marker { background: var(--success); color: white; border-radius: 50%; box-shadow: 0 0 10px rgba(46, 125, 91, 0.3); }
	.is-wrong .opt-marker { background: var(--hinomaru-red); color: white; border-radius: 50%; box-shadow: 0 0 10px rgba(188, 0, 45, 0.3); }
	.opt-text { font-size: 16px; font-weight: 700; color: var(--fg-primary); }

	/* ── Type Input ── */
	.type-input { width: 100%; padding: 18px 20px; background: var(--bg-surface); border: 2px solid var(--ink-200); border-radius: 18px; font-size: 18px; font-weight: 700; color: var(--sumi); transition: all 0.2s; }
	.type-input:focus { outline: none; border-color: var(--sumi); box-shadow: 0 0 0 4px var(--ink-100); }
	.type-input.correct { border-color: var(--success); background: var(--success-wash); }
	.type-input.wrong { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }

	/* ── Feedback Premium Bar ── */
	.feedback-premium-bar { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-radius: 20px; margin-top: 12px; background: var(--hinomaru-red-wash); color: var(--hinomaru-red); border: 1px solid rgba(188, 0, 45, 0.1); }
	.feedback-premium-bar.is-correct { background: var(--success-wash); color: var(--success); border-color: rgba(46, 125, 91, 0.1); }
	.feedback-icon-wrap { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.5); flex-shrink: 0; }
	:global([data-theme='dark']) .feedback-icon-wrap { background: rgba(0, 0, 0, 0.2); }
	.feedback-text-side { display: flex; flex-direction: column; gap: 2px; }
	.feedback-title { font-size: 16px; font-weight: 800; }
	.feedback-sub { font-size: 13px; font-weight: 600; opacity: 0.8; }

	/* ── Result Screen ── */
	.result-screen { display: flex; flex-direction: column; gap: 24px; }
	.result-premium-hero { position: relative; border-radius: 32px; padding: 48px 24px; text-align: center; overflow: hidden; background: #1a1a1a; color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
	.result-premium-hero.is-pass { background: linear-gradient(135deg, #bc002d 0%, #8b0021 100%); }
	.hero-content-wrapper { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 24px; }
	.result-actions { display: flex; gap: 12px; margin-top: 8px; }
	.score-display-ring { position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; }
	.progress-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
	.progress-track { stroke: rgba(255,255,255,0.15); }
	.progress-bar { stroke: white; transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1); }
	.score-labels { position: absolute; display: flex; align-items: baseline; gap: 2px; }
	.score-big { font-size: 56px; font-weight: 800; line-height: 1; }
	.score-small { font-size: 20px; font-weight: 700; opacity: 0.8; }
	.hero-main-title { font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
	.hero-xp-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(251, 191, 36, 0.15); color: #f59e0b; padding: 4px 12px; border-radius: 99px; font-size: 13px; font-weight: 700; border: 1px solid rgba(251, 191, 36, 0.2); }
	.hero-main-sub { font-size: 13px; font-weight: 700; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em; }

	.stats-premium-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
	.stat-pill-sm { background: var(--bg-surface); border: 1px solid var(--ink-200); border-radius: 99px; padding: 10px 18px; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: var(--shadow-sm); }
	.stat-v { font-size: 16px; font-weight: 800; color: var(--sumi); }
	.stat-l { font-size: 12px; font-weight: 700; color: var(--fg-secondary); text-transform: lowercase; }

	/* Modal handled by ResponsiveModal */

	.jp { font-family: var(--font-jp); }

	:global([data-theme='dark']) .option-item:not(.is-correct):not(.is-wrong):not(.is-selected):hover { background: var(--ink-100); border-color: var(--ink-300); }
	:global([data-theme='dark']) .option-item.is-selected { background: var(--ink-200); border-color: var(--sumi); }
	:global([data-theme='dark']) .stat-pill-sm, :global([data-theme='dark']) .question-card, :global([data-theme='dark']) .rules-box, :global([data-theme='dark']) .modal-content { background: var(--ink-100); border-color: var(--ink-200); }
</style>
