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
		<header class="premium-header-modern" use:fadeIn={{ delay: 0 }}>
			<div class="header-left">
				<button class="close-btn" onclick={onExit} aria-label="Exit">
					<Icon icon={Cancel01Icon} size={24} color="currentColor" />
				</button>
			</div>

			<div class="header-center">
				{#if modeBadge}
					<div class="mode-capsule">
						<span class="mode-text">{modeBadge}</span>
					</div>
				{/if}
			</div>

			<div class="header-right">
				<div class="progress-pill">
					<span class="current">{Math.min(currentIndex + 1, Math.max(1, totalCount))}</span>
					<span class="divider">/</span>
					<span class="total">{Math.max(1, totalCount)}</span>
				</div>
			</div>
		</header>

		<div class="prog-bar-track">
			<div
				class="prog-bar-fill"
				style="width: {Math.round((currentIndex / Math.max(1, totalCount)) * 100)}%"
			></div>
		</div>

		<div class="session-container">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.premium-bg {
		background-color: var(--bg-page);
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.premium-header-modern {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(12px + env(safe-area-inset-top)) 16px 12px;
		background: var(--bg-surface);
		flex-shrink: 0;
		height: calc(64px + env(safe-area-inset-top));
	}

	.header-left,
	.header-right {
		width: 80px;
		display: flex;
	}

	.header-right {
		justify-content: flex-end;
	}

	.header-center {
		flex: 1;
		display: flex;
		justify-content: center;
		min-width: 0;
	}

	.close-btn {
		color: var(--fg-secondary);
		background: var(--ink-100);
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-btn:active {
		transform: scale(0.92);
		background: var(--ink-200);
	}

	.mode-capsule {
		background: var(--bg-muted);
		padding: 6px 14px;
		border-radius: 100px;
		max-width: 100%;
		display: flex;
	}

	.mode-text {
		font-size: 12px;
		font-weight: 700;
		color: var(--fg-secondary);
		text-transform: uppercase;
		letter-spacing: 0.02em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.progress-pill {
		display: flex;
		align-items: center;
		gap: 3px;
		background: var(--ink-100);
		padding: 6px 12px;
		border-radius: 100px;
		font-family: var(--font-ui);
	}

	.progress-pill .current {
		font-size: 15px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}

	.progress-pill .divider {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-weight: 700;
	}

	.progress-pill .total {
		font-size: 13px;
		font-weight: 700;
		color: var(--fg-secondary);
	}

	.prog-bar-track {
		height: 4px;
		background: var(--ink-100);
		width: 100%;
		flex-shrink: 0;
		position: relative;
	}

	.prog-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--hinomaru-red), #ff4d6d);
		border-radius: 0 4px 4px 0;
		transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
		box-shadow: 0 0 10px rgba(188, 0, 45, 0.3);
	}

	.session-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow-x: hidden;
	}
</style>
