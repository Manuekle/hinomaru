<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';

	const props: {
		card: any;
		pool: any[];
		onAnswer: (correct: boolean) => void;
	} = $props();

	const card = $derived(props.card);

	const options = $derived.by(() => {
		const correct = card.example_es;
		if (!correct) return [];
		const set = new Set<string>([correct]);
		for (const d of props.pool) {
			if (set.size >= 4) break;
			if (d.id === card.id) continue;
			const v = d.example_es;
			if (v && !set.has(v)) set.add(v);
		}
		// Fallback: use es field if not enough examples
		for (const d of props.pool) {
			if (set.size >= 4) break;
			if (d.id === card.id) continue;
			const v = d.es;
			if (v && !set.has(v)) set.add(v);
		}
		const arr = [...set];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	});

	let picked: string | null = $state(null);
	let locked = $state(false);

	$effect(() => {
		card;
		picked = null;
		locked = false;
	});

	// Auto-skip if no example sentence available
	$effect(() => {
		if (!card.example || !card.example_es || options.length < 2) {
			queueMicrotask(() => props.onAnswer(true));
		}
	});

	function pick(opt: string) {
		if (locked) return;
		picked = opt;
		locked = true;
		const correct = opt === card.example_es;
		setTimeout(() => props.onAnswer(correct), correct ? 700 : 900);
	}
</script>

{#if card.example && card.example_es && options.length >= 2}
	<div class="step-layout">
		<div class="step-header">
			<div class="step-instruction">
				{$locale === 'es' ? 'Traduce la frase' : 'Translate the sentence'}
			</div>
		</div>

		<div class="step-content">
			<div class="sentence-card">
				<button
					class="speak-btn"
					onclick={() => speakJapanese(card.example)}
					aria-label="Reproducir"
				>
					<Icon icon={VolumeHighIcon} size={22} color="var(--hinomaru-red)" />
				</button>
				<div class="sentence-jp">{card.example}</div>
				{#if card.example_romaji}
					<div class="sentence-rom">{card.example_romaji}</div>
				{/if}
			</div>
		</div>

		<div class="step-footer">
			<div class="options-grid">
				{#each options as opt (opt)}
					<button
						class="option-pill"
						class:correct={locked && opt === card.example_es}
						class:wrong={locked && picked === opt && opt !== card.example_es}
						class:dim={locked && picked !== opt && opt !== card.example_es}
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
	}
	.sentence-card {
		width: 100%;
		background: var(--bg-surface);
		border-radius: 32px;
		padding: 40px 24px 32px;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		text-align: center;
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
	.sentence-jp {
		font-family: var(--font-jp);
		font-size: clamp(22px, 6vw, 30px);
		font-weight: 700;
		color: var(--sumi);
		line-height: 1.5;
	}
	.sentence-rom {
		font-size: 14px;
		color: var(--fg-secondary);
		font-weight: 500;
	}
	.step-footer {
		padding-top: 32px;
	}
	.options-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}
	.option-pill {
		padding: 16px 20px;
		background: var(--bg-surface);
		border: 2px solid var(--ink-100);
		border-radius: 20px;
		font-size: 14px;
		font-weight: 700;
		color: var(--sumi);
		text-align: left;
		cursor: pointer;
		transition: all 0.2s;
		line-height: 1.4;
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
