<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';

	let { data } = $props<{ data: PageData }>();
	const allCards = $derived(data.cards as any[]);
	const supabase = createClient();

	// ── State ──────────────────────────────────────────────────────────────
	let sessionCards = $state<any[]>([]);
	let currentIndex = $state(0);
	let currentSet = $state<any[]>([]);

	// Track selection by unique key = id+type
	let selectedKey = $state<string | null>(null);
	let matchedIds = $state<Set<string>>(new Set());
	let wrongKeys = $state<Set<string>>(new Set()); // flash red on wrong pick

	// Timer
	let elapsed = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	let finalTime = $state(0);
	let finished = $state(false);
	let transitioning = $state(false); // prevent clicks during set transition
	let showSuccess = $state(false); // brief green flash per match

	const SET_SIZE = 4; // pairs per round

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

	// ── Helpers ────────────────────────────────────────────────────────────
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
			items.push({ id: c.id, text: c.en,  type: 'en', romaji: c.romaji });
		});
		currentSet = items.sort(() => Math.random() - 0.5);
		matchedIds = new Set();
		selectedKey = null;
		wrongKeys = new Set();
		transitioning = false;
	}

	// ── Selection logic ────────────────────────────────────────────────────
	function select(item: any) {
		if (transitioning) return;
		if (matchedIds.has(item.id)) return;

		const key = makeKey(item.id, item.type);

		// Tap same card → deselect
		if (selectedKey === key) {
			selectedKey = null;
			return;
		}

		// Play audio for JP cards
		if (item.type === 'jp') speakJapanese(item.text);

		// Nothing selected yet → select this
		if (!selectedKey) {
			selectedKey = key;
			return;
		}

		// Parse the previously selected key
		const [prevId, prevType] = selectedKey.split('__');

		if (prevId === item.id && prevType !== item.type) {
			// ✅ Correct match!
			const newMatched = new Set(matchedIds);
			newMatched.add(item.id);
			matchedIds = newMatched;
			selectedKey = null;
			wrongKeys = new Set();

			// Check if the round is complete
			const roundSize = Math.min(SET_SIZE, sessionCards.length - currentIndex);
			if (matchedIds.size >= roundSize) {
				transitioning = true;
				setTimeout(() => {
					currentIndex += SET_SIZE;
					loadNextSet();
				}, 500);
			}
		} else {
			// ❌ Wrong match — flash red briefly
			const wrongSet = new Set<string>();
			wrongSet.add(selectedKey);
			wrongSet.add(key);
			wrongKeys = wrongSet;
			selectedKey = null;

			setTimeout(() => {
				wrongKeys = new Set();
			}, 600);
		}
	}

	// ── Game finish ────────────────────────────────────────────────────────
	async function finishGame() {
		if (timerInterval) clearInterval(timerInterval);
		finalTime = elapsed;
		finished = true;

		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			await supabase.from('sessions').insert({
				user_id: user.id,
				deck_id: data.deck.id,
				mode: 'match',
				correct: allCards.length,
				total: allCards.length
			});
		}
	}

	function goBack() {
		goto(`/deck/${data.deck.id}`);
	}

	// ── Derived ────────────────────────────────────────────────────────────
	const progress = $derived(
		sessionCards.length > 0
			? Math.min(100, (currentIndex / sessionCards.length) * 100)
			: 0
	);

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
	};
</script>

<div class="match-container">
	<!-- Progress bar -->
	<div class="session-topbar">
		<div class="session-topbar-fill" style="width:{progress}%;transition:width 400ms ease;"></div>
	</div>

	<!-- Header -->
	<div class="match-header">
		<button class="close-btn" onclick={goBack} aria-label="Close">✕</button>
		<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
			<div class="match-title">{t('session.matchMode', $locale)}</div>
			<div style="font-size:11px;color:var(--fg-tertiary);font-weight:500;">
				{currentIndex}/{sessionCards.length} {$locale === 'es' ? 'cartas' : 'cards'}
			</div>
		</div>
		<div class="match-timer">{formatTime(elapsed)}</div>
	</div>

	{#if allCards.length === 0}
		<!-- Empty state -->
		<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;">
			<div style="font-size:48px;margin-bottom:16px;">📭</div>
			<p style="color:var(--fg-secondary);">{t('home.empty', $locale)}</p>
			<a href="/deck/{data.deck.id}" class="hm-btn hm-btn-dark" style="text-decoration:none;">{t('deck.back', $locale)}</a>
		</div>

	{:else if !finished}
		<!-- Game grid -->
		<div class="match-grid" style="--cols:2;--rows:{Math.ceil(currentSet.length / 2)};">
			{#each currentSet as item (item.id + item.type)}
				{@const key = makeKey(item.id, item.type)}
				{@const isMatched  = matchedIds.has(item.id)}
				{@const isSelected = selectedKey === key}
				{@const isWrong    = wrongKeys.has(key)}
				<!-- Keep matched cards in DOM as placeholders so grid doesn't shift -->
				<button
					class="match-card"
					class:selected={isSelected}
					class:matched={isMatched}
					class:wrong={isWrong}
					class:jp-card={item.type === 'jp' && !isMatched}
					onclick={() => select(item)}
					disabled={isMatched || transitioning}
					aria-pressed={isSelected}
				>
					{#if !isMatched}
						<div class="card-inner">
							<div class="card-text" class:jp={item.type === 'jp'}>{item.text}</div>
							{#if isSelected && item.type === 'jp' && $showRomaji && ['N5', 'N4'].includes(data.deck.level)}
								<div class="romaji-hint">{item.romaji}</div>
							{/if}
							{#if item.type === 'jp'}
								<div class="audio-hint">🔊</div>
							{/if}
						</div>
					{:else}
						<!-- Matched state: show checkmark briefly then collapse -->
						<div class="matched-icon">✓</div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Round hint -->
		<div class="round-hint">
			{t('session.matchHint', $locale) || 'Empareja el japonés con su significado'}
		</div>

	{:else}
		<!-- Finish screen -->
		<div class="finish-overlay">
			<div class="finish-card">
				<div class="finish-icon">🏆</div>
				<h2>{t('session.wellDone', $locale) || '¡Muy bien!'}</h2>
				<div class="finish-time">{formatTime(finalTime)}</div>
				<p style="color:var(--fg-secondary);font-size:15px;margin-bottom:32px;">
					{allCards.length} {t('home.cards', $locale) || 'cartas'} completadas
				</p>
				<div style="display:flex;flex-direction:column;gap:10px;">
					<button class="hm-btn hm-btn-primary" onclick={() => { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } finished=false; currentIndex=0; elapsed=0; sessionCards=[...allCards].sort(()=>Math.random()-0.5); loadNextSet(); timerInterval=setInterval(()=>elapsed++,1000); }}>
						↺ {t('session.again', $locale) || 'Jugar de nuevo'}
					</button>
					<button class="hm-btn hm-btn-dark" onclick={goBack}>
						{t('session.finish', $locale) || 'Terminar'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.match-container {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		background: var(--paper);
	}

	/* ── Header ── */
	.match-header {
		padding: 12px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--ink-100);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--fg-secondary);
		font-size: 22px;
		cursor: pointer;
		padding: 8px;
		min-width: 44px;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background 150ms ease;
	}
	.close-btn:hover { background: var(--ink-100); }

	.match-title {
		font-weight: 700;
		color: var(--sumi);
		font-size: 16px;
		font-family: var(--font-ui);
	}

	.match-timer {
		font-variant-numeric: tabular-nums;
		color: var(--hinomaru-red);
		font-weight: 700;
		font-size: 18px;
		min-width: 50px;
		text-align: right;
		font-family: var(--font-ui);
	}

	/* ── Grid ── */
	.match-grid {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		padding: 16px;
		max-width: 540px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
		align-content: start;
	}

	/* ── Cards ── */
	.match-card {
		background: var(--bg-surface);
		border: 2px solid var(--ink-200);
		border-radius: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px 12px;
		min-height: 80px;
		cursor: pointer;
		transition: border-color 180ms ease, background 180ms ease, transform 150ms ease, opacity 300ms ease, box-shadow 180ms ease;
		text-align: center;
		position: relative;
		overflow: hidden;
		touch-action: manipulation;
	}

	.match-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: transparent;
		transition: background 180ms ease;
		pointer-events: none;
		border-radius: 16px;
	}

	.match-card:not(:disabled):hover {
		border-color: var(--ink-300);
		box-shadow: var(--shadow-sm);
		transform: translateY(-1px);
	}

	.match-card:not(:disabled):active {
		transform: scale(0.96);
	}

	/* JP cards get a subtle tint to distinguish them */
	.match-card.jp-card {
		background: color-mix(in srgb, var(--bg-surface) 96%, var(--hinomaru-red) 4%);
	}

	.match-card.selected {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		box-shadow: 0 0 0 3px rgba(188, 0, 45, 0.15);
		transform: scale(1.02);
	}

	.match-card.wrong {
		border-color: #e55;
		background: rgba(220, 50, 50, 0.08);
		animation: shake 0.4s ease;
	}

	.match-card.matched {
		border-color: var(--success);
		background: var(--success-wash);
		pointer-events: none;
		cursor: default;
		animation: match-success 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}

	.matched-icon {
		font-size: 24px;
		color: var(--success);
		font-weight: 800;
		opacity: 0;
		animation: fade-check 0.4s ease 0.1s forwards;
	}

	@keyframes match-success {
		0%   { transform: scale(1); border-color: var(--success); background: var(--success-wash); opacity: 1; }
		40%  { transform: scale(1.06); }
		100% { transform: scale(1); opacity: 1; }
	}

	@keyframes fade-check {
		0%   { opacity: 0; transform: scale(0.5); }
		60%  { opacity: 1; transform: scale(1.2); }
		100% { opacity: 1; transform: scale(1); }
	}

	.card-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		width: 100%;
	}

	.card-text {
		font-size: 15px;
		color: var(--sumi);
		font-weight: 600;
		line-height: 1.3;
		word-break: break-word;
	}

	.card-text.jp {
		font-size: 22px;
		font-family: var(--font-jp);
		font-weight: 700;
	}

	.romaji-hint {
		font-size: 11px;
		color: var(--hinomaru-red);
		font-weight: 600;
		opacity: 0.85;
		letter-spacing: 0.02em;
	}

	.audio-hint {
		font-size: 12px;
		opacity: 0.3;
		position: absolute;
		bottom: 6px;
		right: 8px;
	}

	/* ── Round hint ── */
	.round-hint {
		text-align: center;
		font-size: 12px;
		color: var(--fg-tertiary);
		padding: 12px 24px 20px;
		font-weight: 500;
		font-family: var(--font-ui);
	}

	/* ── Finish screen ── */
	.finish-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		z-index: 100;
	}

	.finish-card {
		background: var(--bg-surface);
		border-radius: 32px;
		padding: 40px 32px;
		width: 100%;
		max-width: 360px;
		text-align: center;
		box-shadow: var(--shadow-lg);
		animation: slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.finish-icon {
		font-size: 72px;
		margin-bottom: 16px;
	}

	.finish-card h2 {
		margin: 0 0 4px;
		font-size: 28px;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--sumi);
	}

	.finish-time {
		font-size: 48px;
		font-weight: 800;
		color: var(--hinomaru-red);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
		margin-bottom: 8px;
	}

	/* ── Animations ── */
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		20% { transform: translateX(-6px); }
		40% { transform: translateX(6px); }
		60% { transform: translateX(-4px); }
		80% { transform: translateX(4px); }
	}

	@keyframes slide-up {
		from { opacity: 0; transform: translateY(24px) scale(0.96); }
		to   { opacity: 1; transform: translateY(0) scale(1); }
	}

	/* ── Mobile tweaks ── */
	@media (max-width: 420px) {
		.match-grid {
			gap: 8px;
			padding: 12px;
		}
		.match-card {
			padding: 12px 8px;
			min-height: 70px;
			border-radius: 14px;
		}
		.card-text { font-size: 14px; }
		.card-text.jp { font-size: 20px; }
	}
</style>
