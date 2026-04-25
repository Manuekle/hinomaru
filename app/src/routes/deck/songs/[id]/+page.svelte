<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, scaleIn } from '$lib/motion';
	import { jlptSongs, parseTime } from '$lib/utils/jlptSongs';
	import Mascot from '$lib/components/Mascot.svelte';

	// ── Song data ──────────────────────────────────────────────────
	const songId = Number($page.params.id);
	const song = jlptSongs[songId];
	const startSec = song ? parseTime(song.start) : 0;
	const endSec = song ? parseTime(song.end) : 30;
	const clipDuration = endSec - startSec;

	const hasVideo = song?.youtubeId && song.youtubeId !== 'PLACEHOLDER';
	const hasLyrics = song?.lyrics && song.lyrics.length > 0;

	const levelColors: Record<string, string> = {
		N5: '#2e7d5b', N4: '#6d8c3b', N3: '#a8741a', N2: '#2563ab', N1: '#bc002d'
	};

	// ── Player state ───────────────────────────────────────────────
	let player: any = null;
	let playerReady = $state(false);
	let isPlaying = $state(false);
	let currentTime = $state(startSec);
	let speed = $state(1);
	let completed = $state(false);
	let showCompletionToast = $state(false);

	// Interval for time tracking
	let trackInterval: ReturnType<typeof setInterval> | null = null;

	// ── Lyric state ────────────────────────────────────────────────
	let currentLyricIndex = $state(-1);
	let lyricEls = $state<HTMLElement[]>([]);

	const clipProgress = $derived(
		Math.min(100, Math.max(0, ((currentTime - startSec) / clipDuration) * 100))
	);

	const clipElapsed = $derived(() => {
		const s = Math.floor(Math.max(0, currentTime - startSec));
		const m = Math.floor(s / 60);
		return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
	});

	const clipTotal = $derived(() => {
		const s = clipDuration;
		const m = Math.floor(s / 60);
		return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
	});

	// ── YouTube IFrame API ─────────────────────────────────────────
	let playerContainerId = 'yt-player-' + songId;

	function startTracking() {
		stopTracking();
		trackInterval = setInterval(() => {
			if (!player) return;
			try {
				const t = player.getCurrentTime();
				currentTime = t;
				syncLyrics(t);
				if (t >= endSec) {
					player.pauseVideo();
					onClipEnd();
				}
			} catch {
				// player not ready
			}
		}, 100);
	}

	function stopTracking() {
		if (trackInterval) {
			clearInterval(trackInterval);
			trackInterval = null;
		}
	}

	function syncLyrics(time: number) {
		if (!hasLyrics) return;
		let active = -1;
		for (let i = song.lyrics.length - 1; i >= 0; i--) {
			if (song.lyrics[i].time <= time) { active = i; break; }
		}
		if (active !== currentLyricIndex) {
			currentLyricIndex = active;
			if (active >= 0 && lyricEls[active]) {
				lyricEls[active].scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}

	function onClipEnd() {
		isPlaying = false;
		stopTracking();
		if (!completed) {
			completed = true;
			showCompletionToast = true;
			try {
				const raw = localStorage.getItem('hinomaru_songs_completed');
				const ids: number[] = raw ? JSON.parse(raw) : [];
				if (!ids.includes(songId)) {
					ids.push(songId);
					localStorage.setItem('hinomaru_songs_completed', JSON.stringify(ids));
				}
			} catch {
				// ignore
			}
		}
	}

	function play() {
		if (!player || !playerReady) return;
		player.playVideo();
	}

	function pause() {
		if (!player || !playerReady) return;
		player.pauseVideo();
	}

	function replay() {
		if (!player || !playerReady) return;
		currentLyricIndex = -1;
		player.seekTo(startSec, true);
		player.setPlaybackRate(speed);
		player.playVideo();
	}

	function setSpeed(s: number) {
		speed = s;
		if (player && playerReady) player.setPlaybackRate(s);
	}

	function initYT() {
		if (!hasVideo) return;
		// @ts-ignore
		const YT = (window as any).YT;
		if (!YT) return;

		player = new YT.Player(playerContainerId, {
			videoId: song.youtubeId,
			playerVars: {
				start: startSec,
				end: endSec,
				autoplay: 0,
				controls: 0,
				rel: 0,
				modestbranding: 1,
				playsinline: 1,
				fs: 0,
				iv_load_policy: 3,
				disablekb: 1
			},
			events: {
				onReady: () => {
					playerReady = true;
					player.setPlaybackRate(speed);
				},
				onStateChange: (e: any) => {
					const YTStates = (window as any).YT.PlayerState;
					if (e.data === YTStates.PLAYING) {
						isPlaying = true;
						startTracking();
					} else if (e.data === YTStates.PAUSED || e.data === YTStates.ENDED) {
						isPlaying = false;
						stopTracking();
					}
				}
			}
		});
	}

	onMount(() => {
		if (!hasVideo) return;

		const win = window as any;
		if (win.YT && win.YT.Player) {
			initYT();
		} else {
			win.onYouTubeIframeAPIReady = initYT;
			if (!document.getElementById('yt-api-script')) {
				const s = document.createElement('script');
				s.id = 'yt-api-script';
				s.src = 'https://www.youtube.com/iframe_api';
				document.head.appendChild(s);
			}
		}
	});

	onDestroy(() => {
		stopTracking();
		try { player?.destroy(); } catch { }
	});
</script>

<svelte:head>
	<title>{song?.title ?? 'Song'} — Hinomaru</title>
</svelte:head>

{#if !song}
	<div style="padding:40px;text-align:center;color:var(--fg-secondary);">
		Song not found. <a href="/deck/songs">← Back</a>
	</div>
{:else}
<div class="player-page">

	<!-- Header -->
	<div class="page-header" use:fadeIn={{ delay: 0 }}>
		<a href="/deck/songs" class="back-link">← {t('deck.back', $locale)}</a>
		<div class="header-pills">
			<span class="level-pill" style="background:{levelColors[song.level] ?? '#bc002d'}">{song.level}</span>
			<span class="diff-pill">{'●'.repeat(song.difficulty)}{'○'.repeat(5 - song.difficulty)}</span>
		</div>
	</div>

	<!-- Song title -->
	<div class="song-header" use:fadeUp={{ delay: 0.06, y: 14 }}>
		<h1 class="song-title jp">{song.title}</h1>
		<p class="song-artist">{song.artist}</p>
		<p class="song-focus">{song.focus}</p>
	</div>

	{#if !hasVideo}
		<!-- Coming soon state -->
		<div class="coming-soon" use:scaleIn={{ delay: 0.12 }}>
			<Mascot mood="thinking" size={120} position="center" />
			<p class="cs-title">{t('songs.comingSoon', $locale)}</p>
			<p class="cs-desc">{t('songs.comingSoonDesc', $locale)}</p>
		</div>
	{:else}
		<!-- YouTube player -->
		<div class="video-wrapper" use:fadeUp={{ delay: 0.1, y: 16 }}>
			<div class="video-ratio">
				<div id={playerContainerId} class="yt-embed"></div>
				{#if !playerReady}
					<div class="video-loading">
						<div class="spinner"></div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Controls -->
		<div class="controls" use:fadeUp={{ delay: 0.16, y: 12 }}>
			<div class="ctrl-buttons">
				<!-- Play / Pause -->
				<button
					class="ctrl-btn ctrl-main"
					onclick={isPlaying ? pause : play}
					disabled={!playerReady}
					aria-label={isPlaying ? 'Pause' : 'Play'}
				>
					{#if isPlaying}
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="4" width="4" height="16" rx="1"/>
							<rect x="14" y="4" width="4" height="16" rx="1"/>
						</svg>
					{:else}
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z"/>
						</svg>
					{/if}
				</button>

				<!-- Replay -->
				<button class="ctrl-btn" onclick={replay} disabled={!playerReady} aria-label="Replay">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
						<path d="M3 3v5h5"/>
					</svg>
					{t('songs.replay', $locale)}
				</button>

				<!-- Speed -->
				<div class="speed-group">
					<button class="speed-btn" class:active={speed === 0.75} onclick={() => setSpeed(0.75)}>0.75×</button>
					<button class="speed-btn" class:active={speed === 1} onclick={() => setSpeed(1)}>1×</button>
				</div>
			</div>

			<!-- Progress bar -->
			<div class="progress-row">
				<span class="time-label">{clipElapsed()}</span>
				<div class="clip-bar">
					<div class="clip-fill" style="width:{clipProgress}%"></div>
				</div>
				<span class="time-label">{clipTotal()}</span>
			</div>
		</div>

		<!-- Completion toast -->
		{#if showCompletionToast}
			<div class="completion-toast" use:scaleIn={{ delay: 0 }}>
				<span class="toast-emoji">🎉</span>
				<span>{t('songs.doneBravo', $locale)}</span>
				<button class="toast-close" onclick={() => (showCompletionToast = false)}>✕</button>
			</div>
		{/if}
	{/if}

	<!-- Lyrics section -->
	{#if hasLyrics}
		<div class="section" use:fadeUp={{ delay: 0.2, y: 12 }}>
			<div class="section-label">{t('songs.lyrics', $locale)}</div>
			<div class="lyrics-scroll">
				{#each song.lyrics as line, idx}
					<div
						bind:this={lyricEls[idx]}
						class="lyric-line"
						class:active={idx === currentLyricIndex}
						class:past={idx < currentLyricIndex}
					>
						<div class="lyric-jp jp">{line.text}</div>
						{#if $showRomaji && line.romaji}
							<div class="lyric-romaji">{line.romaji}</div>
						{/if}
						<div class="lyric-translation">
							{$locale === 'es' ? line.translation_es : line.translation_en}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if hasVideo}
		<div class="section no-lyrics" use:fadeIn={{ delay: 0.22 }}>
			<div class="section-label">{t('songs.lyrics', $locale)}</div>
			<p class="muted">{t('songs.noLyrics', $locale)}</p>
		</div>
	{/if}

	<!-- Vocabulary section -->
	{#if song.vocab && song.vocab.length > 0}
		<div class="section" use:fadeUp={{ delay: 0.25, y: 10 }}>
			<div class="section-label">{t('songs.vocab', $locale)}</div>
			<div class="vocab-grid">
				{#each song.vocab as word}
					<div class="vocab-card">
						<div class="vocab-jp jp">{word.jp}</div>
						<div class="vocab-kana">{word.kana}</div>
						{#if $showRomaji && word.romaji}
							<div class="vocab-romaji">{word.romaji}</div>
						{/if}
						<div class="vocab-meaning">
							{$locale === 'es' ? word.es : word.en}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

</div>
{/if}

<style>
	.player-page {
		max-width: 680px;
		margin: 0 auto;
		padding: calc(20px + env(safe-area-inset-top)) 20px calc(60px + env(safe-area-inset-bottom));
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* ── Header ── */
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.back-link {
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		transition: color 150ms ease;
	}
	.back-link:hover { color: var(--sumi); }

	.header-pills {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.level-pill {
		font-size: 11px;
		font-weight: 700;
		color: white;
		padding: 3px 9px;
		border-radius: 99px;
	}

	.diff-pill {
		font-size: 9px;
		letter-spacing: 1.5px;
		color: var(--hinomaru-red);
		font-weight: 700;
	}

	/* ── Song header ── */
	.song-header {
		margin-bottom: 20px;
	}

	.song-title {
		font-size: 32px;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin: 0 0 4px;
		color: var(--fg-primary);
		line-height: 1.15;
	}

	.song-artist {
		font-size: 15px;
		color: var(--fg-secondary);
		margin: 0 0 6px;
	}

	.song-focus {
		font-size: 13px;
		color: var(--fg-tertiary);
		margin: 0;
		padding: 6px 12px;
		background: var(--ink-100);
		border-radius: 8px;
		display: inline-block;
	}

	/* ── Coming soon ── */
	.coming-soon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 40px 24px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 24px;
		text-align: center;
		margin-bottom: 24px;
	}

	.cs-title {
		font-size: 20px;
		font-weight: 700;
		margin: 0;
		color: var(--fg-primary);
	}

	.cs-desc {
		font-size: 14px;
		color: var(--fg-secondary);
		margin: 0;
		line-height: 1.5;
		max-width: 280px;
	}

	/* ── Video ── */
	.video-wrapper {
		margin-bottom: 16px;
	}

	.video-ratio {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: var(--sumi);
		border-radius: 20px;
		overflow: hidden;
		box-shadow: var(--shadow-lg);
	}

	.yt-embed {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* YouTube iframe injected by API needs explicit sizing */
	:global(.yt-embed iframe) {
		width: 100% !important;
		height: 100% !important;
		border: none;
	}

	.video-loading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--ink-700);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid rgba(255,255,255,0.2);
		border-top-color: var(--hinomaru-red);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* ── Controls ── */
	.controls {
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px;
		margin-bottom: 24px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		box-shadow: var(--shadow-sm);
	}

	.ctrl-buttons {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.ctrl-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 16px;
		height: 40px;
		border-radius: 12px;
		border: 1.5px solid var(--ink-200);
		background: var(--ink-100);
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-primary);
		cursor: pointer;
		transition: all 150ms ease;
		font-family: var(--font-ui);
	}
	.ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
	.ctrl-btn:not(:disabled):hover { background: var(--ink-200); }
	.ctrl-btn:not(:disabled):active { transform: scale(0.96); }

	.ctrl-main {
		width: 44px;
		height: 44px;
		padding: 0;
		justify-content: center;
		background: var(--hinomaru-red);
		border-color: transparent;
		color: white;
		border-radius: 14px;
	}
	.ctrl-main:not(:disabled):hover {
		background: var(--hinomaru-red-ink);
	}

	.speed-group {
		display: flex;
		gap: 4px;
		margin-left: auto;
	}

	.speed-btn {
		padding: 6px 11px;
		border-radius: 8px;
		border: 1.5px solid var(--ink-200);
		background: transparent;
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-secondary);
		cursor: pointer;
		transition: all 150ms ease;
		font-family: var(--font-ui);
	}
	.speed-btn.active {
		background: var(--sumi);
		border-color: transparent;
		color: white;
	}
	.speed-btn:not(.active):hover { background: var(--ink-100); }

	/* Progress bar */
	.progress-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.time-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-tertiary);
		font-variant-numeric: tabular-nums;
		min-width: 36px;
	}

	.clip-bar {
		flex: 1;
		height: 4px;
		background: var(--ink-200);
		border-radius: 99px;
		overflow: hidden;
	}

	.clip-fill {
		height: 100%;
		background: var(--hinomaru-red);
		border-radius: 99px;
		transition: width 100ms linear;
	}

	/* ── Completion toast ── */
	.completion-toast {
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--success-wash);
		border: 1.5px solid var(--success);
		border-radius: 16px;
		padding: 12px 16px;
		margin-bottom: 20px;
		font-size: 14px;
		font-weight: 600;
		color: var(--success);
	}

	.toast-emoji { font-size: 20px; }

	.toast-close {
		margin-left: auto;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--success);
		font-size: 14px;
		padding: 0;
		opacity: 0.7;
	}

	/* ── Sections ── */
	.section {
		margin-bottom: 28px;
	}

	.section-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		margin-bottom: 14px;
	}

	.no-lyrics .muted {
		font-size: 14px;
		color: var(--fg-tertiary);
		margin: 0;
	}

	/* ── Lyrics ── */
	.lyrics-scroll {
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-height: 400px;
		overflow-y: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
		padding: 8px 0;
	}
	.lyrics-scroll::-webkit-scrollbar { display: none; }

	.lyric-line {
		padding: 14px 18px;
		border-radius: 16px;
		transition: all 250ms ease;
		opacity: 0.5;
		border: 1.5px solid transparent;
	}

	.lyric-line.past {
		opacity: 0.3;
	}

	.lyric-line.active {
		opacity: 1;
		background: var(--hinomaru-red-wash);
		border-color: rgba(188, 0, 45, 0.15);
		transform: scale(1.01);
	}

	.lyric-jp {
		font-size: 20px;
		font-weight: 600;
		color: var(--fg-primary);
		line-height: 1.3;
	}

	.lyric-line.active .lyric-jp {
		color: var(--hinomaru-red);
	}

	.lyric-romaji {
		font-size: 12px;
		color: var(--fg-tertiary);
		margin-top: 2px;
	}

	.lyric-line.active .lyric-romaji {
		color: var(--hinomaru-red-ink);
		opacity: 0.7;
	}

	.lyric-translation {
		font-size: 13px;
		color: var(--fg-secondary);
		margin-top: 4px;
		line-height: 1.4;
	}

	/* ── Vocabulary ── */
	.vocab-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 10px;
	}

	.vocab-card {
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 3px;
		box-shadow: var(--shadow-sm);
	}

	.vocab-jp {
		font-size: 22px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1;
	}

	.vocab-kana {
		font-size: 12px;
		color: var(--fg-secondary);
		font-family: var(--font-jp);
	}

	.vocab-romaji {
		font-size: 11px;
		color: var(--fg-tertiary);
	}

	.vocab-meaning {
		font-size: 13px;
		color: var(--fg-secondary);
		margin-top: 4px;
		line-height: 1.3;
	}
</style>
