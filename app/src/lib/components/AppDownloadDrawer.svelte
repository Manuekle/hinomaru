<script lang="ts">
	import { onMount } from 'svelte';
	import { fadeUp } from '$lib/motion';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import ResponsiveModal from '$lib/components/ui/ResponsiveModal.svelte';
	import {
		SmartPhone01Icon,
		ArrowUp01Icon,
		Add01Icon
	} from '@hugeicons/core-free-icons';

	let { open = $bindable(false) } = $props();

	let isIOS = $state(false);
	let isAndroid = $state(false);

	onMount(() => {
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
		isAndroid = /Android/.test(navigator.userAgent);

		if (isAndroid) {
			document.documentElement.classList.add('is-android');
		} else {
			document.documentElement.classList.remove('is-android');
		}
	});

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

<ResponsiveModal bind:open title={s.title}>
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
				<div class="step-icon-ios">
					<Icon icon={step.icon} size={20} strokeWidth={2.5} />
				</div>
			</div>
		{/each}
	</div>
</ResponsiveModal>

<style>
	.steps-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 8px;
		font-family: var(--font-ui);
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
		font-weight: 700;
	}
	.step-icon-ios {
		width: 36px;
		height: 36px;
		background: var(--bg-surface);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--brand-primary);
		flex-shrink: 0;
		box-shadow: var(--shadow-sm);
	}
	.step-content {
		flex: 1;
		padding: 0 4px;
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
</style>
