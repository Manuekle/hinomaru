<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp } from '$lib/motion';

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
		style="position:fixed; bottom:24px; left:24px; right:24px; z-index:100;
               background:var(--sumi); color:var(--bg-surface); padding:20px; border-radius:24px;
               display:flex; align-items:center; justify-content:space-between; gap:16px;
               box-shadow:0 12px 40px rgba(0,0,0,0.3); max-width:500px; margin:0 auto;"
	>
		<div style="display:flex; gap:12px; align-items:center;">
			<div
				style="width:48px; height:48px; background:var(--hinomaru-red); border-radius:12px; 
                       display:flex; align-items:center; justify-content:center; flex-shrink:0;"
			>
				<span style="width:16px; height:16px; background:white; border-radius:50%;"></span>
			</div>
			<div>
				<div style="font-weight:700; font-size:15px;">Install Hinomaru</div>
				<div style="font-size:13px; opacity:0.8; line-height:1.3;">
					{isIOS 
						? 'Tap the Share icon and "Add to Home Screen"' 
						: 'Study offline and with a better experience.'}
				</div>
			</div>
		</div>

		<div style="display:flex; gap:8px; align-items:center;">
			{#if !isIOS}
				<button
					onclick={handleInstall}
					style="background:var(--bg-surface); color:var(--sumi); border:none; padding:8px 16px; 
                           border-radius:12px; font-weight:700; font-size:13px; cursor:pointer;"
				>
					Install
				</button>
			{/if}
			<button
				onclick={closePrompt}
				style="background:rgba(255,255,255,0.1); color:white; border:none; width:32px; height:32px; 
                       border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;"
			>
				✕
			</button>
		</div>
	</div>
{/if}
