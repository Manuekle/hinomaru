import SwiftUI

// MARK: - Model

/// One handwriting canvas: what the learner drew and what the app made of it.
/// `.trace` checks each stroke as the finger lifts, over the stroke-order guide;
/// `.memory` lets them write freely and grades the whole character on `check()`.
@Observable
final class WritingPad {
    enum Mode { case trace, memory }
    /// What happened to the last traced stroke.
    enum Feedback: Equatable { case good, wrong, backwards, later, helped }

    let text: String
    let mode: Mode
    /// nil when there's no stroke data for the text: the canvas is just paper then.
    let glyph: StrokeGlyph?

    /// Strokes as drawn, in glyph units (memory mode, or paper without stroke data).
    private(set) var drawn: [[CGPoint]] = []
    private(set) var live: [CGPoint] = []
    /// Tracing: expected strokes done so far and the last stroke that didn't fit.
    private(set) var done = 0
    private(set) var rejected: [CGPoint] = []
    private(set) var feedback: Feedback?
    private(set) var misses = 0
    private(set) var missesHere = 0
    private(set) var helped = 0
    /// Bumped once per event, to drive one-shot animations, sounds and haptics.
    private(set) var accepts = 0
    private(set) var rejections = 0
    private(set) var completions = 0
    private(set) var report: StrokeGrader.Report?
    /// Memory mode: show the faint guide.
    var hint = false
    private(set) var demoStart: Date?
    /// Tracing: set on the second miss of a stroke, which then demos on a loop until drawn.
    private(set) var hintStart: Date?

    init(text: String, mode: Mode) {
        self.text = text
        self.mode = mode
        glyph = StrokeLibrary.glyph(text)
    }

    var cells: Int { glyph?.cells ?? max(text.count, 1) }
    var strokeCount: Int { glyph?.strokes.count ?? 0 }
    var tracing: Bool { mode == .trace && glyph != nil }
    var complete: Bool { tracing && done == strokeCount }
    var canCheck: Bool { mode == .memory && glyph != nil && report == nil && !drawn.isEmpty }
    var canUndo: Bool { report == nil && !complete && (tracing ? done > 0 : !drawn.isEmpty) }
    /// Traced without help and with few slips.
    var traceOK: Bool { helped == 0 && misses <= max(1, strokeCount / 2) }

    func add(_ p: CGPoint) {
        guard report == nil, !complete else { return }
        live.append(p)
    }

    func finish() {
        defer { live = [] }
        // taps and specks aren't strokes
        guard report == nil, !complete, live.count >= 2, StrokeMatcher.length(live) >= 1.5 else { return }
        guard tracing, let strokes = glyph?.strokes else { drawn.append(live); return }

        let result = StrokeMatcher.match(live, strokes: strokes, index: done)
        if result.isMatch { accept(.good); return }
        misses += 1
        missesHere += 1
        rejected = live
        rejections += 1
        if missesHere == 2 { hintStart = .now }
        // third try on the same stroke: draw it for them rather than get stuck
        if missesHere >= 3 { helped += 1; accept(.helped); return }
        let later = strokes[(done + 1)...].contains { StrokeMatcher.score(live, $0).isMatch }
        feedback = result.backwards ? .backwards : later ? .later : .wrong
    }

    private func accept(_ f: Feedback) {
        done += 1
        missesHere = 0
        hintStart = nil
        accepts += 1
        feedback = f
        if done == strokeCount { completions += 1 }
    }

    func undo() {
        guard canUndo else { return }
        if tracing {
            done -= 1
            missesHere = 0
            hintStart = nil
            feedback = nil
        } else {
            drawn.removeLast()
        }
    }

    func reset() {
        drawn = []
        live = []
        done = 0
        rejected = []
        feedback = nil
        misses = 0
        missesHere = 0
        helped = 0
        report = nil
        demoStart = nil
        hintStart = nil
    }

    func check() {
        guard canCheck, let glyph else { return }
        let report = StrokeGrader.grade(drawn, glyph)
        self.report = report
        if !report.ok { playDemo(after: 0.6) }
    }

    /// Animates the whole character in stroke order.
    func playDemo(after delay: TimeInterval = 0) {
        let start = Date().addingTimeInterval(delay)
        demoStart = start
        DispatchQueue.main.asyncAfter(deadline: .now() + delay + StrokeDemo.duration(strokeCount) + 0.8) { [weak self] in
            if self?.demoStart == start { self?.demoStart = nil }
        }
    }
}

extension WritingPad {
    /// What the mascot says about the drawing; nil until there's something to say.
    func message(_ app: AppModel) -> String? {
        if let report {
            switch report.verdict {
            case .perfect: return app.t("¡Perfecto! Forma y orden correctos", "Perfect! Right shape and order")
            case .missing(let n):
                return n == 1 ? app.t("Te faltó un trazo", "You missed a stroke")
                    : app.t("Te faltaron \(n) trazos", "You missed \(n) strokes")
            case .extra(let n):
                return n == 1 ? app.t("Sobra un trazo", "One stroke too many")
                    : app.t("Sobran \(n) trazos", "\(n) strokes too many")
            case .backwards(let i): return app.t("El trazo \(i + 1) va al revés", "Stroke \(i + 1) goes the other way")
            case .order(let i): return app.t("Orden: el trazo \(i + 1) no va ahí", "Order: stroke \(i + 1) is out of place")
            case .shape(let i): return app.t("El trazo \(i + 1) no se parece", "Stroke \(i + 1) doesn't match")
            }
        }
        guard tracing else { return nil }
        if complete {
            return misses == 0 ? app.t("¡Perfecto, sin fallos!", "Perfect, no slips!") : app.t("¡Listo!", "Done!")
        }
        switch feedback {
        case .good: return app.t("¡Bien! Ahora el trazo \(done + 1)", "Nice! Now stroke \(done + 1)")
        case .wrong where missesHere >= 2: return app.t("Mira cómo va y cópialo", "Watch how it goes, then copy it")
        case .wrong: return app.t("Sigue la guía rosa", "Follow the pink guide")
        case .backwards: return app.t("Al revés: empieza en el punto", "Other way round: start at the dot")
        case .later: return app.t("Ese va después. Primero el del punto", "That one comes later. First the one with the dot")
        case .helped: return app.t("Ese te lo dibujé yo. ¡Sigue!", "I drew that one for you. Keep going!")
        case nil: return nil
        }
    }

    var mood: Mood {
        if let report { return report.ok ? .wow : .sad }
        if complete { return misses == 0 ? .wow : .happy }
        switch feedback {
        case .good, .helped: return .happy
        case .wrong, .backwards: return .meh
        case .later, nil: return .curious
        }
    }
}

// MARK: - Canvas

/// Where the glyph sits on the canvas: centred, as big as fits inside the margin.
struct GlyphFrame {
    var origin: CGPoint
    var scale: CGFloat

    init(cells: Int, in size: CGSize, margin: CGFloat = 20) {
        let w = StrokeLibrary.box * CGFloat(cells), h = StrokeLibrary.box
        scale = max(0.01, min((size.width - 2 * margin) / w, (size.height - 2 * margin) / h))
        origin = CGPoint(x: (size.width - w * scale) / 2, y: (size.height - h * scale) / 2)
    }

    func canvas(_ p: CGPoint) -> CGPoint { CGPoint(x: origin.x + p.x * scale, y: origin.y + p.y * scale) }
    func glyph(_ p: CGPoint) -> CGPoint { CGPoint(x: (p.x - origin.x) / scale, y: (p.y - origin.y) / scale) }

    /// Ink width: 14pt on a full-size character, thinner for words of several.
    var ink: CGFloat { min(14, max(7, 6.3 * scale)) }

    func path(_ stroke: [CGPoint], upTo fraction: CGFloat = 1) -> Path {
        var path = Path()
        let n = fraction >= 1 ? stroke.count : max(2, Int((CGFloat(stroke.count - 1) * fraction).rounded(.up)) + 1)
        path.addLines(stroke.prefix(n).map(canvas))
        return path
    }

    func style(_ width: CGFloat) -> StrokeStyle { StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round) }
}

struct TraceCanvas: View {
    @Environment(AppModel.self) private var app
    @Environment(\.horizontalSizeClass) private var hSize
    var pad: WritingPad
    /// Offer "write it again" once traced (the practice sheet; lessons move on instead).
    var replayable = true

    var body: some View {
        GeometryReader { geo in
            let f = GlyphFrame(cells: pad.cells, in: geo.size)
            ZStack {
                paper(geo.size, f)
                if let glyph = pad.glyph {
                    if let start = pad.hintStart, pad.tracing, !pad.complete {
                        StrokeDemo(strokes: [glyph.strokes[pad.done]], frame: f, start: start, loop: true)
                    }
                    if let start = pad.demoStart {
                        StrokeDemo(strokes: glyph.strokes, frame: f, start: start)
                    }
                    flashes(glyph, f)
                    if pad.tracing, !pad.complete, pad.demoStart == nil {
                        startDot(glyph.strokes[pad.done][0], f)
                    }
                }
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { pad.add(f.glyph($0.location)) }
                    .onEnded { _ in pad.finish() }
            )
        }
        // wide screens (the iPhone Duo unfolded) keep each character's box square instead of a long strip
        .frame(maxWidth: hSize == .regular ? 360 * CGFloat(pad.cells) : .infinity)
        .frame(height: hSize == .regular ? 360 : 280)
        .background(RoundedRectangle(cornerRadius: 28, style: .continuous).fill(.white))
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .shadow(color: KG.ink.opacity(0.07), radius: 14, y: 8)
        .overlay(alignment: .bottomTrailing) {
            if pad.canUndo {
                corner(.undo, app.t("Deshacer trazo", "Undo stroke")) { withAnimation { pad.undo() } }
            } else if pad.complete, replayable {
                corner(.restart, app.t("Otra vez", "Again")) { withAnimation { pad.reset() } }
            }
        }
        .overlay(alignment: .topTrailing) {
            if pad.glyph != nil, pad.mode == .trace || pad.report != nil {
                corner(.play, app.t("Ver orden de trazos", "Show stroke order")) { pad.playDemo() }
            }
        }
        .overlay(alignment: .topLeading) {
            if pad.mode == .memory, pad.glyph != nil, pad.report == nil {
                corner(pad.hint ? .viewOff : .view, app.t("Pista", "Hint")) { withAnimation { pad.hint.toggle() } }
            }
        }
        .sensoryFeedback(.impact(weight: .light), trigger: pad.accepts)
        .sensoryFeedback(.error, trigger: pad.rejections)
        .sensoryFeedback(.success, trigger: pad.completions)
        .onChange(of: pad.accepts) { SoundPlayer.shared.play(.tap, volume: 0.5) }
        .onChange(of: pad.completions) { SoundPlayer.shared.play(.correct) }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(app.t("Lienzo para escribir \(pad.text)", "Canvas to write \(pad.text)"))
    }

    /// Grid, guide and ink: everything that doesn't animate on its own.
    private func paper(_ size: CGSize, _ f: GlyphFrame) -> some View {
        // read here so observation tracks them; Canvas draws later
        let drawn = pad.drawn, live = pad.live, done = pad.done, report = pad.report
        let tracing = pad.tracing, hint = pad.hint, glyph = pad.glyph
        let guide = tracing ? (done == glyph?.strokes.count ? 0 : 0.16) : report != nil ? 0.28 : hint ? 0.12 : 0
        return ZStack {
            Canvas { ctx, _ in
                ctx.stroke(grid(size, f), with: .color(KG.line), style: StrokeStyle(lineWidth: 2, dash: [6, 6]))
                guard let glyph else { return }
                for (i, s) in glyph.strokes.enumerated() {
                    let next = tracing && i == done
                    let opacity = next ? 0.45 : guide
                    if opacity > 0 { ctx.stroke(f.path(s), with: .color(KG.pink.opacity(opacity)), style: f.style(f.ink * 1.3)) }
                }
                if tracing {
                    for s in glyph.strokes.prefix(done) { ctx.stroke(f.path(s), with: .color(KG.ink), style: f.style(f.ink)) }
                }
            }
            if glyph == nil {
                Text(pad.text)
                    .font(.system(size: 190, weight: .regular, design: .rounded))
                    .minimumScaleFactor(0.4)
                    .foregroundStyle(KG.pink.opacity(pad.mode == .trace || hint ? 0.14 : 0))
                    .animation(.easeInOut(duration: 0.25), value: hint)
            }
            Canvas { ctx, _ in
                for (i, s) in drawn.enumerated() where s.count > 1 {
                    let color = report.map { $0.strokeOK[safe: i] == true ? KG.mint : KG.red } ?? KG.ink
                    ctx.stroke(f.path(s), with: .color(color), style: f.style(f.ink))
                }
                if live.count > 1 { ctx.stroke(f.path(live), with: .color(KG.ink), style: f.style(f.ink)) }
            }
            // step back while the stroke order plays over it
            .opacity(pad.demoStart != nil && !drawn.isEmpty ? 0.3 : 1)
            .animation(.easeInOut(duration: 0.25), value: pad.demoStart)
        }
    }

    private func grid(_ size: CGSize, _ f: GlyphFrame) -> Path {
        Path { p in
            let cell = StrokeLibrary.box * f.scale
            p.move(to: CGPoint(x: 12, y: size.height / 2))
            p.addLine(to: CGPoint(x: size.width - 12, y: size.height / 2))
            if pad.cells == 1 {
                p.move(to: CGPoint(x: size.width / 2, y: 12))
                p.addLine(to: CGPoint(x: size.width / 2, y: size.height - 12))
                return
            }
            for i in 0..<pad.cells {
                let mid = f.origin.x + cell * (CGFloat(i) + 0.5)
                p.move(to: CGPoint(x: mid, y: f.origin.y))
                p.addLine(to: CGPoint(x: mid, y: f.origin.y + cell))
                if i > 0 {
                    let edge = f.origin.x + cell * CGFloat(i)
                    p.move(to: CGPoint(x: edge, y: 12))
                    p.addLine(to: CGPoint(x: edge, y: size.height - 12))
                }
            }
        }
    }

    /// One-shot flashes: the accepted stroke glows mint, a rejected one shakes red and fades,
    /// the finished character glows.
    private func flashes(_ glyph: StrokeGlyph, _ f: GlyphFrame) -> some View {
        let done = pad.done, rejected = pad.rejected
        return ZStack {
            Canvas { ctx, _ in
                if done > 0 { ctx.stroke(f.path(glyph.strokes[done - 1]), with: .color(KG.mint), style: f.style(f.ink * 1.15)) }
            }
            .keyframeAnimator(initialValue: 0.0, trigger: pad.accepts) { $0.opacity($1) } keyframes: { _ in
                LinearKeyframe(1, duration: 0.01)
                LinearKeyframe(1, duration: 0.2)
                CubicKeyframe(0, duration: 0.35)
            }
            Canvas { ctx, _ in
                if rejected.count > 1 { ctx.stroke(f.path(rejected), with: .color(KG.red), style: f.style(f.ink)) }
            }
            .keyframeAnimator(initialValue: Shake(), trigger: pad.rejections) { view, v in
                view.offset(x: v.x).opacity(v.opacity)
            } keyframes: { _ in
                KeyframeTrack(\.x) {
                    CubicKeyframe(-7, duration: 0.06)
                    CubicKeyframe(7, duration: 0.08)
                    CubicKeyframe(-4, duration: 0.08)
                    CubicKeyframe(0, duration: 0.08)
                }
                KeyframeTrack(\.opacity) {
                    LinearKeyframe(1, duration: 0.01)
                    LinearKeyframe(1, duration: 0.3)
                    CubicKeyframe(0, duration: 0.35)
                }
            }
            Canvas { ctx, _ in
                for s in glyph.strokes { ctx.stroke(f.path(s), with: .color(KG.mint), style: f.style(f.ink * 1.15)) }
            }
            .keyframeAnimator(initialValue: 0.0, trigger: pad.completions) { $0.opacity($1) } keyframes: { _ in
                LinearKeyframe(0, duration: 0.15)
                CubicKeyframe(1, duration: 0.15)
                LinearKeyframe(1, duration: 0.25)
                CubicKeyframe(0, duration: 0.5)
            }
        }
        .allowsHitTesting(false)
    }

    private struct Shake {
        var x: CGFloat = 0
        var opacity: Double = 0
    }

    /// Where the next stroke starts, numbered.
    private func startDot(_ p: CGPoint, _ f: GlyphFrame) -> some View {
        Text("\(pad.done + 1)")
            .font(.system(size: 12, weight: .heavy, design: .rounded))
            .foregroundStyle(.white)
            .frame(width: 24, height: 24)
            .background(Circle().fill(KG.pink))
            .overlay(Circle().strokeBorder(.white, lineWidth: 2))
            .position(f.canvas(p))
            .allowsHitTesting(false)
            .transition(.scale.combined(with: .opacity))
            .id(pad.done)
    }

    private func corner(_ icon: HI, _ label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HugeIcon(icon, size: 20)
                .foregroundStyle(KG.ink)
                .frame(width: 42, height: 42)
                .background(Circle().fill(KG.cream))
        }
        .buttonStyle(.squish)
        .padding(12)
        .accessibilityLabel(label)
    }
}

/// Draws strokes one after another with a pen tip, showing the order.
struct StrokeDemo: View {
    var strokes: [[CGPoint]]
    var frame: GlyphFrame
    var start: Date
    var loop = false

    private static let perStroke: TimeInterval = 0.55
    private static let gap: TimeInterval = 0.15

    static func duration(_ count: Int) -> TimeInterval { Double(count) * (perStroke + gap) }

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { ctx, _ in
                var t = timeline.date.timeIntervalSince(start)
                if loop { t = t.truncatingRemainder(dividingBy: Self.duration(strokes.count) + 0.6) }
                for (i, s) in strokes.enumerated() {
                    let k = CGFloat((t - Double(i) * (Self.perStroke + Self.gap)) / Self.perStroke)
                    guard k > 0 else { break }
                    let path = frame.path(s, upTo: min(k, 1))
                    ctx.stroke(path, with: .color(KG.pink), style: frame.style(frame.ink * 1.05))
                    if k < 1, let tip = path.currentPoint {
                        let r = frame.ink * 0.75
                        ctx.fill(Path(ellipseIn: CGRect(x: tip.x - r, y: tip.y - r, width: 2 * r, height: 2 * r)),
                                 with: .color(KG.pinkDeep))
                    }
                }
            }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}
