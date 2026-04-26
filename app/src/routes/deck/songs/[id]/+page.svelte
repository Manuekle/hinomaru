<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn } from '$lib/motion';
	import { jlptSongs, parseTime } from '$lib/utils/jlptSongs';
	import Mascot from '$lib/components/Mascot.svelte';
	import Icon from '$lib/Icon.svelte';
	import {
		PlayIcon,
		PauseIcon,
		ArrowReloadHorizontalIcon,
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
		try { player?.destroy(); player = null; playerReady = false; } catch {}

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
		try { player?.destroy(); } catch {}
	});
</script>

<svelte:head>
	<title>{song?.title ?? 'Song'} — Hinomaru</title>
</svelte:head>

{#if !song}
	<div style="padding:80px 24px;text-align:center;color:var(--fg-secondary);max-width:680px;margin:0 auto;">
		Song not found. <a href="/deck/songs" style="color:var(--hinomaru-red);">← Back</a>
	</div>
{:else}
<div class="page">

	<!-- Back link -->
	<div use:fadeIn={{ delay: 0 }}>
		<a href="/deck/songs" class="back">← {t('deck.back', $locale)}</a>
	</div>

	<!-- Song hero -->
	<div class="hero" use:fadeUp={{ delay: 0.05, y: 14 }}>
		<div class="hero-meta">
			<span class="level-tag" style="background:{levelColors[song.level] ?? '#bc002d'}">{song.level}</span>
			<span class="diff-dots">{'●'.repeat(song.difficulty)}{'○'.repeat(5 - song.difficulty)}</span>
		</div>
		<h1 class="song-title jp">{song.title}</h1>
		<p class="song-artist">{song.artist}</p>
		<p class="song-focus">{$locale === 'es' ? song.focus.es : song.focus.en}</p>
	</div>

	{#if !hasVideo}
		<!-- Coming soon -->
		<div class="coming-soon" use:fadeIn={{ delay: 0.1 }}>
			<Mascot mood={mascotMood} size={100} position="center" />
			<p class="cs-title">{t('songs.comingSoon', $locale)}</p>
			<p class="cs-desc">{t('songs.comingSoonDesc', $locale)}</p>
		</div>
	{:else}
		<!-- Video -->
		<div class="video-wrap" use:fadeUp={{ delay: 0.1, y: 16 }}>
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
		<div class="controls" use:fadeUp={{ delay: 0.15, y: 10 }}>
			<!-- Buttons row -->
			<div class="ctrl-row">
				<button
					class="play-btn"
					onclick={isPlaying ? pause : play}
					disabled={!playerReady}
					aria-label={isPlaying ? 'Pause' : 'Play'}
				>
					<Icon icon={isPlaying ? PauseIcon : PlayIcon} size={20} variant="solid" />
				</button>

				<button class="icon-btn" onclick={replay} disabled={!playerReady} aria-label="Replay">
					<Icon icon={ArrowReloadHorizontalIcon} size={16} />
					<span>{t('songs.replay', $locale)}</span>
				</button>

				<div class="speed-wrap">
					<button class="speed-btn" class:active={speed === 0.75} onclick={() => setSpeed(0.75)}>0.75×</button>
					<button class="speed-btn" class:active={speed === 1} onclick={() => setSpeed(1)}>1×</button>
				</div>
			</div>

			<!-- Progress row -->
			<div class="progress-row">
				<span class="time">{clipElapsed}</span>
				<div class="bar" role="progressbar" aria-valuenow={clipProgress} aria-valuemin={0} aria-valuemax={100}>
					<div class="bar-fill" style="width:{clipProgress}%"></div>
				</div>
				<span class="time">{clipTotal}</span>
			</div>
		</div>

		<!-- Completion toast -->
		{#if showCompletionToast}
			<div class="toast" use:fadeIn={{ delay: 0 }}>
				<span>🎉</span>
				<span>{t('songs.doneBravo', $locale)}</span>
				<button class="toast-x" onclick={() => (showCompletionToast = false)}>✕</button>
			</div>
		{/if}
	{/if}

	<!-- Lyrics -->
	{#if hasLyrics}
		<div class="section" use:fadeUp={{ delay: 0.2, y: 10 }}>
			<div class="section-title">{t('songs.lyrics', $locale)}</div>
			<div class="lyrics-scroll" bind:this={lyricsContainer}>
				<div class="spacer"></div>
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
						class:near={isNear}
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
							<div class="lyric-tl">
								{$locale === 'es' ? line.translation_es : line.translation_en}
							</div>
						{/if}
					</button>
				{/each}
				<div class="spacer"></div>
			</div>
		</div>
	{:else if hasVideo}
		<div class="section" use:fadeIn={{ delay: 0.22 }}>
			<div class="section-title">{t('songs.lyrics', $locale)}</div>
			<p class="muted">{t('songs.noLyrics', $locale)}</p>
		</div>
	{/if}

	<!-- Vocabulary -->
	{#if song.vocab && song.vocab.length > 0}
		<div class="section" use:fadeUp={{ delay: 0.25, y: 10 }}>
			<div class="section-title">{t('songs.vocab', $locale)}</div>
			<div class="vocab-grid">
				{#each song.vocab as word}
					<button class="vocab-card" onclick={() => speakJapanese(word.jp)}>
						<div class="vocab-top">
							<span class="vocab-jp jp">{word.jp}</span>
							<span class="vocab-icon"><Icon icon={VolumeHighIcon} size={13} /></span>
						</div>
						<div class="vocab-kana">{word.kana}</div>
						{#if $showRomaji && word.romaji}
							<div class="vocab-romaji">{word.romaji}</div>
						{/if}
						<div class="vocab-meaning">{$locale === 'es' ? word.es : word.en}</div>
					</button>
				{/each}
			</div>
		</div>
	{/if}

</div>
{/if}

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
	.back:hover { color: var(--fg-primary); }

	/* Hero */
	.hero { margin-bottom: 20px; }

	.hero-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 8px;
	}

	.level-tag {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: #fff;
		padding: 2px 8px;
		border-radius: 6px;
	}

	.diff-dots {
		font-size: 8px;
		letter-spacing: 1.5px;
		color: var(--hinomaru-red);
	}

	.song-title {
		font-size: 38px;
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1.1;
		color: var(--fg-primary);
		margin: 0 0 4px;
	}

	.song-artist {
		font-size: 15px;
		color: var(--fg-secondary);
		margin: 0 0 4px;
	}

	.song-focus {
		font-size: 13px;
		color: var(--fg-tertiary);
		margin: 0;
		line-height: 1.4;
	}

	/* Coming soon */
	.coming-soon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 48px 24px;
		text-align: center;
		border-top: 1px solid var(--ink-100);
		border-bottom: 1px solid var(--ink-100);
		margin-bottom: 24px;
	}
	.cs-title { font-size: 18px; font-weight: 700; margin: 0; color: var(--fg-primary); }
	.cs-desc  { font-size: 14px; color: var(--fg-secondary); margin: 0; line-height: 1.5; max-width: 260px; }

	/* Video */
	.video-wrap { margin-bottom: 16px; }

	.video-ratio {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #0a0a0a;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 24px rgba(0,0,0,0.18);
	}

	.yt-embed {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

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
		background: #0a0a0a;
	}

	.spinner {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid rgba(255,255,255,0.1);
		border-top-color: var(--hinomaru-red);
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	/* Controls — minimal, no card wrapper */
	.controls {
		margin-bottom: 24px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.ctrl-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.play-btn {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--fg-primary);
		color: var(--bg-page);
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: opacity 150ms, transform 120ms;
	}
	.play-btn:disabled { opacity: 0.35; cursor: not-allowed; }
	.play-btn:not(:disabled):hover { opacity: 0.85; }
	.play-btn:not(:disabled):active { transform: scale(0.93); }

	.icon-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 0 14px;
		height: 36px;
		border-radius: 999px;
		border: 1.5px solid var(--ink-200);
		background: transparent;
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-secondary);
		cursor: pointer;
		transition: all 150ms;
		font-family: var(--font-ui);
	}
	.icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
	.icon-btn:not(:disabled):hover { color: var(--fg-primary); border-color: var(--ink-300); }

	.speed-wrap {
		display: flex;
		gap: 4px;
		margin-left: auto;
	}

	.speed-btn {
		padding: 0 11px;
		height: 32px;
		border-radius: 999px;
		border: 1.5px solid var(--ink-200);
		background: transparent;
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		cursor: pointer;
		transition: all 150ms;
		font-family: var(--font-ui);
		letter-spacing: 0.02em;
	}
	.speed-btn.active {
		background: var(--fg-primary);
		border-color: var(--fg-primary);
		color: var(--bg-page);
	}
	.speed-btn:not(.active):hover { color: var(--fg-primary); border-color: var(--ink-300); }

	/* Progress */
	.progress-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.time {
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-tertiary);
		font-variant-numeric: tabular-nums;
		min-width: 36px;
	}

	.bar {
		flex: 1;
		height: 3px;
		background: var(--ink-200);
		border-radius: 99px;
		overflow: hidden;
	}
	.bar-fill {
		height: 100%;
		background: var(--hinomaru-red);
		border-radius: 99px;
		transition: width 100ms linear;
	}

	/* Toast */
	.toast {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 16px;
		border-top: 1px solid var(--ink-100);
		border-bottom: 1px solid var(--ink-100);
		font-size: 14px;
		font-weight: 600;
		color: var(--success);
		margin-bottom: 24px;
	}
	.toast-x {
		margin-left: auto;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--fg-tertiary);
		font-size: 13px;
		padding: 0;
	}

	/* Sections */
	.section { margin-bottom: 32px; }

	.section-title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		margin-bottom: 16px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--ink-100);
	}

	.muted { font-size: 14px; color: var(--fg-tertiary); margin: 0; }

	/* Lyrics — Apple Music style */
	.lyrics-scroll {
		height: 360px;
		overflow-y: scroll;
		overflow-x: hidden;
		scrollbar-width: none;
		-ms-overflow-style: none;
		scroll-behavior: smooth;
		-webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%);
		mask-image: linear-gradient(to bottom, transparent 0%, black 16%, black 84%, transparent 100%);
	}
	.lyrics-scroll::-webkit-scrollbar { display: none; }

	.spacer { height: 120px; flex-shrink: 0; }

	.lyric-line {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: 8px 4px;
		cursor: pointer;
		transition: opacity 350ms cubic-bezier(0.4, 0, 0.2, 1),
		            transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0.22;
		transform: scale(0.88);
		transform-origin: left center;
		will-change: opacity, transform;
		font-family: inherit;
	}
	.lyric-line:hover { opacity: 0.45; }
	.lyric-line.near  { opacity: 0.5;  transform: scale(0.94); }
	.lyric-line.past  { opacity: 0.18; transform: scale(0.86); }
	.lyric-line.active { opacity: 1;   transform: scale(1); }

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

	.lyric-tl {
		font-size: 13px;
		color: var(--fg-secondary);
		margin-top: 5px;
		line-height: 1.4;
		animation: fadeUp 240ms cubic-bezier(0.4, 0, 0.2, 1) both;
	}
	@keyframes fadeUp {
		from { opacity: 0; transform: translateY(4px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* Vocab */
	.vocab-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 8px;
	}

	.vocab-card {
		background: transparent;
		border: 1px solid var(--ink-200);
		border-radius: 12px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		text-align: left;
		cursor: pointer;
		transition: border-color 150ms, background 150ms;
		width: 100%;
		font-family: inherit;
	}
	.vocab-card:hover {
		border-color: var(--hinomaru-red);
		background: var(--ink-100);
	}
	.vocab-card:active { opacity: 0.8; }

	.vocab-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		margin-bottom: 2px;
	}

	.vocab-jp {
		font-size: 20px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1;
	}

	.vocab-icon {
		color: var(--fg-tertiary);
		transition: color 150ms;
		display: flex;
		align-items: center;
	}
	.vocab-card:hover .vocab-icon { color: var(--hinomaru-red); }

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
		margin-top: 3px;
		line-height: 1.3;
	}
</style>
