<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn } from '$lib/motion';
	import { fly } from 'svelte/transition';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import Landing from '$lib/components/Landing.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
	let activeLevel = $state('N5');

	const filtered = $derived(data.decks.filter((d) => d.level === activeLevel));
	const totalLearned = $derived(data.decks.reduce((s, d) => s + (d.learned ?? 0), 0));
</script>

{#if !data.user}
	<Landing decks={data.decks} />
{:else}
	<div style="max-width:720px;margin:0 auto;padding:40px 24px 120px;">
	<!-- Header -->
	<div
		use:fadeUp={{ delay: 0, y: 12 }}
		style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;"
	>
		<div class="label-meta">{t('home.streak', $locale, { n: data.streak })}</div>
	</div>

	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;"
	>
		{t('home.title', $locale)}
	</h1>

	<p use:fadeUp={{ delay: 0.12, y: 12 }} style="font-size:16px;color:var(--fg-secondary);margin:0;">
		{t('home.summary', $locale, { n: totalLearned })}
	</p>

	<!-- Level tabs -->
	<div
		use:fadeIn={{ delay: 0.18 }}
		style="display:flex;gap:8px;margin-top:32px;margin-bottom:20px;overflow-x:auto;"
	>
		{#each levels as level (level)}
			<button
				onclick={() => {
					activeLevel = level;
				}}
				style="height:36px;padding:0 16px;border-radius:999px;
               border:1px solid {activeLevel === level ? 'var(--sumi)' : 'var(--ink-200)'};
               background:{activeLevel === level ? 'var(--sumi)' : 'var(--bg-surface)'};
               color:{activeLevel === level ? 'var(--bg-surface)' : 'var(--sumi)'};
               font-weight:600;font-size:13px;cursor:pointer;font-family:var(--font-ui);
               white-space:nowrap;transition:background 180ms ease,color 180ms ease,border-color 180ms ease;"
			>
				{level}
			</button>
		{/each}
	</div>

	<div style="display:grid; grid-template-columns: 1fr;">
		{#key activeLevel}
			<div
				in:fly={{ y: 20, duration: 300, delay: 200, easing: cubicOut }}
				out:fly={{ y: -20, duration: 200, easing: cubicIn }}
				style="grid-area: 1 / 1; display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px; align-content: start;"
			>
				{#if filtered.length === 0}
					<div
						style="padding:40px;text-align:center;color:var(--fg-tertiary);border:1px dashed var(--ink-200);border-radius:24px;grid-column:1 / -1;"
					>
						{t('home.empty', $locale)}
					</div>
				{/if}
				{#each filtered as deck (deck.id)}
					{@const pct =
						deck.card_count > 0 ? Math.round(((deck.learned ?? 0) / deck.card_count) * 100) : 0}
					{@const complete = deck.card_count > 0 && (deck.learned ?? 0) >= deck.card_count}
					<a
						href="/deck/{deck.id}"
						style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:20px;
                   cursor:pointer;text-decoration:none;color:inherit;display:block;
                   box-shadow:var(--shadow-sm);
                   transition:box-shadow 200ms ease, transform 200ms ease;"
						onmouseenter={(e) => {
							(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
							(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
						}}
						onmouseleave={(e) => {
							(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
							(e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
						}}
					>
						<div
							style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"
						>
							<div style="display:flex;gap:6px;align-items:center;">
								<span class="hm-pill hm-pill-red">{deck.level}</span>
								{#if deck.due > 0}
									<span class="hm-pill" style="background:var(--sumi);color:var(--bg-surface);">
										{deck.due} {t('home.due', $locale)}
									</span>
								{/if}
							</div>
							<span style="font-size:12px;color:var(--fg-secondary);"
								>{t('home.cards', $locale, { n: deck.card_count })}</span
							>
						</div>
						<div class="label-meta" style="margin-bottom:4px;">
							{$locale === 'es' ? (deck.kind_es ?? deck.kind) : deck.kind}
						</div>
						<div style="font-size:20px;font-weight:600;letter-spacing:-0.01em;">
							{$locale === 'es' ? deck.title_es : deck.title_en}
						</div>
						<div style="font-size:14px;color:var(--fg-secondary);margin-top:4px;line-height:1.5;">
							{$locale === 'es' ? deck.desc_es : deck.desc_en}
						</div>
						<div style="margin-top:20px;">
							<div class="hm-progress">
								<div
									class="hm-progress-bar"
									style="width:{pct}%;background:{complete
										? 'var(--success)'
										: 'var(--hinomaru-red)'};"
								></div>
							</div>
							<div class="label-meta" style="margin-top:8px;">
								{complete
									? t('home.complete', $locale)
									: t('home.learned', $locale, { a: deck.learned ?? 0, b: deck.card_count })}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/key}
	</div>
</div>
{/if}
