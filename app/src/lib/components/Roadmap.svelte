<script lang="ts">
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import { fadeUp } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import { LockIcon, Tick01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import type { RoadmapUnit, Lesson } from '$lib/data/roadmap';

	// Props con Svelte 5 runes
	const { decks = [], units = [], lessonProgress = [] } = $props();

	let activeUnitId = $state<string | null>(null);

	// --- Lógica de Negocio ---
	function getDeck(id: string) {
		return decks.find((d: any) => d.id === id);
	}

	function getLessonSession(lessonId: string) {
		return lessonProgress.find((p: any) => p.lesson_id === lessonId);
	}

	function lessonProgressCalc(l: Lesson) {
		const session = getLessonSession(l.id);
		if (session?.completed_at) return { learned: 100, total: 100, pct: 100 };

		const d = getDeck(l.deckId);
		if (!d || !d.card_count) return { learned: 0, total: 0, pct: 0 };
		const learned = d.learned ?? 0;
		return {
			learned,
			total: d.card_count,
			pct: Math.min(100, Math.round((learned / d.card_count) * 100))
		};
	}

	function lessonCompleted(l: Lesson): boolean {
		return getLessonSession(l.id)?.completed_at || lessonProgressCalc(l).pct === 100;
	}

	function lessonAvailable(l: Lesson): boolean {
		const d = getDeck(l.deckId);
		return !!d && d.card_count > 0;
	}

	// Listado plano para calcular bloqueos en cascada
	const flatLessons = $derived(
		units.flatMap((u: RoadmapUnit) =>
			u.lessons.filter(lessonAvailable).map((l: Lesson) => ({ ...l, unitId: u.id }))
		)
	);

	const unlockedSet = $derived.by(() => {
		const set = new Set<string>();
		if (flatLessons.length === 0) return set;
		set.add(flatLessons[0].id);
		for (let i = 1; i < flatLessons.length; i++) {
			if (lessonCompleted(flatLessons[i - 1])) set.add(flatLessons[i].id);
		}
		return set;
	});

	const currentIdx = $derived(flatLessons.findIndex((l) => !lessonCompleted(l)));
	const currentUnitId = $derived(currentIdx !== -1 ? flatLessons[currentIdx]?.unitId : null);

	function unitProgress(unit: RoadmapUnit) {
		const valid = unit.lessons.filter(lessonAvailable);
		if (valid.length === 0) return 0;
		const done = valid.filter(lessonCompleted).length;
		return Math.round((done / valid.length) * 100);
	}

	function unitState(unit: RoadmapUnit) {
		const valid = unit.lessons.filter(lessonAvailable);
		const allDone = valid.length > 0 && valid.every((l) => lessonCompleted(l));
		const isCurrent = unit.id === currentUnitId;
		const allLocked = valid.every((l) => !unlockedSet.has(l.id));

		if (allDone) return 'completed';
		if (isCurrent) return 'current';
		if (allLocked) return 'locked';
		return 'available';
	}

	function handleUnitClick(unit: RoadmapUnit) {
		const state = unitState(unit);
		if (state === 'locked') return;

		if (activeUnitId === unit.id) {
			activeUnitId = null;
		} else {
			activeUnitId = unit.id;
		}
	}

	function handleContinue(unit: RoadmapUnit) {
		const unitLessons = flatLessons.filter((l: any) => l.unitId === unit.id);
		const next =
			unitLessons.find((l: any) => !lessonCompleted(l)) || unitLessons[unitLessons.length - 1];
		if (next) goto(`/learning/${next.id}`);
	}

	// Geometría del Roadmap
	const nodeSpacing = 110;
	const nodeXOffset = 35; // %

	const nodeCoords = $derived(
		units.map((_, i) => {
			// Usamos -Math.cos para empezar desde la izquierda (-1), pasar por el centro (0) y llegar a la derecha (1)
			const x = 50 + Math.sin((i * Math.PI) / 2 - Math.PI / 2) * nodeXOffset;
			const y = i * nodeSpacing + 50;
			return { x, y };
		})
	);

	const pathData = $derived.by(() => {
		if (nodeCoords.length < 2) return '';
		let d = `M ${nodeCoords[0].x} ${nodeCoords[0].y}`;
		for (let i = 0; i < nodeCoords.length - 1; i++) {
			const start = nodeCoords[i];
			const end = nodeCoords[i + 1];
			const midY = (start.y + end.y) / 2;
			d += ` C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
		}
		return d;
	});

	const totalHeight = $derived((units.length - 1) * nodeSpacing + 100);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') activeUnitId = null;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div 
	class="roadmap-wrapper" 
	onclick={(e) => {
		if (e.target === e.currentTarget) activeUnitId = null;
	}}
>
	{#if units.length === 0}
		<div class="empty-state" in:fade>
			<p>{t('home.empty', $locale)}</p>
		</div>
	{:else}
		<div 
			class="roadmap-container" 
			style="height: {totalHeight}px"
			onclick={(e) => {
				if (e.target === e.currentTarget) activeUnitId = null;
			}}
		>
			<!-- SVG Path -->
			<svg class="roadmap-svg" viewBox="0 0 100 {totalHeight}" preserveAspectRatio="none">
				<defs>
					<linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="var(--rm-accent)" stop-opacity="0.6" />
						<stop offset="50%" stop-color="var(--rm-accent)" stop-opacity="1" />
						<stop offset="100%" stop-color="var(--rm-accent)" stop-opacity="0.6" />
					</linearGradient>
				</defs>
				<path d={pathData} class="roadmap-path" />
				<path d={pathData} class="roadmap-path-active" />
			</svg>

			<!-- Nodes -->
			{#each units as unit, i (unit.id)}
				{@const state = unitState(unit)}
				{@const progress = unitProgress(unit)}
				{@const pos = nodeCoords[i]}
				{@const isActive = activeUnitId === unit.id}

				<div class="node-anchor" class:is-active={isActive} style="left: {pos.x}%; top: {pos.y}px;">
					<button
						class="node-circle"
						class:is-locked={state === 'locked'}
						class:is-completed={state === 'completed'}
						class:is-current={state === 'current'}
						class:is-active={isActive}
						onclick={() => handleUnitClick(unit)}
						disabled={state === 'locked'}
						use:fadeUp={{ delay: Math.min(i * 0.04, 0.4), y: 15 }}
					>
						<!-- Progress Ring -->
						<svg class="progress-ring" viewBox="0 0 100 100">
							<circle class="ring-track" cx="50" cy="50" r="46" />
							<circle
								class="ring-fill"
								cx="50"
								cy="50"
								r="46"
								style="stroke-dasharray: {(progress / 100) * 289}, 289"
							/>
						</svg>

						<div class="node-content">
							<span class="node-emoji">{unit.emoji}</span>
							{#if state === 'locked'}
								<div class="node-badge lock"><Icon icon={LockIcon} size={14} color="#fff" /></div>
							{:else if state === 'completed'}
								<div class="node-badge check"><Icon icon={Tick01Icon} size={14} color="#fff" /></div>
							{/if}
						</div>
					</button>

					<!-- Popover -->
					{#if isActive}
						{@const shift = pos.x < 30 ? -20 : pos.x > 70 ? -80 : -50}
						<div 
							class="unit-popover-wrapper" 
							style="transform: translateX({shift}%);"
						>
							<div 
								class="unit-popover" 
								in:fly={{ y: 8, duration: 450, easing: quintOut }}
								out:fade={{ duration: 200 }}
							>
								<div class="popover-content">
									<div class="popover-header">
										<span class="unit-tag">Unit {i + 1}</span>
										<h3 class="popover-title">{$locale === 'es' ? unit.title_es : unit.title_en}</h3>
									</div>
									<p class="popover-desc">
										{$locale === 'es' ? unit.objective_es : unit.objective_en}
									</p>
									<div class="popover-stats">
										<div class="stat-item">
											<span class="stat-val">{progress}%</span>
											<span class="stat-lbl">{$locale === 'es' ? 'Progreso' : 'Progress'}</span>
										</div>
										<div class="stat-item">
											<span class="stat-val">{unit.lessons.length}</span>
											<span class="stat-lbl">{$locale === 'es' ? 'Lecciones' : 'Lessons'}</span>
										</div>
									</div>
									<button class="hm-btn hm-btn-primary hm-btn-sm hm-btn-full" onclick={() => handleContinue(unit)}>
										<span>{$locale === 'es' ? 'Continuar' : 'Continue'}</span>
										<Icon icon={ArrowRight01Icon} size={18} />
									</button>
								</div>
								<div class="popover-arrow" style="left: {-shift}%"></div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	:root {
		--rm-bg: var(--bg-surface);
		--rm-accent: var(--hinomaru-red);
		--rm-text: var(--fg-primary);
		--rm-muted: var(--fg-secondary);
		--rm-border: var(--ink-200);
		--rm-shadow: var(--shadow-lg);
		--rm-path: var(--ink-200);
	}

	[data-theme='dark'] {
		--rm-bg: var(--bg-surface);
		--rm-text: var(--fg-primary);
		--rm-muted: var(--fg-secondary);
		--rm-border: var(--ink-300);
		--rm-shadow: var(--shadow-lg);
		--rm-path: rgba(255, 255, 255, 0.15);
	}

	.roadmap-wrapper {
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		padding: 20px 0 40px;
		position: relative;
	}

	.roadmap-container {
		width: 100%;
		position: relative;
		overflow: visible;
	}

	/* SVG Path Styling */
	.roadmap-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
		overflow: visible;
	}

	.roadmap-path {
		fill: none;
		stroke: var(--rm-path);
		stroke-width: 4;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
		opacity: 0.8;
	}

	.roadmap-path-active {
		fill: none;
		stroke: url(#pathGradient);
		stroke-width: 6;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 12 12;
		animation: dashFlow 60s linear infinite;
		vector-effect: non-scaling-stroke;
	}

	@keyframes dashFlow {
		from {
			stroke-dashoffset: 1000;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	/* Node Styling */
	.node-anchor {
		position: absolute;
		transform: translate(-50%, -50%);
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.node-anchor.is-active {
		z-index: 100;
	}

	.node-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: var(--rm-bg);
		border: none;
		padding: 0;
		cursor: pointer;
		position: relative;
		display: grid;
		place-items: center;
		transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		box-shadow: var(--rm-shadow);
	}

	.node-circle:hover:not(:disabled) {
		transform: scale(1.1);
		box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
	}

	.node-circle.is-active {
		transform: scale(1.1);
		border: 4px solid var(--rm-accent);
	}

	.node-circle.is-locked {
		background: var(--ink-200);
		color: var(--ink-400);
		cursor: not-allowed;
		filter: grayscale(1);
	}

	.node-circle.is-current {
		animation: pulseActive 2s infinite ease-in-out;
	}

	@keyframes pulseActive {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(188, 0, 45, 0.4);
		}
		50% {
			box-shadow: 0 0 0 15px rgba(188, 0, 45, 0);
		}
	}

	/* Progress Ring */
	.progress-ring {
		position: absolute;
		inset: -8px;
		width: calc(100% + 16px);
		height: calc(100% + 16px);
		transform: rotate(-90deg);
		pointer-events: none;
	}

	.ring-track {
		fill: none;
		stroke: var(--rm-border);
		stroke-width: 4;
	}

	.ring-fill {
		fill: none;
		stroke: var(--rm-accent);
		stroke-width: 4;
		stroke-linecap: round;
		transition: stroke-dasharray 1s ease-out;
	}

	.node-content {
		position: relative;
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		font-size: 34px;
	}

	.node-badge {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #888;
		display: grid;
		place-items: center;
		border: 3px solid var(--rm-bg);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.node-badge.check {
		background: #22c55e;
	}

	/* Popover Styling */
	.unit-popover-wrapper {
		position: absolute;
		top: 110%;
		left: 50%;
		width: 240px;
		z-index: 90;
		pointer-events: none;
	}

	.unit-popover {
		width: 100%;
		background: var(--rm-bg);
		border: 1px solid var(--rm-border);
		border-radius: 20px;
		padding: 20px;
		box-shadow: var(--rm-shadow);
		pointer-events: auto;
		transform-origin: top center;
	}

	.popover-header {
		margin-bottom: 8px;
	}

	.unit-tag {
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		color: var(--rm-muted);
		letter-spacing: 0.1em;
	}

	.popover-title {
		font-size: 16px;
		font-weight: 800;
		margin: 2px 0 0;
		color: var(--rm-text);
		line-height: 1.2;
	}

	.popover-desc {
		font-size: 13px;
		color: var(--rm-muted);
		line-height: 1.4;
		margin: 0 0 16px;
	}

	.popover-stats {
		display: flex;
		gap: 20px;
		margin-bottom: 16px;
		padding-top: 12px;
		border-top: 1px solid var(--rm-border);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
	}

	.stat-val {
		font-size: 16px;
		font-weight: 800;
		color: var(--rm-text);
	}

	.stat-lbl {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--rm-muted);
		letter-spacing: 0.05em;
	}

	.continue-btn {
		display: none; /* Usamos las clases globales hm-btn */
	}

	.continue-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(188, 0, 45, 0.3);
	}

	.popover-arrow {
		position: absolute;
		top: -8px;
		left: 50%;
		transform: translateX(-50%) rotate(45deg);
		width: 16px;
		height: 16px;
		background: var(--rm-bg);
		border-top: 1px solid var(--rm-border);
		border-left: 1px solid var(--rm-border);
		pointer-events: none;
	}

	.empty-state {
		text-align: center;
		padding: 80px 20px;
		color: var(--rm-muted);
	}

	@media (max-width: 600px) {
		.roadmap-wrapper {
			max-width: 100%;
		}
		.node-circle {
			width: 64px;
			height: 64px;
		}
		.node-content {
			font-size: 28px;
		}
		.unit-popover {
			width: calc(100vw - 40px);
			max-width: 320px;
		}
	}
</style>
