<script lang="ts">
	import { HIRAGANA, KATAKANA } from '$lib/data/kana';
	import { speakJapanese } from '$lib/utils/tts';
	import { fadeUp } from '$lib/motion';

	let mode = $state<'hiragana' | 'katakana'>('hiragana');
	const currentData = $derived(mode === 'hiragana' ? HIRAGANA : KATAKANA);

	function play(char: string) {
		if (char) speakJapanese(char);
	}
</script>

<div class="kana-chart-wrapper">
	<!-- Pill Toggle inspired by design ref -->
	<div class="toggle-container" use:fadeUp={{ delay: 0, y: 10 }}>
		<div class="pill-track">
			<div class="pill-glider" style="transform: translateX({mode === 'hiragana' ? '0' : '100%'})"></div>
			<button class="pill-btn" class:active={mode === 'hiragana'} onclick={() => mode = 'hiragana'}>
				Hiragana
			</button>
			<button class="pill-btn" class:active={mode === 'katakana'} onclick={() => mode = 'katakana'}>
				Katakana
			</button>
		</div>
	</div>

	<!-- Kana Grid -->
	<div class="kana-grid" use:fadeUp={{ delay: 0.1, y: 16 }}>
		{#each currentData as item}
			{#if item.jp}
				<button class="kana-cell" onclick={() => play(item.jp)}>
					<span class="kana-char">{item.jp}</span>
					<span class="kana-romaji">{item.romaji}</span>
				</button>
			{:else}
				<div class="kana-cell empty"></div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.kana-chart-wrapper {
		width: 100%;
	}

	.toggle-container {
		display: flex;
		justify-content: center;
		margin-bottom: 40px;
	}

	.pill-track {
		background: var(--ink-100);
		border-radius: 99px;
		display: flex;
		padding: 4px;
		position: relative;
		width: 240px;
	}

	.pill-glider {
		position: absolute;
		top: 4px;
		left: 4px;
		width: calc(50% - 4px);
		height: calc(100% - 8px);
		background: var(--bg-surface);
		border-radius: 99px;
		box-shadow: var(--shadow-sm);
		transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
		z-index: 1;
	}

	.pill-btn {
		flex: 1;
		height: 32px;
		background: none;
		border: none;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-tertiary);
		cursor: pointer;
		position: relative;
		z-index: 2;
		transition: color 0.3s;
		font-family: var(--font-ui);
	}

	.pill-btn.active {
		color: var(--sumi);
	}

	.kana-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 12px;
	}

	.kana-cell {
		aspect-ratio: 1;
		background: none;
		border: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0;
		cursor: pointer;
		transition: transform 0.1s;
	}

	.kana-cell:active {
		transform: scale(0.9);
	}

	.kana-char {
		font-family: var(--font-jp);
		font-size: 28px;
		font-weight: 500;
		color: var(--fg-primary);
		line-height: 1;
	}

	.kana-romaji {
		font-size: 11px;
		color: var(--fg-tertiary);
		margin-top: 4px;
		font-weight: 500;
	}

	.kana-cell.empty {
		cursor: default;
	}

	@media (max-width: 400px) {
		.kana-grid { gap: 8px; }
		.kana-char { font-size: 24px; }
	}
</style>
