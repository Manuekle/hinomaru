<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { invalidate, goto } from '$app/navigation';
	import { page, navigating } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { theme } from '$lib/stores/theme';
	import { t } from '$lib/i18n';
	import { untrack } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import PWASplash from '$lib/components/PWASplash.svelte';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import DockBar from '$lib/components/DockBar.svelte';
	import { isBrowser } from '$lib/supabase';
	import { inject } from '@vercel/analytics';
	import { dev } from '$app/environment';
	import { Toaster } from 'svileo';
	import 'svileo/styles.css';
	import { swipeBack } from '$lib/actions/swipeBack';

	let { children, data } = $props();
	let { supabase, session } = $derived(data);

	// Init locale once from server cookie — untrack prevents reactive re-runs that override user selection
	$effect.pre(() => {
		const initial = untrack(() => (data as any).initialLocale ?? 'es');
		locale.set(initial);
	});

	let booting = $derived(data.isPWA ?? false);
	let isPWA = $state(false);

	onMount(() => {
		inject({ mode: dev ? 'development' : 'production' });
		theme.init();

		// Detect PWA mode first, set booting state before revealing body
		const nav = window.navigator as Navigator & { standalone?: boolean };
		const clientPWA = window.matchMedia('(display-mode: standalone)').matches || !!nav.standalone;

		isPWA = data.isPWA || clientPWA;
		booting = isPWA;

		// Reveal body — was hidden by CSS in app.html to prevent SSR flash before splash renders
		document.documentElement.classList.remove('pwa-booting');

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

			// History sentinel: prevents browser from reaching "void" and triggering native swipe-back exit
			history.pushState({ _hm: 1 }, '');
			window.addEventListener('popstate', () => {
				if (!history.state?._hm) {
					history.pushState({ _hm: 1 }, '');
				}
			});
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

<div class="app-container" use:swipeBack>
	<Toaster
		position="top-center"
		offset={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
		options={{
			roundness: 18,
		}}
	/>
	{@render children()}
	{#if data.session && (
		$page.url.pathname === '/' || 
		$page.url.pathname === '/alphabet' || 
		$page.url.pathname === '/vocabulary' || 
		$page.url.pathname === '/deck/stories' || 
		$page.url.pathname === '/deck/songs' || 
		$page.url.pathname === '/conversation' ||
		$page.url.pathname === '/settings'
	)}
		<DockBar />
	{/if}
	<InstallPrompt />
	<PWASplash visible={booting} />
</div>

<style>
</style>
