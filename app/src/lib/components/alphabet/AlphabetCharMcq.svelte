<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, CheckmarkCircle01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { fadeIn, fadeUp } from '$lib/motion';
	import type { KanaChar } from '$lib/data/alphabetCharacters';

	import StudySessionLayout from '$lib/components/study/StudySessionLayout.svelte';

	type Direction = 'sound_for_char' | 'char_for_sound';

	interface Props {
		mode?: 'deck' | 'lesson';
		target: KanaChar;
		options: KanaChar[];
		direction: Direction;
		onAnswer: (correct: boolean) => void;
	}

	let { mode = 'deck', target, options, direction, onAnswer }: Props = $props();
	const isLesson = $derived(mode === 'lesson');

	let picked = $state<string | null>(null);
	let isCorrect = $state(false);

	$effect(() => {
		void target;
		picked = null;
		isCorrect = false;
		if (direction === 'sound_for_char') {
			setTimeout(() => speakJapanese(target.jp), 250);
		}
	});

	function pick(opt: KanaChar) {
		if (picked) return;
		picked = opt.id;
		isCorrect = opt.id === target.id;
		if (isCorrect) playCorrect();
		else playWrong();
		setTimeout(() => onAnswer(isCorrect), 800);
	}

	function playTarget() {
		speakJapanese(target.jp);
	}

	function playOpt(e: MouseEvent | KeyboardEvent, opt: KanaChar) {
		e.stopPropagation();
		speakJapanese(opt.jp);
	}
</script>

<StudySessionLayout
	{isLesson}
	onExit={() => onAnswer(false)}
	currentIndex={0}
	totalCount={1}
>
	<div class="mcq-viewer content-center">
		<div class="word-card" use:fadeIn>
			<button onclick={playTarget} class="audio-corner" aria-label="Play pronunciation">
				<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
			</button>
			<span class="prompt-tag">
				{#if direction === 'sound_for_char'}
					{$locale === 'es' ? '¿QUÉ SONIDO?' : 'WHICH SOUND?'}
				{:else}
					{$locale === 'es' ? '¿QUÉ CARÁCTER?' : 'WHICH CHARACTER?'}
				{/if}
			</span>
			{#if direction === 'sound_for_char'}
				<div class="jp char-big">{target.jp}</div>
			{:else}
				<div class="rom-prompt">"{target.romaji}"</div>
			{/if}
		</div>

		<div class="options-list">
			{#each options as opt, idx (opt.id)}
				{@const isThisCorrect = opt.id === target.id}
				{@const isThisPicked = opt.id === picked}
				<button
					onclick={() => pick(opt)}
					class="option-item"
					class:is-correct={picked && isThisPicked && isThisCorrect}
					class:is-wrong={picked && isThisPicked && !isThisCorrect}
					class:is-dimmed={picked && !isThisPicked}
					disabled={!!picked}
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
						{#if direction === 'sound_for_char'}
							<span class="opt-text">{opt.romaji}</span>
						{:else}
							<span class="opt-text jp opt-text-big">{opt.jp}</span>
						{/if}
					</div>
					{#if direction === 'sound_for_char'}
						<span
							class="opt-audio"
							aria-label="play sound"
							role="button"
							tabindex="0"
							onclick={(e) => playOpt(e, opt)}
							onkeydown={(e) => e.key === 'Enter' && playOpt(e, opt)}
						>
							<Icon icon={VolumeHighIcon} size={14} color="currentColor" />
						</span>
					{/if}
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
					{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}
				</span>
			</div>
		{/if}
	</div>
</StudySessionLayout>

<style>
	.mcq-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 16px;
		padding: 20px 0 8px;
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
		font-weight: 800;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.char-big {
		font-size: clamp(72px, 18vw, 112px);
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1;
		font-family: var(--font-jp);
	}

	.rom-prompt {
		font-size: clamp(40px, 9vw, 56px);
		font-weight: 900;
		color: var(--fg-primary);
		letter-spacing: -0.04em;
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
		font-weight: 900;
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
		flex: 1;
		display: flex;
		align-items: center;
	}
	.opt-text {
		font-size: 18px;
		font-weight: 800;
		color: var(--fg-primary);
	}
	.opt-text-big {
		font-size: 32px;
		font-weight: 700;
		font-family: var(--font-jp);
		line-height: 1;
	}

	.opt-audio {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--bg-muted);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		flex-shrink: 0;
		border: 1px solid var(--ink-200);
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
		font-weight: 800;
	}
</style>
