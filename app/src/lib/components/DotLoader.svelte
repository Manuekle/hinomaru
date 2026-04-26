<script lang="ts">
	let { size = 6, color = 'currentColor' } = $props<{ size?: number; color?: string }>();
</script>

<span class="dot-loader" style="--sz: {size}px; --c: {color};">
	<span class="dot"></span>
	<span class="dot"></span>
	<span class="dot"></span>
</span>

<style>
	.dot-loader {
		display: inline-flex;
		align-items: center;
		gap: calc(var(--sz) * 0.75);
	}
	.dot {
		width: var(--sz);
		height: var(--sz);
		border-radius: 50%;
		background: var(--c);
		animation: db 1.2s infinite ease-in-out;
	}
	.dot:nth-child(2) {
		animation-delay: 0.18s;
	}
	.dot:nth-child(3) {
		animation-delay: 0.36s;
	}
	@keyframes db {
		0%,
		80%,
		100% {
			transform: scale(0.5);
			opacity: 0.35;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
