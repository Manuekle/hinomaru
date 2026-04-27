<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import type { Snippet } from "svelte";

	let {
		open = $bindable(false),
		shouldScaleBackground = true,
		children,
		...props
	} = $props();
</script>

<DrawerPrimitive.Root bind:open {shouldScaleBackground} {...props}>
	{@render children()}
</DrawerPrimitive.Root>
