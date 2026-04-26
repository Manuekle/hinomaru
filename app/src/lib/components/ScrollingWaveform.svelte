<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let {
		height = 80,
		barWidth = 3,
		barGap = 2,
		speed = 30,
		fadeEdges = true,
		barColor = 'currentColor',
		playing = false
	} = $props<{
		height?: number;
		barWidth?: number;
		barGap?: number;
		speed?: number;
		fadeEdges?: boolean;
		barColor?: string;
		playing?: boolean;
	}>();

	let canvas: HTMLCanvasElement;
	let raf: number;
	let offset = 0;
	let bars: number[] = [];

	const STEP = barWidth + barGap;

	function generateBars(count: number) {
		// Smooth noise via multiple sine waves
		const newBars: number[] = [];
		for (let i = 0; i < count; i++) {
			const v =
				Math.sin(i * 0.18) * 0.38 +
				Math.sin(i * 0.07) * 0.28 +
				Math.sin(i * 0.41) * 0.18 +
				Math.sin(i * 0.9) * 0.09 +
				0.5;
			newBars.push(Math.max(0.06, Math.min(1, v)));
		}
		return newBars;
	}

	function draw(ts: number) {
		if (!canvas) return;
		const ctx = canvas.getContext('2d')!;
		const w = canvas.width;
		const h = canvas.height;

		ctx.clearRect(0, 0, w, h);

		const count = Math.ceil(w / STEP) + 2;
		if (bars.length < count + 10) bars = generateBars(count + 60);

		// Advance offset only when playing
		if (playing) offset += speed / 1000;

		const startBar = Math.floor(offset);
		const subOffset = (offset - startBar) * STEP;

		ctx.fillStyle = barColor;

		for (let i = 0; i < count + 1; i++) {
			const barIdx = (startBar + i) % bars.length;
			const amplitude = bars[barIdx];
			const barH = Math.max(4, amplitude * h);
			const x = i * STEP - subOffset;
			const y = (h - barH) / 2;

			// Edge fade opacity
			let alpha = 1;
			if (fadeEdges) {
				const edgeFade = 0.18;
				const rel = x / w;
				if (rel < edgeFade) alpha = rel / edgeFade;
				else if (rel > 1 - edgeFade) alpha = (1 - rel) / edgeFade;
				alpha = Math.max(0, Math.min(1, alpha));
			}

			ctx.globalAlpha = alpha * (playing ? 1 : 0.45);
			ctx.beginPath();
			ctx.roundRect(x, y, barWidth, barH, barWidth / 2);
			ctx.fill();
		}

		ctx.globalAlpha = 1;
		raf = requestAnimationFrame(draw);
	}

	function resize() {
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;
		canvas.width = parent.clientWidth;
		canvas.height = height;
		bars = generateBars(Math.ceil(canvas.width / STEP) + 60);
	}

	onMount(() => {
		resize();
		raf = requestAnimationFrame(draw);
		const ro = new ResizeObserver(resize);
		ro.observe(canvas.parentElement!);
		return () => {
			ro.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	});
</script>

<canvas
	bind:this={canvas}
	style="width:100%;height:{height}px;display:block;"
></canvas>
