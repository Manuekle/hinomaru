import AVFoundation
import Speech
import SwiftUI

// MARK: - Audio session

/// Category changes and activation block while the system arbitrates audio with other apps, so they
/// run off the main thread, in order, on one serial queue.
enum AudioSession {
    private static let queue = DispatchQueue(label: "kanago.audio-session", qos: .userInitiated)

    static func activate(_ category: AVAudioSession.Category, mode: AVAudioSession.Mode,
                         options: AVAudioSession.CategoryOptions,
                         activation: AVAudioSession.SetActiveOptions = []) async throws {
        try await withCheckedThrowingContinuation { (done: CheckedContinuation<Void, Error>) in
            queue.async {
                do {
                    let session = AVAudioSession.sharedInstance()
                    try session.setCategory(category, mode: mode, options: options)
                    try session.setActive(true, options: activation)
                    done.resume()
                } catch {
                    done.resume(throwing: error)
                }
            }
        }
    }

    /// Back to playback so the TTS voice and the songs are loud again.
    static func restorePlayback() {
        queue.async {
            try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.duckOthers, .mixWithOthers])
        }
    }
}

// MARK: - Speech recognition (ja-JP)

@Observable
final class SpeechListener {
    enum Failure: Error { case unavailable, noMicrophone }

    var transcript = ""
    var isListening = false
    var level: Double = 0

    /// Called on the main queue with the final transcript (empty if nothing was heard).
    @ObservationIgnored var onFinish: ((String) -> Void)?

    @ObservationIgnored private let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "ja-JP"))
    @ObservationIgnored private let engine = AVAudioEngine()
    @ObservationIgnored private var request: SFSpeechAudioBufferRecognitionRequest?
    @ObservationIgnored private var task: SFSpeechRecognitionTask?
    @ObservationIgnored private var stopTimer: DispatchWorkItem?
    // bumped by cancel(), so a start still waiting on the audio session knows to give up
    @ObservationIgnored private var attempt = 0
    @ObservationIgnored private var sessionOpen = false

    static func authorize() async -> Bool {
        let speech = await withCheckedContinuation { c in
            SFSpeechRecognizer.requestAuthorization { c.resume(returning: $0 == .authorized) }
        }
        guard speech else { return false }
        return await AVAudioApplication.requestRecordPermission()
    }

    @MainActor
    func start(hints: [String]) async throws {
        cancel()
        guard let recognizer, recognizer.isAvailable else { throw Failure.unavailable }

        let attempt = self.attempt
        sessionOpen = true
        try await AudioSession.activate(.playAndRecord, mode: .measurement, options: [.duckOthers, .defaultToSpeaker],
                                        activation: .notifyOthersOnDeactivation)
        guard attempt == self.attempt else { return }

        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        guard format.channelCount > 0, format.sampleRate > 0 else { throw Failure.noMicrophone }

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.contextualStrings = hints
        self.request = request

        input.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, _ in
            request.append(buffer)
            guard let data = buffer.floatChannelData?[0] else { return }
            let n = Int(buffer.frameLength)
            var sum: Float = 0
            for i in 0..<n { sum += data[i] * data[i] }
            let rms = sqrt(sum / Float(max(n, 1)))
            let level = Double(min(max((20 * log10(max(rms, 0.000_01)) + 50) / 40, 0), 1))
            DispatchQueue.main.async { self?.level = level }
        }
        engine.prepare()
        try engine.start()

        transcript = ""
        isListening = true
        task = recognizer.recognitionTask(with: request) { [weak self] result, error in
            DispatchQueue.main.async {
                guard let self, self.isListening else { return }
                if let result {
                    self.transcript = result.bestTranscription.formattedString
                    // a short pause after speech ends the attempt
                    self.scheduleStop(after: result.isFinal ? 0 : 1.1)
                }
                if error != nil { self.finish() }
            }
        }
        scheduleStop(after: 5)
    }

    func finish() {
        guard isListening else { return }
        let heard = transcript
        teardown()
        onFinish?(heard)
    }

    func cancel() {
        attempt += 1
        if isListening { teardown() } else { closeSession() }
    }

    private func scheduleStop(after seconds: Double) {
        stopTimer?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.finish() }
        stopTimer = work
        DispatchQueue.main.asyncAfter(deadline: .now() + seconds, execute: work)
    }

    private func teardown() {
        isListening = false
        level = 0
        stopTimer?.cancel()
        if engine.isRunning { engine.stop() }
        engine.inputNode.removeTap(onBus: 0)
        request?.endAudio()
        task?.cancel()
        request = nil
        task = nil
        closeSession()
    }

    private func closeSession() {
        guard sessionOpen else { return }
        sessionOpen = false
        AudioSession.restorePlayback()
    }
}

enum PronunciationCheck {
    /// Romaji with long vowels and punctuation flattened, so "toukyou", "tōkyō" and "tokyo" agree.
    static func key(_ text: String) -> String {
        var s = Romaji.from(text).lowercased()
            .folding(options: [.diacriticInsensitive, .widthInsensitive], locale: nil)
        s = s.filter { $0.isLetter }
        for (long, short) in [("ou", "o"), ("oo", "o"), ("uu", "u"), ("aa", "a"), ("ii", "i"), ("ee", "e")] {
            s = s.replacingOccurrences(of: long, with: short)
        }
        return s
    }

    /// 0…1 similarity between what was heard and the card.
    static func score(heard: String, card: Card) -> Double {
        let h = heard.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !h.isEmpty else { return 0 }
        let targets = [card.jp, card.kana].compactMap { $0 }
        if targets.contains(where: { h.contains($0) }) { return 1 }
        let hk = key(h)
        return targets.map { t -> Double in
            let tk = key(t)
            guard !tk.isEmpty, !hk.isEmpty else { return 0 }
            if hk.contains(tk) { return 1 }
            let d = AnswerCheck.distance(hk, tk)
            return max(0, 1 - Double(d) / Double(max(hk.count, tk.count)))
        }.max() ?? 0
    }
}

// MARK: - Session

struct SpeakSession: View {
    @Environment(AppModel.self) private var app
    var deck: Deck

    static func speakable(_ deck: Deck) -> [Card] {
        guard !deck.isGrammar else { return [] }
        return deck.cards.filter { c in
            let spoken = c.kana ?? c.jp
            return spoken.count >= 2 && spoken.count <= 14
        }
    }

    private enum Access { case unknown, granted, denied }

    @State private var listener = SpeechListener()
    @State private var access: Access = .unknown
    @State private var cards: [Card] = []
    @State private var index = 0
    @State private var attempts = 0
    @State private var lastScore: Double?
    @State private var heard = ""
    @State private var passed = 0
    @State private var finished = false
    @State private var micError: String?

    private static let passMark = 0.7

    var body: some View {
        ZStack {
            KGBackground()
            if finished {
                ResultView(correct: passed, total: cards.count, xp: passed * 3, title: deck.title(app.lang))
            } else if access == .denied {
                deniedView
            } else if let card = cards[safe: index] {
                session(card)
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: lastScore)
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: index)
        .task {
            if cards.isEmpty { cards = Array(Self.speakable(deck).shuffled().prefix(10)) }
            access = await SpeechListener.authorize() ? .granted : .denied
        }
        .onAppear {
            listener.onFinish = { text in judge(text) }
        }
        .onDisappear { listener.cancel() }
    }

    private func session(_ card: Card) -> some View {
        let ok = (lastScore ?? 0) >= Self.passMark
        let done = lastScore != nil && (ok || attempts >= 3)
        return VStack(spacing: 16) {
            SessionTopBar(progress: Double(index) / Double(max(cards.count, 1)), trailing: "\(index + 1)/\(cards.count)")
            HStack(alignment: .bottom) {
                KanaBlob(mood: lastScore == nil ? (listener.isListening ? .wow : .curious) : (ok ? .happy : .meh), size: 64)
                Text(app.t("Dilo en voz alta", "Say it out loud"))
                    .kgFont(18, .bold).foregroundStyle(KG.ink)
                Spacer()
            }
            .padding(.horizontal, 20)

            VStack(spacing: 10) {
                Text(card.jp)
                    .font(.system(size: card.jp.count > 6 ? 38 : 64, weight: .semibold, design: .rounded))
                    .foregroundStyle(KG.ink)
                    .minimumScaleFactor(0.4)
                if let kana = card.kana, kana != card.jp {
                    Text(kana).kgText(17, .medium).foregroundStyle(KG.muted)
                }
                if app.p.showRomaji {
                    Text(card.romaji).kgFont(16, .semibold).foregroundStyle(KG.pinkText)
                }
                Text(card.meaning(app.lang)).kgText(15).foregroundStyle(KG.inkSoft)
                    .multilineTextAlignment(.center)
                SpeakButton(text: card.kana ?? card.jp, size: 40)
            }
            .frame(maxWidth: .infinity, minHeight: 230)
            .padding(16)
            .sticker(radius: 30)
            .padding(.horizontal, 20)

            heardBox(ok: ok)
                .padding(.horizontal, 20)

            Spacer(minLength: 0)

            if done {
                Button(app.t("Continuar", "Continue"), action: next)
                    .buttonStyle(ok ? .chunkyMint : .chunkyRed)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 10)
            } else {
                micButton(card)
                Button(app.t("Saltar", "Skip"), action: next)
                    .kgFont(15, .semibold)
                    .foregroundStyle(KG.muted)
                    .padding(.bottom, 10)
            }
        }
    }

    @ViewBuilder
    private func heardBox(ok: Bool) -> some View {
        if let micError {
            Text(micError).kgFont(14, .semibold).foregroundStyle(KG.redDeep).multilineTextAlignment(.center)
        } else if listener.isListening || lastScore != nil {
            VStack(spacing: 4) {
                Text(listener.isListening ? app.t("Escuchando…", "Listening…") : app.t("Oí:", "I heard:"))
                    .kgFont(13, .semibold).foregroundStyle(KG.muted)
                Text(listener.isListening ? (listener.transcript.isEmpty ? "…" : listener.transcript)
                                          : (heard.isEmpty ? app.t("(nada)", "(nothing)") : heard))
                    .font(.system(size: 22, weight: .semibold, design: .rounded))
                    .foregroundStyle(KG.ink)
                if let lastScore, !listener.isListening {
                    Text(ok ? "¡Sugoi! \(Int(lastScore * 100))%"
                            : attempts >= 3 ? app.t("Escúchalo y sigue con la próxima", "Listen to it and move on")
                                            : app.t("Casi… inténtalo otra vez (\(Int(lastScore * 100))%)", "Almost… try again (\(Int(lastScore * 100))%)"))
                        .kgFont(16, .bold)
                        .foregroundStyle(ok ? KG.mintDeep : KG.redDeep)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(14)
            .sticker(lastScore == nil ? .white : (ok ? KG.mint.opacity(0.14) : KG.red.opacity(0.1)), radius: 22)
            .transition(.opacity.combined(with: .scale(scale: 0.95)))
        }
    }

    private func micButton(_ card: Card) -> some View {
        Button {
            if listener.isListening { listener.finish() } else { listen(card) }
        } label: {
            ZStack {
                Circle()
                    .fill(KG.flame.opacity(0.22))
                    .frame(width: 96, height: 96)
                    .scaleEffect(listener.isListening ? 1 + listener.level * 0.45 : 1)
                    .animation(.easeOut(duration: 0.12), value: listener.level)
                Circle()
                    .fill(listener.isListening ? KG.red : KG.flame)
                    .frame(width: 84, height: 84)
                HugeIcon(listener.isListening ? .pause : .mic, size: 36).foregroundStyle(.white)
            }
        }
        .buttonStyle(.squish)
        .disabled(access != .granted)
        .opacity(access == .granted ? 1 : 0.4)
        .accessibilityLabel(listener.isListening ? app.t("Detener", "Stop") : app.t("Hablar", "Speak"))
        .sensoryFeedback(.impact(weight: .medium), trigger: listener.isListening)
    }

    private var deniedView: some View {
        VStack(spacing: 18) {
            SessionTopBar(progress: 0)
            Spacer()
            KanaBlob(mood: .sad, size: 120)
            Text(app.t("Necesito el micrófono", "I need the microphone"))
                .kgFont(26, .bold).foregroundStyle(KG.ink)
            Text(app.t("Activa Micrófono y Reconocimiento de voz para KanaGO! en Ajustes para practicar tu pronunciación.",
                       "Turn on Microphone and Speech Recognition for KanaGO! in Settings to practice your pronunciation."))
                .kgText(16).foregroundStyle(KG.inkSoft)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 30)
            Spacer()
            if let url = URL(string: UIApplication.openSettingsURLString) {
                Link(destination: url) { Text(app.t("Abrir Ajustes", "Open Settings")) }
                    .buttonStyle(.chunky)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 10)
            }
        }
    }

    private func listen(_ card: Card) {
        micError = nil
        lastScore = nil
        Speaker.shared.stop()
        Task { @MainActor in
            do {
                try await listener.start(hints: [card.jp, card.kana].compactMap { $0 })
            } catch SpeechListener.Failure.noMicrophone {
                micError = app.t("No encuentro un micrófono.", "No microphone found.")
            } catch {
                micError = app.t("El reconocimiento de voz no está disponible ahora.", "Speech recognition isn't available right now.")
            }
        }
    }

    private func judge(_ text: String) {
        guard let card = cards[safe: index] else { return }
        guard !text.trimmingCharacters(in: .whitespaces).isEmpty else {
            micError = app.t("No te oí. Toca el micrófono y habla más cerca.", "I didn't hear you. Tap the mic and speak closer.")
            return
        }
        heard = text
        attempts += 1
        let score = PronunciationCheck.score(heard: text, card: card)
        lastScore = score
        let ok = score >= Self.passMark
        if ok {
            passed += 1
            app.grade(deck.cardKey(card), attempts == 1 ? .good : .hard)
        }
        SoundPlayer.shared.play(ok ? .correct : .wrong)
        if !ok, attempts >= 3 { Speaker.shared.speak(card.kana ?? card.jp, rate: app.p.speechRate) }
    }

    private func next() {
        listener.cancel()
        attempts = 0
        lastScore = nil
        heard = ""
        micError = nil
        if index + 1 >= cards.count {
            app.addXP(passed * 3)
            SoundPlayer.shared.play(.finish)
            finished = true
        } else {
            index += 1
        }
    }
}
