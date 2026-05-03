<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { fade } from 'svelte/transition';
	import { speakJapanese } from '$lib/utils/tts';
	import { buildSentence, pickDistractors, type BuiltSentence } from '$lib/learning/sentenceBuilder';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';

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
		<div class="step-header">
			<div class="step-instruction">
				{$locale === 'es' ? 'Completa la frase' : 'Complete the sentence'}
			</div>
		</div>

		<div class="step-content">
			<div class="sentence-box">
				<button class="speak-btn" onclick={speakFull} aria-label="Reproducir">
					<Icon icon={VolumeHighIcon} size={22} color="var(--hinomaru-red)" />
				</button>
				
				<div class="sentence-display">
					{#each sentence.tokens as tok, i}
						{#if i === blankIndex}
							<div class="sentence-blank" class:filled={locked && picked === sentence.primaryToken}>
								{locked && picked === sentence.primaryToken ? sentence.primaryToken : ''}
							</div>
						{:else}
							<span class="sentence-tok">{tok}</span>
						{/if}
					{/each}
					{#if sentence.suffix}<span class="sentence-tok">{sentence.suffix}</span>{/if}
				</div>

				<div class="sentence-translation">
					{sentence.translation}
				</div>
			</div>

			{#if props.retries >= 1 && !locked}
				<div class="hint-card" in:fade>
					<span class="hint-label">{$locale === 'es' ? 'Pista' : 'Hint'}</span>
					<span class="hint-text">
						{$locale === 'es' ? sentence.primaryCard.es : sentence.primaryCard.en}
					</span>
				</div>
			{/if}
		</div>

		<div class="step-footer">
			<div class="options-grid">
				{#each options as opt (opt)}
					<button
						class="option-pill"
						class:correct={locked && opt === sentence.primaryToken}
						class:wrong={locked && wrongPick === opt}
						class:dim={locked && picked !== opt && opt !== sentence.primaryToken}
						disabled={locked}
						onclick={() => pick(opt)}
					>
						{opt}
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
	}

	.step-header {
		padding-bottom: 24px;
		text-align: center;
	}

	.step-instruction {
		font-size: 14px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--fg-tertiary);
	}

	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 32px;
	}

	.sentence-box {
		width: 100%;
		background: var(--bg-surface);
		border-radius: 32px;
		padding: 40px 24px;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.speak-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--ink-50);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: transform 0.2s;
	}
	.speak-btn:active { transform: scale(0.9); }

	.sentence-display {
		font-family: var(--font-jp);
		font-size: clamp(24px, 7vw, 32px);
		font-weight: 700;
		color: var(--sumi);
		line-height: 1.6;
		text-align: center;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 8px;
	}

	.sentence-blank {
		min-width: 60px;
		height: 48px;
		padding: 0 12px;
		border-radius: 12px;
		border: 2px dashed var(--hinomaru-red);
		background: color-mix(in srgb, var(--hinomaru-red) 5%, transparent);
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
		box-shadow: 0 4px 12px color-mix(in srgb, var(--hinomaru-red) 30%, transparent);
	}

	.sentence-translation {
		font-size: 15px;
		color: var(--fg-secondary);
		font-style: italic;
		opacity: 0.8;
	}

	.hint-card {
		background: var(--ink-50);
		padding: 12px 20px;
		border-radius: 16px;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.hint-label {
		font-size: 11px;
		font-weight: 900;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		opacity: 0.7;
	}
	.hint-text {
		font-size: 14px;
		font-weight: 700;
		color: var(--sumi);
	}

	.step-footer {
		padding-top: 32px;
	}

	.options-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.option-pill {
		padding: 18px 12px;
		background: var(--bg-surface);
		border: 2px solid var(--ink-100);
		border-radius: 20px;
		font-family: var(--font-jp);
		font-size: 18px;
		font-weight: 800;
		color: var(--sumi);
		cursor: pointer;
		transition: all 0.2s;
	}

	.option-pill:not(:disabled):active {
		transform: translateY(2px);
		border-color: var(--ink-300);
	}

	.option-pill.correct {
		background: var(--success);
		border-color: var(--success);
		color: white;
		box-shadow: 0 4px 12px color-mix(in srgb, var(--success) 30%, transparent);
		transform: scale(1.05);
	}

	.option-pill.wrong {
		background: var(--hinomaru-red);
		border-color: var(--hinomaru-red);
		color: white;
		animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
	}

	.option-pill.dim {
		opacity: 0.3;
		filter: grayscale(0.5);
	}

	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}
</style>
