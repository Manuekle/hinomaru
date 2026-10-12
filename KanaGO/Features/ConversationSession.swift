import SwiftUI

struct ConversationSession: View {
    @Environment(AppModel.self) private var app
    var scenario: Scenario

    private struct Bubble: Identifiable {
        let id = UUID()
        let line: DialogueLine
        let fromUser: Bool
        var correct: Bool? = nil
    }

    private enum Phase { case npc, choice, feedback, done }

    @State private var turn = 0
    @State private var bubbles: [Bubble] = []
    @State private var phase: Phase = .npc
    @State private var picked: DialogueChoice?
    @State private var shuffled: [DialogueChoice] = []
    @State private var score = 0
    @State private var answered = 0
    @State private var revealed: Set<UUID> = []

    var body: some View {
        ZStack {
            KGBackground(tint: KG.pinkSoft.opacity(0.5))
            if phase == .done {
                ResultView(correct: score, total: answered, xp: score * 5 + 10, title: scenario.title(app.lang))
            } else {
                VStack(spacing: 0) {
                    SessionTopBar(progress: Double(turn) / Double(max(scenario.turns.count, 1)))
                    ScrollViewReader { proxy in
                        ScrollView {
                            VStack(spacing: 14) {
                                VStack(spacing: 6) {
                                    Text(scenario.icon).font(.system(size: 44))
                                    Text(scenario.title(app.lang)).kgFont(22, .bold).foregroundStyle(KG.ink)
                                    Text(scenario.contextEs).kgText(14).foregroundStyle(KG.inkSoft)
                                        .multilineTextAlignment(.center)
                                }
                                .padding(.vertical, 12)

                                ForEach(bubbles) { b in
                                    bubble(b).id(b.id)
                                        .transition(.asymmetric(insertion: .scale(scale: 0.8, anchor: b.fromUser ? .bottomTrailing : .bottomLeading)
                                            .combined(with: .opacity), removal: .opacity))
                                }
                                Color.clear.frame(height: 1).id("bottom")
                            }
                            .padding(.horizontal, 16)
                            .padding(.bottom, 16)
                        }
                        .onChange(of: bubbles.count) {
                            withAnimation(.easeOut(duration: 0.3)) { proxy.scrollTo("bottom", anchor: .bottom) }
                        }
                        .onChange(of: phase) {
                            withAnimation(.easeOut(duration: 0.3)) { proxy.scrollTo("bottom", anchor: .bottom) }
                        }
                    }
                    controls
                }
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: bubbles.count)
        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: phase)
        .onAppear { if bubbles.isEmpty { enterTurn() } }
    }

    // MARK: Flow

    private func enterTurn() {
        guard turn < scenario.turns.count else { finish(); return }
        switch scenario.turns[turn] {
        case .npc(let line):
            say(line)
            phase = .npc
        case .choice(let prompt, let choices, _):
            say(prompt)
            shuffled = choices.shuffled()
            phase = .choice
        }
    }

    private func say(_ line: DialogueLine) {
        bubbles.append(Bubble(line: line, fromUser: false))
        Speaker.shared.speak(line.jp, rate: app.p.speechRate)
    }

    private func choose(_ c: DialogueChoice) {
        picked = c
        answered += 1
        if c.correct { score += 1 }
        bubbles.append(Bubble(line: DialogueLine(jp: c.jp, romaji: c.romaji, translation: c.translation),
                              fromUser: true, correct: c.correct))
        SoundPlayer.shared.play(c.correct ? .correct : .wrong)
        phase = .feedback
    }

    @State private var followUpPending = false

    private func continueTapped() {
        switch phase {
        case .feedback:
            let current = scenario.turns[turn]
            let wasCorrect = picked?.correct == true
            picked = nil
            turn += 1
            if wasCorrect, case .choice(_, _, let followUp?) = current {
                // show the NPC's reaction first; next tap enters the following turn
                say(followUp)
                followUpPending = true
                phase = .npc
            } else {
                enterTurn()
            }
        case .npc:
            if followUpPending {
                followUpPending = false
            } else {
                turn += 1
            }
            enterTurn()
        default:
            break
        }
    }

    private func finish() {
        let pct = answered == 0 ? 100 : Int(Double(score) / Double(answered) * 100)
        app.p.finishedScenarios[scenario.id] = max(app.p.finishedScenarios[scenario.id] ?? 0, pct)
        app.addXP(score * 5 + 10)
        SoundPlayer.shared.play(.finish)
        phase = .done
    }

    // MARK: Views

    private func bubble(_ b: Bubble) -> some View {
        let show = revealed.contains(b.id)
        return HStack(alignment: .bottom, spacing: 8) {
            if b.fromUser { Spacer(minLength: 50) } else {
                KanaBlob(mood: .curious, size: 36, animated: false)
            }
            VStack(alignment: b.fromUser ? .trailing : .leading, spacing: 4) {
                Text(b.line.jp)
                    .font(.system(size: 19, weight: .semibold, design: .rounded))
                if app.p.showRomaji {
                    Text(b.line.romaji).kgText(13, .medium).opacity(0.75)
                }
                if show {
                    Text(b.line.translation).kgText(13).opacity(0.75)
                }
            }
            .foregroundStyle(b.fromUser ? .white : KG.ink)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(
                UnevenRoundedRectangle(topLeadingRadius: 22, bottomLeadingRadius: b.fromUser ? 22 : 6,
                                       bottomTrailingRadius: b.fromUser ? 6 : 22, topTrailingRadius: 22,
                                       style: .continuous)
                    .fill(b.fromUser ? (b.correct == false ? KG.red : KG.pink) : .white)
            )
            .shadow(color: KG.ink.opacity(0.06), radius: 8, y: 4)
            .onTapGesture {
                if show { revealed.remove(b.id) } else { revealed.insert(b.id) }
            }
            if !b.fromUser {
                Button { Speaker.shared.speak(b.line.jp, rate: app.p.speechRate) } label: {
                    HugeIcon(.volume, size: 17).foregroundStyle(KG.pinkDeep)
                        .frame(width: 32, height: 32).background(Circle().fill(.white))
                }
                Spacer(minLength: 20)
            }
        }
    }

    @ViewBuilder
    private var controls: some View {
        VStack(spacing: 10) {
            switch phase {
            case .choice:
                Text(app.t("¿Qué respondes?", "What do you say?"))
                    .kgFont(14, .bold).foregroundStyle(KG.muted)
                    .frame(maxWidth: .infinity, alignment: .leading)
                ForEach(shuffled, id: \.jp) { c in
                    Button { choose(c) } label: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(c.jp).font(.system(size: 17, weight: .semibold, design: .rounded))
                            if app.p.showRomaji {
                                Text(c.romaji).kgText(12, .medium).foregroundStyle(KG.muted)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 16)
                    }
                    .buttonStyle(ChunkyButtonStyle(fill: .white, lip: KG.line, foreground: KG.ink, radius: 18,
                                                   height: app.p.showRomaji ? 64 : 52))
                }
            case .feedback:
                if let picked {
                    HStack(alignment: .top, spacing: 10) {
                        KanaBlob(mood: picked.correct ? .happy : .meh, size: 52, animated: false)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(picked.correct ? "¡Sugoi!" : app.t("Hmm, no del todo", "Hmm, not quite"))
                                .kgFont(18, .bold)
                                .foregroundStyle(picked.correct ? KG.mintDeep : KG.redDeep)
                            Text(picked.feedbackEs).kgText(14).foregroundStyle(KG.inkSoft)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        Spacer(minLength: 0)
                    }
                    Button(app.t("Continuar", "Continue")) { continueTapped() }
                        .buttonStyle(picked.correct ? .chunkyMint : .chunkyRed)
                }
            case .npc:
                Button(turn + 1 >= scenario.turns.count && !followUpPending
                       ? app.t("Terminar", "Finish") : app.t("Continuar", "Continue")) { continueTapped() }
                    .buttonStyle(.chunky)
            case .done:
                EmptyView()
            }
        }
        .padding(16)
        .padding(.bottom, 8)
        .background(.white.opacity(0.92))
        .clipShape(UnevenRoundedRectangle(topLeadingRadius: 28, topTrailingRadius: 28, style: .continuous))
        .shadow(color: KG.ink.opacity(0.08), radius: 16, y: -4)
        .ignoresSafeArea(edges: .bottom)
    }
}
