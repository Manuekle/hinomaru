import Foundation

// JLPT practice tests (Resources/Data/jlpt.json).

struct JLPTData: Decodable {
    let levels: [JLPTLevel]
}

struct JLPTLevel: Decodable, Identifiable {
    let level: String
    let sections: [JLPTSection]

    var id: String { level }
    func section(_ kind: JLPTKind) -> JLPTSection? { sections.first { $0.type == kind } }
}

enum JLPTKind: String, Decodable, CaseIterable, Identifiable, Hashable {
    case vocabulary, grammar, listening, mock

    var id: String { rawValue }

    var jp: String {
        switch self {
        case .vocabulary: return "語彙"
        case .grammar: return "文法"
        case .listening: return "聴解"
        case .mock: return "模擬試験"
        }
    }

    var icon: HI {
        switch self {
        case .vocabulary: return .cards
        case .grammar: return .puzzle
        case .listening: return .headphones
        case .mock: return .exam
        }
    }

    func title(_ app: AppModel) -> String {
        switch self {
        case .vocabulary: return app.t("Vocabulario", "Vocabulary")
        case .grammar: return app.t("Gramática", "Grammar")
        case .listening: return app.t("Escucha", "Listening")
        case .mock: return app.t("Simulacro", "Mock test")
        }
    }
}

struct JLPTSection: Decodable {
    let type: JLPTKind
    let duration: Int      // minutes
    let mondai: [JLPTMondai]

    var questionCount: Int { mondai.reduce(0) { $0 + $1.questions.count } }
}

struct JLPTMondai: Decodable, Hashable {
    let id: String
    let title: String
    let instruction: String
    let questions: [JLPTQuestion]
}

struct JLPTQuestion: Decodable, Hashable {
    let id: Int
    let sentence: String
    let underlined: String?
    let choices: [String]
    let answer: Int            // 1-based
    let dialogue: [JLPTLine]?  // listening only
}

/// One line of a listening dialogue: F / M speakers, N for the narrator.
struct JLPTLine: Decodable, Hashable {
    let speaker: String
    let text: String
}

enum JLPT {
    static let levels = ["N5", "N4", "N3", "N2", "N1"]
    static let passMark = 70
    static let mockQuestions = 30
    static let mockMinutes = 20

    /// Progress key for a level + section, e.g. "N5_vocabulary".
    static func key(_ level: String, _ kind: JLPTKind) -> String { "\(level)_\(kind.rawValue)" }
}

/// A question ready to show: choices in display order and a 0-based answer.
struct ExamItem: Identifiable {
    let id: String
    let kind: JLPTKind
    let mondai: JLPTMondai
    let question: JLPTQuestion
    let choices: [String]
    let answer: Int

    static func section(_ level: JLPTLevel, _ kind: JLPTKind) -> [ExamItem] {
        guard let section = level.section(kind) else { return [] }
        return section.mondai.flatMap { m in
            m.questions.map { q in
                ExamItem(id: "\(m.id)-\(q.id)", kind: kind, mondai: m, question: q,
                         choices: q.choices, answer: q.answer - 1)
            }
        }
    }

    /// The mock exam: 30 random vocabulary + grammar questions with shuffled choices.
    static func mock(_ level: JLPTLevel) -> [ExamItem] {
        let pool = section(level, .vocabulary) + section(level, .grammar)
        return pool.shuffled().prefix(JLPT.mockQuestions).map { item in
            let correct = item.choices[item.answer]
            let shuffled = item.choices.shuffled()
            return ExamItem(id: item.id, kind: item.kind, mondai: item.mondai, question: item.question,
                            choices: shuffled, answer: shuffled.firstIndex(of: correct) ?? item.answer)
        }
    }
}
