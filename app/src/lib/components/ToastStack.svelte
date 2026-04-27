<script lang="ts">
	import { toast, type ToastItem } from '$lib/stores/toast';
	import { fly } from 'svelte/transition';
	import { cubicOut, cubicIn } from 'svelte/easing';

	const icons: Record<string, string> = {
		success: '✓',
		error: '✕',
		warning: '⚠',
		info: 'ℹ'
	};
</script>

<div class="toast-viewport" aria-live="polite" aria-atomic="false">
	{#each $toast as item (item.id)}
		<div
			class="toast-item toast-{item.type}"
			role="alert"
			in:fly={{ y: -64, duration: 320, easing: cubicOut }}
			out:fly={{ y: -64, duration: 220, easing: cubicIn }}
		>
			<span class="toast-badge">{icons[item.type]}</span>
			<div class="toast-body">
				<span class="toast-title">{item.title}</span>
				{#if item.description}
					<span class="toast-desc">{item.description}</span>
				{/if}
			</div>
			<button
				class="toast-close"
				onclick={() => toast.dismiss(item.id)}
				aria-label="Cerrar"
			>✕</button>
		</div>
	{/each}
</div>

<style>
	.toast-viewport {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px 0;
		pointer-events: none;
	}

	.toast-item {
		width: 100%;
		max-width: 400px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 16px;
		background: var(--bg-surface);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.14),
			0 2px 8px rgba(0, 0, 0, 0.08),
			inset 0 0 0 1px var(--ink-100);
		pointer-events: auto;
		cursor: default;
	}

	.toast-badge {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		font-weight: 700;
		flex-shrink: 0;
		color: white;
	}

	.toast-success .toast-badge { background: var(--success); }
	.toast-error   .toast-badge { background: var(--hinomaru-red); }
	.toast-warning .toast-badge { background: #f59e0b; }
	.toast-info    .toast-badge { background: var(--sumi); }

	.toast-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.toast-title {
		font-size: 14px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.3;
	}

	.toast-desc {
		font-size: 12px;
		color: var(--fg-secondary);
		line-height: 1.4;
	}

	.toast-close {
		background: none;
		border: none;
		color: var(--fg-tertiary);
		font-size: 13px;
		cursor: pointer;
		padding: 4px;
		line-height: 1;
		flex-shrink: 0;
		transition: color 150ms;
	}
	.toast-close:hover { color: var(--fg-primary); }

	/* colored left accent strip */
	.toast-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		border-radius: 16px 0 0 16px;
	}
	.toast-item { position: relative; overflow: hidden; }
	.toast-success::before { background: var(--success); }
	.toast-error::before   { background: var(--hinomaru-red); }
	.toast-warning::before { background: #f59e0b; }
	.toast-info::before    { background: var(--sumi); }
</style>
