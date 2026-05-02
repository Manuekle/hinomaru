<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect } from '$lib/utils/sounds';
	import { safeRomaji } from '$lib/utils/romaji';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import Icon from '$lib/Icon.svelte';
	import {
		EyeIcon,
		ViewOffIcon,
		Cancel01Icon,
		VolumeHighIcon,
		TranslateIcon
	} from '@hugeicons/core-free-icons';
	import { onMount } from 'svelte';
	import { fadeIn } from '$lib/motion';
	import type { PageData } from './$types';

	interface HanziWriterInstance {
		quiz: (options?: any) => void;
		cancelQuiz: () => void;
		showOutline: () => void;
		hideOutline: () => void;
	}

	let { data } = $props<{ data: PageData }>();
	let quizCards = $state<any[]>([]);

	$effect(() => {
		if (data.cards) {
			quizCards = [...data.cards];
		}
	});
	const supabase = createClient();

	let i = $state(0);
	let correctCount = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);

	const card = $derived(quizCards[i]);

	// Timer
	let elapsed = $state(0);
	let timerInterval: any;

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
	};

	let resizeObserver: ResizeObserver | null = null;

	onMount(() => {
		timerInterval = setInterval(() => elapsed++, 1000);
		
		resizeObserver = new ResizeObserver(() => {
			if (card && hanziContainer && !loadingWriters) {
				setupWriters();
			}
		});
		if (hanziContainer) resizeObserver.observe(hanziContainer);

		return () => {
			clearInterval(timerInterval);
			resizeObserver?.disconnect();
			writers.forEach((w) => {
				try { w.writer.cancelQuiz?.(); } catch { /* ignore */ }
			});
		};
	});

	let checked = $state(false);
	let strokeError = $state(false);
	let showGuide = $state(true);
	let charJustCompleted = $state(false);

	let hanziContainer = $state<HTMLDivElement | null>(null);
	let writers = $state<{ writer: HanziWriterInstance; box: HTMLDivElement; char: string }[]>([]);
	let currentQuizIndex = $state(0);
	let loadingWriters = $state(true);
	let setupIteration = 0;

	// Sequential mode if many chars
	const writableChars = $derived(card ? (Array.from(card.jp) as string[]).filter(isKanjiKana) : []);
	const sequential = $derived(writableChars.length > 2);

	function isKanjiKana(ch: string): boolean {
		const code = ch.codePointAt(0)!;
		return (
			(code >= 0x4e00 && code <= 0x9faf) ||
			(code >= 0x3040 && code <= 0x309f) ||
			(code >= 0x30a0 && code <= 0x30ff)
		);
	}

	// Re-init canvas when moving to next card
	$effect(() => {
		if (i >= 0 && card && hanziContainer) {
			checked = false;
			strokeError = false;
			showGuide = true;
			setupWriters();
		}
	});

	async function setupWriters() {
		const iteration = ++setupIteration;
		loadingWriters = true;

		if (hanziContainer) hanziContainer.innerHTML = '';
		writers = [];
		currentQuizIndex = 0;

		// Snapshot chars at call-time. Card may advance during async work; without snapshot
		// `writableChars` re-derives mid-flight and we'd render the wrong character.
		const chars = [...writableChars];

		let HanziWriter;
		try {
			const hwModule = await import('hanzi-writer');
			HanziWriter = hwModule.default || hwModule;
		} catch (err) {
			console.error('Failed to load hanzi-writer', err);
			loadingWriters = false;
			return;
		}

		if (iteration !== setupIteration) return;

		const useSequential = chars.length > 2;

		const containerWidth = hanziContainer?.getBoundingClientRect().width || 320;
		const gap = 16;
		let boxSize: number;

		if (useSequential || chars.length === 1) {
			boxSize = Math.min(containerWidth, 260);
		} else {
			boxSize = Math.min((containerWidth - gap) / 2, 180);
		}

		async function fetchCharData(char: string, code: number): Promise<unknown> {
			const urls =
				code >= 0x3040 && code <= 0x30ff
					? [
							`https://cdn.jsdelivr.net/gh/ailectra/kana-json@main/data/${encodeURIComponent(char)}.json`,
							`https://raw.githubusercontent.com/ailectra/kana-json/main/data/${encodeURIComponent(char)}.json`
						]
					: [
							`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(char)}.json`,
							`https://unpkg.com/hanzi-writer-data@2.0.1/${encodeURIComponent(char)}.json`
						];

			for (const url of urls) {
				try {
					const res = await fetch(url);
					if (res.ok) return await res.json();
				} catch (e) {
					/* ignore */
				}
			}
			return null;
		}

		const theme = document.documentElement.getAttribute('data-theme') || 'light';
		const strokeColor = theme === 'dark' ? '#ff0033' : '#bc002d';
		const outlineColor = theme === 'dark' ? '#444444' : '#e8e8e8';
		const drawingColor = theme === 'dark' ? '#ff3355' : '#bc002d';
		const highlightColor = '#2e7d5b';

		const charDataResults = await Promise.all(
			chars.map((c) => fetchCharData(c, c.codePointAt(0)!))
		);

		if (iteration !== setupIteration) return;

		// If ANY char failed to load, abort — partial writers misalign with UI dots.
		if (chars.length > 0 && charDataResults.some((d) => !d)) {
			loadingWriters = false;
			strokeError = true;
			return;
		}

		for (let idx = 0; idx < chars.length; idx++) {
			const char = chars[idx];
			const charData = charDataResults[idx];

			const box = document.createElement('div');
			box.style.width = `${boxSize}px`;
			box.style.height = `${boxSize}px`;
			box.style.background = 'transparent';
			box.style.display = useSequential ? 'none' : 'block';
			hanziContainer?.appendChild(box);

			const writer = HanziWriter.create(box, char, {
				width: boxSize,
				height: boxSize,
				padding: 20,
				showOutline: showGuide,
				strokeAnimationSpeed: 1.5,
				delayBetweenStrokes: 100,
				strokeColor,
				outlineColor,
				drawingColor,
				drawingWidth: 18,
				highlightOnComplete: true,
				highlightCompleteColor: highlightColor,
				charDataLoader: () => charData as any
			});

			writers.push({ writer, box, char });
		}

		if (iteration === setupIteration) {
			loadingWriters = false;
			if (writers.length === 0) {
				if (chars.length === 0) {
					checked = true;
					playCorrect();
				} else {
					strokeError = true;
				}
			} else {
				strokeError = false;
				startQuiz();
			}
		}
	}

	function startQuiz() {
		if (writers.length === 0) return;

		if (sequential) {
			writers.forEach((w, idx) => {
				w.box.style.display = idx === currentQuizIndex ? 'block' : 'none';
			});
		}

		const current = writers[currentQuizIndex];
		if (current) {
			current.writer.quiz({
				onComplete: () => {
					charJustCompleted = true;
					setTimeout(() => {
						charJustCompleted = false;
						if (currentQuizIndex < writers.length - 1) {
							currentQuizIndex++;
							startQuiz();
						} else {
							checked = true;
							playCorrect();
						}
					}, 700);
				}
			});
		}
	}

	function toggleGuide() {
		showGuide = !showGuide;
		if (!checked) struggled = true;
		writers.forEach((w) => {
			if (showGuide) w.writer.showOutline();
			else w.writer.hideOutline();
		});
	}

	async function persistProgress(c: any, gotIt: boolean, hadDifficulty: boolean) {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user || !c) return;
		const currentProgress = c.progress && c.progress.length > 0 ? c.progress[0] : null;
		const quality = mapPerformanceToQuality(gotIt, hadDifficulty);
		const nextState = calculateNextReview(quality, currentProgress);
		await supabase.from('progress').upsert({
			user_id: user.id,
			card_id: c.id,
			learned: true,
			...nextState,
			last_seen: new Date().toISOString()
		});
	}

	async function next() {
		const gotIt = checked;
		if (gotIt && !struggled) correctCount++;
		persistProgress(card, gotIt, struggled);
		if (i === quizCards.length - 1) {
			const params = new URLSearchParams({
				correct: String(correctCount),
				total: String(quizCards.length),
				mode: 'write'
			});
			saveSession(correctCount, quizCards.length);
			showAnticipation = true;
			setTimeout(() => {
				goto(`/deck/${data.deck.id}/summary?${params}`);
			}, 1800);
		} else {
			i++;
			checked = false;
			struggled = false;
			currentQuizIndex = 0;
		}
	}

	async function saveSession(c: number, total: number) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;
		await supabase.from('sessions').insert({
			user_id: user.id,
			deck_id: data.deck.id,
			mode: 'write',
			correct: c,
			total
		});
		await updateStreak(supabase, user.id);
	}
</script>

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={() => goto(`/deck/${data.deck.id}`)}>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			<span class="session-index">{i + 1} / {quizCards.length}</span>
			<span class="total-label">{t('home.cards', $locale, { n: data.totalCards })}</span>
		</div>

		<button 
			class="lang-btn" 
			class:active={$showRomaji}
			onclick={() => ($showRomaji = !$showRomaji)}
			title="Toggle Romaji"
		>
			<Icon icon={TranslateIcon} size={24} color="currentColor" />
		</button>
	</div>

	<div class="session-container">
		{#if quizCards.length === 0}
			<SessionEmptyState 
				totalCards={data.totalCards} 
				learnedCount={data.learnedCount}
				sessionCount={quizCards.length} 
				deckId={data.deck.id} 
				modeLabel={t('mode.write.title', $locale)}
			/>
		{:else if card}
			<div class="write-viewer">
				<div class="prompt-card">
					<div class="prompt-row">
						<div class="meaning-text">{$locale === 'es' ? card.es : card.en}</div>
						<button onclick={() => speakJapanese(card.jp)} aria-label="Play pronunciation" class="audio-corner">
							<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
						</button>
					</div>

					{#if $showRomaji}
						{@const rom = safeRomaji(card.romaji, card.jp)}
						{#if rom}
							<div class="romaji" style="margin-top:-10px; margin-bottom: 4px;">{rom}</div>
						{/if}
					{/if}

					{#if card.example}
						<div class="example-box">
							<div class="jp" style="font-size:13px;font-weight:600;color:var(--fg-primary);">{card.example}</div>
							{#if $showRomaji}
								{@const exRom = safeRomaji(card.example_romaji || card.extra?.example_romaji, card.example_kana)}
								{#if exRom}
									<div class="romaji" style="font-size:11px; margin-top:2px; margin-bottom: 2px;">{exRom}</div>
								{/if}
							{/if}
							<div style="font-size:12px;color:var(--fg-secondary);margin-top:2px;">{$locale === 'es' ? card.example_es : card.example_en}</div>
						</div>
					{/if}
				</div>

				<div class="canvas-section">
					<div class="canvas-header">
						{#if writers.length > 1}
							<div class="char-progress">
								{#each writers as w, idx (idx)}
									<div class="char-dot" class:active={idx === currentQuizIndex} class:done={idx < currentQuizIndex}>
										{w.char}
									</div>
								{/each}
							</div>
						{/if}
						
						<button class="tool-btn" onclick={toggleGuide} title={showGuide ? t('session.hideGuide', $locale) : t('session.showGuide', $locale)}>
							<Icon icon={showGuide ? ViewOffIcon : EyeIcon} size={16} color="currentColor" />
						</button>
					</div>

					<div class="canvas-wrapper" class:loading={loadingWriters}>
						<div bind:this={hanziContainer} class="hanzi-container"></div>
						{#if loadingWriters}
							<div class="loader-overlay">
								<DotLoader />
							</div>
						{:else if strokeError}
							<div class="stroke-error">
								<p>{$locale === 'es' ? 'No se pudieron cargar los trazos. Verifica tu conexión.' : 'Could not load stroke data. Check your connection.'}</p>
								<button class="hm-btn hm-btn-secondary" onclick={() => setupWriters()}>
									{$locale === 'es' ? 'Reintentar' : 'Retry'}
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if card && !showAnticipation}
		<StickyFooter>
			{#if checked}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={next}>
					{t('session.next', $locale)}
				</button>
			{:else}
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" disabled>
					{t('session.finishDrawing', $locale)}
				</button>
			{/if}
		</StickyFooter>
	{/if}
</div>

{#if showAnticipation}
	<AnticipationScreen />
{/if}

<style>
	.premium-bg {
		background-color: var(--bg-page);
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.premium-header-minimal {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(16px + env(safe-area-inset-top)) 24px 16px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--ink-200);
	}

	.header-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.1;
	}

	.session-index {
		font-size: 17px;
		font-weight: 900;
		color: var(--fg-primary);
		letter-spacing: -0.01em;
	}

	.total-label {
		font-size: 10px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.close-btn, .lang-btn {
		color: var(--fg-secondary);
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.lang-btn.active {
		color: var(--hinomaru-red);
	}

	.write-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 16px;
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
		padding: 20px 0 8px;
	}

	.prompt-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		box-shadow: 0 4px 24px rgba(26,26,26,0.07), 0 1px 4px rgba(26,26,26,0.04);
		padding: 24px 24px 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.prompt-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		width: 100%;
	}

	.meaning-text {
		flex: 1;
		font-size: clamp(18px, 4.5vw, 24px);
		font-weight: 900;
		color: var(--fg-primary);
		line-height: 1.3;
	}

	.audio-corner {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: background 0.15s;
	}

	.audio-corner:focus-visible {
		outline: 2px solid var(--hinomaru-red);
		outline-offset: 2px;
	}

	.example-box {
		width: 100%;
		padding: 14px 16px;
		background: var(--bg-muted);
		border-radius: 14px;
		text-align: left;
	}

	.romaji {
		font-family: var(--font-ui);
		font-size: var(--fs-sm);
		font-weight: 700;
		color: var(--hinomaru-red);
		letter-spacing: 0.02em;
	}

	.canvas-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.canvas-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 8px;
		padding: 0 8px;
	}

	.char-progress {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		min-width: 0;
		flex: 1;
	}

	.char-dot {
		width: 30px;
		height: 30px;
		border-radius: 8px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-tertiary);
		flex-shrink: 0;
		transition: transform 0.2s, background 0.2s, border-color 0.2s;
	}

	.char-dot.active {
		border-color: var(--hinomaru-red);
		color: var(--hinomaru-red);
	}

	.char-dot.done {
		background: var(--success-wash);
		border-color: var(--success);
		color: var(--success);
	}

	.tool-btn {
		width: 30px;
		height: 30px;
		border-radius: 8px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tool-btn:hover {
		background: var(--bg-muted);
		color: var(--fg-primary);
		border-color: var(--ink-300);
	}

	.tool-btn:active {
		transform: scale(0.95);
	}

	.canvas-wrapper {
		position: relative;
		background: var(--bg-surface);
		border-radius: 24px;
		border: 1.5px solid var(--ink-200);
		padding: 16px;
		min-height: clamp(180px, 50vw, 260px);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.hanzi-container {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
		width: 100%;
	}

	.stroke-error {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 16px;
		text-align: center;
		font-size: 14px;
		color: var(--fg-secondary);
	}

	.loader-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-surface);
		border-radius: 40px;
		z-index: 10;
	}

</style>
