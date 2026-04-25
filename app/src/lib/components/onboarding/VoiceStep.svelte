<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { Tick01Icon } from '@hugeicons/core-free-icons';

	let { onSelect } = $props();

	const voices = $derived([
		{
			id: 'standard',
			name: t('onboarding.voice.standard.name', $locale),
			desc: t('onboarding.voice.standard.desc', $locale),
			icon: '🔊'
		},
		{
			id: 'kaito',
			name: t('onboarding.voice.kaito.name', $locale),
			desc: t('onboarding.voice.kaito.desc', $locale),
			icon: '✨'
		}
	]);

	let selected = $state('standard');
	let playingId = $state<string | null>(null);

	function handleSelect(id: string) {
		selected = id;
	}

	function handleNext() {
		onSelect(selected);
	}

	// IMPORTANT: speechSynthesis MUST be called from a direct <button> onclick
	// for it to work on iOS Safari / PWA mode. A div with role="button" is blocked.
	function playSample(id: string) {
		if (!('speechSynthesis' in window)) return;
		window.speechSynthesis.cancel();
		playingId = id;

		const utterance = new SpeechSynthesisUtterance('こんにちは、日本語の勉強を始めましょう');
		utterance.lang = 'ja-JP';

		// Try to find different Japanese voices
		const availableVoices = window.speechSynthesis
			.getVoices()
			.filter((v) => v.lang.includes('ja') || v.lang.includes('JP'));

		if (id === 'kaito' && availableVoices.length > 1) {
			// Find a male-sounding voice if possible, or just pick the second voice
			const kaitoVoice =
				availableVoices.find((v) => !v.name.toLowerCase().includes('kyoko')) || availableVoices[1];
			utterance.voice = kaitoVoice;
			utterance.pitch = 0.8; // Deeper pitch
		} else if (availableVoices.length > 0) {
			utterance.voice = availableVoices[0];
			if (id === 'kaito') utterance.pitch = 0.8; // Fallback to pitch change if only 1 voice
		} else {
			// Absolute fallback if no voices loaded yet (Chrome loads them async)
			if (id === 'kaito') utterance.pitch = 0.8;
		}

		utterance.rate = 0.9;
		utterance.onend = () => {
			playingId = null;
		};
		utterance.onerror = () => {
			playingId = null;
		};
		window.speechSynthesis.speak(utterance);
	}
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.voice.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.voice.subtitle', $locale)}</p>
	</header>

	<div class="options-list">
		{#each voices as voice, i}
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
					{#if playingId === voice.id}
						<span class="play-icon">⏸</span>
					{:else}
						<span class="play-icon">▶</span>
					{/if}
				</button>

				<!-- Select trigger: also a real <button> for accessibility -->
				<button class="voice-select-btn" onclick={() => handleSelect(voice.id)} type="button">
					<span class="voice-name">{voice.name}</span>
					<span class="voice-desc">{voice.desc}</span>
				</button>

				{#if selected === voice.id}
					<div class="check" aria-label="Selected">
						<Icon icon={Tick01Icon} size={20} strokeWidth={3} />
					</div>
				{/if}
			</div>
		{/each}
		<p class="hint" use:fadeUp={{ delay: 0.3 }}>
			{t('onboarding.voice.playHint', $locale)}
		</p>
	</div>

	<footer class="footer" use:fadeUp={{ delay: 0.4, y: 10 }}>
		<button class="hm-btn hm-btn-dark hm-btn-full hm-btn-lg" onclick={handleNext} type="button">
			{t('onboarding.next', $locale)}
		</button>
	</footer>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 32px 24px 24px;
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
		font-size: 13px;
		color: var(--sumi);
		margin-left: 2px;
		line-height: 1;
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

	.footer {
		margin-top: auto;
		padding-bottom: env(safe-area-inset-bottom);
	}
</style>
