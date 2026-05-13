<script lang="ts">
	import {
		HIRAGANA,
		KATAKANA,
		HIRAGANA_DAKUON,
		KATAKANA_DAKUON,
		HIRAGANA_HANDAKUON,
		KATAKANA_HANDAKUON,
		HIRAGANA_YOON,
		KATAKANA_YOON,
		HIRAGANA_LONG,
		KATAKANA_LONG,
		HIRAGANA_SOKUON,
		KATAKANA_SOKUON,
		type KanaItem
	} from '$lib/data/kana';
	import { speakJapanese } from '$lib/utils/tts';
	import { fadeUp } from '$lib/motion';
	import { locale } from '$lib/stores/locale';

	let mode = $state<'hiragana' | 'katakana'>('hiragana');

	const sections = $derived<
		{ title_es: string; title_en: string; cols: number; data: KanaItem[] }[]
	>(
		mode === 'hiragana'
			? [
					{ title_es: 'Gojūon', title_en: 'Gojūon', cols: 5, data: HIRAGANA },
					{ title_es: 'Dakuon', title_en: 'Dakuon', cols: 5, data: HIRAGANA_DAKUON },
					{ title_es: 'Handakuon', title_en: 'Handakuon', cols: 5, data: HIRAGANA_HANDAKUON },
					{
						title_es: 'Combinaciones (Yōon)',
						title_en: 'Combinations (Yōon)',
						cols: 3,
						data: HIRAGANA_YOON
					},
					{ title_es: 'Vocales largas', title_en: 'Long vowels', cols: 5, data: HIRAGANA_LONG },
					{ title_es: 'Sokuon (っ)', title_en: 'Sokuon (っ)', cols: 5, data: HIRAGANA_SOKUON }
				]
			: [
					{ title_es: 'Gojūon', title_en: 'Gojūon', cols: 5, data: KATAKANA },
					{ title_es: 'Dakuon', title_en: 'Dakuon', cols: 5, data: KATAKANA_DAKUON },
					{ title_es: 'Handakuon', title_en: 'Handakuon', cols: 5, data: KATAKANA_HANDAKUON },
					{
						title_es: 'Combinaciones (Yōon)',
						title_en: 'Combinations (Yōon)',
						cols: 3,
						data: KATAKANA_YOON
					},
					{
						title_es: 'Vocales largas (ー)',
						title_en: 'Long vowels (ー)',
						cols: 5,
						data: KATAKANA_LONG
					},
					{ title_es: 'Sokuon (ッ)', title_en: 'Sokuon (ッ)', cols: 5, data: KATAKANA_SOKUON }
				]
	);

	function play(char: string | null) {
		if (char) speakJapanese(char);
	}
</script>

<div class="kana-chart-wrapper">
	<div class="toggle-container" use:fadeUp={{ delay: 0, y: 10 }}>
		<div class="pill-track">
			<div
				class="pill-glider"
				style="transform: translateX({mode === 'hiragana' ? '0' : '100%'})"
			></div>
			<button
				class="pill-btn"
				class:active={mode === 'hiragana'}
				onclick={() => (mode = 'hiragana')}
			>
				Hiragana
			</button>
			<button
				class="pill-btn"
				class:active={mode === 'katakana'}
				onclick={() => (mode = 'katakana')}
			>
				Katakana
			</button>
		</div>
	</div>

	{#each sections as section, sIdx (mode + sIdx)}
		<div class="section" use:fadeUp={{ delay: 0.05 + sIdx * 0.04, y: 12 }}>
			{#if sIdx > 0}
				<h3 class="section-title">{$locale === 'es' ? section.title_es : section.title_en}</h3>
			{/if}
			<div class="kana-grid" style="grid-template-columns: repeat({section.cols}, 1fr);">
				{#each section.data as item, i (i)}
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
	{/each}
</div>

<style>
	.kana-chart-wrapper {
		width: 100%;
	}

	.toggle-container {
		display: flex;
		justify-content: center;
		margin-bottom: 32px;
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

	.section {
		margin-bottom: 28px;
	}

	.section-title {
		font-size: 13px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: -0.04em;
		margin: 0 0 14px;
		text-align: center;
	}

	.kana-grid {
		display: grid;
		gap: 12px;
		max-width: 480px;
		margin: 0 auto;
	}

	.kana-cell {
		aspect-ratio: 1;
		background: transparent;
		border: none;
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s var(--ease-brand);
	}

	@media (hover: hover) {
		.kana-cell:hover:not(.empty) {
			transform: translateY(-2px);
		}
	}

	.kana-cell:active {
		transform: scale(0.95);
	}

	.kana-cell:active .kana-char {
		color: var(--hinomaru-red);
	}

	.kana-char {
		font-family: var(--font-jp);
		font-size: 28px;
		font-weight: 500;
		color: var(--fg-primary);
		line-height: 1;
		transition: color 0.1s;
	}

	.kana-romaji {
		font-size: 11px;
		color: var(--fg-tertiary);
		margin-top: 4px;
		font-weight: 500;
	}

	.kana-cell.empty {
		cursor: default;
		background: transparent;
		border-color: transparent;
	}

	@media (max-width: 400px) {
		.kana-grid {
			gap: 8px;
		}
		.kana-char {
			font-size: 24px;
		}
	}
</style>
