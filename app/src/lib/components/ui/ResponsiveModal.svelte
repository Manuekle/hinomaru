<script lang="ts">
	import { 
		Drawer, 
		DrawerContent, 
		DrawerFooter, 
		DrawerHeader, 
		DrawerTitle, 
		DrawerDescription 
	} from "$lib/components/ui/drawer";
	import { fade } from "svelte/transition";
	import { onMount, type Snippet } from "svelte";
	import { cn } from "$lib/utils";
	import { fadeUp } from "$lib/motion";

	interface Props {
		open: boolean;
		title: string;
		description?: string;
		icon?: Snippet;
		children?: Snippet;
		actions?: Snippet;
		contentClass?: string;
	}

	let { 
		open = $bindable(false), 
		title, 
		description, 
		icon,
		children, 
		actions, 
		contentClass = ""
	}: Props = $props();

	let isMobile = $state(false);

	onMount(() => {
		const mql = window.matchMedia("(max-width: 640px)");
		isMobile = mql.matches;
		const handler = (e: MediaQueryListEvent) => (isMobile = e.matches);
		mql.addEventListener("change", handler);
		return () => mql.removeEventListener("change", handler);
	});

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			open = false;
		}
	}
</script>

{#if isMobile}
	<Drawer bind:open>
		<DrawerContent class={cn("px-6 pb-10", contentClass)}>
			<DrawerHeader class="px-0 pt-4 text-left">
				{#if icon}
					<div class="drawer-icon-wrapper">
						{@render icon()}
					</div>
				{/if}
				<DrawerTitle class="text-2xl font-extrabold text-[var(--sumi)]">
					{title}
				</DrawerTitle>
				{#if description}
					<DrawerDescription class="text-[var(--fg-secondary)] text-[16px] leading-relaxed mt-2">
						{description}
					</DrawerDescription>
				{/if}
			</DrawerHeader>
			
			<div class="py-4">
				{@render children?.()}
			</div>

			<DrawerFooter class="px-0 pt-2">
				<div class="flex flex-col gap-3 w-full">
					{@render actions?.()}
				</div>
			</DrawerFooter>
		</DrawerContent>
	</Drawer>
{:else if open}
	<div 
		class="modal-overlay" 
		transition:fade={{ duration: 200 }} 
		onclick={handleOverlayClick}
		role="presentation"
	>
		<div 
			class={cn("modal-content", contentClass)} 
			use:fadeUp={{ delay: 0.05, y: 20 }}
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			{#if icon}
				<div class="modal-icon-box">
					{@render icon()}
				</div>
			{/if}
			<h3 class="modal-title">{title}</h3>
			{#if description}
				<p class="modal-text">{description}</p>
			{/if}
			
			<div class="modal-body">
				{@render children?.()}
			</div>

			<div class="modal-actions-box">
				{@render actions?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.drawer-icon-wrapper {
		width: 56px;
		height: 56px;
		background: var(--hinomaru-red-wash);
		border-radius: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16px;
		color: var(--hinomaru-red);
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.modal-content {
		background: var(--paper);
		border-radius: 32px;
		padding: 36px;
		width: 100%;
		max-width: 420px;
		text-align: center;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		border: 1px solid var(--ink-100);
	}

	:global([data-theme='dark']) .modal-content {
		background: var(--ink-100);
		border-color: var(--ink-200);
	}

	.modal-icon-box {
		width: 64px;
		height: 64px;
		background: var(--hinomaru-red-wash);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 20px;
		color: var(--hinomaru-red);
	}

	.modal-title {
		font-size: 22px;
		font-weight: 800;
		color: var(--sumi);
		margin-bottom: 12px;
		letter-spacing: -0.01em;
	}

	.modal-text {
		font-size: 16px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin-bottom: 32px;
	}

	.modal-body {
		margin-bottom: 24px;
	}

	.modal-actions-box {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
</style>
