<script lang="ts">
	let { children } = $props();
</script>

<div class="sticky-footer">
	<div class="footer-content">
		{@render children()}
	</div>
</div>

<style>
	.sticky-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: linear-gradient(
			to top,
			var(--bg-page) 0%,
			var(--bg-page) 70%,
			transparent 100%
		);
		padding: 24px 24px calc(24px + env(safe-area-inset-bottom));
		display: flex;
		justify-content: center;
		pointer-events: none; /* Allow clicks through the gradient area */
	}

	.footer-content {
		width: 100%;
		max-width: 520px;
		display: flex;
		gap: 12px;
		pointer-events: auto; /* Re-enable clicks for the buttons */
	}

	/* Optional: subtle blur for glass effect if preferred */
	/* 
	@supports (backdrop-filter: blur(10px)) {
		.sticky-footer {
			background: color-mix(in srgb, var(--bg-page) 80%, transparent);
			backdrop-filter: blur(12px);
		}
	}
	*/
</style>
