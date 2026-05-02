<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, staggerChildren, popIn, animateNumber } from '$lib/motion';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import { svileo } from '$lib/stores/toast';
	import { addXP } from '$lib/utils/gamification';
	import { createClient } from '$lib/supabase';
	import { playFinish } from '$lib/utils/sounds';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const supabase = createClient();

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

	const xpEarned = $derived(correct * 5);

	// Animated score counter
	let displayScore = $state(0);
	let displayTotal = $state(0);
	let displayXP = $state(0);

	onMount(async () => {
		animateNumber((v) => (displayScore = v), correct, { duration: 0.9, delay: 0.4 });
		animateNumber((v) => (displayTotal = v), total, { duration: 0.7, delay: 0.3 });
		animateNumber((v) => (displayXP = v), xpEarned, { duration: 1.2, delay: 0.6 });
		playFinish();

		const { data: { user } } = await supabase.auth.getUser();
		if (user && xpEarned > 0) {
			await addXP(supabase, user.id, xpEarned);
			await invalidateAll();
		}

		if (pct >= 70) {
			setTimeout(() => {
				svileo.success({ title: t('summary.complete', $locale) });
			}, 1000);
		}
	});
</script>

<div
	style="min-height:100dvh;background:var(--paper);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:calc(24px + env(safe-area-inset-top)) 24px 140px;position:relative;overflow:hidden;"
>
	<!-- Decorative background circle (gently pulsing via CSS) -->
	<div
		style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
              width:320px;height:320px;background:var(--hinomaru-red);border-radius:50%;
              opacity:0.06;pointer-events:none;animation:pulse-bg 4s ease-in-out infinite;"
	></div>

	<div style="position:relative;max-width:420px;width:100%;text-align:center;">
		<!-- Label -->
		<div use:fadeUp={{ delay: 0.1, y: 8 }} class="summary-label" style="margin-bottom:16px; font-weight: 800;">
			{t('summary.complete', $locale)}
		</div>

		<!-- Score — animated counter -->
		<div
			use:popIn={{ delay: 0.2 }}
			class="summary-score"
		>
			{displayScore} / {displayTotal}
		</div>

		<div
			use:fadeUp={{ delay: 0.45, y: 8 }}
			class="summary-msg"
			style="margin-top:12px;"
		>
			{message}
		</div>

		<!-- Stats cards with stagger -->
		<div
			use:staggerChildren={{ delay: 0.55, stagger: 0.1, y: 10 }}
			class="summary-stats-list"
		>
			<div class="summary-stat-item centered">
				<span class="summary-stat-key">{t('summary.xp', $locale)}</span>
				<span class="summary-stat-val xp">+{displayXP} XP</span>
			</div>
			<div class="summary-stat-item centered">
				<span class="summary-stat-key">{t('summary.accuracy', $locale)}</span>
				<span class="summary-stat-val" style="color:{pct >= 70 ? 'var(--success)' : 'var(--hinomaru-red)'};">
					{pct}%
				</span>
			</div>
		</div>

		<StickyFooter>
			<a href="/" class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg summary-back-btn">
				{t('summary.back', $locale)}
			</a>
		</StickyFooter>
	</div>

	{#if pct >= 70}
		<Confetti fireOnMount={true} />
	{/if}
</div>

<style>
	@media (hover: hover) {
		.summary-back-btn:hover {
			box-shadow: 0 8px 28px rgba(188, 0, 45, 0.3);
			transform: translateY(-2px);
		}
	}

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
