<script lang="ts">
	import { fade } from 'svelte/transition';
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { safeRomaji } from '$lib/utils/romaji';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';

	const props: { card: any; onAnswer: (correct: boolean) => void } = $props();
	const card = $derived(props.card);
	let revealed = $state(false);

	$effect(() => {
		card;
		revealed = false;
	});

	function reveal() {
		revealed = true;
		speakJapanese(card.jp);
	}
</script>

<div class="step-layout">
	<div class="step-header">
		<div class="step-instruction">
			{$locale === 'es' ? '¿Conoces esta palabra?' : 'Do you know this word?'}
		</div>
	</div>

	<div class="step-content">
		<div
			class="word-card"
			class:revealed
			role="button"
			tabindex="0"
			onclick={() => !revealed && reveal()}
			onkeydown={(e) => {
				if (!revealed && (e.key === 'Enter' || e.key === ' ')) reveal();
			}}
		>
			<button
				class="speak-btn"
				onclick={(e) => {
					e.stopPropagation();
					speakJapanese(card.jp);
				}}
				aria-label="Reproducir"
			>
				<Icon icon={VolumeHighIcon} size={22} color="var(--hinomaru-red)" />
			</button>

			<div class="word-jp">{card.jp}</div>

			{#if revealed}
				<div class="word-rom" in:fade>{safeRomaji(card.romaji, card.jp)}</div>
				<div class="word-meaning" in:fade>
					{$locale === 'es' ? card.es : card.en}
				</div>
			{:else}
				<div class="word-hint">
					{$locale === 'es' ? 'Toca para revelar' : 'Tap to reveal'}
				</div>
			{/if}
		</div>
	</div>

	<div class="step-footer">
		{#if revealed}
			<div class="actions-row" in:fade>
				<button class="action-btn secondary" onclick={() => props.onAnswer(false)}>
					{$locale === 'es' ? 'No la sabía' : "Didn't know"}
				</button>
				<button class="action-btn primary" onclick={() => props.onAnswer(true)}>
					{$locale === 'es' ? 'La sabía' : 'I knew it'}
				</button>
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
		gap: 32px;
	}
	.word-card {
		width: 100%;
		min-height: 240px;
		background: var(--bg-surface);
		border-radius: 32px;
		padding: 48px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 14px;
		cursor: pointer;
		position: relative;
		text-align: center;
		outline: none;
	}
	.word-card.revealed {
		cursor: default;
	}
	.word-card:focus-visible {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--hinomaru-red) 40%, transparent);
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
		font-size: clamp(40px, 10vw, 64px);
		font-weight: 700;
		color: var(--sumi);
		letter-spacing: -0.02em;
	}
	.word-rom {
		font-size: 18px;
		color: var(--fg-secondary);
		font-weight: 600;
	}
	.word-meaning {
		font-size: 22px;
		font-weight: 800;
		color: var(--hinomaru-red);
	}
	.word-hint {
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 600;
	}
	.step-footer {
		padding-top: 32px;
		min-height: 80px;
	}
	.actions-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.action-btn {
		padding: 18px;
		border-radius: 20px;
		font-size: 15px;
		font-weight: 800;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all 0.15s;
	}
	.action-btn.secondary {
		background: var(--bg-surface);
		border-color: var(--ink-100);
		color: var(--sumi);
	}
	.action-btn.primary {
		background: var(--hinomaru-red);
		color: white;
		box-shadow: 0 4px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
	}
	.action-btn.primary:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
	}
</style>
