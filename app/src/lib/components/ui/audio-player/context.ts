import { setContext, getContext } from 'svelte';

export interface AudioPlayerItem<TData = any> {
	id: string | number;
	src: string;
	name?: string;
	data?: TData;
}

export interface AudioPlayerState<TData = any> {
	activeItem: AudioPlayerItem<TData> | null;
	isPlaying: boolean;
	isBuffering: boolean;
	currentTime: number;
	duration: number;
	playbackRate: number;
	error: string | null;
}

const AUDIO_PLAYER_CONTEXT = Symbol('AUDIO_PLAYER');

export function setAudioPlayerContext<TData>(state: AudioPlayerState<TData>) {
	return setContext(AUDIO_PLAYER_CONTEXT, state);
}

export function getAudioPlayerContext<TData>(): AudioPlayerState<TData> {
	const context = getContext<AudioPlayerState<TData>>(AUDIO_PLAYER_CONTEXT);
	if (!context) {
		throw new Error('AudioPlayer context not found. Ensure you are using AudioPlayerProvider.');
	}
	return context;
}
