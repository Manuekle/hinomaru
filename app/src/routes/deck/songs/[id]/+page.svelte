<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, scaleIn } from '$lib/motion';
	import { jlptSongs, parseTime } from '$lib/utils/jlptSongs';
	import Mascot from '$lib/components/Mascot.svelte';
	import Icon from '$lib/Icon.svelte';
	import { 
		PlayIcon, 
		PauseIcon, 
		ArrowReloadHorizontalIcon, 
		ArrowLeft02Icon,
		Tick01Icon,
		Cancel01Icon,
		VolumeHighIcon
	} from '@hugeicons/core-free-icons';
	import { speakJapanese } from '$lib/utils/tts';

	// ── Song data ──────────────────────────────────────────────────
	let songId = $derived(Number($page.params.id));
	let song = $derived(jlptSongs[songId]);
	let startSec = $derived(song ? parseTime(song.start) : 0);
	let endSec = $derived(song ? parseTime(song.end) : 30);
	let clipDuration = $derived(endSec - startSec);
	let hasVideo = $derived(song?.youtubeId && song.youtubeId !== 'PLACEHOLDER');
	let hasLyrics = $derived(song?.lyrics && song.lyrics.length > 0);

	const levelColors: Record<string, string> = {
		N5: '#2e7d5b', N4: '#6d8c3b', N3: '#a8741a', N2: '#2563ab', N1: '#bc002d'
	};

	// ── Player state ───────────────────────────────────────────────
	let player: any = null;
	let playerReady = $state(false);
	let isPlaying = $state(false);
	let currentTime = $state(0);
	let speed = $state(1);
	let completed = $state(false);
	let showCompletionToast = $state(false);
	let mascotMood = $derived((isPlaying || completed ? 'happy' : 'thinking') as 'happy' | 'thinking');

	// Interval for time tracking
	let trackInterval: ReturnType<typeof setInterval> | null = null;

	// ── Lyric state ────────────────────────────────────────────────
	let currentLyricIndex = $state(-1);
	let lyricEls = $state<HTMLElement[]>([]);
	let lyricsContainer = $state<HTMLElement | null>(null);

	const clipProgress = $derived(
		Math.min(100, Math.max(0, ((currentTime - startSec) / clipDuration) * 100))
	);

	const clipElapsed = $derived.by(() => {
		const s = Math.floor(Math.max(0, currentTime - startSec));
		const m = Math.floor(s / 60);
		return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
	});
	
	const clipTotal = $derived.by(() => {
		const s = clipDuration;
		const m = Math.floor(s / 60);
		return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
	});

	// ── YouTube IFrame API ─────────────────────────────────────────
	let playerContainerId = $derived('yt-player-' + songId);

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
		if (!hasLyrics || !song) return;
		let active = -1;
		for (let i = song.lyrics.length - 1; i >= 0; i--) {
			if (song.lyrics[i].time <= time + 0.15) { active = i; break; }
		}
		if (active !== currentLyricIndex) {
			currentLyricIndex = active;
			scrollToActiveLyric(active);
		}
	}

	function scrollToActiveLyric(idx: number) {
		if (idx < 0 || !lyricEls[idx] || !lyricsContainer) return;
		const el = lyricEls[idx];
		const container = lyricsContainer;
		const targetScroll = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
		container.scrollTo({ top: targetScroll, behavior: 'smooth' });
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
		if (!hasVideo || !song) return;
		// Destroy existing player if any
		try { player?.destroy(); player = null; playerReady = false; } catch {}

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
					// Force seek to start position to avoid starting at 0
					player.seekTo(startSec, true);
				},
				onStateChange: (e: any) => {
					const YTStates = (window as any).YT.PlayerState;
					if (e.data === YTStates.PLAYING) {
						isPlaying = true;
						startTracking();
					} else if (e.data === YTStates.PAUSED || e.data === YTStates.ENDED) {
						isPlaying = false;
						stopTracking();
						if (e.data === YTStates.ENDED) onClipEnd();
					}
				}
			}
		});
	}

	let prevSongId = -1;

	$effect(() => {
		const id = songId;
		isPlaying = false;
		completed = false;
		currentTime = startSec;
		currentLyricIndex = -1;
		showCompletionToast = false;
		lyricEls = [];

		if (!hasVideo) { prevSongId = id; return; }

		const win = window as any;
		const doInit = () => {
			prevSongId = id;
			initYT();
		};

		if (win.YT && win.YT.Player) {
			// Small delay only when switching songs (not first load)
			if (prevSongId !== -1) {
				setTimeout(doInit, 60);
			} else {
				doInit();
			}
		} else {
			win.onYouTubeIframeAPIReady = doInit;
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
		<p class="song-focus">{$locale === 'es' ? song.focus.es : song.focus.en}</p>
	</div>

	{#if !hasVideo}
		<!-- Coming soon state -->
		<div class="coming-soon" use:scaleIn={{ delay: 0.12 }}>
			<Mascot mood={mascotMood} size={120} position="center" />
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
						<div class="video-loading-inner">
							<div class="spinner"></div>
							<span class="loading-note">♪</span>
						</div>
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
					<Icon icon={isPlaying ? PauseIcon : PlayIcon} size={22} variant="solid" />
				</button>

				<!-- Replay -->
				<button class="ctrl-btn" onclick={replay} disabled={!playerReady} aria-label="Replay">
					<Icon icon={ArrowReloadHorizontalIcon} size={18} />
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
				<span class="time-label">{clipElapsed}</span>
				<div class="clip-bar">
					<div class="clip-fill" style="width:{clipProgress}%"></div>
				</div>
				<span class="time-label">{clipTotal}</span>
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
			<div class="lyrics-scroll" bind:this={lyricsContainer}>
				<div class="lyrics-spacer-top"></div>
				{#each song.lyrics as line, idx}
					{@const dist = idx - currentLyricIndex}
					{@const isActive = dist === 0 && currentLyricIndex >= 0}
					{@const isPast = idx < currentLyricIndex}
					{@const isNear = currentLyricIndex >= 0 && !isActive && (dist === 1 || dist === -1)}
					<button
						bind:this={lyricEls[idx]}
						class="lyric-line"
						class:active={isActive}
						class:past={isPast}
						class:near={isNear && !isActive}
						onclick={() => {
							if (player && playerReady) {
								player.seekTo(line.time, true);
								if (!isPlaying) player.playVideo();
							}
						}}
					>
						<div class="lyric-jp jp">{line.text}</div>
						{#if $showRomaji && line.romaji}
							<div class="lyric-romaji">{line.romaji}</div>
						{/if}
						{#if isActive}
							<div class="lyric-translation">
								{$locale === 'es' ? line.translation_es : line.translation_en}
							</div>
						{/if}
					</button>
				{/each}
				<div class="lyrics-spacer-bottom"></div>
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
					<button class="vocab-card" onclick={() => speakJapanese(word.jp)}>
						<div class="vocab-header">
							<div class="vocab-jp jp">{word.jp}</div>
							<div class="vocab-play-btn">
								<Icon icon={VolumeHighIcon} size={14} />
							</div>
						</div>
						<div class="vocab-kana">{word.kana}</div>
						{#if $showRomaji && word.romaji}
							<div class="vocab-romaji">{word.romaji}</div>
						{/if}
						<div class="vocab-meaning">
							{$locale === 'es' ? word.es : word.en}
						</div>
					</button>
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
		color: var(--paper);
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
		border: 1px solid var(--ink-200);
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
		box-shadow: var(--shadow-md);
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
		background: #0c0c0c;
	}

	.video-loading-inner {
		position: relative;
		width: 56px;
		height: 56px;
	}

	.spinner {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.08);
		border-top-color: var(--hinomaru-red);
		animation: spin 0.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
	}

	.loading-note {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		color: rgba(255, 255, 255, 0.35);
		animation: note-pulse 2s ease-in-out infinite;
	}

	@keyframes note-pulse {
		0%, 100% { opacity: 0.3; transform: scale(0.92); }
		50%       { opacity: 0.7; transform: scale(1.06); }
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* ── Controls ── */
	.controls {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
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
		border: 1px solid var(--ink-200);
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
		color: var(--paper);
		border-radius: 14px;
	}
	.ctrl-main:not(:disabled):hover {
		filter: brightness(0.88);
	}

	.speed-group {
		display: flex;
		gap: 4px;
		margin-left: auto;
	}

	.speed-btn {
		padding: 6px 11px;
		border-radius: 8px;
		border: 1px solid var(--ink-200);
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
		color: var(--paper);
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
		gap: 12px;
		background: var(--success-wash);
		border: 1px solid var(--success);
		border-radius: 16px;
		padding: 12px 16px;
		margin-bottom: 24px;
		font-size: 14px;
		font-weight: 600;
		color: var(--success);
		box-shadow: var(--shadow-sm);
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

	/* ── Lyrics — Apple Music style ── */
	.lyrics-scroll {
		position: relative;
		height: 360px;
		overflow-y: scroll;
		overflow-x: hidden;
		scrollbar-width: none;
		-ms-overflow-style: none;
		scroll-behavior: smooth;
		-webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%);
		mask-image: linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%);
	}
	.lyrics-scroll::-webkit-scrollbar { display: none; }

	.lyrics-spacer-top    { height: 120px; flex-shrink: 0; }
	.lyrics-spacer-bottom { height: 120px; flex-shrink: 0; }

	.lyric-line {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: 8px 16px;
		cursor: pointer;
		transition: opacity 350ms cubic-bezier(0.4, 0, 0.2, 1),
		            transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0.25;
		transform: scale(0.88);
		transform-origin: left center;
		will-change: opacity, transform;
		font-family: inherit;
	}
	.lyric-line:hover { opacity: 0.5; }

	.lyric-line.near {
		opacity: 0.55;
		transform: scale(0.94);
	}

	.lyric-line.past {
		opacity: 0.2;
		transform: scale(0.86);
	}

	.lyric-line.active {
		opacity: 1;
		transform: scale(1);
	}

	/* Fixed font-size — no layout reflow on line change */
	.lyric-jp {
		font-size: 22px;
		font-weight: 600;
		color: var(--fg-primary);
		line-height: 1.35;
	}

	.lyric-romaji {
		font-size: 13px;
		color: var(--fg-tertiary);
		margin-top: 3px;
		line-height: 1.3;
	}

	.lyric-line.active .lyric-romaji {
		color: var(--hinomaru-red);
		opacity: 0.85;
	}

	.lyric-translation {
		font-size: 13px;
		color: var(--fg-secondary);
		margin-top: 5px;
		line-height: 1.4;
		animation: fadeSlideIn 260ms cubic-bezier(0.4, 0, 0.2, 1) both;
	}

	@keyframes fadeSlideIn {
		from { opacity: 0; transform: translateY(3px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* ── Vocabulary ── */
	.vocab-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 10px;
	}

	.vocab-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 3px;
		box-shadow: var(--shadow-sm);
		text-align: left;
		cursor: pointer;
		transition: all 150ms ease;
		width: 100%;
		font-family: inherit;
	}
	.vocab-card:hover {
		border-color: var(--hinomaru-red);
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}
	.vocab-card:active { transform: scale(0.98); }

	.vocab-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.vocab-jp {
		font-size: 22px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1;
	}

	.vocab-play-btn {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--ink-100);
		border-radius: 50%;
		color: var(--fg-tertiary);
		transition: all 150ms ease;
	}
	.vocab-card:hover .vocab-play-btn {
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
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
