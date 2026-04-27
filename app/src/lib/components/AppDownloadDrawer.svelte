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
		<div class="mx-auto w-full max-w-md p-6 pb-12">
			<!-- Close button -->
			<div class="flex justify-end mb-2">
				<Drawer.Close class="p-2 hover:bg-muted rounded-full transition-colors">
					<Icon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
				</Drawer.Close>
			</div>

			<Drawer.Header class="p-0 mb-8">
				<Drawer.Title class="text-2xl font-bold tracking-tight">
					{#if isMobile}
						{s.title}
					{:else}
						{s.desktopTitle}
					{/if}
				</Drawer.Title>
			</Drawer.Header>

			<div class="drawer-body">
				<!-- iOS content -->
				{#if isIOS}
					<div class="steps-list">
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
					<div class="steps-list">
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
					<p class="desktop-desc mb-6 text-muted-foreground">{s.desktopDesc}</p>

					<!-- QR placeholder -->
					<div class="qr-block mb-8" use:scaleIn={{ delay: 0.1 }}>
						<Icon icon={QrCode01Icon} size={80} strokeWidth={1} color="var(--sumi)" />
						<span class="qr-url font-mono mt-2">hinomaru.app</span>
					</div>

					<!-- Tabs -->
					<div class="tabs mb-6 bg-muted/50 p-1 rounded-xl flex gap-1">
						<button
							class="tab-btn flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
							class:tab-btn-active={desktopTab === 'ios'}
							class:bg-background={desktopTab === 'ios'}
							class:shadow-sm={desktopTab === 'ios'}
							onclick={() => (desktopTab = 'ios')}
						>
							<div class="flex items-center justify-center gap-2">
								<Icon icon={SmartPhone01Icon} size={16} strokeWidth={1.5} />
								{s.tabIOS}
							</div>
						</button>
						<button
							class="tab-btn flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
							class:tab-btn-active={desktopTab === 'android'}
							class:bg-background={desktopTab === 'android'}
							class:shadow-sm={desktopTab === 'android'}
							onclick={() => (desktopTab = 'android')}
						>
							<div class="flex items-center justify-center gap-2">
								<Icon icon={SmartPhone01Icon} size={16} strokeWidth={1.5} />
								{s.tabAndroid}
							</div>
						</button>
					</div>

					<!-- Tab content -->
					<div class="min-h-[200px]">
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
					</div>

					<p class="pwa-note mt-8 pt-4 border-t text-xs text-muted-foreground opacity-70">
						{s.desktopPWANote}
					</p>
				{/if}
			</div>
		</div>
	</Drawer.Content>
</Drawer.Root>

<style>
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
		text-align: left;
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

	.qr-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 20px;
		background: var(--ink-100, rgba(0, 0, 0, 0.04));
		border-radius: 16px;
		border: 1px solid var(--ink-200);
	}

	.qr-url {
		font-size: 13px;
		color: var(--fg-secondary);
	}
</style>
