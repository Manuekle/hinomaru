<script lang="ts">
	import { fade } from 'svelte/transition';
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
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
	<div class="step-header">
		<div class="step-instruction">
			{$locale === 'es' ? 'Escribe en romaji' : 'Type in romaji'}
		</div>
	</div>

	<div class="step-content">
		<div class="word-card">
			<button class="speak-btn" onclick={() => speakJapanese(card.jp)} aria-label="Reproducir">
				<Icon icon={VolumeHighIcon} size={22} color="var(--hinomaru-red)" />
			</button>
			<div class="word-jp">{card.jp}</div>
			<div class="word-meaning">{$locale === 'es' ? card.es : card.en}</div>
		</div>

		<input
			bind:this={inputEl}
			bind:value
			onkeydown={onKey}
			disabled={locked}
			class="write-input"
			class:correct={locked && isCorrect}
			class:wrong={locked && !isCorrect}
			placeholder="romaji…"
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
		/>

		{#if locked && !isCorrect}
			<div class="answer-hint" in:fade>
				{$locale === 'es' ? 'Respuesta:' : 'Answer:'}
				<strong>{card.romaji}</strong>
			</div>
		{/if}
	</div>

	<div class="step-footer">
		{#if !locked}
			<button class="check-btn" disabled={!value.trim()} onclick={check}>
				{$locale === 'es' ? 'Comprobar' : 'Check'}
			</button>
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
		gap: 24px;
	}
	.word-card {
		width: 100%;
		background: var(--bg-surface);
		border-radius: 32px;
		padding: 36px 24px;
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
	}
	.speak-btn:active {
		transform: scale(0.9);
	}
	.word-jp {
		font-family: var(--font-jp);
		font-size: clamp(36px, 9vw, 52px);
		font-weight: 700;
		color: var(--sumi);
	}
	.word-meaning {
		font-size: 14px;
		color: var(--fg-secondary);
		margin-top: 10px;
		font-weight: 600;
	}
	.write-input {
		width: 100%;
		padding: 20px 22px;
		font-size: 19px;
		font-weight: 700;
		border: 2px solid var(--ink-100);
		border-radius: 20px;
		background: var(--bg-surface);
		color: var(--sumi);
		outline: none;
		transition: all 0.2s;
		text-align: center;
	}
	.write-input:focus {
		border-color: var(--hinomaru-red);
	}
	.write-input.correct {
		border-color: var(--success);
		background: color-mix(in srgb, var(--success) 8%, transparent);
		color: var(--success);
	}
	.write-input.wrong {
		border-color: var(--hinomaru-red);
		background: color-mix(in srgb, var(--hinomaru-red) 8%, transparent);
		color: var(--hinomaru-red);
		animation: shake 0.4s;
	}
	.answer-hint {
		font-size: 14px;
		color: var(--fg-secondary);
		text-align: center;
	}
	.answer-hint strong {
		color: var(--hinomaru-red);
		font-weight: 800;
	}
	.step-footer {
		padding-top: 32px;
	}
	.check-btn {
		width: 100%;
		padding: 18px;
		background: var(--hinomaru-red);
		color: white;
		font-size: 16px;
		font-weight: 800;
		border: none;
		border-radius: 20px;
		cursor: pointer;
		box-shadow: 0 6px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
		transition: all 0.1s;
	}
	.check-btn:disabled {
		background: var(--ink-100);
		color: var(--fg-tertiary);
		box-shadow: 0 6px 0 var(--ink-200);
		cursor: default;
	}
	.check-btn:not(:disabled):active {
		transform: translateY(3px);
		box-shadow: 0 3px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
	}
	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}
</style>
