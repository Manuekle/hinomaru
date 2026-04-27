<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { animate } from 'motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const cards = $derived(data.cards as any[]);
	const supabase = createClient();

	let i = $state(0);
	let flipped = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let cardEl = $state<HTMLDivElement | null>(null);

	const card = $derived(cards[i]);
	const pct = $derived(((i + 1) / cards.length) * 100);

	// Animate card in on mount
	onMount(() => {
		if (cardEl) {
			animate(
				cardEl,
				{ opacity: [0, 1], y: [24, 0], scale: [0.97, 1] },
				{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }
			);
		}
	});

	function speak(text: string) {
		speakJapanese(text);
	}

	async function updateCardProgress(c: any, gotIt: boolean, hadDifficulty: boolean = false) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;
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

	async function next(gotIt: boolean) {
		if (gotIt) {
			correct++;
			playCorrect();
		}
		flipped = false;

		updateCardProgress(card, gotIt, struggled);

		if (i >= cards.length - 1) {
			const params = new URLSearchParams({
				correct: String(correct),
				total: String(cards.length),
				mode: 'flashcards'
			});
			if (cardEl) {
				animate(cardEl, { opacity: [1, 0], y: [0, -20] }, { duration: 0.25, ease: 'easeIn' });
			}
			goto(`/deck/${data.deck.id}/summary?${params}`);
			saveSession(correct, cards.length);
		} else {
			// Slide out current, slide in next
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

	async function saveSession(c: number, total: number) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;
		await supabase
			.from('sessions')
			.insert({ user_id: user.id, deck_id: data.deck.id, mode: 'flashcards', correct: c, total });
		await updateStreak(supabase, user.id);
	}
</script>

<div style="display:flex;flex-direction:column;min-height:100dvh;background:var(--paper);">
	<SessionNav
		progress={pct}
		current={i + 1}
		total={cards.length}
		onClose={() => goto(`/deck/${data.deck.id}`)}
	/>

	{#if data.cards.length === 0}
		<div
			style="min-height:100dvh;background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top)) 24px 140px;position:relative;overflow:hidden;"
		>
			<div style="font-size:48px;margin-bottom:16px;">📭</div>
			<p style="color:var(--fg-secondary);">{t('home.empty', $locale)}</p>
			<a href="/deck/{data.deck.id}" class="hm-btn hm-btn-dark">{t('deck.back', $locale)}</a>
		</div>
	{:else if card}
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;padding:32px 24px 140px;gap:32px;max-width:600px;margin:0 auto;width:100%;box-sizing:border-box;"
		>
			<!-- Card with 3D flip -->
			<div
				bind:this={cardEl}
				class="card-scene"
				style="width:100%;max-width:360px;aspect-ratio:3/4;"
				onclick={() => (flipped = !flipped)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === ' ' && (flipped = !flipped)}
			>
				<div class="card-body" class:flipped>
					<!-- Front -->
					<div class="card-face">
						<div style="position:absolute;top:24px;left:24px;" class="label-meta">
							{$locale === 'es' ? (data.deck.kind_es ?? data.deck.kind) : data.deck.kind}
						</div>
						<div class="jp" style="font-size:96px;line-height:1;">{card.jp}</div>
						<button
							onclick={(e) => {
								e.stopPropagation();
								speak(card.jp);
							}}
							class="audio-btn"
						>
							<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
						</button>
						<div style="margin-top:16px;font-size:12px;color:var(--fg-tertiary);">
							{t('session.flip', $locale)}
						</div>
					</div>
					<!-- Back -->
					<div class="card-face back">
						<div
							style="font-size:36px;font-weight:700;letter-spacing:-0.02em;color:var(--sumi);line-height:1;"
						>
							{$locale === 'es' ? card.es : card.en}
						</div>
						{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
							<div class="romaji" style="margin-top:8px;">{card.romaji}</div>
						{/if}
						<div
							style="margin-top:20px;padding-top:20px;border-top:1px solid var(--ink-200);width:90%;text-align:center;position:relative;"
						>
							<div style="display:flex;align-items:center;justify-content:center;gap:8px;">
								<div class="jp" style="font-size:17px;line-height:1.4;">{card.example}</div>
								<button
									onclick={(e) => {
										e.stopPropagation();
										speak(card.example);
									}}
									class="audio-btn audio-btn-sm"
								>
									<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
								</button>
							</div>

							{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
								<div
									style="font-size:11px;color:var(--hinomaru-red-ink);opacity:0.8;margin-top:2px;font-weight:600;letter-spacing:0.02em;"
								>
									{card.example_romaji || card.extra?.example_romaji || ''}
								</div>
							{/if}

							<div style="font-size:13px;color:var(--fg-secondary);margin-top:6px;line-height:1.4;">
								{$locale === 'es' ? card.example_es : card.example_en}
							</div>
						</div>
					</div>
				</div>
			</div>

			<StickyFooter>
				{#if flipped}
					<button
						class="hm-btn hm-btn-secondary touch-action-manip"
						onclick={retry}
						style="flex:1;"
					>
						✕ {t('session.again', $locale)}
					</button>
				{/if}
				<button
					class="hm-btn hm-btn-primary {flipped ? '' : 'hm-btn-full'} touch-action-manip flash-primary-btn"
					onclick={() => (flipped ? next(true) : (flipped = true))}
					style="flex:1;"
				>
					{flipped ? `✓ ${t('session.gotIt', $locale)}` : t('session.flip', $locale)}
				</button>
			</StickyFooter>
		</div>
	{/if}
</div>

<style>
	.flash-primary-btn:hover {
		box-shadow: 0 4px 20px rgba(188, 0, 45, 0.3);
	}

	.audio-btn {
		margin-top: 20px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid var(--ink-200);
		background: var(--bg-surface);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		transition: background 150ms ease;
	}

	.audio-btn:hover,
	.audio-btn:active {
		background: var(--ink-100);
	}

	.audio-btn-sm {
		margin-top: 0;
		width: 28px;
		height: 28px;
		border: 1px solid var(--ink-100);
		font-size: 12px;
		color: var(--fg-tertiary);
		flex-shrink: 0;
	}
</style>
