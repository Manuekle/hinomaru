<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, staggerChildren } from '$lib/motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon, VolumeHighIcon, Search01Icon, ZapIcon, Bookmark02Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons';
	import type { PageData } from './$types';
	import { getWordMetadata } from '$lib/utils/vocab_registry';

	interface SavedWord {
		id: string;
		jp: string;
		kana: string;
		romaji?: string;
		en: string;
		es: string;
		repetitions: number;
		next_review: string;
		easiness: number;
		category?: string;
		category_es?: string;
		pos?: string;
		pos_es?: string;
	}

	let { data } = $props<{ data: PageData }>();
	const supabase = $derived(data.supabase);

	async function removeWord(id: string) {
		const { error } = await supabase.from('user_saved_words').delete().eq('id', id);
		if (!error) {
			data.savedWords = (data.savedWords as SavedWord[]).filter((w: SavedWord) => w.id !== id);
		}
	}

	function getSRSStage(reps: number) {
		if (reps === 0) return { key: 'new', color: 'var(--success)' };
		if (reps < 4) return { key: 'apprentice', color: 'var(--warning)' };
		if (reps < 7) return { key: 'learned', color: 'var(--hinomaru-red)' };
		return { key: 'master', color: '#b59410' };
	}

	function formatReviewDate(dateString: string) {
		if (!dateString) return null;
		const next = new Date(dateString);
		const now = new Date();
		const diffMs = next.getTime() - now.getTime();
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays <= 0) return { text: t('vocab.due', $locale), urgent: true };
		if (diffDays === 1) return { text: t('vocab.tomorrow', $locale), urgent: false };
		return { text: t('vocab.inDays', $locale, { n: diffDays }), urgent: false };
	}

	let searchQuery = $state('');

	const enrichedWords = $derived(
		(data.savedWords as SavedWord[]).map(w => {
			const meta = getWordMetadata(w.jp);
			return {
				...w,
				category: w.category || meta?.category || 'General',
				category_es: w.category_es || meta?.category_es || 'General',
				pos: w.pos || meta?.pos,
				pos_es: w.pos_es || meta?.pos_es
			};
		})
	);

	const filteredWords = $derived(
		enrichedWords.filter((w) => {
			const q = searchQuery.toLowerCase();
			return (
				w.jp.includes(searchQuery) ||
				w.kana.includes(searchQuery) ||
				w.en.toLowerCase().includes(q) ||
				w.es.toLowerCase().includes(q) ||
				(w.romaji || kanaToRomaji(w.kana)).toLowerCase().includes(q) ||
				(w.category || '').toLowerCase().includes(q) ||
				(w.category_es || '').toLowerCase().includes(q)
			);
		})
	);

	const wordsByCategory = $derived.by(() => {
		const groups: Record<string, { label: string; words: SavedWord[] }> = {};
		filteredWords.forEach((word) => {
			const cat = word.category || 'General';
			const label = $locale === 'es' ? word.category_es || cat : cat;
			if (!groups[cat]) groups[cat] = { label, words: [] };
			groups[cat].words.push(word);
		});
		return Object.entries(groups).sort(([a], [b]) => {
			if (a === 'General') return 1;
			if (b === 'General') return -1;
			return a.localeCompare(b);
		});
	});
</script>

<svelte:head>
	<title>{t('nav.vocabulary', $locale) || 'Mi Vocabulario'} — Hinomaru</title>
</svelte:head>

<div class="page">
	<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:8px;">
		<a href="/" class="back-link-beautiful">← {t('deck.back', $locale)}</a>
	</div>

	<div class="hero">
		<div class="hero-top" use:fadeUp={{ delay: 0.06, y: 16 }}>
			<h1>{t('nav.vocabulary', $locale) || 'Vocabulario'}</h1>
			{#if data.dueCount > 0}
				<a href="/vocabulary/review" class="review-btn">
					<Icon icon={ZapIcon} size={14} strokeWidth={2.5} />
					{t('nav.review', $locale)} ({data.dueCount})
				</a>
			{/if}
		</div>
		<p use:fadeUp={{ delay: 0.12, y: 12 }}>
			{t('home.cards', $locale, { n: data.savedWords.length })} guardadas en tu colección personal.
		</p>
	</div>

	<!-- Search -->
	<div class="search-wrap" use:fadeIn={{ delay: 0.18 }}>
		<Icon icon={Search01Icon} size={18} class="search-icon" />
		<input 
			type="text" 
			placeholder={t('vocab.search', $locale)} 
			bind:value={searchQuery} 
		/>
	</div>

	<!-- List -->
	<div class="list">
		{#if filteredWords.length === 0}
			<div class="empty-state" use:fadeIn>
				<div class="empty-icon">📭</div>
				<p>{searchQuery ? 'Sin resultados' : t('vocab.empty', $locale)}</p>
			</div>
		{:else}
			{#each wordsByCategory as [catKey, group] (catKey)}
				<div class="section-group" use:fadeUp={{ delay: 0.2 }}>
					<div class="section-label">
						<span class="dot" class:is-general={catKey === 'General'}></span>
						{group.label}
					</div>
					
					<div class="rows" use:staggerChildren={{ delay: 0.25, stagger: 0.05, y: 8 }}>
						{#each group.words as word, i (word.id)}
							{@const stage = getSRSStage(word.repetitions)}
							{@const review = formatReviewDate(word.next_review)}
							<div class="row">
								<div class="row-num">{i + 1 < 10 ? '0' + (i + 1) : i + 1}</div>
								
								<div class="row-body">
									<div class="row-top">
										<span class="row-title jp">{word.jp}</span>
										<span class="row-kana jp">{word.kana}</span>
										{#if word.pos}
											<span class="row-pos">{word.pos_es || word.pos}</span>
										{/if}
									</div>
									<div class="row-sub">{$locale === 'es' ? word.es : word.en}</div>
									{#if $showRomaji}
										<div class="row-meta-inline">
											{word.romaji || kanaToRomaji(word.kana)}
										</div>
									{/if}
								</div>

								<div class="row-meta">
									<div class="meta-tags">
										{#if review}
											<span class="tag-review" class:urgent={review.urgent}>
												{review.text}
											</span>
										{/if}
										<span class="tag-srs" style="color: {stage.color}">
											{t('vocab.stage.' + stage.key, $locale)}
										</span>
									</div>
									<div class="row-actions">
										<button class="action-btn" onclick={() => speakJapanese(word.jp)} title="Escuchar">
											<Icon icon={VolumeHighIcon} size={16} />
										</button>
										<button class="action-btn del" onclick={() => removeWord(word.id)} title="Eliminar">
											<Icon icon={Cancel01Icon} size={14} />
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.page {
		max-width: 680px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));
	}

	.back-link-beautiful {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		transition: color 150ms ease;
	}
	.back-link-beautiful:hover {
		color: var(--fg-primary);
	}

	/* Hero */
	.hero {
		margin-bottom: 28px;
		margin-top: 12px;
	}

	.hero-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}

	.hero h1 {
		font-size: 38px;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--fg-primary);
		margin: 0;
		line-height: 1.1;
	}

	.review-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		background: var(--hinomaru-red);
		color: white;
		border-radius: 999px;
		font-size: 13px;
		font-weight: 700;
		text-decoration: none;
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.2);
		transition: all 0.2s;
	}

	.review-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(188, 0, 45, 0.3);
	}

	.hero p {
		font-size: 15px;
		color: var(--fg-secondary);
		margin: 0;
		line-height: 1.5;
	}

	/* Search */
	.search-wrap {
		position: relative;
		margin-bottom: 32px;
	}

	:global(.search-icon) {
		position: absolute;
		left: 14px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--fg-tertiary);
		pointer-events: none;
	}

	.search-wrap input {
		width: 100%;
		height: 48px;
		background: var(--ink-50);
		border: 1px solid var(--ink-100);
		border-radius: 14px;
		padding: 0 16px 0 42px;
		font-size: 15px;
		color: var(--fg-primary);
		transition: all 0.2s;
	}

	.search-wrap input:focus {
		background: var(--bg-page);
		border-color: var(--hinomaru-red);
		box-shadow: 0 0 0 4px var(--hinomaru-red-wash);
	}

	/* List */
	.list {
		display: flex;
		flex-direction: column;
	}

	.section-group {
		margin-bottom: 32px;
	}

	.section-label {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 11px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--fg-tertiary);
		margin-bottom: 12px;
		padding-left: 2px;
	}

	.dot {
		width: 7px;
		height: 7px;
		background: var(--hinomaru-red);
		border-radius: 50%;
	}

	.dot.is-general {
		background: var(--fg-tertiary);
	}

	.rows {
		display: flex;
		flex-direction: column;
	}

	.row {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		padding: 16px 0;
		border-bottom: 1px solid var(--ink-100);
		text-decoration: none;
		color: inherit;
		transition: background 150ms;
	}

	.row:first-child {
		border-top: 1px solid var(--ink-100);
	}

	.row-num {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		font-variant-numeric: tabular-nums;
		padding-top: 3px;
		min-width: 24px;
		letter-spacing: 0.02em;
	}

	.row-body {
		flex: 1;
		min-width: 0;
	}

	.row-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 2px;
		flex-wrap: wrap;
	}

	.row-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
	}

	.row-kana {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}

	.row-pos {
		font-size: 9px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--ink-100);
		color: var(--fg-tertiary);
		padding: 1px 6px;
		border-radius: 4px;
		font-style: italic;
	}

	.row-sub {
		font-size: 14px;
		color: var(--fg-secondary);
		font-weight: 600;
		margin-bottom: 2px;
	}

	.row-meta-inline {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-weight: 500;
		font-style: italic;
	}

	.row-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
		padding-top: 3px;
		flex-shrink: 0;
	}

	.meta-tags {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}

	.tag-review {
		font-size: 10px;
		font-weight: 700;
		color: var(--fg-tertiary);
	}

	.tag-review.urgent {
		color: var(--error);
	}

	.tag-srs {
		font-size: 9px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.row-actions {
		display: flex;
		gap: 8px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.row:hover .row-actions {
		opacity: 1;
	}

	.action-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: transparent;
		color: var(--fg-tertiary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-btn:hover {
		background: var(--fg-primary);
		color: var(--bg-page);
		border-color: var(--fg-primary);
	}

	.action-btn.del:hover {
		background: var(--error);
		border-color: var(--error);
		color: white;
	}

	.empty-state {
		text-align: center;
		padding: 60px 24px;
		color: var(--fg-tertiary);
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
		display: block;
	}

	@media (max-width: 500px) {
		.row-actions {
			opacity: 1;
		}
		.hero h1 {
			font-size: 32px;
		}
	}
</style>
