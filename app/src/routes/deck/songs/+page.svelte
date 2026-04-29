<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, staggerChildren } from '$lib/motion';
	import { jlptSongs } from '$lib/utils/jlptSongs';
	import type { JLPTLevel } from '$lib/utils/jlptSongs';

	const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
	let activeLevel = $state<JLPTLevel>('N5');
	let completedIds = $state<number[]>([]);

	onMount(() => {
		try {
			const raw = localStorage.getItem('hinomaru_songs_completed');
			if (raw) completedIds = JSON.parse(raw);
		} catch {
			completedIds = [];
		}
	});

	const filtered = $derived(
		jlptSongs.map((s, idx) => ({ ...s, idx })).filter((s) => s.level === activeLevel)
	);

	function hasContent(idx: number): boolean {
		const s = jlptSongs[idx];
		return s.youtubeId !== 'PLACEHOLDER' || s.lyrics.length > 0;
	}
</script>

<svelte:head>
	<title>{t('songs.title', $locale)} — Hinomaru</title>
</svelte:head>

<div class="page">
	<div class="hero" use:fadeUp={{ delay: 0.05, y: 16 }}>
		<h1>{t('songs.title', $locale)}</h1>
		<p>{t('songs.subtitle', $locale)}</p>
	</div>

	<!-- Level chips -->
	<div class="chips hide-scrollbar" use:fadeIn={{ delay: 0.14 }}>
		{#each levels as lvl (lvl)}
			<button class="chip" class:on={activeLevel === lvl} onclick={() => (activeLevel = lvl)}>
				{lvl}
			</button>
		{/each}
	</div>

	<!-- Song rows -->
	<div class="list" use:staggerChildren={{ delay: 0.2, stagger: 0.07, y: 10 }}>
		{#each filtered as song (song.idx)}
			{@const done = completedIds.includes(song.idx)}
			{@const ready = hasContent(song.idx)}
			<a href="/deck/songs/{song.idx}" class="row" class:done>
				<div class="row-num">{song.idx + 1 < 10 ? '0' + (song.idx + 1) : song.idx + 1}</div>

				<div class="row-body">
					<div class="row-top">
						<span class="row-title jp">{song.title}</span>
						{#if !ready}
							<span class="tag tag-soon">{t('songs.comingSoon', $locale)}</span>
						{/if}
					</div>
					<div class="row-sub">{song.artist}</div>
					<div class="row-focus">{$locale === 'es' ? song.focus.es : song.focus.en}</div>
				</div>

				<div class="row-meta">
					<span class="row-diff"
						>{'●'.repeat(song.difficulty)}{'○'.repeat(5 - song.difficulty)}</span
					>
					<span class="row-arrow">→</span>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.page {
		max-width: 680px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));
	}

	.back {
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		display: inline-block;
		margin-bottom: 20px;
		transition: color 150ms;
	}
	.back:hover {
		color: var(--fg-primary);
	}

	/* Hero */
	.hero {
		margin-bottom: 28px;
	}

	.hero h1 {
		font-size: 38px;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--fg-primary);
		margin: 0 0 6px;
		line-height: 1.1;
	}

	.hero p {
		font-size: 15px;
		color: var(--fg-secondary);
		margin: 0;
		line-height: 1.5;
	}

	/* Chips */
	.chips {
		display: flex;
		gap: 6px;
		margin-bottom: 24px;
		overflow-x: auto;
	}

	.chip {
		height: 34px;
		padding: 0 14px;
		border-radius: 999px;
		border: 1.5px solid var(--ink-200);
		background: transparent;
		color: var(--fg-secondary);
		font-size: 12px;
		font-weight: 700;
		font-family: var(--font-ui);
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: all 180ms ease;
		letter-spacing: 0.04em;
	}
	.chip.on {
		background: var(--fg-primary);
		border-color: var(--fg-primary);
		color: var(--bg-page);
	}

	/* List */
	.list {
		display: flex;
		flex-direction: column;
	}

	.row {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		padding: 16px 0;
		border-bottom: 1px solid var(--ink-100);
		text-decoration: none;
		color: inherit;
		transition: background 150ms;
		border-radius: 4px;
	}
	.row:first-child {
		border-top: 1px solid var(--ink-100);
	}
	.row:hover .row-title {
		color: var(--hinomaru-red);
	}
	.row:hover .row-arrow {
		color: var(--hinomaru-red);
		transform: translateX(3px);
	}
	.row.done .row-num {
		color: var(--success);
	}

	.row-num {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		font-variant-numeric: tabular-nums;
		padding-top: 3px;
		min-width: 24px;
		letter-spacing: 0.02em;
	}

	.row-body {
		flex: 1;
		min-width: 0;
	}

	.row-top {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 2px;
	}

	.row-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
		transition: color 150ms;
	}

	.tag {
		font-size: 10px;
		font-weight: 700;
		padding: 1px 7px;
		border-radius: 99px;
		letter-spacing: 0.03em;
	}
	.tag-done {
		background: var(--success-wash);
		color: var(--success);
		border: 1px solid var(--success);
	}
	.tag-soon {
		background: var(--ink-100);
		color: var(--fg-tertiary);
	}

	.row-sub {
		font-size: 13px;
		color: var(--fg-secondary);
		margin-bottom: 4px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.row-focus {
		font-size: 12px;
		color: var(--fg-tertiary);
		line-height: 1.4;
	}

	.row-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
		padding-top: 3px;
		flex-shrink: 0;
	}

	.row-diff {
		font-size: 8px;
		letter-spacing: 1.5px;
		color: var(--hinomaru-red);
	}

	.row-arrow {
		font-size: 14px;
		color: var(--fg-tertiary);
		transition:
			color 150ms,
			transform 150ms;
	}
</style>
