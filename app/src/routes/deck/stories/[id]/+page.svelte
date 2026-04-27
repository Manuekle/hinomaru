<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { speakJapanese } from '$lib/utils/tts';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, Award01Icon, BookOpen01Icon } from '@hugeicons/core-free-icons';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { addXP } from '$lib/utils/gamification';
	import { svileo } from '$lib/stores/toast';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const supabase = $derived($page.data.supabase);

	// ── Vocab saving ───────────────────────────────────────────────────────────
	let savedVocab = $state(new Set<string>());
	let savingVocab = $state(new Set<string>());

	$effect(() => {
		const v = story?.vocab;
		if (!v?.length || !supabase) return;
		const jpList = v.map((w: any) => w.jp);
		supabase.auth.getUser().then(({ data: { user } }: any) => {
			if (!user) return;
			supabase
				.from('user_saved_words')
				.select('jp')
				.eq('user_id', user.id)
				.in('jp', jpList)
				.then(({ data: rows }: any) => {
					if (rows?.length) savedVocab = new Set(rows.map((r: any) => r.jp));
				});
		});
	});

	async function saveVocabWord(word: { jp: string; kana: string; en: string; es: string }) {
		if (savedVocab.has(word.jp) || savingVocab.has(word.jp) || !supabase) return;
		savingVocab = new Set([...savingVocab, word.jp]);
		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) return;
			const { error } = await supabase.from('user_saved_words').insert({
				user_id: user.id,
				jp: word.jp,
				kana: word.kana,
				en: word.en,
				es: word.es
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
			savingVocab = new Set([...savingVocab].filter((v) => v !== word.jp));
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
	const scorePct = $derived(quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0);

	const bodyJp = $derived(story?.body_jp ?? '');

	function selectAnswer(idx: number) {
		if (checked) return;
		selected = idx;
	}

	function checkAnswer() {
		if (selected === null) return;
		checked = true;
		answers = [...answers, selected];
		if (selected === currentQuestion?.a) {
			playCorrect();
		} else {
			playWrong();
		}
	}

	function nextQuestion() {
		checked = false;
		selected = null;
		if (currentQ + 1 >= quiz.length) {
			phase = 'result';
			playFinish();
			saveRead();
		} else {
			currentQ += 1;
		}
	}

	async function saveRead() {
		if (!story || !supabase) return;
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
			await supabase.from('user_story_reads').upsert(
				{ user_id: user.id, story_id: story.id, quiz_score: score },
				{ onConflict: 'user_id,story_id' }
			);
			await supabase.from('sessions').insert({
				user_id: user.id,
				mode: 'story',
				correct: score,
				total: quiz.length
			});
			await updateStreak(supabase, user.id);
			await addXP(supabase, user.id, score * 5 + 10);
			await invalidateAll();
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

	function restartRead() {
		phase = 'read';
		showTranslation = false;
	}

	const currentQuestion = $derived(quiz[currentQ]);
	const isCorrect = $derived(checked && selected === currentQuestion?.a);

	// Better language handling for questions and options
	const qJp = $derived(currentQuestion?.q_jp || currentQuestion?.q);
	const qRomaji = $derived(currentQuestion?.q_romaji);
	const qTrans = $derived($locale === 'es' 
		? (currentQuestion?.q_es || currentQuestion?.q_en || currentQuestion?.q)
		: (currentQuestion?.q_en || currentQuestion?.q_es || currentQuestion?.q)
	);

	const optionsJp = $derived(currentQuestion?.o_jp || currentQuestion?.o || []);
	const optionsRomaji = $derived(currentQuestion?.o_romaji || []);
	const optionsTrans = $derived($locale === 'es'
		? (currentQuestion?.o_es || currentQuestion?.o_en || currentQuestion?.o || [])
		: (currentQuestion?.o_en || currentQuestion?.o_es || currentQuestion?.o || [])
	);
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
						{new Date(story.publish_date + 'T12:00:00').toLocaleDateString($locale === 'es' ? 'es-MX' : 'en-US', {
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
						<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
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
											<button
												class="vocab-action-btn"
												onclick={() => speakJapanese(word.jp)}
												aria-label="Audio"
											>
												<Icon
													icon={VolumeHighIcon}
													size={18}
													color="currentColor"
													strokeWidth={1.5}
												/>
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
													<span style="color:var(--success);font-size:13px;font-weight:700;">✓</span
													>
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
				<!-- Progress indicator -->
				<div class="quiz-progress-row">
					<span class="quiz-progress-label">
						{$locale === 'es' ? 'Pregunta' : 'Question'} {currentQ + 1} {$locale === 'es' ? 'de' : 'of'} {quiz.length}
					</span>
					<span class="quiz-score-live">{answers.filter((a, i) => a === quiz[i]?.a).length} ✓</span>
				</div>
				<div class="quiz-progress-bar">
					<div class="quiz-progress-fill" style="width:{((currentQ) / quiz.length) * 100}%;"></div>
				</div>

				{#if currentQuestion}
					<div class="question-box" style="margin-top:16px;" use:fadeUp={{ y: 8 }}>
						<div class="question-header">
							<span class="question-badge">{$locale === 'es' ? 'PREGUNTA' : 'QUESTION'}</span>
							{#if $showRomaji && qRomaji}
								<span class="question-romaji-hint">{qRomaji}</span>
							{/if}
						</div>
						
						<h2 class="question-text jp">{qJp}</h2>
						
						{#if qTrans && qTrans !== qJp}
							<p class="question-translation">{qTrans}</p>
						{/if}

						<div class="options-grid">
							{#each optionsJp as optionJp, i (i)}
								{@const optRomaji = optionsRomaji[i]}
								{@const optTrans = optionsTrans[i]}
								<button
									class="option-item"
									class:is-selected={selected === i}
									class:is-correct={checked && i === currentQuestion.a}
									class:is-wrong={checked && selected === i && i !== currentQuestion.a}
									onclick={() => selectAnswer(i)}
									disabled={checked}
								>
									<div class="option-marker">{String.fromCharCode(65 + i)}</div>
									<div class="option-content">
										<div class="option-label jp">{optionJp}</div>
										{#if $showRomaji && optRomaji}
											<div class="option-romaji">{optRomaji}</div>
										{/if}
										{#if optTrans && optTrans !== optionJp}
											<div class="option-translation">{optTrans}</div>
										{/if}
									</div>
								</button>
							{/each}
						</div>
					</div>

					{#if checked}
						<div class="quiz-feedback-box" class:correct={isCorrect} class:wrong={!isCorrect} use:fadeUp={{ y: 5 }}>
							<div class="feedback-icon">
								{isCorrect ? '✓' : '✗'}
							</div>
							<div class="feedback-text">
								{isCorrect 
									? ($locale === 'es' ? '¡Excelente! Respuesta correcta.' : 'Excellent! Correct answer.') 
									: ($locale === 'es' ? 'Vaya, esa no era. ¡Sigue intentando!' : "Oops, that wasn't it. Keep trying!")}
							</div>
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
				<div class="result-badge" class:result-pass={scorePct >= 70} class:result-fail={scorePct < 70}>
					<Icon
						icon={score === quiz.length ? Award01Icon : BookOpen01Icon}
						size={48}
						color="var(--washi)"
						strokeWidth={1.5}
					/>
				</div>
				<h2 class="result-headline">
					{score === quiz.length
						? ($locale === 'es' ? '¡Perfecto!' : 'Perfect!')
						: ($locale === 'es' ? 'Lectura completada' : 'Reading complete')}
				</h2>

				<!-- Score percentage with color -->
				<div class="result-score-row">
					<span class="result-pct" class:pass={scorePct >= 70} class:fail={scorePct < 70}>
						{scorePct}%
					</span>
					<span class="result-fraction">{score} / {quiz.length}</span>
				</div>

				<!-- Question breakdown -->
				{#if quiz.length > 0}
					<div class="result-breakdown">
						<p class="breakdown-heading">
							{$locale === 'es' ? 'Detalle por pregunta' : 'Question breakdown'}
						</p>
						{#each quiz as q, i (i)}
							{@const wasCorrect = answers[i] === q.a}
							{@const qJpLocal = q.q_jp || q.q}
							{@const qRomajiLocal = q.q_romaji}
							{@const optsJpLocal = q.o_jp || q.o}
							
							<div class="breakdown-row" class:correct={wasCorrect} class:wrong={!wasCorrect} use:fadeUp={{ delay: i * 0.05, y: 5 }}>
								<span class="breakdown-dot">{wasCorrect ? '✓' : '✗'}</span>
								<div class="breakdown-content">
									<div class="breakdown-q-group">
										<span class="breakdown-q jp">{qJpLocal}</span>
										{#if $showRomaji && qRomajiLocal}
											<span class="breakdown-romaji">{qRomajiLocal}</span>
										{/if}
									</div>
									{#if !wasCorrect}
										<span class="breakdown-correct-ans">
											{$locale === 'es' ? 'Correcta:' : 'Correct:'} 
											<span class="jp">{optsJpLocal?.[q.a] ?? '—'}</span>
										</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<StickyFooter>
					<button
						class="hm-btn hm-btn-ghost hm-btn-lg"
						style="flex:1;"
						onclick={restartRead}
					>
						{$locale === 'es' ? 'Leer de nuevo' : 'Read again'}
					</button>
					<button
						class="hm-btn hm-btn-dark hm-btn-lg"
						style="flex:1;"
						onclick={() => goto('/deck/stories')}
					>
						{$locale === 'es' ? 'Otras historias' : 'More stories'}
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
	@media (hover: hover) {
		.back-link-beautiful:hover {
			color: var(--sumi);
		}
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

	@media (hover: hover) {
		.story-audio-btn:hover {
			background: var(--ink-200);
			transform: scale(1.05);
		}
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
		transition:
			background 150ms,
			color 150ms;
	}
	@media (hover: hover) {
		.vocab-action-btn:hover:not(:disabled) {
			background: var(--ink-200);
		}
	}
	.vocab-action-btn:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.vocab-action-btn.vocab-saved {
		background: var(--success-wash);
		cursor: default;
	}

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
		border-radius: 32px;
		padding: 32px;
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
	}

	.question-header {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 16px;
	}

	.question-badge {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.1em;
		color: var(--hinomaru-red);
		opacity: 0.8;
	}

	.question-romaji-hint {
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}

	.question-text {
		font-size: 24px;
		font-weight: 700;
		line-height: 1.3;
		margin-bottom: 8px;
		color: var(--fg-primary);
	}

	.question-translation {
		font-size: 15px;
		color: var(--fg-secondary);
		margin-bottom: 24px;
		font-style: italic;
		opacity: 0.8;
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
		padding: 16px 20px;
		border: 2px solid var(--ink-200);
		border-radius: 20px;
		background: var(--bg-surface);
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		text-align: left;
		font-family: inherit;
		position: relative;
	}

	@media (hover: hover) {
		.option-item:hover:not(:disabled) {
			border-color: var(--ink-300);
			transform: translateY(-2px);
			box-shadow: var(--shadow-sm);
		}
	}

	.option-item:active:not(:disabled) {
		transform: translateY(0);
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

	.is-selected .option-marker {
		background: var(--sumi);
		color: white;
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
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.option-label {
		font-size: 18px;
		font-weight: 600;
		color: var(--fg-primary);
	}

	.option-romaji {
		font-size: 12px;
		color: var(--hinomaru-red);
		font-weight: 500;
		opacity: 0.8;
	}

	.option-translation {
		font-size: 14px;
		color: var(--fg-secondary);
		opacity: 0.7;
	}

	.quiz-feedback-box {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-top: 24px;
		padding: 20px;
		border-radius: 20px;
		animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.quiz-feedback-box.correct {
		background: var(--success-wash);
		border: 1px solid var(--success-200);
	}
	.quiz-feedback-box.wrong {
		background: var(--hinomaru-red-wash);
		border: 1px solid var(--hinomaru-red-200);
	}

	.feedback-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		font-weight: 800;
		flex-shrink: 0;
	}

	.correct .feedback-icon {
		background: var(--success);
		color: white;
	}
	.wrong .feedback-icon {
		background: var(--hinomaru-red);
		color: white;
	}

	.feedback-text {
		font-size: 15px;
		font-weight: 600;
		color: var(--fg-primary);
	}

	@keyframes bounceIn {
		0% { transform: scale(0.9); opacity: 0; }
		100% { transform: scale(1); opacity: 1; }
	}

	/* --- Quiz progress --- */
	.quiz-progress-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
	.quiz-progress-label {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-secondary);
	}
	.quiz-score-live {
		font-size: 13px;
		font-weight: 700;
		color: var(--success);
	}
	.quiz-progress-bar {
		height: 4px;
		background: var(--ink-100);
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 4px;
	}
	.quiz-progress-fill {
		height: 100%;
		background: var(--sumi);
		border-radius: 2px;
		transition: width 0.3s ease;
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
	}
	.result-badge.result-pass { background: var(--success); }
	.result-badge.result-fail { background: var(--hinomaru-red); }

	.result-headline {
		font-size: 28px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.result-score-row {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 10px;
		margin-bottom: 24px;
	}
	.result-pct {
		font-size: 52px;
		font-weight: 800;
		letter-spacing: -0.04em;
		color: var(--sumi);
	}
	.result-pct.pass { color: var(--success); }
	.result-pct.fail { color: var(--hinomaru-red); }
	.result-fraction {
		font-size: 18px;
		color: var(--fg-secondary);
		font-weight: 600;
	}

	/* --- Breakdown --- */
	.result-breakdown {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 18px 20px;
		margin-bottom: 24px;
		box-shadow: var(--shadow-sm);
		text-align: left;
	}
	.breakdown-heading {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		margin: 0 0 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--ink-100);
	}
	.breakdown-row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 8px 0;
		border-bottom: 1px solid var(--ink-50);
	}
	.breakdown-row:last-child { border-bottom: none; }
	.breakdown-dot {
		font-size: 14px;
		font-weight: 700;
		width: 18px;
		flex-shrink: 0;
		margin-top: 1px;
	}
	.breakdown-row.correct .breakdown-dot { color: var(--success); }
	.breakdown-row.wrong .breakdown-dot { color: var(--hinomaru-red); }
	.breakdown-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}
	.breakdown-q-group {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.breakdown-q {
		font-size: 14px;
		color: var(--fg-primary);
		font-weight: 600;
		line-height: 1.4;
	}
	.breakdown-romaji {
		font-size: 11px;
		color: var(--hinomaru-red);
		font-weight: 500;
		opacity: 0.8;
	}
	.breakdown-correct-ans {
		font-size: 12px;
		color: var(--fg-tertiary);
		margin-top: 2px;
	}
	.breakdown-correct-ans .jp {
		color: var(--sumi);
		font-weight: 600;
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
