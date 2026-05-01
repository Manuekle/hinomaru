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

	const supabase = createClient();

	const scenarioId = $derived($page.params.id);
	const scenario = $derived(conversations.find((c) => c.id === scenarioId));

	// ── State ─────────────────────────────────────────────────────────
	type Phase = 'npc' | 'choice' | 'feedback' | 'result';
	let phase = $state<Phase>('npc');
	let turnIndex = $state(0);
	let score = $state(0);
	let totalChoices = $state(0);
	let selectedChoice = $state<DialogueChoice | null>(null);
	let selectedIdx = $state<number | null>(null);
	let showTranslation = $state(false);
	let fireConfetti = $state(false);

	const currentTurn = $derived(scenario?.turns[turnIndex] ?? null);
	const progressPct = $derived(scenario ? Math.round((turnIndex / scenario.turns.length) * 100) : 0);
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
		phase = 'result';
		playFinish();
		if (scorePct >= 70) {
			fireConfetti = true;
			setTimeout(() => (fireConfetti = false), 4000);
		}
		try {
			const { data: { user } } = await supabase.auth.getUser();
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
		} catch { /* non-critical */ }
		svileo.success({ title: t('conversation.complete', $locale) });
	}

	function restart() {
		turnIndex = 0;
		score = 0;
		totalChoices = 0;
		selectedChoice = null;
		selectedIdx = null;
		showTranslation = false;
		fireConfetti = false;
		const first = scenario?.turns[0];
		phase = first?.type === 'choice' ? 'choice' : 'npc';
	}

	// Auto-speak NPC lines
	$effect(() => {
		if (phase === 'npc' && currentTurn?.type === 'npc') {
			setTimeout(() => speakJapanese(currentTurn.jp), 400);
		}
	});

	onMount(() => {
		if (!scenario) { goto('/conversation'); return; }
		const first = scenario.turns[0];
		phase = first.type === 'choice' ? 'choice' : 'npc';
	});
</script>

<svelte:head>
	<title>
		{scenario ? ($locale === 'es' ? scenario.title_es : scenario.title_en) : 'Conversatorio'} — Hinomaru
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
			<!-- Back link -->
			<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:20px;">
				<a href="/conversation" class="back-link-beautiful">
					← {$locale === 'es' ? 'Conversatorio' : 'Conversations'}
				</a>
			</div>

			{#if phase !== 'result'}
				<!-- Header row -->
				<div use:fadeUp={{ delay: 0.05, y: 10 }} class="scenario-header">
					<div class="scenario-meta">
						<span class="hm-pill hm-pill-red" style="font-size:10px;height:20px;">{scenario.level}</span>
						<span class="scenario-progress-label label-meta">
							{score}/{totalChoices} {$locale === 'es' ? 'correctas' : 'correct'}
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
										? ($locale === 'es' ? 'Ocultar traducción' : 'Hide translation')
										: ($locale === 'es' ? 'Ver traducción' : 'Show translation')}
								</button>
								{#if showTranslation}
									<p class="body-text-translated" use:fadeUp={{ y: 5 }}>{currentTurn.translation}</p>
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
								<p class="body-text-translated" style="margin:0;">{currentTurn.prompt_translation}</p>
							</div>
						</div>

						<!-- Options (same as story quiz) -->
						<div use:fadeUp={{ delay: 0.18, y: 10 }} style="margin-top:32px;">
							<p class="question-text">
								{$locale === 'es' ? 'Elige la respuesta más natural:' : 'Choose the most natural response:'}
							</p>

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
									<strong>{selectedChoice.correct
										? ($locale === 'es' ? '✓ ¡Correcto!' : '✓ Correct!')
										: ($locale === 'es' ? '✗ No del todo...' : '✗ Not quite...')}</strong>
									<span class="feedback-text">{selectedChoice.feedback_es}</span>
								</div>

								{#if currentTurn.type === 'choice' && currentTurn.next_npc && selectedChoice.correct}
									<div class="feedback-npc-response">
										<span class="label-meta" style="display:block;margin-bottom:6px;">
											{$locale === 'es' ? 'El NPC responde:' : 'NPC responds:'}
										</span>
										<p class="body-text-jp" style="font-size:18px;margin:0 0 4px;">{currentTurn.next_npc.jp}</p>
										{#if $showRomaji}
											<p style="font-size:12px;color:var(--hinomaru-red);font-weight:600;margin:0 0 4px;">{currentTurn.next_npc.romaji}</p>
										{/if}
										<p style="font-size:13px;color:var(--fg-secondary);margin:0;">{currentTurn.next_npc.translation}</p>
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
							? ($locale === 'es' ? '¡Perfecto!' : 'Perfect!')
							: scorePct >= 70
							? ($locale === 'es' ? '¡Muy bien!' : 'Great job!')
							: ($locale === 'es' ? '¡Sigue practicando!' : 'Keep practicing!')}
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
					class="hm-btn hm-btn-secondary hm-btn-lg"
					style="flex:1;"
					onclick={() => goto('/conversation')}
				>
					{$locale === 'es' ? 'Otros escenarios' : 'Other scenarios'}
				</button>
				<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex:1;" onclick={restart}>
					{$locale === 'es' ? 'Repetir' : 'Repeat'}
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
							? ($locale === 'es' ? 'Terminar' : 'Finish')
							: ($locale === 'es' ? 'Continuar' : 'Continue')} →
					{/if}
				</button>
			{/if}
		</StickyFooter>
	</div>
{/if}

{#if fireConfetti}
	<Confetti fireOnMount={true} />
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
	@media (hover: hover) { .back-link-beautiful:hover { color: var(--sumi); } }

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
		letter-spacing: 0.04em;
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
	.story-audio-btn:active { transform: scale(0.95); }
	@media (hover: hover) { .story-audio-btn:hover { background: var(--ink-200); transform: scale(1.05); } }

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
	.option-item.is-dimmed { opacity: 0.4; }

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
	.is-correct .option-marker { background: var(--success); color: white; }
	.is-wrong .option-marker { background: var(--hinomaru-red); color: white; }

	.option-content { flex: 1; min-width: 0; }

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
		border-top: 1px solid rgba(0,0,0,0.08);
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
		.scenario-display-title { font-size: 26px; }
		.body-text-jp { font-size: 19px; }
	}

	.story-viewer-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--bg-page);
	}
</style>
