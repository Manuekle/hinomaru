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
	import { goto } from '$app/navigation';

	let { children, data } = $props();
	let { supabase, session } = $derived(data);

	let headerEl = $state<HTMLElement | null>(null);
	let booting = $state(true);
	let isPWA = $state(false);

	onMount(() => {
		theme.init();

		// Detect PWA mode
		isPWA = window.matchMedia('(display-mode: standalone)').matches || 
				(window.navigator as any).standalone || 
				document.referrer.includes('android-app://');

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// Handle PWA specific redirects
		if (isPWA) {
			const path = $page.url.pathname;
			if (!session && path === '/') {
				goto('/login', { replaceState: true });
			} else if (session && path === '/login') {
				goto('/', { replaceState: true });
			}
		}

		// Keep splash for a minimum duration for premium feel
		const timer = setTimeout(() => {
			booting = false;
		}, 1200);

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

	const showNav = $derived(
		$page.url.pathname === '/' || !!$page.url.pathname.match(/^\/deck\/[^/]+$/)
	);
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

{#if session && showNav}
	<header
		bind:this={headerEl}
		style="position:sticky;top:0;z-index:10;height:64px;background:var(--bg-header);
           backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
           border-bottom:1px solid var(--ink-200);
           display:flex;align-items:center;justify-content:space-between;padding:0 24px;"
	>
		<a
			href="/"
			style="display:flex;align-items:center;gap:10px;cursor:pointer;text-decoration:none;color:inherit;"
		>
			<span
				style="width:20px;height:20px;background:var(--hinomaru-red);border-radius:50%;
                   display:inline-block;flex-shrink:0;
                   box-shadow:0 0 0 0 rgba(188,0,45,0.4);
                   animation:dot-pulse 3s ease-in-out infinite;"
			></span>
			<span class="nav-text" style="font-size:17px;font-weight:700;letter-spacing:-0.01em;">Hinomaru</span>
		</a>

		<nav class="nav-links" style="display:flex;gap:28px;font-size:14px;color:var(--fg-secondary);">
			<a
				href="/"
				style="font-weight:600;color:var(--sumi);text-decoration:none;
               position:relative;padding-bottom:2px;"
				class="nav-link"
			>
				{t('nav.learn', $locale)}
			</a>
		</nav>

		<div style="display:flex;align-items:center;gap:12px;">
			<SupportKofi variant="minimal" />
			<a
				href="/settings"
			aria-label="Settings"
			style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;
             border-radius:50%;color:var(--fg-tertiary);
             transition:background 150ms ease, color 150ms ease;"
			onmouseenter={(e) => {
				(e.currentTarget as HTMLElement).style.background = 'var(--ink-100)';
				(e.currentTarget as HTMLElement).style.color = 'var(--sumi)';
			}}
			onmouseleave={(e) => {
				(e.currentTarget as HTMLElement).style.background = '';
				(e.currentTarget as HTMLElement).style.color = 'var(--fg-tertiary)';
			}}
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path
					d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
				></path>
				<circle cx="12" cy="12" r="3"></circle>
			</svg>
		</a>
	</header>
{/if}

{@render children()}
<InstallPrompt />
<PWASplash visible={booting} />

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

	.nav-link::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 100%;
		height: 2px;
		background: var(--hinomaru-red);
		border-radius: 2px;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	.nav-link:hover::after {
		transform: scaleX(1);
	}

	@media (max-width: 600px) {
		.nav-text,
		.nav-links {
			display: none !important;
		}
	}
</style>
