<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn } from '$lib/motion';
	import KanaChart from '$lib/components/KanaChart.svelte';
</script>

<svelte:head>
	<title>{t('alphabet.title', $locale) || 'Alfabeto'} — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;padding:calc(32px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));"
>
	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;"
	>
		{t('alphabet.title', $locale) || 'Kana Chart'}
	</h1>

	<p
		use:fadeUp={{ delay: 0.12, y: 12 }}
		style="font-size:16px;color:var(--fg-secondary);margin:0 0 48px;"
	>
		{t('alphabet.subtitle', $locale) || 'Aprende y repasa Hiragana y Katakana.'}
	</p>

	<div class="chart-section" use:fadeUp={{ delay: 0.18, y: 20 }}>
		<KanaChart />
	</div>
</div>

<style>
	.back-link-beautiful {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		transition: color 150ms ease;
	}
	@media (hover: hover) {
		.back-link-beautiful:hover {
			color: var(--sumi);
		}
	}

	.chart-section {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 32px;
		padding: 32px 16px;
		box-shadow: var(--shadow-sm);
	}
</style>
