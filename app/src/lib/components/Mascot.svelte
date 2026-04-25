<script lang="ts">
	import { fade, scale, fly } from 'svelte/transition';
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
		position?: 'bottom-right' | 'bottom-left' | 'center' | 'inline' | 'inline-row';
	}>();

	const images = {
		happy: '/images/mascot/happy.png',
		thinking: '/images/mascot/thinking.png',
		encouraging: '/images/mascot/encouraging.png',
		wave: '/images/mascot/wave.png'
	};

	let visible = $state(true);
	let timer: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (message) {
			visible = true;
			clearTimeout(timer);
			timer = setTimeout(() => { visible = false; }, 5000);
		}
		return () => clearTimeout(timer);
	});
</script>

{#if position === 'inline-row'}
	<div
		class="mascot-row"
		in:fly={{ y: 8, duration: 350, delay: 300 }}
	>
		<button
			class="panda-wrapper"
			class:pulse={mood === 'happy'}
			class:float={mood === 'thinking'}
			class:shake={mood === 'encouraging'}
			class:sway={mood === 'wave'}
			onclick={() => { visible = !visible; }}
			aria-label="Hino"
			style="--size: {size}px"
		>
			<img
				src={images[mood]}
				alt="Hino the Red Panda"
				style="width: var(--size); height: auto;"
			/>
		</button>

		{#if message && visible}
			<div
				class="row-bubble"
				in:scale={{ duration: 350, delay: 100, easing: elasticOut, start: 0.7 }}
				out:fade={{ duration: 150 }}
			>
				{message}
			</div>
		{/if}
	</div>
{:else}
	<div
		class="mascot-container {position}"
		style="--size: {size}px"
	>
		{#if message && visible}
			<div
				class="speech-bubble"
				in:scale={{ duration: 400, delay: 200, easing: elasticOut, start: 0.5 }}
				out:fade={{ duration: 200 }}
			>
				{message}
				<div class="bubble-arrow" class:arrow-right={position === 'bottom-right'} class:arrow-left={position === 'bottom-left'}></div>
			</div>
		{/if}

		<button
			class="panda-wrapper"
			class:pulse={mood === 'happy'}
			class:float={mood === 'thinking'}
			class:shake={mood === 'encouraging'}
			class:sway={mood === 'wave'}
			onclick={() => { visible = !visible; }}
			aria-label="Hino"
		>
			<img
				src={images[mood]}
				alt="Hino the Red Panda"
				style="width: var(--size); height: auto;"
			/>
		</button>
	</div>
{/if}

<style>
	/* ── Inline row layout ── */
	.mascot-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 20px 0 4px;
	}

	.row-bubble {
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		padding: 10px 14px;
		font-size: 13px;
		font-weight: 600;
		color: var(--fg-primary);
		line-height: 1.4;
		box-shadow: var(--shadow-sm);
		flex: 1;
		position: relative;
	}

	.row-bubble::before {
		content: '';
		position: absolute;
		left: -7px;
		top: 50%;
		transform: translateY(-50%);
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 7px solid var(--ink-200);
	}

	.row-bubble::after {
		content: '';
		position: absolute;
		left: -5px;
		top: 50%;
		transform: translateY(-50%);
		width: 0;
		height: 0;
		border-top: 5px solid transparent;
		border-bottom: 5px solid transparent;
		border-right: 6px solid var(--bg-surface);
	}

	/* ── Fixed position layout ── */
	.mascot-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: none;
		z-index: 100;
	}

	.mascot-container.bottom-right {
		position: fixed;
		bottom: calc(80px + env(safe-area-inset-bottom));
		right: 24px;
	}

	.mascot-container.bottom-left {
		position: fixed;
		bottom: calc(80px + env(safe-area-inset-bottom));
		left: 24px;
	}

	.mascot-container.center {
		margin: 20px auto;
	}

	.panda-wrapper {
		position: relative;
		transition: transform 0.2s ease;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		pointer-events: auto;
		flex-shrink: 0;
	}

	.panda-wrapper:active {
		transform: scale(0.92);
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
		height: 8px;
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
		animation: panda-float 2s ease-in-out infinite;
	}

	.float {
		animation: panda-float 3s ease-in-out infinite;
	}

	.shake {
		animation: panda-shake 0.6s ease-in-out 3;
	}

	.sway {
		animation: panda-float 3s ease-in-out infinite;
	}

	@keyframes panda-float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-5px); }
	}

	@keyframes panda-shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-3px); }
		75% { transform: translateX(3px); }
	}

	/* Speech Bubble (fixed layout) */
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

	.bubble-arrow.arrow-right {
		left: auto;
		right: 16px;
		transform: none;
	}

	.bubble-arrow.arrow-left {
		left: 16px;
		right: auto;
		transform: none;
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
