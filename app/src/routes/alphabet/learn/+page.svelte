<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { locale } from '$lib/stores/locale';
	import { fadeIn } from '$lib/motion';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { ALL_CHARS, WORDS, type KanaChar, type KanaWord } from '$lib/data/alphabetCharacters';
	import { recordResult, alphabetProgress, isLearned } from '$lib/stores/alphabetProgress';
	import Icon from '$lib/Icon.svelte';
	import { Cancel01Icon } from '@hugeicons/core-free-icons';
	import AnticipationScreen from '$lib/components/ui/AnticipationScreen.svelte';
	import AlphabetIntroduce from '$lib/components/alphabet/AlphabetIntroduce.svelte';
	import AlphabetCharMcq from '$lib/components/alphabet/AlphabetCharMcq.svelte';
	import AlphabetListenWord from '$lib/components/alphabet/AlphabetListenWord.svelte';
	import MatchPairs from '$lib/components/study/MatchPairs.svelte';

	type StepKind = 'introduce' | 'sound_for_char' | 'char_for_sound' | 'match_pairs' | 'listen_word';

	interface Step {
		kind: StepKind;
		char?: KanaChar;
		word?: KanaWord;
		pool?: KanaChar[];
	}

	const startId = $derived($page.url.searchParams.get('start'));
	const scriptParam = $derived(
		($page.url.searchParams.get('script') as 'hiragana' | 'katakana') ?? 'hiragana'
	);

	let queue = $state<Step[]>([]);
	let stepIdx = $state(0);
	let stepKey = $state(0);
	let done = $state(false);
	let correctCount = $state(0);

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	function poolFor(c: KanaChar, n = 3): KanaChar[] {
		const same = ALL_CHARS.filter((x) => x.script === c.script && x.id !== c.id);
		return shuffle(same).slice(0, n);
	}

	function buildLessonForChar(c: KanaChar): Step[] {
		return [
			{ kind: 'introduce', char: c },
			{ kind: 'sound_for_char', char: c, pool: poolFor(c) },
			{ kind: 'char_for_sound', char: c, pool: poolFor(c) }
		];
	}

	function buildQueue(): Step[] {
		const startChar =
			(startId && ALL_CHARS.find((c) => c.id === startId)) ||
			ALL_CHARS.find((c) => c.script === scriptParam && !isLearned($alphabetProgress[c.id])) ||
			ALL_CHARS.find((c) => c.script === scriptParam);
		if (!startChar) return [];

		const idx = ALL_CHARS.indexOf(startChar);
		const candidates = ALL_CHARS.slice(idx)
			.filter((c) => c.script === scriptParam)
			.slice(0, 4);

		const steps: Step[] = [];
		for (const c of candidates) steps.push(...buildLessonForChar(c));

		if (candidates.length >= 2) {
			steps.push({ kind: 'match_pairs', pool: candidates });
		}

		const charSet = new Set(candidates.map((c) => c.jp));
		const groupId = candidates[0].group;
		const groupWords = WORDS[groupId] ?? [];
		const matchingWord = groupWords.find((w) => w.chars.every((ch) => charSet.has(ch)));
		if (matchingWord) {
			steps.push({ kind: 'listen_word', word: matchingWord });
		}

		return steps;
	}

	onMount(() => {
		queue = buildQueue();
		if (!queue.length) goto('/alphabet');
	});

	const current = $derived(queue[stepIdx]);

	function advance(correct: boolean) {
		if (current?.char) recordResult(current.char.id, correct);
		if (correct) {
			correctCount++;
			playCorrect();
		} else if (current?.kind !== 'introduce') {
			playWrong();
		}
		if (stepIdx >= queue.length - 1) {
			done = true;
		} else {
			stepIdx++;
			stepKey++;
		}
	}

	function exit() {
		goto('/alphabet');
	}

	// Adapt KanaChar[] to canonical MatchPairs card shape (uses .es/.en for translation).
	function toMatchCards(pool: KanaChar[]) {
		return pool.map((c) => ({
			id: c.id,
			jp: c.jp,
			romaji: c.romaji,
			es: c.romaji,
			en: c.romaji
		}));
	}

	// Record results for every char of the match step when finished.
	function onMatchAnswer(ok: boolean) {
		if (current?.pool) {
			for (const c of current.pool) recordResult(c.id, ok);
		}
		advance(ok);
	}
</script>

<svelte:head>
	<title>{$locale === 'es' ? 'Aprender' : 'Learn'} — Hinomaru</title>
</svelte:head>

<div class="session-layout premium-bg">
	<div class="premium-header-minimal" use:fadeIn={{ delay: 0 }}>
		<button class="close-btn" onclick={exit} aria-label="Salir">
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>
		<div class="header-progress">
			<span class="session-index">
				{Math.min(stepIdx + 1, Math.max(queue.length, 1))} / {Math.max(queue.length, 1)}
			</span>
		</div>
		<div style="width: 44px;"></div>
	</div>

	<div class="session-container">
		{#if done}
			<div class="finish content-center" use:fadeIn>
				<div class="finish-icon">✓</div>
				<h2>{$locale === 'es' ? '¡Buen trabajo!' : 'Great job!'}</h2>
				<p>
					{correctCount}
					{$locale === 'es' ? 'aciertos' : 'correct'} / {queue.length}
				</p>
				<button class="hm-btn hm-btn-primary hm-btn-lg" onclick={exit}>
					{$locale === 'es' ? 'Volver al alfabeto' : 'Back to alphabet'}
				</button>
			</div>
		{:else if current}
			{#key stepKey}
				{#if current.kind === 'introduce' && current.char}
					<AlphabetIntroduce char={current.char} onContinue={() => advance(true)} />
				{:else if current.kind === 'sound_for_char' && current.char && current.pool}
					<AlphabetCharMcq
						target={current.char}
						options={shuffle([current.char, ...current.pool])}
						direction="sound_for_char"
						onAnswer={advance}
					/>
				{:else if current.kind === 'char_for_sound' && current.char && current.pool}
					<AlphabetCharMcq
						target={current.char}
						options={shuffle([current.char, ...current.pool])}
						direction="char_for_sound"
						onAnswer={advance}
					/>
				{:else if current.kind === 'match_pairs' && current.pool}
					{@const cards = toMatchCards(current.pool)}
					<MatchPairs
						mode="lesson"
						card={cards[0]}
						pool={cards.slice(1)}
						onAnswer={onMatchAnswer}
					/>
				{:else if current.kind === 'listen_word' && current.word}
					<AlphabetListenWord word={current.word} script={scriptParam} onAnswer={advance} />
				{/if}
			{/key}
		{/if}
	</div>
</div>

<style>
	.premium-bg {
		background-color: var(--bg-page);
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.premium-header-minimal {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: calc(16px + env(safe-area-inset-top)) 24px 16px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--ink-200);
		flex-shrink: 0;
	}

	.header-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.1;
	}
	.session-index {
		font-size: 17px;
		font-weight: 900;
		color: var(--fg-primary);
		letter-spacing: -0.01em;
	}

	.close-btn {
		color: var(--fg-secondary);
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
	}

	.session-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 20px 100px;
		overflow-y: auto;
	}

	.finish {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		text-align: center;
		padding: 40px 20px;
	}
	.finish-icon {
		width: 88px;
		height: 88px;
		border-radius: 50%;
		background: var(--success);
		color: white;
		font-size: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.finish h2 {
		font-size: 28px;
		font-weight: 900;
		margin: 0;
	}
</style>
