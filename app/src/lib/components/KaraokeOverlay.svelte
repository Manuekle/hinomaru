<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { KaraokeRecognizer } from '$lib/speaking/karaokeRecognizer';
	import { startLevelMeter } from '$lib/speaking/audioLevel';
	import { comparePhrase, classify, SCORE_COLORS, SCORE_LABELS, type ScoreLevel } from '$lib/speaking/compare';
	import { normalizeJapanese, splitJpInteractive } from '$lib/speaking/normalize';
	import { addXP } from '$lib/utils/gamification';
	import { svileo } from '$lib/stores/toast';
	import MicOrb from './MicOrb.svelte';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon, ArrowReloadHorizontalIcon } from '@hugeicons/core-free-icons';
	import type { SongLesson } from '$lib/utils/jlptSongs';

	let {
		song,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		player,
		playerReady,
		startSec,
		endSec,
		open = $bindable(false)
	} = $props<{
		song: SongLesson;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		player: any;
		playerReady: boolean;
		startSec: number;
		endSec: number;
		open: boolean;
	}>();

	const supabase = $derived($page.data.supabase);

	type LineScore = { score: number; level: ScoreLevel; transcript: string };

	let activeIdx = $state(-1);
	let prevIdx = -1;
	// Mic level is mutated 30 times per second; storing it in $state forces
	// the whole overlay to re-render on each tick. Keep it as a plain ref so
	// only MicOrb's internal rAF reads it.
	const micLevelRef = { value: 0 };
	const getMicLevel = () => micLevelRef.value;
	let finalBuf = $state('');
	let interimBuf = $state('');
	let scores = $state<Record<number, LineScore>>({});
	let micError = $state<string | null>(null);
	let summaryShown = $state(false);
	let xpAwarded = $state(false);
	let recognizerArmed = $state(false);
	let recognizer: KaraokeRecognizer | null = null;
	let stopMeter: (() => void) | null = null;
	let pollTimer: ReturnType<typeof setInterval> | null = null;
	let originalVolume = 100;
	let currentVol = 100;
	let lastSetVol = -1;

	const lyrics = $derived(song?.lyrics ?? []);

	const visibleLines = $derived.by(() => {
		if (!lyrics.length) return [] as { idx: number; line: typeof lyrics[number]; pos: number }[];
		const window = [-2, -1, 0, 1, 2];
		return window
			.map((d) => {
				const idx = Math.max(-1, activeIdx) + d;
				if (idx < 0 || idx >= lyrics.length) return null;
				return { idx, line: lyrics[idx], pos: d };
			})
			.filter((v): v is { idx: number; line: typeof lyrics[number]; pos: number } => v !== null);
	});

	const avgScore = $derived.by(() => {
		const vals = Object.values(scores).map((s) => s.score);
		if (!vals.length) return 0;
		return vals.reduce((a, b) => a + b, 0) / vals.length;
	});

	const avgLevel = $derived(classify(avgScore));

	$effect(() => {
		if (open) {
			startSession();
		} else {
			endSession(false);
		}
		return () => {};
	});

	async function startSession() {
		// Reset state
		activeIdx = -1;
		prevIdx = -1;
		micLevelRef.value = 0;
		finalBuf = '';
		interimBuf = '';
		scores = {};
		micError = null;
		summaryShown = false;
		xpAwarded = false;

		if (!player || !playerReady) {
			micError = 'Player no listo. Cierra y vuelve a abrir.';
			return;
		}

		try {
			originalVolume = player.getVolume?.() ?? 100;
		} catch {
			originalVolume = 100;
		}
		currentVol = originalVolume;
		lastSetVol = -1;
		try { player.setVolume(originalVolume); } catch { /* ignore */ }

		// Seek to start and play
		try {
			player.seekTo(startSec, true);
			player.playVideo();
		} catch { /* ignore */ }

		// Poll player time
		pollTimer = setInterval(() => {
			if (!player) return;
			try {
				const tNow = player.getCurrentTime();
				syncActiveLyric(tNow);
				if (tNow >= endSec && !summaryShown) {
					try { player.pauseVideo(); } catch { /* ignore */ }
					finalizeLastLine();
					showSummary();
				}
			} catch { /* ignore */ }
		}, 150);

		// Mic + recognizer
		recognizer = new KaraokeRecognizer();
		await recognizer.start(
			(r) => {
				if (r.isFinal) {
					finalBuf = (finalBuf + ' ' + r.transcript).trim();
					interimBuf = '';
				} else {
					interimBuf = r.transcript;
				}
				recognizerArmed = true;
			},
			(err) => {
				micError = err;
				recognizerArmed = false;
			},
			() => {
				recognizerArmed = false;
			}
		);
		recognizerArmed = !!recognizer.active;

		// Level meter on the recognizer's stream. Updates a mutable ref only;
		// MicOrb reads it via rAF and the ducking lerp runs here.
		const stream = recognizer.getMediaStream();
		if (stream) {
			stopMeter = startLevelMeter(stream, (rms) => {
				micLevelRef.value = rms;
				updateDucking(rms);
			}, 20);
		}
	}

	function endSession(fullCleanup: boolean) {
		if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
		if (stopMeter) { stopMeter(); stopMeter = null; }
		if (recognizer) { recognizer.abort(); recognizer = null; }
		recognizerArmed = false;
		// Always restore player volume
		try { player?.setVolume?.(originalVolume); } catch { /* ignore */ }
		if (fullCleanup) {
			try { player?.pauseVideo?.(); } catch { /* ignore */ }
		}
	}

	function syncActiveLyric(time: number) {
		if (!lyrics.length) return;
		let found = -1;
		for (let i = lyrics.length - 1; i >= 0; i--) {
			if (lyrics[i].time <= time + 0.15) { found = i; break; }
		}
		if (found !== activeIdx) {
			// Lyric advanced: score the line we just left.
			if (activeIdx >= 0 && activeIdx < lyrics.length) {
				scoreLine(activeIdx);
			}
			prevIdx = activeIdx;
			activeIdx = found;
			finalBuf = '';
			interimBuf = '';
		}
	}

	function scoreLine(idx: number) {
		const line = lyrics[idx];
		if (!line) return;
		const spoken = (finalBuf + ' ' + interimBuf).trim();
		if (!spoken) {
			scores = { ...scores, [idx]: { score: 0, level: 'wrong', transcript: '' } };
			return;
		}
		const result = comparePhrase(line.text, spoken, []);
		scores = {
			...scores,
			[idx]: { score: result.overallScore, level: result.overallLevel, transcript: result.spokenNorm }
		};
	}

	function finalizeLastLine() {
		if (activeIdx >= 0 && !(activeIdx in scores)) scoreLine(activeIdx);
	}

	function updateDucking(rms: number) {
		const target = rms > 0.04 ? 40 : originalVolume;
		currentVol = currentVol + (target - currentVol) * 0.15;
		const r = Math.round(currentVol);
		if (r !== lastSetVol) {
			try { player?.setVolume?.(r); } catch { /* ignore */ }
			lastSetVol = r;
		}
	}

	async function showSummary() {
		summaryShown = true;
		// Stop recognizer + meter but keep overlay open
		if (stopMeter) { stopMeter(); stopMeter = null; }
		if (recognizer) { recognizer.abort(); recognizer = null; }
		try { player?.setVolume?.(originalVolume); } catch { /* ignore */ }

		if (xpAwarded) return;
		if (avgScore < 0.7) return;
		const client = supabase;
		if (!client) return;
		try {
			const { data: { user } } = await client.auth.getUser();
			if (!user) return;
			await client.from('sessions').insert({
				user_id: user.id,
				mode: 'karaoke',
				correct: 1,
				total: 1
			});
			await addXP(client, user.id, 30);
			xpAwarded = true;
			svileo.success({
				title: t('songs.karaokeBonus', $locale),
				description: '+30 XP'
			});
		} catch (err) {
			console.warn('[karaoke] xp award failed', err);
		}
	}

	function retry() {
		endSession(false);
		// Restart cleanly
		setTimeout(() => startSession(), 80);
	}

	function close() {
		endSession(true);
		open = false;
	}

	function onKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		}
	}

	onDestroy(() => endSession(true));

	const liveTranscript = $derived((finalBuf + ' ' + interimBuf).trim());

	function matchedTokens(line: string, spoken: string): { tokens: string[]; matched: number } {
		const tokens = splitJpInteractive(line);
		if (!tokens.length || !spoken) return { tokens, matched: 0 };
		const sNorm = normalizeJapanese(spoken);
		if (!sNorm) return { tokens, matched: 0 };
		let si = 0;
		let matched = 0;
		for (const tok of tokens) {
			const tNorm = normalizeJapanese(tok);
			if (!tNorm) { matched++; continue; }
			let localSi = si;
			let ok = true;
			for (const c of tNorm) {
				const idx = sNorm.indexOf(c, localSi);
				if (idx === -1) { ok = false; break; }
				localSi = idx + 1;
			}
			if (ok) { matched++; si = localSi; }
			else break;
		}
		return { tokens, matched };
	}

	const activeMatch = $derived.by(() => {
		if (activeIdx < 0 || activeIdx >= lyrics.length) return { tokens: [] as string[], matched: 0 };
		return matchedTokens(lyrics[activeIdx].text, liveTranscript);
	});
</script>

<svelte:window onkeydown={onKey} />

{#if open}
	<div class="overlay" role="dialog" aria-modal="true" aria-label={t('songs.karaoke', $locale)}>
		<button class="close" onclick={close} aria-label={t('common.close', $locale) || 'Close'}>
			<Icon icon={Cancel01Icon} size={20} color="currentColor" />
		</button>

		<div class="top">
			<span class="badge">{t('songs.karaoke', $locale)}</span>
			<div class="title jp">{song.title}</div>
			<div class="artist">{song.artist}</div>
		</div>

		{#if !summaryShown}
			<div class="lyrics-stage">
				{#each visibleLines as v (v.idx)}
					{@const isActive = v.pos === 0}
					{@const past = v.pos < 0}
					<div
						class="line"
						class:active={isActive}
						class:past
						style="
							--abs: {Math.abs(v.pos)};
							opacity: {isActive ? 1 : v.pos === -1 || v.pos === 1 ? 0.5 : 0.22};
							filter: blur({isActive ? 0 : Math.abs(v.pos) * 1.2}px);
							transform: translateY({v.pos * 14}px) scale({isActive ? 1 : 0.92});
						"
					>
						{#if isActive}
							<div class="jp text">
								{#each activeMatch.tokens as tok, ti (ti)}
									<span class="tok" class:matched={ti < activeMatch.matched}>{tok}</span>
								{/each}
							</div>
						{:else}
							<div class="jp text">{v.line.text}</div>
						{/if}
						{#if $showRomaji && v.line.romaji}
							<div class="romaji">{v.line.romaji}</div>
						{/if}
						{#if isActive}
							<div class="translation">
								{$locale === 'es' ? v.line.translation_es : v.line.translation_en}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<div class="bottom">
				{#if micError}
					<div class="error">{micError}</div>
				{:else}
					<MicOrb getLevel={getMicLevel} armed={recognizerArmed} size={48} />
					<div class="transcript jp" class:dim={!liveTranscript}>
						{liveTranscript || t('songs.karaokeListening', $locale)}
					</div>
				{/if}
			</div>
		{:else}
			<!-- Summary -->
			<div class="summary">
				<div class="summary-avg">
					<div class="big-pct" style="color:{SCORE_COLORS[avgLevel]};">
						{Math.round(avgScore * 100)}%
					</div>
					<div class="big-label" style="color:{SCORE_COLORS[avgLevel]};">
						{SCORE_LABELS[avgLevel]}
					</div>
					<div class="muted">{t('songs.karaokeAvg', $locale)}</div>
				</div>

				<div class="actions">
					<button class="btn primary" onclick={retry}>
						<Icon icon={ArrowReloadHorizontalIcon} size={16} color="currentColor" />
						<span>{t('songs.karaokeRetry', $locale)}</span>
					</button>
					<button class="btn ghost" onclick={close}>
						{t('songs.karaokeClose', $locale)}
					</button>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 9000;
		background:
			radial-gradient(ellipse at center, #1f1f1f 0%, #050505 70%, #000 100%);
		color: #f2f2f1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: calc(20px + env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom));
		animation: overlayIn 220ms ease both;
		contain: layout paint;
	}
	@keyframes overlayIn {
		from { opacity: 0; transform: scale(1.04); }
		to   { opacity: 1; transform: scale(1); }
	}

	.close {
		position: absolute;
		top: calc(14px + env(safe-area-inset-top));
		right: 16px;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.06);
		color: #f2f2f1;
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: background 150ms;
	}
	.close:hover { background: rgba(255, 255, 255, 0.14); }

	.top {
		text-align: center;
		margin-top: 8px;
	}
	.badge {
		display: inline-block;
		padding: 4px 10px;
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		border-radius: 999px;
		background: rgba(188, 0, 45, 0.18);
		color: #ff8da0;
		border: 1px solid rgba(188, 0, 45, 0.35);
	}
	.title {
		font-size: 17px;
		font-weight: 700;
		margin-top: 8px;
	}
	.artist {
		font-size: 12px;
		opacity: 0.55;
		margin-top: 2px;
	}

	.lyrics-stage {
		flex: 1;
		width: 100%;
		max-width: 720px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 18px;
		padding: 24px 0;
		-webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%);
		mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%);
	}

	.line {
		position: relative;
		text-align: center;
		max-width: 90%;
		transition: opacity 280ms ease, filter 280ms ease, transform 280ms ease;
	}
	.line .text {
		font-size: 18px;
		font-weight: 500;
		line-height: 1.35;
	}
	.line.active .text {
		font-size: 30px;
		font-weight: 700;
		letter-spacing: 0.01em;
		text-shadow: 0 0 36px rgba(255, 255, 255, 0.12);
	}
	.line.past .text {
		font-weight: 400;
	}
	.romaji {
		font-size: 12px;
		opacity: 0.55;
		margin-top: 6px;
		font-style: italic;
	}
	.line.active .romaji {
		font-size: 14px;
		opacity: 0.75;
	}
	.translation {
		margin-top: 10px;
		font-size: 13px;
		opacity: 0.65;
		font-style: italic;
	}
	.tok {
		display: inline-block;
		color: rgba(242, 242, 241, 0.55);
		transition: color 160ms ease, text-shadow 160ms ease;
	}
	.tok.matched {
		color: #4ade80;
		text-shadow: 0 0 14px rgba(74, 222, 128, 0.45);
	}

	.bottom {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		padding-bottom: 8px;
	}
	.transcript {
		min-height: 22px;
		max-width: 560px;
		text-align: center;
		font-size: 14px;
		color: #d8d8d8;
		opacity: 0.85;
		padding: 0 24px;
	}
	.transcript.dim { opacity: 0.35; font-size: 12px; letter-spacing: 0.04em; }
	.error {
		color: #ff8da0;
		font-size: 13px;
		text-align: center;
		max-width: 360px;
		padding: 12px 16px;
		background: rgba(188, 0, 45, 0.12);
		border: 1px solid rgba(188, 0, 45, 0.4);
		border-radius: 12px;
	}

	.summary {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 100%;
		max-width: 520px;
		margin: 32px auto 0;
		padding: 24px 8px;
		overflow-y: auto;
	}
	.summary-avg {
		text-align: center;
	}
	.big-pct {
		font-size: 72px;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1;
	}
	.big-label {
		font-size: 16px;
		font-weight: 600;
		margin-top: 4px;
	}
	.muted {
		font-size: 12px;
		opacity: 0.55;
		margin-top: 4px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.actions {
		display: flex;
		gap: 10px;
		justify-content: center;
		padding: 8px 0;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		border-radius: 999px;
		font-size: 14px;
		font-weight: 600;
		border: none;
		cursor: pointer;
		font-family: inherit;
		transition: transform 100ms, background 150ms;
	}
	.btn:hover { transform: translateY(-1px); }
	.btn.primary {
		background: var(--hinomaru-red);
		color: #fff;
	}
	.btn.ghost {
		background: transparent;
		color: #eee;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	@media (max-width: 480px) {
		.line.active .text { font-size: 24px; }
		.big-pct { font-size: 56px; }
	}
</style>
