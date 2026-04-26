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

<div style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));">

	<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:8px;">
		<a href="/" class="back-link">← {t('deck.back', $locale)}</a>
	</div>

	<h1 use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;">
		{t('songs.title', $locale)}
	</h1>

	<p use:fadeUp={{ delay: 0.12, y: 12 }}
		style="font-size:16px;color:var(--fg-secondary);margin:0;">
		{t('songs.subtitle', $locale)}
	</p>

	<!-- Level tabs — same as stories/home -->
	<div
		use:fadeIn={{ delay: 0.18 }}
		class="hide-scrollbar"
		style="display:flex;gap:8px;margin-top:32px;margin-bottom:20px;overflow-x:auto;"
	>
		{#each levels as lvl (lvl)}
			<button
				onclick={() => (activeLevel = lvl)}
				class="filter-chip"
				class:active={activeLevel === lvl}
			>
				{lvl}
			</button>
		{/each}
	</div>

	<!-- Song list -->
	<div class="song-list" use:staggerChildren={{ delay: 0.25, stagger: 0.08, y: 12 }}>
		{#each filtered as song (song.idx)}
			{@const done = completedIds.includes(song.idx)}
			{@const ready = hasContent(song.idx)}
			<a href="/deck/songs/{song.idx}" class="song-card" class:done>
				<div class="song-card-left">
					<div class="song-icon">♪</div>
					<div class="song-info">
						<div class="song-label">
							{song.level}
							{#if done}
								<span class="done-chip">{t('songs.completed', $locale)}</span>
							{:else if !ready}
								<span class="soon-chip">{t('songs.comingSoon', $locale)}</span>
							{/if}
						</div>
						<div class="song-title jp">{song.title}</div>
						<div class="song-artist">{song.artist}</div>
						<div class="song-meta">
							<span class="diff-dots">{diffDots(song.difficulty)}</span>
							<span class="meta-dot">·</span>
							<span class="meta-dur">{t('songs.duration', $locale)}</span>
						</div>
					</div>
				</div>
				<div class="song-card-right">
					<span class="read-more">{t('stories.read', $locale)} →</span>
				</div>
			</a>
			<!-- Focus below card -->
			<div class="song-focus">{$locale === 'es' ? song.focus.es : song.focus.en}</div>
		{/each}
	</div>
</div>

<style>
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		transition: color 150ms ease;
	}
	.back-link:hover { color: var(--sumi); }

	.filter-chip {
		height: 42px;
		padding: 0 16px;
		border-radius: 999px;
		border: 1px solid var(--ink-200);
		background: var(--bg-surface);
		color: var(--sumi);
		font-weight: 600;
		font-size: 13px;
		cursor: pointer;
		font-family: var(--font-ui);
		white-space: nowrap;
		flex-shrink: 0;
		transition: all 180ms ease;
	}
	.filter-chip.active {
		background: var(--sumi);
		color: var(--bg-surface);
		border-color: var(--sumi);
	}

	.song-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.song-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px 20px;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-sm);
		transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;
		position: relative;
		overflow: hidden;
	}
	.song-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(188, 0, 45, 0.03) 0%, transparent 60%);
		pointer-events: none;
	}
	.song-card:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
		border-color: var(--ink-300);
	}
	.song-card.done {
		border-color: var(--success);
	}

	.song-card-left {
		display: flex;
		align-items: center;
		gap: 14px;
		min-width: 0;
	}

	.song-icon {
		width: 44px;
		height: 44px;
		background: var(--sumi);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		color: var(--bg-surface);
		flex-shrink: 0;
	}
	.song-card.done .song-icon {
		background: var(--success);
	}

	.song-info {
		min-width: 0;
	}

	.song-label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		margin-bottom: 2px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.done-chip {
		background: var(--success-wash);
		color: var(--success);
		font-size: 9px;
		font-weight: 700;
		padding: 1px 6px;
		border-radius: 99px;
		text-transform: none;
		letter-spacing: 0;
	}

	.soon-chip {
		background: var(--ink-100);
		color: var(--fg-tertiary);
		font-size: 9px;
		font-weight: 600;
		padding: 1px 6px;
		border-radius: 99px;
		text-transform: none;
		letter-spacing: 0;
	}

	.song-title {
		font-size: 17px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
		margin-bottom: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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
		gap: 5px;
		margin-top: 4px;
	}

	.diff-dots {
		font-size: 8px;
		letter-spacing: 1px;
		color: var(--hinomaru-red);
	}

	.meta-dot {
		font-size: 11px;
		color: var(--ink-300);
	}

	.meta-dur {
		font-size: 11px;
		color: var(--fg-tertiary);
	}

	.song-card-right {
		flex-shrink: 0;
	}

	.read-more {
		font-size: 13px;
		font-weight: 600;
		color: var(--hinomaru-red);
		white-space: nowrap;
	}

	.song-focus {
		font-size: 12px;
		color: var(--fg-tertiary);
		padding: 0 20px 8px 78px;
		line-height: 1.4;
	}
</style>
