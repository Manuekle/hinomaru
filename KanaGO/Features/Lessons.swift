import SwiftUI

// MARK: - Lesson content

/// One thing a lesson teaches: a kana, a word, a kanji or a grammar pattern.
struct LessonItem: Hashable, Identifiable {
    enum Kind { case kana, kanji, vocab, grammar }

    let id: String
    let jp: String
    let reading: String?
    let meaning: String
    let note: String?
    let example: String?
    let exampleMeaning: String?
    let exampleRomaji: String?
    let speak: String
    let kind: Kind
    /// SRS key for deck cards, kana id for alphabet items.
    let srsKey: String?
    let kanaId: String?

    var writable: Bool {
        (kind == .kana || kind == .kanji) && (1...3).contains(jp.count)
    }

    var buildChunks: [String]? {
        guard let example, exampleMeaning != nil else { return nil }
        let c = SentenceBuilder.chunks(example)
        return (2...7).contains(c.count) ? c : nil
    }
}

extension ContentStore {
    func items(for unit: RoadmapUnit, lang: Lang) -> [LessonItem] {
        if let groups = unit.source.groups {
            let all = alphabet.sections.flatMap(\.groups)
            return groups.flatMap { gid in all.first { $0.id == gid }?.chars ?? [] }.map { c in
                LessonItem(id: c.id, jp: c.jp, reading: nil, meaning: c.romaji, note: nil, example: nil,
                           exampleMeaning: nil, exampleRomaji: nil, speak: c.jp, kind: .kana, srsKey: nil, kanaId: c.id)
            }
        }
        guard let deckId = unit.source.deck, let deck = deck(deckId) else { return [] }
        if deck.isGrammar {
            let slice = Self.slice(deck.grammar, unit.source)
            return slice.map { g in
                let ex = g.examples.first
                return LessonItem(id: "\(deck.id)#\(g.pattern)", jp: g.pattern, reading: nil, meaning: g.meaning(lang),
                                  note: g.usage, example: ex?.jp, exampleMeaning: ex.map { lang == .es ? $0.es : $0.en },
                                  exampleRomaji: nil, speak: ex?.jp ?? g.pattern, kind: .grammar, srsKey: nil, kanaId: nil)
            }
        }
        let kind: LessonItem.Kind = ["Hiragana", "Katakana"].contains(deck.kind) ? .kana : deck.kind == "Kanji" ? .kanji : .vocab
        return Self.slice(deck.cards, unit.source).map { c in
            let meaning = c.meaning(lang)
            return LessonItem(id: deck.cardKey(c), jp: c.jp, reading: c.romaji != meaning ? c.romaji : nil, meaning: meaning,
                              note: nil, example: c.example != c.jp ? c.example : nil, exampleMeaning: c.exampleMeaning(lang),
                              exampleRomaji: c.exampleRomaji, speak: c.kana ?? c.jp, kind: kind,
                              srsKey: deck.cardKey(c), kanaId: nil)
        }
    }

    private static func slice<T>(_ list: [T], _ source: UnitSource) -> [T] {
        let start = max(0, min(source.start ?? 0, list.count))
        let end = max(start, min(source.end ?? list.count, list.count))
        return Array(list[start..<end])
    }
}

// MARK: - Steps

enum StepKind: Hashable {
    case intro, recognize, reverse, listen, type, match, build, write
}

struct LessonStep: Identifiable, Hashable {
    let id = UUID()
    let kind: StepKind
    let items: [LessonItem]   // one item, or several for match
    var retries = 0

    var item: LessonItem { items[0] }
}

enum LessonPlanner {
    static func steps(for type: String, items: [LessonItem]) -> [LessonStep] {
        guard !items.isEmpty else { return [] }
        let picked = Array(items.shuffled().prefix(type == "learn" ? 5 : 6))
        var steps: [LessonStep] = []

        for item in picked {
            for kind in pool(type, item) where available(kind, item) {
                steps.append(LessonStep(kind: kind, items: [item]))
            }
        }
        if ["practice", "review"].contains(type), picked.count >= 3 {
            steps.append(LessonStep(kind: .match, items: Array(picked.prefix(4))))
        }
        var ordered = interleave(steps.shuffled())
        ordered = Array(ordered.prefix(12))
        if type == "learn" {
            ordered = picked.map { LessonStep(kind: .intro, items: [$0]) } + ordered
        }
        return ordered
    }

    private static func pool(_ type: String, _ item: LessonItem) -> [StepKind] {
        let grammar = item.kind == .grammar
        switch type {
        case "learn": return grammar ? [.recognize, .build] : [.recognize, .listen, .write]
        case "practice": return grammar ? [.reverse, .build] : [.reverse, .type, .build]
        case "speak": return grammar ? [.listen, .build] : [.listen, .listen]
        case "quiz": return grammar ? [.recognize, .reverse, .build] : [.recognize, .reverse, .type]
        default: return grammar ? [.reverse, .build] : [.type, .write, .build, .reverse]
        }
    }

    private static func available(_ kind: StepKind, _ item: LessonItem) -> Bool {
        switch kind {
        case .write: return item.writable
        case .build: return item.buildChunks != nil
        case .type: return item.kind != .grammar && item.meaning.count <= 40
        default: return true
        }
    }

    /// Avoids two steps of the same kind or about the same item back to back.
    private static func interleave(_ steps: [LessonStep]) -> [LessonStep] {
        var remaining = steps
        var out: [LessonStep] = []
        while !remaining.isEmpty {
            let last = out.last
            let idx = remaining.firstIndex { $0.kind != last?.kind && $0.item.id != last?.item.id }
                ?? remaining.firstIndex { $0.kind != last?.kind }
                ?? 0
            out.append(remaining.remove(at: idx))
        }
        return out
    }
}

// MARK: - Session

struct LessonSession: View {
    @Environment(AppModel.self) private var app
    var level: RoadmapLevel
    var unit: RoadmapUnit
    var lesson: RoadmapLesson

    @State private var pool: [LessonItem] = []
    @State private var queue: [LessonStep] = []
    @State private var current: LessonStep?
    @State private var planned = 0
    @State private var done = 0
    @State private var correct = 0
    @State private var mistakes = 0
    @State private var finished = false

    private var accuracy: Int {
        let total = correct + mistakes
        return total == 0 ? 100 : Int((Double(correct) / Double(total) * 100).rounded())
    }

    var body: some View {
        ZStack {
            KGBackground()
            if finished {
                ResultView(correct: correct, total: correct + mistakes, xp: 10 + correct, title: lesson.title(app.lang))
            } else if let step = current {
                VStack(spacing: 0) {
                    SessionTopBar(progress: Double(done) / Double(max(planned, 1)))
                    stepView(step)
                        .id(step.id)
                        .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                                removal: .move(edge: .leading).combined(with: .opacity)))
                }
            } else {
                VStack(spacing: 16) {
                    KanaBlob(mood: .meh, size: 120)
                    Text(app.t("Esta lección aún no tiene contenido.", "This lesson has no content yet."))
                        .kgFont(18, .bold).foregroundStyle(KG.ink)
                }
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: current?.id)
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: finished)
        .onAppear(perform: start)
    }

    @ViewBuilder
    private func stepView(_ step: LessonStep) -> some View {
        let finish: (Bool) -> Void = { ok in answer(step, ok) }
        switch step.kind {
        case .intro:
            IntroStep(item: step.item) { answer(step, true, counts: false) }
        case .recognize:
            ChoiceStep(item: step.item, pool: pool, prompt: .japanese, onDone: finish)
        case .reverse:
            ChoiceStep(item: step.item, pool: pool, prompt: .meaning, onDone: finish)
        case .listen:
            ChoiceStep(item: step.item, pool: pool, prompt: .audio, onDone: finish)
        case .type:
            TypeStep(item: step.item, onDone: finish)
        case .match:
            MatchStep(items: step.items, onDone: finish)
        case .build:
            BuildStep(item: step.item, pool: pool, onDone: finish)
        case .write:
            WriteStep(item: step.item, guided: lesson.type == "learn", onDone: finish)
        }
    }

    private func start() {
        guard current == nil, !finished else { return }
        pool = app.content.items(for: unit, lang: app.lang)
        var steps = LessonPlanner.steps(for: lesson.type, items: pool)
        planned = steps.count
        current = steps.isEmpty ? nil : steps.removeFirst()
        queue = steps
    }

    private func answer(_ step: LessonStep, _ ok: Bool, counts: Bool = true) {
        if counts {
            if ok {
                correct += 1
                record(step)
            } else {
                mistakes += 1
            }
        }
        if ok || step.retries >= 2 {
            done += 1
        } else {
            // retry soon, but not right away
            var again = LessonStep(kind: step.kind, items: step.items)
            again.retries = step.retries + 1
            queue.insert(again, at: min(2, queue.count))
        }
        if queue.isEmpty {
            complete()
        } else {
            current = queue.removeFirst()
        }
    }

    /// Lessons feed the rest of the app: seen cards enter SRS, kana count toward mastery.
    private func record(_ step: LessonStep) {
        for item in step.items {
            if let id = item.kanaId { app.markKana(id, correct: true) }
            if let key = item.srsKey, app.state(key) == nil { app.grade(key, .good) }
        }
    }

    private func complete() {
        app.p.lessonsDone[lesson.id] = max(app.p.lessonsDone[lesson.id] ?? 0, accuracy)
        app.addXP(10 + correct)
        SoundPlayer.shared.play(.finish)
        current = nil
        finished = true
    }
}

// MARK: - Shared step chrome

/// Mascot + instruction line at the top of every step.
private struct StepHeader: View {
    var text: String
    var mood: Mood = .curious

    var body: some View {
        HStack(alignment: .bottom) {
            KanaBlob(mood: mood, size: 62)
            Text(text).kgFont(18, .bold).foregroundStyle(KG.ink).fixedSize(horizontal: false, vertical: true)
            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.top, 8)
    }
}

/// Bottom check/continue bar with success or correction message.
private struct StepFooter: View {
    @Environment(AppModel.self) private var app
    var result: Bool?
    var answer: String?
    var canCheck: Bool
    var check: () -> Void
    var proceed: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            if let result {
                HStack(spacing: 10) {
                    HugeIcon(result ? .checkCircle : .cancelCircle, size: 26, filled: true)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(result ? ["¡Sugoi!", "¡Perfecto!", "¡Eso es!"].randomElement()! : app.t("Casi…", "Almost…"))
                            .kgFont(19, .bold)
                        if !result, let answer {
                            Text(app.t("Respuesta: ", "Answer: ") + answer).kgFont(15, .semibold)
                        }
                    }
                    Spacer()
                }
                .foregroundStyle(result ? KG.mintDeep : KG.redDeep)
                .transition(.opacity)
            }
            Button(result == nil ? app.t("Comprobar", "Check") : app.t("Continuar", "Continue")) {
                if result == nil { check() } else { proceed() }
            }
            .buttonStyle(result == false ? .chunkyRed : result == true ? .chunkyMint : .chunky)
            .disabled(result == nil && !canCheck)
            .opacity(result == nil && !canCheck ? 0.5 : 1)
        }
        .padding(20)
        .background(
            ZStack {
                KG.cream
                if let result { (result ? KG.mint : KG.red).opacity(0.14) }
            }
            .clipShape(UnevenRoundedRectangle(topLeadingRadius: 28, topTrailingRadius: 28, style: .continuous))
            .ignoresSafeArea(edges: .bottom)
        )
        .sensoryFeedback(result == true ? .success : .error, trigger: result) { _, new in new != nil }
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: result)
    }
}

private func playResult(_ ok: Bool, _ app: AppModel) {
    SoundPlayer.shared.play(ok ? .correct : .wrong)
}

// MARK: - Intro

private struct IntroStep: View {
    @Environment(AppModel.self) private var app
    var item: LessonItem
    var onDone: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            StepHeader(text: item.kind == .kana ? app.t("¡Kana nuevo!", "New kana!")
                       : item.kind == .kanji ? app.t("¡Kanji nuevo!", "New kanji!")
                       : item.kind == .grammar ? app.t("¡Patrón nuevo!", "New pattern!")
                       : app.t("¡Palabra nueva!", "New word!"), mood: .wow)
            VStack(spacing: 12) {
                Pill(text: app.t("NUEVO", "NEW"), color: KG.sun, foreground: KG.ink)
                Text(item.jp)
                    .font(.system(size: item.jp.count > 4 ? 40 : 76, weight: .semibold, design: .rounded))
                    .foregroundStyle(KG.ink)
                    .multilineTextAlignment(.center)
                    .minimumScaleFactor(0.4)
                if let r = item.reading, app.p.showRomaji || item.kind == .kanji {
                    Text(r).kgFont(17, .semibold).foregroundStyle(KG.pinkText)
                }
                Text(item.meaning).kgFont(24, .bold).foregroundStyle(KG.ink).multilineTextAlignment(.center)
                SpeakButton(text: item.speak, size: 48)
                if let note = item.note {
                    Text(note).kgText(14, .medium).foregroundStyle(KG.inkSoft)
                        .multilineTextAlignment(.center)
                        .padding(12)
                        .frame(maxWidth: .infinity)
                        .background(RoundedRectangle(cornerRadius: 14).fill(KG.cream))
                }
                if let ex = item.example {
                    VStack(spacing: 3) {
                        Text(ex).font(.system(size: 17, weight: .semibold, design: .rounded)).foregroundStyle(KG.ink)
                        if let m = item.exampleMeaning { Text(m).kgText(13, .medium).foregroundStyle(KG.muted) }
                    }
                    .multilineTextAlignment(.center)
                }
            }
            .padding(22)
            .frame(maxWidth: .infinity)
            .sticker(radius: 32, border: KG.pinkSoft, lineWidth: 4)
            .padding(.horizontal, 20)
            Spacer(minLength: 0)
            Button(app.t("¡Entendido!", "Got it!"), action: onDone)
                .buttonStyle(.chunky)
                .padding(.horizontal, 20)
                .padding(.bottom, 10)
        }
        .onAppear { Speaker.shared.speak(item.speak, rate: app.p.speechRate) }
    }
}

// MARK: - Multiple choice (recognize / reverse / listen)

private struct ChoiceStep: View {
    enum Prompt { case japanese, meaning, audio }

    @Environment(AppModel.self) private var app
    var item: LessonItem
    var pool: [LessonItem]
    var prompt: Prompt
    var onDone: (Bool) -> Void

    @State private var options: [String] = []
    @State private var picked: Int?
    @State private var result: Bool?

    private var answerText: String { prompt == .meaning ? item.jp : item.meaning }
    private var optionsJapanese: Bool { prompt == .meaning }

    var body: some View {
        VStack(spacing: 14) {
            StepHeader(text: prompt == .audio ? app.t("¿Qué escuchaste?", "What did you hear?")
                       : prompt == .meaning ? app.t("¿Cómo se dice en japonés?", "How do you say it in Japanese?")
                       : item.kind == .kana ? app.t("¿Cómo se lee?", "How do you read it?")
                       : app.t("¿Qué significa?", "What does it mean?"),
                       mood: result == nil ? .curious : result == true ? .happy : .sad)

            VStack(spacing: 10) {
                switch prompt {
                case .audio where result == nil:
                    ListenPrompt(text: item.speak)
                case .meaning:
                    Text(item.meaning).kgFont(item.meaning.count > 28 ? 21 : 28, .bold).foregroundStyle(KG.ink)
                        .multilineTextAlignment(.center)
                default:
                    Text(item.jp)
                        .font(.system(size: item.jp.count > 4 ? 38 : 72, weight: .semibold, design: .rounded))
                        .foregroundStyle(KG.ink).multilineTextAlignment(.center).minimumScaleFactor(0.4)
                    if result != nil, let r = item.reading { Text(r).kgFont(15, .semibold).foregroundStyle(KG.pinkText) }
                    if prompt == .japanese { SpeakButton(text: item.speak, size: 40) }
                }
            }
            .frame(maxWidth: .infinity, minHeight: 170)
            .padding(16)
            .sticker(radius: 30)
            .padding(.horizontal, 20)

            LazyVGrid(columns: optionsJapanese ? [GridItem(), GridItem()] : [GridItem()], spacing: 10) {
                ForEach(Array(options.enumerated()), id: \.offset) { i, opt in
                    Button { picked = i } label: {
                        Text(opt)
                            .font(optionsJapanese ? .system(size: opt.count > 5 ? 20 : 28, weight: .semibold, design: .rounded) : .kg(17, .semibold))
                            .lineLimit(2).minimumScaleFactor(0.6).multilineTextAlignment(.center)
                            .padding(.horizontal, 10)
                    }
                    .buttonStyle(ChunkyButtonStyle(fill: fill(i), lip: lip(i), foreground: fg(i), radius: 18,
                                                   height: optionsJapanese ? 70 : 54))
                    .disabled(result != nil)
                    .answerFeedback(result == nil ? nil : options[i] == answerText ? .correct : picked == i ? .wrong : nil)
                }
            }
            .padding(.horizontal, 20)
            Spacer(minLength: 0)
            StepFooter(result: result, answer: answerText, canCheck: picked != nil, check: check) { onDone(result == true) }
        }
        .onAppear(perform: setup)
    }

    private func fill(_ i: Int) -> Color {
        guard let result else { return picked == i ? KG.pinkSoft : .white }
        if options[i] == answerText { return KG.mint }
        return (picked == i && !result) ? KG.red : .white
    }

    private func lip(_ i: Int) -> Color {
        guard let result else { return picked == i ? KG.pink : KG.line }
        if options[i] == answerText { return KG.mintDeep }
        return (picked == i && !result) ? KG.redDeep : KG.line
    }

    private func fg(_ i: Int) -> Color {
        guard result != nil else { return KG.ink }
        return options[i] == answerText || picked == i ? .white : KG.ink.opacity(0.35)
    }

    private func setup() {
        guard options.isEmpty else { return }
        let others = pool.filter { $0.id != item.id }
            .map { prompt == .meaning ? $0.jp : $0.meaning }
            .filter { $0 != answerText }
        options = (Array(Set(others)).shuffled().prefix(3) + [answerText]).shuffled()
        if prompt == .audio { Speaker.shared.speak(item.speak, rate: app.p.speechRate) }
    }

    private func check() {
        guard let picked else { return }
        let ok = options[picked] == answerText
        result = ok
        playResult(ok, app)
        if prompt != .japanese { Speaker.shared.speak(item.speak, rate: app.p.speechRate) }
    }
}

// MARK: - Type the meaning

private struct TypeStep: View {
    @Environment(AppModel.self) private var app
    var item: LessonItem
    var onDone: (Bool) -> Void

    @State private var text = ""
    @State private var result: Bool?
    @FocusState private var focused: Bool

    var body: some View {
        VStack(spacing: 14) {
            StepHeader(text: item.kind == .kana ? app.t("Escribe cómo se lee", "Type how it's read")
                       : app.t("Escribe qué significa", "Type what it means"),
                       mood: result == nil ? .curious : result == true ? .happy : .sad)
            VStack(spacing: 8) {
                Text(item.jp)
                    .font(.system(size: item.jp.count > 6 ? 36 : 64, weight: .semibold, design: .rounded))
                    .foregroundStyle(KG.ink).minimumScaleFactor(0.4)
                SpeakButton(text: item.speak, size: 38)
            }
            .frame(maxWidth: .infinity, minHeight: 150)
            .padding(16)
            .sticker(radius: 30)
            .padding(.horizontal, 20)

            TextField(app.t("Tu respuesta…", "Your answer…"), text: $text)
                .kgFont(20, .semibold)
                .multilineTextAlignment(.center)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($focused)
                .disabled(result != nil)
                .submitLabel(.done)
                .onSubmit { if result == nil, !text.isEmpty { check() } }
                .padding(18)
                .sticker(radius: 22, border: result == nil ? KG.pinkSoft : result == true ? KG.mint : KG.red, lineWidth: 3)
                .padding(.horizontal, 20)
            Spacer(minLength: 0)
            StepFooter(result: result, answer: item.meaning,
                       canCheck: !text.trimmingCharacters(in: .whitespaces).isEmpty, check: check) { onDone(result == true) }
        }
        .onAppear { focused = true }
    }

    private func check() {
        let ok = AnswerCheck.matches(text, expected: item.meaning)
            || (item.reading.map { AnswerCheck.matches(text, expected: $0) } ?? false && item.kind == .kana)
        result = ok
        focused = false
        playResult(ok, app)
    }
}

// MARK: - Match pairs (mini round)

private struct MatchStep: View {
    @Environment(AppModel.self) private var app
    var items: [LessonItem]
    var onDone: (Bool) -> Void

    @State private var left: [LessonItem] = []
    @State private var right: [LessonItem] = []
    @State private var pickedLeft: LessonItem?
    @State private var matched: Set<String> = []
    @State private var wrong: String?
    @State private var mistakes = 0

    var body: some View {
        VStack(spacing: 14) {
            StepHeader(text: app.t("Une cada pareja", "Match the pairs"), mood: wrong == nil ? .curious : .angry)
            HStack(alignment: .top, spacing: 12) {
                VStack(spacing: 10) {
                    ForEach(left) { it in
                        tile(it.jp, japanese: true, done: matched.contains(it.id), selected: pickedLeft == it, wrong: false) {
                            pickedLeft = it
                            Speaker.shared.speak(it.speak, rate: app.p.speechRate)
                        }
                    }
                }
                VStack(spacing: 10) {
                    ForEach(right) { it in
                        tile(it.meaning, japanese: false, done: matched.contains(it.id), selected: false, wrong: wrong == it.id) {
                            tapRight(it)
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            Spacer(minLength: 0)
        }
        .onAppear {
            if left.isEmpty {
                left = items.shuffled()
                right = items.shuffled()
            }
        }
    }

    private func tile(_ text: String, japanese: Bool, done: Bool, selected: Bool, wrong: Bool,
                      action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(text)
                .font(japanese ? .system(size: text.count > 4 ? 18 : 24, weight: .semibold, design: .rounded) : .kg(15, .semibold))
                .lineLimit(2).minimumScaleFactor(0.6).multilineTextAlignment(.center)
                .padding(.horizontal, 8)
        }
        .buttonStyle(ChunkyButtonStyle(
            fill: done ? KG.mint.opacity(0.25) : wrong ? KG.red : selected ? KG.pinkSoft : .white,
            lip: done ? .clear : wrong ? KG.redDeep : selected ? KG.pink : KG.line,
            foreground: done ? KG.mintDeep.opacity(0.5) : wrong ? .white : KG.ink,
            radius: 18, height: 64))
        .disabled(done)
        .answerFeedback(done ? .correct : wrong ? .wrong : nil)
        .frame(maxWidth: .infinity)
    }

    private func tapRight(_ it: LessonItem) {
        guard let l = pickedLeft else { return }
        if l.id == it.id {
            matched.insert(it.id)
            pickedLeft = nil
            SoundPlayer.shared.play(.correct)
            if matched.count == items.count {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { onDone(mistakes <= 1) }
            }
        } else {
            mistakes += 1
            wrong = it.id
            pickedLeft = nil
            SoundPlayer.shared.play(.wrong)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { wrong = nil }
        }
    }
}

// MARK: - Build sentence

private struct BuildStep: View {
    @Environment(AppModel.self) private var app
    var item: LessonItem
    var pool: [LessonItem]
    var onDone: (Bool) -> Void

    private struct Chip: Identifiable, Hashable { let id: Int; let text: String }

    @State private var bank: [Chip] = []
    @State private var chosen: [Chip] = []
    @State private var result: Bool?

    private var chunks: [String] { item.buildChunks ?? [] }

    var body: some View {
        VStack(spacing: 14) {
            StepHeader(text: app.t("Arma la frase", "Build the sentence"),
                       mood: result == nil ? .curious : result == true ? .love : .sad)
            Text(item.exampleMeaning ?? item.meaning)
                .kgFont(19, .bold).foregroundStyle(KG.ink).multilineTextAlignment(.center)
                .frame(maxWidth: .infinity, minHeight: 70)
                .padding(14)
                .sticker(radius: 24)
                .padding(.horizontal, 20)

            FlowLayout(spacing: 8) {
                ForEach(chosen) { chip in
                    chipButton(chip, filled: true) { if result == nil { chosen.removeAll { $0 == chip } } }
                }
            }
            .frame(maxWidth: .infinity, minHeight: 96, alignment: .topLeading)
            .padding(12)
            .background(RoundedRectangle(cornerRadius: 22, style: .continuous)
                .strokeBorder(result == nil ? KG.line : result == true ? KG.mint : KG.red,
                              style: StrokeStyle(lineWidth: 3, dash: result == nil ? [8, 6] : [])))
            .padding(.horizontal, 20)

            FlowLayout(spacing: 8) {
                ForEach(bank) { chip in
                    let used = chosen.contains(chip)
                    chipButton(chip, filled: false) {
                        guard result == nil, !used else { return }
                        chosen.append(chip)
                        Speaker.shared.speak(chip.text, rate: app.p.speechRate)
                    }
                    .opacity(used ? 0.25 : 1)
                }
            }
            .padding(.horizontal, 20)
            Spacer(minLength: 0)
            StepFooter(result: result, answer: item.example, canCheck: !chosen.isEmpty, check: check) { onDone(result == true) }
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.8), value: chosen)
        .onAppear(perform: setup)
    }

    private func chipButton(_ chip: Chip, filled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(chip.text)
                .font(.system(size: 19, weight: .semibold, design: .rounded))
                .foregroundStyle(KG.ink)
                .padding(.horizontal, 14).padding(.vertical, 10)
                .background(RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(filled ? KG.pinkSoft : .white)
                    .shadow(color: KG.ink.opacity(0.08), radius: 0, y: 3))
        }
        .buttonStyle(.squish)
    }

    private func setup() {
        guard bank.isEmpty else { return }
        let others = pool.filter { $0.id != item.id }.compactMap(\.buildChunks).flatMap { $0 }.filter { !chunks.contains($0) }
        let distractors = Array(Set(others)).shuffled().prefix(max(2, 6 - chunks.count))
        bank = (chunks + distractors).enumerated().map { Chip(id: $0, text: $1) }.shuffled()
    }

    private func check() {
        let ok = chosen.map(\.text).joined() == chunks.joined()
        result = ok
        playResult(ok, app)
        if let ex = item.example { Speaker.shared.speak(ex, rate: app.p.speechRate) }
    }
}

// MARK: - Handwriting

private struct WriteStep: View {
    @Environment(AppModel.self) private var app
    var item: LessonItem
    /// First contact with a character: show the faint guide so it can be traced.
    var guided = false
    var onDone: (Bool) -> Void

    @State private var revealed = false
    @State private var guide = false

    var body: some View {
        VStack(spacing: 12) {
            StepHeader(text: guided ? app.t("Calca el trazo", "Trace it") : app.t("Escríbelo de memoria", "Write it from memory"),
                       mood: revealed ? .wow : .curious)
            VStack(spacing: 2) {
                Text(item.meaning).kgFont(24, .bold).foregroundStyle(KG.ink)
                if let r = item.reading { Text(r).kgFont(14, .semibold).foregroundStyle(KG.pinkText) }
            }
            TraceCanvas(glyph: item.jp, guideOpacity: revealed ? 0.35 : guide ? 0.12 : 0)
                .padding(.horizontal, 20)
            Spacer(minLength: 0)
            HStack(spacing: 10) {
                if revealed {
                    Button(app.t("Repasar", "Missed it")) { onDone(false) }.buttonStyle(.chunkyRed)
                    Button(app.t("¡Me salió!", "Got it!")) {
                        SoundPlayer.shared.play(.correct)
                        onDone(true)
                    }
                    .buttonStyle(.chunkyMint)
                } else {
                    Button { guide.toggle() } label: {
                        Label(app.t("Pista", "Hint"), hi: guide ? .viewOff : .view)
                    }
                    .buttonStyle(ChunkyButtonStyle(fill: .white, lip: KG.line, foreground: KG.inkSoft, fullWidth: false))
                    Button(app.t("Comparar", "Compare")) {
                        revealed = true
                        Speaker.shared.speak(item.speak, rate: app.p.speechRate)
                    }
                    .buttonStyle(.chunky)
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 10)
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: revealed)
        .onAppear { if guided { guide = true } }
    }
}
