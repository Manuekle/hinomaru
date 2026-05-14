<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { showRomaji } from '$lib/stores/settings';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { addXP } from '$lib/utils/gamification';
	import { fadeUp } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, Award01Icon, BubbleChatIcon } from '@hugeicons/core-free-icons';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import { svileo } from '$lib/stores/toast';
	import { conversations, type DialogueChoice } from '$lib/data/conversations';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import {
		getSpeechStatus,
		JapaneseSpeechRecognizer,
		type SpeechStatus
	} from '$lib/speaking/speech';
	import { comparePhrase } from '$lib/speaking/compare';
	import { Mic01Icon } from '@hugeicons/core-free-icons';
	import { onDestroy } from 'svelte';
	import { beforeNavigate } from '$app/navigation';

	const supabase = createClient();

	const scenarioId = $derived($page.params.id);
	const scenario = $derived(conversations.find((c) => c.id === scenarioId));

	// ── State ─────────────────────────────────────────────────────────
	type Phase = 'npc' | 'choice' | 'feedback' | 'anticipation' | 'result';
	let phase = $state<Phase>('npc');
	let turnIndex = $state(0);
	let score = $state(0);
	let totalChoices = $state(0);
	let selectedChoice = $state<DialogueChoice | null>(null);
	let selectedIdx = $state<number | null>(null);
	let showTranslation = $state(false);
	let fireConfetti = $state(false);

	// Roleplay Mode
	let roleplayMode = $state(false);
	const recognizer: JapaneseSpeechRecognizer = new JapaneseSpeechRecognizer();
	let liveTranscript = $state('');
	let isRecording = $state(false);
	let speechError = $state<string | null>(null);
	let speechStatus = $state<SpeechStatus>({ ok: false, reason: 'no-window' });
	let speechHost = $state('');

	const currentTurn = $derived(scenario?.turns[turnIndex] ?? null);
	const progressPct = $derived(
		scenario ? Math.round((turnIndex / scenario.turns.length) * 100) : 0
	);
	const scorePct = $derived(totalChoices > 0 ? Math.round((score / totalChoices) * 100) : 0);

	const shuffledChoices = $derived.by(() => {
		if (currentTurn?.type !== 'choice') return [];
		const choices = [...currentTurn.choices].map((c, i) => ({ ...c, originalIdx: i }));
		for (let i = choices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[choices[i], choices[j]] = [choices[j], choices[i]];
		}
		return choices;
	});

	function advance() {
		if (!scenario) return;
		showTranslation = false;
		selectedChoice = null;
		selectedIdx = null;
		if (turnIndex >= scenario.turns.length - 1) {
			finishConversation();
			return;
		}
		turnIndex++;
		const next = scenario.turns[turnIndex];
		phase = next.type === 'choice' ? 'choice' : 'npc';
	}

	function pickChoice(choice: DialogueChoice, idx: number) {
		if (phase !== 'choice') return;
		selectedChoice = choice;
		selectedIdx = idx;
		totalChoices++;
		if (choice.correct) {
			score++;
			playCorrect();
		} else {
			playWrong();
		}
		phase = 'feedback';
	}

	async function finishConversation() {
		phase = 'anticipation';
		setTimeout(async () => {
			phase = 'result';
			playFinish();
			if (scorePct >= 70) {
				fireConfetti = true;
				setTimeout(() => (fireConfetti = false), 4000);
			}
			try {
				const {
					data: { user }
				} = await supabase.auth.getUser();
				if (user) {
					await supabase.from('sessions').insert({
						user_id: user.id,
						mode: 'conversation',
						correct: score,
						total: totalChoices
					});
					await updateStreak(supabase, user.id);
					await addXP(supabase, user.id, score * 5 + 10);
					await invalidateAll();
				}
			} catch {
				/* non-critical */
			}
			svileo.success({ title: t('conversation.complete', $locale) });
		}, 1800);
	}

	function restart() {
		turnIndex = 0;
		score = 0;
		totalChoices = 0;
		selectedChoice = null;
		selectedIdx = null;
		showTranslation = false;
		fireConfetti = false;
		liveTranscript = '';
		speechError = null;
		const first = scenario?.turns[0];
		phase = first?.type === 'choice' ? 'choice' : 'npc';
	}

	async function startRecording() {
		if (phase !== 'choice' || !speechOk) return;
		if (isRecording || recognizer.active) return;
		speechError = null;
		liveTranscript = '';
		isRecording = true;

		await recognizer.start(
			(r) => {
				liveTranscript = r.transcript;
			},
			(err) => {
				speechError = err;
				isRecording = false;
			},
			() => {
				isRecording = false;
				if (!liveTranscript && !speechError) {
					speechError = t('speaking.noSpeech', $locale);
					return;
				}
				if (liveTranscript && currentTurn?.type === 'choice') {
					checkSpokenAnswer(liveTranscript);
				}
			}
		);
	}

	function stopRecording() {
		recognizer.stop();
		isRecording = false;
	}

	function checkSpokenAnswer(spoken: string) {
		if (currentTurn?.type !== 'choice') return;
		let bestScore = 0;
		let bestIdx = -1;

		currentTurn.choices.forEach((choice, idx) => {
			const c = comparePhrase(choice.jp, spoken, [choice.jp]);
			if (c.overallScore > bestScore) {
				bestScore = c.overallScore;
				bestIdx = idx;
			}
		});

		// If score is decent enough (> 0.4), accept it as their choice
		if (bestScore > 0.4 && bestIdx !== -1) {
			const matchedChoice = currentTurn.choices[bestIdx];
			// Find its original index in shuffledChoices to select the right one visually
			const visualIdx = shuffledChoices.findIndex((sc) => sc.originalIdx === bestIdx);
			pickChoice(matchedChoice, visualIdx !== -1 ? visualIdx : bestIdx);
		} else {
			speechError =
				$locale === 'es'
					? 'No reconocí ninguna de las opciones. Intenta de nuevo.'
					: "Didn't recognize any of the options. Try again.";
		}
	}

	// Auto-speak NPC lines
	$effect(() => {
		if (phase === 'npc' && currentTurn?.type === 'npc') {
			setTimeout(() => speakJapanese(currentTurn.jp), 400);
		}
	});

	onMount(() => {
		if (!scenario) {
			goto('/conversation');
			return;
		}
		speechStatus = getSpeechStatus();
		speechHost = typeof location !== 'undefined' ? location.host : '';
		if (!speechStatus.ok) {
			roleplayMode = false;
		}
		const first = scenario.turns[0];
		phase = first.type === 'choice' ? 'choice' : 'npc';
	});

	beforeNavigate(() => recognizer.abort());
	onDestroy(() => recognizer.abort());

	const speechOk = $derived(speechStatus.ok);
	const speechWarn = $derived.by(() => {
		if (speechStatus.ok) return '';
		if (speechStatus.reason === 'insecure')
			return `${t('speaking.insecure', $locale)} (${speechHost})`;
		if (speechStatus.reason === 'unsupported') return t('speaking.unsupported', $locale);
		return '';
	});
</script>

<svelte:head>
	<title>
		{scenario
			? $locale === 'es'
				? scenario.title_es
				: scenario.title_en
			: $locale === 'es'
				? 'Conversaciones'
				: 'Conversations'} — Hinomaru
	</title>
</svelte:head>

{#if !scenario}
	<div class="story-viewer-layout">
		<div style="text-align:center;padding:80px 0;color:var(--fg-tertiary);">
			Escenario no encontrado.
		</div>
	</div>
{:else}
	<div class="story-viewer-layout">
		<div
			style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));width:100%;"
		>
			<!-- Header actions -->
			<div
				use:fadeUp={{ delay: 0, y: 12 }}
				style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;"
			>
				<a href="/conversation" class="back-link-beautiful">
					← {t('deck.back', $locale)}
				</a>

				{#if speechOk}
					<button
						class="roleplay-toggle"
						class:active={roleplayMode}
						onclick={() => (roleplayMode = !roleplayMode)}
						aria-label={roleplayMode
							? $locale === 'es'
								? 'Desactivar voz'
								: 'Disable voice'
							: $locale === 'es'
								? 'Activar voz'
								: 'Enable voice'}
					>
						<Icon icon={Mic01Icon} size={14} color="currentColor" />
						<span
							>{roleplayMode
								? $locale === 'es'
									? 'Voz: ON'
									: 'Voice: ON'
								: $locale === 'es'
									? 'Voz: OFF'
									: 'Voice: OFF'}</span
						>
					</button>
				{/if}
			</div>

			{#if speechWarn && roleplayMode}
				<div class="speech-warn" style="margin-bottom:16px;">{speechWarn}</div>
			{/if}

			{#if phase !== 'result'}
				<!-- Header row -->
				<div use:fadeUp={{ delay: 0.05, y: 10 }} class="scenario-header">
					<div class="scenario-meta">
						<span class="hm-pill hm-pill-red" style="font-size:10px;height:20px;"
							>{scenario.level}</span
						>
						<span class="scenario-progress-label label-meta">
							{score}/{totalChoices}
							{$locale === 'es' ? 'correctas' : 'correct'}
						</span>
					</div>

					<div class="scenario-title-row">
						<h1 class="scenario-display-title">
							{scenario.icon}
							{$locale === 'es' ? scenario.title_es : scenario.title_en}
						</h1>
					</div>

					<p class="scenario-context">{scenario.context_es}</p>

					<!-- Progress bar -->
					<div class="progress-track">
						<div class="progress-fill" style="width:{progressPct}%"></div>
					</div>
				</div>

				<!-- NPC card -->
				{#if (phase === 'npc' || phase === 'choice' || phase === 'feedback') && currentTurn}
					{#if currentTurn.type === 'npc'}
						<div use:fadeUp={{ delay: 0.1, y: 12 }} class="story-body-card">
							<div class="npc-card-header">
								<span class="npc-badge">🤖 NPC</span>
								<button
									class="story-audio-btn"
									onclick={() => speakJapanese(currentTurn.jp)}
									aria-label="Escuchar"
								>
									<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
								</button>
							</div>

							<p class="body-text-jp">
								<InteractiveText text={currentTurn.jp} />
							</p>

							{#if $showRomaji}
								<p class="body-text-romaji">{currentTurn.romaji}</p>
							{/if}

							<div class="translation-section">
								<button class="toggle-btn" onclick={() => (showTranslation = !showTranslation)}>
									{showTranslation
										? $locale === 'es'
											? 'Ocultar traducción'
											: 'Hide translation'
										: $locale === 'es'
											? 'Ver traducción'
											: 'Show translation'}
								</button>
								{#if showTranslation}
									<p class="body-text-translated" use:fadeUp={{ y: 5 }}>
										{currentTurn.translation}
									</p>
								{/if}
							</div>
						</div>
					{:else if currentTurn.type === 'choice'}
						<!-- Choice prompt card -->
						<div use:fadeUp={{ delay: 0.1, y: 12 }} class="story-body-card">
							<div class="npc-card-header">
								<span class="npc-badge">🤖 NPC</span>
								<button
									class="story-audio-btn"
									onclick={() => speakJapanese(currentTurn.prompt_jp)}
									aria-label="Escuchar"
								>
									<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
								</button>
							</div>

							<p class="body-text-jp">
								<InteractiveText text={currentTurn.prompt_jp} />
							</p>

							{#if $showRomaji}
								<p class="body-text-romaji">{currentTurn.prompt_romaji}</p>
							{/if}

							<div class="translation-section">
								<p class="body-text-translated" style="margin:0;">
									{currentTurn.prompt_translation}
								</p>
							</div>
						</div>

						<!-- Options or Recording Mode -->
						<div use:fadeUp={{ delay: 0.18, y: 10 }} style="margin-top:32px;">
							<p class="question-text">
								{$locale === 'es'
									? 'Elige la respuesta más natural:'
									: 'Choose the most natural response:'}
							</p>

							{#if roleplayMode && phase === 'choice'}
								<!-- ROLEPLAY MODE -->
									<div class="roleplay-box-premium">
										<div class="mic-container" class:is-recording={isRecording}>
											<button
												class="mic-btn-premium"
												class:is-recording={isRecording}
												onmousedown={startRecording}
												onmouseup={stopRecording}
												ontouchstart={startRecording}
												ontouchend={stopRecording}
												aria-pressed={isRecording}
												aria-label={isRecording
													? $locale === 'es'
														? 'Soltar para detener'
														: 'Release to stop'
													: $locale === 'es'
														? 'Mantener para hablar'
														: 'Hold to speak'}
											>
												<div class="mic-ring"></div>
												<div class="mic-ring mic-ring-2"></div>
												<Icon icon={Mic01Icon} size={32} color="white" />
											</button>
										</div>

										<div class="recording-status">
											{#if isRecording}
												<div class="status-indicator">
													<span class="pulse-dot"></span>
													<span class="status-text">{liveTranscript || ($locale === 'es' ? 'Escuchando...' : 'Listening...')}</span>
												</div>
											{:else}
												<p class="instruction-text">
													{$locale === 'es'
														? 'Mantén presionado para hablar'
														: 'Hold to speak your response'}
												</p>
											{/if}
										</div>

										{#if speechError}
											<p class="error-text" role="alert">{speechError}</p>
										{/if}
									</div>
							{:else}
								<!-- STANDARD MULTIPLE CHOICE -->
								<div class="options-grid">
									{#each shuffledChoices as choice, loopIdx (choice.originalIdx)}
										{@const isPicked = selectedIdx === loopIdx}
										{@const isRevealed = phase === 'feedback'}
										<button
											class="option-item"
											class:is-selected={phase === 'choice' && isPicked}
											class:is-correct={isRevealed && choice.correct && selectedChoice?.correct}
											class:is-wrong={isRevealed && isPicked && !choice.correct}
											class:is-dimmed={isRevealed && !isPicked && !choice.correct}
											onclick={() => pickChoice(choice, loopIdx)}
											disabled={phase === 'feedback'}
											style="touch-action:manipulation"
										>
											<div class="option-marker">{String.fromCharCode(65 + loopIdx)}</div>
											<div class="option-content">
												<div class="option-label jp">{choice.jp}</div>
												{#if $showRomaji}
													<div class="option-romaji">{choice.romaji}</div>
												{/if}
											</div>
										</button>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Feedback (shown after picking) -->
						{#if phase === 'feedback' && selectedChoice}
							<div
								use:fadeUp={{ delay: 0, y: 8 }}
								class="quiz-feedback"
								class:correct={selectedChoice.correct}
								class:wrong={!selectedChoice.correct}
							>
								<div class="feedback-row">
									<strong
										>{selectedChoice.correct
											? $locale === 'es'
												? '✓ ¡Correcto!'
												: '✓ Correct!'
											: $locale === 'es'
												? '✗ No del todo...'
												: '✗ Not quite...'}</strong
									>
									<span class="feedback-text">{selectedChoice.feedback_es}</span>
								</div>

								{#if currentTurn.type === 'choice' && currentTurn.next_npc && selectedChoice.correct}
									<div class="feedback-npc-response">
										<span class="label-meta" style="display:block;margin-bottom:6px;">
											{$locale === 'es' ? 'El NPC responde:' : 'NPC responds:'}
										</span>
										<p class="body-text-jp" style="font-size:18px;margin:0 0 4px;">
											{currentTurn.next_npc.jp}
										</p>
										{#if $showRomaji}
											<p
												style="font-size:12px;color:var(--hinomaru-red);font-weight:600;margin:0 0 4px;"
											>
												{currentTurn.next_npc.romaji}
											</p>
										{/if}
										<p style="font-size:13px;color:var(--fg-secondary);margin:0;">
											{currentTurn.next_npc.translation}
										</p>
									</div>
								{/if}
							</div>
						{/if}
					{/if}
				{/if}
			{:else}
				<!-- Result screen — mirrors stories result -->
				<div class="result-container" use:fadeUp={{ delay: 0, y: 20 }}>
					<div class="result-badge">
						<Icon
							icon={scorePct === 100 ? Award01Icon : BubbleChatIcon}
							size={48}
							color="var(--washi)"
							strokeWidth={1.5}
						/>
					</div>
					<h2 class="result-headline">
						{scorePct === 100
							? $locale === 'es'
								? '¡Perfecto!'
								: 'Perfect!'
							: scorePct >= 70
								? $locale === 'es'
									? '¡Muy bien!'
									: 'Great job!'
								: $locale === 'es'
									? '¡Sigue practicando!'
									: 'Keep practicing!'}
					</h2>
					<p class="result-summary">
						{$locale === 'es'
							? `Acertaste ${score} de ${totalChoices} situaciones. (${scorePct}%)`
							: `You got ${score} of ${totalChoices} correct. (${scorePct}%)`}
					</p>
				</div>
			{/if}
		</div>

		<StickyFooter>
			{#if phase === 'result'}
				<button
					class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg"
					onclick={() => goto('/conversation')}
				>
					{t('conversation.others', $locale)}
				</button>
				<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={restart}>
					{t('session.repeat', $locale)}
				</button>
			{:else}
				<button
					class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
					onclick={advance}
					disabled={phase === 'choice'}
				>
					{#if phase === 'choice'}
						{$locale === 'es' ? 'Elige una respuesta' : 'Choose a response'}
					{:else}
						{turnIndex >= (scenario?.turns.length ?? 0) - 1
							? t('session.finish', $locale)
							: t('session.continue', $locale)} →
					{/if}
				</button>
			{/if}
		</StickyFooter>
	</div>
{/if}

{#if fireConfetti}
	<Confetti fireOnMount={true} />
{/if}

{#if phase === 'anticipation'}
	<AnticipationScreen />
{/if}

<style>
	.back-link-beautiful {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		transition: color 150ms ease;
	}
	@media (hover: hover) {
		.back-link-beautiful:hover {
			color: var(--sumi);
		}
	}

	.roleplay-toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-secondary);
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		padding: 6px 12px;
		border-radius: 99px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.roleplay-toggle.active {
		color: var(--hinomaru-red);
		border-color: rgba(188, 0, 45, 0.4);
		background: var(--hinomaru-red-wash);
	}

	.roleplay-box {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 24px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.roleplay-box-premium {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 40px 0;
		gap: 32px;
	}

	.mic-container {
		position: relative;
		width: 120px;
		height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mic-btn-premium {
		width: 104px;
		height: 104px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, var(--hinomaru-red), #d4002f);
		color: white;
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10px 32px rgba(188, 0, 45, 0.32);
		transition: transform 0.18s cubic-bezier(0.34, 1.5, 0.64, 1);
		z-index: 10;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
	}

	.mic-btn-premium:active {
		transform: scale(0.94);
	}

	.mic-btn-premium.is-recording {
		background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
		transform: scale(1.04);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
	}

	.mic-ring {
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		border: 2px solid var(--hinomaru-red);
		opacity: 0;
		pointer-events: none;
	}

	.mic-ring-2 {
		inset: -16px;
	}

	.mic-btn-premium.is-recording .mic-ring {
		animation: pulse-ring 1.6s cubic-bezier(0.24, 0, 0.38, 1) infinite;
	}
	.mic-btn-premium.is-recording .mic-ring-2 {
		animation: pulse-ring 1.6s cubic-bezier(0.24, 0, 0.38, 1) infinite 0.4s;
	}

	@keyframes pulse-ring {
		0% {
			transform: scale(0.9);
			opacity: 0.7;
		}
		100% {
			transform: scale(1.5);
			opacity: 0;
		}
	}

	.recording-status {
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--ink-100);
		padding: 8px 18px;
		border-radius: 99px;
		animation: fade-in 0.3s ease-out;
	}

	.pulse-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--hinomaru-red);
		animation: pulse-dot-anim 0.8s infinite alternate;
	}

	.status-text {
		font-size: 15px;
		font-weight: 700;
		color: var(--sumi);
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.instruction-text {
		font-size: 14px;
		color: var(--fg-secondary);
		font-weight: 500;
		margin: 0;
		opacity: 0.7;
	}

	@keyframes pulse-dot-anim {
		from { opacity: 1; transform: scale(1); }
		to { opacity: 0.4; transform: scale(0.8); }
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.error-text {
		font-size: 13px;
		color: var(--hinomaru-red);
		font-weight: 600;
		text-align: center;
		margin: 0;
	}

	.speech-warn {
		width: 100%;
		padding: 10px 14px;
		border-radius: 12px;
		background: rgba(245, 158, 11, 0.12);
		border: 1px solid rgba(245, 158, 11, 0.4);
		color: var(--warning, #b45309);
		font-size: 13px;
		font-weight: 600;
		line-height: 1.4;
		text-align: center;
	}

	/* Scenario header */
	.scenario-header {
		margin-bottom: 28px;
	}

	.scenario-meta {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-bottom: 12px;
	}

	.scenario-progress-label {
		font-size: 12px;
		color: var(--fg-tertiary);
	}

	.scenario-title-row {
		margin-bottom: 8px;
	}

	.scenario-display-title {
		font-size: 32px;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--fg-primary);
		line-height: 1.1;
		margin: 0 0 8px;
	}

	.scenario-context {
		font-size: 14px;
		color: var(--fg-secondary);
		font-style: italic;
		line-height: 1.5;
		margin: 0 0 16px;
	}

	.progress-track {
		height: 3px;
		background: var(--ink-100);
		border-radius: 2px;
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: var(--hinomaru-red);
		border-radius: 2px;
		transition: width 400ms ease;
	}

	/* NPC content card — same as story-body-card */
	.story-body-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		padding: 24px;
		box-shadow: var(--shadow-sm);
		margin-bottom: 0;
	}

	.npc-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.npc-badge {
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-tertiary);
		letter-spacing: -0.04em;
	}

	.story-audio-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: none;
		background: var(--ink-100);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--sumi);
		flex-shrink: 0;
		touch-action: manipulation;
	}
	.story-audio-btn:active {
		transform: scale(0.95);
	}
	@media (hover: hover) {
		.story-audio-btn:hover {
			background: var(--ink-200);
			transform: scale(1.05);
		}
	}

	.body-text-jp {
		font-family: var(--font-jp);
		font-size: 22px;
		line-height: 1.8;
		color: var(--fg-primary);
		margin: 0 0 8px;
	}

	.body-text-romaji {
		font-size: 13px;
		color: var(--hinomaru-red);
		font-weight: 500;
		line-height: 1.6;
		margin: 0 0 16px;
		opacity: 0.9;
	}

	.translation-section {
		border-top: 1px solid var(--ink-100);
		padding-top: 14px;
		margin-top: 4px;
	}

	.toggle-btn {
		background: none;
		border: none;
		color: var(--hinomaru-red);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		padding: 0;
		margin-bottom: 8px;
		touch-action: manipulation;
	}

	.body-text-translated {
		font-size: 15px;
		line-height: 1.6;
		color: var(--fg-secondary);
		margin: 0;
	}

	.question-text {
		font-size: 16px;
		font-weight: 700;
		line-height: 1.4;
		margin: 0 0 20px;
		color: var(--fg-primary);
	}

	.options-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.option-item {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 16px;
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		background: var(--bg-surface);
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		font-family: inherit;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	@media (hover: hover) {
		.option-item:not(:disabled):hover {
			border-color: var(--sumi);
			background: var(--ink-50);
		}
	}
	.option-item:disabled {
		cursor: default;
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
	.option-item.is-dimmed {
		opacity: 0.4;
	}

	.option-marker {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--ink-100);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-secondary);
		flex-shrink: 0;
		margin-top: 2px;
	}
	.is-correct .option-marker {
		background: var(--success);
		color: white;
	}
	.is-wrong .option-marker {
		background: var(--hinomaru-red);
		color: white;
	}

	.option-content {
		flex: 1;
		min-width: 0;
	}

	.option-label {
		font-size: 16px;
		font-weight: 600;
		color: var(--fg-primary);
		line-height: 1.4;
	}

	.option-romaji {
		font-size: 11px;
		color: var(--fg-tertiary);
		margin-top: 3px;
	}

	/* Feedback — same as stories quiz-feedback + extra NPC response */
	.quiz-feedback {
		margin-top: 20px;
		font-weight: 600;
		padding: 16px 20px;
		border-radius: 16px;
	}
	.quiz-feedback.correct {
		color: var(--success);
		background: var(--success-wash);
	}
	.quiz-feedback.wrong {
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	.feedback-row {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 12px;
	}

	.feedback-text {
		font-size: 13px;
		font-weight: 400;
		color: var(--fg-secondary);
		line-height: 1.5;
	}

	.feedback-npc-response {
		border-top: 1px solid rgba(0, 0, 0, 0.08);
		padding-top: 14px;
		margin-top: 4px;
	}

	/* Result — same as stories result */
	.result-container {
		text-align: center;
		padding: 40px 0;
	}

	.result-badge {
		width: 80px;
		height: 80px;
		background: var(--sumi);
		border-radius: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 24px;
	}

	.result-headline {
		font-size: 28px;
		font-weight: 600;
		margin: 0 0 8px;
	}

	.result-summary {
		font-size: 16px;
		color: var(--fg-secondary);
		margin: 0;
	}

	@media (max-width: 480px) {
		.scenario-display-title {
			font-size: 26px;
		}
		.body-text-jp {
			font-size: 19px;
		}
	}

	.story-viewer-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--bg-page);
	}
</style>
