import { base } from '$app/paths';
import { browser } from '$app/environment';

// Preloaded base elements — cloneNode() copies loaded data without re-downloading
let correctAudio: HTMLAudioElement | null = null;
let wrongAudio: HTMLAudioElement | null = null;
let finishAudio: HTMLAudioElement | null = null;

if (browser) {
	correctAudio = new Audio(`${base}/sounds/correct.mp3`);
	correctAudio.volume = 0.5;

	wrongAudio = new Audio(`${base}/sounds/wrong.mp3`);
	wrongAudio.volume = 0.5;

	finishAudio = new Audio(`${base}/sounds/finish.mp3`);
	finishAudio.volume = 0.6;
}

function playClone(source: HTMLAudioElement | null) {
	if (!source) return;
	const clone = source.cloneNode() as HTMLAudioElement;
	clone.play().catch(() => {});
}

export function playCorrect() {
	playClone(correctAudio);
}

export function playWrong() {
	playClone(wrongAudio);
}

export function playFinish() {
	playClone(finishAudio);
}
