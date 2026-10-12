import SwiftUI

struct TalkView: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router
    @Namespace private var ns

    private let levels = ["N5", "N4", "N3", "N2", "N1"]

    var body: some View {
        @Bindable var router = router
        NavigationStack {
            ZStack {
                KGBackground()
                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(headline.0).kgFont(17, .semibold).foregroundStyle(KG.pinkText)
                            Text(headline.1).kgFont(30, .bold).foregroundStyle(KG.ink)
                        }
                        .padding(.top, 8)

                        segmentPicker

                        MascotSays(mood: mascot.0, text: mascot.1, size: 70)

                        ForEach(levels, id: \.self) { level in
                            levelSection(level)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
            }
            .toolbar(.hidden, for: .navigationBar)
            .animation(.spring(response: 0.35, dampingFraction: 0.85), value: router.explore)
        }
    }

    private var headline: (String, String) {
        switch router.explore {
        case .talk: return (app.t("Habla como en", "Talk like you're in"), app.t("el Tokio real", "real Tokyo"))
        case .read: return (app.t("Lee historias", "Read stories"), app.t("a tu nivel", "at your level"))
        case .sing: return (app.t("Aprende japonés", "Learn Japanese"), app.t("cantando", "by singing"))
        }
    }

    private var mascot: (Mood, String) {
        switch router.explore {
        case .talk:
            return (.love, app.t("Elige qué responder en cada situación. ¡Yo hago de japonés!",
                                 "Pick what to say in each situation. I'll play the local!"))
        case .read:
            return (.curious, app.t("Lee, toca un párrafo para traducirlo y luego haz el quiz.",
                                    "Read, tap a paragraph to translate it, then take the quiz."))
        case .sing:
            return (.wow, app.t("Sigue la letra mientras se ilumina, o activa el modo Karaoke: ¡te escucho cantar y te pongo nota!",
                                "Follow the lyrics as they light up, or switch to Karaoke: I'll listen to you sing and score you!"))
        }
    }

    private var segmentPicker: some View {
        HStack(spacing: 4) {
            ForEach(ExploreSegment.allCases) { seg in
                let on = router.explore == seg
                Button {
                    router.explore = seg
                } label: {
                    VStack(spacing: 0) {
                        Text(seg == .talk ? "話す" : seg == .read ? "読む" : "歌う").kgFont(16, .bold)
                        Text(seg == .talk ? app.t("Hablar", "Talk") : seg == .read ? app.t("Leer", "Read") : app.t("Cantar", "Sing"))
                            .kgFont(11, .semibold).opacity(on ? 1 : 0.7)
                    }
                    .foregroundStyle(on ? .white : KG.inkSoft)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background {
                        if on {
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .fill(seg == .sing ? KG.ink : KG.pink)
                                .matchedGeometryEffect(id: "seg", in: ns)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(5)
        .sticker(radius: 23)
        .sensoryFeedback(.selection, trigger: router.explore)
    }

    @ViewBuilder
    private func levelSection(_ level: String) -> some View {
        switch router.explore {
        case .talk:
            let items = app.content.scenarios.filter { $0.level == level }
            if !items.isEmpty {
                SectionTitle(level)
                ForEach(items) { s in
                    Button { router.session = .conversation(id: s.id) } label: {
                        ScenarioRow(scenario: s, best: app.p.finishedScenarios[s.id])
                    }
                    .buttonStyle(.squish)
                }
            }
        case .read:
            let items = app.content.stories.filter { $0.level == level }
            if !items.isEmpty {
                SectionTitle(level)
                ForEach(items) { s in
                    Button { router.session = .story(id: s.id) } label: { StoryRow(story: s) }
                        .buttonStyle(.squish)
                }
            }
        case .sing:
            let items = app.content.songs.filter { $0.level == level }
            if !items.isEmpty {
                SectionTitle(level)
                ForEach(items) { s in
                    Button { router.session = .song(id: s.id) } label: { SongRow(song: s) }
                        .buttonStyle(.squish)
                }
            }
        }
    }
}

struct ScenarioRow: View {
    @Environment(AppModel.self) private var app
    var scenario: Scenario
    var best: Int?

    var body: some View {
        HStack(spacing: 14) {
            Text(scenario.icon)
                .font(.system(size: 32))
                .frame(width: 58, height: 58)
                .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(KG.levelColor(scenario.level).opacity(0.15)))
            VStack(alignment: .leading, spacing: 4) {
                Text(scenario.title(app.lang)).kgFont(17, .bold).foregroundStyle(KG.ink)
                Text(scenario.contextEs)
                    .kgText(13).foregroundStyle(KG.muted)
                    .lineLimit(2).multilineTextAlignment(.leading)
            }
            Spacer(minLength: 0)
            if let best {
                VStack(spacing: 0) {
                    HugeIcon(.star, size: 20, filled: best >= 70)
                        .foregroundStyle(best >= 70 ? KG.sun : KG.line)
                    Text("\(best)%").kgFont(11, .bold).foregroundStyle(KG.muted)
                }
            }
        }
        .padding(14)
        .sticker(radius: 24)
    }
}

// MARK: - Profile

struct ProfileView: View {
    @Environment(AppModel.self) private var app
    @State private var confirmReset = false
    @State private var notificationsDenied = false

    private var learnedWords: Int { app.p.srs.values.filter(\.isLearned).count }
    private var kanaMastered: Int { app.p.kanaSeen.values.filter { $0 >= 3 }.count }

    var body: some View {
        @Bindable var app = app
        NavigationStack {
            ZStack {
                KGBackground()
                ScrollView {
                    VStack(spacing: 20) {
                        VStack(spacing: 10) {
                            KanaBlob(mood: app.p.streak > 2 ? .love : .happy, size: 120)
                            TextField(app.t("Tu nombre", "Your name"), text: $app.p.name)
                                .kgFont(28, .bold)
                                .multilineTextAlignment(.center)
                                .foregroundStyle(KG.ink)
                            Text(app.t("Nivel \(app.p.xp / 250 + 1) · \(app.p.xp) XP", "Level \(app.p.xp / 250 + 1) · \(app.p.xp) XP"))
                                .kgFont(15, .semibold).foregroundStyle(KG.pinkText)
                        }
                        .padding(.top, 16)

                        LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible())], spacing: 12) {
                            stat(.fire, "\(app.p.streak)", app.t("días de racha", "day streak"),
                                 app.p.streak > 0 ? KG.flame : KG.off, filled: true)
                            stat(.star, "\(app.p.xp)", app.t("XP total", "total XP"), KG.sun, filled: true)
                            stat(.cards, "\(learnedWords)", app.t("tarjetas dominadas", "cards mastered"), KG.mint)
                            stat(.kana, "\(kanaMastered)", app.t("kana dominados", "kana mastered"), KG.pink)
                        }

                        NavigationLink { VocabularyView() } label: { vocabularyRow }
                            .buttonStyle(.squish)

                        VStack(spacing: 0) {
                            settingRow(app.t("Idioma", "Language"), icon: .translate) {
                                Picker("", selection: $app.p.lang) {
                                    ForEach(Lang.allCases) { Text($0.label).tag($0) }
                                }
                                .tint(KG.pinkText) // picker value is regular-weight text
                            }
                            Divider().padding(.leading, 52)
                            settingRow(app.t("Mostrar romaji", "Show romaji"), icon: .textFont) {
                                Toggle("", isOn: $app.p.showRomaji).tint(KG.pink)
                            }
                            Divider().padding(.leading, 52)
                            settingRow(app.t("Efectos de sonido", "Sound effects"), icon: .volume) {
                                Toggle("", isOn: $app.p.sound).tint(KG.pink)
                            }
                            Divider().padding(.leading, 52)
                            settingRow(app.t("Recordatorio diario", "Daily reminder"), icon: .bell) {
                                Toggle("", isOn: Binding(get: { app.p.reminderOn }, set: setReminder)).tint(KG.pink)
                            }
                            if app.p.reminderOn {
                                settingRow(app.t("Hora", "Time"), icon: .timer) {
                                    Picker("", selection: $app.p.reminderHour) {
                                        ForEach(6..<24, id: \.self) { Text(String(format: "%02d:00", $0)).tag($0) }
                                    }
                                    .tint(KG.pinkText) // picker value is regular-weight text
                                }
                            }
                            Divider().padding(.leading, 52)
                            settingRow(app.t("Meta diaria", "Daily goal"), icon: .target) {
                                Picker("", selection: $app.p.dailyGoal) {
                                    ForEach([20, 50, 100, 200], id: \.self) { Text("\($0) XP").tag($0) }
                                }
                                .tint(KG.pinkText) // picker value is regular-weight text
                            }
                            Divider().padding(.leading, 52)
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    settingIcon(.turtle)
                                    Text(app.t("Velocidad de voz", "Voice speed")).kgFont(16, .semibold).foregroundStyle(KG.ink)
                                    Spacer()
                                    SpeakButton(text: "こんにちは、カナです！", size: 34)
                                }
                                Slider(value: $app.p.speechRate, in: 0.25...0.6).tint(KG.pink)
                                    .padding(.leading, 52)
                                Picker("", selection: $app.p.voice) {
                                    ForEach(VoiceStyle.allCases) { Text($0.label).tag($0) }
                                }
                                .pickerStyle(.segmented)
                                .padding(.leading, 52)
                            }
                            .padding(14)
                        }
                        .sticker(radius: 24)

                        Button(role: .destructive) { confirmReset = true } label: {
                            Text(app.t("Reiniciar progreso", "Reset progress"))
                                .kgFont(15, .semibold)
                                .foregroundStyle(KG.red)
                        }
                        .confirmationDialog(app.t("¿Borrar todo tu progreso?", "Erase all your progress?"),
                                            isPresented: $confirmReset, titleVisibility: .visible) {
                            Button(app.t("Borrar progreso", "Erase progress"), role: .destructive) { app.resetProgress() }
                        }

                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 30)
                }
                .scrollDismissesKeyboard(.immediately)
            }
            .toolbar(.hidden, for: .navigationBar)
            .onChange(of: app.p.reminderHour) { rescheduleReminder() }
            .onChange(of: app.p.lang) { rescheduleReminder() }
            .alert(app.t("Notificaciones desactivadas", "Notifications are off"), isPresented: $notificationsDenied) {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    Link(app.t("Abrir Ajustes", "Open Settings"), destination: url)
                }
                Button(app.t("Ahora no", "Not now"), role: .cancel) {}
            } message: {
                Text(app.t("Permite las notificaciones de KanaGO! en Ajustes para recibir tu recordatorio.",
                           "Allow KanaGO! notifications in Settings to get your reminder."))
            }
        }
    }

    private var vocabularyRow: some View {
        let due = app.savedDueCount
        return HStack(spacing: 14) {
            HugeIcon(.bookmark, size: 24, filled: true)
                .foregroundStyle(.white)
                .frame(width: 52, height: 52)
                .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(KG.pink))
            VStack(alignment: .leading, spacing: 3) {
                Text(app.t("Mi vocabulario", "My vocabulary")).kgFont(17, .bold).foregroundStyle(KG.ink)
                Text(app.p.savedWords.isEmpty
                     ? app.t("Guarda palabras para repasarlas", "Save words to review them")
                     : app.p.savedWords.count == 1 ? app.t("1 palabra guardada", "1 saved word")
                     : app.t("\(app.p.savedWords.count) palabras guardadas", "\(app.p.savedWords.count) saved words"))
                    .kgText(13).foregroundStyle(KG.muted)
            }
            Spacer(minLength: 0)
            if due > 0 { Pill(text: "\(due)", color: KG.flame) }
            HugeIcon(.chevronRight, size: 18).foregroundStyle(KG.line)
        }
        .padding(14)
        .sticker(radius: 24)
    }

    private func setReminder(_ on: Bool) {
        guard on else {
            app.p.reminderOn = false
            Reminders.cancel()
            return
        }
        Task {
            if await Reminders.authorize() {
                app.p.reminderOn = true
                Reminders.schedule(hour: app.p.reminderHour, lang: app.lang)
            } else {
                app.p.reminderOn = false
                notificationsDenied = true
            }
        }
    }

    private func rescheduleReminder() {
        if app.p.reminderOn { Reminders.schedule(hour: app.p.reminderHour, lang: app.lang) }
    }

    private func stat(_ icon: HI, _ value: String, _ label: String, _ color: Color, filled: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HugeIcon(icon, size: 24, filled: filled).foregroundStyle(color).frame(height: 26)
            Text(value).kgFont(26, .bold).foregroundStyle(KG.ink).contentTransition(.numericText())
            Text(label).kgFont(13, .semibold).foregroundStyle(KG.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .sticker(radius: 22)
    }

    private func settingIcon(_ icon: HI) -> some View {
        HugeIcon(icon, size: 18)
            .foregroundStyle(.white)
            .frame(width: 34, height: 34)
            .background(RoundedRectangle(cornerRadius: 10, style: .continuous).fill(KG.pink))
            .padding(.trailing, 4)
    }

    private func settingRow<Content: View>(_ title: String, icon: HI, @ViewBuilder trailing: () -> Content) -> some View {
        HStack {
            settingIcon(icon)
            Text(title).kgFont(16, .semibold).foregroundStyle(KG.ink)
            Spacer()
            trailing().labelsHidden()
        }
        .padding(14)
    }
}
