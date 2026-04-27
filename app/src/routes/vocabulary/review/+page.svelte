<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { onMount, untrack } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { animate } from 'motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { addXP } from '$lib/utils/gamification';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { getWordMetadata } from '$lib/utils/vocab_registry';
	import confetti from 'canvas-confetti';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const words = $derived(data.words as any[]);
	const supabase = createClient();

	let i = $state(0);
	let flipped = $state(false);
	let struggled = $state(false);
	let finishing = $state(false);
	let cardEl = $state<HTMLDivElement | null>(null);

	const word = $derived(words[i]);
	const meta = $derived(word ? getWordMetadata(word.jp) : null);
	const pct = $derived(words.length > 0 ? ((i + 1) / words.length) * 100 : 0);

	onMount(() => {
		if (cardEl) {
			animate(
				cardEl,
				{ opacity: [0, 1], y: [24, 0], scale: [0.97, 1] },
				{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }
			);
		}
		// Initial speak
		if (word) speak(word.jp);
	});

	// Auto-speak when word changes
	$effect(() => {
		if (word && i >= 0) {
			untrack(() => speak(word.jp));
		}
	});

	function speak(text: string) {
		speakJapanese(text);
	}

	async function updateWordProgress(w: any, gotIt: boolean, hadDifficulty: boolean = false) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;

		const currentSRS = {
			repetitions: w.repetitions || 0,
			easiness: w.easiness || 2.5,
			interval_days: w.interval_days || 0,
			next_review: w.next_review
		};

		const quality = mapPerformanceToQuality(gotIt, hadDifficulty);
		const nextState = calculateNextReview(quality, currentSRS);

		await supabase
			.from('user_saved_words')
			.update({
				...nextState,
				last_seen: new Date().toISOString()
			})
			.eq('id', w.id);
	}

	async function next(gotIt: boolean) {
		if (gotIt) playCorrect();
		updateWordProgress(word, gotIt, struggled);
		
		flipped = false;

		if (i >= words.length - 1) {
			finishing = true;
			playFinish();
			if (cardEl) {
				animate(cardEl, { opacity: [1, 0], y: [0, -20] }, { duration: 0.25, ease: 'easeIn' });
			}
			confetti({
				particleCount: 60,
				angle: 60,
				spread: 65,
				startVelocity: 55,
				decay: 0.88,
				gravity: 1.1,
				origin: { x: 0, y: 1 },
				colors: ['#BC002D', '#1A1A1A', '#F9F8F6', '#D4A574', '#E8C547'],
				scalar: 0.9
			});
			setTimeout(() => confetti({
				particleCount: 60,
				angle: 120,
				spread: 65,
				startVelocity: 55,
				decay: 0.88,
				gravity: 1.1,
				origin: { x: 1, y: 1 },
				colors: ['#BC002D', '#1A1A1A', '#F9F8F6', '#D4A574', '#E8C547'],
				scalar: 0.9
			}), 80);
			saveSession();
			setTimeout(() => goto('/vocabulary'), 1500);
		} else {
			if (cardEl) {
				const dir = gotIt ? -1 : 1;
				await animate(
					cardEl,
					{ opacity: [1, 0], x: [0, dir * 40] },
					{ duration: 0.2, ease: 'easeIn' }
				).finished;
				i++;
				flipped = false;
				struggled = false;
				await animate(
					cardEl,
					{ opacity: [0, 1], x: [dir * -40, 0] },
					{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }
				);
			} else {
				i++;
				flipped = false;
				struggled = false;
			}
		}
	}

	async function retry() {
		struggled = true;
		playWrong();
		flipped = false;
		if (cardEl) {
			animate(cardEl, { scale: [1, 0.98, 1] }, { duration: 0.3 });
		}
	}

	async function saveSession() {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;

		await supabase.from('sessions').insert({
			user_id: user.id,
			mode: 'vocabulary_review',
			correct: words.length, // All words in a review session are considered "completed"
			total: words.length
		});

		await updateStreak(supabase, user.id);
		await addXP(supabase, user.id, 15);
	}
</script>

<div style="display:flex;flex-direction:column;min-height:100dvh;background:var(--paper);">
	<SessionNav
		progress={pct}
		current={i + 1}
		total={words.length}
		onClose={() => goto('/vocabulary')}
	/>

	{#if words.length === 0}
		<div
			style="min-height:100dvh;background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;"
		>
			<div style="font-size:48px;margin-bottom:16px;">✨</div>
			<h2 style="font-size:24px;font-weight:800;margin:0 0 8px;">{t('home.complete', $locale)}</h2>
			<p style="color:var(--fg-secondary);margin-bottom:24px;">{t('summary.all', $locale)}</p>
			<a href="/vocabulary" class="hm-btn hm-btn-dark">{t('deck.back', $locale)}</a>
		</div>
	{:else if word}
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;padding:16px 24px 140px;gap:24px;max-width:600px;margin:0 auto;width:100%;box-sizing:border-box;"
		>
			<!-- Header based on image -->
			<div style="text-align:center; margin-bottom: 8px;">
				<h1 style="font-size: 20px; font-weight: 800; color: var(--sumi); margin: 0 0 4px;">
					{($locale === 'es' ? word.category_es : word.category) || t('nav.vocabulary', $locale)}
				</h1>
				<div style="font-size: 14px; color: var(--fg-tertiary); font-weight: 600;">
					{String(i + 1).padStart(2, '0')}/{String(words.length).padStart(2, '0')} {t('home.cards', $locale).toLowerCase()}
				</div>
			</div>

			<!-- Card with 3D flip -->
			<div
				bind:this={cardEl}
				class="card-scene"
				style="width:100%;max-width:380px;aspect-ratio:3/4.2;"
				onclick={() => (flipped = !flipped)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === ' ' && (flipped = !flipped)}
			>
				<div 
					class="card-body" 
					class:flipped 
					style="--cat-color: var(--cat-{meta?.category?.toLowerCase() || 'general'})"
				>
					<!-- Front -->
					<div class="card-face">
						<div class="cat-indicator" style="background: var(--cat-color, var(--hinomaru-red));"></div>
						<div class="jp" style="font-size:72px;line-height:1.1;font-weight:700;">{word.jp}</div>
						<div style="margin-top:32px;font-size:12px;color:var(--fg-tertiary);letter-spacing:0.05em;text-transform:uppercase;font-weight:700;">
							{t('session.flip', $locale)}
						</div>
					</div>

					<!-- Back -->
					<div class="card-face back" style="align-items: flex-start; text-align: left; padding: 40px 32px; justify-content: flex-start;">
						<div style="width:100%;">
							<div style="display:flex; align-items: baseline; gap: 12px; margin-bottom: 4px;">
								<div class="jp" style="font-size:40px;font-weight:700;color:var(--sumi);line-height:1;">{word.jp}</div>
								<button
									onclick={(e) => {
										e.stopPropagation();
										speak(word.jp);
									}}
									class="audio-icon-btn"
								>
									<Icon icon={VolumeHighIcon} size={20} color="currentColor" strokeWidth={1.5} />
								</button>
							</div>
							
							<div style="display:flex; align-items: center; gap: 8px; margin-bottom: 24px;">
								{#if word.pos}
									<div style="font-style: italic; color: var(--fg-tertiary); font-size: 16px; font-family: var(--font-ui);">
										{word.pos_es || word.pos}
									</div>
								{/if}
								<div style="color: var(--fg-tertiary); font-size: 16px;">
									[ {word.romaji || kanaToRomaji(word.kana)} ]
								</div>
							</div>

							<div style="margin-bottom: 32px;">
								{#if word.definitions_en || word.definitions_es}
									{@const defs = $locale === 'es' ? word.definitions_es || [word.es] : word.definitions_en || [word.en]}
									<div style="display:flex; flex-direction: column; gap: 12px;">
										{#each defs as def, idx}
											<div style="display:flex; gap:12px; line-height: 1.5; font-size: 16px;">
												<span style="color: var(--fg-tertiary); font-weight: 700; flex-shrink: 0;">{idx + 1}.</span>
												<span style="color: var(--sumi);">{def}</span>
											</div>
										{/each}
									</div>
								{:else}
									<div style="font-size: 18px; line-height: 1.5; color: var(--sumi);">
										{$locale === 'es' ? word.es : word.en}
									</div>
								{/if}
							</div>

							{#if word.example}
								<div style="border-top: 1px solid var(--ink-100); padding-top: 24px;">
									<div style="display:flex; gap: 8px; align-items: flex-start; margin-bottom: 8px;">
										<div class="jp" style="font-size:16px; line-height:1.6; color: var(--fg-secondary); flex: 1;">
											{word.example}
										</div>
										<button
											onclick={(e) => {
												e.stopPropagation();
												speak(word.example);
											}}
											class="audio-icon-btn small"
										>
											<Icon icon={VolumeHighIcon} size={16} color="currentColor" strokeWidth={1.5} />
										</button>
									</div>
									<div style="font-size:14px; color: var(--fg-tertiary); line-height:1.5;">
										{$locale === 'es' ? word.example_es : word.example_en}
									</div>
								</div>
							{/if}
						</div>

						<div
							style="margin-top:auto; width: 100%; display:flex; justify-content:space-between; align-items:center;"
						>
							<div
								style="font-size:10px;font-weight:800;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:0.1em; background: var(--ink-100); padding: 4px 10px; border-radius: 99px;"
							>
								SRS LVL {word.repetitions || 0}
							</div>
						</div>
					</div>
				</div>
			</div>

			{#if !finishing}
				<div style="position: fixed; bottom: 40px; left: 0; right: 0; display: flex; justify-content: center; gap: 20px; z-index: 100;">
					<!-- Image-style buttons -->
					<button
						class="action-round-btn again"
						onclick={retry}
						title={t('session.again', $locale)}
					>
						✕
					</button>

					<button
						class="action-round-btn main {flipped ? 'got-it' : 'flip'}"
						onclick={() => (flipped ? next(true) : (flipped = true))}
					>
						{#if flipped}
							✓
						{:else}
							<div style="font-size: 16px; font-weight: 800;">{t('session.flip', $locale).toUpperCase()}</div>
						{/if}
					</button>

					<button
						class="action-round-btn next"
						onclick={() => next(false)}
						title="Skip"
					>
						→
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.vocab-primary-btn:hover {
		box-shadow: 0 4px 20px rgba(188, 0, 45, 0.3);
	}

	.audio-icon-btn {
		background: none;
		border: none;
		color: var(--fg-tertiary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		transition: color 0.2s;
	}
	.audio-icon-btn:hover {
		color: var(--sumi);
	}
	.audio-icon-btn.small {
		padding: 2px;
	}

	.action-round-btn {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s var(--ease-brand);
		box-shadow: var(--shadow-md);
		-webkit-tap-highlight-color: transparent;
	}

	.action-round-btn:active {
		transform: scale(0.92);
	}

	.action-round-btn.again {
		background: #fdf2f2;
		color: #ef4444;
		width: 56px;
		height: 56px;
		font-size: 20px;
	}

	.action-round-btn.next {
		background: #f0fdf4;
		color: #22c55e;
		width: 56px;
		height: 56px;
		font-size: 20px;
	}

	.action-round-btn.main {
		width: 80px;
		height: 80px;
		background: #f2f2f1;
		color: var(--sumi);
	}

	.action-round-btn.main.got-it {
		background: #22c55e;
		color: white;
	}

	.action-round-btn.main.flip {
		background: #f2f2f1;
		color: var(--sumi);
	}

	.cat-indicator {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 8px;
	}

	.card-face {
		overflow: hidden;
	}

	:global(.touch-action-manip) {
		touch-action: manipulation;
	}
</style>
