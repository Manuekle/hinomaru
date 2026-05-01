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
		DocumentValidationIcon,
		AlertCircleIcon,
		Mic01Icon
	} from '@hugeicons/core-free-icons';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import ResponsiveModal from '$lib/components/ui/ResponsiveModal.svelte';

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
		},
		{
			id: 'speaking',
			titleKey: 'mode.speaking.title',
			descKey: 'mode.speaking.desc',
			icon: Mic01Icon,
			color: '#bc002d'
		}
	];

	let showConfirmModal = $state(false);
	let pendingUrl = $state<string | null>(null);

	function openConfirm(url: string) {
		pendingUrl = url;
		showConfirmModal = true;
	}

	function handleConfirm() {
		if (pendingUrl) goto(pendingUrl);
		showConfirmModal = false;
	}
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
	<div use:fadeUp={{ delay: 0.05, y: 8 }} style="display:flex;gap:8px;margin-bottom:16px;">
		<span class="hm-pill hm-pill-red">{deck.level}</span>
		<span class="hm-pill hm-pill-ink"
			>{$locale === 'es' ? (deck.kind_es ?? deck.kind) : deck.kind}</span
		>
	</div>

	<!-- Title -->
	<h1
		use:fadeUp={{ delay: 0.1, y: 12 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;"
	>
		{$locale === 'es' ? deck.title_es : deck.title_en}
	</h1>

	<p
		use:fadeUp={{ delay: 0.15, y: 10 }}
		style="font-size:18px;color:var(--fg-secondary);margin:0;line-height:1.55;"
	>
		{$locale === 'es' ? deck.desc_es : deck.desc_en}
	</p>

	<!-- Progress bar -->
	<div use:fadeUp={{ delay: 0.2, y: 8 }} style="margin-top:28px;">
		<div class="hm-progress" style="height:6px;">
			<div class="hm-progress-bar" style="width:{pct}%;height:6px;"></div>
		</div>
		<div style="display:flex;justify-content:space-between;margin-top:10px;" class="label-meta">
			<span>{t('deck.learnedN', $locale, { n: deck.learned ?? 0 })}</span>
			<span>{t('deck.toGo', $locale, { n: deck.card_count - (deck.learned ?? 0) })}</span>
		</div>
	</div>

	<!-- Mode list with stagger -->
	<div class="list" style="margin-top:48px;" use:staggerChildren={{ delay: 0.3, stagger: 0.06, y: 8 }}>
		{#each modes as mode (mode.id)}
			<button
				class="row"
				onclick={() => {
					const url = mode.id === 'stories/today' ? '/deck/stories/today' : `/deck/${deck.id}/${mode.id}`;
					if (mode.id === 'exam') {
						openConfirm(url);
					} else {
						goto(url);
					}
				}}
			>
				<div class="row-icon-box">
					<Icon icon={mode.icon} size={15} strokeWidth={2.5} color="currentColor" />
				</div>

				<div class="row-body">
					<div class="row-top">
						<span class="row-title">{t(mode.titleKey, $locale)}</span>
					</div>
					<div class="row-sub">{t(mode.descKey, $locale)}</div>
				</div>

				<div class="row-right">
					<span class="row-arrow">→</span>
				</div>
			</button>
		{/each}
	</div>
</div>

{#snippet confirmIcon()}
	<Icon icon={AlertCircleIcon} size={32} color="var(--hinomaru-red)" />
{/snippet}

<ResponsiveModal
	bind:open={showConfirmModal}
	title={t('exam.start_confirm_title', $locale) || 'Ready to start?'}
	description={t('exam.start_confirm', $locale)}
	icon={confirmIcon}
>
	{#snippet actions()}
		<button class="modal-btn-cancel" onclick={() => (showConfirmModal = false)}>{t('common.cancel', $locale)}</button>
		<button class="modal-btn-confirm" onclick={handleConfirm}>{t('exam.start_now', $locale)}</button>
	{/snippet}
</ResponsiveModal>

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

	.list {
		display: flex;
		flex-direction: column;
	}

	.row {
		display: flex;
		align-items: flex-start;
		gap: 20px;
		padding: 24px 0;
		border-bottom: 1px solid var(--ink-100);
		background: none;
		border-left: none;
		border-right: none;
		border-top: none;
		border-radius: 4px;
		color: inherit;
		font-family: inherit;
		text-align: left;
		width: 100%;
		cursor: pointer;
		transition: background 150ms ease;
		-webkit-tap-highlight-color: transparent;
	}

	.row:first-child {
		border-top: 1px solid var(--ink-100);
	}

	@media (hover: hover) {
		.back-link:hover {
			color: var(--sumi);
		}
		.row:hover .row-title {
			color: var(--hinomaru-red);
		}
		.row:hover .row-arrow {
			color: var(--hinomaru-red);
			transform: translateX(3px);
		}
	}

	.row:active .row-title {
		color: var(--hinomaru-red);
	}

	.row:active .row-arrow {
		color: var(--hinomaru-red);
		transform: scale(0.9) translateX(2px);
	}

	.row-icon-box {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 2px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}

	.row-body {
		flex: 1;
		min-width: 0;
	}

	.row-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 3px;
	}

	.row-title {
		font-size: 17px;
		font-weight: 600;
		color: var(--fg-primary);
		line-height: 1.2;
		transition: color 150ms;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.row-sub {
		font-size: 13px;
		color: var(--fg-tertiary);
		line-height: 1.4;
	}

	.row-right {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		padding-top: 4px;
	}

	.row-arrow {
		font-size: 16px;
		color: var(--fg-tertiary);
		transition:
			color 150ms,
			transform 150ms;
	}
</style>
