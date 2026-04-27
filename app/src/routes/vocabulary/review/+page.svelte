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
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { addXP } from '$lib/utils/gamification';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import confetti from 'canvas-confetti';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const words = $derived(data.words as any[]);
	const supabase = createClient();

	let i = $state(0);
	let flipped = $state(false);
	let struggled = $state(false);
	let cardEl = $state<HTMLDivElement | null>(null);

	const word = $derived(words[i]);
	const pct = $derived(((i + 1) / words.length) * 100);

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
		flipped = false;
		if (gotIt) playCorrect();
		updateWordProgress(word, gotIt, struggled);

		if (i >= words.length - 1) {
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
							{t('nav.vocabulary', $locale)}
						</div>
						<div class="jp" style="font-size:96px;line-height:1;">{word.jp}</div>
						<button
							onclick={(e) => {
								e.stopPropagation();
								speak(word.jp);
							}}
							style="margin-top:20px;width:44px;height:44px;border-radius:50%;
                     border:1px solid var(--ink-200);background:var(--bg-surface);cursor:pointer;
                     display:inline-flex;align-items:center;justify-content:center;font-size:18px;
                     transition:background 150ms ease, transform 150ms ease;"
							onmouseenter={(e) =>
								((e.currentTarget as HTMLElement).style.transform = 'scale(1.1)')}
							onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
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
							{$locale === 'es' ? word.es : word.en}
						</div>
						
						<div style="margin-top:12px;display:flex;flex-direction:column;align-items:center;gap:4px;">
							<div class="jp" style="font-size:24px;color:var(--fg-secondary);">{word.kana}</div>
							{#if $showRomaji}
								<div class="romaji" style="font-size:14px;color:var(--hinomaru-red);font-weight:600;">
									{word.romaji || kanaToRomaji(word.kana)}
								</div>
							{/if}
						</div>

						{#if word.example}
							<div
								style="margin-top:20px;padding-top:20px;border-top:1px solid var(--ink-200);width:90%;text-align:center;position:relative;"
							>
								<div style="display:flex;align-items:center;justify-content:center;gap:8px;">
									<div class="jp" style="font-size:17px;line-height:1.4;">{word.example}</div>
									<button
										onclick={(e) => {
											e.stopPropagation();
											speak(word.example);
										}}
										style="width:28px;height:28px;border-radius:50%;border:1px solid var(--ink-100);
											background:var(--bg-surface);cursor:pointer;display:flex;align-items:center;
											justify-content:center;font-size:12px;color:var(--fg-tertiary);flex-shrink:0;"
									>
										<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
									</button>
								</div>

								<div style="font-size:13px;color:var(--fg-secondary);margin-top:6px;line-height:1.4;">
									{$locale === 'es' ? word.example_es : word.example_en}
								</div>
							</div>
						{/if}

						<div
							style="margin-top:auto;padding-bottom:32px;display:flex;flex-direction:column;align-items:center;gap:8px;"
						>
							<div
								style="font-size:11px;font-weight:700;color:var(--fg-tertiary);text-transform:uppercase;letter-spacing:0.05em;"
							>
								SRS Level {word.repetitions || 0}
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
					class="hm-btn hm-btn-primary {flipped ? '' : 'hm-btn-full'} touch-action-manip"
					onclick={() => (flipped ? next(true) : (flipped = true))}
					style="flex:1; transition:transform 100ms ease, box-shadow 150ms ease;"
					onmouseenter={(e) =>
						((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(188,0,45,0.30)')}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '')}
				>
					{flipped ? `✓ ${t('session.gotIt', $locale)}` : t('session.flip', $locale)}
				</button>
			</StickyFooter>
		</div>
	{/if}
</div>

<style>
	.card-scene {
		perspective: 1000px;
	}

	.card-body {
		width: 100%;
		height: 100%;
		position: relative;
		transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		transform-style: preserve-3d;
	}

	.card-body.flipped {
		transform: rotateY(180deg);
	}

	.card-face {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 32px;
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.card-face.back {
		transform: rotateY(180deg);
	}

	.jp {
		font-family: var(--font-jp);
	}

	.label-meta {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--fg-tertiary);
	}

	.romaji {
		font-weight: 500;
	}

	:global(.touch-action-manip) {
		touch-action: manipulation;
	}
</style>
