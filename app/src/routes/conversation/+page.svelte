<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, staggerChildren } from '$lib/motion';
	import { conversations } from '$lib/data/conversations';

	const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
	let activeLevel = $state('N5');

	const filtered = $derived(conversations.filter((c) => c.level === activeLevel));

	function countChoices(scenario: (typeof conversations)[0]) {
		return scenario.turns.filter((t) => t.type === 'choice').length;
	}
</script>

<svelte:head>
	<title>Conversatorio — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;padding:calc(32px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));"
>


	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;"
	>
		{$locale === 'es' ? 'Conversatorio' : 'Conversations'}
	</h1>

	<p use:fadeUp={{ delay: 0.12, y: 12 }} style="font-size:16px;color:var(--fg-secondary);margin:0;">
		{$locale === 'es'
			? 'Practica situaciones reales del día a día en Japón.'
			: 'Practice real everyday situations in Japan.'}
	</p>

	<!-- Level filter chips -->
	<div
		use:fadeIn={{ delay: 0.18 }}
		class="hide-scrollbar"
		style="display:flex;gap:8px;margin-top:32px;margin-bottom:20px;overflow-x:auto;"
	>
		{#each levels as level (level)}
			<button
				onclick={() => (activeLevel = level)}
				class="filter-chip"
				class:active={activeLevel === level}
			>
				{level}
			</button>
		{/each}
	</div>

	<!-- List -->
	<div class="list" use:staggerChildren={{ delay: 0.25, stagger: 0.07, y: 10 }}>
		{#if filtered.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📭</div>
				<p>{$locale === 'es' ? 'Sin escenarios en este nivel.' : 'No scenarios at this level.'}</p>
			</div>
		{:else}
			{#each filtered as scenario, i (scenario.id)}
				<a href="/conversation/{scenario.id}" class="row">
					<div class="row-num">{i + 1 < 10 ? '0' + (i + 1) : i + 1}</div>
					<div class="row-body">
						<div class="row-top">
							<span class="row-icon">{scenario.icon}</span>
							<span class="row-title">
								{$locale === 'es' ? scenario.title_es : scenario.title_en}
							</span>
						</div>
						<div class="row-sub">{scenario.context_es}</div>
						<div class="row-meta-inline">
							{countChoices(scenario)}
							{$locale === 'es' ? 'situaciones' : 'situations'}
						</div>
					</div>
					<div class="row-meta">
						<span class="row-level">{scenario.level}</span>
						<span class="row-arrow">→</span>
					</div>
				</a>
			{/each}
		{/if}
	</div>
</div>

<style>
	.back-link-beautiful {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		transition: color 150ms ease;
	}
	@media (hover: hover) {
		.back-link-beautiful:hover {
			color: var(--sumi);
		}
	}

	.filter-chip {
		height: 42px;
		padding: 0 16px;
		border-radius: 999px;
		border: 1px solid var(--ink-200);
		background: var(--bg-surface);
		color: var(--sumi);
		font-weight: 600;
		font-size: 13px;
		cursor: pointer;
		font-family: var(--font-ui);
		white-space: nowrap;
		flex-shrink: 0;
		transition: all 180ms ease;
		touch-action: manipulation;
	}
	.filter-chip.active {
		background: var(--sumi);
		color: var(--bg-surface);
		border-color: var(--sumi);
	}

	.list {
		display: flex;
		flex-direction: column;
	}

	.row {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		padding: 16px 0;
		border-bottom: 1px solid var(--ink-100);
		text-decoration: none;
		color: inherit;
		transition: background 150ms;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.row:first-child {
		border-top: 1px solid var(--ink-100);
	}
	@media (hover: hover) {
		.row:hover .row-title {
			color: var(--hinomaru-red);
		}
	}
	@media (hover: hover) {
		.row:hover .row-arrow {
			color: var(--hinomaru-red);
			transform: translateX(3px);
		}
	}

	.row-num {
		font-size: 11px;
		font-weight: 700;
		color: var(--fg-tertiary);
		font-variant-numeric: tabular-nums;
		padding-top: 3px;
		min-width: 24px;
		letter-spacing: 0.02em;
	}

	.row-body {
		flex: 1;
		min-width: 0;
	}

	.row-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 3px;
	}

	.row-icon {
		font-size: 17px;
		line-height: 1;
		flex-shrink: 0;
	}

	.row-title {
		font-size: 17px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
		transition: color 150ms;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.row-sub {
		font-size: 13px;
		color: var(--fg-tertiary);
		margin-bottom: 3px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.row-meta-inline {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}

	.row-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
		padding-top: 3px;
		flex-shrink: 0;
	}

	.row-level {
		font-size: 10px;
		font-weight: 700;
		color: var(--hinomaru-red);
		letter-spacing: 0.04em;
		background: var(--hinomaru-red-wash);
		padding: 2px 7px;
		border-radius: 6px;
	}

	.row-arrow {
		font-size: 14px;
		color: var(--fg-tertiary);
		transition:
			color 150ms,
			transform 150ms;
	}

	.empty-state {
		text-align: center;
		padding: 60px 24px;
		color: var(--fg-tertiary);
	}
	.empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
		display: block;
	}
</style>
