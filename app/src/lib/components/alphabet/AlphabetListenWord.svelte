<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import {
		VolumeHighIcon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		ArrowLeft02Icon
	} from '@hugeicons/core-free-icons';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { ALL_CHARS, type KanaWord } from '$lib/data/alphabetCharacters';
	import { fadeIn, fadeUp } from '$lib/motion';

	import StickyFooter from '$lib/components/StickyFooter.svelte';

	interface Props {
		mode?: 'deck' | 'lesson';
		word: KanaWord;
		script: 'hiragana' | 'katakana';
		onAnswer: (correct: boolean) => void;
	}

	let { mode = 'deck', word, script, onAnswer }: Props = $props();
	const isLesson = $derived(mode === 'lesson');

	interface Chip {
		tok: string;
		romaji?: string;
		uid: number;
	}

	let bank = $state<Chip[]>([]);
	let answer = $state<Chip[]>([]);
	let locked = $state(false);
	let result = $state<'correct' | 'wrong' | null>(null);

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	$effect(() => {
		void word;
		const tokens = word.chars;
		const distractors: string[] = [];
		const candidates = ALL_CHARS.filter((c) => c.script === script && !tokens.includes(c.jp));
		for (const x of shuffle(candidates).slice(0, Math.min(3, 6 - tokens.length))) {
			distractors.push(x.jp);
		}
		const all = shuffle([...tokens, ...distractors]);
		bank = all.map((tok, i) => {
			const kc = ALL_CHARS.find((c) => c.jp === tok && c.script === script);
			return { tok, romaji: kc?.romaji, uid: i };
		});
		answer = [];
		locked = false;
		result = null;
		setTimeout(() => speakJapanese(word.jp), 300);
	});

	function add(c: Chip) {
		if (locked) return;
		answer = [...answer, c];
		bank = bank.filter((x) => x.uid !== c.uid);
		speakJapanese(c.tok);
	}

	function remove(c: Chip) {
		if (locked) return;
		bank = [...bank, c];
		answer = answer.filter((x) => x.uid !== c.uid);
	}

	function clearAnswer() {
		if (locked) return;
		bank = [...bank, ...answer];
		answer = [];
	}

	function play() {
		speakJapanese(word.jp);
	}

	function check() {
		if (locked || answer.length === 0) return;
		locked = true;
		const got = answer.map((c) => c.tok).join('');
		const expected = word.chars.join('');
		const ok = got === expected;
		result = ok ? 'correct' : 'wrong';
		if (ok) {
			playCorrect();
			speakJapanese(word.jp);
		} else {
			playWrong();
		}
		setTimeout(() => onAnswer(ok), 1200);
	}

	const ready = $derived(answer.length > 0 && !locked);
</script>

<div class="lw-viewer content-center">
	<div class="word-card" use:fadeIn>
		<button onclick={play} class="audio-corner" aria-label="Reproducir audio">
			<Icon icon={VolumeHighIcon} size={16} color="currentColor" />
		</button>
		<span class="prompt-tag">{$locale === 'es' ? 'ESCUCHA Y FORMA' : 'LISTEN & BUILD'}</span>
		<p class="hint">{$locale === 'es' ? word.es : word.en}</p>
	</div>

	<div
		class="answer-zone"
		class:is-correct={result === 'correct'}
		class:is-wrong={result === 'wrong'}
	>
		{#if answer.length === 0}
			<div class="answer-placeholder">
				{$locale === 'es' ? 'Toca los caracteres' : 'Tap characters'}
			</div>
		{:else}
			{#each answer as chip (chip.uid)}
				<button class="token-chip is-selected" disabled={locked} onclick={() => remove(chip)}>
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
		<div class="feedback-bar" class:is-correct={result === 'correct'} use:fadeUp={{ y: 10 }}>
			<Icon
				icon={result === 'correct' ? CheckmarkCircle01Icon : Cancel01Icon}
				size={18}
				color="currentColor"
			/>
			<span class="fb-label">
				{result === 'correct'
					? $locale === 'es'
						? '¡Correcto!'
						: 'Correct!'
					: $locale === 'es'
						? `Era: ${word.jp}`
						: `Was: ${word.jp}`}
			</span>
		</div>
	{/if}
</div>

{#if word}
	<StickyFooter onBack={(!locked && answer.length > 0) ? clearAnswer : undefined}>
		<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={check} disabled={!ready}>
			{t('session.check', $locale)}
		</button>
	</StickyFooter>
{/if}

<style>
	.lw-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 4px 0 0;
		min-height: 420px;
	}

	.word-card {
		position: relative;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		box-shadow: 0 2px 12px rgba(26, 26, 26, 0.06);
		padding: 22px 20px 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		text-align: center;
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

	.audio-corner {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: transform 0.1s;
	}
	.audio-corner:active {
		transform: scale(0.92);
	}

	.hint {
		font-size: 14px;
		color: var(--fg-secondary);
		margin: 0;
	}

	.answer-zone {
		width: 100%;
		min-height: 90px;
		background: var(--bg-muted);
		border: 1.5px dashed var(--ink-200);
		border-radius: 18px;
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
		font-size: 13px;
		font-weight: 600;
		opacity: 0.6;
	}

	.tokens-bank {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		width: 100%;
		padding: 0 4px;
	}

	.token-chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		padding: 8px 14px;
		border-radius: 12px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		color: var(--fg-primary);
		cursor: pointer;
		box-shadow: 0 3px 0 var(--ink-200);
		transition: all 0.1s;
		font-family: inherit;
		min-width: 44px;
	}
	.token-chip:not(:disabled):active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 var(--ink-200);
	}
	.token-chip.is-selected {
		background: var(--fg-primary);
		color: var(--washi);
		border-color: var(--fg-primary);
		box-shadow: 0 3px 0 var(--ink-300);
	}
	.token-chip.is-selected .chip-jp {
		color: var(--washi);
	}
	.token-chip:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.chip-jp {
		font-size: 20px;
		font-weight: 700;
		line-height: 1;
		font-family: var(--font-jp);
	}
	.chip-romaji {
		font-size: 11px;
		font-weight: 600;
		opacity: 0.75;
		color: var(--hinomaru-red);
		line-height: 1;
	}
	.token-chip.is-selected .chip-romaji {
		color: var(--washi);
		opacity: 0.7;
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

	.icon-btn {
		width: 54px;
		height: 54px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.footer-actions {
		display: flex;
		gap: 10px;
		width: 100%;
	}
</style>
