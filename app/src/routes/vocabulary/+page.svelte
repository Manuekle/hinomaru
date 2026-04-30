<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn } from '$lib/motion';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { speakJapanese } from '$lib/utils/tts';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import Icon from '$lib/Icon.svelte';
	import {
		Cancel01Icon,
		VolumeHighIcon,
		Search01Icon,
		ZapIcon
	} from '@hugeicons/core-free-icons';
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
		if (reps === 0)
			return { key: 'new', color: 'var(--success)', label: $locale === 'es' ? 'Nuevo' : 'New' };
		if (reps < 4)
			return {
				key: 'apprentice',
				color: 'var(--warning)',
				label: $locale === 'es' ? 'Aprendiz' : 'Apprentice'
			};
		if (reps < 7)
			return {
				key: 'learned',
				color: 'var(--hinomaru-red)',
				label: $locale === 'es' ? 'Aprendido' : 'Learned'
			};
		return { key: 'master', color: '#b59410', label: $locale === 'es' ? 'Maestro' : 'Master' };
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
	let activeCategory = $state('All');

	const enrichedWords = $derived(
		(data.savedWords as SavedWord[]).map((w) => {
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

	const availableCategories = $derived.by(() => {
		const cats = new SvelteSet<string>();
		enrichedWords.forEach((w) => cats.add(w.category || 'General'));
		const sorted = Array.from(cats).sort();
		return ['All', ...sorted];
	});

	// Reset category if searching
	$effect(() => {
		if (searchQuery.length > 0 && activeCategory !== 'All') {
			activeCategory = 'All';
		}
	});

	const filteredWords = $derived(
		enrichedWords.filter((w) => {
			const q = searchQuery.toLowerCase();
			const matchesSearch =
				q === '' ||
				w.jp.includes(searchQuery) ||
				w.kana.includes(searchQuery) ||
				w.en.toLowerCase().includes(q) ||
				w.es.toLowerCase().includes(q) ||
				(w.romaji || kanaToRomaji(w.kana)).toLowerCase().includes(q);

			const matchesCategory = activeCategory === 'All' || w.category === activeCategory;

			return matchesSearch && matchesCategory;
		})
	);

	function getCategoryColor(cat: string) {
		const c = cat.toLowerCase();
		if (c.includes('food') || c.includes('comida')) return 'var(--cat-food, #ff6b6b)';
		if (c.includes('animal')) return 'var(--cat-animals, #4ecdc4)';
		if (c.includes('natur')) return 'var(--cat-nature, #45b7d1)';
		if (c.includes('famil')) return 'var(--cat-family, #96ceb4)';
		if (c.includes('verb')) return 'var(--cat-verbs, #ffeead)';
		if (c.includes('adj')) return 'var(--cat-adjectives, #d4a5a5)';
		if (c.includes('plac') || c.includes('lugar')) return 'var(--cat-places, #9de1fe)';
		if (c.includes('color')) return 'var(--cat-colors, #fa8072)';
		return 'var(--cat-general, var(--ink-400))';
	}

	function getCategoryLabel(cat: string) {
		if (cat === 'All') return t('vocab.all', $locale);
		const sample = enrichedWords.find((w) => w.category === cat);
		return $locale === 'es' ? sample?.category_es || cat : cat;
	}
</script>

<svelte:head>
	<title>{t('nav.vocabulary', $locale) || 'Mi Vocabulario'} — Hinomaru</title>
</svelte:head>

<div class="vocab-layout">
	<div class="container">
		<div class="header-row">
			<h1
				use:fadeUp={{ delay: 0.06, y: 16 }}
				style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;color:var(--sumi);"
			>
				{t('nav.vocabulary', $locale) || 'Mi Vocabulario'}
			</h1>
			{#if data.dueCount > 0}
				<div class="top-actions" use:fadeIn={{ delay: 0.12 }}>
					<a href="/vocabulary/review" class="review-pill" title={t('nav.review', $locale)}>
						<Icon icon={ZapIcon} size={14} variant="solid" />
						<span class="btn-label">{t('nav.review', $locale)} ({data.dueCount})</span>
					</a>
				</div>
			{/if}
		</div>
		<p
			use:fadeUp={{ delay: 0.12, y: 12 }}
			style="font-size:16px;color:var(--fg-secondary);margin:0 0 48px;text-align:left;"
		>
			{t('home.cards', $locale, { n: data.savedWords.length })} guardadas para estudiar.
		</p>

		<!-- Search Bar -->
		<div class="search-container" use:fadeUp={{ delay: 0.1, y: 12 }}>
			<Icon icon={Search01Icon} size={20} class="search-icon" strokeWidth={2} />
			<input
				type="text"
				class="hm-input search-input"
				placeholder={t('vocab.search', $locale)}
				bind:value={searchQuery}
			/>
		</div>

		<!-- Categories (Horizontal Scroll) -->
		{#if !searchQuery && availableCategories.length > 2}
			<div class="categories-scroll hide-scrollbar" use:fadeIn={{ delay: 0.15 }}>
				{#each availableCategories as cat (cat)}
					<button
						class="cat-tab touch-action-manip"
						class:active={activeCategory === cat}
						onclick={() => (activeCategory = cat)}
					>
						{getCategoryLabel(cat)}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Grid -->
		<main class="content">
			{#if filteredWords.length === 0}
				<div class="empty-state" use:fadeIn>
					<div class="empty-icon">📭</div>
					<h3 class="empty-title">
						{searchQuery ? t('vocab.noResults.title', $locale) : t('vocab.empty', $locale)}
					</h3>
					<p class="empty-desc">
						{searchQuery ? t('vocab.noResults.desc', $locale) : t('vocab.emptyDesc', $locale)}
					</p>
				</div>
			{:else}
				<div class="cards-grid">
					{#each filteredWords as word (word.id)}
						{@const stage = getSRSStage(word.repetitions)}
						{@const review = formatReviewDate(word.next_review)}
						<div class="word-card" in:fly={{ y: 20, duration: 300, easing: cubicOut }}>
							<div class="card-top">
								<div class="word-info">
									<div class="jp-group">
										<div style="display:flex; align-items:center; gap:12px;">
											<span class="jp-text jp">{word.jp}</span>
											<button
												class="action-btn-inline"
												onclick={(e) => { e.stopPropagation(); speakJapanese(word.jp); }}
												title={t('vocab.listen', $locale)}
											>
												<Icon icon={VolumeHighIcon} size={16} />
											</button>
										</div>
										<span class="kana-text jp">{word.kana}</span>
									</div>
									{#if $showRomaji}
										<span class="romaji-text">{word.romaji || kanaToRomaji(word.kana)}</span>
									{/if}
								</div>
							</div>

							<div class="card-body">
								<p class="meaning">{$locale === 'es' ? word.es : word.en}</p>
								<div class="tags-row">
									{#if word.pos}
										<span class="tag pos-tag"
											>{$locale === 'es' ? word.pos_es || word.pos : word.pos}</span
										>
									{/if}
									{#if word.category}
										<span
											class="tag cat-tag"
											style="--cat-color: {getCategoryColor(word.category)}"
										>
											{$locale === 'es' ? word.category_es || word.category : word.category}
										</span>
									{/if}
								</div>
							</div>

							<div class="card-footer">
								<div class="srs-status">
									<div class="status-dot" style="background: {stage.color}"></div>
									<span class="status-label">{stage.label}</span>
								</div>
								<div style="display:flex; align-items:center; gap:12px;">
									{#if review}
										<span class="review-info" class:urgent={review.urgent}>
											{#if review.urgent}
												<Icon icon={ZapIcon} size={12} variant="solid" />
											{/if}
											{review.text}
										</span>
									{/if}
									<button
										class="action-btn-subtle del-btn"
										onclick={(e) => { e.stopPropagation(); removeWord(word.id); }}
										title={t('vocab.delete', $locale)}
									>
										<Icon icon={Cancel01Icon} size={14} />
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.vocab-layout {
		min-height: 100vh;
		background: var(--bg-page, var(--paper));
	}

	.container {
		max-width: 720px;
		margin: 0 auto;
		padding: calc(32px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));
	}

	.top-nav {
		display: none;
	}

	.top-actions {
		display: flex;
		align-items: center;
		gap: 12px;
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

	@media (hover: hover) {
		.back-link-beautiful:hover {
			color: var(--sumi);
		}
	}

	.review-pill {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		background: var(--hinomaru-red);
		color: white;
		border-radius: 99px;
		font-size: 12px;
		font-weight: 700;
		text-decoration: none;
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.25);
		transition:
			transform 200ms ease,
			box-shadow 200ms ease;
	}
	@media (hover: hover) {
		.review-pill:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 16px rgba(188, 0, 45, 0.35);
		}
	}
	.review-pill:active {
		transform: scale(0.96);
	}

	.review-pill .btn-label {
		display: inline;
	}

	@media (max-width: 600px) {
		.review-pill .btn-label {
			display: none;
		}
		.review-pill {
			padding: 0;
			width: 32px;
			height: 32px;
			justify-content: center;
		}
	}

	.header-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		width: 100%;
	}

	.search-container {
		position: relative;
		margin-bottom: 32px;
	}

	:global(.search-icon) {
		position: absolute;
		left: 16px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--fg-tertiary);
		pointer-events: none;
	}

	.search-input {
		padding-left: 48px;
		border-radius: 24px;
		height: 52px;
		font-size: 16px;
		box-shadow: var(--shadow-sm);
		background: var(--bg-surface);
	}

	.search-input:focus {
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.06),
			0 0 0 3px var(--hinomaru-red-wash);
	}

	/* Categories Tabs */
	.categories-scroll {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
		overflow-x: auto;
		padding-bottom: 8px; /* space for scrollbar/shadows */
		-webkit-overflow-scrolling: touch;
	}

	.cat-tab {
		height: 38px;
		padding: 0 16px;
		border-radius: 99px;
		border: 1px solid var(--ink-200);
		background: var(--bg-surface);
		color: var(--sumi);
		font-weight: 600;
		font-size: 13px;
		cursor: pointer;
		font-family: var(--font-ui);
		white-space: nowrap;
		flex-shrink: 0;
		transition:
			background 180ms ease,
			color 180ms ease,
			border-color 180ms ease;
	}

	.cat-tab.active {
		border-color: var(--sumi);
		background: var(--sumi);
		color: var(--bg-surface);
	}

	/* Cards Grid */
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 12px;
	}

	.word-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-sm);
		transition:
			box-shadow 200ms ease,
			transform 200ms ease;
		position: relative;
	}

	@media (hover: hover) {
		.word-card:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
		}
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
	}

	.word-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.jp-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.jp-text {
		font-size: 24px;
		font-weight: 700;
		color: var(--sumi);
		line-height: 1.1;
		letter-spacing: -0.01em;
	}

	.kana-text {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}

	.romaji-text {
		font-size: 12px;
		font-weight: 600;
		color: var(--hinomaru-red);
		margin-top: 4px;
	}

	.card-actions {
		display: flex;
		gap: 6px;
	}

	.action-btn-inline {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--ink-200);
		background: var(--bg-surface);
		color: var(--fg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 200ms ease;
		flex-shrink: 0;
	}

	.action-btn-subtle {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: none;
		background: transparent;
		color: var(--fg-tertiary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 200ms ease;
	}

	@media (hover: hover) {
		.action-btn-inline:hover {
			background: var(--ink-100);
			color: var(--sumi);
			border-color: var(--ink-300);
		}
		.action-btn-subtle:hover {
			background: var(--error-wash);
			color: var(--error);
		}
	}

	.action-btn-inline:active,
	.action-btn-subtle:active {
		transform: scale(0.9);
	}

	.card-body {
		flex: 1;
		margin-bottom: 20px;
	}

	.meaning {
		font-size: 15px;
		font-weight: 600;
		color: var(--fg-primary);
		line-height: 1.4;
		margin: 0 0 10px;
	}

	.tags-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.tag {
		font-size: 10px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.pos-tag {
		background: var(--ink-100);
		color: var(--fg-tertiary);
	}

	.cat-tag {
		background: color-mix(in srgb, var(--cat-color) 12%, transparent);
		color: var(--cat-color);
	}

	.card-footer {
		padding-top: 16px;
		border-top: 1px solid var(--ink-100);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.srs-status {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.status-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--fg-tertiary);
	}

	.review-info {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		font-weight: 600;
		color: var(--fg-tertiary);
	}

	.review-info.urgent {
		color: var(--error);
		background: var(--error-wash);
		padding: 2px 8px;
		border-radius: 6px;
	}

	.empty-state {
		text-align: center;
		padding: 60px 24px;
		color: var(--fg-tertiary);
		background: var(--bg-surface);
		border: 1px dashed var(--ink-200);
		border-radius: 24px;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.empty-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--sumi);
		margin-bottom: 8px;
	}

	.empty-desc {
		font-size: 14px;
		margin: 0;
	}

	@media (max-width: 600px) {
		.cards-grid {
			grid-template-columns: 1fr;
		}
		.page-title {
			font-size: 32px;
		}
	}
</style>
