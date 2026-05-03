<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { fade } from 'svelte/transition';
	import { speakJapanese } from '$lib/utils/tts';
	import { buildSentence, type BuiltSentence } from '$lib/learning/sentenceBuilder';
	import Icon from '$lib/Icon.svelte';
	import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';

	const props: { card: any; pool: any[]; onAnswer: (correct: boolean) => void } = $props();
	const card = $derived(props.card);
	const sentence: BuiltSentence | null = $derived(
		buildSentence(props.pool, card, $locale === 'es' ? 'es' : 'en')
	);

	// Bank holds {tok, origIdx} so duplicate tokens (rare) can be tracked individually.
	interface Chip {
		tok: string;
		uid: number;
	}
	let bank: Chip[] = $state([]);
	let answer: Chip[] = $state([]);
	let locked = $state(false);
	let result: 'correct' | 'wrong' | null = $state(null);

	$effect(() => {
		// reset when sentence changes (card change)
		if (sentence) {
			bank = sentence.shuffled.map((tok, i) => ({ tok, uid: i }));
			answer = [];
			locked = false;
			result = null;
		}
	});

	function addToAnswer(chip: Chip) {
		if (locked) return;
		answer = [...answer, chip];
		bank = bank.filter((c) => c.uid !== chip.uid);
	}

	function removeFromAnswer(chip: Chip) {
		if (locked) return;
		bank = [...bank, chip];
		answer = answer.filter((c) => c.uid !== chip.uid);
	}

	function clear() {
		if (locked || !sentence) return;
		bank = sentence.shuffled.map((tok, i) => ({ tok, uid: i }));
		answer = [];
	}

	function check() {
		if (locked || !sentence) return;
		const got = answer.map((c) => c.tok);
		const correct =
			got.length === sentence.tokens.length &&
			got.every((t, i) => t === sentence.tokens[i]);
		locked = true;
		result = correct ? 'correct' : 'wrong';
		if (correct) {
			speakJapanese(sentence.tokens.join('') + sentence.suffix);
		}
		setTimeout(() => {
			if (!correct) {
				locked = false;
				result = null;
			}
			props.onAnswer(correct);
		}, correct ? 1100 : 1200);
	}

	const ready = $derived(answer.length > 0 && bank.length === 0);

	$effect(() => {
		if (!sentence) queueMicrotask(() => props.onAnswer(true));
	});
</script>

{#if sentence}
	<div class="step-layout">
		<div class="step-header">
			<div class="step-instruction">
				{$locale === 'es' ? 'Construye la frase' : 'Build the sentence'}
			</div>
		</div>

		<div class="step-content">
			<div class="sentence-translation">
				{sentence.translation}
			</div>

			<div class="answer-zone" class:correct={result === 'correct'} class:wrong={result === 'wrong'}>
				{#if answer.length === 0}
					<div class="answer-placeholder">
						{$locale === 'es' ? 'Toca las palabras para empezar' : 'Tap words to start'}
					</div>
				{:else}
					{#each answer as chip (chip.uid)}
						<button class="token-pill selected" disabled={locked} onclick={() => removeFromAnswer(chip)}>
							{chip.tok}
						</button>
					{/each}
				{/if}
			</div>

			<div class="tokens-bank">
				{#each bank as chip (chip.uid)}
					<button class="token-pill" onclick={() => addToAnswer(chip)} disabled={locked}>
						{chip.tok}
					</button>
				{/each}
			</div>
		</div>

		<div class="step-footer">
			<div class="footer-actions">
				<button class="clear-btn" onclick={clear} disabled={answer.length === 0 || locked} aria-label="Limpiar">
					<Icon icon={ArrowLeft02Icon} size={20} color="var(--fg-secondary)" />
				</button>
				
				{#if result === 'correct'}
					<div class="feedback-badge success" in:fade>
						✓ {$locale === 'es' ? '¡Correcto!' : 'Correct!'}
					</div>
				{:else if result === 'wrong'}
					<div class="feedback-badge error" in:fade>
						✗ {$locale === 'es' ? 'Incorrecto' : 'Incorrect'}
					</div>
				{:else}
					<button class="check-btn" disabled={!ready} onclick={check}>
						{$locale === 'es' ? 'Comprobar' : 'Check'}
					</button>
				{/if}
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
		padding-bottom: 16px;
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

	.sentence-translation {
		font-size: 18px;
		font-weight: 700;
		color: var(--sumi);
		text-align: center;
		font-style: italic;
		max-width: 90%;
		line-height: 1.4;
	}

	.answer-zone {
		width: 100%;
		min-height: 120px;
		background: var(--bg-surface);
		border: 2px dashed var(--ink-200);
		border-radius: 32px;
		padding: 20px;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}
	.answer-zone.correct {
		border-color: var(--success);
		background: color-mix(in srgb, var(--success) 5%, transparent);
		border-style: solid;
	}
	.answer-zone.wrong {
		border-color: var(--hinomaru-red);
		background: color-mix(in srgb, var(--hinomaru-red) 5%, transparent);
		border-style: solid;
		animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
	}

	.answer-placeholder {
		color: var(--fg-tertiary);
		font-size: 15px;
		font-weight: 700;
		opacity: 0.5;
	}

	.tokens-bank {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		min-height: 60px;
		width: 100%;
	}

	.token-pill {
		font-family: var(--font-jp);
		font-size: 19px;
		font-weight: 800;
		padding: 14px 22px;
		border-radius: 20px;
		background: var(--bg-surface);
		border: 2px solid var(--ink-100);
		color: var(--sumi);
		cursor: pointer;
		box-shadow: 0 4px 0 var(--ink-100);
		transition: all 0.1s;
	}
	.token-pill:not(:disabled):active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 var(--ink-100);
	}
	.token-pill.selected {
		background: var(--sumi);
		color: white;
		border-color: var(--sumi);
		box-shadow: 0 4px 0 color-mix(in srgb, var(--sumi) 60%, black);
	}
	.token-pill:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.step-footer {
		padding-top: 32px;
	}

	.footer-actions {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.clear-btn {
		width: 56px;
		height: 56px;
		border-radius: 20px;
		background: var(--ink-50);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.2s;
	}
	.clear-btn:active { background: var(--ink-100); }
	.clear-btn:disabled { opacity: 0.3; cursor: default; }

	.check-btn {
		flex: 1;
		padding: 18px;
		background: var(--hinomaru-red);
		color: white;
		font-size: 16px;
		font-weight: 800;
		border: none;
		border-radius: 20px;
		cursor: pointer;
		box-shadow: 0 6px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
		transition: all 0.1s;
	}
	.check-btn:disabled {
		background: var(--ink-100);
		color: var(--fg-tertiary);
		box-shadow: 0 6px 0 var(--ink-200);
		cursor: default;
	}
	.check-btn:not(:disabled):active {
		transform: translateY(3px);
		box-shadow: 0 3px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
	}

	.feedback-badge {
		flex: 1;
		text-align: center;
		font-size: 17px;
		font-weight: 900;
		padding: 16px;
		border-radius: 20px;
	}
	.feedback-badge.success {
		color: var(--success);
		background: color-mix(in srgb, var(--success) 10%, transparent);
	}
	.feedback-badge.error {
		color: var(--hinomaru-red);
		background: color-mix(in srgb, var(--hinomaru-red) 10%, transparent);
	}

	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}
</style>
