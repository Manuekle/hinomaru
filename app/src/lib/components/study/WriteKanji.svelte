<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/Icon.svelte';
	import {
		EyeIcon,
		ViewOffIcon,
		Cancel01Icon,
		VolumeHighIcon,
		CheckmarkCircle01Icon
	} from '@hugeicons/core-free-icons';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect } from '$lib/utils/sounds';
	import { safeRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import { fadeIn } from '$lib/motion';

	interface HanziWriterInstance {
		quiz: (options?: any) => void;
		cancelQuiz: () => void;
		showOutline: () => void;
		hideOutline: () => void;
	}

	interface Props {
		mode?: 'deck' | 'lesson';
		cards?: any[];
		deck?: any;
		onComplete?: (results: { correct: number; total: number }) => void;
		onExit?: () => void;
		onCardProgress?: (card: any, correct: boolean, struggled: boolean) => void;
		totalCards?: number;
		learnedCount?: number;
		card?: any;
		onAnswer?: (correct: boolean) => void;
		autoAdvance?: boolean;
	}

	let {
		mode = 'deck',
		cards: deckCards,
		deck,
		onComplete,
		onExit,
		onCardProgress,
		totalCards = 0,
		learnedCount = 0,
		card: lessonCard,
		onAnswer,
		autoAdvance = false
	}: Props = $props();

	const isLesson = $derived(mode === 'lesson');
	const quizCards = $derived(isLesson && lessonCard ? [lessonCard] : (deckCards ?? []));
	const _onComplete = (r: { correct: number; total: number }) => {
		if (isLesson) onAnswer?.(r.correct === r.total);
		else onComplete?.(r);
	};
	const _onExit = () => {
		if (isLesson) onAnswer?.(false);
		else onExit?.();
	};

	let i = $state(0);
	let correctCount = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);

	const card = $derived(quizCards[i]);

	let resizeObserver: ResizeObserver | null = null;
	let hanziContainer = $state<HTMLDivElement | null>(null);
	let writers = $state<{ writer: HanziWriterInstance; box: HTMLDivElement; char: string }[]>([]);
	let currentQuizIndex = $state(0);
	let loadingWriters = $state(true);
	let setupIteration = 0;
	let checked = $state(false);
	let strokeError = $state(false);
	let showGuide = $state(true);

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

	async function fetchWithTimeout(url: string, timeout = 3000) {
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), timeout);
		try {
			const response = await fetch(url, { signal: controller.signal });
			clearTimeout(id);
			return response;
		} catch (e) {
			clearTimeout(id);
			throw e;
		}
	}

	const charCache = new Map<string, any>();

	async function loadCharData(char: string) {
		if (charCache.has(char)) return charCache.get(char);

		const code = char.codePointAt(0)!;
		const isKana = code >= 0x3040 && code <= 0x30ff;
		const TIMEOUT = 1500;

		let data = null;

		if (isKana) {
			try {
				const res = await fetchWithTimeout(`https://cdn.jsdelivr.net/gh/ailectra/kana-json@main/data/${encodeURIComponent(char)}.json`, TIMEOUT);
				if (res.ok) data = await res.json();
			} catch (e) {
				console.warn(`Primary kana source failed for ${char}, trying fallback`);
			}
			
			if (!data) {
				try {
					const resRaw = await fetchWithTimeout(`https://raw.githubusercontent.com/ailectra/kana-json/main/data/${encodeURIComponent(char)}.json`, TIMEOUT);
					if (resRaw.ok) data = await resRaw.json();
				} catch (e) { /* ignore */ }
			}
		} else {
			try {
				const resJp = await fetchWithTimeout(`https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp/${encodeURIComponent(char)}.json`, TIMEOUT);
				if (resJp.ok) data = await resJp.json();
			} catch (e) {
				console.warn(`Primary JP source failed for ${char}, trying fallback`);
			}

			if (!data) {
				try {
					const resCn = await fetchWithTimeout(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(char)}.json`, TIMEOUT);
					if (resCn.ok) data = await resCn.json();
				} catch (e) { /* ignore */ }
			}
		}

		if (data) {
			charCache.set(char, data);
			return data;
		}
		
		throw new Error(`No stroke data for ${char}`);
	}

	onMount(() => {
		resizeObserver = new ResizeObserver(() => {
			if (card && hanziContainer && !loadingWriters) {
				setupWriters();
			}
		});
		if (hanziContainer) resizeObserver.observe(hanziContainer);

		return () => {
			resizeObserver?.disconnect();
			writers.forEach((w) => {
				try { w.writer.cancelQuiz?.(); } catch { /* ignore */ }
			});
		};
	});

	$effect(() => {
		if (i >= 0 && card && hanziContainer) {
			checked = false;
			strokeError = false;
			setupWriters();
		}
	});

	async function setupWriters() {
		const iteration = ++setupIteration;
		loadingWriters = true;

		if (hanziContainer) hanziContainer.innerHTML = '';
		writers = [];
		currentQuizIndex = 0;

		const chars = [...writableChars];

		let HanziWriter;
		try {
			const hwModule = await import('hanzi-writer');
			HanziWriter = hwModule.default || hwModule;
		} catch (err) {
			loadingWriters = false;
			return;
		}

		if (iteration !== setupIteration) return;

		const containerWidth = hanziContainer?.getBoundingClientRect().width || 320;
		const gap = 16;
		let boxSize = chars.length > 2 || chars.length === 1 
			? Math.min(containerWidth, 260)
			: Math.min((containerWidth - gap) / 2, 180);

		const theme = document.documentElement.getAttribute('data-theme') || 'light';
		const strokeColor = theme === 'dark' ? '#ff0033' : '#bc002d';
		const outlineColor = theme === 'dark' ? '#444444' : '#e8e8e8';
		const drawingColor = theme === 'dark' ? '#ff3355' : '#bc002d';
		const highlightColor = '#2e7d5b';

		const loadedWriters: { writer: HanziWriterInstance; box: HTMLDivElement; char: string }[] = [];

		const fetchPromises = chars.map(async (char) => {
			try {
				const data = await loadCharData(char);
				return { char, data };
			} catch (err) {
				return { char, data: null };
			}
		});

		const charDataResults = await Promise.all(fetchPromises);
		if (iteration !== setupIteration) return; // Abort if another setup started

		for (let idx = 0; idx < charDataResults.length; idx++) {
			const { char, data } = charDataResults[idx];
			
			if (!data) {
				console.warn(`Skipping char ${char} - no stroke data`);
				continue;
			}

			const box = document.createElement('div');
			box.style.width = `${boxSize}px`;
			box.style.height = `${boxSize}px`;
			box.style.display = 'none'; // Managed by startQuiz
			box.classList.add('kanji-box');
			hanziContainer?.appendChild(box);

			try {
				const writer = HanziWriter.create(box, char, {
					width: boxSize,
					height: boxSize,
					padding: 20,
					showOutline: showGuide,
					strokeColor,
					outlineColor,
					drawingColor,
					drawingWidth: 18,
					leniency: 1.5,
					highlightOnComplete: true,
					highlightCompleteColor: highlightColor,
					charDataLoader: (c: string, onLoad: (d: any) => void) => onLoad(data)
				});

				loadedWriters.push({ writer, box, char });
			} catch (err) {
				console.warn(`Failed to create writer for "${char}":`, err);
				box.remove();
			}
		}

		if (iteration === setupIteration) {
			writers = loadedWriters;
			loadingWriters = false;
			if (writers.length > 0) startQuiz();
			else if (chars.length === 0) { checked = true; playCorrect(); }
			else {
				// All chars failed to load — auto-pass
				checked = true;
				playCorrect();
			}
		}
	}

	function startQuiz() {
		if (writers.length === 0) return;
		
		// Setup display
		writers.forEach((w, idx) => {
			w.box.style.display = (sequential && idx !== currentQuizIndex) ? 'none' : 'block';
		});

		const current = writers[currentQuizIndex];
		current?.writer.quiz({
			onComplete: () => {
				if (currentQuizIndex < writers.length - 1) {
					setTimeout(() => {
						currentQuizIndex++;
						startQuiz();
					}, 700);
				} else {
					checked = true;
					playCorrect();
					if (autoAdvance) {
						setTimeout(() => next(), 800);
					}
				}
			}
		});
	}

	function toggleGuide() {
		showGuide = !showGuide;
		if (!checked) struggled = true;
		writers.forEach((w) => showGuide ? w.writer.showOutline() : w.writer.hideOutline());
	}

	async function next() {
		if (checked && !struggled) correctCount++;
		if (onCardProgress) onCardProgress(card, checked, struggled);

		if (i === quizCards.length - 1) {
			showAnticipation = true;
			_onComplete({ correct: correctCount, total: quizCards.length });
		} else {
			i++;
			checked = false;
			struggled = false;
			currentQuizIndex = 0;
		}
	}
</script>

{#if quizCards.length === 0}
	<SessionEmptyState totalCards={totalCards} learnedCount={learnedCount} sessionCount={0} deckId={deck?.id} modeLabel={t('mode.write.title', $locale)} />
{:else if card}
	<div class="write-viewer">
					<div class="prompt-card" use:fadeIn>
						<span class="prompt-tag">{$locale === 'es' ? 'ESCRIBE EL CARÁCTER' : 'WRITE THE CHARACTER'}</span>
						<div class="prompt-row">
							<div class="meaning-text">{$locale === 'es' ? card.es : card.en}</div>
							<button onclick={() => speakJapanese(card.jp)} class="audio-corner" aria-label="Escuchar">
								<Icon icon={VolumeHighIcon} size={16} color="currentColor" />
							</button>
						</div>
						{#if checked}
							{@const rom = safeRomaji(card.romaji, card.jp)}
							{#if rom}<div class="romaji" use:fadeIn>{rom}</div>{/if}
						{/if}
					</div>

		<div class="canvas-section">
			{#if loadingWriters}
				<div class="canvas-wrapper loading">
					<div class="loader-overlay"><DotLoader /></div>
				</div>
			{:else if writers.length === 0}
				<div class="canvas-wrapper empty-data">
					<p class="empty-data-text">
						{$locale === 'es' 
							? 'Esta palabra no tiene Kanji, o no hay datos de trazos disponibles.' 
							: 'This word has no Kanji, or stroke data is unavailable.'}
					</p>
					<button class="hm-btn hm-btn-primary" onclick={next}>
						{t('session.continue', $locale)}
					</button>
				</div>
			{:else}
				<div class="canvas-header">
					{#if writers.length > 1}
						<div class="char-progress">
							{#each writers as w, idx (idx)}
								<div class="char-dot" class:active={idx === currentQuizIndex} class:done={idx < currentQuizIndex}>{w.char}</div>
							{/each}
						</div>
					{:else}
						<div class="char-single-label jp">{card.jp}</div>
					{/if}
					<button class="tool-btn" class:active={showGuide} onclick={toggleGuide} aria-label="Alternar guía">
						<Icon icon={showGuide ? ViewOffIcon : EyeIcon} size={18} color="currentColor" />
					</button>
				</div>
			{/if}

			<!-- Always render the container so bind:this works and $effect triggers -->
			<div class="canvas-wrapper washi-texture" style="display: {loadingWriters || writers.length === 0 ? 'none' : 'flex'}">
				<div bind:this={hanziContainer} class="hanzi-container"></div>
				
				<!-- Decorative grid lines (replicated in CSS for the kanji-box, but added here for the whole wrapper as well) -->
				<div class="canvas-bg-lines"></div>
			</div>
		</div>
	</div>
{/if}

{#if checked && !showAnticipation && !autoAdvance}
	<StickyFooter>
		<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={next}>
			{t('session.continue', $locale)}
		</button>
	</StickyFooter>
{/if}

{#if showAnticipation}<AnticipationScreen />{/if}

<style>
	.write-viewer { 
		flex: 1; 
		display: flex; 
		flex-direction: column; 
		gap: clamp(16px, 3vh, 24px); 
		padding: 20px 0 8px; 
		width: 100%; 
		max-width: 500px; 
		margin: 0 auto; 
	}

	.prompt-card { 
		background: var(--bg-surface); 
		border: 1.5px solid var(--ink-200); 
		border-radius: 28px; 
		box-shadow: var(--shadow-md); 
		padding: 22px 26px; 
		display: flex; 
		flex-direction: column; 
		align-items: center;
		gap: 12px;
		text-align: center;
	}

	.prompt-tag {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.prompt-row { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; }
	.meaning-text { font-size: 28px; font-weight: 950; color: var(--fg-primary); letter-spacing: -0.02em; }
	
	.audio-corner { 
		width: 40px; 
		height: 40px; 
		border-radius: 50%; 
		border: 1.5px solid var(--ink-200); 
		background: var(--bg-surface); 
		display: flex; 
		align-items: center; 
		justify-content: center; 
		color: var(--fg-secondary); 
		flex-shrink: 0;
		box-shadow: var(--shadow-sm);
		transition: all 0.2s;
	}
	.audio-corner:active { transform: scale(0.9); background: var(--bg-muted); }

	.romaji { font-size: 18px; font-weight: 700; color: var(--hinomaru-red); margin-top: -4px; opacity: 0.9; }
	
	.canvas-section { display: flex; flex-direction: column; gap: 16px; }
	
	.canvas-header { display: flex; justify-content: space-between; align-items: center; padding: 0 4px; }
	
	.char-progress { display: flex; gap: 8px; flex-wrap: wrap; }
	.char-dot { 
		width: 36px; 
		height: 36px; 
		border-radius: 12px; 
		background: var(--bg-surface); 
		border: 1.5px solid var(--ink-200); 
		display: flex; 
		align-items: center; 
		justify-content: center; 
		font-size: 14px; 
		font-weight: 800; 
		flex-shrink: 0;
		transition: all 0.3s var(--ease-brand);
	}
	.char-dot.active { border-color: var(--hinomaru-red); color: var(--hinomaru-red); transform: scale(1.1); box-shadow: 0 4px 12px rgba(188, 0, 45, 0.15); }
	.char-dot.done { background: var(--success-wash); border-color: var(--success); color: var(--success); opacity: 0.7; }
	
	.char-single-label { font-size: 18px; font-weight: 800; color: var(--fg-tertiary); opacity: 0.5; letter-spacing: 0.1em; }

	.tool-btn { 
		width: 40px; 
		height: 40px; 
		border-radius: 14px; 
		border: 1.5px solid var(--ink-200); 
		background: var(--bg-surface); 
		display: flex; 
		align-items: center; 
		justify-content: center; 
		cursor: pointer; 
		flex-shrink: 0;
		transition: all 0.2s;
		color: var(--fg-secondary);
		box-shadow: var(--shadow-sm);
	}
	.tool-btn.active { background: var(--hinomaru-red); border-color: var(--hinomaru-red); color: white; }
	.tool-btn:active { transform: scale(0.9); }

	.canvas-wrapper { 
		position: relative; 
		padding: 10px 0; 
		min-height: clamp(280px, 40vh, 380px); 
		display: flex; 
		align-items: center; 
		justify-content: center; 
		overflow: hidden;
		width: 100%;
	}

	.canvas-wrapper.empty-data { 
		flex-direction: column; 
		gap: 16px; 
		background: var(--bg-surface); 
		text-align: center; 
		padding: 48px 32px; 
		border-radius: 32px;
		border: 1.5px solid var(--ink-200);
	}

	.empty-data-text { font-size: 15px; font-weight: 600; color: var(--fg-tertiary); max-width: 300px; line-height: 1.5; }
	
	.hanzi-container { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; width: 100%; position: relative; z-index: 2; }
	
	:global(.kanji-box) { 
		position: relative; 
		background: var(--bg-surface); 
		border-radius: 28px; 
		border: 2px solid var(--ink-200); 
		overflow: hidden; 
		box-shadow: var(--shadow-lg);
		background-image: 
			radial-gradient(var(--ink-200) 0.5px, transparent 0.5px),
			radial-gradient(var(--ink-200) 0.5px, var(--bg-surface) 0.5px);
		background-size: 20px 20px;
		background-position: 0 0, 10px 10px;
	}
	
	[data-theme='dark'] :global(.kanji-box) {
		background: var(--bg-surface);
		border-color: var(--ink-200);
	}

	:global(.kanji-box::before) { 
		content: ''; 
		position: absolute; 
		top: 50%; 
		left: 0; 
		right: 0; 
		border-top: 1.5px dashed var(--ink-200); 
		z-index: 0; 
		opacity: 0.4;
	}
	
	:global(.kanji-box::after) { 
		content: ''; 
		position: absolute; 
		left: 50%; 
		top: 0; 
		bottom: 0; 
		border-left: 1.5px dashed var(--ink-200); 
		z-index: 0; 
		opacity: 0.4;
	}
	
	:global(.kanji-box > svg) { position: relative; z-index: 1; }
	
	.loader-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); border-radius: 32px; z-index: 10; }
</style>
