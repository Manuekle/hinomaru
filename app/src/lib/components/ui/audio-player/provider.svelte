<script lang="ts">
	import { setAudioPlayerContext, type AudioPlayerItem, type AudioPlayerState } from './context';
	import { onMount, type Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		/** Playlist for auto-advance. When current track ends, moves to next. */
		items?: AudioPlayerItem[];
		/** Bindable index into items[] — updated when auto-advancing. */
		currentIndex?: number;
		onCurrentIndexChange?: (idx: number) => void;
	}

	let { children, items = [], currentIndex = $bindable(0), onCurrentIndexChange }: Props = $props();

	// State
	let activeItem = $state<AudioPlayerItem | null>(null);
	let isPlaying = $state(false);
	let isBuffering = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let playbackRate = $state(1);
	let error = $state<string | null>(null);

	let audioEl = $state<HTMLAudioElement | null>(null);

	const playerState: AudioPlayerState = {
		get activeItem() { return activeItem; },
		set activeItem(val) { activeItem = val; },
		get isPlaying() { return isPlaying; },
		set isPlaying(val) { isPlaying = val; },
		get isBuffering() { return isBuffering; },
		set isBuffering(val) { isBuffering = val; },
		get currentTime() { return currentTime; },
		set currentTime(val) { currentTime = val; if (audioEl) audioEl.currentTime = val; },
		get duration() { return duration; },
		set duration(val) { duration = val; },
		get playbackRate() { return playbackRate; },
		set playbackRate(val) { playbackRate = val; if (audioEl) audioEl.playbackRate = val; },
		get error() { return error; },
		set error(val) { error = val; }
	};

	setAudioPlayerContext(playerState);

	// When currentIndex changes (externally or via auto-advance), load that track
	$effect(() => {
		const track = items[currentIndex];
		if (track && activeItem?.id !== track.id) {
			activeItem = track;
		}
	});

	function handleTimeUpdate() {
		if (audioEl) currentTime = audioEl.currentTime;
	}

	function handleDurationChange() {
		if (audioEl) duration = audioEl.duration;
	}

	function handlePlay() { isPlaying = true; }
	function handlePause() { isPlaying = false; }
	function handleWaiting() { isBuffering = true; }
	function handlePlaying() { isBuffering = false; }

	function handleError() {
		error = audioEl?.error?.message || 'Unknown error';
		isBuffering = false;
	}

	$effect(() => {
		if (audioEl && activeItem) {
			const currentSrc = audioEl.getAttribute('src');
			if (currentSrc !== activeItem.src) {
				audioEl.src = activeItem.src;
				audioEl.load();
				if (isPlaying) {
					audioEl.play().catch(e => console.error('Play error:', e));
				}
			}
		}
	});

	$effect(() => {
		if (audioEl) {
			if (isPlaying && audioEl.paused) {
				audioEl.play().catch(e => {
					console.error('Playback error:', e);
					isPlaying = false;
				});
			} else if (!isPlaying && !audioEl.paused) {
				audioEl.pause();
			}
		}
	});

	onMount(() => {
		if (audioEl) playbackRate = audioEl.playbackRate;
	});

	function handleEnded() {
		isPlaying = false;
		currentTime = 0;
		// Auto-advance to next track in playlist
		if (items.length > 0 && currentIndex < items.length - 1) {
			const next = currentIndex + 1;
			currentIndex = next;
			onCurrentIndexChange?.(next);
			// Small delay so UI updates before playback starts
			setTimeout(() => { isPlaying = true; }, 100);
		}
	}
</script>

<audio
	bind:this={audioEl}
	ontimeupdate={handleTimeUpdate}
	ondurationchange={handleDurationChange}
	onplay={handlePlay}
	onpause={handlePause}
	onwaiting={handleWaiting}
	onplaying={handlePlaying}
	onerror={handleError}
	onended={handleEnded}
	class="hidden"
></audio>

{@render children?.()}
