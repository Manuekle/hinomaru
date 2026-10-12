import SwiftUI
import WidgetKit

/// Gallery copy follows the phone's language (the app's own ES/EN switch isn't known yet there).
private func gallery(_ es: String, _ en: String) -> String {
    Locale.current.language.languageCode?.identifier == "es" ? es : en
}

// MARK: - Racha

struct StreakWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "KanaGOStreak", provider: KanaProvider()) { entry in
            StreakView(entry: entry)
        }
        .configurationDisplayName(gallery("Racha", "Streak"))
        .description(gallery("Tu racha y Kana-chan, que cambia según la hora del día.",
                             "Your streak and Kana-chan, who changes with the time of day."))
        .supportedFamilies([.systemSmall, .accessoryCircular, .accessoryInline])
        .contentMarginsDisabled()
    }
}

struct StreakView: View {
    let entry: KanaEntry
    /// Set only by previews; widgets read the family from the environment.
    var familyOverride: WidgetFamily?
    @Environment(\.widgetFamily) private var envFamily
    private var family: WidgetFamily { familyOverride ?? envFamily }

    private var s: WidgetSnapshot { entry.snap }
    private var streak: Int { s.streak(on: entry.date) }
    private var xp: Int { s.xp(on: entry.date) }

    var body: some View {
        switch family {
        case .accessoryCircular:
            Gauge(value: s.goalProgress(on: entry.date)) {
                Image("hi.fire.fill")
            } currentValueLabel: {
                Text("\(streak)").font(WG.rounded(20, .heavy))
            }
            .gaugeStyle(.accessoryCircularCapacity)
            .widgetURL(URL(string: "kanago://home"))
            .containerBackground(for: .widget) { AccessoryWidgetBackground() }
        case .accessoryInline:
            Text("\(Image(systemName: "flame.fill")) \(streak) · \(xp)/\(s.dailyGoal) XP")
                .containerBackground(for: .widget) { Color.clear }
        default:
            let moment = Moment(s, at: entry.date)
            StreakSmall(snap: s, streak: streak, moment: moment, date: entry.date)
                .widgetURL(URL(string: "kanago://home"))
                .containerBackground(for: .widget) { MomentBackground(moment: moment) }
        }
    }
}

/// Small streak widget: the number up top, a line from Kana-chan, and Kana-chan herself in the corner.
struct StreakSmall: View {
    let snap: WidgetSnapshot
    let streak: Int
    let moment: Moment
    let date: Date

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            FlameStreak(streak: streak, size: 42, flame: moment.flame, ink: moment.ink, alert: moment.alert)
            Text(moment.message(snap))
                .font(WG.rounded(15, .bold))
                .foregroundStyle(moment.soft)
                .lineLimit(2)
                .minimumScaleFactor(0.8)
                .frame(maxWidth: 96, alignment: .leading)
            Spacer(minLength: 0)
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(alignment: .bottomTrailing) {
            let pet = moment.pet(snap, at: date)
            let nudge = Self.nudge(pet)
            PetImage(asset: pet, height: 94, width: 112)
                .rotationEffect(.degrees(-4))
                .offset(x: 14 + nudge.width, y: 16 + nudge.height)
        }
    }

    /// Some poses keep their face low (melting, crying, asleep) or hold a prop on the left (the
    /// pencil), so they sit a little higher or further right to stay clear of the text.
    static func nudge(_ pet: String) -> CGSize {
        switch pet {
        case "pet.melt": CGSize(width: 0, height: -12)
        case "pet.cry", "pet.sleep": CGSize(width: 0, height: -6)
        case "pet.study": CGSize(width: 10, height: 0)
        default: .zero
        }
    }
}

// MARK: - Palabra del día

struct WordWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "KanaGOWord", provider: KanaProvider()) { entry in
            WordView(entry: entry)
        }
        .configurationDisplayName(gallery("Palabra del día", "Word of the day"))
        .description(gallery("Una palabra nueva de tu nivel cada día.", "A new word from your level every day."))
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
        .contentMarginsDisabled()
    }
}

struct WordView: View {
    let entry: KanaEntry
    /// Set only by previews; widgets read the family from the environment.
    var familyOverride: WidgetFamily?
    @Environment(\.widgetFamily) private var envFamily
    private var family: WidgetFamily { familyOverride ?? envFamily }
    @Environment(\.colorScheme) private var scheme

    private var s: WidgetSnapshot { entry.snap }

    var body: some View {
        if let w = s.word(on: entry.date) {
            content(w)
                .widgetURL(URL(string: "kanago://word"))
        } else {
            VStack(spacing: 6) {
                PetImage(asset: "pet.wave", height: 54)
                Text(s.t("Abre KanaGO! para tu primera palabra", "Open KanaGO! for your first word"))
                    .font(WG.rounded(13, .semibold))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(WG.ink(scheme))
            }
            .padding(16)
            .containerBackground(for: .widget) { PaperBackground() }
        }
    }

    private func meaning(_ w: WidgetSnapshot.DayWord) -> String { s.lang == "es" ? w.es : w.en }

    /// Reading line: kana (when the word has kanji) and romaji.
    private func reading(_ w: WidgetSnapshot.DayWord) -> String {
        if let kana = w.kana, !kana.isEmpty, kana != w.jp { return "\(kana) · \(w.romaji)" }
        return w.romaji
    }

    @ViewBuilder private func content(_ w: WidgetSnapshot.DayWord) -> some View {
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 0) {
                Text(w.jp).font(WG.rounded(20, .heavy)).widgetAccentable()
                Text(reading(w)).font(WG.rounded(12, .semibold)).lineLimit(1)
                Text(meaning(w)).font(.system(size: 12)).lineLimit(1).foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .containerBackground(for: .widget) { Color.clear }
        case .systemMedium:
            card(w, jpSize: 46)
                .background(alignment: .bottomTrailing) {
                    // Kana-chan peeking up from the bottom edge, curious about today's word.
                    PetImage(asset: "pet.peek", height: 104, width: 150, glow: scheme == .dark ? WG.pink : nil)
                        .offset(x: -14, y: 2)
                }
                .containerBackground(for: .widget) { PaperBackground() }
        default:
            card(w, jpSize: 40)
                .containerBackground(for: .widget) { PaperBackground() }
        }
    }

    private func card(_ w: WidgetSnapshot.DayWord, jpSize: CGFloat) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(alignment: .top) {
                Text(s.t("Palabra del día", "Word of the day"))
                    .font(WG.rounded(11, .bold))
                    .foregroundStyle(WG.muted(scheme))
                    .lineLimit(2)
                Spacer(minLength: 4)
                if family == .systemSmall {
                    level(w)
                }
            }
            Spacer(minLength: 0)
            Text(w.jp)
                .font(.system(size: jpSize, weight: .bold))
                .foregroundStyle(WG.ink(scheme))
                .lineLimit(1)
                .minimumScaleFactor(0.5)
            Text(reading(w))
                .font(WG.rounded(12, .semibold))
                .foregroundStyle(WG.muted(scheme))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            HStack(spacing: 6) {
                Text(meaning(w))
                    .font(WG.rounded(16, .bold))
                    .foregroundStyle(WG.ink(scheme))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                if family == .systemMedium { level(w) }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .background(alignment: .bottomTrailing) {
            // The first character, huge and faint, like a watermark on the paper.
            if family == .systemSmall, let first = w.jp.first {
                Text(String(first))
                    .font(.system(size: 130, weight: .bold))
                    .foregroundStyle(WG.ink(scheme).opacity(0.045))
                    .offset(x: 22, y: 34)
                    .accessibilityHidden(true)
            }
        }
    }

    private func level(_ w: WidgetSnapshot.DayWord) -> some View {
        Text(w.level)
            .font(WG.rounded(10, .heavy))
            .foregroundStyle(scheme == .dark ? Color(hex: 0x16151A) : .white)
            .padding(.horizontal, 7).padding(.vertical, 3)
            .background(Capsule().fill(WG.ink(scheme)))
            .widgetAccentable()
    }
}

// MARK: - Hoy

struct TodayWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "KanaGOToday", provider: KanaProvider()) { entry in
            TodayView(entry: entry)
        }
        .configurationDisplayName(gallery("Hoy", "Today"))
        .description(gallery("Racha, semana y tarjetas por repasar. Kana-chan cambia según la hora.",
                             "Streak, week and cards to review. Kana-chan changes with the time of day."))
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

struct TodayView: View {
    let entry: KanaEntry

    var body: some View {
        let s = entry.snap
        let moment = Moment(s, at: entry.date)
        let due = s.dueCount(at: entry.date)
        TodayMedium(snap: s, date: entry.date, moment: moment, due: due)
            .widgetURL(URL(string: due > 0 ? "kanago://review" : "kanago://home"))
            .containerBackground(for: .widget) { MomentBackground(moment: moment) }
    }
}

struct TodayMedium: View {
    let snap: WidgetSnapshot
    let date: Date
    let moment: Moment
    let due: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .center) {
                FlameStreak(streak: snap.streak(on: date), size: 36, flame: moment.flame, ink: moment.ink, alert: moment.alert)
                Spacer(minLength: 8)
                pill
            }
            Text(moment.message(snap))
                .font(WG.rounded(15, .bold))
                .foregroundStyle(moment.soft)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            Spacer(minLength: 0)
            WeekDots(snap: snap, date: date, moment: moment)
                .frame(width: 186)
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(alignment: .bottomTrailing) {
            PetImage(asset: moment.pet(snap, at: date), height: 120, width: 150)
                .rotationEffect(.degrees(-4))
                .offset(x: 6, y: 12)
        }
    }

    private var pill: some View {
        HStack(spacing: 4) {
            Image("hi.cards.fill")
                .resizable().scaledToFit().frame(width: 12, height: 12)
            Text(due > 0 ? snap.t("\(due) por repasar", "\(due) to review") : snap.t("Repasos al día", "Reviews done"))
                .font(WG.rounded(11, .bold))
        }
        .foregroundStyle(moment.ink)
        .padding(.horizontal, 9).padding(.vertical, 5)
        .background(Capsule().fill(moment.pill))
        .widgetAccentable()
    }
}

#Preview(as: .systemSmall) { StreakWidget() } timeline: { KanaEntry(date: .now, snap: .preview) }
#Preview(as: .systemMedium) { TodayWidget() } timeline: { KanaEntry(date: .now, snap: .preview) }
#Preview(as: .systemMedium) { WordWidget() } timeline: { KanaEntry(date: .now, snap: .preview) }
