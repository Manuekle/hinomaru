<script lang="ts">
	import Onboarding from '$lib/components/onboarding/Onboarding.svelte';
	import { goto } from '$app/navigation';
	import { createClient } from '$lib/supabase';
	const supabase = createClient();

	async function handleFinish() {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await supabase.from('profiles').upsert({
					id: user.id,
					onboarding_completed: true,
					updated_at: new Date().toISOString()
				});
			}
			localStorage.setItem('hinomaru_onboarding_completed', 'true');
		} catch (e) {
			console.error('Failed to save onboarding profile:', e);
		} finally {
			goto('/', { replaceState: true });
		}
	}
</script>

<svelte:head>
	<title>Hinomaru - Get Started</title>
</svelte:head>

<Onboarding onFinish={handleFinish} />
