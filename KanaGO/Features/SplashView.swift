import SwiftUI
import UIKit

/// Keeps the app stationary under one launch sequence, then prepares its services.
struct LaunchGate<Content: View>: View {
    var onFinished: () -> Void = {}
    @ViewBuilder var content: Content
    @State private var finished = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            content
                .allowsHitTesting(finished)
                .accessibilityHidden(!finished)

            if !finished {
                NativeSplash(reduceMotion: reduceMotion) {
                    finished = true
                    onFinished()
                }
                .ignoresSafeArea()
                .accessibilityHidden(true)
            }
        }
    }
}

private struct NativeSplash: UIViewControllerRepresentable {
    var reduceMotion: Bool
    var onFinished: () -> Void

    func makeUIViewController(context: Context) -> LaunchScreenController {
        LaunchScreenController(reduceMotion: reduceMotion, onFinished: onFinished)
    }

    func updateUIViewController(_ controller: LaunchScreenController, context: Context) {
        controller.onFinished = onFinished
        controller.setReduceMotion(reduceMotion)
    }

    static func dismantleUIViewController(_ controller: LaunchScreenController, coordinator: ()) {
        controller.cancel()
    }
}

/// Core Animation moves prepared image layers without rebuilding the vector artwork each frame.
private final class LaunchScreenController: UIViewController, CAAnimationDelegate {
    var onFinished: () -> Void
    private var reduceMotion: Bool
    private let mascot = UIImageView()
    private let wordmark = UIImageView()
    private let mascotSize = CGSize(width: 170, height: 160)
    private let wordmarkHeight: CGFloat = 78
    private var preparedScale: CGFloat = 0
    private var displayLink: CADisplayLink?
    private var displayedFrames = 0
    private var started = false
    private var completed = false

    init(reduceMotion: Bool, onFinished: @escaping () -> Void) {
        self.reduceMotion = reduceMotion
        self.onFinished = onFinished
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("Use init(reduceMotion:onFinished:)") }

    override func loadView() {
        view = UIView()
        view.backgroundColor = UIColor(named: "LaunchBackground")
        view.accessibilityElementsHidden = true
        mascot.contentMode = .scaleAspectFit
        wordmark.contentMode = .scaleAspectFit
        wordmark.layer.opacity = 0
        view.addSubview(mascot)
        view.addSubview(wordmark)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let scale = traitCollection.displayScale
        if preparedScale != scale {
            mascot.image = preparedImage(named: "LaunchMascot", size: mascotSize, scale: scale)
            if let logo = UIImage(named: "logo.kanago") {
                let size = CGSize(width: wordmarkHeight * logo.size.width / logo.size.height,
                                  height: wordmarkHeight)
                wordmark.image = preparedImage(logo, size: size, scale: scale)
                wordmark.bounds = CGRect(origin: .zero, size: size)
            }
            preparedScale = scale
        }
        // The first frame exactly matches UILaunchScreen: centered, 170 × 160, no transform.
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        mascot.bounds = CGRect(origin: .zero, size: mascotSize)
        mascot.center = CGPoint(x: view.bounds.midX, y: view.bounds.midY)
        wordmark.center = CGPoint(x: view.bounds.midX,
                                 y: view.bounds.midY + mascotSize.height / 2 - 12 + 14 + wordmarkHeight / 2)
        CATransaction.commit()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        guard !started, displayLink == nil else { return }
        // Give the unchanged launch frame a display cycle before starting the sequence.
        let link = CADisplayLink(target: self, selector: #selector(firstFramePresented))
        displayLink = link
        link.add(to: .main, forMode: .common)
    }

    @objc private func firstFramePresented() {
        guard view.window != nil, !view.bounds.isEmpty else { return }
        displayedFrames += 1
        guard displayedFrames >= 2 else { return }
        displayLink?.invalidate()
        displayLink = nil
        guard !started, !completed else { return }
        started = true
        animate()
    }

    func setReduceMotion(_ enabled: Bool) {
        guard reduceMotion != enabled else { return }
        reduceMotion = enabled
        if enabled, started, !completed {
            mascot.layer.removeAllAnimations()
            wordmark.layer.removeAllAnimations()
            view.layer.removeAllAnimations()
            animate()
        }
    }

    private func animate() {
        let now = view.layer.convertTime(CACurrentMediaTime(), from: nil)
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        mascot.layer.transform = reduceMotion ? CATransform3DIdentity : CATransform3DMakeTranslation(0, -12, 0)
        wordmark.layer.opacity = reduceMotion ? 0 : 1
        wordmark.layer.transform = CATransform3DIdentity
        view.layer.opacity = 0

        if !reduceMotion {
            mascot.layer.add(animation("transform.translation.y", from: 0, to: -12,
                                       begin: now + 0.12, duration: 0.36), forKey: "splash.lift")
            wordmark.layer.add(animation("opacity", from: 0, to: 1, begin: now + 0.22, duration: 0.24),
                               forKey: "splash.wordmark")
            wordmark.layer.add(animation("transform.translation.y", from: 4, to: 0,
                                        begin: now + 0.22, duration: 0.3), forKey: "splash.wordmarkLift")
        }

        let fade = animation("opacity", from: 1, to: 0,
                             begin: now + (reduceMotion ? 0.1 : 0.66), duration: reduceMotion ? 0.2 : 0.24)
        fade.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        fade.delegate = self
        view.layer.add(fade, forKey: "splash.exit")
        CATransaction.commit()
    }

    private func animation(_ key: String, from: CGFloat, to: CGFloat,
                           begin: CFTimeInterval, duration: CFTimeInterval) -> CABasicAnimation {
        let animation = CABasicAnimation(keyPath: key)
        animation.fromValue = from
        animation.toValue = to
        animation.beginTime = begin
        animation.duration = duration
        animation.timingFunction = CAMediaTimingFunction(controlPoints: 0.22, 1, 0.36, 1)
        // Final values live in the model layer; backwards fill preserves the initial frame until beginTime.
        animation.fillMode = .backwards
        return animation
    }

    func animationDidStop(_ anim: CAAnimation, finished flag: Bool) {
        guard flag, !completed else { return }
        completed = true
        onFinished()
    }

    func cancel() {
        completed = true
        displayLink?.invalidate()
        displayLink = nil
        mascot.layer.removeAllAnimations()
        wordmark.layer.removeAllAnimations()
        view.layer.removeAllAnimations()
    }

    private func preparedImage(named name: String, size: CGSize, scale: CGFloat) -> UIImage? {
        guard let image = UIImage(named: name) else { return nil }
        return preparedImage(image, size: size, scale: scale)
    }

    private func preparedImage(_ image: UIImage, size: CGSize, scale: CGFloat) -> UIImage {
        let format = UIGraphicsImageRendererFormat()
        format.scale = scale
        return UIGraphicsImageRenderer(size: size, format: format).image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
    }
}
