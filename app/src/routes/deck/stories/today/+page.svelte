<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { speakJapanese } from '$lib/utils/tts';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	// Supabase client comes from the layout
	const supabase = $derived($page.data.supabase);

	// Story data
	const story = $derived(data.story);
	const vocab: any[] = $derived(story?.vocab ?? []);
	const quiz: any[] = $derived(story?.quiz ?? []);

	// UI state
	let showTranslation = $state(false);
	let phase = $state<'read' | 'quiz' | 'result'>('read');
	let currentQ = $state(0);
	let answers = $state<number[]>([]);
	let selected = $state<number | null>(null);
	let checked = $state(false);

	// Score
	const score = $derived(
		answers.filter((ans, i) => ans === quiz[i]?.a).length
	);

	// Build annotated body: replace vocab words with chip spans
	// We render the body as plain text and overlay chips separately
	const bodyJp = $derived(story?.body_jp ?? '');

	function selectAnswer(idx: number) {
		if (checked) return;
		selected = idx;
	}

	function checkAnswer() {
		if (selected === null) return;
		checked = true;
		answers = [...answers, selected];
	}

	function nextQuestion() {
		checked = false;
		selected = null;
		if (currentQ + 1 >= quiz.length) {
			phase = 'result';
			saveRead();
		} else {
			currentQ += 1;
		}
	}

	async function saveRead() {
		if (!story) return;
		try {
			await supabase.from('user_story_reads').upsert({
				user_id: data.userId,
				story_id: story.id,
				quiz_score: score
			}, { onConflict: 'user_id,story_id' });
		} catch {
			// silent fail
		}
	}

	function startQuiz() {
		phase = 'quiz';
		currentQ = 0;
		answers = [];
		selected = null;
		checked = false;
	}

	// If already read, skip to result phase showing prior score
	$effect(() => {
		if (data.alreadyRead && data.quizScore !== null) {
			// show result directly but allow re-reading
		}
	});

	const currentQuestion = $derived(quiz[currentQ]);
	const isCorrect = $derived(checked && selected === currentQuestion?.a);
</script>

<svelte:head>
	<title>
		{story
			? ($locale === 'es' ? story.title_es : story.title_en) + ' — Hinomaru'
			: 'Historia de hoy — Hinomaru'}
	</title>
</svelte:head>

<div class="story-page">
	<!-- Back button -->
	<button class="back-btn" onclick={() => goto('/deck/stories')}>
		← {t('stories.back', $locale)}
	</button>

	{#if !story}
		<div class="empty-state" use:fadeUp={{ delay: 0, y: 16 }}>
			<div class="empty-icon">📭</div>
			<p>{t('stories.noStory', $locale)}</p>
		</div>
	{:else}
		<!-- ══ PHASE: READ ══ -->
		{#if phase === 'read'}
			<div use:fadeUp={{ delay: 0.04, y: 10 }} style="display:flex;gap:8px;margin-bottom:16px;">
				<span class="hm-pill hm-pill-red">{story.level}</span>
				<span class="hm-pill hm-pill-ink">
					{new Date(story.publish_date).toLocaleDateString($locale === 'es' ? 'es-MX' : 'en-US', {
						month: 'long',
						day: 'numeric'
					})}
				</span>
			</div>

			<h1 class="story-title" use:fadeUp={{ delay: 0.1, y: 16 }}>
				{$locale === 'es' ? story.title_es : story.title_en}
			</h1>

			<!-- Body japonés -->
			<div class="story-card-body" use:fadeUp={{ delay: 0.15, y: 12 }}>
				<p class="body-jp">{bodyJp}</p>

				<button
					class="translation-toggle"
					onclick={() => (showTranslation = !showTranslation)}
				>
					{showTranslation
						? t('stories.hideTranslation', $locale)
						: t('stories.translation', $locale)}
				</button>

				{#if showTranslation}
					<p class="body-trans">
						{$locale === 'es' ? story.body_es : story.body_en}
					</p>
				{/if}
			</div>

			<!-- Vocabulario clave -->
			{#if vocab.length > 0}
				<div class="vocab-section" use:fadeUp={{ delay: 0.2, y: 12 }}>
					<h2 class="section-label">{t('stories.vocab', $locale)}</h2>
					<div class="vocab-grid">
						{#each vocab as word}
							<div class="vocab-item">
								<div style="display:flex;justify-content:space-between;align-items:flex-start;">
									<div style="display:flex;flex-direction:column;gap:2px;">
										<span class="vocab-jp">{word.jp}</span>
										<div style="display:flex;gap:6px;align-items:center;">
											<span class="vocab-kana">{word.kana}</span>
											{#if $showRomaji}
												<span class="vocab-romaji" style="font-size:10px;color:var(--hinomaru-red-ink);opacity:0.7;font-weight:600;">{kanaToRomaji(word.kana)}</span>
											{/if}
										</div>
									</div>
									<button 
										onclick={() => speakJapanese(word.jp)}
										style="background:none;border:none;padding:4px;cursor:pointer;color:var(--fg-tertiary);opacity:0.6;transition:opacity 0.2s;"
										onmouseenter={(e) => (e.currentTarget.style.opacity = '1')}
										onmouseleave={(e) => (e.currentTarget.style.opacity = '0.6')}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
											<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
											<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
										</svg>
									</button>
								</div>
								<span class="vocab-meaning">{$locale === 'es' ? word.es : word.en}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div class="read-footer" use:fadeUp={{ delay: 0.3, y: 10 }}>
				<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={startQuiz}>
					{t('stories.quiz.title', $locale)} →
				</button>
			</div>

		<!-- ══ PHASE: QUIZ ══ -->
		{:else if phase === 'quiz'}
			<div class="quiz-header" use:fadeUp={{ delay: 0, y: 12 }}>
				<div class="quiz-progress">
					{#each quiz as _, i}
						<div class="quiz-dot" class:active={i === currentQ} class:done={i < currentQ}></div>
					{/each}
				</div>
				<h2 class="quiz-title">{t('stories.quiz.title', $locale)}</h2>
				<p class="quiz-subtitle">{t('stories.quiz.subtitle', $locale)}</p>
			</div>

			{#if currentQuestion}
				<div class="question-card" use:fadeUp={{ delay: 0.05, y: 16 }}>
					<p class="question-text">{currentQuestion.q}</p>

					<div class="options-list">
						{#each currentQuestion.o as option, i}
							<button
								class="option-btn"
								class:selected={selected === i}
								class:correct={checked && i === currentQuestion.a}
								class:wrong={checked && selected === i && i !== currentQuestion.a}
								onclick={() => selectAnswer(i)}
								disabled={checked}
							>
								<span class="option-letter">{String.fromCharCode(65 + i)}</span>
								<span class="option-text">{option}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="quiz-footer" use:fadeUp={{ delay: 0.1, y: 10 }}>
					{#if !checked}
						<button
							class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
							onclick={checkAnswer}
							disabled={selected === null}
						>
							{t('stories.quiz.check', $locale)}
						</button>
					{:else}
						<div class="feedback" class:feedback-correct={isCorrect} class:feedback-wrong={!isCorrect}>
							{isCorrect ? '✓ Correct!' : `✗ ${currentQuestion.o[currentQuestion.a]}`}
						</div>
						<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={nextQuestion}>
							{currentQ + 1 < quiz.length ? t('stories.quiz.next', $locale) : t('stories.quiz.done', $locale)}
						</button>
					{/if}
				</div>
			{/if}

		<!-- ══ PHASE: RESULT ══ -->
		{:else if phase === 'result'}
			<div class="result-page" use:fadeUp={{ delay: 0, y: 20 }}>
				<div class="result-icon">
					{score === quiz.length ? '🏆' : score >= 2 ? '⭐' : '📖'}
				</div>
				<h2 class="result-title">
					{score === quiz.length
						? t('stories.quiz.perfect', $locale)
						: t('stories.quiz.done', $locale)}
				</h2>
				<div class="result-score">
					{t('stories.quiz.score', $locale, { n: score })}
				</div>

				<!-- Score circles -->
				<div class="score-circles">
					{#each quiz as _, i}
						<div
							class="score-circle"
							class:circle-ok={answers[i] === quiz[i]?.a}
							class:circle-fail={answers[i] !== quiz[i]?.a}
						></div>
					{/each}
				</div>

				<button
					class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
					style="margin-top:32px;"
					onclick={() => goto('/')}
				>
					{t('stories.back', $locale)}
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.story-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 24px 24px calc(100px + env(safe-area-inset-bottom));
		min-height: 100vh;
	}

	/* ── Back button ── */
	.back-btn {
		background: none;
		border: none;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		margin-bottom: 32px;
		cursor: pointer;
		font-family: var(--font-ui);
		transition: color 150ms ease;
		padding: 0;
	}
	.back-btn:hover { color: var(--sumi); }

	/* ── Empty state ── */
	.empty-state {
		text-align: center;
		padding: 80px 24px;
		color: var(--fg-tertiary);
	}
	.empty-icon { font-size: 48px; margin-bottom: 16px; }

	.story-title {
		font-size: 40px;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin: 0 0 8px;
		color: var(--fg-primary);
		line-height: 1.1;
	}

	/* ── Body ── */
	.story-card-body {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 32px;
		margin-bottom: 32px;
		box-shadow: var(--shadow-sm);
	}

	.body-jp {
		font-family: var(--font-jp);
		font-size: 20px;
		line-height: 1.8;
		margin: 0 0 16px;
		color: var(--fg-primary);
	}

	.translation-toggle {
		background: none;
		border: none;
		font-size: 13px;
		font-weight: 600;
		color: var(--hinomaru-red);
		cursor: pointer;
		padding: 0;
		font-family: var(--font-ui);
		margin-bottom: 12px;
		display: block;
	}

	.body-trans {
		font-size: 15px;
		color: var(--fg-secondary);
		line-height: 1.6;
		margin: 0;
		padding-top: 12px;
		border-top: 1px solid var(--ink-100);
	}

	/* ── Vocab ── */
	.vocab-section { margin-bottom: 32px; }

	.section-label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
		margin: 0 0 14px;
	}

	.vocab-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 10px;
	}

	.vocab-item {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 14px;
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.vocab-jp {
		font-family: var(--font-jp);
		font-size: 18px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.vocab-kana {
		font-family: var(--font-jp);
		font-size: 12px;
		color: var(--fg-tertiary);
	}

	.vocab-meaning {
		font-size: 13px;
		color: var(--fg-secondary);
		margin-top: 2px;
	}

	/* ── Read footer ── */
	.read-footer { margin-top: 8px; }

	/* ── Quiz ── */
	.quiz-header {
		text-align: center;
		margin-bottom: 28px;
	}

	.quiz-progress {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 16px;
	}

	.quiz-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--ink-200);
		transition: background 200ms ease;
	}
	.quiz-dot.active { background: var(--sumi); }
	.quiz-dot.done { background: var(--success); }

	.quiz-title {
		font-size: 24px;
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 4px;
	}

	.quiz-subtitle {
		font-size: 15px;
		color: var(--fg-tertiary);
		margin: 0;
	}

	.question-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 24px;
		margin-bottom: 20px;
		box-shadow: var(--shadow-sm);
	}

	.question-text {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 20px;
		color: var(--fg-primary);
		line-height: 1.4;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.option-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border: 1.5px solid var(--ink-200);
		border-radius: 14px;
		background: var(--bg-surface);
		cursor: pointer;
		font-size: 15px;
		font-family: var(--font-ui);
		color: var(--fg-primary);
		text-align: left;
		transition: border-color 150ms ease, background 150ms ease;
	}

	.option-btn:not(:disabled):hover {
		border-color: var(--sumi);
		background: var(--ink-50);
	}

	.option-btn.selected {
		border-color: var(--sumi);
		background: var(--ink-100);
	}

	.option-btn.correct {
		border-color: var(--success);
		background: var(--success-wash);
	}

	.option-btn.wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	.option-btn:disabled { cursor: default; }

	.option-letter {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--ink-100);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 800;
		flex-shrink: 0;
		color: var(--fg-secondary);
	}

	.option-btn.correct .option-letter {
		background: var(--success);
		color: white;
	}
	.option-btn.wrong .option-letter {
		background: var(--hinomaru-red);
		color: white;
	}

	.quiz-footer {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.feedback {
		text-align: center;
		font-size: 16px;
		font-weight: 700;
		padding: 12px;
		border-radius: 12px;
	}
	.feedback-correct {
		color: var(--success);
		background: var(--success-wash);
	}
	.feedback-wrong {
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	/* ── Result ── */
	.result-page {
		text-align: center;
		padding: 60px 0 40px;
	}

	.result-icon { font-size: 72px; margin-bottom: 20px; }

	.result-title {
		font-size: 28px;
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0 0 8px;
	}

	.result-score {
		font-size: 18px;
		color: var(--fg-secondary);
		margin-bottom: 24px;
	}

	.score-circles {
		display: flex;
		justify-content: center;
		gap: 12px;
	}

	.score-circle {
		width: 20px;
		height: 20px;
		border-radius: 50%;
	}
	.circle-ok { background: var(--success); }
	.circle-fail { background: var(--hinomaru-red-wash); border: 2px solid var(--hinomaru-red); }
</style>
