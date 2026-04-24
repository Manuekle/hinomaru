<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const cards = $derived(data.cards as { jp: string; en: string; romaji: string }[]);
	const supabase = createClient();

	let i = $state(0);
	let picked = $state<string | null>(null);
	let correct = $state(0);

	const card = $derived(cards[i]);
	const pct = $derived(((i + 1) / cards.length) * 100);
	const isCorrect = $derived(picked === (card?.en ?? ''));

	const options = $derived.by(() => {
		if (!card) return [];
		const others = cards.filter((_, j) => j !== i).map((c) => c.en);
		const seed = i * 13 + 7;
		const picks: string[] = [];
		const pool = [...others];
		for (let k = 0; k < 2 && pool.length; k++) {
			const idx = (seed + k * 3) % pool.length;
			picks.push(pool.splice(idx, 1)[0]);
		}
		return [...picks, card.en].sort(
			(a: string, b: string) => ((a.charCodeAt(0) + i) % 7) - ((b.charCodeAt(0) + i) % 7)
		);
	});

	function pick(opt: string) {
		if (picked) return;
		picked = opt;
		if (opt === card.en) correct++;
	}

	async function next() {
		// Save progress for this specific card before moving to next
		await updateCardProgress(card, isCorrect);

		if (i >= cards.length - 1) {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (user)
				await supabase.from('sessions').insert({
					user_id: user.id,
					deck_id: data.deck.id,
					mode: 'quiz',
					correct,
					total: cards.length
				});
			const params = new URLSearchParams({
				correct: String(correct),
				total: String(cards.length),
				mode: 'quiz'
			});
			goto(`/deck/${data.deck.id}/summary?${params}`);
		} else {
			picked = null;
			i++;
		}
	}

	async function updateCardProgress(c: any, gotIt: boolean) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;

		const currentProgress = c.progress && c.progress.length > 0 ? c.progress[0] : null;
		const quality = mapPerformanceToQuality(gotIt);
		const nextState = calculateNextReview(quality, currentProgress);

		await supabase.from('progress').upsert({
			user_id: user.id,
			card_id: c.id,
			learned: true,
			...nextState,
			last_seen: new Date().toISOString()
		});
	}
</script>

<div style="display:flex;flex-direction:column;min-height:100vh;background:var(--paper);">
	<div class="session-topbar">
		<div class="session-topbar-fill" style="width:{pct}%;"></div>
	</div>
	<div style="padding:12px 20px;display:flex;justify-content:space-between;align-items:center;">
		<a
			href="/deck/{data.deck.id}"
			style="color:var(--fg-secondary);text-decoration:none;font-size:22px;line-height:1;">✕</a
		>
		<div class="label-meta">{t('session.progress', $locale, { a: i + 1, b: cards.length })}</div>
		<div style="width:22px;"></div>
	</div>

	{#if card}
		<div
			style="flex:1;padding:32px 24px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;"
		>
			<div
				style="background:var(--bg-surface);border-radius:24px;padding:48px;text-align:center;box-shadow:var(--shadow-sm);"
			>
				<div class="label-meta" style="margin-bottom:16px;">{t('session.whatMean', $locale)}</div>
				<div class="jp" style="font-size:64px;line-height:1;">{card.jp}</div>
				<div class="romaji" style="margin-top:12px;">{card.romaji}</div>
			</div>

			<div style="margin-top:24px;display:flex;flex-direction:column;gap:10px;">
				{#each options as opt (opt)}
					{@const isThisCorrect = opt === card.en}
					{@const isThisPicked = opt === picked}
					<button
						onclick={() => pick(opt)}
						style="padding:18px 20px;background:{picked
							? isThisCorrect
								? 'var(--success-wash)'
								: isThisPicked
									? 'var(--hinomaru-red-wash)'
									: 'var(--bg-surface)'
							: 'var(--bg-surface)'};
              border:1.5px solid {picked
							? isThisCorrect
								? 'var(--success)'
								: isThisPicked
									? 'var(--hinomaru-red-ink)'
									: 'var(--ink-200)'
							: 'var(--ink-200)'};
              border-radius:16px;font-weight:{picked && (isThisCorrect || isThisPicked)
							? 600
							: 500};font-size:16px;
              color:{picked
							? isThisCorrect
								? 'var(--success)'
								: isThisPicked
									? 'var(--hinomaru-red-ink)'
									: 'var(--sumi)'
							: 'var(--sumi)'};
              cursor:{picked ? 'default' : 'pointer'};text-align:left;font-family:var(--font-ui);
              opacity:{picked && !isThisCorrect && !isThisPicked ? 0.5 : 1};
              transition:all 120ms var(--ease-brand);"
					>
						{opt}
					</button>
				{/each}
			</div>

			{#if picked}
				<div
					style="margin-top:20px;padding:16px;border-radius:16px;background:{isCorrect
						? 'var(--success-wash)'
						: 'var(--hinomaru-red-wash)'};display:flex;align-items:center;gap:12px;"
				>
					<div style="flex:1;">
						<div
							style="font-weight:600;color:{isCorrect
								? 'var(--success)'
								: 'var(--hinomaru-red-ink)'};"
						>
							{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}
						</div>
						{#if !isCorrect}
							<div style="font-size:13px;color:var(--hinomaru-red-ink);opacity:0.8;">
								{t('session.answerIs', $locale, { a: card.en })}
							</div>
						{/if}
					</div>
					<button class="hm-btn {isCorrect ? 'hm-btn-primary' : 'hm-btn-dark'}" onclick={next}>
						{i >= cards.length - 1 ? t('session.finish', $locale) : t('session.continue', $locale)}
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
