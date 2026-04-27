<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { cn } from "$lib/utils";

	let {
		class: className = undefined,
		...props
	} = $props();
</script>

<DrawerPrimitive.Overlay
	class={cn("fixed inset-0 z-50 bg-black/80", className)}
	{...props}
/>
