<script lang="ts">
	import { getAllRegistryWords } from '$lib/utils/vocab_registry';
	import WordPopup from './WordPopup.svelte';

	let { text, vocab = [], disabled = false } = $props<{ 
		text: string; 
		vocab?: any[];
		disabled?: boolean;
	}>();

	let popupState = $state({
		visible: false,
		word: '',
		x: 0,
		y: 0
	});

	// Simple tokenizer: find all words from registry in the text
	const words = $derived.by(() => {
		const registry = getAllRegistryWords();
		const local = vocab.map((v: any) => v.jp).filter(Boolean);
		// Merge and sort by length descending for greedy match
		return Array.from(new Set([...registry, ...local])).sort((a, b) => b.length - a.length);
	});
	
	function renderText(txt: string) {
		// This is a naive implementation. For a real app, use a proper Japanese tokenizer.
		// We'll wrap words found in our registry.
		
		let parts: { text: string; isWord: boolean }[] = [];
		let current = txt;
		
		while (current.length > 0) {

			// Try to find the longest matching word at the start
			let longestMatch = '';
			for (const w of words) {
				if (current.startsWith(w) && w.length > longestMatch.length) {
					longestMatch = w;
				}
			}
			
			if (longestMatch) {
				parts.push({ text: longestMatch, isWord: true });
				current = current.slice(longestMatch.length);

			} else {
				// No word found at start, take one character and continue
				let char = current[0];
				if (parts.length > 0 && !parts[parts.length - 1].isWord) {
					parts[parts.length - 1].text += char;
				} else {
					parts.push({ text: char, isWord: false });
				}
				current = current.slice(1);
			}
		}
		return parts;
	}

	const parts = $derived(renderText(text));

	function handleWordClick(event: MouseEvent, word: string) {
		event.stopPropagation();
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		popupState = {
			visible: true,
			word,
			x: rect.left + rect.width / 2,
			y: rect.top
		};
	}
</script>

<div class="interactive-text">
	{#each parts as part, i (i)}
		{#if part.isWord && !disabled}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span 
				class="word-link" 
				onclick={(e) => handleWordClick(e, part.text)}
			>{part.text}</span>
		{:else}
			<span>{part.text}</span>
		{/if}
	{/each}
</div>

<WordPopup 
	{...popupState} 
	onclose={() => popupState.visible = false} 
/>

<style>
	.interactive-text {
		display: inline;
		line-height: inherit;
	}

	.word-link {
		color: var(--hinomaru-red);
		border-bottom: 1.5px dotted rgba(188, 0, 45, 0.4);
		cursor: pointer;
		transition: all 0.2s;
	}

	.word-link:hover {
		background: var(--hinomaru-red-wash);
		border-bottom-color: var(--hinomaru-red);
	}
</style>
