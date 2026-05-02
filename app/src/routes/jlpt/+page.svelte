<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';
	import { fadeUp, fadeIn, staggerChildren } from '$lib/motion';
	import { getTest, LEVEL_META, SECTION_LABELS, AUDIO_FILES } from '$lib/data/jlpt/index';
	import type { JLPTLevel, JLPTSectionType } from '$lib/data/jlpt/index';
	import { showRomaji } from '$lib/stores/settings';
	import Icon from '$lib/Icon.svelte';
	import { DocumentValidationIcon, AlertCircleIcon } from '@hugeicons/core-free-icons';
	import { fade } from 'svelte/transition';
	import ResponsiveModal from '$lib/components/ui/ResponsiveModal.svelte';

	const supabase = createClient();

	const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
	let activeLevel = $state<JLPTLevel>('N5');

	interface SectionResult {
		score: number;
		total: number;
		pct: number;
		date: string;
	}
	let results = $state<Partial<Record<string, SectionResult>>>({});

	onMount(async () => {
		// Load localStorage first for instant display
		const r: Partial<Record<string, SectionResult>> = {};
		for (const lv of levels) {
			for (const sec of ['vocabulary', 'grammar', 'listening'] as JLPTSectionType[]) {
				const raw = localStorage.getItem(`jlpt_result_${lv}_${sec}`);
				if (raw) {
					try { r[`${lv}_${sec}`] = JSON.parse(raw); } catch { /* ignore */ }
				}
			}
		}
		results = r;

		// Sync from Supabase (source of truth)
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				const { data: rows } = await supabase
					.from('jlpt_results')
					.select('level, section, score, total, pct, completed_at')
					.eq('user_id', user.id);
				if (rows?.length) {
					const synced = { ...r };
					for (const row of rows) {
						const key = `${row.level}_${row.section}`;
						synced[key] = { score: row.score, total: row.total, pct: row.pct, date: row.completed_at };
						// Keep localStorage in sync
						try {
							localStorage.setItem(`jlpt_result_${row.level}_${row.section}`, JSON.stringify(synced[key]));
						} catch { /* ignore */ }
					}
					results = synced;
				}
			}
		} catch { /* offline — localStorage data is fine */ }
	});

	function getResult(level: JLPTLevel, section: JLPTSectionType): SectionResult | null {
		return results[`${level}_${section}`] ?? null;
	}

	function questionCount(level: JLPTLevel, section: JLPTSectionType): number {
		if (section === 'listening') return 0;
		const test = getTest(level, section);
		return test ? test.mondai.reduce((acc, m) => acc + m.questions.length, 0) : 0;
	}

	function hasContent(level: JLPTLevel, section: JLPTSectionType): boolean {
		if (section === 'listening') return (AUDIO_FILES[level]?.length ?? 0) > 0;
		return questionCount(level, section) > 0;
	}

	function levelComplete(level: JLPTLevel): boolean {
		return (LEVEL_META[level]?.sections ?? []).every(
			(sec) => !hasContent(level, sec) || getResult(level, sec) !== null
		);
	}

	function completedCount(level: JLPTLevel): number {
		return (LEVEL_META[level]?.sections ?? []).filter(
			(sec) => hasContent(level, sec) && getResult(level, sec) !== null
		).length;
	}

	function totalAvailable(level: JLPTLevel): number {
		return (LEVEL_META[level]?.sections ?? []).filter((sec) => hasContent(level, sec)).length;
	}

	const SECTION_ICONS: Record<string, string> = {
		vocabulary: '語',
		grammar: '文',
		listening: '聴',
		mock: '試'
	};

	function mockPassed(level: JLPTLevel): boolean {
		const res = getResult(level, 'mock');
		return res !== null && res.pct >= 70;
	}

	let showConfirmModal = $state(false);
	let pendingUrl = $state<string | null>(null);

	function openConfirm(url: string) {
		pendingUrl = url;
		showConfirmModal = true;
	}

	function handleConfirm() {
		if (pendingUrl) goto(pendingUrl);
		showConfirmModal = false;
	}

	async function resetLevel(level: JLPTLevel) {
		const secs: JLPTSectionType[] = [...(LEVEL_META[level]?.sections ?? []), 'mock'];
		// Clear localStorage
		for (const s of secs) {
			try { localStorage.removeItem(`jlpt_result_${level}_${s}`); } catch { /* ignore */ }
		}
		// Clear Supabase if logged in
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				await supabase.from('jlpt_results')
					.delete()
					.eq('user_id', user.id)
					.eq('level', level);
			}
		} catch { /* offline */ }
		// Update reactive state
		const updated = { ...results };
		for (const s of secs) delete updated[`${level}_${s}`];
		results = updated;
	}
</script>

<svelte:head>
	<title>{t('jlpt.title', $locale)} — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;min-height:100vh;padding:calc(32px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));"
>
	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;cursor:default;display:flex;align-items:center;gap:12px;"
	>
		{t('jlpt.title', $locale)}
	</h1>

	<p use:fadeUp={{ delay: 0.12, y: 12 }} style="font-size:16px;color:var(--fg-secondary);margin:0;">
		{t('jlpt.subtitle', $locale)}
	</p>

	<!-- Level chips -->
	<div
		use:fadeIn={{ delay: 0.18 }}
		class="hide-scrollbar"
		style="display:flex;gap:8px;margin-top:32px;margin-bottom:20px;overflow-x:auto;"
	>
		{#each levels as lv (lv)}
			<button
				class="filter-chip"
				class:active={activeLevel === lv}
				onclick={() => (activeLevel = lv)}
			>
				{lv}
			</button>
		{/each}
	</div>

	<!-- Progress indicator -->
	{#if completedCount(activeLevel) > 0}
		<p use:fadeIn={{ delay: 0.2 }} style="font-size:12px;color:var(--fg-tertiary);margin:0 0 14px;font-weight:600;">
			{completedCount(activeLevel)}/{totalAvailable(activeLevel)} {t('jlpt.sections_completed', $locale)}
		</p>
	{/if}


	<!-- Section rows -->
	<div class="list" use:staggerChildren={{ delay: 0.25, stagger: 0.07, y: 10 }}>
		{#each LEVEL_META[activeLevel]?.sections ?? [] as section (section)}
			{@const lbl = SECTION_LABELS[section]}
			{@const available = hasContent(activeLevel, section)}
			{@const res = getResult(activeLevel, section)}
			{@const qCount = questionCount(activeLevel, section)}
			{@const audioCount = section === 'listening' ? (AUDIO_FILES[activeLevel]?.length ?? 0) : 0}

			<button
				class="row"
				class:unavailable={!available}
				disabled={!available}
				onclick={() => {
					if (!available) return;
					openConfirm(`/jlpt/${activeLevel}/${section}`);
				}}
			>
				<div class="row-icon-jp jp">{SECTION_ICONS[section]}</div>

				<div class="row-body">
					<div class="row-top">
						<span class="row-title jp">{lbl.jp}</span>
						{#if $showRomaji}
							<span class="row-romaji">{lbl.romaji}</span>
						{/if}
						{#if !available}
							<span class="tag-soon">{t('jlpt.tagSoon', $locale)}</span>
						{/if}
					</div>
					<div class="row-sub">{t(`jlpt.${section}.desc`, $locale)}</div>
					<div class="row-meta-inline">
						{#if section === 'listening'}
							{t('jlpt.audioCount', $locale, { n: audioCount })}
						{:else}
							{t('jlpt.questionCount', $locale, { n: qCount })} · {lbl[$locale]}
						{/if}
					</div>
				</div>

				<div class="row-right">
					{#if res !== null}
						{#if section === 'listening'}
							<span class="score-badge pass">✓</span>
						{:else}
							<span class="score-badge" class:pass={res.pct >= 70} class:fail={res.pct < 70}>
								{res.pct}%
							</span>
						{/if}
					{/if}
					{#if available}
						<span class="row-arrow">→</span>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<!-- Completion row — same visual language as section rows -->
	{#if levelComplete(activeLevel)}
		{@const secs2 = LEVEL_META[activeLevel]?.sections ?? []}
		{@const scores2 = secs2.map(s => getResult(activeLevel, s)).filter(Boolean)}
		{@const avg2 = scores2.length ? Math.round(scores2.reduce((a, r) => a + (r?.pct ?? 0), 0) / scores2.length) : 0}
		{@const passed = mockPassed(activeLevel)}

		<div class="completion-row" use:fadeIn={{ delay: 0 }}>
			<div class="completion-row-icon">{passed ? '🏆' : '🎯'}</div>
			<div class="completion-row-body">
				<div class="completion-row-top">
					<span class="completion-row-title">
						{passed 
							? t('jlpt.mock.passed', $locale) 
							: t('jlpt.completed', $locale, { level: activeLevel })}
					</span>
				</div>
				<div class="completion-row-sub">
					{#if passed}
						{t('jlpt.ready', $locale)}
					{:else}
						{#if scores2.length > 0}{avg2}% {t('jlpt.average', $locale)} &middot; {/if}{t('jlpt.mock.desc', $locale)}
					{/if}
				</div>
			</div>
			<div class="completion-row-right">
				{#if passed}
					<button class="completion-cert-btn" onclick={() => goto(`/jlpt/certificate/${activeLevel}`)}>
						{t('jlpt.certificate', $locale)}
					</button>
				{:else}
					<button class="completion-cert-btn" onclick={() => goto(`/jlpt/${activeLevel}/mock`)}>
						{t('jlpt.mock.start', $locale)}
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<p style="font-size:11px;color:var(--fg-tertiary);text-align:center;margin-top:48px;">
		{t('jlpt.materials', $locale)}
	</p>
</div>

{#snippet confirmIcon()}
	<Icon icon={AlertCircleIcon} size={32} color="var(--hinomaru-red)" />
{/snippet}

<ResponsiveModal
	bind:open={showConfirmModal}
	title={t('exam.start_confirm_title', $locale) || 'Ready to start?'}
	description={t('exam.start_confirm', $locale)}
	icon={confirmIcon}
>
	{#snippet actions()}
		<button class="modal-btn-cancel" onclick={() => (showConfirmModal = false)}>{t('common.cancel', $locale)}</button>
		<button class="modal-btn-confirm" onclick={handleConfirm}>{t('exam.start_now', $locale)}</button>
	{/snippet}
</ResponsiveModal>

<style>
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

	/* Completion row — matches .row visual language */
	.completion-row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 0;
		border-top: 1px solid var(--ink-100);
	}
	.completion-row-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		background: rgba(212, 175, 55, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 15px;
		flex-shrink: 0;
		border: 1px solid rgba(212, 175, 55, 0.3);
	}
	.completion-row-body {
		flex: 1;
		min-width: 0;
	}
	.completion-row-top {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 3px;
	}
	.completion-row-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--fg-primary);
		letter-spacing: -0.01em;
	}
	.completion-row-sub {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}
	.completion-row-right {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}
	.completion-cert-btn {
		height: 34px;
		padding: 0 14px;
		border-radius: 999px;
		background: var(--hinomaru-red);
		color: #fff;
		border: none;
		font-family: inherit;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
		box-shadow: 0 3px 10px rgba(188,0,45,0.35);
	}
	@media (hover: hover) {
		.completion-cert-btn:hover {
			background: #a0002a;
			transform: translateY(-1px);
			box-shadow: 0 5px 14px rgba(188,0,45,0.45);
		}
	}
	.completion-cert-btn:active { transform: scale(0.95); }
	.completion-retry-btn {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background: none;
		color: var(--fg-tertiary);
		border: 1px solid var(--ink-200);
		font-size: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s;
		flex-shrink: 0;
	}
	@media (hover: hover) {
		.completion-retry-btn:hover {
			background: var(--ink-100);
			color: var(--fg-primary);
			border-color: var(--ink-300);
		}
	}
	.completion-retry-btn:active { transform: scale(0.92); }


	/* List */
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
		background: none;
		border-left: none;
		border-right: none;
		border-top: none;
		border-radius: 4px;
		color: inherit;
		font-family: inherit;
		text-align: left;
		width: 100%;
		cursor: pointer;
		transition: background 150ms ease;
		-webkit-tap-highlight-color: transparent;
	}
	.row:first-child {
		border-top: 1px solid var(--ink-100);
	}
	.row.unavailable {
		opacity: 0.45;
		cursor: default;
	}

	@media (hover: hover) {
		.row:not(.unavailable):hover .row-title {
			color: var(--hinomaru-red);
		}
		.row:not(.unavailable):hover .row-arrow {
			color: var(--hinomaru-red);
			transform: translateX(3px);
		}
	}
	.row:not(.unavailable):active .row-title {
		color: var(--hinomaru-red);
	}
	.row:not(.unavailable):active .row-arrow {
		color: var(--hinomaru-red);
		transform: scale(0.9) translateX(2px);
	}

	.row-icon-jp {
		font-size: 11px;
		font-weight: 800;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		min-width: 28px;
		height: 28px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		flex-shrink: 0;
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
	.row-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
		transition: color 150ms;
	}
	.row-romaji {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-style: italic;
	}
	.tag-soon {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg-tertiary);
		background: var(--ink-100);
		padding: 2px 7px;
		border-radius: 99px;
	}
	.row-sub {
		font-size: 13px;
		color: var(--fg-secondary);
		margin-bottom: 3px;
	}
	.row-meta-inline {
		font-size: 12px;
		color: var(--fg-tertiary);
	}

	.row-right {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-top: 4px;
		flex-shrink: 0;
	}
	.score-badge {
		font-size: 12px;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 99px;
	}
	.score-badge.pass {
		background: var(--success-wash);
		color: var(--success);
	}
	.score-badge.fail {
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
	}

	.row-arrow {
		font-size: 16px;
		color: var(--fg-tertiary);
		transition:
			color 150ms,
			transform 150ms;
	}

	.jp {
		font-family: var(--font-jp);
	}

	/* Modal handled by ResponsiveModal */
</style>
