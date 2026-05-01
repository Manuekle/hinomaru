<script lang="ts">
	import { getAudioPlayerContext } from './context';
	import { cn } from '$lib/utils';

	interface Props {
		className?: string;
	}

	let { className = '' }: Props = $props();

	const state = getAudioPlayerContext();

	function formatTime(seconds: number) {
		if (isNaN(seconds) || seconds === Infinity) return '--:--';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<span class={cn('text-sm tabular-nums text-muted-foreground', className)}>
	{formatTime(state.duration)}
</span>
