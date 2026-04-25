<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, staggerChildren } from '$lib/motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';
	import type { PageData } from './$types';

	interface SavedWord {
		id: string;
		jp: string;
		kana: string;
		romaji?: string;
		en: string;
		es: string;
	}

	let { data } = $props<{ data: PageData }>();

	const supabase = $derived(data.supabase);

	async function removeWord(id: string) {
		const { error } = await supabase.from('user_saved_words').delete().eq('id', id);
		if (!error) {
			data.savedWords = (data.savedWords as SavedWord[]).filter((w: SavedWord) => w.id !== id);
		}
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

<div style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));">
	<div
		use:fadeUp={{ delay: 0, y: 12 }}
		style="margin-bottom:8px;"
	>
		<a href="/" class="back-link-beautiful">
			← {t('deck.back', $locale)}
		</a>
	</div>

	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 24px;"
	>
		{t('nav.vocabulary', $locale) || 'Mi Vocabulario'}
	</h1>

	<div class="search-box" use:fadeUp={{ delay: 0.12 }}>
		<input 
			type="text" 
			placeholder={t('vocab.search', $locale)} 
			bind:value={searchQuery}
		/>
	</div>

	<div class="vocab-list" use:staggerChildren={{ delay: 0.18, stagger: 0.05 }}>
		{#if filteredWords.length === 0}
			<div class="empty-state">
				<p>{t('vocab.empty', $locale)}</p>
			</div>
		{:else}
			{#each filteredWords as word (word.id)}
				<div class="word-card">
					<div class="word-card-top">
						<div class="word-jp-group">
							<span class="word-jp">{word.jp}</span>
							<span class="word-kana">{word.kana}</span>
						</div>
						<div class="word-actions">
							<button class="action-btn audio" onclick={() => speakJapanese(word.jp)} title={t('vocab.listen', $locale)}>
								🔊
							</button>
							<button class="action-btn delete" onclick={() => removeWord(word.id)} title={t('vocab.delete', $locale)}>
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
	.back-link-beautiful:hover { color: var(--sumi); }

	.search-box input {
		width: 100%;
		height: 48px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 14px;
		padding: 0 16px;
		font-size: 15px;
		margin-bottom: 32px;
		box-shadow: var(--shadow-sm);
	}

	.vocab-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.word-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 18px;
		padding: 16px;
		box-shadow: var(--shadow-sm);
	}

	.word-card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.word-jp-group {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.word-jp {
		font-family: var(--font-jp);
		font-size: 20px;
		font-weight: 700;
	}

	.word-kana {
		font-family: var(--font-jp);
		font-size: 12px;
		color: var(--fg-tertiary);
	}

	.word-actions {
		display: flex;
		gap: 8px;
	}

	.action-btn {
		background: var(--ink-100);
		border: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s;
	}

	.action-btn.delete:hover {
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}

	.action-btn.audio:hover {
		background: var(--ink-200);
	}

	.word-romaji {
		font-size: 12px;
		color: var(--fg-tertiary);
		margin-top: 2px;
		margin-bottom: 2px;
	}

	.word-meaning {
		font-size: 14px;
		color: var(--fg-secondary);
	}

	.empty-state {
		text-align: center;
		padding: 40px;
		color: var(--fg-tertiary);
	}
</style>
