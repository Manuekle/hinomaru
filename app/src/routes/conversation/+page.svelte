<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, staggerChildren } from '$lib/motion';
	import { conversations } from '$lib/data/conversations';

	const levelColors: Record<string, string> = {
		N5: '#2e7d5b',
		N4: '#6d8c3b',
		N3: '#a8741a'
	};

	function countChoices(scenario: (typeof conversations)[0]) {
		return scenario.turns.filter((t) => t.type === 'choice').length;
	}
</script>

<svelte:head>
	<title>Conversatorio — Hinomaru</title>
</svelte:head>

<div class="page">
	<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:8px;">
		<a href="/" class="back-link">
			← {t('deck.back', $locale)}
		</a>
	</div>

	<h1 use:fadeUp={{ delay: 0.06, y: 16 }} class="page-title">
		{$locale === 'es' ? 'Conversatorio' : 'Conversation Practice'}
	</h1>
	<p use:fadeUp={{ delay: 0.1 }} class="page-desc">
		{$locale === 'es'
			? 'Practica conversaciones reales con situaciones cotidianas en Japón.'
			: 'Practice real conversations with everyday situations in Japan.'}
	</p>

	<div
		use:staggerChildren={{ delay: 0.15, stagger: 0.07, y: 14 }}
		class="scenario-grid"
	>
		{#each conversations as scenario (scenario.id)}
			{@const choices = countChoices(scenario)}
			<a href="/conversation/{scenario.id}" class="scenario-card">
				<div class="card-icon">{scenario.icon}</div>
				<div class="card-body">
					<div class="card-title">
						{$locale === 'es' ? scenario.title_es : scenario.title_en}
					</div>
					<div class="card-meta">
						<span class="level-tag" style="background: {levelColors[scenario.level]}20; color: {levelColors[scenario.level]};">
							{scenario.level}
						</span>
						<span class="turns-label">
							{choices} {$locale === 'es' ? 'decisiones' : 'decisions'}
						</span>
					</div>
					<p class="card-context">
						{$locale === 'es' ? scenario.context_es : scenario.context_es}
					</p>
				</div>
				<span class="card-arrow">→</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.page {
		max-width: 680px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 24px calc(80px + env(safe-area-inset-bottom));
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		transition: color 150ms ease;
	}
	.back-link:hover { color: var(--sumi); }

	.page-title {
		font-size: 40px;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin: 0 0 12px;
	}

	.page-desc {
		font-size: 17px;
		color: var(--fg-secondary);
		line-height: 1.6;
		margin: 0 0 40px;
	}

	.scenario-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.scenario-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 20px;
		display: flex;
		align-items: flex-start;
		gap: 16px;
		text-decoration: none;
		color: inherit;
		transition: box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.scenario-card:hover {
		box-shadow: var(--shadow-md);
		border-color: var(--ink-300);
		transform: translateY(-2px);
	}

	.scenario-card:active {
		transform: scale(0.99);
		box-shadow: var(--shadow-sm);
	}

	.card-icon {
		font-size: 32px;
		line-height: 1;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.card-body {
		flex: 1;
		min-width: 0;
	}

	.card-title {
		font-size: 17px;
		font-weight: 700;
		color: var(--fg-primary);
		margin-bottom: 8px;
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.level-tag {
		font-size: 11px;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 999px;
	}

	.turns-label {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}

	.card-context {
		font-size: 13px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin: 0;
	}

	.card-arrow {
		color: var(--fg-tertiary);
		font-size: 16px;
		flex-shrink: 0;
		margin-top: 4px;
	}
</style>
