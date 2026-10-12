// Simulated handwriting against the app's own KanaGO/Data/Strokes.swift, to tune its thresholds:
// how often a sloppy-but-right stroke passes, and how often a wrong, reversed or swapped one does.
//   swiftc -O -parse-as-library KanaGO/Data/Strokes.swift scripts/stroke_harness.swift -o /tmp/strokes
//   cp KanaGO/Resources/Data/strokes.json /tmp/ && /tmp/strokes
import CoreGraphics
import Foundation

/// SplitMix64, so every run sees the same scribbles.
struct Rng {
    var state: UInt64
    mutating func next() -> UInt64 {
        state &+= 0x9E37_79B9_7F4A_7C15
        var z = state
        z = (z ^ (z >> 30)) &* 0xBF58_476D_1CE4_E5B9
        z = (z ^ (z >> 27)) &* 0x94D0_49BB_1331_11EB
        return z ^ (z >> 31)
    }
    mutating func uniform(_ lo: CGFloat, _ hi: CGFloat) -> CGFloat {
        lo + (hi - lo) * CGFloat(Double(next() >> 11) / Double(1 << 53))
    }
    mutating func normal(_ sigma: CGFloat) -> CGFloat {
        let u1 = max(uniform(0, 1), 1e-9), u2 = uniform(0, 1)
        return sigma * sqrt(-2 * log(u1)) * cos(2 * .pi * u2)
    }
}

struct Sloppiness {
    var shift: CGFloat, scale: CGFloat, turn: CGFloat, wobble: CGFloat, ends: CGFloat
    static let tracing = Sloppiness(shift: 2.5, scale: 0.1, turn: 4, wobble: 1.5, ends: 0.08)
    static let memory = Sloppiness(shift: 4, scale: 0.2, turn: 8, wobble: 2, ends: 0.1)
}

func transformed(_ pts: [CGPoint], about c: CGPoint, sx: CGFloat, sy: CGFloat, degrees: CGFloat, dx: CGFloat, dy: CGFloat) -> [CGPoint] {
    let t = degrees * .pi / 180, co = cos(t), si = sin(t)
    return pts.map { p in
        let x = (p.x - c.x) * sx, y = (p.y - c.y) * sy
        return CGPoint(x: c.x + x * co - y * si + dx, y: c.y + x * si + y * co + dy)
    }
}

func centroid(_ pts: [CGPoint]) -> CGPoint {
    CGPoint(x: pts.reduce(0) { $0 + $1.x } / CGFloat(pts.count), y: pts.reduce(0) { $0 + $1.y } / CGFloat(pts.count))
}

/// A finger's version of the stroke: off by a little, wobbly, ends a bit short or long,
/// sampled unevenly like touch events.
func humanize(_ stroke: [CGPoint], _ s: Sloppiness, _ rng: inout Rng) -> [CGPoint] {
    let len = StrokeMatcher.length(stroke)
    var pts = StrokeMatcher.resample(stroke, max(8, Int(len / 1.5)))
    // over/undershoot at both ends
    let cut0 = rng.uniform(-s.ends, s.ends), cut1 = rng.uniform(-s.ends, s.ends)
    func extend(_ a: CGPoint, _ b: CGPoint, _ by: CGFloat) -> CGPoint {
        let d = max(StrokeMatcher.dist(a, b), 0.001)
        return CGPoint(x: a.x + (a.x - b.x) / d * by, y: a.y + (a.y - b.y) / d * by)
    }
    let n = pts.count
    let drop0 = cut0 > 0 ? Int(CGFloat(n) * cut0) : 0, drop1 = cut1 > 0 ? Int(CGFloat(n) * cut1) : 0
    if n - drop0 - drop1 >= 3 { pts = Array(pts[drop0..<(n - drop1)]) }
    if cut0 < 0 { pts.insert(extend(pts[0], pts[1], -cut0 * len), at: 0) }
    if cut1 < 0 { pts.append(extend(pts[pts.count - 1], pts[pts.count - 2], -cut1 * len)) }
    // low-frequency wobble across the stroke plus touch jitter
    let f1 = rng.uniform(0.5, 1.5), f2 = rng.uniform(2, 3), p1 = rng.uniform(0, 6.28), p2 = rng.uniform(0, 6.28)
    let a = rng.uniform(0.3, 1) * s.wobble
    let m = pts.count
    pts = pts.enumerated().map { i, p in
        let t = CGFloat(i) / CGFloat(max(m - 1, 1))
        let w = a * (0.6 * sin(2 * .pi * f1 * t + p1) + 0.4 * sin(2 * .pi * f2 * t + p2))
        let q = pts[min(i + 1, m - 1)], o = pts[max(i - 1, 0)]
        let d = max(StrokeMatcher.dist(q, o), 0.001)
        let nx = -(q.y - o.y) / d, ny = (q.x - o.x) / d
        return CGPoint(x: p.x + nx * w + rng.normal(0.3), y: p.y + ny * w + rng.normal(0.3))
    }
    // the stroke as a whole sits a little off
    let c = centroid(pts)
    let k = 1 + rng.uniform(-s.scale, s.scale)
    pts = transformed(pts, about: c, sx: k, sy: k, degrees: rng.uniform(-s.turn, s.turn),
                      dx: rng.normal(s.shift), dy: rng.normal(s.shift))
    // uneven touch sampling
    let target = max(4, Int(StrokeMatcher.length(pts) / rng.uniform(1, 4)))
    return StrokeMatcher.resample(pts, target)
}

/// A whole character written on the canvas from memory: smaller or bigger, off-centre, squashed.
func handwrite(_ strokes: [[CGPoint]], _ rng: inout Rng) -> [[CGPoint]] {
    let own = strokes.map { humanize($0, .memory, &rng) }
    let c = centroid(strokes.flatMap { $0 })
    let k = rng.uniform(0.55, 1.05), aspect = rng.uniform(0.85, 1.18)
    let deg = rng.uniform(-4, 4), dx = rng.uniform(-15, 15), dy = rng.uniform(-15, 15)
    return own.map { transformed($0, about: c, sx: k * aspect, sy: k, degrees: deg, dx: dx, dy: dy) }
}

func pct(_ a: Int, _ b: Int) -> String { b == 0 ? "–" : String(format: "%5.1f%%", 100 * Double(a) / Double(b)) }

func script(_ ch: Character) -> String {
    let v = ch.unicodeScalars.first!.value
    return (0x3040...0x309F).contains(v) ? "hiragana" : (0x30A0...0x30FF).contains(v) ? "katakana" : "kanji"
}

@main
struct StrokeHarness {
    static func main() throws {
        let url = Bundle.main.url(forResource: "strokes", withExtension: "json")!
        let chars = try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as! [String: Any]
        let glyphs = chars.keys.sorted().compactMap { StrokeLibrary.glyph($0) }
        var rng = Rng(state: 42)

        for group in ["hiragana", "katakana", "kanji"] {
            let set = glyphs.filter { script($0.text.first!) == group }
            var right = 0, rightN = 0, other = 0, otherN = 0, rev = 0, revFlag = 0, revN = 0
            var memOK = 0, memN = 0, swapOK = 0, swapN = 0, flipOK = 0, flipBack = 0, flipN = 0
            var memFails: [String: Int] = [:], tracerMisses: [String: Int] = [:]
            for g in set {
                let s = g.strokes
                for i in s.indices {
                    for _ in 0..<3 {
                        rightN += 1
                        if StrokeMatcher.match(humanize(s[i], .tracing, &rng), strokes: s, index: i).isMatch { right += 1 }
                        else { tracerMisses[g.text, default: 0] += 1 }
                    }
                    if s.count > 1 {
                        let j = (i + 1 + Int(rng.next() % UInt64(s.count - 1))) % s.count
                        otherN += 1
                        if StrokeMatcher.match(humanize(s[j], .tracing, &rng), strokes: s, index: i).isMatch { other += 1 }
                    }
                    if StrokeMatcher.length(s[i]) > 12 {
                        revN += 1
                        let r = StrokeMatcher.match(humanize(s[i].reversed(), .tracing, &rng), strokes: s, index: i)
                        if r.isMatch { rev += 1 }
                        if r.backwards { revFlag += 1 }
                    }
                }
                for _ in 0..<4 {
                    memN += 1
                    let report = StrokeGrader.grade(handwrite(s, &rng), g)
                    if report.ok { memOK += 1 } else { memFails["\(report.verdict)".components(separatedBy: "(")[0], default: 0] += 1 }
                }
                if s.count >= 2 {
                    var swapped = s
                    let i = Int(rng.next() % UInt64(s.count - 1))
                    swapped.swapAt(i, i + 1)
                    swapN += 1
                    if StrokeGrader.grade(handwrite(swapped, &rng), g).ok { swapOK += 1 }
                }
                if let i = s.indices.filter({ StrokeMatcher.length(s[$0]) > 12 }).randomElement() {
                    var flipped = s
                    flipped[i].reverse()
                    flipN += 1
                    let report = StrokeGrader.grade(handwrite(flipped, &rng), g)
                    if report.ok { flipOK += 1 }
                    if report.verdict == .backwards(i) { flipBack += 1 }
                }
            }
            print("== \(group) (\(set.count) chars)")
            print("  trace  right stroke accepted   \(pct(right, rightN))   (want high)")
            print("  trace  wrong stroke accepted   \(pct(other, otherN))   (want ~0)")
            print("  trace  reversed accepted       \(pct(rev, revN))   flagged backwards \(pct(revFlag, revN))")
            print("  memory right char accepted     \(pct(memOK, memN))   fails \(memFails)")
            print("  memory 2 strokes swapped ok    \(pct(swapOK, swapN))   (want ~0)")
            print("  memory 1 stroke reversed ok    \(pct(flipOK, flipN))   flagged backwards \(pct(flipBack, flipN))")
            let worst = tracerMisses.sorted { $0.value > $1.value }.prefix(12).map { "\($0.key)×\($0.value)" }
            print("  trace misses most:", worst.joined(separator: " "))
        }

        // Look-alikes written for each other, from memory.
        let pairs = ["シツ", "ソン", "ぬめ", "わね", "われ", "ねれ", "土士", "末未", "人入", "人八", "ロ口", "カ力", "ハ八",
                     "エ工", "ニ二", "さち", "るろ", "はほ", "クタ", "ウワ", "ユコ", "ヲヨ", "千干", "日目", "白自", "大犬", "太犬", "右石"]
        var fooled = 0, n = 0
        var hits: [String] = []
        for pair in pairs {
            let c = Array(pair)
            guard let a = StrokeLibrary.glyph(String(c[0])), let b = StrokeLibrary.glyph(String(c[1])) else { continue }
            for _ in 0..<10 {
                n += 2
                if StrokeGrader.grade(handwrite(b.strokes, &rng), a).ok { fooled += 1; hits.append("\(c[1])→\(c[0])") }
                if StrokeGrader.grade(handwrite(a.strokes, &rng), b).ok { fooled += 1; hits.append("\(c[0])→\(c[1])") }
            }
        }
        print("== look-alikes accepted as each other \(pct(fooled, n))", Dictionary(grouping: hits) { $0 }.mapValues(\.count))
    }
}
