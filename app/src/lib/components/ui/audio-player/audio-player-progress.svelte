<script lang="ts">
	import { getAudioPlayerContext } from './context';
	import { Slider } from 'bits-ui';
	import { cn } from '$lib/utils';

	interface Props {
		className?: string;
	}

	let { className = '' }: Props = $props();

	const player = getAudioPlayerContext();

	let value = $state([0]);

	// Sync state to local value when playing
	$effect(() => {
		if (!isDragging) {
			value = [player.currentTime];
		}
	});

	let isDragging = false;

	function handleValueChange(v: number[]) {
		value = v;
		if (isDragging) {
			player.currentTime = v[0];
		}
	}
</script>

<Slider.Root
	value={value}
	onValueChange={handleValueChange}
	onPointerDown={() => (isDragging = true)}
	onPointerUp={() => (isDragging = false)}
	max={player.duration || 100}
	step={0.1}
	class={cn("relative flex w-full touch-none select-none items-center", className)}
>
	<Slider.Track class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
		<Slider.Range class="absolute h-full bg-primary" />
	</Slider.Track>
	<Slider.Thumb
		class="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
	/>
</Slider.Root>
