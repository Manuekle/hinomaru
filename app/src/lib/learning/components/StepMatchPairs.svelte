<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { fade } from 'svelte/transition';
	import { fadeUp } from '$lib/motion';
	import { safeRomaji } from '$lib/utils/romaji';
	import { speakJapanese } from '$lib/utils/tts';
	import Icon from '$lib/Icon.svelte';
	import { CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';

	const props: {
		card: any;
		pool: any[];
		onAnswer: (correct: boolean) => void;
	} = $props();

	const meaningKey = $derived($locale === 'es' ? 'es' : 'en');

	// Build 4 pairs: primary card + 3 from pool
	const pairs = $derived.by(() => {
		const result = [props.card];
		for (const c of props.pool) {
			if (result.length >= 4) break;
			if (c.id === props.card.id) continue;
			if (c.jp && c[$locale === 'es' ? 'es' : 'en']) result.push(c);
		}
		return result;
	});

	interface Item { id: string; text: string; romaji?: string; side: 'jp' | 'es' }

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	const jpItems = $derived<Item[]>(
		shuffle(pairs.map(c => ({ id: c.id, text: c.jp, romaji: c.romaji, side: 'jp' as const })))
	);
	const esItems = $derived<Item[]>(
		shuffle(pairs.map(c => ({ id: c.id, text: c[meaningKey], side: 'es' as const })))
	);

	let selectedJp: string | null = $state(null);
	let selectedEs: string | null = $state(null);
	let matched = $state(new Set<string>());
	let shakeId: string | null = $state(null);
	let hadMistake = $state(false);
	let done = $state(false);

	$effect(() => {
		props.card;
		selectedJp = null;
		selectedEs = null;
		matched = new Set();
		shakeId = null;
		hadMistake = false;
		done = false;
	});

	function selectJp(item: Item) {
		if (matched.has(item.id) || done) return;
		selectedJp = item.id;
		speakJapanese(item.text);
		tryMatch();
	}

	function selectEs(id: string) {
		if (matched.has(id) || done) return;
		selectedEs = id;
		tryMatch();
	}

	function tryMatch() {
		if (!selectedJp || !selectedEs) return;
		const jp = selectedJp;
		const es = selectedEs;

		if (jp === es) {
			matched = new Set([...matched, jp]);
			selectedJp = null;
			selectedEs = null;
			if (matched.size === pairs.length) {
				done = true;
				setTimeout(() => props.onAnswer(!hadMistake), 600);
			}
		} else {
			hadMistake = true;
			shakeId = jp;
			setTimeout(() => {
				shakeId = null;
				selectedJp = null;
				selectedEs = null;
			}, 500);
		}
	}
</script>

<div class="step-layout">
	<div class="step-content">
		<div class="match-header">
			<span class="prompt-tag">{$locale === 'es' ? 'EMPAREJAR' : 'MATCH PAIRS'}</span>
		</div>

		<div class="pairs-grid">
			<div class="col">
				{#each jpItems as item (item.id)}
					<button
						class="pair-btn jp"
						class:is-selected={selectedJp === item.id}
						class:is-matched={matched.has(item.id)}
						class:is-shake={shakeId === item.id}
						class:has-romaji={true}
						disabled={matched.has(item.id) || done}
						onclick={() => selectJp(item)}
					>
						<div class="jp-text">{item.text}</div>
						<div class="romaji-text">{safeRomaji(item.romaji, item.text)}</div>
					</button>
				{/each}
			</div>
			<div class="col">
				{#each esItems as item (item.id)}
					<button
						class="pair-btn es"
						class:is-selected={selectedEs === item.id}
						class:is-matched={matched.has(item.id)}
						disabled={matched.has(item.id) || done}
						onclick={() => selectEs(item.id)}
					>
						{item.text}
					</button>
				{/each}
			</div>
		</div>

		{#if done}
			<div class="done-message" in:fadeUp={{ y: 10 }}>
				<div class="success-badge">
					<Icon icon={CheckmarkCircle01Icon} size={18} color="currentColor" />
					<span>{$locale === 'es' ? '¡Parejas encontradas!' : 'All pairs matched!'}</span>
				</div>
			</div>
		{/if}
	</div>

	<div class="step-footer"></div>
</div>

<style>
	.step-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 24px;
	}

	.match-header {
		width: 100%;
		display: flex;
		justify-content: center;
		margin-bottom: 8px;
	}

	.prompt-tag {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 4px 10px;
		border-radius: 20px;
	}

	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 24px;
	}

	.pairs-grid {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		align-items: stretch;
	}

	.col {
		display: grid;
		grid-template-columns: 1fr;
		grid-auto-rows: 1fr;
		gap: 12px;
	}

	.pair-btn {
		width: 100%;
		flex: 1;
		min-height: 72px;
		padding: 12px;
		border-radius: 16px;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-surface);
		color: var(--fg-primary);
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		transition: all 0.2s cubic-bezier(0.34, 1.5, 0.64, 1);
		box-shadow: 0 1px 4px rgba(26,26,26,0.04);
	}

	.pair-btn.jp { 
		font-family: var(--font-jp); 
		font-size: 18px; 
		word-break: break-word;
	}
	.pair-btn.es { 
		font-size: 13px; 
		line-height: 1.2;
		word-break: break-word;
	}

	.pair-btn:not(:disabled):hover { border-color: var(--ink-300); transform: translateY(-1px); }

	.pair-btn.is-selected {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		color: var(--hinomaru-red);
		transform: scale(1.02);
		z-index: 10;
	}

	.pair-btn.is-matched {
		border-color: var(--success);
		background: var(--success-wash);
		color: var(--success);
		opacity: 0.6;
		transform: scale(0.98);
	}

	.pair-btn.has-romaji {
		padding: 10px 14px;
		flex-direction: column;
		gap: 2px;
	}

	.romaji-text {
		font-size: 11px;
		font-weight: 700;
		color: var(--hinomaru-red);
		opacity: 0.9;
	}

	.pair-btn.is-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; border-color: var(--hinomaru-red); }

	.done-message {
		display: flex;
		justify-content: center;
		margin-top: 12px;
	}

	.success-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		background: var(--success-wash);
		color: var(--success);
		border-radius: 20px;
		font-weight: 800;
		font-size: 14px;
	}

	.step-footer {
		padding-bottom: 24px;
	}


	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}
</style>
