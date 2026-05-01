<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto, beforeNavigate } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import Icon from '$lib/Icon.svelte';
	import SessionNav from '$lib/components/SessionNav.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { VolumeHighIcon, Mic01Icon } from '@hugeicons/core-free-icons';
	import type { PageData } from './$types';
	import { getSpeechStatus, JapaneseSpeechRecognizer, type SpeechStatus } from '$lib/speaking/speech';
	import { comparePhrase, SCORE_COLORS, SCORE_LABELS, type CompareResult } from '$lib/speaking/compare';
	import { cardsToPhrases } from '$lib/speaking/deck-phrases';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';

	let { data } = $props<{ data: PageData }>();

	const deck = $derived(data.deck);

	// Build phrase list — words only (no examples by default, same as other modes)
	const phrases = $derived(cardsToPhrases(data.cards, $locale).filter(p => !p.isExample));

	// ── Navigation ────────────────────────────────────────────────────────────
	let idx    = $state(0);
	let passed = $state(0); // correct this session

	const phrase  = $derived(phrases[idx]);
	const progPct = $derived(phrases.length > 0 ? Math.round((idx / phrases.length) * 100) : 0);

	// ── Phase ─────────────────────────────────────────────────────────────────
	type Phase = 'idle' | 'playing' | 'recording' | 'result';
	let phase = $state<Phase>('idle');
	let showAnticipation = $state(false);

	// ── Speech ────────────────────────────────────────────────────────────────
	const recognizer    = new JapaneseSpeechRecognizer();
	let liveTranscript   = $state('');
	let finalTranscript  = $state('');
	let allFinalParts    = $state<string[]>([]); // accumulate multi-result finals
	let speechError     = $state<string | null>(null);
	let speechStatus = $state<SpeechStatus>({ ok: false, reason: 'no-window' });
	let speechHost = $state('');
	onMount(() => {
		speechStatus = getSpeechStatus();
		speechHost = typeof location !== 'undefined' ? location.host : '';
	});
	const speechOk = $derived(speechStatus.ok);
	const speechWarn = $derived.by(() => {
		if (speechStatus.ok) return '';
		if (speechStatus.reason === 'insecure') return `${t('speaking.insecure', $locale)} (${speechHost})`;
		if (speechStatus.reason === 'unsupported') return t('speaking.unsupported', $locale);
		return '';
	});

	// ── Result ────────────────────────────────────────────────────────────────
	let result = $state<CompareResult | null>(null);

	// ── Actions ───────────────────────────────────────────────────────────────
	async function listen() {
		if (!phrase || phase === 'recording') return;
		phase = 'playing';
		await speakJapanese(phrase.text);
		phase = 'idle';
	}

	async function startRecording() {
		if (!phrase || !speechOk) return;
		speechError     = null;
		liveTranscript  = '';
		finalTranscript = '';
		allFinalParts   = [];
		result          = null;
		phase          = 'recording';

		await recognizer.start(
			(r) => {
				liveTranscript = r.transcript;
				if (r.isFinal) {
					allFinalParts = [...allFinalParts, r.transcript];
					finalTranscript = allFinalParts.join('');
				}
			},
			(err) => { speechError = err; phase = 'idle'; },
			() => {
				// Use accumulated final; fall back to last interim (often hiragana — useful for kanji targets)
				const spoken = finalTranscript || liveTranscript;
				if (!spoken && !speechError) {
					speechError = t('speaking.noSpeech', $locale);
					phase = 'idle';
					return;
				}
				if (spoken && phrase) {
					// Compare against final AND last interim separately, take best
					const candidates = [finalTranscript, liveTranscript].filter(Boolean);
					let best = comparePhrase(phrase.text, candidates[0], phrase.segments);
					for (let i = 1; i < candidates.length; i++) {
						const c = comparePhrase(phrase.text, candidates[i], phrase.segments);
						if (c.overallScore > best.overallScore) best = c;
					}
					result = best;
					if (best.overallLevel === 'correct') playCorrect();
					else playWrong();
					phase = 'result';
				} else {
					phase = 'idle';
				}
			}
		);
	}

	function stopRecording() { recognizer.stop(); }

	function retry() {
		result          = null;
		liveTranscript  = '';
		finalTranscript = '';
		speechError     = null;
		phase           = 'idle';
	}

	function advance(gotIt: boolean) {
		if (gotIt) passed++;
		if (idx + 1 >= phrases.length) {
			showAnticipation = true;
			setTimeout(() => {
				goto(`/deck/${deck?.id}/summary?correct=${passed}&total=${phrases.length}&mode=speaking`);
			}, 1800);
			return;
		}
		idx++;
		retry();
	}

	beforeNavigate(() => recognizer.stop());
	onDestroy(() => recognizer.stop());

	// ── Font size (same as flashcards) ────────────────────────────────────────
	function getFontSize(text: string) {
		const len = text?.length || 0;
		if (len <= 3)  return '80px';
		if (len <= 5)  return '64px';
		if (len <= 8)  return '48px';
		if (len <= 11) return '36px';
		return '26px';
	}

	// ── Score ring (72px viewBox, r=30) ──────────────────────────────────────
	const RING_R    = 30;
	const RING_CIRC = 2 * Math.PI * RING_R;
	const ringOffset = $derived(result ? RING_CIRC - RING_CIRC * result.overallScore : RING_CIRC);
	const ringColor  = $derived(result ? SCORE_COLORS[result.overallLevel] : 'var(--ink-200)');
</script>

<svelte:head>
	<title>Pronunciación — {$locale === 'es' ? deck?.title_es : deck?.title_en} — Hinomaru</title>
</svelte:head>

<div style="display:flex;flex-direction:column;min-height:100dvh;background:var(--paper);">

	<SessionNav
		progress={progPct}
		current={idx + 1}
		total={phrases.length}
		showRomajiToggle={true}
		onClose={() => goto(`/deck/${deck?.id}`)}
	/>

	{#if phrases.length === 0}
		<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;">
			<p style="color:var(--fg-secondary);">{t('speaking.noWords', $locale)}</p>
			<a href="/deck/{deck?.id}" class="hm-btn hm-btn-dark">{t('deck.back', $locale)}</a>
		</div>

	{:else if phrase}
		<div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:32px 24px 140px;gap:28px;max-width:600px;margin:0 auto;width:100%;box-sizing:border-box;">

			{#if speechWarn}
				<div class="speech-warn">{speechWarn}</div>
			{/if}

			<!-- ── Card ── -->
			<div class="card-scene" style="width:100%;max-width:360px;aspect-ratio:3/4;">
				<div class="card-body" class:flipped={phase === 'result'}>

					<!-- Front: JP word + controls -->
					<div class="card-face card-front">
						<div class="card-tag">
							{$locale === 'es' ? (deck?.kind_es ?? deck?.kind) : deck?.kind}
						</div>

						<!-- Big JP -->
						<div
							class="jp word-text"
							style="font-size:{getFontSize(phrase.text)};"
						>{phrase.text}</div>

						{#if $showRomaji}
							<div class="reading">{phrase.reading}</div>
						{/if}

						<!-- Segments preview — only when phrase splits into multiple parts -->
						{#if phrase.segments.length > 1}
							<div class="segments-row">
								{#each phrase.segments as seg, i (i)}
									<span class="seg-chip">{seg}</span>
								{/each}
							</div>
						{/if}

						<!-- Meaning -->
						<div class="meaning">{phrase.meaning}</div>

						<!-- Listen button -->
						<button
							class="audio-btn"
							class:is-active={phase === 'playing'}
							onclick={(e) => { e.stopPropagation(); listen(); }}
							disabled={phase === 'recording'}
							aria-label="Escuchar"
						>
							<Icon icon={VolumeHighIcon} size={20} color="currentColor" strokeWidth={1.5} />
						</button>

						<!-- Live transcript while recording -->
						{#if phase === 'recording'}
							<div class="live-bar">
								<span class="live-dot"></span>
								<span class="jp live-text">{liveTranscript || '…'}</span>
							</div>
						{/if}

						{#if speechError}
							<div class="error-text">{speechError}</div>
						{/if}
					</div>

					<!-- Back: result -->
					<div class="card-face card-back">
						<!-- Score + verdict -->
						<div class="score-row">
							<div class="score-ring-wrap">
								<svg class="ring-svg" viewBox="0 0 72 72">
									<circle class="ring-track" cx="36" cy="36" r={RING_R} fill="none" stroke-width="5" />
									<circle
										class="ring-bar"
										cx="36" cy="36" r={RING_R}
										fill="none" stroke-width="5"
										stroke-linecap="round"
										stroke-dasharray={RING_CIRC}
										stroke-dashoffset={ringOffset}
										style="stroke:{ringColor};"
									/>
								</svg>
								<span class="ring-num" style="color:{ringColor};">{result ? Math.round(result.overallScore * 100) : 0}</span>
							</div>
							<div class="score-info">
								<div class="verdict" style="color:{ringColor};">{result ? SCORE_LABELS[result.overallLevel] : ''}</div>
								<div class="back-word jp">{phrase.text}</div>
								{#if finalTranscript || liveTranscript}
									<div class="heard-inline">
										<span class="heard-label">{t('speaking.heard', $locale)}</span>
										<span class="jp heard-text">{finalTranscript || liveTranscript}</span>
									</div>
								{/if}
							</div>
						</div>

						<!-- Divider -->
						<div class="result-divider"></div>

						<!-- Segments breakdown -->
						{#if result?.segments && result.segments.length > 0}
							<div class="seg-breakdown">
								{#each result.segments as sr, i (i)}
									<div class="seg-row" style="--seg-color:{SCORE_COLORS[sr.level]};">
										<span class="seg-row-text jp">{sr.segment}</span>
										<div class="seg-bar-wrap">
											<div class="seg-bar" style="width:{Math.round(sr.score*100)}%;background:{SCORE_COLORS[sr.level]};"></div>
										</div>
										<span class="seg-row-pct" style="color:{SCORE_COLORS[sr.level]};">{Math.round(sr.score * 100)}%</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>

				</div>
			</div>

		</div>

		<!-- ── Footer ── -->
		<StickyFooter>
			{#if phase === 'idle' || phase === 'playing'}
				<button
					class="hm-btn hm-btn-primary hm-btn-full touch-action-manip"
					onclick={startRecording}
					disabled={!speechOk || phase === 'playing'}
				>
					<Icon icon={Mic01Icon} size={18} color="currentColor" />
					{speechOk ? t('speaking.speak', $locale) : t('speaking.unavailable', $locale)}
				</button>

			{:else if phase === 'recording'}
				<button
					class="hm-btn hm-btn-dark hm-btn-full touch-action-manip recording-btn"
					onclick={stopRecording}
				>
					<span class="rec-dot"></span>
					{t('speaking.stop', $locale)}
				</button>

			{:else if phase === 'result' && result}
				<button
					class="hm-btn hm-btn-secondary touch-action-manip"
					style="flex:1;"
					onclick={retry}
				>
					{t('session.again', $locale)}
				</button>
				<button
					class="hm-btn hm-btn-primary touch-action-manip"
					style="flex:2;"
					onclick={() => advance(result!.overallLevel === 'correct')}
				>
					{idx + 1 < phrases.length ? t('exam.next', $locale) : t('exam.see_results', $locale)}
				</button>
			{/if}
		</StickyFooter>
	{/if}

</div>

{#if showAnticipation}
	<AnticipationScreen />
{/if}

<style>
	/* ── Card 3D scene (same as flashcards) ── */
	.card-scene {
		perspective: 1000px;
		cursor: default;
	}
	.card-body {
		width: 100%;
		height: 100%;
		position: relative;
		transform-style: preserve-3d;
		transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
		border-radius: 28px;
	}
	.card-body.flipped { transform: rotateY(180deg); }

	.card-face {
		position: absolute;
		inset: 0;
		border-radius: 28px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		box-shadow: var(--shadow-md, 0 8px 32px rgba(0,0,0,0.08));
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 28px 24px;
		gap: 10px;
		overflow: hidden;
	}
	.card-back { transform: rotateY(180deg); justify-content: flex-start; padding-top: 24px; }

	/* Front */
	.card-tag {
		position: absolute;
		top: 20px; left: 20px;
		font-size: 10px; font-weight: 700;
		text-transform: uppercase; letter-spacing: 0.06em;
		color: var(--fg-tertiary);
	}
	.word-text {
		line-height: 1.1;
		text-align: center;
		word-break: break-word;
		color: var(--sumi);
		font-weight: 700;
	}
	.reading {
		font-size: 13px;
		color: var(--hinomaru-red);
		font-weight: 600;
		letter-spacing: 0.02em;
	}
	.segments-row {
		display: flex; flex-wrap: wrap; gap: 5px;
		justify-content: center;
	}
	.seg-chip {
		font-family: var(--font-jp);
		font-size: 12px; font-weight: 600;
		padding: 2px 8px;
		border: 1.5px solid var(--ink-200);
		border-radius: 7px;
		color: var(--fg-tertiary);
	}
	.meaning {
		font-size: 15px;
		color: var(--fg-secondary);
		font-weight: 500;
		text-align: center;
	}
	.audio-btn {
		width: 44px; height: 44px;
		border-radius: 50%;
		border: 1px solid var(--ink-200);
		background: var(--bg-surface);
		cursor: pointer;
		display: inline-flex;
		align-items: center; justify-content: center;
		color: var(--fg-secondary);
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		transition: background 150ms, color 150ms;
		margin-top: 4px;
	}
	.audio-btn:hover:not(:disabled), .audio-btn.is-active {
		background: var(--ink-100);
		border-color: var(--ink-300);
	}
	.audio-btn:disabled { opacity: 0.4; cursor: default; }

	/* Live bar */
	.live-bar {
		display: flex; align-items: center; gap: 8px;
		background: var(--hinomaru-red-wash);
		border: 1px solid rgba(188,0,45,0.15);
		border-radius: 12px;
		padding: 8px 14px;
		width: 100%; max-width: 280px;
		margin-top: 4px;
	}
	.live-dot {
		width: 8px; height: 8px;
		border-radius: 50%;
		background: var(--hinomaru-red);
		flex-shrink: 0;
		animation: blink 0.75s infinite alternate;
	}
	@keyframes blink { from { opacity: 1; } to { opacity: 0.15; } }
	.live-text { font-size: 15px; font-weight: 600; color: var(--sumi); flex: 1; }
	.error-text { font-size: 12px; color: var(--hinomaru-red); font-weight: 600; text-align: center; }

	/* Back — result */
	.card-back { gap: 14px; }

	.score-row {
		display: flex; align-items: center; gap: 16px;
		width: 100%;
	}
	.score-ring-wrap {
		position: relative;
		width: 72px; height: 72px;
		flex-shrink: 0;
		display: flex; align-items: center; justify-content: center;
	}
	.ring-svg {
		position: absolute; inset: 0;
		width: 100%; height: 100%;
		transform: rotate(-90deg);
	}
	.ring-track { stroke: var(--ink-100); }
	.ring-bar { transition: stroke-dashoffset 0.7s cubic-bezier(0.34, 1.2, 0.64, 1); }
	.ring-num {
		position: relative;
		font-size: 20px; font-weight: 900; line-height: 1;
	}

	.score-info {
		display: flex; flex-direction: column; gap: 3px;
		min-width: 0;
	}
	.verdict { font-size: 14px; font-weight: 800; letter-spacing: -0.01em; }
	.back-word {
		font-size: 22px; font-weight: 700;
		color: var(--sumi);
		line-height: 1.1;
	}
	.heard-inline {
		display: flex; align-items: baseline; gap: 5px;
		margin-top: 2px;
	}
	.heard-label {
		font-size: 9px; font-weight: 700;
		text-transform: uppercase; letter-spacing: 0.06em;
		color: var(--fg-tertiary); white-space: nowrap;
	}
	.heard-text { font-size: 13px; font-weight: 600; color: var(--fg-secondary); }

	.result-divider {
		width: 100%; height: 1px;
		background: var(--ink-100);
		flex-shrink: 0;
	}

	.seg-breakdown { width: 100%; display: flex; flex-direction: column; gap: 6px; }
	.seg-row {
		display: flex; align-items: center; gap: 8px;
		padding: 0 4px;
		border-left: 3px solid var(--seg-color);
		padding-left: 10px;
	}
	.seg-row-text { font-size: 15px; font-weight: 700; flex: 1; color: var(--sumi); }
	.seg-bar-wrap {
		width: 48px; height: 4px;
		background: var(--ink-100);
		border-radius: 2px;
		overflow: hidden;
		flex-shrink: 0;
	}
	.seg-bar { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
	.seg-row-pct { font-size: 11px; font-weight: 700; min-width: 28px; text-align: right; }

	/* Footer buttons */
	.recording-btn {
		animation: pulse-btn 0.7s infinite alternate;
		display: flex; align-items: center; gap: 8px;
	}
	.rec-dot {
		width: 9px; height: 9px;
		border-radius: 50%; background: var(--hinomaru-red);
		flex-shrink: 0;
	}
	@keyframes pulse-btn { from { opacity: 1; } to { opacity: 0.75; } }

	.speech-warn {
		width: 100%;
		max-width: 360px;
		padding: 10px 14px;
		border-radius: 12px;
		background: rgba(245, 158, 11, 0.12);
		border: 1px solid rgba(245, 158, 11, 0.4);
		color: var(--warning, #b45309);
		font-size: 13px;
		font-weight: 600;
		line-height: 1.4;
		text-align: center;
	}

	.jp { font-family: var(--font-jp); }
	.touch-action-manip { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
</style>
