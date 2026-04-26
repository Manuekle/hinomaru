<script lang="ts">
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, staggerChildren } from '$lib/motion';
	import { jlptSongs } from '$lib/utils/jlptSongs';
	import type { JLPTLevel } from '$lib/utils/jlptSongs';

	const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
	let activeLevel = $state<JLPTLevel>('N5');
	const activeLevelIdx = $derived(levels.indexOf(activeLevel));
	let completedIds = $state<number[]>([]);

	const levelColors: Record<JLPTLevel, string> = {
		N5: '#2e7d5b',
		N4: '#6d8c3b',
		N3: '#a8741a',
		N2: '#2563ab',
		N1: '#bc002d'
	};

	onMount(() => {
		try {
			const raw = localStorage.getItem('hinomaru_songs_completed');
			if (raw) completedIds = JSON.parse(raw);
		} catch {
			completedIds = [];
		}
	});

	const filtered = $derived(
		jlptSongs
			.map((s, idx) => ({ ...s, idx }))
			.filter((s) => s.level === activeLevel)
	);

	function diffDots(n: number): string {
		return '●'.repeat(n) + '○'.repeat(5 - n);
	}

	function hasContent(idx: number): boolean {
		const s = jlptSongs[idx];
		return s.youtubeId !== 'PLACEHOLDER' || s.lyrics.length > 0;
	}
</script>

<svelte:head>
	<title>{t('songs.title', $locale)} — Hinomaru</title>
</svelte:head>

<div class="page">
	<div use:fadeIn={{ delay: 0 }}>
		<a href="/" class="back-link">← {t('deck.back', $locale)}</a>
	</div>

	<h1 use:fadeUp={{ delay: 0.06, y: 16 }}>{t('songs.title', $locale)}</h1>
	<p class="subtitle" use:fadeUp={{ delay: 0.1, y: 12 }}>
		{t('songs.subtitle', $locale)}
	</p>

	<!-- Level tabs -->
	<div class="level-tabs" use:fadeUp={{ delay: 0.14, y: 10 }}>
		<div
			class="tab-glider"
			style="transform: translateX({activeLevelIdx * 100}%); background: {levelColors[activeLevel]};"
		></div>
		{#each levels as lvl}
			<button
				class="level-tab"
				class:active={activeLevel === lvl}
				onclick={() => (activeLevel = lvl)}
			>
				{lvl}
			</button>
		{/each}
	</div>

	<!-- Song list -->
	<div class="song-list" use:staggerChildren={{ delay: 0.18, stagger: 0.07, y: 14 }}>
		{#each filtered as song (song.idx)}
			{@const done = completedIds.includes(song.idx)}
			{@const ready = hasContent(song.idx)}
			<a
				href="/deck/songs/{song.idx}"
				class="song-card"
				class:done
			>
				<div class="song-card-top">
					<div class="song-icon">
						<span class="music-note">♪</span>
					</div>

					<div class="song-info">
						<div class="song-title-row">
							<span class="song-title jp">{song.title}</span>
							{#if done}
								<span class="done-badge">✓</span>
							{:else if !ready}
								<span class="soon-badge">{t('songs.comingSoon', $locale)}</span>
							{/if}
						</div>
						<div class="song-artist">{song.artist}</div>

						<div class="song-meta">
							<span class="meta-item">
								<span class="diff-dots">{diffDots(song.difficulty)}</span>
							</span>
							<span class="meta-sep">·</span>
							<span class="meta-item">{t('songs.duration', $locale)}</span>
						</div>
					</div>

					<span class="arrow">→</span>
				</div>

				<div class="song-focus">{$locale === 'es' ? song.focus.es : song.focus.en}</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.page {
		max-width: 680px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 20px calc(60px + env(safe-area-inset-bottom));
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		margin-bottom: 16px;
		transition: color 150ms ease;
	}
	.back-link:hover { color: var(--sumi); }

	h1 {
		font-size: 40px;
		font-weight: 700;
		letter-spacing: -0.03em;
		margin: 0 0 8px;
		color: var(--fg-primary);
	}

	.subtitle {
		font-size: 16px;
		color: var(--fg-secondary);
		margin: 0 0 28px;
		line-height: 1.4;
	}

	/* Level tabs */
	.level-tabs {
		position: relative;
		display: flex;
		background: var(--ink-100);
		border-radius: 16px;
		padding: 4px;
		margin-bottom: 28px;
		height: 44px;
	}

	.tab-glider {
		position: absolute;
		top: 4px;
		left: 4px;
		width: calc(20% - 4px);
		height: calc(100% - 8px);
		border-radius: 12px;
		box-shadow: var(--shadow-sm);
		transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), background 0.3s ease;
		z-index: 1;
		pointer-events: none;
	}

	.level-tab {
		flex: 1;
		background: none;
		border: none;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-secondary);
		cursor: pointer;
		position: relative;
		z-index: 2;
		transition: color 0.3s ease;
		font-family: var(--font-ui);
		border-radius: 12px;
	}
	.level-tab.active {
		color: white;
	}

	/* Song list */
	.song-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.song-card {
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px;
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		gap: 10px;
		transition: box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease;
	}
	.song-card:hover {
		box-shadow: var(--shadow-md);
		border-color: var(--ink-300);
		transform: translateY(-1px);
	}
	.song-card.done {
		border-color: var(--success);
		background: var(--success-wash);
	}

	.song-card-top {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.song-icon {
		width: 44px;
		height: 44px;
		border-radius: 14px;
		background: var(--ink-100);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.song-card.done .song-icon {
		background: var(--success-wash);
	}

	.music-note {
		font-size: 20px;
		color: var(--fg-secondary);
	}

	.song-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.song-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.song-title {
		font-size: 17px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
	}

	.done-badge {
		font-size: 11px;
		font-weight: 700;
		color: var(--success);
		background: transparent;
		border: 1.5px solid var(--success);
		border-radius: 99px;
		padding: 1px 6px;
	}

	.soon-badge {
		font-size: 10px;
		font-weight: 600;
		color: var(--fg-tertiary);
		background: var(--ink-100);
		border-radius: 99px;
		padding: 2px 7px;
	}

	.song-artist {
		font-size: 13px;
		color: var(--fg-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.song-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 3px;
	}

	.meta-item {
		font-size: 12px;
		color: var(--fg-tertiary);
	}

	.meta-sep {
		font-size: 12px;
		color: var(--ink-300);
	}

	.diff-dots {
		font-size: 9px;
		letter-spacing: 1px;
		color: var(--hinomaru-red);
	}

	.arrow {
		font-size: 16px;
		color: var(--fg-tertiary);
		flex-shrink: 0;
	}

	.song-focus {
		font-size: 13px;
		color: var(--fg-secondary);
		line-height: 1.4;
		padding-left: 58px;
	}
</style>
