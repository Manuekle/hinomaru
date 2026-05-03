<script lang="ts">
	import { fade } from 'svelte/transition';
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { safeRomaji } from '$lib/utils/romaji';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';
	import StickyFooter from '$lib/components/StickyFooter.svelte';

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
	<div class="step-content">
		<div
			class="prompt-card"
			class:revealed
			role="button"
			tabindex="0"
			onclick={() => !revealed && reveal()}
			onkeydown={(e) => {
				if (!revealed && (e.key === 'Enter' || e.key === ' ')) reveal();
			}}
		>
			<div class="prompt-meta">
				<span class="prompt-tag">{$locale === 'es' ? 'RECONOCER' : 'RECOGNIZE'}</span>
				<button
					class="audio-mini"
					onclick={(e) => {
						e.stopPropagation();
						speakJapanese(card.jp);
					}}
					aria-label="Reproducir"
				>
					<Icon icon={VolumeHighIcon} size={16} color="currentColor" />
				</button>
			</div>

			<div class="jp word-text" style="font-size: {card.jp.length <= 4 ? 'var(--fs-display)' : 'var(--fs-2xl)'};">
				<InteractiveText text={card.jp} />
			</div>

			{#if revealed}
				<div class="romaji-sub" in:fade>{safeRomaji(card.romaji, card.jp)}</div>
			{/if}

			{#if revealed}
				<div class="meaning-sub" in:fade>
					{$locale === 'es' ? card.es : card.en}
				</div>
			{:else}
				<div class="tap-hint" in:fade>
					{$locale === 'es' ? 'Toca para revelar' : 'Tap to reveal'}
				</div>
			{/if}
		</div>
	</div>

	<StickyFooter>
		<div class="footer-inner">
			{#if revealed}
				<div class="actions-row" in:fade>
					<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={() => props.onAnswer(false)}>
						{$locale === 'es' ? 'No la sabía' : "Didn't know"}
					</button>
					<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={() => props.onAnswer(true)}>
						{$locale === 'es' ? 'La sabía' : 'I knew it'}
					</button>
				</div>
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
		cursor: pointer;
		transition: all 0.2s;
	}

	.prompt-card.revealed {
		cursor: default;
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

	.romaji-sub {
		font-size: clamp(16px, 4vw, 19px);
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.meaning-sub {
		font-size: clamp(18px, 5vw, 24px);
		font-weight: 800;
		color: var(--fg-primary);
	}

	.tap-hint {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
		margin-top: 8px;
	}

	:global(.word-text .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
	:global(.word-text .word-link:hover) {
		border-bottom-color: var(--hinomaru-red) !important;
	}

	.footer-inner { width: 100%; max-width: 480px; margin: 0 auto; }
	.actions-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
</style>
