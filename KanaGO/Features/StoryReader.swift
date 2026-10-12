import SwiftUI

// MARK: - Reader look (persisted per device)

enum ReaderTheme: String, CaseIterable, Identifiable {
    case paper, sepia, night
    var id: String { rawValue }

    var background: Color {
        switch self {
        case .paper: Color(hex: 0xFAF7F2)
        case .sepia: Color(hex: 0xF4ECD8)
        case .night: KG.inkDeep
        }
    }

    var ink: Color {
        switch self {
        case .paper: KG.ink
        case .sepia: Color(hex: 0x4A3A2C)
        case .night: Color(hex: 0xECE8EE)
        }
    }

    /// Secondary text: ≥ 4.5:1 on its background.
    var soft: Color {
        switch self {
        case .paper: KG.muted
        case .sepia: Color(hex: 0x6E5848)
        case .night: .white.opacity(0.6)
        }
    }

    /// Romaji, highlights and active tools (pinkText is 4.8:1 on sepia; candy 6:1 on ink).
    var accent: Color { self == .night ? KG.candy : KG.pinkText }

    /// Toolbar and cards floating over the page.
    var chrome: Color {
        switch self {
        case .paper: .white
        case .sepia: Color(hex: 0xFBF5E6)
        case .night: Color(hex: 0x232127)
        }
    }

    var line: Color {
        switch self {
        case .paper: KG.line
        case .sepia: Color(hex: 0xE2D4B4)
        case .night: .white.opacity(0.12)
        }
    }

    var scheme: ColorScheme { self == .night ? .dark : .light }

    func name(_ app: AppModel) -> String {
        switch self {
        case .paper: app.t("Papel", "Paper")
        case .sepia: "Sepia"
        case .night: app.t("Noche", "Night")
        }
    }
}

enum ReaderSize: Int, CaseIterable {
    case small, medium, large

    var japanese: CGFloat { [19, 22, 26][rawValue] }
    var romaji: CGFloat { [11, 12, 14][rawValue] }
    var translation: CGFloat { [15, 16, 18][rawValue] }
}

// MARK: - Immersive story reader

/// A story as a page to read: the Japanese on its own, a word-by-word romaji line under it
/// (the app-wide "Show romaji" switch), words that open their meaning when tapped, paragraph
/// translations on demand and a read-along that follows the narrator paragraph by paragraph.
struct StoryReader: View {
    @Environment(AppModel.self) private var app
    @Environment(\.dismiss) private var dismiss
    var story: Story
    var onQuiz: () -> Void

    @AppStorage("reader.theme") private var theme: ReaderTheme = .paper
    @AppStorage("reader.size") private var size: ReaderSize = .medium
    @State private var showTranslation = false
    @State private var showDisplay = false
    /// "paragraph#unit" of the word whose card is open.
    @State private var selected: String?
    /// Paragraph the narrator is reading; nil when not playing.
    @State private var reading: Int?
    @State private var progress: Double = 0
    @State private var chromeHidden = false
    @State private var lastOffset: CGFloat = 0

    private var paragraphs: [(jp: String, translation: String?)] { story.paragraphs(app.lang) }

    var body: some View {
        ZStack {
            theme.background.ignoresSafeArea()
            page
            VStack(spacing: 0) {
                topBar
                Spacer()
                toolbar
            }
        }
        .preferredColorScheme(theme.scheme)
        .sensoryFeedback(.selection, trigger: selected) { _, new in new != nil }
        .animation(.easeInOut(duration: 0.35), value: theme)
        .onDisappear { Speaker.shared.stop() }
    }

    // MARK: Page

    private var page: some View {
        GeometryReader { outer in
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: 30) {
                        header
                        ForEach(Array(paragraphs.enumerated()), id: \.offset) { i, para in
                            paragraph(i, para.jp, para.translation)
                                .id("p\(i)")
                        }
                        ending
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 76)
                    .padding(.bottom, 150)
                    .frame(maxWidth: 680)
                    .frame(maxWidth: .infinity)
                    .contentShape(Rectangle())
                    // tapping the page (not a word) brings the tools back or tucks them away
                    .onTapGesture { withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) { chromeHidden.toggle() } }
                    .background(GeometryReader { g in
                        Color.clear.preference(key: ReaderScrollKey.self,
                                               value: [g.frame(in: .named("reader")).minY, g.size.height])
                    })
                }
                .scrollIndicators(.hidden)
                .coordinateSpace(name: "reader")
                .onPreferenceChange(ReaderScrollKey.self) { m in
                    guard m.count == 2 else { return }
                    scrolled(offset: -m[0], content: m[1], viewport: outer.size.height)
                }
                .onChange(of: reading) { _, i in
                    guard let i else { return }
                    withAnimation(.spring(response: 0.6, dampingFraction: 0.9)) {
                        proxy.scrollTo("p\(i)", anchor: UnitPoint(x: 0.5, y: 0.2))
                    }
                }
            }
        }
    }

    private func scrolled(offset: CGFloat, content: CGFloat, viewport: CGFloat) {
        let span = max(content - viewport, 1)
        progress = min(max(offset / span, 0), 1)
        // like a book: the tools step aside while reading on and come back when scrolling up
        let hide: Bool? = offset < 60 || progress > 0.97 ? false
            : offset > lastOffset + 8 ? true
            : offset < lastOffset - 8 ? false : nil
        if let hide, hide != chromeHidden, selected == nil, !showDisplay {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) { chromeHidden = hide }
        }
        if abs(offset - lastOffset) > 8 { lastOffset = offset }
    }

    private var header: some View {
        VStack(spacing: 10) {
            Text(story.emoji).font(.system(size: 58))
            Text(story.title(app.lang))
                .kgFont(30, .bold)
                .foregroundStyle(theme.ink)
                .multilineTextAlignment(.center)
            HStack(spacing: 8) {
                Pill(text: story.level, color: KG.levelColor(story.level) == KG.ink ? KG.pink : KG.levelColor(story.level))
                Text(app.t("\(minutes) min de lectura", "\(minutes) min read"))
                    .kgFont(13, .semibold)
                    .foregroundStyle(theme.soft)
            }
            Text(app.t("Toca una palabra para ver qué significa", "Tap any word to see what it means"))
                .kgText(13, .medium)
                .foregroundStyle(theme.soft)
                .padding(.top, 4)
        }
        .frame(maxWidth: .infinity)
        .padding(.bottom, 6)
    }

    /// Learner pace, about 150 characters a minute.
    private var minutes: Int { max(1, Int((Double(story.bodyJp.count) / 150).rounded())) }

    private func paragraph(_ i: Int, _ jp: String, _ translation: String?) -> some View {
        let dimmed = reading != nil && reading != i
        return VStack(alignment: .leading, spacing: 14) {
            if let words = story.bodyWords?[safe: i] {
                FlowLayout(spacing: app.p.showRomaji ? 8 : 3, lineSpacing: app.p.showRomaji ? 14 : 12) {
                    ForEach(Array(words.enumerated()), id: \.offset) { j, w in
                        wordView(w, id: "\(i)#\(j)")
                    }
                }
            } else {
                Text(jp)
                    .font(.system(size: size.japanese, weight: .medium))
                    .foregroundStyle(theme.ink)
                    .lineSpacing(10)
            }
            if showTranslation, let translation {
                Text(translation)
                    .font(.system(size: size.translation).italic())
                    .foregroundStyle(theme.soft)
                    .lineSpacing(4)
                    .padding(.leading, 14)
                    .overlay(alignment: .leading) { Capsule().fill(theme.accent.opacity(0.6)).frame(width: 3) }
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .opacity(dimmed ? 0.3 : 1)
        .animation(.easeInOut(duration: 0.4), value: dimmed)
    }

    private func wordView(_ w: StoryWord, id: String) -> some View {
        let open = Binding(get: { selected == id }, set: { if !$0, selected == id { selected = nil } })
        return VStack(alignment: .leading, spacing: 2) {
            japanese(w)
                .font(.system(size: size.japanese, weight: .medium))
                .foregroundStyle(theme.ink)
            if app.p.showRomaji, let r = w.romaji {
                Text(r)
                    .font(.kg(size.romaji, .semibold))
                    .foregroundStyle(theme.accent)
            }
        }
        .padding(.horizontal, 3)
        .padding(.vertical, 2)
        .background(RoundedRectangle(cornerRadius: 8, style: .continuous)
            .fill(theme.accent.opacity(selected == id ? 0.16 : 0)))
        .contentShape(Rectangle())
        .onTapGesture {
            guard w.romaji != nil else { return }
            selected = id
        }
        .popover(isPresented: open, arrowEdge: .bottom) {
            WordCard(info: info(w), unit: w, theme: theme)
                .presentationCompactAdaptation(.popover)
                .presentationBackground(theme.chrome)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(app.p.showRomaji ? "\(w.jp), \(w.romaji ?? "")" : w.jp)
        .accessibilityAddTraits(.isButton)
    }

    /// The unit as printed, with a dotted underline under the story's vocabulary word.
    private func japanese(_ w: StoryWord) -> Text {
        guard w.vocab != nil, let r = w.jp.range(of: w.word) else { return Text(w.jp) }
        return Text(w.jp[..<r.lowerBound])
            + Text(w.jp[r]).underline(pattern: .dot, color: theme.accent)
            + Text(w.jp[r.upperBound...])
    }

    // MARK: End of the story: vocabulary and quiz

    private var ending: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 12) {
                Capsule().fill(theme.line).frame(height: 2)
                Text("おわり").font(.system(size: 15, weight: .semibold)).foregroundStyle(theme.soft)
                Capsule().fill(theme.line).frame(height: 2)
            }
            .padding(.vertical, 10)

            if !story.vocab.isEmpty {
                Text(app.t("Palabras de la historia", "Words from the story"))
                    .kgFont(19, .bold)
                    .foregroundStyle(theme.ink)
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible())], spacing: 10) {
                    ForEach(story.vocab, id: \.jp) { v in vocabCard(v) }
                }
            }

            if !story.quiz.isEmpty {
                Button {
                    Speaker.shared.stop()
                    onQuiz()
                } label: {
                    Label(app.t("Hacer el quiz (\(story.quiz.count))", "Take the quiz (\(story.quiz.count))"), hi: .chatDone)
                }
                .buttonStyle(.chunky)
                .padding(.top, 8)
            }
        }
    }

    private func vocabCard(_ v: StoryVocab) -> some View {
        Button { Speaker.shared.speak(v.kana, rate: app.p.speechRate) } label: {
            VStack(alignment: .leading, spacing: 2) {
                Text(v.jp)
                    .font(.system(size: 19, weight: .semibold))
                    .foregroundStyle(theme.ink)
                    .padding(.trailing, 30)
                if v.kana != v.jp {
                    Text(v.kana).kgFont(12, .semibold).foregroundStyle(theme.soft)
                }
                if app.p.showRomaji, let r = v.romaji {
                    Text(r).kgFont(12, .semibold).foregroundStyle(theme.accent)
                }
                Text(v.meaning(app.lang)).kgText(12, .medium).foregroundStyle(theme.soft)
                    .lineLimit(2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(theme.chrome))
            .overlay(RoundedRectangle(cornerRadius: 18, style: .continuous).strokeBorder(theme.line))
        }
        .buttonStyle(.squish)
        .overlay(alignment: .topTrailing) {
            SaveWordButton(word: SavedWord(story: v, source: source), size: 30, dark: theme == .night)
                .padding(8)
        }
    }

    private var source: String { "\(story.emoji) \(story.title(app.lang))" }

    // MARK: Chrome

    private var topBar: some View {
        HStack(spacing: 12) {
            Button { dismiss() } label: {
                HugeIcon(.cancel, size: 20)
                    .foregroundStyle(theme.ink)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(theme.chrome))
                    .overlay(Circle().strokeBorder(theme.line))
            }
            .buttonStyle(.squish)
            .accessibilityLabel(app.t("Cerrar", "Close"))
            ProgressBarKG(value: progress, color: theme.accent, track: theme.line, height: 6)
        }
        .padding(.horizontal, 16)
        .padding(.top, 6)
        .opacity(chromeHidden ? 0 : 1)
        .offset(y: chromeHidden ? -80 : 0)
    }

    private var toolbar: some View {
        HStack(spacing: 2) {
            tool(app.t("Traducir", "Translate"), active: showTranslation) {
                HugeIcon(.translate, size: 21)
            } action: {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) { showTranslation.toggle() }
            }
            tool(reading == nil ? app.t("Escuchar", "Listen") : app.t("Pausa", "Pause"), active: reading != nil) {
                HugeIcon(reading == nil ? .play : .pause, size: 21, filled: reading != nil)
            } action: { toggleAudio() }
            tool("Romaji", active: app.p.showRomaji) {
                Text("Ro").font(.kg(17, .bold)).frame(height: 21)
            } action: {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) { app.p.showRomaji.toggle() }
            }
            tool(app.t("Texto", "Text"), active: showDisplay) {
                HugeIcon(.textFont, size: 21)
            } action: { showDisplay = true }
            .popover(isPresented: $showDisplay, arrowEdge: .bottom) {
                displayPanel
                    .presentationCompactAdaptation(.popover)
                    .presentationBackground(theme.chrome)
            }
        }
        .padding(5)
        .background(Capsule().fill(theme.chrome).shadow(color: .black.opacity(0.12), radius: 18, y: 8))
        .overlay(Capsule().strokeBorder(theme.line))
        .padding(.bottom, 8)
        .opacity(chromeHidden ? 0 : 1)
        .offset(y: chromeHidden ? 120 : 0)
    }

    private func tool<Icon: View>(_ label: String, active: Bool, @ViewBuilder icon: () -> Icon,
                                  action: @escaping () -> Void) -> some View {
        let icon = icon()
        return Button(action: action) {
            VStack(spacing: 3) {
                icon
                Text(label).kgFont(10, .bold).lineLimit(1).minimumScaleFactor(0.8)
            }
            .foregroundStyle(active ? theme.accent : theme.ink)
            .frame(width: 70, height: 52)
            .background(Capsule().fill(theme.accent.opacity(active ? 0.14 : 0)))
        }
        .buttonStyle(.squish)
        .accessibilityAddTraits(active ? .isSelected : [])
    }

    private var displayPanel: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(app.t("Página", "Page")).kgFont(13, .bold).foregroundStyle(theme.soft)
            HStack(spacing: 14) {
                ForEach(ReaderTheme.allCases) { t in
                    Button { theme = t } label: {
                        VStack(spacing: 6) {
                            Text("あ")
                                .font(.system(size: 20, weight: .medium))
                                .foregroundStyle(t.ink)
                                .frame(width: 52, height: 52)
                                .background(Circle().fill(t.background))
                                .overlay(Circle().strokeBorder(theme == t ? theme.accent : theme.line,
                                                               lineWidth: theme == t ? 3 : 1))
                            Text(t.name(app)).kgFont(11, .semibold).foregroundStyle(theme.soft)
                        }
                    }
                    .buttonStyle(.squish)
                }
            }
            Text(app.t("Tamaño", "Size")).kgFont(13, .bold).foregroundStyle(theme.soft).padding(.top, 4)
            HStack(spacing: 0) {
                ForEach(ReaderSize.allCases, id: \.self) { s in
                    Button { size = s } label: {
                        Text("あ")
                            .font(.system(size: [14, 18, 23][s.rawValue], weight: .medium))
                            .foregroundStyle(size == s ? theme.accent : theme.ink)
                            .frame(maxWidth: .infinity, minHeight: 44)
                            .background(RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(theme.accent.opacity(size == s ? 0.14 : 0)))
                    }
                    .buttonStyle(.squish)
                }
            }
        }
        .padding(18)
        .frame(width: 236)
    }

    // MARK: Read-along

    private func toggleAudio() {
        if reading != nil {
            Speaker.shared.stop()
            return
        }
        let texts = paragraphs.map { $0.jp }
        Speaker.shared.speakSequence(texts, rate: app.p.speechRate) { i in reading = i }
    }

    // MARK: Lookup

    private func info(_ w: StoryWord) -> WordInfo {
        if let jp = w.vocab, let v = story.vocab.first(where: { $0.jp == jp }) {
            return WordInfo(word: v.jp, kana: v.kana, romaji: v.romaji, meaning: v.meaning(app.lang),
                            save: SavedWord(story: v, source: source), speak: v.kana)
        }
        for key in [w.word, w.base, w.core].compactMap({ $0 }) {
            if let card = app.content.cardsByWord[key] {
                return WordInfo(word: card.jp, kana: card.kana, romaji: card.romaji, meaning: card.meaning(app.lang),
                                save: SavedWord(card: card, source: source), speak: card.kana ?? card.jp)
            }
        }
        return WordInfo(word: w.core, kana: w.kana, romaji: w.romaji, meaning: nil, save: nil, speak: w.core)
    }
}

private struct ReaderScrollKey: PreferenceKey {
    static let defaultValue: [CGFloat] = []
    static func reduce(value: inout [CGFloat], nextValue: () -> [CGFloat]) {
        let next = nextValue()
        if !next.isEmpty { value = next }
    }
}

// MARK: - Word card

struct WordInfo {
    let word: String
    let kana: String?
    let romaji: String?
    /// nil when the word isn't in the story's vocabulary or any deck.
    let meaning: String?
    let save: SavedWord?
    let speak: String
}

/// The bubble a tapped word opens: dictionary entry, reading, meaning, listen and save — and,
/// when the text uses another form ("起きます" for 起きる), that form too.
private struct WordCard: View {
    @Environment(AppModel.self) private var app
    var info: WordInfo
    var unit: StoryWord
    var theme: ReaderTheme

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(info.word)
                        .font(.system(size: 28, weight: .bold))
                        .foregroundStyle(theme.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)
                    if let reading { Text(reading).kgFont(14, .semibold).foregroundStyle(theme.accent) }
                }
                Spacer(minLength: 0)
                SpeakButton(text: info.speak, size: 36)
                if let save = info.save {
                    SaveWordButton(word: save, size: 36, dark: theme == .night)
                }
            }
            if let meaning = info.meaning {
                Text(meaning)
                    .kgFont(17, .semibold)
                    .foregroundStyle(theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
            } else {
                Text(app.t("Aún no está en tus mazos. Escúchala y mira la traducción del párrafo.",
                           "Not in your decks yet. Listen to it and check the paragraph translation."))
                    .kgText(13, .medium)
                    .foregroundStyle(theme.soft)
                    .fixedSize(horizontal: false, vertical: true)
            }
            if unit.core != info.word, info.meaning != nil {
                HStack(spacing: 6) {
                    Text(app.t("En el texto", "In the text")).kgFont(12, .bold).foregroundStyle(theme.soft)
                    Text(unit.core).font(.system(size: 15, weight: .medium)).foregroundStyle(theme.ink)
                    if app.p.showRomaji, let r = unit.romaji {
                        Text(r).kgFont(12, .semibold).foregroundStyle(theme.accent)
                    }
                }
                .lineLimit(1)
                .minimumScaleFactor(0.7)
                .padding(.top, 2)
            }
        }
        .padding(16)
        .frame(width: 280, alignment: .leading)
    }

    /// Kana (when the word has kanji) and romaji (when the switch is on).
    private var reading: String? {
        let kana = info.kana.flatMap { $0 == info.word ? nil : $0 }
        let romaji = app.p.showRomaji ? info.romaji : nil
        let parts = [kana, romaji].compactMap { $0 }
        return parts.isEmpty ? nil : parts.joined(separator: " · ")
    }
}
