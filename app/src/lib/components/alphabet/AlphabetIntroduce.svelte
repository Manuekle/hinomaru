<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeIn } from '$lib/motion';
	import type { KanaChar } from '$lib/data/alphabetCharacters';

	interface Props {
		char: KanaChar;
		onContinue: () => void;
	}

	let { char, onContinue }: Props = $props();

	$effect(() => {
		void char;
		setTimeout(() => speakJapanese(char.jp), 250);
	});

	function play() {
		speakJapanese(char.jp);
	}
</script>

<div class="intro-viewer content-center">
	<div class="word-card" use:fadeIn>
		<button onclick={play} class="audio-corner" aria-label="Play pronunciation">
			<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
		</button>
		<span class="prompt-tag">{$locale === 'es' ? 'NUEVO CARÁCTER' : 'NEW CHARACTER'}</span>
		<div class="jp char-big">{char.jp}</div>
		<div class="romaji-line">{char.romaji}</div>
		<p class="hint">
			{$locale === 'es'
				? 'Escucha y memoriza la forma y el sonido.'
				: 'Listen and memorize the shape and sound.'}
		</p>
	</div>
</div>

<StickyFooter>
	<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={onContinue}>
		{t('session.continue', $locale)}
		<Icon icon={ArrowRight02Icon} size={18} color="currentColor" />
	</button>
</StickyFooter>

<style>
	.intro-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 16px;
		padding: 20px 0 8px;
	}

	.word-card {
		position: relative;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		box-shadow: 0 2px 12px rgba(26, 26, 26, 0.06);
		padding: 28px 20px 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
	}

	.audio-corner {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.prompt-tag {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: -0.04em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.char-big {
		font-size: clamp(96px, 22vw, 144px);
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1;
		font-family: var(--font-jp);
	}

	.romaji-line {
		font-size: clamp(20px, 5vw, 26px);
		font-weight: 700;
		color: var(--hinomaru-red);
		letter-spacing: -0.04em;
	}

	.hint {
		font-size: 14px;
		color: var(--fg-secondary);
		margin: 4px 0 0;
	}
</style>
