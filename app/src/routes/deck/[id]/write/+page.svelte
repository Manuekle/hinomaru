<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { animate } from 'motion';
	import { calculateNextReview, mapPerformanceToQuality, type SRSState } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import Icon from '$lib/Icon.svelte';
	import {
		CleanIcon,
		EyeIcon,
		ViewOffIcon,
		Cancel01Icon,
		CheckmarkCircle01Icon,
		InboxIcon,
		VolumeHighIcon
	} from '@hugeicons/core-free-icons';
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
	let cardEl = $state<HTMLDivElement | null>(null);

	const card = $derived(quizCards[i]);
	const pct = $derived(((i + 1) / quizCards.length) * 100);

	let checked = $state(false);
	let showGuide = $state(true);

	let hanziContainer = $state<HTMLDivElement | null>(null);
	let writers = $state<{ writer: HanziWriterInstance; box: HTMLDivElement; char: string }[]>([]);
	let currentQuizIndex = $state(0);
	let loadingWriters = $state(true);
	let setupIteration = 0;

	// Whether we use sequential (one-at-a-time) mode
	const sequential = $derived(
		card ? (Array.from(card.jp) as string[]).filter(isKanjiKana).length > 2 : false
	);

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

		const chars = Array.from(card.jp) as string[];
		const writableChars = chars.filter(isKanjiKana);
		const useSequential = writableChars.length > 2;

		const containerWidth = hanziContainer?.clientWidth || 320;
		const gap = 12;
		let boxSize: number;

		if (useSequential || writableChars.length === 1) {
			boxSize = Math.min(320, containerWidth - 16);
		} else {
			// 2 chars side-by-side
			boxSize = Math.min(220, (containerWidth - gap) / 2);
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
				} catch {
					// try next CDN
				}
			}
			return null;
		}

		const charDataResults = await Promise.all(
			chars.map(async (char) => {
				const code = char.codePointAt(0)!;
				if (!isKanjiKana(char)) return { char, data: null as any };
				const charData = await fetchCharData(char, code);
				if (!charData) console.warn('All CDNs failed for char:', char);
				return { char, data: charData as any };
			})
		);

		if (iteration !== setupIteration) return;
		if (!hanziContainer) return;

		const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
		const tempWriters: { writer: HanziWriterInstance; box: HTMLDivElement; char: string }[] = [];

		// Wrap in a flex container so sequential boxes are centered
		hanziContainer.style.display = 'flex';
		hanziContainer.style.flexWrap = useSequential ? 'nowrap' : 'wrap';
		hanziContainer.style.justifyContent = 'center';
		hanziContainer.style.gap = `${gap}px`;

		for (let idx = 0; idx < charDataResults.length; idx++) {
			const { char, data: charData } = charDataResults[idx] as { char: string; data: any };

			const box = document.createElement('div');
			box.style.width = `${boxSize}px`;
			box.style.height = `${boxSize}px`;
			box.style.display = useSequential && idx !== 0 ? 'none' : 'flex';
			box.style.alignItems = 'center';
			box.style.justifyContent = 'center';
			box.style.fontSize = `${boxSize * 0.6}px`;
			box.style.color = 'var(--sumi)';
			box.style.position = 'relative';
			box.style.background = 'var(--ink-100)';
			box.style.border = '2px dashed var(--ink-200)';
			box.style.borderRadius = '20px';
			box.style.overflow = 'hidden';
			box.style.cursor = 'crosshair';
			box.style.flexShrink = '0';

			// Grid lines
			const hLine = document.createElement('div');
			hLine.style.cssText = `position:absolute;top:50%;left:0;right:0;height:1px;background:var(--ink-300);pointer-events:none;`;
			const vLine = document.createElement('div');
			vLine.style.cssText = `position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--ink-300);pointer-events:none;`;
			box.appendChild(hLine);
			box.appendChild(vLine);

			if (charData) {
				const writerContainer = document.createElement('div');
				writerContainer.style.cssText = `width:100%;height:100%;position:absolute;top:0;left:0;`;
				box.appendChild(writerContainer);

				const writer = HanziWriter.create(writerContainer, char, {
					width: boxSize,
					height: boxSize,
					padding: boxSize * 0.1,
					strokeColor: '#BC002D',
					highlightColor: '#FF6B6B',
					drawingColor: isDark ? '#FFFFFF' : '#2C2C2C',
					showOutline: true,
					outlineColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)',
					drawingWidth: boxSize * 0.08,
					charDataLoader: () => Promise.resolve(charData)
				});
				tempWriters.push({ writer, box, char });
			} else {
				// Non-writable or CDN failed: show char as text
				const textNode = document.createElement('span');
				textNode.textContent = char;
				textNode.className = 'jp';
				textNode.style.zIndex = '1';
				box.appendChild(textNode);
				// Push a placeholder so index alignment is maintained
				tempWriters.push({ writer: null as any, box, char });
			}

			hanziContainer.appendChild(box);
		}

		writers = tempWriters;
		loadingWriters = false;
		startQuizSequence();
	}

	function updateCharProgress() {
		if (!sequential) return;
		// Update visual progress dots — injected by the Svelte template via bind
		charProgressEl?.querySelectorAll('.char-dot').forEach((dot, idx) => {
			const el = dot as HTMLElement;
			if (idx < currentQuizIndex) {
				el.dataset.state = 'done';
			} else if (idx === currentQuizIndex) {
				el.dataset.state = 'active';
			} else {
				el.dataset.state = 'pending';
			}
		});
	}

	let charProgressEl = $state<HTMLDivElement | null>(null);

	// Derived list of writable chars for progress dots
	const writableChars = $derived(card ? (Array.from(card.jp) as string[]).filter(isKanjiKana) : []);

	function startQuizSequence() {
		writers.forEach((w) => w.box && (w.box.style.borderColor = 'var(--ink-200)'));

		if (currentQuizIndex < writers.length) {
			const current = writers[currentQuizIndex];

			// In sequential mode: show only current box, hide others
			if (sequential) {
				writers.forEach((w, idx) => {
					if (w.box) w.box.style.display = idx === currentQuizIndex ? 'flex' : 'none';
				});
			}

			current.box.style.borderColor = 'var(--hinomaru-red)';
			updateCharProgress();

			if (!current.writer) {
				// Non-writable char — skip automatically
				currentQuizIndex++;
				startQuizSequence();
				return;
			}

			current.writer.quiz({
				onComplete: () => {
					current.box.style.borderColor = 'var(--success)';
					currentQuizIndex++;
					updateCharProgress();
					if (sequential && currentQuizIndex < writers.length) {
						// Brief pause before showing next char
						setTimeout(() => startQuizSequence(), 300);
					} else {
						startQuizSequence();
					}
				}
			});
		} else {
			checkAnswer();
		}
	}

	function clearCanvas() {
		if (currentQuizIndex < writers.length) {
			const current = writers[currentQuizIndex];
			if (!current.writer) return;
			current.writer.cancelQuiz();
			requestAnimationFrame(() => {
				current.writer.quiz({
					onComplete: () => {
						current.box.style.borderColor = 'var(--success)';
						currentQuizIndex++;
						updateCharProgress();
						if (sequential && currentQuizIndex < writers.length) {
							setTimeout(() => startQuizSequence(), 300);
						} else {
							startQuizSequence();
						}
					}
				});
			});
		}
	}

	onDestroy(() => {
		setupIteration++;
		if (hanziContainer) hanziContainer.innerHTML = '';
		writers = [];
	});

	function toggleGuide() {
		showGuide = !showGuide;
		writers.forEach((w) => {
			if (!w.writer) return;
			if (showGuide) w.writer.showOutline();
			else w.writer.hideOutline();
		});
	}

	function checkAnswer() {
		checked = true;
		showGuide = true;
		writers.forEach((w) => w.writer?.showOutline());
	}

	async function next(gotIt: boolean) {
		if (gotIt) {
			correctCount++;
		} else {
			quizCards = [...quizCards, quizCards[i]];
		}

		await updateCardProgress(card, gotIt, struggled);

		if (gotIt) {
			if (i >= quizCards.length - 1) {
				if (cardEl) {
					await animate(cardEl, { opacity: [1, 0], y: [0, -20] }, { duration: 0.3, ease: 'easeIn' })
						.finished;
				}
				await saveSession(correctCount, data.cards.length);
				const params = new URLSearchParams({
					correct: String(correctCount),
					total: String(data.cards.length),
					mode: 'write'
				});
				goto(`/deck/${data.deck.id}/summary?${params}`);
			} else {
				if (cardEl) {
					await animate(cardEl, { opacity: [1, 0], x: [0, -40] }, { duration: 0.2, ease: 'easeIn' })
						.finished;
					i++;
					struggled = false;
					await animate(
						cardEl,
						{ opacity: [0, 1], x: [40, 0] },
						{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }
					);
				} else {
					i++;
					struggled = false;
				}
			}
		} else {
			checked = false;
			struggled = true;
			setupWriters();
			if (cardEl) {
				animate(cardEl, { scale: [1, 0.98, 1] }, { duration: 0.3 });
			}
		}
	}

	async function updateCardProgress(
		c: { id: string; progress?: SRSState[] },
		gotIt: boolean,
		hadDifficulty: boolean = false
	) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;

		const currentProgress = c.progress && c.progress.length > 0 ? c.progress[0] : undefined;
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

	function playAudio() {
		speakJapanese(card?.jp ?? '');
	}
</script>

<div class="write-page">
	<SessionNav
		progress={pct}
		current={i + 1}
		total={quizCards.length}
		onClose={() => goto(`/deck/${data.deck.id}`)}
	/>

	{#if quizCards.length === 0}
		<div class="empty-state">
			<Icon icon={InboxIcon} size={48} color="var(--fg-tertiary)" strokeWidth={1.5} />
			<p>{t('home.empty', $locale)}</p>
			<a href="/deck/{data.deck.id}" class="hm-btn hm-btn-dark" style="text-decoration:none;">
				{t('deck.back', $locale)}
			</a>
		</div>
	{:else if card}
		<div class="card-wrapper" bind:this={cardEl}>
			<!-- Prompt -->
			<div class="prompt-row">
				<div class="prompt-group">
					<div class="prompt-label">{t('session.writeThis', $locale)}</div>
					<div class="prompt-meaning">
						{$locale === 'es' ? card.es : card.en}
					</div>
					{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
						<div class="prompt-romaji">{card.romaji}</div>
					{/if}
				</div>
				<button onclick={playAudio} class="audio-btn" aria-label="Play pronunciation">
					<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
				</button>
			</div>

			<!-- Writing area -->
			<div class="canvas-card">
				<!-- Toolbar -->
				<div class="canvas-toolbar">
					{#if sequential && writableChars.length > 0}
						<div class="char-progress" bind:this={charProgressEl}>
							{#each writableChars as ch, idx (idx)}
								<div
									class="char-dot"
									data-state={idx < currentQuizIndex
										? 'done'
										: idx === currentQuizIndex
											? 'active'
											: 'pending'}
								>
									<span class="char-dot-label jp">{ch}</span>
								</div>
							{/each}
						</div>
					{:else}
						<div></div>
					{/if}

					<div class="toolbar-actions">
						<button onclick={toggleGuide} class="toolbar-btn" aria-label="Toggle guide">
							<Icon
								icon={showGuide ? EyeIcon : ViewOffIcon}
								size={18}
								strokeWidth={1.8}
								color="var(--fg-secondary)"
							/>
						</button>
						<button onclick={clearCanvas} class="toolbar-btn" aria-label="Clear">
							<Icon icon={CleanIcon} size={18} strokeWidth={1.8} color="var(--fg-secondary)" />
						</button>
					</div>
				</div>

				{#if loadingWriters}
					<div class="loading-state">
						<DotLoader size={7} />
					</div>
				{/if}

				<div bind:this={hanziContainer} class="hanzi-container"></div>

				<!-- Example sentence after check -->
				{#if checked && card.example}
					<div class="example-box">
						<div class="example-inner">
							<div class="example-text">
								<div class="jp example-jp">{card.example}</div>
								{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
									<div class="example-romaji">
										{card.example_romaji || card.extra?.example_romaji || ''}
									</div>
								{/if}
								<div class="example-translation">
									{$locale === 'es' ? card.example_es : card.example_en}
								</div>
							</div>
							<button
								onclick={() => speakJapanese(card.example)}
								class="example-audio-btn"
								aria-label="Play example"
							>
								<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<StickyFooter>
			{#if !checked}
				<button class="hm-btn hm-btn-secondary" style="flex:1;opacity:0.45;pointer-events:none;">
					{t('session.finishDrawing', $locale)}
				</button>
			{:else}
				<button class="hm-btn hm-btn-secondary" onclick={() => next(false)} style="flex:1;">
					<Icon icon={Cancel01Icon} size={18} strokeWidth={2} />
					{t('session.again', $locale)}
				</button>
				<button class="hm-btn hm-btn-primary" onclick={() => next(true)} style="flex:1;">
					<Icon icon={CheckmarkCircle01Icon} size={18} strokeWidth={2} />
					{t('session.gotIt', $locale)}
				</button>
			{/if}
		</StickyFooter>
	{/if}
</div>

<style>
	.write-page {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background: var(--paper);
	}

	/* ── Empty state ── */
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 40px;
		text-align: center;
		color: var(--fg-secondary);
	}

	/* ── Card wrapper ── */
	.card-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16px 20px 140px;
		gap: 20px;
		max-width: 600px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
	}

	/* ── Prompt row ── */
	.prompt-row {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 16px;
	}

	.prompt-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.prompt-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
	}

	.prompt-meaning {
		font-size: 28px;
		font-weight: 700;
		color: var(--sumi);
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.prompt-romaji {
		font-size: 14px;
		color: var(--hinomaru-red);
		margin-top: 2px;
		font-weight: 500;
	}

	.audio-btn {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 18px;
		box-shadow: var(--shadow-sm);
		transition: transform 100ms ease;
		flex-shrink: 0;
		margin-top: 4px;
	}
	.audio-btn:active {
		transform: scale(0.9);
	}

	/* ── Canvas card ── */
	.canvas-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 16px;
		box-sizing: border-box;
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		min-height: 280px;
	}

	/* ── Toolbar ── */
	.canvas-toolbar {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.toolbar-actions {
		display: flex;
		gap: 8px;
	}

	.toolbar-btn {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: var(--ink-100);
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 150ms ease;
	}
	.toolbar-btn:hover {
		background: var(--ink-200);
	}
	.toolbar-btn:active {
		background: var(--ink-300);
	}

	/* ── Character progress (sequential mode) ── */
	.char-progress {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}

	.char-dot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: var(--ink-100);
		border: 1.5px solid var(--ink-200);
		transition: all 200ms ease;
	}

	.char-dot[data-state='active'] {
		background: rgba(188, 0, 45, 0.08);
		border-color: var(--hinomaru-red);
	}

	.char-dot[data-state='done'] {
		background: var(--success-wash);
		border-color: var(--success);
	}

	.char-dot-label {
		font-size: 16px;
		color: var(--fg-secondary);
		line-height: 1;
	}

	.char-dot[data-state='active'] .char-dot-label {
		color: var(--hinomaru-red);
		font-weight: 700;
	}

	.char-dot[data-state='done'] .char-dot-label {
		color: var(--success);
	}

	/* ── Loading ── */
	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: auto;
	}

	/* ── Hanzi container ── */
	.hanzi-container {
		touch-action: none;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}

	/* ── Example box ── */
	.example-box {
		width: 100%;
		padding: 14px 16px;
		border-radius: 16px;
		background: var(--ink-100);
		border: 1px solid var(--ink-200);
	}

	.example-inner {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.example-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.example-jp {
		font-size: 15px;
		line-height: 1.4;
		color: var(--sumi);
	}

	.example-romaji {
		font-size: 11px;
		color: var(--hinomaru-red);
		opacity: 0.85;
		font-weight: 600;
	}

	.example-translation {
		font-size: 12px;
		color: var(--fg-secondary);
	}

	.example-audio-btn {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px solid var(--ink-200);
		background: var(--bg-surface);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		flex-shrink: 0;
		color: var(--fg-tertiary);
	}

	/* ── Footer buttons ── */
	:global(.hm-btn) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
</style>
