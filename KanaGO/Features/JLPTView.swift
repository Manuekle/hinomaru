import SwiftUI

// MARK: - Level panel (Learn → JLPT)

struct JLPTPanel: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router
    var level: String
    @State private var showCertificate = false

    var body: some View {
        if let data = app.content.jlptLevel(level) {
            VStack(alignment: .leading, spacing: 14) {
                MascotSays(mood: .wow,
                           text: app.t("Preguntas en formato real del JLPT. Aprueba el simulacro con \(JLPT.passMark)% y gana tu certificado.",
                                       "Real JLPT-style questions. Pass the mock test with \(JLPT.passMark)% to earn your certificate."),
                           size: 66)
                mockCard(data)
                SectionTitle(app.t("Por secciones", "By section"), jp: "セクション")
                    .padding(.top, 4)
                ForEach(data.sections, id: \.type) { section in
                    Button { router.session = .jlpt(level: level, kind: section.type) } label: {
                        sectionRow(section)
                    }
                    .buttonStyle(.squish)
                }
                if app.p.jlptPassed[level] != nil {
                    Button { showCertificate = true } label: { certificateRow }
                        .buttonStyle(.squish)
                }
            }
            .sheet(isPresented: $showCertificate) { CertificateSheet(level: level) }
        }
    }

    private func mockCard(_ data: JLPTLevel) -> some View {
        let best = app.jlptBest(level, .mock)
        return ZStack(alignment: .topTrailing) {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(LinearGradient(colors: [KG.ink, KG.inkDeep], startPoint: .topLeading, endPoint: .bottomTrailing))
            Text(level)
                .kgFont(120, .heavy).italic()
                .foregroundStyle(.white.opacity(0.07))
                .offset(x: 6, y: -18)
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("模擬試験 · \(level)").kgFont(14, .semibold).foregroundStyle(KG.candy)
                        Text(app.t("Simulacro JLPT", "JLPT mock test")).kgFont(26, .bold).foregroundStyle(.white)
                        Text(app.t("\(JLPT.mockQuestions) preguntas · \(JLPT.mockMinutes) min · aprueba con \(JLPT.passMark)%",
                                   "\(JLPT.mockQuestions) questions · \(JLPT.mockMinutes) min · pass at \(JLPT.passMark)%"))
                            .kgText(13, .medium).foregroundStyle(.white.opacity(0.7))
                    }
                    Spacer(minLength: 8)
                    if let best {
                        VStack(spacing: 0) {
                            Text("\(best)%").kgFont(22, .bold).foregroundStyle(best >= JLPT.passMark ? KG.mint : KG.sun)
                            Text(app.t("mejor", "best")).kgFont(11, .semibold).foregroundStyle(.white.opacity(0.6))
                        }
                    }
                }
                Button { router.session = .jlpt(level: level, kind: .mock) } label: {
                    Label(app.t("Hacer simulacro", "Take the mock test"), hi: .exam)
                }
                .buttonStyle(ChunkyButtonStyle(fill: KG.pink, lip: KG.pinkDeep))
            }
            .padding(20)
        }
        .clipShape(RoundedRectangle(cornerRadius: 30, style: .continuous))
        .shadow(color: KG.ink.opacity(0.25), radius: 16, y: 8)
    }

    private func sectionRow(_ section: JLPTSection) -> some View {
        let best = app.jlptBest(level, section.type)
        return HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 18, style: .continuous).fill(KG.levelColor(level).opacity(0.16))
                Text(section.type.jp).kgFont(17, .bold).foregroundStyle(KG.levelColor(level) == KG.ink ? KG.ink : KG.levelColor(level))
            }
            .frame(width: 58, height: 58)
            VStack(alignment: .leading, spacing: 4) {
                Text(section.type.title(app)).kgFont(17, .bold).foregroundStyle(KG.ink)
                Text(app.t("\(section.questionCount) preguntas · \(section.duration) min",
                           "\(section.questionCount) questions · \(section.duration) min"))
                    .kgText(13).foregroundStyle(KG.muted)
            }
            Spacer(minLength: 0)
            if let best {
                Pill(text: "\(best)%", color: best >= JLPT.passMark ? KG.mint : KG.sun,
                     foreground: best >= JLPT.passMark ? .white : KG.ink)
            }
            HugeIcon(.chevronRight, size: 18).foregroundStyle(KG.line)
        }
        .padding(14)
        .sticker(radius: 24)
    }

    private var certificateRow: some View {
        HStack(spacing: 14) {
            HugeIcon(.award, size: 28)
                .foregroundStyle(KG.sunDeep)
                .frame(width: 58, height: 58)
                .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(KG.sun.opacity(0.2)))
            VStack(alignment: .leading, spacing: 4) {
                Text(app.t("Tu certificado \(level)", "Your \(level) certificate")).kgFont(17, .bold).foregroundStyle(KG.ink)
                Text(app.t("Míralo y compártelo", "View and share it")).kgText(13).foregroundStyle(KG.muted)
            }
            Spacer(minLength: 0)
            HugeIcon(.share, size: 20).foregroundStyle(KG.pinkDeep)
        }
        .padding(14)
        .sticker(KG.sun.opacity(0.12), radius: 24, border: KG.sun, lineWidth: 2)
    }
}

// MARK: - Exam session

struct ExamSession: View {
    @Environment(AppModel.self) private var app
    @Environment(\.dismiss) private var dismiss
    var level: JLPTLevel
    var kind: JLPTKind

    private enum Phase { case intro, exam, result }

    @State private var phase: Phase = .intro
    @State private var items: [ExamItem] = []
    @State private var answers: [Int?] = []
    @State private var index = 0
    @State private var startedAt = Date.now
    @State private var timeUsed = 0
    @State private var xp = 0
    @State private var showCertificate = false
    @State private var newlyPassed = false

    private var minutes: Int { kind == .mock ? JLPT.mockMinutes : (level.section(kind)?.duration ?? 20) }
    private var deadline: Date { startedAt.addingTimeInterval(Double(minutes * 60)) }
    private var questionCount: Int { kind == .mock ? JLPT.mockQuestions : (level.section(kind)?.questionCount ?? 0) }
    private var correct: Int { zip(items, answers).filter { $0.1 == $0.0.answer }.count }
    private var pct: Int { items.isEmpty ? 0 : Int((Double(correct) / Double(items.count) * 100).rounded()) }
    private var passed: Bool { pct >= JLPT.passMark }
    private var title: String { "\(level.level) · \(kind.jp)" }

    var body: some View {
        ZStack {
            KGBackground()
            switch phase {
            case .intro: intro
            case .exam: exam
            case .result: result
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: phase)
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: index)
        .task(id: phase) {
            // time's up: whatever is unanswered counts as wrong
            guard phase == .exam else { return }
            try? await Task.sleep(for: .seconds(max(deadline.timeIntervalSinceNow, 0)))
            if !Task.isCancelled { finish() }
        }
        .onDisappear { Speaker.shared.stop() }
        .sheet(isPresented: $showCertificate) { CertificateSheet(level: level.level) }
    }

    // MARK: Intro

    private var intro: some View {
        VStack(spacing: 18) {
            SessionTopBar(progress: 0)
            Spacer(minLength: 0)
            KanaBlob(mood: .wow, size: 120)
            VStack(spacing: 6) {
                Text(title).kgFont(34, .bold).foregroundStyle(KG.ink)
                Text(kind == .mock ? app.t("Simulacro JLPT", "JLPT mock test") : kind.title(app))
                    .kgFont(17, .semibold).foregroundStyle(KG.pinkText)
            }
            HStack(spacing: 10) {
                infoBox("\(questionCount)", app.t("preguntas", "questions"), .quiz, KG.pink)
                infoBox("\(minutes)", "min", .timer, KG.sky)
                infoBox("\(JLPT.passMark)%", app.t("para aprobar", "to pass"), .target, KG.mint)
            }
            .padding(.horizontal, 20)
            Text(introTip)
                .kgText(15).foregroundStyle(KG.inkSoft)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 30)
            if let best = app.jlptBest(level.level, kind) {
                Pill(text: app.t("Tu mejor: \(best)%", "Your best: \(best)%"), color: KG.paper, foreground: KG.inkSoft, icon: .star)
            }
            Spacer(minLength: 0)
            Button(app.t("Empezar", "Start"), action: start)
                .buttonStyle(.chunky)
                .padding(.horizontal, 20)
                .padding(.bottom, 10)
        }
    }

    private var introTip: String {
        switch kind {
        case .listening:
            return app.t("Escucha cada diálogo (puedes repetirlo) y elige la mejor respuesta.",
                         "Listen to each dialogue (you can replay it) and pick the best answer.")
        case .mock:
            return app.t("Vocabulario y gramática mezclados, contra reloj. Si apruebas, ganas tu certificado.",
                         "Mixed vocabulary and grammar against the clock. Pass it to earn your certificate.")
        default:
            return app.t("Lee cada enunciado y elige la mejor opción. Verás la respuesta al instante.",
                         "Read each prompt and pick the best option. You'll see the answer right away.")
        }
    }

    private func infoBox(_ value: String, _ label: String, _ icon: HI, _ color: Color) -> some View {
        VStack(spacing: 6) {
            HugeIcon(icon, size: 22).foregroundStyle(color)
            Text(value).kgFont(24, .bold).foregroundStyle(KG.ink)
            Text(label).kgFont(12, .semibold).foregroundStyle(KG.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .sticker(radius: 22)
    }

    private func start() {
        items = kind == .mock ? ExamItem.mock(level) : ExamItem.section(level, kind)
        answers = Array(repeating: nil, count: items.count)
        index = 0
        startedAt = .now
        timeUsed = 0
        xp = 0
        newlyPassed = false
        phase = .exam
    }

    // MARK: Exam

    @ViewBuilder
    private var exam: some View {
        if let item = items[safe: index] {
            let picked = answers[index]
            VStack(spacing: 12) {
                SessionTopBar(progress: Double(index) / Double(max(items.count, 1)), trailingView: AnyView(ExamTimer(deadline: deadline)))
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack(spacing: 8) {
                            Pill(text: item.mondai.title, color: KG.levelColor(level.level) == KG.ink ? KG.pink : KG.levelColor(level.level))
                            if kind == .mock { Pill(text: item.kind.jp, color: KG.paper, foreground: KG.inkSoft) }
                            Spacer()
                            Text("\(index + 1)/\(items.count)").kgFont(14, .bold).foregroundStyle(KG.muted).monospacedDigit()
                        }
                        Text(item.mondai.instruction)
                            .kgText(13).foregroundStyle(KG.muted)
                            .fixedSize(horizontal: false, vertical: true)

                        if let dialogue = item.question.dialogue {
                            DialogueButton(lines: dialogue)
                                .id(item.id)
                        }

                        sentence(item.question)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(18)
                            .sticker(radius: 24)

                        VStack(spacing: 10) {
                            ForEach(Array(item.choices.enumerated()), id: \.offset) { i, choice in
                                choiceButton(i, choice, item: item, picked: picked)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
                }
                .scrollBounceBehavior(.basedOnSize)
                .id(index)
                .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                        removal: .move(edge: .leading).combined(with: .opacity)))

                if let picked {
                    feedback(item, picked: picked)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .animation(.spring(response: 0.3, dampingFraction: 0.85), value: picked)
        }
    }

    /// The prompt with the tested word underlined, as in the printed exam.
    private func sentence(_ q: JLPTQuestion) -> some View {
        var text = AttributedString(q.sentence)
        text.font = .system(size: q.sentence.count > 80 ? 17 : 21, weight: .semibold, design: .rounded)
        text.foregroundColor = KG.ink
        if let u = q.underlined, !u.isEmpty, let range = text.range(of: u) {
            text[range].underlineStyle = Text.LineStyle(pattern: .solid, color: KG.pinkDeep)
            text[range].foregroundColor = KG.pinkDeep
        }
        return Text(text).lineSpacing(6).fixedSize(horizontal: false, vertical: true)
    }

    private func choiceButton(_ i: Int, _ choice: String, item: ExamItem, picked: Int?) -> some View {
        let state: (fill: Color, border: Color, fg: Color) = {
            guard let picked else { return (.white, .white, KG.ink) }
            if i == item.answer { return (KG.mint.opacity(0.16), KG.mint, KG.ink) }
            if i == picked { return (KG.red.opacity(0.12), KG.red, KG.ink) }
            return (.white, .white, KG.muted)
        }()
        return Button { pick(i, item: item) } label: {
            HStack(alignment: .top, spacing: 12) {
                Text("\(i + 1)")
                    .kgFont(15, .bold)
                    .foregroundStyle(picked == nil ? KG.pinkText : (i == item.answer ? KG.mintDeep : (i == picked ? KG.redDeep : KG.muted)))
                    .frame(width: 30, height: 30)
                    .background(Circle().fill(picked == nil ? KG.pinkSoft : KG.cream))
                Text(choice)
                    .font(.system(size: 18, weight: .semibold, design: .rounded))
                    .foregroundStyle(state.fg)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                    .padding(.top, 3)
                Spacer(minLength: 0)
            }
            .padding(14)
            .sticker(state.fill, radius: 20, border: state.border, lineWidth: picked == nil ? 0 : 3)
        }
        .buttonStyle(.squish)
        .disabled(picked != nil)
        .answerFeedback(picked == nil ? nil : i == item.answer ? .correct : i == picked ? .wrong : nil)
    }

    private func feedback(_ item: ExamItem, picked: Int) -> some View {
        let ok = picked == item.answer
        return VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                HugeIcon(ok ? .checkCircle : .cancelCircle, size: 26, filled: true)
                Text(ok ? app.t("正解 · ¡Correcto!", "正解 · Correct!") : app.t("Era la \(item.answer + 1)", "It was #\(item.answer + 1)"))
                    .kgFont(19, .bold)
                Spacer()
            }
            .foregroundStyle(ok ? KG.mintDeep : KG.redDeep)
            Button(index + 1 >= items.count ? app.t("Ver resultado", "See results") : app.t("Continuar", "Continue"), action: next)
                .buttonStyle(ok ? .chunkyMint : .chunkyRed)
        }
        .padding(.horizontal, 20)
        .padding(.top, 14)
        .padding(.bottom, 10)
        .background((ok ? KG.mint : KG.red).opacity(0.12).ignoresSafeArea(edges: [.bottom, .horizontal]))
    }

    private func pick(_ i: Int, item: ExamItem) {
        guard answers[index] == nil else { return }
        answers[index] = i
        SoundPlayer.shared.play(i == item.answer ? .correct : .wrong)
    }

    private func next() {
        Speaker.shared.stop()
        if index + 1 >= items.count { finish() } else { index += 1 }
    }

    private func finish() {
        guard phase == .exam else { return }
        Speaker.shared.stop()
        timeUsed = min(Int(Date.now.timeIntervalSince(startedAt)), minutes * 60)
        let wasPassed = app.p.jlptPassed[level.level] != nil
        app.recordJLPT(level.level, kind, pct: pct)
        newlyPassed = !wasPassed && app.p.jlptPassed[level.level] != nil
        xp = correct * 3 + (passed ? 20 : 0)
        app.addXP(xp)
        SoundPlayer.shared.play(.finish)
        if newlyPassed { SoundPlayer.shared.play(.unlock, after: 1.0) }
        phase = .result
    }

    // MARK: Result

    private var result: some View {
        let mistakes = items.indices.filter { answers[$0] != items[$0].answer }
        return VStack(spacing: 0) {
            SessionTopBar(progress: 1)
            ScrollView {
                VStack(spacing: 18) {
                    KanaBlob(mood: passed ? .love : (pct >= 40 ? .meh : .sad), size: 130)
                        .background { if passed { ConfettiBurst(count: 36) } }
                        .overlay(alignment: .topTrailing) {
                            if passed { StickerArt(.crown, size: 56).rotationEffect(.degrees(14)).offset(x: 18, y: -22) }
                        }
                        .padding(.top, 10)
                    VStack(spacing: 4) {
                        Text(passed ? "合格！" : "不合格").kgFont(18, .bold).foregroundStyle(passed ? KG.mintDeep : KG.redDeep)
                        Text(passed ? app.t("¡Aprobaste!", "You passed!") : app.t("¡Casi! Sigue practicando", "Almost! Keep practicing"))
                            .kgFont(30, .bold).foregroundStyle(KG.ink)
                            .multilineTextAlignment(.center)
                        Text(title).kgFont(15, .semibold).foregroundStyle(KG.muted)
                    }
                    HStack(spacing: 10) {
                        infoBox("\(pct)%", app.t("puntaje", "score"), .target, passed ? KG.mint : KG.sun)
                        infoBox("\(correct)/\(items.count)", app.t("correctas", "correct"), .checkCircle, KG.pink)
                        infoBox(String(format: "%d:%02d", timeUsed / 60, timeUsed % 60), app.t("tiempo", "time"), .timer, KG.sky)
                    }
                    Pill(text: "+\(xp) XP", color: KG.sun, foreground: KG.ink, icon: .star)

                    if kind == .mock, app.p.jlptPassed[level.level] != nil {
                        Button { showCertificate = true } label: {
                            Label(newlyPassed ? app.t("¡Certificado desbloqueado!", "Certificate unlocked!") : app.t("Ver certificado", "View certificate"),
                                  hi: .award)
                        }
                        .buttonStyle(ChunkyButtonStyle(fill: KG.sun, lip: KG.sunDeep, foreground: KG.ink))
                    }

                    if !mistakes.isEmpty {
                        SectionTitle(app.t("Repasa tus errores", "Review your mistakes"), jp: "まちがい")
                            .padding(.top, 6)
                        ForEach(mistakes, id: \.self) { i in mistakeRow(items[i], picked: answers[i]) }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
            HStack(spacing: 10) {
                Button(app.t("Otra vez", "Again"), action: start)
                    .buttonStyle(ChunkyButtonStyle(fill: .white, lip: KG.line, foreground: KG.ink))
                Button(app.t("Listo", "Done")) { dismiss() }
                    .buttonStyle(.chunky)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 10)
        }
        .sensoryFeedback(.success, trigger: passed)
    }

    private func mistakeRow(_ item: ExamItem, picked: Int?) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            sentence(item.question)
                .lineLimit(4)
            if let picked {
                answerLine(.cancelCircle, item.choices[picked], KG.redDeep)
            } else {
                answerLine(.timer, app.t("Sin responder", "Not answered"), KG.muted)
            }
            answerLine(.checkCircle, item.choices[item.answer], KG.mintDeep)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .sticker(radius: 20)
    }

    private func answerLine(_ icon: HI, _ text: String, _ color: Color) -> some View {
        HStack(alignment: .top, spacing: 8) {
            HugeIcon(icon, size: 18).foregroundStyle(color)
            Text(text).kgFont(15, .semibold).foregroundStyle(color)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}

/// Countdown that redraws itself, so the exam above it doesn't re-render every second.
struct ExamTimer: View {
    var deadline: Date

    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            let left = max(Int(deadline.timeIntervalSince(context.date).rounded(.up)), 0)
            let critical = left <= 60
            HStack(spacing: 4) {
                HugeIcon(.timer, size: 15)
                Text(String(format: "%d:%02d", left / 60, left % 60))
                    .monospacedDigit()
            }
            .kgFont(14, .bold)
            .foregroundStyle(critical ? .white : KG.ink)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Capsule().fill(critical ? KG.red : .white))
        }
    }
}

/// Plays a listening dialogue with two voices; replays on tap.
struct DialogueButton: View {
    @Environment(AppModel.self) private var app
    var lines: [JLPTLine]
    @State private var plays = 0

    var body: some View {
        Button(action: play) {
            HStack(spacing: 14) {
                HugeIcon(plays == 0 ? .play : .restart, size: 26, filled: true)
                    .foregroundStyle(.white)
                    .frame(width: 56, height: 56)
                    .background(Circle().fill(KG.sky))
                VStack(alignment: .leading, spacing: 2) {
                    Text(plays == 0 ? app.t("Escuchar diálogo", "Play dialogue") : app.t("Escuchar otra vez", "Play again"))
                        .kgFont(17, .bold).foregroundStyle(KG.ink)
                    Text(app.t("\(lines.count) líneas · dos voces", "\(lines.count) lines · two voices"))
                        .kgFont(12, .semibold).foregroundStyle(KG.muted)
                }
                Spacer(minLength: 0)
                HugeIcon(.headphones, size: 22).foregroundStyle(KG.sky)
            }
            .padding(12)
            .sticker(radius: 22, border: KG.sky.opacity(0.5), lineWidth: 2)
        }
        .buttonStyle(.squish)
        .onAppear(perform: play)
    }

    private func play() {
        plays += 1
        Speaker.shared.speakDialogue(lines, rate: app.p.speechRate)
    }
}

// MARK: - Certificate

struct CertificateSheet: View {
    @Environment(AppModel.self) private var app
    @Environment(\.dismiss) private var dismiss
    @Environment(\.displayScale) private var displayScale
    var level: String
    @State private var image: Image?

    var body: some View {
        ZStack {
            KG.cream.ignoresSafeArea()
            VStack(spacing: 18) {
                HStack {
                    Spacer()
                    Button { dismiss() } label: {
                        HugeIcon(.cancel, size: 22).foregroundStyle(KG.muted).frame(width: 40, height: 40)
                    }
                }
                Spacer(minLength: 0)
                CertificateCard(level: level, app: app)
                    .padding(.horizontal, 20)
                Spacer(minLength: 0)
                if let image {
                    ShareLink(item: image, preview: SharePreview("KanaGO! JLPT \(level)", image: image)) {
                        Label(app.t("Compartir", "Share"), hi: .share)
                    }
                    .buttonStyle(.chunky)
                    .padding(.horizontal, 20)
                }
            }
            .padding(.bottom, 10)
        }
        .task {
            let renderer = ImageRenderer(content: CertificateCard(level: level, app: app).frame(width: 360))
            renderer.scale = max(displayScale, 3)
            if let ui = renderer.uiImage { image = Image(uiImage: ui) }
        }
    }
}

/// Self-contained so ImageRenderer can draw it outside the view tree.
struct CertificateCard: View {
    var level: String
    var app: AppModel

    private var date: String {
        let f = DateFormatter()
        f.locale = Locale(identifier: app.lang == .es ? "es" : "en")
        f.dateStyle = .long
        return f.string(from: app.p.jlptPassed[level] ?? .now)
    }

    var body: some View {
        VStack(spacing: 14) {
            HStack {
                Text("合格証明書").kgFont(14, .bold).foregroundStyle(KG.pinkText)
                Spacer()
                Pill(text: "JLPT \(level)", color: KG.levelColor(level) == KG.ink ? KG.pink : KG.levelColor(level))
            }
            KanaBlob(mood: .love, size: 96, animated: false)
                .overlay(alignment: .topTrailing) {
                    StickerArt(.crown, size: 44).rotationEffect(.degrees(14)).offset(x: 14, y: -18)
                }
            VStack(spacing: 4) {
                Text(app.t("Certificado de práctica", "Practice certificate"))
                    .kgFont(15, .semibold).foregroundStyle(KG.muted)
                Text(app.p.name.isEmpty ? app.t("Estudiante de KanaGO!", "KanaGO! learner") : app.p.name)
                    .kgFont(28, .bold).foregroundStyle(KG.ink)
                    .multilineTextAlignment(.center)
                Text(app.t("aprobó el simulacro JLPT \(level)", "passed the JLPT \(level) mock test"))
                    .kgText(15, .medium).foregroundStyle(KG.inkSoft)
            }
            HStack(spacing: 8) {
                ForEach([JLPTKind.vocabulary, .grammar, .mock], id: \.self) { kind in
                    VStack(spacing: 2) {
                        Text(app.jlptBest(level, kind).map { "\($0)%" } ?? "—").kgFont(20, .bold).foregroundStyle(KG.ink)
                        Text(kind.jp).kgFont(12, .semibold).foregroundStyle(KG.muted)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(KG.cream))
                }
            }
            HStack {
                Text(date).kgFont(12, .semibold).foregroundStyle(KG.muted)
                Spacer()
                Text("KanaGO!").kgFont(16, .heavy).italic().foregroundStyle(KG.pinkDeep)
            }
            Text(app.t("Simulacro no oficial. JLPT es una marca de The Japan Foundation y JEES.",
                       "Unofficial practice test. JLPT is a trademark of The Japan Foundation and JEES."))
                .kgText(10).foregroundStyle(KG.muted)
                .multilineTextAlignment(.center)
        }
        .padding(22)
        .background(RoundedRectangle(cornerRadius: 30, style: .continuous).fill(.white))
        .overlay(RoundedRectangle(cornerRadius: 30, style: .continuous).strokeBorder(KG.pinkSoft, lineWidth: 6))
        .environment(app)
    }
}
