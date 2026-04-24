<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';

	let { onNext } = $props();

	let container = $state<HTMLDivElement | null>(null);
	let cardEl = $state<HTMLDivElement | null>(null);
	let writer: any = null; // Removed $state to prevent Proxy issues with HanziWriter
	let completed = $state(false);
	let loading = $state(true);
	let loadError = $state(false);

	onMount(async () => {
		const hwModule = await import('hanzi-writer');
		const HanziWriter = hwModule.default || hwModule;
		
		if (!container) return;
		await tick(); // Ensure DOM and styles are fully applied

		// Ensure we don't pass negative dimensions if layout hasn't painted yet
		let w = cardEl?.clientWidth || 320;
		if (w === 0) w = 320; // fallback if display is not ready
		const cardSize = Math.max(200, Math.min(w - 60, 280));

		const char = '山';
		try {
			const res = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp@0.1.8/${encodeURIComponent(char)}.json`);
			if (!res.ok) throw new Error('Failed to load stroke data');
			const data = await res.json();

			writer = HanziWriter.create(container, char, {
				width: cardSize,
				height: cardSize,
				padding: Math.round(cardSize * 0.1),
				strokeColor: '#BC002D',
				highlightColor: '#FF6B6B',
				drawingColor: '#1a1a1a',
				showOutline: true,
				outlineColor: 'rgba(0,0,0,0.08)',
				drawingWidth: Math.round(cardSize * 0.07),
				charDataLoader: () => Promise.resolve(data)
			});

			loading = false;

			// Wait a bit to ensure SVG is painted and not hidden before attaching quiz events
			setTimeout(() => {
				if (writer) {
					writer.quiz({
						onComplete: () => {
							completed = true;
						}
					});
				}
			}, 100);
		} catch (err) {
			console.error('HanziWriter error:', err);
			loading = false;
			loadError = true;
			// Let user continue if stroke data fails to load
			completed = true;
		}
	});

	function handleContinue() {
		if (completed) onNext();
	}

	function skipStep() {
		onNext();
	}
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.practice.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.practice.subtitle', $locale)}</p>
	</header>

	<div class="canvas-wrapper" use:fadeUp={{ delay: 0.1, y: 20 }}>
		<div class="canvas-card" bind:this={cardEl}>
			<div class="meta">{t('onboarding.practice.strokes', $locale, { n: 3 })}</div>
			<div class="grid-overlay">
				<div class="line h"></div>
				<div class="line v"></div>
				<div class="line d1"></div>
				<div class="line d2"></div>
			</div>
			
			{#if loading}
				<div class="loading-state">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
						<path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
					</svg>
				</div>
			{/if}

			{#if loadError}
				<div class="error-state jp" style="font-size: 80px; color: var(--fg-tertiary);">山</div>
			{/if}
			
			<div bind:this={container} class="writer-container" style={loadError ? 'display:none;' : ''}></div>
			<div class="meaning">{t('onboarding.practice.mountain', $locale)}</div>
		</div>
	</div>

	<footer class="footer" use:fadeUp={{ delay: 0.3, y: 10 }}>
		{#if !completed}
			<div style="text-align:center;margin-bottom:12px;">
				<button
					class="hm-btn hm-btn-ghost"
					style="font-size:13px;color:var(--fg-tertiary);height:36px;"
					onclick={skipStep}
				>
					{t('onboarding.continue', $locale)} →
				</button>
			</div>
		{/if}
		<button 
			class="hm-btn hm-btn-full hm-btn-lg"
			class:hm-btn-dark={completed}
			class:btn-muted={!completed}
			disabled={!completed}
			onclick={handleContinue}
		>
			{completed ? t('onboarding.continue', $locale) : t('session.finishDrawing', $locale)}
		</button>
	</footer>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 32px 24px 24px;
	}

	.header {
		text-align: center;
		margin-bottom: 24px;
	}

	.title {
		font-size: clamp(24px, 6vw, 32px);
		font-weight: 800;
		letter-spacing: -0.04em;
		margin: 0 0 8px;
	}

	.subtitle {
		font-size: 16px;
		color: var(--fg-secondary);
		margin: 0;
	}

	.canvas-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
	}

	.canvas-card {
		width: min(100%, 320px);
		aspect-ratio: 1;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 32px;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-md);
		overflow: hidden;
	}

	.meta {
		position: absolute;
		top: 16px;
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 600;
	}

	.meaning {
		position: absolute;
		bottom: 20px;
		font-size: 16px;
		font-weight: 600;
		color: var(--fg-primary);
	}

	.writer-container {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 5;
		touch-action: none;
		cursor: crosshair;
	}

	.writer-container :global(svg) {
		pointer-events: auto;
		touch-action: none;
	}

	.writer-container.hidden {
		visibility: hidden;
	}

	.loading-state {
		position: absolute;
		font-size: 14px;
		color: var(--fg-tertiary);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.error-state {
		position: absolute;
		opacity: 0.15;
	}

	.grid-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0.4;
	}

	.line {
		position: absolute;
		background: var(--ink-200);
	}

	.line.h { top: 50%; left: 0; right: 0; height: 1px; border-top: 1px dashed var(--ink-300); background: none; }
	.line.v { left: 50%; top: 0; bottom: 0; width: 1px; border-left: 1px dashed var(--ink-300); background: none; }
	.line.d1 { top: 50%; left: 50%; width: 142%; height: 1px; border-top: 1px dashed var(--ink-200); background: none; transform: translate(-50%, -50%) rotate(45deg); }
	.line.d2 { top: 50%; left: 50%; width: 142%; height: 1px; border-top: 1px dashed var(--ink-200); background: none; transform: translate(-50%, -50%) rotate(-45deg); }

	.btn-muted {
		background: var(--ink-100);
		color: var(--fg-tertiary);
		cursor: not-allowed;
	}

	.footer {
		margin-top: 16px;
		padding-bottom: env(safe-area-inset-bottom);
	}

	@keyframes spin {
		100% { transform: rotate(360deg); }
	}
</style>
