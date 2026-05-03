<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { safeRomaji } from '$lib/utils/romaji';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, CheckmarkCircle01Icon, Cancel01Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
	import { fadeUp } from '$lib/motion';
	import StickyFooter from '$lib/components/StickyFooter.svelte';

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
	let locked = $state(false);
	let isCorrect = $state(false);

	$effect(() => {
		card;
		played = false;
		picked = null;
		locked = false;
		isCorrect = false;
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

	function handlePick(opt: string) {
		if (locked || !played) return;
		picked = opt;
		locked = true;
		isCorrect = opt === card.jp;
	}

	function handleContinue() {
		props.onAnswer(isCorrect);
	}
</script>

<div class="step-layout">
	<div class="step-content">
		<div class="prompt-card">
			<div class="prompt-meta">
				<span class="prompt-tag">{$locale === 'es' ? 'ESCUCHAR' : 'LISTEN'}</span>
			</div>
			
			<div class="audio-section">
				<button 
					class="big-audio-btn" 
					class:is-playing={played}
					onclick={play} 
					aria-label="Reproducir audio"
				>
					<Icon icon={VolumeHighIcon} size={48} color="white" />
				</button>
				
				{#if locked}
					<div class="result-box" in:fadeUp={{ y: 10 }}>
						<div class="result-jp"><InteractiveText text={card.jp} /></div>
						<div class="result-rom">{safeRomaji(card.romaji, card.jp)}</div>
					</div>
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
		</div>

		<div class="options-list">
			{#each options as opt, idx (opt)}
				{@const itIsCorrect = opt === card.jp}
				{@const itIsPicked = opt === picked}
				<button
					class="option-item"
					class:is-correct={locked && itIsPicked && itIsCorrect}
					class:is-wrong={locked && itIsPicked && !itIsCorrect}
					class:is-dimmed={locked && !itIsPicked}
					disabled={locked || !played}
					onclick={() => handlePick(opt)}
				>
					<div class="opt-marker">
						{#if locked && itIsPicked && itIsCorrect}
							<Icon icon={CheckmarkCircle01Icon} size={14} color="white" />
						{:else if locked && itIsPicked && !itIsCorrect}
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
	</div>

	<StickyFooter>
		<div class="footer-inner">
			{#if locked}
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
	.step-layout { flex: 1; display: flex; flex-direction: column; height: 100%; gap: 24px; }
	.step-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 24px; }

	.prompt-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		box-shadow: 0 8px 32px rgba(26,26,26,0.06);
		padding: 18px 22px 32px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		text-align: center;
	}

	.prompt-meta { display: flex; justify-content: flex-start; width: 100%; }
	.prompt-tag {
		font-size: 10px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
		color: var(--hinomaru-red); background: var(--hinomaru-red-wash);
		padding: 4px 10px; border-radius: 20px;
	}

	.audio-section { display: flex; flex-direction: column; align-items: center; gap: 16px; }

	.big-audio-btn {
		width: 120px; height: 120px; border-radius: 50%;
		background: linear-gradient(135deg, var(--hinomaru-red), #d4002f);
		border: none; display: flex; align-items: center; justify-content: center;
		cursor: pointer; box-shadow: 0 10px 32px rgba(188, 0, 45, 0.24);
		transition: all 0.2s cubic-bezier(0.34, 1.5, 0.64, 1);
	}
	.big-audio-btn:active { transform: scale(0.94); }

	.play-hint {
		font-size: 12px; font-weight: 800; color: var(--fg-secondary);
		text-transform: uppercase; letter-spacing: 0.08em;
	}

	.result-box { display: flex; flex-direction: column; gap: 2px; }
	.result-jp { font-size: 32px; font-weight: 800; color: var(--fg-primary); }
	.result-rom { font-size: 16px; font-weight: 700; color: var(--hinomaru-red); }

	.options-list { display: flex; flex-direction: column; gap: 10px; width: 100%; }
	
	.option-item {
		display: flex; align-items: center; gap: 12px; padding: 16px 16px;
		border: 1.5px solid var(--ink-200); border-radius: 14px;
		background: var(--bg-surface); cursor: pointer; text-align: left;
		transition: all 0.2s; width: 100%; box-shadow: 0 1px 4px rgba(26,26,26,0.04);
	}
	.option-item:not(:disabled):hover { border-color: var(--ink-300); transform: translateY(-1px); }
	.option-item.is-correct { border-color: var(--success) !important; background: var(--success-wash) !important; }
	.option-item.is-wrong { border-color: var(--hinomaru-red) !important; background: var(--hinomaru-red-wash) !important; }
	.option-item.is-dimmed { opacity: 0.55; filter: grayscale(0.4); }

	.opt-marker {
		width: 28px; height: 28px; border-radius: 8px; background: var(--bg-muted);
		border: 1px solid var(--ink-200); display: flex; align-items: center; justify-content: center;
		font-size: 11px; font-weight: 900; color: var(--fg-tertiary);
	}
	.is-correct .opt-marker { background: var(--success); border-color: var(--success); color: white; }
	.is-wrong .opt-marker { background: var(--hinomaru-red); border-color: var(--hinomaru-red); color: white; }

	.opt-content { display: flex; flex-direction: column; }
	.opt-text { font-size: 16px; font-weight: 700; color: var(--fg-primary); }
	.opt-romaji { font-size: 11px; font-weight: 600; color: var(--hinomaru-red); opacity: 0.8; }

	.footer-inner { width: 100%; max-width: 480px; margin: 0 auto; }

	:global(.result-jp .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
</style>
