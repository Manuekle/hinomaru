import SwiftUI

struct OnboardingView: View {
    @Environment(AppModel.self) private var app
    @State private var step = 0
    @State private var name = ""
    @State private var goal = 50
    @State private var reminderHour = 19
    @State private var finishing = false
    @FocusState private var nameFocused: Bool

    private static let lastStep = 4

    private struct Goal {
        let xp: Int
        let es: String, en: String
        let minutesEs: String, minutesEn: String
        let mood: Mood
    }

    private let goals: [Goal] = [
        Goal(xp: 20, es: "Relajado", en: "Casual", minutesEs: "5 min al día", minutesEn: "5 min a day", mood: .meh),
        Goal(xp: 50, es: "Normal", en: "Regular", minutesEs: "10 min al día", minutesEn: "10 min a day", mood: .happy),
        Goal(xp: 100, es: "Serio", en: "Serious", minutesEs: "20 min al día", minutesEn: "20 min a day", mood: .wow),
        Goal(xp: 200, es: "Intenso", en: "Intense", minutesEs: "30 min o más", minutesEn: "30+ min a day", mood: .angry),
    ]

    private let hours: [(hour: Int, es: String, en: String, icon: HI)] = [
        (8, "Mañana", "Morning", .sun),
        (13, "Mediodía", "Midday", .sparkle),
        (19, "Tarde", "Evening", .star),
        (21, "Noche", "Night", .bell),
    ]

    var body: some View {
        ZStack {
            if step == 0 {
                welcome.transition(.opacity)
            } else {
                questions.transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: step == 0)
    }

    // MARK: - Welcome

    private var welcome: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 8)
            ZStack {
                FloatingKana(glyph: "あ", angle: -10, delay: 0).offset(x: -128, y: -70)
                FloatingKana(glyph: "カ", angle: 8, delay: 0.4).offset(x: 130, y: -92)
                FloatingKana(glyph: "の", angle: 12, delay: 0.8).offset(x: -112, y: 78)
                FloatingKana(glyph: "ん", angle: -6, delay: 1.2).offset(x: 122, y: 70)
                KanaBlob(mood: .love, size: 150)
            }
            .frame(height: 250)

            KanaGOLogo(size: 64)
                .padding(.top, 6)

            VStack(spacing: 10) {
                Text(app.t("Japonés de la あ al N1,\na tu ritmo.", "Japanese from あ to N1,\nat your pace."))
                    .kgFont(26, .bold)
                    .foregroundStyle(.white)
                Text(app.t("Lecciones cortas, repaso inteligente\ny Kana-chan contigo en cada paso.",
                           "Bite-sized lessons, smart review\nand Kana-chan with you every step."))
                    .kgText(16)
                    .foregroundStyle(.white)
            }
            .multilineTextAlignment(.center)
            .padding(.top, 26)

            Spacer(minLength: 16)

            Button(app.t("Empezar", "Get started"), action: next)
                .buttonStyle(ChunkyButtonStyle(fill: .white, lip: .black.opacity(0.18), foreground: KG.pinkDeep))
            Text(app.t("Sin cuenta · funciona sin internet", "No account · works offline"))
                .kgText(13, .medium)
                .foregroundStyle(.white.opacity(0.8))
                .padding(.top, 10)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 8)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background {
            // decoration only: kept in the background so it never widens the layout
            LinearGradient(colors: [KG.pink, KG.pinkDeep], startPoint: .top, endPoint: .bottom)
                .overlay {
                    RadialGradient(colors: [.white.opacity(0.28), .clear], center: .topTrailing, startRadius: 0, endRadius: 380)
                }
                .overlay(alignment: .bottomTrailing) {
                    Text("あカ")
                        .font(.system(size: 220, weight: .heavy))
                        .foregroundStyle(.white.opacity(0.07))
                        .fixedSize()
                        .offset(x: 50, y: 30)
                }
                .clipped()
            .ignoresSafeArea()
            .accessibilityHidden(true)
        }
    }

    // MARK: - Questions

    private var questions: some View {
        ZStack {
            KGBackground()
            VStack(spacing: 0) {
                HStack(spacing: 10) {
                    Button { withAnimation(.spring(response: 0.45, dampingFraction: 0.85)) { step -= 1 } } label: {
                        HugeIcon(.chevronLeft, size: 22)
                            .foregroundStyle(KG.ink)
                            .frame(width: 40, height: 40)
                    }
                    .accessibilityLabel(app.t("Atrás", "Back"))
                    ProgressBarKG(value: Double(step) / Double(Self.lastStep), height: 12)
                }
                .padding(.horizontal, 16)
                .padding(.top, 6)

                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        header
                        Group {
                            switch step {
                            case 1: language
                            case 2: nameStep
                            case 3: goalStep
                            default: reminderStep
                            }
                        }
                        .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                                removal: .move(edge: .leading).combined(with: .opacity)))
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 20)
                    .padding(.bottom, 24)
                    .id(step)
                }
                .scrollBounceBehavior(.basedOnSize)
                .scrollDismissesKeyboard(.interactively)

                footer
                    .padding(.horizontal, 24)
                    .padding(.bottom, 8)
            }
        }
        .animation(.spring(response: 0.45, dampingFraction: 0.85), value: step)
    }

    private var header: some View {
        let (mood, title, subtitle): (Mood, String, String?) = {
            switch step {
            case 1: return (.curious, app.t("¿En qué idioma te explico?", "Which language should I use?"),
                            app.lang == .es ? "Which language should I use?" : "¿En qué idioma te explico?")
            case 2: return (.happy, app.t("¡Hola! Soy Kana-chan.\n¿Cómo te llamas?", "Hi! I'm Kana-chan.\nWhat's your name?"), nil)
            case 3: return (goals.first { $0.xp == goal }?.mood ?? .happy,
                            app.t("¿Cuánto quieres practicar cada día?", "How much do you want to practice each day?"),
                            app.t("Puedes cambiarlo cuando quieras.", "You can change it anytime."))
            default: return (.love, app.t("¿Te recuerdo practicar?", "Want a daily reminder?"),
                             app.t("Un aviso al día ayuda a no romper la racha.", "One nudge a day keeps your streak alive."))
            }
        }()
        return VStack(alignment: .leading, spacing: 14) {
            KanaBlob(mood: mood, size: 76)
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .kgFont(28, .bold)
                    .foregroundStyle(KG.ink)
                    .fixedSize(horizontal: false, vertical: true)
                if let subtitle {
                    Text(subtitle).kgText(16).foregroundStyle(KG.muted)
                }
            }
        }
    }

    private var language: some View {
        VStack(spacing: 12) {
            ForEach(Lang.allCases) { l in
                option(selected: app.p.lang == l, action: { app.p.lang = l }) {
                    Text(l == .es ? "🇪🇸" : "🇬🇧")
                        .font(.system(size: 26))
                        .frame(width: 44, height: 44)
                        .background(Circle().fill(KG.cream))
                } title: {
                    Text(l.label)
                } detail: {
                    Text(l == .es ? "Explicaciones en español" : "Explanations in English")
                }
            }
        }
        .sensoryFeedback(.selection, trigger: app.p.lang)
    }

    private var nameStep: some View {
        VStack(alignment: .leading, spacing: 12) {
            TextField(app.t("Tu nombre", "Your name"), text: $name)
                .kgFont(22, .semibold)
                .foregroundStyle(KG.ink)
                .textInputAutocapitalization(.words)
                .autocorrectionDisabled()
                .submitLabel(.next)
                .focused($nameFocused)
                .padding(.horizontal, 18)
                .frame(height: 62)
                .sticker(radius: 20, border: nameFocused ? KG.pink : .white, lineWidth: 2.5)
                .onSubmit(next)
            Label(app.t("Solo se guarda en tu iPhone.", "It stays on your iPhone."), hi: .lock, size: 15)
                .kgText(14)
                .foregroundStyle(KG.muted)
        }
        .onAppear { nameFocused = true }
    }

    private var goalStep: some View {
        VStack(spacing: 12) {
            ForEach(goals, id: \.xp) { g in
                option(selected: goal == g.xp, action: { goal = g.xp }) {
                    KanaBlob(mood: g.mood, size: 34, animated: false)
                        .frame(width: 44, height: 44)
                        .background(Circle().fill(goal == g.xp ? KG.pinkSoft : KG.cream))
                } title: {
                    Text(app.t(g.es, g.en))
                } detail: {
                    Text(app.t(g.minutesEs, g.minutesEn) + " · \(g.xp) XP")
                }
            }
        }
        .sensoryFeedback(.selection, trigger: goal)
    }

    private var reminderStep: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible())], spacing: 12) {
            ForEach(hours, id: \.hour) { h in
                let on = reminderHour == h.hour
                Button { reminderHour = h.hour } label: {
                    VStack(alignment: .leading, spacing: 10) {
                        HugeIcon(h.icon, size: 22, filled: on)
                            .foregroundStyle(on ? .white : KG.pink)
                            .frame(width: 40, height: 40)
                            .background(Circle().fill(on ? KG.pink : KG.pinkSoft))
                        VStack(alignment: .leading, spacing: 2) {
                            Text(String(format: "%02d:00", h.hour)).kgFont(20, .bold).foregroundStyle(KG.ink)
                            Text(app.t(h.es, h.en)).kgText(14).foregroundStyle(KG.muted)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .sticker(radius: 22, border: on ? KG.pink : .white, lineWidth: on ? 2.5 : 0)
                }
                .buttonStyle(.squish)
            }
        }
        .sensoryFeedback(.selection, trigger: reminderHour)
    }

    /// Selectable row: leading art, title, detail line and a check when picked.
    private func option<Lead: View, T: View, D: View>(selected: Bool, action: @escaping () -> Void,
                                                      @ViewBuilder lead: () -> Lead,
                                                      @ViewBuilder title: () -> T,
                                                      @ViewBuilder detail: () -> D) -> some View {
        Button(action: action) {
            HStack(spacing: 14) {
                lead()
                VStack(alignment: .leading, spacing: 2) {
                    title().kgFont(18, .semibold).foregroundStyle(KG.ink)
                    detail().kgText(14).foregroundStyle(KG.muted)
                }
                Spacer(minLength: 0)
                HugeIcon(selected ? .checkCircle : .circle, size: 24, filled: true)
                    .foregroundStyle(selected ? KG.pink : KG.line)
            }
            .padding(14)
            .sticker(radius: 22, border: selected ? KG.pink : .white, lineWidth: selected ? 2.5 : 0)
        }
        .buttonStyle(.squish)
    }

    @ViewBuilder
    private var footer: some View {
        if step == Self.lastStep {
            VStack(spacing: 6) {
                Button(app.t("Recordarme a las \(String(format: "%02d:00", reminderHour))",
                             "Remind me at \(String(format: "%02d:00", reminderHour))")) {
                    finish(reminder: true)
                }
                .buttonStyle(.chunky)
                .disabled(finishing)
                Button(app.t("Ahora no", "Not now")) { finish(reminder: false) }
                    .kgFont(16, .semibold)
                    .foregroundStyle(KG.muted)
                    .frame(height: 40)
                    .disabled(finishing)
            }
        } else {
            Button(app.t("Continuar", "Continue"), action: next)
                .buttonStyle(.chunky)
        }
    }

    // MARK: - Flow

    private func next() {
        nameFocused = false
        guard step < Self.lastStep else { return }
        withAnimation(.spring(response: 0.45, dampingFraction: 0.85)) { step += 1 }
    }

    private func finish(reminder: Bool) {
        finishing = true
        app.p.name = name.trimmingCharacters(in: .whitespaces)
        app.p.dailyGoal = goal
        app.p.reminderHour = reminderHour
        Task {
            if reminder, await Reminders.authorize() {
                app.p.reminderOn = true
                Reminders.schedule(hour: reminderHour, lang: app.lang)
            }
            app.p.onboarded = true
        }
    }
}

/// White die-cut kana sticker that floats gently on the welcome screen.
private struct FloatingKana: View {
    var glyph: String
    var angle: Double
    var delay: Double
    @State private var up = false

    var body: some View {
        Text(glyph)
            .font(.system(size: 28, weight: .bold))
            .foregroundStyle(KG.ink)
            .frame(width: 56, height: 56)
            .background(
                RoundedRectangle(cornerRadius: 17, style: .continuous)
                    .fill(.white)
                    .shadow(color: .black.opacity(0.14), radius: 0, x: 0, y: 4)
            )
            .rotationEffect(.degrees(angle))
            .offset(y: up ? -6 : 4)
            .onAppear {
                withAnimation(.easeInOut(duration: 2.2).repeatForever(autoreverses: true).delay(delay)) { up = true }
            }
            .accessibilityHidden(true)
    }
}
