<script lang="ts">
	import { goto, beforeNavigate } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { onMount } from 'svelte';
	import { createClient } from '$lib/supabase';
	import { addXP } from '$lib/utils/gamification';
	import ResponsiveModal from '$lib/components/ui/ResponsiveModal.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import { fadeUp, fadeIn } from '$lib/motion';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import Icon from '$lib/Icon.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import ScrollingWaveform from '$lib/components/ScrollingWaveform.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import {
		CheckmarkCircle01Icon,
		Cancel01Icon,
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
	import {
		AudioPlayerProvider,
		AudioPlayerButton,
		AudioPlayerProgress,
		AudioPlayerTime,
		AudioPlayerDuration,
		getAudioPlayerContext
	} from '$lib/components/ui/audio-player';
	import { ArrowReloadHorizontalIcon } from '@hugeicons/core-free-icons';

	let { data } = $props<{ data: { level: string; section: string } }>();

	const supabase = createClient();

	const level = $derived(data.level as JLPTLevel);
	const section = $derived(data.section as JLPTSectionType);
	const sectionLabel = $derived(SECTION_LABELS[section] ?? { es: section, en: section, jp: '' });

	// ── Test data ──────────────────────────────────────────────────────────────
	const test = $derived(getTest(level, section));
	const audioFiles = $derived(section === 'listening' ? (AUDIO_FILES[level] ?? []) : []);

	const tracks = $derived(
		audioFiles.map((file, idx) => ({
			id: idx.toString(),
			name: t('exam.mondai', $locale, { n: idx + 1 }),
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
		audioFile?: string;
		mode: 'choice' | 'typing';
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
	type Phase = 'intro' | 'exam' | 'result' | 'listening' | 'anticipation';
	let phase = $state<Phase>('intro');
	let currentIdx = $state(0);
	let selected = $state<number | null>(null);
	let checked = $state(false);
	let correctness = $state<boolean[]>([]);
	let selectedHistory = $state<number[]>([]);
	let typingValue = $state('');
	let advanceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Timer
	const DURATION = $derived((test?.duration ?? 25) * 60);
	let timeLeft = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let timeUsed = $state(0);

	// Audio state
	let currentAudioIdx = $state(0);

	// Confetti
	let confettiRef = $state<{ fire: () => void } | null>(null);

	// ── Derived ──────────────────────────────────────────────────────────────
	const currentQ = $derived(allQuestions[currentIdx]);
	const activeTranscript = $derived(LISTENING_TRANSCRIPTS[level]?.[currentAudioIdx] ?? '');
	const score = $derived(correctness.filter(Boolean).length);
	const wrong = $derived(correctness.filter((b) => !b).length);
	const pct = $derived(
		allQuestions.length > 0 ? Math.round((score / allQuestions.length) * 100) : 0
	);
	const timerCritical = $derived(timeLeft <= 60);
	const timerLabel = $derived(
		`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
	);
	const timeUsedLabel = $derived(
		`${Math.floor(timeUsed / 60)}:${String(timeUsed % 60).padStart(2, '0')}`
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
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		timeUsed = DURATION - timeLeft;
	}

	// ── Exam flow ─────────────────────────────────────────────────────────────
	function startExam() {
		if (section === 'listening' && !test) {
			phase = 'listening';
			return;
		}

		// Prepare and Shuffle Questions & Options
		if (test) {
			let globalQIdx = 0;
			const flat = test.mondai.flatMap((m: JLPTMondai) =>
				m.questions.map((q) => {
					const qIdx = globalQIdx++;
					const originalCorrectChoice = q.choices[q.answer - 1];
					const shuffledChoices = shuffleArray(q.choices);
					const newAnswer = shuffledChoices.indexOf(originalCorrectChoice) + 1;

					// Match audio file if this is a listening test
					const audioFile =
						section === 'listening' && test?.audioFiles ? test.audioFiles[qIdx] : undefined;

					// Randomize mode for variety (30% typing for vocab/grammar)
					const mode =
						section === 'listening' ? 'choice' : Math.random() < 0.3 ? 'typing' : 'choice';

					return {
						...q,
						choices: shuffledChoices,
						answer: newAnswer,
						mondaiTitle: m.title,
						mondaiId: m.id,
						audioFile,
						mode: mode as 'choice' | 'typing'
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
		typingValue = '';
		phase = 'exam';
		startTimer();
	}

	function checkAnswer() {
		if (checked) return;

		let isRight: boolean;
		if (currentQ.mode === 'choice') {
			if (selected === null) return;
			isRight = selected + 1 === currentQ.answer;
			selectedHistory = [...selectedHistory, selected];
		} else {
			if (!typingValue.trim()) return;
			const correctText = currentQ.choices[currentQ.answer - 1].trim();
			isRight = typingValue.trim().toLowerCase() === correctText.toLowerCase();
		}

		checked = true;
		correctness = [...correctness, isRight];
		if (isRight) playCorrect();
		else playWrong();
		advanceTimeout = setTimeout(advanceQuestion, isRight ? 1800 : 2800);
	}

	// Set initial track when entering listening phase
	$effect(() => {
		if (phase === 'listening' && tracks.length > 0) {
			currentAudioIdx = 0;
		}
	});

	function advanceQuestion() {
		if (advanceTimeout) {
			clearTimeout(advanceTimeout);
			advanceTimeout = null;
		}
		if (currentIdx + 1 >= allQuestions.length) {
			endExam();
			return;
		}
		currentIdx += 1;
		selected = null;
		typingValue = '';
		checked = false;
	}

	async function saveResult(sec: string, s: number, tot: number, p: number) {
		const date = new Date().toISOString();
		try {
			localStorage.setItem(
				`jlpt_result_${level}_${sec}`,
				JSON.stringify({ score: s, total: tot, pct: p, date })
			);
		} catch {
			/* ignore */
		}
		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (user) {
				await supabase.from('jlpt_results').upsert(
					{
						user_id: user.id,
						level,
						section: sec,
						score: s,
						total: tot,
						pct: p,
						completed_at: date
					},
					{ onConflict: 'user_id,level,section' }
				);
				if (sec !== 'listening') await addXP(supabase, user.id, p);
			}
		} catch {
			/* ignore — offline or unauthenticated */
		}
	}

	function endExam() {
		stopTimer();
		phase = 'anticipation';
		setTimeout(() => {
			phase = 'result';
			playFinish();
			saveResult(section, score, allQuestions.length, pct);
			setTimeout(() => confettiRef?.fire(), 300);
		}, 1800);
	}

	function finishListening() {
		playFinish();
		saveResult('listening', 1, 1, 100);
		goto('/jlpt');
	}

	const isCorrect = $derived(checked && correctness[currentIdx] === true);

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
			phase = 'intro'; // Reset phase to prevent recursive triggers
			goto(nextRoute);
		}
	}

	onMount(() => {
		if (section === 'listening' && !test) {
			phase = 'listening';
		} else {
			startExam();
		}
		return () => {
			if (timerInterval) clearInterval(timerInterval);
			if (advanceTimeout) clearTimeout(advanceTimeout);
		};
	});
</script>

<svelte:head>
	<title>{level} {sectionLabel[$locale]} — JLPT — Hinomaru</title>
</svelte:head>

<div class="session-layout">
	<div class="session-container">
		<!-- ── NO INTRO (Removed) ── -->

		<!-- ── EXAM ── -->
		{#if phase === 'exam' && currentQ}
			<div use:fadeIn={{ delay: 0 }}>
				<a href="/jlpt" class="back">← {t('deck.back', $locale)}</a>
			</div>
			<!-- Progress + timer bar -->

			<!-- Premium Exam Header -->
			<div class="exam-premium-header">
				<div class="exam-header-main">
					<div class="header-left">
						<span class="exam-label-pill"
							>{t('exam.mondai', $locale, { n: currentQ?.mondaiId?.split('-').pop() || 1 })}</span
						>
					</div>

					<div class="exam-step-indicator">
						<span class="step-curr">{currentIdx + 1}</span>
						<span class="step-divider">/</span>
						<span class="step-total">{allQuestions.length}</span>
					</div>

					<div class="header-right">
						{#if timeLeft !== null}
							<div class="exam-timer-pill" class:is-critical={timerCritical}>
								<Icon icon={Clock01Icon} size={16} color="currentColor" />
								<span class="timer-val">{timerLabel}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="question-wrap" use:fadeUp={{ delay: 0.04, y: 12 }}>
				{#if currentQ.audioFile}
					<AudioPlayerProvider>
						<div class="audio-question-player" use:fadeUp={{ delay: 0.05, y: 10 }}>
							<AudioPlayerButton
								item={{
									id: currentQ.id.toString(),
									name: currentQ.sentence,
									src: `/jlpt/audio/${currentQ.audioFile}`
								}}
								variant="default"
								size="icon"
								className="player-main-btn"
							/>
							<div class="player-info-side">
								<span class="player-instruction">{t('exam.listening_instruction', $locale)}</span>
								<div class="player-progress-wrap">
									<AudioPlayerProgress className="custom-player-progress" />
								</div>
							</div>
						</div>
					</AudioPlayerProvider>
				{/if}

				<div class="question-card">
					<p class="question-text jp">{currentQ.sentence}</p>
					{#if $showRomaji && currentQ.romaji}
						<p class="question-romaji">{currentQ.romaji}</p>
					{/if}
				</div>

				{#if currentQ.mode === 'choice'}
					<div class="options-list">
						{#each currentQ.choices as choice, idx (idx)}
							<button
								class="option-item"
								class:is-selected={selected === idx}
								class:is-correct={checked && idx + 1 === currentQ.answer && selected === idx}
								class:is-wrong={checked && selected === idx && idx + 1 !== currentQ.answer}
								class:is-dimmed={checked && selected !== idx}
								disabled={checked}
								onclick={() => {
									if (!checked) selected = idx;
								}}
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
									{#if $showRomaji && currentQ.choices_romaji?.[idx]}
										<span class="opt-romaji">{currentQ.choices_romaji[idx]}</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{:else}
					<div class="typing-area" use:fadeUp={{ delay: 0.1, y: 10 }}>
						<input
							type="text"
							class="hm-input typing-input jp"
							class:is-correct={checked && isCorrect}
							class:is-wrong={checked && !isCorrect}
							placeholder={t('exam.type_answer', $locale)}
							bind:value={typingValue}
							disabled={checked}
							onkeydown={(e) => {
								if (e.key === 'Enter') checkAnswer();
							}}
							autocomplete="off"
							autocorrect="off"
							autocapitalize="off"
							spellcheck="false"
						/>
						{#if checked && !isCorrect}
							<div class="typing-reveal" use:fadeIn>
								<span class="reveal-label">{t('exam.incorrect', $locale)}</span>
							</div>
						{/if}
					</div>
				{/if}

				{#if checked}
					<div
						class="feedback-premium-bar"
						class:is-correct={isCorrect}
						use:fadeUp={{ delay: 0, y: 15 }}
					>
						<div class="feedback-icon-wrap">
							<Icon
								icon={isCorrect ? CheckmarkCircle01Icon : Cancel01Icon}
								size={22}
								color="currentColor"
							/>
						</div>
						<div class="feedback-text-side">
							<span class="feedback-title"
								>{isCorrect ? t('exam.correct', $locale) : t('exam.incorrect', $locale)}</span
							>
						</div>
					</div>
				{/if}
			</div>

			<StickyFooter>
				{#if !checked}
					<button
						class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
						onclick={checkAnswer}
						disabled={currentQ.mode === 'choice' ? selected === null : !typingValue.trim()}
					>
						{t('session.check', $locale)}
					</button>
				{:else}
					<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={advanceQuestion}>
						{currentIdx + 1 < allQuestions.length
							? t('exam.next', $locale)
							: t('exam.see_results', $locale)}
					</button>
				{/if}
			</StickyFooter>

			<!-- ── LISTENING ── -->
		{:else if phase === 'listening'}
			<div class="listening-screen">
				<div use:fadeIn={{ delay: 0 }}>
					<a href="/jlpt" class="back">← {t('deck.back', $locale)}</a>
				</div>

				<AudioPlayerProvider items={tracks} bind:currentIndex={currentAudioIdx}>
					{@const player = getAudioPlayerContext()}

					<!-- Compact Playlist -->
					<div class="compact-playlist" use:fadeUp={{ delay: 0.05, y: 5 }}>
						{#each tracks as track, idx (track.id)}
							{@const isActive = currentAudioIdx === idx}
							<button
								class="playlist-pill"
								class:is-active={isActive}
								onclick={() => {
									if (currentAudioIdx === idx) {
										player.isPlaying = !player.isPlaying;
									} else {
										currentAudioIdx = idx;
										player.isPlaying = true;
									}
								}}
							>
								{#if isActive && player.isPlaying}
									<div class="p-wave-tiny">
										<span></span><span></span><span></span>
									</div>
								{/if}
								<span class="p-name-tiny">{track.name}</span>
							</button>
						{/each}
					</div>

					<!-- Compact Hero -->
					<div class="hero-compact" use:fadeUp={{ delay: 0.1, y: 8 }}>
						<div class="hero-top-meta">
							<span class="level-pill-tiny">{level}</span>
							<span class="section-label-tiny">{sectionLabel[$locale]}</span>
						</div>
						<h1 class="title-compact jp">{tracks[currentAudioIdx]?.name ?? '...'}</h1>
					</div>

					<!-- Minimal Controls & Waveform -->
					<div class="player-minimal" use:fadeUp={{ delay: 0.15, y: 8 }}>
						<div class="wave-row-minimal">
							<ScrollingWaveform
								height={32}
								barWidth={2}
								barGap={2}
								speed={4}
								fadeEdges={true}
								barColor="var(--hinomaru-red)"
								playing={player.isPlaying}
							/>
						</div>

						<div class="ctrl-row-compact">
							<div class="time-compact"><AudioPlayerTime /></div>

							<div class="actions-compact">
								<AudioPlayerButton
									item={tracks[currentAudioIdx]}
									variant="default"
									size="icon"
									className="play-btn-compact"
								/>
								<button
									class="replay-btn-compact"
									onclick={() => {
										player.currentTime = 0;
										player.isPlaying = true;
									}}
								>
									<Icon icon={ArrowReloadHorizontalIcon} size={14} />
								</button>
							</div>

							<div class="time-compact"><AudioPlayerDuration /></div>
						</div>

						<div class="progress-bar-minimal">
							<AudioPlayerProgress className="custom-player-progress" />
						</div>
					</div>

					<!-- Integrated Transcript -->
					{#if activeTranscript}
						<div class="transcript-minimal" use:fadeUp={{ delay: 0.2, y: 5 }}>
							<div class="jp text-minimal">{activeTranscript}</div>
							{#if $showRomaji && currentQ.romaji}
								<div class="romaji-minimal">{currentQ.romaji}</div>
							{/if}
						</div>
					{/if}

					<!-- Finalizar escucha -->
					<div use:fadeUp={{ delay: 0.25, y: 8 }} style="margin-top:32px;">
						<button
							class="hm-btn hm-btn-dark hm-btn-lg"
							style="width:100%;"
							onclick={finishListening}
						>
							<Icon icon={CheckmarkCircle02Icon} size={20} color="currentColor" />
							Finalizar escucha
						</button>
					</div>
				</AudioPlayerProvider>
			</div>

			<!-- ── RESULT ── -->
		{:else if phase === 'result'}
			<Confetti bind:this={confettiRef} />
			<div use:fadeUp={{ delay: 0, y: 20 }} class="result-screen">
				<!-- Premium Hero Header -->
				<div class="result-premium-hero" class:is-pass={pct >= 60}>
					<div class="hero-content-wrapper">
						<div class="score-display-ring" use:fadeUp={{ delay: 0.2, y: 20 }}>
							<svg class="progress-svg" viewBox="0 0 100 100">
								<circle
									class="progress-track"
									cx="50"
									cy="50"
									r="45"
									fill="none"
									stroke-width="4"
								/>
								<circle
									class="progress-bar"
									cx="50"
									cy="50"
									r="45"
									fill="none"
									stroke-width="6"
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
							{pct >= 60 ? t('exam.perfect', $locale) : t('exam.keep_trying', $locale)}
						</h2>
						<div class="hero-xp-badge" use:fadeUp={{ delay: 0.35, y: 10 }}>
							<Icon icon={Target01Icon} size={14} color="var(--warning)" />
							<span>{t('exam.xp_earned', $locale, { n: score * 10 })}</span>
						</div>
						<p class="hero-main-sub" use:fadeUp={{ delay: 0.4, y: 10 }}>
							{level} · {sectionLabel[$locale]}
						</p>
					</div>
				</div>

				<!-- Enhanced Stats Bar -->
				<div class="stats-premium-row" use:fadeUp={{ delay: 0.45, y: 20 }}>
					<div class="stat-pill-sm correct">
						<Icon icon={CheckmarkCircle01Icon} size={14} color="var(--success)" />
						<span class="stat-v">{score}</span>
						<span class="stat-l">{t('exam.correct_count', $locale)}</span>
					</div>

					<div class="stat-pill-sm wrong">
						<Icon icon={Cancel01Icon} size={14} color="var(--hinomaru-red)" />
						<span class="stat-v">{wrong}</span>
						<span class="stat-l">{t('exam.incorrect_count', $locale)}</span>
					</div>

					<div class="stat-pill-sm duration">
						<Icon icon={Clock01Icon} size={14} color="var(--sumi)" />
						<span class="stat-v">{timeUsedLabel}</span>
						<span class="stat-l">{t('exam.duration', $locale)}</span>
					</div>
				</div>

				<!-- Answer Review — only correct answers -->
				{#if correctness.some(Boolean)}
					<div use:fadeUp={{ delay: 0.55, y: 16 }}>
						<p class="review-section-label">Respuestas correctas</p>
						<div class="review-list">
							{#each allQuestions as q, i (i)}
								{@const ok = correctness[i]}
								{@const userIdx = selectedHistory[i]}
								{@const userText = userIdx !== undefined ? q.choices[userIdx] : null}
								{#if ok && userText}
									<div class="review-item-premium is-review-correct">
										<div class="review-num">{i + 1}</div>
										<div class="review-body">
											<p class="review-q jp">{q.sentence}</p>
											<p class="review-correct-ans">
												<span class="review-check">✓</span>
												<span class="review-correct-text jp">{userText}</span>
											</p>
										</div>
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				<!-- Result actions — inline, not sticky -->
				<div class="result-actions" use:fadeUp={{ delay: 0.6, y: 12 }}>
					<button
						class="hm-btn hm-btn-secondary hm-btn-lg"
						style="flex:1;"
						onclick={() => goto('/jlpt')}
					>
						<Icon icon={ArrowLeft01Icon} size={20} color="currentColor" />
						<span>JLPT</span>
					</button>
					<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex:2;" onclick={startExam}>
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
		<button class="modal-btn-cancel" onclick={() => (showExitModal = false)}>
			{t('common.cancel', $locale)}
		</button>
		<button class="modal-btn-confirm" onclick={handleConfirmExit}>
			{t('exam.exit_confirm', $locale)}
		</button>
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

	/* ── Romaji toggle ── */
	/* ── Intro ── */
	.intro-screen {
		text-align: center;
		padding: 40px 0 20px;
	}
	.intro-icon {
		width: 80px;
		height: 80px;
		background: var(--sumi);
		border-radius: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20px;
	}
	.intro-badge {
		display: inline-block;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
		background: var(--ink-100);
		padding: 4px 12px;
		border-radius: 99px;
		margin-bottom: 10px;
	}
	.intro-title {
		font-size: 34px;
		font-weight: 700;
		font-family: var(--font-jp);
		letter-spacing: -0.02em;
		margin: 0 0 6px;
		color: var(--sumi);
	}
	.intro-sub {
		font-size: 15px;
		color: var(--fg-secondary);
		margin: 0 0 32px;
	}

	.intro-stats {
		display: inline-flex;
		align-items: center;
		gap: 0;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 0 24px;
		margin-bottom: 24px;
	}
	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16px 20px;
		gap: 3px;
	}
	.stat-divider {
		width: 1px;
		height: 36px;
		background: var(--ink-200);
	}
	.stat-val {
		font-size: 28px;
		font-weight: 700;
		color: var(--sumi);
		line-height: 1;
	}
	.stat-label {
		font-size: 11px;
		color: var(--fg-tertiary);
		font-weight: 600;
		letter-spacing: -0.04em;
	}
	.unavail {
		font-size: 14px;
		color: var(--fg-secondary);
	}

	/* ── PREMIUM EXAM HEADER ── */
	.exam-premium-header {
		margin: 0 0 24px;
	}
	.exam-header-main {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 12px;
	}

	.header-left {
		display: flex;
		align-items: center;
	}
	.header-right {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.exam-label-pill {
		font-size: 11px;
		font-weight: 700;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: -0.04em;
	}

	/* ── AUDIO QUESTION PLAYER ── */
	.audio-question-player {
		display: flex;
		align-items: center;
		gap: 20px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 20px;
		margin-bottom: 24px;
		box-shadow: var(--shadow-sm);
	}
	@media (max-width: 480px) {
		.audio-question-player {
			gap: 12px;
			padding: 16px;
			border-radius: 20px;
		}
	}
	.player-info-side {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.player-instruction {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: -0.04em;
	}
	.player-progress-wrap {
		width: 100%;
	}
	:global(.custom-player-progress) {
		height: 6px !important;
	}

	.exam-step-indicator {
		display: flex;
		align-items: baseline;
		gap: 3px;
		font-family: var(--font-ui);
		font-weight: 700;
	}
	.step-curr {
		font-size: 18px;
		font-weight: 700;
		color: var(--sumi);
	}
	.step-divider {
		font-size: 14px;
		color: var(--fg-tertiary);
		opacity: 0.4;
	}
	.step-total {
		font-size: 14px;
		font-weight: 600;
		color: var(--fg-tertiary);
	}

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
		from {
			transform: scale(1);
		}
		to {
			transform: scale(1.05);
		}
	}

	:global([data-theme='dark']) .exam-timer-pill {
		background: var(--ink-100);
		border-color: var(--ink-300);
	}

	/* ── Question ── */
	.question-wrap {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
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
		letter-spacing: -0.04em;
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
		width: 44px;
		height: 44px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.5);
		flex-shrink: 0;
	}
	:global([data-theme='dark']) .feedback-icon-wrap {
		background: rgba(0, 0, 0, 0.2);
	}

	.feedback-text-side {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.feedback-title {
		font-size: 16px;
		font-weight: 700;
	}
	.feedback-sub {
		font-size: 13px;
		font-weight: 600;
		opacity: 0.8;
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
		width: 32px;
		height: 32px;
		border-radius: 10px;
		background: var(--ink-100);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-secondary);
		flex-shrink: 0;
		transition: all 0.2s;
	}
	.is-selected:not(.is-correct):not(.is-wrong) .opt-marker {
		background: var(--sumi);
		color: var(--washi);
	}
	.is-correct .opt-marker {
		background: var(--success);
		color: white;
		border-radius: 50%;
		box-shadow: 0 0 10px rgba(46, 125, 91, 0.3);
	}
	.is-wrong .opt-marker {
		background: var(--hinomaru-red);
		color: white;
		border-radius: 50%;
		box-shadow: 0 0 10px rgba(188, 0, 45, 0.3);
	}

	.opt-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}
	.opt-text {
		font-size: 17px;
		font-weight: 600;
		color: var(--fg-primary);
		line-height: 1.4;
	}
	.opt-romaji {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-style: italic;
		opacity: 0.7;
	}

	/* ── MINIMALIST LISTENING ── */
	.listening-screen {
		display: flex;
		flex-direction: column;
	}
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

	.compact-playlist {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 32px;
	}
	.playlist-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 14px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 999px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.playlist-pill.is-active {
		background: var(--hinomaru-red);
		border-color: var(--hinomaru-red);
	}
	.p-idx-tiny {
		font-size: 10px;
		font-weight: 700;
		color: var(--fg-tertiary);
	}
	.p-name-tiny {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-secondary);
	}
	.is-active .p-idx-tiny,
	.is-active .p-name-tiny {
		color: white;
	}

	.p-wave-tiny {
		display: flex;
		align-items: flex-end;
		gap: 1.5px;
		height: 8px;
	}
	.p-wave-tiny span {
		width: 1.5px;
		background: white;
		border-radius: 1px;
		animation: p-wave-tiny 0.6s infinite alternate;
	}
	.p-wave-tiny span:nth-child(2) {
		animation-delay: 0.2s;
		height: 60%;
	}
	.p-wave-tiny span:nth-child(1) {
		height: 40%;
	}
	.p-wave-tiny span:nth-child(3) {
		height: 80%;
	}
	@keyframes p-wave-tiny {
		from {
			height: 20%;
		}
		to {
			height: 100%;
		}
	}

	.hero-compact {
		margin-bottom: 24px;
		text-align: center;
	}
	.hero-top-meta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 8px;
	}
	.level-pill-tiny {
		font-size: 9px;
		font-weight: 700;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 1px 6px;
		border-radius: 4px;
	}
	.section-label-tiny {
		font-size: 9px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: -0.04em;
	}
	.title-compact {
		font-size: 28px;
		font-weight: 700;
		color: var(--sumi);
		margin: 0;
		letter-spacing: -0.02em;
	}

	.player-minimal {
		background: var(--bg-surface);
		border: 1px solid var(--ink-100);
		border-radius: 20px;
		padding: 24px;
		margin-bottom: 40px;
		box-shadow: var(--shadow-sm);
	}
	.wave-row-minimal {
		margin-bottom: 20px;
		opacity: 0.6;
	}
	.ctrl-row-compact {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 16px;
	}
	.time-compact {
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-tertiary);
		font-family: var(--font-mono);
		width: 40px;
		text-align: center;
	}
	.actions-compact {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	:global(.play-btn-compact) {
		width: 44px !important;
		height: 44px !important;
		border-radius: 50% !important;
		background: var(--sumi) !important;
		color: var(--washi) !important;
		border: none !important;
	}
	.replay-btn-compact {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--ink-200);
		background: none;
		color: var(--fg-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.custom-player-progress) {
		height: 8px !important;
	}
	:global(.custom-player-progress [role='slider']) {
		--primary: var(--hinomaru-red);
		--secondary: var(--ink-100);
	}
	:global(.custom-player-progress .SliderRange) {
		background-color: var(--hinomaru-red) !important;
	}
	:global(.custom-player-progress span[role='slider']) {
		display: none !important;
	}

	.transcript-minimal {
		border-top: 1px solid var(--ink-100);
		padding-top: 32px;
	}
	.minimal-label {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: -0.04em;
		margin-bottom: 16px;
	}
	.text-minimal {
		font-size: 17px;
		line-height: 2;
		color: var(--fg-primary);
		white-space: pre-wrap;
		font-weight: 500;
	}
	.romaji-minimal {
		margin-top: 16px;
		font-size: 14px;
		color: var(--fg-tertiary);
		font-style: italic;
		opacity: 0.8;
		line-height: 1.6;
	}

	/* ── Transcript PREMIUM ── */
	.transcript-section {
		margin-top: 24px;
	}
	.transcript-toggle-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 16px 20px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.2s;
		box-shadow: var(--shadow-sm);
	}
	.transcript-toggle-card:hover {
		border-color: var(--ink-300);
		transform: translateY(-1px);
	}
	.transcript-toggle-card.is-open {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
		background: var(--paper);
	}

	.toggle-left {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.toggle-icon-box {
		width: 36px;
		height: 36px;
		background: var(--hinomaru-red-wash);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.toggle-text-stack {
		display: flex;
		flex-direction: column;
		text-align: left;
	}
	.toggle-label {
		font-size: 15px;
		font-weight: 700;
		color: var(--sumi);
	}
	.toggle-sublabel {
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: -0.04em;
	}

	.toggle-arrow-premium {
		font-size: 12px;
		color: var(--fg-tertiary);
		opacity: 0.5;
	}

	.transcript-expandable-content {
		border: 1px solid var(--ink-200);
		border-top: none;
		border-bottom-left-radius: 20px;
		border-bottom-right-radius: 20px;
		background: var(--bg-surface);
		overflow: hidden;
	}
	.transcript-scroll-area {
		padding: 24px;
		max-height: 500px;
		overflow-y: auto;
	}
	.transcript-text-jp {
		font-size: 16px;
		line-height: 2;
		color: var(--fg-primary);
		white-space: pre-wrap;
	}
	.transcript-romaji-card {
		margin-top: 20px;
		padding: 16px;
		background: var(--paper);
		border-radius: 14px;
		border-left: 3px solid var(--hinomaru-red);
	}
	.romaji-label {
		font-size: 10px;
		font-weight: 700;
		color: var(--hinomaru-red);
		margin-bottom: 6px;
	}
	.romaji-content {
		font-size: 14px;
		color: var(--fg-secondary);
		font-style: italic;
		line-height: 1.6;
	}

	.typing-area {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 10px;
	}
	.typing-input {
		height: 64px !important;
		font-size: 20px !important;
		text-align: center;
		border-width: 2px !important;
	}
	.typing-input.is-correct {
		border-color: var(--success) !important;
		background: var(--success-wash) !important;
	}
	.typing-input.is-wrong {
		border-color: var(--hinomaru-red) !important;
		background: var(--hinomaru-red-wash) !important;
	}
	.typing-reveal {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px;
		background: var(--bg-surface);
		border: 1px dashed var(--ink-300);
		border-radius: 12px;
	}
	.reveal-label {
		font-size: 13px;
		color: var(--fg-secondary);
		font-weight: 600;
	}
	.reveal-val {
		font-size: 16px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}
	.is-dimmed {
		opacity: 0.4;
	}

	.footer-back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		font-weight: 700;
	}

	/* ── PREMIUM RESULT SCREEN ── */
	.result-screen {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding-bottom: 40px;
	}

	/* ── Answer Review ── */
	.review-section-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.04em;
		color: var(--fg-tertiary);
		margin: 0 0 10px;
	}
	.review-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.review-item-premium {
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 14px;
		padding: 12px 14px;
	}
	.review-item-premium.is-review-correct {
		border-color: var(--success-wash);
	}
	.review-item-premium.is-review-wrong {
		border-color: var(--hinomaru-red-wash);
	}

	.review-num {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--ink-100);
		color: var(--fg-tertiary);
		font-size: 11px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.is-review-correct .review-num {
		background: var(--success-wash);
		color: var(--success);
	}
	.is-review-wrong .review-num {
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}

	.review-body {
		flex: 1;
		min-width: 0;
	}
	.review-q {
		font-size: 13px;
		color: var(--fg-secondary);
		margin: 0 0 6px;
		line-height: 1.5;
	}
	.review-user-ans,
	.review-correct-ans {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin: 0 0 3px;
	}
	.review-x {
		font-size: 12px;
		font-weight: 700;
		color: var(--hinomaru-red);
		flex-shrink: 0;
	}
	.review-check {
		font-size: 12px;
		font-weight: 700;
		color: var(--success);
		flex-shrink: 0;
	}
	.review-wrong-text {
		font-size: 13px;
		color: var(--hinomaru-red);
		text-decoration: line-through;
	}
	.review-correct-text {
		font-size: 14px;
		font-weight: 700;
		color: var(--success);
	}

	.result-premium-hero {
		position: relative;
		border-radius: 32px;
		padding: 48px 24px;
		text-align: center;
		overflow: hidden;
		background: #1a1a1a;
		color: white;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
	}

	.result-premium-hero.is-pass {
		background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
	}

	.result-premium-hero:not(.is-pass) {
		background: linear-gradient(135deg, #bc002d 0%, #8b0021 100%);
	}

	.hero-content-wrapper {
		position: relative;
		z-index: 2;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		padding: 6px 16px;
		border-radius: 99px;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.04em;
		margin-bottom: 32px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.score-display-ring {
		position: relative;
		width: 160px;
		height: 160px;
		margin: 0 auto 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.progress-svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.progress-track {
		stroke: rgba(255, 255, 255, 0.1);
	}
	.progress-bar {
		stroke: white;
		transition: stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.is-pass .progress-bar {
		stroke: #4ade80;
	}

	.score-labels {
		display: flex;
		align-items: baseline;
		gap: 2px;
	}
	.score-big {
		font-size: 64px;
		font-weight: 700;
		line-height: 1;
	}
	.score-small {
		font-size: 20px;
		font-weight: 600;
		opacity: 0.6;
	}

	.hero-main-title {
		font-size: 28px;
		font-weight: 700;
		margin: 0 0 8px;
		letter-spacing: -0.02em;
	}
	.hero-xp-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(251, 191, 36, 0.15);
		color: #f59e0b;
		padding: 4px 12px;
		border-radius: 99px;
		font-size: 13px;
		font-weight: 700;
		margin-bottom: 12px;
		border: 1px solid rgba(251, 191, 36, 0.2);
	}
	.hero-main-sub {
		font-size: 14px;
		font-weight: 600;
		opacity: 0.6;
		text-transform: uppercase;
		letter-spacing: -0.04em;
	}

	/* Result actions */
	.result-actions {
		display: flex;
		gap: 12px;
		margin-top: 8px;
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
		display: flex;
		align-items: center;
		gap: 6px;
		transition: all 0.2s;
		box-shadow: var(--shadow-sm);
	}

	.stat-v {
		font-size: 14px;
		font-weight: 700;
		color: var(--sumi);
	}
	.stat-l {
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-secondary);
		text-transform: lowercase;
	}

	.jp {
		font-family: var(--font-jp);
	}

	/* Modal handled by ResponsiveModal */

	.jp {
		font-family: var(--font-jp);
	}

	/* ── DARK MODE OVERRIDES ── */
	:global([data-theme='dark'])
		.option-item:not(.is-correct):not(.is-wrong):not(.is-selected):hover {
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

	:global(.player-main-btn) {
		width: 64px !important;
		height: 64px !important;
		border-radius: 50% !important;
		background: var(--sumi) !important;
		color: var(--washi) !important;
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global([data-theme='dark'] .player-main-btn) {
		background: var(--washi) !important;
		color: var(--sumi) !important;
	}

	:global(.audio-player-progress-area .bg-secondary) {
		background: var(--ink-200) !important;
	}
	:global(.audio-player-progress-area .bg-primary) {
		background: var(--hinomaru-red) !important;
	}
	:global(.audio-player-progress-area [role='slider'] > span:last-child) {
		background: var(--hinomaru-red) !important;
	}
</style>
