<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let {
		getLevel = () => 0,
		armed = false,
		size = 48
	} = $props<{
		getLevel?: () => number;
		armed?: boolean;
		size?: number;
	}>();

	let wrapEl: HTMLDivElement | undefined;
	let raf = 0;
	let smooth = 0;

	function tick() {
		const l = Math.min(1, Math.max(0, getLevel()));
		smooth = smooth * 0.7 + l * 0.3;
		if (wrapEl) {
			wrapEl.style.setProperty('--lvl', smooth.toFixed(3));
		}
		raf = requestAnimationFrame(tick);
	}

	onMount(() => {
		raf = requestAnimationFrame(tick);
	});

	onDestroy(() => {
		if (raf) cancelAnimationFrame(raf);
	});
</script>

<div
	class="orb-wrap"
	bind:this={wrapEl}
	style="width:{size}px;height:{size}px;--lvl:0;"
>
	{#if armed}
		<span class="ring ring-1"></span>
	{/if}

	<div class="orb" class:armed>
		<svg viewBox="0 0 24 24" width={size * 0.42} height={size * 0.42} aria-hidden="true">
			<path
				d="M12 2a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Zm6 10a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93V22h2v-2.07A8 8 0 0 0 20 12h-2Z"
				fill="currentColor"
			/>
		</svg>
	</div>
</div>

<style>
	.orb-wrap {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		--lvl: 0;
	}

	.orb {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: radial-gradient(circle at 30% 30%, #ff3b5c 0%, var(--hinomaru-red) 60%, #7a0019 100%);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: scale(calc(1 + var(--lvl) * 0.18));
		opacity: calc(0.7 + var(--lvl) * 0.3);
		box-shadow:
			0 0 calc(4px + var(--lvl) * 18px) rgba(188, 0, 45, calc(0.35 + var(--lvl) * 0.3));
		will-change: transform, opacity;
	}
	.orb:not(.armed) {
		background: radial-gradient(circle at 30% 30%, #666 0%, #333 60%, #1a1a1a 100%);
		opacity: 0.55;
		box-shadow: none;
		transform: none;
	}

	.ring {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 1px solid rgba(188, 0, 45, 0.4);
		transform: translate(-50%, -50%) scale(1);
		pointer-events: none;
	}
	.ring-1 { animation: ringPulse 2.6s ease-out infinite; }

	@keyframes ringPulse {
		0% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.9); }
		70% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
		100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
	}

	@media (prefers-reduced-motion: reduce) {
		.ring-1 { animation: none; opacity: 0; }
		.orb { transition: none; }
	}
</style>
