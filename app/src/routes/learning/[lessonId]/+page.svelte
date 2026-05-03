<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { createClient } from '$lib/supabase';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { addXP } from '$lib/utils/gamification';
	
	// Sessions
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

		// 1. Update SRS progress
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
		
		// 2. Incrementally save lesson progress (optional, but good for persistence)
		await supabase.from('lesson_progress').upsert({
			user_id: user.id,
			lesson_id: lesson.id,
			last_card_id: c.id,
			updated_at: new Date().toISOString()
		});
	}

	async function handleComplete(results: { correct: number; total: number }) {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;

		// 1. Mark lesson as completed
		await supabase.from('lesson_progress').upsert({
			user_id: user.id,
			lesson_id: lesson.id,
			correct_count: results.correct,
			total_steps: results.total,
			completed_at: new Date().toISOString()
		});

		// 2. Save to global sessions table
		await supabase.from('sessions').insert({
			user_id: user.id,
			deck_id: lesson.deckId,
			mode: lesson.type,
			correct: results.correct,
			total: results.total
		});

		// 3. Update gamification
		await updateStreak(supabase, user.id);
		await addXP(supabase, user.id, results.correct * 10);

		// 4. Redirect to summary
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
</script>

<svelte:head>
	<title>
		{$locale === 'es' ? lesson.title_es : lesson.title_en} · Hinomaru
	</title>
</svelte:head>

{#if lesson.type === 'learn' || lesson.type === 'review'}
	<FlashcardSession 
		{cards} 
		deck={{ id: lesson.deckId, title: lesson.title_es }}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else if lesson.type === 'quiz'}
	<QuizSession 
		{cards} 
		deck={{ id: lesson.deckId, title: lesson.title_es }}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else if lesson.type === 'speak'}
	<SpeakingSession 
		{cards} 
		deck={{ id: lesson.deckId, title: lesson.title_es }}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else if lesson.type === 'match'}
	<MatchSession 
		{cards} 
		deck={{ id: lesson.deckId, title: lesson.title_es }}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else if lesson.type === 'write'}
	<WriteSession 
		{cards} 
		deck={{ id: lesson.deckId, title: lesson.title_es }}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{:else}
	<!-- Fallback for unknown types -->
	<FlashcardSession 
		{cards} 
		deck={{ id: lesson.deckId, title: lesson.title_es }}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={handleExit}
	/>
{/if}
