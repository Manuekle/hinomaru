/**
 * Seed script — pushes all content from src/lib/data/ into Supabase.
 * Run: npm run seed
 *
 * Requires .env with PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.
 * For production use the service role key (bypasses RLS):
 *   SUPABASE_SERVICE_ROLE_KEY=... npm run seed
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { DECKS } from '../src/lib/data/index.js';

config();

const url = process.env.PUBLIC_SUPABASE_URL ?? '';
const key =
	process.env.SUPABASE_SERVICE_ROLE_KEY ?? // preferred — bypasses RLS
	process.env.PUBLIC_SUPABASE_ANON_KEY ?? // fallback (RLS must allow insert)
	'';

if (!url || !key) {
	console.error('Missing SUPABASE_URL or key in .env');
	process.exit(1);
}

const sb = createClient(url, key);

async function run() {
	let totalCards = 0;
	let totalGrammar = 0;

	for (const deck of DECKS) {
		const cardCount = deck.cards?.length ?? 0;
		const grammarCount = deck.grammar?.length ?? 0;
		const count = cardCount + grammarCount;

		// Upsert deck
		const { error: deckErr } = await sb.from('decks').upsert(
			{
				id: deck.id,
				level: deck.level,
				kind: deck.kind,
				kind_es: deck.kind_es,
				title_en: deck.title_en,
				title_es: deck.title_es,
				desc_en: deck.desc_en,
				desc_es: deck.desc_es,
				card_count: count
			},
			{ onConflict: 'id' }
		);

		if (deckErr) {
			console.error(`❌ Deck ${deck.id}:`, deckErr.message);
			continue;
		}
		console.log(`✓ Deck ${deck.id} (${count} items)`);

		// Upsert cards (in batches of 100)
		if (deck.cards && deck.cards.length > 0) {
			// Remove existing cards for this deck to allow clean re-seed
			await sb.from('cards').delete().eq('deck_id', deck.id);

			const rows = deck.cards.map((c) => ({
				deck_id: deck.id,
				jp: c.jp,
				romaji: c.romaji,
				en: c.en,
				es: c.es,
				example: c.example,
				example_en: c.example_en,
				example_es: c.example_es,
				category: c.category ?? null,
				category_es: c.category_es ?? null,
				pos: c.pos ?? null,
				pos_es: c.pos_es ?? null,
				definitions_en: c.definitions_en ?? null,
				definitions_es: c.definitions_es ?? null,
				extra: c.extra ?? null,
				sort_order: c.sort_order ?? 0
			}));

			for (let i = 0; i < rows.length; i += 100) {
				const { error } = await sb.from('cards').insert(rows.slice(i, i + 100));
				if (error) console.error(`  ❌ cards batch ${i}:`, error.message);
			}
			totalCards += rows.length;
		}

		// Upsert grammar points
		if (deck.grammar && deck.grammar.length > 0) {
			await sb.from('grammar_points').delete().eq('deck_id', deck.id);

			const rows = deck.grammar.map((g) => ({
				deck_id: deck.id,
				pattern: g.pattern,
				meaning_en: g.meaning_en,
				meaning_es: g.meaning_es,
				usage: g.usage,
				examples: g.examples,
				sort_order: g.sort_order ?? 0
			}));

			const { error } = await sb.from('grammar_points').insert(rows);
			if (error) console.error(`  ❌ grammar:`, error.message);
			totalGrammar += rows.length;
		}
	}

	console.log(`\n✅ Seed complete — ${totalCards} cards, ${totalGrammar} grammar points`);
}

run().catch(console.error);
