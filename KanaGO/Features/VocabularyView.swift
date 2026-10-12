import SwiftUI

/// "My vocabulary": words saved from stories, songs and the word of the day, reviewed with SRS.
struct VocabularyView: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router
    @State private var query = ""

    private var words: [SavedWord] {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        guard !q.isEmpty else { return app.p.savedWords }
        return app.p.savedWords.filter {
            $0.jp.contains(q) || $0.kana.contains(q) || $0.romaji.lowercased().contains(q)
                || $0.meaning(app.lang).lowercased().contains(q)
        }
    }

    var body: some View { page.readableWidth() }

    @ViewBuilder private var page: some View {
        ZStack(alignment: .bottom) {
            KGBackground()
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("単語帳").kgFont(15, .semibold).foregroundStyle(KG.pinkText)
                        Text(app.t("Mi vocabulario", "My vocabulary")).kgFont(30, .bold).foregroundStyle(KG.ink)
                    }
                    if app.p.savedWords.isEmpty {
                        emptyState
                    } else {
                        searchField
                        ForEach(words) { w in row(w) }
                        if words.isEmpty {
                            Text(app.t("Nada coincide con “\(query)”.", "Nothing matches “\(query)”."))
                                .kgText(15).foregroundStyle(KG.muted)
                                .frame(maxWidth: .infinity)
                                .padding(.top, 20)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, app.p.savedWords.isEmpty ? 30 : 120)
            }
            .scrollDismissesKeyboard(.immediately)

            if !app.p.savedWords.isEmpty {
                let due = app.savedDueCount
                Button { router.session = .saved } label: {
                    Label(due > 0 ? app.t("Repasar pendientes (\(due))", "Review due words (\(due))")
                                  : app.t("Practicar mis palabras", "Practice my words"),
                          hi: .flashcards)
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
        .toolbar(.hidden, for: .tabBar) // the floating review button takes its place
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: app.p.savedWords)
    }

    private var emptyState: some View {
        VStack(spacing: 14) {
            KanaBlob(mood: .curious, size: 110)
            Text(app.t("Aún no guardas palabras", "No saved words yet"))
                .kgFont(22, .bold).foregroundStyle(KG.ink)
            Text(app.t("Toca el marcador en la palabra del día, en el vocabulario de las historias o en las palabras clave de las canciones.",
                       "Tap the bookmark on the word of the day, in story vocabulary or on song key words."))
                .kgText(15).foregroundStyle(KG.inkSoft)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .sticker(radius: 26)
        .padding(.top, 10)
    }

    private var searchField: some View {
        HStack(spacing: 10) {
            HugeIcon(.search, size: 18).foregroundStyle(KG.muted)
            TextField(app.t("Buscar en tu vocabulario", "Search your vocabulary"), text: $query)
                .kgFont(16, .medium)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
        }
        .padding(14)
        .sticker(radius: 18)
    }

    private func row(_ w: SavedWord) -> some View {
        let state = app.state("\(AppModel.savedDeckId)#\(w.jp)")
        return HStack(spacing: 12) {
            Circle()
                .fill(state?.isLearned == true ? KG.mint : (state?.lastReviewed != nil ? KG.sun : KG.line))
                .frame(width: 10, height: 10)
            VStack(alignment: .leading, spacing: 3) {
                Text(w.jp).font(.system(size: 22, weight: .semibold, design: .rounded)).foregroundStyle(KG.ink)
                if w.kana != w.jp { Text(w.kana).kgText(13, .medium).foregroundStyle(KG.muted) }
                if app.p.showRomaji { Text(w.romaji).kgText(13, .medium).foregroundStyle(KG.pinkText) }
                Text(w.meaning(app.lang)).kgText(14).foregroundStyle(KG.inkSoft)
                Text(w.source).kgFont(11, .semibold).foregroundStyle(KG.muted).lineLimit(1)
            }
            Spacer(minLength: 0)
            SpeakButton(text: w.kana, size: 36)
            Button { app.removeSaved(w.jp) } label: {
                HugeIcon(.trash, size: 18)
                    .foregroundStyle(KG.muted)
                    .frame(width: 36, height: 36)
                    .background(Circle().fill(KG.cream))
            }
            .buttonStyle(.squish)
            .accessibilityLabel(app.t("Quitar", "Remove"))
        }
        .padding(14)
        .sticker(radius: 20)
        .transition(.opacity.combined(with: .scale(scale: 0.95)))
    }
}

/// Bookmark toggle that adds a word to "My vocabulary".
struct SaveWordButton: View {
    @Environment(AppModel.self) private var app
    var word: SavedWord
    var size: CGFloat = 34
    var dark = false

    var body: some View {
        let saved = app.isSaved(word.jp)
        Button { app.toggleSaved(word) } label: {
            HugeIcon(.bookmark, size: size * 0.5, filled: saved)
                .foregroundStyle(saved ? .white : (dark ? .white : KG.pinkDeep))
                .frame(width: size, height: size)
                .background(Circle().fill(saved ? KG.pink : (dark ? .white.opacity(0.15) : KG.pinkSoft)))
        }
        .buttonStyle(.squish)
        .sensoryFeedback(.success, trigger: saved)
        .accessibilityLabel(saved ? app.t("Quitar de mi vocabulario", "Remove from my vocabulary")
                                  : app.t("Guardar en mi vocabulario", "Save to my vocabulary"))
    }
}
