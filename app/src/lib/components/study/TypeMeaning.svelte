<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, CheckmarkCircle01Icon, Cancel02Icon } from '@hugeicons/core-free-icons';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { safeRomaji } from '$lib/utils/romaji';
	import { fade } from 'svelte/transition';
	import { playCorrect, playWrong } from '$lib/utils/sounds';

	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import StudySessionLayout from './StudySessionLayout.svelte';

	interface Props {
		mode?: 'deck' | 'lesson';
		card: any;
		onAnswer: (correct: boolean) => void;
	}

	let { mode = 'deck', card, onAnswer }: Props = $props();
	const isLesson = $derived(mode === 'lesson');

	let typedAnswer = $state('');
	let typingRevealed = $state(false);
	let typingCorrect = $state(false);

	const rom = $derived(card ? safeRomaji(card.romaji, card.kana || card.jp) : '');

	function getMeaning(w: any) {
		return $locale === 'es' ? w.es : w.en;
	}

	function checkTyping() {
		const ans = typedAnswer.trim().toLowerCase();
		const meaning = getMeaning(card).toLowerCase();
		typingCorrect = ans === meaning || meaning.includes(ans) || ans.includes(meaning.split(/[,;]/)[0].trim());
		
		typingRevealed = true;
		
		if (typingCorrect) playCorrect();
		else playWrong();

		setTimeout(() => {
			onAnswer(typingCorrect);
		}, 1200);
	}

	function getFontSize(text: string) {
		const len = text?.length || 0;
		if (len <= 4) return 'var(--fs-display)';
		if (len <= 6) return 'var(--fs-2xl)';
		if (len <= 10) return 'var(--fs-xl)';
		return 'var(--fs-lg)';
	}
</script>

<StudySessionLayout
	{isLesson}
	onExit={() => onAnswer(false)}
	currentIndex={0}
	totalCount={1}
>
	<div class="content-center typing-viewer">
		<div class="quiz-card">
			<div class="quiz-prompt-label">{t('vocab.review.typing', $locale)}</div>
			<div class="jp quiz-word" style="font-size:{getFontSize(card.jp)};">{card.jp}</div>
			{#if rom}<div class="romaji-hint">{rom}</div>{/if}
			<button onclick={() => speakJapanese(card.jp)} class="audio-btn" aria-label="Play">
				<Icon icon={VolumeHighIcon} size={18} color="currentColor" />
			</button>
			<input
				class="hm-input typing-input"
				class:input-correct={typingRevealed && typingCorrect}
				class:input-wrong={typingRevealed && !typingCorrect}
				placeholder={t('vocab.review.typeHere', $locale)}
				bind:value={typedAnswer}
				disabled={typingRevealed}
				onkeydown={(e) => e.key === 'Enter' && !typingRevealed && typedAnswer.trim() && checkTyping()}
			/>
			{#if typingRevealed}
				<div class="feedback-row" class:feedback-ok={typingCorrect} in:fade={{ duration: 150 }}>
					{#if typingCorrect}
						<Icon icon={CheckmarkCircle01Icon} size={18} color="currentColor" />
						<span>{t('vocab.review.correct', $locale)}</span>
					{:else}
						<Icon icon={Cancel02Icon} size={18} color="currentColor" />
						<span>{t('vocab.review.incorrect', $locale)} — {getMeaning(card)}</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	{#if card}
		<StickyFooter>
			{#if !typingRevealed}
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={() => onAnswer(false)}>
					{t('session.skip', $locale)}
				</button>
			{:else}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={() => onAnswer(typingCorrect)}>
					{t('session.continue', $locale)}
				</button>
			{/if}
		</StickyFooter>
	{/if}
</StudySessionLayout>

<style>
	.typing-viewer {
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
		border: 1.5px solid var(--ink-200); 
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
		font-weight: 800; 
		text-transform: uppercase; 
		letter-spacing: -0.02em; 
		color: var(--fg-tertiary); 
		background: var(--bg-muted); 
		padding: 4px 12px; 
		border-radius: 20px; 
	}
	
	.quiz-word { 
		color: var(--fg-primary); 
		font-weight: 700; 
		line-height: 1; 
		text-align: center; 
	}
	
	.romaji-hint { 
		font-size: 14px; 
		font-weight: 600; 
		color: var(--hinomaru-red); 
		margin-top: -8px; 
	}
	
	.audio-btn { 
		height: 44px; 
		padding: 0 16px; 
		border-radius: 22px; 
		border: 1.5px solid var(--ink-200); 
		background: var(--bg-muted); 
		display: flex; 
		align-items: center; 
		gap: 6px; 
		color: var(--fg-secondary); 
		cursor: pointer; 
		transition: all 0.15s; 
		font-family: inherit; 
		-webkit-tap-highlight-color: transparent; 
	}

	.typing-input { 
		border-radius: 16px; 
		font-size: 17px; 
		text-align: center; 
		height: 56px; 
		width: 100%;
	}
	
	.input-correct { 
		border-color: var(--success) !important; 
		background: var(--success-wash); 
	}
	
	.input-wrong { 
		border-color: var(--hinomaru-red) !important; 
		background: var(--hinomaru-red-wash); 
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
