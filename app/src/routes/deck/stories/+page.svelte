<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, staggerChildren } from '$lib/motion';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<svelte:head>
	<title>{t('stories.title', $locale)} — Hinomaru</title>
</svelte:head>

<div style="max-width:720px;margin:0 auto;padding:24px 24px calc(100px + env(safe-area-inset-bottom));">
	<!-- Back button -->
	<a
		use:fadeIn={{ delay: 0 }}
		href="/"
		class="back-link"
	>
		← {t('deck.back', $locale)}
	</a>

	<h1
		use:fadeUp={{ delay: 0.1, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;"
	>
		{t('stories.title', $locale)}
	</h1>

	<p
		use:fadeUp={{ delay: 0.15, y: 12 }}
		style="font-size:18px;color:var(--fg-secondary);margin:0;line-height:1.55;"
	>
		{t('stories.subtitle', $locale)}
	</p>

	<div
		use:staggerChildren={{ delay: 0.3, stagger: 0.08, y: 12 }}
		style="display:flex;flex-direction:column;gap:12px;margin-top:40px;"
	>
		{#if data.stories.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📭</div>
				<p>{t('stories.noStory', $locale)}</p>
			</div>
		{/if}

		{#each data.stories as story (story.id)}
			<a
				href="/deck/stories/{story.id}"
				class="story-item"
			>
				<div class="story-item-left">
					<div class="story-item-icon">📖</div>
					<div>
						<div class="story-item-title">
							{$locale === 'es' ? story.title_es : story.title_en}
						</div>
						<div class="story-item-meta">
							<span class="level-pill">{story.level}</span>
							<span>•</span>
							<span>{new Date(story.publish_date).toLocaleDateString($locale === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' })}</span>
						</div>
					</div>
				</div>
				<span class="arrow">→</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--fg-secondary);
		text-decoration: none;
		margin-bottom: 32px;
		transition: color 150ms ease;
	}
	.back-link:hover {
		color: var(--sumi);
	}

	.story-item {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 18px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-decoration: none;
		color: inherit;
		transition: all 180ms ease;
	}

	.story-item:hover {
		box-shadow: var(--shadow-md);
		transform: translateX(4px);
		border-color: var(--ink-300);
	}

	.story-item-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.story-item-icon {
		width: 44px;
		height: 44px;
		background: var(--ink-100);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
	}

	.story-item-title {
		font-size: 17px;
		font-weight: 700;
		color: var(--fg-primary);
	}

	.story-item-meta {
		font-size: 12px;
		color: var(--fg-tertiary);
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 2px;
	}

	.level-pill {
		background: var(--sumi);
		color: var(--bg-surface);
		font-size: 10px;
		font-weight: 800;
		padding: 2px 8px;
		border-radius: 6px;
	}

	.arrow {
		color: var(--fg-tertiary);
		font-weight: 700;
	}

	.empty-state {
		text-align: center;
		padding: 60px 24px;
		color: var(--fg-tertiary);
	}
	.empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}
</style>
