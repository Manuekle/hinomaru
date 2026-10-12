import Foundation

// Bundled learning content (Resources/Data/*.json).

struct Card: Decodable, Hashable {
    let jp: String
    let romaji: String
    let en: String
    let es: String
    let example: String?
    let exampleRomaji: String?
    let exampleEn: String?
    let exampleEs: String?
    let kana: String?
    let category: String?
    let categoryEs: String?
    let pos: String?
    let posEs: String?
    let extra: [String: String]?
    let sortOrder: Int?

    func meaning(_ lang: Lang) -> String { lang == .es ? es : en }
    func exampleMeaning(_ lang: Lang) -> String? { lang == .es ? exampleEs : exampleEn }
    func categoryName(_ lang: Lang) -> String? { lang == .es ? (categoryEs ?? category) : category }
}

struct GrammarExample: Decodable, Hashable {
    let jp: String
    let romaji: String?
    let en: String
    let es: String
}

struct GrammarPoint: Decodable, Hashable, Identifiable {
    let pattern: String
    let meaningEn: String
    let meaningEs: String
    let usage: String
    let examples: [GrammarExample]
    let sortOrder: Int?

    var id: String { pattern }
    func meaning(_ lang: Lang) -> String { lang == .es ? meaningEs : meaningEn }
}

struct Deck: Decodable, Identifiable {
    let id: String
    let level: String
    let kind: String
    let kindEs: String
    let titleEn: String
    let titleEs: String
    let descEn: String
    let descEs: String
    let cards: [Card]
    let grammar: [GrammarPoint]

    var isGrammar: Bool { kind == "Grammar" }
    var itemCount: Int { isGrammar ? grammar.count : cards.count }
    func title(_ lang: Lang) -> String { lang == .es ? titleEs : titleEn }
    func desc(_ lang: Lang) -> String { lang == .es ? descEs : descEn }
    func kindName(_ lang: Lang) -> String { lang == .es ? kindEs : kind }
    func cardKey(_ card: Card) -> String { "\(id)#\(card.jp)" }

    var icon: HI {
        switch kind {
        case "Hiragana", "Katakana": return .kana
        case "Kanji": return .kanji
        case "Grammar": return .puzzle
        default: return level == "Survival" ? .airplane : .cards
        }
    }
}

// MARK: Alphabet

struct KanaChar: Decodable, Hashable, Identifiable {
    let id: String
    let jp: String
    let romaji: String
    let script: String
    let group: String
}

struct KanaGroup: Decodable, Hashable, Identifiable {
    let id: String
    let titleEs: String
    let titleEn: String
    let subtitleEs: String?
    let subtitleEn: String?
    let chars: [KanaChar]

    func title(_ lang: Lang) -> String { lang == .es ? titleEs : titleEn }
}

struct KanaSection: Decodable, Hashable, Identifiable {
    let id: String
    let script: String
    let titleEs: String
    let titleEn: String
    let groups: [KanaGroup]

    func title(_ lang: Lang) -> String { lang == .es ? titleEs : titleEn }
}

struct KanaWord: Decodable, Hashable {
    let jp: String
    let romaji: String
    let es: String
    let en: String
    let chars: [String]

    func meaning(_ lang: Lang) -> String { lang == .es ? es : en }
}

struct AlphabetData: Decodable {
    let sections: [KanaSection]
    let words: [String: [KanaWord]]
}

enum Script: String, CaseIterable, Identifiable {
    case hiragana, katakana
    var id: String { rawValue }
    var label: String { self == .hiragana ? "ひらがな" : "カタカナ" }
    var latin: String { self == .hiragana ? "Hiragana" : "Katakana" }
}

// MARK: Conversations

struct DialogueLine: Decodable, Hashable {
    let jp: String
    let romaji: String
    let translation: String
}

struct DialogueChoice: Decodable, Hashable {
    let jp: String
    let romaji: String
    let translation: String
    let correct: Bool
    let feedbackEs: String
}

enum DialogueTurn: Decodable, Hashable {
    case npc(DialogueLine)
    case choice(prompt: DialogueLine, choices: [DialogueChoice], next: DialogueLine?)

    private enum Keys: String, CodingKey {
        case type, jp, romaji, translation, promptJp, promptRomaji, promptTranslation, choices, nextNpc
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: Keys.self)
        let type = try c.decode(String.self, forKey: .type)
        if type == "choice" {
            let prompt = DialogueLine(
                jp: try c.decode(String.self, forKey: .promptJp),
                romaji: try c.decode(String.self, forKey: .promptRomaji),
                translation: try c.decode(String.self, forKey: .promptTranslation)
            )
            self = .choice(
                prompt: prompt,
                choices: try c.decode([DialogueChoice].self, forKey: .choices),
                next: try c.decodeIfPresent(DialogueLine.self, forKey: .nextNpc)
            )
        } else {
            self = .npc(DialogueLine(
                jp: try c.decode(String.self, forKey: .jp),
                romaji: try c.decode(String.self, forKey: .romaji),
                translation: try c.decode(String.self, forKey: .translation)
            ))
        }
    }

    var isChoice: Bool { if case .choice = self { return true } else { return false } }
}

struct Scenario: Decodable, Identifiable, Hashable {
    let id: String
    let titleEs: String
    let titleEn: String
    let level: String
    let icon: String
    let contextEs: String
    let turns: [DialogueTurn]

    func title(_ lang: Lang) -> String { lang == .es ? titleEs : titleEn }
    var choiceCount: Int { turns.filter(\.isChoice).count }
}

// MARK: Songs (karaoke clips)

struct LyricLine: Decodable, Hashable {
    let time: Double
    /// When the singing of the line stops, so the karaoke fill can't run ahead of or lag the voice.
    let end: Double?
    /// When each space-separated phrase of `text` starts being sung; the first one is `time`.
    let marks: [Double]?
    let text: String
    let romaji: String?
    let translationEs: String
    let translationEn: String

    func translation(_ lang: Lang) -> String { lang == .es ? translationEs : translationEn }
}

struct SongVocab: Decodable, Hashable {
    let jp: String
    let kana: String
    let romaji: String?
    let en: String
    let es: String

    func meaning(_ lang: Lang) -> String { lang == .es ? es : en }
}

struct Localized: Decodable, Hashable {
    let es: String
    let en: String

    func callAsFunction(_ lang: Lang) -> String { lang == .es ? es : en }
}

struct Song: Decodable, Identifiable, Hashable {
    let id: String
    let level: String
    let title: String
    let artist: String
    let start: String
    let end: String
    let focus: Localized
    let difficulty: Int
    let youtubeId: String
    let lyrics: [LyricLine]
    let vocab: [SongVocab]?

    var startSeconds: Double { Self.seconds(start) }
    var endSeconds: Double { Self.seconds(end) }

    /// "mm:ss" or "mm:ss.f" to seconds.
    static func seconds(_ mmss: String) -> Double {
        let parts = mmss.split(separator: ":").compactMap { Double($0) }
        return parts.count == 2 ? parts[0] * 60 + parts[1] : (parts.first ?? 0)
    }
}

// MARK: Stories (graded reading)

struct StoryVocab: Decodable, Hashable {
    let jp: String
    let kana: String
    let romaji: String?
    let en: String
    let es: String

    func meaning(_ lang: Lang) -> String { lang == .es ? es : en }
}

/// One reading unit of a story — a word with its particles and punctuation ("私は", "起きます。"),
/// split and romanized by scripts/romaji.py.
struct StoryWord: Decodable, Hashable {
    let jp: String
    /// nil for bare punctuation.
    let romaji: String?
    /// Hiragana reading, when `jp` has kanji.
    let kana: String?
    /// The word inside `jp` without its particles/endings, when they differ ("起き" in "起きます。").
    let head: String?
    /// Dictionary form of `head`, when it differs ("起きる").
    let base: String?
    /// The story vocab entry this unit shows.
    let vocab: String?

    /// The unit without brackets and punctuation.
    var core: String {
        jp.trimmingCharacters(in: CharacterSet(charactersIn: "、。！？!?…・「」『』（）() "))
    }
    var word: String { head ?? core }
}

struct StoryQuestion: Decodable, Hashable {
    let q: String
    let qEs: String?
    let qJp: String?
    let o: [String]
    let oEs: [String]?
    let oJp: [String]?
    let a: Int

    func question(_ lang: Lang) -> String { lang == .es ? (qEs ?? q) : q }
    func options(_ lang: Lang) -> [String] { lang == .es ? (oEs ?? o) : o }
}

struct Story: Decodable, Identifiable, Hashable {
    let id: String
    let level: String
    let titleEn: String
    let titleEs: String
    let emoji: String
    let bodyJp: String
    let bodyEn: String
    let bodyEs: String
    let bodyRomaji: String?
    /// Paragraphs split into reading units, same order as `paragraphs(_:)`.
    let bodyWords: [[StoryWord]]?
    let vocab: [StoryVocab]
    let quiz: [StoryQuestion]

    func title(_ lang: Lang) -> String { lang == .es ? titleEs : titleEn }
    func body(_ lang: Lang) -> String { lang == .es ? bodyEs : bodyEn }

    /// Japanese paragraphs paired with their translation when the line counts match.
    func paragraphs(_ lang: Lang) -> [(jp: String, translation: String?)] {
        let jp = bodyJp.split(separator: "\n", omittingEmptySubsequences: true).map(String.init)
        let tr = body(lang).split(separator: "\n", omittingEmptySubsequences: true).map(String.init)
        return jp.enumerated().map { i, p in (p, tr.count == jp.count ? tr[i] : (i == 0 ? body(lang) : nil)) }
    }
}

// MARK: Roadmap (guided lessons)

struct RoadmapData: Decodable {
    let levels: [RoadmapLevel]
}

struct RoadmapLevel: Decodable, Identifiable {
    let key: String
    let units: [RoadmapUnit]
    var id: String { key }
    var lessons: [RoadmapLesson] { units.flatMap(\.lessons) }
}

struct UnitSource: Decodable, Hashable {
    let groups: [String]?
    let deck: String?
    let start: Int?
    let end: Int?
}

struct RoadmapUnit: Decodable, Identifiable, Hashable {
    let id: String
    let sectionEs: String
    let sectionEn: String
    let titleEs: String
    let titleEn: String
    let emoji: String
    let objectiveEs: String
    let objectiveEn: String
    let source: UnitSource
    let lessons: [RoadmapLesson]

    func section(_ lang: Lang) -> String { lang == .es ? sectionEs : sectionEn }
    func title(_ lang: Lang) -> String { lang == .es ? titleEs : titleEn }
    func objective(_ lang: Lang) -> String { lang == .es ? objectiveEs : objectiveEn }
}

struct RoadmapLesson: Decodable, Identifiable, Hashable {
    let id: String
    let type: String   // learn | practice | speak | quiz | review
    let titleEs: String
    let titleEn: String
    let goalEs: String
    let goalEn: String

    func title(_ lang: Lang) -> String { lang == .es ? titleEs : titleEn }
    func goal(_ lang: Lang) -> String { lang == .es ? goalEs : goalEn }

    var icon: HI {
        switch type {
        case "learn": return .book
        case "practice": return .dumbbell
        case "speak": return .headphones
        case "quiz": return .quiz
        default: return .crown
        }
    }
}
