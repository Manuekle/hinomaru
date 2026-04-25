<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { invalidate, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { theme } from '$lib/stores/theme';
	import { t } from '$lib/i18n';
	import { pwaInfo } from 'virtual:pwa-info';
	import PWASplash from '$lib/components/PWASplash.svelte';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import { isBrowser } from '$lib/supabase';

	let { children, data } = $props();
	let { supabase, session } = $derived(data);

	// Init locale from server cookie so SSR and client agree — prevents locale flash
	locale.set(data.initialLocale ?? 'es');

	let booting = $state(false);
	let isPWA = $state(false);

	onMount(() => {
		theme.init();

		// Detect PWA mode - combine server-side hint with client-side detection
		const nav = window.navigator as Navigator & { standalone?: boolean };
		const clientPWA =
			window.matchMedia('(display-mode: standalone)').matches ||
			!!nav.standalone;

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

		return () => {
			subscription.unsubscribe();
			clearTimeout(timer);
		};
	});

	const onboardingCompleted = $derived(
		!!data.profile?.onboarding_completed ||
			(isBrowser() && localStorage.getItem('hinomaru_onboarding_completed') === 'true')
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
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html pwaInfo.webManifest.linkTag}
	{/if}
</svelte:head>

<div class="app-container">
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
</style>
