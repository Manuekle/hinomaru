<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { theme } from '$lib/stores/theme';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { animate } from 'motion/mini';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let quizCards = $state([...(data.cards as any[])]);
	const supabase = createClient();

	let i = $state(0);
	let correctCount = $state(0);
	let cardEl = $state<HTMLDivElement | null>(null);

	const card = $derived(quizCards[i]);
	const pct = $derived(((i + 1) / quizCards.length) * 100);

	let checked = $state(false);
	let showGuide = $state(true);

	let hanziContainer = $state<HTMLDivElement | null>(null);
	let writers = $state<{ writer: any; box: HTMLDivElement }[]>([]);
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

		// Determine size based on char count
		let boxSize = 320;
		if (chars.length === 2) boxSize = 220;
		else if (chars.length === 3) boxSize = 160;
		else if (chars.length > 3) boxSize = 120;

		// Fetch all data in parallel
		const charDataResults = await Promise.all(
			chars.map(async (char) => {
				const code = char.charCodeAt(0);
				const isKanjiKana =
					(code >= 0x4e00 && code <= 0x9faf) ||
					(code >= 0x3040 && code <= 0x309f) ||
					(code >= 0x30a0 && code <= 0x30ff);

				if (!isKanjiKana) return { char, data: null };

				try {
					let res;
					if (code >= 0x3040 && code <= 0x30ff) {
						// Hiragana / Katakana → kana-json CDN
						res = await fetch(
							`https://raw.githubusercontent.com/ailectra/kana-json/main/data/${encodeURIComponent(char)}.json`
						);
					} else {
						// Kanji (CJK) → official hanzi-writer-data package
						res = await fetch(
							`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(char)}.json`
						);
					}
					if (res.ok) return { char, data: await res.json() };
				} catch (err) {
					console.warn('Failed to load stroke data for', char);
				}
				return { char, data: null };
			})
		);

		if (iteration !== setupIteration) return;
		if (!hanziContainer) return;

		const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
		const tempWriters: { writer: any; box: HTMLDivElement }[] = [];

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
			current.writer.quiz({
				onComplete: () => {
					current.box.style.borderColor = 'var(--success)';
					currentQuizIndex++;
					startQuizSequence();
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

	function checkAnswer() {
		checked = true;
		showGuide = true;
		writers.forEach((w) => w.writer.showOutline());
	}

	async function next(gotIt: boolean) {
		if (gotIt) {
			correctCount++;
		} else {
			// Re-add card to the end of the deck so they must practice it again
			quizCards = [...quizCards, quizCards[i]];
		}

		// Save progress for this specific card
		await updateCardProgress(card, gotIt);

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
				const dir = gotIt ? -1 : 1;
				await animate(
					cardEl,
					{ opacity: [1, 0], x: [0, dir * 40] },
					{ duration: 0.2, ease: 'easeIn' }
				).finished;
				i++;
				await animate(
					cardEl,
					{ opacity: [0, 1], x: [dir * -40, 0] },
					{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }
				);
			} else {
				i++;
			}
		}
	}

	async function updateCardProgress(c: any, gotIt: boolean) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;

		// Get current SRS state from card data (loaded via join)
		// card.progress is an array due to Supabase join
		const currentProgress = c.progress && c.progress.length > 0 ? c.progress[0] : null;

		const quality = mapPerformanceToQuality(gotIt);
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
	<div style="padding-top:env(safe-area-inset-top);background:var(--bg-surface);">
	<div class="session-topbar">
		<div
			class="session-topbar-fill"
			style="width:{pct}%;transition:width 400ms cubic-bezier(0.22,1,0.36,1);"
		></div>
	</div>
	</div>

	<div style="padding:12px 20px;display:flex;justify-content:space-between;align-items:center;">
		<a
			href="/deck/{data.deck.id}"
			class="touch-action-manip"
			style="color:var(--fg-secondary);text-decoration:none;font-size:22px;line-height:1;transition:color 150ms ease;min-width:44px;min-height:44px;display:flex;align-items:center;"
			onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--sumi)')}
			onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-secondary)')}
			>✕</a
		>
		<div style="font-size:14px;font-weight:600;color:var(--sumi);font-family:var(--font-ui);">
			{i + 1} / {quizCards.length}
		</div>
		<div style="width:44px;"></div>
	</div>

	{#if quizCards.length === 0}
		<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;">
			<div style="font-size:48px;margin-bottom:16px;">📭</div>
			<p style="color:var(--fg-secondary);">{t('home.empty', $locale)}</p>
			<a href="/deck/{data.deck.id}" class="hm-btn hm-btn-dark" style="text-decoration:none;">{t('deck.back', $locale)}</a>
		</div>
	{:else if card}
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;padding:16px 24px 32px;gap:24px;max-width:600px;margin:0 auto;width:100%;box-sizing:border-box;"
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
						style="width:36px;height:36px;border-radius:50%;background:var(--bg-surface);border:1px solid var(--ink-200);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--sumi);box-shadow:var(--shadow-sm);transition:transform 100ms ease;"
						onmousedown={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(0.92)')}
						onmouseup={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
						onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
							<path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
							<path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
						</svg>
					</button>
				</div>

				{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
					<div style="font-size:16px;color:var(--fg-tertiary);margin-bottom:24px;">
						{card.romaji}
					</div>
				{/if}

				<div
					style="position:relative;width:100%;background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:24px;box-sizing:border-box;touch-action:none;box-shadow:var(--shadow-sm);display:flex;flex-direction:column;align-items:center;min-height:240px;"
				>
					<!-- Guide toggle and clear -->
					<div style="position:absolute;top:16px;right:16px;z-index:10;display:flex;gap:8px;">
						<button
							onclick={toggleGuide}
							class="touch-action-manip"
							style="padding:6px 14px;border-radius:99px;background:var(--bg-surface);border:1px solid var(--ink-200);font-size:13px;font-weight:600;color:var(--sumi);cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.02);"
						>
							{showGuide ? t('session.hideGuide', $locale) : t('session.showGuide', $locale)}
						</button>
						<button
							onclick={clearCanvas}
							style="width:32px;height:32px;border-radius:50%;background:var(--bg-surface);border:1px solid var(--ink-200);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--sumi);box-shadow:0 2px 4px rgba(0,0,0,0.02);"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20"
								></path>
							</svg>
						</button>
					</div>

					<!-- HanziWriter Container -->
					{#if loadingWriters}
						<div
							style="margin:auto;color:var(--fg-tertiary);font-size:14px;display:flex;align-items:center;gap:8px;"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								style="animation: spin 1s linear infinite;"
								><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg
							>
							{t('session.loadingStroke', $locale)}
						</div>
						<style>
							@keyframes spin {
								100% {
									transform: rotate(360deg);
								}
							}
						</style>
					{/if}

					<div
						bind:this={hanziContainer}
						style="display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:32px;"
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

			<!-- Action buttons -->
			<div style="display:flex;gap:12px;width:100%;max-width:440px;margin-top:auto;padding-bottom:calc(16px + env(safe-area-inset-bottom));">
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
			</div>
		</div>
	{/if}
</div>
