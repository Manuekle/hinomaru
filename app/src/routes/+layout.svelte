<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { theme } from '$lib/stores/theme';
	import { t } from '$lib/i18n';
	import { animate } from 'motion/mini';
	import { pwaInfo } from 'virtual:pwa-info';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import SupportKofi from '$lib/components/SupportKofi.svelte';
	import PWASplash from '$lib/components/PWASplash.svelte';
	import { isBrowser } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let { children, data } = $props();
	let { supabase, session } = $derived(data);

	let headerEl = $state<HTMLElement | null>(null);
	let booting = $state(false);
	let isPWA = $state(false);

	onMount(() => {
		theme.init();
		
		// Detect PWA mode - combine server-side hint with client-side detection
		const clientPWA = window.matchMedia('(display-mode: standalone)').matches || 
				(window.navigator as any).standalone;
		
		isPWA = data.isPWA || clientPWA;
		booting = isPWA;

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// Handle PWA specific redirects and URL cleanup
		if (isPWA) {
			const path = $page.url.pathname;
			let targetPath = path;
			
			if (!session && path === '/') {
				targetPath = '/login';
			} else if (session && path === '/login') {
				targetPath = '/';
			}
			
			// Navigate if path changed OR if we need to remove ?pwa=1
			if (targetPath !== path || $page.url.searchParams.has('pwa')) {
				goto(targetPath, { replaceState: true, noScroll: true, keepFocus: true });
			}
		} else {
			// If not PWA, we can hide the splash immediately
			booting = false;
		}

		// Hide splash after a short delay if it's still showing
		const timer = setTimeout(() => {
			booting = false;
		}, 500);

		// Animate header in
		if (headerEl) {
			animate(
				headerEl,
				{ opacity: [0, 1], y: [-8, 0] },
				{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }
			);
		}

		return () => {
			subscription.unsubscribe();
			clearTimeout(timer);
		};
	});

	const onboardingCompleted = $derived(
		!!data.profile?.onboarding_completed || 
		(isBrowser() && localStorage.getItem('hinomaru_onboarding_completed') === 'true')
	);

	const showNav = $derived(
		session && 
		onboardingCompleted &&
		$page.url.pathname === '/'
	);

	// Reactively handle onboarding redirects after login/signup
	$effect(() => {
		if (session && !onboardingCompleted && $page.url.pathname !== '/onboarding') {
			goto('/onboarding', { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>{t('seo.title', $locale)}</title>
	<meta name="description" content={t('seo.description', $locale)} />
	<link rel="canonical" href="https://hinomaru.app{$page.url.pathname}" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://hinomaru.app{$page.url.pathname}" />
	<meta property="og:title" content={t('seo.title', $locale)} />
	<meta property="og:description" content={t('seo.description', $locale)} />
	<meta property="og:image" content="https://hinomaru.app/landing_hero.png" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://hinomaru.app{$page.url.pathname}" />
	<meta property="twitter:title" content={t('seo.title', $locale)} />
	<meta property="twitter:description" content={t('seo.description', $locale)} />
	<meta property="twitter:image" content="https://hinomaru.app/landing_hero.png" />

	{#if pwaInfo}
		{@html pwaInfo.webManifest.linkTag}
	{/if}
</svelte:head>

<div class="app-container">
	{#if showNav}
		<header
			bind:this={headerEl}
			class="premium-nav"
		>
			<div class="nav-content">
				<!-- Profile / Left slot (Removed) -->
				<div class="nav-slot left"></div>

				<!-- Logo / Center slot (Removed) -->
				<div class="nav-slot center"></div>

				<!-- Actions / Right slot -->
				<div class="nav-slot right">
					<div class="nav-actions">
						<SupportKofi variant="minimal" />
						<a href="/settings" class="settings-btn" aria-label="Settings">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</header>
	{/if}

	{@render children()}
	<InstallPrompt />
	<PWASplash visible={booting} />
</div>


<style>
	@keyframes dot-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(188, 0, 45, 0);
		}
		50% {
			box-shadow: 0 0 0 5px rgba(188, 0, 45, 0);
		}
	}


	.premium-nav {
		position: sticky;
		top: 0;
		z-index: 100;
		padding-top: env(safe-area-inset-top);
		background: transparent;
	}

	.nav-content {
		max-width: 1100px;
		margin: 0 auto;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
	}

	.nav-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: inherit;
	}

	.nav-slot {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.nav-slot.center {
		justify-content: center;
	}

	.nav-slot.right {
		justify-content: flex-end;
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		background: var(--ink-100);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-tertiary);
		border: 1px solid var(--ink-200);
		overflow: hidden;
	}

	.user-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.brand-dot {
		width: 10px;
		height: 10px;
		background: var(--hinomaru-red);
		border-radius: 50%;
		box-shadow: 0 4px 12px rgba(188, 0, 45, 0.2);
	}

	.brand-text {
		font-weight: 800;
		font-size: 18px;
		letter-spacing: -0.04em;
	}

	/* Compact "Action Pill" */
	.nav-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		background: var(--bg-header);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		padding: 4px 10px;
		border-radius: 100px;
		border: 1px solid var(--ink-200);
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}

	.settings-btn {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		transition: all 200ms ease;
	}

	.settings-btn:hover {
		color: var(--sumi);
		background: rgba(0,0,0,0.05);
	}

	/* Mobile brand — hidden by default on desktop */
	.nav-brand-mobile {
		display: none;
	}

	@media (max-width: 600px) {
		.premium-nav {
			position: static;
		}

		.nav-content {
			height: 64px;
			padding: 0 16px;
		}
		
		.brand-text {
			font-size: 18px;
		}

		.brand-dot {
			width: 8px;
			height: 8px;
		}
		
		/* On mobile, hide the centered slot and show brand in left slot */
		.center {
			display: none;
		}

		.nav-brand-mobile {
			display: flex;
			margin-left: 8px;
		}
	}
</style>
