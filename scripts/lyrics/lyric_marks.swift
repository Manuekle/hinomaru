// Turns the CTC word timings from align_lyrics.py (aligned on each line's romaji) into the
// line's start, end and per-phrase marks for the space-separated phrases of its Japanese text.
// The system tokenizer reads both sides as romaji and a character alignment ties them together.
//   swift scripts/lyrics/lyric_marks.swift <song id>...
// reads build/lyrics/<id>.ctc.json · writes build/lyrics/<id>.marks.json · prints a report
import Foundation

let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
let work = root.appendingPathComponent("build/lyrics")

/// Romaji of each word, from the tokenizer's readings (latin text passes through).
func readings(_ text: String) -> [String] {
    let cf = text as CFString
    let tok = CFStringTokenizerCreate(nil, cf, CFRange(location: 0, length: CFStringGetLength(cf)),
                                      kCFStringTokenizerUnitWord, Locale(identifier: "ja") as CFLocale)
    var out: [String] = []
    while CFStringTokenizerAdvanceToNextToken(tok).rawValue != 0 {
        let r = CFStringTokenizerGetCurrentTokenRange(tok)
        out.append(CFStringTokenizerCopyCurrentTokenAttribute(tok, kCFStringTokenizerAttributeLatinTranscription) as? String
                   ?? (text as NSString).substring(with: NSRange(location: r.location, length: r.length)))
    }
    return out
}

/// Spelling-insensitive romaji: long vowels flattened, particles を/は read as sung.
func key(_ s: String) -> [Character] {
    var k = s.lowercased().folding(options: [.diacriticInsensitive, .widthInsensitive], locale: nil)
        .filter { $0.isLetter && $0.isASCII }
    for (a, b) in [("ou", "o"), ("oo", "o"), ("uu", "u"), ("aa", "a"), ("ii", "i"), ("ee", "e"), ("wo", "o"), ("ha", "wa")] {
        k = k.replacingOccurrences(of: a, with: b)
    }
    return Array(k)
}

/// Global alignment of two character runs; for each index of `a`, the matching index of `b`.
func align(_ a: [Character], _ b: [Character]) -> [Int?] {
    let n = a.count, m = b.count
    guard n > 0, m > 0 else { return [Int?](repeating: nil, count: n) }
    var score = [[Int]](repeating: [Int](repeating: 0, count: m + 1), count: n + 1)
    var back = [[UInt8]](repeating: [UInt8](repeating: 0, count: m + 1), count: n + 1)
    for i in 1...n { score[i][0] = -i; back[i][0] = 1 }
    for j in 1...m { score[0][j] = -j; back[0][j] = 2 }
    for i in 1...n {
        for j in 1...m {
            let d = score[i - 1][j - 1] + (a[i - 1] == b[j - 1] ? 2 : -1)
            let u = score[i - 1][j] - 1, l = score[i][j - 1] - 1
            if d >= u && d >= l { score[i][j] = d; back[i][j] = 0 }
            else if u >= l { score[i][j] = u; back[i][j] = 1 }
            else { score[i][j] = l; back[i][j] = 2 }
        }
    }
    var map = [Int?](repeating: nil, count: n)
    var i = n, j = m
    while i > 0 || j > 0 {
        if i > 0 && j > 0 && back[i][j] == 0 {
            if a[i - 1] == b[j - 1] { map[i - 1] = j - 1 }
            i -= 1; j -= 1
        } else if i > 0 && (j == 0 || back[i][j] == 1) { i -= 1 } else { j -= 1 }
    }
    return map
}

struct Word: Decodable { let w: String; let s: Double; let e: Double; let score: Double }
struct CTCLine: Decodable { let words: [Word] }
struct Mark: Encodable { let time: Double; let end: Double; let marks: [Double] }

func tenth(_ d: Double) -> Double { (d * 10).rounded() / 10 }

let songs = try JSONSerialization.jsonObject(with: Data(contentsOf: root.appendingPathComponent("KanaGO/Resources/Data/songs.json"))) as! [[String: Any]]
for id in CommandLine.arguments.dropFirst() {
    guard let song = songs.first(where: { $0["id"] as? String == id }) else { print("unknown song \(id)"); continue }
    let ctc = try JSONDecoder().decode([CTCLine].self, from: Data(contentsOf: work.appendingPathComponent("\(id).ctc.json")))
    let lyrics = song["lyrics"] as! [[String: Any]]
    print("== \(id)")
    var out: [Mark] = []
    for (li, line) in lyrics.enumerated() {
        let text = line["text"] as! String
        let old = (line["time"] as! NSNumber).doubleValue
        let ws = ctc[li].words
        guard let first = ws.first, let last = ws.last else { print("  L\(li) no words"); continue }
        // romaji side: each word's characters spread over its span
        var bChars: [Character] = [], bTimes: [Double] = []
        for w in ws {
            let k = key(w.w)
            for (n, c) in k.enumerated() {
                bChars.append(c)
                bTimes.append(w.s + (w.e - w.s) * Double(n) / Double(max(k.count, 1)))
            }
        }
        // Japanese side: characters labeled with their phrase
        let phrases = text.split(whereSeparator: \.isWhitespace).map(String.init)
        var aChars: [Character] = [], aPhrase: [Int] = []
        for (pi, p) in phrases.enumerated() {
            for c in readings(p).flatMap(key) { aChars.append(c); aPhrase.append(pi) }
        }
        let map = align(aChars, bChars)
        // CTC places a syllable at its emission peak, a hair after the consonant starts
        let start = max(first.s - 0.1, 0)
        let end = last.e
        var marks: [Double] = []
        for pi in phrases.indices {
            let idx = aPhrase.indices.filter { aPhrase[$0] == pi }
            var t: Double?
            for (k, ci) in idx.enumerated() {
                if let bj = map[ci] { t = bTimes[bj] - Double(k) * 0.1 - 0.1; break }
            }
            // a phrase with no matched character takes its share of the line
            let share = start + (end - start) * Double(idx.first ?? 0) / Double(max(aChars.count, 1))
            marks.append(pi == 0 ? start : max(t ?? share, marks.last! + 0.1))
        }
        if marks.count > 1, marks.last! >= end { marks[marks.count - 1] = end - 0.1 }

        let score = ws.map(\.score).reduce(0, +) / Double(ws.count)
        let gap = zip(ws, ws.dropFirst()).map { $1.s - $0.e }.max() ?? 0
        let next = li + 1 < lyrics.count ? (lyrics[li + 1]["time"] as! NSNumber).doubleValue : .infinity
        var flags: [String] = []
        if abs(start - old) > 0.9 { flags.append("SHIFT") }   // far from the current time
        if gap > 3 { flags.append("GAP") }                    // a word ran off to another part of the song
        if end > next + 1 { flags.append("LONG") }            // spills into the next line
        if score < 0.15 { flags.append("LOW") }               // the model barely heard these words
        print(String(format: "  L%-2d %6.2f → %6.2f  end %6.2f  score %.2f  [%@]%@  %@", li, old, start, end, score,
                     marks.map { String(format: "%.1f", $0) }.joined(separator: " "),
                     flags.isEmpty ? "" : "  << " + flags.joined(separator: ","), text))
        out.append(Mark(time: tenth(start), end: tenth(end), marks: marks.map(tenth)))
    }
    guard out.count == lyrics.count else { print("  not written: some lines have no timing"); continue }
    try JSONEncoder().encode(out).write(to: work.appendingPathComponent("\(id).marks.json"))
}
