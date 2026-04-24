<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import type { PageData } from './$types';

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	let { data } = $props<{ data: PageData }>();
	const cards = $derived(data.cards as { jp: string; en: string; es?: string; romaji: string }[]);
	const supabase = createClient();

	let i = $state(0);
	let answer = $state('');
	let submitted = $state(false);
	let correct = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);

	const card = $derived(cards[i]);
	const pct = $derived(((i + 1) / cards.length) * 100);
	const isCorrect = $derived(
		answer.trim().toLowerCase() === (card?.en ?? '').toLowerCase() ||
			answer.trim().toLowerCase() === (card?.es ?? '').toLowerCase()
	);

	function submit() {
		if (submitted || !answer.trim()) return;
		submitted = true;
		if (isCorrect) correct++;
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
					mode: 'type',
					correct,
					total: cards.length
				});
			const params = new URLSearchParams({
				correct: String(correct),
				total: String(cards.length),
				mode: 'type'
			});
			goto(`/deck/${data.deck.id}/summary?${params}`);
		} else {
			submitted = false;
			answer = '';
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

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (submitted) {
				next();
			} else {
				submit();
			}
		}
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
				<div class="label-meta" style="margin-bottom:16px;">{t('session.typeMean', $locale)}</div>
				<div class="jp" style="font-size:72px;line-height:1;">{card.jp}</div>
				<div class="romaji" style="margin-top:12px;">{card.romaji}</div>
			</div>

			<div style="margin-top:24px;">
				<input
					type="text"
					use:focusOnMount
					bind:value={answer}
					bind:this={inputEl}
					disabled={submitted}
					onkeydown={keydown}
					placeholder={t('session.yourAnswer', $locale)}
					style="width:100%;box-sizing:border-box;height:56px;padding:0 20px;
            border:1.5px solid {submitted
						? isCorrect
							? 'var(--success)'
							: 'var(--hinomaru-red)'
						: 'var(--ink-200)'};
            background:{submitted
						? isCorrect
							? 'var(--success-wash)'
							: 'var(--hinomaru-red-wash)'
						: 'var(--bg-surface)'};
            color:{submitted
						? isCorrect
							? 'var(--success)'
							: 'var(--hinomaru-red-ink)'
						: 'var(--sumi)'};
            border-radius:16px;font-size:18px;font-family:var(--font-ui);font-weight:500;outline:none;"
				/>
				{#if submitted && !isCorrect}
					<div style="font-size:13px;color:var(--hinomaru-red-ink);margin-top:8px;">
						{t('session.answerIs', $locale, { a: card.en })}
					</div>
				{/if}
				<div style="margin-top:20px;">
					{#if !submitted}
						<button
							class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg"
							onclick={submit}
							disabled={!answer.trim()}
						>
							{t('session.check', $locale)}
						</button>
					{:else}
						<button
							class="hm-btn {isCorrect ? 'hm-btn-primary' : 'hm-btn-dark'} hm-btn-full hm-btn-lg"
							onclick={next}
						>
							{i >= cards.length - 1
								? t('session.finish', $locale)
								: t('session.continue', $locale)}
						</button>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
