import SwiftUI

/// Extra ways to practice a deck.
enum StudyMode: String, CaseIterable, Identifiable, Hashable {
    case quiz, listen, speak, match, type, build, write

    var id: String { rawValue }

    var icon: HI {
        switch self {
        case .quiz: return .quiz
        case .listen: return .headphones
        case .speak: return .mic
        case .match: return .link
        case .type: return .keyboard
        case .build: return .blocks
        case .write: return .quill
        }
    }

    var color: Color {
        switch self {
        case .quiz: return KG.pink
        case .listen: return KG.sky
        case .speak: return KG.flame
        case .match: return KG.mint
        case .type: return KG.sun
        case .build: return KG.grape
        case .write: return KG.ink
        }
    }

    func title(_ app: AppModel) -> String {
        switch self {
        case .quiz: return "Quiz"
        case .listen: return app.t("Escuchar", "Listen")
        case .speak: return app.t("Pronunciar", "Speak")
        case .match: return app.t("Emparejar", "Match")
        case .type: return app.t("Teclear", "Type it")
        case .build: return app.t("Construir frase", "Build sentence")
        case .write: return app.t("Escribir a mano", "Handwriting")
        }
    }

    func subtitle(_ app: AppModel) -> String {
        switch self {
        case .quiz: return app.t("Opción múltiple", "Multiple choice")
        case .listen: return app.t("Oye y elige", "Hear and pick")
        case .speak: return app.t("Di la palabra", "Say the word")
        case .match: return app.t("Contra reloj", "Beat the clock")
        case .type: return app.t("El significado", "The meaning")
        case .build: return app.t("Ordena las piezas", "Order the pieces")
        case .write: return app.t("De memoria", "From memory")
        }
    }

    /// Whether the deck has enough material for this mode.
    func available(for deck: Deck) -> Bool {
        switch self {
        case .quiz, .listen, .type: return deck.cards.count >= 2
        case .speak: return SpeakSession.speakable(deck).count >= 3
        case .match: return deck.cards.count >= 3
        case .build: return SentenceBuilder.items(deck).count >= 3
        case .write: return WriteSession.writable(deck).count >= 3
        }
    }
}

// MARK: - Mode picker grid (deck detail)

struct StudyModesGrid: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router
    var deck: Deck

    var body: some View {
        let modes = StudyMode.allCases.filter { $0.available(for: deck) }
        VStack(alignment: .leading, spacing: 10) {
            SectionTitle(app.t("Modos de estudio", "Study modes"), jp: "れんしゅう")
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible())], spacing: 10) {
                ForEach(modes) { mode in
                    Button { router.session = .mode(deckId: deck.id, mode: mode) } label: {
                        HStack(spacing: 10) {
                            HugeIcon(mode.icon, size: 20)
                                .foregroundStyle(.white)
                                .frame(width: 38, height: 38)
                                .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(mode.color))
                            VStack(alignment: .leading, spacing: 1) {
                                Text(mode.title(app)).kgFont(14, .bold).foregroundStyle(KG.ink)
                                    .lineLimit(1).minimumScaleFactor(0.8)
                                Text(mode.subtitle(app)).kgFont(11, .semibold).foregroundStyle(KG.muted).lineLimit(1)
                            }
                            Spacer(minLength: 0)
                        }
                        .padding(10)
                        .sticker(radius: 18)
                    }
                    .buttonStyle(.squish)
                }
            }
        }
    }
}

struct ModeSessionHost: View {
    @Environment(AppModel.self) private var app
    var deck: Deck
    var mode: StudyMode

    var body: some View {
        switch mode {
        case .quiz: QuizSession(title: deck.title(app.lang), questions: QuizBuilder.deck(deck, app: app))
        case .listen: QuizSession(title: deck.title(app.lang), questions: QuizBuilder.listening(deck, app: app))
        case .speak: SpeakSession(deck: deck)
        case .match: MatchSession(deck: deck)
        case .type: TypeSession(deck: deck)
        case .build: BuildSession(deck: deck)
        case .write: WriteSession(deck: deck)
        }
    }
}

// MARK: - Listening

struct ListenPrompt: View {
    @Environment(AppModel.self) private var app
    var text: String
    @State private var pulse = false
    @State private var tick = 0

    var body: some View {
        HStack(spacing: 18) {
            Button {
                tick += 1
                Speaker.shared.speak(text, rate: app.p.speechRate)
            } label: {
                HugeIcon(.volume, size: 44)
                    .keyframeAnimator(initialValue: 1.0, trigger: tick) { v, s in v.scaleEffect(s) } keyframes: { _ in
                        SpringKeyframe(1.15, duration: 0.12)
                        SpringKeyframe(1.0, duration: 0.3)
                    }
                    .foregroundStyle(.white)
                    .frame(width: 104, height: 104)
                    .background(Circle().fill(KG.sky))
                    .overlay(Circle().stroke(KG.sky.opacity(0.35), lineWidth: 10).scaleEffect(pulse ? 1.25 : 1).opacity(pulse ? 0 : 1))
            }
            .buttonStyle(.squish)
            Button {
                Speaker.shared.speak(text, rate: max(0.2, app.p.speechRate * 0.6))
            } label: {
                HugeIcon(.turtle, size: 24)
                    .foregroundStyle(KG.skyDeep)
                    .frame(width: 52, height: 52)
                    .background(Circle().fill(KG.sky.opacity(0.18)))
            }
            .buttonStyle(.squish)
            .accessibilityLabel(app.t("Más lento", "Slower"))
        }
        .onAppear {
            withAnimation(.easeOut(duration: 1.4).repeatForever(autoreverses: false)) { pulse = true }
        }
    }
}

extension QuizBuilder {
    static func listening(_ deck: Deck, app: AppModel, count: Int = 10) -> [QuizQuestion] {
        let lang = app.lang
        let pool = deck.cards
        return deck.cards.shuffled().prefix(count).map { card in
            let others = pool.filter { $0.jp != card.jp && $0.meaning(lang) != card.meaning(lang) }.shuffled().prefix(3)
            var opts = others.map { $0.meaning(lang) } + [card.meaning(lang)]
            opts.shuffle()
            return QuizQuestion(prompt: card.jp, promptIsJapanese: true, hint: card.romaji, speak: card.kana ?? card.jp,
                                options: opts, answer: opts.firstIndex(of: card.meaning(lang))!,
                                optionsAreJapanese: false, listening: true)
        }
    }
}

// MARK: - Match pairs

struct MatchSession: View {
    @Environment(AppModel.self) private var app
    var deck: Deck

    private struct Tile: Identifiable, Equatable {
        let id: String
        let pair: Int
        let text: String
        let japanese: Bool
    }

    @State private var rounds: [[Card]] = []
    @State private var round = 0
    @State private var left: [Tile] = []
    @State private var right: [Tile] = []
    @State private var pickedLeft: Tile?
    @State private var pickedRight: Tile?
    @State private var matched: Set<Int> = []
    @State private var wrong: Set<String> = []
    @State private var mistakes = 0
    @State private var pairsDone = 0
    @State private var start = Date.now
    @State private var elapsed: TimeInterval = 0
    @State private var finished = false

    private var totalPairs: Int { rounds.reduce(0) { $0 + $1.count } }

    var body: some View {
        ZStack {
            KGBackground()
            if finished {
                ResultView(correct: pairsDone, total: pairsDone + mistakes, xp: pairsDone * 2,
                           title: app.t("Emparejaste \(pairsDone) pares en \(Int(elapsed)) s",
                                        "Matched \(pairsDone) pairs in \(Int(elapsed)) s"))
            } else {
                VStack(spacing: 16) {
                    SessionTopBar(progress: Double(pairsDone) / Double(max(totalPairs, 1)),
                                  trailingView: AnyView(TimelineView(.periodic(from: start, by: 1)) { ctx in
                                      Text("\(Int(ctx.date.timeIntervalSince(start)))s")
                                          .kgFont(15, .bold).foregroundStyle(KG.pinkText).monospacedDigit()
                                  }))
                    HStack(alignment: .bottom) {
                        KanaBlob(mood: wrong.isEmpty ? .curious : .angry, size: 64)
                        Text(app.t("Toca un par que coincida", "Tap a matching pair"))
                            .kgFont(18, .bold).foregroundStyle(KG.ink)
                        Spacer()
                    }
                    .padding(.horizontal, 20)
                    HStack(alignment: .top, spacing: 12) {
                        column(left, picked: pickedLeft)
                        column(right, picked: pickedRight)
                    }
                    .padding(.horizontal, 20)
                    Spacer(minLength: 0)
                }
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.75), value: matched)
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: finished)
        .onAppear(perform: setup)
    }

    private func column(_ tiles: [Tile], picked: Tile?) -> some View {
        VStack(spacing: 10) {
            ForEach(tiles) { t in
                let done = matched.contains(t.pair)
                let isWrong = wrong.contains(t.id)
                let selected = picked == t
                Button { tap(t) } label: {
                    Text(t.text)
                        .font(t.japanese ? .system(size: t.text.count > 4 ? 18 : 24, weight: .semibold, design: .rounded)
                                         : .kg(15, .semibold))
                        .tracking(t.japanese ? 0 : 15 * KG.tracking)
                        .lineLimit(2)
                        .minimumScaleFactor(0.6)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 8)
                }
                .buttonStyle(ChunkyButtonStyle(
                    fill: done ? KG.mint.opacity(0.25) : isWrong ? KG.red : selected ? KG.pinkSoft : .white,
                    lip: done ? .clear : isWrong ? KG.redDeep : selected ? KG.pink : KG.line,
                    foreground: done ? KG.mintDeep.opacity(0.5) : isWrong ? .white : KG.ink,
                    radius: 18, height: 64))
                .disabled(done)
                .modifier(Shake(animatableData: isWrong ? 1 : 0))
            }
        }
        .frame(maxWidth: .infinity)
    }

    private func setup() {
        let cards = Array(deck.cards.shuffled().prefix(15))
        rounds = stride(from: 0, to: cards.count, by: 5).map { Array(cards[$0..<min($0 + 5, cards.count)]) }
        start = .now
        loadRound()
    }

    private func loadRound() {
        guard round < rounds.count else { return }
        let cards = rounds[round]
        left = cards.enumerated().map { Tile(id: "l\(round)-\($0)", pair: round * 10 + $0, text: $1.jp, japanese: true) }.shuffled()
        right = cards.enumerated().map { Tile(id: "r\(round)-\($0)", pair: round * 10 + $0, text: $1.meaning(app.lang), japanese: false) }.shuffled()
        pickedLeft = nil
        pickedRight = nil
    }

    private func tap(_ t: Tile) {
        if t.japanese {
            pickedLeft = t
            Speaker.shared.speak(t.text, rate: app.p.speechRate)
        } else {
            pickedRight = t
        }
        guard let l = pickedLeft, let r = pickedRight else { return }
        if l.pair == r.pair {
            matched.insert(l.pair)
            pairsDone += 1
            SoundPlayer.shared.play(.correct)
            pickedLeft = nil
            pickedRight = nil
            if rounds.indices.contains(round), matched.filter({ $0 / 10 == round }).count == rounds[round].count {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { nextRound() }
            }
        } else {
            mistakes += 1
            wrong = [l.id, r.id]
            SoundPlayer.shared.play(.wrong)
            pickedLeft = nil
            pickedRight = nil
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { wrong = [] }
        }
    }

    private func nextRound() {
        round += 1
        if round >= rounds.count {
            elapsed = Date.now.timeIntervalSince(start)
            app.addXP(pairsDone * 2)
            SoundPlayer.shared.play(.finish)
            finished = true
        } else {
            loadRound()
        }
    }
}

// MARK: - Type the meaning

enum AnswerCheck {
    /// Lowercased, accent-free, punctuation-free text for lenient comparison.
    static func normalize(_ s: String) -> String {
        var t = s.folding(options: [.caseInsensitive, .diacriticInsensitive, .widthInsensitive], locale: nil)
        t = t.replacingOccurrences(of: #"\([^)]*\)"#, with: "", options: .regularExpression)
        t = t.components(separatedBy: CharacterSet.alphanumerics.union(.whitespaces).inverted).joined()
        let fillers = ["to ", "the ", "a ", "an ", "el ", "la ", "los ", "las ", "un ", "una "]
        t = t.trimmingCharacters(in: .whitespaces)
        for f in fillers where t.hasPrefix(f) { t.removeFirst(f.count) }
        return t.split(separator: " ").joined(separator: " ")
    }

    /// Accepts any alternative of "a / b, c; d" or a close-enough match.
    static func matches(_ answer: String, expected: String) -> Bool {
        let a = normalize(answer)
        guard !a.isEmpty else { return false }
        let alternatives = expected.components(separatedBy: CharacterSet(charactersIn: "/,;")).map(normalize).filter { !$0.isEmpty }
        for alt in alternatives + [normalize(expected)] {
            if a == alt { return true }
            if a.count >= 3, alt.contains(a) || a.contains(alt) { return true }
            if alt.count >= 5, distance(a, alt) <= 1 { return true }
        }
        return false
    }

    static func distance(_ a: String, _ b: String) -> Int {
        let a = Array(a), b = Array(b)
        if a.isEmpty { return b.count }
        if b.isEmpty { return a.count }
        var prev = Array(0...b.count)
        for i in 1...a.count {
            var cur = [i] + Array(repeating: 0, count: b.count)
            for j in 1...b.count {
                cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1))
            }
            prev = cur
        }
        return prev[b.count]
    }
}

struct TypeSession: View {
    @Environment(AppModel.self) private var app
    var deck: Deck

    @State private var cards: [Card] = []
    @State private var index = 0
    @State private var answer = ""
    @State private var result: Bool?
    @State private var correct = 0
    @State private var finished = false
    @FocusState private var focused: Bool

    var body: some View {
        ZStack {
            KGBackground()
            if finished {
                ResultView(correct: correct, total: cards.count, xp: correct * 3, title: deck.title(app.lang))
            } else if let card = cards[safe: index] {
                VStack(spacing: 16) {
                    SessionTopBar(progress: Double(index) / Double(max(cards.count, 1)), trailing: "\(index + 1)/\(cards.count)")
                    HStack(alignment: .bottom) {
                        KanaBlob(mood: result == nil ? .curious : result == true ? .happy : .sad, size: 64)
                        Text(app.t("Escribe qué significa", "Type what it means"))
                            .kgFont(18, .bold).foregroundStyle(KG.ink)
                        Spacer()
                    }
                    .padding(.horizontal, 20)

                    VStack(spacing: 10) {
                        Text(card.jp)
                            .font(.system(size: card.jp.count > 6 ? 36 : 64, weight: .semibold, design: .rounded))
                            .foregroundStyle(KG.ink)
                            .minimumScaleFactor(0.4)
                        if app.p.showRomaji, card.romaji != card.meaning(app.lang) {
                            Text(card.romaji).kgFont(15, .semibold).foregroundStyle(KG.pinkText)
                        }
                        SpeakButton(text: card.kana ?? card.jp, size: 40)
                    }
                    .frame(maxWidth: .infinity, minHeight: 190)
                    .padding(16)
                    .sticker(radius: 30)
                    .padding(.horizontal, 20)

                    TextField(app.t("Tu respuesta…", "Your answer…"), text: $answer)
                        .kgFont(20, .semibold)
                        .multilineTextAlignment(.center)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .submitLabel(.done)
                        .focused($focused)
                        .disabled(result != nil)
                        .padding(18)
                        .sticker(result == nil ? .white : result == true ? KG.mint.opacity(0.18) : KG.red.opacity(0.12),
                                 radius: 22,
                                 border: result == nil ? KG.pinkSoft : result == true ? KG.mint : KG.red, lineWidth: 3)
                        .padding(.horizontal, 20)
                        .onSubmit(primary)

                    if let result {
                        VStack(spacing: 4) {
                            Text(result ? "¡Sugoi!" : app.t("Era:", "It was:"))
                                .kgFont(17, .bold)
                                .foregroundStyle(result ? KG.mintDeep : KG.redDeep)
                            if !result {
                                Text(card.meaning(app.lang)).kgFont(18, .semibold).foregroundStyle(KG.ink)
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .transition(.opacity)
                    }
                    Spacer(minLength: 0)
                    HStack(spacing: 10) {
                        if result == nil {
                            Button(app.t("No sé", "Skip")) {
                                answer = ""
                                check(card)
                            }
                            .buttonStyle(ChunkyButtonStyle(fill: .white, lip: KG.line, foreground: KG.inkSoft, fullWidth: false))
                        }
                        Button(result == nil ? app.t("Comprobar", "Check") : app.t("Continuar", "Continue"), action: primary)
                            .buttonStyle(result == false ? .chunkyRed : result == true ? .chunkyMint : .chunky)
                            .disabled(result == nil && answer.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 10)
                }
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: result)
        .onAppear {
            if cards.isEmpty { cards = Array(deck.cards.shuffled().prefix(10)) }
            focused = true
        }
    }

    private func primary() {
        guard let card = cards[safe: index] else { return }
        if result == nil {
            guard !answer.trimmingCharacters(in: .whitespaces).isEmpty else { return }
            check(card)
        } else {
            next()
        }
    }

    private func check(_ card: Card) {
        let ok = AnswerCheck.matches(answer, expected: card.meaning(app.lang))
            || AnswerCheck.matches(answer, expected: app.lang == .es ? card.en : card.es)
        result = ok
        if ok { correct += 1 }
        SoundPlayer.shared.play(ok ? .correct : .wrong)
    }

    private func next() {
        result = nil
        answer = ""
        if index + 1 >= cards.count {
            app.addXP(correct * 3)
            SoundPlayer.shared.play(.finish)
            finished = true
        } else {
            index += 1
            focused = true
        }
    }
}

// MARK: - Build the sentence

enum SentenceBuilder {
    struct Item: Hashable {
        let card: Card
        let sentence: String
        let chunks: [String]
    }

    static func items(_ deck: Deck) -> [Item] {
        deck.cards.compactMap { card in
            guard let ex = card.example, card.exampleEs != nil || card.exampleEn != nil else { return nil }
            let c = chunks(ex)
            guard (2...7).contains(c.count) else { return nil }
            return Item(card: card, sentence: ex, chunks: c)
        }
    }
}

struct BuildSession: View {
    @Environment(AppModel.self) private var app
    var deck: Deck

    private struct Chip: Identifiable, Hashable {
        let id: Int
        let text: String
    }

    @State private var items: [SentenceBuilder.Item] = []
    @State private var index = 0
    @State private var bank: [Chip] = []
    @State private var chosen: [Chip] = []
    @State private var result: Bool?
    @State private var correct = 0
    @State private var finished = false

    var body: some View {
        ZStack {
            KGBackground()
            if finished {
                ResultView(correct: correct, total: items.count, xp: correct * 4, title: deck.title(app.lang))
            } else if let item = items[safe: index] {
                VStack(spacing: 16) {
                    SessionTopBar(progress: Double(index) / Double(max(items.count, 1)), trailing: "\(index + 1)/\(items.count)")
                    HStack(alignment: .bottom) {
                        KanaBlob(mood: result == nil ? .curious : result == true ? .love : .sad, size: 64)
                        Text(app.t("Arma la frase en japonés", "Build it in Japanese"))
                            .kgFont(18, .bold).foregroundStyle(KG.ink)
                        Spacer()
                    }
                    .padding(.horizontal, 20)

                    Text((app.lang == .es ? item.card.exampleEs : item.card.exampleEn) ?? item.card.meaning(app.lang))
                        .kgFont(20, .bold)
                        .foregroundStyle(KG.ink)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity, minHeight: 90)
                        .padding(16)
                        .sticker(radius: 26)
                        .padding(.horizontal, 20)

                    // answer line
                    FlowLayout(spacing: 8) {
                        ForEach(chosen) { chip in
                            chipView(chip, filled: true) {
                                guard result == nil else { return }
                                chosen.removeAll { $0 == chip }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, minHeight: 104, alignment: .topLeading)
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .strokeBorder(result == nil ? KG.line : result == true ? KG.mint : KG.red,
                                          style: StrokeStyle(lineWidth: 3, dash: result == nil ? [8, 6] : []))
                    )
                    .padding(.horizontal, 20)

                    // bank
                    FlowLayout(spacing: 8) {
                        ForEach(bank) { chip in
                            let used = chosen.contains(chip)
                            chipView(chip, filled: false) {
                                guard result == nil, !used else { return }
                                chosen.append(chip)
                                Speaker.shared.speak(chip.text, rate: app.p.speechRate)
                            }
                            .opacity(used ? 0.25 : 1)
                        }
                    }
                    .padding(.horizontal, 20)

                    if let result {
                        VStack(spacing: 4) {
                            Text(result ? "¡Perfecto!" : app.t("La frase era:", "The sentence was:"))
                                .kgFont(16, .bold).foregroundStyle(result ? KG.mintDeep : KG.redDeep)
                            Text(item.sentence).font(.system(size: 18, weight: .semibold, design: .rounded)).foregroundStyle(KG.ink)
                            if app.p.showRomaji, let r = item.card.exampleRomaji {
                                Text(r).kgFont(13, .semibold).foregroundStyle(KG.pinkText)
                            }
                        }
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)
                        .transition(.opacity)
                    }
                    Spacer(minLength: 0)
                    Button(result == nil ? app.t("Comprobar", "Check") : app.t("Continuar", "Continue")) {
                        if result == nil { check(item) } else { next() }
                    }
                    .buttonStyle(result == false ? .chunkyRed : result == true ? .chunkyMint : .chunky)
                    .disabled(result == nil && chosen.isEmpty)
                    .opacity(result == nil && chosen.isEmpty ? 0.5 : 1)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 10)
                }
            }
        }
        .animation(.spring(response: 0.3, dampingFraction: 0.8), value: chosen)
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: result)
        .onAppear {
            if items.isEmpty {
                items = Array(SentenceBuilder.items(deck).shuffled().prefix(8))
                loadBank()
            }
        }
    }

    private func chipView(_ chip: Chip, filled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(chip.text)
                .font(.system(size: 19, weight: .semibold, design: .rounded))
                .foregroundStyle(KG.ink)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(filled ? KG.pinkSoft : .white)
                        .shadow(color: KG.ink.opacity(0.08), radius: 0, y: 3)
                )
        }
        .buttonStyle(.squish)
    }

    private func loadBank() {
        guard let item = items[safe: index] else { return }
        let others = items.flatMap(\.chunks).filter { !item.chunks.contains($0) }
        let distractors = Array(Set(others)).shuffled().prefix(max(2, 7 - item.chunks.count))
        bank = (item.chunks + distractors).enumerated().map { Chip(id: $0, text: $1) }.shuffled()
        chosen = []
    }

    private func check(_ item: SentenceBuilder.Item) {
        let ok = chosen.map(\.text).joined() == item.chunks.joined()
        result = ok
        if ok { correct += 1 }
        SoundPlayer.shared.play(ok ? .correct : .wrong)
        Speaker.shared.speak(item.sentence, rate: app.p.speechRate)
    }

    private func next() {
        result = nil
        if index + 1 >= items.count {
            app.addXP(correct * 4)
            SoundPlayer.shared.play(.finish)
            finished = true
        } else {
            index += 1
            loadBank()
        }
    }
}

// MARK: - Handwriting from memory

struct WriteSession: View {
    @Environment(AppModel.self) private var app
    var deck: Deck

    @State private var cards: [Card] = []
    @State private var index = 0
    @State private var pad: WritingPad?
    @State private var correct = 0
    @State private var finished = false

    /// Short kana/kanji cards that make sense to write by hand, and that have stroke data.
    static func writable(_ deck: Deck) -> [Card] {
        deck.cards.filter { c in
            let jp = c.jp.trimmingCharacters(in: .whitespaces)
            return (1...3).contains(jp.count) && jp.unicodeScalars.allSatisfy {
                (0x3040...0x30FF).contains($0.value) || (0x4E00...0x9FAF).contains($0.value)
            } && StrokeLibrary.has(jp)
        }
    }

    var body: some View {
        ZStack {
            KGBackground()
            if finished {
                ResultView(correct: correct, total: cards.count, xp: correct * 3, title: deck.title(app.lang))
            } else if let card = cards[safe: index], let pad {
                VStack(spacing: 14) {
                    SessionTopBar(progress: Double(index) / Double(max(cards.count, 1)), trailing: "\(index + 1)/\(cards.count)")
                    VStack(spacing: 6) {
                        Text(app.t("Escribe de memoria", "Write from memory"))
                            .kgFont(14, .bold).foregroundStyle(KG.muted)
                        Text(card.meaning(app.lang))
                            .kgFont(26, .bold).foregroundStyle(KG.ink)
                            .multilineTextAlignment(.center)
                        if card.romaji != card.meaning(app.lang) {
                            Text(card.romaji).kgFont(15, .semibold).foregroundStyle(KG.pinkText)
                        }
                    }
                    .padding(.horizontal, 20)

                    TraceCanvas(pad: pad)
                        .padding(.horizontal, 20)

                    if let report = pad.report {
                        VStack(spacing: 4) {
                            HStack(spacing: 10) {
                                Text(card.jp).font(.system(size: 34, weight: .semibold, design: .rounded)).foregroundStyle(KG.ink)
                                SpeakButton(text: card.kana ?? card.jp, size: 36)
                            }
                            if !report.ok, let message = pad.message(app) {
                                Text(message).kgFont(15, .semibold).foregroundStyle(KG.redDeep)
                            }
                        }
                        .transition(.opacity)
                    }
                    Spacer(minLength: 0)
                    StepFooter(result: pad.report?.ok, answer: nil, canCheck: pad.canCheck, check: check) {
                        next(ok: pad.report?.ok == true)
                    }
                }
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: pad?.report)
        .onAppear {
            if cards.isEmpty {
                cards = Array(Self.writable(deck).shuffled().prefix(8))
                load()
            }
        }
    }

    private func load() {
        pad = cards[safe: index].map { WritingPad(text: $0.jp, mode: .memory) }
    }

    private func check() {
        guard let pad, let card = cards[safe: index] else { return }
        pad.check()
        SoundPlayer.shared.play(pad.report?.ok == true ? .correct : .wrong)
        Speaker.shared.speak(card.kana ?? card.jp, rate: app.p.speechRate)
    }

    private func next(ok: Bool) {
        if ok { correct += 1 }
        if index + 1 >= cards.count {
            app.addXP(correct * 3)
            SoundPlayer.shared.play(.finish)
            finished = true
        } else {
            index += 1
            load()
        }
    }
}

extension Array {
    subscript(safe i: Int) -> Element? { indices.contains(i) ? self[i] : nil }
}
