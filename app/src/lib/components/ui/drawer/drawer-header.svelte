<script lang="ts">
	import { cn } from "$lib/utils";
	import type { HTMLAttributes } from "svelte/elements";
	import type { Snippet } from "svelte";

	type Props = HTMLAttributes<HTMLDivElement> & {
		children: Snippet;
	};

	let {
		class: className = undefined,
		children,
		...props
	}: Props = $props();
</script>

<div class={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props}>
	{@render children()}
</div>
