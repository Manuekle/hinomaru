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
	import { fadeIn } from '$lib/motion';

	interface HanziWriterInstance {
		quiz: (options?: any) => void;
		cancelQuiz: () => void;
		showOutline: () => void;
		hideOutline: () => void;
	}

	interface Props {
		cards: any[];
		deck: any;
		onComplete: (results: { correct: number; total: number }) => void;
		onExit: () => void;
		onCardProgress?: (card: any, correct: boolean, struggled: boolean) => void;
		totalCards?: number;
		learnedCount?: number;
	}

	let { 
		cards: quizCards, 
		deck, 
		onComplete, 
		onExit, 
		onCardProgress,
		totalCards = 0,
		learnedCount = 0
	} = $props<Props>();

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

		for (let idx = 0; idx < chars.length; idx++) {
			const char = chars[idx];
			const box = document.createElement('div');
			box.style.width = `${boxSize}px`;
			box.style.height = `${boxSize}px`;
			box.style.display = (chars.length > 2) ? (idx === 0 ? 'block' : 'none') : 'block';
			hanziContainer?.appendChild(box);

			const writer = HanziWriter.create(box, char, {
				width: boxSize,
				height: boxSize,
				padding: 20,
				showOutline: showGuide,
				strokeColor,
				outlineColor,
				drawingColor,
				drawingWidth: 18,
				highlightOnComplete: true,
				highlightCompleteColor: highlightColor
			});

			writers.push({ writer, box, char });
		}

		if (iteration === setupIteration) {
			loadingWriters = false;
			if (writers.length > 0) startQuiz();
			else if (chars.length === 0) { checked = true; playCorrect(); }
		}
	}

	function startQuiz() {
		if (writers.length === 0) return;
		if (sequential) {
			writers.forEach((w, idx) => w.box.style.display = idx === currentQuizIndex ? 'block' : 'none');
		}

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
			onComplete({ correct: correctCount, total: quizCards.length });
		} else {
			i++;
			checked = false;
			struggled = false;
			currentQuizIndex = 0;
		}
	}
</script>

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={onExit}>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			<span class="session-index">{i + 1} / {quizCards.length}</span>
			<span class="total-label">{t('home.cards', $locale, { n: totalCards })}</span>
		</div>
		
		<div style="width: 44px;"></div> <!-- Spacer -->
	</div>

	<div class="session-container">
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

					<div class="canvas-wrapper" class:loading={loadingWriters}>
						<div bind:this={hanziContainer} class="hanzi-container"></div>
						{#if loadingWriters}<div class="loader-overlay"><DotLoader /></div>{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if card && !showAnticipation}
		<StickyFooter>
			<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" disabled={!checked} onclick={next}>
				{checked ? t('session.next', $locale) : t('session.finishDrawing', $locale)}
			</button>
		</StickyFooter>
	{/if}
</div>

{#if showAnticipation}<AnticipationScreen />{/if}

<style>
	.premium-bg { background-color: var(--bg-page); min-height: 100dvh; display: flex; flex-direction: column; }
	.premium-header-minimal { display: flex; align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 24px 16px; background: var(--bg-surface); border-bottom: 1px solid var(--ink-200); }
	.header-progress { display: flex; flex-direction: column; align-items: center; line-height: 1.1; }
	.session-index { font-size: 17px; font-weight: 900; color: var(--fg-primary); }
	.total-label { font-size: 10px; font-weight: 700; color: var(--fg-tertiary); text-transform: uppercase; }
	.close-btn, .lang-btn { color: var(--fg-secondary); background: none; border: none; padding: 8px; cursor: pointer; }
	.lang-btn.active { color: var(--hinomaru-red); }
	.write-viewer { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px; width: 100%; max-width: 520px; margin: 0 auto; padding: 20px 0 8px; }
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
	.canvas-wrapper { position: relative; background: var(--bg-surface); border-radius: 24px; border: 1.5px solid var(--ink-200); padding: 16px; min-height: 240px; display: flex; align-items: center; justify-content: center; }
	.hanzi-container { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; width: 100%; }
	.loader-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); border-radius: 24px; }
</style>
