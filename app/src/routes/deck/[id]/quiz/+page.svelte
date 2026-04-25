<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const cards = $derived(data.cards as any[]);
	const supabase = createClient();

	let i = $state(0);
	let picked = $state<string | null>(null);
	let correct = $state(0);
	let struggled = $state(false);

	const card = $derived(cards[i]);
	const pct = $derived(((i + 1) / cards.length) * 100);
	const isCorrect = $derived(picked === (card?.en ?? ''));

	const options = $derived.by(() => {
		if (!card) return [];
		// Filter out the correct answer and duplicates by meaning
		const pool = Array.from(new Set(
			cards
				.filter((c) => c.en !== card.en && c.es !== card.es)
				.map((c) => $locale === 'es' ? c.es : c.en)
		));

		// Fisher-Yates partial shuffle to pick 2 random distractors
		for (let k = pool.length - 1; k > pool.length - 3 && k > 0; k--) {
			const r = Math.floor(Math.random() * (k + 1));
			[pool[k], pool[r]] = [pool[r], pool[k]];
		}
		
		const distractors = pool.slice(-2);
		const result = [...distractors, $locale === 'es' ? card.es : card.en];
		
		// Fisher-Yates shuffle final options
		for (let k = result.length - 1; k > 0; k--) {
			const r = Math.floor(Math.random() * (k + 1));
			[result[k], result[r]] = [result[r], result[k]];
		}
		return result;
	});

	function pick(opt: string) {
		if (picked) return;
		picked = opt;
		if (opt === card.en) correct++;
	}

	async function next() {
		// Save progress for this specific card before moving to next
		await updateCardProgress(card, isCorrect, struggled);

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
			struggled = false;
		}
	}

	async function updateCardProgress(c: any, gotIt: boolean, hadDifficulty: boolean = false) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;

		const currentProgress = c.progress && c.progress.length > 0 ? c.progress[0] : null;
		const quality = mapPerformanceToQuality(gotIt, hadDifficulty);
		const nextState = calculateNextReview(quality, currentProgress);

		await supabase.from('progress').upsert({
			user_id: user.id,
			card_id: c.id,
			learned: true,
			...nextState,
			last_seen: new Date().toISOString()
		});
	}
	function playAudio() {
		speakJapanese(card?.jp ?? '');
	}
</script>

<div style="display:flex;flex-direction:column;min-height:100dvh;background:var(--paper);">
	<SessionNav 
		progress={pct} 
		current={i + 1} 
		total={cards.length} 
		onClose={() => goto(`/deck/${data.deck.id}`)}
	/>

	{#if cards.length === 0}
		<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;">
			<div style="font-size:48px;margin-bottom:16px;">📭</div>
			<p style="color:var(--fg-secondary);">{t('home.empty', $locale)}</p>
			<a href="/deck/{data.deck.id}" class="hm-btn hm-btn-dark">{t('deck.back', $locale)}</a>
		</div>
	{:else if card}
		<div
			style="flex:1;padding:32px 24px 140px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;"
		>
			<div
				style="background:var(--bg-surface);border-radius:24px;padding:48px;text-align:center;box-shadow:var(--shadow-sm);position:relative;"
			>
				<button
					onclick={playAudio}
					aria-label="Play pronunciation"
					style="position:absolute;top:12px;right:12px;width:44px;height:44px;border-radius:50%;background:var(--bg-surface);border:1px solid var(--ink-200);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--sumi);box-shadow:var(--shadow-sm);transition:transform 100ms ease;"
					onmousedown={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(0.92)')}
					onmouseup={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
				>
					🔊
				</button>
				<div class="label-meta" style="margin-bottom:16px;">{t('session.whatMean', $locale)}</div>
				<div class="jp" style="font-size:64px;line-height:1;">{card.jp}</div>
				{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
					<div class="romaji" style="margin-top:12px;">{card.romaji}</div>
				{/if}
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
					style="margin-top:20px;padding:20px;border-radius:20px;background:{isCorrect
						? 'var(--success-wash)'
						: 'var(--hinomaru-red-wash)'};display:flex;flex-direction:column;gap:16px;box-shadow:var(--shadow-sm);"
				>
					<div style="display:flex;flex-direction:column;gap:2px;">
						<div
							style="font-weight:700;font-size:18px;color:{isCorrect
								? 'var(--success)'
								: 'var(--hinomaru-red-ink)'};"
						>
							{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}
						</div>
						{#if !isCorrect}
							<div style="font-size:14px;color:var(--hinomaru-red-ink);opacity:0.8;margin-top:2px;">
								{t('session.answerIs', $locale, { a: card.en })}
							</div>
						{/if}
					</div>

					{#if card.example}
						<div style="padding-top:16px;border-top:1.5px solid {isCorrect ? 'rgba(0,128,0,0.1)' : 'rgba(188,0,45,0.1)'};">
							<div style="display:flex;align-items:flex-start;gap:8px;">
								<div style="flex:1;">
									<div class="jp" style="font-size:16px;line-height:1.4;color:var(--sumi);">{card.example}</div>
									{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
										<div style="font-size:11px;color:var(--hinomaru-red-ink);opacity:0.7;margin-top:2px;font-weight:600;">
											{card.example_romaji || card.extra?.example_romaji || ''}
										</div>
									{/if}
									<div style="font-size:13px;color:var(--fg-secondary);margin-top:4px;">
										{$locale === 'es' ? card.example_es : card.example_en}
									</div>
								</div>
								<button
									onclick={() => speakJapanese(card.example)}
									style="width:32px;height:32px;border-radius:50%;border:1px solid var(--ink-100);
										   background:var(--bg-surface);cursor:pointer;display:flex;align-items:center;
										   justify-content:center;font-size:14px;color:var(--fg-tertiary);flex-shrink:0;margin-top:2px;"
								>
									🔊
								</button>
							</div>
						</div>
					{/if}
				</div>

				<StickyFooter>
					{#if !isCorrect}
						<button 
							class="hm-btn hm-btn-secondary touch-action-manip" 
							onclick={() => { picked = null; struggled = true; }} 
							style="flex:1;"
						>
							✕ {t('session.again', $locale)}
						</button>
					{/if}
					<button class="hm-btn {isCorrect ? 'hm-btn-primary' : 'hm-btn-dark'} touch-action-manip" onclick={next} style="flex:1;">
						{i >= cards.length - 1 ? t('session.finish', $locale) : t('session.continue', $locale)}
					</button>
				</StickyFooter>
			{/if}
		</div>
	{/if}
</div>
