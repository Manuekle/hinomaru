<script lang="ts">
	import { PinInput as InputOTPPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		cell,
		class: className,
		...restProps
	}: InputOTPPrimitive.CellProps = $props();
</script>

<InputOTPPrimitive.Cell
	{cell}
	bind:ref
	data-slot="input-otp-slot"
	class={cn(
		"relative flex h-14 w-10 items-center justify-center text-3xl font-medium transition-all text-fg-primary outline-none",
		className
	)}
	{...restProps}
>
	{#if cell.char}
		{cell.char}
	{:else}
		<span class="opacity-20">−</span>
	{/if}

	{#if cell.hasFakeCaret}
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<div class="h-8 w-[2px] animate-caret-blink bg-hinomaru-red duration-1000"></div>
		</div>
	{/if}
</InputOTPPrimitive.Cell>
