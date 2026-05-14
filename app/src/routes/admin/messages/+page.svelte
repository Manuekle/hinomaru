<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { fly, fade } from 'svelte/transition';
	import type { PageData } from './$types';
	import Icon from '$lib/Icon.svelte';
	import {
		Mail01Icon,
		Copy01Icon,
		ArrowRight01Icon,
		CheckmarkCircle02Icon,
		SentIcon
	} from '@hugeicons/core-free-icons';

	let { data } = $props<{ data: PageData }>();
	let { messages } = $derived(data);

	let expanded = $state<string | null>(null);
	let copiedId = $state<string | null>(null);

	function toggle(id: string) {
		expanded = expanded === id ? null : id;
	}

	async function copyEmail(email: string, id: string) {
		try {
			await navigator.clipboard.writeText(email);
			copiedId = id;
			setTimeout(() => (copiedId = null), 2000);
		} catch (err) {}
	}

	function formatDate(iso: string) {
		const d = new Date(iso);
		return d.toLocaleDateString('es-ES', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function initials(name: string) {
		return name
			.split(' ')
			.slice(0, 2)
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}
</script>

<svelte:head>
	<title>Mensajes · Administración</title>
</svelte:head>

<div class="settings-page">
	<div use:fadeUp={{ delay: 0, y: 10 }}>
		<a href="/settings" class="back-link">← Ajustes</a>
	</div>

	<h1 use:fadeUp={{ delay: 0.05, y: 14 }} class="page-title">
		Mensajes
	</h1>

	<div use:fadeUp={{ delay: 0.1, y: 16 }} class="sections">
		{#if messages.length === 0}
			<div class="empty-state" in:fade>
				<div class="empty-icon">
					<Icon icon={Mail01Icon} size={32} color="var(--fg-tertiary)" />
				</div>
				<p>No hay mensajes recibidos</p>
			</div>
		{:else}
			{#each messages as msg, i (msg.id)}
				<div class="card" use:fadeUp={{ delay: 0.1 + i * 0.05, y: 12 }}>
					<button class="pref-row" onclick={() => toggle(msg.id)}>
						<div class="avatar-circle" style="background: var(--hinomaru-red-wash); color: var(--hinomaru-red);">
							{initials(msg.name)}
						</div>
						<div class="pref-text">
							<span class="pref-title">{msg.name}</span>
							<span class="pref-sub">{formatDate(msg.created_at)} · {msg.email}</span>
						</div>
						<div class="arrow-right" class:open={expanded === msg.id}>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
							>
						</div>
					</button>

					{#if expanded === msg.id}
						<div class="message-detail" transition:fly={{ y: -10, duration: 200 }}>
							<div class="message-body">
								{msg.message}
							</div>
							<div class="message-actions">
								<button class="hm-btn hm-btn-sm hm-btn-secondary" onclick={() => copyEmail(msg.email, msg.id)}>
									<Icon icon={copiedId === msg.id ? CheckmarkCircle02Icon : Copy01Icon} size={16} color="currentColor" />
									{copiedId === msg.id ? 'Copiado' : 'Copiar email'}
								</button>
								<a href="mailto:{msg.email}" class="hm-btn hm-btn-sm hm-btn-primary">
									<Icon icon={SentIcon} size={16} color="currentColor" />
									Responder
								</a>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.settings-page {
		max-width: 720px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		font-size: 13px;
		color: var(--fg-tertiary);
		text-decoration: none;
		transition: color 120ms;
		margin-bottom: 6px;
	}
	@media (hover: hover) {
		.back-link:hover {
			color: var(--sumi);
		}
	}

	.page-title {
		font-size: 34px;
		font-weight: 700;
		letter-spacing: -0.025em;
		margin: 0 0 28px;
		color: var(--fg-primary);
	}

	.sections {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		overflow: hidden;
		box-shadow: var(--shadow-sm);
	}

	.pref-row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		width: 100%;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		transition: background 0.2s;
	}

	.pref-row:hover {
		background: var(--ink-50);
	}

	.avatar-circle {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 800;
		font-size: 14px;
		flex-shrink: 0;
	}

	.pref-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.pref-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--fg-primary);
		letter-spacing: -0.02em;
	}

	.pref-sub {
		font-size: 13px;
		color: var(--fg-tertiary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.arrow-right {
		color: var(--fg-tertiary);
		opacity: 0.5;
		transition: transform 0.3s var(--ease-brand);
	}

	.arrow-right.open {
		transform: rotate(90deg);
		opacity: 1;
	}

	.message-detail {
		padding: 0 20px 20px 20px;
	}

	.message-body {
		background: var(--paper);
		border: 1px solid var(--ink-100);
		padding: 16px;
		border-radius: 18px;
		font-size: 15px;
		line-height: 1.6;
		color: var(--fg-primary);
		white-space: pre-wrap;
		margin-bottom: 16px;
	}

	.message-actions {
		display: flex;
		gap: 10px;
	}

	.hm-btn {
		flex: 1;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60px 20px;
		text-align: center;
		color: var(--fg-tertiary);
		gap: 12px;
	}

	.empty-icon {
		background: var(--bg-surface);
		width: 64px;
		height: 64px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--ink-200);
	}
</style>
