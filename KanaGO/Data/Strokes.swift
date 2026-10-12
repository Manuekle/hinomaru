import Foundation
import CoreGraphics

// Plain Foundation + CoreGraphics so the matcher can be exercised from a command-line harness.

/// Stroke-order data from KanjiVG (Resources/Data/strokes.json, built by scripts/build_strokes.py):
/// every writable character as polylines in a 109×109 box, in writing order.
enum StrokeLibrary {
    static let box: CGFloat = 109

    private static let table: [String: [[CGPoint]]] = {
        guard let url = Bundle.main.url(forResource: "strokes", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let raw = try? JSONSerialization.jsonObject(with: data) as? [String: [[Double]]] else { return [:] }
        return raw.mapValues { strokes in
            strokes.map { xy in stride(from: 0, to: xy.count - 1, by: 2).map { CGPoint(x: xy[$0], y: xy[$0 + 1]) } }
        }
    }()

    /// Parses the table off the main thread before the first canvas needs it.
    static func warmUp() { _ = table.count }

    static func has(_ text: String) -> Bool { glyph(text) != nil }

    /// The word laid out for writing: its characters side by side, one 109-unit cell each.
    static func glyph(_ text: String) -> StrokeGlyph? {
        let chars = Array(text.trimmingCharacters(in: .whitespaces))
        guard !chars.isEmpty else { return nil }
        var strokes: [[CGPoint]] = []
        for (i, ch) in chars.enumerated() {
            guard let own = table[String(ch)] else { return nil }
            let dx = box * CGFloat(i)
            strokes += own.map { $0.map { CGPoint(x: $0.x + dx, y: $0.y) } }
        }
        return StrokeGlyph(text: text, strokes: strokes, cells: chars.count)
    }
}

struct StrokeGlyph {
    let text: String
    let strokes: [[CGPoint]]
    let cells: Int

    var size: CGSize { CGSize(width: StrokeLibrary.box * CGFloat(cells), height: StrokeLibrary.box) }
}

// MARK: - One stroke

/// Compares a drawn stroke with the expected one, both in glyph units — after Hanzi Writer's
/// strokeMatches: close on average, starts and ends in the right places, heads the right way,
/// has the same shape and isn't much shorter. Thresholds are Hanzi Writer's, scaled from its
/// 1024 box to KanjiVG's 109 and tuned with scripts/stroke_harness.swift.
enum StrokeMatcher {
    struct Result {
        var isMatch: Bool
        /// Would match if drawn the other way round.
        var backwards = false
        var avgDist: CGFloat = .infinity
    }

    private static let avgDistance: CGFloat = 13
    private static let endDistance: CGFloat = 22
    private static let frechet: CGFloat = 0.45
    private static let minLength: CGFloat = 0.35
    private static let rotations: [CGFloat] = [0, .pi / 32, -.pi / 32, .pi / 16, -.pi / 16]

    /// Stroke `index` of `strokes`, as the next one to trace. A stroke that fits a later one
    /// better only passes if it still matches with less leniency, so 二's second stroke drawn
    /// first doesn't count as the first.
    static func match(_ drawn: [CGPoint], strokes: [[CGPoint]], index: Int, leniency: CGFloat = 1) -> Result {
        let points = dedupe(drawn)
        guard points.count >= 2 else { return Result(isMatch: false) }
        let own = score(points, strokes[index], leniency: leniency, checkBackwards: true)
        guard own.isMatch else { return own }
        let later = strokes[(index + 1)...]
            .map { score(points, $0, leniency: leniency, checkBackwards: false) }
            .filter(\.isMatch).map(\.avgDist).min() ?? .infinity
        guard later < own.avgDist else { return own }
        let stricter = 0.6 * (later + own.avgDist) / (2 * own.avgDist)
        return score(points, strokes[index], leniency: leniency * stricter, checkBackwards: false)
    }

    static func score(_ drawn: [CGPoint], _ stroke: [CGPoint], leniency: CGFloat = 1, checkBackwards: Bool = true) -> Result {
        let points = dedupe(drawn)
        guard points.count >= 2, stroke.count >= 2 else { return Result(isMatch: false) }
        let avg = points.reduce(0) { $0 + distance($1, to: stroke) } / CGFloat(points.count)
        guard avg <= avgDistance * leniency else { return Result(isMatch: false, avgDist: avg) }
        let ok = endsMatch(points, stroke, leniency) && headsSameWay(points, stroke)
            && sameShape(points, stroke, leniency) && longEnough(points, stroke, leniency)
        if !ok, checkBackwards, score(points.reversed(), stroke, leniency: leniency, checkBackwards: false).isMatch {
            return Result(isMatch: false, backwards: true, avgDist: avg)
        }
        return Result(isMatch: ok, avgDist: avg)
    }

    private static func endsMatch(_ points: [CGPoint], _ stroke: [CGPoint], _ leniency: CGFloat) -> Bool {
        dist(points[0], stroke[0]) <= endDistance * leniency
            && dist(points[points.count - 1], stroke[stroke.count - 1]) <= endDistance * leniency
    }

    /// Each drawn segment points roughly along some part of the stroke.
    private static func headsSameWay(_ points: [CGPoint], _ stroke: [CGPoint]) -> Bool {
        let drawn = edges(resample(points, 16)), expected = edges(resample(stroke, 16))
        let similarity = drawn.reduce(0) { sum, e in sum + (expected.map { cosine(e, $0) }.max() ?? 0) }
        return similarity / CGFloat(max(drawn.count, 1)) > 0
    }

    private static func sameShape(_ points: [CGPoint], _ stroke: [CGPoint], _ leniency: CGFloat) -> Bool {
        let a = normalized(stroke), b = normalized(points)
        let best = rotations.map { frechetDistance(a, rotate(b, $0)) }.min() ?? .infinity
        return best <= frechet * leniency
    }

    private static func longEnough(_ points: [CGPoint], _ stroke: [CGPoint], _ leniency: CGFloat) -> Bool {
        leniency * (length(points) + 2.7) / (length(stroke) + 2.7) >= minLength
    }

    // MARK: Geometry

    static func length(_ points: [CGPoint]) -> CGFloat {
        zip(points, points.dropFirst()).reduce(0) { $0 + dist($1.0, $1.1) }
    }

    static func dist(_ a: CGPoint, _ b: CGPoint) -> CGFloat { hypot(a.x - b.x, a.y - b.y) }

    /// Distance from `p` to the nearest point of the polyline.
    private static func distance(_ p: CGPoint, to line: [CGPoint]) -> CGFloat {
        var best = CGFloat.infinity
        for (a, b) in zip(line, line.dropFirst()) {
            let dx = b.x - a.x, dy = b.y - a.y
            let len2 = dx * dx + dy * dy
            let t = len2 == 0 ? 0 : max(0, min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2))
            best = min(best, hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)))
        }
        return best
    }

    private static func dedupe(_ points: [CGPoint]) -> [CGPoint] {
        var out: [CGPoint] = []
        for p in points where out.last.map({ dist($0, p) > 0.01 }) ?? true { out.append(p) }
        return out
    }

    /// `n` points evenly spaced along the polyline.
    static func resample(_ points: [CGPoint], _ n: Int) -> [CGPoint] {
        guard points.count >= 2 else { return points }
        let total = length(points)
        guard total > 0 else { return Array(repeating: points[0], count: n) }
        var out = [points[0]], i = 0, walked: CGFloat = 0
        for k in 1..<(n - 1) {
            let target = total * CGFloat(k) / CGFloat(n - 1)
            while i < points.count - 2, walked + dist(points[i], points[i + 1]) < target {
                walked += dist(points[i], points[i + 1])
                i += 1
            }
            let seg = dist(points[i], points[i + 1])
            let t = seg == 0 ? 0 : (target - walked) / seg
            out.append(CGPoint(x: points[i].x + (points[i + 1].x - points[i].x) * t,
                               y: points[i].y + (points[i + 1].y - points[i].y) * t))
        }
        out.append(points[points.count - 1])
        return out
    }

    private static func edges(_ points: [CGPoint]) -> [CGVector] {
        zip(points, points.dropFirst()).map { CGVector(dx: $1.x - $0.x, dy: $1.y - $0.y) }
    }

    private static func cosine(_ a: CGVector, _ b: CGVector) -> CGFloat {
        let m = hypot(a.dx, a.dy) * hypot(b.dx, b.dy)
        return m == 0 ? 0 : (a.dx * b.dx + a.dy * b.dy) / m
    }

    /// Centred on its mean and scaled to unit spread, so only the shape is left.
    private static func normalized(_ points: [CGPoint]) -> [CGPoint] {
        let p = resample(points, 32)
        let mx = p.reduce(0) { $0 + $1.x } / CGFloat(p.count), my = p.reduce(0) { $0 + $1.y } / CGFloat(p.count)
        let spread = sqrt(p.reduce(0) { $0 + pow($1.x - mx, 2) + pow($1.y - my, 2) } / CGFloat(p.count))
        let s = max(spread, 0.001)
        return p.map { CGPoint(x: ($0.x - mx) / s, y: ($0.y - my) / s) }
    }

    private static func rotate(_ points: [CGPoint], _ theta: CGFloat) -> [CGPoint] {
        let c = cos(theta), s = sin(theta)
        return points.map { CGPoint(x: $0.x * c - $0.y * s, y: $0.x * s + $0.y * c) }
    }

    /// Discrete Fréchet distance: the leash a walker on each curve needs, neither going back.
    private static func frechetDistance(_ a: [CGPoint], _ b: [CGPoint]) -> CGFloat {
        var row = [CGFloat](repeating: .infinity, count: b.count)
        for i in a.indices {
            var prevDiag = CGFloat.infinity, left = CGFloat.infinity
            for j in b.indices {
                let d = dist(a[i], b[j])
                let up = row[j]
                let reach: CGFloat = i == 0 && j == 0 ? d : max(d, min(up, left, prevDiag))
                prevDiag = up
                row[j] = reach
                left = reach
            }
        }
        return row[b.count - 1]
    }
}

// MARK: - A whole character from memory

/// Grades a character written without the guide: right number of strokes, each in its place,
/// order and direction. The drawing is first fitted onto the glyph's box, so size and position
/// on the canvas don't matter.
enum StrokeGrader {
    enum Verdict: Equatable {
        case perfect
        case missing(Int)
        case extra(Int)
        /// Stroke index (0-based) that goes the other way.
        case backwards(Int)
        /// Stroke index that matches another stroke of the character, not its own.
        case order(Int)
        case shape(Int)
    }

    struct Report: Equatable {
        var verdict: Verdict
        /// One per drawn stroke: whether it matched its expected stroke.
        var strokeOK: [Bool]
        var ok: Bool { verdict == .perfect }
    }

    static let leniency: CGFloat = 1.5

    static func grade(_ drawn: [[CGPoint]], _ glyph: StrokeGlyph) -> Report {
        let expected = glyph.strokes
        let fitted = fit(drawn, onto: expected)
        var strokeOK: [Bool] = []
        var firstMiss: Verdict?
        for (i, stroke) in fitted.enumerated() {
            guard i < expected.count else { strokeOK.append(false); continue }
            let r = StrokeMatcher.score(stroke, expected[i], leniency: leniency)
            strokeOK.append(r.isMatch)
            guard !r.isMatch, firstMiss == nil else { continue }
            if r.backwards {
                firstMiss = .backwards(i)
            } else if expected.indices.contains(where: { $0 != i && StrokeMatcher.score(stroke, expected[$0], leniency: leniency).isMatch }) {
                firstMiss = .order(i)
            } else {
                firstMiss = .shape(i)
            }
        }
        if drawn.count < expected.count { return Report(verdict: .missing(expected.count - drawn.count), strokeOK: strokeOK) }
        if drawn.count > expected.count { return Report(verdict: .extra(drawn.count - expected.count), strokeOK: strokeOK) }
        return Report(verdict: firstMiss ?? .perfect, strokeOK: strokeOK)
    }

    /// Maps the drawing's bounding box onto the glyph's: centres aligned, each axis scaled on its
    /// own (within 1.5× of the other, so 一 or ノ don't get stretched flat).
    static func fit(_ drawn: [[CGPoint]], onto expected: [[CGPoint]]) -> [[CGPoint]] {
        let from = bounds(drawn.flatMap { $0 }), to = bounds(expected.flatMap { $0 })
        guard from.width > 0 || from.height > 0 else { return drawn }
        let uniform = hypot(to.width, to.height) / max(hypot(from.width, from.height), 0.001)
        var sx = from.width > 0.15 * from.height && to.width > 0.15 * to.height ? to.width / from.width : uniform
        var sy = from.height > 0.15 * from.width && to.height > 0.15 * to.width ? to.height / from.height : uniform
        sx = min(max(sx, uniform / 1.5), uniform * 1.5)
        sy = min(max(sy, uniform / 1.5), uniform * 1.5)
        return drawn.map { $0.map { CGPoint(x: to.midX + ($0.x - from.midX) * sx, y: to.midY + ($0.y - from.midY) * sy) } }
    }

    private static func bounds(_ points: [CGPoint]) -> CGRect {
        guard let first = points.first else { return .zero }
        var r = CGRect(origin: first, size: .zero)
        for p in points { r = r.union(CGRect(origin: p, size: .zero)) }
        return r
    }
}
