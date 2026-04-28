<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { fade, scale } from 'svelte/transition';
	import { getWordMetadata } from '$lib/utils/vocab_registry';
	import { speakJapanese } from '$lib/utils/tts';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';

	let {
		word,
		visible = false,
		x = 0,
		y = 0,
		onclose
	} = $props<{
		word: string;
		visible: boolean;
		x: number;
		y: number;
		onclose: () => void;
	}>();

	let popupEl: HTMLElement | undefined = $state();
	let direction = $state<'up' | 'down'>('up');
	let clampedX = $state(0);
	let clampedY = $state(0);
	const meta = $derived(word ? getWordMetadata(word) : null);

	$effect(() => {
		if (visible && popupEl) {
			const width = popupEl.offsetWidth;
			const height = popupEl.offsetHeight;
			const padding = 10;

			// Horizontal clamping
			let newX = x;
			if (newX - width / 2 < padding) {
				newX = width / 2 + padding;
			} else if (newX + width / 2 > window.innerWidth - padding) {
				newX = window.innerWidth - width / 2 - padding;
			}
			clampedX = newX;

			// Vertical placement
			if (y - height - 20 < padding) {
				direction = 'down';
				clampedY = y + 25; // 25px offset from the top of the word
			} else {
				direction = 'up';
				clampedY = y - 10; // 10px offset from the top of the word
			}

			// Auto-close on scroll (Capture phase to catch scrolls in overlays too)
			const handleScroll = () => {
				onclose();
			};
			
			window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
			return () => {
				window.removeEventListener('scroll', handleScroll, { capture: true });
			};
		}
	});
</script>

{#if visible && meta}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="popup-overlay" onclick={onclose}></div>

	<div
		bind:this={popupEl}
		class="word-popup"
		class:is-down={direction === 'down'}
		style="left: {clampedX}px; top: {clampedY}px;"
		transition:scale={{ duration: 200, start: 0.9, opacity: 0 }}
	>
		<div class="popup-header">
			<div class="jp-box">
				<span class="jp-text">{word}</span>
				{#if meta.kana && meta.kana !== word}
					<span class="kana-text">{meta.kana}</span>
				{/if}
			</div>
			<button
				class="audio-btn"
				onclick={(e) => {
					e.stopPropagation();
					speakJapanese(word);
				}}
			>
				<Icon icon={VolumeHighIcon} size={14} color="currentColor" />
			</button>
		</div>

		<div class="tags">
			{#if meta.category}
				<span class="tag cat-tag">
					{$locale === 'es' ? meta.category_es || meta.category : meta.category}
				</span>
			{/if}
			{#if meta.pos}
				<span class="tag pos-tag">
					{$locale === 'es' ? meta.pos_es || meta.pos : meta.pos}
				</span>
			{/if}
		</div>

		<div class="meanings">
			<p class="meaning">{$locale === 'es' ? meta.es : meta.en}</p>
		</div>

		{#if meta.example}
			<div class="example-box">
				<p class="ex-jp">{meta.example}</p>
				<p class="ex-tr">{$locale === 'es' ? meta.example_es : meta.example_en}</p>
			</div>
		{/if}

		<div class="popup-tail" style="left: calc(50% + {x - clampedX}px)"></div>
	</div>
{/if}

<style>
	.popup-overlay {
		position: fixed;
		inset: 0;
		z-index: 3000;
	}

	.word-popup {
		position: fixed;
		z-index: 3001;
		width: 220px;
		background: var(--bg-surface, rgba(255, 255, 255, 0.95));
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 12px 14px;
		box-shadow:
			0 10px 25px -5px rgba(0, 0, 0, 0.1),
			0 8px 10px -6px rgba(0, 0, 0, 0.1);
		transform: translate(-50%, -100%);
		pointer-events: auto;
		transition:
			top 0.2s,
			left 0.2s;
	}

	.word-popup.is-down {
		transform: translate(-50%, 0);
	}

	:global(.reading-mode-overlay) .word-popup {
		background: var(--bg-page);
		border-color: var(--ink-200);
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 8px;
	}

	.jp-box {
		display: flex;
		flex-direction: column;
	}

	.jp-text {
		font-family: var(--font-jp);
		font-size: 18px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.kana-text {
		font-family: var(--font-jp);
		font-size: 11px;
		color: var(--fg-tertiary);
		margin-top: -1px;
		opacity: 0.8;
	}

	:global(.reading-mode-overlay[data-theme='dark']) .kana-text {
		color: var(--ink-300);
		opacity: 1;
	}

	.audio-btn {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--ink-100);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}

	:global(.reading-mode-overlay[data-theme='dark']) .audio-btn {
		background: var(--ink-200);
		color: var(--fg-primary);
	}

	.audio-btn:hover {
		background: var(--ink-200);
	}
	.audio-btn:active {
		transform: scale(0.9);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: 8px;
	}

	.tag {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 3px 8px;
		border-radius: 6px;
		line-height: 1;
		display: inline-flex;
		align-items: center;
		white-space: nowrap;
	}

	.cat-tag {
		background: color-mix(in srgb, var(--hinomaru-red) 8%, transparent);
		color: var(--hinomaru-red);
		border: 1px solid color-mix(in srgb, var(--hinomaru-red) 15%, transparent);
	}

	.pos-tag {
		background: var(--ink-50);
		color: var(--fg-tertiary);
		border: 1px solid var(--ink-200);
	}

	.meaning {
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-primary);
		margin: 0;
		line-height: 1.4;
	}

	.example-box {
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid var(--ink-100);
	}

	.ex-jp {
		font-family: var(--font-jp);
		font-size: 12px;
		color: var(--fg-secondary);
		margin: 0 0 2px;
		line-height: 1.4;
	}

	.ex-tr {
		font-size: 10px;
		color: var(--fg-tertiary);
		font-style: italic;
		margin: 0;
	}

	:global(.reading-mode-overlay[data-theme='dark']) .ex-tr {
		color: var(--fg-secondary);
		opacity: 0.8;
	}

	.popup-tail {
		position: absolute;
		bottom: -6px;
		left: 50%;
		width: 12px;
		height: 12px;
		background: inherit;
		border-right: 1px solid var(--ink-200);
		border-bottom: 1px solid var(--ink-200);
		transform: translateX(-50%) rotate(45deg);
	}

	.is-down .popup-tail {
		bottom: auto;
		top: -6px;
		border-right: none;
		border-bottom: none;
		border-left: 1px solid var(--ink-200);
		border-top: 1px solid var(--ink-200);
	}
</style>
