<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { showRomaji } from '$lib/stores/settings';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { svileo } from 'svileo';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';

	interface Word {
		id?: string;
		jp: string;
		kana: string;
		romaji?: string;
		en: string;
		es: string;
		level?: string;
		example?: string;
		example_en?: string;
		example_es?: string;
	}

	let { word, initiallySaved = false } = $props<{ word: Word | null; initiallySaved?: boolean }>();
	let saved = $state(initiallySaved);
	let saving = $state(false);

	$effect(() => {
		if (initiallySaved) saved = true;
	});

	const supabase = $derived($page.data.supabase);

	async function saveWord() {
		if (!word || saved || saving) return;
		saving = true;
		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (!user) return;

			const { error } = await supabase.from('user_saved_words').insert({
				user_id: user.id,
				jp: word.jp,
				kana: word.kana,
				en: word.en,
				es: word.es,
				example: word.example,
				example_en: word.example_en,
				example_es: word.example_es
			});

			if (error) {
				if (error.code === '23505') {
					saved = true;
				} else {
					console.error('save vocab:', error);
					svileo.error({ title: 'Error' });
				}
			} else {
				saved = true;
				await invalidateAll();
			}
		} finally {
			saving = false;
		}
	}
</script>

{#if word}
	<div class="wotd-card" use:fadeUp={{ delay: 0.1, y: 12 }}>
		<div class="wotd-header">
			<span class="wotd-label">{t('wotd.title', $locale)}</span>
			{#if word.level}
				<span class="level-pill">{word.level}</span>
			{/if}
		</div>

		<div class="wotd-main">
			<div class="wotd-jp-group">
				<h2 class="wotd-jp">{word.jp}</h2>
				{#if word.kana && word.kana !== word.jp}
					<span class="wotd-kana">{word.kana}</span>
				{/if}
				{#if $showRomaji}
					<span class="wotd-romaji">{word.romaji || kanaToRomaji(word.kana)}</span>
				{/if}
			</div>

			<button class="audio-btn" onclick={() => speakJapanese(word.jp)} aria-label="Audio">
				<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
			</button>
		</div>

		<p class="wotd-meaning">
			{$locale === 'es' ? word.es : word.en}
		</p>

		{#if !saved}
			<div class="wotd-actions" use:fadeUp={{ y: 5 }}>
				<button class="save-btn" onclick={saveWord} disabled={saving}>
					{saving ? '…' : t('wotd.save', $locale)}
				</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.wotd-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 20px;
		margin-top: 16px;
		margin-bottom: 0;
		box-shadow: var(--shadow-sm);
		position: relative;
		overflow: hidden;
	}

	.wotd-card::after {
		content: '';
		position: absolute;
		top: -50px;
		right: -50px;
		width: 120px;
		height: 120px;
		background: var(--hinomaru-red);
		opacity: 0.03;
		border-radius: 50%;
	}

	.wotd-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.wotd-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--hinomaru-red);
	}

	.level-pill {
		background: var(--sumi);
		color: var(--paper);
		font-size: 10px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 6px;
	}

	.wotd-main {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 8px;
	}

	.wotd-jp {
		font-family: var(--font-jp);
		font-size: 32px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1;
		margin: 0;
	}

	.wotd-kana {
		font-family: var(--font-jp);
		font-size: 16px;
		color: var(--fg-secondary);
		display: block;
		margin-top: 4px;
	}

	.wotd-romaji {
		font-size: 13px;
		color: var(--hinomaru-red);
		font-weight: 600;
		display: block;
		margin-top: 2px;
	}

	.audio-btn {
		background: var(--ink-100);
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 18px;
		transition: transform 0.2s;
	}
	.audio-btn:active {
		transform: scale(0.9);
	}

	.wotd-meaning {
		font-size: 18px;
		font-weight: 500;
		color: var(--fg-primary);
		margin: 0 0 16px;
	}

	.save-btn {
		width: 100%;
		height: 44px;
		background: var(--ink-100);
		border: none;
		border-radius: 14px;
		font-size: 14px;
		font-weight: 700;
		color: var(--sumi);
		cursor: pointer;
		transition: all 0.2s;
		font-family: var(--font-ui);
	}

	.save-btn:hover:not(:disabled) {
		background: var(--ink-200);
	}
</style>
