<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import {
		VolumeHighIcon,
		ArrowRight02Icon,
		BookOpen01Icon,
		TextFontIcon
	} from '@hugeicons/core-free-icons';
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { recordResult } from '$lib/stores/alphabetProgress';
	import {
		ALL_CHARS,
		type KanaChar,
		type KanaWord,
		shuffle,
		wordsForCharSet
	} from '$lib/data/alphabetCharacters';
	import AlphabetCharPractice from './AlphabetCharPractice.svelte';
	import AlphabetListenWord from './AlphabetListenWord.svelte';
	import { fadeIn, fadeUp } from '$lib/motion';

	interface Props {
		char: KanaChar;
		learnedJps: Set<string>;
		onClose: () => void;
		onLockChange?: (locked: boolean) => void;
	}

	let { char, learnedJps, onClose, onLockChange }: Props = $props();

	type View = 'menu' | 'practice' | 'word';
	let view = $state<View>('menu');
	let pickedWord = $state<KanaWord | null>(null);

	$effect(() => {
		onLockChange?.(view !== 'menu');
	});

	const availableWords = $derived(wordsForCharSet(char.jp, learnedJps, char.script));
	const canFormWord = $derived(availableWords.length > 0);

	function play() {
		speakJapanese(char.jp);
	}

	function startPractice() {
		view = 'practice';
	}

	function startWord() {
		if (!canFormWord) return;
		pickedWord = shuffle(availableWords)[0];
		view = 'word';
	}

	function backToMenu() {
		view = 'menu';
		pickedWord = null;
	}

	function onWordDone(ok: boolean) {
		if (pickedWord) {
			for (const jp of pickedWord.chars) {
				const kc = ALL_CHARS.find((x) => x.jp === jp && x.script === char.script);
				if (kc) recordResult(kc.id, ok);
			}
		}
		backToMenu();
	}
</script>

<div class="sheet-body">
	{#if view === 'menu'}
		<div class="char-card" use:fadeIn>
			<button class="audio-corner" onclick={play} aria-label="Reproducir">
				<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
			</button>
			<span class="jp char-glyph">{char.jp}</span>
			<span class="char-romaji">{char.romaji}</span>
		</div>

		<div class="actions" use:fadeUp={{ y: 12, delay: 0.05 }}>
			<button class="action-card" onclick={startPractice}>
				<div class="action-icon">
					<Icon icon={TextFontIcon} size={22} color="currentColor" />
				</div>
				<div class="action-text">
					<div class="action-title">
						{$locale === 'es' ? 'Practicar este carácter' : 'Practice this character'}
					</div>
					<div class="action-sub">
						{$locale === 'es' ? 'Sonido, lectura y escritura' : 'Sound, reading and writing'}
					</div>
				</div>
				<Icon icon={ArrowRight02Icon} size={16} color="currentColor" />
			</button>

			<button class="action-card" onclick={startWord} disabled={!canFormWord}>
				<div class="action-icon">
					<Icon icon={BookOpen01Icon} size={22} color="currentColor" />
				</div>
				<div class="action-text">
					<div class="action-title">
						{$locale === 'es' ? 'Formar una palabra' : 'Build a word'}
					</div>
					<div class="action-sub">
						{canFormWord
							? $locale === 'es'
								? `${availableWords.length} palabra(s) con los caracteres que conoces`
								: `${availableWords.length} word(s) using characters you know`
							: $locale === 'es'
								? 'Aprende más caracteres para formar palabras'
								: 'Learn more characters to build words'}
					</div>
				</div>
				<Icon icon={ArrowRight02Icon} size={16} color="currentColor" />
			</button>
		</div>
	{:else if view === 'practice'}
		<AlphabetCharPractice {char} {learnedJps} onDone={onClose} />
	{:else if view === 'word' && pickedWord}
		<AlphabetListenWord word={pickedWord} script={char.script} onAnswer={onWordDone} />
	{/if}
</div>

<style>
	.sheet-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.char-card {
		position: relative;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		box-shadow: 0 2px 12px rgba(26, 26, 26, 0.06);
		padding: 28px 20px 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
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
		transition: transform 0.1s;
	}
	.audio-corner:active {
		transform: scale(0.92);
	}

	.char-glyph {
		font-family: var(--font-jp);
		font-size: clamp(88px, 22vw, 120px);
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1;
	}

	.char-romaji {
		font-size: 20px;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--hinomaru-red);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		border-radius: 16px;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		color: var(--fg-primary);
		box-shadow: 0 1px 4px rgba(26, 26, 26, 0.04);
		transition: transform 0.1s, box-shadow 0.15s, border-color 0.15s;
		-webkit-tap-highlight-color: transparent;
	}
	.action-card:not(:disabled):hover {
		border-color: var(--ink-300);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(26, 26, 26, 0.08);
	}
	.action-card:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.action-icon {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.action-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.action-title {
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--fg-primary);
	}

	.action-sub {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}
</style>
