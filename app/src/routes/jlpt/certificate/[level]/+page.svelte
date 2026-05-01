<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fadeUp } from '$lib/motion';
	import { page } from '$app/stores';
	import Icon from '$lib/Icon.svelte';
	import { ArrowLeft02Icon, PrinterIcon, Share01Icon } from '@hugeicons/core-free-icons';
	import type { JLPTLevel, JLPTSectionType } from '$lib/data/jlpt/index';
	import { LEVEL_META } from '$lib/data/jlpt/index';
	import { locale } from '$lib/stores/locale';
	import { t } from '$lib/i18n';
	import { createClient } from '$lib/supabase';

	const supabase = createClient();

	const level = $derived($page.params.level as JLPTLevel);
	const meta = $derived(LEVEL_META[level]);

	interface SectionResult { score: number; total: number; pct: number; date: string }

	let results = $state<Record<string, SectionResult>>({});
	let studentName = $state('');
	let issueDate = $state('');

	const JLPT_STEPS = $derived([
		{
			step: '1',
			title: t('jlpt.certificate.step1.title', $locale),
			desc: t('jlpt.certificate.step1.desc', $locale),
			link: 'https://www.jlpt.jp/e/application/',
			linkLabel: t('jlpt.certificate.step1.link_label', $locale)
		},
		{
			step: '2',
			title: t('jlpt.certificate.step2.title', $locale),
			desc: t('jlpt.certificate.step2.desc', $locale),
			link: 'https://www.jlpt.jp/e/application/overseas_list.html',
			linkLabel: t('jlpt.certificate.step2.link_label', $locale)
		},
		{
			step: '3',
			title: t('jlpt.certificate.step3.title', $locale),
			desc: t('jlpt.certificate.step3.desc', $locale)
		},
		{
			step: '4',
			title: t('jlpt.certificate.step4.title', $locale),
			desc: t('jlpt.certificate.step4.desc', $locale, { level, duration: level === 'N5' || level === 'N4' ? '105' : level === 'N3' ? '140' : level === 'N2' ? '155' : '170' })
		},
		{
			step: '5',
			title: t('jlpt.certificate.step5.title', $locale),
			desc: t('jlpt.certificate.step5.desc', $locale)
		}
	]);

	const LEVEL_INFO = $derived({
		N5: { passing: t('jlpt.certificate.info.passing_n5', $locale), sections: t('jlpt.certificate.info.sections_std', $locale), duration: t('jlpt.certificate.info.duration_n5', $locale) },
		N4: { passing: t('jlpt.certificate.info.passing_n4', $locale), sections: t('jlpt.certificate.info.sections_std', $locale), duration: t('jlpt.certificate.info.duration_n4', $locale) },
		N3: { passing: t('jlpt.certificate.info.passing_n3', $locale), sections: t('jlpt.certificate.info.sections_std', $locale), duration: t('jlpt.certificate.info.duration_n3', $locale) },
		N2: { passing: t('jlpt.certificate.info.passing_n2', $locale), sections: t('jlpt.certificate.info.sections_std', $locale), duration: t('jlpt.certificate.info.duration_n2', $locale) },
		N1: { passing: t('jlpt.certificate.info.passing_n1', $locale), sections: t('jlpt.certificate.info.sections_std', $locale), duration: t('jlpt.certificate.info.duration_n1', $locale) }
	});
	const info = $derived(LEVEL_INFO[level]);

	const sections: JLPTSectionType[] = ['vocabulary', 'grammar', 'listening'];
	const SECTION_NAMES: Record<JLPTSectionType, string> = {
		vocabulary: 'Vocabulario',
		grammar: 'Gramática',
		listening: 'Escucha',
		mock: 'Simulacro'
	};

	const mockResult = $derived(results[`${level}_mock`]);
	const totalScore = $derived(() => mockResult ? mockResult.pct : 0);
	const allDone = $derived(!!mockResult);

	function formatDate(iso: string): string {
		try {
			return new Date(iso).toLocaleDateString($locale === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		} catch { return iso; }
	}

	function printCert() {
		window.print();
	}

	async function shareCert() {
		try {
			await navigator.share({ title: `Certificado JLPT ${level}`, text: `Completé la práctica JLPT ${level} en Hinomaru con ${totalScore()}% de acierto.` });
		} catch {
			// Ignore share errors
		}
	}

	function updateIssueDate(r: Record<string, SectionResult>) {
		const res = r[`${level}_mock`];
		issueDate = formatDate(res ? res.date : new Date().toISOString());
	}

	onMount(async () => {
		// Load localStorage first for instant display
		const r: Record<string, SectionResult> = {};
		for (const lv of ['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]) {
			const raw = localStorage.getItem(`jlpt_result_${lv}_mock`);
			if (raw) {
				try { r[`${lv}_mock`] = JSON.parse(raw); } catch { /* ignore */ }
			}
		}
		results = r;
		updateIssueDate(r);

		// Sync from Supabase + load user name
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (user) {
				// Get name from user metadata (Google, GitHub, email signup)
				const meta = user.user_metadata;
				studentName = meta?.full_name ?? meta?.name ?? meta?.display_name ?? user.email?.split('@')[0] ?? '';

				const { data: rows } = await supabase
					.from('jlpt_results')
					.select('level, section, score, total, pct, completed_at')
					.eq('user_id', user.id);
				if (rows?.length) {
					const synced = { ...r };
					for (const row of rows) {
						synced[`${row.level}_${row.section}`] = {
							score: row.score, total: row.total, pct: row.pct, date: row.completed_at
						};
					}
					results = synced;
					updateIssueDate(synced);
				}
			}
		} catch { /* offline */ }
	});
</script>

<svelte:head>
	<title>Certificado {level} — JLPT — Hinomaru</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet" />
	<link href="https://fonts.cdnfonts.com/css/ocean-trace-personal-use" rel="stylesheet" />
</svelte:head>

<div class="cert-page" use:fadeUp={{ delay: 0, y: 12 }}>

	<!-- ── Back Link ── -->
	<div use:fadeUp={{ delay: 0, y: 10 }} class="no-print">
		<a href="/jlpt" class="back-link">{t('jlpt.certificate.back', $locale)}</a>
	</div>

	<!-- ── Certificate ── -->
	<div class="cert-wrap">
		<div class="certificate">
			<div class="cert-inner">
				<!-- Header -->
				<div class="cert-header">
					<div class="cert-kamon" aria-hidden="true">❀</div>
					<div class="cert-brand-jp">日本語能力</div>
					<div class="cert-brand">Hinomaru</div>
					<div class="cert-subtitle">Japanese Learning Platform</div>
				</div>

				<p class="cert-presents">{t('jlpt.certificate.presents', $locale)}</p>

				<div class="name-wrap">
					<div class="cert-name-signed">
						{studentName || 'Hinomaru Student'}
					</div>
				</div>

				<p class="cert-body">
					{t('jlpt.certificate.body', $locale)}
				</p>

				<div class="level-badge">
					<span class="level-badge-n">{level}</span>
					<span class="level-badge-sep">·</span>
					<span class="level-badge-title">JLPT {level}</span>
				</div>

				<!-- Minimalist Scores (Grid) -->
				<div class="cert-scores-grid">
					{#each sections as sec (sec)}
						{@const r = results[`${level}_${sec}`]}
						<div class="minimal-score">
							<span class="m-score-label">{t(`jlpt.sections.${sec}`, $locale)}</span>
							<span class="m-score-pct" class:pass={r && r.pct >= 70} class:fail={r && r.pct < 70}>
								{r ? `${r.pct}%` : '—'}
							</span>
						</div>
					{/each}
					<div class="minimal-score total">
						<span class="m-score-label">Total</span>
						<span class="m-score-pct" class:pass={totalScore() >= 70} class:fail={totalScore() < 70}>{totalScore()}%</span>
					</div>
				</div>

				<!-- Footer seal + date -->
				<div class="cert-footer">
					<div class="cert-date-wrap">
						<div class="cert-date">{t('jlpt.certificate.issued', $locale, { date: issueDate })}</div>
					</div>
					<div class="seal-wrap">
						<div class="seal-ring">
							<div class="seal-inner">日</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Descargar certificado link -->
		<div class="cert-download-wrap no-print">
			<button class="download-cert-link" onclick={printCert}>
				{t('jlpt.certificate.download', $locale)}
			</button>
		</div>
	</div>

	<!-- ── Instrucciones para inscripción ── -->
	<div class="instructions no-print">
		<h2 class="instr-title">{t('jlpt.certificate.how_to_enroll', $locale)}</h2>
		<p class="instr-intro">
			{t('jlpt.certificate.enroll_desc', $locale)}
		</p>

		<div class="level-exam-info">
			<div class="exam-info-row">
				<span class="ei-label">{t('jlpt.certificate.level_label', $locale)}</span>
				<span class="ei-val">{level}</span>
			</div>
			<div class="exam-info-row">
				<span class="ei-label">{t('jlpt.certificate.passing_score', $locale)}</span>
				<span class="ei-val">{info.passing}</span>
			</div>
			<div class="exam-info-row">
				<span class="ei-label">{t('jlpt.certificate.sections_label', $locale)}</span>
				<span class="ei-val">{info.sections}</span>
			</div>
			<div class="exam-info-row">
				<span class="ei-label">{t('jlpt.certificate.duration_label', $locale)}</span>
				<span class="ei-val">{info.duration}</span>
			</div>
		</div>

		<div class="steps-list">
			{#each JLPT_STEPS as step (step.step)}
				<div class="step-card">
					<div class="step-num">{step.step}</div>
					<div class="step-body">
						<div class="step-title">{step.title}</div>
						<p class="step-desc">{step.desc}</p>
						{#if step.link}
							<a href={step.link} target="_blank" rel="noopener noreferrer" class="step-link">
								{step.linkLabel} →
							</a>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<div class="disclaimer">
			{t('jlpt.certificate.disclaimer', $locale)}
		</div>
	</div>

</div>

<style>
	/* ── Page Wrapper ── */
	.cert-page {
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
		margin-bottom: 24px;
	}
	@media (hover: hover) {
		.back-link:hover {
			color: var(--sumi);
		}
	}

	/* ── Certificate shell ── */
	.cert-wrap { margin-bottom: 40px; display: flex; flex-direction: column; align-items: center; padding: 0 16px; }

	.cert-download-wrap {
		display: flex;
		justify-content: center;
		margin-top: 24px;
	}
	.download-cert-link {
		background: none; border: none;
		font-family: inherit; font-size: 14px; font-weight: 600;
		color: var(--fg-secondary);
		text-decoration: underline;
		text-underline-offset: 4px;
		cursor: pointer;
		transition: color 0.15s;
		padding: 8px 16px;
	}
	@media (hover: hover) { .download-cert-link:hover { color: var(--sumi); } }

	.certificate {
		position: relative;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		box-shadow: 0 4px 20px rgba(0,0,0,0.04);
		overflow: hidden;
		width: 100%;
	}
	:global([data-theme='dark']) .certificate {
		box-shadow: 0 4px 20px rgba(0,0,0,0.2);
	}

	/* ── Inner padding ── */
	.cert-inner {
		position: relative;
		z-index: 1;
		padding: 40px 24px 32px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 520px;
	}

	/* ── Kamon (cherry blossom ornament) ── */
	.cert-kamon {
		font-size: 20px;
		color: var(--hinomaru-red);
		opacity: 0.6;
		margin-bottom: 12px;
	}

	/* ── Header ── */
	.cert-header { margin-bottom: 32px; }
	.cert-brand-jp {
		font-family: var(--font-jp);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.25em;
		color: var(--hinomaru-red);
		margin-bottom: 4px;
	}
	.cert-brand {
		font-size: 22px;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--sumi);
	}
	.cert-subtitle {
		font-size: 9px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-tertiary);
		margin-top: 2px;
	}

	/* ── Cert text ── */
	.cert-presents {
		font-size: 13px;
		color: var(--fg-secondary);
		margin: 0 0 12px;
		letter-spacing: 0.02em;
	}

	/* ── Name / Signature ── */
	.name-wrap { margin-bottom: 16px; }

	.cert-name-signed {
		font-family: 'Ocean Trace-Personal use', sans-serif;
		font-size: 56px;
		font-weight: 400;
		color: var(--sumi);
		line-height: 0.9;
		padding: 16px 8px;
		white-space: nowrap; /* Prevent signature from wrapping awkwardly */
	}

	/* ── Body text ── */
	.cert-body {
		font-size: 13px;
		color: var(--fg-secondary);
		margin: 16px 0 20px;
		letter-spacing: 0.02em;
	}

	/* ── Level badge ── */
	.level-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 32px;
	}
	.level-badge-n {
		font-size: 18px;
		font-weight: 800;
		color: var(--sumi);
		line-height: 1;
	}
	.level-badge-sep { color: var(--ink-200); font-size: 16px; }
	.level-badge-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--fg-secondary);
	}

	/* ── Minimalist Scores (Grid) ── */
	.cert-scores-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		row-gap: 24px;
		column-gap: 16px;
		margin: 0 auto 32px;
		width: 100%;
		max-width: 320px;
	}
	.minimal-score {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.m-score-label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--fg-tertiary);
		font-weight: 700;
	}
	.m-score-pct {
		font-size: 18px;
		font-weight: 700;
		color: var(--sumi);
	}
	.m-score-pct.pass { color: var(--success); }
	.m-score-pct.fail { color: var(--hinomaru-red); }
	.minimal-score.total .m-score-pct {
		font-size: 22px;
	}

	/* ── Footer ── */
	.cert-footer {
		margin-top: auto;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 32px;
	}
	.cert-date-wrap {
		text-align: left;
	}
	.cert-date {
		font-size: 12px;
		color: var(--fg-tertiary);
		font-weight: 500;
	}
	.seal-wrap { flex-shrink: 0; }
	.seal-ring {
		width: 44px; height: 44px;
		border-radius: 50%;
		border: 1.5px solid var(--hinomaru-red);
		display: flex; align-items: center; justify-content: center;
		background: rgba(188, 0, 45, 0.05);
	}
	.seal-inner {
		font-family: var(--font-jp);
		font-size: 16px; font-weight: 700;
		color: var(--hinomaru-red);
	}

	/* ── Instructions ── */
	.instructions { max-width: 680px; margin: 0 auto; }
	.instr-title { font-size: 22px; font-weight: 700; margin: 0 0 8px; }
	.instr-intro { font-size: 14px; color: var(--fg-secondary); margin: 0 0 20px; line-height: 1.6; }
	.level-exam-info {
		background: var(--bg-surface); border: 1px solid var(--ink-200);
		border-radius: 16px; padding: 16px 20px;
		margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px;
	}
	.exam-info-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
	.ei-label { font-size: 13px; color: var(--fg-secondary); }
	.ei-val { font-size: 13px; font-weight: 600; color: var(--sumi); text-align: right; }
	.steps-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
	.step-card {
		display: flex; gap: 16px;
		background: var(--bg-surface); border: 1px solid var(--ink-200);
		border-radius: 16px; padding: 16px 18px;
	}
	.step-num {
		width: 28px; height: 28px; border-radius: 50%;
		background: var(--sumi); color: var(--washi);
		font-size: 13px; font-weight: 700;
		display: flex; align-items: center; justify-content: center; flex-shrink: 0;
	}
	.step-body { flex: 1; }
	.step-title { font-size: 15px; font-weight: 700; color: var(--sumi); margin-bottom: 4px; }
	.step-desc { font-size: 13px; color: var(--fg-secondary); margin: 0 0 6px; line-height: 1.6; }
	.step-link { font-size: 13px; font-weight: 600; color: var(--hinomaru-red); text-decoration: none; }
	@media (hover: hover) { .step-link:hover { text-decoration: underline; } }
	.disclaimer {
		font-size: 12px; color: var(--fg-tertiary);
		background: var(--ink-50); border: 1px solid var(--ink-200);
		border-radius: 12px; padding: 12px 16px; line-height: 1.6;
	}

	/* ── Print (PDF Export) ── */
	.print-only { display: none; }
	@media print {
		@page { size: portrait; margin: 15mm; }
		.no-print, .dock-bar, .app-bar { display: none !important; }
		.print-only { display: block; }
		
		body, html, .session-layout, .cert-page, .app-container { 
			background: white !important; 
			padding: 0 !important; 
			margin: 0 !important; 
		}
		
		/* Force light mode variables for the certificate to ensure crisp PDF */
		.certificate {
			--bg-surface: #ffffff;
			--sumi: #1a1a1a;
			--fg-secondary: #555555;
			--fg-tertiary: #888888;
			--ink-200: #e5e5e5;
			--ink-50: #fafafa;
			--hinomaru-red: #bc002d;
			--success: #34c759;
			
			box-shadow: none !important;
			border: 2px solid var(--ink-200) !important;
			border-radius: 0 !important;
			width: 100% !important;
			max-width: 100% !important;
			background: white !important;
			break-inside: avoid;
		}

		.cert-inner {
			padding: 60px 40px !important;
			min-height: auto !important;
		}

		/* Scale up typography for print */
		.cert-brand { font-size: 28px !important; }
		.cert-name-signed { font-size: 72px !important; }
		.level-badge-n { font-size: 24px !important; }
		.cert-scores-grid { transform: scale(1.1); transform-origin: top center; margin-bottom: 60px !important; }
	}
</style>
