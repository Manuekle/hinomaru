<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { theme } from '$lib/stores/theme';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { speakJapanese, stopJapanese } from '$lib/utils/tts';
	import { preloadVoicevox } from '$lib/services/voicevox';
	import ScrollingWaveform from '$lib/components/ScrollingWaveform.svelte';
	import { preferredVoice } from '$lib/stores/settings';
	import { get } from 'svelte/store';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import Icon from '$lib/Icon.svelte';
	import { getWordMetadata } from '$lib/utils/vocab_registry';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import { fadeIn } from '$lib/motion';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { addXP } from '$lib/utils/gamification';
	import { svileo } from '$lib/stores/toast';
	import type { PageData } from './$types';
	import {
		VolumeHighIcon,
		Award01Icon,
		BookOpen01Icon,
		ArrowLeft02Icon,
		Sun03Icon,
		Moon02Icon,
		TextFontIcon,
		TranslateIcon,
		Heading01Icon,
		Heading02Icon,
		Heading03Icon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		Clock01Icon,
		Target01Icon,
		CheckmarkCircle02Icon,
		ArrowLeft01Icon
	} from '@hugeicons/core-free-icons';

	let { data } = $props<{ data: PageData }>();

	const supabase = $derived($page.data.supabase);

	// ── Vocab saving ───────────────────────────────────────────────────────────
	let savedVocab = $state(new Set<string>());
	let savingVocab = $state(new Set<string>());

	async function saveVocabWord(word: {
		jp: string;
		kana: string;
		en: string;
		es: string;
		romaji?: string;
		example?: string;
		example_en?: string;
		example_es?: string;
		example_kana?: string;
		example_romaji?: string;
	}) {
		if (!word?.jp || !word?.kana || !word?.en || !word?.es) {
			console.error('save vocab: missing required field', word);
			svileo.error({ title: $locale === 'es' ? 'Datos incompletos' : 'Missing word data' });
			return;
		}
		if (savedVocab.has(word.jp) || savingVocab.has(word.jp) || !supabase) return;
		savingVocab = new Set([...savingVocab, word.jp]);
		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) {
				svileo.error({ title: $locale === 'es' ? 'Inicia sesión' : 'Please sign in' });
				return;
			}
			const romaji = word.romaji || kanaToRomaji(word.kana) || word.kana;
			const { error } = await supabase.from('user_saved_words').insert({
				user_id: user.id,
				jp: word.jp,
				kana: word.kana,
				romaji,
				en: word.en,
				es: word.es,
				example: word.example ?? null,
				example_en: word.example_en ?? null,
				example_es: word.example_es ?? null,
				example_kana: word.example_kana ?? null,
				example_romaji: word.example_romaji ?? null
			});
			if (error) {
				if (error.code === '23505') {
					savedVocab = new Set([...savedVocab, word.jp]);
					svileo.info({
						title: $locale === 'es' ? 'Ya está en tu vocabulario' : 'Already in your vocabulary'
					});
				} else {
					console.error('save vocab failed:', {
						code: error.code,
						message: error.message,
						details: error.details,
						hint: error.hint
					});
					svileo.error({ title: $locale === 'es' ? 'Error al guardar' : 'Save failed' });
				}
			} else {
				savedVocab = new Set([...savedVocab, word.jp]);
				svileo.success({ title: $locale === 'es' ? 'Guardado' : 'Saved' });
			}
		} catch (e) {
			console.error('save vocab exception:', e);
			svileo.error({ title: $locale === 'es' ? 'Error al guardar' : 'Save failed' });
		} finally {
			savingVocab = new Set([...savingVocab].filter((v) => v !== word.jp));
		}
	}

	const story = $derived(data.story);
	const vocab: any[] = $derived(story?.vocab ?? []);

	// Enrich vocab with categories from registry
	const enrichedVocab = $derived(
		vocab.map((w) => {
			const meta = getWordMetadata(w.jp);
			return {
				...w,
				category: w.category || meta?.category,
				category_es: w.category_es || meta?.category_es,
				pos: w.pos || meta?.pos,
				pos_es: w.pos_es || meta?.pos_es
			};
		})
	);
	const quiz: any[] = $derived(story?.quiz ?? []);

	let showTranslation = $state(false);
	let phase = $state<'read' | 'quiz' | 'result' | 'anticipation'>('read');
	let isReadingMode = $state(false);
	let readingTheme = $state<'light' | 'sepia' | 'dark'>('light');
	let fontSize = $state<'sm' | 'md' | 'lg'>('md');
	let isSpeaking = $state(false);

	async function toggleAudio() {
		if (isSpeaking) {
			stopJapanese();
			isSpeaking = false;
		} else {
			try {
				await speakJapanese(bodyJp, () => {
					isSpeaking = true;
				});
			} finally {
				isSpeaking = false;
			}
		}
	}

	$effect(() => {
		if (story?.vocab?.length && supabase) {
			const jpList = story.vocab.map((w: any) => w.jp);
			supabase.auth.getUser().then(({ data: { user } }: any) => {
				if (user) {
					supabase
						.from('user_saved_words')
						.select('jp')
						.eq('user_id', user.id)
						.in('jp', jpList)
						.then(({ data: rows }: any) => {
							if (rows?.length) savedVocab = new Set(rows.map((r: any) => r.jp));
						});
				}
			});
		}

		return () => {
			stopJapanese();
		};
	});

	let currentQ = $state(0);
	let selected = $state<number | null>(null);
	let checked = $state(false);
	let correctness = $state<boolean[]>([]);
	let selectedHistory = $state<number[]>([]);
	let advanceTimeout: ReturnType<typeof setTimeout> | null = null;
	let confettiRef = $state<{ fire: () => void } | null>(null);

	// Timer
	let timeLeft = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let timeUsed = $state(0);

	const score = $derived(correctness.filter(Boolean).length);
	const scorePct = $derived(quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0);
	const timerLabel = $derived(
		`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
	);
	const timeUsedLabel = $derived(
		`${Math.floor(timeUsed / 60)}:${String(timeUsed % 60).padStart(2, '0')}`
	);

	function startTimer() {
		timeLeft = 300; // 5 minutes for a story quiz
		timerInterval = setInterval(() => {
			timeLeft -= 1;
			if (timeLeft <= 0) {
				timeLeft = 0;
				endQuiz();
			}
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		timeUsed = 300 - timeLeft;
	}

	const bodyJp = $derived(story?.body_jp ?? '');

	// Stop audio on unmount or navigation
	$effect(() => {
		return () => {
			stopJapanese();
		};
	});

	// --- Preload TTS Audio ---
	$effect(() => {
		if (story && typeof window !== 'undefined') {
			const preset = get(preferredVoice) === 'cool' ? 'cool' : 'kawaii';

			// Preload story body (if within limits)
			if (bodyJp && bodyJp.length < 200) {
				preloadVoicevox(bodyJp, preset);
			} else if (bodyJp) {
				// Preload first sentence at least
				const firstSentence = bodyJp.split(/[。！？]/)[0];
				if (firstSentence) preloadVoicevox(firstSentence, preset);
			}

			// Preload vocabulary words
			if (story.vocab) {
				story.vocab.forEach((v: any) => {
					preloadVoicevox(v.jp, preset);
				});
			}
		}
	});

	function selectAnswer(idx: number) {
		if (checked) return;
		selected = idx;
	}

	function checkAnswer() {
		if (selected === null || checked) return;
		const isRight = selected === currentQuestion?.a;
		checked = true;
		correctness = [...correctness, isRight];
		selectedHistory = [...selectedHistory, selected];

		if (isRight) playCorrect();
		else playWrong();

		advanceTimeout = setTimeout(advanceQuestion, isRight ? 1800 : 2800);
	}

	function advanceQuestion() {
		if (advanceTimeout) {
			clearTimeout(advanceTimeout);
			advanceTimeout = null;
		}
		if (currentQ + 1 >= quiz.length) {
			endQuiz();
		} else {
			currentQ += 1;
			selected = null;
			checked = false;
		}
	}

	function endQuiz() {
		stopTimer();
		phase = 'anticipation';
		setTimeout(() => {
			phase = 'result';
			playFinish();
			saveRead();
			setTimeout(() => confettiRef?.fire(), 300);
		}, 1800);
	}

	async function saveRead() {
		if (!story || !supabase) return;
		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) return;
			await supabase
				.from('user_story_reads')
				.upsert(
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
			await addXP(supabase, user.id, score * 10);
			await invalidateAll();
		} catch {
			// silent fail
		}
	}

	function startQuiz() {
		phase = 'quiz';
		currentQ = 0;
		correctness = [];
		selectedHistory = [];
		selected = null;
		checked = false;
		startTimer();
	}

	function restartRead() {
		phase = 'read';
		showTranslation = false;
		isReadingMode = false;
	}

	function toggleReadingMode() {
		if (isSpeaking) {
			stopJapanese();
			isSpeaking = false;
		}

		isReadingMode = !isReadingMode;
		if (isReadingMode) {
			// Initialize theme based on system/global theme
			const isDark =
				$theme === 'dark' ||
				($theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
			readingTheme = isDark ? 'dark' : 'light';

			// Auto-scroll to top when entering
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function cycleTheme() {
		if (readingTheme === 'light') readingTheme = 'sepia';
		else if (readingTheme === 'sepia') readingTheme = 'dark';
		else readingTheme = 'light';
	}

	function cycleFontSize() {
		if (fontSize === 'sm') fontSize = 'md';
		else if (fontSize === 'md') fontSize = 'lg';
		else fontSize = 'sm';
	}

	const currentQuestion = $derived(quiz[currentQ]);
	const isCorrect = $derived(checked && selected === currentQuestion?.a);

	// Better language handling for questions and options
	const qJp = $derived(currentQuestion?.q_jp || currentQuestion?.q);
	const qRomaji = $derived(currentQuestion?.q_romaji);
	const qTrans = $derived(
		$locale === 'es'
			? currentQuestion?.q_es || currentQuestion?.q_en || currentQuestion?.q
			: currentQuestion?.q_en || currentQuestion?.q_es || currentQuestion?.q
	);

	const optionsJp = $derived(currentQuestion?.o_jp || currentQuestion?.o || []);
	const optionsRomaji = $derived(currentQuestion?.o_romaji || []);
	const optionsTrans = $derived(
		$locale === 'es'
			? currentQuestion?.o_es || currentQuestion?.o_en || currentQuestion?.o || []
			: currentQuestion?.o_en || currentQuestion?.o_es || currentQuestion?.o || []
	);

	const shuffledIndices = $derived.by(() => {
		if (!currentQuestion) return [];
		const len = optionsJp.length;
		const indices = Array.from({ length: len }, (_, i) => i);
		for (let i = indices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[indices[i], indices[j]] = [indices[j], indices[i]];
		}
		return indices;
	});
</script>

<svelte:head>
	<title>
		{story
			? ($locale === 'es' ? story.title_es : story.title_en) + ' — Hinomaru'
			: 'Historia — Hinomaru'}
	</title>
</svelte:head>

<div
	class="story-viewer-layout"
	class:reading-mode={isReadingMode}
	class:is-quiz={phase === 'quiz'}
	data-theme={isReadingMode ? readingTheme : undefined}
	style="--story-fs: {fontSize === 'sm' ? '18px' : fontSize === 'lg' ? '24px' : '20px'}"
>
	{#if phase === 'quiz'}
		<SessionNav
			progress={((currentQ + (checked ? 1 : 0)) / quiz.length) * 100}
			current={currentQ + 1}
			total={quiz.length}
			title="Story Quiz"
			onClose={restartRead}
			showTimer={true}
			elapsed={300 - timeLeft}
		/>
	{/if}

	<!-- Standardized Container matching Dashboard -->
	<div
		class="main-story-container"
		style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));width:100%;"
	>
		{#if phase === 'read'}
			<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:12px;">
				<a href="/deck/stories" class="back-link-beautiful">
					← {t('deck.back', $locale)}
				</a>
			</div>
		{/if}

		{#if !story}
			<div class="empty-state" use:fadeUp={{ delay: 0, y: 16 }}>
				<div class="empty-icon">📭</div>
				<p>{t('stories.noStory', $locale)}</p>
			</div>
		{:else if phase === 'read'}
			<div class="story-content">
				<div class="story-meta-tags">
					<span class="hm-pill hm-pill-red" style="font-size:10px;height:20px;">{story.level}</span>
					<span class="date-badge">
						{new Date(story.publish_date + 'T12:00:00').toLocaleDateString(
							$locale === 'es' ? 'es-MX' : 'en-US',
							{
								month: 'long',
								day: 'numeric'
							}
						)}
					</span>
				</div>

				<div class="story-title-row">
					<h1 class="story-display-title">
						{#if story.emoji}<span class="story-emoji">{story.emoji}</span> {/if}
						{$locale === 'es' ? story.title_es : story.title_en}
					</h1>
				</div>

				<div
					class="story-body-card"
					class:glass-reading={isReadingMode}
					class:is-preview={!isReadingMode}
				>
					<p class="body-text-jp">
						<InteractiveText
							text={isReadingMode
								? bodyJp
								: [...bodyJp].slice(0, 150).join('') + (bodyJp.length > 150 ? '...' : '')}
						/>
					</p>

					{#if $showRomaji && story.body_romaji}
						<p class="body-text-romaji" use:fadeUp={{ y: 5 }}>
							{story.body_romaji.replace(/\\n/g, '\n')}
						</p>
					{/if}

					<div class="translation-section">
						{#if !isReadingMode}
							<button class="toggle-btn" onclick={() => (showTranslation = !showTranslation)}>
								{showTranslation ? 'Ocultar traducción' : 'Ver traducción'}
							</button>
						{/if}
						{#if showTranslation}
							<p class="body-text-translated" use:fadeUp={{ y: 5 }}>
								{$locale === 'es' ? story.body_es : story.body_en}
							</p>
						{/if}
					</div>
				</div>

				{#if !isReadingMode}
					<div class="enter-reading-row" use:fadeUp={{ delay: 0.2 }}>
						<button class="reading-mode-simple-trigger" onclick={toggleReadingMode}>
							{t('stories.read', $locale)}
						</button>
					</div>
				{/if}

				{#if enrichedVocab.length > 0 && !isReadingMode}
					<section class="vocab-section">
						<h3 class="section-title">{t('stories.vocab', $locale)}</h3>
						<div class="vocab-list">
							{#each enrichedVocab as word (word.jp)}
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

									<div class="vocab-tags">
										{#if word.category}
											<span class="vocab-cat-tag">
												{$locale === 'es' ? word.category_es || word.category : word.category}
											</span>
										{/if}
										{#if word.pos}
											<span class="vocab-pos-tag">
												{$locale === 'es' ? word.pos_es || word.pos : word.pos}
											</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</section>
				{/if}
			</div>

			{#if !isReadingMode}
				<StickyFooter>
					<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={startQuiz}>
						{t('stories.quiz.title', $locale)} →
					</button>
				</StickyFooter>
			{/if}

			{#if isReadingMode}
				<div
					class="reading-mode-overlay"
					data-theme={readingTheme}
					in:fly={{ y: 1000, duration: 500, easing: quintOut, opacity: 1 }}
					style="--story-fs: {fontSize === 'sm' ? '18px' : fontSize === 'lg' ? '24px' : '20px'}"
				>
					<div class="reading-mode-content">
						<div class="story-title-row">
							<h1 class="story-display-title">
								{#if story.emoji}<span class="story-emoji">{story.emoji}</span> {/if}
								{$locale === 'es' ? story.title_es : story.title_en}
							</h1>
						</div>

						<div class="story-body-card">
							<InteractiveText text={bodyJp} {vocab} />

							{#if $showRomaji && story.body_romaji}
								<p class="body-text-romaji" in:fade={{ duration: 200 }}>
									{story.body_romaji.replace(/\\n/g, '\n')}
								</p>
							{/if}

							{#if showTranslation}
								<p class="body-text-translated" in:fade={{ duration: 200 }}>
									{$locale === 'es' ? story.body_es : story.body_en}
								</p>
							{/if}
						</div>
					</div>

					<!-- Floating Reading Toolbar -->
					<div class="reading-toolbar-container">
						<div class="reading-toolbar-pill">
							<button class="tool-btn exit" onclick={toggleReadingMode} title="Salir">
								<Icon icon={ArrowLeft02Icon} size={18} color="currentColor" strokeWidth={2} />
							</button>

							<div class="tool-divider"></div>

							<div class="tool-group-pill">
								<button
									class="tool-tab"
									class:active={!showTranslation}
									onclick={() => (showTranslation = false)}
								>
									{$locale === 'es' ? 'Lectura' : 'Read'}
								</button>
								<button
									class="tool-tab"
									class:active={showTranslation}
									onclick={() => (showTranslation = true)}
								>
									{$locale === 'es' ? 'Trad.' : 'Trans'}
								</button>
							</div>

							<div class="tool-divider"></div>

							<button
								class="tool-btn"
								class:active-tool={isSpeaking}
								onclick={toggleAudio}
								title={isSpeaking
									? t('stories.audio.stop', $locale)
									: t('stories.audio.listen', $locale)}
							>
								<Icon
									icon={VolumeHighIcon}
									size={18}
									color={isSpeaking ? 'var(--hinomaru-red)' : 'currentColor'}
									strokeWidth={2}
								/>
							</button>
							<button
								class="tool-btn"
								onclick={() => showRomaji.toggle()}
								title="Romaji"
								class:active-tool={$showRomaji}
							>
								<Icon icon={TranslateIcon} size={18} color="currentColor" strokeWidth={2} />
							</button>

							<div class="tool-divider"></div>

							<button class="tool-btn" onclick={cycleTheme} title="Tema">
								{#if readingTheme === 'light'}
									<Icon icon={Sun03Icon} size={18} color="currentColor" strokeWidth={2} />
								{:else if readingTheme === 'sepia'}
									<Icon icon={TextFontIcon} size={18} color="currentColor" strokeWidth={2} />
								{:else}
									<Icon icon={Moon02Icon} size={18} color="currentColor" strokeWidth={2} />
								{/if}
							</button>

							<button class="tool-btn" onclick={cycleFontSize} title="Tamaño">
								{#if fontSize === 'sm'}
									<Icon icon={Heading03Icon} size={18} color="currentColor" strokeWidth={2} />
								{:else if fontSize === 'md'}
									<Icon icon={Heading02Icon} size={18} color="currentColor" strokeWidth={2} />
								{:else}
									<Icon icon={Heading01Icon} size={18} color="currentColor" strokeWidth={2} />
								{/if}
							</button>
						</div>
					</div>
				</div>
			{/if}
		{:else if phase === 'quiz'}
			<div class="question-wrap" use:fadeUp={{ delay: 0.04, y: 12 }}>
				<div class="question-card">
					<p class="question-text jp">{qJp}</p>
					{#if $showRomaji && qRomaji}
						<p class="question-romaji">{qRomaji}</p>
					{/if}
					{#if qTrans && qTrans !== qJp}
						<p class="question-translation">{qTrans}</p>
					{/if}
				</div>

				<div class="options-list">
					{#each shuffledIndices as i, loopIdx (i)}
						{@const optionJp = optionsJp[i]}
						{@const optRomaji = optionsRomaji[i]}
						{@const optTrans = optionsTrans[i]}
						<button
							class="option-item"
							class:is-selected={selected === i}
							class:is-correct={checked && i === currentQuestion.a && selected === i}
							class:is-wrong={checked && selected === i && i !== currentQuestion.a}
							class:is-dimmed={checked && selected !== i}
							disabled={checked}
							onclick={() => selectAnswer(i)}
						>
							<div class="opt-marker">
								{#if checked && i === currentQuestion.a && selected === i}
									<Icon icon={CheckmarkCircle01Icon} size={16} color="white" />
								{:else if checked && selected === i && i !== currentQuestion.a}
									<Icon icon={Cancel01Icon} size={16} color="white" />
								{:else}
									{loopIdx + 1}
								{/if}
							</div>
							<div class="opt-content">
								<span class="opt-text jp">{optionJp}</span>
								{#if $showRomaji && optRomaji}
									<span class="opt-romaji">{optRomaji}</span>
								{/if}
								{#if optTrans && optTrans !== optionJp}
									<span class="opt-translation">{optTrans}</span>
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
						disabled={selected === null}
					>
						{t('stories.quiz.check', $locale)}
					</button>
				{:else}
					<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={advanceQuestion}>
						{currentQ + 1 < quiz.length
							? t('stories.quiz.next', $locale)
							: t('stories.quiz.done', $locale)}
					</button>
				{/if}
			</StickyFooter>
		{:else if phase === 'result'}
			<div use:fadeUp={{ delay: 0, y: 20 }} class="result-screen">
				<!-- Premium Hero Header -->
				<div class="result-premium-hero" class:is-pass={scorePct >= 70}>
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
									stroke-dashoffset={283 - (283 * scorePct) / 100}
								/>
							</svg>
							<div class="score-labels">
								<span class="score-big">{scorePct}</span>
								<span class="score-small">%</span>
							</div>
						</div>

						<h2 class="hero-main-title" use:fadeUp={{ delay: 0.3, y: 10 }}>
							{scorePct >= 70 ? t('exam.perfect', $locale) : t('exam.keep_trying', $locale)}
						</h2>
						<div class="hero-xp-badge" use:fadeUp={{ delay: 0.35, y: 10 }}>
							<Icon icon={Target01Icon} size={14} color="var(--warning)" />
							<span>{t('exam.xp_earned', $locale, { n: score * 10 })}</span>
						</div>
						<p class="hero-main-sub" use:fadeUp={{ delay: 0.4, y: 10 }}>
							Story Quiz · {story.level}
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
						<span class="stat-v">{quiz.length - score}</span>
						<span class="stat-l">{t('exam.incorrect_count', $locale)}</span>
					</div>

					<div class="stat-pill-sm duration">
						<Icon icon={Clock01Icon} size={14} color="var(--sumi)" />
						<span class="stat-v">{timeUsedLabel}</span>
						<span class="stat-l">{t('exam.duration', $locale)}</span>
					</div>
				</div>

				<!-- Answer Review -->
				{#if correctness.some(Boolean)}
					<div use:fadeUp={{ delay: 0.55, y: 16 }}>
						<p class="review-section-label">Revision de respuestas</p>
						<div class="review-list">
							{#each quiz as q, i (i)}
								{@const ok = correctness[i]}
								{@const userIdx = selectedHistory[i]}
								{@const userText = userIdx !== null ? (q.o_jp || q.o)[userIdx] : null}
								{@const qJpLocal = q.q_jp || q.q}

								<div
									class="review-item-premium"
									class:is-review-correct={ok}
									class:is-review-wrong={!ok}
								>
									<div class="review-num">{i + 1}</div>
									<div class="review-body">
										<p class="review-q jp">{qJpLocal}</p>
										<p class="review-correct-ans">
											<span class="review-check">{ok ? '✓' : '✗'}</span>
											<span class="review-correct-text jp">{userText || '—'}</span>
										</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="result-actions" use:fadeUp={{ delay: 0.6, y: 12 }}>
					<button class="hm-btn hm-btn-secondary hm-btn-lg" style="flex:1;" onclick={restartRead}>
						<Icon icon={ArrowLeft01Icon} size={20} color="currentColor" />
						<span>{t('stories.read_again', $locale) || 'Leer de nuevo'}</span>
					</button>
					<button
						class="hm-btn hm-btn-dark hm-btn-lg"
						style="flex:1;"
						onclick={() => goto('/deck/stories')}
					>
						{t('stories.more_stories', $locale) || 'Otras historias'}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if phase === 'anticipation'}
	<AnticipationScreen />
{/if}

<Confetti bind:this={confettiRef} />

{#if isSpeaking}
	<div
		class="now-playing-toast"
		data-theme={isReadingMode ? readingTheme : undefined}
		transition:fly={{ y: -60, duration: 300, easing: quintOut }}
	>
		<div class="now-playing-wave">
			<ScrollingWaveform
				playing={true}
				height={28}
				barWidth={3}
				barGap={2}
				speed={8}
				barColor="var(--hinomaru-red)"
			/>
		</div>
		<span class="now-playing-label">{t('stories.audio.playing', $locale)}</span>
		<button class="now-playing-stop" onclick={toggleAudio} aria-label="Stop">
			<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
				<rect x="1" y="1" width="12" height="12" rx="2" />
			</svg>
		</button>
	</div>
{/if}

<style>
	.story-viewer-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--bg-page, var(--paper));
	}

	.story-viewer-layout.is-quiz {
		height: 100dvh;
		overflow: hidden;
	}

	.story-viewer-layout.is-quiz .main-story-container {
		flex: 1;
		overflow-y: auto;
		padding-top: 32px !important;
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
		margin-bottom: 12px;
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
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--fg-primary);
		line-height: 1.2;
		flex: 1;
		transition: all 0.3s ease;
	}

	.story-viewer-layout:not(.reading-mode) .story-display-title {
		font-size: 24px;
	}

	.story-emoji {
		font-style: normal;
		font-weight: 400;
		margin-right: 4px;
	}

	.story-body-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		padding: 24px;
		box-shadow: var(--shadow-sm);
		margin-bottom: 24px;
		transition: all 0.3s ease;
		position: relative;
		overflow: visible;
	}

	.story-body-card.is-preview {
		padding: 20px 24px;
		background: var(--ink-50);
		border-color: var(--ink-100);
		box-shadow: none;
		overflow: hidden;
	}

	.story-body-card.is-preview::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 80px;
		background: linear-gradient(transparent, var(--ink-50));
		pointer-events: none;
	}

	.is-preview .body-text-jp {
		font-size: 17px;
		line-height: 1.6;
		margin-bottom: 0;
		color: var(--fg-secondary);
	}

	.is-preview .body-text-romaji,
	.is-preview .translation-section {
		display: none;
	}

	.body-text-jp {
		font-family: var(--font-jp);
		font-size: 20px;
		line-height: 1.8;
		color: var(--fg-primary);
		margin-bottom: 24px;
		white-space: pre-wrap;
	}

	.body-text-romaji {
		font-size: 14px;
		color: var(--hinomaru-red);
		font-weight: 500;
		line-height: 1.6;
		margin-bottom: 24px;
		opacity: 0.9;
		white-space: pre-wrap;
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
		color: var(--fg-primary);
		opacity: 0.8;
		margin: 0;
		white-space: pre-wrap;
	}

	/* --- Vocab --- */
	.vocab-section {
		margin-top: 40px;
	}

	.section-title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.04em;
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

	.vocab-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 8px;
	}

	.vocab-cat-tag {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.04em;
		background: var(--ink-100);
		color: var(--fg-tertiary);
		padding: 2px 8px;
		border-radius: 4px;
	}

	.vocab-pos-tag {
		font-size: 10px;
		font-weight: 600;
		font-style: italic;
		color: var(--fg-tertiary);
		padding: 2px 0;
	}

	/* --- Quiz --- */
	.question-box {
		position: relative;
		overflow: visible;
		display: flex;
		flex-direction: column;
	}

	.question-header {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 20px;
	}

	.question-badge {
		font-size: 10px;
		font-weight: 400;
		letter-spacing: -0.04em;
		color: var(--hinomaru-red);
		opacity: 0.8;
	}

	.question-romaji-hint {
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}

	.question-text {
		font-size: 28px;
		font-weight: 800;
		line-height: 1.2;
		margin-bottom: 12px;
		color: var(--fg-primary);
		letter-spacing: -0.04em;
	}

	.question-translation {
		font-size: 16px;
		color: var(--fg-secondary);
		margin-bottom: 32px;
		line-height: 1.5;
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
		padding: 18px 20px;
		border: 1.5px solid var(--ink-200);
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
		color: var(--washi);
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
		font-weight: 400;
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
		0% {
			transform: scale(0.9);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
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
	.result-badge.result-pass {
		background: var(--success);
	}
	.result-badge.result-fail {
		background: var(--hinomaru-red);
	}

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
		font-weight: 400;
		letter-spacing: -0.04em;
		color: var(--sumi);
	}
	.result-pct.pass {
		color: var(--success);
	}
	.result-pct.fail {
		color: var(--hinomaru-red);
	}
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
		letter-spacing: -0.04em;
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
	.breakdown-row:last-child {
		border-bottom: none;
	}
	.breakdown-dot {
		font-size: 14px;
		font-weight: 700;
		width: 18px;
		flex-shrink: 0;
		margin-top: 1px;
	}
	.breakdown-row.correct .breakdown-dot {
		color: var(--success);
	}
	.breakdown-row.wrong .breakdown-dot {
		color: var(--hinomaru-red);
	}
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

	/* --- Reading Mode Overrides --- */
	.story-viewer-layout {
		/* Remove background transition to avoid flashes */
		transition: color 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 100vh;
	}

	.reading-mode-overlay {
		position: fixed;
		inset: 0;
		z-index: 2000;
		background: var(--bg-page);
		color: var(--fg-primary);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		padding: calc(60px + env(safe-area-inset-top)) 20px calc(140px + env(safe-area-inset-bottom))
			20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		outline: none;
		border: none;
	}

	/* --- PREMIUM QUIZ STYLES (MATCHING JLPT) --- */
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
		font-weight: 800;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: -0.04em;
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
		font-weight: 800;
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
	.question-wrap .question-text {
		font-size: 19px;
		line-height: 1.75;
		color: var(--sumi);
		margin: 0;
		white-space: pre-line;
	}

	.question-romaji {
		font-size: 13px;
		color: var(--fg-tertiary);
		margin: 8px 0 0;
		line-height: 1.6;
		font-style: italic;
		letter-spacing: -0.04em;
	}
	.question-wrap .question-translation {
		font-size: 14px;
		color: var(--fg-secondary);
		opacity: 0.7;
		margin-top: 8px;
	}

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
		font-weight: 800;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.question-wrap .option-item {
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
	.question-wrap .option-item:not(:disabled):hover {
		border-color: var(--ink-400);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}
	.question-wrap .option-item.is-selected:not(.is-correct):not(.is-wrong) {
		border-color: var(--sumi);
		background: var(--ink-50);
	}
	.question-wrap .option-item.is-correct {
		border-color: var(--success) !important;
		background: var(--success-wash) !important;
		border-width: 3px;
	}
	.question-wrap .option-item.is-wrong {
		border-color: var(--hinomaru-red) !important;
		background: var(--hinomaru-red-wash) !important;
		border-width: 3px;
	}
	.question-wrap .option-item.is-dimmed {
		opacity: 0.4;
	}

	.question-wrap .opt-marker {
		width: 32px;
		height: 32px;
		border-radius: 10px;
		background: var(--ink-100);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 800;
		color: var(--fg-secondary);
		flex-shrink: 0;
		transition: all 0.2s;
	}
	.question-wrap .is-selected:not(.is-correct):not(.is-wrong) .opt-marker {
		background: var(--sumi);
		color: var(--washi);
	}
	.question-wrap .is-correct .opt-marker {
		background: var(--success);
		color: white;
		border-radius: 50%;
		box-shadow: 0 0 10px rgba(46, 125, 91, 0.3);
	}
	.question-wrap .is-wrong .opt-marker {
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
	.opt-translation {
		font-size: 13px;
		color: var(--fg-tertiary);
		opacity: 0.6;
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
		font-weight: 900;
		line-height: 1;
	}
	.score-small {
		font-size: 20px;
		font-weight: 600;
		opacity: 0.6;
	}

	.hero-main-title {
		font-size: 28px;
		font-weight: 800;
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
		font-weight: 800;
		color: var(--sumi);
	}
	.stat-l {
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-secondary);
		text-transform: lowercase;
	}

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
	.review-correct-ans {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin: 0;
	}
	.review-check {
		font-size: 12px;
		font-weight: 700;
		color: var(--success);
		flex-shrink: 0;
	}
	.review-correct-text {
		font-size: 14px;
		font-weight: 700;
		color: var(--success);
	}
	.review-actual-correct {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-style: italic;
	}

	.result-actions {
		display: flex;
		gap: 12px;
		margin-top: 8px;
	}

	.jp {
		font-family: var(--font-jp);
	}

	:global([data-theme='dark']) .stat-pill-sm,
	:global([data-theme='dark']) .question-card,
	:global([data-theme='dark']) .review-item-premium {
		background: var(--ink-100);
		border-color: var(--ink-200);
	}

	.reading-mode-content {
		width: 100%;
		max-width: 720px;
		margin: 0 auto;
	}

	.reading-mode-overlay[data-theme='dark'] {
		--bg-page: #121212;
		--bg-surface: transparent;
		--bg-toolbar: rgba(30, 30, 30, 0.85);
		--fg-primary: #e0e0e0;
		--fg-secondary: #888;
		--fg-toolbar: #fff;
		--ink-100: rgba(255, 255, 255, 0.1);
		--ink-200: rgba(255, 255, 255, 0.2);
		--paper: #121212;
	}

	.reading-mode-overlay[data-theme='light'] {
		--bg-page: #f9f7f4;
		--bg-surface: transparent;
		--bg-toolbar: rgba(255, 255, 255, 0.92);
		--fg-primary: #1a1a1a;
		--fg-secondary: #555;
		--fg-tertiary: #888;
		--fg-toolbar: #111;
		--ink-50: rgba(0, 0, 0, 0.03);
		--ink-100: rgba(0, 0, 0, 0.06);
		--ink-200: rgba(0, 0, 0, 0.1);
		--paper: #f9f7f4;
	}

	.reading-mode-overlay[data-theme='sepia'] {
		--bg-page: #f4ecd8;
		--bg-surface: transparent;
		--bg-toolbar: rgba(244, 236, 216, 0.85);
		--fg-primary: #5b4636;
		--fg-secondary: #7a6352;
		--fg-toolbar: #5b4636;
		--ink-100: rgba(91, 70, 54, 0.1);
		--ink-200: rgba(91, 70, 54, 0.2);
		--paper: #f4ecd8;
	}

	.reading-mode-overlay .story-display-title,
	.reading-mode-overlay :global(.interactive-text),
	.reading-mode-overlay .body-text-translated,
	.reading-mode-overlay .body-text-romaji {
		transition: color 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.reading-mode-overlay .story-display-title {
		font-family: var(--font-heading);
		font-size: 52px;
		font-weight: 700;
		text-align: center;
		margin-top: 60px;
		margin-bottom: 80px;
		letter-spacing: -0.02em;
	}

	.reading-mode .story-body-card {
		border-color: transparent;
		box-shadow: none;
		padding: 0;
		background: transparent;
		max-width: 680px;
		margin: 0 auto;
		overflow: visible;
		border-radius: 0;
	}

	/* Force InteractiveText to pick up reading mode colors and font size */
	.reading-mode-overlay :global(.interactive-text) {
		font-family: var(--font-jp);
		font-size: var(--story-fs);
		line-height: 2.2;
		color: var(--fg-primary);
		letter-spacing: -0.04em;
		white-space: pre-wrap;
		text-align: left;
	}

	.reading-mode-overlay :global(.interactive-text span) {
		color: var(--fg-primary);
	}

	.reading-mode-overlay .body-text-romaji {
		font-size: calc(var(--story-fs) * 0.65);
		margin-top: 10px;
		margin-bottom: 40px;
		text-align: left;
		font-style: italic;
		color: var(--hinomaru-red);
		white-space: pre-wrap;
		opacity: 1;
	}

	.reading-mode-overlay[data-theme='dark'] .body-text-romaji {
		color: #ff8080;
	}

	.reading-mode-overlay[data-theme='sepia'] .body-text-romaji {
		color: #c0392b;
	}

	.reading-mode-overlay .body-text-translated {
		font-size: calc(var(--story-fs) - 4px);
		line-height: 1.8;
		border-left: 2px solid var(--hinomaru-red);
		padding-left: 24px;
		margin-top: 24px;
		font-style: italic;
		color: var(--fg-primary);
		opacity: 0.75;
	}

	.reading-mode-overlay[data-theme='dark'] .body-text-translated {
		color: #e0e0e0;
		opacity: 0.9;
	}

	.reading-mode-overlay[data-theme='sepia'] .body-text-translated {
		color: #4a3728;
		opacity: 0.9;
	}

	.reading-mode-overlay :global(.word-link) {
		color: inherit;
		border-bottom: 1.5px dotted var(--hinomaru-red);
		background: transparent;
		text-decoration: none;
	}

	.reading-mode-overlay[data-theme='dark'] :global(.word-link) {
		border-bottom-color: rgba(255, 255, 255, 0.3);
	}

	.reading-mode-overlay[data-theme='sepia'] :global(.word-link) {
		border-bottom-color: rgba(91, 70, 54, 0.4);
	}

	.glass-reading {
		transition: all 0.4s ease;
	}

	/* --- Enter Reading Row --- */
	.enter-reading-row {
		display: flex;
		justify-content: center;
		margin-top: -10px;
		margin-bottom: 40px;
	}

	.reading-mode-simple-trigger {
		background: none;
		border: none;
		color: var(--sumi);
		font-size: 13px;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
		padding: 4px 0;
		transition: opacity 0.2s;
	}

	.reading-mode-simple-trigger:hover {
		opacity: 0.6;
	}

	/* --- Floating Reading Toolbar --- */
	.reading-toolbar-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		z-index: 2500;
		/* 
		 * env(safe-area-inset-bottom) = ~34px iOS, = 0 Android/desktop.
		 * max() ensures at least 16px clearance on Android/web.
		 */
		padding: 0 16px max(16px, calc(env(safe-area-inset-bottom, 0px) - 14px));
		pointer-events: none;
		/* GPU layer — prevents iOS scroll jitter on position:fixed */
		transform: translateZ(0);
		-webkit-transform: translateZ(0);
		will-change: transform;
	}

	@media (min-width: 768px) {
		.reading-toolbar-container {
			padding: 0 16px 24px;
		}
	}

	.reading-toolbar-pill {
		pointer-events: auto; /* Re-enable clicks on the pill itself */
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		background: var(--bg-toolbar, rgba(26, 26, 26, 0.95));
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border-radius: var(--radius-full);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
		color: var(--fg-toolbar, white);
		border: 1px solid var(--ink-100);
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.tool-btn {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: none;
		background: transparent;
		color: currentColor;
		opacity: 0.7;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tool-btn:hover {
		background: var(--ink-100);
		opacity: 1;
	}

	.tool-btn.active-tool {
		color: var(--hinomaru-red);
		opacity: 1;
		background: var(--ink-100);
	}

	.tool-btn.exit {
		background: var(--fg-toolbar, #fff);
		color: var(--bg-toolbar, rgba(26, 26, 26, 0.95));
		opacity: 1;
	}

	.tool-btn.exit:hover {
		transform: scale(1.05);
		opacity: 0.9;
	}

	.tool-divider {
		width: 1px;
		height: 24px;
		background: var(--ink-200);
		margin: 0 4px;
		opacity: 0.5;
	}

	.tool-group-pill {
		display: flex;
		background: var(--ink-100);
		padding: 4px;
		border-radius: var(--radius-full);
		gap: 2px;
	}

	.tool-tab {
		padding: 6px 16px;
		border-radius: var(--radius-full);
		border: none;
		background: transparent;
		color: var(--fg-toolbar, white);
		opacity: 0.5;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tool-tab.active {
		background: rgba(255, 255, 255, 0.15);
		color: var(--fg-toolbar, white);
		opacity: 1;
	}

	.reading-mode[data-theme='light'] .tool-tab.active {
		background: rgba(0, 0, 0, 0.08);
	}

	@media (max-width: 600px) {
		.reading-toolbar-pill {
			gap: 4px;
			padding: 6px;
		}
		.tool-btn {
			width: 40px;
			height: 40px;
		}
		.tool-tab {
			padding: 6px 12px;
			font-size: 12px;
		}
		.reading-mode .story-display-title {
			font-size: 32px;
			margin-bottom: 40px;
		}
	}

	/* Now Playing toast */
	:global(.now-playing-toast) {
		position: fixed;
		top: calc(8px + env(safe-area-inset-top));
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px 10px 16px;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(188, 0, 45, 0.18);
		border-radius: 999px;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.14),
			0 2px 8px rgba(188, 0, 45, 0.08);
		z-index: 3000;
		min-width: 200px;
	}

	:global(.now-playing-toast[data-theme='dark']) {
		background: rgba(18, 18, 18, 0.92);
		border-color: rgba(188, 0, 45, 0.3);
		color: #e0e0e0;
	}

	:global(.now-playing-toast[data-theme='sepia']) {
		background: rgba(242, 231, 213, 0.92);
		border-color: rgba(188, 0, 45, 0.2);
		color: #4a3728;
	}

	:global(.now-playing-wave) {
		width: 80px;
		flex-shrink: 0;
	}

	:global(.now-playing-label) {
		font-size: 13px;
		font-weight: 700;
		color: var(--hinomaru-red);
		flex: 1;
		white-space: nowrap;
	}

	:global(.now-playing-stop) {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: none;
		background: var(--hinomaru-red);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		transition:
			transform 0.15s ease,
			opacity 0.15s ease;
	}

	:global(.now-playing-stop:hover) {
		transform: scale(1.1);
		opacity: 0.9;
	}
</style>
