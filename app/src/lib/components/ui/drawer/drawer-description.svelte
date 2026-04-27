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

<DrawerPrimitive.Description
	class={cn("text-sm text-muted-foreground", className)}
	{...props}
>
	{@render children()}
</DrawerPrimitive.Description>
