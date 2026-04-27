<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '$lib/Icon.svelte';
	import {
		Home01Icon,
		LanguageCircleIcon,
		BookOpen01Icon,
		News01Icon,
		HeadphonesIcon,
		BubbleChatIcon
	} from '@hugeicons/core-free-icons';

	const items = [
		{ href: '/', label: 'Inicio', icon: Home01Icon, exact: true },
		{ href: '/alphabet', label: 'Alfabeto', icon: LanguageCircleIcon, exact: false },
		{ href: '/vocabulary', label: 'Vocab', icon: BookOpen01Icon, exact: false },
		{ href: '/deck/stories', label: 'Historias', icon: News01Icon, exact: false },
		{ href: '/deck/songs', label: 'Canciones', icon: HeadphonesIcon, exact: false },
		{ href: '/conversation', label: 'Hablar', icon: BubbleChatIcon, exact: false }
	];

	const pathname = $derived($page.url.pathname);

	function isActive(href: string, exact: boolean): boolean {
		if (exact) return pathname === href;
		return pathname.startsWith(href);
	}
</script>

<div class="dock-wrap">
	<nav class="dock-bar" aria-label="Navigation">
		{#each items as item (item.href)}
			{@const active = isActive(item.href, item.exact)}
			<a
				href={item.href}
				class="dock-item"
				class:active
				aria-label={item.label}
				aria-current={active ? 'page' : undefined}
				ontouchstart={() => {}}
			>
				<Icon icon={item.icon} size={24} strokeWidth={active ? 2 : 1.5} color="currentColor" />
				{#if active}
					<span class="dock-indicator" aria-hidden="true"></span>
				{/if}
			</a>
		{/each}
	</nav>
</div>

<style>
	.dock-wrap {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 50;
		display: flex;
		justify-content: center;
		/* env() for iOS home indicator; 8px gap for a more "docked" feel */
		padding: 0 16px calc(8px + env(safe-area-inset-bottom, 0px));
		pointer-events: none;
		/* GPU layer — prevents iOS scroll jitter on position:fixed */
		transform: translateZ(0);
		-webkit-transform: translateZ(0);
		will-change: transform;
	}

	.dock-bar {
		display: flex;
		align-items: center;
		gap: 2px;
		/* Frosted glass: more transparent and higher blur */
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(24px) saturate(190%);
		-webkit-backdrop-filter: blur(24px) saturate(190%);
		border-radius: 999px;
		padding: 4px 8px;
		/* Subtle border for glass effect */
		border: 0.5px solid rgba(0, 0, 0, 0.05);
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.08),
			0 1px 8px rgba(0, 0, 0, 0.04);
		pointer-events: auto;
		max-width: 420px;
		width: 100%;
		/* Prevent content repaints underneath */
		isolation: isolate;
	}

	:global([data-theme='dark']) .dock-bar {
		background: rgba(28, 28, 30, 0.75);
		border-color: rgba(255, 255, 255, 0.1);
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.4),
			0 1px 8px rgba(0, 0, 0, 0.2);
	}

	.dock-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		/* Standard tap target height */
		min-height: 48px;
		min-width: 44px;
		padding: 4px 2px;
		position: relative;
		text-decoration: none;
		color: var(--fg-tertiary);
		border-radius: 999px;
		/* iOS: disable 300ms delay + long-press context menu */
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		transition:
			color 150ms ease,
			background 150ms ease,
			transform 120ms ease;
	}

	/* :active fires on iOS only when ontouchstart is present on the element */
	.dock-item:active {
		transform: scale(0.92);
		background: rgba(0, 0, 0, 0.04);
	}

	:global([data-theme='dark']) .dock-item:active {
		background: rgba(255, 255, 255, 0.06);
	}

	.dock-item.active {
		color: var(--sumi);
	}

	:global([data-theme='dark']) .dock-item.active {
		color: var(--fg-primary);
	}

	.dock-indicator {
		position: absolute;
		bottom: 6px;
		left: 50%;
		transform: translateX(-50%);
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--sumi);
		opacity: 0.8;
	}

	:global([data-theme='dark']) .dock-indicator {
		background: var(--fg-primary);
	}
</style>
