<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
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

	let picked: string | null = $state(null);
	let locked = $state(false);

	$effect(() => {
		card;
		picked = null;
		locked = false;
	});

	function pick(opt: string) {
		if (locked) return;
		picked = opt;
		locked = true;
		const correct = opt === card[meaningKey];
		setTimeout(() => props.onAnswer(correct), correct ? 600 : 800);
	}
</script>

<div class="step-layout">
	<div class="step-header">
		<div class="step-instruction">
			{$locale === 'es' ? 'Elige el significado' : 'Pick the meaning'}
		</div>
	</div>

	<div class="step-content">
		<div class="word-card">
			<button
				class="speak-btn"
				onclick={() => speakJapanese(card.jp)}
				aria-label="Reproducir"
			>
				<Icon icon={VolumeHighIcon} size={22} color="var(--hinomaru-red)" />
			</button>
			<div class="word-jp">{card.jp}</div>
		</div>
	</div>

	<div class="step-footer">
		<div class="options-grid">
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
		gap: 32px;
	}
	.word-card {
		width: 100%;
		background: var(--bg-surface);
		border-radius: 32px;
		padding: 48px 24px;
		text-align: center;
		position: relative;
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
	.speak-btn:active {
		transform: scale(0.9);
	}
	.word-jp {
		font-family: var(--font-jp);
		font-size: clamp(40px, 10vw, 60px);
		font-weight: 700;
		color: var(--sumi);
		letter-spacing: -0.01em;
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
