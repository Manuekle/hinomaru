import Foundation

/// What the home-screen widgets know about the learner. The app writes it to the shared
/// App Group container whenever progress changes; the widget extension only reads it.
struct WidgetSnapshot: Codable {
    struct DayWord: Codable, Hashable {
        let day: String        // yyyy-MM-dd
        let jp: String
        let kana: String?
        let romaji: String
        let es: String
        let en: String
        let level: String
    }

    var name: String = ""
    var lang: String = "es"
    var streak: Int = 0
    var lastActiveDay: Date?
    var xpByDay: [String: Int] = [:]
    var dailyGoal: Int = 50
    /// Upcoming SRS due dates (sorted, capped) so the widget can count due cards at any future moment.
    var dueDates: [Date] = []
    /// Word of the day for today and the next few days.
    var words: [DayWord] = []
    /// The app's "Show romaji" switch (optional so snapshots written by older builds still decode).
    var showRomaji: Bool?
    var onboarded = false

    static let appGroup = "group.com.manuekle.kanago"
    static let fileName = "widget-snapshot.json"

    static var url: URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroup)?
            .appendingPathComponent(fileName)
    }

    static func load() -> WidgetSnapshot? {
        guard let url, let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    }

    func save() {
        guard let url = Self.url, let data = try? JSONEncoder().encode(self) else { return }
        try? data.write(to: url, options: .atomic)
    }

    // MARK: Derived values at a given moment (widget timelines look ahead)

    private static let dayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    /// Same key format as `AppModel.dayKey`.
    static func dayKey(_ date: Date) -> String { dayFormatter.string(from: date) }

    func xp(on date: Date) -> Int { xpByDay[Self.dayKey(date)] ?? 0 }

    func goalProgress(on date: Date) -> Double {
        min(Double(xp(on: date)) / Double(max(dailyGoal, 1)), 1)
    }

    /// The streak as the app will show it on that day: it survives until the day after a missed one.
    func streak(on date: Date) -> Int {
        guard let last = lastActiveDay else { return 0 }
        let cal = Calendar.current
        let gap = cal.dateComponents([.day], from: cal.startOfDay(for: last), to: cal.startOfDay(for: date)).day ?? 0
        return gap > 1 ? 0 : streak
    }

    func dueCount(at date: Date) -> Int { dueDates.prefix { $0 <= date }.count }

    func word(on date: Date) -> DayWord? {
        let key = Self.dayKey(date)
        return words.first { $0.day == key } ?? words.last
    }

    /// Last 7 days of XP, oldest first.
    func week(endingOn date: Date) -> [(day: Date, xp: Int)] {
        let cal = Calendar.current
        return (0..<7).reversed().map { back in
            let d = cal.date(byAdding: .day, value: -back, to: date)!
            return (d, xp(on: d))
        }
    }

    func t(_ es: String, _ en: String) -> String { lang == "es" ? es : en }

    static let preview: WidgetSnapshot = {
        var s = WidgetSnapshot()
        s.name = "Manu"
        s.streak = 6
        s.lastActiveDay = .now
        s.onboarded = true
        let cal = Calendar.current
        for (i, xp) in [40, 55, 0, 60, 35, 80, 30].enumerated() {
            let d = cal.date(byAdding: .day, value: i - 6, to: .now)!
            s.xpByDay[dayKey(d)] = xp
        }
        s.dueDates = Array(repeating: .now.addingTimeInterval(-60), count: 12)
        s.words = [DayWord(day: dayKey(.now), jp: "学校", kana: "がっこう", romaji: "gakkou", es: "escuela", en: "school", level: "N5")]
        return s
    }()
}
