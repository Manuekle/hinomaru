<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import {
		VolumeHighIcon,
		Cancel01Icon,
		CheckmarkCircle01Icon
	} from '@hugeicons/core-free-icons';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { safeRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeIn, fadeUp } from '$lib/motion';

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
	
	let answer = $state('');
	let submitted = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);

	const card = $derived(queue.current);

	const isCorrect = $derived.by(() => {
		if (!card || !answer) return false;
		const clean = (s: string) => s.trim().toLowerCase().replace(/^to\s+/, '');
		const userAns = clean(answer);
		const targetEn = clean(card.en);
		const targetEs = clean(card.es || '');
		return userAns === targetEn || userAns === targetEs;
	});

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	function submit() {
		if (submitted || !answer.trim()) return;
		submitted = true;
		if (isCorrect) {
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
			submitted = false;
			answer = '';
			struggled = false;
			queue.advance();
		}
	}

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (submitted) next();
			else submit();
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
			<span class="session-index">{queue.index + 1} / {queue.total}</span>
			<span class="total-label">{t('home.cards', $locale, { n: totalCards })}</span>
		</div>
		
		<div style="width: 44px;"></div> <!-- Spacer -->
	</div>

	<div class="session-container">
		{#if initialCards.length === 0}
			<SessionEmptyState 
				totalCards={totalCards} 
				learnedCount={learnedCount}
				sessionCount={0} 
				deckId={deck?.id} 
				modeLabel={t('mode.type.title', $locale)}
			/>
		{:else if card}
			<div class="type-viewer content-center">
				<div class="word-card">
					<button onclick={playAudio} class="audio-corner" aria-label="Play pronunciation">
						<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
					</button>
					<div class="jp word-big"><InteractiveText text={card.jp} /></div>
					<div class="meaning-label">{$locale === 'es' ? card.es : card.en}</div>
					{#if submitted}
						{@const rom = safeRomaji(card.romaji, card.jp)}
						{#if rom}<div class="romaji-line">{rom}</div>{/if}
					{/if}
				</div>

				<input
					use:focusOnMount
					type="text"
					bind:value={answer}
					onkeydown={keydown}
					placeholder={t('session.typeTranslation', $locale)}
					class="type-input"
					class:is-correct={submitted && isCorrect}
					class:is-wrong={submitted && !isCorrect}
					disabled={submitted}
					autocomplete="off"
				/>

				{#if submitted}
					<div class="feedback-box" class:correct={isCorrect} class:wrong={!isCorrect} use:fadeUp={{ y: 10 }}>
						<div class="feedback-status">
							{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}
						</div>
						{#if !isCorrect}
							<div class="correct-answer">{t('session.correctWas', $locale)}: <strong>{$locale === 'es' ? card.es : card.en}</strong></div>
						{/if}

						{#if card.example}
							<div class="example-section">
								<div class="example-text jp">{card.example}</div>
								{#if $showRomaji}
									{@const exRom = safeRomaji(card.example_romaji || card.extra?.example_romaji, card.example_kana)}
									{#if exRom}<div class="example-romaji">{exRom}</div>{/if}
								{/if}
								<div class="example-translation">{$locale === 'es' ? card.example_es : card.example_en}</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if !showAnticipation}
		<StickyFooter>
			{#if submitted}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={next}>
					{t('session.next', $locale)}
				</button>
			{:else}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={submit} disabled={!answer.trim()}>
					{t('session.check', $locale)}
				</button>
			{/if}
		</StickyFooter>
	{/if}
</div>

{#if showAnticipation}
	<AnticipationScreen />
{/if}

<style>
	.premium-bg { background-color: var(--bg-page); min-height: 100dvh; display: flex; flex-direction: column; }
	.premium-header-minimal { display: flex; align-items: center; justify-content: space-between; padding: calc(16px + env(safe-area-inset-top)) 24px 16px; background: var(--bg-surface); border-bottom: 1px solid var(--ink-200); }
	.header-progress { display: flex; flex-direction: column; align-items: center; line-height: 1.1; }
	.session-index { font-size: 17px; font-weight: 900; color: var(--fg-primary); }
	.total-label { font-size: 10px; font-weight: 700; color: var(--fg-tertiary); text-transform: uppercase; }
	.close-btn { color: var(--fg-secondary); background: none; border: none; padding: 8px; cursor: pointer; }
	.type-viewer { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 18px; padding: 20px 0 8px; }
	.word-card { position: relative; background: var(--bg-surface); border: 1px solid var(--ink-200); border-radius: 28px; box-shadow: 0 4px 24px rgba(26,26,26,0.08); padding: 40px 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
	.audio-corner { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid var(--ink-200); background: var(--bg-muted); display: flex; align-items: center; justify-content: center; color: var(--fg-secondary); cursor: pointer; }
	.word-big { font-size: 56px; font-weight: 800; color: var(--fg-primary); line-height: 1; }
	.meaning-label { font-size: 16px; color: var(--fg-secondary); margin-top: 4px; }
	.romaji-line { font-size: 18px; font-weight: 700; color: var(--hinomaru-red); }

	:global(.word-big .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
	:global(.word-big .word-link:hover) {
		border-bottom-color: var(--hinomaru-red) !important;
	}

	.type-input { width: 100%; padding: 18px 20px; background: var(--bg-surface); border: 1.5px solid var(--ink-200); border-radius: 18px; font-size: 20px; font-weight: 700; color: var(--fg-primary); text-align: center; }
	.type-input.is-correct { border-color: var(--success); background: var(--success-wash); color: var(--success); }
	.type-input.is-wrong { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); color: var(--hinomaru-red); }
	.feedback-box { padding: 16px 18px; border-radius: 16px; border: 1.5px solid var(--ink-200); background: var(--bg-surface); }
	.feedback-box.correct { border-color: var(--success); background: var(--success-wash); }
	.feedback-box.wrong { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }
	.feedback-status { font-weight: 800; font-size: 16px; }
	.correct-answer { font-size: 14px; color: var(--fg-secondary); margin-top: 4px; }
	.example-section { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--ink-100); }
	.example-text { font-size: 16px; color: var(--fg-primary); font-weight: 600; }
	.example-romaji { font-size: 12px; color: var(--hinomaru-red); margin-top: 3px; font-weight: 700; }
	.example-translation { font-size: 13px; color: var(--fg-secondary); margin-top: 3px; }
</style>
