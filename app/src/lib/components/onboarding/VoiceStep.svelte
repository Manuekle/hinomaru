<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { speakVoicevox, stopVoicevox } from '$lib/services/voicevox';
	import Orb from '$lib/components/ui/Orb.svelte';

	let { onSelect, onBack } = $props();

	const voices = $derived([
		{
			id: 'kawaii',
			name: t('onboarding.voice.kawaii.name', $locale),
			desc: t('onboarding.voice.kawaii.desc', $locale),
			colors: ['#F6E7D8', '#FFB6C1'] as [string, string]
		},
		{
			id: 'cool',
			name: t('onboarding.voice.cool.name', $locale),
			desc: t('onboarding.voice.cool.desc', $locale),
			colors: ['#CADCFC', '#A0B9D1'] as [string, string]
		}
	]);

	let selected = $state('kawaii');
	let playingId = $state<string | null>(null);

	async function playSample(id: string) {
		// Stop any current playback
		stopVoicevox();
		
		// If clicking the same one that is already playing, just stop
		if (playingId === id) {
			playingId = null;
			return;
		}

		playingId = id;
		try {
			// Small delay to ensure stop finishes
			await new Promise(r => setTimeout(r, 50));
			await speakVoicevox('こんにちは、日本語の勉強を始めましょう', id as 'kawaii' | 'cool');
		} catch (e) {
			console.error('VOICEVOX Error:', e);
		} finally {
			playingId = null;
		}
	}

	function handleSelect(id: string) {
		selected = id;
		playSample(id);
	}

	function handleNext() {
		stopVoicevox();
		onSelect(selected);
	}
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.voice.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.voice.subtitle', $locale)}</p>
	</header>

	<div class="options-list">
		{#each voices as voice, i (voice.id)}
			<button
				class="option-row"
				class:selected={selected === voice.id}
				use:fadeUp={{ delay: 0.1 + i * 0.1, y: 12 }}
				onclick={() => handleSelect(voice.id)}
				type="button"
			>
				<div class="orb-column">
					<div class="orb-box">
						<Orb
							colors={voice.colors}
							agentState={playingId === voice.id ? 'talking' : null}
							className="h-full w-full"
							seed={(i + 1) * 1000}
						/>
					</div>
				</div>

				<div class="info-content">
					<span class="label">{voice.name}</span>
					<span class="sub-label">{voice.desc}</span>
				</div>
			</button>
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
		padding: 32px 24px 100px;
	}

	.header {
		text-align: center;
		margin-bottom: 32px;
	}

	.title {
		font-size: clamp(24px, 6vw, 32px);
		font-weight: 700;
		letter-spacing: -0.04em;
		margin: 0 0 8px;
		color: var(--fg-primary);
	}

	.subtitle {
		font-size: 16px;
		color: var(--fg-tertiary);
		line-height: 1.5;
		max-width: 300px;
		margin: 0 auto;
		font-weight: 500;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		max-width: 440px;
		margin: 0 auto;
	}

	.option-row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		background: var(--bg-surface);
		border-radius: 20px;
		transition: all 0.2s ease;
		position: relative;
		outline: none;
		border: 1.5px solid transparent;
		cursor: pointer;
		text-align: left;
		width: 100%;
	}

	.option-row.selected {
		background: var(--ink-100);
	}

	.orb-column {
		flex-shrink: 0;
	}

	.orb-box {
		width: 48px;
		height: 48px;
		border-radius: 14px;
		overflow: hidden;
		position: relative;
		background: var(--ink-100);
	}



	.info-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.label {
		font-size: 16px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.sub-label {
		font-size: 13px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}

	.hint {
		text-align: center;
		font-size: 13px;
		color: var(--fg-tertiary);
		margin-top: 20px;
		font-weight: 500;
	}
</style>
