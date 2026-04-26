<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { speakJapanese } from '$lib/utils/tts';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import { svileo } from 'svileo';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const supabase = $derived($page.data.supabase);

	// ── Vocab saving ───────────────────────────────────────────────────────────
	let savedVocab = $state(new Set<string>());
	let savingVocab = $state(new Set<string>());

	$effect(() => {
		const v = story?.vocab;
		if (!v?.length) return;
		const jpList = v.map((w: any) => w.jp);
		supabase.auth.getUser().then(({ data: { user } }: any) => {
			if (!user) return;
			supabase.from('user_saved_words').select('jp').eq('user_id', user.id).in('jp', jpList)
				.then(({ data: rows }: any) => {
					if (rows?.length) savedVocab = new Set(rows.map((r: any) => r.jp));
				});
		});
	});

	async function saveVocabWord(word: { jp: string; kana: string; en: string; es: string }) {
		if (savedVocab.has(word.jp) || savingVocab.has(word.jp)) return;
		savingVocab = new Set([...savingVocab, word.jp]);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			const { error } = await supabase.from('user_saved_words').insert({
				user_id: user.id, jp: word.jp, kana: word.kana, en: word.en, es: word.es
			});
			if (error) {
				if (error.code === '23505') {
					savedVocab = new Set([...savedVocab, word.jp]);
				} else {
					svileo.error({ title: 'Error' });
				}
			} else {
				savedVocab = new Set([...savedVocab, word.jp]);
			}
		} finally {
			savingVocab = new Set([...savingVocab].filter(v => v !== word.jp));
		}
	}

	const story = $derived(data.story);
	const vocab: any[] = $derived(story?.vocab ?? []);
	const quiz: any[] = $derived(story?.quiz ?? []);

	let showTranslation = $state(false);
	let phase = $state<'read' | 'quiz' | 'result'>('read');
	let currentQ = $state(0);
	let answers = $state<number[]>([]);
	let selected = $state<number | null>(null);
	let checked = $state(false);

	const score = $derived(answers.filter((ans, i) => ans === quiz[i]?.a).length);

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
			await supabase.from('user_story_reads').upsert(
				{
					user_id: data.userId,
					story_id: story.id,
					quiz_score: score
				},
				{ onConflict: 'user_id,story_id' }
			);
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

	const currentQuestion = $derived(quiz[currentQ]);
	const isCorrect = $derived(checked && selected === currentQuestion?.a);
</script>

<svelte:head>
	<title>
		{story
			? ($locale === 'es' ? story.title_es : story.title_en) + ' — Hinomaru'
			: 'Historia — Hinomaru'}
	</title>
</svelte:head>

<div class="story-viewer-layout">
	<!-- Standardized Container matching Dashboard -->
	<div
		style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));width:100%;"
	>
		<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:20px;">
			<a href="/deck/stories" class="back-link-beautiful">
				← {t('deck.back', $locale)}
			</a>
		</div>

		{#if !story}
			<div class="empty-state" use:fadeUp={{ delay: 0, y: 16 }}>
				<div class="empty-icon">📭</div>
				<p>{t('stories.noStory', $locale)}</p>
			</div>
		{:else if phase === 'read'}
			<div class="story-content" use:fadeUp={{ delay: 0.1, y: 12 }}>
				<div class="story-meta-tags">
					<span class="hm-pill hm-pill-red" style="font-size:10px;height:20px;">{story.level}</span>
					<span class="date-badge">
						{new Date(story.publish_date).toLocaleDateString($locale === 'es' ? 'es-MX' : 'en-US', {
							month: 'long',
							day: 'numeric'
						})}
					</span>
				</div>

				<div class="story-title-row">
					<h1 class="story-display-title">
						{$locale === 'es' ? story.title_es : story.title_en}
					</h1>
					<button
						class="story-audio-btn"
						onclick={() => speakJapanese(bodyJp)}
						title="Escuchar historia"
					>
						🔊
					</button>
				</div>

				<div class="story-body-card">
					<p class="body-text-jp">{bodyJp}</p>

					{#if $showRomaji && story.body_romaji}
						<p class="body-text-romaji" use:fadeUp={{ y: 5 }}>{story.body_romaji}</p>
					{/if}

					<div class="translation-section">
						<button class="toggle-btn" onclick={() => (showTranslation = !showTranslation)}>
							{showTranslation ? 'Ocultar traducción' : 'Ver traducción'}
						</button>
						{#if showTranslation}
							<p class="body-text-translated" use:fadeUp={{ y: 5 }}>
								{$locale === 'es' ? story.body_es : story.body_en}
							</p>
						{/if}
					</div>
				</div>

				{#if vocab.length > 0}
					<section class="vocab-section">
						<h3 class="section-title">{t('stories.vocab', $locale)}</h3>
						<div class="vocab-list">
							{#each vocab as word (word.jp)}
								<div class="vocab-card">
									<div class="vocab-top">
										<div class="vocab-jp-group">
											<span class="vocab-jp jp">{word.jp}</span>
											<span class="vocab-kana jp">{word.kana}</span>
										</div>
										<div class="vocab-actions">
											<button class="vocab-action-btn" onclick={() => speakJapanese(word.jp)} aria-label="Audio">
												🔊
											</button>
											<button
												class="vocab-action-btn"
												class:vocab-saved={savedVocab.has(word.jp)}
												disabled={savedVocab.has(word.jp) || savingVocab.has(word.jp)}
												onclick={() => saveVocabWord(word)}
												aria-label="Save"
											>
												{#if savingVocab.has(word.jp)}
													<DotLoader size={4} />
												{:else if savedVocab.has(word.jp)}
													<span style="color:var(--success);font-size:13px;font-weight:700;">✓</span>
												{:else}
													<span style="font-size:16px;font-weight:400;line-height:1;">+</span>
												{/if}
											</button>
										</div>
									</div>
									{#if $showRomaji}
										<div class="vocab-romaji">{kanaToRomaji(word.kana)}</div>
									{/if}
									<div class="vocab-meaning">{$locale === 'es' ? word.es : word.en}</div>
								</div>
							{/each}
						</div>
					</section>
				{/if}
			</div>

			<StickyFooter>
				<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={startQuiz}>
					{t('stories.quiz.title', $locale)} →
				</button>
			</StickyFooter>
		{:else if phase === 'quiz'}
			<div class="quiz-container" use:fadeUp={{ delay: 0, y: 12 }}>
				{#if currentQuestion}
					<div class="question-box">
						<h2 class="question-text">
							{$locale === 'es'
								? currentQuestion.q_es || currentQuestion.q
								: currentQuestion.q_en || currentQuestion.q}
						</h2>

						<div class="options-grid">
							{#each $locale === 'es' ? currentQuestion.o_es || currentQuestion.o : currentQuestion.o_en || currentQuestion.o as option, i (i)}
								<button
									class="option-item"
									class:is-selected={selected === i}
									class:is-correct={checked && i === currentQuestion.a}
									class:is-wrong={checked && selected === i && i !== currentQuestion.a}
									onclick={() => selectAnswer(i)}
									disabled={checked}
								>
									<div class="option-marker">{String.fromCharCode(65 + i)}</div>
									<div class="option-label">{option}</div>
								</button>
							{/each}
						</div>
					</div>

					{#if checked}
						<div class="quiz-feedback" class:correct={isCorrect} class:wrong={!isCorrect}>
							{isCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto'}
						</div>
					{/if}
				{/if}
			</div>

			<StickyFooter>
				{#if !checked}
					<button
						class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
						onclick={checkAnswer}
						disabled={selected === null}
					>
						{t('stories.quiz.check', $locale)}
					</button>
				{:else}
					<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={nextQuestion}>
						{currentQ + 1 < quiz.length
							? t('stories.quiz.next', $locale)
							: t('stories.quiz.done', $locale)}
					</button>
				{/if}
			</StickyFooter>
		{:else if phase === 'result'}
			<div class="result-container" use:fadeUp={{ delay: 0, y: 20 }}>
				<div class="result-badge">
					<span class="badge-icon">{score === quiz.length ? '🏆' : '📚'}</span>
				</div>
				<h2 class="result-headline">
					{score === quiz.length ? '¡Perfecto!' : 'Lectura completada'}
				</h2>
				<p class="result-summary">Has acertado {score} de {quiz.length} preguntas.</p>

				<StickyFooter>
					<button
						class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg"
						onclick={() => goto('/deck/stories')}
					>
						{t('stories.back', $locale)}
					</button>
				</StickyFooter>
			</div>
		{/if}
	</div>
</div>

<style>
	.story-viewer-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--paper);
	}

	.back-link-beautiful {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		transition: color 150ms ease;
	}
	.back-link-beautiful:hover {
		color: var(--sumi);
	}

	/* --- Story View --- */
	.story-meta-tags {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
	}



	.date-badge {
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-tertiary);
	}

	.story-title-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 24px;
	}

	.story-display-title {
		font-size: 32px;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--fg-primary);
		line-height: 1.1;
		flex: 1;
	}

	.story-audio-btn {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: none;
		background: var(--ink-100);
		font-size: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.story-audio-btn:hover {
		background: var(--ink-200);
		transform: scale(1.05);
	}

	.story-audio-btn:active {
		transform: scale(0.95);
	}

	.story-body-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		padding: 24px;
		box-shadow: var(--shadow-sm);
		margin-bottom: 40px;
	}

	.body-text-jp {
		font-family: var(--font-jp);
		font-size: 20px;
		line-height: 1.8;
		color: var(--fg-primary);
		margin-bottom: 8px;
	}

	.body-text-romaji {
		font-size: 14px;
		color: var(--hinomaru-red);
		font-weight: 500;
		line-height: 1.6;
		margin-bottom: 20px;
		opacity: 0.9;
	}

	.translation-section {
		border-top: 1px solid var(--ink-100);
		padding-top: 16px;
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
	}

	.body-text-translated {
		font-size: 15px;
		line-height: 1.6;
		color: var(--fg-secondary);
		margin: 0;
	}

	/* --- Vocab --- */
	.vocab-section {
		margin-top: 40px;
	}

	.section-title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		margin-bottom: 16px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--ink-100);
	}

	.vocab-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.vocab-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 14px 16px;
		box-shadow: var(--shadow-sm);
	}

	.vocab-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 4px;
	}

	.vocab-jp-group {
		display: flex;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
	}

	.vocab-jp {
		font-size: 20px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
		flex-shrink: 0;
	}

	.vocab-kana {
		font-size: 12px;
		color: var(--fg-tertiary);
		white-space: nowrap;
	}

	.vocab-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.vocab-action-btn {
		background: var(--ink-100);
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--fg-secondary);
		transition: background 150ms, color 150ms;
	}
	.vocab-action-btn:hover:not(:disabled) { background: var(--ink-200); }
	.vocab-action-btn:disabled { opacity: 0.5; cursor: default; }
	.vocab-action-btn.vocab-saved { background: var(--success-wash); cursor: default; }

	.vocab-romaji {
		font-size: 11px;
		color: var(--hinomaru-red);
		font-weight: 600;
		margin-bottom: 2px;
	}

	.vocab-meaning {
		font-size: 14px;
		color: var(--fg-secondary);
		line-height: 1.4;
	}

	/* --- Quiz --- */
	.question-box {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		padding: 28px;
		box-shadow: var(--shadow-sm);
	}

	.question-text {
		font-size: 20px;
		font-weight: 700;
		line-height: 1.4;
		margin-bottom: 24px;
		color: var(--fg-primary);
	}

	.options-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.option-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		background: var(--bg-surface);
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
		font-family: inherit;
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
	}

	.is-correct .option-marker {
		background: var(--success);
		color: white;
	}
	.is-wrong .option-marker {
		background: var(--hinomaru-red);
		color: white;
	}

	.option-label {
		font-size: 16px;
		font-weight: 600;
		color: var(--fg-primary);
	}

	.quiz-feedback {
		text-align: center;
		margin-top: 24px;
		font-weight: 700;
		padding: 12px;
		border-radius: 12px;
	}
	.quiz-feedback.correct {
		color: var(--success);
		background: var(--success-wash);
	}
	.quiz-feedback.wrong {
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	/* --- Result --- */
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
		font-size: 40px;
	}

	.result-headline {
		font-size: 28px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.result-summary {
		font-size: 16px;
		color: var(--fg-secondary);
	}

	.empty-state {
		text-align: center;
		padding: 100px 0;
		color: var(--fg-tertiary);
	}
	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	@media (max-width: 480px) {
		.story-display-title {
			font-size: 26px;
		}
		.body-text-jp {
			font-size: 18px;
		}
	}
</style>
