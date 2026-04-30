<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fadeUp } from '$lib/motion';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import {
		Certificate01Icon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		HeadphonesIcon,
		Clock01Icon,
		Target01Icon
	} from '@hugeicons/core-free-icons';
	import {
		getTest,
		SECTION_LABELS,
		AUDIO_FILES,
		LISTENING_TRANSCRIPTS,
		type JLPTLevel,
		type JLPTSectionType,
		type JLPTQuestion,
		type JLPTMondai
	} from '$lib/data/jlpt/index';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	let { data } = $props<{ data: { level: string; section: string } }>();

	const level = $derived(data.level as JLPTLevel);
	const section = $derived(data.section as JLPTSectionType);
	const sectionLabel = $derived(SECTION_LABELS[section] ?? { es: section, jp: '' });

	// ── Test data ──────────────────────────────────────────────────────────────
	const test = $derived(section !== 'listening' ? getTest(level, section) : null);
	const audioFiles = $derived(
		section === 'listening' ? (AUDIO_FILES[level] ?? []) : []
	);

	// ── Flat question list ────────────────────────────────────────────────────
	interface FlatQuestion extends JLPTQuestion {
		mondaiTitle: string;
		mondaiId: string;
	}
	const allQuestions = $derived<FlatQuestion[]>(
		test
			? test.mondai.flatMap((m: JLPTMondai) =>
					m.questions.map((q) => ({ ...q, mondaiTitle: m.title, mondaiId: m.id }))
				)
			: []
	);

	// ── Phase & state ─────────────────────────────────────────────────────────
	type Phase = 'intro' | 'exam' | 'result' | 'listening';
	let phase = $state<Phase>('intro');
	let currentIdx = $state(0);
	let selected = $state<number | null>(null);
	let checked = $state(false);
	let correctness = $state<boolean[]>([]);
	let selectedHistory = $state<number[]>([]);
	let advanceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Timer
	const DURATION = $derived((test?.duration ?? 25) * 60);
	let timeLeft = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let timeUsed = $state(0);

	// Audio state
	let currentAudioIdx = $state(0);
	let audioEl = $state<HTMLAudioElement | null>(null);
	let audioPlaying = $state(false);
	let showTranscript = $state(false);

	// ── Derived ──────────────────────────────────────────────────────────────
	const currentQ = $derived(allQuestions[currentIdx]);
	const activeTranscript = $derived(LISTENING_TRANSCRIPTS[level]?.[currentAudioIdx] ?? '');
	const score = $derived(correctness.filter(Boolean).length);
	const wrong = $derived(correctness.filter((b) => !b).length);
	const pct = $derived(allQuestions.length > 0 ? Math.round((score / allQuestions.length) * 100) : 0);
	const timerPct = $derived(DURATION > 0 ? (timeLeft / DURATION) * 100 : 0);
	const timerCritical = $derived(timeLeft <= 60);
	const timerLabel = $derived(
		`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
	);
	const timeUsedLabel = $derived(
		`${Math.floor(timeUsed / 60)}:${String(timeUsed % 60).padStart(2, '0')}`
	);
	const progressPct = $derived(
		allQuestions.length > 0 ? (currentIdx / allQuestions.length) * 100 : 0
	);

	// ── Timer ─────────────────────────────────────────────────────────────────
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

	// ── Exam flow ─────────────────────────────────────────────────────────────
	function startExam() {
		if (section === 'listening') { phase = 'listening'; return; }
		currentIdx = 0;
		selected = null;
		checked = false;
		correctness = [];
		selectedHistory = [];
		phase = 'exam';
		startTimer();
	}

	function checkAnswer() {
		if (checked || selected === null) return;
		const isRight = selected + 1 === currentQ.answer;
		checked = true;
		correctness = [...correctness, isRight];
		selectedHistory = [...selectedHistory, selected];
		if (isRight) playCorrect(); else playWrong();
		advanceTimeout = setTimeout(advanceQuestion, isRight ? 1800 : 2800);
	}

	function advanceQuestion() {
		if (advanceTimeout) { clearTimeout(advanceTimeout); advanceTimeout = null; }
		if (currentIdx + 1 >= allQuestions.length) { endExam(); return; }
		currentIdx += 1;
		selected = null;
		checked = false;
	}

	function endExam() {
		stopTimer();
		phase = 'result';
		playFinish();
		// Persist result
		try {
			localStorage.setItem(
				`jlpt_result_${level}_${section}`,
				JSON.stringify({ score, total: allQuestions.length, pct, date: new Date().toISOString() })
			);
		} catch {}
	}

	const isCorrect = $derived(
		checked && selected !== null && selected + 1 === currentQ?.answer
	);

	// ── Audio ─────────────────────────────────────────────────────────────────
	function playAudio(idx: number) {
		if (!audioEl) return;
		currentAudioIdx = idx;
		audioEl.src = `/jlpt/audio/${audioFiles[idx]}`;
		audioEl.play();
		audioPlaying = true;
	}

	onMount(() => {
		return () => {
			if (timerInterval) clearInterval(timerInterval);
			if (advanceTimeout) clearTimeout(advanceTimeout);
		};
	});
</script>

<svelte:head>
	<title>{level} {sectionLabel.es} — JLPT — Hinomaru</title>
</svelte:head>

<!-- Hidden audio element for listening section -->
{#if section === 'listening'}
	<audio
		bind:this={audioEl}
		onended={() => (audioPlaying = false)}
		onpause={() => (audioPlaying = false)}
		onplay={() => (audioPlaying = true)}
	></audio>
{/if}

<div class="session-layout">
	<div class="session-container">

		<!-- ── INTRO ── -->
		{#if phase === 'intro'}
			<div use:fadeUp={{ delay: 0, y: 16 }} class="intro-screen">
				<div class="intro-icon">
					{#if section === 'listening'}
						<Icon icon={HeadphonesIcon} size={44} color="var(--washi)" strokeWidth={1.5} />
					{:else}
						<Icon icon={Certificate01Icon} size={44} color="var(--washi)" strokeWidth={1.5} />
					{/if}
				</div>

				<div class="intro-badge">{level}</div>
				<h1 class="intro-title">{sectionLabel.jp}</h1>
				<p class="intro-sub">{sectionLabel.es}</p>

				<div class="intro-stats">
					<div class="stat-card">
						<span class="stat-val">
							{section === 'listening' ? audioFiles.length : allQuestions.length}
						</span>
						<span class="stat-label">
							{section === 'listening' ? 'archivos' : 'preguntas'}
						</span>
					</div>
					{#if section !== 'listening'}
						<div class="stat-divider"></div>
						<div class="stat-card">
							<span class="stat-val">{test?.duration ?? 25}</span>
							<span class="stat-label">minutos</span>
						</div>
					{/if}
				</div>

				{#if section !== 'listening' && allQuestions.length === 0}
					<p class="unavail">Contenido próximamente disponible.</p>
				{/if}
			</div>

			<StickyFooter>
				<button class="hm-btn hm-btn-secondary hm-btn-lg" style="flex:1;" onclick={() => goto('/jlpt')}>
					← Volver
				</button>
				<button
					class="hm-btn hm-btn-dark hm-btn-lg"
					style="flex:2;"
					onclick={startExam}
					disabled={section !== 'listening' && allQuestions.length === 0}
				>
					Comenzar
				</button>
			</StickyFooter>

		<!-- ── EXAM ── -->
		{:else if phase === 'exam' && currentQ}
			<!-- Progress + timer bar -->
			<div class="exam-top-bars">
				<div class="progress-bar-wrap">
					<div class="progress-bar-fill" style="width:{progressPct}%"></div>
				</div>
				<div class="timer-bar-wrap">
					<div class="timer-bar-fill" class:critical={timerCritical} style="width:{timerPct}%"></div>
				</div>
			</div>

			<div class="exam-header" use:fadeUp={{ delay: 0, y: 8 }}>
				<div class="exam-header-left">
					<span class="mondai-badge">{currentQ.mondaiTitle}</span>
					<span class="q-counter">{currentIdx + 1} / {allQuestions.length}</span>
				</div>
				<span class="timer-label" class:critical={timerCritical}>{timerLabel}</span>
			</div>

			<div class="question-wrap" use:fadeUp={{ delay: 0.04, y: 12 }}>
				<div class="question-card">
					<p class="question-text jp">{currentQ.sentence}</p>
					{#if $showRomaji}
						<p class="question-romaji">{kanaToRomaji(currentQ.sentence)}</p>
					{/if}
				</div>

				<div class="options-list">
					{#each currentQ.choices as choice, idx (idx)}
						<button
							class="option-item"
							class:is-selected={selected === idx}
							class:is-correct={checked && idx + 1 === currentQ.answer}
							class:is-wrong={checked && selected === idx && idx + 1 !== currentQ.answer}
							disabled={checked}
							onclick={() => { if (!checked) selected = idx; }}
						>
							<span class="opt-marker">{idx + 1}</span>
							<div class="opt-content">
								<span class="opt-text jp">{choice}</span>
								{#if $showRomaji}
									<span class="opt-romaji">{kanaToRomaji(choice)}</span>
								{/if}
							</div>
						</button>
					{/each}
				</div>

				{#if checked}
					<div class="feedback-banner" class:correct={isCorrect} class:wrong={!isCorrect}>
						{#if isCorrect}
							<Icon icon={CheckmarkCircle01Icon} size={18} color="currentColor" strokeWidth={2} />
							<span>正解！</span>
						{:else}
							<div class="feedback-wrong-content">
								<div class="feedback-row">
									<Icon icon={Cancel01Icon} size={18} color="currentColor" strokeWidth={2} />
									<span>不正解</span>
								</div>
								<span class="feedback-correct-ans jp">正解: {currentQ.choices[currentQ.answer - 1]}</span>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<StickyFooter>
				{#if !checked}
					<button
						class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
						onclick={checkAnswer}
						disabled={selected === null}
					>
						確認
					</button>
				{:else}
					<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={advanceQuestion}>
						{currentIdx + 1 < allQuestions.length ? '次へ →' : '結果を見る'}
					</button>
				{/if}
			</StickyFooter>

		<!-- ── LISTENING ── -->
		{:else if phase === 'listening'}
			<div use:fadeUp={{ delay: 0, y: 12 }} class="listening-screen">
				<div class="listen-header">
					<div class="intro-icon">
						<Icon icon={HeadphonesIcon} size={36} color="var(--washi)" strokeWidth={1.5} />
					</div>
					<div>
						<h2 class="listen-title">{level} 聴解</h2>
						<p class="listen-sub">Escucha · {audioFiles.length} archivos</p>
					</div>
				</div>

				<div class="audio-list">
					{#each audioFiles as file, idx (idx)}
						{@const isActive = currentAudioIdx === idx && audioPlaying}
						<button
							class="audio-item"
							class:playing={isActive}
							onclick={() => playAudio(idx)}
						>
							<span class="audio-icon-wrap" class:active={isActive}>
								{isActive ? '⏸' : '▶'}
							</span>
							<div class="audio-info">
								<span class="audio-name">問題 {idx + 1}</span>
								<span class="audio-file">{file}</span>
							</div>
							{#if isActive}
								<span class="audio-badge">再生中</span>
							{/if}
						</button>
					{/each}
				</div>

				{#if activeTranscript}
					<div class="transcript-wrap">
						<button
							class="transcript-toggle"
							onclick={() => (showTranscript = !showTranscript)}
						>
							<span>スクリプト · Transcripción</span>
							<span class="toggle-arrow">{showTranscript ? '▲' : '▼'}</span>
						</button>
						{#if showTranscript}
							<div class="transcript-body jp">{activeTranscript}</div>
						{/if}
					</div>
				{/if}
			</div>

			<StickyFooter>
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={() => goto('/jlpt')}>
					← Volver a niveles
				</button>
			</StickyFooter>

		<!-- ── RESULT ── -->
		{:else if phase === 'result'}
			<div use:fadeUp={{ delay: 0, y: 20 }} class="result-screen">

				<!-- Score hero -->
				<div class="score-hero">
					<div class="score-ring" class:pass={pct >= 70} class:fail={pct < 70}>
						<span class="score-pct-big">{pct}</span>
						<span class="score-pct-symbol">%</span>
					</div>
					<h2 class="result-headline">{pct >= 70 ? '¡Bien hecho!' : 'Sigue practicando'}</h2>
					<p class="result-sub">{level} {sectionLabel.es}</p>
				</div>

				<!-- Stats row -->
				<div class="stats-row">
					<div class="stats-card correct-card">
						<span class="stats-num">{score}</span>
						<span class="stats-label">Correctas</span>
					</div>
					<div class="stats-card wrong-card">
						<span class="stats-num">{wrong}</span>
						<span class="stats-label">Incorrectas</span>
					</div>
					{#if timeUsed > 0}
						<div class="stats-card time-card">
							<span class="stats-num">{timeUsedLabel}</span>
							<span class="stats-label">Tiempo</span>
						</div>
					{/if}
				</div>

				<!-- Review -->
				<div class="review-section">
					<h3 class="review-title">Repaso</h3>
					<div class="q-review">
						{#each allQuestions as q, idx (idx)}
							{@const ok = correctness[idx]}
							{@const userPick = selectedHistory[idx] ?? -1}
							<div class="q-row" class:q-ok={ok} class:q-ng={!ok}>
								<div class="q-row-top">
									<span class="q-dot">{ok ? '✓' : '✗'}</span>
									<span class="q-sentence jp">{q.sentence.length > 40 ? q.sentence.slice(0, 40) + '…' : q.sentence}</span>
								</div>
								{#if !ok}
									<div class="q-answers">
										<span class="q-user-ans jp">
											{userPick >= 0 ? q.choices[userPick] : '—'}
										</span>
										<span class="q-arrow">→</span>
										<div class="q-correct-wrap">
											<span class="q-correct-ans jp">{q.choices[q.answer - 1]}</span>
											{#if $showRomaji}
												<span class="q-ans-romaji">{kanaToRomaji(q.choices[q.answer - 1])}</span>
											{/if}
										</div>
									</div>
								{:else}
									<div class="q-answers q-answers-ok">
										<div class="q-correct-wrap">
											<span class="q-correct-ans jp">{q.choices[q.answer - 1]}</span>
											{#if $showRomaji}
												<span class="q-ans-romaji">{kanaToRomaji(q.choices[q.answer - 1])}</span>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>

			<StickyFooter>
				<button class="hm-btn hm-btn-secondary hm-btn-lg" style="flex:1;" onclick={() => goto('/jlpt')}>
					← JLPT
				</button>
				<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex:1;" onclick={startExam}>
					Reintentar
				</button>
			</StickyFooter>
		{/if}

	</div>
</div>

<style>
	.session-layout {
		min-height: 100vh;
		background: var(--paper);
	}
	.session-container {
		max-width: 720px;
		margin: 0 auto;
		padding: calc(16px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));
	}

	/* ── Romaji toggle ── */
	/* ── Intro ── */
	.intro-screen { text-align: center; padding: 40px 0 20px; }
	.intro-icon {
		width: 80px; height: 80px;
		background: var(--sumi);
		border-radius: 22px;
		display: flex; align-items: center; justify-content: center;
		margin: 0 auto 20px;
	}
	.intro-badge {
		display: inline-block;
		font-size: 12px; font-weight: 700;
		letter-spacing: 0.08em; text-transform: uppercase;
		color: var(--fg-tertiary);
		background: var(--ink-100);
		padding: 4px 12px; border-radius: 99px;
		margin-bottom: 10px;
	}
	.intro-title {
		font-size: 34px; font-weight: 700;
		font-family: var(--font-jp);
		letter-spacing: -0.02em; margin: 0 0 6px;
		color: var(--sumi);
	}
	.intro-sub { font-size: 15px; color: var(--fg-secondary); margin: 0 0 32px; }

	.intro-stats {
		display: inline-flex; align-items: center; gap: 0;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 0 24px;
		margin-bottom: 24px;
	}
	.stat-card {
		display: flex; flex-direction: column; align-items: center;
		padding: 16px 20px; gap: 3px;
	}
	.stat-divider {
		width: 1px; height: 36px;
		background: var(--ink-200);
	}
	.stat-val { font-size: 28px; font-weight: 700; color: var(--sumi); line-height: 1; }
	.stat-label { font-size: 11px; color: var(--fg-tertiary); font-weight: 600; letter-spacing: 0.04em; }
	.unavail { font-size: 14px; color: var(--fg-secondary); }

	/* ── Exam top bars ── */
	.exam-top-bars {
		position: fixed;
		top: 0; left: 0; right: 0;
		z-index: 100;
	}
	.progress-bar-wrap {
		height: 3px;
		background: var(--ink-100);
	}
	.progress-bar-fill {
		height: 100%;
		background: var(--sumi);
		transition: width 0.4s ease;
		opacity: 0.35;
	}
	.timer-bar-wrap {
		height: 3px;
		background: transparent;
	}
	.timer-bar-fill {
		height: 100%;
		background: var(--sumi);
		transition: width 1s linear, background 0.5s;
	}
	.timer-bar-fill.critical { background: var(--hinomaru-red); }

	/* ── Exam header ── */
	.exam-header {
		display: flex; justify-content: space-between; align-items: center;
		margin: 20px 0 16px;
	}
	.exam-header-left { display: flex; align-items: center; gap: 10px; }
	.mondai-badge {
		font-size: 12px; font-weight: 700;
		font-family: var(--font-jp);
		color: var(--fg-inverse);
		background: var(--sumi);
		padding: 3px 10px; border-radius: 99px;
	}
	.q-counter { font-size: 13px; font-weight: 600; color: var(--fg-secondary); }
	.timer-label {
		font-size: 19px; font-weight: 700;
		color: var(--sumi); font-variant-numeric: tabular-nums;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		padding: 4px 12px; border-radius: 10px;
	}
	.timer-label.critical {
		color: var(--hinomaru-red);
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	/* ── Question ── */
	.question-wrap { display: flex; flex-direction: column; gap: 12px; }
	.question-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 24px 22px;
		box-shadow: var(--shadow-sm);
	}
	.question-text {
		font-size: 19px;
		line-height: 1.75;
		color: var(--sumi);
		margin: 0;
		white-space: pre-line;
	}

	/* ── Question romaji ── */
	.question-romaji {
		font-size: 13px;
		color: var(--fg-tertiary);
		margin: 8px 0 0;
		line-height: 1.6;
		font-style: italic;
		letter-spacing: 0.02em;
	}

	/* ── Options ── */
	.options-list { display: flex; flex-direction: column; gap: 8px; }
	.option-item {
		display: flex; align-items: center; gap: 14px;
		padding: 14px 16px;
		border: 1.5px solid var(--ink-200);
		border-radius: 14px;
		background: var(--bg-surface);
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		transition: border-color 0.12s, background 0.12s;
		width: 100%;
	}
	.option-item:not(:disabled):hover {
		border-color: var(--ink-400);
		background: var(--ink-50);
	}
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
		width: 28px; height: 28px;
		border-radius: 50%;
		background: var(--ink-100);
		display: flex; align-items: center; justify-content: center;
		font-size: 13px; font-weight: 700;
		color: var(--fg-secondary);
		flex-shrink: 0;
		transition: background 0.12s, color 0.12s;
	}
	.is-selected .opt-marker { background: var(--sumi); color: var(--washi); }
	.is-correct .opt-marker { background: var(--success); color: white; }
	.is-wrong .opt-marker { background: var(--hinomaru-red); color: white; }
	.opt-content { display: flex; flex-direction: column; gap: 1px; flex: 1; }
	.opt-text { font-size: 16px; font-weight: 600; color: var(--fg-primary); line-height: 1.4; }
	.opt-romaji { font-size: 11px; color: var(--fg-tertiary); font-style: italic; letter-spacing: 0.02em; }

	/* ── Feedback ── */
	.feedback-banner {
		display: flex; align-items: center; justify-content: center; gap: 8px;
		font-size: 15px; font-weight: 700;
		padding: 14px 16px; border-radius: 14px;
	}
	.feedback-banner.correct { color: var(--success); background: var(--success-wash); }
	.feedback-banner.wrong { color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }
	.feedback-wrong-content {
		display: flex; flex-direction: column; align-items: center; gap: 4px;
	}
	.feedback-row { display: flex; align-items: center; gap: 7px; }
	.feedback-correct-ans {
		font-size: 14px; font-weight: 700;
		opacity: 0.85;
	}

	/* ── Listening ── */
	.listening-screen { padding: 24px 0; }
	.listen-header {
		display: flex; align-items: center; gap: 16px;
		margin-bottom: 24px;
	}
	.listen-header .intro-icon { margin: 0; flex-shrink: 0; }
	.listen-title { font-size: 26px; font-weight: 700; margin: 0 0 2px; }
	.listen-sub { font-size: 13px; color: var(--fg-secondary); margin: 0; }
	.audio-list { display: flex; flex-direction: column; gap: 8px; }
	.audio-item {
		display: flex; align-items: center; gap: 14px;
		padding: 16px 18px;
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		background: var(--bg-surface);
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		transition: all 0.15s;
		width: 100%;
	}
	.audio-item:hover { border-color: var(--ink-400); }
	.audio-item.playing { border-color: var(--sumi); background: var(--ink-50); }
	.audio-icon-wrap {
		width: 36px; height: 36px;
		border-radius: 50%;
		background: var(--ink-100);
		display: flex; align-items: center; justify-content: center;
		font-size: 14px; flex-shrink: 0;
		transition: background 0.15s;
	}
	.audio-icon-wrap.active { background: var(--sumi); color: var(--washi); }
	.audio-info { display: flex; flex-direction: column; flex: 1; }
	.audio-name { font-size: 15px; font-weight: 700; color: var(--sumi); font-family: var(--font-jp); }
	.audio-file { font-size: 12px; color: var(--fg-tertiary); }
	.audio-badge {
		font-size: 11px; font-weight: 700;
		color: var(--sumi); background: var(--ink-100);
		padding: 3px 8px; border-radius: 99px;
	}

	/* ── Transcript ── */
	.transcript-wrap {
		margin-top: 16px;
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		overflow: hidden;
	}
	.transcript-toggle {
		display: flex; align-items: center; justify-content: space-between;
		width: 100%; padding: 14px 18px;
		background: var(--bg-surface);
		border: none; cursor: pointer;
		font-family: inherit; font-size: 14px; font-weight: 700;
		color: var(--sumi);
		text-align: left;
	}
	.transcript-toggle:hover { background: var(--ink-50); }
	.toggle-arrow { font-size: 11px; color: var(--fg-tertiary); }
	.transcript-body {
		padding: 16px 18px;
		font-size: 14px;
		line-height: 1.9;
		color: var(--fg-primary);
		white-space: pre-wrap;
		border-top: 1px solid var(--ink-100);
		background: var(--paper);
		max-height: 400px;
		overflow-y: auto;
	}

	/* ── Result ── */
	.result-screen { padding: 20px 0; }

	.score-hero { text-align: center; padding: 24px 0 28px; }
	.score-ring {
		display: inline-flex; flex-direction: column;
		align-items: center; justify-content: center;
		width: 120px; height: 120px;
		border-radius: 50%;
		border: 5px solid var(--ink-200);
		margin: 0 auto 18px;
		background: var(--bg-surface);
	}
	.score-ring.pass { border-color: var(--success); }
	.score-ring.fail { border-color: var(--hinomaru-red); }
	.score-pct-big {
		font-size: 36px; font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1;
		color: var(--sumi);
	}
	.score-ring.pass .score-pct-big { color: var(--success); }
	.score-ring.fail .score-pct-big { color: var(--hinomaru-red); }
	.score-pct-symbol {
		font-size: 14px; font-weight: 700;
		color: var(--fg-tertiary);
		margin-top: 2px;
	}
	.result-headline { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
	.result-sub { font-size: 13px; color: var(--fg-secondary); margin: 0; }

	/* Stats row */
	.stats-row {
		display: flex; gap: 10px;
		margin-bottom: 28px;
	}
	.stats-card {
		flex: 1;
		display: flex; flex-direction: column; align-items: center;
		padding: 16px 8px;
		border-radius: 16px;
		border: 1px solid var(--ink-200);
		background: var(--bg-surface);
		gap: 4px;
	}
	.correct-card { border-color: var(--success); background: var(--success-wash); }
	.wrong-card { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }
	.stats-num {
		font-size: 24px; font-weight: 700;
		line-height: 1;
		color: var(--sumi);
		font-variant-numeric: tabular-nums;
	}
	.correct-card .stats-num { color: var(--success); }
	.wrong-card .stats-num { color: var(--hinomaru-red); }
	.stats-label { font-size: 11px; font-weight: 600; color: var(--fg-tertiary); letter-spacing: 0.03em; }

	/* Review */
	.review-section { }
	.review-title {
		font-size: 14px; font-weight: 700;
		color: var(--fg-secondary);
		letter-spacing: 0.04em; text-transform: uppercase;
		margin: 0 0 12px;
	}
	.q-review { display: flex; flex-direction: column; gap: 8px; }
	.q-row {
		display: flex; flex-direction: column; gap: 6px;
		padding: 12px 14px;
		border-radius: 12px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-100);
	}
	.q-ok { border-color: var(--success); background: var(--success-wash); }
	.q-ng { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }
	.q-row-top { display: flex; align-items: flex-start; gap: 8px; }
	.q-dot { font-size: 13px; font-weight: 700; flex-shrink: 0; padding-top: 1px; }
	.q-ok .q-dot { color: var(--success); }
	.q-ng .q-dot { color: var(--hinomaru-red); }
	.q-sentence { font-size: 13px; color: var(--sumi); line-height: 1.5; }
	.q-answers {
		display: flex; align-items: center; gap: 6px;
		margin-left: 21px;
		flex-wrap: wrap;
	}
	.q-answers-ok { }
	.q-user-ans {
		font-size: 13px; font-weight: 600;
		color: var(--hinomaru-red);
		text-decoration: line-through;
		opacity: 0.75;
	}
	.q-arrow { font-size: 12px; color: var(--fg-tertiary); }
	.q-correct-ans {
		font-size: 13px; font-weight: 700;
		color: var(--success);
	}
	.q-ok .q-correct-ans { color: var(--success); }
	.q-correct-wrap { display: flex; flex-direction: column; gap: 1px; }
	.q-ans-romaji { font-size: 11px; color: var(--fg-tertiary); font-style: italic; }

	.jp { font-family: var(--font-jp); }
</style>
