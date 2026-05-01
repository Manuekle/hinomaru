<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const supabase = createClient();
	const queue = $derived.by(() => createMistakeQueue<any>(data.cards as any[]));

	let picked = $state<string | null>(null);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);

	const cards = $derived(queue.cards);
	const i = $derived(queue.index);
	const card = $derived(queue.current);
	const pct = $derived(queue.progressPct);
	const isCorrect = $derived(picked === ($locale === 'es' ? card?.es : card?.en));

	const options = $derived.by(() => {
		if (!card) return [];
		// Filter out the correct answer and duplicates by meaning
		const pool = Array.from(
			new Set(
				cards
					.filter((c) => c.en !== card.en && c.es !== card.es)
					.map((c) => ($locale === 'es' ? c.es : c.en))
			)
		);

		// Fisher-Yates partial shuffle to pick 2 random distractors
		for (let k = pool.length - 1; k > pool.length - 3 && k > 0; k--) {
			const r = Math.floor(Math.random() * (k + 1));
			[pool[k], pool[r]] = [pool[r], pool[k]];
		}

		const distractors = pool.slice(-2);
		const result = [...distractors, $locale === 'es' ? card.es : card.en];

		// Fisher-Yates shuffle final options
		for (let k = result.length - 1; k > 0; k--) {
			const r = Math.floor(Math.random() * (k + 1));
			[result[k], result[r]] = [result[r], result[k]];
		}
		return result;
	});

	function pick(opt: string) {
		if (picked) return;
		picked = opt;
		const correctMeaning = $locale === 'es' ? card.es : card.en;
		if (opt === correctMeaning) {
			correct++;
			playCorrect();
		} else {
			playWrong();
		}
	}

	async function next() {
		updateCardProgress(card, isCorrect, struggled);

		// Re-queue wrong cards at end of session (Duolingo-style)
		if (!isCorrect) {
			queue.requeueCurrent();
		}

		if (queue.isLast) {
			const params = new URLSearchParams({
				correct: String(correct),
				total: String(queue.originalTotal),
				mode: 'quiz'
			});
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await supabase.from('sessions').insert({
					user_id: user.id,
					deck_id: data.deck.id,
					mode: 'quiz',
					correct,
					total: queue.originalTotal
				});
				await updateStreak(supabase, user.id);
			}
			showAnticipation = true;
			setTimeout(() => {
				goto(`/deck/${data.deck.id}/summary?${params}`);
			}, 1800);
		} else {
			picked = null;
			queue.advance();
			struggled = false;
		}
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
	function playAudio() {
		speakJapanese(card?.jp ?? '');
	}
</script>

<div class="session-layout">
	<SessionNav
		progress={pct}
		current={i + 1}
		total={cards.length}
		onClose={() => goto(`/deck/${data.deck.id}`)}
	/>

	<div class="session-container">
		{#if cards.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📭</div>
				<p>{t('home.empty', $locale)}</p>
				<button class="hm-btn hm-btn-secondary" onclick={() => goto(`/deck/${data.deck.id}`)}>
					{t('deck.back', $locale)}
				</button>
			</div>
		{:else if card}
			<div class="card-viewer">
				<div class="card-main">
					<button
						onclick={playAudio}
						aria-label="Play pronunciation"
						class="audio-btn-circle"
					>
						<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
					</button>
					<div class="label-meta">{t('session.whatMean', $locale)}</div>
					<div class="jp card-jp">{card.jp}</div>
					{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
						<div class="romaji card-romaji">{card.romaji}</div>
					{/if}
				</div>

				<div class="options-grid">
					{#each options as opt (opt)}
						{@const isThisCorrect = opt === ($locale === 'es' ? card.es : card.en)}
						{@const isThisPicked = opt === picked}
						<button
							onclick={() => pick(opt)}
							class="option-item"
							class:is-correct={picked && isThisCorrect && isCorrect}
							class:is-wrong={picked && isThisPicked && !isThisCorrect}
							class:is-dimmed={picked && !isThisCorrect && !isThisPicked}
							disabled={!!picked}
						>
							{opt}
						</button>
					{/each}
				</div>

				{#if picked}
					<div
						class="feedback-box"
						class:correct={isCorrect}
						class:wrong={!isCorrect}
						use:fadeUp={{ y: 10 }}
					>
						<div class="feedback-header">
							<div class="feedback-status">
								{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}
							</div>
						</div>

						{#if card.example}
							<div class="example-section">
								<div class="example-content">
									<div class="example-text jp">{card.example}</div>
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
									class="audio-btn-small"
								>
									<Icon icon={VolumeHighIcon} size={16} color="currentColor" strokeWidth={1.5} />
								</button>
							</div>
						{/if}
					</div>

					<StickyFooter>
						{#if !isCorrect}
							<button
								class="hm-btn hm-btn-secondary hm-btn-lg"
								onclick={() => {
									picked = null;
									struggled = true;
								}}
								style="flex:1;"
							>
								{t('session.again', $locale)}
							</button>
						{/if}
						<button
							class="hm-btn hm-btn-dark hm-btn-lg touch-action-manip"
							onclick={next}
							style="flex:1;"
						>
							{i >= cards.length - 1 ? t('session.finish', $locale) : t('session.continue', $locale)}
						</button>
					</StickyFooter>
				{/if}
			</div>
		{/if}
	</div>
</div>

{#if showAnticipation}
	<AnticipationScreen />
{/if}

<style>
	.session-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--paper);
	}

	.session-container {
		flex: 1;
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
		padding: 32px 24px 140px;
		box-sizing: border-box;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px;
		text-align: center;
		height: 100%;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.card-viewer {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.card-main {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 48px 24px;
		text-align: center;
		box-shadow: var(--shadow-sm);
		position: relative;
	}

	.card-jp {
		font-size: 64px;
		line-height: 1.1;
		margin: 8px 0;
	}

	.card-romaji {
		margin-top: 12px;
		color: var(--hinomaru-red);
		font-weight: 500;
	}

	.audio-btn-circle {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--sumi);
		box-shadow: var(--shadow-sm);
		transition: transform 100ms ease;
	}

	.audio-btn-circle:active {
		transform: scale(0.92);
	}
	:global([data-theme='dark']) .audio-btn-circle {
		background: var(--ink-100);
		border-color: var(--ink-300);
	}

	.options-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.option-item {
		padding: 18px 20px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		font-size: 16px;
		font-weight: 500;
		color: var(--sumi);
		cursor: pointer;
		text-align: center;
		transition: all 120ms var(--ease-brand);
		font-family: var(--font-ui);
	}

	@media (hover: hover) {
		.option-item:hover:not(:disabled) {
			border-color: var(--ink-300);
			background: var(--ink-50);
		}
	}

	.option-item.is-correct {
		background: var(--success-wash);
		border-color: var(--success);
		color: var(--success);
		font-weight: 700;
	}

	.option-item.is-wrong {
		background: var(--hinomaru-red-wash);
		border-color: var(--hinomaru-red);
		color: var(--hinomaru-red-ink);
		font-weight: 700;
	}

	.option-item.is-dimmed {
		opacity: 0.5;
		cursor: default;
	}

	.feedback-box {
		padding: 20px;
		border-radius: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		box-shadow: var(--shadow-sm);
	}

	.feedback-box.correct {
		background: var(--success-wash);
	}

	.feedback-box.wrong {
		background: var(--hinomaru-red-wash);
	}

	.feedback-header {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.feedback-status {
		font-weight: 700;
		font-size: 18px;
	}

	.correct .feedback-status { color: var(--success); }
	.wrong .feedback-status { color: var(--hinomaru-red-ink); }

	.correct-answer {
		font-size: 14px;
		color: var(--hinomaru-red-ink);
		opacity: 0.8;
		margin-top: 2px;
	}

	.example-section {
		padding-top: 16px;
		border-top: 1.5px solid rgba(0, 0, 0, 0.05);
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.example-content {
		flex: 1;
	}

	.example-text {
		font-size: 16px;
		line-height: 1.5;
		color: var(--sumi);
	}

	.example-romaji {
		font-size: 11px;
		color: var(--hinomaru-red-ink);
		opacity: 0.7;
		margin-top: 2px;
		font-weight: 600;
	}

	.example-translation {
		font-size: 13px;
		color: var(--fg-secondary);
		margin-top: 4px;
	}

	.audio-btn-small {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--ink-100);
		background: var(--bg-surface);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-tertiary);
		flex-shrink: 0;
	}
</style>
