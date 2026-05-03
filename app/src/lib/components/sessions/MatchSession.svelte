<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { onMount, onDestroy } from 'svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import Icon from '$lib/Icon.svelte';
	import { Award01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { fadeIn } from '$lib/motion';
	import { playCorrect, playWrong, playFinish } from '$lib/utils/sounds';
	import { safeRomaji } from '$lib/utils/romaji';

	interface Props {
		cards: any[];
		deck: any;
		onComplete: (results: { correct: number; total: number; time: number }) => void;
		onExit: () => void;
		onCardProgress?: (card: any, correct: boolean, struggled: boolean) => void;
		totalCards?: number;
		learnedCount?: number;
	}

	let { 
		cards: allCards, 
		deck, 
		onComplete, 
		onExit, 
		onCardProgress,
		totalCards = 0,
		learnedCount = 0
	} = $props<Props>();

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
			items.push({ id: c.id, text: c.jp, type: 'jp', romaji: c.romaji, raw: c });
			items.push({ id: c.id, text: ($locale === 'es' ? c.es : c.en), type: 'en', romaji: c.romaji, raw: c });
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
			
			const hadWrong = (wrongCounts.get(item.id) ?? 0) > 0;
			if (onCardProgress) onCardProgress(item.raw, true, hadWrong);

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

	function finishGame() {
		if (timerInterval) clearInterval(timerInterval);
		finalTime = elapsed;
		finished = true;
		playFinish();
		onComplete({ correct: allCards.length, total: allCards.length, time: finalTime });
	}

	function restart() {
		matchedIds.clear();
		wrongKeys.clear();
		wrongCounts.clear();
		selectedKey = null;
		currentIndex = 0;
		elapsed = 0;
		finalTime = 0;
		finished = false;
		transitioning = false;
		sessionCards = [...allCards].sort(() => Math.random() - 0.5);
		loadNextSet();
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			if (!finished) elapsed++;
		}, 1000);
	}

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
	};
</script>

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={onExit}>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			<span class="session-index">{Math.min(currentIndex + matchedIds.size, allCards.length)} / {allCards.length}</span>
			<span class="total-label">{t('home.cards', $locale, { n: totalCards })}</span>
		</div>
		
		<div style="width: 44px;"></div> <!-- Spacer -->
	</div>

	<div class="session-container">
		{#if allCards.length === 0}
			<SessionEmptyState 
				totalCards={totalCards} 
				learnedCount={learnedCount}
				sessionCount={0} 
				deckId={deck?.id} 
				modeLabel={t('mode.match.title', $locale)}
			/>
		{:else if !finished}
			<div class="game-area content-center">
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
									{#if item.type === 'jp'}
										{@const rom = safeRomaji(item.romaji, item.text)}
										{#if rom}<div class="romaji-hint">{rom}</div>{/if}
									{/if}
								</div>
							{:else}
								<div class="matched-icon">✓</div>
							{/if}
						</button>
					{/each}
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
						<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={restart}>
							{t('session.again', $locale)}
						</button>
						<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={onExit}>
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
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.1;
	}
	.session-index {
		font-size: 17px;
		font-weight: 900;
		color: var(--fg-primary);
		letter-spacing: -0.01em;
	}
	.total-label {
		font-size: 10px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.close-btn, .lang-btn {
		color: var(--fg-secondary);
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.lang-btn.active { color: var(--hinomaru-red); }

	.game-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px 0;
	}

	.match-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		width: 100%;
		max-width: 520px;
	}

	.match-card {
		min-height: clamp(64px, 14vw, 80px);
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px;
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
	}

	.match-card.jp-card { background: var(--bg-muted); }

	.match-card:not(:disabled):hover {
		transform: translateY(-2px);
		border-color: var(--hinomaru-red);
	}

	.match-card.selected {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	.match-card.matched {
		border-color: var(--success);
		background: var(--success-wash);
		opacity: 0.45;
		transform: scale(0.92);
	}

	.match-card.wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		animation: shake 0.4s;
	}

	.card-inner { text-align: center; }
	.card-text { font-size: 14px; font-weight: 700; color: var(--fg-primary); }
	.card-text.jp { font-size: 24px; }
	.romaji-hint { font-size: 12px; font-weight: 700; color: var(--hinomaru-red); margin-top: 6px; }
	.matched-icon { font-size: 28px; color: var(--success); }

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
		width: 88px; height: 88px;
		background: var(--hinomaru-red);
		border-radius: 50%;
		display: flex; align-items: center; justify-content: center;
		margin: 0 auto 24px;
	}

	.well-done { font-size: 28px; font-weight: 900; color: var(--fg-primary); }
	.finish-time { font-size: 56px; font-weight: 900; color: var(--hinomaru-red); margin: 12px 0; }
	.finish-desc { color: var(--fg-secondary); font-size: 16px; margin-bottom: 32px; }

	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}
</style>
