<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';
	import { fadeIn } from '$lib/motion';

	interface Props {
		isLesson?: boolean;
		onExit?: () => void;
		currentIndex: number;
		totalCount: number;
		modeBadge?: string;
		children: import('svelte').Snippet;
	}

	let { isLesson = false, onExit, currentIndex, totalCount, modeBadge, children }: Props = $props();
</script>

{#if isLesson}
	{@render children()}
{:else}
	<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={onExit} aria-label="Exit">
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>
		
		<div class="header-center">
			<div class="header-progress">
				<span class="session-index">{Math.min(currentIndex + 1, Math.max(1, totalCount))}/{Math.max(1, totalCount)}</span>
			</div>
			{#if modeBadge}
				<div class="mode-badge">{modeBadge}</div>
			{/if}
		</div>

		<div style="width: 44px;"></div> <!-- Spacer -->
	</div>

	<!-- Progress bar -->
	<div class="prog-bar-track">
		<div class="prog-bar-fill" style="width: {Math.round((currentIndex / Math.max(1, totalCount)) * 100)}%"></div>
	</div>

	<div class="session-container">
		{@render children()}
	</div>
	</div>
{/if}

<style>
	.premium-bg { background-color: var(--bg-page); min-height: 100dvh; display: flex; flex-direction: column; }
	.premium-header-minimal { display: flex; align-items: center; justify-content: space-between; padding: calc(14px + env(safe-area-inset-top)) 20px 10px; background: var(--bg-surface); border-bottom: 1px solid var(--ink-200); flex-shrink: 0; }
	.header-center { display: flex; flex-direction: column; align-items: center; gap: 2px; }
	.header-progress { display: flex; flex-direction: column; align-items: center; line-height: 1.1; }
	.session-index { font-size: 17px; font-weight: 800; color: var(--fg-primary); letter-spacing: -0.02em; }
	.total-label { font-size: 10px; font-weight: 700; color: var(--fg-tertiary); text-transform: uppercase; letter-spacing: -0.04em; }
	.mode-badge { font-size: 11px; font-weight: 700; color: var(--fg-tertiary); text-transform: uppercase; letter-spacing: -0.02em; }
	.close-btn { color: var(--fg-secondary); background: none; border: none; padding: 8px; cursor: pointer; transition: all 0.2s; }
	
	.prog-bar-track { height: 3px; background: var(--ink-100); width: 100%; flex-shrink: 0; }
	.prog-bar-fill { height: 100%; background: var(--hinomaru-red); border-radius: 0 3px 3px 0; transition: width 0.4s ease; }
</style>
