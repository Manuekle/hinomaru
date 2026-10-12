import AVFoundation
import Speech
import SwiftUI

// MARK: - Lyric timing

/// A piece of lyric that lights up as one unit: a kana or kanji with the small kana and
/// punctuation that can't start a row, or a whole latin word.
struct LyricChunk: Hashable {
    var text: String
    var weight: Double
}

enum LyricTiming {
    private static let small: Set<Character> = Set("ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ")
    /// Characters that stay glued to the one before them (Japanese line-break rules).
    private static let trailing: Set<Character> = small.union("っッー、。，．！？!?,.」』）)】…〜～・:;")
    private static let opening: Set<Character> = Set("「『（(【")

    /// Rough singing length of one character, in morae.
    static func weight(_ c: Character) -> Double {
        if small.contains(c) { return 0.3 }
        guard let v = c.unicodeScalars.first?.value else { return 0 }
        switch v {
        case 0x3041...0x30FF: return c == "・" ? 0 : 1           // kana, っ, ー
        case 0x3400...0x4DBF, 0x4E00...0x9FFF: return 1.8       // kanji read as ~2 morae
        default: return c.isLetter ? 0.35 : c.isNumber ? 1 : 0  // latin letters, digits; punctuation is free
        }
    }

    static func chunks(_ text: String) -> [LyricChunk] {
        var out: [LyricChunk] = []
        var open = ""
        var inWord = false
        for c in text {
            if opening.contains(c) { open.append(c); inWord = false; continue }
            let latin = c.isASCII && (c.isLetter || c.isNumber || c == "'")
            let joins = !out.isEmpty && open.isEmpty && (c.isWhitespace || trailing.contains(c) || (latin && inWord))
            if joins {
                out[out.count - 1].text.append(c)
                out[out.count - 1].weight += weight(c)
            } else {
                out.append(LyricChunk(text: open + String(c), weight: weight(c)))
                open = ""
            }
            inWord = latin
        }
        if !open.isEmpty { out.append(LyricChunk(text: open, weight: 0)) }
        return out
    }
}

extension Song {
    /// 0…1 of lyric line `i` sung at clip time `t`. The files only carry line start times, so the
    /// line fills across the gap to the next one — or at a steady pace before an instrumental break.
    func sungFraction(_ i: Int, at t: Double) -> Double {
        guard let line = lyrics[safe: i] else { return 0 }
        let next = lyrics[safe: i + 1]?.time ?? endSeconds
        let gap = max(next - line.time, 0.5)
        let morae = LyricTiming.chunks(line.text).reduce(0) { $0 + $1.weight }
        let length = min(gap * 0.9, max(morae * 0.42, 1))
        return min(max((t - line.time) / length, 0), 1)
    }
}

// MARK: - Karaoke text

/// A lyric line that lights up left to right as it's sung, like a karaoke screen.
struct KaraokeLine: View {
    let text: String
    let progress: Double
    var size: CGFloat = 24
    var center = false

    var body: some View {
        let chunks = LyricTiming.chunks(text)
        let sung = progress * chunks.reduce(0) { $0 + $1.weight }
        var before = 0.0
        let fills = chunks.map { c -> Double in
            defer { before += c.weight }
            if progress >= 1 { return 1 }
            if c.weight == 0 { return sung > before ? 1 : 0 }
            return min(max((sung - before) / c.weight, 0), 1)
        }
        return ZStack {
            LyricFlow(center: center) {
                ForEach(chunks.indices, id: \.self) { i in
                    Text(chunks[i].text).foregroundStyle(.white.opacity(0.32))
                }
            }
            LyricFlow(center: center) {
                ForEach(chunks.indices, id: \.self) { i in
                    Text(chunks[i].text)
                        .foregroundStyle(.white)
                        .mask(wipe(fills[i]))
                }
            }
            .shadow(color: KG.candy.opacity(0.85), radius: 9)
        }
        .font(.system(size: size, weight: .bold, design: .rounded))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(text)
    }

    /// Soft-edged left-to-right reveal.
    private func wipe(_ f: Double) -> some View {
        LinearGradient(stops: [.init(color: .black, location: f), .init(color: .clear, location: min(f + 0.15, 1))],
                       startPoint: .leading, endPoint: .trailing)
            .opacity(f > 0 ? 1 : 0)
    }
}

/// Wraps lyric chunks like text, so a line can light up piece by piece across several rows.
struct LyricFlow: Layout {
    var center = false
    var rowSpacing: CGFloat = 2

    private struct Row { var items: [Int] = []; var width: CGFloat = 0; var height: CGFloat = 0 }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = rows(subviews, width: proposal.width ?? .infinity)
        let height = rows.reduce(0) { $0 + $1.height } + rowSpacing * CGFloat(max(rows.count - 1, 0))
        return CGSize(width: proposal.width ?? rows.map(\.width).max() ?? 0, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var y = bounds.minY
        for row in rows(subviews, width: bounds.width) {
            var x = center ? bounds.minX + (bounds.width - row.width) / 2 : bounds.minX
            for i in row.items {
                let s = subviews[i].sizeThatFits(.unspecified)
                subviews[i].place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(s))
                x += s.width
            }
            y += row.height + rowSpacing
        }
    }

    private func rows(_ subviews: Subviews, width: CGFloat) -> [Row] {
        var rows: [Row] = [Row()]
        for i in subviews.indices {
            let s = subviews[i].sizeThatFits(.unspecified)
            if rows[rows.count - 1].width + s.width > width, !rows[rows.count - 1].items.isEmpty { rows.append(Row()) }
            rows[rows.count - 1].items.append(i)
            rows[rows.count - 1].width += s.width
            rows[rows.count - 1].height = max(rows[rows.count - 1].height, s.height)
        }
        return rows
    }
}

// MARK: - Sing-along listening

/// Listens through a whole song with one recognition request per lyric line, so every line
/// gets its own transcript and score.
@Observable
final class KaraokeListener {
    var isRunning = false
    var level: Double = 0
    /// What was heard and how well it matched, by lyric index.
    var heard: [Int: String] = [:]
    var scores: [Int: Double] = [:]

    @ObservationIgnored private let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "ja-JP"))
    @ObservationIgnored private let engine = AVAudioEngine()
    // the audio tap reads the current request from the render thread
    @ObservationIgnored private let lock = NSLock()
    @ObservationIgnored private var request: SFSpeechAudioBufferRecognitionRequest?
    @ObservationIgnored private var tasks: [SFSpeechRecognitionTask] = []
    @ObservationIgnored private var line: Int?
    @ObservationIgnored private var run = 0
    @ObservationIgnored private var configObserver: NSObjectProtocol?

    func start() throws {
        stop()
        guard let recognizer, recognizer.isAvailable else { throw SpeechListener.Failure.unavailable }
        let session = AVAudioSession.sharedInstance()
        // keep the song playing out loud while the mic is open
        try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothA2DP, .mixWithOthers])
        try session.setActive(true)
        try startEngine()
        // headphones plugged in, or WebKit touching the session, stops the engine; pick it back up
        configObserver = NotificationCenter.default.addObserver(forName: .AVAudioEngineConfigurationChange, object: engine,
                                                                queue: .main) { [weak self] _ in
            guard let self, self.isRunning, !self.engine.isRunning else { return }
            try? self.startEngine()
        }
        run += 1
        heard = [:]
        scores = [:]
        line = nil
        isRunning = true
    }

    private func startEngine() throws {
        let input = engine.inputNode
        input.removeTap(onBus: 0)
        let format = input.outputFormat(forBus: 0)
        guard format.channelCount > 0, format.sampleRate > 0 else { throw SpeechListener.Failure.noMicrophone }
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            guard let self else { return }
            self.lock.lock()
            let request = self.request
            self.lock.unlock()
            request?.append(buffer)
            guard let data = buffer.floatChannelData?[0] else { return }
            let n = Int(buffer.frameLength)
            var sum: Float = 0
            for i in 0..<n { sum += data[i] * data[i] }
            let rms = sqrt(sum / Float(max(n, 1)))
            let level = Double(min(max((20 * log10(max(rms, 0.000_01)) + 50) / 40, 0), 1))
            DispatchQueue.main.async { self.level = level }
        }
        engine.prepare()
        try engine.start()
    }

    /// Starts a fresh transcript for lyric `index`; the previous line keeps any late results.
    func listen(line index: Int, text: String) {
        guard isRunning, index != line, let recognizer else { return }
        endRequest()
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.taskHint = .dictation
        request.contextualStrings = text.split(whereSeparator: \.isWhitespace).map(String.init)
        lock.lock()
        self.request = request
        lock.unlock()
        line = index
        let run = self.run
        tasks.append(recognizer.recognitionTask(with: request) { [weak self] result, _ in
            guard let result else { return }
            let said = result.bestTranscription.formattedString
            let score = KaraokeCheck.score(heard: said, line: text)
            DispatchQueue.main.async {
                guard let self, self.run == run else { return }
                self.heard[index] = said
                self.scores[index] = score
            }
        })
    }

    func stop() {
        guard isRunning else { return }
        isRunning = false
        level = 0
        line = nil
        endRequest()
        if let configObserver { NotificationCenter.default.removeObserver(configObserver) }
        configObserver = nil
        if engine.isRunning { engine.stop() }
        engine.inputNode.removeTap(onBus: 0)
        // give the last line's final result a moment to land, then drop the tasks
        let pending = tasks
        tasks = []
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { pending.forEach { $0.cancel() } }
        // back to playback so the song and the TTS voice are loud again
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.duckOthers, .mixWithOthers])
    }

    private func endRequest() {
        lock.lock()
        let old = request
        request = nil
        lock.unlock()
        old?.endAudio()
    }
}

enum KaraokeCheck {
    /// 0…1 match between what was sung and a lyric line, compared as romaji so kanji and kana
    /// agree. Singing over the music trips up recognition, so a close attempt counts as full marks.
    static func score(heard: String, line: String) -> Double {
        let h = PronunciationCheck.key(heard), t = PronunciationCheck.key(line)
        guard !h.isEmpty, !t.isEmpty else { return 0 }
        let similarity = 1 - Double(AnswerCheck.distance(h, t)) / Double(max(h.count, t.count))
        return min(max(similarity * 1.25, 0), 1)
    }

    /// Bright fill for a score badge; always carries ink text. (KG.mint is tuned for bold
    /// white text, so the top tier keeps the lighter mint.)
    static func color(_ score: Double) -> Color {
        score >= 0.85 ? Color(hex: 0x4FD39B) : score >= 0.6 ? KG.sun : score >= 0.3 ? KG.flame : KG.red
    }

    static func mood(_ score: Double) -> Mood {
        score >= 0.85 ? .love : score >= 0.6 ? .happy : score >= 0.3 ? .meh : .sad
    }
}
