<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import { speakVoicevox } from '$lib/services/voicevox';
	import Icon from '$lib/Icon.svelte';
	import { 
		MusicNote01Icon, 
		Mic02Icon, 
		PlayIcon,
		Settings02Icon
	} from '@hugeicons/core-free-icons';

	let text = $state('こんにちは、ヒノマルのボイスボックスのテストです。');
	let preset = $state<'kawaii' | 'cool'>('kawaii');
	let speed = $state(1.0);
	let pitch = $state(0.0);
	let volume = $state(1.0);
	let isPlaying = $state(false);

	async function handlePlay() {
		if (isPlaying) return;
		isPlaying = true;
		try {
			await speakVoicevox(text, preset, speed, pitch, volume);
		} catch (e) {
			console.error(e);
		} finally {
			isPlaying = false;
		}
	}
</script>

<svelte:head>
	<title>TTS Debug — Hinomaru</title>
</svelte:head>

<div class="debug-page">
	<div use:fadeUp={{ delay: 0, y: 10 }}>
		<a href="/settings" class="back-link">← {t('deck.back', $locale)}</a>
	</div>

	<h1 use:fadeUp={{ delay: 0.05, y: 14 }} class="page-title">
		TTS Laboratory 🧪
	</h1>

	<div use:fadeUp={{ delay: 0.1, y: 16 }} class="card laboratory-card">
		<div class="section">
			<p class="section-label">Japanese Text</p>
			<textarea 
				bind:value={text} 
				placeholder="Enter Japanese text here..."
				class="debug-textarea"
			></textarea>
		</div>

		<div class="section">
			<p class="section-label">Voice Preset</p>
			<div class="segmented">
				<div
					class="seg-glider"
					style="width:calc(50% - 4px);transform:translateX({preset === 'kawaii' ? '0' : '100%'})"
				></div>
				<button
					class="seg-btn"
					class:active={preset === 'kawaii'}
					onclick={() => preset = 'kawaii'}
				>
					<Icon icon={Mic02Icon} size={13} color="currentColor" /> Kawaii
				</button>
				<button
					class="seg-btn"
					class:active={preset === 'cool'}
					onclick={() => preset = 'cool'}
				>
					<Icon icon={MusicNote01Icon} size={13} color="currentColor" /> Cool
				</button>
			</div>
		</div>

		<div class="controls-grid">
			<div class="section">
				<p class="section-label">Speed ({speed.toFixed(1)})</p>
				<input type="range" min="0.5" max="2.0" step="0.1" bind:value={speed} class="debug-range" />
			</div>
			<div class="section">
				<p class="section-label">Pitch ({pitch.toFixed(1)})</p>
				<input type="range" min="-1.0" max="1.0" step="0.1" bind:value={pitch} class="debug-range" />
			</div>
			<div class="section">
				<p class="section-label">Volume ({volume.toFixed(1)})</p>
				<input type="range" min="0.0" max="2.0" step="0.1" bind:value={volume} class="debug-range" />
			</div>
		</div>

		<button 
			class="play-btn" 
			onclick={handlePlay} 
			disabled={isPlaying || !text}
		>
			{#if isPlaying}
				<div class="spinner"></div>
			{:else}
				<Icon icon={PlayIcon} size={20} color="currentColor" />
				Play Audio
			{/if}
		</button>
	</div>
</div>

<style>
	.debug-page {
		max-width: 600px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 24px 100px;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		font-size: 13px;
		color: var(--fg-tertiary);
		text-decoration: none;
		margin-bottom: 6px;
	}

	.page-title {
		font-size: 34px;
		font-weight: 700;
		letter-spacing: -0.025em;
		margin: 0 0 28px;
		color: var(--fg-primary);
	}

	.card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 24px;
		box-shadow: var(--shadow-lg);
	}

	.section-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		margin-bottom: 8px;
	}

	.debug-textarea {
		width: 100%;
		min-height: 120px;
		background: var(--ink-100);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 16px;
		color: var(--fg-primary);
		font-size: 16px;
		resize: vertical;
		font-family: inherit;
	}

	.debug-textarea:focus {
		outline: none;
		border-color: var(--sumi);
	}

	.controls-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.debug-range {
		width: 100%;
		accent-color: var(--sumi);
	}

	.play-btn {
		background: var(--sumi);
		color: white;
		border: none;
		border-radius: 16px;
		padding: 16px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.play-btn:active {
		transform: scale(0.96);
	}

	.play-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Reuse segmented styles from settings or define here */
	.segmented {
		display: flex;
		background: var(--ink-100);
		padding: 4px;
		border-radius: 14px;
		position: relative;
	}

	.seg-glider {
		position: absolute;
		height: calc(100% - 8px);
		background: var(--bg-surface);
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
		transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
	}

	.seg-btn {
		flex: 1;
		z-index: 1;
		border: none;
		background: transparent;
		padding: 8px;
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
	}

	.seg-btn.active {
		color: var(--fg-primary);
	}
</style>
