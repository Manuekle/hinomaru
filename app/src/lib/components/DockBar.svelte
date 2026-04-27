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
		padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
		pointer-events: none;
	}

	.dock-bar {
		display: flex;
		align-items: center;
		gap: 4px;
		background: var(--bg-surface);
		border-radius: 999px;
		padding: 8px 12px;
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.10),
			0 1px 4px rgba(0, 0, 0, 0.06),
			inset 0 0 0 1px var(--ink-100);
		pointer-events: auto;
		max-width: 380px;
		width: 100%;
	}

	:global([data-theme='dark']) .dock-bar {
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.35),
			0 1px 4px rgba(0, 0, 0, 0.2),
			inset 0 0 0 1px rgba(255, 255, 255, 0.06);
	}

	.dock-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0;
		padding: 8px 4px;
		min-height: 44px;
		position: relative;
		text-decoration: none;
		color: var(--fg-tertiary);
		border-radius: 999px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		transition: color 150ms ease, background 150ms ease, transform 150ms ease;
	}

	.dock-item:active {
		transform: scale(0.88);
		background: var(--ink-100);
	}

	.dock-item.active {
		color: var(--sumi);
	}

	.dock-indicator {
		position: absolute;
		bottom: 2px;
		left: 50%;
		transform: translateX(-50%);
		width: 18px;
		height: 2.5px;
		border-radius: 999px;
		background: var(--sumi);
	}
</style>
