<script lang="ts">
	import { locale } from '$lib/stores/locale';
	import { fade } from 'svelte/transition';

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

	interface Item { id: string; text: string; side: 'jp' | 'es' }

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	const jpItems = $derived<Item[]>(
		shuffle(pairs.map(c => ({ id: c.id, text: c.jp, side: 'jp' as const })))
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

	function selectJp(id: string) {
		if (matched.has(id) || done) return;
		selectedJp = id;
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
	<div class="step-header">
		<div class="step-instruction">
			{$locale === 'es' ? 'Une los pares' : 'Match the pairs'}
		</div>
	</div>

	<div class="step-content">
		<div class="pairs-grid">
			<div class="col">
				{#each jpItems as item (item.id)}
					<button
						class="pair-btn jp"
						class:selected={selectedJp === item.id}
						class:matched={matched.has(item.id)}
						class:shake={shakeId === item.id}
						disabled={matched.has(item.id) || done}
						onclick={() => selectJp(item.id)}
					>
						{item.text}
					</button>
				{/each}
			</div>
			<div class="col">
				{#each esItems as item (item.id)}
					<button
						class="pair-btn es"
						class:selected={selectedEs === item.id}
						class:matched={matched.has(item.id)}
						disabled={matched.has(item.id) || done}
						onclick={() => selectEs(item.id)}
					>
						{item.text}
					</button>
				{/each}
			</div>
		</div>

		{#if done}
			<div class="done-badge" in:fade>
				{$locale === 'es' ? '¡Completado!' : 'Complete!'}
			</div>
		{/if}
	</div>

	<div class="step-footer">
		<div class="progress-dots">
			{#each pairs as p (p.id)}
				<div class="dot" class:done={matched.has(p.id)}></div>
			{/each}
		</div>
	</div>
</div>

<style>
	.step-layout {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.step-header {
		padding-bottom: 24px;
		text-align: center;
	}
	.step-instruction {
		font-size: 14px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--fg-tertiary);
	}
	.step-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 24px;
	}
	.pairs-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		align-items: start;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.pair-btn {
		padding: 16px 12px;
		border-radius: 18px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.18s ease;
		border: 2px solid var(--ink-200);
		background: var(--bg-surface);
		color: var(--sumi);
		width: 100%;
		text-align: center;
		min-height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.pair-btn.jp {
		font-family: var(--font-jp);
		font-size: 20px;
	}
	.pair-btn.es {
		font-size: 14px;
		line-height: 1.3;
	}
	.pair-btn.selected {
		border-color: var(--hinomaru-red);
		background: color-mix(in srgb, var(--hinomaru-red) 8%, var(--bg-surface));
		color: var(--hinomaru-red);
		transform: scale(1.04);
	}
	.pair-btn.matched {
		border-color: var(--success);
		background: color-mix(in srgb, var(--success) 12%, var(--bg-surface));
		color: var(--success);
		opacity: 0.75;
		cursor: default;
	}
	.pair-btn.shake {
		animation: shake 0.45s cubic-bezier(.36,.07,.19,.97) both;
		border-color: var(--hinomaru-red);
		background: color-mix(in srgb, var(--hinomaru-red) 8%, var(--bg-surface));
	}
	.pair-btn:disabled:not(.matched) {
		cursor: default;
	}
	.done-badge {
		text-align: center;
		font-size: 18px;
		font-weight: 900;
		color: var(--success);
		padding: 12px;
	}
	.step-footer {
		padding-top: 24px;
	}
	.progress-dots {
		display: flex;
		gap: 8px;
		justify-content: center;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--ink-200);
		transition: background 0.3s;
	}
	.dot.done {
		background: var(--success);
	}
	@keyframes shake {
		10%, 90% { transform: translate3d(-2px, 0, 0); }
		20%, 80% { transform: translate3d(3px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}
</style>
