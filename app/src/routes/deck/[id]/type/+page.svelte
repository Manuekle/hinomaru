<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { 
		VolumeHighIcon, 
		Cancel01Icon, 
		CheckmarkCircle01Icon,
		TranslateIcon,
		Clock01Icon,
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
	import { kanaToRomaji } from '$lib/utils/romaji';
	import SessionEmptyState from '$lib/components/SessionEmptyState.svelte';
	import { createMistakeQueue } from '$lib/utils/mistakeQueue.svelte';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import { fadeIn, fadeUp } from '$lib/motion';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	let { data } = $props<{ data: PageData }>();
	const supabase = createClient();
	const queue = $derived.by(() => createMistakeQueue<any>(data.cards as any[]));

	let answer = $state('');
	let submitted = $state(false);
	let correct = $state(0);
	let struggled = $state(false);
	let showAnticipation = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);

	const cards = $derived(queue.cards);
	const i = $derived(queue.index);
	const card = $derived(queue.current);

	// Timer
	let elapsed = $state(0);
	let timerInterval: any;

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
	};

	onMount(() => {
		timerInterval = setInterval(() => elapsed++, 1000);
		return () => clearInterval(timerInterval);
	});

	const isCorrect = $derived.by(() => {
		if (!card || !answer) return false;
		const clean = (s: string) =>
			s
				.trim()
				.toLowerCase()
				.replace(/^to\s+/, '');
		const userAns = clean(answer);
		const targetEn = clean(card.en);
		const targetEs = clean(card.es || '');
		return userAns === targetEn || userAns === targetEs;
	});

	function submit() {
		if (submitted || !answer.trim()) return;
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
				mode: 'type'
			});
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await supabase.from('sessions').insert({
					user_id: user.id,
					deck_id: data.deck.id,
					mode: 'type',
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
			answer = '';
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

	function keydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			if (submitted) {
				next();
			} else {
				submit();
			}
		}
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
				sessionCount={cards.length} 
				deckId={data.deck.id} 
				modeLabel={t('mode.type.title', $locale)}
			/>
		{:else if card}
			<div class="type-viewer">
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

					<div class="card-hint">{t('session.whatMean', $locale)}</div>
				</div>

				<div class="input-section">
					<input
						use:focusOnMount
						type="text"
						bind:value={answer}
						bind:this={inputEl}
						onkeydown={keydown}
						placeholder={t('session.typeTranslation', $locale)}
						class="hm-input type-input"
						class:is-correct={submitted && isCorrect}
						class:is-wrong={submitted && !isCorrect}
						disabled={submitted}
						autocomplete="off"
						autocorrect="off"
						spellcheck="false"
					/>

					{#if submitted}
						<div
							class="feedback-box"
							class:correct={isCorrect}
							class:wrong={!isCorrect}
							use:fadeUp={{ y: 10 }}
						>
							<div class="feedback-header">
								<div class="feedback-status">
									{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}
								</div>
								{#if !isCorrect}
									<div class="correct-answer">
										{t('session.correctWas', $locale)}: <strong>{$locale === 'es' ? card.es : card.en}</strong>
									</div>
								{/if}
							</div>

							{#if card.example}
								<div class="example-section">
									<div class="example-content">
										<div class="example-text jp">{card.example}</div>
										{#if $showRomaji && ['N5', 'N4', 'Survival'].includes(data.deck.level)}
											<div class="example-romaji">
												{card.example_romaji || card.extra?.example_romaji || kanaToRomaji(card.example)}
											</div>
										{/if}
										<div class="example-translation">
											{$locale === 'es' ? card.example_es : card.example_en}
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	{#if !showAnticipation}
		<StickyFooter>
			{#if submitted}
				<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={next}>
					{t('session.next', $locale)}
				</button>
			{:else}
				<button 
					class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" 
					onclick={submit}
					disabled={!answer.trim()}
				>
					{t('session.check', $locale)}
				</button>
			{/if}
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

	.type-viewer {
		display: flex;
		flex-direction: column;
		gap: 24px;
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
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.input-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.type-input {
		width: 100%;
		padding: 24px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 24px;
		font-size: 24px;
		font-weight: 700;
		color: var(--fg-primary);
		text-align: center;
		transition: all 0.2s cubic-bezier(0.32, 0.72, 0, 1);
		box-shadow: var(--shadow-sm);
	}

	.type-input::placeholder {
		font-weight: 500;
		font-size: 18px;
		color: var(--fg-tertiary);
		opacity: 0.6;
	}

	.type-input:focus {
		outline: none;
		border-color: var(--hinomaru-red);
		box-shadow: 0 0 0 4px var(--hinomaru-red-wash), var(--shadow-md);
		transform: scale(1.01);
	}

	.type-input.is-correct {
		border-color: var(--success);
		background: var(--success-wash);
		color: var(--success);
	}

	.type-input.is-wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}

	.feedback-box {
		padding: 24px;
		border-radius: 24px;
		background: var(--bg-surface);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--ink-100);
	}

	.feedback-status { font-weight: 800; font-size: 18px; }
	.correct .feedback-status { color: var(--success); }
	.wrong .feedback-status { color: var(--hinomaru-red); }

	.correct-answer { font-size: 14px; color: var(--fg-secondary); margin-top: 4px; }
	.correct-answer strong { color: var(--fg-primary); }

	.example-section {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--ink-100);
	}

	.example-text { font-size: 17px; color: var(--fg-primary); font-weight: 600; }
	.example-romaji { font-size: 13px; color: var(--hinomaru-red); margin-top: 4px; }
	.example-translation { font-size: 14px; color: var(--fg-secondary); margin-top: 4px; }
</style>
