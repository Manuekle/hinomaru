<script lang="ts">
	import Onboarding from '$lib/components/onboarding/Onboarding.svelte';
	import { goto } from '$app/navigation';
	import { createClient } from '$lib/supabase';
	import { toast } from '$lib/stores/toast';
	const supabase = createClient();

	async function handleFinish(selections: any) {
		try {
			const {
				data: { user }
			} = await supabase.auth.getUser();
			if (user) {
				await supabase.from('profiles').upsert({
					id: user.id,
					onboarding_completed: true,
					motivation: selections.motivation,
					experience: selections.experience,
					srs_enabled: selections.srsEnabled,
					voice: selections.voice,
					daily_goal: selections.goal,
					updated_at: new Date().toISOString()
				});
			}
			localStorage.setItem('hinomaru_onboarding_completed', 'true');
			
			toast.success({
				title: '¡Bienvenido a Hinomaru! 🇯🇵',
				description: 'Todo listo. Tu viaje para dominar el japonés comienza hoy.'
			});
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
