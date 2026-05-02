<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { 
		VolumeHighIcon, 
		Cancel01Icon, 
		CheckmarkCircle01Icon,
		TranslateIcon
	} from '@hugeicons/core-free-icons';
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
	import { kanaToRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import { fadeIn } from '$lib/motion';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const supabase = createClient();
	const queue = $derived.by(() => createMistakeQueue<any>(data.cards as any[]));

	let flipped = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);
	let cardEl = $state<HTMLDivElement | null>(null);

	const cards = $derived(queue.cards);
	const i = $derived(queue.index);
	const card = $derived(queue.current);

	onMount(() => {
		if (cardEl) {
			animate(
				cardEl,
				{ opacity: [0, 1], y: [24, 0], scale: [0.97, 1] },
				{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }
			);
		}
	});

	function speak(text: string, slow = false) {
		speakJapanese(text, undefined, slow ? 0.7 : 1);
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
		if (!gotIt || struggled) {
			queue.requeueCurrent();
		}
		flipped = false;

		updateCardProgress(card, gotIt, struggled);

		if (queue.isLast) {
			const params = new URLSearchParams({
				correct: String(correct),
				total: String(queue.originalTotal),
				mode: 'flashcards'
			});
			saveSession(correct, queue.originalTotal);
			showAnticipation = true;
			setTimeout(() => {
				goto(`/deck/${data.deck.id}/summary?${params}`);
			}, 1800);
		} else {
			if (cardEl) {
				const dir = gotIt ? -1 : 1;
				await animate(
					cardEl,
					{ opacity: [1, 0], x: [0, dir * 40] },
					{ duration: 0.2, ease: 'easeIn' }
				).finished;
				queue.advance();
				flipped = false;
				struggled = false;
				await animate(
					cardEl,
					{ opacity: [0, 1], x: [dir * -40, 0] },
					{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }
				);
			} else {
				queue.advance();
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

	function getFontSize(text: string) {
		const len = text?.length || 0;
		if (len <= 4) return '80px';
		if (len <= 6) return '64px';
		if (len <= 10) return '48px';
		return '36px';
	}
</script>

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={() => goto(`/deck/${data.deck.id}`)}>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			{queue.index + 1} / {queue.total}
		</div>

		<button class="lang-btn">
			<Icon icon={TranslateIcon} size={24} color="currentColor" />
		</button>
	</div>

	<div class="session-container">
		{#if data.cards.length === 0}
			<SessionEmptyState
				totalCards={data.totalCards}
				learnedCount={data.learnedCount}
				sessionCount={cards.length}
				deckId={data.deck.id}
				modeLabel={t('mode.flashcards.title', $locale)}
			/>
		{:else if card}
			<div class="card-stack-center">
				<div
					role="button"
					tabindex="0"
					bind:this={cardEl}
					class="card-scene"
					onclick={() => (flipped = !flipped)}
					onkeydown={(e) => e.key === 'Enter' && (flipped = !flipped)}
				>
					<div class="card-body" class:flipped>
						<!-- Front -->
						<div class="card-face card-front">
							<div class="card-tag">{$locale === 'es' ? (data.deck?.kind_es ?? data.deck?.kind) : data.deck?.kind}</div>
							
							<div class="jp word-text" style="font-size:{getFontSize(card.jp)};">
								{card.jp}
							</div>

							<div class="audio-controls">
								<button
									onclick={(e) => { e.stopPropagation(); speak(card.jp); }}
									class="audio-pill normal"
								>
									<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
								</button>
								<button
									onclick={(e) => { e.stopPropagation(); speak(card.jp, true); }}
									class="audio-pill slow"
								>
									<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
									<span class="slow-label">0.7x</span>
								</button>
							</div>

							<div class="tap-label">{t('session.flip', $locale)}</div>
						</div>

						<!-- Back -->
						<div class="card-face card-back">
							<div class="back-content">
								<div class="meaning-large">
									{$locale === 'es' ? card.es : card.en}
								</div>

								<div class="romaji-red">
									{card.romaji}
								</div>

								<div class="divider"></div>

								{#if card.example}
									<div class="example-section">
										<div class="example-jp jp">
											{card.example}
											<button
												onclick={(e) => { e.stopPropagation(); speak(card.example); }}
												class="mini-audio"
											>
												<Icon icon={VolumeHighIcon} size={14} color="currentColor" />
											</button>
										</div>
										{#if $showRomaji}
											<div class="example-romaji">
												{card.example_romaji || card.extra?.example_romaji || kanaToRomaji(card.example)}
											</div>
										{/if}
										<div class="example-translation">
											{$locale === 'es' ? card.example_es : card.example_en}
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	{#if card && !showAnticipation}
		<div class="premium-footer">
			{#if !flipped}
				<button class="action-btn-primary full" onclick={() => (flipped = true)}>
					{t('session.flip', $locale)}
				</button>
			{:else}
				<button class="action-btn-secondary" onclick={retry}>
					<Icon icon={Cancel01Icon} size={20} color="currentColor" />
					{t('session.again', $locale)}
				</button>
				<button class="action-btn-primary" onclick={() => next(true)}>
					<Icon icon={CheckmarkCircle01Icon} size={20} color="currentColor" />
					{t('session.gotIt', $locale)}
				</button>
			{/if}
		</div>
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
	}

	.card-stack-center {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.card-scene {
		width: 100%;
		max-width: 440px;
		aspect-ratio: 3/4.2;
		perspective: 1500px;
		cursor: pointer;
	}

	.card-body {
		position: relative;
		width: 100%;
		height: 100%;
		transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
		transform-style: preserve-3d;
	}

	.card-body.flipped {
		transform: rotateY(180deg);
	}

	.card-face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		background: var(--bg-surface);
		border-radius: 40px;
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		padding: 48px 32px;
		overflow: hidden;
		border: 1px solid var(--ink-100);
	}

	.card-front {
		align-items: center;
		justify-content: space-between;
	}

	.card-back {
		transform: rotateY(180deg);
		justify-content: center;
	}

	.card-tag {
		font-size: 12px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.15em;
	}

	.word-text {
		color: var(--fg-primary);
		line-height: 1.1;
		text-align: center;
		font-weight: 700;
		margin: auto 0;
	}

	.audio-controls {
		display: flex;
		gap: 16px;
		margin-bottom: 24px;
	}

	.audio-pill {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		transition: all 0.2s;
		position: relative;
	}

	.audio-pill.slow {
		border-color: var(--hinomaru-red);
		color: var(--hinomaru-red);
	}

	.slow-label {
		position: absolute;
		font-size: 9px;
		font-weight: 800;
		background: var(--bg-surface);
		color: var(--hinomaru-red);
		padding: 0 4px;
		top: -4px;
	}

	.tap-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-tertiary);
	}

	/* Back styling */
	.back-content {
		text-align: center;
	}

	.meaning-large {
		font-size: 40px;
		font-weight: 900;
		color: var(--fg-primary);
		line-height: 1.1;
	}

	.romaji-red {
		margin-top: 12px;
		font-size: 20px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.divider {
		height: 1.5px;
		background: var(--ink-100);
		margin: 32px 0;
	}

	.example-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.example-jp {
		font-size: 20px;
		font-weight: 600;
		color: var(--fg-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.mini-audio {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-tertiary);
	}

	.example-romaji {
		font-size: 14px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.example-translation {
		font-size: 15px;
		color: var(--fg-secondary);
	}

	/* Footer styling */
	.premium-footer {
		display: flex;
		gap: 16px;
		padding: 24px 24px calc(24px + env(safe-area-inset-bottom));
		background: transparent;
	}

	.action-btn-primary {
		flex: 1;
		height: 60px;
		border-radius: 30px;
		background: var(--hinomaru-red);
		color: #fff;
		border: none;
		font-size: 17px;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-shadow: 0 8px 24px rgba(188, 0, 45, 0.25);
	}

	.action-btn-secondary {
		flex: 1;
		height: 60px;
		border-radius: 30px;
		background: var(--bg-surface);
		color: var(--fg-primary);
		border: 1.5px solid var(--ink-200);
		font-size: 17px;
		font-weight: 800;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.action-btn-primary.full {
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.2);
	}
</style>
