import AVFoundation
import CryptoKit
import Foundation
import Observation

enum Lang: String, Codable, CaseIterable, Identifiable {
    case es, en
    var id: String { rawValue }
    var label: String { self == .es ? "Español" : "English" }
}

// MARK: - Content (read-only, bundled JSON)

final class ContentStore {
    static let shared = ContentStore()

    let decks: [Deck]
    let alphabet: AlphabetData
    let scenarios: [Scenario]
    let songs: [Song]
    let stories: [Story]
    let roadmap: [RoadmapLevel]
    let jlpt: [JLPTLevel]

    static let levels = ["Survival", "N5", "N4", "N3", "N2", "N1"]

    private init() {
        // the web data lists "Self-Introduction" twice under N5; keep the first of each title
        var seen = Set<String>()
        decks = (Self.load("decks") as [Deck]).filter { seen.insert("\($0.level)|\($0.titleEs)").inserted }
        alphabet = Self.load("alphabet")
        scenarios = Self.load("conversations")
        songs = Self.load("songs")
        stories = Self.load("stories")
        roadmap = (Self.load("roadmap") as RoadmapData).levels
        jlpt = (Self.load("jlpt") as JLPTData).levels
    }

    func jlptLevel(_ level: String) -> JLPTLevel? { jlpt.first { $0.level == level } }

    /// Path order used to pick "your next lesson".
    static let pathOrder = ["Kana", "N5", "Survival", "N4", "N3", "N2", "N1"]

    func level(_ key: String) -> RoadmapLevel? { roadmap.first { $0.key == key } }

    func lessonContext(_ id: String) -> (level: RoadmapLevel, unit: RoadmapUnit, lesson: RoadmapLesson)? {
        for level in roadmap {
            for unit in level.units {
                if let lesson = unit.lessons.first(where: { $0.id == id }) { return (level, unit, lesson) }
            }
        }
        return nil
    }

    private static func load<T: Decodable>(_ name: String) -> T {
        guard let url = Bundle.main.url(forResource: name, withExtension: "json") else {
            fatalError("Missing bundled \(name).json")
        }
        do {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            return try decoder.decode(T.self, from: Data(contentsOf: url))
        } catch {
            fatalError("Failed to decode \(name).json: \(error)")
        }
    }

    func deck(_ id: String) -> Deck? { decks.first { $0.id == id } }

    func sections(_ script: Script) -> [KanaSection] {
        alphabet.sections.filter { $0.script == script.rawValue }
    }

    func chars(_ script: Script) -> [KanaChar] {
        sections(script).flatMap { $0.groups.flatMap(\.chars) }
    }

    func words(for char: KanaChar) -> [KanaWord] {
        let inGroup = alphabet.words[char.group] ?? []
        let containing = inGroup.filter { $0.chars.contains(char.jp) || $0.jp.contains(char.jp) }
        if !containing.isEmpty { return containing }
        return alphabet.words.values.flatMap { $0 }.filter { $0.jp.contains(char.jp) }.prefix(3).map { $0 }
    }
}

// MARK: - SRS (SM-2)

struct SRSState: Codable, Hashable {
    var ease: Double = 2.5
    var interval: Int = 0      // days
    var reps: Int = 0
    var lapses: Int = 0
    var due: Date = .distantPast
    var lastReviewed: Date?

    var isLearned: Bool { reps >= 2 && interval >= 3 }
}

enum Grade: Int, CaseIterable {
    case again = 1, hard = 3, good = 4, easy = 5
}

enum SM2 {
    static func review(_ s: SRSState, grade: Grade, now: Date = .now) -> SRSState {
        var n = s
        let q = Double(grade.rawValue)
        if grade == .again {
            n.reps = 0
            n.lapses += 1
            n.interval = 0
        } else {
            n.reps += 1
            switch n.reps {
            case 1: n.interval = grade == .easy ? 3 : 1
            case 2: n.interval = grade == .hard ? 3 : 6
            default:
                let mult = grade == .hard ? 1.2 : (grade == .easy ? n.ease * 1.3 : n.ease)
                n.interval = max(n.interval + 1, Int((Double(n.interval) * mult).rounded()))
            }
        }
        n.ease = max(1.3, n.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
        n.lastReviewed = now
        n.due = grade == .again
            ? now.addingTimeInterval(60)
            : Calendar.current.date(byAdding: .day, value: n.interval, to: Calendar.current.startOfDay(for: now)) ?? now
        return n
    }
}

// MARK: - User progress (persisted locally)

struct ProgressSnapshot: Codable {
    var srs: [String: SRSState] = [:]
    var kanaSeen: [String: Int] = [:]          // kana id -> correct answers
    var xp: Int = 0
    var streak: Int = 0
    var lastActiveDay: Date?
    var xpByDay: [String: Int] = [:]           // yyyy-MM-dd -> xp
    var finishedScenarios: [String: Int] = [:] // scenario id -> best score %
    var storiesRead: [String: Int] = [:]       // story id -> best quiz score %
    var songsDone: [String: Int] = [:]         // song id -> times completed
    var lessonsDone: [String: Int] = [:]       // roadmap lesson id -> best accuracy %
    var savedWords: [SavedWord] = []           // "my vocabulary", newest first
    var jlptBest: [String: Int] = [:]          // "N5_vocabulary" -> best score %
    var jlptPassed: [String: Date] = [:]       // level -> first passed mock test
    var name: String = ""
    var lang: Lang = .es
    var showRomaji: Bool = true
    var speechRate: Double = 0.42
    var dailyGoal: Int = 50
    var onboarded: Bool = false
    var sound: Bool = true
    var voice: VoiceStyle = .kawaii
    var reminderOn: Bool = false
    var reminderHour: Int = 19

    init() {}

    // Every key is optional so progress saved by older builds keeps loading as fields are added.
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let d = ProgressSnapshot()
        srs = try c.decodeIfPresent([String: SRSState].self, forKey: .srs) ?? d.srs
        kanaSeen = try c.decodeIfPresent([String: Int].self, forKey: .kanaSeen) ?? d.kanaSeen
        xp = try c.decodeIfPresent(Int.self, forKey: .xp) ?? d.xp
        streak = try c.decodeIfPresent(Int.self, forKey: .streak) ?? d.streak
        lastActiveDay = try c.decodeIfPresent(Date.self, forKey: .lastActiveDay)
        xpByDay = try c.decodeIfPresent([String: Int].self, forKey: .xpByDay) ?? d.xpByDay
        finishedScenarios = try c.decodeIfPresent([String: Int].self, forKey: .finishedScenarios) ?? d.finishedScenarios
        storiesRead = try c.decodeIfPresent([String: Int].self, forKey: .storiesRead) ?? d.storiesRead
        songsDone = try c.decodeIfPresent([String: Int].self, forKey: .songsDone) ?? d.songsDone
        lessonsDone = try c.decodeIfPresent([String: Int].self, forKey: .lessonsDone) ?? d.lessonsDone
        savedWords = try c.decodeIfPresent([SavedWord].self, forKey: .savedWords) ?? d.savedWords
        jlptBest = try c.decodeIfPresent([String: Int].self, forKey: .jlptBest) ?? d.jlptBest
        jlptPassed = try c.decodeIfPresent([String: Date].self, forKey: .jlptPassed) ?? d.jlptPassed
        name = try c.decodeIfPresent(String.self, forKey: .name) ?? d.name
        lang = try c.decodeIfPresent(Lang.self, forKey: .lang) ?? d.lang
        showRomaji = try c.decodeIfPresent(Bool.self, forKey: .showRomaji) ?? d.showRomaji
        speechRate = try c.decodeIfPresent(Double.self, forKey: .speechRate) ?? d.speechRate
        dailyGoal = try c.decodeIfPresent(Int.self, forKey: .dailyGoal) ?? d.dailyGoal
        onboarded = try c.decodeIfPresent(Bool.self, forKey: .onboarded) ?? d.onboarded
        sound = try c.decodeIfPresent(Bool.self, forKey: .sound) ?? d.sound
        voice = try c.decodeIfPresent(VoiceStyle.self, forKey: .voice) ?? d.voice
        reminderOn = try c.decodeIfPresent(Bool.self, forKey: .reminderOn) ?? d.reminderOn
        reminderHour = try c.decodeIfPresent(Int.self, forKey: .reminderHour) ?? d.reminderHour
    }
}

@Observable
final class AppModel {
    var p: ProgressSnapshot {
        didSet {
            save()
            Speaker.shared.style = p.voice
            SoundPlayer.shared.enabled = p.sound
        }
    }

    @ObservationIgnored let content = ContentStore.shared
    @ObservationIgnored private let url: URL

    init() {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        url = dir.appendingPathComponent("kanago-progress.json")
        if let data = try? Data(contentsOf: url),
           let snap = try? JSONDecoder().decode(ProgressSnapshot.self, from: data) {
            p = snap
        } else {
            p = ProgressSnapshot()
        }
        Speaker.shared.style = p.voice
        SoundPlayer.shared.enabled = p.sound
        refreshStreak()
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(p) else { return }
        try? data.write(to: url, options: .atomic)
        scheduleWidgetSync()
    }

    @ObservationIgnored var widgetSync: DispatchWorkItem?

    var lang: Lang { p.lang }

    /// Inline bilingual string helper.
    func t(_ es: String, _ en: String) -> String { p.lang == .es ? es : en }

    // MARK: XP & streak

    private static let dayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    static func dayKey(_ date: Date) -> String { dayFormatter.string(from: date) }

    var todayXP: Int { p.xpByDay[Self.dayKey(.now)] ?? 0 }
    var goalProgress: Double { Double(todayXP) / Double(max(p.dailyGoal, 1)) }

    func addXP(_ amount: Int) {
        guard amount > 0 else { return }
        let cal = Calendar.current
        let today = cal.startOfDay(for: .now)
        if let last = p.lastActiveDay.map({ cal.startOfDay(for: $0) }) {
            let gap = cal.dateComponents([.day], from: last, to: today).day ?? 0
            if gap == 1 { p.streak += 1 } else if gap > 1 { p.streak = 1 } else if p.streak == 0 { p.streak = 1 }
        } else {
            p.streak = 1
        }
        let before = todayXP
        p.lastActiveDay = .now
        p.xp += amount
        p.xpByDay[Self.dayKey(.now), default: 0] += amount
        if before < p.dailyGoal, todayXP >= p.dailyGoal {
            SoundPlayer.shared.play(.unlock, after: 0.9)   // daily goal reached, right after the finish jingle
        }
    }

    private func refreshStreak() {
        guard let last = p.lastActiveDay else { return }
        let cal = Calendar.current
        let gap = cal.dateComponents([.day], from: cal.startOfDay(for: last), to: cal.startOfDay(for: .now)).day ?? 0
        if gap > 1 { p.streak = 0 }
    }

    /// Last 7 days of XP, oldest first.
    var weekXP: [(label: String, xp: Int, isToday: Bool)] {
        let cal = Calendar.current
        let f = DateFormatter()
        f.locale = Locale(identifier: p.lang == .es ? "es" : "en")
        f.dateFormat = "EEEEE"
        return (0..<7).reversed().map { back in
            let d = cal.date(byAdding: .day, value: -back, to: .now)!
            return (f.string(from: d).uppercased(), p.xpByDay[Self.dayKey(d)] ?? 0, back == 0)
        }
    }

    // MARK: SRS

    func state(_ key: String) -> SRSState? { p.srs[key] }

    func grade(_ key: String, _ grade: Grade) {
        p.srs[key] = SM2.review(p.srs[key] ?? SRSState(), grade: grade)
    }

    func dueKeys(now: Date = .now) -> [String] {
        p.srs.filter { $0.value.due <= now }.map(\.key)
    }

    var dueCount: Int { dueKeys().count }

    func learnedCount(_ deck: Deck) -> Int {
        deck.cards.filter { p.srs[deck.cardKey($0)]?.isLearned == true }.count
    }

    func seenCount(_ deck: Deck) -> Int {
        if deck.isGrammar { return 0 }
        return deck.cards.filter { p.srs[deck.cardKey($0)] != nil }.count
    }

    func deckProgress(_ deck: Deck) -> Double {
        guard !deck.cards.isEmpty else { return 0 }
        let score = deck.cards.reduce(0.0) { acc, c in
            guard let s = p.srs[deck.cardKey(c)] else { return acc }
            return acc + (s.isLearned ? 1 : 0.4)
        }
        return score / Double(deck.cards.count)
    }

    /// Cards to study now for a deck: due reviews first, then new ones.
    func studyQueue(_ deck: Deck, newLimit: Int = 10) -> [Card] {
        let now = Date.now
        let due = deck.cards.filter { (p.srs[deck.cardKey($0)]?.due ?? .distantFuture) <= now }
        let fresh = deck.cards.filter { p.srs[deck.cardKey($0)] == nil }.prefix(newLimit)
        return Array(due.shuffled() + fresh)
    }

    /// Global review queue across all decks.
    func reviewQueue(limit: Int = 30) -> [(deck: Deck, card: Card)] {
        let keys = Set(dueKeys())
        guard !keys.isEmpty else { return [] }
        var out: [(Deck, Card)] = []
        for deck in content.decks + [savedDeck] where !deck.isGrammar {
            for card in deck.cards where keys.contains(deck.cardKey(card)) {
                out.append((deck, card))
            }
        }
        return Array(out.shuffled().prefix(limit))
    }

    // MARK: Kana

    func markKana(_ id: String, correct: Bool) {
        if correct { p.kanaSeen[id, default: 0] += 1 }
    }

    func kanaMastery(_ script: Script) -> Double {
        let all = content.chars(script)
        guard !all.isEmpty else { return 0 }
        let mastered = all.filter { (p.kanaSeen[$0.id] ?? 0) >= 3 }.count
        return Double(mastered) / Double(all.count)
    }

    // MARK: Roadmap

    func lessonDone(_ id: String) -> Bool { p.lessonsDone[id] != nil }

    /// A lesson opens once the one before it in the same level path is done.
    func lessonUnlocked(_ lesson: RoadmapLesson, in level: RoadmapLevel) -> Bool {
        let all = level.lessons
        guard let i = all.firstIndex(of: lesson) else { return false }
        return i == 0 || lessonDone(all[i - 1].id)
    }

    func currentLesson(in level: RoadmapLevel) -> RoadmapLesson? {
        level.lessons.first { !lessonDone($0.id) }
    }

    func levelProgress(_ level: RoadmapLevel) -> Double {
        let all = level.lessons
        guard !all.isEmpty else { return 0 }
        return Double(all.filter { lessonDone($0.id) }.count) / Double(all.count)
    }

    /// The next lesson along the suggested path (kana first, then N5, travel, N4…).
    var nextLesson: (level: RoadmapLevel, unit: RoadmapUnit, lesson: RoadmapLesson)? {
        for key in ContentStore.pathOrder {
            guard let level = content.level(key), let lesson = currentLesson(in: level),
                  let unit = level.units.first(where: { $0.lessons.contains(lesson) }) else { continue }
            return (level, unit, lesson)
        }
        return nil
    }

    func resetProgress() {
        let keep = (p.name, p.lang, p.showRomaji, p.speechRate, p.dailyGoal, p.sound)
        let reminder = (p.voice, p.reminderOn, p.reminderHour)
        p = ProgressSnapshot()
        (p.name, p.lang, p.showRomaji, p.speechRate, p.dailyGoal, p.sound) = keep
        (p.voice, p.reminderOn, p.reminderHour) = reminder
        p.onboarded = true
    }
}

// MARK: - Voice & sound

final class Speaker: NSObject, AVAudioPlayerDelegate {
    static let shared = Speaker()
    private let synth = AVSpeechSynthesizer()
    // Pre-recorded ElevenLabs clips (scripts/generate_audio.py): tts_<sha1(text)[:16]>.m4a for
    // Yona (.kawaii), tts_kasane_<…>.m4a for Kasane (.cool). No clip falls back to AVSpeechSynthesizer.
    private var player: AVAudioPlayer?
    private var pending: [URL] = []
    private var playbackRate: Float = 1
    // Voice lookup talks to the TTS daemon synchronously and can block the main thread,
    // so every speech call runs on its own serial queue.
    private let queue = DispatchQueue(label: "kanago.speech", qos: .userInitiated)
    private var voice: AVSpeechSynthesisVoice?
    private var voiceResolved = false
    private var dialogueVoices: (female: AVSpeechSynthesisVoice?, male: AVSpeechSynthesisVoice?)?
    /// Set from the Yona / Kasane voice preference.
    var style: VoiceStyle = .kawaii

    /// Warm up the Japanese voice off the main thread.
    func prepare() {
        queue.async {
            try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.duckOthers, .mixWithOthers])
            _ = self.resolveVoice()
        }
    }

    private func resolveVoice() -> AVSpeechSynthesisVoice? {
        if !voiceResolved {
            let ja = AVSpeechSynthesisVoice.speechVoices().filter { $0.language.hasPrefix("ja") }
            voice = ja.max { $0.quality.rawValue < $1.quality.rawValue } ?? AVSpeechSynthesisVoice(language: "ja-JP")
            voiceResolved = true
        }
        return voice
    }

    /// The clip in the chosen voice, or the other voice's clip if that one is missing.
    static func clipURL(for text: String, style: VoiceStyle) -> URL? {
        let t = text.trimmingCharacters(in: .whitespacesAndNewlines)
        let hex = Insecure.SHA1.hash(data: Data(t.utf8)).prefix(8).map { String(format: "%02x", $0) }.joined()
        let order: [VoiceStyle] = style == .kawaii ? [.kawaii, .cool] : [.cool, .kawaii]
        return order.lazy.compactMap { Bundle.main.url(forResource: $0.clipPrefix + hex, withExtension: "m4a") }.first
    }

    /// The AVSpeech rate slider (0.25…0.6, default 0.42) mapped onto clip playback speed.
    private static func clipRate(_ rate: Double) -> Float {
        Float(min(max(rate / 0.42, 0.5), 1.5))
    }

    private func haltAll() {
        if synth.isSpeaking { synth.stopSpeaking(at: .immediate) }
        pending = []
        player?.stop()
        player = nil
    }

    private func playClips(_ urls: [URL], rate: Double) {
        haltAll()
        pending = urls
        playbackRate = Self.clipRate(rate)
        playNext()
    }

    private func playNext() {
        guard !pending.isEmpty else { player = nil; return }
        let url = pending.removeFirst()
        guard let p = try? AVAudioPlayer(contentsOf: url) else { playNext(); return }
        p.enableRate = true
        p.rate = playbackRate
        p.delegate = self
        player = p
        p.play()
    }

    func audioPlayerDidFinishPlaying(_ p: AVAudioPlayer, successfully flag: Bool) {
        // small gap between dialogue lines, like postUtteranceDelay
        queue.asyncAfter(deadline: .now() + 0.35) {
            guard p === self.player else { return }
            self.playNext()
        }
    }

    func speak(_ text: String, rate: Double = 0.42) {
        let style = self.style
        queue.async {
            if let url = Self.clipURL(for: text, style: style) {
                self.playClips([url], rate: rate)
                return
            }
            self.haltAll()
            let u = AVSpeechUtterance(string: text)
            u.voice = self.resolveVoice()
            u.rate = Float(rate) * AVSpeechUtteranceMaximumSpeechRate
            u.pitchMultiplier = style.pitch
            self.synth.speak(u)
        }
    }

    /// Reads a JLPT listening dialogue: recorded clips when every line has one, otherwise
    /// AVSpeech with a female and a male voice (narrator uses the default one).
    func speakDialogue(_ lines: [JLPTLine], rate: Double = 0.42) {
        let style = self.style
        queue.async {
            let clips = lines.compactMap { Self.clipURL(for: $0.text, style: style) }
            if !lines.isEmpty, clips.count == lines.count {
                self.playClips(clips, rate: rate)
                return
            }
            self.haltAll()
            let voices = self.resolveDialogueVoices()
            for line in lines {
                let u = AVSpeechUtterance(string: line.text)
                u.rate = Float(rate) * AVSpeechUtteranceMaximumSpeechRate
                switch line.speaker {
                case "F":
                    u.voice = voices.female ?? self.resolveVoice()
                    u.pitchMultiplier = voices.female == nil ? 1.2 : 1.05
                case "M":
                    u.voice = voices.male ?? self.resolveVoice()
                    u.pitchMultiplier = voices.male == nil ? 0.75 : 1
                default:
                    u.voice = self.resolveVoice()
                    u.pitchMultiplier = 1
                }
                u.postUtteranceDelay = 0.35
                self.synth.speak(u)
            }
        }
    }

    func stop() {
        queue.async { self.haltAll() }
    }

    private func resolveDialogueVoices() -> (female: AVSpeechSynthesisVoice?, male: AVSpeechSynthesisVoice?) {
        if let dialogueVoices { return dialogueVoices }
        let ja = AVSpeechSynthesisVoice.speechVoices().filter { $0.language.hasPrefix("ja") }
        func best(_ g: AVSpeechSynthesisVoiceGender) -> AVSpeechSynthesisVoice? {
            ja.filter { $0.gender == g }.max { $0.quality.rawValue < $1.quality.rawValue }
        }
        let found = (best(.female), best(.male))
        dialogueVoices = found
        return found
    }
}

enum VoiceStyle: String, Codable, CaseIterable, Identifiable {
    case kawaii, cool
    var id: String { rawValue }
    var pitch: Float { self == .kawaii ? 1.1 : 0.85 }
    // raw values stay kawaii/cool so saved progress keeps decoding
    var label: String { self == .kawaii ? "Yona" : "Kasane" }
    var clipPrefix: String { self == .kawaii ? "tts_" : "tts_kasane_" }
}

/// Interface sounds, rendered from procedural-sounds patches by scripts/sounds/render.py.
enum SFX: String, CaseIterable {
    case correct, wrong, finish, tap, flip, unlock
}

final class SoundPlayer {
    static let shared = SoundPlayer()
    /// Mirrors the "Sonido" setting.
    var enabled = true
    /// A couple of players per sound so quick repeats (taps) overlap instead of cutting each other off.
    private var players: [SFX: [AVAudioPlayer]] = [:]
    private var next: [SFX: Int] = [:]

    @MainActor
    func preload() async {
        guard enabled else { return }
        for sound in SFX.allCases {
            guard !Task.isCancelled else { return }
            _ = pool(sound)
            await Task.yield()
        }
    }

    func play(_ sfx: SFX, volume: Float = 1) {
        guard enabled else { return }
        let pool = pool(sfx)
        guard !pool.isEmpty else { return }
        let i = next[sfx, default: 0] % pool.count
        next[sfx] = i + 1
        pool[i].volume = volume
        pool[i].currentTime = 0
        pool[i].play()
    }

    /// Plays a sound a moment later, e.g. a goal chime after the session-complete jingle.
    func play(_ sfx: SFX, after delay: TimeInterval) {
        DispatchQueue.main.asyncAfter(deadline: .now() + delay) { self.play(sfx) }
    }

    private func pool(_ sfx: SFX) -> [AVAudioPlayer] {
        if let made = players[sfx] { return made }
        guard let url = Bundle.main.url(forResource: sfx.rawValue, withExtension: "wav") else { return [] }
        let made = (0..<(sfx == .tap ? 3 : 2)).compactMap { _ in try? AVAudioPlayer(contentsOf: url) }
        made.forEach { $0.prepareToPlay() }
        players[sfx] = made
        return made
    }
}
