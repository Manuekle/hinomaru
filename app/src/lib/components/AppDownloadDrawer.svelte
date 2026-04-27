<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp, fadeIn, scaleIn } from '$lib/motion';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
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

	// Swipe to close logic
	let touchStartY = 0;
	let touchCurrentY = 0;
	let isSwiping = $state(false);
	let swipeOffset = $state(0);

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

	function handleTouchStart(e: TouchEvent) {
		if (!isMobile) return;
		touchStartY = e.touches[0].clientY;
		isSwiping = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isSwiping) return;
		touchCurrentY = e.touches[0].clientY;
		const deltaY = touchCurrentY - touchStartY;
		if (deltaY > 0) {
			swipeOffset = deltaY;
		}
	}

	function handleTouchEnd() {
		if (!isSwiping) return;
		if (swipeOffset > 100) {
			close();
		}
		isSwiping = false;
		swipeOffset = 0;
	}

	function close() {
		open = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
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

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div use:fadeIn class="backdrop" onclick={handleBackdropClick}></div>

	<!-- Drawer / Modal -->
	<div
		use:fadeUp={{ y: 24, duration: 0.4 }}
		class="drawer"
		class:is-swiping={isSwiping}
		style="transform: {isMobile && !isAndroid ? `translateY(${swipeOffset}px)` : ''}"
		role="dialog"
		aria-modal="true"
		aria-label={s.title}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	>
		<!-- Close button -->
		<button class="close-btn" onclick={close} aria-label={s.close}>
			<Icon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
		</button>

		<!-- Handle bar (mobile only) -->
		<div class="handle-bar"></div>

		<!-- Title -->
		<h2 class="drawer-title">
			{#if isMobile}
				{s.title}
			{:else}
				{s.desktopTitle}
			{/if}
		</h2>

		<!-- iOS content -->
		{#if isIOS}
			<div class="steps-list" use:fadeUp={{ delay: 0.05 }}>
				{#each iosSteps as step, i (i)}
					<div class="step-item">
						<div class="step-number">{i + 1}</div>
						<div class="step-icon-wrap">
							<Icon icon={step.icon} size={22} strokeWidth={1.5} color="var(--hinomaru-red)" />
						</div>
						<div class="step-text">
							<div class="step-label">{step.label}</div>
							<div class="step-desc">{step.desc}</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Android content -->
		{:else if isAndroid}
			<div class="steps-list" use:fadeUp={{ delay: 0.05 }}>
				{#each androidSteps as step, i (i)}
					<div class="step-item">
						<div class="step-number">{i + 1}</div>
						<div class="step-icon-wrap">
							<Icon icon={step.icon} size={22} strokeWidth={1.5} color="var(--hinomaru-red)" />
						</div>
						<div class="step-text">
							<div class="step-label">{step.label}</div>
							<div class="step-desc">{step.desc}</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Desktop content -->
		{:else}
			<p class="desktop-desc">{s.desktopDesc}</p>

			<!-- QR placeholder -->
			<div class="qr-block" use:scaleIn={{ delay: 0.1 }}>
				<Icon icon={QrCode01Icon} size={80} strokeWidth={1} color="var(--sumi)" />
				<span class="qr-url">hinomaru.app</span>
			</div>

			<!-- Tabs -->
			<div class="tabs">
				<button
					class="tab-btn"
					class:tab-btn-active={desktopTab === 'ios'}
					onclick={() => (desktopTab = 'ios')}
				>
					<Icon icon={SmartPhone01Icon} size={16} strokeWidth={1.5} />
					{s.tabIOS}
				</button>
				<button
					class="tab-btn"
					class:tab-btn-active={desktopTab === 'android'}
					onclick={() => (desktopTab = 'android')}
				>
					<Icon icon={SmartPhone01Icon} size={16} strokeWidth={1.5} />
					{s.tabAndroid}
				</button>
			</div>

			<!-- Tab content -->
			{#if desktopTab === 'ios'}
				<div class="steps-list steps-list-compact">
					{#each iosSteps as step, i (i)}
						<div class="step-item">
							<div class="step-number">{i + 1}</div>
							<div class="step-icon-wrap">
								<Icon icon={step.icon} size={18} strokeWidth={1.5} color="var(--hinomaru-red)" />
							</div>
							<div class="step-text">
								<div class="step-label">{step.label}</div>
								<div class="step-desc">{step.desc}</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="steps-list steps-list-compact">
					{#each androidSteps as step, i (i)}
						<div class="step-item">
							<div class="step-number">{i + 1}</div>
							<div class="step-icon-wrap">
								<Icon icon={step.icon} size={18} strokeWidth={1.5} color="var(--hinomaru-red)" />
							</div>
							<div class="step-text">
								<div class="step-label">{step.label}</div>
								<div class="step-desc">{step.desc}</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<p class="pwa-note">{s.desktopPWANote}</p>
		{/if}
	</div>
{/if}

<style>
	/* Backdrop */
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 199;
	}

	/* Drawer base (mobile-first: bottom sheet) */
	.drawer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 200;
		background: var(--bg-surface);
		border-radius: 24px 24px 0 0;
		padding: 32px 24px calc(32px + env(safe-area-inset-bottom));
		box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.15);
		max-height: 90dvh;
		overflow-y: auto;
	}
	.drawer.is-swiping {
		transition: none !important;
	}

	/* Force modal for Android and Desktop */
	:global(.is-android) .drawer {
		bottom: auto;
		left: 50%;
		top: 50%;
		right: auto;
		transform: translate(-50%, -50%) !important;
		border-radius: 24px;
		width: min(480px, 90vw);
		max-height: 85dvh;
		padding: 32px 32px 36px;
	}

	:global(.is-android) .handle-bar {
		display: none;
	}

	@media (min-width: 768px) {
		.drawer {
			bottom: auto;
			left: 50%;
			top: 50%;
			right: auto;
			transform: translate(-50%, -50%) !important;
			border-radius: 24px;
			width: min(480px, 90vw);
			max-height: 85dvh;
			padding: 32px 32px 36px;
		}
		.handle-bar {
			display: none;
		}
	}

	/* Handle bar */
	.handle-bar {
		width: 40px;
		height: 4px;
		background: var(--ink-200);
		border-radius: 2px;
		margin: 0 auto 24px;
	}

	/* Close button */
	.close-btn {
		position: absolute;
		top: 20px;
		right: 20px;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 1px solid var(--ink-200);
		background: var(--washi, var(--paper));
		color: var(--fg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			background 150ms ease,
			color 150ms ease;
		padding: 0;
	}
	.close-btn:hover {
		background: var(--ink-100);
		color: var(--sumi);
	}

	/* Title */
	.drawer-title {
		font-size: 22px;
		font-weight: 400;
		color: var(--sumi);
		margin: 0 0 24px;
		letter-spacing: -0.02em;
		padding-right: 40px;
	}

	/* Steps list */
	.steps-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.steps-list-compact {
		gap: 12px;
	}

	/* Step item */
	.step-item {
		display: flex;
		align-items: flex-start;
		gap: 14px;
	}

	.step-number {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--hinomaru-red);
		color: #fff;
		font-size: 13px;
		font-weight: 400;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 2px;
	}

	.step-icon-wrap {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: color-mix(in srgb, var(--hinomaru-red) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--hinomaru-red) 16%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.steps-list-compact .step-icon-wrap {
		width: 34px;
		height: 34px;
		border-radius: 10px;
	}

	.step-text {
		flex: 1;
		padding-top: 2px;
	}

	.step-label {
		font-size: 15px;
		font-weight: 700;
		color: var(--fg-primary, var(--sumi));
		line-height: 1.3;
	}

	.step-desc {
		font-size: 13px;
		color: var(--fg-secondary);
		margin-top: 2px;
		line-height: 1.4;
	}

	/* Desktop-specific */
	.desktop-desc {
		font-size: 14px;
		color: var(--fg-secondary);
		margin: 0 0 20px;
		line-height: 1.5;
	}

	.qr-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 20px;
		background: var(--ink-100, rgba(0, 0, 0, 0.04));
		border-radius: 16px;
		margin-bottom: 20px;
		border: 1px solid var(--ink-200);
	}

	.qr-url {
		font-size: 13px;
		color: var(--fg-secondary);
		font-weight: 600;
	}

	/* Tabs */
	.tabs {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
		background: var(--ink-100, rgba(0, 0, 0, 0.04));
		border-radius: 12px;
		padding: 4px;
	}

	.tab-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 10px;
		border-radius: 9px;
		border: none;
		background: transparent;
		color: var(--fg-secondary);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 150ms ease,
			color 150ms ease;
		white-space: nowrap;
	}

	.tab-btn:hover {
		background: var(--bg-surface);
		color: var(--sumi);
	}

	.tab-btn-active {
		background: var(--bg-surface);
		color: var(--sumi);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	}

	/* PWA note */
	.pwa-note {
		font-size: 12px;
		color: var(--fg-secondary);
		margin: 16px 0 0;
		line-height: 1.5;
		opacity: 0.7;
		border-top: 1px solid var(--ink-100);
		padding-top: 14px;
	}
</style>
