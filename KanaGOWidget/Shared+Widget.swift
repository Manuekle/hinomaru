import SwiftUI
import WidgetKit

// MARK: - Timeline

struct KanaEntry: TimelineEntry {
    let date: Date
    let snap: WidgetSnapshot
}

/// One provider for every KanaGO! widget: it reads the snapshot the app wrote and plans entries
/// for the next day (hourly, so due cards and the evening "save your streak" nudges stay current).
struct KanaProvider: TimelineProvider {
    func placeholder(in context: Context) -> KanaEntry { KanaEntry(date: .now, snap: .preview) }

    func getSnapshot(in context: Context, completion: @escaping (KanaEntry) -> Void) {
        // The widget gallery shows sample progress until the learner has some of their own.
        let snap = WidgetSnapshot.load() ?? WidgetSnapshot()
        completion(KanaEntry(date: .now, snap: context.isPreview && !snap.onboarded ? .preview : snap))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<KanaEntry>) -> Void) {
        let snap = WidgetSnapshot.load() ?? WidgetSnapshot()
        let cal = Calendar.current
        let start = cal.dateInterval(of: .hour, for: .now)!.start
        var dates = [Date.now]
        dates += (1...24).map { cal.date(byAdding: .hour, value: $0, to: start)! }
        completion(Timeline(entries: dates.map { KanaEntry(date: $0, snap: snap) }, policy: .atEnd))
    }
}

// MARK: - Look

enum WG {
    static let pink = Color(hex: 0xFF6F9C)
    static let pinkText = Color(hex: 0xC2255B)   // pink text on light surfaces (5.7:1 on white)
    static let flame = Color(hex: 0xFF9A1F)
    static let mint = Color(hex: 0x4FD39B)

    static func ink(_ scheme: ColorScheme) -> Color { scheme == .dark ? .white : Color(hex: 0x16151A) }
    static func muted(_ scheme: ColorScheme) -> Color { scheme == .dark ? .white.opacity(0.62) : Color(hex: 0x6C6872) }

    static func rounded(_ size: CGFloat, _ weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
}

extension Color {
    init(hex: UInt32) {
        self.init(red: Double((hex >> 16) & 0xFF) / 255, green: Double((hex >> 8) & 0xFF) / 255, blue: Double(hex & 0xFF) / 255)
    }
}

// MARK: - The moment of the day

/// What the streak widgets show changes with the clock, like a friend checking in:
/// a nudge in the morning, a warning in the evening, a last call at night, a party when you're done.
enum Moment: Equatable {
    case start          // not onboarded yet
    case ready          // nothing done today, plenty of time
    case going(Int)     // some XP today, this many to go
    case done           // daily goal reached
    case late           // evening, streak at risk
    case last           // late night, streak about to break
    case lost           // the streak is gone

    init(_ s: WidgetSnapshot, at date: Date) {
        guard s.onboarded else { self = .start; return }
        let xp = s.xp(on: date)
        let hour = Calendar.current.component(.hour, from: date)
        if xp >= s.dailyGoal { self = .done }
        else if xp > 0 { self = .going(s.dailyGoal - xp) }
        else if s.streak(on: date) > 0 { self = hour >= 21 ? .last : hour >= 18 ? .late : .ready }
        else if s.lastActiveDay != nil { self = .lost }
        else { self = .ready }
    }

    func message(_ s: WidgetSnapshot) -> String {
        switch self {
        case .start: s.t("Abre KanaGO! para empezar", "Open KanaGO! to start")
        case .ready: s.t("¿Practicamos hoy?", "Ready to learn?")
        case .going(let left): s.t("Faltan \(left) XP", "\(left) XP to go")
        case .done: s.t("¡Meta cumplida!", "Goal reached!")
        case .late: s.t("Se hace tarde…", "It's getting late…")
        case .last: s.t("¡Última oportunidad!", "Last chance!")
        case .lost: s.t("Empieza otra racha", "Start a new streak")
        }
    }

    /// Kana-chan's pose for the moment. Some moments have two, picked by the hour or the streak.
    func pet(_ s: WidgetSnapshot, at date: Date) -> String {
        let hour = Calendar.current.component(.hour, from: date)
        switch self {
        case .start: return "pet.wave"
        case .ready: return "pet.study"
        case .going: return "pet.wow"
        case .done: return Self.isMilestone(s.streak(on: date)) ? "pet.party" : "pet.cool"
        case .late: return hour < 20 ? "pet.alarm" : "pet.melt"
        case .last: return "pet.panic"
        case .lost: return hour >= 21 || hour < 6 ? "pet.sleep" : "pet.cry"
        }
    }

    /// Streaks worth a party hat.
    static func isMilestone(_ streak: Int) -> Bool {
        [7, 14, 30, 50, 100, 150, 200, 365].contains(streak) || (streak > 0 && streak % 100 == 0)
    }

    /// Top-left to bottom-right.
    var colors: [Color] {
        switch self {
        case .start, .ready: [Color(hex: 0xFF5F97), Color(hex: 0xF23A7C), Color(hex: 0xD92A6B)]
        case .going: [Color(hex: 0x9B6BFF), Color(hex: 0xD04BB8), Color(hex: 0xF2427F)]
        case .done: [Color(hex: 0xFFFAF0), Color(hex: 0xFFEEC2), Color(hex: 0xFFDD8A)]
        case .late: [Color(hex: 0xF2476A), Color(hex: 0xCF1F55), Color(hex: 0xA3124A)]
        case .last: [Color(hex: 0x9A1230), Color(hex: 0x4A0818), Color(hex: 0x24040B)]
        case .lost: [Color(hex: 0x3A3585), Color(hex: 0x1F1C52), Color(hex: 0x100E2C)]
        }
    }

    /// Light pooled behind Kana-chan: sun on the good days, embers or moonlight on the bad ones.
    var glow: Color? {
        switch self {
        case .done: Color(hex: 0xFFC440).opacity(0.55)
        case .last: Color(hex: 0xFF5C33).opacity(0.55)
        case .lost: Color(hex: 0x8C7CFF).opacity(0.45)
        default: nil
        }
    }

    var isLight: Bool { self == .done }
    var ink: Color { isLight ? Color(hex: 0x3B2412) : .white }
    var soft: Color { isLight ? Color(hex: 0x3B2412).opacity(0.82) : .white.opacity(0.94) }
    var flame: Color {
        switch self {
        case .done: Color(hex: 0xFF8A00)
        case .last: Color(hex: 0xFFB199)
        case .lost: .white.opacity(0.45)
        default: .white
        }
    }
    var dot: Color { isLight ? Color(hex: 0x3B2412).opacity(0.12) : .white.opacity(0.26) }
    var dotOn: Color { isLight ? Color(hex: 0xFF9500) : .white }
    var check: Color { isLight ? .white : colors[1] }
    var pill: Color { isLight ? Color(hex: 0x3B2412).opacity(0.08) : .white.opacity(0.22) }
    /// Color of the "!" badge on the flame, only while the streak is at risk.
    var alert: Color? { self == .late || self == .last ? colors[1] : nil }
}

/// Full-bleed background for a moment, with a soft sheen in the top-left corner.
struct MomentBackground: View {
    let moment: Moment

    var body: some View {
        ZStack {
            LinearGradient(colors: moment.colors, startPoint: .topLeading, endPoint: .bottomTrailing)
            if let glow = moment.glow {
                RadialGradient(colors: [glow, glow.opacity(0)], center: UnitPoint(x: 0.88, y: 0.92), startRadius: 0, endRadius: 150)
            } else {
                RadialGradient(colors: [.white.opacity(0.22), .white.opacity(0)], center: UnitPoint(x: 0.12, y: 0), startRadius: 0, endRadius: 140)
            }
        }
    }
}

/// Paper in light mode, ink in dark mode: the word widget stays calm whatever the hour.
struct PaperBackground: View {
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        LinearGradient(colors: scheme == .dark ? [Color(hex: 0x1F1E24), Color(hex: 0x0F0E12)] : [.white, Color(hex: 0xF7F4EF)],
                       startPoint: .topLeading, endPoint: .bottomTrailing)
    }
}

// MARK: - Pieces

/// Kana-chan, always in full color, peeking in from the bottom-right corner.
struct PetImage: View {
    let asset: String
    var height: CGFloat
    /// Wide poses fit this width instead of the height. They sit bottom-right in the box.
    var width: CGFloat?
    /// Soft light behind her where the background is dark. Never an outline.
    var glow: Color?
    @Environment(\.widgetRenderingMode) private var renderingMode

    var body: some View {
        Group {
            if #available(iOS 18.0, *) {
                // Keep Kana-chan in color when the user tints their home screen.
                Image(asset).resizable().widgetAccentedRenderingMode(.fullColor)
            } else {
                Image(asset).resizable()
            }
        }
        .scaledToFit()
        .frame(maxWidth: width ?? .infinity, maxHeight: height, alignment: .bottomTrailing)
        .frame(width: width, height: height, alignment: .bottomTrailing)
        .shadow(color: .black.opacity(0.18), radius: 8, y: 6)
        .background {
            // Tinted and clear Home Screens flatten colors, so the glow only shows in full color.
            if let glow, renderingMode == .fullColor {
                RadialGradient(colors: [glow.opacity(0.75), glow.opacity(0)], center: .center, startRadius: 0, endRadius: height * 0.75)
                    .frame(width: height * 1.6, height: height * 1.6)
            }
        }
        .accessibilityHidden(true)
    }
}

struct FlameStreak: View {
    let streak: Int
    var size: CGFloat = 30
    var flame: Color = WG.flame
    var ink: Color = .white
    /// A small "!" on the flame when the streak is at risk.
    var alert: Color?

    var body: some View {
        HStack(alignment: .center, spacing: size * 0.1) {
            Image("hi.fire.fill")
                .resizable()
                .scaledToFit()
                .frame(width: size * 0.56, height: size * 0.56)
                .foregroundStyle(flame)
                .overlay(alignment: .bottomTrailing) {
                    if let alert {
                        Text("!")
                            .font(.system(size: size * 0.26, weight: .black, design: .rounded))
                            .foregroundStyle(alert)
                            .frame(width: size * 0.34, height: size * 0.34)
                            .background(Circle().fill(ink))
                            .offset(x: size * 0.1, y: size * 0.06)
                    }
                }
                .padding(.trailing, alert == nil ? 0 : size * 0.12)
                .widgetAccentable()
            Text("\(streak)")
                .font(WG.rounded(size, .heavy))
                .foregroundStyle(ink)
                .contentTransition(.numericText())
        }
    }
}

/// The last seven days as dots: done (with a check), partly done, or empty; today gets a ring.
struct WeekDots: View {
    let snap: WidgetSnapshot
    let date: Date
    let moment: Moment
    var size: CGFloat = 16

    var body: some View {
        let f = DateFormatter()
        f.locale = Locale(identifier: snap.lang)
        f.dateFormat = "EEEEE"
        return HStack(spacing: 0) {
            ForEach(snap.week(endingOn: date), id: \.day) { day in
                let done = day.xp >= snap.dailyGoal
                let today = Calendar.current.isDate(day.day, inSameDayAs: date)
                VStack(spacing: 4) {
                    Text(f.string(from: day.day).uppercased())
                        .font(WG.rounded(9, .bold))
                        .foregroundStyle(moment.soft)
                    Circle()
                        .fill(done ? moment.dotOn : day.xp > 0 ? moment.dotOn.opacity(0.5) : moment.dot)
                        .frame(width: size, height: size)
                        .overlay {
                            if done {
                                Image(systemName: "checkmark").font(.system(size: size * 0.45, weight: .black)).foregroundStyle(moment.check)
                            }
                        }
                        .overlay {
                            if today && !done { Circle().strokeBorder(moment.ink, lineWidth: 1.5) }
                        }
                        .widgetAccentable()
                }
                .frame(maxWidth: .infinity)
            }
        }
    }
}
