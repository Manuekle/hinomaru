import SwiftUI

struct LearnView: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router
    @State private var level = ""
    @Namespace private var ns

    private static let chips = ["Kana", "Survival", "N5", "N4", "N3", "N2", "N1"]

    private var decks: [Deck] {
        level == "Kana"
            ? app.content.decks.filter { ["Hiragana", "Katakana"].contains($0.kind) }
            : app.content.decks.filter { $0.level == level }
    }

    var body: some View {
        @Bindable var router = router
        NavigationStack(path: $router.learnPath) {
            ZStack {
                KGBackground()
                ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(app.t("El japonés tiene", "Japanese is"))
                                .kgFont(17, .semibold).foregroundStyle(KG.pinkText)
                            Text(app.t("más estructura de lo que parece", "more structured than it looks"))
                                .kgFont(28, .bold).foregroundStyle(KG.ink)
                        }
                        .padding(.top, 8)

                        modePicker
                        levelChips

                        if router.learnMode == .jlpt {
                            JLPTPanel(level: level)
                        } else if router.learnMode == .path, let roadmap = app.content.level(level) {
                            RoadmapPath(level: roadmap)
                        } else {
                            ForEach(decks) { deck in
                                NavigationLink(value: deck.id) {
                                    DeckRow(deck: deck)
                                }
                                .buttonStyle(.squish)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
                .onChange(of: level) { scrollToCurrent(proxy) }
                .onChange(of: router.learnMode) { _, mode in
                    if mode == .jlpt, !JLPT.levels.contains(level) { level = app.studyLevel }
                    scrollToCurrent(proxy)
                }
                .onAppear { scrollToCurrent(proxy) }
                }
            }
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: String.self) { id in
                if let deck = app.content.deck(id) { DeckDetailView(deck: deck) }
            }
            .onAppear {
                if level.isEmpty { level = app.nextLesson?.level.key ?? "N5" }
                if router.learnMode == .jlpt, !JLPT.levels.contains(level) { level = app.studyLevel }
            }
        }
    }

    /// Brings the next lesson of the selected level into view.
    private func scrollToCurrent(_ proxy: ScrollViewProxy) {
        guard router.learnMode == .path, let lv = app.content.level(level), let current = app.currentLesson(in: lv),
              lv.lessons.first != current else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.9)) { proxy.scrollTo(current.id, anchor: .center) }
        }
    }

    private var modePicker: some View {
        HStack(spacing: 4) {
            ForEach(LearnMode.allCases, id: \.self) { mode in
                let on = router.learnMode == mode
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) { router.learnMode = mode }
                } label: {
                    Label(modeTitle(mode), hi: modeIcon(mode), size: 18, filled: on)
                        .kgFont(16, .semibold)
                        .lineLimit(1)
                        .foregroundStyle(on ? .white : KG.inkSoft)
                        .frame(maxWidth: .infinity)
                        .frame(height: 46)
                        .background {
                            if on {
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .fill(mode == .path ? KG.pink : mode == .decks ? KG.ink : KG.sky)
                                    .matchedGeometryEffect(id: "learnMode", in: ns)
                            }
                        }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(5)
        .sticker(radius: 21)
        .sensoryFeedback(.selection, trigger: router.learnMode)
    }

    private func modeTitle(_ mode: LearnMode) -> String {
        switch mode {
        case .path: return app.t("Ruta", "Path")
        case .decks: return app.t("Mazos", "Decks")
        case .jlpt: return "JLPT"
        }
    }

    private func modeIcon(_ mode: LearnMode) -> HI {
        switch mode {
        case .path: return .route
        case .decks: return .cards
        case .jlpt: return .exam
        }
    }

    private var levelChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(router.learnMode == .jlpt ? JLPT.levels : Self.chips, id: \.self) { l in
                    let on = l == level
                    let fill = l == "Kana" ? KG.pink : KG.levelColor(l)
                    Button {
                        withAnimation(.spring(response: 0.3)) { level = l }
                    } label: {
                        Text(l == "Survival" ? app.t("✈️ Viaje", "✈️ Travel") : l == "Kana" ? "あ Kana" : l)
                            .kgFont(16, .bold)
                            .foregroundStyle(on ? KG.on(fill) : KG.ink)
                            .padding(.horizontal, 18)
                            .frame(height: 42)
                            .background(Capsule().fill(on ? fill : .white))
                            .shadow(color: KG.ink.opacity(0.06), radius: 6, y: 3)
                    }
                    .buttonStyle(.squish)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 6)
        }
        .scrollClipDisabled() // keep the chips' shadows whole
        .padding(.horizontal, -20)
        .sensoryFeedback(.selection, trigger: level)
    }
}

struct DeckRow: View {
    @Environment(AppModel.self) private var app
    var deck: Deck

    var body: some View {
        let color = KG.levelColor(deck.level)
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(color.opacity(0.16))
                HugeIcon(deck.icon, size: 28)
                    .foregroundStyle(color == KG.ink ? KG.ink : color)
            }
            .frame(width: 58, height: 58)

            VStack(alignment: .leading, spacing: 5) {
                HStack(spacing: 6) {
                    Text(deck.kindName(app.lang).uppercased())
                        .kgFont(11, .bold).foregroundStyle(KG.muted)
                    Text("· \(deck.itemCount)")
                        .kgFont(11, .bold).foregroundStyle(KG.muted)
                }
                Text(deck.title(app.lang))
                    .kgFont(17, .bold)
                    .foregroundStyle(KG.ink)
                    .multilineTextAlignment(.leading)
                    .lineLimit(2)
                if !deck.isGrammar {
                    ProgressBarKG(value: app.deckProgress(deck), color: color == KG.ink ? KG.pink : color, height: 8)
                }
            }
            Spacer(minLength: 0)
            HugeIcon(.chevronRight, size: 18).foregroundStyle(KG.line)
        }
        .padding(14)
        .sticker(radius: 24)
    }
}

struct DeckDetailView: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router
    var deck: Deck
    @State private var expanded: String?

    var body: some View {
        ZStack(alignment: .bottom) {
            KGBackground()
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    header
                    if !deck.isGrammar {
                        StudyModesGrid(deck: deck)
                        SectionTitle(app.t("Tarjetas", "Cards"), jp: "カード")
                            .padding(.top, 4)
                    }
                    if deck.isGrammar {
                        ForEach(deck.grammar) { g in GrammarCard(point: g, expanded: expanded == g.id) {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                                expanded = expanded == g.id ? nil : g.id
                            }
                        } }
                    } else {
                        ForEach(deck.cards, id: \.jp) { c in CardRow(deck: deck, card: c) }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, deck.isGrammar ? 30 : 120)
            }
            if !deck.isGrammar {
                Button { router.session = .flashcards(deckId: deck.id) } label: {
                    Label(app.t("Estudiar con tarjetas", "Study flashcards"), hi: .flashcards)
                }
                .buttonStyle(.chunky)
                .padding(.horizontal, 20)
                .padding(.bottom, 8)
                .padding(.top, 12)
                .background(
                    LinearGradient(colors: [KG.cream.opacity(0), KG.cream], startPoint: .top, endPoint: .center)
                        .ignoresSafeArea()
                )
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.hidden, for: .tabBar) // the floating study button takes its place
    }

    private var header: some View {
        let color = KG.levelColor(deck.level)
        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                Pill(text: deck.level == "Survival" ? app.t("Viaje", "Travel") : deck.level, color: color)
                Pill(text: deck.kindName(app.lang), color: KG.paper, foreground: KG.inkSoft)
                Spacer()
            }
            Text(deck.title(app.lang)).kgFont(30, .bold).foregroundStyle(KG.ink)
            Text(deck.desc(app.lang)).kgText(16).foregroundStyle(KG.inkSoft)
            if !deck.isGrammar {
                HStack(spacing: 10) {
                    statBox("\(app.learnedCount(deck))", app.t("dominadas", "mastered"), KG.mint)
                    statBox("\(app.seenCount(deck))", app.t("vistas", "seen"), KG.sky)
                    statBox("\(deck.cards.count)", app.t("total", "total"), KG.pink)
                }
            }
        }
    }

    private func statBox(_ value: String, _ label: String, _ color: Color) -> some View {
        VStack(spacing: 2) {
            Text(value).kgFont(22, .bold).foregroundStyle(color)
            Text(label).kgFont(12, .semibold).foregroundStyle(KG.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .sticker(radius: 18)
    }
}

struct CardRow: View {
    @Environment(AppModel.self) private var app
    var deck: Deck
    var card: Card

    var body: some View {
        let state = app.state(deck.cardKey(card))
        HStack(spacing: 12) {
            Circle()
                .fill(state?.isLearned == true ? KG.mint : (state != nil ? KG.sun : KG.line))
                .frame(width: 10, height: 10)
            VStack(alignment: .leading, spacing: 3) {
                Text(card.jp).font(.system(size: 22, weight: .semibold, design: .rounded)).foregroundStyle(KG.ink)
                if app.p.showRomaji, card.romaji != card.jp {
                    Text(card.romaji).kgText(13, .medium).foregroundStyle(KG.pinkText)
                }
                Text(card.meaning(app.lang)).kgText(14).foregroundStyle(KG.inkSoft)
            }
            Spacer(minLength: 0)
            SpeakButton(text: card.kana ?? card.jp, size: 36)
        }
        .padding(14)
        .sticker(radius: 20)
    }
}

struct GrammarCard: View {
    @Environment(AppModel.self) private var app
    var point: GrammarPoint
    var expanded: Bool
    var toggle: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button(action: toggle) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(point.pattern).kgFont(22, .bold).foregroundStyle(KG.ink)
                        Text(point.meaning(app.lang)).kgText(15, .medium).foregroundStyle(KG.pinkText)
                            .multilineTextAlignment(.leading)
                    }
                    Spacer()
                    HugeIcon(.chevronDown, size: 18)
                        .foregroundStyle(KG.muted)
                        .rotationEffect(.degrees(expanded ? 180 : 0))
                }
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)

            if expanded {
                Text(point.usage)
                    .kgText(14)
                    .foregroundStyle(KG.inkSoft)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 14).fill(KG.cream))
                ForEach(point.examples, id: \.jp) { ex in
                    HStack(alignment: .top, spacing: 10) {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(ex.jp).font(.system(size: 18, weight: .semibold, design: .rounded)).foregroundStyle(KG.ink)
                            if app.p.showRomaji, let r = ex.romaji {
                                Text(r).kgText(13, .medium).foregroundStyle(KG.pinkText)
                            }
                            Text(app.lang == .es ? ex.es : ex.en).kgText(13).foregroundStyle(KG.muted)
                        }
                        Spacer(minLength: 0)
                        SpeakButton(text: ex.jp, size: 32)
                    }
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding(16)
        .sticker(radius: 22)
    }
}
