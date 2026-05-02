<script lang="ts">
	import { t } from '$lib/i18n';
	import { locale } from '$lib/stores/locale';
	import { fadeUp, fadeIn } from '$lib/motion';
	import Icon from '$lib/Icon.svelte';
	import { PlayIcon, LockIcon, Tick01Icon } from '@hugeicons/core-free-icons';

	let { decks = [] } = $props();

	// Define the roadmap structure (groups of decks)
	const units = [
		{
			id: 'unit-1',
			title_en: 'Foundations',
			title_es: 'Fundamentos',
			decks: ['n5-hiragana', 'n5-katakana']
		},
		{
			id: 'unit-2',
			title_en: 'First Contact',
			title_es: 'Primer Contacto',
			decks: ['n5-greetings', 'survival-intro']
		},
		{
			id: 'unit-3',
			title_en: 'Basics',
			title_es: 'Lo Básico',
			decks: ['n5-numbers', 'n5-family']
		},
		{
			id: 'unit-4',
			title_en: 'Daily Life',
			title_es: 'Vida Diaria',
			decks: ['n5-food', 'n5-colors']
		},
		{
			id: 'unit-5',
			title_en: 'The World',
			title_es: 'El Mundo',
			decks: ['n5-animals', 'n5-weather']
		},
		{
			id: 'unit-6',
			title_en: 'Actions',
			title_es: 'Acciones',
			decks: ['n5-verbs', 'n5-adjectives']
		},
		{
			id: 'unit-7',
			title_en: 'Exploration',
			title_es: 'Exploración',
			decks: ['n5-places', 'n5-grammar-intro']
		}
	];

	// Map deck IDs to full deck objects
	const roadmapDecks = $derived(
		units.flatMap((u) =>
			u.decks.map((id) => {
				const deck = decks.find((d: any) => d.id === id);
				return { ...deck, unit: u };
			})
		).filter(d => d.id) // Filter out missing decks
	);

	function getOffset(index: number) {
		const pattern = [0, 45, 75, 45, 0, -45, -75, -45];
		return pattern[index % pattern.length];
	}

	function isUnlocked(index: number, deck: any) {
		if (index === 0) return true;
		const prevDeck = roadmapDecks[index - 1];
		return (prevDeck.learned ?? 0) >= (prevDeck.card_count || 1);
	}
</script>

<div class="roadmap-container">
	<div class="roadmap-path">
		{#each roadmapDecks as deck, i (deck.id)}
			{@const unlocked = isUnlocked(i, deck)}
			{@const completed = deck.card_count > 0 && (deck.learned ?? 0) >= deck.card_count}
			{@const offset = getOffset(i)}

			<div 
				class="roadmap-node-wrap" 
				style="transform: translateX({offset}px);"
				use:fadeUp={{ delay: i * 0.05, y: 20 }}
			>
				{#if i > 0}
					<div class="roadmap-line" class:line-active={unlocked}></div>
				{/if}

				<div class="node-content">
					<a
						href={unlocked ? `/deck/${deck.id}` : '#'}
						class="roadmap-node"
						class:node-locked={!unlocked}
						class:node-completed={completed}
						aria-label={deck.title_es}
					>
						<div class="node-inner">
							{#if completed}
								<Icon icon={Tick01Icon} size={28} color="white" variant="solid" />
							{:else if !unlocked}
								<Icon icon={LockIcon} size={24} color="var(--fg-tertiary)" />
							{:else}
								<span class="node-emoji">
									{#if deck.id.includes('hiragana')}🇯🇵{/if}
									{#if deck.id.includes('katakana')}🈁{/if}
									{#if deck.id.includes('greetings')}👋{/if}
									{#if deck.id.includes('intro')}👤{/if}
									{#if deck.id.includes('numbers')}🔢{/if}
									{#if deck.id.includes('family')}👨‍👩‍👧{/if}
									{#if deck.id.includes('food')}🍜{/if}
									{#if deck.id.includes('animals')}🐶{/if}
									{#if deck.id.includes('colors')}🎨{/if}
									{#if deck.id.includes('weather')}☀️{/if}
									{#if deck.id.includes('verbs')}🏃{/if}
									{#if deck.id.includes('adjectives')}🌟{/if}
									{#if deck.id.includes('places')}🏫{/if}
									{#if deck.id.includes('grammar')}📖{/if}
								</span>
							{/if}
						</div>

						{#if unlocked && !completed}
							<svg class="progress-ring" viewBox="0 0 100 100">
								<circle
									class="progress-ring-fill"
									cx="50"
									cy="50"
									r="45"
									style="stroke-dasharray: {2 * Math.PI * 45}; stroke-dashoffset: {2 * Math.PI * 45 * (1 - (deck.learned || 0) / (deck.card_count || 1))};"
								/>
							</svg>
						{/if}
					</a>
					
					<div class="node-label">
						<span class="node-title">{$locale === 'es' ? deck.title_es : deck.title_en}</span>
						{#if completed}
							<span class="node-status">{t('home.complete', $locale)}</span>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.roadmap-container {
		padding: 40px 0 120px;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-x: hidden;
	}

	.roadmap-path {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 60px;
		width: 100%;
		max-width: 400px;
		position: relative;
	}

	.roadmap-node-wrap {
		position: relative;
		display: flex;
		justify-content: center;
		width: 100%;
		transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.roadmap-line {
		position: absolute;
		bottom: 100%;
		left: 50%;
		width: 4px;
		height: 60px;
		background: var(--ink-100);
		transform: translateX(-50%);
		z-index: 1;
	}

	.line-active {
		background: var(--hinomaru-red);
		opacity: 0.3;
	}

	.node-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		z-index: 2;
	}

	.roadmap-node {
		width: 92px;
		height: 92px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		text-decoration: none;
		transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
		background: var(--bg-surface);
		box-shadow: 0 10px 0 var(--ink-100), var(--shadow-lg);
	}

	@media (hover: hover) {
		.roadmap-node:hover:not(.node-locked) {
			transform: scale(1.05) translateY(-4px);
			box-shadow: 0 14px 0 var(--ink-100), var(--shadow-xl);
		}
	}

	.roadmap-node:active:not(.node-locked) {
		transform: translateY(6px);
		box-shadow: 0 4px 0 var(--ink-100), var(--shadow-sm);
	}

	.node-inner {
		width: 76px;
		height: 76px;
		border-radius: 50%;
		background: var(--sumi);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		color: white;
		border: 4px solid rgba(255, 255, 255, 0.1);
	}

	.node-locked .node-inner {
		background: var(--ink-200);
		box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
	}

	.node-completed {
		background: #ffc107;
		box-shadow: 0 10px 0 #d39e00, var(--shadow-lg);
	}
	.node-completed .node-inner {
		background: #ffc107;
		border-color: rgba(255, 255, 255, 0.3);
	}

	.node-emoji {
		font-size: 32px;
	}

	.progress-ring {
		position: absolute;
		inset: -6px;
		width: 96px;
		height: 96px;
		transform: rotate(-90deg);
		pointer-events: none;
	}

	.progress-ring-fill {
		fill: none;
		stroke: var(--hinomaru-red);
		stroke-width: 6;
		stroke-linecap: round;
		transition: stroke-dashoffset 0.5s ease;
	}

	.node-label {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 140px;
	}

	.node-title {
		font-weight: 800;
		font-size: 15px;
		color: var(--sumi);
		letter-spacing: -0.01em;
	}

	.node-status {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		color: #ffc107;
		letter-spacing: 0.05em;
		margin-top: 2px;
	}

	.node-locked {
		pointer-events: none;
		opacity: 0.8;
	}
</style>
