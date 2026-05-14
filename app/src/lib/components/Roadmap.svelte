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
	import {
		LockIcon,
		AlphabetJapaneseIcon,
		Cancel01Icon,
		VolumeHighIcon
	} from '@hugeicons/core-free-icons';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { safeRomaji } from '$lib/utils/romaji';
	import ResponsiveModal from '$lib/components/ui/ResponsiveModal.svelte';
	import DotLoader from '$lib/components/DotLoader.svelte';
	import type { RoadmapUnit, Lesson } from '$lib/data/roadmap';

	interface Props {
		units: any[];
		decks: any[];
		lessonProgress: any[];
		onLevelChange?: (level: string) => void;
	}

	let { units = [], decks = [], lessonProgress = [], onLevelChange }: Props = $props();

	let activeLessonId = $state<string | null>(null);

	let drawerOpen = $state(false);
	let drawerCards = $state<any[]>([]);
	let drawerLoading = $state(false);
	let drawerSeccion = $state<{
		title_es: string;
		title_en: string;
		emoji: string;
		colorIdx: number;
	} | null>(null);
	const supabase = createClient();

	async function openVocabDrawer(
		deckId: string,
		seccion: { title_es: string; title_en: string; emoji: string; colorIdx: number }
	) {
		drawerSeccion = seccion;
		drawerOpen = true;
		drawerLoading = true;
		drawerCards = [];
		const { data } = await supabase
			.from('cards')
			.select('*')
			.eq('deck_id', deckId)
			.order('sort_order', { ascending: true })
			.limit(40);
		drawerCards = data ?? [];
		drawerLoading = false;
	}

	function closeDrawer() {
		drawerOpen = false;
	}

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
		if (session.total_steps > 0)
			return Math.min(99, Math.round((session.correct_count / session.total_steps) * 100));
		return 0;
	}

	function lessonCompleted(l: Lesson): boolean {
		return !!getLessonSession(l.id)?.completed_at;
	}

	function lessonAvailable(l: Lesson): boolean {
		const d = getDeck(l.deckId);
		return !!d && d.card_count > 0;
	}

	function lessonTypeLabel(t: string): string {
		const map: Record<string, { es: string; en: string }> = {
			learn: { es: 'Aprender', en: 'Learn' },
			practice: { es: 'Practicar', en: 'Practice' },
			speak: { es: 'Hablar', en: 'Speak' },
			review: { es: 'Maestría', en: 'Mastery' },
			quiz: { es: 'Quiz', en: 'Quiz' }
		};
		return ($locale === 'es' ? map[t]?.es : map[t]?.en) ?? t;
	}

	const LEVEL_NAMES: Record<string, string> = {
		Survival: 'Survival',
		N5: 'JLPT N5',
		N4: 'JLPT N4',
		N3: 'JLPT N3',
		N2: 'JLPT N2',
		N1: 'JLPT N1'
	};

	type Seccion = {
		key: string;
		title_es: string;
		title_en: string;
		objective_es: string;
		objective_en: string;
		emoji: string;
		colorIdx: number;
		lessons: Array<Lesson & { unitId: string; unitTitle_es: string; unitTitle_en: string }>;
	};

	type Etapa = {
		level: string;
		index: number;
		secciones: Seccion[];
	};

	const SECTION_COLORS = [
		{ bg: '#5b8a72', glow: 'rgba(91,138,114,0.22)' },
		{ bg: '#5d7da3', glow: 'rgba(93,125,163,0.22)' },
		{ bg: '#8a7aa8', glow: 'rgba(138,122,168,0.22)' },
		{ bg: '#b88663', glow: 'rgba(184,134,99,0.22)' },
		{ bg: '#a87687', glow: 'rgba(168,118,135,0.22)' },
		{ bg: '#5b9b9b', glow: 'rgba(91,155,155,0.22)' }
	];

	const etapas = $derived.by<Etapa[]>(() => {
		const byLevel = new Map<string, RoadmapUnit[]>();
		const levelOrder: string[] = [];
		for (const u of units) {
			const lvl = (u as any).jlptLevel ?? 'Survival';
			if (!byLevel.has(lvl)) {
				byLevel.set(lvl, []);
				levelOrder.push(lvl);
			}
			byLevel.get(lvl)!.push(u);
		}
		let globalSeccIdx = 0;
		return levelOrder.map((lvl, idx) => {
			const lvlUnits = byLevel.get(lvl)!;
			const secciones: Seccion[] = [];
			for (const u of lvlUnits) {
				const valid = u.lessons.filter(lessonAvailable);
				if (valid.length === 0) continue;
				secciones.push({
					key: u.id,
					title_es: u.title_es,
					title_en: u.title_en,
					objective_es: u.objective_es,
					objective_en: u.objective_en,
					emoji: u.emoji,
					colorIdx: globalSeccIdx % SECTION_COLORS.length,
					lessons: valid.map((l) => ({
						...l,
						unitId: u.id,
						unitTitle_es: u.title_es,
						unitTitle_en: u.title_en
					}))
				});
				globalSeccIdx++;
			}
			return { level: lvl, index: idx, secciones };
		});
	});

	function seccionCompleted(s: Seccion): boolean {
		return s.lessons.length > 0 && s.lessons.every((l) => lessonCompleted(l));
	}

	function etapaCompleted(e: Etapa): boolean {
		return e.secciones.length > 0 && e.secciones.every((s) => seccionCompleted(s));
	}

	const unlockedSet = $derived.by(() => {
		const set = new Set<string>();
		let prevEtapaDone = true;
		for (const etapa of etapas) {
			if (!prevEtapaDone) break;
			let prevSeccionDone = true;
			for (const s of etapa.secciones) {
				if (!prevSeccionDone) break;
				if (s.lessons.length > 0) set.add(s.lessons[0].id);
				for (let i = 1; i < s.lessons.length; i++) {
					if (lessonCompleted(s.lessons[i - 1])) set.add(s.lessons[i].id);
					else break;
				}
				prevSeccionDone = seccionCompleted(s);
			}
			prevEtapaDone = etapaCompleted(etapa);
		}
		return set;
	});

	const flatLessons = $derived(etapas.flatMap((e) => e.secciones.flatMap((s) => s.lessons)));

	const currentLessonId = $derived.by(() => {
		const next = flatLessons.find((l) => !lessonCompleted(l) && unlockedSet.has(l.id));
		return next?.id ?? null;
	});

	function lessonState(l: Lesson): 'locked' | 'current' | 'completed' | 'available' {
		if (!unlockedSet.has(l.id)) return 'locked';
		if (lessonCompleted(l)) return 'completed';
		if (l.id === currentLessonId) return 'current';
		return 'available';
	}

	function seededOffset(id: string): number {
		let h = 0;
		for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
		const r = (Math.abs(h) % 1000) / 1000;
		return -26 + r * 52;
	}

	const NODE_SPACING = 95;
	const SECCION_BANNER_HEIGHT = 90;
	const PREVIEW_HEIGHT = 200;
	const TOP_PADDING = 24;

	type LayoutItem =
		| { kind: 'banner'; etapa: Etapa; seccion: Seccion; seccionIndex: number; y: number }
		| {
				kind: 'lesson';
				etapa: Etapa;
				seccion: Seccion;
				lesson: Lesson & { unitTitle_es: string; unitTitle_en: string };
				x: number;
				y: number;
		  }
		| { kind: 'preview'; etapa: Etapa; nextEtapa: Etapa; y: number };

	const layout = $derived.by(() => {
		const items: LayoutItem[] = [];
		let y = TOP_PADDING;
		let lockedReached = false;
		etapas.forEach((etapa, ei) => {
			if (lockedReached) return;
			const etapaUnlocked = etapa.secciones.some((s) =>
				s.lessons.some((l) => unlockedSet.has(l.id))
			);
			if (!etapaUnlocked && ei > 0) {
				items.push({ kind: 'preview', etapa: etapas[ei - 1], nextEtapa: etapa, y });
				lockedReached = true;
				return;
			}
			etapa.secciones.forEach((seccion, si) => {
				items.push({ kind: 'banner', etapa, seccion, seccionIndex: si, y });
				y += SECCION_BANNER_HEIGHT;
				let prevX = 50;
				seccion.lessons.forEach((l, li) => {
					let x = 50 + seededOffset(l.id);
					if (Math.abs(x - prevX) < 12) x = prevX > 50 ? 50 - 18 : 50 + 18;
					prevX = x;
					items.push({ kind: 'lesson', etapa, seccion, lesson: l, x, y });
					y += li === seccion.lessons.length - 1 ? NODE_SPACING - 30 : NODE_SPACING;
				});
			});
			if (etapaCompleted(etapa) && ei < etapas.length - 1) {
				items.push({ kind: 'preview', etapa, nextEtapa: etapas[ei + 1], y });
				y += PREVIEW_HEIGHT;
			} else if (!etapaCompleted(etapa) && ei < etapas.length - 1) {
				items.push({ kind: 'preview', etapa, nextEtapa: etapas[ei + 1], y });
				lockedReached = true;
			}
		});
		return { items, totalHeight: y + 80 };
	});

	const lessonCoords = $derived(
		layout.items.filter((i): i is Extract<LayoutItem, { kind: 'lesson' }> => i.kind === 'lesson')
	);

	const pathSegments = $derived.by(() => {
		const segments: string[] = [];
		const bySeccion = new Map<string, Extract<LayoutItem, { kind: 'lesson' }>[]>();
		for (const it of lessonCoords) {
			const k = `${it.etapa.level}:${it.seccion.key}`;
			if (!bySeccion.has(k)) bySeccion.set(k, []);
			bySeccion.get(k)!.push(it);
		}
		for (const [, list] of bySeccion) {
			if (list.length < 2) continue;
			let d = `M ${list[0].x} ${list[0].y}`;
			for (let i = 0; i < list.length - 1; i++) {
				const a = list[i];
				const b = list[i + 1];
				const midY = (a.y + b.y) / 2;
				d += ` C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
			}
			segments.push(d);
		}
		return segments;
	});

	let currentEtapa = $state<Etapa | null>(null);
	let currentSeccion = $state<Seccion | null>(null);

	onMount(() => {
		let lastLevel = '';
		const handleScroll = () => {
			if (!units.length) return;
			const banners = document.querySelectorAll('.seccion-banner');
			const threshold = 140;
			let activeEtapaKey = '';
			let activeSeccionKey = '';
			banners.forEach((el) => {
				const rect = el.getBoundingClientRect();
				if (rect.top <= threshold) {
					activeEtapaKey = el.getAttribute('data-etapa-key') || '';
					activeSeccionKey = el.getAttribute('data-seccion-key') || '';
				}
			});
			if (!activeEtapaKey && banners.length > 0) {
				activeEtapaKey = banners[0].getAttribute('data-etapa-key') || '';
				activeSeccionKey = banners[0].getAttribute('data-seccion-key') || '';
			}
			const e = etapas.find((x) => x.level === activeEtapaKey);
			const s = e?.secciones.find((x) => x.key === activeSeccionKey);
			if (e && s && (e.level !== currentEtapa?.level || s.key !== currentSeccion?.key)) {
				currentEtapa = e;
				currentSeccion = s;
				if (onLevelChange && e.level !== lastLevel) {
					lastLevel = e.level;
					onLevelChange(e.level);
				}
			}
		};

		tick().then(() => {
			handleScroll();
		});

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

	function handleLessonClick(l: Lesson) {
		const state = lessonState(l);
		if (state === 'locked') return;
		activeLessonId = activeLessonId === l.id ? null : l.id;
	}

	function startLesson(l: Lesson) {
		goto(`/learning/${l.id}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			activeLessonId = null;
			drawerOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="roadmap-wrapper"
	role="presentation"
	onclick={(e) => {
		if (e.target === e.currentTarget) activeLessonId = null;
	}}
>
	{#if etapas.length === 0}
		<div class="empty-state" in:fade>
			<p>{t('home.empty', $locale)}</p>
		</div>
	{:else}
		{#if currentEtapa && currentSeccion}
			{@const sc = SECTION_COLORS[currentSeccion.colorIdx]}
			{@const seccIdx = currentEtapa.secciones.findIndex((s) => s.key === currentSeccion?.key)}
			{@const deckId = currentSeccion.lessons[0]?.deckId}
			<div class="topic-card-wrapper">
				{#key currentEtapa.level + currentSeccion.key}
					<div
						class="topic-card"
						style="--accent: {sc.bg}; --accent-glow: {sc.glow};"
						in:fly={{ y: -6, duration: 280, easing: cubicOut }}
					>
						<div class="topic-emoji">{currentSeccion.emoji || '📚'}</div>
						<div class="topic-info">
							<div class="topic-eyebrow">
								{$locale === 'es' ? 'Etapa' : 'Stage'}
								{currentEtapa.index + 1}, {$locale === 'es' ? 'Sección' : 'Section'}
								{seccIdx + 1}
							</div>
							<div class="topic-title">
								{$locale === 'es' ? currentSeccion.title_es : currentSeccion.title_en}
							</div>
						</div>
						{#if deckId}
							<button
								class="topic-action"
								aria-label="Palabras clave"
								onclick={() => openVocabDrawer(deckId, currentSeccion!)}
							>
								<Icon icon={AlphabetJapaneseIcon} size={20} color="currentColor" />
							</button>
						{/if}
					</div>
				{/key}
			</div>
		{/if}

		{#if activeLessonId}
			<button
				class="popover-backdrop"
				onclick={() => (activeLessonId = null)}
				aria-label="Cerrar"
				in:fade={{ duration: 150 }}
				out:fade={{ duration: 100 }}
			></button>
		{/if}

		<div class="roadmap-container" style="height: {layout.totalHeight}px">
			<svg
				class="roadmap-svg"
				viewBox="0 0 100 {layout.totalHeight}"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				{#each pathSegments as d, i (i)}
					<path {d} class="roadmap-path" />
				{/each}
			</svg>

			{#each layout.items as item, idx (item.kind === 'lesson' ? `l-${item.lesson.id}` : item.kind === 'banner' ? `b-${item.etapa.level}-${item.seccion.key}` : `p-${item.nextEtapa.level}`)}
				{#if item.kind === 'banner'}
					<div
						class="seccion-banner"
						style="top: {item.y}px;"
						data-etapa-key={item.etapa.level}
						data-seccion-key={item.seccion.key}
						use:fadeUp={{ delay: Math.min(idx * 0.015, 0.25), y: 10 }}
					>
						<div class="seccion-line-row">
							<span class="seccion-line"></span>
							<span class="seccion-desc">
								{$locale === 'es' ? item.seccion.objective_es : item.seccion.objective_en}
							</span>
							<span class="seccion-line"></span>
						</div>
					</div>
				{:else if item.kind === 'preview'}
					<div
						class="etapa-preview-wrap"
						style="top: {item.y}px;"
						use:fadeUp={{ delay: Math.min(idx * 0.015, 0.25), y: 12 }}
					>
						<div class="etapa-preview-card">
							<div class="preview-eyebrow">
								{$locale === 'es' ? '¿QUÉ SIGUE DESPUÉS?' : 'WHAT IS NEXT?'}
							</div>
							<div class="preview-row">
								<Icon icon={LockIcon} size={18} />
								<span class="preview-title">
									{$locale === 'es' ? 'Etapa' : 'Stage'}
									{item.nextEtapa.index + 1}: {LEVEL_NAMES[item.nextEtapa.level] ??
										item.nextEtapa.level}
								</span>
							</div>
							<div class="preview-desc">
								{item.nextEtapa.secciones[0]
									? $locale === 'es'
										? item.nextEtapa.secciones[0].objective_es
										: item.nextEtapa.secciones[0].objective_en
									: ''}
							</div>
						</div>
					</div>
				{:else}
					{@const state = lessonState(item.lesson)}
					{@const isActive = activeLessonId === item.lesson.id}
					{@const lPct = lessonProgressPct(item.lesson)}
					{@const iconState =
						state === 'completed' ? 'completed' : state === 'locked' ? 'neutral' : 'active'}
					<div
						class="node-anchor"
						class:is-active={isActive}
						style="left: {item.x}%; top: {item.y}px;"
						data-id={item.lesson.id}
					>
						<button
							class="node-tile"
							class:is-locked={state === 'locked'}
							class:is-completed={state === 'completed'}
							class:is-current={state === 'current'}
							class:is-active={isActive}
							onclick={() => handleLessonClick(item.lesson)}
							disabled={state === 'locked'}
							aria-label="{item.lesson.title_es} — {state}"
							aria-expanded={isActive}
							use:fadeUp={{ delay: Math.min(idx * 0.015, 0.25), y: 10 }}
						>
							{#if state !== 'locked' && state !== 'completed' && lPct > 0}
								<svg class="progress-ring" viewBox="0 0 100 100" aria-hidden="true">
									<circle class="ring-bg" cx="50" cy="50" r="46" />
									<circle
										class="ring-fill"
										cx="50"
										cy="50"
										r="46"
										style:stroke-dasharray="{(lPct / 100) * 289} 289"
									/>
								</svg>
							{/if}
							<div class="tile-content">
								{#if state === 'locked'}
									<div class="lock-icon-wrap">
										<Icon icon={LockIcon} size={22} />
									</div>
								{:else}
									<UnitIcon
										state={iconState}
										size={28}
										color={state === 'current' || state === 'completed' ? 'white' : undefined}
									/>
								{/if}
							</div>
						</button>

						{#if isActive}
							{@const shift = item.x < 30 ? -20 : item.x > 70 ? -80 : -50}
							<div
								class="lesson-popover-wrapper"
								style="transform: translateX({shift}%);"
								role="dialog"
							>
								<div
									class="lesson-popover"
									in:fly={{ y: 8, duration: 350, easing: quintOut }}
									out:fade={{ duration: 150 }}
								>
									<div class="popover-type">
										{lessonTypeLabel(item.lesson.type)} · {$locale === 'es'
											? item.lesson.unitTitle_es
											: item.lesson.unitTitle_en}
									</div>
									<button
										class="popover-btn"
										class:is-completed={state === 'completed'}
										onclick={() => startLesson(item.lesson)}
									>
										<span>
											{state === 'completed'
												? $locale === 'es'
													? 'Repasar'
													: 'Review'
												: state === 'current'
													? $locale === 'es'
														? 'Continuar'
														: 'Continue'
													: $locale === 'es'
														? 'Empezar'
														: 'Start'}
										</span>
										<span class="xp-badge">+{state === 'completed' ? 5 : 15} XP</span>
									</button>
									<div class="popover-arrow" style="left: {-shift}%"></div>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<ResponsiveModal
	bind:open={drawerOpen}
	title={drawerSeccion ? ($locale === 'es' ? drawerSeccion.title_es : drawerSeccion.title_en) : ''}
	description={$locale === 'es' ? 'Vocabulario clave de esta sección' : 'Key vocabulary for this section'}
>
		<div class="drawer-body-premium">
			{#if drawerLoading}
				<div class="drawer-loading">
					<DotLoader color="var(--hinomaru-red)" />
				</div>
			{:else if drawerCards.length === 0}
				<div class="drawer-empty">
					{$locale === 'es' ? 'Sin palabras todavía.' : 'No words yet.'}
				</div>
			{:else}
				<div class="vocab-list">
					{#each drawerCards as c, idx (c.id)}
						{@const rom = safeRomaji(c.romaji, c.jp || c.kana)}
						<div
							class="vocab-item-premium"
							use:fadeUp={{ delay: 0.05 * Math.min(idx, 8), y: 12 }}
						>
							<div class="vocab-main">
								<div class="vocab-jp-premium">
									<span class="jp">{c.jp || c.kanji || c.kana || ''}</span>
								</div>
								<div class="vocab-details">
									{#if c.kana && c.kana !== c.jp}
										<span class="vocab-kana-tag">{c.kana}</span>
									{/if}
									{#if rom}
										<span class="vocab-romaji-premium">{rom}</span>
									{/if}
									<span class="vocab-translation-premium">
										{$locale === 'es'
											? c.es || c.translation_es || ''
											: c.en || c.translation_en || ''}
									</span>
								</div>
							</div>
							<button
								class="vocab-speak-btn"
								aria-label="Reproducir"
								onclick={() => speakJapanese(c.jp || c.kana || '')}
							>
								<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
</ResponsiveModal>

<style>
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
		stroke: var(--ink-300);
		stroke-width: 2;
		stroke-dasharray: 4 8;
		stroke-linecap: round;
		vector-effect: non-scaling-stroke;
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
		z-index: 50;
		padding: 0 12px;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.topic-card {
		--accent: #10b981;
		--accent-glow: rgba(16, 185, 129, 0.32);
		background: var(--accent);
		border: none;
		border-radius: 99px;
		padding: 8px 8px 8px 18px;
		display: flex;
		align-items: center;
		gap: 12px;
		pointer-events: auto;
		width: 100%;
		max-width: 480px;
		box-shadow: 0 6px 22px var(--accent-glow);
		transition: all 0.4s ease;
	}

	.topic-emoji {
		font-size: 22px;
		line-height: 1;
		flex-shrink: 0;
	}

	.topic-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		text-align: left;
	}

	.topic-eyebrow {
		font-size: 9px;
		font-weight: 900;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.78);
		line-height: 1;
	}

	.topic-title {
		font-size: 14px;
		font-weight: 800;
		color: white;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.2;
	}

	.topic-action {
		flex-shrink: 0;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.22);
		color: white;
		border: none;
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.2s;
		text-decoration: none;
	}

	.topic-action:hover {
		background: rgba(255, 255, 255, 0.32);
		transform: scale(1.06);
	}

	.topic-action:active {
		transform: scale(0.94);
	}

	.seccion-banner {
		position: absolute;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		padding: 16px 24px;
		pointer-events: none;
		z-index: 5;
	}

	.seccion-line-row {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		max-width: 480px;
	}

	.seccion-line {
		flex: 1;
		height: 1px;
		background: var(--ink-200);
		min-width: 16px;
	}

	.seccion-desc {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: lowercase;
		text-align: center;
		flex-shrink: 1;
		padding: 0 4px;
	}

	.etapa-preview-wrap {
		position: absolute;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		padding: 24px;
		pointer-events: none;
		z-index: 5;
	}

	.etapa-preview-card {
		width: 100%;
		max-width: 380px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 20px;
		padding: 20px 22px;
		text-align: center;
		opacity: 0.92;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
	}

	.preview-eyebrow {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: -0.04em;
		color: var(--fg-tertiary);
		margin-bottom: 12px;
		background: var(--ink-100);
		display: inline-block;
		padding: 4px 12px;
		border-radius: 99px;
	}

	.preview-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		color: var(--fg-secondary);
		margin-bottom: 10px;
	}

	.preview-title {
		font-size: 17px;
		font-weight: 900;
		color: var(--fg-secondary);
	}

	.preview-desc {
		font-size: 13px;
		color: var(--fg-tertiary);
		line-height: 1.45;
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

	.node-tile {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		padding: 0;
		cursor: pointer;
		position: relative;
		display: grid;
		place-items: center;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
	}

	.tile-content {
		display: grid;
		place-items: center;
	}

	.lock-icon-wrap {
		color: var(--ink-400);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.progress-ring {
		position: absolute;
		inset: -8px;
		width: calc(100% + 16px);
		height: calc(100% + 16px);
		transform: rotate(-90deg);
		pointer-events: none;
	}

	.ring-bg {
		fill: none;
		stroke: var(--ink-100);
		stroke-width: 4;
	}

	.ring-fill {
		fill: none;
		stroke: #10b981;
		stroke-width: 6;
		stroke-linecap: round;
		transition: stroke-dasharray 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@media (hover: hover) {
		.node-tile:not(.is-locked):not(.is-completed):not(.is-current):hover {
			transform: translateY(-3px);
			box-shadow:
				0 7px 0 0 var(--ink-300),
				0 10px 20px rgba(0, 0, 0, 0.15);
		}
		.node-tile.is-completed:hover {
			transform: translateY(-3px);
			box-shadow:
				0 0 0 4px rgba(232, 165, 42, 0.22),
				0 14px 30px rgba(232, 165, 42, 0.42);
		}
		.node-tile.is-current:hover {
			transform: translateY(-3px);
			box-shadow:
				0 0 0 4px rgba(16, 185, 129, 0.22),
				0 14px 30px rgba(16, 185, 129, 0.42);
		}
	}

	.node-tile:not(.is-locked):not(.is-completed):not(.is-current):active {
		transform: translateY(3px);
		box-shadow:
			0 1px 0 0 var(--ink-300),
			0 2px 6px rgba(0, 0, 0, 0.08);
	}

	.node-tile.is-completed:active,
	.node-tile.is-current:active {
		transform: translateY(1px) scale(0.98);
	}

	.node-tile.is-locked {
		background: linear-gradient(135deg, var(--ink-100) 0%, var(--ink-200) 100%);
		border: none;
		cursor: not-allowed;
		box-shadow:
			0 0 0 4px rgba(0, 0, 0, 0.04),
			0 4px 12px rgba(0, 0, 0, 0.06);
	}

	.node-tile.is-current {
		border: none;
		background: linear-gradient(135deg, #34d399 0%, #059669 100%);
		box-shadow:
			0 0 0 4px rgba(16, 185, 129, 0.18),
			0 8px 24px rgba(16, 185, 129, 0.32);
		animation: node-pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
	}

	.node-tile.is-completed {
		background: linear-gradient(135deg, #f6c453 0%, #ed8a19 100%);
		border: none;
		box-shadow:
			0 0 0 4px rgba(232, 165, 42, 0.18),
			0 8px 24px rgba(232, 165, 42, 0.32);
		color: white;
	}

	@keyframes node-pulse {
		0% {
			box-shadow:
				0 0 0 4px rgba(16, 185, 129, 0.18),
				0 8px 24px rgba(16, 185, 129, 0.32);
		}
		70% {
			box-shadow:
				0 0 0 12px rgba(16, 185, 129, 0),
				0 8px 24px rgba(16, 185, 129, 0.32);
		}
		100% {
			box-shadow:
				0 0 0 4px rgba(16, 185, 129, 0.18),
				0 8px 24px rgba(16, 185, 129, 0.32);
		}
	}

	.lesson-popover-wrapper {
		position: absolute;
		top: 110%;
		left: 50%;
		width: 200px;
		z-index: 90;
		pointer-events: none;
	}

	.lesson-popover {
		width: 100%;
		background: rgba(255, 255, 255, 0.96);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 16px;
		padding: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		pointer-events: auto;
		text-align: center;
	}

	:global([data-theme='dark']) .lesson-popover {
		background: rgba(30, 30, 35, 0.98) !important;
		border-color: rgba(255, 255, 255, 0.15) !important;
		box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5) !important;
	}

	.popover-type {
		font-size: 9px;
		font-weight: 900;
		letter-spacing: -0.02em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
		margin-bottom: 6px;
		line-height: 1.2;
	}

	.popover-btn {
		width: 100%;
		height: 36px;
		border-radius: 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 12px;
		background: #10b981;
		color: white;
		border: none;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
		font-family: inherit;
		font-size: 12px;
		font-weight: 800;
		cursor: pointer;
	}

	.popover-btn.is-completed {
		background: linear-gradient(135deg, #f6c453 0%, #ed8a19 100%);
		box-shadow: 0 4px 14px rgba(232, 165, 42, 0.32);
	}

	.popover-btn:active {
		transform: scale(0.97);
	}

	.xp-badge {
		font-size: 9px;
		font-weight: 800;
		background: rgba(255, 255, 255, 0.2);
		padding: 2px 6px;
		border-radius: 6px;
	}

	.popover-arrow {
		position: absolute;
		top: -6px;
		width: 12px;
		height: 12px;
		background: rgba(255, 255, 255, 0.96);
		backdrop-filter: blur(12px);
		transform: translateX(-50%) rotate(45deg);
		border-top: 1px solid rgba(0, 0, 0, 0.08);
		border-left: 1px solid rgba(0, 0, 0, 0.08);
		z-index: -1;
	}

	:global([data-theme='dark']) .popover-arrow {
		background: rgba(30, 30, 35, 0.98) !important;
		border-color: rgba(255, 255, 255, 0.15) !important;
	}

	.empty-state {
		text-align: center;
		padding: 80px 20px;
		color: var(--fg-secondary);
	}

	@media (max-width: 600px) {
		.roadmap-wrapper {
			max-width: 100%;
		}
	}

	/* ── PREMIUM VOCAB STYLES ── */
	.drawer-body-premium {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-bottom: 24px;
	}

	.vocab-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.vocab-item-premium {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: var(--shadow-sm);
	}

	@media (hover: hover) {
		.vocab-item-premium:hover {
			border-color: var(--hinomaru-red);
			transform: translateY(-2px);
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
		}
	}

	.vocab-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.vocab-jp-premium {
		font-family: var(--font-jp);
		font-size: 22px;
		font-weight: 800;
		color: var(--fg-primary);
		line-height: 1.1;
	}

	.vocab-details {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.vocab-kana-tag {
		font-size: 10px;
		font-weight: 800;
		color: var(--fg-secondary);
		background: var(--bg-muted);
		padding: 2px 8px;
		border-radius: 6px;
		letter-spacing: -0.01em;
		text-transform: uppercase;
	}

	.vocab-romaji-premium {
		font-size: 12px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.vocab-translation-premium {
		font-size: 15px;
		color: var(--fg-secondary);
		font-weight: 600;
	}

	.vocab-speak-btn {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--sumi);
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
	}

	.vocab-speak-btn:active {
		transform: scale(0.92);
		background: var(--ink-50);
	}

	.drawer-loading {
		display: flex;
		justify-content: center;
		padding: 60px 0;
	}

	.drawer-empty {
		text-align: center;
		padding: 60px 0;
		color: var(--fg-tertiary);
		font-size: 16px;
		font-weight: 500;
	}
</style>
