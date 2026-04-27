<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	let {
		class: className = undefined,
		children,
		...props
	} = $props();
</script>

<DrawerPrimitive.Title
	class={cn("text-lg font-semibold leading-none tracking-tight", className)}
	{...props}
>
	{@render children()}
</DrawerPrimitive.Title>
