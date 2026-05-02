<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import { goto } from '$app/navigation';
	import { fadeUp } from '$lib/motion';
	import StickyFooter from '$lib/components/StickyFooter.svelte';

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
	const isEmpty = $derived(totalCards === 0);

	function goBack() {
		goto(`/deck/${deckId}`);
	}
</script>

<div class="empty-state-layout" use:fadeUp={{ delay: 0.1, y: 15 }}>
	<div class="content-group">
		<h2 class="title">
			{#if isEmpty}
				{t('deck.empty', $locale)}
			{:else if isAllLearned}
				{t('deck.all_learned', $locale)}
			{:else}
				{t('deck.nothing_due', $locale)}
			{/if}
		</h2>
		{#if modeLabel}
			<div class="mode-badge">{modeLabel}</div>
		{/if}
	</div>

	<StickyFooter>
		{#if !isEmpty && !isAllLearned}
			<a href="?practice=true" class="hm-btn hm-btn-primary" style="flex:1;">
				{t('deck.practice_anyway', $locale)}
			</a>
			<button class="hm-btn hm-btn-ghost" style="flex:0.4;" onclick={goBack}>
				{t('deck.back', $locale)}
			</button>
		{:else}
			<button class="hm-btn hm-btn-dark hm-btn-full" onclick={goBack}>
				{t('deck.back', $locale)}
			</button>
		{/if}
	</StickyFooter>
</div>

<style>
	.empty-state-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px;
		text-align: center;
		min-height: 50dvh;
	}

	.content-group {
		max-width: 340px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.title {
		font-size: 28px;
		font-weight: 900;
		color: var(--fg-primary);
		margin: 0;
		letter-spacing: -0.04em;
		line-height: 1.1;
	}

	.mode-badge {
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--fg-tertiary);
		padding: 4px 12px;
		background: var(--bg-muted);
		border: 1px solid var(--ink-200);
		border-radius: 100px;
		opacity: 0.8;
	}
</style>
