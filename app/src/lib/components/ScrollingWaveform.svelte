<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let {
		height = 80,
		barWidth = 3,
		barGap = 2,
		speed = 6,
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
	let lastTime = 0;
	let offset = 0;

	const STEP = $derived(barWidth + barGap);

	function getAmplitude(i: number) {
		const v =
			Math.sin(i * 0.18) * 0.38 +
			Math.sin(i * 0.07) * 0.28 +
			Math.sin(i * 0.41) * 0.18 +
			Math.sin(i * 0.9) * 0.09 +
			0.5;
		return Math.max(0.06, Math.min(1, v));
	}

	function draw(ts: number) {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const w = canvas.width / dpr;
		const h = canvas.height / dpr;

		if (lastTime === 0) lastTime = ts;
		const dt = ts - lastTime;
		lastTime = ts;

		if (playing) {
			offset += (speed * dt) / 1000;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const startBar = Math.floor(offset);
		const subOffset = (offset - startBar) * STEP;
		const count = Math.ceil(w / STEP) + 1;

		ctx.save();
		ctx.scale(dpr, dpr);
		ctx.fillStyle = barColor.startsWith('var(')
			? getComputedStyle(canvas).getPropertyValue(barColor.slice(4, -1).split(',')[0].trim()).trim() || '#bc002d'
			: barColor;

		for (let i = 0; i < count + 1; i++) {
			const barIdx = startBar + i;
			const amplitude = getAmplitude(barIdx);
			const barH = Math.max(4, amplitude * h);
			const x = i * STEP - subOffset;
			const y = (h - barH) / 2;

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

		ctx.restore();
		raf = requestAnimationFrame(draw);
	}

	function resize() {
		if (!canvas) return;
		const parent = canvas.parentElement;
		if (!parent) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = parent.getBoundingClientRect();
		const newW = Math.floor(rect.width * dpr);
		const newH = Math.floor(height * dpr);

		if (canvas.width !== newW || canvas.height !== newH) {
			canvas.width = newW;
			canvas.height = newH;
		}
	}

	onMount(() => {
		resize();
		raf = requestAnimationFrame(draw);
		const ro = new ResizeObserver(() => {
			resize();
		});
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
