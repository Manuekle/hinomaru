<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { invalidate, goto } from '$app/navigation';
	import { page, navigating } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { theme, resolvedTheme } from '$lib/stores/theme';
	import { t } from '$lib/i18n';
	import { untrack } from 'svelte';
	// @ts-expect-error - Virtual module from vite-plugin-pwa
	import { pwaInfo } from 'virtual:pwa-info';
	import PWASplash from '$lib/components/PWASplash.svelte';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import DockBar from '$lib/components/DockBar.svelte';
	import { inject } from '@vercel/analytics';
	import { dev } from '$app/environment';
	import { Toaster } from 'svileo';
	import 'svileo/styles.css';
	import 'flag-icons/css/flag-icons.min.css';
	import { swipeBack } from '$lib/actions/swipeBack';
	import { scheduleReminder, clearReminder } from '$lib/utils/reminders';
	import { notificationsEnabled, reminderHour } from '$lib/stores/settings';
	import { get } from 'svelte/store';

	let { children, data } = $props();
	let { supabase, session } = $derived(data);

	// Init locale once from server cookie — untrack prevents reactive re-runs that override user selection
	$effect.pre(() => {
		const initial = untrack(() => (data as any).initialLocale ?? 'es');
		locale.set(initial);
	});

	let booting = $state(data.isPWA ?? false);
	let isPWA = $state(false);

	onMount(() => {
		inject({ mode: dev ? 'development' : 'production' });
		theme.init();

		const ua = navigator.userAgent;
		const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
		const isAndroid = /Android/.test(ua);
		document.documentElement.classList.toggle('is-ios', isIOS);
		document.documentElement.classList.toggle('is-android', isAndroid);

		// Detect PWA mode first, set booting state before revealing body
		const nav = window.navigator as Navigator & { standalone?: boolean };
		const clientPWA = window.matchMedia('(display-mode: standalone)').matches || !!nav.standalone;

		isPWA = data.isPWA || clientPWA;
		booting = isPWA;

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			if (event === 'SIGNED_OUT') {
				try {
					localStorage.removeItem('hinomaru_onboarding_completed');
				} catch {
					// Ignore localStorage errors
				}
				clearReminder();
			}
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		// Daily review reminder (local). Honors profile.reminder_hour if present,
		// falls back to local store. Only schedules if user granted permission.
		if (data.user) {
			const hour = (data.profile as any)?.reminder_hour ?? get(reminderHour);
			scheduleReminder(supabase, data.user.id, hour, get(notificationsEnabled));
		}

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
		}, 900);

		return () => {
			subscription.unsubscribe();
			clearTimeout(timer);
			clearReminder();
		};
	});

	const onboardingCompleted = $derived(!!data.profile?.onboarding_completed);

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
		offset={{ top: 'calc(env(safe-area-inset-top, 0px) + 6px)' }}
		options={{
			roundness: 20,
			autopilot: true,
		}}
	/>
	{@render children()}
	{#if data.session && !booting && new Set(['/', '/alphabet', '/vocabulary', '/deck/stories', '/deck/songs', '/conversation', '/jlpt']).has($page.url.pathname)}
		<DockBar />
	{/if}
	{#if !data.session && !booting && $page.url.pathname === '/'}
		<InstallPrompt />
	{/if}
	<PWASplash visible={booting} />
</div>

<style>
</style>
