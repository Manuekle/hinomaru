<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { 
		VolumeHighIcon, 
		Mic01Icon, 
		Tick02Icon, 
		Cancel01Icon,
		TranslateIcon,
		ArrowRight01Icon
	} from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeIn, fadeUp } from '$lib/motion';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const supabase = createClient();
	const queue = $derived.by(() => createMistakeQueue<any>(data.cards as any[]));

	let isRecording = $state(false);
	let transcript = $state('');
	let submitted = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);
	let error = $state<string | null>(null);

	const card = $derived(queue.current);

	let recognition: any;

	onMount(() => {
		const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		if (SpeechRecognition) {
			recognition = new SpeechRecognition();
			recognition.lang = 'ja-JP';
			recognition.interimResults = false;
			recognition.maxAlternatives = 1;

			recognition.onresult = (event: any) => {
				transcript = event.results[0][0].transcript;
				isRecording = false;
				submit();
			};

			recognition.onerror = (event: any) => {
				console.error('Speech recognition error', event.error);
				isRecording = false;
				if (event.error === 'no-speech') {
					error = t('speaking.noSpeech', $locale);
				} else {
					error = t('speaking.unavailable', $locale);
				}
			};

			recognition.onend = () => {
				isRecording = false;
			};
		}
	});

	function toggleRecording() {
		if (isRecording) {
			recognition.stop();
		} else {
			error = null;
			transcript = '';
			submitted = false;
			try {
				recognition.start();
				isRecording = true;
			} catch (e) {
				error = t('speaking.unavailable', $locale);
			}
		}
	}

	const isCorrect = $derived.by(() => {
		if (!card || !transcript) return false;
		// Normalize: remove punctuation and spaces
		const normalize = (s: string) => s.replace(/[、。！？\s]/g, '');
		const user = normalize(transcript);
		const target = normalize(card.jp);
		return user === target;
	});

	function submit() {
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

		if (!isCorrect) {
			queue.requeueCurrent();
		}

		if (queue.isLast) {
			const params = new URLSearchParams({
				correct: String(correct),
				total: String(queue.originalTotal),
				mode: 'speaking'
			});
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await supabase.from('sessions').insert({
					user_id: user.id,
					deck_id: data.deck.id,
					mode: 'speaking',
					correct,
					total: queue.originalTotal
				});
				await updateStreak(supabase, user.id);
			}
			showAnticipation = true;
			setTimeout(() => {
				goto(`/deck/${data.deck.id}/summary?${params}`);
			}, 1800);
		} else {
			submitted = false;
			transcript = '';
			queue.advance();
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

	function playAudio() {
		speakJapanese(card?.jp ?? '');
	}
</script>

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={() => goto(`/deck/${data.deck.id}`)}>
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>

		<div class="header-progress">
			<span class="session-index">{queue.index + 1} / {queue.total}</span>
			<span class="total-label">{t('home.cards', $locale, { n: data.totalCards })}</span>
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
		{#if data.cards.length === 0}
			<SessionEmptyState 
				totalCards={data.totalCards} 
				learnedCount={data.learnedCount}
				sessionCount={queue.total} 
				deckId={data.deck.id} 
				modeLabel={t('mode.speaking.title', $locale)}
			/>
		{:else if card}
			<div class="speaking-viewer">
				<!-- Card — same visual as flashcard front -->
				<div class="card-outer">
					<div class="speak-card">


						<div class="word-center">
							<div class="jp word-text" style="font-size:{card.jp.length <= 4 ? 'var(--fs-display)' : card.jp.length <= 6 ? 'var(--fs-2xl)' : card.jp.length <= 10 ? 'var(--fs-xl)' : 'var(--fs-lg)'};">{card.jp}</div>
							{#if $showRomaji && card.romaji}
								<div class="romaji-sub">{card.romaji}</div>
							{/if}
							<div class="meaning-sub">{$locale === 'es' ? card.es : card.en}</div>
						</div>

						<button onclick={playAudio} class="audio-listen" aria-label="Play pronunciation">
							<Icon icon={VolumeHighIcon} size={18} color="currentColor" />
							<span>{t('speaking.listen', $locale)}</span>
						</button>
					</div>
				</div>

				<!-- Mic + feedback below card -->
				<div class="mic-area">
					<button
						class="mic-btn"
						class:is-recording={isRecording}
						onclick={toggleRecording}
						disabled={submitted}
						aria-label={isRecording ? t('speaking.stop', $locale) : t('speaking.speak', $locale)}
					>
						<div class="mic-ring"></div>
						<Icon icon={isRecording ? Tick02Icon : Mic01Icon} size={30} color="currentColor" />
					</button>
					<div class="mic-label" aria-hidden="true">
						{isRecording ? t('speaking.stop', $locale) : t('speaking.speak', $locale)}
					</div>
				</div>

				{#if transcript}
					<div class="transcript-box" use:fadeUp={{ y: 8 }}>
						<span class="transcript-label">{t('speaking.heard', $locale)}</span>
						<div class="transcript-text jp">{transcript}</div>
					</div>
				{/if}

				{#if error}
					<div class="error-msg" use:fadeIn>{error}</div>
				{/if}

				{#if submitted}
					<div class="feedback-row" class:correct={isCorrect} use:fadeUp={{ y: 8 }}>
						<Icon icon={isCorrect ? ArrowRight01Icon : Cancel01Icon} size={16} color="currentColor" />
						<span>{isCorrect ? t('session.correct', $locale) : t('session.answerIs', $locale, { a: card.jp })}</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if submitted && !showAnticipation}
		<StickyFooter>
			<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={next}>
				{t('session.next', $locale)}
			</button>
		</StickyFooter>
	{/if}
</div>

{#if showAnticipation}
	<AnticipationScreen />
{/if}

<style>
	.premium-bg {
		background-color: var(--bg-page);
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
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

	.lang-btn.active {
		color: var(--hinomaru-red);
	}

	.speaking-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(20px, 5vh, 32px);
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
		padding: 24px 0 8px;
	}

	.card-outer {
		width: 100%;
	}

	.speak-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		box-shadow: 0 4px 24px rgba(26,26,26,0.08), 0 1px 4px rgba(26,26,26,0.04);
		padding: 20px 24px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		min-height: clamp(200px, 40vw, 280px);
	}

	.card-tag {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
		background: var(--bg-muted);
		padding: 4px 10px;
		border-radius: 20px;
		align-self: flex-start;
	}

	.word-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		text-align: center;
	}

	.word-text {
		color: var(--fg-primary);
		line-height: 1;
		font-weight: 700;
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

	.audio-listen {
		height: 44px;
		padding: 0 18px;
		border-radius: 22px;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--fg-secondary);
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		font-family: inherit;
		-webkit-tap-highlight-color: transparent;
		transition: all 0.15s;
	}

	.audio-listen:focus-visible {
		outline: 2px solid var(--hinomaru-red);
		outline-offset: 2px;
	}

	.mic-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		padding: 8px 0;
	}

	.mic-btn {
		width: 88px;
		height: 88px;
		border-radius: 50%;
		border: none;
		background: var(--hinomaru-red);
		color: white;
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6px 24px rgba(188, 0, 45, 0.28);
		transition: transform 0.15s, box-shadow 0.15s, background-color 0.15s, color 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.mic-btn:active { transform: scale(0.92); box-shadow: 0 2px 12px rgba(188, 0, 45, 0.2); }
	.mic-btn:disabled { opacity: 0.45; cursor: default; }

	.mic-ring {
		position: absolute;
		inset: -10px;
		border-radius: 50%;
		border: 2px solid var(--hinomaru-red);
		opacity: 0;
		pointer-events: none;
	}

	.is-recording .mic-ring {
		animation: pulse-ring 1.4s cubic-bezier(0.24, 0, 0.38, 1) infinite;
	}

	.is-recording {
		background: var(--fg-primary);
		color: var(--bg-surface);
		box-shadow: 0 6px 24px rgba(26, 26, 26, 0.2);
	}

	@keyframes pulse-ring {
		0% { transform: scale(0.85); opacity: 0.7; }
		100% { transform: scale(1.35); opacity: 0; }
	}

	.mic-label {
		font-size: 12px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.transcript-box {
		width: 100%;
		padding: 14px 18px;
		background: var(--bg-muted);
		border-radius: 16px;
		text-align: center;
	}

	.transcript-label {
		display: block;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
		margin-bottom: 6px;
	}

	.transcript-text { font-size: 22px; font-weight: 700; color: var(--fg-primary); }

	.error-msg { font-size: 14px; font-weight: 600; color: var(--hinomaru-red); }

	.feedback-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border-radius: 14px;
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		font-size: 15px;
		font-weight: 700;
		width: 100%;
	}

	.feedback-row.correct {
		background: var(--success-wash);
		color: var(--success);
	}
</style>
