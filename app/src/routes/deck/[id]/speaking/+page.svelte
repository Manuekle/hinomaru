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
			{queue.index + 1} / {queue.total}
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
				<div class="card-face minimal-card">
					<div class="card-tag">{$locale === 'es' ? (data.deck?.kind_es ?? data.deck?.kind) : data.deck?.kind}</div>

					<button
						onclick={playAudio}
						aria-label="Play pronunciation"
						class="audio-pill normal"
						style="margin: 0 auto;"
					>
						<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
					</button>

					<div class="jp card-jp">{card.jp}</div>
					
					{#if $showRomaji && ['N5', 'N4', 'Survival'].includes(data.deck.level)}
						<div class="romaji card-romaji">{card.romaji}</div>
					{/if}

					<div class="card-hint">{$locale === 'es' ? card.es : card.en}</div>
				</div>

				<div class="mic-section">
					<button 
						class="mic-btn" 
						class:is-recording={isRecording}
						onclick={toggleRecording}
						disabled={submitted}
					>
						<div class="mic-ring"></div>
						<div class="mic-icon-wrapper">
							<Icon icon={isRecording ? Tick02Icon : Mic01Icon} size={32} color="white" />
						</div>
					</button>
					
					<div class="mic-label">
						{isRecording ? t('speaking.stop', $locale) : t('speaking.speak', $locale)}
					</div>

					{#if transcript}
						<div class="transcript-box" use:fadeUp={{ y: 10 }}>
							<div class="transcript-label">{t('speaking.heard', $locale)}</div>
							<div class="transcript-text jp">{transcript}</div>
						</div>
					{/if}

					{#if error}
						<div class="error-msg" use:fadeIn>{error}</div>
					{/if}

					{#if submitted}
						<div
							class="feedback-box"
							class:correct={isCorrect}
							class:wrong={!isCorrect}
							use:fadeUp={{ y: 10 }}
						>
							<div class="feedback-status">
								{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}
							</div>
							{#if !isCorrect}
								<div class="correct-answer">
									{t('session.answerIs', $locale, { a: card.jp })}
								</div>
							{/if}
						</div>
					{/if}
				</div>
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

	.speaking-viewer {
		display: flex;
		flex-direction: column;
		gap: 32px;
		width: 100%;
		max-width: 520px;
		margin: 0 auto;
		padding: 24px;
	}

	.minimal-card {
		background: var(--bg-surface);
		border-radius: 40px;
		padding: 40px 32px;
		text-align: center;
		box-shadow: var(--shadow-md);
		position: relative;
		border: 1px solid var(--ink-100);
	}

	.card-tag {
		font-size: 11px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 24px;
	}

	.audio-pill {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		transition: all 0.2s;
	}

	.card-jp {
		font-size: 42px;
		font-weight: 800;
		color: var(--fg-primary);
		margin-top: 24px;
		line-height: 1.2;
	}

	.card-romaji {
		margin-top: 8px;
		font-size: 18px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.card-hint {
		margin-top: 24px;
		font-size: 18px;
		font-weight: 600;
		color: var(--fg-secondary);
	}

	.mic-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.mic-btn {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		border: none;
		background: var(--hinomaru-red);
		position: relative;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8px 32px rgba(188, 0, 45, 0.3);
		transition: transform 0.2s;
	}

	.mic-btn:active { transform: scale(0.92); }
	.mic-btn:disabled { opacity: 0.5; cursor: default; }

	.mic-ring {
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		border: 2px solid var(--hinomaru-red);
		opacity: 0;
	}

	.is-recording .mic-ring {
		animation: pulse-ring 1.5s cubic-bezier(0.24, 0, 0.38, 1) infinite;
		opacity: 1;
	}

	@keyframes pulse-ring {
		0% { transform: scale(0.8); opacity: 0.8; }
		100% { transform: scale(1.3); opacity: 0; }
	}

	.mic-label {
		font-size: 14px;
		font-weight: 800;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.transcript-box {
		width: 100%;
		padding: 20px;
		background: var(--bg-muted);
		border-radius: 20px;
		text-align: center;
	}

	.transcript-label { font-size: 11px; font-weight: 800; color: var(--fg-tertiary); margin-bottom: 4px; }
	.transcript-text { font-size: 20px; font-weight: 700; color: var(--fg-primary); }

	.error-msg { color: var(--hinomaru-red); font-size: 14px; font-weight: 600; }

	.feedback-box {
		width: 100%;
		padding: 24px;
		border-radius: 24px;
		background: var(--bg-surface);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--ink-100);
		text-align: center;
	}

	.feedback-status { font-weight: 800; font-size: 18px; }
	.correct .feedback-status { color: var(--success); }
	.wrong .feedback-status { color: var(--hinomaru-red); }

	.correct-answer { font-size: 14px; color: var(--fg-secondary); margin-top: 4px; }
</style>
