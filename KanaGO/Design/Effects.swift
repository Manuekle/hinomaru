import SwiftUI
import UIKit

// MARK: - Answer feedback

/// How an answer option should react once the learner has picked.
enum AnswerFlash: Equatable {
    case correct, wrong
}

private struct FlashFrame {
    var scale: CGFloat = 1
    var x: CGFloat = 0
    var tilt: Double = 0
}

/// The right option pops, the wrong pick shakes its head.
private struct AnswerFeedback: ViewModifier {
    var flash: AnswerFlash?
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content.keyframeAnimator(initialValue: FlashFrame(), trigger: reduceMotion ? nil : flash) { view, f in
            view
                .scaleEffect(f.scale)
                .offset(x: f.x)
                .rotationEffect(.degrees(f.tilt))
        } keyframes: { _ in
            let correct = flash == .correct, wrong = flash == .wrong
            KeyframeTrack(\.scale) {
                SpringKeyframe(correct ? 1.07 : 1, duration: 0.14, spring: .snappy)
                SpringKeyframe(1, duration: 0.4, spring: .bouncy)
            }
            KeyframeTrack(\.x) {
                CubicKeyframe(wrong ? -9 : 0, duration: 0.06)
                CubicKeyframe(wrong ? 9 : 0, duration: 0.08)
                CubicKeyframe(wrong ? -6 : 0, duration: 0.08)
                CubicKeyframe(wrong ? 4 : 0, duration: 0.08)
                CubicKeyframe(0, duration: 0.1)
            }
            KeyframeTrack(\.tilt) {
                CubicKeyframe(correct ? -2 : 0, duration: 0.14)
                SpringKeyframe(0, duration: 0.35, spring: .bouncy)
            }
        }
    }
}

extension View {
    func answerFeedback(_ flash: AnswerFlash?) -> some View { modifier(AnswerFeedback(flash: flash)) }
}

// MARK: - Confetti

/// A one-shot burst of sticker confetti (Assets.xcassets/Confetti) that arcs out and falls with gravity.
struct ConfettiBurst: View {
    private struct Piece: Identifiable {
        let id = UUID()
        let asset: String, size: CGSize
        let vx: CGFloat, vy: CGFloat, spin: Double, flutter: Double, delay: Double
    }

    /// Natural sizes of the sticker pieces, scaled down to confetti size.
    private static let catalog: [(String, CGSize)] = (0..<46).compactMap { i in
        let name = String(format: "confetti.%02d", i)
        guard let img = UIImage(named: name) else { return nil }
        return (name, CGSize(width: img.size.width * 0.17, height: img.size.height * 0.17))
    }

    @State private var pieces: [Piece]
    @State private var t: CGFloat = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    init(count: Int = 28, spread: CGFloat = 1) {
        let catalog = Self.catalog
        _pieces = State(initialValue: catalog.isEmpty ? [] : (0..<count).map { _ in
            let (asset, size) = catalog.randomElement()!
            return Piece(asset: asset, size: size,
                         vx: .random(in: -190...190) * spread, vy: .random(in: -330...(-150)) * spread,
                         spin: .random(in: -360...360), flutter: .random(in: 0.6...1.6), delay: .random(in: 0...0.12))
        })
    }

    var body: some View {
        ZStack {
            ForEach(pieces) { p in
                Image(p.asset)
                    .resizable()
                    .frame(width: p.size.width, height: p.size.height)
                    .modifier(Flight(t: t, piece: p))
            }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
        .onAppear {
            guard !reduceMotion else { return }
            withAnimation(.linear(duration: 1.8)) { t = 1 }
        }
    }

    /// Ballistic path: launch velocity plus gravity, tumbling, fading out at the end.
    private struct Flight: ViewModifier, Animatable {
        var t: CGFloat
        let piece: Piece
        var animatableData: CGFloat {
            get { t }
            set { t = newValue }
        }

        func body(content: Content) -> some View {
            let k = max(0, (t - piece.delay) / (1 - piece.delay))
            let gravity: CGFloat = 520
            content
                .rotation3DEffect(.degrees(sin(Double(k) * .pi * 2 * piece.flutter) * 55), axis: (x: 1, y: 0.4, z: 0))
                .rotationEffect(.degrees(piece.spin * Double(k)))
                .offset(x: piece.vx * k, y: piece.vy * k + gravity * k * k)
                .opacity(k == 0 ? 0 : k < 0.75 ? 1 : Double(1 - (k - 0.75) / 0.25))
                .scaleEffect(k == 0 ? 0.2 : 1)
        }
    }
}
