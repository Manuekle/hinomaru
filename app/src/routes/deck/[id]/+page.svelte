<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, staggerChildren, fadeIn } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import {
		Cards02Icon,
		Target01Icon,
		KeyboardIcon,
		PencilEdit01Icon,
		PuzzleIcon,
		Certificate01Icon
	} from '@hugeicons/core-free-icons';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const deck = $derived(data.deck);
	const pct = $derived(
		deck.card_count > 0 ? Math.round(((deck.learned ?? 0) / deck.card_count) * 100) : 0
	);

	const modes = [
		{
			id: 'flashcards',
			titleKey: 'mode.flashcards.title',
			descKey: 'mode.flashcards.desc',
			icon: Cards02Icon
		},
		{ id: 'quiz', titleKey: 'mode.quiz.title', descKey: 'mode.quiz.desc', icon: Target01Icon },
		{ id: 'type', titleKey: 'mode.type.title', descKey: 'mode.type.desc', icon: KeyboardIcon },
		{
			id: 'write',
			titleKey: 'mode.write.title',
			descKey: 'mode.write.desc',
			icon: PencilEdit01Icon
		},
		{ id: 'match', titleKey: 'mode.match.title', descKey: 'mode.match.desc', icon: PuzzleIcon },
		{ id: 'exam', titleKey: 'mode.exam.title', descKey: 'mode.exam.desc', icon: Certificate01Icon }
	];
</script>

<div
	style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));"
>
	<a
		use:fadeIn={{ delay: 0 }}
		href="/"
		class="back-link"
	>
		← {t('deck.back', $locale)}
	</a>

	<!-- Pills -->
	<div use:fadeUp={{ delay: 0.04, y: 10 }} style="display:flex;gap:8px;margin-bottom:16px;">
		<span class="hm-pill hm-pill-red">{deck.level}</span>
		<span class="hm-pill hm-pill-ink"
			>{$locale === 'es' ? (deck.kind_es ?? deck.kind) : deck.kind}</span
		>
	</div>

	<!-- Title -->
	<h1
		use:fadeUp={{ delay: 0.1, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;"
	>
		{$locale === 'es' ? deck.title_es : deck.title_en}
	</h1>

	<p
		use:fadeUp={{ delay: 0.15, y: 12 }}
		style="font-size:18px;color:var(--fg-secondary);margin:0;line-height:1.55;"
	>
		{$locale === 'es' ? deck.desc_es : deck.desc_en}
	</p>

	<!-- Progress bar -->
	<div use:fadeUp={{ delay: 0.2, y: 10 }} style="margin-top:28px;">
		<div class="hm-progress" style="height:6px;">
			<div class="hm-progress-bar" style="width:{pct}%;height:6px;"></div>
		</div>
		<div style="display:flex;justify-content:space-between;margin-top:10px;" class="label-meta">
			<span>{t('deck.learnedN', $locale, { n: deck.learned ?? 0 })}</span>
			<span>{t('deck.toGo', $locale, { n: deck.card_count - (deck.learned ?? 0) })}</span>
		</div>
	</div>

	<!-- Mode list with stagger -->
	<div class="label-meta" use:fadeIn={{ delay: 0.28 }} style="margin-top:48px;margin-bottom:12px;">
		{t('deck.chooseMode', $locale)}
	</div>

	<div
		use:staggerChildren={{ delay: 0.3, stagger: 0.08, y: 12 }}
		style="display:flex;flex-direction:column;gap:10px;"
	>
		{#each modes as mode (mode.id)}
			<a
				href={mode.id === 'stories/today' ? '/deck/stories/today' : `/deck/${deck.id}/${mode.id}`}
				class="mode-card"
			>
				<div class="mode-icon-box">
					<Icon icon={mode.icon} size={20} strokeWidth={1.5} color="currentColor" />
				</div>
				<div style="flex:1;">
					<div style="font-size:16px;font-weight:600;">{t(mode.titleKey, $locale)}</div>
					<div style="font-size:13px;color:var(--fg-secondary);">{t(mode.descKey, $locale)}</div>
				</div>
				<span style="color:var(--fg-tertiary);">→</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		margin-bottom: 32px;
		transition: color 150ms ease;
		touch-action: manipulation;
	}

	.mode-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 18px;
		display: flex;
		align-items: center;
		gap: 16px;
		text-decoration: none;
		color: inherit;
		transition: box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.mode-card:active {
		transform: translateX(2px) scale(0.99);
		box-shadow: var(--shadow-sm);
	}

	@media (hover: hover) {
		.back-link:hover { color: var(--sumi); }
		.mode-card:hover {
			box-shadow: var(--shadow-md);
			transform: translateX(4px);
			border-color: var(--ink-300);
		}
	}

	.mode-icon-box {
		width: 40px;
		height: 40px;
		background: var(--ink-100);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--sumi);
	}
</style>
