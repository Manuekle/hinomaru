<script lang="ts">
	import { goto, beforeNavigate } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { createClient } from '$lib/supabase';
	import ResponsiveModal from '$lib/components/ui/ResponsiveModal.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import { fadeUp, fadeIn } from '$lib/motion';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import {
		CheckmarkCircle01Icon,
		Cancel01Icon,
		Clock01Icon,
		Award01Icon,
		ArrowLeft01Icon,
		AlertCircleIcon,
		Target01Icon
	} from '@hugeicons/core-free-icons';
	import {
		getTest,
		type JLPTLevel,
		type JLPTMondai
	} from '$lib/data/jlpt/index';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';

	let { data } = $props<{ data: { level: string } }>();

	const supabase = createClient();
	const level = $derived(data.level as JLPTLevel);

	// ── Questions State ───────────────────────────────────────────────────────
	interface FlatQuestion {
		id: number;
		sentence: string;
		choices: string[];
		answer: number;
		type: 'vocabulary' | 'grammar';
		mondaiId: string;
		romaji?: string;
		choices_romaji?: string[];
	}
	let allQuestions = $state<FlatQuestion[]>([]);

	function shuffleArray<T>(array: T[]): T[] {
		const arr = [...array];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	// ── Phase & state ─────────────────────────────────────────────────────────
	type Phase = 'intro' | 'exam' | 'result' | 'anticipation';
	let phase = $state<Phase>('intro');
	let currentIdx = $state(0);
	let selected = $state<number | null>(null);
	let checked = $state(false);
	let correctness = $state<boolean[]>([]);
	let advanceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Timer
	const DURATION = 20 * 60; 
	let timeLeft = $state(DURATION);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let timeUsed = $state(0);

	let confettiRef = $state<{ fire: () => void } | null>(null);

	// ── Derived ──────────────────────────────────────────────────────────────
	const currentQ = $derived(allQuestions[currentIdx]);
	const score = $derived(correctness.filter(Boolean).length);
	const wrongCount = $derived(correctness.filter((b) => !b).length);
	const pct = $derived(allQuestions.length > 0 ? Math.round((score / allQuestions.length) * 100) : 0);
	const timerCritical = $derived(timeLeft <= 60);
	const timerLabel = $derived(
		`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
	);
	const timeUsedLabel = $derived(
		`${Math.floor(timeUsed / 60)}:${String(timeUsed % 60).padStart(2, '0')}`
	);

	const PASS_THRESHOLD = 70;
	const isPass = $derived(pct >= PASS_THRESHOLD);
	const isCorrect = $derived(checked && correctness[currentIdx] === true);

	// ── Logic ─────────────────────────────────────────────────────────────────
	function startTimer() {
		timeLeft = DURATION;
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
		timeUsed = DURATION - timeLeft;
	}

	function startExam() {
		const vTest = getTest(level, 'vocabulary');
		const gTest = getTest(level, 'grammar');
		const pool: FlatQuestion[] = [];
		
		[vTest, gTest].forEach((test, idx) => {
			if (!test) return;
			const type = idx === 0 ? 'vocabulary' : 'grammar';
			test.mondai.forEach((m: JLPTMondai) => {
				m.questions.forEach((q) => {
					const originalCorrectChoice = q.choices[q.answer - 1];
					const shuffledChoices = shuffleArray(q.choices);
					const newAnswer = shuffledChoices.indexOf(originalCorrectChoice) + 1;
					pool.push({
						...q,
						choices: shuffledChoices,
						answer: newAnswer,
						type,
						mondaiId: m.id
					});
				});
			});
		});

		allQuestions = shuffleArray(pool).slice(0, 30);
		currentIdx = 0;
		selected = null;
		checked = false;
		correctness = [];
		phase = 'exam';
		startTimer();
	}

	function checkAnswer() {
		if (checked || selected === null) return;
		const isRight = selected + 1 === currentQ.answer;
		checked = true;
		correctness = [...correctness, isRight];
		if (isRight) playCorrect(); else playWrong();
		advanceTimeout = setTimeout(advanceQuestion, isRight ? 1200 : 2500);
	}

	function advanceQuestion() {
		if (advanceTimeout) { clearTimeout(advanceTimeout); advanceTimeout = null; }
		if (currentIdx + 1 >= allQuestions.length) { endExam(); return; }
		currentIdx += 1;
		selected = null;
		checked = false;
	}

	async function saveResult() {
		const date = new Date().toISOString();
		localStorage.setItem(`jlpt_result_${level}_mock`, JSON.stringify({ score, total: allQuestions.length, pct, date }));
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await supabase.from('jlpt_results').upsert(
					{ user_id: user.id, level, section: 'mock', score, total: allQuestions.length, pct, completed_at: date },
					{ onConflict: 'user_id,level,section' }
				);
			}
		} catch { /* ignore */ }
	}

	function endExam() {
		stopTimer();
		phase = 'anticipation';
		setTimeout(async () => {
			phase = 'result';
			playFinish();
			await saveResult();
			if (isPass) setTimeout(() => confettiRef?.fire(), 300);
		}, 2200);
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
		if (advanceTimeout) clearTimeout(advanceTimeout);
		stopTimer();
		showExitModal = false;
		phase = 'intro';
		goto(nextRoute || '/jlpt');
	}
</script>

<svelte:head>
	<title>{t('jlpt.mock.title', $locale)} {level} — Hinomaru</title>
</svelte:head>

<div class="session-layout">
	<div class="session-container">

		{#if phase === 'intro'}
			<div class="intro-screen" use:fadeIn>
				<div class="intro-icon">
					<div class="hinomaru-dot-big"></div>
				</div>
				<span class="intro-badge">{level}</span>
				<h1 class="intro-title jp">{t('jlpt.mock.title', $locale)}</h1>
				<p class="intro-sub">{t('jlpt.mock.desc', $locale)}</p>

				<div class="intro-stats">
					<div class="stat-card">
						<span class="stat-val">20</span>
						<span class="stat-label">{t('exam.minutes', $locale)}</span>
					</div>
					<div class="stat-divider"></div>
					<div class="stat-card">
						<span class="stat-val">30</span>
						<span class="stat-label">{t('exam.questions', $locale)}</span>
					</div>
					<div class="stat-divider"></div>
					<div class="stat-card">
						<span class="stat-val">{PASS_THRESHOLD}%</span>
						<span class="stat-label">{t('jlpt.mock.min_score', $locale)}</span>
					</div>
				</div>

				<StickyFooter>
					<div class="result-actions">
						<button class="hm-btn hm-btn-secondary hm-btn-lg" style="flex:1" onclick={() => goto('/jlpt')}>
							{t('jlpt.mock.back_btn', $locale)}
						</button>
						<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex:2" onclick={startExam}>
							{t('jlpt.mock.start_btn', $locale)}
						</button>
					</div>
				</StickyFooter>
			</div>

		{:else if phase === 'exam' && currentQ}
			<div use:fadeIn={{ delay: 0 }}>
				<button class="back-link-premium" onclick={() => showExitModal = true}>
					← {t('jlpt.mock.back_btn', $locale)}
				</button>
			</div>

			<!-- Premium Exam Header -->
			<div class="exam-premium-header">
				<div class="exam-header-main">
					<div class="header-left">
						<span class="exam-label-pill">MOCK EXAM</span>
					</div>

					<div class="exam-step-indicator">
						<span class="step-curr">{currentIdx + 1}</span>
						<span class="step-divider">/</span>
						<span class="step-total">{allQuestions.length}</span>
					</div>

					<div class="header-right">
						<div class="exam-timer-pill" class:is-critical={timerCritical}>
							<Icon icon={Clock01Icon} size={16} color="currentColor" />
							<span class="timer-val">{timerLabel}</span>
						</div>
					</div>
				</div>
			</div>

			<main class="question-wrap" use:fadeUp={{ delay: 0.1, y: 12 }}>
				<div class="mondai-info-card">
					<p class="mondai-title">{currentQ.type === 'vocabulary' ? '文字・語彙' : '文法'}</p>
				</div>

				<div class="question-card">
					<p class="question-text jp">{currentQ.sentence}</p>
					{#if $showRomaji && currentQ.romaji}
						<p class="question-romaji">{currentQ.romaji}</p>
					{/if}
				</div>

				<div class="options-list">
					{#each currentQ.choices as choice, idx (idx)}
						<button
							class="option-item"
							class:is-selected={selected === idx}
							class:is-correct={checked && selected === idx && idx + 1 === currentQ.answer}
							class:is-wrong={checked && selected === idx && idx + 1 !== currentQ.answer}
							disabled={checked}
							onclick={() => { if (!checked) selected = idx; }}
						>
							<div class="opt-marker">
								{#if checked && selected === idx && idx + 1 === currentQ.answer}
									<Icon icon={CheckmarkCircle01Icon} size={16} color="white" />
								{:else if checked && selected === idx && idx + 1 !== currentQ.answer}
									<Icon icon={Cancel01Icon} size={16} color="white" />
								{:else}
									{idx + 1}
								{/if}
							</div>
							<div class="opt-content">
								<span class="opt-text jp">{choice}</span>
								{#if $showRomaji && currentQ.choices_romaji?.[idx]}
									<span class="opt-romaji">{currentQ.choices_romaji[idx]}</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>

				{#if checked}
					<div 
						class="feedback-premium-bar" 
						class:is-correct={isCorrect}
						use:fadeUp={{ delay: 0, y: 10 }}
					>
						<div class="feedback-icon-wrap">
							<Icon icon={isCorrect ? CheckmarkCircle01Icon : Cancel01Icon} size={20} color="currentColor" />
						</div>
						<div class="feedback-text-side">
							<span class="feedback-title">{isCorrect ? t('exam.correct', $locale) : t('exam.incorrect', $locale)}</span>
						</div>
					</div>
				{/if}
			</main>

			<StickyFooter>
				{#if !checked}
					<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={checkAnswer} disabled={selected === null}>
						{t('jlpt.mock.confirm_btn', $locale)}
					</button>
				{:else}
					<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={advanceQuestion}>
						{currentIdx + 1 < allQuestions.length ? t('exam.next', $locale) : t('exam.see_results', $locale)}
					</button>
				{/if}
			</StickyFooter>

		{:else if phase === 'result'}
			<Confetti bind:this={confettiRef} />
			<div class="result-screen" use:fadeUp>
				
				<div class="result-premium-hero" class:is-pass={isPass}>
					<div class="hero-content-wrapper">
						<div class="score-display-ring">
							<svg class="progress-svg" viewBox="0 0 100 100">
								<circle class="progress-track" cx="50" cy="50" r="45" fill="none" stroke-width="4" />
								<circle 
									class="progress-bar" 
									cx="50" cy="50" r="45" 
									fill="none" stroke-width="6" 
									stroke-linecap="round"
									stroke-dasharray="283"
									stroke-dashoffset={283 - (283 * pct) / 100}
								/>
							</svg>
							<div class="score-labels">
								<span class="score-big">{pct}</span>
								<span class="score-small">%</span>
							</div>
						</div>

						<h1 class="hero-main-title">{isPass ? t('jlpt.mock.passed_title', $locale) : t('jlpt.mock.failed_title', $locale)}</h1>
						<div class="hero-xp-badge">
							<Icon icon={Award01Icon} size={14} color="currentColor" />
							<span>CERTIFICATION MOCK</span>
						</div>
						<p class="hero-main-sub">{level} · {t('jlpt.mock.title', $locale)}</p>
					</div>
				</div>

				<div class="stats-premium-row">
					<div class="stat-pill-sm correct">
						<Icon icon={CheckmarkCircle01Icon} size={14} color="var(--success)" />
						<span class="stat-v">{score}</span>
						<span class="stat-l">{t('jlpt.mock.correct_label', $locale)}</span>
					</div>
					<div class="stat-pill-sm wrong">
						<Icon icon={Cancel01Icon} size={14} color="var(--hinomaru-red)" />
						<span class="stat-v">{wrongCount}</span>
						<span class="stat-l">{t('jlpt.mock.questions', $locale)}</span>
					</div>
					<div class="stat-pill-sm duration">
						<Icon icon={Clock01Icon} size={14} color="var(--sumi)" />
						<span class="stat-v">{timeUsedLabel}</span>
						<span class="stat-l">{t('jlpt.mock.time_label', $locale)}</span>
					</div>
				</div>

				<StickyFooter>
					<div class="result-actions">
						<button class="hm-btn hm-btn-secondary hm-btn-lg" style="flex:1" onclick={() => goto('/jlpt')}>
							{t('jlpt.mock.back_btn', $locale)}
						</button>
						{#if isPass}
							<button class="hm-btn hm-btn-primary hm-btn-lg" style="flex:2" onclick={() => goto(`/jlpt/certificate/${level}`)}>
								{t('jlpt.mock.cert_btn', $locale)}
							</button>
						{:else}
							<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex:2" onclick={startExam}>
								{t('jlpt.mock.retry_btn', $locale)}
							</button>
						{/if}
					</div>
				</StickyFooter>
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
	.session-layout {
		min-height: 100vh;
		background: var(--paper);
	}

	.session-container {
		max-width: 720px;
		margin: 0 auto;
		padding: calc(12px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));
	}

	/* ── INTRO ── */
	.intro-screen { text-align: center; padding: 40px 0 20px; }
	.intro-icon {
		width: 80px; height: 80px;
		background: #ffffff; border-radius: 22px;
		display: flex; align-items: center; justify-content: center;
		margin: 0 auto 20px;
		box-shadow: var(--shadow-md); border: 1.5px solid var(--ink-200);
	}
	.hinomaru-dot-big { width: 36px; height: 36px; background: #bc002d; border-radius: 50%; }
	
	.intro-badge {
		display: inline-block; font-size: 12px; font-weight: 700;
		letter-spacing: 0.08em; text-transform: uppercase;
		color: var(--fg-tertiary); background: var(--ink-100);
		padding: 4px 12px; border-radius: 99px; margin-bottom: 10px;
	}
	.intro-title { font-size: 34px; font-weight: 800; color: var(--sumi); margin: 0 0 6px; letter-spacing: -0.02em; }
	.intro-sub { font-size: 15px; color: var(--fg-secondary); margin: 0 0 32px; }

	.intro-stats {
		display: inline-flex; align-items: center; gap: 0;
		background: var(--bg-surface); border: 1px solid var(--ink-200);
		border-radius: 16px; padding: 0 24px; margin-bottom: 24px;
	}
	.stat-card { display: flex; flex-direction: column; align-items: center; padding: 16px 20px; gap: 3px; }
	.stat-divider { width: 1px; height: 36px; background: var(--ink-200); }
	.stat-val { font-size: 28px; font-weight: 700; color: var(--sumi); line-height: 1; }
	.stat-label { font-size: 11px; color: var(--fg-tertiary); font-weight: 600; letter-spacing: 0.04em; }

	/* ── Mondai Card ── */
	.mondai-info-card {
		background: var(--bg-surface); border: 1px solid var(--ink-200);
		border-radius: 14px; padding: 10px 16px; margin-bottom: 12px; display: inline-flex;
	}
	.mondai-title { font-size: 12px; font-weight: 700; color: var(--fg-secondary); margin: 0; }

	/* ── EXAM ── */
	.back-link-premium {
		background: none; border: none; padding: 0;
		font-size: 13px; color: var(--fg-secondary); cursor: pointer;
		margin-bottom: 20px; transition: color 0.2s;
	}
	.back-link-premium:hover { color: var(--fg-primary); }

	.exam-premium-header { margin: 0 0 24px; }
	.exam-header-main { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; }
	.header-left { display: flex; align-items: center; }
	.header-right { display: flex; justify-content: flex-end; align-items: center; }

	.exam-label-pill {
		font-size: 11px; font-weight: 800;
		color: var(--hinomaru-red); background: var(--hinomaru-red-wash);
		padding: 4px 10px; border-radius: 6px;
		text-transform: uppercase; letter-spacing: 0.05em;
	}

	.exam-step-indicator { display: flex; align-items: baseline; gap: 3px; font-weight: 700; }
	.step-curr { font-size: 18px; font-weight: 800; color: var(--sumi); }
	.step-divider { font-size: 14px; color: var(--fg-tertiary); opacity: 0.4; }
	.step-total { font-size: 14px; font-weight: 600; color: var(--fg-tertiary); }

	.exam-timer-pill {
		display: flex; align-items: center; gap: 8px;
		background: var(--bg-surface); border: 1.5px solid var(--ink-200);
		padding: 6px 14px; border-radius: 99px;
		font-weight: 700; color: var(--sumi); font-variant-numeric: tabular-nums;
	}
	.exam-timer-pill.is-critical { color: var(--hinomaru-red); border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); animation: timer-pulse 1s infinite alternate; }
	@keyframes timer-pulse { from { transform: scale(1); } to { transform: scale(1.05); } }

	.question-wrap { display: flex; flex-direction: column; }
	.question-card { background: var(--bg-surface); border: 1px solid var(--ink-200); border-radius: 20px; padding: 24px 22px; margin-bottom: 12px; box-shadow: var(--shadow-sm); }
	.question-text { font-size: 19px; line-height: 1.75; margin: 0; color: var(--sumi); white-space: pre-line; }
	.question-romaji { font-size: 13px; color: var(--fg-tertiary); margin: 8px 0 0; line-height: 1.6; font-style: italic; letter-spacing: 0.02em; }

	.options-list { display: flex; flex-direction: column; gap: 10px; }
	.option-item {
		display: flex; align-items: center; gap: 14px; padding: 16px;
		border: 2px solid var(--ink-200); border-radius: 18px;
		background: var(--bg-surface); cursor: pointer; text-align: left;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); width: 100%;
	}
	.option-item:not(:disabled):hover { border-color: var(--ink-400); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
	.option-item.is-selected { border-color: var(--sumi); background: var(--ink-50); }
	.option-item.is-correct { border-color: var(--success) !important; background: var(--success-wash) !important; border-width: 3px; }
	.option-item.is-wrong { border-color: var(--hinomaru-red) !important; background: var(--hinomaru-red-wash) !important; border-width: 3px; }

	.opt-marker { 
		width: 32px; height: 32px; background: var(--ink-100); border-radius: 10px; 
		display: flex; align-items: center; justify-content: center; 
		font-size: 14px; font-weight: 800; color: var(--fg-secondary); flex-shrink: 0; 
	}
	.is-selected .opt-marker { background: var(--sumi); color: white; }
	.is-correct .opt-marker { background: var(--success); color: white; border-radius: 50%; }
	.is-wrong .opt-marker { background: var(--hinomaru-red); color: white; border-radius: 50%; }

	.opt-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
	.opt-text { font-size: 17px; font-weight: 600; color: var(--fg-primary); line-height: 1.4; }
	.opt-romaji { font-size: 12px; color: var(--fg-tertiary); font-style: italic; opacity: 0.7; }

	.feedback-premium-bar {
		margin-top: 12px; display: flex; align-items: center; gap: 16px;
		padding: 16px 20px; border-radius: 20px;
		background: var(--hinomaru-red-wash); border: 1px solid rgba(188, 0, 45, 0.1); color: var(--hinomaru-red);
	}
	.feedback-premium-bar.is-correct { border-color: rgba(46, 125, 91, 0.1); background: var(--success-wash); color: var(--success); }
	.feedback-icon-wrap { width: 44px; height: 44px; border-radius: 14px; background: rgba(255, 255, 255, 0.5); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
	:global(.dark) .feedback-icon-wrap { background: rgba(0, 0, 0, 0.2); }
	.feedback-title { font-size: 16px; font-weight: 800; }

	/* ── RESULT SCREEN ── */
	.result-screen { display: flex; flex-direction: column; gap: 24px; padding-bottom: 40px; }

	.result-premium-hero {
		position: relative; border-radius: 32px; padding: 48px 24px;
		text-align: center; overflow: hidden; background: #1a1a1a; color: white;
		box-shadow: 0 20px 40px rgba(0,0,0,0.15);
	}
	.result-premium-hero.is-pass { background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%); }
	.result-premium-hero:not(.is-pass) { background: linear-gradient(135deg, #bc002d 0%, #8b0021 100%); }
	.hero-content-wrapper { position: relative; z-index: 2; }

	.score-display-ring { position: relative; width: 140px; height: 140px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
	.progress-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
	.progress-track { stroke: rgba(255,255,255,0.1); }
	.progress-bar { stroke: white; transition: stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
	.is-pass .progress-bar { stroke: #4ade80; }
	.score-labels { display: flex; align-items: baseline; gap: 2px; }
	.score-big { font-size: 52px; font-weight: 900; line-height: 1; }
	.score-small { font-size: 18px; font-weight: 600; opacity: 0.6; }

	.hero-main-title { font-size: 26px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.02em; }
	.hero-xp-badge {
		display: inline-flex; align-items: center; gap: 6px;
		background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1);
		padding: 4px 12px; border-radius: 99px;
		font-size: 12px; font-weight: 700; margin-bottom: 12px;
	}
	.hero-main-sub { font-size: 13px; font-weight: 600; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em; }

	.stats-premium-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 8px; }
	.stat-pill-sm { background: var(--bg-surface); border: 1px solid var(--ink-200); border-radius: 99px; padding: 8px 14px; display: flex; align-items: center; gap: 6px; transition: all 0.2s; box-shadow: var(--shadow-sm); }
	.stat-v { font-size: 14px; font-weight: 800; color: var(--sumi); }
	.stat-l { font-size: 11px; font-weight: 600; color: var(--fg-secondary); text-transform: lowercase; }

	.result-actions { display: flex; gap: 12px; width: 100%; }

	/* ── DARK MODE OVERRIDES ── */
	:global([data-theme='dark']) .option-item:not(.is-correct):not(.is-wrong):not(.is-selected):hover { background: var(--ink-100); border-color: var(--ink-300); }
	:global([data-theme='dark']) .option-item.is-selected { background: var(--ink-200); border-color: var(--sumi); }
	:global([data-theme='dark']) .stat-pill-sm,
	:global([data-theme='dark']) .intro-stats,
	:global([data-theme='dark']) .question-card,
	:global([data-theme='dark']) .mondai-info-card { background: var(--ink-100); border-color: var(--ink-200); }

	.jp { font-family: var(--font-jp); }
</style>
