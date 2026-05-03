<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { 
		VolumeHighIcon, 
		Cancel01Icon, 
		TranslateIcon,
		CheckmarkCircle01Icon
	} from '@hugeicons/core-free-icons';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { safeRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeIn } from '$lib/motion';

	interface Props {
		cards: any[];
		deck: any;
		onComplete: (results: { correct: number; total: number }) => void;
		onExit: () => void;
		onCardProgress?: (card: any, correct: boolean, struggled: boolean) => void;
		totalCards?: number;
		learnedCount?: number;
	}

	let { 
		cards: initialCards, 
		deck, 
		onComplete, 
		onExit, 
		onCardProgress,
		totalCards = 0,
		learnedCount = 0
	} = $props<Props>();

	const queue = $derived.by(() => createMistakeQueue<any>(initialCards));
	
	let picked = $state<string | null>(null);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);

	const card = $derived(queue.current);
	const isCorrect = $derived(picked === ($locale === 'es' ? card?.es : card?.en));

	const options = $derived.by(() => {
		if (!card) return [];
		const correctMeaning = $locale === 'es' ? card.es : card.en;

		const pool = Array.from(
			new Set(
				initialCards
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
			struggled = true;
			playWrong();
		}
	}

	async function next() {
		if (onCardProgress) onCardProgress(card, isCorrect, struggled);

		if (!isCorrect) {
			queue.requeueCurrent();
		}

		if (queue.isLast) {
			showAnticipation = true;
			onComplete({ correct, total: queue.originalTotal });
		} else {
			picked = null;
			queue.advance();
			struggled = false;
		}
	}

	function playAudio() {
		speakJapanese(card?.jp ?? '');
	}
</script>

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={onExit}>
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
		{#if initialCards.length === 0}
			<SessionEmptyState 
				totalCards={totalCards} 
				learnedCount={learnedCount}
				sessionCount={0} 
				deckId={deck?.id} 
				modeLabel={t('mode.quiz.title', $locale)}
			/>
		{:else if card}
			<div class="quiz-viewer">
				<div class="word-card">
					<button onclick={playAudio} class="audio-corner" aria-label="Play pronunciation">
						<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
					</button>
					<div class="jp word-big">{card.jp}</div>
					{#if $showRomaji}
						{@const rom = safeRomaji(card.romaji, card.jp)}
						{#if rom}<div class="romaji-line">{rom}</div>{/if}
					{/if}
				</div>

				<div class="options-list">
					{#each options as opt, idx (idx)}
						{@const isThisCorrect = opt === ($locale === 'es' ? card.es : card.en)}
						{@const isThisPicked = opt === picked}
						<button
							onclick={() => pick(opt)}
							class="option-item"
							class:is-correct={picked && isThisPicked && isThisCorrect}
							class:is-wrong={picked && isThisPicked && !isThisCorrect}
							class:is-dimmed={picked && !isThisPicked}
							disabled={!!picked}
						>
							<div class="opt-marker">
								{#if picked && isThisPicked && isThisCorrect}
									<Icon icon={CheckmarkCircle01Icon} size={14} color="white" />
								{:else if picked && isThisPicked && !isThisCorrect}
									<Icon icon={Cancel01Icon} size={14} color="white" />
								{:else}
									{String.fromCharCode(65 + idx)}
								{/if}
							</div>
							<span class="opt-text">{opt}</span>
						</button>
					{/each}
				</div>

				{#if picked}
					<div class="feedback-bar" class:is-correct={isCorrect} use:fadeUp={{ y: 10 }}>
						<Icon icon={isCorrect ? CheckmarkCircle01Icon : Cancel01Icon} size={18} color="currentColor" />
						<span class="fb-label">{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}</span>
					</div>

					{#if !isCorrect && card.example}
						<div class="example-hint" use:fadeIn>
							<div class="jp" style="font-size:15px;font-weight:600;color:var(--fg-primary);">{card.example}</div>
							<div style="font-size:13px;color:var(--fg-secondary);margin-top:3px;">{$locale === 'es' ? card.example_es : card.example_en}</div>
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
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 16px;
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
		padding: 20px 0 8px;
	}

	.word-card {
		position: relative;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		box-shadow: 0 2px 12px rgba(26,26,26,0.06);
		padding: 20px 20px 18px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-align: center;
	}

	.audio-corner {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: background 0.15s;
	}

	.word-big {
		font-size: clamp(36px, 10vw, 56px);
		font-weight: 800;
		color: var(--fg-primary);
		line-height: 1;
		padding: 0 36px;
	}

	.romaji-line {
		font-size: clamp(13px, 3.5vw, 16px);
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.option-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 16px;
		border: 1.5px solid var(--ink-200);
		border-radius: 14px;
		background: var(--bg-surface);
		cursor: pointer;
		text-align: left;
		transition: border-color 0.15s, background 0.15s, opacity 0.15s, transform 0.1s;
		width: 100%;
		-webkit-tap-highlight-color: transparent;
		font-family: inherit;
		box-shadow: 0 1px 4px rgba(26,26,26,0.04);
	}

	.option-item:not(:disabled):hover {
		border-color: var(--ink-300);
		transform: translateY(-1px);
		box-shadow: 0 3px 10px rgba(26,26,26,0.08);
	}

	.option-item.is-correct {
		border-color: var(--success) !important;
		background: var(--success-wash) !important;
	}

	.option-item.is-wrong {
		border-color: var(--hinomaru-red) !important;
		background: var(--hinomaru-red-wash) !important;
	}

	.option-item.is-dimmed { opacity: 0.55; filter: grayscale(0.4); }

	.opt-marker {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: var(--bg-muted);
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: 900;
		color: var(--fg-tertiary);
		flex-shrink: 0;
	}

	.option-item.is-correct .opt-marker { background: var(--success); border-color: var(--success); color: white; }
	.option-item.is-wrong .opt-marker { background: var(--hinomaru-red); border-color: var(--hinomaru-red); color: white; }

	.opt-text {
		font-size: 14px;
		font-weight: 600;
		color: var(--fg-primary);
	}

	.feedback-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 14px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		border: 1.5px solid rgba(188, 0, 45, 0.12);
	}

	.feedback-bar.is-correct {
		background: var(--success-wash);
		color: var(--success);
		border-color: rgba(46, 125, 91, 0.12);
	}

	.fb-label { font-size: 15px; font-weight: 800; }

	.example-hint {
		padding: 14px;
		background: var(--bg-muted);
		border-radius: 14px;
		text-align: center;
	}
</style>
