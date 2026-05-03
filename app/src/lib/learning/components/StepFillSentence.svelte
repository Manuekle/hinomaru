<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { fade } from 'svelte/transition';
	import { speakJapanese } from '$lib/utils/tts';
	import { buildSentence, pickDistractors, type BuiltSentence } from '$lib/learning/sentenceBuilder';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, CheckmarkCircle01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { fadeUp } from '$lib/motion';

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
		// shuffle
		for (let i = merged.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[merged[i], merged[j]] = [merged[j], merged[i]];
		}
		return merged;
	});

	let picked: string | null = $state(null);
	let locked = $state(false);

	$effect(() => {
		card;
		picked = null;
		locked = false;
	});

	function speakFull() {
		if (!sentence) return;
		speakJapanese(sentence.tokens.join('') + sentence.suffix);
	}

	let wrongPick: string | null = $state(null);

	// Auto-skip if no template can be built around this card.
	$effect(() => {
		if (!sentence || blankIndex < 0) {
			queueMicrotask(() => props.onAnswer(true));
		}
	});

	function pick(opt: string) {
		if (locked || !sentence) return;
		picked = opt;
		locked = true;
		const correct = opt === sentence.primaryToken;
		if (correct) {
			speakFull();
			wrongPick = null;
		} else {
			wrongPick = opt;
		}
		setTimeout(() => props.onAnswer(correct), correct ? 800 : 900);
	}
</script>

{#if sentence && blankIndex >= 0}
	<div class="step-layout">
		<div class="step-content">
			<div class="sentence-card">
				<div class="prompt-meta">
					<span class="prompt-tag">{$locale === 'es' ? 'COMPLETAR' : 'COMPLETE'}</span>
					<button class="audio-mini" onclick={speakFull} aria-label="Reproducir">
						<Icon icon={VolumeHighIcon} size={16} color="currentColor" />
					</button>
				</div>
				
				<div class="sentence-display">
					<InteractiveText text={sentence.tokens.slice(0, blankIndex).join('')} />
					<div class="sentence-blank" class:filled={locked && picked === sentence.primaryToken}>
						{locked && picked === sentence.primaryToken ? sentence.primaryToken : ''}
					</div>
					<InteractiveText text={sentence.tokens.slice(blankIndex + 1).join('') + sentence.suffix} />
				</div>

				<div class="sentence-translation">
					{sentence.translation}
				</div>
			</div>

			{#if props.retries >= 1 && !locked}
				<div class="hint-banner" in:fadeUp={{ y: 10 }}>
					<span class="hint-tag">{$locale === 'es' ? 'PISTA' : 'HINT'}</span>
					<span class="hint-text">
						{$locale === 'es' ? sentence.primaryCard.es : sentence.primaryCard.en}
					</span>
				</div>
			{/if}
		</div>

		<div class="step-footer">
			<div class="options-grid">
				{#each options as opt, idx (opt)}
					{@const isThisCorrect = opt === sentence.primaryToken}
					{@const isThisPicked = opt === picked}
					<button
						class="option-item"
						class:is-correct={locked && isThisPicked && isThisCorrect}
						class:is-wrong={locked && isThisPicked && !isThisCorrect}
						class:is-dimmed={locked && !isThisPicked}
						disabled={locked}
						onclick={() => pick(opt)}
					>
						<div class="opt-marker">
							{#if locked && isThisPicked && isThisCorrect}
								<Icon icon={CheckmarkCircle01Icon} size={14} color="white" />
							{:else if locked && isThisPicked && !isThisCorrect}
								<Icon icon={Cancel01Icon} size={14} color="white" />
							{:else}
								{String.fromCharCode(65 + idx)}
							{/if}
						</div>
						<span class="opt-text jp">{opt}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.step-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 24px;
	}

	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 20px;
	}

	.sentence-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		box-shadow: 0 8px 32px rgba(26,26,26,0.06);
		padding: 18px 22px 28px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
		text-align: center;
	}

	.prompt-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.prompt-tag {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.audio-mini {
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
	}

	.sentence-display {
		font-family: var(--font-jp);
		font-size: clamp(22px, 6vw, 28px);
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.6;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 8px;
	}

	.sentence-blank {
		min-width: 64px;
		height: 44px;
		padding: 0 14px;
		border-radius: 12px;
		border: 2px dashed var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--hinomaru-red);
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	
	.sentence-blank.filled {
		border-style: solid;
		background: var(--hinomaru-red);
		color: white;
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.2);
	}

	.sentence-translation {
		font-size: 15px;
		color: var(--fg-secondary);
		font-weight: 500;
		font-style: italic;
	}

	.hint-banner {
		background: var(--bg-muted);
		padding: 10px 16px;
		border-radius: 16px;
		display: flex;
		align-items: center;
		gap: 10px;
		border: 1px solid var(--ink-200);
	}

	.hint-tag {
		font-size: 10px;
		font-weight: 900;
		color: var(--hinomaru-red);
		background: white;
		padding: 2px 8px;
		border-radius: 6px;
		border: 1px solid var(--ink-100);
	}

	.hint-text {
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.step-footer {
		padding-bottom: 24px;
	}

	.options-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.option-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px;
		border: 1.5px solid var(--ink-200);
		border-radius: 14px;
		background: var(--bg-surface);
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 1px 4px rgba(26,26,26,0.04);
	}

	.option-item:not(:disabled):hover {
		border-color: var(--ink-300);
		transform: translateY(-1px);
	}

	.option-item.is-correct { border-color: var(--success) !important; background: var(--success-wash) !important; }
	.option-item.is-wrong { border-color: var(--hinomaru-red) !important; background: var(--hinomaru-red-wash) !important; }
	.option-item.is-dimmed { opacity: 0.55; filter: grayscale(0.4); }

	.opt-marker {
		width: 24px;
		height: 24px;
		border-radius: 6px;
		background: var(--bg-muted);
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: 900;
		color: var(--fg-tertiary);
		flex-shrink: 0;
	}

	.option-item.is-correct .opt-marker { background: var(--success); border-color: var(--success); color: white; }
	.option-item.is-wrong .opt-marker { background: var(--hinomaru-red); border-color: var(--hinomaru-red); color: white; }

	.opt-text { font-size: 15px; font-weight: 700; color: var(--fg-primary); }

	:global(.sentence-display .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
	:global(.sentence-display .word-link:hover) {
		border-bottom-color: var(--hinomaru-red) !important;
	}
</style>
