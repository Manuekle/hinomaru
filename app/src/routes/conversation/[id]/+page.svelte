<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { fadeUp, popIn } from '$lib/motion';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, CheckmarkCircle01Icon, Alert01Icon } from '@hugeicons/core-free-icons';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import { svileo } from 'svileo';
	import { conversations, type DialogueChoice } from '$lib/data/conversations';

	const supabase = createClient();

	// ── Load scenario ────────────────────────────────────────────────
	const scenarioId = $derived($page.params.id);
	const scenario = $derived(conversations.find((c) => c.id === scenarioId));

	// ── State machine ────────────────────────────────────────────────
	type Phase = 'npc-speaking' | 'awaiting-choice' | 'showing-feedback' | 'finished';
	let phase = $state<Phase>('npc-speaking');
	let turnIndex = $state(0);
	let score = $state(0);
	let totalChoices = $state(0);
	let selectedChoice = $state<DialogueChoice | null>(null);
	let showTranslation = $state<Set<number>>(new Set());
	let revealedChoiceIndex = $state<number | null>(null);
	let fireConfetti = $state(false);

	// Derived current turn
	const currentTurn = $derived(scenario?.turns[turnIndex] ?? null);
	const isLastTurn = $derived(!scenario || turnIndex >= scenario.turns.length - 1);

	// ── Advance state ────────────────────────────────────────────────
	function advance() {
		if (!scenario) return;
		if (turnIndex >= scenario.turns.length - 1) {
			finish();
			return;
		}
		turnIndex++;
		revealedChoiceIndex = null;
		selectedChoice = null;
		const nextTurn = scenario.turns[turnIndex];
		phase = nextTurn.type === 'choice' ? 'awaiting-choice' : 'npc-speaking';
	}

	function pickChoice(choice: DialogueChoice, idx: number) {
		if (phase !== 'awaiting-choice') return;
		selectedChoice = choice;
		revealedChoiceIndex = idx;
		totalChoices++;
		if (choice.correct) score++;
		phase = 'showing-feedback';
	}

	async function finish() {
		phase = 'finished';
		const pct = totalChoices > 0 ? Math.round((score / totalChoices) * 100) : 0;
		if (pct >= 70) {
			fireConfetti = true;
			setTimeout(() => (fireConfetti = false), 4000);
		}

		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await updateStreak(supabase, user.id);
			}
		} catch {
			// Non-critical — don't block UI
		}

		svileo.success({ title: $locale === 'es' ? '¡Conversación completada!' : 'Conversation complete!' });
	}

	function toggleTranslation(idx: number) {
		const next = new Set(showTranslation);
		if (next.has(idx)) next.delete(idx);
		else next.add(idx);
		showTranslation = next;
	}

	// ── TTS on NPC turn mount ────────────────────────────────────────
	$effect(() => {
		if (phase === 'npc-speaking' && currentTurn?.type === 'npc') {
			setTimeout(() => speakJapanese(currentTurn.jp), 300);
		}
	});

	// Initialize
	onMount(() => {
		if (!scenario) {
			goto('/conversation');
			return;
		}
		const first = scenario.turns[0];
		phase = first.type === 'choice' ? 'awaiting-choice' : 'npc-speaking';
	});

	// Score display helpers
	const pct = $derived(totalChoices > 0 ? Math.round((score / totalChoices) * 100) : 0);
	const progressPct = $derived(
		scenario ? Math.round((turnIndex / scenario.turns.length) * 100) : 0
	);
</script>

<svelte:head>
	<title>
		{scenario ? ($locale === 'es' ? scenario.title_es : scenario.title_en) : 'Conversatorio'} — Hinomaru
	</title>
</svelte:head>

{#if !scenario}
	<div style="display:flex;align-items:center;justify-content:center;min-height:100dvh;">
		<p style="color:var(--fg-secondary);">Escenario no encontrado.</p>
	</div>
{:else}
	<div class="conv-wrap">
		<!-- Header -->
		<header class="conv-header">
			<button onclick={() => goto('/conversation')} class="close-btn" aria-label="Volver">
				✕
			</button>
			<div class="header-title">
				{$locale === 'es' ? scenario.title_es : scenario.title_en}
			</div>
			<div class="header-score">{score}/{totalChoices}</div>
		</header>

		<!-- Progress bar -->
		<div class="progress-track">
			<div class="progress-fill" style="width:{progressPct}%"></div>
		</div>

		<!-- Context intro (only shown before first turn) -->
		{#if turnIndex === 0 && phase !== 'finished'}
			<div use:fadeUp={{ delay: 0.1, y: 8 }} class="context-banner">
				<span class="context-icon">{scenario.icon}</span>
				<p class="context-text">
					{$locale === 'es' ? scenario.context_es : scenario.context_es}
				</p>
			</div>
		{/if}

		<!-- Main content area -->
		<div class="conv-content">
			{#if phase !== 'finished'}
				<!-- NPC turn -->
				{#if phase === 'npc-speaking' && currentTurn?.type === 'npc'}
					{@const turn = currentTurn}
					{#key turnIndex}
						<div in:fly={{ y: 16, duration: 300, easing: cubicOut }} class="npc-bubble-wrap">
							<div class="npc-avatar">🤖</div>
							<div class="npc-bubble">
								<div class="bubble-jp jp">{turn.jp}</div>
								{#if $showRomaji}
									<div class="bubble-romaji">{turn.romaji}</div>
								{/if}
								{#if showTranslation.has(turnIndex)}
									<div class="bubble-translation">{turn.translation}</div>
								{/if}
								<div class="bubble-actions">
									<button
										class="bubble-action-btn"
										onclick={() => speakJapanese(turn.jp)}
										aria-label="Escuchar"
									>
										<Icon icon={VolumeHighIcon} size={16} color="currentColor" strokeWidth={1.5} />
									</button>
									<button
										class="bubble-action-btn"
										onclick={() => toggleTranslation(turnIndex)}
									>
										{showTranslation.has(turnIndex) ? '言' : '訳'}
									</button>
								</div>
							</div>
						</div>
					{/key}

					<StickyFooter>
						<button class="hm-btn hm-btn-dark hm-btn-full" onclick={advance}>
							{isLastTurn
								? ($locale === 'es' ? 'Terminar' : 'Finish')
								: ($locale === 'es' ? 'Continuar →' : 'Continue →')}
						</button>
					</StickyFooter>

				<!-- Choice turn -->
				{:else if (phase === 'awaiting-choice' || phase === 'showing-feedback') && currentTurn?.type === 'choice'}
					{@const turn = currentTurn}
					{#key turnIndex}
						<div in:fly={{ y: 16, duration: 300, easing: cubicOut }} class="choice-wrap">
							<!-- NPC prompt -->
							<div class="npc-bubble-wrap">
								<div class="npc-avatar">🤖</div>
								<div class="npc-bubble">
									<div class="bubble-jp jp">{turn.prompt_jp}</div>
									{#if $showRomaji}
										<div class="bubble-romaji">{turn.prompt_romaji}</div>
									{/if}
									<div class="bubble-translation choice-prompt-translation">
										{turn.prompt_translation}
									</div>
									<button
										class="bubble-action-btn"
										onclick={() => speakJapanese(turn.prompt_jp)}
										aria-label="Escuchar"
									>
										<Icon icon={VolumeHighIcon} size={16} color="currentColor" strokeWidth={1.5} />
									</button>
								</div>
							</div>

							<!-- Choices -->
							<div class="choices-label label-meta">
								{$locale === 'es' ? 'Elige tu respuesta:' : 'Choose your response:'}
							</div>
							<div class="choices-list">
								{#each turn.choices as choice, idx (idx)}
									{@const isPicked = revealedChoiceIndex === idx}
									{@const isRevealed = phase === 'showing-feedback'}
									<button
										class="choice-btn"
										class:correct={isRevealed && choice.correct}
										class:wrong={isRevealed && isPicked && !choice.correct}
										class:dimmed={isRevealed && !isPicked && !choice.correct}
										onclick={() => pickChoice(choice, idx)}
										disabled={phase === 'showing-feedback'}
									>
										<div class="choice-jp jp">{choice.jp}</div>
										{#if $showRomaji}
											<div class="choice-romaji">{choice.romaji}</div>
										{/if}
										{#if isRevealed && choice.correct}
											<div class="choice-status-icon correct-icon">
												<Icon icon={CheckmarkCircle01Icon} size={18} color="var(--success)" strokeWidth={1.5} />
											</div>
										{:else if isRevealed && isPicked && !choice.correct}
											<div class="choice-status-icon wrong-icon">
												<Icon icon={Alert01Icon} size={18} color="var(--hinomaru-red)" strokeWidth={1.5} />
											</div>
										{/if}
									</button>
								{/each}
							</div>

							<!-- Feedback panel -->
							{#if phase === 'showing-feedback' && selectedChoice}
								<div
									use:popIn={{ delay: 0.05 }}
									class="feedback-panel"
									class:feedback-correct={selectedChoice.correct}
									class:feedback-wrong={!selectedChoice.correct}
								>
									<div class="feedback-header">
										{#if selectedChoice.correct}
											<Icon icon={CheckmarkCircle01Icon} size={20} color="var(--success)" strokeWidth={1.5} />
											<span style="color:var(--success);font-weight:700;">
												{$locale === 'es' ? '¡Correcto!' : 'Correct!'}
											</span>
										{:else}
											<Icon icon={Alert01Icon} size={20} color="var(--hinomaru-red)" strokeWidth={1.5} />
											<span style="color:var(--hinomaru-red);font-weight:700;">
												{$locale === 'es' ? 'Casi...' : 'Not quite...'}
											</span>
										{/if}
									</div>
									<p class="feedback-text">{selectedChoice.feedback_es}</p>

									{#if currentTurn.type === 'choice' && currentTurn.next_npc}
										<div class="next-npc-preview">
											<span class="next-npc-label label-meta">
												{$locale === 'es' ? 'Respuesta:' : 'Response:'}
											</span>
											<div class="jp next-npc-jp">{currentTurn.next_npc.jp}</div>
											{#if $showRomaji}
												<div class="next-npc-romaji">{currentTurn.next_npc.romaji}</div>
											{/if}
											<div class="next-npc-translation">{currentTurn.next_npc.translation}</div>
										</div>
									{/if}
								</div>

								<StickyFooter>
									<button class="hm-btn hm-btn-dark hm-btn-full" onclick={advance}>
										{isLastTurn
											? ($locale === 'es' ? 'Terminar' : 'Finish')
											: ($locale === 'es' ? 'Continuar →' : 'Continue →')}
									</button>
								</StickyFooter>
							{/if}
						</div>
					{/key}
				{/if}
			{:else}
				<!-- Finished screen -->
				<div use:popIn={{ delay: 0.1 }} class="finish-wrap">
					<div class="finish-icon">{scenario.icon}</div>
					<h2 class="finish-title">
						{$locale === 'es' ? '¡Conversación completada!' : 'Conversation complete!'}
					</h2>
					<div class="finish-score">
						{score}/{totalChoices}
					</div>
					<p class="finish-pct" style="color:{pct >= 70 ? 'var(--success)' : 'var(--hinomaru-red)'};">
						{pct}%
						{#if pct === 100}
							{$locale === 'es' ? '¡Perfecto!' : 'Perfect!'}
						{:else if pct >= 70}
							{$locale === 'es' ? '¡Muy bien!' : 'Great job!'}
						{:else}
							{$locale === 'es' ? '¡Sigue practicando!' : 'Keep practicing!'}
						{/if}
					</p>

					<div class="finish-stats">
						<div class="stat-row">
							<span class="stat-label">{$locale === 'es' ? 'Escenario' : 'Scenario'}</span>
							<span class="stat-value">{$locale === 'es' ? scenario.title_es : scenario.title_en}</span>
						</div>
						<div class="stat-row">
							<span class="stat-label">{$locale === 'es' ? 'Nivel' : 'Level'}</span>
							<span class="stat-value">{scenario.level}</span>
						</div>
						<div class="stat-row">
							<span class="stat-label">{$locale === 'es' ? 'Decisiones correctas' : 'Correct choices'}</span>
							<span class="stat-value" style="color:{pct >= 70 ? 'var(--success)' : 'var(--hinomaru-red)'};">
								{score}/{totalChoices}
							</span>
						</div>
					</div>

					<StickyFooter>
						<a href="/conversation" class="hm-btn hm-btn-ghost hm-btn-full" style="text-decoration:none;flex:1;">
							← {$locale === 'es' ? 'Otros escenarios' : 'Other scenarios'}
						</a>
						<button
							class="hm-btn hm-btn-primary hm-btn-full"
							style="flex:1;"
							onclick={() => {
								turnIndex = 0;
								score = 0;
								totalChoices = 0;
								selectedChoice = null;
								revealedChoiceIndex = null;
								showTranslation = new Set();
								fireConfetti = false;
								const first = scenario!.turns[0];
								phase = first.type === 'choice' ? 'awaiting-choice' : 'npc-speaking';
							}}
						>
							↺ {$locale === 'es' ? 'Repetir' : 'Repeat'}
						</button>
					</StickyFooter>
				</div>
			{/if}
		</div>
	</div>

	{#if fireConfetti}
		<Confetti fireOnMount={true} />
	{/if}
{/if}

<style>
	.conv-wrap {
		min-height: 100dvh;
		background: var(--paper);
		display: flex;
		flex-direction: column;
	}

	/* Header */
	.conv-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: calc(14px + env(safe-area-inset-top)) 20px 14px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--ink-100);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.close-btn {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--ink-100);
		border: none;
		cursor: pointer;
		font-size: 14px;
		color: var(--fg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: background 150ms ease;
		touch-action: manipulation;
	}
	.close-btn:hover { background: var(--ink-200); }

	.header-title {
		flex: 1;
		font-size: 15px;
		font-weight: 700;
		color: var(--fg-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-score {
		font-size: 14px;
		font-weight: 700;
		color: var(--hinomaru-red);
		flex-shrink: 0;
	}

	/* Progress */
	.progress-track {
		height: 3px;
		background: var(--ink-100);
	}
	.progress-fill {
		height: 100%;
		background: var(--hinomaru-red);
		transition: width 400ms ease;
	}

	/* Context */
	.context-banner {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		background: var(--ink-50);
		border-bottom: 1px solid var(--ink-100);
		padding: 16px 20px;
	}
	.context-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
	.context-text {
		font-size: 14px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin: 0;
		font-style: italic;
	}

	/* Content area */
	.conv-content {
		flex: 1;
		padding: 24px 20px 160px;
		max-width: 600px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}

	/* NPC bubble */
	.npc-bubble-wrap {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 24px;
	}

	.npc-avatar {
		width: 40px;
		height: 40px;
		background: var(--sumi);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		flex-shrink: 0;
	}

	.npc-bubble {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 0 20px 20px 20px;
		padding: 16px 18px;
		max-width: calc(100% - 52px);
		box-shadow: var(--shadow-sm);
	}

	.bubble-jp {
		font-size: 22px;
		line-height: 1.4;
		color: var(--sumi);
		margin-bottom: 4px;
	}

	.bubble-romaji {
		font-size: 12px;
		color: var(--hinomaru-red);
		font-weight: 600;
		margin-bottom: 4px;
		opacity: 0.8;
	}

	.bubble-translation {
		font-size: 13px;
		color: var(--fg-secondary);
		line-height: 1.4;
		margin-top: 6px;
		padding-top: 8px;
		border-top: 1px solid var(--ink-100);
	}

	.bubble-actions {
		display: flex;
		gap: 6px;
		margin-top: 10px;
	}

	.bubble-action-btn {
		height: 28px;
		padding: 0 10px;
		background: var(--ink-100);
		border: none;
		border-radius: 8px;
		font-size: 12px;
		color: var(--fg-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
		transition: background 150ms ease;
		font-family: var(--font-jp);
		touch-action: manipulation;
	}
	.bubble-action-btn:hover { background: var(--ink-200); }

	/* Choices */
	.choice-wrap { display: flex; flex-direction: column; gap: 0; }

	.choices-label { margin: 20px 0 10px; }

	.choices-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.choice-btn {
		width: 100%;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		padding: 14px 16px;
		text-align: left;
		cursor: pointer;
		transition: all 150ms ease;
		position: relative;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.choice-btn:not(:disabled):hover {
		border-color: var(--sumi);
		background: var(--ink-50);
		transform: translateX(3px);
	}

	.choice-btn:not(:disabled):active { transform: scale(0.98); }

	.choice-btn.correct {
		border-color: var(--success);
		background: var(--success-wash);
	}

	.choice-btn.wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	.choice-btn.dimmed { opacity: 0.4; }

	.choice-jp {
		font-size: 16px;
		color: var(--sumi);
		line-height: 1.4;
	}

	.choice-romaji {
		font-size: 11px;
		color: var(--fg-tertiary);
		margin-top: 3px;
	}

	.choice-status-icon {
		position: absolute;
		top: 50%;
		right: 14px;
		transform: translateY(-50%);
	}

	/* Feedback */
	.feedback-panel {
		margin-top: 16px;
		border-radius: 20px;
		padding: 16px 18px;
	}

	.feedback-correct {
		background: var(--success-wash);
		border: 1px solid rgba(0, 128, 0, 0.15);
	}

	.feedback-wrong {
		background: var(--hinomaru-red-wash);
		border: 1px solid rgba(188, 0, 45, 0.15);
	}

	.feedback-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.feedback-text {
		font-size: 14px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin: 0 0 12px;
	}

	.next-npc-preview {
		padding-top: 12px;
		border-top: 1px solid rgba(0, 0, 0, 0.08);
	}

	.next-npc-label { display: block; margin-bottom: 6px; }

	.next-npc-jp {
		font-size: 18px;
		color: var(--sumi);
		margin-bottom: 3px;
	}

	.next-npc-romaji {
		font-size: 11px;
		color: var(--hinomaru-red);
		margin-bottom: 3px;
		font-weight: 600;
		opacity: 0.8;
	}

	.next-npc-translation {
		font-size: 13px;
		color: var(--fg-secondary);
	}

	.choice-prompt-translation {
		font-size: 12px;
		color: var(--fg-secondary);
		margin-top: 4px;
		padding-top: 6px;
		border-top: 1px solid var(--ink-100);
	}

	/* Finish */
	.finish-wrap {
		max-width: 420px;
		margin: 0 auto;
		text-align: center;
		padding-top: 20px;
	}

	.finish-icon { font-size: 64px; margin-bottom: 16px; line-height: 1; }

	.finish-title {
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin: 0 0 16px;
	}

	.finish-score {
		font-size: 56px;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
		margin-bottom: 8px;
	}

	.finish-pct {
		font-size: 18px;
		font-weight: 600;
		margin: 0 0 32px;
	}

	.finish-stats {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		overflow: hidden;
		margin-bottom: 24px;
		text-align: left;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 14px 18px;
		border-bottom: 1px solid var(--ink-100);
	}
	.stat-row:last-child { border-bottom: none; }

	.stat-label { font-size: 14px; color: var(--fg-secondary); }
	.stat-value { font-size: 14px; font-weight: 600; color: var(--fg-primary); }
</style>
