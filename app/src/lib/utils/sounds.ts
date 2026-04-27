import { base } from '$app/paths';
import { browser } from '$app/environment';

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

export function playCorrect() {
	if (!correctAudio) return;
	correctAudio.currentTime = 0;
	correctAudio.play().catch((err) => {
		console.error('Error playing correct sound:', err);
	});
}

export function playWrong() {
	if (!wrongAudio) return;
	wrongAudio.currentTime = 0;
	wrongAudio.play().catch((err) => {
		console.error('Error playing wrong sound:', err);
	});
}

export function playFinish() {
	if (!finishAudio) return;
	finishAudio.currentTime = 0;
	finishAudio.play().catch((err) => {
		console.error('Error playing finish sound:', err);
	});
}
