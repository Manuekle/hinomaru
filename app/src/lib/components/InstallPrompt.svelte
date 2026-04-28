<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';
	import AppDownloadDrawer from './AppDownloadDrawer.svelte';

	import { deferredPrompt, isInstalled } from '$lib/stores/pwa';
	
	let showPrompt = $state(false);
	let isIOS = $state(false);
	let showDrawer = $state(false);

	onMount(() => {
		// Detect iOS
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

		// Subscribe to store to show prompt
		const unsubPrompt = deferredPrompt.subscribe(prompt => {
			if (prompt && !$isInstalled) {
				showPrompt = true;
			}
		});

		// For iOS, show it once or based on a timer
		if (isIOS && !$isInstalled) {
			const hasSeen = localStorage.getItem('ios_prompt_seen');
			if (!hasSeen) {
				setTimeout(() => (showPrompt = true), 3000);
			}
		}

		return () => {
			unsubPrompt();
		};
	});

	async function handleInstall() {
		if ($deferredPrompt) {
			$deferredPrompt.prompt();
			const { outcome } = await $deferredPrompt.userChoice;
			if (outcome === 'accepted') {
				showPrompt = false;
			}
			deferredPrompt.set(null);
		}
	}

	function closePrompt() {
		showPrompt = false;
		if (isIOS) {
			localStorage.setItem('ios_prompt_seen', 'true');
		}
	}
</script>

{#if showPrompt}
	<div class="prompt-wrap" use:fadeUp={{ y: 20 }}>
		<div class="prompt-container">
			<div class="prompt-content">
				<!-- Japan Flag Icon (Fixed white background) -->
				<div class="flag-icon">
					<span class="flag-circle"></span>
				</div>
				
				<div class="text-content">
					<div class="title">
						{t('pwa.download.title', $locale)}
					</div>
					<div class="desc">
						{isIOS ? t('pwa.install.ios', $locale) : t('pwa.install.desc', $locale)}
					</div>
				</div>
			</div>

			<div class="actions">
				{#if isIOS}
					<button
						onclick={() => (showDrawer = true)}
						class="action-btn ios-btn"
						ontouchstart={() => {}}
					>
						<Icon icon={InformationCircleIcon} size={14} strokeWidth={2.5} />
						{t('onboarding.features.how', $locale)}
					</button>
				{:else}
					<button
						onclick={handleInstall}
						class="action-btn install-btn"
						ontouchstart={() => {}}
					>
						{t('pwa.download.btn', $locale)}
					</button>
				{/if}
				
				<button
					onclick={closePrompt}
					aria-label="Close"
					class="close-btn"
					ontouchstart={() => {}}
				>
					<Icon icon={Cancel01Icon} size={14} strokeWidth={2.5} />
				</button>
			</div>
		</div>
	</div>
{/if}

<AppDownloadDrawer bind:open={showDrawer} />

<style>
	.prompt-wrap {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		display: flex;
		justify-content: center;
		padding: 0 12px max(16px, calc(env(safe-area-inset-bottom, 0px) - 14px));
		pointer-events: none;
		transform: translateZ(0);
		-webkit-transform: translateZ(0);
	}

	.prompt-container {
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(24px) saturate(190%);
		-webkit-backdrop-filter: blur(24px) saturate(190%);
		border: 0.5px solid rgba(0, 0, 0, 0.1);
		border-radius: 24px;
		padding: 12px 12px 12px 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		box-shadow: 
			0 12px 32px rgba(0, 0, 0, 0.12),
			0 2px 8px rgba(0, 0, 0, 0.06);
		max-width: 500px;
		width: 100%;
		pointer-events: auto;
	}

	:global([data-theme='dark']) .prompt-container {
		background: rgba(28, 28, 30, 0.75);
		border-color: rgba(255, 255, 255, 0.1);
		box-shadow: 
			0 10px 30px rgba(0, 0, 0, 0.4),
			0 1px 8px rgba(0, 0, 0, 0.2);
	}

	.prompt-content {
		display: flex;
		gap: 12px;
		align-items: center;
		min-width: 0;
	}

	.flag-icon {
		width: 40px;
		height: 40px;
		background: #ffffff; /* Always white background */
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		border: 0.5px solid rgba(0, 0, 0, 0.05);
	}

	.flag-circle {
		width: 16px;
		height: 16px;
		background: #bc002d;
		border-radius: 50%;
	}

	.text-content {
		min-width: 0;
	}

	.title {
		font-weight: 700;
		font-size: 14px;
		line-height: 1.2;
		color: var(--fg-primary);
	}

	.desc {
		font-size: 12px;
		color: var(--fg-secondary);
		line-height: 1.3;
		margin-top: 1px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.actions {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-shrink: 0;
	}

	.action-btn {
		border: none;
		padding: 8px 14px;
		border-radius: 12px;
		font-weight: 700;
		font-size: 13px;
		cursor: pointer;
		transition: transform 0.1s ease, background 0.2s ease;
		display: flex;
		align-items: center;
		gap: 6px;
		height: 38px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.install-btn {
		background: var(--sumi);
		color: var(--washi);
	}

	.ios-btn {
		background: var(--ink-100);
		color: var(--fg-secondary);
	}

	.action-btn:active {
		transform: scale(0.94);
	}

	.close-btn {
		background: var(--ink-100);
		color: var(--fg-tertiary);
		border: none;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s ease, color 0.2s ease, transform 0.1s ease;
		-webkit-tap-highlight-color: transparent;
		flex-shrink: 0;
	}

	.close-btn:active {
		transform: scale(0.94);
		background: var(--ink-200);
	}

	@media (hover: hover) {
		.install-btn:hover { opacity: 0.9; }
		.ios-btn:hover { background: var(--ink-200); color: var(--sumi); }
		.close-btn:hover { background: var(--ink-200); color: var(--fg-primary); }
	}

	@media (max-width: 400px) {
		.desc { display: none; }
		.title { font-size: 13px; }
	}
</style>
