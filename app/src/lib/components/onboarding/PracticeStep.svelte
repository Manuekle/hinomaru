<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { CleanIcon } from '@hugeicons/core-free-icons';
	import DotLoader from '$lib/components/DotLoader.svelte';

	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { speakJapanese } from '$lib/utils/tts';

	let { onNext, onBack } = $props();

	let hanziContainer = $state<HTMLDivElement | null>(null);

	// Plain vars — NOT $state, to avoid Svelte 5 Proxy wrapping HanziWriter internals
	let writer: any = null;
	let setupIteration = 0;

	let completed = $state(false);
	let loadingWriters = $state(true);

	// 日 = "hi" (sun)
	const char = '日';

	$effect(() => {
		if (hanziContainer) {
			setupWriters();
		}
	});

	async function setupWriters() {
		const iteration = ++setupIteration;
		loadingWriters = true;
		writer = null;

		if (hanziContainer) hanziContainer.innerHTML = '';

		let HanziWriter: any;
		try {
			const mod = await import('hanzi-writer');
			HanziWriter = mod.default ?? mod;
		} catch {
			completed = true;
			loadingWriters = false;
			return;
		}

		if (iteration !== setupIteration || !hanziContainer) return;

		// Use the container's actual rendered width
		await new Promise((r) => requestAnimationFrame(r));
		if (iteration !== setupIteration || !hanziContainer) return;

		const containerW = hanziContainer.clientWidth || 280;
		const boxSize = Math.min(containerW, 280);

		let charData: any = null;
		try {
			const res = await fetch(
				`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(char)}.json`
			);
			if (res.ok) charData = await res.json();
		} catch {
			/* fallback: let it render without outline */
		}

		if (iteration !== setupIteration || !hanziContainer) return;

		const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

		// Inject the box exactly like deck/[id]/write does
		const box = document.createElement('div');
		box.style.cssText = [
			`width:${boxSize}px`,
			`height:${boxSize}px`,
			'position:relative',
			'display:flex',
			'align-items:center',
			'justify-content:center',
			`font-size:${boxSize * 0.6}px`,
			'color:var(--sumi)',
			'background:var(--ink-100)',
			'border:2px dashed var(--ink-200)',
			'border-radius:16px',
			'overflow:hidden',
			'cursor:crosshair'
		].join(';');

		// Grid lines
		const hLine = document.createElement('div');
		hLine.style.cssText =
			'position:absolute;top:50%;left:0;right:0;height:1px;background:var(--ink-300);pointer-events:none;';
		const vLine = document.createElement('div');
		vLine.style.cssText =
			'position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--ink-300);pointer-events:none;';
		box.appendChild(hLine);
		box.appendChild(vLine);

		if (charData) {
			const writerEl = document.createElement('div');
			writerEl.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;';
			box.appendChild(writerEl);

			writer = HanziWriter.create(writerEl, char, {
				width: boxSize,
				height: boxSize,
				padding: boxSize * 0.12,
				strokeColor: isDark ? '#ff6b8b' : '#BC002D', // Use red-ink color in dark mode for better visibility
				highlightColor: '#FF6B6B',
				drawingColor: isDark ? '#f2f2f1' : '#1A1A1A', // Match --sumi
				showOutline: true,
				outlineColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)',
				drawingWidth: boxSize * 0.07,
				charDataLoader: () => Promise.resolve(charData)
			});

			// Mark active with red border, start quiz
			box.style.borderColor = 'var(--hinomaru-red)';
			writer.quiz({
				onComplete: () => {
					box.style.borderColor = 'var(--success)';
					completed = true;
					speakJapanese(char);
				}
			});
		} else {
			// Fallback: show static character
			const span = document.createElement('span');
			span.textContent = char;
			span.className = 'jp';
			span.style.zIndex = '1';
			box.appendChild(span);
			completed = true;
		}

		hanziContainer.appendChild(box);
		loadingWriters = false;
	}

	function clearCanvas() {
		if (!writer) return;
		writer.cancelQuiz();
		const box = hanziContainer?.querySelector('div') as HTMLDivElement | null;
		if (box) box.style.borderColor = 'var(--hinomaru-red)';
		writer.quiz({
			onComplete: () => {
				if (box) box.style.borderColor = 'var(--success)';
				completed = true;
				speakJapanese(char);
			}
		});
	}
</script>

<div class="step-content">
	<!-- Header -->
	<header class="header">
		<h1 class="title">{t('onboarding.practice.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.practice.subtitle', $locale)}</p>
	</header>

	<!-- Canvas area -->
	<div class="canvas-area">
		<!-- Character hint above the box -->
		<div class="char-hint">
			<span class="char-name">{t('onboarding.practice.sun', $locale)}</span>
			<span class="char-romaji">hi • ひ</span>
		</div>

		<!-- The writing card — matches write page visual -->
		<div class="writing-card">
			<!-- Controls -->
			<div class="card-controls">
				<button class="clear-btn" onclick={clearCanvas} aria-label="Clear strokes">
					<Icon icon={CleanIcon} size={14} strokeWidth={2.5} />
				</button>
			</div>

			{#if loadingWriters}
				<div class="loading-state">
					<DotLoader size={7} />
				</div>
			{/if}

			<!-- HanziWriter canvas injected here -->
			<div bind:this={hanziContainer} class="hanzi-host"></div>
		</div>

		{#if !loadingWriters && !completed}
			<p class="tip">{t('onboarding.practice.tip', $locale)}</p>
		{/if}
	</div>

	<!-- Footer -->
	<StickyFooter {onBack}>
		<button
			class="hm-btn hm-btn-lg"
			style="flex: 1"
			class:hm-btn-dark={completed}
			class:btn-muted={!completed}
			onclick={() => onNext()}
		>
			{t('onboarding.continue', $locale)}
		</button>
	</StickyFooter>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 24px 24px 0;
		/* Ensure ALL touch goes to HanziWriter, not browser scroll */
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.header {
		text-align: center;
		margin-bottom: 20px;
		flex-shrink: 0;
	}

	.title {
		font-size: clamp(22px, 5.5vw, 30px);
		font-weight: 600;
		letter-spacing: -0.04em;
		margin: 0 0 6px;
		color: var(--sumi);
	}

	.subtitle {
		font-size: 15px;
		color: var(--fg-secondary);
		margin: 0;
		line-height: 1.4;
	}

	/* ── Canvas area ───────────────────────────────── */
	.canvas-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		min-height: 0;
	}

	.char-hint {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.char-label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
	}

	.char-name {
		font-size: 28px;
		font-weight: 600;
		color: var(--sumi);
		font-family: var(--font-jp), serif;
		line-height: 1;
	}

	.char-romaji {
		font-size: 13px;
		color: var(--fg-tertiary);
	}

	.writing-card {
		position: relative;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 20px;
		box-shadow: var(--shadow-md);
		display: flex;
		align-items: center;
		justify-content: center;
		/* Critical: touch-action none on the card too */
		touch-action: none;
	}

	.card-controls {
		position: absolute;
		top: 14px;
		right: 14px;
		z-index: 10;
	}

	.clear-btn {
		min-width: 44px;
		min-height: 44px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--fg-secondary);
		transition:
			color 150ms,
			border-color 150ms;
	}
	@media (hover: hover) {
		.clear-btn:hover {
			color: var(--sumi);
			border-color: var(--ink-400);
		}
	}

	.loading-state {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-tertiary);
	}

	.hanzi-host {
		display: flex;
		align-items: center;
		justify-content: center;
		/* Absolutely critical for touch recognition */
		touch-action: none;
	}

	/* Force SVG inside the host to also accept touch */
	.hanzi-host :global(svg) {
		touch-action: none;
		pointer-events: auto;
	}

	.tip {
		font-size: 13px;
		color: var(--fg-tertiary);
		text-align: center;
		margin: 0;
	}

	/* ── Footer ───────────────────────────────────── */
	.footer {
		flex-shrink: 0;
		padding: 16px 0 env(safe-area-inset-bottom, 12px);
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.skip-link {
		font-size: 13px;
		color: var(--fg-tertiary);
		height: 36px;
	}

	.btn-muted {
		background: var(--ink-100);
		color: var(--fg-tertiary);
		cursor: not-allowed;
		opacity: 0.8; /* Increased opacity for better readability in dark mode */
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
