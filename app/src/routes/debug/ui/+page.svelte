<script lang="ts">
	import { goto } from '$app/navigation';
	import { fadeUp } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import {
		ArrowLeft02Icon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		Certificate01Icon
	} from '@hugeicons/core-free-icons';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { showRomaji } from '$lib/stores/settings';

	type Tab = 'result' | 'certificate';
	let activeTab = $state<Tab>('result');
	let passMock = $state(true);
	let showConfetti = $state(false);

	// ── Mock result data ──────────────────────────────────────────────────────
	const mockPass = {
		pct: 85, score: 17, wrong: 3, total: 20,
		timeUsedLabel: '4:32',
		questions: [
			{ sentence: '彼は小説家（　）有名になった。', choices: ['について', 'として', 'にしたがって', 'と比べて'], answer: 2, userPick: 1, ok: false },
			{ sentence: 'この ロボットは 人（　）会話できます。', choices: ['や', 'を', 'へ', 'と'], answer: 4, userPick: 3, ok: true },
			{ sentence: 'お弁当を（　）ことになっている。', choices: ['持っていったばかりだ', '持っていくことになっている', '持っていきたい', '持っていくつもりだ'], answer: 2, userPick: 1, ok: true },
			{ sentence: 'あしたは 雨ですか。', choices: ['ゆき', 'はれ', 'くもり', 'あめ'], answer: 4, userPick: 3, ok: false },
			{ sentence: '先週 庭の 木の えだを 切りました。', choices: ['切ったり', '切るのに', '切りに', '切るかどうか'], answer: 2, userPick: 1, ok: true },
		]
	};

	const mockFail = {
		pct: 45, score: 9, wrong: 11, total: 20,
		timeUsedLabel: '12:08',
		questions: [
			{ sentence: '彼は小説家（　）有名になった。', choices: ['について', 'として', 'にしたがって', 'と比べて'], answer: 2, userPick: 0, ok: false },
			{ sentence: 'この ロボットは 人（　）会話できます。', choices: ['や', 'を', 'へ', 'と'], answer: 4, userPick: 1, ok: false },
			{ sentence: 'お弁当を（　）ことになっている。', choices: ['持っていったばかりだ', '持っていくことになっている', '持っていきたい', '持っていくつもりだ'], answer: 2, userPick: 1, ok: true },
			{ sentence: 'あしたは 雨ですか。', choices: ['ゆき', 'はれ', 'くもり', 'あめ'], answer: 4, userPick: 0, ok: false },
			{ sentence: '先週 庭の 木の えだを 切りました。', choices: ['切ったり', '切るのに', '切りに', '切るかどうか'], answer: 2, userPick: 2, ok: false },
		]
	};

	const mock = $derived(passMock ? mockPass : mockFail);

	// ── Mock certificate data ─────────────────────────────────────────────────
	const certLevel = 'N3';
	let certName = $state('Estudiante de Japonés');

	function fireConfetti() {
		showConfetti = false;
		requestAnimationFrame(() => { showConfetti = true; });
	}
</script>

<svelte:head>
	<title>UI Debug — Hinomaru</title>
</svelte:head>

<div class="debug-page">
	<!-- Toolbar -->
	<div class="toolbar">
		<button class="back-btn" onclick={() => goto('/settings')}>
			<Icon icon={ArrowLeft02Icon} size={20} color="currentColor" strokeWidth={2} />
			Ajustes
		</button>
		<span class="toolbar-title">UI Debug</span>
		<div style="width:80px;"></div>
	</div>

	<!-- Tabs -->
	<div class="tabs">
		<button class="tab" class:active={activeTab === 'result'} onclick={() => activeTab = 'result'}>
			Pantalla de Resultado
		</button>
		<button class="tab" class:active={activeTab === 'certificate'} onclick={() => activeTab = 'certificate'}>
			Certificado
		</button>
	</div>

	<!-- ── RESULT TAB ── -->
	{#if activeTab === 'result'}
		<div use:fadeUp={{ delay: 0, y: 10 }} class="tab-content">

			<!-- Controls -->
			<div class="controls-row">
				<span class="controls-label">Estado:</span>
				<button class="pill-toggle" class:pass={passMock} onclick={() => { passMock = true; }}>
					✓ Aprobado (85%)
				</button>
				<button class="pill-toggle" class:fail={!passMock} onclick={() => { passMock = false; }}>
					✗ Reprobado (45%)
				</button>
				<button class="pill-action" onclick={fireConfetti}>🎉 Confetti</button>
			</div>

			<!-- Result screen preview -->
			<div class="preview-frame">
				<div class="result-screen">
					<!-- Score hero -->
					<div class="score-hero">
						<div class="score-ring" class:pass={mock.pct >= 70} class:fail={mock.pct < 70}>
							<span class="score-pct-big">{mock.pct}</span>
							<span class="score-pct-symbol">%</span>
						</div>
						<h2 class="result-headline">{mock.pct >= 70 ? '¡Bien hecho!' : 'Sigue practicando'}</h2>
						<p class="result-sub">N3 Gramática · Práctica JLPT</p>
					</div>

					<!-- Stats -->
					<div class="stats-row">
						<div class="stats-card correct-card">
							<span class="stats-num">{mock.score}</span>
							<span class="stats-label">Correctas</span>
						</div>
						<div class="stats-card wrong-card">
							<span class="stats-num">{mock.wrong}</span>
							<span class="stats-label">Incorrectas</span>
						</div>
						<div class="stats-card time-card">
							<span class="stats-num">{mock.timeUsedLabel}</span>
							<span class="stats-label">Tiempo</span>
						</div>
					</div>

					<!-- Review -->
					<div class="review-section">
						<h3 class="review-title">Repaso</h3>
						<div class="q-review">
							{#each mock.questions as q, idx (idx)}
								<div class="q-row" class:q-ok={q.ok} class:q-ng={!q.ok}>
									<div class="q-row-top">
										<span class="q-dot">{q.ok ? '✓' : '✗'}</span>
										<span class="q-sentence jp">
											{q.sentence.length > 40 ? q.sentence.slice(0, 40) + '…' : q.sentence}
										</span>
									</div>
									{#if !q.ok}
										<div class="q-answers">
											<span class="q-user-ans jp">{q.choices[q.userPick]}</span>
											<span class="q-arrow">→</span>
											<div class="q-correct-wrap">
												<span class="q-correct-ans jp">{q.choices[q.answer - 1]}</span>
												{#if $showRomaji}
													<span class="q-ans-romaji">{kanaToRomaji(q.choices[q.answer - 1])}</span>
												{/if}
											</div>
										</div>
									{:else}
										<div class="q-answers q-answers-ok">
											<div class="q-correct-wrap">
												<span class="q-correct-ans jp">{q.choices[q.answer - 1]}</span>
												{#if $showRomaji}
													<span class="q-ans-romaji">{kanaToRomaji(q.choices[q.answer - 1])}</span>
												{/if}
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<!-- Footer buttons preview -->
					<div class="result-footer-preview">
						<button class="hm-btn hm-btn-secondary hm-btn-lg" style="flex:1;">← JLPT</button>
						<button class="hm-btn hm-btn-dark hm-btn-lg" style="flex:1;">Reintentar</button>
					</div>
				</div>
			</div>

			<!-- Summary screen (deck game style) -->
			<div class="section-sep">
				<span class="section-sep-label">Deck summary (quiz/flashcards/etc)</span>
			</div>

			<div class="preview-frame summary-preview">
				<div class="summary-bg-circle"></div>
				<div class="summary-inner">
					<div class="summary-label">Sesión completada</div>
					<div class="summary-score">{mock.score} / {mock.total}</div>
					<div class="summary-msg" style="color:var(--fg-secondary);">
						{mock.pct >= 70 ? '¡Excelente trabajo!' : 'Sigue practicando para mejorar'}
					</div>
					<div class="summary-stats">
						<div class="summary-stat-row">
							<span style="color:var(--fg-secondary);">Deck</span>
							<span style="font-weight:600;">N3 Vocabulario</span>
						</div>
						<div class="summary-stat-row">
							<span style="color:var(--fg-secondary);">XP ganado</span>
							<span style="font-weight:700;color:#b59410;">+{mock.score * 5} XP</span>
						</div>
						<div class="summary-stat-row">
							<span style="color:var(--fg-secondary);">Precisión</span>
							<span style="font-weight:600;color:{mock.pct >= 70 ? 'var(--success)' : 'var(--hinomaru-red)'};">
								{mock.pct}%
							</span>
						</div>
					</div>
					<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" style="margin-top:24px;">
						Volver al inicio
					</button>
				</div>
			</div>
		</div>

	<!-- ── CERTIFICATE TAB ── -->
	{:else if activeTab === 'certificate'}
		<div use:fadeUp={{ delay: 0, y: 10 }} class="tab-content">

			<!-- Controls -->
			<div class="controls-row">
				<span class="controls-label">Nombre:</span>
				<input class="name-debug-input" bind:value={certName} maxlength={50} placeholder="Tu nombre" />
			</div>

			<!-- Certificate preview -->
			<div class="preview-frame cert-frame">
				<div class="certificate">
					<div class="cert-border">
						<div class="cert-header">
							<div class="hinomaru-mark"></div>
							<div class="cert-brand">Hinomaru</div>
							<div class="cert-subtitle">Japanese Learning Platform</div>
						</div>

						<div class="cert-divider"></div>

						<p class="cert-presents">certifica que</p>
						<div class="cert-name">{certName || 'Nombre del estudiante'}</div>
						<p class="cert-body">ha completado satisfactoriamente la práctica oficial del</p>

						<div class="level-display">
							<div class="level-circle">{certLevel}</div>
							<div class="level-info">
								<div class="level-title">JLPT {certLevel}</div>
								<div class="level-sub">Nivel intermedio — situaciones cotidianas</div>
							</div>
						</div>

						<div class="scores-row">
							<div class="score-item">
								<span class="score-val pass">88%</span>
								<span class="score-sec">Vocabulario</span>
								<span class="score-frac">22/25</span>
							</div>
							<div class="score-item">
								<span class="score-val pass">76%</span>
								<span class="score-sec">Gramática</span>
								<span class="score-frac">19/25</span>
							</div>
							<div class="score-item total-item">
								<span class="score-val total-val">82%</span>
								<span class="score-sec">Total</span>
							</div>
						</div>

						<div class="cert-divider"></div>

						<div class="cert-footer">
							<div class="seal-circle">日</div>
							<div class="cert-date">Emitido el 30 de abril de 2026</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Link to real certificate -->
			<div class="debug-link-row">
				<a href="/jlpt/certificate/N5" class="debug-nav-link">
					Abrir certificado real N5 →
				</a>
			</div>
		</div>
	{/if}
</div>

{#if showConfetti}
	<Confetti fireOnMount={true} />
{/if}

<style>
	.debug-page {
		max-width: 720px;
		margin: 0 auto;
		padding: calc(16px + env(safe-area-inset-top)) 20px calc(60px + env(safe-area-inset-bottom));
		min-height: 100vh;
		background: var(--paper);
	}

	/* Toolbar */
	.toolbar {
		display: flex; align-items: center; justify-content: space-between;
		margin-bottom: 20px;
	}
	.back-btn {
		display: flex; align-items: center; gap: 6px;
		background: none; border: none;
		font-family: inherit; font-size: 14px; font-weight: 600;
		color: var(--fg-secondary); cursor: pointer; padding: 6px 0;
	}
	@media (hover: hover) { .back-btn:hover { color: var(--sumi); } }
	.toolbar-title {
		font-size: 15px; font-weight: 700; color: var(--sumi);
	}

	/* Tabs */
	.tabs {
		display: flex; gap: 0;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 12px;
		padding: 3px;
		margin-bottom: 20px;
	}
	.tab {
		flex: 1; padding: 9px 12px;
		border: none; border-radius: 9px;
		background: transparent;
		font-family: inherit; font-size: 13px; font-weight: 600;
		color: var(--fg-secondary); cursor: pointer;
		transition: all 0.15s;
	}
	.tab.active {
		background: var(--sumi); color: var(--washi);
	}

	/* Controls */
	.controls-row {
		display: flex; align-items: center; gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 16px;
		padding: 10px 14px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 12px;
		font-size: 13px;
	}
	.controls-label { color: var(--fg-tertiary); font-weight: 600; }
	.pill-toggle {
		padding: 5px 12px; border-radius: 99px;
		border: 1.5px solid var(--ink-200);
		background: var(--paper);
		font-family: inherit; font-size: 12px; font-weight: 600;
		color: var(--fg-secondary); cursor: pointer;
		transition: all 0.12s;
	}
	.pill-toggle.pass { border-color: var(--success); background: var(--success-wash); color: var(--success); }
	.pill-toggle.fail { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); color: var(--hinomaru-red); }
	.pill-action {
		padding: 5px 12px; border-radius: 99px;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		font-family: inherit; font-size: 12px; font-weight: 600;
		color: var(--fg-primary); cursor: pointer;
	}
	.name-debug-input {
		flex: 1; min-width: 160px;
		border: 1px solid var(--ink-200);
		border-radius: 8px;
		padding: 5px 10px;
		font-family: inherit; font-size: 13px;
		background: var(--paper); color: var(--sumi);
		outline: none;
	}
	.name-debug-input:focus { border-color: var(--sumi); }

	/* Preview frame */
	.preview-frame {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 20px;
		margin-bottom: 20px;
	}
	.section-sep {
		display: flex; align-items: center; gap: 12px;
		margin: 8px 0 20px;
	}
	.section-sep::before, .section-sep::after {
		content: ''; flex: 1; height: 1px; background: var(--ink-200);
	}
	.section-sep-label {
		font-size: 11px; font-weight: 700; color: var(--fg-tertiary);
		text-transform: uppercase; letter-spacing: 0.05em;
		white-space: nowrap;
	}

	/* ── Result screen (matches JLPT exam result) ── */
	.result-screen { }
	.score-hero { text-align: center; padding: 16px 0 24px; }
	.score-ring {
		display: inline-flex; flex-direction: column;
		align-items: center; justify-content: center;
		width: 120px; height: 120px;
		border-radius: 50%;
		border: 5px solid var(--ink-200);
		margin: 0 auto 18px;
		background: var(--bg-surface);
	}
	.score-ring.pass { border-color: var(--success); }
	.score-ring.fail { border-color: var(--hinomaru-red); }
	.score-pct-big {
		font-size: 36px; font-weight: 700;
		letter-spacing: -0.04em; line-height: 1;
		color: var(--sumi);
	}
	.score-ring.pass .score-pct-big { color: var(--success); }
	.score-ring.fail .score-pct-big { color: var(--hinomaru-red); }
	.score-pct-symbol { font-size: 14px; font-weight: 700; color: var(--fg-tertiary); margin-top: 2px; }
	.result-headline { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
	.result-sub { font-size: 13px; color: var(--fg-secondary); margin: 0; }

	.stats-row { display: flex; gap: 10px; margin-bottom: 24px; }
	.stats-card {
		flex: 1; display: flex; flex-direction: column; align-items: center;
		padding: 16px 8px;
		border-radius: 16px;
		border: 1px solid var(--ink-200);
		background: var(--paper);
		gap: 4px;
	}
	.correct-card { border-color: var(--success); background: var(--success-wash); }
	.wrong-card { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }
	.stats-num { font-size: 24px; font-weight: 700; line-height: 1; color: var(--sumi); font-variant-numeric: tabular-nums; }
	.correct-card .stats-num { color: var(--success); }
	.wrong-card .stats-num { color: var(--hinomaru-red); }
	.stats-label { font-size: 11px; font-weight: 600; color: var(--fg-tertiary); letter-spacing: 0.03em; }

	.review-section { }
	.review-title {
		font-size: 14px; font-weight: 700;
		color: var(--fg-secondary);
		letter-spacing: 0.04em; text-transform: uppercase;
		margin: 0 0 12px;
	}
	.q-review { display: flex; flex-direction: column; gap: 8px; }
	.q-row {
		display: flex; flex-direction: column; gap: 6px;
		padding: 12px 14px;
		border-radius: 12px;
		background: var(--paper);
		border: 1px solid var(--ink-100);
	}
	.q-ok { border-color: var(--success); background: var(--success-wash); }
	.q-ng { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); }
	.q-row-top { display: flex; align-items: flex-start; gap: 8px; }
	.q-dot { font-size: 13px; font-weight: 700; flex-shrink: 0; padding-top: 1px; }
	.q-ok .q-dot { color: var(--success); }
	.q-ng .q-dot { color: var(--hinomaru-red); }
	.q-sentence { font-size: 13px; color: var(--sumi); line-height: 1.5; }
	.q-answers { display: flex; align-items: center; gap: 6px; margin-left: 21px; flex-wrap: wrap; }
	.q-user-ans { font-size: 13px; font-weight: 600; color: var(--hinomaru-red); text-decoration: line-through; opacity: 0.75; }
	.q-arrow { font-size: 12px; color: var(--fg-tertiary); }
	.q-correct-wrap { display: flex; flex-direction: column; gap: 1px; }
	.q-correct-ans { font-size: 13px; font-weight: 700; color: var(--success); }
	.q-ok .q-correct-ans { color: var(--success); }
	.q-ans-romaji { font-size: 11px; color: var(--fg-tertiary); font-style: italic; }
	.result-footer-preview {
		display: flex; gap: 12px; margin-top: 24px;
		padding-top: 16px; border-top: 1px solid var(--ink-100);
	}

	/* ── Summary (deck style) ── */
	.summary-preview {
		position: relative; overflow: hidden;
		display: flex; justify-content: center;
		background: var(--paper);
	}
	.summary-bg-circle {
		position: absolute; top: 50%; left: 50%;
		transform: translate(-50%, -50%);
		width: 260px; height: 260px;
		background: var(--hinomaru-red);
		border-radius: 50%;
		opacity: 0.06;
		pointer-events: none;
	}
	.summary-inner {
		position: relative; max-width: 380px; width: 100%;
		text-align: center; padding: 24px 0;
	}
	.summary-label {
		font-size: 12px; font-weight: 700; text-transform: uppercase;
		letter-spacing: 0.08em; color: var(--fg-tertiary);
		margin-bottom: 16px;
	}
	.summary-score {
		font-size: 64px; font-weight: 700;
		letter-spacing: -0.02em; line-height: 1;
	}
	.summary-msg { font-size: 18px; margin-top: 12px; }
	.summary-stats {
		display: flex; flex-direction: column; gap: 10px;
		margin-top: 32px;
	}
	.summary-stat-row {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 16px;
		padding: 14px 18px;
		display: flex; justify-content: space-between;
	}

	/* ── Certificate ── */
	.cert-frame { background: var(--paper); }
	.certificate {
		background: var(--washi);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 24px rgba(0,0,0,0.08);
	}
	.cert-border {
		border: 5px solid transparent;
		background: linear-gradient(var(--washi), var(--washi)) padding-box,
			linear-gradient(135deg, #bc002d 0%, #1a1a1a 50%, #bc002d 100%) border-box;
		padding: 28px 24px 20px;
		text-align: center;
	}
	.cert-header { margin-bottom: 16px; }
	.hinomaru-mark {
		width: 40px; height: 40px;
		border-radius: 50%; background: var(--hinomaru-red);
		margin: 0 auto 6px;
	}
	.cert-brand { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--sumi); }
	.cert-subtitle { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-tertiary); margin-top: 2px; }
	.cert-divider { height: 1px; background: linear-gradient(to right, transparent, var(--ink-200), transparent); margin: 14px 0; }
	.cert-presents { font-size: 13px; color: var(--fg-secondary); margin: 0 0 8px; letter-spacing: 0.04em; }
	.cert-name { font-size: 22px; font-weight: 700; color: var(--sumi); margin-bottom: 8px; }
	.cert-body { font-size: 13px; color: var(--fg-secondary); margin: 0 0 16px; }
	.level-display {
		display: inline-flex; align-items: center; gap: 14px;
		background: var(--paper); border: 1px solid var(--ink-200);
		border-radius: 14px; padding: 12px 20px; margin-bottom: 20px; text-align: left;
	}
	.level-circle {
		width: 48px; height: 48px; border-radius: 50%;
		background: var(--sumi); color: var(--washi);
		font-size: 17px; font-weight: 700;
		display: flex; align-items: center; justify-content: center; flex-shrink: 0;
	}
	.level-title { font-size: 17px; font-weight: 700; color: var(--sumi); }
	.level-sub { font-size: 11px; color: var(--fg-secondary); margin-top: 1px; }
	.scores-row { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
	.score-item {
		display: flex; flex-direction: column; align-items: center; gap: 2px;
		min-width: 68px; padding: 10px 12px;
		background: var(--paper); border: 1px solid var(--ink-200); border-radius: 12px;
	}
	.score-val { font-size: 18px; font-weight: 700; color: var(--sumi); line-height: 1; }
	.score-val.pass { color: var(--success); }
	.score-val.fail { color: var(--hinomaru-red); }
	.score-sec { font-size: 10px; color: var(--fg-tertiary); font-weight: 600; }
	.score-frac { font-size: 9px; color: var(--fg-tertiary); }
	.total-item { border-color: var(--sumi); background: var(--ink-50); }
	.total-val { font-size: 20px; color: var(--sumi); }
	.cert-footer { display: flex; align-items: center; justify-content: center; gap: 14px; }
	.seal-circle {
		width: 44px; height: 44px; border-radius: 50%;
		border: 2.5px solid var(--hinomaru-red);
		color: var(--hinomaru-red); font-size: 18px; font-weight: 700;
		font-family: var(--font-jp);
		display: flex; align-items: center; justify-content: center;
	}
	.cert-date { font-size: 12px; color: var(--fg-secondary); }

	.debug-link-row { text-align: center; margin-top: 8px; }
	.debug-nav-link {
		font-size: 13px; font-weight: 600;
		color: var(--hinomaru-red); text-decoration: none;
	}
	@media (hover: hover) { .debug-nav-link:hover { text-decoration: underline; } }

	.jp { font-family: var(--font-jp); }
</style>
