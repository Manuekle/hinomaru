<script lang="ts">
	import confetti from 'canvas-confetti';
	import { onMount } from 'svelte';

	interface Props {
		fireOnMount?: boolean;
		duration?: number;
	}

	let { fireOnMount = false, duration = 5000 }: Props = $props();

	let interval: number;

	export const fire = () => {
		const animationEnd = Date.now() + duration;
		const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

		const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

		if (interval) clearInterval(interval);

		interval = window.setInterval(() => {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(interval);
			}

			const particleCount = 50 * (timeLeft / duration);
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
			});
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
			});
		}, 250);
	};

	onMount(() => {
		if (fireOnMount) fire();
		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>
