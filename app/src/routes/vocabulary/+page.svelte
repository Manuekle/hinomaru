<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, staggerChildren } from '$lib/motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import Icon from '$lib/Icon.svelte';
	import { 
		Cancel01Icon, 
		VolumeHighIcon, 
		Search01Icon, 
		ZapIcon, 
		Bookmark02Icon, 
		ArrowLeft02Icon,
		CheckmarkCircle02Icon
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
		if (reps === 0) return { key: 'new', color: 'var(--success)', label: 'Nuevo' };
		if (reps < 4) return { key: 'apprentice', color: 'var(--warning)', label: 'Aprendiz' };
		if (reps < 7) return { key: 'learned', color: 'var(--hinomaru-red)', label: 'Aprendido' };
		return { key: 'master', color: '#b59410', label: 'Maestro' };
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

	function getCategoryColor(cat: string) {
		const c = cat.toLowerCase();
		if (c.includes('food') || c.includes('comida')) return '#e67e22';
		if (c.includes('animal')) return '#27ae60';
		if (c.includes('natur')) return '#16a085';
		if (c.includes('famil')) return '#8e44ad';
		if (c.includes('verb')) return '#2980b9';
		if (c.includes('adj')) return '#f39c12';
		if (c.includes('plac') || c.includes('lugar')) return '#c0392b';
		if (c.includes('color')) return '#e91e63';
		return 'var(--fg-tertiary)';
	}
</script>

<svelte:head>
	<title>{t('nav.vocabulary', $locale) || 'Mi Vocabulario'} — Hinomaru</title>
</svelte:head>

<div class="vocab-page">
	<div class="container">
		<!-- Minimalist Top Nav -->
		<div use:fadeUp={{ delay: 0, y: 10 }} class="top-nav">
			<a href="/" class="back-link">
				<Icon icon={ArrowLeft02Icon} size={18} />
				<span>{t('deck.back', $locale)}</span>
			</a>
			{#if data.dueCount > 0}
				<a href="/vocabulary/review" class="review-pill">
					<Icon icon={ZapIcon} size={14} variant="solid" />
					<span>{t('nav.review', $locale)} ({data.dueCount})</span>
				</a>
			{/if}
		</div>

		<header class="header">
			<h1 use:fadeUp={{ delay: 0.05, y: 15 }}>{t('nav.vocabulary', $locale) || 'Mi Vocabulario'}</h1>
			<p use:fadeUp={{ delay: 0.1, y: 10 }}>
				{t('home.cards', $locale, { n: data.savedWords.length })} guardadas para estudiar.
			</p>

			<div class="search-bar" use:fadeUp={{ delay: 0.15, y: 8 }}>
				<Icon icon={Search01Icon} size={20} class="search-icon" />
				<input 
					type="text" 
					placeholder={t('vocab.search', $locale)} 
					bind:value={searchQuery} 
				/>
			</div>
		</header>

		<main class="content">
			{#if filteredWords.length === 0}
				<div class="empty" use:fadeIn>
					<div class="empty-icon">📭</div>
					<h3>{searchQuery ? 'Sin resultados' : t('vocab.empty', $locale)}</h3>
					<p>{searchQuery ? 'Prueba con otra búsqueda.' : 'Tus palabras guardadas aparecerán aquí.'}</p>
				</div>
			{:else}
				{#each wordsByCategory as [catKey, group] (catKey)}
					<section class="cat-section" use:fadeUp={{ delay: 0.1 }}>
						<div class="cat-header">
							<div class="cat-indicator" style="background: {getCategoryColor(catKey)}"></div>
							<h2 class="cat-title">{group.label}</h2>
							<span class="cat-count">{group.words.length}</span>
						</div>

						<div class="cards-grid" use:staggerChildren={{ delay: 0.2, stagger: 0.05, y: 10 }}>
							{#each group.words as word (word.id)}
								{@const stage = getSRSStage(word.repetitions)}
								{@const review = formatReviewDate(word.next_review)}
								<div class="word-card">
									<div class="card-top">
										<div class="word-info">
											<div class="jp-group">
												<span class="jp-text jp">{word.jp}</span>
												<span class="kana-text jp">{word.kana}</span>
											</div>
											{#if $showRomaji}
												<span class="romaji-text">{word.romaji || kanaToRomaji(word.kana)}</span>
											{/if}
										</div>
										<div class="card-actions">
											<button class="icon-btn audio" onclick={() => speakJapanese(word.jp)}>
												<Icon icon={VolumeHighIcon} size={18} />
											</button>
											<button class="icon-btn del" onclick={() => removeWord(word.id)}>
												<Icon icon={Cancel01Icon} size={16} />
											</button>
										</div>
									</div>

									<div class="card-body">
										<p class="meaning">{$locale === 'es' ? word.es : word.en}</p>
										{#if word.pos}
											<span class="pos-tag">{word.pos_es || word.pos}</span>
										{/if}
									</div>

									<div class="card-footer">
										<div class="srs-status">
											<div class="status-dot" style="background: {stage.color}"></div>
											<span class="status-label">{stage.label}</span>
										</div>
										{#if review}
											<span class="review-info" class:urgent={review.urgent}>
												{review.text}
											</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</section>
				{/each}
			{/if}
		</main>
	</div>
</div>

<style>
	.vocab-page {
		min-height: 100dvh;
		background: var(--paper);
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 24px 140px;
	}

	.top-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32px;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--fg-secondary);
		text-decoration: none;
		font-size: 14px;
		font-weight: 600;
		transition: color 0.2s;
	}
	.back-link:hover { color: var(--sumi); }

	.review-pill {
		display: flex;
		align-items: center;
		gap: 8px;
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
	.review-pill:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(188, 0, 45, 0.3);
	}

	.header {
		margin-bottom: 48px;
	}

	.header h1 {
		font-size: 42px;
		font-weight: 800;
		letter-spacing: -0.04em;
		margin: 0 0 8px;
		color: var(--sumi);
	}

	.header p {
		font-size: 16px;
		color: var(--fg-secondary);
		margin: 0 0 32px;
	}

	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
	}

	:global(.search-icon) {
		position: absolute;
		left: 18px;
		color: var(--fg-tertiary);
		pointer-events: none;
	}

	.search-bar input {
		width: 100%;
		height: 56px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 0 20px 0 54px;
		font-size: 17px;
		color: var(--sumi);
		box-shadow: var(--shadow-sm);
		transition: all 0.3s;
	}

	.search-bar input:focus {
		border-color: var(--hinomaru-red);
		box-shadow: 0 0 0 4px var(--hinomaru-red-wash), var(--shadow-md);
		transform: translateY(-1px);
	}

	/* Content */
	.cat-section {
		margin-bottom: 56px;
	}

	.cat-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 24px;
		padding-left: 4px;
	}

	.cat-indicator {
		width: 4px;
		height: 20px;
		border-radius: 2px;
	}

	.cat-title {
		font-size: 16px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--fg-secondary);
		margin: 0;
	}

	.cat-count {
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-tertiary);
		background: var(--ink-100);
		padding: 2px 8px;
		border-radius: 6px;
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 16px;
	}

	/* Word Card */
	.word-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		box-shadow: var(--shadow-sm);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.word-card:hover {
		transform: translateY(-4px) scale(1.01);
		box-shadow: var(--shadow-lg), 0 12px 24px rgba(0,0,0,0.04);
		border-color: var(--ink-300);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.jp-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.jp-text {
		font-size: 32px;
		font-weight: 700;
		color: var(--sumi);
		line-height: 1;
	}

	.kana-text {
		font-size: 14px;
		color: var(--fg-secondary);
		font-weight: 500;
	}

	.romaji-text {
		font-size: 12px;
		font-weight: 700;
		color: var(--hinomaru-red);
		margin-top: 4px;
		display: block;
	}

	.card-actions {
		display: flex;
		gap: 8px;
		opacity: 0.2;
		transition: opacity 0.2s;
	}

	.word-card:hover .card-actions {
		opacity: 1;
	}

	.icon-btn {
		width: 36px;
		height: 36px;
		border-radius: 12px;
		border: none;
		background: var(--ink-100);
		color: var(--fg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.icon-btn:hover {
		background: var(--sumi);
		color: white;
	}

	.icon-btn.del:hover {
		background: var(--error);
	}

	.card-body {
		flex: 1;
	}

	.meaning {
		font-size: 18px;
		font-weight: 600;
		color: var(--fg-primary);
		margin: 0 0 8px;
		line-height: 1.3;
	}

	.pos-tag {
		font-size: 11px;
		font-weight: 700;
		font-style: italic;
		color: var(--fg-tertiary);
		background: var(--ink-50);
		padding: 2px 8px;
		border-radius: 6px;
	}

	.card-footer {
		padding-top: 16px;
		border-top: 1px dashed var(--ink-100);
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
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--fg-tertiary);
	}

	.review-info {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
	}

	.review-info.urgent {
		color: var(--error);
		background: var(--error-wash);
		padding: 2px 8px;
		border-radius: 6px;
	}

	.empty {
		text-align: center;
		padding: 80px 24px;
		color: var(--fg-tertiary);
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	@media (max-width: 600px) {
		.cards-grid {
			grid-template-columns: 1fr;
		}
		.card-actions {
			opacity: 1;
		}
		.header h1 {
			font-size: 32px;
		}
	}
</style>
