<script lang="ts">
	import type { Locale } from '$lib/i18n';

	let { jp, kana, en, es, locale }: {
		jp: string;
		kana: string;
		en: string;
		es: string;
		locale: Locale;
	} = $props();

	let open = $state(false);

	function toggle() {
		open = !open;
	}
</script>

<span class="vocab-chip-wrapper">
	<button class="vocab-chip" onclick={toggle} aria-expanded={open}>
		{jp}
	</button>
	{#if open}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="vocab-popup" role="tooltip">
			<div class="popup-kana">{kana}</div>
			<div class="popup-trans">{locale === 'es' ? es : en}</div>
		</div>
	{/if}
</span>

<style>
	.vocab-chip-wrapper {
		position: relative;
		display: inline-block;
	}

	.vocab-chip {
		font-family: var(--font-jp);
		font-size: inherit;
		font-weight: 700;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		border: 1px solid transparent;
		border-radius: 6px;
		padding: 0 4px;
		cursor: pointer;
		transition: background 120ms ease, border-color 120ms ease;
		line-height: inherit;
	}

	.vocab-chip:hover,
	.vocab-chip[aria-expanded='true'] {
		background: var(--hinomaru-red);
		color: white;
	}

	.vocab-popup {
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		background: var(--sumi);
		color: var(--bg-surface);
		border-radius: 10px;
		padding: 8px 12px;
		white-space: nowrap;
		z-index: 50;
		box-shadow: var(--shadow-md);
		animation: pop-in 150ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.vocab-popup::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: var(--sumi);
	}

	.popup-kana {
		font-family: var(--font-jp);
		font-size: 13px;
		font-weight: 600;
		margin-bottom: 2px;
	}

	.popup-trans {
		font-size: 12px;
		opacity: 0.75;
	}

	@keyframes pop-in {
		from {
			opacity: 0;
			transform: translateX(-50%) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) scale(1);
		}
	}
</style>
