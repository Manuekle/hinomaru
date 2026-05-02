<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { goto } from '$app/navigation';
	import { fadeUp } from '$lib/motion';

	let { 
		totalCards = 0, 
		learnedCount = 0,
		sessionCount = 0, 
		deckId = '', 
		modeLabel = '' 
	} = $props<{
		totalCards: number;
		learnedCount: number;
		sessionCount: number;
		deckId: string;
		modeLabel: string;
	}>();

	const isAllLearned = $derived(totalCards > 0 && learnedCount >= totalCards);
	const isNothingDue = $derived(totalCards > 0 && learnedCount < totalCards && sessionCount === 0);
	const isEmpty = $derived(totalCards === 0);

	function goBack() {
		goto(`/deck/${deckId}`);
	}
</script>

<div class="empty-state-layout">
	<div use:fadeUp={{ delay: 0.1, y: 20 }}>
		<div class="empty-icon-hero">
			{#if isEmpty}
				<div class="icon-circle ghost">📭</div>
			{:else if isAllLearned}
				<div style="font-size: 80px; line-height: 1; margin-bottom: 8px;">🎉</div>
			{:else}
				<div class="icon-circle info">☕</div>
			{/if}
		</div>

		<h2 class="empty-title" class:is-completed={isAllLearned}>
			{#if isEmpty}
				{t('deck.empty', $locale)}
			{:else if isAllLearned}
				{t('deck.all_learned', $locale)}
			{:else}
				{t('deck.nothing_due', $locale)}
			{/if}
		</h2>

		{#if !isAllLearned}
			<p class="empty-desc">
				{#if isEmpty}
					{t('deck.empty_desc', $locale)}
				{:else}
					{t('session.nothingDueDesc', $locale) || 'Ya has practicado tus palabras nuevas por hoy. Vuelve mañana para más o repasa ahora.'}
				{/if}
			</p>

			<div class="mode-badge">
				{modeLabel}
			</div>
		{/if}
	</div>

	<StickyFooter>
		{#if !isEmpty}
			<a href="?practice=true" class="hm-btn hm-btn-primary" style="flex:1;">
				{t('deck.practice_anyway', $locale)}
			</a>
		{/if}
		<button class="hm-btn hm-btn-dark" style="flex:{isEmpty ? '1' : '0.5'};" onclick={goBack}>
			{t('deck.back', $locale)}
		</button>
	</StickyFooter>
</div>

<style>
	.empty-state-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		text-align: center;
		min-height: 60dvh;
	}

	.empty-icon-hero {
		margin-bottom: 32px;
	}

	.icon-circle {
		width: 100px;
		height: 100px;
		border-radius: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48px;
		margin: 0 auto;
		box-shadow: var(--shadow-md);
	}

	.icon-circle.ghost {
		background: var(--ink-100);
		color: var(--fg-tertiary);
	}

	.icon-circle.success {
		background: var(--success-wash);
		color: var(--success);
		border: 2px solid rgba(46, 125, 91, 0.1);
	}

	.icon-circle.info {
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		border: 2px solid rgba(188, 0, 45, 0.1);
	}

	.empty-title {
		font-size: 24px;
		font-weight: 800;
		color: var(--sumi);
		margin: 0 0 12px;
		letter-spacing: -0.02em;
	}
	.empty-title.is-completed {
		font-size: 14px;
		font-weight: 400;
		color: var(--fg-tertiary);
		letter-spacing: 0.02em;
	}

	.empty-desc {
		font-size: 16px;
		color: var(--fg-secondary);
		line-height: 1.6;
		max-width: 300px;
		margin: 0 0 32px;
	}

	.mode-badge {
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--fg-tertiary);
		background: var(--ink-100);
		padding: 4px 12px;
		border-radius: 99px;
	}
</style>
