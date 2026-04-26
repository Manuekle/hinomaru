<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';

	let {
		icon,
		altIcon = null,
		showAlt = false,
		size = 16,
		color = 'currentColor',
		strokeWidth = 1.5,
		...rest
	} = $props();
</script>

<HugeiconsIcon {icon} {altIcon} {showAlt} {size} {color} {strokeWidth} {...rest} />
