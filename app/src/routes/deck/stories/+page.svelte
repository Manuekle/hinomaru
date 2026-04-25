<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, staggerChildren } from '$lib/motion';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
	let activeLevel = $state('N5');

	const filteredStories = $derived(data.stories.filter((s) => s.level === activeLevel));
</script>

<svelte:head>
	<title>{t('stories.title', $locale)} — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));"
>
	<div use:fadeUp={{ delay: 0, y: 12 }} style="margin-bottom:8px;">
		<a href="/" class="back-link-beautiful">
			← {t('deck.back', $locale)}
		</a>
	</div>

	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;"
	>
		{t('stories.title', $locale)}
	</h1>

	<p use:fadeUp={{ delay: 0.12, y: 12 }} style="font-size:16px;color:var(--fg-secondary);margin:0;">
		{t('stories.subtitle', $locale)}
	</p>

	<!-- Level Tabs matching Dashboard -->
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

	<!-- Stories Grid -->
	<div class="stories-grid" use:staggerChildren={{ delay: 0.25, stagger: 0.08, y: 12 }}>
		{#if filteredStories.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📭</div>
				<p>{t('stories.noStory', $locale)}</p>
			</div>
		{:else}
			{#each filteredStories as story (story.id)}
				<a href="/deck/stories/{story.id}" class="story-card">
					<div class="story-card-left">
						<div class="story-card-icon">📖</div>
						<div class="story-card-info">
							<div class="story-card-label">{story.level}</div>
							<div class="story-card-title">
								{$locale === 'es' ? story.title_es : story.title_en}
							</div>
							<div class="story-card-preview">
								{[...story.body_jp].slice(0, 32).join('')}...
							</div>
						</div>
					</div>
					<div class="story-card-right">
						<span class="story-date">
							{new Date(story.publish_date).toLocaleDateString(
								$locale === 'es' ? 'es-MX' : 'en-US',
								{
									month: 'short',
									day: 'numeric'
								}
							)}
						</span>
						<span class="read-more">{t('stories.read', $locale)} →</span>
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
	.back-link-beautiful:hover {
		color: var(--sumi);
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
	}

	.filter-chip.active {
		background: var(--sumi);
		color: var(--bg-surface);
		border-color: var(--sumi);
	}

	.stories-grid {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.story-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px 20px;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-sm);
		transition:
			box-shadow 200ms ease,
			transform 200ms ease;
		position: relative;
		overflow: hidden;
	}

	.story-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(188, 0, 45, 0.04) 0%, transparent 60%);
		pointer-events: none;
	}

	.story-card:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
		border-color: var(--ink-300);
	}

	.story-card-left {
		display: flex;
		align-items: center;
		gap: 14px;
		min-width: 0;
	}

	.story-card-icon {
		font-size: 24px;
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		background: var(--sumi);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.story-card-info {
		min-width: 0;
	}

	.story-card-label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		margin-bottom: 2px;
	}

	.story-card-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
		margin-bottom: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.story-card-preview {
		font-family: var(--font-jp);
		font-size: 13px;
		color: var(--fg-tertiary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.story-card-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		flex-shrink: 0;
	}

	.story-date {
		font-size: 11px;
		color: var(--fg-tertiary);
		font-weight: 600;
	}

	.read-more {
		font-size: 13px;
		font-weight: 600;
		color: var(--hinomaru-red);
		white-space: nowrap;
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
