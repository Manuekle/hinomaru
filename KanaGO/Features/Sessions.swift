import SwiftUI

struct SessionHost: View {
    @Environment(AppModel.self) private var app
    var session: Session

    var body: some View {
        content
            // leaving a session silences whatever was still being read out
            .onDisappear { Speaker.shared.stop() }
    }

    @ViewBuilder
    private var content: some View {
        switch session {
        case .flashcards(let id):
            if let deck = app.content.deck(id) {
                FlashcardSession(title: deck.title(app.lang),
                                 items: app.studyQueue(deck).map { StudyItem(deck: deck, card: $0) })
            }
        case .review:
            FlashcardSession(title: app.t("Repaso", "Review"),
                             items: app.reviewQueue().map { StudyItem(deck: $0.deck, card: $0.card) })
        case .kanaQuiz(let script, let groups):
            QuizSession(title: script.latin, questions: QuizBuilder.kana(script, groupIds: groups, app: app))
        case .conversation(let id):
            if let s = app.content.scenarios.first(where: { $0.id == id }) {
                ConversationSession(scenario: s)
            }
        case .mode(let id, let mode):
            if let deck = app.content.deck(id) {
                ModeSessionHost(deck: deck, mode: mode)
            }
        case .lesson(let id):
            LessonHost(lessonId: id)
        case .song(let id):
            if let song = app.content.songs.first(where: { $0.id == id }) {
                SongSession(song: song)
            }
        case .story(let id):
            if let story = app.content.stories.first(where: { $0.id == id }) {
                StorySession(story: story)
            }
        case .saved:
            FlashcardSession(title: app.t("Mis palabras", "My words"), items: app.savedQueue())
        case .jlpt(let level, let kind):
            if let data = app.content.jlptLevel(level) {
                ExamSession(level: data, kind: kind)
            }
        }
    }
}

/// Close button + progress bar used by every session.
struct SessionTopBar: View {
    @Environment(\.dismiss) private var dismiss
    var progress: Double
    var trailing: String? = nil
    var trailingView: AnyView? = nil

    var body: some View {
        HStack(spacing: 14) {
            Button { dismiss() } label: {
                HugeIcon(.cancel, size: 22)
                    .foregroundStyle(KG.muted)
                    .frame(width: 40, height: 40)
            }
            .accessibilityLabel("Cerrar")
            ProgressBarKG(value: progress, height: 16)
            if let trailing {
                Text(trailing).kgFont(15, .bold).foregroundStyle(KG.pinkText).monospacedDigit()
            }
            if let trailingView { trailingView }
        }
        .padding(.horizontal, 16)
        .padding(.top, 6)
    }
}

// MARK: - Flashcards (SRS)

struct StudyItem: Identifiable {
    let deck: Deck
    let card: Card
    var id: String { deck.cardKey(card) }
}

struct FlashcardSession: View {
    @Environment(AppModel.self) private var app
    @Environment(\.dismiss) private var dismiss
    var title: String
    @State var items: [StudyItem]

    @State private var index = 0
    @State private var flipped = false
    @State private var xp = 0
    @State private var good = 0
    @State private var reviewed = 0
    @State private var requeued: Set<String> = []
    @State private var finished = false
    @State private var dragX: CGFloat = 0

    private var total: Int { items.count }

    var body: some View {
        ZStack {
            KGBackground()
            if items.isEmpty {
                emptyState
            } else if finished {
                ResultView(correct: good, total: reviewed, xp: xp,
                           title: app.t("¡Sesión completada!", "Session complete!"))
            } else {
                VStack(spacing: 16) {
                    SessionTopBar(progress: Double(index) / Double(max(total, 1)), trailing: "\(index + 1)/\(total)")
                    Text(title).kgFont(15, .semibold).foregroundStyle(KG.muted)
                    Spacer(minLength: 0)
                    card(items[index])
                        .id(items[index].id + "\(index)")
                        .transition(.asymmetric(insertion: .scale(scale: 0.9).combined(with: .opacity),
                                                removal: .move(edge: .leading).combined(with: .opacity)))
                    Spacer(minLength: 0)
                    controls
                }
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.82), value: index)
        .animation(.spring(response: 0.4, dampingFraction: 0.82), value: finished)
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            KanaBlob(mood: .happy, size: 140)
            Text(app.t("¡Nada pendiente!", "Nothing due!")).kgFont(28, .bold).foregroundStyle(KG.ink)
            Text(app.t("Ya repasaste todo por ahora. Vuelve más tarde o aprende algo nuevo.",
                       "You're all caught up. Come back later or learn something new."))
                .kgText(16).foregroundStyle(KG.inkSoft).multilineTextAlignment(.center)
            Button(app.t("Volver", "Back")) { dismiss() }.buttonStyle(.chunky)
        }
        .padding(30)
    }

    @ViewBuilder
    private func card(_ item: StudyItem) -> some View {
        let c = item.card
        let isNew = app.state(item.id) == nil
        ZStack {
            // front
            VStack(spacing: 14) {
                if isNew { Pill(text: app.t("NUEVA", "NEW"), color: KG.sun, foreground: KG.ink) }
                Text(c.jp)
                    .font(.system(size: c.jp.count > 6 ? 40 : 72, weight: .semibold, design: .rounded))
                    .foregroundStyle(KG.ink)
                    .multilineTextAlignment(.center)
                    .minimumScaleFactor(0.4)
                SpeakButton(text: c.kana ?? c.jp, size: 48)
                Text(app.t("Toca para voltear", "Tap to flip"))
                    .kgFont(13, .semibold).foregroundStyle(KG.muted)
                    .padding(.top, 8)
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .opacity(flipped ? 0 : 1)

            // back
            ScrollView {
                VStack(spacing: 12) {
                    Text(c.jp)
                        .font(.system(size: 34, weight: .semibold, design: .rounded))
                        .foregroundStyle(KG.ink)
                        .multilineTextAlignment(.center)
                    if let kana = c.kana, kana != c.jp {
                        Text(kana).kgText(16, .medium).foregroundStyle(KG.muted)
                    }
                    if app.p.showRomaji, c.romaji != c.meaning(app.lang) {
                        Text(c.romaji).kgFont(18, .semibold).foregroundStyle(KG.pinkText)
                    }
                    Text(c.meaning(app.lang))
                        .kgFont(26, .bold)
                        .foregroundStyle(KG.ink)
                        .multilineTextAlignment(.center)
                    if let extra = c.extra, !extra.isEmpty {
                        HStack(spacing: 8) {
                            ForEach(extra.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in
                                VStack(spacing: 1) {
                                    Text(k).kgFont(10, .bold).foregroundStyle(KG.muted)
                                    Text(v).kgFont(14, .semibold).foregroundStyle(KG.ink)
                                }
                                .padding(.horizontal, 10).padding(.vertical, 6)
                                .background(RoundedRectangle(cornerRadius: 12).fill(KG.cream))
                            }
                        }
                    }
                    if let ex = c.example, ex != c.jp {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(ex).font(.system(size: 18, weight: .semibold, design: .rounded)).foregroundStyle(KG.ink)
                                Spacer(minLength: 0)
                                SpeakButton(text: ex, size: 30)
                            }
                            if app.p.showRomaji, let r = c.exampleRomaji {
                                Text(r).kgText(13, .medium).foregroundStyle(KG.pinkText)
                            }
                            if let m = c.exampleMeaning(app.lang) {
                                Text(m).kgText(14).foregroundStyle(KG.muted)
                            }
                        }
                        .padding(14)
                        .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(KG.cream))
                    }
                }
                .padding(24)
                .frame(maxWidth: .infinity)
            }
            .scrollBounceBehavior(.basedOnSize)
            .opacity(flipped ? 1 : 0)
            .rotation3DEffect(.degrees(180), axis: (x: 0, y: 1, z: 0))
        }
        .frame(maxWidth: .infinity)
        .frame(height: 440)
        .sticker(radius: 34, border: KG.pinkSoft, lineWidth: 4)
        .rotation3DEffect(.degrees(flipped ? 180 : 0), axis: (x: 0, y: 1, z: 0), perspective: 0.5)
        .offset(x: dragX)
        .rotationEffect(.degrees(Double(dragX) / 25))
        .padding(.horizontal, 22)
        .onTapGesture {
            SoundPlayer.shared.play(.flip)
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) { flipped.toggle() }
        }
        .onAppear { Speaker.shared.speak(c.kana ?? c.jp, rate: app.p.speechRate) }
    }

    private var controls: some View {
        Group {
            if flipped {
                HStack(spacing: 8) {
                    gradeButton(.again, app.t("Otra vez", "Again"), KG.red, KG.redDeep)
                    gradeButton(.hard, app.t("Difícil", "Hard"), KG.sun, KG.sunDeep)
                    gradeButton(.good, app.t("Bien", "Good"), KG.mint, KG.mintDeep)
                    gradeButton(.easy, app.t("Fácil", "Easy"), KG.sky, KG.skyDeep)
                }
            } else {
                Button(app.t("Mostrar respuesta", "Show answer")) {
                    SoundPlayer.shared.play(.flip)
                    withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) { flipped = true }
                }
                .buttonStyle(.chunkyInk)
            }
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 10)
    }

    private func gradeButton(_ g: Grade, _ label: String, _ fill: Color, _ lip: Color) -> some View {
        Button { grade(g) } label: {
            Text(label).kgFont(14, .bold).lineLimit(1).minimumScaleFactor(0.7)
        }
        .buttonStyle(ChunkyButtonStyle(fill: fill, lip: lip, foreground: g == .hard ? KG.ink : .white, radius: 16, height: 52))
    }

    private func grade(_ g: Grade) {
        let item = items[index]
        app.grade(item.id, g)
        reviewed += 1
        if g != .again { good += 1 }
        let gain = g == .again ? 1 : (g == .hard ? 2 : 3)
        xp += gain
        app.addXP(gain)
        if g == .again, !requeued.contains(item.id) {
            requeued.insert(item.id)
            items.append(item)
        }
        flipped = false
        if index + 1 >= items.count {
            SoundPlayer.shared.play(.finish)
            finished = true
        } else {
            index += 1
        }
    }
}

// MARK: - Quiz

struct QuizQuestion: Identifiable {
    let id = UUID()
    let prompt: String
    let promptIsJapanese: Bool
    /// Romaji revealed after answering, while the "Show romaji" switch is on.
    let hint: String?
    let speak: String?
    let options: [String]
    let answer: Int
    let optionsAreJapanese: Bool
    var kanaId: String? = nil
    var label: String? = nil
    /// Listening mode: the prompt stays hidden behind a speaker until answered.
    var listening = false
    var isKana: Bool { kanaId != nil }
}

enum QuizBuilder {
    static func deck(_ deck: Deck, app: AppModel, count: Int = 10) -> [QuizQuestion] {
        let lang = app.lang
        var pool = deck.cards
        if pool.count < 4 {
            pool += app.content.decks.filter { $0.level == deck.level && !$0.isGrammar }.flatMap(\.cards)
        }
        let picks = deck.cards.shuffled().prefix(count)
        return picks.enumerated().map { i, card in
            let distractors = pool.filter { $0.jp != card.jp && $0.meaning(lang) != card.meaning(lang) }
                .shuffled().prefix(3)
            let reverse = i % 3 == 2 // every third question: meaning -> japanese
            if reverse {
                var opts = distractors.map(\.jp) + [card.jp]
                opts.shuffle()
                return QuizQuestion(prompt: card.meaning(lang), promptIsJapanese: false, hint: nil, speak: nil,
                                    options: opts, answer: opts.firstIndex(of: card.jp)!, optionsAreJapanese: true)
            }
            var opts = distractors.map { $0.meaning(lang) } + [card.meaning(lang)]
            opts.shuffle()
            return QuizQuestion(prompt: card.jp, promptIsJapanese: true,
                                hint: card.romaji, speak: card.kana ?? card.jp,
                                options: opts, answer: opts.firstIndex(of: card.meaning(lang))!, optionsAreJapanese: false)
        }
    }

    static func kana(_ script: Script, groupIds: [String], app: AppModel, count: Int = 15) -> [QuizQuestion] {
        let all = app.content.chars(script)
        let chosen = all.filter { groupIds.contains($0.group) }
        guard !chosen.isEmpty else { return [] }
        let pool = chosen.count >= 4 ? chosen : all
        var picks: [KanaChar] = []
        while picks.count < min(count, max(chosen.count * 2, 6)) { picks += chosen.shuffled() }
        return picks.prefix(count).enumerated().map { i, c in
            let others = pool.filter { $0.romaji != c.romaji }.shuffled().prefix(3)
            if i % 2 == 1 {
                var opts = others.map(\.jp) + [c.jp]
                opts.shuffle()
                return QuizQuestion(prompt: c.romaji, promptIsJapanese: false, hint: nil, speak: nil, options: opts,
                                    answer: opts.firstIndex(of: c.jp)!, optionsAreJapanese: true, kanaId: c.id)
            }
            var opts = others.map(\.romaji) + [c.romaji]
            opts.shuffle()
            return QuizQuestion(prompt: c.jp, promptIsJapanese: true, hint: nil, speak: c.jp, options: opts,
                                answer: opts.firstIndex(of: c.romaji)!, optionsAreJapanese: false, kanaId: c.id)
        }
    }
}

struct QuizSession: View {
    @Environment(AppModel.self) private var app
    var title: String
    @State var questions: [QuizQuestion]
    var onFinish: ((_ correct: Int, _ total: Int) -> Void)? = nil

    @State private var index = 0
    @State private var picked: Int?
    @State private var correct = 0
    @State private var combo = 0
    @State private var finished = false
    @State private var shake = 0

    var body: some View {
        ZStack {
            KGBackground()
            if finished || questions.isEmpty {
                ResultView(correct: correct, total: questions.count, xp: xpEarned, title: title)
            } else {
                let q = questions[index]
                VStack(spacing: 18) {
                    SessionTopBar(progress: Double(index) / Double(questions.count),
                                  trailing: combo >= 3 ? "🔥 x\(combo)" : nil)
                    HStack(alignment: .bottom) {
                        KanaBlob(mood: mood, size: 76)
                        Text(q.label ?? (q.listening ? app.t("¿Qué escuchaste?", "What did you hear?") : q.promptIsJapanese
                             ? (q.isKana ? app.t("¿Cómo se lee?", "How do you read it?") : app.t("¿Qué significa?", "What does it mean?"))
                             : app.t("¿Cómo se escribe?", "How is it written?")))
                            .kgFont(18, .bold).foregroundStyle(KG.ink)
                        Spacer()
                    }
                    .padding(.horizontal, 20)

                    VStack(spacing: 10) {
                        if q.listening && picked == nil {
                            ListenPrompt(text: q.speak ?? q.prompt)
                        } else {
                            Text(q.prompt)
                                .font(q.promptIsJapanese ? .system(size: q.prompt.count > 5 ? 44 : 80, weight: .semibold, design: .rounded)
                                                         : .kg(q.prompt.count > 28 ? 21 : 30, .bold))
                                .tracking(q.promptIsJapanese ? 0 : (q.prompt.count > 28 ? 21 : 30) * KG.tracking)
                                .foregroundStyle(KG.ink)
                                .multilineTextAlignment(.center)
                                .minimumScaleFactor(0.4)
                            if app.p.showRomaji, let hint = q.hint, picked != nil {
                                Text(hint).kgFont(16, .semibold).foregroundStyle(KG.pinkText)
                            }
                            if let s = q.speak { SpeakButton(text: s, size: 42) }
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(minHeight: 200)
                    .padding(20)
                    .sticker(radius: 32)
                    .padding(.horizontal, 20)
                    .modifier(Shake(animatableData: CGFloat(shake)))

                    LazyVGrid(columns: q.optionsAreJapanese ? [GridItem(), GridItem()] : [GridItem()], spacing: 10) {
                        ForEach(Array(q.options.enumerated()), id: \.offset) { i, opt in
                            optionButton(i, opt, q)
                        }
                    }
                    .padding(.horizontal, 20)

                    Spacer(minLength: 0)
                }
                .overlay(alignment: .bottom) {
                    if picked != nil {
                        feedbackBar(q)
                            .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                }
                .onAppear { speak(q) }
                .onChange(of: index) { speak(questions[index]) }
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.8), value: picked)
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: finished)
    }

    private var xpEarned: Int { correct * 2 + (correct == questions.count && !questions.isEmpty ? 5 : 0) }

    private var mood: Mood {
        guard let picked else { return combo >= 3 ? .wow : .curious }
        return picked == questions[index].answer ? .happy : .sad
    }

    private func speak(_ q: QuizQuestion) {
        if let s = q.speak { Speaker.shared.speak(s, rate: app.p.speechRate) }
    }

    private func optionButton(_ i: Int, _ text: String, _ q: QuizQuestion) -> some View {
        let state: (Color, Color, Color) = {
            guard let picked else { return (.white, KG.line, KG.ink) }
            if i == q.answer { return (KG.mint, KG.mintDeep, .white) }
            if i == picked { return (KG.red, KG.redDeep, .white) }
            return (.white, KG.line, KG.ink.opacity(0.35))
        }()
        return Button { pick(i, q) } label: {
            Text(text)
                .font(q.optionsAreJapanese ? .system(size: 30, weight: .semibold, design: .rounded) : .kg(18, .semibold))
                .tracking(q.optionsAreJapanese ? 0 : 18 * KG.tracking)
                .lineLimit(2)
                .minimumScaleFactor(0.6)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 12)
        }
        .buttonStyle(ChunkyButtonStyle(fill: state.0, lip: state.1, foreground: state.2, radius: 18,
                                       height: q.optionsAreJapanese ? 76 : 58))
        .disabled(picked != nil)
        .answerFeedback(picked == nil ? nil : i == q.answer ? .correct : i == picked ? .wrong : nil)
    }

    private func pick(_ i: Int, _ q: QuizQuestion) {
        picked = i
        let ok = i == q.answer
        if ok {
            correct += 1
            combo += 1
            SoundPlayer.shared.play(.correct)
        } else {
            combo = 0
            withAnimation(.default) { shake += 1 }
            SoundPlayer.shared.play(.wrong)
        }
        if let id = q.kanaId { app.markKana(id, correct: ok) }
    }

    private func feedbackBar(_ q: QuizQuestion) -> some View {
        let ok = picked == q.answer
        return VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                HugeIcon(ok ? .checkCircle : .cancelCircle, size: 30, filled: true)
                VStack(alignment: .leading, spacing: 2) {
                    Text(ok ? ["¡Sugoi!", "¡Perfecto!", "¡Eso es!"].randomElement()! : app.t("Casi…", "Almost…"))
                        .kgFont(20, .bold)
                    if !ok {
                        Text(app.t("Respuesta: ", "Answer: ") + q.options[q.answer]).kgFont(15, .semibold)
                    }
                }
                Spacer()
            }
            .foregroundStyle(ok ? KG.mintDeep : KG.redDeep)
            Button(app.t("Continuar", "Continue")) { advance() }
                .buttonStyle(ok ? .chunkyMint : .chunkyRed)
        }
        .padding(20)
        .background(
            ZStack {
                KG.cream
                (ok ? KG.mint : KG.red).opacity(0.14)
            }
            .clipShape(UnevenRoundedRectangle(topLeadingRadius: 28, topTrailingRadius: 28, style: .continuous))
            .ignoresSafeArea(edges: .bottom)
        )
        .sensoryFeedback(ok ? .success : .error, trigger: picked)
    }

    private func advance() {
        picked = nil
        if index + 1 >= questions.count {
            app.addXP(xpEarned)
            onFinish?(correct, questions.count)
            SoundPlayer.shared.play(.finish)
            finished = true
        } else {
            index += 1
        }
    }
}

struct Shake: GeometryEffect {
    var animatableData: CGFloat
    func effectValue(size: CGSize) -> ProjectionTransform {
        ProjectionTransform(CGAffineTransform(translationX: 10 * sin(animatableData * .pi * 4), y: 0))
    }
}

// MARK: - Result

struct ResultView: View {
    @Environment(AppModel.self) private var app
    @Environment(\.dismiss) private var dismiss
    var correct: Int
    var total: Int
    var xp: Int
    var title: String

    @State private var appear = false

    private var pct: Int { total == 0 ? 0 : Int((Double(correct) / Double(total) * 100).rounded()) }
    private var mood: Mood { pct >= 90 ? .love : pct >= 70 ? .happy : pct >= 40 ? .meh : .sad }

    var body: some View {
        VStack(spacing: 22) {
            Spacer()
            ZStack {
                if appear && pct >= 40 {
                    ConfettiBurst(count: pct >= 90 ? 40 : pct >= 70 ? 28 : 14, spread: pct >= 70 ? 1 : 0.7)
                }
                KanaBlob(mood: mood, size: 150)
                    .scaleEffect(appear ? 1 : 0.4)
                if pct >= 70 {
                    StickerArt(pct >= 90 ? .crown : .party, size: 64)
                        .rotationEffect(.degrees(appear ? 14 : -30))
                        .offset(x: 96, y: -70)
                        .scaleEffect(appear ? 1 : 0.2)
                }
            }
            Text(pct >= 70 ? app.t("¡Excelente!", "Awesome!") : pct >= 40 ? app.t("¡Bien hecho!", "Nice work!") : app.t("¡Sigue así!", "Keep going!"))
                .kgFont(34, .bold).foregroundStyle(KG.ink)
            Text(title).kgFont(16, .semibold).foregroundStyle(KG.muted).multilineTextAlignment(.center)
            HStack(spacing: 12) {
                resultBox("\(appear ? pct : 0)%", app.t("precisión", "accuracy"), KG.mint, .target, index: 0)
                resultBox("+\(appear ? xp : 0)", "XP", KG.sun, .star, filled: true, index: 1)
                resultBox("\(app.p.streak)", app.t("racha", "streak"), KG.flame, .fire, filled: true, index: 2)
            }
            .padding(.horizontal, 20)
            Spacer()
            Button(app.t("Continuar", "Continue")) { dismiss() }
                .buttonStyle(.chunky)
                .padding(.horizontal, 20)
                .padding(.bottom, 10)
        }
        .onAppear { withAnimation(.spring(response: 0.6, dampingFraction: 0.6)) { appear = true } }
        .sensoryFeedback(.success, trigger: appear)
    }

    private func resultBox(_ v: String, _ label: String, _ color: Color, _ icon: HI, filled: Bool = false, index: Int) -> some View {
        VStack(spacing: 6) {
            HugeIcon(icon, size: 22, filled: filled).foregroundStyle(color)
            Text(v).kgFont(24, .bold).foregroundStyle(KG.ink)
                .contentTransition(.numericText())
                .animation(.easeOut(duration: 0.9).delay(0.35), value: appear)
            Text(label).kgFont(12, .semibold).foregroundStyle(KG.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .sticker(radius: 22, border: color.opacity(0.4), lineWidth: 3)
        .opacity(appear ? 1 : 0)
        .offset(y: appear ? 0 : 18)
        .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(0.2 + Double(index) * 0.08), value: appear)
    }
}
