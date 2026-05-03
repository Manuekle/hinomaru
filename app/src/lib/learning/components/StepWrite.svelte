<script lang="ts">
	import { fade } from 'svelte/transition';
	import { fadeUp } from '$lib/motion';
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';

	const props: { card: any; onAnswer: (correct: boolean) => void } = $props();
	const card = $derived(props.card);

	let value = $state('');
	let locked = $state(false);
	let isCorrect = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);

	$effect(() => {
		card;
		value = '';
		locked = false;
		isCorrect = false;
		setTimeout(() => inputEl?.focus(), 60);
	});

	function normalize(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[ōǒôò]/g, 'ou')
			.replace(/[ūǔûù]/g, 'uu')
			.replace(/[āǎâà]/g, 'a')
			.replace(/[ēěêè]/g, 'e')
			.replace(/[īǐîì]/g, 'i')
			.replace(/[^a-z0-9]/g, '');
	}

	function check() {
		if (locked) return;
		const target = normalize(card.romaji ?? '');
		const got = normalize(value);
		isCorrect = !!target && got === target;
		locked = true;
		setTimeout(() => props.onAnswer(isCorrect), isCorrect ? 700 : 1200);
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !locked && value.trim()) check();
	}
</script>

<div class="step-layout">
	<div class="step-content">
		<div class="prompt-card">
			<div class="prompt-meta">
				<span class="prompt-tag">{$locale === 'es' ? 'ESCRIBIR' : 'WRITE'}</span>
				<button 
					class="audio-mini" 
					onclick={() => speakJapanese(card.jp)} 
					aria-label="Reproducir"
				>
					<Icon icon={VolumeHighIcon} size={16} color="currentColor" />
				</button>
			</div>
			<div class="jp word-text" style="font-size: {card.jp.length <= 4 ? 'var(--fs-display)' : 'var(--fs-2xl)'};">
				<InteractiveText text={card.jp} />
			</div>
			<div class="meaning-sub">{$locale === 'es' ? card.es : card.en}</div>
		</div>

		<input
			bind:this={inputEl}
			bind:value
			onkeydown={onKey}
			disabled={locked}
			class="type-input"
			class:is-correct={locked && isCorrect}
			class:is-wrong={locked && !isCorrect}
			placeholder="romaji…"
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
		/>

		{#if locked && !isCorrect}
			<div class="feedback-box wrong" in:fadeUp={{ y: 10 }}>
				<div class="feedback-status">{$locale === 'es' ? 'Incorrecto' : 'Incorrect'}</div>
				<div class="correct-answer">
					{$locale === 'es' ? 'La respuesta era' : 'The answer was'}: <strong>{card.romaji}</strong>
				</div>
			</div>
		{:else if locked && isCorrect}
			<div class="feedback-box correct" in:fadeUp={{ y: 10 }}>
				<div class="feedback-status">{$locale === 'es' ? '¡Correcto!' : 'Correct!'}</div>
			</div>
		{/if}
	</div>

	<StickyFooter>
		<div class="footer-inner">
			{#if !locked}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" disabled={!value.trim()} onclick={check}>
					{$locale === 'es' ? 'Comprobar' : 'Check'}
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
		gap: 24px;
	}

	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 18px;
	}

	.prompt-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		box-shadow: 0 8px 32px rgba(26,26,26,0.06);
		padding: 18px 22px 28px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		text-align: center;
	}

	.prompt-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.prompt-tag {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.audio-mini {
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
	}

	.word-text {
		color: var(--fg-primary);
		line-height: 1.05;
		font-weight: 800;
		padding: 8px 0;
	}

	.meaning-sub {
		font-size: clamp(15px, 3.5vw, 18px);
		font-weight: 600;
		color: var(--fg-secondary);
	}

	.type-input {
		width: 100%;
		padding: 18px 20px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 18px;
		font-size: 20px;
		font-weight: 700;
		color: var(--fg-primary);
		text-align: center;
		transition: all 0.2s;
	}

	.type-input:focus { border-color: var(--hinomaru-red); }

	.type-input.is-correct { border-color: var(--success); background: var(--success-wash); color: var(--success); }

	.type-input.is-wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		animation: shake 0.4s;
	}

	.feedback-box {
		width: 100%;
		padding: 16px 18px;
		border-radius: 16px;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		text-align: center;
	}

	.feedback-box.correct { border-color: var(--success); background: var(--success-wash); }

	.feedback-box.wrong { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }

	.feedback-status { font-weight: 800; font-size: 16px; }

	.correct-answer { font-size: 14px; color: var(--fg-secondary); margin-top: 4px; }

	:global(.word-text .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
	:global(.word-text .word-link:hover) {
		border-bottom-color: var(--hinomaru-red) !important;
	}

	.footer-inner { width: 100%; max-width: 480px; margin: 0 auto; }

	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}
</style>
