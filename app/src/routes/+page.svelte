<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn } from '$lib/motion';
	import { fly } from 'svelte/transition';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import Landing from '$lib/components/Landing.svelte';
	import WordOfTheDay from '$lib/components/WordOfTheDay.svelte';
	import Icon from '$lib/Icon.svelte';
	import Roadmap from '$lib/components/Roadmap.svelte';
	import { Settings02Icon, CheckmarkCircle01Icon, Grid02Icon, RouteIcon } from '@hugeicons/core-free-icons';
	import type { PageData } from './$types';
	import supportImg from '$lib/assets/support.png';

	let { data } = $props<{ data: PageData }>();

	const levels = ['Survival', 'N5', 'N4', 'N3', 'N2', 'N1'];
	let activeLevel = $state(data.motivation === 'travel' ? 'Survival' : 'N5');
	let viewMode = $state('roadmap'); // 'grid' or 'roadmap'


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
	const learnedToday = $derived(data.learnedToday ?? 0);
	const dailyGoal = $derived(data.dailyGoal ?? 5);
</script>

{#if !data.user}
	<Landing decks={data.decks} />
{:else}
	<div
		style="max-width:720px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 24px calc(100px + env(safe-area-inset-bottom));"
	>
		<!-- Header -->
		<div use:fadeUp={{ delay: 0, y: 10 }} class="dash-header">
			<!-- Left: avatar + level + xp bar -->
			<div class="dash-header-left">
				<div class="dash-avatar">{profile?.avatar || '🎏'}</div>
				<div class="dash-level-wrap">
					<div class="dash-level-row">
						<span class="dash-level-label">Lvl. {level}</span>
						<span class="dash-xp-label">{currentXP} XP</span>
					</div>
					<div class="dash-xp-track">
						<div class="dash-xp-fill" style="width:{levelProgress}%;"></div>
					</div>
				</div>
			</div>

			<!-- Right: streak chip + settings -->
			<div class="dash-header-right">
				<div class="dash-streak-chip" class:streak-active={data.streak > 0}>
					<svg class="streak-flame" viewBox="-33 0 255 255" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
						<defs>
							<linearGradient id="streak-flame-grad" gradientUnits="userSpaceOnUse" x1="94.141" y1="255" x2="94.141" y2="0.188">
								<stop offset="0" stop-color="#ff4c0d"/>
								<stop offset="1" stop-color="#fc9502"/>
							</linearGradient>
						</defs>
						<path d="M187.899,164.809 C185.803,214.868 144.574,254.812 94.000,254.812 C42.085,254.812 -0.000,211.312 -0.000,160.812 C-0.000,154.062 -0.121,140.572 10.000,117.812 C16.057,104.191 19.856,95.634 22.000,87.812 C23.178,83.513 25.469,76.683 32.000,87.812 C35.851,94.374 36.000,103.812 36.000,103.812 C36.000,103.812 50.328,92.817 60.000,71.812 C74.179,41.019 62.866,22.612 59.000,9.812 C57.662,5.384 56.822,-2.574 66.000,0.812 C75.352,4.263 100.076,21.570 113.000,39.812 C131.445,65.847 138.000,90.812 138.000,90.812 C138.000,90.812 143.906,83.482 146.000,75.812 C148.365,67.151 148.400,58.573 155.999,67.813 C163.226,76.600 173.959,93.113 180.000,108.812 C190.969,137.321 187.899,164.809 187.899,164.809 Z" fill="url(#streak-flame-grad)" fill-rule="evenodd"/>
						<path d="M94.000,254.812 C58.101,254.812 29.000,225.711 29.000,189.812 C29.000,168.151 37.729,155.000 55.896,137.166 C67.528,125.747 78.415,111.722 83.042,102.172 C83.953,100.292 86.026,90.495 94.019,101.966 C98.212,107.982 104.785,118.681 109.000,127.812 C116.266,143.555 118.000,158.812 118.000,158.812 C118.000,158.812 125.121,154.616 130.000,143.812 C131.573,140.330 134.753,127.148 143.643,140.328 C150.166,150.000 159.127,167.390 159.000,189.812 C159.000,225.711 129.898,254.812 94.000,254.812 Z" fill="#fc9502" fill-rule="evenodd"/>
						<path d="M95.000,183.812 C104.250,183.812 104.250,200.941 116.000,223.812 C123.824,239.041 112.121,254.812 95.000,254.812 C77.879,254.812 69.000,240.933 69.000,223.812 C69.000,206.692 85.750,183.812 95.000,183.812 Z" fill="#fce202" fill-rule="evenodd"/>
					</svg>
					<span class="dash-streak-num">{data.streak}</span>
				</div>
				<a href="/settings" class="dashboard-settings-btn" aria-label="Settings">
					<Icon icon={Settings02Icon} size={20} color="currentColor" strokeWidth={1.8} />
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
				<div class="story-card-icon" class:story-icon-read={data.storyRead}>
					🏮
				</div>
				<div class="story-card-info">
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

		<!-- Word of the Day & Progress -->
		<WordOfTheDay 
			word={data.todayWord} 
			initiallySaved={data.wordSaved} 
			learnedToday={learnedToday}
			dailyGoal={dailyGoal}
		/>

		<!-- Level tabs -->

		<div
			use:fadeIn={{ delay: 0.18 }}
			style="display:flex; justify-content: space-between; align-items: center; margin-top: 32px; margin-bottom: 20px;"
		>
			<div
				class="hide-scrollbar"
				style="display:flex;gap:8px;overflow-x:auto;"
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
						white-space:nowrap;flex-shrink:0;transition:all 180ms ease;"
					>
						{level}
					</button>
				{/each}
			</div>

			<div style="display: flex; gap: 4px;">
				<button 
					onclick={() => viewMode = 'grid'}
					class="view-mode-btn"
					class:active={viewMode === 'grid'}
				>
					<Icon icon={Grid02Icon} size={18} color="currentColor" />
				</button>
				<button 
					onclick={() => viewMode = 'roadmap'}
					class="view-mode-btn"
					class:active={viewMode === 'roadmap'}
				>
					<Icon icon={RouteIcon} size={18} color="currentColor" />
				</button>
			</div>
		</div>

		<div style="display:grid; grid-template-columns: 1fr;">
			{#key activeLevel}
				<div
					in:fly={{ y: 20, duration: 300, delay: 200, easing: cubicOut }}
					out:fly={{ y: -20, duration: 200, easing: cubicIn }}
					style="grid-area: 1 / 1; align-content: start;"
				>
					{#if viewMode === 'roadmap' && activeLevel === 'N5'}
						<Roadmap decks={data.decks} />
					{:else}
						<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
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
							class="deck-card"
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
					{/if}
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
	/* ── Daily Goal (Dashboard) ── */

	/* ── General ── */
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
		margin: 0 0 20px;
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

	@media (hover: hover) {
		.support-image-btn:hover {
			transform: scale(1.05);
		}
	}

	.support-image-btn:active {
		transform: scale(0.95);
	}

	.deck-card {
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 24px;
		padding: 24px;
		cursor: pointer;
		text-decoration: none;
		color: inherit;
		display: block;
		box-shadow: var(--shadow-sm);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	@media (hover: hover) {
		.deck-card:hover {
			box-shadow: var(--shadow-md);
			transform: translateY(-4px);
			border-color: var(--ink-300);
		}
	}

	.deck-card:active {
		transform: scale(0.98);
		background: var(--ink-50);
	}

	/* ── Historia del día ── */
	.story-card {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 16px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 20px;
		padding: 20px 24px;
		margin-top: 24px;
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-sm);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.story-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, var(--hinomaru-red) 0%, transparent 100%);
		opacity: 0.02;
		pointer-events: none;
	}
	:global([data-theme='dark']) .story-card::before {
		opacity: 0.05;
	}

	@media (hover: hover) {
		.story-card:hover {
			box-shadow: var(--shadow-md);
			transform: translateY(-2px);
			border-color: var(--ink-300);
		}
	}

	.story-card:active {
		transform: scale(0.99);
		background: var(--ink-50);
	}

	.story-card.story-read {
		border-color: var(--ink-200);
		background: rgba(46, 125, 91, 0.03);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}
	:global([data-theme='dark']) .story-card.story-read {
		border-color: var(--ink-200);
		background: rgba(46, 125, 91, 0.08);
	}
	.story-icon-read {
		background: rgba(46, 125, 91, 0.1) !important;
	}

	.story-card-info {
		min-width: 0;
		overflow: hidden;
	}

	.story-card-icon {
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		background: var(--ink-100);
		border-radius: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22px;
		transition: transform 0.2s;
		position: relative;
	}
	:global([data-theme='dark']) .story-card-icon {
		background: var(--ink-200);
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
		max-width: 100%;
	}

	.story-card-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
		flex-shrink: 0;
	}

	.view-mode-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		color: var(--fg-tertiary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.view-mode-btn.active {
		background: var(--sumi);
		border-color: var(--sumi);
		color: var(--bg-surface);
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

	/* ── Header ── */
	.dash-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32px;
		padding-top: 8px;
	}

	.dash-header-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.dash-avatar {
		font-size: 28px;
		line-height: 1;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--ink-50);
		border-radius: 50%;
		border: 1px solid var(--ink-100);
		flex-shrink: 0;
	}

	.dash-level-wrap {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.dash-level-row {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.dash-level-label {
		font-weight: 800;
		font-size: 14px;
		color: var(--sumi);
		letter-spacing: -0.01em;
	}

	.dash-xp-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--fg-tertiary);
	}

	.dash-xp-track {
		width: 100px;
		height: 3px;
		background: var(--ink-100);
		border-radius: 2px;
		overflow: hidden;
	}

	.dash-xp-fill {
		height: 100%;
		background: var(--hinomaru-red);
		border-radius: 2px;
		transition: width 0.6s ease;
	}

	.dash-header-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.dash-streak-chip {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 5px 10px;
		border-radius: 99px;
		background: var(--ink-50);
		border: 1px solid var(--ink-100);
		color: var(--fg-tertiary);
		transition: all 0.2s;
	}

	.dash-streak-chip.streak-active {
		background: rgba(255, 107, 0, 0.08);
		border-color: rgba(255, 107, 0, 0.2);
		color: #e05c00;
	}

	.streak-flame {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.dash-streak-num {
		font-size: 13px;
		font-weight: 800;
		letter-spacing: -0.01em;
		line-height: 1;
	}

	.dashboard-settings-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-tertiary);
		border-radius: 99px;
		transition: all 0.15s;
		background: var(--ink-50);
		border: 1px solid var(--ink-100);
	}

	@media (hover: hover) {
		.dashboard-settings-btn:hover {
			background: var(--ink-100);
			color: var(--sumi);
		}
	}

	.dashboard-settings-btn:active {
		transform: scale(0.92);
	}
	:global([data-theme='dark']) .deck-card,
	:global([data-theme='dark']) .story-card,
	:global([data-theme='dark']) .support-container {
		background: var(--ink-100);
		border-color: var(--ink-200);
	}

	:global([data-theme='dark']) .deck-card:hover,
	:global([data-theme='dark']) .story-card:hover {
		background: var(--ink-200);
		border-color: var(--ink-300);
	}
</style>
