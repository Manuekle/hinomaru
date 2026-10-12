import Foundation
import UserNotifications

// MARK: - My vocabulary (words saved from stories, songs and the word of the day)

struct SavedWord: Codable, Hashable, Identifiable {
    var jp: String
    var kana: String
    var romaji: String
    var es: String
    var en: String
    var source: String
    var added: Date = .now

    var id: String { jp }
    func meaning(_ lang: Lang) -> String { lang == .es ? es : en }

    var card: Card {
        Card(jp: jp, romaji: romaji, en: en, es: es, example: nil, exampleRomaji: nil, exampleEn: nil,
             exampleEs: nil, kana: kana == jp ? nil : kana, category: nil, categoryEs: nil, pos: nil,
             posEs: nil, extra: nil, sortOrder: nil)
    }
}

extension SavedWord {
    init(card: Card, source: String) {
        self.init(jp: card.jp, kana: card.kana ?? card.jp, romaji: card.romaji, es: card.es, en: card.en, source: source)
    }

    init(story v: StoryVocab, source: String) {
        self.init(jp: v.jp, kana: v.kana, romaji: v.romaji ?? Romaji.from(v.kana), es: v.es, en: v.en, source: source)
    }

    init(song v: SongVocab, source: String) {
        self.init(jp: v.jp, kana: v.kana, romaji: v.romaji ?? Romaji.from(v.kana), es: v.es, en: v.en, source: source)
    }
}

enum Romaji {
    /// Hepburn-ish romaji for any Japanese text, using the system tokenizer's readings.
    static func from(_ text: String) -> String {
        let cf = text as CFString
        let tokenizer = CFStringTokenizerCreate(nil, cf, CFRange(location: 0, length: CFStringGetLength(cf)),
                                                kCFStringTokenizerUnitWord, Locale(identifier: "ja") as CFLocale)
        var parts: [String] = []
        while CFStringTokenizerAdvanceToNextToken(tokenizer).rawValue != 0 {
            if let latin = CFStringTokenizerCopyCurrentTokenAttribute(tokenizer, kCFStringTokenizerAttributeLatinTranscription) as? String {
                parts.append(latin)
            } else {
                let range = CFStringTokenizerGetCurrentTokenRange(tokenizer)
                parts.append((text as NSString).substring(with: NSRange(location: range.location, length: range.length)))
            }
        }
        let joined = parts.joined(separator: " ")
        return joined.isEmpty ? text : joined
    }
}

extension AppModel {
    static let savedDeckId = "saved"

    /// Saved words as a deck, so flashcards and the review queue can use them.
    var savedDeck: Deck {
        Deck(id: Self.savedDeckId, level: "", kind: "Vocabulary", kindEs: "Vocabulario",
             titleEn: "My words", titleEs: "Mis palabras", descEn: "", descEs: "",
             cards: p.savedWords.map(\.card), grammar: [])
    }

    func isSaved(_ jp: String) -> Bool { p.savedWords.contains { $0.jp == jp } }

    func toggleSaved(_ word: SavedWord) {
        if isSaved(word.jp) {
            removeSaved(word.jp)
        } else {
            p.savedWords.insert(word, at: 0)
            // first review tomorrow, so saving a word doesn't take over today's "next step"
            let key = savedDeck.cardKey(word.card)
            let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Calendar.current.startOfDay(for: .now)) ?? .now
            if p.srs[key] == nil { p.srs[key] = SRSState(due: tomorrow) }
        }
    }

    func removeSaved(_ jp: String) {
        p.savedWords.removeAll { $0.jp == jp }
        p.srs.removeValue(forKey: "\(Self.savedDeckId)#\(jp)")
    }

    var savedDueCount: Int {
        let deck = savedDeck
        let now = Date.now
        return deck.cards.filter { (p.srs[deck.cardKey($0)]?.due ?? .distantPast) <= now }.count
    }

    /// Due saved words first; when nothing is due, a shuffled practice round.
    func savedQueue(limit: Int = 20) -> [StudyItem] {
        let deck = savedDeck
        let now = Date.now
        let due = deck.cards.filter { (p.srs[deck.cardKey($0)]?.due ?? .distantPast) <= now }
        let pick = due.isEmpty ? deck.cards.shuffled() : due.shuffled()
        return pick.prefix(limit).map { StudyItem(deck: deck, card: $0) }
    }

    // MARK: Daily picks

    /// N-level the learner is working on, for level-matched daily content.
    var studyLevel: String {
        guard let key = nextLesson?.level.key, key.hasPrefix("N") else { return "N5" }
        return key
    }

    /// Stable per-day number (Swift's hashValue changes every launch).
    private func daySeed(_ date: Date) -> Int {
        Self.dayKey(date).unicodeScalars.reduce(5381) { ($0 &* 33 &+ Int($1.value)) & 0x7fff_ffff }
    }

    private var daySeed: Int { daySeed(.now) }

    var wordOfTheDay: (deck: Deck, card: Card)? { wordOfTheDay(on: .now) }

    func wordOfTheDay(on date: Date) -> (deck: Deck, card: Card)? {
        let decks = content.decks.filter { $0.level == studyLevel && !$0.isGrammar && !["Hiragana", "Katakana"].contains($0.kind) }
        let pool = decks.flatMap { d in d.cards.filter { $0.jp.count >= 2 }.map { (d, $0) } }
        guard !pool.isEmpty else { return nil }
        let pick = pool[daySeed(date) % pool.count]
        return (pick.0, pick.1)
    }

    var storyOfTheDay: Story? {
        let atLevel = content.stories.filter { $0.level == studyLevel }
        let pool = atLevel.isEmpty ? content.stories : atLevel
        let unread = pool.filter { p.storiesRead[$0.id] == nil }
        let list = unread.isEmpty ? pool : unread
        guard !list.isEmpty else { return nil }
        return list[daySeed % list.count]
    }

    // MARK: JLPT

    func jlptBest(_ level: String, _ kind: JLPTKind) -> Int? { p.jlptBest[JLPT.key(level, kind)] }

    func recordJLPT(_ level: String, _ kind: JLPTKind, pct: Int) {
        let key = JLPT.key(level, kind)
        p.jlptBest[key] = max(p.jlptBest[key] ?? 0, pct)
        if kind == .mock, pct >= JLPT.passMark, p.jlptPassed[level] == nil {
            p.jlptPassed[level] = .now
        }
    }
}

// MARK: - Daily reminder

enum Reminders {
    private static let id = "kanago.daily"

    /// Asks for permission if needed; returns whether reminders can be shown.
    static func authorize() async -> Bool {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        switch settings.authorizationStatus {
        case .authorized, .provisional, .ephemeral: return true
        case .denied: return false
        default: return (try? await center.requestAuthorization(options: [.alert, .sound, .badge])) ?? false
        }
    }

    static func schedule(hour: Int, lang: Lang) {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: [id])
        let lines: [(String, String)] = lang == .es
            ? [("Kana-chan te espera ✨", "5 minutos de japonés y tu racha sigue viva."),
               ("¡Hora de japonés! 🔥", "Tus tarjetas te extrañan. Un repaso rápido y listo."),
               ("今日も頑張ろう！", "Una lección corta hoy vale más que tres mañana.")]
            : [("Kana-chan is waiting ✨", "5 minutes of Japanese keeps your streak alive."),
               ("Japanese time! 🔥", "Your cards miss you. A quick review and you're done."),
               ("今日も頑張ろう！", "A short lesson today beats three tomorrow.")]
        let line = lines.randomElement()!
        let content = UNMutableNotificationContent()
        content.title = line.0
        content.body = line.1
        content.sound = .default
        var when = DateComponents()
        when.hour = hour
        when.minute = 0
        let trigger = UNCalendarNotificationTrigger(dateMatching: when, repeats: true)
        center.add(UNNotificationRequest(identifier: id, content: content, trigger: trigger))
    }

    static func cancel() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [id])
    }
}
