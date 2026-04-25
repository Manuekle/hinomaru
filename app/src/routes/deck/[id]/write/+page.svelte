<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { animate } from 'motion/mini';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import Mascot from '$lib/components/Mascot.svelte';
	import type { PageData } from './$types';
	
	interface HanziWriterInstance {
		quiz: (options?: any) => void;
		cancelQuiz: () => void;
		showOutline: () => void;
		hideOutline: () => void;
	}

	let { data } = $props<{ data: PageData }>();
	let quizCards = $state([...data.cards]);
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
	let writers = $state<{ writer: HanziWriterInstance; box: HTMLDivElement }[]>([]);
	let currentQuizIndex = $state(0);
	let loadingWriters = $state(true);
	let setupIteration = 0;

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
			return;
		}

		if (iteration !== setupIteration) return;

		const chars = Array.from(card.jp);
		
		// Responsive box size
		const containerWidth = hanziContainer?.clientWidth || 320;
		const gap = 12;
		let boxSize: number;
		
		if (chars.length === 1) {
			boxSize = Math.min(320, containerWidth);
		} else if (chars.length === 2) {
			boxSize = Math.min(220, (containerWidth - gap) / 2);
		} else if (chars.length === 3) {
			boxSize = Math.min(160, (containerWidth - gap * 2) / 3);
		} else {
			boxSize = Math.min(120, (containerWidth - gap * 2) / 3);
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

		// Fetch all data in parallel
		const charDataResults = await Promise.all(
			chars.map(async (char) => {
				const code = char.codePointAt(0)!;
				const isKanjiKana =
					(code >= 0x4e00 && code <= 0x9faf) ||
					(code >= 0x3040 && code <= 0x309f) ||
					(code >= 0x30a0 && code <= 0x30ff);

				if (!isKanjiKana) return { char, data: null };
				const charData = await fetchCharData(char, code);
				if (!charData) console.warn('All CDNs failed for char:', char);
				return { char, data: charData };
			})
		);

		if (iteration !== setupIteration) return;
		if (!hanziContainer) return;

		const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
		const tempWriters: { writer: HanziWriterInstance; box: HTMLDivElement }[] = [];

		for (const { char, data } of charDataResults) {
			const box = document.createElement('div');
			box.style.width = `${boxSize}px`;
			box.style.height = `${boxSize}px`;
			box.style.display = 'flex';
			box.style.alignItems = 'center';
			box.style.justifyContent = 'center';
			box.style.fontSize = `${boxSize * 0.6}px`;
			box.style.color = 'var(--sumi)';
			box.style.position = 'relative';
			box.style.background = 'var(--ink-100)';
			box.style.border = '2px dashed var(--ink-200)';
			box.style.borderRadius = '16px';
			box.style.overflow = 'hidden';
			box.style.cursor = 'crosshair';

			// Draw grid lines
			const hLine = document.createElement('div');
			hLine.className = 'grid-line h-line';
			hLine.style.position = 'absolute';
			hLine.style.top = '50%';
			hLine.style.left = '0';
			hLine.style.right = '0';
			hLine.style.height = '1px';
			hLine.style.background = 'var(--ink-300)';
			hLine.style.pointerEvents = 'none';
			const vLine = document.createElement('div');
			vLine.className = 'grid-line v-line';
			vLine.style.position = 'absolute';
			vLine.style.left = '50%';
			vLine.style.top = '0';
			vLine.style.bottom = '0';
			vLine.style.width = '1px';
			vLine.style.background = 'var(--ink-300)';
			vLine.style.pointerEvents = 'none';

			box.appendChild(hLine);
			box.appendChild(vLine);

			if (data) {
				const writerContainer = document.createElement('div');
				writerContainer.style.width = '100%';
				writerContainer.style.height = '100%';
				writerContainer.style.position = 'absolute';
				writerContainer.style.top = '0';
				writerContainer.style.left = '0';
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
					charDataLoader: () => Promise.resolve(data)
				});
				tempWriters.push({ writer, box });
			} else {
				const textNode = document.createElement('span');
				textNode.textContent = char;
				textNode.className = 'jp';
				textNode.style.zIndex = '1';
				box.appendChild(textNode);
			}

			hanziContainer.appendChild(box);
		}

		writers = tempWriters;
		loadingWriters = false;
		startQuizSequence();
	}

	function startQuizSequence() {
		writers.forEach((w) => (w.box.style.borderColor = 'var(--ink-200)'));

		if (currentQuizIndex < writers.length) {
			const current = writers[currentQuizIndex];
			current.box.style.borderColor = 'var(--hinomaru-red)'; // Highlight current box

			current.writer.quiz({
				onComplete: () => {
					current.box.style.borderColor = 'var(--success)'; // Green when complete
					currentQuizIndex++;
					startQuizSequence();
				}
			});
		} else {
			checkAnswer();
		}
	}

	function clearCanvas() {
		if (currentQuizIndex < writers.length) {
			const current = writers[currentQuizIndex];
			current.writer.cancelQuiz();
			requestAnimationFrame(() => {
				current.writer.quiz({
					onComplete: () => {
						current.box.style.borderColor = 'var(--success)';
						currentQuizIndex++;
						startQuizSequence();
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
			if (showGuide) w.writer.showOutline();
			else w.writer.hideOutline();
		});
	}

	function checkAnswer() {
		checked = true;
		showGuide = true;
		writers.forEach((w) => w.writer.showOutline());
	}

	async function next(gotIt: boolean) {
		if (gotIt) {
			correctCount++;
		} else {
			// Re-add card to the end of the deck so they must practice it again later
			quizCards = [...quizCards, quizCards[i]];
		}

		// Save progress for this specific card
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
					await animate(
						cardEl,
						{ opacity: [1, 0], x: [0, -40] },
						{ duration: 0.2, ease: 'easeIn' }
					).finished;
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
			// "Again" - Reset current card state immediately
			checked = false;
			struggled = true;
			setupWriters();
			if (cardEl) {
				animate(cardEl, { scale: [1, 0.98, 1] }, { duration: 0.3 });
			}
		}
	}

	async function updateCardProgress(c: { id: string; progress?: unknown[] }, gotIt: boolean, hadDifficulty: boolean = false) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;

		// Get current SRS state from card data (loaded via join)
		// card.progress is an array due to Supabase join
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
	}

	function playAudio() {
		speakJapanese(card?.jp ?? '');
	}
</script>

<div style="display:flex;flex-direction:column;min-height:100dvh;background:var(--paper);">
	<SessionNav 
		progress={pct} 
		current={i + 1} 
		total={quizCards.length} 
		onClose={() => goto(`/deck/${data.deck.id}`)}
	/>

	{#if quizCards.length === 0}
		<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;">
			<div style="font-size:48px;margin-bottom:16px;">📭</div>
			<p style="color:var(--fg-secondary);">{t('home.empty', $locale)}</p>
			<a href="/deck/{data.deck.id}" class="hm-btn hm-btn-dark" style="text-decoration:none;">{t('deck.back', $locale)}</a>
		</div>
	{:else if card}
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;padding:16px 24px 140px;gap:24px;max-width:600px;margin:0 auto;width:100%;box-sizing:border-box;"
		>
			<div
				bind:this={cardEl}
				style="width:100%;display:flex;flex-direction:column;align-items:center;position:relative;"
			>
				<div
					class="label-meta"
					style="margin-bottom:12px;color:var(--fg-tertiary);letter-spacing:0.05em;"
				>
					{t('session.writeThis', $locale)}
				</div>

				<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
					<div
						style="font-size:32px;font-weight:700;color:var(--sumi);text-align:center;line-height:1;"
					>
						{$locale === 'es' ? card.es : card.en}
					</div>
					<button
						onclick={playAudio}
						aria-label="Play pronunciation"
						style="width:44px;height:44px;border-radius:50%;background:var(--bg-surface);border:1px solid var(--ink-200);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--sumi);box-shadow:var(--shadow-sm);transition:transform 100ms ease;"
						onmousedown={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(0.92)')}
						onmouseup={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
						onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
					>
						🔊
					</button>
				</div>

				{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
					<div style="font-size:16px;color:var(--fg-tertiary);margin-bottom:24px;">
						{card.romaji}
					</div>
				{/if}

				<div
					style="position:relative;width:100%;background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:16px;box-sizing:border-box;touch-action:none;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;align-items:center;min-height:280px;"
				>
					<!-- Header actions -->
					<div style="width:100%;display:flex;justify-content:flex-end;gap:8px;margin-bottom:16px;">
						<button
							onclick={toggleGuide}
							class="touch-action-manip"
							style="padding:6px 14px;border-radius:99px;background:var(--bg-surface);border:1px solid var(--ink-200);font-size:13px;font-weight:600;color:var(--sumi);cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.02);"
						>
							{showGuide ? t('session.hideGuide', $locale) : t('session.showGuide', $locale)}
						</button>
						<button
							onclick={clearCanvas}
							style="width:40px;height:40px;border-radius:50%;background:var(--bg-surface);border:1px solid var(--ink-200);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--sumi);box-shadow:0 2px 4px rgba(0,0,0,0.02);"
						>
							🧹
						</button>
					</div>

					<!-- HanziWriter Container -->
					{#if loadingWriters}
						<div style="margin:auto; display:flex; flex-direction:column; align-items:center;">
							<Mascot mood="thinking" message={t('session.loadingStroke', $locale)} position="center" size={140} />
						</div>
					{/if}

					<div
						bind:this={hanziContainer}
						style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;"
					>
						<!-- Writers injected here -->
					</div>

					{#if checked && card.example}
						<div 
							style="margin-top:24px;padding:16px;border-radius:16px;background:var(--ink-100);
								   border:1px solid var(--ink-200);width:100%;display:flex;flex-direction:column;gap:8px;"
						>
							<div style="display:flex;align-items:flex-start;gap:8px;">
								<div style="flex:1;">
									<div class="jp" style="font-size:15px;line-height:1.4;color:var(--sumi);">{card.example}</div>
									{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
										<div style="font-size:11px;color:var(--hinomaru-red-ink);opacity:0.7;margin-top:2px;font-weight:600;">
											{card.example_romaji || card.extra?.example_romaji || ''}
										</div>
									{/if}
									<div style="font-size:12px;color:var(--fg-secondary);margin-top:4px;">
										{$locale === 'es' ? card.example_es : card.example_en}
									</div>
								</div>
								<button
									onclick={() => speakJapanese(card.example)}
									style="width:28px;height:28px;border-radius:50%;border:1px solid var(--ink-200);
										   background:var(--bg-surface);cursor:pointer;display:flex;align-items:center;
										   justify-content:center;font-size:12px;color:var(--fg-tertiary);flex-shrink:0;"
								>
									🔊
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<StickyFooter>
				{#if !checked}
					<button class="hm-btn hm-btn-secondary" style="flex:1;opacity:0.5;pointer-events:none;">
						{t('session.finishDrawing', $locale)}
					</button>
				{:else}
					<button
						class="hm-btn hm-btn-secondary touch-action-manip"
						onclick={() => next(false)}
						style="flex:1; transition:transform 100ms ease, box-shadow 150ms ease;"
						onmouseenter={(e) =>
							((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)')}
						onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '')}
					>
						✕ {t('session.again', $locale)}
					</button>
					<button
						class="hm-btn hm-btn-primary touch-action-manip"
						onclick={() => next(true)}
						style="flex:1; transition:transform 100ms ease, box-shadow 150ms ease;"
						onmouseenter={(e) =>
							((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(188,0,45,0.30)')}
						onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '')}
					>
						✓ {t('session.gotIt', $locale)}
					</button>
				{/if}
			</StickyFooter>
		</div>
	{/if}
</div>
