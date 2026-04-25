<script lang="ts">
	import Onboarding from '$lib/components/onboarding/Onboarding.svelte';
	import { goto } from '$app/navigation';
	import { createClient } from '$lib/supabase';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const supabase = createClient();

	async function handleFinish() {
		console.log('ONBOARDING: Finalizing...');
		
		// 1. Mark as completed in localStorage immediately (optimistic)
		localStorage.setItem('hinomaru_onboarding_completed', 'true');

		try {
			// 2. Perform database updates in the background or parallel
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await supabase.from('profiles').upsert({
					id: user.id,
					onboarding_completed: true,
					updated_at: new Date().toISOString()
				});
			}
		} catch (e) {
			console.error('Failed to save profile to database:', e);
		} finally {
			// 3. Always navigate, even if DB fails
			console.log('ONBOARDING: Navigating to home');
			goto('/', { replaceState: true });
		}
	}
</script>

<svelte:head>
	<title>Hinomaru - Get Started</title>
</svelte:head>

<Onboarding onFinish={handleFinish} />
