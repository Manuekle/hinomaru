<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import {
		BookOpen02Icon,
		HelpSquareIcon,
		RepeatIcon,
		Mic01Icon,
		Cancel01Icon,
		Clock01Icon,
		FileEditIcon
	} from '@hugeicons/core-free-icons';
	import type { LessonType } from '$lib/data/roadmap';

	interface PreviewLesson {
		id: string;
		type: LessonType;
		deckId: string;
		title_es: string;
		title_en: string;
		goal_es: string;
		goal_en: string;
		progress: { learned: number; total: number; pct: number };
	}

	const props: { lesson: PreviewLesson; onClose: () => void } = $props();
	const lesson = $derived(props.lesson);

	const typeIcon: Record<LessonType, any> = {
		learn: BookOpen02Icon,
		quiz: HelpSquareIcon,
		review: RepeatIcon,
		speak: Mic01Icon
	};
	// Single accent color across all lesson types — visual unity with rest of app.
	const typeColor: Record<LessonType, string> = {
		learn: 'var(--hinomaru-red)',
		quiz: 'var(--hinomaru-red)',
		review: 'var(--hinomaru-red)',
		speak: 'var(--hinomaru-red)'
	};
	const typeLabelEs: Record<LessonType, string> = {
		learn: 'Aprender',
		quiz: 'Quiz',
		review: 'Repaso',
		speak: 'Hablar'
	};
	const typeLabelEn: Record<LessonType, string> = {
		learn: 'Learn',
		quiz: 'Quiz',
		review: 'Review',
		speak: 'Speak'
	};

	function start() {
		goto(`/learning/${lesson.id}`);
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') props.onClose();
	}

	function stopProp(e: MouseEvent) {
		e.stopPropagation();
	}
</script>

<svelte:window onkeydown={onKey} />

<div
	class="lp-backdrop"
	transition:fade={{ duration: 180 }}
	onclick={props.onClose}
	role="presentation"
></div>
<div
	class="lp-sheet"
	transition:fly={{ y: 400, duration: 320, easing: cubicOut }}
	style="--lp-color: {typeColor[lesson.type]}"
	onclick={stopProp}
	role="dialog"
	aria-modal="true"
>
	<button class="lp-close" onclick={props.onClose} aria-label="Cerrar">
		<Icon icon={Cancel01Icon} size={20} color="var(--fg-tertiary)" />
	</button>

	<div class="lp-handle"></div>

	<div class="lp-icon">
		<Icon icon={typeIcon[lesson.type]} size={36} color="white" />
	</div>

	<div class="lp-type-tag">
		{$locale === 'es' ? typeLabelEs[lesson.type] : typeLabelEn[lesson.type]}
	</div>

	<h2 class="lp-title">{$locale === 'es' ? lesson.title_es : lesson.title_en}</h2>
	<p class="lp-goal">🎯 {$locale === 'es' ? lesson.goal_es : lesson.goal_en}</p>

	<div class="lp-stats">
		<div class="lp-stat">
			<Icon icon={FileEditIcon} size={18} color="var(--fg-tertiary)" />
			<span>{lesson.progress.total} {$locale === 'es' ? 'cartas' : 'cards'}</span>
		</div>
		<div class="lp-stat">
			<Icon icon={Clock01Icon} size={18} color="var(--fg-tertiary)" />
			<span>~{Math.max(2, Math.ceil(lesson.progress.total * 0.5))} min</span>
		</div>
		<div class="lp-stat">
			<span class="lp-xp">+{lesson.progress.total * 5} XP</span>
		</div>
	</div>

	{#if lesson.progress.total > 0}
		<div class="lp-progress-wrap">
			<div class="lp-progress-row">
				<span>{$locale === 'es' ? 'Progreso' : 'Progress'}</span>
				<span>{lesson.progress.learned} / {lesson.progress.total}</span>
			</div>
			<div class="lp-bar">
				<div class="lp-bar-fill" style="width: {lesson.progress.pct}%"></div>
			</div>
		</div>
	{/if}

	<button class="lp-cta" onclick={start}>
		{lesson.progress.learned > 0
			? $locale === 'es'
				? 'Continuar lección'
				: 'Continue lesson'
			: $locale === 'es'
				? 'Empezar lección'
				: 'Start lesson'}
	</button>
</div>

<style>
	.lp-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 100;
	}
	.lp-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		max-width: 480px;
		margin: 0 auto;
		background: var(--bg-surface);
		border-radius: 28px 28px 0 0;
		padding: 28px 24px calc(32px + env(safe-area-inset-bottom));
		z-index: 101;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
	}
	.lp-close {
		position: absolute;
		top: 16px;
		right: 16px;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--ink-100);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.lp-handle {
		width: 36px;
		height: 4px;
		background: var(--ink-200);
		border-radius: 99px;
		margin-bottom: 18px;
	}
	.lp-icon {
		width: 76px;
		height: 76px;
		border-radius: 24px;
		background: var(--lp-color);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 12px;
		box-shadow:
			0 6px 0 color-mix(in srgb, var(--lp-color) 60%, black),
			var(--shadow-md);
	}
	.lp-type-tag {
		font-size: 11px;
		font-weight: 800;
		letter-spacing: -0.04em;
		color: var(--lp-color);
		margin-bottom: 4px;
	}
	.lp-title {
		margin: 0 0 8px;
		font-size: 22px;
		font-weight: 800;
		color: var(--sumi);
		letter-spacing: -0.02em;
	}
	.lp-goal {
		margin: 0 0 20px;
		font-size: 14px;
		color: var(--fg-secondary);
		max-width: 320px;
		line-height: 1.4;
	}
	.lp-stats {
		display: flex;
		gap: 18px;
		padding: 14px 18px;
		background: var(--ink-50);
		border-radius: 16px;
		margin-bottom: 20px;
	}
	.lp-stat {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-secondary);
	}
	.lp-xp {
		color: var(--lp-color);
		font-weight: 800;
	}
	.lp-progress-wrap {
		width: 100%;
		margin-bottom: 20px;
	}
	.lp-progress-row {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-tertiary);
		margin-bottom: 6px;
	}
	.lp-bar {
		height: 8px;
		background: var(--ink-100);
		border-radius: 99px;
		overflow: hidden;
	}
	.lp-bar-fill {
		height: 100%;
		background: var(--lp-color);
		border-radius: 99px;
	}
	.lp-cta {
		width: 100%;
		padding: 16px;
		background: var(--lp-color);
		color: white;
		font-size: 15px;
		font-weight: 800;
		border: none;
		border-radius: 16px;
		cursor: pointer;
		box-shadow: 0 6px 0 color-mix(in srgb, var(--lp-color) 60%, black);
		transition: transform 0.1s;
	}
	.lp-cta:active {
		transform: translateY(4px);
		box-shadow: 0 2px 0 color-mix(in srgb, var(--lp-color) 60%, black);
	}
</style>
