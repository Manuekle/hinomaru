<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { KaraokeRecognizer } from '$lib/speaking/karaokeRecognizer';
	import { startLevelMeter } from '$lib/speaking/audioLevel';
	import { comparePhraseBest, classify, SCORE_COLORS, SCORE_LABELS, type ScoreLevel } from '$lib/speaking/compare';
	import { forMatch, splitForKaraoke } from '$lib/speaking/normalize';
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
	// Multi-alternative buffers: each finalized utterance keeps all alts so the
	// scorer can pick whichever transcription best matches the current line.
	let finalAlts = $state<string[][]>([]);
	let interimAlts = $state<string[]>([]);
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
		finalAlts = [];
		interimAlts = [];
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
				const alts = r.alternatives.length ? r.alternatives : [r.transcript];
				if (r.isFinal) {
					finalAlts.push(alts);
					finalBuf = (finalBuf + ' ' + r.transcript).trim();
					interimAlts = [];
					interimBuf = '';
				} else {
					interimAlts = alts;
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
			// Snapshot what's been heard for the line we're leaving, then defer
			// scoring 400 ms so the recognizer's trailing transcripts still
			// land in the correct bucket.
			if (activeIdx >= 0 && activeIdx < lyrics.length) {
				const prev = activeIdx;
				const snapAlts = finalAlts.slice();
				const snapInterim = interimAlts.slice();
				setTimeout(() => scoreLineWithAlts(prev, snapAlts, snapInterim), 400);
			}
			prevIdx = activeIdx;
			activeIdx = found;
			finalBuf = '';
			interimBuf = '';
			finalAlts = [];
			interimAlts = [];
		}
	}

	function targetsForLine(line: typeof lyrics[number]): string[] {
		const out = [line.text];
		if (line.romaji) out.push(line.romaji);
		return out.filter(Boolean);
	}

	function bestAltAgainst(alts: string[], targets: string[]): { text: string; score: number } {
		let bestText = alts[0] ?? '';
		let bestScore = -1;
		for (const a of alts) {
			if (!a) continue;
			const r = comparePhraseBest(targets, a);
			if (r.overallScore > bestScore) { bestScore = r.overallScore; bestText = a; }
		}
		return { text: bestText, score: bestScore < 0 ? 0 : bestScore };
	}

	function scoreLineWithAlts(idx: number, altsList: string[][], interim: string[]) {
		const line = lyrics[idx];
		if (!line) return;
		const targets = targetsForLine(line);
		if (!targets.length) return;
		const parts: string[] = [];
		for (const alts of altsList) parts.push(bestAltAgainst(alts, targets).text);
		if (interim.length) parts.push(bestAltAgainst(interim, targets).text);
		const spoken = parts.join(' ').trim();
		if (!spoken) {
			scores = { ...scores, [idx]: { score: 0, level: 'wrong', transcript: '' } };
			return;
		}
		const result = comparePhraseBest(targets, spoken);
		scores = {
			...scores,
			[idx]: { score: result.overallScore, level: result.overallLevel, transcript: result.spokenNorm }
		};
	}

	function scoreLine(idx: number) {
		scoreLineWithAlts(idx, finalAlts.slice(), interimAlts.slice());
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

	function matchedTokens(line: string, spoken: string): { tokens: string[]; matched: boolean[] } {
		const tokens = splitForKaraoke(line);
		const matched = new Array(tokens.length).fill(false);
		if (!tokens.length || !spoken) return { tokens, matched };
		const sNorm = forMatch(spoken);
		if (!sNorm) return { tokens, matched };
		// Walk tokens forward; for each, try to find its key from current cursor.
		// On miss, advance to next token instead of stopping — the user may have
		// flubbed a single word but caught the next one, and should still see it
		// light up.
		let si = 0;
		for (let i = 0; i < tokens.length; i++) {
			const key = forMatch(tokens[i]);
			if (!key) { matched[i] = true; continue; }
			const idx = sNorm.indexOf(key, si);
			if (idx !== -1) {
				matched[i] = true;
				si = idx + key.length;
			}
		}
		return { tokens, matched };
	}

	const activeMatch = $derived.by(() => {
		if (activeIdx < 0 || activeIdx >= lyrics.length) {
			return { tokens: [] as string[], matched: [] as boolean[] };
		}
		// Pick the alt closest to current line for highlighting, fallback to top
		const line = lyrics[activeIdx];
		const targets = targetsForLine(line);
		const allAlts = finalAlts.flat().concat(interimAlts);
		const candidate = allAlts.length
			? bestAltAgainst(allAlts, targets).text
			: liveTranscript;
		return matchedTokens(line.text, candidate || liveTranscript);
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
									<span class="tok" class:matched={activeMatch.matched[ti]}>{tok}</span>
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
				<div
					class="gauge"
					style="--gauge-color:{SCORE_COLORS[avgLevel]}; --gauge-pct:{Math.max(0, Math.min(1, avgScore))};"
				>
					<svg viewBox="0 0 120 120" aria-hidden="true">
						<circle class="g-track" cx="60" cy="60" r="52" />
						<circle class="g-bar" cx="60" cy="60" r="52" />
					</svg>
					<div class="gauge-center">
						<div class="big-pct" style="color:{SCORE_COLORS[avgLevel]};">
							{Math.round(avgScore * 100)}<span class="pct">%</span>
						</div>
						<div class="big-label" style="color:{SCORE_COLORS[avgLevel]};">
							{SCORE_LABELS[avgLevel]}
						</div>
					</div>
				</div>
				<div class="muted">{t('songs.karaokeAvg', $locale)}</div>

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
	/* Theme-aware tokens. Light defaults; dark overrides below. */
	.overlay {
		--ko-bg: radial-gradient(ellipse at center, #fdf8f1 0%, #f4ece0 70%, #ece4d6 100%);
		--ko-fg: #1a1a1a;
		--ko-fg-soft: rgba(26, 26, 26, 0.62);
		--ko-fg-muted: rgba(26, 26, 26, 0.42);
		--ko-tok-rest: rgba(26, 26, 26, 0.38);
		--ko-tok-match: #1f9d55;
		--ko-tok-glow: rgba(31, 157, 85, 0.35);
		--ko-close-bg: rgba(26, 26, 26, 0.05);
		--ko-close-bg-hover: rgba(26, 26, 26, 0.1);
		--ko-close-border: rgba(26, 26, 26, 0.12);
		--ko-badge-bg: rgba(188, 0, 45, 0.1);
		--ko-badge-fg: #bc002d;
		--ko-badge-border: rgba(188, 0, 45, 0.25);
		--ko-gauge-track: rgba(26, 26, 26, 0.08);
		--ko-ghost-border: rgba(26, 26, 26, 0.18);
		--ko-mask-color: #f4ece0;
		--ko-text-shadow-active: 0 0 28px rgba(188, 0, 45, 0.12);

		position: fixed;
		inset: 0;
		z-index: 9000;
		background: var(--ko-bg);
		color: var(--ko-fg);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: calc(20px + env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom));
		animation: overlayIn 220ms ease both;
		contain: layout paint;
	}
	:global([data-theme='dark']) .overlay {
		--ko-bg: radial-gradient(ellipse at center, #1f1f1f 0%, #050505 70%, #000 100%);
		--ko-fg: #f2f2f1;
		--ko-fg-soft: rgba(242, 242, 241, 0.72);
		--ko-fg-muted: rgba(242, 242, 241, 0.48);
		--ko-tok-rest: rgba(242, 242, 241, 0.45);
		--ko-tok-match: #4ade80;
		--ko-tok-glow: rgba(74, 222, 128, 0.45);
		--ko-close-bg: rgba(255, 255, 255, 0.06);
		--ko-close-bg-hover: rgba(255, 255, 255, 0.14);
		--ko-close-border: rgba(255, 255, 255, 0.12);
		--ko-badge-bg: rgba(188, 0, 45, 0.18);
		--ko-badge-fg: #ff8da0;
		--ko-badge-border: rgba(188, 0, 45, 0.35);
		--ko-gauge-track: rgba(255, 255, 255, 0.08);
		--ko-ghost-border: rgba(255, 255, 255, 0.2);
		--ko-mask-color: #000;
		--ko-text-shadow-active: 0 0 36px rgba(255, 255, 255, 0.12);
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
		border: 1px solid var(--ko-close-border);
		background: var(--ko-close-bg);
		color: inherit;
		display: grid;
		place-items: center;
		cursor: pointer;
		transition: background 150ms;
	}
	.close:hover { background: var(--ko-close-bg-hover); }

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
		background: var(--ko-badge-bg);
		color: var(--ko-badge-fg);
		border: 1px solid var(--ko-badge-border);
	}
	.title {
		font-size: 17px;
		font-weight: 700;
		margin-top: 8px;
	}
	.artist {
		font-size: 12px;
		color: var(--ko-fg-muted);
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
		-webkit-mask-image: linear-gradient(to bottom, transparent 0%, var(--ko-mask-color) 18%, var(--ko-mask-color) 82%, transparent 100%);
		mask-image: linear-gradient(to bottom, transparent 0%, var(--ko-mask-color) 18%, var(--ko-mask-color) 82%, transparent 100%);
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
		text-shadow: var(--ko-text-shadow-active);
	}
	.line.past .text { font-weight: 400; }
	.romaji {
		font-size: 12px;
		color: var(--ko-fg-muted);
		margin-top: 6px;
		font-style: italic;
	}
	.line.active .romaji {
		font-size: 14px;
		color: var(--ko-fg-soft);
	}
	.translation {
		margin-top: 10px;
		font-size: 13px;
		color: var(--ko-fg-soft);
		font-style: italic;
	}
	.tok {
		display: inline-block;
		color: var(--ko-tok-rest);
		transition: color 160ms ease, text-shadow 160ms ease;
	}
	.tok.matched {
		color: var(--ko-tok-match);
		text-shadow: 0 0 14px var(--ko-tok-glow);
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
		color: var(--ko-fg-soft);
		padding: 0 24px;
	}
	.transcript.dim { color: var(--ko-fg-muted); font-size: 12px; letter-spacing: 0.04em; }
	.error {
		color: var(--hinomaru-red);
		font-size: 13px;
		text-align: center;
		max-width: 360px;
		padding: 12px 16px;
		background: rgba(188, 0, 45, 0.1);
		border: 1px solid rgba(188, 0, 45, 0.35);
		border-radius: 12px;
	}

	.summary {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
		width: 100%;
		max-width: 360px;
		margin: 32px auto 0;
		padding: 16px 8px;
	}
	.gauge {
		position: relative;
		width: 220px;
		height: 220px;
	}
	.gauge svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
		overflow: visible;
	}
	.g-track {
		fill: none;
		stroke: var(--ko-gauge-track);
		stroke-width: 10;
	}
	.g-bar {
		fill: none;
		stroke: var(--gauge-color);
		stroke-width: 10;
		stroke-linecap: round;
		stroke-dasharray: 326.726;
		stroke-dashoffset: calc(326.726 * (1 - var(--gauge-pct)));
		filter: drop-shadow(0 0 14px var(--gauge-color));
		transition: stroke-dashoffset 800ms cubic-bezier(0.2, 0.6, 0.1, 1);
	}
	.gauge-center {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}
	.big-pct {
		font-size: 56px;
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1;
	}
	.big-pct .pct {
		font-size: 22px;
		font-weight: 600;
		margin-left: 2px;
	}
	.big-label {
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.muted {
		font-size: 11px;
		color: var(--ko-fg-muted);
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.actions {
		display: flex;
		gap: 10px;
		justify-content: center;
		padding: 8px 0;
		margin-top: 8px;
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
		transition: transform 100ms, background 150ms, box-shadow 150ms;
	}
	.btn:hover { transform: translateY(-1px); }
	.btn.primary {
		background: var(--hinomaru-red);
		color: #fff;
		box-shadow: 0 6px 20px rgba(188, 0, 45, 0.28);
	}
	.btn.ghost {
		background: transparent;
		color: inherit;
		border: 1px solid var(--ko-ghost-border);
	}

	@media (max-width: 480px) {
		.line.active .text { font-size: 24px; }
		.gauge { width: 180px; height: 180px; }
		.big-pct { font-size: 46px; }
	}
</style>
