<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { buildSentence, type BuiltSentence } from '$lib/learning/sentenceBuilder';
	import { safeRomaji } from '$lib/utils/romaji';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import Icon from '$lib/Icon.svelte';
	import {
		ArrowLeft02Icon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		VolumeHighIcon
	} from '@hugeicons/core-free-icons';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeIn, fadeUp } from '$lib/motion';
	import { playCorrect, playWrong } from '$lib/utils/sounds';

	const props: { card: any; pool: any[]; onAnswer: (correct: boolean) => void } = $props();
	const card = $derived(props.card);
	const sentence: BuiltSentence | null = $derived(
		buildSentence(props.pool, card, $locale === 'es' ? 'es' : 'en')
	);

	interface Chip {
		tok: string;
		uid: number;
		romaji: string;
	}
	let bank: Chip[] = $state([]);
	let answer: Chip[] = $state([]);
	let locked = $state(false);
	let result: 'correct' | 'wrong' | null = $state(null);

	$effect(() => {
		if (sentence) {
			bank = sentence.shuffled.map((tok, i) => ({
				tok,
				uid: i,
				romaji: safeRomaji(undefined, tok)
			}));
			answer = [];
			locked = false;
			result = null;
		}
	});

	function add(c: Chip) {
		if (locked) return;
		answer = [...answer, c];
		bank = bank.filter((x) => x.uid !== c.uid);
	}
	function remove(c: Chip) {
		if (locked) return;
		bank = [...bank, c];
		answer = answer.filter((x) => x.uid !== c.uid);
	}
	function clearAnswer() {
		if (locked || !sentence) return;
		bank = sentence.shuffled.map((tok, i) => ({
			tok,
			uid: i,
			romaji: safeRomaji(undefined, tok)
		}));
		answer = [];
	}

	function playFull() {
		if (sentence) speakJapanese(sentence.tokens.join('') + sentence.suffix);
	}

	function check() {
		if (locked || !sentence) return;
		const got = answer.map((c) => c.tok);
		const ok =
			got.length === sentence.tokens.length && got.every((t, i) => t === sentence.tokens[i]);
		locked = true;
		result = ok ? 'correct' : 'wrong';
		if (ok) {
			playCorrect();
			playFull();
		} else {
			playWrong();
		}
		setTimeout(() => props.onAnswer(ok), ok ? 1100 : 1200);
	}

	const ready = $derived(answer.length > 0 && !locked);

	$effect(() => {
		if (!sentence) queueMicrotask(() => props.onAnswer(true));
	});
</script>

{#if sentence}
	<div class="build-viewer content-center">
		<div class="word-card" use:fadeIn>
			<button onclick={playFull} class="audio-corner" aria-label="Reproducir oración">
				<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
			</button>
			<span class="prompt-tag">{$locale === 'es' ? 'CONSTRUIR' : 'BUILD'}</span>
			<div class="sentence-translation">{sentence.translation}</div>
		</div>

		<div
			class="answer-zone"
			class:is-correct={result === 'correct'}
			class:is-wrong={result === 'wrong'}
		>
			{#if answer.length === 0}
				<div class="answer-placeholder">
					{$locale === 'es' ? 'Toca las palabras para empezar' : 'Tap words to start'}
				</div>
			{:else}
				{#each answer as chip (chip.uid)}
					<button
						class="token-chip is-selected"
						disabled={locked}
						onclick={() => remove(chip)}
					>
						<span class="chip-jp jp">{chip.tok}</span>
						{#if chip.romaji}<span class="chip-romaji">{chip.romaji}</span>{/if}
					</button>
				{/each}
			{/if}
		</div>

		<div class="tokens-bank">
			{#each bank as chip (chip.uid)}
				<button class="token-chip" onclick={() => add(chip)} disabled={locked}>
					<span class="chip-jp jp">{chip.tok}</span>
					{#if chip.romaji}<span class="chip-romaji">{chip.romaji}</span>{/if}
				</button>
			{/each}
		</div>

		{#if result}
			<div
				class="feedback-bar"
				class:is-correct={result === 'correct'}
				use:fadeUp={{ y: 10 }}
			>
				<Icon
					icon={result === 'correct' ? CheckmarkCircle01Icon : Cancel01Icon}
					size={18}
					color="currentColor"
				/>
				<span class="fb-label">
					{result === 'correct'
						? $locale === 'es' ? '¡Correcto!' : 'Correct!'
						: $locale === 'es' ? 'Incorrecto' : 'Incorrect'}
				</span>
				<button onclick={playFull} class="audio-mini" aria-label="Reproducir">
					<Icon icon={VolumeHighIcon} size={14} color="currentColor" />
				</button>
			</div>
			{#if result === 'correct'}
				<div class="reveal-row" use:fadeIn>
					<div class="reveal-jp jp">
						<InteractiveText text={sentence.tokens.join('') + sentence.suffix} />
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<StickyFooter>
		<div class="footer-row">
			{#if !locked && answer.length > 0}
				<button
					class="hm-btn hm-btn-secondary icon-btn"
					onclick={clearAnswer}
					aria-label="Limpiar"
				>
					<Icon icon={ArrowLeft02Icon} size={20} color="currentColor" />
				</button>
			{/if}
			<button
				class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg"
				disabled={!ready}
				onclick={check}
			>
				{$locale === 'es' ? 'Comprobar' : 'Check'}
			</button>
		</div>
	</StickyFooter>
{/if}

<style>
	.build-viewer {
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
		padding: 22px 20px 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
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
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.sentence-translation {
		font-size: 17px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.4;
	}

	.answer-zone {
		width: 100%;
		min-height: 110px;
		background: var(--bg-muted);
		border: 1.5px dashed var(--ink-200);
		border-radius: 20px;
		padding: 14px;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}
	.answer-zone.is-correct {
		border-color: var(--success);
		background: var(--success-wash);
		border-style: solid;
	}
	.answer-zone.is-wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		border-style: solid;
	}
	.answer-placeholder {
		color: var(--fg-tertiary);
		font-size: 14px;
		font-weight: 600;
		opacity: 0.6;
	}

	.tokens-bank {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
		width: 100%;
	}

	.token-chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 8px 14px;
		border-radius: 14px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		color: var(--fg-primary);
		cursor: pointer;
		box-shadow: 0 3px 0 var(--ink-200);
		transition: all 0.1s;
		font-family: inherit;
	}
	.token-chip:not(:disabled):active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 var(--ink-200);
	}
	.token-chip.is-selected {
		background: var(--fg-primary);
		color: white;
		border-color: var(--fg-primary);
		box-shadow: 0 3px 0 #000;
	}
	.token-chip:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.chip-jp {
		font-size: 18px;
		font-weight: 700;
		line-height: 1.1;
		font-family: var(--font-jp);
	}
	.chip-romaji {
		font-size: 11px;
		font-weight: 600;
		opacity: 0.75;
		color: var(--hinomaru-red);
	}
	.token-chip.is-selected .chip-romaji {
		color: rgba(255, 255, 255, 0.7);
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
		flex: 1;
	}
	.audio-mini {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1.5px solid currentColor;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: inherit;
		cursor: pointer;
	}

	.reveal-row {
		padding: 14px;
		background: var(--bg-surface);
		border: 1px solid var(--success);
		border-radius: 14px;
		text-align: center;
	}
	.reveal-jp {
		font-size: 22px;
		font-weight: 700;
		color: var(--fg-primary);
		font-family: var(--font-jp);
	}

	.footer-row {
		display: flex;
		gap: 10px;
		max-width: 480px;
		margin: 0 auto;
		width: 100%;
	}
	.icon-btn {
		width: 54px;
		height: 54px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	:global(.reveal-jp .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
</style>
