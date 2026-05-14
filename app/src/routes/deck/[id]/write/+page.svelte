<script lang="ts">
	import { goto } from '$app/navigation';
	import { createClient } from '$lib/supabase';
	import { calculateNextReview, mapPerformanceToQuality } from '$lib/srs';
	import { updateStreak } from '$lib/utils/updateStreak';
	import WriteKanji from '$lib/components/study/WriteKanji.svelte';
	import StudySessionLayout from '$lib/components/study/StudySessionLayout.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const supabase = createClient();

	let currentIndex = $state(0);

	async function handleCardProgress(c: any, gotIt: boolean, hadDifficulty: boolean = false) {
		currentIndex++;
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

		await supabase.from('sessions').insert({
			user_id: user.id,
			deck_id: data.deck.id,
			mode: 'write',
			correct: results.correct,
			total: results.total
		});

		await updateStreak(supabase, user.id);

		const params = new URLSearchParams({
			correct: String(results.correct),
			total: String(results.total),
			mode: 'write'
		});
		
		setTimeout(() => {
			goto(`/deck/${data.deck.id}/summary?${params}`);
		}, 1800);
	}
</script>

<StudySessionLayout
	onExit={() => goto(`/deck/${data.deck.id}`)}
	totalCount={data.cards.length}
	currentIndex={currentIndex}
>
	<WriteKanji 
		cards={data.cards} 
		deck={data.deck}
		totalCards={data.totalCards}
		learnedCount={data.learnedCount}
		onCardProgress={handleCardProgress}
		onComplete={handleComplete}
		onExit={() => goto(`/deck/${data.deck.id}`)}
	/>
</StudySessionLayout>
