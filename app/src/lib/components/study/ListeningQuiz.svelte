<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';

	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import StudySessionLayout from './StudySessionLayout.svelte';

	interface Props {
		mode?: 'deck' | 'lesson';
		card: any;
		distractors: any[];
		onAnswer: (correct: boolean) => void;
	}

	let { mode = 'deck', card, distractors, onAnswer }: Props = $props();
	const isLesson = $derived(mode === 'lesson');

	let choices = $state<any[]>([]);
	let selectedChoice = $state<string | null>(null);
	let choiceRevealed = $state(false);

	function getMeaning(w: any) {
		return $locale === 'es' ? w.es : w.en;
	}

	$effect(() => {
		if (card) {
			const shuffled = distractors.sort(() => Math.random() - 0.5).slice(0, 3);
			choices = [...shuffled, card].sort(() => Math.random() - 0.5);
			selectedChoice = null;
			choiceRevealed = false;
			
			setTimeout(() => speakJapanese(card.jp), 400);
		}
	});

	function selectChoice(ch: any) {
		if (choiceRevealed) return;
		selectedChoice = getMeaning(ch);
		choiceRevealed = true;
		
		const isCorrect = getMeaning(ch) === getMeaning(card);
		if (isCorrect) playCorrect();
		else playWrong();

		setTimeout(() => {
			onAnswer(isCorrect);
		}, 1200);
	}

	function choiceIsCorrect(ch: any) { 
		return getMeaning(ch) === getMeaning(card); 
	}
	
	function choiceIsWrong(ch: any) { 
		return choiceRevealed && selectedChoice === getMeaning(ch) && !choiceIsCorrect(ch); 
	}
</script>

<StudySessionLayout
	{isLesson}
	onExit={() => onAnswer(false)}
	currentIndex={0}
	totalCount={1}
>
	<div class="content-center listening-viewer">
		<div class="quiz-card">
			<div class="quiz-prompt-label">{t('vocab.review.listenHint', $locale)}</div>
			<button class="big-listen-btn" onclick={() => speakJapanese(card.jp)} aria-label="Play word">
				<Icon icon={VolumeHighIcon} size={32} color="currentColor" />
				<span>{card.jp}</span>
			</button>
			<div class="choices-grid">
				{#each choices as ch (ch.id)}
					<button class="choice-btn"
						class:correct={choiceRevealed && choiceIsCorrect(ch)}
						class:wrong={choiceIsWrong(ch)}
						class:revealed={choiceRevealed}
						onclick={() => selectChoice(ch)}>
						{getMeaning(ch)}
					</button>
				{/each}
			</div>
			{#if choiceRevealed}
				<div class="feedback-row" class:feedback-ok={getMeaning(card) === selectedChoice}>
					<span>{getMeaning(card) === selectedChoice ? t('vocab.review.correct', $locale) : `${t('vocab.review.incorrect', $locale)} — ${getMeaning(card)}`}</span>
				</div>
			{/if}
		</div>
	</div>

	{#if card}
		<StickyFooter>
			{#if !choiceRevealed}
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={() => onAnswer(false)}>
					{t('session.skip', $locale)}
				</button>
			{:else}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={() => onAnswer(getMeaning(card) === selectedChoice)}>
					{t('session.continue', $locale)}
				</button>
			{/if}
		</StickyFooter>
	{/if}
</StudySessionLayout>

<style>
	.listening-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: clamp(16px, 3vh, 24px);
		padding: clamp(20px, 4vh, 32px) 16px clamp(20px, 3vh, 28px);
		width: 100%;
		max-width: 440px;
		margin: 0 auto;
	}

	.quiz-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-100);
		border-radius: 28px;
		padding: 28px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 100%;
		box-shadow: 0 4px 24px rgba(26,26,26,0.07);
	}
	
	.quiz-prompt-label { 
		font-size: 11px; 
		font-weight: 700; 
		text-transform: uppercase; 
		letter-spacing: -0.02em; 
		color: var(--fg-tertiary); 
		background: var(--bg-muted); 
		padding: 4px 12px; 
		border-radius: 20px; 
	}

	.big-listen-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 24px 40px;
		border-radius: 24px;
		border: 1.5px solid var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		cursor: pointer;
		font-family: var(--font-jp);
		font-size: 28px;
		font-weight: 700;
		box-shadow: 0 8px 24px rgba(188, 0, 45, 0.18);
		transition: transform 0.15s;
	}
	
	.big-listen-btn:active { 
		transform: scale(0.97); 
	}

	.choices-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		width: 100%;
	}
	
	.choice-btn {
		padding: 14px 12px;
		border-radius: var(--radius-md);
		border: 1px solid var(--ink-200);
		box-shadow: var(--shadow-sm);
		background: var(--bg-page);
		color: var(--fg-primary); 
		font-family: inherit; 
		font-size: 14px; 
		font-weight: 600; 
		cursor: pointer; 
		transition: all 0.15s; 
		text-align: center; 
		line-height: 1.3; 
		-webkit-tap-highlight-color: transparent; 
	}
	
	.choice-btn:not(.revealed):active { 
		transform: scale(0.96); 
	}
	
	.choice-btn.correct { 
		background: var(--success-wash); 
		border-color: var(--success); 
		color: var(--success); 
	}
	
	.choice-btn.wrong { 
		background: var(--hinomaru-red-wash); 
		border-color: var(--hinomaru-red); 
		color: var(--hinomaru-red); 
	}

	.feedback-row { 
		display: flex; 
		align-items: center; 
		gap: 8px; 
		font-size: 14px; 
		font-weight: 700; 
		color: var(--hinomaru-red); 
		background: var(--hinomaru-red-wash); 
		padding: 10px 16px; 
		border-radius: 12px; 
		width: 100%; 
		justify-content: center; 
	}
	
	.feedback-row.feedback-ok { 
		color: var(--success); 
		background: var(--success-wash); 
	}
</style>
