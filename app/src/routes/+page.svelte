<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn } from '$lib/motion';
	import { fly } from 'svelte/transition';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import Landing from '$lib/components/Landing.svelte';
	import WordOfTheDay from '$lib/components/WordOfTheDay.svelte';
	import Icon from '$lib/Icon.svelte';
	import { BookOpenIcon, BookOpen01Icon } from '@hugeicons/core-free-icons';
	import type { PageData } from './$types';
	import supportImg from '$lib/assets/support.png';

	let { data } = $props<{ data: PageData }>();

	const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
	let activeLevel = $state('N5');

	const filtered = $derived(data.decks.filter((d: any) => d.level === activeLevel));
	const totalLearned = $derived(data.decks.reduce((s: number, d: any) => s + (d.learned ?? 0), 0));
	const profile = $derived(data.profile);
	const level = $derived(profile?.level || 1);
	const currentXP = $derived(profile?.xp || 0);
	const xpForCurrentLevel = $derived(Math.pow((level - 1) * 10, 2));
	const xpForNextLevel = $derived(Math.pow(level * 10, 2));
	const levelProgress = $derived(
		Math.min(
			100,
			Math.max(0, ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100)
		)
	);
</script>

{#if !data.user}
	<Landing decks={data.decks} />
{:else}
	<div
		style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));"
	>
		<!-- Minimalist Header -->
		<div
			use:fadeUp={{ delay: 0, y: 10 }}
			style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:32px;padding-top:8px;"
		>
			<div style="display:flex;align-items:center;gap:16px;">
				<div style="font-size:32px;line-height:1;">
					{profile?.avatar || '🎏'}
				</div>
				<div style="display:flex;flex-direction:column;gap:4px;">
					<div style="display:flex;align-items:baseline;gap:6px;">
						<span style="font-weight:800;font-size:16px;color:var(--sumi);">Lvl. {level}</span>
						<span style="font-size:12px;font-weight:600;color:var(--fg-tertiary);"
							>{currentXP} XP</span
						>
					</div>
					<div
						style="width:120px;height:3px;background:var(--ink-100);border-radius:2px;overflow:hidden;"
					>
						<div
							style="width:{levelProgress}%;height:100%;background:var(--hinomaru-red);transition:width 0.6s ease;"
						></div>
					</div>
				</div>
			</div>

			<div style="text-align:right;display:flex;align-items:center;gap:12px;">
				<div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
					<div style="font-size:24px;font-weight:800;color:var(--sumi);line-height:1;display:flex;align-items:center;gap:4px;">
						{data.streak} <span style="font-size:18px;">🔥</span>
					</div>
					<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--fg-tertiary);">
						{t('home.streak', $locale, { n: '' }).replace(':', '').trim()}
					</div>
				</div>
				<a href="/settings" class="dashboard-settings-btn" aria-label="Settings" style="margin-right:-10px;">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
						<circle cx="12" cy="12" r="3"></circle>
					</svg>
				</a>
			</div>
		</div>

		<h1
			use:fadeUp={{ delay: 0.06, y: 16 }}
			style="font-size:36px;font-weight:800;letter-spacing:-0.03em;margin:0 0 4px;"
		>
			{t('home.title', $locale)}
		</h1>

		<p
			use:fadeUp={{ delay: 0.12, y: 12 }}
			style="font-size:16px;color:var(--fg-secondary);margin:0;"
		>
			{t('home.summary', $locale, { n: totalLearned })}
		</p>

		<!-- Historia del día -->
		{#if data.todayStory}
			<a
				href="/deck/stories/today"
				use:fadeIn={{ delay: 0.18 }}
				class="story-card"
				class:story-read={data.storyRead}
			>
				<div class="story-card-left">
					<div class="story-card-icon">🏮</div>
					<div>
						<div class="story-card-label">{t('stories.today', $locale)}</div>
						<div class="story-card-title">
							{$locale === 'es' ? data.todayStory.title_es : data.todayStory.title_en}
						</div>
						<div class="story-card-preview">
							{[...data.todayStory.body_jp].slice(0, 28).join('')}{[...data.todayStory.body_jp]
								.length > 28
								? '…'
								: ''}
						</div>
					</div>
				</div>
				<div class="story-card-right">
					<span class="story-level-pill">{data.todayStory.level}</span>
					{#if data.storyRead}
						<span class="story-done-badge">{t('stories.alreadyRead', $locale)}</span>
					{:else}
						<span class="story-read-btn">{t('stories.read', $locale)} →</span>
					{/if}
				</div>
			</a>
		{/if}

		<!-- Quick Actions / Tools -->
		<div class="quick-tools" use:fadeUp={{ delay: 0.22, y: 12 }}>
			<a href="/alphabet" class="tool-btn">
				<span class="tool-icon">⛩️</span>
				<span>{t('nav.alphabet', $locale)}</span>
			</a>
			<a href="/vocabulary" class="tool-btn">
				<span class="tool-icon">📚</span>
				<span>{t('nav.vocabulary', $locale)}</span>
			</a>
			<a href="/deck/stories" class="tool-btn">
				<span class="tool-icon">📜</span>
				<span>{t('stories.title', $locale)}</span>
			</a>
			<a href="/deck/songs" class="tool-btn">
				<span class="tool-icon">🎧</span>
				<span>{t('nav.songs', $locale)}</span>
			</a>
		</div>

		<!-- Word of the Day -->
		<WordOfTheDay word={data.todayWord} initiallySaved={data.wordSaved} />

		<!-- Level tabs -->

		<div
			use:fadeIn={{ delay: 0.18 }}
			class="hide-scrollbar"
			style="display:flex;gap:8px;margin-top:32px;margin-bottom:20px;overflow-x:auto;"
		>
			{#each levels as level (level)}
				<button
					onclick={() => {
						activeLevel = level;
					}}
					class="touch-action-manip"
					style="height:42px;padding:0 16px;border-radius:999px;
               border:1px solid {activeLevel === level ? 'var(--sumi)' : 'var(--ink-200)'};
               background:{activeLevel === level ? 'var(--sumi)' : 'var(--bg-surface)'};
               color:{activeLevel === level ? 'var(--bg-surface)' : 'var(--sumi)'};
               font-weight:600;font-size:13px;cursor:pointer;font-family:var(--font-ui);
               white-space:nowrap;flex-shrink:0;transition:background 180ms ease,color 180ms ease,border-color 180ms ease;"
				>
					{level}
				</button>
			{/each}
		</div>

		<div style="display:grid; grid-template-columns: 1fr;">
			{#key activeLevel}
				<div
					in:fly={{ y: 20, duration: 300, delay: 200, easing: cubicOut }}
					out:fly={{ y: -20, duration: 200, easing: cubicIn }}
					style="grid-area: 1 / 1; display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px; align-content: start;"
				>
					{#if filtered.length === 0}
						<div
							style="padding:40px;text-align:center;color:var(--fg-tertiary);border:1px dashed var(--ink-200);border-radius:24px;grid-column:1 / -1;"
						>
							{t('home.empty', $locale)}
						</div>
					{/if}
					{#each filtered as deck (deck.id)}
						{@const pct =
							deck.card_count > 0 ? Math.round(((deck.learned ?? 0) / deck.card_count) * 100) : 0}
						{@const complete = deck.card_count > 0 && (deck.learned ?? 0) >= deck.card_count}
						<a
							href="/deck/{deck.id}"
							class="touch-action-manip"
							style="background:var(--bg-surface);border:1px solid var(--ink-200);border-radius:24px;padding:20px;
                   cursor:pointer;text-decoration:none;color:inherit;display:block;
                   box-shadow:var(--shadow-sm);
                   transition:box-shadow 200ms ease, transform 200ms ease;"
							onmouseenter={(e) => {
								(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
								(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
							}}
							onmouseleave={(e) => {
								(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
								(e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
							}}
							ontouchstart={(e) => {
								(e.currentTarget as HTMLElement).style.transform = 'scale(0.98)';
							}}
							ontouchend={(e) => {
								(e.currentTarget as HTMLElement).style.transform = 'scale(1)';
							}}
						>
							<div
								style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"
							>
								<div style="display:flex;gap:6px;align-items:center;">
									<span class="hm-pill hm-pill-red">{deck.level}</span>
									{#if deck.due > 0}
										<span class="hm-pill" style="background:var(--sumi);color:var(--bg-surface);">
											{deck.due}
											{t('home.due', $locale)}
										</span>
									{/if}
								</div>
								<span style="font-size:12px;color:var(--fg-secondary);"
									>{t('home.cards', $locale, { n: deck.card_count })}</span
								>
							</div>
							<div class="label-meta" style="margin-bottom:4px;">
								{$locale === 'es' ? (deck.kind_es ?? deck.kind) : deck.kind}
							</div>
							<div style="font-size:20px;font-weight:600;letter-spacing:-0.01em;">
								{$locale === 'es' ? deck.title_es : deck.title_en}
							</div>
							<div style="font-size:14px;color:var(--fg-secondary);margin-top:4px;line-height:1.5;">
								{$locale === 'es' ? deck.desc_es : deck.desc_en}
							</div>
							<div style="margin-top:20px;">
								<div class="hm-progress">
									<div
										class="hm-progress-bar"
										style="width:{pct}%;background:{complete
											? 'var(--success)'
											: 'var(--hinomaru-red)'};"
									></div>
								</div>
								<div class="label-meta" style="margin-top:8px;">
									{complete
										? t('home.complete', $locale)
										: t('home.learned', $locale, { a: deck.learned ?? 0, b: deck.card_count })}
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/key}
		</div>
		<div style="margin-top:40px;">
			<section class="settings-group">
				<h2 class="group-label" style="text-align:center;">
					{t('settings.support.title', $locale)}
				</h2>
				<div class="support-container">
					<p class="support-text">{t('settings.support.desc', $locale)}</p>
					<a
						href="https://ko-fi.com/manujsx"
						target="_blank"
						rel="noopener noreferrer"
						class="support-image-btn"
					>
						<img src={supportImg} alt="Support on Ko-fi" />
					</a>
				</div>
			</section>
		</div>
	</div>
{/if}

<style>
	.settings-group {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.group-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--fg-tertiary);
		margin-bottom: 4px;
	}

	.support-container {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 24px;
		box-shadow: var(--shadow-sm);
		text-align: center;
	}

	.support-text {
		font-size: 14px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin: 0 0 16px;
	}

	.support-image-btn {
		display: inline-block;
		transition: transform 0.2s;
	}

	.support-image-btn img {
		height: 44px;
		width: auto;
		display: block;
		margin: 0 auto;
	}

	.support-image-btn:hover {
		transform: scale(1.05);
	}

	.support-image-btn:active {
		transform: scale(0.95);
	}

	/* ── Historia del día ── */
	.story-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px 20px;
		margin-top: 24px;
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
	}

	.story-card:active {
		transform: scale(0.99);
	}

	.story-card.story-read {
		border-color: var(--success-wash);
	}

	.story-card-left {
		display: flex;
		align-items: center;
		gap: 14px;
		min-width: 0;
	}

	.story-card-icon {
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		background: var(--sumi);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--washi);
	}

	.story-card-label {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		margin-bottom: 2px;
	}

	.story-card-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
		margin-bottom: 4px;
	}

	.story-card-preview {
		font-family: var(--font-jp);
		font-size: 12px;
		color: var(--fg-tertiary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 200px;
	}

	.story-card-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
		flex-shrink: 0;
	}

	.story-level-pill {
		background: var(--sumi);
		color: var(--bg-surface);
		font-size: 10px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 6px;
		letter-spacing: 0.04em;
	}

	.story-read-btn {
		font-size: 13px;
		font-weight: 600;
		color: var(--hinomaru-red);
		white-space: nowrap;
	}

	.story-done-badge {
		font-size: 12px;
		font-weight: 700;
		color: var(--success);
		background: var(--success-wash);
		padding: 2px 10px;
		border-radius: 99px;
		white-space: nowrap;
	}

	.quick-tools {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		margin: 24px 0;
	}

	@media (min-width: 540px) {
		.quick-tools {
			grid-template-columns: repeat(4, 1fr);
			gap: 10px;
		}
	}

	.tool-btn {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 8px;
		gap: 6px;
		text-decoration: none;
		color: var(--sumi);
		font-weight: 700;
		font-size: 12px;
		box-shadow: var(--shadow-sm);
		transition: all 0.2s;
		overflow: hidden;
		white-space: nowrap;
	}

	@media (min-width: 380px) {
		.tool-btn {
			padding: 0 12px;
			gap: 8px;
			font-size: 13px;
		}
	}

	@media (min-width: 540px) {
		.tool-btn {
			height: 52px;
		}
	}

	.tool-btn:hover {
		border-color: var(--ink-300);
		box-shadow: var(--shadow-md);
		transform: translateY(-1px);
	}

	.tool-icon {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		background: var(--ink-100);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 17px;
		font-family: var(--font-jp);
		color: var(--sumi);
		line-height: 1;
	}

	.dashboard-settings-btn {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
		border-radius: 50%;
		transition: all 0.2s;
		margin-right: -10px;
	}

	.dashboard-settings-btn:hover {
		background: var(--ink-100);
		color: var(--sumi);
	}

	.dashboard-settings-btn:active {
		transform: scale(0.9);
	}
</style>
