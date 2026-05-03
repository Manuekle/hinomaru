<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { fade } from 'svelte/transition';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';

	const props: {
		card: any;
		distractors: any[];
		onAnswer: (correct: boolean) => void;
	} = $props();

	const card = $derived(props.card);
	const meaningKey = $derived($locale === 'es' ? 'es' : 'en');

	const options = $derived.by(() => {
		const target = card[meaningKey];
		const set = new Set<string>([target]);
		for (const d of props.distractors) {
			if (set.size >= 4) break;
			const v = d[meaningKey];
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
	let locked = $state(false);

	$effect(() => {
		card;
		played = false;
		picked = null;
		locked = false;
		// Auto-play on mount after short delay
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
		if (locked || !played) return;
		picked = opt;
		locked = true;
		const correct = opt === card[meaningKey];
		setTimeout(() => props.onAnswer(correct), correct ? 600 : 800);
	}
</script>

<div class="step-layout">
	<div class="step-header">
		<div class="step-instruction">
			{$locale === 'es' ? 'Escucha y elige el significado' : 'Listen and pick the meaning'}
		</div>
	</div>

	<div class="step-content">
		<button class="big-play" onclick={play} aria-label="Reproducir audio">
			<Icon icon={VolumeHighIcon} size={48} color="white" />
		</button>
		{#if !played}
			<div class="play-hint">
				{$locale === 'es' ? 'Toca para escuchar' : 'Tap to listen'}
			</div>
		{:else}
			<div class="play-hint replaying" in:fade>
				{$locale === 'es' ? 'Toca para repetir' : 'Tap to replay'}
			</div>
		{/if}
	</div>

	<div class="step-footer">
		{#if played}
			<div class="options-grid" in:fade={{ duration: 200 }}>
				{#each options as opt (opt)}
					<button
						class="option-pill"
						class:correct={locked && opt === card[meaningKey]}
						class:wrong={locked && picked === opt && opt !== card[meaningKey]}
						class:dim={locked && picked !== opt && opt !== card[meaningKey]}
						disabled={locked}
						onclick={() => pick(opt)}
					>
						{opt}
					</button>
				{/each}
			</div>
		{:else}
			<div class="waiting-hint" in:fade>
				{$locale === 'es' ? 'Las opciones aparecerán al escuchar' : 'Options appear after listening'}
			</div>
		{/if}
	</div>
</div>

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
		gap: 18px;
	}
	.big-play {
		width: 160px;
		height: 160px;
		border-radius: 50%;
		background: var(--hinomaru-red);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow:
			0 10px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black),
			0 12px 32px color-mix(in srgb, var(--hinomaru-red) 30%, transparent);
		transition: all 0.15s;
	}
	.big-play:active {
		transform: translateY(5px);
		box-shadow:
			0 5px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black),
			0 6px 16px color-mix(in srgb, var(--hinomaru-red) 30%, transparent);
	}
	.play-hint {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.play-hint.replaying {
		color: var(--fg-secondary);
	}
	.waiting-hint {
		text-align: center;
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 600;
		padding: 20px;
	}
	.step-footer {
		padding-top: 32px;
		min-height: 220px;
	}
	.options-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}
	.option-pill {
		padding: 18px 20px;
		background: var(--bg-surface);
		border: 2px solid var(--ink-100);
		border-radius: 20px;
		font-size: 15px;
		font-weight: 700;
		color: var(--sumi);
		text-align: left;
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
		transform: scale(1.02);
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
