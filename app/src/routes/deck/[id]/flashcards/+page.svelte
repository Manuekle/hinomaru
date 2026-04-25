<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { animate } from 'motion/mini';
	import { speakJapanese } from '$lib/utils/tts';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const cards = $derived(data.cards as any[]);
	const supabase = createClient();

	let i = $state(0);
	let flipped = $state(false);
	let correct = $state(0);
	let cardEl = $state<HTMLDivElement | null>(null);

	const card = $derived(cards[i]);
	const pct = $derived(((i + 1) / cards.length) * 100);

	// Animate card in on mount
	onMount(() => {
		if (cardEl) {
			animate(
				cardEl,
				{ opacity: [0, 1], y: [24, 0], scale: [0.97, 1] },
				{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }
			);
		}
	});

	function speak(text: string) {
		speakJapanese(text);
	}

	async function next(gotIt: boolean) {
		if (gotIt) correct++;
		flipped = false;

		if (i >= cards.length - 1) {
			// Fade out before leaving
			if (cardEl) {
				await animate(cardEl, { opacity: [1, 0], y: [0, -20] }, { duration: 0.3, ease: 'easeIn' })
					.finished;
			}
			await saveSession(correct, cards.length);
			const params = new URLSearchParams({
				correct: String(correct),
				total: String(cards.length),
				mode: 'flashcards'
			});
			goto(`/deck/${data.deck.id}/summary?${params}`);
		} else {
			// Slide out current, slide in next
			if (cardEl) {
				const dir = gotIt ? -1 : 1;
				await animate(
					cardEl,
					{ opacity: [1, 0], x: [0, dir * 40] },
					{ duration: 0.2, ease: 'easeIn' }
				).finished;
				i++;
				await animate(
					cardEl,
					{ opacity: [0, 1], x: [dir * -40, 0] },
					{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }
				);
			} else {
				i++;
			}
		}
	}

	async function saveSession(c: number, total: number) {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return;
		await supabase
			.from('sessions')
			.insert({ user_id: user.id, deck_id: data.deck.id, mode: 'flashcards', correct: c, total });
	}
</script>

<div style="display:flex;flex-direction:column;min-height:100dvh;min-height:100vh;background:var(--paper);">
	<!-- Progress bar - needs top safe area for notch/Dynamic Island -->
	<div style="padding-top:env(safe-area-inset-top);background:var(--bg-surface);">
	<div class="session-topbar">
		<div
			class="session-topbar-fill"
			style="width:{pct}%;transition:width 400ms cubic-bezier(0.22,1,0.36,1);"
		></div>
	</div>
	</div>

	<!-- Top nav -->
	<div style="padding:12px 20px;display:flex;justify-content:space-between;align-items:center;">
		<a
			href="/deck/{data.deck.id}"
			class="touch-action-manip"
			style="color:var(--fg-secondary);text-decoration:none;font-size:22px;line-height:1;
             transition:color 150ms ease;min-width:44px;min-height:44px;display:flex;align-items:center;"
			onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--sumi)')}
			onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--fg-secondary)')}
			>✕</a
		>
		<div class="label-meta">{t('session.progress', $locale, { a: i + 1, b: cards.length })}</div>
		<div style="width:44px;"></div>
	</div>

	{#if data.cards.length === 0}
		<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;">
			<div style="font-size:48px;margin-bottom:16px;">📭</div>
			<p style="color:var(--fg-secondary);">{t('home.empty', $locale)}</p>
			<a href="/deck/{data.deck.id}" class="hm-btn hm-btn-dark">{t('deck.back', $locale)}</a>
		</div>
	{:else if card}
		<div
			style="flex:1;display:flex;flex-direction:column;align-items:center;padding:24px 24px 40px;gap:32px;max-width:600px;margin:0 auto;width:100%;box-sizing:border-box;"
		>
			<!-- Card with 3D flip -->
			<div
				bind:this={cardEl}
				class="card-scene"
				style="width:100%;max-width:360px;aspect-ratio:3/4;"
				onclick={() => (flipped = !flipped)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === ' ' && (flipped = !flipped)}
			>
				<div class="card-body" class:flipped>
					<!-- Front -->
					<div class="card-face">
						<div style="position:absolute;top:24px;left:24px;" class="label-meta">
							{$locale === 'es' ? (data.deck.kind_es ?? data.deck.kind) : data.deck.kind}
						</div>
						<div class="jp" style="font-size:96px;line-height:1;">{card.jp}</div>
						<button
							onclick={(e) => {
								e.stopPropagation();
								speak(card.jp);
							}}
							style="margin-top:20px;width:44px;height:44px;border-radius:50%;
                     border:1px solid var(--ink-200);background:var(--bg-surface);cursor:pointer;
                     display:inline-flex;align-items:center;justify-content:center;font-size:18px;
                     transition:background 150ms ease, transform 150ms ease;"
							onmouseenter={(e) =>
								((e.currentTarget as HTMLElement).style.transform = 'scale(1.1)')}
							onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
						>
							🔊
						</button>
						<div style="margin-top:16px;font-size:12px;color:var(--fg-tertiary);">
							{t('session.flip', $locale)}
						</div>
					</div>
					<!-- Back -->
					<div class="card-face back">
						<div
							style="font-size:36px;font-weight:700;letter-spacing:-0.02em;color:var(--sumi);line-height:1;"
						>
							{$locale === 'es' ? card.es : card.en}
						</div>
						{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
							<div class="romaji" style="margin-top:8px;">{card.romaji}</div>
						{/if}
						<div
							style="margin-top:20px;padding-top:20px;border-top:1px solid var(--ink-200);width:90%;text-align:center;position:relative;"
						>
							<div style="display:flex;align-items:center;justify-content:center;gap:8px;">
								<div class="jp" style="font-size:17px;line-height:1.4;">{card.example}</div>
								<button
									onclick={(e) => {
										e.stopPropagation();
										speak(card.example);
									}}
									style="width:28px;height:28px;border-radius:50%;border:1px solid var(--ink-100);
										   background:var(--bg-surface);cursor:pointer;display:flex;align-items:center;
										   justify-content:center;font-size:12px;color:var(--fg-tertiary);flex-shrink:0;"
								>
									🔊
								</button>
							</div>
							
							{#if $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
								<div style="font-size:11px;color:var(--hinomaru-red-ink);opacity:0.8;margin-top:2px;font-weight:600;letter-spacing:0.02em;">
									{card.example_romaji || card.extra?.example_romaji || ''}
								</div>
							{/if}

							<div style="font-size:13px;color:var(--fg-secondary);margin-top:6px;line-height:1.4;">
								{$locale === 'es' ? card.example_es : card.example_en}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div style="display:flex;gap:12px;width:100%;max-width:360px;padding-bottom:calc(16px + env(safe-area-inset-bottom));">
				<button
					class="hm-btn hm-btn-secondary hm-btn-full touch-action-manip"
					onclick={() => next(false)}
					style="transition:transform 100ms ease, box-shadow 150ms ease;"
					onmouseenter={(e) =>
						((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)')}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '')}
				>
					✕ {t('session.again', $locale)}
				</button>
				<button
					class="hm-btn hm-btn-primary hm-btn-full touch-action-manip"
					onclick={() => next(true)}
					style="transition:transform 100ms ease, box-shadow 150ms ease;"
					onmouseenter={(e) =>
						((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(188,0,45,0.30)')}
					onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = '')}
				>
					✓ {t('session.gotIt', $locale)}
				</button>
			</div>
		</div>
	{/if}
</div>
