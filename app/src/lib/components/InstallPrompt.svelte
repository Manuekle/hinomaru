<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';

	let deferredPrompt = $state<any>(null);
	let showPrompt = $state(false);
	let isIOS = $state(false);

	onMount(() => {
		// Detect iOS
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

		// Handle Android/Chrome Install Prompt
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			// Only show if not already installed
			if (!window.matchMedia('(display-mode: standalone)').matches) {
				showPrompt = true;
			}
		});

		// For iOS, we can't detect 'beforeinstallprompt', so we show it once or based on a timer
		if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
			const hasSeen = localStorage.getItem('ios_prompt_seen');
			if (!hasSeen) {
				setTimeout(() => (showPrompt = true), 3000);
			}
		}
	});

	async function handleInstall() {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === 'accepted') {
				showPrompt = false;
			}
			deferredPrompt = null;
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
	<div
		use:fadeUp={{ y: 20 }}
		style="position:fixed; bottom:calc(24px + env(safe-area-inset-bottom)); left:max(24px, env(safe-area-inset-left)); right:max(24px, env(safe-area-inset-right)); z-index:100;
               background:var(--bg-header); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
               color:var(--fg-primary); padding:16px 20px; 
               border-radius:24px; border:1px solid var(--ink-200);
               display:flex; align-items:center; justify-content:space-between; gap:16px;
               box-shadow:var(--shadow-md); max-width:500px; margin:0 auto;"
	>
		<div style="display:flex; gap:12px; align-items:center;">
			<div
				style="width:44px; height:44px; background:#ffffff; border-radius:12px; 
                       display:flex; align-items:center; justify-content:center; flex-shrink:0;
                       box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
			>
				<span style="width:18px; height:18px; background:#bc002d; border-radius:50%;"></span>
			</div>
			<div>
				<div style="font-weight:700; font-size:15px; line-height:1.2;">{t('pwa.install.title', $locale)}</div>
				<div style="font-size:13px; color:var(--fg-secondary); line-height:1.3; margin-top:1px;">
					{isIOS 
						? t('pwa.install.ios', $locale) 
						: t('pwa.install.desc', $locale)}
				</div>
			</div>
		</div>

		<div style="display:flex; gap:8px; align-items:center;">
			{#if !isIOS}
				<button
					onclick={handleInstall}
					style="background:var(--sumi); color:var(--washi); border:none; padding:8px 16px; 
                           border-radius:12px; font-weight:700; font-size:13px; cursor:pointer;
                           transition: transform 0.1s ease;"
                    onmousedown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                    onmouseup={(e) => (e.currentTarget.style.transform = 'scale(1)')}
				>
					{t('pwa.install.btn', $locale)}
				</button>
			{/if}
			<button
				onclick={closePrompt}
				aria-label="Close"
				style="background:var(--ink-100); color:var(--fg-tertiary); border:none; width:32px; height:32px; 
                       border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;
                       transition: background 0.2s ease, color 0.2s ease;"
                onmouseenter={(e) => {
                    e.currentTarget.style.background = 'var(--ink-200)';
                    e.currentTarget.style.color = 'var(--fg-primary)';
                }}
                onmouseleave={(e) => {
                    e.currentTarget.style.background = 'var(--ink-100)';
                    e.currentTarget.style.color = 'var(--fg-tertiary)';
                }}
			>
				<Icon icon={Cancel01Icon} size={14} strokeWidth={2.5} />
			</button>
		</div>
	</div>
{/if}
