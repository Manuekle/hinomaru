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

extension View {
    /// SF Pro Rounded with the landing page's tracking (in em): −0.04 for big numbers, −0.02 for big
    /// Japanese, −0.01 for copy.
    func wgFont(_ size: CGFloat, _ weight: Font.Weight = .bold, tracking em: CGFloat = -0.04) -> some View {
        font(WG.rounded(size, weight)).tracking(size * em)
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

/// Kana-chan, always in full color, in the bottom-right corner.
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

/// Where Kana-chan is in each pose's artwork, as fractions of the image, measured from the SVGs
/// tilted −4°. `body` is her body without props; `reach` is how far right anything visible goes
/// (loose confetti and sweat drops excepted) and how low her hands and eyes go; `corner` is how far
/// (× art width) she backs off diagonally so her hands clear the widget's rounded corner.
struct PetPose {
    let aspect: CGFloat
    let body: CGRect
    let reach: CGPoint
    let corner: CGFloat

    static subscript(_ asset: String) -> PetPose {
        all[asset] ?? PetPose(aspect: 1, body: CGRect(x: 0, y: 0, width: 1, height: 1), reach: CGPoint(x: 1, y: 1), corner: 0)
    }

    private static let all: [String: PetPose] = [
        "pet.wave": PetPose(aspect: 1.0953, body: CGRect(x: 0.000, y: 0.224, width: 0.856, height: 0.774), reach: CGPoint(x: 0.991, y: 1.010), corner: 0.008),
        "pet.study": PetPose(aspect: 1.3269, body: CGRect(x: 0.146, y: 0.383, width: 0.684, height: 0.614), reach: CGPoint(x: 0.995, y: 0.861), corner: 0.013),
        "pet.wow": PetPose(aspect: 1.2404, body: CGRect(x: 0.056, y: 0.094, width: 0.834, height: 0.891), reach: CGPoint(x: 1.005, y: 0.831), corner: 0.015),
        "pet.cool": PetPose(aspect: 1.2320, body: CGRect(x: 0.042, y: 0.225, width: 0.786, height: 0.768), reach: CGPoint(x: 0.982, y: 0.950), corner: 0.014),
        "pet.party": PetPose(aspect: 1.0918, body: CGRect(x: 0.000, y: 0.333, width: 0.664, height: 0.665), reach: CGPoint(x: 0.800, y: 0.960), corner: 0.006),
        "pet.alarm": PetPose(aspect: 0.9760, body: CGRect(x: 0.000, y: 0.180, width: 0.886, height: 0.795), reach: CGPoint(x: 0.986, y: 0.893), corner: 0.008),
        "pet.melt": PetPose(aspect: 1.5677, body: CGRect(x: 0.122, y: 0.132, width: 0.756, height: 0.865), reach: CGPoint(x: 1.018, y: 1.007), corner: 0.013),
        "pet.panic": PetPose(aspect: 1.0146, body: CGRect(x: 0.040, y: 0.329, width: 0.780, height: 0.669), reach: CGPoint(x: 0.880, y: 0.839), corner: 0.028),
        "pet.sleep": PetPose(aspect: 1.1510, body: CGRect(x: 0.000, y: 0.376, width: 0.754, height: 0.619), reach: CGPoint(x: 0.977, y: 0.864), corner: 0.006),
        "pet.cry": PetPose(aspect: 1.1744, body: CGRect(x: 0.038, y: 0.214, width: 0.786, height: 0.692), reach: CGPoint(x: 0.977, y: 0.930), corner: 0.007),
    ]
}

/// Kana-chan big in the bottom-right corner, like the stickers on the landing page. Every pose gets
/// the same body size (`size`, the geometric mean of her body's width and height), and her body may
/// sink below the bottom edge (up to 18% of it), but her hands, eyes and props stay 3pt inside.
struct CornerPet: View {
    let asset: String
    let size: CGFloat
    var glow: Color?

    var body: some View {
        GeometryReader { geo in
            let p = PetPose[asset]
            let width = size / (p.body.width * p.body.height / p.aspect).squareRoot()
            let height = width / p.aspect
            let inset: CGFloat = 3
            let right = (1 - p.reach.x) * width - inset
            let bottom = min((1 - p.reach.y) * height - inset, (0.18 * p.body.height + 1 - p.body.maxY) * height)
            let pull = p.corner * width
            PetImage(asset: asset, height: height, width: width, glow: glow)
                .rotationEffect(.degrees(-4))
                .position(x: geo.size.width + right - pull - width / 2,
                          y: geo.size.height + bottom - pull - height / 2)
        }
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
                .wgFont(size, .heavy, tracking: -0.04)
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
                        .wgFont(9)
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
