import Foundation
import WidgetKit

/// Mirrors the bits of progress the widgets show into the shared App Group container.
extension AppModel {
    /// Progress changes in bursts (every answer), so coalesce them before touching the widgets.
    func scheduleWidgetSync() {
        widgetSync?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.syncWidgets() }
        widgetSync = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5, execute: work)
    }

    func syncWidgets() {
        widgetSync?.cancel()
        widgetSync = nil
        var s = WidgetSnapshot()
        s.name = p.name
        s.lang = p.lang == .es ? "es" : "en"
        s.streak = p.streak
        s.lastActiveDay = p.lastActiveDay
        s.xpByDay = p.xpByDay.filter { $0.key >= Self.dayKey(Calendar.current.date(byAdding: .day, value: -8, to: .now)!) }
        s.dailyGoal = p.dailyGoal
        s.showRomaji = p.showRomaji
        s.onboarded = p.onboarded
        s.dueDates = Array(p.srs.values.map(\.due).sorted().prefix(400))
        let level = studyLevel
        s.words = (0..<8).compactMap { offset in
            let day = Calendar.current.date(byAdding: .day, value: offset, to: .now)!
            guard let (_, card) = wordOfTheDay(on: day) else { return nil }
            return .init(day: Self.dayKey(day), jp: card.jp, kana: card.kana, romaji: card.romaji,
                         es: card.es, en: card.en, level: level)
        }
        s.save()
        WidgetCenter.shared.reloadAllTimelines()
    }
}
