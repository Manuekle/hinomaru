<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { VolumeHighIcon, Cancel01Icon, CheckmarkCircle01Icon, Cancel02Icon } from '@hugeicons/core-free-icons';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { addXP } from '$lib/utils/gamification';
	import { playFinish } from '$lib/utils/sounds';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import type { PageData } from './$types';
	
	import StudySessionLayout from '$lib/components/study/StudySessionLayout.svelte';
	import Flashcards from '$lib/components/study/Flashcards.svelte';
	import MultipleChoice from '$lib/components/study/MultipleChoice.svelte';
	import TypeMeaning from '$lib/components/study/TypeMeaning.svelte';
	import ListeningQuiz from '$lib/components/study/ListeningQuiz.svelte';

	type ReviewMode = 'flashcard' | 'quiz' | 'listening' | 'typing';

	let { data } = $props<{ data: PageData }>();
	const words = $derived(data.words as any[]);
	const supabase = createClient();

	// Build session: assign a mode to each word
	function buildSession(ws: any[]) {
		const modes: ReviewMode[] = ['flashcard', 'quiz', 'listening', 'typing'];
		return ws.map((w, i) => ({ word: w, mode: modes[i % modes.length] as ReviewMode }));
	}

	let session = $state(buildSession(words));
	let i = $state(0);
	let correct = $state(0);
	let showAnticipation = $state(false);
	let confettiRef = $state<{ fire: () => void } | null>(null);

	const entry = $derived(session[i]);
	const word = $derived(entry?.word);
	const mode = $derived(entry?.mode ?? 'flashcard');

	async function updateWordProgress(w: any, gotIt: boolean, hadDifficulty: boolean) {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		const currentSRS = { repetitions: w.repetitions || 0, easiness: w.easiness || 2.5, interval_days: w.interval_days || 0, next_review: w.next_review };
		const quality = mapPerformanceToQuality(gotIt, hadDifficulty);
		const nextState = calculateNextReview(quality, currentSRS);
		await supabase.from('user_saved_words').update({ ...nextState, last_seen: new Date().toISOString() }).eq('id', w.id);
	}

	async function saveSession() {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;
		await supabase.from('sessions').insert({ user_id: user.id, mode: 'vocabulary_review', correct, total: session.length });
		await updateStreak(supabase, user.id);
		await addXP(supabase, user.id, correct * 5);
	}

	async function advance(gotIt: boolean) {
		if (gotIt) { correct++; }
		updateWordProgress(word, gotIt, !gotIt);
		
		if (i >= session.length - 1) {
			playFinish(); confettiRef?.fire(); saveSession(); showAnticipation = true;
			setTimeout(() => goto('/vocabulary'), 1600);
			return;
		}
		
		i++;
	}

	const modeLabel: Record<ReviewMode, string> = { flashcard: '🃏', quiz: '🎯', listening: '👂', typing: '⌨️' };
</script>

<svelte:head><title>{t('nav.review', $locale)} — Hinomaru</title></svelte:head>

<Confetti bind:this={confettiRef} />

<StudySessionLayout
	onExit={() => goto('/vocabulary')}
	currentIndex={i}
	totalCount={session.length}
	modeBadge={`${modeLabel[mode]} ${t(`vocab.review.${mode}`, $locale)}`}
>
	<div class="session-container">
		{#if session.length === 0}
			<div class="empty-state-wrapper">
				<div class="empty-emoji">✨</div>
				<h2 class="empty-title">{t('home.complete', $locale)}</h2>
				<p class="empty-desc">{t('summary.all', $locale)}</p>
				<button class="hm-btn hm-btn-primary hm-btn-lg" onclick={() => goto('/vocabulary')}>{t('deck.back', $locale)}</button>
			</div>
		{:else if word}
			{#key i}
				{#if mode === 'flashcard'}
					<Flashcards mode="lesson" card={word} onAnswer={advance} />
				{:else if mode === 'quiz'}
					<MultipleChoice mode="lesson" card={word} distractors={words.filter(w => w.id !== word.id)} onAnswer={advance} />
				{:else if mode === 'listening'}
					<ListeningQuiz card={word} distractors={words.filter(w => w.id !== word.id)} onAnswer={advance} />
				{:else if mode === 'typing'}
					<TypeMeaning card={word} onAnswer={advance} />
				{/if}
			{/key}
		{/if}
	</div>
</StudySessionLayout>

{#if showAnticipation}<AnticipationScreen />{/if}

<style>
	.session-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 20px 100px;
	}
</style>
