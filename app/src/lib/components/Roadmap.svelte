<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import type { RoadmapUnit, Lesson } from '$lib/data/roadmap';
	import UnitIcon from '$lib/components/UnitIcon.svelte';
	import Icon from '$lib/Icon.svelte';
	import { LockIcon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';

	interface Props {
		units: any[];
		decks: any[];
		lessonProgress: any[];
		onLevelChange?: (level: string) => void;
	}

	let { units = [], decks = [], lessonProgress = [], onLevelChange }: Props = $props();

	function getDeck(id: string) {
		return decks.find((d: any) => d.id === id);
	}

	function getLessonProgress(lessonId: string) {
		return lessonProgress.find((p: any) => p.lesson_id === lessonId) ?? null;
	}

	function lessonCompleted(l: Lesson): boolean {
		const lp = getLessonProgress(l.id);
		if (lp?.completed_at) return true;
		const d = getDeck(l.deckId);
		if (!d || !d.card_count) return false;
		return Math.round(((d.learned ?? 0) / d.card_count) * 100) >= 100;
	}

	function lessonAvailable(l: Lesson): boolean {
		const d = getDeck(l.deckId);
		return !!d && d.card_count > 0;
	}

	function lessonProgressPct(l: Lesson): number {
		const lp = getLessonProgress(l.id);
		if (!lp) return 0;
		if (lp.completed_at) return 100;
		if (lp.total_steps > 0) return Math.min(99, Math.round((lp.correct_count / lp.total_steps) * 100));
		return 0;
	}

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

	function unitProgress(unit: RoadmapUnit): number {
		const valid = unit.lessons.filter(lessonAvailable);
		if (valid.length === 0) return 0;
		const total = valid.reduce((acc, l) => acc + lessonProgressPct(l), 0);
		return Math.round(total / valid.length);
	}

	function unitState(unit: RoadmapUnit): 'locked' | 'current' | 'completed' | 'available' {
		const valid = unit.lessons.filter(lessonAvailable);
		if (valid.length === 0) return 'locked';
		const allDone = valid.every((l) => lessonCompleted(l));
		if (allDone) return 'completed';
		if (unit.id === currentUnitId) return 'current';
		const allLocked = valid.every((l) => !unlockedSet.has(l.id));
		if (allLocked) return 'locked';
		return 'available';
	}

	function lessonState(l: Lesson): 'locked' | 'current' | 'completed' | 'available' {
		if (!unlockedSet.has(l.id)) return 'locked';
		if (lessonCompleted(l)) return 'completed';
		const idx = flatLessons.findIndex((fl) => fl.id === l.id);
		if (idx === currentIdx) return 'current';
		return 'available';
	}

	function handleLessonClick(l: Lesson) {
		const state = lessonState(l);
		if (state === 'locked') return;
		goto(`/learning/${l.id}`);
	}

	function handleContinueUnit(unit: RoadmapUnit) {
		const unitLessons = flatLessons.filter((l: any) => l.unitId === unit.id);
		const next = unitLessons.find((l: any) => !lessonCompleted(l)) ?? unitLessons[unitLessons.length - 1];
		if (next) goto(`/learning/${next.id}`);
	}

	const levelColors: Record<string, string> = {
		Survival: 'var(--hinomaru-red)',
		N5: '#3b82f6',
		N4: '#10b981',
		N3: '#f59e0b',
		N2: '#8b5cf6',
		N1: '#ec4899'
	};

	// Lesson type labels
	const lessonTypeLabel: Record<string, { es: string; en: string }> = {
		learn: { es: 'Aprender', en: 'Learn' },
		practice: { es: 'Practicar', en: 'Practice' },
		quiz: { es: 'Quiz', en: 'Quiz' },
		speak: { es: 'Hablar', en: 'Speak' },
		review: { es: 'Repasar', en: 'Review' }
	};

	// Circumference for progress ring (r=20 → 2π×20 ≈ 125.6)
	const CIRC = 125.6;
</script>

<div class="roadmap-wrapper" role="presentation">
	{#if units.length === 0}
		<div class="empty-state" in:fade>
			<p>{t('home.empty', $locale)}</p>
		</div>
	{:else}
		<div class="units-list">
			{#each units as unit, i (unit.id)}
				{@const state = unitState(unit)}
				{@const progress = unitProgress(unit)}
				{@const accent = levelColors[unit.jlptLevel] ?? 'var(--hinomaru-red)'}
				{@const isGold = state === 'completed'}
				{@const ringColor = isGold ? '#ED8A19' : accent}
				{@const iconState = state === 'completed' ? 'completed' : state === 'current' || state === 'available' ? 'active' : 'neutral'}

				<div
					class="unit-card"
					class:is-locked={state === 'locked'}
					class:is-completed={state === 'completed'}
					class:is-current={state === 'current'}
					style="--accent: {accent}; --ring-color: {ringColor};"
					in:fly={{ y: 16, duration: 300, delay: Math.min(i * 40, 300) }}
				>
					<!-- Card Header -->
					<div class="card-header">
						<div class="header-left">
							<div class="unit-icon-wrap">
								<UnitIcon state={iconState} size={26} />
							</div>
							<div class="header-text">
								<div class="unit-section">
									{$locale === 'es' ? unit.section_es : unit.section_en}
									<span class="unit-level-badge">{unit.jlptLevel}</span>
								</div>
								<div class="unit-title">
									{$locale === 'es' ? unit.title_es : unit.title_en}
								</div>
							</div>
						</div>

						<!-- Big progress ring -->
						<div class="big-ring-wrap">
							<svg class="big-ring" viewBox="0 0 52 52" aria-hidden="true">
								<circle class="ring-track" cx="26" cy="26" r="20" />
								<circle
									class="ring-fill"
									cx="26"
									cy="26"
									r="20"
									style="stroke-dasharray: {(progress / 100) * CIRC} {CIRC}; stroke: {ringColor};"
								/>
							</svg>
							<span class="ring-pct" style="color: {ringColor};">
								{progress > 0 ? `${progress}%` : state === 'locked' ? '—' : '0%'}
							</span>
						</div>
					</div>

					<!-- Objective -->
					<p class="unit-objective">
						{$locale === 'es' ? unit.objective_es : unit.objective_en}
					</p>

					<!-- Divider -->
					<div class="card-divider"></div>

					<!-- 4 Lesson Nodes -->
					<div class="lessons-row">
						{#each unit.lessons as lesson, li (lesson.id)}
							{@const ls = lessonState(lesson)}
							{@const lPct = lessonProgressPct(lesson)}
							{@const LCIRC = 56.5}

							<button
								class="lesson-node"
								class:is-locked={ls === 'locked'}
								class:is-completed={ls === 'completed'}
								class:is-current={ls === 'current'}
								disabled={ls === 'locked'}
								onclick={() => handleLessonClick(lesson)}
								aria-label="{lessonTypeLabel[lesson.type]?.[$locale] ?? lesson.type}"
							>
								<!-- Mini progress ring -->
								<svg class="lesson-ring" viewBox="0 0 24 24" aria-hidden="true">
									<circle class="lring-track" cx="12" cy="12" r="9" />
									<circle
										class="lring-fill"
										cx="12"
										cy="12"
										r="9"
										style="stroke-dasharray: {(lPct / 100) * LCIRC} {LCIRC}; stroke: {ls === 'completed' ? '#ED8A19' : accent};"
									/>
								</svg>

								<!-- Node content -->
								{#if ls === 'locked'}
									<div class="node-icon locked">
										<Icon icon={LockIcon} size={12} />
									</div>
								{:else if ls === 'completed'}
									<div class="node-icon completed">
										<Icon icon={CheckmarkCircle01Icon} size={14} color="#ED8A19" />
									</div>
								{:else}
									<div class="node-dot" class:current={ls === 'current'} style="background: {accent};"></div>
								{/if}

								<span class="lesson-label">
									{lessonTypeLabel[lesson.type]?.[$locale === 'es' ? 'es' : 'en'] ?? lesson.type}
								</span>
							</button>
						{/each}
					</div>

					<!-- Continue button for current/available -->
					{#if state !== 'locked'}
						<button
							class="continue-btn"
							style="background: {accent};"
							onclick={() => handleContinueUnit(unit)}
						>
							{state === 'completed'
								? ($locale === 'es' ? 'Repasar' : 'Review')
								: ($locale === 'es' ? 'Continuar' : 'Continue')}
						</button>
					{/if}
				</div>

				<!-- Connector between cards -->
				{#if i < units.length - 1}
					<div class="connector" aria-hidden="true">
						<div class="connector-line"></div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.roadmap-wrapper {
		width: 100%;
		max-width: 560px;
		margin: 0 auto;
		padding: 16px 0 120px;
	}

	.units-list {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.unit-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 24px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		box-shadow: var(--shadow-sm);
		transition: box-shadow 0.2s ease, border-color 0.2s ease;
	}
	.unit-card.is-current {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent), var(--shadow-md);
	}
	.unit-card.is-completed {
		border-color: color-mix(in srgb, #ED8A19 40%, var(--ink-200));
	}
	.unit-card.is-locked {
		opacity: 0.55;
	}

	/* Header row */
	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	.header-left {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}

	.unit-icon-wrap {
		flex-shrink: 0;
		margin-top: 2px;
	}

	.header-text {
		flex: 1;
		min-width: 0;
	}

	.unit-section {
		font-size: 10px;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--fg-tertiary);
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 2px;
	}

	.unit-level-badge {
		font-size: 9px;
		font-weight: 900;
		background: var(--ink-100);
		color: var(--fg-secondary);
		padding: 1px 5px;
		border-radius: 4px;
		letter-spacing: 0.05em;
	}

	.unit-title {
		font-size: 16px;
		font-weight: 800;
		color: var(--fg-primary);
		line-height: 1.2;
	}

	/* Big progress ring */
	.big-ring-wrap {
		position: relative;
		width: 52px;
		height: 52px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.big-ring {
		position: absolute;
		inset: 0;
		transform: rotate(-90deg);
	}

	.ring-track {
		fill: none;
		stroke: var(--ink-100);
		stroke-width: 3;
	}

	.ring-fill {
		fill: none;
		stroke-width: 3.5;
		stroke-linecap: round;
		transition: stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.ring-pct {
		font-size: 9px;
		font-weight: 900;
		z-index: 1;
		line-height: 1;
	}

	/* Objective */
	.unit-objective {
		font-size: 13px;
		color: var(--fg-secondary);
		line-height: 1.45;
		margin: 0;
	}

	/* Divider */
	.card-divider {
		height: 1px;
		background: var(--ink-100);
		border-radius: 1px;
	}

	/* Lesson nodes row */
	.lessons-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
	}

	.lesson-node {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 10px 4px;
		border-radius: 16px;
		background: var(--ink-50);
		border: 1.5px solid var(--ink-100);
		cursor: pointer;
		transition: all 0.18s ease;
		position: relative;
	}
	.lesson-node:not(:disabled):hover {
		background: var(--ink-100);
		border-color: var(--ink-200);
		transform: translateY(-2px);
	}
	.lesson-node:not(:disabled):active {
		transform: translateY(0);
	}
	.lesson-node.is-current {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 6%, var(--bg-surface));
	}
	.lesson-node.is-completed {
		background: color-mix(in srgb, #ED8A19 6%, var(--bg-surface));
		border-color: color-mix(in srgb, #ED8A19 30%, var(--ink-100));
	}
	.lesson-node.is-locked {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Mini ring */
	.lesson-ring {
		width: 28px;
		height: 28px;
		transform: rotate(-90deg);
		flex-shrink: 0;
	}

	.lring-track {
		fill: none;
		stroke: var(--ink-200);
		stroke-width: 2;
	}

	.lring-fill {
		fill: none;
		stroke-width: 2.5;
		stroke-linecap: round;
		transition: stroke-dasharray 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.node-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.node-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		opacity: 0.5;
	}
	.node-dot.current {
		opacity: 1;
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, var(--hinomaru-red)) 25%, transparent);
	}

	.lesson-label {
		font-size: 9px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg-tertiary);
		text-align: center;
		line-height: 1.2;
	}

	/* Continue button */
	.continue-btn {
		width: 100%;
		padding: 14px;
		border: none;
		border-radius: 16px;
		color: white;
		font-size: 15px;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.15s;
		box-shadow: 0 4px 0 color-mix(in srgb, var(--accent, var(--hinomaru-red)) 50%, black);
	}
	.continue-btn:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 color-mix(in srgb, var(--accent, var(--hinomaru-red)) 50%, black);
	}

	/* Connector */
	.connector {
		display: flex;
		justify-content: center;
		padding: 4px 0;
	}

	.connector-line {
		width: 2px;
		height: 24px;
		background: var(--ink-200);
		border-radius: 1px;
	}

	.empty-state {
		text-align: center;
		padding: 80px 20px;
		color: var(--fg-secondary);
	}

	@media (max-width: 400px) {
		.unit-card {
			border-radius: 20px;
			padding: 16px;
		}
		.lessons-row {
			gap: 6px;
		}
	}
</style>
