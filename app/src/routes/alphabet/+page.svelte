<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn } from '$lib/motion';
	import KanaChart from '$lib/components/KanaChart.svelte';
	import { ALL_CHARS, type KanaChar } from '$lib/data/alphabetCharacters';
	import { alphabetProgress, isLearned } from '$lib/stores/alphabetProgress';
	import Icon from '$lib/Icon.svelte';
	import { ArrowRight02Icon } from '@hugeicons/core-free-icons';
	import ResponsiveModal from '$lib/components/ui/ResponsiveModal.svelte';
	import AlphabetCharSheet from '$lib/components/alphabet/AlphabetCharSheet.svelte';
	import type { KanaItem } from '$lib/data/kana';
	import { speakJapanese } from '$lib/utils/tts';

	const totals = $derived.by(() => {
		const learned = ALL_CHARS.filter((c) => isLearned($alphabetProgress[c.id])).length;
		return { learned, total: ALL_CHARS.length };
	});

	const learnedJps = $derived.by(() => {
		const set = new Set<string>();
		for (const c of ALL_CHARS) {
			if (isLearned($alphabetProgress[c.id])) set.add(c.jp);
		}
		return set;
	});

	let selectedChar = $state<KanaChar | null>(null);
	let sheetOpen = $state(false);

	function handleSelect(item: KanaItem, script: 'hiragana' | 'katakana') {
		if (!item.jp) return;
		const kc = ALL_CHARS.find((c) => c.jp === item.jp && c.script === script);
		if (!kc) {
			speakJapanese(item.jp);
			return;
		}
		selectedChar = kc;
		sheetOpen = true;
	}

	function closeSheet() {
		sheetOpen = false;
	}

	const nextUnlearned = $derived(
		ALL_CHARS.find((c) => !isLearned($alphabetProgress[c.id])) ?? ALL_CHARS[0]
	);

	function startLearn() {
		if (nextUnlearned) {
			goto(
				`/alphabet/learn?start=${encodeURIComponent(nextUnlearned.id)}&script=${nextUnlearned.script}`
			);
		}
	}
</script>

<svelte:head>
	<title>{t('alphabet.title', $locale) || 'Alfabeto'} — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;min-height:100vh;padding:calc(32px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));"
>
	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;cursor:default;display:flex;align-items:center;gap:12px;"
	>
		{t('alphabet.title', $locale) || 'Kana Chart'}
	</h1>
	<p use:fadeUp={{ delay: 0.12, y: 12 }} style="font-size:16px;color:var(--fg-secondary);margin:0;">
		{t('alphabet.subtitle', $locale) || 'Aprende y repasa Hiragana y Katakana.'}
	</p>

	<div use:fadeUp={{ delay: 0.16, y: 12 }} style="margin-bottom:24px;" class="pt-6">
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
		<KanaChart onSelect={handleSelect} />
	</div>
</div>

{#if selectedChar}
	<ResponsiveModal
		bind:open={sheetOpen}
		title={`${selectedChar.jp}  ${selectedChar.romaji}`}
	>
		{#if selectedChar}
			{#key selectedChar.id}
				<AlphabetCharSheet
					char={selectedChar}
					learnedJps={learnedJps}
					onClose={closeSheet}
				/>
			{/key}
		{/if}
	</ResponsiveModal>
{/if}

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
