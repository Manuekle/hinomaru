import SwiftUI

/// Kana-chan: the little sumi-ink blob mascot of KanaGO!
/// Each mood is a hand-drawn sticker in Assets.xcassets/Pets (accessories baked in).
enum Mood: String, CaseIterable {
    case curious, happy, wow, love, angry, meh, sad

    var assetName: String {
        switch self {
        case .curious, .love: return "pet.love"
        default: return "pet.\(rawValue)"
        }
    }
}

/// Left-pointing tail of the mascot's speech bubble.
struct BubbleTail: Shape {
    func path(in r: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: r.maxX, y: r.minY))
        path.addQuadCurve(to: CGPoint(x: r.minX, y: r.midY), control: CGPoint(x: r.midX, y: r.midY - r.height * 0.1))
        path.addQuadCurve(to: CGPoint(x: r.maxX, y: r.maxY), control: CGPoint(x: r.midX, y: r.midY + r.height * 0.1))
        path.closeSubpath()
        return path
    }
}

struct KanaBlob: View {
    var mood: Mood = .curious
    var size: CGFloat = 120
    var animated = true

    @State private var bob = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Image(mood.assetName)
            .resizable()
            .scaledToFit()
            .frame(width: size * 1.2, height: size)
            // squash-and-stretch hop whenever her mood changes
            .keyframeAnimator(initialValue: Hop(), trigger: reduceMotion ? nil : mood) { view, h in
                view
                    .scaleEffect(x: h.stretchX, y: h.stretchY, anchor: .bottom)
                    .rotationEffect(.degrees(h.tilt), anchor: .bottom)
                    .offset(y: h.lift * size)
            } keyframes: { _ in
                KeyframeTrack(\.stretchY) {
                    CubicKeyframe(0.86, duration: 0.08)
                    SpringKeyframe(1.1, duration: 0.16, spring: .snappy)
                    SpringKeyframe(1, duration: 0.4, spring: .bouncy)
                }
                KeyframeTrack(\.stretchX) {
                    CubicKeyframe(1.12, duration: 0.08)
                    SpringKeyframe(0.94, duration: 0.16, spring: .snappy)
                    SpringKeyframe(1, duration: 0.4, spring: .bouncy)
                }
                KeyframeTrack(\.lift) {
                    CubicKeyframe(0, duration: 0.08)
                    CubicKeyframe(-0.12, duration: 0.14)
                    SpringKeyframe(0, duration: 0.35, spring: .bouncy)
                }
                KeyframeTrack(\.tilt) {
                    CubicKeyframe(0, duration: 0.08)
                    CubicKeyframe(mood == .sad || mood == .meh ? 5 : -7, duration: 0.14)
                    SpringKeyframe(0, duration: 0.45, spring: .bouncy)
                }
            }
            .shadow(color: KG.ink.opacity(0.16), radius: size * 0.06, y: size * 0.04)
            .scaleEffect(x: bob ? 1.03 : 0.98, y: bob ? 0.97 : 1.02, anchor: .bottom)
            .offset(y: bob ? 1 : -size * 0.025)
            .onAppear {
                guard animated else { return }
                withAnimation(.easeInOut(duration: 1.1).repeatForever(autoreverses: true)) { bob = true }
            }
            .accessibilityHidden(true)
    }
}

private struct Hop {
    var stretchX: CGFloat = 1
    var stretchY: CGFloat = 1
    var lift: CGFloat = 0
    var tilt: Double = 0
}

/// One of the hand-drawn stickers in Assets.xcassets/Stickers.
enum Sticker: String {
    case crown, party, heart, brokenheart, sun, water, sign, furious
}

struct StickerArt: View {
    var sticker: Sticker
    var size: CGFloat = 48

    init(_ sticker: Sticker, size: CGFloat = 48) {
        self.sticker = sticker
        self.size = size
    }

    var body: some View {
        Image("sticker.\(sticker.rawValue)")
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
            .accessibilityHidden(true)
    }
}

/// Speech bubble that points at the mascot.
struct MascotSays: View {
    var mood: Mood
    var text: String
    var size: CGFloat = 84

    var body: some View {
        HStack(alignment: .center, spacing: 10) {
            KanaBlob(mood: mood, size: size)
            Text(text)
                .kgFont(16, .semibold)
                .foregroundStyle(KG.ink)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 20, style: .continuous).fill(.white)
                )
                .overlay(alignment: .leading) {
                    BubbleTail()
                        .fill(.white)
                        .frame(width: 10, height: 14)
                        .offset(x: -9)
                }
                .shadow(color: KG.ink.opacity(0.07), radius: 10, y: 5)
            Spacer(minLength: 0)
        }
    }
}

#Preview {
    ScrollView {
        LazyVGrid(columns: [GridItem(), GridItem()], spacing: 30) {
            ForEach(Mood.allCases, id: \.self) { m in KanaBlob(mood: m, size: 120) }
        }
        .padding(30)
    }
    .background(KG.cream)
}
