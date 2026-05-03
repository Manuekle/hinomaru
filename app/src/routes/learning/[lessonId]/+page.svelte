<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { createClient } from '$lib/supabase';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { addXP } from '$lib/utils/gamification';

	import FlashcardSession from '$lib/components/sessions/FlashcardSession.svelte';
	import QuizSession from '$lib/components/sessions/QuizSession.svelte';
	import SpeakingSession from '$lib/components/sessions/SpeakingSession.svelte';
	import MatchSession from '$lib/components/sessions/MatchSession.svelte';
	import WriteSession from '$lib/components/sessions/WriteSession.svelte';

	import type { PageData } from './$types';

	const props: { data: PageData } = $props();
	const data = $derived(props.data);
	const lesson = $derived(data.lesson);
	const cards = $derived(data.cards as any[]);
	const supabase = createClient();

	async function handleCardProgress(c: any, gotIt: boolean, hadDifficulty: boolean = false) {
		const { data: { user } } = await supabase.auth.getUser();
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

	async function handleComplete(results: { correct: number; total: number }) {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;

		await supabase.from('lesson_progress').upsert({
			user_id: user.id,
			lesson_id: lesson.id,
			correct_count: results.correct,
			total_steps: results.total,
			mistakes_count: 0,
			state: null,
			completed_at: new Date().toISOString()
		});

		await supabase.from('sessions').insert({
			user_id: user.id,
			deck_id: lesson.deckId,
			mode: lesson.type,
			correct: results.correct,
			total: results.total
		});

		await updateStreak(supabase, user.id);
		await addXP(supabase, user.id, results.correct * 10);

		setTimeout(() => {
			const params = new URLSearchParams({
				correct: String(results.correct),
				total: String(results.total),
				mode: lesson.type,
				lessonId: lesson.id,
				fromRoadmap: 'true'
			});
			goto(`/deck/${lesson.deckId}/summary?${params}`);
		}, 1000);
	}

	function handleExit() {
		goto('/');
	}

	const deck = $derived({ id: lesson.deckId, title: $locale === 'es' ? lesson.title_es : lesson.title_en });
</script>

<svelte:head>
	<title>
		{$locale === 'es' ? lesson.title_es : lesson.title_en} · Hinomaru
	</title>
</svelte:head>

{#if lesson.type === 'learn' || lesson.type === 'review'}
	<FlashcardSession
		{cards}
		{deck}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else if lesson.type === 'practice' || lesson.type === 'quiz'}
	<QuizSession
		{cards}
		{deck}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else if lesson.type === 'speak'}
	<SpeakingSession
		{cards}
		{deck}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else if lesson.type === 'match'}
	<MatchSession
		{cards}
		{deck}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else if lesson.type === 'write'}
	<WriteSession
		{cards}
		{deck}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else}
	<FlashcardSession
		{cards}
		{deck}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{/if}
