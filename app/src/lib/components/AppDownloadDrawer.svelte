<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp, fadeIn, scaleIn } from '$lib/motion';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import {
		SmartPhone01Icon,
		ArrowUp01Icon,
		Add01Icon,
		More01Icon,
		Download02Icon,
		QrCode01Icon,
		Cancel01Icon
	} from '@hugeicons/core-free-icons';

	let { open = $bindable(false) } = $props();

	let isIOS = $state(false);
	let isAndroid = $state(false);
	let isMobile = $state(false);
	let desktopTab = $state<'ios' | 'android'>('ios');

	onMount(() => {
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
		isAndroid = /Android/.test(navigator.userAgent);
		isMobile = isIOS || isAndroid;

		if (isAndroid) {
			document.documentElement.classList.add('is-android');
		} else {
			document.documentElement.classList.remove('is-android');
		}
	});


	// i18n strings
	const strings = {
		es: {
			title: 'Instalar Hinomaru',
			step1: 'Toca el botón Compartir',
			step1Desc: 'Búscalo en la barra inferior de Safari',
			step2: 'Desliza hacia abajo',
			step2Desc: 'Busca la opción en el menú',
			step3: 'Tocar "Agregar a Inicio"',
			step3Desc: 'La app aparecerá en tu pantalla principal'
		},
		en: {
			title: 'Install Hinomaru',
			step1: 'Tap the Share button',
			step1Desc: 'Find it in the Safari bottom bar',
			step2: 'Scroll down',
			step2Desc: 'Look for the option in the menu',
			step3: 'Tap "Add to Home Screen"',
			step3Desc: 'The app will appear on your home screen'
		}
	};

	const s = $derived(strings[$locale as 'es' | 'en'] ?? strings.es);

	const steps = $derived([
		{ icon: ArrowUp01Icon, label: s.step1, desc: s.step1Desc },
		{ icon: SmartPhone01Icon, label: s.step2, desc: s.step2Desc },
		{ icon: Add01Icon, label: s.step3, desc: s.step3Desc }
	]);
</script>

<Drawer.Root bind:open>
	<Drawer.Content>
		<div class="drawer-wrap">
			<!-- Close button -->
			<div class="drawer-header-visual">
				<div class="header-icon">
					<Icon icon={Download02Icon} size={32} color="#fff" />
				</div>
			</div>

			<Drawer.Header class="drawer-header-custom">
				<Drawer.Title class="drawer-title-custom">
					{s.title}
				</Drawer.Title>
			</Drawer.Header>

			<div class="drawer-body">
				<div class="body-inner">
					<div class="steps-grid">
						{#each steps as step, i (i)}
							<div class="step-card" use:fadeUp={{ delay: 0.1 * i }}>
								<div class="step-header">
									<div class="step-badge">{i + 1}</div>
									<div class="step-icon-ios">
										<Icon icon={step.icon} size={22} strokeWidth={2} />
									</div>
								</div>
								<div class="step-content">
									<div class="step-label">{step.label}</div>
									<div class="step-desc">{step.desc}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</Drawer.Content>
</Drawer.Root>

<style>
	/* ── Drawer wrapper ── */
	.drawer-wrap {
		max-width: 40rem;
		margin: 0 auto;
		width: 100%;
		padding: 0 0 40px;
		font-family: var(--font-ui);
	}
	.drawer-header-visual {
		display: flex;
		justify-content: center;
		margin-top: -30px;
		margin-bottom: 20px;
	}
	.header-icon {
		width: 64px;
		height: 64px;
		background: var(--brand-primary);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 12px 32px rgba(188, 0, 45, 0.4);
		border: 4px solid var(--bg-surface);
	}

	/* ── Close row ── */
	.drawer-close-row {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 8px;
	}

	:global(.drawer-close-btn) {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--ink-100);
		color: var(--fg-secondary);
		border: none;
		cursor: pointer;
		transition: background 150ms, color 150ms;
	}
	@media (hover: hover) {
		:global(.drawer-close-btn:hover) {
			background: var(--ink-200);
			color: var(--fg-primary);
		}
	}

	/* ── Header ── */
	:global(.drawer-header-custom) {
		padding: 24px 24px 16px !important;
		text-align: center;
	}

	:global(.drawer-title-custom) {
		font-family: var(--font-ui) !important;
		font-size: 24px !important;
		font-weight: 900 !important;
		letter-spacing: -0.03em !important;
		color: var(--fg-primary) !important;
		line-height: 1.1 !important;
	}

	.body-inner {
		padding: 0 24px;
	}
	.steps-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}
	.step-card {
		background: var(--bg-muted);
		padding: 16px;
		border-radius: 20px;
		border: 1px solid var(--ink-200);
		transition: transform 0.2s;
	}
	.step-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}
	.step-badge {
		width: 22px;
		height: 22px;
		background: var(--brand-primary);
		color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: 800;
	}
	.step-icon-ios {
		color: var(--brand-primary);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.step-content {
		padding-right: 12px;
	}
	.step-label {
		font-size: 16px;
		font-weight: 800;
		color: var(--fg-primary);
		line-height: 1.1;
		margin-bottom: 2px;
	}
	.step-desc {
		font-size: 13px;
		color: var(--fg-secondary);
		line-height: 1.3;
		opacity: 0.8;
	}

	/* ── QR block ── */
	.qr-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 20px;
		background: var(--ink-100);
		border-radius: 16px;
		border: 1px solid var(--ink-200);
		margin-bottom: 24px;
	}

	.qr-url {
		font-size: 13px;
		color: var(--fg-secondary);
		font-family: monospace;
	}

	/* ── Desktop description ── */
	.desktop-desc {
		font-size: 14px;
		color: var(--fg-secondary);
		line-height: 1.5;
		margin: 0 0 24px;
		font-family: var(--font-ui);
	}

	/* ── Tabs ── */
	.tabs-wrap {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: var(--ink-100);
		border-radius: 12px;
		margin-bottom: 24px;
	}

	.tab-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 600;
		font-family: var(--font-ui);
		color: var(--fg-secondary);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 180ms ease;
	}

	.tab-active {
		background: var(--bg-surface);
		color: var(--fg-primary);
		box-shadow: var(--shadow-sm);
	}

	/* ── Tab content ── */
	.tab-content {
		min-height: 200px;
	}

	/* ── PWA Note ── */
	.pwa-note {
		margin-top: 24px;
		padding-top: 16px;
		border-top: 1px solid var(--ink-200);
		font-size: 12px;
		color: var(--fg-tertiary);
		line-height: 1.5;
		font-family: var(--font-ui);
	}
</style>
