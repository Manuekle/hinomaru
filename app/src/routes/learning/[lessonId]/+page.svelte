<script lang="ts">
	import { goto } from '$app/navigation';
	import { locale } from '$lib/stores/locale';
	import { createClient } from '$lib/supabase';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import { addXP } from '$lib/utils/gamification';
	import UnifiedSession from '$lib/components/sessions/UnifiedSession.svelte';
	import type { EngineState } from '$lib/learning/engine';
	import type { PageData } from './$types';

	const props: { data: PageData } = $props();
	const data = $derived(props.data);
	const lesson = $derived(data.lesson);
	const cards = $derived(data.cards as any[]);
	const supabase = createClient();

	async function handleCardProgress(card: any, correct: boolean, struggled: boolean) {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;

		const currentProgress = card.progress && card.progress.length > 0 ? card.progress[0] : null;
		const quality = mapPerformanceToQuality(correct, struggled);
		const nextState = calculateNextReview(quality, currentProgress);

		await supabase.from('progress').upsert({
			user_id: user.id,
			card_id: card.id,
			learned: true,
			...nextState,
			last_seen: new Date().toISOString()
		});
	}

	async function handleComplete(results: { correct: number; total: number; mistakes: number; state: EngineState }) {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return;

		await supabase.from('lesson_progress').upsert(
			{
				user_id: user.id,
				lesson_id: lesson.id,
				correct_count: results.correct,
				total_steps: results.total,
				mistakes_count: results.mistakes,
				state: results.state as any,
				completed_at: new Date().toISOString()
			},
			{ onConflict: 'user_id,lesson_id' }
		);

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
		}, 1800);
	}
</script>

<svelte:head>
	<title>{$locale === 'es' ? lesson.title_es : lesson.title_en} · Hinomaru</title>
</svelte:head>

<UnifiedSession
	{cards}
	lessonType={lesson.type}
	onCardProgress={handleCardProgress}
	onComplete={handleComplete}
	onExit={() => goto('/')}
/>
