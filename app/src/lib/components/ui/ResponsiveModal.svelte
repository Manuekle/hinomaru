<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import { fade, scale } from 'svelte/transition';
	import { onMount, type Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import { fadeUp } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';

	interface Props {
		open: boolean;
		title: string;
		description?: string;
		icon?: Snippet;
		children?: Snippet;
		actions?: Snippet;
		contentClass?: string;
		actionsClass?: string;
		dismissible?: boolean;
		hideTitle?: boolean;
	}

	let {
		open = $bindable(false),
		title,
		description,
		icon,
		children,
		actions,
		contentClass = '',
		actionsClass = '',
		dismissible = true,
		hideTitle = false
	}: Props = $props();

	let isMobile = $state(false);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		const mql = window.matchMedia('(max-width: 640px)');
		isMobile = mql.matches;
		const handler = (e: MediaQueryListEvent) => (isMobile = e.matches);
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});

	function handleOverlayClick(e: MouseEvent) {
		if (!dismissible) return;
		if (e.target === e.currentTarget) {
			open = false;
		}
	}
</script>

{#if !mounted}
	<!-- defer render until viewport class resolved to avoid modal→drawer flip -->
{:else if isMobile}
	<Drawer.Root bind:open {dismissible}>
		<Drawer.Content
			class={cn(
				'drawer-premium flex max-h-[90vh] flex-col rounded-t-[40px] border-t-[1.5px] border-[var(--ink-200)] px-6',
				contentClass
			)}
		>
			{#if hideTitle}
				<Drawer.Header class="sr-only">
					<Drawer.Title>{title}</Drawer.Title>
					{#if description}
						<Drawer.Description>{description}</Drawer.Description>
					{/if}
				</Drawer.Header>
			{:else}
				<Drawer.Header class="shrink-0 px-0 pt-8 text-left">
					<Drawer.Title class="drawer-title-premium">
						{title}
					</Drawer.Title>
					{#if description}
						<Drawer.Description class="drawer-desc-premium">
							{description}
						</Drawer.Description>
					{/if}
				</Drawer.Header>
			{/if}

			<div class="font-ui relative z-10 min-h-0 flex-1 overflow-y-auto py-6">
				{@render children?.()}
			</div>

			{#if actions}
				<Drawer.Footer class="relative z-10 shrink-0 px-0 pt-4">
					<div class={cn('font-ui flex w-full flex-row gap-4 [&>*]:flex-1', actionsClass)}>
						{@render actions?.()}
					</div>
				</Drawer.Footer>
			{/if}
		</Drawer.Content>
	</Drawer.Root>
{:else if open}
	<div
		class="modal-overlay"
		transition:fade={{ duration: 200 }}
		onclick={handleOverlayClick}
		role="presentation"
	>
		<div
			class={cn('modal-content', contentClass)}
			transition:scale={{ duration: 300, start: 0.95, opacity: 0 }}
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<button class="modal-close-btn" onclick={() => (open = false)} aria-label="Cerrar">
				<Icon icon={Cancel01Icon} size={20} color="currentColor" />
			</button>

			{#if hideTitle}
				<h3 class="sr-only">{title}</h3>
				{#if description}<p class="sr-only">{description}</p>{/if}
			{:else}
				<div class="modal-head">
					{#if icon}
						<div class="modal-icon-box">
							{@render icon()}
						</div>
					{/if}
					<h3 class="modal-title">{title}</h3>
					{#if description}
						<p class="modal-text">{description}</p>
					{/if}
				</div>
			{/if}

			<div class="modal-body">
				{@render children?.()}
			</div>

			{#if actions}
				<div
					class={cn(
						'modal-foot font-ui mt-8 flex w-full flex-row gap-3 [&>*]:flex-1',
						actionsClass
					)}
				>
					{@render actions?.()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(.font-ui) {
		font-family: var(--font-ui) !important;
	}

	/* ── PREMIUM DRAWER STYLES ── */
	:global(.drawer-premium) {
		background: linear-gradient(to bottom, var(--bg-surface), var(--paper)) !important;
		box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1) !important;
	}

	:global(.drawer-premium)::before {
		content: '';
		position: absolute;
		top: -40px;
		right: -40px;
		width: 180px;
		height: 180px;
		background: radial-gradient(circle, rgba(188, 0, 45, 0.06) 0%, transparent 70%);
		pointer-events: none;
		z-index: 0;
	}

	:global(.drawer-title-premium) {
		font-family: var(--font-ui) !important;
		font-size: 28px !important;
		font-weight: 900 !important;
		color: var(--sumi) !important;
		line-height: 1.1 !important;
		letter-spacing: -0.03em !important;
		margin-bottom: 4px;
	}

	:global(.drawer-desc-premium) {
		font-family: var(--font-ui) !important;
		font-size: 17px !important;
		color: var(--fg-secondary) !important;
		line-height: 1.5 !important;
		margin-top: 10px !important;
		font-weight: 500 !important;
	}

	/* ── MODAL STYLES ── */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		z-index: 20000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.modal-content {
		background: linear-gradient(to bottom, var(--bg-surface), var(--paper));
		border-radius: 40px;
		padding: 40px 40px 32px;
		width: 100%;
		max-width: 560px;
		max-height: 90vh;
		text-align: center;
		box-shadow: 0 40px 100px rgba(0, 0, 0, 0.25);
		border: 1.5px solid var(--ink-100);
		font-family: var(--font-ui);
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.modal-head {
		flex-shrink: 0;
	}

	.modal-body {
		flex: 1 1 auto;
		min-height: 0;
		text-align: left;
	}

	.modal-foot {
		flex-shrink: 0;
	}

	.modal-content::before {
		content: '';
		position: absolute;
		top: -60px;
		right: -60px;
		width: 220px;
		height: 220px;
		background: radial-gradient(circle, rgba(188, 0, 45, 0.05) 0%, transparent 70%);
		pointer-events: none;
		z-index: 0;
	}

	.modal-head,
	.modal-body,
	.modal-foot,
	.modal-title,
	.modal-text,
	.modal-icon-box {
		position: relative;
		z-index: 10;
	}

	:global([data-theme='dark']) .modal-content {
		background: var(--ink-100);
		border-color: var(--ink-200);
	}

	.modal-close-btn {
		position: absolute;
		top: 24px;
		right: 24px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		cursor: pointer;
		transition: all 0.2s;
		z-index: 50;
	}

	.modal-close-btn:hover {
		background: var(--bg-muted);
		color: var(--hinomaru-red);
		border-color: var(--hinomaru-red);
	}

	.modal-icon-box {
		width: 64px;
		height: 64px;
		background: var(--hinomaru-red-wash);
		border-radius: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 28px;
		color: var(--hinomaru-red);
	}

	.modal-title {
		font-family: var(--font-ui);
		font-size: 32px;
		font-weight: 900;
		color: var(--sumi);
		margin-bottom: 16px;
		letter-spacing: -0.04em;
		line-height: 1;
	}

	.modal-text {
		font-family: var(--font-ui);
		font-size: 17px;
		color: var(--fg-secondary);
		line-height: 1.6;
		margin-bottom: 36px;
		font-weight: 500;
	}

	/* ── PREMIUM BUTTON STYLES ── */
	:global(.modal-btn-confirm),
	:global(.modal-btn-cancel) {
		padding: 18px !important;
		border-radius: 22px !important;
		font-size: 16px !important;
		font-weight: 800 !important;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none !important;
		font-family: var(--font-ui) !important;
		letter-spacing: -0.04em;
	}

	:global(.modal-btn-confirm) {
		background: var(--hinomaru-red) !important;
		color: white !important;
		box-shadow: 0 10px 25px rgba(188, 0, 45, 0.2) !important;
	}

	:global(.modal-btn-confirm:hover) {
		transform: translateY(-2px);
		box-shadow: 0 15px 30px rgba(188, 0, 45, 0.3) !important;
		background: #a30027 !important;
	}

	:global(.modal-btn-confirm:active) {
		transform: translateY(0);
	}

	:global(.modal-btn-cancel) {
		background: var(--ink-100) !important;
		color: var(--sumi) !important;
	}

	:global(.modal-btn-cancel:hover) {
		background: var(--ink-200) !important;
		transform: translateY(-2px);
	}

	:global(.modal-btn-cancel:active) {
		transform: translateY(0);
	}
</style>
