<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { fade } from 'svelte/transition';

	let { visible = true } = $props<{ visible: boolean }>();

	let logoEl = $state<HTMLElement | null>(null);
	let textEl = $state<HTMLElement | null>(null);
	let containerEl = $state<HTMLElement | null>(null);

	onMount(() => {
		try {
			if (logoEl) {
				animate(
					logoEl,
					{
						scale: [0.9, 1.05, 1],
						opacity: [0, 1]
					},
					{
						duration: 0.5,
						ease: [0.22, 1, 0.36, 1]
					}
				);
			}

			if (textEl) {
				animate(
					textEl,
					{
						opacity: [0, 1],
						y: [8, 0]
					},
					{
						duration: 0.4,
						delay: 0.15,
						ease: [0.22, 1, 0.36, 1]
					}
				);
			}
		} catch (e) {
			console.error('Splash animation error:', e);
		}
	});

	$effect(() => {
		document.body.style.overflow = visible ? 'hidden' : '';
	});
</script>

{#if visible}
	<div
		bind:this={containerEl}
		out:fade={{ duration: 300 }}
		style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;
           background:var(--paper);display:flex;flex-direction:column;
           align-items:center;justify-content:center;gap:24px;"
	>
		<div
			bind:this={logoEl}
			style="width:80px;height:80px;background:var(--hinomaru-red);border-radius:50%;
               box-shadow:0 8px 32px rgba(188,0,45,0.2);
               display:flex;align-items:center;justify-content:center;"
		>
			<!-- Subtle inner glow -->
			<div
				style="width:100%;height:100%;border-radius:50%;
                   background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent);"
			></div>
		</div>

		<div bind:this={textEl} style="display:flex;flex-direction:column;align-items:center;gap:20px;">
			<div style="font-size:24px;font-weight:700;letter-spacing:-0.03em;color:var(--sumi);">
				Hinomaru
			</div>
			<div class="splash-dots">
				<span class="splash-dot"></span>
				<span class="splash-dot" style="animation-delay:0.18s"></span>
				<span class="splash-dot" style="animation-delay:0.36s"></span>
			</div>
		</div>

		<!-- Bottom footer -->
		<div
			style="position:absolute;bottom:calc(48px + env(safe-area-inset-bottom));left:0;right:0;text-align:center;
               font-size:12px;font-weight:600;letter-spacing:0.1em;
               color:var(--fg-tertiary);text-transform:uppercase;opacity:0.5;"
		>
			Japanese Mastery
		</div>
	</div>
{/if}

<style>
	.splash-dots {
		display: flex;
		gap: 7px;
		align-items: center;
	}
	.splash-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--hinomaru-red);
		animation: sd 1.2s infinite ease-in-out;
		opacity: 0.5;
	}
	@keyframes sd {
		0%,
		80%,
		100% {
			transform: scale(0.5);
			opacity: 0.25;
		}
		40% {
			transform: scale(1);
			opacity: 0.75;
		}
	}
</style>
