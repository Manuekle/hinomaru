<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { fadeUp, fadeIn, staggerChildren } from '$lib/motion';
	import { getTest, LEVEL_META, SECTION_LABELS, AUDIO_FILES } from '$lib/data/jlpt/index';
	import type { JLPTLevel, JLPTSectionType } from '$lib/data/jlpt/index';
	import { showRomaji } from '$lib/stores/settings';
	import Icon from '$lib/Icon.svelte';
	import { DocumentValidationIcon, AlertCircleIcon } from '@hugeicons/core-free-icons';
	import { fade } from 'svelte/transition';

	const levels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
	let activeLevel = $state<JLPTLevel>('N5');

	interface SectionResult {
		score: number;
		total: number;
		pct: number;
		date: string;
	}
	let results = $state<Partial<Record<string, SectionResult>>>({});

	onMount(() => {
		const r: Partial<Record<string, SectionResult>> = {};
		for (const lv of levels) {
			for (const sec of ['vocabulary', 'grammar', 'listening'] as JLPTSectionType[]) {
				const raw = localStorage.getItem(`jlpt_result_${lv}_${sec}`);
				if (raw) {
					try {
						r[`${lv}_${sec}`] = JSON.parse(raw);
					} catch {
						// Ignore parse errors
					}
				}
			}
		}
		results = r;
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
		return (['vocabulary', 'grammar'] as JLPTSectionType[]).every(
			(sec) => getResult(level, sec) !== null
		);
	}

	const SECTION_ICONS: Record<JLPTSectionType, string> = {
		vocabulary: '語',
		grammar: '文',
		listening: '聴'
	};

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
</script>

<svelte:head>
	<title>{t('jlpt.title', $locale)} — Hinomaru</title>
</svelte:head>

<div
	style="max-width:720px;margin:0 auto;min-height:100vh;padding:calc(32px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));"
>
	<h1
		use:fadeUp={{ delay: 0.06, y: 16 }}
		style="font-size:40px;font-weight:700;letter-spacing:-0.02em;margin:0 0 8px;"
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

	<!-- Certificate banner if level complete -->
	{#if levelComplete(activeLevel)}
		<button
			class="cert-banner"
			use:fadeIn={{ delay: 0 }}
			onclick={() => goto(`/jlpt/certificate/${activeLevel}`)}
		>
			<Icon icon={DocumentValidationIcon} size={18} strokeWidth={2} color="currentColor" />
			<span>{t('jlpt.certBanner', $locale, { level: activeLevel })}</span>
			<span class="cert-arrow">→</span>
		</button>
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
							{t('jlpt.questionCount', $locale, { n: qCount })} · {lbl.es}
						{/if}
					</div>
				</div>

				<div class="row-right">
					{#if res !== null}
						<span class="score-badge" class:pass={res.pct >= 70} class:fail={res.pct < 70}>
							{res.pct}%
						</span>
					{/if}
					{#if available}
						<span class="row-arrow">→</span>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<p style="font-size:11px;color:var(--fg-tertiary);text-align:center;margin-top:48px;">
		{t('jlpt.materials', $locale)}
	</p>
</div>

{#if showConfirmModal}
	<div class="modal-overlay" transition:fade={{ duration: 200 }}>
		<div class="modal-content" use:fadeUp={{ delay: 0, y: 20 }}>
			<div class="modal-icon"><Icon icon={AlertCircleIcon} size={32} color="var(--hinomaru-red)" /></div>
			<h3 class="modal-title">{t('exam.start_confirm_title', $locale) || 'Ready to start?'}</h3>
			<p class="modal-text">{t('exam.start_confirm', $locale)}</p>
			<div class="modal-actions">
				<button class="modal-btn confirm" onclick={handleConfirm}>{t('exam.start', $locale)}</button>
				<button class="modal-btn cancel" onclick={() => (showConfirmModal = false)}>{t('exam.exit_cancel', $locale)}</button>
			</div>
		</div>
	</div>
{/if}

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

	/* Certificate banner */
	.cert-banner {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 12px 16px;
		margin-bottom: 12px;
		background: var(--sumi);
		color: var(--washi);
		border: none;
		border-radius: 14px;
		font-family: inherit;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
		text-align: left;
	}
	.cert-banner:hover {
		opacity: 0.88;
	}
	.cert-arrow {
		margin-left: auto;
		font-size: 16px;
	}

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

	/* Modal Premium */
	.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
	.modal-content { background: var(--paper); border-radius: 32px; padding: 32px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.2); border: 1px solid var(--ink-100); }
	.modal-icon { width: 64px; height: 64px; background: var(--hinomaru-red-wash); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
	.modal-title { font-size: 20px; font-weight: 800; color: var(--sumi); margin-bottom: 12px; }
	.modal-text { font-size: 15px; color: var(--fg-secondary); line-height: 1.5; margin-bottom: 28px; }
	.modal-actions { display: flex; flex-direction: column; gap: 10px; }
	.modal-btn { padding: 16px; border-radius: 16px; font-size: 15px; font-weight: 700; transition: all 0.2s; cursor: pointer; border: none; }
	.modal-btn.confirm { background: var(--hinomaru-red); color: white; }
	.modal-btn.confirm:hover { background: #a30027; }
	.modal-btn.cancel { background: var(--ink-100); color: var(--sumi); }
	.modal-btn.cancel:hover { background: var(--ink-200); }
</style>
