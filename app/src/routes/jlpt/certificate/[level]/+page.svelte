<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fadeUp } from '$lib/motion';
	import { page } from '$app/stores';
	import Icon from '$lib/Icon.svelte';
	import { ArrowLeft02Icon, PrinterIcon, Share01Icon } from '@hugeicons/core-free-icons';
	import type { JLPTLevel, JLPTSectionType } from '$lib/data/jlpt/index';
	import { LEVEL_META } from '$lib/data/jlpt/index';

	const level = $derived($page.params.level as JLPTLevel);
	const meta = $derived(LEVEL_META[level]);

	interface SectionResult { score: number; total: number; pct: number; date: string }

	let results = $state<Record<string, SectionResult>>({});
	let studentName = $state('');
	let issueDate = $state('');

	const JLPT_STEPS = [
		{
			step: '1',
			title: 'Registro oficial',
			desc: 'Inscríbete en el sitio oficial de JLPT. Los períodos de inscripción son generalmente en mayo (examen de julio) y septiembre (examen de diciembre).',
			link: 'https://www.jlpt.jp/e/application/',
			linkLabel: 'jlpt.jp/e/application'
		},
		{
			step: '2',
			title: 'Elige tu centro de examen',
			desc: 'El examen se realiza en más de 90 países. En Latinoamérica hay centros en México, Argentina, Brasil, Chile, Colombia, Perú y más.',
			link: 'https://www.jlpt.jp/e/application/overseas_list.html',
			linkLabel: 'Centros en el mundo'
		},
		{
			step: '3',
			title: 'Prepara los documentos',
			desc: 'Necesitarás: fotografía reciente (4×3cm), identificación oficial vigente y el comprobante de pago de la tarifa de inscripción.'
		},
		{
			step: '4',
			title: 'Día del examen',
			desc: `El examen ${level} dura aproximadamente ${level === 'N5' || level === 'N4' ? '105' : level === 'N3' ? '140' : '170'} minutos. Llega al menos 30 minutos antes. No se permite material de estudio ni dispositivos electrónicos.`
		},
		{
			step: '5',
			title: 'Resultados',
			desc: 'Los resultados se publican aproximadamente 2 meses después del examen. Recibirás un certificado oficial si apruebas. Los resultados individuales por sección se envían a todos los participantes.'
		}
	];

	const LEVEL_INFO: Record<JLPTLevel, { passing: string; sections: string; duration: string }> = {
		N5: { passing: '80/180 pts totales', sections: 'Vocabulario, Gramática/Lectura, Escucha', duration: '105 min' },
		N4: { passing: '90/180 pts totales', sections: 'Vocabulario, Gramática/Lectura, Escucha', duration: '105 min' },
		N3: { passing: '95/180 pts totales', sections: 'Vocabulario, Gramática/Lectura, Escucha', duration: '140 min' },
		N2: { passing: '90/180 pts totales', sections: 'Vocabulario, Gramática/Lectura, Escucha', duration: '155 min' },
		N1: { passing: '100/180 pts totales', sections: 'Vocabulario, Gramática/Lectura, Escucha', duration: '170 min' }
	};
	const info = $derived(LEVEL_INFO[level]);

	const sections: JLPTSectionType[] = ['vocabulary', 'grammar'];
	const SECTION_NAMES: Record<JLPTSectionType, string> = {
		vocabulary: 'Vocabulario',
		grammar: 'Gramática',
		listening: 'Escucha'
	};

	const totalScore = $derived(() => {
		let sum = 0; let max = 0;
		for (const sec of sections) {
			const r = results[`${level}_${sec}`];
			if (r) { sum += r.score; max += r.total; }
		}
		return max > 0 ? Math.round((sum / max) * 100) : 0;
	});

	const allDone = $derived(sections.every((sec) => !!results[`${level}_${sec}`]));

	function formatDate(iso: string): string {
		try {
			return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
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

	onMount(() => {
		const r: Record<string, SectionResult> = {};
		for (const lv of ['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]) {
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

		// Issue date: most recent exam date
		const dates = sections.map((s) => results[`${level}_${s}`]?.date).filter(Boolean) as string[];
		if (dates.length) {
			issueDate = formatDate(dates.sort().reverse()[0]);
		} else {
			issueDate = formatDate(new Date().toISOString());
		}
	});
</script>

<svelte:head>
	<title>Certificado {level} — JLPT — Hinomaru</title>
</svelte:head>

<div class="cert-page" use:fadeUp={{ delay: 0, y: 12 }}>

	<!-- ── Toolbar (no-print) ── -->
	<div class="toolbar no-print">
		<button class="back-btn" onclick={() => goto('/jlpt')}>
			<Icon icon={ArrowLeft02Icon} size={20} color="currentColor" strokeWidth={2} />
			JLPT
		</button>
		<div class="toolbar-actions">
			{#if 'share' in navigator}
				<button class="tool-btn" onclick={shareCert}>
					<Icon icon={Share01Icon} size={18} color="currentColor" strokeWidth={2} />
					Compartir
				</button>
			{/if}
			<button class="tool-btn primary" onclick={printCert}>
				<Icon icon={PrinterIcon} size={18} color="currentColor" strokeWidth={2} />
				Imprimir
			</button>
		</div>
	</div>

	<!-- ── Certificate ── -->
	<div class="cert-wrap">
		<div class="certificate">
			<div class="cert-border">
				<!-- Header -->
				<div class="cert-header">
					<div class="hinomaru-mark" aria-hidden="true"></div>
					<div class="cert-brand">Hinomaru</div>
					<div class="cert-subtitle">Japanese Learning Platform</div>
				</div>

				<div class="cert-divider"></div>

				<p class="cert-presents">certifica que</p>

				<!-- Name -->
				<div class="name-field no-print">
					<input
						class="name-input"
						placeholder="Escribe tu nombre aquí"
						bind:value={studentName}
						maxlength={60}
					/>
				</div>
				<div class="cert-name print-only">{studentName || 'Nombre del estudiante'}</div>

				<p class="cert-body">
					ha completado satisfactoriamente la práctica oficial del
				</p>

				<div class="level-display">
					<div class="level-circle">{level}</div>
					<div class="level-info">
						<div class="level-title">JLPT {level}</div>
						<div class="level-sub">{meta?.desc_es}</div>
					</div>
				</div>

				<!-- Scores -->
				<div class="scores-row">
					{#each sections as sec (sec)}
						{@const r = results[`${level}_${sec}`]}
						<div class="score-item">
							<span class="score-val" class:pass={r && r.pct >= 70} class:fail={r && r.pct < 70}>
								{r ? `${r.pct}%` : '—'}
							</span>
							<span class="score-sec">{SECTION_NAMES[sec]}</span>
							{#if r}
								<span class="score-frac">{r.score}/{r.total}</span>
							{/if}
						</div>
					{/each}
					<div class="score-item total-item">
						<span class="score-val total-val">{totalScore()}%</span>
						<span class="score-sec">Total</span>
					</div>
				</div>

				<div class="cert-divider"></div>

				<div class="cert-footer">
					<div class="cert-seal">
						<div class="seal-circle">日</div>
					</div>
					<div class="cert-date">Emitido el {issueDate}</div>
				</div>
			</div>
		</div>
	</div>

	<!-- ── Instrucciones para inscripción ── -->
	<div class="instructions no-print">
		<h2 class="instr-title">¿Cómo inscribirte al JLPT oficial?</h2>
		<p class="instr-intro">
			Este certificado es de práctica. Para obtener la certificación oficial de la Japan Foundation,
			debes registrarte y presentar el examen oficial. Aquí te explicamos cómo:
		</p>

		<div class="level-exam-info">
			<div class="exam-info-row">
				<span class="ei-label">Nivel</span>
				<span class="ei-val">{level}</span>
			</div>
			<div class="exam-info-row">
				<span class="ei-label">Puntaje mínimo aprobatorio</span>
				<span class="ei-val">{info.passing}</span>
			</div>
			<div class="exam-info-row">
				<span class="ei-label">Secciones</span>
				<span class="ei-val">{info.sections}</span>
			</div>
			<div class="exam-info-row">
				<span class="ei-label">Duración</span>
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
			<strong>Nota:</strong> Las fechas de inscripción y los precios varían por país.
			Verifica siempre en el sitio oficial de JLPT o con la institución organizadora en tu país.
			Hinomaru no tiene relación oficial con la Japan Foundation ni con JEES.
		</div>
	</div>

</div>

<style>
	.cert-page {
		min-height: 100vh;
		background: var(--paper);
		padding: calc(32px + env(safe-area-inset-top)) 24px calc(140px + env(safe-area-inset-bottom));
		max-width: 720px;
		margin: 0 auto;
	}

	/* ── Toolbar ── */
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
	}
	.back-btn {
		display: flex; align-items: center; gap: 6px;
		background: none; border: none;
		font-family: inherit; font-size: 14px; font-weight: 600;
		color: var(--fg-secondary); cursor: pointer;
		padding: 6px 0;
	}
	@media (hover: hover) { .back-btn:hover { color: var(--sumi); } }
	.toolbar-actions { display: flex; gap: 8px; }
	.tool-btn {
		display: flex; align-items: center; gap: 6px;
		padding: 8px 14px;
		border-radius: 10px;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		font-family: inherit; font-size: 13px; font-weight: 600;
		color: var(--fg-primary); cursor: pointer;
		transition: all 0.15s;
	}
	.tool-btn.primary {
		background: var(--sumi);
		border-color: var(--sumi);
		color: var(--washi);
	}
	@media (hover: hover) {
		.tool-btn:hover { border-color: var(--ink-400); background: var(--ink-50); }
		.tool-btn.primary:hover { background: var(--ink-800, #333); }
	}

	/* ── Certificate ── */
	.cert-wrap {
		margin-bottom: 40px;
	}
	.certificate {
		background: var(--washi);
		border-radius: 20px;
		box-shadow: 0 4px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);
		overflow: hidden;
	}
	.cert-border {
		border: 6px solid transparent;
		background: linear-gradient(var(--washi), var(--washi)) padding-box,
			linear-gradient(135deg, #bc002d 0%, #1a1a1a 50%, #bc002d 100%) border-box;
		padding: 32px 28px 24px;
		text-align: center;
	}

	.cert-header {
		margin-bottom: 20px;
	}
	.hinomaru-mark {
		width: 44px; height: 44px;
		border-radius: 50%;
		background: var(--hinomaru-red);
		margin: 0 auto 8px;
	}
	.cert-brand {
		font-size: 22px; font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--sumi);
	}
	.cert-subtitle {
		font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
		color: var(--fg-tertiary); margin-top: 2px;
	}

	.cert-divider {
		height: 1px;
		background: linear-gradient(to right, transparent, var(--ink-200), transparent);
		margin: 18px 0;
	}

	.cert-presents {
		font-size: 13px; color: var(--fg-secondary);
		margin: 0 0 12px; letter-spacing: 0.04em;
	}

	.name-field { margin-bottom: 8px; }
	.name-input {
		width: 100%; max-width: 400px;
		font-family: inherit; font-size: 22px; font-weight: 700;
		text-align: center;
		border: none; border-bottom: 2px solid var(--ink-200);
		background: transparent;
		color: var(--sumi);
		padding: 4px 8px;
		outline: none;
		transition: border-color 0.15s;
	}
	.name-input:focus { border-color: var(--sumi); }
	.name-input::placeholder { color: var(--ink-300); font-weight: 400; font-size: 16px; }

	.cert-name { font-size: 24px; font-weight: 700; color: var(--sumi); margin-bottom: 8px; }

	.cert-body {
		font-size: 14px; color: var(--fg-secondary);
		margin: 0 0 20px;
	}

	.level-display {
		display: inline-flex; align-items: center; gap: 16px;
		background: var(--paper);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 14px 24px;
		margin-bottom: 24px;
		text-align: left;
	}
	.level-circle {
		width: 52px; height: 52px;
		border-radius: 50%;
		background: var(--sumi);
		color: var(--washi);
		font-size: 18px; font-weight: 700;
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0;
	}
	.level-title { font-size: 18px; font-weight: 700; color: var(--sumi); }
	.level-sub { font-size: 12px; color: var(--fg-secondary); margin-top: 2px; }

	.scores-row {
		display: flex; justify-content: center; gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 20px;
	}
	.score-item {
		display: flex; flex-direction: column; align-items: center; gap: 2px;
		min-width: 72px;
		padding: 10px 12px;
		background: var(--paper);
		border: 1px solid var(--ink-200);
		border-radius: 12px;
	}
	.score-val {
		font-size: 20px; font-weight: 700;
		color: var(--sumi); line-height: 1;
	}
	.score-val.pass { color: var(--success); }
	.score-val.fail { color: var(--hinomaru-red); }
	.score-sec { font-size: 11px; color: var(--fg-tertiary); font-weight: 600; }
	.score-frac { font-size: 10px; color: var(--fg-tertiary); }
	.total-item { border-color: var(--sumi); background: var(--ink-50); }
	.total-val { font-size: 22px; color: var(--sumi); }

	.cert-footer {
		display: flex; align-items: center; justify-content: center; gap: 16px;
	}
	.seal-circle {
		width: 48px; height: 48px;
		border-radius: 50%;
		border: 2.5px solid var(--hinomaru-red);
		color: var(--hinomaru-red);
		font-size: 20px; font-weight: 700;
		font-family: var(--font-jp);
		display: flex; align-items: center; justify-content: center;
	}
	.cert-date { font-size: 12px; color: var(--fg-secondary); }

	/* ── Instructions ── */
	.instructions {
		max-width: 680px;
		margin: 0 auto;
	}
	.instr-title {
		font-size: 22px; font-weight: 700;
		margin: 0 0 8px;
	}
	.instr-intro {
		font-size: 14px; color: var(--fg-secondary);
		margin: 0 0 20px; line-height: 1.6;
	}

	.level-exam-info {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 16px 20px;
		margin-bottom: 24px;
		display: flex; flex-direction: column; gap: 10px;
	}
	.exam-info-row {
		display: flex; justify-content: space-between; align-items: baseline;
		gap: 12px;
	}
	.ei-label { font-size: 13px; color: var(--fg-secondary); }
	.ei-val { font-size: 13px; font-weight: 600; color: var(--sumi); text-align: right; }

	.steps-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
	.step-card {
		display: flex; gap: 16px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 16px 18px;
	}
	.step-num {
		width: 28px; height: 28px;
		border-radius: 50%;
		background: var(--sumi);
		color: var(--washi);
		font-size: 13px; font-weight: 700;
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0;
	}
	.step-body { flex: 1; }
	.step-title { font-size: 15px; font-weight: 700; color: var(--sumi); margin-bottom: 4px; }
	.step-desc { font-size: 13px; color: var(--fg-secondary); margin: 0 0 6px; line-height: 1.6; }
	.step-link {
		font-size: 13px; font-weight: 600;
		color: var(--hinomaru-red);
		text-decoration: none;
	}
	@media (hover: hover) { .step-link:hover { text-decoration: underline; } }

	.disclaimer {
		font-size: 12px; color: var(--fg-tertiary);
		background: var(--ink-50);
		border: 1px solid var(--ink-200);
		border-radius: 12px;
		padding: 12px 16px;
		line-height: 1.6;
	}

	/* ── Print ── */
	.print-only { display: none; }

	@media print {
		.no-print { display: none !important; }
		.print-only { display: block; }
		.cert-page {
			padding: 0;
			max-width: 100%;
			background: white;
		}
		.certificate {
			box-shadow: none;
			border-radius: 0;
		}
		.cert-border {
			border: 4px solid #bc002d;
		}
	}
</style>
