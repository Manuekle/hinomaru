<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { JapaneseSpeechRecognizer, isSpeechSupported } from '$lib/speaking/speech';
	import Icon from '$lib/Icon.svelte';
	import { Mic01Icon, VolumeHighIcon } from '@hugeicons/core-free-icons';

	const props: { card: any; onAnswer: (correct: boolean) => void } = $props();
	const card = $derived(props.card);

	let recognizer: JapaneseSpeechRecognizer | null = null;
	let listening = $state(false);
	let transcript = $state('');
	let locked = $state(false);
	let isCorrect = $state(false);
	let unsupported = $state(false);

	$effect(() => {
		card;
		transcript = '';
		locked = false;
		isCorrect = false;
		listening = false;
	});

	function levenshtein(a: string, b: string): number {
		const m = a.length;
		const n = b.length;
		if (!m) return n;
		if (!n) return m;
		const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
		for (let i = 0; i <= m; i++) dp[i][0] = i;
		for (let j = 0; j <= n; j++) dp[0][j] = j;
		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				const cost = a[i - 1] === b[j - 1] ? 0 : 1;
				dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
			}
		}
		return dp[m][n];
	}

	function score(target: string, said: string): number {
		const t = target.replace(/\s/g, '');
		const s = said.replace(/\s/g, '');
		if (!t || !s) return 0;
		const dist = levenshtein(t, s);
		return Math.max(0, 1 - dist / Math.max(t.length, s.length));
	}

	async function start() {
		if (!isSpeechSupported()) {
			unsupported = true;
			return;
		}
		recognizer = new JapaneseSpeechRecognizer();
		listening = true;
		transcript = '';
		await recognizer.start(
			(r) => {
				transcript = r.transcript;
				if (r.isFinal) finish(r.transcript);
			},
			(err) => {
				console.warn('[speak]', err);
				listening = false;
			},
			() => {
				listening = false;
			}
		);
	}

	function stop() {
		recognizer?.abort();
		listening = false;
	}

	function finish(said: string) {
		listening = false;
		locked = true;
		const acc = score(card.jp, said);
		isCorrect = acc >= 0.65;
		setTimeout(() => props.onAnswer(isCorrect), 1000);
	}

	function skip() {
		locked = true;
		isCorrect = false;
		setTimeout(() => props.onAnswer(false), 200);
	}

	onDestroy(() => recognizer?.abort());
</script>

<div class="step-layout">
	<div class="step-header">
		<div class="step-instruction">
			{$locale === 'es' ? 'Dilo en voz alta' : 'Say it out loud'}
		</div>
	</div>

	<div class="step-content">
		<div class="word-card">
			<button class="speak-btn" onclick={() => speakJapanese(card.jp)} aria-label="Reproducir">
				<Icon icon={VolumeHighIcon} size={22} color="var(--hinomaru-red)" />
			</button>
			<div class="word-jp">{card.jp}</div>
			<div class="word-rom">{card.romaji}</div>
			<div class="word-meaning">{$locale === 'es' ? card.es : card.en}</div>
		</div>

		{#if unsupported}
			<div class="warn">
				{$locale === 'es' ? 'Tu navegador no soporta voz.' : 'Voice not supported.'}
			</div>
		{:else}
			<button
				class="mic-btn"
				class:listening
				class:correct={locked && isCorrect}
				class:wrong={locked && !isCorrect}
				disabled={locked}
				onclick={listening ? stop : start}
				aria-label="Mic"
			>
				<Icon icon={Mic01Icon} size={42} color="white" />
			</button>

			{#if transcript}
				<div class="transcript" in:fade>"{transcript}"</div>
			{:else if listening}
				<div class="status">{$locale === 'es' ? 'Escuchando…' : 'Listening…'}</div>
			{:else if !locked}
				<div class="status">{$locale === 'es' ? 'Toca el micrófono' : 'Tap the mic'}</div>
			{/if}
		{/if}
	</div>

	<div class="step-footer">
		{#if !locked && !listening && !unsupported}
			<button class="skip-btn" onclick={skip}>
				{$locale === 'es' ? 'Saltar' : 'Skip'}
			</button>
		{:else if unsupported}
			<button class="skip-btn primary" onclick={() => props.onAnswer(true)}>
				{$locale === 'es' ? 'Saltar paso' : 'Skip step'}
			</button>
		{/if}
	</div>
</div>

<style>
	.step-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.step-header {
		padding-bottom: 24px;
		text-align: center;
	}
	.step-instruction {
		font-size: 14px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--fg-tertiary);
	}
	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 24px;
	}
	.word-card {
		width: 100%;
		background: var(--bg-surface);
		border-radius: 32px;
		padding: 32px 24px;
		text-align: center;
		position: relative;
	}
	.speak-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--ink-50);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.speak-btn:active {
		transform: scale(0.9);
	}
	.word-jp {
		font-family: var(--font-jp);
		font-size: clamp(36px, 9vw, 48px);
		font-weight: 700;
		color: var(--sumi);
	}
	.word-rom {
		font-size: 16px;
		color: var(--fg-secondary);
		font-weight: 600;
		margin-top: 8px;
	}
	.word-meaning {
		font-size: 13px;
		color: var(--fg-tertiary);
		margin-top: 4px;
	}
	.mic-btn {
		width: 110px;
		height: 110px;
		border-radius: 50%;
		background: var(--hinomaru-red);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow:
			0 10px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black),
			0 12px 32px color-mix(in srgb, var(--hinomaru-red) 30%, transparent);
		transition: all 0.15s;
	}
	.mic-btn:active:not(:disabled) {
		transform: translateY(5px);
		box-shadow: 0 5px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black);
	}
	.mic-btn.listening {
		animation: pulse 1.4s ease-in-out infinite;
	}
	.mic-btn.correct {
		background: var(--success);
		box-shadow: 0 10px 0 color-mix(in srgb, var(--success) 60%, black);
	}
	.mic-btn.wrong {
		opacity: 0.7;
	}
	@keyframes pulse {
		0%, 100% {
			box-shadow:
				0 10px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black),
				0 0 0 0 color-mix(in srgb, var(--hinomaru-red) 40%, transparent);
		}
		50% {
			box-shadow:
				0 10px 0 color-mix(in srgb, var(--hinomaru-red) 60%, black),
				0 0 0 18px color-mix(in srgb, var(--hinomaru-red) 0%, transparent);
		}
	}
	.transcript,
	.status {
		font-size: 14px;
		color: var(--fg-secondary);
		font-weight: 600;
		min-height: 22px;
		text-align: center;
	}
	.transcript {
		font-family: var(--font-jp);
		color: var(--sumi);
		font-size: 18px;
	}
	.warn {
		font-size: 13px;
		color: var(--fg-tertiary);
		text-align: center;
	}
	.step-footer {
		padding-top: 32px;
		text-align: center;
		min-height: 60px;
	}
	.skip-btn {
		background: none;
		border: none;
		color: var(--fg-tertiary);
		font-size: 14px;
		font-weight: 700;
		text-decoration: underline;
		cursor: pointer;
		padding: 12px 24px;
	}
	.skip-btn.primary {
		text-decoration: none;
		background: var(--hinomaru-red);
		color: white;
		border-radius: 18px;
		padding: 16px 32px;
		font-weight: 800;
	}
</style>
