<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { locale } from '$lib/stores/locale';
	import { fadeIn, fadeUp } from '$lib/motion';
	import { speakJapanese } from '$lib/utils/tts';
	import { playCorrect, playWrong } from '$lib/utils/sounds';
	import { ALL_CHARS, WORDS, type KanaChar, type KanaWord } from '$lib/data/alphabetCharacters';
	import { recordResult, alphabetProgress, isLearned } from '$lib/stores/alphabetProgress';
	import StickyFooter from '$lib/components/StickyFooter.svelte';
	import Icon from '$lib/Icon.svelte';
	import {
		Cancel01Icon,
		VolumeHighIcon,
		CheckmarkCircle01Icon,
		ArrowLeft02Icon,
		ArrowRight02Icon
	} from '@hugeicons/core-free-icons';

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
	const progressPct = $derived(queue.length > 0 ? Math.round((stepIdx / queue.length) * 100) : 0);

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

	// --- Per-step state ---
	let mcqPicked = $state<string | null>(null);
	let mcqCorrect = $state<boolean | null>(null);
	let mcqOpts = $state<KanaChar[]>([]);

	function startMcq(target: KanaChar, pool: KanaChar[]) {
		mcqPicked = null;
		mcqCorrect = null;
		mcqOpts = shuffle([target, ...pool]);
	}

	$effect(() => {
		if (!current) return;
		void stepKey;
		if (
			(current.kind === 'sound_for_char' || current.kind === 'char_for_sound') &&
			current.char &&
			current.pool
		) {
			startMcq(current.char, current.pool);
			if (current.kind === 'sound_for_char') {
				setTimeout(() => speakJapanese(current.char!.jp), 300);
			}
		}
	});

	function pickMcq(target: KanaChar, opt: KanaChar) {
		if (mcqPicked) return;
		mcqPicked = opt.id;
		mcqCorrect = opt.id === target.id;
		setTimeout(() => advance(mcqCorrect ?? false), 900);
	}

	// --- Match pairs ---
	let mpItems = $state<{ id: string; text: string; type: 'jp' | 'rom'; charId: string }[]>([]);
	let mpSel = $state<string | null>(null);
	let mpMatched = $state<SvelteSet<string>>(new SvelteSet());
	let mpWrong = $state<SvelteSet<string>>(new SvelteSet());

	function startMatch(pool: KanaChar[]) {
		mpSel = null;
		mpMatched = new SvelteSet();
		mpWrong = new SvelteSet();
		const items: typeof mpItems = [];
		for (const c of pool) {
			items.push({ id: `${c.id}-jp`, text: c.jp, type: 'jp', charId: c.id });
			items.push({ id: `${c.id}-rom`, text: c.romaji, type: 'rom', charId: c.id });
		}
		mpItems = shuffle(items);
	}

	$effect(() => {
		if (!current) return;
		void stepKey;
		if (current.kind === 'match_pairs' && current.pool) {
			startMatch(current.pool);
		}
	});

	function pickMatch(item: (typeof mpItems)[number]) {
		if (mpMatched.has(item.charId)) return;
		if (item.type === 'jp') speakJapanese(item.text);
		if (!mpSel) {
			mpSel = item.id;
			return;
		}
		if (mpSel === item.id) {
			mpSel = null;
			return;
		}
		const prev = mpItems.find((x) => x.id === mpSel);
		if (!prev) return;
		if (prev.charId === item.charId && prev.type !== item.type) {
			mpMatched.add(item.charId);
			recordResult(item.charId, true);
			playCorrect();
			mpSel = null;
			if (current?.pool && mpMatched.size >= current.pool.length) {
				setTimeout(() => advance(true), 600);
			}
		} else {
			mpWrong.add(item.id);
			mpWrong.add(prev.id);
			playWrong();
			recordResult(item.charId, false);
			recordResult(prev.charId, false);
			setTimeout(() => {
				mpWrong.clear();
				mpSel = null;
			}, 600);
		}
	}

	// --- Listen-word ---
	interface WChip {
		tok: string;
		uid: number;
	}
	let lwBank = $state<WChip[]>([]);
	let lwAnswer = $state<WChip[]>([]);
	let lwLocked = $state(false);
	let lwResult = $state<'correct' | 'wrong' | null>(null);

	function startWord(w: KanaWord) {
		const tokens = w.chars;
		const distractors: string[] = [];
		const candidates = ALL_CHARS.filter((c) => c.script === scriptParam && !tokens.includes(c.jp));
		for (const x of shuffle(candidates).slice(0, Math.min(3, 6 - tokens.length))) {
			distractors.push(x.jp);
		}
		const all = shuffle([...tokens, ...distractors]);
		lwBank = all.map((tok, i) => ({ tok, uid: i }));
		lwAnswer = [];
		lwLocked = false;
		lwResult = null;
		setTimeout(() => speakJapanese(w.jp), 300);
	}

	$effect(() => {
		if (!current) return;
		void stepKey;
		if (current.kind === 'listen_word' && current.word) {
			startWord(current.word);
		}
	});

	function lwAdd(c: WChip) {
		if (lwLocked) return;
		lwAnswer = [...lwAnswer, c];
		lwBank = lwBank.filter((x) => x.uid !== c.uid);
	}
	function lwRemove(c: WChip) {
		if (lwLocked) return;
		lwBank = [...lwBank, c];
		lwAnswer = lwAnswer.filter((x) => x.uid !== c.uid);
	}
	function lwCheck() {
		if (!current?.word || lwLocked) return;
		lwLocked = true;
		const got = lwAnswer.map((c) => c.tok).join('');
		const expected = current.word.chars.join('');
		const ok = got === expected;
		lwResult = ok ? 'correct' : 'wrong';
		if (ok) {
			playCorrect();
			speakJapanese(current.word.jp);
		} else {
			playWrong();
		}
		setTimeout(() => advance(ok), 1200);
	}

	const lwReady = $derived(lwAnswer.length > 0 && !lwLocked);
</script>

<svelte:head>
	<title>{$locale === 'es' ? 'Aprender' : 'Learn'} — Hinomaru</title>
</svelte:head>

<div class="layout">
	<header class="hdr" use:fadeIn>
		<button class="close" onclick={exit} aria-label="Salir">
			<Icon icon={Cancel01Icon} size={24} color="currentColor" />
		</button>
		<div class="bar"><div class="bar-fill" style="width: {progressPct}%"></div></div>
		<div style="width:44px;"></div>
	</header>

	<main class="main">
		{#if done}
			<div class="finish" use:fadeUp={{ y: 12 }}>
				<div class="finish-icon">✓</div>
				<h2>{$locale === 'es' ? '¡Buen trabajo!' : 'Great job!'}</h2>
				<p>
					{correctCount} {$locale === 'es' ? 'aciertos' : 'correct'} / {queue.length}
				</p>
				<button class="hm-btn hm-btn-primary hm-btn-lg" onclick={exit}>
					{$locale === 'es' ? 'Volver al alfabeto' : 'Back to alphabet'}
				</button>
			</div>
		{:else if current}
			{#key stepKey}
				{#if current.kind === 'introduce' && current.char}
					{@const c = current.char}
					<div class="card center" use:fadeIn>
						<span class="tag">{$locale === 'es' ? 'NUEVO CARÁCTER' : 'NEW CHARACTER'}</span>
						<div class="huge jp">{c.jp}</div>
						<div class="romaji-big">{c.romaji}</div>
						<button class="audio-big" onclick={() => speakJapanese(c.jp)} aria-label="Play">
							<Icon icon={VolumeHighIcon} size={28} color="white" />
						</button>
						<p class="hint">
							{$locale === 'es'
								? 'Escucha y memoriza la forma y el sonido.'
								: 'Listen and memorize the shape and sound.'}
						</p>
					</div>
					<StickyFooter>
						<button class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg" onclick={() => advance(true)}>
							<span>{$locale === 'es' ? 'Continuar' : 'Continue'}</span>
							<Icon icon={ArrowRight02Icon} size={18} color="currentColor" />
						</button>
					</StickyFooter>
				{:else if current.kind === 'sound_for_char' && current.char}
					{@const target = current.char}
					<div class="card center" use:fadeIn>
						<span class="tag">{$locale === 'es' ? '¿QUÉ SONIDO?' : 'WHICH SOUND?'}</span>
						<div class="huge jp">{target.jp}</div>
						<button class="audio-mid" onclick={() => speakJapanese(target.jp)} aria-label="Play">
							<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
						</button>
					</div>
					<div class="opts">
						{#each mcqOpts as opt (opt.id)}
							{@const isPicked = mcqPicked === opt.id}
							{@const isRight = opt.id === target.id}
							<button
								class="opt"
								class:right={mcqPicked && isPicked && isRight}
								class:wrong={mcqPicked && isPicked && !isRight}
								class:dim={mcqPicked && !isPicked}
								disabled={!!mcqPicked}
								onclick={() => pickMcq(target, opt)}
							>
								<span class="opt-rom">{opt.romaji}</span>
								<span
									class="opt-audio-icon"
									aria-label="audio"
									onclick={(e) => {
										e.stopPropagation();
										speakJapanese(opt.jp);
									}}
									role="button"
									tabindex="0"
								>
									<Icon icon={VolumeHighIcon} size={14} color="currentColor" />
								</span>
							</button>
						{/each}
					</div>
				{:else if current.kind === 'char_for_sound' && current.char}
					{@const target = current.char}
					<div class="card center" use:fadeIn>
						<span class="tag">{$locale === 'es' ? '¿QUÉ CARÁCTER?' : 'WHICH CHARACTER?'}</span>
						<div class="rom-prompt">"{target.romaji}"</div>
						<button class="audio-mid" onclick={() => speakJapanese(target.jp)} aria-label="Play">
							<Icon icon={VolumeHighIcon} size={20} color="currentColor" />
						</button>
					</div>
					<div class="opts">
						{#each mcqOpts as opt (opt.id)}
							{@const isPicked = mcqPicked === opt.id}
							{@const isRight = opt.id === target.id}
							<button
								class="opt opt-jp"
								class:right={mcqPicked && isPicked && isRight}
								class:wrong={mcqPicked && isPicked && !isRight}
								class:dim={mcqPicked && !isPicked}
								disabled={!!mcqPicked}
								onclick={() => pickMcq(target, opt)}
							>
								<span class="opt-jp-text jp">{opt.jp}</span>
							</button>
						{/each}
					</div>
				{:else if current.kind === 'match_pairs' && current.pool}
					<div class="card center" use:fadeIn>
						<span class="tag">{$locale === 'es' ? 'EMPAREJA' : 'MATCH'}</span>
						<p class="hint">
							{$locale === 'es' ? 'Conecta cada carácter con su sonido.' : 'Match each character with its sound.'}
						</p>
					</div>
					<div class="match-grid">
						{#each mpItems as it (it.id)}
							{@const matched = mpMatched.has(it.charId)}
							{@const sel = mpSel === it.id}
							{@const wrong = mpWrong.has(it.id)}
							<button
								class="m-card"
								class:m-jp={it.type === 'jp'}
								class:m-sel={sel}
								class:m-matched={matched}
								class:m-wrong={wrong}
								disabled={matched}
								onclick={() => pickMatch(it)}
							>
								<span class:jp={it.type === 'jp'} class="m-text">{it.text}</span>
							</button>
						{/each}
					</div>
				{:else if current.kind === 'listen_word' && current.word}
					{@const w = current.word}
					<div class="card center" use:fadeIn>
						<span class="tag">{$locale === 'es' ? 'ESCUCHA Y FORMA' : 'LISTEN & BUILD'}</span>
						<button class="audio-big" onclick={() => speakJapanese(w.jp)} aria-label="Play">
							<Icon icon={VolumeHighIcon} size={28} color="white" />
						</button>
						<p class="hint">{$locale === 'es' ? w.es : w.en}</p>
					</div>
					<div
						class="answer-zone"
						class:right={lwResult === 'correct'}
						class:wrong={lwResult === 'wrong'}
					>
						{#if lwAnswer.length === 0}
							<span class="ph">{$locale === 'es' ? 'Toca los caracteres' : 'Tap characters'}</span>
						{:else}
							{#each lwAnswer as c (c.uid)}
								<button class="chip chip-on" disabled={lwLocked} onclick={() => lwRemove(c)}>
									<span class="jp">{c.tok}</span>
								</button>
							{/each}
						{/if}
					</div>
					<div class="bank">
						{#each lwBank as c (c.uid)}
							<button class="chip" onclick={() => lwAdd(c)} disabled={lwLocked}>
								<span class="jp">{c.tok}</span>
							</button>
						{/each}
					</div>
					{#if lwResult === 'correct'}
						<div class="reveal">
							<div class="reveal-jp jp">{w.jp}</div>
							<div class="reveal-rom">{w.romaji}</div>
						</div>
					{/if}
					<StickyFooter>
						<div class="footer-row">
							{#if lwAnswer.length > 0 && !lwLocked}
								<button
									class="icon-btn hm-btn hm-btn-secondary"
									onclick={() => {
										lwBank = [...lwBank, ...lwAnswer];
										lwAnswer = [];
									}}
									aria-label="Limpiar"
								>
									<Icon icon={ArrowLeft02Icon} size={20} color="currentColor" />
								</button>
							{/if}
							<button
								class="hm-btn hm-btn-primary hm-btn-full hm-btn-lg"
								onclick={lwCheck}
								disabled={!lwReady}
							>
								{$locale === 'es' ? 'Comprobar' : 'Check'}
							</button>
						</div>
					</StickyFooter>
				{/if}
			{/key}
		{/if}
	</main>
</div>

<style>
	.layout {
		min-height: 100dvh;
		background: var(--bg-page);
		display: flex;
		flex-direction: column;
	}
	.hdr {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: calc(16px + env(safe-area-inset-top)) 20px 12px;
		background: var(--bg-surface);
		border-bottom: 1px solid var(--ink-200);
	}
	.close {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		color: var(--fg-secondary);
	}
	.bar {
		flex: 1;
		height: 8px;
		background: var(--ink-100);
		border-radius: 99px;
		overflow: hidden;
	}
	.bar-fill {
		height: 100%;
		background: var(--hinomaru-red);
		transition: width 0.3s;
	}
	.main {
		flex: 1;
		padding: 24px 20px 130px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.card {
		background: var(--bg-surface);
		border: 1px solid var(--ink-200);
		border-radius: 24px;
		padding: 22px 18px 26px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		text-align: center;
	}
	.center {
		justify-content: center;
	}
	.tag {
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		padding: 5px 12px;
		border-radius: 99px;
	}
	.huge {
		font-size: clamp(96px, 22vw, 144px);
		font-weight: 700;
		line-height: 1;
		color: var(--fg-primary);
	}
	.romaji-big {
		font-size: 26px;
		font-weight: 800;
		color: var(--hinomaru-red);
	}
	.rom-prompt {
		font-size: clamp(40px, 9vw, 56px);
		font-weight: 900;
		color: var(--fg-primary);
		letter-spacing: 0.02em;
	}
	.audio-big {
		width: 84px;
		height: 84px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, var(--hinomaru-red), #d4002f);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 10px 28px rgba(188, 0, 45, 0.32);
		color: white;
	}
	.audio-mid {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-200);
		background: var(--bg-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--fg-secondary);
	}
	.hint {
		font-size: 14px;
		color: var(--fg-secondary);
	}
	.opts {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
	.opt {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 18px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.opt-rom {
		font-size: 22px;
		font-weight: 800;
		color: var(--fg-primary);
	}
	.opt-audio-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--bg-muted);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-secondary);
	}
	.opt.opt-jp {
		justify-content: center;
		padding: 28px;
	}
	.opt-jp-text {
		font-size: 48px;
		font-weight: 700;
		color: var(--fg-primary);
		line-height: 1;
	}
	.opt.right {
		border-color: var(--success);
		background: var(--success-wash);
	}
	.opt.wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}
	.opt.dim {
		opacity: 0.5;
	}
	.match-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}
	.m-card {
		min-height: 70px;
		padding: 12px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.15s;
	}
	.m-card.m-jp {
		background: var(--bg-muted);
	}
	.m-card.m-sel {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
	}
	.m-card.m-matched {
		opacity: 0.85;
	}
	.m-card.m-matched .m-text {
		color: var(--success);
	}
	.m-card.m-wrong {
		border-color: var(--hinomaru-red);
		background: var(--hinomaru-red-wash);
		animation: shake 0.4s;
	}
	.m-text {
		font-size: 18px;
		font-weight: 700;
	}
	.m-text.jp {
		font-size: 28px;
	}
	@keyframes shake {
		10%, 90% { transform: translate3d(-1px, 0, 0); }
		20%, 80% { transform: translate3d(2px, 0, 0); }
		30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
		40%, 60% { transform: translate3d(4px, 0, 0); }
	}
	.answer-zone {
		min-height: 90px;
		background: var(--bg-muted);
		border: 1.5px dashed var(--ink-200);
		border-radius: 18px;
		padding: 14px;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
		align-items: center;
	}
	.answer-zone.right { border-color: var(--success); background: var(--success-wash); border-style: solid; }
	.answer-zone.wrong { border-color: var(--hinomaru-red); background: var(--hinomaru-red-wash); border-style: solid; }
	.ph {
		color: var(--fg-tertiary);
		font-size: 13px;
		font-weight: 600;
	}
	.bank {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
	}
	.chip {
		padding: 10px 16px;
		border-radius: 14px;
		background: var(--bg-surface);
		border: 1.5px solid var(--ink-200);
		font-family: inherit;
		font-size: 22px;
		font-weight: 700;
		color: var(--fg-primary);
		box-shadow: 0 3px 0 var(--ink-200);
		cursor: pointer;
	}
	.chip-on {
		background: var(--fg-primary);
		color: white;
		border-color: var(--fg-primary);
	}
	.chip:disabled {
		opacity: 0.55;
	}
	.reveal {
		text-align: center;
		padding: 12px;
		background: var(--bg-surface);
		border: 1px solid var(--success);
		border-radius: 14px;
	}
	.reveal-jp {
		font-size: 26px;
		font-weight: 700;
	}
	.reveal-rom {
		font-size: 14px;
		font-weight: 700;
		color: var(--hinomaru-red);
	}
	.footer-row {
		display: flex;
		gap: 10px;
		max-width: 480px;
		margin: 0 auto;
		width: 100%;
	}
	.icon-btn {
		width: 54px;
		height: 54px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.finish {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		text-align: center;
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
