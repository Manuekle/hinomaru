<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { safeRomaji } from '$lib/utils/romaji';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import Icon from '$lib/Icon.svelte';
	import {
		VolumeHighIcon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		ArrowRight02Icon
	} from '@hugeicons/core-free-icons';
	import { fade } from 'svelte/transition';
	import { fadeUp } from '$lib/motion';

	const props: {
		card: any;
		pool: any[];
		onAnswer: (correct: boolean) => void;
	} = $props();

	const card = $derived(props.card);
	const targetJp = $derived(card.example || '');
	const targetRomaji = $derived(card.example_romaji || '');
	const promptText = $derived($locale === 'es' ? card.example_es : card.example_en);

	let picked: string | null = $state(null);
	let locked = $state(false);
	let isCorrect = $state(false);

	const options = $derived.by(() => {
		const correct = targetJp;
		if (!correct) return [];
		const set = new Set<string>([correct]);
		for (const d of props.pool) {
			if (set.size >= 4) break;
			if (d.id === card.id) continue;
			if (d.example && !set.has(d.example)) set.add(d.example);
		}
		for (const d of props.pool) {
			if (set.size >= 4) break;
			if (d.id === card.id) continue;
			if (d.jp && !set.has(d.jp)) set.add(d.jp);
		}
		const arr = [...set];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	});

	function handleCheck() {
		if (locked || !picked) return;
		locked = true;
		isCorrect = picked === targetJp;
		if (isCorrect) speakJapanese(targetJp);
	}

	function handleContinue() {
		props.onAnswer(isCorrect);
	}

	$effect(() => {
		card;
		picked = null;
		locked = false;
		isCorrect = false;
	});
</script>

<div class="step-layout">
	<div class="step-content">
		<div class="prompt-section">
			<span class="prompt-tag">{$locale === 'es' ? 'TRADUCIR' : 'TRANSLATE'}</span>
			<h2 class="prompt-text">{promptText}</h2>
		</div>

		<div class="options-grid">
			{#each options as opt, idx (opt)}
				{@const isThisCorrect = opt === targetJp}
				{@const isThisPicked = opt === picked}
				<button
					class="option-card"
					class:is-selected={isThisPicked}
					class:is-correct={locked && isThisPicked && isThisCorrect}
					class:is-wrong={locked && isThisPicked && !isThisCorrect}
					class:is-dimmed={locked && !isThisPicked}
					disabled={locked}
					onclick={() => (picked = opt)}
				>
					<div class="opt-indicator">{String.fromCharCode(65 + idx)}</div>
					<div class="opt-body">
						<div class="jp opt-jp">{opt}</div>
						<div class="opt-romaji">{safeRomaji(undefined, opt)}</div>
					</div>
				</button>
			{/each}
		</div>

		{#if locked}
			<div class="feedback-reveal" in:fadeUp={{ y: 12 }}>
				<div class="feedback-card" class:correct={isCorrect} class:wrong={!isCorrect}>
					<div class="feedback-header">
						<Icon
							icon={isCorrect ? CheckmarkCircle01Icon : Cancel01Icon}
							size={20}
							color="currentColor"
						/>
						<span
							>{isCorrect
								? $locale === 'es'
									? '¡Excelente!'
									: 'Excellent!'
								: $locale === 'es'
									? 'La respuesta correcta es:'
									: 'The correct answer is:'}</span
						>
					</div>
					<div class="jp feedback-jp"><InteractiveText text={targetJp} /></div>
					<div class="feedback-rom">{targetRomaji}</div>
				</div>
			</div>
		{/if}
	</div>

	<StickyFooter>
		<div class="footer-inner">
			{#if !locked}
				<button
					class="hm-btn hm-btn-primary hm-btn-lg hm-btn-full"
					disabled={!picked}
					onclick={handleCheck}
				>
					{$locale === 'es' ? 'Comprobar' : 'Check'}
				</button>
			{:else}
				<button
					class="hm-btn hm-btn-lg hm-btn-full"
					class:hm-btn-primary={isCorrect}
					class:hm-btn-secondary={!isCorrect}
					onclick={handleContinue}
				>
					<span>{$locale === 'es' ? 'Continuar' : 'Continue'}</span>
					<Icon icon={ArrowRight02Icon} size={20} color="currentColor" />
				</button>
			{/if}
		</div>
	</StickyFooter>
</div>

<style>
	.step-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 32px;
		padding-top: 20px;
	}

	.prompt-section {
		text-align: center;
	}
	.prompt-tag {
		font-size: 11px;
		font-weight: 800;
		letter-spacing: -0.04em;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 12px;
		border-radius: 20px;
		text-transform: uppercase;
	}
	.prompt-text {
		margin-top: 16px;
		font-size: 24px;
		font-weight: 800;
		color: var(--fg-primary);
		line-height: 1.3;
	}

	.options-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.option-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		background: var(--bg-surface);
		border: 2px solid var(--ink-200);
		border-radius: 20px;
		cursor: pointer;
		text-align: left;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.option-card:not(:disabled):hover {
		border-color: var(--ink-300);
		transform: translateY(-1px);
	}
	.option-card.is-selected {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}
	.option-card.is-correct {
		border-color: var(--success);
		background: var(--success-wash);
	}
	.option-card.is-wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}
	.option-card.is-dimmed {
		opacity: 0.5;
		filter: grayscale(0.5);
	}

	.opt-indicator {
		width: 32px;
		height: 32px;
		border-radius: 10px;
		background: var(--bg-muted);
		border: 1.5px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		font-weight: 900;
		color: var(--fg-tertiary);
		flex-shrink: 0;
	}
	.is-selected .opt-indicator {
		background: var(--hinomaru-red);
		border-color: var(--hinomaru-red);
		color: white;
	}
	.is-correct .opt-indicator {
		background: var(--success);
		border-color: var(--success);
		color: white;
	}

	.opt-body {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.opt-jp {
		font-size: 18px;
		font-weight: 700;
		color: var(--fg-primary);
	}
	.opt-romaji {
		font-size: 12px;
		font-weight: 600;
		color: var(--hinomaru-red);
		opacity: 0.7;
	}

	.feedback-reveal {
		margin-top: 8px;
	}
	.feedback-card {
		padding: 20px;
		border-radius: 24px;
		border: 2px solid var(--ink-200);
		display: flex;
		flex-direction: column;
		gap: 8px;
		text-align: center;
	}
	.feedback-card.correct {
		border-color: var(--success);
		background: var(--success-wash);
		color: var(--success);
	}
	.feedback-card.wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}

	.feedback-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 800;
	}
	.feedback-jp {
		font-size: 22px;
		font-weight: 800;
	}
	.feedback-rom {
		font-size: 14px;
		font-weight: 600;
		opacity: 0.8;
	}

	.footer-inner {
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
	}

	:global(.feedback-jp .word-link) {
		color: inherit !important;
		border-bottom: 2px solid currentColor !important;
	}
</style>
