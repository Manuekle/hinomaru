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
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StudySessionLayout from './StudySessionLayout.svelte';
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
		onAnswer
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

	async function loadCharData(char: string) {
		const resJp = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp/${encodeURIComponent(char)}.json`);
		if (resJp.ok) return resJp.json();
		const resCn = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data/${encodeURIComponent(char)}.json`);
		if (resCn.ok) return resCn.json();
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

		for (let idx = 0; idx < chars.length; idx++) {
			const char = chars[idx];
			
			let charData;
			try {
				charData = await loadCharData(char);
			} catch (err) {
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
					charDataLoader: (c: string, onLoad: (d: any) => void) => onLoad(charData)
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
				setTimeout(() => {
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

<StudySessionLayout
	{isLesson}
	onExit={_onExit}
	currentIndex={i}
	totalCount={quizCards.length}
>
	{#if quizCards.length === 0}
		<SessionEmptyState totalCards={totalCards} learnedCount={learnedCount} sessionCount={0} deckId={deck?.id} modeLabel={t('mode.write.title', $locale)} />
	{:else if card}
			<div class="write-viewer">
				<div class="prompt-card">
					<div class="prompt-row">
						<div class="meaning-text">{$locale === 'es' ? card.es : card.en}</div>
						<button onclick={() => speakJapanese(card.jp)} class="audio-corner">
							<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
						</button>
					</div>
					{#if checked}
						{@const rom = safeRomaji(card.romaji, card.jp)}
						{#if rom}<div class="romaji">{rom}</div>{/if}
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
								{$locale === 'es' ? 'Continuar' : 'Continue'}
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
							{/if}
							<button class="tool-btn" onclick={toggleGuide}>
								<Icon icon={showGuide ? ViewOffIcon : EyeIcon} size={16} color="currentColor" />
							</button>
						</div>

						<div class="canvas-wrapper">
							<div bind:this={hanziContainer} class="hanzi-container"></div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
</StudySessionLayout>

{#if showAnticipation}<AnticipationScreen />{/if}

<style>

	.write-viewer { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px; padding: 20px 0 8px; width: 100%; max-width: 500px; margin: 0 auto; }

	.prompt-card { background: var(--bg-surface); border: 1px solid var(--ink-200); border-radius: 24px; box-shadow: 0 4px 24px rgba(26,26,26,0.07); padding: 24px; display: flex; flex-direction: column; gap: 12px; }
	.prompt-row { display: flex; align-items: center; justify-content: space-between; }
	.meaning-text { font-size: 24px; font-weight: 900; color: var(--fg-primary); }
	.audio-corner { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--ink-200); background: var(--bg-muted); display: flex; align-items: center; justify-content: center; color: var(--fg-secondary); }
	.romaji { font-weight: 700; color: var(--hinomaru-red); margin-top: -4px; }
	.canvas-section { display: flex; flex-direction: column; gap: 16px; }
	.canvas-header { display: flex; justify-content: space-between; padding: 0 8px; }
	.char-progress { display: flex; gap: 6px; }
	.char-dot { width: 30px; height: 30px; border-radius: 8px; background: var(--bg-surface); border: 1.5px solid var(--ink-200); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
	.char-dot.active { border-color: var(--hinomaru-red); color: var(--hinomaru-red); }
	.char-dot.done { background: var(--success-wash); border-color: var(--success); color: var(--success); }
	.tool-btn { width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid var(--ink-200); display: flex; align-items: center; justify-content: center; cursor: pointer; }
	.canvas-wrapper { position: relative; background: var(--bg-page); border-radius: 24px; border: 1.5px solid var(--ink-200); padding: 16px; min-height: 240px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
	.canvas-wrapper.empty-data { flex-direction: column; gap: 16px; background: var(--bg-surface); text-align: center; padding: 32px 24px; }
	.empty-data-text { font-size: 14px; font-weight: 600; color: var(--fg-tertiary); max-width: 280px; line-height: 1.4; }
	.hanzi-container { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; width: 100%; position: relative; z-index: 1; }
	:global(.kanji-box) { position: relative; background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--ink-200); overflow: hidden; }
	:global(.kanji-box::before) { content: ''; position: absolute; top: 50%; left: 0; right: 0; border-top: 1px dashed var(--ink-200); z-index: 0; }
	:global(.kanji-box::after) { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; border-left: 1px dashed var(--ink-200); z-index: 0; }
	:global(.kanji-box > svg) { position: relative; z-index: 1; }
	.loader-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); border-radius: 24px; z-index: 10; }
</style>
