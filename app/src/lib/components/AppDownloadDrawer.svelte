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
			<Drawer.Header class="drawer-header-custom">
				<Drawer.Title class="drawer-title-custom">
					{s.title}
				</Drawer.Title>
			</Drawer.Header>

			<div class="drawer-body">
				<div class="body-inner">
					<div class="steps-grid">
						{#each steps as step, i (i)}
							<div class="step-card" use:fadeUp={{ delay: 0.08 * i }}>
								<div class="step-header">
									<div class="step-badge">{i + 1}</div>
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
		padding: 20px 24px 12px !important;
		text-align: left;
	}

	:global(.drawer-title-custom) {
		font-family: var(--font-ui) !important;
		font-size: 20px !important;
		font-weight: 800 !important;
		letter-spacing: -0.02em !important;
		color: var(--fg-primary) !important;
	}

	.body-inner {
		padding: 0 24px 32px;
	}
	.steps-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 8px;
	}
	.step-card {
		display: flex;
		align-items: center;
		gap: 16px;
		background: var(--bg-muted);
		padding: 12px 16px;
		border-radius: 16px;
		border: 1px solid var(--ink-200);
	}
	.step-header {
		flex-shrink: 0;
	}
	.step-badge {
		width: 24px;
		height: 24px;
		background: var(--brand-primary);
		color: #fff;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 800;
	}
	.step-content {
		flex: 1;
	}
	.step-label {
		font-size: 15px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1.2;
	}
	.step-desc {
		font-size: 12px;
		color: var(--fg-secondary);
		line-height: 1.2;
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
		margin-top: 16px;
		padding-top: 12px;
		border-top: 1px solid var(--ink-100);
		font-size: 11px;
		color: var(--fg-tertiary);
		line-height: 1.4;
		font-family: var(--font-ui);
	}
</style>
