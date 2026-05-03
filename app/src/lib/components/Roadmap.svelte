<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { quintOut, cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import { fadeUp } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import UnitIcon from '$lib/components/UnitIcon.svelte';
	import { LockIcon, ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import type { RoadmapUnit, Lesson } from '$lib/data/roadmap';

	interface Props {
		units: any[];
		decks: any[];
		lessonProgress: any[];
		onLevelChange?: (level: string) => void;
	}

	let { units = [], decks = [], lessonProgress = [], onLevelChange }: Props = $props();

	let activeUnitId = $state<string | null>(null);

	// --- Lógica de Negocio ---
	function getDeck(id: string) {
		return decks.find((d: any) => d.id === id);
	}

	function getLessonSession(lessonId: string) {
		return lessonProgress.find((p: any) => p.lesson_id === lessonId);
	}

	function lessonProgressPct(l: Lesson): number {
		const session = getLessonSession(l.id);
		if (!session) return 0;
		if (session.completed_at) return 100;
		if (session.total_steps > 0) return Math.min(99, Math.round((session.correct_count / session.total_steps) * 100));
		return 0;
	}

	// Completed = ONLY roadmap lesson_progress, never deck card progress
	function lessonCompleted(l: Lesson): boolean {
		return !!getLessonSession(l.id)?.completed_at;
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
		const total = valid.reduce((acc, l) => acc + lessonProgressPct(l), 0);
		return Math.round(total / valid.length);
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
	const nodeSpacing = 120;
	const CURVE_OFFSETS = [-22, 5, 28, -10, 20, -28, 12, -18, 25, 0, -25, 15, 28, -8, -20, 10, 22, -15, -28, 18];

	const nodeCoords = $derived(
		units.map((_, i) => {
			const offset = CURVE_OFFSETS[i % CURVE_OFFSETS.length];
			const x = 50 + offset;
			const y = i * nodeSpacing + 140;
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

	const totalHeight = $derived((units.length - 1) * nodeSpacing + 300);

	const levelColors: Record<string, string> = {
		Survival: 'var(--hinomaru-red)',
		N5: '#3b82f6',
		N4: '#10b981',
		N3: '#f59e0b',
		N2: '#8b5cf6',
		N1: '#ec4899'
	};

	let currentUnit = $state<RoadmapUnit | null>(null);

	onMount(async () => {
		await tick();
		if (window.scrollY === 0) {
			const currentEl = document.querySelector('.node-tile.is-current');
			if (currentEl) {
				currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}

		let lastLevel = '';
		const handleScroll = () => {
			if (!units.length) return;

			const nodes = document.querySelectorAll('.node-anchor');
			let closestUnitId = '';
			let minDistance = Infinity;

			nodes.forEach((node) => {
				const rect = node.getBoundingClientRect();
				const distance = Math.abs(rect.top - 200);
				if (distance < minDistance) {
					minDistance = distance;
					closestUnitId = node.getAttribute('data-id') || '';
				}
			});

			const unit = units.find((u) => u.id === closestUnitId);
			if (unit && unit.id !== currentUnit?.id) {
				currentUnit = unit;
				if (onLevelChange && unit.jlptLevel !== lastLevel) {
					lastLevel = unit.jlptLevel;
					onLevelChange(unit.jlptLevel);
				}
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener('scroll', handleScroll);
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			activeUnitId = null;
			return;
		}

		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			const available = units.filter((u) => unitState(u) !== 'locked');
			if (available.length === 0) return;

			const currentIndex = activeUnitId ? available.findIndex((u) => u.id === activeUnitId) : -1;

			let nextIndex: number;
			if (event.key === 'ArrowDown') {
				nextIndex = currentIndex < available.length - 1 ? currentIndex + 1 : 0;
			} else {
				nextIndex = currentIndex > 0 ? currentIndex - 1 : available.length - 1;
			}

			activeUnitId = available[nextIndex].id;
			event.preventDefault();

			const el = document.querySelector(`[data-id="${available[nextIndex].id}"] .node-tile`);
			if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="roadmap-wrapper"
	role="presentation"
	onclick={(e) => {
		if (e.target === e.currentTarget) activeUnitId = null;
	}}
>
	{#if units.length === 0}
		<div class="empty-state" in:fade>
			<p>{t('home.empty', $locale)}</p>
		</div>
	{:else}
		{#if activeUnitId}
			<button
				class="popover-backdrop"
				onclick={() => (activeUnitId = null)}
				onkeydown={(e) => e.key === 'Escape' && (activeUnitId = null)}
				aria-label="Cerrar popover"
				in:fade={{ duration: 200 }}
				out:fade={{ duration: 150 }}
			></button>
		{/if}
		<div class="roadmap-container" style="height: {totalHeight}px">
			<!-- Sticky Topic Card -->
			{#if currentUnit}
				<div class="topic-card-wrapper">
					{#key currentUnit.id}
						<div
							class="topic-card"
							in:fly={{ y: -10, duration: 400, easing: cubicOut }}
							style="--accent: {levelColors[currentUnit.jlptLevel]}"
						>
							<div class="topic-icon">
								<UnitIcon
									state={unitState(currentUnit) === 'completed' ? 'completed' : 'active'}
									size={18}
								/>
							</div>
							<div class="topic-info">
								<div class="topic-lvl">
									{$locale === 'es' ? currentUnit.section_es : currentUnit.section_en}
								</div>
								<div class="topic-title">
									{$locale === 'es' ? currentUnit.title_es : currentUnit.title_en}
								</div>
							</div>
						</div>
					{/key}
				</div>
			{/if}

			<!-- SVG Path -->
			<svg
				class="roadmap-svg"
				viewBox="0 0 100 {totalHeight}"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
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
				{@const label = $locale === 'es' ? unit.title_es : unit.title_en}
				{@const iconState = state === 'completed' ? 'completed' : state === 'locked' ? 'neutral' : 'active'}

				<div
					class="node-anchor"
					class:is-active={isActive}
					style="left: {pos.x}%; top: {pos.y}px; --node-accent: {levelColors[unit.jlptLevel]};"
					data-id={unit.id}
				>
					<button
						class="node-tile"
						class:is-locked={state === 'locked'}
						class:is-completed={state === 'completed'}
						class:is-current={state === 'current'}
						class:is-active={isActive}
						onclick={() => handleUnitClick(unit)}
						disabled={state === 'locked'}
						aria-label="{label} — {state}"
						aria-expanded={isActive}
						aria-haspopup="true"
						use:fadeUp={{ delay: Math.min(i * 0.04, 0.4), y: 15 }}
					>
						<!-- Progress Ring (Segmented, granular) -->
						{#if state !== 'locked'}
							<svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
								{#each unit.lessons as lesson, idx}
									{@const lPct = lessonProgressPct(lesson)}
									{@const isCompleted = lessonCompleted(lesson)}
									{@const segmentTotal = 289 / (unit.lessons.length || 1)}
									{@const gap = 8}
									{@const fillLen = ((lPct / 100) * (segmentTotal - gap))}
									{@const ringStroke = isCompleted ? '#ED8A19' : 'var(--node-accent)'}
									<!-- Background track -->
									<circle
										class="ring-segment"
										cx="50"
										cy="50"
										r="46"
										style:stroke-dasharray="{segmentTotal - gap} 289"
										style:stroke-dashoffset={-idx * segmentTotal + gap / 2}
									/>
									<!-- Fill -->
									{#if lPct > 0}
										<circle
											class="ring-segment-fill"
											cx="50"
											cy="50"
											r="46"
											style:stroke-dasharray="{fillLen} 289"
											style:stroke-dashoffset={-idx * segmentTotal + gap / 2}
											style:stroke={ringStroke}
										/>
									{/if}
								{/each}
							</svg>
						{/if}

						<div class="tile-content">
							{#if state === 'locked'}
								<div class="lock-icon-wrap">
									<Icon icon={LockIcon} size={22} />
								</div>
							{:else}
								<UnitIcon {iconState} size={28} />
							{/if}
						</div>
					</button>

					<!-- Popover -->
					{#if isActive}
						{@const shift = pos.x < 30 ? -20 : pos.x > 70 ? -80 : -50}
						<div
							class="unit-popover-wrapper"
							style="transform: translateX({shift}%);"
							role="dialog"
							aria-label="Detalles de {label}"
						>
							<div
								class="unit-popover"
								in:fly={{ y: 8, duration: 450, easing: quintOut }}
								out:fade={{ duration: 200 }}
							>
								<div class="popover-content">
									<div class="popover-header">
										<div class="header-top-row">
											<span class="unit-tag">Unit {i + 1}</span>
											<button
												class="popover-close"
												onclick={() => (activeUnitId = null)}
												aria-label="Cerrar"
											>
												<Icon icon={Cancel01Icon} size={18} />
											</button>
										</div>
										<div
											style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:4px;"
										>
											<span class="level-mini-tag">{unit.jlptLevel}</span>
										</div>
										<h3 class="popover-title">{label}</h3>
									</div>
									<p class="popover-desc">
										{$locale === 'es' ? unit.objective_es : unit.objective_en}
									</p>

									<div class="unit-overview">
										<div class="overview-item">
											<span class="dot vocab" aria-hidden="true"></span>
											<span>{unit.lessons.length * 5}+ Vocab</span>
										</div>
										<div class="overview-item">
											<span class="dot grammar" aria-hidden="true"></span>
											<span>Grammar</span>
										</div>
									</div>

									<div class="popover-stats">
										<div class="stat-item">
											<span class="stat-val">{progress > 0 ? `${progress}%` : '—'}</span>
											<span class="stat-lbl">{$locale === 'es' ? 'Progreso' : 'Progress'}</span>
										</div>
										<div class="stat-item">
											<span class="stat-val">{unit.lessons.length}</span>
											<span class="stat-lbl">{$locale === 'es' ? 'Lecciones' : 'Lessons'}</span>
										</div>
									</div>
									<button
										class="hm-btn hm-btn-primary hm-btn-sm hm-btn-full"
										onclick={() => handleContinue(unit)}
									>
										<span>{$locale === 'es' ? 'Continuar' : 'Continue'}</span>
										<Icon icon={ArrowRight01Icon} size={18} />
									</button>
								</div>
								<div class="popover-arrow" style="left: {-shift}%" aria-hidden="true"></div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Level checkpoint banner between JLPT sections -->
				{#if (unit as any).isLevelStart && i > 0}
					{@const prevY = nodeCoords[i - 1].y}
					{@const nextY = nodeCoords[i].y}
					{@const midY = (prevY + nextY) / 2}
					<div
						class="level-checkpoint"
						style="top: {midY}px;"
					>
						<span class="checkpoint-line"></span>
						<span class="checkpoint-label">{(unit as any).jlptLevel}</span>
						<span class="checkpoint-line"></span>
					</div>
				{/if}
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
		--rm-path: var(--ink-300);
		--rm-complete-stroke: var(--ink-900);
	}

	[data-theme='dark'] {
		--rm-bg: var(--bg-surface);
		--rm-text: var(--fg-primary);
		--rm-muted: var(--fg-secondary);
		--rm-border: var(--ink-700);
		--rm-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		--rm-path: rgba(255, 255, 255, 0.18);
		--rm-complete-stroke: var(--bg-page);
	}

	.roadmap-wrapper {
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		padding: 0 0 120px;
		position: relative;
	}

	.roadmap-container {
		width: 100%;
		position: relative;
		overflow: visible;
	}

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
		stroke: var(--ink-200);
		stroke-width: 3;
		vector-effect: non-scaling-stroke;
	}

	.roadmap-path-active {
		fill: none;
		stroke: var(--rm-accent);
		stroke-width: 3.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 8 12;
		animation: dashFlow 60s linear infinite;
		vector-effect: non-scaling-stroke;
	}

	@keyframes dashFlow {
		from { stroke-dashoffset: 2400; }
		to { stroke-dashoffset: 0; }
	}

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

	.popover-backdrop {
		position: fixed;
		inset: 0;
		z-index: 85;
		background: transparent;
		border: none;
		padding: 0;
		width: 100%;
		height: 100%;
		cursor: default;
	}

	.topic-card-wrapper {
		position: sticky;
		top: calc(12px + env(safe-area-inset-top, 0px));
		left: 0;
		right: 0;
		z-index: 11000;
		padding: 0 16px;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.topic-card {
		background: var(--bg-surface);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid var(--rm-border);
		border-radius: 99px;
		padding: 6px 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		pointer-events: auto;
		box-shadow: var(--rm-shadow);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		width: 100%;
		max-width: 320px;
	}

	.topic-icon {
		display: flex;
		align-items: center;
	}

	.topic-lvl {
		font-size: 9px;
		font-weight: 900;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent);
		filter: saturate(1.2) brightness(0.82);
	}

	.topic-title {
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.node-tile {
		width: 68px;
		height: 68px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		padding: 0;
		cursor: pointer;
		position: relative;
		display: grid;
		place-items: center;
		transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.2s ease;
		box-shadow:
			0 4px 0 0 var(--ink-300),
			0 6px 14px rgba(0, 0, 0, 0.10);
	}

	.tile-content {
		display: grid;
		place-items: center;
	}

	.lock-icon-wrap {
		opacity: 0.6;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.progress-ring {
		position: absolute;
		inset: -6px;
		width: calc(100% + 12px);
		height: calc(100% + 12px);
		transform: rotate(-90deg);
		pointer-events: none;
	}

	.ring-segment {
		fill: none;
		stroke: var(--ink-100);
		stroke-width: 1.5;
		stroke-linecap: round;
		transition: all 0.3s ease;
	}

	.ring-segment-fill {
		fill: none;
		stroke-width: 4;
		stroke-linecap: round;
		transition: stroke-dasharray 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@media (hover: hover) {
		.node-tile:not(.is-locked):hover {
			transform: translateY(-3px);
			box-shadow:
				0 7px 0 0 var(--ink-300),
				0 10px 20px rgba(0, 0, 0, 0.15);
		}
	}

	.node-tile:not(.is-locked):active {
		transform: translateY(3px);
		box-shadow:
			0 1px 0 0 var(--ink-300),
			0 2px 6px rgba(0, 0, 0, 0.08);
	}

	.node-tile.is-locked {
		background: var(--bg-muted);
		border: 1.5px solid var(--ink-200);
		cursor: not-allowed;
		color: var(--ink-400);
		box-shadow:
			0 3px 0 0 var(--ink-200),
			0 4px 8px rgba(0, 0, 0, 0.06);
	}

	.node-tile.is-current {
		border: 2.5px solid var(--node-accent);
		background: var(--bg-surface);
		box-shadow:
			0 4px 0 0 var(--node-accent),
			0 6px 18px rgba(188, 0, 45, 0.22);
	}

	.node-tile.is-completed {
		background: var(--bg-surface);
		border: 1.5px solid #e8a52a;
		box-shadow:
			0 4px 0 0 #c87a10,
			0 6px 14px rgba(237, 138, 25, 0.22);
	}

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

	.header-top-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-bottom: 4px;
	}

	.popover-close {
		background: none;
		border: none;
		padding: 4px;
		color: var(--fg-tertiary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.2s;
		border-radius: 6px;
	}

	.popover-close:hover { color: var(--hinomaru-red); }
	.popover-close:focus-visible {
		outline: 2px solid var(--hinomaru-red);
		outline-offset: 2px;
	}

	.popover-header { margin-bottom: 8px; }

	.unit-tag {
		font-size: 11px;
		font-weight: 900;
		text-transform: uppercase;
		color: var(--fg-primary);
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
		margin-bottom: 16px;
	}

	.unit-overview {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;
		padding: 10px;
		background: var(--ink-100);
		border-radius: 12px;
	}

	[data-theme='dark'] .unit-overview { background: var(--ink-800); }

	.overview-item {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-secondary);
		text-transform: uppercase;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.dot.vocab { background: var(--hinomaru-red); }
	.dot.grammar { background: #3b82f6; }

	.level-mini-tag {
		font-size: 10px;
		font-weight: 900;
		color: var(--fg-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.popover-stats {
		display: flex;
		gap: 20px;
		margin-bottom: 16px;
		padding-top: 12px;
		border-top: 1px solid var(--rm-border);
	}

	.stat-item { display: flex; flex-direction: column; }

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

	.level-checkpoint {
		position: absolute;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 5;
		display: flex;
		align-items: center;
		gap: 8px;
		pointer-events: none;
		width: 80%;
		max-width: 260px;
	}

	.checkpoint-line {
		flex: 1;
		height: 1px;
		background: var(--ink-200);
	}

	.checkpoint-label {
		font-size: 10px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--fg-tertiary);
		background: var(--bg-page);
		padding: 3px 10px;
		border: 1px solid var(--ink-200);
		border-radius: 99px;
		white-space: nowrap;
	}

	.empty-state {
		text-align: center;
		padding: 80px 20px;
		color: var(--rm-muted);
	}

	@media (max-width: 600px) {
		.roadmap-wrapper { max-width: 100%; }
		.unit-popover {
			width: calc(100vw - 40px);
			max-width: 320px;
		}
	}
</style>
