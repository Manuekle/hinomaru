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

	function close() {
		open = false;
	}

	// i18n strings
	const strings = {
		es: {
			title: 'Instalar la app',
			iosStep1Label: 'Abrir en Safari',
			iosStep1Desc: 'Asegúrate de usar el navegador Safari',
			iosStep2Label: 'Tocar el botón Compartir',
			iosStep2Desc: 'El ícono de flecha arriba en la barra inferior',
			iosStep3Label: 'Seleccionar "Agregar a inicio"',
			iosStep3Desc: 'Se instalará como una app nativa',
			androidStep1Label: 'Abrir en Chrome',
			androidStep1Desc: 'Asegúrate de usar el navegador Chrome',
			androidStep2Label: 'Tocar el menú ⋮',
			androidStep2Desc: 'Los tres puntos en la esquina superior derecha',
			androidStep3Label: 'Tocar "Instalar app"',
			androidStep3Desc: 'La app se añadirá a tu pantalla principal',
			desktopTitle: 'Instala Hinomaru en tu móvil',
			desktopDesc: 'Escanea el código QR con tu teléfono o elige tu sistema operativo:',
			tabIOS: 'iOS (iPhone / iPad)',
			tabAndroid: 'Android',
			desktopPWANote:
				'También puedes instalar la app desde este navegador usando el ícono de instalación en la barra de dirección.',
			close: 'Cerrar'
		},
		en: {
			title: 'Install the app',
			iosStep1Label: 'Open in Safari',
			iosStep1Desc: 'Make sure you are using the Safari browser',
			iosStep2Label: 'Tap the Share button',
			iosStep2Desc: 'The arrow-up icon in the bottom toolbar',
			iosStep3Label: 'Select "Add to Home Screen"',
			iosStep3Desc: 'It will be installed as a native app',
			androidStep1Label: 'Open in Chrome',
			androidStep1Desc: 'Make sure you are using Chrome',
			androidStep2Label: 'Tap the ⋮ menu',
			androidStep2Desc: 'Three dots in the top-right corner',
			androidStep3Label: 'Tap "Install app"',
			androidStep3Desc: 'The app will be added to your home screen',
			desktopTitle: 'Install Hinomaru on your phone',
			desktopDesc: 'Scan the QR code with your phone or choose your OS:',
			tabIOS: 'iOS (iPhone / iPad)',
			tabAndroid: 'Android',
			desktopPWANote:
				'You can also install from this browser using the install icon in the address bar.',
			close: 'Close'
		}
	};

	const s = $derived(strings[$locale as 'es' | 'en'] ?? strings.es);

	const iosSteps = $derived([
		{ icon: SmartPhone01Icon, label: s.iosStep1Label, desc: s.iosStep1Desc },
		{ icon: ArrowUp01Icon, label: s.iosStep2Label, desc: s.iosStep2Desc },
		{ icon: Add01Icon, label: s.iosStep3Label, desc: s.iosStep3Desc }
	]);

	const androidSteps = $derived([
		{ icon: SmartPhone01Icon, label: s.androidStep1Label, desc: s.androidStep1Desc },
		{ icon: More01Icon, label: s.androidStep2Label, desc: s.androidStep2Desc },
		{ icon: Download02Icon, label: s.androidStep3Label, desc: s.androidStep3Desc }
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
					{#if isMobile}
						{s.title}
					{:else}
						{s.desktopTitle}
					{/if}
				</Drawer.Title>
			</Drawer.Header>

			<div class="drawer-body">
				<!-- Content wrapper for padding -->
				<div class="body-inner">
					<!-- iOS content -->
					{#if isIOS}
						<div class="steps-grid">
							{#each iosSteps as step, i (i)}
								<div class="step-card">
									<div class="step-header">
										<div class="step-badge">{i + 1}</div>
										<Icon icon={step.icon} size={20} strokeWidth={2} color="var(--brand-primary)" />
									</div>
									<div class="step-label">{step.label}</div>
									<div class="step-desc">{step.desc}</div>
								</div>
							{/each}
						</div>

						<!-- Android content -->
					{:else if isAndroid}
						<div class="steps-grid">
							{#each androidSteps as step, i (i)}
								<div class="step-card">
									<div class="step-header">
										<div class="step-badge">{i + 1}</div>
										<Icon icon={step.icon} size={20} strokeWidth={2} color="var(--brand-primary)" />
									</div>
									<div class="step-label">{step.label}</div>
									<div class="step-desc">{step.desc}</div>
								</div>
							{/each}
						</div>
					{:else}
						<!-- Desktop stays similar but refined -->
						<p class="desktop-desc">{s.desktopDesc}</p>
						...
					{/if}
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
	.step-label {
		font-size: 15px;
		font-weight: 800;
		color: var(--fg-primary);
		line-height: 1.2;
		margin-bottom: 4px;
	}
	.step-desc {
		font-size: 13px;
		color: var(--fg-secondary);
		line-height: 1.4;
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
