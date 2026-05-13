<script lang="ts">
	import { fadeUp } from '$lib/motion';
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import Icon from '$lib/Icon.svelte';
	import { HappyIcon, GraduationScrollIcon, TeacherIcon } from '@hugeicons/core-free-icons';

	import StickyFooter from '$lib/components/StickyFooter.svelte';

	let { onSelect, onBack } = $props();

	const options = $derived([
		{
			id: 'new',
			label: t('onboarding.experience.new', $locale),
			icon: HappyIcon,
			color: '#ff2d55'
		},
		{
			id: 'some',
			label: t('onboarding.experience.some', $locale),
			icon: GraduationScrollIcon,
			color: '#007aff'
		},
		{
			id: 'teacher',
			label: t('onboarding.experience.teacher', $locale),
			icon: TeacherIcon,
			color: '#34c759'
		}
	]);

	let selected = $state('');

	function handleSelect(id: string) {
		selected = id;
		onSelect(id);
	}
</script>

<div class="step-content">
	<header class="header" use:fadeUp={{ delay: 0, y: 16 }}>
		<h1 class="title">{t('onboarding.experience.title', $locale)}</h1>
		<p class="subtitle">{t('onboarding.experience.subtitle', $locale)}</p>
	</header>

	<div class="options-list">
		{#each options as option, i (option.id)}
			<button
				class="option-row"
				class:selected={selected === option.id}
				use:fadeUp={{ delay: 0.1 + i * 0.08, y: 12 }}
				onclick={() => handleSelect(option.id)}
			>
				<div class="icon-box" style="background: {option.color}14; color: {option.color};">
					<Icon icon={option.icon} size={20} color="currentColor" strokeWidth={2} />
				</div>
				<div class="label-group">
					<span class="label">{option.label}</span>
				</div>
			</button>
		{/each}
	</div>

	<StickyFooter {onBack} />
</div>

<style>
	.step-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 40px 24px 100px;
	}

	.header {
		text-align: center;
		margin-bottom: 32px;
	}

	.title {
		font-size: var(--step-title);
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1.1;
		margin: 0 0 12px;
		color: var(--fg-primary);
	}

	.subtitle {
		font-size: var(--step-subtitle);
		color: var(--fg-tertiary);
		font-weight: 500;
		line-height: 1.3;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		max-width: 440px;
		margin: 0 auto;
	}

	.option-row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px 20px;
		background: var(--bg-surface);
		border-radius: 20px;
		transition: all 0.2s ease;
		position: relative;
		outline: none;
		border: 1.5px solid transparent;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}

	.option-row.selected {
		background: var(--ink-100);
	}

	.icon-box {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}

	.selected .icon-box {
		transform: scale(1.05);
	}

	.label-group {
		flex: 1;
	}

	.label {
		font-size: 16px;
		font-weight: 600;
		color: var(--fg-primary);
		letter-spacing: -0.04em;
	}

	@media (max-width: 400px) {
		.option-row {
			padding: 12px 16px;
		}
		.icon-box {
			width: 40px;
			height: 40px;
		}
	}
</style>
