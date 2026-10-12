import SwiftUI

// MARK: - Song session (follow the lyrics / karaoke)

struct SongSession: View {
    @Environment(AppModel.self) private var app
    @Environment(\.dismiss) private var dismiss
    var song: Song

    private enum Mode { case lyrics, karaoke }

    @State private var player = YouTubeController()
    @State private var completed = false
    @State private var showTranslation = true
    @State private var manualLine: Int?
    @State private var mode: Mode = .lyrics
    @State private var listener = KaraokeListener()
    @State private var micAccess: Bool?
    @State private var micError: String?
    @State private var countdown: Int?
    @State private var countdownTask: Task<Void, Never>?
    /// A karaoke run reached the end, so the result card shows the score.
    @State private var sangAlong = false
    @State private var earnedXP = 15
    @Namespace private var ns

    private var activeIndex: Int? {
        if player.failed { return manualLine }
        return song.lyrics.lastIndex { $0.time <= player.time + 0.2 }
    }

    private var progress: Double {
        let span = max(song.endSeconds - song.startSeconds, 1)
        return (player.time - song.startSeconds) / span
    }

    private var karaokeScore: Double {
        guard !song.lyrics.isEmpty else { return 0 }
        return song.lyrics.indices.reduce(0) { $0 + (listener.scores[$1] ?? 0) } / Double(song.lyrics.count)
    }

    var body: some View {
        ZStack {
            KG.inkDeep.ignoresSafeArea()
            RadialGradient(colors: [KG.candy.opacity(0.28), .clear], center: .top, startRadius: 0, endRadius: 420)
                .ignoresSafeArea()

            VStack(spacing: 14) {
                SessionTopBar(progress: completed ? 1 : progress)
                video
                header
                modePicker
                if mode == .karaoke {
                    karaokeStage
                    karaokeBar
                } else {
                    controls
                    lyrics
                }
            }

            if completed { completeCard.transition(.scale(scale: 0.85).combined(with: .opacity)) }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: completed)
        .preferredColorScheme(.dark)
        .onChange(of: player.time) { _, t in
            if !completed, player.ready, t >= song.endSeconds - 0.4 { finish() }
        }
        .onChange(of: player.endedCount) {
            if !completed { finish() }
        }
        .onChange(of: activeIndex) { _, idx in
            if let idx, listener.isRunning { listener.listen(line: idx, text: song.lyrics[idx].text) }
        }
        .onDisappear { stopKaraoke() }
    }

    private var video: some View {
        ZStack {
            YouTubePlayerView(videoId: song.youtubeId, start: song.startSeconds, end: song.endSeconds, controller: player)
                .allowsHitTesting(false)
            if !player.ready || player.failed {
                ZStack {
                    KG.ink
                    VStack(spacing: 10) {
                        KanaBlob(mood: player.failed ? .meh : .wow, size: 64)
                        Text(player.failed
                             ? app.t("Sin video (¿sin conexión?). Lee la letra y toca cada línea para oírla.",
                                     "No video (offline?). Read the lyrics and tap a line to hear it.")
                             : app.t("Cargando canción…", "Loading song…"))
                            .kgFont(13, .semibold)
                            .foregroundStyle(.white.opacity(0.75))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    }
                }
            }
        }
        .aspectRatio(16 / 9, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).strokeBorder(.white.opacity(0.9), lineWidth: 3))
        .shadow(color: KG.candy.opacity(0.35), radius: 18, y: 8)
        .padding(.horizontal, 20)
    }

    private var header: some View {
        HStack(alignment: .center, spacing: 10) {
            VStack(alignment: .leading, spacing: 3) {
                Text(song.title).kgFont(22, .bold).foregroundStyle(.white).lineLimit(1)
                Text(song.artist).kgFont(14, .semibold).foregroundStyle(.white.opacity(0.55)).lineLimit(1)
            }
            Spacer()
            Pill(text: song.level, color: KG.levelColor(song.level) == KG.ink ? KG.pink : KG.levelColor(song.level))
        }
        .padding(.horizontal, 20)
    }

    // MARK: Mode

    private var modePicker: some View {
        HStack(spacing: 4) {
            modeTab(.lyrics, app.t("Letra", "Lyrics"), .subtitle)
            modeTab(.karaoke, "Karaoke", .mic)
                .disabled(player.failed)
                .opacity(player.failed ? 0.4 : 1)
        }
        .padding(4)
        .background(Capsule().fill(.white.opacity(0.08)))
        .padding(.horizontal, 20)
        .sensoryFeedback(.selection, trigger: mode)
    }

    private func modeTab(_ m: Mode, _ label: String, _ icon: HI) -> some View {
        let on = mode == m
        return Button { switchMode(m) } label: {
            Label(label, hi: icon, size: 16, filled: on)
                .kgFont(14, .bold)
                .foregroundStyle(on ? .white : .white.opacity(0.6))
                .frame(maxWidth: .infinity)
                .frame(height: 36)
                .background {
                    if on { Capsule().fill(KG.pink).matchedGeometryEffect(id: "mode", in: ns) }
                }
                .contentShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private func switchMode(_ m: Mode) {
        guard m != mode else { return }
        stopKaraoke()
        micError = nil
        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) { mode = m }
        if m == .karaoke {
            // karaoke always starts from the top of the clip
            player.pause()
            player.seek(song.startSeconds, play: false)
            Task { micAccess = await SpeechListener.authorize() }
        }
    }

    // MARK: Follow the lyrics

    private var controls: some View {
        HStack(spacing: 18) {
            roundButton(.replay, size: 46) {
                player.seek(song.startSeconds)
                manualLine = nil
            }
            Button { player.toggle() } label: {
                HugeIcon(player.isPlaying ? .pause : .play, size: 28, filled: true)
                    .foregroundStyle(.white)
                    .frame(width: 66, height: 66)
                    .background(Circle().fill(KG.pink))
                    .shadow(color: KG.candy.opacity(0.5), radius: 12, y: 4)
            }
            .buttonStyle(.squish)
            .disabled(!player.ready)
            .opacity(player.ready ? 1 : 0.4)
            Button {
                player.setRate(player.rate == 1 ? 0.75 : 1)
            } label: {
                Text(player.rate == 1 ? "1×" : "0.75×")
                    .kgFont(14, .bold)
                    .foregroundStyle(.white)
                    .frame(width: 46, height: 46)
                    .background(Circle().fill(.white.opacity(0.12)))
            }
            .buttonStyle(.squish)
            roundButton(.subtitle, size: 46, active: showTranslation) {
                showTranslation.toggle()
            }
        }
    }

    private func roundButton(_ icon: HI, size: CGFloat, active: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HugeIcon(icon, size: size * 0.46, filled: active)
                .foregroundStyle(.white)
                .frame(width: size, height: size)
                .background(Circle().fill(active ? KG.pink : .white.opacity(0.12)))
        }
        .buttonStyle(.squish)
    }

    private var lyrics: some View {
        ScrollViewReader { proxy in
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    ForEach(Array(song.lyrics.enumerated()), id: \.offset) { i, line in
                        lyricRow(i, line, active: i == activeIndex, past: (activeIndex ?? -1) > i)
                            .id(i)
                            .onTapGesture {
                                if player.failed || !player.ready {
                                    manualLine = i
                                    Speaker.shared.speak(line.text, rate: app.p.speechRate)
                                } else {
                                    player.seek(line.time)
                                }
                            }
                    }
                    if let vocab = song.vocab, !vocab.isEmpty { vocabBlock(vocab) }
                }
                .padding(.horizontal, 22)
                .padding(.vertical, 12)
            }
            .scrollIndicators(.hidden)
            .mask(LinearGradient(stops: [.init(color: .clear, location: 0), .init(color: .black, location: 0.06),
                                         .init(color: .black, location: 0.9), .init(color: .clear, location: 1)],
                                 startPoint: .top, endPoint: .bottom))
            .onChange(of: activeIndex) { _, idx in
                guard let idx else { return }
                withAnimation(.spring(response: 0.5, dampingFraction: 0.85)) { proxy.scrollTo(idx, anchor: .center) }
            }
        }
    }

    private func lyricRow(_ i: Int, _ line: LyricLine, active: Bool, past: Bool) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            // swap straight to the filling line; a crossfade would ghost two layouts on top of each other
            if active {
                sungLine(i, size: 24)
                    .transition(.identity)
            } else {
                Text(line.text)
                    .font(.system(size: 19, weight: .bold, design: .rounded))
                    .foregroundStyle(.white.opacity(past ? 0.35 : 0.5))
                    .transition(.identity)
            }
            if app.p.showRomaji, let r = line.romaji {
                Text(r).kgFont(13, .semibold).foregroundStyle(active ? KG.candy : .white.opacity(0.3))
            }
            if showTranslation {
                Text(line.translation(app.lang)).kgText(13).foregroundStyle(.white.opacity(active ? 0.75 : 0.3))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.leading, active ? 14 : 0)
        .overlay(alignment: .leading) {
            if active { Capsule().fill(KG.candy).frame(width: 5) }
        }
        .contentShape(Rectangle())
        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: active)
    }

    /// The active line, lit up as far as it has been sung.
    @ViewBuilder
    private func sungLine(_ i: Int, size: CGFloat, center: Bool = false) -> some View {
        let text = song.lyrics[i].text
        if player.failed {
            KaraokeLine(text: text, progress: 1, size: size, center: center)
        } else {
            TimelineView(.animation(paused: !player.isPlaying)) { ctx in
                KaraokeLine(text: text, progress: song.sungFraction(i, at: player.smoothTime(at: ctx.date)),
                            size: size, center: center)
            }
        }
    }

    private func vocabBlock(_ vocab: [SongVocab]) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(app.t("Palabras clave", "Key words")).kgFont(17, .bold).foregroundStyle(.white)
                .padding(.top, 20)
            FlowLayout(spacing: 8) {
                ForEach(vocab, id: \.jp) { v in
                    HStack(spacing: 8) {
                        Button { Speaker.shared.speak(v.kana, rate: app.p.speechRate) } label: {
                            VStack(alignment: .leading, spacing: 1) {
                                Text(v.jp).font(.system(size: 17, weight: .semibold, design: .rounded))
                                Text("\(v.kana) · \(v.meaning(app.lang))").kgFont(11, .semibold).opacity(0.7)
                            }
                            .foregroundStyle(KG.ink)
                        }
                        .buttonStyle(.squish)
                        SaveWordButton(word: SavedWord(song: v, source: "🎤 \(song.title)"), size: 28)
                    }
                    .padding(.leading, 12).padding(.trailing, 6).padding(.vertical, 6)
                    .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(.white))
                }
            }
        }
        .padding(.bottom, 30)
    }

    // MARK: Karaoke

    /// The previous line, the one being sung and what's coming, centred like a karaoke screen.
    private var karaokeStage: some View {
        let current = activeIndex
        let first = max((current ?? 0) - 1, 0)
        let window = Array(first..<min(first + 3, song.lyrics.count))
        // takes whatever height is left; long lines spill past the bottom and fade out instead of
        // pushing the video off screen
        return Color.clear
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .overlay(alignment: .top) {
                VStack(spacing: 16) {
                    ForEach(window, id: \.self) { i in
                        stageLine(i, active: i == current, past: (current ?? -1) > i)
                            .fixedSize(horizontal: false, vertical: true)
                            .transition(.asymmetric(insertion: .move(edge: .bottom).combined(with: .opacity),
                                                    removal: .move(edge: .top).combined(with: .opacity)))
                    }
                }
                .padding(.horizontal, 22)
                .padding(.top, 10)
            }
            .mask(LinearGradient(stops: [.init(color: .clear, location: 0), .init(color: .black, location: 0.04),
                                         .init(color: .black, location: 0.85), .init(color: .clear, location: 1)],
                                 startPoint: .top, endPoint: .bottom))
            .opacity(countdown == nil ? 1 : 0.15)
        .overlay {
            if let countdown {
                VStack(spacing: 10) {
                    Text(countdown == 0 ? app.t("¡Canta!", "Sing!") : "\(countdown)")
                        .font(.system(size: countdown == 0 ? 64 : 110, weight: .bold, design: .rounded))
                        .foregroundStyle(countdown == 0 ? KG.candy : .white)
                        .shadow(color: KG.candy.opacity(0.6), radius: 24)
                        .id(countdown)
                        .transition(.scale(scale: 0.5).combined(with: .opacity))
                    Text(app.t("Prepárate para cantar", "Get ready to sing"))
                        .kgFont(13, .bold).foregroundStyle(.white.opacity(0.55))
                }
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.85), value: current)
        .animation(.spring(response: 0.35, dampingFraction: 0.6), value: countdown)
        .sensoryFeedback(.impact(weight: .medium), trigger: countdown)
    }

    private func stageLine(_ i: Int, active: Bool, past: Bool) -> some View {
        let line = song.lyrics[i]
        return VStack(spacing: 5) {
            if active {
                sungLine(i, size: 26, center: true)
                if app.p.showRomaji, let r = line.romaji {
                    Text(r).kgFont(13, .semibold).foregroundStyle(KG.candy).multilineTextAlignment(.center)
                }
                if showTranslation {
                    Text(line.translation(app.lang)).kgText(13).foregroundStyle(.white.opacity(0.7))
                        .multilineTextAlignment(.center)
                }
            } else {
                Text(line.text)
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundStyle(.white.opacity(past ? 0.3 : 0.45))
                    .multilineTextAlignment(.center)
            }
            if past, listener.isRunning {
                scoreChip(listener.scores[i] ?? 0)
            }
        }
        .frame(maxWidth: .infinity)
    }

    private func scoreChip(_ score: Double) -> some View {
        Text(score >= 0.85 ? "¡Sugoi! \(Int(score * 100))%" : "\(Int(score * 100))%")
            .kgFont(12, .bold)
            .foregroundStyle(KG.ink)
            .padding(.horizontal, 10).padding(.vertical, 3)
            .background(Capsule().fill(KaraokeCheck.color(score)))
            .transition(.scale.combined(with: .opacity))
    }

    private var karaokeBar: some View {
        Group {
            if micAccess == false {
                VStack(spacing: 10) {
                    Text(app.t("Activa Micrófono y Reconocimiento de voz en Ajustes para cantar.",
                               "Turn on Microphone and Speech Recognition in Settings to sing."))
                        .kgFont(14, .semibold).foregroundStyle(.white.opacity(0.75))
                        .multilineTextAlignment(.center)
                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        Link(destination: url) { Text(app.t("Abrir Ajustes", "Open Settings")) }
                            .buttonStyle(.chunky)
                    }
                }
            } else if listener.isRunning || countdown != nil {
                HStack(spacing: 14) {
                    roundButton(.replay, size: 46) { startKaraoke() }
                    micOrb
                    VStack(alignment: .leading, spacing: 2) {
                        Text(app.t("Te escucho…", "Listening…")).kgFont(12, .bold).foregroundStyle(KG.candy)
                        Text(activeIndex.flatMap { listener.heard[$0] } ?? "…")
                            .font(.system(size: 15, weight: .semibold, design: .rounded))
                            .foregroundStyle(.white.opacity(0.8))
                            .lineLimit(2)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    roundButton(player.isPlaying ? .pause : .play, size: 46) { player.toggle() }
                        .disabled(countdown != nil)
                }
            } else {
                VStack(spacing: 8) {
                    if let micError {
                        Text(micError).kgFont(14, .semibold).foregroundStyle(KG.red).multilineTextAlignment(.center)
                    }
                    Button { startKaraoke() } label: {
                        Label(app.t("¡A cantar!", "Let's sing!"), hi: .mic, size: 22)
                    }
                    .buttonStyle(.chunky)
                    .disabled(!player.ready)
                    .opacity(player.ready ? 1 : 0.5)
                    Label(app.t("Con audífonos te escucho mejor", "I hear you better with headphones"), hi: .headphones, size: 15)
                        .kgFont(12, .semibold).foregroundStyle(.white.opacity(0.5))
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 10)
    }

    private var micOrb: some View {
        ZStack {
            Circle()
                .fill(KG.candy.opacity(0.25))
                .frame(width: 58, height: 58)
                .scaleEffect(1 + listener.level * 0.45)
                .animation(.easeOut(duration: 0.12), value: listener.level)
            Circle().fill(KG.pink).frame(width: 48, height: 48)
            HugeIcon(.mic, size: 24, filled: true).foregroundStyle(.white)
        }
        .frame(width: 66, height: 66)
    }

    private func startKaraoke() {
        stopKaraoke()
        micError = nil
        Speaker.shared.stop()
        player.pause()
        player.seek(song.startSeconds, play: false)
        countdownTask = Task { @MainActor in
            if micAccess != true { micAccess = await SpeechListener.authorize() }
            guard micAccess == true, !Task.isCancelled else { return }
            do {
                // open the mic before the music starts, so the audio route is settled
                try listener.start()
            } catch SpeechListener.Failure.noMicrophone {
                micError = app.t("No encuentro un micrófono.", "No microphone found.")
                return
            } catch {
                micError = app.t("El reconocimiento de voz no está disponible ahora.",
                                 "Speech recognition isn't available right now.")
                return
            }
            for n in [3, 2, 1, 0] {
                countdown = n
                SoundPlayer.shared.play(n == 0 ? .unlock : .tap)
                try? await Task.sleep(for: .milliseconds(n == 0 ? 600 : 900))
                if Task.isCancelled { return }
            }
            countdown = nil
            if let idx = activeIndex { listener.listen(line: idx, text: song.lyrics[idx].text) }
            player.play()
        }
    }

    private func stopKaraoke() {
        countdownTask?.cancel()
        countdownTask = nil
        countdown = nil
        listener.stop()
    }

    // MARK: Finish

    private var completeCard: some View {
        VStack(spacing: 16) {
            if sangAlong {
                KanaBlob(mood: KaraokeCheck.mood(karaokeScore), size: 110)
                Text(karaokeScore >= 0.6 ? app.t("¡Qué voz!", "What a voice!") : app.t("¡Canción completada!", "Song complete!"))
                    .kgFont(26, .bold).foregroundStyle(KG.ink)
                VStack(spacing: 2) {
                    Text("\(Int(karaokeScore * 100))%")
                        .kgFont(40, .bold)
                        .foregroundStyle(KG.ink)
                        .contentTransition(.numericText())
                        .animation(.easeOut, value: karaokeScore)
                        .padding(.horizontal, 22).padding(.vertical, 4)
                        .background(Capsule().fill(KaraokeCheck.color(karaokeScore)))
                        .padding(.bottom, 4)
                    Text(app.t("de la letra cantada bien", "of the lyrics sung right"))
                        .kgFont(13, .semibold).foregroundStyle(KG.muted)
                }
            } else {
                KanaBlob(mood: .love, size: 110)
                Text(app.t("¡Canción completada!", "Song complete!")).kgFont(26, .bold).foregroundStyle(KG.ink)
                Text(song.focus(app.lang)).kgText(15, .medium).foregroundStyle(KG.inkSoft).multilineTextAlignment(.center)
            }
            Pill(text: "+\(earnedXP) XP", color: KG.sun, foreground: KG.ink, icon: .star)
            HStack(spacing: 10) {
                Button(app.t("Otra vez", "Again")) {
                    completed = false
                    sangAlong = false
                    if mode == .karaoke { startKaraoke() } else { player.seek(song.startSeconds) }
                }
                .buttonStyle(.chunkyWhite)
                Button(app.t("Listo", "Done")) { dismiss() }
                    .buttonStyle(.chunky)
            }
        }
        .padding(24)
        .sticker(KG.cream, radius: 32)
        .padding(24)
    }

    private func finish() {
        sangAlong = listener.isRunning
        stopKaraoke()
        completed = true
        player.pause()
        // singing it well earns a bonus on top of finishing the song
        earnedXP = sangAlong && karaokeScore >= 0.6 ? 30 : 15
        app.p.songsDone[song.id, default: 0] += 1
        app.addXP(earnedXP)
        SoundPlayer.shared.play(.finish)
    }
}

// MARK: - Story (graded reading) session

struct StorySession: View {
    @Environment(AppModel.self) private var app
    var story: Story

    @State private var quizzing = false
    @State private var revealed: Set<Int> = []
    @State private var frozenQuestions: [QuizQuestion] = []

    var body: some View {
        if quizzing {
            QuizSession(title: story.title(app.lang), questions: frozenQuestions) { correct, total in
                let pct = total == 0 ? 100 : Int(Double(correct) / Double(total) * 100)
                app.p.storiesRead[story.id] = max(app.p.storiesRead[story.id] ?? 0, pct)
            }
            .transition(.move(edge: .trailing))
        } else {
            reader
        }
    }

    private var questions: [QuizQuestion] {
        story.quiz.map { q in
            let original = q.options(app.lang)
            let correct = original[min(max(q.a, 0), original.count - 1)]
            let opts = original.shuffled()
            return QuizQuestion(prompt: q.question(app.lang), promptIsJapanese: false, hint: nil, speak: nil,
                                options: opts, answer: opts.firstIndex(of: correct) ?? 0, optionsAreJapanese: false,
                                label: app.t("Comprensión", "Comprehension"))
        }
    }

    private var reader: some View {
        ZStack(alignment: .bottom) {
            KGBackground()
            VStack(spacing: 0) {
                SessionTopBar(progress: 0.5)
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        VStack(spacing: 8) {
                            Text(story.emoji).font(.system(size: 64))
                            Text(story.title(app.lang)).kgFont(28, .bold).foregroundStyle(KG.ink)
                                .multilineTextAlignment(.center)
                            HStack(spacing: 8) {
                                Pill(text: story.level, color: KG.levelColor(story.level) == KG.ink ? KG.pink : KG.levelColor(story.level))
                                Button {
                                    Speaker.shared.speak(story.bodyJp, rate: app.p.speechRate)
                                } label: {
                                    Label(app.t("Leer en voz alta", "Read aloud"), hi: .volume, size: 16)
                                        .kgFont(13, .bold)
                                        .foregroundStyle(KG.pinkText)
                                        .padding(.horizontal, 12).padding(.vertical, 6)
                                        .background(Capsule().fill(KG.pinkSoft))
                                }
                                .buttonStyle(.squish)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.bottom, 4)

                        Text(app.t("Toca un párrafo para ver la traducción", "Tap a paragraph to see the translation"))
                            .kgFont(13, .semibold).foregroundStyle(KG.muted)

                        ForEach(Array(story.paragraphs(app.lang).enumerated()), id: \.offset) { i, para in
                            paragraph(i, para.jp, para.translation)
                        }

                        if !story.vocab.isEmpty {
                            SectionTitle(app.t("Vocabulario", "Vocabulary"), jp: "ことば")
                                .padding(.top, 8)
                            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible())], spacing: 10) {
                                ForEach(story.vocab, id: \.jp) { v in
                                    Button { Speaker.shared.speak(v.kana, rate: app.p.speechRate) } label: {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(v.jp).font(.system(size: 19, weight: .semibold, design: .rounded)).foregroundStyle(KG.ink)
                                                .padding(.trailing, 30)
                                            if v.kana != v.jp {
                                                Text(v.kana).kgFont(12, .semibold).foregroundStyle(KG.pinkText)
                                            }
                                            Text(v.meaning(app.lang)).kgText(12, .medium).foregroundStyle(KG.muted)
                                                .lineLimit(2)
                                        }
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding(12)
                                        .sticker(radius: 18)
                                    }
                                    .buttonStyle(.squish)
                                    .overlay(alignment: .topTrailing) {
                                        SaveWordButton(word: SavedWord(story: v, source: "\(story.emoji) \(story.title(app.lang))"), size: 30)
                                            .padding(8)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 120)
                }
            }
            if !story.quiz.isEmpty {
                Button {
                    Speaker.shared.stop()
                    frozenQuestions = questions
                    withAnimation(.spring(response: 0.45, dampingFraction: 0.85)) { quizzing = true }
                } label: {
                    Label(app.t("Hacer el quiz (\(story.quiz.count))", "Take the quiz (\(story.quiz.count))"),
                          hi: .chatDone)
                }
                .buttonStyle(.chunky)
                .padding(.horizontal, 20)
                .padding(.bottom, 8)
                .padding(.top, 14)
                .background(LinearGradient(colors: [KG.cream.opacity(0), KG.cream], startPoint: .top, endPoint: .center)
                    .ignoresSafeArea())
            }
        }
    }

    private func paragraph(_ i: Int, _ jp: String, _ translation: String?) -> some View {
        let open = revealed.contains(i)
        return VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 10) {
                Text(jp)
                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                    .foregroundStyle(KG.ink)
                    .lineSpacing(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                SpeakButton(text: jp, size: 34)
            }
            if open, let translation {
                Text(translation)
                    .kgText(15)
                    .foregroundStyle(KG.inkSoft)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(KG.pinkSoft.opacity(0.6)))
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding(16)
        .sticker(radius: 22)
        .contentShape(Rectangle())
        .onTapGesture {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                if open { revealed.remove(i) } else { revealed.insert(i) }
            }
        }
    }
}

// MARK: - List rows

struct SongRow: View {
    @Environment(AppModel.self) private var app
    var song: Song

    var body: some View {
        let done = app.p.songsDone[song.id] ?? 0
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 18, style: .continuous).fill(KG.ink)
                HugeIcon(done > 0 ? .music : .mic, size: 28)
                    .foregroundStyle(KG.candy)
            }
            .frame(width: 58, height: 58)
            VStack(alignment: .leading, spacing: 4) {
                Text(song.title).kgFont(17, .bold).foregroundStyle(KG.ink).lineLimit(1)
                Text(song.artist).kgFont(13, .semibold).foregroundStyle(KG.muted).lineLimit(1)
                HStack(spacing: 3) {
                    ForEach(0..<5, id: \.self) { i in
                        Circle().fill(i < song.difficulty ? KG.pink : KG.line).frame(width: 6, height: 6)
                    }
                    Text(song.focus(app.lang)).kgText(11, .medium).foregroundStyle(KG.muted).lineLimit(1)
                        .padding(.leading, 4)
                }
            }
            Spacer(minLength: 0)
            if done > 0 {
                HugeIcon(.badgeCheck, size: 24).foregroundStyle(KG.mint)
            }
        }
        .padding(14)
        .sticker(radius: 24)
    }
}

struct StoryRow: View {
    @Environment(AppModel.self) private var app
    var story: Story

    var body: some View {
        let best = app.p.storiesRead[story.id]
        HStack(spacing: 14) {
            Text(story.emoji)
                .font(.system(size: 30))
                .frame(width: 58, height: 58)
                .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(KG.levelColor(story.level).opacity(0.15)))
            VStack(alignment: .leading, spacing: 4) {
                Text(story.title(app.lang)).kgFont(17, .bold).foregroundStyle(KG.ink).lineLimit(1)
                Text(story.bodyJp.replacingOccurrences(of: "\n", with: " "))
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundStyle(KG.muted)
                    .lineLimit(1)
                Text(app.t("\(story.vocab.count) palabras · \(story.quiz.count) preguntas",
                           "\(story.vocab.count) words · \(story.quiz.count) questions"))
                    .kgFont(11, .semibold).foregroundStyle(KG.pinkText)
            }
            Spacer(minLength: 0)
            if let best {
                VStack(spacing: 0) {
                    HugeIcon(.star, size: 20, filled: best >= 70).foregroundStyle(best >= 70 ? KG.sun : KG.line)
                    Text("\(best)%").kgFont(11, .bold).foregroundStyle(KG.muted)
                }
            }
        }
        .padding(14)
        .sticker(radius: 24)
    }
}
