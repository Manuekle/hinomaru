export function playCorrect() {
	const audio = new Audio('/sounds/correct.mp3');
	audio.volume = 0.5;
	audio.play().catch(() => {
		/* ignore */
	});
}

export function playWrong() {
	const audio = new Audio('/sounds/wrong.mp3');
	audio.volume = 0.5;
	audio.play().catch(() => {
		/* ignore */
	});
}

export function playFinish() {
	const audio = new Audio('/sounds/finish.mp3');
	audio.volume = 0.6;
	audio.play().catch(() => {
		/* ignore */
	});
}
