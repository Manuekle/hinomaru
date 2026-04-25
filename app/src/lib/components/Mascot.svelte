<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';

	let { 
		mood = 'happy', 
		message = '', 
		size = 120,
		position = 'bottom-right' 
	} = $props<{
		mood?: 'happy' | 'thinking' | 'encouraging' | 'wave';
		message?: string;
		size?: number;
		position?: 'bottom-right' | 'bottom-left' | 'center' | 'inline';
	}>();

	// Map moods to images
	const images = {
		happy: '/images/mascot/happy.png',
		thinking: '/images/mascot/thinking.png',
		encouraging: '/images/mascot/encouraging.png',
		wave: '/images/mascot/wave.png'
	};
</script>

<div 
	class="mascot-container {position}"
	style="--size: {size}px"
>
	{#if message}
		<div 
			class="speech-bubble"
			in:scale={{ duration: 400, delay: 200, easing: elasticOut, start: 0.5 }}
			out:fade={{ duration: 200 }}
		>
			{message}
			<div class="bubble-arrow"></div>
		</div>
	{/if}

	<div 
		class="panda-wrapper" 
		class:pulse={mood === 'happy'} 
		class:float={mood === 'thinking'}
		class:shake={mood === 'encouraging'}
		class:sway={mood === 'wave'}
	>
		<img 
			src={images[mood]} 
			alt="Hino the Red Panda"
			style="width: var(--size); height: auto;"
		/>
	</div>
</div>

<style>
	.mascot-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: none;
		z-index: 100;
	}

	.mascot-container.bottom-right {
		position: fixed;
		bottom: calc(24px + env(safe-area-inset-bottom));
		right: 24px;
	}

	.mascot-container.bottom-left {
		position: fixed;
		bottom: calc(24px + env(safe-area-inset-bottom));
		left: 24px;
	}

	.mascot-container.center {
		margin: 20px auto;
	}

	.panda-wrapper {
		position: relative;
		transition: transform 0.3s ease;
	}

	.panda-wrapper img {
		display: block;
		position: relative;
		z-index: 2;
	}

	.panda-wrapper::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 80%;
		height: 10px;
		background: rgba(0,0,0,0.06);
		border-radius: 50%;
		z-index: 1;
		filter: blur(2px);
	}

	:global(.dark) .panda-wrapper::after {
		background: rgba(0,0,0,0.2);
	}

	/* Animations */
	.pulse {
		animation: panda-bounce 0.6s ease-out infinite alternate;
	}

	.float {
		animation: panda-float 3s ease-in-out infinite;
	}

	.shake {
		animation: panda-shake 0.5s ease-in-out infinite;
	}

	.sway {
		animation: panda-sway 2s ease-in-out infinite;
	}

	@keyframes panda-bounce {
		from { transform: translateY(0); }
		to { transform: translateY(-8px); }
	}

	@keyframes panda-float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-6px); }
	}

	@keyframes panda-shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-2px) rotate(-1deg); }
		75% { transform: translateX(2px) rotate(1deg); }
	}

	@keyframes panda-sway {
		0%, 100% { transform: rotate(-2deg); }
		50% { transform: rotate(2deg); }
	}

	/* Speech Bubble */
	.speech-bubble {
		background: white;
		border: 2px solid var(--ink-200);
		border-radius: 18px;
		padding: 12px 16px;
		font-size: 14px;
		font-weight: 600;
		color: var(--sumi);
		margin-bottom: 12px;
		max-width: 180px;
		text-align: center;
		position: relative;
		box-shadow: var(--shadow-md);
		pointer-events: auto;
	}

	.bubble-arrow {
		position: absolute;
		bottom: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		border-top: 8px solid white;
	}

	:global(.dark) .speech-bubble {
		background: var(--bg-surface);
		border-color: var(--ink-300);
		color: white;
	}

	:global(.dark) .bubble-arrow {
		border-top-color: var(--bg-surface);
	}
</style>
