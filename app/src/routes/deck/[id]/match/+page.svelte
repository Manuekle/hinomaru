<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { onMount, onDestroy } from 'svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import Icon from '$lib/Icon.svelte';
	import { Award01Icon, VolumeHighIcon, Clock01Icon, Cancel01Icon, TranslateIcon, ArrowReloadHorizontalIcon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
	import { fadeIn } from '$lib/motion';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { addXP } from '$lib/utils/gamification';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const allCards = $derived(data.cards as any[]);
	const supabase = createClient();

	let sessionCards = $state<any[]>([]);
	let currentIndex = $state(0);
	let currentSet = $state<any[]>([]);

	let selectedKey = $state<string | null>(null);
	let matchedIds = new SvelteSet<string>();
	let wrongKeys = new SvelteSet<string>();
	let wrongCounts = new Map<string, number>();

	let elapsed = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	let finalTime = $state(0);
	let finished = $state(false);
	let transitioning = $state(false);

	const SET_SIZE = 4;

	onMount(() => {
		sessionCards = [...allCards].sort(() => Math.random() - 0.5);
		loadNextSet();
		timerInterval = setInterval(() => {
			if (!finished) elapsed++;
		}, 1000);
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	function makeKey(id: string, type: string) {
		return `${id}__${type}`;
	}

	function loadNextSet() {
		const next = sessionCards.slice(currentIndex, currentIndex + SET_SIZE);
		if (next.length === 0) {
			finishGame();
			return;
		}
		const items: any[] = [];
		next.forEach((c) => {
			items.push({ id: c.id, text: c.jp, type: 'jp', romaji: c.romaji });
			items.push({ id: c.id, text: c.en, type: 'en', romaji: c.romaji });
		});
		currentSet = items.sort(() => Math.random() - 0.5);
		matchedIds.clear();
		selectedKey = null;
		wrongKeys.clear();
		transitioning = false;
	}

	function select(item: any) {
		if (transitioning) return;
		if (matchedIds.has(item.id)) return;

		const key = makeKey(item.id, item.type);

		if (selectedKey === key) {
			selectedKey = null;
			return;
		}

		if (item.type === 'jp') speakJapanese(item.text);

		if (!selectedKey) {
			selectedKey = key;
			return;
		}

		const [prevId, prevType] = selectedKey.split('__');

		if (prevId === item.id && prevType !== item.type) {
			matchedIds.add(item.id);
			selectedKey = null;
			wrongKeys.clear();
			playCorrect();

			const roundSize = Math.min(SET_SIZE, sessionCards.length - currentIndex);
			if (matchedIds.size >= roundSize) {
				transitioning = true;
				setTimeout(() => {
					currentIndex += SET_SIZE;
					loadNextSet();
				}, 500);
			}
		} else {
			const prevCardId = prevId;
			wrongCounts.set(prevCardId, (wrongCounts.get(prevCardId) ?? 0) + 1);
			wrongCounts.set(item.id, (wrongCounts.get(item.id) ?? 0) + 1);
			wrongKeys.add(selectedKey);
			wrongKeys.add(key);
			selectedKey = null;
			playWrong();

			setTimeout(() => {
				wrongKeys.clear();
			}, 600);
		}
	}

	async function finishGame() {
		if (timerInterval) clearInterval(timerInterval);
		finalTime = elapsed;
		finished = true;
		playFinish();

		supabase.auth.getUser().then(async ({ data: { user } }) => {
			if (!user) return;
			await supabase.from('sessions').insert({
				user_id: user.id,
				deck_id: data.deck.id,
				mode: 'match',
				correct: allCards.length,
				total: allCards.length
			});
			await Promise.all(
				allCards.map((card) => {
					const hadWrong = (wrongCounts.get(card.id) ?? 0) > 0;
					const currentProgress = card.progress?.[0];
					const quality = mapPerformanceToQuality(true, hadWrong);
					const nextState = calculateNextReview(quality, currentProgress);
					return supabase.from('progress').upsert({
						user_id: user.id,
						card_id: card.id,
						learned: true,
						...nextState,
						last_seen: new Date().toISOString()
					});
				})
			);
			await updateStreak(supabase, user.id);
			await addXP(supabase, user.id, allCards.length * 5);
		});
	}

	function goBack() {
		goto(`/deck/${data.deck.id}`);
	}

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
	};
</script>

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={goBack}>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			{Math.min(currentIndex + matchedIds.size, allCards.length)} / {allCards.length}
		</div>

		<button 
			class="lang-btn" 
			class:active={$showRomaji}
			onclick={() => ($showRomaji = !$showRomaji)}
			title="Toggle Romaji"
		>
			<Icon icon={TranslateIcon} size={24} color="currentColor" />
		</button>
	</div>

	<div class="session-container">
		{#if allCards.length === 0}
			<SessionEmptyState 
				totalCards={data.totalCards} 
				learnedCount={data.learnedCount}
				sessionCount={allCards.length} 
				deckId={data.deck.id} 
				modeLabel={t('mode.match.title', $locale)}
			/>
		{:else if !finished}
			<div class="game-area">
				<div class="match-grid">
					{#each currentSet as item (item.id + item.type)}
						{@const key = makeKey(item.id, item.type)}
						{@const isMatched = matchedIds.has(item.id)}
						{@const isSelected = selectedKey === key}
						{@const isWrong = wrongKeys.has(key)}
						<button
							class="match-card"
							class:selected={isSelected}
							class:matched={isMatched}
							class:wrong={isWrong}
							class:jp-card={item.type === 'jp'}
							onclick={() => select(item)}
							disabled={isMatched || transitioning}
						>
							{#if !isMatched}
								<div class="card-inner">
									<div class="card-text" class:jp={item.type === 'jp'}>{item.text}</div>
									{#if item.type === 'jp' && $showRomaji && ['N5', 'N4', 'Survival'].includes(data.deck.level)}
										<div class="romaji-hint">{item.romaji}</div>
									{/if}
								</div>
							{:else}
								<div class="matched-icon">✓</div>
							{/if}
						</button>
					{/each}
				</div>
				<div class="round-hint">
					{t('session.matchHint', $locale)}
				</div>
			</div>
		{:else}
			<div class="finish-overlay">
				<div class="finish-card">
					<div class="finish-icon">
						<Icon icon={Award01Icon} size={48} color="white" />
					</div>
					<h2 class="well-done">{t('session.wellDone', $locale)}</h2>
					<div class="finish-time">{formatTime(finalTime)}</div>
					<p class="finish-desc">{allCards.length} {t('home.cards', $locale)} completadas</p>
					
					<StickyFooter>
						<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={() => location.reload()}>
							{t('session.again', $locale)}
						</button>
						<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={goBack}>
							{t('session.finish', $locale)}
						</button>
					</StickyFooter>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if finished}
	<Confetti fireOnMount={true} />
{/if}

<style>
	.premium-bg {
		background-color: var(--bg-page);
		min-height: 100dvh;
	}

	.premium-header-minimal {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(16px + env(safe-area-inset-top)) 24px 16px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--ink-200);
	}

	.header-progress {
		font-size: 18px;
		font-weight: 800;
		color: var(--fg-primary);
	}

	.close-btn, .lang-btn {
		color: var(--fg-secondary);
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.lang-btn.active {
		color: var(--hinomaru-red);
	}

	.game-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 24px;
	}

	.match-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
		width: 100%;
		max-width: 520px;
	}

	.match-card {
		aspect-ratio: 1.8/1;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
		box-shadow: var(--shadow-sm);
	}

	.match-card.jp-card {
		background: var(--bg-muted);
	}

	.match-card:not(:disabled):hover {
		transform: translateY(-2px);
		border-color: var(--hinomaru-red);
	}

	.match-card.selected {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		box-shadow: 0 0 0 4px var(--hinomaru-red-wash);
	}

	.match-card.matched {
		border-color: var(--success);
		background: var(--success-wash);
		opacity: 0.5;
		cursor: default;
		transform: scale(0.95);
	}

	.match-card.wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		animation: shake 0.4s;
	}

	.card-inner { text-align: center; }

	.card-text {
		font-size: 16px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
	}

	.card-text.jp {
		font-size: 26px;
		font-family: var(--font-jp);
	}

	.romaji-hint {
		font-size: 12px;
		font-weight: 700;
		color: var(--hinomaru-red);
		margin-top: 6px;
	}

	.matched-icon { font-size: 28px; color: var(--success); }

	.round-hint {
		margin-top: 40px;
		font-size: 14px;
		color: var(--fg-tertiary);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.finish-overlay {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 24px;
	}

	.finish-card {
		background: var(--bg-surface);
		border-radius: 40px;
		padding: 48px 40px;
		width: 100%;
		max-width: 440px;
		text-align: center;
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--ink-100);
	}

	.finish-icon {
		width: 88px;
		height: 88px;
		background: var(--hinomaru-red);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 24px;
		box-shadow: 0 8px 24px var(--hinomaru-red-wash);
	}

	.well-done { font-size: 28px; font-weight: 900; color: var(--fg-primary); margin-bottom: 8px; }

	.finish-time {
		font-size: 56px;
		font-weight: 900;
		color: var(--hinomaru-red);
		margin: 12px 0;
		letter-spacing: -0.02em;
	}

	.finish-desc { color: var(--fg-secondary); font-size: 16px; margin-bottom: 32px; }

	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}

	@media (max-width: 480px) {
		.match-grid { gap: 12px; }
		.match-card { border-radius: 20px; padding: 12px; }
		.card-text { font-size: 15px; }
		.card-text.jp { font-size: 22px; }
	}
</style>
