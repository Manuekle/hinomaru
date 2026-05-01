<script lang="ts">
	import { getAudioPlayerContext, type AudioPlayerItem } from './context';
	import { Play, Pause, Loader2 } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	interface Props {
		item?: AudioPlayerItem;
		className?: string;
		variant?: 'default' | 'outline' | 'ghost' | 'secondary';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		disabled?: boolean;
	}

	let { 
		item, 
		className = '', 
		variant = 'default', 
		size = 'default',
		disabled = false
	}: Props = $props();

	const player = getAudioPlayerContext();

	const isActive = $derived(item ? player.activeItem?.id === item.id : true);
	const isPlayingThis = $derived(isActive && player.isPlaying);
	const isBufferingThis = $derived(isActive && player.isBuffering);

	function togglePlay() {
		if (item && player.activeItem?.id !== item.id) {
			player.activeItem = item;
			player.isPlaying = true;
		} else {
			player.isPlaying = !player.isPlaying;
		}
	}

	// Simple button implementation since we might not have the shadcn button yet (though the CLI said it created it)
	// Actually, I'll use a basic button with tailwind classes to be safe, or try to use the UI button if it exists.
</script>

<button
	type="button"
	onclick={togglePlay}
	disabled={disabled || (item === undefined && !player.activeItem)}
	class={cn(
		'relative inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
		variant === 'default' && 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
		variant === 'outline' && 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
		variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
		variant === 'secondary' && 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
		size === 'default' && 'h-9 px-4 py-2',
		size === 'sm' && 'h-8 rounded-md px-3 text-xs',
		size === 'lg' && 'h-10 rounded-md px-8',
		size === 'icon' && 'h-9 w-9',
		className
	)}
>
	{#if isBufferingThis}
		<Loader2 class="h-4 w-4 animate-spin" />
	{:else if isPlayingThis}
		<Pause class="h-4 w-4" />
	{:else}
		<Play class="h-4 w-4 fill-current" />
	{/if}
</button>
