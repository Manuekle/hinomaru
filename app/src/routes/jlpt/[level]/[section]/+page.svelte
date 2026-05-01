<script lang="ts">
	import { goto, beforeNavigate } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { fadeUp } from '$lib/motion';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import {
		DocumentValidationIcon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		HeadphonesIcon,
		Clock01Icon,
		Target01Icon,
		CheckmarkCircle02Icon,
		ArrowLeft01Icon,
		AlertCircleIcon
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
	import { Play as PlayIcon, Pause as PauseIcon } from '@lucide/svelte';
	import {
		AudioPlayerProvider,
		AudioPlayerButton,
		AudioPlayerProgress,
		AudioPlayerTime,
		AudioPlayerDuration,
		AudioPlayerSpeed,
		getAudioPlayerContext
	} from '$lib/components/ui/audio-player';

	let { data } = $props<{ data: { level: string; section: string } }>();

	const level = $derived(data.level as JLPTLevel);
	const section = $derived(data.section as JLPTSectionType);
	const sectionLabel = $derived(SECTION_LABELS[section] ?? { es: section, jp: '' });

	// ── Test data ──────────────────────────────────────────────────────────────
	const test = $derived(section !== 'listening' ? getTest(level, section) : null);
	const audioFiles = $derived(
		section === 'listening' ? (AUDIO_FILES[level] ?? []) : []
	);

	const tracks = $derived(
		audioFiles.map((file, idx) => ({
			id: idx.toString(),
			name: `問題 ${idx + 1}`,
			src: `/jlpt/audio/${file}`,
			file
		}))
	);

	// ── Flat question list ────────────────────────────────────────────────────
	interface FlatQuestion extends Omit<JLPTQuestion, 'choices' | 'answer'> {
		choices: string[];
		answer: number;
		mondaiTitle: string;
		mondaiId: string;
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
	const totalQuestionsCount = $derived.by(() => {
		if (section === 'listening') return audioFiles.length;
		if (!test) return 0;
		return test.mondai.reduce((acc, m) => acc + m.questions.length, 0);
	});

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
		console.log('Starting exam for section:', section);
		if (section.toLowerCase() === 'listening') { 
			phase = 'listening'; 
			console.log('Phase changed to listening');
			return; 
		}

		// Prepare and Shuffle Questions & Options
		if (test) {
			const flat = test.mondai.flatMap((m: JLPTMondai) =>
				m.questions.map((q) => {
					const originalCorrectChoice = q.choices[q.answer - 1];
					const shuffledChoices = shuffleArray(q.choices);
					const newAnswer = shuffledChoices.indexOf(originalCorrectChoice) + 1;
					return { 
						...q, 
						choices: shuffledChoices,
						answer: newAnswer,
						mondaiTitle: m.title, 
						mondaiId: m.id 
					};
				})
			);
			allQuestions = shuffleArray(flat);
		}

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

	// Set initial track when entering listening phase
	$effect(() => {
		if (phase === 'listening' && tracks.length > 0) {
			currentAudioIdx = 0;
		}
	});

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
		} catch {
			// Ignore localStorage errors
		}
	}

	const isCorrect = $derived(
		checked && selected !== null && selected + 1 === currentQ?.answer
	);

	// ── Navigation Protection ─────────────────────────────────────────────────
	let showExitModal = $state(false);
	let nextRoute = $state<string | null>(null);

	beforeNavigate(({ cancel, to }) => {
		if ((phase === 'exam' || phase === 'listening') && !showExitModal) {
			cancel();
			if (to) nextRoute = to.url.pathname;
			showExitModal = true;
		}
	});

	function handleConfirmExit() {
		showExitModal = false;
		if (nextRoute) {
			phase = 'intro'; // Reset phase to prevent recursive triggers
			goto(nextRoute);
		}
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

<div class="session-layout">
	<div class="session-container">

		<!-- ── INTRO ── -->
		{#if phase === 'intro'}
			<div use:fadeUp={{ delay: 0, y: 16 }} class="intro-screen">
				<div class="intro-icon">
					{#if section === 'listening'}
						<Icon icon={HeadphonesIcon} size={44} color="var(--washi)" strokeWidth={1.5} />
					{:else}
						<Icon icon={DocumentValidationIcon} size={44} color="var(--washi)" strokeWidth={1.5} />
					{/if}
				</div>

				<div class="intro-badge">{level}</div>
				<h1 class="intro-title">{sectionLabel.jp}</h1>
				<p class="intro-sub">{sectionLabel.es}</p>

				<div class="intro-stats">
					<div class="stat-card">
						<span class="stat-val">
							{totalQuestionsCount}
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

				{#if totalQuestionsCount === 0}
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
					disabled={totalQuestionsCount === 0}
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

			<!-- Premium Exam Header -->
			<div class="exam-premium-header">
				<div class="exam-header-main">
					<div class="exam-meta-group">
						<span class="exam-label-pill">もんだい {currentQ?.mondaiId?.split('-').pop() || 1}</span>
						<div class="exam-step-indicator">
							<span class="step-curr">{currentIdx + 1}</span>
							<span class="step-divider">/</span>
							<span class="step-total">{allQuestions.length}</span>
						</div>
					</div>

					{#if timeLeft !== null}
						<div class="exam-timer-pill" class:is-critical={timeLeft < 60}>
							<Icon icon={Clock01Icon} size={16} color="currentColor" />
							<span class="timer-val">{timerLabel}</span>
						</div>
					{/if}
				</div>
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
							<div class="opt-marker">
								{#if checked && idx + 1 === currentQ.answer}
									<Icon icon={CheckmarkCircle01Icon} size={16} color="white" />
								{:else if checked && selected === idx && idx + 1 !== currentQ.answer}
									<Icon icon={Cancel01Icon} size={16} color="white" />
								{:else}
									{idx + 1}
								{/if}
							</div>
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
					<div 
						class="feedback-premium-bar" 
						class:is-correct={isCorrect}
						use:fadeUp={{ delay: 0, y: 15 }}
					>
						<div class="feedback-icon-wrap">
							<Icon icon={isCorrect ? CheckmarkCircle01Icon : Cancel01Icon} size={22} color="currentColor" />
						</div>
						<div class="feedback-text-side">
							<span class="feedback-title">{isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}</span>
							{#if !isCorrect}
								<span class="feedback-sub">La correcta era: <strong>{currentQ.choices[currentQ.answer - 1]}</strong></span>
							{/if}
						</div>
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
				<AudioPlayerProvider>
					<div class="audio-player-card">
						<div class="audio-player-layout">
							<!-- Left Side: Playlist -->
							<div class="audio-player-sidebar">
								<div class="audio-player-scroll">
									<div class="audio-player-list">
										{#each tracks as track, idx (track.id)}
											{@const player = getAudioPlayerContext()}
											{@const isActive = player.activeItem?.id === track.id}
											{@const isPlaying = isActive && player.isPlaying}

											<button
												class={cn(
													'group/track relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
													isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-secondary/50'
												)}
												onclick={() => {
													currentAudioIdx = idx;
													if (isActive) {
														player.isPlaying = !player.isPlaying;
													} else {
														player.activeItem = track;
														player.isPlaying = true;
													}
												}}
											>
												<div class="flex w-6 shrink-0 items-center justify-center">
													{#if isPlaying}
														<PauseIcon size={14} class="text-primary" />
													{:else}
														<span class="text-xs font-medium text-muted-foreground/60 group-hover/track:hidden">
															{idx + 1}
														</span>
														<PlayIcon size={14} class="hidden fill-current text-primary group-hover/track:block" />
													{/if}
												</div>
												<span class="truncate text-sm font-medium">{track.name}</span>
											</button>
										{/each}
									</div>
								</div>
							</div>

							<!-- Right Side: Player Controls -->
							<div class="audio-player-main">
								<div class="audio-player-content">
									<div class="audio-player-header">
										<div class="audio-player-info">
											<h3 class="audio-player-title">
												{tracks[currentAudioIdx]?.name ?? 'No track selected'}
											</h3>
											<p class="audio-player-subtitle">{level} {sectionLabel.es}</p>
										</div>
										<AudioPlayerSpeed variant="ghost" size="icon" className="audio-speed-top" />
									</div>

									<div class="audio-player-controls-row">
										<AudioPlayerButton
											item={tracks[currentAudioIdx]}
											variant="default"
											size="icon"
											className="h-14 w-14 shrink-0 rounded-full shadow-lg"
										/>
										<div class="audio-player-progress-area">
											<div class="audio-player-time-row">
												<AudioPlayerTime className="text-xs font-bold tabular-nums text-primary" />
												<div class="flex-1"></div>
												<AudioPlayerDuration className="text-xs font-medium tabular-nums text-muted-foreground" />
											</div>
											<AudioPlayerProgress className="flex-1" />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</AudioPlayerProvider>

				{#if activeTranscript}
					<div class="transcript-wrap">
						<button class="transcript-toggle" onclick={() => (showTranscript = !showTranscript)}>
							<span>スクリプト · Transcripción</span>
							<span class="toggle-arrow">{showTranscript ? '▲' : '▼'}</span>
						</button>
						{#if showTranscript}
							<div class="transcript-body">
								<div class="jp">{activeTranscript}</div>
								{#if $showRomaji}
									<div class="transcript-romaji">{kanaToRomaji(activeTranscript)}</div>
								{/if}
							</div>
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
				
				<!-- Premium Hero Header -->
				<div class="result-premium-hero" class:is-pass={pct >= 60}>
					<div class="hero-glow"></div>
					<div class="hero-content-wrapper">
						<div class="score-display-ring" use:fadeUp={{ delay: 0.2, y: 20 }}>
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

						<h2 class="hero-main-title" use:fadeUp={{ delay: 0.3, y: 10 }}>
							{pct >= 60 ? '¡Excelente trabajo!' : 'Sigue esforzándote'}
						</h2>
						<div class="hero-xp-badge" use:fadeUp={{ delay: 0.35, y: 10 }}>
							<Icon icon={Target01Icon} size={14} color="var(--warning)" />
							<span>+{score * 10} XP ganados</span>
						</div>
						<p class="hero-main-sub" use:fadeUp={{ delay: 0.4, y: 10 }}>
							{level} · {sectionLabel.es}
						</p>
					</div>
				</div>

				<!-- Enhanced Stats Bar -->
				<div class="stats-premium-row" use:fadeUp={{ delay: 0.45, y: 20 }}>
					<div class="stat-pill-sm correct">
						<Icon icon={CheckmarkCircle01Icon} size={14} color="var(--success)" />
						<span class="stat-v">{score}</span>
						<span class="stat-l">Correctas</span>
					</div>

					<div class="stat-pill-sm wrong">
						<Icon icon={Cancel01Icon} size={14} color="var(--hinomaru-red)" />
						<span class="stat-v">{wrong}</span>
						<span class="stat-l">Incorrectas</span>
					</div>

					<div class="stat-pill-sm duration">
						<Icon icon={Clock01Icon} size={14} color="var(--sumi)" />
						<span class="stat-v">{timeUsedLabel}</span>
						<span class="stat-l">Duración</span>
					</div>
				</div>
			</div>

			<StickyFooter>
				<button class="hm-btn hm-btn-secondary hm-btn-lg" style="flex:1;" onclick={() => goto('/jlpt')}>
					<Icon icon={ArrowLeft01Icon} size={20} color="currentColor" />
					<span>JLPT</span>
				</button>
				<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex:2;" onclick={startExam}>
					Reintentar
				</button>
			</StickyFooter>
		{/if}

	</div>
</div>

<!-- Exit Confirmation Modal -->
{#if showExitModal}
	<div class="modal-overlay" transition:fade={{ duration: 200 }}>
		<div class="modal-content" use:fadeUp={{ delay: 0, y: 20 }}>
			<div class="modal-icon">
				<Icon icon={AlertCircleIcon} size={32} color="var(--hinomaru-red)" />
			</div>
			<h3 class="modal-title">¿Abandonar el examen?</h3>
			<p class="modal-text">Perderás todo tu progreso actual en esta sección. Esta acción no se puede deshacer.</p>
			
			<div class="modal-actions">
				<button class="modal-btn cancel" onclick={() => (showExitModal = false)}>
					Continuar examen
				</button>
				<button class="modal-btn confirm" onclick={handleConfirmExit}>
					Abandonar
				</button>
			</div>
		</div>
	</div>
{/if}

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

	/* ── PREMIUM EXAM HEADER ── */
	.exam-premium-header {
		margin: 20px 0 24px;
	}
	.exam-header-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.exam-meta-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.exam-label-pill {
		font-size: 12px;
		font-weight: 800;
		font-family: var(--font-jp);
		color: var(--washi);
		background: var(--sumi);
		padding: 4px 12px;
		border-radius: 8px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}
	:global([data-theme='dark']) .exam-label-pill {
		background: var(--ink-200);
		color: var(--sumi);
	}

	.exam-step-indicator {
		display: flex;
		align-items: baseline;
		gap: 3px;
		font-family: var(--font-ui);
		font-weight: 700;
	}
	.step-curr { font-size: 18px; color: var(--sumi); }
	.step-divider { font-size: 14px; color: var(--fg-tertiary); opacity: 0.5; }
	.step-total { font-size: 14px; color: var(--fg-tertiary); }

	.exam-timer-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		padding: 6px 14px;
		border-radius: 99px;
		font-variant-numeric: tabular-nums;
		font-weight: 700;
		color: var(--sumi);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.exam-timer-pill.is-critical {
		color: var(--hinomaru-red);
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		animation: timer-pulse 1s infinite alternate;
	}
	@keyframes timer-pulse {
		from { transform: scale(1); }
		to { transform: scale(1.05); }
	}

	:global([data-theme='dark']) .exam-timer-pill {
		background: var(--ink-100);
		border-color: var(--ink-300);
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

	/* ── Feedback Premium Bar ── */
	.feedback-premium-bar {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		border-radius: 20px;
		margin-top: 12px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		border: 1px solid rgba(188, 0, 45, 0.1);
	}
	.feedback-premium-bar.is-correct {
		background: var(--success-wash);
		color: var(--success);
		border-color: rgba(46, 125, 91, 0.1);
	}
	.feedback-icon-wrap {
		width: 44px; height: 44px;
		border-radius: 14px;
		display: flex; align-items: center; justify-content: center;
		background: rgba(255, 255, 255, 0.5);
		flex-shrink: 0;
	}
	:global([data-theme='dark']) .feedback-icon-wrap {
		background: rgba(0, 0, 0, 0.2);
	}

	.feedback-text-side { display: flex; flex-direction: column; gap: 2px; }
	.feedback-title { font-size: 16px; font-weight: 800; }
	.feedback-sub { font-size: 13px; font-weight: 600; opacity: 0.8; }

	/* ── Options ── */
	.options-list { display: flex; flex-direction: column; gap: 10px; }
	.option-item {
		display: flex; align-items: center; gap: 14px;
		padding: 16px;
		border: 2px solid var(--ink-200);
		border-radius: 18px;
		background: var(--bg-surface);
		cursor: pointer;
		font-family: inherit;
		text-align: left;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		width: 100%;
	}
	.option-item:not(:disabled):hover {
		border-color: var(--ink-400);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}
	.option-item.is-selected:not(.is-correct):not(.is-wrong) {
		border-color: var(--sumi);
		background: var(--ink-50);
	}
	.option-item.is-correct {
		border-color: var(--success) !important;
		background: var(--success-wash) !important;
		border-width: 3px;
	}
	.option-item.is-wrong {
		border-color: var(--hinomaru-red) !important;
		background: var(--hinomaru-red-wash) !important;
		border-width: 3px;
	}
	.opt-marker {
		width: 32px; height: 32px;
		border-radius: 10px;
		background: var(--ink-100);
		display: flex; align-items: center; justify-content: center;
		font-size: 14px; font-weight: 800;
		color: var(--fg-secondary);
		flex-shrink: 0;
		transition: all 0.2s;
	}
	.is-selected:not(.is-correct):not(.is-wrong) .opt-marker { background: var(--sumi); color: var(--washi); }
	.is-correct .opt-marker { background: var(--success); color: white; border-radius: 50%; box-shadow: 0 0 10px rgba(46, 125, 91, 0.3); }
	.is-wrong .opt-marker { background: var(--hinomaru-red); color: white; border-radius: 50%; box-shadow: 0 0 10px rgba(188, 0, 45, 0.3); }
	
	.opt-content { display: flex; flex-direction: column; gap: 2px; flex: 1; }
	.opt-text { font-size: 17px; font-weight: 600; color: var(--fg-primary); line-height: 1.4; }
	.opt-romaji { font-size: 12px; color: var(--fg-tertiary); font-style: italic; opacity: 0.7; }

	/* ── Listening ── */
	.listening-screen { padding: 20px 0; }
	.audio-player-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}
	.audio-player-layout {
		display: flex;
		flex-direction: column;
	}
	@media (min-width: 1024px) {
		.audio-player-layout {
			flex-direction: row;
			height: 240px;
		}
	}

	.audio-player-sidebar {
		background: var(--paper);
		border-bottom: 1px solid var(--ink-100);
		width: 100%;
	}
	@media (min-width: 1024px) {
		.audio-player-sidebar {
			width: 260px;
			border-bottom: none;
			border-right: 1px solid var(--ink-100);
			height: 100%;
		}
	}

	.audio-player-scroll {
		height: 180px;
		overflow-y: auto;
	}
	@media (min-width: 1024px) {
		.audio-player-scroll {
			height: 100%;
		}
	}

	.audio-player-list {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.audio-player-main {
		flex: 1;
		display: flex;
		align-items: center;
		padding: 24px;
	}
	@media (min-width: 640px) {
		.audio-player-main {
			padding: 32px;
		}
	}

	.audio-player-content {
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}

	.audio-player-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.audio-player-info {
		flex: 1;
	}
	.audio-player-title {
		font-size: 20px;
		font-weight: 800;
		color: var(--sumi);
		margin: 0 0 2px;
		letter-spacing: -0.02em;
	}
	.audio-player-subtitle {
		font-size: 13px;
		font-weight: 500;
		color: var(--fg-tertiary);
		margin: 0;
	}
	:global(.audio-speed-top) {
		color: var(--fg-tertiary) !important;
		opacity: 0.6;
		transition: opacity 0.2s;
	}
	:global(.audio-speed-top:hover) {
		opacity: 1;
	}

	.audio-player-controls-row {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.audio-player-progress-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.audio-player-time-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
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
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.transcript-romaji {
		font-size: 13px;
		color: var(--fg-tertiary);
		font-style: italic;
		line-height: 1.6;
		border-top: 1px dashed var(--ink-200);
		padding-top: 12px;
	}

	/* ── PREMIUM RESULT SCREEN ── */
	.result-screen {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding-bottom: 40px;
	}

	.result-premium-hero {
		position: relative;
		border-radius: 32px;
		padding: 48px 24px;
		text-align: center;
		overflow: hidden;
		background: #1a1a1a;
		color: white;
		box-shadow: 0 20px 40px rgba(0,0,0,0.15);
	}

	.result-premium-hero.is-pass {
		background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
	}

	.result-premium-hero:not(.is-pass) {
		background: linear-gradient(135deg, #bc002d 0%, #8b0021 100%);
	}

	.hero-glow {
		position: absolute;
		top: -50%; left: -50%; width: 200%; height: 200%;
		background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 50%);
		animation: glow-rotate 10s linear infinite;
		pointer-events: none;
	}

	@keyframes glow-rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.hero-content-wrapper { position: relative; z-index: 2; }

	.hero-badge {
		display: inline-flex; align-items: center; gap: 8px;
		background: rgba(255,255,255,0.1);
		backdrop-filter: blur(8px);
		padding: 6px 16px; border-radius: 99px;
		font-size: 12px; font-weight: 700;
		text-transform: uppercase; letter-spacing: 0.05em;
		margin-bottom: 32px;
		border: 1px solid rgba(255,255,255,0.1);
	}

	.score-display-ring {
		position: relative;
		width: 160px; height: 160px;
		margin: 0 auto 32px;
		display: flex; align-items: center; justify-content: center;
	}

	.progress-svg {
		position: absolute;
		top: 0; left: 0; width: 100%; height: 100%;
		transform: rotate(-90deg);
	}

	.progress-track { stroke: rgba(255,255,255,0.1); }
	.progress-bar {
		stroke: white;
		transition: stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.is-pass .progress-bar { stroke: #4ade80; }

	.score-labels {
		display: flex; align-items: baseline; gap: 2px;
	}
	.score-big { font-size: 64px; font-weight: 900; line-height: 1; }
	.score-small { font-size: 20px; font-weight: 600; opacity: 0.6; }

	.hero-main-title {
		font-size: 28px; font-weight: 800; margin: 0 0 8px;
		letter-spacing: -0.02em;
	}
	.hero-xp-badge {
		display: inline-flex; align-items: center; gap: 6px;
		background: rgba(251, 191, 36, 0.15);
		color: #f59e0b;
		padding: 4px 12px; border-radius: 99px;
		font-size: 13px; font-weight: 700;
		margin-bottom: 12px;
		border: 1px solid rgba(251, 191, 36, 0.2);
	}
	.hero-main-sub {
		font-size: 14px; font-weight: 600; opacity: 0.6;
		text-transform: uppercase; letter-spacing: 0.1em;
	}

	/* Stats Row */
	.stats-premium-row {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 24px;
	}

	.stat-pill-sm {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 99px;
		padding: 8px 14px;
		display: flex; align-items: center; gap: 6px;
		transition: all 0.2s;
		box-shadow: var(--shadow-sm);
	}

	.stat-v { font-size: 14px; font-weight: 800; color: var(--sumi); }
	.stat-l { font-size: 11px; font-weight: 600; color: var(--fg-secondary); text-transform: lowercase; }

	.jp { font-family: var(--font-jp); }

	/* ── Modal ── */
	.modal-overlay {
		position: fixed;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(8px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}
	.modal-content {
		background: var(--paper);
		border-radius: 24px;
		width: 100%;
		max-width: 400px;
		padding: 32px;
		text-align: center;
		box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
		border: 1px solid var(--ink-100);
	}
	.modal-icon {
		width: 64px; height: 64px;
		background: var(--hinomaru-red-wash);
		border-radius: 20px;
		display: flex; align-items: center; justify-content: center;
		margin: 0 auto 20px;
	}
	.modal-title {
		font-size: 20px; font-weight: 800;
		color: var(--sumi); margin: 0 0 12px;
	}
	.modal-text {
		font-size: 15px; color: var(--fg-secondary);
		line-height: 1.6; margin: 0 0 32px;
	}
	.modal-actions {
		display: flex; flex-direction: column; gap: 12px;
	}
	.modal-btn {
		width: 100%; padding: 14px;
		border-radius: 12px; font-size: 14px; font-weight: 700;
		cursor: pointer; transition: all 0.2s;
		border: none;
	}
	.modal-btn.confirm {
		background: var(--hinomaru-red); color: white;
	}
	.modal-btn.confirm:hover { background: #a30027; transform: translateY(-2px); }
	.modal-btn.cancel {
		background: var(--ink-100); color: var(--sumi);
	}
	.modal-btn.cancel:hover { background: var(--ink-200); }

	.jp { font-family: var(--font-jp); }

	/* ── DARK MODE OVERRIDES ── */
	:global([data-theme='dark']) .option-item:not(.is-correct):not(.is-wrong):not(.is-selected):hover {
		background: var(--ink-100);
		border-color: var(--ink-300);
	}
	:global([data-theme='dark']) .option-item.is-selected {
		background: var(--ink-200);
		border-color: var(--sumi);
	}
	:global([data-theme='dark']) .stat-pill-sm,
	:global([data-theme='dark']) .intro-stats,
	:global([data-theme='dark']) .question-card,
	:global([data-theme='dark']) .audio-player-card,
	:global([data-theme='dark']) .review-item-premium {
		background: var(--ink-100);
		border-color: var(--ink-200);
	}
	:global([data-theme='dark']) .progress-bar-fill {
		background: var(--sumi);
		opacity: 0.6;
	}
	:global([data-theme='dark']) .timer-label {
		background: var(--ink-100);
		border-color: var(--ink-300);
	}
</style>
