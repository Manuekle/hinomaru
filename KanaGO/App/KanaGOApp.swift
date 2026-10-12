import SwiftUI

@main
struct KanaGOApp: App {
    @State private var app = AppModel()
    @State private var router = Router()
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            LaunchGate(onFinished: {
                Speaker.shared.prepare()
                Task.detached(priority: .utility) { StrokeLibrary.warmUp() }
                Task(priority: .utility) { @MainActor in
                    await SoundPlayer.shared.preload()
                    app.syncWidgets()
                }
            }) { RootView() }
                .environment(app)
                .environment(router)
                .preferredColorScheme(.light)
                .tint(KG.pink)
                .onOpenURL { open($0) }
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .background { app.syncWidgets() }
        }
    }

    /// Links from the widgets: kanago://review, kanago://word, kanago://home.
    private func open(_ url: URL) {
        guard url.scheme == "kanago", app.p.onboarded else { return }
        router.tab = .home
        if url.host == "review", app.dueCount > 0, router.session == nil {
            router.session = .review
        }
    }
}

/// What a full-screen study session is about.
enum Session: Identifiable, Hashable {
    case flashcards(deckId: String)
    case review
    case kanaQuiz(script: Script, groupIds: [String])
    case conversation(id: String)
    case mode(deckId: String, mode: StudyMode)
    case lesson(id: String)
    case song(id: String)
    case story(id: String)
    case saved
    case jlpt(level: String, kind: JLPTKind)

    var id: String {
        switch self {
        case .flashcards(let d): return "fc-\(d)"
        case .review: return "review"
        case .kanaQuiz(let s, let g): return "kq-\(s.rawValue)-\(g.joined(separator: ","))"
        case .conversation(let id): return "cv-\(id)"
        case .mode(let d, let m): return "md-\(d)-\(m.rawValue)"
        case .lesson(let id): return "ls-\(id)"
        case .song(let id): return "sg-\(id)"
        case .story(let id): return "st-\(id)"
        case .saved: return "saved"
        case .jlpt(let l, let k): return "jl-\(l)-\(k.rawValue)"
        }
    }
}

enum AppTab: Hashable {
    case home, kana, learn, talk, me
}

@Observable
final class Router {
    var tab: AppTab = .home
    var session: Session?
    var learnPath: [String] = []   // deck ids
    var learnMode: LearnMode = .path
    var explore: ExploreSegment = .talk
}

enum LearnMode: Hashable, CaseIterable {
    case path, decks, jlpt
}

enum ExploreSegment: String, CaseIterable, Identifiable {
    case talk, read, sing
    var id: String { rawValue }
}

struct RootView: View {
    @Environment(AppModel.self) private var app
    @Environment(Router.self) private var router

    var body: some View {
        @Bindable var router = router
        Group {
            if app.p.onboarded {
                TabView(selection: $router.tab) {
                    HomeView()
                        .tabItem { Label(app.t("Inicio", "Home"), tab: .home, selected: router.tab == .home) }
                        .tag(AppTab.home)
                    KanaView()
                        .tabItem { Label("Kana", tab: .brush, selected: router.tab == .kana) }
                        .tag(AppTab.kana)
                    LearnView()
                        .tabItem { Label(app.t("Aprender", "Learn"), tab: .library, selected: router.tab == .learn) }
                        .tag(AppTab.learn)
                    TalkView()
                        .tabItem { Label(app.t("Explorar", "Explore"), tab: .globe, selected: router.tab == .talk) }
                        .tag(AppTab.talk)
                    ProfileView()
                        .tabItem { Label(app.t("Yo", "Me"), tab: .user, selected: router.tab == .me) }
                        .tag(AppTab.me)
                }
                .transition(.opacity)
            } else {
                OnboardingView()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.35), value: app.p.onboarded)
        .fullScreenCover(item: $router.session) { session in
            SessionHost(session: session)
        }
    }
}

/// Shared page background with soft floating kana.
struct KGBackground: View {
    var tint: Color = KG.cream

    var body: some View {
        ZStack {
            tint.ignoresSafeArea()
            GeometryReader { geo in
                let glyphs = ["あ", "カ", "の", "ア", "さ", "ン"]
                ForEach(Array(glyphs.enumerated()), id: \.offset) { i, g in
                    Text(g)
                        .kgFont(120, .bold)
                        .foregroundStyle(KG.ink.opacity(0.025))
                        .rotationEffect(.degrees(Double(i * 23 % 40) - 20))
                        .position(
                            x: geo.size.width * [0.12, 0.85, 0.2, 0.9, 0.5, 0.1][i],
                            y: geo.size.height * [0.08, 0.22, 0.45, 0.6, 0.8, 0.95][i]
                        )
                }
            }
            .ignoresSafeArea()
            .allowsHitTesting(false)
        }
    }
}
