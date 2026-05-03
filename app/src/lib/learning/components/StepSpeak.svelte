<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { locale } from '$lib/stores/locale';
	import { speakJapanese } from '$lib/utils/tts';
	import { safeRomaji } from '$lib/utils/romaji';
	import InteractiveText from '$lib/components/InteractiveText.svelte';
	import { JapaneseSpeechRecognizer, isSpeechSupported } from '$lib/speaking/speech';
	import Icon from '$lib/Icon.svelte';
	import { Mic01Icon, VolumeHighIcon, Tick02Icon } from '@hugeicons/core-free-icons';
	import StickyFooter from '$lib/components/StickyFooter.svelte';

	const props: { 
		card: any; 
		onAnswer: (correct: boolean) => void;
		onDisableSpeak?: () => void;
	} = $props();
	const card = $derived(props.card);

	let recognizer: JapaneseSpeechRecognizer | null = null;
	let listening = $state(false);
	let transcript = $state('');
	let locked = $state(false);
	let isCorrect = $state(false);
	let unsupported = $state(false);
	
	const matchedIndex = $derived.by(() => {
		if (!transcript) return 0;
		const target = card.jp;
		const said = transcript.replace(/\s/g, '');
		
		// Simple prefix matching for visual feedback
		let longest = 0;
		for (let len = 1; len <= target.length; len++) {
			const sub = target.substring(0, len);
			if (said.includes(sub)) {
				longest = len;
			}
		}
		return longest;
	});

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
		if (props.onDisableSpeak) {
			props.onDisableSpeak();
		} else {
			setTimeout(() => props.onAnswer(false), 200);
		}
	}

	onDestroy(() => recognizer?.abort());
</script>

<div class="step-layout">
	<div class="step-content">
		<div class="prompt-card">
			<div class="prompt-meta">
				<span class="prompt-tag">{$locale === 'es' ? 'PRONUNCIACIÓN' : 'PRONUNCIATION'}</span>
				<button onclick={() => speakJapanese(card.jp)} class="audio-mini" aria-label="Play pronunciation">
					<Icon icon={VolumeHighIcon} size={16} color="currentColor" />
				</button>
			</div>
			<div class="jp word-text" style="font-size: {card.jp.length <= 4 ? 'var(--fs-display)' : 'var(--fs-2xl)'};">
				{#if listening || (locked && transcript)}
					{#each card.jp.split('') as char, i}
						<span class="char-unit" class:is-matched={i < matchedIndex}>{char}</span>
					{/each}
				{:else}
					<InteractiveText text={card.jp} />
				{/if}
			</div>
			<div class="romaji-sub">{safeRomaji(card.romaji, card.jp)}</div>
			{#if locked}
				<div class="meaning-sub" in:fade>{$locale === 'es' ? card.es : card.en}</div>
			{/if}
		</div>

		{#if unsupported}
			<div class="error-msg">
				{$locale === 'es' ? 'Tu navegador no soporta voz.' : 'Voice not supported.'}
			</div>
		{:else}
			<div class="mic-area">
				<button
					class="mic-btn"
					data-state={locked ? (isCorrect ? 'done' : 'idle') : (listening ? 'recording' : 'idle')}
					disabled={locked}
					onclick={listening ? stop : start}
					aria-label="Mic"
				>
					<div class="mic-ring"></div>
					<div class="mic-ring mic-ring-2"></div>
					{#if listening}
						<div class="wave" aria-hidden="true">
							{#each Array(5) as _, idx (idx)}
								<span style="animation-delay:{idx * 0.1}s"></span>
							{/each}
						</div>
					{:else if locked && isCorrect}
						<Icon icon={Tick02Icon} size={32} color="white" />
					{:else}
						<Icon icon={Mic01Icon} size={32} color="white" />
					{/if}
				</button>
				<div class="mic-label" aria-hidden="true">
					{#if listening}
						{$locale === 'es' ? 'ESCUCHANDO' : 'LISTENING'}
					{:else if locked}
						{isCorrect ? ( $locale === 'es' ? 'CORRECTO' : 'CORRECT' ) : ( $locale === 'es' ? 'INTÉNTALO' : 'TRY AGAIN' )}
					{:else}
						{$locale === 'es' ? 'TOCA PARA HABLAR' : 'TAP TO SPEAK'}
					{/if}
				</div>

				{#if !locked && !listening}
					<button class="hm-btn-text skip-link" onclick={skip}>
						{$locale === 'es' ? 'No puedo hablar ahora' : "Can't speak now"}
					</button>
				{/if}
			</div>

			{#if transcript}
				<div class="transcript-box" in:fade>"{transcript}"</div>
			{/if}
		{/if}
	</div>

	<StickyFooter>
		<div class="footer-inner">
			{#if !locked && !listening && !unsupported}
				<button class="hm-btn hm-btn-secondary hm-btn-full hm-btn-lg" onclick={skip}>
					{$locale === 'es' ? 'No puedo hablar ahora' : "Can't speak now"}
				</button>
			{:else if unsupported}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={() => props.onAnswer(true)}>
					{$locale === 'es' ? 'Saltar paso' : 'Skip step'}
				</button>
			{/if}
		</div>
	</StickyFooter>
</div>

<style>
	.step-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 24px;
	}

	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: clamp(20px, 5vh, 32px);
	}

	.prompt-card {
		width: 100%;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		box-shadow: 0 8px 32px rgba(26,26,26,0.06);
		padding: 18px 22px 22px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		text-align: center;
	}

	.prompt-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.prompt-tag {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.audio-mini {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
	}

	.word-text {
		color: var(--fg-primary);
		line-height: 1.05;
		font-weight: 800;
		padding: 8px 0;
		display: flex;
		gap: 2px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.char-unit {
		transition: color 0.2s ease, transform 0.2s ease;
	}

	.char-unit.is-matched {
		color: var(--hinomaru-red);
		transform: scale(1.1);
	}

	.romaji-sub {
		font-size: clamp(14px, 3.5vw, 17px);
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.meaning-sub {
		font-size: clamp(16px, 4vw, 20px);
		font-weight: 600;
		color: var(--fg-secondary);
	}

	.mic-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.mic-btn {
		width: 104px;
		height: 104px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, var(--hinomaru-red), #d4002f);
		color: white;
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10px 32px rgba(188, 0, 45, 0.32);
		transition: transform 0.18s cubic-bezier(0.34, 1.5, 0.64, 1);
	}

	.mic-btn:active { transform: scale(0.94); }
	
	.mic-btn[data-state="recording"] {
		background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
		transform: scale(1.04);
	}

	.mic-btn[data-state="done"] {
		background: linear-gradient(135deg, #2e7d5b, #1f5e44);
	}

	.mic-ring {
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		border: 2px solid var(--hinomaru-red);
		opacity: 0;
		pointer-events: none;
	}

	.mic-ring-2 { inset: -16px; }

	.mic-btn[data-state="recording"] .mic-ring {
		animation: pulse-ring 1.6s cubic-bezier(0.24, 0, 0.38, 1) infinite;
	}
	.mic-btn[data-state="recording"] .mic-ring-2 {
		animation: pulse-ring 1.6s cubic-bezier(0.24, 0, 0.38, 1) infinite 0.4s;
	}

	@keyframes pulse-ring {
		0% { transform: scale(0.9); opacity: 0.7; }
		100% { transform: scale(1.5); opacity: 0; }
	}

	.wave { display: flex; align-items: center; gap: 4px; height: 36px; }
	.wave span {
		width: 4px; height: 100%; background: white; border-radius: 2px;
		animation: wave-bounce 0.9s ease-in-out infinite;
	}
	@keyframes wave-bounce {
		0%, 100% { transform: scaleY(0.3); }
		50% { transform: scaleY(1); }
	}

	.mic-label {
		font-size: 11px;
		font-weight: 800;
		color: var(--fg-secondary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.transcript-box {
		font-size: 15px;
		font-family: var(--font-jp);
		color: var(--fg-secondary);
		font-weight: 600;
		font-style: italic;
	}

	:global(.word-text .word-link) {
		color: inherit !important;
		border-bottom: 2px solid var(--hinomaru-red-wash) !important;
	}
	:global(.word-text .word-link:hover) {
		border-bottom-color: var(--hinomaru-red) !important;
	}

	.skip-link {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-decoration: underline;
		background: none;
		border: none;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.2s;
		padding: 4px 8px;
	}
	.skip-link:hover { opacity: 1; color: var(--hinomaru-red); }

	.error-msg {
		font-size: 14px;
		font-weight: 600;
		color: var(--hinomaru-red);
		text-align: center;
	}

	.footer-inner { width: 100%; max-width: 480px; margin: 0 auto; }
</style>
