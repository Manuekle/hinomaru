<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import {
		VolumeHighIcon,
		Cancel01Icon,
		TranslateIcon
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
			struggled = true;
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
			struggled = false;
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
				sessionCount={cards.length} 
				deckId={data.deck.id} 
				modeLabel={t('mode.type.title', $locale)}
			/>
		{:else if card}
			<div class="type-viewer">
				<div class="word-card">
					<button onclick={playAudio} class="audio-corner" aria-label="Play pronunciation">
						<Icon icon={VolumeHighIcon} size={15} color="currentColor" />
					</button>
					<div class="jp word-big">{card.jp}</div>
					{#if $showRomaji && card.romaji}
						<div class="romaji-line">{card.romaji}</div>
					{/if}
				</div>

				<input
					use:focusOnMount
					type="text"
					bind:value={answer}
					bind:this={inputEl}
					onkeydown={keydown}
					placeholder={t('session.typeTranslation', $locale)}
					class="type-input"
					class:is-correct={submitted && isCorrect}
					class:is-wrong={submitted && !isCorrect}
					disabled={submitted}
					autocomplete="off"
					autocorrect="off"
					spellcheck="false"
				/>

				{#if submitted}
					<div class="feedback-box" class:correct={isCorrect} class:wrong={!isCorrect} use:fadeUp={{ y: 10 }}>
						<div class="feedback-status">
							{isCorrect ? t('session.correct', $locale) : t('session.wrong', $locale)}
						</div>
						{#if !isCorrect}
							<div class="correct-answer">{t('session.correctWas', $locale)}: <strong>{$locale === 'es' ? card.es : card.en}</strong></div>
						{/if}

						{#if card.example}
							<div class="example-section">
								<div class="example-text jp">{card.example}</div>
								{#if $showRomaji}
									{@const exRom = card.example_romaji || card.extra?.example_romaji || kanaToRomaji(card.example_kana || card.example || '')}
									{#if exRom}
										<div class="example-romaji">{exRom}</div>
									{/if}
								{/if}
								<div class="example-translation">{$locale === 'es' ? card.example_es : card.example_en}</div>
							</div>
						{/if}
					</div>
				{/if}
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

	.type-viewer {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 18px;
		width: 100%;
		max-width: 480px;
		margin: 0 auto;
		padding: 20px 0 8px;
	}

	.word-card {
		position: relative;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 28px;
		box-shadow: 0 4px 24px rgba(26,26,26,0.08), 0 1px 4px rgba(26,26,26,0.04);
		padding: clamp(28px, 6vw, 48px) 24px clamp(28px, 6vw, 40px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
		width: 100%;
	}

	.audio-corner {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: background 0.15s;
	}

	.audio-corner:focus-visible {
		outline: 2px solid var(--hinomaru-red);
		outline-offset: 2px;
	}

	.word-big {
		font-size: clamp(44px, 12vw, 64px);
		font-weight: 800;
		color: var(--fg-primary);
		line-height: 1;
		padding: 0 40px;
	}

	.romaji-line {
		font-size: clamp(15px, 4vw, 18px);
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.type-input {
		width: 100%;
		padding: 18px 20px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 18px;
		font-size: 20px;
		font-weight: 700;
		color: var(--fg-primary);
		text-align: center;
		font-family: inherit;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.type-input::placeholder {
		font-weight: 400;
		font-size: 16px;
		color: var(--fg-tertiary);
	}

	.type-input:focus {
		outline: none;
		border-color: var(--hinomaru-red);
		box-shadow: 0 0 0 3px var(--hinomaru-red-wash);
	}

	.type-input.is-correct {
		border-color: var(--success);
		background: var(--success-wash);
		color: var(--success);
		box-shadow: 0 0 0 3px rgba(46,125,91,0.12);
	}

	.type-input.is-wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		box-shadow: 0 0 0 3px rgba(188,0,45,0.12);
	}

	.feedback-box {
		padding: 16px 18px;
		border-radius: 16px;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		max-height: 200px;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.feedback-box.correct {
		border-color: var(--success);
		background: var(--success-wash);
	}

	.feedback-box.wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}

	.feedback-status { font-weight: 800; font-size: 16px; }
	.correct .feedback-status { color: var(--success); }
	.wrong .feedback-status { color: var(--hinomaru-red); }

	.correct-answer { font-size: 14px; color: var(--fg-secondary); margin-top: 4px; }
	.correct-answer strong { color: var(--fg-primary); font-weight: 700; }

	.example-section {
		margin-top: 14px;
		padding-top: 14px;
		border-top: 1px solid var(--ink-100);
	}

	.example-text { font-size: 16px; color: var(--fg-primary); font-weight: 600; }
	.example-romaji { font-size: 12px; color: var(--hinomaru-red); margin-top: 3px; font-weight: 700; }
	.example-translation { font-size: 13px; color: var(--fg-secondary); margin-top: 3px; }
</style>
