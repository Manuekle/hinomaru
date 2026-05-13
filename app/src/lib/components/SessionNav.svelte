<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { TranslateIcon } from '@hugeicons/core-free-icons';
	import { showRomaji } from '$lib/stores/settings';

	let {
		progress = 0,
		current = 0,
		total = 0,
		title = '',
		onClose,
		showTimer = false,
		elapsed = 0,
		showRomajiToggle = false,
		showProgressBar = true
	} = $props<{
		progress: number;
		current: number;
		total: number;
		title?: string;
		onClose: () => void;
		showTimer?: boolean;
		elapsed?: number;
		showRomajiToggle?: boolean;
		showProgressBar?: boolean;
	}>();

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
	};
</script>

<div class="session-nav-container">
	{#if showProgressBar}
		<div class="progress-wrapper">
			<div class="progress-fill" style="width: {progress}%"></div>
		</div>
	{/if}

	<div class="nav-content">
		<!-- Left: Close button -->
		<div class="nav-slot left">
			<button class="close-btn touch-action-manip" onclick={onClose} aria-label="Close session">
				✕
			</button>
		</div>

		<!-- Center: Mode title & Progress -->
		<div class="nav-slot center">
			<div class="progress-info">
				{#if title}
					<span class="mode-title">{title}</span>
				{/if}
				{#if total > 0}
					<span class="progress-text">
						{current} / {total}
					</span>
				{/if}
			</div>
		</div>

		<!-- Right: Timer or empty -->
		<div class="nav-slot right" style="gap: 8px;">
			{#if showTimer}
				<div class="timer">{formatTime(elapsed)}</div>
			{/if}
			{#if showRomajiToggle}
				<button
					class="romaji-nav-btn"
					class:active={$showRomaji}
					onclick={() => showRomaji.toggle()}
					title="Romaji"
				>
					<Icon icon={TranslateIcon} size={20} strokeWidth={2} />
				</button>
			{/if}
			{#if !showTimer && !showRomajiToggle}
				<div class="empty-slot"></div>
			{/if}
		</div>
	</div>
</div>

<style>
	.session-nav-container {
		background: var(--bg-surface);
		padding-top: env(safe-area-inset-top);
		border-bottom: 1px solid var(--ink-100);
	}

	.progress-wrapper {
		height: 3px;
		background: var(--ink-100);
		width: 100%;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--hinomaru-red);
		transition: width 400ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.nav-content {
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
	}

	.nav-slot {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.nav-slot.center {
		justify-content: center;
	}

	.nav-slot.right {
		justify-content: flex-end;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--fg-secondary);
		font-size: 20px;
		cursor: pointer;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 150ms ease;
		padding: 0;
	}

	@media (hover: hover) {
		.close-btn:hover {
			background: var(--ink-100);
			color: var(--sumi);
		}
	}

	.progress-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}

	.mode-title {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: -0.04em;
		color: var(--fg-tertiary);
		line-height: 1;
		margin-bottom: 2px;
	}

	.progress-text {
		font-size: 14px;
		font-weight: 700;
		color: var(--sumi);
		font-family: var(--font-ui);
		letter-spacing: -0.04em;
		line-height: 1;
	}

	.timer {
		font-variant-numeric: tabular-nums;
		color: var(--hinomaru-red);
		font-weight: 700;
		font-size: 16px;
		font-family: var(--font-ui);
		padding-right: 8px;
	}

	.empty-slot {
		width: 44px;
	}

	.romaji-nav-btn {
		background: none;
		border: none;
		color: var(--fg-secondary);
		cursor: pointer;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 150ms ease;
		padding: 0;
	}

	@media (hover: hover) {
		.romaji-nav-btn:hover {
			background: var(--ink-100);
			color: var(--sumi);
		}
	}

	.romaji-nav-btn.active {
		color: var(--hinomaru-red);
	}
</style>
