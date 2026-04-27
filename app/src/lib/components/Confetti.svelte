<script lang="ts">
	import confetti from 'canvas-confetti';
	import { onMount } from 'svelte';

	interface Props {
		fireOnMount?: boolean;
		duration?: number;
	}

	let { fireOnMount = false, duration = 2500 }: Props = $props();

	// App palette: hinomaru-red, sumi, washi, gold
	const COLORS = ['#BC002D', '#1A1A1A', '#F9F8F6', '#D4A574', '#E8C547'];

	export const fire = () => {
		// Burst 1: from bottom-left
		confetti({
			particleCount: 60,
			angle: 60,
			spread: 65,
			startVelocity: 55,
			decay: 0.88,
			gravity: 1.1,
			origin: { x: 0, y: 1 },
			colors: COLORS,
			scalar: 0.9
		});

		// Burst 2: from bottom-right (slight delay)
		setTimeout(() => {
			confetti({
				particleCount: 60,
				angle: 120,
				spread: 65,
				startVelocity: 55,
				decay: 0.88,
				gravity: 1.1,
				origin: { x: 1, y: 1 },
				colors: COLORS,
				scalar: 0.9
			});
		}, 80);

		// Burst 3: center burst at half duration
		setTimeout(() => {
			confetti({
				particleCount: 40,
				angle: 90,
				spread: 120,
				startVelocity: 45,
				decay: 0.9,
				gravity: 0.9,
				origin: { x: 0.5, y: 0.65 },
				colors: COLORS,
				scalar: 0.8
			});
		}, duration / 2);
	};

	onMount(() => {
		if (fireOnMount) fire();
	});
</script>
