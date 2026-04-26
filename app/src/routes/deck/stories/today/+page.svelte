<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp } from '$lib/motion';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="story-page">
	{#if !data.story}
		<div class="empty-state" use:fadeUp={{ delay: 0, y: 16 }}>
			<div class="empty-icon">📭</div>
			<p>{t('stories.noStory', $locale)}</p>
			<a
				href="/deck/stories"
				class="hm-btn hm-btn-dark"
				style="text-decoration:none;margin-top:24px;"
			>
				{t('stories.back', $locale)}
			</a>
		</div>
	{/if}
</div>

<style>
	.story-page {
		max-width: 720px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 24px 140px;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.empty-state {
		text-align: center;
		color: var(--fg-tertiary);
	}
	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}
</style>
