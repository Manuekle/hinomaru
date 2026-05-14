<script lang="ts">
	import { onDestroy } from 'svelte';
	import { extractPalette, type AmbientPalette, type AmbientTriple } from '$lib/utils/ambientColor';

	let { youtubeId, intensity = 0.4 } = $props<{
		youtubeId: string;
		intensity?: number;
	}>();

	let palette = $state<AmbientPalette | null>(null);
	let ready = $state(false);
	let theme = $state<'light' | 'dark'>('light');

	function readTheme(): 'light' | 'dark' {
		if (typeof document === 'undefined') return 'light';
		return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
	}

	let observer: MutationObserver | null = null;
	$effect(() => {
		if (typeof document === 'undefined') return;
		theme = readTheme();
		observer = new MutationObserver(() => (theme = readTheme()));
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
		return () => observer?.disconnect();
	});

	$effect(() => {
		if (!youtubeId) return;
		palette = null;
		ready = false;
		extractPalette(youtubeId).then((p) => {
			if (!p) return;
			palette = p;
			requestAnimationFrame(() => (ready = true));
		});
	});

	const active = $derived<AmbientTriple | null>(palette ? palette[theme] : null);

	onDestroy(() => observer?.disconnect());
</script>

{#if active}
	<div
		class="ambient"
		class:ready
		class:dark={theme === 'dark'}
		style="
			--c1: {active.primary};
			--c2: {active.secondary};
			--c3: {active.accent};
			--alpha: {intensity};
		"
		aria-hidden="true"
	>
		<div class="veil"></div>
		<div class="blob b1"></div>
		<div class="blob b2"></div>
		<div class="blob b3"></div>
	</div>
{/if}

<style>
	.ambient {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		opacity: 0;
		overflow: hidden;
		transition: opacity 1200ms ease;
		filter: blur(110px) saturate(1.35);
		contain: strict;
	}
	.ambient.ready {
		opacity: var(--alpha);
	}
	.veil {
		position: absolute;
		inset: 0;
		background: rgba(247, 245, 242, 0.6);
		z-index: 1;
	}
	.ambient.dark .veil {
		background: rgba(18, 18, 18, 0.5);
	}
	.blob {
		position: absolute;
		border-radius: 50%;
		will-change: transform;
		z-index: 0;
	}
	.ambient.dark .blob {
		mix-blend-mode: screen;
	}
	.ambient:not(.dark) .blob {
		mix-blend-mode: soft-light;
		opacity: 1;
	}
	.b1 {
		top: -20%;
		left: -20%;
		width: 90%;
		height: 70%;
		background: radial-gradient(circle, var(--c1) 0%, transparent 70%);
		animation: drift1 18s ease-in-out infinite;
	}
	.b2 {
		top: 10%;
		right: -25%;
		width: 95%;
		height: 75%;
		background: radial-gradient(circle, var(--c2) 0%, transparent 70%);
		animation: drift2 24s ease-in-out infinite;
	}
	.b3 {
		bottom: -25%;
		left: 10%;
		width: 100%;
		height: 80%;
		background: radial-gradient(circle, var(--c3) 0%, transparent 70%);
		animation: drift3 30s ease-in-out infinite;
	}
	@keyframes drift1 {
		0%, 100% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(15%, 10%) scale(1.15); }
	}
	@keyframes drift2 {
		0%, 100% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(-12%, 15%) scale(1.12); }
	}
	@keyframes drift3 {
		0%, 100% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(8%, -12%) scale(1.18); }
	}
	@media (prefers-reduced-motion: reduce) {
		.blob { animation: none; }
	}
</style>
