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
		DocumentValidationIcon
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
			icon: Cards02Icon,
			color: '#ff2d55'
		},
		{
			id: 'quiz',
			titleKey: 'mode.quiz.title',
			descKey: 'mode.quiz.desc',
			icon: Target01Icon,
			color: '#007aff'
		},
		{
			id: 'type',
			titleKey: 'mode.type.title',
			descKey: 'mode.type.desc',
			icon: KeyboardIcon,
			color: '#ff9500'
		},
		{
			id: 'write',
			titleKey: 'mode.write.title',
			descKey: 'mode.write.desc',
			icon: PencilEdit01Icon,
			color: '#af52de'
		},
		{
			id: 'match',
			titleKey: 'mode.match.title',
			descKey: 'mode.match.desc',
			icon: PuzzleIcon,
			color: '#34c759'
		},
		{
			id: 'exam',
			titleKey: 'mode.exam.title',
			descKey: 'mode.exam.desc',
			icon: DocumentValidationIcon,
			color: '#ff3b30'
		}
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
				<div class="mode-icon-box" style="background: {mode.color}14; color: {mode.color};">
					<Icon icon={mode.icon} size={20} strokeWidth={1.8} color="currentColor" />
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
		border: 1.5px solid var(--ink-200);
		border-radius: 20px;
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 16px;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		box-shadow: var(--shadow-sm);
	}

	.mode-card:active {
		transform: scale(0.98);
		background: var(--ink-50);
	}

	@media (hover: hover) {
		.back-link:hover { color: var(--sumi); }
		.mode-card:hover {
			box-shadow: var(--shadow-md);
			transform: translateY(-2px);
			border-color: var(--ink-300);
			background: var(--bg-surface);
		}
	}

	:global([data-theme='dark']) .mode-card {
		background: var(--ink-100);
		border-color: var(--ink-200);
	}

	:global([data-theme='dark']) .mode-card:hover {
		background: var(--ink-200);
		border-color: var(--ink-300);
	}

	.mode-icon-box {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
</style>
