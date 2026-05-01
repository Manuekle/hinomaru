<script lang="ts">
	import { getAudioPlayerContext } from './context';
	import { DropdownMenu } from 'bits-ui';
	import { Settings, Check } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	interface Props {
		className?: string;
		variant?: 'default' | 'outline' | 'ghost' | 'secondary';
		size?: 'default' | 'sm' | 'lg' | 'icon';
	}

	let { 
		className = '', 
		variant = 'ghost', 
		size = 'icon' 
	}: Props = $props();

	const player = getAudioPlayerContext();
	const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

	function setSpeed(s: number) {
		player.playbackRate = s;
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(
			'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
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
		<Settings class="h-4 w-4" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
		{#each speeds as s}
			<DropdownMenu.Item
				onclick={() => setSpeed(s)}
				class="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
			>
				<span>{s === 1 ? 'Normal' : `${s}x`}</span>
				{#if player.playbackRate === s}
					<Check class="ml-auto h-4 w-4" />
				{/if}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
