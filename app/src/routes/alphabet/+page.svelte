<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn } from '$lib/motion';
	import KanaChart from '$lib/components/KanaChart.svelte';
	import { ALL_CHARS } from '$lib/data/alphabetCharacters';
	import { alphabetProgress, isLearned } from '$lib/stores/alphabetProgress';
	import Icon from '$lib/Icon.svelte';
	import { ArrowRight02Icon } from '@hugeicons/core-free-icons';

	const totals = $derived.by(() => {
		const learned = ALL_CHARS.filter((c) => isLearned($alphabetProgress[c.id])).length;
		return { learned, total: ALL_CHARS.length };
	});

	const nextUnlearned = $derived(
		ALL_CHARS.find((c) => !isLearned($alphabetProgress[c.id])) ?? ALL_CHARS[0]
	);

	function startLearn() {
		if (nextUnlearned) {
			goto(`/alphabet/learn?start=${encodeURIComponent(nextUnlearned.id)}&script=${nextUnlearned.script}`);
		}
	}
</script>

<svelte:head>
	<title>{t('alphabet.title', $locale) || 'Alfabeto'} — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;padding:calc(32px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));"
>
	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-family:var(--font-display);font-size:clamp(28px,5.5vw,40px);font-weight:900;color:var(--fg-primary);text-align:center;margin:0 0 8px;letter-spacing:-0.02em;"
	>
		{t('alphabet.title', $locale) || 'Kana Chart'}
	</h1>
	<p
		use:fadeUp={{ delay: 0.12, y: 12 }}
		style="text-align:center;color:var(--fg-tertiary);font-size:15px;margin:0 0 24px;"
	>
		{t('alphabet.subtitle', $locale) || 'Aprende y repasa Hiragana y Katakana.'}
	</p>

	<div use:fadeUp={{ delay: 0.16, y: 12 }} style="margin-bottom:24px;">
		<button class="learn-btn" onclick={startLearn}>
			<span>
				{totals.learned === 0
					? $locale === 'es'
						? 'Aprender los caracteres'
						: 'Learn the characters'
					: $locale === 'es'
						? 'Continuar aprendiendo'
						: 'Continue learning'}
			</span>
			<span class="learn-count">{totals.learned} / {totals.total}</span>
			<Icon icon={ArrowRight02Icon} size={16} color="currentColor" />
		</button>
	</div>

	<div class="chart-section" use:fadeUp={{ delay: 0.22, y: 20 }}>
		<KanaChart />
	</div>
</div>

<style>
	.chart-section {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 32px;
		padding: 32px 16px;
		box-shadow: var(--shadow-sm);
	}

	.learn-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 18px;
		background: var(--hinomaru-red);
		color: white;
		border: none;
		border-radius: 16px;
		font-family: inherit;
		font-size: 15px;
		font-weight: 800;
		cursor: pointer;
		box-shadow: 0 6px 18px rgba(188, 0, 45, 0.22);
		transition: all 0.15s;
	}
	.learn-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 24px rgba(188, 0, 45, 0.3);
	}
	.learn-btn span:first-child {
		flex: 1;
		text-align: left;
	}
	.learn-count {
		font-size: 12px;
		font-weight: 800;
		background: rgba(255, 255, 255, 0.22);
		padding: 4px 10px;
		border-radius: 99px;
	}
</style>
