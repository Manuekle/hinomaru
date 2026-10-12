import SwiftUI

/// KanaGO! design tokens — candy pink, sumi ink and sticker whites.
enum KG {
    /// Brand pink, the widgets' tone — fills under bold white text/icons (3.7:1).
    static let pink = Color(hex: 0xF23A7C)
    /// Button lips under `pink`; also pink icons/text on light (5.3:1 on white).
    static let pinkDeep = Color(hex: 0xCC2462)
    /// Hero gradient, same stops as the widgets' pink moments.
    static let pinkGradient = [Color(hex: 0xFF5F97), pink, Color(hex: 0xD92A6B)]
    static let pinkSoft = Color(hex: 0xFFE4ED)
    /// Pink for text on light surfaces — ≥ 4.5:1 on white, cream and pinkSoft.
    static let pinkText = Color(hex: 0xC2255B)
    /// Bubblegum pink for ink/dark surfaces: text, glows and accents there (6:1 on ink,
    /// where `pink` only reaches 3.5:1). Never under white text.
    static let candy = Color(hex: 0xFF6F9C)
    static let ink = Color(hex: 0x232127)
    static let inkDeep = Color(hex: 0x111014)
    static let inkSoft = Color(hex: 0x4A4750)
    static let cream = Color(hex: 0xF7F5F2)
    static let paper = Color.white
    /// Secondary text on light surfaces — 5.4:1 on white, 5:1 on cream. On ink use white.opacity(0.6).
    static let muted = Color(hex: 0x6C6872)
    static let line = Color(hex: 0xECE8E4)
    /// Inactive icons: a zero streak, locked path nodes.
    static let off = Color(hex: 0xA8A29C)
    /// Fills under bold white text (3.5:1); `skyDeep` for lips and small blue text on light.
    static let sky = Color(hex: 0x1A8CF0)
    static let skyDeep = Color(hex: 0x1271C2)
    static let sun = Color(hex: 0xFFC83D)
    static let sunDeep = Color(hex: 0xE8A21A)
    static let flame = Color(hex: 0xFF9A1F)
    /// Fills under bold white text (3.1:1); `mintDeep` for lips and small green text on light.
    static let mint = Color(hex: 0x12A865)
    static let mintDeep = Color(hex: 0x0C7A4C)
    /// N2 / build mode purple (the widgets' violet) — bold white text 3.5:1.
    static let grape = Color(hex: 0x9B6BFF)
    static let lilac = Color(hex: 0xC3CBF4)
    static let red = Color(hex: 0xF0575D)
    static let redDeep = Color(hex: 0xC93E44)

    /// Light negative tracking (in em) for big rounded titles. SF Pro already tunes its own
    /// spacing per size, so body text and small labels keep the default.
    static let tracking: CGFloat = -0.02

    /// Widest a tab page's column grows on big screens (the iPhone Duo unfolded); phones never reach it.
    static let readableWidth: CGFloat = 680
    /// Study sessions keep a phone-like column there, so cards and buttons don't stretch.
    static let sessionWidth: CGFloat = 600
    /// Onboarding questions, narrower still.
    static let formWidth: CGFloat = 520

    static func titleTracking(_ size: CGFloat) -> CGFloat {
        size >= 26 ? size * tracking : size >= 20 ? size * tracking * 0.5 : 0
    }

    /// Content colour for a solid `fill`: white when it reaches 3:1, ink otherwise (sun and
    /// lilac). Callers are bold/semibold labels, where Apple's HIG asks 3:1 at any size.
    static func on(_ fill: Color) -> Color {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        UIColor(fill).getRed(&r, green: &g, blue: &b, alpha: &a)
        func lin(_ c: CGFloat) -> CGFloat { c <= 0.03928 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4) }
        let luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
        return 1.05 / (luminance + 0.05) >= 3 ? .white : ink
    }

    static func levelColor(_ level: String) -> Color {
        switch level {
        case "Survival": return sun
        case "N5": return pink
        case "N4": return sky
        case "N3": return mint
        case "N2": return grape
        case "N1": return ink
        default: return muted
        }
    }
}

extension Color {
    init(hex: UInt32, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}

extension Font {
    /// SF Pro Rounded — titles, labels and buttons, the KanaGO! voice.
    static func kg(_ size: CGFloat, _ weight: Font.Weight = .semibold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }

    /// SF Pro Text — body copy and secondary lines.
    static func kgText(_ size: CGFloat, _ weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .default)
    }
}

extension View {
    func kgFont(_ size: CGFloat, _ weight: Font.Weight = .semibold) -> some View {
        font(.kg(size, weight)).tracking(KG.titleTracking(size))
    }

    func kgText(_ size: CGFloat, _ weight: Font.Weight = .regular) -> some View {
        font(.kgText(size, weight))
    }
}

// MARK: - Icons

/// Hugeicons (stroke rounded), template SVGs in Assets.xcassets/Hugeicons.
/// To add one: map it in scripts/hugeicons.js, re-run it, then add the case here.
/// Solid twins (hi.<name>.fill) come from scripts/hugeicons_solid.py; list them in `solid`.
enum HI: String {
    case home, kana, cards, brush, library, globe, user, arrowRightCircle, search, cancelCircle, cancel, volume
    case undo, star, translate, textFont, target, chevronDown, chevronLeft, chevronRight, flashcards
    case fire, play, pause, checkCircle, circle, quiz, headphones, link, keyboard, blocks, quill, kanji
    case puzzle, airplane, view, viewOff, music, mic, badgeCheck, sun, exclamation, heart, heartbreak
    case droplet, sparkle, turtle, subtitle, chatDone, replay, restart
    case lock, book, dumbbell, crown, tick
    case bookmark, bell, timer, award, share, trash, calendar, exam, route

    private static let solid: Set<HI> = [
        .home, .brush, .library, .globe, .kana, .book, .user, .route, .cards, .exam,
        .dumbbell, .headphones, .quiz, .crown, .tick, .lock,
        .bookmark, .star, .checkCircle, .cancelCircle, .arrowRightCircle, .subtitle, .play, .pause, .sparkle, .bell,
        .heart, .heartbreak, .sun, .exclamation, .fire, .droplet,
    ]

    func assetName(filled: Bool) -> String {
        filled && Self.solid.contains(self) ? "hi.\(rawValue).fill" : "hi.\(rawValue)"
    }
}

extension Image {
    /// `filled` picks the solid twin (selected / active states); icons without one stay outlined.
    init(_ icon: HI, filled: Bool = false) { self.init(icon.assetName(filled: filled)) }
}

/// A Hugeicon at a fixed point size; tint with foregroundStyle.
struct HugeIcon: View {
    var icon: HI
    var size: CGFloat
    var filled: Bool

    init(_ icon: HI, size: CGFloat = 20, filled: Bool = false) {
        self.icon = icon
        self.size = size
        self.filled = filled
    }

    var body: some View {
        Image(icon, filled: filled)
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}

extension Label where Title == Text, Icon == HugeIcon {
    @MainActor
    init(_ title: String, hi: HI, size: CGFloat = 20, filled: Bool = false) {
        self.init { Text(title) } icon: { HugeIcon(hi, size: size, filled: filled) }
    }
}

extension Label where Title == Text, Icon == Image {
    /// Natural-size (24pt) icon, for tab bars; solid when its tab is selected.
    init(_ title: String, tab: HI, selected: Bool) {
        self.init { Text(title) } icon: { Image(tab, filled: selected) }
    }
}

// MARK: - Layout

/// Screens without a status bar on top (the iPhone Duo's cover keeps it in a side column) give
/// their first row some air, so headers don't touch the glass edge.
private struct TopBreathingRoom: ViewModifier {
    @State private var extra: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .safeAreaInset(edge: .top, spacing: 0) { Color.clear.frame(height: extra) }
            .onGeometryChange(for: CGFloat.self) { $0.safeAreaInsets.top } action: { extra = $0 < 20 ? 12 : 0 }
    }
}

/// On screens wider than `width` (the iPhone Duo unfolded) the content keeps a centered column by
/// widening the horizontal safe area, so backgrounds that ignore the safe area still fill the screen.
private struct ReadableWidth: ViewModifier {
    var width: CGFloat
    @State private var inset: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .safeAreaPadding(.horizontal, inset)
            // whole points: the inset nudges the width by float noise, which would re-trigger this forever
            .onGeometryChange(for: CGFloat.self) { max(0, (($0.size.width - width) / 2).rounded()) } action: { inset = $0 }
    }
}

extension View {
    func topBreathingRoom() -> some View { modifier(TopBreathingRoom()) }

    /// Use inside a NavigationStack: the inset doesn't cross UIKit containers.
    func readableWidth(_ width: CGFloat = KG.readableWidth) -> some View { modifier(ReadableWidth(width: width)) }
}

// MARK: - Surfaces

struct StickerSurface: ViewModifier {
    var fill: Color = KG.paper
    var radius: CGFloat = 26
    var border: Color = .white
    var lineWidth: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .background(RoundedRectangle(cornerRadius: radius, style: .continuous).fill(fill))
            .overlay {
                if lineWidth > 0 {
                    RoundedRectangle(cornerRadius: radius, style: .continuous)
                        .strokeBorder(border, lineWidth: lineWidth)
                }
            }
            .compositingGroup()
            .shadow(color: KG.ink.opacity(0.07), radius: 14, x: 0, y: 8)
    }
}

extension View {
    func sticker(_ fill: Color = KG.paper, radius: CGFloat = 26, border: Color = .white, lineWidth: CGFloat = 0) -> some View {
        modifier(StickerSurface(fill: fill, radius: radius, border: border, lineWidth: lineWidth))
    }

    /// Thick white outline, like a die-cut sticker.
    func stickerOutline(_ width: CGFloat = 3, color: Color = .white) -> some View {
        self
            .shadow(color: color, radius: 0, x: width, y: 0)
            .shadow(color: color, radius: 0, x: -width, y: 0)
            .shadow(color: color, radius: 0, x: 0, y: width)
            .shadow(color: color, radius: 0, x: 0, y: -width)
    }
}

// MARK: - Buttons

/// Pressable 3D candy button with a solid "lip" underneath.
struct ChunkyButtonStyle: ButtonStyle {
    var fill: Color = KG.pink
    var lip: Color = KG.pinkDeep
    var foreground: Color = .white
    var radius: CGFloat = 20
    var height: CGFloat = 56
    var fullWidth = true

    func makeBody(configuration: Configuration) -> some View {
        let pressed = configuration.isPressed
        configuration.label
            .kgFont(18)
            .foregroundStyle(foreground)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .frame(height: height)
            .padding(.horizontal, fullWidth ? 0 : 22)
            .background {
                ZStack {
                    RoundedRectangle(cornerRadius: radius, style: .continuous)
                        .fill(lip)
                        .offset(y: pressed ? 0 : 5)
                    RoundedRectangle(cornerRadius: radius, style: .continuous)
                        .fill(fill)
                }
            }
            .offset(y: pressed ? 5 : 0)
            .padding(.bottom, 5)
            .animation(.spring(response: 0.18, dampingFraction: 0.6), value: pressed)
            .sensoryFeedback(.impact(weight: .light), trigger: pressed) { _, new in new }
            .onChange(of: pressed) { _, down in if down { SoundPlayer.shared.play(.tap) } }
    }
}

extension ButtonStyle where Self == ChunkyButtonStyle {
    static var chunky: ChunkyButtonStyle { ChunkyButtonStyle() }
    static var chunkyInk: ChunkyButtonStyle { ChunkyButtonStyle(fill: KG.ink, lip: .black) }
    static var chunkyWhite: ChunkyButtonStyle { ChunkyButtonStyle(fill: .white, lip: KG.line, foreground: KG.ink) }
    static var chunkyMint: ChunkyButtonStyle { ChunkyButtonStyle(fill: KG.mint, lip: KG.mintDeep) }
    static var chunkyRed: ChunkyButtonStyle { ChunkyButtonStyle(fill: KG.red, lip: KG.redDeep) }
}

/// Soft squish on press for cards and tiles.
struct SquishButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.spring(response: 0.22, dampingFraction: 0.6), value: configuration.isPressed)
            .onChange(of: configuration.isPressed) { _, down in if down { SoundPlayer.shared.play(.tap, volume: 0.6) } }
    }
}

extension ButtonStyle where Self == SquishButtonStyle {
    static var squish: SquishButtonStyle { SquishButtonStyle() }
}

// MARK: - Small pieces

struct Pill: View {
    var text: String
    var color: Color = KG.pink
    /// nil picks white or ink, whichever reads on `color`.
    var foreground: Color? = nil
    var icon: HI? = nil

    var body: some View {
        HStack(spacing: 4) {
            if let icon { HugeIcon(icon, size: 13, filled: true) }
            Text(text).kgFont(12, .semibold)
        }
        .foregroundStyle(foreground ?? KG.on(color))
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(Capsule().fill(color))
    }
}

struct ProgressBarKG: View {
    var value: Double
    var color: Color = KG.pink
    var track: Color = KG.line
    var height: CGFloat = 12

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(track)
                Capsule()
                    .fill(color)
                    .frame(width: max(height, geo.size.width * min(max(value, 0), 1)))
                    .overlay(alignment: .top) {
                        Capsule().fill(.white.opacity(0.35))
                            .frame(height: height * 0.28)
                            .padding(.horizontal, height * 0.5)
                            .padding(.top, height * 0.18)
                    }
                    .opacity(value <= 0 ? 0 : 1)
            }
        }
        .frame(height: height)
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: value)
    }
}

/// The "Kana / GO!" wordmark (Assets.xcassets/Brand/logo.kanago).
struct KanaGOLogo: View {
    var size: CGFloat = 44

    var body: some View {
        Image("logo.kanago")
            .resizable()
            .scaledToFit()
            .frame(height: size * 2.2)
            .rotationEffect(.degrees(-4))
            .shadow(color: KG.ink.opacity(0.12), radius: 10, y: 6)
            .accessibilityLabel("KanaGO!")
    }
}
