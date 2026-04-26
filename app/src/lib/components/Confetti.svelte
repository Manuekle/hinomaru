<script lang="ts">
	import confetti from 'canvas-confetti';
	import { onMount } from 'svelte';

	interface Props {
		fireOnMount?: boolean;
		duration?: number;
		colors?: string[];
	}

	let {
		fireOnMount = false,
		duration = 3000,
		colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']
	} = $props<Props>();

	export const fire = () => {
		const end = Date.now() + duration;

		const frame = () => {
			if (Date.now() > end) return;

			confetti({
				particleCount: 2,
				angle: 60,
				spread: 55,
				startVelocity: 60,
				origin: { x: 0, y: 0.5 },
				colors: colors
			});
			confetti({
				particleCount: 2,
				angle: 120,
				spread: 55,
				startVelocity: 60,
				origin: { x: 1, y: 0.5 },
				colors: colors
			});

			requestAnimationFrame(frame);
		};

		frame();
	};

	onMount(() => {
		if (fireOnMount) {
			fire();
		}
	});
</script>
