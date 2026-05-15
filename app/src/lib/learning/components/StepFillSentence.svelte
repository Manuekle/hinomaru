<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import {
		buildSentence,
		pickDistractors,
		type BuiltSentence
	} from '$lib/learning/sentenceBuilder';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, CheckmarkCircle01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { fadeIn, fadeUp } from '$lib/motion';
	import { playCorrect, playWrong } from '$lib/utils/sounds';

	const props: {
		card: any;
		pool: any[];
		retries: number;
		onAnswer: (correct: boolean) => void;
	} = $props();

	const card = $derived(props.card);
	const sentence: BuiltSentence | null = $derived(
		buildSentence(props.pool, card, $locale === 'es' ? 'es' : 'en')
	);

	const blankIndex = $derived.by(() => {
		if (!sentence) return -1;
		return sentence.tokens.indexOf(sentence.primaryToken);
	});

	const options = $derived.by(() => {
		if (!sentence) return [] as string[];
		const distractors = pickDistractors(
			sentence.primaryToken,
			props.pool,
			sentence.primaryCategory,
			3
		);
		const merged = [sentence.primaryToken, ...distractors];
		for (let i = merged.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[merged[i], merged[j]] = [merged[j], merged[i]];
		}
		return merged;
	});

	let picked: string | null = $state(null);
	let isCorrect = $state(false);

	$effect(() => {
		card;
		picked = null;
		isCorrect = false;
	});

	function speakFull() {
		if (!sentence) return;
		speakJapanese(sentence.tokens.join('') + sentence.suffix);
	}

	$effect(() => {
		if (!sentence || blankIndex < 0) {
			queueMicrotask(() => props.onAnswer(true));
		}
	});

	function pick(opt: string) {
		if (picked || !sentence) return;
		picked = opt;
		isCorrect = opt === sentence.primaryToken;
		if (isCorrect) {
			playCorrect();
			speakFull();
		} else {
			playWrong();
		}
		setTimeout(() => props.onAnswer(isCorrect), isCorrect ? 900 : 1000);
	}
</script>

{#if sentence && blankIndex >= 0}
	<div class="fill-viewer content-center">
		<div class="word-card" use:fadeIn>
			<button onclick={speakFull} class="audio-corner" aria-label="Reproducir oración">
				<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
			</button>
			<span class="prompt-tag">{$locale === 'es' ? 'COMPLETAR' : 'COMPLETE'}</span>

			<div class="sentence-display">
				<InteractiveText text={sentence.tokens.slice(0, blankIndex).join('')} />
				<span class="sentence-blank" class:filled={picked && picked === sentence.primaryToken}>
					{picked && picked === sentence.primaryToken ? sentence.primaryToken : ''}
				</span>
				<InteractiveText text={sentence.tokens.slice(blankIndex + 1).join('') + sentence.suffix} />
			</div>

			<div class="sentence-translation">{sentence.translation}</div>

			{#if props.retries >= 1 && !picked}
				<div class="hint-banner" use:fadeUp={{ y: 10 }}>
					<span class="hint-tag">{$locale === 'es' ? 'PISTA' : 'HINT'}</span>
					<span class="hint-text">
						{$locale === 'es' ? sentence.primaryCard.es : sentence.primaryCard.en}
					</span>
				</div>
			{/if}
		</div>

		<div class="options-list">
			{#each options as opt, idx (opt)}
				{@const isThisCorrect = opt === sentence.primaryToken}
				{@const isThisPicked = opt === picked}
				<button
					class="option-item"
					class:is-correct={picked && isThisPicked && isThisCorrect}
					class:is-wrong={picked && isThisPicked && !isThisCorrect}
					class:is-dimmed={picked && !isThisPicked}
					disabled={!!picked}
					onclick={() => pick(opt)}
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
					<div class="opt-content">
						<span class="opt-text jp">{opt}</span>
					</div>
				</button>
			{/each}
		</div>

		{#if picked}
			<div class="feedback-bar" class:is-correct={isCorrect} use:fadeUp={{ y: 10 }}>
				<Icon
					icon={isCorrect ? CheckmarkCircle01Icon : Cancel01Icon}
					size={18}
					color="currentColor"
				/>
				<span class="fb-label">
					{isCorrect
						? $locale === 'es'
							? '¡Correcto!'
							: 'Correct!'
						: $locale === 'es'
							? 'Incorrecto'
							: 'Incorrect'}
				</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	.fill-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 16px;
		padding: 20px 20px 8px;
	}

	.word-card {
		position: relative;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		box-shadow: 0 2px 12px rgba(26, 26, 26, 0.06);
		padding: 24px 20px 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
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
	}

	.prompt-tag {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.sentence-display {
		font-family: var(--font-jp);
		font-size: clamp(20px, 5.4vw, 26px);
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.6;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 6px;
	}

	.sentence-blank {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 64px;
		height: 40px;
		padding: 0 12px;
		border-radius: 12px;
		border: 2px dashed var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		font-size: 22px;
	}
	.sentence-blank.filled {
		border-style: solid;
		background: var(--hinomaru-red);
		color: white;
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.2);
	}

	.sentence-translation {
		font-size: 14px;
		color: var(--fg-secondary);
		font-weight: 600;
	}

	.hint-banner {
		background: var(--bg-muted);
		padding: 8px 14px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		gap: 10px;
		border: 1px solid var(--ink-200);
	}
	.hint-tag {
		font-size: 10px;
		font-weight: 700;
		color: var(--hinomaru-red);
		background: white;
		padding: 2px 8px;
		border-radius: 6px;
		border: 1px solid var(--ink-100);
	}
	.hint-text {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-primary);
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
		transition:
			border-color 0.15s,
			background 0.15s,
			opacity 0.15s,
			transform 0.1s;
		width: 100%;
		-webkit-tap-highlight-color: transparent;
		font-family: inherit;
		box-shadow: 0 1px 4px rgba(26, 26, 26, 0.04);
	}
	.option-item:not(:disabled):hover {
		border-color: var(--ink-300);
		transform: translateY(-1px);
		box-shadow: 0 3px 10px rgba(26, 26, 26, 0.08);
	}
	.option-item.is-correct {
		border-color: var(--success) !important;
		background: var(--success-wash) !important;
	}
	.option-item.is-wrong {
		border-color: var(--hinomaru-red) !important;
		background: var(--hinomaru-red-wash) !important;
	}
	.option-item.is-dimmed {
		opacity: 0.55;
		filter: grayscale(0.4);
	}

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
		font-weight: 700;
		color: var(--fg-tertiary);
		flex-shrink: 0;
	}
	.option-item.is-correct .opt-marker {
		background: var(--success);
		border-color: var(--success);
		color: white;
	}
	.option-item.is-wrong .opt-marker {
		background: var(--hinomaru-red);
		border-color: var(--hinomaru-red);
		color: white;
	}

	.opt-content {
		display: flex;
		flex-direction: column;
	}
	.opt-text {
		font-size: 18px;
		font-weight: 700;
		color: var(--fg-primary);
		font-family: var(--font-jp);
	}

	.feedback-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 14px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}
	.feedback-bar.is-correct {
		background: var(--success-wash);
		color: var(--success);
	}
	.fb-label {
		font-size: 15px;
		font-weight: 700;
	}

	:global(.sentence-display .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
</style>
