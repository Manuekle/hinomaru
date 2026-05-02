<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { animate } from 'motion';
	import { calculateNextReview, mapPerformanceToQuality, type SRSState } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { kanaToRomaji } from '$lib/utils/romaji';
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
		Clock01Icon,
		TranslateIcon
	} from '@hugeicons/core-free-icons';
	import { onMount } from 'svelte';
	import { fadeIn, fadeUp } from '$lib/motion';
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
		};
	});

	let checked = $state(false);
	let showGuide = $state(true);

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

		const useSequential = writableChars.length > 2;

		const containerWidth = hanziContainer?.getBoundingClientRect().width || 320;
		const gap = 16;
		let boxSize: number;

		if (useSequential || writableChars.length === 1) {
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
		const outlineColor = theme === 'dark' ? '#444444' : '#f0f0f0';

		for (const char of writableChars) {
			const box = document.createElement('div');
			box.style.width = `${boxSize}px`;
			box.style.height = `${boxSize}px`;
			box.style.background = 'transparent';
			box.style.display = useSequential ? 'none' : 'block';
			hanziContainer?.appendChild(box);

			const charData = await fetchCharData(char, char.codePointAt(0)!);

			const writer = HanziWriter.create(box, char, {
				width: boxSize,
				height: boxSize,
				padding: 20,
				showOutline: showGuide,
				strokeAnimationSpeed: 1.5,
				delayBetweenStrokes: 100,
				strokeColor,
				outlineColor,
				charDataLoader: () => charData
			});

			writers.push({ writer, box, char });
		}

		if (iteration === setupIteration) {
			loadingWriters = false;
			startQuiz();
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
					if (currentQuizIndex < writers.length - 1) {
						currentQuizIndex++;
						startQuiz();
					} else {
						checked = true;
						playCorrect();
					}
				}
			});
		}
	}

	function toggleGuide() {
		showGuide = !showGuide;
		writers.forEach((w) => {
			if (showGuide) w.writer.showOutline();
			else w.writer.hideOutline();
		});
	}

	async function next() {
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
			{i + 1} / {quizCards.length}
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
				<div class="card-face minimal-card">
					<div class="card-tag">{$locale === 'es' ? (data.deck?.kind_es ?? data.deck?.kind) : data.deck?.kind}</div>

					<button
						onclick={() => speakJapanese(card.jp)}
						aria-label="Play pronunciation"
						class="audio-pill normal"
						style="margin: 0 auto;"
					>
						<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
					</button>

					<div class="meaning-label">{t('session.whatMean', $locale)}</div>
					<div class="meaning-text">{$locale === 'es' ? card.es : card.en}</div>
					
					{#if card.example}
						<div class="example-box">
							<div class="example-jp jp">{card.example}</div>
							<div class="example-en">{$locale === 'es' ? card.example_es : card.example_en}</div>
						</div>
					{/if}

					<div class="card-hint">{t('session.writeThis', $locale)}</div>
				</div>

				<div class="canvas-section">
					<div class="canvas-header">
						{#if writableChars.length > 1}
							<div class="char-progress">
								{#each writableChars as ch, idx (idx)}
									<div class="char-dot" class:active={idx === currentQuizIndex} class:done={idx < currentQuizIndex}>
										{ch}
									</div>
								{/each}
							</div>
						{/if}
						
						<button class="tool-btn" onclick={toggleGuide} title={showGuide ? t('session.hideGuide', $locale) : t('session.showGuide', $locale)}>
							<Icon icon={showGuide ? ViewOffIcon : EyeIcon} size={20} color="currentColor" />
						</button>
					</div>

					<div class="canvas-wrapper" class:loading={loadingWriters}>
						<div bind:this={hanziContainer} class="hanzi-container"></div>
						{#if loadingWriters}
							<div class="loader-overlay" transition:fadeIn>
								<DotLoader />
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
		font-size: 18px;
		font-weight: 800;
		color: var(--fg-primary);
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
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
		padding: 24px;
	}

	.minimal-card {
		background: var(--bg-surface);
		border-radius: 32px;
		padding: 24px 20px;
		text-align: center;
		box-shadow: var(--shadow-sm);
		position: relative;
		border: 1px solid var(--ink-100);
	}

	.card-tag {
		font-size: 10px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 12px;
	}

	.audio-pill {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		transition: all 0.2s;
	}

	.meaning-label {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 16px;
		margin-bottom: 4px;
	}

	.meaning-text {
		font-size: 24px;
		font-weight: 800;
		color: var(--hinomaru-red);
		line-height: 1.2;
	}

	.example-box {
		margin-top: 12px;
		padding: 12px;
		background: var(--bg-muted);
		border-radius: 16px;
	}

	.example-jp { font-size: 14px; color: var(--fg-primary); font-weight: 600; }
	.example-en { font-size: 12px; color: var(--fg-secondary); margin-top: 2px; }

	.card-hint {
		margin-top: 16px;
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.canvas-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.canvas-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 8px;
	}

	.char-progress {
		display: flex;
		gap: 8px;
	}

	.char-dot {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-tertiary);
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
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
	}

	.canvas-wrapper {
		position: relative;
		background: var(--bg-surface);
		border-radius: 32px;
		border: 1.5px solid var(--ink-200);
		padding: 24px;
		min-height: 280px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}

	.hanzi-container {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
		width: 100%;
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

	.footer-hint {
		flex: 1;
		text-align: center;
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>
