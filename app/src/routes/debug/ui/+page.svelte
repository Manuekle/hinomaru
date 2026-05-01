<script lang="ts">
	import { goto } from '$app/navigation';
	import { fadeUp, popIn } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import Confetti from '$lib/components/Confetti.svelte';
	import {
		ArrowLeft02Icon,
		CheckmarkCircle01Icon,
		Cancel01Icon,
		DocumentValidationIcon,
		Trophy as Trophy01Icon,
		StarIcon as Star01Icon,
		Clock01Icon,
		Target01Icon,
		DashboardCircleIcon,
		CheckmarkCircle02Icon,
		AlertCircleIcon,
		Settings02Icon
	} from '@hugeicons/core-free-icons';
	import { kanaToRomaji } from '$lib/utils/romaji';
	import { showRomaji } from '$lib/stores/settings';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';

	type Tab = 'result' | 'summary' | 'certificate';
	let activeTab = $state<Tab>('result');
	
	// ── Shared State ──────────────────────────────────────────────────────────
	let score = $state(17);
	let total = $state(20);
	let timeUsedSeconds = $state(272); // 4:32
	let showConfetti = $state(false);

	const pct = $derived(total > 0 ? Math.round((score / total) * 100) : 0);
	const timeLabel = $derived(`${Math.floor(timeUsedSeconds / 60)}:${String(timeUsedSeconds % 60).padStart(2, '0')}`);
	const xpEarned = $derived(score * 5);

	// ── Mock Questions ────────────────────────────────────────────────────────
	const mockQuestions = [
		{ sentence: '彼は小説家（　）有名になった。', choices: ['について', 'として', 'にしたがって', 'と比べて'], answer: 2, userPick: 1, ok: false },
		{ sentence: 'この ロボットは 人（　）会話できます。', choices: ['や', 'を', 'へ', 'と'], answer: 4, userPick: 3, ok: true },
		{ sentence: 'お弁当を（　）ことになっている。', choices: ['持っていったばかりだ', '持っていくことになっている', '持っていきたい', '持っていくつもりだ'], answer: 2, userPick: 1, ok: true },
		{ sentence: 'あしたは 雨ですか。', choices: ['ゆき', 'はれ', 'くもり', 'あめ'], answer: 4, userPick: 3, ok: false },
		{ sentence: '先週 庭の 木の えだを 切りました。', choices: ['切ったり', '切るのに', '切りに', '切るかどうか'], answer: 2, userPick: 1, ok: true },
	];

	// ── Certificate State ─────────────────────────────────────────────────────
	let certLevel = $state('N3');
	let certName = $state('Estudiante de Japonés');

	function fireConfetti() {
		showConfetti = false;
		requestAnimationFrame(() => { showConfetti = true; });
	}

	$effect(() => {
		if (pct >= 80 && activeTab !== 'certificate') {
			fireConfetti();
		}
	});
</script>

<svelte:head>
	<title>UI Laboratory — Hinomaru</title>
</svelte:head>

<div class="debug-page">
	<!-- Header -->
	<header class="debug-header" use:fadeUp={{ delay: 0, y: -10 }}>
		<button class="back-link" onclick={() => goto('/settings')}>
			<Icon icon={ArrowLeft02Icon} size={18} color="currentColor" />
			{t('deck.back', $locale)}
		</button>
		<h1 class="debug-title">UI Laboratory</h1>
		<p class="debug-subtitle">Debug and preview completion states</p>
	</header>

	<!-- Controls Section -->
	<section class="debug-controls card" use:fadeUp={{ delay: 0.05, y: 10 }}>
		<div class="control-group">
			<label for="score-range">Score: {score} / {total} ({pct}%)</label>
			<input id="score-range" type="range" min="0" max={total} bind:value={score} />
		</div>
		
		<div class="control-actions">
			<button class="pill-btn" onclick={() => { score = total; }} class:active={pct === 100}>
				<Icon icon={Star01Icon} size={14} color="currentColor" /> 100%
			</button>
			<button class="pill-btn" onclick={() => { score = Math.round(total * 0.85); }} class:active={pct >= 80 && pct < 100}>
				<Icon icon={Trophy01Icon} size={14} color="currentColor" /> 85%
			</button>
			<button class="pill-btn" onclick={() => { score = Math.round(total * 0.45); }} class:active={pct < 70}>
				<Icon icon={Cancel01Icon} size={14} color="currentColor" /> 45%
			</button>
			<button class="pill-btn action-btn" onclick={fireConfetti}>
				🎉 Fire Confetti
			</button>
		</div>
	</section>

	<!-- Tabs Navigation -->
	<nav class="debug-tabs" use:fadeUp={{ delay: 0.1, y: 10 }}>
		<button class="tab-item" class:active={activeTab === 'result'} onclick={() => activeTab = 'result'}>
			<Icon icon={DashboardCircleIcon} size={16} color="currentColor" />
			Exam Result
		</button>
		<button class="tab-item" class:active={activeTab === 'summary'} onclick={() => activeTab = 'summary'}>
			<Icon icon={CheckmarkCircle01Icon} size={16} color="currentColor" />
			Deck Summary
		</button>
		<button class="tab-item" class:active={activeTab === 'certificate'} onclick={() => activeTab = 'certificate'}>
			<Icon icon={DocumentValidationIcon} size={16} color="currentColor" />
			Certificate
		</button>
	</nav>

	<main class="preview-area">
		{#if activeTab === 'result'}
			<div class="preview-container" use:fadeUp={{ delay: 0, y: 20 }}>
				<div class="screen-frame">
					<div class="result-screen">
						<!-- Premium Hero Header -->
						<div class="result-premium-hero" class:is-pass={pct >= 70}>
							<div class="hero-glow"></div>
							<div class="hero-content-wrapper">
								<div class="hero-badge">
									<Icon icon={pct >= 70 ? CheckmarkCircle02Icon : AlertCircleIcon} size={28} color="var(--washi)" />
									<span>{pct >= 70 ? 'Certificado obtenido' : 'Práctica finalizada'}</span>
								</div>

								<div class="score-display-ring">
									<svg class="progress-svg" viewBox="0 0 100 100">
										<circle class="progress-track" cx="50" cy="50" r="45" fill="none" stroke-width="4" />
										<circle 
											class="progress-bar" 
											cx="50" cy="50" r="45" 
											fill="none" stroke-width="6" 
											stroke-linecap="round"
											stroke-dasharray="283"
											stroke-dashoffset={283 - (283 * pct) / 100}
										/>
									</svg>
									<div class="score-labels">
										<span class="score-big">{pct}</span>
										<span class="score-small">%</span>
									</div>
								</div>

								<h2 class="hero-main-title">{pct >= 70 ? '¡Excelente trabajo!' : 'Sigue esforzándote'}</h2>
								<p class="hero-main-sub">{certLevel} · Gramática · Práctica JLPT</p>
							</div>
						</div>

						<!-- Floating Stats Grid -->
						<div class="stats-premium-grid">
							<div class="stat-glass-card">
								<div class="stat-icon-wrap correct">
									<Icon icon={CheckmarkCircle01Icon} size={20} color="var(--success)" />
								</div>
								<div class="stat-text-side">
									<span class="stat-val-bold">{score}</span>
									<span class="stat-lbl-caps">Correctas</span>
								</div>
							</div>

							<div class="stat-glass-card">
								<div class="stat-icon-wrap wrong">
									<Icon icon={Cancel01Icon} size={20} color="var(--hinomaru-red)" />
								</div>
								<div class="stat-text-side">
									<span class="stat-val-bold">{total - score}</span>
									<span class="stat-lbl-caps">Incorrectas</span>
								</div>
							</div>

							<div class="stat-glass-card">
								<div class="stat-icon-wrap time">
									<Icon icon={Clock01Icon} size={20} color="var(--sumi)" />
								</div>
								<div class="stat-text-side">
									<span class="stat-val-bold">{timeLabel}</span>
									<span class="stat-lbl-caps">Duración</span>
								</div>
							</div>
						</div>

						<!-- New XP / Rewards Section -->
						<div class="rewards-card">
							<div class="reward-item">
								<Icon icon={Target01Icon} size={20} color="var(--warning)" />
								<div class="reward-info">
									<span class="reward-title">Puntos de experiencia</span>
									<span class="reward-val">+{score * 10} XP</span>
								</div>
							</div>
						</div>

						<!-- Review Section (Enhanced) -->
						<div class="review-area-premium">
							<div class="review-header-premium">
								<h3 class="review-heading-premium">Repaso detallado</h3>
								<div class="review-pills">
									<span class="pill-rev ok">{score}</span>
									<span class="pill-rev ng">{total - score}</span>
								</div>
							</div>
							
							<div class="review-list-premium">
								{#each mockQuestions as q, idx (idx)}
									{@const ok = idx < score / (total/5)}
									<div class="review-item-premium" class:is-wrong={!ok}>
										<div class="review-body-premium">
											<p class="review-q-text-premium jp">{q.sentence}</p>
											<div class="review-ans-group">
												{#if !ok}
													<div class="ans-box user">
														<span class="ans-label">Tu respuesta</span>
														<span class="ans-val jp">{q.choices[q.userPick]}</span>
													</div>
												{/if}
												<div class="ans-box correct">
													<span class="ans-label">Correcta</span>
													<span class="ans-val jp">{q.choices[q.answer - 1]}</span>
												</div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- Footer -->
						<div class="preview-footer">
							<button class="hm-btn hm-btn-secondary hm-btn-lg">← {t('deck.back', $locale)}</button>
							<button class="hm-btn hm-btn-dark hm-btn-lg">Reintentar</button>
						</div>
					</div>
				</div>
			</div>
		{:else if activeTab === 'summary'}
			<div class="preview-container" use:fadeUp={{ delay: 0, y: 20 }}>
				<div class="screen-frame summary-bg">
					<div class="summary-pulse-circle"></div>
					<div class="summary-content">
						<div class="summary-label">{t('summary.complete', $locale)}</div>
						<div class="summary-score" use:popIn={{ delay: 0.1 }}>
							{score} / {total}
						</div>
						<div class="summary-msg">
							{pct === 100 ? t('summary.all', $locale) : pct >= 70 ? t('summary.solid', $locale) : t('summary.retry', $locale)}
						</div>

						<div class="summary-stats-list">
							<div class="summary-stat-item">
								<span class="summary-stat-key">{t('summary.deck', $locale)}</span>
								<span class="summary-stat-val">N3 Vocabulario</span>
							</div>
							<div class="summary-stat-item">
								<span class="summary-stat-key">{t('summary.xp', $locale)}</span>
								<span class="summary-stat-val xp">+{xpEarned} XP</span>
							</div>
							<div class="summary-stat-item">
								<span class="summary-stat-key">{t('summary.accuracy', $locale)}</span>
								<span class="summary-stat-val" style="color: {pct >= 70 ? 'var(--success)' : 'var(--hinomaru-red)'}">{pct}%</span>
							</div>
						</div>

						<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" style="margin-top: 32px;">
							{t('summary.back', $locale)}
						</button>
					</div>
				</div>
			</div>
		{:else if activeTab === 'certificate'}
			<div class="preview-container" use:fadeUp={{ delay: 0, y: 20 }}>
				<!-- Cert Controls -->
				<div class="cert-debug-controls card">
					<div class="control-group">
						<label for="cert-name">Student Name:</label>
						<input id="cert-name" type="text" bind:value={certName} placeholder="Enter name..." />
					</div>
					<div class="control-group">
						<label for="cert-level">Level:</label>
						<select id="cert-level" bind:value={certLevel}>
							<option>N5</option>
							<option>N4</option>
							<option>N3</option>
							<option>N2</option>
							<option>N1</option>
						</select>
					</div>
				</div>

				<div class="screen-frame cert-preview-frame">
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
									<span class="score-val pass">{pct}%</span>
									<span class="score-sec">Vocabulario</span>
									<span class="score-frac">{score}/{total}</span>
								</div>
								<div class="score-item">
									<span class="score-val pass">88%</span>
									<span class="score-sec">Gramática</span>
									<span class="score-frac">22/25</span>
								</div>
								<div class="score-item total">
									<span class="score-val">{Math.round((pct + 88)/2)}%</span>
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
				
				<div class="cert-actions">
					<a href="/jlpt/certificate/{certLevel}" class="cert-link">View Real Certificate →</a>
				</div>
			</div>
		{/if}
	</main>
</div>

{#if showConfetti}
	<Confetti fireOnMount={true} />
{/if}

<style>
	.debug-page {
		max-width: 800px;
		margin: 0 auto;
		padding: calc(24px + env(safe-area-inset-top)) 20px calc(80px + env(safe-area-inset-bottom));
		min-height: 100vh;
		background: var(--paper);
	}

	/* Header */
	.debug-header { margin-bottom: 32px; }
	.back-link {
		display: inline-flex; align-items: center; gap: 8px;
		background: none; border: none; padding: 0;
		font-family: inherit; font-size: 14px; font-weight: 600;
		color: var(--fg-tertiary); cursor: pointer; margin-bottom: 12px;
		transition: color 0.2s;
	}
	.back-link:hover { color: var(--sumi); }
	.debug-title { font-size: 32px; font-weight: 700; color: var(--sumi); letter-spacing: -0.02em; margin: 0; }
	.debug-subtitle { font-size: 15px; color: var(--fg-secondary); margin: 4px 0 0; }

	/* Card Shell */
	.card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 24px;
		box-shadow: 0 4px 20px rgba(0,0,0,0.04);
	}

	/* Controls */
	.debug-controls { margin-bottom: 32px; display: flex; flex-direction: column; gap: 24px; }
	.control-group { display: flex; flex-direction: column; gap: 10px; }
	.control-group label { font-size: 13px; font-weight: 700; color: var(--fg-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
	input[type="range"] {
		width: 100%; accent-color: var(--hinomaru-red); height: 6px;
		background: var(--ink-200); border-radius: 3px; outline: none;
	}
	.control-actions { display: flex; gap: 10px; flex-wrap: wrap; }
	.pill-btn {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 8px 16px; border-radius: 99px;
		border: 1.5px solid var(--ink-200); background: var(--bg-surface);
		font-family: inherit; font-size: 13px; font-weight: 600;
		color: var(--fg-primary); cursor: pointer; transition: all 0.2s;
	}
	.pill-btn:hover { border-color: var(--ink-400); background: var(--ink-50); }
	.pill-btn.active { background: var(--sumi); border-color: var(--sumi); color: var(--washi); }
	.pill-btn.action-btn { border-color: var(--hinomaru-red); color: var(--hinomaru-red); }
	.pill-btn.action-btn:hover { background: var(--hinomaru-red-wash); }

	/* Tabs */
	.debug-tabs {
		display: flex; gap: 8px; margin-bottom: 32px;
		background: var(--ink-100); padding: 6px; border-radius: 16px;
	}
	.tab-item {
		flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
		padding: 12px; border-radius: 12px; border: none;
		background: transparent; font-family: inherit; font-size: 14px; font-weight: 700;
		color: var(--fg-secondary); cursor: pointer; transition: all 0.2s;
	}
	.tab-item.active { background: var(--bg-surface); color: var(--sumi); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

	/* Preview Area */
	.preview-area { min-height: 500px; }
	.screen-frame {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 32px;
		padding: 32px 24px;
		box-shadow: 0 12px 40px rgba(0,0,0,0.08);
		position: relative; overflow: hidden;
		max-width: 500px; margin: 0 auto;
	}

	/* Exam Result Styles */
	/* ── PREMIUM RESULT SCREEN (CLONED) ── */
	.result-screen {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding-bottom: 40px;
		text-align: left;
	}

	.result-premium-hero {
		position: relative;
		border-radius: 32px;
		padding: 48px 24px;
		text-align: center;
		overflow: hidden;
		background: #1a1a1a;
		color: white;
		box-shadow: 0 20px 40px rgba(0,0,0,0.15);
	}

	.result-premium-hero.is-pass {
		background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
	}

	.result-premium-hero:not(.is-pass) {
		background: linear-gradient(135deg, #bc002d 0%, #8b0021 100%);
	}

	.hero-glow {
		position: absolute;
		top: -50%; left: -50%; width: 200%; height: 200%;
		background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 50%);
		animation: glow-rotate 10s linear infinite;
		pointer-events: none;
	}

	@keyframes glow-rotate {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.hero-content-wrapper { position: relative; z-index: 2; }

	.hero-badge {
		display: inline-flex; align-items: center; gap: 8px;
		background: rgba(255,255,255,0.1);
		backdrop-filter: blur(8px);
		padding: 6px 16px; border-radius: 99px;
		font-size: 12px; font-weight: 700;
		text-transform: uppercase; letter-spacing: 0.05em;
		margin-bottom: 32px;
		border: 1px solid rgba(255,255,255,0.1);
	}

	.score-display-ring {
		position: relative;
		width: 130px; height: 130px;
		margin: 0 auto 32px;
		display: flex; align-items: center; justify-content: center;
	}

	.progress-svg {
		position: absolute;
		top: 0; left: 0; width: 100%; height: 100%;
		transform: rotate(-90deg);
	}

	.progress-track { stroke: rgba(255,255,255,0.1); }
	.progress-bar {
		stroke: white;
		transition: stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.is-pass .progress-bar { stroke: #4ade80; }

	.score-labels {
		display: flex; align-items: baseline; gap: 2px;
	}
	.score-big { font-size: 48px; font-weight: 900; line-height: 1; }
	.score-small { font-size: 16px; font-weight: 600; opacity: 0.6; }

	.hero-main-title {
		font-size: 24px; font-weight: 800; margin: 0 0 8px;
		letter-spacing: -0.02em;
	}
	.hero-main-sub {
		font-size: 13px; font-weight: 600; opacity: 0.6;
		text-transform: uppercase; letter-spacing: 0.1em;
	}

	/* Stats Grid */
	.stats-premium-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.stat-glass-card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		padding: 16px 8px;
		display: flex; flex-direction: column; align-items: center; gap: 8px;
		text-align: center;
	}

	.stat-icon-wrap {
		width: 36px; height: 36px;
		border-radius: 10px;
		display: flex; align-items: center; justify-content: center;
	}
	.stat-icon-wrap.correct { background: var(--success-wash); }
	.stat-icon-wrap.wrong { background: var(--hinomaru-red-wash); }
	.stat-icon-wrap.time { background: var(--ink-100); }

	.stat-meta { display: flex; align-items: baseline; gap: 6px; flex: 1; text-align: left; }
	.stat-v { font-size: 16px; font-weight: 800; color: var(--sumi); }
	.stat-l { font-size: 11px; font-weight: 600; color: var(--fg-secondary); }

	/* Rewards Card */
	.rewards-card {
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		border: 1px solid rgba(251, 191, 36, 0.3);
		border-radius: 20px;
		padding: 16px 20px;
		margin-bottom: 24px;
	}
	:global([data-theme='dark'] .rewards-card) {
		background: linear-gradient(135deg, #451a03 0%, #78350f 100%);
		border-color: rgba(251, 191, 36, 0.1);
	}
	.reward-item { display: flex; align-items: center; gap: 12px; }
	.reward-info { display: flex; flex-direction: column; }
	.reward-title { font-size: 12px; font-weight: 600; color: #92400e; }
	:global([data-theme='dark'] .reward-title) { color: #fde68a; }
	.reward-val { font-size: 16px; font-weight: 800; color: #451a03; }
	:global([data-theme='dark'] .reward-val) { color: white; }

	/* Review Area Premium */
	.review-area-premium { margin-top: 16px; }
	.review-header-premium {
		display: flex; align-items: center; justify-content: space-between;
		margin-bottom: 20px; padding: 0 4px;
	}
	.review-heading-premium { font-size: 16px; font-weight: 800; color: var(--sumi); }
	.review-pills { display: flex; gap: 8px; }
	.pill-rev {
		padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700;
	}
	.pill-rev.ok { background: var(--success-wash); color: var(--success); }
	.pill-rev.ng { background: var(--hinomaru-red-wash); color: var(--hinomaru-red); }

	.review-list-premium { display: flex; flex-direction: column; gap: 10px; }
	.review-item-premium {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 18px;
		padding: 16px;
		display: flex; gap: 12px;
		position: relative;
		overflow: hidden;
	}
	.review-item-premium.is-wrong { border-left: 4px solid var(--hinomaru-red); }
	.review-item-premium:not(.is-wrong) { border-left: 4px solid var(--success); }

	.review-body-premium { flex: 1; display: flex; flex-direction: column; gap: 10px; }
	.review-q-text-premium { font-size: 14px; font-weight: 600; color: var(--sumi); line-height: 1.5; }
	
	.review-ans-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
	.ans-box {
		padding: 10px; border-radius: 10px; display: flex; flex-direction: column; gap: 4px;
	}
	.ans-box.user { background: var(--hinomaru-red-wash); }
	.ans-box.correct { background: var(--success-wash); }
	.ans-label { font-size: 9px; font-weight: 700; text-transform: uppercase; opacity: 0.6; }
	.ans-val { font-size: 13px; font-weight: 700; }
	.user .ans-val { color: var(--hinomaru-red); }
	.correct .ans-val { color: var(--success); }

	.preview-footer { display: flex; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--ink-100); }

	/* Summary Screen Styles */
	.summary-bg { background: var(--paper); }
	.summary-pulse-circle {
		position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
		width: 300px; height: 300px; background: var(--hinomaru-red); border-radius: 50%;
		opacity: 0.05; animation: summary-pulse 4s infinite ease-in-out;
	}
	@keyframes summary-pulse {
		0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.05; }
		50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.08; }
	}
	.summary-content { position: relative; text-align: center; }
	.summary-msg { font-size: 20px; font-weight: 600; color: var(--fg-secondary); margin-top: 16px; }

	/* Certificate Styles */
	.cert-preview-frame { background: var(--paper); max-width: 600px; }
	.cert-debug-controls { margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
	.cert-debug-controls input, .cert-debug-controls select {
		padding: 10px 14px; border-radius: 12px; border: 1.5px solid var(--ink-200);
		background: var(--paper); font-family: inherit; font-size: 14px; outline: none;
	}
	.cert-debug-controls input:focus { border-color: var(--sumi); }

	.certificate { background: var(--washi); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.12); }
	.cert-border {
		border: 6px solid transparent; padding: 40px 32px;
		background: linear-gradient(var(--washi), var(--washi)) padding-box,
			linear-gradient(135deg, #bc002d 0%, #1a1a1a 50%, #bc002d 100%) border-box;
		text-align: center;
	}
	.cert-header { margin-bottom: 24px; }
	.hinomaru-mark { width: 48px; height: 48px; border-radius: 50%; background: var(--hinomaru-red); margin: 0 auto 10px; }
	.cert-brand { font-size: 24px; font-weight: 800; color: var(--sumi); letter-spacing: -0.02em; }
	.cert-subtitle { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-tertiary); margin-top: 4px; }
	.cert-divider { height: 1px; background: linear-gradient(to right, transparent, var(--ink-200), transparent); margin: 24px 0; }
	.cert-presents { font-size: 14px; color: var(--fg-secondary); margin-bottom: 12px; }
	.cert-name { font-size: 28px; font-weight: 800; color: var(--sumi); margin-bottom: 12px; border-bottom: 2px solid var(--ink-100); display: inline-block; padding: 0 20px 4px; }
	.cert-body { font-size: 14px; color: var(--fg-secondary); margin-bottom: 24px; line-height: 1.6; }
	.level-display {
		display: inline-flex; align-items: center; gap: 16px;
		background: var(--paper); border: 1.5px solid var(--ink-200);
		border-radius: 20px; padding: 16px 24px; margin-bottom: 32px; text-align: left;
	}
	.level-circle {
		width: 56px; height: 56px; border-radius: 50%;
		background: var(--sumi); color: var(--washi);
		font-size: 20px; font-weight: 800;
		display: flex; align-items: center; justify-content: center;
	}
	.level-title { font-size: 20px; font-weight: 800; color: var(--sumi); }
	.level-sub { font-size: 12px; color: var(--fg-secondary); margin-top: 2px; }

	.scores-row { display: flex; justify-content: center; gap: 12px; margin-bottom: 32px; }
	.score-item {
		display: flex; flex-direction: column; align-items: center; gap: 4px;
		min-width: 80px; padding: 14px 10px;
		background: var(--paper); border: 1px solid var(--ink-200); border-radius: 16px;
	}
	.score-item.total { border-color: var(--sumi); background: var(--ink-50); }
	.score-val { font-size: 20px; font-weight: 800; color: var(--sumi); line-height: 1; }
	.score-val.pass { color: var(--success); }
	.score-sec { font-size: 11px; font-weight: 700; color: var(--fg-tertiary); text-transform: uppercase; }
	.score-frac { font-size: 10px; color: var(--fg-tertiary); }

	.cert-footer { display: flex; align-items: center; justify-content: center; gap: 20px; }
	.seal-circle {
		width: 52px; height: 52px; border-radius: 50%;
		border: 3px solid var(--hinomaru-red);
		color: var(--hinomaru-red); font-size: 22px; font-weight: 800;
		display: flex; align-items: center; justify-content: center;
		font-family: var(--font-jp);
	}
	.cert-date { font-size: 13px; color: var(--fg-secondary); }

	.cert-actions { margin-top: 24px; text-align: center; }
	.cert-link { font-size: 14px; font-weight: 700; color: var(--hinomaru-red); text-decoration: none; }
	.cert-link:hover { text-decoration: underline; }

	.jp { font-family: var(--font-jp); }
</style>
