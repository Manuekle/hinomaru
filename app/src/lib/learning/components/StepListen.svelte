<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { safeRomaji } from '$lib/utils/romaji';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import Icon from '$lib/Icon.svelte';
	import {
		VolumeHighIcon,
		CheckmarkCircle01Icon,
		Cancel01Icon
	} from '@hugeicons/core-free-icons';
	import { fadeIn, fadeUp } from '$lib/motion';

	const props: {
		card: any;
		distractors: any[];
		onAnswer: (correct: boolean) => void;
	} = $props();

	const card = $derived(props.card);
	const options = $derived.by(() => {
		const target = card.jp;
		const set = new Set<string>([target]);
		for (const d of props.distractors) {
			if (set.size >= 4) break;
			const v = d.jp;
			if (v && !set.has(v)) set.add(v);
		}
		const arr = [...set];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	});

	let played = $state(false);
	let picked: string | null = $state(null);
	let isCorrect = $state(false);

	$effect(() => {
		card;
		played = false;
		picked = null;
		isCorrect = false;
		setTimeout(() => {
			speakJapanese(card.jp);
			played = true;
		}, 300);
	});

	function play() {
		speakJapanese(card.jp);
		played = true;
	}

	function pick(opt: string) {
		if (picked || !played) return;
		picked = opt;
		isCorrect = opt === card.jp;
		if (isCorrect) playCorrect();
		else playWrong();
		setTimeout(() => props.onAnswer(isCorrect), 800);
	}
</script>

<div class="quiz-viewer content-center">
	<div class="word-card" use:fadeIn>
		<button onclick={play} class="audio-corner" aria-label="Play pronunciation">
			<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
		</button>
		<span class="prompt-tag">{$locale === 'es' ? 'ESCUCHAR' : 'LISTEN'}</span>
		<button
			class="big-audio-btn"
			class:is-playing={played}
			onclick={play}
			aria-label="Reproducir audio"
		>
			<Icon icon={VolumeHighIcon} size={36} color="white" />
		</button>
		{#if picked}
			<div class="result-jp jp">
				<InteractiveText text={card.jp} />
			</div>
			<div class="result-rom">{safeRomaji(card.romaji, card.jp)}</div>
		{:else}
			<div class="play-hint">
				{#if !played}
					{$locale === 'es' ? 'Toca para escuchar' : 'Tap to listen'}
				{:else}
					{$locale === 'es' ? 'Toca para repetir' : 'Tap to replay'}
				{/if}
			</div>
		{/if}
	</div>

	<div class="options-list">
		{#each options as opt, idx (opt)}
			{@const itIsCorrect = opt === card.jp}
			{@const itIsPicked = opt === picked}
			<button
				class="option-item"
				class:is-correct={picked && itIsPicked && itIsCorrect}
				class:is-wrong={picked && itIsPicked && !itIsCorrect}
				class:is-dimmed={picked && !itIsPicked}
				disabled={!!picked || !played}
				onclick={() => pick(opt)}
			>
				<div class="opt-marker">
					{#if picked && itIsPicked && itIsCorrect}
						<Icon icon={CheckmarkCircle01Icon} size={14} color="white" />
					{:else if picked && itIsPicked && !itIsCorrect}
						<Icon icon={Cancel01Icon} size={14} color="white" />
					{:else}
						{String.fromCharCode(65 + idx)}
					{/if}
				</div>
				<div class="opt-content">
					<span class="opt-text jp">{opt}</span>
					<span class="opt-romaji">{safeRomaji(undefined, opt)}</span>
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
					? $locale === 'es' ? '¡Correcto!' : 'Correct!'
					: $locale === 'es' ? 'Incorrecto' : 'Incorrect'}
			</span>
		</div>
	{/if}
</div>

<style>
	.quiz-viewer {
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

	.big-audio-btn {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--hinomaru-red), #d4002f);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 10px 28px rgba(188, 0, 45, 0.3);
		color: white;
		transition: transform 0.15s;
	}
	.big-audio-btn:active {
		transform: scale(0.94);
	}

	.play-hint {
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-secondary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.result-jp {
		font-size: 28px;
		font-weight: 700;
		color: var(--fg-primary);
		font-family: var(--font-jp);
	}
	.result-rom {
		font-size: 14px;
		font-weight: 700;
		color: var(--hinomaru-red);
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
		transition: border-color 0.15s, background 0.15s, opacity 0.15s, transform 0.1s;
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
		font-size: 16px;
		font-weight: 700;
		color: var(--fg-primary);
	}
	.opt-romaji {
		font-size: 11px;
		font-weight: 600;
		color: var(--hinomaru-red);
		opacity: 0.8;
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

	:global(.result-jp .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
</style>
