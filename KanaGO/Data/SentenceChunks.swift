import Foundation
import NaturalLanguage

// Plain Foundation so scripts/generate_audio.py can compile this file on its own
// (with `enum SentenceBuilder {}`) and pre-record a clip for every chip the learner can tap.
extension SentenceBuilder {
    private static let punctuation = CharacterSet(charactersIn: "。、！？!?,.・「」『』（）() 　…〜～")

    /// Hand-cut chips (Resources/Data/chunks.json) for sentences the tokenizer gets wrong,
    /// mostly kana-only ones: without kanji it can't tell where words start (ごふ + んまって).
    private static let overrides: [String: [String]] = {
        guard let url = Bundle.main.url(forResource: "chunks", withExtension: "json"),
              let data = try? Data(contentsOf: url) else { return [:] }
        return (try? JSONDecoder().decode([String: [String]].self, from: data)) ?? [:]
    }()

    /// Splits a Japanese sentence into word chunks, gluing particles, verb endings and
    /// fragments the tokenizer over-splits back onto their word. Never glues across punctuation.
    static func chunks(_ sentence: String) -> [String] {
        if let chips = overrides[sentence] { return chips }
        let tokenizer = NLTokenizer(unit: .word)
        tokenizer.setLanguage(.japanese)
        tokenizer.string = sentence
        var words: [(text: String, startsClause: Bool)] = []
        var lastEnd = sentence.startIndex
        tokenizer.enumerateTokens(in: sentence.startIndex..<sentence.endIndex) { range, _ in
            let gap = sentence[lastEnd..<range.lowerBound]
            let startsClause = words.isEmpty || gap.unicodeScalars.contains { punctuation.contains($0) }
            lastEnd = range.upperBound
            let w = String(sentence[range]).trimmingCharacters(in: punctuation)
            if !w.isEmpty { words.append((w, startsClause)) }
            return true
        }

        // 1) a lone kana that is not a particle is a fragment of the next word (ご + ちそうさま)
        var merged: [(text: String, startsClause: Bool)] = []
        var carry: (text: String, startsClause: Bool)?
        for w in words {
            if let c = carry, w.startsClause {
                merged.append(c)
                carry = nil
            }
            if w.text.count == 1, isKana(w.text), !particles.contains(w.text) {
                carry = carry.map { ($0.text + w.text, $0.startsClause) } ?? w
                continue
            }
            if let c = carry {
                merged.append((c.text + w.text, c.startsClause))
                carry = nil
            } else {
                merged.append(w)
            }
        }
        if let c = carry { merged.append(c) }

        // 2) glue pieces that belong to the previous word:
        //    short hiragana (particles, です/ます), verb endings (閉め+てください),
        //    split katakana words (スマート+フォン), lone kanji (七+月) and pieces no word
        //    starts with (はっぴ+ゃく, ありませ+んでした)
        var out: [String] = []
        for w in merged {
            guard let last = out.last, !w.startsClause else { out.append(w.text); continue }
            let text = w.text
            let shortKana = text.count <= 2 && isHiragana(text)
            let verbEnding = isHiragana(text) && endings.contains { text.hasPrefix($0) } && !isHiragana(last)
            let afterSmallTsu = last.hasSuffix("っ") || last.hasSuffix("ッ")
            let katakanaRun = isKatakana(last) && text.first.map { isKatakana(String($0)) } == true
            let loneKanji = last.count == 1 && isKanji(last)
            let fragment = text.first.map { wordNeverStartsWith.contains($0) } == true
            if shortKana || verbEnding || afterSmallTsu || katakanaRun || loneKanji || fragment {
                out[out.count - 1] = last + text
            } else {
                out.append(text)
            }
        }
        return out
    }

    private static let wordNeverStartsWith = Set("んンっッゃゅょャュョぁぃぅぇぉァィゥェォー")

    private static let endings = ["て", "で", "た", "だ", "ま", "ない", "なかっ", "ちゃ", "られ", "れ", "させ", "せ"]

    private static func isKatakana(_ s: String) -> Bool {
        !s.isEmpty && s.unicodeScalars.allSatisfy { (0x30A0...0x30FF).contains($0.value) }
    }

    private static func isKanji(_ s: String) -> Bool {
        s.unicodeScalars.allSatisfy { (0x4E00...0x9FAF).contains($0.value) }
    }

    private static let particles: Set<String> = ["は", "が", "を", "に", "で", "と", "も", "へ", "の", "か", "ね", "よ", "や"]

    private static func isHiragana(_ s: String) -> Bool {
        s.unicodeScalars.allSatisfy { (0x3040...0x309F).contains($0.value) }
    }

    private static func isKana(_ s: String) -> Bool {
        s.unicodeScalars.allSatisfy { (0x3040...0x30FF).contains($0.value) }
    }
}
