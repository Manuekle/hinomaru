<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, staggerChildren } from '$lib/motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon, VolumeHighIcon } from '@hugeicons/core-free-icons';
	import type { PageData } from './$types';

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
			return {
				key: 'new',
				bg: 'var(--success-wash)',
				color: 'var(--success)'
			};
		if (reps < 4)
			return {
				key: 'apprentice',
				bg: 'var(--warning-wash)',
				color: 'var(--warning)'
			};
		if (reps < 7)
			return {
				key: 'learned',
				bg: 'var(--hinomaru-red-wash)',
				color: 'var(--hinomaru-red-ink)'
			};
		return {
			key: 'master',
			bg: '#fcf8e8',
			color: '#b59410'
		};
	}

	function formatReviewDate(dateString: string) {
		if (!dateString) return '';
		const next = new Date(dateString);
		const now = new Date();
		const diffMs = next.getTime() - now.getTime();
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays <= 0) return { text: t('vocab.due', $locale), urgent: true };
		if (diffDays === 1) return { text: t('vocab.tomorrow', $locale), urgent: false };
		return { text: t('vocab.inDays', $locale, { n: diffDays }), urgent: false };
	}

	let searchQuery = $state('');
	const filteredWords = $derived(
		(data.savedWords as SavedWord[]).filter((w: SavedWord) => {
			const q = searchQuery.toLowerCase();
			return (
				w.jp.includes(searchQuery) ||
				w.kana.includes(searchQuery) ||
				w.en.toLowerCase().includes(q) ||
				w.es.toLowerCase().includes(q) ||
				(w.romaji || kanaToRomaji(w.kana)).toLowerCase().includes(q)
			);
		})
	);
</script>

<svelte:head>
	<title>{t('nav.vocabulary', $locale) || 'Mi Vocabulario'} — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));"
>
	<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:8px;">
		<a href="/" class="back-link-beautiful">
			← {t('deck.back', $locale)}
		</a>
	</div>

	<div
		style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:24px;"
	>
		<h1
			use:fadeUp={{ delay: 0.06, y: 16 }}
			style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0;"
		>
			{t('nav.vocabulary', $locale) || 'Mi Vocabulario'}
		</h1>

		{#if data.dueCount > 0}
			<a href="/vocabulary/review" class="review-btn" use:fadeUp={{ delay: 0.08, y: 12 }}>
				{t('nav.review', $locale)} ({data.dueCount})
			</a>
		{/if}
	</div>

	<div class="search-box" use:fadeUp={{ delay: 0.12 }}>
		<div class="search-input-wrap">
			<input type="text" placeholder={t('vocab.search', $locale)} bind:value={searchQuery} />
			{#if data.savedWords.length > 0}
				<span class="word-count">{t('home.cards', $locale, { n: filteredWords.length })}</span>
			{/if}
		</div>
	</div>

	<div class="vocab-list" use:staggerChildren={{ delay: 0.18, stagger: 0.05 }}>
		{#if filteredWords.length === 0}
			<div class="empty-state">
				<p>{t('vocab.empty', $locale)}</p>
			</div>
		{:else}
			{#each filteredWords as word (word.id)}
				{@const stage = getSRSStage(word.repetitions)}
				{@const review = formatReviewDate(word.next_review)}
				<div class="word-card">
					<div class="word-card-top">
						<div class="word-jp-group">
							<span class="word-jp">{word.jp}</span>
							<div class="word-meta-inline">
								<span class="word-kana">{word.kana}</span>
								<div
									class="srs-badge"
									style="background: {stage.bg}; color: {stage.color}"
								>
									{t('vocab.stage.' + stage.key, $locale)}
								</div>
							</div>
						</div>
						<div class="word-actions">
							{#if review}
								<span class="review-status" class:urgent={review.urgent}>
									{review.text}
								</span>
							{/if}
							<button
								class="action-btn audio"
								onclick={() => speakJapanese(word.jp)}
								title={t('vocab.listen', $locale)}
							>
								<Icon icon={VolumeHighIcon} size={16} color="currentColor" strokeWidth={1.5} />
							</button>
							<button
								class="action-btn delete"
								onclick={() => removeWord(word.id)}
								title={t('vocab.delete', $locale)}
							>
								<Icon icon={Cancel01Icon} size={14} strokeWidth={2} />
							</button>
						</div>
					</div>
					{#if $showRomaji}
						<div class="word-romaji">{word.romaji || kanaToRomaji(word.kana)}</div>
					{/if}
					<div class="word-meaning">
						{$locale === 'es' ? word.es : word.en}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
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

	.search-input-wrap {
		position: relative;
		margin-bottom: 32px;
	}
	.search-box input {
		width: 100%;
		height: 52px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 0 16px;
		padding-right: 100px;
		font-size: 16px;
		box-shadow: var(--shadow-sm);
		transition: all 0.2s var(--ease-brand);
	}
	.search-box input:focus {
		border-color: var(--hinomaru-red);
		box-shadow: var(--shadow-focus);
	}
	.word-count {
		position: absolute;
		right: 16px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-tertiary);
		pointer-events: none;
	}

	.review-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red-ink);
		text-decoration: none;
		padding: 6px 14px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: 700;
		transition: all 0.2s var(--ease-brand);
		border: 1px solid transparent;
		margin-bottom: 4px;
	}

	@media (hover: hover) {
		.review-btn:hover {
			background: var(--hinomaru-red);
			color: white;
			transform: translateY(-1px);
		}
	}

	.vocab-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.word-card {
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 24px;
		padding: 24px;
		box-shadow: var(--shadow-sm);
		transition: all 0.24s var(--ease-brand);
		cursor: default;
	}
	@media (hover: hover) {
		.word-card:hover {
			transform: translateY(-2px) scale(1.01);
			border-color: var(--ink-300);
			box-shadow: var(--shadow-lg);
		}
	}

	.word-card-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 8px;
	}

	.word-jp-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.word-jp {
		font-family: var(--font-jp);
		font-size: 22px;
		font-weight: 700;
		color: var(--sumi);
	}

	.word-meta-inline {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.word-kana {
		font-family: var(--font-jp);
		font-size: 13px;
		color: var(--fg-secondary);
	}

	.srs-badge {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		padding: 2px 10px;
		border-radius: 99px;
	}

	.word-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.review-status {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		margin-right: 4px;
	}
	.review-status.urgent {
		color: var(--error);
		background: var(--error-wash);
		padding: 2px 8px;
		border-radius: 8px;
	}

	.action-btn {
		background: var(--ink-100);
		border: none;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--fg-primary);
		transition: all 0.2s;
	}

	@media (hover: hover) {
		.action-btn.delete:hover {
			background: var(--error-wash);
			color: var(--error);
		}
	}

	@media (hover: hover) {
		.action-btn.audio:hover {
			background: var(--ink-200);
		}
	}

	.word-romaji {
		font-size: 13px;
		color: var(--hinomaru-red);
		margin-bottom: 4px;
		font-weight: 500;
	}

	.word-meaning {
		font-size: 15px;
		color: var(--fg-secondary);
		line-height: 1.4;
	}

	.empty-state {
		text-align: center;
		padding: 40px;
		color: var(--fg-tertiary);
	}
</style>
