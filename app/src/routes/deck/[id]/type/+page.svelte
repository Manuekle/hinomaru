<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon } from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import type { PageData } from './$types';

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	let { data } = $props<{ data: PageData }>();
	const cards = $derived(data.cards as any[]);
	const supabase = createClient();

	let i = $state(0);
	let answer = $state('');
	let submitted = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);

	const card = $derived(cards[i]);
	const pct = $derived(((i + 1) / cards.length) * 100);

	const isCorrect = $derived.by(() => {
		if (!card || !answer) return false;
		const clean = (s: string) =>
			s
				.trim()
				.toLowerCase()
				.replace(/^to\s+/, '');
		const userAns = clean(answer);
		const targetEn = clean(card.en);
		const targetEs = clean(card.es || '');
		return userAns === targetEn || userAns === targetEs;
	});

	function submit() {
		if (submitted || !answer.trim()) return;
		submitted = true;
		if (isCorrect) {
			correct++;
			playCorrect();
		} else {
			playWrong();
		}
	}

	async function next() {
		updateCardProgress(card, isCorrect, struggled);

		if (i >= cards.length - 1) {
			const params = new URLSearchParams({
				correct: String(correct),
				total: String(cards.length),
				mode: 'type'
			});
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await supabase.from('sessions').insert({
					user_id: user.id,
					deck_id: data.deck.id,
					mode: 'type',
					correct,
					total: cards.length
				});
				await updateStreak(supabase, user.id);
			}
			goto(`/deck/${data.deck.id}/summary?${params}`);
		} else {
			submitted = false;
			answer = '';
			i++;
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

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (submitted) {
				next();
			} else {
				submit();
			}
		}
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
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;"
		>
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
					class="audio-btn-type"
				>
					<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
				</button>
				<div class="label-meta" style="margin-bottom:16px;">{t('session.typeMean', $locale)}</div>
				<div class="jp" style="font-size:72px;line-height:1;">{card.jp}</div>
				{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
					<div class="romaji" style="margin-top:12px;">{card.romaji}</div>
				{/if}
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
            border-radius:16px;font-size:18px;font-family:var(--font-ui);font-weight:500;outline:none;text-align:center;"
				/>
				{#if submitted}
					<div
						style="margin-top:16px;padding:20px;border-radius:20px;background:{isCorrect
							? 'var(--success-wash)'
							: 'var(--hinomaru-red-wash)'};
							   border:1.5px solid {isCorrect
							? 'var(--success)'
							: 'var(--hinomaru-red-ink)'};display:flex;flex-direction:column;gap:12px;"
					>
						{#if !isCorrect}
							<div style="font-size:14px;color:var(--hinomaru-red-ink);font-weight:600;">
								{t('session.answerIs', $locale, { a: card.en })}
							</div>
						{/if}

						{#if card.example}
							<div
								style="padding-top:12px;border-top:1px solid {isCorrect
									? 'rgba(0,128,0,0.1)'
									: 'rgba(188,0,45,0.1)'};"
							>
								<div style="display:flex;align-items:flex-start;gap:8px;">
									<div style="flex:1;">
										<div class="jp" style="font-size:15px;line-height:1.4;color:var(--sumi);">
											{card.example}
										</div>
										{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
											<div
												style="font-size:11px;color:var(--hinomaru-red-ink);opacity:0.7;margin-top:2px;font-weight:600;"
											>
												{card.example_romaji || card.extra?.example_romaji || ''}
											</div>
										{/if}
										<div style="font-size:12px;color:var(--fg-secondary);margin-top:4px;">
											{$locale === 'es' ? card.example_es : card.example_en}
										</div>
									</div>
									<button
										onclick={() => speakJapanese(card.example)}
										style="width:28px;height:28px;border-radius:50%;border:1px solid var(--ink-100);
											   background:var(--bg-surface);cursor:pointer;display:flex;align-items:center;
											   justify-content:center;font-size:12px;color:var(--fg-tertiary);flex-shrink:0;"
									>
										<Icon icon={VolumeHighIcon} size={18} color="currentColor" strokeWidth={1.5} />
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/if}
				<StickyFooter>
					{#if !submitted}
						<button
							class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg touch-action-manip"
							onclick={submit}
							disabled={!answer.trim()}
						>
							{t('session.check', $locale)}
						</button>
					{:else}
						{#if !isCorrect}
							<button
								class="hm-btn hm-btn-secondary touch-action-manip"
								onclick={() => {
									submitted = false;
									answer = '';
									struggled = true;
									setTimeout(() => inputEl?.focus(), 50);
								}}
								style="flex:1;"
							>
								✕ {t('session.again', $locale)}
							</button>
						{/if}
						<button
							class="hm-btn {isCorrect
								? 'hm-btn-primary'
								: 'hm-btn-dark'} hm-btn-full hm-btn-lg touch-action-manip"
							onclick={next}
							style="flex:1;"
						>
							{i >= cards.length - 1
								? t('session.finish', $locale)
								: t('session.continue', $locale)}
						</button>
					{/if}
				</StickyFooter>
			</div>
		</div>
	{/if}
</div>

<style>
	.audio-btn-type {
		position: absolute;
		top: 16px;
		right: 16px;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--sumi);
		box-shadow: var(--shadow-sm);
		transition: transform 100ms ease, background 150ms ease;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.audio-btn-type:active { transform: scale(0.92); }
	@media (hover: hover) {
		.audio-btn-type:hover { background: var(--ink-100); }
	}
</style>
