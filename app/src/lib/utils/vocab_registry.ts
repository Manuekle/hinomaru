import { vocabulary as n5 } from '../data/n5/vocabulary';
import { vocabulary as n4 } from '../data/n4/vocabulary';
import { vocabulary as n3 } from '../data/n3/vocabulary';
import { vocabulary as n2 } from '../data/n2/vocabulary';
import { vocabulary as n1 } from '../data/n1/vocabulary';
import type { CardData } from '../data/types';

// Aggregate all official vocabulary
const allVocab: CardData[] = [...n5, ...n4, ...n3, ...n2, ...n1];

// Create a lookup map for instant access by Japanese text
const vocabMap = new Map<string, CardData>();

for (const card of allVocab) {
    // We use the first occurrence (usually lower level) if duplicates exist
    if (!vocabMap.has(card.jp)) {
        vocabMap.set(card.jp, card);
    }
}

/**
 * Retrieves metadata for a Japanese word from the official JLPT data files.
 */
export function getWordMetadata(jp: string): Partial<CardData> | null {
    const card = vocabMap.get(jp);
    if (!card) return null;
    
    return {
        category: card.category,
        category_es: card.category_es,
        pos: card.pos,
        pos_es: card.pos_es,
        definitions_en: card.definitions_en,
        definitions_es: card.definitions_es,
        romaji: card.romaji,
        kana: card.kana,
        en: card.en,
        es: card.es
    };
}

/**
 * Returns a list of all unique categories in the app.
 */
export function getAllCategories(locale: 'en' | 'es' = 'en'): string[] {
    const cats = new Set<string>();
    for (const card of allVocab) {
        const c = locale === 'es' ? card.category_es || card.category : card.category;
        if (c) cats.add(c);
    }
    return Array.from(cats).sort();
}

/**
 * Returns a list of all Japanese words in the registry, sorted by length (descending)
 * to facilitate greedy matching during tokenization.
 */
export function getAllRegistryWords(): string[] {
    return Array.from(vocabMap.keys()).sort((a, b) => b.length - a.length);
}
