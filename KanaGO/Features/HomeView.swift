import SwiftUI

struct HomeView: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router

    private var greeting: String {
        let h = Calendar.current.component(.hour, from: .now)
        switch h {
        case 5..<12: return "おはよう"
        case 12..<18: return "こんにちは"
        default: return "こんばんは"
        }
    }

    private var nextDeck: Deck? {
        let order = ["n5-hiragana", "n5-katakana", "n5-greetings", "n5-numbers", "n5-food", "n5-verbs", "n5-adjectives"]
        for id in order {
            if let d = app.content.deck(id), app.deckProgress(d) < 0.9 { return d }
        }
        return app.content.decks.first { !$0.isGrammar && app.deckProgress($0) < 0.9 }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                KGBackground()
                ScrollView {
                    VStack(alignment: .leading, spacing: 28) {
                        header
                        VStack(spacing: 14) {
                            hero
                            weekCard
                        }
                        todaySection
                        practiceSection
                        survivalRow
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 32)
                }
            }
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    // MARK: Header

    private var header: some View {
        HStack(alignment: .center, spacing: 10) {
            VStack(alignment: .leading, spacing: 0) {
                Text(greeting)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(KG.pinkText)
                Text(app.p.name.isEmpty ? app.t("¡Hola!", "Hello!") : app.p.name)
                    .kgFont(30, .bold)
                    .foregroundStyle(KG.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            Spacer(minLength: 8)
            StatChip(icon: .fire, value: "\(app.p.streak)", color: app.p.streak > 0 ? KG.flame : KG.off, filled: true)
            StatChip(icon: .star, value: "\(app.p.xp)", color: KG.sun, filled: true)
        }
    }

    // MARK: Next step

    private var hero: some View {
        let due = app.dueCount
        let next = app.nextLesson
        let eyebrow = due > 0 ? app.t("Hora de repasar", "Review time") : app.t("Tu siguiente lección", "Your next lesson")
        let title = due > 0
            ? (due == 1 ? app.t("1 tarjeta te extraña", "1 card misses you") : app.t("\(due) tarjetas te extrañan", "\(due) cards miss you"))
            : (next?.lesson.title(app.lang) ?? nextDeck?.title(app.lang) ?? app.t("¡Todo al día!", "All caught up!"))
        let detail = due > 0
            ? app.t("Un repaso rápido y vuelven a su sitio.", "A quick review puts them back in place.")
            : next.map { "\($0.level.key == "Survival" ? app.t("Viaje", "Travel") : $0.level.key) · \($0.unit.title(app.lang))" }

        return VStack(alignment: .leading, spacing: 0) {
            Text(eyebrow)
                .kgFont(13, .bold)
                .foregroundStyle(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(Capsule().fill(KG.pinkDeep.opacity(0.55))) // a white frost would wash out the white text
            Text(title)
                .kgFont(26, .bold)
                .foregroundStyle(.white)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.top, 14)
                .padding(.trailing, 96)
            if let detail {
                Text(detail)
                    .kgText(15, .semibold)
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .padding(.top, 6)
                    .padding(.trailing, 40)
            }
            if due == 0, let next {
                let progress = app.levelProgress(next.level)
                HStack(spacing: 10) {
                    ProgressBarKG(value: progress, color: .white, track: .white.opacity(0.25), height: 8)
                    Text("\(Int(progress * 100))%")
                        .kgFont(13, .bold)
                        .foregroundStyle(.white)
                        .monospacedDigit()
                }
                .padding(.top, 16)
            }
            Button {
                if due > 0 {
                    router.session = .review
                } else if let next {
                    router.session = .lesson(id: next.lesson.id)
                } else if let d = nextDeck {
                    router.session = .flashcards(deckId: d.id)
                }
            } label: {
                Label(due > 0 ? app.t("Repasar ahora", "Review now") : app.t("Empezar lección", "Start lesson"),
                      hi: .play, filled: true)
            }
            .buttonStyle(ChunkyButtonStyle(fill: .white, lip: .black.opacity(0.16), foreground: KG.pinkDeep, height: 52))
            .padding(.top, 18)
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(LinearGradient(colors: KG.pinkGradient, startPoint: .topLeading, endPoint: .bottomTrailing))
                .overlay(alignment: .bottomTrailing) {
                    Text("か")
                        .font(.system(size: 150, weight: .heavy))
                        .foregroundStyle(.white.opacity(0.09))
                        .offset(x: 12, y: 40)
                }
                .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        }
        .overlay(alignment: .topTrailing) {
            // Kana-chan sits on the card's edge like a sticker
            KanaBlob(mood: due > 0 ? .wow : .happy, size: 92)
                .offset(x: 6, y: -26)
        }
        .shadow(color: KG.pinkDeep.opacity(0.3), radius: 18, y: 10)
        .padding(.top, 18)
    }

    // MARK: Week

    private var weekCard: some View {
        let reached = app.goalProgress >= 1
        return HStack(spacing: 16) {
            ZStack {
                Circle().stroke(KG.line, lineWidth: 8)
                Circle()
                    .trim(from: 0, to: min(app.goalProgress, 1))
                    .stroke(reached ? KG.mint : KG.pink, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                HugeIcon(reached ? .tick : .target, size: 22, filled: reached)
                    .foregroundStyle(reached ? KG.mintDeep : KG.pink)
            }
            .frame(width: 58, height: 58)

            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .firstTextBaseline) {
                    Text(reached ? app.t("¡Meta cumplida!", "Goal reached!") : app.t("Meta diaria", "Daily goal"))
                        .kgFont(17, .bold)
                        .foregroundStyle(KG.ink)
                    Spacer()
                    Text("\(app.todayXP)/\(app.p.dailyGoal) XP")
                        .kgFont(14, .semibold)
                        .foregroundStyle(KG.muted)
                        .monospacedDigit()
                        .contentTransition(.numericText())
                }
                HStack(spacing: 0) {
                    ForEach(Array(app.weekXP.enumerated()), id: \.offset) { _, d in
                        let met = d.xp >= app.p.dailyGoal
                        VStack(spacing: 5) {
                            ZStack {
                                Circle()
                                    .fill(met ? KG.mint : (d.xp > 0 ? KG.pinkSoft : KG.cream))
                                // any practice keeps the streak, so it earns a tick; the goal turns it mint
                                if d.xp > 0 {
                                    HugeIcon(.tick, size: 13, filled: true).foregroundStyle(met ? .white : KG.pinkText)
                                }
                            }
                            .frame(width: 26, height: 26)
                            .overlay {
                                if d.isToday { Circle().strokeBorder(met ? KG.mintDeep : KG.pink, lineWidth: 2) }
                            }
                            Text(d.label)
                                .font(.system(size: 11, weight: d.isToday ? .bold : .medium))
                                .foregroundStyle(d.isToday ? (met ? KG.mintDeep : KG.pinkText) : KG.muted)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
        }
        .padding(16)
        .sticker(radius: 24)
        .animation(.spring, value: app.todayXP)
    }

    // MARK: Today

    private var todaySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionTitle(app.t("Hoy", "Today"), jp: "きょう")
            if let wotd = app.wordOfTheDay { wordCard(wotd.card) }
            HStack(spacing: 12) {
                if let story = app.storyOfTheDay { storyCard(story) }
                jlptCard
            }
        }
    }

    private func wordCard(_ card: Card) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Label(app.t("Palabra del día", "Word of the day"), hi: .calendar, size: 16)
                    .kgFont(13, .bold)
                    .foregroundStyle(KG.pinkText)
                Spacer()
                SaveWordButton(word: SavedWord(card: card, source: app.t("Palabra del día", "Word of the day")), size: 36)
                SpeakButton(text: card.kana ?? card.jp, size: 36)
            }
            VStack(alignment: .leading, spacing: 4) {
                HStack(alignment: .lastTextBaseline, spacing: 10) {
                    Text(card.jp)
                        .font(.system(size: 34, weight: .bold))
                        .foregroundStyle(KG.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)
                    if app.p.showRomaji {
                        Text(card.romaji).kgFont(15, .semibold).foregroundStyle(KG.pinkText)
                    }
                }
                if let kana = card.kana, kana != card.jp {
                    Text(kana).kgText(14).foregroundStyle(KG.muted)
                }
                Text(card.meaning(app.lang))
                    .kgFont(18, .semibold)
                    .foregroundStyle(KG.inkSoft)
                    .padding(.top, 2)
            }
            if let ex = card.example, ex != card.jp {
                VStack(alignment: .leading, spacing: 3) {
                    Text(ex).font(.system(size: 16, weight: .medium)).foregroundStyle(KG.ink)
                    if let m = card.exampleMeaning(app.lang) {
                        Text(m).kgText(14).foregroundStyle(KG.muted)
                    }
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(KG.cream))
            }
        }
        .padding(18)
        .sticker(radius: 24)
    }

    private func storyCard(_ story: Story) -> some View {
        Button { router.session = .story(id: story.id) } label: {
            tile(fill: KG.paper) {
                Text(story.emoji).font(.system(size: 30))
            } eyebrow: {
                Text(app.t("Historia del día", "Story of the day")).foregroundStyle(KG.muted)
            } title: {
                Text(story.title(app.lang)).foregroundStyle(KG.ink)
            } footer: {
                Pill(text: app.p.storiesRead[story.id] != nil ? app.t("Leída", "Read") : story.level,
                     color: app.p.storiesRead[story.id] != nil ? KG.mint
                         : (KG.levelColor(story.level) == KG.ink ? KG.pink : KG.levelColor(story.level)))
            }
        }
        .buttonStyle(.squish)
    }

    private var jlptCard: some View {
        let level = app.studyLevel
        let best = app.jlptBest(level, .mock)
        return Button {
            router.learnMode = .jlpt
            router.tab = .learn
        } label: {
            tile(fill: KG.ink) {
                HugeIcon(.exam, size: 30, filled: true).foregroundStyle(KG.candy).frame(height: 36)
            } eyebrow: {
                Text("模擬試験").foregroundStyle(.white.opacity(0.6))
            } title: {
                Text(app.t("Simulacro JLPT \(level)", "JLPT \(level) mock")).foregroundStyle(.white)
            } footer: {
                Pill(text: best.map { app.t("Mejor \($0)%", "Best \($0)%") } ?? app.t("Pruébalo", "Try it"),
                     color: best.map { $0 >= JLPT.passMark ? KG.mint : KG.sun } ?? KG.pink)
            }
        }
        .buttonStyle(.squish)
    }

    /// Small square card used across Home: art, eyebrow, two-line title and a footer.
    private func tile<A: View, E: View, T: View, F: View>(fill: Color,
                                                          @ViewBuilder art: () -> A,
                                                          @ViewBuilder eyebrow: () -> E,
                                                          @ViewBuilder title: () -> T,
                                                          @ViewBuilder footer: () -> F) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            art().frame(height: 36, alignment: .leading)
            eyebrow().kgFont(12, .semibold).padding(.top, 4)
            title()
                .kgFont(16, .bold)
                .lineLimit(2, reservesSpace: true)
                .multilineTextAlignment(.leading)
            footer().padding(.top, 4)
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .sticker(fill, radius: 24)
    }

    // MARK: Practice

    private var practiceSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionTitle(app.t("Sigue practicando", "Keep practicing"), jp: "れんしゅう")
            HStack(spacing: 12) {
                ForEach(Script.allCases) { s in
                    let mastery = app.kanaMastery(s)
                    let color = s == .hiragana ? KG.pink : KG.sky
                    Button { router.tab = .kana } label: {
                        HStack(spacing: 12) {
                            Text(s == .hiragana ? "あ" : "ア")
                                .font(.system(size: 26, weight: .bold))
                                .foregroundStyle(color)
                                .frame(width: 48, height: 48)
                                .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(color.opacity(0.12)))
                            VStack(alignment: .leading, spacing: 6) {
                                Text(s.latin).kgFont(16, .bold).foregroundStyle(KG.ink)
                                ProgressBarKG(value: mastery, color: color, height: 6)
                                Text("\(Int(mastery * 100))%").kgFont(12, .semibold).foregroundStyle(KG.muted)
                            }
                        }
                        .padding(14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .sticker(radius: 22)
                    }
                    .buttonStyle(.squish)
                }
            }
            HStack(spacing: 12) {
                exploreCard(.read, emoji: "📖", title: app.t("Historias", "Stories"),
                            done: app.p.storiesRead.count, total: app.content.stories.count, dark: false)
                exploreCard(.sing, emoji: "🎤", title: app.t("Canciones", "Songs"),
                            done: app.p.songsDone.count, total: app.content.songs.count, dark: true)
            }
        }
    }

    private func exploreCard(_ seg: ExploreSegment, emoji: String, title: String, done: Int, total: Int, dark: Bool) -> some View {
        let fg: Color = dark ? .white : KG.ink
        return Button {
            router.explore = seg
            router.tab = .talk
        } label: {
            HStack(spacing: 12) {
                Text(emoji).font(.system(size: 26))
                    .frame(width: 48, height: 48)
                    .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(fg.opacity(0.08)))
                VStack(alignment: .leading, spacing: 6) {
                    Text(title).kgFont(16, .bold).foregroundStyle(fg)
                    ProgressBarKG(value: Double(done) / Double(max(total, 1)), color: KG.pink, track: fg.opacity(0.12), height: 6)
                    Text("\(done)/\(total)").kgFont(12, .semibold).foregroundStyle(fg.opacity(0.6))
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .sticker(dark ? KG.ink : KG.paper, radius: 22)
        }
        .buttonStyle(.squish)
    }

    // MARK: Travel

    private var survivalRow: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionTitle(app.t("Para el Tokio real", "For real Tokyo"), jp: "サバイバル")
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(app.content.decks.filter { $0.level == "Survival" }) { d in
                        Button { router.session = .flashcards(deckId: d.id) } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(survivalEmoji(d.id)).font(.system(size: 30))
                                Text(d.title(app.lang))
                                    .kgFont(15, .bold)
                                    .foregroundStyle(KG.ink)
                                    .lineLimit(2, reservesSpace: true)
                                    .multilineTextAlignment(.leading)
                                ProgressBarKG(value: app.deckProgress(d), color: KG.sun, height: 6)
                            }
                            .padding(14)
                            .frame(width: 148)
                            .sticker(radius: 22)
                        }
                        .buttonStyle(.squish)
                    }
                }
                .padding(.vertical, 10)
                .padding(.horizontal, 20)
            }
            // the cards' shadow reaches ~22pt below them; clipped, it leaves a hard band
            .scrollClipDisabled()
            .padding(.horizontal, -20)
            .padding(.vertical, -10)
        }
    }

    private func survivalEmoji(_ id: String) -> String {
        switch id {
        case "survival-restaurant": return "🍜"
        case "survival-shopping": return "🛍️"
        case "survival-directions": return "🗺️"
        case "survival-hotel": return "🏨"
        case "survival-health": return "💊"
        default: return "✈️"
        }
    }
}

struct StatChip: View {
    var icon: HI
    var value: String
    var color: Color
    var filled = false

    var body: some View {
        HStack(spacing: 5) {
            HugeIcon(icon, size: 18, filled: filled).foregroundStyle(color)
            Text(value).foregroundStyle(KG.ink).contentTransition(.numericText())
        }
        .kgFont(16, .bold)
        .monospacedDigit()
        .padding(.horizontal, 12)
        .frame(height: 38)
        .background(Capsule().fill(.white))
        .shadow(color: KG.ink.opacity(0.06), radius: 8, y: 4)
    }
}

struct SectionTitle: View {
    var title: String
    var jp: String?

    init(_ title: String, jp: String? = nil) {
        self.title = title
        self.jp = jp
    }

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            Text(title).kgFont(21, .bold).foregroundStyle(KG.ink)
            if let jp { Text(jp).font(.system(size: 13, weight: .semibold)).foregroundStyle(KG.pinkText) }
            Spacer()
        }
    }
}
