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

<div class={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props}>
	{@render children()}
</div>
