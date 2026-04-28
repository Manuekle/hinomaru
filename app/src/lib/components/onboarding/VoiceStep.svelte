<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { speakVoicevox, stopVoicevox } from '$lib/services/voicevox';

	let { onSelect, onBack } = $props();

	const voices = $derived([
		{
			id: 'kawaii',
			name: t('onboarding.voice.kawaii.name', $locale),
			desc: t('onboarding.voice.kawaii.desc', $locale),
			icon: VolumeHighIcon
		},
		{
			id: 'cool',
			name: t('onboarding.voice.cool.name', $locale),
			desc: t('onboarding.voice.cool.desc', $locale),
			icon: VolumeHighIcon
		}
	]);

	let selected = $state('kawaii');
	let playingId = $state<string | null>(null);

	function handleSelect(id: string) {
		selected = id;
	}

	function handleNext() {
		onSelect(selected);
	}

	async function playSample(id: string) {
		if (playingId === id) {
			stopVoicevox();
			playingId = null;
			return;
		}
		stopVoicevox();
		playingId = id;
		try {
			await speakVoicevox('こんにちは、日本語の勉強を始めましょう', id as 'kawaii' | 'cool');
		} catch {
			// VOICEVOX unavailable — silent fail in onboarding
		} finally {
			playingId = null;
		}
	}
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.voice.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.voice.subtitle', $locale)}</p>
	</header>

	<div class="options-list">
		{#each voices as voice, i (voice.id)}
			<div
				class="voice-card"
				class:selected={selected === voice.id}
				use:fadeUp={{ delay: 0.1 + i * 0.1, y: 12 }}
			>
				<!-- Play button: must be a real <button> for iOS speechSynthesis to work -->
				<button
					class="play-btn"
					class:playing={playingId === voice.id}
					onclick={() => playSample(voice.id)}
					type="button"
					aria-label="Play voice sample"
				>
					<span class="play-icon"
						><Icon icon={VolumeHighIcon} size={16} color="currentColor" /></span
					>
				</button>

				<!-- Select trigger: also a real <button> for accessibility -->
				<button class="voice-select-btn" onclick={() => handleSelect(voice.id)} type="button">
					<span class="voice-name">{voice.name}</span>
					<span class="voice-desc">{voice.desc}</span>
				</button>

				{#if selected === voice.id}
					<div class="check" aria-label="Selected">✓</div>
				{/if}
			</div>
		{/each}
		<p class="hint" use:fadeUp={{ delay: 0.3 }}>
			{t('onboarding.voice.playHint', $locale)}
		</p>
	</div>

	<StickyFooter {onBack}>
		<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex: 1" onclick={handleNext} type="button">
			{t('onboarding.next', $locale)}
		</button>
	</StickyFooter>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 32px 24px 140px;
	}

	.header {
		text-align: center;
		margin-bottom: 32px;
	}

	.title {
		font-size: clamp(24px, 6vw, 32px);
		font-weight: 600;
		letter-spacing: -0.04em;
		margin: 0 0 8px;
	}

	.subtitle {
		font-size: 16px;
		color: var(--fg-tertiary);
		line-height: 1.5;
		max-width: 300px;
		margin: 0 auto;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.voice-card {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 20px;
		transition: all 0.2s var(--ease-brand);
		position: relative;
		cursor: pointer;
	}
	.voice-card:active {
		transform: scale(0.98);
	}

	.voice-card.selected {
		background: var(--sumi);
		border-color: var(--sumi);
		color: var(--bg-surface);
	}

	/* Play button */
	.play-btn {
		width: 44px;
		height: 44px;
		min-width: 44px;
		border-radius: 50%;
		background: var(--ink-100);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			transform 0.1s ease,
			background 0.15s ease;
		flex-shrink: 0;
	}

	.play-btn:active,
	.play-btn.playing {
		transform: scale(0.88);
		background: var(--hinomaru-red-wash);
	}

	.selected .play-btn {
		background: rgba(255, 255, 255, 0.15);
	}

	.play-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--sumi);
	}

	.selected .play-icon {
		color: var(--bg-surface);
	}

	/* Voice selector button — fills space and triggers selection */
	.voice-select-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		padding: 0;
		min-width: 0;
		color: inherit;
	}

	.voice-name {
		font-size: 17px;
		font-weight: 700;
		display: block;
	}

	.voice-desc {
		font-size: 13px;
		color: var(--fg-secondary);
		display: block;
	}

	.selected .voice-desc {
		color: color-mix(in srgb, var(--bg-surface) 60%, transparent);
	}

	.check {
		font-weight: 600;
		font-size: 18px;
		flex-shrink: 0;
		color: inherit;
	}

	.hint {
		text-align: center;
		font-size: 13px;
		color: var(--fg-tertiary);
		margin-top: 8px;
	}
</style>
