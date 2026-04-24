<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, staggerChildren, popIn, animateNumber } from '$lib/motion';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const correct = $derived(Number($page.url.searchParams.get('correct') ?? 0));
	const total = $derived(Number($page.url.searchParams.get('total') ?? 0));
	const pct = $derived(total > 0 ? Math.round((correct / total) * 100) : 0);

	const message = $derived(
		pct === 100
			? t('summary.all', $locale)
			: pct >= 70
				? t('summary.solid', $locale)
				: t('summary.retry', $locale)
	);

	// Animated score counter
	let displayScore = $state(0);
	let displayTotal = $state(0);

	onMount(() => {
		animateNumber((v) => (displayScore = v), correct, { duration: 0.9, delay: 0.4 });
		animateNumber((v) => (displayTotal = v), total, { duration: 0.7, delay: 0.3 });
	});
</script>

<div
	style="min-height:100vh;background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;position:relative;overflow:hidden;"
>
	<!-- Decorative background circle (gently pulsing via CSS) -->
	<div
		style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
              width:320px;height:320px;background:var(--hinomaru-red);border-radius:50%;
              opacity:0.06;pointer-events:none;animation:pulse-bg 4s ease-in-out infinite;"
	></div>

	<div style="position:relative;max-width:420px;width:100%;text-align:center;">
		<!-- Label -->
		<div use:fadeUp={{ delay: 0.1, y: 8 }} class="label-meta" style="margin-bottom:16px;">
			{t('summary.complete', $locale)}
		</div>

		<!-- Score — animated counter -->
		<div
			use:popIn={{ delay: 0.2 }}
			style="font-size:64px;font-weight:700;letter-spacing:-0.02em;line-height:1;"
		>
			{displayScore} / {displayTotal}
		</div>

		<div
			use:fadeUp={{ delay: 0.45, y: 8 }}
			style="font-size:18px;color:var(--fg-secondary);margin-top:12px;"
		>
			{message}
		</div>

		<!-- Stats cards with stagger -->
		<div
			use:staggerChildren={{ delay: 0.55, stagger: 0.1, y: 10 }}
			style="display:flex;flex-direction:column;gap:10px;margin-top:40px;"
		>
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:16px;padding:14px 18px;display:flex;justify-content:space-between;"
			>
				<span style="color:var(--fg-secondary);">{t('summary.deck', $locale)}</span>
				<span style="font-weight:600;"
					>{$locale === 'es' ? data.deck?.title_es : data.deck?.title_en}</span
				>
			</div>
			<div
				style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:16px;padding:14px 18px;display:flex;justify-content:space-between;"
			>
				<span style="color:var(--fg-secondary);">{t('summary.accuracy', $locale)}</span>
				<span style="font-weight:600;color:{pct >= 70 ? 'var(--success)' : 'var(--hinomaru-red)'};"
					>{pct}%</span
				>
			</div>
		</div>

		<!-- CTA -->
		<div use:fadeUp={{ delay: 0.75, y: 12 }} style="margin-top:32px;padding-bottom:calc(16px + env(safe-area-inset-bottom));">
			<a
				href="/"
				class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg"
				style="transition:box-shadow 180ms ease, transform 150ms ease;"
				onmouseenter={(e) => {
					(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(188,0,45,0.30)';
					(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
				}}
				onmouseleave={(e) => {
					(e.currentTarget as HTMLElement).style.boxShadow = '';
					(e.currentTarget as HTMLElement).style.transform = '';
				}}
			>
				{t('summary.back', $locale)}
			</a>
		</div>
	</div>
</div>

<style>
	@keyframes pulse-bg {
		0%,
		100% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.06;
		}
		50% {
			transform: translate(-50%, -50%) scale(1.06);
			opacity: 0.09;
		}
	}
</style>
