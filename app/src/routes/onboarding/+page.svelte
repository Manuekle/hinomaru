<script lang="ts">
	import Onboarding from '$lib/components/onboarding/Onboarding.svelte';
	import { goto } from '$app/navigation';
	import { createClient } from '$lib/supabase';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const supabase = createClient();

	async function handleFinish() {
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			try {
				// Save onboarding completion and preferences
				await supabase.from('profiles').upsert({
					id: user.id,
					onboarding_completed: true,
					updated_at: new Date().toISOString()
				});
			} catch (e) {
				console.error('Failed to save profile to database, using fallback:', e);
			}
		}
		
		// Fallback for local persistence
		localStorage.setItem('hinomaru_onboarding_completed', 'true');
		
		// Navigate to home
		goto('/', { replaceState: true });
	}
</script>

<svelte:head>
	<title>Hinomaru - Get Started</title>
</svelte:head>

<Onboarding onFinish={handleFinish} />
