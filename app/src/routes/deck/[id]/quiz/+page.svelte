<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { 
		VolumeHighIcon, 
		Cancel01Icon, 
		TranslateIcon,
		CheckmarkCircle01Icon
	} from '@hugeicons/core-free-icons';
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
	import { kanaToRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeIn } from '$lib/motion';
	import { onMount } from 'svelte';
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
	const isCorrect = $derived(picked === ($locale === 'es' ? card?.es : card?.en));

	// Timer
	let elapsed = $state(0);
	let timerInterval: any;

	onMount(() => {
		timerInterval = setInterval(() => elapsed++, 1000);
		return () => clearInterval(timerInterval);
	});

	const options = $derived.by(() => {
		if (!card) return [];
		const correctMeaning = $locale === 'es' ? card.es : card.en;

		const pool = Array.from(
			new Set(
				cards
					.filter((c) => c.en !== card.en && c.es !== card.es)
					.map((c) => ($locale === 'es' ? c.es : c.en))
					.filter(Boolean)
			)
		);

		const need = Math.min(3, pool.length);
		const shuffled = [...pool].sort(() => Math.random() - 0.5);
		const distractors = shuffled.slice(0, need);
		
		const result = [...distractors, correctMeaning].sort(() => Math.random() - 0.5);
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

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={() => goto(`/deck/${data.deck.id}`)}>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			{queue.index + 1} / {queue.total}
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
		{#if data.cards.length === 0}
			<SessionEmptyState 
				totalCards={data.totalCards} 
				learnedCount={data.learnedCount}
				sessionCount={cards.length} 
				deckId={data.deck.id} 
				modeLabel={t('mode.quiz.title', $locale)}
			/>
		{:else if card}
			<div class="quiz-viewer">
				<div class="card-face minimal-card">
					<div class="card-tag">{$locale === 'es' ? (data.deck?.kind_es ?? data.deck?.kind) : data.deck?.kind}</div>
					
					<button
						onclick={playAudio}
						aria-label="Play pronunciation"
						class="audio-pill normal"
						style="margin: 0 auto;"
					>
						<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
					</button>

					<div class="jp card-jp">{card.jp}</div>
					
					{#if $showRomaji && ['N5', 'N4', 'Survival'].includes(data.deck.level)}
						<div class="romaji card-romaji">{card.romaji}</div>
					{/if}

					<div class="card-hint">{t('session.whatMean', $locale)}</div>
				</div>

				<div class="options-list">
					{#each options as opt, idx (idx)}
						{@const isThisCorrect = opt === ($locale === 'es' ? card.es : card.en)}
						{@const isThisPicked = opt === picked}
						<button
							onclick={() => pick(opt)}
							class="option-item"
							class:is-correct={picked && isThisCorrect}
							class:is-wrong={picked && isThisPicked && !isThisCorrect}
							class:is-dimmed={picked && !isThisCorrect && !isThisPicked}
							disabled={!!picked}
						>
							<div class="opt-marker">
								{#if picked && isThisCorrect}
									<Icon icon={CheckmarkCircle01Icon} size={16} color="white" />
								{:else if picked && isThisPicked && !isThisCorrect}
									<Icon icon={Cancel01Icon} size={16} color="white" />
								{:else}
									{String.fromCharCode(65 + idx)}
								{/if}
							</div>
							<span class="opt-text">{opt}</span>
						</button>
					{/each}
				</div>

				{#if picked}
					<div
						class="feedback-premium-bar"
						class:is-correct={isCorrect}
						use:fadeUp={{ y: 15 }}
					>
						<div class="feedback-icon-wrap">
							<Icon icon={isCorrect ? CheckmarkCircle01Icon : Cancel01Icon} size={22} color="currentColor" />
						</div>
						<div class="feedback-text-side">
							<span class="feedback-title">
								{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}
							</span>
						</div>
					</div>

					{#if !isCorrect && card.example}
						<div class="example-box compact" use:fadeIn>
							<div class="example-jp jp">{card.example}</div>
							<div class="example-en">{$locale === 'es' ? card.example_es : card.example_en}</div>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>

	{#if picked && !showAnticipation}
		<StickyFooter>
			<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={next}>
				{t('session.next', $locale)}
			</button>
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

	.quiz-viewer {
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
		padding: 24px;
	}

	.minimal-card {
		background: var(--bg-surface);
		border-radius: 40px;
		padding: 40px 32px;
		text-align: center;
		box-shadow: var(--shadow-md);
		position: relative;
		border: 1px solid var(--ink-100);
	}

	.card-tag {
		font-size: 11px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 24px;
	}

	.audio-pill {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		transition: all 0.2s;
	}

	.card-jp {
		font-size: 42px;
		font-weight: 800;
		color: var(--fg-primary);
		margin-top: 24px;
		line-height: 1.2;
	}

	.card-romaji {
		margin-top: 8px;
		font-size: 18px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.card-hint {
		margin-top: 24px;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.option-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		border: 1.5px solid var(--ink-200);
		border-radius: 20px;
		background: var(--bg-surface);
		cursor: pointer;
		text-align: left;
		transition: all 0.2s;
		width: 100%;
	}

	.option-item:not(:disabled):hover {
		border-color: var(--hinomaru-red);
		transform: translateY(-2px);
		box-shadow: var(--shadow-sm);
	}

	.option-item.is-correct {
		border-color: var(--success) !important;
		background: var(--success-wash) !important;
		color: var(--success);
	}

	.option-item.is-wrong {
		border-color: var(--hinomaru-red) !important;
		background: var(--hinomaru-red-wash) !important;
		color: var(--hinomaru-red);
	}

	.option-item.is-dimmed {
		opacity: 0.4;
	}

	.opt-marker {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 800;
		color: var(--fg-tertiary);
		flex-shrink: 0;
	}

	.option-item.is-correct .opt-marker { background: var(--success); color: white; }
	.option-item.is-wrong .opt-marker { background: var(--hinomaru-red); color: white; }

	.opt-text {
		font-size: 16px;
		font-weight: 700;
	}

	.feedback-premium-bar {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		border-radius: 20px;
		margin-top: 12px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red-ink);
		border: 1.5px solid rgba(188, 0, 45, 0.1);
	}

	.feedback-premium-bar.is-correct {
		background: var(--success-wash);
		color: var(--success-ink);
		border-color: rgba(46, 125, 91, 0.1);
	}

	.feedback-icon-wrap {
		width: 44px;
		height: 44px;
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.5);
		flex-shrink: 0;
	}

	.feedback-title { font-size: 16px; font-weight: 800; }

	.example-box.compact {
		margin-top: 12px;
		padding: 16px;
		background: var(--bg-muted);
		border-radius: 20px;
		text-align: center;
	}

	.example-jp { font-size: 16px; color: var(--fg-primary); font-weight: 600; }
	.example-en { font-size: 13px; color: var(--fg-secondary); margin-top: 4px; }
</style>
