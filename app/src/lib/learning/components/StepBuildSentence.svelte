<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { fade } from 'svelte/transition';
	import { speakJapanese } from '$lib/utils/tts';
	import { buildSentence, type BuiltSentence } from '$lib/learning/sentenceBuilder';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import Icon from '$lib/Icon.svelte';
	import { ArrowLeft02Icon, CheckmarkCircle01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeUp } from '$lib/motion';

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
		<div class="step-content">
			<div class="sentence-card">
				<div class="prompt-meta">
					<span class="prompt-tag">{$locale === 'es' ? 'CONSTRUIR' : 'BUILD'}</span>
				</div>
				<div class="sentence-translation">
					{sentence.translation}
				</div>
			</div>

			<div class="answer-zone" class:is-correct={result === 'correct'} class:is-wrong={result === 'wrong'}>
				{#if answer.length === 0}
					<div class="answer-placeholder">
						{$locale === 'es' ? 'Toca las palabras para empezar' : 'Tap words to start'}
					</div>
				{:else}
					{#each answer as chip (chip.uid)}
						<button class="token-chip is-selected" disabled={locked} onclick={() => removeFromAnswer(chip)}>
							{chip.tok}
						</button>
					{/each}
				{/if}
			</div>

			<div class="tokens-bank">
				{#each bank as chip (chip.uid)}
					<button class="token-chip" onclick={() => addToAnswer(chip)} disabled={locked}>
						{chip.tok}
					</button>
				{/each}
			</div>

			{#if result === 'correct'}
				<div class="sentence-reveal" in:fadeUp={{ y: 10 }}>
					<InteractiveText text={sentence.tokens.join('') + sentence.suffix} />
				</div>
			{/if}
		</div>

		<StickyFooter>
			<div class="footer-inner">
				<button class="hm-btn hm-btn-secondary icon-btn" onclick={clear} disabled={answer.length === 0 || locked} aria-label="Limpiar">
					<Icon icon={ArrowLeft02Icon} size={20} color="currentColor" />
				</button>
				
				{#if result === 'correct'}
					<div class="feedback-status is-success" in:fadeUp={{ y: 8 }}>
						<Icon icon={CheckmarkCircle01Icon} size={18} color="currentColor" />
						<span>{$locale === 'es' ? '¡Correcto!' : 'Correct!'}</span>
					</div>
				{:else if result === 'wrong'}
					<div class="feedback-status is-error" in:fadeUp={{ y: 8 }}>
						<Icon icon={Cancel01Icon} size={18} color="currentColor" />
						<span>{$locale === 'es' ? 'Incorrecto' : 'Incorrect'}</span>
					</div>
				{:else}
					<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" disabled={!ready} onclick={check}>
						{$locale === 'es' ? 'Comprobar' : 'Check'}
					</button>
				{/if}
			</div>
		</StickyFooter>
	</div>
{/if}

<style>
	.step-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 20px;
	}

	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 24px;
	}

	.sentence-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 16px 20px 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		text-align: center;
		box-shadow: 0 4px 16px rgba(26,26,26,0.04);
	}

	.prompt-meta {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.prompt-tag {
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 3px 8px;
		border-radius: 20px;
	}

	.sentence-translation {
		font-size: 17px;
		font-weight: 600;
		color: var(--fg-secondary);
		line-height: 1.4;
	}

	.answer-zone {
		width: 100%;
		min-height: 110px;
		background: var(--bg-muted);
		border: 1.5px dashed var(--ink-200);
		border-radius: 24px;
		padding: 16px;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.answer-zone.is-correct { border-color: var(--success); background: var(--success-wash); border-style: solid; }
	.answer-zone.is-wrong { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); border-style: solid; animation: shake 0.4s both; }

	.answer-placeholder { color: var(--fg-tertiary); font-size: 14px; font-weight: 600; opacity: 0.6; }

	.tokens-bank {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		width: 100%;
	}

	.token-chip {
		font-family: var(--font-jp);
		font-size: 18px;
		font-weight: 700;
		padding: 10px 18px;
		border-radius: 14px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		color: var(--fg-primary);
		cursor: pointer;
		box-shadow: 0 3px 0 var(--ink-200);
		transition: all 0.1s;
	}

	.token-chip:not(:disabled):active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink-200); }
	
	.token-chip.is-selected {
		background: var(--fg-primary);
		color: white;
		border-color: var(--fg-primary);
		box-shadow: 0 3px 0 #000;
	}

	.token-chip:disabled { opacity: 0.4; cursor: default; }

	.footer-inner { flex: 1; display: flex; gap: 12px; align-items: center; max-width: 480px; margin: 0 auto; }

	.icon-btn { width: 54px; height: 54px; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

	.feedback-status {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px;
		border-radius: 16px;
		font-weight: 800;
		font-size: 15px;
	}

	.feedback-status.is-success { color: var(--success); background: var(--success-wash); }
	.feedback-status.is-error { color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }

	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}

	.sentence-reveal {
		font-family: var(--font-jp);
		font-size: 24px;
		font-weight: 700;
		color: var(--fg-primary);
		margin-top: 10px;
		padding: 12px;
		background: var(--bg-surface);
		border-radius: 16px;
		border: 1px solid var(--success);
		box-shadow: 0 4px 12px var(--success-wash);
	}

	:global(.sentence-reveal .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
	:global(.sentence-reveal .word-link:hover) {
		border-bottom-color: var(--hinomaru-red) !important;
	}
</style>
