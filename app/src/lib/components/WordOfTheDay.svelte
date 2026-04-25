<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { page } from '$app/stores';

	let { word } = $props<{ word: any }>();
	let saved = $state(false);

	const supabase = $derived($page.data.supabase);

	async function saveWord() {
		if (!word || saved) return;
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;

		const { error } = await supabase.from('user_saved_words').upsert({
			user_id: user.id,
			word_id: word.id,
			jp: word.jp,
			kana: word.kana,
			romaji: word.romaji,
			en: word.en,
			es: word.es
		});

		if (!error) {
			saved = true;
		}
	}
</script>

{#if word}
	<div class="wotd-card" use:fadeUp={{ delay: 0.1, y: 12 }}>
		<div class="wotd-header">
			<span class="wotd-label">Palabra del día</span>
			<span class="level-pill">{word.level}</span>
		</div>

		<div class="wotd-main">
			<div class="wotd-jp-group">
				<h2 class="wotd-jp">{word.jp}</h2>
				<span class="wotd-kana">{word.kana}</span>
			</div>

			<button class="audio-btn" onclick={() => speakJapanese(word.jp)} aria-label="Audio">
				🔊
			</button>
		</div>

		<p class="wotd-meaning">
			{$locale === 'es' ? word.es : word.en}
		</p>

		<div class="wotd-actions">
			<button class="save-btn" class:saved onclick={saveWord} disabled={saved}>
				{saved ? '✓ Guardada' : '+ Guardar en mi vocabulario'}
			</button>
		</div>
	</div>
{/if}

<style>
	.wotd-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 20px;
		margin-bottom: 24px;
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
		color: white;
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

	.save-btn.saved {
		background: var(--success-wash);
		color: var(--success);
		cursor: default;
	}
</style>
