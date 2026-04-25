<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';

	let { onSelect } = $props();

	const options = $derived([
		{ id: 'new', label: t('onboarding.experience.new', $locale), icon: '😊' },
		{ id: 'some', label: t('onboarding.experience.some', $locale), icon: '🎓' },
		{ id: 'teacher', label: t('onboarding.experience.teacher', $locale), icon: '👨‍🏫' }
	]);

	let selected = $state<string | null>(null);

	function handleSelect(id: string) {
		selected = id;
		setTimeout(() => onSelect(id), 250);
	}
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.experience.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.experience.subtitle', $locale)}</p>
	</header>

	<div class="options-list">
		{#each options as option, i}
			<button
				class="option-btn"
				class:selected={selected === option.id}
				use:fadeUp={{ delay: 0.1 + i * 0.05, y: 12 }}
				onclick={() => handleSelect(option.id)}
			>
				<span class="icon">{option.icon}</span>
				<span class="label">{option.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 40px 24px;
	}

	.header {
		text-align: center;
		margin-bottom: 60px;
	}

	.title {
		font-size: 32px;
		font-weight: 600;
		letter-spacing: -0.04em;
		line-height: 1.1;
		margin: 0 0 80px;
	}

	.subtitle {
		font-size: 20px;
		color: var(--fg-tertiary);
		font-weight: 600;
		margin: 0;
		line-height: 1.3;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.option-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 20px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
		text-align: left;
	}

	.option-btn:hover {
		border-color: var(--ink-300);
		background: var(--ink-50);
	}

	.option-btn.selected {
		border-color: var(--sumi);
		background: var(--ink-100);
		transform: scale(0.98);
	}

	.icon {
		font-size: 20px;
	}

	.label {
		font-size: 17px;
		font-weight: 600;
		color: var(--fg-primary);
	}
</style>
